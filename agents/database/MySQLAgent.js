/**
 * ALQVIMIA RPA 2.0 - MySQL Agent
 * Agente autónomo para gestión de bases de datos MySQL
 */

import BaseAgent from '../core/BaseAgent.js'
import mysql from 'mysql2/promise'

class MySQLAgent extends BaseAgent {
  constructor(config = {}) {
    super({
      id: config.id || 'agent-mysql',
      name: 'MySQL Agent',
      version: '1.2.0',
      port: config.port || 4101,
      category: 'database',
      ...config
    })

    // Configuración de conexión
    this.dbConfig = {
      host: config.host || process.env.MYSQL_HOST || 'localhost',
      port: config.dbPort || process.env.MYSQL_PORT || 3306,
      user: config.user || process.env.MYSQL_USER || 'root',
      password: config.password || process.env.MYSQL_PASSWORD || '',
      database: config.database || process.env.MYSQL_DATABASE || ''
    }

    this.pool = null
    this.queryHistory = []

    // Configurar rutas específicas
    this.setupDatabaseRoutes()
  }

  /**
   * Obtener capacidades del agente
   */
  getCapabilities() {
    return [
      'query',
      'schema',
      'tables',
      'backup',
      'restore',
      'monitoring',
      'migrations'
    ]
  }

  /**
   * Obtener configuración
   */
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

  /**
   * Actualizar configuración
   */
  updateConfig(newConfig) {
    super.updateConfig(newConfig)

    if (newConfig.database) {
      const { host, port, user, password, database } = newConfig.database
      if (host) this.dbConfig.host = host
      if (port) this.dbConfig.port = port
      if (user) this.dbConfig.user = user
      if (password) this.dbConfig.password = password
      if (database) this.dbConfig.database = database

      // Reconectar con nueva configuración
      this.reconnect()
    }
  }

  /**
   * Configurar rutas específicas de base de datos
   */
  setupDatabaseRoutes() {
    // Ejecutar query
    this.app.post('/query', async (req, res) => {
      try {
        const { sql, params, limit = 1000 } = req.body
        const result = await this.executeQuery(sql, params, limit)
        res.json({ success: true, data: result })
      } catch (error) {
        res.status(400).json({ success: false, error: error.message })
      }
    })

    // Obtener esquema completo
    this.app.get('/schema', async (req, res) => {
      try {
        const schema = await this.getSchema()
        res.json({ success: true, data: schema })
      } catch (error) {
        res.status(500).json({ success: false, error: error.message })
      }
    })

    // Listar tablas
    this.app.get('/tables', async (req, res) => {
      try {
        const tables = await this.getTables()
        res.json({ success: true, data: tables })
      } catch (error) {
        res.status(500).json({ success: false, error: error.message })
      }
    })

    // Obtener información de una tabla
    this.app.get('/tables/:tableName', async (req, res) => {
      try {
        const tableInfo = await this.getTableInfo(req.params.tableName)
        res.json({ success: true, data: tableInfo })
      } catch (error) {
        res.status(500).json({ success: false, error: error.message })
      }
    })

    // Obtener datos de una tabla
    this.app.get('/tables/:tableName/data', async (req, res) => {
      try {
        const { limit = 100, offset = 0, orderBy, orderDir = 'ASC' } = req.query
        const data = await this.getTableData(req.params.tableName, {
          limit: parseInt(limit),
          offset: parseInt(offset),
          orderBy,
          orderDir
        })
        res.json({ success: true, data })
      } catch (error) {
        res.status(500).json({ success: false, error: error.message })
      }
    })

    // Estadísticas de la base de datos
    this.app.get('/stats', async (req, res) => {
      try {
        const stats = await this.getDatabaseStats()
        res.json({ success: true, data: stats })
      } catch (error) {
        res.status(500).json({ success: false, error: error.message })
      }
    })

    // Historial de queries
    this.app.get('/history', (req, res) => {
      res.json({
        success: true,
        data: this.queryHistory.slice(-100)
      })
    })

    // Test de conexión
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

  /**
   * Hook de inicio - conectar a la base de datos
   */
  async onStart() {
    try {
      await this.connect()
      this.log('info', `Connected to MySQL at ${this.dbConfig.host}:${this.dbConfig.port}`)
    } catch (error) {
      this.log('warn', `Could not connect to database: ${error.message}`)
    }
  }

  /**
   * Hook de parada - cerrar conexión
   */
  async onStop() {
    if (this.pool) {
      await this.pool.end()
      this.pool = null
      this.log('info', 'Database connection closed')
    }
  }

  /**
   * Conectar a la base de datos
   */
  async connect() {
    this.pool = mysql.createPool({
      host: this.dbConfig.host,
      port: this.dbConfig.port,
      user: this.dbConfig.user,
      password: this.dbConfig.password,
      database: this.dbConfig.database,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0
    })

    // Verificar conexión
    const connection = await this.pool.getConnection()
    connection.release()
  }

  /**
   * Reconectar con nueva configuración
   */
  async reconnect() {
    if (this.pool) {
      await this.pool.end()
    }
    await this.connect()
  }

  /**
   * Test de conexión
   */
  async testConnection(config) {
    const connection = await mysql.createConnection({
      host: config.host,
      port: config.port,
      user: config.user,
      password: config.password,
      database: config.database
    })
    await connection.end()
  }

  /**
   * Ejecutar query SQL
   */
  async executeQuery(sql, params = [], limit = 1000) {
    if (!this.pool) {
      throw new Error('Not connected to database')
    }

    const startTime = Date.now()

    try {
      const [rows, fields] = await this.pool.execute(sql, params)
      const executionTime = Date.now() - startTime

      // Registrar en historial
      this.queryHistory.push({
        sql,
        params,
        executionTime,
        rowCount: Array.isArray(rows) ? rows.length : rows.affectedRows,
        timestamp: new Date().toISOString()
      })

      // Limitar resultados si es SELECT
      if (Array.isArray(rows)) {
        return {
          columns: fields ? fields.map(f => f.name) : [],
          rows: rows.slice(0, limit),
          rowCount: rows.length,
          executionTime: `${executionTime}ms`,
          truncated: rows.length > limit
        }
      }

      // Para INSERT, UPDATE, DELETE
      return {
        affectedRows: rows.affectedRows,
        insertId: rows.insertId,
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

  /**
   * Obtener esquema completo de la base de datos
   */
  async getSchema() {
    const [databases] = await this.pool.execute('SELECT DATABASE() as db_name')
    const dbName = databases[0].db_name

    // Obtener tablas
    const [tables] = await this.pool.execute(`
      SELECT
        TABLE_NAME as name,
        TABLE_ROWS as row_count,
        DATA_LENGTH as data_size,
        TABLE_COMMENT as comment
      FROM information_schema.TABLES
      WHERE TABLE_SCHEMA = ?
      ORDER BY TABLE_NAME
    `, [dbName])

    // Obtener columnas para cada tabla
    const tablesWithColumns = await Promise.all(tables.map(async (table) => {
      const [columns] = await this.pool.execute(`
        SELECT
          COLUMN_NAME as name,
          COLUMN_TYPE as type,
          IS_NULLABLE as nullable,
          COLUMN_KEY as key_type,
          COLUMN_DEFAULT as default_value,
          EXTRA as extra
        FROM information_schema.COLUMNS
        WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ?
        ORDER BY ORDINAL_POSITION
      `, [dbName, table.name])

      return {
        ...table,
        columns: columns.map(col => ({
          name: col.name,
          type: col.type,
          nullable: col.nullable === 'YES',
          primaryKey: col.key_type === 'PRI',
          autoIncrement: col.extra?.includes('auto_increment'),
          defaultValue: col.default_value
        }))
      }
    }))

    return {
      database: dbName,
      tables: tablesWithColumns
    }
  }

  /**
   * Obtener lista de tablas
   */
  async getTables() {
    const [tables] = await this.pool.execute('SHOW TABLES')
    return tables.map(t => Object.values(t)[0])
  }

  /**
   * Obtener información detallada de una tabla
   */
  async getTableInfo(tableName) {
    const [columns] = await this.pool.execute(`DESCRIBE ${tableName}`)
    const [count] = await this.pool.execute(`SELECT COUNT(*) as count FROM ${tableName}`)

    return {
      name: tableName,
      columns: columns.map(col => ({
        name: col.Field,
        type: col.Type,
        nullable: col.Null === 'YES',
        primaryKey: col.Key === 'PRI',
        defaultValue: col.Default,
        extra: col.Extra
      })),
      rowCount: count[0].count
    }
  }

  /**
   * Obtener datos de una tabla
   */
  async getTableData(tableName, options = {}) {
    const { limit = 100, offset = 0, orderBy, orderDir = 'ASC' } = options

    let sql = `SELECT * FROM ${tableName}`

    if (orderBy) {
      sql += ` ORDER BY ${orderBy} ${orderDir}`
    }

    sql += ` LIMIT ${limit} OFFSET ${offset}`

    const [rows] = await this.pool.execute(sql)
    const [count] = await this.pool.execute(`SELECT COUNT(*) as total FROM ${tableName}`)

    return {
      rows,
      total: count[0].total,
      limit,
      offset
    }
  }

  /**
   * Obtener estadísticas de la base de datos
   */
  async getDatabaseStats() {
    const [databases] = await this.pool.execute('SELECT DATABASE() as db_name')
    const dbName = databases[0].db_name

    const [stats] = await this.pool.execute(`
      SELECT
        COUNT(*) as total_tables,
        SUM(TABLE_ROWS) as total_rows,
        SUM(DATA_LENGTH + INDEX_LENGTH) as total_size
      FROM information_schema.TABLES
      WHERE TABLE_SCHEMA = ?
    `, [dbName])

    const [version] = await this.pool.execute('SELECT VERSION() as version')

    return {
      database: dbName,
      version: version[0].version,
      totalTables: stats[0].total_tables || 0,
      totalRows: stats[0].total_rows || 0,
      totalSize: stats[0].total_size || 0,
      connectionPool: {
        total: this.pool.pool._allConnections.length,
        free: this.pool.pool._freeConnections.length
      }
    }
  }

  /**
   * Ejecutar acción (para integración con orquestador)
   */
  async execute(action, params) {
    switch (action) {
      case 'query':
        return await this.executeQuery(params.sql, params.params, params.limit)

      case 'schema':
        return await this.getSchema()

      case 'tables':
        return await this.getTables()

      case 'table-info':
        return await this.getTableInfo(params.tableName)

      case 'table-data':
        return await this.getTableData(params.tableName, params.options)

      case 'stats':
        return await this.getDatabaseStats()

      default:
        throw new Error(`Unknown action: ${action}`)
    }
  }

  /**
   * Handler de conexión Socket
   */
  onSocketConnection(socket) {
    // Query en tiempo real
    socket.on('query', async (data, callback) => {
      try {
        const result = await this.executeQuery(data.sql, data.params, data.limit)
        callback({ success: true, data: result })
      } catch (error) {
        callback({ success: false, error: error.message })
      }
    })

    // Suscripción a cambios (para triggers/eventos)
    socket.on('subscribe', (tableName) => {
      this.log('info', `Client ${socket.id} subscribed to ${tableName}`)
      socket.join(`table:${tableName}`)
    })
  }
}

export default MySQLAgent

// Si se ejecuta directamente
const isMainModule = process.argv[1]?.includes('MySQLAgent')
if (isMainModule) {
  const agent = new MySQLAgent({
    host: process.env.MYSQL_HOST || 'localhost',
    dbPort: parseInt(process.env.MYSQL_PORT) || 3307,
    user: process.env.MYSQL_USER || 'root',
    password: process.env.MYSQL_PASSWORD || 'root',
    database: process.env.MYSQL_DATABASE || 'alqvimia_rpa'
  })

  agent.start().catch(console.error)

  // Graceful shutdown
  process.on('SIGINT', async () => {
    console.log('\nShutting down...')
    await agent.stop()
    process.exit(0)
  })
}
