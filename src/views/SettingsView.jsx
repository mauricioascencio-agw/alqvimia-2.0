import { useState, useEffect } from 'react'
import { useLanguage } from '../context/LanguageContext'
import { useAuth } from '../context/AuthContext'
import { useWorkflowStore } from '../stores/workflowStore'
import { AI_TEMPLATES, AI_TEMPLATE_CATEGORIES } from '../config/aiTemplates'

// Temas disponibles
const availableThemes = [
  {
    id: 'midnight-blue',
    name: 'Midnight Blue',
    description: 'Tema oscuro elegante con acentos azules',
    icon: 'fa-moon',
    preview: {
      primary: '#2563eb',
      bg: '#0f172a',
      card: '#1e293b',
      accent: '#7c3aed'
    }
  },
  {
    id: 'ocean-breeze',
    name: 'Ocean Breeze',
    description: 'Tonos de verde y cian inspirados en el mar',
    icon: 'fa-water',
    preview: {
      primary: '#0891b2',
      bg: '#042f2e',
      card: '#134e4a',
      accent: '#2dd4bf'
    }
  },
  {
    id: 'sunset-purple',
    name: 'Sunset Purple',
    description: 'Morados y rosas para un look moderno',
    icon: 'fa-cloud-sun',
    preview: {
      primary: '#a855f7',
      bg: '#1c1917',
      card: '#292524',
      accent: '#ec4899'
    }
  },
  {
    id: 'forest-green',
    name: 'Forest Green',
    description: 'Verdes naturales y relajantes',
    icon: 'fa-tree',
    preview: {
      primary: '#22c55e',
      bg: '#14532d',
      card: '#166534',
      accent: '#84cc16'
    }
  },
  {
    id: 'ruby-red',
    name: 'Ruby Red',
    description: 'Rojos intensos y elegantes',
    icon: 'fa-gem',
    preview: {
      primary: '#e11d48',
      bg: '#1c1917',
      card: '#292524',
      accent: '#f43f5e'
    }
  },
  {
    id: 'golden-amber',
    name: 'Golden Amber',
    description: 'Dorados cálidos y acogedores',
    icon: 'fa-sun',
    preview: {
      primary: '#f59e0b',
      bg: '#1c1917',
      card: '#292524',
      accent: '#eab308'
    }
  },
  {
    id: 'cyberpunk-neon',
    name: 'Cyberpunk Neon',
    description: 'Colores neón futuristas con efecto glow',
    icon: 'fa-bolt',
    preview: {
      primary: '#00f5d4',
      bg: '#0a0a0a',
      card: '#1a1a2e',
      accent: '#f72585'
    }
  },
  {
    id: 'arctic-frost',
    name: 'Arctic Frost',
    description: 'Tema claro limpio y profesional',
    icon: 'fa-snowflake',
    preview: {
      primary: '#3b82f6',
      bg: '#f1f5f9',
      card: '#ffffff',
      accent: '#06b6d4'
    }
  },
  {
    id: 'lavender-dreams',
    name: 'Lavender Dreams',
    description: 'Lavandas suaves y relajantes',
    icon: 'fa-spa',
    preview: {
      primary: '#8b5cf6',
      bg: '#18181b',
      card: '#27272a',
      accent: '#d946ef'
    }
  },
  {
    id: 'volcanic-orange',
    name: 'Volcanic Orange',
    description: 'Naranjas vibrantes y energéticos',
    icon: 'fa-fire',
    preview: {
      primary: '#ea580c',
      bg: '#1c1917',
      card: '#292524',
      accent: '#dc2626'
    }
  },
  {
    id: 'rose-gold',
    name: 'Rose Gold',
    description: 'Elegantes tonos rosados y dorados',
    icon: 'fa-heart',
    preview: {
      primary: '#fb7185',
      bg: '#1c1917',
      card: '#292524',
      accent: '#fda4af'
    }
  },
  {
    id: 'matrix-green',
    name: 'Matrix Green',
    description: 'Estilo Matrix con texto verde neón',
    icon: 'fa-code',
    preview: {
      primary: '#22c55e',
      bg: '#000000',
      card: '#0a0a0a',
      accent: '#4ade80'
    }
  },
  {
    id: 'coffee-cream',
    name: 'Coffee Cream',
    description: 'Tema claro cálido con tonos café',
    icon: 'fa-mug-hot',
    preview: {
      primary: '#a16207',
      bg: '#fef3c7',
      card: '#fffbeb',
      accent: '#ca8a04'
    }
  },
  {
    id: 'deep-space',
    name: 'Deep Space',
    description: 'Profundo espacio con índigo y violeta',
    icon: 'fa-rocket',
    preview: {
      primary: '#6366f1',
      bg: '#020617',
      card: '#0f172a',
      accent: '#8b5cf6'
    }
  },
  {
    id: 'coral-sunset',
    name: 'Coral Sunset',
    description: 'Atardecer tropical con coral y magenta',
    icon: 'fa-palette',
    preview: {
      primary: '#fb923c',
      bg: '#1f1523',
      card: '#2e1f32',
      accent: '#f472b6'
    }
  }
]

// Las plantillas de IA se importan de aiTemplates.js (AI_TEMPLATES)
// Referencia local para usar en este componente
const aiTemplates = AI_TEMPLATES

// Plantillas de Agentes predefinidas
const agentTemplates = [
  {
    id: 1,
    name: 'Agente de Atención al Cliente',
    icon: 'fa-headset',
    description: 'Responde consultas de clientes de forma automatizada',
    capabilities: ['Responder FAQs', 'Escalar tickets', 'Registrar quejas'],
    category: 'customer-service',
    color: '#4CAF50'
  },
  {
    id: 2,
    name: 'Agente de Procesamiento de Facturas',
    icon: 'fa-file-invoice-dollar',
    description: 'Extrae y procesa datos de facturas automáticamente',
    capabilities: ['Leer PDFs', 'Extraer montos', 'Validar RUT/RFC', 'Registrar en sistema'],
    category: 'finance',
    color: '#2196F3'
  },
  {
    id: 3,
    name: 'Agente de Onboarding',
    icon: 'fa-user-plus',
    description: 'Automatiza el proceso de incorporación de nuevos empleados',
    capabilities: ['Crear cuentas', 'Enviar credenciales', 'Asignar permisos', 'Programar capacitaciones'],
    category: 'hr',
    color: '#9C27B0'
  },
  {
    id: 4,
    name: 'Agente de Monitoreo',
    icon: 'fa-desktop',
    description: 'Monitorea sistemas y notifica anomalías',
    capabilities: ['Revisar logs', 'Detectar errores', 'Enviar alertas', 'Generar reportes'],
    category: 'it',
    color: '#F44336'
  },
  {
    id: 5,
    name: 'Agente de Ventas',
    icon: 'fa-shopping-cart',
    description: 'Asiste en el proceso de ventas y cotizaciones',
    capabilities: ['Consultar inventario', 'Generar cotizaciones', 'Seguimiento de leads'],
    category: 'sales',
    color: '#FF9800'
  },
  {
    id: 6,
    name: 'Agente de Reportes',
    icon: 'fa-chart-pie',
    description: 'Genera reportes periódicos automáticamente',
    capabilities: ['Consultar bases de datos', 'Crear gráficos', 'Enviar por email', 'Programar ejecución'],
    category: 'analytics',
    color: '#00BCD4'
  },
  {
    id: 7,
    name: 'Agente de Email',
    icon: 'fa-mail-bulk',
    description: 'Gestiona y responde emails automáticamente',
    capabilities: ['Leer emails', 'Clasificar mensajes', 'Responder automáticamente', 'Archivar'],
    category: 'communication',
    color: '#E91E63'
  },
  {
    id: 8,
    name: 'Agente de Base de Datos',
    icon: 'fa-database',
    description: 'Ejecuta operaciones en bases de datos',
    capabilities: ['Consultas SQL', 'Backup automático', 'Sincronización', 'Limpieza de datos'],
    category: 'data',
    color: '#673AB7'
  },
  {
    id: 9,
    name: 'Agente de Integración SAP',
    icon: 'fa-cubes',
    description: 'Conecta y sincroniza datos con SAP',
    capabilities: ['Leer transacciones', 'Crear órdenes', 'Sincronizar maestros', 'Ejecutar BAPIs'],
    category: 'erp',
    color: '#3F51B5'
  },
  {
    id: 10,
    name: 'Agente de Web Scraping',
    icon: 'fa-spider',
    description: 'Extrae datos de páginas web automáticamente',
    capabilities: ['Navegar sitios', 'Extraer tablas', 'Descargar archivos', 'Programar extracción'],
    category: 'extraction',
    color: '#607D8B'
  },
  {
    id: 11,
    name: 'Agente de WhatsApp Business',
    icon: 'fa-whatsapp',
    description: 'Automatiza respuestas en WhatsApp Business',
    capabilities: ['Responder mensajes', 'Enviar multimedia', 'Gestionar grupos', 'Integraciones'],
    category: 'messaging',
    color: '#25D366'
  },
  {
    id: 12,
    name: 'Agente de Documentos',
    icon: 'fa-file-alt',
    description: 'Procesa y organiza documentos automáticamente',
    capabilities: ['OCR', 'Clasificación', 'Archivado', 'Búsqueda inteligente'],
    category: 'documents',
    color: '#795548'
  }
]

const AI_PROVIDERS = [
  { id: 'anthropic', name: 'Anthropic (Claude)', icon: 'fa-brain', color: '#d97706', prefix: 'sk-ant-', placeholder: 'sk-ant-api03-...', url: 'https://console.anthropic.com/settings/keys', description: 'Claude 3.5 Sonnet, Haiku, Opus', models: ['Claude 3.5 Sonnet', 'Claude 3.5 Haiku', 'Claude 3 Opus'] },
  { id: 'openai', name: 'OpenAI', icon: 'fa-robot', color: '#10b981', prefix: 'sk-', placeholder: 'sk-proj-...', url: 'https://platform.openai.com/api-keys', description: 'GPT-4o, GPT-4 Turbo, DALL-E', models: ['GPT-4o', 'GPT-4o Mini', 'GPT-4 Turbo'] },
  { id: 'google', name: 'Google (Gemini)', icon: 'fa-globe', color: '#4285f4', prefix: '', placeholder: 'AIza...', url: 'https://aistudio.google.com/apikey', description: 'Gemini Pro, Gemini Ultra', models: ['Gemini 1.5 Pro', 'Gemini 1.5 Flash'] },
  { id: 'azure', name: 'Azure OpenAI', icon: 'fa-cloud', color: '#0078d4', prefix: '', placeholder: 'tu-api-key-azure...', url: 'https://portal.azure.com/', description: 'GPT-4, GPT-3.5 via Azure', models: ['GPT-4', 'GPT-3.5 Turbo'] },
  { id: 'mistral', name: 'Mistral AI', icon: 'fa-wind', color: '#ff7000', prefix: '', placeholder: 'tu-api-key-mistral...', url: 'https://console.mistral.ai/api-keys', description: 'Mistral Large, Medium, Small', models: ['Mistral Large', 'Mistral Medium'] },
  { id: 'cohere', name: 'Cohere', icon: 'fa-atom', color: '#39594d', prefix: '', placeholder: 'tu-api-key-cohere...', url: 'https://dashboard.cohere.com/api-keys', description: 'Command, Embed, Rerank', models: ['Command R+', 'Command R'] }
]

function SettingsView() {
  const { t } = useLanguage()
  const { user, isAdmin, authFetch, updateProfile, changePassword } = useAuth()
  const { addStep } = useWorkflowStore()
  const [activeTab, setActiveTab] = useState('general')

  // Estados para gestión de usuarios
  const [users, setUsers] = useState([])
  const [loadingUsers, setLoadingUsers] = useState(false)
  const [showUserModal, setShowUserModal] = useState(false)
  const [editingUser, setEditingUser] = useState(null)
  const [userForm, setUserForm] = useState({ nombre: '', email: '', password: '', rol: 'usuario', activo: true })
  const [selectedAITemplate, setSelectedAITemplate] = useState(null)
  const [selectedAgentTemplate, setSelectedAgentTemplate] = useState(null)

  // Estados para permisos de dashboards
  const [dashboardPermisos, setDashboardPermisos] = useState([])
  const [loadingDashPermisos, setLoadingDashPermisos] = useState(false)

  // Estados para API Keys de IA
  const [apiKeyInput, setApiKeyInput] = useState('')
  const [apiKeyName, setApiKeyName] = useState('Default')
  const [apiKeyStatus, setApiKeyStatus] = useState(null) // { configured: false, source: 'none' }
  const [apiKeyLoading, setApiKeyLoading] = useState(false)
  const [apiKeyTesting, setApiKeyTesting] = useState(false)
  const [apiUsageStats, setApiUsageStats] = useState(null)
  const [usagePeriod, setUsagePeriod] = useState('30d')
  const [selectedProvider, setSelectedProvider] = useState('anthropic')
  const [savedApiKeys, setSavedApiKeys] = useState([])
  const [loadingKeys, setLoadingKeys] = useState(false)
  const [currentTheme, setCurrentTheme] = useState(() => {
    return localStorage.getItem('alqvimia-theme') || 'midnight-blue'
  })
  const [availableVoices, setAvailableVoices] = useState([])
  const [settings, setSettings] = useState(() => {
    // Cargar configuración guardada desde localStorage
    const savedSettings = localStorage.getItem('alqvimia-settings')
    if (savedSettings) {
      try {
        return JSON.parse(savedSettings)
      } catch (e) {
        console.error('Error parsing saved settings:', e)
      }
    }
    return {
      general: {
        language: 'es',
        theme: 'midnight-blue',
        autoSave: true,
        notifications: true
      },
      server: {
        host: 'localhost',
        port: '3000',
        timeout: '30000'
      },
      ai: {
        provider: 'openai',
        model: 'gpt-4',
        temperature: '0.7',
        maxTokens: '2000'
      },
      ocr: {
        provider: 'tesseract',
        language: 'spa',
        enhanceImages: true
      },
      agentVoice: {
        agentName: 'Alqvimia',
        voiceId: '',
        voiceRate: 1,
        voicePitch: 1,
        speakOnStart: true,
        greetingMessage: 'Hola, soy {agentName}, tu asistente de automatización. ¿En qué puedo ayudarte hoy?'
      }
    }
  })

  const baseTabs = [
    { id: 'general', label: 'General', icon: 'fa-cog' },
    { id: 'appearance', label: 'Apariencia', icon: 'fa-palette' },
    { id: 'agent-voice', label: 'Voz del Agente', icon: 'fa-microphone-alt' },
    { id: 'server', label: 'Servidor', icon: 'fa-server' },
    { id: 'ai', label: 'Inteligencia Artificial', icon: 'fa-brain' },
    { id: 'ai-templates', label: 'Plantillas IA', icon: 'fa-magic' },
    { id: 'agent-templates', label: 'Plantillas Agentes', icon: 'fa-robot' },
    { id: 'ocr', label: 'OCR', icon: 'fa-eye' },
    { id: 'database', label: 'Base de Datos', icon: 'fa-database' },
    { id: 'backup', label: 'Respaldo', icon: 'fa-download' }
  ]

  // Agregar tab de usuarios solo para admin
  const tabs = isAdmin
    ? [...baseTabs, { id: 'dashboards', label: 'Dashboards', icon: 'fa-tachometer-alt' }, { id: 'users', label: 'Usuarios', icon: 'fa-users' }]
    : baseTabs

  // Cargar usuarios (solo admin)
  const loadUsers = async () => {
    if (!isAdmin) return
    setLoadingUsers(true)
    try {
      const response = await authFetch(`${import.meta.env.VITE_BACKEND_URL || 'http://localhost:4000'}/api/users`)
      const data = await response.json()
      if (data.success) {
        setUsers(data.data)
      }
    } catch (err) {
      console.error('[Settings] Error cargando usuarios:', err)
    } finally {
      setLoadingUsers(false)
    }
  }

  // Cargar usuarios al cambiar a la tab de usuarios
  useEffect(() => {
    if (activeTab === 'users' && isAdmin) {
      loadUsers()
    }
  }, [activeTab, isAdmin])

  // Cargar permisos de dashboards al cambiar a esa tab
  useEffect(() => {
    if (activeTab === 'dashboards' && isAdmin) {
      loadDashboardPermisos()
    }
  }, [activeTab, isAdmin])

  const loadDashboardPermisos = async () => {
    setLoadingDashPermisos(true)
    try {
      const response = await authFetch(`${import.meta.env.VITE_BACKEND_URL || 'http://localhost:4000'}/api/dashboards/permisos`)
      const data = await response.json()
      if (data.success) {
        setDashboardPermisos(data.data || [])
      }
    } catch (err) {
      console.error('[Settings] Error cargando permisos dashboards:', err)
    } finally {
      setLoadingDashPermisos(false)
    }
  }

  const handleDashPermToggle = async (rol, campo, valor) => {
    try {
      const perm = dashboardPermisos.find(p => p.rol === rol)
      if (!perm) return
      const updated = { ...perm, [campo]: valor }
      const response = await authFetch(`${import.meta.env.VITE_BACKEND_URL || 'http://localhost:4000'}/api/dashboards/permisos`, {
        method: 'PUT',
        body: JSON.stringify({ rol, permisos: updated })
      })
      const data = await response.json()
      if (data.success) {
        setDashboardPermisos(prev => prev.map(p => p.rol === rol ? { ...p, [campo]: valor } : p))
      }
    } catch (err) {
      console.error('[Settings] Error actualizando permiso dashboard:', err)
    }
  }

  // Cargar estado de API key y estadísticas de uso
  useEffect(() => {
    if (activeTab === 'ai') {
      loadApiKeyStatus()
      loadApiUsageStats()
      loadSavedKeys()
    }
  }, [activeTab, usagePeriod])

  // Escuchar navegación desde otras vistas (AI Dashboard)
  useEffect(() => {
    const handleOpenAITab = () => setActiveTab('ai')
    window.addEventListener('settings-open-ai-tab', handleOpenAITab)
    return () => window.removeEventListener('settings-open-ai-tab', handleOpenAITab)
  }, [])

  const loadSavedKeys = async () => {
    setLoadingKeys(true)
    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL || 'http://localhost:4000'}/api/api-keys`, {
        headers: { 'x-user-id': user?.id || '1' }
      })
      const data = await response.json()
      if (data.success) {
        setSavedApiKeys(data.data || [])
      }
    } catch (error) {
      console.error('Error cargando API keys guardadas:', error)
    } finally {
      setLoadingKeys(false)
    }
  }

  const loadApiKeyStatus = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL || 'http://localhost:4000'}/api/ai/status`, {
        headers: { 'x-user-id': user?.id || '1' }
      })
      const data = await response.json()
      if (data.success) {
        setApiKeyStatus(data.data)
      }
    } catch (error) {
      console.error('Error cargando estado de API key:', error)
    }
  }

  const loadApiUsageStats = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL || 'http://localhost:4000'}/api/api-keys/usage/stats?period=${usagePeriod}`, {
        headers: { 'x-user-id': user?.id || '1' }
      })
      const data = await response.json()
      if (data.success) {
        setApiUsageStats(data.data)
      }
    } catch (error) {
      console.error('Error cargando estadísticas:', error)
    }
  }

  const handleSaveApiKey = async () => {
    if (!apiKeyInput.trim()) {
      alert('Por favor ingresa una API Key')
      return
    }

    const provider = AI_PROVIDERS.find(p => p.id === selectedProvider)
    setApiKeyLoading(true)
    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL || 'http://localhost:4000'}/api/api-keys`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': user?.id || '1'
        },
        body: JSON.stringify({
          provider: selectedProvider,
          apiKey: apiKeyInput,
          nombre: apiKeyName || provider?.name || 'Default'
        })
      })
      const data = await response.json()
      if (data.success) {
        alert(`API Key de ${provider?.name || selectedProvider} guardada correctamente`)
        setApiKeyInput('')
        setApiKeyName('Default')
        loadApiKeyStatus()
        loadSavedKeys()
      } else {
        alert(data.error || 'Error al guardar API Key')
      }
    } catch (error) {
      alert('Error: ' + error.message)
    } finally {
      setApiKeyLoading(false)
    }
  }

  const handleTestApiKey = async () => {
    if (!apiKeyInput.trim()) {
      alert('Por favor ingresa una API Key para probar')
      return
    }

    setApiKeyTesting(true)
    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL || 'http://localhost:4000'}/api/api-keys/test/${selectedProvider}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': user?.id || '1'
        },
        body: JSON.stringify({ apiKey: apiKeyInput })
      })
      const data = await response.json()
      if (data.success) {
        const msg = data.data?.model
          ? `API Key valida!\nModelo: ${data.data.model}\nTiempo: ${data.data.responseTime}ms`
          : data.message || 'API Key aceptada'
        alert(msg)
      } else {
        alert(`API Key invalida: ${data.error}`)
      }
    } catch (error) {
      alert('Error probando API Key: ' + error.message)
    } finally {
      setApiKeyTesting(false)
    }
  }

  const handleDeleteApiKey = async (keyId) => {
    if (!confirm('¿Estás seguro de eliminar esta API Key?')) return

    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL || 'http://localhost:4000'}/api/api-keys/${keyId}`, {
        method: 'DELETE',
        headers: { 'x-user-id': user?.id || '1' }
      })
      const data = await response.json()
      if (data.success) {
        loadApiKeyStatus()
        loadSavedKeys()
      } else {
        alert(data.error || 'Error al eliminar API Key')
      }
    } catch (error) {
      alert('Error: ' + error.message)
    }
  }

  // Crear/Editar usuario
  const handleSaveUser = async () => {
    try {
      const url = editingUser
        ? `${import.meta.env.VITE_BACKEND_URL || 'http://localhost:4000'}/api/users/${editingUser.id}`
        : `${import.meta.env.VITE_BACKEND_URL || 'http://localhost:4000'}/api/users`

      const response = await authFetch(url, {
        method: editingUser ? 'PUT' : 'POST',
        body: JSON.stringify(userForm)
      })

      const data = await response.json()
      if (data.success) {
        setShowUserModal(false)
        setEditingUser(null)
        setUserForm({ nombre: '', email: '', password: '', rol: 'usuario', activo: true })
        loadUsers()
      } else {
        alert(data.error || 'Error al guardar usuario')
      }
    } catch (err) {
      alert('Error: ' + err.message)
    }
  }

  // Eliminar usuario
  const handleDeleteUser = async (userId) => {
    if (!confirm('¿Eliminar este usuario?')) return

    try {
      const response = await authFetch(
        `${import.meta.env.VITE_BACKEND_URL || 'http://localhost:4000'}/api/users/${userId}`,
        { method: 'DELETE' }
      )
      const data = await response.json()
      if (data.success) {
        loadUsers()
      } else {
        alert(data.error || 'Error al eliminar')
      }
    } catch (err) {
      alert('Error: ' + err.message)
    }
  }

  // Toggle estado usuario
  const handleToggleUserStatus = async (userId) => {
    try {
      const response = await authFetch(
        `${import.meta.env.VITE_BACKEND_URL || 'http://localhost:4000'}/api/users/${userId}/toggle-status`,
        { method: 'PUT' }
      )
      const data = await response.json()
      if (data.success) {
        loadUsers()
      }
    } catch (err) {
      console.error('Error:', err)
    }
  }

  // Abrir modal para editar
  const openEditUser = (userToEdit) => {
    setEditingUser(userToEdit)
    setUserForm({
      nombre: userToEdit.nombre,
      email: userToEdit.email,
      password: '',
      rol: userToEdit.rol,
      activo: userToEdit.activo
    })
    setShowUserModal(true)
  }

  // Abrir modal para crear
  const openCreateUser = () => {
    setEditingUser(null)
    setUserForm({ nombre: '', email: '', password: '', rol: 'usuario', activo: true })
    setShowUserModal(true)
  }

  // Aplicar tema al cargar
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', currentTheme)
    localStorage.setItem('alqvimia-theme', currentTheme)
  }, [currentTheme])

  // Cargar voces disponibles del sistema
  useEffect(() => {
    const loadVoices = () => {
      const voices = window.speechSynthesis.getVoices()
      setAvailableVoices(voices)

      // Si no hay voz seleccionada, seleccionar una voz en español por defecto
      if (!settings.agentVoice?.voiceId && voices.length > 0) {
        const spanishVoice = voices.find(v => v.lang.startsWith('es')) || voices[0]
        setSettings(prev => ({
          ...prev,
          agentVoice: { ...prev.agentVoice, voiceId: spanishVoice.voiceURI }
        }))
      }
    }

    loadVoices()
    // Las voces pueden cargarse de forma asíncrona
    window.speechSynthesis.onvoiceschanged = loadVoices

    return () => {
      window.speechSynthesis.onvoiceschanged = null
    }
  }, [])

  const handleThemeChange = (themeId) => {
    setCurrentTheme(themeId)
    setSettings({
      ...settings,
      general: { ...settings.general, theme: themeId }
    })
  }

  // Función para hacer que el agente hable
  const speakText = (text) => {
    if (!window.speechSynthesis) {
      alert('Tu navegador no soporta síntesis de voz')
      return
    }

    // Cancelar cualquier habla en progreso
    window.speechSynthesis.cancel()

    const utterance = new SpeechSynthesisUtterance(text)

    // Encontrar la voz seleccionada
    const selectedVoice = availableVoices.find(v => v.voiceURI === settings.agentVoice?.voiceId)
    if (selectedVoice) {
      utterance.voice = selectedVoice
    }

    utterance.rate = settings.agentVoice?.voiceRate || 1
    utterance.pitch = settings.agentVoice?.voicePitch || 1

    window.speechSynthesis.speak(utterance)
  }

  // Probar la voz del agente
  const testAgentVoice = () => {
    const greeting = settings.agentVoice?.greetingMessage?.replace('{agentName}', settings.agentVoice?.agentName || 'Alqvimia')
    speakText(greeting || `Hola, soy ${settings.agentVoice?.agentName || 'Alqvimia'}`)
  }

  const handleSave = () => {
    console.log('Guardando configuración:', settings)
    localStorage.setItem('alqvimia-theme', currentTheme)
    localStorage.setItem('alqvimia-settings', JSON.stringify(settings))
    alert('Configuración guardada')
  }

  return (
    <div className="view" id="settings-view">
      <div className="view-header">
        <h2><i className="fas fa-cog"></i> Configuraciones</h2>
        <p>Personaliza el comportamiento de Alqvimia RPA</p>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: '250px 1fr',
        gap: '2rem',
        background: 'var(--card-bg)',
        borderRadius: '12px',
        overflow: 'hidden'
      }}>
        {/* Sidebar de tabs */}
        <div style={{
          background: 'var(--dark-bg)',
          padding: '1rem'
        }}>
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                width: '100%',
                padding: '1rem',
                background: activeTab === tab.id ? 'var(--primary-color)' : 'transparent',
                border: 'none',
                borderRadius: '8px',
                color: activeTab === tab.id ? 'white' : 'var(--text-secondary)',
                cursor: 'pointer',
                marginBottom: '0.5rem',
                transition: 'all 0.2s',
                textAlign: 'left'
              }}
            >
              <i className={`fas ${tab.icon}`}></i>
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Contenido */}
        <div style={{ padding: '2rem' }}>
          {activeTab === 'general' && (
            <div>
              <h3 style={{ marginBottom: '1.5rem' }}>Configuración General</h3>

              <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>
                  Idioma
                </label>
                <select
                  value={settings.general.language}
                  onChange={(e) => setSettings({
                    ...settings,
                    general: { ...settings.general, language: e.target.value }
                  })}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    background: 'var(--dark-bg)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '8px',
                    color: 'var(--text-primary)'
                  }}
                >
                  <option value="es">Español</option>
                  <option value="en">English</option>
                  <option value="pt">Português</option>
                </select>
              </div>

              <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>
                  Tema
                </label>
                <select
                  value={settings.general.theme}
                  onChange={(e) => setSettings({
                    ...settings,
                    general: { ...settings.general, theme: e.target.value }
                  })}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    background: 'var(--dark-bg)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '8px',
                    color: 'var(--text-primary)'
                  }}
                >
                  <option value="dark">Oscuro</option>
                  <option value="light">Claro</option>
                </select>
              </div>

              <div className="form-group">
                <label className="toggle-label">
                  <input
                    type="checkbox"
                    checked={settings.general.autoSave}
                    onChange={(e) => setSettings({
                      ...settings,
                      general: { ...settings.general, autoSave: e.target.checked }
                    })}
                  />
                  <span className="toggle-switch"></span>
                  Guardar automáticamente
                </label>
              </div>

              <div className="form-group">
                <label className="toggle-label">
                  <input
                    type="checkbox"
                    checked={settings.general.notifications}
                    onChange={(e) => setSettings({
                      ...settings,
                      general: { ...settings.general, notifications: e.target.checked }
                    })}
                  />
                  <span className="toggle-switch"></span>
                  Notificaciones
                </label>
              </div>
            </div>
          )}

          {activeTab === 'appearance' && (
            <div>
              <div style={{ marginBottom: '2rem' }}>
                <h3 style={{ marginBottom: '0.5rem' }}>Personaliza tu Experiencia</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                  Elige un tema que se adapte a tu estilo. Los cambios se aplican inmediatamente.
                </p>
              </div>

              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                gap: '1.25rem'
              }}>
                {availableThemes.map(theme => (
                  <div
                    key={theme.id}
                    onClick={() => handleThemeChange(theme.id)}
                    style={{
                      background: currentTheme === theme.id
                        ? `linear-gradient(135deg, ${theme.preview.primary}20, ${theme.preview.accent}20)`
                        : 'var(--dark-bg)',
                      border: currentTheme === theme.id
                        ? `3px solid ${theme.preview.primary}`
                        : '2px solid var(--border-color)',
                      borderRadius: '16px',
                      padding: '1.25rem',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease',
                      position: 'relative',
                      overflow: 'hidden'
                    }}
                  >
                    {/* Preview de colores */}
                    <div style={{
                      display: 'flex',
                      gap: '0.5rem',
                      marginBottom: '1rem'
                    }}>
                      <div style={{
                        width: '100%',
                        height: '60px',
                        borderRadius: '10px',
                        background: theme.preview.bg,
                        display: 'flex',
                        overflow: 'hidden',
                        border: '1px solid rgba(255,255,255,0.1)'
                      }}>
                        <div style={{
                          width: '30%',
                          background: theme.preview.card,
                          borderRight: `2px solid ${theme.preview.primary}`
                        }}></div>
                        <div style={{
                          flex: 1,
                          padding: '0.5rem',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '0.25rem'
                        }}>
                          <div style={{
                            height: '10px',
                            width: '60%',
                            background: theme.preview.primary,
                            borderRadius: '3px'
                          }}></div>
                          <div style={{
                            height: '8px',
                            width: '80%',
                            background: `${theme.preview.accent}60`,
                            borderRadius: '3px'
                          }}></div>
                          <div style={{
                            height: '8px',
                            width: '40%',
                            background: `${theme.preview.accent}40`,
                            borderRadius: '3px'
                          }}></div>
                        </div>
                      </div>
                    </div>

                    {/* Info del tema */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                      <div style={{
                        width: '36px',
                        height: '36px',
                        borderRadius: '10px',
                        background: `linear-gradient(135deg, ${theme.preview.primary}, ${theme.preview.accent})`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                        fontSize: '1rem'
                      }}>
                        <i className={`fas ${theme.icon}`}></i>
                      </div>
                      <div style={{ flex: 1 }}>
                        <h4 style={{ margin: 0, fontSize: '1rem' }}>{theme.name}</h4>
                      </div>
                      {currentTheme === theme.id && (
                        <div style={{
                          background: theme.preview.primary,
                          color: 'white',
                          padding: '0.25rem 0.75rem',
                          borderRadius: '20px',
                          fontSize: '0.75rem',
                          fontWeight: '600'
                        }}>
                          Activo
                        </div>
                      )}
                    </div>
                    <p style={{
                      margin: 0,
                      fontSize: '0.85rem',
                      color: 'var(--text-secondary)',
                      lineHeight: 1.4
                    }}>
                      {theme.description}
                    </p>

                    {/* Barra de colores */}
                    <div style={{
                      display: 'flex',
                      gap: '0.35rem',
                      marginTop: '1rem'
                    }}>
                      <div style={{
                        flex: 1,
                        height: '6px',
                        borderRadius: '3px',
                        background: theme.preview.bg
                      }}></div>
                      <div style={{
                        flex: 1,
                        height: '6px',
                        borderRadius: '3px',
                        background: theme.preview.card
                      }}></div>
                      <div style={{
                        flex: 1,
                        height: '6px',
                        borderRadius: '3px',
                        background: theme.preview.primary
                      }}></div>
                      <div style={{
                        flex: 1,
                        height: '6px',
                        borderRadius: '3px',
                        background: theme.preview.accent
                      }}></div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Información adicional */}
              <div style={{
                marginTop: '2rem',
                padding: '1.5rem',
                background: 'var(--dark-bg)',
                borderRadius: '12px',
                border: '1px solid var(--border-color)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <i className="fas fa-info-circle" style={{ fontSize: '1.5rem', color: 'var(--primary-color)' }}></i>
                  <div>
                    <h4 style={{ margin: '0 0 0.25rem' }}>Tema actual: {availableThemes.find(t => t.id === currentTheme)?.name}</h4>
                    <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                      El tema se guarda automáticamente y se aplicará cada vez que inicies la aplicación.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'agent-voice' && (
            <div>
              <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <i className="fas fa-microphone-alt" style={{ color: 'var(--primary-color)' }}></i>
                Configuración de Voz del Agente
              </h3>

              <div style={{
                background: 'linear-gradient(135deg, rgba(37, 99, 235, 0.1), rgba(139, 92, 246, 0.1))',
                border: '1px solid rgba(37, 99, 235, 0.3)',
                borderRadius: '12px',
                padding: '1.5rem',
                marginBottom: '2rem'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                  <div style={{
                    width: '60px',
                    height: '60px',
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, var(--primary-color), var(--accent-color))',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}>
                    <i className="fas fa-robot" style={{ fontSize: '1.5rem', color: 'white' }}></i>
                  </div>
                  <div style={{ flex: 1, minWidth: '150px' }}>
                    <h4 style={{ margin: 0, fontSize: '1.25rem' }}>{settings.agentVoice?.agentName || 'Alqvimia'}</h4>
                    <p style={{ margin: '0.25rem 0 0', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                      Tu asistente de automatización con voz
                    </p>
                  </div>
                  <button
                    onClick={testAgentVoice}
                    style={{
                      padding: '1rem 2rem',
                      background: 'linear-gradient(135deg, #22c55e, #16a34a)',
                      border: 'none',
                      borderRadius: '10px',
                      color: 'white',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.75rem',
                      fontWeight: '700',
                      fontSize: '1rem',
                      boxShadow: '0 4px 15px rgba(34, 197, 94, 0.4)',
                      transition: 'all 0.2s',
                      flexShrink: 0
                    }}
                    onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                    onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
                  >
                    <i className="fas fa-volume-up" style={{ fontSize: '1.2rem' }}></i>
                    PROBAR VOZ
                  </button>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '2rem' }}>
                <div className="form-group">
                  <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)', fontWeight: '500' }}>
                    <i className="fas fa-signature" style={{ marginRight: '0.5rem' }}></i>
                    Nombre del Agente
                  </label>
                  <input
                    type="text"
                    value={settings.agentVoice?.agentName || 'Alqvimia'}
                    onChange={(e) => setSettings({
                      ...settings,
                      agentVoice: { ...settings.agentVoice, agentName: e.target.value }
                    })}
                    placeholder="Ej: Alqvimia, Asistente, Eva..."
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      background: 'var(--dark-bg)',
                      border: '1px solid var(--border-color)',
                      borderRadius: '8px',
                      color: 'var(--text-primary)',
                      fontSize: '1rem'
                    }}
                  />
                </div>

                <div className="form-group">
                  <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)', fontWeight: '500' }}>
                    <i className="fas fa-volume-up" style={{ marginRight: '0.5rem' }}></i>
                    Tipo de Voz
                  </label>
                  <select
                    value={settings.agentVoice?.voiceId || ''}
                    onChange={(e) => setSettings({
                      ...settings,
                      agentVoice: { ...settings.agentVoice, voiceId: e.target.value }
                    })}
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      background: 'var(--dark-bg)',
                      border: '1px solid var(--border-color)',
                      borderRadius: '8px',
                      color: 'var(--text-primary)',
                      fontSize: '1rem'
                    }}
                  >
                    <optgroup label="Voces en Español">
                      {availableVoices.filter(v => v.lang.startsWith('es')).map(voice => (
                        <option key={voice.voiceURI} value={voice.voiceURI}>
                          {voice.name} ({voice.lang})
                        </option>
                      ))}
                    </optgroup>
                    <optgroup label="Otras Voces">
                      {availableVoices.filter(v => !v.lang.startsWith('es')).map(voice => (
                        <option key={voice.voiceURI} value={voice.voiceURI}>
                          {voice.name} ({voice.lang})
                        </option>
                      ))}
                    </optgroup>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '2rem' }}>
                <div className="form-group">
                  <label style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', color: 'var(--text-secondary)', fontWeight: '500' }}>
                    <span><i className="fas fa-tachometer-alt" style={{ marginRight: '0.5rem' }}></i>Velocidad</span>
                    <span style={{ color: 'var(--primary-color)' }}>{settings.agentVoice?.voiceRate || 1}x</span>
                  </label>
                  <input
                    type="range"
                    min="0.5"
                    max="2"
                    step="0.1"
                    value={settings.agentVoice?.voiceRate || 1}
                    onChange={(e) => setSettings({
                      ...settings,
                      agentVoice: { ...settings.agentVoice, voiceRate: parseFloat(e.target.value) }
                    })}
                    style={{
                      width: '100%',
                      accentColor: 'var(--primary-color)'
                    }}
                  />
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                    <span>Lento</span>
                    <span>Normal</span>
                    <span>Rápido</span>
                  </div>
                </div>

                <div className="form-group">
                  <label style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', color: 'var(--text-secondary)', fontWeight: '500' }}>
                    <span><i className="fas fa-music" style={{ marginRight: '0.5rem' }}></i>Tono</span>
                    <span style={{ color: 'var(--primary-color)' }}>{settings.agentVoice?.voicePitch || 1}</span>
                  </label>
                  <input
                    type="range"
                    min="0.5"
                    max="2"
                    step="0.1"
                    value={settings.agentVoice?.voicePitch || 1}
                    onChange={(e) => setSettings({
                      ...settings,
                      agentVoice: { ...settings.agentVoice, voicePitch: parseFloat(e.target.value) }
                    })}
                    style={{
                      width: '100%',
                      accentColor: 'var(--primary-color)'
                    }}
                  />
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                    <span>Grave</span>
                    <span>Normal</span>
                    <span>Agudo</span>
                  </div>
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: '2rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)', fontWeight: '500' }}>
                  <i className="fas fa-comment-dots" style={{ marginRight: '0.5rem' }}></i>
                  Mensaje de Bienvenida
                </label>
                <textarea
                  value={settings.agentVoice?.greetingMessage || 'Hola, soy {agentName}, tu asistente de automatización. ¿En qué puedo ayudarte hoy?'}
                  onChange={(e) => setSettings({
                    ...settings,
                    agentVoice: { ...settings.agentVoice, greetingMessage: e.target.value }
                  })}
                  placeholder="Usa {agentName} para insertar el nombre del agente"
                  rows={3}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    background: 'var(--dark-bg)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '8px',
                    color: 'var(--text-primary)',
                    fontSize: '1rem',
                    resize: 'vertical',
                    fontFamily: 'inherit'
                  }}
                />
                <p style={{ margin: '0.5rem 0 0', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                  Usa <code style={{ background: 'var(--dark-bg)', padding: '2px 6px', borderRadius: '4px' }}>{'{agentName}'}</code> para insertar el nombre del agente dinámicamente
                </p>
              </div>

              <div style={{
                background: 'var(--dark-bg)',
                border: '1px solid var(--border-color)',
                borderRadius: '12px',
                padding: '1.5rem'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <i className="fas fa-hand-sparkles" style={{ fontSize: '1.5rem', color: 'var(--primary-color)' }}></i>
                    <div>
                      <h4 style={{ margin: 0 }}>Presentarse al Iniciar</h4>
                      <p style={{ margin: '0.25rem 0 0', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                        El agente se presentará con su nombre y saludo cuando abras la aplicación
                      </p>
                    </div>
                  </div>
                  <label style={{ position: 'relative', width: '50px', height: '26px' }}>
                    <input
                      type="checkbox"
                      checked={settings.agentVoice?.speakOnStart ?? true}
                      onChange={(e) => setSettings({
                        ...settings,
                        agentVoice: { ...settings.agentVoice, speakOnStart: e.target.checked }
                      })}
                      style={{ opacity: 0, width: 0, height: 0 }}
                    />
                    <span style={{
                      position: 'absolute',
                      cursor: 'pointer',
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      background: settings.agentVoice?.speakOnStart ? 'var(--success-color)' : 'var(--secondary-color)',
                      borderRadius: '26px',
                      transition: 'all 0.3s'
                    }}>
                      <span style={{
                        position: 'absolute',
                        height: '20px',
                        width: '20px',
                        left: settings.agentVoice?.speakOnStart ? '26px' : '3px',
                        bottom: '3px',
                        background: 'white',
                        borderRadius: '50%',
                        transition: 'all 0.3s'
                      }}></span>
                    </span>
                  </label>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'server' && (
            <div>
              <h3 style={{ marginBottom: '1.5rem' }}>Configuración del Servidor</h3>

              <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>
                  Host
                </label>
                <input
                  type="text"
                  value={settings.server.host}
                  onChange={(e) => setSettings({
                    ...settings,
                    server: { ...settings.server, host: e.target.value }
                  })}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    background: 'var(--dark-bg)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '8px',
                    color: 'var(--text-primary)'
                  }}
                />
              </div>

              <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>
                  Puerto
                </label>
                <input
                  type="text"
                  value={settings.server.port}
                  onChange={(e) => setSettings({
                    ...settings,
                    server: { ...settings.server, port: e.target.value }
                  })}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    background: 'var(--dark-bg)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '8px',
                    color: 'var(--text-primary)'
                  }}
                />
              </div>

              <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>
                  Timeout (ms)
                </label>
                <input
                  type="text"
                  value={settings.server.timeout}
                  onChange={(e) => setSettings({
                    ...settings,
                    server: { ...settings.server, timeout: e.target.value }
                  })}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    background: 'var(--dark-bg)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '8px',
                    color: 'var(--text-primary)'
                  }}
                />
              </div>
            </div>
          )}

          {activeTab === 'ai' && (
            <div>
              <h3 style={{ marginBottom: '1.5rem' }}>
                <i className="fas fa-brain" style={{ marginRight: '0.5rem', color: 'var(--primary-color)' }}></i>
                Configuracion de Proveedores de IA
              </h3>

              {/* Resumen de estado */}
              <div style={{
                padding: '1rem',
                background: savedApiKeys.filter(k => k.activo).length > 0 ? 'rgba(16, 185, 129, 0.1)' : 'rgba(245, 158, 11, 0.1)',
                border: `1px solid ${savedApiKeys.filter(k => k.activo).length > 0 ? 'rgba(16, 185, 129, 0.3)' : 'rgba(245, 158, 11, 0.3)'}`,
                borderRadius: '8px',
                marginBottom: '1.5rem',
                display: 'flex',
                alignItems: 'center',
                gap: '1rem'
              }}>
                <i className={`fas ${savedApiKeys.filter(k => k.activo).length > 0 ? 'fa-check-circle' : 'fa-exclamation-triangle'}`}
                   style={{ fontSize: '1.5rem', color: savedApiKeys.filter(k => k.activo).length > 0 ? '#10b981' : '#f59e0b' }}></i>
                <div>
                  <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                    {savedApiKeys.filter(k => k.activo).length > 0
                      ? `${savedApiKeys.filter(k => k.activo).length} proveedor(es) configurado(s)`
                      : 'Ningun proveedor configurado'}
                  </div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                    {savedApiKeys.filter(k => k.activo).length > 0
                      ? `Activos: ${[...new Set(savedApiKeys.filter(k => k.activo).map(k => k.provider))].join(', ')}`
                      : 'Selecciona un proveedor y configura tu API Key para usar las funciones de IA'}
                  </div>
                </div>
              </div>

              {/* Grid de proveedores */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
                gap: '0.75rem',
                marginBottom: '1.5rem'
              }}>
                {AI_PROVIDERS.map(provider => {
                  const providerKeys = savedApiKeys.filter(k => k.provider === provider.id && k.activo)
                  const isConfigured = providerKeys.length > 0
                  const isSelected = selectedProvider === provider.id
                  return (
                    <div
                      key={provider.id}
                      onClick={() => setSelectedProvider(provider.id)}
                      style={{
                        padding: '1rem',
                        background: isSelected ? `${provider.color}15` : 'var(--card-bg)',
                        border: `2px solid ${isSelected ? provider.color : isConfigured ? 'rgba(16, 185, 129, 0.4)' : 'var(--border-color)'}`,
                        borderRadius: '12px',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        position: 'relative',
                        textAlign: 'center'
                      }}
                    >
                      {isConfigured && (
                        <div style={{
                          position: 'absolute',
                          top: '6px',
                          right: '6px',
                          width: '18px',
                          height: '18px',
                          borderRadius: '50%',
                          background: '#10b981',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}>
                          <i className="fas fa-check" style={{ color: 'white', fontSize: '0.6rem' }}></i>
                        </div>
                      )}
                      <div style={{
                        width: '44px',
                        height: '44px',
                        borderRadius: '12px',
                        background: `${provider.color}20`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 auto 0.5rem'
                      }}>
                        <i className={`fas ${provider.icon}`} style={{ color: provider.color, fontSize: '1.2rem' }}></i>
                      </div>
                      <div style={{ fontWeight: 600, fontSize: '0.85rem', color: 'var(--text-primary)', marginBottom: '0.25rem' }}>
                        {provider.name}
                      </div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', lineHeight: 1.3 }}>
                        {provider.description}
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* Formulario de configuracion del proveedor seleccionado */}
              {(() => {
                const provider = AI_PROVIDERS.find(p => p.id === selectedProvider)
                if (!provider) return null
                const providerKeys = savedApiKeys.filter(k => k.provider === provider.id)
                const activeKey = providerKeys.find(k => k.activo)
                return (
                  <div style={{
                    padding: '1.5rem',
                    background: 'var(--card-bg)',
                    borderRadius: '12px',
                    border: `2px solid ${provider.color}40`,
                    marginBottom: '1.5rem'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
                      <div style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: '10px',
                        background: `${provider.color}20`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        <i className={`fas ${provider.icon}`} style={{ color: provider.color, fontSize: '1.1rem' }}></i>
                      </div>
                      <div>
                        <h4 style={{ margin: 0 }}>Configurar {provider.name}</h4>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                          Modelos: {provider.models.join(', ')}
                        </div>
                      </div>
                      {activeKey && (
                        <span style={{
                          marginLeft: 'auto',
                          padding: '0.25rem 0.75rem',
                          background: 'rgba(16, 185, 129, 0.15)',
                          color: '#10b981',
                          borderRadius: '20px',
                          fontSize: '0.75rem',
                          fontWeight: 600
                        }}>
                          <i className="fas fa-check-circle" style={{ marginRight: '0.25rem' }}></i>
                          Configurada
                        </span>
                      )}
                    </div>

                    {/* Key guardada activa */}
                    {activeKey && (
                      <div style={{
                        padding: '0.75rem 1rem',
                        background: 'rgba(16, 185, 129, 0.08)',
                        border: '1px solid rgba(16, 185, 129, 0.2)',
                        borderRadius: '8px',
                        marginBottom: '1rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between'
                      }}>
                        <div>
                          <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                            <i className="fas fa-key" style={{ marginRight: '0.5rem', color: '#10b981' }}></i>
                            {activeKey.nombre || 'Default'}
                          </div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                            Guardada: {new Date(activeKey.created_at).toLocaleDateString()}
                            {activeKey.ultimo_uso && ` | Ultimo uso: ${new Date(activeKey.ultimo_uso).toLocaleDateString()}`}
                          </div>
                        </div>
                        <button
                          onClick={() => handleDeleteApiKey(activeKey.id)}
                          style={{
                            padding: '0.4rem 0.75rem',
                            background: 'rgba(239, 68, 68, 0.1)',
                            border: '1px solid rgba(239, 68, 68, 0.3)',
                            borderRadius: '6px',
                            color: '#ef4444',
                            cursor: 'pointer',
                            fontSize: '0.8rem',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.35rem'
                          }}
                        >
                          <i className="fas fa-trash-alt"></i>
                          Eliminar
                        </button>
                      </div>
                    )}

                    {/* Formulario */}
                    <div style={{ marginBottom: '1rem' }}>
                      <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                        Nombre (opcional)
                      </label>
                      <input
                        type="text"
                        value={apiKeyName}
                        onChange={(e) => setApiKeyName(e.target.value)}
                        placeholder={`Mi key de ${provider.name}`}
                        style={{
                          width: '100%',
                          padding: '0.75rem',
                          background: 'var(--dark-bg)',
                          border: '1px solid var(--border-color)',
                          borderRadius: '8px',
                          color: 'var(--text-primary)'
                        }}
                      />
                    </div>

                    <div style={{ marginBottom: '1rem' }}>
                      <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                        API Key
                      </label>
                      <input
                        type="password"
                        value={apiKeyInput}
                        onChange={(e) => setApiKeyInput(e.target.value)}
                        placeholder={provider.placeholder}
                        style={{
                          width: '100%',
                          padding: '0.75rem',
                          background: 'var(--dark-bg)',
                          border: '1px solid var(--border-color)',
                          borderRadius: '8px',
                          color: 'var(--text-primary)',
                          fontFamily: 'monospace'
                        }}
                      />
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
                        <i className="fas fa-shield-alt" style={{ marginRight: '0.25rem' }}></i>
                        Se almacena encriptada (AES-256-GCM) en la base de datos
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                      <button
                        onClick={handleTestApiKey}
                        disabled={apiKeyTesting || !apiKeyInput.trim()}
                        style={{
                          padding: '0.75rem 1.5rem',
                          background: 'var(--dark-bg)',
                          border: '1px solid var(--border-color)',
                          borderRadius: '8px',
                          color: 'var(--text-primary)',
                          cursor: apiKeyTesting || !apiKeyInput.trim() ? 'not-allowed' : 'pointer',
                          opacity: apiKeyTesting || !apiKeyInput.trim() ? 0.5 : 1,
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.5rem'
                        }}
                      >
                        {apiKeyTesting ? <i className="fas fa-spinner fa-spin"></i> : <i className="fas fa-flask"></i>}
                        Probar Key
                      </button>
                      <button
                        onClick={handleSaveApiKey}
                        disabled={apiKeyLoading || !apiKeyInput.trim()}
                        style={{
                          padding: '0.75rem 1.5rem',
                          background: apiKeyLoading || !apiKeyInput.trim() ? 'var(--dark-bg)' : provider.color,
                          border: 'none',
                          borderRadius: '8px',
                          color: 'white',
                          cursor: apiKeyLoading || !apiKeyInput.trim() ? 'not-allowed' : 'pointer',
                          opacity: apiKeyLoading || !apiKeyInput.trim() ? 0.5 : 1,
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.5rem'
                        }}
                      >
                        {apiKeyLoading ? <i className="fas fa-spinner fa-spin"></i> : <i className="fas fa-save"></i>}
                        {activeKey ? 'Reemplazar Key' : 'Guardar Key'}
                      </button>
                    </div>

                    <div style={{ marginTop: '1rem', padding: '0.75rem', background: `${provider.color}10`, borderRadius: '8px', fontSize: '0.85rem', border: `1px solid ${provider.color}20` }}>
                      <i className="fas fa-external-link-alt" style={{ marginRight: '0.5rem', color: provider.color }}></i>
                      Obten tu API Key en{' '}
                      <a href={provider.url} target="_blank" rel="noopener noreferrer" style={{ color: provider.color, fontWeight: 600 }}>
                        {provider.url.replace('https://', '').split('/')[0]}
                      </a>
                    </div>
                  </div>
                )
              })()}

              {/* Estadísticas de uso */}
              <div style={{
                padding: '1.5rem',
                background: 'var(--card-bg)',
                borderRadius: '12px',
                border: '1px solid var(--border-color)',
                marginBottom: '1.5rem'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                  <h4 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <i className="fas fa-chart-bar" style={{ color: 'var(--primary-color)' }}></i>
                    Estadisticas de Uso
                  </h4>
                  <select
                    value={usagePeriod}
                    onChange={(e) => setUsagePeriod(e.target.value)}
                    style={{
                      padding: '0.5rem 0.75rem',
                      background: 'var(--dark-bg)',
                      border: '1px solid var(--border-color)',
                      borderRadius: '6px',
                      color: 'var(--text-primary)',
                      fontSize: '0.85rem'
                    }}
                  >
                    <option value="24h">Ultimas 24 horas</option>
                    <option value="7d">Ultimos 7 dias</option>
                    <option value="30d">Ultimos 30 dias</option>
                  </select>
                </div>

                {apiUsageStats?.totals ? (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem' }}>
                    <div style={{ padding: '1rem', background: 'var(--dark-bg)', borderRadius: '8px', textAlign: 'center' }}>
                      <div style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--primary-color)' }}>
                        {apiUsageStats.totals.total_llamadas || 0}
                      </div>
                      <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Llamadas API</div>
                    </div>
                    <div style={{ padding: '1rem', background: 'var(--dark-bg)', borderRadius: '8px', textAlign: 'center' }}>
                      <div style={{ fontSize: '1.75rem', fontWeight: 700, color: '#10b981' }}>
                        {((apiUsageStats.totals.total_tokens || 0) / 1000).toFixed(1)}K
                      </div>
                      <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Tokens</div>
                    </div>
                    <div style={{ padding: '1rem', background: 'var(--dark-bg)', borderRadius: '8px', textAlign: 'center' }}>
                      <div style={{ fontSize: '1.75rem', fontWeight: 700, color: '#f59e0b' }}>
                        ${(apiUsageStats.totals.costo_total || 0).toFixed(4)}
                      </div>
                      <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Costo Estimado</div>
                    </div>
                  </div>
                ) : (
                  <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)' }}>
                    <i className="fas fa-chart-line" style={{ fontSize: '2rem', marginBottom: '0.5rem', opacity: 0.5 }}></i>
                    <div>Sin datos de uso aun</div>
                  </div>
                )}

                {apiUsageStats?.byModel && apiUsageStats.byModel.length > 0 && (
                  <div style={{ marginTop: '1.5rem' }}>
                    <h5 style={{ marginBottom: '0.75rem', color: 'var(--text-secondary)' }}>Uso por Modelo</h5>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      {apiUsageStats.byModel.map((model, index) => (
                        <div key={index} style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          padding: '0.75rem',
                          background: 'var(--dark-bg)',
                          borderRadius: '6px'
                        }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <i className="fas fa-microchip" style={{ color: 'var(--primary-color)' }}></i>
                            <span>{model.modelo}</span>
                          </div>
                          <div style={{ display: 'flex', gap: '1.5rem', fontSize: '0.85rem' }}>
                            <span style={{ color: 'var(--text-secondary)' }}>{model.total_llamadas} llamadas</span>
                            <span style={{ color: '#10b981' }}>{(model.total_tokens / 1000).toFixed(1)}K tokens</span>
                            <span style={{ color: '#f59e0b' }}>${parseFloat(model.costo_total || 0).toFixed(4)}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Configuracion de modelo y temperatura */}
              <div style={{
                padding: '1.5rem',
                background: 'var(--card-bg)',
                borderRadius: '12px',
                border: '1px solid var(--border-color)'
              }}>
                <h4 style={{ margin: '0 0 1rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <i className="fas fa-sliders-h" style={{ color: 'var(--primary-color)' }}></i>
                  Configuracion del Modelo
                </h4>

                <div className="form-group" style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>
                    Modelo por defecto
                  </label>
                  <select
                    value={settings.ai.model}
                    onChange={(e) => setSettings({
                      ...settings,
                      ai: { ...settings.ai, model: e.target.value }
                    })}
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      background: 'var(--dark-bg)',
                      border: '1px solid var(--border-color)',
                      borderRadius: '8px',
                      color: 'var(--text-primary)'
                    }}
                  >
                    <optgroup label="Anthropic (Claude)">
                      <option value="claude-3-5-sonnet-20241022">Claude 3.5 Sonnet ($3/$15 por 1M tokens)</option>
                      <option value="claude-3-5-haiku-20241022">Claude 3.5 Haiku ($0.80/$4 por 1M tokens)</option>
                      <option value="claude-3-opus-20240229">Claude 3 Opus ($15/$75 por 1M tokens)</option>
                    </optgroup>
                    <optgroup label="OpenAI">
                      <option value="gpt-4o">GPT-4o ($5/$15 por 1M tokens)</option>
                      <option value="gpt-4o-mini">GPT-4o Mini ($0.15/$0.60 por 1M tokens)</option>
                      <option value="gpt-4-turbo">GPT-4 Turbo ($10/$30 por 1M tokens)</option>
                    </optgroup>
                    <optgroup label="Google (Gemini)">
                      <option value="gemini-1.5-pro">Gemini 1.5 Pro</option>
                      <option value="gemini-1.5-flash">Gemini 1.5 Flash</option>
                    </optgroup>
                    <optgroup label="Mistral">
                      <option value="mistral-large-latest">Mistral Large</option>
                      <option value="mistral-medium-latest">Mistral Medium</option>
                    </optgroup>
                  </select>
                </div>

                <div className="form-group">
                  <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>
                    Temperature: {settings.ai.temperature}
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={settings.ai.temperature}
                    onChange={(e) => setSettings({
                      ...settings,
                      ai: { ...settings.ai, temperature: e.target.value }
                    })}
                    style={{ width: '100%' }}
                  />
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                    <span>Preciso</span>
                    <span>Creativo</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'ai-templates' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h3 style={{ margin: 0 }}>Plantillas de IA</h3>
                <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                  {aiTemplates.length} plantillas disponibles
                </span>
              </div>

              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                gap: '1rem',
                maxHeight: '500px',
                overflowY: 'auto',
                paddingRight: '0.5rem'
              }}>
                {aiTemplates.map(template => (
                  <div
                    key={template.id}
                    onClick={() => setSelectedAITemplate(selectedAITemplate?.id === template.id ? null : template)}
                    style={{
                      background: selectedAITemplate?.id === template.id ? 'var(--primary-color)' : 'var(--dark-bg)',
                      border: `2px solid ${selectedAITemplate?.id === template.id ? template.color : 'var(--border-color)'}`,
                      borderRadius: '12px',
                      padding: '1.25rem',
                      cursor: 'pointer',
                      transition: 'all 0.2s'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
                      <div style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: '10px',
                        background: template.color,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        <i className={`fas ${template.icon}`} style={{ color: 'white', fontSize: '1.1rem' }}></i>
                      </div>
                      <div>
                        <h4 style={{ margin: 0, fontSize: '1rem' }}>{template.name}</h4>
                        <span style={{
                          fontSize: '0.75rem',
                          background: 'var(--secondary-color)',
                          padding: '0.15rem 0.5rem',
                          borderRadius: '4px',
                          color: 'var(--text-secondary)'
                        }}>
                          {template.category}
                        </span>
                      </div>
                    </div>
                    <p style={{
                      margin: 0,
                      fontSize: '0.85rem',
                      color: 'var(--text-secondary)',
                      lineHeight: 1.4
                    }}>
                      {template.description}
                    </p>
                    {selectedAITemplate?.id === template.id && (
                      <div style={{
                        marginTop: '1rem',
                        padding: '0.75rem',
                        background: 'rgba(0,0,0,0.2)',
                        borderRadius: '8px',
                        fontSize: '0.8rem'
                      }}>
                        <strong style={{ color: 'var(--text-primary)' }}>Prompt:</strong>
                        <p style={{ margin: '0.5rem 0 0', color: 'var(--text-secondary)', fontStyle: 'italic' }}>
                          {template.prompt}
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {selectedAITemplate && (
                <div style={{
                  marginTop: '1.5rem',
                  padding: '1rem',
                  background: 'var(--dark-bg)',
                  borderRadius: '8px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <span>
                    <strong>{selectedAITemplate.name}</strong> seleccionada
                  </span>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button className="btn btn-secondary" onClick={() => setSelectedAITemplate(null)}>
                      Cancelar
                    </button>
                    <button
                      className="btn btn-primary"
                      onClick={() => {
                        // Agregar la plantilla como paso en el workflow
                        addStep({
                          type: `ai_template_${selectedAITemplate.id}`,
                          label: selectedAITemplate.name,
                          icon: selectedAITemplate.icon,
                          properties: {
                            provider: 'openai',
                            model: 'gpt-4-turbo',
                            input: '',
                            temperature: 0.7,
                            maxTokens: 2000,
                            outputVariable: `${selectedAITemplate.id}_result`
                          }
                        })
                        setSelectedAITemplate(null)
                        // Mostrar notificación de éxito
                        alert(`Plantilla "${selectedAITemplate.name}" agregada al workflow`)
                      }}
                    >
                      <i className="fas fa-plus"></i> Usar Plantilla
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'agent-templates' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h3 style={{ margin: 0 }}>Plantillas de Agentes</h3>
                <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                  {agentTemplates.length} plantillas disponibles
                </span>
              </div>

              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                gap: '1rem',
                maxHeight: '500px',
                overflowY: 'auto',
                paddingRight: '0.5rem'
              }}>
                {agentTemplates.map(template => (
                  <div
                    key={template.id}
                    onClick={() => setSelectedAgentTemplate(selectedAgentTemplate?.id === template.id ? null : template)}
                    style={{
                      background: selectedAgentTemplate?.id === template.id ? 'var(--primary-color)' : 'var(--dark-bg)',
                      border: `2px solid ${selectedAgentTemplate?.id === template.id ? template.color : 'var(--border-color)'}`,
                      borderRadius: '12px',
                      padding: '1.25rem',
                      cursor: 'pointer',
                      transition: 'all 0.2s'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
                      <div style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: '10px',
                        background: template.color,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        <i className={`fas ${template.icon}`} style={{ color: 'white', fontSize: '1.1rem' }}></i>
                      </div>
                      <div>
                        <h4 style={{ margin: 0, fontSize: '1rem' }}>{template.name}</h4>
                        <span style={{
                          fontSize: '0.75rem',
                          background: 'var(--secondary-color)',
                          padding: '0.15rem 0.5rem',
                          borderRadius: '4px',
                          color: 'var(--text-secondary)'
                        }}>
                          {template.category}
                        </span>
                      </div>
                    </div>
                    <p style={{
                      margin: '0 0 0.75rem',
                      fontSize: '0.85rem',
                      color: 'var(--text-secondary)',
                      lineHeight: 1.4
                    }}>
                      {template.description}
                    </p>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
                      {template.capabilities.slice(0, selectedAgentTemplate?.id === template.id ? undefined : 2).map((cap, idx) => (
                        <span
                          key={idx}
                          style={{
                            fontSize: '0.7rem',
                            background: `${template.color}30`,
                            color: template.color,
                            padding: '0.2rem 0.5rem',
                            borderRadius: '4px'
                          }}
                        >
                          {cap}
                        </span>
                      ))}
                      {selectedAgentTemplate?.id !== template.id && template.capabilities.length > 2 && (
                        <span style={{
                          fontSize: '0.7rem',
                          color: 'var(--text-secondary)',
                          padding: '0.2rem 0.5rem'
                        }}>
                          +{template.capabilities.length - 2} más
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {selectedAgentTemplate && (
                <div style={{
                  marginTop: '1.5rem',
                  padding: '1rem',
                  background: 'var(--dark-bg)',
                  borderRadius: '8px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <span>
                    <strong>{selectedAgentTemplate.name}</strong> seleccionado
                  </span>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button className="btn btn-secondary" onClick={() => setSelectedAgentTemplate(null)}>
                      Cancelar
                    </button>
                    <button className="btn btn-primary">
                      <i className="fas fa-plus"></i> Crear Agente
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Configuración OCR Mejorada */}
          {activeTab === 'ocr' && (
            <div className="settings-section">
              <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                <i className="fas fa-eye" style={{ color: 'var(--primary-color)' }}></i>
                {t('ocr_title')}
              </h3>
              <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>
                {t('ocr_subtitle')}
              </p>

              {/* Tarjetas de Proveedores OCR */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
                gap: '1.5rem',
                marginBottom: '2rem'
              }}>
                {/* Tesseract OCR - Gratuito/Local */}
                <div style={{
                  background: settings.ocr?.provider === 'tesseract' ? 'linear-gradient(135deg, rgba(34, 197, 94, 0.1), rgba(34, 197, 94, 0.05))' : 'var(--dark-bg)',
                  border: settings.ocr?.provider === 'tesseract' ? '2px solid #22c55e' : '1px solid var(--border-color)',
                  borderRadius: '16px',
                  padding: '1.5rem',
                  cursor: 'pointer',
                  transition: 'all 0.3s'
                }} onClick={() => setSettings({...settings, ocr: {...settings.ocr, provider: 'tesseract'}})}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem', marginBottom: '1rem' }}>
                    <div style={{
                      width: '56px',
                      height: '56px',
                      borderRadius: '12px',
                      background: 'linear-gradient(135deg, #22c55e, #16a34a)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0
                    }}>
                      <i className="fas fa-font" style={{ color: 'white', fontSize: '1.5rem' }}></i>
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                        <h4 style={{ margin: 0, fontSize: '1.1rem' }}>{t('ocr_tesseract')}</h4>
                        <span style={{
                          background: '#22c55e',
                          color: 'white',
                          padding: '0.15rem 0.5rem',
                          borderRadius: '4px',
                          fontSize: '0.7rem',
                          fontWeight: '600'
                        }}>{t('ocr_free')}</span>
                      </div>
                      <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                        {t('ocr_tesseract_desc')}
                      </p>
                    </div>
                    {settings.ocr?.provider === 'tesseract' && (
                      <i className="fas fa-check-circle" style={{ color: '#22c55e', fontSize: '1.5rem' }}></i>
                    )}
                  </div>

                  <div style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: '0.5rem',
                    marginBottom: '1rem'
                  }}>
                    <span style={{ background: 'rgba(34, 197, 94, 0.2)', color: '#22c55e', padding: '0.25rem 0.75rem', borderRadius: '20px', fontSize: '0.75rem' }}>
                      <i className="fas fa-download"></i> {t('ocr_offline')}
                    </span>
                    <span style={{ background: 'rgba(34, 197, 94, 0.2)', color: '#22c55e', padding: '0.25rem 0.75rem', borderRadius: '20px', fontSize: '0.75rem' }}>
                      <i className="fas fa-globe"></i> +100 {t('ocr_languages')}
                    </span>
                    <span style={{ background: 'rgba(34, 197, 94, 0.2)', color: '#22c55e', padding: '0.25rem 0.75rem', borderRadius: '20px', fontSize: '0.75rem' }}>
                      <i className="fas fa-lock-open"></i> {t('ocr_open_source')}
                    </span>
                  </div>

                  {settings.ocr?.provider === 'tesseract' && (
                    <div style={{
                      background: 'var(--bg-secondary)',
                      borderRadius: '10px',
                      padding: '1rem',
                      marginTop: '1rem'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                        <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                          <i className="fas fa-info-circle"></i> Estado de instalación
                        </span>
                        <span style={{
                          background: 'rgba(34, 197, 94, 0.2)',
                          color: '#22c55e',
                          padding: '0.25rem 0.75rem',
                          borderRadius: '4px',
                          fontSize: '0.75rem'
                        }}>
                          <i className="fas fa-check"></i> {t('ocr_ready')}
                        </span>
                      </div>
                      <button
                        className="btn btn-secondary"
                        style={{ width: '100%' }}
                        onClick={(e) => {
                          e.stopPropagation();
                          alert('Verificando instalación de Tesseract...\n\nSi no está instalado, se descargará automáticamente.');
                        }}
                      >
                        <i className="fas fa-sync"></i> Verificar/Actualizar Tesseract
                      </button>
                    </div>
                  )}
                </div>

                {/* Microsoft Azure Computer Vision */}
                <div style={{
                  background: settings.ocr?.provider === 'azure' ? 'linear-gradient(135deg, rgba(0, 120, 212, 0.1), rgba(0, 120, 212, 0.05))' : 'var(--dark-bg)',
                  border: settings.ocr?.provider === 'azure' ? '2px solid #0078d4' : '1px solid var(--border-color)',
                  borderRadius: '16px',
                  padding: '1.5rem',
                  cursor: 'pointer',
                  transition: 'all 0.3s'
                }} onClick={() => setSettings({...settings, ocr: {...settings.ocr, provider: 'azure'}})}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem', marginBottom: '1rem' }}>
                    <div style={{
                      width: '56px',
                      height: '56px',
                      borderRadius: '12px',
                      background: 'linear-gradient(135deg, #0078d4, #005a9e)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0
                    }}>
                      <i className="fab fa-microsoft" style={{ color: 'white', fontSize: '1.5rem' }}></i>
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                        <h4 style={{ margin: 0, fontSize: '1.1rem' }}>Azure Computer Vision</h4>
                        <span style={{
                          background: '#0078d4',
                          color: 'white',
                          padding: '0.15rem 0.5rem',
                          borderRadius: '4px',
                          fontSize: '0.7rem',
                          fontWeight: '600'
                        }}>CLOUD</span>
                      </div>
                      <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                        OCR empresarial de Microsoft con IA avanzada y alta precisión.
                      </p>
                    </div>
                    {settings.ocr?.provider === 'azure' && (
                      <i className="fas fa-check-circle" style={{ color: '#0078d4', fontSize: '1.5rem' }}></i>
                    )}
                  </div>

                  <div style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: '0.5rem',
                    marginBottom: '1rem'
                  }}>
                    <span style={{ background: 'rgba(0, 120, 212, 0.2)', color: '#0078d4', padding: '0.25rem 0.75rem', borderRadius: '20px', fontSize: '0.75rem' }}>
                      <i className="fas fa-brain"></i> IA Avanzada
                    </span>
                    <span style={{ background: 'rgba(0, 120, 212, 0.2)', color: '#0078d4', padding: '0.25rem 0.75rem', borderRadius: '20px', fontSize: '0.75rem' }}>
                      <i className="fas fa-table"></i> Tablas/Forms
                    </span>
                    <span style={{ background: 'rgba(0, 120, 212, 0.2)', color: '#0078d4', padding: '0.25rem 0.75rem', borderRadius: '20px', fontSize: '0.75rem' }}>
                      <i className="fas fa-signature"></i> Escritura a mano
                    </span>
                  </div>

                  {settings.ocr?.provider === 'azure' && (
                    <div style={{
                      background: 'var(--bg-secondary)',
                      borderRadius: '10px',
                      padding: '1rem',
                      marginTop: '1rem'
                    }} onClick={(e) => e.stopPropagation()}>
                      <div className="form-group" style={{ marginBottom: '0.75rem' }}>
                        <label style={{ display: 'block', marginBottom: '0.25rem', color: 'var(--text-secondary)', fontSize: '0.8rem' }}>
                          Endpoint de Azure
                        </label>
                        <input
                          type="text"
                          placeholder="https://your-resource.cognitiveservices.azure.com/"
                          value={settings.ocr?.azureEndpoint || ''}
                          onChange={(e) => setSettings({...settings, ocr: {...settings.ocr, azureEndpoint: e.target.value}})}
                          style={{
                            width: '100%',
                            padding: '0.6rem 0.75rem',
                            background: 'var(--dark-bg)',
                            border: '1px solid var(--border-color)',
                            borderRadius: '6px',
                            color: 'var(--text-primary)',
                            fontSize: '0.85rem'
                          }}
                        />
                      </div>
                      <div className="form-group" style={{ marginBottom: '0.75rem' }}>
                        <label style={{ display: 'block', marginBottom: '0.25rem', color: 'var(--text-secondary)', fontSize: '0.8rem' }}>
                          API Key
                        </label>
                        <input
                          type="password"
                          placeholder="Tu clave de API de Azure"
                          value={settings.ocr?.azureKey || ''}
                          onChange={(e) => setSettings({...settings, ocr: {...settings.ocr, azureKey: e.target.value}})}
                          style={{
                            width: '100%',
                            padding: '0.6rem 0.75rem',
                            background: 'var(--dark-bg)',
                            border: '1px solid var(--border-color)',
                            borderRadius: '6px',
                            color: 'var(--text-primary)',
                            fontSize: '0.85rem'
                          }}
                        />
                      </div>
                      <a
                        href="https://portal.azure.com/#create/Microsoft.CognitiveServicesComputerVision"
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ color: '#0078d4', fontSize: '0.8rem', textDecoration: 'none' }}
                      >
                        <i className="fas fa-external-link-alt"></i> Crear recurso en Azure Portal
                      </a>
                    </div>
                  )}
                </div>

                {/* Google Cloud Vision */}
                <div style={{
                  background: settings.ocr?.provider === 'google' ? 'linear-gradient(135deg, rgba(234, 67, 53, 0.1), rgba(251, 188, 5, 0.05))' : 'var(--dark-bg)',
                  border: settings.ocr?.provider === 'google' ? '2px solid #ea4335' : '1px solid var(--border-color)',
                  borderRadius: '16px',
                  padding: '1.5rem',
                  cursor: 'pointer',
                  transition: 'all 0.3s'
                }} onClick={() => setSettings({...settings, ocr: {...settings.ocr, provider: 'google'}})}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem', marginBottom: '1rem' }}>
                    <div style={{
                      width: '56px',
                      height: '56px',
                      borderRadius: '12px',
                      background: 'linear-gradient(135deg, #ea4335, #fbbc05)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0
                    }}>
                      <i className="fab fa-google" style={{ color: 'white', fontSize: '1.5rem' }}></i>
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                        <h4 style={{ margin: 0, fontSize: '1.1rem' }}>Google Cloud Vision</h4>
                        <span style={{
                          background: '#ea4335',
                          color: 'white',
                          padding: '0.15rem 0.5rem',
                          borderRadius: '4px',
                          fontSize: '0.7rem',
                          fontWeight: '600'
                        }}>CLOUD</span>
                      </div>
                      <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                        OCR potente de Google con detección de objetos y etiquetas.
                      </p>
                    </div>
                    {settings.ocr?.provider === 'google' && (
                      <i className="fas fa-check-circle" style={{ color: '#ea4335', fontSize: '1.5rem' }}></i>
                    )}
                  </div>

                  <div style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: '0.5rem',
                    marginBottom: '1rem'
                  }}>
                    <span style={{ background: 'rgba(234, 67, 53, 0.2)', color: '#ea4335', padding: '0.25rem 0.75rem', borderRadius: '20px', fontSize: '0.75rem' }}>
                      <i className="fas fa-bolt"></i> Alta velocidad
                    </span>
                    <span style={{ background: 'rgba(234, 67, 53, 0.2)', color: '#ea4335', padding: '0.25rem 0.75rem', borderRadius: '20px', fontSize: '0.75rem' }}>
                      <i className="fas fa-file-pdf"></i> PDF nativo
                    </span>
                    <span style={{ background: 'rgba(234, 67, 53, 0.2)', color: '#ea4335', padding: '0.25rem 0.75rem', borderRadius: '20px', fontSize: '0.75rem' }}>
                      <i className="fas fa-language"></i> +50 idiomas
                    </span>
                  </div>

                  {settings.ocr?.provider === 'google' && (
                    <div style={{
                      background: 'var(--bg-secondary)',
                      borderRadius: '10px',
                      padding: '1rem',
                      marginTop: '1rem'
                    }} onClick={(e) => e.stopPropagation()}>
                      <div className="form-group" style={{ marginBottom: '0.75rem' }}>
                        <label style={{ display: 'block', marginBottom: '0.25rem', color: 'var(--text-secondary)', fontSize: '0.8rem' }}>
                          Archivo de credenciales JSON
                        </label>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          <input
                            type="text"
                            placeholder="Ruta al archivo service-account.json"
                            value={settings.ocr?.googleCredentialsPath || ''}
                            onChange={(e) => setSettings({...settings, ocr: {...settings.ocr, googleCredentialsPath: e.target.value}})}
                            style={{
                              flex: 1,
                              padding: '0.6rem 0.75rem',
                              background: 'var(--dark-bg)',
                              border: '1px solid var(--border-color)',
                              borderRadius: '6px',
                              color: 'var(--text-primary)',
                              fontSize: '0.85rem'
                            }}
                          />
                          <button
                            className="btn btn-secondary"
                            onClick={() => alert('Seleccionar archivo...')}
                          >
                            <i className="fas fa-folder-open"></i>
                          </button>
                        </div>
                      </div>
                      <div className="form-group" style={{ marginBottom: '0.75rem' }}>
                        <label style={{ display: 'block', marginBottom: '0.25rem', color: 'var(--text-secondary)', fontSize: '0.8rem' }}>
                          Proyecto ID (opcional)
                        </label>
                        <input
                          type="text"
                          placeholder="my-project-id"
                          value={settings.ocr?.googleProjectId || ''}
                          onChange={(e) => setSettings({...settings, ocr: {...settings.ocr, googleProjectId: e.target.value}})}
                          style={{
                            width: '100%',
                            padding: '0.6rem 0.75rem',
                            background: 'var(--dark-bg)',
                            border: '1px solid var(--border-color)',
                            borderRadius: '6px',
                            color: 'var(--text-primary)',
                            fontSize: '0.85rem'
                          }}
                        />
                      </div>
                      <a
                        href="https://console.cloud.google.com/apis/library/vision.googleapis.com"
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ color: '#ea4335', fontSize: '0.8rem', textDecoration: 'none' }}
                      >
                        <i className="fas fa-external-link-alt"></i> Configurar en Google Cloud Console
                      </a>
                    </div>
                  )}
                </div>

                {/* AWS Textract */}
                <div style={{
                  background: settings.ocr?.provider === 'aws' ? 'linear-gradient(135deg, rgba(255, 153, 0, 0.1), rgba(255, 153, 0, 0.05))' : 'var(--dark-bg)',
                  border: settings.ocr?.provider === 'aws' ? '2px solid #ff9900' : '1px solid var(--border-color)',
                  borderRadius: '16px',
                  padding: '1.5rem',
                  cursor: 'pointer',
                  transition: 'all 0.3s'
                }} onClick={() => setSettings({...settings, ocr: {...settings.ocr, provider: 'aws'}})}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem', marginBottom: '1rem' }}>
                    <div style={{
                      width: '56px',
                      height: '56px',
                      borderRadius: '12px',
                      background: 'linear-gradient(135deg, #ff9900, #ec7211)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0
                    }}>
                      <i className="fab fa-aws" style={{ color: 'white', fontSize: '1.5rem' }}></i>
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                        <h4 style={{ margin: 0, fontSize: '1.1rem' }}>AWS Textract</h4>
                        <span style={{
                          background: '#ff9900',
                          color: '#232f3e',
                          padding: '0.15rem 0.5rem',
                          borderRadius: '4px',
                          fontSize: '0.7rem',
                          fontWeight: '600'
                        }}>CLOUD</span>
                      </div>
                      <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                        Extracción inteligente de texto, tablas y formularios de Amazon.
                      </p>
                    </div>
                    {settings.ocr?.provider === 'aws' && (
                      <i className="fas fa-check-circle" style={{ color: '#ff9900', fontSize: '1.5rem' }}></i>
                    )}
                  </div>

                  <div style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: '0.5rem',
                    marginBottom: '1rem'
                  }}>
                    <span style={{ background: 'rgba(255, 153, 0, 0.2)', color: '#ff9900', padding: '0.25rem 0.75rem', borderRadius: '20px', fontSize: '0.75rem' }}>
                      <i className="fas fa-file-invoice"></i> Facturas
                    </span>
                    <span style={{ background: 'rgba(255, 153, 0, 0.2)', color: '#ff9900', padding: '0.25rem 0.75rem', borderRadius: '20px', fontSize: '0.75rem' }}>
                      <i className="fas fa-id-card"></i> Documentos ID
                    </span>
                    <span style={{ background: 'rgba(255, 153, 0, 0.2)', color: '#ff9900', padding: '0.25rem 0.75rem', borderRadius: '20px', fontSize: '0.75rem' }}>
                      <i className="fas fa-table"></i> Tablas complejas
                    </span>
                  </div>

                  {settings.ocr?.provider === 'aws' && (
                    <div style={{
                      background: 'var(--bg-secondary)',
                      borderRadius: '10px',
                      padding: '1rem',
                      marginTop: '1rem'
                    }} onClick={(e) => e.stopPropagation()}>
                      <div className="form-group" style={{ marginBottom: '0.75rem' }}>
                        <label style={{ display: 'block', marginBottom: '0.25rem', color: 'var(--text-secondary)', fontSize: '0.8rem' }}>
                          Access Key ID
                        </label>
                        <input
                          type="text"
                          placeholder="AKIAIOSFODNN7EXAMPLE"
                          value={settings.ocr?.awsAccessKeyId || ''}
                          onChange={(e) => setSettings({...settings, ocr: {...settings.ocr, awsAccessKeyId: e.target.value}})}
                          style={{
                            width: '100%',
                            padding: '0.6rem 0.75rem',
                            background: 'var(--dark-bg)',
                            border: '1px solid var(--border-color)',
                            borderRadius: '6px',
                            color: 'var(--text-primary)',
                            fontSize: '0.85rem'
                          }}
                        />
                      </div>
                      <div className="form-group" style={{ marginBottom: '0.75rem' }}>
                        <label style={{ display: 'block', marginBottom: '0.25rem', color: 'var(--text-secondary)', fontSize: '0.8rem' }}>
                          Secret Access Key
                        </label>
                        <input
                          type="password"
                          placeholder="wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY"
                          value={settings.ocr?.awsSecretKey || ''}
                          onChange={(e) => setSettings({...settings, ocr: {...settings.ocr, awsSecretKey: e.target.value}})}
                          style={{
                            width: '100%',
                            padding: '0.6rem 0.75rem',
                            background: 'var(--dark-bg)',
                            border: '1px solid var(--border-color)',
                            borderRadius: '6px',
                            color: 'var(--text-primary)',
                            fontSize: '0.85rem'
                          }}
                        />
                      </div>
                      <div className="form-group" style={{ marginBottom: '0.75rem' }}>
                        <label style={{ display: 'block', marginBottom: '0.25rem', color: 'var(--text-secondary)', fontSize: '0.8rem' }}>
                          Región
                        </label>
                        <select
                          value={settings.ocr?.awsRegion || 'us-east-1'}
                          onChange={(e) => setSettings({...settings, ocr: {...settings.ocr, awsRegion: e.target.value}})}
                          style={{
                            width: '100%',
                            padding: '0.6rem 0.75rem',
                            background: 'var(--dark-bg)',
                            border: '1px solid var(--border-color)',
                            borderRadius: '6px',
                            color: 'var(--text-primary)',
                            fontSize: '0.85rem'
                          }}
                        >
                          <option value="us-east-1">US East (N. Virginia)</option>
                          <option value="us-west-2">US West (Oregon)</option>
                          <option value="eu-west-1">Europe (Ireland)</option>
                          <option value="eu-central-1">Europe (Frankfurt)</option>
                          <option value="sa-east-1">South America (São Paulo)</option>
                        </select>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Configuración Común para el proveedor seleccionado */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
                gap: '1.5rem'
              }}>
                {/* Idioma y Procesamiento */}
                <div style={{
                  background: 'var(--dark-bg)',
                  borderRadius: '12px',
                  padding: '1.5rem',
                  border: '1px solid var(--border-color)'
                }}>
                  <h4 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                    <i className="fas fa-language" style={{ color: 'var(--primary-color)' }}></i>
                    Idioma y Región
                  </h4>
                  <div className="form-group" style={{ marginBottom: '1rem' }}>
                    <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>
                      Idioma principal
                    </label>
                    <select
                      value={settings.ocr?.language || 'spa'}
                      onChange={(e) => setSettings({...settings, ocr: {...settings.ocr, language: e.target.value}})}
                      style={{
                        width: '100%',
                        padding: '0.75rem',
                        background: 'var(--bg-secondary)',
                        border: '1px solid var(--border-color)',
                        borderRadius: '8px',
                        color: 'var(--text-primary)'
                      }}
                    >
                      <option value="spa">Español</option>
                      <option value="eng">English</option>
                      <option value="por">Português</option>
                      <option value="fra">Français</option>
                      <option value="deu">Deutsch</option>
                      <option value="ita">Italiano</option>
                      <option value="jpn">日本語 (Japonés)</option>
                      <option value="chi_sim">中文简体 (Chino simplificado)</option>
                      <option value="kor">한국어 (Coreano)</option>
                      <option value="ara">العربية (Árabe)</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>
                      Idioma secundario (opcional)
                    </label>
                    <select
                      value={settings.ocr?.secondaryLanguage || ''}
                      onChange={(e) => setSettings({...settings, ocr: {...settings.ocr, secondaryLanguage: e.target.value}})}
                      style={{
                        width: '100%',
                        padding: '0.75rem',
                        background: 'var(--bg-secondary)',
                        border: '1px solid var(--border-color)',
                        borderRadius: '8px',
                        color: 'var(--text-primary)'
                      }}
                    >
                      <option value="">Ninguno</option>
                      <option value="eng">English</option>
                      <option value="spa">Español</option>
                      <option value="por">Português</option>
                    </select>
                  </div>
                </div>

                {/* Procesamiento de Imagen */}
                <div style={{
                  background: 'var(--dark-bg)',
                  borderRadius: '12px',
                  padding: '1.5rem',
                  border: '1px solid var(--border-color)'
                }}>
                  <h4 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                    <i className="fas fa-image" style={{ color: 'var(--primary-color)' }}></i>
                    Procesamiento de Imagen
                  </h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer' }}>
                      <input
                        type="checkbox"
                        checked={settings.ocr?.enhanceImages ?? true}
                        onChange={(e) => setSettings({...settings, ocr: {...settings.ocr, enhanceImages: e.target.checked}})}
                        style={{ width: '18px', height: '18px', accentColor: 'var(--primary-color)' }}
                      />
                      <span>Mejorar contraste automáticamente</span>
                    </label>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer' }}>
                      <input
                        type="checkbox"
                        checked={settings.ocr?.deskew ?? true}
                        onChange={(e) => setSettings({...settings, ocr: {...settings.ocr, deskew: e.target.checked}})}
                        style={{ width: '18px', height: '18px', accentColor: 'var(--primary-color)' }}
                      />
                      <span>Corregir inclinación</span>
                    </label>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer' }}>
                      <input
                        type="checkbox"
                        checked={settings.ocr?.removeNoise ?? true}
                        onChange={(e) => setSettings({...settings, ocr: {...settings.ocr, removeNoise: e.target.checked}})}
                        style={{ width: '18px', height: '18px', accentColor: 'var(--primary-color)' }}
                      />
                      <span>Eliminar ruido de fondo</span>
                    </label>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer' }}>
                      <input
                        type="checkbox"
                        checked={settings.ocr?.binarize ?? false}
                        onChange={(e) => setSettings({...settings, ocr: {...settings.ocr, binarize: e.target.checked}})}
                        style={{ width: '18px', height: '18px', accentColor: 'var(--primary-color)' }}
                      />
                      <span>Binarizar imagen (blanco y negro)</span>
                    </label>
                  </div>
                </div>

                {/* Detección de Estructuras */}
                <div style={{
                  background: 'var(--dark-bg)',
                  borderRadius: '12px',
                  padding: '1.5rem',
                  border: '1px solid var(--border-color)'
                }}>
                  <h4 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                    <i className="fas fa-table" style={{ color: 'var(--primary-color)' }}></i>
                    Detección de Estructuras
                  </h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer' }}>
                      <input
                        type="checkbox"
                        checked={settings.ocr?.detectTables ?? true}
                        onChange={(e) => setSettings({...settings, ocr: {...settings.ocr, detectTables: e.target.checked}})}
                        style={{ width: '18px', height: '18px', accentColor: 'var(--primary-color)' }}
                      />
                      <span>Detectar tablas</span>
                    </label>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer' }}>
                      <input
                        type="checkbox"
                        checked={settings.ocr?.detectForms ?? true}
                        onChange={(e) => setSettings({...settings, ocr: {...settings.ocr, detectForms: e.target.checked}})}
                        style={{ width: '18px', height: '18px', accentColor: 'var(--primary-color)' }}
                      />
                      <span>Detectar formularios</span>
                    </label>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer' }}>
                      <input
                        type="checkbox"
                        checked={settings.ocr?.detectHandwriting ?? false}
                        onChange={(e) => setSettings({...settings, ocr: {...settings.ocr, detectHandwriting: e.target.checked}})}
                        style={{ width: '18px', height: '18px', accentColor: 'var(--primary-color)' }}
                      />
                      <span>Detectar escritura a mano</span>
                    </label>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer' }}>
                      <input
                        type="checkbox"
                        checked={settings.ocr?.detectBarcodes ?? true}
                        onChange={(e) => setSettings({...settings, ocr: {...settings.ocr, detectBarcodes: e.target.checked}})}
                        style={{ width: '18px', height: '18px', accentColor: 'var(--primary-color)' }}
                      />
                      <span>Detectar códigos de barras/QR</span>
                    </label>
                  </div>
                </div>

                {/* Calidad y Rendimiento */}
                <div style={{
                  background: 'var(--dark-bg)',
                  borderRadius: '12px',
                  padding: '1.5rem',
                  border: '1px solid var(--border-color)'
                }}>
                  <h4 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                    <i className="fas fa-tachometer-alt" style={{ color: 'var(--primary-color)' }}></i>
                    Calidad y Rendimiento
                  </h4>
                  <div className="form-group" style={{ marginBottom: '1rem' }}>
                    <label style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>
                      <span>Umbral de confianza</span>
                      <span style={{ color: 'var(--primary-color)', fontWeight: '600' }}>
                        {settings.ocr?.confidenceThreshold || 80}%
                      </span>
                    </label>
                    <input
                      type="range"
                      min="50"
                      max="99"
                      value={settings.ocr?.confidenceThreshold || 80}
                      onChange={(e) => setSettings({...settings, ocr: {...settings.ocr, confidenceThreshold: parseInt(e.target.value)}})}
                      style={{ width: '100%', accentColor: 'var(--primary-color)' }}
                    />
                  </div>
                  <div className="form-group" style={{ marginBottom: '1rem' }}>
                    <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>
                      Resolución de procesamiento (DPI)
                    </label>
                    <select
                      value={settings.ocr?.dpi || 300}
                      onChange={(e) => setSettings({...settings, ocr: {...settings.ocr, dpi: parseInt(e.target.value)}})}
                      style={{
                        width: '100%',
                        padding: '0.75rem',
                        background: 'var(--bg-secondary)',
                        border: '1px solid var(--border-color)',
                        borderRadius: '8px',
                        color: 'var(--text-primary)'
                      }}
                    >
                      <option value="150">150 DPI (Rápido)</option>
                      <option value="200">200 DPI (Balance)</option>
                      <option value="300">300 DPI (Recomendado)</option>
                      <option value="400">400 DPI (Alta calidad)</option>
                      <option value="600">600 DPI (Máxima calidad)</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>
                      Modo de segmentación
                    </label>
                    <select
                      value={settings.ocr?.segmentationMode || 'auto'}
                      onChange={(e) => setSettings({...settings, ocr: {...settings.ocr, segmentationMode: e.target.value}})}
                      style={{
                        width: '100%',
                        padding: '0.75rem',
                        background: 'var(--bg-secondary)',
                        border: '1px solid var(--border-color)',
                        borderRadius: '8px',
                        color: 'var(--text-primary)'
                      }}
                    >
                      <option value="auto">Automático</option>
                      <option value="single_block">Bloque único de texto</option>
                      <option value="single_column">Columna única</option>
                      <option value="single_line">Línea única</option>
                      <option value="single_word">Palabra única</option>
                      <option value="sparse">Texto disperso</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Botón de prueba */}
              <div style={{
                marginTop: '2rem',
                padding: '1.5rem',
                background: 'var(--bg-secondary)',
                borderRadius: '12px',
                border: '1px solid var(--border-color)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}>
                <div>
                  <h4 style={{ margin: '0 0 0.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <i className="fas fa-vial" style={{ color: 'var(--primary-color)' }}></i>
                    Probar configuración
                  </h4>
                  <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                    Sube una imagen de prueba para verificar que el OCR funciona correctamente.
                  </p>
                </div>
                <button
                  className="btn btn-primary"
                  onClick={() => alert('Abriendo diálogo de selección de imagen para prueba OCR...')}
                >
                  <i className="fas fa-upload"></i> Probar OCR
                </button>
              </div>
            </div>
          )}

          {/* Configuración Base de Datos */}
          {activeTab === 'database' && (
            <div className="settings-section">
              <h3><i className="fas fa-database"></i> Configuración de Base de Datos</h3>
              <p className="section-description">Gestiona las conexiones a bases de datos</p>

              <div className="db-connections">
                <div className="db-connection-card">
                  <div className="db-icon" style={{background: 'linear-gradient(135deg, #336791, #003b57)'}}>
                    <i className="fas fa-database"></i>
                  </div>
                  <div className="db-info">
                    <h4>PostgreSQL - Producción</h4>
                    <p>localhost:5432/alqvimia_prod</p>
                    <span className="db-status connected">Conectado</span>
                  </div>
                  <div className="db-actions">
                    <button className="btn btn-sm btn-secondary"><i className="fas fa-edit"></i></button>
                    <button className="btn btn-sm btn-secondary"><i className="fas fa-sync"></i></button>
                    <button className="btn btn-sm btn-danger"><i className="fas fa-trash"></i></button>
                  </div>
                </div>

                <div className="db-connection-card">
                  <div className="db-icon" style={{background: 'linear-gradient(135deg, #f29111, #ff8c00)'}}>
                    <i className="fas fa-database"></i>
                  </div>
                  <div className="db-info">
                    <h4>MySQL - Desarrollo</h4>
                    <p>localhost:3306/alqvimia_dev</p>
                    <span className="db-status connected">Conectado</span>
                  </div>
                  <div className="db-actions">
                    <button className="btn btn-sm btn-secondary"><i className="fas fa-edit"></i></button>
                    <button className="btn btn-sm btn-secondary"><i className="fas fa-sync"></i></button>
                    <button className="btn btn-sm btn-danger"><i className="fas fa-trash"></i></button>
                  </div>
                </div>

                <div className="db-connection-card">
                  <div className="db-icon" style={{background: 'linear-gradient(135deg, #00758f, #0078d4)'}}>
                    <i className="fas fa-database"></i>
                  </div>
                  <div className="db-info">
                    <h4>SQL Server - Reportes</h4>
                    <p>server.local:1433/reports</p>
                    <span className="db-status disconnected">Desconectado</span>
                  </div>
                  <div className="db-actions">
                    <button className="btn btn-sm btn-secondary"><i className="fas fa-edit"></i></button>
                    <button className="btn btn-sm btn-primary"><i className="fas fa-plug"></i></button>
                    <button className="btn btn-sm btn-danger"><i className="fas fa-trash"></i></button>
                  </div>
                </div>

                <button className="add-connection-btn">
                  <i className="fas fa-plus"></i>
                  <span>Agregar Conexión</span>
                </button>
              </div>

              <div className="settings-grid" style={{marginTop: '2rem'}}>
                <div className="setting-card">
                  <div className="setting-card-header">
                    <i className="fas fa-cog"></i>
                    <h4>Configuración General</h4>
                  </div>
                  <div className="setting-card-body">
                    <div className="form-group">
                      <label>Timeout de conexión (segundos)</label>
                      <input type="number" min="5" max="120" defaultValue={30} />
                    </div>
                    <div className="form-group">
                      <label>Pool de conexiones máximo</label>
                      <input type="number" min="1" max="100" defaultValue={10} />
                    </div>
                    <div className="form-group">
                      <label className="toggle-label">
                        <input type="checkbox" defaultChecked />
                        <span className="toggle-switch"></span>
                        Reconectar automáticamente
                      </label>
                    </div>
                  </div>
                </div>

                <div className="setting-card">
                  <div className="setting-card-header">
                    <i className="fas fa-shield-alt"></i>
                    <h4>Seguridad</h4>
                  </div>
                  <div className="setting-card-body">
                    <div className="form-group">
                      <label className="toggle-label">
                        <input type="checkbox" defaultChecked />
                        <span className="toggle-switch"></span>
                        Usar SSL/TLS
                      </label>
                    </div>
                    <div className="form-group">
                      <label className="toggle-label">
                        <input type="checkbox" defaultChecked />
                        <span className="toggle-switch"></span>
                        Encriptar credenciales
                      </label>
                    </div>
                    <div className="form-group">
                      <label className="toggle-label">
                        <input type="checkbox" defaultChecked />
                        <span className="toggle-switch"></span>
                        Registrar consultas
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Configuración Respaldo */}
          {activeTab === 'backup' && (
            <div className="settings-section">
              <h3><i className="fas fa-download"></i> Configuración de Respaldo</h3>
              <p className="section-description">Configura respaldos automáticos de datos y configuraciones</p>

              <div className="settings-grid">
                <div className="setting-card">
                  <div className="setting-card-header">
                    <i className="fas fa-clock"></i>
                    <h4>Respaldo Automático</h4>
                  </div>
                  <div className="setting-card-body">
                    <div className="form-group">
                      <label className="toggle-label">
                        <input type="checkbox" defaultChecked />
                        <span className="toggle-switch"></span>
                        Habilitar respaldo automático
                      </label>
                    </div>
                    <div className="form-group">
                      <label>Frecuencia</label>
                      <select defaultValue="daily">
                        <option value="hourly">Cada hora</option>
                        <option value="daily">Diario</option>
                        <option value="weekly">Semanal</option>
                        <option value="monthly">Mensual</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label>Hora del respaldo</label>
                      <input type="time" defaultValue="02:00" />
                    </div>
                    <div className="form-group">
                      <label>Retención (días)</label>
                      <input type="number" min="1" max="365" defaultValue={30} />
                    </div>
                  </div>
                </div>

                <div className="setting-card">
                  <div className="setting-card-header">
                    <i className="fas fa-folder"></i>
                    <h4>Destino de Respaldo</h4>
                  </div>
                  <div className="setting-card-body">
                    <div className="form-group">
                      <label>Tipo de almacenamiento</label>
                      <select defaultValue="local">
                        <option value="local">Local</option>
                        <option value="s3">Amazon S3</option>
                        <option value="azure">Azure Blob Storage</option>
                        <option value="gcs">Google Cloud Storage</option>
                        <option value="ftp">FTP/SFTP</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label>Ruta local</label>
                      <div className="input-with-btn">
                        <input type="text" defaultValue="C:/Alqvimia/Backups" />
                        <button className="btn btn-sm btn-secondary"><i className="fas fa-folder-open"></i></button>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="setting-card">
                  <div className="setting-card-header">
                    <i className="fas fa-check-square"></i>
                    <h4>Elementos a Respaldar</h4>
                  </div>
                  <div className="setting-card-body">
                    <div className="form-group">
                      <label className="toggle-label">
                        <input type="checkbox" defaultChecked />
                        <span className="toggle-switch"></span>
                        Workflows
                      </label>
                    </div>
                    <div className="form-group">
                      <label className="toggle-label">
                        <input type="checkbox" defaultChecked />
                        <span className="toggle-switch"></span>
                        Variables globales
                      </label>
                    </div>
                    <div className="form-group">
                      <label className="toggle-label">
                        <input type="checkbox" defaultChecked />
                        <span className="toggle-switch"></span>
                        Configuraciones
                      </label>
                    </div>
                    <div className="form-group">
                      <label className="toggle-label">
                        <input type="checkbox" defaultChecked />
                        <span className="toggle-switch"></span>
                        Credenciales (encriptadas)
                      </label>
                    </div>
                    <div className="form-group">
                      <label className="toggle-label">
                        <input type="checkbox" defaultChecked />
                        <span className="toggle-switch"></span>
                        Logs de ejecución
                      </label>
                    </div>
                  </div>
                </div>

                <div className="setting-card">
                  <div className="setting-card-header">
                    <i className="fas fa-history"></i>
                    <h4>Últimos Respaldos</h4>
                  </div>
                  <div className="setting-card-body">
                    <div className="backup-list">
                      <div className="backup-item">
                        <i className="fas fa-file-archive"></i>
                        <div className="backup-info">
                          <span className="backup-name">backup_2024-01-15_02-00.zip</span>
                          <span className="backup-size">45.2 MB</span>
                        </div>
                        <div className="backup-actions">
                          <button className="btn btn-sm btn-secondary" title="Restaurar"><i className="fas fa-undo"></i></button>
                          <button className="btn btn-sm btn-secondary" title="Descargar"><i className="fas fa-download"></i></button>
                        </div>
                      </div>
                      <div className="backup-item">
                        <i className="fas fa-file-archive"></i>
                        <div className="backup-info">
                          <span className="backup-name">backup_2024-01-14_02-00.zip</span>
                          <span className="backup-size">44.8 MB</span>
                        </div>
                        <div className="backup-actions">
                          <button className="btn btn-sm btn-secondary" title="Restaurar"><i className="fas fa-undo"></i></button>
                          <button className="btn btn-sm btn-secondary" title="Descargar"><i className="fas fa-download"></i></button>
                        </div>
                      </div>
                    </div>
                    <button className="btn btn-primary" style={{width: '100%', marginTop: '1rem'}}>
                      <i className="fas fa-play"></i> Crear Respaldo Ahora
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Gestión de Usuarios (solo admin) */}
          {activeTab === 'users' && isAdmin && (
            <div className="settings-section">
              <h3><i className="fas fa-users"></i> Gestión de Usuarios</h3>
              <p className="section-description">Administra los usuarios del sistema</p>

              <div style={{ marginBottom: '1.5rem' }}>
                <button className="btn btn-success" onClick={openCreateUser}>
                  <i className="fas fa-user-plus"></i> Nuevo Usuario
                </button>
              </div>

              {loadingUsers ? (
                <div style={{ textAlign: 'center', padding: '2rem' }}>
                  <i className="fas fa-spinner fa-spin" style={{ fontSize: '2rem', color: 'var(--primary-color)' }}></i>
                  <p>Cargando usuarios...</p>
                </div>
              ) : (
                <div className="users-table" style={{
                  background: 'var(--bg-secondary)',
                  borderRadius: '12px',
                  overflow: 'hidden',
                  border: '1px solid var(--border-color)'
                }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ background: 'var(--bg-tertiary)' }}>
                        <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600' }}>Usuario</th>
                        <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600' }}>Email</th>
                        <th style={{ padding: '1rem', textAlign: 'center', fontWeight: '600' }}>Rol</th>
                        <th style={{ padding: '1rem', textAlign: 'center', fontWeight: '600' }}>Estado</th>
                        <th style={{ padding: '1rem', textAlign: 'center', fontWeight: '600' }}>Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map(u => (
                        <tr key={u.id} style={{ borderTop: '1px solid var(--border-color)' }}>
                          <td style={{ padding: '1rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                              <div style={{
                                width: '40px',
                                height: '40px',
                                borderRadius: '50%',
                                background: 'var(--primary-color)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: 'white',
                                fontWeight: '600'
                              }}>
                                {u.nombre?.charAt(0).toUpperCase()}
                              </div>
                              <span>{u.nombre}</span>
                            </div>
                          </td>
                          <td style={{ padding: '1rem', color: 'var(--text-secondary)' }}>{u.email}</td>
                          <td style={{ padding: '1rem', textAlign: 'center' }}>
                            <span style={{
                              padding: '0.25rem 0.75rem',
                              borderRadius: '12px',
                              fontSize: '0.8rem',
                              fontWeight: '600',
                              background: u.rol === 'admin' ? 'rgba(239, 68, 68, 0.2)' : 'rgba(59, 130, 246, 0.2)',
                              color: u.rol === 'admin' ? '#ef4444' : '#3b82f6'
                            }}>
                              {u.rol}
                            </span>
                          </td>
                          <td style={{ padding: '1rem', textAlign: 'center' }}>
                            <button
                              onClick={() => handleToggleUserStatus(u.id)}
                              style={{
                                padding: '0.25rem 0.75rem',
                                borderRadius: '12px',
                                border: 'none',
                                fontSize: '0.8rem',
                                cursor: 'pointer',
                                background: u.activo ? 'rgba(34, 197, 94, 0.2)' : 'rgba(239, 68, 68, 0.2)',
                                color: u.activo ? '#22c55e' : '#ef4444'
                              }}
                            >
                              {u.activo ? 'Activo' : 'Inactivo'}
                            </button>
                          </td>
                          <td style={{ padding: '1rem', textAlign: 'center' }}>
                            <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
                              <button
                                className="btn btn-sm"
                                onClick={() => openEditUser(u)}
                                style={{ padding: '0.4rem 0.75rem', fontSize: '0.85rem' }}
                              >
                                <i className="fas fa-edit"></i>
                              </button>
                              <button
                                className="btn btn-sm btn-danger"
                                onClick={() => handleDeleteUser(u.id)}
                                style={{ padding: '0.4rem 0.75rem', fontSize: '0.85rem' }}
                                disabled={u.id === user?.id}
                              >
                                <i className="fas fa-trash"></i>
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                      {users.length === 0 && (
                        <tr>
                          <td colSpan="5" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                            No hay usuarios registrados
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* Modal Crear/Editar Usuario */}
          {showUserModal && (
            <div className="modal-overlay" style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'rgba(0,0,0,0.7)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 1000
            }}>
              <div className="modal-content" style={{
                background: 'var(--bg-secondary)',
                borderRadius: '16px',
                padding: '2rem',
                width: '100%',
                maxWidth: '450px',
                border: '1px solid var(--border-color)'
              }}>
                <h3 style={{ marginBottom: '1.5rem' }}>
                  <i className={`fas ${editingUser ? 'fa-user-edit' : 'fa-user-plus'}`}></i>
                  {editingUser ? ' Editar Usuario' : ' Nuevo Usuario'}
                </h3>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Nombre</label>
                    <input
                      type="text"
                      value={userForm.nombre}
                      onChange={(e) => setUserForm({ ...userForm, nombre: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '0.75rem',
                        borderRadius: '8px',
                        border: '1px solid var(--border-color)',
                        background: 'var(--bg-tertiary)',
                        color: 'var(--text-primary)'
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Email</label>
                    <input
                      type="email"
                      value={userForm.email}
                      onChange={(e) => setUserForm({ ...userForm, email: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '0.75rem',
                        borderRadius: '8px',
                        border: '1px solid var(--border-color)',
                        background: 'var(--bg-tertiary)',
                        color: 'var(--text-primary)'
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
                      Contraseña {editingUser && '(dejar vacío para no cambiar)'}
                    </label>
                    <input
                      type="password"
                      value={userForm.password}
                      onChange={(e) => setUserForm({ ...userForm, password: e.target.value })}
                      placeholder={editingUser ? '••••••••' : ''}
                      style={{
                        width: '100%',
                        padding: '0.75rem',
                        borderRadius: '8px',
                        border: '1px solid var(--border-color)',
                        background: 'var(--bg-tertiary)',
                        color: 'var(--text-primary)'
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Rol</label>
                    <select
                      value={userForm.rol}
                      onChange={(e) => setUserForm({ ...userForm, rol: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '0.75rem',
                        borderRadius: '8px',
                        border: '1px solid var(--border-color)',
                        background: 'var(--bg-tertiary)',
                        color: 'var(--text-primary)'
                      }}
                    >
                      <option value="usuario">Usuario</option>
                      <option value="operador">Operador</option>
                      <option value="admin">Administrador</option>
                      <option value="viewer">Viewer</option>
                    </select>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <input
                      type="checkbox"
                      id="userActivo"
                      checked={userForm.activo}
                      onChange={(e) => setUserForm({ ...userForm, activo: e.target.checked })}
                    />
                    <label htmlFor="userActivo">Usuario activo</label>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem', justifyContent: 'flex-end' }}>
                  <button
                    className="btn btn-secondary"
                    onClick={() => { setShowUserModal(false); setEditingUser(null); }}
                  >
                    Cancelar
                  </button>
                  <button className="btn btn-success" onClick={handleSaveUser}>
                    <i className="fas fa-save"></i> Guardar
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Permisos de Dashboards (solo admin) */}
          {activeTab === 'dashboards' && isAdmin && (
            <div className="settings-section">
              <h3><i className="fas fa-tachometer-alt"></i> {t('dash_permisos_title') || 'Permisos de Dashboards'}</h3>
              <p className="section-description">Controla qué puede hacer cada rol con los dashboards</p>

              {loadingDashPermisos ? (
                <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                  <i className="fas fa-spinner fa-spin"></i> Cargando permisos...
                </div>
              ) : (
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '1rem' }}>
                    <thead>
                      <tr style={{ borderBottom: '2px solid var(--border-color)' }}>
                        <th style={{ textAlign: 'left', padding: '0.75rem', color: 'var(--text-primary)' }}>Rol</th>
                        <th style={{ textAlign: 'center', padding: '0.75rem', color: 'var(--text-primary)' }}>{t('dash_perm_ver') || 'Ver'}</th>
                        <th style={{ textAlign: 'center', padding: '0.75rem', color: 'var(--text-primary)' }}>{t('dash_perm_crear') || 'Crear'}</th>
                        <th style={{ textAlign: 'center', padding: '0.75rem', color: 'var(--text-primary)' }}>{t('dash_perm_editar') || 'Editar'}</th>
                        <th style={{ textAlign: 'center', padding: '0.75rem', color: 'var(--text-primary)' }}>{t('dash_perm_compartir') || 'Compartir'}</th>
                        <th style={{ textAlign: 'center', padding: '0.75rem', color: 'var(--text-primary)' }}>{t('dash_perm_minisite') || 'Mini-sitio'}</th>
                        <th style={{ textAlign: 'center', padding: '0.75rem', color: 'var(--text-primary)' }}>{t('dash_perm_max') || 'Máx'}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {dashboardPermisos.map(perm => (
                        <tr key={perm.rol} style={{ borderBottom: '1px solid var(--border-color)' }}>
                          <td style={{ padding: '0.75rem', fontWeight: 600, color: 'var(--text-primary)', textTransform: 'capitalize' }}>
                            {perm.rol}
                          </td>
                          {['puede_ver', 'puede_crear', 'puede_editar', 'puede_compartir', 'puede_crear_minisite'].map(campo => (
                            <td key={campo} style={{ textAlign: 'center', padding: '0.75rem' }}>
                              <input
                                type="checkbox"
                                checked={!!perm[campo]}
                                onChange={(e) => handleDashPermToggle(perm.rol, campo, e.target.checked)}
                                style={{ width: 18, height: 18, cursor: 'pointer' }}
                              />
                            </td>
                          ))}
                          <td style={{ textAlign: 'center', padding: '0.75rem' }}>
                            <input
                              type="number"
                              min={1}
                              max={999}
                              value={perm.max_dashboards || 5}
                              onChange={(e) => handleDashPermToggle(perm.rol, 'max_dashboards', parseInt(e.target.value, 10) || 5)}
                              style={{
                                width: 60,
                                textAlign: 'center',
                                padding: '0.25rem',
                                borderRadius: 'var(--border-radius-sm)',
                                border: '1px solid var(--border-color)',
                                background: 'var(--bg-secondary)',
                                color: 'var(--text-primary)'
                              }}
                            />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              <div style={{ marginTop: '1rem', padding: '0.75rem', background: 'var(--bg-tertiary)', borderRadius: 'var(--border-radius-sm)', fontSize: 13, color: 'var(--text-secondary)' }}>
                <i className="fas fa-info-circle" style={{ marginRight: 6 }}></i>
                Si "Ver" está desmarcado, el Dashboard Creator no aparecerá en el menú para ese rol.
              </div>
            </div>
          )}

          <div style={{
            display: 'flex',
            justifyContent: 'flex-end',
            gap: '1rem',
            marginTop: '2rem',
            paddingTop: '2rem',
            borderTop: '1px solid var(--border-color)'
          }}>
            <button className="btn btn-secondary">
              <i className="fas fa-undo"></i> Restaurar
            </button>
            <button className="btn btn-success" onClick={handleSave}>
              <i className="fas fa-save"></i> Guardar Cambios
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SettingsView
