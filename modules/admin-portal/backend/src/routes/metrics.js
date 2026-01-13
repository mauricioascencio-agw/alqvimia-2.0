/**
 * Admin Portal - Metrics Routes
 * Métricas y estadísticas del sistema
 */

import express from 'express'

const router = express.Router()

// Get dashboard metrics
router.get('/dashboard', async (req, res) => {
  try {
    res.json({
      tenants: {
        total: 156,
        active: 142,
        trial: 8,
        suspended: 6,
        byType: {
          wholesaler: 5,
          distributor: 18,
          partner: 35,
          business: 68,
          enduser: 30
        }
      },
      revenue: {
        mrr: 24580,
        arr: 294960,
        growth: 12.5,
        pendingPayments: 8,
        pendingAmount: 2350
      },
      executions: {
        total: 1847293,
        today: 45230,
        thisMonth: 892340,
        growth: 23.1
      },
      agents: {
        total: 312,
        active: 285,
        byCategory: {
          database: 78,
          api: 92,
          messaging: 64,
          ai: 45,
          storage: 33
        }
      },
      alerts: {
        total: 3,
        critical: 0,
        high: 1,
        medium: 2,
        low: 0
      },
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// Get tenant distribution
router.get('/tenants/distribution', async (req, res) => {
  try {
    res.json({
      byType: [
        { type: 'wholesaler', label: 'Mayoristas', count: 5, percentage: 3.2, mrr: 22500 },
        { type: 'distributor', label: 'Distribuidores', count: 18, percentage: 11.5, mrr: 39600 },
        { type: 'partner', label: 'Partners TI', count: 35, percentage: 22.4, mrr: 52150 },
        { type: 'business', label: 'Empresas', count: 68, percentage: 43.6, mrr: 101320 },
        { type: 'enduser', label: 'Usuarios Finales', count: 30, percentage: 19.2, mrr: 14700 }
      ],
      byPlan: [
        { plan: 'Starter', count: 45, percentage: 28.8 },
        { plan: 'Professional', count: 68, percentage: 43.6 },
        { plan: 'Business', count: 32, percentage: 20.5 },
        { plan: 'Enterprise', count: 11, percentage: 7.1 }
      ],
      byCountry: [
        { country: 'MX', label: 'México', count: 85 },
        { country: 'CO', label: 'Colombia', count: 28 },
        { country: 'AR', label: 'Argentina', count: 18 },
        { country: 'ES', label: 'España', count: 12 },
        { country: 'CL', label: 'Chile', count: 8 },
        { country: 'OTHER', label: 'Otros', count: 5 }
      ]
    })

  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// Get execution metrics
router.get('/executions', async (req, res) => {
  try {
    const { period = '7d' } = req.query

    // Generate mock time series data
    const days = period === '30d' ? 30 : period === '24h' ? 24 : 7
    const data = []
    const now = new Date()

    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(now)
      if (period === '24h') {
        date.setHours(date.getHours() - i)
        data.push({
          timestamp: date.toISOString(),
          executions: Math.floor(Math.random() * 2000) + 1000,
          success: Math.floor(Math.random() * 1800) + 900,
          failed: Math.floor(Math.random() * 100)
        })
      } else {
        date.setDate(date.getDate() - i)
        data.push({
          date: date.toISOString().split('T')[0],
          executions: Math.floor(Math.random() * 50000) + 30000,
          success: Math.floor(Math.random() * 48000) + 28000,
          failed: Math.floor(Math.random() * 2000)
        })
      }
    }

    res.json({
      period,
      data,
      totals: {
        executions: data.reduce((s, d) => s + d.executions, 0),
        success: data.reduce((s, d) => s + d.success, 0),
        failed: data.reduce((s, d) => s + d.failed, 0),
        successRate: 97.2
      }
    })

  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// Get revenue metrics
router.get('/revenue', async (req, res) => {
  try {
    const months = []
    const now = new Date()

    for (let i = 11; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1)
      months.push({
        month: `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`,
        revenue: Math.floor(Math.random() * 10000) + 20000,
        newMRR: Math.floor(Math.random() * 3000) + 1000,
        churn: Math.floor(Math.random() * 500) + 100
      })
    }

    res.json({
      monthly: months,
      current: {
        mrr: 24580,
        arr: 294960,
        growth: 12.5,
        ltv: 8500,
        cac: 450,
        ltvCacRatio: 18.9
      }
    })

  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// Get agent usage metrics
router.get('/agents', async (req, res) => {
  try {
    res.json({
      byCategory: [
        { category: 'database', agents: 78, executions: 523000, avgResponseMs: 45 },
        { category: 'api', agents: 92, executions: 687000, avgResponseMs: 120 },
        { category: 'messaging', agents: 64, executions: 234000, avgResponseMs: 200 },
        { category: 'ai', agents: 45, executions: 156000, avgResponseMs: 850 },
        { category: 'storage', agents: 33, executions: 98000, avgResponseMs: 75 }
      ],
      topAgents: [
        { name: 'MySQLAgent', executions: 245000, tenants: 89 },
        { name: 'RESTAPIAgent', executions: 198000, tenants: 112 },
        { name: 'WhatsAppAgent', executions: 156000, tenants: 67 },
        { name: 'OpenAIAgent', executions: 98000, tenants: 45 },
        { name: 'PostgreSQLAgent', executions: 87000, tenants: 34 }
      ]
    })

  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// Get real-time activity
router.get('/activity/realtime', async (req, res) => {
  try {
    const activities = [
      { type: 'execution', tenant: 'TechSolutions', agent: 'MySQLAgent', status: 'success', timestamp: new Date() },
      { type: 'login', tenant: 'Automatiza Pro', user: 'admin@auto.com', status: 'success', timestamp: new Date(Date.now() - 30000) },
      { type: 'payment', tenant: 'IT Express', amount: 149, status: 'completed', timestamp: new Date(Date.now() - 60000) },
      { type: 'alert', tenant: 'Industrial ABC', message: 'Límite al 90%', severity: 'warning', timestamp: new Date(Date.now() - 120000) },
      { type: 'agent_start', tenant: 'CloudOps', agent: 'PostgreSQLAgent', status: 'running', timestamp: new Date(Date.now() - 180000) }
    ]

    res.json({ activities })

  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

export default router
