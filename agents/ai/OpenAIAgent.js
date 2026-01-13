/**
 * ALQVIMIA RPA 2.0 - OpenAI GPT Agent
 * Agente autónomo para integración con OpenAI (GPT, DALL-E, Whisper, Embeddings)
 */

import BaseAgent from '../core/BaseAgent.js'
import axios from 'axios'

class OpenAIAgent extends BaseAgent {
  constructor(config = {}) {
    super({
      id: config.id || 'agent-openai',
      name: 'OpenAI GPT Agent',
      version: '2.0.0',
      port: config.port || 4401,
      category: 'ai',
      ...config
    })

    this.openaiConfig = {
      apiKey: config.apiKey || process.env.OPENAI_API_KEY,
      organization: config.organization || process.env.OPENAI_ORG,
      model: config.model || 'gpt-4o',
      maxTokens: config.maxTokens || 4096,
      temperature: config.temperature || 0.7
    }

    this.client = axios.create({
      baseURL: 'https://api.openai.com/v1',
      headers: {
        'Authorization': `Bearer ${this.openaiConfig.apiKey}`,
        'Content-Type': 'application/json',
        ...(this.openaiConfig.organization && { 'OpenAI-Organization': this.openaiConfig.organization })
      }
    })

    this.conversationHistory = new Map()
    this.usageStats = { tokens: 0, requests: 0 }

    this.setupOpenAIRoutes()
  }

  getCapabilities() {
    return ['chat', 'completion', 'embeddings', 'images', 'speech', 'vision', 'functions', 'assistants']
  }

  getConfig() {
    return {
      ...super.getConfig(),
      openai: {
        model: this.openaiConfig.model,
        maxTokens: this.openaiConfig.maxTokens,
        temperature: this.openaiConfig.temperature,
        configured: !!this.openaiConfig.apiKey
      },
      usage: this.usageStats
    }
  }

  setupOpenAIRoutes() {
    // Chat completion
    this.app.post('/chat', async (req, res) => {
      try {
        const result = await this.chat(req.body)
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

    // Completion (legacy)
    this.app.post('/completion', async (req, res) => {
      try {
        const result = await this.completion(req.body)
        res.json({ success: true, data: result })
      } catch (error) {
        res.status(400).json({ success: false, error: error.message })
      }
    })

    // Embeddings
    this.app.post('/embeddings', async (req, res) => {
      try {
        const result = await this.createEmbeddings(req.body)
        res.json({ success: true, data: result })
      } catch (error) {
        res.status(400).json({ success: false, error: error.message })
      }
    })

    // Image generation (DALL-E)
    this.app.post('/images/generate', async (req, res) => {
      try {
        const result = await this.generateImage(req.body)
        res.json({ success: true, data: result })
      } catch (error) {
        res.status(400).json({ success: false, error: error.message })
      }
    })

    // Image edit
    this.app.post('/images/edit', async (req, res) => {
      try {
        const result = await this.editImage(req.body)
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

    // Text to speech
    this.app.post('/speech', async (req, res) => {
      try {
        const result = await this.textToSpeech(req.body)
        res.set('Content-Type', 'audio/mpeg')
        res.send(result)
      } catch (error) {
        res.status(400).json({ success: false, error: error.message })
      }
    })

    // Speech to text (Whisper)
    this.app.post('/transcribe', async (req, res) => {
      try {
        const result = await this.transcribe(req.body)
        res.json({ success: true, data: result })
      } catch (error) {
        res.status(400).json({ success: false, error: error.message })
      }
    })

    // List models
    this.app.get('/models', async (req, res) => {
      try {
        const result = await this.listModels()
        res.json({ success: true, data: result })
      } catch (error) {
        res.status(400).json({ success: false, error: error.message })
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

    // Usage stats
    this.app.get('/usage', (req, res) => {
      res.json({ success: true, data: this.usageStats })
    })
  }

  async onStart() {
    if (!this.openaiConfig.apiKey) {
      this.log('warn', 'OpenAI API key not configured')
      return
    }

    try {
      const models = await this.listModels()
      this.log('info', `OpenAI agent connected. ${models.length} models available`)
    } catch (error) {
      this.log('error', `Failed to connect: ${error.message}`)
    }
  }

  // Chat completion
  async chat({ messages, model, maxTokens, temperature, functions, functionCall, stream = false }) {
    const response = await this.client.post('/chat/completions', {
      model: model || this.openaiConfig.model,
      messages,
      max_tokens: maxTokens || this.openaiConfig.maxTokens,
      temperature: temperature ?? this.openaiConfig.temperature,
      ...(functions && { functions }),
      ...(functionCall && { function_call: functionCall }),
      stream
    })

    this.updateUsage(response.data.usage)

    return {
      message: response.data.choices[0].message,
      usage: response.data.usage,
      finishReason: response.data.choices[0].finish_reason
    }
  }

  // Chat with conversation history
  async chatWithHistory(conversationId, { message, systemPrompt, ...options }) {
    let history = this.conversationHistory.get(conversationId)

    if (!history) {
      history = {
        id: conversationId,
        messages: [],
        createdAt: new Date().toISOString()
      }
      if (systemPrompt) {
        history.messages.push({ role: 'system', content: systemPrompt })
      }
    }

    history.messages.push({ role: 'user', content: message })

    const result = await this.chat({ messages: history.messages, ...options })

    history.messages.push(result.message)
    history.updatedAt = new Date().toISOString()

    this.conversationHistory.set(conversationId, history)

    return {
      response: result.message.content,
      conversationId,
      usage: result.usage
    }
  }

  // Legacy completion
  async completion({ prompt, model = 'gpt-3.5-turbo-instruct', maxTokens, temperature }) {
    const response = await this.client.post('/completions', {
      model,
      prompt,
      max_tokens: maxTokens || this.openaiConfig.maxTokens,
      temperature: temperature ?? this.openaiConfig.temperature
    })

    this.updateUsage(response.data.usage)

    return {
      text: response.data.choices[0].text,
      usage: response.data.usage
    }
  }

  // Create embeddings
  async createEmbeddings({ input, model = 'text-embedding-3-small' }) {
    const response = await this.client.post('/embeddings', {
      model,
      input: Array.isArray(input) ? input : [input]
    })

    this.updateUsage(response.data.usage)

    return {
      embeddings: response.data.data.map(d => d.embedding),
      model: response.data.model,
      usage: response.data.usage
    }
  }

  // Generate image with DALL-E
  async generateImage({ prompt, model = 'dall-e-3', size = '1024x1024', quality = 'standard', n = 1 }) {
    const response = await this.client.post('/images/generations', {
      model,
      prompt,
      size,
      quality,
      n
    })

    this.usageStats.requests++

    return {
      images: response.data.data.map(img => ({
        url: img.url,
        revisedPrompt: img.revised_prompt
      }))
    }
  }

  // Edit image
  async editImage({ image, mask, prompt, size = '1024x1024', n = 1 }) {
    const formData = new FormData()
    formData.append('image', image)
    if (mask) formData.append('mask', mask)
    formData.append('prompt', prompt)
    formData.append('size', size)
    formData.append('n', n)

    const response = await this.client.post('/images/edits', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })

    return { images: response.data.data }
  }

  // Analyze image with vision
  async analyzeImage({ imageUrl, imageBase64, prompt, model = 'gpt-4o', maxTokens = 500 }) {
    const imageContent = imageUrl
      ? { type: 'image_url', image_url: { url: imageUrl } }
      : { type: 'image_url', image_url: { url: `data:image/jpeg;base64,${imageBase64}` } }

    const response = await this.client.post('/chat/completions', {
      model,
      messages: [
        {
          role: 'user',
          content: [
            { type: 'text', text: prompt },
            imageContent
          ]
        }
      ],
      max_tokens: maxTokens
    })

    this.updateUsage(response.data.usage)

    return {
      analysis: response.data.choices[0].message.content,
      usage: response.data.usage
    }
  }

  // Text to speech
  async textToSpeech({ text, voice = 'alloy', model = 'tts-1', speed = 1.0 }) {
    const response = await this.client.post('/audio/speech', {
      model,
      input: text,
      voice,
      speed
    }, { responseType: 'arraybuffer' })

    this.usageStats.requests++

    return Buffer.from(response.data)
  }

  // Speech to text (Whisper)
  async transcribe({ audioUrl, audioBase64, language, prompt }) {
    const formData = new FormData()

    if (audioBase64) {
      const buffer = Buffer.from(audioBase64, 'base64')
      formData.append('file', buffer, 'audio.mp3')
    }

    formData.append('model', 'whisper-1')
    if (language) formData.append('language', language)
    if (prompt) formData.append('prompt', prompt)

    const response = await this.client.post('/audio/transcriptions', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })

    this.usageStats.requests++

    return { text: response.data.text }
  }

  // List available models
  async listModels() {
    const response = await this.client.get('/models')
    return response.data.data
      .filter(m => m.id.startsWith('gpt') || m.id.includes('dall-e') || m.id.includes('whisper') || m.id.includes('embedding'))
      .map(m => ({ id: m.id, created: m.created, ownedBy: m.owned_by }))
  }

  updateUsage(usage) {
    if (usage) {
      this.usageStats.tokens += usage.total_tokens || 0
      this.usageStats.requests++
    }
  }

  async execute(action, params) {
    switch (action) {
      case 'chat': return await this.chat(params)
      case 'chat-history': return await this.chatWithHistory(params.conversationId, params)
      case 'completion': return await this.completion(params)
      case 'embeddings': return await this.createEmbeddings(params)
      case 'generate-image': return await this.generateImage(params)
      case 'vision': return await this.analyzeImage(params)
      case 'speech': return await this.textToSpeech(params)
      case 'transcribe': return await this.transcribe(params)
      case 'models': return await this.listModels()
      default: throw new Error(`Unknown action: ${action}`)
    }
  }

  onSocketConnection(socket) {
    socket.on('chat', async (data, callback) => {
      try {
        const result = await this.chat(data)
        callback({ success: true, data: result })
      } catch (error) {
        callback({ success: false, error: error.message })
      }
    })

    socket.on('chat-stream', async (data) => {
      try {
        // For streaming, we'd use SSE or chunked responses
        const result = await this.chat({ ...data, stream: false })
        socket.emit('chat-response', result)
      } catch (error) {
        socket.emit('chat-error', { error: error.message })
      }
    })
  }
}

export default OpenAIAgent

const isMainModule = process.argv[1]?.includes('OpenAIAgent')
if (isMainModule) {
  const agent = new OpenAIAgent({
    apiKey: process.env.OPENAI_API_KEY,
    organization: process.env.OPENAI_ORG,
    model: process.env.OPENAI_MODEL || 'gpt-4o'
  })

  agent.start().catch(console.error)

  process.on('SIGINT', async () => {
    console.log('\nShutting down...')
    await agent.stop()
    process.exit(0)
  })
}
