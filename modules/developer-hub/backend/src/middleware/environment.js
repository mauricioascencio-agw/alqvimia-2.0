/**
 * Developer Hub - Environment Middleware
 * Gestión de contexto de ambiente
 */

import { environments, getCurrentEnvironment } from '../config/environments.js'

/**
 * Middleware para inyectar configuración de ambiente
 */
export const injectEnvironmentConfig = (req, res, next) => {
  const envId = req.query.env || req.headers['x-environment'] || getCurrentEnvironment().id

  const environment = Object.values(environments).find(e => e.id === envId)

  if (!environment) {
    return res.status(400).json({
      error: `Ambiente inválido: ${envId}`,
      available: Object.values(environments).map(e => e.id)
    })
  }

  // Agregar configuración de ambiente al request
  req.environment = environment
  req.environmentId = environment.id

  next()
}

/**
 * Middleware para validar operaciones en producción
 */
export const productionGuard = (options = {}) => {
  const {
    allowedOperations = [],
    requireConfirmation = true
  } = options

  return (req, res, next) => {
    if (req.environmentId !== 'prod') {
      return next()
    }

    // Verificar si la operación está permitida
    const operation = `${req.method}:${req.baseUrl}${req.path}`
    const isAllowed = allowedOperations.some(op => {
      if (op.includes('*')) {
        const regex = new RegExp('^' + op.replace('*', '.*') + '$')
        return regex.test(operation)
      }
      return op === operation
    })

    if (!isAllowed && requireConfirmation) {
      const confirmation = req.headers['x-production-confirm']
      if (confirmation !== 'true') {
        return res.status(403).json({
          error: 'Operación requiere confirmación para producción',
          hint: 'Agregar header X-Production-Confirm: true para confirmar',
          operation
        })
      }
    }

    // Registrar operación en producción
    console.warn(`[PROD] Operation: ${operation} by user: ${req.user?.id || 'anonymous'}`)

    next()
  }
}

/**
 * Middleware para agregar headers de ambiente a respuesta
 */
export const environmentHeaders = (req, res, next) => {
  if (req.environment) {
    res.setHeader('X-Environment', req.environment.id)
    res.setHeader('X-Environment-Name', req.environment.name)
  }
  next()
}

/**
 * Middleware para logging por ambiente
 */
export const environmentLogger = (req, res, next) => {
  const env = req.environment || getCurrentEnvironment()

  // En desarrollo, log detallado
  if (env.id === 'dev' && env.features?.debugMode) {
    console.log(`[${env.shortName}] ${req.method} ${req.originalUrl}`)
    if (req.body && Object.keys(req.body).length > 0) {
      console.log(`[${env.shortName}] Body:`, JSON.stringify(req.body, null, 2).slice(0, 500))
    }
  }

  // En QA/Prod, log mínimo
  if (['qa', 'prod'].includes(env.id)) {
    const log = {
      env: env.id,
      method: req.method,
      url: req.originalUrl,
      user: req.user?.id,
      timestamp: new Date().toISOString()
    }
    console.log(JSON.stringify(log))
  }

  next()
}

/**
 * Middleware para rate limiting por ambiente
 */
export const environmentRateLimit = () => {
  const requestCounts = new Map()

  return (req, res, next) => {
    const env = req.environment || getCurrentEnvironment()
    const limits = env.features?.rateLimit || {
      dev: { max: 1000, window: 60000 },
      qa: { max: 500, window: 60000 },
      prod: { max: 100, window: 60000 }
    }

    const limit = limits[env.id] || limits.dev
    const key = `${req.user?.id || req.ip}:${env.id}`
    const now = Date.now()

    // Limpiar entradas antiguas
    for (const [k, v] of requestCounts.entries()) {
      if (now - v.timestamp > limit.window) {
        requestCounts.delete(k)
      }
    }

    // Verificar límite
    const current = requestCounts.get(key)
    if (current) {
      if (current.count >= limit.max) {
        return res.status(429).json({
          error: 'Rate limit exceeded',
          retryAfter: Math.ceil((current.timestamp + limit.window - now) / 1000)
        })
      }
      current.count++
    } else {
      requestCounts.set(key, { count: 1, timestamp: now })
    }

    next()
  }
}

/**
 * Middleware para feature flags por ambiente
 */
export const featureFlag = (flagName) => {
  return (req, res, next) => {
    const env = req.environment || getCurrentEnvironment()

    if (!env.features?.[flagName]) {
      return res.status(403).json({
        error: `Feature '${flagName}' no está habilitada en ${env.name}`,
        environment: env.id
      })
    }

    next()
  }
}

export default {
  injectEnvironmentConfig,
  productionGuard,
  environmentHeaders,
  environmentLogger,
  environmentRateLimit,
  featureFlag
}
