/**
 * Admin Portal - Auth Middleware
 */

import jwt from 'jsonwebtoken'

export const authenticateToken = (req, res, next) => {
  const authHeader = req.headers.authorization
  const token = authHeader && authHeader.split(' ')[1]

  if (!token) {
    return res.status(401).json({ error: 'Token de acceso requerido' })
  }

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || 'alqvimia-admin-secret-key'
    )
    req.user = decoded
    next()
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expirado' })
    }
    return res.status(403).json({ error: 'Token inválido' })
  }
}

export const requireRole = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'No autenticado' })
    }

    // Super admin can access everything
    if (req.user.role === 'super_admin') {
      return next()
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Permisos insuficientes' })
    }

    next()
  }
}

export const requirePermission = (permission) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'No autenticado' })
    }

    // Wildcard permission
    if (req.user.permissions.includes('*')) {
      return next()
    }

    if (!req.user.permissions.includes(permission)) {
      return res.status(403).json({ error: `Permiso '${permission}' requerido` })
    }

    next()
  }
}
