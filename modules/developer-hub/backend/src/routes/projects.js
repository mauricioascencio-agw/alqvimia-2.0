/**
 * Developer Hub - Projects Routes
 * Gestión de proyectos de desarrollo
 */

import express from 'express'
import { v4 as uuidv4 } from 'uuid'

const router = express.Router()

// Mock projects database
let projects = [
  {
    id: 'proj_001',
    name: 'CRM Automation',
    description: 'Automatización de procesos CRM',
    status: 'active',
    environment: 'dev',
    createdBy: 'dev_001',
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-12-20'),
    repository: 'https://github.com/alqvimia/crm-automation',
    workflows: ['wf_001', 'wf_002'],
    agents: ['agent_001'],
    team: ['dev_001', 'dev_002'],
    settings: {
      autoDeployDev: true,
      requireApprovalQA: true,
      requireApprovalProd: true
    }
  },
  {
    id: 'proj_002',
    name: 'Invoice Processing',
    description: 'Procesamiento automático de facturas',
    status: 'active',
    environment: 'qa',
    createdBy: 'dev_002',
    createdAt: new Date('2024-03-10'),
    updatedAt: new Date('2024-12-18'),
    repository: 'https://github.com/alqvimia/invoice-processing',
    workflows: ['wf_003'],
    agents: ['agent_002', 'agent_003'],
    team: ['dev_002'],
    settings: {
      autoDeployDev: true,
      requireApprovalQA: false,
      requireApprovalProd: true
    }
  }
]

// GET /api/projects - Listar proyectos
router.get('/', (req, res) => {
  const { environment, status, search } = req.query
  let filtered = [...projects]

  // Filtrar por permisos del desarrollador
  if (req.user.role !== 'senior_developer') {
    filtered = filtered.filter(p =>
      p.team.includes(req.user.id) || p.createdBy === req.user.id
    )
  }

  if (environment) {
    filtered = filtered.filter(p => p.environment === environment)
  }

  if (status) {
    filtered = filtered.filter(p => p.status === status)
  }

  if (search) {
    const searchLower = search.toLowerCase()
    filtered = filtered.filter(p =>
      p.name.toLowerCase().includes(searchLower) ||
      p.description.toLowerCase().includes(searchLower)
    )
  }

  res.json({
    projects: filtered,
    total: filtered.length
  })
})

// GET /api/projects/:id - Obtener proyecto
router.get('/:id', (req, res) => {
  const project = projects.find(p => p.id === req.params.id)

  if (!project) {
    return res.status(404).json({ error: 'Proyecto no encontrado' })
  }

  // Verificar acceso
  if (req.user.role !== 'senior_developer' &&
      !project.team.includes(req.user.id) &&
      project.createdBy !== req.user.id) {
    return res.status(403).json({ error: 'Sin acceso a este proyecto' })
  }

  res.json(project)
})

// POST /api/projects - Crear proyecto
router.post('/', (req, res) => {
  const { name, description, repository, settings } = req.body

  if (!name) {
    return res.status(400).json({ error: 'Nombre es requerido' })
  }

  const newProject = {
    id: `proj_${uuidv4().slice(0, 8)}`,
    name,
    description: description || '',
    status: 'active',
    environment: 'dev',
    createdBy: req.user.id,
    createdAt: new Date(),
    updatedAt: new Date(),
    repository: repository || null,
    workflows: [],
    agents: [],
    team: [req.user.id],
    settings: settings || {
      autoDeployDev: true,
      requireApprovalQA: true,
      requireApprovalProd: true
    }
  }

  projects.push(newProject)
  res.status(201).json(newProject)
})

// PUT /api/projects/:id - Actualizar proyecto
router.put('/:id', (req, res) => {
  const index = projects.findIndex(p => p.id === req.params.id)

  if (index === -1) {
    return res.status(404).json({ error: 'Proyecto no encontrado' })
  }

  const project = projects[index]

  // Verificar permisos
  if (req.user.role !== 'senior_developer' && project.createdBy !== req.user.id) {
    return res.status(403).json({ error: 'Sin permisos para modificar este proyecto' })
  }

  const { name, description, repository, settings, team } = req.body

  projects[index] = {
    ...project,
    name: name || project.name,
    description: description !== undefined ? description : project.description,
    repository: repository !== undefined ? repository : project.repository,
    settings: settings || project.settings,
    team: team || project.team,
    updatedAt: new Date()
  }

  res.json(projects[index])
})

// DELETE /api/projects/:id - Eliminar proyecto
router.delete('/:id', (req, res) => {
  const index = projects.findIndex(p => p.id === req.params.id)

  if (index === -1) {
    return res.status(404).json({ error: 'Proyecto no encontrado' })
  }

  const project = projects[index]

  // Solo senior_developer o creador puede eliminar
  if (req.user.role !== 'senior_developer' && project.createdBy !== req.user.id) {
    return res.status(403).json({ error: 'Sin permisos para eliminar este proyecto' })
  }

  projects.splice(index, 1)
  res.json({ success: true, message: 'Proyecto eliminado' })
})

// POST /api/projects/:id/team - Agregar miembro al equipo
router.post('/:id/team', (req, res) => {
  const project = projects.find(p => p.id === req.params.id)

  if (!project) {
    return res.status(404).json({ error: 'Proyecto no encontrado' })
  }

  const { userId } = req.body
  if (!userId) {
    return res.status(400).json({ error: 'userId es requerido' })
  }

  if (!project.team.includes(userId)) {
    project.team.push(userId)
    project.updatedAt = new Date()
  }

  res.json(project)
})

// DELETE /api/projects/:id/team/:userId - Remover miembro del equipo
router.delete('/:id/team/:userId', (req, res) => {
  const project = projects.find(p => p.id === req.params.id)

  if (!project) {
    return res.status(404).json({ error: 'Proyecto no encontrado' })
  }

  project.team = project.team.filter(id => id !== req.params.userId)
  project.updatedAt = new Date()

  res.json(project)
})

// GET /api/projects/:id/activity - Historial de actividad
router.get('/:id/activity', (req, res) => {
  const project = projects.find(p => p.id === req.params.id)

  if (!project) {
    return res.status(404).json({ error: 'Proyecto no encontrado' })
  }

  // Mock activity
  const activity = [
    {
      id: 'act_001',
      type: 'deployment',
      message: 'Desplegado a QA',
      user: 'dev_001',
      timestamp: new Date('2024-12-20T10:30:00'),
      environment: 'qa'
    },
    {
      id: 'act_002',
      type: 'commit',
      message: 'Fix: Corrección en validación de datos',
      user: 'dev_002',
      timestamp: new Date('2024-12-19T15:45:00')
    },
    {
      id: 'act_003',
      type: 'workflow_update',
      message: 'Actualizado workflow wf_001',
      user: 'dev_001',
      timestamp: new Date('2024-12-18T09:00:00')
    }
  ]

  res.json(activity)
})

export default router
