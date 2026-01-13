import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useEnvironmentStore } from '../stores/environmentStore'
import api from '../services/api'
import toast from 'react-hot-toast'

function ProjectsPage() {
  const { currentEnvironment } = useEnvironmentStore()

  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [showCreateModal, setShowCreateModal] = useState(false)

  useEffect(() => {
    fetchProjects()
  }, [currentEnvironment])

  const fetchProjects = async () => {
    try {
      setLoading(true)
      const response = await api.get('/projects', {
        params: { environment: currentEnvironment?.id }
      })
      setProjects(response.data.projects || [])
    } catch (error) {
      toast.error('Error cargando proyectos')
    } finally {
      setLoading(false)
    }
  }

  const filteredProjects = projects.filter(p =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.description.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    })
  }

  return (
    <div className="projects-page">
      <div className="page-header">
        <div className="header-content">
          <h1><i className="fas fa-folder-open"></i> Proyectos</h1>
          <p>Gestiona tus proyectos de desarrollo</p>
        </div>
        <div className="header-actions">
          <button className="btn-primary" onClick={() => setShowCreateModal(true)}>
            <i className="fas fa-plus"></i>
            Nuevo Proyecto
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="page-filters">
        <div className="search-box">
          <i className="fas fa-search"></i>
          <input
            type="text"
            placeholder="Buscar proyectos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Projects List */}
      {loading ? (
        <div className="page-loading">
          <i className="fas fa-spinner fa-spin"></i>
          <span>Cargando proyectos...</span>
        </div>
      ) : filteredProjects.length === 0 ? (
        <div className="empty-state">
          <i className="fas fa-folder-open"></i>
          <h3>No hay proyectos</h3>
          <p>Crea tu primer proyecto para comenzar</p>
          <button className="btn-primary" onClick={() => setShowCreateModal(true)}>
            <i className="fas fa-plus"></i>
            Crear Proyecto
          </button>
        </div>
      ) : (
        <div className="projects-grid">
          {filteredProjects.map(project => (
            <Link
              key={project.id}
              to={`/projects/${project.id}`}
              className="project-card"
            >
              <div className="project-header">
                <h3>{project.name}</h3>
                <span className={`status-badge ${project.status}`}>
                  {project.status}
                </span>
              </div>

              <p className="project-description">{project.description}</p>

              <div className="project-stats">
                <div className="stat">
                  <i className="fas fa-project-diagram"></i>
                  <span>{project.workflows?.length || 0} workflows</span>
                </div>
                <div className="stat">
                  <i className="fas fa-robot"></i>
                  <span>{project.agents?.length || 0} agentes</span>
                </div>
                <div className="stat">
                  <i className="fas fa-users"></i>
                  <span>{project.team?.length || 0} miembros</span>
                </div>
              </div>

              <div className="project-footer">
                <span className="project-date">
                  <i className="fas fa-clock"></i>
                  Actualizado: {formatDate(project.updatedAt)}
                </span>
                <span
                  className="env-badge"
                  style={{
                    backgroundColor: project.environment === 'prod' ? '#ef4444' :
                                     project.environment === 'qa' ? '#f59e0b' : '#22c55e'
                  }}
                >
                  {project.environment?.toUpperCase()}
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Create Modal - Simplified */}
      {showCreateModal && (
        <div className="modal-overlay" onClick={() => setShowCreateModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Nuevo Proyecto</h2>
              <button className="close-btn" onClick={() => setShowCreateModal(false)}>
                <i className="fas fa-times"></i>
              </button>
            </div>
            <form className="modal-body" onSubmit={async (e) => {
              e.preventDefault()
              const formData = new FormData(e.target)
              try {
                await api.post('/projects', {
                  name: formData.get('name'),
                  description: formData.get('description'),
                  repository: formData.get('repository')
                })
                toast.success('Proyecto creado')
                setShowCreateModal(false)
                fetchProjects()
              } catch (error) {
                toast.error('Error creando proyecto')
              }
            }}>
              <div className="form-group">
                <label>Nombre</label>
                <input type="text" name="name" required placeholder="Mi Proyecto" />
              </div>
              <div className="form-group">
                <label>Descripción</label>
                <textarea name="description" placeholder="Descripción del proyecto..."></textarea>
              </div>
              <div className="form-group">
                <label>Repositorio (opcional)</label>
                <input type="url" name="repository" placeholder="https://github.com/..." />
              </div>
              <div className="modal-footer">
                <button type="button" className="btn-secondary" onClick={() => setShowCreateModal(false)}>
                  Cancelar
                </button>
                <button type="submit" className="btn-primary">
                  Crear Proyecto
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default ProjectsPage
