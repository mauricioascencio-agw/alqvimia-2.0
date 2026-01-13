import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useEnvironmentStore } from '../stores/environmentStore'
import { useAuthStore } from '../stores/authStore'
import api from '../services/api'
import toast from 'react-hot-toast'

function DashboardPage() {
  const { currentEnvironment } = useEnvironmentStore()
  const { user } = useAuthStore()

  const [stats, setStats] = useState({
    projects: 0,
    workflows: 0,
    agents: 0,
    pendingDeployments: 0
  })

  const [recentActivity, setRecentActivity] = useState([])
  const [executionStats, setExecutionStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
  }, [currentEnvironment])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)

      // Fetch multiple endpoints in parallel
      const [projectsRes, workflowsRes, agentsRes, deploymentsRes, executionRes] = await Promise.all([
        api.get('/projects'),
        api.get('/workflows'),
        api.get('/agents'),
        api.get('/deployment/pending'),
        api.get('/execution/metrics/summary')
      ])

      setStats({
        projects: projectsRes.data.total || 0,
        workflows: workflowsRes.data.total || 0,
        agents: agentsRes.data.total || 0,
        pendingDeployments: deploymentsRes.data.total || 0
      })

      setExecutionStats(executionRes.data)

      // Mock recent activity
      setRecentActivity([
        { id: 1, type: 'deployment', message: 'Workflow "Proceso de Ventas" desplegado a QA', time: '10 min' },
        { id: 2, type: 'commit', message: 'Actualización en agent "Sales Assistant"', time: '25 min' },
        { id: 3, type: 'test', message: 'Tests ejecutados: 15 pasaron, 0 fallaron', time: '1 hora' },
        { id: 4, type: 'execution', message: 'Workflow ejecutado correctamente', time: '2 horas' }
      ])

    } catch (error) {
      console.error('Error fetching dashboard:', error)
      toast.error('Error cargando datos del dashboard')
    } finally {
      setLoading(false)
    }
  }

  const getActivityIcon = (type) => {
    const icons = {
      deployment: 'fa-rocket',
      commit: 'fa-code-commit',
      test: 'fa-vial',
      execution: 'fa-play-circle'
    }
    return icons[type] || 'fa-circle'
  }

  if (loading) {
    return (
      <div className="page-loading">
        <i className="fas fa-spinner fa-spin"></i>
        <span>Cargando dashboard...</span>
      </div>
    )
  }

  return (
    <div className="dashboard-page">
      <div className="page-header">
        <div className="header-content">
          <h1>Dashboard</h1>
          <p>Bienvenido, {user?.name}</p>
        </div>
        <div className="header-actions">
          <span className="env-indicator" style={{ backgroundColor: currentEnvironment?.color }}>
            {currentEnvironment?.shortName}
          </span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="stats-grid">
        <Link to="/projects" className="stat-card">
          <div className="stat-icon">
            <i className="fas fa-folder-open"></i>
          </div>
          <div className="stat-content">
            <span className="stat-value">{stats.projects}</span>
            <span className="stat-label">Proyectos</span>
          </div>
        </Link>

        <Link to="/workflows" className="stat-card">
          <div className="stat-icon">
            <i className="fas fa-project-diagram"></i>
          </div>
          <div className="stat-content">
            <span className="stat-value">{stats.workflows}</span>
            <span className="stat-label">Workflows</span>
          </div>
        </Link>

        <Link to="/agents" className="stat-card">
          <div className="stat-icon">
            <i className="fas fa-robot"></i>
          </div>
          <div className="stat-content">
            <span className="stat-value">{stats.agents}</span>
            <span className="stat-label">Agentes</span>
          </div>
        </Link>

        <Link to="/deployment" className="stat-card highlight">
          <div className="stat-icon">
            <i className="fas fa-rocket"></i>
          </div>
          <div className="stat-content">
            <span className="stat-value">{stats.pendingDeployments}</span>
            <span className="stat-label">Despliegues Pendientes</span>
          </div>
        </Link>
      </div>

      {/* Main Content Grid */}
      <div className="dashboard-grid">
        {/* Execution Stats */}
        <div className="dashboard-card execution-stats">
          <div className="card-header">
            <h3><i className="fas fa-chart-line"></i> Ejecuciones (24h)</h3>
          </div>
          <div className="card-content">
            {executionStats && (
              <div className="execution-metrics">
                <div className="metric">
                  <span className="metric-value">{executionStats.totalExecutions}</span>
                  <span className="metric-label">Total</span>
                </div>
                <div className="metric success">
                  <span className="metric-value">{executionStats.completed}</span>
                  <span className="metric-label">Completadas</span>
                </div>
                <div className="metric error">
                  <span className="metric-value">{executionStats.failed}</span>
                  <span className="metric-label">Fallidas</span>
                </div>
                <div className="metric">
                  <span className="metric-value">{executionStats.successRate}%</span>
                  <span className="metric-label">Tasa de Éxito</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="dashboard-card recent-activity">
          <div className="card-header">
            <h3><i className="fas fa-history"></i> Actividad Reciente</h3>
          </div>
          <div className="card-content">
            <ul className="activity-list">
              {recentActivity.map(activity => (
                <li key={activity.id} className="activity-item">
                  <i className={`fas ${getActivityIcon(activity.type)}`}></i>
                  <div className="activity-content">
                    <span className="activity-message">{activity.message}</span>
                    <span className="activity-time">{activity.time}</span>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="dashboard-card quick-actions">
          <div className="card-header">
            <h3><i className="fas fa-bolt"></i> Acciones Rápidas</h3>
          </div>
          <div className="card-content">
            <div className="actions-grid">
              <Link to="/workflows" className="action-btn">
                <i className="fas fa-plus"></i>
                <span>Nuevo Workflow</span>
              </Link>
              <Link to="/agents" className="action-btn">
                <i className="fas fa-robot"></i>
                <span>Nuevo Agente</span>
              </Link>
              <Link to="/testing" className="action-btn">
                <i className="fas fa-play"></i>
                <span>Ejecutar Tests</span>
              </Link>
              <Link to="/logs" className="action-btn">
                <i className="fas fa-terminal"></i>
                <span>Ver Logs</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Environment Status */}
        <div className="dashboard-card env-status">
          <div className="card-header">
            <h3><i className="fas fa-server"></i> Estado de Ambientes</h3>
          </div>
          <div className="card-content">
            <div className="env-list">
              <div className="env-item">
                <span className="env-dot" style={{ backgroundColor: '#22c55e' }}></span>
                <span className="env-name">Development</span>
                <span className="env-status online">Online</span>
              </div>
              <div className="env-item">
                <span className="env-dot" style={{ backgroundColor: '#f59e0b' }}></span>
                <span className="env-name">QA</span>
                <span className="env-status online">Online</span>
              </div>
              <div className="env-item">
                <span className="env-dot" style={{ backgroundColor: '#ef4444' }}></span>
                <span className="env-name">Production</span>
                <span className="env-status online">Online</span>
              </div>
              <div className="env-item">
                <span className="env-dot" style={{ backgroundColor: '#8b5cf6' }}></span>
                <span className="env-name">Test</span>
                <span className="env-status online">Online</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default DashboardPage
