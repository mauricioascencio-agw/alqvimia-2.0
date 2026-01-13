/**
 * Developer Hub - Auth Routes
 */

import express from 'express'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'

const router = express.Router()

// Mock developers
const developers = [
  {
    id: 'dev_001',
    email: 'developer@alqvimia.com',
    password: '$2a$10$XQxBtYN1q5.KxVqE6T7X1OQF1H.VH1aVQU5K5.G1vF5E7wN3wF5Fy',
    name: 'Main Developer',
    role: 'developer',
    permissions: ['projects:*', 'workflows:*', 'agents:*', 'deploy:dev', 'deploy:qa'],
    environments: ['dev', 'qa']
  },
  {
    id: 'dev_002',
    email: 'senior@alqvimia.com',
    password: '$2a$10$XQxBtYN1q5.KxVqE6T7X1OQF1H.VH1aVQU5K5.G1vF5E7wN3wF5Fy',
    name: 'Senior Developer',
    role: 'senior_developer',
    permissions: ['*'],
    environments: ['dev', 'qa', 'prod']
  }
]

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body

    const user = developers.find(d => d.email === email)
    if (!user) {
      return res.status(401).json({ error: 'Credenciales inválidas' })
    }

    const validPassword = await bcrypt.compare(password, user.password)
    if (!validPassword) {
      return res.status(401).json({ error: 'Credenciales inválidas' })
    }

    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: user.role,
        permissions: user.permissions,
        environments: user.environments
      },
      process.env.JWT_SECRET || 'developer-hub-secret',
      { expiresIn: '12h' }
    )

    res.json({
      success: true,
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        environments: user.environments
      }
    })

  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

router.get('/me', (req, res) => {
  const authHeader = req.headers.authorization
  if (!authHeader) {
    return res.status(401).json({ error: 'No autorizado' })
  }

  try {
    const token = authHeader.split(' ')[1]
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'developer-hub-secret')

    const user = developers.find(d => d.id === decoded.id)
    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado' })
    }

    res.json({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      permissions: user.permissions,
      environments: user.environments
    })

  } catch (error) {
    res.status(401).json({ error: 'Token inválido' })
  }
})

export default router
