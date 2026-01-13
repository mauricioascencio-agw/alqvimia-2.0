/**
 * VariableInput - Componente universal para campos con soporte de variables
 * Permite insertar variables ${variableName} en cualquier campo de texto
 */

import { useState, useEffect, useRef } from 'react'
import { SYSTEM_VARIABLES, getTypeInfo } from '../../utils/variableTypes'
import './VariableInput.css'

// Expresión regular para detectar variables ${...}
const VARIABLE_REGEX = /\$\{([^}]+)\}/g

// Evaluar valores del sistema
function getSystemValue(varName) {
  const now = new Date()
  switch (varName) {
    case 'CurrentDate': return now.toISOString().split('T')[0]
    case 'CurrentTime': return now.toTimeString().split(' ')[0]
    case 'CurrentDateTime': return now.toISOString()
    case 'CurrentYear': return now.getFullYear()
    case 'CurrentMonth': return now.getMonth() + 1
    case 'CurrentDay': return now.getDate()
    case 'UserName': return 'Usuario'
    case 'MachineName': return 'Alqvimia-PC'
    case 'WorkflowName': return 'Mi Workflow'
    case 'WorkflowPath': return 'C:\\Alqvimia\\Workflows'
    default: return null
  }
}

// Resolver variables en un texto
export function resolveVariables(text, userVariables = []) {
  if (!text || typeof text !== 'string') return text

  return text.replace(VARIABLE_REGEX, (match, varName) => {
    // Buscar en variables del usuario
    const userVar = userVariables.find(v => v.name === varName)
    if (userVar) {
      return userVar.value !== undefined ? String(userVar.value) : match
    }

    // Buscar en variables del sistema
    const systemValue = getSystemValue(varName)
    if (systemValue !== null) {
      return String(systemValue)
    }

    // No encontrada, mantener el placeholder
    return match
  })
}

// Detectar variables en un texto
export function detectVariables(text) {
  if (!text || typeof text !== 'string') return []
  const matches = []
  let match
  while ((match = VARIABLE_REGEX.exec(text)) !== null) {
    matches.push(match[1])
  }
  return matches
}

// Componente principal VariableInput
export function VariableInput({
  value = '',
  onChange,
  placeholder = '',
  required = false,
  disabled = false,
  multiline = false,
  rows = 3,
  variables = [],
  allowedTypes = null,
  className = '',
  style = {}
}) {
  const [showSelector, setShowSelector] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [cursorPosition, setCursorPosition] = useState(0)
  const inputRef = useRef(null)
  const selectorRef = useRef(null)

  // Combinar variables del usuario con las del sistema
  const allVariables = [
    ...variables.map(v => ({ ...v, isSystem: false })),
    ...SYSTEM_VARIABLES.map(sv => ({ ...sv, id: `sys_${sv.name}`, isSystem: true }))
  ]

  // Filtrar por tipo si se especifica
  const filteredByType = allowedTypes
    ? allVariables.filter(v => allowedTypes.includes(v.type))
    : allVariables

  // Filtrar por término de búsqueda
  const filteredVariables = searchTerm
    ? filteredByType.filter(v =>
        v.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (v.description && v.description.toLowerCase().includes(searchTerm.toLowerCase()))
      )
    : filteredByType

  // Insertar variable en la posición del cursor
  const insertVariable = (varName) => {
    const before = (value || '').substring(0, cursorPosition)
    const after = (value || '').substring(cursorPosition)
    const newValue = `${before}\${${varName}}${after}`
    onChange(newValue)
    setShowSelector(false)
    setSearchTerm('')

    // Enfocar y posicionar cursor después de la variable
    setTimeout(() => {
      if (inputRef.current) {
        const newPos = before.length + varName.length + 3 // ${ + name + }
        inputRef.current.focus()
        inputRef.current.setSelectionRange(newPos, newPos)
      }
    }, 50)
  }

  // Abrir selector con atajo de teclado
  const handleKeyDown = (e) => {
    // Ctrl+Space o $ para abrir selector
    if ((e.ctrlKey && e.key === ' ') || (e.key === '$' && !showSelector)) {
      e.preventDefault()
      setCursorPosition(inputRef.current?.selectionStart || 0)
      setShowSelector(true)
    }
    // Escape para cerrar
    if (e.key === 'Escape') {
      setShowSelector(false)
      setSearchTerm('')
    }
  }

  // Cerrar selector al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (selectorRef.current && !selectorRef.current.contains(e.target) &&
          inputRef.current && !inputRef.current.contains(e.target)) {
        setShowSelector(false)
        setSearchTerm('')
      }
    }
    if (showSelector) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [showSelector])

  // Renderizar texto con variables resaltadas
  const renderHighlightedValue = () => {
    if (!value) return null

    const parts = []
    let lastIndex = 0
    let match

    const regex = new RegExp(VARIABLE_REGEX.source, 'g')
    while ((match = regex.exec(value)) !== null) {
      // Texto antes de la variable
      if (match.index > lastIndex) {
        parts.push(<span key={`text-${lastIndex}`}>{value.substring(lastIndex, match.index)}</span>)
      }
      // La variable
      const varName = match[1]
      const varInfo = allVariables.find(v => v.name === varName)
      const typeInfo = varInfo ? getTypeInfo(varInfo.type) : { icon: 'fa-question', color: '#888' }

      parts.push(
        <span key={`var-${match.index}`} className="variable-highlight" style={{ color: typeInfo.color }}>
          <i className={`fas ${typeInfo.icon}`}></i>
          {varName}
        </span>
      )
      lastIndex = match.index + match[0].length
    }

    // Texto restante
    if (lastIndex < value.length) {
      parts.push(<span key={`text-${lastIndex}`}>{value.substring(lastIndex)}</span>)
    }

    return parts
  }

  const InputComponent = multiline ? 'textarea' : 'input'

  return (
    <div className={`variable-input-container ${className}`} style={style}>
      <div className="variable-input-wrapper">
        <InputComponent
          ref={inputRef}
          type={multiline ? undefined : 'text'}
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          onClick={() => setCursorPosition(inputRef.current?.selectionStart || 0)}
          placeholder={placeholder}
          disabled={disabled}
          rows={multiline ? rows : undefined}
          className={`variable-input ${required && !value ? 'invalid' : ''}`}
        />

        <div className="variable-input-actions">
          <button
            type="button"
            className="var-btn"
            onClick={() => {
              setCursorPosition(inputRef.current?.selectionStart || value?.length || 0)
              setShowSelector(!showSelector)
            }}
            title="Insertar variable (Ctrl+Space)"
            disabled={disabled}
          >
            <i className="fas fa-cube"></i>
          </button>
        </div>

        {/* Preview de variables detectadas */}
        {value && detectVariables(value).length > 0 && (
          <div className="variable-preview">
            {detectVariables(value).map((varName, idx) => {
              const varInfo = allVariables.find(v => v.name === varName)
              const typeInfo = varInfo ? getTypeInfo(varInfo.type) : { icon: 'fa-question', color: '#888' }
              return (
                <span
                  key={idx}
                  className="var-tag"
                  style={{ borderColor: typeInfo.color, color: typeInfo.color }}
                  title={varInfo?.description || varName}
                >
                  <i className={`fas ${typeInfo.icon}`}></i>
                  {varName}
                </span>
              )
            })}
          </div>
        )}
      </div>

      {/* Selector de variables */}
      {showSelector && (
        <div ref={selectorRef} className="variable-selector-popup">
          <div className="selector-header">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar variable..."
              autoFocus
            />
            <button onClick={() => { setShowSelector(false); setSearchTerm('') }}>
              <i className="fas fa-times"></i>
            </button>
          </div>

          <div className="selector-content">
            {/* Variables del usuario */}
            {variables.length > 0 && (
              <div className="var-group">
                <div className="group-title">
                  <i className="fas fa-user"></i> Mis Variables
                </div>
                {filteredVariables.filter(v => !v.isSystem).map(v => {
                  const typeInfo = getTypeInfo(v.type)
                  return (
                    <div
                      key={v.id || v.name}
                      className="var-item"
                      onClick={() => insertVariable(v.name)}
                    >
                      <i className={`fas ${typeInfo.icon}`} style={{ color: typeInfo.color }}></i>
                      <span className="var-name">{v.name}</span>
                      <span className="var-type">{typeInfo.name.split(' ')[0]}</span>
                      {v.value !== undefined && (
                        <span className="var-value" title={String(v.value)}>
                          = {String(v.value).substring(0, 20)}
                        </span>
                      )}
                    </div>
                  )
                })}
              </div>
            )}

            {/* Variables del sistema */}
            <div className="var-group">
              <div className="group-title">
                <i className="fas fa-cog"></i> Variables del Sistema
              </div>
              {filteredVariables.filter(v => v.isSystem).map(v => {
                const typeInfo = getTypeInfo(v.type)
                const currentValue = getSystemValue(v.name)
                return (
                  <div
                    key={v.id || v.name}
                    className="var-item system"
                    onClick={() => insertVariable(v.name)}
                  >
                    <i className={`fas ${typeInfo.icon}`} style={{ color: typeInfo.color }}></i>
                    <span className="var-name">{v.name}</span>
                    <span className="var-desc">{v.description}</span>
                    {currentValue !== null && (
                      <span className="var-current">= {String(currentValue)}</span>
                    )}
                  </div>
                )
              })}
            </div>

            {filteredVariables.length === 0 && (
              <div className="no-variables">
                <i className="fas fa-search"></i>
                <p>No se encontraron variables</p>
              </div>
            )}
          </div>

          <div className="selector-footer">
            <span className="hint">
              <kbd>$</kbd> o <kbd>Ctrl+Space</kbd> para abrir
            </span>
          </div>
        </div>
      )}
    </div>
  )
}

// Componente para mostrar preview de valor resuelto
export function VariablePreview({ value, variables = [] }) {
  const resolved = resolveVariables(value, variables)

  if (!value || value === resolved) return null

  return (
    <div className="variable-resolved-preview">
      <i className="fas fa-arrow-right"></i>
      <span>{resolved}</span>
    </div>
  )
}

export default VariableInput
