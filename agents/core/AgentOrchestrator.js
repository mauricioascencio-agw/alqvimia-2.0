/**
 * ALQVIMIA RPA 2.0 - Agent Orchestrator
 * Orquestador central para gestión y comunicación entre agentes
 */

import express from 'express'
import http from 'http'
import { Server as SocketIO } from 'socket.io'
import cors from 'cors'
import { spawn, exec } from 'child_process'
import path from 'path'
import fs from 'fs'

class AgentOrchestrator {
  constructor(config = {}) {
    this.port = config.port || 4000
    this.agentsDir = config.agentsDir || path.join(process.cwd(), 'agents')

    // Registro de agentes
    this.agents = new Map() // id -> agent info
    this.processes = new Map() // id -> child process
    this.sockets = new Map() // id -> socket

    // Cola de mensajes entre agentes
    this.messageQueue = []

    // Express app
    this.app = express()
    this.server = null
    this.io = null

    this.setupMiddleware()
    this.setupRoutes()
  }

  /**
   * Configurar middleware
   */
  setupMiddleware() {
    this.app.use(cors())
    this.app.use(express.json())
  }

  /**
   * Configurar rutas REST
   */
  setupRoutes() {
    // === GESTIÓN DE AGENTES ===

    // Listar todos los agentes disponibles
    this.app.get('/api/agents', (req, res) => {
      const agents = Array.from(this.agents.values())
      res.json({
        success: true,
        data: agents.map(a => ({
          ...a,
          process: undefined,
          socket: undefined
        }))
      })
    })

    // Obtener información de un agente
    this.app.get('/api/agents/:id', (req, res) => {
      const agent = this.agents.get(req.params.id)
      if (!agent) {
        return res.status(404).json({ success: false, error: 'Agent not found' })
      }
      res.json({ success: true, data: agent })
    })

    // Instalar un agente
    this.app.post('/api/agents/:id/install', async (req, res) => {
      try {
        const result = await this.installAgent(req.params.id, req.body)
        res.json({ success: true, data: result })
      } catch (error) {
        res.status(500).json({ success: false, error: error.message })
      }
    })

    // Desinstalar un agente
    this.app.delete('/api/agents/:id', async (req, res) => {
      try {
        await this.uninstallAgent(req.params.id)
        res.json({ success: true, message: 'Agent uninstalled' })
      } catch (error) {
        res.status(500).json({ success: false, error: error.message })
      }
    })

    // Iniciar un agente
    this.app.post('/api/agents/:id/start', async (req, res) => {
      try {
        await this.startAgent(req.params.id)
        res.json({ success: true, message: 'Agent started' })
      } catch (error) {
        res.status(500).json({ success: false, error: error.message })
      }
    })

    // Detener un agente
    this.app.post('/api/agents/:id/stop', async (req, res) => {
      try {
        await this.stopAgent(req.params.id)
        res.json({ success: true, message: 'Agent stopped' })
      } catch (error) {
        res.status(500).json({ success: false, error: error.message })
      }
    })

    // Reiniciar un agente
    this.app.post('/api/agents/:id/restart', async (req, res) => {
      try {
        await this.restartAgent(req.params.id)
        res.json({ success: true, message: 'Agent restarted' })
      } catch (error) {
        res.status(500).json({ success: false, error: error.message })
      }
    })

    // Actualizar configuración de un agente
    this.app.put('/api/agents/:id/config', async (req, res) => {
      try {
        const result = await this.updateAgentConfig(req.params.id, req.body)
        res.json({ success: true, data: result })
      } catch (error) {
        res.status(500).json({ success: false, error: error.message })
      }
    })

    // === COMUNICACIÓN ENTRE AGENTES ===

    // Enviar mensaje a un agente
    this.app.post('/api/agents/:id/message', async (req, res) => {
      try {
        const result = await this.sendToAgent(req.params.id, req.body)
        res.json({ success: true, data: result })
      } catch (error) {
        res.status(500).json({ success: false, error: error.message })
      }
    })

    // Ejecutar acción en un agente
    this.app.post('/api/agents/:id/execute', async (req, res) => {
      try {
        const { action, params } = req.body
        const result = await this.executeOnAgent(req.params.id, action, params)
        res.json({ success: true, data: result })
      } catch (error) {
        res.status(500).json({ success: false, error: error.message })
      }
    })

    // Broadcast a todos los agentes
    this.app.post('/api/broadcast', async (req, res) => {
      try {
        const results = await this.broadcastToAll(req.body)
        res.json({ success: true, data: results })
      } catch (error) {
        res.status(500).json({ success: false, error: error.message })
      }
    })

    // === WORKFLOWS ===

    // Ejecutar workflow entre agentes
    this.app.post('/api/workflow/execute', async (req, res) => {
      try {
        const { steps } = req.body
        const result = await this.executeWorkflow(steps)
        res.json({ success: true, data: result })
      } catch (error) {
        res.status(500).json({ success: false, error: error.message })
      }
    })

    // === MÉTRICAS Y MONITOREO ===

    // Obtener métricas de todos los agentes
    this.app.get('/api/metrics', async (req, res) => {
      try {
        const metrics = await this.getAllMetrics()
        res.json({ success: true, data: metrics })
      } catch (error) {
        res.status(500).json({ success: false, error: error.message })
      }
    })

    // Health check global
    this.app.get('/api/health', async (req, res) => {
      const health = await this.getGlobalHealth()
      res.json({
        success: true,
        data: health
      })
    })

    // === CATÁLOGO ===

    // Obtener catálogo de agentes disponibles para descargar
    this.app.get('/api/catalog', (req, res) => {
      res.json({
        success: true,
        data: this.getAgentCatalog()
      })
    })
  }

  /**
   * Configurar Socket.IO handlers
   */
  setupSocketHandlers() {
    this.io.on('connection', (socket) => {
      console.log(`[Orchestrator] Connection: ${socket.id}`)

      // Registro de agente
      socket.on('register', (agentInfo) => {
        this.registerAgent(socket, agentInfo)
      })

      // Desconexión
      socket.on('disconnect', () => {
        this.handleDisconnect(socket)
      })

      // Mensaje de agente a agente
      socket.on('agent-message', async (data, callback) => {
        try {
          const result = await this.routeAgentMessage(data)
          callback({ success: true, result })
        } catch (error) {
          callback({ success: false, error: error.message })
        }
      })

      // Evento de agente
      socket.on('agent-event', (data) => {
        this.handleAgentEvent(socket, data)
      })

      // Log de agente
      socket.on('agent-log', (data) => {
        this.handleAgentLog(socket, data)
      })
    })
  }

  /**
   * Registrar agente conectado
   */
  registerAgent(socket, agentInfo) {
    const agent = {
      ...agentInfo,
      socketId: socket.id,
      status: 'running',
      connectedAt: new Date().toISOString()
    }

    this.agents.set(agent.id, agent)
    this.sockets.set(agent.id, socket)

    console.log(`[Orchestrator] Agent registered: ${agent.name} (${agent.id})`)

    // Notificar a todos los clientes
    this.io.emit('agent-connected', agent)

    // Asociar socket con agente
    socket.agentId = agent.id
  }

  /**
   * Manejar desconexión de agente
   */
  handleDisconnect(socket) {
    if (socket.agentId) {
      const agent = this.agents.get(socket.agentId)
      if (agent) {
        agent.status = 'disconnected'
        agent.disconnectedAt = new Date().toISOString()

        console.log(`[Orchestrator] Agent disconnected: ${agent.name}`)

        // Notificar a todos los clientes
        this.io.emit('agent-disconnected', { id: agent.id, name: agent.name })
      }

      this.sockets.delete(socket.agentId)
    }
  }

  /**
   * Instalar un agente
   */
  async installAgent(agentId, options = {}) {
    console.log(`[Orchestrator] Installing agent: ${agentId}`)

    const agentPath = path.join(this.agentsDir, agentId)

    // Crear directorio si no existe
    if (!fs.existsSync(agentPath)) {
      fs.mkdirSync(agentPath, { recursive: true })
    }

    // En producción, aquí se descargaría el agente del registry
    // Por ahora, simulamos la instalación

    const agentInfo = {
      id: agentId,
      name: options.name || agentId,
      version: options.version || '1.0.0',
      path: agentPath,
      installed: true,
      installedAt: new Date().toISOString(),
      status: 'installed'
    }

    this.agents.set(agentId, agentInfo)

    return agentInfo
  }

  /**
   * Desinstalar un agente
   */
  async uninstallAgent(agentId) {
    // Detener si está corriendo
    if (this.processes.has(agentId)) {
      await this.stopAgent(agentId)
    }

    const agent = this.agents.get(agentId)
    if (agent && agent.path) {
      // Eliminar archivos (en producción)
      // fs.rmSync(agent.path, { recursive: true })
    }

    this.agents.delete(agentId)
    console.log(`[Orchestrator] Agent uninstalled: ${agentId}`)
  }

  /**
   * Iniciar un agente
   */
  async startAgent(agentId) {
    const agent = this.agents.get(agentId)
    if (!agent) {
      throw new Error(`Agent ${agentId} not found`)
    }

    if (this.processes.has(agentId)) {
      throw new Error(`Agent ${agentId} is already running`)
    }

    console.log(`[Orchestrator] Starting agent: ${agentId}`)

    // Determinar la ruta del script del agente
    const agentScript = path.join(this.agentsDir, agentId, 'index.js')

    // Spawn proceso
    const proc = spawn('node', [agentScript], {
      cwd: path.join(this.agentsDir, agentId),
      env: {
        ...process.env,
        ORCHESTRATOR_URL: `http://localhost:${this.port}`,
        AGENT_ID: agentId
      },
      stdio: ['pipe', 'pipe', 'pipe']
    })

    // Manejar output
    proc.stdout.on('data', (data) => {
      console.log(`[${agentId}] ${data.toString().trim()}`)
    })

    proc.stderr.on('data', (data) => {
      console.error(`[${agentId}] ERROR: ${data.toString().trim()}`)
    })

    proc.on('exit', (code) => {
      console.log(`[${agentId}] Process exited with code ${code}`)
      this.processes.delete(agentId)
      const agent = this.agents.get(agentId)
      if (agent) {
        agent.status = 'stopped'
      }
    })

    this.processes.set(agentId, proc)
    agent.status = 'starting'
    agent.pid = proc.pid
  }

  /**
   * Detener un agente
   */
  async stopAgent(agentId) {
    const proc = this.processes.get(agentId)
    if (!proc) {
      throw new Error(`Agent ${agentId} is not running`)
    }

    console.log(`[Orchestrator] Stopping agent: ${agentId}`)

    // Intentar shutdown graceful vía socket
    const socket = this.sockets.get(agentId)
    if (socket) {
      socket.emit('shutdown')
      await new Promise(r => setTimeout(r, 2000))
    }

    // Forzar kill si sigue corriendo
    if (this.processes.has(agentId)) {
      proc.kill('SIGTERM')
    }

    this.processes.delete(agentId)
    const agent = this.agents.get(agentId)
    if (agent) {
      agent.status = 'stopped'
    }
  }

  /**
   * Reiniciar un agente
   */
  async restartAgent(agentId) {
    await this.stopAgent(agentId)
    await new Promise(r => setTimeout(r, 1000))
    await this.startAgent(agentId)
  }

  /**
   * Actualizar configuración de un agente
   */
  async updateAgentConfig(agentId, config) {
    const socket = this.sockets.get(agentId)
    if (!socket) {
      throw new Error(`Agent ${agentId} is not connected`)
    }

    return new Promise((resolve, reject) => {
      socket.emit('command', { command: 'config', config }, (response) => {
        if (response.success) {
          resolve(response.result)
        } else {
          reject(new Error(response.error))
        }
      })
    })
  }

  /**
   * Enviar mensaje a un agente específico
   */
  async sendToAgent(agentId, message) {
    const socket = this.sockets.get(agentId)
    if (!socket) {
      throw new Error(`Agent ${agentId} is not connected`)
    }

    return new Promise((resolve, reject) => {
      socket.emit('message', message, (response) => {
        if (response.success) {
          resolve(response.result)
        } else {
          reject(new Error(response.error))
        }
      })
    })
  }

  /**
   * Ejecutar acción en un agente
   */
  async executeOnAgent(agentId, action, params) {
    const socket = this.sockets.get(agentId)
    if (!socket) {
      throw new Error(`Agent ${agentId} is not connected`)
    }

    return new Promise((resolve, reject) => {
      socket.emit('execute', { action, params }, (response) => {
        if (response.success) {
          resolve(response.result)
        } else {
          reject(new Error(response.error))
        }
      })
    })
  }

  /**
   * Broadcast a todos los agentes
   */
  async broadcastToAll(message) {
    const results = {}

    for (const [agentId, socket] of this.sockets) {
      try {
        results[agentId] = await new Promise((resolve) => {
          socket.emit('message', message, (response) => {
            resolve(response)
          })
        })
      } catch (error) {
        results[agentId] = { success: false, error: error.message }
      }
    }

    return results
  }

  /**
   * Ejecutar workflow entre agentes
   */
  async executeWorkflow(steps) {
    const results = []
    let context = {}

    for (const step of steps) {
      try {
        const result = await this.executeOnAgent(step.agentId, step.action, {
          ...step.params,
          context
        })

        results.push({
          step: step.name,
          agentId: step.agentId,
          action: step.action,
          success: true,
          result
        })

        // Actualizar contexto con el resultado
        if (step.outputVar) {
          context[step.outputVar] = result
        }
      } catch (error) {
        results.push({
          step: step.name,
          agentId: step.agentId,
          action: step.action,
          success: false,
          error: error.message
        })

        // Detener workflow en caso de error (configurable)
        if (step.stopOnError !== false) {
          break
        }
      }
    }

    return { results, context }
  }

  /**
   * Rutear mensaje entre agentes
   */
  async routeAgentMessage(data) {
    const { from, to, message } = data

    console.log(`[Orchestrator] Routing message from ${from} to ${to}`)

    return await this.sendToAgent(to, {
      from,
      ...message
    })
  }

  /**
   * Manejar evento de agente
   */
  handleAgentEvent(socket, data) {
    const agentId = socket.agentId

    // Broadcast evento a todos los clientes web
    this.io.emit('agent-event', {
      agentId,
      ...data
    })
  }

  /**
   * Manejar log de agente
   */
  handleAgentLog(socket, data) {
    const agentId = socket.agentId

    // Broadcast log a todos los clientes web
    this.io.emit('agent-log', {
      agentId,
      ...data
    })
  }

  /**
   * Obtener métricas de todos los agentes
   */
  async getAllMetrics() {
    const metrics = {}

    for (const [agentId, socket] of this.sockets) {
      try {
        metrics[agentId] = await new Promise((resolve) => {
          socket.emit('command', { command: 'status' }, (response) => {
            resolve(response.success ? response.result : { error: response.error })
          })
        })
      } catch (error) {
        metrics[agentId] = { error: error.message }
      }
    }

    return metrics
  }

  /**
   * Obtener estado de salud global
   */
  async getGlobalHealth() {
    const agents = Array.from(this.agents.values())

    return {
      orchestrator: {
        status: 'running',
        uptime: process.uptime(),
        memory: process.memoryUsage()
      },
      agents: {
        total: agents.length,
        running: agents.filter(a => a.status === 'running').length,
        stopped: agents.filter(a => a.status === 'stopped').length,
        error: agents.filter(a => a.status === 'error').length
      },
      connections: this.sockets.size
    }
  }

  /**
   * Obtener catálogo de agentes
   */
  getAgentCatalog() {
    // En producción, esto vendría de un registry remoto
    return [
      { id: 'agent-mysql', name: 'MySQL Agent', category: 'database', version: '1.2.0' },
      { id: 'agent-postgresql', name: 'PostgreSQL Agent', category: 'database', version: '1.1.5' },
      { id: 'agent-rest', name: 'REST API Agent', category: 'api', version: '2.0.0' },
      { id: 'agent-whatsapp', name: 'WhatsApp Agent', category: 'messaging', version: '2.1.0' },
      { id: 'agent-openai', name: 'OpenAI GPT Agent', category: 'ai', version: '2.0.0' },
      { id: 'agent-scheduler', name: 'Task Scheduler', category: 'automation', version: '1.8.0' }
    ]
  }

  /**
   * Iniciar el orquestador
   */
  async start() {
    this.server = http.createServer(this.app)
    this.io = new SocketIO(this.server, {
      cors: {
        origin: '*',
        methods: ['GET', 'POST']
      }
    })

    this.setupSocketHandlers()

    return new Promise((resolve) => {
      this.server.listen(this.port, () => {
        console.log(`[Orchestrator] Running on port ${this.port}`)
        resolve()
      })
    })
  }

  /**
   * Detener el orquestador
   */
  async stop() {
    // Detener todos los agentes
    for (const agentId of this.processes.keys()) {
      await this.stopAgent(agentId)
    }

    // Cerrar servidor
    if (this.server) {
      await new Promise((resolve) => {
        this.server.close(resolve)
      })
    }

    console.log('[Orchestrator] Stopped')
  }
}

export default AgentOrchestrator

// Si se ejecuta directamente
if (process.argv[1].includes('AgentOrchestrator')) {
  const orchestrator = new AgentOrchestrator()
  orchestrator.start()
}
