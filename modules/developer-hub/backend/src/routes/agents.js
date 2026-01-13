/**
 * Developer Hub - Agents Routes
 * Gestión de agentes de IA en desarrollo
 */

import express from 'express'
import { v4 as uuidv4 } from 'uuid'

const router = express.Router()

// Mock agents
let agents = [
  {
    id: 'agent_001',
    name: 'Sales Assistant',
    description: 'Asistente de ventas con IA',
    type: 'conversational',
    model: 'gpt-4',
    projectId: 'proj_001',
    version: '1.0.0',
    status: 'active',
    environment: 'dev',
    createdBy: 'dev_001',
    createdAt: new Date('2024-03-01'),
    updatedAt: new Date('2024-12-20'),
    config: {
      temperature: 0.7,
      maxTokens: 2048,
      systemPrompt: 'Eres un asistente de ventas profesional...',
      tools: ['search_products', 'check_inventory', 'create_quote']
    },
    mcpServers: ['mcp_database', 'mcp_erp'],
    metrics: {
      totalConversations: 1250,
      avgResponseTime: 1200,
      satisfactionScore: 4.5
    },
    deployedVersions: {
      dev: '1.0.0',
      qa: '0.9.0'
    }
  },
  {
    id: 'agent_002',
    name: 'Invoice Processor',
    description: 'Agente para procesamiento de facturas',
    type: 'task',
    model: 'gpt-4-vision',
    projectId: 'proj_002',
    version: '2.1.0',
    status: 'active',
    environment: 'qa',
    createdBy: 'dev_002',
    createdAt: new Date('2024-05-15'),
    updatedAt: new Date('2024-12-18'),
    config: {
      temperature: 0.3,
      maxTokens: 4096,
      systemPrompt: 'Procesa facturas y extrae datos estructurados...',
      tools: ['ocr_extract', 'validate_vendor', 'create_entry']
    },
    mcpServers: ['mcp_storage', 'mcp_accounting'],
    metrics: {
      totalProcessed: 5230,
      avgProcessingTime: 8500,
      accuracy: 0.97
    },
    deployedVersions: {
      dev: '2.1.0',
      qa: '2.1.0'
    }
  },
  {
    id: 'agent_003',
    name: 'Support Bot',
    description: 'Bot de soporte técnico',
    type: 'conversational',
    model: 'claude-3-sonnet',
    projectId: 'proj_002',
    version: '1.5.0',
    status: 'draft',
    environment: 'dev',
    createdBy: 'dev_002',
    createdAt: new Date('2024-08-10'),
    updatedAt: new Date('2024-12-15'),
    config: {
      temperature: 0.5,
      maxTokens: 2048,
      systemPrompt: 'Eres un agente de soporte técnico...',
      tools: ['search_kb', 'create_ticket', 'escalate']
    },
    mcpServers: ['mcp_knowledge_base'],
    metrics: {
      totalConversations: 0,
      avgResponseTime: 0,
      satisfactionScore: 0
    },
    deployedVersions: {}
  }
]

// GET /api/agents - Listar agentes
router.get('/', (req, res) => {
  const { projectId, environment, status, type, search } = req.query
  let filtered = [...agents]

  if (projectId) {
    filtered = filtered.filter(a => a.projectId === projectId)
  }

  if (environment) {
    filtered = filtered.filter(a => a.environment === environment)
  }

  if (status) {
    filtered = filtered.filter(a => a.status === status)
  }

  if (type) {
    filtered = filtered.filter(a => a.type === type)
  }

  if (search) {
    const searchLower = search.toLowerCase()
    filtered = filtered.filter(a =>
      a.name.toLowerCase().includes(searchLower) ||
      a.description.toLowerCase().includes(searchLower)
    )
  }

  res.json({
    agents: filtered,
    total: filtered.length
  })
})

// GET /api/agents/:id - Obtener agente
router.get('/:id', (req, res) => {
  const agent = agents.find(a => a.id === req.params.id)

  if (!agent) {
    return res.status(404).json({ error: 'Agente no encontrado' })
  }

  res.json(agent)
})

// POST /api/agents - Crear agente
router.post('/', (req, res) => {
  const { name, description, type, model, projectId, config, mcpServers } = req.body

  if (!name || !projectId || !model) {
    return res.status(400).json({ error: 'Nombre, projectId y model son requeridos' })
  }

  const newAgent = {
    id: `agent_${uuidv4().slice(0, 8)}`,
    name,
    description: description || '',
    type: type || 'conversational',
    model,
    projectId,
    version: '0.1.0',
    status: 'draft',
    environment: 'dev',
    createdBy: req.user.id,
    createdAt: new Date(),
    updatedAt: new Date(),
    config: config || {
      temperature: 0.7,
      maxTokens: 2048,
      systemPrompt: '',
      tools: []
    },
    mcpServers: mcpServers || [],
    metrics: {
      totalConversations: 0,
      avgResponseTime: 0,
      satisfactionScore: 0
    },
    deployedVersions: {}
  }

  agents.push(newAgent)
  res.status(201).json(newAgent)
})

// PUT /api/agents/:id - Actualizar agente
router.put('/:id', (req, res) => {
  const index = agents.findIndex(a => a.id === req.params.id)

  if (index === -1) {
    return res.status(404).json({ error: 'Agente no encontrado' })
  }

  const { name, description, model, status, config, mcpServers } = req.body

  agents[index] = {
    ...agents[index],
    name: name || agents[index].name,
    description: description !== undefined ? description : agents[index].description,
    model: model || agents[index].model,
    status: status || agents[index].status,
    config: config || agents[index].config,
    mcpServers: mcpServers || agents[index].mcpServers,
    updatedAt: new Date()
  }

  res.json(agents[index])
})

// PUT /api/agents/:id/config - Actualizar configuración
router.put('/:id/config', (req, res) => {
  const agent = agents.find(a => a.id === req.params.id)

  if (!agent) {
    return res.status(404).json({ error: 'Agente no encontrado' })
  }

  const { temperature, maxTokens, systemPrompt, tools } = req.body

  agent.config = {
    ...agent.config,
    temperature: temperature !== undefined ? temperature : agent.config.temperature,
    maxTokens: maxTokens !== undefined ? maxTokens : agent.config.maxTokens,
    systemPrompt: systemPrompt !== undefined ? systemPrompt : agent.config.systemPrompt,
    tools: tools || agent.config.tools
  }
  agent.updatedAt = new Date()

  res.json(agent)
})

// DELETE /api/agents/:id - Eliminar agente
router.delete('/:id', (req, res) => {
  const index = agents.findIndex(a => a.id === req.params.id)

  if (index === -1) {
    return res.status(404).json({ error: 'Agente no encontrado' })
  }

  // Verificar que no esté en producción
  if (agents[index].deployedVersions.prod) {
    return res.status(400).json({
      error: 'No se puede eliminar un agente desplegado en producción'
    })
  }

  agents.splice(index, 1)
  res.json({ success: true, message: 'Agente eliminado' })
})

// POST /api/agents/:id/test - Probar agente
router.post('/:id/test', async (req, res) => {
  const agent = agents.find(a => a.id === req.params.id)

  if (!agent) {
    return res.status(404).json({ error: 'Agente no encontrado' })
  }

  const { message, context } = req.body

  // Mock response
  const startTime = Date.now()

  // Simular delay de respuesta
  await new Promise(resolve => setTimeout(resolve, 500))

  const response = {
    agentId: agent.id,
    input: message,
    output: `[Mock Response from ${agent.name}] Procesando: "${message}"`,
    responseTime: Date.now() - startTime,
    tokensUsed: {
      prompt: 150,
      completion: 75,
      total: 225
    },
    toolsUsed: [],
    timestamp: new Date()
  }

  res.json(response)
})

// GET /api/agents/:id/conversations - Historial de conversaciones
router.get('/:id/conversations', (req, res) => {
  const agent = agents.find(a => a.id === req.params.id)

  if (!agent) {
    return res.status(404).json({ error: 'Agente no encontrado' })
  }

  // Mock conversations
  const conversations = [
    {
      id: 'conv_001',
      agentId: agent.id,
      userId: 'user_123',
      messages: 12,
      startTime: new Date('2024-12-20T10:00:00'),
      endTime: new Date('2024-12-20T10:15:00'),
      satisfaction: 5,
      resolved: true
    },
    {
      id: 'conv_002',
      agentId: agent.id,
      userId: 'user_456',
      messages: 8,
      startTime: new Date('2024-12-20T09:30:00'),
      endTime: new Date('2024-12-20T09:40:00'),
      satisfaction: 4,
      resolved: true
    }
  ]

  res.json({
    conversations,
    total: conversations.length
  })
})

// POST /api/agents/:id/version - Crear nueva versión
router.post('/:id/version', (req, res) => {
  const agent = agents.find(a => a.id === req.params.id)

  if (!agent) {
    return res.status(404).json({ error: 'Agente no encontrado' })
  }

  const { type } = req.body
  const [major, minor, patch] = agent.version.split('.').map(Number)

  let newVersion
  switch (type) {
    case 'major':
      newVersion = `${major + 1}.0.0`
      break
    case 'minor':
      newVersion = `${major}.${minor + 1}.0`
      break
    case 'patch':
    default:
      newVersion = `${major}.${minor}.${patch + 1}`
  }

  agent.version = newVersion
  agent.updatedAt = new Date()

  res.json({
    success: true,
    version: newVersion,
    agent
  })
})

// GET /api/agents/models/available - Modelos disponibles
router.get('/models/available', (req, res) => {
  const models = [
    { id: 'gpt-4', name: 'GPT-4', provider: 'OpenAI', capabilities: ['text', 'code'] },
    { id: 'gpt-4-vision', name: 'GPT-4 Vision', provider: 'OpenAI', capabilities: ['text', 'code', 'vision'] },
    { id: 'gpt-3.5-turbo', name: 'GPT-3.5 Turbo', provider: 'OpenAI', capabilities: ['text', 'code'] },
    { id: 'claude-3-opus', name: 'Claude 3 Opus', provider: 'Anthropic', capabilities: ['text', 'code', 'vision'] },
    { id: 'claude-3-sonnet', name: 'Claude 3 Sonnet', provider: 'Anthropic', capabilities: ['text', 'code', 'vision'] },
    { id: 'claude-3-haiku', name: 'Claude 3 Haiku', provider: 'Anthropic', capabilities: ['text', 'code'] },
    { id: 'gemini-pro', name: 'Gemini Pro', provider: 'Google', capabilities: ['text', 'code'] },
    { id: 'gemini-pro-vision', name: 'Gemini Pro Vision', provider: 'Google', capabilities: ['text', 'code', 'vision'] }
  ]

  res.json(models)
})

export default router
