/**
 * ALQVIMIA RPA 2.0 - Rutas MCP Database
 * Endpoints API para explorar esquemas y ejecutar queries
 */

import express from 'express'
import * as db from '../services/database.js'

const router = express.Router()

// =====================================================
// SCHEMA / METADATOS
// =====================================================

/**
 * GET /api/mcp/schema
 * Obtiene el esquema completo de la base de datos
 */
router.get('/schema', async (req, res) => {
  try {
    const pool = db.getPool()
    if (!pool) {
      return res.status(503).json({
        success: false,
        error: 'Base de datos no conectada'
      })
    }

    // Obtener el nombre de la base de datos actual
    const [dbResult] = await pool.execute('SELECT DATABASE() as db_name')
    const dbName = dbResult[0].db_name

    // Obtener todas las tablas con información
    const [tables] = await pool.execute(`
      SELECT
        TABLE_NAME as name,
        TABLE_ROWS as row_count,
        DATA_LENGTH as data_size,
        TABLE_COMMENT as comment
      FROM information_schema.TABLES
      WHERE TABLE_SCHEMA = ?
      ORDER BY TABLE_NAME
    `, [dbName])

    // Para cada tabla, obtener columnas
    const tablesWithColumns = await Promise.all(tables.map(async (table) => {
      // Obtener columnas
      const [columns] = await pool.execute(`
        SELECT
          COLUMN_NAME as name,
          COLUMN_TYPE as type,
          IS_NULLABLE as nullable,
          COLUMN_KEY as column_key,
          COLUMN_DEFAULT as default_value,
          EXTRA as extra,
          COLUMN_COMMENT as comment
        FROM information_schema.COLUMNS
        WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ?
        ORDER BY ORDINAL_POSITION
      `, [dbName, table.name])

      // Obtener índices
      const [indexes] = await pool.execute(`
        SELECT DISTINCT INDEX_NAME as name
        FROM information_schema.STATISTICS
        WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ?
      `, [dbName, table.name])

      // Obtener foreign keys
      const [foreignKeys] = await pool.execute(`
        SELECT
          COLUMN_NAME as column_name,
          REFERENCED_TABLE_NAME as ref_table,
          REFERENCED_COLUMN_NAME as ref_column
        FROM information_schema.KEY_COLUMN_USAGE
        WHERE TABLE_SCHEMA = ?
          AND TABLE_NAME = ?
          AND REFERENCED_TABLE_NAME IS NOT NULL
      `, [dbName, table.name])

      // Mapear columnas con formato consistente
      const mappedColumns = columns.map(col => ({
        name: col.name,
        type: col.type,
        primaryKey: col.column_key === 'PRI',
        nullable: col.nullable === 'YES',
        defaultValue: col.default_value,
        autoIncrement: col.extra?.includes('auto_increment'),
        foreignKey: foreignKeys.find(fk => fk.column_name === col.name)
          ? `${foreignKeys.find(fk => fk.column_name === col.name).ref_table}.${foreignKeys.find(fk => fk.column_name === col.name).ref_column}`
          : null
      }))

      return {
        name: table.name,
        columns: mappedColumns,
        rowCount: table.row_count || 0,
        dataSize: table.data_size || 0,
        comment: table.comment || '',
        indexes: indexes.map(idx => idx.name).filter(n => n !== 'PRIMARY')
      }
    }))

    // Obtener vistas
    const [views] = await pool.execute(`
      SELECT
        TABLE_NAME as name,
        VIEW_DEFINITION as definition
      FROM information_schema.VIEWS
      WHERE TABLE_SCHEMA = ?
      ORDER BY TABLE_NAME
    `, [dbName])

    // Obtener funciones y procedimientos
    const [routines] = await pool.execute(`
      SELECT
        ROUTINE_NAME as name,
        ROUTINE_TYPE as type,
        DTD_IDENTIFIER as returns
      FROM information_schema.ROUTINES
      WHERE ROUTINE_SCHEMA = ?
      ORDER BY ROUTINE_NAME
    `, [dbName])

    const functions = routines.filter(r => r.type === 'FUNCTION').map(f => ({
      name: f.name,
      returns: f.returns || 'VOID'
    }))

    const procedures = routines.filter(r => r.type === 'PROCEDURE').map(p => ({
      name: p.name
    }))

    res.json({
      success: true,
      data: {
        schemas: [
          {
            name: dbName,
            tables: tablesWithColumns,
            views: views.map(v => ({
              name: v.name,
              definition: v.definition ? v.definition.substring(0, 200) + '...' : ''
            })),
            functions,
            procedures
          }
        ]
      }
    })
  } catch (error) {
    console.error('[MCP Database] Error obteniendo schema:', error)
    res.status(500).json({
      success: false,
      error: error.message
    })
  }
})

/**
 * GET /api/mcp/tables
 * Obtiene lista simple de tablas
 */
router.get('/tables', async (req, res) => {
  try {
    const pool = db.getPool()
    if (!pool) {
      return res.status(503).json({
        success: false,
        error: 'Base de datos no conectada'
      })
    }

    const [tables] = await pool.execute('SHOW TABLES')
    const tableNames = tables.map(t => Object.values(t)[0])

    res.json({
      success: true,
      data: tableNames
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    })
  }
})

/**
 * GET /api/mcp/table/:tableName
 * Obtiene información detallada de una tabla
 */
router.get('/table/:tableName', async (req, res) => {
  try {
    const { tableName } = req.params
    const pool = db.getPool()

    if (!pool) {
      return res.status(503).json({
        success: false,
        error: 'Base de datos no conectada'
      })
    }

    // Obtener estructura de la tabla
    const [columns] = await pool.execute(`DESCRIBE ${tableName}`)

    // Obtener conteo de filas
    const [countResult] = await pool.execute(`SELECT COUNT(*) as count FROM ${tableName}`)

    res.json({
      success: true,
      data: {
        name: tableName,
        columns: columns.map(col => ({
          name: col.Field,
          type: col.Type,
          nullable: col.Null === 'YES',
          primaryKey: col.Key === 'PRI',
          defaultValue: col.Default,
          extra: col.Extra
        })),
        rowCount: countResult[0].count
      }
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    })
  }
})

// =====================================================
// EJECUCIÓN DE QUERIES
// =====================================================

/**
 * POST /api/mcp/query
 * Ejecuta una consulta SQL
 */
router.post('/query', async (req, res) => {
  try {
    const { sql, limit = 100 } = req.body
    const pool = db.getPool()

    if (!pool) {
      return res.status(503).json({
        success: false,
        error: 'Base de datos no conectada'
      })
    }

    if (!sql || !sql.trim()) {
      return res.status(400).json({
        success: false,
        error: 'Se requiere una consulta SQL'
      })
    }

    // Medir tiempo de ejecución
    const startTime = Date.now()

    // Detectar tipo de consulta
    const sqlTrimmed = sql.trim().toUpperCase()
    const isSelect = sqlTrimmed.startsWith('SELECT') || sqlTrimmed.startsWith('SHOW') || sqlTrimmed.startsWith('DESCRIBE')

    // Ejecutar la consulta
    const [results, fields] = await pool.execute(sql)
    const executionTime = Date.now() - startTime

    if (isSelect) {
      // Para SELECT, retornar resultados
      const columns = fields ? fields.map(f => f.name) : Object.keys(results[0] || {})

      res.json({
        success: true,
        data: {
          columns,
          rows: results.slice(0, limit),
          rowCount: results.length,
          executionTime: `${executionTime}ms`,
          truncated: results.length > limit
        }
      })
    } else {
      // Para INSERT, UPDATE, DELETE
      res.json({
        success: true,
        data: {
          affectedRows: results.affectedRows,
          insertId: results.insertId,
          executionTime: `${executionTime}ms`,
          message: `Query ejecutada exitosamente. Filas afectadas: ${results.affectedRows}`
        }
      })
    }
  } catch (error) {
    console.error('[MCP Database] Error ejecutando query:', error)
    res.status(400).json({
      success: false,
      error: error.message,
      sqlState: error.sqlState,
      errno: error.errno
    })
  }
})

/**
 * POST /api/mcp/test-connection
 * Prueba la conexión a la base de datos
 */
router.post('/test-connection', async (req, res) => {
  try {
    const connected = await db.isConnected()

    if (connected) {
      const pool = db.getPool()
      const [result] = await pool.execute('SELECT VERSION() as version, DATABASE() as db_name')

      res.json({
        success: true,
        data: {
          connected: true,
          serverVersion: result[0].version,
          database: result[0].db_name,
          message: 'Conexión exitosa'
        }
      })
    } else {
      res.json({
        success: false,
        data: {
          connected: false,
          message: 'No hay conexión a la base de datos'
        }
      })
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    })
  }
})

/**
 * GET /api/mcp/stats
 * Obtiene estadísticas de la base de datos
 */
router.get('/stats', async (req, res) => {
  try {
    const pool = db.getPool()
    if (!pool) {
      return res.status(503).json({
        success: false,
        error: 'Base de datos no conectada'
      })
    }

    const [dbResult] = await pool.execute('SELECT DATABASE() as db_name')
    const dbName = dbResult[0].db_name

    // Estadísticas generales
    const [tableStats] = await pool.execute(`
      SELECT
        COUNT(*) as total_tables,
        SUM(TABLE_ROWS) as total_rows,
        SUM(DATA_LENGTH + INDEX_LENGTH) as total_size
      FROM information_schema.TABLES
      WHERE TABLE_SCHEMA = ?
    `, [dbName])

    const [columnCount] = await pool.execute(`
      SELECT COUNT(*) as total_columns
      FROM information_schema.COLUMNS
      WHERE TABLE_SCHEMA = ?
    `, [dbName])

    const [indexCount] = await pool.execute(`
      SELECT COUNT(DISTINCT INDEX_NAME) as total_indexes
      FROM information_schema.STATISTICS
      WHERE TABLE_SCHEMA = ?
    `, [dbName])

    const [viewCount] = await pool.execute(`
      SELECT COUNT(*) as total_views
      FROM information_schema.VIEWS
      WHERE TABLE_SCHEMA = ?
    `, [dbName])

    const [routineCount] = await pool.execute(`
      SELECT
        SUM(CASE WHEN ROUTINE_TYPE = 'FUNCTION' THEN 1 ELSE 0 END) as total_functions,
        SUM(CASE WHEN ROUTINE_TYPE = 'PROCEDURE' THEN 1 ELSE 0 END) as total_procedures
      FROM information_schema.ROUTINES
      WHERE ROUTINE_SCHEMA = ?
    `, [dbName])

    res.json({
      success: true,
      data: {
        database: dbName,
        totalTables: tableStats[0].total_tables || 0,
        totalRows: tableStats[0].total_rows || 0,
        totalSize: tableStats[0].total_size || 0,
        totalColumns: columnCount[0].total_columns || 0,
        totalIndexes: indexCount[0].total_indexes || 0,
        totalViews: viewCount[0].total_views || 0,
        totalFunctions: routineCount[0].total_functions || 0,
        totalProcedures: routineCount[0].total_procedures || 0,
        analyzedAt: new Date().toISOString()
      }
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    })
  }
})

export default router
