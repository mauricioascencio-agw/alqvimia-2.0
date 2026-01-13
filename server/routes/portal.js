/**
 * ALQVIMIA RPA 2.0 - Portal API Routes
 * Endpoints para portal de cliente y administración
 */

import express from 'express'
import crypto from 'crypto'

const router = express.Router()

// ==================== STORAGE (En producción usar DB) ====================
const tenants = new Map()
const onboardingSessions = new Map()
const deployments = new Map()
const usageRecords = new Map()
const auditLogs = []

// ==================== MIDDLEWARE ====================
const requireAuth = (req, res, next) => {
  const token = req.headers.authorization?.replace('Bearer ', '')
  if (!token) {
    return res.status(401).json({ error: 'No autorizado' })
  }
  // En producción: validar JWT
  req.user = { id: 'user_123', tenantId: 'tenant_abc' }
  next()
}

const requireAdmin = (req, res, next) => {
  // En producción: validar rol admin
  if (!req.user?.isAdmin) {
    req.user = { ...req.user, isAdmin: true } // Mock
  }
  next()
}

// ==================== ONBOARDING ====================

/**
 * Iniciar proceso de onboarding
 */
router.post('/onboarding/start', async (req, res) => {
  try {
    const { email, companyName, password } = req.body

    // Validaciones
    if (!email || !companyName || !password) {
      return res.status(400).json({ error: 'Faltan campos requeridos' })
    }

    // Verificar que no exista
    const existingTenant = [...tenants.values()].find(t => t.email === email)
    if (existingTenant) {
      return res.status(400).json({ error: 'El email ya está registrado' })
    }

    // Crear sesión de onboarding
    const sessionId = `onb_${crypto.randomBytes(16).toString('hex')}`
    const session = {
      id: sessionId,
      email,
      companyName,
      passwordHash: crypto.createHash('sha256').update(password).digest('hex'),
      step: 1,
      data: {},
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24h
    }

    onboardingSessions.set(sessionId, session)

    // En producción: enviar email de verificación
    const verificationToken = crypto.randomBytes(32).toString('hex')
    session.verificationToken = verificationToken

    res.json({
      success: true,
      sessionId,
      message: 'Se ha enviado un email de verificación',
      nextStep: 'verify-email'
    })

    // Log
    logAudit('onboarding.started', { email, companyName })

  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

/**
 * Verificar email
 */
router.post('/onboarding/verify-email', async (req, res) => {
  try {
    const { sessionId, token } = req.body

    const session = onboardingSessions.get(sessionId)
    if (!session) {
      return res.status(404).json({ error: 'Sesión no encontrada' })
    }

    // En desarrollo: aceptar cualquier token
    // En producción: validar token
    session.emailVerified = true
    session.step = 2

    res.json({
      success: true,
      message: 'Email verificado',
      nextStep: 'select-plan'
    })

  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

/**
 * Obtener planes disponibles
 */
router.get('/onboarding/plans', async (req, res) => {
  const plans = [
    {
      id: 'starter',
      name: 'Starter',
      price: { monthly: 49, yearly: 470 },
      popular: false,
      features: {
        robots: 1,
        workflows: 5,
        executionsPerMonth: 1000,
        storage: '5 GB',
        support: 'Community'
      },
      modules: ['rpa-studio', 'scheduler'],
      agents: ['mysql', 'rest-api', 'email']
    },
    {
      id: 'professional',
      name: 'Professional',
      price: { monthly: 149, yearly: 1430 },
      popular: true,
      features: {
        robots: 3,
        workflows: 25,
        executionsPerMonth: 10000,
        storage: '25 GB',
        support: 'Email'
      },
      modules: ['rpa-studio', 'scheduler', 'api-access'],
      agents: ['mysql', 'postgresql', 'mongodb', 'rest-api', 'email', 'openai']
    },
    {
      id: 'business',
      name: 'Business',
      price: { monthly: 399, yearly: 3830 },
      popular: false,
      features: {
        robots: 10,
        workflows: 100,
        executionsPerMonth: 50000,
        storage: '100 GB',
        support: 'Priority'
      },
      modules: ['rpa-studio', 'scheduler', 'api-access', 'process-mining', 'sso'],
      agents: 'all'
    },
    {
      id: 'enterprise',
      name: 'Enterprise',
      price: { monthly: null, yearly: null, custom: true },
      popular: false,
      features: {
        robots: 'Ilimitados',
        workflows: 'Ilimitados',
        executionsPerMonth: 'Ilimitadas',
        storage: 'Ilimitado',
        support: 'Dedicado'
      },
      modules: 'all',
      agents: 'all'
    }
  ]

  res.json({ plans })
})

/**
 * Seleccionar plan
 */
router.post('/onboarding/select-plan', async (req, res) => {
  try {
    const { sessionId, planId, billingInterval } = req.body

    const session = onboardingSessions.get(sessionId)
    if (!session) {
      return res.status(404).json({ error: 'Sesión no encontrada' })
    }

    session.data.plan = planId
    session.data.billingInterval = billingInterval || 'monthly'
    session.step = 3

    res.json({
      success: true,
      nextStep: 'configure-modules'
    })

  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

/**
 * Obtener módulos y agentes disponibles
 */
router.get('/onboarding/modules', async (req, res) => {
  const { planId } = req.query

  const modules = [
    { id: 'rpa-studio', name: 'RPA Studio', included: true, price: 0 },
    { id: 'scheduler', name: 'Scheduler', included: true, price: 0 },
    { id: 'api-access', name: 'API Access', included: planId !== 'starter', price: 0 },
    { id: 'process-mining', name: 'Process Mining', included: planId === 'business', price: 99 },
    { id: 'task-mining', name: 'Task Mining', included: false, price: 99 },
    { id: 'idp', name: 'Document Processing', included: false, price: 149 },
    { id: 'analytics-pro', name: 'Analytics Pro', included: planId === 'business', price: 49 }
  ]

  const agents = [
    // Database
    { id: 'mysql', name: 'MySQL', category: 'database', included: true, price: 0 },
    { id: 'postgresql', name: 'PostgreSQL', category: 'database', included: planId !== 'starter', price: 0 },
    { id: 'mongodb', name: 'MongoDB', category: 'database', included: planId !== 'starter', price: 0 },
    { id: 'redis', name: 'Redis', category: 'database', included: planId === 'business', price: 19 },

    // API
    { id: 'rest-api', name: 'REST API', category: 'api', included: true, price: 0 },
    { id: 'graphql', name: 'GraphQL', category: 'api', included: planId !== 'starter', price: 0 },

    // Messaging
    { id: 'email', name: 'Email', category: 'messaging', included: true, price: 0 },
    { id: 'whatsapp', name: 'WhatsApp', category: 'messaging', included: false, price: 29 },
    { id: 'telegram', name: 'Telegram', category: 'messaging', included: planId !== 'starter', price: 0 },
    { id: 'slack', name: 'Slack', category: 'messaging', included: planId !== 'starter', price: 0 },

    // AI
    { id: 'openai', name: 'OpenAI GPT', category: 'ai', included: planId !== 'starter', price: 0 },
    { id: 'claude', name: 'Claude AI', category: 'ai', included: planId === 'business', price: 0 },

    // Storage
    { id: 's3', name: 'AWS S3', category: 'storage', included: planId !== 'starter', price: 0 },

    // Premium
    { id: 'salesforce', name: 'Salesforce', category: 'crm', included: false, price: 199, premium: true },
    { id: 'sap', name: 'SAP', category: 'erp', included: false, price: 499, premium: true }
  ]

  res.json({ modules, agents })
})

/**
 * Configurar módulos y agentes
 */
router.post('/onboarding/configure', async (req, res) => {
  try {
    const { sessionId, modules, agents, subdomain } = req.body

    const session = onboardingSessions.get(sessionId)
    if (!session) {
      return res.status(404).json({ error: 'Sesión no encontrada' })
    }

    // Validar subdomain
    const subdomainRegex = /^[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?$/
    if (!subdomainRegex.test(subdomain)) {
      return res.status(400).json({ error: 'Subdominio inválido' })
    }

    // Verificar disponibilidad
    const existingSubdomain = [...tenants.values()].find(t => t.subdomain === subdomain)
    if (existingSubdomain) {
      return res.status(400).json({ error: 'Subdominio no disponible' })
    }

    session.data.modules = modules
    session.data.agents = agents
    session.data.subdomain = subdomain
    session.step = 4

    res.json({
      success: true,
      nextStep: 'branding'
    })

  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

/**
 * Configurar branding
 */
router.post('/onboarding/branding', async (req, res) => {
  try {
    const { sessionId, logo, colors, displayName } = req.body

    const session = onboardingSessions.get(sessionId)
    if (!session) {
      return res.status(404).json({ error: 'Sesión no encontrada' })
    }

    session.data.branding = {
      logo: logo || null,
      colors: colors || {
        primary: '#3B82F6',
        secondary: '#10B981',
        background: '#0F172A',
        text: '#F8FAFC'
      },
      displayName: displayName || session.companyName
    }
    session.step = 5

    res.json({
      success: true,
      nextStep: 'payment'
    })

  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

/**
 * Calcular precio final
 */
router.post('/onboarding/calculate-price', async (req, res) => {
  try {
    const { sessionId } = req.body

    const session = onboardingSessions.get(sessionId)
    if (!session) {
      return res.status(404).json({ error: 'Sesión no encontrada' })
    }

    const planPrices = {
      starter: { monthly: 49, yearly: 470 },
      professional: { monthly: 149, yearly: 1430 },
      business: { monthly: 399, yearly: 3830 }
    }

    const plan = session.data.plan
    const interval = session.data.billingInterval
    let subtotal = planPrices[plan]?.[interval] || 0

    // Agregar módulos adicionales
    const moduleAddons = {
      'process-mining': 99,
      'task-mining': 99,
      'idp': 149,
      'analytics-pro': 49
    }

    const addons = []
    for (const mod of session.data.modules || []) {
      if (moduleAddons[mod]) {
        addons.push({ name: mod, price: moduleAddons[mod] })
        subtotal += moduleAddons[mod]
      }
    }

    // Agregar agentes premium
    const agentAddons = {
      'whatsapp': 29,
      'redis': 19,
      'salesforce': 199,
      'sap': 499
    }

    for (const agent of session.data.agents || []) {
      if (agentAddons[agent]) {
        addons.push({ name: agent, price: agentAddons[agent] })
        subtotal += agentAddons[agent]
      }
    }

    const taxRate = 0.16 // IVA México
    const tax = subtotal * taxRate
    const total = subtotal + tax

    res.json({
      plan: plan,
      interval: interval,
      basePrice: planPrices[plan]?.[interval] || 0,
      addons,
      subtotal,
      taxRate,
      tax,
      total,
      currency: 'USD'
    })

  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

/**
 * Procesar pago y provisionar
 */
router.post('/onboarding/provision', async (req, res) => {
  try {
    const { sessionId, paymentMethodId, billingInfo } = req.body

    const session = onboardingSessions.get(sessionId)
    if (!session) {
      return res.status(404).json({ error: 'Sesión no encontrada' })
    }

    // 1. Crear tenant
    const tenantId = `tenant_${crypto.randomBytes(12).toString('hex')}`
    const tenant = {
      id: tenantId,
      slug: session.data.subdomain,
      name: session.companyName,
      email: session.email,
      type: 'customer',
      subdomain: session.data.subdomain,
      plan: session.data.plan,
      billingInterval: session.data.billingInterval,
      modules: session.data.modules,
      agents: session.data.agents,
      branding: session.data.branding,
      status: 'provisioning',
      createdAt: new Date(),
      billingInfo
    }

    tenants.set(tenantId, tenant)

    // 2. Generar licencia
    const licenseKey = generateLicenseKey()
    tenant.licenseKey = licenseKey

    // 3. Crear deployment
    const deploymentId = `deploy_${crypto.randomBytes(8).toString('hex')}`
    const deployment = {
      id: deploymentId,
      tenantId,
      status: 'pending',
      subdomain: session.data.subdomain,
      createdAt: new Date()
    }

    deployments.set(deploymentId, deployment)

    // 4. Iniciar provisioning (async)
    provisionEnvironment(tenant, deployment)

    // 5. Limpiar sesión
    onboardingSessions.delete(sessionId)

    res.json({
      success: true,
      tenantId,
      deploymentId,
      licenseKey,
      subdomain: `${session.data.subdomain}.alqvimia.app`,
      status: 'provisioning',
      estimatedTime: '2-5 minutos'
    })

    logAudit('tenant.created', { tenantId, plan: session.data.plan })

  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

/**
 * Verificar estado del provisioning
 */
router.get('/onboarding/status/:deploymentId', async (req, res) => {
  const deployment = deployments.get(req.params.deploymentId)

  if (!deployment) {
    return res.status(404).json({ error: 'Deployment no encontrado' })
  }

  res.json({
    status: deployment.status,
    progress: deployment.progress || 0,
    currentStep: deployment.currentStep || 'Iniciando...',
    url: deployment.status === 'running'
      ? `https://${deployment.subdomain}.alqvimia.app`
      : null,
    error: deployment.error
  })
})

// ==================== CUSTOMER DASHBOARD ====================

/**
 * Obtener métricas del dashboard
 */
router.get('/dashboard/metrics', requireAuth, async (req, res) => {
  const tenantId = req.user.tenantId

  // Mock data
  const metrics = {
    executions: {
      total: 8456,
      success: 8234,
      failed: 222,
      successRate: 97.4
    },
    workflows: {
      total: 18,
      active: 15,
      paused: 3
    },
    savings: {
      hours: 124,
      cost: 2480
    },
    usage: {
      executions: { used: 8456, limit: 10000, percentage: 84.5 },
      storage: { used: 12.4, limit: 25, unit: 'GB', percentage: 49.6 },
      apiCalls: { used: 3245, limit: 5000, percentage: 64.9 }
    }
  }

  res.json(metrics)
})

/**
 * Obtener ejecuciones recientes
 */
router.get('/dashboard/executions', requireAuth, async (req, res) => {
  const { limit = 10, status } = req.query

  // Mock data
  const executions = [
    { id: 'exec_1', workflow: 'Sync ERP', status: 'completed', duration: 135000, steps: 24, cost: 0.08, timestamp: new Date() },
    { id: 'exec_2', workflow: 'Backup DB', status: 'completed', duration: 332000, steps: 8, cost: 0.12, timestamp: new Date(Date.now() - 3600000) },
    { id: 'exec_3', workflow: 'Facturación', status: 'failed', duration: 45000, steps: 3, cost: 0.02, timestamp: new Date(Date.now() - 7200000) }
  ]

  res.json({ executions })
})

// ==================== ADMIN PORTAL ====================

/**
 * Listar todos los tenants
 */
router.get('/admin/tenants', requireAuth, requireAdmin, async (req, res) => {
  const { type, status, search, wholesalerId, page = 1, limit = 20 } = req.query

  let result = [...tenants.values()]

  // Filtros
  if (type) result = result.filter(t => t.type === type)
  if (status) result = result.filter(t => t.status === status)
  if (wholesalerId) result = result.filter(t => t.wholesalerId === wholesalerId)
  if (search) {
    const term = search.toLowerCase()
    result = result.filter(t =>
      t.name.toLowerCase().includes(term) ||
      t.email.toLowerCase().includes(term) ||
      t.subdomain?.toLowerCase().includes(term)
    )
  }

  // Paginación
  const total = result.length
  const offset = (page - 1) * limit
  result = result.slice(offset, offset + parseInt(limit))

  res.json({
    tenants: result,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      pages: Math.ceil(total / limit)
    }
  })
})

/**
 * Detalle de tenant
 */
router.get('/admin/tenants/:id', requireAuth, requireAdmin, async (req, res) => {
  const tenant = tenants.get(req.params.id)

  if (!tenant) {
    return res.status(404).json({ error: 'Tenant no encontrado' })
  }

  // Agregar métricas
  const usage = usageRecords.get(tenant.id) || {
    executions: 0,
    apiCalls: 0,
    storage: 0
  }

  const deployment = [...deployments.values()].find(d => d.tenantId === tenant.id)

  res.json({
    ...tenant,
    usage,
    deployment
  })
})

/**
 * Actualizar tenant
 */
router.put('/admin/tenants/:id', requireAuth, requireAdmin, async (req, res) => {
  const tenant = tenants.get(req.params.id)

  if (!tenant) {
    return res.status(404).json({ error: 'Tenant no encontrado' })
  }

  const { plan, status, limits, modules, agents } = req.body

  if (plan) tenant.plan = plan
  if (status) tenant.status = status
  if (limits) tenant.customLimits = limits
  if (modules) tenant.modules = modules
  if (agents) tenant.agents = agents

  tenant.updatedAt = new Date()

  logAudit('tenant.updated', { tenantId: tenant.id, changes: req.body })

  res.json({ success: true, tenant })
})

/**
 * Suspender tenant
 */
router.post('/admin/tenants/:id/suspend', requireAuth, requireAdmin, async (req, res) => {
  const tenant = tenants.get(req.params.id)

  if (!tenant) {
    return res.status(404).json({ error: 'Tenant no encontrado' })
  }

  tenant.status = 'suspended'
  tenant.suspendedAt = new Date()
  tenant.suspendReason = req.body.reason

  // Detener deployment
  const deployment = [...deployments.values()].find(d => d.tenantId === tenant.id)
  if (deployment) {
    deployment.status = 'stopped'
  }

  logAudit('tenant.suspended', { tenantId: tenant.id, reason: req.body.reason })

  res.json({ success: true })
})

/**
 * Métricas globales (Admin)
 */
router.get('/admin/metrics/global', requireAuth, requireAdmin, async (req, res) => {
  const allTenants = [...tenants.values()]

  const metrics = {
    mrr: allTenants
      .filter(t => t.status === 'active')
      .reduce((sum, t) => {
        const prices = { starter: 49, professional: 149, business: 399 }
        return sum + (prices[t.plan] || 0)
      }, 0),

    totalTenants: allTenants.length,
    activeTenants: allTenants.filter(t => t.status === 'active').length,
    trialTenants: allTenants.filter(t => t.status === 'trial').length,

    byType: {
      wholesalers: allTenants.filter(t => t.type === 'wholesaler').length,
      distributors: allTenants.filter(t => t.type === 'distributor').length,
      customers: allTenants.filter(t => t.type === 'customer').length
    },

    byPlan: {
      starter: allTenants.filter(t => t.plan === 'starter').length,
      professional: allTenants.filter(t => t.plan === 'professional').length,
      business: allTenants.filter(t => t.plan === 'business').length,
      enterprise: allTenants.filter(t => t.plan === 'enterprise').length
    },

    recentSignups: allTenants
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 5)
  }

  res.json(metrics)
})

/**
 * Logs de auditoría
 */
router.get('/admin/audit-logs', requireAuth, requireAdmin, async (req, res) => {
  const { tenantId, eventType, severity, from, to, limit = 100 } = req.query

  let logs = [...auditLogs]

  if (tenantId) logs = logs.filter(l => l.tenantId === tenantId)
  if (eventType) logs = logs.filter(l => l.eventType === eventType)
  if (severity) logs = logs.filter(l => l.severity === severity)
  if (from) logs = logs.filter(l => new Date(l.timestamp) >= new Date(from))
  if (to) logs = logs.filter(l => new Date(l.timestamp) <= new Date(to))

  logs = logs.slice(0, parseInt(limit))

  res.json({ logs })
})

// ==================== HELPERS ====================

function generateLicenseKey() {
  const segments = []
  for (let i = 0; i < 4; i++) {
    segments.push(crypto.randomBytes(2).toString('hex').toUpperCase())
  }
  return `ALQ-${segments.join('-')}`
}

function logAudit(eventType, data) {
  auditLogs.unshift({
    id: `log_${crypto.randomBytes(8).toString('hex')}`,
    timestamp: new Date(),
    eventType,
    severity: eventType.includes('error') ? 'error' : 'info',
    ...data
  })

  // Mantener solo últimos 10000
  if (auditLogs.length > 10000) {
    auditLogs.pop()
  }
}

async function provisionEnvironment(tenant, deployment) {
  const steps = [
    { name: 'Creando namespace', progress: 10 },
    { name: 'Configurando base de datos', progress: 30 },
    { name: 'Desplegando servicios', progress: 50 },
    { name: 'Configurando SSL', progress: 70 },
    { name: 'Inicializando agentes', progress: 90 },
    { name: 'Verificando salud', progress: 100 }
  ]

  try {
    for (const step of steps) {
      deployment.currentStep = step.name
      deployment.progress = step.progress

      // Simular trabajo
      await new Promise(resolve => setTimeout(resolve, 2000))
    }

    deployment.status = 'running'
    deployment.url = `https://${tenant.subdomain}.alqvimia.app`
    deployment.startedAt = new Date()

    tenant.status = 'active'
    tenant.activatedAt = new Date()

    logAudit('deployment.completed', { tenantId: tenant.id, deploymentId: deployment.id })

  } catch (error) {
    deployment.status = 'error'
    deployment.error = error.message

    logAudit('deployment.failed', { tenantId: tenant.id, error: error.message })
  }
}

export default router
