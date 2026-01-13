/**
 * Admin Portal - Auth Routes
 * Autenticación para administradores
 */

import express from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { body, validationResult } from 'express-validator'

const router = express.Router()

// Mock admin users (en producción usar base de datos)
const adminUsers = [
  {
    id: 'admin_001',
    email: 'admin@alqvimia.com',
    password: '$2a$10$XQxBtYN1q5.KxVqE6T7X1OQF1H.VH1aVQU5K5.G1vF5E7wN3wF5Fy', // admin123
    name: 'Super Admin',
    role: 'super_admin',
    permissions: ['*']
  },
  {
    id: 'admin_002',
    email: 'billing@alqvimia.com',
    password: '$2a$10$XQxBtYN1q5.KxVqE6T7X1OQF1H.VH1aVQU5K5.G1vF5E7wN3wF5Fy',
    name: 'Billing Admin',
    role: 'billing',
    permissions: ['billing:read', 'billing:write', 'tenants:read']
  }
]

// Login
router.post('/login',
  body('email').isEmail().normalizeEmail(),
  body('password').notEmpty(),
  async (req, res) => {
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() })
      }

      const { email, password } = req.body

      // Find user
      const user = adminUsers.find(u => u.email === email)
      if (!user) {
        return res.status(401).json({ error: 'Credenciales inválidas' })
      }

      // Verify password
      const validPassword = await bcrypt.compare(password, user.password)
      if (!validPassword) {
        return res.status(401).json({ error: 'Credenciales inválidas' })
      }

      // Generate JWT
      const token = jwt.sign(
        {
          id: user.id,
          email: user.email,
          role: user.role,
          permissions: user.permissions
        },
        process.env.JWT_SECRET || 'alqvimia-admin-secret-key',
        { expiresIn: '8h' }
      )

      // Generate refresh token
      const refreshToken = jwt.sign(
        { id: user.id },
        process.env.JWT_REFRESH_SECRET || 'alqvimia-admin-refresh-secret',
        { expiresIn: '7d' }
      )

      res.json({
        success: true,
        token,
        refreshToken,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          permissions: user.permissions
        }
      })

    } catch (error) {
      console.error('Login error:', error)
      res.status(500).json({ error: 'Error interno del servidor' })
    }
  }
)

// Refresh token
router.post('/refresh', async (req, res) => {
  try {
    const { refreshToken } = req.body

    if (!refreshToken) {
      return res.status(401).json({ error: 'Refresh token requerido' })
    }

    const decoded = jwt.verify(
      refreshToken,
      process.env.JWT_REFRESH_SECRET || 'alqvimia-admin-refresh-secret'
    )

    const user = adminUsers.find(u => u.id === decoded.id)
    if (!user) {
      return res.status(401).json({ error: 'Usuario no encontrado' })
    }

    const newToken = jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: user.role,
        permissions: user.permissions
      },
      process.env.JWT_SECRET || 'alqvimia-admin-secret-key',
      { expiresIn: '8h' }
    )

    res.json({ token: newToken })

  } catch (error) {
    res.status(401).json({ error: 'Token inválido' })
  }
})

// Logout
router.post('/logout', (req, res) => {
  // En producción: invalidar token en blacklist/Redis
  res.json({ success: true, message: 'Sesión cerrada' })
})

// Get current user
router.get('/me', (req, res) => {
  const authHeader = req.headers.authorization
  if (!authHeader) {
    return res.status(401).json({ error: 'No autorizado' })
  }

  const token = authHeader.split(' ')[1]
  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || 'alqvimia-admin-secret-key'
    )

    const user = adminUsers.find(u => u.id === decoded.id)
    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado' })
    }

    res.json({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      permissions: user.permissions
    })

  } catch (error) {
    res.status(401).json({ error: 'Token inválido' })
  }
})

export default router
