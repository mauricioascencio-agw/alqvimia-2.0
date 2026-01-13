/**
 * ALQVIMIA RPA 2.0 - Rutas de Autenticación
 * Endpoints para login, registro y gestión de sesiones
 */

import express from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import * as db from '../services/database.js'

const router = express.Router()

// Clave secreta para JWT (en producción usar variable de entorno)
const JWT_SECRET = process.env.JWT_SECRET || 'alqvimia_secret_key_2025'
const JWT_EXPIRES = '24h'

// =====================================================
// AUTENTICACIÓN
// =====================================================

/**
 * POST /api/auth/login
 * Iniciar sesión
 */
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Email y contraseña son requeridos'
      })
    }

    // Buscar usuario por email
    const user = await db.queryOne(
      'SELECT id, nombre, email, password_hash, rol, activo, avatar FROM usuarios WHERE email = ?',
      [email]
    )

    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Credenciales inválidas'
      })
    }

    // Verificar si el usuario está activo
    if (!user.activo) {
      return res.status(401).json({
        success: false,
        error: 'Usuario desactivado. Contacte al administrador.'
      })
    }

    // Verificar contraseña
    const validPassword = await bcrypt.compare(password, user.password_hash)
    if (!validPassword) {
      return res.status(401).json({
        success: false,
        error: 'Credenciales inválidas'
      })
    }

    // Actualizar último acceso
    await db.query(
      'UPDATE usuarios SET ultimo_acceso = CURRENT_TIMESTAMP WHERE id = ?',
      [user.id]
    )

    // Generar token JWT
    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        rol: user.rol
      },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES }
    )

    // Obtener configuración del usuario
    const userConfig = await db.getUserConfig(user.id)

    res.json({
      success: true,
      data: {
        token,
        user: {
          id: user.id,
          nombre: user.nombre,
          email: user.email,
          rol: user.rol,
          avatar: user.avatar
        },
        config: userConfig || {
          tema: 'midnight-blue',
          idioma: 'es'
        }
      }
    })
  } catch (error) {
    console.error('[Auth] Error en login:', error)
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    })
  }
})

/**
 * POST /api/auth/register
 * Registrar nuevo usuario
 */
router.post('/register', async (req, res) => {
  try {
    const { nombre, email, password, rol = 'usuario' } = req.body

    if (!nombre || !email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Nombre, email y contraseña son requeridos'
      })
    }

    // Validar email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        error: 'Email inválido'
      })
    }

    // Validar contraseña (mínimo 6 caracteres)
    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        error: 'La contraseña debe tener al menos 6 caracteres'
      })
    }

    // Verificar si el email ya existe
    const existingUser = await db.queryOne(
      'SELECT id FROM usuarios WHERE email = ?',
      [email]
    )

    if (existingUser) {
      return res.status(400).json({
        success: false,
        error: 'El email ya está registrado'
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
      activo: true
    })

    // Crear configuración por defecto
    await db.query(`
      INSERT INTO configuraciones_usuario (usuario_id, tema, idioma)
      VALUES (?, 'midnight-blue', 'es')
    `, [userId])

    // Generar token
    const token = jwt.sign(
      { id: userId, email, rol },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES }
    )

    res.status(201).json({
      success: true,
      data: {
        token,
        user: {
          id: userId,
          nombre,
          email,
          rol
        }
      },
      message: 'Usuario registrado exitosamente'
    })
  } catch (error) {
    console.error('[Auth] Error en registro:', error)
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    })
  }
})

/**
 * GET /api/auth/me
 * Obtener usuario actual (requiere token)
 */
router.get('/me', authMiddleware, async (req, res) => {
  try {
    const user = await db.queryOne(
      'SELECT id, nombre, email, rol, avatar, activo, ultimo_acceso, created_at FROM usuarios WHERE id = ?',
      [req.user.id]
    )

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'Usuario no encontrado'
      })
    }

    const config = await db.getUserConfig(user.id)

    res.json({
      success: true,
      data: {
        user,
        config: config || { tema: 'midnight-blue', idioma: 'es' }
      }
    })
  } catch (error) {
    console.error('[Auth] Error obteniendo usuario:', error)
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    })
  }
})

/**
 * PUT /api/auth/password
 * Cambiar contraseña
 */
router.put('/password', authMiddleware, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        error: 'Contraseña actual y nueva son requeridas'
      })
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        error: 'La nueva contraseña debe tener al menos 6 caracteres'
      })
    }

    // Obtener usuario
    const user = await db.queryOne(
      'SELECT password_hash FROM usuarios WHERE id = ?',
      [req.user.id]
    )

    // Verificar contraseña actual
    const validPassword = await bcrypt.compare(currentPassword, user.password_hash)
    if (!validPassword) {
      return res.status(401).json({
        success: false,
        error: 'Contraseña actual incorrecta'
      })
    }

    // Encriptar nueva contraseña
    const salt = await bcrypt.genSalt(10)
    const newPasswordHash = await bcrypt.hash(newPassword, salt)

    // Actualizar
    await db.update('usuarios', { password_hash: newPasswordHash }, 'id = ?', [req.user.id])

    res.json({
      success: true,
      message: 'Contraseña actualizada exitosamente'
    })
  } catch (error) {
    console.error('[Auth] Error cambiando contraseña:', error)
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    })
  }
})

/**
 * POST /api/auth/logout
 * Cerrar sesión (invalidar token del lado cliente)
 */
router.post('/logout', (req, res) => {
  res.json({
    success: true,
    message: 'Sesión cerrada'
  })
})

// =====================================================
// MIDDLEWARE DE AUTENTICACIÓN
// =====================================================

export function authMiddleware(req, res, next) {
  try {
    const authHeader = req.headers.authorization

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        error: 'Token no proporcionado'
      })
    }

    const token = authHeader.split(' ')[1]
    const decoded = jwt.verify(token, JWT_SECRET)

    req.user = decoded
    next()
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        error: 'Token expirado'
      })
    }
    return res.status(401).json({
      success: false,
      error: 'Token inválido'
    })
  }
}

// Middleware para verificar rol de admin
export function adminMiddleware(req, res, next) {
  if (req.user.rol !== 'admin') {
    return res.status(403).json({
      success: false,
      error: 'Acceso denegado. Se requiere rol de administrador.'
    })
  }
  next()
}

export default router
