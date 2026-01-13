import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import api from '../services/api'
import toast from 'react-hot-toast'

function AgentEditorPage() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [agent, setAgent] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [testMessage, setTestMessage] = useState('')
  const [testResponse, setTestResponse] = useState(null)
  const [testing, setTesting] = useState(false)

  useEffect(() => {
    fetchAgent()
  }, [id])

  const fetchAgent = async () => {
    try {
      setLoading(true)
      const response = await api.get(`/agents/${id}`)
      setAgent(response.data)
    } catch (error) {
      toast.error('Error cargando agente')
      navigate('/agents')
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    try {
      setSaving(true)
      await api.put(`/agents/${id}`, agent)
      toast.success('Agente guardado')
    } catch (error) {
      toast.error('Error guardando agente')
    } finally {
      setSaving(false)
    }
  }

  const handleTest = async () => {
    if (!testMessage.trim()) {
      toast.error('Escribe un mensaje de prueba')
      return
    }

    try {
      setTesting(true)
      const response = await api.post(`/agents/${id}/test`, {
        message: testMessage
      })
      setTestResponse(response.data)
    } catch (error) {
      toast.error('Error probando agente')
    } finally {
      setTesting(false)
    }
  }

  const updateConfig = (key, value) => {
    setAgent({
      ...agent,
      config: { ...agent.config, [key]: value }
    })
  }

  if (loading) {
    return (
      <div className="page-loading">
        <i className="fas fa-spinner fa-spin"></i>
        <span>Cargando agente...</span>
      </div>
    )
  }

  if (!agent) return null

  return (
    <div className="agent-editor-page">
      {/* Header */}
      <div className="editor-header">
        <div className="header-left">
          <Link to="/agents" className="back-btn">
            <i className="fas fa-arrow-left"></i>
          </Link>
          <div className="agent-info">
            <input
              type="text"
              className="agent-name-input"
              value={agent.name}
              onChange={(e) => setAgent({ ...agent, name: e.target.value })}
            />
            <span className="version-badge">v{agent.version}</span>
          </div>
        </div>
        <div className="header-right">
          <button className="btn-secondary" onClick={() => navigate('/deployment')}>
            <i className="fas fa-rocket"></i>
            Desplegar
          </button>
          <button className="btn-primary" onClick={handleSave} disabled={saving}>
            {saving ? (
              <><i className="fas fa-spinner fa-spin"></i> Guardando...</>
            ) : (
              <><i className="fas fa-save"></i> Guardar</>
            )}
          </button>
        </div>
      </div>

      {/* Editor Content */}
      <div className="editor-content">
        {/* Configuration Panel */}
        <div className="config-panel">
          <div className="panel-section">
            <h4>Configuración General</h4>

            <div className="form-group">
              <label>Descripción</label>
              <textarea
                value={agent.description}
                onChange={(e) => setAgent({ ...agent, description: e.target.value })}
                placeholder="Descripción del agente..."
              ></textarea>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Tipo</label>
                <select
                  value={agent.type}
                  onChange={(e) => setAgent({ ...agent, type: e.target.value })}
                >
                  <option value="conversational">Conversacional</option>
                  <option value="task">Tarea</option>
                </select>
              </div>

              <div className="form-group">
                <label>Modelo</label>
                <select
                  value={agent.model}
                  onChange={(e) => setAgent({ ...agent, model: e.target.value })}
                >
                  <option value="gpt-4">GPT-4</option>
                  <option value="gpt-4-vision">GPT-4 Vision</option>
                  <option value="gpt-3.5-turbo">GPT-3.5 Turbo</option>
                  <option value="claude-3-opus">Claude 3 Opus</option>
                  <option value="claude-3-sonnet">Claude 3 Sonnet</option>
                  <option value="claude-3-haiku">Claude 3 Haiku</option>
                </select>
              </div>
            </div>
          </div>

          <div className="panel-section">
            <h4>Parámetros del Modelo</h4>

            <div className="form-group">
              <label>Temperature: {agent.config?.temperature}</label>
              <input
                type="range"
                min="0"
                max="2"
                step="0.1"
                value={agent.config?.temperature || 0.7}
                onChange={(e) => updateConfig('temperature', parseFloat(e.target.value))}
              />
            </div>

            <div className="form-group">
              <label>Max Tokens: {agent.config?.maxTokens}</label>
              <input
                type="range"
                min="256"
                max="8192"
                step="256"
                value={agent.config?.maxTokens || 2048}
                onChange={(e) => updateConfig('maxTokens', parseInt(e.target.value))}
              />
            </div>
          </div>

          <div className="panel-section">
            <h4>System Prompt</h4>
            <textarea
              className="system-prompt"
              value={agent.config?.systemPrompt || ''}
              onChange={(e) => updateConfig('systemPrompt', e.target.value)}
              placeholder="Define el comportamiento del agente..."
              rows={8}
            ></textarea>
          </div>

          <div className="panel-section">
            <h4>Tools ({agent.config?.tools?.length || 0})</h4>
            <div className="tools-list">
              {agent.config?.tools?.map((tool, i) => (
                <span key={i} className="tool-tag">
                  <i className="fas fa-wrench"></i>
                  {tool}
                  <button onClick={() => {
                    const newTools = agent.config.tools.filter((_, idx) => idx !== i)
                    updateConfig('tools', newTools)
                  }}>
                    <i className="fas fa-times"></i>
                  </button>
                </span>
              ))}
            </div>
          </div>

          <div className="panel-section">
            <h4>MCP Servers ({agent.mcpServers?.length || 0})</h4>
            <div className="mcp-list">
              {agent.mcpServers?.map((mcp, i) => (
                <span key={i} className="mcp-tag">
                  <i className="fas fa-plug"></i>
                  {mcp}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Test Panel */}
        <div className="test-panel">
          <h4><i className="fas fa-vial"></i> Probar Agente</h4>

          <div className="test-chat">
            {testResponse && (
              <div className="chat-messages">
                <div className="message user">
                  <span className="sender">Tú</span>
                  <p>{testResponse.input}</p>
                </div>
                <div className="message agent">
                  <span className="sender">{agent.name}</span>
                  <p>{testResponse.output}</p>
                  <div className="message-meta">
                    <span><i className="fas fa-clock"></i> {testResponse.responseTime}ms</span>
                    <span><i className="fas fa-coins"></i> {testResponse.tokensUsed?.total} tokens</span>
                  </div>
                </div>
              </div>
            )}

            <div className="test-input">
              <input
                type="text"
                value={testMessage}
                onChange={(e) => setTestMessage(e.target.value)}
                placeholder="Escribe un mensaje de prueba..."
                onKeyPress={(e) => e.key === 'Enter' && handleTest()}
              />
              <button
                onClick={handleTest}
                disabled={testing}
                className="send-btn"
              >
                {testing ? (
                  <i className="fas fa-spinner fa-spin"></i>
                ) : (
                  <i className="fas fa-paper-plane"></i>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AgentEditorPage
