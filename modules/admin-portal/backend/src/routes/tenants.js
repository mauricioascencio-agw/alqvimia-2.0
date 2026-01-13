/**
 * Admin Portal - Tenants Routes
 * CRUD de clientes/tenants
 */

import express from 'express'

const router = express.Router()

// Mock tenants data
let tenants = [
  {
    id: 'T001',
    name: 'TechSolutions México',
    subdomain: 'techsolutions',
    type: 'wholesaler',
    status: 'active',
    plan: 'Enterprise',
    mrr: 4500,
    executions: 125000,
    agents: 25,
    children: 12,
    email: 'admin@techsolutions.mx',
    phone: '+52 55 1234 5678',
    country: 'MX',
    createdAt: '2024-06-15',
    lastActivity: new Date().toISOString()
  },
  {
    id: 'T002',
    name: 'Automatiza Pro',
    subdomain: 'automatizapro',
    type: 'distributor',
    status: 'active',
    plan: 'Business',
    mrr: 2200,
    executions: 58000,
    agents: 15,
    children: 8,
    parentId: 'T001',
    email: 'contact@automatizapro.com',
    country: 'MX',
    createdAt: '2024-08-22',
    lastActivity: new Date().toISOString()
  }
]

// Get all tenants
router.get('/', async (req, res) => {
  try {
    const { type, status, search, page = 1, limit = 20 } = req.query

    let filtered = [...tenants]

    // Filter by type
    if (type && type !== 'all') {
      filtered = filtered.filter(t => t.type === type)
    }

    // Filter by status
    if (status && status !== 'all') {
      filtered = filtered.filter(t => t.status === status)
    }

    // Search
    if (search) {
      const searchLower = search.toLowerCase()
      filtered = filtered.filter(t =>
        t.name.toLowerCase().includes(searchLower) ||
        t.subdomain.toLowerCase().includes(searchLower) ||
        t.email?.toLowerCase().includes(searchLower)
      )
    }

    // Pagination
    const startIndex = (page - 1) * limit
    const endIndex = startIndex + parseInt(limit)
    const paginated = filtered.slice(startIndex, endIndex)

    res.json({
      data: paginated,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: filtered.length,
        pages: Math.ceil(filtered.length / limit)
      }
    })

  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// Get single tenant
router.get('/:id', async (req, res) => {
  try {
    const tenant = tenants.find(t => t.id === req.params.id)
    if (!tenant) {
      return res.status(404).json({ error: 'Tenant no encontrado' })
    }

    // Get children
    const children = tenants.filter(t => t.parentId === tenant.id)

    res.json({
      ...tenant,
      childTenants: children
    })

  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// Create tenant
router.post('/', async (req, res) => {
  try {
    const {
      name,
      subdomain,
      type,
      plan,
      email,
      phone,
      country,
      parentId
    } = req.body

    // Validate subdomain uniqueness
    if (tenants.find(t => t.subdomain === subdomain)) {
      return res.status(400).json({ error: 'Subdominio ya existe' })
    }

    const newTenant = {
      id: `T${String(tenants.length + 1).padStart(3, '0')}`,
      name,
      subdomain,
      type: type || 'business',
      status: 'pending',
      plan: plan || 'Starter',
      mrr: 0,
      executions: 0,
      agents: 0,
      children: 0,
      email,
      phone,
      country,
      parentId,
      createdAt: new Date().toISOString(),
      lastActivity: new Date().toISOString()
    }

    tenants.push(newTenant)

    // Update parent's children count
    if (parentId) {
      const parent = tenants.find(t => t.id === parentId)
      if (parent) {
        parent.children++
      }
    }

    res.status(201).json(newTenant)

  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// Update tenant
router.put('/:id', async (req, res) => {
  try {
    const index = tenants.findIndex(t => t.id === req.params.id)
    if (index === -1) {
      return res.status(404).json({ error: 'Tenant no encontrado' })
    }

    tenants[index] = {
      ...tenants[index],
      ...req.body,
      id: tenants[index].id, // Prevent ID change
      updatedAt: new Date().toISOString()
    }

    res.json(tenants[index])

  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// Suspend tenant
router.post('/:id/suspend', async (req, res) => {
  try {
    const tenant = tenants.find(t => t.id === req.params.id)
    if (!tenant) {
      return res.status(404).json({ error: 'Tenant no encontrado' })
    }

    tenant.status = 'suspended'
    tenant.suspendedReason = req.body.reason
    tenant.suspendedAt = new Date().toISOString()
    tenant.suspendedBy = req.user?.id

    res.json({ success: true, tenant })

  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// Reactivate tenant
router.post('/:id/reactivate', async (req, res) => {
  try {
    const tenant = tenants.find(t => t.id === req.params.id)
    if (!tenant) {
      return res.status(404).json({ error: 'Tenant no encontrado' })
    }

    tenant.status = 'active'
    delete tenant.suspendedReason
    delete tenant.suspendedAt
    delete tenant.suspendedBy
    tenant.reactivatedAt = new Date().toISOString()

    res.json({ success: true, tenant })

  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// Delete tenant
router.delete('/:id', async (req, res) => {
  try {
    const index = tenants.findIndex(t => t.id === req.params.id)
    if (index === -1) {
      return res.status(404).json({ error: 'Tenant no encontrado' })
    }

    // Check for children
    const hasChildren = tenants.some(t => t.parentId === req.params.id)
    if (hasChildren) {
      return res.status(400).json({
        error: 'No se puede eliminar un tenant con sub-clientes'
      })
    }

    const deleted = tenants.splice(index, 1)[0]

    // Update parent's children count
    if (deleted.parentId) {
      const parent = tenants.find(t => t.id === deleted.parentId)
      if (parent) {
        parent.children--
      }
    }

    res.json({ success: true, deleted })

  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// Get tenant hierarchy
router.get('/:id/hierarchy', async (req, res) => {
  try {
    const buildHierarchy = (parentId = null) => {
      return tenants
        .filter(t => t.parentId === parentId)
        .map(t => ({
          ...t,
          children: buildHierarchy(t.id)
        }))
    }

    const tenant = tenants.find(t => t.id === req.params.id)
    if (!tenant) {
      return res.status(404).json({ error: 'Tenant no encontrado' })
    }

    // Find root
    let root = tenant
    while (root.parentId) {
      root = tenants.find(t => t.id === root.parentId) || root
      if (!root.parentId) break
    }

    const hierarchy = {
      ...root,
      children: buildHierarchy(root.id)
    }

    res.json(hierarchy)

  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

export default router
