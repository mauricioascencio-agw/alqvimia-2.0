const express = require('express')
const router = express.Router()
const jwtService = require('../services/jwt')
const sessionService = require('../services/session')

// Middleware to verify token
const authenticate = (req, res, next) => {
  const authHeader = req.headers.authorization
  if (!authHeader) {
    return res.status(401).json({ error: 'Authorization required' })
  }

  const token = authHeader.split(' ')[1]
  const result = jwtService.verifyAccessToken(token)

  if (!result.valid) {
    return res.status(401).json({ error: 'Invalid token' })
  }

  req.user = result.decoded
  next()
}

/**
 * GET /api/sessions
 * Get all active sessions for current user
 */
router.get('/', authenticate, async (req, res) => {
  try {
    const sessions = sessionService.getUserSessions(req.user.userId)

    res.json({
      sessions: sessions.map(s => ({
        id: s.id,
        createdAt: s.createdAt,
        lastActivity: s.lastActivity,
        expiresAt: s.expiresAt,
        device: s.device,
        ip: s.ip,
        isCurrent: s.id === req.sessionId
      })),
      total: sessions.length
    })
  } catch (error) {
    console.error('Get sessions error:', error)
    res.status(500).json({ error: 'Failed to get sessions' })
  }
})

/**
 * GET /api/sessions/:id
 * Get specific session details
 */
router.get('/:id', authenticate, async (req, res) => {
  try {
    const session = sessionService.getSession(req.params.id)

    if (!session) {
      return res.status(404).json({ error: 'Session not found' })
    }

    // Users can only view their own sessions
    if (session.userId !== req.user.userId && req.user.role !== 'super_admin') {
      return res.status(403).json({ error: 'Access denied' })
    }

    res.json({
      id: session.id,
      createdAt: session.createdAt,
      lastActivity: session.lastActivity,
      expiresAt: session.expiresAt,
      device: session.device,
      ip: session.ip,
      location: session.location,
      isActive: session.isActive
    })
  } catch (error) {
    console.error('Get session error:', error)
    res.status(500).json({ error: 'Failed to get session' })
  }
})

/**
 * DELETE /api/sessions/:id
 * Revoke specific session
 */
router.delete('/:id', authenticate, async (req, res) => {
  try {
    const session = sessionService.getSession(req.params.id)

    if (!session) {
      return res.status(404).json({ error: 'Session not found' })
    }

    // Users can only revoke their own sessions
    if (session.userId !== req.user.userId && req.user.role !== 'super_admin') {
      return res.status(403).json({ error: 'Access denied' })
    }

    sessionService.deleteSession(req.params.id)

    res.json({ message: 'Session revoked successfully' })
  } catch (error) {
    console.error('Delete session error:', error)
    res.status(500).json({ error: 'Failed to revoke session' })
  }
})

/**
 * DELETE /api/sessions
 * Revoke all sessions except current
 */
router.delete('/', authenticate, async (req, res) => {
  try {
    const { exceptCurrent = true } = req.query
    const currentSessionId = exceptCurrent ? req.headers['x-session-id'] : null

    const result = sessionService.revokeAllUserSessions(
      req.user.userId,
      currentSessionId
    )

    res.json({
      message: 'Sessions revoked successfully',
      revoked: result.revoked
    })
  } catch (error) {
    console.error('Revoke all sessions error:', error)
    res.status(500).json({ error: 'Failed to revoke sessions' })
  }
})

/**
 * POST /api/sessions/:id/refresh
 * Update session activity timestamp
 */
router.post('/:id/refresh', authenticate, async (req, res) => {
  try {
    const session = sessionService.getSession(req.params.id)

    if (!session) {
      return res.status(404).json({ error: 'Session not found' })
    }

    if (session.userId !== req.user.userId) {
      return res.status(403).json({ error: 'Access denied' })
    }

    sessionService.updateActivity(req.params.id)

    res.json({ message: 'Session refreshed' })
  } catch (error) {
    console.error('Refresh session error:', error)
    res.status(500).json({ error: 'Failed to refresh session' })
  }
})

/**
 * GET /api/sessions/stats
 * Get session statistics (admin only)
 */
router.get('/admin/stats', authenticate, async (req, res) => {
  try {
    if (!['super_admin', 'admin'].includes(req.user.role)) {
      return res.status(403).json({ error: 'Admin access required' })
    }

    const stats = sessionService.getStats()

    res.json(stats)
  } catch (error) {
    console.error('Get stats error:', error)
    res.status(500).json({ error: 'Failed to get stats' })
  }
})

/**
 * POST /api/sessions/cleanup
 * Clean up expired sessions (admin only)
 */
router.post('/admin/cleanup', authenticate, async (req, res) => {
  try {
    if (req.user.role !== 'super_admin') {
      return res.status(403).json({ error: 'Super admin access required' })
    }

    const result = sessionService.cleanupExpiredSessions()

    res.json({
      message: 'Cleanup completed',
      cleaned: result.cleaned
    })
  } catch (error) {
    console.error('Cleanup error:', error)
    res.status(500).json({ error: 'Failed to cleanup sessions' })
  }
})

module.exports = router
