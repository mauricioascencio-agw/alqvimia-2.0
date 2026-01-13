/**
 * ALQVIMIA RPA 2.0 - Rutas de Usuarios
 * CRUD de usuarios (solo admin)
 */

import express from 'express'
import bcrypt from 'bcryptjs'
import * as db from '../services/database.js'
import { authMiddleware, adminMiddleware } from './auth.js'

const router = express.Router()

// Aplicar middleware de autenticación a todas las rutas
router.use(authMiddleware)

// =====================================================
// CRUD DE USUARIOS
// =====================================================

/**
 * GET /api/users
 * Listar todos los usuarios (admin)
 */
router.get('/', adminMiddleware, async (req, res) => {
  try {
    const { busqueda, rol, activo, limite = 50, offset = 0 } = req.query

    let sql = `
      SELECT id, nombre, email, rol, avatar, activo, ultimo_acceso, created_at
      FROM usuarios
      WHERE 1=1
    `
    const params = []

    if (busqueda) {
      sql += ' AND (nombre LIKE ? OR email LIKE ?)'
      params.push(`%${busqueda}%`, `%${busqueda}%`)
    }

    if (rol) {
      sql += ' AND rol = ?'
      params.push(rol)
    }

    if (activo !== undefined) {
      sql += ' AND activo = ?'
      params.push(activo === 'true' || activo === '1')
    }

    sql += ' ORDER BY created_at DESC LIMIT ? OFFSET ?'
    params.push(parseInt(limite), parseInt(offset))

    const users = await db.query(sql, params)

    // Contar total
    const [{ total }] = await db.query(
      'SELECT COUNT(*) as total FROM usuarios',
      []
    )

    res.json({
      success: true,
      data: users,
      pagination: {
        total,
        limite: parseInt(limite),
        offset: parseInt(offset)
      }
    })
  } catch (error) {
    console.error('[Users] Error listando usuarios:', error)
    res.status(500).json({
      success: false,
      error: error.message
    })
  }
})

/**
 * GET /api/users/:id
 * Obtener un usuario por ID
 */
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params

    // Solo admin puede ver otros usuarios, usuarios normales solo su propio perfil
    if (req.user.rol !== 'admin' && req.user.id !== parseInt(id)) {
      return res.status(403).json({
        success: false,
        error: 'Acceso denegado'
      })
    }

    const user = await db.queryOne(
      'SELECT id, nombre, email, rol, avatar, activo, ultimo_acceso, created_at FROM usuarios WHERE id = ?',
      [id]
    )

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'Usuario no encontrado'
      })
    }

    // Obtener configuración
    const config = await db.getUserConfig(user.id)

    res.json({
      success: true,
      data: { ...user, config }
    })
  } catch (error) {
    console.error('[Users] Error obteniendo usuario:', error)
    res.status(500).json({
      success: false,
      error: error.message
    })
  }
})

/**
 * POST /api/users
 * Crear un nuevo usuario (admin)
 */
router.post('/', adminMiddleware, async (req, res) => {
  try {
    const { nombre, email, password, rol = 'usuario', activo = true } = req.body

    if (!nombre || !email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Nombre, email y contraseña son requeridos'
      })
    }

    // Verificar email único
    const existing = await db.queryOne('SELECT id FROM usuarios WHERE email = ?', [email])
    if (existing) {
      return res.status(400).json({
        success: false,
        error: 'El email ya está en uso'
      })
    }

    // Encriptar contraseña
    const salt = await bcrypt.genSalt(10)
    const passwordHash = await bcrypt.hash(password, salt)

    // Crear usuario
    const userId = await db.insert('usuarios', {
      nombre,
      email,
      password_hash: passwordHash,
      rol: ['admin', 'usuario', 'operador', 'viewer'].includes(rol) ? rol : 'usuario',
      activo: activo ? 1 : 0
    })

    // Crear configuración por defecto
    await db.query(`
      INSERT INTO configuraciones_usuario (usuario_id, tema, idioma)
      VALUES (?, 'midnight-blue', 'es')
    `, [userId])

    res.status(201).json({
      success: true,
      data: { id: userId, nombre, email, rol },
      message: 'Usuario creado exitosamente'
    })
  } catch (error) {
    console.error('[Users] Error creando usuario:', error)
    res.status(500).json({
      success: false,
      error: error.message
    })
  }
})

/**
 * PUT /api/users/:id
 * Actualizar usuario
 */
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params
    const { nombre, email, rol, activo, avatar, password } = req.body

    // Solo admin puede editar otros usuarios
    if (req.user.rol !== 'admin' && req.user.id !== parseInt(id)) {
      return res.status(403).json({
        success: false,
        error: 'Acceso denegado'
      })
    }

    // Usuarios normales no pueden cambiar su propio rol
    if (req.user.rol !== 'admin' && rol !== undefined) {
      return res.status(403).json({
        success: false,
        error: 'No puede cambiar su propio rol'
      })
    }

    // Construir objeto de actualización
    const updateData = {}
    if (nombre !== undefined) updateData.nombre = nombre
    if (email !== undefined) {
      // Verificar email único
      const existing = await db.queryOne(
        'SELECT id FROM usuarios WHERE email = ? AND id != ?',
        [email, id]
      )
      if (existing) {
        return res.status(400).json({
          success: false,
          error: 'El email ya está en uso'
        })
      }
      updateData.email = email
    }
    if (rol !== undefined && req.user.rol === 'admin') updateData.rol = rol
    if (activo !== undefined && req.user.rol === 'admin') updateData.activo = activo ? 1 : 0
    if (avatar !== undefined) updateData.avatar = avatar

    // Si hay nueva contraseña
    if (password) {
      const salt = await bcrypt.genSalt(10)
      updateData.password_hash = await bcrypt.hash(password, salt)
    }

    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({
        success: false,
        error: 'No hay datos para actualizar'
      })
    }

    const affected = await db.update('usuarios', updateData, 'id = ?', [id])

    if (affected === 0) {
      return res.status(404).json({
        success: false,
        error: 'Usuario no encontrado'
      })
    }

    res.json({
      success: true,
      message: 'Usuario actualizado exitosamente'
    })
  } catch (error) {
    console.error('[Users] Error actualizando usuario:', error)
    res.status(500).json({
      success: false,
      error: error.message
    })
  }
})

/**
 * DELETE /api/users/:id
 * Eliminar usuario (admin)
 */
router.delete('/:id', adminMiddleware, async (req, res) => {
  try {
    const { id } = req.params

    // No permitir eliminar el propio usuario admin
    if (req.user.id === parseInt(id)) {
      return res.status(400).json({
        success: false,
        error: 'No puede eliminar su propia cuenta'
      })
    }

    const affected = await db.remove('usuarios', 'id = ?', [id])

    if (affected === 0) {
      return res.status(404).json({
        success: false,
        error: 'Usuario no encontrado'
      })
    }

    res.json({
      success: true,
      message: 'Usuario eliminado exitosamente'
    })
  } catch (error) {
    console.error('[Users] Error eliminando usuario:', error)
    res.status(500).json({
      success: false,
      error: error.message
    })
  }
})

/**
 * PUT /api/users/:id/toggle-status
 * Activar/desactivar usuario (admin)
 */
router.put('/:id/toggle-status', adminMiddleware, async (req, res) => {
  try {
    const { id } = req.params

    // No permitir desactivar el propio usuario
    if (req.user.id === parseInt(id)) {
      return res.status(400).json({
        success: false,
        error: 'No puede desactivar su propia cuenta'
      })
    }

    // Obtener estado actual
    const user = await db.queryOne('SELECT activo FROM usuarios WHERE id = ?', [id])
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'Usuario no encontrado'
      })
    }

    // Toggle
    await db.update('usuarios', { activo: user.activo ? 0 : 1 }, 'id = ?', [id])

    res.json({
      success: true,
      data: { activo: !user.activo },
      message: user.activo ? 'Usuario desactivado' : 'Usuario activado'
    })
  } catch (error) {
    console.error('[Users] Error cambiando estado:', error)
    res.status(500).json({
      success: false,
      error: error.message
    })
  }
})

/**
 * GET /api/users/stats/summary
 * Estadísticas de usuarios (admin)
 */
router.get('/stats/summary', adminMiddleware, async (req, res) => {
  try {
    const stats = await db.query(`
      SELECT
        COUNT(*) as total,
        SUM(CASE WHEN activo = 1 THEN 1 ELSE 0 END) as activos,
        SUM(CASE WHEN activo = 0 THEN 1 ELSE 0 END) as inactivos,
        SUM(CASE WHEN rol = 'admin' THEN 1 ELSE 0 END) as admins,
        SUM(CASE WHEN rol = 'usuario' THEN 1 ELSE 0 END) as usuarios,
        SUM(CASE WHEN rol = 'operador' THEN 1 ELSE 0 END) as operadores,
        SUM(CASE WHEN rol = 'viewer' THEN 1 ELSE 0 END) as viewers,
        SUM(CASE WHEN ultimo_acceso >= DATE_SUB(NOW(), INTERVAL 7 DAY) THEN 1 ELSE 0 END) as activos_7dias
      FROM usuarios
    `)

    res.json({
      success: true,
      data: stats[0]
    })
  } catch (error) {
    console.error('[Users] Error obteniendo estadísticas:', error)
    res.status(500).json({
      success: false,
      error: error.message
    })
  }
})

export default router
