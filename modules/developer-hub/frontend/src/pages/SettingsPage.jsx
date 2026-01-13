import { useState } from 'react'
import { useAuthStore } from '../stores/authStore'
import toast from 'react-hot-toast'

function SettingsPage() {
  const { user } = useAuthStore()

  const [activeSection, setActiveSection] = useState('profile')
  const [settings, setSettings] = useState({
    notifications: {
      deployments: true,
      testFailures: true,
      errors: true,
      email: false
    },
    editor: {
      theme: 'dark',
      fontSize: 14,
      tabSize: 2,
      autoSave: true
    },
    api: {
      timeout: 30000,
      retries: 3
    }
  })

  const handleSave = () => {
    localStorage.setItem('dev-hub-settings', JSON.stringify(settings))
    toast.success('Configuración guardada')
  }

  const sections = [
    { id: 'profile', label: 'Perfil', icon: 'fa-user' },
    { id: 'notifications', label: 'Notificaciones', icon: 'fa-bell' },
    { id: 'editor', label: 'Editor', icon: 'fa-code' },
    { id: 'api', label: 'API', icon: 'fa-plug' },
    { id: 'security', label: 'Seguridad', icon: 'fa-shield-alt' }
  ]

  return (
    <div className="settings-page">
      <div className="page-header">
        <div className="header-content">
          <h1><i className="fas fa-cog"></i> Configuración</h1>
          <p>Personaliza tu experiencia de desarrollo</p>
        </div>
      </div>

      <div className="settings-layout">
        {/* Sidebar */}
        <aside className="settings-sidebar">
          <nav>
            {sections.map(section => (
              <button
                key={section.id}
                className={`settings-nav-item ${activeSection === section.id ? 'active' : ''}`}
                onClick={() => setActiveSection(section.id)}
              >
                <i className={`fas ${section.icon}`}></i>
                <span>{section.label}</span>
              </button>
            ))}
          </nav>
        </aside>

        {/* Content */}
        <main className="settings-content">
          {activeSection === 'profile' && (
            <div className="settings-section">
              <h2>Perfil de Desarrollador</h2>

              <div className="profile-card">
                <div className="profile-avatar">
                  <i className="fas fa-user-circle"></i>
                </div>
                <div className="profile-info">
                  <h3>{user?.name || 'Desarrollador'}</h3>
                  <p>{user?.email}</p>
                  <span className="role-badge">{user?.role}</span>
                </div>
              </div>

              <div className="form-section">
                <h4>Información Personal</h4>
                <div className="form-group">
                  <label>Nombre</label>
                  <input type="text" defaultValue={user?.name} />
                </div>
                <div className="form-group">
                  <label>Email</label>
                  <input type="email" defaultValue={user?.email} disabled />
                </div>
              </div>

              <div className="form-section">
                <h4>Permisos</h4>
                <div className="permissions-list">
                  {user?.permissions?.map((perm, i) => (
                    <span key={i} className="permission-tag">{perm}</span>
                  ))}
                </div>
              </div>

              <div className="form-section">
                <h4>Acceso a Ambientes</h4>
                <div className="environments-list">
                  {user?.environments?.map((env, i) => (
                    <span key={i} className="env-tag">{env.toUpperCase()}</span>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeSection === 'notifications' && (
            <div className="settings-section">
              <h2>Notificaciones</h2>

              <div className="settings-group">
                <div className="setting-item">
                  <div className="setting-info">
                    <h4>Despliegues</h4>
                    <p>Notificar sobre nuevos despliegues y aprobaciones pendientes</p>
                  </div>
                  <label className="switch">
                    <input
                      type="checkbox"
                      checked={settings.notifications.deployments}
                      onChange={(e) => setSettings(prev => ({
                        ...prev,
                        notifications: { ...prev.notifications, deployments: e.target.checked }
                      }))}
                    />
                    <span className="slider"></span>
                  </label>
                </div>

                <div className="setting-item">
                  <div className="setting-info">
                    <h4>Fallos en Tests</h4>
                    <p>Notificar cuando fallen tests automatizados</p>
                  </div>
                  <label className="switch">
                    <input
                      type="checkbox"
                      checked={settings.notifications.testFailures}
                      onChange={(e) => setSettings(prev => ({
                        ...prev,
                        notifications: { ...prev.notifications, testFailures: e.target.checked }
                      }))}
                    />
                    <span className="slider"></span>
                  </label>
                </div>

                <div className="setting-item">
                  <div className="setting-info">
                    <h4>Errores en Producción</h4>
                    <p>Alertas de errores críticos en ambiente de producción</p>
                  </div>
                  <label className="switch">
                    <input
                      type="checkbox"
                      checked={settings.notifications.errors}
                      onChange={(e) => setSettings(prev => ({
                        ...prev,
                        notifications: { ...prev.notifications, errors: e.target.checked }
                      }))}
                    />
                    <span className="slider"></span>
                  </label>
                </div>

                <div className="setting-item">
                  <div className="setting-info">
                    <h4>Notificaciones por Email</h4>
                    <p>Recibir notificaciones también por correo electrónico</p>
                  </div>
                  <label className="switch">
                    <input
                      type="checkbox"
                      checked={settings.notifications.email}
                      onChange={(e) => setSettings(prev => ({
                        ...prev,
                        notifications: { ...prev.notifications, email: e.target.checked }
                      }))}
                    />
                    <span className="slider"></span>
                  </label>
                </div>
              </div>
            </div>
          )}

          {activeSection === 'editor' && (
            <div className="settings-section">
              <h2>Configuración del Editor</h2>

              <div className="settings-group">
                <div className="form-group">
                  <label>Tema</label>
                  <select
                    value={settings.editor.theme}
                    onChange={(e) => setSettings(prev => ({
                      ...prev,
                      editor: { ...prev.editor, theme: e.target.value }
                    }))}
                  >
                    <option value="dark">Oscuro</option>
                    <option value="light">Claro</option>
                    <option value="high-contrast">Alto Contraste</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Tamaño de Fuente: {settings.editor.fontSize}px</label>
                  <input
                    type="range"
                    min="10"
                    max="24"
                    value={settings.editor.fontSize}
                    onChange={(e) => setSettings(prev => ({
                      ...prev,
                      editor: { ...prev.editor, fontSize: parseInt(e.target.value) }
                    }))}
                  />
                </div>

                <div className="form-group">
                  <label>Tamaño de Tab: {settings.editor.tabSize} espacios</label>
                  <input
                    type="range"
                    min="2"
                    max="8"
                    step="2"
                    value={settings.editor.tabSize}
                    onChange={(e) => setSettings(prev => ({
                      ...prev,
                      editor: { ...prev.editor, tabSize: parseInt(e.target.value) }
                    }))}
                  />
                </div>

                <div className="setting-item">
                  <div className="setting-info">
                    <h4>Auto-guardado</h4>
                    <p>Guardar cambios automáticamente</p>
                  </div>
                  <label className="switch">
                    <input
                      type="checkbox"
                      checked={settings.editor.autoSave}
                      onChange={(e) => setSettings(prev => ({
                        ...prev,
                        editor: { ...prev.editor, autoSave: e.target.checked }
                      }))}
                    />
                    <span className="slider"></span>
                  </label>
                </div>
              </div>
            </div>
          )}

          {activeSection === 'api' && (
            <div className="settings-section">
              <h2>Configuración de API</h2>

              <div className="settings-group">
                <div className="form-group">
                  <label>Timeout (ms): {settings.api.timeout}</label>
                  <input
                    type="range"
                    min="5000"
                    max="120000"
                    step="5000"
                    value={settings.api.timeout}
                    onChange={(e) => setSettings(prev => ({
                      ...prev,
                      api: { ...prev.api, timeout: parseInt(e.target.value) }
                    }))}
                  />
                </div>

                <div className="form-group">
                  <label>Reintentos: {settings.api.retries}</label>
                  <input
                    type="range"
                    min="0"
                    max="5"
                    value={settings.api.retries}
                    onChange={(e) => setSettings(prev => ({
                      ...prev,
                      api: { ...prev.api, retries: parseInt(e.target.value) }
                    }))}
                  />
                </div>
              </div>
            </div>
          )}

          {activeSection === 'security' && (
            <div className="settings-section">
              <h2>Seguridad</h2>

              <div className="settings-group">
                <div className="security-item">
                  <h4>Cambiar Contraseña</h4>
                  <p>Actualiza tu contraseña de acceso</p>
                  <button className="btn-secondary">
                    <i className="fas fa-key"></i>
                    Cambiar Contraseña
                  </button>
                </div>

                <div className="security-item">
                  <h4>Sesiones Activas</h4>
                  <p>Gestiona tus sesiones activas en otros dispositivos</p>
                  <button className="btn-secondary">
                    <i className="fas fa-desktop"></i>
                    Ver Sesiones
                  </button>
                </div>

                <div className="security-item">
                  <h4>API Tokens</h4>
                  <p>Gestiona tokens de acceso para integraciones</p>
                  <button className="btn-secondary">
                    <i className="fas fa-key"></i>
                    Gestionar Tokens
                  </button>
                </div>
              </div>
            </div>
          )}

          <div className="settings-footer">
            <button className="btn-primary" onClick={handleSave}>
              <i className="fas fa-save"></i>
              Guardar Cambios
            </button>
          </div>
        </main>
      </div>
    </div>
  )
}

export default SettingsPage
