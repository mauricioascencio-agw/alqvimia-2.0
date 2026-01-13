/**
 * Developer Hub - Workflows Routes
 * Gestión de workflows en desarrollo
 */

import express from 'express'
import { v4 as uuidv4 } from 'uuid'

const router = express.Router()

// Mock workflows
let workflows = [
  {
    id: 'wf_001',
    name: 'Proceso de Ventas',
    description: 'Automatización del flujo de ventas',
    projectId: 'proj_001',
    version: '1.2.0',
    status: 'active',
    environment: 'dev',
    createdBy: 'dev_001',
    createdAt: new Date('2024-02-01'),
    updatedAt: new Date('2024-12-20'),
    nodes: 12,
    connections: 15,
    variables: ['customer_id', 'order_amount', 'approval_status'],
    triggers: ['manual', 'scheduled', 'webhook'],
    lastExecution: new Date('2024-12-20T14:30:00'),
    executionCount: 156,
    avgExecutionTime: 4500, // ms
    deployedVersions: {
      dev: '1.2.0',
      qa: '1.1.0',
      prod: '1.0.0'
    }
  },
  {
    id: 'wf_002',
    name: 'Sincronización de Inventario',
    description: 'Sincroniza inventario entre sistemas',
    projectId: 'proj_001',
    version: '2.0.0',
    status: 'draft',
    environment: 'dev',
    createdBy: 'dev_001',
    createdAt: new Date('2024-06-15'),
    updatedAt: new Date('2024-12-19'),
    nodes: 8,
    connections: 10,
    variables: ['source_system', 'target_system'],
    triggers: ['scheduled'],
    lastExecution: null,
    executionCount: 0,
    avgExecutionTime: 0,
    deployedVersions: {}
  },
  {
    id: 'wf_003',
    name: 'Procesamiento de Facturas',
    description: 'OCR y procesamiento de facturas',
    projectId: 'proj_002',
    version: '1.0.5',
    status: 'active',
    environment: 'qa',
    createdBy: 'dev_002',
    createdAt: new Date('2024-04-20'),
    updatedAt: new Date('2024-12-18'),
    nodes: 20,
    connections: 25,
    variables: ['invoice_file', 'vendor_id', 'total_amount'],
    triggers: ['file_upload', 'api'],
    lastExecution: new Date('2024-12-18T16:45:00'),
    executionCount: 523,
    avgExecutionTime: 12000,
    deployedVersions: {
      dev: '1.0.5',
      qa: '1.0.5'
    }
  }
]

// GET /api/workflows - Listar workflows
router.get('/', (req, res) => {
  const { projectId, environment, status, search } = req.query
  let filtered = [...workflows]

  if (projectId) {
    filtered = filtered.filter(w => w.projectId === projectId)
  }

  if (environment) {
    filtered = filtered.filter(w => w.environment === environment)
  }

  if (status) {
    filtered = filtered.filter(w => w.status === status)
  }

  if (search) {
    const searchLower = search.toLowerCase()
    filtered = filtered.filter(w =>
      w.name.toLowerCase().includes(searchLower) ||
      w.description.toLowerCase().includes(searchLower)
    )
  }

  res.json({
    workflows: filtered,
    total: filtered.length
  })
})

// GET /api/workflows/:id - Obtener workflow
router.get('/:id', (req, res) => {
  const workflow = workflows.find(w => w.id === req.params.id)

  if (!workflow) {
    return res.status(404).json({ error: 'Workflow no encontrado' })
  }

  res.json(workflow)
})

// GET /api/workflows/:id/definition - Obtener definición completa
router.get('/:id/definition', (req, res) => {
  const workflow = workflows.find(w => w.id === req.params.id)

  if (!workflow) {
    return res.status(404).json({ error: 'Workflow no encontrado' })
  }

  // Mock definition
  const definition = {
    ...workflow,
    nodeDefinitions: [
      { id: 'node_1', type: 'trigger', position: { x: 100, y: 100 } },
      { id: 'node_2', type: 'action', position: { x: 300, y: 100 } },
      { id: 'node_3', type: 'condition', position: { x: 500, y: 100 } }
    ],
    connectionDefinitions: [
      { from: 'node_1', to: 'node_2' },
      { from: 'node_2', to: 'node_3' }
    ]
  }

  res.json(definition)
})

// POST /api/workflows - Crear workflow
router.post('/', (req, res) => {
  const { name, description, projectId, triggers } = req.body

  if (!name || !projectId) {
    return res.status(400).json({ error: 'Nombre y projectId son requeridos' })
  }

  const newWorkflow = {
    id: `wf_${uuidv4().slice(0, 8)}`,
    name,
    description: description || '',
    projectId,
    version: '0.1.0',
    status: 'draft',
    environment: 'dev',
    createdBy: req.user.id,
    createdAt: new Date(),
    updatedAt: new Date(),
    nodes: 0,
    connections: 0,
    variables: [],
    triggers: triggers || ['manual'],
    lastExecution: null,
    executionCount: 0,
    avgExecutionTime: 0,
    deployedVersions: {}
  }

  workflows.push(newWorkflow)
  res.status(201).json(newWorkflow)
})

// PUT /api/workflows/:id - Actualizar workflow
router.put('/:id', (req, res) => {
  const index = workflows.findIndex(w => w.id === req.params.id)

  if (index === -1) {
    return res.status(404).json({ error: 'Workflow no encontrado' })
  }

  const { name, description, status, variables, triggers } = req.body

  workflows[index] = {
    ...workflows[index],
    name: name || workflows[index].name,
    description: description !== undefined ? description : workflows[index].description,
    status: status || workflows[index].status,
    variables: variables || workflows[index].variables,
    triggers: triggers || workflows[index].triggers,
    updatedAt: new Date()
  }

  res.json(workflows[index])
})

// POST /api/workflows/:id/version - Crear nueva versión
router.post('/:id/version', (req, res) => {
  const workflow = workflows.find(w => w.id === req.params.id)

  if (!workflow) {
    return res.status(404).json({ error: 'Workflow no encontrado' })
  }

  const { type } = req.body // major, minor, patch
  const [major, minor, patch] = workflow.version.split('.').map(Number)

  let newVersion
  switch (type) {
    case 'major':
      newVersion = `${major + 1}.0.0`
      break
    case 'minor':
      newVersion = `${major}.${minor + 1}.0`
      break
    case 'patch':
    default:
      newVersion = `${major}.${minor}.${patch + 1}`
  }

  workflow.version = newVersion
  workflow.updatedAt = new Date()

  res.json({
    success: true,
    version: newVersion,
    workflow
  })
})

// DELETE /api/workflows/:id - Eliminar workflow
router.delete('/:id', (req, res) => {
  const index = workflows.findIndex(w => w.id === req.params.id)

  if (index === -1) {
    return res.status(404).json({ error: 'Workflow no encontrado' })
  }

  // Verificar que no esté en producción
  if (workflows[index].deployedVersions.prod) {
    return res.status(400).json({
      error: 'No se puede eliminar un workflow desplegado en producción'
    })
  }

  workflows.splice(index, 1)
  res.json({ success: true, message: 'Workflow eliminado' })
})

// GET /api/workflows/:id/executions - Historial de ejecuciones
router.get('/:id/executions', (req, res) => {
  const workflow = workflows.find(w => w.id === req.params.id)

  if (!workflow) {
    return res.status(404).json({ error: 'Workflow no encontrado' })
  }

  // Mock executions
  const executions = [
    {
      id: 'exec_001',
      workflowId: workflow.id,
      version: workflow.version,
      status: 'completed',
      startTime: new Date('2024-12-20T14:30:00'),
      endTime: new Date('2024-12-20T14:30:04'),
      duration: 4000,
      triggeredBy: 'manual',
      environment: 'dev'
    },
    {
      id: 'exec_002',
      workflowId: workflow.id,
      version: workflow.version,
      status: 'completed',
      startTime: new Date('2024-12-20T12:00:00'),
      endTime: new Date('2024-12-20T12:00:05'),
      duration: 5000,
      triggeredBy: 'scheduled',
      environment: 'dev'
    },
    {
      id: 'exec_003',
      workflowId: workflow.id,
      version: '1.1.0',
      status: 'failed',
      startTime: new Date('2024-12-19T16:45:00'),
      endTime: new Date('2024-12-19T16:45:02'),
      duration: 2000,
      triggeredBy: 'webhook',
      environment: 'qa',
      error: 'Connection timeout to external service'
    }
  ]

  res.json({
    executions,
    total: executions.length
  })
})

// POST /api/workflows/:id/compare - Comparar versiones
router.post('/:id/compare', (req, res) => {
  const { version1, version2 } = req.body

  // Mock comparison
  res.json({
    version1,
    version2,
    differences: {
      nodesAdded: 2,
      nodesRemoved: 1,
      nodesModified: 3,
      connectionsAdded: 2,
      connectionsRemoved: 1,
      variablesAdded: ['new_var'],
      variablesRemoved: []
    }
  })
})

export default router
