import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useEnvironmentStore } from '../stores/environmentStore'
import api from '../services/api'
import toast from 'react-hot-toast'

function AgentsPage() {
  const { currentEnvironment, getEnvironmentColor } = useEnvironmentStore()

  const [agents, setAgents] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [typeFilter, setTypeFilter] = useState('')

  useEffect(() => {
    fetchAgents()
  }, [currentEnvironment])

  const fetchAgents = async () => {
    try {
      setLoading(true)
      const response = await api.get('/agents', {
        params: { environment: currentEnvironment?.id }
      })
      setAgents(response.data.agents || [])
    } catch (error) {
      toast.error('Error cargando agentes')
    } finally {
      setLoading(false)
    }
  }

  const filteredAgents = agents.filter(a => {
    const matchesSearch = a.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          a.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesType = !typeFilter || a.type === typeFilter
    return matchesSearch && matchesType
  })

  const getModelIcon = (model) => {
    if (model.includes('gpt')) return 'fa-brain'
    if (model.includes('claude')) return 'fa-comment-dots'
    if (model.includes('gemini')) return 'fa-gem'
    return 'fa-microchip'
  }

  return (
    <div className="agents-page">
      <div className="page-header">
        <div className="header-content">
          <h1><i className="fas fa-robot"></i> Agentes</h1>
          <p>Gestiona tus agentes de IA</p>
        </div>
        <div className="header-actions">
          <button className="btn-primary">
            <i className="fas fa-plus"></i>
            Nuevo Agente
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="page-filters">
        <div className="search-box">
          <i className="fas fa-search"></i>
          <input
            type="text"
            placeholder="Buscar agentes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="filter-select"
        >
          <option value="">Todos los tipos</option>
          <option value="conversational">Conversacional</option>
          <option value="task">Tarea</option>
        </select>
      </div>

      {/* Agents Grid */}
      {loading ? (
        <div className="page-loading">
          <i className="fas fa-spinner fa-spin"></i>
          <span>Cargando agentes...</span>
        </div>
      ) : filteredAgents.length === 0 ? (
        <div className="empty-state">
          <i className="fas fa-robot"></i>
          <h3>No hay agentes</h3>
          <p>Crea tu primer agente de IA para comenzar</p>
        </div>
      ) : (
        <div className="agents-grid">
          {filteredAgents.map(agent => (
            <div key={agent.id} className="agent-card">
              <div className="agent-header">
                <div className="agent-icon">
                  <i className={`fas ${getModelIcon(agent.model)}`}></i>
                </div>
                <div className="agent-title">
                  <h3>{agent.name}</h3>
                  <span className="agent-model">{agent.model}</span>
                </div>
                <span className={`status-badge ${agent.status}`}>
                  {agent.status}
                </span>
              </div>

              <p className="agent-description">{agent.description}</p>

              <div className="agent-meta">
                <span className="type-badge">{agent.type}</span>
                <div className="env-badges">
                  {Object.entries(agent.deployedVersions || {}).map(([env, ver]) => (
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
              </div>

              <div className="agent-stats">
                {agent.type === 'conversational' ? (
                  <>
                    <div className="stat">
                      <span className="stat-value">{agent.metrics?.totalConversations || 0}</span>
                      <span className="stat-label">Conversaciones</span>
                    </div>
                    <div className="stat">
                      <span className="stat-value">{agent.metrics?.satisfactionScore || 0}</span>
                      <span className="stat-label">Satisfacción</span>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="stat">
                      <span className="stat-value">{agent.metrics?.totalProcessed || 0}</span>
                      <span className="stat-label">Procesados</span>
                    </div>
                    <div className="stat">
                      <span className="stat-value">{((agent.metrics?.accuracy || 0) * 100).toFixed(0)}%</span>
                      <span className="stat-label">Precisión</span>
                    </div>
                  </>
                )}
              </div>

              <div className="agent-tools">
                <span className="tools-label">Tools: {agent.config?.tools?.length || 0}</span>
                <span className="mcp-label">MCP: {agent.mcpServers?.length || 0}</span>
              </div>

              <div className="agent-actions">
                <Link to={`/agents/${agent.id}/edit`} className="btn-secondary">
                  <i className="fas fa-edit"></i>
                  Editar
                </Link>
                <button
                  className="btn-secondary"
                  onClick={() => toast(`Probando agente ${agent.name}...`)}
                >
                  <i className="fas fa-comment"></i>
                  Probar
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default AgentsPage
