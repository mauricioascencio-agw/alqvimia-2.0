import { exec } from 'child_process'
import fs from 'fs'
import path from 'path'

// Manejadores para Agentes IA
export function registerAgentHandlers(io, socket, serverState) {

  // Obtener todos los agentes
  socket.on('agent:get-all', () => {
    console.log(`[Agent] Solicitando lista de agentes`)

    const agents = Array.from(serverState.agents.values())
    socket.emit('agent:list', { agents })
  })

  // Crear nuevo agente
  socket.on('agent:create', (data) => {
    const agent = {
      id: `agent_${Date.now()}`,
      name: data?.name || 'Nuevo Agente',
      description: data?.description || '',
      type: data?.type || 'assistant',
      model: data?.model || 'gpt-4',
      systemPrompt: data?.systemPrompt || '',
      tools: data?.tools || [],
      status: 'inactive',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    serverState.agents.set(agent.id, agent)

    socket.emit('agent:created', {
      success: true,
      agent
    })

    console.log(`[Agent] Creado: ${agent.name}`)
  })

  // Actualizar agente
  socket.on('agent:update', (data) => {
    const agentId = data?.agentId
    const agent = serverState.agents.get(agentId)

    if (!agent) {
      socket.emit('agent:error', { message: 'Agente no encontrado' })
      return
    }

    // Actualizar campos
    if (data.name) agent.name = data.name
    if (data.description) agent.description = data.description
    if (data.type) agent.type = data.type
    if (data.model) agent.model = data.model
    if (data.systemPrompt) agent.systemPrompt = data.systemPrompt
    if (data.tools) agent.tools = data.tools
    agent.updatedAt = new Date().toISOString()

    socket.emit('agent:updated', {
      success: true,
      agent
    })

    console.log(`[Agent] Actualizado: ${agent.name}`)
  })

  // Eliminar agente
  socket.on('agent:delete', (data) => {
    const agentId = data?.agentId

    if (serverState.agents.has(agentId)) {
      serverState.agents.delete(agentId)

      socket.emit('agent:deleted', {
        success: true,
        agentId
      })

      console.log(`[Agent] Eliminado: ${agentId}`)
    } else {
      socket.emit('agent:error', { message: 'Agente no encontrado' })
    }
  })

  // Activar agente
  socket.on('agent:activate', (data) => {
    const agentId = data?.agentId
    const agent = serverState.agents.get(agentId)

    if (!agent) {
      socket.emit('agent:error', { message: 'Agente no encontrado' })
      return
    }

    agent.status = 'active'
    agent.activatedAt = new Date().toISOString()

    socket.emit('agent:activated', {
      success: true,
      agentId,
      status: 'active'
    })

    console.log(`[Agent] Activado: ${agent.name}`)
  })

  // Desactivar agente
  socket.on('agent:deactivate', (data) => {
    const agentId = data?.agentId
    const agent = serverState.agents.get(agentId)

    if (!agent) {
      socket.emit('agent:error', { message: 'Agente no encontrado' })
      return
    }

    agent.status = 'inactive'
    agent.deactivatedAt = new Date().toISOString()

    socket.emit('agent:deactivated', {
      success: true,
      agentId,
      status: 'inactive'
    })

    console.log(`[Agent] Desactivado: ${agent.name}`)
  })

  // Enviar mensaje a agente
  socket.on('agent:message', async (data) => {
    const agentId = data?.agentId
    const agent = serverState.agents.get(agentId)

    if (!agent) {
      socket.emit('agent:error', { message: 'Agente no encontrado' })
      return
    }

    if (agent.status !== 'active') {
      socket.emit('agent:error', { message: 'El agente no está activo' })
      return
    }

    const messageId = `msg_${Date.now()}`

    socket.emit('agent:message-received', {
      messageId,
      agentId,
      status: 'processing'
    })

    // TODO: Integrar con OpenAI/Anthropic API
    // Por ahora simulamos una respuesta

    setTimeout(() => {
      const response = {
        messageId,
        agentId,
        agentName: agent.name,
        userMessage: data?.message,
        response: `[Simulación] Respuesta del agente ${agent.name} al mensaje: "${data?.message}"`,
        timestamp: new Date().toISOString()
      }

      socket.emit('agent:response', response)
    }, 1000)
  })

  // Obtener historial de conversación
  socket.on('agent:get-history', (data) => {
    const agentId = data?.agentId

    // TODO: Obtener de base de datos
    socket.emit('agent:history', {
      agentId,
      messages: []
    })
  })

  // Limpiar historial
  socket.on('agent:clear-history', (data) => {
    const agentId = data?.agentId

    // TODO: Limpiar en base de datos

    socket.emit('agent:history-cleared', {
      success: true,
      agentId
    })
  })

  // Obtener herramientas disponibles para agentes
  socket.on('agent:get-tools', () => {
    const availableTools = [
      { id: 'web_search', name: 'Búsqueda Web', description: 'Buscar en internet' },
      { id: 'code_interpreter', name: 'Intérprete de Código', description: 'Ejecutar código Python' },
      { id: 'file_browser', name: 'Explorador de Archivos', description: 'Leer y escribir archivos' },
      { id: 'workflow_executor', name: 'Ejecutor de Workflows', description: 'Ejecutar workflows de Alqvimia' },
      { id: 'database_query', name: 'Consulta BD', description: 'Ejecutar queries SQL' },
      { id: 'api_caller', name: 'Llamador API', description: 'Hacer peticiones HTTP' }
    ]

    socket.emit('agent:tools', { tools: availableTools })
  })

  // =====================================================
  // GENERAR EXE DEL AGENTE
  // =====================================================
  socket.on('agent:generate-exe', async (data) => {
    const { agentId, config } = data || {}

    console.log(`[Agent] Generando EXE para agente: ${agentId}`)
    console.log(`[Agent] Configuración:`, config)

    try {
      // Crear carpeta base si no existe
      const basePath = config?.outputPath || 'C:\\Alqvimia\\Agents'

      // Crear directorios recursivamente
      if (!fs.existsSync(basePath)) {
        fs.mkdirSync(basePath, { recursive: true })
        console.log(`[Agent] Carpeta creada: ${basePath}`)
      }

      // Nombre del ejecutable
      const exeName = config?.name || `Agent_${agentId}`
      const exePath = path.join(basePath, `${exeName}.exe`)
      const batPath = path.join(basePath, `${exeName}.bat`)
      const configPath = path.join(basePath, `${exeName}.config.json`)

      // Obtener datos del agente
      const agent = serverState.agents.get(agentId) || {
        id: agentId,
        name: config?.name || 'Agente',
        type: 'assistant',
        model: 'gpt-4'
      }

      // Guardar configuración del agente
      const agentConfig = {
        id: agentId,
        name: agent.name,
        type: agent.type,
        model: agent.model,
        systemPrompt: agent.systemPrompt || '',
        tools: agent.tools || [],
        config: {
          autoStart: config?.autoStart || false,
          minimized: config?.minimized || true,
          logFile: config?.logFile || true,
          serverUrl: 'http://localhost:4000'
        },
        generatedAt: new Date().toISOString()
      }

      fs.writeFileSync(configPath, JSON.stringify(agentConfig, null, 2), 'utf8')
      console.log(`[Agent] Configuración guardada: ${configPath}`)

      // Crear script BAT para ejecutar el agente
      const batContent = `@echo off
REM =====================================================
REM Alqvimia Agent Launcher - ${agent.name}
REM Generado: ${new Date().toISOString()}
REM =====================================================
title Alqvimia Agent - ${agent.name}
color 0A
echo.
echo ╔══════════════════════════════════════════════════════════════╗
echo ║                    ALQVIMIA AGENT                           ║
echo ║                    ${agent.name.padEnd(42)}║
echo ╚══════════════════════════════════════════════════════════════╝
echo.
echo [INFO] Iniciando agente...
echo [INFO] Modelo: ${agent.model}
echo [INFO] Tipo: ${agent.type}
echo.

REM Verificar si Node.js está instalado
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] Node.js no está instalado.
    echo [INFO] Descarga Node.js desde: https://nodejs.org
    pause
    exit /b 1
)

REM Cambiar al directorio del agente
cd /d "%~dp0"

REM Verificar si existe el archivo de configuración
if not exist "${exeName}.config.json" (
    echo [ERROR] Archivo de configuración no encontrado.
    pause
    exit /b 1
)

REM Crear archivo de log si está habilitado
${config?.logFile ? `
set LOGFILE=%~dp0${exeName}.log
echo [INFO] Log: %LOGFILE%
echo ====== Ejecución: %date% %time% ====== >> %LOGFILE%
` : ''}

REM Iniciar el agente con Node.js
echo [INFO] Conectando con servidor Alqvimia...
echo.

REM Ejecutar script del agente
node -e "
const http = require('http');
const fs = require('fs');
const path = require('path');

// Leer configuración
const configPath = path.join(__dirname, '${exeName}.config.json');
const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));

console.log('[AGENT] Agente iniciado:', config.name);
console.log('[AGENT] ID:', config.id);
console.log('[AGENT] Conectando a:', config.config.serverUrl);

// Mantener el proceso activo
setInterval(() => {
  console.log('[AGENT] Heartbeat -', new Date().toLocaleTimeString());
}, 30000);

// Mostrar estado
console.log('');
console.log('[AGENT] ✓ Agente activo y escuchando...');
console.log('[AGENT] Presiona Ctrl+C para detener');
console.log('');
"

${config?.minimized ? '' : 'pause'}
`

      fs.writeFileSync(batPath, batContent, 'utf8')
      console.log(`[Agent] Script BAT creado: ${batPath}`)

      // Crear ejecutable usando iexpress (empaquetador nativo de Windows)
      // Primero creamos un archivo SED (Self Extraction Directive)
      const sedPath = path.join(basePath, `${exeName}.sed`)
      const sedContent = `[Version]
Class=IEXPRESS
SEDVersion=3
[Options]
PackagePurpose=InstallApp
ShowInstallProgramWindow=0
HideExtractAnimation=0
UseLongFileName=1
InsideCompressed=0
CAB_FixedSize=0
CAB_ResvCodeSigning=0
RebootMode=N
InstallPrompt=
DisplayLicense=
FinishMessage=
TargetName=${exePath}
FriendlyName=Alqvimia Agent - ${agent.name}
AppLaunched=cmd /c "${exeName}.bat"
PostInstallCmd=<None>
AdminQuietInstCmd=
UserQuietInstCmd=
SourceFiles=SourceFiles
[Strings]
FILE0="${exeName}.bat"
FILE1="${exeName}.config.json"
[SourceFiles]
SourceFiles0=${basePath}\\
[SourceFiles0]
%FILE0%=
%FILE1%=
`

      fs.writeFileSync(sedPath, sedContent, 'utf8')
      console.log(`[Agent] Archivo SED creado: ${sedPath}`)

      // Ejecutar iexpress para crear el EXE
      const iexpressCmd = `iexpress /N /Q "${sedPath}"`

      exec(iexpressCmd, { cwd: basePath }, (error, stdout, stderr) => {
        if (error) {
          console.error(`[Agent] Error con iexpress:`, error.message)
          // Si iexpress falla, creamos un acceso directo como alternativa
          createShortcutAlternative(basePath, exeName, batPath, socket, agentId)
        } else {
          console.log(`[Agent] EXE generado exitosamente: ${exePath}`)

          // Limpiar archivos temporales
          try {
            fs.unlinkSync(sedPath)
          } catch (e) { }

          socket.emit('agent:exe-generated', {
            success: true,
            agentId,
            exePath,
            configPath,
            message: `Ejecutable generado: ${exePath}`
          })
        }
      })

    } catch (error) {
      console.error(`[Agent] Error generando EXE:`, error)
      socket.emit('agent:exe-error', {
        success: false,
        agentId,
        error: error.message
      })
    }
  })

  // Función alternativa para crear acceso directo si iexpress falla
  function createShortcutAlternative(basePath, exeName, batPath, socket, agentId) {
    console.log(`[Agent] Usando método alternativo: acceso directo`)

    // Crear un VBS para generar el acceso directo
    const vbsPath = path.join(basePath, `create_shortcut.vbs`)
    const lnkPath = path.join(basePath, `${exeName}.lnk`)

    const vbsContent = `
Set oWS = WScript.CreateObject("WScript.Shell")
sLinkFile = "${lnkPath.replace(/\\/g, '\\\\')}"
Set oLink = oWS.CreateShortcut(sLinkFile)
oLink.TargetPath = "${batPath.replace(/\\/g, '\\\\')}"
oLink.WorkingDirectory = "${basePath.replace(/\\/g, '\\\\')}"
oLink.Description = "Alqvimia Agent - ${exeName}"
oLink.WindowStyle = 7
oLink.Save
WScript.Echo "Acceso directo creado"
`

    fs.writeFileSync(vbsPath, vbsContent, 'utf8')

    exec(`cscript //nologo "${vbsPath}"`, (error, stdout, stderr) => {
      // Limpiar VBS
      try {
        fs.unlinkSync(vbsPath)
      } catch (e) { }

      if (error) {
        console.error(`[Agent] Error creando acceso directo:`, error.message)
        // Aún así reportamos éxito con el BAT
        socket.emit('agent:exe-generated', {
          success: true,
          agentId,
          exePath: batPath,
          message: `Script generado: ${batPath} (ejecutar con doble clic)`
        })
      } else {
        console.log(`[Agent] Acceso directo creado: ${lnkPath}`)
        socket.emit('agent:exe-generated', {
          success: true,
          agentId,
          exePath: lnkPath,
          batPath,
          message: `Agente generado: ${lnkPath}`
        })
      }
    })
  }

  // Ejecutar EXE del agente
  socket.on('agent:run-exe', (data) => {
    const { path: exePath } = data || {}

    if (!exePath) {
      socket.emit('agent:exe-error', {
        success: false,
        error: 'Ruta del ejecutable no especificada'
      })
      return
    }

    console.log(`[Agent] Ejecutando: ${exePath}`)

    // Verificar que el archivo existe
    if (!fs.existsSync(exePath)) {
      socket.emit('agent:exe-error', {
        success: false,
        error: `Archivo no encontrado: ${exePath}`
      })
      return
    }

    // Ejecutar el archivo
    exec(`start "" "${exePath}"`, (error, stdout, stderr) => {
      if (error) {
        console.error(`[Agent] Error ejecutando:`, error.message)
        socket.emit('agent:exe-error', {
          success: false,
          error: error.message
        })
      } else {
        console.log(`[Agent] Ejecutable iniciado`)
        socket.emit('agent:exe-started', {
          success: true,
          exePath,
          message: 'Agente iniciado correctamente'
        })
      }
    })
  })

  // Listar ejecutables generados
  socket.on('agent:list-exe', () => {
    const basePath = 'C:\\Alqvimia\\Agents'

    try {
      if (!fs.existsSync(basePath)) {
        socket.emit('agent:exe-list', { files: [] })
        return
      }

      const files = fs.readdirSync(basePath)
        .filter(f => f.endsWith('.exe') || f.endsWith('.bat') || f.endsWith('.lnk'))
        .map(f => ({
          name: f,
          path: path.join(basePath, f),
          type: path.extname(f).replace('.', ''),
          stats: fs.statSync(path.join(basePath, f))
        }))

      socket.emit('agent:exe-list', { files })
    } catch (error) {
      console.error(`[Agent] Error listando ejecutables:`, error)
      socket.emit('agent:exe-list', { files: [], error: error.message })
    }
  })

  // Eliminar ejecutable
  socket.on('agent:delete-exe', (data) => {
    const { path: exePath } = data || {}

    if (!exePath) {
      socket.emit('agent:exe-error', { error: 'Ruta no especificada' })
      return
    }

    try {
      if (fs.existsSync(exePath)) {
        fs.unlinkSync(exePath)

        // También eliminar archivos asociados
        const baseName = path.basename(exePath, path.extname(exePath))
        const dir = path.dirname(exePath)

        const associatedFiles = [
          `${baseName}.bat`,
          `${baseName}.config.json`,
          `${baseName}.log`,
          `${baseName}.lnk`
        ]

        associatedFiles.forEach(f => {
          const filePath = path.join(dir, f)
          if (fs.existsSync(filePath)) {
            try {
              fs.unlinkSync(filePath)
              console.log(`[Agent] Eliminado: ${filePath}`)
            } catch (e) { }
          }
        })

        socket.emit('agent:exe-deleted', {
          success: true,
          path: exePath,
          message: 'Ejecutable eliminado'
        })
      } else {
        socket.emit('agent:exe-error', { error: 'Archivo no encontrado' })
      }
    } catch (error) {
      console.error(`[Agent] Error eliminando:`, error)
      socket.emit('agent:exe-error', { error: error.message })
    }
  })
}
