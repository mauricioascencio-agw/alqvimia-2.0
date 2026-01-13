import { useState } from 'react'
import { VARIABLE_TYPES, VARIABLE_CATEGORIES, SYSTEM_VARIABLES, createVariable, formatVariableValue, getTypeInfo } from '../../utils/variableTypes'
import './VariablesPanel.css'

function VariablesPanel({ variables = [], onAddVariable, onUpdateVariable, onDeleteVariable }) {
  const [showAddModal, setShowAddModal] = useState(false)
  const [editingVariable, setEditingVariable] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [showSystemVars, setShowSystemVars] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState('all')

  // Nuevo formulario de variable
  const [newVar, setNewVar] = useState({
    name: '',
    type: 'string',
    defaultValue: '',
    scope: 'workflow'
  })

  const handleAddVariable = () => {
    if (!newVar.name.trim()) return

    const variable = createVariable(
      newVar.name,
      newVar.type,
      newVar.defaultValue || VARIABLE_TYPES[newVar.type].defaultValue,
      newVar.scope
    )

    onAddVariable(variable)
    setNewVar({ name: '', type: 'string', defaultValue: '', scope: 'workflow' })
    setShowAddModal(false)
  }

  const handleUpdateValue = (varId, newValue) => {
    onUpdateVariable(varId, { value: newValue })
  }

  const filteredVariables = variables.filter(v =>
    v.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const filteredSystemVars = SYSTEM_VARIABLES.filter(v =>
    v.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="variables-panel">
      {/* Header */}
      <div className="variables-header">
        <h3>
          <i className="fas fa-cube"></i>
          Variables
        </h3>
        <button className="btn-add-var" onClick={() => setShowAddModal(true)}>
          <i className="fas fa-plus"></i>
        </button>
      </div>

      {/* Búsqueda */}
      <div className="variables-search">
        <i className="fas fa-search"></i>
        <input
          type="text"
          placeholder="Buscar variables..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Tabs de categoría */}
      <div className="variables-tabs">
        <button
          className={`var-tab ${selectedCategory === 'all' ? 'active' : ''}`}
          onClick={() => setSelectedCategory('all')}
        >
          Todas
        </button>
        <button
          className={`var-tab ${selectedCategory === 'user' ? 'active' : ''}`}
          onClick={() => setSelectedCategory('user')}
        >
          Usuario
        </button>
        <button
          className={`var-tab ${selectedCategory === 'system' ? 'active' : ''}`}
          onClick={() => setSelectedCategory('system')}
        >
          Sistema
        </button>
      </div>

      {/* Lista de variables */}
      <div className="variables-list">
        {/* Variables del usuario */}
        {(selectedCategory === 'all' || selectedCategory === 'user') && (
          <>
            {filteredVariables.length === 0 && selectedCategory === 'user' && (
              <div className="no-variables">
                <i className="fas fa-inbox"></i>
                <p>No hay variables definidas</p>
                <button onClick={() => setShowAddModal(true)}>
                  <i className="fas fa-plus"></i> Crear variable
                </button>
              </div>
            )}

            {filteredVariables.map(variable => {
              const typeInfo = getTypeInfo(variable.type)
              return (
                <div key={variable.id} className="variable-item">
                  <div className="var-icon" style={{ background: `${typeInfo.color}20`, color: typeInfo.color }}>
                    <i className={`fas ${typeInfo.icon}`}></i>
                  </div>
                  <div className="var-info">
                    <span className="var-name">{variable.name}</span>
                    <span className="var-type">{typeInfo.name}</span>
                  </div>
                  <div className="var-value" title={formatVariableValue(variable.type, variable.value)}>
                    {formatVariableValue(variable.type, variable.value)}
                  </div>
                  <div className="var-actions">
                    <button
                      className="var-action-btn"
                      onClick={() => setEditingVariable(variable)}
                      title="Editar"
                    >
                      <i className="fas fa-edit"></i>
                    </button>
                    <button
                      className="var-action-btn delete"
                      onClick={() => onDeleteVariable(variable.id)}
                      title="Eliminar"
                    >
                      <i className="fas fa-trash"></i>
                    </button>
                  </div>
                </div>
              )
            })}
          </>
        )}

        {/* Variables del sistema */}
        {(selectedCategory === 'all' || selectedCategory === 'system') && (
          <div className="system-variables">
            {selectedCategory === 'all' && filteredSystemVars.length > 0 && (
              <div className="section-divider">
                <span>Variables del Sistema</span>
              </div>
            )}
            {filteredSystemVars.map(sysVar => {
              const typeInfo = getTypeInfo(sysVar.type)
              return (
                <div key={sysVar.name} className="variable-item system">
                  <div className="var-icon" style={{ background: `${typeInfo.color}20`, color: typeInfo.color }}>
                    <i className={`fas ${typeInfo.icon}`}></i>
                  </div>
                  <div className="var-info">
                    <span className="var-name">
                      {sysVar.name}
                      <i className="fas fa-lock system-badge" title="Variable del sistema"></i>
                    </span>
                    <span className="var-description">{sysVar.description}</span>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Modal para agregar variable */}
      {showAddModal && (
        <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>
                <i className="fas fa-plus-circle"></i>
                Nueva Variable
              </h3>
              <button className="modal-close" onClick={() => setShowAddModal(false)}>
                <i className="fas fa-times"></i>
              </button>
            </div>

            <div className="modal-body">
              {/* Nombre */}
              <div className="form-group">
                <label>Nombre de la variable</label>
                <input
                  type="text"
                  value={newVar.name}
                  onChange={(e) => setNewVar({ ...newVar, name: e.target.value })}
                  placeholder="miVariable"
                />
              </div>

              {/* Tipo */}
              <div className="form-group">
                <label>Tipo de dato</label>
                <div className="type-grid">
                  {Object.values(VARIABLE_TYPES).map(type => (
                    <button
                      key={type.id}
                      className={`type-option ${newVar.type === type.id ? 'selected' : ''}`}
                      onClick={() => setNewVar({ ...newVar, type: type.id, defaultValue: type.defaultValue })}
                      style={{
                        '--type-color': type.color,
                        borderColor: newVar.type === type.id ? type.color : 'transparent'
                      }}
                    >
                      <i className={`fas ${type.icon}`} style={{ color: type.color }}></i>
                      <span>{type.name.split(' ')[0]}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Valor por defecto */}
              <div className="form-group">
                <label>Valor inicial</label>
                {newVar.type === 'boolean' ? (
                  <div className="toggle-field">
                    <button
                      className={`toggle-option ${newVar.defaultValue === true ? 'active' : ''}`}
                      onClick={() => setNewVar({ ...newVar, defaultValue: true })}
                    >
                      Verdadero
                    </button>
                    <button
                      className={`toggle-option ${newVar.defaultValue === false ? 'active' : ''}`}
                      onClick={() => setNewVar({ ...newVar, defaultValue: false })}
                    >
                      Falso
                    </button>
                  </div>
                ) : newVar.type === 'integer' || newVar.type === 'double' ? (
                  <input
                    type="number"
                    step={newVar.type === 'double' ? '0.01' : '1'}
                    value={newVar.defaultValue}
                    onChange={(e) => setNewVar({ ...newVar, defaultValue: parseFloat(e.target.value) || 0 })}
                  />
                ) : newVar.type === 'date' ? (
                  <input
                    type="date"
                    value={newVar.defaultValue}
                    onChange={(e) => setNewVar({ ...newVar, defaultValue: e.target.value })}
                  />
                ) : newVar.type === 'datetime' ? (
                  <input
                    type="datetime-local"
                    value={newVar.defaultValue ? newVar.defaultValue.slice(0, 16) : ''}
                    onChange={(e) => setNewVar({ ...newVar, defaultValue: e.target.value })}
                  />
                ) : newVar.type === 'time' ? (
                  <input
                    type="time"
                    value={newVar.defaultValue}
                    onChange={(e) => setNewVar({ ...newVar, defaultValue: e.target.value })}
                  />
                ) : newVar.type === 'json' || newVar.type === 'array' ? (
                  <textarea
                    value={typeof newVar.defaultValue === 'object' ? JSON.stringify(newVar.defaultValue, null, 2) : newVar.defaultValue}
                    onChange={(e) => {
                      try {
                        setNewVar({ ...newVar, defaultValue: JSON.parse(e.target.value) })
                      } catch {
                        // Mantener como string si no es JSON válido
                      }
                    }}
                    placeholder={newVar.type === 'array' ? '[]' : '{}'}
                    rows={4}
                  />
                ) : (
                  <input
                    type="text"
                    value={newVar.defaultValue}
                    onChange={(e) => setNewVar({ ...newVar, defaultValue: e.target.value })}
                    placeholder="Valor inicial..."
                  />
                )}
              </div>

              {/* Alcance */}
              <div className="form-group">
                <label>Alcance</label>
                <div className="scope-options">
                  <button
                    className={`scope-option ${newVar.scope === 'workflow' ? 'active' : ''}`}
                    onClick={() => setNewVar({ ...newVar, scope: 'workflow' })}
                  >
                    <i className="fas fa-file"></i>
                    Workflow
                  </button>
                  <button
                    className={`scope-option ${newVar.scope === 'global' ? 'active' : ''}`}
                    onClick={() => setNewVar({ ...newVar, scope: 'global' })}
                  >
                    <i className="fas fa-globe"></i>
                    Global
                  </button>
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button className="btn-cancel" onClick={() => setShowAddModal(false)}>
                Cancelar
              </button>
              <button className="btn-create" onClick={handleAddVariable} disabled={!newVar.name.trim()}>
                <i className="fas fa-plus"></i>
                Crear Variable
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// Componente selector de variables para usar en propiedades de acciones
export function VariableSelector({ variables = [], value, onChange, allowedTypes = null, placeholder = 'Seleccionar variable...' }) {
  const [isOpen, setIsOpen] = useState(false)
  const [search, setSearch] = useState('')

  const allVariables = [
    ...variables,
    ...SYSTEM_VARIABLES.map(sv => ({ ...sv, id: `sys_${sv.name}`, isSystem: true }))
  ]

  const filteredVars = allVariables.filter(v => {
    const matchesSearch = v.name.toLowerCase().includes(search.toLowerCase())
    const matchesType = !allowedTypes || allowedTypes.includes(v.type)
    return matchesSearch && matchesType
  })

  const selectedVar = value ? allVariables.find(v => v.name === value || v.id === value) : null

  return (
    <div className="variable-selector">
      <div className="selector-input" onClick={() => setIsOpen(!isOpen)}>
        {selectedVar ? (
          <div className="selected-var">
            <i className={`fas ${getTypeInfo(selectedVar.type).icon}`} style={{ color: getTypeInfo(selectedVar.type).color }}></i>
            <span>{selectedVar.name}</span>
          </div>
        ) : (
          <span className="placeholder">{placeholder}</span>
        )}
        <i className={`fas fa-chevron-${isOpen ? 'up' : 'down'}`}></i>
      </div>

      {isOpen && (
        <div className="selector-dropdown">
          <div className="dropdown-search">
            <i className="fas fa-search"></i>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar..."
              autoFocus
            />
          </div>
          <div className="dropdown-list">
            {filteredVars.length === 0 ? (
              <div className="no-results">No hay variables disponibles</div>
            ) : (
              filteredVars.map(v => {
                const typeInfo = getTypeInfo(v.type)
                return (
                  <div
                    key={v.id || v.name}
                    className={`dropdown-item ${v.isSystem ? 'system' : ''}`}
                    onClick={() => {
                      onChange(v.name)
                      setIsOpen(false)
                      setSearch('')
                    }}
                  >
                    <i className={`fas ${typeInfo.icon}`} style={{ color: typeInfo.color }}></i>
                    <span className="var-name">{v.name}</span>
                    {v.isSystem && <i className="fas fa-lock system-icon"></i>}
                  </div>
                )
              })
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default VariablesPanel
