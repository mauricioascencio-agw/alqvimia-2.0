import { Router } from 'express'
import { authMiddleware, adminMiddleware } from './auth.js'
import {
  getDashboards, getDashboardById, createDashboard, updateDashboard, deleteDashboard,
  getDashboardRolePermisos, updateDashboardRolePermisos, getDashboardPermisosForRole, getWidgetData
} from '../services/database.js'

const router = Router()

// GET /api/dashboards - List dashboards for user
router.get('/', authMiddleware, async (req, res) => {
  try {
    const dashboards = await getDashboards(req.user.id, req.user.rol)
    res.json({ success: true, data: dashboards })
  } catch (error) {
    res.status(500).json({ success: false, error: error.message })
  }
})

// GET /api/dashboards/permisos - Get role permissions (admin only)
router.get('/permisos', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const permisos = await getDashboardRolePermisos()
    res.json({ success: true, data: permisos })
  } catch (error) {
    res.status(500).json({ success: false, error: error.message })
  }
})

// PUT /api/dashboards/permisos - Update role permissions (admin only)
router.put('/permisos', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { rol, permisos } = req.body
    if (!rol || !permisos) return res.status(400).json({ success: false, error: 'rol y permisos son requeridos' })
    const ok = await updateDashboardRolePermisos(rol, permisos)
    res.json({ success: ok })
  } catch (error) {
    res.status(500).json({ success: false, error: error.message })
  }
})

// POST /api/dashboards/widget-data/:tipo - Get widget data
router.post('/widget-data/:tipo', authMiddleware, async (req, res) => {
  try {
    const data = await getWidgetData(req.params.tipo, req.body)
    res.json({ success: true, data })
  } catch (error) {
    res.status(500).json({ success: false, error: error.message })
  }
})

// GET /api/dashboards/:id - Get single dashboard
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const dashboard = await getDashboardById(req.params.id)
    if (!dashboard) return res.status(404).json({ success: false, error: 'Dashboard no encontrado' })
    res.json({ success: true, data: dashboard })
  } catch (error) {
    res.status(500).json({ success: false, error: error.message })
  }
})

// POST /api/dashboards - Create dashboard
router.post('/', authMiddleware, async (req, res) => {
  try {
    const permisos = await getDashboardPermisosForRole(req.user.rol)
    if (!permisos?.puede_crear) return res.status(403).json({ success: false, error: 'No tienes permiso para crear dashboards' })

    // Check max dashboards
    const existing = await getDashboards(req.user.id, req.user.rol)
    const owned = existing.filter(d => d.usuario_id === req.user.id)
    if (owned.length >= permisos.max_dashboards) {
      return res.status(400).json({ success: false, error: `Has alcanzado el límite de ${permisos.max_dashboards} dashboards` })
    }

    const result = await createDashboard({ ...req.body, usuario_id: req.user.id })
    if (!result) return res.status(500).json({ success: false, error: 'Error al crear dashboard' })
    res.json({ success: true, data: result })
  } catch (error) {
    res.status(500).json({ success: false, error: error.message })
  }
})

// PUT /api/dashboards/:id - Update dashboard
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const dashboard = await getDashboardById(req.params.id)
    if (!dashboard) return res.status(404).json({ success: false, error: 'Dashboard no encontrado' })
    if (dashboard.usuario_id !== req.user.id && req.user.rol !== 'admin') {
      return res.status(403).json({ success: false, error: 'No tienes permiso para editar este dashboard' })
    }
    const ok = await updateDashboard(req.params.id, req.body)
    res.json({ success: ok })
  } catch (error) {
    res.status(500).json({ success: false, error: error.message })
  }
})

// DELETE /api/dashboards/:id - Delete dashboard
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const dashboard = await getDashboardById(req.params.id)
    if (!dashboard) return res.status(404).json({ success: false, error: 'Dashboard no encontrado' })
    if (dashboard.usuario_id !== req.user.id && req.user.rol !== 'admin') {
      return res.status(403).json({ success: false, error: 'No tienes permiso para eliminar este dashboard' })
    }
    const ok = await deleteDashboard(req.params.id)
    res.json({ success: ok })
  } catch (error) {
    res.status(500).json({ success: false, error: error.message })
  }
})

// POST /api/dashboards/:id/duplicate - Duplicate dashboard
router.post('/:id/duplicate', authMiddleware, async (req, res) => {
  try {
    const permisos = await getDashboardPermisosForRole(req.user.rol)
    if (!permisos?.puede_crear) return res.status(403).json({ success: false, error: 'No tienes permiso para crear dashboards' })

    const original = await getDashboardById(req.params.id)
    if (!original) return res.status(404).json({ success: false, error: 'Dashboard no encontrado' })

    const result = await createDashboard({
      nombre: `${original.nombre} (copia)`,
      descripcion: original.descripcion,
      usuario_id: req.user.id,
      tipo: 'personal',
      widgets: original.widgets,
      configuracion: original.configuracion,
      roles_acceso: [],
      estado: 'borrador'
    })
    res.json({ success: true, data: result })
  } catch (error) {
    res.status(500).json({ success: false, error: error.message })
  }
})

export default router
