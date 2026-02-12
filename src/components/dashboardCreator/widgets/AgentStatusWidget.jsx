import { useState, useEffect } from 'react'
import { useLanguage } from '../../../context/LanguageContext'

const PLACEHOLDER_AGENTS = [
  { id: 1, nombre: 'Agent-01', estado: 'online' },
  { id: 2, nombre: 'Agent-02', estado: 'online' },
  { id: 3, nombre: 'Agent-03', estado: 'offline' },
  { id: 4, nombre: 'Agent-04', estado: 'idle' },
  { id: 5, nombre: 'Agent-05', estado: 'online' },
  { id: 6, nombre: 'Agent-06', estado: 'offline' }
]

const STATUS_LABELS = {
  online: 'En linea',
  offline: 'Desconectado',
  idle: 'Inactivo'
}

function AgentStatusWidget({ configuracion }) {
  const { t } = useLanguage()
  const [agents, setAgents] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false

    const fetchData = async () => {
      setLoading(true)
      try {
        const response = await fetch('/api/dashboards/widget-data/agentes_estado')
        if (!response.ok) throw new Error('No agents endpoint')
        const data = await response.json()
        if (!cancelled) {
          setAgents(data.agentes ?? data.datos ?? data.data ?? [])
        }
      } catch {
        if (!cancelled) {
          setAgents(PLACEHOLDER_AGENTS)
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    fetchData()
    return () => { cancelled = true }
  }, [])

  if (loading) {
    return (
      <div className="dc-loading">
        <i className="fas fa-spinner"></i>
        <span>{t('loading') || 'Cargando...'}</span>
      </div>
    )
  }

  if (agents.length === 0) {
    return (
      <div className="dc-empty" style={{ padding: '24px 16px' }}>
        <i className="fas fa-robot" style={{ fontSize: 24 }}></i>
        <p>No hay agentes configurados</p>
      </div>
    )
  }

  return (
    <div className="dc-agents-grid">
      {agents.map((agent) => {
        const estado = String(agent.estado || 'offline').toLowerCase()
        let dotClass = 'dc-agent-dot--offline'
        if (estado === 'online' || estado === 'activo') dotClass = 'dc-agent-dot--online'
        else if (estado === 'idle' || estado === 'inactivo') dotClass = 'dc-agent-dot--idle'

        return (
          <div className="dc-agent-card" key={agent.id}>
            <div className={`dc-agent-dot ${dotClass}`}></div>
            <div>
              <div className="dc-agent-name">{agent.nombre ?? agent.name ?? `Agent-${agent.id}`}</div>
              <div className="dc-agent-status-label">
                {STATUS_LABELS[estado] ?? estado}
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}

export default AgentStatusWidget
