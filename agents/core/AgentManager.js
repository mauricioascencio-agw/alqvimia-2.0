/**
 * ALQVIMIA RPA 2.0 - Agent Manager
 * Servicio central para gestión del ciclo de vida de agentes
 * Descarga, instalación, configuración, inicio y parada de agentes
 */

import { EventEmitter } from 'events'
import express from 'express'
import { createServer } from 'http'
import { Server as SocketServer } from 'socket.io'
import { spawn, exec } from 'child_process'
import fs from 'fs/promises'
import path from 'path'
import axios from 'axios'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

class AgentManager extends EventEmitter {
  constructor(config = {}) {
    super()

    this.port = config.port || 4000
    this.agentsDir = config.agentsDir || path.join(__dirname, '..')
    this.installDir = config.installDir || path.join(__dirname, '..', 'installed')
    this.logsDir = config.logsDir || path.join(__dirname, '..', 'logs')
    this.configDir = config.configDir || path.join(__dirname, '..', 'config')

    // Registro de agentes
    this.registry = new Map()

    // Agentes en ejecución (procesos)
    this.runningAgents = new Map()

    // Catálogo de agentes disponibles
    this.catalog = []

    // Express app
    this.app = express()
    this.app.use(express.json())

    // HTTP server
    this.server = createServer(this.app)

    // Socket.IO
    this.io = new SocketServer(this.server, {
      cors: { origin: '*' }
    })

    // Configurar rutas
    this.setupRoutes()
    this.setupSocketHandlers()
  }

  /**
   * Inicializar el Manager
   */
  async initialize() {
    // Crear directorios necesarios
    await this.ensureDirectories()

    // Cargar catálogo de agentes
    await this.loadCatalog()

    // Cargar configuraciones guardadas
    await this.loadAgentConfigs()

    // Descubrir agentes instalados
    await this.discoverAgents()
  }

  /**
   * Asegurar que existan los directorios necesarios
   */
  async ensureDirectories() {
    const dirs = [this.installDir, this.logsDir, this.configDir]
    for (const dir of dirs) {
      try {
        await fs.mkdir(dir, { recursive: true })
      } catch (error) {
        // Ignorar si ya existe
      }
    }
  }

  /**
   * Cargar catálogo de agentes disponibles
   */
  async loadCatalog() {
    this.catalog = [
      // Database Agents
      {
        id: 'agent-mysql',
        name: 'MySQL Agent',
        category: 'database',
        version: '1.2.0',
        description: 'Agente para conexión, queries y gestión de bases de datos MySQL/MariaDB',
        file: 'database/MySQLAgent.js',
        defaultPort: 4101,
        dependencies: ['mysql2'],
        configSchema: {
          host: { type: 'string', default: 'localhost' },
          dbPort: { type: 'number', default: 3306 },
          user: { type: 'string', default: 'root' },
          password: { type: 'string', secret: true },
          database: { type: 'string' }
        }
      },
      {
        id: 'agent-postgresql',
        name: 'PostgreSQL Agent',
        category: 'database',
        version: '1.1.5',
        file: 'database/PostgreSQLAgent.js',
        defaultPort: 4102,
        dependencies: ['pg'],
        configSchema: {
          host: { type: 'string', default: 'localhost' },
          dbPort: { type: 'number', default: 5432 },
          user: { type: 'string', default: 'postgres' },
          password: { type: 'string', secret: true },
          database: { type: 'string' }
        }
      },

      // API Agents
      {
        id: 'agent-rest',
        name: 'REST API Agent',
        category: 'api',
        version: '2.0.0',
        description: 'Cliente HTTP completo con soporte para OAuth, rate limiting y retry',
        file: 'api/RESTAPIAgent.js',
        defaultPort: 4201,
        dependencies: ['axios'],
        configSchema: {
          timeout: { type: 'number', default: 30000 },
          cacheEnabled: { type: 'boolean', default: true },
          cacheTTL: { type: 'number', default: 300000 }
        }
      },

      // Messaging Agents
      {
        id: 'agent-whatsapp',
        name: 'WhatsApp Business Agent',
        category: 'messaging',
        version: '2.1.0',
        description: 'Integración completa con WhatsApp Business API',
        file: 'messaging/WhatsAppAgent.js',
        defaultPort: 4301,
        dependencies: ['axios'],
        configSchema: {
          phoneNumberId: { type: 'string', required: true },
          accessToken: { type: 'string', secret: true, required: true },
          businessAccountId: { type: 'string' },
          webhookVerifyToken: { type: 'string' }
        }
      },
      {
        id: 'agent-email',
        name: 'Email Agent',
        category: 'messaging',
        version: '1.4.0',
        file: 'messaging/EmailAgent.js',
        defaultPort: 4302,
        dependencies: ['nodemailer', 'imap'],
        configSchema: {
          smtpHost: { type: 'string' },
          smtpPort: { type: 'number', default: 587 },
          smtpUser: { type: 'string' },
          smtpPassword: { type: 'string', secret: true },
          imapHost: { type: 'string' },
          imapPort: { type: 'number', default: 993 }
        }
      }
    ]
  }

  /**
   * Cargar configuraciones de agentes guardadas
   */
  async loadAgentConfigs() {
    try {
      const configFile = path.join(this.configDir, 'agents.json')
      const data = await fs.readFile(configFile, 'utf-8')
      const configs = JSON.parse(data)

      for (const [id, config] of Object.entries(configs)) {
        this.registry.set(id, config)
      }
    } catch (error) {
      // No hay configuración guardada, usar defaults
    }
  }

  /**
   * Guardar configuraciones de agentes
   */
  async saveAgentConfigs() {
    const configFile = path.join(this.configDir, 'agents.json')
    const configs = Object.fromEntries(this.registry)
    await fs.writeFile(configFile, JSON.stringify(configs, null, 2))
  }

  /**
   * Descubrir agentes instalados
   */
  async discoverAgents() {
    for (const agent of this.catalog) {
      const agentPath = path.join(this.agentsDir, agent.file)
      try {
        await fs.access(agentPath)
        // El agente existe, registrarlo
        if (!this.registry.has(agent.id)) {
          this.registry.set(agent.id, {
            ...agent,
            installed: true,
            running: false,
            config: {},
            installedAt: new Date().toISOString()
          })
        }
      } catch {
        // Agente no instalado
        if (!this.registry.has(agent.id)) {
          this.registry.set(agent.id, {
            ...agent,
            installed: false,
            running: false
          })
        }
      }
    }
  }

  /**
   * Configurar rutas HTTP
   */
  setupRoutes() {
    // Listar todos los agentes
    this.app.get('/api/agents', (req, res) => {
      const agents = Array.from(this.registry.values()).map(agent => ({
        ...agent,
        running: this.runningAgents.has(agent.id)
      }))
      res.json({ success: true, data: agents })
    })

    // Obtener agente específico
    this.app.get('/api/agents/:id', (req, res) => {
      const agent = this.registry.get(req.params.id)
      if (agent) {
        res.json({
          success: true,
          data: {
            ...agent,
            running: this.runningAgents.has(agent.id)
          }
        })
      } else {
        res.status(404).json({ success: false, error: 'Agent not found' })
      }
    })

    // Instalar agente
    this.app.post('/api/agents/:id/install', async (req, res) => {
      try {
        const result = await this.installAgent(req.params.id)
        res.json({ success: true, data: result })
      } catch (error) {
        res.status(400).json({ success: false, error: error.message })
      }
    })

    // Desinstalar agente
    this.app.post('/api/agents/:id/uninstall', async (req, res) => {
      try {
        await this.uninstallAgent(req.params.id)
        res.json({ success: true })
      } catch (error) {
        res.status(400).json({ success: false, error: error.message })
      }
    })

    // Configurar agente
    this.app.post('/api/agents/:id/configure', async (req, res) => {
      try {
        await this.configureAgent(req.params.id, req.body)
        res.json({ success: true })
      } catch (error) {
        res.status(400).json({ success: false, error: error.message })
      }
    })

    // Iniciar agente
    this.app.post('/api/agents/:id/start', async (req, res) => {
      try {
        const result = await this.startAgent(req.params.id)
        res.json({ success: true, data: result })
      } catch (error) {
        res.status(400).json({ success: false, error: error.message })
      }
    })

    // Detener agente
    this.app.post('/api/agents/:id/stop', async (req, res) => {
      try {
        await this.stopAgent(req.params.id)
        res.json({ success: true })
      } catch (error) {
        res.status(400).json({ success: false, error: error.message })
      }
    })

    // Reiniciar agente
    this.app.post('/api/agents/:id/restart', async (req, res) => {
      try {
        await this.stopAgent(req.params.id)
        await new Promise(r => setTimeout(r, 1000))
        const result = await this.startAgent(req.params.id)
        res.json({ success: true, data: result })
      } catch (error) {
        res.status(400).json({ success: false, error: error.message })
      }
    })

    // Obtener logs de un agente
    this.app.get('/api/agents/:id/logs', async (req, res) => {
      try {
        const { lines = 100 } = req.query
        const logs = await this.getAgentLogs(req.params.id, parseInt(lines))
        res.json({ success: true, data: logs })
      } catch (error) {
        res.status(400).json({ success: false, error: error.message })
      }
    })

    // Health check de un agente
    this.app.get('/api/agents/:id/health', async (req, res) => {
      try {
        const health = await this.checkAgentHealth(req.params.id)
        res.json({ success: true, data: health })
      } catch (error) {
        res.status(400).json({ success: false, error: error.message })
      }
    })

    // Ejecutar acción en un agente
    this.app.post('/api/agents/:id/execute', async (req, res) => {
      try {
        const { action, params } = req.body
        const result = await this.executeAgentAction(req.params.id, action, params)
        res.json({ success: true, data: result })
      } catch (error) {
        res.status(400).json({ success: false, error: error.message })
      }
    })

    // Iniciar todos los agentes configurados como auto-start
    this.app.post('/api/agents/start-all', async (req, res) => {
      try {
        const results = await this.startAllAgents()
        res.json({ success: true, data: results })
      } catch (error) {
        res.status(400).json({ success: false, error: error.message })
      }
    })

    // Detener todos los agentes
    this.app.post('/api/agents/stop-all', async (req, res) => {
      try {
        await this.stopAllAgents()
        res.json({ success: true })
      } catch (error) {
        res.status(400).json({ success: false, error: error.message })
      }
    })

    // Catálogo de agentes disponibles
    this.app.get('/api/catalog', (req, res) => {
      res.json({ success: true, data: this.catalog })
    })

    // Health check del manager
    this.app.get('/health', (req, res) => {
      res.json({
        status: 'healthy',
        uptime: process.uptime(),
        agents: {
          total: this.registry.size,
          running: this.runningAgents.size
        }
      })
    })
  }

  /**
   * Configurar handlers de Socket.IO
   */
  setupSocketHandlers() {
    this.io.on('connection', (socket) => {
      console.log(`Client connected: ${socket.id}`)

      // Unirse a sala de manager
      socket.join('manager')

      // Listar agentes
      socket.on('list-agents', (callback) => {
        const agents = Array.from(this.registry.values()).map(a => ({
          ...a,
          running: this.runningAgents.has(a.id)
        }))
        callback({ success: true, data: agents })
      })

      // Iniciar agente
      socket.on('start-agent', async (agentId, callback) => {
        try {
          const result = await this.startAgent(agentId)
          callback({ success: true, data: result })
        } catch (error) {
          callback({ success: false, error: error.message })
        }
      })

      // Detener agente
      socket.on('stop-agent', async (agentId, callback) => {
        try {
          await this.stopAgent(agentId)
          callback({ success: true })
        } catch (error) {
          callback({ success: false, error: error.message })
        }
      })

      socket.on('disconnect', () => {
        console.log(`Client disconnected: ${socket.id}`)
      })
    })
  }

  /**
   * Instalar un agente
   */
  async installAgent(agentId) {
    const catalogAgent = this.catalog.find(a => a.id === agentId)
    if (!catalogAgent) {
      throw new Error(`Agent ${agentId} not found in catalog`)
    }

    // Verificar que existe el archivo
    const agentPath = path.join(this.agentsDir, catalogAgent.file)
    try {
      await fs.access(agentPath)
    } catch {
      throw new Error(`Agent file not found: ${catalogAgent.file}`)
    }

    // Instalar dependencias si es necesario
    if (catalogAgent.dependencies && catalogAgent.dependencies.length > 0) {
      await this.installDependencies(catalogAgent.dependencies)
    }

    // Registrar agente como instalado
    const agentInfo = {
      ...catalogAgent,
      installed: true,
      running: false,
      config: {},
      installedAt: new Date().toISOString()
    }

    this.registry.set(agentId, agentInfo)
    await this.saveAgentConfigs()

    this.emit('agent:installed', agentId)
    this.io.to('manager').emit('agent:installed', agentInfo)

    return agentInfo
  }

  /**
   * Instalar dependencias npm
   */
  async installDependencies(deps) {
    return new Promise((resolve, reject) => {
      const depsString = deps.join(' ')
      exec(`npm install ${depsString}`, { cwd: this.agentsDir }, (error, stdout, stderr) => {
        if (error) {
          reject(new Error(`Failed to install dependencies: ${error.message}`))
        } else {
          resolve(stdout)
        }
      })
    })
  }

  /**
   * Desinstalar un agente
   */
  async uninstallAgent(agentId) {
    // Detener si está corriendo
    if (this.runningAgents.has(agentId)) {
      await this.stopAgent(agentId)
    }

    // Marcar como no instalado
    const agent = this.registry.get(agentId)
    if (agent) {
      agent.installed = false
      agent.config = {}
      delete agent.installedAt
      await this.saveAgentConfigs()
    }

    this.emit('agent:uninstalled', agentId)
    this.io.to('manager').emit('agent:uninstalled', agentId)
  }

  /**
   * Configurar un agente
   */
  async configureAgent(agentId, config) {
    const agent = this.registry.get(agentId)
    if (!agent) {
      throw new Error(`Agent ${agentId} not found`)
    }

    agent.config = { ...agent.config, ...config }
    await this.saveAgentConfigs()

    this.emit('agent:configured', agentId, config)
    this.io.to('manager').emit('agent:configured', { id: agentId, config })
  }

  /**
   * Iniciar un agente
   */
  async startAgent(agentId) {
    const agent = this.registry.get(agentId)
    if (!agent) {
      throw new Error(`Agent ${agentId} not found`)
    }

    if (!agent.installed) {
      throw new Error(`Agent ${agentId} is not installed`)
    }

    if (this.runningAgents.has(agentId)) {
      throw new Error(`Agent ${agentId} is already running`)
    }

    const agentPath = path.join(this.agentsDir, agent.file)
    const logFile = path.join(this.logsDir, `${agentId}.log`)

    // Preparar variables de entorno con la configuración
    const env = { ...process.env }
    if (agent.config) {
      for (const [key, value] of Object.entries(agent.config)) {
        env[`AGENT_${key.toUpperCase()}`] = String(value)
      }
    }
    env.AGENT_PORT = agent.config?.port || agent.defaultPort

    // Iniciar proceso
    const agentProcess = spawn('node', [agentPath], {
      env,
      stdio: ['ignore', 'pipe', 'pipe'],
      detached: false
    })

    // Abrir archivo de log
    const logStream = await fs.open(logFile, 'a')

    // Capturar salida
    agentProcess.stdout.on('data', (data) => {
      logStream.write(data)
      this.io.to('manager').emit('agent:log', { id: agentId, data: data.toString() })
    })

    agentProcess.stderr.on('data', (data) => {
      logStream.write(data)
      this.io.to('manager').emit('agent:error', { id: agentId, data: data.toString() })
    })

    agentProcess.on('close', (code) => {
      logStream.close()
      this.runningAgents.delete(agentId)
      agent.running = false

      this.emit('agent:stopped', agentId, code)
      this.io.to('manager').emit('agent:stopped', { id: agentId, code })

      console.log(`Agent ${agentId} exited with code ${code}`)
    })

    agentProcess.on('error', (error) => {
      console.error(`Agent ${agentId} error:`, error)
      this.io.to('manager').emit('agent:error', { id: agentId, error: error.message })
    })

    // Registrar proceso
    this.runningAgents.set(agentId, {
      process: agentProcess,
      port: env.AGENT_PORT,
      startedAt: new Date().toISOString()
    })

    agent.running = true

    this.emit('agent:started', agentId)
    this.io.to('manager').emit('agent:started', {
      id: agentId,
      port: env.AGENT_PORT,
      pid: agentProcess.pid
    })

    return {
      id: agentId,
      port: env.AGENT_PORT,
      pid: agentProcess.pid
    }
  }

  /**
   * Detener un agente
   */
  async stopAgent(agentId) {
    const running = this.runningAgents.get(agentId)
    if (!running) {
      throw new Error(`Agent ${agentId} is not running`)
    }

    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        // Forzar kill si no responde
        running.process.kill('SIGKILL')
      }, 5000)

      running.process.on('close', () => {
        clearTimeout(timeout)
        resolve()
      })

      // Enviar señal de terminación
      running.process.kill('SIGTERM')
    })
  }

  /**
   * Iniciar todos los agentes con autostart
   */
  async startAllAgents() {
    const results = []

    for (const [id, agent] of this.registry) {
      if (agent.installed && agent.config?.autoStart) {
        try {
          const result = await this.startAgent(id)
          results.push({ id, success: true, ...result })
        } catch (error) {
          results.push({ id, success: false, error: error.message })
        }
      }
    }

    return results
  }

  /**
   * Detener todos los agentes
   */
  async stopAllAgents() {
    const promises = []

    for (const [id] of this.runningAgents) {
      promises.push(
        this.stopAgent(id).catch(error => ({
          id,
          error: error.message
        }))
      )
    }

    await Promise.all(promises)
  }

  /**
   * Obtener logs de un agente
   */
  async getAgentLogs(agentId, lines = 100) {
    const logFile = path.join(this.logsDir, `${agentId}.log`)

    try {
      const content = await fs.readFile(logFile, 'utf-8')
      const allLines = content.split('\n')
      return allLines.slice(-lines)
    } catch {
      return []
    }
  }

  /**
   * Verificar salud de un agente
   */
  async checkAgentHealth(agentId) {
    const running = this.runningAgents.get(agentId)
    if (!running) {
      return { status: 'stopped' }
    }

    try {
      const response = await axios.get(`http://localhost:${running.port}/health`, {
        timeout: 5000
      })
      return {
        status: 'healthy',
        port: running.port,
        ...response.data
      }
    } catch {
      return {
        status: 'unhealthy',
        port: running.port
      }
    }
  }

  /**
   * Ejecutar acción en un agente
   */
  async executeAgentAction(agentId, action, params) {
    const running = this.runningAgents.get(agentId)
    if (!running) {
      throw new Error(`Agent ${agentId} is not running`)
    }

    const response = await axios.post(
      `http://localhost:${running.port}/execute`,
      { action, params },
      { timeout: 30000 }
    )

    return response.data
  }

  /**
   * Iniciar el manager
   */
  async start() {
    await this.initialize()

    return new Promise((resolve) => {
      this.server.listen(this.port, () => {
        console.log(`Agent Manager running on port ${this.port}`)
        this.emit('started')
        resolve()
      })
    })
  }

  /**
   * Detener el manager
   */
  async stop() {
    // Detener todos los agentes
    await this.stopAllAgents()

    // Cerrar servidor
    return new Promise((resolve) => {
      this.server.close(() => {
        console.log('Agent Manager stopped')
        this.emit('stopped')
        resolve()
      })
    })
  }
}

export default AgentManager

// Si se ejecuta directamente
const isMainModule = process.argv[1]?.includes('AgentManager')
if (isMainModule) {
  const manager = new AgentManager({
    port: parseInt(process.env.AGENT_MANAGER_PORT) || 4000
  })

  manager.start().catch(console.error)

  // Graceful shutdown
  process.on('SIGINT', async () => {
    console.log('\nShutting down Agent Manager...')
    await manager.stop()
    process.exit(0)
  })
}
