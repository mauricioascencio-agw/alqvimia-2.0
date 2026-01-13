/**
 * Admin Portal - Billing Routes
 * Facturación y pagos
 */

import express from 'express'

const router = express.Router()

// Mock billing data
const invoices = [
  {
    id: 'INV-2024-00001',
    tenantId: 'T001',
    tenantName: 'TechSolutions México',
    amount: 4500,
    tax: 720,
    total: 5220,
    currency: 'USD',
    status: 'paid',
    billingPeriod: '2024-12',
    dueDate: '2025-01-15',
    paidDate: '2025-01-10',
    paymentMethod: 'stripe',
    items: [
      { description: 'Plan Enterprise', quantity: 1, price: 4000 },
      { description: 'Agentes adicionales (5)', quantity: 5, price: 100 }
    ]
  }
]

const payments = [
  {
    id: 'PAY-001',
    invoiceId: 'INV-2024-00001',
    tenantId: 'T001',
    amount: 5220,
    currency: 'USD',
    status: 'completed',
    method: 'stripe',
    stripePaymentId: 'pi_xxx',
    createdAt: '2025-01-10T15:30:00Z'
  }
]

// Get billing overview
router.get('/overview', async (req, res) => {
  try {
    const now = new Date()
    const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`

    const mrr = invoices
      .filter(i => i.status === 'paid')
      .reduce((sum, i) => sum + i.amount, 0)

    const pendingAmount = invoices
      .filter(i => i.status === 'pending' || i.status === 'overdue')
      .reduce((sum, i) => sum + i.total, 0)

    const overdueCount = invoices.filter(i => i.status === 'overdue').length

    res.json({
      mrr,
      arr: mrr * 12,
      pendingAmount,
      overdueCount,
      totalInvoices: invoices.length,
      paidInvoices: invoices.filter(i => i.status === 'paid').length,
      currentPeriod: currentMonth
    })

  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// Get all invoices
router.get('/invoices', async (req, res) => {
  try {
    const { status, tenantId, period, page = 1, limit = 20 } = req.query

    let filtered = [...invoices]

    if (status) filtered = filtered.filter(i => i.status === status)
    if (tenantId) filtered = filtered.filter(i => i.tenantId === tenantId)
    if (period) filtered = filtered.filter(i => i.billingPeriod === period)

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

// Get single invoice
router.get('/invoices/:id', async (req, res) => {
  try {
    const invoice = invoices.find(i => i.id === req.params.id)
    if (!invoice) {
      return res.status(404).json({ error: 'Factura no encontrada' })
    }
    res.json(invoice)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// Create invoice
router.post('/invoices', async (req, res) => {
  try {
    const { tenantId, tenantName, items, dueDate } = req.body

    const subtotal = items.reduce((sum, item) => sum + (item.quantity * item.price), 0)
    const tax = subtotal * 0.16
    const total = subtotal + tax

    const now = new Date()
    const invoiceNumber = `INV-${now.getFullYear()}-${String(invoices.length + 1).padStart(5, '0')}`

    const newInvoice = {
      id: invoiceNumber,
      tenantId,
      tenantName,
      amount: subtotal,
      tax,
      total,
      currency: 'USD',
      status: 'pending',
      billingPeriod: `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`,
      dueDate,
      items,
      createdAt: now.toISOString()
    }

    invoices.push(newInvoice)
    res.status(201).json(newInvoice)

  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// Mark invoice as paid
router.post('/invoices/:id/pay', async (req, res) => {
  try {
    const invoice = invoices.find(i => i.id === req.params.id)
    if (!invoice) {
      return res.status(404).json({ error: 'Factura no encontrada' })
    }

    invoice.status = 'paid'
    invoice.paidDate = new Date().toISOString()
    invoice.paymentMethod = req.body.method || 'manual'

    // Create payment record
    const payment = {
      id: `PAY-${String(payments.length + 1).padStart(3, '0')}`,
      invoiceId: invoice.id,
      tenantId: invoice.tenantId,
      amount: invoice.total,
      currency: invoice.currency,
      status: 'completed',
      method: invoice.paymentMethod,
      createdAt: new Date().toISOString()
    }
    payments.push(payment)

    res.json({ invoice, payment })

  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// Get payments
router.get('/payments', async (req, res) => {
  try {
    const { tenantId, status, page = 1, limit = 20 } = req.query

    let filtered = [...payments]

    if (tenantId) filtered = filtered.filter(p => p.tenantId === tenantId)
    if (status) filtered = filtered.filter(p => p.status === status)

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

// Revenue report
router.get('/reports/revenue', async (req, res) => {
  try {
    const { startDate, endDate } = req.query

    // Group by month
    const byMonth = {}
    invoices
      .filter(i => i.status === 'paid')
      .forEach(invoice => {
        const month = invoice.billingPeriod
        if (!byMonth[month]) {
          byMonth[month] = { revenue: 0, count: 0 }
        }
        byMonth[month].revenue += invoice.amount
        byMonth[month].count++
      })

    res.json({
      byMonth,
      total: Object.values(byMonth).reduce((sum, m) => sum + m.revenue, 0)
    })

  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

export default router
