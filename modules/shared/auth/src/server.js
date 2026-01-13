require('dotenv').config()
const express = require('express')
const cors = require('cors')
const helmet = require('helmet')
const authRoutes = require('./routes/auth')
const tokenRoutes = require('./routes/tokens')
const usersRoutes = require('./routes/users')
const sessionsRoutes = require('./routes/sessions')

const app = express()
const PORT = process.env.AUTH_PORT || 4001

// Middleware
app.use(helmet())
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:3002', 'http://localhost:3003'],
  credentials: true
}))
app.use(express.json())

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'auth',
    timestamp: new Date().toISOString()
  })
})

// Routes
app.use('/api/auth', authRoutes)
app.use('/api/tokens', tokenRoutes)
app.use('/api/users', usersRoutes)
app.use('/api/sessions', sessionsRoutes)

// Error handler
app.use((err, req, res, next) => {
  console.error('Auth Service Error:', err)
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error',
    code: err.code || 'AUTH_ERROR'
  })
})

app.listen(PORT, () => {
  console.log(`Auth Service running on port ${PORT}`)
})

module.exports = app
