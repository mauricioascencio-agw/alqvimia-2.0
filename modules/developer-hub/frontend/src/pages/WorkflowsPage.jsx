import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useEnvironmentStore } from '../stores/environmentStore'
import api from '../services/api'
import toast from 'react-hot-toast'

function WorkflowsPage() {
  const { currentEnvironment, getEnvironmentColor } = useEnvironmentStore()

  const [workflows, setWorkflows] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('')

  useEffect(() => {
    fetchWorkflows()
  }, [currentEnvironment])

  const fetchWorkflows = async () => {
    try {
      setLoading(true)
      const response = await api.get('/workflows', {
        params: { environment: currentEnvironment?.id }
      })
      setWorkflows(response.data.workflows || [])
    } catch (error) {
      toast.error('Error cargando workflows')
    } finally {
      setLoading(false)
    }
  }

  const filteredWorkflows = workflows.filter(w => {
    const matchesSearch = w.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          w.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = !statusFilter || w.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const formatDuration = (ms) => {
    if (ms < 1000) return `${ms}ms`
    if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`
    return `${(ms / 60000).toFixed(1)}m`
  }

  return (
    <div className="workflows-page">
      <div className="page-header">
        <div className="header-content">
          <h1><i className="fas fa-project-diagram"></i> Workflows</h1>
          <p>Gestiona tus flujos de trabajo automatizados</p>
        </div>
        <div className="header-actions">
          <button className="btn-primary">
            <i className="fas fa-plus"></i>
            Nuevo Workflow
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="page-filters">
        <div className="search-box">
          <i className="fas fa-search"></i>
          <input
            type="text"
            placeholder="Buscar workflows..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="filter-select"
        >
          <option value="">Todos los estados</option>
          <option value="active">Activo</option>
          <option value="draft">Borrador</option>
          <option value="disabled">Deshabilitado</option>
        </select>
      </div>

      {/* Workflows Table */}
      {loading ? (
        <div className="page-loading">
          <i className="fas fa-spinner fa-spin"></i>
          <span>Cargando workflows...</span>
        </div>
      ) : filteredWorkflows.length === 0 ? (
        <div className="empty-state">
          <i className="fas fa-project-diagram"></i>
          <h3>No hay workflows</h3>
          <p>Crea tu primer workflow para comenzar</p>
        </div>
      ) : (
        <div className="data-table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Versión</th>
                <th>Estado</th>
                <th>Nodos</th>
                <th>Ejecuciones</th>
                <th>Tiempo Promedio</th>
                <th>Ambientes</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredWorkflows.map(workflow => (
                <tr key={workflow.id}>
                  <td>
                    <div className="cell-main">
                      <Link to={`/workflows/${workflow.id}/edit`} className="item-name">
                        {workflow.name}
                      </Link>
                      <span className="item-desc">{workflow.description}</span>
                    </div>
                  </td>
                  <td>
                    <span className="version-badge">v{workflow.version}</span>
                  </td>
                  <td>
                    <span className={`status-badge ${workflow.status}`}>
                      {workflow.status}
                    </span>
                  </td>
                  <td>{workflow.nodes}</td>
                  <td>{workflow.executionCount}</td>
                  <td>{formatDuration(workflow.avgExecutionTime)}</td>
                  <td>
                    <div className="env-badges">
                      {Object.entries(workflow.deployedVersions || {}).map(([env, ver]) => (
                        <span
                          key={env}
                          className="mini-env-badge"
                          style={{ backgroundColor: getEnvironmentColor(env) }}
                          title={`${env.toUpperCase()}: v${ver}`}
                        >
                          {env.toUpperCase().charAt(0)}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td>
                    <div className="action-buttons">
                      <Link
                        to={`/workflows/${workflow.id}/edit`}
                        className="action-btn"
                        title="Editar"
                      >
                        <i className="fas fa-edit"></i>
                      </Link>
                      <button
                        className="action-btn"
                        title="Ejecutar"
                        onClick={() => toast('Ejecutando workflow...')}
                      >
                        <i className="fas fa-play"></i>
                      </button>
                      <button
                        className="action-btn"
                        title="Desplegar"
                        onClick={() => toast('Abriendo opciones de despliegue...')}
                      >
                        <i className="fas fa-rocket"></i>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

export default WorkflowsPage
