/**
 * Marketplace - Categories Routes
 */

import express from 'express'

const router = express.Router()

// Categories database
const categories = [
  {
    id: 'cat_sales',
    name: 'Ventas & CRM',
    slug: 'ventas-crm',
    description: 'Herramientas para automatizar procesos de ventas y gestión de clientes',
    icon: 'fa-handshake',
    color: '#3b82f6',
    productCount: 45,
    parentId: null
  },
  {
    id: 'cat_finance',
    name: 'Finanzas',
    slug: 'finanzas',
    description: 'Automatización de procesos financieros y contables',
    icon: 'fa-chart-pie',
    color: '#22c55e',
    productCount: 32,
    parentId: null
  },
  {
    id: 'cat_support',
    name: 'Soporte al Cliente',
    slug: 'soporte-cliente',
    description: 'Chatbots y herramientas de atención al cliente',
    icon: 'fa-headset',
    color: '#f59e0b',
    productCount: 28,
    parentId: null
  },
  {
    id: 'cat_hr',
    name: 'Recursos Humanos',
    slug: 'recursos-humanos',
    description: 'Automatización de procesos de RRHH',
    icon: 'fa-users',
    color: '#8b5cf6',
    productCount: 21,
    parentId: null
  },
  {
    id: 'cat_analytics',
    name: 'Analytics & BI',
    slug: 'analytics-bi',
    description: 'Reportes, dashboards y business intelligence',
    icon: 'fa-chart-line',
    color: '#ec4899',
    productCount: 38,
    parentId: null
  },
  {
    id: 'cat_marketing',
    name: 'Marketing',
    slug: 'marketing',
    description: 'Automatización de campañas y análisis de marketing',
    icon: 'fa-bullhorn',
    color: '#06b6d4',
    productCount: 25,
    parentId: null
  },
  {
    id: 'cat_it',
    name: 'IT & DevOps',
    slug: 'it-devops',
    description: 'Herramientas para equipos de tecnología',
    icon: 'fa-server',
    color: '#64748b',
    productCount: 19,
    parentId: null
  },
  {
    id: 'cat_productivity',
    name: 'Productividad',
    slug: 'productividad',
    description: 'Herramientas para mejorar la eficiencia del trabajo',
    icon: 'fa-rocket',
    color: '#ef4444',
    productCount: 42,
    parentId: null
  }
]

// Product types
const productTypes = [
  {
    id: 'agent',
    name: 'Agentes de IA',
    description: 'Agentes inteligentes para automatización conversacional',
    icon: 'fa-robot',
    color: '#3b82f6'
  },
  {
    id: 'workflow',
    name: 'Workflows',
    description: 'Flujos de trabajo automatizados',
    icon: 'fa-project-diagram',
    color: '#22c55e'
  },
  {
    id: 'extension',
    name: 'Extensiones',
    description: 'Complementos y extensiones para Alqvimia',
    icon: 'fa-puzzle-piece',
    color: '#f59e0b'
  },
  {
    id: 'template',
    name: 'Templates',
    description: 'Plantillas listas para usar',
    icon: 'fa-file-alt',
    color: '#8b5cf6'
  },
  {
    id: 'connector',
    name: 'Conectores',
    description: 'Integraciones con servicios externos',
    icon: 'fa-plug',
    color: '#ec4899'
  }
]

// GET /api/categories - Listar todas las categorías
router.get('/', (req, res) => {
  res.json({
    categories,
    productTypes
  })
})

// GET /api/categories/featured - Categorías destacadas
router.get('/featured', (req, res) => {
  const featured = categories
    .sort((a, b) => b.productCount - a.productCount)
    .slice(0, 6)

  res.json(featured)
})

// GET /api/categories/:id - Obtener categoría
router.get('/:id', (req, res) => {
  const category = categories.find(c => c.id === req.params.id || c.slug === req.params.id)

  if (!category) {
    return res.status(404).json({ error: 'Categoría no encontrada' })
  }

  // Get subcategories if any
  const subcategories = categories.filter(c => c.parentId === category.id)

  res.json({
    ...category,
    subcategories
  })
})

// GET /api/categories/types - Tipos de productos
router.get('/types/list', (req, res) => {
  res.json(productTypes)
})

export default router
