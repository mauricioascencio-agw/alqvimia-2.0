/**
 * Tracking Service - Maneja el proceso Python de tracking
 * Proporciona overlay nativo y detección de elementos UI para Windows
 */

import { spawn } from 'child_process'
import path from 'path'
import { fileURLToPath } from 'url'
import { EventEmitter } from 'events'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

class TrackingService extends EventEmitter {
  constructor() {
    super()
    this.process = null
    this.isRunning = false
    this.isTracking = false
    this.pendingClicks = []
    this.lastElement = null
    this.targetWindowHandle = null
  }

  /**
   * Inicia el proceso de Python
   */
  async start() {
    if (this.process) {
      console.log('[TrackingService] Proceso ya está corriendo')
      return { success: true, message: 'Ya está corriendo' }
    }

    const pythonScript = path.join(__dirname, '..', 'python', 'tracking_service.py')

    return new Promise((resolve, reject) => {
      try {
        // Intentar con python, luego python3, luego py
        const pythonCommands = ['python', 'python3', 'py']
        let pythonCmd = 'python'

        this.process = spawn(pythonCmd, [pythonScript], {
          stdio: ['pipe', 'pipe', 'pipe']
        })

        this.process.stdout.on('data', (data) => {
          const lines = data.toString().split('\n').filter(l => l.trim())
          for (const line of lines) {
            try {
              const msg = JSON.parse(line)
              this._handleMessage(msg)
            } catch (e) {
              console.log('[TrackingService] Output:', line)
            }
          }
        })

        this.process.stderr.on('data', (data) => {
          console.error('[TrackingService] Error:', data.toString())
        })

        this.process.on('close', (code) => {
          console.log(`[TrackingService] Proceso terminó con código ${code}`)
          this.process = null
          this.isRunning = false
          this.isTracking = false
          this.emit('closed', code)
        })

        this.process.on('error', (err) => {
          console.error('[TrackingService] Error spawning process:', err.message)
          this.process = null
          reject(err)
        })

        // Esperar a que esté listo
        const readyTimeout = setTimeout(() => {
          reject(new Error('Timeout esperando que el servicio esté listo'))
        }, 10000)

        this.once('ready', (info) => {
          clearTimeout(readyTimeout)
          this.isRunning = true
          console.log('[TrackingService] Servicio listo:', info)
          resolve({ success: true, ...info })
        })

      } catch (error) {
        reject(error)
      }
    })
  }

  /**
   * Detiene el proceso de Python
   */
  stop() {
    if (this.process) {
      this._sendCommand({ action: 'exit' })
      setTimeout(() => {
        if (this.process) {
          this.process.kill()
          this.process = null
        }
      }, 1000)
    }
    this.isRunning = false
    this.isTracking = false
  }

  /**
   * Inicia el tracking de mouse y overlay
   */
  startTracking(targetWindowHandle = null) {
    if (!this.isRunning) {
      console.log('[TrackingService] Servicio no está corriendo, iniciando...')
      return this.start().then(() => this.startTracking(targetWindowHandle))
    }

    this.targetWindowHandle = targetWindowHandle
    this._sendCommand({
      action: 'start',
      targetHandle: targetWindowHandle
    })
    this.isTracking = true

    return { success: true, message: 'Tracking iniciado' }
  }

  /**
   * Detiene el tracking
   */
  stopTracking() {
    this._sendCommand({ action: 'stop' })
    this.isTracking = false
    return { success: true, message: 'Tracking detenido' }
  }

  /**
   * Captura un elemento en una posición
   */
  captureElement(x, y) {
    return new Promise((resolve) => {
      const handler = (element) => {
        if (element) {
          resolve({ success: true, element })
        }
      }

      this.once('element_captured', handler)

      this._sendCommand({ action: 'capture', x, y })

      // Timeout
      setTimeout(() => {
        this.off('element_captured', handler)
        resolve({ success: false, error: 'Timeout capturando elemento' })
      }, 5000)
    })
  }

  /**
   * Obtiene información del elemento en una posición
   */
  getElementAt(x, y) {
    return new Promise((resolve) => {
      const handler = (data) => {
        resolve({ success: true, element: data.element })
      }

      this.once('element_info', handler)

      this._sendCommand({ action: 'get_element', x, y })

      setTimeout(() => {
        this.off('element_info', handler)
        resolve({ success: false, error: 'Timeout' })
      }, 3000)
    })
  }

  /**
   * Establece un highlight manual
   */
  setHighlight(x, y, width, height, interactive = true) {
    this._sendCommand({
      action: 'highlight',
      x, y, width, height, interactive
    })
  }

  /**
   * Limpia el highlight
   */
  clearHighlight() {
    this._sendCommand({ action: 'clear_highlight' })
  }

  /**
   * Obtiene los clics pendientes
   */
  getPendingClicks() {
    return new Promise((resolve) => {
      const handler = (data) => {
        resolve(data.clicks || [])
      }

      this.once('pending_clicks', handler)

      this._sendCommand({ action: 'get_clicks' })

      setTimeout(() => {
        this.off('pending_clicks', handler)
        resolve([])
      }, 1000)
    })
  }

  /**
   * Obtiene el estado del servicio
   */
  getStatus() {
    return {
      isRunning: this.isRunning,
      isTracking: this.isTracking,
      targetWindowHandle: this.targetWindowHandle,
      lastElement: this.lastElement
    }
  }

  /**
   * Envía un comando al proceso Python
   */
  _sendCommand(cmd) {
    if (this.process && this.process.stdin.writable) {
      this.process.stdin.write(JSON.stringify(cmd) + '\n')
    }
  }

  /**
   * Maneja mensajes del proceso Python
   */
  _handleMessage(msg) {
    const event = msg.event

    switch (event) {
      case 'ready':
        this.emit('ready', msg)
        break

      case 'tracking_started':
        this.isTracking = true
        this.emit('tracking_started', msg)
        break

      case 'tracking_stopped':
        this.isTracking = false
        this.emit('tracking_stopped', msg)
        break

      case 'hover':
        this.lastElement = msg.element
        this.emit('hover', msg)
        break

      case 'click':
        this.pendingClicks.push(msg)
        this.emit('click', msg)
        break

      case 'element_captured':
        this.emit('element_captured', msg.element)
        break

      case 'element_info':
        this.emit('element_info', msg)
        break

      case 'pending_clicks':
        this.emit('pending_clicks', msg)
        break

      case 'status':
        this.emit('status', msg)
        break

      default:
        if (msg.error) {
          console.error('[TrackingService] Error:', msg.error)
          this.emit('error', msg)
        } else if (msg.warning) {
          console.warn('[TrackingService] Warning:', msg.warning)
        }
    }
  }
}

// Singleton
const trackingService = new TrackingService()

export default trackingService
export { TrackingService }
