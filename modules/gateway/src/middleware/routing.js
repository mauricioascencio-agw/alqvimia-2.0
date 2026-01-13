const jwt = require('jsonwebtoken')

const JWT_SECRET = process.env.JWT_SECRET || 'alqvimia-super-secret-key-change-in-production'
const INTERNAL_IPS = (process.env.INTERNAL_IPS || '127.0.0.1,::1,localhost').split(',')
const INTERNAL_SERVICE_KEY = process.env.INTERNAL_SERVICE_KEY || 'alqvimia-internal-key'

/**
 * Optional authentication middleware
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

  try {
    const decoded = jwt.verify(parts[1], JWT_SECRET)
    req.user = decoded
  } catch {
    req.user = null
  }

  next()
}

/**
 * Internal service only middleware
 */
const internalOnly = (req, res, next) => {
  // Check for internal service key
  const serviceKey = req.headers['x-service-key']

  if (serviceKey === INTERNAL_SERVICE_KEY) {
    req.isInternal = true
    return next()
  }

  // Check if request is from internal IP
  const clientIp = req.ip || req.connection?.remoteAddress || ''
  const isInternalIp = INTERNAL_IPS.some(ip =>
    clientIp.includes(ip) || clientIp === ip
  )

  if (isInternalIp && req.headers['x-internal-request'] === 'true') {
    req.isInternal = true
    return next()
  }

  return res.status(403).json({
    error: 'This endpoint is for internal services only',
    code: 'INTERNAL_ONLY'
  })
}

/**
 * Environment validation middleware
 */
const validateEnvironment = (req, res, next) => {
  const environment = req.headers['x-environment']

  if (environment) {
    const validEnvironments = ['dev', 'qa', 'prod', 'test']
    if (!validEnvironments.includes(environment.toLowerCase())) {
      return res.status(400).json({
        error: 'Invalid environment',
        code: 'INVALID_ENVIRONMENT',
        valid: validEnvironments
      })
    }
    req.environment = environment.toLowerCase()
  }

  next()
}

/**
 * Tenant extraction middleware
 */
const extractTenant = (req, res, next) => {
  // Get tenant from header or from authenticated user
  const tenantId = req.headers['x-tenant-id'] || req.user?.tenantId

  if (tenantId) {
    req.tenantId = tenantId
  }

  next()
}

/**
 * API versioning middleware
 */
const apiVersion = (req, res, next) => {
  const version = req.headers['api-version'] || req.query.v || 'v1'

  // Validate version format
  if (!/^v\d+$/.test(version)) {
    return res.status(400).json({
      error: 'Invalid API version format',
      code: 'INVALID_VERSION',
      format: 'v1, v2, etc.'
    })
  }

  req.apiVersion = version
  next()
}

/**
 * Request timeout middleware
 */
const timeout = (ms = 30000) => {
  return (req, res, next) => {
    const timeoutId = setTimeout(() => {
      if (!res.headersSent) {
        res.status(504).json({
          error: 'Request timeout',
          code: 'REQUEST_TIMEOUT'
        })
      }
    }, ms)

    res.on('finish', () => clearTimeout(timeoutId))
    res.on('close', () => clearTimeout(timeoutId))

    next()
  }
}

/**
 * Content type validation middleware
 */
const validateContentType = (req, res, next) => {
  // Skip for GET, DELETE, OPTIONS
  if (['GET', 'DELETE', 'OPTIONS'].includes(req.method)) {
    return next()
  }

  const contentType = req.headers['content-type']

  if (!contentType) {
    return res.status(400).json({
      error: 'Content-Type header is required',
      code: 'MISSING_CONTENT_TYPE'
    })
  }

  const allowedTypes = [
    'application/json',
    'multipart/form-data',
    'application/x-www-form-urlencoded'
  ]

  const isValid = allowedTypes.some(type => contentType.includes(type))

  if (!isValid) {
    return res.status(415).json({
      error: 'Unsupported content type',
      code: 'UNSUPPORTED_CONTENT_TYPE',
      allowed: allowedTypes
    })
  }

  next()
}

/**
 * IP whitelist middleware
 */
const ipWhitelist = (allowedIps) => {
  return (req, res, next) => {
    const clientIp = req.ip || req.connection?.remoteAddress || ''

    const isAllowed = allowedIps.some(ip =>
      clientIp.includes(ip) || clientIp === ip
    )

    if (!isAllowed) {
      return res.status(403).json({
        error: 'Access denied from this IP',
        code: 'IP_NOT_ALLOWED'
      })
    }

    next()
  }
}

/**
 * Request size limit middleware
 */
const sizeLimit = (maxBytes = 10 * 1024 * 1024) => { // 10MB default
  return (req, res, next) => {
    const contentLength = parseInt(req.headers['content-length'] || '0')

    if (contentLength > maxBytes) {
      return res.status(413).json({
        error: 'Request entity too large',
        code: 'PAYLOAD_TOO_LARGE',
        maxSize: `${maxBytes / 1024 / 1024}MB`
      })
    }

    next()
  }
}

module.exports = {
  optionalAuth,
  internalOnly,
  validateEnvironment,
  extractTenant,
  apiVersion,
  timeout,
  validateContentType,
  ipWhitelist,
  sizeLimit
}
