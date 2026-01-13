const { v4: uuidv4 } = require('uuid')

/**
 * Add request ID to each request
 */
const requestId = (req, res, next) => {
  req.requestId = req.headers['x-request-id'] || uuidv4()
  res.setHeader('X-Request-Id', req.requestId)
  next()
}

/**
 * Log request details
 */
const logRequest = (req, res, next) => {
  const start = Date.now()

  // Log incoming request
  console.log(JSON.stringify({
    type: 'request',
    requestId: req.requestId,
    method: req.method,
    path: req.path,
    query: req.query,
    ip: req.ip,
    userAgent: req.headers['user-agent'],
    userId: req.user?.userId,
    tenantId: req.user?.tenantId,
    timestamp: new Date().toISOString()
  }))

  // Log response when finished
  res.on('finish', () => {
    const duration = Date.now() - start

    console.log(JSON.stringify({
      type: 'response',
      requestId: req.requestId,
      method: req.method,
      path: req.path,
      statusCode: res.statusCode,
      duration,
      timestamp: new Date().toISOString()
    }))
  })

  next()
}

/**
 * Error logging middleware
 */
const logError = (err, req, res, next) => {
  console.error(JSON.stringify({
    type: 'error',
    requestId: req.requestId,
    method: req.method,
    path: req.path,
    error: {
      message: err.message,
      stack: err.stack,
      code: err.code
    },
    userId: req.user?.userId,
    timestamp: new Date().toISOString()
  }))

  next(err)
}

/**
 * Performance logging for slow requests
 */
const performanceLog = (threshold = 1000) => {
  return (req, res, next) => {
    const start = Date.now()

    res.on('finish', () => {
      const duration = Date.now() - start

      if (duration > threshold) {
        console.warn(JSON.stringify({
          type: 'slow_request',
          requestId: req.requestId,
          method: req.method,
          path: req.path,
          duration,
          threshold,
          timestamp: new Date().toISOString()
        }))
      }
    })

    next()
  }
}

/**
 * Audit log for sensitive operations
 */
const auditLog = (action) => {
  return (req, res, next) => {
    res.on('finish', () => {
      if (res.statusCode < 400) {
        console.log(JSON.stringify({
          type: 'audit',
          action,
          requestId: req.requestId,
          userId: req.user?.userId,
          tenantId: req.user?.tenantId,
          ip: req.ip,
          method: req.method,
          path: req.path,
          statusCode: res.statusCode,
          timestamp: new Date().toISOString()
        }))
      }
    })

    next()
  }
}

/**
 * Security event logging
 */
const securityLog = (event, details = {}) => {
  console.log(JSON.stringify({
    type: 'security',
    event,
    ...details,
    timestamp: new Date().toISOString()
  }))
}

module.exports = {
  requestId,
  logRequest,
  logError,
  performanceLog,
  auditLog,
  securityLog
}
