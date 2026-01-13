/**
 * Alqvimia Marketplace - Backend Server
 * Puerto: 3002
 */

import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import rateLimit from 'express-rate-limit'
import { createServer } from 'http'
import { Server } from 'socket.io'

// Routes
import productsRoutes from './routes/products.js'
import categoriesRoutes from './routes/categories.js'
import purchasesRoutes from './routes/purchases.js'
import reviewsRoutes from './routes/reviews.js'
import vendorsRoutes from './routes/vendors.js'
import searchRoutes from './routes/search.js'

// Middleware
import { authenticateToken, optionalAuth } from './middleware/auth.js'
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js'

const app = express()
const httpServer = createServer(app)
const io = new Server(httpServer, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:5174',
    methods: ['GET', 'POST']
  }
})

const PORT = process.env.PORT || 3002

// Security middleware
app.use(helmet())
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  credentials: true
}))

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 200
})
app.use(limiter)

// Body parsing
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'marketplace',
    port: PORT,
    timestamp: new Date().toISOString()
  })
})

// API Info
app.get('/api', (req, res) => {
  res.json({
    name: 'Alqvimia Marketplace API',
    version: '1.0.0',
    endpoints: {
      products: '/api/products',
      categories: '/api/categories',
      purchases: '/api/purchases',
      reviews: '/api/reviews',
      vendors: '/api/vendors',
      search: '/api/search'
    }
  })
})

// Routes - Public (with optional auth for personalization)
app.use('/api/products', optionalAuth, productsRoutes)
app.use('/api/categories', categoriesRoutes)
app.use('/api/search', optionalAuth, searchRoutes)

// Routes - Protected
app.use('/api/purchases', authenticateToken, purchasesRoutes)
app.use('/api/reviews', authenticateToken, reviewsRoutes)
app.use('/api/vendors', authenticateToken, vendorsRoutes)

// Socket.IO for real-time updates
io.on('connection', (socket) => {
  console.log('Client connected to Marketplace:', socket.id)

  socket.on('subscribe:product', (productId) => {
    socket.join(`product:${productId}`)
  })

  socket.on('subscribe:vendor', (vendorId) => {
    socket.join(`vendor:${vendorId}`)
  })

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id)
  })
})

// Make io available to routes
app.set('io', io)

// Error handling
app.use(notFoundHandler)
app.use(errorHandler)

httpServer.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════╗
║     Alqvimia Marketplace Server        ║
║────────────────────────────────────────║
║  Port: ${PORT}                            ║
║  Status: Running                       ║
║  Time: ${new Date().toLocaleTimeString()}                      ║
╚════════════════════════════════════════╝
  `)
})

export { io }
