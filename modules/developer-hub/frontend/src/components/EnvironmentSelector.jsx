import { useState, useRef, useEffect } from 'react'
import { useEnvironmentStore } from '../stores/environmentStore'
import { useAuthStore } from '../stores/authStore'

function EnvironmentSelector() {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef(null)

  const { environments, currentEnvironment, setCurrentEnvironment } = useEnvironmentStore()
  const { hasEnvironmentAccess } = useAuthStore()

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSelect = (env) => {
    if (hasEnvironmentAccess(env.id)) {
      setCurrentEnvironment(env.id)
      setIsOpen(false)
    }
  }

  return (
    <div className="environment-selector" ref={dropdownRef}>
      <button
        className="env-trigger"
        onClick={() => setIsOpen(!isOpen)}
        style={{ borderColor: currentEnvironment?.color }}
      >
        <span
          className="env-dot"
          style={{ backgroundColor: currentEnvironment?.color }}
        ></span>
        <span className="env-name">{currentEnvironment?.name || 'Seleccionar'}</span>
        <i className={`fas fa-chevron-${isOpen ? 'up' : 'down'}`}></i>
      </button>

      {isOpen && (
        <div className="env-dropdown">
          <div className="env-dropdown-header">
            <i className="fas fa-server"></i>
            <span>Seleccionar Ambiente</span>
          </div>

          <div className="env-list">
            {environments.map(env => {
              const hasAccess = hasEnvironmentAccess(env.id)

              return (
                <button
                  key={env.id}
                  className={`env-option ${currentEnvironment?.id === env.id ? 'active' : ''} ${!hasAccess ? 'disabled' : ''}`}
                  onClick={() => handleSelect(env)}
                  disabled={!hasAccess}
                >
                  <span
                    className="env-dot"
                    style={{ backgroundColor: env.color }}
                  ></span>
                  <div className="env-info">
                    <span className="env-label">{env.name}</span>
                    <span className="env-id">{env.id.toUpperCase()}</span>
                  </div>
                  {currentEnvironment?.id === env.id && (
                    <i className="fas fa-check"></i>
                  )}
                  {!hasAccess && (
                    <i className="fas fa-lock" title="Sin acceso"></i>
                  )}
                </button>
              )
            })}
          </div>

          <div className="env-dropdown-footer">
            <small>
              <i className="fas fa-info-circle"></i>
              Ambiente actual: {currentEnvironment?.shortName}
            </small>
          </div>
        </div>
      )}
    </div>
  )
}

export default EnvironmentSelector
