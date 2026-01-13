/**
 * Marketplace - Auth Middleware
 */

import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'marketplace-secret'

/**
 * Middleware de autenticación obligatoria
 */
export const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization']
  const token = authHeader && authHeader.split(' ')[1]

  if (!token) {
    return res.status(401).json({ error: 'Token de acceso requerido' })
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET)
    req.user = decoded
    next()
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expirado', code: 'TOKEN_EXPIRED' })
    }
    return res.status(403).json({ error: 'Token inválido' })
  }
}

/**
 * Middleware de autenticación opcional (para personalización)
 */
export const optionalAuth = (req, res, next) => {
  const authHeader = req.headers['authorization']
  const token = authHeader && authHeader.split(' ')[1]

  if (!token) {
    return next()
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET)
    req.user = decoded
  } catch (error) {
    // Ignore invalid token, continue without user
  }

  next()
}

/**
 * Middleware para verificar si es vendor
 */
export const requireVendor = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ error: 'No autenticado' })
  }

  if (!req.user.vendorId) {
    return res.status(403).json({ error: 'Se requiere cuenta de vendor' })
  }

  next()
}

/**
 * Middleware para verificar si es admin
 */
export const requireAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ error: 'No autenticado' })
  }

  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Se requieren permisos de administrador' })
  }

  next()
}

export default {
  authenticateToken,
  optionalAuth,
  requireVendor,
  requireAdmin
}
