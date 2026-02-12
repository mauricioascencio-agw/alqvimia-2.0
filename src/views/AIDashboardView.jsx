import { useState, useCallback, useRef, useEffect } from 'react'
import { useLanguage } from '../context/LanguageContext'
import { aiService } from '../services/api'

// Datos de flujo para cada proceso
const processFlows = {
  1: [
    { id: 'a', name: 'Recibir Factura', icon: 'fa-file-invoice', time: '2min', auto: true },
    { id: 'b', name: 'Validar Datos', icon: 'fa-check-double', time: '5min', auto: true },
    { id: 'c', name: 'Registrar en Sistema', icon: 'fa-database', time: '3min', auto: true },
    { id: 'd', name: 'Aprobación Manual', icon: 'fa-user-clock', time: '3.5h', auto: false, bottleneck: true },
    { id: 'e', name: 'Programar Pago', icon: 'fa-calendar-check', time: '1min', auto: true },
    { id: 'f', name: 'Confirmar Pago', icon: 'fa-check-circle', time: '2min', auto: true }
  ],
  2: [
    { id: 'a', name: 'Solicitud Ingreso', icon: 'fa-user-plus', time: '5min', auto: true },
    { id: 'b', name: 'Recopilar Docs', icon: 'fa-folder-open', time: '30min', auto: false },
    { id: 'c', name: 'Verificar Docs', icon: 'fa-search', time: '1.5 días', auto: false, bottleneck: true },
    { id: 'd', name: 'Crear Cuenta', icon: 'fa-user-check', time: '10min', auto: true },
    { id: 'e', name: 'Configurar Accesos', icon: 'fa-key', time: '15min', auto: true },
    { id: 'f', name: 'Bienvenida', icon: 'fa-handshake', time: '5min', auto: true }
  ],
  3: [
    { id: 'a', name: 'Recibir Pedido', icon: 'fa-shopping-cart', time: '1min', auto: true },
    { id: 'b', name: 'Verificar Stock', icon: 'fa-warehouse', time: '4h', auto: false, bottleneck: true },
    { id: 'c', name: 'Preparar Envío', icon: 'fa-box', time: '30min', auto: false },
    { id: 'd', name: 'Facturar', icon: 'fa-file-invoice-dollar', time: '5min', auto: true },
    { id: 'e', name: 'Enviar', icon: 'fa-truck', time: '1h', auto: false },
    { id: 'f', name: 'Confirmar Entrega', icon: 'fa-clipboard-check', time: '2min', auto: true }
  ],
  4: [
    { id: 'a', name: 'Recibir Ticket', icon: 'fa-ticket-alt', time: '1min', auto: true },
    { id: 'b', name: 'Clasificar', icon: 'fa-tags', time: '2min', auto: true },
    { id: 'c', name: 'Asignar Agente', icon: 'fa-user-tie', time: '5min', auto: true },
    { id: 'd', name: 'Resolver', icon: 'fa-wrench', time: '20min', auto: false },
    { id: 'e', name: 'Escalación N2', icon: 'fa-level-up-alt', time: '25min', auto: false, bottleneck: true },
    { id: 'f', name: 'Cerrar Ticket', icon: 'fa-check-circle', time: '2min', auto: true }
  ]
}

// Recomendaciones de optimización por proceso
const optimizationData = {
  1: {
    title: 'Proceso de Facturación',
    savings: '68%', timeSaved: '2.8h',
    recommendations: [
      { action: 'Automatizar aprobación', desc: 'Implementar reglas de negocio: aprobar automáticamente facturas < $5,000 de proveedores verificados', impact: 'Alto', effort: 'Medio' },
      { action: 'OCR + Validación IA', desc: 'Extraer datos de factura con ML y validar contra órdenes de compra', impact: 'Alto', effort: 'Bajo' },
      { action: 'Notificaciones inteligentes', desc: 'Alertar solo cuando se requiere intervención humana por excepciones', impact: 'Medio', effort: 'Bajo' }
    ]
  },
  2: {
    title: 'Onboarding de Clientes',
    savings: '55%', timeSaved: '1.2 días',
    recommendations: [
      { action: 'Verificación digital', desc: 'Usar API de verificación de identidad en tiempo real con validación biométrica', impact: 'Alto', effort: 'Medio' },
      { action: 'Portal self-service', desc: 'Permitir a clientes subir documentos y rastrear progreso online', impact: 'Alto', effort: 'Alto' },
      { action: 'Flujo paralelo', desc: 'Ejecutar verificación de documentos y creación de cuenta en paralelo', impact: 'Medio', effort: 'Bajo' }
    ]
  },
  3: {
    title: 'Gestión de Pedidos',
    savings: '72%', timeSaved: '4.7h',
    recommendations: [
      { action: 'Stock en tiempo real', desc: 'Integrar API de inventario para verificación instantánea de disponibilidad', impact: 'Alto', effort: 'Medio' },
      { action: 'Picking automatizado', desc: 'Generar rutas de picking optimizadas automáticamente', impact: 'Alto', effort: 'Alto' },
      { action: 'Tracking proactivo', desc: 'Actualizar estado de envío automáticamente via webhooks de courier', impact: 'Medio', effort: 'Bajo' }
    ]
  },
  4: {
    title: 'Soporte al Cliente',
    savings: '45%', timeSaved: '20min',
    recommendations: [
      { action: 'Chatbot IA nivel 1', desc: 'Resolver consultas frecuentes automáticamente con NLP antes de escalar', impact: 'Alto', effort: 'Medio' },
      { action: 'Clasificación ML', desc: 'Clasificar y priorizar tickets automáticamente con machine learning', impact: 'Alto', effort: 'Bajo' },
      { action: 'Base de conocimiento', desc: 'Sugerir soluciones al agente basadas en tickets similares resueltos', impact: 'Medio', effort: 'Medio' }
    ]
  }
}

function AIDashboardView() {
  const { t } = useLanguage()
  const [activeModule, setActiveModule] = useState('overview')
  const [stats, setStats] = useState({
    documentsProcessed: 1247,
    processesDiscovered: 32,
    tasksAutomated: 156,
    timeSaved: '342h',
    accuracy: '96.8%',
    activeAgents: 8
  })

  // Process Mining
  const [processData, setProcessData] = useState([
    { id: 1, name: 'Proceso de Facturación', variants: 12, cases: 3420, avgTime: '4.2h', bottleneck: 'Aprobación manual' },
    { id: 2, name: 'Onboarding de Clientes', variants: 8, cases: 890, avgTime: '2.1 días', bottleneck: 'Verificación documentos' },
    { id: 3, name: 'Gestión de Pedidos', variants: 15, cases: 5670, avgTime: '6.5h', bottleneck: 'Stock checking' },
    { id: 4, name: 'Soporte al Cliente', variants: 6, cases: 2340, avgTime: '45min', bottleneck: 'Escalación nivel 2' }
  ])
  const [selectedProcess, setSelectedProcess] = useState(null)
  const [showOptimizeModal, setShowOptimizeModal] = useState(null)
  const [showImportLogModal, setShowImportLogModal] = useState(false)
  const [showNewAnalysisModal, setShowNewAnalysisModal] = useState(false)
  const [newAnalysisName, setNewAnalysisName] = useState('')

  // Task Mining
  const [taskData, setTaskData] = useState([
    { id: 1, task: 'Copiar datos entre sistemas', frequency: 234, avgTime: '3.2min', automatable: 95, priority: 'Alta', status: 'pending' },
    { id: 2, task: 'Validar información de cliente', frequency: 189, avgTime: '5.1min', automatable: 78, priority: 'Alta', status: 'pending' },
    { id: 3, task: 'Generar reportes mensuales', frequency: 45, avgTime: '25min', automatable: 92, priority: 'Media', status: 'pending' },
    { id: 4, task: 'Actualizar inventario', frequency: 312, avgTime: '2.8min', automatable: 88, priority: 'Alta', status: 'pending' },
    { id: 5, task: 'Enviar notificaciones', frequency: 567, avgTime: '1.5min', automatable: 98, priority: 'Media', status: 'pending' }
  ])
  const [isRecording, setIsRecording] = useState(false)
  const [recordingTime, setRecordingTime] = useState(0)

  // Document Understanding
  const [documentTypes] = useState([
    { type: 'Facturas', icon: 'fa-file-invoice-dollar', count: 4523, accuracy: 98.2, color: '#22c55e' },
    { type: 'Contratos', icon: 'fa-file-contract', count: 892, accuracy: 94.5, color: '#3b82f6' },
    { type: 'Órdenes de Compra', icon: 'fa-shopping-cart', count: 2341, accuracy: 97.1, color: '#8b5cf6' },
    { type: 'Formularios', icon: 'fa-wpforms', count: 1567, accuracy: 95.8, color: '#f59e0b' },
    { type: 'Recibos', icon: 'fa-receipt', count: 3789, accuracy: 96.9, color: '#ec4899' },
    { type: 'ID Documents', icon: 'fa-id-card', count: 678, accuracy: 99.1, color: '#06b6d4' }
  ])
  const [isTraining, setIsTraining] = useState(false)
  const [trainingProgress, setTrainingProgress] = useState(0)
  const [isProcessingDocs, setIsProcessingDocs] = useState(false)
  const [processedCount, setProcessedCount] = useState(0)

  // Agentic Automation
  const [agents, setAgents] = useState([
    { id: 1, name: 'Agente de Facturación', status: 'active', tasks: 45, success: 98.5, lastRun: 'Hace 5 min' },
    { id: 2, name: 'Agente de Emails', status: 'active', tasks: 123, success: 97.2, lastRun: 'Hace 2 min' },
    { id: 3, name: 'Agente de Datos', status: 'paused', tasks: 78, success: 99.1, lastRun: 'Hace 1 hora' },
    { id: 4, name: 'Agente de Reportes', status: 'active', tasks: 34, success: 96.8, lastRun: 'Hace 15 min' },
    { id: 5, name: 'Agente de Inventario', status: 'error', tasks: 12, success: 85.3, lastRun: 'Hace 30 min' }
  ])
  const [showAgentConfig, setShowAgentConfig] = useState(null)
  const [showAgentHistory, setShowAgentHistory] = useState(null)

  // Communications Mining
  const [communications] = useState({
    emails: { total: 12450, sentiment: { positive: 45, neutral: 42, negative: 13 }, topics: ['Soporte', 'Ventas', 'Facturación'] },
    chats: { total: 8920, sentiment: { positive: 52, neutral: 38, negative: 10 }, topics: ['Preguntas', 'Quejas', 'Solicitudes'] },
    calls: { total: 3420, sentiment: { positive: 48, neutral: 40, negative: 12 }, topics: ['Consultas', 'Reclamos', 'Ventas'] }
  })
  const [showConnectModal, setShowConnectModal] = useState(false)
  const [connectedSources, setConnectedSources] = useState(['Gmail'])

  // Test Suite
  const [testStats, setTestStats] = useState({ total: 156, passed: 142, failed: 8, skipped: 6 })
  const [isRunningTests, setIsRunningTests] = useState(false)
  const [testProgress, setTestProgress] = useState(0)

  // Global modals
  const [showMetricsModal, setShowMetricsModal] = useState(false)
  const [notification, setNotification] = useState(null)

  // IA Interactiva (Chat)
  const [chatMessages, setChatMessages] = useState([])
  const [chatInput, setChatInput] = useState('')
  const [chatImages, setChatImages] = useState([])
  const [isSendingChat, setIsSendingChat] = useState(false)
  const [chatSessions, setChatSessions] = useState(() => {
    try { return JSON.parse(localStorage.getItem('alqvimia-chat-sessions') || '[]') } catch { return [] }
  })
  const [showSaveDropdown, setShowSaveDropdown] = useState(null)
  const [chatErrorModal, setChatErrorModal] = useState(null) // { title, message }
  const chatEndRef = useRef(null)
  const chatInputRef = useRef(null)
  const chatFileRef = useRef(null)

  const modules = [
    { id: 'overview', name: 'Overview', icon: 'fa-th-large', color: '#6366f1' },
    { id: 'ai-chat', name: 'IA Interactiva', icon: 'fa-magic', color: '#10b981' },
    { id: 'process-mining', name: 'Process Mining', icon: 'fa-project-diagram', color: '#22c55e' },
    { id: 'task-mining', name: 'Task Mining', icon: 'fa-tasks', color: '#3b82f6' },
    { id: 'document-understanding', name: 'Document Understanding', icon: 'fa-file-invoice', color: '#8b5cf6' },
    { id: 'agentic-automation', name: 'Agentic Automation', icon: 'fa-robot', color: '#f59e0b' },
    { id: 'communications-mining', name: 'Communications Mining', icon: 'fa-comments', color: '#ec4899' },
    { id: 'test-suite', name: 'Test Suite', icon: 'fa-vial', color: '#06b6d4' }
  ]

  // Notification helper
  const showNotif = useCallback((message, type = 'success') => {
    setNotification({ message, type })
    setTimeout(() => setNotification(null), 3000)
  }, [])

  // === HANDLERS ===

  // Process Mining handlers
  const handleImportLog = useCallback(() => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.csv,.xlsx,.xes,.json'
    input.onchange = (e) => {
      const file = e.target.files[0]
      if (file) {
        showNotif(`Log "${file.name}" importado correctamente. Analizando ${Math.floor(Math.random() * 5000 + 1000)} eventos...`)
        setShowImportLogModal(false)
      }
    }
    input.click()
  }, [showNotif])

  const handleNewAnalysis = useCallback(() => {
    if (!newAnalysisName.trim()) return
    const newProcess = {
      id: Date.now(),
      name: newAnalysisName.trim(),
      variants: Math.floor(Math.random() * 10 + 3),
      cases: Math.floor(Math.random() * 3000 + 500),
      avgTime: `${(Math.random() * 8 + 1).toFixed(1)}h`,
      bottleneck: 'Analizando...'
    }
    setProcessData(prev => [...prev, newProcess])
    setNewAnalysisName('')
    setShowNewAnalysisModal(false)
    showNotif(`Análisis "${newProcess.name}" creado. Descubriendo variantes de proceso...`)
  }, [newAnalysisName, showNotif])

  // Task Mining handlers
  const handleStartRecording = useCallback(() => {
    setIsRecording(true)
    setRecordingTime(0)
    const interval = setInterval(() => {
      setRecordingTime(prev => {
        if (prev >= 30) {
          clearInterval(interval)
          setIsRecording(false)
          showNotif('Grabación completada. Se detectaron 3 nuevas tareas repetitivas.')
          setTaskData(prev => [...prev, {
            id: Date.now(),
            task: 'Nueva tarea detectada (grabación)',
            frequency: Math.floor(Math.random() * 200 + 50),
            avgTime: `${(Math.random() * 5 + 1).toFixed(1)}min`,
            automatable: Math.floor(Math.random() * 30 + 70),
            priority: 'Alta',
            status: 'pending'
          }])
          return 0
        }
        return prev + 1
      })
    }, 1000)
  }, [showNotif])

  const handleAutomateTask = useCallback((taskId) => {
    setTaskData(prev => prev.map(t =>
      t.id === taskId ? { ...t, status: 'automating' } : t
    ))
    setTimeout(() => {
      setTaskData(prev => prev.map(t =>
        t.id === taskId ? { ...t, status: 'automated' } : t
      ))
      setStats(prev => ({ ...prev, tasksAutomated: prev.tasksAutomated + 1 }))
      showNotif('Tarea automatizada exitosamente. Workflow creado en Alqvimia.')
    }, 2000)
  }, [showNotif])

  // Document Understanding handlers
  const handleTrainModel = useCallback(() => {
    setIsTraining(true)
    setTrainingProgress(0)
    const interval = setInterval(() => {
      setTrainingProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval)
          setIsTraining(false)
          showNotif('Modelo entrenado exitosamente. Precisión mejorada en +1.2%')
          return 0
        }
        return prev + Math.floor(Math.random() * 15 + 5)
      })
    }, 500)
  }, [showNotif])

  const handleProcessDocuments = useCallback(() => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.pdf,.png,.jpg,.jpeg,.tiff'
    input.multiple = true
    input.onchange = (e) => {
      const files = e.target.files
      if (files.length) {
        setIsProcessingDocs(true)
        setProcessedCount(0)
        let count = 0
        const interval = setInterval(() => {
          count++
          setProcessedCount(count)
          if (count >= files.length) {
            clearInterval(interval)
            setIsProcessingDocs(false)
            setStats(prev => ({ ...prev, documentsProcessed: prev.documentsProcessed + files.length }))
            showNotif(`${files.length} documento(s) procesado(s) exitosamente.`)
          }
        }, 800)
      }
    }
    input.click()
  }, [showNotif])

  // Agent handlers
  const handleToggleAgent = useCallback((agentId) => {
    setAgents(prev => prev.map(a => {
      if (a.id !== agentId) return a
      const newStatus = a.status === 'active' ? 'paused' : 'active'
      return { ...a, status: newStatus, lastRun: 'Ahora' }
    }))
    showNotif('Estado del agente actualizado.')
  }, [showNotif])

  // Test Suite handlers
  const handleRunTests = useCallback(() => {
    setIsRunningTests(true)
    setTestProgress(0)
    const total = testStats.total
    let current = 0
    const interval = setInterval(() => {
      current += Math.floor(Math.random() * 8 + 3)
      if (current >= total) {
        current = total
        clearInterval(interval)
        const passed = Math.floor(total * (0.88 + Math.random() * 0.1))
        const failed = Math.floor((total - passed) * 0.6)
        const skipped = total - passed - failed
        setTestStats({ total, passed, failed, skipped })
        setIsRunningTests(false)
        showNotif(`Suite completada: ${passed} pasados, ${failed} fallados, ${skipped} omitidos.`)
      }
      setTestProgress(Math.min(current, total))
    }, 200)
  }, [testStats.total, showNotif])

  const handleConnectSource = useCallback((source) => {
    if (connectedSources.includes(source)) {
      setConnectedSources(prev => prev.filter(s => s !== source))
      showNotif(`${source} desconectado.`)
    } else {
      setConnectedSources(prev => [...prev, source])
      showNotif(`${source} conectado exitosamente.`)
    }
  }, [connectedSources, showNotif])

  // === IA INTERACTIVA HANDLERS ===

  // Auto-scroll al último mensaje
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [chatMessages])

  const handleSendChat = useCallback(async () => {
    if (!chatInput.trim() && chatImages.length === 0) return
    if (isSendingChat) return

    const userMessage = {
      role: 'user',
      content: chatInput.trim(),
      images: chatImages.map(img => ({ data: img.data, name: img.name })),
      timestamp: new Date().toISOString()
    }

    setChatMessages(prev => [...prev, userMessage])
    setChatInput('')
    setChatImages([])
    setIsSendingChat(true)

    try {
      const history = chatMessages.map(m => ({
        role: m.role,
        content: m.content,
        images: m.images
      }))

      const res = await aiService.chat(userMessage.content, userMessage.images, history)

      if (res.success && res.data?.response) {
        setChatMessages(prev => [...prev, {
          role: 'assistant',
          content: res.data.response,
          timestamp: new Date().toISOString(),
          usage: res.data.usage,
          model: res.data.model
        }])
      } else {
        const errorMsg = res.error || res.data?.error || 'No se pudo obtener respuesta.'
        setChatErrorModal({ title: 'Error de IA', message: errorMsg })
      }
    } catch (err) {
      const errorMsg = err.message || 'No se pudo conectar con el servidor.'
      let title = 'Error'
      let message = errorMsg

      if (errorMsg.includes('413') || errorMsg.includes('too large') || errorMsg.includes('payload')) {
        title = 'Imagen demasiado grande'
        message = 'La imagen es muy pesada para enviar. Intenta con una imagen mas pequena o comprimida (PNG/JPG).'
      } else if (errorMsg.includes('Network') || errorMsg.includes('red') || errorMsg.includes('ECONNREFUSED')) {
        title = 'Error de conexion'
        message = 'No se pudo conectar con el servidor.\n\n- Verifica que el servidor este corriendo (run.bat)\n- Revisa que el puerto 4000 este disponible\n- Configura tu API Key en el boton "API Keys" arriba'
      } else if (errorMsg.includes('API Key') || errorMsg.includes('authentication') || errorMsg.includes('401')) {
        title = 'API Key invalida'
        message = 'Tu API Key es invalida o ha expirado. Haz clic en "API Keys" para configurar una nueva.'
      }

      setChatErrorModal({ title, message })
    }

    setIsSendingChat(false)
  }, [chatInput, chatImages, chatMessages, isSendingChat])

  const handlePasteImage = useCallback((e) => {
    const items = e.clipboardData?.items
    if (!items) return

    for (const item of items) {
      if (item.type.startsWith('image/')) {
        e.preventDefault()
        const file = item.getAsFile()
        const reader = new FileReader()
        reader.onload = (ev) => {
          setChatImages(prev => [...prev, {
            data: ev.target.result,
            preview: ev.target.result,
            name: file.name || `imagen_${Date.now()}.png`
          }])
        }
        reader.readAsDataURL(file)
      }
    }
  }, [])

  const handleAttachFile = useCallback(() => {
    chatFileRef.current?.click()
  }, [])

  const handleFileAttach = useCallback((e) => {
    const files = Array.from(e.target.files || [])
    files.forEach(file => {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader()
        reader.onload = (ev) => {
          setChatImages(prev => [...prev, {
            data: ev.target.result,
            preview: ev.target.result,
            name: file.name
          }])
        }
        reader.readAsDataURL(file)
      }
    })
    e.target.value = ''
  }, [])

  const handleCopyResponse = useCallback((text) => {
    navigator.clipboard.writeText(text).then(() => {
      showNotif('Copiado al portapapeles')
    }).catch(() => {
      // Fallback
      const ta = document.createElement('textarea')
      ta.value = text
      document.body.appendChild(ta)
      ta.select()
      document.execCommand('copy')
      document.body.removeChild(ta)
      showNotif('Copiado al portapapeles')
    })
  }, [showNotif])

  const handleSaveAsDocument = useCallback((content, format) => {
    const now = new Date()
    const dateStr = now.toISOString().slice(0, 10)
    let blob, filename
    switch (format) {
      case 'md':
        blob = new Blob([content], { type: 'text/markdown' })
        filename = `alqvimia-ia-${dateStr}.md`
        break
      case 'html':
        blob = new Blob([`<!DOCTYPE html><html><head><meta charset="utf-8"><title>Alqvimia IA</title><style>body{font-family:system-ui;max-width:800px;margin:2rem auto;padding:1rem;}</style></head><body>${content.replace(/\n/g, '<br>')}</body></html>`], { type: 'text/html' })
        filename = `alqvimia-ia-${dateStr}.html`
        break
      case 'json':
        blob = new Blob([JSON.stringify({ content, generatedAt: now.toISOString(), source: 'Alqvimia IA' }, null, 2)], { type: 'application/json' })
        filename = `alqvimia-ia-${dateStr}.json`
        break
      default:
        blob = new Blob([content], { type: 'text/plain' })
        filename = `alqvimia-ia-${dateStr}.txt`
    }
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    a.click()
    URL.revokeObjectURL(url)
    setShowSaveDropdown(null)
    showNotif(`Guardado como ${filename}`)
  }, [showNotif])

  const handleNewChat = useCallback(() => {
    if (chatMessages.length > 0) {
      const session = {
        id: Date.now(),
        name: chatMessages[0]?.content?.slice(0, 40) || 'Conversación',
        messages: chatMessages,
        createdAt: new Date().toISOString()
      }
      const updated = [session, ...chatSessions].slice(0, 20)
      setChatSessions(updated)
      localStorage.setItem('alqvimia-chat-sessions', JSON.stringify(updated))
    }
    setChatMessages([])
    setChatInput('')
    setChatImages([])
    showNotif('Nueva conversación iniciada')
  }, [chatMessages, chatSessions, showNotif])

  const handleLoadSession = useCallback((session) => {
    setChatMessages(session.messages || [])
    showNotif(`Sesión "${session.name}" cargada`)
  }, [showNotif])

  // Renderizar markdown básico
  const renderMarkdown = useCallback((text) => {
    if (!text) return ''
    let html = text
      // Code blocks
      .replace(/```(\w*)\n([\s\S]*?)```/g, (_, lang, code) =>
        `<pre class="chat-code-block" data-lang="${lang}"><code>${code.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</code></pre>`)
      // Inline code
      .replace(/`([^`]+)`/g, '<code class="chat-inline-code">$1</code>')
      // Bold
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      // Italic
      .replace(/\*(.+?)\*/g, '<em>$1</em>')
      // Headers
      .replace(/^### (.+)$/gm, '<h4 style="margin:0.8rem 0 0.3rem;color:var(--text-primary)">$1</h4>')
      .replace(/^## (.+)$/gm, '<h3 style="margin:1rem 0 0.4rem;color:var(--text-primary)">$1</h3>')
      .replace(/^# (.+)$/gm, '<h2 style="margin:1rem 0 0.5rem;color:var(--text-primary)">$1</h2>')
      // Lists
      .replace(/^- (.+)$/gm, '<li style="margin-left:1rem">$1</li>')
      .replace(/^(\d+)\. (.+)$/gm, '<li style="margin-left:1rem">$2</li>')
      // Links
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" style="color:var(--primary-color)">$1</a>')
      // Line breaks
      .replace(/\n/g, '<br/>')
    return html
  }, [])

  // === RENDER FUNCTIONS ===

  const renderOverview = () => (
    <>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
        {[
          { label: 'Documentos Procesados', value: stats.documentsProcessed.toLocaleString(), icon: 'fa-file-alt', color: '#6366f1' },
          { label: 'Procesos Descubiertos', value: stats.processesDiscovered, icon: 'fa-sitemap', color: '#22c55e' },
          { label: 'Tareas Automatizadas', value: stats.tasksAutomated, icon: 'fa-cogs', color: '#3b82f6' },
          { label: 'Tiempo Ahorrado', value: stats.timeSaved, icon: 'fa-clock', color: '#f59e0b' },
          { label: 'Precisión Promedio', value: stats.accuracy, icon: 'fa-bullseye', color: '#ec4899' },
          { label: 'Agentes Activos', value: agents.filter(a => a.status === 'active').length, icon: 'fa-robot', color: '#8b5cf6' }
        ].map((stat, idx) => (
          <div key={idx} style={{ background: 'var(--dark-bg)', borderRadius: '16px', padding: '1.5rem', border: '1px solid var(--border-color)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ width: '56px', height: '56px', borderRadius: '12px', background: `linear-gradient(135deg, ${stat.color}, ${stat.color}aa)`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <i className={`fas ${stat.icon}`} style={{ fontSize: '1.5rem', color: 'white' }}></i>
              </div>
              <div>
                <div style={{ fontSize: '1.75rem', fontWeight: '700', color: 'var(--text-primary)' }}>{stat.value}</div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{stat.label}</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <h3 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <i className="fas fa-rocket" style={{ color: 'var(--primary-color)' }}></i>
        Módulos de IA/ML
      </h3>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
        {modules.filter(m => m.id !== 'overview').map(module => (
          <button key={module.id} onClick={() => setActiveModule(module.id)} style={{ background: 'var(--dark-bg)', border: '2px solid var(--border-color)', borderRadius: '16px', padding: '1.5rem', cursor: 'pointer', textAlign: 'left', transition: 'all 0.3s', position: 'relative', overflow: 'hidden' }}
            onMouseOver={(e) => { e.currentTarget.style.borderColor = module.color; e.currentTarget.style.transform = 'translateY(-4px)' }}
            onMouseOut={(e) => { e.currentTarget.style.borderColor = 'var(--border-color)'; e.currentTarget.style.transform = 'translateY(0)' }}
          >
            <div style={{ position: 'absolute', top: 0, right: 0, width: '100px', height: '100px', background: `linear-gradient(135deg, ${module.color}20, transparent)`, borderRadius: '0 16px 0 100%' }}></div>
            <i className={`fas ${module.icon}`} style={{ fontSize: '2.5rem', color: module.color, marginBottom: '1rem' }}></i>
            <h4 style={{ margin: '0 0 0.5rem', color: 'var(--text-primary)', fontSize: '1.1rem' }}>{module.name}</h4>
            <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
              {module.id === 'ai-chat' && 'Chat interactivo: texto, imagenes, documentos'}
              {module.id === 'process-mining' && 'Descubre y analiza procesos de negocio'}
              {module.id === 'task-mining' && 'Identifica tareas automatizables'}
              {module.id === 'document-understanding' && 'Extrae datos de documentos con IA'}
              {module.id === 'agentic-automation' && 'Agentes autónomos inteligentes'}
              {module.id === 'communications-mining' && 'Analiza emails, chats y llamadas'}
              {module.id === 'test-suite' && 'Pruebas automatizadas con IA'}
            </p>
          </button>
        ))}
      </div>
    </>
  )

  const renderProcessFlow = () => {
    if (!selectedProcess) return (
      <div style={{ background: 'var(--dark-bg)', borderRadius: '16px', padding: '2rem', border: '1px solid var(--border-color)', textAlign: 'center' }}>
        <i className="fas fa-project-diagram" style={{ fontSize: '4rem', color: 'var(--text-muted)', marginBottom: '1rem' }}></i>
        <h4 style={{ color: 'var(--text-primary)' }}>Visualización de Procesos</h4>
        <p style={{ color: 'var(--text-secondary)' }}>Selecciona un proceso y haz clic en "Ver Mapa" para ver su flujo interactivo</p>
      </div>
    )

    const flow = processFlows[selectedProcess.id] || processFlows[1]
    const process = processData.find(p => p.id === selectedProcess.id)

    return (
      <div style={{ background: 'var(--dark-bg)', borderRadius: '16px', padding: '1.5rem', border: '2px solid #22c55e' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h4 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-primary)' }}>
            <i className="fas fa-project-diagram" style={{ color: '#22c55e' }}></i>
            Mapa de Proceso: {process?.name}
          </h4>
          <button className="btn btn-sm btn-secondary" onClick={() => setSelectedProcess(null)}>
            <i className="fas fa-times"></i> Cerrar
          </button>
        </div>

        {/* Flow Diagram */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', overflowX: 'auto', padding: '1rem 0' }}>
          {flow.map((step, idx) => (
            <div key={step.id} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <div style={{
                minWidth: '130px',
                padding: '1rem',
                borderRadius: '12px',
                border: step.bottleneck ? '2px solid #ef4444' : '2px solid var(--border-color)',
                background: step.bottleneck ? 'rgba(239, 68, 68, 0.1)' : step.auto ? 'rgba(34, 197, 94, 0.08)' : 'var(--bg-secondary)',
                textAlign: 'center',
                position: 'relative',
                transition: 'all 0.3s'
              }}>
                {step.bottleneck && (
                  <div style={{ position: 'absolute', top: '-10px', right: '-10px', background: '#ef4444', color: 'white', borderRadius: '50%', width: '22px', height: '22px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem' }}>
                    <i className="fas fa-exclamation"></i>
                  </div>
                )}
                {step.auto && !step.bottleneck && (
                  <div style={{ position: 'absolute', top: '-10px', right: '-10px', background: '#22c55e', color: 'white', borderRadius: '50%', width: '22px', height: '22px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem' }}>
                    <i className="fas fa-bolt"></i>
                  </div>
                )}
                <i className={`fas ${step.icon}`} style={{ fontSize: '1.5rem', color: step.bottleneck ? '#ef4444' : step.auto ? '#22c55e' : 'var(--text-secondary)', marginBottom: '0.5rem' }}></i>
                <div style={{ fontSize: '0.8rem', fontWeight: '600', color: 'var(--text-primary)', marginBottom: '0.25rem' }}>{step.name}</div>
                <div style={{ fontSize: '0.7rem', color: step.bottleneck ? '#ef4444' : 'var(--text-secondary)', fontWeight: step.bottleneck ? '600' : '400' }}>{step.time}</div>
              </div>
              {idx < flow.length - 1 && (
                <i className="fas fa-arrow-right" style={{ color: 'var(--text-muted)', fontSize: '1.2rem' }}></i>
              )}
            </div>
          ))}
        </div>

        {/* Legend */}
        <div style={{ display: 'flex', gap: '1.5rem', marginTop: '1rem', padding: '0.75rem 1rem', background: 'var(--bg-secondary)', borderRadius: '8px' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
            <span style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#22c55e' }}></span> Automatizado
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
            <span style={{ width: '12px', height: '12px', borderRadius: '50%', background: 'var(--text-muted)' }}></span> Manual
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
            <span style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#ef4444' }}></span> Cuello de botella
          </span>
        </div>
      </div>
    )
  }

  const renderProcessMining = () => (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div>
          <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <i className="fas fa-project-diagram" style={{ color: '#22c55e' }}></i> Process Mining
          </h3>
          <p style={{ margin: '0.25rem 0 0', color: 'var(--text-secondary)' }}>Descubre, analiza y optimiza tus procesos de negocio</p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button className="btn btn-secondary" onClick={handleImportLog}><i className="fas fa-upload"></i> Importar Log</button>
          <button className="btn btn-primary" onClick={() => setShowNewAnalysisModal(true)} style={{ background: '#22c55e', borderColor: '#22c55e' }}>
            <i className="fas fa-play"></i> Nuevo Análisis
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
        {processData.map(process => (
          <div key={process.id} style={{ background: 'var(--dark-bg)', borderRadius: '16px', padding: '1.5rem', border: selectedProcess?.id === process.id ? '2px solid #22c55e' : '1px solid var(--border-color)', transition: 'all 0.3s' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
              <h4 style={{ margin: 0, color: 'var(--text-primary)' }}>{process.name}</h4>
              <span style={{ background: 'rgba(34, 197, 94, 0.2)', color: '#22c55e', padding: '0.25rem 0.75rem', borderRadius: '20px', fontSize: '0.75rem' }}>{process.variants} variantes</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem', marginBottom: '1rem' }}>
              <div>
                <div style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>Casos analizados</div>
                <div style={{ color: 'var(--text-primary)', fontSize: '1.25rem', fontWeight: '600' }}>{process.cases.toLocaleString()}</div>
              </div>
              <div>
                <div style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>Tiempo promedio</div>
                <div style={{ color: 'var(--text-primary)', fontSize: '1.25rem', fontWeight: '600' }}>{process.avgTime}</div>
              </div>
            </div>
            <div style={{ background: 'rgba(239, 68, 68, 0.1)', borderRadius: '8px', padding: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <i className="fas fa-exclamation-triangle" style={{ color: '#ef4444' }}></i>
              <span style={{ color: '#ef4444', fontSize: '0.85rem' }}>Cuello de botella: {process.bottleneck}</span>
            </div>
            <div style={{ marginTop: '1rem', display: 'flex', gap: '0.5rem' }}>
              <button className="btn btn-sm btn-secondary" style={{ flex: 1 }} onClick={() => setSelectedProcess(process)}>
                <i className="fas fa-sitemap"></i> Ver Mapa
              </button>
              <button className="btn btn-sm btn-primary" style={{ flex: 1, background: '#22c55e', borderColor: '#22c55e' }} onClick={() => setShowOptimizeModal(process.id)}>
                <i className="fas fa-magic"></i> Optimizar
              </button>
            </div>
          </div>
        ))}
      </div>

      {renderProcessFlow()}
    </div>
  )

  const renderTaskMining = () => (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div>
          <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <i className="fas fa-tasks" style={{ color: '#3b82f6' }}></i> Task Mining
          </h3>
          <p style={{ margin: '0.25rem 0 0', color: 'var(--text-secondary)' }}>Descubre tareas repetitivas candidatas para automatización</p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button className={`btn ${isRecording ? 'btn-danger' : 'btn-secondary'}`} onClick={isRecording ? () => setIsRecording(false) : handleStartRecording} style={isRecording ? { background: '#ef4444', borderColor: '#ef4444', color: 'white', animation: 'pulse 1.5s infinite' } : {}}>
            <i className={`fas ${isRecording ? 'fa-stop' : 'fa-desktop'}`}></i> {isRecording ? `Grabando... ${recordingTime}s` : 'Iniciar Grabación'}
          </button>
          <button className="btn btn-primary" style={{ background: '#3b82f6', borderColor: '#3b82f6' }} onClick={() => showNotif('Análisis de tareas iniciado. Escaneando patrones de usuario...')}>
            <i className="fas fa-search"></i> Analizar Tareas
          </button>
        </div>
      </div>

      <div style={{ background: 'var(--dark-bg)', borderRadius: '16px', border: '1px solid var(--border-color)', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: 'var(--bg-tertiary)' }}>
              <th style={{ padding: '1rem', textAlign: 'left', color: 'var(--text-secondary)' }}>Tarea Detectada</th>
              <th style={{ padding: '1rem', textAlign: 'center', color: 'var(--text-secondary)' }}>Frecuencia/día</th>
              <th style={{ padding: '1rem', textAlign: 'center', color: 'var(--text-secondary)' }}>Tiempo Prom.</th>
              <th style={{ padding: '1rem', textAlign: 'center', color: 'var(--text-secondary)' }}>Automatizable</th>
              <th style={{ padding: '1rem', textAlign: 'center', color: 'var(--text-secondary)' }}>Prioridad</th>
              <th style={{ padding: '1rem', textAlign: 'center', color: 'var(--text-secondary)' }}>Acción</th>
            </tr>
          </thead>
          <tbody>
            {taskData.map(task => (
              <tr key={task.id} style={{ borderTop: '1px solid var(--border-color)' }}>
                <td style={{ padding: '1rem', color: 'var(--text-primary)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <i className="fas fa-mouse-pointer" style={{ color: '#3b82f6' }}></i>
                    {task.task}
                  </div>
                </td>
                <td style={{ padding: '1rem', textAlign: 'center', color: 'var(--text-primary)', fontWeight: '600' }}>{task.frequency}x</td>
                <td style={{ padding: '1rem', textAlign: 'center', color: 'var(--text-secondary)' }}>{task.avgTime}</td>
                <td style={{ padding: '1rem', textAlign: 'center' }}>
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: task.automatable >= 90 ? 'rgba(34, 197, 94, 0.2)' : task.automatable >= 70 ? 'rgba(245, 158, 11, 0.2)' : 'rgba(239, 68, 68, 0.2)', color: task.automatable >= 90 ? '#22c55e' : task.automatable >= 70 ? '#f59e0b' : '#ef4444', padding: '0.25rem 0.75rem', borderRadius: '20px', fontWeight: '600' }}>
                    {task.automatable}%
                  </div>
                </td>
                <td style={{ padding: '1rem', textAlign: 'center' }}>
                  <span style={{ background: task.priority === 'Alta' ? 'rgba(239, 68, 68, 0.2)' : 'rgba(245, 158, 11, 0.2)', color: task.priority === 'Alta' ? '#ef4444' : '#f59e0b', padding: '0.25rem 0.75rem', borderRadius: '6px', fontSize: '0.8rem', fontWeight: '500' }}>{task.priority}</span>
                </td>
                <td style={{ padding: '1rem', textAlign: 'center' }}>
                  {task.status === 'automated' ? (
                    <span style={{ color: '#22c55e', fontWeight: '600', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                      <i className="fas fa-check-circle"></i> Automatizada
                    </span>
                  ) : task.status === 'automating' ? (
                    <span style={{ color: '#3b82f6', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                      <i className="fas fa-spinner fa-spin"></i> Creando...
                    </span>
                  ) : (
                    <button className="btn btn-sm btn-primary" style={{ background: '#3b82f6', borderColor: '#3b82f6' }} onClick={() => handleAutomateTask(task.id)}>
                      <i className="fas fa-robot"></i> Automatizar
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div style={{ marginTop: '2rem', background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(139, 92, 246, 0.1))', borderRadius: '16px', padding: '1.5rem', border: '1px solid rgba(59, 130, 246, 0.3)' }}>
        <h4 style={{ margin: '0 0 1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <i className="fas fa-calculator" style={{ color: '#3b82f6' }}></i> Potencial de Ahorro Estimado
        </h4>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem' }}>
          <div style={{ textAlign: 'center' }}><div style={{ fontSize: '2rem', fontWeight: '700', color: '#22c55e' }}>847h</div><div style={{ color: 'var(--text-secondary)' }}>Horas/mes ahorrables</div></div>
          <div style={{ textAlign: 'center' }}><div style={{ fontSize: '2rem', fontWeight: '700', color: '#3b82f6' }}>$42,350</div><div style={{ color: 'var(--text-secondary)' }}>Ahorro estimado/mes</div></div>
          <div style={{ textAlign: 'center' }}><div style={{ fontSize: '2rem', fontWeight: '700', color: '#8b5cf6' }}>3.2 meses</div><div style={{ color: 'var(--text-secondary)' }}>ROI estimado</div></div>
        </div>
      </div>
    </div>
  )

  const renderDocumentUnderstanding = () => (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div>
          <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <i className="fas fa-file-invoice" style={{ color: '#8b5cf6' }}></i> Document Understanding (IDP)
          </h3>
          <p style={{ margin: '0.25rem 0 0', color: 'var(--text-secondary)' }}>Procesamiento Inteligente de Documentos con Machine Learning</p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button className="btn btn-secondary" onClick={handleTrainModel} disabled={isTraining}>
            {isTraining ? <><i className="fas fa-spinner fa-spin"></i> Entrenando... {Math.min(trainingProgress, 100)}%</> : <><i className="fas fa-graduation-cap"></i> Entrenar Modelo</>}
          </button>
          <button className="btn btn-primary" onClick={handleProcessDocuments} disabled={isProcessingDocs} style={{ background: '#8b5cf6', borderColor: '#8b5cf6' }}>
            {isProcessingDocs ? <><i className="fas fa-spinner fa-spin"></i> Procesando... ({processedCount})</> : <><i className="fas fa-upload"></i> Procesar Documentos</>}
          </button>
        </div>
      </div>

      {(isTraining || isProcessingDocs) && (
        <div style={{ marginBottom: '1.5rem', background: 'var(--dark-bg)', borderRadius: '12px', padding: '1rem', border: '1px solid var(--border-color)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
            <span style={{ color: 'var(--text-primary)', fontWeight: '600' }}>{isTraining ? 'Entrenando modelo ML...' : 'Procesando documentos...'}</span>
            <span style={{ color: '#8b5cf6', fontWeight: '600' }}>{isTraining ? `${Math.min(trainingProgress, 100)}%` : `${processedCount} docs`}</span>
          </div>
          <div style={{ height: '6px', background: 'var(--bg-secondary)', borderRadius: '3px', overflow: 'hidden' }}>
            <div style={{ width: isTraining ? `${Math.min(trainingProgress, 100)}%` : '100%', height: '100%', background: 'linear-gradient(90deg, #8b5cf6, #6366f1)', transition: 'width 0.3s', animation: isProcessingDocs ? 'pulse 1s infinite' : 'none' }}></div>
          </div>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
        {documentTypes.map((doc, idx) => (
          <div key={idx} style={{ background: 'var(--dark-bg)', borderRadius: '16px', padding: '1.25rem', border: '1px solid var(--border-color)', textAlign: 'center', cursor: 'pointer', transition: 'all 0.3s' }}>
            <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: `${doc.color}20`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
              <i className={`fas ${doc.icon}`} style={{ fontSize: '1.5rem', color: doc.color }}></i>
            </div>
            <h4 style={{ margin: '0 0 0.5rem', color: 'var(--text-primary)', fontSize: '0.95rem' }}>{doc.type}</h4>
            <div style={{ fontSize: '1.5rem', fontWeight: '700', color: doc.color }}>{doc.count.toLocaleString()}</div>
            <div style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>documentos</div>
            <div style={{ marginTop: '0.75rem', padding: '0.25rem 0.5rem', background: 'rgba(34, 197, 94, 0.1)', borderRadius: '20px', fontSize: '0.75rem', color: '#22c55e' }}>{doc.accuracy}% precisión</div>
          </div>
        ))}
      </div>

      <div style={{ background: 'var(--dark-bg)', borderRadius: '16px', padding: '1.5rem', border: '1px solid var(--border-color)', marginBottom: '2rem' }}>
        <h4 style={{ margin: '0 0 1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><i className="fas fa-stream" style={{ color: '#8b5cf6' }}></i> Pipeline de Extracción</h4>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'relative' }}>
          {[
            { step: 1, name: 'Digitalización', icon: 'fa-scanner', desc: 'OCR y preprocesamiento' },
            { step: 2, name: 'Clasificación', icon: 'fa-tags', desc: 'ML clasifica tipo documento' },
            { step: 3, name: 'Extracción', icon: 'fa-magic', desc: 'NER extrae campos clave' },
            { step: 4, name: 'Validación', icon: 'fa-check-double', desc: 'Reglas de negocio y confianza' },
            { step: 5, name: 'Exportación', icon: 'fa-database', desc: 'Integración con sistemas' }
          ].map((item, idx) => (
            <div key={idx} style={{ textAlign: 'center', flex: 1, position: 'relative', zIndex: 1 }}>
              <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: 'linear-gradient(135deg, #8b5cf6, #6366f1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 0.75rem', boxShadow: '0 4px 12px rgba(139, 92, 246, 0.3)' }}>
                <i className={`fas ${item.icon}`} style={{ fontSize: '1.25rem', color: 'white' }}></i>
              </div>
              <div style={{ fontWeight: '600', color: 'var(--text-primary)', marginBottom: '0.25rem' }}>{item.name}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{item.desc}</div>
            </div>
          ))}
          <div style={{ position: 'absolute', top: '30px', left: '10%', right: '10%', height: '3px', background: 'linear-gradient(90deg, #8b5cf6, #6366f1)', zIndex: 0 }}></div>
        </div>
      </div>

      <div style={{ background: 'var(--dark-bg)', borderRadius: '16px', padding: '1.5rem', border: '1px solid var(--border-color)' }}>
        <h4 style={{ margin: '0 0 1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><i className="fas fa-list-alt" style={{ color: '#8b5cf6' }}></i> Campos Extraíbles (Ejemplo: Factura)</h4>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
          {['Número de Factura', 'Fecha', 'Proveedor', 'NIF/CIF', 'Dirección', 'Líneas de Producto', 'Subtotal', 'IVA', 'Total', 'Forma de Pago', 'Vencimiento', 'IBAN'].map((field, idx) => (
            <span key={idx} style={{ background: 'var(--bg-secondary)', padding: '0.5rem 1rem', borderRadius: '8px', color: 'var(--text-primary)', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <i className="fas fa-check" style={{ color: '#22c55e', fontSize: '0.7rem' }}></i> {field}
            </span>
          ))}
        </div>
      </div>
    </div>
  )

  const renderAgenticAutomation = () => (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div>
          <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}><i className="fas fa-robot" style={{ color: '#f59e0b' }}></i> Agentic Automation</h3>
          <p style={{ margin: '0.25rem 0 0', color: 'var(--text-secondary)' }}>Agentes autónomos inteligentes que trabajan por ti</p>
        </div>
        <button className="btn btn-primary" style={{ background: '#f59e0b', borderColor: '#f59e0b' }} onClick={() => {
          setAgents(prev => [...prev, { id: Date.now(), name: `Nuevo Agente ${prev.length + 1}`, status: 'paused', tasks: 0, success: 100, lastRun: 'Nunca' }])
          showNotif('Nuevo agente creado. Configúralo para empezar.')
        }}>
          <i className="fas fa-plus"></i> Crear Nuevo Agente
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
        {agents.map(agent => (
          <div key={agent.id} style={{ background: 'var(--dark-bg)', borderRadius: '16px', padding: '1.5rem', border: `2px solid ${agent.status === 'active' ? '#22c55e' : agent.status === 'paused' ? '#f59e0b' : '#ef4444'}` }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'linear-gradient(135deg, #f59e0b, #d97706)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <i className="fas fa-robot" style={{ fontSize: '1.25rem', color: 'white' }}></i>
                </div>
                <div>
                  <h4 style={{ margin: 0, color: 'var(--text-primary)' }}>{agent.name}</h4>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{agent.lastRun}</span>
                </div>
              </div>
              <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: agent.status === 'active' ? '#22c55e' : agent.status === 'paused' ? '#f59e0b' : '#ef4444', boxShadow: `0 0 10px ${agent.status === 'active' ? '#22c55e' : agent.status === 'paused' ? '#f59e0b' : '#ef4444'}` }}></div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem', marginBottom: '1rem' }}>
              <div><div style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>Tareas ejecutadas</div><div style={{ color: 'var(--text-primary)', fontSize: '1.25rem', fontWeight: '600' }}>{agent.tasks}</div></div>
              <div><div style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>Tasa de éxito</div><div style={{ color: agent.success >= 95 ? '#22c55e' : agent.success >= 85 ? '#f59e0b' : '#ef4444', fontSize: '1.25rem', fontWeight: '600' }}>{agent.success}%</div></div>
            </div>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button className={`btn btn-sm ${agent.status === 'active' ? 'btn-secondary' : 'btn-success'}`} style={{ flex: 1 }} onClick={() => handleToggleAgent(agent.id)}>
                <i className={`fas ${agent.status === 'active' ? 'fa-pause' : 'fa-play'}`}></i> {agent.status === 'active' ? 'Pausar' : 'Iniciar'}
              </button>
              <button className="btn btn-sm btn-primary" style={{ flex: 1 }} onClick={() => setShowAgentConfig(agent)}>
                <i className="fas fa-cog"></i> Configurar
              </button>
              <button className="btn btn-sm btn-secondary" onClick={() => setShowAgentHistory(agent)}>
                <i className="fas fa-history"></i>
              </button>
            </div>
          </div>
        ))}
      </div>

      <div style={{ background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.1), rgba(217, 119, 6, 0.05))', borderRadius: '16px', padding: '1.5rem', border: '1px solid rgba(245, 158, 11, 0.3)' }}>
        <h4 style={{ margin: '0 0 1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><i className="fas fa-magic" style={{ color: '#f59e0b' }}></i> Capacidades de los Agentes</h4>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
          {[
            { name: 'Toma de decisiones', icon: 'fa-brain' },
            { name: 'Manejo de excepciones', icon: 'fa-shield-alt' },
            { name: 'Aprendizaje continuo', icon: 'fa-graduation-cap' },
            { name: 'Colaboración multi-agente', icon: 'fa-users' },
            { name: 'Integración con LLMs', icon: 'fa-comments' },
            { name: 'Auto-optimización', icon: 'fa-chart-line' }
          ].map((cap, idx) => (
            <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem', background: 'var(--dark-bg)', borderRadius: '8px' }}>
              <i className={`fas ${cap.icon}`} style={{ color: '#f59e0b' }}></i>
              <span style={{ color: 'var(--text-primary)', fontSize: '0.9rem' }}>{cap.name}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )

  const renderCommunicationsMining = () => (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div>
          <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}><i className="fas fa-comments" style={{ color: '#ec4899' }}></i> Communications Mining</h3>
          <p style={{ margin: '0.25rem 0 0', color: 'var(--text-secondary)' }}>Analiza emails, chats y llamadas para descubrir insights</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowConnectModal(true)} style={{ background: '#ec4899', borderColor: '#ec4899' }}>
          <i className="fas fa-plug"></i> Conectar Fuentes
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem', marginBottom: '2rem' }}>
        {[
          { channel: 'Emails', icon: 'fa-envelope', data: communications.emails, color: '#3b82f6' },
          { channel: 'Chats', icon: 'fa-comment-dots', data: communications.chats, color: '#22c55e' },
          { channel: 'Llamadas', icon: 'fa-phone', data: communications.calls, color: '#8b5cf6' }
        ].map((item, idx) => (
          <div key={idx} style={{ background: 'var(--dark-bg)', borderRadius: '16px', padding: '1.5rem', border: '1px solid var(--border-color)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: `${item.color}20`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <i className={`fas ${item.icon}`} style={{ fontSize: '1.25rem', color: item.color }}></i>
              </div>
              <div>
                <h4 style={{ margin: 0, color: 'var(--text-primary)' }}>{item.channel}</h4>
                <span style={{ fontSize: '1.5rem', fontWeight: '700', color: item.color }}>{item.data.total.toLocaleString()}</span>
              </div>
            </div>
            <div style={{ marginBottom: '1rem' }}>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Sentimiento</div>
              <div style={{ display: 'flex', height: '8px', borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{ width: `${item.data.sentiment.positive}%`, background: '#22c55e' }}></div>
                <div style={{ width: `${item.data.sentiment.neutral}%`, background: '#94a3b8' }}></div>
                <div style={{ width: `${item.data.sentiment.negative}%`, background: '#ef4444' }}></div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.5rem', fontSize: '0.75rem' }}>
                <span style={{ color: '#22c55e' }}>+{item.data.sentiment.positive}%</span>
                <span style={{ color: '#94a3b8' }}>{item.data.sentiment.neutral}%</span>
                <span style={{ color: '#ef4444' }}>-{item.data.sentiment.negative}%</span>
              </div>
            </div>
            <div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Temas principales</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                {item.data.topics.map((topic, i) => (
                  <span key={i} style={{ background: `${item.color}20`, color: item.color, padding: '0.25rem 0.75rem', borderRadius: '20px', fontSize: '0.75rem' }}>{topic}</span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div style={{ background: 'linear-gradient(135deg, rgba(236, 72, 153, 0.1), rgba(219, 39, 119, 0.05))', borderRadius: '16px', padding: '1.5rem', border: '1px solid rgba(236, 72, 153, 0.3)' }}>
        <h4 style={{ margin: '0 0 1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><i className="fas fa-lightbulb" style={{ color: '#ec4899' }}></i> Insights Descubiertos</h4>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {[
            { icon: 'fa-exclamation-triangle', text: '23% de emails requieren múltiples respuestas - oportunidad de automatización', color: '#f59e0b' },
            { icon: 'fa-clock', text: 'Tiempo de respuesta promedio: 4.2 horas - por debajo del SLA', color: '#ef4444' },
            { icon: 'fa-chart-line', text: 'Los temas de facturación han aumentado 15% este mes', color: '#3b82f6' },
            { icon: 'fa-smile', text: 'Satisfacción del cliente en chats: 87% positivo', color: '#22c55e' }
          ].map((insight, idx) => (
            <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem 1rem', background: 'var(--dark-bg)', borderRadius: '8px' }}>
              <i className={`fas ${insight.icon}`} style={{ color: insight.color }}></i>
              <span style={{ color: 'var(--text-primary)', fontSize: '0.9rem' }}>{insight.text}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )

  const renderTestSuite = () => (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div>
          <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}><i className="fas fa-vial" style={{ color: '#06b6d4' }}></i> Test Suite</h3>
          <p style={{ margin: '0.25rem 0 0', color: 'var(--text-secondary)' }}>Pruebas automatizadas para tus workflows y robots</p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button className="btn btn-secondary" onClick={() => {
            const input = document.createElement('input')
            input.type = 'file'
            input.accept = '.json,.yaml,.yml'
            input.onchange = (e) => {
              if (e.target.files[0]) {
                setTestStats(prev => ({ ...prev, total: prev.total + 10, skipped: prev.skipped + 10 }))
                showNotif(`Tests importados desde "${e.target.files[0].name}". +10 tests agregados.`)
              }
            }
            input.click()
          }}>
            <i className="fas fa-file-import"></i> Importar Tests
          </button>
          <button className="btn btn-primary" onClick={handleRunTests} disabled={isRunningTests} style={{ background: '#06b6d4', borderColor: '#06b6d4' }}>
            {isRunningTests ? <><i className="fas fa-spinner fa-spin"></i> Ejecutando... {testProgress}/{testStats.total}</> : <><i className="fas fa-play"></i> Ejecutar Suite</>}
          </button>
        </div>
      </div>

      {isRunningTests && (
        <div style={{ marginBottom: '1.5rem', background: 'var(--dark-bg)', borderRadius: '12px', padding: '1rem', border: '1px solid #06b6d4' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
            <span style={{ color: 'var(--text-primary)', fontWeight: '600' }}>Ejecutando tests...</span>
            <span style={{ color: '#06b6d4', fontWeight: '600' }}>{testProgress}/{testStats.total}</span>
          </div>
          <div style={{ height: '6px', background: 'var(--bg-secondary)', borderRadius: '3px', overflow: 'hidden' }}>
            <div style={{ width: `${(testProgress / testStats.total) * 100}%`, height: '100%', background: 'linear-gradient(90deg, #06b6d4, #0891b2)', transition: 'width 0.2s' }}></div>
          </div>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '2rem' }}>
        {[
          { label: 'Total Tests', value: testStats.total, icon: 'fa-list-check', color: '#06b6d4' },
          { label: 'Pasados', value: testStats.passed, icon: 'fa-check-circle', color: '#22c55e' },
          { label: 'Fallados', value: testStats.failed, icon: 'fa-times-circle', color: '#ef4444' },
          { label: 'Omitidos', value: testStats.skipped, icon: 'fa-minus-circle', color: '#f59e0b' }
        ].map((stat, idx) => (
          <div key={idx} style={{ background: 'var(--dark-bg)', borderRadius: '12px', padding: '1.25rem', border: '1px solid var(--border-color)', textAlign: 'center' }}>
            <i className={`fas ${stat.icon}`} style={{ fontSize: '1.5rem', color: stat.color, marginBottom: '0.5rem' }}></i>
            <div style={{ fontSize: '1.75rem', fontWeight: '700', color: stat.color }}>{stat.value}</div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{stat.label}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
        {[
          { type: 'Unit Tests', desc: 'Pruebas de acciones individuales', count: 89, passed: 85, icon: 'fa-cube' },
          { type: 'Integration Tests', desc: 'Pruebas de flujos completos', count: 45, passed: 40, icon: 'fa-link' },
          { type: 'E2E Tests', desc: 'Pruebas end-to-end', count: 22, passed: 17, icon: 'fa-route' }
        ].map((test, idx) => (
          <div key={idx} style={{ background: 'var(--dark-bg)', borderRadius: '16px', padding: '1.5rem', border: '1px solid var(--border-color)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'linear-gradient(135deg, #06b6d4, #0891b2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <i className={`fas ${test.icon}`} style={{ fontSize: '1.25rem', color: 'white' }}></i>
              </div>
              <div><h4 style={{ margin: 0, color: 'var(--text-primary)' }}>{test.type}</h4><span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{test.desc}</span></div>
            </div>
            <div style={{ marginBottom: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Tasa de éxito</span>
                <span style={{ color: '#22c55e', fontWeight: '600' }}>{Math.round((test.passed / test.count) * 100)}%</span>
              </div>
              <div style={{ height: '8px', background: 'var(--bg-secondary)', borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{ width: `${(test.passed / test.count) * 100}%`, height: '100%', background: 'linear-gradient(90deg, #22c55e, #16a34a)' }}></div>
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
              <span><i className="fas fa-check" style={{ color: '#22c55e' }}></i> {test.passed} pasados</span>
              <span><i className="fas fa-times" style={{ color: '#ef4444' }}></i> {test.count - test.passed} fallados</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )

  // === IA INTERACTIVA RENDER ===
  const navigateToSettings = useCallback(() => {
    window.dispatchEvent(new CustomEvent('alqvimia-navigate', { detail: { view: 'settings' } }))
    setTimeout(() => window.dispatchEvent(new Event('settings-open-ai-tab')), 100)
  }, [])

  const renderAIChat = () => {
    const quickTemplates = [
      { label: 'Analizar imagen', icon: 'fa-image', prompt: 'Analiza esta imagen y describe detalladamente lo que ves' },
      { label: 'Generar texto', icon: 'fa-pen', prompt: 'Genera un texto profesional sobre: ' },
      { label: 'Resumir', icon: 'fa-compress-alt', prompt: 'Resume el siguiente contenido de forma concisa:\n\n' },
      { label: 'Crear codigo', icon: 'fa-code', prompt: 'Genera codigo en JavaScript para: ' },
      { label: 'Traducir', icon: 'fa-language', prompt: 'Traduce al ingles el siguiente texto:\n\n' },
      { label: 'Explicar', icon: 'fa-graduation-cap', prompt: 'Explica paso a paso de forma sencilla: ' },
      { label: 'Crear workflow', icon: 'fa-project-diagram', prompt: 'Genera los pasos de un workflow RPA para automatizar: ' },
      { label: 'Analizar datos', icon: 'fa-chart-pie', prompt: 'Analiza los siguientes datos y dame insights:\n\n' }
    ]

    return (
      <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 320px)', minHeight: '500px' }}>
        {/* Chat Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-primary)' }}>
              <i className="fas fa-magic" style={{ color: '#10b981' }}></i> Chat con IA
            </h3>
            {chatMessages.length > 0 && (
              <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', background: 'var(--bg-secondary)', padding: '0.2rem 0.6rem', borderRadius: '10px' }}>
                {chatMessages.length} mensajes
              </span>
            )}
          </div>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            {chatSessions.length > 0 && (
              <div style={{ position: 'relative' }}>
                <button className="btn btn-sm" style={{ background: 'var(--dark-bg)', border: '1px solid var(--border-color)', color: 'var(--text-primary)' }}
                  onClick={() => setShowSaveDropdown(showSaveDropdown === 'sessions' ? null : 'sessions')}>
                  <i className="fas fa-history"></i> Sesiones ({chatSessions.length})
                </button>
                {showSaveDropdown === 'sessions' && (
                  <div style={{ position: 'absolute', top: '100%', right: 0, zIndex: 100, background: 'var(--card-bg, #1e293b)', border: '1px solid var(--border-color)', borderRadius: '10px', padding: '0.5rem', minWidth: '260px', maxHeight: '300px', overflowY: 'auto', boxShadow: '0 8px 24px rgba(0,0,0,0.3)' }}>
                    {chatSessions.map(session => (
                      <button key={session.id} onClick={() => { handleLoadSession(session); setShowSaveDropdown(null) }}
                        style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', width: '100%', padding: '0.5rem 0.75rem', background: 'none', border: 'none', color: 'var(--text-primary)', cursor: 'pointer', borderRadius: '6px', fontSize: '0.8rem', textAlign: 'left' }}
                        onMouseOver={e => e.currentTarget.style.background = 'var(--hover-bg)'}
                        onMouseOut={e => e.currentTarget.style.background = 'none'}>
                        <i className="fas fa-comment-dots" style={{ color: '#10b981' }}></i>
                        <div style={{ overflow: 'hidden' }}>
                          <div style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{session.name}</div>
                          <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>{new Date(session.createdAt).toLocaleDateString()}</div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
            <button className="btn btn-sm" onClick={navigateToSettings}
              style={{ background: 'var(--dark-bg)', border: '1px solid var(--border-color)', color: 'var(--text-primary)' }}>
              <i className="fas fa-cog"></i> API Keys
            </button>
            <button className="btn btn-sm" onClick={handleNewChat}
              style={{ background: '#10b981', color: 'white', border: 'none' }}>
              <i className="fas fa-plus"></i> Nueva
            </button>
          </div>
        </div>

        {/* Messages Area */}
        <div style={{ flex: 1, overflowY: 'auto', background: 'var(--dark-bg)', borderRadius: '16px', border: '1px solid var(--border-color)', padding: '1.5rem', marginBottom: '1rem' }}>
          {chatMessages.length === 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: '1.5rem' }}>
              <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'linear-gradient(135deg, #10b981, #059669)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <i className="fas fa-robot" style={{ fontSize: '2.5rem', color: 'white' }}></i>
              </div>
              <div style={{ textAlign: 'center' }}>
                <h3 style={{ margin: '0 0 0.5rem', color: 'var(--text-primary)' }}>Alqvimia IA</h3>
                <p style={{ color: 'var(--text-secondary)', maxWidth: '400px', margin: '0 auto', fontSize: '0.9rem', lineHeight: '1.5' }}>
                  Escribe un mensaje, pega una imagen (Ctrl+V), o usa una plantilla rapida para comenzar.
                  Puedo analizar imagenes, generar textos, codigo, resumenes y mucho mas.
                </p>
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', justifyContent: 'center', maxWidth: '500px' }}>
                {quickTemplates.slice(0, 4).map((t, i) => (
                  <button key={i} onClick={() => setChatInput(t.prompt)}
                    style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.5rem 1rem', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '20px', color: 'var(--text-primary)', cursor: 'pointer', fontSize: '0.8rem', transition: 'all 0.2s' }}
                    onMouseOver={e => { e.currentTarget.style.borderColor = '#10b981'; e.currentTarget.style.background = 'rgba(16,185,129,0.1)' }}
                    onMouseOut={e => { e.currentTarget.style.borderColor = 'var(--border-color)'; e.currentTarget.style.background = 'var(--bg-secondary)' }}>
                    <i className={`fas ${t.icon}`} style={{ color: '#10b981' }}></i> {t.label}
                  </button>
                ))}
              </div>
              <button onClick={navigateToSettings}
                style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.6rem 1.2rem', background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.3)', borderRadius: '20px', color: '#818cf8', cursor: 'pointer', fontSize: '0.8rem', marginTop: '0.5rem' }}>
                <i className="fas fa-cog"></i> Configurar API Keys de IA
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {chatMessages.map((msg, idx) => (
                <div key={idx} style={{ display: 'flex', flexDirection: 'column', alignItems: msg.role === 'user' ? 'flex-end' : 'flex-start' }}>
                  {/* Bubble */}
                  <div style={{
                    maxWidth: '85%', padding: '1rem 1.25rem', borderRadius: msg.role === 'user' ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                    background: msg.role === 'user' ? 'linear-gradient(135deg, #10b981, #059669)' : msg.isError ? 'rgba(239,68,68,0.15)' : 'var(--bg-secondary)',
                    color: msg.role === 'user' ? 'white' : 'var(--text-primary)',
                    border: msg.isError ? '1px solid rgba(239,68,68,0.3)' : msg.role === 'assistant' ? '1px solid var(--border-color)' : 'none',
                    position: 'relative'
                  }}>
                    {/* Role icon */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.4rem', fontSize: '0.7rem', opacity: 0.8 }}>
                      <i className={`fas ${msg.role === 'user' ? 'fa-user' : 'fa-robot'}`}></i>
                      <span>{msg.role === 'user' ? 'Tu' : 'Alqvimia IA'}</span>
                      <span style={{ marginLeft: 'auto' }}>{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>

                    {/* Images in user messages */}
                    {msg.images && msg.images.length > 0 && (
                      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem', flexWrap: 'wrap' }}>
                        {msg.images.map((img, imgIdx) => (
                          <img key={imgIdx} src={img.data} alt={img.name}
                            style={{ maxWidth: '200px', maxHeight: '150px', borderRadius: '8px', objectFit: 'cover', border: '2px solid rgba(255,255,255,0.3)' }} />
                        ))}
                      </div>
                    )}

                    {/* Content */}
                    {msg.role === 'assistant' ? (
                      <div style={{ fontSize: '0.9rem', lineHeight: '1.6' }}
                        dangerouslySetInnerHTML={{ __html: renderMarkdown(msg.content) }} />
                    ) : (
                      <div style={{ fontSize: '0.9rem', lineHeight: '1.5', whiteSpace: 'pre-wrap' }}>{msg.content}</div>
                    )}

                    {/* Token usage badge */}
                    {msg.usage && (
                      <div style={{ marginTop: '0.5rem', fontSize: '0.65rem', color: 'var(--text-muted)', display: 'flex', gap: '0.5rem' }}>
                        <span><i className="fas fa-arrow-up"></i> {msg.usage.inputTokens}</span>
                        <span><i className="fas fa-arrow-down"></i> {msg.usage.outputTokens}</span>
                        {msg.model && <span style={{ opacity: 0.7 }}>{msg.model}</span>}
                      </div>
                    )}
                  </div>

                  {/* Action buttons for AI messages */}
                  {msg.role === 'assistant' && !msg.isError && (
                    <div style={{ display: 'flex', gap: '0.25rem', marginTop: '0.3rem', position: 'relative' }}>
                      <button onClick={() => handleCopyResponse(msg.content)}
                        style={{ background: 'none', border: '1px solid var(--border-color)', borderRadius: '6px', padding: '0.25rem 0.6rem', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '0.7rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}
                        title="Copiar respuesta">
                        <i className="fas fa-copy"></i> Copiar
                      </button>
                      <div style={{ position: 'relative' }}>
                        <button onClick={() => setShowSaveDropdown(showSaveDropdown === idx ? null : idx)}
                          style={{ background: 'none', border: '1px solid var(--border-color)', borderRadius: '6px', padding: '0.25rem 0.6rem', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '0.7rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}
                          title="Guardar como documento">
                          <i className="fas fa-download"></i> Guardar
                        </button>
                        {showSaveDropdown === idx && (
                          <div style={{ position: 'absolute', bottom: '100%', left: 0, zIndex: 50, background: 'var(--card-bg, #1e293b)', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '0.3rem', minWidth: '140px', boxShadow: '0 4px 12px rgba(0,0,0,0.3)', marginBottom: '4px' }}>
                            {[
                              { fmt: 'txt', label: 'Texto (.txt)', icon: 'fa-file-alt' },
                              { fmt: 'md', label: 'Markdown (.md)', icon: 'fa-file-code' },
                              { fmt: 'html', label: 'HTML (.html)', icon: 'fa-globe' },
                              { fmt: 'json', label: 'JSON (.json)', icon: 'fa-code' }
                            ].map(opt => (
                              <button key={opt.fmt} onClick={() => handleSaveAsDocument(msg.content, opt.fmt)}
                                style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', width: '100%', padding: '0.35rem 0.5rem', background: 'none', border: 'none', color: 'var(--text-primary)', cursor: 'pointer', borderRadius: '5px', fontSize: '0.75rem' }}
                                onMouseOver={e => e.currentTarget.style.background = 'var(--hover-bg)'}
                                onMouseOut={e => e.currentTarget.style.background = 'none'}>
                                <i className={`fas ${opt.icon}`} style={{ width: '14px', color: '#10b981' }}></i> {opt.label}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))}

              {/* Loading indicator */}
              {isSendingChat && (
                <div style={{ display: 'flex', alignItems: 'flex-start' }}>
                  <div style={{ padding: '1rem 1.25rem', borderRadius: '16px 16px 16px 4px', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)' }}>
                      <i className="fas fa-circle-notch fa-spin" style={{ color: '#10b981' }}></i>
                      <span style={{ fontSize: '0.85rem' }}>Alqvimia IA esta pensando...</span>
                    </div>
                  </div>
                </div>
              )}

              <div ref={chatEndRef} />
            </div>
          )}
        </div>

        {/* Image Previews */}
        {chatImages.length > 0 && (
          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem', flexWrap: 'wrap' }}>
            {chatImages.map((img, idx) => (
              <div key={idx} style={{ position: 'relative', borderRadius: '8px', overflow: 'hidden', border: '2px solid #10b981' }}>
                <img src={img.preview} alt={img.name}
                  style={{ width: '60px', height: '60px', objectFit: 'cover' }} />
                <button onClick={() => setChatImages(prev => prev.filter((_, i) => i !== idx))}
                  style={{ position: 'absolute', top: '2px', right: '2px', width: '18px', height: '18px', borderRadius: '50%', background: 'rgba(0,0,0,0.7)', color: 'white', border: 'none', cursor: 'pointer', fontSize: '0.6rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <i className="fas fa-times"></i>
                </button>
                <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'rgba(0,0,0,0.6)', color: 'white', fontSize: '0.5rem', padding: '1px 3px', textAlign: 'center', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {img.name}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Input Area */}
        <div style={{ background: 'var(--dark-bg)', borderRadius: '16px', border: '2px solid var(--border-color)', padding: '0.75rem', transition: 'border-color 0.2s' }}>
          <input type="file" ref={chatFileRef} accept="image/*" multiple onChange={handleFileAttach} style={{ display: 'none' }} />
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-end' }}>
            <button onClick={handleAttachFile}
              style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '1.1rem', padding: '0.4rem', flexShrink: 0 }}
              title="Adjuntar imagen">
              <i className="fas fa-paperclip"></i>
            </button>
            <textarea
              ref={chatInputRef}
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              onPaste={handlePasteImage}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault()
                  handleSendChat()
                }
              }}
              placeholder="Escribe un mensaje... (Ctrl+V para pegar imagen, Enter para enviar)"
              rows={1}
              style={{
                flex: 1, background: 'transparent', border: 'none', color: 'var(--text-primary)',
                resize: 'none', outline: 'none', fontSize: '0.9rem', lineHeight: '1.5',
                maxHeight: '120px', overflow: 'auto', fontFamily: 'inherit',
                minHeight: chatInput.split('\n').length > 1 ? '60px' : '36px'
              }}
            />
            <button onClick={handleSendChat} disabled={isSendingChat || (!chatInput.trim() && chatImages.length === 0)}
              style={{
                background: (chatInput.trim() || chatImages.length > 0) && !isSendingChat ? '#10b981' : 'var(--bg-secondary)',
                border: 'none', borderRadius: '10px', padding: '0.5rem 1rem',
                color: (chatInput.trim() || chatImages.length > 0) && !isSendingChat ? 'white' : 'var(--text-muted)',
                cursor: (chatInput.trim() || chatImages.length > 0) && !isSendingChat ? 'pointer' : 'default',
                fontSize: '0.9rem', flexShrink: 0, transition: 'all 0.2s'
              }}>
              {isSendingChat ? <i className="fas fa-circle-notch fa-spin"></i> : <i className="fas fa-paper-plane"></i>}
            </button>
          </div>
        </div>

        {/* Quick Templates */}
        {chatMessages.length > 0 && (
          <div style={{ display: 'flex', gap: '0.4rem', marginTop: '0.5rem', flexWrap: 'wrap' }}>
            {quickTemplates.map((t, i) => (
              <button key={i} onClick={() => setChatInput(t.prompt)}
                style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', padding: '0.3rem 0.7rem', background: 'var(--dark-bg)', border: '1px solid var(--border-color)', borderRadius: '14px', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '0.7rem', transition: 'all 0.2s' }}
                onMouseOver={e => { e.currentTarget.style.borderColor = '#10b981'; e.currentTarget.style.color = '#10b981' }}
                onMouseOut={e => { e.currentTarget.style.borderColor = 'var(--border-color)'; e.currentTarget.style.color = 'var(--text-secondary)' }}>
                <i className={`fas ${t.icon}`}></i> {t.label}
              </button>
            ))}
          </div>
        )}
      </div>
    )
  }

  const renderContent = () => {
    switch (activeModule) {
      case 'overview': return renderOverview()
      case 'ai-chat': return renderAIChat()
      case 'process-mining': return renderProcessMining()
      case 'task-mining': return renderTaskMining()
      case 'document-understanding': return renderDocumentUnderstanding()
      case 'agentic-automation': return renderAgenticAutomation()
      case 'communications-mining': return renderCommunicationsMining()
      case 'test-suite': return renderTestSuite()
      default: return renderOverview()
    }
  }

  const currentModule = modules.find(m => m.id === activeModule)

  return (
    <div className="view" id="ai-dashboard-view">
      {/* Notification Toast */}
      {notification && (
        <div style={{
          position: 'fixed', top: '80px', right: '2rem', zIndex: 9999,
          background: notification.type === 'success' ? '#22c55e' : notification.type === 'error' ? '#ef4444' : '#3b82f6',
          color: 'white', padding: '1rem 1.5rem', borderRadius: '12px',
          boxShadow: '0 8px 24px rgba(0,0,0,0.3)', display: 'flex', alignItems: 'center', gap: '0.75rem',
          animation: 'dropdownSlide 0.3s ease', maxWidth: '400px'
        }}>
          <i className={`fas ${notification.type === 'success' ? 'fa-check-circle' : notification.type === 'error' ? 'fa-exclamation-circle' : 'fa-info-circle'}`}></i>
          <span style={{ fontSize: '0.9rem' }}>{notification.message}</span>
        </div>
      )}

      {/* Header */}
      <div style={{ background: `linear-gradient(135deg, ${currentModule?.color || '#6366f1'}, ${currentModule?.color || '#6366f1'}cc)`, borderRadius: '16px', padding: '1.5rem 2rem', marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ margin: 0, color: 'white', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <i className="fas fa-brain"></i> {t('ai_title')}
          </h2>
          <p style={{ margin: '0.5rem 0 0', color: 'rgba(255,255,255,0.85)' }}>{t('ai_subtitle')}</p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button className="btn" onClick={() => setShowMetricsModal(true)} style={{ background: 'rgba(255,255,255,0.2)', border: '1px solid rgba(255,255,255,0.3)', color: 'white' }}>
            <i className="fas fa-chart-bar"></i> Métricas
          </button>
          <button className="btn" style={{ background: 'white', color: currentModule?.color || '#6366f1', border: 'none', fontWeight: '600' }} onClick={() => showNotif('Panel de configuración próximamente.')}>
            <i className="fas fa-cog"></i> Configuración
          </button>
        </div>
      </div>

      {/* Module Navigation */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '2rem', overflowX: 'auto', paddingBottom: '0.5rem' }}>
        {modules.map(module => (
          <button key={module.id} onClick={() => setActiveModule(module.id)} style={{
            display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1.25rem',
            background: activeModule === module.id ? module.color : 'var(--dark-bg)',
            border: activeModule === module.id ? `2px solid ${module.color}` : '2px solid var(--border-color)',
            borderRadius: '10px', color: activeModule === module.id ? 'white' : 'var(--text-primary)',
            cursor: 'pointer', whiteSpace: 'nowrap', transition: 'all 0.2s',
            fontWeight: activeModule === module.id ? '600' : '400'
          }}>
            <i className={`fas ${module.icon}`}></i> {module.name}
          </button>
        ))}
      </div>

      {/* Content */}
      {renderContent()}

      {/* === MODALS === */}

      {/* Optimize Modal */}
      {showOptimizeModal && optimizationData[showOptimizeModal] && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 9998, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.6)' }} onClick={() => setShowOptimizeModal(null)}>
          <div style={{ background: 'var(--card-bg, #1e293b)', borderRadius: '16px', padding: '2rem', maxWidth: '650px', width: '90%', maxHeight: '80vh', overflowY: 'auto', border: '2px solid #22c55e' }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-primary)' }}>
                <i className="fas fa-magic" style={{ color: '#22c55e' }}></i> Optimización: {optimizationData[showOptimizeModal].title}
              </h3>
              <button onClick={() => setShowOptimizeModal(null)} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '1.2rem' }}>
                <i className="fas fa-times"></i>
              </button>
            </div>

            <div style={{ display: 'flex', gap: '1.5rem', marginBottom: '1.5rem' }}>
              <div style={{ flex: 1, background: 'rgba(34, 197, 94, 0.1)', borderRadius: '12px', padding: '1rem', textAlign: 'center' }}>
                <div style={{ fontSize: '2rem', fontWeight: '700', color: '#22c55e' }}>{optimizationData[showOptimizeModal].savings}</div>
                <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Reducción estimada</div>
              </div>
              <div style={{ flex: 1, background: 'rgba(59, 130, 246, 0.1)', borderRadius: '12px', padding: '1rem', textAlign: 'center' }}>
                <div style={{ fontSize: '2rem', fontWeight: '700', color: '#3b82f6' }}>{optimizationData[showOptimizeModal].timeSaved}</div>
                <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Tiempo ahorrado</div>
              </div>
            </div>

            <h4 style={{ margin: '0 0 1rem', color: 'var(--text-primary)' }}>Recomendaciones de IA</h4>
            {optimizationData[showOptimizeModal].recommendations.map((rec, idx) => (
              <div key={idx} style={{ background: 'var(--dark-bg)', borderRadius: '12px', padding: '1rem', marginBottom: '0.75rem', border: '1px solid var(--border-color)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <h5 style={{ margin: 0, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <i className="fas fa-lightbulb" style={{ color: '#f59e0b' }}></i> {rec.action}
                  </h5>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <span style={{ background: rec.impact === 'Alto' ? 'rgba(34, 197, 94, 0.2)' : 'rgba(245, 158, 11, 0.2)', color: rec.impact === 'Alto' ? '#22c55e' : '#f59e0b', padding: '0.15rem 0.5rem', borderRadius: '6px', fontSize: '0.7rem' }}>Impacto: {rec.impact}</span>
                    <span style={{ background: rec.effort === 'Bajo' ? 'rgba(34, 197, 94, 0.2)' : rec.effort === 'Medio' ? 'rgba(245, 158, 11, 0.2)' : 'rgba(239, 68, 68, 0.2)', color: rec.effort === 'Bajo' ? '#22c55e' : rec.effort === 'Medio' ? '#f59e0b' : '#ef4444', padding: '0.15rem 0.5rem', borderRadius: '6px', fontSize: '0.7rem' }}>Esfuerzo: {rec.effort}</span>
                  </div>
                </div>
                <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.85rem' }}>{rec.desc}</p>
              </div>
            ))}

            <button className="btn btn-primary" style={{ width: '100%', marginTop: '1rem', background: '#22c55e', borderColor: '#22c55e' }} onClick={() => { setShowOptimizeModal(null); showNotif('Workflow de optimización creado en Alqvimia.') }}>
              <i className="fas fa-play"></i> Aplicar Optimización Automática
            </button>
          </div>
        </div>
      )}

      {/* New Analysis Modal */}
      {showNewAnalysisModal && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 9998, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.6)' }} onClick={() => setShowNewAnalysisModal(false)}>
          <div style={{ background: 'var(--card-bg, #1e293b)', borderRadius: '16px', padding: '2rem', maxWidth: '450px', width: '90%', border: '1px solid var(--border-color)' }} onClick={e => e.stopPropagation()}>
            <h3 style={{ margin: '0 0 1.5rem', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <i className="fas fa-plus-circle" style={{ color: '#22c55e' }}></i> Nuevo Análisis de Proceso
            </h3>
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Nombre del proceso</label>
              <input type="text" value={newAnalysisName} onChange={e => setNewAnalysisName(e.target.value)} placeholder="Ej: Proceso de Compras" style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--dark-bg)', color: 'var(--text-primary)', fontSize: '0.95rem', outline: 'none', boxSizing: 'border-box' }}
                onKeyDown={e => e.key === 'Enter' && handleNewAnalysis()}
              />
            </div>
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button className="btn btn-secondary" style={{ flex: 1 }} onClick={() => setShowNewAnalysisModal(false)}>Cancelar</button>
              <button className="btn btn-primary" style={{ flex: 1, background: '#22c55e', borderColor: '#22c55e' }} onClick={handleNewAnalysis} disabled={!newAnalysisName.trim()}>
                <i className="fas fa-play"></i> Crear Análisis
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Metrics Modal */}
      {showMetricsModal && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 9998, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.6)' }} onClick={() => setShowMetricsModal(false)}>
          <div style={{ background: 'var(--card-bg, #1e293b)', borderRadius: '16px', padding: '2rem', maxWidth: '600px', width: '90%', border: '1px solid var(--border-color)' }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h3 style={{ margin: 0, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <i className="fas fa-chart-bar" style={{ color: 'var(--primary-color)' }}></i> Métricas Generales
              </h3>
              <button onClick={() => setShowMetricsModal(false)} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '1.2rem' }}><i className="fas fa-times"></i></button>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
              {[
                { label: 'Documentos/día', value: '89', trend: '+12%', color: '#6366f1' },
                { label: 'Procesos optimizados', value: '18/32', trend: '+3', color: '#22c55e' },
                { label: 'Precisión ML promedio', value: '96.8%', trend: '+0.5%', color: '#8b5cf6' },
                { label: 'Agentes activos', value: `${agents.filter(a => a.status === 'active').length}/${agents.length}`, trend: 'OK', color: '#f59e0b' },
                { label: 'Tests pasando', value: `${testStats.passed}/${testStats.total}`, trend: `${Math.round(testStats.passed/testStats.total*100)}%`, color: '#06b6d4' },
                { label: 'ROI acumulado', value: '$127,050', trend: '+$42,350', color: '#ec4899' }
              ].map((m, idx) => (
                <div key={idx} style={{ background: 'var(--dark-bg)', borderRadius: '12px', padding: '1rem', border: '1px solid var(--border-color)' }}>
                  <div style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', marginBottom: '0.5rem' }}>{m.label}</div>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem' }}>
                    <span style={{ fontSize: '1.5rem', fontWeight: '700', color: m.color }}>{m.value}</span>
                    <span style={{ fontSize: '0.75rem', color: '#22c55e' }}>{m.trend}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Modal de Error del Chat */}
      {chatErrorModal && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.6)' }} onClick={() => setChatErrorModal(null)}>
          <div style={{ background: 'var(--card-bg, #1e293b)', borderRadius: '16px', padding: '2rem', maxWidth: '480px', width: '90%', border: '1px solid rgba(239,68,68,0.3)', boxShadow: '0 8px 32px rgba(0,0,0,0.4)' }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
              <div style={{ width: '44px', height: '44px', borderRadius: '50%', background: 'rgba(239,68,68,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <i className="fas fa-exclamation-triangle" style={{ color: '#ef4444', fontSize: '1.2rem' }}></i>
              </div>
              <h3 style={{ margin: 0, color: 'var(--text-primary)', fontSize: '1.1rem' }}>{chatErrorModal.title}</h3>
            </div>
            <div style={{ padding: '1rem', background: 'var(--dark-bg)', borderRadius: '10px', marginBottom: '1.5rem', color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.6, whiteSpace: 'pre-line' }}>
              {chatErrorModal.message}
            </div>
            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
              <button onClick={() => { setChatErrorModal(null); navigateToSettings() }}
                style={{ padding: '0.6rem 1.25rem', background: 'var(--dark-bg)', border: '1px solid var(--border-color)', borderRadius: '8px', color: 'var(--text-primary)', cursor: 'pointer', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <i className="fas fa-cog"></i> Ir a API Keys
              </button>
              <button onClick={() => setChatErrorModal(null)}
                style={{ padding: '0.6rem 1.5rem', background: '#ef4444', border: 'none', borderRadius: '8px', color: 'white', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600 }}>
                Aceptar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Connect Sources Modal */}
      {showConnectModal && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 9998, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.6)' }} onClick={() => setShowConnectModal(false)}>
          <div style={{ background: 'var(--card-bg, #1e293b)', borderRadius: '16px', padding: '2rem', maxWidth: '450px', width: '90%', border: '1px solid var(--border-color)' }} onClick={e => e.stopPropagation()}>
            <h3 style={{ margin: '0 0 1.5rem', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <i className="fas fa-plug" style={{ color: '#ec4899' }}></i> Conectar Fuentes de Datos
            </h3>
            {[
              { name: 'Gmail', icon: 'fa-envelope', color: '#ea4335' },
              { name: 'Outlook', icon: 'fa-envelope', color: '#0078d4' },
              { name: 'Slack', icon: 'fa-comment-dots', color: '#4a154b' },
              { name: 'Teams', icon: 'fa-comments', color: '#6264a7' },
              { name: 'Zendesk', icon: 'fa-headset', color: '#03363d' },
              { name: 'Twilio', icon: 'fa-phone', color: '#f22f46' }
            ].map((source, idx) => (
              <div key={idx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.75rem 1rem', background: 'var(--dark-bg)', borderRadius: '8px', marginBottom: '0.5rem', border: '1px solid var(--border-color)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <i className={`fas ${source.icon}`} style={{ color: source.color, fontSize: '1.2rem' }}></i>
                  <span style={{ color: 'var(--text-primary)' }}>{source.name}</span>
                </div>
                <button className={`btn btn-sm ${connectedSources.includes(source.name) ? 'btn-success' : 'btn-secondary'}`}
                  onClick={() => handleConnectSource(source.name)}
                  style={connectedSources.includes(source.name) ? { background: '#22c55e', borderColor: '#22c55e', color: 'white' } : {}}>
                  {connectedSources.includes(source.name) ? <><i className="fas fa-check"></i> Conectado</> : <><i className="fas fa-plug"></i> Conectar</>}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Agent Config Modal */}
      {showAgentConfig && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 9998, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.6)' }} onClick={() => setShowAgentConfig(null)}>
          <div style={{ background: 'var(--card-bg, #1e293b)', borderRadius: '16px', padding: '2rem', maxWidth: '500px', width: '90%', border: '1px solid var(--border-color)' }} onClick={e => e.stopPropagation()}>
            <h3 style={{ margin: '0 0 1.5rem', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <i className="fas fa-cog" style={{ color: '#f59e0b' }}></i> Configurar: {showAgentConfig.name}
            </h3>
            {[
              { label: 'Intervalo de ejecución', value: 'Cada 5 minutos', icon: 'fa-clock' },
              { label: 'Reintentos en error', value: '3 intentos', icon: 'fa-redo' },
              { label: 'Notificaciones', value: 'Email + Slack', icon: 'fa-bell' },
              { label: 'Timeout máximo', value: '30 segundos', icon: 'fa-hourglass-half' },
              { label: 'Modelo IA', value: 'Claude Sonnet 4.5', icon: 'fa-brain' },
              { label: 'Prioridad', value: 'Alta', icon: 'fa-flag' }
            ].map((config, idx) => (
              <div key={idx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.75rem 1rem', background: 'var(--dark-bg)', borderRadius: '8px', marginBottom: '0.5rem', border: '1px solid var(--border-color)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <i className={`fas ${config.icon}`} style={{ color: '#f59e0b' }}></i>
                  <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>{config.label}</span>
                </div>
                <span style={{ color: 'var(--text-primary)', fontWeight: '600', fontSize: '0.9rem' }}>{config.value}</span>
              </div>
            ))}
            <button className="btn btn-primary" style={{ width: '100%', marginTop: '1rem', background: '#f59e0b', borderColor: '#f59e0b' }} onClick={() => { setShowAgentConfig(null); showNotif('Configuración del agente actualizada.') }}>
              <i className="fas fa-save"></i> Guardar Configuración
            </button>
          </div>
        </div>
      )}

      {/* Agent History Modal */}
      {showAgentHistory && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 9998, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.6)' }} onClick={() => setShowAgentHistory(null)}>
          <div style={{ background: 'var(--card-bg, #1e293b)', borderRadius: '16px', padding: '2rem', maxWidth: '550px', width: '90%', maxHeight: '70vh', overflowY: 'auto', border: '1px solid var(--border-color)' }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h3 style={{ margin: 0, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <i className="fas fa-history" style={{ color: '#f59e0b' }}></i> Historial: {showAgentHistory.name}
              </h3>
              <button onClick={() => setShowAgentHistory(null)} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '1.2rem' }}><i className="fas fa-times"></i></button>
            </div>
            {[
              { time: 'Hace 5 min', action: 'Procesó 3 facturas exitosamente', status: 'success' },
              { time: 'Hace 20 min', action: 'Clasificó 12 emails entrantes', status: 'success' },
              { time: 'Hace 1 hora', action: 'Error de conexión con API - reintentando', status: 'warning' },
              { time: 'Hace 2 horas', action: 'Generó reporte mensual de ventas', status: 'success' },
              { time: 'Hace 3 horas', action: 'Actualizó 45 registros de inventario', status: 'success' },
              { time: 'Hace 5 horas', action: 'Timeout en consulta de base de datos', status: 'error' },
              { time: 'Hace 8 horas', action: 'Procesó 89 documentos correctamente', status: 'success' }
            ].map((entry, idx) => (
              <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem', background: 'var(--dark-bg)', borderRadius: '8px', marginBottom: '0.5rem', borderLeft: `3px solid ${entry.status === 'success' ? '#22c55e' : entry.status === 'warning' ? '#f59e0b' : '#ef4444'}` }}>
                <i className={`fas ${entry.status === 'success' ? 'fa-check-circle' : entry.status === 'warning' ? 'fa-exclamation-triangle' : 'fa-times-circle'}`} style={{ color: entry.status === 'success' ? '#22c55e' : entry.status === 'warning' ? '#f59e0b' : '#ef4444' }}></i>
                <div style={{ flex: 1 }}>
                  <div style={{ color: 'var(--text-primary)', fontSize: '0.9rem' }}>{entry.action}</div>
                  <div style={{ color: 'var(--text-secondary)', fontSize: '0.75rem' }}>{entry.time}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default AIDashboardView
