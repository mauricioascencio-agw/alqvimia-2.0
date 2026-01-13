/**
 * ALQVIMIA RPA 2.0 - REST API Agent
 * Agente autónomo para consumo de APIs REST con OAuth, rate limiting y cache
 */

import BaseAgent from '../core/BaseAgent.js'
import axios from 'axios'

class RESTAPIAgent extends BaseAgent {
  constructor(config = {}) {
    super({
      id: config.id || 'agent-rest',
      name: 'REST API Agent',
      version: '2.0.0',
      port: config.port || 4201,
      category: 'api',
      ...config
    })

    // Cliente HTTP base
    this.httpClient = axios.create({
      timeout: config.timeout || 30000,
      maxRedirects: 5
    })

    // Cache para respuestas
    this.cache = new Map()
    this.cacheConfig = {
      enabled: config.cacheEnabled !== false,
      ttl: config.cacheTTL || 300000, // 5 minutos por defecto
      maxSize: config.cacheMaxSize || 100
    }

    // Rate limiting
    this.rateLimits = new Map()
    this.requestQueue = []

    // Credenciales guardadas
    this.credentials = new Map()

    // Historial de requests
    this.requestHistory = []

    // Configurar rutas específicas
    this.setupAPIRoutes()
  }

  /**
   * Obtener capacidades del agente
   */
  getCapabilities() {
    return [
      'http-client',
      'oauth',
      'oauth2',
      'api-key',
      'basic-auth',
      'bearer-token',
      'webhooks',
      'rate-limit',
      'cache',
      'retry',
      'collections'
    ]
  }

  /**
   * Obtener configuración
   */
  getConfig() {
    return {
      ...super.getConfig(),
      cache: {
        enabled: this.cacheConfig.enabled,
        ttl: this.cacheConfig.ttl,
        size: this.cache.size
      },
      credentials: Array.from(this.credentials.keys())
    }
  }

  /**
   * Configurar rutas HTTP del agente
   */
  setupAPIRoutes() {
    // Ejecutar request HTTP
    this.app.post('/request', async (req, res) => {
      try {
        const result = await this.executeRequest(req.body)
        res.json({ success: true, data: result })
      } catch (error) {
        res.status(400).json({ success: false, error: error.message })
      }
    })

    // Request con colección (batch)
    this.app.post('/batch', async (req, res) => {
      try {
        const { requests, sequential = false } = req.body
        const results = await this.executeBatch(requests, sequential)
        res.json({ success: true, data: results })
      } catch (error) {
        res.status(400).json({ success: false, error: error.message })
      }
    })

    // Gestión de credenciales
    this.app.get('/credentials', (req, res) => {
      const creds = Array.from(this.credentials.entries()).map(([name, cred]) => ({
        name,
        type: cred.type,
        createdAt: cred.createdAt
      }))
      res.json({ success: true, data: creds })
    })

    this.app.post('/credentials', (req, res) => {
      try {
        const { name, ...credential } = req.body
        this.saveCredential(name, credential)
        res.json({ success: true, message: `Credential '${name}' saved` })
      } catch (error) {
        res.status(400).json({ success: false, error: error.message })
      }
    })

    this.app.delete('/credentials/:name', (req, res) => {
      const { name } = req.params
      if (this.credentials.delete(name)) {
        res.json({ success: true, message: `Credential '${name}' deleted` })
      } else {
        res.status(404).json({ success: false, error: 'Credential not found' })
      }
    })

    // Gestión de cache
    this.app.get('/cache/stats', (req, res) => {
      res.json({
        success: true,
        data: {
          enabled: this.cacheConfig.enabled,
          ttl: this.cacheConfig.ttl,
          size: this.cache.size,
          maxSize: this.cacheConfig.maxSize
        }
      })
    })

    this.app.post('/cache/clear', (req, res) => {
      this.cache.clear()
      res.json({ success: true, message: 'Cache cleared' })
    })

    // Historial de requests
    this.app.get('/history', (req, res) => {
      const { limit = 50 } = req.query
      res.json({
        success: true,
        data: this.requestHistory.slice(-parseInt(limit))
      })
    })

    // Test de conexión a una API
    this.app.post('/test', async (req, res) => {
      try {
        const { url, method = 'GET', headers } = req.body
        const response = await this.httpClient.request({
          url,
          method,
          headers,
          timeout: 5000
        })
        res.json({
          success: true,
          data: {
            status: response.status,
            statusText: response.statusText,
            headers: response.headers,
            latency: response.config.metadata?.duration
          }
        })
      } catch (error) {
        res.status(400).json({
          success: false,
          error: error.message,
          code: error.code
        })
      }
    })

    // OAuth2 flow
    this.app.post('/oauth2/token', async (req, res) => {
      try {
        const token = await this.getOAuth2Token(req.body)
        res.json({ success: true, data: token })
      } catch (error) {
        res.status(400).json({ success: false, error: error.message })
      }
    })

    // Webhooks endpoint
    this.app.post('/webhook/:id', async (req, res) => {
      const { id } = req.params
      this.log('info', `Webhook received: ${id}`)
      this.emit('webhook', { id, body: req.body, headers: req.headers })
      res.json({ success: true, received: true })
    })
  }

  /**
   * Ejecutar un request HTTP
   */
  async executeRequest(options) {
    const {
      url,
      method = 'GET',
      headers = {},
      body,
      params,
      auth,
      useCache = true,
      retries = 0,
      retryDelay = 1000
    } = options

    // Generar cache key
    const cacheKey = this.generateCacheKey(url, method, params, body)

    // Verificar cache (solo para GET)
    if (method === 'GET' && useCache && this.cacheConfig.enabled) {
      const cached = this.getFromCache(cacheKey)
      if (cached) {
        return { ...cached, fromCache: true }
      }
    }

    // Aplicar autenticación
    const authHeaders = await this.applyAuth(auth)
    const finalHeaders = { ...headers, ...authHeaders }

    const startTime = Date.now()
    let lastError = null

    // Retry loop
    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        const response = await this.httpClient.request({
          url,
          method,
          headers: finalHeaders,
          data: body,
          params
        })

        const duration = Date.now() - startTime

        const result = {
          status: response.status,
          statusText: response.statusText,
          headers: response.headers,
          data: response.data,
          duration: `${duration}ms`,
          fromCache: false
        }

        // Guardar en cache (solo GET exitosos)
        if (method === 'GET' && useCache && this.cacheConfig.enabled && response.status === 200) {
          this.saveToCache(cacheKey, result)
        }

        // Guardar en historial
        this.addToHistory({
          url,
          method,
          status: response.status,
          duration,
          timestamp: new Date().toISOString()
        })

        return result
      } catch (error) {
        lastError = error

        // Si no hay más reintentos, lanzar el error
        if (attempt === retries) {
          this.addToHistory({
            url,
            method,
            status: error.response?.status || 0,
            error: error.message,
            timestamp: new Date().toISOString()
          })
          throw error
        }

        // Esperar antes del siguiente intento
        await this.sleep(retryDelay * (attempt + 1))
        this.log('warn', `Retry ${attempt + 1}/${retries} for ${url}`)
      }
    }

    throw lastError
  }

  /**
   * Ejecutar múltiples requests
   */
  async executeBatch(requests, sequential = false) {
    if (sequential) {
      const results = []
      for (const req of requests) {
        try {
          const result = await this.executeRequest(req)
          results.push({ success: true, data: result })
        } catch (error) {
          results.push({ success: false, error: error.message })
        }
      }
      return results
    } else {
      // Paralelo
      return Promise.all(
        requests.map(async (req) => {
          try {
            const result = await this.executeRequest(req)
            return { success: true, data: result }
          } catch (error) {
            return { success: false, error: error.message }
          }
        })
      )
    }
  }

  /**
   * Aplicar autenticación al request
   */
  async applyAuth(auth) {
    if (!auth) return {}

    const headers = {}

    switch (auth.type) {
      case 'basic':
        const credentials = Buffer.from(`${auth.username}:${auth.password}`).toString('base64')
        headers['Authorization'] = `Basic ${credentials}`
        break

      case 'bearer':
        headers['Authorization'] = `Bearer ${auth.token}`
        break

      case 'api-key':
        if (auth.in === 'header') {
          headers[auth.name || 'X-API-Key'] = auth.value
        }
        break

      case 'oauth2':
        // Usar token guardado o solicitar nuevo
        const token = await this.getOAuth2Token(auth)
        headers['Authorization'] = `Bearer ${token.access_token}`
        break

      case 'credential':
        // Usar credencial guardada
        const savedCred = this.credentials.get(auth.name)
        if (savedCred) {
          return this.applyAuth(savedCred)
        }
        break
    }

    return headers
  }

  /**
   * Obtener token OAuth2
   */
  async getOAuth2Token(config) {
    const {
      tokenUrl,
      clientId,
      clientSecret,
      grantType = 'client_credentials',
      scope,
      username,
      password,
      refreshToken
    } = config

    const params = new URLSearchParams()
    params.append('grant_type', grantType)
    params.append('client_id', clientId)

    if (clientSecret) {
      params.append('client_secret', clientSecret)
    }

    if (scope) {
      params.append('scope', scope)
    }

    if (grantType === 'password') {
      params.append('username', username)
      params.append('password', password)
    }

    if (grantType === 'refresh_token') {
      params.append('refresh_token', refreshToken)
    }

    const response = await this.httpClient.post(tokenUrl, params.toString(), {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    })

    return response.data
  }

  /**
   * Guardar credencial
   */
  saveCredential(name, credential) {
    this.credentials.set(name, {
      ...credential,
      createdAt: new Date().toISOString()
    })
    this.log('info', `Credential '${name}' saved`)
  }

  /**
   * Generar clave de cache
   */
  generateCacheKey(url, method, params, body) {
    return JSON.stringify({ url, method, params, body })
  }

  /**
   * Obtener del cache
   */
  getFromCache(key) {
    const cached = this.cache.get(key)
    if (!cached) return null

    // Verificar TTL
    if (Date.now() - cached.timestamp > this.cacheConfig.ttl) {
      this.cache.delete(key)
      return null
    }

    return cached.data
  }

  /**
   * Guardar en cache
   */
  saveToCache(key, data) {
    // Verificar límite de tamaño
    if (this.cache.size >= this.cacheConfig.maxSize) {
      // Eliminar el más antiguo
      const firstKey = this.cache.keys().next().value
      this.cache.delete(firstKey)
    }

    this.cache.set(key, {
      data,
      timestamp: Date.now()
    })
  }

  /**
   * Agregar al historial
   */
  addToHistory(entry) {
    this.requestHistory.push(entry)

    // Limitar historial a 500 entries
    if (this.requestHistory.length > 500) {
      this.requestHistory = this.requestHistory.slice(-500)
    }
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
      case 'request':
        return await this.executeRequest(params)

      case 'batch':
        return await this.executeBatch(params.requests, params.sequential)

      case 'get':
        return await this.executeRequest({ ...params, method: 'GET' })

      case 'post':
        return await this.executeRequest({ ...params, method: 'POST' })

      case 'put':
        return await this.executeRequest({ ...params, method: 'PUT' })

      case 'delete':
        return await this.executeRequest({ ...params, method: 'DELETE' })

      case 'patch':
        return await this.executeRequest({ ...params, method: 'PATCH' })

      case 'oauth2-token':
        return await this.getOAuth2Token(params)

      case 'save-credential':
        this.saveCredential(params.name, params.credential)
        return { success: true }

      case 'clear-cache':
        this.cache.clear()
        return { success: true, message: 'Cache cleared' }

      default:
        throw new Error(`Unknown action: ${action}`)
    }
  }

  /**
   * Handler de conexión Socket
   */
  onSocketConnection(socket) {
    // Request en tiempo real
    socket.on('request', async (data, callback) => {
      try {
        const result = await this.executeRequest(data)
        callback({ success: true, data: result })
      } catch (error) {
        callback({ success: false, error: error.message })
      }
    })

    // Escuchar webhooks
    socket.on('subscribe-webhooks', (webhookIds) => {
      webhookIds.forEach(id => {
        socket.join(`webhook:${id}`)
      })
      this.log('info', `Client ${socket.id} subscribed to webhooks: ${webhookIds.join(', ')}`)
    })
  }

  /**
   * Hook de inicio
   */
  async onStart() {
    this.log('info', 'REST API Agent started')

    // Configurar interceptor para medir tiempo
    this.httpClient.interceptors.request.use((config) => {
      config.metadata = { startTime: Date.now() }
      return config
    })

    this.httpClient.interceptors.response.use((response) => {
      response.config.metadata.duration = Date.now() - response.config.metadata.startTime
      return response
    })
  }
}

export default RESTAPIAgent

// Si se ejecuta directamente
const isMainModule = process.argv[1]?.includes('RESTAPIAgent')
if (isMainModule) {
  const agent = new RESTAPIAgent({
    port: parseInt(process.env.REST_AGENT_PORT) || 4201
  })

  agent.start().catch(console.error)

  // Graceful shutdown
  process.on('SIGINT', async () => {
    console.log('\nShutting down REST API Agent...')
    await agent.stop()
    process.exit(0)
  })
}
