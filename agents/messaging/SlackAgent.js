/**
 * ALQVIMIA RPA 2.0 - Slack Agent
 * Agente autónomo para integración con Slack
 */

import BaseAgent from '../core/BaseAgent.js'
import { WebClient } from '@slack/web-api'
import { createEventAdapter } from '@slack/events-api'

class SlackAgent extends BaseAgent {
  constructor(config = {}) {
    super({
      id: config.id || 'agent-slack',
      name: 'Slack Agent',
      version: '2.0.0',
      port: config.port || 4304,
      category: 'messaging',
      ...config
    })

    this.slackConfig = {
      botToken: config.botToken || process.env.SLACK_BOT_TOKEN,
      signingSecret: config.signingSecret || process.env.SLACK_SIGNING_SECRET,
      appToken: config.appToken || process.env.SLACK_APP_TOKEN
    }

    this.client = this.slackConfig.botToken
      ? new WebClient(this.slackConfig.botToken)
      : null

    this.eventAdapter = null
    this.messageHandlers = []

    this.setupSlackRoutes()
  }

  getCapabilities() {
    return ['messages', 'channels', 'users', 'files', 'reactions', 'threads', 'blocks', 'modals', 'slash-commands']
  }

  getConfig() {
    return {
      ...super.getConfig(),
      slack: {
        configured: !!this.slackConfig.botToken,
        eventsConfigured: !!this.slackConfig.signingSecret
      }
    }
  }

  setupSlackRoutes() {
    // Send message
    this.app.post('/message', async (req, res) => {
      try {
        const result = await this.sendMessage(req.body)
        res.json({ success: true, data: result })
      } catch (error) {
        res.status(400).json({ success: false, error: error.message })
      }
    })

    // Send message with blocks
    this.app.post('/message/blocks', async (req, res) => {
      try {
        const result = await this.sendBlockMessage(req.body)
        res.json({ success: true, data: result })
      } catch (error) {
        res.status(400).json({ success: false, error: error.message })
      }
    })

    // Reply in thread
    this.app.post('/thread', async (req, res) => {
      try {
        const result = await this.replyInThread(req.body)
        res.json({ success: true, data: result })
      } catch (error) {
        res.status(400).json({ success: false, error: error.message })
      }
    })

    // Update message
    this.app.put('/message', async (req, res) => {
      try {
        const result = await this.updateMessage(req.body)
        res.json({ success: true, data: result })
      } catch (error) {
        res.status(400).json({ success: false, error: error.message })
      }
    })

    // Delete message
    this.app.delete('/message', async (req, res) => {
      try {
        const { channel, ts } = req.body
        await this.deleteMessage(channel, ts)
        res.json({ success: true })
      } catch (error) {
        res.status(400).json({ success: false, error: error.message })
      }
    })

    // List channels
    this.app.get('/channels', async (req, res) => {
      try {
        const { types = 'public_channel,private_channel', limit = 100 } = req.query
        const channels = await this.listChannels({ types, limit: parseInt(limit) })
        res.json({ success: true, data: channels })
      } catch (error) {
        res.status(400).json({ success: false, error: error.message })
      }
    })

    // Get channel info
    this.app.get('/channels/:id', async (req, res) => {
      try {
        const channel = await this.getChannelInfo(req.params.id)
        res.json({ success: true, data: channel })
      } catch (error) {
        res.status(400).json({ success: false, error: error.message })
      }
    })

    // Get channel history
    this.app.get('/channels/:id/history', async (req, res) => {
      try {
        const { limit = 100, oldest, latest } = req.query
        const messages = await this.getChannelHistory(req.params.id, { limit: parseInt(limit), oldest, latest })
        res.json({ success: true, data: messages })
      } catch (error) {
        res.status(400).json({ success: false, error: error.message })
      }
    })

    // List users
    this.app.get('/users', async (req, res) => {
      try {
        const { limit = 100 } = req.query
        const users = await this.listUsers({ limit: parseInt(limit) })
        res.json({ success: true, data: users })
      } catch (error) {
        res.status(400).json({ success: false, error: error.message })
      }
    })

    // Get user info
    this.app.get('/users/:id', async (req, res) => {
      try {
        const user = await this.getUserInfo(req.params.id)
        res.json({ success: true, data: user })
      } catch (error) {
        res.status(400).json({ success: false, error: error.message })
      }
    })

    // Upload file
    this.app.post('/files', async (req, res) => {
      try {
        const result = await this.uploadFile(req.body)
        res.json({ success: true, data: result })
      } catch (error) {
        res.status(400).json({ success: false, error: error.message })
      }
    })

    // Add reaction
    this.app.post('/reactions', async (req, res) => {
      try {
        const { channel, timestamp, name } = req.body
        await this.addReaction(channel, timestamp, name)
        res.json({ success: true })
      } catch (error) {
        res.status(400).json({ success: false, error: error.message })
      }
    })

    // Remove reaction
    this.app.delete('/reactions', async (req, res) => {
      try {
        const { channel, timestamp, name } = req.body
        await this.removeReaction(channel, timestamp, name)
        res.json({ success: true })
      } catch (error) {
        res.status(400).json({ success: false, error: error.message })
      }
    })

    // Open modal
    this.app.post('/modals', async (req, res) => {
      try {
        const result = await this.openModal(req.body)
        res.json({ success: true, data: result })
      } catch (error) {
        res.status(400).json({ success: false, error: error.message })
      }
    })

    // Bot info
    this.app.get('/bot', async (req, res) => {
      try {
        const info = await this.getBotInfo()
        res.json({ success: true, data: info })
      } catch (error) {
        res.status(400).json({ success: false, error: error.message })
      }
    })

    // Slash command handler
    this.app.post('/slash', async (req, res) => {
      try {
        const command = req.body
        this.log('info', `Slash command: ${command.command} ${command.text}`)
        this.io.emit('slash-command', command)
        res.json({ response_type: 'ephemeral', text: 'Command received!' })
      } catch (error) {
        res.status(400).json({ success: false, error: error.message })
      }
    })

    // Events endpoint (for Slack Events API)
    this.app.post('/events', async (req, res) => {
      const { type, challenge, event } = req.body

      // URL verification
      if (type === 'url_verification') {
        return res.json({ challenge })
      }

      // Handle events
      if (type === 'event_callback' && event) {
        this.handleEvent(event)
      }

      res.status(200).end()
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
    if (!this.slackConfig.botToken) {
      this.log('warn', 'Slack bot token not configured')
      return
    }

    try {
      const auth = await this.client.auth.test()
      this.log('info', `Slack connected as ${auth.user} in workspace ${auth.team}`)
    } catch (error) {
      this.log('error', `Failed to connect: ${error.message}`)
    }
  }

  async testConnection(config) {
    const testClient = new WebClient(config.botToken)
    await testClient.auth.test()
  }

  // Message methods
  async sendMessage({ channel, text, attachments, unfurl_links = true, unfurl_media = true }) {
    const result = await this.client.chat.postMessage({
      channel,
      text,
      attachments,
      unfurl_links,
      unfurl_media
    })

    return {
      ok: result.ok,
      channel: result.channel,
      ts: result.ts,
      message: result.message
    }
  }

  async sendBlockMessage({ channel, text, blocks, attachments }) {
    const result = await this.client.chat.postMessage({
      channel,
      text,
      blocks,
      attachments
    })

    return {
      ok: result.ok,
      channel: result.channel,
      ts: result.ts
    }
  }

  async replyInThread({ channel, thread_ts, text, blocks }) {
    const result = await this.client.chat.postMessage({
      channel,
      thread_ts,
      text,
      blocks
    })

    return {
      ok: result.ok,
      channel: result.channel,
      ts: result.ts
    }
  }

  async updateMessage({ channel, ts, text, blocks }) {
    const result = await this.client.chat.update({
      channel,
      ts,
      text,
      blocks
    })

    return {
      ok: result.ok,
      channel: result.channel,
      ts: result.ts
    }
  }

  async deleteMessage(channel, ts) {
    await this.client.chat.delete({ channel, ts })
  }

  // Channel methods
  async listChannels({ types = 'public_channel,private_channel', limit = 100 }) {
    const result = await this.client.conversations.list({ types, limit })
    return result.channels.map(ch => ({
      id: ch.id,
      name: ch.name,
      isPrivate: ch.is_private,
      isArchived: ch.is_archived,
      memberCount: ch.num_members,
      topic: ch.topic?.value,
      purpose: ch.purpose?.value
    }))
  }

  async getChannelInfo(channelId) {
    const result = await this.client.conversations.info({ channel: channelId })
    return result.channel
  }

  async getChannelHistory(channelId, { limit = 100, oldest, latest }) {
    const params = { channel: channelId, limit }
    if (oldest) params.oldest = oldest
    if (latest) params.latest = latest

    const result = await this.client.conversations.history(params)
    return result.messages
  }

  // User methods
  async listUsers({ limit = 100 }) {
    const result = await this.client.users.list({ limit })
    return result.members
      .filter(u => !u.is_bot && !u.deleted)
      .map(u => ({
        id: u.id,
        name: u.name,
        realName: u.real_name,
        displayName: u.profile?.display_name,
        email: u.profile?.email,
        image: u.profile?.image_72,
        isAdmin: u.is_admin
      }))
  }

  async getUserInfo(userId) {
    const result = await this.client.users.info({ user: userId })
    return result.user
  }

  // File methods
  async uploadFile({ channels, content, filename, filetype, title, initial_comment }) {
    const result = await this.client.files.uploadV2({
      channels,
      content,
      filename,
      filetype,
      title,
      initial_comment
    })

    return result.file
  }

  // Reaction methods
  async addReaction(channel, timestamp, name) {
    await this.client.reactions.add({ channel, timestamp, name })
  }

  async removeReaction(channel, timestamp, name) {
    await this.client.reactions.remove({ channel, timestamp, name })
  }

  // Modal methods
  async openModal({ trigger_id, view }) {
    const result = await this.client.views.open({ trigger_id, view })
    return result.view
  }

  // Bot info
  async getBotInfo() {
    const auth = await this.client.auth.test()
    const botInfo = await this.client.bots.info({ bot: auth.bot_id })
    return {
      ...auth,
      bot: botInfo.bot
    }
  }

  // Event handling
  handleEvent(event) {
    this.log('info', `Event received: ${event.type}`)
    this.io.emit('slack-event', event)

    switch (event.type) {
      case 'message':
        if (!event.bot_id) {
          this.messageHandlers.forEach(handler => handler(event))
        }
        break
      case 'app_mention':
        this.io.emit('mention', event)
        break
      case 'reaction_added':
        this.io.emit('reaction', event)
        break
    }
  }

  onMessage(handler) {
    this.messageHandlers.push(handler)
  }

  async execute(action, params) {
    switch (action) {
      case 'send-message': return await this.sendMessage(params)
      case 'send-blocks': return await this.sendBlockMessage(params)
      case 'reply-thread': return await this.replyInThread(params)
      case 'update-message': return await this.updateMessage(params)
      case 'delete-message': return await this.deleteMessage(params.channel, params.ts)
      case 'list-channels': return await this.listChannels(params)
      case 'get-channel': return await this.getChannelInfo(params.channelId)
      case 'channel-history': return await this.getChannelHistory(params.channelId, params)
      case 'list-users': return await this.listUsers(params)
      case 'get-user': return await this.getUserInfo(params.userId)
      case 'upload-file': return await this.uploadFile(params)
      case 'add-reaction': return await this.addReaction(params.channel, params.timestamp, params.name)
      case 'remove-reaction': return await this.removeReaction(params.channel, params.timestamp, params.name)
      case 'open-modal': return await this.openModal(params)
      default: throw new Error(`Unknown action: ${action}`)
    }
  }

  onSocketConnection(socket) {
    socket.on('send-message', async (data, callback) => {
      try {
        const result = await this.sendMessage(data)
        callback({ success: true, data: result })
      } catch (error) {
        callback({ success: false, error: error.message })
      }
    })

    socket.on('list-channels', async (callback) => {
      try {
        const result = await this.listChannels({})
        callback({ success: true, data: result })
      } catch (error) {
        callback({ success: false, error: error.message })
      }
    })
  }
}

export default SlackAgent

const isMainModule = process.argv[1]?.includes('SlackAgent')
if (isMainModule) {
  const agent = new SlackAgent({
    botToken: process.env.SLACK_BOT_TOKEN,
    signingSecret: process.env.SLACK_SIGNING_SECRET
  })

  agent.start().catch(console.error)

  process.on('SIGINT', async () => {
    console.log('\nShutting down...')
    await agent.stop()
    process.exit(0)
  })
}
