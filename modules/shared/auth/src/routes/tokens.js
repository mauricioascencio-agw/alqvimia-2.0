const express = require('express')
const router = express.Router()
const jwtService = require('../services/jwt')
const sessionService = require('../services/session')

/**
 * POST /api/tokens/verify
 * Verify an access token
 */
router.post('/verify', async (req, res) => {
  try {
    const { token } = req.body

    if (!token) {
      return res.status(400).json({
        valid: false,
        error: 'Token is required'
      })
    }

    const result = jwtService.verifyAccessToken(token)

    if (!result.valid) {
      return res.json({
        valid: false,
        error: result.error
      })
    }

    // Check if token is revoked
    if (sessionService.isTokenRevoked(result.decoded.jti)) {
      return res.json({
        valid: false,
        error: 'Token has been revoked'
      })
    }

    res.json({
      valid: true,
      decoded: {
        userId: result.decoded.userId,
        email: result.decoded.email,
        tenantId: result.decoded.tenantId,
        role: result.decoded.role,
        permissions: result.decoded.permissions,
        exp: result.decoded.exp
      }
    })
  } catch (error) {
    console.error('Token verify error:', error)
    res.status(500).json({ valid: false, error: 'Verification failed' })
  }
})

/**
 * POST /api/tokens/introspect
 * Get detailed token information
 */
router.post('/introspect', async (req, res) => {
  try {
    const { token } = req.body

    if (!token) {
      return res.status(400).json({ error: 'Token is required' })
    }

    const decoded = jwtService.decodeToken(token)
    if (!decoded) {
      return res.json({ active: false })
    }

    const result = jwtService.verifyAccessToken(token)
    const isRevoked = sessionService.isTokenRevoked(decoded.jti)

    res.json({
      active: result.valid && !isRevoked,
      sub: decoded.userId,
      client_id: decoded.tenantId,
      token_type: decoded.type,
      exp: decoded.exp,
      iat: decoded.iat,
      jti: decoded.jti,
      scope: decoded.permissions?.join(' ') || ''
    })
  } catch (error) {
    console.error('Token introspect error:', error)
    res.status(500).json({ error: 'Introspection failed' })
  }
})

/**
 * POST /api/tokens/revoke
 * Revoke a specific token
 */
router.post('/revoke', async (req, res) => {
  try {
    const { token, tokenType = 'access' } = req.body

    if (!token) {
      return res.status(400).json({ error: 'Token is required' })
    }

    if (tokenType === 'access') {
      const decoded = jwtService.decodeToken(token)
      if (decoded?.jti) {
        sessionService.revokeAccessToken(decoded.jti)
      }
    } else if (tokenType === 'refresh') {
      sessionService.revokeRefreshToken(token)
    }

    res.json({ message: 'Token revoked successfully' })
  } catch (error) {
    console.error('Token revoke error:', error)
    res.status(500).json({ error: 'Revocation failed' })
  }
})

/**
 * POST /api/tokens/api-key
 * Generate API key for service-to-service communication
 */
router.post('/api-key', async (req, res) => {
  try {
    const authHeader = req.headers.authorization
    if (!authHeader) {
      return res.status(401).json({ error: 'Authorization required' })
    }

    const token = authHeader.split(' ')[1]
    const result = jwtService.verifyAccessToken(token)

    if (!result.valid) {
      return res.status(401).json({ error: 'Invalid token' })
    }

    // Only admins can generate API keys
    if (!['super_admin', 'admin'].includes(result.decoded.role)) {
      return res.status(403).json({ error: 'Insufficient permissions' })
    }

    const { name, permissions, expiresIn } = req.body

    const apiKey = jwtService.generateApiKey({
      name,
      tenantId: result.decoded.tenantId,
      userId: result.decoded.userId,
      permissions: permissions || [],
      customExpiry: expiresIn
    })

    res.json({
      apiKey,
      name,
      createdAt: new Date().toISOString(),
      permissions
    })
  } catch (error) {
    console.error('API key generation error:', error)
    res.status(500).json({ error: 'API key generation failed' })
  }
})

/**
 * POST /api/tokens/module
 * Generate module-specific token for cross-module communication
 */
router.post('/module', async (req, res) => {
  try {
    const authHeader = req.headers.authorization
    if (!authHeader) {
      return res.status(401).json({ error: 'Authorization required' })
    }

    const token = authHeader.split(' ')[1]
    const result = jwtService.verifyAccessToken(token)

    if (!result.valid) {
      return res.status(401).json({ error: 'Invalid token' })
    }

    const { targetModule } = req.body

    if (!targetModule) {
      return res.status(400).json({ error: 'Target module is required' })
    }

    const moduleToken = jwtService.generateModuleToken({
      userId: result.decoded.userId,
      tenantId: result.decoded.tenantId,
      role: result.decoded.role,
      permissions: result.decoded.permissions,
      sourceModule: req.headers['x-source-module']
    }, targetModule)

    res.json({
      moduleToken,
      targetModule,
      expiresIn: 3600
    })
  } catch (error) {
    console.error('Module token generation error:', error)
    res.status(500).json({ error: 'Module token generation failed' })
  }
})

module.exports = router
