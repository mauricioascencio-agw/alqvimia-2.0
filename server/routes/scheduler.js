/**
 * ALQVIMIA RPA 2.0 - Rutas del Programador (Scheduler)
 * Endpoints API para gestión de programaciones de agentes y workflows
 */

import express from 'express'
import crypto from 'crypto'
import * as db from '../services/database.js'

// Importar plantillas de schedules
import {
  scheduleTemplates,
  getAllScheduleTemplates,
  getSchedulesByCategory,
  getScheduleByAgent,
  getSchedulesByType,
  templateToCron,
  isWithinActiveHours
} from '../../scheduler/templates/scheduleTemplates.js'

const router = express.Router()
const generateUUID = () => crypto.randomUUID()

// =====================================================
// PLANTILLAS DE SCHEDULE
// =====================================================

/**
 * GET /api/scheduler/templates
 * Obtiene todas las plantillas de schedule disponibles
 */
router.get('/templates', async (req, res) => {
  try {
    const { categoria, tipo } = req.query

    let templates = getAllScheduleTemplates()

    if (categoria) {
      templates = getSchedulesByCategory(categoria)
    }

    if (tipo) {
      templates = templates.filter(t => t.tipo === tipo)
    }

    res.json({
      success: true,
      data: templates,
      count: templates.length
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    })
  }
})

/**
 * GET /api/scheduler/templates/:agentId
 * Obtiene la plantilla de schedule para un agente específico
 */
router.get('/templates/:agentId', async (req, res) => {
  try {
    const { agentId } = req.params

    const template = getScheduleByAgent(agentId)

    if (!template) {
      return res.status(404).json({
        success: false,
        error: 'Plantilla no encontrada para el agente especificado'
      })
    }

    // Agregar expresión cron calculada
    template.cronExpression = templateToCron(template)

    res.json({
      success: true,
      data: template
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    })
  }
})

// =====================================================
// SCHEDULES - CRUD
// =====================================================

/**
 * GET /api/scheduler/schedules
 * Obtiene todos los schedules configurados
 */
router.get('/schedules', async (req, res) => {
  try {
    const { agente_id, estado, tipo } = req.query

    let query = `
      SELECT s.*,
             a.nombre as agente_nombre,
             w.nombre as workflow_nombre
      FROM schedules s
      LEFT JOIN agentes a ON s.agente_id = a.id
      LEFT JOIN workflows w ON s.workflow_id = w.id
      WHERE 1=1
    `
    const params = []

    if (agente_id) {
      query += ' AND s.agente_id = ?'
      params.push(agente_id)
    }

    if (estado) {
      query += ' AND s.estado = ?'
      params.push(estado)
    }

    if (tipo) {
      query += ' AND s.tipo = ?'
      params.push(tipo)
    }

    query += ' ORDER BY s.created_at DESC'

    const schedules = await db.query(query, params)

    // Parsear configuraciones JSON
    const parsedSchedules = schedules.map(s => ({
      ...s,
      configuracion: s.configuracion ? JSON.parse(s.configuracion) : {},
      opciones: s.opciones ? JSON.parse(s.opciones) : {},
      horario_activo: s.horario_activo ? JSON.parse(s.horario_activo) : {}
    }))

    res.json({
      success: true,
      data: parsedSchedules,
      count: parsedSchedules.length
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    })
  }
})

/**
 * GET /api/scheduler/schedules/:id
 * Obtiene un schedule por ID
 */
router.get('/schedules/:id', async (req, res) => {
  try {
    const { id } = req.params

    const schedule = await db.queryOne(`
      SELECT s.*,
             a.nombre as agente_nombre, a.tipo as agente_tipo,
             w.nombre as workflow_nombre
      FROM schedules s
      LEFT JOIN agentes a ON s.agente_id = a.id
      LEFT JOIN workflows w ON s.workflow_id = w.id
      WHERE s.id = ? OR s.uuid = ?
    `, [id, id])

    if (!schedule) {
      return res.status(404).json({
        success: false,
        error: 'Schedule no encontrado'
      })
    }

    // Parsear JSON
    schedule.configuracion = JSON.parse(schedule.configuracion || '{}')
    schedule.opciones = JSON.parse(schedule.opciones || '{}')
    schedule.horario_activo = JSON.parse(schedule.horario_activo || '{}')

    res.json({
      success: true,
      data: schedule
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    })
  }
})

/**
 * POST /api/scheduler/schedules
 * Crea un nuevo schedule
 */
router.post('/schedules', async (req, res) => {
  try {
    const {
      nombre,
      descripcion,
      agente_id,
      workflow_id,
      tipo = 'recurring',
      configuracion = {},
      opciones = {},
      horario_activo = {},
      template_id = null
    } = req.body

    if (!nombre) {
      return res.status(400).json({
        success: false,
        error: 'El nombre es requerido'
      })
    }

    if (!agente_id && !workflow_id) {
      return res.status(400).json({
        success: false,
        error: 'Se requiere agente_id o workflow_id'
      })
    }

    const uuid = generateUUID()

    // Si se proporciona template_id, usar configuración de plantilla
    let finalConfig = configuracion
    let finalOptions = opciones
    let finalHorario = horario_activo

    if (template_id) {
      const template = Object.values(scheduleTemplates).find(t => t.id === template_id)
      if (template) {
        finalConfig = { ...template.configuracion, ...configuracion }
        finalOptions = { ...template.opciones, ...opciones }
        finalHorario = { ...template.horarioActivo, ...horario_activo }
      }
    }

    // Calcular expresión cron
    const cronExpression = calculateCronExpression(finalConfig)

    const id = await db.insert('schedules', {
      uuid,
      nombre,
      descripcion,
      agente_id,
      workflow_id,
      tipo,
      configuracion: JSON.stringify(finalConfig),
      opciones: JSON.stringify(finalOptions),
      horario_activo: JSON.stringify(finalHorario),
      cron_expression: cronExpression,
      estado: 'activo',
      template_id
    })

    res.status(201).json({
      success: true,
      data: {
        id,
        uuid,
        nombre,
        cronExpression
      },
      message: 'Schedule creado exitosamente'
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    })
  }
})

/**
 * PUT /api/scheduler/schedules/:id
 * Actualiza un schedule existente
 */
router.put('/schedules/:id', async (req, res) => {
  try {
    const { id } = req.params
    const {
      nombre,
      descripcion,
      estado,
      configuracion,
      opciones,
      horario_activo
    } = req.body

    const updateData = {}

    if (nombre !== undefined) updateData.nombre = nombre
    if (descripcion !== undefined) updateData.descripcion = descripcion
    if (estado !== undefined) updateData.estado = estado
    if (configuracion !== undefined) {
      updateData.configuracion = JSON.stringify(configuracion)
      updateData.cron_expression = calculateCronExpression(configuracion)
    }
    if (opciones !== undefined) updateData.opciones = JSON.stringify(opciones)
    if (horario_activo !== undefined) updateData.horario_activo = JSON.stringify(horario_activo)

    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({
        success: false,
        error: 'No hay datos para actualizar'
      })
    }

    const affected = await db.update('schedules', updateData, 'id = ? OR uuid = ?', [id, id])

    if (affected === 0) {
      return res.status(404).json({
        success: false,
        error: 'Schedule no encontrado'
      })
    }

    res.json({
      success: true,
      message: 'Schedule actualizado exitosamente'
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    })
  }
})

/**
 * DELETE /api/scheduler/schedules/:id
 * Elimina un schedule
 */
router.delete('/schedules/:id', async (req, res) => {
  try {
    const { id } = req.params

    const affected = await db.remove('schedules', 'id = ? OR uuid = ?', [id, id])

    if (affected === 0) {
      return res.status(404).json({
        success: false,
        error: 'Schedule no encontrado'
      })
    }

    res.json({
      success: true,
      message: 'Schedule eliminado exitosamente'
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    })
  }
})

// =====================================================
// ACCIONES DE SCHEDULE
// =====================================================

/**
 * POST /api/scheduler/schedules/:id/enable
 * Activa un schedule
 */
router.post('/schedules/:id/enable', async (req, res) => {
  try {
    const { id } = req.params

    const affected = await db.update('schedules', { estado: 'activo' }, 'id = ? OR uuid = ?', [id, id])

    if (affected === 0) {
      return res.status(404).json({
        success: false,
        error: 'Schedule no encontrado'
      })
    }

    res.json({
      success: true,
      message: 'Schedule activado'
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    })
  }
})

/**
 * POST /api/scheduler/schedules/:id/disable
 * Desactiva un schedule
 */
router.post('/schedules/:id/disable', async (req, res) => {
  try {
    const { id } = req.params

    const affected = await db.update('schedules', { estado: 'inactivo' }, 'id = ? OR uuid = ?', [id, id])

    if (affected === 0) {
      return res.status(404).json({
        success: false,
        error: 'Schedule no encontrado'
      })
    }

    res.json({
      success: true,
      message: 'Schedule desactivado'
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    })
  }
})

/**
 * POST /api/scheduler/schedules/:id/run-now
 * Ejecuta un schedule inmediatamente
 */
router.post('/schedules/:id/run-now', async (req, res) => {
  try {
    const { id } = req.params

    const schedule = await db.queryOne(`
      SELECT s.*, w.pasos, w.variables
      FROM schedules s
      LEFT JOIN workflows w ON s.workflow_id = w.id
      WHERE s.id = ? OR s.uuid = ?
    `, [id, id])

    if (!schedule) {
      return res.status(404).json({
        success: false,
        error: 'Schedule no encontrado'
      })
    }

    // Registrar ejecución manual
    const execId = await db.insert('schedule_executions', {
      schedule_id: schedule.id,
      tipo: 'manual',
      estado: 'pendiente',
      inicio: new Date()
    })

    // Emitir evento para ejecutar el workflow
    // TODO: Integrar con el sistema de ejecución de workflows

    res.json({
      success: true,
      data: {
        execution_id: execId,
        schedule_id: schedule.id
      },
      message: 'Ejecución iniciada'
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    })
  }
})

// =====================================================
// HISTORIAL DE EJECUCIONES
// =====================================================

/**
 * GET /api/scheduler/schedules/:id/history
 * Obtiene el historial de ejecuciones de un schedule
 */
router.get('/schedules/:id/history', async (req, res) => {
  try {
    const { id } = req.params
    const { limite = 50 } = req.query

    const executions = await db.query(`
      SELECT se.*, s.nombre as schedule_nombre
      FROM schedule_executions se
      JOIN schedules s ON se.schedule_id = s.id
      WHERE s.id = ? OR s.uuid = ?
      ORDER BY se.inicio DESC
      LIMIT ?
    `, [id, id, parseInt(limite)])

    res.json({
      success: true,
      data: executions,
      count: executions.length
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    })
  }
})

/**
 * GET /api/scheduler/upcoming
 * Obtiene las próximas ejecuciones programadas
 */
router.get('/upcoming', async (req, res) => {
  try {
    const { limite = 20 } = req.query

    const schedules = await db.query(`
      SELECT s.*,
             a.nombre as agente_nombre,
             w.nombre as workflow_nombre
      FROM schedules s
      LEFT JOIN agentes a ON s.agente_id = a.id
      LEFT JOIN workflows w ON s.workflow_id = w.id
      WHERE s.estado = 'activo'
      ORDER BY s.proxima_ejecucion ASC
      LIMIT ?
    `, [parseInt(limite)])

    // Calcular próximas ejecuciones
    const upcoming = schedules.map(s => {
      const config = JSON.parse(s.configuracion || '{}')
      return {
        ...s,
        configuracion: config,
        proxima_ejecucion: calculateNextExecution(s.cron_expression)
      }
    })

    res.json({
      success: true,
      data: upcoming,
      count: upcoming.length
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    })
  }
})

// =====================================================
// HELPERS
// =====================================================

/**
 * Calcula la expresión cron desde configuración
 */
function calculateCronExpression(config) {
  if (!config || !config.frequency) {
    return '0 * * * *' // Por defecto cada hora
  }

  switch (config.frequency) {
    case 'hourly':
      const minute = config.runAt ? parseInt(config.runAt.split(':')[1]) : 0
      return `${minute} * * * *`

    case 'daily':
      const [hour, min] = (config.runAt || '00:00').split(':')
      return `${parseInt(min)} ${parseInt(hour)} * * *`

    case 'monthly':
      const [mHour, mMin] = (config.runAt || '00:00').split(':')
      return `${parseInt(mMin)} ${parseInt(mHour)} ${config.dayOfMonth || 1} * *`

    case 'biweekly':
      const [bHour, bMin] = (config.runAt || '00:00').split(':')
      const days = config.daysOfMonth ? config.daysOfMonth.join(',') : '1,16'
      return `${parseInt(bMin)} ${parseInt(bHour)} ${days} * *`

    case 'interval':
    case 'every':
      if (config.unit === 'minutes') {
        return `*/${config.interval || 15} * * * *`
      } else if (config.unit === 'hours') {
        return `0 */${config.interval || 1} * * *`
      }
      return '0 * * * *'

    default:
      return '0 * * * *'
  }
}

/**
 * Calcula la próxima ejecución basada en cron
 */
function calculateNextExecution(cronExpression) {
  // Implementación simplificada - en producción usar librería como cron-parser
  const now = new Date()
  const parts = cronExpression.split(' ')

  // Asumiendo formato: minuto hora dia mes diaSemana
  const nextDate = new Date(now)

  // Para ejecuciones cada hora
  if (parts[0].startsWith('*/')) {
    const interval = parseInt(parts[0].replace('*/', ''))
    const currentMinute = now.getMinutes()
    const nextMinute = Math.ceil(currentMinute / interval) * interval
    nextDate.setMinutes(nextMinute === 60 ? 0 : nextMinute)
    if (nextMinute === 60) {
      nextDate.setHours(nextDate.getHours() + 1)
    }
  } else if (parts[1] !== '*') {
    // Ejecución diaria a hora específica
    nextDate.setHours(parseInt(parts[1]))
    nextDate.setMinutes(parseInt(parts[0]))
    if (nextDate <= now) {
      nextDate.setDate(nextDate.getDate() + 1)
    }
  }

  return nextDate.toISOString()
}

export default router
