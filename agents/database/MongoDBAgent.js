/**
 * ALQVIMIA RPA 2.0 - MongoDB Agent
 * Agente autónomo para gestión de bases de datos MongoDB
 */

import BaseAgent from '../core/BaseAgent.js'
import { MongoClient } from 'mongodb'

class MongoDBAgent extends BaseAgent {
  constructor(config = {}) {
    super({
      id: config.id || 'agent-mongodb',
      name: 'MongoDB Agent',
      version: '1.0.8',
      port: config.port || 4103,
      category: 'database',
      ...config
    })

    this.dbConfig = {
      uri: config.uri || process.env.MONGO_URI || 'mongodb://localhost:27017',
      database: config.database || process.env.MONGO_DATABASE || 'test',
      authSource: config.authSource || process.env.MONGO_AUTH_SOURCE || 'admin'
    }

    this.client = null
    this.db = null
    this.queryHistory = []

    this.setupDatabaseRoutes()
  }

  getCapabilities() {
    return ['query', 'find', 'aggregate', 'insert', 'update', 'delete', 'indexes', 'collections', 'backup']
  }

  getConfig() {
    return {
      ...super.getConfig(),
      database: {
        uri: this.dbConfig.uri.replace(/\/\/[^:]+:[^@]+@/, '//***:***@'),
        database: this.dbConfig.database,
        connected: !!this.client
      }
    }
  }

  setupDatabaseRoutes() {
    this.app.post('/find', async (req, res) => {
      try {
        const { collection, filter = {}, projection, sort, limit = 100, skip = 0 } = req.body
        const result = await this.find(collection, filter, { projection, sort, limit, skip })
        res.json({ success: true, data: result })
      } catch (error) {
        res.status(400).json({ success: false, error: error.message })
      }
    })

    this.app.post('/aggregate', async (req, res) => {
      try {
        const { collection, pipeline } = req.body
        const result = await this.aggregate(collection, pipeline)
        res.json({ success: true, data: result })
      } catch (error) {
        res.status(400).json({ success: false, error: error.message })
      }
    })

    this.app.post('/insert', async (req, res) => {
      try {
        const { collection, documents } = req.body
        const result = await this.insert(collection, documents)
        res.json({ success: true, data: result })
      } catch (error) {
        res.status(400).json({ success: false, error: error.message })
      }
    })

    this.app.post('/update', async (req, res) => {
      try {
        const { collection, filter, update, options = {} } = req.body
        const result = await this.update(collection, filter, update, options)
        res.json({ success: true, data: result })
      } catch (error) {
        res.status(400).json({ success: false, error: error.message })
      }
    })

    this.app.post('/delete', async (req, res) => {
      try {
        const { collection, filter } = req.body
        const result = await this.delete(collection, filter)
        res.json({ success: true, data: result })
      } catch (error) {
        res.status(400).json({ success: false, error: error.message })
      }
    })

    this.app.get('/collections', async (req, res) => {
      try {
        const collections = await this.getCollections()
        res.json({ success: true, data: collections })
      } catch (error) {
        res.status(500).json({ success: false, error: error.message })
      }
    })

    this.app.get('/collections/:name', async (req, res) => {
      try {
        const info = await this.getCollectionInfo(req.params.name)
        res.json({ success: true, data: info })
      } catch (error) {
        res.status(500).json({ success: false, error: error.message })
      }
    })

    this.app.get('/collections/:name/indexes', async (req, res) => {
      try {
        const indexes = await this.getIndexes(req.params.name)
        res.json({ success: true, data: indexes })
      } catch (error) {
        res.status(500).json({ success: false, error: error.message })
      }
    })

    this.app.get('/stats', async (req, res) => {
      try {
        const stats = await this.getDatabaseStats()
        res.json({ success: true, data: stats })
      } catch (error) {
        res.status(500).json({ success: false, error: error.message })
      }
    })

    this.app.post('/test-connection', async (req, res) => {
      try {
        const config = req.body || this.dbConfig
        await this.testConnection(config)
        res.json({ success: true, message: 'Connection successful' })
      } catch (error) {
        res.status(400).json({ success: false, error: error.message })
      }
    })
  }

  async onStart() {
    try {
      await this.connect()
      this.log('info', `Connected to MongoDB: ${this.dbConfig.database}`)
    } catch (error) {
      this.log('warn', `Could not connect to database: ${error.message}`)
    }
  }

  async onStop() {
    if (this.client) {
      await this.client.close()
      this.client = null
      this.db = null
      this.log('info', 'Database connection closed')
    }
  }

  async connect() {
    this.client = new MongoClient(this.dbConfig.uri, {
      authSource: this.dbConfig.authSource
    })
    await this.client.connect()
    this.db = this.client.db(this.dbConfig.database)
  }

  async testConnection(config) {
    const client = new MongoClient(config.uri || config.connectionString, {
      authSource: config.authSource || 'admin'
    })
    await client.connect()
    await client.close()
  }

  async find(collectionName, filter = {}, options = {}) {
    if (!this.db) throw new Error('Not connected to database')

    const startTime = Date.now()
    const collection = this.db.collection(collectionName)

    let cursor = collection.find(filter)

    if (options.projection) cursor = cursor.project(options.projection)
    if (options.sort) cursor = cursor.sort(options.sort)
    if (options.skip) cursor = cursor.skip(options.skip)
    if (options.limit) cursor = cursor.limit(options.limit)

    const documents = await cursor.toArray()
    const executionTime = Date.now() - startTime

    this.queryHistory.push({
      operation: 'find',
      collection: collectionName,
      filter,
      count: documents.length,
      executionTime,
      timestamp: new Date().toISOString()
    })

    return {
      documents,
      count: documents.length,
      executionTime: `${executionTime}ms`
    }
  }

  async aggregate(collectionName, pipeline) {
    if (!this.db) throw new Error('Not connected to database')

    const startTime = Date.now()
    const collection = this.db.collection(collectionName)
    const documents = await collection.aggregate(pipeline).toArray()
    const executionTime = Date.now() - startTime

    this.queryHistory.push({
      operation: 'aggregate',
      collection: collectionName,
      pipeline,
      count: documents.length,
      executionTime,
      timestamp: new Date().toISOString()
    })

    return {
      documents,
      count: documents.length,
      executionTime: `${executionTime}ms`
    }
  }

  async insert(collectionName, documents) {
    if (!this.db) throw new Error('Not connected to database')

    const collection = this.db.collection(collectionName)
    const isArray = Array.isArray(documents)

    const result = isArray
      ? await collection.insertMany(documents)
      : await collection.insertOne(documents)

    return {
      insertedCount: isArray ? result.insertedCount : 1,
      insertedIds: isArray ? Object.values(result.insertedIds) : [result.insertedId]
    }
  }

  async update(collectionName, filter, update, options = {}) {
    if (!this.db) throw new Error('Not connected to database')

    const collection = this.db.collection(collectionName)

    const result = options.multi
      ? await collection.updateMany(filter, update, options)
      : await collection.updateOne(filter, update, options)

    return {
      matchedCount: result.matchedCount,
      modifiedCount: result.modifiedCount,
      upsertedId: result.upsertedId
    }
  }

  async delete(collectionName, filter) {
    if (!this.db) throw new Error('Not connected to database')

    const collection = this.db.collection(collectionName)
    const result = await collection.deleteMany(filter)

    return { deletedCount: result.deletedCount }
  }

  async getCollections() {
    if (!this.db) throw new Error('Not connected to database')

    const collections = await this.db.listCollections().toArray()
    return collections.map(c => ({
      name: c.name,
      type: c.type
    }))
  }

  async getCollectionInfo(collectionName) {
    if (!this.db) throw new Error('Not connected to database')

    const collection = this.db.collection(collectionName)
    const stats = await this.db.command({ collStats: collectionName })
    const sample = await collection.findOne()

    return {
      name: collectionName,
      count: stats.count,
      size: stats.size,
      avgObjSize: stats.avgObjSize,
      storageSize: stats.storageSize,
      indexes: stats.nindexes,
      sampleDocument: sample
    }
  }

  async getIndexes(collectionName) {
    if (!this.db) throw new Error('Not connected to database')

    const collection = this.db.collection(collectionName)
    return await collection.indexes()
  }

  async getDatabaseStats() {
    if (!this.db) throw new Error('Not connected to database')

    const stats = await this.db.command({ dbStats: 1 })

    return {
      database: this.dbConfig.database,
      collections: stats.collections,
      views: stats.views,
      objects: stats.objects,
      dataSize: stats.dataSize,
      storageSize: stats.storageSize,
      indexes: stats.indexes,
      indexSize: stats.indexSize
    }
  }

  async execute(action, params) {
    switch (action) {
      case 'find': return await this.find(params.collection, params.filter, params)
      case 'aggregate': return await this.aggregate(params.collection, params.pipeline)
      case 'insert': return await this.insert(params.collection, params.documents)
      case 'update': return await this.update(params.collection, params.filter, params.update, params.options)
      case 'delete': return await this.delete(params.collection, params.filter)
      case 'collections': return await this.getCollections()
      case 'collection-info': return await this.getCollectionInfo(params.collection)
      case 'indexes': return await this.getIndexes(params.collection)
      case 'stats': return await this.getDatabaseStats()
      default: throw new Error(`Unknown action: ${action}`)
    }
  }

  onSocketConnection(socket) {
    socket.on('find', async (data, callback) => {
      try {
        const result = await this.find(data.collection, data.filter, data)
        callback({ success: true, data: result })
      } catch (error) {
        callback({ success: false, error: error.message })
      }
    })
  }
}

export default MongoDBAgent

const isMainModule = process.argv[1]?.includes('MongoDBAgent')
if (isMainModule) {
  const agent = new MongoDBAgent({
    uri: process.env.MONGO_URI || 'mongodb://localhost:27017',
    database: process.env.MONGO_DATABASE || 'test'
  })

  agent.start().catch(console.error)

  process.on('SIGINT', async () => {
    console.log('\nShutting down...')
    await agent.stop()
    process.exit(0)
  })
}
