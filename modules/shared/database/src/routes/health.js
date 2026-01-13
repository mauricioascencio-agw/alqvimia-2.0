const express = require('express')
const router = express.Router()
const postgres = require('../connections/postgres')
const redis = require('../connections/redis')

/**
 * GET /health
 * Check database service health
 */
router.get('/', async (req, res) => {
  try {
    const [pgHealth, redisHealth] = await Promise.all([
      postgres.healthCheck(),
      redis.healthCheck()
    ])

    const isHealthy = pgHealth.status === 'healthy' && redisHealth.status === 'healthy'

    res.status(isHealthy ? 200 : 503).json({
      status: isHealthy ? 'healthy' : 'degraded',
      timestamp: new Date().toISOString(),
      services: {
        postgres: pgHealth,
        redis: redisHealth
      }
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
 * GET /health/postgres
 * Check PostgreSQL health
 */
router.get('/postgres', async (req, res) => {
  try {
    const health = await postgres.healthCheck()
    res.status(health.status === 'healthy' ? 200 : 503).json(health)
  } catch (error) {
    res.status(503).json({
      status: 'unhealthy',
      error: error.message
    })
  }
})

/**
 * GET /health/redis
 * Check Redis health
 */
router.get('/redis', async (req, res) => {
  try {
    const health = await redis.healthCheck()
    res.status(health.status === 'healthy' ? 200 : 503).json(health)
  } catch (error) {
    res.status(503).json({
      status: 'unhealthy',
      error: error.message
    })
  }
})

module.exports = router
