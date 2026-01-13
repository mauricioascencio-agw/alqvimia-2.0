import { useState, useEffect, useRef } from 'react'
import { useEnvironmentStore } from '../stores/environmentStore'
import api from '../services/api'
import toast from 'react-hot-toast'

function LogsPage() {
  const { currentEnvironment, environments, getEnvironmentColor } = useEnvironmentStore()

  const [logs, setLogs] = useState([])
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [autoRefresh, setAutoRefresh] = useState(false)
  const [filters, setFilters] = useState({
    level: [],
    source: [],
    environment: currentEnvironment?.id || 'dev',
    search: ''
  })

  const logsEndRef = useRef(null)
  const refreshInterval = useRef(null)

  useEffect(() => {
    fetchLogs()
    fetchStats()
  }, [filters])

  useEffect(() => {
    if (autoRefresh) {
      refreshInterval.current = setInterval(fetchLogs, 5000)
    } else {
      clearInterval(refreshInterval.current)
    }

    return () => clearInterval(refreshInterval.current)
  }, [autoRefresh])

  const fetchLogs = async () => {
    try {
      const params = {
        environment: filters.environment,
        search: filters.search || undefined,
        level: filters.level.length > 0 ? filters.level.join(',') : undefined,
        source: filters.source.length > 0 ? filters.source.join(',') : undefined,
        limit: 100
      }

      const response = await api.get('/logs', { params })
      setLogs(response.data.logs || [])
      setLoading(false)
    } catch (error) {
      toast.error('Error cargando logs')
      setLoading(false)
    }
  }

  const fetchStats = async () => {
    try {
      const response = await api.get('/logs/stats', {
        params: { environment: filters.environment }
      })
      setStats(response.data)
    } catch (error) {
      console.error('Error fetching stats:', error)
    }
  }

  const toggleLevel = (level) => {
    setFilters(prev => ({
      ...prev,
      level: prev.level.includes(level)
        ? prev.level.filter(l => l !== level)
        : [...prev.level, level]
    }))
  }

  const toggleSource = (source) => {
    setFilters(prev => ({
      ...prev,
      source: prev.source.includes(source)
        ? prev.source.filter(s => s !== source)
        : [...prev.source, source]
    }))
  }

  const getLevelColor = (level) => {
    const colors = {
      debug: '#64748b',
      info: '#3b82f6',
      warn: '#f59e0b',
      error: '#ef4444'
    }
    return colors[level] || '#64748b'
  }

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    })
  }

  const handleExport = async () => {
    try {
      const response = await api.post('/logs/export', {
        format: 'json',
        filters: {
          environment: filters.environment,
          level: filters.level.length > 0 ? filters.level : undefined
        }
      }, { responseType: 'blob' })

      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `logs-${filters.environment}-${Date.now()}.json`)
      document.body.appendChild(link)
      link.click()
      link.remove()

      toast.success('Logs exportados')
    } catch (error) {
      toast.error('Error exportando logs')
    }
  }

  return (
    <div className="logs-page">
      <div className="page-header">
        <div className="header-content">
          <h1><i className="fas fa-terminal"></i> Logs</h1>
          <p>Monitoreo y búsqueda de logs en tiempo real</p>
        </div>
        <div className="header-actions">
          <button
            className={`btn-toggle ${autoRefresh ? 'active' : ''}`}
            onClick={() => setAutoRefresh(!autoRefresh)}
          >
            <i className={`fas ${autoRefresh ? 'fa-pause' : 'fa-play'}`}></i>
            {autoRefresh ? 'Pausar' : 'Auto-refresh'}
          </button>
          <button className="btn-secondary" onClick={handleExport}>
            <i className="fas fa-download"></i>
            Exportar
          </button>
        </div>
      </div>

      {/* Stats Summary */}
      {stats && (
        <div className="logs-stats">
          <div className="stat-item">
            <span className="stat-value">{stats.total}</span>
            <span className="stat-label">Total ({stats.period})</span>
          </div>
          <div className="stat-item debug">
            <span className="stat-value">{stats.byLevel?.debug || 0}</span>
            <span className="stat-label">Debug</span>
          </div>
          <div className="stat-item info">
            <span className="stat-value">{stats.byLevel?.info || 0}</span>
            <span className="stat-label">Info</span>
          </div>
          <div className="stat-item warn">
            <span className="stat-value">{stats.byLevel?.warn || 0}</span>
            <span className="stat-label">Warning</span>
          </div>
          <div className="stat-item error">
            <span className="stat-value">{stats.byLevel?.error || 0}</span>
            <span className="stat-label">Error</span>
          </div>
          <div className="stat-item">
            <span className="stat-value">{stats.errorRate}%</span>
            <span className="stat-label">Error Rate</span>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="logs-filters">
        <div className="filter-group">
          <label>Ambiente</label>
          <select
            value={filters.environment}
            onChange={(e) => setFilters(prev => ({ ...prev, environment: e.target.value }))}
          >
            {environments.map(env => (
              <option key={env.id} value={env.id}>{env.name}</option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <label>Nivel</label>
          <div className="filter-buttons">
            {['debug', 'info', 'warn', 'error'].map(level => (
              <button
                key={level}
                className={`filter-btn ${filters.level.includes(level) ? 'active' : ''}`}
                onClick={() => toggleLevel(level)}
                style={{ borderColor: filters.level.includes(level) ? getLevelColor(level) : undefined }}
              >
                {level}
              </button>
            ))}
          </div>
        </div>

        <div className="filter-group">
          <label>Fuente</label>
          <div className="filter-buttons">
            {['workflow', 'agent', 'system', 'api', 'database'].map(source => (
              <button
                key={source}
                className={`filter-btn ${filters.source.includes(source) ? 'active' : ''}`}
                onClick={() => toggleSource(source)}
              >
                {source}
              </button>
            ))}
          </div>
        </div>

        <div className="filter-group search">
          <label>Buscar</label>
          <div className="search-input">
            <i className="fas fa-search"></i>
            <input
              type="text"
              placeholder="Buscar en logs..."
              value={filters.search}
              onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
            />
          </div>
        </div>
      </div>

      {/* Logs List */}
      <div className="logs-container">
        {loading ? (
          <div className="logs-loading">
            <i className="fas fa-spinner fa-spin"></i>
            <span>Cargando logs...</span>
          </div>
        ) : logs.length === 0 ? (
          <div className="logs-empty">
            <i className="fas fa-terminal"></i>
            <p>No hay logs que coincidan con los filtros</p>
          </div>
        ) : (
          <div className="logs-list">
            {logs.map(log => (
              <div key={log.id} className={`log-entry ${log.level}`}>
                <span className="log-time">{formatTime(log.timestamp)}</span>
                <span
                  className="log-level"
                  style={{ backgroundColor: getLevelColor(log.level) }}
                >
                  {log.level.toUpperCase()}
                </span>
                <span className="log-source">{log.source}</span>
                <span className="log-message">{log.message}</span>
                {log.metadata?.requestId && (
                  <span className="log-request-id">{log.metadata.requestId}</span>
                )}
              </div>
            ))}
            <div ref={logsEndRef} />
          </div>
        )}
      </div>
    </div>
  )
}

export default LogsPage
