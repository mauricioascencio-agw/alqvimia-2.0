/**
 * ALQVIMIA RPA 2.0 - License Manager
 * Sistema de gestión de licencias y suscripciones
 */

import crypto from 'crypto'
import { EventEmitter } from 'events'

// Planes disponibles
export const PLANS = {
  trial: {
    id: 'trial',
    name: 'Trial',
    price: 0,
    interval: 'once',
    limits: {
      robots: 1,
      workflows: 3,
      executionsPerMonth: 100,
      agents: ['mysql', 'rest-api'],
      machines: 1,
      storageGb: 1,
      retentionDays: 7
    },
    features: ['rpa-studio'],
    durationDays: 14
  },
  starter: {
    id: 'starter',
    name: 'Starter',
    price: 49,
    interval: 'monthly',
    limits: {
      robots: 1,
      workflows: 5,
      executionsPerMonth: 1000,
      agents: ['mysql', 'rest-api', 'email'],
      machines: 1,
      storageGb: 5,
      retentionDays: 30
    },
    features: ['rpa-studio', 'scheduler'],
    stripeProductId: 'prod_alqvimia_starter',
    stripePriceMonthly: 'price_starter_monthly',
    stripePriceYearly: 'price_starter_yearly'
  },
  professional: {
    id: 'professional',
    name: 'Professional',
    price: 149,
    interval: 'monthly',
    limits: {
      robots: 3,
      workflows: 25,
      executionsPerMonth: 10000,
      agents: ['mysql', 'postgresql', 'mongodb', 'rest-api', 'email', 'scheduler', 'openai'],
      machines: 3,
      storageGb: 25,
      retentionDays: 90,
      apiCallsPerDay: 5000
    },
    features: ['rpa-studio', 'scheduler', 'api-access', 'email-support'],
    stripeProductId: 'prod_alqvimia_pro',
    stripePriceMonthly: 'price_pro_monthly',
    stripePriceYearly: 'price_pro_yearly'
  },
  business: {
    id: 'business',
    name: 'Business',
    price: 399,
    interval: 'monthly',
    limits: {
      robots: 10,
      workflows: 100,
      executionsPerMonth: 50000,
      agents: 'all',
      machines: 10,
      storageGb: 100,
      retentionDays: 365,
      apiCallsPerDay: 25000
    },
    features: ['rpa-studio', 'scheduler', 'api-access', 'priority-support', 'process-mining', 'sso'],
    stripeProductId: 'prod_alqvimia_business',
    stripePriceMonthly: 'price_business_monthly',
    stripePriceYearly: 'price_business_yearly'
  },
  enterprise: {
    id: 'enterprise',
    name: 'Enterprise',
    price: null, // Custom pricing
    interval: 'custom',
    limits: {
      robots: -1, // Unlimited
      workflows: -1,
      executionsPerMonth: -1,
      agents: 'all',
      machines: -1,
      storageGb: -1,
      retentionDays: -1,
      apiCallsPerDay: -1
    },
    features: ['rpa-studio', 'scheduler', 'api-access', 'dedicated-support', 'process-mining', 'task-mining', 'idp', 'sso', 'sla', 'on-premise', 'white-label', 'custom-dev'],
    stripeProductId: 'prod_alqvimia_enterprise'
  }
}

// Agentes disponibles
export const AGENTS = {
  // Database
  mysql: { id: 'mysql', name: 'MySQL Agent', category: 'database', tier: 'starter' },
  postgresql: { id: 'postgresql', name: 'PostgreSQL Agent', category: 'database', tier: 'professional' },
  mongodb: { id: 'mongodb', name: 'MongoDB Agent', category: 'database', tier: 'professional' },
  redis: { id: 'redis', name: 'Redis Agent', category: 'database', tier: 'business' },
  sqlite: { id: 'sqlite', name: 'SQLite Agent', category: 'database', tier: 'starter' },

  // API
  'rest-api': { id: 'rest-api', name: 'REST API Agent', category: 'api', tier: 'starter' },
  graphql: { id: 'graphql', name: 'GraphQL Agent', category: 'api', tier: 'professional' },
  websocket: { id: 'websocket', name: 'WebSocket Agent', category: 'api', tier: 'professional' },

  // Messaging
  email: { id: 'email', name: 'Email Agent', category: 'messaging', tier: 'starter' },
  whatsapp: { id: 'whatsapp', name: 'WhatsApp Agent', category: 'messaging', tier: 'professional' },
  telegram: { id: 'telegram', name: 'Telegram Agent', category: 'messaging', tier: 'professional' },
  slack: { id: 'slack', name: 'Slack Agent', category: 'messaging', tier: 'professional' },
  sms: { id: 'sms', name: 'SMS/Twilio Agent', category: 'messaging', tier: 'business', premium: true, price: 29 },

  // AI
  openai: { id: 'openai', name: 'OpenAI GPT Agent', category: 'ai', tier: 'professional' },
  claude: { id: 'claude', name: 'Claude AI Agent', category: 'ai', tier: 'professional' },
  gemini: { id: 'gemini', name: 'Google Gemini Agent', category: 'ai', tier: 'business' },
  ollama: { id: 'ollama', name: 'Ollama Local Agent', category: 'ai', tier: 'business' },

  // Payments
  stripe: { id: 'stripe', name: 'Stripe Agent', category: 'payments', tier: 'business' },
  paypal: { id: 'paypal', name: 'PayPal Agent', category: 'payments', tier: 'business', premium: true, price: 19 },
  mercadopago: { id: 'mercadopago', name: 'MercadoPago Agent', category: 'payments', tier: 'business', premium: true, price: 19 },

  // Storage
  s3: { id: 's3', name: 'AWS S3 Agent', category: 'storage', tier: 'professional' },
  gcs: { id: 'gcs', name: 'Google Cloud Storage Agent', category: 'storage', tier: 'business' },
  azure: { id: 'azure', name: 'Azure Blob Agent', category: 'storage', tier: 'business' },

  // Automation
  scheduler: { id: 'scheduler', name: 'Task Scheduler Agent', category: 'automation', tier: 'starter' },
  scraper: { id: 'scraper', name: 'Web Scraper Agent', category: 'automation', tier: 'business', premium: true, price: 49 },

  // CRM (Premium)
  salesforce: { id: 'salesforce', name: 'Salesforce Agent', category: 'crm', tier: 'enterprise', premium: true, price: 199 },
  hubspot: { id: 'hubspot', name: 'HubSpot Agent', category: 'crm', tier: 'enterprise', premium: true, price: 149 },

  // ERP (Premium)
  sap: { id: 'sap', name: 'SAP Agent', category: 'erp', tier: 'enterprise', premium: true, price: 499 },
  oracle: { id: 'oracle', name: 'Oracle EBS Agent', category: 'erp', tier: 'enterprise', premium: true, price: 399 }
}

class LicenseManager extends EventEmitter {
  constructor(config = {}) {
    super()

    this.config = {
      secretKey: config.secretKey || process.env.LICENSE_SECRET || 'alqvimia-license-secret-key',
      issuer: config.issuer || 'Alqvimia Technologies',
      ...config
    }

    // In-memory storage (use database in production)
    this.licenses = new Map()
    this.organizations = new Map()
    this.activations = new Map()
    this.usageRecords = new Map()
  }

  /**
   * Generar clave de licencia única
   */
  generateLicenseKey() {
    const segments = []
    for (let i = 0; i < 4; i++) {
      segments.push(crypto.randomBytes(2).toString('hex').toUpperCase())
    }
    return `ALQ-${segments.join('-')}`
  }

  /**
   * Crear una nueva licencia
   */
  createLicense(data) {
    const plan = PLANS[data.plan]
    if (!plan) {
      throw new Error(`Invalid plan: ${data.plan}`)
    }

    const licenseKey = this.generateLicenseKey()
    const now = new Date()

    // Calculate expiry
    let expiresAt
    if (data.expiresAt) {
      expiresAt = new Date(data.expiresAt)
    } else if (plan.durationDays) {
      expiresAt = new Date(now.getTime() + plan.durationDays * 24 * 60 * 60 * 1000)
    } else {
      // Default 30 days for monthly
      expiresAt = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)
    }

    const license = {
      id: `lic_${crypto.randomBytes(12).toString('hex')}`,
      key: licenseKey,
      organizationId: data.organizationId,
      plan: plan.id,
      planName: plan.name,
      type: data.type || 'subscription', // subscription, perpetual, trial
      status: 'active',

      limits: { ...plan.limits, ...(data.customLimits || {}) },
      features: [...plan.features, ...(data.additionalFeatures || [])],

      // Additional agents purchased
      premiumAgents: data.premiumAgents || [],

      // Billing info
      billing: {
        stripeCustomerId: data.stripeCustomerId,
        stripeSubscriptionId: data.stripeSubscriptionId,
        zohoCustomerId: data.zohoCustomerId,
        zohoSubscriptionId: data.zohoSubscriptionId,
        amount: plan.price,
        currency: data.currency || 'USD',
        interval: plan.interval
      },

      // Dates
      issuedAt: now,
      activatedAt: null,
      expiresAt: expiresAt,
      lastRenewedAt: null,

      // Activations
      activations: [],
      maxActivations: data.maxActivations || plan.limits.machines,

      // Metadata
      metadata: data.metadata || {},
      notes: data.notes || ''
    }

    // Sign the license
    license.signature = this.signLicense(license)

    // Store
    this.licenses.set(licenseKey, license)

    this.emit('license:created', license)

    return license
  }

  /**
   * Firmar licencia para prevenir manipulación
   */
  signLicense(license) {
    const dataToSign = JSON.stringify({
      id: license.id,
      key: license.key,
      organizationId: license.organizationId,
      plan: license.plan,
      limits: license.limits,
      expiresAt: license.expiresAt
    })

    return crypto
      .createHmac('sha256', this.config.secretKey)
      .update(dataToSign)
      .digest('hex')
  }

  /**
   * Verificar firma de licencia
   */
  verifySignature(license) {
    const expectedSignature = this.signLicense(license)
    return license.signature === expectedSignature
  }

  /**
   * Validar licencia
   */
  validateLicense(licenseKey, machineId = null) {
    const license = this.licenses.get(licenseKey)

    if (!license) {
      return { valid: false, error: 'LICENSE_NOT_FOUND', message: 'License not found' }
    }

    // Verify signature
    if (!this.verifySignature(license)) {
      return { valid: false, error: 'SIGNATURE_INVALID', message: 'License signature is invalid' }
    }

    // Check status
    if (license.status !== 'active') {
      return { valid: false, error: 'LICENSE_INACTIVE', message: `License is ${license.status}` }
    }

    // Check expiry
    if (new Date() > new Date(license.expiresAt)) {
      license.status = 'expired'
      return { valid: false, error: 'LICENSE_EXPIRED', message: 'License has expired' }
    }

    // Check machine activation if provided
    if (machineId) {
      const activation = license.activations.find(a => a.machineId === machineId)

      if (!activation) {
        // Not activated on this machine
        if (license.activations.length >= license.maxActivations) {
          return {
            valid: false,
            error: 'MAX_ACTIVATIONS',
            message: `Maximum activations (${license.maxActivations}) reached`
          }
        }

        return {
          valid: true,
          activated: false,
          license: this.getSafeLicense(license),
          message: 'License valid but not activated on this machine'
        }
      }

      // Update last seen
      activation.lastSeen = new Date()
    }

    return {
      valid: true,
      activated: true,
      license: this.getSafeLicense(license)
    }
  }

  /**
   * Activar licencia en una máquina
   */
  activateLicense(licenseKey, machineInfo) {
    const license = this.licenses.get(licenseKey)

    if (!license) {
      throw new Error('License not found')
    }

    const { machineId, machineName, os, hostname, username } = machineInfo

    // Check if already activated on this machine
    const existingActivation = license.activations.find(a => a.machineId === machineId)
    if (existingActivation) {
      existingActivation.lastSeen = new Date()
      return { success: true, message: 'Already activated', license: this.getSafeLicense(license) }
    }

    // Check activation limit
    if (license.activations.length >= license.maxActivations) {
      throw new Error(`Maximum activations (${license.maxActivations}) reached`)
    }

    // Add activation
    const activation = {
      id: `act_${crypto.randomBytes(8).toString('hex')}`,
      machineId,
      machineName: machineName || hostname,
      os,
      hostname,
      username,
      activatedAt: new Date(),
      lastSeen: new Date(),
      status: 'active'
    }

    license.activations.push(activation)

    if (!license.activatedAt) {
      license.activatedAt = new Date()
    }

    this.emit('license:activated', { license: this.getSafeLicense(license), activation })

    return {
      success: true,
      message: 'License activated successfully',
      activation,
      license: this.getSafeLicense(license)
    }
  }

  /**
   * Desactivar licencia de una máquina
   */
  deactivateLicense(licenseKey, machineId) {
    const license = this.licenses.get(licenseKey)

    if (!license) {
      throw new Error('License not found')
    }

    const activationIndex = license.activations.findIndex(a => a.machineId === machineId)

    if (activationIndex === -1) {
      throw new Error('Machine not activated with this license')
    }

    const [activation] = license.activations.splice(activationIndex, 1)

    this.emit('license:deactivated', { license: this.getSafeLicense(license), machineId })

    return { success: true, message: 'License deactivated from machine' }
  }

  /**
   * Renovar licencia
   */
  renewLicense(licenseKey, extensionDays = 30) {
    const license = this.licenses.get(licenseKey)

    if (!license) {
      throw new Error('License not found')
    }

    const currentExpiry = new Date(license.expiresAt)
    const now = new Date()

    // If already expired, extend from now
    const baseDate = currentExpiry > now ? currentExpiry : now

    license.expiresAt = new Date(baseDate.getTime() + extensionDays * 24 * 60 * 60 * 1000)
    license.lastRenewedAt = now
    license.status = 'active'

    // Re-sign
    license.signature = this.signLicense(license)

    this.emit('license:renewed', { license: this.getSafeLicense(license), extensionDays })

    return { success: true, license: this.getSafeLicense(license) }
  }

  /**
   * Suspender licencia
   */
  suspendLicense(licenseKey, reason) {
    const license = this.licenses.get(licenseKey)

    if (!license) {
      throw new Error('License not found')
    }

    license.status = 'suspended'
    license.suspendedAt = new Date()
    license.suspendReason = reason

    this.emit('license:suspended', { license: this.getSafeLicense(license), reason })

    return { success: true }
  }

  /**
   * Cancelar licencia
   */
  cancelLicense(licenseKey, reason) {
    const license = this.licenses.get(licenseKey)

    if (!license) {
      throw new Error('License not found')
    }

    license.status = 'cancelled'
    license.cancelledAt = new Date()
    license.cancelReason = reason

    this.emit('license:cancelled', { license: this.getSafeLicense(license), reason })

    return { success: true }
  }

  /**
   * Actualizar plan de licencia
   */
  upgradeLicense(licenseKey, newPlan, prorated = true) {
    const license = this.licenses.get(licenseKey)

    if (!license) {
      throw new Error('License not found')
    }

    const plan = PLANS[newPlan]
    if (!plan) {
      throw new Error(`Invalid plan: ${newPlan}`)
    }

    const oldPlan = license.plan

    license.plan = plan.id
    license.planName = plan.name
    license.limits = { ...plan.limits }
    license.features = [...plan.features]
    license.billing.amount = plan.price

    // Re-sign
    license.signature = this.signLicense(license)

    this.emit('license:upgraded', {
      license: this.getSafeLicense(license),
      oldPlan,
      newPlan: plan.id
    })

    return { success: true, license: this.getSafeLicense(license) }
  }

  /**
   * Verificar si un agente está permitido
   */
  isAgentAllowed(licenseKey, agentId) {
    const license = this.licenses.get(licenseKey)

    if (!license || license.status !== 'active') {
      return { allowed: false, reason: 'Invalid or inactive license' }
    }

    // Check if unlimited
    if (license.limits.agents === 'all') {
      return { allowed: true }
    }

    // Check if in allowed list
    if (license.limits.agents.includes(agentId)) {
      return { allowed: true }
    }

    // Check premium agents
    if (license.premiumAgents.includes(agentId)) {
      return { allowed: true }
    }

    // Check agent tier
    const agent = AGENTS[agentId]
    if (!agent) {
      return { allowed: false, reason: 'Unknown agent' }
    }

    return {
      allowed: false,
      reason: 'Agent not included in plan',
      upgrade: agent.premium ? `Purchase for $${agent.price}/mo` : `Upgrade to ${agent.tier} plan`
    }
  }

  /**
   * Verificar límite de ejecuciones
   */
  checkExecutionLimit(licenseKey) {
    const license = this.licenses.get(licenseKey)

    if (!license || license.status !== 'active') {
      return { allowed: false, reason: 'Invalid license' }
    }

    // Unlimited
    if (license.limits.executionsPerMonth === -1) {
      return { allowed: true, remaining: -1 }
    }

    // Get usage
    const usage = this.getUsage(license.organizationId)
    const used = usage.executions || 0
    const limit = license.limits.executionsPerMonth

    if (used >= limit) {
      return {
        allowed: false,
        reason: 'Monthly execution limit reached',
        used,
        limit,
        remaining: 0
      }
    }

    return {
      allowed: true,
      used,
      limit,
      remaining: limit - used
    }
  }

  /**
   * Registrar uso
   */
  recordUsage(organizationId, type, amount = 1) {
    const key = `${organizationId}_${new Date().toISOString().slice(0, 7)}` // org_YYYY-MM

    if (!this.usageRecords.has(key)) {
      this.usageRecords.set(key, {
        organizationId,
        period: new Date().toISOString().slice(0, 7),
        executions: 0,
        apiCalls: 0,
        storageBytes: 0,
        aiCalls: 0
      })
    }

    const usage = this.usageRecords.get(key)
    usage[type] = (usage[type] || 0) + amount

    return usage
  }

  /**
   * Obtener uso del período actual
   */
  getUsage(organizationId) {
    const key = `${organizationId}_${new Date().toISOString().slice(0, 7)}`
    return this.usageRecords.get(key) || {
      organizationId,
      period: new Date().toISOString().slice(0, 7),
      executions: 0,
      apiCalls: 0,
      storageBytes: 0,
      aiCalls: 0
    }
  }

  /**
   * Obtener licencia sin información sensible
   */
  getSafeLicense(license) {
    return {
      id: license.id,
      key: license.key,
      organizationId: license.organizationId,
      plan: license.plan,
      planName: license.planName,
      type: license.type,
      status: license.status,
      limits: license.limits,
      features: license.features,
      premiumAgents: license.premiumAgents,
      issuedAt: license.issuedAt,
      activatedAt: license.activatedAt,
      expiresAt: license.expiresAt,
      activations: license.activations.map(a => ({
        id: a.id,
        machineName: a.machineName,
        activatedAt: a.activatedAt,
        lastSeen: a.lastSeen,
        status: a.status
      })),
      maxActivations: license.maxActivations
    }
  }

  /**
   * Listar todas las licencias
   */
  listLicenses(filters = {}) {
    let licenses = [...this.licenses.values()]

    if (filters.organizationId) {
      licenses = licenses.filter(l => l.organizationId === filters.organizationId)
    }
    if (filters.status) {
      licenses = licenses.filter(l => l.status === filters.status)
    }
    if (filters.plan) {
      licenses = licenses.filter(l => l.plan === filters.plan)
    }

    return licenses.map(l => this.getSafeLicense(l))
  }

  /**
   * Obtener estadísticas
   */
  getStats() {
    const licenses = [...this.licenses.values()]

    const byPlan = {}
    const byStatus = { active: 0, expired: 0, suspended: 0, cancelled: 0 }

    for (const license of licenses) {
      byPlan[license.plan] = (byPlan[license.plan] || 0) + 1
      byStatus[license.status] = (byStatus[license.status] || 0) + 1
    }

    const totalActivations = licenses.reduce((sum, l) => sum + l.activations.length, 0)

    return {
      total: licenses.length,
      byPlan,
      byStatus,
      totalActivations,
      mrr: licenses
        .filter(l => l.status === 'active')
        .reduce((sum, l) => sum + (l.billing.amount || 0), 0)
    }
  }

  /**
   * Exportar licencia para uso offline
   */
  exportLicense(licenseKey) {
    const license = this.licenses.get(licenseKey)
    if (!license) {
      throw new Error('License not found')
    }

    const exportData = {
      ...this.getSafeLicense(license),
      signature: license.signature,
      exportedAt: new Date().toISOString()
    }

    // Encrypt for distribution
    const encrypted = this.encryptLicenseData(exportData)

    return encrypted
  }

  /**
   * Importar licencia offline
   */
  importLicense(encryptedData) {
    const decrypted = this.decryptLicenseData(encryptedData)

    // Verify and store
    const license = {
      ...decrypted,
      importedAt: new Date()
    }

    // Verify signature
    if (!this.verifySignature(license)) {
      throw new Error('Invalid license signature')
    }

    this.licenses.set(license.key, license)

    return this.getSafeLicense(license)
  }

  encryptLicenseData(data) {
    const iv = crypto.randomBytes(16)
    const key = crypto.scryptSync(this.config.secretKey, 'salt', 32)
    const cipher = crypto.createCipheriv('aes-256-gcm', key, iv)

    let encrypted = cipher.update(JSON.stringify(data), 'utf8', 'base64')
    encrypted += cipher.final('base64')

    const authTag = cipher.getAuthTag()

    return Buffer.concat([iv, authTag, Buffer.from(encrypted, 'base64')]).toString('base64')
  }

  decryptLicenseData(encryptedData) {
    const buffer = Buffer.from(encryptedData, 'base64')

    const iv = buffer.subarray(0, 16)
    const authTag = buffer.subarray(16, 32)
    const encrypted = buffer.subarray(32)

    const key = crypto.scryptSync(this.config.secretKey, 'salt', 32)
    const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv)
    decipher.setAuthTag(authTag)

    let decrypted = decipher.update(encrypted, undefined, 'utf8')
    decrypted += decipher.final('utf8')

    return JSON.parse(decrypted)
  }
}

export default LicenseManager
