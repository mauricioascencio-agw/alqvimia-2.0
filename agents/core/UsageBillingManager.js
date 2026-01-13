/**
 * ALQVIMIA RPA 2.0 - Usage & Billing Manager
 * Sistema de facturación flexible: consumo, proceso, implementación
 * Soporta comisiones multi-nivel para Mayoristas, Distribuidores, Partners
 */

import Stripe from 'stripe'
import mysql from 'mysql2/promise'

// Modelos de facturación
export const BILLING_MODELS = {
  // Por consumo (pay-as-you-go)
  consumption: {
    id: 'consumption',
    name: 'Por Consumo',
    description: 'Paga solo por lo que usas',
    rates: {
      execution: 0.001,        // $0.001 por ejecución
      apiCall: 0.0005,         // $0.0005 por llamada API
      storage: 0.02,           // $0.02 por GB/mes
      aiToken: 0.00002,        // $0.00002 por token AI
      messageOut: 0.005,       // $0.005 por mensaje saliente
      databaseQuery: 0.0001    // $0.0001 por query
    }
  },

  // Por proceso (workflow)
  process: {
    id: 'process',
    name: 'Por Proceso',
    description: 'Tarifa fija por workflow ejecutado',
    tiers: [
      { name: 'Simple', stepsMax: 5, price: 0.05 },
      { name: 'Estándar', stepsMax: 15, price: 0.15 },
      { name: 'Complejo', stepsMax: 50, price: 0.35 },
      { name: 'Enterprise', stepsMax: Infinity, price: 0.75 }
    ]
  },

  // Por implementación (proyecto)
  implementation: {
    id: 'implementation',
    name: 'Por Implementación',
    description: 'Precio fijo por proyecto o integración',
    packages: [
      {
        id: 'basic_integration',
        name: 'Integración Básica',
        price: 500,
        includes: ['1 flujo', '1 conexión', 'Soporte email', '30 días']
      },
      {
        id: 'standard_integration',
        name: 'Integración Estándar',
        price: 1500,
        includes: ['5 flujos', '3 conexiones', 'Soporte prioritario', '60 días']
      },
      {
        id: 'advanced_integration',
        name: 'Integración Avanzada',
        price: 5000,
        includes: ['15 flujos', '10 conexiones', 'Soporte dedicado', '90 días', 'Capacitación']
      },
      {
        id: 'enterprise_integration',
        name: 'Implementación Enterprise',
        price: 15000,
        includes: ['Flujos ilimitados', 'Conexiones ilimitadas', 'Soporte 24/7', '180 días', 'Capacitación in-situ', 'Desarrollo personalizado']
      }
    ]
  },

  // Suscripción híbrida
  hybrid: {
    id: 'hybrid',
    name: 'Híbrido',
    description: 'Base mensual + consumo excedente',
    plans: [
      {
        id: 'hybrid_starter',
        name: 'Hybrid Starter',
        basePrice: 29,
        included: { executions: 1000, apiCalls: 5000, storage: 1 },
        overageRates: { execution: 0.002, apiCall: 0.001, storage: 0.03 }
      },
      {
        id: 'hybrid_pro',
        name: 'Hybrid Pro',
        basePrice: 99,
        included: { executions: 10000, apiCalls: 50000, storage: 10 },
        overageRates: { execution: 0.0015, apiCall: 0.0007, storage: 0.025 }
      },
      {
        id: 'hybrid_business',
        name: 'Hybrid Business',
        basePrice: 299,
        included: { executions: 50000, apiCalls: 250000, storage: 50 },
        overageRates: { execution: 0.001, apiCall: 0.0005, storage: 0.02 }
      }
    ]
  }
}

// Estructura de comisiones por nivel
export const COMMISSION_STRUCTURE = {
  wholesaler: {
    level: 1,
    label: 'Mayorista',
    commission: 0.40,          // 40% del total
    canSetPricing: true,
    canCreateDistributors: true,
    minVolume: 10000           // Mínimo $10k/mes para calificar
  },
  distributor: {
    level: 2,
    label: 'Distribuidor',
    commission: 0.25,          // 25% del total (después de mayorista)
    canSetPricing: false,
    canCreatePartners: true,
    minVolume: 2500            // Mínimo $2.5k/mes
  },
  partner: {
    level: 3,
    label: 'Partner TI',
    commission: 0.15,          // 15% del total (después de distribuidor)
    canSetPricing: false,
    canCreateClients: true,
    minVolume: 500             // Mínimo $500/mes
  },
  referral: {
    level: 4,
    label: 'Referido',
    commission: 0.10,          // 10% por referidos
    canSetPricing: false,
    canCreateClients: false,
    duration: 12               // Meses que dura la comisión
  }
}

export class UsageBillingManager {
  constructor(config = {}) {
    this.stripe = new Stripe(config.stripeSecretKey || process.env.STRIPE_SECRET_KEY)
    this.dbConfig = config.database || {
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'alqvimia'
    }
    this.pool = null
  }

  async initialize() {
    this.pool = mysql.createPool(this.dbConfig)

    // Crear tablas de billing si no existen
    await this.createBillingTables()

    console.log('UsageBillingManager initialized')
  }

  async createBillingTables() {
    const queries = [
      // Tabla de uso detallado
      `CREATE TABLE IF NOT EXISTS usage_records (
        id INT AUTO_INCREMENT PRIMARY KEY,
        tenant_id VARCHAR(50) NOT NULL,
        usage_type ENUM('execution', 'api_call', 'storage', 'ai_token', 'message', 'query') NOT NULL,
        quantity DECIMAL(15, 6) NOT NULL,
        unit_cost DECIMAL(10, 6) NOT NULL,
        total_cost DECIMAL(15, 6) NOT NULL,
        metadata JSON,
        billing_period VARCHAR(7) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_tenant_period (tenant_id, billing_period),
        INDEX idx_type (usage_type)
      )`,

      // Tabla de procesos facturables
      `CREATE TABLE IF NOT EXISTS billable_processes (
        id INT AUTO_INCREMENT PRIMARY KEY,
        tenant_id VARCHAR(50) NOT NULL,
        process_id VARCHAR(50) NOT NULL,
        process_name VARCHAR(255),
        tier VARCHAR(50) NOT NULL,
        steps_count INT NOT NULL,
        unit_price DECIMAL(10, 4) NOT NULL,
        status ENUM('pending', 'billed', 'failed') DEFAULT 'pending',
        execution_time_ms INT,
        billing_period VARCHAR(7) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_tenant_period (tenant_id, billing_period)
      )`,

      // Tabla de implementaciones
      `CREATE TABLE IF NOT EXISTS implementations (
        id INT AUTO_INCREMENT PRIMARY KEY,
        tenant_id VARCHAR(50) NOT NULL,
        package_id VARCHAR(50) NOT NULL,
        package_name VARCHAR(255),
        price DECIMAL(12, 2) NOT NULL,
        status ENUM('contracted', 'in_progress', 'completed', 'cancelled') DEFAULT 'contracted',
        start_date DATE,
        estimated_end_date DATE,
        actual_end_date DATE,
        payment_status ENUM('pending', 'partial', 'paid') DEFAULT 'pending',
        amount_paid DECIMAL(12, 2) DEFAULT 0,
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_tenant (tenant_id),
        INDEX idx_status (status)
      )`,

      // Tabla de comisiones
      `CREATE TABLE IF NOT EXISTS commissions (
        id INT AUTO_INCREMENT PRIMARY KEY,
        beneficiary_id VARCHAR(50) NOT NULL,
        source_tenant_id VARCHAR(50) NOT NULL,
        commission_type ENUM('wholesaler', 'distributor', 'partner', 'referral') NOT NULL,
        base_amount DECIMAL(12, 2) NOT NULL,
        commission_rate DECIMAL(5, 4) NOT NULL,
        commission_amount DECIMAL(12, 2) NOT NULL,
        billing_period VARCHAR(7) NOT NULL,
        status ENUM('pending', 'approved', 'paid', 'cancelled') DEFAULT 'pending',
        payment_date DATE,
        payment_reference VARCHAR(100),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_beneficiary (beneficiary_id),
        INDEX idx_period_status (billing_period, status)
      )`,

      // Tabla de facturas
      `CREATE TABLE IF NOT EXISTS invoices (
        id INT AUTO_INCREMENT PRIMARY KEY,
        invoice_number VARCHAR(50) UNIQUE NOT NULL,
        tenant_id VARCHAR(50) NOT NULL,
        billing_model ENUM('consumption', 'process', 'implementation', 'hybrid', 'subscription') NOT NULL,
        billing_period VARCHAR(7),
        subtotal DECIMAL(12, 2) NOT NULL,
        tax_rate DECIMAL(5, 4) DEFAULT 0.16,
        tax_amount DECIMAL(12, 2) NOT NULL,
        total DECIMAL(12, 2) NOT NULL,
        currency VARCHAR(3) DEFAULT 'USD',
        status ENUM('draft', 'pending', 'paid', 'overdue', 'cancelled') DEFAULT 'draft',
        due_date DATE,
        paid_date DATE,
        stripe_invoice_id VARCHAR(100),
        zoho_invoice_id VARCHAR(100),
        cfdi_uuid VARCHAR(100),
        line_items JSON,
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_tenant (tenant_id),
        INDEX idx_status (status),
        INDEX idx_period (billing_period)
      )`,

      // Tabla de configuración de billing por tenant
      `CREATE TABLE IF NOT EXISTS tenant_billing_config (
        id INT AUTO_INCREMENT PRIMARY KEY,
        tenant_id VARCHAR(50) UNIQUE NOT NULL,
        billing_model ENUM('consumption', 'process', 'implementation', 'hybrid', 'subscription') NOT NULL,
        plan_id VARCHAR(50),
        custom_rates JSON,
        payment_method VARCHAR(50),
        stripe_customer_id VARCHAR(100),
        stripe_subscription_id VARCHAR(100),
        billing_email VARCHAR(255),
        billing_address JSON,
        tax_id VARCHAR(50),
        currency VARCHAR(3) DEFAULT 'USD',
        invoice_prefix VARCHAR(10),
        auto_charge BOOLEAN DEFAULT true,
        payment_terms_days INT DEFAULT 15,
        parent_id VARCHAR(50),
        commission_type ENUM('wholesaler', 'distributor', 'partner', 'referral'),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_parent (parent_id)
      )`
    ]

    for (const query of queries) {
      await this.pool.execute(query)
    }
  }

  // ============================================
  // Registro de Uso (Consumo)
  // ============================================

  async recordUsage(tenantId, usageType, quantity, metadata = {}) {
    const billingPeriod = this.getCurrentBillingPeriod()
    const rate = BILLING_MODELS.consumption.rates[usageType] || 0
    const totalCost = quantity * rate

    await this.pool.execute(
      `INSERT INTO usage_records
       (tenant_id, usage_type, quantity, unit_cost, total_cost, metadata, billing_period)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [tenantId, usageType, quantity, rate, totalCost, JSON.stringify(metadata), billingPeriod]
    )

    return { quantity, unitCost: rate, totalCost, billingPeriod }
  }

  async recordExecution(tenantId, executionId, details = {}) {
    return this.recordUsage(tenantId, 'execution', 1, {
      executionId,
      workflowName: details.workflowName,
      duration: details.duration,
      status: details.status
    })
  }

  async recordApiCall(tenantId, endpoint, details = {}) {
    return this.recordUsage(tenantId, 'api_call', 1, {
      endpoint,
      method: details.method,
      responseTime: details.responseTime
    })
  }

  async recordAiTokens(tenantId, tokens, details = {}) {
    return this.recordUsage(tenantId, 'ai_token', tokens, {
      model: details.model,
      promptTokens: details.promptTokens,
      completionTokens: details.completionTokens
    })
  }

  // ============================================
  // Facturación por Proceso
  // ============================================

  async billProcess(tenantId, processId, processName, stepsCount) {
    const billingPeriod = this.getCurrentBillingPeriod()

    // Determinar el tier
    const tier = BILLING_MODELS.process.tiers.find(t => stepsCount <= t.stepsMax)
    const unitPrice = tier ? tier.price : BILLING_MODELS.process.tiers[BILLING_MODELS.process.tiers.length - 1].price

    await this.pool.execute(
      `INSERT INTO billable_processes
       (tenant_id, process_id, process_name, tier, steps_count, unit_price, billing_period)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [tenantId, processId, processName, tier.name, stepsCount, unitPrice, billingPeriod]
    )

    return {
      processId,
      tier: tier.name,
      stepsCount,
      price: unitPrice,
      billingPeriod
    }
  }

  // ============================================
  // Facturación por Implementación
  // ============================================

  async createImplementation(tenantId, packageId, options = {}) {
    const pkg = BILLING_MODELS.implementation.packages.find(p => p.id === packageId)

    if (!pkg) {
      throw new Error(`Package not found: ${packageId}`)
    }

    const startDate = options.startDate || new Date()
    const durationDays = parseInt(pkg.includes.find(i => i.includes('días'))?.replace(/\D/g, '')) || 30
    const estimatedEndDate = new Date(startDate)
    estimatedEndDate.setDate(estimatedEndDate.getDate() + durationDays)

    const [result] = await this.pool.execute(
      `INSERT INTO implementations
       (tenant_id, package_id, package_name, price, start_date, estimated_end_date, notes)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        tenantId,
        packageId,
        pkg.name,
        options.customPrice || pkg.price,
        startDate,
        estimatedEndDate,
        options.notes
      ]
    )

    // Crear factura de implementación
    await this.createInvoice(tenantId, 'implementation', {
      items: [{
        description: pkg.name,
        quantity: 1,
        unitPrice: options.customPrice || pkg.price,
        includes: pkg.includes
      }],
      implementationId: result.insertId
    })

    return {
      id: result.insertId,
      packageId,
      packageName: pkg.name,
      price: options.customPrice || pkg.price,
      startDate,
      estimatedEndDate,
      includes: pkg.includes
    }
  }

  // ============================================
  // Generación de Facturas
  // ============================================

  async createInvoice(tenantId, billingModel, options = {}) {
    const billingPeriod = options.billingPeriod || this.getCurrentBillingPeriod()
    const invoiceNumber = await this.generateInvoiceNumber(tenantId)

    let lineItems = []
    let subtotal = 0

    switch (billingModel) {
      case 'consumption':
        lineItems = await this.getConsumptionLineItems(tenantId, billingPeriod)
        break
      case 'process':
        lineItems = await this.getProcessLineItems(tenantId, billingPeriod)
        break
      case 'implementation':
        lineItems = options.items || []
        break
      case 'hybrid':
        lineItems = await this.getHybridLineItems(tenantId, billingPeriod)
        break
    }

    subtotal = lineItems.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0)

    // Obtener configuración de tax
    const taxRate = options.taxRate || 0.16
    const taxAmount = subtotal * taxRate
    const total = subtotal + taxAmount

    // Calcular fecha de vencimiento
    const dueDate = new Date()
    dueDate.setDate(dueDate.getDate() + (options.paymentTermsDays || 15))

    const [result] = await this.pool.execute(
      `INSERT INTO invoices
       (invoice_number, tenant_id, billing_model, billing_period,
        subtotal, tax_rate, tax_amount, total, currency, due_date, line_items)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        invoiceNumber,
        tenantId,
        billingModel,
        billingPeriod,
        subtotal,
        taxRate,
        taxAmount,
        total,
        options.currency || 'USD',
        dueDate,
        JSON.stringify(lineItems)
      ]
    )

    // Calcular y registrar comisiones
    await this.calculateCommissions(tenantId, result.insertId, total, billingPeriod)

    return {
      id: result.insertId,
      invoiceNumber,
      tenantId,
      billingModel,
      billingPeriod,
      subtotal,
      taxRate,
      taxAmount,
      total,
      dueDate,
      lineItems
    }
  }

  async getConsumptionLineItems(tenantId, billingPeriod) {
    const [rows] = await this.pool.execute(
      `SELECT usage_type, SUM(quantity) as quantity, AVG(unit_cost) as unit_price, SUM(total_cost) as total
       FROM usage_records
       WHERE tenant_id = ? AND billing_period = ?
       GROUP BY usage_type`,
      [tenantId, billingPeriod]
    )

    const typeLabels = {
      execution: 'Ejecuciones de Workflow',
      api_call: 'Llamadas API',
      storage: 'Almacenamiento (GB)',
      ai_token: 'Tokens AI',
      message: 'Mensajes Enviados',
      query: 'Consultas DB'
    }

    return rows.map(row => ({
      description: typeLabels[row.usage_type] || row.usage_type,
      quantity: parseFloat(row.quantity),
      unitPrice: parseFloat(row.unit_price),
      total: parseFloat(row.total)
    }))
  }

  async getProcessLineItems(tenantId, billingPeriod) {
    const [rows] = await this.pool.execute(
      `SELECT tier, COUNT(*) as quantity, unit_price, SUM(unit_price) as total
       FROM billable_processes
       WHERE tenant_id = ? AND billing_period = ? AND status = 'pending'
       GROUP BY tier, unit_price`,
      [tenantId, billingPeriod]
    )

    return rows.map(row => ({
      description: `Procesos ${row.tier}`,
      quantity: row.quantity,
      unitPrice: parseFloat(row.unit_price),
      total: parseFloat(row.total)
    }))
  }

  async getHybridLineItems(tenantId, billingPeriod) {
    // Obtener configuración del tenant
    const [config] = await this.pool.execute(
      `SELECT plan_id, custom_rates FROM tenant_billing_config WHERE tenant_id = ?`,
      [tenantId]
    )

    const plan = BILLING_MODELS.hybrid.plans.find(p => p.id === config[0]?.plan_id) ||
      BILLING_MODELS.hybrid.plans[0]

    const items = [{
      description: `${plan.name} - Mensualidad`,
      quantity: 1,
      unitPrice: plan.basePrice,
      total: plan.basePrice
    }]

    // Calcular excedentes
    const usage = await this.getConsumptionLineItems(tenantId, billingPeriod)

    for (const item of usage) {
      const usageType = item.description.toLowerCase().includes('ejecucion') ? 'executions' :
        item.description.toLowerCase().includes('api') ? 'apiCalls' :
          item.description.toLowerCase().includes('almacenamiento') ? 'storage' : null

      if (usageType && plan.included[usageType]) {
        const overage = Math.max(0, item.quantity - plan.included[usageType])
        if (overage > 0) {
          const overageType = usageType === 'executions' ? 'execution' :
            usageType === 'apiCalls' ? 'apiCall' : 'storage'
          items.push({
            description: `Excedente: ${item.description}`,
            quantity: overage,
            unitPrice: plan.overageRates[overageType],
            total: overage * plan.overageRates[overageType]
          })
        }
      }
    }

    return items
  }

  // ============================================
  // Sistema de Comisiones
  // ============================================

  async calculateCommissions(tenantId, invoiceId, totalAmount, billingPeriod) {
    // Obtener la cadena de referidos/partners
    const chain = await this.getCommissionChain(tenantId)
    let remainingAmount = totalAmount

    for (const link of chain) {
      const structure = COMMISSION_STRUCTURE[link.type]
      if (!structure) continue

      // Calcular comisión sobre el monto restante
      const commissionAmount = remainingAmount * structure.commission

      await this.pool.execute(
        `INSERT INTO commissions
         (beneficiary_id, source_tenant_id, commission_type, base_amount,
          commission_rate, commission_amount, billing_period)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          link.beneficiaryId,
          tenantId,
          link.type,
          remainingAmount,
          structure.commission,
          commissionAmount,
          billingPeriod
        ]
      )

      // Reducir el monto para el siguiente nivel
      remainingAmount -= commissionAmount
    }

    return { invoiceId, totalAmount, commissionsCalculated: chain.length }
  }

  async getCommissionChain(tenantId) {
    const chain = []
    let currentId = tenantId

    // Subir por la jerarquía hasta 4 niveles
    for (let i = 0; i < 4; i++) {
      const [rows] = await this.pool.execute(
        `SELECT parent_id, commission_type FROM tenant_billing_config WHERE tenant_id = ?`,
        [currentId]
      )

      if (!rows[0]?.parent_id) break

      chain.push({
        beneficiaryId: rows[0].parent_id,
        type: rows[0].commission_type || 'partner'
      })

      currentId = rows[0].parent_id
    }

    return chain
  }

  async getCommissionsReport(beneficiaryId, options = {}) {
    const billingPeriod = options.billingPeriod || this.getCurrentBillingPeriod()

    const [rows] = await this.pool.execute(
      `SELECT c.*, t.name as source_tenant_name
       FROM commissions c
       LEFT JOIN tenants t ON c.source_tenant_id = t.id
       WHERE c.beneficiary_id = ?
       AND (? IS NULL OR c.billing_period = ?)
       AND (? IS NULL OR c.status = ?)
       ORDER BY c.created_at DESC`,
      [beneficiaryId, billingPeriod, billingPeriod, options.status, options.status]
    )

    const summary = {
      total: rows.reduce((sum, r) => sum + parseFloat(r.commission_amount), 0),
      byType: {},
      byStatus: {}
    }

    rows.forEach(row => {
      summary.byType[row.commission_type] = (summary.byType[row.commission_type] || 0) + parseFloat(row.commission_amount)
      summary.byStatus[row.status] = (summary.byStatus[row.status] || 0) + parseFloat(row.commission_amount)
    })

    return { commissions: rows, summary }
  }

  // ============================================
  // Reportes y Analytics
  // ============================================

  async getUsageReport(tenantId, options = {}) {
    const billingPeriod = options.billingPeriod || this.getCurrentBillingPeriod()

    const [usage] = await this.pool.execute(
      `SELECT usage_type,
              COUNT(*) as count,
              SUM(quantity) as total_quantity,
              SUM(total_cost) as total_cost,
              DATE(created_at) as date
       FROM usage_records
       WHERE tenant_id = ? AND billing_period = ?
       GROUP BY usage_type, DATE(created_at)
       ORDER BY date`,
      [tenantId, billingPeriod]
    )

    const [processes] = await this.pool.execute(
      `SELECT tier, COUNT(*) as count, SUM(unit_price) as total
       FROM billable_processes
       WHERE tenant_id = ? AND billing_period = ?
       GROUP BY tier`,
      [tenantId, billingPeriod]
    )

    return {
      period: billingPeriod,
      usage,
      processes,
      totals: {
        usageCost: usage.reduce((sum, u) => sum + parseFloat(u.total_cost), 0),
        processCost: processes.reduce((sum, p) => sum + parseFloat(p.total), 0)
      }
    }
  }

  async getRevenueReport(options = {}) {
    const startPeriod = options.startPeriod || this.getBillingPeriod(-11)
    const endPeriod = options.endPeriod || this.getCurrentBillingPeriod()

    const [monthly] = await this.pool.execute(
      `SELECT billing_period,
              billing_model,
              COUNT(*) as invoice_count,
              SUM(subtotal) as revenue,
              SUM(total) as total_with_tax
       FROM invoices
       WHERE billing_period BETWEEN ? AND ?
       AND status IN ('paid', 'pending')
       GROUP BY billing_period, billing_model
       ORDER BY billing_period`,
      [startPeriod, endPeriod]
    )

    const [byModel] = await this.pool.execute(
      `SELECT billing_model,
              COUNT(*) as invoice_count,
              SUM(subtotal) as revenue,
              AVG(subtotal) as avg_invoice
       FROM invoices
       WHERE billing_period BETWEEN ? AND ?
       AND status IN ('paid', 'pending')
       GROUP BY billing_model`,
      [startPeriod, endPeriod]
    )

    return {
      period: { start: startPeriod, end: endPeriod },
      monthly,
      byModel,
      totals: {
        revenue: monthly.reduce((sum, m) => sum + parseFloat(m.revenue), 0),
        invoices: monthly.reduce((sum, m) => sum + m.invoice_count, 0)
      }
    }
  }

  // ============================================
  // Helpers
  // ============================================

  getCurrentBillingPeriod() {
    const now = new Date()
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
  }

  getBillingPeriod(monthsOffset) {
    const date = new Date()
    date.setMonth(date.getMonth() + monthsOffset)
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
  }

  async generateInvoiceNumber(tenantId) {
    const [config] = await this.pool.execute(
      `SELECT invoice_prefix FROM tenant_billing_config WHERE tenant_id = ?`,
      [tenantId]
    )

    const prefix = config[0]?.invoice_prefix || 'INV'
    const year = new Date().getFullYear()
    const [count] = await this.pool.execute(
      `SELECT COUNT(*) as count FROM invoices WHERE tenant_id = ? AND YEAR(created_at) = ?`,
      [tenantId, year]
    )

    return `${prefix}-${year}-${String(count[0].count + 1).padStart(5, '0')}`
  }

  async close() {
    if (this.pool) {
      await this.pool.end()
    }
  }
}

export default UsageBillingManager
