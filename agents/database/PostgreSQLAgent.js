/**
 * ALQVIMIA RPA 2.0 - PostgreSQL Agent
 * Agente autónomo para gestión de bases de datos PostgreSQL
 */

import BaseAgent from '../core/BaseAgent.js'
import pg from 'pg'

const { Pool } = pg

class PostgreSQLAgent extends BaseAgent {
  constructor(config = {}) {
    super({
      id: config.id || 'agent-postgresql',
      name: 'PostgreSQL Agent',
      version: '1.1.5',
      port: config.port || 4102,
      category: 'database',
      ...config
    })

    this.dbConfig = {
      host: config.host || process.env.PG_HOST || 'localhost',
      port: config.dbPort || process.env.PG_PORT || 5432,
      user: config.user || process.env.PG_USER || 'postgres',
      password: config.password || process.env.PG_PASSWORD || '',
      database: config.database || process.env.PG_DATABASE || 'postgres',
      ssl: config.ssl || process.env.PG_SSL === 'true'
    }

    this.pool = null
    this.queryHistory = []

    this.setupDatabaseRoutes()
  }

  getCapabilities() {
    return ['query', 'schema', 'tables', 'backup', 'replication', 'extensions', 'functions', 'triggers']
  }

  getConfig() {
    return {
      ...super.getConfig(),
      database: {
        host: this.dbConfig.host,
        port: this.dbConfig.port,
        user: this.dbConfig.user,
        database: this.dbConfig.database,
        connected: !!this.pool
      }
    }
  }

  setupDatabaseRoutes() {
    this.app.post('/query', async (req, res) => {
      try {
        const { sql, params, limit = 1000 } = req.body
        const result = await this.executeQuery(sql, params, limit)
        res.json({ success: true, data: result })
      } catch (error) {
        res.status(400).json({ success: false, error: error.message })
      }
    })

    this.app.get('/schema', async (req, res) => {
      try {
        const schema = await this.getSchema()
        res.json({ success: true, data: schema })
      } catch (error) {
        res.status(500).json({ success: false, error: error.message })
      }
    })

    this.app.get('/tables', async (req, res) => {
      try {
        const tables = await this.getTables()
        res.json({ success: true, data: tables })
      } catch (error) {
        res.status(500).json({ success: false, error: error.message })
      }
    })

    this.app.get('/tables/:tableName', async (req, res) => {
      try {
        const tableInfo = await this.getTableInfo(req.params.tableName)
        res.json({ success: true, data: tableInfo })
      } catch (error) {
        res.status(500).json({ success: false, error: error.message })
      }
    })

    this.app.get('/extensions', async (req, res) => {
      try {
        const extensions = await this.getExtensions()
        res.json({ success: true, data: extensions })
      } catch (error) {
        res.status(500).json({ success: false, error: error.message })
      }
    })

    this.app.get('/functions', async (req, res) => {
      try {
        const functions = await this.getFunctions()
        res.json({ success: true, data: functions })
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
      this.log('info', `Connected to PostgreSQL at ${this.dbConfig.host}:${this.dbConfig.port}`)
    } catch (error) {
      this.log('warn', `Could not connect to database: ${error.message}`)
    }
  }

  async onStop() {
    if (this.pool) {
      await this.pool.end()
      this.pool = null
      this.log('info', 'Database connection closed')
    }
  }

  async connect() {
    this.pool = new Pool({
      host: this.dbConfig.host,
      port: this.dbConfig.port,
      user: this.dbConfig.user,
      password: this.dbConfig.password,
      database: this.dbConfig.database,
      ssl: this.dbConfig.ssl ? { rejectUnauthorized: false } : false,
      max: 10,
      idleTimeoutMillis: 30000
    })

    const client = await this.pool.connect()
    client.release()
  }

  async testConnection(config) {
    const pool = new Pool({
      host: config.host,
      port: config.port || config.dbPort,
      user: config.user || config.username,
      password: config.password,
      database: config.database,
      ssl: config.ssl ? { rejectUnauthorized: false } : false
    })
    const client = await pool.connect()
    client.release()
    await pool.end()
  }

  async executeQuery(sql, params = [], limit = 1000) {
    if (!this.pool) throw new Error('Not connected to database')

    const startTime = Date.now()

    try {
      const result = await this.pool.query(sql, params)
      const executionTime = Date.now() - startTime

      this.queryHistory.push({
        sql,
        params,
        executionTime,
        rowCount: result.rowCount,
        timestamp: new Date().toISOString()
      })

      if (result.rows) {
        return {
          columns: result.fields ? result.fields.map(f => f.name) : [],
          rows: result.rows.slice(0, limit),
          rowCount: result.rowCount,
          executionTime: `${executionTime}ms`,
          truncated: result.rows.length > limit
        }
      }

      return {
        rowCount: result.rowCount,
        command: result.command,
        executionTime: `${executionTime}ms`
      }
    } catch (error) {
      this.queryHistory.push({
        sql,
        params,
        error: error.message,
        timestamp: new Date().toISOString()
      })
      throw error
    }
  }

  async getSchema() {
    const tablesResult = await this.pool.query(`
      SELECT
        t.table_name,
        t.table_type,
        pg_catalog.obj_description(pgc.oid, 'pg_class') as description
      FROM information_schema.tables t
      LEFT JOIN pg_catalog.pg_class pgc ON t.table_name = pgc.relname
      WHERE t.table_schema = 'public'
      ORDER BY t.table_name
    `)

    const tables = await Promise.all(tablesResult.rows.map(async (table) => {
      const columnsResult = await this.pool.query(`
        SELECT
          column_name,
          data_type,
          is_nullable,
          column_default,
          character_maximum_length
        FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = $1
        ORDER BY ordinal_position
      `, [table.table_name])

      const pkResult = await this.pool.query(`
        SELECT a.attname
        FROM pg_index i
        JOIN pg_attribute a ON a.attrelid = i.indrelid AND a.attnum = ANY(i.indkey)
        WHERE i.indrelid = $1::regclass AND i.indisprimary
      `, [table.table_name])

      const primaryKeys = pkResult.rows.map(r => r.attname)

      return {
        name: table.table_name,
        type: table.table_type,
        description: table.description,
        columns: columnsResult.rows.map(col => ({
          name: col.column_name,
          type: col.data_type,
          nullable: col.is_nullable === 'YES',
          defaultValue: col.column_default,
          maxLength: col.character_maximum_length,
          primaryKey: primaryKeys.includes(col.column_name)
        }))
      }
    }))

    return { database: this.dbConfig.database, tables }
  }

  async getTables() {
    const result = await this.pool.query(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      ORDER BY table_name
    `)
    return result.rows.map(r => r.table_name)
  }

  async getTableInfo(tableName) {
    const columnsResult = await this.pool.query(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = $1
      ORDER BY ordinal_position
    `, [tableName])

    const countResult = await this.pool.query(`SELECT COUNT(*) as count FROM "${tableName}"`)

    return {
      name: tableName,
      columns: columnsResult.rows.map(col => ({
        name: col.column_name,
        type: col.data_type,
        nullable: col.is_nullable === 'YES',
        defaultValue: col.column_default
      })),
      rowCount: parseInt(countResult.rows[0].count)
    }
  }

  async getExtensions() {
    const result = await this.pool.query(`
      SELECT extname, extversion, extnamespace::regnamespace as schema
      FROM pg_extension
      ORDER BY extname
    `)
    return result.rows
  }

  async getFunctions() {
    const result = await this.pool.query(`
      SELECT
        routine_name,
        routine_type,
        data_type as return_type
      FROM information_schema.routines
      WHERE routine_schema = 'public'
      ORDER BY routine_name
    `)
    return result.rows
  }

  async getDatabaseStats() {
    const sizeResult = await this.pool.query(`
      SELECT pg_size_pretty(pg_database_size(current_database())) as size
    `)

    const connResult = await this.pool.query(`
      SELECT count(*) as connections
      FROM pg_stat_activity
      WHERE datname = current_database()
    `)

    const versionResult = await this.pool.query('SELECT version()')

    return {
      database: this.dbConfig.database,
      size: sizeResult.rows[0].size,
      activeConnections: parseInt(connResult.rows[0].connections),
      version: versionResult.rows[0].version,
      poolStats: {
        total: this.pool.totalCount,
        idle: this.pool.idleCount,
        waiting: this.pool.waitingCount
      }
    }
  }

  async execute(action, params) {
    switch (action) {
      case 'query': return await this.executeQuery(params.sql, params.params, params.limit)
      case 'schema': return await this.getSchema()
      case 'tables': return await this.getTables()
      case 'table-info': return await this.getTableInfo(params.tableName)
      case 'extensions': return await this.getExtensions()
      case 'functions': return await this.getFunctions()
      case 'stats': return await this.getDatabaseStats()
      default: throw new Error(`Unknown action: ${action}`)
    }
  }

  onSocketConnection(socket) {
    socket.on('query', async (data, callback) => {
      try {
        const result = await this.executeQuery(data.sql, data.params, data.limit)
        callback({ success: true, data: result })
      } catch (error) {
        callback({ success: false, error: error.message })
      }
    })
  }
}

export default PostgreSQLAgent

const isMainModule = process.argv[1]?.includes('PostgreSQLAgent')
if (isMainModule) {
  const agent = new PostgreSQLAgent({
    host: process.env.PG_HOST || 'localhost',
    dbPort: parseInt(process.env.PG_PORT) || 5432,
    user: process.env.PG_USER || 'postgres',
    password: process.env.PG_PASSWORD || '',
    database: process.env.PG_DATABASE || 'postgres'
  })

  agent.start().catch(console.error)

  process.on('SIGINT', async () => {
    console.log('\nShutting down...')
    await agent.stop()
    process.exit(0)
  })
}
