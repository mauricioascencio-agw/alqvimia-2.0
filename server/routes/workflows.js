/**
 * ALQVIMIA RPA 2.0 - Rutas de Workflows
 * Endpoints API para gestión de workflows
 */

import express from 'express'
import crypto from 'crypto'
import * as db from '../services/database.js'

// Generar UUID sin dependencia externa
const generateUUID = () => crypto.randomUUID()

const router = express.Router()

// =====================================================
// WORKFLOWS - CRUD
// =====================================================

/**
 * GET /api/workflows
 * Obtiene todos los workflows
 */
router.get('/', async (req, res) => {
  try {
    const { categoria, estado, busqueda, limite } = req.query

    const filtros = {}
    if (categoria) filtros.categoria = categoria
    if (estado) filtros.estado = estado
    if (busqueda) filtros.busqueda = busqueda
    if (limite) filtros.limite = parseInt(limite)

    const workflows = await db.getWorkflows(filtros)

    res.json({
      success: true,
      data: workflows,
      count: workflows.length
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    })
  }
})

/**
 * GET /api/workflows/:id
 * Obtiene un workflow por ID
 */
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params

    const workflow = await db.queryOne(`
      SELECT id, uuid, nombre, descripcion, categoria, version, estado,
             pasos, variables, configuracion, ejecuciones_totales,
             ultima_ejecucion, created_at, updated_at
      FROM workflows
      WHERE id = ? OR uuid = ?
    `, [id, id])

    if (!workflow) {
      return res.status(404).json({
        success: false,
        error: 'Workflow no encontrado'
      })
    }

    // Parsear JSON
    workflow.pasos = JSON.parse(workflow.pasos || '[]')
    workflow.variables = JSON.parse(workflow.variables || '{}')
    workflow.configuracion = JSON.parse(workflow.configuracion || '{}')

    res.json({
      success: true,
      data: workflow
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    })
  }
})

/**
 * POST /api/workflows
 * Crea un nuevo workflow
 */
router.post('/', async (req, res) => {
  try {
    const {
      nombre,
      descripcion,
      categoria = 'general',
      pasos = [],
      variables = {},
      configuracion = {},
      usuario_creador_id = 1
    } = req.body

    if (!nombre) {
      return res.status(400).json({
        success: false,
        error: 'El nombre es requerido'
      })
    }

    const uuid = generateUUID()

    const id = await db.saveWorkflow({
      uuid,
      nombre,
      descripcion,
      categoria,
      pasos,
      variables,
      configuracion,
      usuario_creador_id
    })

    res.status(201).json({
      success: true,
      data: {
        id,
        uuid,
        nombre
      },
      message: 'Workflow creado exitosamente'
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    })
  }
})

/**
 * PUT /api/workflows/:id
 * Actualiza un workflow existente
 */
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params
    const {
      nombre,
      descripcion,
      categoria,
      estado,
      pasos,
      variables,
      configuracion
    } = req.body

    // Construir objeto de actualización
    const updateData = {}
    if (nombre !== undefined) updateData.nombre = nombre
    if (descripcion !== undefined) updateData.descripcion = descripcion
    if (categoria !== undefined) updateData.categoria = categoria
    if (estado !== undefined) updateData.estado = estado
    if (pasos !== undefined) updateData.pasos = JSON.stringify(pasos)
    if (variables !== undefined) updateData.variables = JSON.stringify(variables)
    if (configuracion !== undefined) updateData.configuracion = JSON.stringify(configuracion)

    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({
        success: false,
        error: 'No hay datos para actualizar'
      })
    }

    const affected = await db.update('workflows', updateData, 'id = ? OR uuid = ?', [id, id])

    if (affected === 0) {
      return res.status(404).json({
        success: false,
        error: 'Workflow no encontrado'
      })
    }

    res.json({
      success: true,
      message: 'Workflow actualizado exitosamente'
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    })
  }
})

/**
 * DELETE /api/workflows/:id
 * Elimina un workflow
 */
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params

    const affected = await db.remove('workflows', 'id = ? OR uuid = ?', [id, id])

    if (affected === 0) {
      return res.status(404).json({
        success: false,
        error: 'Workflow no encontrado'
      })
    }

    res.json({
      success: true,
      message: 'Workflow eliminado exitosamente'
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    })
  }
})

// =====================================================
// EJECUCIONES
// =====================================================

/**
 * POST /api/workflows/:id/execute
 * Registra una ejecución de workflow
 */
router.post('/:id/execute', async (req, res) => {
  try {
    const { id } = req.params
    const { usuario_id = 1, estado = 'pendiente', resultado, error_mensaje } = req.body

    const execId = await db.logExecution(
      parseInt(id),
      usuario_id,
      estado,
      resultado,
      error_mensaje
    )

    res.json({
      success: true,
      data: {
        execution_id: execId
      },
      message: 'Ejecución registrada'
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    })
  }
})

/**
 * GET /api/workflows/:id/executions
 * Obtiene el historial de ejecuciones de un workflow
 */
router.get('/:id/executions', async (req, res) => {
  try {
    const { id } = req.params
    const { limite = 50 } = req.query

    const executions = await db.query(`
      SELECT e.id, e.estado, e.inicio, e.fin, e.duracion_ms,
             e.resultado, e.logs, e.error_mensaje, e.progreso,
             u.nombre as usuario_nombre
      FROM ejecuciones e
      LEFT JOIN usuarios u ON e.usuario_id = u.id
      WHERE e.workflow_id = ?
      ORDER BY e.inicio DESC
      LIMIT ?
    `, [id, parseInt(limite)])

    // Parsear JSON en resultado
    const parsedExecutions = executions.map(e => ({
      ...e,
      resultado: e.resultado ? JSON.parse(e.resultado) : null
    }))

    res.json({
      success: true,
      data: parsedExecutions,
      count: parsedExecutions.length
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    })
  }
})

// =====================================================
// CARPETAS
// =====================================================

/**
 * GET /api/workflows/folders
 * Obtiene todas las carpetas de workflows
 */
router.get('/meta/folders', async (req, res) => {
  try {
    const { usuario_id = 1 } = req.query

    const folders = await db.query(`
      SELECT id, nombre, descripcion, carpeta_padre_id, color, icono, orden
      FROM carpetas_workflow
      WHERE usuario_id = ?
      ORDER BY orden ASC, nombre ASC
    `, [usuario_id])

    res.json({
      success: true,
      data: folders
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    })
  }
})

/**
 * POST /api/workflows/folders
 * Crea una nueva carpeta
 */
router.post('/meta/folders', async (req, res) => {
  try {
    const {
      nombre,
      descripcion,
      usuario_id = 1,
      carpeta_padre_id = null,
      color = '#3b82f6',
      icono = 'fa-folder'
    } = req.body

    if (!nombre) {
      return res.status(400).json({
        success: false,
        error: 'El nombre es requerido'
      })
    }

    const id = await db.insert('carpetas_workflow', {
      nombre,
      descripcion,
      usuario_id,
      carpeta_padre_id,
      color,
      icono
    })

    res.status(201).json({
      success: true,
      data: { id, nombre },
      message: 'Carpeta creada exitosamente'
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    })
  }
})

// =====================================================
// SYNC - Sincronización localStorage <-> MySQL
// =====================================================

/**
 * POST /api/workflows/sync
 * Sincroniza workflows desde localStorage a MySQL
 */
router.post('/sync', async (req, res) => {
  try {
    const { workflows, usuario_id = 1 } = req.body

    if (!Array.isArray(workflows)) {
      return res.status(400).json({
        success: false,
        error: 'Se requiere un array de workflows'
      })
    }

    const results = {
      created: 0,
      updated: 0,
      errors: []
    }

    for (const wf of workflows) {
      try {
        // Verificar si existe por nombre
        const existing = await db.queryOne(
          'SELECT id, uuid FROM workflows WHERE nombre = ? AND usuario_creador_id = ?',
          [wf.name, usuario_id]
        )

        if (existing) {
          // Actualizar
          await db.update('workflows', {
            pasos: JSON.stringify(wf.steps || wf.actions || []),
            variables: JSON.stringify(wf.variables || {}),
            configuracion: JSON.stringify({ folder: wf.folder })
          }, 'id = ?', [existing.id])
          results.updated++
        } else {
          // Crear nuevo
          await db.saveWorkflow({
            uuid: generateUUID(),
            nombre: wf.name,
            descripcion: wf.description || '',
            categoria: wf.folder || 'general',
            pasos: wf.steps || wf.actions || [],
            variables: wf.variables || {},
            configuracion: { folder: wf.folder },
            usuario_creador_id: usuario_id
          })
          results.created++
        }
      } catch (err) {
        results.errors.push({ workflow: wf.name, error: err.message })
      }
    }

    res.json({
      success: true,
      data: results,
      message: `Sincronización completada: ${results.created} creados, ${results.updated} actualizados`
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    })
  }
})

export default router
