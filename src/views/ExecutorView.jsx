import { useState, useEffect, useRef } from 'react'
import { useSocket } from '../context/SocketContext'
import { useLanguage } from '../context/LanguageContext'
import { workflowService } from '../services/api'
import { resolveVariables } from '../components/workflow/VariableInput'

function ExecutorView() {
  const { t } = useLanguage()
  const [isExecuting, setIsExecuting] = useState(false)
  const [progress, setProgress] = useState(0)
  const [currentStep, setCurrentStep] = useState(null)
  const [currentStepName, setCurrentStepName] = useState('')
  const [totalSteps, setTotalSteps] = useState(0)
  const [executionLogs, setExecutionLogs] = useState([])
  const [workflows, setWorkflows] = useState([])
  const [selectedWorkflow, setSelectedWorkflow] = useState(null)
  const { socket, isConnected } = useSocket()

  // Estados para MessageBox modal
  const [showMessageBox, setShowMessageBox] = useState(false)
  const [messageBoxContent, setMessageBoxContent] = useState({ title: '', message: '', type: 'info' })
  const [messageBoxStartTime, setMessageBoxStartTime] = useState(null)
  const [messageBoxElapsed, setMessageBoxElapsed] = useState(0)
  const messageBoxResolveRef = useRef(null)

  // Cargar workflows al montar
  const loadWorkflows = async () => {
    // Cargar desde localStorage primero
    const localWorkflows = JSON.parse(localStorage.getItem('alqvimia-workflows') || '[]')
    setWorkflows(localWorkflows)

    // Intentar cargar desde API/Base de datos
    try {
      const response = await workflowService.getAll()
      if (response.success && response.data && response.data.length > 0) {
        const dbWorkflows = response.data.map(wf => ({
          id: wf.uuid || wf.id,
          name: wf.nombre,
          steps: wf.pasos || [],
          actions: wf.pasos || [],
          variables: wf.variables || [],
          source: 'database'
        }))

        // Marcar workflows locales
        const localMarked = localWorkflows.map(wf => ({ ...wf, source: 'local' }))

        // Combinar sin duplicados
        const dbNames = new Set(dbWorkflows.map(w => w.name))
        const uniqueLocal = localMarked.filter(w => !dbNames.has(w.name))

        setWorkflows([...dbWorkflows, ...uniqueLocal])
      }
    } catch (err) {
      console.log('[Executor] Base de datos no disponible, usando localStorage')
    }
  }

  useEffect(() => {
    loadWorkflows()

    // Escuchar cambios
    const handleStorageChange = (e) => {
      if (e.key === 'alqvimia-workflows') {
        loadWorkflows()
      }
    }
    const handleWorkflowSaved = () => loadWorkflows()

    window.addEventListener('storage', handleStorageChange)
    window.addEventListener('workflow-saved', handleWorkflowSaved)

    // Actualizar cada 5 segundos
    const interval = setInterval(loadWorkflows, 5000)

    return () => {
      window.removeEventListener('storage', handleStorageChange)
      window.removeEventListener('workflow-saved', handleWorkflowSaved)
      clearInterval(interval)
    }
  }, [])

  useEffect(() => {
    if (socket) {
      socket.on('execution-progress', (data) => {
        setProgress(data.progress)
        setCurrentStep(data.currentStep)
        setTotalSteps(data.totalSteps)
      })

      socket.on('execution-log', (log) => {
        setExecutionLogs(prev => [...prev, log])
      })

      socket.on('execution-complete', () => {
        setIsExecuting(false)
        setProgress(100)
        addLog('success', 'Workflow completado exitosamente')
      })

      socket.on('execution-error', (error) => {
        setIsExecuting(false)
        setExecutionLogs(prev => [...prev, { type: 'error', message: error.message, timestamp: new Date().toISOString() }])
      })

      return () => {
        socket.off('execution-progress')
        socket.off('execution-log')
        socket.off('execution-complete')
        socket.off('execution-error')
      }
    }
  }, [socket])

  const addLog = (type, message) => {
    setExecutionLogs(prev => [...prev, { type, message, timestamp: new Date().toISOString() }])
  }

  // Efecto para actualizar el tiempo del MessageBox
  useEffect(() => {
    let interval
    if (showMessageBox && messageBoxStartTime) {
      interval = setInterval(() => {
        setMessageBoxElapsed(Math.floor((Date.now() - messageBoxStartTime) / 1000))
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [showMessageBox, messageBoxStartTime])

  // Función para mostrar MessageBox
  const showWindowsMessageBox = (title, message, type = 'info') => {
    return new Promise((resolve) => {
      messageBoxResolveRef.current = resolve
      setMessageBoxContent({ title, message, type })
      setMessageBoxStartTime(Date.now())
      setMessageBoxElapsed(0)
      setShowMessageBox(true)
    })
  }

  // Función para cerrar MessageBox
  const closeMessageBox = () => {
    setShowMessageBox(false)
    setMessageBoxStartTime(null)
    setMessageBoxElapsed(0)
    if (messageBoxResolveRef.current) {
      messageBoxResolveRef.current()
      messageBoxResolveRef.current = null
    }
  }

  // Formatear tiempo transcurrido
  const formatElapsedTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  // Resolver variables en los parámetros de un paso
  const resolveStepParams = (params, variables = []) => {
    if (!params) return {}
    const resolved = {}
    for (const [key, value] of Object.entries(params)) {
      if (typeof value === 'string') {
        resolved[key] = resolveVariables(value, variables)
      } else if (typeof value === 'object' && value !== null) {
        resolved[key] = Array.isArray(value)
          ? value.map(v => typeof v === 'string' ? resolveVariables(v, variables) : v)
          : resolveStepParams(value, variables)
      } else {
        resolved[key] = value
      }
    }
    return resolved
  }

  const executeWorkflow = async () => {
    if (!selectedWorkflow) {
      alert('Selecciona un workflow primero')
      return
    }

    const steps = selectedWorkflow.steps || selectedWorkflow.actions || []
    if (steps.length === 0) {
      alert('El workflow no tiene pasos')
      return
    }

    // Minimizar ventana
    try {
      if (window.electronAPI?.minimizeWindow) {
        window.electronAPI.minimizeWindow()
      } else {
        window.blur()
      }
    } catch (e) {
      console.log('Ejecutando workflow')
    }

    // Esperar 1 segundo
    await new Promise(resolve => setTimeout(resolve, 1000))

    setIsExecuting(true)
    setProgress(0)
    setExecutionLogs([])
    setTotalSteps(steps.length)

    addLog('info', `Iniciando workflow: ${selectedWorkflow.name}`)

    // Variables del workflow
    const workflowVariables = selectedWorkflow.variables || []

    // Ejecutar cada paso
    for (let i = 0; i < steps.length; i++) {
      const step = steps[i]
      setCurrentStep(i + 1)
      setCurrentStepName(step.label || step.action)
      setProgress(Math.round(((i + 1) / steps.length) * 100))

      addLog('info', `Ejecutando: ${step.label || step.action}`)

      // Resolver variables en los parámetros
      const resolvedParams = resolveStepParams(step.params, workflowVariables)

      // Si es un message_box, mostrar el diálogo
      if (step.action === 'message_box' || step.action === 'pause') {
        const title = resolvedParams?.title || 'Mensaje'
        const message = resolvedParams?.message || resolveVariables(step.label, workflowVariables)
        const type = resolvedParams?.type || 'info'

        await showWindowsMessageBox(title, message, type)
      } else {
        // Simular ejecución del paso
        await new Promise(resolve => setTimeout(resolve, 800))
      }

      addLog('success', `Completado: ${step.label || step.action}`)
    }

    setIsExecuting(false)
    setProgress(100)

    // Mostrar mensaje de completado
    await showWindowsMessageBox('Workflow Completado', `El workflow "${selectedWorkflow.name}" se ha ejecutado correctamente.`, 'success')
  }

  const stopExecution = () => {
    setIsExecuting(false)
    addLog('warning', 'Ejecución detenida por el usuario')
    if (socket) {
      socket.emit('stop-execution')
    }
  }

  const getLogIcon = (type) => {
    switch (type) {
      case 'success': return 'fa-check-circle'
      case 'error': return 'fa-times-circle'
      case 'warning': return 'fa-exclamation-triangle'
      default: return 'fa-info-circle'
    }
  }

  const getLogColor = (type) => {
    switch (type) {
      case 'success': return '#10b981'
      case 'error': return '#ef4444'
      case 'warning': return '#f59e0b'
      default: return '#3b82f6'
    }
  }

  return (
    <div className="view" id="executor-view">
      <div className="view-header">
        <h2><i className="fas fa-play-circle"></i> Ejecutor de Workflows</h2>
        <p>Ejecuta y monitorea tus workflows de automatización</p>
      </div>

      <div className="executor-panel">
        {/* Selector de Workflow */}
        <div className="workflow-selector" style={{ marginBottom: '1.5rem' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold', color: 'var(--text-primary)' }}>
            <i className="fas fa-list"></i> Seleccionar Workflow:
          </label>
          <select
            value={selectedWorkflow?.id || ''}
            onChange={(e) => {
              const wf = workflows.find(w => w.id === e.target.value)
              setSelectedWorkflow(wf || null)
            }}
            style={{
              width: '100%',
              padding: '0.75rem',
              fontSize: '1rem',
              borderRadius: '8px',
              border: '1px solid var(--border-color)',
              background: 'var(--bg-secondary)',
              color: 'var(--text-primary)'
            }}
          >
            <option value="">-- Selecciona un workflow --</option>
            {workflows.map(wf => (
              <option key={wf.id} value={wf.id}>
                {wf.source === 'database' ? '🗄️ ' : '💾 '}{wf.name} ({(wf.steps || wf.actions || []).length} pasos)
              </option>
            ))}
          </select>
          {workflows.length === 0 && (
            <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem', fontSize: '0.9rem' }}>
              <i className="fas fa-info-circle"></i> No hay workflows guardados. Crea uno en el Studio.
            </p>
          )}
        </div>

        <div className="execution-controls">
          <button
            className="btn btn-success btn-lg"
            id="executeWorkflow"
            onClick={executeWorkflow}
            disabled={isExecuting || !selectedWorkflow}
          >
            <i className="fas fa-play"></i> Ejecutar Workflow
          </button>
          <button
            className="btn btn-danger btn-lg"
            id="stopExecution"
            onClick={stopExecution}
            disabled={!isExecuting}
          >
            <i className="fas fa-stop"></i> Detener Ejecución
          </button>
        </div>

        <div className="execution-monitor">
          <h3>Monitor de Ejecución</h3>
          <div className="monitor-display" id="executionMonitor">
            {!isExecuting && progress === 0 ? (
              <div className="monitor-idle">
                <i className="fas fa-robot"></i>
                <p>Esperando ejecución...</p>
              </div>
            ) : (
              <div className="monitor-active">
                <div className="execution-status">
                  {isExecuting ? (
                    <>
                      <i className="fas fa-spinner fa-spin"></i>
                      <span>Ejecutando paso {currentStep} de {totalSteps}</span>
                      {currentStepName && (
                        <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
                          <i className="fas fa-cog fa-spin"></i> {currentStepName}
                        </div>
                      )}
                    </>
                  ) : (
                    <>
                      <i className="fas fa-check-circle" style={{ color: '#10b981' }}></i>
                      <span>Ejecución completada</span>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>

          <div
            className="progress-section"
            id="progressSection"
            style={{ display: isExecuting || progress > 0 ? 'block' : 'none' }}
          >
            <div className="progress-bar">
              <div
                className="progress-fill"
                id="progressFill"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
            <span className="progress-text">{progress}%</span>
          </div>
        </div>

        <div className="execution-log">
          <h3>Log de Ejecución</h3>
          <div className="log-list" id="executionLog">
            {executionLogs.length === 0 ? (
              <div className="log-empty">
                <i className="fas fa-list"></i>
                <p>Los logs aparecerán aquí durante la ejecución</p>
              </div>
            ) : (
              executionLogs.map((log, index) => (
                <div key={index} className={`log-entry ${log.type}`}>
                  <i className={`fas ${getLogIcon(log.type)}`} style={{ color: getLogColor(log.type) }}></i>
                  <span className="log-time">
                    {new Date(log.timestamp).toLocaleTimeString()}
                  </span>
                  <span className="log-message">{log.message}</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* MessageBox Modal */}
      {showMessageBox && (
        <div className="win-messagebox-overlay" onClick={closeMessageBox}>
          <div className="win-messagebox" onClick={e => e.stopPropagation()}>
            {/* Barra de título */}
            <div className="win-titlebar">
              <span className="win-title-text">{messageBoxContent.title || 'Alqvimia'}</span>
              <div className="win-titlebar-buttons">
                <button className="win-btn-close" onClick={closeMessageBox}>
                  <i className="fas fa-times"></i>
                </button>
              </div>
            </div>

            {/* Contenido */}
            <div className="win-content">
              <div className={`win-icon ${messageBoxContent.type}`}>
                <i className={`fas ${
                  messageBoxContent.type === 'error' ? 'fa-times-circle' :
                  messageBoxContent.type === 'warning' ? 'fa-exclamation-triangle' :
                  messageBoxContent.type === 'success' ? 'fa-check-circle' :
                  messageBoxContent.type === 'question' ? 'fa-question-circle' :
                  'fa-info-circle'
                }`} style={{
                  fontSize: '28px',
                  color: messageBoxContent.type === 'error' ? '#ef4444' :
                         messageBoxContent.type === 'warning' ? '#f59e0b' :
                         messageBoxContent.type === 'success' ? '#10b981' :
                         messageBoxContent.type === 'question' ? '#8b5cf6' :
                         '#3b82f6'
                }}></i>
              </div>
              <div className="win-message">
                <p>{messageBoxContent.message || 'Mensaje del sistema'}</p>
                <div className="win-timer">
                  <span className="win-timer-label">Tiempo:</span>
                  <span className="win-timer-value">{formatElapsedTime(messageBoxElapsed)}</span>
                </div>
              </div>
            </div>

            {/* Botones */}
            <div className="win-buttons">
              <button className="win-btn" onClick={closeMessageBox}>
                Aceptar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ExecutorView
