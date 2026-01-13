import { generateWorkflowActions, AI_TEMPLATES } from '../config/aiTemplates'

// Categorías de acciones para el Workflow Studio
const BASE_ACTION_CATEGORIES = [
  {
    id: 'web-browser',
    name: 'Navegador Web',
    icon: 'fa-globe',
    actions: [
      { type: 'open_browser', label: 'Abrir Navegador', icon: 'fa-window-restore' },
      { type: 'navigate', label: 'Navegar a URL', icon: 'fa-link' },
      { type: 'click', label: 'Hacer Clic', icon: 'fa-mouse-pointer' },
      { type: 'type', label: 'Escribir Texto', icon: 'fa-keyboard' },
      { type: 'extract', label: 'Extraer Texto', icon: 'fa-file-export' },
      { type: 'screenshot', label: 'Captura de Pantalla', icon: 'fa-camera' },
      { type: 'scroll', label: 'Scroll', icon: 'fa-arrows-alt-v' },
      { type: 'close_browser', label: 'Cerrar Navegador', icon: 'fa-window-close' }
    ]
  },
  {
    id: 'http-requests',
    name: 'HTTP Requests',
    icon: 'fa-server',
    actions: [
      { type: 'http_get', label: 'GET Request', icon: 'fa-download' },
      { type: 'http_post', label: 'POST Request', icon: 'fa-upload' },
      { type: 'http_put', label: 'PUT Request', icon: 'fa-edit' },
      { type: 'http_delete', label: 'DELETE Request', icon: 'fa-trash' }
    ]
  },
  {
    id: 'excel',
    name: 'Excel',
    icon: 'fa-file-excel',
    actions: [
      { type: 'excel_open', label: 'Abrir Excel', icon: 'fa-file-excel' },
      { type: 'excel_read', label: 'Leer Excel', icon: 'fa-file-excel' },
      { type: 'excel_write', label: 'Escribir Excel', icon: 'fa-file-edit' },
      { type: 'excel_get_cell', label: 'Leer Celda', icon: 'fa-table' },
      { type: 'excel_set_cell', label: 'Escribir Celda', icon: 'fa-edit' },
      { type: 'excel_get_range', label: 'Leer Rango', icon: 'fa-th' },
      { type: 'excel_set_range', label: 'Escribir Rango', icon: 'fa-th-large' },
      { type: 'excel_get_last_row', label: 'Última Fila', icon: 'fa-arrow-down' },
      { type: 'excel_get_last_column', label: 'Última Columna', icon: 'fa-arrow-right' },
      { type: 'excel_insert_row', label: 'Insertar Fila', icon: 'fa-plus' },
      { type: 'excel_delete_row', label: 'Eliminar Fila', icon: 'fa-minus' },
      { type: 'excel_insert_column', label: 'Insertar Columna', icon: 'fa-columns' },
      { type: 'excel_delete_column', label: 'Eliminar Columna', icon: 'fa-columns' },
      { type: 'excel_format_cells', label: 'Formatear Celdas', icon: 'fa-paint-brush' },
      { type: 'excel_add_formula', label: 'Agregar Fórmula', icon: 'fa-calculator' },
      { type: 'excel_create_chart', label: 'Crear Gráfico', icon: 'fa-chart-bar' },
      { type: 'excel_filter_data', label: 'Filtrar Datos', icon: 'fa-filter' },
      { type: 'excel_sort_data', label: 'Ordenar Datos', icon: 'fa-sort-alpha-down' },
      { type: 'excel_find_replace', label: 'Buscar/Reemplazar', icon: 'fa-search' },
      { type: 'excel_add_sheet', label: 'Agregar Hoja', icon: 'fa-plus-square' },
      { type: 'excel_delete_sheet', label: 'Eliminar Hoja', icon: 'fa-minus-square' },
      { type: 'excel_rename_sheet', label: 'Renombrar Hoja', icon: 'fa-i-cursor' },
      { type: 'excel_copy_sheet', label: 'Copiar Hoja', icon: 'fa-copy' },
      { type: 'excel_save', label: 'Guardar Excel', icon: 'fa-save' },
      { type: 'excel_run_macro', label: 'Ejecutar Macro', icon: 'fa-code' },
      { type: 'excel_close', label: 'Cerrar Excel', icon: 'fa-times-circle' }
    ]
  },
  {
    id: 'word',
    name: 'Word',
    icon: 'fa-file-word',
    actions: [
      { type: 'word_open', label: 'Abrir Word', icon: 'fa-file-word' },
      { type: 'word_new', label: 'Nuevo Documento', icon: 'fa-file-word' },
      { type: 'word_read_text', label: 'Leer Texto', icon: 'fa-file-alt' },
      { type: 'word_write_text', label: 'Escribir Texto', icon: 'fa-edit' },
      { type: 'word_find_replace', label: 'Buscar/Reemplazar', icon: 'fa-search' },
      { type: 'word_insert_image', label: 'Insertar Imagen', icon: 'fa-image' },
      { type: 'word_insert_table', label: 'Insertar Tabla', icon: 'fa-table' },
      { type: 'word_format_text', label: 'Formatear Texto', icon: 'fa-paint-brush' },
      { type: 'word_add_header_footer', label: 'Encabezado/Pie', icon: 'fa-heading' },
      { type: 'word_save', label: 'Guardar Word', icon: 'fa-save' },
      { type: 'word_to_pdf', label: 'Convertir a PDF', icon: 'fa-file-pdf' },
      { type: 'word_close', label: 'Cerrar Word', icon: 'fa-times-circle' }
    ]
  },
  {
    id: 'pdf',
    name: 'PDF',
    icon: 'fa-file-pdf',
    actions: [
      { type: 'pdf_read', label: 'Leer PDF', icon: 'fa-file-pdf' },
      { type: 'pdf_create', label: 'Crear PDF', icon: 'fa-file-pdf' }
    ]
  },
  {
    id: 'powershell-cmd',
    name: 'PowerShell/CMD',
    icon: 'fa-terminal',
    actions: [
      { type: 'powershell_run', label: 'Ejecutar PowerShell', icon: 'fa-terminal' },
      { type: 'powershell_script_file', label: 'Ejecutar Script PS1', icon: 'fa-file-code' },
      { type: 'cmd_run', label: 'Ejecutar CMD', icon: 'fa-terminal' },
      { type: 'cmd_batch_file', label: 'Ejecutar Batch', icon: 'fa-file-code' },
      { type: 'run_application', label: 'Ejecutar Aplicación', icon: 'fa-play' },
      { type: 'kill_process', label: 'Terminar Proceso', icon: 'fa-times' },
      { type: 'get_environment_variable', label: 'Obtener Var Entorno', icon: 'fa-cog' },
      { type: 'set_environment_variable', label: 'Establecer Var Entorno', icon: 'fa-cog' }
    ]
  },
  {
    id: 'ocr-image',
    name: 'OCR/Imágenes',
    icon: 'fa-eye',
    actions: [
      { type: 'ocr_screen', label: 'OCR de Pantalla', icon: 'fa-eye' },
      { type: 'ocr_image', label: 'OCR de Imagen', icon: 'fa-file-image' },
      { type: 'find_image_on_screen', label: 'Buscar Imagen', icon: 'fa-search' },
      { type: 'wait_for_image', label: 'Esperar Imagen', icon: 'fa-hourglass-half' },
      { type: 'image_compare', label: 'Comparar Imágenes', icon: 'fa-images' },
      { type: 'ai_ocr', label: 'OCR con IA', icon: 'fa-robot' }
    ]
  },
  {
    id: 'windows',
    name: 'Gestión Ventanas',
    icon: 'fa-window-maximize',
    actions: [
      { type: 'window_get_active', label: 'Ventana Activa', icon: 'fa-window-maximize' },
      { type: 'window_find', label: 'Buscar Ventana', icon: 'fa-search' },
      { type: 'window_focus', label: 'Enfocar Ventana', icon: 'fa-window-restore' },
      { type: 'window_minimize', label: 'Minimizar', icon: 'fa-window-minimize' },
      { type: 'window_maximize', label: 'Maximizar', icon: 'fa-window-maximize' },
      { type: 'window_restore', label: 'Restaurar', icon: 'fa-window-restore' },
      { type: 'window_close', label: 'Cerrar Ventana', icon: 'fa-times' },
      { type: 'window_resize', label: 'Redimensionar', icon: 'fa-expand-arrows-alt' },
      { type: 'window_move', label: 'Mover Ventana', icon: 'fa-arrows-alt' },
      { type: 'window_get_list', label: 'Listar Ventanas', icon: 'fa-list' },
      { type: 'window_get_bounds', label: 'Obtener Dimensiones', icon: 'fa-ruler-combined' },
      { type: 'window_screenshot', label: 'Capturar Ventana', icon: 'fa-camera' }
    ]
  },
  {
    id: 'browser-windows',
    name: 'Ventanas Navegador',
    icon: 'fa-globe',
    actions: [
      { type: 'browser_get_windows', label: 'Obtener Ventanas', icon: 'fa-globe' },
      { type: 'browser_get_tabs', label: 'Obtener Pestañas', icon: 'fa-folder-open' },
      { type: 'browser_activate_tab', label: 'Activar Pestaña', icon: 'fa-mouse-pointer' },
      { type: 'browser_close_tab', label: 'Cerrar Pestaña', icon: 'fa-times' }
    ]
  },
  {
    id: 'sap',
    name: 'SAP',
    icon: 'fa-cubes',
    actions: [
      { type: 'sap_connect', label: 'Conectar SAP', icon: 'fa-plug' },
      { type: 'sap_transaction', label: 'Ejecutar Transacción', icon: 'fa-exchange-alt' },
      { type: 'sap_get_data', label: 'Obtener Datos', icon: 'fa-database' },
      { type: 'sap_create_order', label: 'Crear Orden', icon: 'fa-shopping-cart' },
      { type: 'sap_disconnect', label: 'Desconectar SAP', icon: 'fa-unlink' }
    ]
  },
  {
    id: 'microsoft365',
    name: 'Microsoft 365',
    icon: 'fa-microsoft',
    isBrand: true,
    actions: [
      { type: 'm365_calendar', label: 'Calendario', icon: 'fa-calendar' },
      { type: 'm365_excel', label: 'Excel Online', icon: 'fa-file-excel' },
      { type: 'm365_onedrive', label: 'OneDrive', icon: 'fa-cloud' },
      { type: 'm365_outlook', label: 'Outlook', icon: 'fa-envelope' }
    ]
  },
  {
    id: 'active-directory',
    name: 'Active Directory',
    icon: 'fa-users-cog',
    actions: [
      { type: 'ad_connect', label: 'Conectar AD', icon: 'fa-server' },
      { type: 'ad_get_user', label: 'Obtener Usuario', icon: 'fa-user' },
      { type: 'ad_create_user', label: 'Crear Usuario', icon: 'fa-user-plus' },
      { type: 'ad_disable_user', label: 'Deshabilitar Usuario', icon: 'fa-user-lock' },
      { type: 'ad_add_to_group', label: 'Agregar a Grupo', icon: 'fa-users' }
    ]
  },
  {
    id: 'mouse-keyboard',
    name: 'Mouse y Teclado',
    icon: 'fa-keyboard',
    actions: [
      { type: 'mouse_click', label: 'Clic de Mouse', icon: 'fa-mouse-pointer' },
      { type: 'mouse_move', label: 'Mover Mouse', icon: 'fa-arrows-alt' },
      { type: 'keyboard_type', label: 'Teclear', icon: 'fa-keyboard' },
      { type: 'keyboard_hotkey', label: 'Tecla Rápida', icon: 'fa-keyboard' }
    ]
  },
  {
    id: 'clipboard',
    name: 'Portapapeles',
    icon: 'fa-clipboard',
    actions: [
      { type: 'clipboard_copy', label: 'Copiar', icon: 'fa-copy' },
      { type: 'clipboard_paste', label: 'Pegar', icon: 'fa-paste' },
      { type: 'clipboard_get', label: 'Obtener Contenido', icon: 'fa-clipboard-list' }
    ]
  },
  {
    id: 'variables',
    name: 'Variables',
    icon: 'fa-code',
    actions: [
      { type: 'set_variable', label: 'Establecer Variable', icon: 'fa-code' },
      { type: 'get_variable', label: 'Obtener Variable', icon: 'fa-code' },
      { type: 'increment_variable', label: 'Incrementar', icon: 'fa-plus' },
      { type: 'decrement_variable', label: 'Decrementar', icon: 'fa-minus' }
    ]
  },
  {
    id: 'strings',
    name: 'Texto/Strings',
    icon: 'fa-font',
    actions: [
      { type: 'string_concat', label: 'Concatenar', icon: 'fa-link' },
      { type: 'string_split', label: 'Dividir', icon: 'fa-cut' },
      { type: 'string_replace', label: 'Reemplazar', icon: 'fa-exchange-alt' },
      { type: 'string_trim', label: 'Recortar Espacios', icon: 'fa-text-width' },
      { type: 'string_substring', label: 'Extraer Subcadena', icon: 'fa-text-width' },
      { type: 'string_to_upper', label: 'A Mayúsculas', icon: 'fa-font' },
      { type: 'string_to_lower', label: 'A Minúsculas', icon: 'fa-font' },
      { type: 'regex_match', label: 'Extraer con Regex', icon: 'fa-asterisk' }
    ]
  },
  {
    id: 'datetime',
    name: 'Fecha y Hora',
    icon: 'fa-calendar-alt',
    actions: [
      { type: 'datetime_now', label: 'Fecha/Hora Actual', icon: 'fa-clock' },
      { type: 'datetime_format', label: 'Formatear Fecha', icon: 'fa-calendar-alt' },
      { type: 'datetime_add', label: 'Sumar a Fecha', icon: 'fa-calendar-plus' },
      { type: 'datetime_diff', label: 'Diferencia Fechas', icon: 'fa-calendar-minus' }
    ]
  },
  {
    id: 'json',
    name: 'JSON',
    icon: 'fa-code',
    actions: [
      { type: 'json_parse', label: 'Parsear JSON', icon: 'fa-code' },
      { type: 'json_stringify', label: 'Convertir a JSON', icon: 'fa-code' },
      { type: 'json_get_value', label: 'Obtener Valor', icon: 'fa-search' },
      { type: 'json_set_value', label: 'Establecer Valor', icon: 'fa-edit' }
    ]
  },
  {
    id: 'data-table',
    name: 'Tabla de Datos',
    icon: 'fa-table',
    actions: [
      { type: 'datatable_create', label: 'Crear DataTable', icon: 'fa-plus-square' },
      { type: 'datatable_add_row', label: 'Añadir Fila', icon: 'fa-plus' },
      { type: 'datatable_filter', label: 'Filtrar', icon: 'fa-filter' },
      { type: 'datatable_sort', label: 'Ordenar', icon: 'fa-sort' },
      { type: 'datatable_export', label: 'Exportar', icon: 'fa-file-export' }
    ]
  },
  {
    id: 'loop',
    name: 'Bucles',
    icon: 'fa-sync',
    actions: [
      { type: 'for_loop', label: 'Bucle For', icon: 'fa-redo' },
      { type: 'for_each', label: 'Para Cada', icon: 'fa-redo' },
      { type: 'while_loop', label: 'Mientras (While)', icon: 'fa-spinner' },
      { type: 'break', label: 'Romper Bucle', icon: 'fa-stop' }
    ]
  },
  {
    id: 'condition',
    name: 'Condiciones',
    icon: 'fa-code-branch',
    actions: [
      { type: 'if_condition', label: 'Si (If)', icon: 'fa-question' },
      { type: 'else', label: 'Sino (Else)', icon: 'fa-code-branch' },
      { type: 'switch', label: 'Switch', icon: 'fa-random' },
      { type: 'try_catch', label: 'Try/Catch', icon: 'fa-shield-alt' }
    ]
  },
  {
    id: 'wait',
    name: 'Esperas/Pausas',
    icon: 'fa-clock',
    actions: [
      { type: 'wait', label: 'Esperar', icon: 'fa-clock' },
      { type: 'delay', label: 'Delay', icon: 'fa-clock' },
      { type: 'pause', label: 'Pausa (MessageBox)', icon: 'fa-pause-circle' },
      { type: 'wait_seconds', label: 'Esperar Segundos', icon: 'fa-hourglass-half' },
      { type: 'wait_element', label: 'Esperar Elemento', icon: 'fa-eye' },
      { type: 'wait_page_load', label: 'Esperar Carga', icon: 'fa-spinner' }
    ]
  },
  {
    id: 'message-box',
    name: 'Mensajes',
    icon: 'fa-comment',
    actions: [
      { type: 'message_box', label: 'Mostrar Mensaje', icon: 'fa-info-circle' },
      { type: 'input_dialog', label: 'Cuadro de Entrada', icon: 'fa-edit' }
    ]
  },
  {
    id: 'logging',
    name: 'Logging',
    icon: 'fa-file-alt',
    actions: [
      { type: 'log_info', label: 'Log Info', icon: 'fa-info' },
      { type: 'log_warning', label: 'Log Warning', icon: 'fa-exclamation-triangle' },
      { type: 'log_error', label: 'Log Error', icon: 'fa-times-circle' }
    ]
  },
  {
    id: 'files',
    name: 'Archivos',
    icon: 'fa-folder',
    actions: [
      { type: 'file_read', label: 'Leer Archivo', icon: 'fa-file-alt' },
      { type: 'file_write', label: 'Escribir Archivo', icon: 'fa-file-signature' },
      { type: 'file_copy', label: 'Copiar Archivo', icon: 'fa-copy' },
      { type: 'file_move', label: 'Mover Archivo', icon: 'fa-file-export' },
      { type: 'file_delete', label: 'Eliminar Archivo', icon: 'fa-trash-alt' },
      { type: 'file_exists', label: 'Archivo Existe', icon: 'fa-question-circle' }
    ]
  },
  {
    id: 'email',
    name: 'Correo Electrónico',
    icon: 'fa-envelope',
    actions: [
      { type: 'email_send', label: 'Enviar Email', icon: 'fa-paper-plane' },
      { type: 'email_read', label: 'Leer Email', icon: 'fa-envelope-open' },
      { type: 'email_download_attachment', label: 'Descargar Adjunto', icon: 'fa-paperclip' }
    ]
  },
  {
    id: 'database',
    name: 'Base de Datos',
    icon: 'fa-database',
    actions: [
      { type: 'db_connect', label: 'Conectar BD', icon: 'fa-plug' },
      { type: 'db_query', label: 'Ejecutar Query', icon: 'fa-search' },
      { type: 'db_insert', label: 'Insertar', icon: 'fa-plus' },
      { type: 'db_update', label: 'Actualizar', icon: 'fa-edit' },
      { type: 'db_disconnect', label: 'Desconectar BD', icon: 'fa-unlink' }
    ]
  },
  {
    id: 'ai',
    name: 'Inteligencia Artificial',
    icon: 'fa-brain',
    actions: [
      { type: 'ai_text_generation', label: 'Generar Texto', icon: 'fa-robot' },
      { type: 'ai_sentiment', label: 'Análisis Sentimiento', icon: 'fa-smile' },
      { type: 'ai_classification', label: 'Clasificación', icon: 'fa-tags' },
      { type: 'ai_translation', label: 'Traducción', icon: 'fa-language' },
      { type: 'ai_chat', label: 'Chat IA', icon: 'fa-robot' },
      { type: 'ai_analyze', label: 'Analizar Documento', icon: 'fa-search-plus' }
    ]
  }
]

// Genera la categoría de plantillas AI dinámicamente
const aiTemplatesCategory = {
  id: 'ai-templates',
  name: 'Plantillas de IA',
  icon: 'fa-brain',
  actions: generateWorkflowActions()
}

// Combina las categorías base con las plantillas AI
export const ACTION_CATEGORIES = [...BASE_ACTION_CATEGORIES, aiTemplatesCategory]

// Estados de ejecución
export const EXECUTION_STATUS = {
  IDLE: 'idle',
  RUNNING: 'running',
  PAUSED: 'paused',
  COMPLETED: 'completed',
  ERROR: 'error',
  STOPPED: 'stopped'
}

// Tipos de log
export const LOG_TYPES = {
  INFO: 'info',
  SUCCESS: 'success',
  WARNING: 'warning',
  ERROR: 'error'
}

// Colores de los iconos por tipo de log
export const LOG_ICONS = {
  info: 'fa-info-circle',
  success: 'fa-check-circle',
  warning: 'fa-exclamation-triangle',
  error: 'fa-times-circle'
}

// API endpoints
export const API_ENDPOINTS = {
  WORKFLOWS: '/api/workflows',
  SETTINGS: '/api/settings',
  DATABASE: '/api/database',
  OMNICHANNEL: '/api/omnichannel',
  VIDEO_CONFERENCE: '/api/video-conference',
  AI_CONFIG: '/api/ai-config',
  HEALTH: '/api/health'
}
