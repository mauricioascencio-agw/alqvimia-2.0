const express = require('express')
const router = express.Router()
const postgres = require('../connections/postgres')
const redis = require('../connections/redis')

/**
 * POST /api/tenants
 * Create new tenant
 */
router.post('/', async (req, res) => {
  try {
    const { tenantId, name, config = {} } = req.body

    if (!tenantId || !name) {
      return res.status(400).json({
        error: 'Tenant ID and name are required',
        code: 'MISSING_PARAMS'
      })
    }

    // Validate tenant ID format
    if (!/^[a-zA-Z][a-zA-Z0-9_]{2,49}$/.test(tenantId)) {
      return res.status(400).json({
        error: 'Invalid tenant ID format. Must start with letter, contain only alphanumeric and underscore, 3-50 chars',
        code: 'INVALID_TENANT_ID'
      })
    }

    // Create tenant schema
    const result = await postgres.createTenantSchema(tenantId)

    // Store tenant metadata in cache
    await redis.set(`tenant:${tenantId}`, {
      id: tenantId,
      name,
      schema: result.schema,
      config,
      createdAt: new Date().toISOString(),
      status: 'active'
    })

    res.status(201).json({
      success: true,
      tenant: {
        id: tenantId,
        name,
        schema: result.schema,
        status: 'active'
      }
    })
  } catch (error) {
    console.error('Create tenant error:', error)
    res.status(500).json({
      error: error.message,
      code: 'CREATE_TENANT_ERROR'
    })
  }
})

/**
 * GET /api/tenants/:id
 * Get tenant info
 */
router.get('/:id', async (req, res) => {
  try {
    const tenant = await redis.get(`tenant:${req.params.id}`)

    if (!tenant) {
      return res.status(404).json({
        error: 'Tenant not found',
        code: 'TENANT_NOT_FOUND'
      })
    }

    res.json(tenant)
  } catch (error) {
    console.error('Get tenant error:', error)
    res.status(500).json({
      error: error.message,
      code: 'GET_TENANT_ERROR'
    })
  }
})

/**
 * PATCH /api/tenants/:id
 * Update tenant
 */
router.patch('/:id', async (req, res) => {
  try {
    const tenant = await redis.get(`tenant:${req.params.id}`)

    if (!tenant) {
      return res.status(404).json({
        error: 'Tenant not found',
        code: 'TENANT_NOT_FOUND'
      })
    }

    const { name, config, status } = req.body

    if (name) tenant.name = name
    if (config) tenant.config = { ...tenant.config, ...config }
    if (status) tenant.status = status
    tenant.updatedAt = new Date().toISOString()

    await redis.set(`tenant:${req.params.id}`, tenant)

    res.json({
      success: true,
      tenant
    })
  } catch (error) {
    console.error('Update tenant error:', error)
    res.status(500).json({
      error: error.message,
      code: 'UPDATE_TENANT_ERROR'
    })
  }
})

/**
 * DELETE /api/tenants/:id
 * Delete tenant
 */
router.delete('/:id', async (req, res) => {
  try {
    const tenant = await redis.get(`tenant:${req.params.id}`)

    if (!tenant) {
      return res.status(404).json({
        error: 'Tenant not found',
        code: 'TENANT_NOT_FOUND'
      })
    }

    // Drop tenant schema
    await postgres.dropTenantSchema(req.params.id)

    // Remove from cache
    await redis.del(`tenant:${req.params.id}`)

    // Remove all tenant-related cache
    await redis.delPattern(`${req.params.id}:*`)

    res.json({
      success: true,
      message: `Tenant ${req.params.id} deleted`
    })
  } catch (error) {
    console.error('Delete tenant error:', error)
    res.status(500).json({
      error: error.message,
      code: 'DELETE_TENANT_ERROR'
    })
  }
})

/**
 * POST /api/tenants/:id/migrate
 * Run migrations for tenant
 */
router.post('/:id/migrate', async (req, res) => {
  try {
    const tenant = await redis.get(`tenant:${req.params.id}`)

    if (!tenant) {
      return res.status(404).json({
        error: 'Tenant not found',
        code: 'TENANT_NOT_FOUND'
      })
    }

    await postgres.runTenantMigrations(tenant.schema)

    res.json({
      success: true,
      message: `Migrations completed for tenant ${req.params.id}`
    })
  } catch (error) {
    console.error('Migrate tenant error:', error)
    res.status(500).json({
      error: error.message,
      code: 'MIGRATE_TENANT_ERROR'
    })
  }
})

/**
 * GET /api/tenants/:id/stats
 * Get tenant statistics
 */
router.get('/:id/stats', async (req, res) => {
  try {
    const tenant = await redis.get(`tenant:${req.params.id}`)

    if (!tenant) {
      return res.status(404).json({
        error: 'Tenant not found',
        code: 'TENANT_NOT_FOUND'
      })
    }

    // Get table counts
    const queries = [
      { sql: `SELECT COUNT(*) as count FROM ${tenant.schema}.users`, params: [] },
      { sql: `SELECT COUNT(*) as count FROM ${tenant.schema}.projects`, params: [] },
      { sql: `SELECT COUNT(*) as count FROM ${tenant.schema}.workflows`, params: [] },
      { sql: `SELECT COUNT(*) as count FROM ${tenant.schema}.agents`, params: [] },
      { sql: `SELECT COUNT(*) as count FROM ${tenant.schema}.executions`, params: [] }
    ]

    const results = await Promise.allSettled(
      queries.map(q => postgres.query(q.sql, q.params, req.params.id))
    )

    res.json({
      tenantId: req.params.id,
      stats: {
        users: results[0].status === 'fulfilled' ? parseInt(results[0].value.rows[0].count) : 0,
        projects: results[1].status === 'fulfilled' ? parseInt(results[1].value.rows[0].count) : 0,
        workflows: results[2].status === 'fulfilled' ? parseInt(results[2].value.rows[0].count) : 0,
        agents: results[3].status === 'fulfilled' ? parseInt(results[3].value.rows[0].count) : 0,
        executions: results[4].status === 'fulfilled' ? parseInt(results[4].value.rows[0].count) : 0
      },
      generatedAt: new Date().toISOString()
    })
  } catch (error) {
    console.error('Get tenant stats error:', error)
    res.status(500).json({
      error: error.message,
      code: 'GET_STATS_ERROR'
    })
  }
})

module.exports = router
