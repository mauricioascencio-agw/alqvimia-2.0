/**
 * ALQVIMIA RPA 2.0 - Servicio de Base de Datos MySQL
 * Conexión y operaciones con MySQL
 */

import mysql from 'mysql2/promise'

// Pool de conexiones
let pool = null

/**
 * Obtiene la configuración de la base de datos
 * Se llama en tiempo de ejecución (después de dotenv.config())
 */
function getDbConfig() {
  return {
    host: process.env.MYSQL_HOST || process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.MYSQL_PORT || process.env.DB_PORT) || 3307,
    user: process.env.MYSQL_USER || process.env.DB_USER || 'root',
    password: process.env.MYSQL_PASSWORD || process.env.DB_PASSWORD || '',
    database: process.env.MYSQL_DATABASE || process.env.DB_NAME || 'alqvimia_rpa',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    enableKeepAlive: true,
    keepAliveInitialDelay: 0
  }
}

/**
 * Inicializa el pool de conexiones
 */
export async function initDatabase() {
  try {
    const dbConfig = getDbConfig()
    pool = mysql.createPool(dbConfig)

    // Verificar conexión
    const connection = await pool.getConnection()
    console.log('[Database] Conexión a MySQL establecida correctamente')
    connection.release()

    return true
  } catch (error) {
    console.error('[Database] Error al conectar a MySQL:', error.message)
    console.log('[Database] La aplicación continuará sin base de datos')
    return false
  }
}

/**
 * Obtiene el pool de conexiones
 */
export function getPool() {
  return pool
}

/**
 * Ejecuta una consulta SQL
 */
export async function query(sql, params = []) {
  if (!pool) {
    throw new Error('Database no inicializada')
  }

  try {
    const [results] = await pool.execute(sql, params)
    return results
  } catch (error) {
    console.error('[Database] Error en query:', error.message)
    throw error
  }
}

/**
 * Ejecuta una consulta y retorna un solo resultado
 */
export async function queryOne(sql, params = []) {
  const results = await query(sql, params)
  return results[0] || null
}

/**
 * Inserta un registro y retorna el ID insertado
 */
export async function insert(table, data) {
  const keys = Object.keys(data)
  const values = Object.values(data)
  const placeholders = keys.map(() => '?').join(', ')

  const sql = `INSERT INTO ${table} (${keys.join(', ')}) VALUES (${placeholders})`
  const result = await query(sql, values)

  return result.insertId
}

/**
 * Actualiza registros en una tabla
 */
export async function update(table, data, where, whereParams = []) {
  const sets = Object.keys(data).map(key => `${key} = ?`).join(', ')
  const values = [...Object.values(data), ...whereParams]

  const sql = `UPDATE ${table} SET ${sets} WHERE ${where}`
  const result = await query(sql, values)

  return result.affectedRows
}

/**
 * Elimina registros de una tabla
 */
export async function remove(table, where, params = []) {
  const sql = `DELETE FROM ${table} WHERE ${where}`
  const result = await query(sql, params)

  return result.affectedRows
}

/**
 * Verifica si la base de datos está conectada
 */
export async function isConnected() {
  if (!pool) return false

  try {
    const connection = await pool.getConnection()
    connection.release()
    return true
  } catch {
    return false
  }
}

/**
 * Cierra el pool de conexiones
 */
export async function closeDatabase() {
  if (pool) {
    await pool.end()
    pool = null
    console.log('[Database] Conexiones cerradas')
  }
}

// =====================================================
// OPERACIONES ESPECÍFICAS DEL SISTEMA
// =====================================================

/**
 * Obtiene todas las configuraciones del sistema
 */
export async function getSystemConfigs() {
  if (!pool) return {}

  try {
    const results = await query('SELECT clave, valor, tipo FROM configuraciones_sistema')
    const configs = {}

    results.forEach(row => {
      let value = row.valor

      // Parsear según el tipo
      switch (row.tipo) {
        case 'number':
          value = parseFloat(value)
          break
        case 'boolean':
          value = value === 'true' || value === '1'
          break
        case 'json':
        case 'array':
          try {
            value = JSON.parse(value)
          } catch {
            // Mantener como string si falla el parse
          }
          break
      }

      configs[row.clave] = value
    })

    return configs
  } catch (error) {
    console.error('[Database] Error obteniendo configuraciones:', error.message)
    return {}
  }
}

/**
 * Guarda una configuración del sistema
 */
export async function setSystemConfig(clave, valor, tipo = 'string') {
  if (!pool) return false

  try {
    const valorStr = typeof valor === 'object' ? JSON.stringify(valor) : String(valor)

    await query(`
      INSERT INTO configuraciones_sistema (clave, valor, tipo)
      VALUES (?, ?, ?)
      ON DUPLICATE KEY UPDATE valor = ?, tipo = ?, updated_at = CURRENT_TIMESTAMP
    `, [clave, valorStr, tipo, valorStr, tipo])

    return true
  } catch (error) {
    console.error('[Database] Error guardando configuración:', error.message)
    return false
  }
}

/**
 * Obtiene la configuración de un usuario
 */
export async function getUserConfig(usuarioId) {
  if (!pool) return null

  try {
    return await queryOne(`
      SELECT tema, idioma, notificaciones_email, notificaciones_push,
             sidebar_collapsed, configuracion_json
      FROM configuraciones_usuario
      WHERE usuario_id = ?
    `, [usuarioId])
  } catch (error) {
    console.error('[Database] Error obteniendo config de usuario:', error.message)
    return null
  }
}

/**
 * Guarda la configuración de un usuario
 */
export async function saveUserConfig(usuarioId, config) {
  if (!pool) return false

  try {
    const { tema, idioma, notificaciones_email, notificaciones_push, sidebar_collapsed, configuracion_json } = config

    await query(`
      INSERT INTO configuraciones_usuario
        (usuario_id, tema, idioma, notificaciones_email, notificaciones_push, sidebar_collapsed, configuracion_json)
      VALUES (?, ?, ?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE
        tema = ?, idioma = ?, notificaciones_email = ?, notificaciones_push = ?,
        sidebar_collapsed = ?, configuracion_json = ?, updated_at = CURRENT_TIMESTAMP
    `, [
      usuarioId, tema, idioma, notificaciones_email, notificaciones_push, sidebar_collapsed,
      JSON.stringify(configuracion_json),
      tema, idioma, notificaciones_email, notificaciones_push, sidebar_collapsed,
      JSON.stringify(configuracion_json)
    ])

    return true
  } catch (error) {
    console.error('[Database] Error guardando config de usuario:', error.message)
    return false
  }
}

/**
 * Obtiene todos los temas disponibles
 */
export async function getThemes() {
  if (!pool) return []

  try {
    return await query(`
      SELECT id, nombre, slug, descripcion, es_predeterminado, es_personalizado,
             variables_css, preview_colors, activo
      FROM temas
      WHERE activo = TRUE
      ORDER BY es_predeterminado DESC, nombre ASC
    `)
  } catch (error) {
    console.error('[Database] Error obteniendo temas:', error.message)
    return []
  }
}

/**
 * Obtiene plantillas de IA
 */
export async function getAITemplates() {
  if (!pool) return []

  try {
    return await query(`
      SELECT id, nombre, descripcion, icono, tipo, modelo, configuracion, activo, es_premium
      FROM plantillas_ia
      WHERE activo = TRUE
      ORDER BY orden ASC, nombre ASC
    `)
  } catch (error) {
    console.error('[Database] Error obteniendo plantillas IA:', error.message)
    return []
  }
}

/**
 * Obtiene plantillas de agentes
 */
export async function getAgentTemplates() {
  if (!pool) return []

  try {
    return await query(`
      SELECT id, nombre, descripcion, icono, categoria, capacidades,
             configuracion_default, activo, es_premium
      FROM plantillas_agentes
      WHERE activo = TRUE
      ORDER BY orden ASC, nombre ASC
    `)
  } catch (error) {
    console.error('[Database] Error obteniendo plantillas agentes:', error.message)
    return []
  }
}

/**
 * Guarda un workflow en la base de datos
 */
export async function saveWorkflow(workflow) {
  if (!pool) return null

  try {
    const { uuid, nombre, descripcion, categoria, pasos, variables, configuracion, usuario_creador_id, carpeta_id } = workflow

    const data = {
      uuid,
      nombre,
      descripcion,
      categoria,
      pasos: JSON.stringify(pasos),
      variables: JSON.stringify(variables || {}),
      configuracion: JSON.stringify(configuracion || {}),
      usuario_creador_id
    }
    if (carpeta_id) data.carpeta_id = carpeta_id

    const id = await insert('workflows', data)

    return id
  } catch (error) {
    console.error('[Database] Error guardando workflow:', error.message)
    return null
  }
}

/**
 * Obtiene workflows de la base de datos
 */
export async function getWorkflows(filtros = {}) {
  if (!pool) return []

  try {
    let sql = `
      SELECT id, uuid, nombre, descripcion, categoria, version, estado,
             pasos, variables, configuracion, ejecuciones_totales,
             ultima_ejecucion, created_at, updated_at
      FROM workflows
      WHERE 1=1
    `
    const params = []

    if (filtros.categoria) {
      sql += ' AND categoria = ?'
      params.push(filtros.categoria)
    }

    if (filtros.estado) {
      sql += ' AND estado = ?'
      params.push(filtros.estado)
    }

    if (filtros.busqueda) {
      sql += ' AND (nombre LIKE ? OR descripcion LIKE ?)'
      params.push(`%${filtros.busqueda}%`, `%${filtros.busqueda}%`)
    }

    sql += ' ORDER BY updated_at DESC'

    if (filtros.limite) {
      sql += ' LIMIT ?'
      params.push(filtros.limite)
    }

    const results = await query(sql, params)

    // Parsear JSON
    return results.map(row => ({
      ...row,
      pasos: JSON.parse(row.pasos || '[]'),
      variables: JSON.parse(row.variables || '{}'),
      configuracion: JSON.parse(row.configuracion || '{}')
    }))
  } catch (error) {
    console.error('[Database] Error obteniendo workflows:', error.message)
    return []
  }
}

/**
 * Registra una ejecución de workflow
 */
export async function logExecution(workflowId, usuarioId, estado, resultado = null, error = null) {
  if (!pool) return null

  try {
    const id = await insert('ejecuciones', {
      workflow_id: workflowId,
      usuario_id: usuarioId,
      estado,
      resultado: resultado ? JSON.stringify(resultado) : null,
      error_mensaje: error
    })

    // Actualizar contador en workflow
    await query(`
      UPDATE workflows
      SET ejecuciones_totales = ejecuciones_totales + 1,
          ultima_ejecucion = CURRENT_TIMESTAMP
      WHERE id = ?
    `, [workflowId])

    return id
  } catch (error) {
    console.error('[Database] Error registrando ejecución:', error.message)
    return null
  }
}

/**
 * Registra un log del sistema
 */
export async function logSystem(nivel, categoria, mensaje, contexto = null, usuarioId = null) {
  if (!pool) return

  try {
    await insert('logs_sistema', {
      nivel,
      categoria,
      mensaje,
      contexto: contexto ? JSON.stringify(contexto) : null,
      usuario_id: usuarioId
    })
  } catch (error) {
    // Silenciar errores de logging para evitar loops
    console.error('[Database] Error en log:', error.message)
  }
}

// ==========================================
// DASHBOARD CREATOR
// ==========================================

export async function getDashboards(usuarioId, rol) {
  if (!pool) return []
  try {
    const [rows] = await pool.query(
      `SELECT * FROM dashboards
       WHERE usuario_id = ?
       OR tipo = 'compartido'
       OR JSON_CONTAINS(roles_acceso, ?)
       ORDER BY orden ASC, updated_at DESC`,
      [usuarioId, JSON.stringify(rol)]
    )
    rows.forEach(r => {
      if (r.widgets && typeof r.widgets === 'string') r.widgets = JSON.parse(r.widgets)
      if (r.configuracion && typeof r.configuracion === 'string') r.configuracion = JSON.parse(r.configuracion)
      if (r.roles_acceso && typeof r.roles_acceso === 'string') r.roles_acceso = JSON.parse(r.roles_acceso)
      if (r.compartido_con && typeof r.compartido_con === 'string') r.compartido_con = JSON.parse(r.compartido_con)
    })
    return rows
  } catch (error) {
    console.error('[Database] Error getDashboards:', error.message)
    return []
  }
}

export async function getDashboardById(id) {
  if (!pool) return null
  try {
    const [rows] = await pool.query('SELECT * FROM dashboards WHERE id = ? OR uuid = ?', [id, id])
    const row = rows[0]
    if (row) {
      if (row.widgets && typeof row.widgets === 'string') row.widgets = JSON.parse(row.widgets)
      if (row.configuracion && typeof row.configuracion === 'string') row.configuracion = JSON.parse(row.configuracion)
      if (row.roles_acceso && typeof row.roles_acceso === 'string') row.roles_acceso = JSON.parse(row.roles_acceso)
      if (row.compartido_con && typeof row.compartido_con === 'string') row.compartido_con = JSON.parse(row.compartido_con)
    }
    return row || null
  } catch (error) {
    console.error('[Database] Error getDashboardById:', error.message)
    return null
  }
}

export async function createDashboard(data) {
  if (!pool) return null
  try {
    const uuid = crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(36) + Math.random().toString(36).substr(2)
    const [result] = await pool.query(
      `INSERT INTO dashboards (uuid, nombre, descripcion, usuario_id, tipo, widgets, configuracion, estado, slug, roles_acceso, orden)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        uuid,
        data.nombre,
        data.descripcion || null,
        data.usuario_id,
        data.tipo || 'personal',
        JSON.stringify(data.widgets || []),
        JSON.stringify(data.configuracion || {}),
        data.estado || 'borrador',
        data.slug || null,
        JSON.stringify(data.roles_acceso || []),
        data.orden || 0
      ]
    )
    return { id: result.insertId, uuid }
  } catch (error) {
    console.error('[Database] Error createDashboard:', error.message)
    return null
  }
}

export async function updateDashboard(id, data) {
  if (!pool) return false
  try {
    const fields = []
    const values = []
    if (data.nombre !== undefined) { fields.push('nombre = ?'); values.push(data.nombre) }
    if (data.descripcion !== undefined) { fields.push('descripcion = ?'); values.push(data.descripcion) }
    if (data.tipo !== undefined) { fields.push('tipo = ?'); values.push(data.tipo) }
    if (data.widgets !== undefined) { fields.push('widgets = ?'); values.push(JSON.stringify(data.widgets)) }
    if (data.configuracion !== undefined) { fields.push('configuracion = ?'); values.push(JSON.stringify(data.configuracion)) }
    if (data.estado !== undefined) { fields.push('estado = ?'); values.push(data.estado) }
    if (data.slug !== undefined) { fields.push('slug = ?'); values.push(data.slug) }
    if (data.roles_acceso !== undefined) { fields.push('roles_acceso = ?'); values.push(JSON.stringify(data.roles_acceso)) }
    if (data.orden !== undefined) { fields.push('orden = ?'); values.push(data.orden) }
    if (fields.length === 0) return false
    values.push(id)
    await pool.query(`UPDATE dashboards SET ${fields.join(', ')} WHERE id = ? OR uuid = ?`, [...values, id])
    return true
  } catch (error) {
    console.error('[Database] Error updateDashboard:', error.message)
    return false
  }
}

export async function deleteDashboard(id) {
  if (!pool) return false
  try {
    await pool.query('DELETE FROM dashboards WHERE id = ? OR uuid = ?', [id, id])
    return true
  } catch (error) {
    console.error('[Database] Error deleteDashboard:', error.message)
    return false
  }
}

export async function getDashboardRolePermisos() {
  if (!pool) return []
  try {
    const [rows] = await pool.query('SELECT * FROM dashboard_permisos_roles ORDER BY FIELD(rol, "admin", "usuario", "operador", "viewer")')
    return rows
  } catch (error) {
    console.error('[Database] Error getDashboardRolePermisos:', error.message)
    return []
  }
}

export async function updateDashboardRolePermisos(rol, permisos) {
  if (!pool) return false
  try {
    await pool.query(
      `UPDATE dashboard_permisos_roles SET puede_ver = ?, puede_crear = ?, puede_editar = ?, puede_compartir = ?, puede_crear_minisite = ?, max_dashboards = ? WHERE rol = ?`,
      [permisos.puede_ver, permisos.puede_crear, permisos.puede_editar, permisos.puede_compartir, permisos.puede_crear_minisite, permisos.max_dashboards, rol]
    )
    return true
  } catch (error) {
    console.error('[Database] Error updateDashboardRolePermisos:', error.message)
    return false
  }
}

export async function getDashboardPermisosForRole(rol) {
  if (!pool) return null
  try {
    const [rows] = await pool.query('SELECT * FROM dashboard_permisos_roles WHERE rol = ?', [rol])
    return rows[0] || null
  } catch (error) {
    console.error('[Database] Error getDashboardPermisosForRole:', error.message)
    return null
  }
}

export async function getWidgetData(tipo, config = {}) {
  if (!pool) return null
  try {
    switch (tipo) {
      case 'workflows_total': {
        const [rows] = await pool.query('SELECT COUNT(*) as total FROM workflows')
        return { valor: rows[0].total }
      }
      case 'workflows_activos': {
        const [rows] = await pool.query("SELECT COUNT(*) as total FROM workflows WHERE estado = 'activo'")
        return { valor: rows[0].total }
      }
      case 'ejecuciones_total': {
        const [rows] = await pool.query('SELECT COUNT(*) as total FROM ejecuciones')
        return { valor: rows[0].total }
      }
      case 'ejecuciones_exitosas': {
        const [rows] = await pool.query("SELECT COUNT(*) as total FROM ejecuciones WHERE estado = 'completado'")
        return { valor: rows[0].total }
      }
      case 'ejecuciones_fallidas': {
        const [rows] = await pool.query("SELECT COUNT(*) as total FROM ejecuciones WHERE estado = 'fallido'")
        return { valor: rows[0].total }
      }
      case 'usuarios_total': {
        const [rows] = await pool.query('SELECT COUNT(*) as total FROM usuarios')
        return { valor: rows[0].total }
      }
      case 'usuarios_activos': {
        const [rows] = await pool.query("SELECT COUNT(*) as total FROM usuarios WHERE activo = 1")
        return { valor: rows[0].total }
      }
      case 'ejecuciones_por_dia': {
        const dias = config.dias || 7
        const [rows] = await pool.query(
          `SELECT DATE(inicio) as fecha, COUNT(*) as total,
           SUM(CASE WHEN estado = 'completado' THEN 1 ELSE 0 END) as exitosas,
           SUM(CASE WHEN estado = 'fallido' THEN 1 ELSE 0 END) as fallidas
           FROM ejecuciones WHERE inicio >= DATE_SUB(NOW(), INTERVAL ? DAY)
           GROUP BY DATE(inicio) ORDER BY fecha`,
          [dias]
        )
        return { datos: rows }
      }
      case 'workflows_recientes': {
        const limite = config.limite || 10
        const [rows] = await pool.query(
          'SELECT id, nombre, categoria, estado, ejecuciones_totales, ultima_ejecucion, updated_at FROM workflows ORDER BY updated_at DESC LIMIT ?',
          [limite]
        )
        return { datos: rows }
      }
      case 'ejecuciones_recientes': {
        const limite = config.limite || 10
        const [rows] = await pool.query(
          `SELECT e.id, e.estado, e.inicio, e.fin, e.duracion_ms, e.error_mensaje,
           w.nombre as workflow_nombre
           FROM ejecuciones e LEFT JOIN workflows w ON e.workflow_id = w.id
           ORDER BY e.inicio DESC LIMIT ?`,
          [limite]
        )
        return { datos: rows }
      }
      default:
        return { valor: 0 }
    }
  } catch (error) {
    console.error('[Database] Error getWidgetData:', error.message)
    return null
  }
}

export default {
  initDatabase,
  getPool,
  query,
  queryOne,
  insert,
  update,
  remove,
  isConnected,
  closeDatabase,
  getSystemConfigs,
  setSystemConfig,
  getUserConfig,
  saveUserConfig,
  getThemes,
  getAITemplates,
  getAgentTemplates,
  saveWorkflow,
  getWorkflows,
  logExecution,
  logSystem,
  getDashboards,
  getDashboardById,
  createDashboard,
  updateDashboard,
  deleteDashboard,
  getDashboardRolePermisos,
  updateDashboardRolePermisos,
  getDashboardPermisosForRole,
  getWidgetData
}
