/**
 * ALQVIMIA RPA 2.0 - Stripe Payment Agent
 * Agente autónomo para integración con Stripe Payments
 */

import BaseAgent from '../core/BaseAgent.js'
import Stripe from 'stripe'

class StripeAgent extends BaseAgent {
  constructor(config = {}) {
    super({
      id: config.id || 'agent-stripe',
      name: 'Stripe Payment Agent',
      version: '2.0.0',
      port: config.port || 4501,
      category: 'payments',
      ...config
    })

    this.stripeConfig = {
      secretKey: config.secretKey || process.env.STRIPE_SECRET_KEY,
      webhookSecret: config.webhookSecret || process.env.STRIPE_WEBHOOK_SECRET,
      apiVersion: config.apiVersion || '2023-10-16'
    }

    this.stripe = this.stripeConfig.secretKey
      ? new Stripe(this.stripeConfig.secretKey, { apiVersion: this.stripeConfig.apiVersion })
      : null

    this.setupStripeRoutes()
  }

  getCapabilities() {
    return ['charges', 'customers', 'subscriptions', 'invoices', 'products', 'prices', 'checkout', 'refunds', 'webhooks']
  }

  getConfig() {
    return {
      ...super.getConfig(),
      stripe: {
        configured: !!this.stripeConfig.secretKey,
        apiVersion: this.stripeConfig.apiVersion,
        webhookConfigured: !!this.stripeConfig.webhookSecret
      }
    }
  }

  setupStripeRoutes() {
    // Customers
    this.app.get('/customers', async (req, res) => {
      try {
        const { limit = 10, starting_after } = req.query
        const customers = await this.listCustomers({ limit: parseInt(limit), starting_after })
        res.json({ success: true, data: customers })
      } catch (error) {
        res.status(400).json({ success: false, error: error.message })
      }
    })

    this.app.get('/customers/:id', async (req, res) => {
      try {
        const customer = await this.getCustomer(req.params.id)
        res.json({ success: true, data: customer })
      } catch (error) {
        res.status(400).json({ success: false, error: error.message })
      }
    })

    this.app.post('/customers', async (req, res) => {
      try {
        const customer = await this.createCustomer(req.body)
        res.json({ success: true, data: customer })
      } catch (error) {
        res.status(400).json({ success: false, error: error.message })
      }
    })

    this.app.put('/customers/:id', async (req, res) => {
      try {
        const customer = await this.updateCustomer(req.params.id, req.body)
        res.json({ success: true, data: customer })
      } catch (error) {
        res.status(400).json({ success: false, error: error.message })
      }
    })

    // Charges
    this.app.post('/charges', async (req, res) => {
      try {
        const charge = await this.createCharge(req.body)
        res.json({ success: true, data: charge })
      } catch (error) {
        res.status(400).json({ success: false, error: error.message })
      }
    })

    this.app.get('/charges/:id', async (req, res) => {
      try {
        const charge = await this.getCharge(req.params.id)
        res.json({ success: true, data: charge })
      } catch (error) {
        res.status(400).json({ success: false, error: error.message })
      }
    })

    // Payment Intents
    this.app.post('/payment-intents', async (req, res) => {
      try {
        const intent = await this.createPaymentIntent(req.body)
        res.json({ success: true, data: intent })
      } catch (error) {
        res.status(400).json({ success: false, error: error.message })
      }
    })

    this.app.post('/payment-intents/:id/confirm', async (req, res) => {
      try {
        const intent = await this.confirmPaymentIntent(req.params.id, req.body)
        res.json({ success: true, data: intent })
      } catch (error) {
        res.status(400).json({ success: false, error: error.message })
      }
    })

    // Subscriptions
    this.app.get('/subscriptions', async (req, res) => {
      try {
        const { customer, limit = 10 } = req.query
        const subscriptions = await this.listSubscriptions({ customer, limit: parseInt(limit) })
        res.json({ success: true, data: subscriptions })
      } catch (error) {
        res.status(400).json({ success: false, error: error.message })
      }
    })

    this.app.post('/subscriptions', async (req, res) => {
      try {
        const subscription = await this.createSubscription(req.body)
        res.json({ success: true, data: subscription })
      } catch (error) {
        res.status(400).json({ success: false, error: error.message })
      }
    })

    this.app.delete('/subscriptions/:id', async (req, res) => {
      try {
        const subscription = await this.cancelSubscription(req.params.id)
        res.json({ success: true, data: subscription })
      } catch (error) {
        res.status(400).json({ success: false, error: error.message })
      }
    })

    // Products
    this.app.get('/products', async (req, res) => {
      try {
        const { limit = 10, active } = req.query
        const products = await this.listProducts({ limit: parseInt(limit), active: active === 'true' })
        res.json({ success: true, data: products })
      } catch (error) {
        res.status(400).json({ success: false, error: error.message })
      }
    })

    this.app.post('/products', async (req, res) => {
      try {
        const product = await this.createProduct(req.body)
        res.json({ success: true, data: product })
      } catch (error) {
        res.status(400).json({ success: false, error: error.message })
      }
    })

    // Prices
    this.app.get('/prices', async (req, res) => {
      try {
        const { product, limit = 10 } = req.query
        const prices = await this.listPrices({ product, limit: parseInt(limit) })
        res.json({ success: true, data: prices })
      } catch (error) {
        res.status(400).json({ success: false, error: error.message })
      }
    })

    this.app.post('/prices', async (req, res) => {
      try {
        const price = await this.createPrice(req.body)
        res.json({ success: true, data: price })
      } catch (error) {
        res.status(400).json({ success: false, error: error.message })
      }
    })

    // Invoices
    this.app.get('/invoices', async (req, res) => {
      try {
        const { customer, limit = 10 } = req.query
        const invoices = await this.listInvoices({ customer, limit: parseInt(limit) })
        res.json({ success: true, data: invoices })
      } catch (error) {
        res.status(400).json({ success: false, error: error.message })
      }
    })

    this.app.post('/invoices', async (req, res) => {
      try {
        const invoice = await this.createInvoice(req.body)
        res.json({ success: true, data: invoice })
      } catch (error) {
        res.status(400).json({ success: false, error: error.message })
      }
    })

    this.app.post('/invoices/:id/pay', async (req, res) => {
      try {
        const invoice = await this.payInvoice(req.params.id)
        res.json({ success: true, data: invoice })
      } catch (error) {
        res.status(400).json({ success: false, error: error.message })
      }
    })

    // Checkout Sessions
    this.app.post('/checkout/sessions', async (req, res) => {
      try {
        const session = await this.createCheckoutSession(req.body)
        res.json({ success: true, data: session })
      } catch (error) {
        res.status(400).json({ success: false, error: error.message })
      }
    })

    // Refunds
    this.app.post('/refunds', async (req, res) => {
      try {
        const refund = await this.createRefund(req.body)
        res.json({ success: true, data: refund })
      } catch (error) {
        res.status(400).json({ success: false, error: error.message })
      }
    })

    // Balance
    this.app.get('/balance', async (req, res) => {
      try {
        const balance = await this.getBalance()
        res.json({ success: true, data: balance })
      } catch (error) {
        res.status(400).json({ success: false, error: error.message })
      }
    })

    // Webhook handler
    this.app.post('/webhook', async (req, res) => {
      try {
        const sig = req.headers['stripe-signature']
        let event

        if (this.stripeConfig.webhookSecret && sig) {
          event = this.stripe.webhooks.constructEvent(
            req.rawBody || req.body,
            sig,
            this.stripeConfig.webhookSecret
          )
        } else {
          event = req.body
        }

        await this.handleWebhook(event)
        res.json({ received: true })
      } catch (error) {
        res.status(400).json({ success: false, error: error.message })
      }
    })

    // Test connection
    this.app.post('/test-connection', async (req, res) => {
      try {
        await this.testConnection(req.body)
        res.json({ success: true, message: 'Connection successful' })
      } catch (error) {
        res.status(400).json({ success: false, error: error.message })
      }
    })
  }

  async onStart() {
    if (!this.stripeConfig.secretKey) {
      this.log('warn', 'Stripe secret key not configured')
      return
    }

    try {
      const balance = await this.stripe.balance.retrieve()
      this.log('info', `Stripe connected. Available balance: ${balance.available.map(b => `${b.amount/100} ${b.currency}`).join(', ')}`)
    } catch (error) {
      this.log('error', `Failed to connect to Stripe: ${error.message}`)
    }
  }

  async testConnection(config) {
    const stripe = new Stripe(config.secretKey, { apiVersion: this.stripeConfig.apiVersion })
    await stripe.balance.retrieve()
  }

  // Customer methods
  async listCustomers({ limit = 10, starting_after }) {
    const params = { limit }
    if (starting_after) params.starting_after = starting_after
    const result = await this.stripe.customers.list(params)
    return result.data
  }

  async getCustomer(id) {
    return await this.stripe.customers.retrieve(id)
  }

  async createCustomer({ email, name, phone, metadata, address }) {
    return await this.stripe.customers.create({
      email,
      name,
      phone,
      metadata,
      address
    })
  }

  async updateCustomer(id, data) {
    return await this.stripe.customers.update(id, data)
  }

  // Charge methods
  async createCharge({ amount, currency = 'usd', source, customer, description, metadata }) {
    return await this.stripe.charges.create({
      amount,
      currency,
      source,
      customer,
      description,
      metadata
    })
  }

  async getCharge(id) {
    return await this.stripe.charges.retrieve(id)
  }

  // Payment Intent methods
  async createPaymentIntent({ amount, currency = 'usd', customer, payment_method_types = ['card'], metadata }) {
    return await this.stripe.paymentIntents.create({
      amount,
      currency,
      customer,
      payment_method_types,
      metadata
    })
  }

  async confirmPaymentIntent(id, { payment_method }) {
    return await this.stripe.paymentIntents.confirm(id, { payment_method })
  }

  // Subscription methods
  async listSubscriptions({ customer, limit = 10 }) {
    const params = { limit }
    if (customer) params.customer = customer
    const result = await this.stripe.subscriptions.list(params)
    return result.data
  }

  async createSubscription({ customer, items, trial_period_days, metadata }) {
    return await this.stripe.subscriptions.create({
      customer,
      items,
      trial_period_days,
      metadata
    })
  }

  async cancelSubscription(id) {
    return await this.stripe.subscriptions.cancel(id)
  }

  // Product methods
  async listProducts({ limit = 10, active }) {
    const params = { limit }
    if (active !== undefined) params.active = active
    const result = await this.stripe.products.list(params)
    return result.data
  }

  async createProduct({ name, description, images, metadata }) {
    return await this.stripe.products.create({
      name,
      description,
      images,
      metadata
    })
  }

  // Price methods
  async listPrices({ product, limit = 10 }) {
    const params = { limit }
    if (product) params.product = product
    const result = await this.stripe.prices.list(params)
    return result.data
  }

  async createPrice({ product, unit_amount, currency = 'usd', recurring, metadata }) {
    return await this.stripe.prices.create({
      product,
      unit_amount,
      currency,
      recurring,
      metadata
    })
  }

  // Invoice methods
  async listInvoices({ customer, limit = 10 }) {
    const params = { limit }
    if (customer) params.customer = customer
    const result = await this.stripe.invoices.list(params)
    return result.data
  }

  async createInvoice({ customer, auto_advance = true, collection_method = 'charge_automatically' }) {
    return await this.stripe.invoices.create({
      customer,
      auto_advance,
      collection_method
    })
  }

  async payInvoice(id) {
    return await this.stripe.invoices.pay(id)
  }

  // Checkout methods
  async createCheckoutSession({ line_items, mode = 'payment', success_url, cancel_url, customer, metadata }) {
    return await this.stripe.checkout.sessions.create({
      line_items,
      mode,
      success_url,
      cancel_url,
      customer,
      metadata
    })
  }

  // Refund methods
  async createRefund({ charge, payment_intent, amount, reason }) {
    const params = {}
    if (charge) params.charge = charge
    if (payment_intent) params.payment_intent = payment_intent
    if (amount) params.amount = amount
    if (reason) params.reason = reason
    return await this.stripe.refunds.create(params)
  }

  // Balance
  async getBalance() {
    return await this.stripe.balance.retrieve()
  }

  // Webhook handler
  async handleWebhook(event) {
    this.log('info', `Webhook received: ${event.type}`)

    // Emit to connected clients
    this.io.emit('stripe-event', event)

    switch (event.type) {
      case 'payment_intent.succeeded':
        this.log('info', `Payment succeeded: ${event.data.object.id}`)
        break
      case 'payment_intent.payment_failed':
        this.log('warn', `Payment failed: ${event.data.object.id}`)
        break
      case 'customer.subscription.created':
        this.log('info', `Subscription created: ${event.data.object.id}`)
        break
      case 'customer.subscription.deleted':
        this.log('info', `Subscription cancelled: ${event.data.object.id}`)
        break
      case 'invoice.paid':
        this.log('info', `Invoice paid: ${event.data.object.id}`)
        break
      case 'invoice.payment_failed':
        this.log('warn', `Invoice payment failed: ${event.data.object.id}`)
        break
    }

    return event
  }

  async execute(action, params) {
    switch (action) {
      case 'list-customers': return await this.listCustomers(params)
      case 'get-customer': return await this.getCustomer(params.id)
      case 'create-customer': return await this.createCustomer(params)
      case 'update-customer': return await this.updateCustomer(params.id, params.data)
      case 'create-charge': return await this.createCharge(params)
      case 'get-charge': return await this.getCharge(params.id)
      case 'create-payment-intent': return await this.createPaymentIntent(params)
      case 'confirm-payment-intent': return await this.confirmPaymentIntent(params.id, params)
      case 'list-subscriptions': return await this.listSubscriptions(params)
      case 'create-subscription': return await this.createSubscription(params)
      case 'cancel-subscription': return await this.cancelSubscription(params.id)
      case 'list-products': return await this.listProducts(params)
      case 'create-product': return await this.createProduct(params)
      case 'list-prices': return await this.listPrices(params)
      case 'create-price': return await this.createPrice(params)
      case 'list-invoices': return await this.listInvoices(params)
      case 'create-invoice': return await this.createInvoice(params)
      case 'pay-invoice': return await this.payInvoice(params.id)
      case 'create-checkout': return await this.createCheckoutSession(params)
      case 'create-refund': return await this.createRefund(params)
      case 'get-balance': return await this.getBalance()
      default: throw new Error(`Unknown action: ${action}`)
    }
  }

  onSocketConnection(socket) {
    socket.on('create-payment-intent', async (data, callback) => {
      try {
        const result = await this.createPaymentIntent(data)
        callback({ success: true, data: result })
      } catch (error) {
        callback({ success: false, error: error.message })
      }
    })

    socket.on('get-balance', async (callback) => {
      try {
        const result = await this.getBalance()
        callback({ success: true, data: result })
      } catch (error) {
        callback({ success: false, error: error.message })
      }
    })
  }
}

export default StripeAgent

const isMainModule = process.argv[1]?.includes('StripeAgent')
if (isMainModule) {
  const agent = new StripeAgent({
    secretKey: process.env.STRIPE_SECRET_KEY,
    webhookSecret: process.env.STRIPE_WEBHOOK_SECRET
  })

  agent.start().catch(console.error)

  process.on('SIGINT', async () => {
    console.log('\nShutting down...')
    await agent.stop()
    process.exit(0)
  })
}
