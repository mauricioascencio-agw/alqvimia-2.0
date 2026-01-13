/**
 * Service Registry for API Gateway
 *
 * Manages service discovery, health checks, and load balancing
 */

class ServiceRegistry {
  constructor() {
    this.services = new Map()
    this.healthStatus = new Map()

    // Start health check interval
    this.startHealthChecks()
  }

  /**
   * Register a service
   */
  register(name, url, options = {}) {
    this.services.set(name, {
      name,
      url,
      weight: options.weight || 1,
      timeout: options.timeout || 30000,
      retries: options.retries || 3,
      circuitBreaker: {
        failures: 0,
        threshold: options.failureThreshold || 5,
        resetTimeout: options.resetTimeout || 60000,
        isOpen: false,
        openedAt: null
      },
      registeredAt: new Date().toISOString()
    })

    this.healthStatus.set(name, {
      status: 'unknown',
      lastCheck: null,
      responseTime: null
    })

    console.log(`Service registered: ${name} -> ${url}`)
  }

  /**
   * Unregister a service
   */
  unregister(name) {
    this.services.delete(name)
    this.healthStatus.delete(name)
    console.log(`Service unregistered: ${name}`)
  }

  /**
   * Get service by name
   */
  get(name) {
    return this.services.get(name)
  }

  /**
   * Get service URL
   */
  getUrl(name) {
    const service = this.services.get(name)
    return service?.url
  }

  /**
   * List all services
   */
  list() {
    const services = []
    this.services.forEach((service, name) => {
      const health = this.healthStatus.get(name)
      services.push({
        name,
        url: service.url,
        status: health?.status || 'unknown',
        lastCheck: health?.lastCheck,
        responseTime: health?.responseTime,
        circuitBreaker: service.circuitBreaker.isOpen ? 'open' : 'closed'
      })
    })
    return services
  }

  /**
   * Check health of a service
   */
  async healthCheck(name) {
    const service = this.services.get(name)
    if (!service) {
      return { status: 'not_found' }
    }

    const start = Date.now()

    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 5000)

      const response = await fetch(`${service.url}/health`, {
        signal: controller.signal
      })

      clearTimeout(timeoutId)

      const responseTime = Date.now() - start
      const isHealthy = response.ok

      this.healthStatus.set(name, {
        status: isHealthy ? 'healthy' : 'unhealthy',
        lastCheck: new Date().toISOString(),
        responseTime,
        statusCode: response.status
      })

      // Reset circuit breaker on success
      if (isHealthy && service.circuitBreaker.isOpen) {
        this.resetCircuitBreaker(name)
      }

      return {
        status: isHealthy ? 'healthy' : 'unhealthy',
        responseTime,
        statusCode: response.status
      }
    } catch (error) {
      const responseTime = Date.now() - start

      this.healthStatus.set(name, {
        status: 'unhealthy',
        lastCheck: new Date().toISOString(),
        responseTime,
        error: error.message
      })

      // Record failure for circuit breaker
      this.recordFailure(name)

      return {
        status: 'unhealthy',
        responseTime,
        error: error.message
      }
    }
  }

  /**
   * Check health of all services
   */
  async healthCheckAll() {
    const results = {}

    for (const [name] of this.services) {
      results[name] = await this.healthCheck(name)
    }

    return results
  }

  /**
   * Start periodic health checks
   */
  startHealthChecks(intervalMs = 30000) {
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval)
    }

    this.healthCheckInterval = setInterval(async () => {
      for (const [name] of this.services) {
        await this.healthCheck(name)
      }
    }, intervalMs)
  }

  /**
   * Stop health checks
   */
  stopHealthChecks() {
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval)
      this.healthCheckInterval = null
    }
  }

  /**
   * Record a failure for circuit breaker
   */
  recordFailure(name) {
    const service = this.services.get(name)
    if (!service) return

    service.circuitBreaker.failures++

    if (service.circuitBreaker.failures >= service.circuitBreaker.threshold) {
      this.openCircuitBreaker(name)
    }
  }

  /**
   * Open circuit breaker
   */
  openCircuitBreaker(name) {
    const service = this.services.get(name)
    if (!service) return

    service.circuitBreaker.isOpen = true
    service.circuitBreaker.openedAt = Date.now()

    console.warn(`Circuit breaker opened for service: ${name}`)

    // Schedule reset
    setTimeout(() => {
      this.halfOpenCircuitBreaker(name)
    }, service.circuitBreaker.resetTimeout)
  }

  /**
   * Half-open circuit breaker (allow one request to test)
   */
  halfOpenCircuitBreaker(name) {
    const service = this.services.get(name)
    if (!service) return

    console.log(`Circuit breaker half-open for service: ${name}`)

    // Try health check
    this.healthCheck(name).then(result => {
      if (result.status === 'healthy') {
        this.resetCircuitBreaker(name)
      } else {
        this.openCircuitBreaker(name)
      }
    })
  }

  /**
   * Reset circuit breaker
   */
  resetCircuitBreaker(name) {
    const service = this.services.get(name)
    if (!service) return

    service.circuitBreaker.failures = 0
    service.circuitBreaker.isOpen = false
    service.circuitBreaker.openedAt = null

    console.log(`Circuit breaker reset for service: ${name}`)
  }

  /**
   * Check if request can be made (circuit breaker check)
   */
  canRequest(name) {
    const service = this.services.get(name)
    if (!service) return false

    return !service.circuitBreaker.isOpen
  }

  /**
   * Get healthy services for load balancing
   */
  getHealthyServices() {
    const healthy = []

    this.services.forEach((service, name) => {
      const health = this.healthStatus.get(name)
      if (health?.status === 'healthy' && !service.circuitBreaker.isOpen) {
        healthy.push({ name, ...service })
      }
    })

    return healthy
  }
}

// Singleton instance
module.exports = new ServiceRegistry()
