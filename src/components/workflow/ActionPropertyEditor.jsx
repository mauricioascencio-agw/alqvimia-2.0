import { useState, useEffect, useCallback, useRef } from 'react'
import { getActionProperties, COMMON_FIELDS } from '../../utils/actionProperties'
import { VariableSelector } from './VariablesPanel'
import { SYSTEM_VARIABLES, getTypeInfo } from '../../utils/variableTypes'
import { VariableInput, VariablePreview } from './VariableInput'
import './ActionPropertyEditor.css'

// Componente para campo de contraseña
function PasswordField({ value, onChange, placeholder, required, encrypted }) {
  const [showPassword, setShowPassword] = useState(false)

  return (
    <div className="password-field">
      <input
        type={showPassword ? 'text' : 'password'}
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={required && !value ? 'invalid' : ''}
      />
      <button
        type="button"
        className="password-toggle"
        onClick={() => setShowPassword(!showPassword)}
      >
        <i className={`fas fa-eye${showPassword ? '-slash' : ''}`}></i>
      </button>
      {encrypted && (
        <span className="encrypted-badge" title="Valor encriptado">
          <i className="fas fa-lock"></i>
        </span>
      )}
    </div>
  )
}

// Componente para campo de tags
function TagsField({ value, onChange, placeholder }) {
  const [tagInput, setTagInput] = useState('')
  const tags = Array.isArray(value) ? value : (value ? [value] : [])

  const addTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      onChange([...tags, tagInput.trim()])
      setTagInput('')
    }
  }

  const removeTag = (index) => {
    onChange(tags.filter((_, i) => i !== index))
  }

  return (
    <div className="tags-field">
      <div className="tags-list">
        {tags.map((tag, index) => (
          <span key={index} className="tag">
            {tag}
            <button type="button" onClick={() => removeTag(index)}>
              <i className="fas fa-times"></i>
            </button>
          </span>
        ))}
      </div>
      <div className="tag-input-wrapper">
        <input
          type="text"
          value={tagInput}
          onChange={(e) => setTagInput(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
          placeholder={placeholder || 'Agregar...'}
        />
        <button type="button" onClick={addTag} className="add-tag-btn">
          <i className="fas fa-plus"></i>
        </button>
      </div>
    </div>
  )
}

// Componente simple para campo de archivo (sin variables)
function FileFieldSimple({ value, onChange, placeholder, required, accept = '', fileType = 'open' }) {
  const [isBrowsing, setIsBrowsing] = useState(false)

  const handleBrowse = async () => {
    if (isBrowsing) return
    setIsBrowsing(true)

    try {
      // Si fileType es 'save', usar diálogo de guardar
      const endpoint = fileType === 'save'
        ? '/api/system/save-file-dialog'
        : '/api/system/select-file'

      // Construir filtro basado en accept
      let filter = 'Todos los archivos (*.*)|*.*'
      if (accept) {
        const extensions = accept.split(',').map(ext => ext.trim())
        const extPattern = extensions.map(ext => `*${ext}`).join(';')
        filter = `Archivos permitidos (${extPattern})|${extPattern}|Todos los archivos (*.*)|*.*`
      }

      const response = await fetch(`http://localhost:4000${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: fileType === 'save' ? 'Guardar archivo' : 'Seleccionar archivo',
          filter: filter,
          initialDirectory: value ? value.replace(/[/\\][^/\\]*$/, '') : ''
        })
      })

      const result = await response.json()

      if (result.success && !result.cancelled && result.path) {
        onChange(result.path)
      }
    } catch (error) {
      console.error('Error al abrir diálogo:', error)
    } finally {
      setIsBrowsing(false)
    }
  }

  return (
    <div className="file-field">
      <input
        type="text"
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={required && !value ? 'invalid' : ''}
      />
      <button
        type="button"
        className={`file-browse ${isBrowsing ? 'loading' : ''}`}
        title="Examinar"
        onClick={handleBrowse}
        disabled={isBrowsing}
      >
        <i className={`fas ${isBrowsing ? 'fa-spinner fa-spin' : 'fa-folder-open'}`}></i>
      </button>
    </div>
  )
}

// Componente para texto con selector de variables - Usa el nuevo VariableInput
function TextWithVariableField({ value, onChange, placeholder, required, variables = [], allowedTypes }) {
  return (
    <div className="text-with-variable-field">
      <VariableInput
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        variables={variables}
        allowedTypes={allowedTypes}
      />
      <VariablePreview value={value} variables={variables} />
    </div>
  )
}

// Componente para campo de archivo con selector de variables
function FileWithVariableField({ value, onChange, placeholder, required, variables = [], allowedTypes, browseType = 'file', accept = '' }) {
  const [showVarSelector, setShowVarSelector] = useState(false)
  const [inputMode, setInputMode] = useState('text') // 'text' o 'variable'
  const [isBrowsing, setIsBrowsing] = useState(false)
  const inputRef = useRef(null)
  const selectorRef = useRef(null)

  // Función para abrir el diálogo de selección de archivo/carpeta
  const handleBrowse = async () => {
    if (isBrowsing) return
    setIsBrowsing(true)

    try {
      const endpoint = browseType === 'folder'
        ? '/api/system/select-folder'
        : '/api/system/select-file'

      // Construir filtro basado en accept
      let filter = 'Todos los archivos (*.*)|*.*'
      if (accept && browseType !== 'folder') {
        const extensions = accept.split(',').map(ext => ext.trim())
        const extPattern = extensions.map(ext => `*${ext}`).join(';')
        filter = `Archivos permitidos (${extPattern})|${extPattern}|Todos los archivos (*.*)|*.*`
      }

      const response = await fetch(`http://localhost:4000${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: browseType === 'folder' ? 'Seleccionar carpeta' : 'Seleccionar archivo',
          filter: filter,
          initialDirectory: value && !value.startsWith('${') ? value.replace(/[/\\][^/\\]*$/, '') : ''
        })
      })

      const result = await response.json()

      if (result.success && !result.cancelled && result.path) {
        onChange(result.path)
        setInputMode('text')
      }
    } catch (error) {
      console.error('Error al abrir diálogo:', error)
    } finally {
      setIsBrowsing(false)
    }
  }

  // Combinar variables del usuario con las del sistema
  const allVariables = [
    ...variables,
    ...SYSTEM_VARIABLES.map(sv => ({ ...sv, id: `sys_${sv.name}`, isSystem: true }))
  ]

  // Filtrar variables que coincidan con tipos permitidos (archivo, carpeta, etc.)
  const filteredVars = allowedTypes
    ? allVariables.filter(v => allowedTypes.includes(v.type))
    : allVariables

  const selectVariable = (varName) => {
    onChange(`\${${varName}}`)
    setShowVarSelector(false)
    setInputMode('variable')
  }

  const clearVariable = () => {
    onChange('')
    setInputMode('text')
  }

  // Cerrar selector al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (selectorRef.current && !selectorRef.current.contains(e.target)) {
        setShowVarSelector(false)
      }
    }
    if (showVarSelector) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [showVarSelector])

  // Detectar si el valor actual es una variable
  const isVariableValue = value && value.startsWith('${') && value.endsWith('}')
  const variableName = isVariableValue ? value.slice(2, -1) : null

  return (
    <div className="file-with-variable-field">
      <div className="input-wrapper">
        {isVariableValue ? (
          <div className="variable-value">
            <i className="fas fa-cube"></i>
            <span>{variableName}</span>
            <button type="button" className="clear-var-btn" onClick={clearVariable} title="Quitar variable">
              <i className="fas fa-times"></i>
            </button>
          </div>
        ) : (
          <input
            ref={inputRef}
            type="text"
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            className={required && !value ? 'invalid' : ''}
          />
        )}
        <button
          type="button"
          className="var-selector-btn"
          onClick={() => setShowVarSelector(!showVarSelector)}
          title="Seleccionar variable"
        >
          <i className="fas fa-times-circle"></i>
        </button>
        <button
          type="button"
          className={`file-browse-btn ${isBrowsing ? 'loading' : ''}`}
          title={browseType === 'folder' ? 'Seleccionar carpeta' : 'Examinar archivo'}
          onClick={handleBrowse}
          disabled={isBrowsing}
        >
          <i className={`fas ${isBrowsing ? 'fa-spinner fa-spin' : (browseType === 'folder' ? 'fa-folder' : 'fa-folder-open')}`}></i>
        </button>
      </div>
      {showVarSelector && (
        <div ref={selectorRef} className="variable-popup">
          <div className="popup-header">
            <span>Seleccionar variable</span>
            <button onClick={() => setShowVarSelector(false)}>
              <i className="fas fa-times"></i>
            </button>
          </div>
          <div className="popup-list">
            {filteredVars.length === 0 ? (
              <div className="popup-empty">No hay variables disponibles</div>
            ) : (
              filteredVars.map(v => {
                const typeInfo = getTypeInfo(v.type)
                return (
                  <div
                    key={v.id || v.name}
                    className="popup-item"
                    onClick={() => selectVariable(v.name)}
                  >
                    <i className={`fas ${typeInfo.icon}`} style={{ color: typeInfo.color }}></i>
                    <span className="var-name">{v.name}</span>
                    <span className="var-type">{typeInfo.name.split(' ')[0]}</span>
                    {v.isSystem && <i className="fas fa-lock system-badge"></i>}
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

// Componente para campo de ventana con selector de variables
function WindowWithVariableField({ value, onChange, placeholder, required, variables = [], allowedTypes }) {
  const [showVarSelector, setShowVarSelector] = useState(false)
  const inputRef = useRef(null)
  const selectorRef = useRef(null)

  // Combinar variables del usuario con las del sistema
  const allVariables = [
    ...variables,
    ...SYSTEM_VARIABLES.map(sv => ({ ...sv, id: `sys_${sv.name}`, isSystem: true }))
  ]

  // Filtrar variables que coincidan con tipos permitidos
  const filteredVars = allowedTypes
    ? allVariables.filter(v => allowedTypes.includes(v.type))
    : allVariables

  const selectVariable = (varName) => {
    onChange(`\${${varName}}`)
    setShowVarSelector(false)
  }

  const clearVariable = () => {
    onChange('')
  }

  // Cerrar selector al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (selectorRef.current && !selectorRef.current.contains(e.target)) {
        setShowVarSelector(false)
      }
    }
    if (showVarSelector) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [showVarSelector])

  // Detectar si el valor actual es una variable
  const isVariableValue = value && value.startsWith('${') && value.endsWith('}')
  const variableName = isVariableValue ? value.slice(2, -1) : null

  return (
    <div className="window-with-variable-field">
      <div className="input-wrapper">
        {isVariableValue ? (
          <div className="variable-value">
            <i className="fas fa-cube"></i>
            <span>{variableName}</span>
            <button type="button" className="clear-var-btn" onClick={clearVariable} title="Quitar variable">
              <i className="fas fa-times"></i>
            </button>
          </div>
        ) : (
          <input
            ref={inputRef}
            type="text"
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            className={required && !value ? 'invalid' : ''}
          />
        )}
        <button
          type="button"
          className="var-selector-btn"
          onClick={() => setShowVarSelector(!showVarSelector)}
          title="Seleccionar variable"
        >
          <i className="fas fa-times-circle"></i>
        </button>
        <button type="button" className="window-picker-btn" title="Seleccionar ventana activa">
          <i className="fas fa-window-restore"></i>
        </button>
      </div>
      {showVarSelector && (
        <div ref={selectorRef} className="variable-popup">
          <div className="popup-header">
            <span>Seleccionar variable</span>
            <button onClick={() => setShowVarSelector(false)}>
              <i className="fas fa-times"></i>
            </button>
          </div>
          <div className="popup-list">
            {filteredVars.length === 0 ? (
              <div className="popup-empty">No hay variables disponibles</div>
            ) : (
              filteredVars.map(v => {
                const typeInfo = getTypeInfo(v.type)
                return (
                  <div
                    key={v.id || v.name}
                    className="popup-item"
                    onClick={() => selectVariable(v.name)}
                  >
                    <i className={`fas ${typeInfo.icon}`} style={{ color: typeInfo.color }}></i>
                    <span className="var-name">{v.name}</span>
                    <span className="var-type">{typeInfo.name.split(' ')[0]}</span>
                    {v.isSystem && <i className="fas fa-lock system-badge"></i>}
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

// Componente para campo key-value
function KeyValueField({ value, onChange, helpText }) {
  const pairs = Array.isArray(value) ? value : []
  const [newKey, setNewKey] = useState('')
  const [newValue, setNewValue] = useState('')

  const addPair = () => {
    if (newKey.trim()) {
      onChange([...pairs, { key: newKey.trim(), value: newValue }])
      setNewKey('')
      setNewValue('')
    }
  }

  const removePair = (index) => {
    onChange(pairs.filter((_, i) => i !== index))
  }

  const updatePair = (index, prop, val) => {
    const updated = [...pairs]
    updated[index][prop] = val
    onChange(updated)
  }

  return (
    <div className="key-value-field">
      {pairs.map((pair, index) => (
        <div key={index} className="key-value-row">
          <input
            type="text"
            value={pair.key}
            onChange={(e) => updatePair(index, 'key', e.target.value)}
            placeholder="Clave"
            className="kv-key"
          />
          <span className="kv-separator">:</span>
          <input
            type="text"
            value={pair.value}
            onChange={(e) => updatePair(index, 'value', e.target.value)}
            placeholder="Valor"
            className="kv-value"
          />
          <button type="button" onClick={() => removePair(index)} className="kv-remove">
            <i className="fas fa-times"></i>
          </button>
        </div>
      ))}
      <div className="key-value-add">
        <input
          type="text"
          value={newKey}
          onChange={(e) => setNewKey(e.target.value)}
          placeholder="Nueva clave"
          className="kv-key"
        />
        <span className="kv-separator">:</span>
        <input
          type="text"
          value={newValue}
          onChange={(e) => setNewValue(e.target.value)}
          placeholder="Valor"
          className="kv-value"
          onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addPair())}
        />
        <button type="button" onClick={addPair} className="kv-add">
          <i className="fas fa-plus"></i>
        </button>
      </div>
    </div>
  )
}

// Componente para cada tipo de campo
function PropertyField({ field, value, onChange, allValues, variables = [] }) {
  const [localValue, setLocalValue] = useState(value ?? field.default ?? '')

  useEffect(() => {
    setLocalValue(value ?? field.default ?? '')
  }, [value, field.default])

  // Verificar condiciones
  if (field.condition) {
    const { field: condField, value: condValue, notValue, inValues, notInValues } = field.condition
    const currentCondValue = allValues[condField]

    if (condValue !== undefined && currentCondValue !== condValue) return null
    if (notValue !== undefined && currentCondValue === notValue) return null
    if (inValues && !inValues.includes(currentCondValue)) return null
    if (notInValues && notInValues.includes(currentCondValue)) return null
  }

  const handleChange = (newValue) => {
    setLocalValue(newValue)
    onChange(field.key, newValue)
  }

  const renderField = () => {
    switch (field.type) {
      case 'select':
        return (
          <div className="select-wrapper">
            <select
              value={localValue}
              onChange={(e) => handleChange(e.target.value)}
              className={field.required && !localValue ? 'invalid' : ''}
            >
              <option value="">Seleccionar...</option>
              {field.options?.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            <i className="fas fa-chevron-down select-arrow"></i>
          </div>
        )

      case 'selectWithIcons':
      case 'selectIcon':
        return (
          <div className="select-with-icons">
            {field.options?.map((opt) => (
              <button
                key={opt.value}
                type="button"
                className={`icon-option ${localValue === opt.value ? 'selected' : ''}`}
                onClick={() => handleChange(opt.value)}
                title={opt.label}
              >
                <i className={opt.icon}></i>
                <span>{opt.label}</span>
              </button>
            ))}
          </div>
        )

      case 'buttonGroup':
        return (
          <div className="button-group">
            {field.options?.map((opt) => (
              <button
                key={opt.value}
                type="button"
                className={`btn-group-item ${localValue === opt.value ? 'active' : ''}`}
                onClick={() => handleChange(opt.value)}
              >
                {opt.icon && <i className={opt.icon}></i>}
                {opt.label}
              </button>
            ))}
          </div>
        )

      case 'toggle':
        return (
          <label className="toggle-switch">
            <input
              type="checkbox"
              checked={localValue || false}
              onChange={(e) => handleChange(e.target.checked)}
            />
            <span className="toggle-slider"></span>
            <span className="toggle-label">{localValue ? 'Activado' : 'Desactivado'}</span>
          </label>
        )

      case 'checkbox':
        return (
          <label className="checkbox-field">
            <input
              type="checkbox"
              checked={localValue || false}
              onChange={(e) => handleChange(e.target.checked)}
            />
            <span className="checkbox-custom"></span>
            <span className="checkbox-label">{field.checkboxLabel || (localValue ? 'Sí' : 'No')}</span>
          </label>
        )

      case 'slider':
        return (
          <div className="slider-field">
            <input
              type="range"
              min={field.min || 0}
              max={field.max || 100}
              step={field.step || 1}
              value={localValue}
              onChange={(e) => handleChange(Number(e.target.value))}
            />
            <span className="slider-value">
              {localValue}{field.unit || ''}
            </span>
          </div>
        )

      case 'number':
        return (
          <div className="number-field">
            <button
              type="button"
              className="number-btn"
              onClick={() => handleChange(Math.max((field.min || 0), (localValue || 0) - (field.step || 1)))}
            >
              <i className="fas fa-minus"></i>
            </button>
            <input
              type="number"
              value={localValue}
              onChange={(e) => handleChange(Number(e.target.value))}
              min={field.min}
              max={field.max}
              step={field.step}
            />
            <button
              type="button"
              className="number-btn"
              onClick={() => handleChange(Math.min((field.max || Infinity), (localValue || 0) + (field.step || 1)))}
            >
              <i className="fas fa-plus"></i>
            </button>
          </div>
        )

      case 'textarea':
        return (
          <div className="textarea-with-vars">
            <VariableInput
              value={localValue}
              onChange={handleChange}
              placeholder={field.placeholder}
              required={field.required}
              variables={variables}
              multiline={true}
              rows={field.rows || 3}
            />
            <VariablePreview value={localValue} variables={variables} />
          </div>
        )

      case 'code':
        return (
          <div className="code-editor">
            <div className="code-header">
              <span className="code-language">{field.language || 'text'}</span>
              <button type="button" className="code-copy" title="Copiar">
                <i className="fas fa-copy"></i>
              </button>
            </div>
            <textarea
              value={localValue}
              onChange={(e) => handleChange(e.target.value)}
              placeholder={field.placeholder}
              rows={field.rows || 6}
              className="code-textarea"
              spellCheck="false"
            />
          </div>
        )

      case 'selector':
        return (
          <div className="selector-field">
            <input
              type="text"
              value={localValue}
              onChange={(e) => handleChange(e.target.value)}
              placeholder={field.placeholder}
              className={field.required && !localValue ? 'invalid' : ''}
            />
            <button type="button" className="selector-picker" title="Seleccionar elemento">
              <i className="fas fa-crosshairs"></i>
            </button>
          </div>
        )

      case 'variable':
        return (
          <div className="variable-field">
            <span className="variable-prefix">$</span>
            <input
              type="text"
              value={localValue}
              onChange={(e) => handleChange(e.target.value)}
              placeholder={field.placeholder}
              className={field.required && !localValue ? 'invalid' : ''}
            />
          </div>
        )

      case 'variableSelect':
        return (
          <VariableSelector
            variables={variables}
            value={localValue}
            onChange={handleChange}
            allowedTypes={field.allowedTypes}
            placeholder={field.placeholder}
          />
        )

      case 'textWithVariable':
        return (
          <TextWithVariableField
            value={localValue}
            onChange={handleChange}
            placeholder={field.placeholder}
            required={field.required}
            variables={variables}
            allowedTypes={field.allowedTypes}
          />
        )

      case 'textareaWithVariable':
        return (
          <div className="textarea-with-variable">
            <VariableInput
              value={localValue}
              onChange={handleChange}
              placeholder={field.placeholder}
              required={field.required}
              variables={variables}
              multiline={true}
              rows={field.rows || 4}
              allowedTypes={field.allowedTypes}
            />
            <VariablePreview value={localValue} variables={variables} />
          </div>
        )

      case 'expression':
        return (
          <div className="expression-field">
            <input
              type="text"
              value={localValue}
              onChange={(e) => handleChange(e.target.value)}
              placeholder={field.placeholder}
              className={field.required && !localValue ? 'invalid' : ''}
            />
            <button type="button" className="expression-helper" title="Ayuda con expresiones">
              <i className="fas fa-magic"></i>
            </button>
          </div>
        )

      case 'file':
        return (
          <FileFieldSimple
            value={localValue}
            onChange={handleChange}
            placeholder={field.placeholder}
            required={field.required}
            accept={field.accept}
            fileType={field.fileType}
          />
        )

      case 'fileWithVariable':
        return (
          <FileWithVariableField
            value={localValue}
            onChange={handleChange}
            placeholder={field.placeholder}
            required={field.required}
            variables={variables}
            allowedTypes={field.allowedTypes}
            browseType="file"
            accept={field.accept}
          />
        )

      case 'folderWithVariable':
        return (
          <FileWithVariableField
            value={localValue}
            onChange={handleChange}
            placeholder={field.placeholder}
            required={field.required}
            variables={variables}
            allowedTypes={field.allowedTypes}
            browseType="folder"
            accept=""
          />
        )

      case 'windowWithVariable':
        return (
          <WindowWithVariableField
            value={localValue}
            onChange={handleChange}
            placeholder={field.placeholder}
            required={field.required}
            variables={variables}
            allowedTypes={field.allowedTypes}
          />
        )

      case 'url':
        return (
          <div className="url-field">
            <span className="url-icon">
              <i className="fas fa-globe"></i>
            </span>
            <input
              type="url"
              value={localValue}
              onChange={(e) => handleChange(e.target.value)}
              placeholder={field.placeholder}
              className={field.required && !localValue ? 'invalid' : ''}
            />
          </div>
        )

      case 'email':
        return (
          <div className="email-field">
            <span className="email-icon">
              <i className="fas fa-envelope"></i>
            </span>
            <input
              type="email"
              value={localValue}
              onChange={(e) => handleChange(e.target.value)}
              placeholder={field.placeholder}
              className={field.required && !localValue ? 'invalid' : ''}
            />
          </div>
        )

      case 'password':
        return (
          <PasswordField
            value={localValue}
            onChange={handleChange}
            placeholder={field.placeholder}
            required={field.required}
            encrypted={field.encrypted}
          />
        )

      case 'tags':
        return (
          <TagsField
            value={localValue}
            onChange={handleChange}
            placeholder={field.placeholder}
          />
        )

      case 'multiSelect':
        const selected = Array.isArray(localValue) ? localValue : []

        const toggleOption = (optValue) => {
          if (selected.includes(optValue)) {
            handleChange(selected.filter(v => v !== optValue))
          } else {
            handleChange([...selected, optValue])
          }
        }

        return (
          <div className="multi-select">
            {field.options?.map((opt) => (
              <label key={opt.value} className="multi-select-option">
                <input
                  type="checkbox"
                  checked={selected.includes(opt.value)}
                  onChange={() => toggleOption(opt.value)}
                />
                <span className="checkbox-custom"></span>
                <span>{opt.label}</span>
              </label>
            ))}
          </div>
        )

      case 'keyValue':
        return (
          <KeyValueField
            value={localValue}
            onChange={handleChange}
            helpText={field.helpText}
          />
        )

      case 'date':
        return (
          <input
            type="date"
            value={localValue}
            onChange={(e) => handleChange(e.target.value)}
            className={field.required && !localValue ? 'invalid' : ''}
          />
        )

      case 'datetime':
        return (
          <input
            type="datetime-local"
            value={localValue}
            onChange={(e) => handleChange(e.target.value)}
            className={field.required && !localValue ? 'invalid' : ''}
          />
        )

      case 'richtext':
        return (
          <div className="richtext-field">
            <div className="richtext-toolbar">
              <button type="button" title="Negrita"><i className="fas fa-bold"></i></button>
              <button type="button" title="Cursiva"><i className="fas fa-italic"></i></button>
              <button type="button" title="Subrayado"><i className="fas fa-underline"></i></button>
              <span className="toolbar-divider"></span>
              <button type="button" title="Lista"><i className="fas fa-list-ul"></i></button>
              <button type="button" title="Enlace"><i className="fas fa-link"></i></button>
            </div>
            <textarea
              value={localValue}
              onChange={(e) => handleChange(e.target.value)}
              placeholder={field.placeholder}
              rows={field.rows || 5}
            />
          </div>
        )

      default:
        // Por defecto, todos los campos de texto soportan variables
        return (
          <div className="text-field-with-vars">
            <VariableInput
              value={localValue}
              onChange={handleChange}
              placeholder={field.placeholder}
              required={field.required}
              variables={variables}
            />
            <VariablePreview value={localValue} variables={variables} />
          </div>
        )
    }
  }

  return (
    <div className={`property-field ${field.advanced ? 'advanced-field' : ''} ${field.required ? 'required' : ''}`}>
      <label>
        {field.label}
        {field.required && <span className="required-mark">*</span>}
      </label>
      {renderField()}
      {field.helpText && (
        <span className="field-help">
          <i className="fas fa-info-circle"></i>
          {field.helpText}
        </span>
      )}
    </div>
  )
}

// Componente principal del editor de propiedades
function ActionPropertyEditor({ selectedStep, onUpdateStep, variables = [] }) {
  const [properties, setProperties] = useState({})
  const [showAdvanced, setShowAdvanced] = useState(false)

  useEffect(() => {
    if (selectedStep) {
      setProperties(selectedStep.params || {})
    } else {
      setProperties({})
    }
  }, [selectedStep])

  const handlePropertyChange = useCallback((key, value) => {
    const newProperties = { ...properties, [key]: value }
    setProperties(newProperties)
    if (selectedStep && onUpdateStep) {
      onUpdateStep(selectedStep.id, { params: newProperties })
    }
  }, [properties, selectedStep, onUpdateStep])

  if (!selectedStep) {
    return (
      <div className="action-property-editor empty-state">
        <div className="empty-icon">
          <i className="fas fa-hand-pointer"></i>
        </div>
        <h4>Sin selección</h4>
        <p>Selecciona una acción del canvas para configurar sus propiedades</p>
      </div>
    )
  }

  const actionType = selectedStep.action || selectedStep.type
  const actionConfig = getActionProperties(actionType)
  const fields = actionConfig.fields || []
  const basicFields = fields.filter(f => !f.advanced)
  const advancedFields = fields.filter(f => f.advanced)

  return (
    <div className="action-property-editor">
      {/* Header de la acción */}
      <div className="action-header">
        <div className="action-icon-wrapper">
          <i className={`fas ${actionConfig.icon || selectedStep.icon || 'fa-cog'}`}></i>
        </div>
        <div className="action-info">
          <h3>{actionConfig.title || selectedStep.label}</h3>
          <p>{actionConfig.description}</p>
        </div>
      </div>

      {/* Formulario de propiedades */}
      <div className="properties-form">
        {/* Campos principales */}
        <div className="fields-section">
          {basicFields.map((field) => (
            <PropertyField
              key={field.key}
              field={field}
              value={properties[field.key]}
              onChange={handlePropertyChange}
              allValues={properties}
              variables={variables}
            />
          ))}
        </div>

        {/* Campos avanzados */}
        {advancedFields.length > 0 && (
          <div className="advanced-section">
            <button
              type="button"
              className="advanced-toggle"
              onClick={() => setShowAdvanced(!showAdvanced)}
            >
              <i className={`fas fa-chevron-${showAdvanced ? 'up' : 'down'}`}></i>
              Opciones avanzadas
              <span className="advanced-count">{advancedFields.length}</span>
            </button>
            {showAdvanced && (
              <div className="advanced-fields">
                {advancedFields.map((field) => (
                  <PropertyField
                    key={field.key}
                    field={field}
                    value={properties[field.key]}
                    onChange={handlePropertyChange}
                    allValues={properties}
                    variables={variables}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Campos comunes */}
        <div className="common-section">
          <div className="section-header">
            <i className="fas fa-sliders-h"></i>
            <span>Configuración general</span>
          </div>
          {COMMON_FIELDS.filter(f => !f.advanced || showAdvanced).map((field) => (
            <PropertyField
              key={field.key}
              field={field}
              value={properties[field.key]}
              onChange={handlePropertyChange}
              allValues={properties}
              variables={variables}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

export default ActionPropertyEditor
