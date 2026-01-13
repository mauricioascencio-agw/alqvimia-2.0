const express = require('express')
const router = express.Router()
const serviceRegistry = require('../services/registry')

/**
 * GET /health
 * Gateway health check
 */
router.get('/', async (req, res) => {
  try {
    const services = await serviceRegistry.healthCheckAll()
    const allHealthy = Object.values(services).every(s => s.status === 'healthy')

    res.status(allHealthy ? 200 : 503).json({
      status: allHealthy ? 'healthy' : 'degraded',
      gateway: 'running',
      timestamp: new Date().toISOString(),
      services
    })
  } catch (error) {
    res.status(503).json({
      status: 'unhealthy',
      error: error.message,
      timestamp: new Date().toISOString()
    })
  }
})

/**
 * GET /health/live
 * Liveness probe
 */
router.get('/live', (req, res) => {
  res.json({
    status: 'alive',
    timestamp: new Date().toISOString()
  })
})

/**
 * GET /health/ready
 * Readiness probe
 */
router.get('/ready', async (req, res) => {
  try {
    const services = serviceRegistry.list()
    const healthyCount = services.filter(s => s.status === 'healthy').length

    // Ready if at least 50% of services are healthy
    const isReady = healthyCount >= services.length / 2

    res.status(isReady ? 200 : 503).json({
      ready: isReady,
      services: {
        total: services.length,
        healthy: healthyCount,
        unhealthy: services.length - healthyCount
      },
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    res.status(503).json({
      ready: false,
      error: error.message
    })
  }
})

/**
 * GET /health/services
 * Get all service health status
 */
router.get('/services', (req, res) => {
  res.json({
    services: serviceRegistry.list(),
    timestamp: new Date().toISOString()
  })
})

/**
 * GET /health/services/:name
 * Get specific service health
 */
router.get('/services/:name', async (req, res) => {
  try {
    const service = serviceRegistry.get(req.params.name)

    if (!service) {
      return res.status(404).json({
        error: 'Service not found',
        code: 'SERVICE_NOT_FOUND'
      })
    }

    const health = await serviceRegistry.healthCheck(req.params.name)

    res.json({
      name: req.params.name,
      url: service.url,
      ...health
    })
  } catch (error) {
    res.status(500).json({
      error: error.message,
      code: 'HEALTH_CHECK_ERROR'
    })
  }
})

module.exports = router
