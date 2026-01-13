/**
 * ALQVIMIA RPA 2.0 - Base Agent Class
 * Clase base para todos los agentes del ecosistema
 */

import { EventEmitter } from 'events'
import express from 'express'
import http from 'http'
import { Server as SocketIO } from 'socket.io'
import cors from 'cors'

class BaseAgent extends EventEmitter {
  constructor(config = {}) {
    super()

    // Configuración del agente
    this.id = config.id || `agent-${Date.now()}`
    this.name = config.name || 'Unknown Agent'
    this.version = config.version || '1.0.0'
    this.port = config.port || 4000
    this.category = config.category || 'general'

    // Estado del agente
    this.status = 'stopped' // stopped, starting, running, stopping, error
    this.startTime = null
    this.metrics = {
      requestsTotal: 0,
      requestsSuccess: 0,
      requestsFailed: 0,
      avgResponseTime: 0
    }

    // Conexión con orquestador
    this.orchestratorUrl = config.orchestratorUrl || 'http://localhost:4000'
    this.orchestratorSocket = null

    // Express app
    this.app = express()
    this.server = null
    this.io = null

    // Configurar middleware base
    this.setupMiddleware()
    this.setupBaseRoutes()
  }

  /**
   * Configurar middleware de Express
   */
  setupMiddleware() {
    this.app.use(cors())
    this.app.use(express.json({ limit: '50mb' }))
    this.app.use(express.urlencoded({ extended: true }))

    // Middleware de logging
    this.app.use((req, res, next) => {
      const start = Date.now()
      res.on('finish', () => {
        const duration = Date.now() - start
        this.updateMetrics(res.statusCode < 400, duration)
        this.log('info', `${req.method} ${req.path} - ${res.statusCode} (${duration}ms)`)
      })
      next()
    })
  }

  /**
   * Configurar rutas base (health, info, metrics)
   */
  setupBaseRoutes() {
    // Health check
    this.app.get('/health', (req, res) => {
      res.json({
        status: this.status,
        uptime: this.getUptime(),
        timestamp: new Date().toISOString()
      })
    })

    // Información del agente
    this.app.get('/info', (req, res) => {
      res.json({
        id: this.id,
        name: this.name,
        version: this.version,
        category: this.category,
        port: this.port,
        status: this.status,
        capabilities: this.getCapabilities()
      })
    })

    // Métricas
    this.app.get('/metrics', (req, res) => {
      res.json({
        ...this.metrics,
        uptime: this.getUptime(),
        memoryUsage: process.memoryUsage(),
        cpuUsage: process.cpuUsage()
      })
    })

    // Configuración
    this.app.get('/config', (req, res) => {
      res.json(this.getConfig())
    })

    this.app.put('/config', (req, res) => {
      try {
        this.updateConfig(req.body)
        res.json({ success: true, message: 'Configuration updated' })
      } catch (error) {
        res.status(400).json({ success: false, error: error.message })
      }
    })

    // Shutdown
    this.app.post('/shutdown', async (req, res) => {
      res.json({ success: true, message: 'Shutting down...' })
      await this.stop()
    })
  }

  /**
   * Obtener capacidades del agente (override en subclases)
   */
  getCapabilities() {
    return []
  }

  /**
   * Obtener configuración (override en subclases)
   */
  getConfig() {
    return {
      id: this.id,
      name: this.name,
      port: this.port,
      orchestratorUrl: this.orchestratorUrl
    }
  }

  /**
   * Actualizar configuración (override en subclases)
   */
  updateConfig(newConfig) {
    if (newConfig.orchestratorUrl) {
      this.orchestratorUrl = newConfig.orchestratorUrl
    }
  }

  /**
   * Iniciar el agente
   */
  async start() {
    if (this.status === 'running') {
      this.log('warn', 'Agent is already running')
      return
    }

    this.status = 'starting'
    this.emit('starting')

    try {
      // Crear servidor HTTP
      this.server = http.createServer(this.app)

      // Configurar Socket.IO
      this.io = new SocketIO(this.server, {
        cors: {
          origin: '*',
          methods: ['GET', 'POST']
        }
      })

      this.setupSocketHandlers()

      // Inicialización específica del agente
      await this.onStart()

      // Escuchar en el puerto
      await new Promise((resolve, reject) => {
        this.server.listen(this.port, () => {
          this.status = 'running'
          this.startTime = Date.now()
          this.log('info', `Agent started on port ${this.port}`)
          resolve()
        })
        this.server.on('error', reject)
      })

      // Conectar con el orquestador
      await this.connectToOrchestrator()

      this.emit('started')
    } catch (error) {
      this.status = 'error'
      this.log('error', `Failed to start: ${error.message}`)
      this.emit('error', error)
      throw error
    }
  }

  /**
   * Detener el agente
   */
  async stop() {
    if (this.status === 'stopped') {
      return
    }

    this.status = 'stopping'
    this.emit('stopping')

    try {
      // Desconectar del orquestador
      if (this.orchestratorSocket) {
        this.orchestratorSocket.disconnect()
      }

      // Limpieza específica del agente
      await this.onStop()

      // Cerrar servidor
      if (this.server) {
        await new Promise((resolve) => {
          this.server.close(resolve)
        })
      }

      this.status = 'stopped'
      this.startTime = null
      this.log('info', 'Agent stopped')
      this.emit('stopped')
    } catch (error) {
      this.status = 'error'
      this.log('error', `Failed to stop: ${error.message}`)
      this.emit('error', error)
    }
  }

  /**
   * Reiniciar el agente
   */
  async restart() {
    await this.stop()
    await this.start()
  }

  /**
   * Hook de inicio (override en subclases)
   */
  async onStart() {
    // Override en subclases
  }

  /**
   * Hook de parada (override en subclases)
   */
  async onStop() {
    // Override en subclases
  }

  /**
   * Configurar handlers de Socket.IO
   */
  setupSocketHandlers() {
    this.io.on('connection', (socket) => {
      this.log('info', `Client connected: ${socket.id}`)

      socket.on('disconnect', () => {
        this.log('info', `Client disconnected: ${socket.id}`)
      })

      // Handler para ejecutar acciones
      socket.on('execute', async (data, callback) => {
        try {
          const result = await this.execute(data.action, data.params)
          callback({ success: true, result })
        } catch (error) {
          callback({ success: false, error: error.message })
        }
      })

      // Handlers específicos del agente
      this.onSocketConnection(socket)
    })
  }

  /**
   * Handler de conexión Socket (override en subclases)
   */
  onSocketConnection(socket) {
    // Override en subclases
  }

  /**
   * Conectar con el orquestador central
   */
  async connectToOrchestrator() {
    try {
      const { io: ioClient } = await import('socket.io-client')

      this.orchestratorSocket = ioClient(this.orchestratorUrl, {
        auth: {
          agentId: this.id,
          agentName: this.name,
          agentVersion: this.version,
          agentPort: this.port
        }
      })

      this.orchestratorSocket.on('connect', () => {
        this.log('info', 'Connected to orchestrator')
        this.registerWithOrchestrator()
      })

      this.orchestratorSocket.on('disconnect', () => {
        this.log('warn', 'Disconnected from orchestrator')
      })

      this.orchestratorSocket.on('command', async (data, callback) => {
        try {
          const result = await this.handleOrchestratorCommand(data)
          callback({ success: true, result })
        } catch (error) {
          callback({ success: false, error: error.message })
        }
      })
    } catch (error) {
      this.log('warn', `Could not connect to orchestrator: ${error.message}`)
    }
  }

  /**
   * Registrar agente con el orquestador
   */
  registerWithOrchestrator() {
    if (this.orchestratorSocket) {
      this.orchestratorSocket.emit('register', {
        id: this.id,
        name: this.name,
        version: this.version,
        category: this.category,
        port: this.port,
        capabilities: this.getCapabilities()
      })
    }
  }

  /**
   * Manejar comandos del orquestador
   */
  async handleOrchestratorCommand(data) {
    switch (data.command) {
      case 'status':
        return {
          status: this.status,
          metrics: this.metrics,
          uptime: this.getUptime()
        }
      case 'restart':
        await this.restart()
        return { message: 'Agent restarted' }
      case 'config':
        if (data.config) {
          this.updateConfig(data.config)
        }
        return this.getConfig()
      default:
        throw new Error(`Unknown command: ${data.command}`)
    }
  }

  /**
   * Ejecutar una acción (override en subclases)
   */
  async execute(action, params) {
    throw new Error(`Action '${action}' not implemented`)
  }

  /**
   * Obtener uptime en segundos
   */
  getUptime() {
    return this.startTime ? Math.floor((Date.now() - this.startTime) / 1000) : 0
  }

  /**
   * Actualizar métricas
   */
  updateMetrics(success, responseTime) {
    this.metrics.requestsTotal++
    if (success) {
      this.metrics.requestsSuccess++
    } else {
      this.metrics.requestsFailed++
    }
    // Calcular promedio móvil
    this.metrics.avgResponseTime = (
      (this.metrics.avgResponseTime * (this.metrics.requestsTotal - 1) + responseTime) /
      this.metrics.requestsTotal
    )
  }

  /**
   * Logging
   */
  log(level, message) {
    const timestamp = new Date().toISOString()
    const logMessage = `[${timestamp}] [${this.name}] ${level.toUpperCase()}: ${message}`

    switch (level) {
      case 'error':
        console.error(logMessage)
        break
      case 'warn':
        console.warn(logMessage)
        break
      default:
        console.log(logMessage)
    }

    this.emit('log', { timestamp, level, message })
  }

  /**
   * Emitir evento a clientes conectados
   */
  broadcast(event, data) {
    if (this.io) {
      this.io.emit(event, data)
    }
  }

  /**
   * Notificar al orquestador
   */
  notifyOrchestrator(event, data) {
    if (this.orchestratorSocket) {
      this.orchestratorSocket.emit(event, {
        agentId: this.id,
        ...data
      })
    }
  }
}

export default BaseAgent
