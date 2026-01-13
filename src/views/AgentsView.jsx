import { useState, useMemo } from 'react'
import { useLanguage } from '../context/LanguageContext'
import { useSocket } from '../context/SocketContext'

function AgentsView() {
  const { t } = useLanguage()
  const { socket, isConnected } = useSocket()
  const [searchTerm, setSearchTerm] = useState('')
  const [filterCategory, setFilterCategory] = useState('all')
  const [filterStatus, setFilterStatus] = useState('all')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showConfigModal, setShowConfigModal] = useState(false)
  const [showExeModal, setShowExeModal] = useState(false)
  const [selectedAgent, setSelectedAgent] = useState(null)
  const [generatingExe, setGeneratingExe] = useState(false)

  // Configuración para EXE
  const [exeConfig, setExeConfig] = useState({
    name: '',
    icon: '',
    outputPath: 'C:\\Alqvimia\\Agents',
    includeRuntime: true,
    autoStart: false,
    minimized: true,
    logFile: true
  })

  // Nuevo agente
  const [newAgent, setNewAgent] = useState({
    name: '',
    category: 'support',
    description: '',
    model: 'gpt-4',
    type: 'customer-service'
  })

  const [agents, setAgents] = useState([
    { id: 1, name: 'Agente de Cobranza', type: 'collection', category: 'finance', status: 'active', conversations: 156, description: 'Gestión automatizada de cobranzas', exePath: null },
    { id: 2, name: 'Atención al Cliente', type: 'customer-service', category: 'support', status: 'active', conversations: 432, description: 'Soporte general y resolución de dudas', exePath: null },
    { id: 3, name: 'Chatbot FAQ', type: 'customer-service', category: 'support', status: 'active', conversations: 1245, description: 'Respuestas automáticas a preguntas frecuentes', exePath: null },
    { id: 4, name: 'Mesa de Ayuda TI', type: 'it-support', category: 'tech', status: 'active', conversations: 89, description: 'Soporte técnico nivel 1 y 2', exePath: null },
    { id: 5, name: 'Asistente DevOps', type: 'it-support', category: 'tech', status: 'inactive', conversations: 234, description: 'Automatización y monitoreo', exePath: null },
    { id: 6, name: 'Asistente de Ventas', type: 'sales', category: 'sales', status: 'active', conversations: 267, description: 'Calificación de leads y seguimiento', exePath: null },
    { id: 7, name: 'Generador de Leads', type: 'sales', category: 'sales', status: 'active', conversations: 789, description: 'Prospección y captura de clientes', exePath: null },
    { id: 8, name: 'CFO Assistant', type: 'finance', category: 'finance', status: 'active', conversations: 45, description: 'Análisis financiero y reportes', exePath: null },
    { id: 9, name: 'Recruiter Bot', type: 'hr', category: 'hr', status: 'active', conversations: 345, description: 'Reclutamiento y screening', exePath: null },
    { id: 10, name: 'Content Creator', type: 'marketing', category: 'marketing', status: 'active', conversations: 234, description: 'Generación de contenido', exePath: null },
    { id: 11, name: 'WhatsApp Bot', type: 'multichannel', category: 'channels', status: 'active', conversations: 2345, description: 'Atención por WhatsApp', exePath: null },
    { id: 12, name: 'Voice IVR Agent', type: 'multichannel', category: 'channels', status: 'active', conversations: 890, description: 'Respuesta de voz interactiva', exePath: null }
  ])

  const categories = [
    { id: 'all', name: 'Todos', icon: 'fa-globe' },
    { id: 'finance', name: 'Finanzas', icon: 'fa-coins' },
    { id: 'support', name: 'Soporte', icon: 'fa-headset' },
    { id: 'tech', name: 'Tecnología', icon: 'fa-laptop-code' },
    { id: 'sales', name: 'Ventas', icon: 'fa-chart-line' },
    { id: 'hr', name: 'RRHH', icon: 'fa-users-cog' },
    { id: 'marketing', name: 'Marketing', icon: 'fa-bullhorn' },
    { id: 'channels', name: 'Multicanal', icon: 'fa-comments' }
  ]

  const models = [
    { id: 'gpt-4', name: 'GPT-4', provider: 'OpenAI' },
    { id: 'gpt-4-turbo', name: 'GPT-4 Turbo', provider: 'OpenAI' },
    { id: 'claude-3-opus', name: 'Claude 3 Opus', provider: 'Anthropic' },
    { id: 'claude-3-sonnet', name: 'Claude 3.5 Sonnet', provider: 'Anthropic' },
    { id: 'gemini-pro', name: 'Gemini Pro', provider: 'Google' },
    { id: 'llama-3', name: 'Llama 3', provider: 'Meta' }
  ]

  const getTypeIcon = (type) => {
    const icons = {
      'collection': 'fa-comments-dollar',
      'customer-service': 'fa-headset',
      'it-support': 'fa-laptop-medical',
      'sales': 'fa-user-tie',
      'finance': 'fa-chart-pie',
      'hr': 'fa-users-cog',
      'marketing': 'fa-bullhorn',
      'multichannel': 'fa-comments'
    }
    return icons[type] || 'fa-robot'
  }

  const getTypeColor = (type) => {
    const colors = {
      'collection': 'linear-gradient(135deg, #f59e0b, #d97706)',
      'customer-service': 'linear-gradient(135deg, #3b82f6, #2563eb)',
      'it-support': 'linear-gradient(135deg, #10b981, #059669)',
      'sales': 'linear-gradient(135deg, #8b5cf6, #7c3aed)',
      'finance': 'linear-gradient(135deg, #14b8a6, #0d9488)',
      'hr': 'linear-gradient(135deg, #ec4899, #db2777)',
      'marketing': 'linear-gradient(135deg, #f97316, #ea580c)',
      'multichannel': 'linear-gradient(135deg, #84cc16, #65a30d)'
    }
    return colors[type] || 'linear-gradient(135deg, #6366f1, #8b5cf6)'
  }

  const filteredAgents = useMemo(() => {
    return agents.filter(agent => {
      const matchesSearch = agent.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           agent.description.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesCategory = filterCategory === 'all' || agent.category === filterCategory
      const matchesStatus = filterStatus === 'all' || agent.status === filterStatus
      return matchesSearch && matchesCategory && matchesStatus
    })
  }, [agents, searchTerm, filterCategory, filterStatus])

  const toggleAgentStatus = (agentId) => {
    setAgents(agents.map(agent =>
      agent.id === agentId
        ? { ...agent, status: agent.status === 'active' ? 'inactive' : 'active' }
        : agent
    ))
  }

  const stats = useMemo(() => ({
    total: agents.length,
    active: agents.filter(a => a.status === 'active').length,
    inactive: agents.filter(a => a.status === 'inactive').length,
    withExe: agents.filter(a => a.exePath).length
  }), [agents])

  // Crear nuevo agente
  const createAgent = () => {
    if (!newAgent.name.trim()) {
      alert('Ingresa un nombre')
      return
    }

    const agent = {
      id: Date.now(),
      name: newAgent.name,
      type: newAgent.type,
      category: newAgent.category,
      description: newAgent.description,
      model: newAgent.model,
      status: 'inactive',
      conversations: 0,
      exePath: null,
      createdAt: new Date().toISOString()
    }

    setAgents([...agents, agent])
    setShowCreateModal(false)
    setNewAgent({ name: '', category: 'support', description: '', model: 'gpt-4', type: 'customer-service' })
  }

  // Abrir modal de generar EXE
  const openExeModal = (agent) => {
    setSelectedAgent(agent)
    setExeConfig({
      ...exeConfig,
      name: agent.name.replace(/[^a-zA-Z0-9]/g, '_')
    })
    setShowExeModal(true)
  }

  // Generar EXE del agente
  const generateExe = async () => {
    if (!selectedAgent) return

    if (!socket || !isConnected) {
      alert('No hay conexión con el servidor. Por favor, inicia el servidor primero.')
      return
    }

    setGeneratingExe(true)

    // Escuchar respuesta del servidor
    const handleExeGenerated = (data) => {
      setGeneratingExe(false)
      if (data.success) {
        // Actualizar agente con ruta del EXE
        setAgents(agents.map(a =>
          a.id === selectedAgent.id ? { ...a, exePath: data.exePath } : a
        ))
        alert(`✅ ${data.message}\n\nRuta: ${data.exePath}`)
        setShowExeModal(false)
      } else {
        alert(`❌ Error: ${data.error || 'Error desconocido'}`)
      }
      // Limpiar listener
      socket.off('agent:exe-generated', handleExeGenerated)
      socket.off('agent:exe-error', handleExeError)
    }

    const handleExeError = (data) => {
      setGeneratingExe(false)
      alert(`❌ Error generando EXE: ${data.error || 'Error desconocido'}`)
      socket.off('agent:exe-generated', handleExeGenerated)
      socket.off('agent:exe-error', handleExeError)
    }

    // Registrar listeners
    socket.on('agent:exe-generated', handleExeGenerated)
    socket.on('agent:exe-error', handleExeError)

    // Enviar petición al servidor
    socket.emit('agent:generate-exe', {
      agentId: selectedAgent.id,
      config: exeConfig
    })

    // Timeout de seguridad
    setTimeout(() => {
      if (generatingExe) {
        setGeneratingExe(false)
        alert('⚠️ Timeout: La generación está tardando demasiado.')
        socket.off('agent:exe-generated', handleExeGenerated)
        socket.off('agent:exe-error', handleExeError)
      }
    }, 30000)
  }

  // Eliminar agente
  const deleteAgent = (agentId) => {
    if (confirm('¿Eliminar este agente?')) {
      setAgents(agents.filter(a => a.id !== agentId))
    }
  }

  // Ejecutar EXE
  const runExe = (agent) => {
    if (!agent.exePath) {
      alert('Este agente no tiene un ejecutable generado.')
      return
    }

    if (!socket || !isConnected) {
      alert('No hay conexión con el servidor.')
      return
    }

    // Escuchar respuesta
    const handleStarted = (data) => {
      if (data.success) {
        alert(`✅ Agente iniciado: ${agent.name}`)
      }
      socket.off('agent:exe-started', handleStarted)
      socket.off('agent:exe-error', handleError)
    }

    const handleError = (data) => {
      alert(`❌ Error: ${data.error}`)
      socket.off('agent:exe-started', handleStarted)
      socket.off('agent:exe-error', handleError)
    }

    socket.on('agent:exe-started', handleStarted)
    socket.on('agent:exe-error', handleError)

    socket.emit('agent:run-exe', { path: agent.exePath })
  }

  return (
    <div className="view" id="agents-view">
      <div className="view-header">
        <h2><i className="fas fa-robot"></i> Agentes IA</h2>
        <p>Gestiona tus agentes de inteligencia artificial</p>
      </div>

      {/* Stats Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: '1rem',
        marginBottom: '2rem'
      }}>
        <div style={{
          background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
          padding: '1.25rem',
          borderRadius: '12px',
          color: 'white'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <i className="fas fa-robot" style={{ fontSize: '1.5rem' }}></i>
            <div>
              <div style={{ fontSize: '1.75rem', fontWeight: '700' }}>{stats.total}</div>
              <div style={{ fontSize: '0.85rem', opacity: 0.9 }}>Total Agentes</div>
            </div>
          </div>
        </div>
        <div style={{
          background: 'linear-gradient(135deg, #10b981, #059669)',
          padding: '1.25rem',
          borderRadius: '12px',
          color: 'white'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <i className="fas fa-check-circle" style={{ fontSize: '1.5rem' }}></i>
            <div>
              <div style={{ fontSize: '1.75rem', fontWeight: '700' }}>{stats.active}</div>
              <div style={{ fontSize: '0.85rem', opacity: 0.9 }}>Activos</div>
            </div>
          </div>
        </div>
        <div style={{
          background: 'linear-gradient(135deg, #f59e0b, #d97706)',
          padding: '1.25rem',
          borderRadius: '12px',
          color: 'white'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <i className="fas fa-pause-circle" style={{ fontSize: '1.5rem' }}></i>
            <div>
              <div style={{ fontSize: '1.75rem', fontWeight: '700' }}>{stats.inactive}</div>
              <div style={{ fontSize: '0.85rem', opacity: 0.9 }}>Inactivos</div>
            </div>
          </div>
        </div>
        <div style={{
          background: 'linear-gradient(135deg, #3b82f6, #2563eb)',
          padding: '1.25rem',
          borderRadius: '12px',
          color: 'white'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <i className="fas fa-cube" style={{ fontSize: '1.5rem' }}></i>
            <div>
              <div style={{ fontSize: '1.75rem', fontWeight: '700' }}>{stats.withExe}</div>
              <div style={{ fontSize: '0.85rem', opacity: 0.9 }}>Con EXE</div>
            </div>
          </div>
        </div>
      </div>

      {/* Category Filters */}
      <div style={{
        display: 'flex',
        gap: '0.5rem',
        marginBottom: '1.5rem',
        flexWrap: 'wrap'
      }}>
        {categories.map(category => (
          <button
            key={category.id}
            onClick={() => setFilterCategory(category.id)}
            style={{
              padding: '0.5rem 1rem',
              background: filterCategory === category.id ? 'var(--primary-color)' : 'var(--bg-secondary)',
              border: `1px solid ${filterCategory === category.id ? 'var(--primary-color)' : 'var(--border-color)'}`,
              borderRadius: '20px',
              color: filterCategory === category.id ? 'white' : 'var(--text-primary)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              fontSize: '0.85rem'
            }}
          >
            <i className={`fas ${category.icon}`}></i>
            {category.name}
          </button>
        ))}
      </div>

      {/* Toolbar */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '1.5rem',
        flexWrap: 'wrap',
        gap: '1rem'
      }}>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <div style={{ position: 'relative' }}>
            <i className="fas fa-search" style={{
              position: 'absolute',
              left: '1rem',
              top: '50%',
              transform: 'translateY(-50%)',
              color: 'var(--text-secondary)'
            }}></i>
            <input
              type="text"
              placeholder="Buscar agentes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                padding: '0.75rem 1rem 0.75rem 2.5rem',
                background: 'var(--bg-secondary)',
                border: '1px solid var(--border-color)',
                borderRadius: '8px',
                color: 'var(--text-primary)',
                width: '300px'
              }}
            />
          </div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            style={{
              padding: '0.75rem 1rem',
              background: 'var(--bg-secondary)',
              border: '1px solid var(--border-color)',
              borderRadius: '8px',
              color: 'var(--text-primary)'
            }}
          >
            <option value="all">Todos los estados</option>
            <option value="active">Activos</option>
            <option value="inactive">Inactivos</option>
          </select>
        </div>
        <button className="btn btn-primary" onClick={() => setShowCreateModal(true)}>
          <i className="fas fa-plus"></i> Crear Agente
        </button>
      </div>

      {/* Results count */}
      <div style={{ marginBottom: '1rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
        Mostrando {filteredAgents.length} de {agents.length} agentes
      </div>

      {/* Agents Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
        gap: '1.25rem'
      }}>
        {filteredAgents.map(agent => (
          <div key={agent.id} style={{
            background: 'var(--bg-secondary)',
            borderRadius: '12px',
            border: '1px solid var(--border-color)',
            overflow: 'hidden'
          }}>
            <div style={{
              padding: '1.25rem',
              background: getTypeColor(agent.type),
              display: 'flex',
              alignItems: 'center',
              gap: '1rem'
            }}>
              <div style={{
                width: '48px',
                height: '48px',
                background: 'rgba(255,255,255,0.2)',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <i className={`fas ${getTypeIcon(agent.type)}`} style={{ fontSize: '1.25rem', color: 'white' }}></i>
              </div>
              <div style={{ flex: 1 }}>
                <h4 style={{ margin: '0 0 0.25rem', color: 'white', fontSize: '1rem' }}>{agent.name}</h4>
                <span className={`badge ${agent.status === 'active' ? 'badge-success' : 'badge-secondary'}`}>
                  {agent.status === 'active' ? 'Activo' : 'Inactivo'}
                </span>
                {agent.exePath && (
                  <span className="badge" style={{ marginLeft: '0.5rem', background: '#3b82f6' }}>
                    <i className="fas fa-cube"></i> EXE
                  </span>
                )}
              </div>
              <button
                onClick={() => toggleAgentStatus(agent.id)}
                style={{
                  background: 'rgba(255,255,255,0.2)',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '0.5rem',
                  cursor: 'pointer',
                  color: 'white'
                }}
              >
                <i className={`fas fa-${agent.status === 'active' ? 'pause' : 'play'}`}></i>
              </button>
            </div>

            <div style={{ padding: '1.25rem' }}>
              <p style={{
                margin: '0 0 1rem',
                color: 'var(--text-secondary)',
                fontSize: '0.875rem',
                lineHeight: '1.5'
              }}>
                {agent.description}
              </p>

              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '1rem',
                paddingBottom: '1rem',
                borderBottom: '1px solid var(--border-color)'
              }}>
                <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                  <i className="fas fa-comments"></i> {agent.conversations.toLocaleString()} conversaciones
                </span>
              </div>

              {agent.exePath && (
                <div style={{
                  padding: '0.5rem',
                  background: 'var(--bg-tertiary)',
                  borderRadius: '6px',
                  fontSize: '0.75rem',
                  color: 'var(--text-muted)',
                  marginBottom: '1rem',
                  fontFamily: 'monospace'
                }}>
                  <i className="fas fa-file-alt"></i> {agent.exePath}
                </div>
              )}

              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button className="btn btn-sm btn-primary" style={{ flex: 1 }} onClick={() => {
                  setSelectedAgent(agent)
                  setShowConfigModal(true)
                }}>
                  <i className="fas fa-cog"></i> Config
                </button>
                {agent.exePath ? (
                  <button className="btn btn-sm btn-success" title="Ejecutar EXE" onClick={() => runExe(agent)}>
                    <i className="fas fa-play"></i>
                  </button>
                ) : (
                  <button className="btn btn-sm btn-info" title="Generar EXE" onClick={() => openExeModal(agent)}>
                    <i className="fas fa-cube"></i>
                  </button>
                )}
                <button className="btn btn-sm btn-danger" title="Eliminar" onClick={() => deleteAgent(agent.id)}>
                  <i className="fas fa-trash"></i>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredAgents.length === 0 && (
        <div style={{
          textAlign: 'center',
          padding: '4rem 2rem',
          color: 'var(--text-secondary)'
        }}>
          <i className="fas fa-robot" style={{ fontSize: '3rem', marginBottom: '1rem', opacity: 0.5 }}></i>
          <h3>No se encontraron agentes</h3>
          <p>Intenta ajustar los filtros de búsqueda</p>
        </div>
      )}

      {/* Modal: Crear Agente */}
      {showCreateModal && (
        <div className="modal-overlay" onClick={() => setShowCreateModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '500px' }}>
            <div className="modal-header">
              <h3><i className="fas fa-plus"></i> Crear Nuevo Agente</h3>
              <button className="modal-close" onClick={() => setShowCreateModal(false)}>
                <i className="fas fa-times"></i>
              </button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label><i className="fas fa-robot"></i> Nombre del Agente *</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Ej: Asistente de Ventas"
                  value={newAgent.name}
                  onChange={e => setNewAgent({ ...newAgent, name: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label><i className="fas fa-layer-group"></i> Categoría</label>
                <select
                  className="form-control"
                  value={newAgent.category}
                  onChange={e => setNewAgent({ ...newAgent, category: e.target.value })}
                >
                  {categories.filter(c => c.id !== 'all').map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label><i className="fas fa-align-left"></i> Descripción</label>
                <textarea
                  className="form-control"
                  rows={3}
                  placeholder="Describe las funciones del agente..."
                  value={newAgent.description}
                  onChange={e => setNewAgent({ ...newAgent, description: e.target.value })}
                ></textarea>
              </div>
              <div className="form-group">
                <label><i className="fas fa-brain"></i> Modelo de IA</label>
                <select
                  className="form-control"
                  value={newAgent.model}
                  onChange={e => setNewAgent({ ...newAgent, model: e.target.value })}
                >
                  {models.map(m => (
                    <option key={m.id} value={m.id}>{m.name} ({m.provider})</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setShowCreateModal(false)}>Cancelar</button>
              <button className="btn btn-primary" onClick={createAgent}>
                <i className="fas fa-check"></i> Crear Agente
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Generar EXE */}
      {showExeModal && selectedAgent && (
        <div className="modal-overlay" onClick={() => setShowExeModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '550px' }}>
            <div className="modal-header">
              <h3><i className="fas fa-cube"></i> Generar Ejecutable (.EXE)</h3>
              <button className="modal-close" onClick={() => setShowExeModal(false)}>
                <i className="fas fa-times"></i>
              </button>
            </div>
            <div className="modal-body">
              <div style={{
                padding: '1rem',
                background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(139, 92, 246, 0.1))',
                borderRadius: '10px',
                marginBottom: '1.5rem',
                display: 'flex',
                alignItems: 'center',
                gap: '1rem'
              }}>
                <div style={{
                  width: '50px',
                  height: '50px',
                  background: getTypeColor(selectedAgent.type),
                  borderRadius: '10px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <i className={`fas ${getTypeIcon(selectedAgent.type)}`} style={{ color: 'white', fontSize: '1.25rem' }}></i>
                </div>
                <div>
                  <h4 style={{ margin: 0 }}>{selectedAgent.name}</h4>
                  <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-muted)' }}>{selectedAgent.description}</p>
                </div>
              </div>

              <div className="form-group">
                <label><i className="fas fa-file"></i> Nombre del archivo *</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <input
                    type="text"
                    className="form-control"
                    value={exeConfig.name}
                    onChange={e => setExeConfig({ ...exeConfig, name: e.target.value })}
                  />
                  <span style={{ color: 'var(--text-muted)' }}>.exe</span>
                </div>
              </div>

              <div className="form-group">
                <label><i className="fas fa-folder"></i> Ruta de salida</label>
                <input
                  type="text"
                  className="form-control"
                  value={exeConfig.outputPath}
                  onChange={e => setExeConfig({ ...exeConfig, outputPath: e.target.value })}
                />
              </div>

              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '1rem',
                marginTop: '1rem'
              }}>
                <label style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.75rem',
                  background: 'var(--bg-tertiary)',
                  borderRadius: '8px',
                  cursor: 'pointer'
                }}>
                  <input
                    type="checkbox"
                    checked={exeConfig.includeRuntime}
                    onChange={e => setExeConfig({ ...exeConfig, includeRuntime: e.target.checked })}
                  />
                  <span>Incluir runtime</span>
                </label>
                <label style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.75rem',
                  background: 'var(--bg-tertiary)',
                  borderRadius: '8px',
                  cursor: 'pointer'
                }}>
                  <input
                    type="checkbox"
                    checked={exeConfig.autoStart}
                    onChange={e => setExeConfig({ ...exeConfig, autoStart: e.target.checked })}
                  />
                  <span>Auto-iniciar</span>
                </label>
                <label style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.75rem',
                  background: 'var(--bg-tertiary)',
                  borderRadius: '8px',
                  cursor: 'pointer'
                }}>
                  <input
                    type="checkbox"
                    checked={exeConfig.minimized}
                    onChange={e => setExeConfig({ ...exeConfig, minimized: e.target.checked })}
                  />
                  <span>Iniciar minimizado</span>
                </label>
                <label style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.75rem',
                  background: 'var(--bg-tertiary)',
                  borderRadius: '8px',
                  cursor: 'pointer'
                }}>
                  <input
                    type="checkbox"
                    checked={exeConfig.logFile}
                    onChange={e => setExeConfig({ ...exeConfig, logFile: e.target.checked })}
                  />
                  <span>Generar logs</span>
                </label>
              </div>

              <div style={{
                marginTop: '1.5rem',
                padding: '1rem',
                background: 'rgba(34, 197, 94, 0.1)',
                borderRadius: '8px',
                fontSize: '0.85rem'
              }}>
                <strong><i className="fas fa-info-circle"></i> El ejecutable incluirá:</strong>
                <ul style={{ margin: '0.5rem 0 0', paddingLeft: '1.5rem' }}>
                  <li>Configuración del agente</li>
                  <li>Modelo de IA seleccionado</li>
                  <li>Conexión al servidor Alqvimia</li>
                  <li>Interfaz de sistema en bandeja</li>
                </ul>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setShowExeModal(false)}>Cancelar</button>
              <button className="btn btn-primary" onClick={generateExe} disabled={generatingExe}>
                {generatingExe ? (
                  <><i className="fas fa-spinner fa-spin"></i> Generando...</>
                ) : (
                  <><i className="fas fa-download"></i> Generar EXE</>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Configurar Agente */}
      {showConfigModal && selectedAgent && (
        <div className="modal-overlay" onClick={() => setShowConfigModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '600px' }}>
            <div className="modal-header">
              <h3><i className="fas fa-cog"></i> Configurar Agente</h3>
              <button className="modal-close" onClick={() => setShowConfigModal(false)}>
                <i className="fas fa-times"></i>
              </button>
            </div>
            <div className="modal-body">
              <div style={{
                padding: '1rem',
                background: getTypeColor(selectedAgent.type),
                borderRadius: '10px',
                marginBottom: '1.5rem',
                color: 'white'
              }}>
                <h4 style={{ margin: 0 }}>{selectedAgent.name}</h4>
                <p style={{ margin: '0.5rem 0 0', opacity: 0.9 }}>{selectedAgent.description}</p>
              </div>

              <div className="form-group">
                <label>Nombre</label>
                <input type="text" className="form-control" defaultValue={selectedAgent.name} />
              </div>
              <div className="form-group">
                <label>Descripción</label>
                <textarea className="form-control" rows={2} defaultValue={selectedAgent.description}></textarea>
              </div>
              <div className="form-group">
                <label>Modelo de IA</label>
                <select className="form-control" defaultValue={selectedAgent.model || 'gpt-4'}>
                  {models.map(m => (
                    <option key={m.id} value={m.id}>{m.name}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Prompt del sistema</label>
                <textarea
                  className="form-control"
                  rows={4}
                  placeholder="Instrucciones para el agente..."
                  style={{ fontFamily: 'monospace', fontSize: '0.85rem' }}
                ></textarea>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setShowConfigModal(false)}>Cancelar</button>
              <button className="btn btn-primary" onClick={() => {
                setShowConfigModal(false)
                alert('Configuración guardada')
              }}>
                <i className="fas fa-save"></i> Guardar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AgentsView
