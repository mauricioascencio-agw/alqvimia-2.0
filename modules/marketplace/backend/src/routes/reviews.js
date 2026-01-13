/**
 * Marketplace - Reviews Routes
 */

import express from 'express'
import { v4 as uuidv4 } from 'uuid'

const router = express.Router()

// Mock reviews database
let reviews = [
  {
    id: 'rev_001',
    productId: 'prod_001',
    userId: 'user_123',
    userName: 'Carlos M.',
    rating: 5,
    title: 'Excelente agente de ventas',
    content: 'Ha mejorado significativamente nuestro proceso de seguimiento de leads. La integración con CRM fue muy sencilla.',
    helpful: 24,
    verified: true,
    createdAt: new Date('2024-11-15')
  },
  {
    id: 'rev_002',
    productId: 'prod_001',
    userId: 'user_456',
    userName: 'María L.',
    rating: 4,
    title: 'Muy bueno, pero con margen de mejora',
    content: 'Funciona muy bien para la mayoría de casos. Sería ideal si pudiera integrarse con más CRMs.',
    helpful: 12,
    verified: true,
    createdAt: new Date('2024-10-28')
  },
  {
    id: 'rev_003',
    productId: 'prod_002',
    userId: 'user_789',
    userName: 'Juan P.',
    rating: 5,
    title: 'Ahorra horas de trabajo',
    content: 'El OCR es increíblemente preciso. Procesamos cientos de facturas diarias sin problemas.',
    helpful: 45,
    verified: true,
    createdAt: new Date('2024-12-01')
  },
  {
    id: 'rev_004',
    productId: 'prod_004',
    userId: 'user_321',
    userName: 'Ana R.',
    rating: 5,
    title: 'El mejor bot de soporte',
    content: 'Nuestros clientes están muy satisfechos. El bot maneja el 80% de las consultas sin intervención humana.',
    helpful: 67,
    verified: true,
    createdAt: new Date('2024-11-20')
  }
]

// GET /api/reviews/product/:productId - Reviews de un producto
router.get('/product/:productId', (req, res) => {
  const { sort = 'newest', page = 1, limit = 10 } = req.query

  let productReviews = reviews.filter(r => r.productId === req.params.productId)

  // Sorting
  switch (sort) {
    case 'helpful':
      productReviews.sort((a, b) => b.helpful - a.helpful)
      break
    case 'rating_high':
      productReviews.sort((a, b) => b.rating - a.rating)
      break
    case 'rating_low':
      productReviews.sort((a, b) => a.rating - b.rating)
      break
    case 'newest':
    default:
      productReviews.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
  }

  // Calculate stats
  const totalReviews = productReviews.length
  const avgRating = totalReviews > 0
    ? productReviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews
    : 0

  const ratingDistribution = {
    5: productReviews.filter(r => r.rating === 5).length,
    4: productReviews.filter(r => r.rating === 4).length,
    3: productReviews.filter(r => r.rating === 3).length,
    2: productReviews.filter(r => r.rating === 2).length,
    1: productReviews.filter(r => r.rating === 1).length
  }

  // Pagination
  const total = productReviews.length
  const pages = Math.ceil(total / limit)
  const offset = (page - 1) * limit
  const paginated = productReviews.slice(offset, offset + parseInt(limit))

  res.json({
    reviews: paginated,
    stats: {
      totalReviews,
      averageRating: avgRating.toFixed(1),
      distribution: ratingDistribution
    },
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      pages
    }
  })
})

// GET /api/reviews/:id - Obtener review
router.get('/:id', (req, res) => {
  const review = reviews.find(r => r.id === req.params.id)

  if (!review) {
    return res.status(404).json({ error: 'Review no encontrada' })
  }

  res.json(review)
})

// POST /api/reviews - Crear review
router.post('/', (req, res) => {
  const { productId, rating, title, content } = req.body

  if (!productId || !rating) {
    return res.status(400).json({ error: 'productId y rating son requeridos' })
  }

  if (rating < 1 || rating > 5) {
    return res.status(400).json({ error: 'Rating debe ser entre 1 y 5' })
  }

  // Check if user already reviewed this product
  const existingReview = reviews.find(r =>
    r.productId === productId && r.userId === req.user.id
  )

  if (existingReview) {
    return res.status(400).json({ error: 'Ya has dejado una review para este producto' })
  }

  const newReview = {
    id: `rev_${uuidv4().slice(0, 8)}`,
    productId,
    userId: req.user.id,
    userName: req.user.name || 'Usuario',
    rating,
    title: title || '',
    content: content || '',
    helpful: 0,
    verified: true, // Could check if user actually purchased
    createdAt: new Date()
  }

  reviews.push(newReview)

  // Emit real-time update
  const io = req.app.get('io')
  io.to(`product:${productId}`).emit('review:new', newReview)

  res.status(201).json(newReview)
})

// PUT /api/reviews/:id - Actualizar review
router.put('/:id', (req, res) => {
  const index = reviews.findIndex(r => r.id === req.params.id)

  if (index === -1) {
    return res.status(404).json({ error: 'Review no encontrada' })
  }

  // Verify ownership
  if (reviews[index].userId !== req.user.id) {
    return res.status(403).json({ error: 'Sin permisos para modificar esta review' })
  }

  const { rating, title, content } = req.body

  reviews[index] = {
    ...reviews[index],
    rating: rating || reviews[index].rating,
    title: title !== undefined ? title : reviews[index].title,
    content: content !== undefined ? content : reviews[index].content,
    updatedAt: new Date()
  }

  res.json(reviews[index])
})

// DELETE /api/reviews/:id - Eliminar review
router.delete('/:id', (req, res) => {
  const index = reviews.findIndex(r => r.id === req.params.id)

  if (index === -1) {
    return res.status(404).json({ error: 'Review no encontrada' })
  }

  // Verify ownership or admin
  if (reviews[index].userId !== req.user.id && req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Sin permisos para eliminar esta review' })
  }

  reviews.splice(index, 1)
  res.json({ success: true, message: 'Review eliminada' })
})

// POST /api/reviews/:id/helpful - Marcar como útil
router.post('/:id/helpful', (req, res) => {
  const review = reviews.find(r => r.id === req.params.id)

  if (!review) {
    return res.status(404).json({ error: 'Review no encontrada' })
  }

  // In real app, would track which users have voted
  review.helpful++

  res.json({ success: true, helpful: review.helpful })
})

// POST /api/reviews/:id/report - Reportar review
router.post('/:id/report', (req, res) => {
  const review = reviews.find(r => r.id === req.params.id)

  if (!review) {
    return res.status(404).json({ error: 'Review no encontrada' })
  }

  const { reason } = req.body

  // In real app, would store reports for moderation
  console.log(`Review ${req.params.id} reported: ${reason}`)

  res.json({ success: true, message: 'Reporte enviado. Revisaremos la review.' })
})

// GET /api/reviews/user/mine - Reviews del usuario actual
router.get('/user/mine', (req, res) => {
  const userReviews = reviews.filter(r => r.userId === req.user.id)

  res.json({
    reviews: userReviews,
    total: userReviews.length
  })
})

export default router
