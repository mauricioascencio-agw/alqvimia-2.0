/**
 * Marketplace - Products Routes
 */

import express from 'express'
import { v4 as uuidv4 } from 'uuid'

const router = express.Router()

// Mock products database
let products = [
  {
    id: 'prod_001',
    type: 'agent',
    name: 'Sales AI Assistant',
    slug: 'sales-ai-assistant',
    description: 'Agente de IA especializado en ventas B2B con capacidades de análisis de leads y seguimiento automático.',
    shortDescription: 'Asistente de ventas con IA',
    vendorId: 'vendor_001',
    vendorName: 'AI Solutions Corp',
    categoryId: 'cat_sales',
    price: 49.99,
    currency: 'USD',
    pricingModel: 'monthly',
    status: 'published',
    featured: true,
    rating: 4.7,
    reviewCount: 156,
    downloadCount: 2340,
    version: '2.1.0',
    compatibility: ['alqvimia-2.0'],
    tags: ['ventas', 'crm', 'leads', 'ai'],
    images: [
      '/assets/products/sales-ai-1.png',
      '/assets/products/sales-ai-2.png'
    ],
    features: [
      'Análisis automático de leads',
      'Seguimiento inteligente',
      'Integración con CRM',
      'Reportes personalizados'
    ],
    requirements: {
      minVersion: '2.0.0',
      mcpServers: ['mcp_crm', 'mcp_email']
    },
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-12-20')
  },
  {
    id: 'prod_002',
    type: 'workflow',
    name: 'Invoice Processing Automation',
    slug: 'invoice-processing-automation',
    description: 'Workflow completo para procesamiento automático de facturas con OCR y validación.',
    shortDescription: 'Automatización de facturas',
    vendorId: 'vendor_002',
    vendorName: 'Automation Pro',
    categoryId: 'cat_finance',
    price: 29.99,
    currency: 'USD',
    pricingModel: 'one-time',
    status: 'published',
    featured: true,
    rating: 4.5,
    reviewCount: 89,
    downloadCount: 1567,
    version: '1.5.0',
    compatibility: ['alqvimia-2.0', 'alqvimia-1.5'],
    tags: ['facturas', 'ocr', 'contabilidad', 'finanzas'],
    images: ['/assets/products/invoice-1.png'],
    features: [
      'OCR de alta precisión',
      'Validación automática',
      'Exportación a ERP',
      'Detección de duplicados'
    ],
    requirements: {
      minVersion: '1.5.0',
      mcpServers: ['mcp_storage', 'mcp_ocr']
    },
    createdAt: new Date('2024-03-10'),
    updatedAt: new Date('2024-12-15')
  },
  {
    id: 'prod_003',
    type: 'extension',
    name: 'Advanced Reporting Pack',
    slug: 'advanced-reporting-pack',
    description: 'Pack de reportes avanzados con dashboards personalizables y exportación a múltiples formatos.',
    shortDescription: 'Reportes avanzados',
    vendorId: 'vendor_001',
    vendorName: 'AI Solutions Corp',
    categoryId: 'cat_analytics',
    price: 0,
    currency: 'USD',
    pricingModel: 'free',
    status: 'published',
    featured: false,
    rating: 4.2,
    reviewCount: 234,
    downloadCount: 5678,
    version: '3.0.0',
    compatibility: ['alqvimia-2.0'],
    tags: ['reportes', 'analytics', 'dashboard', 'gratis'],
    images: ['/assets/products/reports-1.png'],
    features: [
      'Dashboards personalizables',
      'Exportación PDF/Excel',
      'Programación de reportes',
      'Widgets arrastrables'
    ],
    requirements: {
      minVersion: '2.0.0',
      mcpServers: []
    },
    createdAt: new Date('2024-06-01'),
    updatedAt: new Date('2024-12-10')
  },
  {
    id: 'prod_004',
    type: 'agent',
    name: 'Customer Support Bot',
    slug: 'customer-support-bot',
    description: 'Bot de soporte al cliente multilingüe con capacidades de escalamiento y base de conocimientos.',
    shortDescription: 'Bot de soporte multilingüe',
    vendorId: 'vendor_003',
    vendorName: 'Support Tech',
    categoryId: 'cat_support',
    price: 79.99,
    currency: 'USD',
    pricingModel: 'monthly',
    status: 'published',
    featured: true,
    rating: 4.8,
    reviewCount: 312,
    downloadCount: 4521,
    version: '2.0.0',
    compatibility: ['alqvimia-2.0'],
    tags: ['soporte', 'chatbot', 'multilingue', 'tickets'],
    images: ['/assets/products/support-bot-1.png'],
    features: [
      'Soporte en 15 idiomas',
      'Base de conocimientos integrada',
      'Escalamiento automático',
      'Análisis de sentimiento'
    ],
    requirements: {
      minVersion: '2.0.0',
      mcpServers: ['mcp_knowledge_base', 'mcp_ticketing']
    },
    createdAt: new Date('2024-04-20'),
    updatedAt: new Date('2024-12-18')
  }
]

// GET /api/products - Listar productos
router.get('/', (req, res) => {
  const {
    type,
    category,
    vendor,
    featured,
    minPrice,
    maxPrice,
    sort,
    search,
    page = 1,
    limit = 12
  } = req.query

  let filtered = products.filter(p => p.status === 'published')

  if (type) {
    filtered = filtered.filter(p => p.type === type)
  }

  if (category) {
    filtered = filtered.filter(p => p.categoryId === category)
  }

  if (vendor) {
    filtered = filtered.filter(p => p.vendorId === vendor)
  }

  if (featured === 'true') {
    filtered = filtered.filter(p => p.featured)
  }

  if (minPrice) {
    filtered = filtered.filter(p => p.price >= parseFloat(minPrice))
  }

  if (maxPrice) {
    filtered = filtered.filter(p => p.price <= parseFloat(maxPrice))
  }

  if (search) {
    const searchLower = search.toLowerCase()
    filtered = filtered.filter(p =>
      p.name.toLowerCase().includes(searchLower) ||
      p.description.toLowerCase().includes(searchLower) ||
      p.tags.some(t => t.includes(searchLower))
    )
  }

  // Sorting
  switch (sort) {
    case 'price_asc':
      filtered.sort((a, b) => a.price - b.price)
      break
    case 'price_desc':
      filtered.sort((a, b) => b.price - a.price)
      break
    case 'rating':
      filtered.sort((a, b) => b.rating - a.rating)
      break
    case 'downloads':
      filtered.sort((a, b) => b.downloadCount - a.downloadCount)
      break
    case 'newest':
      filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      break
    default:
      // Default: featured first, then by rating
      filtered.sort((a, b) => {
        if (a.featured !== b.featured) return b.featured ? 1 : -1
        return b.rating - a.rating
      })
  }

  // Pagination
  const total = filtered.length
  const pages = Math.ceil(total / limit)
  const offset = (page - 1) * limit
  const paginated = filtered.slice(offset, offset + parseInt(limit))

  res.json({
    products: paginated,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      pages
    }
  })
})

// GET /api/products/featured - Productos destacados
router.get('/featured', (req, res) => {
  const featured = products
    .filter(p => p.status === 'published' && p.featured)
    .slice(0, 6)

  res.json(featured)
})

// GET /api/products/popular - Productos más populares
router.get('/popular', (req, res) => {
  const popular = products
    .filter(p => p.status === 'published')
    .sort((a, b) => b.downloadCount - a.downloadCount)
    .slice(0, 8)

  res.json(popular)
})

// GET /api/products/:id - Obtener producto
router.get('/:id', (req, res) => {
  const product = products.find(p => p.id === req.params.id || p.slug === req.params.id)

  if (!product) {
    return res.status(404).json({ error: 'Producto no encontrado' })
  }

  // Get related products
  const related = products
    .filter(p =>
      p.id !== product.id &&
      p.status === 'published' &&
      (p.categoryId === product.categoryId || p.type === product.type)
    )
    .slice(0, 4)

  res.json({
    ...product,
    related
  })
})

// GET /api/products/:id/versions - Historial de versiones
router.get('/:id/versions', (req, res) => {
  const product = products.find(p => p.id === req.params.id)

  if (!product) {
    return res.status(404).json({ error: 'Producto no encontrado' })
  }

  // Mock version history
  const versions = [
    {
      version: product.version,
      releaseDate: product.updatedAt,
      changelog: 'Mejoras de rendimiento y corrección de bugs',
      isCurrent: true
    },
    {
      version: '2.0.0',
      releaseDate: new Date('2024-10-01'),
      changelog: 'Nueva versión mayor con rediseño de interfaz',
      isCurrent: false
    },
    {
      version: '1.5.0',
      releaseDate: new Date('2024-06-15'),
      changelog: 'Nuevas funcionalidades de integración',
      isCurrent: false
    }
  ]

  res.json(versions)
})

// POST /api/products - Crear producto (solo vendors)
router.post('/', (req, res) => {
  if (!req.user) {
    return res.status(401).json({ error: 'No autenticado' })
  }

  const {
    type,
    name,
    description,
    shortDescription,
    categoryId,
    price,
    pricingModel,
    tags,
    features,
    requirements
  } = req.body

  if (!type || !name || !categoryId) {
    return res.status(400).json({ error: 'type, name y categoryId son requeridos' })
  }

  const newProduct = {
    id: `prod_${uuidv4().slice(0, 8)}`,
    type,
    name,
    slug: name.toLowerCase().replace(/\s+/g, '-'),
    description: description || '',
    shortDescription: shortDescription || '',
    vendorId: req.user.vendorId || 'vendor_default',
    vendorName: req.user.name || 'Vendor',
    categoryId,
    price: price || 0,
    currency: 'USD',
    pricingModel: pricingModel || 'one-time',
    status: 'draft',
    featured: false,
    rating: 0,
    reviewCount: 0,
    downloadCount: 0,
    version: '1.0.0',
    compatibility: ['alqvimia-2.0'],
    tags: tags || [],
    images: [],
    features: features || [],
    requirements: requirements || { minVersion: '2.0.0', mcpServers: [] },
    createdAt: new Date(),
    updatedAt: new Date()
  }

  products.push(newProduct)
  res.status(201).json(newProduct)
})

// PUT /api/products/:id - Actualizar producto
router.put('/:id', (req, res) => {
  if (!req.user) {
    return res.status(401).json({ error: 'No autenticado' })
  }

  const index = products.findIndex(p => p.id === req.params.id)

  if (index === -1) {
    return res.status(404).json({ error: 'Producto no encontrado' })
  }

  // Verify ownership
  if (products[index].vendorId !== req.user.vendorId && req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Sin permisos para modificar este producto' })
  }

  const updates = req.body
  delete updates.id
  delete updates.vendorId
  delete updates.rating
  delete updates.reviewCount
  delete updates.downloadCount

  products[index] = {
    ...products[index],
    ...updates,
    updatedAt: new Date()
  }

  res.json(products[index])
})

// DELETE /api/products/:id - Eliminar producto
router.delete('/:id', (req, res) => {
  if (!req.user) {
    return res.status(401).json({ error: 'No autenticado' })
  }

  const index = products.findIndex(p => p.id === req.params.id)

  if (index === -1) {
    return res.status(404).json({ error: 'Producto no encontrado' })
  }

  // Verify ownership
  if (products[index].vendorId !== req.user.vendorId && req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Sin permisos para eliminar este producto' })
  }

  products.splice(index, 1)
  res.json({ success: true, message: 'Producto eliminado' })
})

export default router
