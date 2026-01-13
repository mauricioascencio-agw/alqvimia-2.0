/**
 * Developer Hub - Error Handler Middleware
 */

import { getCurrentEnvironment } from '../config/environments.js'

/**
 * Clase de error personalizada
 */
export class AppError extends Error {
  constructor(message, statusCode = 500, code = 'INTERNAL_ERROR') {
    super(message)
    this.statusCode = statusCode
    this.code = code
    this.isOperational = true

    Error.captureStackTrace(this, this.constructor)
  }
}

/**
 * Errores predefinidos
 */
export const Errors = {
  NotFound: (resource = 'Recurso') => new AppError(`${resource} no encontrado`, 404, 'NOT_FOUND'),
  Unauthorized: (message = 'No autorizado') => new AppError(message, 401, 'UNAUTHORIZED'),
  Forbidden: (message = 'Sin permisos') => new AppError(message, 403, 'FORBIDDEN'),
  BadRequest: (message = 'Solicitud inválida') => new AppError(message, 400, 'BAD_REQUEST'),
  Conflict: (message = 'Conflicto') => new AppError(message, 409, 'CONFLICT'),
  ValidationError: (fields) => {
    const error = new AppError('Error de validación', 400, 'VALIDATION_ERROR')
    error.fields = fields
    return error
  },
  EnvironmentError: (env, message) => {
    const error = new AppError(`Error en ambiente ${env}: ${message}`, 400, 'ENVIRONMENT_ERROR')
    error.environment = env
    return error
  }
}

/**
 * Middleware de manejo de errores async
 */
export const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next)
  }
}

/**
 * Middleware principal de manejo de errores
 */
export const errorHandler = (err, req, res, next) => {
  const env = getCurrentEnvironment()

  // Default values
  err.statusCode = err.statusCode || 500
  err.code = err.code || 'INTERNAL_ERROR'

  // Log del error
  const errorLog = {
    timestamp: new Date().toISOString(),
    environment: env.id,
    code: err.code,
    message: err.message,
    statusCode: err.statusCode,
    path: req.originalUrl,
    method: req.method,
    user: req.user?.id
  }

  // En desarrollo, incluir stack trace
  if (env.id === 'dev' || env.features?.debugMode) {
    errorLog.stack = err.stack
    console.error('[ERROR]', errorLog)
  } else {
    // En producción, log mínimo
    console.error(JSON.stringify(errorLog))
  }

  // Construir respuesta
  const response = {
    success: false,
    error: {
      code: err.code,
      message: err.message
    }
  }

  // Incluir detalles adicionales según ambiente
  if (env.features?.errorDetails !== false) {
    if (err.fields) {
      response.error.fields = err.fields
    }
    if (err.environment) {
      response.error.environment = err.environment
    }
  }

  // En desarrollo, incluir stack trace
  if (env.id === 'dev' || env.features?.debugMode) {
    response.error.stack = err.stack
  }

  res.status(err.statusCode).json(response)
}

/**
 * Middleware para 404
 */
export const notFoundHandler = (req, res, next) => {
  const error = new AppError(
    `Ruta no encontrada: ${req.method} ${req.originalUrl}`,
    404,
    'ROUTE_NOT_FOUND'
  )
  next(error)
}

/**
 * Middleware para validar request body
 */
export const validateBody = (schema) => {
  return (req, res, next) => {
    const errors = []

    for (const [field, rules] of Object.entries(schema)) {
      const value = req.body[field]

      if (rules.required && (value === undefined || value === null || value === '')) {
        errors.push({ field, message: `${field} es requerido` })
        continue
      }

      if (value !== undefined && value !== null) {
        if (rules.type === 'string' && typeof value !== 'string') {
          errors.push({ field, message: `${field} debe ser texto` })
        }

        if (rules.type === 'number' && typeof value !== 'number') {
          errors.push({ field, message: `${field} debe ser número` })
        }

        if (rules.type === 'boolean' && typeof value !== 'boolean') {
          errors.push({ field, message: `${field} debe ser booleano` })
        }

        if (rules.type === 'array' && !Array.isArray(value)) {
          errors.push({ field, message: `${field} debe ser un array` })
        }

        if (rules.minLength && value.length < rules.minLength) {
          errors.push({ field, message: `${field} debe tener al menos ${rules.minLength} caracteres` })
        }

        if (rules.maxLength && value.length > rules.maxLength) {
          errors.push({ field, message: `${field} debe tener máximo ${rules.maxLength} caracteres` })
        }

        if (rules.enum && !rules.enum.includes(value)) {
          errors.push({ field, message: `${field} debe ser uno de: ${rules.enum.join(', ')}` })
        }

        if (rules.pattern && !rules.pattern.test(value)) {
          errors.push({ field, message: `${field} tiene formato inválido` })
        }
      }
    }

    if (errors.length > 0) {
      return next(Errors.ValidationError(errors))
    }

    next()
  }
}

export default {
  AppError,
  Errors,
  asyncHandler,
  errorHandler,
  notFoundHandler,
  validateBody
}
