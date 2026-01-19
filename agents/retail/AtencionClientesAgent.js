/**
 * ALQVIMIA RPA 2.0 - Agente de Atención a Clientes (WhatsApp / Web)
 * Resuelve dudas 24/7: Horarios, Existencia, Status de pedido, Políticas, Devoluciones
 *
 * Tecnologías: IA (NLP) + APA + RPA
 * Valor: Reduce hasta 40% la carga del call center, mejora NPS
 */

import BaseAgent from '../core/BaseAgent.js'

class AtencionClientesAgent extends BaseAgent {
  constructor(config = {}) {
    super({
      id: config.id || 'agent-atencion-clientes',
      name: 'Agente de Atención a Clientes',
      version: '1.0.0',
      port: config.port || 4360,
      category: 'retail',
      ...config
    })

    // Base de conocimiento
    this.knowledgeBase = new Map()

    // Flujos de conversación configurables
    this.conversationFlows = new Map()

    // Conversaciones activas
    this.activeConversations = new Map()

    // Historial de interacciones
    this.interactionHistory = []

    // FAQs
    this.faqs = this.initializeFAQs()

    // Intents reconocidos
    this.intents = this.initializeIntents()

    // Métricas de atención
    this.serviceMetrics = {
      totalConversations: 0,
      resolvedByBot: 0,
      escalatedToHuman: 0,
      avgResponseTime: 0,
      satisfactionScore: 0
    }

    // Configurar rutas
    this.setupAtencionRoutes()
  }

  /**
   * Obtener capacidades del agente
   */
  getCapabilities() {
    return [
      'chat-omnicanal',
      'respuesta-automatica',
      'deteccion-intenciones',
      'escalado-humano',
      'base-conocimiento',
      'flujos-configurables',
      'integracion-whatsapp',
      'integracion-web',
      'metricas-nps',
      'soporte-24-7'
    ]
  }

  /**
   * Inicializar FAQs base
   */
  initializeFAQs() {
    return [
      {
        id: 'horarios',
        question: '¿Cuál es el horario de atención?',
        answer: 'Nuestro horario de atención es de Lunes a Viernes de 9:00 a 18:00 hrs y Sábados de 10:00 a 14:00 hrs.',
        keywords: ['horario', 'hora', 'abierto', 'cerrado', 'atienden', 'trabajan'],
        category: 'general'
      },
      {
        id: 'ubicacion',
        question: '¿Dónde están ubicados?',
        answer: 'Contamos con múltiples sucursales. ¿De qué ciudad o zona necesitas la ubicación?',
        keywords: ['ubicación', 'dirección', 'donde', 'sucursal', 'tienda', 'local'],
        category: 'general',
        requiresFollowUp: true
      },
      {
        id: 'devolucion',
        question: '¿Cuál es la política de devoluciones?',
        answer: 'Tienes 30 días a partir de tu compra para realizar devoluciones. El producto debe estar en su empaque original y sin uso. Presenta tu ticket de compra.',
        keywords: ['devolución', 'devolver', 'regresar', 'cambio', 'garantía', 'reembolso'],
        category: 'politicas'
      },
      {
        id: 'pedido_status',
        question: '¿Cómo puedo rastrear mi pedido?',
        answer: 'Por favor proporcióname tu número de pedido o el correo con el que realizaste la compra para verificar el estatus.',
        keywords: ['pedido', 'orden', 'envío', 'paquete', 'rastreo', 'tracking', 'llegada', 'entrega'],
        category: 'pedidos',
        requiresData: true
      },
      {
        id: 'existencia',
        question: '¿Tienen disponible cierto producto?',
        answer: '¿Qué producto te gustaría consultar? Puedo verificar la disponibilidad en nuestras sucursales.',
        keywords: ['disponible', 'tienen', 'existencia', 'stock', 'inventario', 'hay'],
        category: 'productos',
        requiresData: true
      },
      {
        id: 'pago',
        question: '¿Qué formas de pago aceptan?',
        answer: 'Aceptamos: Efectivo, Tarjeta de crédito/débito (Visa, Mastercard, AMEX), Transferencia bancaria, y Pago a meses sin intereses con tarjetas participantes.',
        keywords: ['pago', 'pagar', 'tarjeta', 'efectivo', 'transferencia', 'meses'],
        category: 'pagos'
      },
      {
        id: 'factura',
        question: '¿Cómo puedo solicitar mi factura?',
        answer: 'Puedes solicitar tu factura al momento de tu compra o hasta 7 días después. Necesitamos tu RFC y datos fiscales. ¿Deseas que te guíe en el proceso?',
        keywords: ['factura', 'facturar', 'cfdi', 'fiscal', 'rfc'],
        category: 'facturacion'
      }
    ]
  }

  /**
   * Inicializar intenciones
   */
  initializeIntents() {
    return {
      SALUDO: {
        patterns: ['hola', 'buenas', 'buenos días', 'buenas tardes', 'hey', 'qué tal'],
        response: '¡Hola! Bienvenido a nuestro servicio de atención. ¿En qué puedo ayudarte hoy?'
      },
      DESPEDIDA: {
        patterns: ['adiós', 'gracias', 'hasta luego', 'bye', 'chao', 'nos vemos'],
        response: '¡Gracias por contactarnos! Si tienes más preguntas, no dudes en escribirnos. ¡Que tengas un excelente día!'
      },
      AGRADECIMIENTO: {
        patterns: ['gracias', 'muchas gracias', 'te lo agradezco', 'muy amable'],
        response: '¡Con gusto! ¿Hay algo más en lo que pueda ayudarte?'
      },
      QUEJA: {
        patterns: ['queja', 'molesto', 'enojado', 'inconformidad', 'problema', 'mal servicio'],
        response: 'Lamento mucho escuchar eso. Tu satisfacción es muy importante para nosotros. ¿Podrías contarme más sobre lo que sucedió para poder ayudarte?',
        escalate: true
      },
      HABLAR_HUMANO: {
        patterns: ['hablar con alguien', 'agente humano', 'persona real', 'ejecutivo', 'asesor'],
        response: 'Entiendo que prefieres hablar con una persona. Te transfiero con un asesor. Por favor espera un momento.',
        escalate: true
      }
    }
  }

  /**
   * Configurar rutas HTTP del agente
   */
  setupAtencionRoutes() {
    // Recibir mensaje (webhook para WhatsApp/Web)
    this.app.post('/message', async (req, res) => {
      try {
        const { from, message, channel = 'web', sessionId } = req.body
        const response = await this.processMessage(from, message, channel, sessionId)
        res.json({ success: true, data: response })
      } catch (error) {
        res.status(400).json({ success: false, error: error.message })
      }
    })

    // Obtener conversación activa
    this.app.get('/conversation/:sessionId', (req, res) => {
      const { sessionId } = req.params
      const conversation = this.activeConversations.get(sessionId)
      if (conversation) {
        res.json({ success: true, data: conversation })
      } else {
        res.status(404).json({ success: false, error: 'Conversación no encontrada' })
      }
    })

    // Finalizar conversación
    this.app.post('/conversation/:sessionId/end', (req, res) => {
      const { sessionId } = req.params
      const { satisfaction } = req.body
      const result = this.endConversation(sessionId, satisfaction)
      res.json({ success: true, data: result })
    })

    // Gestión de FAQs
    this.app.get('/faqs', (req, res) => {
      const { category } = req.query
      let faqs = this.faqs
      if (category) {
        faqs = faqs.filter(f => f.category === category)
      }
      res.json({ success: true, data: faqs })
    })

    this.app.post('/faqs', (req, res) => {
      try {
        const faq = this.addFAQ(req.body)
        res.json({ success: true, data: faq })
      } catch (error) {
        res.status(400).json({ success: false, error: error.message })
      }
    })

    this.app.put('/faqs/:id', (req, res) => {
      try {
        const { id } = req.params
        const faq = this.updateFAQ(id, req.body)
        res.json({ success: true, data: faq })
      } catch (error) {
        res.status(400).json({ success: false, error: error.message })
      }
    })

    this.app.delete('/faqs/:id', (req, res) => {
      const { id } = req.params
      const result = this.deleteFAQ(id)
      res.json({ success: true, data: result })
    })

    // Gestión de flujos de conversación
    this.app.get('/flows', (req, res) => {
      const flows = Array.from(this.conversationFlows.values())
      res.json({ success: true, data: flows })
    })

    this.app.post('/flows', (req, res) => {
      try {
        const flow = this.createFlow(req.body)
        res.json({ success: true, data: flow })
      } catch (error) {
        res.status(400).json({ success: false, error: error.message })
      }
    })

    // Métricas de servicio
    this.app.get('/metrics', (req, res) => {
      const metrics = this.getServiceMetrics()
      res.json({ success: true, data: metrics })
    })

    // Historial de interacciones
    this.app.get('/history', (req, res) => {
      const { limit = 100, from, to } = req.query
      let history = [...this.interactionHistory]

      if (from) {
        history = history.filter(h => new Date(h.timestamp) >= new Date(from))
      }
      if (to) {
        history = history.filter(h => new Date(h.timestamp) <= new Date(to))
      }

      res.json({ success: true, data: history.slice(-parseInt(limit)) })
    })

    // Escalado a humano
    this.app.post('/escalate', async (req, res) => {
      try {
        const { sessionId, reason } = req.body
        const result = await this.escalateToHuman(sessionId, reason)
        res.json({ success: true, data: result })
      } catch (error) {
        res.status(400).json({ success: false, error: error.message })
      }
    })

    // Dashboard
    this.app.get('/dashboard', (req, res) => {
      const dashboard = this.generateDashboard()
      res.json({ success: true, data: dashboard })
    })
  }

  /**
   * Procesar mensaje entrante
   */
  async processMessage(from, message, channel, sessionId) {
    const startTime = Date.now()
    sessionId = sessionId || `${channel}_${from}_${Date.now()}`

    // Obtener o crear conversación
    let conversation = this.activeConversations.get(sessionId)
    if (!conversation) {
      conversation = this.createConversation(sessionId, from, channel)
    }

    // Agregar mensaje del usuario
    conversation.messages.push({
      role: 'user',
      content: message,
      timestamp: new Date().toISOString()
    })

    // Detectar intención
    const intent = this.detectIntent(message)

    // Buscar respuesta apropiada
    let response
    let shouldEscalate = false

    if (intent) {
      response = {
        text: intent.response,
        intent: intent.name,
        confidence: intent.confidence
      }
      shouldEscalate = intent.escalate || false
    } else {
      // Buscar en FAQs
      const faqMatch = this.findFAQMatch(message)
      if (faqMatch) {
        response = {
          text: faqMatch.answer,
          faqId: faqMatch.id,
          confidence: faqMatch.confidence
        }
      } else {
        // Respuesta por defecto / escalado
        response = {
          text: 'No estoy seguro de entender tu pregunta. ¿Podrías reformularla o seleccionar una de estas opciones?\n\n1. Horarios y ubicaciones\n2. Estado de mi pedido\n3. Devoluciones y cambios\n4. Hablar con un asesor',
          confidence: 0,
          requiresHelp: true
        }
      }
    }

    // Agregar respuesta del bot
    conversation.messages.push({
      role: 'assistant',
      content: response.text,
      timestamp: new Date().toISOString(),
      metadata: {
        intent: response.intent,
        faqId: response.faqId,
        confidence: response.confidence
      }
    })

    conversation.lastActivity = new Date().toISOString()
    conversation.messageCount++

    // Registrar interacción
    const responseTime = Date.now() - startTime
    this.recordInteraction(sessionId, message, response, responseTime)

    // Actualizar métricas
    this.updateMetrics(responseTime)

    // Escalado automático si es necesario
    if (shouldEscalate) {
      await this.escalateToHuman(sessionId, response.intent || 'usuario_solicito')
    }

    // Emitir evento
    this.broadcast('new-message', {
      sessionId,
      from,
      channel,
      userMessage: message,
      botResponse: response.text
    })

    return {
      sessionId,
      response: response.text,
      metadata: {
        intent: response.intent,
        faqId: response.faqId,
        confidence: response.confidence,
        responseTimeMs: responseTime,
        escalated: shouldEscalate
      }
    }
  }

  /**
   * Crear nueva conversación
   */
  createConversation(sessionId, from, channel) {
    const conversation = {
      sessionId,
      from,
      channel,
      messages: [],
      startedAt: new Date().toISOString(),
      lastActivity: new Date().toISOString(),
      messageCount: 0,
      status: 'active',
      escalated: false
    }

    this.activeConversations.set(sessionId, conversation)
    this.serviceMetrics.totalConversations++

    return conversation
  }

  /**
   * Detectar intención del mensaje
   */
  detectIntent(message) {
    const messageLower = message.toLowerCase().trim()

    for (const [intentName, intentConfig] of Object.entries(this.intents)) {
      for (const pattern of intentConfig.patterns) {
        if (messageLower.includes(pattern)) {
          return {
            name: intentName,
            response: intentConfig.response,
            escalate: intentConfig.escalate,
            confidence: 0.9
          }
        }
      }
    }

    return null
  }

  /**
   * Buscar coincidencia en FAQs
   */
  findFAQMatch(message) {
    const messageLower = message.toLowerCase()
    let bestMatch = null
    let bestScore = 0

    for (const faq of this.faqs) {
      let score = 0

      // Verificar keywords
      for (const keyword of faq.keywords) {
        if (messageLower.includes(keyword)) {
          score += 1
        }
      }

      // Normalizar score
      if (faq.keywords.length > 0) {
        score = score / faq.keywords.length
      }

      if (score > bestScore && score >= 0.3) { // Umbral mínimo
        bestScore = score
        bestMatch = { ...faq, confidence: score }
      }
    }

    return bestMatch
  }

  /**
   * Finalizar conversación
   */
  endConversation(sessionId, satisfaction) {
    const conversation = this.activeConversations.get(sessionId)
    if (!conversation) {
      return { success: false, message: 'Conversación no encontrada' }
    }

    conversation.status = 'ended'
    conversation.endedAt = new Date().toISOString()
    conversation.satisfaction = satisfaction

    // Actualizar métricas de satisfacción
    if (satisfaction) {
      this.updateSatisfactionScore(satisfaction)
    }

    // Determinar si fue resuelta por el bot
    if (!conversation.escalated) {
      this.serviceMetrics.resolvedByBot++
    }

    return {
      success: true,
      sessionId,
      duration: this.calculateDuration(conversation.startedAt, conversation.endedAt),
      messageCount: conversation.messageCount,
      resolved: !conversation.escalated
    }
  }

  /**
   * Escalar a agente humano
   */
  async escalateToHuman(sessionId, reason) {
    const conversation = this.activeConversations.get(sessionId)
    if (!conversation) {
      throw new Error('Conversación no encontrada')
    }

    conversation.escalated = true
    conversation.escalatedAt = new Date().toISOString()
    conversation.escalationReason = reason

    this.serviceMetrics.escalatedToHuman++

    // Notificar al orquestador para transferencia
    this.notifyOrchestrator('escalation-required', {
      sessionId,
      from: conversation.from,
      channel: conversation.channel,
      reason,
      conversationHistory: conversation.messages
    })

    // Agregar mensaje de transferencia
    conversation.messages.push({
      role: 'system',
      content: 'Conversación transferida a un agente humano',
      timestamp: new Date().toISOString()
    })

    this.log('info', `Conversación ${sessionId} escalada: ${reason}`)

    return {
      escalated: true,
      sessionId,
      reason,
      message: 'Un asesor se comunicará contigo en breve.'
    }
  }

  /**
   * Agregar FAQ
   */
  addFAQ(faqData) {
    const faq = {
      id: `faq_${Date.now()}`,
      question: faqData.question,
      answer: faqData.answer,
      keywords: faqData.keywords || [],
      category: faqData.category || 'general',
      requiresFollowUp: faqData.requiresFollowUp || false,
      requiresData: faqData.requiresData || false,
      createdAt: new Date().toISOString()
    }

    this.faqs.push(faq)
    this.log('info', `FAQ agregada: ${faq.id}`)

    return faq
  }

  /**
   * Actualizar FAQ
   */
  updateFAQ(faqId, updates) {
    const faqIndex = this.faqs.findIndex(f => f.id === faqId)
    if (faqIndex === -1) {
      throw new Error('FAQ no encontrada')
    }

    this.faqs[faqIndex] = {
      ...this.faqs[faqIndex],
      ...updates,
      updatedAt: new Date().toISOString()
    }

    return this.faqs[faqIndex]
  }

  /**
   * Eliminar FAQ
   */
  deleteFAQ(faqId) {
    const faqIndex = this.faqs.findIndex(f => f.id === faqId)
    if (faqIndex === -1) {
      return { success: false, message: 'FAQ no encontrada' }
    }

    this.faqs.splice(faqIndex, 1)
    return { success: true, message: 'FAQ eliminada' }
  }

  /**
   * Crear flujo de conversación
   */
  createFlow(flowData) {
    const flow = {
      id: `flow_${Date.now()}`,
      name: flowData.name,
      trigger: flowData.trigger,
      steps: flowData.steps || [],
      active: true,
      createdAt: new Date().toISOString()
    }

    this.conversationFlows.set(flow.id, flow)
    return flow
  }

  /**
   * Registrar interacción
   */
  recordInteraction(sessionId, userMessage, response, responseTime) {
    this.interactionHistory.push({
      sessionId,
      userMessage,
      botResponse: response.text,
      intent: response.intent,
      faqId: response.faqId,
      confidence: response.confidence,
      responseTimeMs: responseTime,
      timestamp: new Date().toISOString()
    })
  }

  /**
   * Actualizar métricas
   */
  updateMetrics(responseTime) {
    const total = this.interactionHistory.length
    this.serviceMetrics.avgResponseTime = (
      (this.serviceMetrics.avgResponseTime * (total - 1) + responseTime) / total
    )
  }

  /**
   * Actualizar score de satisfacción
   */
  updateSatisfactionScore(satisfaction) {
    const endedConversations = Array.from(this.activeConversations.values())
      .filter(c => c.status === 'ended' && c.satisfaction)

    if (endedConversations.length > 0) {
      const totalSatisfaction = endedConversations.reduce((sum, c) => sum + c.satisfaction, 0)
      this.serviceMetrics.satisfactionScore = totalSatisfaction / endedConversations.length
    }
  }

  /**
   * Obtener métricas de servicio
   */
  getServiceMetrics() {
    return {
      ...this.serviceMetrics,
      activeConversations: Array.from(this.activeConversations.values()).filter(c => c.status === 'active').length,
      resolutionRate: this.serviceMetrics.totalConversations > 0
        ? Math.round((this.serviceMetrics.resolvedByBot / this.serviceMetrics.totalConversations) * 100)
        : 0
    }
  }

  /**
   * Calcular duración
   */
  calculateDuration(start, end) {
    const startDate = new Date(start)
    const endDate = new Date(end)
    const durationMs = endDate - startDate
    return Math.round(durationMs / 1000) // en segundos
  }

  /**
   * Generar dashboard
   */
  generateDashboard() {
    const metrics = this.getServiceMetrics()
    const now = new Date()
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate())

    const todayInteractions = this.interactionHistory.filter(i =>
      new Date(i.timestamp) >= todayStart
    )

    // Top FAQs consultadas
    const faqCounts = {}
    for (const interaction of this.interactionHistory) {
      if (interaction.faqId) {
        faqCounts[interaction.faqId] = (faqCounts[interaction.faqId] || 0) + 1
      }
    }

    const topFaqs = Object.entries(faqCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([faqId, count]) => {
        const faq = this.faqs.find(f => f.id === faqId)
        return { faqId, question: faq?.question, count }
      })

    return {
      metrics,
      today: {
        interactions: todayInteractions.length,
        avgResponseTime: todayInteractions.length > 0
          ? Math.round(todayInteractions.reduce((sum, i) => sum + i.responseTimeMs, 0) / todayInteractions.length)
          : 0
      },
      topFaqs,
      recentInteractions: this.interactionHistory.slice(-10).reverse(),
      faqCount: this.faqs.length,
      flowCount: this.conversationFlows.size
    }
  }

  /**
   * Ejecutar acción (para integración con orquestador)
   */
  async execute(action, params) {
    switch (action) {
      case 'process-message':
        return await this.processMessage(params.from, params.message, params.channel, params.sessionId)

      case 'get-dashboard':
        return this.generateDashboard()

      case 'get-metrics':
        return this.getServiceMetrics()

      case 'add-faq':
        return this.addFAQ(params)

      case 'escalate':
        return await this.escalateToHuman(params.sessionId, params.reason)

      case 'end-conversation':
        return this.endConversation(params.sessionId, params.satisfaction)

      default:
        throw new Error(`Acción desconocida: ${action}`)
    }
  }

  /**
   * Handler de conexión Socket
   */
  onSocketConnection(socket) {
    socket.on('join-atencion', () => {
      socket.join('atencion-clientes')
      this.log('info', `Cliente ${socket.id} conectado a Atención a Clientes`)
    })

    socket.on('send-message', async (data, callback) => {
      try {
        const result = await this.processMessage(data.from, data.message, data.channel, data.sessionId)
        callback({ success: true, data: result })
      } catch (error) {
        callback({ success: false, error: error.message })
      }
    })

    socket.on('get-conversation', (data, callback) => {
      const conversation = this.activeConversations.get(data.sessionId)
      callback({ success: !!conversation, data: conversation })
    })
  }

  /**
   * Hook de inicio
   */
  async onStart() {
    this.log('info', 'Agente de Atención a Clientes iniciado')
    this.log('info', `${this.faqs.length} FAQs cargadas`)
    this.log('info', `${Object.keys(this.intents).length} intenciones configuradas`)
  }
}

export default AtencionClientesAgent

// Si se ejecuta directamente
const isMainModule = process.argv[1]?.includes('AtencionClientesAgent')
if (isMainModule) {
  const agent = new AtencionClientesAgent({
    port: parseInt(process.env.ATENCION_AGENT_PORT) || 4360
  })

  agent.start().catch(console.error)

  process.on('SIGINT', async () => {
    console.log('\nDeteniendo Agente de Atención a Clientes...')
    await agent.stop()
    process.exit(0)
  })
}
