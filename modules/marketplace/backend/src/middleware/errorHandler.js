/**
 * Marketplace - Error Handler Middleware
 */

/**
 * Middleware para rutas no encontradas
 */
export const notFoundHandler = (req, res, next) => {
  res.status(404).json({
    error: 'Ruta no encontrada',
    path: req.originalUrl,
    method: req.method
  })
}

/**
 * Middleware principal de manejo de errores
 */
export const errorHandler = (err, req, res, next) => {
  console.error('[Marketplace Error]', {
    message: err.message,
    stack: err.stack,
    path: req.originalUrl,
    method: req.method
  })

  const statusCode = err.statusCode || 500
  const message = err.message || 'Error interno del servidor'

  res.status(statusCode).json({
    success: false,
    error: message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  })
}

export default {
  notFoundHandler,
  errorHandler
}
