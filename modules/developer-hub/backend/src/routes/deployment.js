/**
 * Developer Hub - Deployment Routes
 * Gestión de despliegues entre ambientes
 */

import express from 'express'
import { v4 as uuidv4 } from 'uuid'

const router = express.Router()

// Mock deployments
let deployments = [
  {
    id: 'deploy_001',
    type: 'workflow',
    targetId: 'wf_001',
    targetName: 'Proceso de Ventas',
    version: '1.1.0',
    fromEnvironment: 'dev',
    toEnvironment: 'qa',
    status: 'completed',
    requestedBy: 'dev_001',
    approvedBy: 'dev_002',
    requestedAt: new Date('2024-12-18T10:00:00'),
    approvedAt: new Date('2024-12-18T11:30:00'),
    deployedAt: new Date('2024-12-18T11:35:00'),
    notes: 'Nueva versión con mejoras en validación'
  },
  {
    id: 'deploy_002',
    type: 'agent',
    targetId: 'agent_002',
    targetName: 'Invoice Processor',
    version: '2.1.0',
    fromEnvironment: 'dev',
    toEnvironment: 'qa',
    status: 'pending_approval',
    requestedBy: 'dev_002',
    approvedBy: null,
    requestedAt: new Date('2024-12-20T14:00:00'),
    approvedAt: null,
    deployedAt: null,
    notes: 'Mejoras en OCR para facturas internacionales'
  }
]

// Approval requirements by environment
const approvalRequirements = {
  dev: { required: false },
  qa: { required: true, minApprovers: 1, roles: ['senior_developer', 'qa_lead'] },
  prod: { required: true, minApprovers: 2, roles: ['senior_developer', 'tech_lead'] }
}

// GET /api/deployment - Listar despliegues
router.get('/', (req, res) => {
  const { status, environment, type } = req.query
  let filtered = [...deployments]

  if (status) {
    filtered = filtered.filter(d => d.status === status)
  }

  if (environment) {
    filtered = filtered.filter(d => d.toEnvironment === environment)
  }

  if (type) {
    filtered = filtered.filter(d => d.type === type)
  }

  // Ordenar por más reciente
  filtered.sort((a, b) => new Date(b.requestedAt) - new Date(a.requestedAt))

  res.json({
    deployments: filtered,
    total: filtered.length
  })
})

// GET /api/deployment/pending - Despliegues pendientes de aprobación
router.get('/pending', (req, res) => {
  const pending = deployments.filter(d => d.status === 'pending_approval')

  // Filtrar por permisos del usuario
  const canApprove = pending.filter(d => {
    const requirements = approvalRequirements[d.toEnvironment]
    return requirements.roles.some(role =>
      req.user.role === role || req.user.permissions.includes('*')
    )
  })

  res.json({
    deployments: canApprove,
    total: canApprove.length
  })
})

// POST /api/deployment/request - Solicitar despliegue
router.post('/request', (req, res) => {
  const { type, targetId, targetName, version, fromEnvironment, toEnvironment, notes } = req.body

  if (!type || !targetId || !version || !toEnvironment) {
    return res.status(400).json({
      error: 'type, targetId, version y toEnvironment son requeridos'
    })
  }

  // Verificar permisos para desplegar al ambiente destino
  if (!req.user.environments.includes(toEnvironment) && !req.user.permissions.includes('*')) {
    return res.status(403).json({
      error: `Sin permisos para desplegar a ${toEnvironment}`
    })
  }

  const requirements = approvalRequirements[toEnvironment]
  const initialStatus = requirements.required ? 'pending_approval' : 'approved'

  const deployment = {
    id: `deploy_${uuidv4().slice(0, 8)}`,
    type,
    targetId,
    targetName: targetName || targetId,
    version,
    fromEnvironment: fromEnvironment || 'dev',
    toEnvironment,
    status: initialStatus,
    requestedBy: req.user.id,
    approvedBy: requirements.required ? null : req.user.id,
    requestedAt: new Date(),
    approvedAt: requirements.required ? null : new Date(),
    deployedAt: null,
    notes: notes || '',
    approvers: [],
    requiredApprovers: requirements.minApprovers || 0
  }

  deployments.push(deployment)

  // Si no requiere aprobación, ejecutar despliegue automáticamente
  if (!requirements.required) {
    deployment.status = 'deploying'

    // Simular despliegue
    setTimeout(() => {
      const idx = deployments.findIndex(d => d.id === deployment.id)
      if (idx !== -1) {
        deployments[idx].status = 'completed'
        deployments[idx].deployedAt = new Date()
      }
    }, 3000)
  }

  res.status(201).json(deployment)
})

// POST /api/deployment/:id/approve - Aprobar despliegue
router.post('/:id/approve', (req, res) => {
  const deployment = deployments.find(d => d.id === req.params.id)

  if (!deployment) {
    return res.status(404).json({ error: 'Despliegue no encontrado' })
  }

  if (deployment.status !== 'pending_approval') {
    return res.status(400).json({ error: 'Este despliegue no está pendiente de aprobación' })
  }

  // Verificar permisos para aprobar
  const requirements = approvalRequirements[deployment.toEnvironment]
  const canApprove = requirements.roles.some(role =>
    req.user.role === role || req.user.permissions.includes('*')
  )

  if (!canApprove) {
    return res.status(403).json({ error: 'Sin permisos para aprobar este despliegue' })
  }

  // No puede aprobar su propio despliegue
  if (deployment.requestedBy === req.user.id) {
    return res.status(400).json({ error: 'No puedes aprobar tu propio despliegue' })
  }

  // Agregar aprobación
  if (!deployment.approvers) {
    deployment.approvers = []
  }

  if (!deployment.approvers.includes(req.user.id)) {
    deployment.approvers.push(req.user.id)
  }

  // Verificar si tiene suficientes aprobaciones
  if (deployment.approvers.length >= (deployment.requiredApprovers || 1)) {
    deployment.status = 'approved'
    deployment.approvedBy = deployment.approvers.join(', ')
    deployment.approvedAt = new Date()
  }

  res.json({
    success: true,
    deployment,
    message: deployment.status === 'approved'
      ? 'Despliegue aprobado y listo para ejecutar'
      : `Aprobación registrada. Faltan ${deployment.requiredApprovers - deployment.approvers.length} aprobaciones`
  })
})

// POST /api/deployment/:id/reject - Rechazar despliegue
router.post('/:id/reject', (req, res) => {
  const deployment = deployments.find(d => d.id === req.params.id)

  if (!deployment) {
    return res.status(404).json({ error: 'Despliegue no encontrado' })
  }

  if (deployment.status !== 'pending_approval') {
    return res.status(400).json({ error: 'Este despliegue no está pendiente de aprobación' })
  }

  const { reason } = req.body

  deployment.status = 'rejected'
  deployment.rejectedBy = req.user.id
  deployment.rejectedAt = new Date()
  deployment.rejectionReason = reason || 'Sin motivo especificado'

  res.json({ success: true, deployment })
})

// POST /api/deployment/:id/execute - Ejecutar despliegue
router.post('/:id/execute', async (req, res) => {
  const deployment = deployments.find(d => d.id === req.params.id)

  if (!deployment) {
    return res.status(404).json({ error: 'Despliegue no encontrado' })
  }

  if (deployment.status !== 'approved') {
    return res.status(400).json({ error: 'El despliegue debe estar aprobado para ejecutarse' })
  }

  deployment.status = 'deploying'
  deployment.executedBy = req.user.id
  deployment.executionStartedAt = new Date()

  // Simular proceso de despliegue
  setTimeout(() => {
    const idx = deployments.findIndex(d => d.id === deployment.id)
    if (idx !== -1) {
      deployments[idx].status = 'completed'
      deployments[idx].deployedAt = new Date()
    }
  }, 5000)

  res.json({
    success: true,
    message: 'Despliegue iniciado',
    deployment
  })
})

// POST /api/deployment/:id/rollback - Rollback de despliegue
router.post('/:id/rollback', async (req, res) => {
  const deployment = deployments.find(d => d.id === req.params.id)

  if (!deployment) {
    return res.status(404).json({ error: 'Despliegue no encontrado' })
  }

  if (deployment.status !== 'completed') {
    return res.status(400).json({ error: 'Solo se pueden revertir despliegues completados' })
  }

  const { reason } = req.body

  // Crear nuevo despliegue de rollback
  const rollback = {
    id: `deploy_${uuidv4().slice(0, 8)}`,
    type: deployment.type,
    targetId: deployment.targetId,
    targetName: deployment.targetName,
    version: `rollback-from-${deployment.version}`,
    fromEnvironment: deployment.toEnvironment,
    toEnvironment: deployment.toEnvironment,
    status: 'completed',
    requestedBy: req.user.id,
    approvedBy: req.user.id,
    requestedAt: new Date(),
    approvedAt: new Date(),
    deployedAt: new Date(),
    notes: `Rollback: ${reason || 'Revertido a versión anterior'}`,
    isRollback: true,
    rollbackOf: deployment.id
  }

  deployments.push(rollback)

  deployment.rolledBack = true
  deployment.rollbackId = rollback.id

  res.json({
    success: true,
    message: 'Rollback ejecutado',
    rollback
  })
})

// GET /api/deployment/:id - Obtener despliegue
router.get('/:id', (req, res) => {
  const deployment = deployments.find(d => d.id === req.params.id)

  if (!deployment) {
    return res.status(404).json({ error: 'Despliegue no encontrado' })
  }

  res.json(deployment)
})

// GET /api/deployment/environments/status - Estado de ambientes
router.get('/environments/status', (req, res) => {
  const environments = ['dev', 'qa', 'prod']

  const status = environments.map(env => {
    const envDeployments = deployments.filter(d => d.toEnvironment === env)
    const pending = envDeployments.filter(d => d.status === 'pending_approval')
    const deploying = envDeployments.filter(d => d.status === 'deploying')
    const lastDeployment = envDeployments
      .filter(d => d.status === 'completed')
      .sort((a, b) => new Date(b.deployedAt) - new Date(a.deployedAt))[0]

    return {
      environment: env,
      pendingApprovals: pending.length,
      activeDeployments: deploying.length,
      lastDeployment: lastDeployment ? {
        id: lastDeployment.id,
        version: lastDeployment.version,
        deployedAt: lastDeployment.deployedAt
      } : null
    }
  })

  res.json(status)
})

export default router
