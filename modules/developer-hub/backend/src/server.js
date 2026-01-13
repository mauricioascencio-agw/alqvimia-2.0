/**
 * ALQVIMIA Developer Hub - Backend Server
 * Puerto: 3003
 * IDE, Testing & Deployment Tools
 * Multi-environment: DEV / QA / PROD
 */

import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import { createServer } from 'http'
import { Server } from 'socket.io'
import dotenv from 'dotenv'

import { getCurrentEnvironment, environments } from './config/environments.js'

// Routes
import authRoutes from './routes/auth.js'
import projectsRoutes from './routes/projects.js'
import workflowsRoutes from './routes/workflows.js'
import agentsRoutes from './routes/agents.js'
import executionRoutes from './routes/execution.js'
import deploymentRoutes from './routes/deployment.js'
import testingRoutes from './routes/testing.js'
import logsRoutes from './routes/logs.js'

// Middleware
import { authenticateToken } from './middleware/auth.js'
import { injectEnvironmentConfig } from './middleware/environment.js'

dotenv.config()

const app = express()
const httpServer = createServer(app)
const io = new Server(httpServer, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
})

const PORT = process.env.PORT || 3003
const currentEnv = getCurrentEnvironment()

// Security
app.use(helmet({
  contentSecurityPolicy: currentEnv.id === 'prod'
}))

app.use(cors({
  origin: currentEnv.id === 'prod'
    ? ['https://dev.alqvimia.com']
    : '*',
  credentials: true
}))

// Body parsing
app.use(express.json({ limit: '50mb' }))
app.use(express.urlencoded({ extended: true }))

// Environment context
app.use(injectEnvironmentConfig)

// Health check with environment info
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    module: 'developer-hub',
    version: '2.0.0',
    environment: {
      id: currentEnv.id,
      name: currentEnv.name,
      color: currentEnv.color
    },
    features: currentEnv.features,
    timestamp: new Date().toISOString()
  })
})

// Get available environments
app.get('/api/environments', (req, res) => {
  const envList = Object.entries(environments).map(([key, env]) => ({
    id: env.id,
    name: env.name,
    shortName: env.shortName,
    color: env.color,
    icon: env.icon,
    description: env.description,
    isCurrent: env.id === currentEnv.id
  }))
  res.json(envList)
})

// Public routes
app.use('/api/auth', authRoutes)

// Protected routes
app.use('/api/projects', authenticateToken, projectsRoutes)
app.use('/api/workflows', authenticateToken, workflowsRoutes)
app.use('/api/agents', authenticateToken, agentsRoutes)
app.use('/api/execution', authenticateToken, executionRoutes)
app.use('/api/deployment', authenticateToken, deploymentRoutes)
app.use('/api/testing', authenticateToken, testingRoutes)
app.use('/api/logs', authenticateToken, logsRoutes)

// WebSocket for real-time features
io.on('connection', (socket) => {
  console.log(`Developer connected: ${socket.id}`)

  // Join environment room
  socket.on('join:environment', (envId) => {
    socket.join(`env:${envId}`)
    console.log(`${socket.id} joined environment: ${envId}`)
  })

  // Real-time execution logs
  socket.on('subscribe:execution', (executionId) => {
    socket.join(`execution:${executionId}`)
  })

  // Real-time deployment status
  socket.on('subscribe:deployment', (deploymentId) => {
    socket.join(`deployment:${deploymentId}`)
  })

  // Code collaboration
  socket.on('code:change', (data) => {
    socket.to(`project:${data.projectId}`).emit('code:update', data)
  })

  socket.on('disconnect', () => {
    console.log(`Developer disconnected: ${socket.id}`)
  })
})

// Export io for other modules
export const emitExecutionLog = (executionId, log) => {
  io.to(`execution:${executionId}`).emit('execution:log', log)
}

export const emitDeploymentStatus = (deploymentId, status) => {
  io.to(`deployment:${deploymentId}`).emit('deployment:status', status)
}

// Error handling
app.use((err, req, res, next) => {
  console.error('Error:', err)
  res.status(err.status || 500).json({
    error: currentEnv.features.errorDetails ? err.message : 'Internal server error',
    ...(currentEnv.features.debugMode && { stack: err.stack })
  })
})

// 404
app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint not found' })
})

// Start server
httpServer.listen(PORT, () => {
  const envColor = currentEnv.id === 'prod' ? '\x1b[31m' :
                   currentEnv.id === 'qa' ? '\x1b[33m' :
                   '\x1b[32m'

  console.log(`
╔═══════════════════════════════════════════════════════════╗
║           ALQVIMIA DEVELOPER HUB - Backend                ║
╠═══════════════════════════════════════════════════════════╣
║  Status:      Running                                     ║
║  Port:        ${PORT}                                        ║
║  Environment: ${envColor}${currentEnv.shortName.padEnd(4)}\x1b[0m ${currentEnv.name.padEnd(20)}         ║
║  Debug Mode:  ${currentEnv.features.debugMode ? 'ON ' : 'OFF'}                                     ║
║  API:         http://localhost:${PORT}/api                    ║
╠═══════════════════════════════════════════════════════════╣
║  Available Environments:                                  ║
║    • DEV  - Development (localhost)                       ║
║    • QA   - Quality Assurance (staging)                   ║
║    • PROD - Production (live)                             ║
╚═══════════════════════════════════════════════════════════╝
  `)
})

export { io }
