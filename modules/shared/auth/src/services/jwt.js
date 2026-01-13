const jwt = require('jsonwebtoken')
const { v4: uuidv4 } = require('uuid')

const JWT_SECRET = process.env.JWT_SECRET || 'alqvimia-super-secret-key-change-in-production'
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'alqvimia-refresh-secret-key-change-in-production'

// Token expiration times
const ACCESS_TOKEN_EXPIRY = '15m'
const REFRESH_TOKEN_EXPIRY = '7d'
const API_KEY_EXPIRY = '365d'

class JWTService {
  /**
   * Generate access token
   */
  generateAccessToken(payload) {
    return jwt.sign(
      {
        ...payload,
        type: 'access',
        jti: uuidv4()
      },
      JWT_SECRET,
      { expiresIn: ACCESS_TOKEN_EXPIRY }
    )
  }

  /**
   * Generate refresh token
   */
  generateRefreshToken(payload) {
    return jwt.sign(
      {
        userId: payload.userId,
        tenantId: payload.tenantId,
        type: 'refresh',
        jti: uuidv4()
      },
      JWT_REFRESH_SECRET,
      { expiresIn: REFRESH_TOKEN_EXPIRY }
    )
  }

  /**
   * Generate token pair
   */
  generateTokenPair(user) {
    const payload = {
      userId: user.id,
      email: user.email,
      tenantId: user.tenantId,
      role: user.role,
      permissions: user.permissions || []
    }

    return {
      accessToken: this.generateAccessToken(payload),
      refreshToken: this.generateRefreshToken(payload),
      expiresIn: 900 // 15 minutes in seconds
    }
  }

  /**
   * Generate API key
   */
  generateApiKey(payload) {
    return jwt.sign(
      {
        ...payload,
        type: 'api_key',
        jti: uuidv4()
      },
      JWT_SECRET,
      { expiresIn: API_KEY_EXPIRY }
    )
  }

  /**
   * Verify access token
   */
  verifyAccessToken(token) {
    try {
      const decoded = jwt.verify(token, JWT_SECRET)
      if (decoded.type !== 'access') {
        throw new Error('Invalid token type')
      }
      return { valid: true, decoded }
    } catch (error) {
      return { valid: false, error: error.message }
    }
  }

  /**
   * Verify refresh token
   */
  verifyRefreshToken(token) {
    try {
      const decoded = jwt.verify(token, JWT_REFRESH_SECRET)
      if (decoded.type !== 'refresh') {
        throw new Error('Invalid token type')
      }
      return { valid: true, decoded }
    } catch (error) {
      return { valid: false, error: error.message }
    }
  }

  /**
   * Verify API key
   */
  verifyApiKey(token) {
    try {
      const decoded = jwt.verify(token, JWT_SECRET)
      if (decoded.type !== 'api_key') {
        throw new Error('Invalid token type')
      }
      return { valid: true, decoded }
    } catch (error) {
      return { valid: false, error: error.message }
    }
  }

  /**
   * Decode token without verification
   */
  decodeToken(token) {
    return jwt.decode(token)
  }

  /**
   * Generate password reset token
   */
  generatePasswordResetToken(userId) {
    return jwt.sign(
      {
        userId,
        type: 'password_reset',
        jti: uuidv4()
      },
      JWT_SECRET,
      { expiresIn: '1h' }
    )
  }

  /**
   * Verify password reset token
   */
  verifyPasswordResetToken(token) {
    try {
      const decoded = jwt.verify(token, JWT_SECRET)
      if (decoded.type !== 'password_reset') {
        throw new Error('Invalid token type')
      }
      return { valid: true, decoded }
    } catch (error) {
      return { valid: false, error: error.message }
    }
  }

  /**
   * Generate email verification token
   */
  generateEmailVerificationToken(userId, email) {
    return jwt.sign(
      {
        userId,
        email,
        type: 'email_verification',
        jti: uuidv4()
      },
      JWT_SECRET,
      { expiresIn: '24h' }
    )
  }

  /**
   * Generate module-specific token
   */
  generateModuleToken(payload, module) {
    return jwt.sign(
      {
        ...payload,
        type: 'module_access',
        module,
        jti: uuidv4()
      },
      JWT_SECRET,
      { expiresIn: '1h' }
    )
  }
}

module.exports = new JWTService()
