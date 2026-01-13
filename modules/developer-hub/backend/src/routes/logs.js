/**
 * Developer Hub - Logs Routes
 * Gestión de logs y monitoreo
 */

import express from 'express'

const router = express.Router()

// Mock log entries
const generateMockLogs = (count = 100) => {
  const levels = ['debug', 'info', 'warn', 'error']
  const sources = ['workflow', 'agent', 'system', 'api', 'database']
  const environments = ['dev', 'qa', 'prod']

  const messages = {
    debug: [
      'Processing request payload',
      'Variable loaded: customer_id',
      'Connecting to external service',
      'Cache hit for key: user_session'
    ],
    info: [
      'Workflow execution started',
      'Agent response generated',
      'API request completed',
      'Deployment successful'
    ],
    warn: [
      'Rate limit approaching threshold',
      'Deprecated API version used',
      'Slow query detected (>2s)',
      'Memory usage above 80%'
    ],
    error: [
      'Connection timeout to external service',
      'Invalid authentication token',
      'Database query failed',
      'Workflow execution failed'
    ]
  }

  const logs = []
  const now = Date.now()

  for (let i = 0; i < count; i++) {
    const level = levels[Math.floor(Math.random() * levels.length)]
    const source = sources[Math.floor(Math.random() * sources.length)]
    const environment = environments[Math.floor(Math.random() * environments.length)]
    const messageList = messages[level]

    logs.push({
      id: `log_${i.toString().padStart(5, '0')}`,
      timestamp: new Date(now - Math.random() * 24 * 60 * 60 * 1000),
      level,
      source,
      environment,
      message: messageList[Math.floor(Math.random() * messageList.length)],
      metadata: {
        requestId: `req_${Math.random().toString(36).slice(2, 10)}`,
        userId: Math.random() > 0.3 ? `user_${Math.floor(Math.random() * 100)}` : null
      }
    })
  }

  return logs.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
}

let logs = generateMockLogs(200)

// GET /api/logs - Obtener logs
router.get('/', (req, res) => {
  const {
    level,
    source,
    environment,
    search,
    from,
    to,
    limit = 50,
    offset = 0
  } = req.query

  let filtered = [...logs]

  // Filtrar por permisos de ambiente
  if (req.user.role !== 'senior_developer') {
    filtered = filtered.filter(l => req.user.environments.includes(l.environment))
  }

  if (level) {
    const levels = level.split(',')
    filtered = filtered.filter(l => levels.includes(l.level))
  }

  if (source) {
    const sources = source.split(',')
    filtered = filtered.filter(l => sources.includes(l.source))
  }

  if (environment) {
    filtered = filtered.filter(l => l.environment === environment)
  }

  if (search) {
    const searchLower = search.toLowerCase()
    filtered = filtered.filter(l =>
      l.message.toLowerCase().includes(searchLower) ||
      l.metadata?.requestId?.includes(search)
    )
  }

  if (from) {
    filtered = filtered.filter(l => new Date(l.timestamp) >= new Date(from))
  }

  if (to) {
    filtered = filtered.filter(l => new Date(l.timestamp) <= new Date(to))
  }

  const total = filtered.length
  filtered = filtered.slice(parseInt(offset), parseInt(offset) + parseInt(limit))

  res.json({
    logs: filtered,
    total,
    limit: parseInt(limit),
    offset: parseInt(offset)
  })
})

// GET /api/logs/stream - Stream de logs en tiempo real (mock)
router.get('/stream', (req, res) => {
  const { environment } = req.query

  // Configurar SSE
  res.setHeader('Content-Type', 'text/event-stream')
  res.setHeader('Cache-Control', 'no-cache')
  res.setHeader('Connection', 'keep-alive')

  // Enviar log cada 2 segundos (mock)
  const interval = setInterval(() => {
    const levels = ['debug', 'info', 'warn', 'error']
    const level = levels[Math.floor(Math.random() * levels.length)]

    const log = {
      id: `log_${Date.now()}`,
      timestamp: new Date(),
      level,
      source: 'system',
      environment: environment || 'dev',
      message: `Live log entry: ${level} event`,
      metadata: { requestId: `req_${Math.random().toString(36).slice(2, 10)}` }
    }

    res.write(`data: ${JSON.stringify(log)}\n\n`)
  }, 2000)

  // Cleanup on close
  req.on('close', () => {
    clearInterval(interval)
  })
})

// GET /api/logs/stats - Estadísticas de logs
router.get('/stats', (req, res) => {
  const { environment, period = '24h' } = req.query

  let periodMs
  switch (period) {
    case '1h': periodMs = 60 * 60 * 1000; break
    case '24h': periodMs = 24 * 60 * 60 * 1000; break
    case '7d': periodMs = 7 * 24 * 60 * 60 * 1000; break
    default: periodMs = 24 * 60 * 60 * 1000
  }

  const cutoff = new Date(Date.now() - periodMs)
  let filtered = logs.filter(l => new Date(l.timestamp) >= cutoff)

  if (environment) {
    filtered = filtered.filter(l => l.environment === environment)
  }

  const stats = {
    period,
    total: filtered.length,
    byLevel: {
      debug: filtered.filter(l => l.level === 'debug').length,
      info: filtered.filter(l => l.level === 'info').length,
      warn: filtered.filter(l => l.level === 'warn').length,
      error: filtered.filter(l => l.level === 'error').length
    },
    bySource: {
      workflow: filtered.filter(l => l.source === 'workflow').length,
      agent: filtered.filter(l => l.source === 'agent').length,
      system: filtered.filter(l => l.source === 'system').length,
      api: filtered.filter(l => l.source === 'api').length,
      database: filtered.filter(l => l.source === 'database').length
    },
    byEnvironment: {
      dev: filtered.filter(l => l.environment === 'dev').length,
      qa: filtered.filter(l => l.environment === 'qa').length,
      prod: filtered.filter(l => l.environment === 'prod').length
    },
    errorRate: filtered.length > 0
      ? ((filtered.filter(l => l.level === 'error').length / filtered.length) * 100).toFixed(2)
      : 0
  }

  res.json(stats)
})

// GET /api/logs/errors - Obtener errores recientes
router.get('/errors', (req, res) => {
  const { environment, limit = 20 } = req.query

  let errors = logs.filter(l => l.level === 'error')

  if (environment) {
    errors = errors.filter(l => l.environment === environment)
  }

  // Agrupar errores similares
  const groupedErrors = {}
  errors.forEach(e => {
    const key = e.message
    if (!groupedErrors[key]) {
      groupedErrors[key] = {
        message: e.message,
        count: 0,
        lastOccurrence: e.timestamp,
        firstOccurrence: e.timestamp,
        environments: new Set()
      }
    }
    groupedErrors[key].count++
    groupedErrors[key].environments.add(e.environment)
    if (new Date(e.timestamp) > new Date(groupedErrors[key].lastOccurrence)) {
      groupedErrors[key].lastOccurrence = e.timestamp
    }
    if (new Date(e.timestamp) < new Date(groupedErrors[key].firstOccurrence)) {
      groupedErrors[key].firstOccurrence = e.timestamp
    }
  })

  const result = Object.values(groupedErrors)
    .map(e => ({
      ...e,
      environments: Array.from(e.environments)
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, parseInt(limit))

  res.json({
    errors: result,
    total: result.length
  })
})

// GET /api/logs/search - Búsqueda avanzada
router.post('/search', (req, res) => {
  const {
    query,
    levels,
    sources,
    environments,
    dateRange,
    metadata,
    limit = 100
  } = req.body

  let filtered = [...logs]

  if (query) {
    const queryLower = query.toLowerCase()
    filtered = filtered.filter(l =>
      l.message.toLowerCase().includes(queryLower)
    )
  }

  if (levels && levels.length > 0) {
    filtered = filtered.filter(l => levels.includes(l.level))
  }

  if (sources && sources.length > 0) {
    filtered = filtered.filter(l => sources.includes(l.source))
  }

  if (environments && environments.length > 0) {
    filtered = filtered.filter(l => environments.includes(l.environment))
  }

  if (dateRange) {
    if (dateRange.from) {
      filtered = filtered.filter(l => new Date(l.timestamp) >= new Date(dateRange.from))
    }
    if (dateRange.to) {
      filtered = filtered.filter(l => new Date(l.timestamp) <= new Date(dateRange.to))
    }
  }

  if (metadata) {
    if (metadata.requestId) {
      filtered = filtered.filter(l => l.metadata?.requestId === metadata.requestId)
    }
    if (metadata.userId) {
      filtered = filtered.filter(l => l.metadata?.userId === metadata.userId)
    }
  }

  res.json({
    logs: filtered.slice(0, parseInt(limit)),
    total: filtered.length,
    query: req.body
  })
})

// POST /api/logs/export - Exportar logs
router.post('/export', (req, res) => {
  const { format = 'json', filters } = req.body

  let filtered = [...logs]

  // Aplicar filtros
  if (filters) {
    if (filters.level) {
      filtered = filtered.filter(l => filters.level.includes(l.level))
    }
    if (filters.environment) {
      filtered = filtered.filter(l => l.environment === filters.environment)
    }
    if (filters.from) {
      filtered = filtered.filter(l => new Date(l.timestamp) >= new Date(filters.from))
    }
    if (filters.to) {
      filtered = filtered.filter(l => new Date(l.timestamp) <= new Date(filters.to))
    }
  }

  switch (format) {
    case 'csv':
      const csv = [
        'timestamp,level,source,environment,message,requestId',
        ...filtered.map(l =>
          `"${l.timestamp}","${l.level}","${l.source}","${l.environment}","${l.message}","${l.metadata?.requestId || ''}"`
        )
      ].join('\n')

      res.setHeader('Content-Type', 'text/csv')
      res.setHeader('Content-Disposition', 'attachment; filename=logs.csv')
      return res.send(csv)

    case 'json':
    default:
      res.setHeader('Content-Type', 'application/json')
      res.setHeader('Content-Disposition', 'attachment; filename=logs.json')
      return res.json(filtered)
  }
})

// DELETE /api/logs/clear - Limpiar logs (solo desarrollo)
router.delete('/clear', (req, res) => {
  const { environment, olderThan } = req.body

  if (environment === 'prod') {
    return res.status(403).json({ error: 'No se pueden eliminar logs de producción' })
  }

  if (!environment) {
    return res.status(400).json({ error: 'Debe especificar un ambiente' })
  }

  const before = logs.length

  if (olderThan) {
    const cutoff = new Date(olderThan)
    logs = logs.filter(l =>
      l.environment !== environment || new Date(l.timestamp) > cutoff
    )
  } else {
    logs = logs.filter(l => l.environment !== environment)
  }

  const deleted = before - logs.length

  res.json({
    success: true,
    deleted,
    message: `${deleted} logs eliminados del ambiente ${environment}`
  })
})

export default router
