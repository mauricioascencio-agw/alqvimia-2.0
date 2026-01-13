/**
 * Developer Hub - Testing Routes
 * Gestión de pruebas automatizadas
 */

import express from 'express'
import { v4 as uuidv4 } from 'uuid'

const router = express.Router()

// Mock test suites
let testSuites = [
  {
    id: 'suite_001',
    name: 'Sales Workflow Tests',
    description: 'Pruebas para el workflow de ventas',
    projectId: 'proj_001',
    workflowId: 'wf_001',
    createdBy: 'dev_001',
    createdAt: new Date('2024-03-15'),
    updatedAt: new Date('2024-12-20'),
    tests: [
      { id: 'test_001', name: 'Create sale flow', status: 'active' },
      { id: 'test_002', name: 'Validate customer data', status: 'active' },
      { id: 'test_003', name: 'Calculate discounts', status: 'active' },
      { id: 'test_004', name: 'Generate invoice', status: 'active' }
    ],
    lastRun: {
      id: 'run_001',
      status: 'passed',
      timestamp: new Date('2024-12-20T10:00:00'),
      passed: 4,
      failed: 0,
      duration: 12500
    }
  },
  {
    id: 'suite_002',
    name: 'Invoice Agent Tests',
    description: 'Pruebas para el agente de facturas',
    projectId: 'proj_002',
    agentId: 'agent_002',
    createdBy: 'dev_002',
    createdAt: new Date('2024-06-01'),
    updatedAt: new Date('2024-12-18'),
    tests: [
      { id: 'test_005', name: 'OCR extraction accuracy', status: 'active' },
      { id: 'test_006', name: 'Vendor matching', status: 'active' },
      { id: 'test_007', name: 'Amount validation', status: 'active' },
      { id: 'test_008', name: 'Error handling', status: 'disabled' }
    ],
    lastRun: {
      id: 'run_002',
      status: 'failed',
      timestamp: new Date('2024-12-18T14:30:00'),
      passed: 2,
      failed: 1,
      skipped: 1,
      duration: 25000
    }
  }
]

// Mock test runs
let testRuns = []

// GET /api/testing/suites - Listar test suites
router.get('/suites', (req, res) => {
  const { projectId, status } = req.query
  let filtered = [...testSuites]

  if (projectId) {
    filtered = filtered.filter(s => s.projectId === projectId)
  }

  if (status) {
    filtered = filtered.filter(s => s.lastRun?.status === status)
  }

  res.json({
    suites: filtered,
    total: filtered.length
  })
})

// GET /api/testing/suites/:id - Obtener test suite
router.get('/suites/:id', (req, res) => {
  const suite = testSuites.find(s => s.id === req.params.id)

  if (!suite) {
    return res.status(404).json({ error: 'Test suite no encontrado' })
  }

  res.json(suite)
})

// POST /api/testing/suites - Crear test suite
router.post('/suites', (req, res) => {
  const { name, description, projectId, workflowId, agentId } = req.body

  if (!name || !projectId) {
    return res.status(400).json({ error: 'name y projectId son requeridos' })
  }

  const newSuite = {
    id: `suite_${uuidv4().slice(0, 8)}`,
    name,
    description: description || '',
    projectId,
    workflowId: workflowId || null,
    agentId: agentId || null,
    createdBy: req.user.id,
    createdAt: new Date(),
    updatedAt: new Date(),
    tests: [],
    lastRun: null
  }

  testSuites.push(newSuite)
  res.status(201).json(newSuite)
})

// POST /api/testing/suites/:id/tests - Agregar test a suite
router.post('/suites/:id/tests', (req, res) => {
  const suite = testSuites.find(s => s.id === req.params.id)

  if (!suite) {
    return res.status(404).json({ error: 'Test suite no encontrado' })
  }

  const { name, description, steps, expectedResult } = req.body

  if (!name) {
    return res.status(400).json({ error: 'name es requerido' })
  }

  const newTest = {
    id: `test_${uuidv4().slice(0, 8)}`,
    name,
    description: description || '',
    status: 'active',
    steps: steps || [],
    expectedResult: expectedResult || null,
    createdAt: new Date()
  }

  suite.tests.push(newTest)
  suite.updatedAt = new Date()

  res.status(201).json(newTest)
})

// PUT /api/testing/suites/:suiteId/tests/:testId - Actualizar test
router.put('/suites/:suiteId/tests/:testId', (req, res) => {
  const suite = testSuites.find(s => s.id === req.params.suiteId)

  if (!suite) {
    return res.status(404).json({ error: 'Test suite no encontrado' })
  }

  const testIndex = suite.tests.findIndex(t => t.id === req.params.testId)

  if (testIndex === -1) {
    return res.status(404).json({ error: 'Test no encontrado' })
  }

  const { name, description, status, steps, expectedResult } = req.body

  suite.tests[testIndex] = {
    ...suite.tests[testIndex],
    name: name || suite.tests[testIndex].name,
    description: description !== undefined ? description : suite.tests[testIndex].description,
    status: status || suite.tests[testIndex].status,
    steps: steps || suite.tests[testIndex].steps,
    expectedResult: expectedResult !== undefined ? expectedResult : suite.tests[testIndex].expectedResult
  }

  suite.updatedAt = new Date()

  res.json(suite.tests[testIndex])
})

// POST /api/testing/suites/:id/run - Ejecutar test suite
router.post('/suites/:id/run', async (req, res) => {
  const suite = testSuites.find(s => s.id === req.params.id)

  if (!suite) {
    return res.status(404).json({ error: 'Test suite no encontrado' })
  }

  const { environment } = req.body

  // Verificar permisos de ambiente
  if (!req.user.environments.includes(environment || 'dev')) {
    return res.status(403).json({
      error: `Sin permisos para ejecutar pruebas en ${environment || 'dev'}`
    })
  }

  const activeTests = suite.tests.filter(t => t.status === 'active')

  const run = {
    id: `run_${uuidv4().slice(0, 8)}`,
    suiteId: suite.id,
    suiteName: suite.name,
    environment: environment || 'dev',
    status: 'running',
    startedAt: new Date(),
    completedAt: null,
    triggeredBy: req.user.id,
    results: activeTests.map(t => ({
      testId: t.id,
      testName: t.name,
      status: 'pending',
      duration: null,
      error: null
    })),
    summary: {
      total: activeTests.length,
      passed: 0,
      failed: 0,
      skipped: suite.tests.filter(t => t.status === 'disabled').length
    }
  }

  testRuns.push(run)

  // Simular ejecución de tests
  setTimeout(async () => {
    const runIndex = testRuns.findIndex(r => r.id === run.id)
    if (runIndex === -1) return

    // Simular resultados aleatorios
    let passed = 0
    let failed = 0

    for (let i = 0; i < testRuns[runIndex].results.length; i++) {
      const success = Math.random() > 0.2 // 80% de éxito
      testRuns[runIndex].results[i].status = success ? 'passed' : 'failed'
      testRuns[runIndex].results[i].duration = Math.floor(Math.random() * 5000) + 500

      if (success) {
        passed++
      } else {
        failed++
        testRuns[runIndex].results[i].error = 'Assertion failed: Expected value did not match'
      }
    }

    testRuns[runIndex].status = failed > 0 ? 'failed' : 'passed'
    testRuns[runIndex].completedAt = new Date()
    testRuns[runIndex].summary.passed = passed
    testRuns[runIndex].summary.failed = failed

    // Actualizar lastRun en el suite
    const suiteIdx = testSuites.findIndex(s => s.id === suite.id)
    if (suiteIdx !== -1) {
      testSuites[suiteIdx].lastRun = {
        id: run.id,
        status: testRuns[runIndex].status,
        timestamp: testRuns[runIndex].completedAt,
        passed,
        failed,
        skipped: testRuns[runIndex].summary.skipped,
        duration: testRuns[runIndex].results.reduce((sum, r) => sum + (r.duration || 0), 0)
      }
    }
  }, 5000)

  res.json({
    runId: run.id,
    status: 'started',
    message: `Ejecutando ${activeTests.length} pruebas...`
  })
})

// GET /api/testing/runs/:id - Obtener resultado de ejecución
router.get('/runs/:id', (req, res) => {
  const run = testRuns.find(r => r.id === req.params.id)

  if (!run) {
    return res.status(404).json({ error: 'Test run no encontrado' })
  }

  res.json(run)
})

// GET /api/testing/runs - Historial de ejecuciones
router.get('/runs', (req, res) => {
  const { suiteId, status, environment, limit = 20 } = req.query
  let filtered = [...testRuns]

  if (suiteId) {
    filtered = filtered.filter(r => r.suiteId === suiteId)
  }

  if (status) {
    filtered = filtered.filter(r => r.status === status)
  }

  if (environment) {
    filtered = filtered.filter(r => r.environment === environment)
  }

  // Ordenar por más reciente
  filtered.sort((a, b) => new Date(b.startedAt) - new Date(a.startedAt))
  filtered = filtered.slice(0, parseInt(limit))

  res.json({
    runs: filtered,
    total: filtered.length
  })
})

// GET /api/testing/coverage - Cobertura de pruebas
router.get('/coverage', (req, res) => {
  const { projectId } = req.query

  // Mock coverage data
  const coverage = {
    overall: 78.5,
    byProject: [
      { projectId: 'proj_001', name: 'CRM Automation', coverage: 85.2, tests: 15 },
      { projectId: 'proj_002', name: 'Invoice Processing', coverage: 72.1, tests: 8 }
    ],
    byType: {
      workflows: 82.0,
      agents: 65.0
    },
    uncovered: [
      { id: 'wf_002', name: 'Sincronización de Inventario', type: 'workflow' },
      { id: 'agent_003', name: 'Support Bot', type: 'agent' }
    ]
  }

  if (projectId) {
    const projectCoverage = coverage.byProject.find(p => p.projectId === projectId)
    return res.json(projectCoverage || { coverage: 0, tests: 0 })
  }

  res.json(coverage)
})

// POST /api/testing/mock - Crear datos de prueba (mock)
router.post('/mock', (req, res) => {
  const { type, schema, count } = req.body

  if (!type || !schema) {
    return res.status(400).json({ error: 'type y schema son requeridos' })
  }

  // Generar datos mock basados en schema
  const mockData = []
  const numRecords = count || 5

  for (let i = 0; i < numRecords; i++) {
    const record = {}

    for (const [key, config] of Object.entries(schema)) {
      switch (config.type) {
        case 'string':
          record[key] = `${config.prefix || ''}${uuidv4().slice(0, 8)}`
          break
        case 'number':
          record[key] = Math.floor(Math.random() * (config.max || 1000)) + (config.min || 0)
          break
        case 'boolean':
          record[key] = Math.random() > 0.5
          break
        case 'date':
          record[key] = new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000)
          break
        case 'enum':
          record[key] = config.values[Math.floor(Math.random() * config.values.length)]
          break
        default:
          record[key] = null
      }
    }

    mockData.push(record)
  }

  res.json({
    type,
    count: numRecords,
    data: mockData
  })
})

// DELETE /api/testing/suites/:id - Eliminar test suite
router.delete('/suites/:id', (req, res) => {
  const index = testSuites.findIndex(s => s.id === req.params.id)

  if (index === -1) {
    return res.status(404).json({ error: 'Test suite no encontrado' })
  }

  testSuites.splice(index, 1)
  res.json({ success: true, message: 'Test suite eliminado' })
})

export default router
