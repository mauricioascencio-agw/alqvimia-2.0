const express = require('express')
const router = express.Router()
const postgres = require('../connections/postgres')
const redis = require('../connections/redis')

/**
 * POST /api/query/execute
 * Execute SQL query
 */
router.post('/execute', async (req, res) => {
  try {
    const { sql, params = [], tenantId = 'default' } = req.body

    if (!sql) {
      return res.status(400).json({
        error: 'SQL query is required',
        code: 'MISSING_SQL'
      })
    }

    // Block dangerous operations
    const normalized = sql.toLowerCase().trim()
    const dangerous = ['drop database', 'drop schema', 'truncate', 'delete from']
    if (dangerous.some(d => normalized.includes(d))) {
      return res.status(403).json({
        error: 'Dangerous operation not allowed through API',
        code: 'DANGEROUS_OPERATION'
      })
    }

    const result = await postgres.query(sql, params, tenantId)

    res.json({
      success: true,
      ...result
    })
  } catch (error) {
    console.error('Query error:', error)
    res.status(500).json({
      error: error.message,
      code: 'QUERY_ERROR'
    })
  }
})

/**
 * POST /api/query/transaction
 * Execute transaction
 */
router.post('/transaction', async (req, res) => {
  try {
    const { queries, tenantId = 'default' } = req.body

    if (!queries || !Array.isArray(queries)) {
      return res.status(400).json({
        error: 'Queries array is required',
        code: 'MISSING_QUERIES'
      })
    }

    const result = await postgres.transaction(queries, tenantId)

    res.json(result)
  } catch (error) {
    console.error('Transaction error:', error)
    res.status(500).json({
      error: error.message,
      code: 'TRANSACTION_ERROR'
    })
  }
})

/**
 * POST /api/query/cache/get
 * Get cached value
 */
router.post('/cache/get', async (req, res) => {
  try {
    const { key } = req.body

    if (!key) {
      return res.status(400).json({
        error: 'Key is required',
        code: 'MISSING_KEY'
      })
    }

    const value = await redis.get(key)

    res.json({
      key,
      value,
      found: value !== null
    })
  } catch (error) {
    console.error('Cache get error:', error)
    res.status(500).json({
      error: error.message,
      code: 'CACHE_ERROR'
    })
  }
})

/**
 * POST /api/query/cache/set
 * Set cached value
 */
router.post('/cache/set', async (req, res) => {
  try {
    const { key, value, ttl } = req.body

    if (!key) {
      return res.status(400).json({
        error: 'Key is required',
        code: 'MISSING_KEY'
      })
    }

    await redis.set(key, value, ttl)

    res.json({
      success: true,
      key,
      ttl
    })
  } catch (error) {
    console.error('Cache set error:', error)
    res.status(500).json({
      error: error.message,
      code: 'CACHE_ERROR'
    })
  }
})

/**
 * POST /api/query/cache/delete
 * Delete cached value(s)
 */
router.post('/cache/delete', async (req, res) => {
  try {
    const { key, pattern } = req.body

    let deleted = 0
    if (pattern) {
      deleted = await redis.delPattern(pattern)
    } else if (key) {
      deleted = await redis.del(key)
    } else {
      return res.status(400).json({
        error: 'Key or pattern is required',
        code: 'MISSING_KEY'
      })
    }

    res.json({
      success: true,
      deleted
    })
  } catch (error) {
    console.error('Cache delete error:', error)
    res.status(500).json({
      error: error.message,
      code: 'CACHE_ERROR'
    })
  }
})

/**
 * POST /api/query/rate-limit
 * Check rate limit
 */
router.post('/rate-limit', async (req, res) => {
  try {
    const { key, limit, windowSeconds } = req.body

    if (!key || !limit || !windowSeconds) {
      return res.status(400).json({
        error: 'Key, limit and windowSeconds are required',
        code: 'MISSING_PARAMS'
      })
    }

    const result = await redis.rateLimit(key, limit, windowSeconds)

    res.json(result)
  } catch (error) {
    console.error('Rate limit error:', error)
    res.status(500).json({
      error: error.message,
      code: 'RATE_LIMIT_ERROR'
    })
  }
})

/**
 * POST /api/query/lock/acquire
 * Acquire distributed lock
 */
router.post('/lock/acquire', async (req, res) => {
  try {
    const { key, ttl = 30 } = req.body

    if (!key) {
      return res.status(400).json({
        error: 'Lock key is required',
        code: 'MISSING_KEY'
      })
    }

    const lockValue = await redis.acquireLock(`lock:${key}`, ttl)

    res.json({
      acquired: !!lockValue,
      lockValue,
      ttl
    })
  } catch (error) {
    console.error('Lock acquire error:', error)
    res.status(500).json({
      error: error.message,
      code: 'LOCK_ERROR'
    })
  }
})

/**
 * POST /api/query/lock/release
 * Release distributed lock
 */
router.post('/lock/release', async (req, res) => {
  try {
    const { key, lockValue } = req.body

    if (!key || !lockValue) {
      return res.status(400).json({
        error: 'Key and lockValue are required',
        code: 'MISSING_PARAMS'
      })
    }

    const released = await redis.releaseLock(`lock:${key}`, lockValue)

    res.json({
      released
    })
  } catch (error) {
    console.error('Lock release error:', error)
    res.status(500).json({
      error: error.message,
      code: 'LOCK_ERROR'
    })
  }
})

/**
 * POST /api/query/publish
 * Publish message to channel
 */
router.post('/publish', async (req, res) => {
  try {
    const { channel, message } = req.body

    if (!channel || !message) {
      return res.status(400).json({
        error: 'Channel and message are required',
        code: 'MISSING_PARAMS'
      })
    }

    const subscribers = await redis.publish(channel, message)

    res.json({
      success: true,
      channel,
      subscribers
    })
  } catch (error) {
    console.error('Publish error:', error)
    res.status(500).json({
      error: error.message,
      code: 'PUBLISH_ERROR'
    })
  }
})

module.exports = router
