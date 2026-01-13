/**
 * Admin Portal - Request Logger Middleware
 */

export const requestLogger = (req, res, next) => {
  const start = Date.now()

  res.on('finish', () => {
    const duration = Date.now() - start
    const log = {
      timestamp: new Date().toISOString(),
      method: req.method,
      url: req.originalUrl,
      status: res.statusCode,
      duration: `${duration}ms`,
      ip: req.ip || req.connection.remoteAddress,
      userAgent: req.get('User-Agent')?.substring(0, 50)
    }

    if (req.user) {
      log.userId = req.user.id
    }

    // Color code by status
    const statusColor = res.statusCode >= 500 ? '\x1b[31m' : // red
                        res.statusCode >= 400 ? '\x1b[33m' : // yellow
                        res.statusCode >= 300 ? '\x1b[36m' : // cyan
                        '\x1b[32m' // green

    console.log(
      `${statusColor}${log.method}\x1b[0m ${log.url} ${statusColor}${log.status}\x1b[0m ${log.duration}`
    )
  })

  next()
}
