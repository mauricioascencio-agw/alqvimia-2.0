/**
 * ALQVIMIA RPA 2.0 - Agent Project Viewer Component
 * Muestra la información del proyecto del agente, requerimientos y estructura
 */

import { useState, useEffect } from 'react'

function AgentProjectViewer({ projectData, onClose, onOpenFolder }) {
  const [activeTab, setActiveTab] = useState('overview')
  const [structureDoc, setStructureDoc] = useState(null)
  const [requirementsData, setRequirementsData] = useState(null)
  const [isLoading, setIsLoading] = useState(false)

  const { project, data } = projectData || {}

  useEffect(() => {
    if (project?.path) {
      loadProjectDetails()
    }
  }, [project])

  const loadProjectDetails = async () => {
    if (!project?.metadata?.folderName && !project?.path) return

    setIsLoading(true)
    try {
      const folderName = project.metadata?.folderName || project.path.split('\\').pop()

      // Cargar estructura
      const structureRes = await fetch(`http://localhost:4000/api/ai/projects/${encodeURIComponent(folderName)}/structure`)
      if (structureRes.ok) {
        const structureData = await structureRes.json()
        if (structureData.success) {
          setStructureDoc(structureData.data)
        }
      }

      // Cargar requerimientos
      const reqRes = await fetch(`http://localhost:4000/api/ai/projects/${encodeURIComponent(folderName)}/requirements`)
      if (reqRes.ok) {
        const reqData = await reqRes.json()
        if (reqData.success) {
          setRequirementsData(reqData.data)
        }
      }
    } catch (error) {
      console.error('Error cargando detalles del proyecto:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const getRequirementIcon = (type) => {
    switch (type) {
      case 'credential': return 'fa-key'
      case 'integration': return 'fa-plug'
      case 'data': return 'fa-database'
      case 'file': return 'fa-file'
      default: return 'fa-cube'
    }
  }

  const getRequirementColor = (type) => {
    switch (type) {
      case 'credential': return '#f59e0b'
      case 'integration': return '#8b5cf6'
      case 'data': return '#3b82f6'
      case 'file': return '#10b981'
      default: return '#6b7280'
    }
  }

  const formatPath = (fullPath) => {
    if (!fullPath) return ''
    // Mostrar ruta abreviada
    const parts = fullPath.split('\\')
    if (parts.length > 3) {
      return `...\\${parts.slice(-3).join('\\')}`
    }
    return fullPath
  }

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text)
  }

  if (!projectData) {
    return (
      <div className="agent-project-viewer empty">
        <div className="empty-state">
          <i className="fas fa-folder-open"></i>
          <p>No hay proyecto seleccionado</p>
        </div>
      </div>
    )
  }

  return (
    <div className="agent-project-viewer">
      {/* Header */}
      <div className="project-header">
        <div className="project-title">
          <i className="fas fa-robot"></i>
          <div>
            <h2>{data?.agent?.name || 'Agente Generado'}</h2>
            <span className="project-category">{data?.agent?.category || 'custom'}</span>
          </div>
        </div>
        <div className="project-actions">
          {project?.path && (
            <button
              className="btn-icon"
              onClick={() => onOpenFolder?.(project.path)}
              title="Abrir carpeta del proyecto"
            >
              <i className="fas fa-folder-open"></i>
            </button>
          )}
          <button className="btn-icon" onClick={onClose} title="Cerrar">
            <i className="fas fa-times"></i>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="project-tabs">
        <button
          className={`tab ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          <i className="fas fa-info-circle"></i> Resumen
        </button>
        <button
          className={`tab ${activeTab === 'requirements' ? 'active' : ''}`}
          onClick={() => setActiveTab('requirements')}
        >
          <i className="fas fa-clipboard-list"></i> Requerimientos
        </button>
        <button
          className={`tab ${activeTab === 'structure' ? 'active' : ''}`}
          onClick={() => setActiveTab('structure')}
        >
          <i className="fas fa-sitemap"></i> Estructura
        </button>
        <button
          className={`tab ${activeTab === 'paths' ? 'active' : ''}`}
          onClick={() => setActiveTab('paths')}
        >
          <i className="fas fa-folder-tree"></i> Rutas
        </button>
      </div>

      {/* Content */}
      <div className="project-content">
        {isLoading && (
          <div className="loading-overlay">
            <i className="fas fa-spinner fa-spin"></i>
            <span>Cargando información...</span>
          </div>
        )}

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="tab-content overview-tab">
            <div className="overview-grid">
              {/* Agent Info */}
              <div className="info-card">
                <h4><i className="fas fa-robot"></i> Información del Agente</h4>
                <div className="info-content">
                  <p><strong>Nombre:</strong> {data?.agent?.name}</p>
                  <p><strong>Descripción:</strong> {data?.agent?.description}</p>
                  <p><strong>Categoría:</strong> {data?.agent?.category}</p>
                  <p><strong>Complejidad:</strong>
                    <span className={`complexity-badge ${data?.agent?.complexity}`}>
                      {data?.agent?.complexity || 'medium'}
                    </span>
                  </p>
                </div>
              </div>

              {/* Capabilities */}
              <div className="info-card">
                <h4><i className="fas fa-bolt"></i> Capacidades</h4>
                <ul className="capabilities-list">
                  {data?.agent?.capabilities?.map((cap, i) => (
                    <li key={i}>
                      <i className="fas fa-check"></i> {cap}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Workflow Summary */}
              {data?.workflow && (
                <div className="info-card">
                  <h4><i className="fas fa-project-diagram"></i> Workflow</h4>
                  <div className="info-content">
                    <p><strong>Nombre:</strong> {data.workflow.name}</p>
                    <p><strong>Pasos:</strong> {data.workflow.steps?.length || 0}</p>
                    <p><strong>Variables:</strong> {Object.keys(data.workflow.variables || {}).length}</p>
                    <p><strong>Manejo de errores:</strong> {data.workflow.errorHandling?.onError}</p>
                  </div>
                </div>
              )}

              {/* Project Path */}
              {project?.path && (
                <div className="info-card full-width">
                  <h4><i className="fas fa-folder"></i> Ubicación del Proyecto</h4>
                  <div className="path-display">
                    <code>{project.path}</code>
                    <button
                      className="btn-copy"
                      onClick={() => copyToClipboard(project.path)}
                      title="Copiar ruta"
                    >
                      <i className="fas fa-copy"></i>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Recommendations */}
            {data?.recommendations?.length > 0 && (
              <div className="recommendations-section">
                <h4><i className="fas fa-lightbulb"></i> Recomendaciones</h4>
                <ul>
                  {data.recommendations.map((rec, i) => (
                    <li key={i}>{rec}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {/* Requirements Tab */}
        {activeTab === 'requirements' && (
          <div className="tab-content requirements-tab">
            {/* Agent Requirements */}
            <div className="requirements-section">
              <h4><i className="fas fa-clipboard-check"></i> Requerimientos del Agente</h4>
              {(data?.agent?.requirements || requirementsData?.agentRequirements || []).length > 0 ? (
                <div className="requirements-grid">
                  {(data?.agent?.requirements || requirementsData?.agentRequirements || []).map((req, i) => (
                    <div key={i} className="requirement-card">
                      <div
                        className="requirement-icon"
                        style={{ backgroundColor: getRequirementColor(req.type) }}
                      >
                        <i className={`fas ${getRequirementIcon(req.type)}`}></i>
                      </div>
                      <div className="requirement-info">
                        <span className="requirement-name">{req.name}</span>
                        <span className="requirement-type">{req.type}</span>
                        <p className="requirement-desc">{req.description}</p>
                        {req.required && (
                          <span className="required-badge">Requerido</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="no-data">No se han definido requerimientos específicos</p>
              )}
            </div>

            {/* Uploaded Files */}
            {requirementsData?.uploadedFiles?.length > 0 && (
              <div className="requirements-section">
                <h4><i className="fas fa-file-upload"></i> Archivos de Requerimientos</h4>
                <div className="uploaded-files-list">
                  {requirementsData.uploadedFiles.map((file, i) => (
                    <div key={i} className="uploaded-file">
                      <i className="fas fa-file"></i>
                      <div className="file-details">
                        <span className="file-name">{file.name}</span>
                        <span className="file-meta">
                          {(file.size / 1024).toFixed(1)} KB •
                          Guardado: {new Date(file.savedAt).toLocaleDateString('es-MX')}
                        </span>
                      </div>
                      <button
                        className="btn-icon small"
                        onClick={() => copyToClipboard(file.path)}
                        title="Copiar ruta"
                      >
                        <i className="fas fa-copy"></i>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Assumptions */}
            {data?.assumptions?.length > 0 && (
              <div className="requirements-section">
                <h4><i className="fas fa-question-circle"></i> Supuestos</h4>
                <ul className="assumptions-list">
                  {data.assumptions.map((assumption, i) => (
                    <li key={i}>{assumption}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {/* Structure Tab */}
        {activeTab === 'structure' && (
          <div className="tab-content structure-tab">
            {structureDoc ? (
              <div className="markdown-content">
                <div className="structure-header">
                  <span className="doc-path">
                    <i className="fas fa-file-alt"></i>
                    {formatPath(structureDoc.path)}
                  </span>
                  <button
                    className="btn-copy"
                    onClick={() => copyToClipboard(structureDoc.content)}
                    title="Copiar contenido"
                  >
                    <i className="fas fa-copy"></i> Copiar
                  </button>
                </div>
                <pre className="structure-content">{structureDoc.content}</pre>
              </div>
            ) : (
              <div className="no-data">
                <i className="fas fa-file-alt"></i>
                <p>Documento de estructura no disponible</p>
              </div>
            )}
          </div>
        )}

        {/* Paths Tab */}
        {activeTab === 'paths' && (
          <div className="tab-content paths-tab">
            <div className="paths-section">
              <h4><i className="fas fa-folder-tree"></i> Estructura de Carpetas</h4>
              {project?.structure ? (
                <div className="paths-tree">
                  {Object.entries(project.structure).map(([folder, fullPath]) => (
                    <div key={folder} className="path-item">
                      <div className="path-folder">
                        <i className="fas fa-folder"></i>
                        <span className="folder-name">{folder}</span>
                      </div>
                      <div className="path-full">
                        <code>{fullPath}</code>
                        <button
                          className="btn-copy small"
                          onClick={() => copyToClipboard(fullPath)}
                          title="Copiar ruta"
                        >
                          <i className="fas fa-copy"></i>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="no-data">No hay información de rutas disponible</p>
              )}
            </div>

            {/* Generated Files */}
            {project?.files?.length > 0 && (
              <div className="paths-section">
                <h4><i className="fas fa-file-code"></i> Archivos Generados</h4>
                <div className="files-list">
                  {project.files.map((file, i) => (
                    <div key={i} className="file-item">
                      <i className="fas fa-file"></i>
                      <code>{formatPath(file)}</code>
                      <button
                        className="btn-copy small"
                        onClick={() => copyToClipboard(file)}
                        title="Copiar ruta"
                      >
                        <i className="fas fa-copy"></i>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default AgentProjectViewer
