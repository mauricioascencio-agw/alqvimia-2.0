/**
 * ALQVIMIA RPA 2.0 - Requirement Uploader Component
 * Permite adjuntar documentos de requerimientos y generar agentes/workflows con IA
 */

import { useState, useRef, useCallback } from 'react'
import { useSocket } from '../context/SocketContext'

// Tipos de archivo soportados
const SUPPORTED_FORMATS = {
  documents: ['.pdf', '.doc', '.docx', '.txt', '.rtf', '.odt'],
  spreadsheets: ['.xlsx', '.xls', '.csv'],
  images: ['.png', '.jpg', '.jpeg', '.gif', '.webp'],
  other: ['.json', '.xml', '.md']
}

const ALL_FORMATS = Object.values(SUPPORTED_FORMATS).flat()

function RequirementUploader({ onAgentGenerated, onWorkflowGenerated, onProjectGenerated, mode = 'both' }) {
  const { socket, isConnected } = useSocket()
  const fileInputRef = useRef(null)

  // Estados
  const [files, setFiles] = useState([])
  const [additionalContext, setAdditionalContext] = useState('')
  const [agentType, setAgentType] = useState('custom')
  const [isProcessing, setIsProcessing] = useState(false)
  const [processingStatus, setProcessingStatus] = useState('')
  const [generatedResult, setGeneratedResult] = useState(null)
  const [projectInfo, setProjectInfo] = useState(null)
  const [error, setError] = useState(null)
  const [dragActive, setDragActive] = useState(false)

  // Configuración de generación
  const [config, setConfig] = useState({
    generateWorkflow: true,
    generateAgent: true,
    aiProvider: 'claude',
    aiModel: 'claude-3-sonnet',
    includeTests: false,
    includeDocumentation: true,
    targetCategory: 'custom'
  })

  // Manejar drag & drop
  const handleDrag = useCallback((e) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }, [])

  const handleDrop = useCallback((e) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    const droppedFiles = Array.from(e.dataTransfer.files)
    handleFiles(droppedFiles)
  }, [])

  // Procesar archivos seleccionados
  const handleFiles = (newFiles) => {
    const validFiles = newFiles.filter(file => {
      const ext = '.' + file.name.split('.').pop().toLowerCase()
      return ALL_FORMATS.includes(ext)
    })

    if (validFiles.length !== newFiles.length) {
      setError(`Algunos archivos no son soportados. Formatos válidos: ${ALL_FORMATS.join(', ')}`)
    }

    // Leer contenido de archivos de texto
    validFiles.forEach(file => {
      const ext = '.' + file.name.split('.').pop().toLowerCase()

      if (['.txt', '.md', '.json', '.xml', '.csv'].includes(ext)) {
        const reader = new FileReader()
        reader.onload = (e) => {
          file.textContent = e.target.result
        }
        reader.readAsText(file)
      }
    })

    setFiles(prev => [...prev, ...validFiles])
    setError(null)
  }

  // Eliminar archivo
  const removeFile = (index) => {
    setFiles(prev => prev.filter((_, i) => i !== index))
  }

  // Obtener icono según tipo de archivo
  const getFileIcon = (filename) => {
    const ext = '.' + filename.split('.').pop().toLowerCase()
    if (SUPPORTED_FORMATS.documents.includes(ext)) return 'fa-file-alt'
    if (SUPPORTED_FORMATS.spreadsheets.includes(ext)) return 'fa-file-excel'
    if (SUPPORTED_FORMATS.images.includes(ext)) return 'fa-file-image'
    return 'fa-file'
  }

  // Formatear tamaño de archivo
  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B'
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
  }

  // Procesar requerimientos y generar agente
  const processRequirements = async () => {
    if (files.length === 0) {
      setError('Por favor adjunta al menos un documento de requerimientos')
      return
    }

    setIsProcessing(true)
    setProcessingStatus('Preparando documentos...')
    setError(null)
    setGeneratedResult(null)

    try {
      // Preparar datos para enviar
      const formData = new FormData()

      files.forEach((file, index) => {
        formData.append(`file_${index}`, file)
      })

      formData.append('additionalContext', additionalContext)
      formData.append('agentType', agentType)
      formData.append('config', JSON.stringify(config))

      setProcessingStatus('Analizando documentos con IA...')

      // Enviar al servidor
      const response = await fetch('http://localhost:4000/api/ai/generate-from-requirements', {
        method: 'POST',
        body: formData
      })

      if (!response.ok) {
        throw new Error(`Error del servidor: ${response.status}`)
      }

      const result = await response.json()

      if (!result.success) {
        throw new Error(result.error || 'Error al procesar los requerimientos')
      }

      setProcessingStatus('Generando estructura del agente...')
      await new Promise(resolve => setTimeout(resolve, 500))

      setGeneratedResult(result.data)
      setProjectInfo(result.project)
      setProcessingStatus('¡Completado!')

      // Callbacks
      if (result.data.workflow && onWorkflowGenerated) {
        onWorkflowGenerated(result.data.workflow)
      }
      if (result.data.agent && onAgentGenerated) {
        onAgentGenerated(result.data.agent)
      }
      if (result.project && onProjectGenerated) {
        onProjectGenerated({ project: result.project, data: result.data })
      }

      // Notificar vía socket
      if (socket && isConnected) {
        socket.emit('ai:requirement-processed', {
          filesCount: files.length,
          generatedWorkflow: !!result.data.workflow,
          generatedAgent: !!result.data.agent,
          projectPath: result.project?.path
        })
      }

    } catch (err) {
      console.error('Error procesando requerimientos:', err)
      setError(err.message)
      setProcessingStatus('')
    } finally {
      setIsProcessing(false)
    }
  }

  // Limpiar todo
  const clearAll = () => {
    setFiles([])
    setAdditionalContext('')
    setGeneratedResult(null)
    setProjectInfo(null)
    setError(null)
    setProcessingStatus('')
  }

  // Abrir carpeta del proyecto
  const openProjectFolder = async (folderPath) => {
    try {
      // Intentar abrir con el explorador de archivos
      if (window.electronAPI?.openPath) {
        await window.electronAPI.openPath(folderPath)
      } else {
        // Copiar ruta al portapapeles como alternativa
        navigator.clipboard.writeText(folderPath)
        alert(`Ruta copiada al portapapeles:\n${folderPath}`)
      }
    } catch (err) {
      console.error('Error abriendo carpeta:', err)
      navigator.clipboard.writeText(folderPath)
      alert(`Ruta copiada al portapapeles:\n${folderPath}`)
    }
  }

  return (
    <div className="requirement-uploader">
      {/* Zona de carga de archivos */}
      <div
        className={`upload-zone ${dragActive ? 'drag-active' : ''} ${files.length > 0 ? 'has-files' : ''}`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => !isProcessing && fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept={ALL_FORMATS.join(',')}
          onChange={(e) => handleFiles(Array.from(e.target.files))}
          style={{ display: 'none' }}
          disabled={isProcessing}
        />

        {files.length === 0 ? (
          <div className="upload-placeholder">
            <i className="fas fa-cloud-upload-alt"></i>
            <h3>Arrastra tus documentos de requerimientos aquí</h3>
            <p>o haz clic para seleccionar archivos</p>
            <div className="supported-formats">
              <span><i className="fas fa-file-pdf"></i> PDF</span>
              <span><i className="fas fa-file-word"></i> Word</span>
              <span><i className="fas fa-file-excel"></i> Excel</span>
              <span><i className="fas fa-file-alt"></i> TXT</span>
              <span><i className="fas fa-file-image"></i> Imágenes</span>
            </div>
          </div>
        ) : (
          <div className="files-list">
            <div className="files-header">
              <span><i className="fas fa-paperclip"></i> {files.length} archivo(s) adjunto(s)</span>
              <button
                className="btn-clear-files"
                onClick={(e) => { e.stopPropagation(); clearAll() }}
                disabled={isProcessing}
              >
                <i className="fas fa-times"></i> Limpiar
              </button>
            </div>
            <div className="files-grid">
              {files.map((file, index) => (
                <div key={index} className="file-item">
                  <i className={`fas ${getFileIcon(file.name)}`}></i>
                  <div className="file-info">
                    <span className="file-name">{file.name}</span>
                    <span className="file-size">{formatFileSize(file.size)}</span>
                  </div>
                  <button
                    className="btn-remove-file"
                    onClick={(e) => { e.stopPropagation(); removeFile(index) }}
                    disabled={isProcessing}
                  >
                    <i className="fas fa-times"></i>
                  </button>
                </div>
              ))}
            </div>
            <div className="add-more" onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click() }}>
              <i className="fas fa-plus"></i> Agregar más archivos
            </div>
          </div>
        )}
      </div>

      {/* Contexto adicional */}
      <div className="additional-context">
        <label>
          <i className="fas fa-comment-dots"></i> Contexto adicional (opcional)
        </label>
        <textarea
          value={additionalContext}
          onChange={(e) => setAdditionalContext(e.target.value)}
          placeholder="Describe cualquier detalle adicional sobre los requerimientos, restricciones, integraciones necesarias, etc."
          rows={4}
          disabled={isProcessing}
        />
      </div>

      {/* Configuración de generación */}
      <div className="generation-config">
        <h4><i className="fas fa-cogs"></i> Configuración de Generación</h4>

        <div className="config-grid">
          <div className="config-item">
            <label>Tipo de Agente</label>
            <select
              value={agentType}
              onChange={(e) => setAgentType(e.target.value)}
              disabled={isProcessing}
            >
              <option value="custom">Personalizado</option>
              <option value="sat">SAT / Fiscal</option>
              <option value="retail">Retail / E-commerce</option>
              <option value="rh">Recursos Humanos</option>
              <option value="finanzas">Finanzas</option>
              <option value="operaciones">Operaciones</option>
            </select>
          </div>

          <div className="config-item">
            <label>Proveedor de IA</label>
            <select
              value={config.aiProvider}
              onChange={(e) => setConfig({ ...config, aiProvider: e.target.value })}
              disabled={isProcessing}
            >
              <option value="claude">Claude (Anthropic)</option>
              <option value="openai">OpenAI (GPT-4)</option>
              <option value="gemini">Google Gemini</option>
            </select>
          </div>

          <div className="config-item checkbox">
            <label>
              <input
                type="checkbox"
                checked={config.generateWorkflow}
                onChange={(e) => setConfig({ ...config, generateWorkflow: e.target.checked })}
                disabled={isProcessing || mode === 'agent'}
              />
              Generar Workflow
            </label>
          </div>

          <div className="config-item checkbox">
            <label>
              <input
                type="checkbox"
                checked={config.generateAgent}
                onChange={(e) => setConfig({ ...config, generateAgent: e.target.checked })}
                disabled={isProcessing || mode === 'workflow'}
              />
              Generar Agente
            </label>
          </div>

          <div className="config-item checkbox">
            <label>
              <input
                type="checkbox"
                checked={config.includeDocumentation}
                onChange={(e) => setConfig({ ...config, includeDocumentation: e.target.checked })}
                disabled={isProcessing}
              />
              Incluir Documentación
            </label>
          </div>

          <div className="config-item checkbox">
            <label>
              <input
                type="checkbox"
                checked={config.includeTests}
                onChange={(e) => setConfig({ ...config, includeTests: e.target.checked })}
                disabled={isProcessing}
              />
              Incluir Pruebas
            </label>
          </div>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="error-message">
          <i className="fas fa-exclamation-circle"></i>
          {error}
        </div>
      )}

      {/* Estado de procesamiento */}
      {isProcessing && (
        <div className="processing-status">
          <div className="processing-spinner">
            <i className="fas fa-spinner fa-spin"></i>
          </div>
          <span>{processingStatus}</span>
          <div className="processing-bar">
            <div className="processing-bar-fill"></div>
          </div>
        </div>
      )}

      {/* Resultado generado */}
      {generatedResult && (
        <div className="generated-result">
          <div className="result-header">
            <i className="fas fa-check-circle"></i>
            <h4>Agente Generado Exitosamente</h4>
          </div>

          <div className="result-content">
            {generatedResult.agent && (
              <div className="result-section">
                <h5><i className="fas fa-robot"></i> Agente</h5>
                <div className="result-details">
                  <p><strong>Nombre:</strong> {generatedResult.agent.name}</p>
                  <p><strong>Descripción:</strong> {generatedResult.agent.description}</p>
                  <p><strong>Complejidad:</strong>
                    <span className={`complexity-badge ${generatedResult.agent.complexity || 'medium'}`}>
                      {generatedResult.agent.complexity || 'medium'}
                    </span>
                  </p>
                  <p><strong>Capacidades:</strong></p>
                  <ul>
                    {generatedResult.agent.capabilities?.map((cap, i) => (
                      <li key={i}>{cap}</li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            {/* Requerimientos del Agente */}
            {generatedResult.agent?.requirements?.length > 0 && (
              <div className="result-section requirements-section">
                <h5><i className="fas fa-clipboard-list"></i> Requerimientos para Operar</h5>
                <div className="requirements-list">
                  {generatedResult.agent.requirements.map((req, i) => (
                    <div key={i} className={`requirement-item ${req.type}`}>
                      <i className={`fas ${
                        req.type === 'credential' ? 'fa-key' :
                        req.type === 'integration' ? 'fa-plug' :
                        req.type === 'data' ? 'fa-database' : 'fa-cube'
                      }`}></i>
                      <div className="requirement-content">
                        <span className="req-name">{req.name}</span>
                        <span className="req-type">{req.type}</span>
                        <p className="req-desc">{req.description}</p>
                        {req.required && <span className="req-badge">Requerido</span>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {generatedResult.workflow && (
              <div className="result-section">
                <h5><i className="fas fa-project-diagram"></i> Workflow</h5>
                <div className="result-details">
                  <p><strong>Nombre:</strong> {generatedResult.workflow.name}</p>
                  <p><strong>Pasos:</strong> {generatedResult.workflow.steps?.length || 0}</p>
                  <p><strong>Variables:</strong> {Object.keys(generatedResult.workflow.variables || {}).length}</p>
                </div>
              </div>
            )}

            {/* Información del Proyecto */}
            {projectInfo && (
              <div className="result-section project-section">
                <h5><i className="fas fa-folder-open"></i> Proyecto Guardado</h5>
                <div className="project-path-info">
                  <code>{projectInfo.path}</code>
                  <button
                    className="btn-copy-path"
                    onClick={() => navigator.clipboard.writeText(projectInfo.path)}
                    title="Copiar ruta"
                  >
                    <i className="fas fa-copy"></i>
                  </button>
                  <button
                    className="btn-open-folder"
                    onClick={() => openProjectFolder(projectInfo.path)}
                    title="Abrir carpeta"
                  >
                    <i className="fas fa-external-link-alt"></i>
                  </button>
                </div>
                <div className="project-structure-summary">
                  <span><i className="fas fa-folder"></i> {Object.keys(projectInfo.structure || {}).length} carpetas</span>
                  <span><i className="fas fa-file"></i> {projectInfo.files?.length || 0} archivos generados</span>
                </div>
              </div>
            )}

            {generatedResult.documentation && (
              <div className="result-section">
                <h5><i className="fas fa-book"></i> Documentación</h5>
                <pre className="documentation-preview">
                  {generatedResult.documentation.substring(0, 500)}...
                </pre>
              </div>
            )}
          </div>

          <div className="result-actions">
            <button className="btn-secondary" onClick={clearAll}>
              <i className="fas fa-redo"></i> Generar Otro
            </button>
            {projectInfo && (
              <button
                className="btn-secondary"
                onClick={() => onProjectGenerated?.({ project: projectInfo, data: generatedResult })}
              >
                <i className="fas fa-info-circle"></i> Ver Detalles
              </button>
            )}
            <button className="btn-primary" onClick={() => {
              // Navegar al editor del agente/workflow generado
              if (generatedResult.workflow) {
                window.location.hash = '#/workflows'
              } else if (generatedResult.agent) {
                window.location.hash = '#/agents'
              }
            }}>
              <i className="fas fa-edit"></i> Editar en Studio
            </button>
          </div>
        </div>
      )}

      {/* Botón de acción */}
      {!generatedResult && (
        <div className="action-buttons">
          <button
            className="btn-generate"
            onClick={processRequirements}
            disabled={isProcessing || files.length === 0}
          >
            {isProcessing ? (
              <>
                <i className="fas fa-spinner fa-spin"></i>
                Procesando...
              </>
            ) : (
              <>
                <i className="fas fa-magic"></i>
                Generar Agente desde Requerimientos
              </>
            )}
          </button>
        </div>
      )}
    </div>
  )
}

export default RequirementUploader
