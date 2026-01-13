/**
 * ALQVIMIA RPA 2.0 - Motor de Ejecución de Acciones
 *
 * Este módulo contiene la lógica real para ejecutar cada tipo de acción.
 * Utiliza Playwright para automatización web, ExcelJS para Excel, etc.
 */

import { chromium, firefox } from 'playwright'
import { exec, spawn } from 'child_process'
import { promisify } from 'util'
import fs from 'fs/promises'
import path from 'path'

const execAsync = promisify(exec)

// Estado global del motor
const engineState = {
  browsers: new Map(),       // Navegadores activos por sessionId
  pages: new Map(),          // Páginas activas
  variables: new Map(),      // Variables del workflow
  excelWorkbooks: new Map(), // Workbooks de Excel abiertos
}

/**
 * Clase principal del ejecutor de acciones
 */
export class ActionExecutor {
  constructor(socket, executionId) {
    this.socket = socket
    this.executionId = executionId
    this.sessionId = `session_${Date.now()}`
    this.variables = new Map()
  }

  /**
   * Emitir log al frontend
   */
  log(type, message, data = {}) {
    const log = {
      timestamp: new Date().toISOString(),
      type,
      message,
      ...data
    }
    this.socket?.emit('executor:log', { executionId: this.executionId, log })
    console.log(`[ActionExecutor] [${type.toUpperCase()}] ${message}`)
    return log
  }

  /**
   * Ejecutar una acción
   */
  async execute(action) {
    const actionType = action.type || action.action
    const params = action.properties || action.params || {}

    console.log(`[ActionExecutor] Acción: ${actionType}`)
    console.log(`[ActionExecutor] Params recibidos:`, JSON.stringify(params, null, 2))

    this.log('info', `Ejecutando: ${action.label || actionType}`)

    try {
      // Obtener el ejecutor para esta acción
      const executor = this.getExecutor(actionType)

      if (!executor) {
        this.log('warning', `Acción no implementada: ${actionType}`)
        return { success: true, skipped: true }
      }

      // Ejecutar la acción
      const result = await executor.call(this, params, action)

      this.log('success', `Completado: ${action.label || actionType}`)
      return { success: true, result }

    } catch (error) {
      this.log('error', `Error en ${actionType}: ${error.message}`)
      throw error
    }
  }

  /**
   * Obtener el ejecutor apropiado para cada tipo de acción
   */
  getExecutor(actionType) {
    const executors = {
      // ==========================================
      // NAVEGADOR WEB
      // ==========================================
      'open_browser': this.openBrowser,
      'browser_open': this.openBrowser,
      'navigate': this.navigate,
      'click': this.click,
      'type': this.typeText,
      'extract': this.extractText,
      'screenshot': this.screenshot,
      'scroll': this.scroll,
      'close_browser': this.closeBrowser,
      'wait_element': this.waitForElement,
      'wait_page_load': this.waitForPageLoad,

      // ==========================================
      // HTTP REQUESTS
      // ==========================================
      'http_get': this.httpGet,
      'http_post': this.httpPost,
      'http_put': this.httpPut,
      'http_delete': this.httpDelete,

      // ==========================================
      // POWERSHELL / CMD
      // ==========================================
      'powershell_run': this.runPowerShell,
      'cmd_run': this.runCmd,
      'run_application': this.runApplication,

      // ==========================================
      // ARCHIVOS
      // ==========================================
      'file_read': this.fileRead,
      'file_write': this.fileWrite,
      'file_copy': this.fileCopy,
      'file_move': this.fileMove,
      'file_delete': this.fileDelete,
      'file_exists': this.fileExists,

      // ==========================================
      // VARIABLES
      // ==========================================
      'set_variable': this.setVariable,
      'get_variable': this.getVariable,

      // ==========================================
      // ESPERAS / DELAYS
      // ==========================================
      'wait': this.wait,
      'delay': this.wait,
      'wait_seconds': this.wait,

      // ==========================================
      // MENSAJES
      // ==========================================
      'message_box': this.messageBox,
      'log_info': this.logInfo,
      'log_warning': this.logWarning,
      'log_error': this.logError,

      // ==========================================
      // CONDICIONES Y BUCLES
      // ==========================================
      'if_condition': this.ifCondition,
      'for_loop': this.forLoop,
    }

    return executors[actionType]
  }

  // ==========================================
  // IMPLEMENTACIONES DE ACCIONES
  // ==========================================

  /**
   * Abrir navegador
   */
  async openBrowser(params) {
    const browserType = params.browser || 'chrome'
    const headless = params.headless || false
    const maximized = params.maximized !== false

    this.log('info', `Abriendo navegador: ${browserType}`)

    let browser
    const launchOptions = {
      headless,
      args: maximized ? ['--start-maximized'] : []
    }

    if (browserType === 'firefox') {
      browser = await firefox.launch(launchOptions)
    } else {
      // Chrome/Edge usan chromium
      browser = await chromium.launch({
        ...launchOptions,
        channel: browserType === 'edge' ? 'msedge' : 'chrome'
      })
    }

    const context = await browser.newContext({
      viewport: maximized ? null : { width: params.width || 1920, height: params.height || 1080 }
    })
    const page = await context.newPage()

    // Guardar referencia
    engineState.browsers.set(this.sessionId, browser)
    engineState.pages.set(this.sessionId, page)

    return { browserId: this.sessionId }
  }

  /**
   * Navegar a URL
   */
  async navigate(params) {
    const page = engineState.pages.get(this.sessionId)
    if (!page) throw new Error('Navegador no abierto. Ejecuta "Abrir Navegador" primero.')

    const url = params.url
    if (!url) throw new Error('URL no especificada')

    this.log('info', `Navegando a: ${url}`)

    await page.goto(url, {
      waitUntil: params.waitUntil || 'domcontentloaded',
      timeout: params.timeout || 30000
    })

    return { url }
  }

  /**
   * Hacer clic en elemento
   */
  async click(params) {
    const page = engineState.pages.get(this.sessionId)
    if (!page) throw new Error('Navegador no abierto')

    const selector = params.selector
    if (!selector) throw new Error('Selector no especificado')

    this.log('info', `Haciendo clic en: ${selector}`)

    // Esperar que el elemento sea visible
    await page.waitForSelector(selector, {
      state: 'visible',
      timeout: params.timeout || 10000
    })

    await page.click(selector, {
      button: params.button || 'left',
      clickCount: params.clickCount || 1,
      delay: params.delay || 0
    })

    return { clicked: selector }
  }

  /**
   * Escribir texto
   */
  async typeText(params) {
    const page = engineState.pages.get(this.sessionId)
    if (!page) throw new Error('Navegador no abierto')

    const selector = params.selector
    const text = params.text || params.value

    if (!selector) throw new Error('Selector no especificado')
    if (!text) throw new Error('Texto no especificado')

    this.log('info', `Escribiendo en: ${selector}`)

    await page.waitForSelector(selector, { state: 'visible', timeout: 10000 })

    // Limpiar campo si se especifica
    const shouldClear = params.clearBefore !== false && params.clearFirst !== false
    if (shouldClear) {
      await page.fill(selector, '')
    }

    // Método de entrada
    const inputMethod = params.inputMethod || 'type'
    const delay = params.delay || params.typeDelay || 50

    if (inputMethod === 'fill') {
      // Rellenar instantáneamente
      await page.fill(selector, text)
    } else if (inputMethod === 'paste') {
      // Pegar desde portapapeles (simular)
      await page.fill(selector, text)
    } else {
      // Teclear letra por letra
      await page.type(selector, text, { delay })
    }

    // Presionar tecla al terminar si se especifica
    const keyToPress = params.pressKeyAfter || (params.pressEnter ? 'Enter' : 'none')

    if (keyToPress && keyToPress !== 'none') {
      this.log('info', `Presionando tecla: ${keyToPress}`)

      // Manejar combinaciones de teclas (Ctrl+A, Shift+Tab, etc.)
      if (keyToPress.includes('+')) {
        const parts = keyToPress.split('+')
        const modifiers = parts.slice(0, -1)
        const key = parts[parts.length - 1]

        // Presionar modificadores
        for (const mod of modifiers) {
          await page.keyboard.down(mod)
        }

        // Presionar tecla principal
        await page.keyboard.press(key)

        // Soltar modificadores
        for (const mod of modifiers.reverse()) {
          await page.keyboard.up(mod)
        }
      } else {
        await page.keyboard.press(keyToPress)
      }
    }

    return { typed: text.substring(0, 50) + (text.length > 50 ? '...' : '') }
  }

  /**
   * Extraer texto de elemento
   */
  async extractText(params) {
    const page = engineState.pages.get(this.sessionId)
    if (!page) throw new Error('Navegador no abierto')

    const selector = params.selector
    if (!selector) throw new Error('Selector no especificado')

    this.log('info', `Extrayendo texto de: ${selector}`)

    await page.waitForSelector(selector, { timeout: 10000 })

    const text = await page.textContent(selector)

    // Guardar en variable si se especifica
    if (params.saveAs || params.variable) {
      this.variables.set(params.saveAs || params.variable, text)
    }

    return { text }
  }

  /**
   * Tomar screenshot
   */
  async screenshot(params) {
    const page = engineState.pages.get(this.sessionId)
    if (!page) throw new Error('Navegador no abierto')

    const filepath = params.path || `screenshot_${Date.now()}.png`

    this.log('info', `Tomando screenshot: ${filepath}`)

    await page.screenshot({
      path: filepath,
      fullPage: params.fullPage || false
    })

    return { path: filepath }
  }

  /**
   * Scroll en página
   */
  async scroll(params) {
    const page = engineState.pages.get(this.sessionId)
    if (!page) throw new Error('Navegador no abierto')

    const direction = params.direction || 'down'
    const amount = params.amount || 300

    this.log('info', `Scroll ${direction}: ${amount}px`)

    if (params.selector) {
      await page.locator(params.selector).scrollIntoViewIfNeeded()
    } else {
      const scrollAmount = direction === 'up' ? -amount : amount
      await page.evaluate((y) => window.scrollBy(0, y), scrollAmount)
    }

    return { scrolled: amount }
  }

  /**
   * Cerrar navegador
   */
  async closeBrowser() {
    const browser = engineState.browsers.get(this.sessionId)

    if (browser) {
      this.log('info', 'Cerrando navegador')
      await browser.close()
      engineState.browsers.delete(this.sessionId)
      engineState.pages.delete(this.sessionId)
    }

    return { closed: true }
  }

  /**
   * Esperar elemento
   */
  async waitForElement(params) {
    const page = engineState.pages.get(this.sessionId)
    if (!page) throw new Error('Navegador no abierto')

    const selector = params.selector
    const timeout = params.timeout || 30000

    this.log('info', `Esperando elemento: ${selector}`)

    await page.waitForSelector(selector, {
      state: params.state || 'visible',
      timeout
    })

    return { found: selector }
  }

  /**
   * Esperar carga de página
   */
  async waitForPageLoad(params) {
    const page = engineState.pages.get(this.sessionId)
    if (!page) throw new Error('Navegador no abierto')

    this.log('info', 'Esperando carga de página')

    await page.waitForLoadState(params.state || 'domcontentloaded', {
      timeout: params.timeout || 30000
    })

    return { loaded: true }
  }

  // ==========================================
  // HTTP REQUESTS
  // ==========================================

  async httpGet(params) {
    const url = params.url
    if (!url) throw new Error('URL no especificada')

    this.log('info', `HTTP GET: ${url}`)

    const response = await fetch(url, {
      headers: params.headers || {}
    })

    const data = await response.json().catch(() => response.text())

    if (params.saveAs) {
      this.variables.set(params.saveAs, data)
    }

    return { status: response.status, data }
  }

  async httpPost(params) {
    const url = params.url
    if (!url) throw new Error('URL no especificada')

    this.log('info', `HTTP POST: ${url}`)

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...params.headers
      },
      body: JSON.stringify(params.body || params.data)
    })

    const data = await response.json().catch(() => response.text())

    if (params.saveAs) {
      this.variables.set(params.saveAs, data)
    }

    return { status: response.status, data }
  }

  async httpPut(params) {
    const url = params.url
    if (!url) throw new Error('URL no especificada')

    this.log('info', `HTTP PUT: ${url}`)

    const response = await fetch(url, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...params.headers
      },
      body: JSON.stringify(params.body || params.data)
    })

    const data = await response.json().catch(() => response.text())

    return { status: response.status, data }
  }

  async httpDelete(params) {
    const url = params.url
    if (!url) throw new Error('URL no especificada')

    this.log('info', `HTTP DELETE: ${url}`)

    const response = await fetch(url, {
      method: 'DELETE',
      headers: params.headers || {}
    })

    return { status: response.status }
  }

  // ==========================================
  // POWERSHELL / CMD
  // ==========================================

  async runPowerShell(params) {
    const command = params.command || params.script
    if (!command) throw new Error('Comando no especificado')

    this.log('info', `PowerShell: ${command.substring(0, 100)}...`)

    const { stdout, stderr } = await execAsync(`powershell -Command "${command.replace(/"/g, '\\"')}"`)

    if (params.saveAs) {
      this.variables.set(params.saveAs, stdout.trim())
    }

    return { stdout: stdout.trim(), stderr: stderr.trim() }
  }

  async runCmd(params) {
    const command = params.command
    if (!command) throw new Error('Comando no especificado')

    this.log('info', `CMD: ${command.substring(0, 100)}...`)

    const { stdout, stderr } = await execAsync(command)

    if (params.saveAs) {
      this.variables.set(params.saveAs, stdout.trim())
    }

    return { stdout: stdout.trim(), stderr: stderr.trim() }
  }

  async runApplication(params) {
    const appPath = params.path || params.application
    if (!appPath) throw new Error('Ruta de aplicación no especificada')

    this.log('info', `Ejecutando: ${appPath}`)

    const args = params.args || []
    spawn(appPath, args, { detached: true, stdio: 'ignore' }).unref()

    return { started: appPath }
  }

  // ==========================================
  // ARCHIVOS
  // ==========================================

  async fileRead(params) {
    const filepath = params.path || params.file
    if (!filepath) throw new Error('Ruta de archivo no especificada')

    this.log('info', `Leyendo archivo: ${filepath}`)

    const content = await fs.readFile(filepath, 'utf-8')

    if (params.saveAs) {
      this.variables.set(params.saveAs, content)
    }

    return { content: content.substring(0, 500) + (content.length > 500 ? '...' : '') }
  }

  async fileWrite(params) {
    const filepath = params.path || params.file
    const content = params.content || params.text

    if (!filepath) throw new Error('Ruta de archivo no especificada')
    if (content === undefined) throw new Error('Contenido no especificado')

    this.log('info', `Escribiendo archivo: ${filepath}`)

    await fs.writeFile(filepath, content, 'utf-8')

    return { written: filepath }
  }

  async fileCopy(params) {
    const source = params.source || params.from
    const destination = params.destination || params.to

    if (!source || !destination) throw new Error('Origen y destino requeridos')

    this.log('info', `Copiando: ${source} -> ${destination}`)

    await fs.copyFile(source, destination)

    return { copied: destination }
  }

  async fileMove(params) {
    const source = params.source || params.from
    const destination = params.destination || params.to

    if (!source || !destination) throw new Error('Origen y destino requeridos')

    this.log('info', `Moviendo: ${source} -> ${destination}`)

    await fs.rename(source, destination)

    return { moved: destination }
  }

  async fileDelete(params) {
    const filepath = params.path || params.file
    if (!filepath) throw new Error('Ruta de archivo no especificada')

    this.log('info', `Eliminando: ${filepath}`)

    await fs.unlink(filepath)

    return { deleted: filepath }
  }

  async fileExists(params) {
    const filepath = params.path || params.file
    if (!filepath) throw new Error('Ruta de archivo no especificada')

    try {
      await fs.access(filepath)
      if (params.saveAs) this.variables.set(params.saveAs, true)
      return { exists: true }
    } catch {
      if (params.saveAs) this.variables.set(params.saveAs, false)
      return { exists: false }
    }
  }

  // ==========================================
  // VARIABLES
  // ==========================================

  async setVariable(params) {
    const name = params.name || params.variable
    const value = params.value

    if (!name) throw new Error('Nombre de variable no especificado')

    this.variables.set(name, value)
    this.log('info', `Variable ${name} = ${JSON.stringify(value).substring(0, 100)}`)

    return { variable: name, value }
  }

  async getVariable(params) {
    const name = params.name || params.variable
    if (!name) throw new Error('Nombre de variable no especificado')

    const value = this.variables.get(name)
    return { variable: name, value }
  }

  // ==========================================
  // ESPERAS
  // ==========================================

  async wait(params) {
    const ms = (params.seconds || params.time || 1) * 1000
    this.log('info', `Esperando ${ms}ms`)
    await new Promise(resolve => setTimeout(resolve, ms))
    return { waited: ms }
  }

  // ==========================================
  // MENSAJES / LOGS
  // ==========================================

  async messageBox(params) {
    // Emitir evento para que el frontend muestre el mensaje
    this.socket?.emit('executor:message-box', {
      executionId: this.executionId,
      title: params.title || 'Mensaje',
      message: params.message || params.text,
      type: params.type || 'info'
    })

    // Esperar confirmación del usuario
    return new Promise((resolve) => {
      const handler = (data) => {
        if (data.executionId === this.executionId) {
          this.socket?.off('executor:message-box-closed', handler)
          resolve({ acknowledged: true })
        }
      }
      this.socket?.on('executor:message-box-closed', handler)

      // Timeout de 5 minutos
      setTimeout(() => {
        this.socket?.off('executor:message-box-closed', handler)
        resolve({ acknowledged: true, timedOut: true })
      }, 300000)
    })
  }

  async logInfo(params) {
    this.log('info', params.message || params.text)
    return { logged: 'info' }
  }

  async logWarning(params) {
    this.log('warning', params.message || params.text)
    return { logged: 'warning' }
  }

  async logError(params) {
    this.log('error', params.message || params.text)
    return { logged: 'error' }
  }

  // ==========================================
  // CONTROL DE FLUJO
  // ==========================================

  async ifCondition(params) {
    // Esta acción se maneja especialmente en el loop principal
    return { condition: params.condition }
  }

  async forLoop(params) {
    // Esta acción se maneja especialmente en el loop principal
    return { iterations: params.iterations }
  }

  // ==========================================
  // CLEANUP
  // ==========================================

  async cleanup(options = {}) {
    const { closeBrowsers = false, reason = 'workflow_completed' } = options

    this.log('info', `Limpiando recursos... (razón: ${reason}, cerrar navegadores: ${closeBrowsers})`)

    // Solo cerrar navegadores si se solicita explícitamente (error, stop, etc.)
    // Por defecto, mantener el navegador abierto para que el usuario vea el resultado
    if (closeBrowsers) {
      for (const [id, browser] of engineState.browsers) {
        try {
          await browser.close()
          this.log('info', `Navegador ${id} cerrado`)
        } catch (e) {
          console.error(`Error cerrando navegador ${id}:`, e)
        }
      }
      engineState.browsers.clear()
      engineState.pages.clear()
    } else {
      this.log('info', '📌 Navegador mantenido abierto - el usuario puede interactuar con él')
    }
  }
}

export default ActionExecutor
