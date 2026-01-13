const jwtService = require('../services/jwt')
const sessionService = require('../services/session')

/**
 * Middleware to authenticate requests using JWT
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

  // Check if it's an API key
  if (token.startsWith('alq_')) {
    const result = jwtService.verifyApiKey(token)
    if (!result.valid) {
      return res.status(401).json({
        error: 'Invalid API key',
        code: 'INVALID_API_KEY'
      })
    }
    req.user = result.decoded
    req.authType = 'api_key'
    return next()
  }

  // Regular JWT token
  const result = jwtService.verifyAccessToken(token)
  if (!result.valid) {
    return res.status(401).json({
      error: 'Invalid or expired token',
      code: 'INVALID_TOKEN'
    })
  }

  // Check if token is revoked
  if (sessionService.isTokenRevoked(result.decoded.jti)) {
    return res.status(401).json({
      error: 'Token has been revoked',
      code: 'TOKEN_REVOKED'
    })
  }

  req.user = result.decoded
  req.authType = 'jwt'
  next()
}

/**
 * Optional authentication - doesn't fail if no token provided
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
  const result = jwtService.verifyAccessToken(token)

  if (result.valid && !sessionService.isTokenRevoked(result.decoded.jti)) {
    req.user = result.decoded
    req.authType = 'jwt'
  } else {
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
 * Require same tenant
 */
const requireTenant = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      error: 'Authentication required',
      code: 'AUTH_REQUIRED'
    })
  }

  const resourceTenantId = req.params.tenantId || req.body.tenantId || req.query.tenantId

  // Super admin can access all tenants
  if (req.user.role === 'super_admin') {
    return next()
  }

  if (resourceTenantId && resourceTenantId !== req.user.tenantId) {
    return res.status(403).json({
      error: 'Access denied to this tenant',
      code: 'TENANT_ACCESS_DENIED'
    })
  }

  next()
}

/**
 * Require module access
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
