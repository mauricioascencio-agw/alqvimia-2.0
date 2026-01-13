const { Pool } = require('pg')

// Connection pools by tenant
const pools = new Map()

// Default pool configuration
const defaultConfig = {
  host: process.env.PG_HOST || 'localhost',
  port: parseInt(process.env.PG_PORT || '5432'),
  user: process.env.PG_USER || 'alqvimia',
  password: process.env.PG_PASSWORD || 'alqvimia_password',
  database: process.env.PG_DATABASE || 'alqvimia',
  max: parseInt(process.env.PG_POOL_SIZE || '20'),
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000
}

class PostgresConnection {
  /**
   * Get or create connection pool for tenant
   */
  getPool(tenantId = 'default') {
    if (!pools.has(tenantId)) {
      const config = this.getConfigForTenant(tenantId)
      const pool = new Pool(config)

      // Handle pool errors
      pool.on('error', (err) => {
        console.error(`Postgres pool error for tenant ${tenantId}:`, err)
      })

      pools.set(tenantId, pool)
    }

    return pools.get(tenantId)
  }

  /**
   * Get config for specific tenant
   */
  getConfigForTenant(tenantId) {
    // In production, load tenant-specific config from a config service
    // For now, use schema-based multi-tenancy
    return {
      ...defaultConfig,
      // Each tenant gets their own schema
      options: `-c search_path=${tenantId.replace(/[^a-zA-Z0-9_]/g, '_')},public`
    }
  }

  /**
   * Execute query
   */
  async query(sql, params = [], tenantId = 'default') {
    const pool = this.getPool(tenantId)
    const start = Date.now()

    try {
      const result = await pool.query(sql, params)
      const duration = Date.now() - start

      // Log slow queries
      if (duration > 1000) {
        console.warn(`Slow query (${duration}ms):`, sql.substring(0, 100))
      }

      return {
        rows: result.rows,
        rowCount: result.rowCount,
        fields: result.fields?.map(f => f.name),
        duration
      }
    } catch (error) {
      console.error('Query error:', error.message)
      throw error
    }
  }

  /**
   * Execute transaction
   */
  async transaction(queries, tenantId = 'default') {
    const pool = this.getPool(tenantId)
    const client = await pool.connect()

    try {
      await client.query('BEGIN')

      const results = []
      for (const { sql, params } of queries) {
        const result = await client.query(sql, params)
        results.push({
          rows: result.rows,
          rowCount: result.rowCount
        })
      }

      await client.query('COMMIT')
      return { success: true, results }
    } catch (error) {
      await client.query('ROLLBACK')
      throw error
    } finally {
      client.release()
    }
  }

  /**
   * Create tenant schema
   */
  async createTenantSchema(tenantId) {
    const schemaName = tenantId.replace(/[^a-zA-Z0-9_]/g, '_')
    const pool = this.getPool('default')

    await pool.query(`CREATE SCHEMA IF NOT EXISTS ${schemaName}`)

    // Run tenant migrations
    await this.runTenantMigrations(schemaName)

    return { schema: schemaName }
  }

  /**
   * Run migrations for tenant schema
   */
  async runTenantMigrations(schemaName) {
    const migrations = [
      `CREATE TABLE IF NOT EXISTS ${schemaName}.users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        email VARCHAR(255) UNIQUE NOT NULL,
        name VARCHAR(255) NOT NULL,
        role VARCHAR(50) DEFAULT 'user',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )`,
      `CREATE TABLE IF NOT EXISTS ${schemaName}.projects (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(255) NOT NULL,
        description TEXT,
        status VARCHAR(50) DEFAULT 'active',
        created_by UUID REFERENCES ${schemaName}.users(id),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )`,
      `CREATE TABLE IF NOT EXISTS ${schemaName}.workflows (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        project_id UUID REFERENCES ${schemaName}.projects(id),
        name VARCHAR(255) NOT NULL,
        config JSONB DEFAULT '{}',
        version INTEGER DEFAULT 1,
        status VARCHAR(50) DEFAULT 'draft',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )`,
      `CREATE TABLE IF NOT EXISTS ${schemaName}.agents (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        project_id UUID REFERENCES ${schemaName}.projects(id),
        name VARCHAR(255) NOT NULL,
        config JSONB DEFAULT '{}',
        model VARCHAR(100),
        status VARCHAR(50) DEFAULT 'inactive',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )`,
      `CREATE TABLE IF NOT EXISTS ${schemaName}.executions (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        workflow_id UUID REFERENCES ${schemaName}.workflows(id),
        agent_id UUID REFERENCES ${schemaName}.agents(id),
        status VARCHAR(50) DEFAULT 'pending',
        input JSONB,
        output JSONB,
        error TEXT,
        duration_ms INTEGER,
        started_at TIMESTAMP,
        completed_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )`,
      `CREATE TABLE IF NOT EXISTS ${schemaName}.audit_logs (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES ${schemaName}.users(id),
        action VARCHAR(100) NOT NULL,
        resource_type VARCHAR(100),
        resource_id UUID,
        details JSONB,
        ip_address INET,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )`
    ]

    const pool = this.getPool('default')
    for (const sql of migrations) {
      await pool.query(sql)
    }
  }

  /**
   * Drop tenant schema
   */
  async dropTenantSchema(tenantId) {
    const schemaName = tenantId.replace(/[^a-zA-Z0-9_]/g, '_')
    const pool = this.getPool('default')

    await pool.query(`DROP SCHEMA IF EXISTS ${schemaName} CASCADE`)

    // Remove pool
    if (pools.has(tenantId)) {
      await pools.get(tenantId).end()
      pools.delete(tenantId)
    }

    return { dropped: schemaName }
  }

  /**
   * Health check
   */
  async healthCheck() {
    try {
      const pool = this.getPool('default')
      const result = await pool.query('SELECT NOW() as time, current_database() as database')

      return {
        status: 'healthy',
        database: result.rows[0].database,
        serverTime: result.rows[0].time,
        poolCount: pools.size
      }
    } catch (error) {
      return {
        status: 'unhealthy',
        error: error.message
      }
    }
  }

  /**
   * Close all connections
   */
  async closeAll() {
    for (const [tenantId, pool] of pools.entries()) {
      await pool.end()
      pools.delete(tenantId)
    }
  }
}

module.exports = new PostgresConnection()
