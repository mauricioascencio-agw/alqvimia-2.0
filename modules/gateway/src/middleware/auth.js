const jwt = require('jsonwebtoken')

const JWT_SECRET = process.env.JWT_SECRET || 'alqvimia-super-secret-key-change-in-production'

/**
 * Authenticate JWT token
 */
const authenticate = (req, res, next) => {
  const authHeader = req.headers.authorization

  if (!authHeader) {
    return res.status(401).json({
      error: 'Authorization header is required',
      code: 'MISSING_AUTH_HEADER'
    })
  }

  const parts = authHeader.split(' ')
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    return res.status(401).json({
      error: 'Invalid authorization format. Use: Bearer <token>',
      code: 'INVALID_AUTH_FORMAT'
    })
  }

  const token = parts[1]

  try {
    const decoded = jwt.verify(token, JWT_SECRET)

    // Check token type
    if (decoded.type !== 'access' && decoded.type !== 'api_key') {
      return res.status(401).json({
        error: 'Invalid token type',
        code: 'INVALID_TOKEN_TYPE'
      })
    }

    req.user = decoded
    req.authType = decoded.type
    next()
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        error: 'Token has expired',
        code: 'TOKEN_EXPIRED'
      })
    }
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        error: 'Invalid token',
        code: 'INVALID_TOKEN'
      })
    }

    return res.status(401).json({
      error: 'Authentication failed',
      code: 'AUTH_FAILED'
    })
  }
}

/**
 * Optional authentication - doesn't fail if no token
 */
const optionalAuth = (req, res, next) => {
  const authHeader = req.headers.authorization

  if (!authHeader) {
    req.user = null
    return next()
  }

  const parts = authHeader.split(' ')
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    req.user = null
    return next()
  }

  const token = parts[1]

  try {
    const decoded = jwt.verify(token, JWT_SECRET)
    req.user = decoded
    req.authType = decoded.type
  } catch {
    req.user = null
  }

  next()
}

/**
 * Require specific role(s)
 */
const requireRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        error: 'Authentication required',
        code: 'AUTH_REQUIRED'
      })
    }

    // Check wildcard permission
    if (req.user.permissions?.includes('*')) {
      return next()
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        error: 'Insufficient permissions',
        code: 'INSUFFICIENT_ROLE',
        required: roles,
        current: req.user.role
      })
    }

    next()
  }
}

/**
 * Require specific permission(s)
 */
const requirePermission = (...permissions) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        error: 'Authentication required',
        code: 'AUTH_REQUIRED'
      })
    }

    // Super admin has all permissions
    if (req.user.permissions?.includes('*')) {
      return next()
    }

    const hasPermission = permissions.some(p =>
      req.user.permissions?.includes(p)
    )

    if (!hasPermission) {
      return res.status(403).json({
        error: 'Insufficient permissions',
        code: 'INSUFFICIENT_PERMISSION',
        required: permissions
      })
    }

    next()
  }
}

/**
 * Require specific tenant
 */
const requireTenant = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      error: 'Authentication required',
      code: 'AUTH_REQUIRED'
    })
  }

  const tenantId = req.params.tenantId || req.headers['x-tenant-id']

  // Super admin can access all tenants
  if (req.user.role === 'super_admin') {
    return next()
  }

  if (tenantId && tenantId !== req.user.tenantId) {
    return res.status(403).json({
      error: 'Access denied to this tenant',
      code: 'TENANT_ACCESS_DENIED'
    })
  }

  next()
}

/**
 * Require specific module access
 */
const requireModuleAccess = (module) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        error: 'Authentication required',
        code: 'AUTH_REQUIRED'
      })
    }

    const modulePermissions = {
      admin: ['super_admin'],
      marketplace: ['super_admin', 'admin', 'vendor', 'user'],
      developer: ['super_admin', 'admin', 'developer']
    }

    const allowedRoles = modulePermissions[module] || []

    if (!allowedRoles.includes(req.user.role) && !req.user.permissions?.includes('*')) {
      return res.status(403).json({
        error: `Access denied to ${module} module`,
        code: 'MODULE_ACCESS_DENIED'
      })
    }

    next()
  }
}

module.exports = {
  authenticate,
  optionalAuth,
  requireRole,
  requirePermission,
  requireTenant,
  requireModuleAccess
}
