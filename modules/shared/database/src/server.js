require('dotenv').config()
const express = require('express')
const cors = require('cors')
const helmet = require('helmet')
const healthRoutes = require('./routes/health')
const queryRoutes = require('./routes/query')
const tenantsRoutes = require('./routes/tenants')

const app = express()
const PORT = process.env.DATABASE_PORT || 4002

// Middleware
app.use(helmet())
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || [
    'http://localhost:3001',
    'http://localhost:3002',
    'http://localhost:3003',
    'http://localhost:4000',
    'http://localhost:4001'
  ],
  credentials: true
}))
app.use(express.json())

// Internal service authentication
app.use((req, res, next) => {
  const serviceKey = req.headers['x-service-key']
  const internalServices = (process.env.INTERNAL_SERVICE_KEYS || 'alqvimia-internal-key').split(',')

  if (!internalServices.includes(serviceKey)) {
    // Allow health check without auth
    if (req.path === '/health') return next()

    return res.status(401).json({
      error: 'Invalid service key',
      code: 'INVALID_SERVICE_KEY'
    })
  }

  req.service = req.headers['x-service-name'] || 'unknown'
  next()
})

// Routes
app.use('/health', healthRoutes)
app.use('/api/query', queryRoutes)
app.use('/api/tenants', tenantsRoutes)

// Error handler
app.use((err, req, res, next) => {
  console.error('Database Service Error:', err)
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error',
    code: err.code || 'DATABASE_ERROR'
  })
})

app.listen(PORT, () => {
  console.log(`Database Service running on port ${PORT}`)
})

module.exports = app
