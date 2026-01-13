import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import api from '../services/api'
import toast from 'react-hot-toast'

function WorkflowEditorPage() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [workflow, setWorkflow] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetchWorkflow()
  }, [id])

  const fetchWorkflow = async () => {
    try {
      setLoading(true)
      const response = await api.get(`/workflows/${id}/definition`)
      setWorkflow(response.data)
    } catch (error) {
      toast.error('Error cargando workflow')
      navigate('/workflows')
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    try {
      setSaving(true)
      await api.put(`/workflows/${id}`, workflow)
      toast.success('Workflow guardado')
    } catch (error) {
      toast.error('Error guardando workflow')
    } finally {
      setSaving(false)
    }
  }

  const handleDeploy = () => {
    toast('Abriendo panel de despliegue...')
    navigate(`/deployment?workflow=${id}`)
  }

  if (loading) {
    return (
      <div className="page-loading">
        <i className="fas fa-spinner fa-spin"></i>
        <span>Cargando editor...</span>
      </div>
    )
  }

  if (!workflow) return null

  return (
    <div className="workflow-editor-page">
      {/* Toolbar */}
      <div className="editor-toolbar">
        <div className="toolbar-left">
          <Link to="/workflows" className="back-btn">
            <i className="fas fa-arrow-left"></i>
          </Link>
          <div className="workflow-info">
            <input
              type="text"
              className="workflow-name-input"
              value={workflow.name}
              onChange={(e) => setWorkflow({ ...workflow, name: e.target.value })}
            />
            <span className="version-badge">v{workflow.version}</span>
          </div>
        </div>

        <div className="toolbar-center">
          <button className="tool-btn" title="Deshacer">
            <i className="fas fa-undo"></i>
          </button>
          <button className="tool-btn" title="Rehacer">
            <i className="fas fa-redo"></i>
          </button>
          <div className="toolbar-divider"></div>
          <button className="tool-btn" title="Zoom In">
            <i className="fas fa-search-plus"></i>
          </button>
          <button className="tool-btn" title="Zoom Out">
            <i className="fas fa-search-minus"></i>
          </button>
          <button className="tool-btn" title="Centrar">
            <i className="fas fa-compress-arrows-alt"></i>
          </button>
        </div>

        <div className="toolbar-right">
          <button className="btn-secondary" onClick={() => toast('Ejecutando prueba...')}>
            <i className="fas fa-play"></i>
            Probar
          </button>
          <button className="btn-secondary" onClick={handleDeploy}>
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

      {/* Editor Area */}
      <div className="editor-container">
        {/* Sidebar - Node Palette */}
        <aside className="node-palette">
          <h4>Nodos</h4>

          <div className="node-category">
            <h5>Triggers</h5>
            <div className="node-item" draggable>
              <i className="fas fa-play-circle"></i>
              <span>Manual</span>
            </div>
            <div className="node-item" draggable>
              <i className="fas fa-clock"></i>
              <span>Programado</span>
            </div>
            <div className="node-item" draggable>
              <i className="fas fa-webhook"></i>
              <span>Webhook</span>
            </div>
          </div>

          <div className="node-category">
            <h5>Acciones</h5>
            <div className="node-item" draggable>
              <i className="fas fa-code"></i>
              <span>Script</span>
            </div>
            <div className="node-item" draggable>
              <i className="fas fa-globe"></i>
              <span>HTTP Request</span>
            </div>
            <div className="node-item" draggable>
              <i className="fas fa-database"></i>
              <span>Database</span>
            </div>
            <div className="node-item" draggable>
              <i className="fas fa-envelope"></i>
              <span>Email</span>
            </div>
          </div>

          <div className="node-category">
            <h5>Control</h5>
            <div className="node-item" draggable>
              <i className="fas fa-code-branch"></i>
              <span>Condición</span>
            </div>
            <div className="node-item" draggable>
              <i className="fas fa-sync"></i>
              <span>Loop</span>
            </div>
            <div className="node-item" draggable>
              <i className="fas fa-pause"></i>
              <span>Delay</span>
            </div>
          </div>

          <div className="node-category">
            <h5>AI</h5>
            <div className="node-item" draggable>
              <i className="fas fa-robot"></i>
              <span>Agente</span>
            </div>
            <div className="node-item" draggable>
              <i className="fas fa-brain"></i>
              <span>LLM</span>
            </div>
          </div>
        </aside>

        {/* Canvas */}
        <div className="editor-canvas">
          <div className="canvas-placeholder">
            <i className="fas fa-project-diagram"></i>
            <p>Editor de Workflow Visual</p>
            <small>Arrastra nodos desde el panel izquierdo para comenzar</small>

            {/* Simple visual representation */}
            <div className="simple-flow">
              {workflow.nodeDefinitions?.map((node, index) => (
                <div key={node.id} className="flow-node" style={{
                  left: node.position?.x || 100 + index * 200,
                  top: node.position?.y || 100
                }}>
                  <i className={`fas ${
                    node.type === 'trigger' ? 'fa-play-circle' :
                    node.type === 'condition' ? 'fa-code-branch' :
                    'fa-cog'
                  }`}></i>
                  <span>{node.type}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Properties Panel */}
        <aside className="properties-panel">
          <h4>Propiedades</h4>

          <div className="property-section">
            <h5>Workflow</h5>
            <div className="property-group">
              <label>Descripción</label>
              <textarea
                value={workflow.description}
                onChange={(e) => setWorkflow({ ...workflow, description: e.target.value })}
                placeholder="Descripción del workflow..."
              ></textarea>
            </div>
          </div>

          <div className="property-section">
            <h5>Variables ({workflow.variables?.length || 0})</h5>
            <div className="variables-list">
              {workflow.variables?.map((v, i) => (
                <span key={i} className="variable-tag">{v}</span>
              ))}
            </div>
            <button className="add-btn">
              <i className="fas fa-plus"></i> Agregar Variable
            </button>
          </div>

          <div className="property-section">
            <h5>Triggers ({workflow.triggers?.length || 0})</h5>
            <div className="triggers-list">
              {workflow.triggers?.map((t, i) => (
                <span key={i} className="trigger-tag">{t}</span>
              ))}
            </div>
          </div>

          <div className="property-section">
            <h5>Versiones Desplegadas</h5>
            {Object.entries(workflow.deployedVersions || {}).map(([env, ver]) => (
              <div key={env} className="deployed-version">
                <span className="env">{env.toUpperCase()}</span>
                <span className="ver">v{ver}</span>
              </div>
            ))}
          </div>
        </aside>
      </div>
    </div>
  )
}

export default WorkflowEditorPage
