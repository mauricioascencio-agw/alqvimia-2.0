/**
 * ALQVIMIA RPA 2.0 - Billing Manager
 * Sistema de facturación integrado con Stripe y Zoho
 */

import { EventEmitter } from 'events'
import crypto from 'crypto'

class BillingManager extends EventEmitter {
  constructor(config = {}) {
    super()

    this.config = {
      stripeSecretKey: config.stripeSecretKey || process.env.STRIPE_SECRET_KEY,
      stripeWebhookSecret: config.stripeWebhookSecret || process.env.STRIPE_WEBHOOK_SECRET,
      zohoClientId: config.zohoClientId || process.env.ZOHO_CLIENT_ID,
      zohoClientSecret: config.zohoClientSecret || process.env.ZOHO_CLIENT_SECRET,
      zohoRefreshToken: config.zohoRefreshToken || process.env.ZOHO_REFRESH_TOKEN,
      zohoOrgId: config.zohoOrgId || process.env.ZOHO_ORG_ID,
      currency: config.currency || 'USD',
      taxRate: config.taxRate || 0.16, // 16% IVA México
      ...config
    }

    // Stripe instance (lazy loaded)
    this._stripe = null

    // Zoho tokens
    this.zohoAccessToken = null
    this.zohoTokenExpiry = null

    // In-memory storage (use database in production)
    this.customers = new Map()
    this.subscriptions = new Map()
    this.invoices = new Map()
    this.payments = new Map()

    // Precios de Stripe
    this.stripePrices = {
      starter_monthly: { id: 'price_starter_monthly', amount: 4900, currency: 'usd' },
      starter_yearly: { id: 'price_starter_yearly', amount: 47000, currency: 'usd' },
      professional_monthly: { id: 'price_pro_monthly', amount: 14900, currency: 'usd' },
      professional_yearly: { id: 'price_pro_yearly', amount: 143000, currency: 'usd' },
      business_monthly: { id: 'price_business_monthly', amount: 39900, currency: 'usd' },
      business_yearly: { id: 'price_business_yearly', amount: 383000, currency: 'usd' }
    }
  }

  /**
   * Obtener instancia de Stripe (lazy load)
   */
  get stripe() {
    if (!this._stripe && this.config.stripeSecretKey) {
      // Dynamic import would be: const Stripe = (await import('stripe')).default
      // For now, we'll use a mock or assume it's available
      try {
        const Stripe = require('stripe')
        this._stripe = new Stripe(this.config.stripeSecretKey, {
          apiVersion: '2023-10-16'
        })
      } catch (e) {
        console.warn('Stripe SDK not available, using mock')
        this._stripe = this._createStripeMock()
      }
    }
    return this._stripe
  }

  /**
   * Mock de Stripe para desarrollo
   */
  _createStripeMock() {
    return {
      customers: {
        create: async (data) => ({
          id: `cus_${crypto.randomBytes(12).toString('hex')}`,
          ...data,
          created: Date.now()
        }),
        retrieve: async (id) => this.customers.get(id),
        update: async (id, data) => ({ id, ...data }),
        del: async (id) => ({ id, deleted: true })
      },
      subscriptions: {
        create: async (data) => ({
          id: `sub_${crypto.randomBytes(12).toString('hex')}`,
          ...data,
          status: 'active',
          created: Date.now()
        }),
        retrieve: async (id) => this.subscriptions.get(id),
        update: async (id, data) => ({ id, ...data }),
        cancel: async (id) => ({ id, status: 'canceled' })
      },
      checkout: {
        sessions: {
          create: async (data) => ({
            id: `cs_${crypto.randomBytes(12).toString('hex')}`,
            url: `https://checkout.stripe.com/pay/${crypto.randomBytes(8).toString('hex')}`,
            ...data
          })
        }
      },
      billingPortal: {
        sessions: {
          create: async (data) => ({
            id: `bps_${crypto.randomBytes(12).toString('hex')}`,
            url: `https://billing.stripe.com/session/${crypto.randomBytes(8).toString('hex')}`,
            ...data
          })
        }
      },
      invoices: {
        list: async (params) => ({ data: [...this.invoices.values()].slice(0, params.limit || 10) }),
        retrieve: async (id) => this.invoices.get(id)
      },
      paymentIntents: {
        create: async (data) => ({
          id: `pi_${crypto.randomBytes(12).toString('hex')}`,
          client_secret: `pi_secret_${crypto.randomBytes(16).toString('hex')}`,
          status: 'requires_payment_method',
          ...data
        })
      },
      webhooks: {
        constructEvent: (body, sig, secret) => JSON.parse(body)
      }
    }
  }

  // ==================== STRIPE INTEGRATION ====================

  /**
   * Crear cliente en Stripe
   */
  async createStripeCustomer(data) {
    const customer = await this.stripe.customers.create({
      email: data.email,
      name: data.name,
      phone: data.phone,
      metadata: {
        organizationId: data.organizationId,
        taxId: data.taxId
      },
      address: data.address ? {
        line1: data.address.line1,
        line2: data.address.line2,
        city: data.address.city,
        state: data.address.state,
        postal_code: data.address.postalCode,
        country: data.address.country
      } : undefined,
      tax_id_data: data.taxId ? [{
        type: data.country === 'MX' ? 'mx_rfc' : 'eu_vat',
        value: data.taxId
      }] : undefined
    })

    // Store locally
    this.customers.set(customer.id, {
      ...customer,
      organizationId: data.organizationId
    })

    this.emit('customer:created', customer)

    return customer
  }

  /**
   * Crear sesión de checkout
   */
  async createCheckoutSession(data) {
    const { organizationId, plan, interval = 'monthly', successUrl, cancelUrl, customerId } = data

    const priceKey = `${plan}_${interval}`
    const priceId = this.stripePrices[priceKey]?.id

    if (!priceId) {
      throw new Error(`Invalid plan/interval: ${plan}/${interval}`)
    }

    const sessionData = {
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [{
        price: priceId,
        quantity: 1
      }],
      success_url: successUrl || `${process.env.APP_URL}/billing/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: cancelUrl || `${process.env.APP_URL}/billing/cancel`,
      metadata: {
        organizationId,
        plan,
        interval
      },
      subscription_data: {
        metadata: {
          organizationId,
          plan
        }
      },
      allow_promotion_codes: true,
      billing_address_collection: 'required',
      tax_id_collection: {
        enabled: true
      }
    }

    // If existing customer
    if (customerId) {
      sessionData.customer = customerId
    } else {
      sessionData.customer_creation = 'always'
    }

    const session = await this.stripe.checkout.sessions.create(sessionData)

    this.emit('checkout:created', { session, organizationId, plan })

    return session
  }

  /**
   * Crear sesión del portal de facturación
   */
  async createBillingPortalSession(customerId, returnUrl) {
    const session = await this.stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: returnUrl || `${process.env.APP_URL}/settings/billing`
    })

    return session
  }

  /**
   * Crear suscripción directamente
   */
  async createSubscription(data) {
    const { customerId, plan, interval = 'monthly', trialDays = 0 } = data

    const priceKey = `${plan}_${interval}`
    const priceId = this.stripePrices[priceKey]?.id

    const subscriptionData = {
      customer: customerId,
      items: [{ price: priceId }],
      metadata: {
        organizationId: data.organizationId,
        plan
      },
      expand: ['latest_invoice.payment_intent']
    }

    if (trialDays > 0) {
      subscriptionData.trial_period_days = trialDays
    }

    const subscription = await this.stripe.subscriptions.create(subscriptionData)

    this.subscriptions.set(subscription.id, subscription)
    this.emit('subscription:created', subscription)

    return subscription
  }

  /**
   * Cancelar suscripción
   */
  async cancelSubscription(subscriptionId, atPeriodEnd = true) {
    const subscription = await this.stripe.subscriptions.update(subscriptionId, {
      cancel_at_period_end: atPeriodEnd
    })

    this.emit('subscription:cancelled', subscription)

    return subscription
  }

  /**
   * Cambiar plan de suscripción
   */
  async updateSubscription(subscriptionId, newPlan, interval = 'monthly') {
    const subscription = await this.stripe.subscriptions.retrieve(subscriptionId)

    const priceKey = `${newPlan}_${interval}`
    const priceId = this.stripePrices[priceKey]?.id

    const updated = await this.stripe.subscriptions.update(subscriptionId, {
      items: [{
        id: subscription.items.data[0].id,
        price: priceId
      }],
      proration_behavior: 'create_prorations',
      metadata: {
        plan: newPlan
      }
    })

    this.emit('subscription:updated', { subscription: updated, oldPlan: subscription.metadata.plan, newPlan })

    return updated
  }

  /**
   * Procesar webhook de Stripe
   */
  async handleStripeWebhook(body, signature) {
    let event

    try {
      event = this.stripe.webhooks.constructEvent(
        body,
        signature,
        this.config.stripeWebhookSecret
      )
    } catch (err) {
      throw new Error(`Webhook signature verification failed: ${err.message}`)
    }

    const handlers = {
      'checkout.session.completed': this._handleCheckoutCompleted.bind(this),
      'customer.subscription.created': this._handleSubscriptionCreated.bind(this),
      'customer.subscription.updated': this._handleSubscriptionUpdated.bind(this),
      'customer.subscription.deleted': this._handleSubscriptionDeleted.bind(this),
      'invoice.paid': this._handleInvoicePaid.bind(this),
      'invoice.payment_failed': this._handleInvoicePaymentFailed.bind(this),
      'customer.created': this._handleCustomerCreated.bind(this),
      'customer.updated': this._handleCustomerUpdated.bind(this)
    }

    const handler = handlers[event.type]
    if (handler) {
      await handler(event.data.object)
    }

    return { received: true, type: event.type }
  }

  async _handleCheckoutCompleted(session) {
    this.emit('stripe:checkout.completed', session)

    // License will be created by the orchestrator listening to this event
  }

  async _handleSubscriptionCreated(subscription) {
    this.subscriptions.set(subscription.id, subscription)
    this.emit('stripe:subscription.created', subscription)
  }

  async _handleSubscriptionUpdated(subscription) {
    this.subscriptions.set(subscription.id, subscription)
    this.emit('stripe:subscription.updated', subscription)
  }

  async _handleSubscriptionDeleted(subscription) {
    this.emit('stripe:subscription.deleted', subscription)
    // Orchestrator should suspend/cancel the license
  }

  async _handleInvoicePaid(invoice) {
    this.invoices.set(invoice.id, invoice)
    this.emit('stripe:invoice.paid', invoice)
    // Orchestrator should renew the license
  }

  async _handleInvoicePaymentFailed(invoice) {
    this.emit('stripe:invoice.payment_failed', invoice)
    // Orchestrator should send notification, maybe suspend
  }

  async _handleCustomerCreated(customer) {
    this.customers.set(customer.id, customer)
    this.emit('stripe:customer.created', customer)
  }

  async _handleCustomerUpdated(customer) {
    this.customers.set(customer.id, customer)
    this.emit('stripe:customer.updated', customer)
  }

  // ==================== ZOHO INTEGRATION ====================

  /**
   * Obtener token de acceso de Zoho
   */
  async getZohoAccessToken() {
    if (this.zohoAccessToken && this.zohoTokenExpiry > Date.now()) {
      return this.zohoAccessToken
    }

    const response = await fetch('https://accounts.zoho.com/oauth/v2/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: new URLSearchParams({
        refresh_token: this.config.zohoRefreshToken,
        client_id: this.config.zohoClientId,
        client_secret: this.config.zohoClientSecret,
        grant_type: 'refresh_token'
      })
    })

    const data = await response.json()

    if (data.error) {
      throw new Error(`Zoho auth error: ${data.error}`)
    }

    this.zohoAccessToken = data.access_token
    this.zohoTokenExpiry = Date.now() + (data.expires_in * 1000) - 60000 // 1 min buffer

    return this.zohoAccessToken
  }

  /**
   * Llamada a API de Zoho
   */
  async zohoRequest(method, endpoint, data = null, module = 'books') {
    const token = await this.getZohoAccessToken()

    const baseUrls = {
      books: 'https://books.zoho.com/api/v3',
      subscriptions: 'https://subscriptions.zoho.com/api/v1',
      crm: 'https://www.zohoapis.com/crm/v3'
    }

    const url = new URL(`${baseUrls[module]}${endpoint}`)

    if (module === 'books') {
      url.searchParams.set('organization_id', this.config.zohoOrgId)
    }

    const options = {
      method,
      headers: {
        'Authorization': `Zoho-oauthtoken ${token}`,
        'Content-Type': 'application/json'
      }
    }

    if (data && ['POST', 'PUT', 'PATCH'].includes(method)) {
      options.body = JSON.stringify(data)
    }

    const response = await fetch(url.toString(), options)
    const result = await response.json()

    if (result.code && result.code !== 0) {
      throw new Error(`Zoho API error: ${result.message}`)
    }

    return result
  }

  /**
   * Crear contacto en Zoho Books
   */
  async createZohoContact(data) {
    const contact = await this.zohoRequest('POST', '/contacts', {
      contact_name: data.name,
      company_name: data.companyName,
      email: data.email,
      phone: data.phone,
      billing_address: data.address ? {
        address: data.address.line1,
        street2: data.address.line2,
        city: data.address.city,
        state: data.address.state,
        zip: data.address.postalCode,
        country: data.address.country
      } : undefined,
      contact_persons: [{
        first_name: data.firstName,
        last_name: data.lastName,
        email: data.email,
        phone: data.phone,
        is_primary_contact: true
      }],
      custom_fields: [
        { label: 'Organization ID', value: data.organizationId },
        { label: 'Stripe Customer ID', value: data.stripeCustomerId }
      ],
      tax_id: data.taxId,
      tax_name: data.country === 'MX' ? 'IVA' : 'VAT',
      tax_percentage: this.config.taxRate * 100
    })

    this.emit('zoho:contact.created', contact)

    return contact.contact
  }

  /**
   * Crear factura en Zoho Books
   */
  async createZohoInvoice(data) {
    const { contactId, items, stripeInvoiceId, metadata = {} } = data

    const lineItems = items.map(item => ({
      name: item.name,
      description: item.description,
      rate: item.amount,
      quantity: item.quantity || 1,
      tax_name: 'IVA',
      tax_type: 'tax',
      tax_percentage: this.config.taxRate * 100
    }))

    const invoice = await this.zohoRequest('POST', '/invoices', {
      customer_id: contactId,
      date: new Date().toISOString().split('T')[0],
      line_items: lineItems,
      reference_number: stripeInvoiceId,
      notes: metadata.notes || 'Gracias por su preferencia',
      terms: 'Pago procesado automáticamente',
      custom_fields: [
        { label: 'Stripe Invoice ID', value: stripeInvoiceId },
        { label: 'Plan', value: metadata.plan }
      ]
    })

    this.emit('zoho:invoice.created', invoice)

    return invoice.invoice
  }

  /**
   * Crear factura CFDI para México
   */
  async createCFDI(data) {
    const { contactId, items, stripeInvoiceId, cfdiData } = data

    // Datos fiscales México
    const cfdi = {
      ...cfdiData,
      uso_cfdi: cfdiData.usoCfdi || 'G03', // Gastos en general
      forma_pago: cfdiData.formaPago || '04', // Tarjeta de crédito
      metodo_pago: cfdiData.metodoPago || 'PUE', // Pago en una sola exhibición
      tipo_comprobante: 'I', // Ingreso
      moneda: 'USD',
      tipo_cambio: cfdiData.tipoCambio || 1
    }

    // Create invoice with CFDI data
    const invoice = await this.zohoRequest('POST', '/invoices', {
      customer_id: contactId,
      date: new Date().toISOString().split('T')[0],
      line_items: items.map(item => ({
        name: item.name,
        description: item.description,
        rate: item.amount,
        quantity: item.quantity || 1,
        tax_name: 'IVA',
        tax_type: 'tax',
        tax_percentage: 16,
        // SAT codes
        product_code: item.satProductCode || '81112101', // Servicios de software
        unit_code: item.satUnitCode || 'E48' // Unidad de servicio
      })),
      reference_number: stripeInvoiceId,
      is_inclusive_tax: false,
      custom_fields: [
        { label: 'RFC', value: cfdi.rfc },
        { label: 'Uso CFDI', value: cfdi.uso_cfdi },
        { label: 'Forma de Pago', value: cfdi.forma_pago },
        { label: 'Método de Pago', value: cfdi.metodo_pago }
      ]
    })

    // Stamp the invoice (timbrar)
    // In production, this would call a PAC (Proveedor Autorizado de Certificación)
    const stamped = await this._stampCFDI(invoice.invoice)

    this.emit('cfdi:created', stamped)

    return stamped
  }

  async _stampCFDI(invoice) {
    // In production, integrate with a PAC like:
    // - Finkok
    // - Facturama
    // - SW Sapien
    // For now, return mock data

    return {
      ...invoice,
      cfdi: {
        uuid: crypto.randomUUID(),
        fechaTimbrado: new Date().toISOString(),
        selloSAT: 'MOCK_SELLO_SAT',
        selloCFD: 'MOCK_SELLO_CFD',
        noCertificadoSAT: '00001000000504465028',
        noCertificadoCFD: '00001000000504123456',
        cadenaOriginal: '||1.1|...|',
        qrCode: 'https://verificacfdi.facturaelectronica.sat.gob.mx/...'
      }
    }
  }

  /**
   * Sincronizar cliente de Stripe a Zoho
   */
  async syncStripeToZoho(stripeCustomer, organizationId) {
    // Check if already synced
    const existingContact = await this.zohoRequest('GET', `/contacts?email=${stripeCustomer.email}`)

    if (existingContact.contacts && existingContact.contacts.length > 0) {
      // Update existing
      const contact = existingContact.contacts[0]
      await this.zohoRequest('PUT', `/contacts/${contact.contact_id}`, {
        custom_fields: [
          { label: 'Organization ID', value: organizationId },
          { label: 'Stripe Customer ID', value: stripeCustomer.id }
        ]
      })
      return contact
    }

    // Create new
    return this.createZohoContact({
      name: stripeCustomer.name,
      email: stripeCustomer.email,
      phone: stripeCustomer.phone,
      address: stripeCustomer.address,
      organizationId,
      stripeCustomerId: stripeCustomer.id
    })
  }

  /**
   * Sincronizar factura de Stripe a Zoho
   */
  async syncStripeInvoiceToZoho(stripeInvoice, zohoContactId) {
    const items = stripeInvoice.lines.data.map(line => ({
      name: line.description || 'Suscripción Alqvimia',
      description: line.price?.nickname || line.description,
      amount: line.amount / 100,
      quantity: line.quantity || 1
    }))

    return this.createZohoInvoice({
      contactId: zohoContactId,
      items,
      stripeInvoiceId: stripeInvoice.id,
      metadata: {
        plan: stripeInvoice.subscription_details?.metadata?.plan
      }
    })
  }

  // ==================== USAGE BILLING ====================

  /**
   * Calcular factura de uso adicional
   */
  calculateUsageBilling(usage, limits) {
    const items = []

    // Ejecuciones extra
    if (usage.executions > limits.executionsPerMonth) {
      const extra = usage.executions - limits.executionsPerMonth
      items.push({
        type: 'usage',
        name: 'Ejecuciones adicionales',
        description: `${extra} ejecuciones extra`,
        quantity: extra,
        unitPrice: 0.01,
        amount: extra * 0.01
      })
    }

    // AI API calls
    if (usage.aiCalls > 0) {
      items.push({
        type: 'usage',
        name: 'Llamadas AI API',
        description: `${usage.aiCalls} llamadas a APIs de IA`,
        quantity: usage.aiCalls,
        unitPrice: 0.05,
        amount: usage.aiCalls * 0.05
      })
    }

    // Storage extra
    const storageGb = usage.storageBytes / (1024 * 1024 * 1024)
    if (storageGb > limits.storageGb) {
      const extraGb = storageGb - limits.storageGb
      items.push({
        type: 'usage',
        name: 'Almacenamiento adicional',
        description: `${extraGb.toFixed(2)} GB extra`,
        quantity: Math.ceil(extraGb),
        unitPrice: 0.10,
        amount: Math.ceil(extraGb) * 0.10
      })
    }

    const subtotal = items.reduce((sum, item) => sum + item.amount, 0)
    const tax = subtotal * this.config.taxRate
    const total = subtotal + tax

    return {
      items,
      subtotal,
      tax,
      taxRate: this.config.taxRate,
      total,
      currency: this.config.currency
    }
  }

  /**
   * Crear invoice item en Stripe para uso adicional
   */
  async createUsageInvoice(customerId, usage, limits) {
    const billing = this.calculateUsageBilling(usage, limits)

    if (billing.items.length === 0) {
      return null
    }

    // Add invoice items to customer's next invoice
    for (const item of billing.items) {
      await this.stripe.invoiceItems.create({
        customer: customerId,
        amount: Math.round(item.amount * 100),
        currency: 'usd',
        description: item.description
      })
    }

    return billing
  }

  // ==================== REPORTING ====================

  /**
   * Obtener MRR (Monthly Recurring Revenue)
   */
  async getMRR() {
    const activeSubscriptions = [...this.subscriptions.values()]
      .filter(s => s.status === 'active')

    let mrr = 0

    for (const sub of activeSubscriptions) {
      const amount = sub.items?.data?.[0]?.price?.unit_amount || 0
      const interval = sub.items?.data?.[0]?.price?.recurring?.interval

      if (interval === 'month') {
        mrr += amount / 100
      } else if (interval === 'year') {
        mrr += (amount / 100) / 12
      }
    }

    return mrr
  }

  /**
   * Obtener ARR (Annual Recurring Revenue)
   */
  async getARR() {
    const mrr = await this.getMRR()
    return mrr * 12
  }

  /**
   * Obtener estadísticas de facturación
   */
  async getBillingStats() {
    const subscriptions = [...this.subscriptions.values()]
    const invoices = [...this.invoices.values()]

    return {
      mrr: await this.getMRR(),
      arr: await this.getARR(),
      totalCustomers: this.customers.size,
      activeSubscriptions: subscriptions.filter(s => s.status === 'active').length,
      totalInvoices: invoices.length,
      totalRevenue: invoices
        .filter(i => i.status === 'paid')
        .reduce((sum, i) => sum + (i.amount_paid || 0) / 100, 0),
      byPlan: this._groupByPlan(subscriptions),
      churnRate: this._calculateChurnRate(subscriptions)
    }
  }

  _groupByPlan(subscriptions) {
    const byPlan = {}

    for (const sub of subscriptions) {
      const plan = sub.metadata?.plan || 'unknown'
      if (!byPlan[plan]) {
        byPlan[plan] = { count: 0, mrr: 0 }
      }
      byPlan[plan].count++

      if (sub.status === 'active') {
        const amount = sub.items?.data?.[0]?.price?.unit_amount || 0
        byPlan[plan].mrr += amount / 100
      }
    }

    return byPlan
  }

  _calculateChurnRate(subscriptions) {
    const lastMonth = new Date()
    lastMonth.setMonth(lastMonth.getMonth() - 1)

    const startOfLastMonth = subscriptions.filter(s =>
      new Date(s.created * 1000) < lastMonth && s.status === 'active'
    ).length

    const churned = subscriptions.filter(s =>
      s.status === 'canceled' &&
      new Date(s.canceled_at * 1000) >= lastMonth
    ).length

    return startOfLastMonth > 0 ? (churned / startOfLastMonth) * 100 : 0
  }
}

export default BillingManager
