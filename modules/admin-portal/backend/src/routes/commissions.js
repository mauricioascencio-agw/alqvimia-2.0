/**
 * Admin Portal - Commissions Routes
 * Gestión de comisiones para mayoristas, distribuidores y partners
 */

import express from 'express'

const router = express.Router()

// Commission rates by type
const COMMISSION_RATES = {
  wholesaler: { rate: 0.40, label: 'Mayorista' },
  distributor: { rate: 0.25, label: 'Distribuidor' },
  partner: { rate: 0.15, label: 'Partner TI' },
  referral: { rate: 0.10, label: 'Referido' }
}

// Mock commissions data
const commissions = [
  {
    id: 'COM-001',
    beneficiaryId: 'T001',
    beneficiaryName: 'TechSolutions México',
    beneficiaryType: 'wholesaler',
    sourceTenantId: 'T002',
    sourceTenantName: 'Automatiza Pro',
    baseAmount: 2200,
    rate: 0.40,
    commissionAmount: 880,
    billingPeriod: '2024-12',
    status: 'pending',
    createdAt: '2025-01-01T00:00:00Z'
  },
  {
    id: 'COM-002',
    beneficiaryId: 'T002',
    beneficiaryName: 'Automatiza Pro',
    beneficiaryType: 'distributor',
    sourceTenantId: 'T003',
    sourceTenantName: 'IT Express',
    baseAmount: 149,
    rate: 0.25,
    commissionAmount: 37.25,
    billingPeriod: '2024-12',
    status: 'approved',
    approvedAt: '2025-01-05T10:00:00Z',
    approvedBy: 'admin_001'
  }
]

// Get commission rates
router.get('/rates', async (req, res) => {
  try {
    res.json(COMMISSION_RATES)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// Get all commissions
router.get('/', async (req, res) => {
  try {
    const {
      beneficiaryId,
      beneficiaryType,
      status,
      period,
      page = 1,
      limit = 20
    } = req.query

    let filtered = [...commissions]

    if (beneficiaryId) filtered = filtered.filter(c => c.beneficiaryId === beneficiaryId)
    if (beneficiaryType) filtered = filtered.filter(c => c.beneficiaryType === beneficiaryType)
    if (status) filtered = filtered.filter(c => c.status === status)
    if (period) filtered = filtered.filter(c => c.billingPeriod === period)

    // Sort by created date
    filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))

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

// Get commission summary
router.get('/summary', async (req, res) => {
  try {
    const { period } = req.query

    let filtered = [...commissions]
    if (period) {
      filtered = filtered.filter(c => c.billingPeriod === period)
    }

    const summary = {
      total: filtered.reduce((s, c) => s + c.commissionAmount, 0),
      pending: filtered.filter(c => c.status === 'pending').reduce((s, c) => s + c.commissionAmount, 0),
      approved: filtered.filter(c => c.status === 'approved').reduce((s, c) => s + c.commissionAmount, 0),
      paid: filtered.filter(c => c.status === 'paid').reduce((s, c) => s + c.commissionAmount, 0),
      byType: {}
    }

    // Group by type
    Object.keys(COMMISSION_RATES).forEach(type => {
      const typeCommissions = filtered.filter(c => c.beneficiaryType === type)
      summary.byType[type] = {
        count: typeCommissions.length,
        total: typeCommissions.reduce((s, c) => s + c.commissionAmount, 0),
        rate: COMMISSION_RATES[type].rate,
        label: COMMISSION_RATES[type].label
      }
    })

    res.json(summary)

  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// Get single commission
router.get('/:id', async (req, res) => {
  try {
    const commission = commissions.find(c => c.id === req.params.id)
    if (!commission) {
      return res.status(404).json({ error: 'Comisión no encontrada' })
    }
    res.json(commission)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// Approve commission
router.post('/:id/approve', async (req, res) => {
  try {
    const commission = commissions.find(c => c.id === req.params.id)
    if (!commission) {
      return res.status(404).json({ error: 'Comisión no encontrada' })
    }

    if (commission.status !== 'pending') {
      return res.status(400).json({ error: 'La comisión ya fue procesada' })
    }

    commission.status = 'approved'
    commission.approvedAt = new Date().toISOString()
    commission.approvedBy = req.user?.id || 'admin_001'

    res.json({ success: true, commission })

  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// Mark commission as paid
router.post('/:id/pay', async (req, res) => {
  try {
    const commission = commissions.find(c => c.id === req.params.id)
    if (!commission) {
      return res.status(404).json({ error: 'Comisión no encontrada' })
    }

    if (commission.status !== 'approved') {
      return res.status(400).json({ error: 'La comisión debe estar aprobada primero' })
    }

    commission.status = 'paid'
    commission.paidAt = new Date().toISOString()
    commission.paymentReference = req.body.reference
    commission.paymentMethod = req.body.method || 'transfer'

    res.json({ success: true, commission })

  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// Batch approve commissions
router.post('/batch/approve', async (req, res) => {
  try {
    const { ids } = req.body

    if (!ids || !Array.isArray(ids)) {
      return res.status(400).json({ error: 'Se requiere un array de IDs' })
    }

    const approved = []
    const errors = []

    for (const id of ids) {
      const commission = commissions.find(c => c.id === id)
      if (!commission) {
        errors.push({ id, error: 'No encontrada' })
        continue
      }
      if (commission.status !== 'pending') {
        errors.push({ id, error: 'Ya procesada' })
        continue
      }

      commission.status = 'approved'
      commission.approvedAt = new Date().toISOString()
      commission.approvedBy = req.user?.id || 'admin_001'
      approved.push(commission)
    }

    res.json({
      success: true,
      approved: approved.length,
      errors: errors.length > 0 ? errors : undefined
    })

  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// Get beneficiary report
router.get('/reports/beneficiary/:id', async (req, res) => {
  try {
    const { id } = req.params
    const { startPeriod, endPeriod } = req.query

    let filtered = commissions.filter(c => c.beneficiaryId === id)

    if (startPeriod) {
      filtered = filtered.filter(c => c.billingPeriod >= startPeriod)
    }
    if (endPeriod) {
      filtered = filtered.filter(c => c.billingPeriod <= endPeriod)
    }

    const byPeriod = {}
    filtered.forEach(c => {
      if (!byPeriod[c.billingPeriod]) {
        byPeriod[c.billingPeriod] = { total: 0, count: 0 }
      }
      byPeriod[c.billingPeriod].total += c.commissionAmount
      byPeriod[c.billingPeriod].count++
    })

    res.json({
      beneficiaryId: id,
      totalEarned: filtered.reduce((s, c) => s + c.commissionAmount, 0),
      totalPaid: filtered.filter(c => c.status === 'paid').reduce((s, c) => s + c.commissionAmount, 0),
      pending: filtered.filter(c => c.status === 'pending' || c.status === 'approved').reduce((s, c) => s + c.commissionAmount, 0),
      byPeriod,
      commissions: filtered
    })

  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

export default router
