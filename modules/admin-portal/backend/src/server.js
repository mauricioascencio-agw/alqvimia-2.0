/**
 * ALQVIMIA Admin Portal - Backend Server
 * Puerto: 3001
 * Super Admin Dashboard API
 */

import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import { createServer } from 'http'
import { Server } from 'socket.io'
import rateLimit from 'express-rate-limit'
import dotenv from 'dotenv'

// Routes
import authRoutes from './routes/auth.js'
import tenantsRoutes from './routes/tenants.js'
import billingRoutes from './routes/billing.js'
import auditRoutes from './routes/audit.js'
import metricsRoutes from './routes/metrics.js'
import commissionsRoutes from './routes/commissions.js'

// Middleware
import { authenticateToken, requireRole } from './middleware/auth.js'
import { errorHandler } from './middleware/errorHandler.js'
import { requestLogger } from './middleware/logger.js'

dotenv.config()

const app = express()
const httpServer = createServer(app)
const io = new Server(httpServer, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3001',
    methods: ['GET', 'POST']
  }
})

const PORT = process.env.PORT || 3001

// Security middleware
app.use(helmet())
app.use(cors({
  origin: [
    'http://localhost:3001',
    'http://localhost:5173',
    process.env.FRONTEND_URL
  ].filter(Boolean),
  credentials: true
}))

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: { error: 'Too many requests, please try again later.' }
})
app.use('/api/', limiter)

// Body parsing
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true }))

// Request logging
app.use(requestLogger)

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    module: 'admin-portal',
    version: '2.0.0',
    timestamp: new Date().toISOString()
  })
})

// Public routes
app.use('/api/auth', authRoutes)

// Protected routes (require authentication)
app.use('/api/tenants', authenticateToken, requireRole(['super_admin', 'admin']), tenantsRoutes)
app.use('/api/billing', authenticateToken, requireRole(['super_admin', 'admin', 'billing']), billingRoutes)
app.use('/api/audit', authenticateToken, requireRole(['super_admin']), auditRoutes)
app.use('/api/metrics', authenticateToken, requireRole(['super_admin', 'admin']), metricsRoutes)
app.use('/api/commissions', authenticateToken, requireRole(['super_admin', 'admin']), commissionsRoutes)

// WebSocket for real-time updates
io.use((socket, next) => {
  const token = socket.handshake.auth.token
  if (!token) {
    return next(new Error('Authentication required'))
  }
  // Validate token here
  next()
})

io.on('connection', (socket) => {
  console.log('Admin client connected:', socket.id)

  socket.on('subscribe:metrics', () => {
    socket.join('metrics')
  })

  socket.on('subscribe:activity', () => {
    socket.join('activity')
  })

  socket.on('subscribe:alerts', () => {
    socket.join('alerts')
  })

  socket.on('disconnect', () => {
    console.log('Admin client disconnected:', socket.id)
  })
})

// Broadcast functions for real-time updates
export const broadcastMetrics = (data) => {
  io.to('metrics').emit('metrics:update', data)
}

export const broadcastActivity = (data) => {
  io.to('activity').emit('activity:new', data)
}

export const broadcastAlert = (data) => {
  io.to('alerts').emit('alert:new', data)
}

// Error handling
app.use(errorHandler)

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint not found' })
})

// Start server
httpServer.listen(PORT, () => {
  console.log(`
╔═══════════════════════════════════════════════════╗
║        ALQVIMIA ADMIN PORTAL - Backend            ║
╠═══════════════════════════════════════════════════╣
║  Status:  Running                                 ║
║  Port:    ${PORT}                                    ║
║  Mode:    ${process.env.NODE_ENV || 'development'}                            ║
║  API:     http://localhost:${PORT}/api                ║
╚═══════════════════════════════════════════════════╝
  `)
})

export { io }
