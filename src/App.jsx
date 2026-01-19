import { useState, useEffect, useRef } from 'react'
import { useSocket } from './context/SocketContext'
import { useLanguage } from './context/LanguageContext'
import { useAuth } from './context/AuthContext'
import LanguageSelector from './components/LanguageSelector'
import LoginView from './views/LoginView'

// Vistas - usando las clases CSS exactas del original
import SpyView from './views/SpyView'
import RecorderView from './views/RecorderView'
import WorkflowsView from './views/WorkflowsView'
import ExecutorView from './views/ExecutorView'
import LibraryView from './views/LibraryView'
import AIDashboardView from './views/AIDashboardView'
import OmnichannelView from './views/OmnichannelView'
import VideoConferenceView from './views/VideoConferenceView'
import AgentsView from './views/AgentsView'
import MCPView from './views/MCPView'
import CodeEditorView from './views/CodeEditorView'
import SchedulerView from './views/SchedulerView'
import SettingsView from './views/SettingsView'
import AgentMarketplaceView from './views/AgentMarketplaceView'
import OnboardingWizard from './views/OnboardingWizard'
import AdminDashboard from './views/AdminDashboard'
import AgentCatalogView from './views/AgentCatalogView'
import WorkflowTemplatesView from './views/WorkflowTemplatesView'

function App() {
  const [currentView, setCurrentView] = useState('spy')
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const { isConnected, connect, disconnect } = useSocket()
  const { t } = useLanguage()
  const { user, isAuthenticated, loading, logout } = useAuth()
  const hasGreeted = useRef(false)

  // Presentación del agente al iniciar la aplicación (hook ANTES de los returns condicionales)
  useEffect(() => {
    if (!isAuthenticated || hasGreeted.current) return

    const speakGreeting = () => {
      // Cargar configuración guardada
      const savedSettings = localStorage.getItem('alqvimia-settings')
      if (!savedSettings) return

      try {
        const settings = JSON.parse(savedSettings)
        const agentVoice = settings.agentVoice

        // Verificar si está habilitado hablar al iniciar
        if (!agentVoice?.speakOnStart) return

        // Obtener las voces disponibles
        const voices = window.speechSynthesis.getVoices()
        if (voices.length === 0) {
          // Las voces pueden cargarse de forma asíncrona
          window.speechSynthesis.onvoiceschanged = () => {
            speakGreetingWithVoices()
          }
          return
        }

        speakGreetingWithVoices()

        function speakGreetingWithVoices() {
          if (hasGreeted.current) return
          hasGreeted.current = true

          const currentVoices = window.speechSynthesis.getVoices()
          const agentName = agentVoice?.agentName || 'Alqvimia'
          const greetingTemplate = agentVoice?.greetingMessage || 'Hola, soy {agentName}, tu asistente de automatización. ¿En qué puedo ayudarte hoy?'
          const greeting = greetingTemplate.replace('{agentName}', agentName)

          const utterance = new SpeechSynthesisUtterance(greeting)

          // Encontrar la voz seleccionada
          const selectedVoice = currentVoices.find(v => v.voiceURI === agentVoice?.voiceId)
          if (selectedVoice) {
            utterance.voice = selectedVoice
          } else {
            // Buscar una voz en español por defecto
            const spanishVoice = currentVoices.find(v => v.lang.startsWith('es'))
            if (spanishVoice) {
              utterance.voice = spanishVoice
            }
          }

          utterance.rate = agentVoice?.voiceRate || 1
          utterance.pitch = agentVoice?.voicePitch || 1

          // Pequeño delay para que la UI se cargue primero
          setTimeout(() => {
            window.speechSynthesis.speak(utterance)
          }, 1000)
        }
      } catch (e) {
        console.error('Error loading agent voice settings:', e)
      }
    }

    // Intentar hablar cuando las voces estén listas
    if (window.speechSynthesis) {
      const voices = window.speechSynthesis.getVoices()
      if (voices.length > 0) {
        speakGreeting()
      } else {
        window.speechSynthesis.onvoiceschanged = speakGreeting
      }
    }
  }, [isAuthenticated])

  // Si está cargando, mostrar spinner
  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#0f172a'
      }}>
        <i className="fas fa-spinner fa-spin" style={{ fontSize: '3rem', color: '#3b82f6' }}></i>
      </div>
    )
  }

  // Si no está autenticado, mostrar login
  if (!isAuthenticated) {
    return <LoginView onLoginSuccess={() => {}} />
  }

  const handleConnectionToggle = () => {
    if (isConnected) {
      disconnect()
    } else {
      connect()
    }
  }

  const navItems = [
    { id: 'spy', icon: 'fa-search', labelKey: 'nav_spy' },
    { id: 'recorder', icon: 'fa-video', labelKey: 'nav_recorder' },
    { id: 'workflows', icon: 'fa-project-diagram', labelKey: 'nav_workflows' },
    { id: 'workflow-templates', icon: 'fa-file-code', labelKey: 'nav_workflow_templates' },
    { id: 'executor', icon: 'fa-play-circle', labelKey: 'nav_executor' },
    { id: 'scheduler', icon: 'fa-calendar-alt', labelKey: 'nav_scheduler' },
    { id: 'code-editor', icon: 'fa-code', labelKey: 'nav_code_editor' },
    { id: 'agents', icon: 'fa-robot', labelKey: 'nav_agents' },
    { id: 'agent-catalog', icon: 'fa-layer-group', labelKey: 'nav_agent_catalog' },
    { id: 'mcp', icon: 'fa-plug', labelKey: 'nav_mcp' },
    { id: 'marketplace', icon: 'fa-store', labelKey: 'nav_marketplace' },
    { id: 'onboarding', icon: 'fa-magic', labelKey: 'nav_onboarding' },
    { id: 'admin', icon: 'fa-shield-alt', labelKey: 'nav_admin' },
    { id: 'library', icon: 'fa-folder-open', labelKey: 'nav_library' },
    { id: 'ai-dashboard', icon: 'fa-brain', labelKey: 'nav_ai_dashboard' },
    { id: 'omnichannel', icon: 'fa-comments', labelKey: 'nav_omnichannel' },
    { id: 'videoconference', icon: 'fa-video', labelKey: 'nav_videoconference' },
    { id: 'settings', icon: 'fa-cog', labelKey: 'nav_settings' }
  ]

  const renderView = () => {
    switch (currentView) {
      case 'spy': return <SpyView />
      case 'recorder': return <RecorderView />
      case 'workflows': return <WorkflowsView />
      case 'workflow-templates': return <WorkflowTemplatesView />
      case 'executor': return <ExecutorView />
      case 'scheduler': return <SchedulerView />
      case 'code-editor': return <CodeEditorView />
      case 'agents': return <AgentsView />
      case 'agent-catalog': return <AgentCatalogView />
      case 'mcp': return <MCPView />
      case 'marketplace': return <AgentMarketplaceView />
      case 'onboarding': return <OnboardingWizard />
      case 'admin': return <AdminDashboard />
      case 'library': return <LibraryView />
      case 'ai-dashboard': return <AIDashboardView />
      case 'omnichannel': return <OmnichannelView />
      case 'videoconference': return <VideoConferenceView />
      case 'settings': return <SettingsView />
      default: return <SpyView />
    }
  }

  return (
    <div className="app-container">
      {/* Header - exactamente igual al original */}
      <header className="app-header">
        <div className="header-left">
          <i className="fas fa-robot"></i>
          <h1>Alqvimia</h1>
          <span className="version">v2.0</span>
        </div>
        <div className="header-right">
          <div className="connection-toggle-container">
            <span className={`connection-label ${isConnected ? 'connected' : ''}`}>
              {isConnected ? t('connected') : t('disconnected')}
            </span>
            <label className="connection-switch">
              <input
                type="checkbox"
                checked={isConnected}
                onChange={handleConnectionToggle}
              />
              <span className="connection-slider"></span>
            </label>
            <span className={`connection-status-text ${isConnected ? 'connected' : ''}`}>
              {isConnected ? t('server_active') : t('click_to_connect')}
            </span>
          </div>
          <LanguageSelector />

          {/* Usuario y Logout */}
          <div className="user-menu">
            <span className="user-name">
              <i className="fas fa-user-circle"></i>
              {user?.nombre || 'Usuario'}
            </span>
            <button
              className="logout-btn"
              onClick={logout}
              title="Cerrar sesión"
            >
              <i className="fas fa-sign-out-alt"></i>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content - estructura exacta del original */}
      <div className="main-content">
        {/* Sidebar */}
        <aside className={`sidebar ${sidebarCollapsed ? 'collapsed' : ''}`} id="mainSidebar">
          <div className="sidebar-header">
            <button
              className="sidebar-toggle"
              id="sidebarToggle"
              title={sidebarCollapsed ? t('expand_menu') : t('collapse_menu')}
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            >
              <i className={`fas ${sidebarCollapsed ? 'fa-angles-right' : 'fa-angles-left'}`}></i>
              {!sidebarCollapsed && <span>Colapsar</span>}
            </button>
          </div>
          <nav className="sidebar-nav">
            {navItems.map(item => (
              <button
                key={item.id}
                className={`nav-item ${currentView === item.id ? 'active' : ''}`}
                data-view={item.id}
                data-tooltip={t(item.labelKey)}
                onClick={() => setCurrentView(item.id)}
              >
                <i className={`fas ${item.icon}`}></i>
                <span>{t(item.labelKey)}</span>
              </button>
            ))}
          </nav>
        </aside>

        {/* Content Area */}
        <main className="content-area">
          {renderView()}
        </main>
      </div>
    </div>
  )
}

export default App
