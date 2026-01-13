/**
 * ALQVIMIA RPA 2.0 - Project Manager
 * Sistema de gestión de proyectos, logs y ejecuciones
 */

import { EventEmitter } from 'events'
import crypto from 'crypto'
import fs from 'fs/promises'
import path from 'path'

class ProjectManager extends EventEmitter {
  constructor(config = {}) {
    super()

    this.config = {
      projectsDir: config.projectsDir || process.env.PROJECTS_DIR || './projects',
      logsRetentionDays: config.logsRetentionDays || 90,
      maxLogFileSize: config.maxLogFileSize || 10 * 1024 * 1024, // 10MB
      ...config
    }

    // In-memory storage (use database in production)
    this.projects = new Map()
    this.executions = new Map()
    this.logs = []

    // Execution stats by organization
    this.orgStats = new Map()
  }

  // ==================== PROJECT MANAGEMENT ====================

  /**
   * Crear un nuevo proyecto
   */
  async createProject(data) {
    const projectId = `proj_${crypto.randomBytes(12).toString('hex')}`

    const project = {
      id: projectId,
      organizationId: data.organizationId,
      name: data.name,
      slug: data.slug || data.name.toLowerCase().replace(/\s+/g, '-'),
      description: data.description || '',
      status: 'active',

      // Settings
      settings: {
        timezone: data.timezone || 'America/Mexico_City',
        defaultRetries: data.defaultRetries || 3,
        defaultTimeout: data.defaultTimeout || 300000, // 5 min
        notifications: {
          email: data.notificationEmail || null,
          slack: data.slackWebhook || null,
          onSuccess: false,
          onFailure: true,
          onStart: false
        },
        variables: data.variables || {}
      },

      // Paths
      paths: {
        root: path.join(this.config.projectsDir, data.organizationId, projectId),
        workflows: 'workflows',
        agents: 'agents',
        logs: 'logs',
        data: 'data',
        outputs: 'outputs'
      },

      // Stats
      stats: {
        totalWorkflows: 0,
        totalExecutions: 0,
        successfulExecutions: 0,
        failedExecutions: 0,
        totalRuntime: 0, // ms
        lastExecutionAt: null
      },

      // Metadata
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: data.createdBy
    }

    // Create directory structure
    await this._createProjectDirectories(project)

    // Store
    this.projects.set(projectId, project)

    this.emit('project:created', project)

    return project
  }

  /**
   * Crear estructura de directorios del proyecto
   */
  async _createProjectDirectories(project) {
    const dirs = [
      project.paths.root,
      path.join(project.paths.root, project.paths.workflows),
      path.join(project.paths.root, project.paths.agents),
      path.join(project.paths.root, project.paths.logs),
      path.join(project.paths.root, project.paths.data),
      path.join(project.paths.root, project.paths.data, 'inputs'),
      path.join(project.paths.root, project.paths.data, 'outputs'),
      path.join(project.paths.root, project.paths.data, 'temp'),
      path.join(project.paths.root, '.alqvimia')
    ]

    for (const dir of dirs) {
      try {
        await fs.mkdir(dir, { recursive: true })
      } catch (error) {
        // Directory might already exist
      }
    }

    // Create config file
    const configPath = path.join(project.paths.root, '.alqvimia', 'config.json')
    await fs.writeFile(configPath, JSON.stringify({
      projectId: project.id,
      organizationId: project.organizationId,
      name: project.name,
      settings: project.settings,
      createdAt: project.createdAt
    }, null, 2))
  }

  /**
   * Obtener proyecto por ID
   */
  getProject(projectId) {
    return this.projects.get(projectId)
  }

  /**
   * Listar proyectos
   */
  listProjects(filters = {}) {
    let projects = [...this.projects.values()]

    if (filters.organizationId) {
      projects = projects.filter(p => p.organizationId === filters.organizationId)
    }
    if (filters.status) {
      projects = projects.filter(p => p.status === filters.status)
    }
    if (filters.search) {
      const term = filters.search.toLowerCase()
      projects = projects.filter(p =>
        p.name.toLowerCase().includes(term) ||
        p.description.toLowerCase().includes(term)
      )
    }

    return projects
  }

  /**
   * Actualizar proyecto
   */
  async updateProject(projectId, updates) {
    const project = this.projects.get(projectId)

    if (!project) {
      throw new Error('Project not found')
    }

    Object.assign(project, updates, { updatedAt: new Date() })

    this.emit('project:updated', project)

    return project
  }

  /**
   * Archivar proyecto
   */
  async archiveProject(projectId) {
    const project = this.projects.get(projectId)

    if (!project) {
      throw new Error('Project not found')
    }

    project.status = 'archived'
    project.archivedAt = new Date()

    this.emit('project:archived', project)

    return project
  }

  // ==================== EXECUTION MANAGEMENT ====================

  /**
   * Iniciar una ejecución
   */
  startExecution(data) {
    const executionId = `exec_${crypto.randomBytes(12).toString('hex')}`

    const execution = {
      id: executionId,
      projectId: data.projectId,
      workflowId: data.workflowId,
      workflowName: data.workflowName,
      workflowVersion: data.workflowVersion || '1.0.0',
      organizationId: data.organizationId,

      // Execution info
      triggeredBy: data.triggeredBy || 'manual', // manual, scheduler, api, webhook
      triggeredByUser: data.userId,
      agentId: data.agentId,

      // Status
      status: 'running', // pending, running, completed, failed, cancelled
      startedAt: new Date(),
      completedAt: null,
      duration: null,

      // Progress
      progress: {
        currentStep: 0,
        totalSteps: data.totalSteps || 0,
        percentage: 0,
        currentAction: null
      },

      // Steps log
      steps: [],

      // Results
      result: null,
      error: null,

      // Metrics
      metrics: {
        stepsExecuted: 0,
        stepsSuccess: 0,
        stepsFailed: 0,
        stepsSkipped: 0,
        retries: 0,
        dataProcessed: 0,
        apiCalls: 0,
        dbQueries: 0
      },

      // Resources
      resources: {
        cpu: 0,
        memory: 0,
        network: 0
      },

      // Billing
      cost: 0,

      // Context/Input
      input: data.input || {},
      variables: data.variables || {}
    }

    this.executions.set(executionId, execution)

    // Update project stats
    const project = this.projects.get(data.projectId)
    if (project) {
      project.stats.totalExecutions++
      project.stats.lastExecutionAt = execution.startedAt
    }

    // Log
    this._log('info', `Execution started: ${executionId}`, {
      executionId,
      projectId: data.projectId,
      workflowId: data.workflowId,
      organizationId: data.organizationId
    })

    this.emit('execution:started', execution)

    return execution
  }

  /**
   * Actualizar progreso de ejecución
   */
  updateExecutionProgress(executionId, progress) {
    const execution = this.executions.get(executionId)

    if (!execution) {
      throw new Error('Execution not found')
    }

    execution.progress = {
      ...execution.progress,
      ...progress,
      percentage: progress.totalSteps > 0
        ? Math.round((progress.currentStep / progress.totalSteps) * 100)
        : 0
    }

    this.emit('execution:progress', execution)

    return execution
  }

  /**
   * Registrar paso de ejecución
   */
  logExecutionStep(executionId, step) {
    const execution = this.executions.get(executionId)

    if (!execution) {
      throw new Error('Execution not found')
    }

    const stepLog = {
      stepNumber: execution.steps.length + 1,
      action: step.action,
      actionType: step.actionType,
      agentId: step.agentId,
      startedAt: step.startedAt || new Date(),
      completedAt: step.completedAt,
      duration: step.duration,
      status: step.status, // running, success, failed, skipped
      input: step.input,
      output: step.output,
      error: step.error,
      retryCount: step.retryCount || 0,
      metadata: step.metadata || {}
    }

    execution.steps.push(stepLog)

    // Update metrics
    execution.metrics.stepsExecuted++
    if (step.status === 'success') execution.metrics.stepsSuccess++
    if (step.status === 'failed') execution.metrics.stepsFailed++
    if (step.status === 'skipped') execution.metrics.stepsSkipped++

    // Calculate cost
    execution.cost += this._calculateStepCost(step)

    // Log
    this._log(step.status === 'failed' ? 'error' : 'info', `Step ${stepLog.stepNumber}: ${step.action} - ${step.status}`, {
      executionId,
      stepNumber: stepLog.stepNumber,
      action: step.action,
      duration: step.duration,
      status: step.status
    })

    this.emit('execution:step', { execution, step: stepLog })

    return stepLog
  }

  /**
   * Completar ejecución exitosamente
   */
  completeExecution(executionId, result) {
    const execution = this.executions.get(executionId)

    if (!execution) {
      throw new Error('Execution not found')
    }

    execution.status = 'completed'
    execution.completedAt = new Date()
    execution.duration = execution.completedAt - execution.startedAt
    execution.result = result
    execution.progress.percentage = 100

    // Update project stats
    const project = this.projects.get(execution.projectId)
    if (project) {
      project.stats.successfulExecutions++
      project.stats.totalRuntime += execution.duration
    }

    // Update org stats
    this._updateOrgStats(execution.organizationId, 'success', execution)

    this._log('info', `Execution completed: ${executionId}`, {
      executionId,
      duration: execution.duration,
      stepsExecuted: execution.metrics.stepsExecuted,
      cost: execution.cost
    })

    this.emit('execution:completed', execution)

    return execution
  }

  /**
   * Marcar ejecución como fallida
   */
  failExecution(executionId, error) {
    const execution = this.executions.get(executionId)

    if (!execution) {
      throw new Error('Execution not found')
    }

    execution.status = 'failed'
    execution.completedAt = new Date()
    execution.duration = execution.completedAt - execution.startedAt
    execution.error = {
      message: error.message || error,
      stack: error.stack,
      code: error.code,
      step: execution.progress.currentStep
    }

    // Update project stats
    const project = this.projects.get(execution.projectId)
    if (project) {
      project.stats.failedExecutions++
      project.stats.totalRuntime += execution.duration
    }

    // Update org stats
    this._updateOrgStats(execution.organizationId, 'failed', execution)

    this._log('error', `Execution failed: ${executionId} - ${error.message || error}`, {
      executionId,
      duration: execution.duration,
      error: execution.error
    })

    this.emit('execution:failed', execution)

    return execution
  }

  /**
   * Cancelar ejecución
   */
  cancelExecution(executionId, reason) {
    const execution = this.executions.get(executionId)

    if (!execution) {
      throw new Error('Execution not found')
    }

    if (execution.status !== 'running') {
      throw new Error('Execution is not running')
    }

    execution.status = 'cancelled'
    execution.completedAt = new Date()
    execution.duration = execution.completedAt - execution.startedAt
    execution.cancelledBy = reason?.userId
    execution.cancelReason = reason?.message || 'Cancelled by user'

    this._log('warn', `Execution cancelled: ${executionId}`, {
      executionId,
      reason: execution.cancelReason
    })

    this.emit('execution:cancelled', execution)

    return execution
  }

  /**
   * Obtener ejecución por ID
   */
  getExecution(executionId) {
    return this.executions.get(executionId)
  }

  /**
   * Listar ejecuciones
   */
  listExecutions(filters = {}) {
    let executions = [...this.executions.values()]

    if (filters.projectId) {
      executions = executions.filter(e => e.projectId === filters.projectId)
    }
    if (filters.organizationId) {
      executions = executions.filter(e => e.organizationId === filters.organizationId)
    }
    if (filters.workflowId) {
      executions = executions.filter(e => e.workflowId === filters.workflowId)
    }
    if (filters.status) {
      executions = executions.filter(e => e.status === filters.status)
    }
    if (filters.startDate) {
      executions = executions.filter(e => new Date(e.startedAt) >= new Date(filters.startDate))
    }
    if (filters.endDate) {
      executions = executions.filter(e => new Date(e.startedAt) <= new Date(filters.endDate))
    }

    // Sort by most recent
    executions.sort((a, b) => new Date(b.startedAt) - new Date(a.startedAt))

    // Limit
    if (filters.limit) {
      executions = executions.slice(0, filters.limit)
    }

    return executions
  }

  /**
   * Calcular costo de un paso
   */
  _calculateStepCost(step) {
    const costs = {
      database: 0.001, // $0.001 per query
      api: 0.002, // $0.002 per API call
      ai: 0.05, // $0.05 per AI call
      storage: 0.0001, // $0.0001 per file operation
      default: 0.0005
    }

    return costs[step.actionType] || costs.default
  }

  /**
   * Actualizar estadísticas de organización
   */
  _updateOrgStats(organizationId, status, execution) {
    if (!this.orgStats.has(organizationId)) {
      this.orgStats.set(organizationId, {
        totalExecutions: 0,
        successfulExecutions: 0,
        failedExecutions: 0,
        totalRuntime: 0,
        totalCost: 0
      })
    }

    const stats = this.orgStats.get(organizationId)
    stats.totalExecutions++
    if (status === 'success') stats.successfulExecutions++
    if (status === 'failed') stats.failedExecutions++
    stats.totalRuntime += execution.duration
    stats.totalCost += execution.cost
  }

  // ==================== LOGGING ====================

  /**
   * Log genérico
   */
  _log(level, message, metadata = {}) {
    const log = {
      id: `log_${crypto.randomBytes(8).toString('hex')}`,
      timestamp: new Date(),
      level,
      message,
      ...metadata
    }

    this.logs.push(log)

    // Cleanup old logs
    if (this.logs.length > 10000) {
      this.logs = this.logs.slice(-5000)
    }

    this.emit('log', log)

    // Console output
    const prefix = {
      info: '\x1b[36m[INFO]\x1b[0m',
      warn: '\x1b[33m[WARN]\x1b[0m',
      error: '\x1b[31m[ERROR]\x1b[0m',
      debug: '\x1b[90m[DEBUG]\x1b[0m'
    }

    console.log(`${log.timestamp.toISOString()} ${prefix[level] || '[LOG]'} ${message}`)

    return log
  }

  /**
   * Obtener logs
   */
  getLogs(filters = {}) {
    let logs = [...this.logs]

    if (filters.executionId) {
      logs = logs.filter(l => l.executionId === filters.executionId)
    }
    if (filters.projectId) {
      logs = logs.filter(l => l.projectId === filters.projectId)
    }
    if (filters.organizationId) {
      logs = logs.filter(l => l.organizationId === filters.organizationId)
    }
    if (filters.level) {
      logs = logs.filter(l => l.level === filters.level)
    }
    if (filters.startDate) {
      logs = logs.filter(l => new Date(l.timestamp) >= new Date(filters.startDate))
    }
    if (filters.endDate) {
      logs = logs.filter(l => new Date(l.timestamp) <= new Date(filters.endDate))
    }
    if (filters.search) {
      const term = filters.search.toLowerCase()
      logs = logs.filter(l => l.message.toLowerCase().includes(term))
    }

    // Sort by most recent
    logs.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))

    // Limit
    if (filters.limit) {
      logs = logs.slice(0, filters.limit)
    }

    return logs
  }

  /**
   * Exportar logs de una ejecución a archivo
   */
  async exportExecutionLogs(executionId) {
    const execution = this.executions.get(executionId)

    if (!execution) {
      throw new Error('Execution not found')
    }

    const project = this.projects.get(execution.projectId)
    const logsDir = project
      ? path.join(project.paths.root, project.paths.logs)
      : './logs'

    const filename = `execution_${executionId}_${execution.startedAt.toISOString().split('T')[0]}.json`
    const filepath = path.join(logsDir, filename)

    const exportData = {
      execution: {
        id: execution.id,
        projectId: execution.projectId,
        workflowId: execution.workflowId,
        workflowName: execution.workflowName,
        status: execution.status,
        startedAt: execution.startedAt,
        completedAt: execution.completedAt,
        duration: execution.duration,
        triggeredBy: execution.triggeredBy,
        metrics: execution.metrics,
        cost: execution.cost
      },
      steps: execution.steps,
      logs: this.getLogs({ executionId }),
      result: execution.result,
      error: execution.error
    }

    try {
      await fs.mkdir(logsDir, { recursive: true })
      await fs.writeFile(filepath, JSON.stringify(exportData, null, 2))
    } catch (error) {
      console.error('Error exporting logs:', error)
    }

    return filepath
  }

  // ==================== ANALYTICS ====================

  /**
   * Obtener analytics de un proyecto
   */
  getProjectAnalytics(projectId, period = '7d') {
    const project = this.projects.get(projectId)

    if (!project) {
      throw new Error('Project not found')
    }

    const executions = this.listExecutions({ projectId })

    // Filter by period
    const now = new Date()
    const periodMs = {
      '1d': 24 * 60 * 60 * 1000,
      '7d': 7 * 24 * 60 * 60 * 1000,
      '30d': 30 * 24 * 60 * 60 * 1000,
      '90d': 90 * 24 * 60 * 60 * 1000
    }

    const cutoff = new Date(now.getTime() - (periodMs[period] || periodMs['7d']))
    const filteredExecutions = executions.filter(e => new Date(e.startedAt) >= cutoff)

    const successful = filteredExecutions.filter(e => e.status === 'completed')
    const failed = filteredExecutions.filter(e => e.status === 'failed')

    return {
      project: {
        id: project.id,
        name: project.name
      },
      period,
      summary: {
        totalExecutions: filteredExecutions.length,
        successfulExecutions: successful.length,
        failedExecutions: failed.length,
        successRate: filteredExecutions.length > 0
          ? (successful.length / filteredExecutions.length) * 100
          : 0,
        averageDuration: successful.length > 0
          ? successful.reduce((sum, e) => sum + e.duration, 0) / successful.length
          : 0,
        totalCost: filteredExecutions.reduce((sum, e) => sum + e.cost, 0),
        totalRuntime: filteredExecutions.reduce((sum, e) => sum + (e.duration || 0), 0)
      },
      executionsByDay: this._groupExecutionsByDay(filteredExecutions),
      topWorkflows: this._getTopWorkflows(filteredExecutions),
      errorAnalysis: this._analyzeErrors(failed),
      performanceTrend: this._getPerformanceTrend(filteredExecutions)
    }
  }

  _groupExecutionsByDay(executions) {
    const byDay = {}

    for (const exec of executions) {
      const day = new Date(exec.startedAt).toISOString().split('T')[0]
      if (!byDay[day]) {
        byDay[day] = { date: day, total: 0, success: 0, failed: 0 }
      }
      byDay[day].total++
      if (exec.status === 'completed') byDay[day].success++
      if (exec.status === 'failed') byDay[day].failed++
    }

    return Object.values(byDay).sort((a, b) => a.date.localeCompare(b.date))
  }

  _getTopWorkflows(executions) {
    const byWorkflow = {}

    for (const exec of executions) {
      if (!byWorkflow[exec.workflowId]) {
        byWorkflow[exec.workflowId] = {
          workflowId: exec.workflowId,
          workflowName: exec.workflowName,
          executions: 0,
          successful: 0,
          averageDuration: 0,
          totalDuration: 0
        }
      }
      byWorkflow[exec.workflowId].executions++
      if (exec.status === 'completed') {
        byWorkflow[exec.workflowId].successful++
        byWorkflow[exec.workflowId].totalDuration += exec.duration || 0
      }
    }

    // Calculate averages
    for (const wf of Object.values(byWorkflow)) {
      if (wf.successful > 0) {
        wf.averageDuration = wf.totalDuration / wf.successful
      }
      wf.successRate = (wf.successful / wf.executions) * 100
    }

    return Object.values(byWorkflow)
      .sort((a, b) => b.executions - a.executions)
      .slice(0, 10)
  }

  _analyzeErrors(failedExecutions) {
    const errorTypes = {}

    for (const exec of failedExecutions) {
      if (exec.error) {
        const errorType = exec.error.code || 'UNKNOWN_ERROR'
        if (!errorTypes[errorType]) {
          errorTypes[errorType] = {
            type: errorType,
            count: 0,
            examples: []
          }
        }
        errorTypes[errorType].count++
        if (errorTypes[errorType].examples.length < 3) {
          errorTypes[errorType].examples.push({
            executionId: exec.id,
            message: exec.error.message,
            step: exec.error.step
          })
        }
      }
    }

    return Object.values(errorTypes).sort((a, b) => b.count - a.count)
  }

  _getPerformanceTrend(executions) {
    const completed = executions.filter(e => e.status === 'completed')

    if (completed.length < 2) {
      return { trend: 'stable', change: 0 }
    }

    // Split into two halves
    const mid = Math.floor(completed.length / 2)
    const firstHalf = completed.slice(mid)
    const secondHalf = completed.slice(0, mid)

    const avgFirst = firstHalf.reduce((sum, e) => sum + e.duration, 0) / firstHalf.length
    const avgSecond = secondHalf.reduce((sum, e) => sum + e.duration, 0) / secondHalf.length

    const change = ((avgSecond - avgFirst) / avgFirst) * 100

    return {
      trend: change > 5 ? 'slower' : change < -5 ? 'faster' : 'stable',
      change: Math.round(change * 10) / 10,
      firstPeriodAvg: Math.round(avgFirst),
      secondPeriodAvg: Math.round(avgSecond)
    }
  }

  /**
   * Obtener estadísticas de organización
   */
  getOrganizationStats(organizationId) {
    const stats = this.orgStats.get(organizationId) || {
      totalExecutions: 0,
      successfulExecutions: 0,
      failedExecutions: 0,
      totalRuntime: 0,
      totalCost: 0
    }

    const projects = this.listProjects({ organizationId })

    return {
      ...stats,
      successRate: stats.totalExecutions > 0
        ? (stats.successfulExecutions / stats.totalExecutions) * 100
        : 0,
      averageRuntime: stats.totalExecutions > 0
        ? stats.totalRuntime / stats.totalExecutions
        : 0,
      projectCount: projects.length,
      activeProjects: projects.filter(p => p.status === 'active').length
    }
  }
}

export default ProjectManager
