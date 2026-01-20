/**
 * Browser Injector Service
 * Inyecta scripts en navegadores Chrome usando Chrome DevTools Protocol (CDP)
 * Solución automática sin intervención del usuario
 */

import { exec, spawn } from 'child_process'
import { promisify } from 'util'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const execAsync = promisify(exec)
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Cache del script de spy-injector
let spyInjectorScript = null

// Estado global del Chrome con debugging
let chromeDebugProcess = null
let activeDebugPort = null

/**
 * Carga el script spy-injector.js
 */
async function loadSpyInjectorScript() {
  if (spyInjectorScript) return spyInjectorScript

  try {
    const scriptPath = path.join(__dirname, '../../public/spy-injector.js')
    spyInjectorScript = fs.readFileSync(scriptPath, 'utf8')
    return spyInjectorScript
  } catch (error) {
    console.error('[BrowserInjector] Error cargando spy-injector.js:', error.message)
    return null
  }
}

/**
 * Encuentra el puerto de depuración de Chrome
 */
async function findChromeDebugPort() {
  try {
    // Buscar procesos de Chrome con --remote-debugging-port
    const { stdout } = await execAsync(
      'powershell -Command "Get-CimInstance Win32_Process | Where-Object {$_.Name -like \'*chrome*\' -and $_.CommandLine -like \'*--remote-debugging-port*\'} | Select-Object ProcessId, CommandLine | ConvertTo-Json"',
      { encoding: 'utf8', timeout: 5000 }
    )

    if (stdout && stdout.trim()) {
      const processes = JSON.parse(stdout)
      const processArray = Array.isArray(processes) ? processes : [processes]

      for (const proc of processArray) {
        const match = proc.CommandLine?.match(/--remote-debugging-port=(\d+)/)
        if (match) {
          return parseInt(match[1], 10)
        }
      }
    }
  } catch (error) {
    // Puede fallar si no hay procesos, no es un error crítico
  }

  return null
}

/**
 * Verifica si el puerto de debugging está activo
 */
async function isDebugPortActive(port = 9222) {
  try {
    const response = await fetch(`http://localhost:${port}/json/version`, {
      signal: AbortSignal.timeout(2000)
    })
    return response.ok
  } catch {
    return false
  }
}

/**
 * Obtiene las pestañas abiertas de Chrome via CDP
 */
async function getChromeTargets(debugPort = 9222) {
  try {
    const response = await fetch(`http://localhost:${debugPort}/json`, {
      signal: AbortSignal.timeout(3000)
    })
    if (response.ok) {
      const targets = await response.json()
      return targets.filter(t => t.type === 'page')
    }
  } catch (error) {
    console.error('[BrowserInjector] Error obteniendo targets:', error.message)
  }
  return []
}

/**
 * Encuentra la ruta de Chrome en Windows
 */
function findChromePath() {
  const chromePaths = [
    process.env.LOCALAPPDATA + '\\Google\\Chrome\\Application\\chrome.exe',
    'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe'
  ]

  for (const chromePath of chromePaths) {
    if (fs.existsSync(chromePath)) {
      return chromePath
    }
  }
  return null
}

/**
 * Cierra todas las instancias de Chrome
 */
async function closeAllChrome() {
  try {
    await execAsync('taskkill /F /IM chrome.exe /T', { encoding: 'utf8', timeout: 5000 })
    // Esperar a que se cierren
    await new Promise(resolve => setTimeout(resolve, 1000))
    return true
  } catch {
    // Puede fallar si no hay Chrome corriendo
    return true
  }
}

/**
 * Lanza Chrome con depuración remota habilitada
 */
async function launchChromeWithDebugging(url = '', debugPort = 9222) {
  try {
    const chromePath = findChromePath()

    if (!chromePath) {
      return { success: false, error: 'Chrome no encontrado en el sistema' }
    }

    console.log('[BrowserInjector] Lanzando Chrome con debugging en puerto', debugPort)

    // Argumentos para Chrome con debugging
    const args = [
      `--remote-debugging-port=${debugPort}`,
      '--no-first-run',
      '--no-default-browser-check',
      '--disable-background-networking',
      '--disable-client-side-phishing-detection',
      '--disable-default-apps',
      '--disable-hang-monitor',
      '--disable-popup-blocking',
      '--disable-prompt-on-repost',
      '--disable-sync',
      '--disable-translate',
      '--metrics-recording-only',
      '--safebrowsing-disable-auto-update'
    ]

    if (url) {
      args.push(url)
    }

    // Lanzar Chrome en modo detached
    chromeDebugProcess = spawn(chromePath, args, {
      detached: true,
      stdio: 'ignore'
    })
    chromeDebugProcess.unref()

    activeDebugPort = debugPort

    // Esperar a que el puerto esté disponible
    let attempts = 0
    const maxAttempts = 20
    while (attempts < maxAttempts) {
      await new Promise(resolve => setTimeout(resolve, 500))
      if (await isDebugPortActive(debugPort)) {
        console.log('[BrowserInjector] Chrome con debugging iniciado correctamente')
        return { success: true, port: debugPort }
      }
      attempts++
    }

    return { success: false, error: 'Chrome no respondió al puerto de debugging' }
  } catch (error) {
    console.error('[BrowserInjector] Error lanzando Chrome:', error.message)
    return { success: false, error: error.message }
  }
}

/**
 * Inyecta el spy-injector en una pestaña de Chrome via CDP
 */
async function injectIntoChrome(targetTitle, debugPort = 9222) {
  try {
    const script = await loadSpyInjectorScript()
    if (!script) {
      return { success: false, error: 'No se pudo cargar spy-injector.js' }
    }

    const targets = await getChromeTargets(debugPort)

    if (targets.length === 0) {
      return { success: false, error: 'No hay pestañas abiertas en Chrome' }
    }

    // Buscar la pestaña que coincida con el título
    let target = null
    if (targetTitle) {
      const searchTerm = targetTitle.toLowerCase()
      target = targets.find(t =>
        t.title?.toLowerCase().includes(searchTerm) ||
        t.url?.toLowerCase().includes(searchTerm)
      )
    }

    // Si no se encuentra, usar la primera pestaña activa
    if (!target) {
      target = targets[0]
    }

    console.log('[BrowserInjector] Inyectando en pestaña:', target.title)

    // Conectar via WebSocket y ejecutar el script
    const WebSocket = (await import('ws')).default
    const ws = new WebSocket(target.webSocketDebuggerUrl)

    return new Promise((resolve) => {
      const timeout = setTimeout(() => {
        ws.close()
        resolve({ success: false, error: 'Timeout al conectar con Chrome' })
      }, 10000)

      ws.on('open', () => {
        // Primero habilitar Runtime
        ws.send(JSON.stringify({
          id: 1,
          method: 'Runtime.enable'
        }))
      })

      ws.on('message', (data) => {
        const response = JSON.parse(data.toString())

        if (response.id === 1) {
          // Runtime habilitado, ahora inyectar el script
          ws.send(JSON.stringify({
            id: 2,
            method: 'Runtime.evaluate',
            params: {
              expression: script,
              awaitPromise: false,
              returnByValue: false
            }
          }))
        } else if (response.id === 2) {
          clearTimeout(timeout)
          ws.close()

          if (response.error) {
            resolve({ success: false, error: response.error.message })
          } else {
            console.log('[BrowserInjector] Script inyectado exitosamente')
            resolve({
              success: true,
              tabTitle: target.title,
              tabUrl: target.url
            })
          }
        }
      })

      ws.on('error', (error) => {
        clearTimeout(timeout)
        ws.close()
        resolve({ success: false, error: error.message })
      })
    })
  } catch (error) {
    console.error('[BrowserInjector] Error inyectando:', error.message)
    return { success: false, error: error.message }
  }
}

/**
 * Inyecta en todas las pestañas de Chrome
 */
async function injectIntoAllTabs(debugPort = 9222) {
  const targets = await getChromeTargets(debugPort)
  const results = []

  for (const target of targets) {
    try {
      const result = await injectIntoChrome(target.title, debugPort)
      results.push({ tab: target.title, ...result })
    } catch (error) {
      results.push({ tab: target.title, success: false, error: error.message })
    }
  }

  return results
}

/**
 * Solución principal: Inyecta automáticamente en Chrome
 * Si Chrome no tiene debugging, lo reinicia con debugging habilitado
 */
async function injectSpyInBrowser(processName, windowTitle, options = {}) {
  console.log('[BrowserInjector] Intentando inyectar en:', processName, windowTitle)

  // Solo funciona con Chrome por ahora
  const isBrowser = processName?.toLowerCase().includes('chrome') ||
                    processName?.toLowerCase().includes('msedge') ||
                    processName?.toLowerCase().includes('firefox')

  if (!isBrowser) {
    return {
      success: false,
      error: 'Este proceso no es un navegador soportado',
      isDesktopApp: true
    }
  }

  // Solo Chrome soportado por ahora
  if (!processName?.toLowerCase().includes('chrome')) {
    return {
      success: false,
      error: 'Actualmente solo Chrome es soportado para inyección automática',
      manual: true
    }
  }

  // 1. Verificar si Chrome ya tiene debugging habilitado
  let debugPort = await findChromeDebugPort()

  if (debugPort && await isDebugPortActive(debugPort)) {
    console.log('[BrowserInjector] Chrome con debugging encontrado en puerto:', debugPort)
    const result = await injectIntoChrome(windowTitle, debugPort)
    if (result.success) {
      return result
    }
  }

  // 2. Si no hay debugging, preguntar si queremos reiniciar Chrome
  if (options.autoRestart) {
    console.log('[BrowserInjector] Reiniciando Chrome con debugging...')

    // Cerrar Chrome actual
    await closeAllChrome()

    // Esperar un poco
    await new Promise(resolve => setTimeout(resolve, 1500))

    // Lanzar con debugging
    const launchResult = await launchChromeWithDebugging('', 9222)

    if (!launchResult.success) {
      return {
        success: false,
        error: launchResult.error,
        needsRestart: true
      }
    }

    // Esperar a que se estabilice
    await new Promise(resolve => setTimeout(resolve, 2000))

    // Intentar inyectar
    const injectResult = await injectIntoChrome(windowTitle, 9222)
    return injectResult
  }

  // 3. Chrome necesita reiniciarse con debugging
  return {
    success: false,
    needsRestart: true,
    error: 'Chrome necesita reiniciarse con modo de depuración',
    message: 'Se requiere reiniciar Chrome para habilitar la captura de elementos'
  }
}

/**
 * Reinicia Chrome con debugging y luego inyecta
 */
async function restartChromeAndInject(windowTitle) {
  console.log('[BrowserInjector] Reiniciando Chrome para inyección automática...')

  // Cerrar Chrome
  await closeAllChrome()
  await new Promise(resolve => setTimeout(resolve, 2000))

  // Lanzar con debugging
  const launchResult = await launchChromeWithDebugging('', 9222)
  if (!launchResult.success) {
    return { success: false, error: 'No se pudo iniciar Chrome con debugging' }
  }

  // Esperar a que Chrome esté listo
  await new Promise(resolve => setTimeout(resolve, 3000))

  // Inyectar
  const injectResult = await injectIntoChrome(windowTitle, 9222)
  return injectResult
}

/**
 * Genera el bookmarklet para inyección manual (fallback)
 */
function generateBookmarklet(serverUrl = 'http://localhost:4000') {
  const code = `javascript:(function(){var s=document.createElement('script');s.src='${serverUrl}/spy-injector.js?t='+Date.now();window.AlqvimiaSpyServerUrl='${serverUrl}';document.body.appendChild(s);})();`
  return encodeURI(code)
}

/**
 * Obtiene el estado actual de Chrome debugging
 */
async function getChromeDebugStatus() {
  const debugPort = await findChromeDebugPort()
  const isActive = debugPort ? await isDebugPortActive(debugPort) : false
  const tabs = isActive ? await getChromeTargets(debugPort) : []

  return {
    hasDebugPort: !!debugPort,
    debugPort,
    isActive,
    tabCount: tabs.length,
    tabs: tabs.map(t => ({ title: t.title, url: t.url }))
  }
}

export {
  injectSpyInBrowser,
  injectIntoChrome,
  injectIntoAllTabs,
  getChromeTargets,
  findChromeDebugPort,
  launchChromeWithDebugging,
  restartChromeAndInject,
  closeAllChrome,
  generateBookmarklet,
  loadSpyInjectorScript,
  getChromeDebugStatus,
  isDebugPortActive
}
