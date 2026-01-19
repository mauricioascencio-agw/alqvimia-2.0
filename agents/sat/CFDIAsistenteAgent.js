/**
 * ALQVIMIA RPA 2.0 - Agente Asistente CFDI 4.0 y Complemento de Pagos
 * Bot 2: Validación y recordatorios para cumplimiento de facturación
 *
 * Tecnologías: IA + APA + RPA
 * Problema que resuelve: Incumplimiento en emisión de complementos de pago (día 10 del mes)
 */

import BaseAgent from '../core/BaseAgent.js'
import axios from 'axios'

class CFDIAsistenteAgent extends BaseAgent {
  constructor(config = {}) {
    super({
      id: config.id || 'agent-cfdi-asistente',
      name: 'Asistente CFDI 4.0 y Complemento de Pagos',
      version: '1.0.0',
      port: config.port || 4351,
      category: 'fiscal-sat',
      ...config
    })

    // Configuración del agente
    this.cfdiConfig = {
      pacUrl: config.pacUrl || process.env.PAC_API_URL,
      pacUser: config.pacUser || process.env.PAC_USER,
      pacPassword: config.pacPassword || process.env.PAC_PASSWORD,
      reminderDaysBefore: config.reminderDaysBefore || 5
    }

    // Base de conocimiento de errores CFDI 4.0
    this.errorDatabase = this.initializeErrorDatabase()

    // Facturas pendientes de complemento
    this.pendingInvoices = new Map()

    // Recordatorios programados
    this.scheduledReminders = []

    // Historial de validaciones
    this.validationHistory = []

    // Configurar rutas
    this.setupCFDIRoutes()
  }

  /**
   * Obtener capacidades del agente
   */
  getCapabilities() {
    return [
      'recordatorios-automaticos',
      'validacion-pretimbrado',
      'identificacion-pendientes',
      'reportes-facturas-credito',
      'alertas-cancelacion',
      'faq-inteligente',
      'integracion-pac',
      'validacion-rfc',
      'validacion-regimen',
      'validacion-codigo-postal'
    ]
  }

  /**
   * Inicializar base de datos de errores comunes CFDI 4.0
   */
  initializeErrorDatabase() {
    return {
      // Errores de estructura
      'CFDI40100': {
        code: 'CFDI40100',
        message: 'El RFC del receptor no es válido',
        solution: 'Verificar que el RFC tenga 12 caracteres (persona moral) o 13 (persona física) y sea alfanumérico.',
        category: 'receptor'
      },
      'CFDI40101': {
        code: 'CFDI40101',
        message: 'El régimen fiscal del receptor no corresponde con el RFC',
        solution: 'Validar el régimen fiscal del cliente en el portal del SAT antes de emitir.',
        category: 'receptor'
      },
      'CFDI40102': {
        code: 'CFDI40102',
        message: 'El código postal del receptor no coincide con su domicilio fiscal',
        solution: 'Solicitar al cliente su Constancia de Situación Fiscal actualizada.',
        category: 'receptor'
      },
      'CFDI40103': {
        code: 'CFDI40103',
        message: 'El uso de CFDI no corresponde con el régimen fiscal',
        solution: 'Verificar la tabla de usos de CFDI permitidos por régimen.',
        category: 'uso_cfdi'
      },
      'CFDI40200': {
        code: 'CFDI40200',
        message: 'El complemento de pago debe emitirse antes del día 10 del mes siguiente',
        solution: 'Emitir el complemento de pago inmediatamente.',
        category: 'complemento_pago'
      },
      'CFDI40201': {
        code: 'CFDI40201',
        message: 'La forma de pago no corresponde con el método de pago PPD',
        solution: 'Para facturas a crédito (PPD), la forma de pago debe ser 99.',
        category: 'forma_pago'
      },
      'CFDI40300': {
        code: 'CFDI40300',
        message: 'Factura cancelada fuera del plazo permitido',
        solution: 'Las facturas del mes solo pueden cancelarse hasta el último día del mes siguiente.',
        category: 'cancelacion'
      }
    }
  }

  /**
   * Configurar rutas HTTP del agente
   */
  setupCFDIRoutes() {
    // Validar datos fiscales antes de timbrar
    this.app.post('/validate/pretimbrado', async (req, res) => {
      try {
        const result = await this.validatePretimbrado(req.body)
        res.json({ success: true, data: result })
      } catch (error) {
        res.status(400).json({ success: false, error: error.message })
      }
    })

    // Validar RFC
    this.app.post('/validate/rfc', async (req, res) => {
      try {
        const { rfc } = req.body
        const result = await this.validateRFC(rfc)
        res.json({ success: true, data: result })
      } catch (error) {
        res.status(400).json({ success: false, error: error.message })
      }
    })

    // Identificar facturas pendientes de complemento
    this.app.get('/invoices/pending-complement', async (req, res) => {
      try {
        const pending = await this.getPendingComplements()
        res.json({ success: true, data: pending })
      } catch (error) {
        res.status(400).json({ success: false, error: error.message })
      }
    })

    // Registrar factura a crédito para seguimiento
    this.app.post('/invoices/register-credit', async (req, res) => {
      try {
        const result = await this.registerCreditInvoice(req.body)
        res.json({ success: true, data: result })
      } catch (error) {
        res.status(400).json({ success: false, error: error.message })
      }
    })

    // Registrar pago recibido
    this.app.post('/invoices/register-payment', async (req, res) => {
      try {
        const result = await this.registerPayment(req.body)
        res.json({ success: true, data: result })
      } catch (error) {
        res.status(400).json({ success: false, error: error.message })
      }
    })

    // Generar reporte de facturas a crédito
    this.app.get('/reports/credit-invoices', async (req, res) => {
      try {
        const report = await this.generateCreditInvoicesReport(req.query)
        res.json({ success: true, data: report })
      } catch (error) {
        res.status(400).json({ success: false, error: error.message })
      }
    })

    // Verificar alertas de cancelación fuera de plazo
    this.app.get('/alerts/cancellation', (req, res) => {
      const alerts = this.getCancellationAlerts()
      res.json({ success: true, data: alerts })
    })

    // FAQ inteligente - consultar errores
    this.app.post('/faq/query', async (req, res) => {
      try {
        const { query, errorCode } = req.body
        const result = await this.queryFAQ(query, errorCode)
        res.json({ success: true, data: result })
      } catch (error) {
        res.status(400).json({ success: false, error: error.message })
      }
    })

    // Obtener todos los errores conocidos
    this.app.get('/faq/errors', (req, res) => {
      res.json({ success: true, data: Object.values(this.errorDatabase) })
    })

    // Configurar recordatorios
    this.app.put('/reminders/config', (req, res) => {
      try {
        this.updateReminderConfig(req.body)
        res.json({ success: true, message: 'Configuración actualizada' })
      } catch (error) {
        res.status(400).json({ success: false, error: error.message })
      }
    })

    // Obtener próximos recordatorios
    this.app.get('/reminders/upcoming', (req, res) => {
      const reminders = this.getUpcomingReminders()
      res.json({ success: true, data: reminders })
    })

    // Dashboard de compliance CFDI
    this.app.get('/dashboard', (req, res) => {
      const dashboard = this.generateDashboard()
      res.json({ success: true, data: dashboard })
    })

    // Historial de validaciones
    this.app.get('/validations/history', (req, res) => {
      const { limit = 100 } = req.query
      res.json({ success: true, data: this.validationHistory.slice(-parseInt(limit)) })
    })
  }

  /**
   * Validar datos fiscales antes de timbrar
   */
  async validatePretimbrado(invoiceData) {
    const errors = []
    const warnings = []

    // Validar RFC receptor
    const rfcValidation = await this.validateRFC(invoiceData.receptorRfc)
    if (!rfcValidation.valid) {
      errors.push({
        field: 'receptorRfc',
        code: 'CFDI40100',
        message: rfcValidation.error
      })
    }

    // Validar régimen fiscal
    if (invoiceData.receptorRegimen) {
      const regimenValid = this.validateRegimenForRfc(invoiceData.receptorRfc, invoiceData.receptorRegimen)
      if (!regimenValid.valid) {
        errors.push({
          field: 'receptorRegimen',
          code: 'CFDI40101',
          message: regimenValid.error
        })
      }
    }

    // Validar código postal
    if (invoiceData.receptorCodigoPostal) {
      const cpValid = await this.validateCodigoPostal(invoiceData.receptorCodigoPostal)
      if (!cpValid.valid) {
        warnings.push({
          field: 'receptorCodigoPostal',
          code: 'CFDI40102',
          message: 'Verificar que el código postal corresponda al domicilio fiscal del receptor'
        })
      }
    }

    // Validar uso de CFDI vs régimen
    if (invoiceData.usoCfdi && invoiceData.receptorRegimen) {
      const usoValid = this.validateUsoCfdiForRegimen(invoiceData.usoCfdi, invoiceData.receptorRegimen)
      if (!usoValid.valid) {
        errors.push({
          field: 'usoCfdi',
          code: 'CFDI40103',
          message: usoValid.error
        })
      }
    }

    // Validar método de pago y forma de pago
    if (invoiceData.metodoPago === 'PPD' && invoiceData.formaPago !== '99') {
      errors.push({
        field: 'formaPago',
        code: 'CFDI40201',
        message: 'Para método de pago PPD (Pago en Parcialidades o Diferido), la forma de pago debe ser 99 (Por definir)'
      })
    }

    const validation = {
      valid: errors.length === 0,
      errors,
      warnings,
      timestamp: new Date().toISOString()
    }

    // Guardar en historial
    this.validationHistory.push({
      ...validation,
      invoiceData: { rfc: invoiceData.receptorRfc, usoCfdi: invoiceData.usoCfdi }
    })

    return validation
  }

  /**
   * Validar RFC
   */
  async validateRFC(rfc) {
    if (!rfc) {
      return { valid: false, error: 'RFC es requerido' }
    }

    // Validar formato básico
    const rfcRegexMoral = /^[A-ZÑ&]{3}[0-9]{6}[A-Z0-9]{3}$/
    const rfcRegexFisica = /^[A-ZÑ&]{4}[0-9]{6}[A-Z0-9]{3}$/

    const isMoral = rfcRegexMoral.test(rfc.toUpperCase())
    const isFisica = rfcRegexFisica.test(rfc.toUpperCase())

    if (!isMoral && !isFisica) {
      return {
        valid: false,
        error: 'Formato de RFC inválido',
        suggestion: 'El RFC debe tener 12 caracteres para persona moral o 13 para persona física'
      }
    }

    // En producción, validar contra lista negra del SAT
    return {
      valid: true,
      type: isMoral ? 'MORAL' : 'FISICA',
      rfc: rfc.toUpperCase()
    }
  }

  /**
   * Validar régimen para RFC
   */
  validateRegimenForRfc(rfc, regimen) {
    const rfcType = rfc.length === 12 ? 'MORAL' : 'FISICA'

    // Regímenes válidos por tipo de persona
    const regimenesMoral = ['601', '603', '606', '607', '609', '610', '620', '622', '623', '624', '625', '626']
    const regimenesFisica = ['605', '606', '608', '611', '612', '614', '615', '616', '621', '625', '626']

    const validRegimens = rfcType === 'MORAL' ? regimenesMoral : regimenesFisica

    if (!validRegimens.includes(regimen)) {
      return {
        valid: false,
        error: `Régimen ${regimen} no válido para persona ${rfcType.toLowerCase()}`,
        validOptions: validRegimens
      }
    }

    return { valid: true }
  }

  /**
   * Validar código postal
   */
  async validateCodigoPostal(codigoPostal) {
    // Validar formato (5 dígitos)
    if (!/^\d{5}$/.test(codigoPostal)) {
      return { valid: false, error: 'Código postal debe tener 5 dígitos' }
    }

    // En producción, validar contra catálogo del SAT
    return { valid: true }
  }

  /**
   * Validar uso de CFDI para régimen
   */
  validateUsoCfdiForRegimen(usoCfdi, regimen) {
    // Mapa simplificado de usos por régimen (en producción usar catálogo completo del SAT)
    const usosGenerales = ['G01', 'G02', 'G03', 'S01', 'CP01']

    // La mayoría de usos son válidos para régimen general
    if (usosGenerales.includes(usoCfdi)) {
      return { valid: true }
    }

    return { valid: true } // Simplificado para demo
  }

  /**
   * Registrar factura a crédito para seguimiento
   */
  async registerCreditInvoice(invoiceData) {
    const invoice = {
      uuid: invoiceData.uuid,
      folio: invoiceData.folio,
      serie: invoiceData.serie,
      receptorRfc: invoiceData.receptorRfc,
      receptorNombre: invoiceData.receptorNombre,
      total: invoiceData.total,
      saldoPendiente: invoiceData.total,
      fechaEmision: invoiceData.fechaEmision || new Date().toISOString(),
      pagos: [],
      complementosPago: [],
      status: 'PENDIENTE',
      registeredAt: new Date().toISOString()
    }

    this.pendingInvoices.set(invoice.uuid, invoice)
    this.log('info', `Factura a crédito registrada: ${invoice.uuid}`)

    return invoice
  }

  /**
   * Registrar pago recibido
   */
  async registerPayment(paymentData) {
    const { invoiceUuid, amount, paymentDate, formaPago } = paymentData

    const invoice = this.pendingInvoices.get(invoiceUuid)
    if (!invoice) {
      throw new Error('Factura no encontrada')
    }

    const payment = {
      id: `pago_${Date.now()}`,
      amount,
      paymentDate: paymentDate || new Date().toISOString(),
      formaPago,
      complementoPagoEmitido: false,
      registeredAt: new Date().toISOString()
    }

    invoice.pagos.push(payment)
    invoice.saldoPendiente -= amount

    if (invoice.saldoPendiente <= 0) {
      invoice.status = 'PAGADA'
    }

    // Calcular fecha límite para complemento de pago (día 10 del mes siguiente)
    const paymentMonth = new Date(paymentDate)
    const complementDeadline = new Date(paymentMonth.getFullYear(), paymentMonth.getMonth() + 1, 10)
    payment.complementDeadline = complementDeadline.toISOString()

    this.log('info', `Pago registrado para factura ${invoiceUuid}: $${amount}`)

    // Verificar si necesita recordatorio
    this.checkAndScheduleReminder(invoice, payment)

    return { invoice, payment }
  }

  /**
   * Obtener facturas pendientes de complemento de pago
   */
  async getPendingComplements() {
    const pending = []
    const now = new Date()
    const day10 = new Date(now.getFullYear(), now.getMonth() + 1, 10)

    for (const [uuid, invoice] of this.pendingInvoices) {
      for (const pago of invoice.pagos) {
        if (!pago.complementoPagoEmitido) {
          const deadline = new Date(pago.complementDeadline)
          const daysUntilDeadline = Math.ceil((deadline - now) / (1000 * 60 * 60 * 24))

          pending.push({
            invoiceUuid: uuid,
            invoiceFolio: invoice.folio,
            receptorRfc: invoice.receptorRfc,
            receptorNombre: invoice.receptorNombre,
            paymentId: pago.id,
            paymentAmount: pago.amount,
            paymentDate: pago.paymentDate,
            complementDeadline: pago.complementDeadline,
            daysUntilDeadline,
            urgency: daysUntilDeadline <= 0 ? 'VENCIDO' : daysUntilDeadline <= 3 ? 'URGENTE' : daysUntilDeadline <= 5 ? 'PROXIMO' : 'NORMAL'
          })
        }
      }
    }

    return pending.sort((a, b) => a.daysUntilDeadline - b.daysUntilDeadline)
  }

  /**
   * Verificar y programar recordatorio
   */
  checkAndScheduleReminder(invoice, payment) {
    const deadline = new Date(payment.complementDeadline)
    const reminderDate = new Date(deadline)
    reminderDate.setDate(reminderDate.getDate() - this.cfdiConfig.reminderDaysBefore)

    const reminder = {
      id: `reminder_${Date.now()}`,
      type: 'COMPLEMENTO_PAGO',
      invoiceUuid: invoice.uuid,
      invoiceFolio: invoice.folio,
      paymentId: payment.id,
      reminderDate: reminderDate.toISOString(),
      deadline: payment.complementDeadline,
      sent: false
    }

    this.scheduledReminders.push(reminder)
  }

  /**
   * Generar reporte de facturas a crédito
   */
  async generateCreditInvoicesReport(filters = {}) {
    const invoices = Array.from(this.pendingInvoices.values())

    let filtered = invoices
    if (filters.status) {
      filtered = filtered.filter(i => i.status === filters.status)
    }
    if (filters.receptorRfc) {
      filtered = filtered.filter(i => i.receptorRfc.includes(filters.receptorRfc))
    }

    const totalPendiente = filtered.reduce((sum, i) => sum + i.saldoPendiente, 0)
    const totalFacturado = filtered.reduce((sum, i) => sum + i.total, 0)

    return {
      generatedAt: new Date().toISOString(),
      totalFacturas: filtered.length,
      totalFacturado,
      totalPendiente,
      totalCobrado: totalFacturado - totalPendiente,
      facturas: filtered,
      resumenPorCliente: this.groupByClient(filtered)
    }
  }

  /**
   * Agrupar facturas por cliente
   */
  groupByClient(invoices) {
    const grouped = {}
    for (const invoice of invoices) {
      const key = invoice.receptorRfc
      if (!grouped[key]) {
        grouped[key] = {
          rfc: invoice.receptorRfc,
          nombre: invoice.receptorNombre,
          facturas: [],
          totalFacturado: 0,
          totalPendiente: 0
        }
      }
      grouped[key].facturas.push(invoice)
      grouped[key].totalFacturado += invoice.total
      grouped[key].totalPendiente += invoice.saldoPendiente
    }
    return Object.values(grouped)
  }

  /**
   * Obtener alertas de cancelación fuera de plazo
   */
  getCancellationAlerts() {
    const now = new Date()
    const alerts = []

    for (const [uuid, invoice] of this.pendingInvoices) {
      const fechaEmision = new Date(invoice.fechaEmision)
      // Último día del mes siguiente a la emisión
      const fechaLimiteCancelacion = new Date(fechaEmision.getFullYear(), fechaEmision.getMonth() + 2, 0)

      if (now > fechaLimiteCancelacion) {
        alerts.push({
          invoiceUuid: uuid,
          invoiceFolio: invoice.folio,
          fechaEmision: invoice.fechaEmision,
          fechaLimiteCancelacion: fechaLimiteCancelacion.toISOString(),
          message: 'Esta factura ya no puede ser cancelada sin aceptación del receptor',
          status: 'FUERA_DE_PLAZO'
        })
      }
    }

    return alerts
  }

  /**
   * FAQ inteligente - consultar errores
   */
  async queryFAQ(query, errorCode) {
    // Si hay código de error específico
    if (errorCode && this.errorDatabase[errorCode]) {
      return {
        found: true,
        error: this.errorDatabase[errorCode],
        relatedErrors: this.findRelatedErrors(errorCode)
      }
    }

    // Búsqueda por texto en la consulta
    if (query) {
      const queryLower = query.toLowerCase()
      const matches = []

      for (const error of Object.values(this.errorDatabase)) {
        if (
          error.message.toLowerCase().includes(queryLower) ||
          error.solution.toLowerCase().includes(queryLower) ||
          error.category.toLowerCase().includes(queryLower)
        ) {
          matches.push(error)
        }
      }

      return {
        found: matches.length > 0,
        query,
        results: matches,
        suggestion: matches.length === 0 ? 'Intente con términos como: RFC, régimen, código postal, complemento de pago, cancelación' : null
      }
    }

    return { found: false, message: 'Proporcione un código de error o una consulta' }
  }

  /**
   * Encontrar errores relacionados
   */
  findRelatedErrors(errorCode) {
    const error = this.errorDatabase[errorCode]
    if (!error) return []

    return Object.values(this.errorDatabase).filter(e =>
      e.code !== errorCode && e.category === error.category
    )
  }

  /**
   * Obtener próximos recordatorios
   */
  getUpcomingReminders() {
    const now = new Date()
    return this.scheduledReminders
      .filter(r => !r.sent && new Date(r.reminderDate) > now)
      .sort((a, b) => new Date(a.reminderDate) - new Date(b.reminderDate))
  }

  /**
   * Actualizar configuración de recordatorios
   */
  updateReminderConfig(config) {
    if (config.reminderDaysBefore) {
      this.cfdiConfig.reminderDaysBefore = config.reminderDaysBefore
    }
  }

  /**
   * Generar dashboard de compliance CFDI
   */
  generateDashboard() {
    const invoices = Array.from(this.pendingInvoices.values())
    const pendingComplements = this.getPendingComplements()

    return {
      summary: {
        totalFacturasCredito: invoices.length,
        facturasPagadas: invoices.filter(i => i.status === 'PAGADA').length,
        facturasPendientes: invoices.filter(i => i.status === 'PENDIENTE').length,
        complementosPendientes: pendingComplements.length,
        validacionesHoy: this.validationHistory.filter(v =>
          new Date(v.timestamp).toDateString() === new Date().toDateString()
        ).length
      },
      alertas: {
        complementosUrgentes: pendingComplements.filter(p => p.urgency === 'URGENTE' || p.urgency === 'VENCIDO'),
        cancelacionesFueraPlazo: this.getCancellationAlerts()
      },
      proximosRecordatorios: this.getUpcomingReminders().slice(0, 5),
      ultimasValidaciones: this.validationHistory.slice(-10).reverse()
    }
  }

  /**
   * Ejecutar acción (para integración con orquestador)
   */
  async execute(action, params) {
    switch (action) {
      case 'validate-pretimbrado':
        return await this.validatePretimbrado(params)

      case 'validate-rfc':
        return await this.validateRFC(params.rfc)

      case 'register-credit-invoice':
        return await this.registerCreditInvoice(params)

      case 'register-payment':
        return await this.registerPayment(params)

      case 'get-pending-complements':
        return await this.getPendingComplements()

      case 'get-dashboard':
        return this.generateDashboard()

      case 'query-faq':
        return await this.queryFAQ(params.query, params.errorCode)

      case 'generate-report':
        return await this.generateCreditInvoicesReport(params)

      default:
        throw new Error(`Acción desconocida: ${action}`)
    }
  }

  /**
   * Handler de conexión Socket
   */
  onSocketConnection(socket) {
    socket.on('join-cfdi', () => {
      socket.join('cfdi-asistente')
      this.log('info', `Cliente ${socket.id} conectado a CFDI Asistente`)
    })

    socket.on('validate', async (data, callback) => {
      try {
        const result = await this.validatePretimbrado(data)
        callback({ success: true, data: result })
      } catch (error) {
        callback({ success: false, error: error.message })
      }
    })

    socket.on('query-faq', async (data, callback) => {
      try {
        const result = await this.queryFAQ(data.query, data.errorCode)
        callback({ success: true, data: result })
      } catch (error) {
        callback({ success: false, error: error.message })
      }
    })
  }

  /**
   * Hook de inicio
   */
  async onStart() {
    this.log('info', 'Agente CFDI 4.0 y Complemento de Pagos iniciado')
    this.log('info', `Base de errores cargada: ${Object.keys(this.errorDatabase).length} errores conocidos`)
  }
}

export default CFDIAsistenteAgent

// Si se ejecuta directamente
const isMainModule = process.argv[1]?.includes('CFDIAsistenteAgent')
if (isMainModule) {
  const agent = new CFDIAsistenteAgent({
    port: parseInt(process.env.CFDI_AGENT_PORT) || 4351
  })

  agent.start().catch(console.error)

  process.on('SIGINT', async () => {
    console.log('\nDeteniendo Agente CFDI...')
    await agent.stop()
    process.exit(0)
  })
}
