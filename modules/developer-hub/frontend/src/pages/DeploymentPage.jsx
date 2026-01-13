import { useState, useEffect } from 'react'
import { useEnvironmentStore } from '../stores/environmentStore'
import { useAuthStore } from '../stores/authStore'
import api from '../services/api'
import toast from 'react-hot-toast'

function DeploymentPage() {
  const { environments, getEnvironmentColor } = useEnvironmentStore()
  const { hasEnvironmentAccess } = useAuthStore()

  const [deployments, setDeployments] = useState([])
  const [pending, setPending] = useState([])
  const [envStatus, setEnvStatus] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('pending')

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      const [deploymentsRes, pendingRes, statusRes] = await Promise.all([
        api.get('/deployment'),
        api.get('/deployment/pending'),
        api.get('/deployment/environments/status')
      ])
      setDeployments(deploymentsRes.data.deployments || [])
      setPending(pendingRes.data.deployments || [])
      setEnvStatus(statusRes.data || [])
    } catch (error) {
      toast.error('Error cargando datos de despliegue')
    } finally {
      setLoading(false)
    }
  }

  const handleApprove = async (deploymentId) => {
    try {
      await api.post(`/deployment/${deploymentId}/approve`)
      toast.success('Despliegue aprobado')
      fetchData()
    } catch (error) {
      toast.error(error.response?.data?.error || 'Error aprobando despliegue')
    }
  }

  const handleReject = async (deploymentId) => {
    const reason = prompt('Motivo del rechazo:')
    if (!reason) return

    try {
      await api.post(`/deployment/${deploymentId}/reject`, { reason })
      toast.success('Despliegue rechazado')
      fetchData()
    } catch (error) {
      toast.error('Error rechazando despliegue')
    }
  }

  const handleExecute = async (deploymentId) => {
    try {
      await api.post(`/deployment/${deploymentId}/execute`)
      toast.success('Despliegue iniciado')
      fetchData()
    } catch (error) {
      toast.error('Error ejecutando despliegue')
    }
  }

  const formatDate = (date) => {
    return new Date(date).toLocaleString('es-ES')
  }

  const getStatusBadge = (status) => {
    const colors = {
      pending_approval: '#f59e0b',
      approved: '#22c55e',
      deploying: '#3b82f6',
      completed: '#22c55e',
      rejected: '#ef4444',
      failed: '#ef4444'
    }
    return (
      <span className="status-badge" style={{ backgroundColor: colors[status] }}>
        {status.replace('_', ' ')}
      </span>
    )
  }

  if (loading) {
    return (
      <div className="page-loading">
        <i className="fas fa-spinner fa-spin"></i>
        <span>Cargando...</span>
      </div>
    )
  }

  return (
    <div className="deployment-page">
      <div className="page-header">
        <div className="header-content">
          <h1><i className="fas fa-rocket"></i> Despliegue</h1>
          <p>Gestiona los despliegues entre ambientes</p>
        </div>
        <div className="header-actions">
          <button className="btn-primary">
            <i className="fas fa-plus"></i>
            Nuevo Despliegue
          </button>
        </div>
      </div>

      {/* Environment Status Cards */}
      <div className="env-status-grid">
        {envStatus.map(env => (
          <div
            key={env.environment}
            className="env-status-card"
            style={{ borderColor: getEnvironmentColor(env.environment) }}
          >
            <div className="env-header">
              <span
                className="env-dot"
                style={{ backgroundColor: getEnvironmentColor(env.environment) }}
              ></span>
              <h4>{env.environment.toUpperCase()}</h4>
            </div>
            <div className="env-stats">
              <div className="env-stat">
                <span className="value">{env.pendingApprovals}</span>
                <span className="label">Pendientes</span>
              </div>
              <div className="env-stat">
                <span className="value">{env.activeDeployments}</span>
                <span className="label">En Curso</span>
              </div>
            </div>
            {env.lastDeployment && (
              <div className="last-deploy">
                <small>Último: v{env.lastDeployment.version}</small>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="page-tabs">
        <button
          className={`tab ${activeTab === 'pending' ? 'active' : ''}`}
          onClick={() => setActiveTab('pending')}
        >
          <i className="fas fa-clock"></i>
          Pendientes ({pending.length})
        </button>
        <button
          className={`tab ${activeTab === 'history' ? 'active' : ''}`}
          onClick={() => setActiveTab('history')}
        >
          <i className="fas fa-history"></i>
          Historial
        </button>
      </div>

      {/* Tab Content */}
      <div className="tab-content">
        {activeTab === 'pending' && (
          <div className="pending-deployments">
            {pending.length === 0 ? (
              <div className="empty-state">
                <i className="fas fa-check-circle"></i>
                <h3>No hay despliegues pendientes</h3>
                <p>Todos los despliegues han sido procesados</p>
              </div>
            ) : (
              <div className="deployments-list">
                {pending.map(d => (
                  <div key={d.id} className="deployment-card pending">
                    <div className="deployment-header">
                      <div className="deployment-info">
                        <i className={`fas ${d.type === 'workflow' ? 'fa-project-diagram' : 'fa-robot'}`}></i>
                        <div>
                          <h4>{d.targetName}</h4>
                          <span className="deployment-type">{d.type} • v{d.version}</span>
                        </div>
                      </div>
                      {getStatusBadge(d.status)}
                    </div>

                    <div className="deployment-flow">
                      <span className="env-badge" style={{ backgroundColor: getEnvironmentColor(d.fromEnvironment) }}>
                        {d.fromEnvironment?.toUpperCase()}
                      </span>
                      <i className="fas fa-arrow-right"></i>
                      <span className="env-badge" style={{ backgroundColor: getEnvironmentColor(d.toEnvironment) }}>
                        {d.toEnvironment?.toUpperCase()}
                      </span>
                    </div>

                    {d.notes && <p className="deployment-notes">{d.notes}</p>}

                    <div className="deployment-meta">
                      <span>Solicitado por: {d.requestedBy}</span>
                      <span>{formatDate(d.requestedAt)}</span>
                    </div>

                    <div className="deployment-actions">
                      {hasEnvironmentAccess(d.toEnvironment) && (
                        <>
                          <button className="btn-success" onClick={() => handleApprove(d.id)}>
                            <i className="fas fa-check"></i>
                            Aprobar
                          </button>
                          <button className="btn-danger" onClick={() => handleReject(d.id)}>
                            <i className="fas fa-times"></i>
                            Rechazar
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'history' && (
          <div className="deployments-history">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Item</th>
                  <th>Versión</th>
                  <th>Flujo</th>
                  <th>Estado</th>
                  <th>Solicitado</th>
                  <th>Completado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {deployments.map(d => (
                  <tr key={d.id}>
                    <td>
                      <div className="cell-main">
                        <span className="item-name">{d.targetName}</span>
                        <span className="item-type">{d.type}</span>
                      </div>
                    </td>
                    <td>v{d.version}</td>
                    <td>
                      <div className="flow-cell">
                        <span style={{ color: getEnvironmentColor(d.fromEnvironment) }}>
                          {d.fromEnvironment?.toUpperCase()}
                        </span>
                        <i className="fas fa-arrow-right"></i>
                        <span style={{ color: getEnvironmentColor(d.toEnvironment) }}>
                          {d.toEnvironment?.toUpperCase()}
                        </span>
                      </div>
                    </td>
                    <td>{getStatusBadge(d.status)}</td>
                    <td>{formatDate(d.requestedAt)}</td>
                    <td>{d.deployedAt ? formatDate(d.deployedAt) : '-'}</td>
                    <td>
                      {d.status === 'approved' && (
                        <button
                          className="action-btn"
                          onClick={() => handleExecute(d.id)}
                          title="Ejecutar"
                        >
                          <i className="fas fa-play"></i>
                        </button>
                      )}
                      {d.status === 'completed' && (
                        <button
                          className="action-btn"
                          onClick={() => toast('Rollback no implementado')}
                          title="Rollback"
                        >
                          <i className="fas fa-undo"></i>
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

export default DeploymentPage
