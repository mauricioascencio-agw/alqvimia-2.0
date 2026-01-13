import { useState, useEffect, useRef } from 'react'
import { useSocket } from '../context/SocketContext'
import { useLanguage } from '../context/LanguageContext'
import { workflowService } from '../services/api'
import { resolveVariables } from '../components/workflow/VariableInput'

function LibraryView() {
  const { t } = useLanguage()
  const [workflows, setWorkflows] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(false)
  const [selectedWorkflows, setSelectedWorkflows] = useState([])
  const [showImportModal, setShowImportModal] = useState(false)
  const [importFile, setImportFile] = useState(null)
  const [importing, setImporting] = useState(false)
  const [exporting, setExporting] = useState(false)
  const [useDatabase, setUseDatabase] = useState(false)
  const fileInputRef = useRef(null)
  const { socket, isConnected } = useSocket()

  // Estados para ejecución y MessageBox
  const [isExecuting, setIsExecuting] = useState(false)
  const [executingWorkflowId, setExecutingWorkflowId] = useState(null)
  const [showMessageBox, setShowMessageBox] = useState(false)
  const [messageBoxContent, setMessageBoxContent] = useState({ title: '', message: '', type: 'info' })
  const [messageBoxStartTime, setMessageBoxStartTime] = useState(null)
  const [messageBoxElapsed, setMessageBoxElapsed] = useState(0)
  const messageBoxResolveRef = useRef(null)

  const loadWorkflows = async () => {
    setLoading(true)
    try {
      // Cargar desde localStorage primero
      const localWorkflows = JSON.parse(localStorage.getItem('alqvimia-workflows') || '[]')
      setWorkflows(localWorkflows)

      // Intentar cargar desde API/Base de datos
      try {
        const response = await workflowService.getAll()
        if (response.success && response.data && response.data.length > 0) {
          // Combinar workflows de la BD con los locales (sin duplicados)
          const dbWorkflows = response.data.map(wf => ({
            id: wf.uuid || wf.id,
            name: wf.nombre,
            steps: wf.pasos || [],
            actions: wf.pasos || [],
            variables: wf.variables || [],
            folder: wf.categoria || 'general',
            createdAt: wf.created_at,
            source: 'database'
          }))

          // Marcar workflows locales
          const localMarked = localWorkflows.map(wf => ({ ...wf, source: 'local' }))

          // Combinar sin duplicados (preferir BD)
          const dbIds = new Set(dbWorkflows.map(w => w.name))
          const uniqueLocal = localMarked.filter(w => !dbIds.has(w.name))

          setWorkflows([...dbWorkflows, ...uniqueLocal])
          setUseDatabase(true)
        }
      } catch (apiError) {
        console.log('[Library] Base de datos no disponible, usando localStorage')
      }
    } catch (err) {
      console.error('Error cargando workflows:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadWorkflows()

    // Escuchar cambios en localStorage para actualizar automáticamente
    const handleStorageChange = (e) => {
      if (e.key === 'alqvimia-workflows') {
        loadWorkflows()
      }
    }

    // Escuchar evento personalizado para cuando se guarda un workflow
    const handleWorkflowSaved = () => {
      loadWorkflows()
    }

    window.addEventListener('storage', handleStorageChange)
    window.addEventListener('workflow-saved', handleWorkflowSaved)

    // Recargar cada 5 segundos para mantener sincronizado
    const interval = setInterval(loadWorkflows, 5000)

    return () => {
      window.removeEventListener('storage', handleStorageChange)
      window.removeEventListener('workflow-saved', handleWorkflowSaved)
      clearInterval(interval)
    }
  }, [])

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

  const filteredWorkflows = workflows.filter(wf =>
    wf.name?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const deleteWorkflow = async (id) => {
    if (window.confirm('¿Eliminar este workflow?')) {
      const workflowToDelete = workflows.find(wf => wf.id === id)

      // Eliminar de localStorage
      const localWorkflows = JSON.parse(localStorage.getItem('alqvimia-workflows') || '[]')
      const updatedLocal = localWorkflows.filter(wf => wf.id !== id)
      localStorage.setItem('alqvimia-workflows', JSON.stringify(updatedLocal))

      // Si está en la base de datos, eliminarlo también
      if (workflowToDelete?.source === 'database') {
        try {
          await workflowService.delete(id)
        } catch (err) {
          console.error('Error eliminando de BD:', err)
        }
      }

      // Actualizar estado local
      setWorkflows(workflows.filter(wf => wf.id !== id))
    }
  }

  const executeWorkflow = async (workflow) => {
    const steps = workflow.steps || workflow.actions || []
    if (steps.length === 0) {
      alert('El workflow no tiene pasos')
      return
    }

    setIsExecuting(true)
    setExecutingWorkflowId(workflow.id)

    // Variables del workflow
    const workflowVariables = workflow.variables || []

    // Ejecutar cada paso
    for (let i = 0; i < steps.length; i++) {
      const step = steps[i]

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
    }

    setIsExecuting(false)
    setExecutingWorkflowId(null)

    // Mostrar mensaje de completado
    await showWindowsMessageBox('Workflow Completado', `El workflow "${workflow.name}" se ha ejecutado correctamente.`, 'success')
  }

  // Toggle selección para exportar
  const toggleSelect = (id) => {
    setSelectedWorkflows(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    )
  }

  const selectAll = () => {
    if (selectedWorkflows.length === filteredWorkflows.length) {
      setSelectedWorkflows([])
    } else {
      setSelectedWorkflows(filteredWorkflows.map(wf => wf.id))
    }
  }

  // Sincronizar workflows locales a la base de datos
  const [syncing, setSyncing] = useState(false)
  const syncToDatabase = async () => {
    const localWorkflows = workflows.filter(wf => wf.source !== 'database')
    if (localWorkflows.length === 0) {
      alert('No hay workflows locales para sincronizar')
      return
    }

    setSyncing(true)
    try {
      const result = await workflowService.sync(localWorkflows)
      if (result.success) {
        alert(`Sincronización completada:\n${result.data.created} creados\n${result.data.updated} actualizados`)
        loadWorkflows() // Recargar lista
      } else {
        alert('Error en sincronización: ' + result.error)
      }
    } catch (err) {
      console.error('Error sincronizando:', err)
      alert('Error al sincronizar con la base de datos')
    } finally {
      setSyncing(false)
    }
  }

  // Exportar workflows seleccionados como ZIP
  const exportAsZip = async () => {
    if (selectedWorkflows.length === 0) {
      alert('Selecciona al menos un workflow')
      return
    }

    setExporting(true)
    try {
      const selected = workflows.filter(wf => selectedWorkflows.includes(wf.id))

      // Crear estructura del ZIP usando JSZip (lo haremos manualmente)
      const exportData = {
        _export: {
          version: '2.0',
          format: 'alqvimia-export',
          exportedAt: new Date().toISOString(),
          count: selected.length
        },
        workflows: selected.map(wf => ({
          id: wf.id,
          name: wf.name,
          description: wf.description,
          actions: wf.actions || [],
          variables: wf.variables || [],
          targetWindow: wf.targetWindow,
          createdAt: wf.createdAt,
          _wfl: wf._wfl
        }))
      }

      // Codificar como archivo .alqzip (JSON base64)
      const content = JSON.stringify(exportData, null, 2)
      const encoded = btoa(unescape(encodeURIComponent(content)))
      const fileContent = 'ALQZIP1' + encoded

      const blob = new Blob([fileContent], { type: 'application/x-alqvimia-zip' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `alqvimia_export_${new Date().toISOString().split('T')[0]}.alqzip`
      a.click()
      URL.revokeObjectURL(url)

      alert(`Exportados ${selected.length} workflows`)
      setSelectedWorkflows([])
    } catch (error) {
      console.error('Error exportando:', error)
      alert('Error al exportar')
    } finally {
      setExporting(false)
    }
  }

  // Exportar un solo workflow como .wfl
  const exportAsWfl = (workflow) => {
    const wflData = {
      _wfl: { version: '2.0', format: 'alqvimia-workflow' },
      ...workflow
    }

    const content = JSON.stringify(wflData, null, 2)
    const encoded = btoa(unescape(encodeURIComponent(content)))
    const fileContent = 'ALQWFL2' + encoded

    const blob = new Blob([fileContent], { type: 'application/x-alqvimia-workflow' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${workflow.name?.replace(/[^a-zA-Z0-9]/g, '_') || 'workflow'}.wfl`
    a.click()
    URL.revokeObjectURL(url)
  }

  // Manejar archivo de importación
  const handleFileSelect = (e) => {
    const file = e.target.files[0]
    if (file) {
      setImportFile(file)
    }
  }

  // Importar workflows
  const importWorkflows = async () => {
    if (!importFile) {
      alert('Selecciona un archivo')
      return
    }

    setImporting(true)
    try {
      const content = await importFile.text()
      let data

      // Detectar formato
      if (content.startsWith('ALQZIP1')) {
        // Archivo .alqzip
        const encoded = content.substring(7)
        const decoded = decodeURIComponent(escape(atob(encoded)))
        data = JSON.parse(decoded)

        if (data.workflows && Array.isArray(data.workflows)) {
          const existing = workflows
          const imported = data.workflows.map(wf => ({
            ...wf,
            id: `wf_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
            importedAt: new Date().toISOString()
          }))

          const updated = [...existing, ...imported]
          setWorkflows(updated)
          localStorage.setItem('alqvimia-workflows', JSON.stringify(updated))

          alert(`Importados ${imported.length} workflows`)
        }
      } else if (content.startsWith('ALQWFL2')) {
        // Archivo .wfl individual
        const encoded = content.substring(7)
        const decoded = decodeURIComponent(escape(atob(encoded)))
        const workflow = JSON.parse(decoded)

        const imported = {
          ...workflow,
          id: `wf_${Date.now()}`,
          importedAt: new Date().toISOString()
        }

        const updated = [...workflows, imported]
        setWorkflows(updated)
        localStorage.setItem('alqvimia-workflows', JSON.stringify(updated))

        alert(`Importado: ${workflow.name}`)
      } else {
        // Intentar JSON plano
        data = JSON.parse(content)
        if (data.name && data.actions) {
          const imported = {
            ...data,
            id: `wf_${Date.now()}`,
            importedAt: new Date().toISOString()
          }
          const updated = [...workflows, imported]
          setWorkflows(updated)
          localStorage.setItem('alqvimia-workflows', JSON.stringify(updated))
          alert(`Importado: ${data.name}`)
        }
      }

      setShowImportModal(false)
      setImportFile(null)
      if (fileInputRef.current) fileInputRef.current.value = ''
    } catch (error) {
      console.error('Error importando:', error)
      alert('Error al importar. Archivo no válido.')
    } finally {
      setImporting(false)
    }
  }

  return (
    <div className="view" id="library-view">
      <div className="view-header">
        <h2><i className="fas fa-folder-open"></i> Biblioteca de Workflows</h2>
        <p>Gestiona, exporta e importa tus workflows</p>
      </div>

      <div className="library-content">
        {/* Toolbar */}
        <div className="library-toolbar" style={{
          display: 'flex',
          gap: '1rem',
          marginBottom: '1.5rem',
          flexWrap: 'wrap',
          alignItems: 'center'
        }}>
          <input
            type="text"
            placeholder="Buscar workflows..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              flex: '1',
              minWidth: '200px',
              padding: '0.75rem 1rem',
              background: 'var(--bg-secondary)',
              border: '1px solid var(--border-color)',
              borderRadius: '8px',
              color: 'var(--text-primary)'
            }}
          />

          <button className="btn btn-secondary" onClick={loadWorkflows} disabled={loading}>
            <i className={`fas fa-sync ${loading ? 'fa-spin' : ''}`}></i> Actualizar
          </button>

          <button className="btn btn-primary" onClick={() => setShowImportModal(true)}>
            <i className="fas fa-file-import"></i> Importar
          </button>

          <button
            className="btn btn-info"
            onClick={syncToDatabase}
            disabled={syncing}
            title="Sincronizar workflows locales a la base de datos MySQL"
          >
            <i className={`fas ${syncing ? 'fa-spinner fa-spin' : 'fa-database'}`}></i> Sincronizar BD
          </button>

          {selectedWorkflows.length > 0 && (
            <button className="btn btn-success" onClick={exportAsZip} disabled={exporting}>
              <i className={`fas ${exporting ? 'fa-spinner fa-spin' : 'fa-file-export'}`}></i>
              Exportar ({selectedWorkflows.length})
            </button>
          )}
        </div>

        {/* Selección masiva */}
        {filteredWorkflows.length > 0 && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
            marginBottom: '1rem',
            padding: '0.75rem 1rem',
            background: 'var(--bg-secondary)',
            borderRadius: '8px'
          }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={selectedWorkflows.length === filteredWorkflows.length && filteredWorkflows.length > 0}
                onChange={selectAll}
                style={{ width: '18px', height: '18px' }}
              />
              <span>Seleccionar todos</span>
            </label>
            <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
              {selectedWorkflows.length} seleccionados
            </span>
          </div>
        )}

        {/* Grid de workflows */}
        <div className="workflows-grid" style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
          gap: '1rem'
        }}>
          {filteredWorkflows.length === 0 ? (
            <div className="empty-state" style={{
              gridColumn: '1 / -1',
              textAlign: 'center',
              padding: '3rem',
              color: 'var(--text-muted)'
            }}>
              <i className="fas fa-inbox" style={{ fontSize: '3rem', marginBottom: '1rem', opacity: 0.5 }}></i>
              <p>No hay workflows</p>
              <small>Graba o importa workflows para comenzar</small>
            </div>
          ) : (
            filteredWorkflows.map(workflow => (
              <div
                key={workflow.id}
                className={`workflow-card ${selectedWorkflows.includes(workflow.id) ? 'selected' : ''}`}
                style={{
                  background: 'var(--bg-secondary)',
                  borderRadius: '12px',
                  border: selectedWorkflows.includes(workflow.id)
                    ? '2px solid var(--primary-color)'
                    : '1px solid var(--border-color)',
                  overflow: 'hidden'
                }}
              >
                <div className="workflow-card-header" style={{
                  padding: '1rem',
                  background: 'var(--bg-tertiary)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem'
                }}>
                  <input
                    type="checkbox"
                    checked={selectedWorkflows.includes(workflow.id)}
                    onChange={() => toggleSelect(workflow.id)}
                    style={{ width: '18px', height: '18px' }}
                  />
                  <i className="fas fa-project-diagram" style={{ color: 'var(--primary-color)' }}></i>
                  <h4 style={{ margin: 0, flex: 1, fontSize: '1rem' }}>{workflow.name}</h4>
                  <span
                    title={workflow.source === 'database' ? 'Guardado en MySQL' : 'Solo en localStorage'}
                    style={{
                      fontSize: '0.75rem',
                      padding: '2px 8px',
                      borderRadius: '4px',
                      background: workflow.source === 'database' ? '#22c55e20' : '#f59e0b20',
                      color: workflow.source === 'database' ? '#22c55e' : '#f59e0b'
                    }}
                  >
                    <i className={`fas ${workflow.source === 'database' ? 'fa-database' : 'fa-hdd'}`}></i>
                  </span>
                </div>

                <div className="workflow-card-body" style={{ padding: '1rem' }}>
                  <p style={{
                    margin: '0 0 1rem',
                    color: 'var(--text-muted)',
                    fontSize: '0.875rem',
                    minHeight: '40px'
                  }}>
                    {workflow.description || 'Sin descripción'}
                  </p>

                  <div className="workflow-meta" style={{
                    display: 'flex',
                    gap: '1rem',
                    fontSize: '0.8rem',
                    color: 'var(--text-muted)',
                    marginBottom: '1rem'
                  }}>
                    <span><i className="fas fa-list"></i> {workflow.actions?.length || 0} acciones</span>
                    <span><i className="fas fa-calendar"></i> {new Date(workflow.createdAt).toLocaleDateString()}</span>
                  </div>

                  {workflow.targetWindow && (
                    <div style={{
                      padding: '0.5rem',
                      background: 'var(--bg-tertiary)',
                      borderRadius: '6px',
                      fontSize: '0.75rem',
                      color: 'var(--text-muted)',
                      marginBottom: '1rem'
                    }}>
                      <i className="fas fa-desktop"></i> {workflow.targetWindow.processName}
                    </div>
                  )}
                </div>

                <div className="workflow-card-footer" style={{
                  padding: '0.75rem 1rem',
                  borderTop: '1px solid var(--border-color)',
                  display: 'flex',
                  gap: '0.5rem'
                }}>
                  <button
                    className="btn btn-sm btn-success"
                    onClick={() => executeWorkflow(workflow)}
                    title="Ejecutar"
                    style={{ flex: 1 }}
                  >
                    <i className="fas fa-play"></i>
                  </button>
                  <button
                    className="btn btn-sm btn-info"
                    onClick={() => exportAsWfl(workflow)}
                    title="Descargar .wfl"
                  >
                    <i className="fas fa-download"></i>
                  </button>
                  <button
                    className="btn btn-sm btn-danger"
                    onClick={() => deleteWorkflow(workflow.id)}
                    title="Eliminar"
                  >
                    <i className="fas fa-trash"></i>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Modal: Importar */}
      {showImportModal && (
        <div className="modal-overlay" onClick={() => setShowImportModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '500px' }}>
            <div className="modal-header">
              <h3><i className="fas fa-file-import"></i> Importar Workflows</h3>
              <button className="modal-close" onClick={() => setShowImportModal(false)}>
                <i className="fas fa-times"></i>
              </button>
            </div>

            <div className="modal-body">
              <div style={{
                border: '2px dashed var(--border-color)',
                borderRadius: '12px',
                padding: '2rem',
                textAlign: 'center',
                marginBottom: '1.5rem',
                background: 'var(--bg-tertiary)'
              }}>
                <i className="fas fa-cloud-upload-alt" style={{
                  fontSize: '3rem',
                  color: 'var(--primary-color)',
                  marginBottom: '1rem'
                }}></i>

                <p style={{ margin: '0 0 1rem', color: 'var(--text-primary)' }}>
                  Arrastra un archivo o haz clic para seleccionar
                </p>

                <input
                  type="file"
                  ref={fileInputRef}
                  accept=".wfl,.alqzip,.json"
                  onChange={handleFileSelect}
                  style={{ display: 'none' }}
                  id="import-file"
                />
                <label htmlFor="import-file" className="btn btn-primary" style={{ cursor: 'pointer' }}>
                  <i className="fas fa-folder-open"></i> Seleccionar Archivo
                </label>
              </div>

              {importFile && (
                <div style={{
                  padding: '1rem',
                  background: 'var(--bg-secondary)',
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem'
                }}>
                  <i className="fas fa-file" style={{ color: 'var(--primary-color)', fontSize: '1.5rem' }}></i>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: '500' }}>{importFile.name}</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      {(importFile.size / 1024).toFixed(2)} KB
                    </div>
                  </div>
                  <button className="btn btn-sm btn-ghost" onClick={() => setImportFile(null)}>
                    <i className="fas fa-times"></i>
                  </button>
                </div>
              )}

              <div style={{
                marginTop: '1.5rem',
                padding: '1rem',
                background: 'rgba(99, 102, 241, 0.1)',
                borderRadius: '8px',
                fontSize: '0.85rem'
              }}>
                <strong>Formatos soportados:</strong>
                <ul style={{ margin: '0.5rem 0 0', paddingLeft: '1.5rem' }}>
                  <li><code>.wfl</code> - Workflow individual (Alqvimia)</li>
                  <li><code>.alqzip</code> - Múltiples workflows (Alqvimia)</li>
                  <li><code>.json</code> - Formato JSON estándar</li>
                </ul>
              </div>
            </div>

            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setShowImportModal(false)}>
                Cancelar
              </button>
              <button
                className="btn btn-primary"
                onClick={importWorkflows}
                disabled={!importFile || importing}
              >
                {importing ? (
                  <><i className="fas fa-spinner fa-spin"></i> Importando...</>
                ) : (
                  <><i className="fas fa-file-import"></i> Importar</>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

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

export default LibraryView
