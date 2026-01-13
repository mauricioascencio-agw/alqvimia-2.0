import { useState } from 'react'
import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../stores/authStore'
import { useEnvironmentStore } from '../stores/environmentStore'
import EnvironmentSelector from '../components/EnvironmentSelector'

function DeveloperLayout() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const { user, logout } = useAuthStore()
  const { currentEnvironment } = useEnvironmentStore()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const navItems = [
    { path: '/', icon: 'fa-tachometer-alt', label: 'Dashboard' },
    { path: '/projects', icon: 'fa-folder-open', label: 'Proyectos' },
    { path: '/workflows', icon: 'fa-project-diagram', label: 'Workflows' },
    { path: '/agents', icon: 'fa-robot', label: 'Agentes' },
    { path: '/deployment', icon: 'fa-rocket', label: 'Despliegue' },
    { path: '/testing', icon: 'fa-vial', label: 'Testing' },
    { path: '/logs', icon: 'fa-terminal', label: 'Logs' },
    { path: '/settings', icon: 'fa-cog', label: 'Configuración' }
  ]

  return (
    <div className="developer-layout">
      {/* Header */}
      <header className="dev-header">
        <div className="header-left">
          <button
            className="sidebar-toggle"
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          >
            <i className="fas fa-bars"></i>
          </button>
          <div className="brand">
            <i className="fas fa-code"></i>
            <span className="brand-name">Developer Hub</span>
          </div>
        </div>

        <div className="header-center">
          <EnvironmentSelector />
        </div>

        <div className="header-right">
          <div className="user-info">
            <span className="user-name">{user?.name || user?.email}</span>
            <span className="user-role">{user?.role}</span>
          </div>
          <button className="logout-btn" onClick={handleLogout} title="Cerrar sesión">
            <i className="fas fa-sign-out-alt"></i>
          </button>
        </div>
      </header>

      <div className="dev-main">
        {/* Sidebar */}
        <aside className={`dev-sidebar ${sidebarCollapsed ? 'collapsed' : ''}`}>
          <nav className="sidebar-nav">
            {navItems.map(item => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
                title={sidebarCollapsed ? item.label : undefined}
              >
                <i className={`fas ${item.icon}`}></i>
                <span className="nav-label">{item.label}</span>
              </NavLink>
            ))}
          </nav>

          <div className="sidebar-footer">
            <div className="env-badge" style={{ backgroundColor: currentEnvironment?.color }}>
              {currentEnvironment?.shortName || 'DEV'}
            </div>
          </div>
        </aside>

        {/* Content */}
        <main className="dev-content">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export default DeveloperLayout
