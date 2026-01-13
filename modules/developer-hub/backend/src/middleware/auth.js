/**
 * Developer Hub - Auth Middleware
 * Autenticación y autorización para desarrolladores
 */

import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'developer-hub-secret'

/**
 * Middleware de autenticación
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
 * Middleware para verificar roles
 */
export const requireRole = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'No autenticado' })
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        error: 'Sin permisos suficientes',
        required: roles,
        current: req.user.role
      })
    }

    next()
  }
}

/**
 * Middleware para verificar permisos específicos
 */
export const requirePermission = (permission) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'No autenticado' })
    }

    const userPermissions = req.user.permissions || []

    // Verificar si tiene permiso wildcard o el permiso específico
    const hasPermission = userPermissions.includes('*') ||
      userPermissions.includes(permission) ||
      userPermissions.some(p => {
        // Soportar wildcards como 'projects:*'
        if (p.endsWith(':*')) {
          const prefix = p.slice(0, -1)
          return permission.startsWith(prefix)
        }
        return false
      })

    if (!hasPermission) {
      return res.status(403).json({
        error: 'Sin permisos para esta acción',
        required: permission
      })
    }

    next()
  }
}

/**
 * Middleware para verificar acceso a ambiente
 */
export const requireEnvironment = (environment) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'No autenticado' })
    }

    const userEnvironments = req.user.environments || ['dev']

    // Permitir acceso si tiene permiso para el ambiente o tiene acceso a todos
    if (!userEnvironments.includes(environment) && !userEnvironments.includes('*')) {
      return res.status(403).json({
        error: `Sin acceso al ambiente ${environment}`,
        allowed: userEnvironments
      })
    }

    next()
  }
}

/**
 * Middleware para verificar ambiente dinámico (desde query/body)
 */
export const checkEnvironmentAccess = (req, res, next) => {
  const environment = req.query.environment || req.body.environment || 'dev'

  if (!req.user) {
    return res.status(401).json({ error: 'No autenticado' })
  }

  const userEnvironments = req.user.environments || ['dev']

  if (!userEnvironments.includes(environment) && !userEnvironments.includes('*')) {
    return res.status(403).json({
      error: `Sin acceso al ambiente ${environment}`,
      allowed: userEnvironments
    })
  }

  // Agregar ambiente actual al request
  req.currentEnvironment = environment
  next()
}

/**
 * Middleware opcional - no falla si no hay token
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
    // Ignorar errores, continuar sin usuario
  }

  next()
}

export default {
  authenticateToken,
  requireRole,
  requirePermission,
  requireEnvironment,
  checkEnvironmentAccess,
  optionalAuth
}
