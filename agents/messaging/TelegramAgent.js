/**
 * ALQVIMIA RPA 2.0 - Telegram Bot Agent
 * Agente autónomo para integración con Telegram Bot API
 */

import BaseAgent from '../core/BaseAgent.js'
import axios from 'axios'

class TelegramAgent extends BaseAgent {
  constructor(config = {}) {
    super({
      id: config.id || 'agent-telegram',
      name: 'Telegram Bot Agent',
      version: '1.8.0',
      port: config.port || 4302,
      category: 'messaging',
      ...config
    })

    this.telegramConfig = {
      botToken: config.botToken || process.env.TELEGRAM_BOT_TOKEN,
      webhookUrl: config.webhookUrl || process.env.TELEGRAM_WEBHOOK_URL,
      defaultChatId: config.defaultChatId || process.env.TELEGRAM_CHAT_ID
    }

    this.apiUrl = `https://api.telegram.org/bot${this.telegramConfig.botToken}`

    this.conversations = new Map()
    this.messageHistory = []
    this.commands = new Map()
    this.pollingActive = false

    this.setupTelegramRoutes()
  }

  getCapabilities() {
    return ['messages', 'commands', 'inline', 'keyboards', 'media', 'groups', 'channels', 'polls', 'payments']
  }

  getConfig() {
    return {
      ...super.getConfig(),
      telegram: {
        configured: !!this.telegramConfig.botToken,
        webhookSet: !!this.telegramConfig.webhookUrl,
        polling: this.pollingActive
      }
    }
  }

  setupTelegramRoutes() {
    // Webhook endpoint
    this.app.post('/webhook', async (req, res) => {
      try {
        await this.handleUpdate(req.body)
        res.json({ ok: true })
      } catch (error) {
        this.log('error', `Webhook error: ${error.message}`)
        res.status(500).json({ ok: false })
      }
    })

    // Send message
    this.app.post('/send', async (req, res) => {
      try {
        const result = await this.sendMessage(req.body)
        res.json({ success: true, data: result })
      } catch (error) {
        res.status(400).json({ success: false, error: error.message })
      }
    })

    // Send photo
    this.app.post('/send/photo', async (req, res) => {
      try {
        const result = await this.sendPhoto(req.body)
        res.json({ success: true, data: result })
      } catch (error) {
        res.status(400).json({ success: false, error: error.message })
      }
    })

    // Send document
    this.app.post('/send/document', async (req, res) => {
      try {
        const result = await this.sendDocument(req.body)
        res.json({ success: true, data: result })
      } catch (error) {
        res.status(400).json({ success: false, error: error.message })
      }
    })

    // Send with inline keyboard
    this.app.post('/send/keyboard', async (req, res) => {
      try {
        const result = await this.sendWithKeyboard(req.body)
        res.json({ success: true, data: result })
      } catch (error) {
        res.status(400).json({ success: false, error: error.message })
      }
    })

    // Edit message
    this.app.post('/edit', async (req, res) => {
      try {
        const result = await this.editMessage(req.body)
        res.json({ success: true, data: result })
      } catch (error) {
        res.status(400).json({ success: false, error: error.message })
      }
    })

    // Delete message
    this.app.post('/delete', async (req, res) => {
      try {
        const result = await this.deleteMessage(req.body)
        res.json({ success: true, data: result })
      } catch (error) {
        res.status(400).json({ success: false, error: error.message })
      }
    })

    // Answer callback query
    this.app.post('/answer-callback', async (req, res) => {
      try {
        const result = await this.answerCallbackQuery(req.body)
        res.json({ success: true, data: result })
      } catch (error) {
        res.status(400).json({ success: false, error: error.message })
      }
    })

    // Get chat info
    this.app.get('/chat/:chatId', async (req, res) => {
      try {
        const result = await this.getChat(req.params.chatId)
        res.json({ success: true, data: result })
      } catch (error) {
        res.status(400).json({ success: false, error: error.message })
      }
    })

    // Get bot info
    this.app.get('/me', async (req, res) => {
      try {
        const result = await this.getMe()
        res.json({ success: true, data: result })
      } catch (error) {
        res.status(400).json({ success: false, error: error.message })
      }
    })

    // Set webhook
    this.app.post('/webhook/set', async (req, res) => {
      try {
        const { url } = req.body
        const result = await this.setWebhook(url)
        res.json({ success: true, data: result })
      } catch (error) {
        res.status(400).json({ success: false, error: error.message })
      }
    })

    // Delete webhook
    this.app.post('/webhook/delete', async (req, res) => {
      try {
        const result = await this.deleteWebhook()
        res.json({ success: true, data: result })
      } catch (error) {
        res.status(400).json({ success: false, error: error.message })
      }
    })

    // Start polling
    this.app.post('/polling/start', async (req, res) => {
      try {
        this.startPolling()
        res.json({ success: true, message: 'Polling started' })
      } catch (error) {
        res.status(400).json({ success: false, error: error.message })
      }
    })

    // Stop polling
    this.app.post('/polling/stop', (req, res) => {
      this.stopPolling()
      res.json({ success: true, message: 'Polling stopped' })
    })

    // Register command
    this.app.post('/command/register', (req, res) => {
      const { command, description } = req.body
      this.commands.set(command, description)
      res.json({ success: true })
    })

    // Get conversations
    this.app.get('/conversations', (req, res) => {
      res.json({
        success: true,
        data: Array.from(this.conversations.values())
      })
    })

    // Get message history
    this.app.get('/history', (req, res) => {
      const { limit = 100 } = req.query
      res.json({
        success: true,
        data: this.messageHistory.slice(-parseInt(limit))
      })
    })
  }

  async onStart() {
    if (!this.telegramConfig.botToken) {
      this.log('warn', 'Telegram bot token not configured')
      return
    }

    try {
      const me = await this.getMe()
      this.log('info', `Telegram bot connected: @${me.username}`)

      // Set webhook if URL configured, otherwise start polling
      if (this.telegramConfig.webhookUrl) {
        await this.setWebhook(this.telegramConfig.webhookUrl)
        this.log('info', 'Webhook set')
      }
    } catch (error) {
      this.log('error', `Failed to connect: ${error.message}`)
    }
  }

  async onStop() {
    this.stopPolling()
  }

  // API Methods
  async callApi(method, params = {}) {
    const response = await axios.post(`${this.apiUrl}/${method}`, params)
    if (!response.data.ok) {
      throw new Error(response.data.description || 'Telegram API error')
    }
    return response.data.result
  }

  async getMe() {
    return await this.callApi('getMe')
  }

  async sendMessage({ chatId, text, parseMode = 'HTML', disablePreview = false, replyTo }) {
    const params = {
      chat_id: chatId || this.telegramConfig.defaultChatId,
      text,
      parse_mode: parseMode,
      disable_web_page_preview: disablePreview
    }
    if (replyTo) params.reply_to_message_id = replyTo

    const result = await this.callApi('sendMessage', params)
    this.messageHistory.push({
      type: 'sent',
      chatId: params.chat_id,
      text,
      messageId: result.message_id,
      timestamp: new Date().toISOString()
    })
    return result
  }

  async sendPhoto({ chatId, photo, caption, parseMode = 'HTML' }) {
    return await this.callApi('sendPhoto', {
      chat_id: chatId || this.telegramConfig.defaultChatId,
      photo,
      caption,
      parse_mode: parseMode
    })
  }

  async sendDocument({ chatId, document, caption, parseMode = 'HTML' }) {
    return await this.callApi('sendDocument', {
      chat_id: chatId || this.telegramConfig.defaultChatId,
      document,
      caption,
      parse_mode: parseMode
    })
  }

  async sendWithKeyboard({ chatId, text, keyboard, inline = true, parseMode = 'HTML' }) {
    const replyMarkup = inline
      ? { inline_keyboard: keyboard }
      : { keyboard, resize_keyboard: true, one_time_keyboard: true }

    return await this.callApi('sendMessage', {
      chat_id: chatId || this.telegramConfig.defaultChatId,
      text,
      parse_mode: parseMode,
      reply_markup: replyMarkup
    })
  }

  async editMessage({ chatId, messageId, text, parseMode = 'HTML', keyboard }) {
    const params = {
      chat_id: chatId,
      message_id: messageId,
      text,
      parse_mode: parseMode
    }
    if (keyboard) params.reply_markup = { inline_keyboard: keyboard }

    return await this.callApi('editMessageText', params)
  }

  async deleteMessage({ chatId, messageId }) {
    return await this.callApi('deleteMessage', {
      chat_id: chatId,
      message_id: messageId
    })
  }

  async answerCallbackQuery({ callbackQueryId, text, showAlert = false }) {
    return await this.callApi('answerCallbackQuery', {
      callback_query_id: callbackQueryId,
      text,
      show_alert: showAlert
    })
  }

  async getChat(chatId) {
    return await this.callApi('getChat', { chat_id: chatId })
  }

  async setWebhook(url) {
    return await this.callApi('setWebhook', { url })
  }

  async deleteWebhook() {
    return await this.callApi('deleteWebhook')
  }

  // Handle incoming updates
  async handleUpdate(update) {
    if (update.message) {
      await this.handleMessage(update.message)
    } else if (update.callback_query) {
      await this.handleCallbackQuery(update.callback_query)
    } else if (update.inline_query) {
      await this.handleInlineQuery(update.inline_query)
    }
  }

  async handleMessage(message) {
    const chatId = message.chat.id
    const text = message.text || ''
    const from = message.from

    // Update conversation
    this.updateConversation(chatId, message)

    // Store in history
    this.messageHistory.push({
      type: 'received',
      chatId,
      text,
      from: from.username || from.first_name,
      messageId: message.message_id,
      timestamp: new Date().toISOString()
    })

    // Emit event
    this.emit('message', message)
    this.io?.to('telegram').emit('new-message', message)

    // Check for commands
    if (text.startsWith('/')) {
      const [command, ...args] = text.slice(1).split(' ')
      this.emit('command', { command, args, message })
    }

    this.log('info', `Message from ${from.username || from.id}: ${text.substring(0, 50)}`)
  }

  async handleCallbackQuery(callbackQuery) {
    this.emit('callback', callbackQuery)
    this.io?.to('telegram').emit('callback-query', callbackQuery)
  }

  async handleInlineQuery(inlineQuery) {
    this.emit('inline', inlineQuery)
  }

  updateConversation(chatId, message) {
    let conversation = this.conversations.get(chatId)

    if (!conversation) {
      conversation = {
        chatId,
        type: message.chat.type,
        title: message.chat.title || message.from.username || message.from.first_name,
        messages: [],
        lastMessage: null,
        createdAt: new Date().toISOString()
      }
    }

    conversation.messages.push(message)
    conversation.lastMessage = message
    conversation.updatedAt = new Date().toISOString()

    this.conversations.set(chatId, conversation)
  }

  // Polling
  startPolling() {
    if (this.pollingActive) return
    this.pollingActive = true
    this.pollUpdates(0)
  }

  stopPolling() {
    this.pollingActive = false
  }

  async pollUpdates(offset) {
    if (!this.pollingActive) return

    try {
      const updates = await this.callApi('getUpdates', {
        offset,
        timeout: 30,
        allowed_updates: ['message', 'callback_query', 'inline_query']
      })

      for (const update of updates) {
        await this.handleUpdate(update)
        offset = update.update_id + 1
      }
    } catch (error) {
      this.log('error', `Polling error: ${error.message}`)
    }

    setTimeout(() => this.pollUpdates(offset), 100)
  }

  async execute(action, params) {
    switch (action) {
      case 'send': return await this.sendMessage(params)
      case 'send-photo': return await this.sendPhoto(params)
      case 'send-document': return await this.sendDocument(params)
      case 'send-keyboard': return await this.sendWithKeyboard(params)
      case 'edit': return await this.editMessage(params)
      case 'delete': return await this.deleteMessage(params)
      case 'answer-callback': return await this.answerCallbackQuery(params)
      case 'get-chat': return await this.getChat(params.chatId)
      case 'get-me': return await this.getMe()
      case 'get-conversations': return Array.from(this.conversations.values())
      default: throw new Error(`Unknown action: ${action}`)
    }
  }

  onSocketConnection(socket) {
    socket.on('join-telegram', () => {
      socket.join('telegram')
      this.log('info', `Client ${socket.id} joined Telegram room`)
    })

    socket.on('send-message', async (data, callback) => {
      try {
        const result = await this.sendMessage(data)
        callback({ success: true, data: result })
      } catch (error) {
        callback({ success: false, error: error.message })
      }
    })
  }
}

export default TelegramAgent

const isMainModule = process.argv[1]?.includes('TelegramAgent')
if (isMainModule) {
  const agent = new TelegramAgent({
    botToken: process.env.TELEGRAM_BOT_TOKEN,
    webhookUrl: process.env.TELEGRAM_WEBHOOK_URL
  })

  agent.start().catch(console.error)

  process.on('SIGINT', async () => {
    console.log('\nShutting down...')
    await agent.stop()
    process.exit(0)
  })
}
