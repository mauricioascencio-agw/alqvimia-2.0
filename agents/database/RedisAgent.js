/**
 * ALQVIMIA RPA 2.0 - Redis Agent
 * Agente autónomo para gestión de Redis cache/store
 */

import BaseAgent from '../core/BaseAgent.js'
import { createClient } from 'redis'

class RedisAgent extends BaseAgent {
  constructor(config = {}) {
    super({
      id: config.id || 'agent-redis',
      name: 'Redis Agent',
      version: '1.0.5',
      port: config.port || 4104,
      category: 'database',
      ...config
    })

    this.redisConfig = {
      host: config.host || process.env.REDIS_HOST || 'localhost',
      port: config.redisPort || process.env.REDIS_PORT || 6379,
      password: config.password || process.env.REDIS_PASSWORD || undefined,
      database: config.database || process.env.REDIS_DB || 0
    }

    this.client = null
    this.subscriber = null

    this.setupRedisRoutes()
  }

  getCapabilities() {
    return ['get', 'set', 'delete', 'keys', 'hash', 'list', 'set', 'sorted-set', 'pub-sub', 'streams']
  }

  getConfig() {
    return {
      ...super.getConfig(),
      redis: {
        host: this.redisConfig.host,
        port: this.redisConfig.port,
        database: this.redisConfig.database,
        connected: this.client?.isOpen
      }
    }
  }

  setupRedisRoutes() {
    // String operations
    this.app.get('/get/:key', async (req, res) => {
      try {
        const value = await this.get(req.params.key)
        res.json({ success: true, data: { key: req.params.key, value } })
      } catch (error) {
        res.status(400).json({ success: false, error: error.message })
      }
    })

    this.app.post('/set', async (req, res) => {
      try {
        const { key, value, ttl } = req.body
        await this.set(key, value, ttl)
        res.json({ success: true, message: 'Value set successfully' })
      } catch (error) {
        res.status(400).json({ success: false, error: error.message })
      }
    })

    this.app.delete('/delete/:key', async (req, res) => {
      try {
        const count = await this.delete(req.params.key)
        res.json({ success: true, data: { deletedCount: count } })
      } catch (error) {
        res.status(400).json({ success: false, error: error.message })
      }
    })

    this.app.get('/keys/:pattern?', async (req, res) => {
      try {
        const keys = await this.keys(req.params.pattern || '*')
        res.json({ success: true, data: keys })
      } catch (error) {
        res.status(400).json({ success: false, error: error.message })
      }
    })

    // Hash operations
    this.app.get('/hash/:key', async (req, res) => {
      try {
        const hash = await this.hGetAll(req.params.key)
        res.json({ success: true, data: hash })
      } catch (error) {
        res.status(400).json({ success: false, error: error.message })
      }
    })

    this.app.post('/hash', async (req, res) => {
      try {
        const { key, field, value, data } = req.body
        if (data) {
          await this.hSet(key, data)
        } else {
          await this.hSet(key, { [field]: value })
        }
        res.json({ success: true })
      } catch (error) {
        res.status(400).json({ success: false, error: error.message })
      }
    })

    // List operations
    this.app.get('/list/:key', async (req, res) => {
      try {
        const { start = 0, stop = -1 } = req.query
        const list = await this.lRange(req.params.key, parseInt(start), parseInt(stop))
        res.json({ success: true, data: list })
      } catch (error) {
        res.status(400).json({ success: false, error: error.message })
      }
    })

    this.app.post('/list/push', async (req, res) => {
      try {
        const { key, values, direction = 'right' } = req.body
        const length = direction === 'left'
          ? await this.lPush(key, values)
          : await this.rPush(key, values)
        res.json({ success: true, data: { length } })
      } catch (error) {
        res.status(400).json({ success: false, error: error.message })
      }
    })

    // Set operations
    this.app.get('/set/:key', async (req, res) => {
      try {
        const members = await this.sMembers(req.params.key)
        res.json({ success: true, data: members })
      } catch (error) {
        res.status(400).json({ success: false, error: error.message })
      }
    })

    this.app.post('/set/add', async (req, res) => {
      try {
        const { key, members } = req.body
        const added = await this.sAdd(key, members)
        res.json({ success: true, data: { addedCount: added } })
      } catch (error) {
        res.status(400).json({ success: false, error: error.message })
      }
    })

    // Pub/Sub
    this.app.post('/publish', async (req, res) => {
      try {
        const { channel, message } = req.body
        const subscribers = await this.publish(channel, message)
        res.json({ success: true, data: { subscribers } })
      } catch (error) {
        res.status(400).json({ success: false, error: error.message })
      }
    })

    // Stats
    this.app.get('/info', async (req, res) => {
      try {
        const info = await this.getInfo()
        res.json({ success: true, data: info })
      } catch (error) {
        res.status(500).json({ success: false, error: error.message })
      }
    })

    this.app.get('/dbsize', async (req, res) => {
      try {
        const size = await this.client.dbSize()
        res.json({ success: true, data: { keys: size } })
      } catch (error) {
        res.status(500).json({ success: false, error: error.message })
      }
    })

    this.app.post('/flush', async (req, res) => {
      try {
        await this.client.flushDb()
        res.json({ success: true, message: 'Database flushed' })
      } catch (error) {
        res.status(400).json({ success: false, error: error.message })
      }
    })

    this.app.post('/test-connection', async (req, res) => {
      try {
        await this.testConnection(req.body)
        res.json({ success: true, message: 'Connection successful' })
      } catch (error) {
        res.status(400).json({ success: false, error: error.message })
      }
    })
  }

  async onStart() {
    try {
      await this.connect()
      this.log('info', `Connected to Redis at ${this.redisConfig.host}:${this.redisConfig.port}`)
    } catch (error) {
      this.log('warn', `Could not connect to Redis: ${error.message}`)
    }
  }

  async onStop() {
    if (this.subscriber) {
      await this.subscriber.quit()
      this.subscriber = null
    }
    if (this.client) {
      await this.client.quit()
      this.client = null
      this.log('info', 'Redis connection closed')
    }
  }

  async connect() {
    const url = this.redisConfig.password
      ? `redis://:${this.redisConfig.password}@${this.redisConfig.host}:${this.redisConfig.port}/${this.redisConfig.database}`
      : `redis://${this.redisConfig.host}:${this.redisConfig.port}/${this.redisConfig.database}`

    this.client = createClient({ url })
    this.client.on('error', (err) => this.log('error', `Redis error: ${err.message}`))
    await this.client.connect()

    // Create subscriber for pub/sub
    this.subscriber = this.client.duplicate()
    await this.subscriber.connect()
  }

  async testConnection(config) {
    const url = config.password
      ? `redis://:${config.password}@${config.host}:${config.port || config.redisPort}/${config.database || 0}`
      : `redis://${config.host}:${config.port || config.redisPort}/${config.database || 0}`

    const client = createClient({ url })
    await client.connect()
    await client.quit()
  }

  // String operations
  async get(key) {
    return await this.client.get(key)
  }

  async set(key, value, ttl) {
    if (ttl) {
      await this.client.setEx(key, ttl, typeof value === 'object' ? JSON.stringify(value) : value)
    } else {
      await this.client.set(key, typeof value === 'object' ? JSON.stringify(value) : value)
    }
  }

  async delete(key) {
    return await this.client.del(key)
  }

  async keys(pattern) {
    return await this.client.keys(pattern)
  }

  // Hash operations
  async hGetAll(key) {
    return await this.client.hGetAll(key)
  }

  async hSet(key, data) {
    for (const [field, value] of Object.entries(data)) {
      await this.client.hSet(key, field, typeof value === 'object' ? JSON.stringify(value) : value)
    }
  }

  // List operations
  async lRange(key, start, stop) {
    return await this.client.lRange(key, start, stop)
  }

  async lPush(key, values) {
    return await this.client.lPush(key, Array.isArray(values) ? values : [values])
  }

  async rPush(key, values) {
    return await this.client.rPush(key, Array.isArray(values) ? values : [values])
  }

  // Set operations
  async sMembers(key) {
    return await this.client.sMembers(key)
  }

  async sAdd(key, members) {
    return await this.client.sAdd(key, Array.isArray(members) ? members : [members])
  }

  // Pub/Sub
  async publish(channel, message) {
    return await this.client.publish(channel, typeof message === 'object' ? JSON.stringify(message) : message)
  }

  async subscribe(channel, callback) {
    await this.subscriber.subscribe(channel, callback)
  }

  async getInfo() {
    const info = await this.client.info()
    const lines = info.split('\r\n')
    const parsed = {}
    let section = 'general'

    for (const line of lines) {
      if (line.startsWith('#')) {
        section = line.slice(2).toLowerCase()
        parsed[section] = {}
      } else if (line.includes(':')) {
        const [key, value] = line.split(':')
        parsed[section][key] = value
      }
    }

    return parsed
  }

  async execute(action, params) {
    switch (action) {
      case 'get': return await this.get(params.key)
      case 'set': return await this.set(params.key, params.value, params.ttl)
      case 'delete': return await this.delete(params.key)
      case 'keys': return await this.keys(params.pattern || '*')
      case 'hget': return await this.hGetAll(params.key)
      case 'hset': return await this.hSet(params.key, params.data || { [params.field]: params.value })
      case 'lrange': return await this.lRange(params.key, params.start || 0, params.stop || -1)
      case 'lpush': return await this.lPush(params.key, params.values)
      case 'rpush': return await this.rPush(params.key, params.values)
      case 'smembers': return await this.sMembers(params.key)
      case 'sadd': return await this.sAdd(params.key, params.members)
      case 'publish': return await this.publish(params.channel, params.message)
      case 'info': return await this.getInfo()
      default: throw new Error(`Unknown action: ${action}`)
    }
  }

  onSocketConnection(socket) {
    socket.on('get', async (key, callback) => {
      try {
        const value = await this.get(key)
        callback({ success: true, data: value })
      } catch (error) {
        callback({ success: false, error: error.message })
      }
    })

    socket.on('subscribe', async (channel) => {
      await this.subscribe(channel, (message) => {
        socket.emit('message', { channel, message })
      })
    })
  }
}

export default RedisAgent

const isMainModule = process.argv[1]?.includes('RedisAgent')
if (isMainModule) {
  const agent = new RedisAgent({
    host: process.env.REDIS_HOST || 'localhost',
    redisPort: parseInt(process.env.REDIS_PORT) || 6379,
    password: process.env.REDIS_PASSWORD
  })

  agent.start().catch(console.error)

  process.on('SIGINT', async () => {
    console.log('\nShutting down...')
    await agent.stop()
    process.exit(0)
  })
}
