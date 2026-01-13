import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import api from '../services/api'
import toast from 'react-hot-toast'

function ProjectDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [project, setProject] = useState(null)
  const [activity, setActivity] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('overview')

  useEffect(() => {
    fetchProject()
  }, [id])

  const fetchProject = async () => {
    try {
      setLoading(true)
      const [projectRes, activityRes] = await Promise.all([
        api.get(`/projects/${id}`),
        api.get(`/projects/${id}/activity`)
      ])
      setProject(projectRes.data)
      setActivity(activityRes.data)
    } catch (error) {
      toast.error('Error cargando proyecto')
      navigate('/projects')
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (date) => {
    return new Date(date).toLocaleString('es-ES')
  }

  if (loading) {
    return (
      <div className="page-loading">
        <i className="fas fa-spinner fa-spin"></i>
        <span>Cargando proyecto...</span>
      </div>
    )
  }

  if (!project) {
    return null
  }

  return (
    <div className="project-detail-page">
      {/* Breadcrumb */}
      <div className="breadcrumb">
        <Link to="/projects">Proyectos</Link>
        <i className="fas fa-chevron-right"></i>
        <span>{project.name}</span>
      </div>

      {/* Header */}
      <div className="page-header">
        <div className="header-content">
          <h1>{project.name}</h1>
          <p>{project.description}</p>
        </div>
        <div className="header-actions">
          <span className={`status-badge ${project.status}`}>
            {project.status}
          </span>
          <button className="btn-secondary">
            <i className="fas fa-cog"></i>
            Configuración
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="page-tabs">
        <button
          className={`tab ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          <i className="fas fa-info-circle"></i>
          Resumen
        </button>
        <button
          className={`tab ${activeTab === 'workflows' ? 'active' : ''}`}
          onClick={() => setActiveTab('workflows')}
        >
          <i className="fas fa-project-diagram"></i>
          Workflows ({project.workflows?.length || 0})
        </button>
        <button
          className={`tab ${activeTab === 'agents' ? 'active' : ''}`}
          onClick={() => setActiveTab('agents')}
        >
          <i className="fas fa-robot"></i>
          Agentes ({project.agents?.length || 0})
        </button>
        <button
          className={`tab ${activeTab === 'activity' ? 'active' : ''}`}
          onClick={() => setActiveTab('activity')}
        >
          <i className="fas fa-history"></i>
          Actividad
        </button>
      </div>

      {/* Tab Content */}
      <div className="tab-content">
        {activeTab === 'overview' && (
          <div className="overview-content">
            <div className="info-grid">
              <div className="info-card">
                <h4>Información General</h4>
                <div className="info-item">
                  <span className="label">ID</span>
                  <span className="value">{project.id}</span>
                </div>
                <div className="info-item">
                  <span className="label">Ambiente</span>
                  <span className="value">{project.environment?.toUpperCase()}</span>
                </div>
                <div className="info-item">
                  <span className="label">Creado</span>
                  <span className="value">{formatDate(project.createdAt)}</span>
                </div>
                <div className="info-item">
                  <span className="label">Actualizado</span>
                  <span className="value">{formatDate(project.updatedAt)}</span>
                </div>
              </div>

              <div className="info-card">
                <h4>Repositorio</h4>
                {project.repository ? (
                  <a href={project.repository} target="_blank" rel="noopener noreferrer">
                    <i className="fab fa-github"></i>
                    {project.repository}
                  </a>
                ) : (
                  <p className="no-data">Sin repositorio configurado</p>
                )}
              </div>

              <div className="info-card">
                <h4>Equipo ({project.team?.length || 0})</h4>
                <div className="team-list">
                  {project.team?.map(memberId => (
                    <span key={memberId} className="team-member">
                      <i className="fas fa-user"></i>
                      {memberId}
                    </span>
                  ))}
                </div>
              </div>

              <div className="info-card">
                <h4>Configuración de Despliegue</h4>
                <div className="settings-list">
                  <div className="setting-item">
                    <span className={`setting-status ${project.settings?.autoDeployDev ? 'enabled' : ''}`}>
                      {project.settings?.autoDeployDev ? '✓' : '✗'}
                    </span>
                    Auto-deploy a DEV
                  </div>
                  <div className="setting-item">
                    <span className={`setting-status ${project.settings?.requireApprovalQA ? 'enabled' : ''}`}>
                      {project.settings?.requireApprovalQA ? '✓' : '✗'}
                    </span>
                    Requiere aprobación para QA
                  </div>
                  <div className="setting-item">
                    <span className={`setting-status ${project.settings?.requireApprovalProd ? 'enabled' : ''}`}>
                      {project.settings?.requireApprovalProd ? '✓' : '✗'}
                    </span>
                    Requiere aprobación para PROD
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'workflows' && (
          <div className="workflows-content">
            {project.workflows?.length > 0 ? (
              <div className="items-list">
                {project.workflows.map(wfId => (
                  <Link key={wfId} to={`/workflows/${wfId}/edit`} className="item-card">
                    <i className="fas fa-project-diagram"></i>
                    <span>{wfId}</span>
                    <i className="fas fa-chevron-right"></i>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="empty-state">
                <i className="fas fa-project-diagram"></i>
                <p>No hay workflows en este proyecto</p>
                <Link to="/workflows" className="btn-primary">
                  Crear Workflow
                </Link>
              </div>
            )}
          </div>
        )}

        {activeTab === 'agents' && (
          <div className="agents-content">
            {project.agents?.length > 0 ? (
              <div className="items-list">
                {project.agents.map(agentId => (
                  <Link key={agentId} to={`/agents/${agentId}/edit`} className="item-card">
                    <i className="fas fa-robot"></i>
                    <span>{agentId}</span>
                    <i className="fas fa-chevron-right"></i>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="empty-state">
                <i className="fas fa-robot"></i>
                <p>No hay agentes en este proyecto</p>
                <Link to="/agents" className="btn-primary">
                  Crear Agente
                </Link>
              </div>
            )}
          </div>
        )}

        {activeTab === 'activity' && (
          <div className="activity-content">
            <ul className="activity-timeline">
              {activity.map(item => (
                <li key={item.id} className="timeline-item">
                  <div className="timeline-icon">
                    <i className={`fas ${
                      item.type === 'deployment' ? 'fa-rocket' :
                      item.type === 'commit' ? 'fa-code-commit' :
                      item.type === 'workflow_update' ? 'fa-project-diagram' :
                      'fa-circle'
                    }`}></i>
                  </div>
                  <div className="timeline-content">
                    <p>{item.message}</p>
                    <span className="timeline-meta">
                      <i className="fas fa-user"></i> {item.user}
                      <i className="fas fa-clock"></i> {formatDate(item.timestamp)}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  )
}

export default ProjectDetailPage
