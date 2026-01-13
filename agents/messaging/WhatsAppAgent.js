/**
 * ALQVIMIA RPA 2.0 - WhatsApp Business Agent
 * Agente autónomo para integración con WhatsApp Business API
 */

import BaseAgent from '../core/BaseAgent.js'
import axios from 'axios'

class WhatsAppAgent extends BaseAgent {
  constructor(config = {}) {
    super({
      id: config.id || 'agent-whatsapp',
      name: 'WhatsApp Business Agent',
      version: '2.1.0',
      port: config.port || 4301,
      category: 'messaging',
      ...config
    })

    // Configuración de WhatsApp Business API
    this.waConfig = {
      apiVersion: config.apiVersion || 'v18.0',
      phoneNumberId: config.phoneNumberId || process.env.WA_PHONE_NUMBER_ID,
      accessToken: config.accessToken || process.env.WA_ACCESS_TOKEN,
      businessAccountId: config.businessAccountId || process.env.WA_BUSINESS_ACCOUNT_ID,
      webhookVerifyToken: config.webhookVerifyToken || process.env.WA_WEBHOOK_VERIFY_TOKEN || 'alqvimia_webhook_token'
    }

    // Cliente HTTP para la API de WhatsApp
    this.waClient = axios.create({
      baseURL: `https://graph.facebook.com/${this.waConfig.apiVersion}`,
      timeout: 30000,
      headers: {
        'Authorization': `Bearer ${this.waConfig.accessToken}`,
        'Content-Type': 'application/json'
      }
    })

    // Almacén de conversaciones
    this.conversations = new Map()

    // Templates de mensajes
    this.templates = new Map()

    // Cola de mensajes pendientes
    this.messageQueue = []
    this.processingQueue = false

    // Historial de mensajes
    this.messageHistory = []

    // Configurar rutas
    this.setupWhatsAppRoutes()
  }

  /**
   * Obtener capacidades del agente
   */
  getCapabilities() {
    return [
      'send',
      'receive',
      'templates',
      'media',
      'webhooks',
      'bulk',
      'interactive',
      'buttons',
      'lists',
      'reactions',
      'read-receipts'
    ]
  }

  /**
   * Obtener configuración (sin tokens sensibles)
   */
  getConfig() {
    return {
      ...super.getConfig(),
      whatsapp: {
        apiVersion: this.waConfig.apiVersion,
        phoneNumberId: this.waConfig.phoneNumberId ? '***' + this.waConfig.phoneNumberId.slice(-4) : null,
        configured: !!this.waConfig.accessToken
      },
      stats: {
        conversations: this.conversations.size,
        templates: this.templates.size,
        queueSize: this.messageQueue.length
      }
    }
  }

  /**
   * Configurar rutas HTTP
   */
  setupWhatsAppRoutes() {
    // Webhook de WhatsApp (verificación)
    this.app.get('/webhook', (req, res) => {
      const mode = req.query['hub.mode']
      const token = req.query['hub.verify_token']
      const challenge = req.query['hub.challenge']

      if (mode === 'subscribe' && token === this.waConfig.webhookVerifyToken) {
        this.log('info', 'Webhook verified')
        res.status(200).send(challenge)
      } else {
        res.status(403).send('Forbidden')
      }
    })

    // Webhook de WhatsApp (recepción de mensajes)
    this.app.post('/webhook', (req, res) => {
      try {
        this.handleWebhook(req.body)
        res.status(200).send('OK')
      } catch (error) {
        this.log('error', `Webhook error: ${error.message}`)
        res.status(500).send('Error')
      }
    })

    // Enviar mensaje de texto
    this.app.post('/send', async (req, res) => {
      try {
        const result = await this.sendMessage(req.body)
        res.json({ success: true, data: result })
      } catch (error) {
        res.status(400).json({ success: false, error: error.message })
      }
    })

    // Enviar mensaje con template
    this.app.post('/send/template', async (req, res) => {
      try {
        const result = await this.sendTemplate(req.body)
        res.json({ success: true, data: result })
      } catch (error) {
        res.status(400).json({ success: false, error: error.message })
      }
    })

    // Enviar mensaje con media
    this.app.post('/send/media', async (req, res) => {
      try {
        const result = await this.sendMedia(req.body)
        res.json({ success: true, data: result })
      } catch (error) {
        res.status(400).json({ success: false, error: error.message })
      }
    })

    // Enviar mensaje interactivo (botones/lista)
    this.app.post('/send/interactive', async (req, res) => {
      try {
        const result = await this.sendInteractive(req.body)
        res.json({ success: true, data: result })
      } catch (error) {
        res.status(400).json({ success: false, error: error.message })
      }
    })

    // Envío masivo
    this.app.post('/bulk', async (req, res) => {
      try {
        const { messages, delayMs = 1000 } = req.body
        const jobId = await this.enqueueBulk(messages, delayMs)
        res.json({ success: true, data: { jobId, queued: messages.length } })
      } catch (error) {
        res.status(400).json({ success: false, error: error.message })
      }
    })

    // Marcar como leído
    this.app.post('/mark-read', async (req, res) => {
      try {
        const { messageId } = req.body
        await this.markAsRead(messageId)
        res.json({ success: true })
      } catch (error) {
        res.status(400).json({ success: false, error: error.message })
      }
    })

    // Enviar reacción
    this.app.post('/react', async (req, res) => {
      try {
        const { messageId, emoji, to } = req.body
        await this.sendReaction(to, messageId, emoji)
        res.json({ success: true })
      } catch (error) {
        res.status(400).json({ success: false, error: error.message })
      }
    })

    // Obtener templates
    this.app.get('/templates', async (req, res) => {
      try {
        const templates = await this.getTemplates()
        res.json({ success: true, data: templates })
      } catch (error) {
        res.status(400).json({ success: false, error: error.message })
      }
    })

    // Obtener conversaciones
    this.app.get('/conversations', (req, res) => {
      const conversations = Array.from(this.conversations.values())
      res.json({ success: true, data: conversations })
    })

    // Obtener conversación específica
    this.app.get('/conversations/:phone', (req, res) => {
      const { phone } = req.params
      const conversation = this.conversations.get(phone)
      if (conversation) {
        res.json({ success: true, data: conversation })
      } else {
        res.status(404).json({ success: false, error: 'Conversation not found' })
      }
    })

    // Historial de mensajes
    this.app.get('/history', (req, res) => {
      const { limit = 100 } = req.query
      res.json({
        success: true,
        data: this.messageHistory.slice(-parseInt(limit))
      })
    })

    // Estado de la cola
    this.app.get('/queue/status', (req, res) => {
      res.json({
        success: true,
        data: {
          pending: this.messageQueue.length,
          processing: this.processingQueue
        }
      })
    })
  }

  /**
   * Manejar webhook de WhatsApp
   */
  handleWebhook(payload) {
    const entry = payload.entry?.[0]
    if (!entry) return

    const changes = entry.changes?.[0]
    if (!changes) return

    const value = changes.value

    // Mensajes recibidos
    if (value.messages) {
      value.messages.forEach(message => {
        this.handleIncomingMessage(message, value.contacts?.[0])
      })
    }

    // Estados de mensajes enviados
    if (value.statuses) {
      value.statuses.forEach(status => {
        this.handleMessageStatus(status)
      })
    }
  }

  /**
   * Manejar mensaje entrante
   */
  handleIncomingMessage(message, contact) {
    const phone = message.from
    const messageData = {
      id: message.id,
      from: phone,
      contactName: contact?.profile?.name || phone,
      type: message.type,
      timestamp: new Date(parseInt(message.timestamp) * 1000).toISOString(),
      content: this.extractMessageContent(message)
    }

    // Actualizar conversación
    this.updateConversation(phone, messageData, 'received')

    // Guardar en historial
    this.messageHistory.push(messageData)

    // Emitir evento para listeners
    this.emit('message', messageData)

    // Notificar via Socket
    this.io?.to('whatsapp').emit('new-message', messageData)

    this.log('info', `Message received from ${phone}: ${messageData.content?.text || messageData.type}`)
  }

  /**
   * Extraer contenido del mensaje según tipo
   */
  extractMessageContent(message) {
    switch (message.type) {
      case 'text':
        return { text: message.text?.body }

      case 'image':
        return {
          type: 'image',
          id: message.image?.id,
          caption: message.image?.caption,
          mimeType: message.image?.mime_type
        }

      case 'audio':
        return {
          type: 'audio',
          id: message.audio?.id,
          mimeType: message.audio?.mime_type
        }

      case 'video':
        return {
          type: 'video',
          id: message.video?.id,
          caption: message.video?.caption,
          mimeType: message.video?.mime_type
        }

      case 'document':
        return {
          type: 'document',
          id: message.document?.id,
          filename: message.document?.filename,
          mimeType: message.document?.mime_type
        }

      case 'location':
        return {
          type: 'location',
          latitude: message.location?.latitude,
          longitude: message.location?.longitude,
          name: message.location?.name,
          address: message.location?.address
        }

      case 'contacts':
        return {
          type: 'contacts',
          contacts: message.contacts
        }

      case 'button':
        return {
          type: 'button_reply',
          buttonId: message.button?.payload,
          text: message.button?.text
        }

      case 'interactive':
        if (message.interactive?.type === 'button_reply') {
          return {
            type: 'button_reply',
            buttonId: message.interactive.button_reply?.id,
            text: message.interactive.button_reply?.title
          }
        } else if (message.interactive?.type === 'list_reply') {
          return {
            type: 'list_reply',
            listId: message.interactive.list_reply?.id,
            title: message.interactive.list_reply?.title,
            description: message.interactive.list_reply?.description
          }
        }
        break

      default:
        return { type: message.type, raw: message }
    }
  }

  /**
   * Manejar estado de mensaje
   */
  handleMessageStatus(status) {
    const statusData = {
      messageId: status.id,
      recipientId: status.recipient_id,
      status: status.status, // sent, delivered, read, failed
      timestamp: new Date(parseInt(status.timestamp) * 1000).toISOString(),
      errors: status.errors
    }

    // Actualizar mensaje en conversación
    const conversation = this.conversations.get(status.recipient_id)
    if (conversation) {
      const message = conversation.messages.find(m => m.id === status.id)
      if (message) {
        message.status = status.status
      }
    }

    // Emitir evento
    this.emit('status', statusData)
    this.io?.to('whatsapp').emit('message-status', statusData)

    this.log('debug', `Message ${status.id} status: ${status.status}`)
  }

  /**
   * Actualizar conversación
   */
  updateConversation(phone, message, direction) {
    let conversation = this.conversations.get(phone)

    if (!conversation) {
      conversation = {
        phone,
        contactName: message.contactName || phone,
        messages: [],
        lastMessage: null,
        unreadCount: 0,
        createdAt: new Date().toISOString()
      }
    }

    message.direction = direction
    conversation.messages.push(message)
    conversation.lastMessage = message
    conversation.updatedAt = new Date().toISOString()

    if (direction === 'received') {
      conversation.unreadCount++
    }

    this.conversations.set(phone, conversation)
  }

  /**
   * Enviar mensaje de texto
   */
  async sendMessage({ to, text, previewUrl = false }) {
    const payload = {
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      to: this.formatPhoneNumber(to),
      type: 'text',
      text: {
        preview_url: previewUrl,
        body: text
      }
    }

    const response = await this.waClient.post(
      `/${this.waConfig.phoneNumberId}/messages`,
      payload
    )

    const messageData = {
      id: response.data.messages[0].id,
      to,
      type: 'text',
      content: { text },
      timestamp: new Date().toISOString(),
      status: 'sent'
    }

    this.updateConversation(to, messageData, 'sent')
    this.messageHistory.push(messageData)

    return messageData
  }

  /**
   * Enviar mensaje con template
   */
  async sendTemplate({ to, templateName, language = 'es', components = [] }) {
    const payload = {
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      to: this.formatPhoneNumber(to),
      type: 'template',
      template: {
        name: templateName,
        language: { code: language },
        components
      }
    }

    const response = await this.waClient.post(
      `/${this.waConfig.phoneNumberId}/messages`,
      payload
    )

    const messageData = {
      id: response.data.messages[0].id,
      to,
      type: 'template',
      templateName,
      timestamp: new Date().toISOString(),
      status: 'sent'
    }

    this.updateConversation(to, messageData, 'sent')
    this.messageHistory.push(messageData)

    return messageData
  }

  /**
   * Enviar mensaje con media
   */
  async sendMedia({ to, type, mediaUrl, mediaId, caption }) {
    const mediaPayload = mediaId
      ? { id: mediaId }
      : { link: mediaUrl }

    if (caption && ['image', 'video', 'document'].includes(type)) {
      mediaPayload.caption = caption
    }

    const payload = {
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      to: this.formatPhoneNumber(to),
      type,
      [type]: mediaPayload
    }

    const response = await this.waClient.post(
      `/${this.waConfig.phoneNumberId}/messages`,
      payload
    )

    const messageData = {
      id: response.data.messages[0].id,
      to,
      type,
      mediaUrl,
      caption,
      timestamp: new Date().toISOString(),
      status: 'sent'
    }

    this.updateConversation(to, messageData, 'sent')
    this.messageHistory.push(messageData)

    return messageData
  }

  /**
   * Enviar mensaje interactivo
   */
  async sendInteractive({ to, type, header, body, footer, action }) {
    const interactive = { type }

    if (header) interactive.header = header
    if (body) interactive.body = { text: body }
    if (footer) interactive.footer = { text: footer }
    interactive.action = action

    const payload = {
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      to: this.formatPhoneNumber(to),
      type: 'interactive',
      interactive
    }

    const response = await this.waClient.post(
      `/${this.waConfig.phoneNumberId}/messages`,
      payload
    )

    const messageData = {
      id: response.data.messages[0].id,
      to,
      type: 'interactive',
      interactiveType: type,
      body,
      timestamp: new Date().toISOString(),
      status: 'sent'
    }

    this.updateConversation(to, messageData, 'sent')
    this.messageHistory.push(messageData)

    return messageData
  }

  /**
   * Marcar mensaje como leído
   */
  async markAsRead(messageId) {
    await this.waClient.post(`/${this.waConfig.phoneNumberId}/messages`, {
      messaging_product: 'whatsapp',
      status: 'read',
      message_id: messageId
    })
  }

  /**
   * Enviar reacción
   */
  async sendReaction(to, messageId, emoji) {
    await this.waClient.post(`/${this.waConfig.phoneNumberId}/messages`, {
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      to: this.formatPhoneNumber(to),
      type: 'reaction',
      reaction: {
        message_id: messageId,
        emoji
      }
    })
  }

  /**
   * Obtener templates aprobados
   */
  async getTemplates() {
    const response = await this.waClient.get(
      `/${this.waConfig.businessAccountId}/message_templates`
    )
    return response.data.data
  }

  /**
   * Encolar envío masivo
   */
  async enqueueBulk(messages, delayMs) {
    const jobId = `bulk-${Date.now()}`

    messages.forEach((msg, index) => {
      this.messageQueue.push({
        ...msg,
        jobId,
        index,
        scheduledTime: Date.now() + (index * delayMs)
      })
    })

    // Iniciar procesamiento si no está activo
    if (!this.processingQueue) {
      this.processQueue()
    }

    return jobId
  }

  /**
   * Procesar cola de mensajes
   */
  async processQueue() {
    this.processingQueue = true

    while (this.messageQueue.length > 0) {
      const msg = this.messageQueue.shift()

      // Esperar hasta el tiempo programado
      const waitTime = msg.scheduledTime - Date.now()
      if (waitTime > 0) {
        await this.sleep(waitTime)
      }

      try {
        await this.sendMessage(msg)
        this.log('info', `Bulk message sent to ${msg.to}`)
      } catch (error) {
        this.log('error', `Failed to send bulk message to ${msg.to}: ${error.message}`)
      }
    }

    this.processingQueue = false
  }

  /**
   * Formatear número de teléfono
   */
  formatPhoneNumber(phone) {
    // Remover caracteres no numéricos excepto +
    let formatted = phone.replace(/[^\d+]/g, '')

    // Agregar código de país si no está
    if (!formatted.startsWith('+') && !formatted.startsWith('52')) {
      formatted = '52' + formatted // México por defecto
    }

    // Remover el + si existe
    formatted = formatted.replace('+', '')

    return formatted
  }

  /**
   * Helper para esperar
   */
  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  /**
   * Ejecutar acción (para integración con orquestador)
   */
  async execute(action, params) {
    switch (action) {
      case 'send':
      case 'send-text':
        return await this.sendMessage(params)

      case 'send-template':
        return await this.sendTemplate(params)

      case 'send-media':
        return await this.sendMedia(params)

      case 'send-interactive':
        return await this.sendInteractive(params)

      case 'mark-read':
        return await this.markAsRead(params.messageId)

      case 'react':
        return await this.sendReaction(params.to, params.messageId, params.emoji)

      case 'bulk':
        return await this.enqueueBulk(params.messages, params.delayMs)

      case 'get-templates':
        return await this.getTemplates()

      case 'get-conversations':
        return Array.from(this.conversations.values())

      case 'get-conversation':
        return this.conversations.get(params.phone)

      default:
        throw new Error(`Unknown action: ${action}`)
    }
  }

  /**
   * Handler de conexión Socket
   */
  onSocketConnection(socket) {
    // Unirse a sala de WhatsApp
    socket.on('join-whatsapp', () => {
      socket.join('whatsapp')
      this.log('info', `Client ${socket.id} joined WhatsApp room`)
    })

    // Enviar mensaje via socket
    socket.on('send-message', async (data, callback) => {
      try {
        const result = await this.sendMessage(data)
        callback({ success: true, data: result })
      } catch (error) {
        callback({ success: false, error: error.message })
      }
    })

    // Obtener conversaciones
    socket.on('get-conversations', (_, callback) => {
      callback({
        success: true,
        data: Array.from(this.conversations.values())
      })
    })
  }

  /**
   * Hook de inicio
   */
  async onStart() {
    this.log('info', 'WhatsApp Business Agent started')

    if (!this.waConfig.accessToken) {
      this.log('warn', 'WhatsApp access token not configured')
    } else {
      this.log('info', 'WhatsApp Business API connected')
    }
  }
}

export default WhatsAppAgent

// Si se ejecuta directamente
const isMainModule = process.argv[1]?.includes('WhatsAppAgent')
if (isMainModule) {
  const agent = new WhatsAppAgent({
    port: parseInt(process.env.WA_AGENT_PORT) || 4301,
    phoneNumberId: process.env.WA_PHONE_NUMBER_ID,
    accessToken: process.env.WA_ACCESS_TOKEN,
    businessAccountId: process.env.WA_BUSINESS_ACCOUNT_ID
  })

  agent.start().catch(console.error)

  // Graceful shutdown
  process.on('SIGINT', async () => {
    console.log('\nShutting down WhatsApp Agent...')
    await agent.stop()
    process.exit(0)
  })
}
