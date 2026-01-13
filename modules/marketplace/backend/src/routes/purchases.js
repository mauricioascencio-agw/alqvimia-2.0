/**
 * Marketplace - Purchases Routes
 */

import express from 'express'
import { v4 as uuidv4 } from 'uuid'

const router = express.Router()

// Mock purchases database
let purchases = []

// Mock cart
let carts = new Map()

// GET /api/purchases - Historial de compras del usuario
router.get('/', (req, res) => {
  const userPurchases = purchases.filter(p => p.userId === req.user.id)

  res.json({
    purchases: userPurchases,
    total: userPurchases.length
  })
})

// GET /api/purchases/:id - Detalle de compra
router.get('/:id', (req, res) => {
  const purchase = purchases.find(p => p.id === req.params.id && p.userId === req.user.id)

  if (!purchase) {
    return res.status(404).json({ error: 'Compra no encontrada' })
  }

  res.json(purchase)
})

// GET /api/purchases/cart - Obtener carrito
router.get('/cart/current', (req, res) => {
  const cart = carts.get(req.user.id) || { items: [], total: 0 }
  res.json(cart)
})

// POST /api/purchases/cart - Agregar al carrito
router.post('/cart/add', (req, res) => {
  const { productId, quantity = 1 } = req.body

  if (!productId) {
    return res.status(400).json({ error: 'productId es requerido' })
  }

  let cart = carts.get(req.user.id) || { items: [], total: 0 }

  // Check if already in cart
  const existingIndex = cart.items.findIndex(i => i.productId === productId)

  if (existingIndex !== -1) {
    cart.items[existingIndex].quantity += quantity
  } else {
    // Mock product data
    cart.items.push({
      productId,
      name: `Product ${productId}`,
      price: 29.99,
      quantity
    })
  }

  // Recalculate total
  cart.total = cart.items.reduce((sum, item) => sum + (item.price * item.quantity), 0)

  carts.set(req.user.id, cart)
  res.json(cart)
})

// DELETE /api/purchases/cart/:productId - Remover del carrito
router.delete('/cart/:productId', (req, res) => {
  let cart = carts.get(req.user.id)

  if (!cart) {
    return res.status(404).json({ error: 'Carrito vacío' })
  }

  cart.items = cart.items.filter(i => i.productId !== req.params.productId)
  cart.total = cart.items.reduce((sum, item) => sum + (item.price * item.quantity), 0)

  carts.set(req.user.id, cart)
  res.json(cart)
})

// POST /api/purchases/checkout - Procesar compra
router.post('/checkout', async (req, res) => {
  const cart = carts.get(req.user.id)

  if (!cart || cart.items.length === 0) {
    return res.status(400).json({ error: 'Carrito vacío' })
  }

  const { paymentMethod, billingInfo } = req.body

  // Create purchase record
  const purchase = {
    id: `purchase_${uuidv4().slice(0, 8)}`,
    userId: req.user.id,
    items: cart.items.map(item => ({
      ...item,
      purchasedAt: new Date()
    })),
    subtotal: cart.total,
    tax: cart.total * 0.16, // 16% tax
    total: cart.total * 1.16,
    currency: 'USD',
    status: 'completed',
    paymentMethod: paymentMethod || 'card',
    paymentId: `pay_${uuidv4().slice(0, 12)}`,
    billingInfo: billingInfo || {},
    createdAt: new Date()
  }

  purchases.push(purchase)

  // Clear cart
  carts.delete(req.user.id)

  // Emit real-time update
  const io = req.app.get('io')
  io.emit('purchase:completed', {
    userId: req.user.id,
    purchaseId: purchase.id
  })

  res.json({
    success: true,
    purchase,
    message: 'Compra procesada exitosamente'
  })
})

// POST /api/purchases/:productId/download - Descargar producto comprado
router.post('/:productId/download', (req, res) => {
  // Check if user has purchased this product
  const hasPurchased = purchases.some(p =>
    p.userId === req.user.id &&
    p.status === 'completed' &&
    p.items.some(i => i.productId === req.params.productId)
  )

  if (!hasPurchased) {
    return res.status(403).json({ error: 'No has comprado este producto' })
  }

  // Mock download URL
  const downloadUrl = `https://downloads.alqvimia.com/products/${req.params.productId}/latest`

  res.json({
    success: true,
    downloadUrl,
    expiresAt: new Date(Date.now() + 3600000) // 1 hour
  })
})

// GET /api/purchases/licenses - Licencias del usuario
router.get('/licenses/all', (req, res) => {
  // Extract licenses from purchases
  const licenses = purchases
    .filter(p => p.userId === req.user.id && p.status === 'completed')
    .flatMap(p => p.items.map(item => ({
      id: `lic_${item.productId}`,
      productId: item.productId,
      productName: item.name,
      purchaseId: p.id,
      purchasedAt: item.purchasedAt,
      status: 'active',
      expiresAt: null // null = perpetual
    })))

  res.json({
    licenses,
    total: licenses.length
  })
})

// POST /api/purchases/refund/:id - Solicitar reembolso
router.post('/refund/:id', (req, res) => {
  const purchase = purchases.find(p => p.id === req.params.id && p.userId === req.user.id)

  if (!purchase) {
    return res.status(404).json({ error: 'Compra no encontrada' })
  }

  // Check if within refund period (30 days)
  const purchaseDate = new Date(purchase.createdAt)
  const daysSincePurchase = (Date.now() - purchaseDate.getTime()) / (1000 * 60 * 60 * 24)

  if (daysSincePurchase > 30) {
    return res.status(400).json({ error: 'El período de reembolso ha expirado (30 días)' })
  }

  const { reason } = req.body

  // Create refund request
  purchase.refund = {
    requestedAt: new Date(),
    reason: reason || 'No especificado',
    status: 'pending'
  }

  res.json({
    success: true,
    message: 'Solicitud de reembolso enviada. Te contactaremos en 24-48 horas.',
    refund: purchase.refund
  })
})

export default router
