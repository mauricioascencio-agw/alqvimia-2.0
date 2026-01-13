/**
 * ALQVIMIA RPA 2.0 - Activity Tracker
 * Sistema de tracking completo de actividad de clientes
 * Monitorea ejecuciones, agentes, usuarios, eventos de seguridad
 */

import mysql from 'mysql2/promise'
import { EventEmitter } from 'events'

// Tipos de eventos a trackear
export const EVENT_TYPES = {
  // Ejecuciones
  WORKFLOW_START: 'workflow.start',
  WORKFLOW_COMPLETE: 'workflow.complete',
  WORKFLOW_FAIL: 'workflow.fail',
  STEP_EXECUTE: 'step.execute',
  STEP_FAIL: 'step.fail',

  // Agentes
  AGENT_START: 'agent.start',
  AGENT_STOP: 'agent.stop',
  AGENT_ERROR: 'agent.error',
  AGENT_CONNECT: 'agent.connect',
  AGENT_DISCONNECT: 'agent.disconnect',

  // Usuarios
  USER_LOGIN: 'user.login',
  USER_LOGOUT: 'user.logout',
  USER_CREATE: 'user.create',
  USER_UPDATE: 'user.update',
  USER_DELETE: 'user.delete',
  USER_PASSWORD_CHANGE: 'user.password_change',
  USER_2FA_ENABLE: 'user.2fa_enable',

  // API
  API_CALL: 'api.call',
  API_ERROR: 'api.error',
  API_RATE_LIMIT: 'api.rate_limit',
  WEBHOOK_TRIGGER: 'webhook.trigger',
  WEBHOOK_FAIL: 'webhook.fail',

  // Seguridad
  SECURITY_LOGIN_FAIL: 'security.login_fail',
  SECURITY_SUSPICIOUS: 'security.suspicious',
  SECURITY_IP_BLOCKED: 'security.ip_blocked',
  SECURITY_TOKEN_INVALID: 'security.token_invalid',

  // Billing
  BILLING_INVOICE: 'billing.invoice',
  BILLING_PAYMENT: 'billing.payment',
  BILLING_OVERDUE: 'billing.overdue',

  // Sistema
  SYSTEM_CONFIG_CHANGE: 'system.config_change',
  SYSTEM_UPGRADE: 'system.upgrade',
  SYSTEM_BACKUP: 'system.backup',

  // Integraciones
  INTEGRATION_CONNECT: 'integration.connect',
  INTEGRATION_DISCONNECT: 'integration.disconnect',
  INTEGRATION_SYNC: 'integration.sync',
  INTEGRATION_ERROR: 'integration.error'
}

// Niveles de severidad
export const SEVERITY = {
  DEBUG: 'debug',
  INFO: 'info',
  WARNING: 'warning',
  ERROR: 'error',
  CRITICAL: 'critical'
}

export class ActivityTracker extends EventEmitter {
  constructor(config = {}) {
    super()
    this.dbConfig = config.database || {
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'alqvimia'
    }
    this.pool = null
    this.buffer = []
    this.bufferSize = config.bufferSize || 100
    this.flushInterval = config.flushInterval || 5000
    this.flushTimer = null
    this.realTimeEnabled = config.realTime || true
    this.retentionDays = config.retentionDays || 90
  }

  async initialize() {
    this.pool = mysql.createPool(this.dbConfig)

    // Crear tablas
    await this.createTables()

    // Iniciar flush automático
    this.startAutoFlush()

    // Limpiar logs antiguos periódicamente
    this.startCleanup()

    console.log('ActivityTracker initialized')
  }

  async createTables() {
    const queries = [
      // Tabla principal de actividad
      `CREATE TABLE IF NOT EXISTS activity_logs (
        id BIGINT AUTO_INCREMENT PRIMARY KEY,
        tenant_id VARCHAR(50) NOT NULL,
        event_type VARCHAR(100) NOT NULL,
        severity ENUM('debug', 'info', 'warning', 'error', 'critical') DEFAULT 'info',
        actor_id VARCHAR(50),
        actor_type ENUM('user', 'agent', 'system', 'api', 'webhook') DEFAULT 'user',
        actor_name VARCHAR(255),
        resource_type VARCHAR(50),
        resource_id VARCHAR(50),
        resource_name VARCHAR(255),
        message TEXT,
        metadata JSON,
        ip_address VARCHAR(45),
        user_agent TEXT,
        session_id VARCHAR(100),
        duration_ms INT,
        status ENUM('success', 'failure', 'pending') DEFAULT 'success',
        error_code VARCHAR(50),
        error_message TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_tenant_time (tenant_id, created_at),
        INDEX idx_event_type (event_type),
        INDEX idx_severity (severity),
        INDEX idx_actor (actor_id),
        INDEX idx_resource (resource_type, resource_id),
        INDEX idx_status (status)
      ) ENGINE=InnoDB`,

      // Tabla de sesiones activas
      `CREATE TABLE IF NOT EXISTS active_sessions (
        id VARCHAR(100) PRIMARY KEY,
        tenant_id VARCHAR(50) NOT NULL,
        user_id VARCHAR(50) NOT NULL,
        user_email VARCHAR(255),
        ip_address VARCHAR(45),
        user_agent TEXT,
        started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        last_activity TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        expires_at TIMESTAMP,
        metadata JSON,
        INDEX idx_tenant (tenant_id),
        INDEX idx_user (user_id),
        INDEX idx_expires (expires_at)
      )`,

      // Tabla de métricas en tiempo real
      `CREATE TABLE IF NOT EXISTS realtime_metrics (
        id INT AUTO_INCREMENT PRIMARY KEY,
        tenant_id VARCHAR(50) NOT NULL,
        metric_type VARCHAR(50) NOT NULL,
        metric_name VARCHAR(100) NOT NULL,
        metric_value DECIMAL(20, 6) NOT NULL,
        tags JSON,
        timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_tenant_type (tenant_id, metric_type),
        INDEX idx_timestamp (timestamp)
      )`,

      // Tabla de alertas
      `CREATE TABLE IF NOT EXISTS activity_alerts (
        id INT AUTO_INCREMENT PRIMARY KEY,
        tenant_id VARCHAR(50) NOT NULL,
        alert_type VARCHAR(50) NOT NULL,
        severity ENUM('low', 'medium', 'high', 'critical') NOT NULL,
        title VARCHAR(255) NOT NULL,
        message TEXT,
        source_event_id BIGINT,
        acknowledged BOOLEAN DEFAULT false,
        acknowledged_by VARCHAR(50),
        acknowledged_at TIMESTAMP,
        resolved BOOLEAN DEFAULT false,
        resolved_by VARCHAR(50),
        resolved_at TIMESTAMP,
        metadata JSON,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_tenant_status (tenant_id, acknowledged, resolved),
        INDEX idx_severity (severity)
      )`,

      // Tabla de estadísticas agregadas por hora
      `CREATE TABLE IF NOT EXISTS hourly_stats (
        id INT AUTO_INCREMENT PRIMARY KEY,
        tenant_id VARCHAR(50) NOT NULL,
        hour_bucket DATETIME NOT NULL,
        event_type VARCHAR(100) NOT NULL,
        total_count INT DEFAULT 0,
        success_count INT DEFAULT 0,
        failure_count INT DEFAULT 0,
        avg_duration_ms DECIMAL(10, 2),
        min_duration_ms INT,
        max_duration_ms INT,
        unique_actors INT DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        UNIQUE KEY unique_bucket (tenant_id, hour_bucket, event_type),
        INDEX idx_tenant_hour (tenant_id, hour_bucket)
      )`,

      // Tabla de estadísticas agregadas por día
      `CREATE TABLE IF NOT EXISTS daily_stats (
        id INT AUTO_INCREMENT PRIMARY KEY,
        tenant_id VARCHAR(50) NOT NULL,
        date_bucket DATE NOT NULL,
        event_type VARCHAR(100) NOT NULL,
        total_count INT DEFAULT 0,
        success_count INT DEFAULT 0,
        failure_count INT DEFAULT 0,
        avg_duration_ms DECIMAL(10, 2),
        unique_actors INT DEFAULT 0,
        unique_resources INT DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        UNIQUE KEY unique_bucket (tenant_id, date_bucket, event_type),
        INDEX idx_tenant_date (tenant_id, date_bucket)
      )`
    ]

    for (const query of queries) {
      await this.pool.execute(query)
    }
  }

  // ============================================
  // Core Tracking Methods
  // ============================================

  async track(event) {
    const enrichedEvent = this.enrichEvent(event)

    // Agregar al buffer
    this.buffer.push(enrichedEvent)

    // Emitir evento en tiempo real si está habilitado
    if (this.realTimeEnabled) {
      this.emit('activity', enrichedEvent)
      this.emit(event.eventType, enrichedEvent)
    }

    // Verificar si necesita alerta
    await this.checkAlerts(enrichedEvent)

    // Flush si el buffer está lleno
    if (this.buffer.length >= this.bufferSize) {
      await this.flush()
    }

    return enrichedEvent
  }

  enrichEvent(event) {
    return {
      tenantId: event.tenantId,
      eventType: event.eventType || EVENT_TYPES.API_CALL,
      severity: event.severity || SEVERITY.INFO,
      actorId: event.actorId,
      actorType: event.actorType || 'user',
      actorName: event.actorName,
      resourceType: event.resourceType,
      resourceId: event.resourceId,
      resourceName: event.resourceName,
      message: event.message,
      metadata: event.metadata || {},
      ipAddress: event.ipAddress,
      userAgent: event.userAgent,
      sessionId: event.sessionId,
      durationMs: event.durationMs,
      status: event.status || 'success',
      errorCode: event.errorCode,
      errorMessage: event.errorMessage,
      createdAt: new Date()
    }
  }

  async flush() {
    if (this.buffer.length === 0) return

    const events = [...this.buffer]
    this.buffer = []

    try {
      // Insertar en batch
      const values = events.map(e => [
        e.tenantId,
        e.eventType,
        e.severity,
        e.actorId,
        e.actorType,
        e.actorName,
        e.resourceType,
        e.resourceId,
        e.resourceName,
        e.message,
        JSON.stringify(e.metadata),
        e.ipAddress,
        e.userAgent,
        e.sessionId,
        e.durationMs,
        e.status,
        e.errorCode,
        e.errorMessage
      ])

      const placeholders = values.map(() =>
        '(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
      ).join(', ')

      await this.pool.execute(
        `INSERT INTO activity_logs
         (tenant_id, event_type, severity, actor_id, actor_type, actor_name,
          resource_type, resource_id, resource_name, message, metadata,
          ip_address, user_agent, session_id, duration_ms, status, error_code, error_message)
         VALUES ${placeholders}`,
        values.flat()
      )

      // Actualizar estadísticas
      await this.updateStats(events)

    } catch (error) {
      console.error('Error flushing activity logs:', error)
      // Devolver eventos al buffer
      this.buffer.unshift(...events)
    }
  }

  startAutoFlush() {
    this.flushTimer = setInterval(() => {
      this.flush()
    }, this.flushInterval)
  }

  // ============================================
  // Convenience Tracking Methods
  // ============================================

  async trackWorkflowStart(tenantId, workflowId, workflowName, actor) {
    return this.track({
      tenantId,
      eventType: EVENT_TYPES.WORKFLOW_START,
      severity: SEVERITY.INFO,
      actorId: actor?.id,
      actorName: actor?.name,
      actorType: actor?.type || 'user',
      resourceType: 'workflow',
      resourceId: workflowId,
      resourceName: workflowName,
      message: `Workflow "${workflowName}" iniciado`,
      status: 'pending'
    })
  }

  async trackWorkflowComplete(tenantId, workflowId, workflowName, durationMs, result) {
    return this.track({
      tenantId,
      eventType: EVENT_TYPES.WORKFLOW_COMPLETE,
      severity: SEVERITY.INFO,
      resourceType: 'workflow',
      resourceId: workflowId,
      resourceName: workflowName,
      message: `Workflow "${workflowName}" completado en ${durationMs}ms`,
      durationMs,
      status: 'success',
      metadata: { result }
    })
  }

  async trackWorkflowFail(tenantId, workflowId, workflowName, error) {
    return this.track({
      tenantId,
      eventType: EVENT_TYPES.WORKFLOW_FAIL,
      severity: SEVERITY.ERROR,
      resourceType: 'workflow',
      resourceId: workflowId,
      resourceName: workflowName,
      message: `Workflow "${workflowName}" falló: ${error.message}`,
      status: 'failure',
      errorCode: error.code,
      errorMessage: error.message,
      metadata: { stack: error.stack }
    })
  }

  async trackAgentEvent(tenantId, eventType, agentId, agentName, details = {}) {
    return this.track({
      tenantId,
      eventType,
      severity: eventType.includes('error') ? SEVERITY.ERROR : SEVERITY.INFO,
      actorType: 'agent',
      actorId: agentId,
      actorName: agentName,
      resourceType: 'agent',
      resourceId: agentId,
      resourceName: agentName,
      message: details.message || `Agent ${agentName} - ${eventType}`,
      status: eventType.includes('error') || eventType.includes('fail') ? 'failure' : 'success',
      metadata: details
    })
  }

  async trackUserLogin(tenantId, userId, userEmail, ipAddress, userAgent, success = true) {
    return this.track({
      tenantId,
      eventType: success ? EVENT_TYPES.USER_LOGIN : EVENT_TYPES.SECURITY_LOGIN_FAIL,
      severity: success ? SEVERITY.INFO : SEVERITY.WARNING,
      actorId: userId,
      actorName: userEmail,
      actorType: 'user',
      ipAddress,
      userAgent,
      message: success ?
        `Usuario ${userEmail} inició sesión` :
        `Intento fallido de inicio de sesión: ${userEmail}`,
      status: success ? 'success' : 'failure'
    })
  }

  async trackApiCall(tenantId, endpoint, method, statusCode, durationMs, actor) {
    const isError = statusCode >= 400

    return this.track({
      tenantId,
      eventType: isError ? EVENT_TYPES.API_ERROR : EVENT_TYPES.API_CALL,
      severity: isError ? SEVERITY.WARNING : SEVERITY.DEBUG,
      actorId: actor?.id,
      actorType: actor?.type || 'api',
      resourceType: 'api',
      resourceId: endpoint,
      resourceName: `${method} ${endpoint}`,
      message: `${method} ${endpoint} - ${statusCode}`,
      durationMs,
      status: isError ? 'failure' : 'success',
      metadata: { method, endpoint, statusCode }
    })
  }

  async trackSecurityEvent(tenantId, eventType, details) {
    return this.track({
      tenantId,
      eventType,
      severity: SEVERITY.WARNING,
      actorType: 'system',
      ipAddress: details.ipAddress,
      message: details.message,
      metadata: details,
      status: 'failure'
    })
  }

  // ============================================
  // Session Management
  // ============================================

  async startSession(tenantId, userId, userEmail, ipAddress, userAgent) {
    const sessionId = this.generateSessionId()
    const expiresAt = new Date()
    expiresAt.setHours(expiresAt.getHours() + 24)

    await this.pool.execute(
      `INSERT INTO active_sessions
       (id, tenant_id, user_id, user_email, ip_address, user_agent, expires_at)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [sessionId, tenantId, userId, userEmail, ipAddress, userAgent, expiresAt]
    )

    return sessionId
  }

  async updateSessionActivity(sessionId) {
    await this.pool.execute(
      `UPDATE active_sessions SET last_activity = NOW() WHERE id = ?`,
      [sessionId]
    )
  }

  async endSession(sessionId) {
    await this.pool.execute(
      `DELETE FROM active_sessions WHERE id = ?`,
      [sessionId]
    )
  }

  async getActiveSessions(tenantId, userId = null) {
    let query = 'SELECT * FROM active_sessions WHERE tenant_id = ? AND expires_at > NOW()'
    const params = [tenantId]

    if (userId) {
      query += ' AND user_id = ?'
      params.push(userId)
    }

    const [rows] = await this.pool.execute(query, params)
    return rows
  }

  // ============================================
  // Alerts
  // ============================================

  async checkAlerts(event) {
    // Reglas de alerta
    const alertRules = [
      {
        condition: e => e.eventType === EVENT_TYPES.SECURITY_LOGIN_FAIL,
        severity: 'high',
        title: 'Intento de inicio de sesión fallido',
        type: 'security'
      },
      {
        condition: e => e.eventType === EVENT_TYPES.WORKFLOW_FAIL,
        severity: 'medium',
        title: 'Workflow falló',
        type: 'execution'
      },
      {
        condition: e => e.eventType === EVENT_TYPES.AGENT_ERROR,
        severity: 'high',
        title: 'Error en agente',
        type: 'agent'
      },
      {
        condition: e => e.eventType === EVENT_TYPES.BILLING_OVERDUE,
        severity: 'high',
        title: 'Pago vencido',
        type: 'billing'
      },
      {
        condition: e => e.severity === SEVERITY.CRITICAL,
        severity: 'critical',
        title: 'Evento crítico detectado',
        type: 'system'
      }
    ]

    for (const rule of alertRules) {
      if (rule.condition(event)) {
        await this.createAlert(event.tenantId, {
          alertType: rule.type,
          severity: rule.severity,
          title: rule.title,
          message: event.message,
          sourceEventId: event.id,
          metadata: event.metadata
        })
      }
    }
  }

  async createAlert(tenantId, alert) {
    const [result] = await this.pool.execute(
      `INSERT INTO activity_alerts
       (tenant_id, alert_type, severity, title, message, source_event_id, metadata)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        tenantId,
        alert.alertType,
        alert.severity,
        alert.title,
        alert.message,
        alert.sourceEventId,
        JSON.stringify(alert.metadata || {})
      ]
    )

    const newAlert = { id: result.insertId, tenantId, ...alert }

    // Emitir alerta en tiempo real
    this.emit('alert', newAlert)

    return newAlert
  }

  async getAlerts(tenantId, options = {}) {
    let query = `SELECT * FROM activity_alerts WHERE tenant_id = ?`
    const params = [tenantId]

    if (!options.includeAcknowledged) {
      query += ` AND acknowledged = false`
    }

    if (!options.includeResolved) {
      query += ` AND resolved = false`
    }

    if (options.severity) {
      query += ` AND severity = ?`
      params.push(options.severity)
    }

    query += ` ORDER BY created_at DESC`

    if (options.limit) {
      query += ` LIMIT ?`
      params.push(options.limit)
    }

    const [rows] = await this.pool.execute(query, params)
    return rows
  }

  async acknowledgeAlert(alertId, userId) {
    await this.pool.execute(
      `UPDATE activity_alerts
       SET acknowledged = true, acknowledged_by = ?, acknowledged_at = NOW()
       WHERE id = ?`,
      [userId, alertId]
    )
  }

  async resolveAlert(alertId, userId) {
    await this.pool.execute(
      `UPDATE activity_alerts
       SET resolved = true, resolved_by = ?, resolved_at = NOW()
       WHERE id = ?`,
      [userId, alertId]
    )
  }

  // ============================================
  // Statistics & Reporting
  // ============================================

  async updateStats(events) {
    const hourBucket = new Date()
    hourBucket.setMinutes(0, 0, 0)

    const dateBucket = new Date()
    dateBucket.setHours(0, 0, 0, 0)

    // Agrupar por tenant y tipo
    const groups = {}
    for (const event of events) {
      const key = `${event.tenantId}:${event.eventType}`
      if (!groups[key]) {
        groups[key] = {
          tenantId: event.tenantId,
          eventType: event.eventType,
          total: 0,
          success: 0,
          failure: 0,
          durations: [],
          actors: new Set()
        }
      }

      groups[key].total++
      if (event.status === 'success') groups[key].success++
      if (event.status === 'failure') groups[key].failure++
      if (event.durationMs) groups[key].durations.push(event.durationMs)
      if (event.actorId) groups[key].actors.add(event.actorId)
    }

    // Actualizar estadísticas horarias
    for (const [key, stats] of Object.entries(groups)) {
      const avgDuration = stats.durations.length > 0 ?
        stats.durations.reduce((a, b) => a + b, 0) / stats.durations.length : null

      await this.pool.execute(
        `INSERT INTO hourly_stats
         (tenant_id, hour_bucket, event_type, total_count, success_count, failure_count,
          avg_duration_ms, min_duration_ms, max_duration_ms, unique_actors)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE
           total_count = total_count + VALUES(total_count),
           success_count = success_count + VALUES(success_count),
           failure_count = failure_count + VALUES(failure_count),
           avg_duration_ms = (avg_duration_ms + VALUES(avg_duration_ms)) / 2,
           min_duration_ms = LEAST(COALESCE(min_duration_ms, VALUES(min_duration_ms)), VALUES(min_duration_ms)),
           max_duration_ms = GREATEST(COALESCE(max_duration_ms, VALUES(max_duration_ms)), VALUES(max_duration_ms)),
           unique_actors = unique_actors + VALUES(unique_actors)`,
        [
          stats.tenantId,
          hourBucket,
          stats.eventType,
          stats.total,
          stats.success,
          stats.failure,
          avgDuration,
          stats.durations.length > 0 ? Math.min(...stats.durations) : null,
          stats.durations.length > 0 ? Math.max(...stats.durations) : null,
          stats.actors.size
        ]
      )
    }
  }

  async getActivityFeed(tenantId, options = {}) {
    const limit = options.limit || 50
    const offset = options.offset || 0

    let query = `
      SELECT *
      FROM activity_logs
      WHERE tenant_id = ?
    `
    const params = [tenantId]

    if (options.eventTypes) {
      query += ` AND event_type IN (?)`
      params.push(options.eventTypes)
    }

    if (options.severity) {
      query += ` AND severity = ?`
      params.push(options.severity)
    }

    if (options.actorId) {
      query += ` AND actor_id = ?`
      params.push(options.actorId)
    }

    if (options.resourceType) {
      query += ` AND resource_type = ?`
      params.push(options.resourceType)
    }

    if (options.startDate) {
      query += ` AND created_at >= ?`
      params.push(options.startDate)
    }

    if (options.endDate) {
      query += ` AND created_at <= ?`
      params.push(options.endDate)
    }

    query += ` ORDER BY created_at DESC LIMIT ? OFFSET ?`
    params.push(limit, offset)

    const [rows] = await this.pool.execute(query, params)
    return rows
  }

  async getActivityStats(tenantId, options = {}) {
    const startDate = options.startDate || new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    const endDate = options.endDate || new Date()

    const [hourly] = await this.pool.execute(
      `SELECT hour_bucket, event_type, total_count, success_count, failure_count, avg_duration_ms
       FROM hourly_stats
       WHERE tenant_id = ? AND hour_bucket BETWEEN ? AND ?
       ORDER BY hour_bucket`,
      [tenantId, startDate, endDate]
    )

    const [summary] = await this.pool.execute(
      `SELECT
         event_type,
         SUM(total_count) as total,
         SUM(success_count) as success,
         SUM(failure_count) as failure,
         AVG(avg_duration_ms) as avg_duration
       FROM hourly_stats
       WHERE tenant_id = ? AND hour_bucket BETWEEN ? AND ?
       GROUP BY event_type
       ORDER BY total DESC`,
      [tenantId, startDate, endDate]
    )

    return {
      period: { start: startDate, end: endDate },
      hourly,
      summary,
      totals: {
        events: summary.reduce((sum, s) => sum + parseInt(s.total), 0),
        successRate: summary.length > 0 ?
          (summary.reduce((sum, s) => sum + parseInt(s.success), 0) /
            summary.reduce((sum, s) => sum + parseInt(s.total), 0) * 100).toFixed(2) : 0
      }
    }
  }

  async getDashboardMetrics(tenantId) {
    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const thisHour = new Date(now.getFullYear(), now.getMonth(), now.getDate(), now.getHours())

    // Métricas de hoy
    const [todayStats] = await this.pool.execute(
      `SELECT
         COUNT(*) as total_events,
         SUM(CASE WHEN status = 'success' THEN 1 ELSE 0 END) as success_count,
         SUM(CASE WHEN status = 'failure' THEN 1 ELSE 0 END) as failure_count,
         AVG(duration_ms) as avg_duration
       FROM activity_logs
       WHERE tenant_id = ? AND created_at >= ?`,
      [tenantId, today]
    )

    // Sesiones activas
    const [sessions] = await this.pool.execute(
      `SELECT COUNT(*) as count FROM active_sessions
       WHERE tenant_id = ? AND expires_at > NOW()`,
      [tenantId]
    )

    // Alertas pendientes
    const [alerts] = await this.pool.execute(
      `SELECT COUNT(*) as count, severity
       FROM activity_alerts
       WHERE tenant_id = ? AND acknowledged = false
       GROUP BY severity`,
      [tenantId]
    )

    // Agentes activos (basado en actividad reciente)
    const [activeAgents] = await this.pool.execute(
      `SELECT COUNT(DISTINCT actor_id) as count
       FROM activity_logs
       WHERE tenant_id = ? AND actor_type = 'agent' AND created_at >= ?`,
      [tenantId, thisHour]
    )

    return {
      today: todayStats[0],
      activeSessions: sessions[0].count,
      activeAgents: activeAgents[0].count,
      pendingAlerts: alerts.reduce((acc, a) => {
        acc[a.severity] = a.count
        acc.total = (acc.total || 0) + a.count
        return acc
      }, {})
    }
  }

  // ============================================
  // Cleanup & Maintenance
  // ============================================

  startCleanup() {
    // Ejecutar limpieza diaria
    setInterval(async () => {
      await this.cleanup()
    }, 24 * 60 * 60 * 1000)
  }

  async cleanup() {
    const retentionDate = new Date()
    retentionDate.setDate(retentionDate.getDate() - this.retentionDays)

    // Limpiar logs antiguos
    await this.pool.execute(
      `DELETE FROM activity_logs WHERE created_at < ?`,
      [retentionDate]
    )

    // Limpiar sesiones expiradas
    await this.pool.execute(
      `DELETE FROM active_sessions WHERE expires_at < NOW()`
    )

    // Limpiar métricas antiguas
    await this.pool.execute(
      `DELETE FROM realtime_metrics WHERE timestamp < ?`,
      [retentionDate]
    )

    console.log(`Cleanup completed. Removed logs older than ${this.retentionDays} days`)
  }

  // ============================================
  // Helpers
  // ============================================

  generateSessionId() {
    return 'sess_' + Date.now().toString(36) + Math.random().toString(36).substr(2, 9)
  }

  async close() {
    if (this.flushTimer) {
      clearInterval(this.flushTimer)
    }
    await this.flush()
    if (this.pool) {
      await this.pool.end()
    }
  }
}

export default ActivityTracker
