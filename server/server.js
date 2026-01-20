import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'
import express from 'express'
import { createServer } from 'http'
import { Server } from 'socket.io'
import cors from 'cors'
import { exec } from 'child_process'
import { promisify } from 'util'

const execAsync = promisify(exec)

// Cargar .env desde la raiz del proyecto (un nivel arriba de server/)
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
dotenv.config({ path: path.resolve(__dirname, '../.env') })

// Handlers
import { registerSpyHandlers } from './handlers/spyHandlers.js'
import { registerRecorderHandlers } from './handlers/recorderHandlers.js'
import { registerWorkflowHandlers } from './handlers/workflowHandlers.js'
import { registerExecutorHandlers } from './handlers/executorHandlers.js'
import { registerAgentHandlers } from './handlers/agentHandlers.js'
import { registerMCPHandlers } from './handlers/mcpHandlers.js'

// Servicios
import { initDatabase, isConnected } from './services/database.js'

// Rutas API
import settingsRoutes from './routes/settings.js'
import workflowsRoutes from './routes/workflows.js'
import authRoutes from './routes/auth.js'
import usersRoutes from './routes/users.js'
import mcpDatabaseRoutes from './routes/mcp-database.js'
import aiRoutes from './routes/ai.js'

// Servicios
import {
  injectSpyInBrowser,
  generateBookmarklet,
  findChromeDebugPort,
  getChromeTargets,
  restartChromeAndInject,
  getChromeDebugStatus,
  isDebugPortActive
} from './services/browserInjector.js'

// Servicio de tracking nativo (Python)
import trackingService from './services/trackingService.js'

const app = express()
const httpServer = createServer(app)

// Puertos desde variables de entorno
const PORT = parseInt(process.env.BACKEND_PORT) || 4000
const FRONTEND_PORT = parseInt(process.env.VITE_PORT) || 4200

// URLs del frontend permitidas
const allowedOrigins = [
  `http://localhost:${FRONTEND_PORT}`,
  `http://127.0.0.1:${FRONTEND_PORT}`,
  'http://localhost:4200',
  'http://localhost:5173'  // fallback
]

// Configuración CORS
app.use(cors({
  origin: allowedOrigins,
  credentials: true
}))

app.use(express.json())

// Servir archivos estáticos públicos (para spy-injector.js)
app.use(express.static(path.resolve(__dirname, '../public')))

// Rutas API
app.use('/api/settings', settingsRoutes)
app.use('/api/workflows', workflowsRoutes)
app.use('/api/auth', authRoutes)
app.use('/api/users', usersRoutes)
app.use('/api/mcp', mcpDatabaseRoutes)
app.use('/api/ai', aiRoutes)

// Socket.IO
const io = new Server(httpServer, {
  cors: {
    origin: allowedOrigins,
    methods: ['GET', 'POST'],
    credentials: true
  }
})

// Estado global del servidor
const serverState = {
  connectedClients: new Map(),
  activeWorkflows: new Map(),
  recordingSessions: new Map(),
  spySessions: new Map(),
  agents: new Map(),
  mcpConnectors: new Map()
}

// Conexión Socket.IO
io.on('connection', (socket) => {
  console.log(`[Socket] Cliente conectado: ${socket.id}`)

  serverState.connectedClients.set(socket.id, {
    id: socket.id,
    connectedAt: new Date(),
    lastActivity: new Date()
  })

  // Enviar estado inicial
  socket.emit('server:status', {
    connected: true,
    clientId: socket.id,
    serverTime: new Date().toISOString(),
    activeClients: serverState.connectedClients.size
  })

  // Registrar handlers por módulo
  registerSpyHandlers(io, socket, serverState)
  registerRecorderHandlers(io, socket, serverState)
  registerWorkflowHandlers(io, socket, serverState)
  registerExecutorHandlers(io, socket, serverState)
  registerAgentHandlers(io, socket, serverState)
  registerMCPHandlers(io, socket, serverState)

  // Desconexión
  socket.on('disconnect', (reason) => {
    console.log(`[Socket] Cliente desconectado: ${socket.id} - Razón: ${reason}`)
    serverState.connectedClients.delete(socket.id)

    // Limpiar sesiones asociadas
    serverState.spySessions.delete(socket.id)
    serverState.recordingSessions.delete(socket.id)
  })

  // Heartbeat
  socket.on('ping', () => {
    const client = serverState.connectedClients.get(socket.id)
    if (client) {
      client.lastActivity = new Date()
    }
    socket.emit('pong', { timestamp: Date.now() })
  })

  // Handlers para tracking nativo
  socket.on('tracking:start', async (data) => {
    try {
      console.log('[Tracking] Iniciando tracking via socket...', data)

      if (!trackingService.isRunning) {
        await trackingService.start()
      }

      trackingService.startTracking(data?.targetHandle || null)

      socket.emit('tracking:started', { success: true })
    } catch (error) {
      socket.emit('tracking:error', { error: error.message })
    }
  })

  socket.on('tracking:stop', () => {
    trackingService.stopTracking()
    socket.emit('tracking:stopped', { success: true })
  })

  socket.on('tracking:capture', async (data) => {
    const { x, y } = data
    const result = await trackingService.captureElement(x, y)
    socket.emit('tracking:element-captured', result)
  })
})

// Ruta raiz - informacion del servidor
app.get('/', (req, res) => {
  res.json({
    name: 'Alqvimia RPA 2.0 - Backend API',
    version: '2.0.0',
    status: 'running',
    endpoints: {
      health: '/api/health',
      settings: '/api/settings',
      workflows: '/api/workflows'
    },
    frontend: `http://localhost:${FRONTEND_PORT}`
  })
})

// API REST endpoints
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    connectedClients: serverState.connectedClients.size
  })
})

// Nota: /api/workflows se maneja ahora por workflowsRoutes

app.get('/api/settings', (req, res) => {
  res.json({
    serverPort: PORT,
    frontendUrl: `http://localhost:${FRONTEND_PORT}`
  })
})

// API para inyectar spy en navegador
app.post('/api/spy/inject', async (req, res) => {
  try {
    const { processName, windowTitle, windowHandle, autoRestart } = req.body

    console.log('[Spy Inject] Intentando inyectar:', { processName, windowTitle, autoRestart })

    const result = await injectSpyInBrowser(processName, windowTitle, { autoRestart })

    res.json(result)
  } catch (error) {
    console.error('[Spy Inject] Error:', error.message)
    res.status(500).json({ success: false, error: error.message })
  }
})

// API para reiniciar Chrome con debugging y luego inyectar
app.post('/api/spy/restart-chrome', async (req, res) => {
  try {
    const { windowTitle } = req.body

    console.log('[Spy] Reiniciando Chrome con debugging...')

    const result = await restartChromeAndInject(windowTitle)

    res.json(result)
  } catch (error) {
    console.error('[Spy Restart] Error:', error.message)
    res.status(500).json({ success: false, error: error.message })
  }
})

// API para obtener estado de Chrome debugging
app.get('/api/spy/chrome-status', async (req, res) => {
  try {
    const status = await getChromeDebugStatus()
    res.json({ success: true, ...status })
  } catch (error) {
    res.status(500).json({ success: false, error: error.message })
  }
})

// API para obtener pestañas de Chrome (si tiene debugging habilitado)
app.get('/api/spy/chrome-tabs', async (req, res) => {
  try {
    const debugPort = await findChromeDebugPort()

    if (!debugPort) {
      return res.json({
        success: false,
        tabs: [],
        error: 'Chrome no tiene depuración remota habilitada'
      })
    }

    const tabs = await getChromeTargets(debugPort)

    res.json({
      success: true,
      tabs: tabs.map(t => ({
        id: t.id,
        title: t.title,
        url: t.url
      })),
      debugPort
    })
  } catch (error) {
    res.status(500).json({ success: false, error: error.message })
  }
})

// API para obtener el bookmarklet
app.get('/api/spy/bookmarklet', (req, res) => {
  const serverUrl = req.query.serverUrl || 'http://localhost:4000'
  const bookmarklet = generateBookmarklet(serverUrl)

  res.json({
    success: true,
    bookmarklet,
    bookmarkletCode: decodeURI(bookmarklet),
    instructions: [
      '1. Crea un nuevo marcador en tu navegador',
      '2. En el campo URL, pega el código del bookmarklet',
      '3. Nombra el marcador como "Alqvimia Spy"',
      '4. Cuando quieras capturar elementos, haz clic en el marcador'
    ]
  })
})

// API para recibir elementos capturados desde spy-injector
app.post('/api/spy/element', (req, res) => {
  try {
    const { element, clientId } = req.body

    if (!element) {
      return res.status(400).json({ success: false, error: 'Elemento requerido' })
    }

    console.log('[Spy API] Elemento recibido:', element.tag, element.id || element.cssSelector?.substring(0, 30))

    // Broadcast a todos los clientes conectados
    io.emit('element-selected', {
      id: `element_${Date.now()}`,
      source: 'web',
      ...element,
      capturedAt: new Date().toISOString()
    })

    // También emitir como spy:element-captured
    io.emit('spy:element-captured', {
      id: `element_${Date.now()}`,
      source: 'web',
      ...element,
      capturedAt: new Date().toISOString()
    })

    res.json({ success: true, message: 'Elemento recibido' })
  } catch (error) {
    console.error('[Spy API] Error:', error.message)
    res.status(500).json({ success: false, error: error.message })
  }
})

// ============================================================
// API para Tracking Nativo (Python) - Overlay y detección UI
// ============================================================

// Iniciar el servicio de tracking
app.post('/api/tracking/start', async (req, res) => {
  try {
    const { targetHandle } = req.body

    console.log('[Tracking] Iniciando servicio de tracking...', { targetHandle })

    // Iniciar el servicio Python si no está corriendo
    if (!trackingService.isRunning) {
      await trackingService.start()
    }

    // Iniciar tracking
    const result = trackingService.startTracking(targetHandle || null)

    res.json({ success: true, ...result })
  } catch (error) {
    console.error('[Tracking] Error iniciando:', error.message)
    res.status(500).json({ success: false, error: error.message })
  }
})

// Detener el servicio de tracking
app.post('/api/tracking/stop', (req, res) => {
  try {
    trackingService.stopTracking()
    res.json({ success: true, message: 'Tracking detenido' })
  } catch (error) {
    res.status(500).json({ success: false, error: error.message })
  }
})

// Obtener estado actual del tracking
app.get('/api/tracking/status', (req, res) => {
  const status = trackingService.getStatus()
  res.json({ success: true, ...status })
})

// Obtener elemento en una posición
app.get('/api/tracking/element', async (req, res) => {
  try {
    const x = parseInt(req.query.x) || 0
    const y = parseInt(req.query.y) || 0

    const result = await trackingService.getElementAt(x, y)
    res.json(result)
  } catch (error) {
    res.status(500).json({ success: false, error: error.message })
  }
})

// Capturar elemento en una posición
app.post('/api/tracking/capture', async (req, res) => {
  try {
    const { x, y } = req.body

    const result = await trackingService.captureElement(x, y)
    res.json(result)
  } catch (error) {
    res.status(500).json({ success: false, error: error.message })
  }
})

// Obtener clics pendientes
app.get('/api/tracking/clicks', async (req, res) => {
  try {
    const clicks = await trackingService.getPendingClicks()
    res.json({ success: true, clicks })
  } catch (error) {
    res.status(500).json({ success: false, error: error.message, clicks: [] })
  }
})

// Establecer highlight manual
app.post('/api/tracking/highlight', (req, res) => {
  try {
    const { x, y, width, height, interactive } = req.body
    trackingService.setHighlight(x, y, width, height, interactive !== false)
    res.json({ success: true })
  } catch (error) {
    res.status(500).json({ success: false, error: error.message })
  }
})

// Limpiar highlight
app.post('/api/tracking/clear-highlight', (req, res) => {
  trackingService.clearHighlight()
  res.json({ success: true })
})

// API para obtener ventanas de Windows
app.get('/api/windows', async (req, res) => {
  try {
    // Usar script de archivo para evitar problemas de escape en PowerShell
    const scriptPath = path.join(__dirname, 'scripts', 'get-windows.ps1')

    const { stdout } = await execAsync(`powershell -ExecutionPolicy Bypass -File "${scriptPath}"`, {
      encoding: 'utf8',
      timeout: 15000
    })

    let windows = []
    if (stdout && stdout.trim()) {
      const parsed = JSON.parse(stdout)
      // Asegurar que siempre sea un array
      windows = Array.isArray(parsed) ? parsed : [parsed]

      // Mapear a formato consistente y filtrar ventanas del sistema
      windows = windows.map((w, index) => ({
        id: w.ProcessId || index + 1,
        title: w.Title || 'Sin título',
        processName: w.ProcessName || 'unknown',
        handle: w.Handle ? `0x${w.Handle.toString(16).toUpperCase()}` : '0x0',
        handleInt: w.Handle || 0,
        rect: w.Rect || null,
        type: categorizeWindow(w.ProcessName)
      })).filter(w => {
        // Filtrar ventanas del sistema y sin título
        if (!w.title || w.title === 'Sin título') return false
        const excludedProcesses = ['textinputhost', 'applicationframehost', 'shellexperiencehost', 'searchhost', 'startmenuexperiencehost']
        return !excludedProcesses.includes(w.processName.toLowerCase())
      })
    }

    res.json({ windows, success: true })
  } catch (error) {
    console.error('[API] Error obteniendo ventanas:', error.message)
    res.json({
      windows: [],
      success: false,
      error: error.message
    })
  }
})

// API para activar (poner en primer plano) una ventana de Windows
app.post('/api/windows/activate', async (req, res) => {
  try {
    const { processId, handle, handleInt: handleIntParam } = req.body

    if (!processId && !handle && !handleIntParam) {
      return res.json({ success: false, error: 'Se requiere processId o handle' })
    }

    // Usar script de archivo para evitar problemas de escape con here-strings
    const scriptPath = path.join(__dirname, 'scripts', 'activate-window.ps1')

    // Construir argumentos
    let args = []
    if (handleIntParam) {
      args.push(`-Handle ${handleIntParam}`)
    } else if (handle && handle !== '0x0') {
      const parsedHandle = parseInt(handle, 16)
      args.push(`-Handle ${parsedHandle}`)
    }
    if (processId) {
      args.push(`-ProcessId ${processId}`)
    }

    const { stdout } = await execAsync(
      `powershell -ExecutionPolicy Bypass -File "${scriptPath}" ${args.join(' ')}`,
      { encoding: 'utf8', timeout: 5000 }
    )

    let result = { success: false }
    try {
      result = JSON.parse(stdout.trim())
    } catch (e) {
      result.success = stdout.includes('true')
    }

    res.json({
      success: result.success,
      message: result.success ? 'Ventana activada' : 'No se pudo activar la ventana',
      handle: result.handle
    })
  } catch (error) {
    console.error('[API] Error activando ventana:', error.message)
    res.json({
      success: false,
      error: error.message
    })
  }
})

// Categorizar tipo de ventana
function categorizeWindow(processName) {
  const name = (processName || '').toLowerCase()

  // Excluir WebView2 (usado por apps como WhatsApp, Teams) - no es un navegador real
  if (name.includes('webview2') || name.includes('webview')) {
    return 'application'
  }

  // Navegadores reales
  if (['chrome', 'firefox', 'msedge', 'opera', 'brave', 'vivaldi', 'iexplore'].some(b => name.includes(b))) {
    return 'browser'
  }
  if (['code', 'devenv', 'idea', 'sublime', 'notepad', 'atom'].some(e => name.includes(e))) {
    return 'editor'
  }
  if (['explorer'].includes(name)) {
    return 'explorer'
  }
  if (['cmd', 'powershell', 'windowsterminal', 'conhost'].some(t => name.includes(t))) {
    return 'terminal'
  }
  if (['excel', 'winword', 'powerpnt', 'outlook'].some(o => name.includes(o))) {
    return 'office'
  }
  return 'application'
}

// ============================================================
// API para ejecución de acciones del sistema (Workflows RPA)
// ============================================================

// Ejecutar comando PowerShell
app.post('/api/system/powershell', async (req, res) => {
  try {
    const { script, timeout = 30000 } = req.body

    if (!script) {
      return res.status(400).json({ success: false, error: 'Script requerido' })
    }

    console.log('[System] Ejecutando PowerShell:', script.substring(0, 100) + '...')

    // Escapar comillas para PowerShell
    const escapedScript = script.replace(/"/g, '\\"')

    const { stdout, stderr } = await execAsync(
      `powershell -NoProfile -ExecutionPolicy Bypass -Command "${escapedScript}"`,
      { timeout, encoding: 'utf8' }
    )

    res.json({
      success: true,
      output: stdout?.trim() || '',
      error: stderr?.trim() || null
    })
  } catch (error) {
    console.error('[System] Error PowerShell:', error.message)
    res.status(500).json({
      success: false,
      error: error.message,
      output: null
    })
  }
})

// Ejecutar comando CMD
app.post('/api/system/cmd', async (req, res) => {
  try {
    const { command, timeout = 30000 } = req.body

    if (!command) {
      return res.status(400).json({ success: false, error: 'Comando requerido' })
    }

    console.log('[System] Ejecutando CMD:', command)

    const { stdout, stderr } = await execAsync(command, { timeout, encoding: 'utf8' })

    res.json({
      success: true,
      output: stdout?.trim() || '',
      error: stderr?.trim() || null
    })
  } catch (error) {
    console.error('[System] Error CMD:', error.message)
    res.status(500).json({
      success: false,
      error: error.message,
      output: null
    })
  }
})

// Abrir carpeta o archivo en Explorer
app.post('/api/system/open', async (req, res) => {
  try {
    const { path: targetPath, type = 'folder' } = req.body

    if (!targetPath) {
      return res.status(400).json({ success: false, error: 'Ruta requerida' })
    }

    console.log('[System] Abriendo:', targetPath)

    // En Windows, usar 'start' para abrir carpetas/archivos
    const command = type === 'folder'
      ? `explorer "${targetPath}"`
      : `start "" "${targetPath}"`

    await execAsync(command)

    res.json({ success: true, message: `Abierto: ${targetPath}` })
  } catch (error) {
    console.error('[System] Error abriendo:', error.message)
    res.status(500).json({ success: false, error: error.message })
  }
})

// Listar archivos de una carpeta
app.post('/api/system/list-files', async (req, res) => {
  try {
    const { path: folderPath, pattern = '*', recursive = false } = req.body

    if (!folderPath) {
      return res.status(400).json({ success: false, error: 'Ruta requerida' })
    }

    console.log('[System] Listando archivos en:', folderPath)

    const recursiveFlag = recursive ? '-Recurse' : ''
    const script = `Get-ChildItem -Path "${folderPath}" -Filter "${pattern}" ${recursiveFlag} | Select-Object Name, FullName, Length, LastWriteTime, @{Name='IsDirectory';Expression={$_.PSIsContainer}} | ConvertTo-Json -Compress`

    const { stdout } = await execAsync(
      `powershell -NoProfile -Command "${script.replace(/"/g, '\\"')}"`,
      { encoding: 'utf8', timeout: 30000 }
    )

    let files = []
    if (stdout && stdout.trim()) {
      const parsed = JSON.parse(stdout)
      files = Array.isArray(parsed) ? parsed : [parsed]
    }

    res.json({ success: true, files, count: files.length })
  } catch (error) {
    console.error('[System] Error listando archivos:', error.message)
    res.status(500).json({ success: false, error: error.message, files: [] })
  }
})

// Contar archivos en una carpeta
app.post('/api/system/count-files', async (req, res) => {
  try {
    const { path: folderPath, pattern = '*', recursive = false } = req.body

    if (!folderPath) {
      return res.status(400).json({ success: false, error: 'Ruta requerida' })
    }

    console.log('[System] Contando archivos en:', folderPath)

    const recursiveFlag = recursive ? '-Recurse' : ''
    const script = `(Get-ChildItem -Path "${folderPath}" -Filter "${pattern}" ${recursiveFlag} -File).Count`

    const { stdout } = await execAsync(
      `powershell -NoProfile -Command "${script}"`,
      { encoding: 'utf8', timeout: 30000 }
    )

    const count = parseInt(stdout?.trim() || '0', 10)

    res.json({ success: true, count })
  } catch (error) {
    console.error('[System] Error contando archivos:', error.message)
    res.status(500).json({ success: false, error: error.message, count: 0 })
  }
})

// Leer archivo de texto
app.post('/api/system/read-file', async (req, res) => {
  try {
    const { path: filePath, encoding = 'utf8' } = req.body

    if (!filePath) {
      return res.status(400).json({ success: false, error: 'Ruta requerida' })
    }

    console.log('[System] Leyendo archivo:', filePath)

    const script = `Get-Content -Path "${filePath}" -Raw`

    const { stdout } = await execAsync(
      `powershell -NoProfile -Command "${script}"`,
      { encoding: 'utf8', timeout: 30000 }
    )

    res.json({ success: true, content: stdout || '' })
  } catch (error) {
    console.error('[System] Error leyendo archivo:', error.message)
    res.status(500).json({ success: false, error: error.message, content: null })
  }
})

// Escribir archivo de texto
app.post('/api/system/write-file', async (req, res) => {
  try {
    const { path: filePath, content } = req.body

    if (!filePath) {
      return res.status(400).json({ success: false, error: 'Ruta requerida' })
    }

    console.log('[System] Escribiendo archivo:', filePath)

    const escapedContent = content.replace(/"/g, '`"').replace(/\$/g, '`$')
    const script = `Set-Content -Path "${filePath}" -Value "${escapedContent}"`

    await execAsync(
      `powershell -NoProfile -Command "${script}"`,
      { encoding: 'utf8', timeout: 30000 }
    )

    res.json({ success: true, message: `Archivo escrito: ${filePath}` })
  } catch (error) {
    console.error('[System] Error escribiendo archivo:', error.message)
    res.status(500).json({ success: false, error: error.message })
  }
})

// Copiar archivo o carpeta
app.post('/api/system/copy', async (req, res) => {
  try {
    const { source, destination, recursive = true } = req.body

    if (!source || !destination) {
      return res.status(400).json({ success: false, error: 'Origen y destino requeridos' })
    }

    console.log('[System] Copiando:', source, '->', destination)

    const recursiveFlag = recursive ? '-Recurse' : ''
    const script = `Copy-Item -Path "${source}" -Destination "${destination}" ${recursiveFlag} -Force`

    await execAsync(
      `powershell -NoProfile -Command "${script}"`,
      { encoding: 'utf8', timeout: 60000 }
    )

    res.json({ success: true, message: `Copiado: ${source} -> ${destination}` })
  } catch (error) {
    console.error('[System] Error copiando:', error.message)
    res.status(500).json({ success: false, error: error.message })
  }
})

// Eliminar archivo o carpeta
app.post('/api/system/delete', async (req, res) => {
  try {
    const { path: targetPath, recursive = true } = req.body

    if (!targetPath) {
      return res.status(400).json({ success: false, error: 'Ruta requerida' })
    }

    console.log('[System] Eliminando:', targetPath)

    const recursiveFlag = recursive ? '-Recurse' : ''
    const script = `Remove-Item -Path "${targetPath}" ${recursiveFlag} -Force`

    await execAsync(
      `powershell -NoProfile -Command "${script}"`,
      { encoding: 'utf8', timeout: 30000 }
    )

    res.json({ success: true, message: `Eliminado: ${targetPath}` })
  } catch (error) {
    console.error('[System] Error eliminando:', error.message)
    res.status(500).json({ success: false, error: error.message })
  }
})

// ============================================================
// DIÁLOGOS NATIVOS DE WINDOWS (Para selección de carpetas/archivos)
// ============================================================

// Mostrar diálogo para seleccionar carpeta
app.post('/api/system/select-folder', async (req, res) => {
  try {
    const { title = 'Seleccione una carpeta', initialDirectory = '' } = req.body

    console.log('[System] Mostrando diálogo de selección de carpeta...')

    // PowerShell script para mostrar FolderBrowserDialog
    const script = `
      Add-Type -AssemblyName System.Windows.Forms
      $dialog = New-Object System.Windows.Forms.FolderBrowserDialog
      $dialog.Description = '${title.replace(/'/g, "''")}'
      $dialog.ShowNewFolderButton = $true
      ${initialDirectory ? `$dialog.SelectedPath = '${initialDirectory.replace(/'/g, "''")}'` : ''}
      $result = $dialog.ShowDialog()
      if ($result -eq [System.Windows.Forms.DialogResult]::OK) {
        Write-Output $dialog.SelectedPath
      } else {
        Write-Output ''
      }
    `

    const { stdout } = await execAsync(
      `powershell -NoProfile -Command "${script.replace(/\n/g, ' ').replace(/"/g, '\\"')}"`,
      { encoding: 'utf8', timeout: 120000 } // 2 minutos para que el usuario seleccione
    )

    const selectedPath = stdout?.trim() || ''

    if (selectedPath) {
      console.log('[System] Carpeta seleccionada:', selectedPath)
      res.json({ success: true, path: selectedPath, cancelled: false })
    } else {
      console.log('[System] Selección de carpeta cancelada')
      res.json({ success: true, path: '', cancelled: true })
    }
  } catch (error) {
    console.error('[System] Error en diálogo de carpeta:', error.message)
    res.status(500).json({ success: false, error: error.message, path: '' })
  }
})

// Mostrar diálogo para seleccionar archivo
app.post('/api/system/select-file', async (req, res) => {
  try {
    const {
      title = 'Seleccione un archivo',
      filter = 'Todos los archivos (*.*)|*.*',
      initialDirectory = '',
      multiSelect = false
    } = req.body

    console.log('[System] Mostrando diálogo de selección de archivo...')

    // PowerShell script para mostrar OpenFileDialog
    const script = `
      Add-Type -AssemblyName System.Windows.Forms
      $dialog = New-Object System.Windows.Forms.OpenFileDialog
      $dialog.Title = '${title.replace(/'/g, "''")}'
      $dialog.Filter = '${filter.replace(/'/g, "''")}'
      $dialog.Multiselect = $${multiSelect}
      ${initialDirectory ? `$dialog.InitialDirectory = '${initialDirectory.replace(/'/g, "''")}'` : ''}
      $result = $dialog.ShowDialog()
      if ($result -eq [System.Windows.Forms.DialogResult]::OK) {
        if ($${multiSelect}) {
          Write-Output ($dialog.FileNames -join '|')
        } else {
          Write-Output $dialog.FileName
        }
      } else {
        Write-Output ''
      }
    `

    const { stdout } = await execAsync(
      `powershell -NoProfile -Command "${script.replace(/\n/g, ' ').replace(/"/g, '\\"')}"`,
      { encoding: 'utf8', timeout: 120000 }
    )

    const selectedPath = stdout?.trim() || ''

    if (selectedPath) {
      const files = multiSelect ? selectedPath.split('|') : [selectedPath]
      console.log('[System] Archivo(s) seleccionado(s):', files)
      res.json({
        success: true,
        path: multiSelect ? files : selectedPath,
        cancelled: false
      })
    } else {
      console.log('[System] Selección de archivo cancelada')
      res.json({ success: true, path: multiSelect ? [] : '', cancelled: true })
    }
  } catch (error) {
    console.error('[System] Error en diálogo de archivo:', error.message)
    res.status(500).json({ success: false, error: error.message, path: '' })
  }
})

// Mostrar diálogo para guardar archivo
app.post('/api/system/save-file-dialog', async (req, res) => {
  try {
    const {
      title = 'Guardar archivo',
      filter = 'Todos los archivos (*.*)|*.*',
      initialDirectory = '',
      defaultFileName = ''
    } = req.body

    console.log('[System] Mostrando diálogo de guardar archivo...')

    const script = `
      Add-Type -AssemblyName System.Windows.Forms
      $dialog = New-Object System.Windows.Forms.SaveFileDialog
      $dialog.Title = '${title.replace(/'/g, "''")}'
      $dialog.Filter = '${filter.replace(/'/g, "''")}'
      ${initialDirectory ? `$dialog.InitialDirectory = '${initialDirectory.replace(/'/g, "''")}'` : ''}
      ${defaultFileName ? `$dialog.FileName = '${defaultFileName.replace(/'/g, "''")}'` : ''}
      $result = $dialog.ShowDialog()
      if ($result -eq [System.Windows.Forms.DialogResult]::OK) {
        Write-Output $dialog.FileName
      } else {
        Write-Output ''
      }
    `

    const { stdout } = await execAsync(
      `powershell -NoProfile -Command "${script.replace(/\n/g, ' ').replace(/"/g, '\\"')}"`,
      { encoding: 'utf8', timeout: 120000 }
    )

    const selectedPath = stdout?.trim() || ''

    if (selectedPath) {
      console.log('[System] Ruta de guardado:', selectedPath)
      res.json({ success: true, path: selectedPath, cancelled: false })
    } else {
      console.log('[System] Diálogo de guardar cancelado')
      res.json({ success: true, path: '', cancelled: true })
    }
  } catch (error) {
    console.error('[System] Error en diálogo de guardar:', error.message)
    res.status(500).json({ success: false, error: error.message, path: '' })
  }
})

// Mostrar MessageBox nativo de Windows
app.post('/api/system/message-box', async (req, res) => {
  try {
    const {
      title = 'Mensaje',
      message = '',
      type = 'info', // info, warning, error, question
      buttons = 'ok' // ok, okcancel, yesno, yesnocancel
    } = req.body

    console.log('[System] Mostrando MessageBox:', title)

    // Mapear tipo a icono
    const iconMap = {
      'info': 'Information',
      'warning': 'Warning',
      'error': 'Error',
      'question': 'Question'
    }

    // Mapear botones
    const buttonMap = {
      'ok': 'OK',
      'okcancel': 'OKCancel',
      'yesno': 'YesNo',
      'yesnocancel': 'YesNoCancel'
    }

    const icon = iconMap[type] || 'Information'
    const btns = buttonMap[buttons] || 'OK'

    const script = `
      Add-Type -AssemblyName System.Windows.Forms
      $result = [System.Windows.Forms.MessageBox]::Show(
        '${message.replace(/'/g, "''")}',
        '${title.replace(/'/g, "''")}',
        [System.Windows.Forms.MessageBoxButtons]::${btns},
        [System.Windows.Forms.MessageBoxIcon]::${icon}
      )
      Write-Output $result.ToString()
    `

    const { stdout } = await execAsync(
      `powershell -NoProfile -Command "${script.replace(/\n/g, ' ').replace(/"/g, '\\"')}"`,
      { encoding: 'utf8', timeout: 300000 } // 5 minutos para esperar respuesta
    )

    const result = stdout?.trim()?.toLowerCase() || 'ok'
    console.log('[System] Respuesta MessageBox:', result)

    res.json({
      success: true,
      result,
      isYes: result === 'yes',
      isNo: result === 'no',
      isOk: result === 'ok',
      isCancel: result === 'cancel'
    })
  } catch (error) {
    console.error('[System] Error en MessageBox:', error.message)
    res.status(500).json({ success: false, error: error.message, result: 'error' })
  }
})

// Mostrar Input Dialog nativo
app.post('/api/system/input-dialog', async (req, res) => {
  try {
    const {
      title = 'Ingrese un valor',
      message = '',
      defaultValue = ''
    } = req.body

    console.log('[System] Mostrando Input Dialog:', title)

    const script = `
      Add-Type -AssemblyName Microsoft.VisualBasic
      $result = [Microsoft.VisualBasic.Interaction]::InputBox(
        '${message.replace(/'/g, "''")}',
        '${title.replace(/'/g, "''")}',
        '${defaultValue.replace(/'/g, "''")}'
      )
      Write-Output $result
    `

    const { stdout } = await execAsync(
      `powershell -NoProfile -Command "${script.replace(/\n/g, ' ').replace(/"/g, '\\"')}"`,
      { encoding: 'utf8', timeout: 300000 }
    )

    const value = stdout?.trim() || ''
    console.log('[System] Valor ingresado:', value ? '(valor recibido)' : '(cancelado)')

    res.json({
      success: true,
      value,
      cancelled: value === ''
    })
  } catch (error) {
    console.error('[System] Error en Input Dialog:', error.message)
    res.status(500).json({ success: false, error: error.message, value: '' })
  }
})

// Obtener información del sistema
app.get('/api/system/info', async (req, res) => {
  try {
    const script = `
      @{
        ComputerName = $env:COMPUTERNAME
        UserName = $env:USERNAME
        OSVersion = [System.Environment]::OSVersion.VersionString
        ProcessorCount = [System.Environment]::ProcessorCount
        TotalMemoryMB = [math]::Round((Get-CimInstance Win32_ComputerSystem).TotalPhysicalMemory / 1MB)
        CurrentDirectory = Get-Location | Select-Object -ExpandProperty Path
      } | ConvertTo-Json
    `

    const { stdout } = await execAsync(
      `powershell -NoProfile -Command "${script.replace(/\n/g, ' ')}"`,
      { encoding: 'utf8', timeout: 10000 }
    )

    const info = JSON.parse(stdout)
    res.json({ success: true, ...info })
  } catch (error) {
    console.error('[System] Error obteniendo info:', error.message)
    res.status(500).json({ success: false, error: error.message })
  }
})

// Conectar eventos del tracking service con Socket.IO
trackingService.on('hover', (data) => {
  io.emit('tracking:hover', data)
})

trackingService.on('click', (data) => {
  io.emit('tracking:click', data)
  // También emitir como elemento capturado para compatibilidad
  if (data.element) {
    io.emit('element-selected', {
      id: `element_${Date.now()}`,
      source: 'native',
      ...data.element,
      clickType: data.clickType,
      x: data.x,
      y: data.y,
      capturedAt: data.timestamp
    })
  }
})

trackingService.on('element_captured', (element) => {
  io.emit('tracking:element-captured', { success: true, element })
})

// Función de inicio del servidor
async function startServer() {
  // Intentar conectar a la base de datos
  const dbConnected = await initDatabase()

  httpServer.listen(PORT, async () => {
    console.log('')
    console.log('========================================')
    console.log('   Alqvimia 2.0 - Backend Server')
    console.log('========================================')
    console.log(`   Puerto: ${PORT}`)
    console.log(`   Socket.IO: Activo`)
    console.log(`   API REST: http://localhost:${PORT}/api`)
    console.log(`   MySQL: ${dbConnected ? 'Conectado' : 'No disponible'}`)
    console.log('========================================')
    console.log('')
  })
}

// Iniciar servidor
startServer().catch(error => {
  console.error('Error al iniciar el servidor:', error)
  process.exit(1)
})
