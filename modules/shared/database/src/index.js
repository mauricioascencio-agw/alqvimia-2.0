/**
 * ALQVIMIA Database Service - Client Library
 *
 * This module provides a client library for other services to interact
 * with the centralized database service.
 */

const postgres = require('./connections/postgres')
const redis = require('./connections/redis')

module.exports = {
  postgres,
  redis,

  // Convenience methods for direct usage
  query: (sql, params, tenantId) => postgres.query(sql, params, tenantId),
  transaction: (queries, tenantId) => postgres.transaction(queries, tenantId),

  cache: {
    get: (key) => redis.get(key),
    set: (key, value, ttl) => redis.set(key, value, ttl),
    del: (key) => redis.del(key),
    delPattern: (pattern) => redis.delPattern(pattern)
  },

  pubsub: {
    publish: (channel, message) => redis.publish(channel, message),
    subscribe: (channel, callback) => redis.subscribe(channel, callback),
    unsubscribe: (channel) => redis.unsubscribe(channel)
  },

  lock: {
    acquire: (key, ttl) => redis.acquireLock(key, ttl),
    release: (key, value) => redis.releaseLock(key, value)
  },

  rateLimit: (key, limit, window) => redis.rateLimit(key, limit, window)
}
