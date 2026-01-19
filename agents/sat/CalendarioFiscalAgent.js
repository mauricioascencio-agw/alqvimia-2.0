/**
 * ALQVIMIA RPA 2.0 - Agente Calendario Fiscal Inteligente
 * Bot 5: Dashboard y recordatorios de obligaciones fiscales
 *
 * Tecnologías: APA + IA
 * Problema que resuelve: Pérdida de fechas límite de ISR, IVA, IEPS, DIOT, contabilidad electrónica
 */

import BaseAgent from '../core/BaseAgent.js'

class CalendarioFiscalAgent extends BaseAgent {
  constructor(config = {}) {
    super({
      id: config.id || 'agent-calendario-fiscal',
      name: 'Calendario Fiscal Inteligente',
      version: '1.0.0',
      port: config.port || 4354,
      category: 'fiscal-sat',
      ...config
    })

    // Configuración del cliente
    this.clientConfig = {
      rfc: config.rfc || '',
      regimenFiscal: config.regimenFiscal || '601', // General de Ley por defecto
      tipoPersona: config.tipoPersona || 'MORAL', // MORAL o FISICA
      nombreEmpresa: config.nombreEmpresa || ''
    }

    // Motor de reglas fiscales por régimen
    this.fiscalRules = this.initializeFiscalRules()

    // Obligaciones configuradas para el cliente
    this.clientObligations = []

    // Historial de cumplimiento
    this.complianceHistory = []

    // Recordatorios enviados
    this.sentReminders = new Map()

    // Configurar rutas
    this.setupCalendarioRoutes()
  }

  /**
   * Obtener capacidades del agente
   */
  getCapabilities() {
    return [
      'dashboard-personalizado',
      'recordatorios-automaticos',
      'checklist-mensual',
      'alertas-fechas-criticas',
      'integracion-calendario',
      'reportes-cumplimiento',
      'reglas-por-regimen',
      'notificaciones-multicanal'
    ]
  }

  /**
   * Inicializar reglas fiscales por régimen
   */
  initializeFiscalRules() {
    return {
      // Obligaciones comunes
      common: [
        {
          id: 'ISR_MENSUAL',
          name: 'Declaración provisional ISR',
          frequency: 'MONTHLY',
          dueDay: 17,
          description: 'Pago provisional del ISR del mes anterior',
          applies: ['601', '603', '612', '620', '621', '622', '623', '624']
        },
        {
          id: 'IVA_MENSUAL',
          name: 'Declaración mensual IVA',
          frequency: 'MONTHLY',
          dueDay: 17,
          description: 'Pago definitivo del IVA del mes anterior',
          applies: ['601', '603', '612', '620', '621', '622', '623', '624']
        },
        {
          id: 'DIOT',
          name: 'DIOT - Declaración Informativa de Operaciones con Terceros',
          frequency: 'MONTHLY',
          dueDay: 'ULTIMO_DIA',
          description: 'Información de operaciones con proveedores del mes anterior',
          applies: ['601', '603', '612', '620', '621', '622', '623', '624']
        }
      ],

      // Obligaciones por tipo de persona
      moral: [
        {
          id: 'CONTABILIDAD_ELECTRONICA_MORAL',
          name: 'Contabilidad Electrónica',
          frequency: 'MONTHLY',
          dueDay: 3, // Primeros 3 días del segundo mes posterior
          dueMonthOffset: 2,
          description: 'Envío de balanza de comprobación',
          applies: ['601', '603', '620', '622', '623', '624']
        },
        {
          id: 'ISR_ANUAL_MORAL',
          name: 'Declaración Anual ISR Personas Morales',
          frequency: 'YEARLY',
          dueMonth: 3,
          dueDay: 31, // 31 de marzo
          description: 'Declaración anual del ejercicio fiscal anterior',
          applies: ['601', '603', '620', '622', '623', '624']
        },
        {
          id: 'PTU',
          name: 'Reparto de utilidades (PTU)',
          frequency: 'YEARLY',
          dueMonth: 5,
          dueDay: 30, // 30 de mayo
          description: 'Pago de participación de utilidades a trabajadores',
          applies: ['601', '603', '620', '622', '623', '624']
        }
      ],

      fisica: [
        {
          id: 'CONTABILIDAD_ELECTRONICA_FISICA',
          name: 'Contabilidad Electrónica',
          frequency: 'MONTHLY',
          dueDay: 5, // Primeros 5 días del segundo mes posterior
          dueMonthOffset: 2,
          description: 'Envío de balanza de comprobación',
          applies: ['612', '621']
        },
        {
          id: 'ISR_ANUAL_FISICA',
          name: 'Declaración Anual ISR Personas Físicas',
          frequency: 'YEARLY',
          dueMonth: 4,
          dueDay: 30, // 30 de abril
          description: 'Declaración anual del ejercicio fiscal anterior',
          applies: ['605', '606', '608', '611', '612', '614', '615', '616', '621']
        }
      ],

      // Obligaciones especiales por régimen
      regimen: {
        '601': [ // General de Ley PM
          {
            id: 'IEPS_601',
            name: 'Declaración IEPS',
            frequency: 'MONTHLY',
            dueDay: 17,
            description: 'Si maneja productos gravados con IEPS',
            conditional: true
          }
        ],
        '612': [ // Actividad Empresarial y Profesional
          {
            id: 'BIMESTRAL_RIF',
            name: 'Declaración Bimestral',
            frequency: 'BIMONTHLY',
            dueDay: 17,
            description: 'Para ingresos menores a 4 millones anuales',
            conditional: true
          }
        ],
        '621': [ // Incorporación Fiscal
          {
            id: 'BIMESTRAL_RESICO',
            name: 'Pago Bimestral RESICO',
            frequency: 'BIMONTHLY',
            dueDay: 17,
            description: 'Pago definitivo bimestral'
          }
        ],
        '626': [ // RESICO
          {
            id: 'ISR_RESICO',
            name: 'Pago mensual RESICO',
            frequency: 'MONTHLY',
            dueDay: 17,
            description: 'Pago definitivo mensual del ISR RESICO'
          }
        ]
      },

      // Fechas críticas especiales
      critical: [
        {
          id: 'AJUSTE_ANUAL_ISR',
          name: 'Ajuste Anual ISR Trabajadores',
          frequency: 'YEARLY',
          dueMonth: 2,
          dueDay: 15,
          description: 'Cálculo del ajuste anual para trabajadores'
        },
        {
          id: 'CONSTANCIAS_RETENCION',
          name: 'Entrega de Constancias de Retención',
          frequency: 'YEARLY',
          dueMonth: 2,
          dueDay: 'ULTIMO_DIA',
          description: 'Entrega de constancias a trabajadores y proveedores'
        },
        {
          id: 'INFORMATIVA_SUELDOS',
          name: 'Declaración Informativa de Sueldos',
          frequency: 'YEARLY',
          dueMonth: 2,
          dueDay: 15,
          description: 'Presentación del anexo de sueldos y salarios'
        }
      ]
    }
  }

  /**
   * Configurar rutas HTTP del agente
   */
  setupCalendarioRoutes() {
    // Configurar cliente
    this.app.post('/client/configure', (req, res) => {
      try {
        this.configureClient(req.body)
        res.json({ success: true, data: this.clientConfig })
      } catch (error) {
        res.status(400).json({ success: false, error: error.message })
      }
    })

    // Obtener configuración del cliente
    this.app.get('/client/config', (req, res) => {
      res.json({ success: true, data: this.clientConfig })
    })

    // Dashboard personalizado
    this.app.get('/dashboard', (req, res) => {
      const dashboard = this.generateDashboard()
      res.json({ success: true, data: dashboard })
    })

    // Obligaciones del mes actual
    this.app.get('/obligations/current-month', (req, res) => {
      const obligations = this.getCurrentMonthObligations()
      res.json({ success: true, data: obligations })
    })

    // Obligaciones de un mes específico
    this.app.get('/obligations/:year/:month', (req, res) => {
      const { year, month } = req.params
      const obligations = this.getMonthObligations(parseInt(year), parseInt(month))
      res.json({ success: true, data: obligations })
    })

    // Próximos vencimientos
    this.app.get('/obligations/upcoming', (req, res) => {
      const { days = 30 } = req.query
      const upcoming = this.getUpcomingObligations(parseInt(days))
      res.json({ success: true, data: upcoming })
    })

    // Checklist mensual
    this.app.get('/checklist/:year/:month', (req, res) => {
      const { year, month } = req.params
      const checklist = this.generateMonthlyChecklist(parseInt(year), parseInt(month))
      res.json({ success: true, data: checklist })
    })

    // Marcar obligación como cumplida
    this.app.post('/obligations/:id/complete', (req, res) => {
      try {
        const { id } = req.params
        const { year, month, notes, documentPath } = req.body
        const result = this.markObligationComplete(id, year, month, notes, documentPath)
        res.json({ success: true, data: result })
      } catch (error) {
        res.status(400).json({ success: false, error: error.message })
      }
    })

    // Historial de cumplimiento
    this.app.get('/compliance/history', (req, res) => {
      const { year } = req.query
      const history = this.getComplianceHistory(year ? parseInt(year) : null)
      res.json({ success: true, data: history })
    })

    // Reporte de cumplimiento
    this.app.get('/reports/compliance', (req, res) => {
      const { year } = req.query
      const report = this.generateComplianceReport(year ? parseInt(year) : new Date().getFullYear())
      res.json({ success: true, data: report })
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

    // Enviar recordatorio manualmente
    this.app.post('/reminders/send', async (req, res) => {
      try {
        const result = await this.sendReminder(req.body)
        res.json({ success: true, data: result })
      } catch (error) {
        res.status(400).json({ success: false, error: error.message })
      }
    })

    // Exportar a Google Calendar
    this.app.get('/export/google-calendar', (req, res) => {
      const icsData = this.exportToICS()
      res.setHeader('Content-Type', 'text/calendar')
      res.setHeader('Content-Disposition', 'attachment; filename=obligaciones-fiscales.ics')
      res.send(icsData)
    })

    // Exportar a Outlook
    this.app.get('/export/outlook', (req, res) => {
      const icsData = this.exportToICS()
      res.setHeader('Content-Type', 'text/calendar')
      res.setHeader('Content-Disposition', 'attachment; filename=obligaciones-fiscales.ics')
      res.send(icsData)
    })

    // Todas las obligaciones disponibles para el régimen
    this.app.get('/rules/obligations', (req, res) => {
      const obligations = this.getAvailableObligations()
      res.json({ success: true, data: obligations })
    })
  }

  /**
   * Configurar cliente
   */
  configureClient(config) {
    if (config.rfc) this.clientConfig.rfc = config.rfc
    if (config.regimenFiscal) this.clientConfig.regimenFiscal = config.regimenFiscal
    if (config.tipoPersona) this.clientConfig.tipoPersona = config.tipoPersona
    if (config.nombreEmpresa) this.clientConfig.nombreEmpresa = config.nombreEmpresa

    // Recalcular obligaciones del cliente
    this.clientObligations = this.calculateClientObligations()
    this.log('info', `Cliente configurado: ${this.clientConfig.nombreEmpresa} (${this.clientConfig.rfc})`)
  }

  /**
   * Calcular obligaciones del cliente según su régimen
   */
  calculateClientObligations() {
    const obligations = []
    const regimen = this.clientConfig.regimenFiscal
    const tipoPersona = this.clientConfig.tipoPersona

    // Agregar obligaciones comunes aplicables
    for (const rule of this.fiscalRules.common) {
      if (rule.applies.includes(regimen)) {
        obligations.push({ ...rule, source: 'common' })
      }
    }

    // Agregar obligaciones por tipo de persona
    const personaRules = tipoPersona === 'MORAL' ? this.fiscalRules.moral : this.fiscalRules.fisica
    for (const rule of personaRules) {
      if (rule.applies.includes(regimen)) {
        obligations.push({ ...rule, source: tipoPersona.toLowerCase() })
      }
    }

    // Agregar obligaciones específicas del régimen
    if (this.fiscalRules.regimen[regimen]) {
      for (const rule of this.fiscalRules.regimen[regimen]) {
        obligations.push({ ...rule, source: 'regimen' })
      }
    }

    // Agregar fechas críticas
    for (const rule of this.fiscalRules.critical) {
      obligations.push({ ...rule, source: 'critical', isCritical: true })
    }

    return obligations
  }

  /**
   * Obtener obligaciones del mes actual
   */
  getCurrentMonthObligations() {
    const now = new Date()
    return this.getMonthObligations(now.getFullYear(), now.getMonth() + 1)
  }

  /**
   * Obtener obligaciones de un mes específico
   */
  getMonthObligations(year, month) {
    const obligations = []

    for (const rule of this.clientObligations) {
      const dueDate = this.calculateDueDate(rule, year, month)
      if (dueDate) {
        const compliance = this.getComplianceStatus(rule.id, year, month)
        obligations.push({
          ...rule,
          dueDate: dueDate.toISOString(),
          dueDateFormatted: this.formatDate(dueDate),
          year,
          month,
          status: compliance ? compliance.status : 'PENDIENTE',
          completedAt: compliance?.completedAt,
          notes: compliance?.notes
        })
      }
    }

    return obligations.sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
  }

  /**
   * Calcular fecha de vencimiento
   */
  calculateDueDate(rule, year, month) {
    // Para obligaciones mensuales
    if (rule.frequency === 'MONTHLY') {
      let dueDay = rule.dueDay
      if (dueDay === 'ULTIMO_DIA') {
        dueDay = new Date(year, month, 0).getDate()
      }

      let dueMonth = month
      let dueYear = year

      // Si tiene offset de mes (como contabilidad electrónica)
      if (rule.dueMonthOffset) {
        const targetDate = new Date(year, month - 1 + rule.dueMonthOffset, 1)
        dueMonth = targetDate.getMonth() + 1
        dueYear = targetDate.getFullYear()
      }

      return new Date(dueYear, dueMonth - 1, dueDay)
    }

    // Para obligaciones anuales
    if (rule.frequency === 'YEARLY') {
      if (rule.dueMonth === month) {
        let dueDay = rule.dueDay
        if (dueDay === 'ULTIMO_DIA') {
          dueDay = new Date(year, month, 0).getDate()
        }
        return new Date(year, month - 1, dueDay)
      }
      return null
    }

    // Para obligaciones bimestrales
    if (rule.frequency === 'BIMONTHLY') {
      const bimestreMonths = [2, 4, 6, 8, 10, 12]
      if (bimestreMonths.includes(month)) {
        return new Date(year, month - 1, rule.dueDay)
      }
      return null
    }

    return null
  }

  /**
   * Obtener próximas obligaciones
   */
  getUpcomingObligations(days = 30) {
    const now = new Date()
    const endDate = new Date(now)
    endDate.setDate(endDate.getDate() + days)

    const upcoming = []
    let checkDate = new Date(now)

    while (checkDate <= endDate) {
      const year = checkDate.getFullYear()
      const month = checkDate.getMonth() + 1

      const monthObligations = this.getMonthObligations(year, month)

      for (const obligation of monthObligations) {
        const dueDate = new Date(obligation.dueDate)
        if (dueDate >= now && dueDate <= endDate && obligation.status !== 'COMPLETADO') {
          const daysUntilDue = Math.ceil((dueDate - now) / (1000 * 60 * 60 * 24))
          upcoming.push({
            ...obligation,
            daysUntilDue,
            urgency: daysUntilDue <= 1 ? 'URGENTE' : daysUntilDue <= 3 ? 'PROXIMO' : daysUntilDue <= 7 ? 'ATENCION' : 'NORMAL'
          })
        }
      }

      // Avanzar al siguiente mes
      checkDate.setMonth(checkDate.getMonth() + 1)
    }

    return upcoming.sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
  }

  /**
   * Generar checklist mensual
   */
  generateMonthlyChecklist(year, month) {
    const obligations = this.getMonthObligations(year, month)
    const completed = obligations.filter(o => o.status === 'COMPLETADO').length
    const total = obligations.length

    return {
      year,
      month,
      monthName: this.getMonthName(month),
      progress: total > 0 ? Math.round((completed / total) * 100) : 100,
      completed,
      total,
      pending: total - completed,
      obligations: obligations.map(o => ({
        ...o,
        checked: o.status === 'COMPLETADO'
      }))
    }
  }

  /**
   * Marcar obligación como completada
   */
  markObligationComplete(obligationId, year, month, notes, documentPath) {
    const key = `${obligationId}_${year}_${month}`

    const compliance = {
      obligationId,
      year,
      month,
      status: 'COMPLETADO',
      completedAt: new Date().toISOString(),
      notes,
      documentPath
    }

    this.complianceHistory.push(compliance)
    this.log('info', `Obligación ${obligationId} marcada como completada para ${month}/${year}`)

    return compliance
  }

  /**
   * Obtener estado de cumplimiento
   */
  getComplianceStatus(obligationId, year, month) {
    return this.complianceHistory.find(c =>
      c.obligationId === obligationId && c.year === year && c.month === month
    )
  }

  /**
   * Obtener historial de cumplimiento
   */
  getComplianceHistory(year = null) {
    if (year) {
      return this.complianceHistory.filter(c => c.year === year)
    }
    return this.complianceHistory
  }

  /**
   * Generar reporte de cumplimiento
   */
  generateComplianceReport(year) {
    const monthlyData = []

    for (let month = 1; month <= 12; month++) {
      const checklist = this.generateMonthlyChecklist(year, month)
      monthlyData.push({
        month,
        monthName: checklist.monthName,
        progress: checklist.progress,
        completed: checklist.completed,
        total: checklist.total
      })
    }

    const totalObligations = monthlyData.reduce((sum, m) => sum + m.total, 0)
    const totalCompleted = monthlyData.reduce((sum, m) => sum + m.completed, 0)

    return {
      year,
      empresa: this.clientConfig.nombreEmpresa,
      rfc: this.clientConfig.rfc,
      regimen: this.clientConfig.regimenFiscal,
      summary: {
        totalObligations,
        totalCompleted,
        totalPending: totalObligations - totalCompleted,
        overallProgress: totalObligations > 0 ? Math.round((totalCompleted / totalObligations) * 100) : 100
      },
      monthly: monthlyData,
      generatedAt: new Date().toISOString()
    }
  }

  /**
   * Generar dashboard
   */
  generateDashboard() {
    const now = new Date()
    const currentMonth = this.getCurrentMonthObligations()
    const upcoming = this.getUpcomingObligations(30)

    return {
      client: {
        empresa: this.clientConfig.nombreEmpresa,
        rfc: this.clientConfig.rfc,
        regimen: this.clientConfig.regimenFiscal,
        tipoPersona: this.clientConfig.tipoPersona
      },
      currentMonth: {
        month: now.getMonth() + 1,
        monthName: this.getMonthName(now.getMonth() + 1),
        year: now.getFullYear(),
        obligations: currentMonth,
        progress: this.calculateProgress(currentMonth)
      },
      upcoming: {
        next7Days: upcoming.filter(o => o.daysUntilDue <= 7),
        next30Days: upcoming
      },
      alerts: {
        urgent: upcoming.filter(o => o.urgency === 'URGENTE'),
        critical: currentMonth.filter(o => o.isCritical && o.status !== 'COMPLETADO')
      },
      yearProgress: this.generateComplianceReport(now.getFullYear()).summary
    }
  }

  /**
   * Calcular progreso
   */
  calculateProgress(obligations) {
    const completed = obligations.filter(o => o.status === 'COMPLETADO').length
    const total = obligations.length
    return {
      completed,
      total,
      percentage: total > 0 ? Math.round((completed / total) * 100) : 100
    }
  }

  /**
   * Enviar recordatorio
   */
  async sendReminder(config) {
    const { obligationId, channel = 'all' } = config

    const obligation = this.clientObligations.find(o => o.id === obligationId)
    if (!obligation) {
      throw new Error('Obligación no encontrada')
    }

    const reminderData = {
      obligation,
      client: this.clientConfig,
      sentAt: new Date().toISOString()
    }

    // Enviar por WhatsApp
    if (channel === 'all' || channel === 'whatsapp') {
      this.notifyOrchestrator('execute-on-agent', {
        targetAgent: 'agent-whatsapp',
        action: 'send',
        params: {
          to: config.whatsappNumber,
          text: this.generateReminderText(obligation)
        }
      })
    }

    // Enviar por Email
    if (channel === 'all' || channel === 'email') {
      this.notifyOrchestrator('execute-on-agent', {
        targetAgent: 'agent-email',
        action: 'send',
        params: {
          to: config.email,
          subject: `Recordatorio: ${obligation.name}`,
          html: this.generateReminderEmail(obligation)
        }
      })
    }

    this.sentReminders.set(`${obligationId}_${new Date().toISOString()}`, reminderData)

    return reminderData
  }

  /**
   * Generar texto de recordatorio
   */
  generateReminderText(obligation) {
    return `
📅 *Recordatorio Fiscal - Alqvimia*

*Obligación:* ${obligation.name}
*Descripción:* ${obligation.description}
*Empresa:* ${this.clientConfig.nombreEmpresa}
*RFC:* ${this.clientConfig.rfc}

⚠️ No olvide cumplir con esta obligación a tiempo para evitar multas y recargos.
    `.trim()
  }

  /**
   * Generar email de recordatorio
   */
  generateReminderEmail(obligation) {
    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #3b82f6; color: white; padding: 20px; text-align: center;">
          <h1 style="margin: 0;">Recordatorio Fiscal</h1>
        </div>
        <div style="padding: 20px; border: 1px solid #ddd;">
          <h2>${obligation.name}</h2>
          <p><strong>Descripción:</strong> ${obligation.description}</p>
          <p><strong>Empresa:</strong> ${this.clientConfig.nombreEmpresa}</p>
          <p><strong>RFC:</strong> ${this.clientConfig.rfc}</p>
          <hr>
          <p style="color: #dc3545;">
            ⚠️ No olvide cumplir con esta obligación a tiempo para evitar multas y recargos.
          </p>
        </div>
        <div style="background: #f3f4f6; padding: 10px; text-align: center; font-size: 12px;">
          <p>Generado por Alqvimia RPA - Calendario Fiscal Inteligente</p>
        </div>
      </div>
    `
  }

  /**
   * Exportar a formato ICS (iCalendar)
   */
  exportToICS() {
    const now = new Date()
    const year = now.getFullYear()
    let ics = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Alqvimia RPA//Calendario Fiscal//ES
CALSCALE:GREGORIAN
METHOD:PUBLISH
X-WR-CALNAME:Obligaciones Fiscales - ${this.clientConfig.nombreEmpresa}
`

    // Generar eventos para los próximos 12 meses
    const upcoming = this.getUpcomingObligations(365)

    for (const obligation of upcoming) {
      const dueDate = new Date(obligation.dueDate)
      const uid = `${obligation.id}-${dueDate.getTime()}@alqvimia.com`
      const dtstart = this.formatDateForICS(dueDate)

      // Crear recordatorios 7, 3 y 1 día antes
      const alarms = [7, 3, 1].map(days => `
BEGIN:VALARM
TRIGGER:-P${days}D
ACTION:DISPLAY
DESCRIPTION:Recordatorio: ${obligation.name} vence en ${days} día(s)
END:VALARM`).join('\n')

      ics += `
BEGIN:VEVENT
UID:${uid}
DTSTART;VALUE=DATE:${dtstart}
SUMMARY:${obligation.name}
DESCRIPTION:${obligation.description}\\nEmpresa: ${this.clientConfig.nombreEmpresa}\\nRFC: ${this.clientConfig.rfc}
CATEGORIES:FISCAL,SAT
STATUS:CONFIRMED
${alarms}
END:VEVENT
`
    }

    ics += 'END:VCALENDAR'
    return ics
  }

  /**
   * Formatear fecha para ICS
   */
  formatDateForICS(date) {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    return `${year}${month}${day}`
  }

  /**
   * Formatear fecha legible
   */
  formatDate(date) {
    return date.toLocaleDateString('es-MX', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  /**
   * Obtener nombre del mes
   */
  getMonthName(month) {
    const months = ['', 'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
                    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre']
    return months[month]
  }

  /**
   * Obtener obligaciones disponibles para el régimen
   */
  getAvailableObligations() {
    return this.clientObligations
  }

  /**
   * Actualizar configuración de recordatorios
   */
  updateReminderConfig(config) {
    // Implementar configuración de recordatorios
    this.log('info', 'Configuración de recordatorios actualizada')
  }

  /**
   * Ejecutar acción (para integración con orquestador)
   */
  async execute(action, params) {
    switch (action) {
      case 'configure-client':
        this.configureClient(params)
        return this.clientConfig

      case 'get-dashboard':
        return this.generateDashboard()

      case 'get-current-obligations':
        return this.getCurrentMonthObligations()

      case 'get-upcoming':
        return this.getUpcomingObligations(params.days || 30)

      case 'get-checklist':
        return this.generateMonthlyChecklist(params.year, params.month)

      case 'mark-complete':
        return this.markObligationComplete(params.obligationId, params.year, params.month, params.notes, params.documentPath)

      case 'get-compliance-report':
        return this.generateComplianceReport(params.year || new Date().getFullYear())

      case 'send-reminder':
        return await this.sendReminder(params)

      case 'export-calendar':
        return this.exportToICS()

      default:
        throw new Error(`Acción desconocida: ${action}`)
    }
  }

  /**
   * Handler de conexión Socket
   */
  onSocketConnection(socket) {
    socket.on('join-calendario', () => {
      socket.join('calendario-fiscal')
      this.log('info', `Cliente ${socket.id} conectado a Calendario Fiscal`)
    })

    socket.on('get-dashboard', (_, callback) => {
      callback({ success: true, data: this.generateDashboard() })
    })

    socket.on('mark-complete', (data, callback) => {
      try {
        const result = this.markObligationComplete(data.obligationId, data.year, data.month, data.notes, data.documentPath)
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
    this.log('info', 'Agente Calendario Fiscal Inteligente iniciado')

    if (this.clientConfig.regimenFiscal) {
      this.clientObligations = this.calculateClientObligations()
      this.log('info', `${this.clientObligations.length} obligaciones configuradas para régimen ${this.clientConfig.regimenFiscal}`)
    }
  }
}

export default CalendarioFiscalAgent

// Si se ejecuta directamente
const isMainModule = process.argv[1]?.includes('CalendarioFiscalAgent')
if (isMainModule) {
  const agent = new CalendarioFiscalAgent({
    port: parseInt(process.env.CALENDARIO_AGENT_PORT) || 4354
  })

  agent.start().catch(console.error)

  process.on('SIGINT', async () => {
    console.log('\nDeteniendo Agente Calendario Fiscal...')
    await agent.stop()
    process.exit(0)
  })
}
