// URL del backend desde variables de entorno o default
const API_BASE = import.meta.env.VITE_BACKEND_URL || 'http://localhost:4000'

async function request(endpoint, options = {}) {
  const url = `${API_BASE}${endpoint}`

  const defaultHeaders = {
    'Content-Type': 'application/json'
  }

  const config = {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers
    }
  }

  try {
    const response = await fetch(url, config)

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Error de red' }))
      throw new Error(error.message || `HTTP Error: ${response.status}`)
    }

    return await response.json()
  } catch (error) {
    console.error(`API Error [${endpoint}]:`, error)
    throw error
  }
}

export const api = {
  get: (endpoint) => request(endpoint, { method: 'GET' }),

  post: (endpoint, data) => request(endpoint, {
    method: 'POST',
    body: JSON.stringify(data)
  }),

  put: (endpoint, data) => request(endpoint, {
    method: 'PUT',
    body: JSON.stringify(data)
  }),

  delete: (endpoint) => request(endpoint, { method: 'DELETE' })
}

// Servicios específicos
export const workflowService = {
  // CRUD básico
  getAll: (filtros = {}) => {
    const params = new URLSearchParams(filtros).toString()
    return api.get(`/api/workflows${params ? '?' + params : ''}`)
  },
  getById: (id) => api.get(`/api/workflows/${id}`),
  create: (workflow) => api.post('/api/workflows', workflow),
  update: (id, workflow) => api.put(`/api/workflows/${id}`, workflow),
  delete: (id) => api.delete(`/api/workflows/${id}`),

  // Ejecuciones
  execute: (id, data = {}) => api.post(`/api/workflows/${id}/execute`, data),
  getExecutions: (id, limite = 50) => api.get(`/api/workflows/${id}/executions?limite=${limite}`),

  // Carpetas
  getFolders: (usuario_id = 1) => api.get(`/api/workflows/meta/folders?usuario_id=${usuario_id}`),
  createFolder: (folder) => api.post('/api/workflows/meta/folders', folder),

  // Sincronización
  sync: (workflows, usuario_id = 1) => api.post('/api/workflows/sync', { workflows, usuario_id }),

  // Alias para compatibilidad
  save: (workflow) => workflow.id
    ? api.put(`/api/workflows/${workflow.id}`, workflow)
    : api.post('/api/workflows', workflow)
}

export const settingsService = {
  load: () => api.get('/api/settings/load'),
  save: (settings) => api.post('/api/settings/save', settings)
}

export const databaseService = {
  testConnection: (config) => api.post('/api/database/test-connection', config),
  listDatabases: (config) => api.post('/api/database/list-databases', config),
  connect: (config) => api.post('/api/database/connect', config),
  listTables: (config) => api.post('/api/database/list-tables', config),
  executeQuery: (data) => api.post('/api/database/execute-query', data),
  exportData: (data) => api.post('/api/database/export', data)
}

export const omnichannelService = {
  initialize: () => api.post('/api/omnichannel/initialize'),
  getStatus: () => api.get('/api/omnichannel/status'),
  getWhatsAppQR: () => api.get('/api/omnichannel/whatsapp/qr'),
  sendMessage: (data) => api.post('/api/omnichannel/send-message', data),
  getConversations: () => api.get('/api/omnichannel/conversations'),
  shutdown: () => api.post('/api/omnichannel/shutdown')
}

export const videoConferenceService = {
  uploadRecording: (formData) => fetch(`${API_BASE}/api/video-conference/upload-recording`, {
    method: 'POST',
    body: formData
  }).then(res => res.json()),

  saveSession: (session) => api.post('/api/video-conference/save-session', session),
  saveMinutes: (data) => api.post('/api/video-conference/save-minutes', data),
  sendInvite: (data) => api.post('/api/video-conference/send-invite', data),
  testSMTP: (config) => api.post('/api/video-conference/test-smtp', config)
}

export const aiService = {
  loadConfig: () => api.get('/api/ai-config/load'),
  saveConfig: (config) => api.post('/api/ai-config/save', config),
  testConnection: (provider) => api.post('/api/ai-config/test', provider)
}

// Servicio para acciones del sistema (RPA Workflows)
export const systemService = {
  // Ejecutar PowerShell
  executePowerShell: (script, timeout = 30000) =>
    api.post('/api/system/powershell', { script, timeout }),

  // Ejecutar CMD
  executeCmd: (command, timeout = 30000) =>
    api.post('/api/system/cmd', { command, timeout }),

  // Abrir carpeta o archivo
  open: (path, type = 'folder') =>
    api.post('/api/system/open', { path, type }),

  // Listar archivos
  listFiles: (path, pattern = '*', recursive = false) =>
    api.post('/api/system/list-files', { path, pattern, recursive }),

  // Contar archivos
  countFiles: (path, pattern = '*', recursive = false) =>
    api.post('/api/system/count-files', { path, pattern, recursive }),

  // Leer archivo
  readFile: (path) =>
    api.post('/api/system/read-file', { path }),

  // Escribir archivo
  writeFile: (path, content) =>
    api.post('/api/system/write-file', { path, content }),

  // Copiar archivo/carpeta
  copy: (source, destination, recursive = true) =>
    api.post('/api/system/copy', { source, destination, recursive }),

  // Eliminar archivo/carpeta
  delete: (path, recursive = true) =>
    api.post('/api/system/delete', { path, recursive }),

  // Obtener info del sistema
  getInfo: () =>
    api.get('/api/system/info'),

  // ============================================================
  // DIÁLOGOS NATIVOS DE WINDOWS
  // ============================================================

  // Mostrar diálogo para seleccionar carpeta (FolderBrowserDialog)
  selectFolder: (title = 'Seleccione una carpeta', initialDirectory = '') =>
    api.post('/api/system/select-folder', { title, initialDirectory }),

  // Mostrar diálogo para seleccionar archivo (OpenFileDialog)
  selectFile: (options = {}) =>
    api.post('/api/system/select-file', {
      title: options.title || 'Seleccione un archivo',
      filter: options.filter || 'Todos los archivos (*.*)|*.*',
      initialDirectory: options.initialDirectory || '',
      multiSelect: options.multiSelect || false
    }),

  // Mostrar diálogo para guardar archivo (SaveFileDialog)
  saveFileDialog: (options = {}) =>
    api.post('/api/system/save-file-dialog', {
      title: options.title || 'Guardar archivo',
      filter: options.filter || 'Todos los archivos (*.*)|*.*',
      initialDirectory: options.initialDirectory || '',
      defaultFileName: options.defaultFileName || ''
    }),

  // Mostrar MessageBox nativo de Windows
  messageBox: (title, message, type = 'info', buttons = 'ok') =>
    api.post('/api/system/message-box', { title, message, type, buttons }),

  // Mostrar InputBox nativo de Windows
  inputDialog: (title, message = '', defaultValue = '') =>
    api.post('/api/system/input-dialog', { title, message, defaultValue })
}

export default api
