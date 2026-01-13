const express = require('express')
const bcrypt = require('bcryptjs')
const router = express.Router()
const jwtService = require('../services/jwt')
const sessionService = require('../services/session')

// Mock user database (shared with auth routes)
const users = new Map([
  ['admin@alqvimia.com', {
    id: 'usr_001',
    email: 'admin@alqvimia.com',
    password: '$2a$10$X7jXfP5VoFfKWGQVpKTOmOqxzZ8yXXmf9Q1jzZjXGkCZqJNKNYGHe',
    name: 'Super Admin',
    role: 'super_admin',
    tenantId: 'tenant_system',
    permissions: ['*'],
    isActive: true
  }]
])

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

  if (sessionService.isTokenRevoked(result.decoded.jti)) {
    return res.status(401).json({ error: 'Token has been revoked' })
  }

  req.user = result.decoded
  next()
}

/**
 * GET /api/users/me
 * Get current user profile
 */
router.get('/me', authenticate, async (req, res) => {
  try {
    let user = null
    users.forEach(u => {
      if (u.id === req.user.userId) user = u
    })

    if (!user) {
      return res.status(404).json({ error: 'User not found' })
    }

    res.json({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      tenantId: user.tenantId,
      permissions: user.permissions,
      isActive: user.isActive
    })
  } catch (error) {
    console.error('Get user error:', error)
    res.status(500).json({ error: 'Failed to get user' })
  }
})

/**
 * PATCH /api/users/me
 * Update current user profile
 */
router.patch('/me', authenticate, async (req, res) => {
  try {
    const { name, avatar } = req.body

    let userFound = false
    users.forEach((user, email) => {
      if (user.id === req.user.userId) {
        if (name) user.name = name
        if (avatar) user.avatar = avatar
        users.set(email, user)
        userFound = true

        res.json({
          id: user.id,
          email: user.email,
          name: user.name,
          avatar: user.avatar,
          role: user.role
        })
      }
    })

    if (!userFound) {
      return res.status(404).json({ error: 'User not found' })
    }
  } catch (error) {
    console.error('Update user error:', error)
    res.status(500).json({ error: 'Failed to update user' })
  }
})

/**
 * POST /api/users/me/change-password
 * Change current user password
 */
router.post('/me/change-password', authenticate, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        error: 'Current and new password are required'
      })
    }

    let userFound = false
    for (const [email, user] of users.entries()) {
      if (user.id === req.user.userId) {
        const validPassword = await bcrypt.compare(currentPassword, user.password)
        if (!validPassword) {
          return res.status(401).json({ error: 'Current password is incorrect' })
        }

        user.password = await bcrypt.hash(newPassword, 10)
        users.set(email, user)
        userFound = true

        // Revoke all other sessions
        sessionService.revokeAllUserSessions(user.id)

        res.json({ message: 'Password changed successfully' })
        break
      }
    }

    if (!userFound) {
      return res.status(404).json({ error: 'User not found' })
    }
  } catch (error) {
    console.error('Change password error:', error)
    res.status(500).json({ error: 'Failed to change password' })
  }
})

/**
 * GET /api/users/:id
 * Get user by ID (admin only)
 */
router.get('/:id', authenticate, async (req, res) => {
  try {
    if (!['super_admin', 'admin'].includes(req.user.role)) {
      return res.status(403).json({ error: 'Insufficient permissions' })
    }

    let foundUser = null
    users.forEach(user => {
      if (user.id === req.params.id) foundUser = user
    })

    if (!foundUser) {
      return res.status(404).json({ error: 'User not found' })
    }

    res.json({
      id: foundUser.id,
      email: foundUser.email,
      name: foundUser.name,
      role: foundUser.role,
      tenantId: foundUser.tenantId,
      permissions: foundUser.permissions,
      isActive: foundUser.isActive
    })
  } catch (error) {
    console.error('Get user by ID error:', error)
    res.status(500).json({ error: 'Failed to get user' })
  }
})

/**
 * GET /api/users
 * List users (admin only)
 */
router.get('/', authenticate, async (req, res) => {
  try {
    if (!['super_admin', 'admin'].includes(req.user.role)) {
      return res.status(403).json({ error: 'Insufficient permissions' })
    }

    const { tenantId, role, page = 1, limit = 20 } = req.query
    let userList = []

    users.forEach(user => {
      // Filter by tenant if not super admin
      if (req.user.role !== 'super_admin' && user.tenantId !== req.user.tenantId) {
        return
      }

      if (tenantId && user.tenantId !== tenantId) return
      if (role && user.role !== role) return

      userList.push({
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        tenantId: user.tenantId,
        isActive: user.isActive
      })
    })

    const start = (page - 1) * limit
    const paginatedUsers = userList.slice(start, start + parseInt(limit))

    res.json({
      users: paginatedUsers,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: userList.length,
        pages: Math.ceil(userList.length / limit)
      }
    })
  } catch (error) {
    console.error('List users error:', error)
    res.status(500).json({ error: 'Failed to list users' })
  }
})

/**
 * POST /api/users
 * Create user (admin only)
 */
router.post('/', authenticate, async (req, res) => {
  try {
    if (!['super_admin', 'admin'].includes(req.user.role)) {
      return res.status(403).json({ error: 'Insufficient permissions' })
    }

    const { email, password, name, role, tenantId, permissions } = req.body

    if (!email || !password || !name) {
      return res.status(400).json({ error: 'Email, password and name are required' })
    }

    if (users.has(email.toLowerCase())) {
      return res.status(409).json({ error: 'Email already exists' })
    }

    // Non-super admins can only create users in their tenant
    const userTenantId = req.user.role === 'super_admin'
      ? (tenantId || req.user.tenantId)
      : req.user.tenantId

    const hashedPassword = await bcrypt.hash(password, 10)
    const userId = `usr_${Date.now()}`

    const newUser = {
      id: userId,
      email: email.toLowerCase(),
      password: hashedPassword,
      name,
      role: role || 'user',
      tenantId: userTenantId,
      permissions: permissions || [],
      isActive: true,
      createdAt: new Date().toISOString(),
      createdBy: req.user.userId
    }

    users.set(email.toLowerCase(), newUser)

    res.status(201).json({
      id: newUser.id,
      email: newUser.email,
      name: newUser.name,
      role: newUser.role,
      tenantId: newUser.tenantId,
      permissions: newUser.permissions,
      isActive: newUser.isActive
    })
  } catch (error) {
    console.error('Create user error:', error)
    res.status(500).json({ error: 'Failed to create user' })
  }
})

/**
 * PATCH /api/users/:id
 * Update user (admin only)
 */
router.patch('/:id', authenticate, async (req, res) => {
  try {
    if (!['super_admin', 'admin'].includes(req.user.role)) {
      return res.status(403).json({ error: 'Insufficient permissions' })
    }

    const { name, role, permissions, isActive } = req.body
    let updated = false

    for (const [email, user] of users.entries()) {
      if (user.id === req.params.id) {
        // Non-super admins can only update users in their tenant
        if (req.user.role !== 'super_admin' && user.tenantId !== req.user.tenantId) {
          return res.status(403).json({ error: 'Cannot update users in other tenants' })
        }

        if (name) user.name = name
        if (role && req.user.role === 'super_admin') user.role = role
        if (permissions) user.permissions = permissions
        if (typeof isActive === 'boolean') user.isActive = isActive

        users.set(email, user)
        updated = true

        res.json({
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          permissions: user.permissions,
          isActive: user.isActive
        })
        break
      }
    }

    if (!updated) {
      return res.status(404).json({ error: 'User not found' })
    }
  } catch (error) {
    console.error('Update user error:', error)
    res.status(500).json({ error: 'Failed to update user' })
  }
})

/**
 * DELETE /api/users/:id
 * Delete user (super admin only)
 */
router.delete('/:id', authenticate, async (req, res) => {
  try {
    if (req.user.role !== 'super_admin') {
      return res.status(403).json({ error: 'Super admin access required' })
    }

    let deleted = false
    for (const [email, user] of users.entries()) {
      if (user.id === req.params.id) {
        users.delete(email)
        sessionService.revokeAllUserSessions(user.id)
        deleted = true
        break
      }
    }

    if (!deleted) {
      return res.status(404).json({ error: 'User not found' })
    }

    res.json({ message: 'User deleted successfully' })
  } catch (error) {
    console.error('Delete user error:', error)
    res.status(500).json({ error: 'Failed to delete user' })
  }
})

module.exports = router
