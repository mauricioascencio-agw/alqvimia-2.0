import { useState, useEffect, useCallback } from 'react'
import { useSocket } from '../context/SocketContext'
import { useLanguage } from '../context/LanguageContext'
import HelpPanel from '../components/HelpPanel'

function RecorderView() {
  const { t } = useLanguage()
  const { socket, isConnected } = useSocket()

  // Estados principales
  const [isRecording, setIsRecording] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [recordedActions, setRecordedActions] = useState([])

  // Estados para modales
  const [showWindowModal, setShowWindowModal] = useState(false)
  const [showSaveModal, setShowSaveModal] = useState(false)
  const [showEditActionModal, setShowEditActionModal] = useState(false)
  const [showWorkflowNameModal, setShowWorkflowNameModal] = useState(false)
  const [showCapturePanel, setShowCapturePanel] = useState(false)

  // Estados para selector de ventana mejorado (tipo avanzado)
  const [windowSelectorTab, setWindowSelectorTab] = useState('application') // 'browser' | 'application' | 'variable'
  const [windowsList, setWindowsList] = useState([])
  const [browsersList, setBrowsersList] = useState([])
  const [variablesList, setVariablesList] = useState([])
  const [selectedWindow, setSelectedWindow] = useState(null)
  const [loadingWindows, setLoadingWindows] = useState(false)
  const [windowSearchQuery, setWindowSearchQuery] = useState('')

  // Estados para captura de objeto
  const [captureMode, setCaptureMode] = useState('auto') // 'auto' | 'manual' | 'image'
  const [capturedObject, setCapturedObject] = useState(null)
  const [isCapturing, setIsCapturing] = useState(false)

  // Estados para propiedades del panel derecho
  const [propertiesTab, setPropertiesTab] = useState('principal') // 'principal' | 'anclaje'
  const [systemTimeout, setSystemTimeout] = useState(15)
  const [timeoutMode, setTimeoutMode] = useState('basic') // 'basic' | 'advanced'
  const [advancedTimeout, setAdvancedTimeout] = useState({ min: 5, max: 30, interval: 1 })
  const [outputVariable, setOutputVariable] = useState('')
  const [showOutputVarSelector, setShowOutputVarSelector] = useState(false)
  const [resizeWindow, setResizeWindow] = useState(false)

  // Estado para nombre de workflow y variable de ventana
  const [workflowName, setWorkflowName] = useState('')
  const [workflowDescription, setWorkflowDescription] = useState('')
  const [windowVariableName, setWindowVariableName] = useState('')

  // Estado para edición de acción
  const [editingAction, setEditingAction] = useState(null)
  const [editingActionData, setEditingActionData] = useState({})

  // Estado para edición inline de variable
  const [editingActionId, setEditingActionId] = useState(null)
  const [editingVarName, setEditingVarName] = useState('')

  // Variables del sistema disponibles
  const systemVariables = [
    { name: 'window_active', type: 'window', description: 'Ventana actualmente activa' },
    { name: 'window_desktop', type: 'window', description: 'Escritorio de Windows' },
    { name: 'window_taskbar', type: 'window', description: 'Barra de tareas' },
  ]

  // Ventanas predeterminadas
  const defaultWindows = [
    { id: 'active', title: 'Actualmente activo', description: 'activo cuando el bot se está ejecutando', icon: 'fa-window-restore', type: 'system' },
    { id: 'desktop', title: 'Escritorio', description: 'espacio predeterminado detrás de las ventanas abiertas', icon: 'fa-desktop', type: 'system' },
    { id: 'taskbar', title: 'Barra de tareas', description: 'muestra las aplicaciones abiertas', icon: 'fa-tasks', type: 'system' },
  ]

  // Obtener tipo de navegador
  const getBrowserType = (processName) => {
    if (!processName) return 'browser'
    const pn = processName.toLowerCase()
    if (pn.includes('chrome')) return 'chrome'
    if (pn.includes('firefox')) return 'firefox'
    if (pn.includes('msedge') || pn.includes('edge')) return 'edge'
    if (pn.includes('opera')) return 'opera'
    if (pn.includes('brave')) return 'brave'
    if (pn.includes('vivaldi')) return 'vivaldi'
    if (pn.includes('iexplore')) return 'ie'
    return 'browser'
  }

  // Cargar ventanas de Windows
  const fetchWindowsList = async () => {
    setLoadingWindows(true)
    try {
      const response = await fetch('http://localhost:4000/api/windows')
      const data = await response.json()
      if (data.success) {
        const windows = data.windows || []

        // Separar navegadores de otras aplicaciones
        // Navegadores: chrome, firefox, msedge, opera, brave, vivaldi
        const browserProcesses = ['chrome', 'firefox', 'msedge', 'opera', 'brave', 'vivaldi', 'iexplore']
        const browsers = windows.filter(w =>
          w.type === 'browser' ||
          browserProcesses.some(bp => w.processName?.toLowerCase().includes(bp))
        ).map(w => ({
          ...w,
          browserType: getBrowserType(w.processName),
          type: 'browser'
        }))

        const apps = windows.filter(w =>
          w.type !== 'browser' &&
          !browserProcesses.some(bp => w.processName?.toLowerCase().includes(bp))
        )

        setBrowsersList(browsers)
        setWindowsList(apps)

        // Cambiar a tab de navegador si hay navegadores disponibles
        if (browsers.length > 0) {
          setWindowSelectorTab('browser')
        }
      }
    } catch (error) {
      console.error('Error fetching windows:', error)
      // Datos de ejemplo si el servidor no está disponible
      setWindowsList([
        { id: 1, handle: '0x001', title: 'Visual Studio Code', processName: 'Code.exe', type: 'editor', icon: 'fa-code' },
        { id: 2, handle: '0x002', title: 'Explorador de archivos', processName: 'explorer.exe', type: 'explorer', icon: 'fa-folder' },
        { id: 3, handle: '0x003', title: 'Alqvimia Backend', processName: 'node.exe', type: 'terminal', icon: 'fa-terminal' },
      ])
      setBrowsersList([
        { id: 4, handle: '0x004', title: 'Alqvimia RPA 2.0', processName: 'chrome.exe', type: 'browser', icon: 'fa-chrome', browserType: 'chrome' },
        { id: 5, handle: '0x005', title: 'Google - Google Chrome', processName: 'chrome.exe', type: 'browser', icon: 'fa-chrome', browserType: 'chrome' },
      ])
      setWindowSelectorTab('browser')
    } finally {
      setLoadingWindows(false)
    }
  }

  // Cargar variables de tipo ventana
  const fetchWindowVariables = () => {
    // Obtener variables guardadas del localStorage o de un store
    const savedVars = JSON.parse(localStorage.getItem('alqvimia-variables') || '[]')
    const windowVars = savedVars.filter(v => v.type === 'window')
    setVariablesList([...systemVariables, ...windowVars])
  }

  // Obtener icono según tipo de ventana
  const getWindowIcon = (type, processName) => {
    if (processName?.toLowerCase().includes('chrome')) return 'fa-brands fa-chrome'
    if (processName?.toLowerCase().includes('firefox')) return 'fa-brands fa-firefox'
    if (processName?.toLowerCase().includes('edge')) return 'fa-brands fa-edge'
    if (processName?.toLowerCase().includes('code')) return 'fa-code'

    const icons = {
      browser: 'fa-globe',
      editor: 'fa-code',
      explorer: 'fa-folder',
      terminal: 'fa-terminal',
      office: 'fa-file-alt',
      application: 'fa-window-maximize'
    }
    return icons[type] || icons.application
  }

  // Activar ventana (poner en primer plano)
  const activateWindow = async (win) => {
    if (!win) return
    try {
      await fetch('http://localhost:4000/api/windows/activate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          processId: win.id,
          handle: win.handle,
          processName: win.processName
        })
      })
    } catch (error) {
      console.error('[Recorder] Error activando ventana:', error)
    }
  }

  // Abrir modal de selección de ventanas
  const handleStartRecording = () => {
    if (!isConnected) {
      alert('Conecta al servidor primero')
      return
    }
    fetchWindowsList()
    fetchWindowVariables()
    setShowWindowModal(true)
  }

  // Seleccionar ventana y activarla
  const selectWindow = async (win) => {
    setSelectedWindow(win)
    if (win.type !== 'system' && win.type !== 'variable') {
      await activateWindow(win)
    }
    // Generar nombre de variable automático
    const varName = win.processName
      ? `window_${win.processName.toLowerCase().replace(/[^a-z0-9]/g, '_').replace('.exe', '')}`
      : `window_${win.id}`
    setWindowVariableName(varName)
    setOutputVariable(varName)
  }

  // Seleccionar variable existente como ventana
  const selectVariableAsWindow = (varItem) => {
    setSelectedWindow({
      id: varItem.name,
      title: varItem.name,
      description: varItem.description,
      type: 'variable',
      variableName: varItem.name
    })
    setWindowVariableName(varItem.name)
    setOutputVariable(varItem.name)
  }

  // Confirmar ventana - mostrar modal para nombre
  const confirmWindowSelection = () => {
    if (!selectedWindow) {
      alert('Selecciona una ventana para grabar')
      return
    }
    setShowWindowModal(false)
    setShowWorkflowNameModal(true)
  }

  // Confirmar nombre de workflow y comenzar grabación
  const confirmWorkflowNameAndStart = async () => {
    if (!workflowName.trim()) {
      alert('Ingresa un nombre para el workflow')
      return
    }
    if (!windowVariableName.trim()) {
      alert('Ingresa un nombre de variable para la ventana')
      return
    }

    setShowWorkflowNameModal(false)
    setShowCapturePanel(true)

    // Cargar ventanas para el panel de captura
    fetchWindowsList()

    // Crear acción de ventana como primera acción
    const windowAction = {
      id: `action_window_${Date.now()}`,
      type: 'window',
      variableName: windowVariableName,
      isWindowAction: true,
      window: {
        title: selectedWindow.title,
        processName: selectedWindow.processName,
        handle: selectedWindow.handle,
        type: selectedWindow.type
      },
      properties: {
        activate: true,
        maximize: false,
        minimize: false,
        restore: false,
        close: false,
        waitForReady: true,
        timeout: systemTimeout * 1000,
        resizeWindow: resizeWindow
      },
      timestamp: new Date().toISOString()
    }

    setRecordedActions([windowAction])
    setIsRecording(true)
    setIsPaused(false)

    // Activar la ventana si no es de sistema
    if (selectedWindow.type !== 'system' && selectedWindow.type !== 'variable') {
      await activateWindow(selectedWindow)
    }

    // Notificar al servidor
    if (socket) {
      socket.emit('recorder:start', {
        targetWindow: selectedWindow,
        workflowName: workflowName,
        captureClicks: true,
        captureKeyboard: true
      })

      socket.emit('recorder:start-visual-detection', {
        windowHandle: selectedWindow.handle,
        processName: selectedWindow.processName,
        highlightColor: '#22c55e',
        highlightWidth: 3
      })
    }
  }

  // Iniciar captura de objeto
  const startObjectCapture = () => {
    setIsCapturing(true)
    if (socket) {
      socket.emit('recorder:start-capture', {
        mode: captureMode,
        windowHandle: selectedWindow?.handle
      })
    }
  }

  // Detener grabación
  const stopRecording = () => {
    setIsRecording(false)
    setIsPaused(false)
    setShowCapturePanel(false)
    if (socket) {
      socket.emit('recorder:stop')
      socket.emit('recorder:stop-visual-detection')
    }
  }

  // Pausar/Reanudar
  const pauseRecording = () => {
    setIsPaused(!isPaused)
    if (socket) {
      socket.emit(isPaused ? 'recorder:resume' : 'recorder:pause')
    }
  }

  // Agregar acción capturada
  const addAction = useCallback((actionData) => {
    const varName = `${actionData.tagName?.toLowerCase() || 'elem'}_${Date.now().toString(36)}`

    const action = {
      id: `action_${Date.now()}`,
      type: actionData.actionType || 'click',
      variableName: varName,
      element: {
        tagName: actionData.tagName,
        id: actionData.id,
        className: actionData.className,
        name: actionData.name,
        selector: actionData.selector,
        xpath: actionData.xpath,
        text: actionData.text?.substring(0, 100),
        value: actionData.value,
        placeholder: actionData.placeholder,
        href: actionData.href,
        src: actionData.src,
        rect: actionData.rect,
        attributes: actionData.attributes || {}
      },
      properties: {
        waitBefore: 0,
        waitAfter: 500,
        timeout: systemTimeout * 1000,
        retryOnFail: true,
        retryCount: 3,
        continueOnError: false,
        takeScreenshot: false
      },
      timestamp: new Date().toISOString()
    }

    // Agregar propiedades específicas según tipo
    if (action.type === 'type' || action.type === 'input') {
      action.properties.text = actionData.text || ''
      action.properties.clearBefore = true
      action.properties.sendEnter = false
    }

    if (action.type === 'select') {
      action.properties.selectBy = 'value'
      action.properties.selectValue = actionData.value || ''
    }

    setRecordedActions(prev => [...prev, action])
    setCapturedObject(action)

    if (socket) {
      socket.emit('recorder:action', action)
    }
  }, [socket, systemTimeout])

  // Escuchar eventos del servidor
  useEffect(() => {
    if (socket) {
      socket.on('recorder:element-captured', (data) => {
        console.log('[Recorder] Elemento capturado:', data)
        addAction(data)
        setIsCapturing(false)
      })

      socket.on('recorder:stopped', (data) => {
        if (data.actions) {
          setRecordedActions(data.actions)
        }
      })

      return () => {
        socket.off('recorder:element-captured')
        socket.off('recorder:stopped')
      }
    }
  }, [socket, addAction])

  // Cargar ventanas cuando se muestra el panel de captura
  useEffect(() => {
    if (showCapturePanel) {
      fetchWindowsList()
    }
  }, [showCapturePanel])

  // Filtrar ventanas por búsqueda
  const filteredWindows = windowSearchQuery
    ? windowsList.filter(w =>
        w.title.toLowerCase().includes(windowSearchQuery.toLowerCase()) ||
        w.processName?.toLowerCase().includes(windowSearchQuery.toLowerCase())
      )
    : windowsList

  const filteredBrowsers = windowSearchQuery
    ? browsersList.filter(w =>
        w.title.toLowerCase().includes(windowSearchQuery.toLowerCase()) ||
        w.processName?.toLowerCase().includes(windowSearchQuery.toLowerCase())
      )
    : browsersList

  // Editar nombre de variable inline
  const startEditingVar = (action) => {
    setEditingActionId(action.id)
    setEditingVarName(action.variableName)
  }

  const saveVarName = (actionId) => {
    if (editingVarName.trim()) {
      setRecordedActions(prev => prev.map(a =>
        a.id === actionId ? { ...a, variableName: editingVarName.trim() } : a
      ))
    }
    setEditingActionId(null)
    setEditingVarName('')
  }

  const cancelEditVar = () => {
    setEditingActionId(null)
    setEditingVarName('')
  }

  // Abrir modal de edición de acción
  const openEditActionModal = (action) => {
    setEditingAction(action)
    setEditingActionData({ ...action })
    setShowEditActionModal(true)
  }

  // Guardar cambios de acción editada
  const saveEditedAction = () => {
    if (editingAction) {
      setRecordedActions(prev => prev.map(a =>
        a.id === editingAction.id ? { ...editingActionData } : a
      ))
    }
    setShowEditActionModal(false)
    setEditingAction(null)
    setEditingActionData({})
  }

  // Eliminar acción
  const deleteAction = (actionId) => {
    if (confirm('¿Eliminar esta acción?')) {
      setRecordedActions(prev => prev.filter(a => a.id !== actionId))
    }
  }

  // Limpiar grabación
  const clearRecording = () => {
    if (confirm('¿Limpiar todas las acciones?')) {
      setRecordedActions([])
      setSelectedWindow(null)
      setWorkflowName('')
      setWorkflowDescription('')
      setWindowVariableName('')
      setCapturedObject(null)
    }
  }

  // Guardar workflow
  const handleSaveWorkflow = () => {
    if (recordedActions.length === 0) {
      alert('No hay acciones para guardar')
      return
    }
    setShowSaveModal(true)
  }

  const confirmSaveWorkflow = () => {
    if (!workflowName.trim()) {
      alert('Ingresa un nombre')
      return
    }

    const variables = recordedActions.map(action => ({
      name: action.variableName,
      type: action.isWindowAction ? 'window' : 'element',
      elementType: action.element?.tagName || action.window?.processName,
      properties: action.isWindowAction ? action.window : action.element
    }))

    const workflow = {
      id: `wf_${Date.now()}`,
      name: workflowName,
      description: workflowDescription,
      targetWindow: selectedWindow,
      windowVariable: windowVariableName,
      variables: variables,
      actions: recordedActions,
      createdAt: new Date().toISOString()
    }

    const workflows = JSON.parse(localStorage.getItem('alqvimia-workflows') || '[]')
    workflows.push(workflow)
    localStorage.setItem('alqvimia-workflows', JSON.stringify(workflows))

    if (socket) {
      socket.emit('recorder:save-as-workflow', workflow)
    }

    setShowSaveModal(false)
    alert('Workflow guardado')
  }

  // Descargar como .wfl
  const downloadAsWFL = () => {
    if (!workflowName.trim()) {
      alert('Ingresa un nombre')
      return
    }

    const variables = recordedActions.map(action => ({
      name: action.variableName,
      type: action.isWindowAction ? 'window' : 'element',
      elementType: action.element?.tagName || action.window?.processName,
      properties: action.isWindowAction ? action.window : action.element
    }))

    const wflData = {
      _wfl: { version: '2.0', format: 'alqvimia-workflow' },
      name: workflowName,
      description: workflowDescription,
      targetWindow: selectedWindow,
      windowVariable: windowVariableName,
      variables: variables,
      actions: recordedActions,
      createdAt: new Date().toISOString()
    }

    const content = JSON.stringify(wflData, null, 2)
    const encoded = btoa(unescape(encodeURIComponent(content)))
    const fileContent = 'ALQWFL2' + encoded

    const blob = new Blob([fileContent], { type: 'application/x-alqvimia-workflow' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${workflowName.replace(/[^a-zA-Z0-9]/g, '_')}.wfl`
    a.click()
    URL.revokeObjectURL(url)

    setShowSaveModal(false)
  }

  // Iconos de acción
  const getActionIcon = (type) => {
    const icons = {
      window: 'fa-window-maximize',
      click: 'fa-mouse-pointer',
      doubleClick: 'fa-hand-pointer',
      type: 'fa-keyboard',
      input: 'fa-keyboard',
      select: 'fa-list',
      hover: 'fa-hand-paper',
      scroll: 'fa-arrows-alt-v',
      wait: 'fa-clock',
      screenshot: 'fa-camera'
    }
    return icons[type] || 'fa-circle'
  }

  // Pasos de ayuda
  const helpSteps = [
    { titleKey: 'help_rec_step1_title', descKey: 'help_rec_step1_desc' },
    { titleKey: 'help_rec_step2_title', descKey: 'help_rec_step2_desc' }
  ]

  // Renderizar propiedades de ventana editables
  const renderWindowProperties = (action) => {
    if (!action.isWindowAction) return null

    return (
      <div className="window-properties-inline">
        <label>
          <input
            type="checkbox"
            checked={action.properties?.activate}
            onChange={(e) => {
              setRecordedActions(prev => prev.map(a =>
                a.id === action.id ? { ...a, properties: { ...a.properties, activate: e.target.checked } } : a
              ))
            }}
          />
          Activar
        </label>
        <label>
          <input
            type="checkbox"
            checked={action.properties?.maximize}
            onChange={(e) => {
              setRecordedActions(prev => prev.map(a =>
                a.id === action.id ? { ...a, properties: { ...a.properties, maximize: e.target.checked } } : a
              ))
            }}
          />
          Maximizar
        </label>
        <label>
          <input
            type="checkbox"
            checked={action.properties?.minimize}
            onChange={(e) => {
              setRecordedActions(prev => prev.map(a =>
                a.id === action.id ? { ...a, properties: { ...a.properties, minimize: e.target.checked } } : a
              ))
            }}
          />
          Minimizar
        </label>
      </div>
    )
  }

  return (
    <div className="view" id="recorder-view">
      <div className="view-header">
        <h2><i className="fas fa-video"></i> {t('nav_recorder')}</h2>
        <p>Graba acciones automáticamente al hacer clic en elementos</p>
      </div>

      <HelpPanel titleKey="help_title" steps={helpSteps} defaultCollapsed={true} />

      {/* Info del Workflow */}
      {workflowName && (
        <div className="recorder-workflow-info">
          <div className="workflow-info-badge">
            <i className="fas fa-project-diagram"></i>
            <span className="workflow-name">{workflowName}</span>
          </div>
          {selectedWindow && (
            <div className="window-info-badge">
              <i className={`fas ${getWindowIcon(selectedWindow.type, selectedWindow.processName)}`}></i>
              <span>${windowVariableName}</span>
              <span className="window-title-small">({selectedWindow.title?.substring(0, 30)}...)</span>
              {isRecording && (
                <div className="recording-indicator">
                  <span className="recording-dot"></span>
                  REC
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Layout principal con panel de captura */}
      <div className={`recorder-layout ${showCapturePanel ? 'with-capture-panel' : ''}`}>
        {/* Panel izquierdo - Acciones grabadas */}
        <div className="recorder-main-panel">
          {/* Controles */}
          <div className="recorder-controls">
            <div className="control-panel">
              {!isRecording ? (
                <button className="btn btn-danger btn-lg" onClick={handleStartRecording} disabled={!isConnected}>
                  <i className="fas fa-circle"></i> Iniciar Grabación
                </button>
              ) : (
                <>
                  <button className="btn btn-secondary btn-lg" onClick={stopRecording}>
                    <i className="fas fa-stop"></i> Detener
                  </button>
                  <button className="btn btn-primary btn-lg" onClick={pauseRecording}>
                    <i className={`fas fa-${isPaused ? 'play' : 'pause'}`}></i>
                    {isPaused ? 'Reanudar' : 'Pausar'}
                  </button>
                </>
              )}
            </div>

            <div className="recording-status">
              <i className={`fas fa-${isRecording ? (isPaused ? 'pause-circle text-warning' : 'circle text-danger') : 'info-circle text-info'}`}></i>
              <span>
                {isRecording ? (isPaused ? 'Pausado' : 'Grabando...') : 'Listo para grabar'}
              </span>
            </div>
          </div>

          {/* Lista de acciones */}
          <div className="recorded-actions">
            <div className="actions-header">
              <h3>
                <i className="fas fa-list-ol"></i> Acciones
                <span className="action-count">{recordedActions.length}</span>
              </h3>
              {recordedActions.length > 0 && (
                <div className="actions-toolbar">
                  <button className="btn btn-sm btn-success" onClick={handleSaveWorkflow}>
                    <i className="fas fa-save"></i> Guardar
                  </button>
                  <button className="btn btn-sm btn-warning" onClick={clearRecording}>
                    <i className="fas fa-trash"></i>
                  </button>
                </div>
              )}
            </div>

            <div className="actions-list">
              {recordedActions.length === 0 ? (
                <div className="empty-state">
                  <i className="fas fa-video-slash"></i>
                  <p>No hay acciones</p>
                  <small>Inicia grabación y haz clic en elementos</small>
                </div>
              ) : (
                recordedActions.map((action, index) => (
                  <div key={action.id} className={`action-item type-${action.type} ${action.isWindowAction ? 'is-window-action' : ''}`}>
                    <span className="action-number">{index + 1}</span>
                    <div className="action-icon">
                      <i className={`fas ${getActionIcon(action.type)}`}></i>
                    </div>
                    <div className="action-details">
                      <div className="action-main">
                        <span className={`action-type-label ${action.isWindowAction ? 'type-window' : ''}`}>
                          {action.isWindowAction ? 'VENTANA' : action.type.toUpperCase()}
                        </span>

                        {editingActionId === action.id ? (
                          <div className="var-edit-inline">
                            <input
                              type="text"
                              value={editingVarName}
                              onChange={e => setEditingVarName(e.target.value)}
                              onKeyDown={e => {
                                if (e.key === 'Enter') saveVarName(action.id)
                                if (e.key === 'Escape') cancelEditVar()
                              }}
                              autoFocus
                              className="var-input"
                            />
                            <button className="btn-icon" onClick={() => saveVarName(action.id)}>
                              <i className="fas fa-check"></i>
                            </button>
                            <button className="btn-icon" onClick={cancelEditVar}>
                              <i className="fas fa-times"></i>
                            </button>
                          </div>
                        ) : (
                          <span
                            className="action-variable"
                            onClick={() => startEditingVar(action)}
                            title="Clic para editar nombre de variable"
                          >
                            ${action.variableName}
                            <i className="fas fa-pencil-alt edit-icon"></i>
                          </span>
                        )}
                      </div>

                      <div className="action-meta">
                        {action.isWindowAction ? (
                          <>
                            <span className="element-tag">{action.window?.processName}</span>
                            <span className="element-text">{action.window?.title?.substring(0, 40)}</span>
                          </>
                        ) : (
                          <>
                            <span className="element-tag">{action.element?.tagName}</span>
                            <span className="element-text">
                              {action.element?.text || action.element?.id || action.element?.selector?.substring(0, 30)}
                            </span>
                          </>
                        )}
                      </div>

                      {renderWindowProperties(action)}
                    </div>

                    <div className="action-buttons">
                      <button
                        className="btn btn-xs btn-ghost"
                        onClick={() => openEditActionModal(action)}
                        title="Editar acción"
                      >
                        <i className="fas fa-edit"></i>
                      </button>
                      <button
                        className="btn btn-xs btn-ghost text-danger"
                        onClick={() => deleteAction(action.id)}
                        title="Eliminar acción"
                      >
                        <i className="fas fa-trash"></i>
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Panel derecho - Propiedades de Captura (estilo avanzado) */}
        {showCapturePanel && (
          <div className="recorder-capture-panel">
            {/* Selector de Ventana */}
            <div className="capture-section">
              <div className="section-header with-warning">
                <i className="fas fa-exclamation-triangle text-warning"></i>
                <span>Ventana</span>
              </div>

              {/* Tabs: Navegador | Aplicación | Variable */}
              <div className="window-selector-tabs">
                <button
                  className={`tab-btn ${windowSelectorTab === 'browser' ? 'active' : ''}`}
                  onClick={() => { setWindowSelectorTab('browser'); fetchWindowsList(); }}
                >
                  Navegador {browsersList.length > 0 && `(${browsersList.length})`}
                </button>
                <button
                  className={`tab-btn ${windowSelectorTab === 'application' ? 'active' : ''}`}
                  onClick={() => { setWindowSelectorTab('application'); fetchWindowsList(); }}
                >
                  Aplicación {windowsList.length > 0 && `(${windowsList.length})`}
                </button>
                <button
                  className={`tab-btn ${windowSelectorTab === 'variable' ? 'active' : ''}`}
                  onClick={() => setWindowSelectorTab('variable')}
                >
                  Variable
                </button>
              </div>

              {/* Dropdown de selección */}
              <div className="window-dropdown-container">
                <div className="window-dropdown">
                  <input
                    type="text"
                    className="window-search-input"
                    placeholder="Buscar ventana..."
                    value={windowSearchQuery}
                    onChange={(e) => setWindowSearchQuery(e.target.value)}
                  />
                  <button className="dropdown-arrow">
                    <i className="fas fa-caret-down"></i>
                  </button>
                  <button className="refresh-btn" onClick={fetchWindowsList} title="Actualizar">
                    <i className={`fas fa-sync ${loadingWindows ? 'fa-spin' : ''}`}></i>
                  </button>
                </div>

                {/* Lista desplegable */}
                <div className="window-dropdown-list">
                  {/* Ventanas predeterminadas */}
                  <div className="dropdown-section">
                    <div className="section-label">Valores predeterminados</div>
                    {defaultWindows.map(win => (
                      <div
                        key={win.id}
                        className={`dropdown-item ${selectedWindow?.id === win.id ? 'selected' : ''}`}
                        onClick={() => selectWindow(win)}
                      >
                        <i className={`fas ${win.icon}`}></i>
                        <div className="item-content">
                          <span className="item-title">{win.title}</span>
                          <span className="item-desc">{win.description}</span>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Aplicaciones locales */}
                  {windowSelectorTab === 'application' && (
                    <div className="dropdown-section">
                      <div className="section-label">Aplicaciones locales</div>
                      {filteredWindows.map(win => (
                        <div
                          key={`${win.id}-${win.handle}`}
                          className={`dropdown-item ${selectedWindow?.handle === win.handle ? 'selected' : ''}`}
                          onClick={() => selectWindow(win)}
                        >
                          <i className={`fas ${getWindowIcon(win.type, win.processName)}`}></i>
                          <div className="item-content">
                            <span className="item-title">{win.title}</span>
                            <span className="item-desc">{win.processName}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Navegadores - Agrupados por tipo */}
                  {windowSelectorTab === 'browser' && (
                    <>
                      {['chrome', 'edge', 'firefox', 'opera', 'brave', 'vivaldi', 'browser'].map(browserType => {
                        const browsersOfType = filteredBrowsers.filter(w => w.browserType === browserType)
                        if (browsersOfType.length === 0) return null

                        const browserNames = {
                          chrome: 'Google Chrome',
                          edge: 'Microsoft Edge',
                          firefox: 'Mozilla Firefox',
                          opera: 'Opera',
                          brave: 'Brave',
                          vivaldi: 'Vivaldi',
                          browser: 'Otros'
                        }

                        return (
                          <div key={browserType} className="dropdown-section">
                            <div className="section-label">{browserNames[browserType]} ({browsersOfType.length})</div>
                            {browsersOfType.map(win => (
                              <div
                                key={`${win.id}-${win.handle}`}
                                className={`dropdown-item ${selectedWindow?.handle === win.handle ? 'selected' : ''}`}
                                onClick={() => selectWindow(win)}
                              >
                                <i className={`fas ${getWindowIcon(win.type, win.processName)}`}></i>
                                <div className="item-content">
                                  <span className="item-title">{win.title?.substring(0, 40)}{win.title?.length > 40 ? '...' : ''}</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        )
                      })}
                      {filteredBrowsers.length === 0 && (
                        <div className="dropdown-section">
                          <div className="section-label">Sin navegadores</div>
                          <div className="dropdown-item" style={{ opacity: 0.6, cursor: 'default' }}>
                            <i className="fas fa-info-circle"></i>
                            <div className="item-content">
                              <span className="item-desc">Abre un navegador para capturar</span>
                            </div>
                          </div>
                        </div>
                      )}
                    </>
                  )}

                  {/* Variables */}
                  {windowSelectorTab === 'variable' && (
                    <div className="dropdown-section">
                      <div className="section-label">Variables de ventana</div>
                      {variablesList.map(v => (
                        <div
                          key={v.name}
                          className={`dropdown-item ${selectedWindow?.variableName === v.name ? 'selected' : ''}`}
                          onClick={() => selectVariableAsWindow(v)}
                        >
                          <i className="fas fa-cube"></i>
                          <div className="item-content">
                            <span className="item-title">${v.name}</span>
                            <span className="item-desc">{v.description}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Opción cambiar tamaño */}
              <label className="checkbox-option">
                <input
                  type="checkbox"
                  checked={resizeWindow}
                  onChange={(e) => setResizeWindow(e.target.checked)}
                />
                <span>Cambiar tamaño de ventana</span>
                <small className="option-hint">Puede mejorar la precisión del bot</small>
              </label>
            </div>

            {/* Tabs Principal | Anclaje */}
            <div className="capture-section">
              <div className="properties-tabs">
                <button
                  className={`tab-btn ${propertiesTab === 'principal' ? 'active' : ''}`}
                  onClick={() => setPropertiesTab('principal')}
                >
                  Principal
                </button>
                <button
                  className={`tab-btn ${propertiesTab === 'anclaje' ? 'active' : ''}`}
                  onClick={() => setPropertiesTab('anclaje')}
                >
                  Anclaje
                </button>
              </div>

              {propertiesTab === 'principal' && (
                <div className="properties-content">
                  {/* Capturar objeto */}
                  <div className="capture-object-section">
                    <button
                      className={`capture-btn ${isCapturing ? 'capturing' : ''}`}
                      onClick={startObjectCapture}
                      disabled={isCapturing}
                    >
                      <i className={`fas ${isCapturing ? 'fa-spinner fa-spin' : 'fa-crosshairs'}`}></i>
                      {isCapturing ? 'Capturando...' : 'Capturar objeto'}
                    </button>
                    <p className="capture-hint">
                      Para poder capturar un objeto, primero debe elegir una ventana.
                    </p>
                  </div>

                  {/* Tiempo de espera del sistema */}
                  <div className="timeout-section">
                    <label>Establecer el tiempo de espera del sistema</label>
                    <div className="timeout-tabs">
                      <button
                        className={`tab-btn small ${timeoutMode === 'basic' ? 'active' : ''}`}
                        onClick={() => setTimeoutMode('basic')}
                      >
                        Básica
                      </button>
                      <button
                        className={`tab-btn small ${timeoutMode === 'advanced' ? 'active' : ''}`}
                        onClick={() => setTimeoutMode('advanced')}
                      >
                        Avanzado
                      </button>
                    </div>

                    {timeoutMode === 'basic' ? (
                      <div className="timeout-basic">
                        <label>Esperar respuesta del sistema (en segundos)</label>
                        <div className="input-with-var">
                          <span className="input-prefix">#</span>
                          <input
                            type="number"
                            value={systemTimeout}
                            onChange={(e) => setSystemTimeout(parseInt(e.target.value) || 15)}
                            min={1}
                            max={300}
                          />
                          <button
                            className="var-btn"
                            onClick={() => {/* Abrir selector de variable */}}
                            title="Seleccionar variable"
                          >
                            (x)
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="timeout-advanced">
                        <div className="form-row">
                          <div className="form-group">
                            <label>Mínimo (seg)</label>
                            <input
                              type="number"
                              value={advancedTimeout.min}
                              onChange={(e) => setAdvancedTimeout({...advancedTimeout, min: parseInt(e.target.value) || 5})}
                            />
                          </div>
                          <div className="form-group">
                            <label>Máximo (seg)</label>
                            <input
                              type="number"
                              value={advancedTimeout.max}
                              onChange={(e) => setAdvancedTimeout({...advancedTimeout, max: parseInt(e.target.value) || 30})}
                            />
                          </div>
                          <div className="form-group">
                            <label>Intervalo (seg)</label>
                            <input
                              type="number"
                              value={advancedTimeout.interval}
                              onChange={(e) => setAdvancedTimeout({...advancedTimeout, interval: parseInt(e.target.value) || 1})}
                            />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Asignar salida a variable */}
                  <div className="output-variable-section">
                    <div className="section-header with-warning">
                      <i className="fas fa-exclamation-triangle text-warning"></i>
                      <span>Asignar la salida a una variable</span>
                    </div>
                    <div className="input-with-var">
                      <select
                        value={outputVariable}
                        onChange={(e) => setOutputVariable(e.target.value)}
                        className="variable-select"
                      >
                        <option value="">Seleccionar variable...</option>
                        {systemVariables.map(v => (
                          <option key={v.name} value={v.name}>${v.name}</option>
                        ))}
                      </select>
                      <button
                        className="var-btn"
                        onClick={() => setShowOutputVarSelector(!showOutputVarSelector)}
                        title="Seleccionar variable"
                      >
                        (x)
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {propertiesTab === 'anclaje' && (
                <div className="properties-content">
                  <div className="anchor-info">
                    <i className="fas fa-anchor"></i>
                    <p>Configure puntos de anclaje para mejorar la detección de elementos cuando la interfaz cambia.</p>
                  </div>
                  <button className="btn btn-secondary btn-block">
                    <i className="fas fa-plus"></i> Agregar punto de anclaje
                  </button>
                </div>
              )}
            </div>

            {/* Objeto capturado */}
            {capturedObject && (
              <div className="capture-section">
                <div className="section-header">
                  <i className="fas fa-check-circle text-success"></i>
                  <span>Último objeto capturado</span>
                </div>
                <div className="captured-object-preview">
                  <div className="object-info">
                    <span className="object-type">{capturedObject.element?.tagName || 'ELEMENT'}</span>
                    <span className="object-var">${capturedObject.variableName}</span>
                  </div>
                  <code className="object-selector">{capturedObject.element?.selector}</code>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Modal: Selección de Ventana */}
      {showWindowModal && (
        <div className="modal-overlay" onClick={() => setShowWindowModal(false)}>
          <div className="modal-content modal-lg" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3><i className="fas fa-desktop"></i> Seleccionar Ventana</h3>
              <button className="modal-close" onClick={() => setShowWindowModal(false)}>
                <i className="fas fa-times"></i>
              </button>
            </div>

            <div className="modal-body">
              {/* Tabs mejorados */}
              <div className="window-modal-tabs">
                <button
                  className={`modal-tab ${windowSelectorTab === 'browser' ? 'active' : ''}`}
                  onClick={() => setWindowSelectorTab('browser')}
                >
                  <i className="fas fa-globe"></i> Navegador
                </button>
                <button
                  className={`modal-tab ${windowSelectorTab === 'application' ? 'active' : ''}`}
                  onClick={() => setWindowSelectorTab('application')}
                >
                  <i className="fas fa-window-maximize"></i> Aplicación
                </button>
                <button
                  className={`modal-tab ${windowSelectorTab === 'variable' ? 'active' : ''}`}
                  onClick={() => setWindowSelectorTab('variable')}
                >
                  <i className="fas fa-cube"></i> Variable
                </button>
              </div>

              <div className="window-selector-toolbar">
                <input
                  type="text"
                  className="form-control"
                  placeholder="Buscar..."
                  value={windowSearchQuery}
                  onChange={(e) => setWindowSearchQuery(e.target.value)}
                />
                <button className="btn btn-sm btn-secondary" onClick={fetchWindowsList} disabled={loadingWindows}>
                  <i className={`fas fa-sync ${loadingWindows ? 'fa-spin' : ''}`}></i> Actualizar
                </button>
              </div>

              {loadingWindows ? (
                <div className="windows-loading">
                  <i className="fas fa-spinner fa-spin fa-2x"></i>
                  <p>Buscando ventanas...</p>
                </div>
              ) : (
                <div className="windows-list-container">
                  {/* Ventanas predeterminadas */}
                  <div className="windows-section">
                    <h4>Valores predeterminados</h4>
                    <div className="windows-grid compact">
                      {defaultWindows.map(win => (
                        <div
                          key={win.id}
                          className={`window-card compact ${selectedWindow?.id === win.id ? 'selected' : ''}`}
                          onClick={() => selectWindow(win)}
                        >
                          <div className="window-card-icon">
                            <i className={`fas ${win.icon}`}></i>
                          </div>
                          <div className="window-card-info">
                            <span className="window-card-title">{win.title}</span>
                            <span className="window-process-name">{win.description}</span>
                          </div>
                          {selectedWindow?.id === win.id && (
                            <i className="fas fa-check-circle window-selected-check"></i>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Aplicaciones locales */}
                  {windowSelectorTab === 'application' && (
                    <div className="windows-section">
                      <h4>Aplicaciones locales</h4>
                      <div className="windows-grid">
                        {filteredWindows.map((win) => (
                          <div
                            key={`${win.id}-${win.handle}`}
                            className={`window-card ${selectedWindow?.handle === win.handle ? 'selected' : ''}`}
                            onClick={() => selectWindow(win)}
                          >
                            <div className="window-card-icon">
                              <i className={`fas ${getWindowIcon(win.type, win.processName)}`}></i>
                            </div>
                            <div className="window-card-info">
                              <span className="window-card-title">
                                {win.title.length > 40 ? win.title.substring(0, 40) + '...' : win.title}
                              </span>
                              <span className="window-process-name">{win.processName}</span>
                            </div>
                            {selectedWindow?.handle === win.handle && (
                              <i className="fas fa-check-circle window-selected-check"></i>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Navegadores - Agrupados por tipo */}
                  {windowSelectorTab === 'browser' && (
                    <div className="windows-section">
                      {/* Agrupar por tipo de navegador */}
                      {['chrome', 'edge', 'firefox', 'opera', 'brave', 'vivaldi', 'browser'].map(browserType => {
                        const browsersOfType = filteredBrowsers.filter(w => w.browserType === browserType)
                        if (browsersOfType.length === 0) return null

                        const browserNames = {
                          chrome: 'Google Chrome',
                          edge: 'Microsoft Edge',
                          firefox: 'Mozilla Firefox',
                          opera: 'Opera',
                          brave: 'Brave',
                          vivaldi: 'Vivaldi',
                          browser: 'Otros navegadores'
                        }

                        const browserIcons = {
                          chrome: 'fa-brands fa-chrome',
                          edge: 'fa-brands fa-edge',
                          firefox: 'fa-brands fa-firefox',
                          opera: 'fa-brands fa-opera',
                          brave: 'fa-brands fa-brave',
                          vivaldi: 'fa-globe',
                          browser: 'fa-globe'
                        }

                        return (
                          <div key={browserType} className="browser-group">
                            <h4 className="browser-group-title">
                              <i className={browserIcons[browserType]}></i>
                              {browserNames[browserType]} ({browsersOfType.length})
                            </h4>
                            <div className="windows-grid">
                              {browsersOfType.map((win) => (
                                <div
                                  key={`${win.id}-${win.handle}`}
                                  className={`window-card browser-card ${selectedWindow?.handle === win.handle ? 'selected' : ''}`}
                                  onClick={() => selectWindow(win)}
                                >
                                  <div className="window-card-icon">
                                    <i className={browserIcons[browserType]}></i>
                                  </div>
                                  <div className="window-card-info">
                                    <span className="window-card-title">
                                      {win.title.length > 50 ? win.title.substring(0, 50) + '...' : win.title}
                                    </span>
                                    <span className="window-process-name">{win.processName}</span>
                                  </div>
                                  {selectedWindow?.handle === win.handle && (
                                    <i className="fas fa-check-circle window-selected-check"></i>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        )
                      })}

                      {filteredBrowsers.length === 0 && (
                        <div className="empty-browsers">
                          <i className="fas fa-globe"></i>
                          <p>No hay navegadores abiertos</p>
                          <small>Abre Chrome, Edge, Firefox u otro navegador</small>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Variables */}
                  {windowSelectorTab === 'variable' && (
                    <div className="windows-section">
                      <h4>Variables de tipo Ventana</h4>
                      <div className="variables-list-modal">
                        {variablesList.map(v => (
                          <div
                            key={v.name}
                            className={`variable-card ${selectedWindow?.variableName === v.name ? 'selected' : ''}`}
                            onClick={() => selectVariableAsWindow(v)}
                          >
                            <i className="fas fa-cube"></i>
                            <div className="variable-info">
                              <span className="variable-name">${v.name}</span>
                              <span className="variable-desc">{v.description}</span>
                            </div>
                            {selectedWindow?.variableName === v.name && (
                              <i className="fas fa-check-circle"></i>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setShowWindowModal(false)}>
                Cancelar
              </button>
              <button className="btn btn-primary" onClick={confirmWindowSelection} disabled={!selectedWindow}>
                <i className="fas fa-arrow-right"></i> Siguiente
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Nombre de Workflow y Variable de Ventana */}
      {showWorkflowNameModal && (
        <div className="modal-overlay" onClick={() => setShowWorkflowNameModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3><i className="fas fa-project-diagram"></i> Configurar Workflow</h3>
              <button className="modal-close" onClick={() => setShowWorkflowNameModal(false)}>
                <i className="fas fa-times"></i>
              </button>
            </div>

            <div className="modal-body">
              <div className="selected-window-preview">
                <i className={`fas ${getWindowIcon(selectedWindow?.type, selectedWindow?.processName)}`}></i>
                <div>
                  <strong>{selectedWindow?.title}</strong>
                  <small>{selectedWindow?.processName || selectedWindow?.description}</small>
                </div>
              </div>

              <div className="form-group">
                <label><i className="fas fa-file-alt"></i> Nombre del Workflow *</label>
                <input
                  type="text"
                  className="form-control"
                  value={workflowName}
                  onChange={e => setWorkflowName(e.target.value)}
                  placeholder="Ej: Automatizar Login SAP"
                  autoFocus
                />
              </div>

              <div className="form-group">
                <label><i className="fas fa-code"></i> Variable de Ventana *</label>
                <div className="input-with-prefix">
                  <span className="input-prefix">$</span>
                  <input
                    type="text"
                    className="form-control"
                    value={windowVariableName}
                    onChange={e => setWindowVariableName(e.target.value.replace(/[^a-zA-Z0-9_]/g, ''))}
                    placeholder="window_sap"
                  />
                </div>
                <small className="form-hint">Esta variable representará la ventana seleccionada en el workflow</small>
              </div>

              <div className="form-group">
                <label><i className="fas fa-align-left"></i> Descripción (opcional)</label>
                <textarea
                  className="form-control"
                  value={workflowDescription}
                  onChange={e => setWorkflowDescription(e.target.value)}
                  placeholder="Descripción del workflow..."
                  rows="2"
                />
              </div>
            </div>

            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => {
                setShowWorkflowNameModal(false)
                setShowWindowModal(true)
              }}>
                <i className="fas fa-arrow-left"></i> Atrás
              </button>
              <button
                className="btn btn-success"
                onClick={confirmWorkflowNameAndStart}
                disabled={!workflowName.trim() || !windowVariableName.trim()}
              >
                <i className="fas fa-play"></i> Iniciar Grabación
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Editar Acción */}
      {showEditActionModal && editingAction && (
        <div className="modal-overlay" onClick={() => setShowEditActionModal(false)}>
          <div className="modal-content modal-lg" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>
                <i className={`fas ${getActionIcon(editingAction.type)}`}></i>
                Editar {editingAction.isWindowAction ? 'Ventana' : 'Acción'}
              </h3>
              <button className="modal-close" onClick={() => setShowEditActionModal(false)}>
                <i className="fas fa-times"></i>
              </button>
            </div>

            <div className="modal-body">
              <div className="edit-action-grid">
                <div className="edit-section">
                  <h4>Información</h4>

                  <div className="form-group">
                    <label>Nombre de Variable</label>
                    <div className="input-with-prefix">
                      <span className="input-prefix">$</span>
                      <input
                        type="text"
                        className="form-control"
                        value={editingActionData.variableName || ''}
                        onChange={e => setEditingActionData({
                          ...editingActionData,
                          variableName: e.target.value.replace(/[^a-zA-Z0-9_]/g, '')
                        })}
                      />
                    </div>
                  </div>

                  {!editingAction.isWindowAction && (
                    <div className="form-group">
                      <label>Tipo de Acción</label>
                      <select
                        className="form-control"
                        value={editingActionData.type || 'click'}
                        onChange={e => setEditingActionData({ ...editingActionData, type: e.target.value })}
                      >
                        <option value="click">Click</option>
                        <option value="doubleClick">Doble Click</option>
                        <option value="type">Escribir Texto</option>
                        <option value="select">Seleccionar</option>
                        <option value="hover">Hover</option>
                        <option value="scroll">Scroll</option>
                        <option value="wait">Esperar</option>
                        <option value="screenshot">Captura</option>
                      </select>
                    </div>
                  )}

                  {editingAction.element && (
                    <div className="form-group">
                      <label>Selector CSS</label>
                      <input
                        type="text"
                        className="form-control code"
                        value={editingActionData.element?.selector || ''}
                        onChange={e => setEditingActionData({
                          ...editingActionData,
                          element: { ...editingActionData.element, selector: e.target.value }
                        })}
                      />
                    </div>
                  )}
                </div>

                <div className="edit-section">
                  <h4>Propiedades</h4>

                  {editingAction.isWindowAction ? (
                    <>
                      <div className="form-group">
                        <label>
                          <input
                            type="checkbox"
                            checked={editingActionData.properties?.activate || false}
                            onChange={e => setEditingActionData({
                              ...editingActionData,
                              properties: { ...editingActionData.properties, activate: e.target.checked }
                            })}
                          />
                          Activar ventana
                        </label>
                      </div>
                      <div className="form-group">
                        <label>
                          <input
                            type="checkbox"
                            checked={editingActionData.properties?.maximize || false}
                            onChange={e => setEditingActionData({
                              ...editingActionData,
                              properties: { ...editingActionData.properties, maximize: e.target.checked }
                            })}
                          />
                          Maximizar ventana
                        </label>
                      </div>
                      <div className="form-group">
                        <label>Timeout (ms)</label>
                        <input
                          type="number"
                          className="form-control"
                          value={editingActionData.properties?.timeout || 30000}
                          onChange={e => setEditingActionData({
                            ...editingActionData,
                            properties: { ...editingActionData.properties, timeout: parseInt(e.target.value) }
                          })}
                        />
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="form-group">
                        <label>Espera antes (ms)</label>
                        <input
                          type="number"
                          className="form-control"
                          value={editingActionData.properties?.waitBefore || 0}
                          onChange={e => setEditingActionData({
                            ...editingActionData,
                            properties: { ...editingActionData.properties, waitBefore: parseInt(e.target.value) }
                          })}
                        />
                      </div>
                      <div className="form-group">
                        <label>Espera después (ms)</label>
                        <input
                          type="number"
                          className="form-control"
                          value={editingActionData.properties?.waitAfter || 500}
                          onChange={e => setEditingActionData({
                            ...editingActionData,
                            properties: { ...editingActionData.properties, waitAfter: parseInt(e.target.value) }
                          })}
                        />
                      </div>
                      <div className="form-group">
                        <label>
                          <input
                            type="checkbox"
                            checked={editingActionData.properties?.continueOnError || false}
                            onChange={e => setEditingActionData({
                              ...editingActionData,
                              properties: { ...editingActionData.properties, continueOnError: e.target.checked }
                            })}
                          />
                          Continuar si hay error
                        </label>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setShowEditActionModal(false)}>
                Cancelar
              </button>
              <button className="btn btn-primary" onClick={saveEditedAction}>
                <i className="fas fa-save"></i> Guardar Cambios
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Guardar Workflow */}
      {showSaveModal && (
        <div className="modal-overlay" onClick={() => setShowSaveModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3><i className="fas fa-save"></i> Guardar Workflow</h3>
              <button className="modal-close" onClick={() => setShowSaveModal(false)}>
                <i className="fas fa-times"></i>
              </button>
            </div>

            <div className="modal-body">
              <div className="form-group">
                <label>Nombre *</label>
                <input
                  type="text"
                  className="form-control"
                  value={workflowName}
                  onChange={e => setWorkflowName(e.target.value)}
                  placeholder="Mi workflow"
                />
              </div>

              <div className="form-group">
                <label>Descripción</label>
                <textarea
                  className="form-control"
                  value={workflowDescription}
                  onChange={e => setWorkflowDescription(e.target.value)}
                  placeholder="Descripción opcional..."
                  rows="2"
                />
              </div>

              <div className="workflow-summary">
                <h4>Resumen</h4>
                <div className="summary-stats">
                  <div className="stat">
                    <i className="fas fa-list"></i>
                    <span>{recordedActions.length} acciones</span>
                  </div>
                  <div className="stat">
                    <i className="fas fa-code"></i>
                    <span>{recordedActions.length} variables</span>
                  </div>
                  {selectedWindow && (
                    <div className="stat">
                      <i className="fas fa-desktop"></i>
                      <span>{selectedWindow.processName || selectedWindow.title}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setShowSaveModal(false)}>
                Cancelar
              </button>
              <button className="btn btn-info" onClick={downloadAsWFL} disabled={!workflowName.trim()}>
                <i className="fas fa-download"></i> Descargar .wfl
              </button>
              <button className="btn btn-success" onClick={confirmSaveWorkflow} disabled={!workflowName.trim()}>
                <i className="fas fa-save"></i> Guardar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default RecorderView
