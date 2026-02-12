/**
 * ALQVIMIA RPA 2.0 - Rutas de API Keys
 * Gestión de API keys de IA encriptadas
 */

import express from 'express'
import * as db from '../services/database.js'
import { encrypt, decrypt, maskApiKey, validateAnthropicKey, validateOpenAIKey } from '../services/encryption.js'

const router = express.Router()

// Middleware de autenticación simple (obtener usuario del header o sesión)
const authMiddleware = (req, res, next) => {
  // En producción, usar JWT o sesión real
  req.userId = req.headers['x-user-id'] || 1 // Default admin para desarrollo
  next()
}

// =====================================================
// API KEYS
// =====================================================

/**
 * GET /api/api-keys
 * Obtiene todas las API keys del usuario (enmascaradas)
 */
router.get('/', authMiddleware, async (req, res) => {
  try {
    const keys = await db.query(
      `SELECT id, provider, nombre, activo, ultimo_uso, created_at, updated_at,
              SUBSTRING(api_key_encrypted, 1, 20) as key_preview
       FROM api_keys_ia
       WHERE usuario_id = ?
       ORDER BY provider, created_at DESC`,
      [req.userId]
    )

    // Enmascarar las keys para mostrar
    const maskedKeys = keys.map(key => ({
      ...key,
      api_key_masked: key.key_preview ? '••••••••••••••••' : null,
      key_preview: undefined
    }))

    res.json({
      success: true,
      data: maskedKeys
    })
  } catch (error) {
    console.error('Error obteniendo API keys:', error)
    res.status(500).json({
      success: false,
      error: 'Error al obtener API keys'
    })
  }
})

/**
 * GET /api/api-keys/:provider
 * Obtiene la API key activa de un provider específico (enmascarada)
 */
router.get('/:provider', authMiddleware, async (req, res) => {
  try {
    const { provider } = req.params

    const [key] = await db.query(
      `SELECT id, provider, nombre, activo, ultimo_uso, created_at
       FROM api_keys_ia
       WHERE usuario_id = ? AND provider = ? AND activo = TRUE
       LIMIT 1`,
      [req.userId, provider]
    )

    if (!key) {
      return res.json({
        success: true,
        data: null,
        configured: false
      })
    }

    res.json({
      success: true,
      data: {
        ...key,
        api_key_masked: '••••••••••••••••'
      },
      configured: true
    })
  } catch (error) {
    console.error('Error obteniendo API key:', error)
    res.status(500).json({
      success: false,
      error: 'Error al obtener API key'
    })
  }
})

/**
 * POST /api/api-keys
 * Guarda una nueva API key (encriptada)
 */
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { provider, apiKey, nombre = 'Default' } = req.body

    if (!provider || !apiKey) {
      return res.status(400).json({
        success: false,
        error: 'Provider y API key son requeridos'
      })
    }

    // Validar longitud minima (la validacion estricta de formato se hace en test)
    if (apiKey.length < 10) {
      return res.status(400).json({
        success: false,
        error: 'API key demasiado corta. Verifica que sea correcta.'
      })
    }

    // Encriptar la API key
    const encryptedKey = encrypt(apiKey)

    // Desactivar otras keys del mismo provider
    await db.query(
      `UPDATE api_keys_ia SET activo = FALSE
       WHERE usuario_id = ? AND provider = ?`,
      [req.userId, provider]
    )

    // Insertar nueva key
    const result = await db.query(
      `INSERT INTO api_keys_ia (usuario_id, provider, api_key_encrypted, nombre, activo)
       VALUES (?, ?, ?, ?, TRUE)`,
      [req.userId, provider, encryptedKey, nombre]
    )

    res.json({
      success: true,
      message: 'API key guardada correctamente',
      data: {
        id: result.insertId,
        provider,
        nombre,
        api_key_masked: maskApiKey(apiKey)
      }
    })
  } catch (error) {
    console.error('Error guardando API key:', error)
    res.status(500).json({
      success: false,
      error: 'Error al guardar API key'
    })
  }
})

/**
 * PUT /api/api-keys/:id
 * Actualiza una API key
 */
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params
    const { apiKey, nombre, activo } = req.body

    // Verificar que la key pertenece al usuario
    const [existingKey] = await db.query(
      'SELECT id, provider FROM api_keys_ia WHERE id = ? AND usuario_id = ?',
      [id, req.userId]
    )

    if (!existingKey) {
      return res.status(404).json({
        success: false,
        error: 'API key no encontrada'
      })
    }

    const updates = []
    const values = []

    if (apiKey) {
      // Validar formato según provider
      if (existingKey.provider === 'anthropic' && !validateAnthropicKey(apiKey)) {
        return res.status(400).json({
          success: false,
          error: 'Formato de API key de Anthropic inválido'
        })
      }
      updates.push('api_key_encrypted = ?')
      values.push(encrypt(apiKey))
    }

    if (nombre !== undefined) {
      updates.push('nombre = ?')
      values.push(nombre)
    }

    if (activo !== undefined) {
      updates.push('activo = ?')
      values.push(activo)

      // Si se activa, desactivar otras del mismo provider
      if (activo) {
        await db.query(
          `UPDATE api_keys_ia SET activo = FALSE
           WHERE usuario_id = ? AND provider = ? AND id != ?`,
          [req.userId, existingKey.provider, id]
        )
      }
    }

    if (updates.length > 0) {
      values.push(id, req.userId)
      await db.query(
        `UPDATE api_keys_ia SET ${updates.join(', ')} WHERE id = ? AND usuario_id = ?`,
        values
      )
    }

    res.json({
      success: true,
      message: 'API key actualizada correctamente'
    })
  } catch (error) {
    console.error('Error actualizando API key:', error)
    res.status(500).json({
      success: false,
      error: 'Error al actualizar API key'
    })
  }
})

/**
 * DELETE /api/api-keys/:id
 * Elimina una API key
 */
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params

    // Obtener provider antes de eliminar
    const [keyToDelete] = await db.query(
      'SELECT provider, activo FROM api_keys_ia WHERE id = ? AND usuario_id = ?',
      [id, req.userId]
    )

    const result = await db.query(
      'DELETE FROM api_keys_ia WHERE id = ? AND usuario_id = ?',
      [id, req.userId]
    )

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        error: 'API key no encontrada'
      })
    }

    // Si se elimino la key activa, reactivar la mas reciente del mismo provider
    if (keyToDelete?.activo) {
      await db.query(
        `UPDATE api_keys_ia SET activo = TRUE
         WHERE usuario_id = ? AND provider = ?
         ORDER BY created_at DESC LIMIT 1`,
        [req.userId, keyToDelete.provider]
      )
    }

    res.json({
      success: true,
      message: 'API key eliminada correctamente'
    })
  } catch (error) {
    console.error('Error eliminando API key:', error)
    res.status(500).json({
      success: false,
      error: 'Error al eliminar API key'
    })
  }
})

/**
 * POST /api/api-keys/test/:provider
 * Prueba una API key haciendo una llamada mínima
 */
router.post('/test/:provider', authMiddleware, async (req, res) => {
  try {
    const { provider } = req.params
    const { apiKey } = req.body

    if (!apiKey) {
      return res.status(400).json({
        success: false,
        error: 'API key es requerida'
      })
    }

    if (provider === 'anthropic') {
      // Probar la key con Anthropic
      const Anthropic = (await import('@anthropic-ai/sdk')).default
      const client = new Anthropic({ apiKey })

      const startTime = Date.now()
      const response = await client.messages.create({
        model: 'claude-3-haiku-20240307',
        max_tokens: 10,
        messages: [{ role: 'user', content: 'Hi' }]
      })
      const responseTime = Date.now() - startTime

      res.json({
        success: true,
        message: 'API key válida',
        data: {
          model: response.model,
          responseTime,
          tokensUsed: response.usage?.input_tokens + response.usage?.output_tokens || 0
        }
      })
    } else if (provider === 'openai') {
      // TODO: Implementar test para OpenAI
      res.json({
        success: true,
        message: 'Test para OpenAI no implementado aún'
      })
    } else {
      res.status(400).json({
        success: false,
        error: 'Provider no soportado para test'
      })
    }
  } catch (error) {
    console.error('Error probando API key:', error)
    res.status(400).json({
      success: false,
      error: error.message || 'API key inválida o error de conexión'
    })
  }
})

// =====================================================
// USO Y ESTADÍSTICAS
// =====================================================

/**
 * GET /api/api-keys/usage/stats
 * Obtiene estadísticas de uso de APIs
 */
router.get('/usage/stats', authMiddleware, async (req, res) => {
  try {
    const { period = '30d', provider } = req.query

    // Calcular fecha de inicio según período
    let dateFilter = 'DATE_SUB(NOW(), INTERVAL 30 DAY)'
    if (period === '7d') dateFilter = 'DATE_SUB(NOW(), INTERVAL 7 DAY)'
    else if (period === '24h') dateFilter = 'DATE_SUB(NOW(), INTERVAL 24 HOUR)'
    else if (period === '1h') dateFilter = 'DATE_SUB(NOW(), INTERVAL 1 HOUR)'

    // Query base
    let query = `
      SELECT
        provider,
        modelo,
        COUNT(*) as total_llamadas,
        SUM(tokens_entrada) as total_tokens_entrada,
        SUM(tokens_salida) as total_tokens_salida,
        SUM(tokens_total) as total_tokens,
        SUM(costo_estimado) as costo_total,
        AVG(tiempo_respuesta_ms) as tiempo_promedio_ms,
        SUM(CASE WHEN estado = 'success' THEN 1 ELSE 0 END) as llamadas_exitosas,
        SUM(CASE WHEN estado = 'error' THEN 1 ELSE 0 END) as llamadas_error
      FROM uso_api_ia
      WHERE usuario_id = ? AND created_at >= ${dateFilter}
    `
    const params = [req.userId]

    if (provider) {
      query += ' AND provider = ?'
      params.push(provider)
    }

    query += ' GROUP BY provider, modelo ORDER BY costo_total DESC'

    const stats = await db.query(query, params)

    // Obtener totales generales
    const [totals] = await db.query(`
      SELECT
        COUNT(*) as total_llamadas,
        SUM(tokens_total) as total_tokens,
        SUM(costo_estimado) as costo_total
      FROM uso_api_ia
      WHERE usuario_id = ? AND created_at >= ${dateFilter}
    `, [req.userId])

    // Obtener uso por día para gráfica
    const dailyUsage = await db.query(`
      SELECT
        DATE(created_at) as fecha,
        provider,
        COUNT(*) as llamadas,
        SUM(tokens_total) as tokens,
        SUM(costo_estimado) as costo
      FROM uso_api_ia
      WHERE usuario_id = ? AND created_at >= ${dateFilter}
      GROUP BY DATE(created_at), provider
      ORDER BY fecha ASC
    `, [req.userId])

    res.json({
      success: true,
      data: {
        byModel: stats,
        totals: totals || { total_llamadas: 0, total_tokens: 0, costo_total: 0 },
        dailyUsage,
        period
      }
    })
  } catch (error) {
    console.error('Error obteniendo estadísticas:', error)
    res.status(500).json({
      success: false,
      error: 'Error al obtener estadísticas de uso'
    })
  }
})

/**
 * GET /api/api-keys/usage/history
 * Obtiene historial de llamadas a APIs
 */
router.get('/usage/history', authMiddleware, async (req, res) => {
  try {
    const { page = 1, limit = 50, provider, estado } = req.query
    const offset = (page - 1) * limit

    let query = `
      SELECT id, provider, modelo, endpoint, tokens_entrada, tokens_salida,
             tokens_total, costo_estimado, tiempo_respuesta_ms, estado,
             error_mensaje, created_at
      FROM uso_api_ia
      WHERE usuario_id = ?
    `
    const params = [req.userId]

    if (provider) {
      query += ' AND provider = ?'
      params.push(provider)
    }
    if (estado) {
      query += ' AND estado = ?'
      params.push(estado)
    }

    query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?'
    params.push(parseInt(limit), parseInt(offset))

    const history = await db.query(query, params)

    // Contar total
    let countQuery = 'SELECT COUNT(*) as total FROM uso_api_ia WHERE usuario_id = ?'
    const countParams = [req.userId]
    if (provider) {
      countQuery += ' AND provider = ?'
      countParams.push(provider)
    }
    if (estado) {
      countQuery += ' AND estado = ?'
      countParams.push(estado)
    }

    const [countResult] = await db.query(countQuery, countParams)

    res.json({
      success: true,
      data: history,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: countResult?.total || 0,
        totalPages: Math.ceil((countResult?.total || 0) / limit)
      }
    })
  } catch (error) {
    console.error('Error obteniendo historial:', error)
    res.status(500).json({
      success: false,
      error: 'Error al obtener historial de uso'
    })
  }
})

/**
 * GET /api/api-keys/models/costs
 * Obtiene los costos configurados por modelo
 */
router.get('/models/costs', async (req, res) => {
  try {
    const costs = await db.query(
      `SELECT provider, modelo, costo_input_por_millon, costo_output_por_millon, max_tokens
       FROM costos_modelos_ia
       WHERE activo = TRUE
       ORDER BY provider, modelo`
    )

    res.json({
      success: true,
      data: costs
    })
  } catch (error) {
    console.error('Error obteniendo costos:', error)
    res.status(500).json({
      success: false,
      error: 'Error al obtener costos de modelos'
    })
  }
})

export default router
