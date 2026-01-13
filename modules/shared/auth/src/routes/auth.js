const express = require('express')
const bcrypt = require('bcryptjs')
const router = express.Router()
const jwtService = require('../services/jwt')
const sessionService = require('../services/session')

// Mock user database (in production, use actual database)
const users = new Map([
  ['admin@alqvimia.com', {
    id: 'usr_001',
    email: 'admin@alqvimia.com',
    password: '$2a$10$X7jXfP5VoFfKWGQVpKTOmOqxzZ8yXXmf9Q1jzZjXGkCZqJNKNYGHe', // password123
    name: 'Super Admin',
    role: 'super_admin',
    tenantId: 'tenant_system',
    permissions: ['*'],
    isActive: true
  }],
  ['developer@alqvimia.com', {
    id: 'usr_002',
    email: 'developer@alqvimia.com',
    password: '$2a$10$X7jXfP5VoFfKWGQVpKTOmOqxzZ8yXXmf9Q1jzZjXGkCZqJNKNYGHe',
    name: 'Developer User',
    role: 'developer',
    tenantId: 'tenant_001',
    permissions: ['workflows:read', 'workflows:write', 'agents:read', 'agents:write'],
    isActive: true
  }]
])

/**
 * POST /api/auth/login
 * Authenticate user and return tokens
 */
router.post('/login', async (req, res) => {
  try {
    const { email, password, module } = req.body

    if (!email || !password) {
      return res.status(400).json({
        error: 'Email and password are required',
        code: 'MISSING_CREDENTIALS'
      })
    }

    const user = users.get(email.toLowerCase())
    if (!user) {
      return res.status(401).json({
        error: 'Invalid credentials',
        code: 'INVALID_CREDENTIALS'
      })
    }

    if (!user.isActive) {
      return res.status(403).json({
        error: 'Account is disabled',
        code: 'ACCOUNT_DISABLED'
      })
    }

    const validPassword = await bcrypt.compare(password, user.password)
    if (!validPassword) {
      return res.status(401).json({
        error: 'Invalid credentials',
        code: 'INVALID_CREDENTIALS'
      })
    }

    // Check module access
    if (module) {
      const hasAccess = checkModuleAccess(user, module)
      if (!hasAccess) {
        return res.status(403).json({
          error: 'No access to this module',
          code: 'MODULE_ACCESS_DENIED'
        })
      }
    }

    // Create session
    const session = sessionService.createSession(user.id, {
      ip: req.ip,
      userAgent: req.headers['user-agent'],
      module
    })

    // Generate tokens
    const tokens = jwtService.generateTokenPair(user)

    // Store refresh token
    sessionService.storeRefreshToken(tokens.refreshToken, user.id, session.id)

    res.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        tenantId: user.tenantId,
        permissions: user.permissions
      },
      tokens,
      session: {
        id: session.id,
        expiresAt: session.expiresAt
      }
    })
  } catch (error) {
    console.error('Login error:', error)
    res.status(500).json({ error: 'Login failed', code: 'LOGIN_ERROR' })
  }
})

/**
 * POST /api/auth/logout
 * Logout user and invalidate session
 */
router.post('/logout', async (req, res) => {
  try {
    const authHeader = req.headers.authorization
    if (authHeader) {
      const token = authHeader.split(' ')[1]
      const decoded = jwtService.decodeToken(token)
      if (decoded?.jti) {
        sessionService.revokeAccessToken(decoded.jti)
      }
    }

    const { refreshToken, sessionId } = req.body
    if (refreshToken) {
      sessionService.revokeRefreshToken(refreshToken)
    }
    if (sessionId) {
      sessionService.deleteSession(sessionId)
    }

    res.json({ message: 'Logged out successfully' })
  } catch (error) {
    console.error('Logout error:', error)
    res.status(500).json({ error: 'Logout failed', code: 'LOGOUT_ERROR' })
  }
})

/**
 * POST /api/auth/refresh
 * Refresh access token using refresh token
 */
router.post('/refresh', async (req, res) => {
  try {
    const { refreshToken } = req.body

    if (!refreshToken) {
      return res.status(400).json({
        error: 'Refresh token is required',
        code: 'MISSING_REFRESH_TOKEN'
      })
    }

    // Verify refresh token
    const result = jwtService.verifyRefreshToken(refreshToken)
    if (!result.valid) {
      return res.status(401).json({
        error: 'Invalid refresh token',
        code: 'INVALID_REFRESH_TOKEN'
      })
    }

    // Check if refresh token is still valid in store
    const tokenData = sessionService.validateRefreshToken(refreshToken)
    if (!tokenData) {
      return res.status(401).json({
        error: 'Refresh token has been revoked',
        code: 'REVOKED_REFRESH_TOKEN'
      })
    }

    // Get user
    let user = null
    users.forEach(u => {
      if (u.id === result.decoded.userId) user = u
    })

    if (!user) {
      return res.status(401).json({
        error: 'User not found',
        code: 'USER_NOT_FOUND'
      })
    }

    // Revoke old refresh token
    sessionService.revokeRefreshToken(refreshToken)

    // Generate new tokens
    const tokens = jwtService.generateTokenPair(user)

    // Store new refresh token
    sessionService.storeRefreshToken(tokens.refreshToken, user.id, tokenData.sessionId)

    res.json({ tokens })
  } catch (error) {
    console.error('Refresh error:', error)
    res.status(500).json({ error: 'Token refresh failed', code: 'REFRESH_ERROR' })
  }
})

/**
 * POST /api/auth/register
 * Register new user
 */
router.post('/register', async (req, res) => {
  try {
    const { email, password, name, tenantId } = req.body

    if (!email || !password || !name) {
      return res.status(400).json({
        error: 'Email, password and name are required',
        code: 'MISSING_FIELDS'
      })
    }

    if (users.has(email.toLowerCase())) {
      return res.status(409).json({
        error: 'Email already registered',
        code: 'EMAIL_EXISTS'
      })
    }

    const hashedPassword = await bcrypt.hash(password, 10)
    const userId = `usr_${Date.now()}`

    const newUser = {
      id: userId,
      email: email.toLowerCase(),
      password: hashedPassword,
      name,
      role: 'user',
      tenantId: tenantId || 'tenant_default',
      permissions: [],
      isActive: true,
      createdAt: new Date().toISOString()
    }

    users.set(email.toLowerCase(), newUser)

    // Generate verification token
    const verificationToken = jwtService.generateEmailVerificationToken(userId, email)

    res.status(201).json({
      message: 'Registration successful',
      user: {
        id: newUser.id,
        email: newUser.email,
        name: newUser.name
      },
      verificationToken
    })
  } catch (error) {
    console.error('Registration error:', error)
    res.status(500).json({ error: 'Registration failed', code: 'REGISTRATION_ERROR' })
  }
})

/**
 * POST /api/auth/forgot-password
 * Request password reset
 */
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body

    if (!email) {
      return res.status(400).json({
        error: 'Email is required',
        code: 'MISSING_EMAIL'
      })
    }

    const user = users.get(email.toLowerCase())

    // Always return success to prevent email enumeration
    if (user) {
      const resetToken = jwtService.generatePasswordResetToken(user.id)
      // In production, send email with reset link
      console.log(`Password reset token for ${email}: ${resetToken}`)
    }

    res.json({
      message: 'If the email exists, a reset link has been sent'
    })
  } catch (error) {
    console.error('Forgot password error:', error)
    res.status(500).json({ error: 'Request failed', code: 'FORGOT_PASSWORD_ERROR' })
  }
})

/**
 * POST /api/auth/reset-password
 * Reset password with token
 */
router.post('/reset-password', async (req, res) => {
  try {
    const { token, newPassword } = req.body

    if (!token || !newPassword) {
      return res.status(400).json({
        error: 'Token and new password are required',
        code: 'MISSING_FIELDS'
      })
    }

    const result = jwtService.verifyPasswordResetToken(token)
    if (!result.valid) {
      return res.status(401).json({
        error: 'Invalid or expired token',
        code: 'INVALID_TOKEN'
      })
    }

    // Find and update user
    let userFound = false
    users.forEach((user, email) => {
      if (user.id === result.decoded.userId) {
        user.password = bcrypt.hashSync(newPassword, 10)
        users.set(email, user)
        userFound = true

        // Revoke all sessions
        sessionService.revokeAllUserSessions(user.id)
      }
    })

    if (!userFound) {
      return res.status(404).json({
        error: 'User not found',
        code: 'USER_NOT_FOUND'
      })
    }

    res.json({ message: 'Password reset successful' })
  } catch (error) {
    console.error('Reset password error:', error)
    res.status(500).json({ error: 'Password reset failed', code: 'RESET_PASSWORD_ERROR' })
  }
})

/**
 * Check if user has access to specific module
 */
function checkModuleAccess(user, module) {
  const modulePermissions = {
    admin: ['super_admin'],
    marketplace: ['super_admin', 'admin', 'vendor', 'user'],
    developer: ['super_admin', 'admin', 'developer']
  }

  const allowedRoles = modulePermissions[module] || []
  return allowedRoles.includes(user.role) || user.permissions.includes('*')
}

module.exports = router
