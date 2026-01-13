/**
 * Marketplace - Vendors Routes
 */

import express from 'express'
import { v4 as uuidv4 } from 'uuid'

const router = express.Router()

// Mock vendors database
let vendors = [
  {
    id: 'vendor_001',
    name: 'AI Solutions Corp',
    slug: 'ai-solutions-corp',
    description: 'Especialistas en agentes de IA para automatización empresarial',
    logo: '/assets/vendors/ai-solutions.png',
    website: 'https://aisolutions.example.com',
    email: 'contact@aisolutions.example.com',
    status: 'verified',
    rating: 4.8,
    reviewCount: 456,
    productCount: 12,
    totalSales: 15420,
    joinedAt: new Date('2023-06-15'),
    badges: ['top_seller', 'verified', 'support_excellence'],
    socialLinks: {
      twitter: 'https://twitter.com/aisolutions',
      linkedin: 'https://linkedin.com/company/aisolutions'
    }
  },
  {
    id: 'vendor_002',
    name: 'Automation Pro',
    slug: 'automation-pro',
    description: 'Workflows y automatizaciones para procesos empresariales',
    logo: '/assets/vendors/automation-pro.png',
    website: 'https://automationpro.example.com',
    email: 'hello@automationpro.example.com',
    status: 'verified',
    rating: 4.6,
    reviewCount: 234,
    productCount: 8,
    totalSales: 8750,
    joinedAt: new Date('2023-09-20'),
    badges: ['verified', 'rising_star'],
    socialLinks: {
      twitter: 'https://twitter.com/automationpro'
    }
  },
  {
    id: 'vendor_003',
    name: 'Support Tech',
    slug: 'support-tech',
    description: 'Soluciones de soporte al cliente con IA',
    logo: '/assets/vendors/support-tech.png',
    website: 'https://supporttech.example.com',
    email: 'info@supporttech.example.com',
    status: 'verified',
    rating: 4.9,
    reviewCount: 567,
    productCount: 5,
    totalSales: 21340,
    joinedAt: new Date('2023-03-10'),
    badges: ['top_seller', 'verified', 'innovation_award'],
    socialLinks: {
      linkedin: 'https://linkedin.com/company/supporttech'
    }
  }
]

// GET /api/vendors - Listar vendors
router.get('/', (req, res) => {
  const { status, sort, search, page = 1, limit = 12 } = req.query

  let filtered = vendors.filter(v => v.status !== 'suspended')

  if (status) {
    filtered = filtered.filter(v => v.status === status)
  }

  if (search) {
    const searchLower = search.toLowerCase()
    filtered = filtered.filter(v =>
      v.name.toLowerCase().includes(searchLower) ||
      v.description.toLowerCase().includes(searchLower)
    )
  }

  // Sorting
  switch (sort) {
    case 'rating':
      filtered.sort((a, b) => b.rating - a.rating)
      break
    case 'products':
      filtered.sort((a, b) => b.productCount - a.productCount)
      break
    case 'sales':
      filtered.sort((a, b) => b.totalSales - a.totalSales)
      break
    case 'newest':
      filtered.sort((a, b) => new Date(b.joinedAt) - new Date(a.joinedAt))
      break
    default:
      // Default: by rating
      filtered.sort((a, b) => b.rating - a.rating)
  }

  // Pagination
  const total = filtered.length
  const pages = Math.ceil(total / limit)
  const offset = (page - 1) * limit
  const paginated = filtered.slice(offset, offset + parseInt(limit))

  res.json({
    vendors: paginated,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      pages
    }
  })
})

// GET /api/vendors/top - Top vendors
router.get('/top', (req, res) => {
  const top = vendors
    .filter(v => v.status === 'verified')
    .sort((a, b) => b.totalSales - a.totalSales)
    .slice(0, 5)

  res.json(top)
})

// GET /api/vendors/:id - Obtener vendor
router.get('/:id', (req, res) => {
  const vendor = vendors.find(v => v.id === req.params.id || v.slug === req.params.id)

  if (!vendor) {
    return res.status(404).json({ error: 'Vendor no encontrado' })
  }

  res.json(vendor)
})

// GET /api/vendors/:id/products - Productos del vendor
router.get('/:id/products', (req, res) => {
  const vendor = vendors.find(v => v.id === req.params.id || v.slug === req.params.id)

  if (!vendor) {
    return res.status(404).json({ error: 'Vendor no encontrado' })
  }

  // Mock products - in real app would query products collection
  res.json({
    products: [],
    total: vendor.productCount
  })
})

// POST /api/vendors/register - Registrar como vendor
router.post('/register', (req, res) => {
  const { name, description, website, email } = req.body

  if (!name || !email) {
    return res.status(400).json({ error: 'name y email son requeridos' })
  }

  // Check if already a vendor
  const existingVendor = vendors.find(v =>
    v.email === email || (req.user && v.id === req.user.vendorId)
  )

  if (existingVendor) {
    return res.status(400).json({ error: 'Ya eres un vendor registrado' })
  }

  const newVendor = {
    id: `vendor_${uuidv4().slice(0, 8)}`,
    name,
    slug: name.toLowerCase().replace(/\s+/g, '-'),
    description: description || '',
    logo: null,
    website: website || null,
    email,
    status: 'pending', // Requires verification
    rating: 0,
    reviewCount: 0,
    productCount: 0,
    totalSales: 0,
    joinedAt: new Date(),
    badges: [],
    socialLinks: {}
  }

  vendors.push(newVendor)

  res.status(201).json({
    success: true,
    vendor: newVendor,
    message: 'Solicitud de vendor enviada. Revisaremos tu solicitud en 24-48 horas.'
  })
})

// PUT /api/vendors/:id - Actualizar vendor (solo el vendor o admin)
router.put('/:id', (req, res) => {
  const index = vendors.findIndex(v => v.id === req.params.id)

  if (index === -1) {
    return res.status(404).json({ error: 'Vendor no encontrado' })
  }

  // Verify ownership or admin
  if (req.user.vendorId !== req.params.id && req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Sin permisos para modificar este vendor' })
  }

  const { name, description, website, logo, socialLinks } = req.body

  // Don't allow changing sensitive fields
  vendors[index] = {
    ...vendors[index],
    name: name || vendors[index].name,
    description: description !== undefined ? description : vendors[index].description,
    website: website !== undefined ? website : vendors[index].website,
    logo: logo !== undefined ? logo : vendors[index].logo,
    socialLinks: socialLinks || vendors[index].socialLinks,
    updatedAt: new Date()
  }

  res.json(vendors[index])
})

// GET /api/vendors/:id/stats - Estadísticas del vendor
router.get('/:id/stats', (req, res) => {
  const vendor = vendors.find(v => v.id === req.params.id)

  if (!vendor) {
    return res.status(404).json({ error: 'Vendor no encontrado' })
  }

  // Verify ownership
  if (req.user.vendorId !== req.params.id && req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Sin permisos para ver estas estadísticas' })
  }

  // Mock stats
  const stats = {
    revenue: {
      total: vendor.totalSales * 0.7 * 29.99, // Assuming 70% commission
      thisMonth: 2450.00,
      lastMonth: 2180.00,
      growth: 12.4
    },
    sales: {
      total: vendor.totalSales,
      thisMonth: 156,
      lastMonth: 142,
      growth: 9.8
    },
    products: {
      total: vendor.productCount,
      active: vendor.productCount - 1,
      draft: 1
    },
    reviews: {
      total: vendor.reviewCount,
      average: vendor.rating,
      thisMonth: 23
    },
    views: {
      total: 45670,
      thisMonth: 4520,
      conversionRate: 3.4
    }
  }

  res.json(stats)
})

// GET /api/vendors/:id/payouts - Historial de pagos
router.get('/:id/payouts', (req, res) => {
  const vendor = vendors.find(v => v.id === req.params.id)

  if (!vendor) {
    return res.status(404).json({ error: 'Vendor no encontrado' })
  }

  // Verify ownership
  if (req.user.vendorId !== req.params.id && req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Sin permisos para ver esta información' })
  }

  // Mock payouts
  const payouts = [
    {
      id: 'payout_001',
      amount: 1245.67,
      currency: 'USD',
      status: 'completed',
      method: 'bank_transfer',
      createdAt: new Date('2024-12-01'),
      completedAt: new Date('2024-12-03')
    },
    {
      id: 'payout_002',
      amount: 987.50,
      currency: 'USD',
      status: 'completed',
      method: 'bank_transfer',
      createdAt: new Date('2024-11-01'),
      completedAt: new Date('2024-11-03')
    }
  ]

  res.json({
    payouts,
    pendingBalance: 456.78,
    nextPayoutDate: new Date('2025-01-01')
  })
})

export default router
