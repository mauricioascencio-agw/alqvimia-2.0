/**
 * ALQVIMIA RPA 2.0 - Claude AI Agent
 * Agente autónomo para integración con Anthropic Claude
 */

import BaseAgent from '../core/BaseAgent.js'
import Anthropic from '@anthropic-ai/sdk'

class ClaudeAgent extends BaseAgent {
  constructor(config = {}) {
    super({
      id: config.id || 'agent-claude',
      name: 'Claude AI Agent',
      version: '2.0.0',
      port: config.port || 4402,
      category: 'ai',
      ...config
    })

    this.claudeConfig = {
      apiKey: config.apiKey || process.env.ANTHROPIC_API_KEY,
      model: config.model || 'claude-3-5-sonnet-20241022',
      maxTokens: config.maxTokens || 4096,
      temperature: config.temperature || 0.7
    }

    this.client = this.claudeConfig.apiKey
      ? new Anthropic({ apiKey: this.claudeConfig.apiKey })
      : null

    this.conversationHistory = new Map()
    this.usageStats = { inputTokens: 0, outputTokens: 0, requests: 0 }

    this.setupClaudeRoutes()
  }

  getCapabilities() {
    return ['chat', 'completion', 'vision', 'tools', 'streaming', 'system-prompts']
  }

  getConfig() {
    return {
      ...super.getConfig(),
      claude: {
        model: this.claudeConfig.model,
        maxTokens: this.claudeConfig.maxTokens,
        temperature: this.claudeConfig.temperature,
        configured: !!this.claudeConfig.apiKey
      },
      usage: this.usageStats
    }
  }

  setupClaudeRoutes() {
    // Simple message
    this.app.post('/message', async (req, res) => {
      try {
        const result = await this.sendMessage(req.body)
        res.json({ success: true, data: result })
      } catch (error) {
        res.status(400).json({ success: false, error: error.message })
      }
    })

    // Chat with conversation history
    this.app.post('/chat/:conversationId', async (req, res) => {
      try {
        const result = await this.chatWithHistory(req.params.conversationId, req.body)
        res.json({ success: true, data: result })
      } catch (error) {
        res.status(400).json({ success: false, error: error.message })
      }
    })

    // Vision (image analysis)
    this.app.post('/vision', async (req, res) => {
      try {
        const result = await this.analyzeImage(req.body)
        res.json({ success: true, data: result })
      } catch (error) {
        res.status(400).json({ success: false, error: error.message })
      }
    })

    // Tool use
    this.app.post('/tools', async (req, res) => {
      try {
        const result = await this.messageWithTools(req.body)
        res.json({ success: true, data: result })
      } catch (error) {
        res.status(400).json({ success: false, error: error.message })
      }
    })

    // Streaming endpoint
    this.app.post('/stream', async (req, res) => {
      try {
        res.setHeader('Content-Type', 'text/event-stream')
        res.setHeader('Cache-Control', 'no-cache')
        res.setHeader('Connection', 'keep-alive')

        await this.streamMessage(req.body, (chunk) => {
          res.write(`data: ${JSON.stringify(chunk)}\n\n`)
        })

        res.write('data: [DONE]\n\n')
        res.end()
      } catch (error) {
        res.write(`data: ${JSON.stringify({ error: error.message })}\n\n`)
        res.end()
      }
    })

    // Get conversation history
    this.app.get('/conversations/:id', (req, res) => {
      const history = this.conversationHistory.get(req.params.id)
      if (history) {
        res.json({ success: true, data: history })
      } else {
        res.status(404).json({ success: false, error: 'Conversation not found' })
      }
    })

    // Clear conversation
    this.app.delete('/conversations/:id', (req, res) => {
      this.conversationHistory.delete(req.params.id)
      res.json({ success: true })
    })

    // List available models
    this.app.get('/models', (req, res) => {
      res.json({
        success: true,
        data: [
          { id: 'claude-3-5-sonnet-20241022', name: 'Claude 3.5 Sonnet', contextWindow: 200000 },
          { id: 'claude-3-5-haiku-20241022', name: 'Claude 3.5 Haiku', contextWindow: 200000 },
          { id: 'claude-3-opus-20240229', name: 'Claude 3 Opus', contextWindow: 200000 },
          { id: 'claude-3-sonnet-20240229', name: 'Claude 3 Sonnet', contextWindow: 200000 },
          { id: 'claude-3-haiku-20240307', name: 'Claude 3 Haiku', contextWindow: 200000 }
        ]
      })
    })

    // Usage stats
    this.app.get('/usage', (req, res) => {
      res.json({ success: true, data: this.usageStats })
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
    if (!this.claudeConfig.apiKey) {
      this.log('warn', 'Anthropic API key not configured')
      return
    }

    try {
      // Test connection with a simple message
      await this.client.messages.create({
        model: this.claudeConfig.model,
        max_tokens: 10,
        messages: [{ role: 'user', content: 'Hi' }]
      })
      this.log('info', `Claude agent connected. Model: ${this.claudeConfig.model}`)
    } catch (error) {
      this.log('error', `Failed to connect: ${error.message}`)
    }
  }

  async testConnection(config) {
    const testClient = new Anthropic({ apiKey: config.apiKey })
    await testClient.messages.create({
      model: config.model || 'claude-3-5-sonnet-20241022',
      max_tokens: 10,
      messages: [{ role: 'user', content: 'Hi' }]
    })
  }

  // Send a single message
  async sendMessage({ message, systemPrompt, model, maxTokens, temperature }) {
    const response = await this.client.messages.create({
      model: model || this.claudeConfig.model,
      max_tokens: maxTokens || this.claudeConfig.maxTokens,
      temperature: temperature ?? this.claudeConfig.temperature,
      ...(systemPrompt && { system: systemPrompt }),
      messages: [{ role: 'user', content: message }]
    })

    this.updateUsage(response.usage)

    return {
      content: response.content[0].text,
      model: response.model,
      stopReason: response.stop_reason,
      usage: response.usage
    }
  }

  // Chat with conversation history
  async chatWithHistory(conversationId, { message, systemPrompt, ...options }) {
    let history = this.conversationHistory.get(conversationId)

    if (!history) {
      history = {
        id: conversationId,
        messages: [],
        systemPrompt: systemPrompt,
        createdAt: new Date().toISOString()
      }
    }

    history.messages.push({ role: 'user', content: message })

    const response = await this.client.messages.create({
      model: options.model || this.claudeConfig.model,
      max_tokens: options.maxTokens || this.claudeConfig.maxTokens,
      temperature: options.temperature ?? this.claudeConfig.temperature,
      ...(history.systemPrompt && { system: history.systemPrompt }),
      messages: history.messages
    })

    this.updateUsage(response.usage)

    const assistantMessage = response.content[0].text
    history.messages.push({ role: 'assistant', content: assistantMessage })
    history.updatedAt = new Date().toISOString()

    this.conversationHistory.set(conversationId, history)

    return {
      response: assistantMessage,
      conversationId,
      usage: response.usage
    }
  }

  // Analyze image with vision
  async analyzeImage({ imageUrl, imageBase64, mediaType = 'image/jpeg', prompt, model, maxTokens }) {
    const imageContent = imageUrl
      ? { type: 'image', source: { type: 'url', url: imageUrl } }
      : { type: 'image', source: { type: 'base64', media_type: mediaType, data: imageBase64 } }

    const response = await this.client.messages.create({
      model: model || this.claudeConfig.model,
      max_tokens: maxTokens || this.claudeConfig.maxTokens,
      messages: [{
        role: 'user',
        content: [
          imageContent,
          { type: 'text', text: prompt }
        ]
      }]
    })

    this.updateUsage(response.usage)

    return {
      analysis: response.content[0].text,
      usage: response.usage
    }
  }

  // Message with tool use
  async messageWithTools({ message, systemPrompt, tools, model, maxTokens }) {
    const response = await this.client.messages.create({
      model: model || this.claudeConfig.model,
      max_tokens: maxTokens || this.claudeConfig.maxTokens,
      ...(systemPrompt && { system: systemPrompt }),
      tools,
      messages: [{ role: 'user', content: message }]
    })

    this.updateUsage(response.usage)

    // Extract tool calls if any
    const toolCalls = response.content.filter(block => block.type === 'tool_use')
    const textContent = response.content.filter(block => block.type === 'text')

    return {
      content: textContent.map(t => t.text).join('\n'),
      toolCalls: toolCalls.map(tc => ({
        id: tc.id,
        name: tc.name,
        input: tc.input
      })),
      stopReason: response.stop_reason,
      usage: response.usage
    }
  }

  // Continue after tool result
  async continueWithToolResult({ conversationMessages, toolResults, systemPrompt, tools, model, maxTokens }) {
    // Add tool results to messages
    const messages = [
      ...conversationMessages,
      {
        role: 'user',
        content: toolResults.map(tr => ({
          type: 'tool_result',
          tool_use_id: tr.toolUseId,
          content: tr.result
        }))
      }
    ]

    const response = await this.client.messages.create({
      model: model || this.claudeConfig.model,
      max_tokens: maxTokens || this.claudeConfig.maxTokens,
      ...(systemPrompt && { system: systemPrompt }),
      ...(tools && { tools }),
      messages
    })

    this.updateUsage(response.usage)

    return {
      content: response.content.filter(b => b.type === 'text').map(t => t.text).join('\n'),
      toolCalls: response.content.filter(b => b.type === 'tool_use'),
      stopReason: response.stop_reason,
      usage: response.usage
    }
  }

  // Stream message
  async streamMessage({ message, systemPrompt, model, maxTokens, temperature }, onChunk) {
    const stream = await this.client.messages.stream({
      model: model || this.claudeConfig.model,
      max_tokens: maxTokens || this.claudeConfig.maxTokens,
      temperature: temperature ?? this.claudeConfig.temperature,
      ...(systemPrompt && { system: systemPrompt }),
      messages: [{ role: 'user', content: message }]
    })

    for await (const event of stream) {
      if (event.type === 'content_block_delta' && event.delta.type === 'text_delta') {
        onChunk({ type: 'text', text: event.delta.text })
      } else if (event.type === 'message_stop') {
        const finalMessage = await stream.finalMessage()
        this.updateUsage(finalMessage.usage)
        onChunk({ type: 'done', usage: finalMessage.usage })
      }
    }
  }

  updateUsage(usage) {
    if (usage) {
      this.usageStats.inputTokens += usage.input_tokens || 0
      this.usageStats.outputTokens += usage.output_tokens || 0
      this.usageStats.requests++
    }
  }

  async execute(action, params) {
    switch (action) {
      case 'message': return await this.sendMessage(params)
      case 'chat': return await this.chatWithHistory(params.conversationId, params)
      case 'vision': return await this.analyzeImage(params)
      case 'tools': return await this.messageWithTools(params)
      case 'continue-tools': return await this.continueWithToolResult(params)
      default: throw new Error(`Unknown action: ${action}`)
    }
  }

  onSocketConnection(socket) {
    socket.on('message', async (data, callback) => {
      try {
        const result = await this.sendMessage(data)
        callback({ success: true, data: result })
      } catch (error) {
        callback({ success: false, error: error.message })
      }
    })

    socket.on('stream', async (data) => {
      try {
        await this.streamMessage(data, (chunk) => {
          socket.emit('stream-chunk', chunk)
        })
      } catch (error) {
        socket.emit('stream-error', { error: error.message })
      }
    })

    socket.on('chat', async (data, callback) => {
      try {
        const result = await this.chatWithHistory(data.conversationId, data)
        callback({ success: true, data: result })
      } catch (error) {
        callback({ success: false, error: error.message })
      }
    })
  }
}

export default ClaudeAgent

const isMainModule = process.argv[1]?.includes('ClaudeAgent')
if (isMainModule) {
  const agent = new ClaudeAgent({
    apiKey: process.env.ANTHROPIC_API_KEY,
    model: process.env.CLAUDE_MODEL || 'claude-3-5-sonnet-20241022'
  })

  agent.start().catch(console.error)

  process.on('SIGINT', async () => {
    console.log('\nShutting down...')
    await agent.stop()
    process.exit(0)
  })
}
