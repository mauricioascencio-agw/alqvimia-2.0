/**
 * Sistema de Variables para Alqvimia RPA
 * Define los tipos de variables disponibles y sus propiedades
 */

// Tipos de variables disponibles
export const VARIABLE_TYPES = {
  string: {
    id: 'string',
    name: 'Texto (String)',
    icon: 'fa-font',
    color: '#10b981',
    defaultValue: '',
    validator: (val) => typeof val === 'string'
  },
  integer: {
    id: 'integer',
    name: 'Entero (Integer)',
    icon: 'fa-hashtag',
    color: '#3b82f6',
    defaultValue: 0,
    validator: (val) => Number.isInteger(val)
  },
  double: {
    id: 'double',
    name: 'Decimal (Double)',
    icon: 'fa-percentage',
    color: '#8b5cf6',
    defaultValue: 0.0,
    validator: (val) => typeof val === 'number'
  },
  boolean: {
    id: 'boolean',
    name: 'Booleano (Boolean)',
    icon: 'fa-toggle-on',
    color: '#f59e0b',
    defaultValue: false,
    validator: (val) => typeof val === 'boolean'
  },
  datetime: {
    id: 'datetime',
    name: 'Fecha y Hora (DateTime)',
    icon: 'fa-calendar-alt',
    color: '#ec4899',
    defaultValue: new Date().toISOString(),
    validator: (val) => !isNaN(Date.parse(val))
  },
  date: {
    id: 'date',
    name: 'Fecha (Date)',
    icon: 'fa-calendar-day',
    color: '#ef4444',
    defaultValue: new Date().toISOString().split('T')[0],
    validator: (val) => /^\d{4}-\d{2}-\d{2}$/.test(val)
  },
  time: {
    id: 'time',
    name: 'Hora (Time)',
    icon: 'fa-clock',
    color: '#06b6d4',
    defaultValue: '00:00:00',
    validator: (val) => /^\d{2}:\d{2}(:\d{2})?$/.test(val)
  },
  json: {
    id: 'json',
    name: 'JSON Object',
    icon: 'fa-code',
    color: '#6366f1',
    defaultValue: {},
    validator: (val) => typeof val === 'object' && val !== null
  },
  array: {
    id: 'array',
    name: 'Lista (Array)',
    icon: 'fa-list-ol',
    color: '#14b8a6',
    defaultValue: [],
    validator: (val) => Array.isArray(val)
  },
  dataframe: {
    id: 'dataframe',
    name: 'DataFrame (Tabla)',
    icon: 'fa-table',
    color: '#22c55e',
    defaultValue: { columns: [], rows: [] },
    validator: (val) => val && Array.isArray(val.columns) && Array.isArray(val.rows)
  },
  file: {
    id: 'file',
    name: 'Archivo (File)',
    icon: 'fa-file',
    color: '#a855f7',
    defaultValue: null,
    validator: () => true
  },
  credential: {
    id: 'credential',
    name: 'Credencial (Credential)',
    icon: 'fa-key',
    color: '#f97316',
    defaultValue: { username: '', password: '' },
    validator: (val) => val && typeof val.username === 'string'
  },
  browser: {
    id: 'browser',
    name: 'Navegador (Browser)',
    icon: 'fa-globe',
    color: '#0ea5e9',
    defaultValue: null,
    validator: () => true
  },
  element: {
    id: 'element',
    name: 'Elemento UI (Element)',
    icon: 'fa-crosshairs',
    color: '#84cc16',
    defaultValue: null,
    validator: () => true
  },
  connection: {
    id: 'connection',
    name: 'Conexión (Connection)',
    icon: 'fa-plug',
    color: '#64748b',
    defaultValue: null,
    validator: () => true
  }
}

// Categorías de variables para agrupar en la UI
export const VARIABLE_CATEGORIES = [
  {
    id: 'basic',
    name: 'Tipos Básicos',
    types: ['string', 'integer', 'double', 'boolean']
  },
  {
    id: 'datetime',
    name: 'Fecha y Hora',
    types: ['datetime', 'date', 'time']
  },
  {
    id: 'complex',
    name: 'Tipos Complejos',
    types: ['json', 'array', 'dataframe']
  },
  {
    id: 'system',
    name: 'Sistema',
    types: ['file', 'credential', 'browser', 'element', 'connection']
  }
]

// Variables del sistema predefinidas
export const SYSTEM_VARIABLES = [
  { name: 'CurrentDate', type: 'date', description: 'Fecha actual', isSystem: true },
  { name: 'CurrentTime', type: 'time', description: 'Hora actual', isSystem: true },
  { name: 'CurrentDateTime', type: 'datetime', description: 'Fecha y hora actual', isSystem: true },
  { name: 'CurrentYear', type: 'integer', description: 'Año actual', isSystem: true },
  { name: 'CurrentMonth', type: 'integer', description: 'Mes actual', isSystem: true },
  { name: 'CurrentDay', type: 'integer', description: 'Día actual', isSystem: true },
  { name: 'UserName', type: 'string', description: 'Usuario del sistema', isSystem: true },
  { name: 'MachineName', type: 'string', description: 'Nombre del equipo', isSystem: true },
  { name: 'WorkflowName', type: 'string', description: 'Nombre del workflow', isSystem: true },
  { name: 'WorkflowPath', type: 'string', description: 'Ruta del workflow', isSystem: true }
]

// Crear una nueva variable
export function createVariable(name, type, defaultValue = null, scope = 'workflow') {
  const typeInfo = VARIABLE_TYPES[type]
  if (!typeInfo) {
    throw new Error(`Tipo de variable inválido: ${type}`)
  }

  return {
    id: `var_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    name,
    type,
    value: defaultValue !== null ? defaultValue : typeInfo.defaultValue,
    scope, // 'workflow', 'global', 'step'
    createdAt: new Date().toISOString(),
    isSystem: false
  }
}

// Validar el valor de una variable
export function validateVariableValue(type, value) {
  const typeInfo = VARIABLE_TYPES[type]
  if (!typeInfo) return false
  return typeInfo.validator(value)
}

// Formatear el valor de una variable para mostrar
export function formatVariableValue(type, value) {
  if (value === null || value === undefined) return 'null'

  switch (type) {
    case 'string':
      return `"${value}"`
    case 'boolean':
      return value ? 'Verdadero' : 'Falso'
    case 'datetime':
    case 'date':
      return new Date(value).toLocaleDateString('es-ES')
    case 'time':
      return value
    case 'json':
    case 'array':
    case 'dataframe':
      return JSON.stringify(value, null, 2)
    case 'credential':
      return `${value.username} (***)`
    default:
      return String(value)
  }
}

// Obtener icono y color de un tipo
export function getTypeInfo(type) {
  return VARIABLE_TYPES[type] || VARIABLE_TYPES.string
}

export default {
  VARIABLE_TYPES,
  VARIABLE_CATEGORIES,
  SYSTEM_VARIABLES,
  createVariable,
  validateVariableValue,
  formatVariableValue,
  getTypeInfo
}
