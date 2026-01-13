/**
 * Developer Hub - Execution Routes
 * Control de ejecución de workflows y agentes
 */

import express from 'express'
import { v4 as uuidv4 } from 'uuid'

const router = express.Router()

// Mock executions
let executions = []

// Mock queued jobs
let queue = []

// GET /api/execution/status - Estado general de ejecución
router.get('/status', (req, res) => {
  const { environment } = req.query

  let envExecutions = executions
  if (environment) {
    envExecutions = executions.filter(e => e.environment === environment)
  }

  const running = envExecutions.filter(e => e.status === 'running')
  const queued = queue.filter(q => !environment || q.environment === environment)

  res.json({
    running: running.length,
    queued: queued.length,
    completed24h: envExecutions.filter(e =>
      e.status === 'completed' &&
      new Date(e.endTime) > new Date(Date.now() - 24 * 60 * 60 * 1000)
    ).length,
    failed24h: envExecutions.filter(e =>
      e.status === 'failed' &&
      new Date(e.endTime) > new Date(Date.now() - 24 * 60 * 60 * 1000)
    ).length,
    runningJobs: running.map(e => ({
      id: e.id,
      type: e.type,
      name: e.name,
      startTime: e.startTime,
      environment: e.environment
    }))
  })
})

// POST /api/execution/workflow/:id - Ejecutar workflow
router.post('/workflow/:id', async (req, res) => {
  const workflowId = req.params.id
  const { environment, variables, async: isAsync } = req.body

  // Verificar permisos de ambiente
  if (!req.user.environments.includes(environment || 'dev')) {
    return res.status(403).json({
      error: `Sin permisos para ejecutar en ambiente ${environment || 'dev'}`
    })
  }

  const execution = {
    id: `exec_${uuidv4().slice(0, 8)}`,
    type: 'workflow',
    workflowId,
    name: `Workflow ${workflowId}`,
    status: 'running',
    environment: environment || 'dev',
    startTime: new Date(),
    endTime: null,
    triggeredBy: req.user.id,
    variables: variables || {},
    steps: [],
    logs: [],
    result: null
  }

  executions.push(execution)

  if (isAsync) {
    // Simular ejecución en background
    setTimeout(() => {
      const idx = executions.findIndex(e => e.id === execution.id)
      if (idx !== -1) {
        executions[idx].status = 'completed'
        executions[idx].endTime = new Date()
        executions[idx].result = { success: true, output: 'Workflow ejecutado correctamente' }
      }
    }, 5000)

    return res.json({
      executionId: execution.id,
      status: 'started',
      message: 'Ejecución iniciada en segundo plano'
    })
  }

  // Simular ejecución síncrona
  await new Promise(resolve => setTimeout(resolve, 2000))

  execution.status = 'completed'
  execution.endTime = new Date()
  execution.steps = [
    { id: 'step_1', name: 'Inicio', status: 'completed', duration: 100 },
    { id: 'step_2', name: 'Procesamiento', status: 'completed', duration: 1500 },
    { id: 'step_3', name: 'Finalización', status: 'completed', duration: 400 }
  ]
  execution.result = { success: true, output: 'Workflow ejecutado correctamente' }

  res.json(execution)
})

// POST /api/execution/agent/:id - Ejecutar agente
router.post('/agent/:id', async (req, res) => {
  const agentId = req.params.id
  const { environment, input, context } = req.body

  // Verificar permisos de ambiente
  if (!req.user.environments.includes(environment || 'dev')) {
    return res.status(403).json({
      error: `Sin permisos para ejecutar en ambiente ${environment || 'dev'}`
    })
  }

  const execution = {
    id: `exec_${uuidv4().slice(0, 8)}`,
    type: 'agent',
    agentId,
    name: `Agent ${agentId}`,
    status: 'running',
    environment: environment || 'dev',
    startTime: new Date(),
    endTime: null,
    triggeredBy: req.user.id,
    input,
    context: context || {},
    response: null,
    tokensUsed: null
  }

  executions.push(execution)

  // Simular respuesta del agente
  await new Promise(resolve => setTimeout(resolve, 1000))

  execution.status = 'completed'
  execution.endTime = new Date()
  execution.response = `[Mock Response] Procesando: "${input}"`
  execution.tokensUsed = {
    prompt: 100,
    completion: 50,
    total: 150
  }

  res.json(execution)
})

// GET /api/execution/:id - Obtener ejecución
router.get('/:id', (req, res) => {
  const execution = executions.find(e => e.id === req.params.id)

  if (!execution) {
    return res.status(404).json({ error: 'Ejecución no encontrada' })
  }

  res.json(execution)
})

// POST /api/execution/:id/stop - Detener ejecución
router.post('/:id/stop', (req, res) => {
  const execution = executions.find(e => e.id === req.params.id)

  if (!execution) {
    return res.status(404).json({ error: 'Ejecución no encontrada' })
  }

  if (execution.status !== 'running') {
    return res.status(400).json({ error: 'La ejecución no está en curso' })
  }

  execution.status = 'stopped'
  execution.endTime = new Date()
  execution.logs.push({
    timestamp: new Date(),
    level: 'warn',
    message: `Ejecución detenida por ${req.user.id}`
  })

  res.json({ success: true, execution })
})

// GET /api/execution/:id/logs - Obtener logs de ejecución
router.get('/:id/logs', (req, res) => {
  const execution = executions.find(e => e.id === req.params.id)

  if (!execution) {
    return res.status(404).json({ error: 'Ejecución no encontrada' })
  }

  // Mock logs
  const logs = [
    { timestamp: execution.startTime, level: 'info', message: 'Ejecución iniciada' },
    { timestamp: new Date(execution.startTime.getTime() + 100), level: 'debug', message: 'Cargando configuración' },
    { timestamp: new Date(execution.startTime.getTime() + 200), level: 'info', message: 'Conectando a servicios externos' },
    { timestamp: new Date(execution.startTime.getTime() + 500), level: 'debug', message: 'Procesando datos de entrada' },
    { timestamp: new Date(execution.startTime.getTime() + 1500), level: 'info', message: 'Ejecución completada' }
  ]

  res.json(logs)
})

// GET /api/execution/history - Historial de ejecuciones
router.get('/history/list', (req, res) => {
  const { environment, type, status, from, to, limit = 50 } = req.query

  let filtered = [...executions]

  if (environment) {
    filtered = filtered.filter(e => e.environment === environment)
  }

  if (type) {
    filtered = filtered.filter(e => e.type === type)
  }

  if (status) {
    filtered = filtered.filter(e => e.status === status)
  }

  if (from) {
    filtered = filtered.filter(e => new Date(e.startTime) >= new Date(from))
  }

  if (to) {
    filtered = filtered.filter(e => new Date(e.startTime) <= new Date(to))
  }

  // Ordenar por más reciente
  filtered.sort((a, b) => new Date(b.startTime) - new Date(a.startTime))

  // Limitar resultados
  filtered = filtered.slice(0, parseInt(limit))

  res.json({
    executions: filtered,
    total: filtered.length
  })
})

// POST /api/execution/queue - Agregar a cola
router.post('/queue', (req, res) => {
  const { type, targetId, environment, scheduledTime, variables } = req.body

  if (!type || !targetId) {
    return res.status(400).json({ error: 'type y targetId son requeridos' })
  }

  const job = {
    id: `job_${uuidv4().slice(0, 8)}`,
    type,
    targetId,
    environment: environment || 'dev',
    scheduledTime: scheduledTime || new Date(),
    variables: variables || {},
    status: 'queued',
    createdBy: req.user.id,
    createdAt: new Date()
  }

  queue.push(job)

  res.status(201).json(job)
})

// GET /api/execution/queue - Ver cola
router.get('/queue/list', (req, res) => {
  const { environment } = req.query

  let filtered = queue.filter(j => j.status === 'queued')

  if (environment) {
    filtered = filtered.filter(j => j.environment === environment)
  }

  res.json({
    jobs: filtered,
    total: filtered.length
  })
})

// DELETE /api/execution/queue/:id - Remover de cola
router.delete('/queue/:id', (req, res) => {
  const index = queue.findIndex(j => j.id === req.params.id)

  if (index === -1) {
    return res.status(404).json({ error: 'Job no encontrado en cola' })
  }

  queue.splice(index, 1)
  res.json({ success: true, message: 'Job removido de la cola' })
})

// GET /api/execution/metrics - Métricas de ejecución
router.get('/metrics/summary', (req, res) => {
  const { environment, period = '24h' } = req.query

  let periodMs
  switch (period) {
    case '1h': periodMs = 60 * 60 * 1000; break
    case '24h': periodMs = 24 * 60 * 60 * 1000; break
    case '7d': periodMs = 7 * 24 * 60 * 60 * 1000; break
    case '30d': periodMs = 30 * 24 * 60 * 60 * 1000; break
    default: periodMs = 24 * 60 * 60 * 1000
  }

  const cutoff = new Date(Date.now() - periodMs)
  let filtered = executions.filter(e => new Date(e.startTime) >= cutoff)

  if (environment) {
    filtered = filtered.filter(e => e.environment === environment)
  }

  const completed = filtered.filter(e => e.status === 'completed')
  const failed = filtered.filter(e => e.status === 'failed')
  const avgDuration = completed.length > 0
    ? completed.reduce((sum, e) => sum + (new Date(e.endTime) - new Date(e.startTime)), 0) / completed.length
    : 0

  res.json({
    period,
    totalExecutions: filtered.length,
    completed: completed.length,
    failed: failed.length,
    successRate: filtered.length > 0 ? (completed.length / filtered.length * 100).toFixed(1) : 0,
    avgDuration: Math.round(avgDuration),
    byType: {
      workflow: filtered.filter(e => e.type === 'workflow').length,
      agent: filtered.filter(e => e.type === 'agent').length
    },
    byEnvironment: {
      dev: filtered.filter(e => e.environment === 'dev').length,
      qa: filtered.filter(e => e.environment === 'qa').length,
      prod: filtered.filter(e => e.environment === 'prod').length
    }
  })
})

export default router
