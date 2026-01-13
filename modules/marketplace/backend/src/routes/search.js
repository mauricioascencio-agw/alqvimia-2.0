/**
 * Marketplace - Search Routes
 */

import express from 'express'

const router = express.Router()

// Mock products for search (in real app, would use Elasticsearch or similar)
const searchIndex = [
  {
    id: 'prod_001',
    type: 'agent',
    name: 'Sales AI Assistant',
    description: 'Agente de IA especializado en ventas B2B',
    tags: ['ventas', 'crm', 'leads', 'ai'],
    category: 'Ventas & CRM',
    vendor: 'AI Solutions Corp',
    price: 49.99,
    rating: 4.7
  },
  {
    id: 'prod_002',
    type: 'workflow',
    name: 'Invoice Processing Automation',
    description: 'Procesamiento automático de facturas con OCR',
    tags: ['facturas', 'ocr', 'contabilidad', 'finanzas'],
    category: 'Finanzas',
    vendor: 'Automation Pro',
    price: 29.99,
    rating: 4.5
  },
  {
    id: 'prod_003',
    type: 'extension',
    name: 'Advanced Reporting Pack',
    description: 'Reportes avanzados con dashboards personalizables',
    tags: ['reportes', 'analytics', 'dashboard', 'gratis'],
    category: 'Analytics & BI',
    vendor: 'AI Solutions Corp',
    price: 0,
    rating: 4.2
  },
  {
    id: 'prod_004',
    type: 'agent',
    name: 'Customer Support Bot',
    description: 'Bot de soporte multilingüe con escalamiento',
    tags: ['soporte', 'chatbot', 'multilingue', 'tickets'],
    category: 'Soporte al Cliente',
    vendor: 'Support Tech',
    price: 79.99,
    rating: 4.8
  }
]

// GET /api/search - Búsqueda general
router.get('/', (req, res) => {
  const {
    q,
    type,
    category,
    minPrice,
    maxPrice,
    minRating,
    sort,
    page = 1,
    limit = 12
  } = req.query

  if (!q || q.length < 2) {
    return res.status(400).json({ error: 'Query debe tener al menos 2 caracteres' })
  }

  const queryLower = q.toLowerCase()
  let results = searchIndex.filter(item =>
    item.name.toLowerCase().includes(queryLower) ||
    item.description.toLowerCase().includes(queryLower) ||
    item.tags.some(t => t.includes(queryLower)) ||
    item.category.toLowerCase().includes(queryLower)
  )

  // Filters
  if (type) {
    results = results.filter(r => r.type === type)
  }

  if (category) {
    results = results.filter(r => r.category.toLowerCase().includes(category.toLowerCase()))
  }

  if (minPrice) {
    results = results.filter(r => r.price >= parseFloat(minPrice))
  }

  if (maxPrice) {
    results = results.filter(r => r.price <= parseFloat(maxPrice))
  }

  if (minRating) {
    results = results.filter(r => r.rating >= parseFloat(minRating))
  }

  // Sorting
  switch (sort) {
    case 'price_asc':
      results.sort((a, b) => a.price - b.price)
      break
    case 'price_desc':
      results.sort((a, b) => b.price - a.price)
      break
    case 'rating':
      results.sort((a, b) => b.rating - a.rating)
      break
    case 'relevance':
    default:
      // Already sorted by relevance (match order)
      break
  }

  // Pagination
  const total = results.length
  const pages = Math.ceil(total / limit)
  const offset = (page - 1) * limit
  const paginated = results.slice(offset, offset + parseInt(limit))

  res.json({
    query: q,
    results: paginated,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      pages
    },
    facets: {
      types: [...new Set(results.map(r => r.type))],
      categories: [...new Set(results.map(r => r.category))],
      priceRanges: [
        { min: 0, max: 0, count: results.filter(r => r.price === 0).length },
        { min: 1, max: 50, count: results.filter(r => r.price > 0 && r.price <= 50).length },
        { min: 50, max: 100, count: results.filter(r => r.price > 50 && r.price <= 100).length },
        { min: 100, max: null, count: results.filter(r => r.price > 100).length }
      ]
    }
  })
})

// GET /api/search/suggestions - Sugerencias de búsqueda
router.get('/suggestions', (req, res) => {
  const { q } = req.query

  if (!q || q.length < 2) {
    return res.json({ suggestions: [] })
  }

  const queryLower = q.toLowerCase()

  // Get matching product names
  const nameMatches = searchIndex
    .filter(item => item.name.toLowerCase().includes(queryLower))
    .map(item => item.name)
    .slice(0, 3)

  // Get matching tags
  const tagMatches = [...new Set(
    searchIndex
      .flatMap(item => item.tags)
      .filter(tag => tag.includes(queryLower))
  )].slice(0, 3)

  // Get matching categories
  const categoryMatches = [...new Set(
    searchIndex
      .map(item => item.category)
      .filter(cat => cat.toLowerCase().includes(queryLower))
  )].slice(0, 2)

  const suggestions = [
    ...nameMatches.map(s => ({ type: 'product', text: s })),
    ...tagMatches.map(s => ({ type: 'tag', text: s })),
    ...categoryMatches.map(s => ({ type: 'category', text: s }))
  ].slice(0, 8)

  res.json({ suggestions })
})

// GET /api/search/trending - Búsquedas trending
router.get('/trending', (req, res) => {
  // Mock trending searches
  const trending = [
    { term: 'ventas ai', searches: 1250 },
    { term: 'chatbot soporte', searches: 980 },
    { term: 'ocr facturas', searches: 756 },
    { term: 'dashboard analytics', searches: 654 },
    { term: 'crm automation', searches: 543 }
  ]

  res.json(trending)
})

// GET /api/search/recent - Búsquedas recientes del usuario
router.get('/recent', (req, res) => {
  if (!req.user) {
    return res.json({ recent: [] })
  }

  // Mock recent searches - in real app would be stored per user
  const recent = [
    { term: 'sales assistant', timestamp: new Date('2024-12-20T10:30:00') },
    { term: 'workflow automation', timestamp: new Date('2024-12-19T15:45:00') },
    { term: 'reporting', timestamp: new Date('2024-12-18T09:00:00') }
  ]

  res.json({ recent })
})

// DELETE /api/search/recent - Limpiar búsquedas recientes
router.delete('/recent', (req, res) => {
  // In real app, would clear user's search history
  res.json({ success: true, message: 'Historial de búsqueda limpiado' })
})

export default router
