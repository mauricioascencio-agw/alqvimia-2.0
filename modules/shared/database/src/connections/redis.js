const { createClient } = require('redis')

let client = null
let subscriber = null

const defaultConfig = {
  url: process.env.REDIS_URL || 'redis://localhost:6379',
  password: process.env.REDIS_PASSWORD || undefined
}

class RedisConnection {
  /**
   * Get or create Redis client
   */
  async getClient() {
    if (!client) {
      client = createClient(defaultConfig)

      client.on('error', (err) => {
        console.error('Redis Client Error:', err)
      })

      client.on('connect', () => {
        console.log('Redis connected')
      })

      await client.connect()
    }

    return client
  }

  /**
   * Get subscriber client for pub/sub
   */
  async getSubscriber() {
    if (!subscriber) {
      subscriber = client.duplicate()
      await subscriber.connect()
    }
    return subscriber
  }

  /**
   * Set value with optional TTL
   */
  async set(key, value, ttlSeconds = null) {
    const redis = await this.getClient()
    const serialized = typeof value === 'object' ? JSON.stringify(value) : String(value)

    if (ttlSeconds) {
      return redis.setEx(key, ttlSeconds, serialized)
    }
    return redis.set(key, serialized)
  }

  /**
   * Get value
   */
  async get(key, parseJson = true) {
    const redis = await this.getClient()
    const value = await redis.get(key)

    if (!value) return null

    if (parseJson) {
      try {
        return JSON.parse(value)
      } catch {
        return value
      }
    }

    return value
  }

  /**
   * Delete key
   */
  async del(key) {
    const redis = await this.getClient()
    return redis.del(key)
  }

  /**
   * Delete keys by pattern
   */
  async delPattern(pattern) {
    const redis = await this.getClient()
    const keys = await redis.keys(pattern)

    if (keys.length > 0) {
      return redis.del(keys)
    }
    return 0
  }

  /**
   * Set hash
   */
  async hSet(key, field, value) {
    const redis = await this.getClient()
    const serialized = typeof value === 'object' ? JSON.stringify(value) : String(value)
    return redis.hSet(key, field, serialized)
  }

  /**
   * Get hash field
   */
  async hGet(key, field, parseJson = true) {
    const redis = await this.getClient()
    const value = await redis.hGet(key, field)

    if (!value) return null

    if (parseJson) {
      try {
        return JSON.parse(value)
      } catch {
        return value
      }
    }

    return value
  }

  /**
   * Get all hash fields
   */
  async hGetAll(key, parseJson = true) {
    const redis = await this.getClient()
    const data = await redis.hGetAll(key)

    if (!data || Object.keys(data).length === 0) return null

    if (parseJson) {
      const result = {}
      for (const [field, value] of Object.entries(data)) {
        try {
          result[field] = JSON.parse(value)
        } catch {
          result[field] = value
        }
      }
      return result
    }

    return data
  }

  /**
   * Increment value
   */
  async incr(key) {
    const redis = await this.getClient()
    return redis.incr(key)
  }

  /**
   * Add to sorted set
   */
  async zAdd(key, score, member) {
    const redis = await this.getClient()
    return redis.zAdd(key, { score, value: member })
  }

  /**
   * Get sorted set range
   */
  async zRange(key, start, stop, options = {}) {
    const redis = await this.getClient()
    return redis.zRange(key, start, stop, options)
  }

  /**
   * Publish message
   */
  async publish(channel, message) {
    const redis = await this.getClient()
    const serialized = typeof message === 'object' ? JSON.stringify(message) : String(message)
    return redis.publish(channel, serialized)
  }

  /**
   * Subscribe to channel
   */
  async subscribe(channel, callback) {
    const sub = await this.getSubscriber()
    await sub.subscribe(channel, (message) => {
      try {
        callback(JSON.parse(message))
      } catch {
        callback(message)
      }
    })
  }

  /**
   * Unsubscribe from channel
   */
  async unsubscribe(channel) {
    const sub = await this.getSubscriber()
    return sub.unsubscribe(channel)
  }

  /**
   * Cache wrapper with auto-refresh
   */
  async cache(key, ttlSeconds, fetchFn) {
    let value = await this.get(key)

    if (value === null) {
      value = await fetchFn()
      if (value !== null && value !== undefined) {
        await this.set(key, value, ttlSeconds)
      }
    }

    return value
  }

  /**
   * Rate limiting
   */
  async rateLimit(key, limit, windowSeconds) {
    const redis = await this.getClient()
    const current = await redis.incr(key)

    if (current === 1) {
      await redis.expire(key, windowSeconds)
    }

    return {
      allowed: current <= limit,
      remaining: Math.max(0, limit - current),
      current
    }
  }

  /**
   * Distributed lock
   */
  async acquireLock(lockKey, ttlSeconds = 30) {
    const redis = await this.getClient()
    const lockValue = Date.now().toString()

    const acquired = await redis.setNX(lockKey, lockValue)
    if (acquired) {
      await redis.expire(lockKey, ttlSeconds)
      return lockValue
    }

    return null
  }

  /**
   * Release lock
   */
  async releaseLock(lockKey, lockValue) {
    const redis = await this.getClient()
    const currentValue = await redis.get(lockKey)

    if (currentValue === lockValue) {
      await redis.del(lockKey)
      return true
    }

    return false
  }

  /**
   * Health check
   */
  async healthCheck() {
    try {
      const redis = await this.getClient()
      const pong = await redis.ping()

      return {
        status: pong === 'PONG' ? 'healthy' : 'unhealthy',
        response: pong
      }
    } catch (error) {
      return {
        status: 'unhealthy',
        error: error.message
      }
    }
  }

  /**
   * Close connection
   */
  async close() {
    if (subscriber) {
      await subscriber.disconnect()
      subscriber = null
    }
    if (client) {
      await client.disconnect()
      client = null
    }
  }
}

module.exports = new RedisConnection()
