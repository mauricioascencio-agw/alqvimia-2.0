require('dotenv').config()
const express = require('express')
const cors = require('cors')
const helmet = require('helmet')
const morgan = require('morgan')
const rateLimit = require('express-rate-limit')
const { createProxyMiddleware } = require('http-proxy-middleware')

const authMiddleware = require('./middleware/auth')
const routingMiddleware = require('./middleware/routing')
const loggingMiddleware = require('./middleware/logging')
const serviceRegistry = require('./services/registry')

const app = express()
const PORT = process.env.GATEWAY_PORT || 4000

// Service endpoints
const SERVICES = {
  admin: process.env.ADMIN_URL || 'http://localhost:3001',
  marketplace: process.env.MARKETPLACE_URL || 'http://localhost:3002',
  developer: process.env.DEVELOPER_URL || 'http://localhost:3003',
  auth: process.env.AUTH_URL || 'http://localhost:4001',
  database: process.env.DATABASE_URL || 'http://localhost:4002'
}

// Register services
Object.entries(SERVICES).forEach(([name, url]) => {
  serviceRegistry.register(name, url)
})

// Trust proxy for rate limiting behind load balancer
app.set('trust proxy', 1)

// Security middleware
app.use(helmet({
  contentSecurityPolicy: false, // Disable for API gateway
  crossOriginEmbedderPolicy: false
}))

// CORS
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || [
    'http://localhost:3000',
    'http://localhost:3001',
    'http://localhost:3002',
    'http://localhost:3003',
    'http://localhost:5173',
    'http://localhost:5174',
    'http://localhost:5175'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Tenant-Id', 'X-Environment', 'X-Request-Id']
}))

// Request logging
app.use(morgan('combined', {
  skip: (req) => req.path === '/health'
}))

// Body parsing for non-proxy routes
app.use(express.json({ limit: '10mb' }))

// Request ID middleware
app.use(loggingMiddleware.requestId)

// Global rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // Limit each IP to 1000 requests per windowMs
  message: {
    error: 'Too many requests, please try again later',
    code: 'RATE_LIMIT_EXCEEDED'
  },
  standardHeaders: true,
  legacyHeaders: false
})
app.use(limiter)

// Health check
app.get('/health', async (req, res) => {
  const services = await serviceRegistry.healthCheckAll()

  res.json({
    status: 'healthy',
    gateway: 'running',
    timestamp: new Date().toISOString(),
    services
  })
})

// Service discovery endpoint
app.get('/services', (req, res) => {
  res.json({
    services: serviceRegistry.list()
  })
})

// Auth routes - direct proxy to auth service
app.use('/api/auth', createProxyMiddleware({
  target: SERVICES.auth,
  changeOrigin: true,
  pathRewrite: { '^/api/auth': '/api/auth' },
  onError: (err, req, res) => {
    console.error('Auth proxy error:', err)
    res.status(503).json({
      error: 'Auth service unavailable',
      code: 'SERVICE_UNAVAILABLE'
    })
  }
}))

// Token verification endpoint
app.use('/api/tokens', createProxyMiddleware({
  target: SERVICES.auth,
  changeOrigin: true,
  pathRewrite: { '^/api/tokens': '/api/tokens' }
}))

// Admin Portal routes
app.use('/api/admin', authMiddleware.authenticate, authMiddleware.requireRole('super_admin', 'admin'), createProxyMiddleware({
  target: SERVICES.admin,
  changeOrigin: true,
  pathRewrite: { '^/api/admin': '/api' },
  onProxyReq: (proxyReq, req) => {
    if (req.user) {
      proxyReq.setHeader('X-User-Id', req.user.userId)
      proxyReq.setHeader('X-User-Role', req.user.role)
      proxyReq.setHeader('X-Tenant-Id', req.user.tenantId)
    }
    proxyReq.setHeader('X-Request-Id', req.requestId)
  },
  onError: (err, req, res) => {
    console.error('Admin proxy error:', err)
    res.status(503).json({
      error: 'Admin service unavailable',
      code: 'SERVICE_UNAVAILABLE'
    })
  }
}))

// Marketplace routes (some public, some require auth)
app.use('/api/marketplace', routingMiddleware.optionalAuth, createProxyMiddleware({
  target: SERVICES.marketplace,
  changeOrigin: true,
  pathRewrite: { '^/api/marketplace': '/api' },
  onProxyReq: (proxyReq, req) => {
    if (req.user) {
      proxyReq.setHeader('X-User-Id', req.user.userId)
      proxyReq.setHeader('X-User-Role', req.user.role)
      proxyReq.setHeader('X-Tenant-Id', req.user.tenantId)
    }
    proxyReq.setHeader('X-Request-Id', req.requestId)
  },
  onError: (err, req, res) => {
    console.error('Marketplace proxy error:', err)
    res.status(503).json({
      error: 'Marketplace service unavailable',
      code: 'SERVICE_UNAVAILABLE'
    })
  }
}))

// Developer Hub routes
app.use('/api/developer', authMiddleware.authenticate, authMiddleware.requireRole('super_admin', 'admin', 'developer'), createProxyMiddleware({
  target: SERVICES.developer,
  changeOrigin: true,
  pathRewrite: { '^/api/developer': '/api' },
  onProxyReq: (proxyReq, req) => {
    if (req.user) {
      proxyReq.setHeader('X-User-Id', req.user.userId)
      proxyReq.setHeader('X-User-Role', req.user.role)
      proxyReq.setHeader('X-Tenant-Id', req.user.tenantId)
    }
    if (req.headers['x-environment']) {
      proxyReq.setHeader('X-Environment', req.headers['x-environment'])
    }
    proxyReq.setHeader('X-Request-Id', req.requestId)
  },
  onError: (err, req, res) => {
    console.error('Developer proxy error:', err)
    res.status(503).json({
      error: 'Developer service unavailable',
      code: 'SERVICE_UNAVAILABLE'
    })
  }
}))

// Internal database routes (only for internal services)
app.use('/internal/database', routingMiddleware.internalOnly, createProxyMiddleware({
  target: SERVICES.database,
  changeOrigin: true,
  pathRewrite: { '^/internal/database': '/api' },
  onProxyReq: (proxyReq, req) => {
    proxyReq.setHeader('X-Service-Key', process.env.INTERNAL_SERVICE_KEY || 'alqvimia-internal-key')
    proxyReq.setHeader('X-Service-Name', 'gateway')
  }
}))

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Endpoint not found',
    code: 'NOT_FOUND',
    path: req.path
  })
})

// Error handler
app.use((err, req, res, next) => {
  console.error('Gateway Error:', err)

  res.status(err.status || 500).json({
    error: err.message || 'Internal server error',
    code: err.code || 'GATEWAY_ERROR',
    requestId: req.requestId
  })
})

app.listen(PORT, () => {
  console.log(`API Gateway running on port ${PORT}`)
  console.log('Registered services:', Object.keys(SERVICES).join(', '))
})

module.exports = app
