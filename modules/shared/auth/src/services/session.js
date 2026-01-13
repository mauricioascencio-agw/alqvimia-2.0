const { v4: uuidv4 } = require('uuid')

// In production, use Redis for session storage
// For now, using in-memory store
const sessions = new Map()
const refreshTokens = new Map()
const revokedTokens = new Set()

class SessionService {
  /**
   * Create a new session
   */
  createSession(userId, metadata = {}) {
    const sessionId = uuidv4()
    const session = {
      id: sessionId,
      userId,
      createdAt: new Date().toISOString(),
      lastActivity: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days
      ip: metadata.ip,
      userAgent: metadata.userAgent,
      device: this.parseUserAgent(metadata.userAgent),
      location: metadata.location,
      isActive: true
    }

    sessions.set(sessionId, session)

    // Track sessions by user
    const userSessions = this.getUserSessions(userId)
    userSessions.push(sessionId)

    return session
  }

  /**
   * Get session by ID
   */
  getSession(sessionId) {
    const session = sessions.get(sessionId)
    if (!session) return null

    // Check if expired
    if (new Date(session.expiresAt) < new Date()) {
      this.deleteSession(sessionId)
      return null
    }

    return session
  }

  /**
   * Update session activity
   */
  updateActivity(sessionId) {
    const session = sessions.get(sessionId)
    if (session) {
      session.lastActivity = new Date().toISOString()
      sessions.set(sessionId, session)
    }
  }

  /**
   * Delete session
   */
  deleteSession(sessionId) {
    const session = sessions.get(sessionId)
    if (session) {
      sessions.delete(sessionId)
    }
    return true
  }

  /**
   * Get all sessions for a user
   */
  getUserSessions(userId) {
    const userSessions = []
    sessions.forEach((session, id) => {
      if (session.userId === userId && session.isActive) {
        userSessions.push(session)
      }
    })
    return userSessions
  }

  /**
   * Revoke all sessions for a user
   */
  revokeAllUserSessions(userId, exceptSessionId = null) {
    const count = { revoked: 0 }
    sessions.forEach((session, id) => {
      if (session.userId === userId && id !== exceptSessionId) {
        this.deleteSession(id)
        count.revoked++
      }
    })
    return count
  }

  /**
   * Store refresh token
   */
  storeRefreshToken(token, userId, sessionId) {
    refreshTokens.set(token, {
      userId,
      sessionId,
      createdAt: new Date().toISOString(),
      isValid: true
    })
  }

  /**
   * Validate refresh token
   */
  validateRefreshToken(token) {
    const data = refreshTokens.get(token)
    if (!data || !data.isValid) return null
    return data
  }

  /**
   * Revoke refresh token
   */
  revokeRefreshToken(token) {
    const data = refreshTokens.get(token)
    if (data) {
      data.isValid = false
      refreshTokens.set(token, data)
    }
  }

  /**
   * Revoke access token (add to blacklist)
   */
  revokeAccessToken(jti) {
    revokedTokens.add(jti)
  }

  /**
   * Check if token is revoked
   */
  isTokenRevoked(jti) {
    return revokedTokens.has(jti)
  }

  /**
   * Parse user agent to get device info
   */
  parseUserAgent(userAgent) {
    if (!userAgent) return { type: 'unknown', browser: 'unknown', os: 'unknown' }

    let type = 'desktop'
    if (/mobile/i.test(userAgent)) type = 'mobile'
    else if (/tablet/i.test(userAgent)) type = 'tablet'

    let browser = 'unknown'
    if (/chrome/i.test(userAgent)) browser = 'Chrome'
    else if (/firefox/i.test(userAgent)) browser = 'Firefox'
    else if (/safari/i.test(userAgent)) browser = 'Safari'
    else if (/edge/i.test(userAgent)) browser = 'Edge'

    let os = 'unknown'
    if (/windows/i.test(userAgent)) os = 'Windows'
    else if (/mac/i.test(userAgent)) os = 'macOS'
    else if (/linux/i.test(userAgent)) os = 'Linux'
    else if (/android/i.test(userAgent)) os = 'Android'
    else if (/ios|iphone|ipad/i.test(userAgent)) os = 'iOS'

    return { type, browser, os }
  }

  /**
   * Clean up expired sessions (run periodically)
   */
  cleanupExpiredSessions() {
    const now = new Date()
    let cleaned = 0

    sessions.forEach((session, id) => {
      if (new Date(session.expiresAt) < now) {
        sessions.delete(id)
        cleaned++
      }
    })

    return { cleaned }
  }

  /**
   * Get session stats
   */
  getStats() {
    return {
      totalSessions: sessions.size,
      totalRefreshTokens: refreshTokens.size,
      revokedTokens: revokedTokens.size
    }
  }
}

module.exports = new SessionService()
