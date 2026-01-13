/**
 * Admin Portal - Audit Routes
 * Logs de auditoría
 */

import express from 'express'

const router = express.Router()

// Mock audit logs
const auditLogs = [
  {
    id: 1,
    timestamp: '2025-12-28T10:30:00Z',
    action: 'tenant.create',
    actor: { id: 'admin_001', email: 'admin@alqvimia.com', type: 'admin' },
    target: { type: 'tenant', id: 'T003', name: 'New Company' },
    details: { plan: 'Professional' },
    ip: '192.168.1.100',
    userAgent: 'Mozilla/5.0...',
    status: 'success'
  },
  {
    id: 2,
    timestamp: '2025-12-28T09:15:00Z',
    action: 'tenant.suspend',
    actor: { id: 'admin_001', email: 'admin@alqvimia.com', type: 'admin' },
    target: { type: 'tenant', id: 'T008', name: 'Startup Innovate' },
    details: { reason: 'Pago pendiente > 30 días' },
    ip: '192.168.1.100',
    status: 'success'
  },
  {
    id: 3,
    timestamp: '2025-12-28T08:00:00Z',
    action: 'config.update',
    actor: { id: 'admin_002', email: 'soporte@alqvimia.com', type: 'admin' },
    target: { type: 'tenant', id: 'T001', name: 'TechSolutions' },
    details: { field: 'executionLimit', oldValue: 100000, newValue: 200000 },
    ip: '192.168.1.101',
    status: 'success'
  }
]

// Get audit logs
router.get('/', async (req, res) => {
  try {
    const {
      action,
      actorId,
      targetType,
      targetId,
      startDate,
      endDate,
      status,
      page = 1,
      limit = 50
    } = req.query

    let filtered = [...auditLogs]

    if (action) filtered = filtered.filter(l => l.action.includes(action))
    if (actorId) filtered = filtered.filter(l => l.actor.id === actorId)
    if (targetType) filtered = filtered.filter(l => l.target.type === targetType)
    if (targetId) filtered = filtered.filter(l => l.target.id === targetId)
    if (status) filtered = filtered.filter(l => l.status === status)

    if (startDate) {
      const start = new Date(startDate)
      filtered = filtered.filter(l => new Date(l.timestamp) >= start)
    }

    if (endDate) {
      const end = new Date(endDate)
      filtered = filtered.filter(l => new Date(l.timestamp) <= end)
    }

    // Sort by timestamp descending
    filtered.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))

    // Pagination
    const startIndex = (page - 1) * limit
    const paginated = filtered.slice(startIndex, startIndex + parseInt(limit))

    res.json({
      data: paginated,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: filtered.length
      }
    })

  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// Get single audit log
router.get('/:id', async (req, res) => {
  try {
    const log = auditLogs.find(l => l.id === parseInt(req.params.id))
    if (!log) {
      return res.status(404).json({ error: 'Log no encontrado' })
    }
    res.json(log)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// Get audit stats
router.get('/stats/summary', async (req, res) => {
  try {
    const { days = 30 } = req.query
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)

    const recentLogs = auditLogs.filter(l => new Date(l.timestamp) >= startDate)

    // Count by action type
    const byAction = {}
    recentLogs.forEach(log => {
      const actionType = log.action.split('.')[0]
      byAction[actionType] = (byAction[actionType] || 0) + 1
    })

    // Count by status
    const byStatus = {}
    recentLogs.forEach(log => {
      byStatus[log.status] = (byStatus[log.status] || 0) + 1
    })

    // Count by day
    const byDay = {}
    recentLogs.forEach(log => {
      const day = log.timestamp.split('T')[0]
      byDay[day] = (byDay[day] || 0) + 1
    })

    res.json({
      total: recentLogs.length,
      byAction,
      byStatus,
      byDay,
      period: { days, startDate: startDate.toISOString() }
    })

  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// Export audit logs
router.get('/export/:format', async (req, res) => {
  try {
    const { format } = req.params
    const { startDate, endDate } = req.query

    let filtered = [...auditLogs]

    if (startDate) {
      filtered = filtered.filter(l => new Date(l.timestamp) >= new Date(startDate))
    }
    if (endDate) {
      filtered = filtered.filter(l => new Date(l.timestamp) <= new Date(endDate))
    }

    if (format === 'csv') {
      const headers = ['ID', 'Timestamp', 'Action', 'Actor', 'Target', 'Status', 'IP']
      const rows = filtered.map(l => [
        l.id,
        l.timestamp,
        l.action,
        l.actor.email,
        `${l.target.type}:${l.target.id}`,
        l.status,
        l.ip
      ])

      const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n')

      res.setHeader('Content-Type', 'text/csv')
      res.setHeader('Content-Disposition', 'attachment; filename=audit-logs.csv')
      res.send(csv)

    } else if (format === 'json') {
      res.setHeader('Content-Disposition', 'attachment; filename=audit-logs.json')
      res.json(filtered)

    } else {
      res.status(400).json({ error: 'Formato no soportado. Use csv o json.' })
    }

  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

export default router
