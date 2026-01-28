/**
 * ALQVIMIA RPA 2.0 - AI Usage Tracker
 * Servicio para trackear uso de APIs de IA y calcular costos
 */

import * as db from './database.js'
import { decrypt } from './encryption.js'

// Cache de costos por modelo
let modelCostsCache = null
let cacheTimestamp = 0
const CACHE_TTL = 5 * 60 * 1000 // 5 minutos

/**
 * Obtiene la API key desencriptada para un provider específico
 * @param {number} userId - ID del usuario
 * @param {string} provider - Provider de IA (anthropic, openai, etc.)
 * @returns {Promise<{apiKey: string, keyId: number} | null>}
 */
export async function getApiKey(userId, provider = 'anthropic') {
  try {
    const [keyRecord] = await db.query(
      `SELECT id, api_key_encrypted
       FROM api_keys_ia
       WHERE usuario_id = ? AND provider = ? AND activo = TRUE
       LIMIT 1`,
      [userId, provider]
    )

    if (!keyRecord || !keyRecord.api_key_encrypted) {
      return null
    }

    const apiKey = decrypt(keyRecord.api_key_encrypted)

    // Actualizar último uso
    await db.query(
      'UPDATE api_keys_ia SET ultimo_uso = NOW() WHERE id = ?',
      [keyRecord.id]
    )

    return {
      apiKey,
      keyId: keyRecord.id
    }
  } catch (error) {
    console.error('Error obteniendo API key:', error)
    return null
  }
}

/**
 * Obtiene los costos de un modelo específico
 * @param {string} provider - Provider de IA
 * @param {string} model - Nombre del modelo
 * @returns {Promise<{inputCost: number, outputCost: number}>}
 */
async function getModelCosts(provider, model) {
  // Actualizar cache si expiró
  if (!modelCostsCache || Date.now() - cacheTimestamp > CACHE_TTL) {
    const costs = await db.query(
      'SELECT provider, modelo, costo_input_por_millon, costo_output_por_millon FROM costos_modelos_ia WHERE activo = TRUE'
    )
    modelCostsCache = {}
    costs.forEach(c => {
      const key = `${c.provider}:${c.modelo}`
      modelCostsCache[key] = {
        inputCost: parseFloat(c.costo_input_por_millon),
        outputCost: parseFloat(c.costo_output_por_millon)
      }
    })
    cacheTimestamp = Date.now()
  }

  const key = `${provider}:${model}`
  return modelCostsCache[key] || { inputCost: 3.00, outputCost: 15.00 } // Default Claude Sonnet
}

/**
 * Calcula el costo de una llamada a la API
 * @param {string} provider - Provider de IA
 * @param {string} model - Nombre del modelo
 * @param {number} inputTokens - Tokens de entrada
 * @param {number} outputTokens - Tokens de salida
 * @returns {Promise<number>} - Costo en USD
 */
export async function calculateCost(provider, model, inputTokens, outputTokens) {
  const costs = await getModelCosts(provider, model)
  const inputCost = (inputTokens / 1_000_000) * costs.inputCost
  const outputCost = (outputTokens / 1_000_000) * costs.outputCost
  return inputCost + outputCost
}

/**
 * Registra el uso de una llamada a API de IA
 * @param {Object} params - Parámetros del uso
 */
export async function trackUsage({
  userId,
  apiKeyId = null,
  provider,
  model,
  endpoint = null,
  inputTokens = 0,
  outputTokens = 0,
  responseTimeMs = 0,
  status = 'success',
  errorMessage = null,
  metadata = null
}) {
  try {
    const totalTokens = inputTokens + outputTokens
    const cost = await calculateCost(provider, model, inputTokens, outputTokens)

    await db.query(
      `INSERT INTO uso_api_ia
       (usuario_id, api_key_id, provider, modelo, endpoint, tokens_entrada, tokens_salida,
        tokens_total, costo_estimado, tiempo_respuesta_ms, estado, error_mensaje, metadata)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        userId,
        apiKeyId,
        provider,
        model,
        endpoint,
        inputTokens,
        outputTokens,
        totalTokens,
        cost,
        responseTimeMs,
        status,
        errorMessage,
        metadata ? JSON.stringify(metadata) : null
      ]
    )

    console.log(`[AIUsageTracker] Registrado: ${provider}/${model} - ${totalTokens} tokens - $${cost.toFixed(6)}`)

    return {
      tokens: { input: inputTokens, output: outputTokens, total: totalTokens },
      cost
    }
  } catch (error) {
    console.error('Error registrando uso de API:', error)
    return null
  }
}

/**
 * Obtiene el resumen de uso del usuario
 * @param {number} userId - ID del usuario
 * @param {string} period - Período (24h, 7d, 30d)
 * @returns {Promise<Object>}
 */
export async function getUsageSummary(userId, period = '30d') {
  let dateFilter = 'DATE_SUB(NOW(), INTERVAL 30 DAY)'
  if (period === '7d') dateFilter = 'DATE_SUB(NOW(), INTERVAL 7 DAY)'
  else if (period === '24h') dateFilter = 'DATE_SUB(NOW(), INTERVAL 24 HOUR)'

  try {
    const [summary] = await db.query(`
      SELECT
        COUNT(*) as total_requests,
        COALESCE(SUM(tokens_total), 0) as total_tokens,
        COALESCE(SUM(costo_estimado), 0) as total_cost,
        COALESCE(AVG(tiempo_respuesta_ms), 0) as avg_response_time,
        SUM(CASE WHEN estado = 'success' THEN 1 ELSE 0 END) as successful_requests,
        SUM(CASE WHEN estado = 'error' THEN 1 ELSE 0 END) as failed_requests
      FROM uso_api_ia
      WHERE usuario_id = ? AND created_at >= ${dateFilter}
    `, [userId])

    return {
      totalRequests: summary?.total_requests || 0,
      totalTokens: summary?.total_tokens || 0,
      totalCost: parseFloat(summary?.total_cost || 0),
      avgResponseTime: Math.round(summary?.avg_response_time || 0),
      successfulRequests: summary?.successful_requests || 0,
      failedRequests: summary?.failed_requests || 0,
      successRate: summary?.total_requests > 0
        ? ((summary.successful_requests / summary.total_requests) * 100).toFixed(1)
        : 100
    }
  } catch (error) {
    console.error('Error obteniendo resumen de uso:', error)
    return {
      totalRequests: 0,
      totalTokens: 0,
      totalCost: 0,
      avgResponseTime: 0,
      successfulRequests: 0,
      failedRequests: 0,
      successRate: 100
    }
  }
}

/**
 * Verifica si hay una API key configurada
 * @param {number} userId - ID del usuario
 * @param {string} provider - Provider de IA
 * @returns {Promise<boolean>}
 */
export async function hasApiKey(userId, provider = 'anthropic') {
  try {
    const [result] = await db.query(
      'SELECT COUNT(*) as count FROM api_keys_ia WHERE usuario_id = ? AND provider = ? AND activo = TRUE',
      [userId, provider]
    )
    return result?.count > 0
  } catch (error) {
    return false
  }
}

export default {
  getApiKey,
  trackUsage,
  calculateCost,
  getUsageSummary,
  hasApiKey
}
