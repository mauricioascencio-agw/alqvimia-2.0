/**
 * ALQVIMIA RPA 2.0 - Rutas de Configuración
 * Endpoints API para gestión de configuraciones
 */

import express from 'express'
import * as db from '../services/database.js'

const router = express.Router()

// =====================================================
// CONFIGURACIONES DEL SISTEMA
// =====================================================

/**
 * GET /api/settings/system
 * Obtiene todas las configuraciones del sistema
 */
router.get('/system', async (req, res) => {
  try {
    const configs = await db.getSystemConfigs()
    res.json({
      success: true,
      data: configs
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    })
  }
})

/**
 * PUT /api/settings/system
 * Actualiza configuraciones del sistema
 */
router.put('/system', async (req, res) => {
  try {
    const { configs } = req.body

    if (!configs || typeof configs !== 'object') {
      return res.status(400).json({
        success: false,
        error: 'Se requiere un objeto de configuraciones'
      })
    }

    for (const [clave, valor] of Object.entries(configs)) {
      const tipo = typeof valor === 'boolean' ? 'boolean'
        : typeof valor === 'number' ? 'number'
        : typeof valor === 'object' ? 'json'
        : 'string'

      await db.setSystemConfig(clave, valor, tipo)
    }

    res.json({
      success: true,
      message: 'Configuraciones actualizadas'
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    })
  }
})

// =====================================================
// CONFIGURACIONES DE USUARIO
// =====================================================

/**
 * GET /api/settings/user/:userId
 * Obtiene la configuración de un usuario
 */
router.get('/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params
    const config = await db.getUserConfig(parseInt(userId))

    if (!config) {
      // Retornar configuración por defecto si no existe
      return res.json({
        success: true,
        data: {
          tema: 'midnight-blue',
          idioma: 'es',
          notificaciones_email: true,
          notificaciones_push: true,
          sidebar_collapsed: false,
          configuracion_json: {}
        }
      })
    }

    // Parsear JSON si existe
    if (config.configuracion_json && typeof config.configuracion_json === 'string') {
      try {
        config.configuracion_json = JSON.parse(config.configuracion_json)
      } catch {
        config.configuracion_json = {}
      }
    }

    res.json({
      success: true,
      data: config
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    })
  }
})

/**
 * PUT /api/settings/user/:userId
 * Guarda la configuración de un usuario
 */
router.put('/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params
    const config = req.body

    const success = await db.saveUserConfig(parseInt(userId), config)

    if (success) {
      res.json({
        success: true,
        message: 'Configuración de usuario guardada'
      })
    } else {
      res.status(500).json({
        success: false,
        error: 'No se pudo guardar la configuración'
      })
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    })
  }
})

// =====================================================
// TEMAS
// =====================================================

/**
 * GET /api/settings/themes
 * Obtiene todos los temas disponibles
 */
router.get('/themes', async (req, res) => {
  try {
    const themes = await db.getThemes()

    // Parsear JSON en cada tema
    const parsedThemes = themes.map(theme => ({
      ...theme,
      variables_css: typeof theme.variables_css === 'string'
        ? JSON.parse(theme.variables_css)
        : theme.variables_css,
      preview_colors: typeof theme.preview_colors === 'string'
        ? JSON.parse(theme.preview_colors)
        : theme.preview_colors
    }))

    res.json({
      success: true,
      data: parsedThemes
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    })
  }
})

/**
 * PUT /api/settings/theme
 * Actualiza el tema de un usuario
 */
router.put('/theme', async (req, res) => {
  try {
    const { userId, theme } = req.body

    if (!theme) {
      return res.status(400).json({
        success: false,
        error: 'Se requiere el tema'
      })
    }

    // Actualizar solo el tema
    const userConfig = await db.getUserConfig(userId || 1) || {}
    userConfig.tema = theme

    await db.saveUserConfig(userId || 1, {
      ...userConfig,
      tema: theme
    })

    res.json({
      success: true,
      message: 'Tema actualizado',
      theme
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    })
  }
})

// =====================================================
// PLANTILLAS IA
// =====================================================

/**
 * GET /api/settings/ai-templates
 * Obtiene todas las plantillas de IA
 */
router.get('/ai-templates', async (req, res) => {
  try {
    const templates = await db.getAITemplates()

    // Parsear configuración JSON
    const parsedTemplates = templates.map(t => ({
      ...t,
      configuracion: typeof t.configuracion === 'string'
        ? JSON.parse(t.configuracion)
        : t.configuracion
    }))

    res.json({
      success: true,
      data: parsedTemplates
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    })
  }
})

// =====================================================
// PLANTILLAS AGENTES
// =====================================================

/**
 * GET /api/settings/agent-templates
 * Obtiene todas las plantillas de agentes
 */
router.get('/agent-templates', async (req, res) => {
  try {
    const templates = await db.getAgentTemplates()

    // Parsear JSON
    const parsedTemplates = templates.map(t => ({
      ...t,
      capacidades: typeof t.capacidades === 'string'
        ? JSON.parse(t.capacidades)
        : t.capacidades,
      configuracion_default: typeof t.configuracion_default === 'string'
        ? JSON.parse(t.configuracion_default)
        : t.configuracion_default
    }))

    res.json({
      success: true,
      data: parsedTemplates
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    })
  }
})

// =====================================================
// ESTADO DE LA BASE DE DATOS
// =====================================================

/**
 * GET /api/settings/db-status
 * Verifica el estado de la conexión a la base de datos
 */
router.get('/db-status', async (req, res) => {
  try {
    const connected = await db.isConnected()

    res.json({
      success: true,
      data: {
        connected,
        message: connected
          ? 'Base de datos conectada'
          : 'Base de datos no disponible'
      }
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    })
  }
})

export default router
