import { useState, useCallback, useEffect, useRef } from 'react'
import ActionPropertyEditor from '../components/workflow/ActionPropertyEditor'
import VariablesPanel from '../components/workflow/VariablesPanel'
import { useLanguage } from '../context/LanguageContext'
import { useSocket } from '../context/SocketContext'
import { resolveVariables } from '../components/workflow/VariableInput'
import { systemService } from '../services/api'
import { importers, exporters } from '../utils/workflowMigration'
import { getActionProperties } from '../utils/actionProperties'

// Categorías expandidas con más acciones
const WORKFLOW_CATEGORIES = [
  {
    id: 'control-flow',
    name: 'Control de Flujo',
    icon: 'fa-code-branch',
    actions: [
      { action: 'step_group', icon: 'fa-layer-group', label: 'Step (Grupo)', isContainer: true },
      { action: 'if_condition', icon: 'fa-question', label: 'Si / Condición', isContainer: true },
      { action: 'else_condition', icon: 'fa-random', label: 'Sino (Else)', isContainer: true },
      { action: 'switch_case', icon: 'fa-sitemap', label: 'Switch / Case', isContainer: true },
      { action: 'for_loop', icon: 'fa-redo', label: 'Bucle For', isContainer: true },
      { action: 'for_each', icon: 'fa-list', label: 'Para Cada (ForEach)', isContainer: true },
      { action: 'while_loop', icon: 'fa-sync', label: 'Bucle While', isContainer: true },
      { action: 'do_while', icon: 'fa-sync-alt', label: 'Hacer Mientras', isContainer: true },
      { action: 'break', icon: 'fa-stop', label: 'Break (Salir)' },
      { action: 'continue', icon: 'fa-step-forward', label: 'Continue (Continuar)' },
      { action: 'delay', icon: 'fa-clock', label: 'Esperar/Delay' },
      { action: 'wait_condition', icon: 'fa-hourglass-half', label: 'Esperar Condición' },
      { action: 'wait_screen_change', icon: 'fa-desktop', label: 'Esperar Cambio Pantalla' },
      { action: 'wait_window', icon: 'fa-window-restore', label: 'Esperar Ventana' },
      { action: 'pause', icon: 'fa-pause-circle', label: 'Pausa (MessageBox)' },
      { action: 'try_catch', icon: 'fa-shield-alt', label: 'Try/Catch', isContainer: true },
      { action: 'throw', icon: 'fa-exclamation-triangle', label: 'Lanzar Excepción' },
      { action: 'return', icon: 'fa-sign-out-alt', label: 'Retornar Valor' },
      { action: 'comment', icon: 'fa-comment', label: 'Comentario' }
    ]
  },
  {
    id: 'dialogs',
    name: 'Diálogos y Mensajes',
    icon: 'fa-comment-dots',
    actions: [
      { action: 'message_box', icon: 'fa-window-restore', label: 'Message Box' },
      { action: 'input_dialog', icon: 'fa-keyboard', label: 'Input Dialog' },
      { action: 'confirm_dialog', icon: 'fa-question-circle', label: 'Confirm Dialog' },
      { action: 'select_file', icon: 'fa-folder-open', label: 'Seleccionar Archivo' },
      { action: 'select_folder', icon: 'fa-folder', label: 'Seleccionar Carpeta' },
      { action: 'notification', icon: 'fa-bell', label: 'Notificación' },
      { action: 'log_message', icon: 'fa-terminal', label: 'Log Message' }
    ]
  },
  {
    id: 'variables',
    name: 'Variables y Datos',
    icon: 'fa-cube',
    actions: [
      { action: 'assign', icon: 'fa-equals', label: 'Asignar Variable' },
      { action: 'set_variable', icon: 'fa-pen', label: 'Establecer Valor' },
      { action: 'get_variable', icon: 'fa-eye', label: 'Obtener Valor' },
      { action: 'increment', icon: 'fa-plus', label: 'Incrementar' },
      { action: 'decrement', icon: 'fa-minus', label: 'Decrementar' },
      { action: 'convert_type', icon: 'fa-exchange-alt', label: 'Convertir Tipo' },
      { action: 'parse_json', icon: 'fa-code', label: 'Parsear JSON' },
      { action: 'stringify_json', icon: 'fa-file-code', label: 'JSON a String' },
      { action: 'get_date', icon: 'fa-calendar', label: 'Obtener Fecha' },
      { action: 'format_date', icon: 'fa-calendar-check', label: 'Formatear Fecha' },
      { action: 'date_diff', icon: 'fa-calendar-minus', label: 'Diferencia de Fechas' }
    ]
  },
  {
    id: 'text',
    name: 'Texto y Strings',
    icon: 'fa-font',
    actions: [
      { action: 'concat_string', icon: 'fa-link', label: 'Concatenar Texto' },
      { action: 'split_string', icon: 'fa-cut', label: 'Dividir Texto' },
      { action: 'replace_text', icon: 'fa-exchange-alt', label: 'Reemplazar Texto' },
      { action: 'substring', icon: 'fa-text-width', label: 'Subcadena' },
      { action: 'trim', icon: 'fa-eraser', label: 'Trim (Quitar espacios)' },
      { action: 'to_upper', icon: 'fa-arrow-up', label: 'Mayúsculas' },
      { action: 'to_lower', icon: 'fa-arrow-down', label: 'Minúsculas' },
      { action: 'regex_match', icon: 'fa-asterisk', label: 'Expresión Regular' },
      { action: 'text_length', icon: 'fa-ruler', label: 'Longitud de Texto' },
      { action: 'contains', icon: 'fa-search', label: 'Contiene Texto' }
    ]
  },
  {
    id: 'collections',
    name: 'Colecciones',
    icon: 'fa-list-ul',
    actions: [
      { action: 'create_list', icon: 'fa-plus-square', label: 'Crear Lista' },
      { action: 'add_to_list', icon: 'fa-plus', label: 'Agregar a Lista' },
      { action: 'remove_from_list', icon: 'fa-minus', label: 'Remover de Lista' },
      { action: 'get_item', icon: 'fa-hand-pointer', label: 'Obtener Item' },
      { action: 'list_count', icon: 'fa-calculator', label: 'Contar Items' },
      { action: 'sort_list', icon: 'fa-sort', label: 'Ordenar Lista' },
      { action: 'filter_list', icon: 'fa-filter', label: 'Filtrar Lista' },
      { action: 'create_dictionary', icon: 'fa-book', label: 'Crear Diccionario' },
      { action: 'get_keys', icon: 'fa-key', label: 'Obtener Claves' },
      { action: 'get_values', icon: 'fa-list', label: 'Obtener Valores' }
    ]
  },
  {
    id: 'web-browser',
    name: 'Navegador Web',
    icon: 'fa-globe',
    actions: [
      { action: 'browser_open', icon: 'fa-window-maximize', label: 'Abrir Navegador' },
      { action: 'navigate', icon: 'fa-compass', label: 'Navegar a URL' },
      { action: 'browser_back', icon: 'fa-arrow-left', label: 'Retroceder' },
      { action: 'browser_forward', icon: 'fa-arrow-right', label: 'Avanzar' },
      { action: 'browser_refresh', icon: 'fa-sync', label: 'Actualizar Página' },
      { action: 'click', icon: 'fa-mouse-pointer', label: 'Hacer Clic' },
      { action: 'double_click', icon: 'fa-mouse', label: 'Doble Clic' },
      { action: 'right_click', icon: 'fa-hand-pointer', label: 'Clic Derecho' },
      { action: 'type', icon: 'fa-keyboard', label: 'Escribir Texto' },
      { action: 'clear_field', icon: 'fa-eraser', label: 'Limpiar Campo' },
      { action: 'select_option', icon: 'fa-caret-down', label: 'Seleccionar Opción' },
      { action: 'check_checkbox', icon: 'fa-check-square', label: 'Marcar Checkbox' },
      { action: 'get_attribute', icon: 'fa-info-circle', label: 'Obtener Atributo' },
      { action: 'get_text', icon: 'fa-font', label: 'Obtener Texto' },
      { action: 'extract_text', icon: 'fa-file-alt', label: 'Extraer Texto' },
      { action: 'extract_table', icon: 'fa-table', label: 'Extraer Tabla' },
      { action: 'screenshot', icon: 'fa-camera', label: 'Captura de Pantalla' },
      { action: 'screenshot_element', icon: 'fa-crop', label: 'Captura de Elemento' },
      { action: 'scroll', icon: 'fa-arrows-alt-v', label: 'Hacer Scroll' },
      { action: 'scroll_to_element', icon: 'fa-crosshairs', label: 'Scroll a Elemento' },
      { action: 'wait_element', icon: 'fa-hourglass-half', label: 'Esperar Elemento' },
      { action: 'element_exists', icon: 'fa-question', label: 'Elemento Existe' },
      { action: 'switch_tab', icon: 'fa-exchange-alt', label: 'Cambiar Pestaña' },
      { action: 'new_tab', icon: 'fa-plus', label: 'Nueva Pestaña' },
      { action: 'close_tab', icon: 'fa-times', label: 'Cerrar Pestaña' },
      { action: 'switch_frame', icon: 'fa-window-restore', label: 'Cambiar Frame' },
      { action: 'execute_js', icon: 'fa-code', label: 'Ejecutar JavaScript' },
      { action: 'browser_close', icon: 'fa-times-circle', label: 'Cerrar Navegador' }
    ]
  },
  {
    id: 'active-directory',
    name: 'Active Directory',
    icon: 'fa-users-cog',
    actions: [
      { action: 'ad_connect', icon: 'fa-server', label: 'Conectar AD' },
      { action: 'ad_get_user', icon: 'fa-user', label: 'Obtener Usuario' },
      { action: 'ad_search_users', icon: 'fa-search', label: 'Buscar Usuarios' },
      { action: 'ad_create_user', icon: 'fa-user-plus', label: 'Crear Usuario' },
      { action: 'ad_update_user', icon: 'fa-user-edit', label: 'Actualizar Usuario' },
      { action: 'ad_disable_user', icon: 'fa-user-lock', label: 'Deshabilitar Usuario' },
      { action: 'ad_enable_user', icon: 'fa-user-check', label: 'Habilitar Usuario' },
      { action: 'ad_reset_password', icon: 'fa-key', label: 'Resetear Contraseña' },
      { action: 'ad_get_groups', icon: 'fa-users', label: 'Obtener Grupos' },
      { action: 'ad_add_to_group', icon: 'fa-user-friends', label: 'Agregar a Grupo' },
      { action: 'ad_remove_from_group', icon: 'fa-user-minus', label: 'Remover de Grupo' },
      { action: 'ad_disconnect', icon: 'fa-unlink', label: 'Desconectar AD' }
    ]
  },
  {
    id: 'ai',
    name: 'Inteligencia Artificial',
    icon: 'fa-brain',
    actions: [
      { action: 'ai_text_generation', icon: 'fa-robot', label: 'Generar Texto' },
      { action: 'ai_chat', icon: 'fa-comments', label: 'Chat con IA' },
      { action: 'ai_sentiment', icon: 'fa-smile', label: 'Análisis de Sentimiento' },
      { action: 'ai_classification', icon: 'fa-tags', label: 'Clasificación' },
      { action: 'ai_summarize', icon: 'fa-compress-alt', label: 'Resumir Texto' },
      { action: 'ai_translation', icon: 'fa-language', label: 'Traducción' },
      { action: 'ai_extract_entities', icon: 'fa-highlight', label: 'Extraer Entidades' },
      { action: 'ai_image_analysis', icon: 'fa-image', label: 'Análisis de Imagen' },
      { action: 'ai_ocr', icon: 'fa-file-image', label: 'OCR con IA' },
      { action: 'ai_document_understanding', icon: 'fa-file-invoice', label: 'Document Understanding' }
    ]
  },
  {
    id: 'database',
    name: 'Base de Datos',
    icon: 'fa-database',
    actions: [
      { action: 'db_connect', icon: 'fa-plug', label: 'Conectar Base de Datos' },
      { action: 'db_query', icon: 'fa-search', label: 'Ejecutar Consulta' },
      { action: 'db_execute', icon: 'fa-play', label: 'Ejecutar Comando' },
      { action: 'db_insert', icon: 'fa-plus-circle', label: 'Insertar Datos' },
      { action: 'db_update', icon: 'fa-edit', label: 'Actualizar Datos' },
      { action: 'db_delete', icon: 'fa-trash', label: 'Eliminar Datos' },
      { action: 'db_stored_procedure', icon: 'fa-cogs', label: 'Stored Procedure' },
      { action: 'db_transaction_start', icon: 'fa-lock', label: 'Iniciar Transacción' },
      { action: 'db_transaction_commit', icon: 'fa-check', label: 'Commit' },
      { action: 'db_transaction_rollback', icon: 'fa-undo', label: 'Rollback' },
      { action: 'db_disconnect', icon: 'fa-unlink', label: 'Desconectar' }
    ]
  },
  {
    id: 'files',
    name: 'Archivos y Carpetas',
    icon: 'fa-folder',
    actions: [
      { action: 'file_read', icon: 'fa-file-alt', label: 'Leer Archivo' },
      { action: 'file_read_lines', icon: 'fa-stream', label: 'Leer Líneas' },
      { action: 'file_write', icon: 'fa-file-edit', label: 'Escribir Archivo' },
      { action: 'file_append', icon: 'fa-file-medical', label: 'Agregar a Archivo' },
      { action: 'file_copy', icon: 'fa-copy', label: 'Copiar Archivo' },
      { action: 'file_move', icon: 'fa-file-export', label: 'Mover Archivo' },
      { action: 'file_rename', icon: 'fa-i-cursor', label: 'Renombrar Archivo' },
      { action: 'file_delete', icon: 'fa-trash', label: 'Eliminar Archivo' },
      { action: 'file_exists', icon: 'fa-question-circle', label: 'Archivo Existe' },
      { action: 'file_info', icon: 'fa-info-circle', label: 'Info de Archivo' },
      { action: 'folder_create', icon: 'fa-folder-plus', label: 'Crear Carpeta' },
      { action: 'folder_delete', icon: 'fa-folder-minus', label: 'Eliminar Carpeta' },
      { action: 'folder_list', icon: 'fa-list', label: 'Listar Archivos' },
      { action: 'folder_exists', icon: 'fa-folder-open', label: 'Carpeta Existe' },
      { action: 'zip_compress', icon: 'fa-file-archive', label: 'Comprimir ZIP' },
      { action: 'zip_extract', icon: 'fa-file-archive', label: 'Extraer ZIP' }
    ]
  },
  {
    id: 'email',
    name: 'Correo Electrónico',
    icon: 'fa-envelope',
    actions: [
      { action: 'email_connect_smtp', icon: 'fa-server', label: 'Conectar SMTP' },
      { action: 'email_connect_imap', icon: 'fa-inbox', label: 'Conectar IMAP' },
      { action: 'email_send', icon: 'fa-paper-plane', label: 'Enviar Email' },
      { action: 'email_send_template', icon: 'fa-file-alt', label: 'Enviar con Plantilla' },
      { action: 'email_read', icon: 'fa-envelope-open', label: 'Leer Emails' },
      { action: 'email_get_unread', icon: 'fa-envelope', label: 'Obtener No Leídos' },
      { action: 'email_search', icon: 'fa-search', label: 'Buscar Emails' },
      { action: 'email_download_attachment', icon: 'fa-paperclip', label: 'Descargar Adjunto' },
      { action: 'email_mark_read', icon: 'fa-check', label: 'Marcar como Leído' },
      { action: 'email_move', icon: 'fa-folder', label: 'Mover Email' },
      { action: 'email_delete', icon: 'fa-trash', label: 'Eliminar Email' },
      { action: 'email_disconnect', icon: 'fa-unlink', label: 'Desconectar' }
    ]
  },
  {
    id: 'excel-advanced',
    name: 'Excel Avanzado',
    icon: 'fa-file-excel',
    description: 'Requiere abrir Excel (COM/OLE)',
    actions: [
      { action: 'excel_open', icon: 'fa-file-excel', label: 'Abrir Excel' },
      { action: 'excel_create_workbook', icon: 'fa-file-medical', label: 'Crear Libro' },
      { action: 'excel_access_protected_sheet', icon: 'fa-lock-open', label: 'Acceder Hoja Protegida' },
      { action: 'excel_append_workbook', icon: 'fa-file-import', label: 'Anexar Libro' },
      { action: 'excel_append_sheet', icon: 'fa-layer-group', label: 'Anexar Hoja' },
      { action: 'excel_get_cell', icon: 'fa-th-large', label: 'Leer Celda' },
      { action: 'excel_get_single_cell', icon: 'fa-bullseye', label: 'Obtener una Sola Celda' },
      { action: 'excel_get_multiple_cells', icon: 'fa-th', label: 'Obtener Varias Celdas' },
      { action: 'excel_get_range', icon: 'fa-table', label: 'Leer Rango' },
      { action: 'excel_set_cell', icon: 'fa-pen', label: 'Escribir Celda' },
      { action: 'excel_set_range', icon: 'fa-edit', label: 'Escribir Rango' },
      { action: 'excel_set_cell_formula', icon: 'fa-function', label: 'Establecer Fórmula' },
      { action: 'excel_get_cell_color', icon: 'fa-palette', label: 'Obtener Color de Celda' },
      { action: 'excel_get_cell_address', icon: 'fa-map-marker-alt', label: 'Obtener Dirección Celda' },
      { action: 'excel_get_row_count', icon: 'fa-list-ol', label: 'Obtener Número de Filas' },
      { action: 'excel_get_row_number', icon: 'fa-sort-numeric-up', label: 'Obtener Número de Fila' },
      { action: 'excel_get_last_row', icon: 'fa-arrow-down', label: 'Última Fila con Datos' },
      { action: 'excel_get_last_column', icon: 'fa-arrow-right', label: 'Última Columna con Datos' },
      { action: 'excel_get_column_name', icon: 'fa-columns', label: 'Obtener Nombre Columna' },
      { action: 'excel_find', icon: 'fa-search', label: 'Buscar' },
      { action: 'excel_find_next_empty_cell', icon: 'fa-search-plus', label: 'Buscar Celda Vacía' },
      { action: 'excel_insert_row', icon: 'fa-plus-circle', label: 'Insertar Fila' },
      { action: 'excel_delete_row', icon: 'fa-minus-circle', label: 'Eliminar Fila' },
      { action: 'excel_insert_column', icon: 'fa-columns', label: 'Insertar Columna' },
      { action: 'excel_delete_column', icon: 'fa-minus-square', label: 'Eliminar Columna' },
      { action: 'excel_delete_cells', icon: 'fa-eraser', label: 'Eliminar Celdas' },
      { action: 'excel_delete_table_column', icon: 'fa-minus-square', label: 'Eliminar Col. de Tabla' },
      { action: 'excel_select_cells', icon: 'fa-mouse-pointer', label: 'Seleccionar Celdas' },
      { action: 'excel_filter', icon: 'fa-filter', label: 'Filtro' },
      { action: 'excel_sort', icon: 'fa-sort-amount-down', label: 'Ordenar' },
      { action: 'excel_format_cells', icon: 'fa-paint-brush', label: 'Formatear Celdas' },
      { action: 'excel_create_sheet', icon: 'fa-plus-square', label: 'Crear Hoja' },
      { action: 'excel_delete_sheet', icon: 'fa-trash-alt', label: 'Eliminar Hoja' },
      { action: 'excel_switch_sheet', icon: 'fa-exchange-alt', label: 'Cambiar a Hoja' },
      { action: 'excel_get_sheet_name', icon: 'fa-file-signature', label: 'Obtener Nombre Hoja' },
      { action: 'excel_get_sheet_names', icon: 'fa-list', label: 'Obtener Nombres Hojas' },
      { action: 'excel_show_sheet', icon: 'fa-eye', label: 'Mostrar Hoja' },
      { action: 'excel_show_all_sheets', icon: 'fa-eye', label: 'Mostrar Todas las Hojas' },
      { action: 'excel_show_hide_rows_columns', icon: 'fa-eye-slash', label: 'Mostrar/Ocultar Filas/Col' },
      { action: 'excel_convert_to_table', icon: 'fa-table', label: 'Convertir a Tabla' },
      { action: 'excel_get_table_range', icon: 'fa-border-all', label: 'Obtener Rango de Tabla' },
      { action: 'excel_get_sensitivity_label', icon: 'fa-tag', label: 'Obtener Etiqueta Sens.' },
      { action: 'excel_set_sensitivity_label', icon: 'fa-shield-alt', label: 'Establecer Etiqueta Sens.' },
      { action: 'excel_write_from_datatable', icon: 'fa-file-import', label: 'Escribir desde DataTable' },
      { action: 'excel_toggle_auto_refresh', icon: 'fa-sync-alt', label: 'Activar/Desact. Actualiz.' },
      { action: 'excel_get_workbook_links', icon: 'fa-link', label: 'Obtener Vínculos Libro' },
      { action: 'excel_change_workbook_links', icon: 'fa-link', label: 'Cambiar Vínculos Libro' },
      { action: 'excel_break_workbook_links', icon: 'fa-unlink', label: 'Romper Vínculos Libro' },
      { action: 'excel_unprotect_workbook', icon: 'fa-unlock', label: 'Desproteger Libro' },
      { action: 'excel_run_macro', icon: 'fa-code', label: 'Ejecutar Macro' },
      { action: 'excel_save', icon: 'fa-save', label: 'Guardar' },
      { action: 'excel_save_as', icon: 'fa-save', label: 'Guardar Como' },
      { action: 'excel_to_pdf', icon: 'fa-file-pdf', label: 'Convertir a PDF' },
      { action: 'excel_close', icon: 'fa-times-circle', label: 'Cerrar Excel' }
    ]
  },
  {
    id: 'excel-background',
    name: 'Excel Segundo Plano',
    icon: 'fa-file-excel',
    description: 'Sin abrir Excel (openpyxl/xlrd)',
    actions: [
      { action: 'excel_bg_open', icon: 'fa-file-excel', label: 'Abrir Archivo Excel' },
      { action: 'excel_bg_create', icon: 'fa-file-medical', label: 'Crear Archivo Excel' },
      { action: 'excel_bg_read_cell', icon: 'fa-th-large', label: 'Leer Celda' },
      { action: 'excel_bg_read_range', icon: 'fa-table', label: 'Leer Rango' },
      { action: 'excel_bg_read_all', icon: 'fa-file-alt', label: 'Leer Hoja Completa' },
      { action: 'excel_bg_write_cell', icon: 'fa-pen', label: 'Escribir Celda' },
      { action: 'excel_bg_write_range', icon: 'fa-edit', label: 'Escribir Rango' },
      { action: 'excel_bg_write_row', icon: 'fa-grip-lines', label: 'Escribir Fila' },
      { action: 'excel_bg_write_column', icon: 'fa-grip-lines-vertical', label: 'Escribir Columna' },
      { action: 'excel_bg_append_row', icon: 'fa-plus', label: 'Agregar Fila al Final' },
      { action: 'excel_bg_insert_row', icon: 'fa-plus-circle', label: 'Insertar Fila' },
      { action: 'excel_bg_delete_row', icon: 'fa-minus-circle', label: 'Eliminar Fila' },
      { action: 'excel_bg_insert_column', icon: 'fa-columns', label: 'Insertar Columna' },
      { action: 'excel_bg_delete_column', icon: 'fa-minus-square', label: 'Eliminar Columna' },
      { action: 'excel_bg_get_row_count', icon: 'fa-list-ol', label: 'Contar Filas' },
      { action: 'excel_bg_get_column_count', icon: 'fa-list', label: 'Contar Columnas' },
      { action: 'excel_bg_get_last_row', icon: 'fa-arrow-down', label: 'Última Fila con Datos' },
      { action: 'excel_bg_get_last_column', icon: 'fa-arrow-right', label: 'Última Columna con Datos' },
      { action: 'excel_bg_find', icon: 'fa-search', label: 'Buscar Valor' },
      { action: 'excel_bg_find_replace', icon: 'fa-exchange-alt', label: 'Buscar y Reemplazar' },
      { action: 'excel_bg_get_sheet_names', icon: 'fa-list', label: 'Obtener Nombres de Hojas' },
      { action: 'excel_bg_create_sheet', icon: 'fa-plus-square', label: 'Crear Hoja' },
      { action: 'excel_bg_delete_sheet', icon: 'fa-trash-alt', label: 'Eliminar Hoja' },
      { action: 'excel_bg_rename_sheet', icon: 'fa-i-cursor', label: 'Renombrar Hoja' },
      { action: 'excel_bg_copy_sheet', icon: 'fa-copy', label: 'Copiar Hoja' },
      { action: 'excel_bg_set_formula', icon: 'fa-function', label: 'Establecer Fórmula' },
      { action: 'excel_bg_merge_cells', icon: 'fa-object-group', label: 'Combinar Celdas' },
      { action: 'excel_bg_unmerge_cells', icon: 'fa-object-ungroup', label: 'Descombinar Celdas' },
      { action: 'excel_bg_set_cell_style', icon: 'fa-paint-brush', label: 'Estilo de Celda' },
      { action: 'excel_bg_set_column_width', icon: 'fa-arrows-alt-h', label: 'Ancho de Columna' },
      { action: 'excel_bg_set_row_height', icon: 'fa-arrows-alt-v', label: 'Alto de Fila' },
      { action: 'excel_bg_freeze_panes', icon: 'fa-snowflake', label: 'Inmovilizar Paneles' },
      { action: 'excel_bg_add_image', icon: 'fa-image', label: 'Insertar Imagen' },
      { action: 'excel_bg_add_chart', icon: 'fa-chart-bar', label: 'Insertar Gráfico' },
      { action: 'excel_bg_protect_sheet', icon: 'fa-lock', label: 'Proteger Hoja' },
      { action: 'excel_bg_unprotect_sheet', icon: 'fa-unlock', label: 'Desproteger Hoja' },
      { action: 'excel_bg_to_csv', icon: 'fa-file-csv', label: 'Exportar a CSV' },
      { action: 'excel_bg_to_json', icon: 'fa-file-code', label: 'Exportar a JSON' },
      { action: 'excel_bg_to_datatable', icon: 'fa-table', label: 'Convertir a DataTable' },
      { action: 'excel_bg_from_csv', icon: 'fa-file-csv', label: 'Importar desde CSV' },
      { action: 'excel_bg_from_json', icon: 'fa-file-code', label: 'Importar desde JSON' },
      { action: 'excel_bg_save', icon: 'fa-save', label: 'Guardar' },
      { action: 'excel_bg_save_as', icon: 'fa-save', label: 'Guardar Como' },
      { action: 'excel_bg_close', icon: 'fa-times-circle', label: 'Cerrar Archivo' }
    ]
  },
  {
    id: 'pdf',
    name: 'PDF',
    icon: 'fa-file-pdf',
    actions: [
      { action: 'pdf_read', icon: 'fa-file-pdf', label: 'Leer PDF' },
      { action: 'pdf_extract_text', icon: 'fa-font', label: 'Extraer Texto' },
      { action: 'pdf_extract_tables', icon: 'fa-table', label: 'Extraer Tablas' },
      { action: 'pdf_create', icon: 'fa-plus', label: 'Crear PDF' },
      { action: 'pdf_merge', icon: 'fa-object-group', label: 'Unir PDFs' },
      { action: 'pdf_split', icon: 'fa-cut', label: 'Dividir PDF' },
      { action: 'pdf_to_image', icon: 'fa-image', label: 'PDF a Imagen' }
    ]
  },
  {
    id: 'rest',
    name: 'REST / API',
    icon: 'fa-network-wired',
    actions: [
      { action: 'rest_get', icon: 'fa-download', label: 'GET Request' },
      { action: 'rest_post', icon: 'fa-upload', label: 'POST Request' },
      { action: 'rest_put', icon: 'fa-edit', label: 'PUT Request' },
      { action: 'rest_patch', icon: 'fa-band-aid', label: 'PATCH Request' },
      { action: 'rest_delete', icon: 'fa-trash', label: 'DELETE Request' },
      { action: 'rest_download_file', icon: 'fa-file-download', label: 'Descargar Archivo' },
      { action: 'rest_upload_file', icon: 'fa-file-upload', label: 'Subir Archivo' },
      { action: 'graphql_query', icon: 'fa-project-diagram', label: 'GraphQL Query' }
    ]
  },
  {
    id: 'sap',
    name: 'SAP',
    icon: 'fa-building',
    actions: [
      { action: 'sap_connect', icon: 'fa-plug', label: 'Conectar SAP' },
      { action: 'sap_login', icon: 'fa-sign-in-alt', label: 'Login SAP' },
      { action: 'sap_run_transaction', icon: 'fa-play', label: 'Ejecutar Transacción' },
      { action: 'sap_get_data', icon: 'fa-database', label: 'Obtener Datos' },
      { action: 'sap_set_field', icon: 'fa-edit', label: 'Establecer Campo' },
      { action: 'sap_click_button', icon: 'fa-mouse-pointer', label: 'Click Botón' },
      { action: 'sap_create_order', icon: 'fa-shopping-cart', label: 'Crear Orden' },
      { action: 'sap_bapi_call', icon: 'fa-cogs', label: 'Llamar BAPI' },
      { action: 'sap_logout', icon: 'fa-sign-out-alt', label: 'Logout SAP' }
    ]
  },
  {
    id: 'microsoft365',
    name: 'Microsoft 365',
    icon: 'fa-microsoft',
    isBrand: true,
    actions: [
      { action: 'm365_connect', icon: 'fa-plug', label: 'Conectar M365' },
      { action: 'm365_calendar_get', icon: 'fa-calendar', label: 'Obtener Eventos' },
      { action: 'm365_calendar_create', icon: 'fa-calendar-plus', label: 'Crear Evento' },
      { action: 'm365_teams_send', icon: 'fa-comments', label: 'Enviar a Teams' },
      { action: 'm365_sharepoint_upload', icon: 'fa-cloud-upload-alt', label: 'Subir a SharePoint' },
      { action: 'm365_onedrive_upload', icon: 'fa-cloud', label: 'Subir a OneDrive' },
      { action: 'm365_outlook_send', icon: 'fa-envelope', label: 'Enviar con Outlook' },
      { action: 'm365_outlook_read', icon: 'fa-inbox', label: 'Leer Outlook' }
    ]
  },
  {
    id: 'mouse-keyboard',
    name: 'Mouse & Keyboard',
    icon: 'fa-mouse',
    actions: [
      { action: 'mouse_click', icon: 'fa-mouse-pointer', label: 'Click Mouse' },
      { action: 'mouse_double_click', icon: 'fa-mouse', label: 'Doble Click' },
      { action: 'mouse_right_click', icon: 'fa-hand-pointer', label: 'Click Derecho' },
      { action: 'mouse_move', icon: 'fa-arrows-alt', label: 'Mover Mouse' },
      { action: 'mouse_drag', icon: 'fa-hand-rock', label: 'Arrastrar' },
      { action: 'keyboard_type', icon: 'fa-keyboard', label: 'Teclear' },
      { action: 'keyboard_hotkey', icon: 'fa-keyboard', label: 'Tecla Rápida' },
      { action: 'keyboard_press', icon: 'fa-key', label: 'Presionar Tecla' },
      { action: 'clipboard_copy', icon: 'fa-copy', label: 'Copiar Portapapeles' },
      { action: 'clipboard_paste', icon: 'fa-paste', label: 'Pegar Portapapeles' }
    ]
  },
  {
    id: 'windows',
    name: 'Windows / Sistema',
    icon: 'fa-windows',
    isBrand: true,
    actions: [
      { action: 'window_activate', icon: 'fa-window-restore', label: 'Activar Ventana' },
      { action: 'window_close', icon: 'fa-window-close', label: 'Cerrar Ventana' },
      { action: 'window_minimize', icon: 'fa-window-minimize', label: 'Minimizar Ventana' },
      { action: 'window_maximize', icon: 'fa-window-maximize', label: 'Maximizar Ventana' },
      { action: 'process_start', icon: 'fa-play', label: 'Iniciar Proceso' },
      { action: 'process_kill', icon: 'fa-skull', label: 'Terminar Proceso' },
      { action: 'run_command', icon: 'fa-terminal', label: 'Ejecutar Comando' },
      { action: 'run_powershell', icon: 'fa-terminal', label: 'Ejecutar PowerShell' },
      { action: 'environment_var', icon: 'fa-cog', label: 'Variable de Entorno' }
    ]
  },
  {
    id: 'ocr-image',
    name: 'OCR e Imágenes',
    icon: 'fa-image',
    actions: [
      { action: 'ocr_screen', icon: 'fa-desktop', label: 'OCR - Pantalla' },
      { action: 'ocr_region', icon: 'fa-crop', label: 'OCR - Región' },
      { action: 'ocr_image', icon: 'fa-file-image', label: 'OCR - Imagen' },
      { action: 'ocr_document', icon: 'fa-file-alt', label: 'OCR - Documento' },
      { action: 'find_image_on_screen', icon: 'fa-search', label: 'Buscar Imagen' },
      { action: 'wait_for_image', icon: 'fa-hourglass-half', label: 'Esperar Imagen' },
      { action: 'image_click', icon: 'fa-mouse-pointer', label: 'Click en Imagen' },
      { action: 'image_compare', icon: 'fa-balance-scale', label: 'Comparar Imágenes' },
      { action: 'screenshot_region', icon: 'fa-camera', label: 'Captura de Región' }
    ]
  },
  {
    id: 'credentials',
    name: 'Credenciales',
    icon: 'fa-key',
    actions: [
      { action: 'credential_get', icon: 'fa-key', label: 'Obtener Credencial' },
      { action: 'credential_store', icon: 'fa-lock', label: 'Guardar Credencial' },
      { action: 'credential_delete', icon: 'fa-trash', label: 'Eliminar Credencial' },
      { action: 'credential_list', icon: 'fa-list', label: 'Listar Credenciales' },
      { action: 'encrypt', icon: 'fa-shield-alt', label: 'Encriptar' },
      { action: 'decrypt', icon: 'fa-unlock', label: 'Desencriptar' },
      { action: 'hash', icon: 'fa-hashtag', label: 'Generar Hash' }
    ]
  },
  {
    id: 'ftp-sftp',
    name: 'FTP / SFTP',
    icon: 'fa-server',
    actions: [
      { action: 'ftp_connect', icon: 'fa-plug', label: 'Conectar FTP' },
      { action: 'sftp_connect', icon: 'fa-lock', label: 'Conectar SFTP' },
      { action: 'ftp_upload', icon: 'fa-upload', label: 'Subir Archivo' },
      { action: 'ftp_download', icon: 'fa-download', label: 'Descargar Archivo' },
      { action: 'ftp_list', icon: 'fa-list', label: 'Listar Directorio' },
      { action: 'ftp_delete', icon: 'fa-trash', label: 'Eliminar Archivo' },
      { action: 'ftp_rename', icon: 'fa-i-cursor', label: 'Renombrar' },
      { action: 'ftp_mkdir', icon: 'fa-folder-plus', label: 'Crear Directorio' },
      { action: 'ftp_disconnect', icon: 'fa-unlink', label: 'Desconectar' }
    ]
  },
  {
    id: 'google',
    name: 'Google Workspace',
    icon: 'fa-google',
    isBrand: true,
    actions: [
      { action: 'google_connect', icon: 'fa-plug', label: 'Conectar Google' },
      { action: 'gsheet_open', icon: 'fa-table', label: 'Abrir Google Sheet' },
      { action: 'gsheet_read', icon: 'fa-th', label: 'Leer Celdas' },
      { action: 'gsheet_write', icon: 'fa-edit', label: 'Escribir Celdas' },
      { action: 'gsheet_append', icon: 'fa-plus', label: 'Agregar Fila' },
      { action: 'gdrive_upload', icon: 'fa-cloud-upload-alt', label: 'Subir a Drive' },
      { action: 'gdrive_download', icon: 'fa-cloud-download-alt', label: 'Descargar de Drive' },
      { action: 'gdrive_list', icon: 'fa-list', label: 'Listar Archivos Drive' },
      { action: 'gmail_send', icon: 'fa-envelope', label: 'Enviar Gmail' },
      { action: 'gmail_read', icon: 'fa-inbox', label: 'Leer Gmail' },
      { action: 'gcalendar_get', icon: 'fa-calendar', label: 'Obtener Eventos' },
      { action: 'gcalendar_create', icon: 'fa-calendar-plus', label: 'Crear Evento' }
    ]
  },
  {
    id: 'aws',
    name: 'Amazon AWS',
    icon: 'fa-aws',
    isBrand: true,
    actions: [
      { action: 'aws_connect', icon: 'fa-plug', label: 'Conectar AWS' },
      { action: 's3_upload', icon: 'fa-cloud-upload-alt', label: 'Subir a S3' },
      { action: 's3_download', icon: 'fa-cloud-download-alt', label: 'Descargar de S3' },
      { action: 's3_list', icon: 'fa-list', label: 'Listar Objetos S3' },
      { action: 's3_delete', icon: 'fa-trash', label: 'Eliminar de S3' },
      { action: 'lambda_invoke', icon: 'fa-code', label: 'Invocar Lambda' },
      { action: 'sqs_send', icon: 'fa-paper-plane', label: 'Enviar a SQS' },
      { action: 'sqs_receive', icon: 'fa-inbox', label: 'Recibir de SQS' },
      { action: 'sns_publish', icon: 'fa-bullhorn', label: 'Publicar en SNS' }
    ]
  },
  {
    id: 'azure',
    name: 'Microsoft Azure',
    icon: 'fa-microsoft',
    isBrand: true,
    actions: [
      { action: 'azure_connect', icon: 'fa-plug', label: 'Conectar Azure' },
      { action: 'blob_upload', icon: 'fa-cloud-upload-alt', label: 'Subir a Blob' },
      { action: 'blob_download', icon: 'fa-cloud-download-alt', label: 'Descargar de Blob' },
      { action: 'blob_list', icon: 'fa-list', label: 'Listar Blobs' },
      { action: 'azure_function', icon: 'fa-code', label: 'Invocar Function' },
      { action: 'azure_queue_send', icon: 'fa-paper-plane', label: 'Enviar a Queue' },
      { action: 'azure_queue_receive', icon: 'fa-inbox', label: 'Recibir de Queue' }
    ]
  },
  {
    id: 'terminal',
    name: 'Terminal / CMD',
    icon: 'fa-terminal',
    actions: [
      { action: 'cmd_execute', icon: 'fa-terminal', label: 'Ejecutar CMD' },
      { action: 'powershell_execute', icon: 'fa-terminal', label: 'Ejecutar PowerShell' },
      { action: 'bash_execute', icon: 'fa-terminal', label: 'Ejecutar Bash' },
      { action: 'ssh_connect', icon: 'fa-server', label: 'Conectar SSH' },
      { action: 'ssh_execute', icon: 'fa-code', label: 'Ejecutar SSH' },
      { action: 'ssh_disconnect', icon: 'fa-unlink', label: 'Desconectar SSH' },
      { action: 'run_script', icon: 'fa-file-code', label: 'Ejecutar Script' },
      { action: 'run_python', icon: 'fa-python', label: 'Ejecutar Python', isBrand: true }
    ]
  },
  {
    id: 'pdf-advanced',
    name: 'PDF Avanzado',
    icon: 'fa-file-pdf',
    actions: [
      { action: 'pdf_extract_pages', icon: 'fa-file-export', label: 'Extraer Páginas' },
      { action: 'pdf_rotate', icon: 'fa-redo', label: 'Rotar Páginas' },
      { action: 'pdf_add_watermark', icon: 'fa-stamp', label: 'Agregar Marca de Agua' },
      { action: 'pdf_add_password', icon: 'fa-lock', label: 'Proteger con Contraseña' },
      { action: 'pdf_remove_password', icon: 'fa-unlock', label: 'Quitar Contraseña' },
      { action: 'pdf_add_signature', icon: 'fa-signature', label: 'Agregar Firma' },
      { action: 'pdf_fill_form', icon: 'fa-edit', label: 'Rellenar Formulario' },
      { action: 'pdf_get_metadata', icon: 'fa-info-circle', label: 'Obtener Metadata' }
    ]
  },
  {
    id: 'word',
    name: 'Word / Documentos',
    icon: 'fa-file-word',
    actions: [
      { action: 'word_open', icon: 'fa-file-word', label: 'Abrir Word' },
      { action: 'word_create', icon: 'fa-file-medical', label: 'Crear Documento' },
      { action: 'word_read', icon: 'fa-file-alt', label: 'Leer Documento' },
      { action: 'word_write', icon: 'fa-edit', label: 'Escribir en Documento' },
      { action: 'word_replace', icon: 'fa-exchange-alt', label: 'Buscar y Reemplazar' },
      { action: 'word_add_table', icon: 'fa-table', label: 'Insertar Tabla' },
      { action: 'word_add_image', icon: 'fa-image', label: 'Insertar Imagen' },
      { action: 'word_to_pdf', icon: 'fa-file-pdf', label: 'Convertir a PDF' },
      { action: 'word_save', icon: 'fa-save', label: 'Guardar' },
      { action: 'word_close', icon: 'fa-times-circle', label: 'Cerrar' }
    ]
  },
  {
    id: 'powerpoint',
    name: 'PowerPoint',
    icon: 'fa-file-powerpoint',
    actions: [
      { action: 'ppt_open', icon: 'fa-file-powerpoint', label: 'Abrir PowerPoint' },
      { action: 'ppt_create', icon: 'fa-file-medical', label: 'Crear Presentación' },
      { action: 'ppt_add_slide', icon: 'fa-plus-square', label: 'Agregar Diapositiva' },
      { action: 'ppt_delete_slide', icon: 'fa-minus-square', label: 'Eliminar Diapositiva' },
      { action: 'ppt_add_text', icon: 'fa-font', label: 'Agregar Texto' },
      { action: 'ppt_add_image', icon: 'fa-image', label: 'Agregar Imagen' },
      { action: 'ppt_add_chart', icon: 'fa-chart-bar', label: 'Agregar Gráfico' },
      { action: 'ppt_to_pdf', icon: 'fa-file-pdf', label: 'Exportar a PDF' },
      { action: 'ppt_save', icon: 'fa-save', label: 'Guardar' },
      { action: 'ppt_close', icon: 'fa-times-circle', label: 'Cerrar' }
    ]
  },
  {
    id: 'xml-json',
    name: 'XML / JSON',
    icon: 'fa-code',
    actions: [
      { action: 'xml_read', icon: 'fa-file-code', label: 'Leer XML' },
      { action: 'xml_write', icon: 'fa-edit', label: 'Escribir XML' },
      { action: 'xml_query', icon: 'fa-search', label: 'Consultar XPath' },
      { action: 'xml_validate', icon: 'fa-check', label: 'Validar XML' },
      { action: 'json_read', icon: 'fa-file-code', label: 'Leer JSON' },
      { action: 'json_write', icon: 'fa-edit', label: 'Escribir JSON' },
      { action: 'json_query', icon: 'fa-search', label: 'Consultar JSONPath' },
      { action: 'xml_to_json', icon: 'fa-exchange-alt', label: 'XML a JSON' },
      { action: 'json_to_xml', icon: 'fa-exchange-alt', label: 'JSON a XML' }
    ]
  },
  {
    id: 'regex',
    name: 'Expresiones Regulares',
    icon: 'fa-asterisk',
    actions: [
      { action: 'regex_match', icon: 'fa-search', label: 'Buscar Coincidencia' },
      { action: 'regex_match_all', icon: 'fa-search-plus', label: 'Buscar Todas' },
      { action: 'regex_replace', icon: 'fa-exchange-alt', label: 'Reemplazar' },
      { action: 'regex_split', icon: 'fa-cut', label: 'Dividir' },
      { action: 'regex_validate', icon: 'fa-check', label: 'Validar Patrón' },
      { action: 'regex_extract_groups', icon: 'fa-object-group', label: 'Extraer Grupos' }
    ]
  },
  {
    id: 'datatables',
    name: 'DataTables',
    icon: 'fa-table',
    actions: [
      { action: 'dt_create', icon: 'fa-plus', label: 'Crear DataTable' },
      { action: 'dt_add_row', icon: 'fa-plus-circle', label: 'Agregar Fila' },
      { action: 'dt_add_column', icon: 'fa-columns', label: 'Agregar Columna' },
      { action: 'dt_delete_row', icon: 'fa-minus-circle', label: 'Eliminar Fila' },
      { action: 'dt_delete_column', icon: 'fa-minus-square', label: 'Eliminar Columna' },
      { action: 'dt_get_value', icon: 'fa-hand-pointer', label: 'Obtener Valor' },
      { action: 'dt_set_value', icon: 'fa-edit', label: 'Establecer Valor' },
      { action: 'dt_filter', icon: 'fa-filter', label: 'Filtrar' },
      { action: 'dt_sort', icon: 'fa-sort', label: 'Ordenar' },
      { action: 'dt_merge', icon: 'fa-object-group', label: 'Combinar DataTables' },
      { action: 'dt_to_excel', icon: 'fa-file-excel', label: 'Exportar a Excel' },
      { action: 'dt_to_csv', icon: 'fa-file-csv', label: 'Exportar a CSV' }
    ]
  },
  {
    id: 'recorders',
    name: 'Grabadoras',
    icon: 'fa-record-vinyl',
    actions: [
      { action: 'recorder_start', icon: 'fa-play', label: 'Iniciar Grabación' },
      { action: 'recorder_stop', icon: 'fa-stop', label: 'Detener Grabación' },
      { action: 'recorder_pause', icon: 'fa-pause', label: 'Pausar Grabación' },
      { action: 'recorder_screenshot', icon: 'fa-camera', label: 'Capturar Pantalla' },
      { action: 'recorder_video', icon: 'fa-video', label: 'Grabar Video' }
    ]
  },
  {
    id: 'citrix',
    name: 'Citrix / VDI',
    icon: 'fa-desktop',
    actions: [
      { action: 'citrix_connect', icon: 'fa-plug', label: 'Conectar Citrix' },
      { action: 'citrix_click', icon: 'fa-mouse-pointer', label: 'Click en Citrix' },
      { action: 'citrix_type', icon: 'fa-keyboard', label: 'Escribir en Citrix' },
      { action: 'citrix_image_click', icon: 'fa-image', label: 'Click por Imagen' },
      { action: 'citrix_ocr', icon: 'fa-eye', label: 'OCR en Citrix' },
      { action: 'citrix_disconnect', icon: 'fa-unlink', label: 'Desconectar' }
    ]
  },
  {
    id: 'mainframe',
    name: 'Mainframe / AS400',
    icon: 'fa-server',
    actions: [
      { action: 'mainframe_connect', icon: 'fa-plug', label: 'Conectar Terminal' },
      { action: 'mainframe_send_keys', icon: 'fa-keyboard', label: 'Enviar Teclas' },
      { action: 'mainframe_get_text', icon: 'fa-font', label: 'Obtener Texto' },
      { action: 'mainframe_set_field', icon: 'fa-edit', label: 'Establecer Campo' },
      { action: 'mainframe_wait_screen', icon: 'fa-hourglass-half', label: 'Esperar Pantalla' },
      { action: 'mainframe_screenshot', icon: 'fa-camera', label: 'Captura de Pantalla' },
      { action: 'mainframe_disconnect', icon: 'fa-unlink', label: 'Desconectar' }
    ]
  },
  // ==========================================
  // OMNICANALIDAD - Comunicación Unificada
  // ==========================================
  {
    id: 'twilio',
    name: 'Twilio',
    icon: 'fa-phone-volume',
    description: 'SMS, Voz, Video y WhatsApp',
    actions: [
      { action: 'twilio_connect', icon: 'fa-plug', label: 'Conectar Twilio' },
      { action: 'twilio_send_sms', icon: 'fa-sms', label: 'Enviar SMS' },
      { action: 'twilio_send_mms', icon: 'fa-image', label: 'Enviar MMS' },
      { action: 'twilio_make_call', icon: 'fa-phone', label: 'Realizar Llamada' },
      { action: 'twilio_send_voice_message', icon: 'fa-voicemail', label: 'Mensaje de Voz' },
      { action: 'twilio_send_whatsapp', icon: 'fa-whatsapp', label: 'Enviar WhatsApp', isBrand: true },
      { action: 'twilio_whatsapp_template', icon: 'fa-file-alt', label: 'Plantilla WhatsApp' },
      { action: 'twilio_video_room', icon: 'fa-video', label: 'Crear Sala Video' },
      { action: 'twilio_verify_send', icon: 'fa-shield-alt', label: 'Enviar Verificación' },
      { action: 'twilio_verify_check', icon: 'fa-check-circle', label: 'Verificar Código' },
      { action: 'twilio_get_messages', icon: 'fa-inbox', label: 'Obtener Mensajes' },
      { action: 'twilio_get_calls', icon: 'fa-history', label: 'Historial Llamadas' },
      { action: 'twilio_lookup', icon: 'fa-search', label: 'Buscar Número' }
    ]
  },
  {
    id: 'whatsapp-business',
    name: 'WhatsApp Business',
    icon: 'fa-whatsapp',
    isBrand: true,
    description: 'API Oficial de WhatsApp',
    actions: [
      { action: 'wa_connect', icon: 'fa-plug', label: 'Conectar WhatsApp' },
      { action: 'wa_send_message', icon: 'fa-paper-plane', label: 'Enviar Mensaje' },
      { action: 'wa_send_template', icon: 'fa-file-alt', label: 'Enviar Plantilla' },
      { action: 'wa_send_media', icon: 'fa-image', label: 'Enviar Media' },
      { action: 'wa_send_document', icon: 'fa-file', label: 'Enviar Documento' },
      { action: 'wa_send_location', icon: 'fa-map-marker-alt', label: 'Enviar Ubicación' },
      { action: 'wa_send_contact', icon: 'fa-address-card', label: 'Enviar Contacto' },
      { action: 'wa_send_buttons', icon: 'fa-th-list', label: 'Mensaje con Botones' },
      { action: 'wa_send_list', icon: 'fa-list', label: 'Mensaje con Lista' },
      { action: 'wa_mark_read', icon: 'fa-check-double', label: 'Marcar como Leído' },
      { action: 'wa_get_messages', icon: 'fa-inbox', label: 'Obtener Mensajes' },
      { action: 'wa_get_media', icon: 'fa-download', label: 'Descargar Media' },
      { action: 'wa_upload_media', icon: 'fa-upload', label: 'Subir Media' },
      { action: 'wa_get_profile', icon: 'fa-user', label: 'Obtener Perfil' },
      { action: 'wa_update_profile', icon: 'fa-user-edit', label: 'Actualizar Perfil' }
    ]
  },
  {
    id: 'telegram',
    name: 'Telegram Bot',
    icon: 'fa-telegram',
    isBrand: true,
    description: 'Automatización con Bots',
    actions: [
      { action: 'tg_connect', icon: 'fa-plug', label: 'Conectar Bot' },
      { action: 'tg_send_message', icon: 'fa-paper-plane', label: 'Enviar Mensaje' },
      { action: 'tg_send_photo', icon: 'fa-image', label: 'Enviar Foto' },
      { action: 'tg_send_document', icon: 'fa-file', label: 'Enviar Documento' },
      { action: 'tg_send_video', icon: 'fa-video', label: 'Enviar Video' },
      { action: 'tg_send_audio', icon: 'fa-music', label: 'Enviar Audio' },
      { action: 'tg_send_voice', icon: 'fa-microphone', label: 'Enviar Nota de Voz' },
      { action: 'tg_send_location', icon: 'fa-map-marker-alt', label: 'Enviar Ubicación' },
      { action: 'tg_send_poll', icon: 'fa-poll', label: 'Enviar Encuesta' },
      { action: 'tg_send_inline_keyboard', icon: 'fa-th', label: 'Teclado Inline' },
      { action: 'tg_edit_message', icon: 'fa-edit', label: 'Editar Mensaje' },
      { action: 'tg_delete_message', icon: 'fa-trash', label: 'Eliminar Mensaje' },
      { action: 'tg_get_updates', icon: 'fa-sync', label: 'Obtener Updates' },
      { action: 'tg_get_chat', icon: 'fa-comments', label: 'Info del Chat' },
      { action: 'tg_get_member', icon: 'fa-user', label: 'Info del Miembro' },
      { action: 'tg_answer_callback', icon: 'fa-reply', label: 'Responder Callback' }
    ]
  },
  {
    id: 'slack',
    name: 'Slack',
    icon: 'fa-slack',
    isBrand: true,
    description: 'Mensajería empresarial',
    actions: [
      { action: 'slack_connect', icon: 'fa-plug', label: 'Conectar Slack' },
      { action: 'slack_send_message', icon: 'fa-paper-plane', label: 'Enviar Mensaje' },
      { action: 'slack_send_blocks', icon: 'fa-th-large', label: 'Enviar Bloques' },
      { action: 'slack_upload_file', icon: 'fa-upload', label: 'Subir Archivo' },
      { action: 'slack_create_channel', icon: 'fa-plus', label: 'Crear Canal' },
      { action: 'slack_invite_user', icon: 'fa-user-plus', label: 'Invitar Usuario' },
      { action: 'slack_get_messages', icon: 'fa-inbox', label: 'Obtener Mensajes' },
      { action: 'slack_get_users', icon: 'fa-users', label: 'Listar Usuarios' },
      { action: 'slack_get_channels', icon: 'fa-list', label: 'Listar Canales' },
      { action: 'slack_update_message', icon: 'fa-edit', label: 'Actualizar Mensaje' },
      { action: 'slack_add_reaction', icon: 'fa-smile', label: 'Agregar Reacción' },
      { action: 'slack_set_status', icon: 'fa-user-circle', label: 'Cambiar Estado' }
    ]
  },
  {
    id: 'teams',
    name: 'Microsoft Teams',
    icon: 'fa-microsoft',
    isBrand: true,
    description: 'Comunicación empresarial',
    actions: [
      { action: 'teams_connect', icon: 'fa-plug', label: 'Conectar Teams' },
      { action: 'teams_send_message', icon: 'fa-paper-plane', label: 'Enviar Mensaje' },
      { action: 'teams_send_card', icon: 'fa-id-card', label: 'Enviar Card Adaptativa' },
      { action: 'teams_create_channel', icon: 'fa-plus', label: 'Crear Canal' },
      { action: 'teams_get_messages', icon: 'fa-inbox', label: 'Obtener Mensajes' },
      { action: 'teams_get_members', icon: 'fa-users', label: 'Obtener Miembros' },
      { action: 'teams_schedule_meeting', icon: 'fa-calendar-plus', label: 'Programar Reunión' },
      { action: 'teams_upload_file', icon: 'fa-upload', label: 'Subir Archivo' },
      { action: 'teams_get_presence', icon: 'fa-circle', label: 'Obtener Presencia' }
    ]
  },
  {
    id: 'discord',
    name: 'Discord',
    icon: 'fa-discord',
    isBrand: true,
    description: 'Bots y webhooks',
    actions: [
      { action: 'discord_connect', icon: 'fa-plug', label: 'Conectar Bot' },
      { action: 'discord_send_message', icon: 'fa-paper-plane', label: 'Enviar Mensaje' },
      { action: 'discord_send_embed', icon: 'fa-th-large', label: 'Enviar Embed' },
      { action: 'discord_send_webhook', icon: 'fa-share', label: 'Enviar por Webhook' },
      { action: 'discord_send_file', icon: 'fa-file', label: 'Enviar Archivo' },
      { action: 'discord_create_channel', icon: 'fa-plus', label: 'Crear Canal' },
      { action: 'discord_get_messages', icon: 'fa-inbox', label: 'Obtener Mensajes' },
      { action: 'discord_get_members', icon: 'fa-users', label: 'Obtener Miembros' },
      { action: 'discord_add_reaction', icon: 'fa-smile', label: 'Agregar Reacción' },
      { action: 'discord_assign_role', icon: 'fa-user-tag', label: 'Asignar Rol' }
    ]
  },
  {
    id: 'facebook',
    name: 'Facebook / Messenger',
    icon: 'fa-facebook',
    isBrand: true,
    description: 'Páginas y Messenger',
    actions: [
      { action: 'fb_connect', icon: 'fa-plug', label: 'Conectar Facebook' },
      { action: 'fb_send_message', icon: 'fa-paper-plane', label: 'Enviar Mensaje' },
      { action: 'fb_send_template', icon: 'fa-file-alt', label: 'Enviar Plantilla' },
      { action: 'fb_send_quick_replies', icon: 'fa-reply-all', label: 'Respuestas Rápidas' },
      { action: 'fb_send_media', icon: 'fa-image', label: 'Enviar Media' },
      { action: 'fb_get_messages', icon: 'fa-inbox', label: 'Obtener Mensajes' },
      { action: 'fb_get_profile', icon: 'fa-user', label: 'Obtener Perfil' },
      { action: 'fb_post_page', icon: 'fa-file-alt', label: 'Publicar en Página' },
      { action: 'fb_get_page_posts', icon: 'fa-list', label: 'Obtener Posts' },
      { action: 'fb_get_comments', icon: 'fa-comments', label: 'Obtener Comentarios' },
      { action: 'fb_reply_comment', icon: 'fa-reply', label: 'Responder Comentario' }
    ]
  },
  {
    id: 'instagram',
    name: 'Instagram',
    icon: 'fa-instagram',
    isBrand: true,
    description: 'DMs y publicaciones',
    actions: [
      { action: 'ig_connect', icon: 'fa-plug', label: 'Conectar Instagram' },
      { action: 'ig_send_message', icon: 'fa-paper-plane', label: 'Enviar DM' },
      { action: 'ig_send_media', icon: 'fa-image', label: 'Enviar Media en DM' },
      { action: 'ig_get_messages', icon: 'fa-inbox', label: 'Obtener DMs' },
      { action: 'ig_get_profile', icon: 'fa-user', label: 'Obtener Perfil' },
      { action: 'ig_get_posts', icon: 'fa-th', label: 'Obtener Posts' },
      { action: 'ig_get_comments', icon: 'fa-comments', label: 'Obtener Comentarios' },
      { action: 'ig_reply_comment', icon: 'fa-reply', label: 'Responder Comentario' },
      { action: 'ig_get_stories', icon: 'fa-circle', label: 'Obtener Stories' }
    ]
  },
  {
    id: 'twitter-x',
    name: 'X (Twitter)',
    icon: 'fa-twitter',
    isBrand: true,
    description: 'Posts y DMs',
    actions: [
      { action: 'x_connect', icon: 'fa-plug', label: 'Conectar X' },
      { action: 'x_post_tweet', icon: 'fa-paper-plane', label: 'Publicar Tweet' },
      { action: 'x_send_dm', icon: 'fa-envelope', label: 'Enviar DM' },
      { action: 'x_get_timeline', icon: 'fa-stream', label: 'Obtener Timeline' },
      { action: 'x_get_mentions', icon: 'fa-at', label: 'Obtener Menciones' },
      { action: 'x_get_dms', icon: 'fa-inbox', label: 'Obtener DMs' },
      { action: 'x_search', icon: 'fa-search', label: 'Buscar Tweets' },
      { action: 'x_like', icon: 'fa-heart', label: 'Dar Like' },
      { action: 'x_retweet', icon: 'fa-retweet', label: 'Retweet' },
      { action: 'x_reply', icon: 'fa-reply', label: 'Responder' }
    ]
  },
  {
    id: 'linkedin',
    name: 'LinkedIn',
    icon: 'fa-linkedin',
    isBrand: true,
    description: 'Red profesional',
    actions: [
      { action: 'li_connect', icon: 'fa-plug', label: 'Conectar LinkedIn' },
      { action: 'li_post', icon: 'fa-file-alt', label: 'Crear Publicación' },
      { action: 'li_send_message', icon: 'fa-paper-plane', label: 'Enviar Mensaje' },
      { action: 'li_get_profile', icon: 'fa-user', label: 'Obtener Perfil' },
      { action: 'li_get_connections', icon: 'fa-users', label: 'Obtener Conexiones' },
      { action: 'li_get_posts', icon: 'fa-stream', label: 'Obtener Posts' },
      { action: 'li_search_people', icon: 'fa-search', label: 'Buscar Personas' },
      { action: 'li_send_invite', icon: 'fa-user-plus', label: 'Enviar Invitación' }
    ]
  },
  // ==========================================
  // CRM - Gestión de Clientes
  // ==========================================
  {
    id: 'hubspot',
    name: 'HubSpot',
    icon: 'fa-hubspot',
    isBrand: true,
    description: 'CRM y Marketing',
    actions: [
      { action: 'hs_connect', icon: 'fa-plug', label: 'Conectar HubSpot' },
      { action: 'hs_create_contact', icon: 'fa-user-plus', label: 'Crear Contacto' },
      { action: 'hs_update_contact', icon: 'fa-user-edit', label: 'Actualizar Contacto' },
      { action: 'hs_get_contact', icon: 'fa-user', label: 'Obtener Contacto' },
      { action: 'hs_search_contacts', icon: 'fa-search', label: 'Buscar Contactos' },
      { action: 'hs_create_deal', icon: 'fa-handshake', label: 'Crear Negocio' },
      { action: 'hs_update_deal', icon: 'fa-edit', label: 'Actualizar Negocio' },
      { action: 'hs_get_deals', icon: 'fa-list', label: 'Obtener Negocios' },
      { action: 'hs_create_ticket', icon: 'fa-ticket-alt', label: 'Crear Ticket' },
      { action: 'hs_update_ticket', icon: 'fa-edit', label: 'Actualizar Ticket' },
      { action: 'hs_create_company', icon: 'fa-building', label: 'Crear Empresa' },
      { action: 'hs_send_email', icon: 'fa-envelope', label: 'Enviar Email' },
      { action: 'hs_add_note', icon: 'fa-sticky-note', label: 'Agregar Nota' },
      { action: 'hs_create_task', icon: 'fa-tasks', label: 'Crear Tarea' }
    ]
  },
  {
    id: 'salesforce',
    name: 'Salesforce',
    icon: 'fa-salesforce',
    isBrand: true,
    description: 'CRM Empresarial',
    actions: [
      { action: 'sf_connect', icon: 'fa-plug', label: 'Conectar Salesforce' },
      { action: 'sf_query', icon: 'fa-search', label: 'Consulta SOQL' },
      { action: 'sf_create_record', icon: 'fa-plus', label: 'Crear Registro' },
      { action: 'sf_update_record', icon: 'fa-edit', label: 'Actualizar Registro' },
      { action: 'sf_delete_record', icon: 'fa-trash', label: 'Eliminar Registro' },
      { action: 'sf_get_record', icon: 'fa-file-alt', label: 'Obtener Registro' },
      { action: 'sf_create_lead', icon: 'fa-user-plus', label: 'Crear Lead' },
      { action: 'sf_convert_lead', icon: 'fa-exchange-alt', label: 'Convertir Lead' },
      { action: 'sf_create_opportunity', icon: 'fa-handshake', label: 'Crear Oportunidad' },
      { action: 'sf_create_case', icon: 'fa-briefcase', label: 'Crear Caso' },
      { action: 'sf_create_task', icon: 'fa-tasks', label: 'Crear Tarea' },
      { action: 'sf_attach_file', icon: 'fa-paperclip', label: 'Adjuntar Archivo' }
    ]
  },
  {
    id: 'zendesk',
    name: 'Zendesk',
    icon: 'fa-headset',
    description: 'Soporte al Cliente',
    actions: [
      { action: 'zd_connect', icon: 'fa-plug', label: 'Conectar Zendesk' },
      { action: 'zd_create_ticket', icon: 'fa-ticket-alt', label: 'Crear Ticket' },
      { action: 'zd_update_ticket', icon: 'fa-edit', label: 'Actualizar Ticket' },
      { action: 'zd_get_ticket', icon: 'fa-file-alt', label: 'Obtener Ticket' },
      { action: 'zd_search_tickets', icon: 'fa-search', label: 'Buscar Tickets' },
      { action: 'zd_add_comment', icon: 'fa-comment', label: 'Agregar Comentario' },
      { action: 'zd_create_user', icon: 'fa-user-plus', label: 'Crear Usuario' },
      { action: 'zd_get_user', icon: 'fa-user', label: 'Obtener Usuario' },
      { action: 'zd_assign_ticket', icon: 'fa-user-check', label: 'Asignar Ticket' },
      { action: 'zd_change_status', icon: 'fa-exchange-alt', label: 'Cambiar Estado' },
      { action: 'zd_add_tags', icon: 'fa-tags', label: 'Agregar Etiquetas' },
      { action: 'zd_upload_attachment', icon: 'fa-paperclip', label: 'Adjuntar Archivo' }
    ]
  },
  {
    id: 'freshdesk',
    name: 'Freshdesk',
    icon: 'fa-life-ring',
    description: 'Mesa de Ayuda',
    actions: [
      { action: 'fd_connect', icon: 'fa-plug', label: 'Conectar Freshdesk' },
      { action: 'fd_create_ticket', icon: 'fa-ticket-alt', label: 'Crear Ticket' },
      { action: 'fd_update_ticket', icon: 'fa-edit', label: 'Actualizar Ticket' },
      { action: 'fd_get_tickets', icon: 'fa-list', label: 'Obtener Tickets' },
      { action: 'fd_add_reply', icon: 'fa-reply', label: 'Agregar Respuesta' },
      { action: 'fd_add_note', icon: 'fa-sticky-note', label: 'Agregar Nota' },
      { action: 'fd_create_contact', icon: 'fa-user-plus', label: 'Crear Contacto' },
      { action: 'fd_get_contact', icon: 'fa-user', label: 'Obtener Contacto' }
    ]
  },
  // ==========================================
  // CHATBOTS E IA CONVERSACIONAL
  // ==========================================
  {
    id: 'chatbot',
    name: 'Chatbot / IA',
    icon: 'fa-robot',
    description: 'Automatización conversacional',
    actions: [
      { action: 'bot_create_flow', icon: 'fa-project-diagram', label: 'Crear Flujo' },
      { action: 'bot_add_intent', icon: 'fa-bullseye', label: 'Agregar Intención' },
      { action: 'bot_add_entity', icon: 'fa-tag', label: 'Agregar Entidad' },
      { action: 'bot_train', icon: 'fa-graduation-cap', label: 'Entrenar Bot' },
      { action: 'bot_respond', icon: 'fa-reply', label: 'Generar Respuesta' },
      { action: 'bot_handoff', icon: 'fa-user-friends', label: 'Transferir a Agente' },
      { action: 'bot_get_context', icon: 'fa-brain', label: 'Obtener Contexto' },
      { action: 'bot_set_context', icon: 'fa-memory', label: 'Establecer Contexto' },
      { action: 'bot_analyze_sentiment', icon: 'fa-smile', label: 'Analizar Sentimiento' },
      { action: 'bot_extract_entities', icon: 'fa-highlighter', label: 'Extraer Entidades' },
      { action: 'bot_classify_intent', icon: 'fa-tags', label: 'Clasificar Intención' }
    ]
  },
  {
    id: 'dialogflow',
    name: 'Dialogflow',
    icon: 'fa-google',
    isBrand: true,
    description: 'NLP de Google',
    actions: [
      { action: 'df_connect', icon: 'fa-plug', label: 'Conectar Dialogflow' },
      { action: 'df_detect_intent', icon: 'fa-bullseye', label: 'Detectar Intención' },
      { action: 'df_create_context', icon: 'fa-plus', label: 'Crear Contexto' },
      { action: 'df_get_contexts', icon: 'fa-list', label: 'Obtener Contextos' },
      { action: 'df_delete_context', icon: 'fa-trash', label: 'Eliminar Contexto' },
      { action: 'df_create_entity', icon: 'fa-tag', label: 'Crear Entidad' },
      { action: 'df_create_intent', icon: 'fa-bullseye', label: 'Crear Intención' }
    ]
  },
  // ==========================================
  // BANDEJA UNIFICADA
  // ==========================================
  {
    id: 'unified-inbox',
    name: 'Bandeja Unificada',
    icon: 'fa-inbox',
    description: 'Gestión omnicanal',
    actions: [
      { action: 'inbox_get_conversations', icon: 'fa-comments', label: 'Obtener Conversaciones' },
      { action: 'inbox_get_messages', icon: 'fa-envelope', label: 'Obtener Mensajes' },
      { action: 'inbox_reply', icon: 'fa-reply', label: 'Responder' },
      { action: 'inbox_assign', icon: 'fa-user-check', label: 'Asignar a Agente' },
      { action: 'inbox_transfer', icon: 'fa-exchange-alt', label: 'Transferir' },
      { action: 'inbox_close', icon: 'fa-check', label: 'Cerrar Conversación' },
      { action: 'inbox_add_tag', icon: 'fa-tag', label: 'Agregar Etiqueta' },
      { action: 'inbox_add_note', icon: 'fa-sticky-note', label: 'Agregar Nota Interna' },
      { action: 'inbox_get_history', icon: 'fa-history', label: 'Historial del Cliente' },
      { action: 'inbox_merge_contacts', icon: 'fa-object-group', label: 'Unificar Contactos' },
      { action: 'inbox_export', icon: 'fa-download', label: 'Exportar Conversación' }
    ]
  },
  // ==========================================
  // AUTOMATIZACIÓN DE MARKETING
  // ==========================================
  {
    id: 'marketing-automation',
    name: 'Marketing Automation',
    icon: 'fa-bullhorn',
    description: 'Campañas y leads',
    actions: [
      { action: 'mkt_create_campaign', icon: 'fa-flag', label: 'Crear Campaña' },
      { action: 'mkt_add_to_list', icon: 'fa-list', label: 'Agregar a Lista' },
      { action: 'mkt_remove_from_list', icon: 'fa-minus', label: 'Remover de Lista' },
      { action: 'mkt_send_broadcast', icon: 'fa-broadcast-tower', label: 'Enviar Broadcast' },
      { action: 'mkt_schedule_message', icon: 'fa-clock', label: 'Programar Mensaje' },
      { action: 'mkt_create_sequence', icon: 'fa-stream', label: 'Crear Secuencia' },
      { action: 'mkt_trigger_sequence', icon: 'fa-play', label: 'Iniciar Secuencia' },
      { action: 'mkt_stop_sequence', icon: 'fa-stop', label: 'Detener Secuencia' },
      { action: 'mkt_score_lead', icon: 'fa-star', label: 'Puntuar Lead' },
      { action: 'mkt_segment_contacts', icon: 'fa-filter', label: 'Segmentar Contactos' },
      { action: 'mkt_ab_test', icon: 'fa-flask', label: 'Test A/B' },
      { action: 'mkt_get_analytics', icon: 'fa-chart-line', label: 'Obtener Analíticas' }
    ]
  },
  // ==========================================
  // WEBHOOKS Y EVENTOS
  // ==========================================
  {
    id: 'webhooks',
    name: 'Webhooks',
    icon: 'fa-link',
    description: 'Integración por eventos',
    actions: [
      { action: 'webhook_create', icon: 'fa-plus', label: 'Crear Webhook' },
      { action: 'webhook_send', icon: 'fa-paper-plane', label: 'Enviar Webhook' },
      { action: 'webhook_receive', icon: 'fa-inbox', label: 'Recibir Webhook' },
      { action: 'webhook_validate', icon: 'fa-check', label: 'Validar Firma' },
      { action: 'webhook_retry', icon: 'fa-redo', label: 'Reintentar Envío' },
      { action: 'webhook_list', icon: 'fa-list', label: 'Listar Webhooks' },
      { action: 'webhook_delete', icon: 'fa-trash', label: 'Eliminar Webhook' },
      { action: 'webhook_logs', icon: 'fa-history', label: 'Ver Logs' }
    ]
  },
  // ==========================================
  // INTEGRACIONES (ZAPIER, MAKE)
  // ==========================================
  {
    id: 'integrations',
    name: 'Integraciones',
    icon: 'fa-puzzle-piece',
    description: 'Zapier, Make, n8n',
    actions: [
      { action: 'zapier_trigger', icon: 'fa-bolt', label: 'Trigger Zapier' },
      { action: 'zapier_action', icon: 'fa-play', label: 'Acción Zapier' },
      { action: 'make_trigger', icon: 'fa-bolt', label: 'Trigger Make' },
      { action: 'make_action', icon: 'fa-play', label: 'Acción Make' },
      { action: 'n8n_trigger', icon: 'fa-bolt', label: 'Trigger n8n' },
      { action: 'n8n_action', icon: 'fa-play', label: 'Acción n8n' },
      { action: 'ifttt_trigger', icon: 'fa-bolt', label: 'Trigger IFTTT' },
      { action: 'power_automate', icon: 'fa-microsoft', label: 'Power Automate', isBrand: true }
    ]
  },
  // ==========================================
  // AGENTES MODULARES - Alqvimia Agents
  // ==========================================
  {
    id: 'alqvimia-agents',
    name: 'Agentes Alqvimia',
    icon: 'fa-cubes',
    description: 'Ejecutar acciones en agentes modulares',
    actions: [
      { action: 'agent_execute', icon: 'fa-play', label: 'Ejecutar Acción en Agente' },
      { action: 'agent_start', icon: 'fa-power-off', label: 'Iniciar Agente' },
      { action: 'agent_stop', icon: 'fa-stop-circle', label: 'Detener Agente' },
      { action: 'agent_status', icon: 'fa-info-circle', label: 'Estado del Agente' },
      { action: 'agent_config', icon: 'fa-cog', label: 'Configurar Agente' },
      { action: 'agent_mysql_query', icon: 'fa-database', label: 'MySQL: Ejecutar Query' },
      { action: 'agent_mysql_schema', icon: 'fa-sitemap', label: 'MySQL: Obtener Schema' },
      { action: 'agent_rest_request', icon: 'fa-cloud', label: 'REST: HTTP Request' },
      { action: 'agent_rest_batch', icon: 'fa-layer-group', label: 'REST: Batch Requests' },
      { action: 'agent_whatsapp_send', icon: 'fa-whatsapp', label: 'WhatsApp: Enviar Mensaje', isBrand: true },
      { action: 'agent_whatsapp_template', icon: 'fa-file-alt', label: 'WhatsApp: Enviar Template' },
      { action: 'agent_whatsapp_media', icon: 'fa-image', label: 'WhatsApp: Enviar Media' },
      { action: 'agent_workflow_execute', icon: 'fa-project-diagram', label: 'Ejecutar Sub-Workflow' },
      { action: 'agent_orchestrator_workflow', icon: 'fa-sitemap', label: 'Workflow Multi-Agente' }
    ]
  }
]

// Categoría especial para componentes personalizados (se carga dinámicamente)
const CUSTOM_COMPONENTS_CATEGORY = {
  id: 'custom-components',
  name: 'Personalizados',
  icon: 'fa-puzzle-piece',
  description: 'Componentes creados dinámicamente por IA',
  actions: [] // Se llena dinámicamente desde localStorage
}

// Función para obtener todas las acciones disponibles del sistema
const getAllAvailableActions = () => {
  const actions = new Set()
  WORKFLOW_CATEGORIES.forEach(category => {
    category.actions.forEach(action => {
      actions.add(action.action)
    })
  })
  return actions
}

// Función para verificar si una acción existe
const actionExists = (actionId) => {
  const availableActions = getAllAvailableActions()
  return availableActions.has(actionId)
}

// Función para generar un ID de acción válido
const generateActionId = (label) => {
  return 'custom_' + label
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')
}

// Función para determinar el mejor icono basado en el nombre/descripción
const suggestIconForAction = (label) => {
  const labelLower = label.toLowerCase()

  // Mapa de palabras clave a iconos
  const iconMap = {
    // Archivos
    'archivo|file|documento|document': 'fa-file',
    'carpeta|folder|directorio|directory': 'fa-folder',
    'abrir|open': 'fa-folder-open',
    'guardar|save': 'fa-save',
    'crear|create|nuevo|new': 'fa-plus',
    'eliminar|delete|borrar|remove': 'fa-trash',
    'copiar|copy': 'fa-copy',
    'mover|move': 'fa-file-export',
    'leer|read': 'fa-eye',
    'escribir|write': 'fa-edit',

    // Windows/Sistema
    'ventana|window': 'fa-window-restore',
    'explorador|explorer': 'fa-folder-open',
    'proceso|process': 'fa-cogs',
    'ejecutar|run|launch': 'fa-play',
    'comando|command|cmd|powershell': 'fa-terminal',

    // Datos
    'contar|count': 'fa-calculator',
    'lista|list': 'fa-list',
    'buscar|search|find': 'fa-search',
    'filtrar|filter': 'fa-filter',
    'ordenar|sort': 'fa-sort',

    // Comunicación
    'email|correo|mail': 'fa-envelope',
    'mensaje|message': 'fa-comment',
    'enviar|send': 'fa-paper-plane',
    'notificar|notify': 'fa-bell',

    // Base de datos
    'base.*datos|database|sql': 'fa-database',
    'query|consulta': 'fa-search',

    // Web
    'navegador|browser|web': 'fa-globe',
    'url|link': 'fa-link',
    'descargar|download': 'fa-download',
    'subir|upload': 'fa-upload',

    // Control
    'esperar|wait|delay': 'fa-clock',
    'condición|condition|si|if': 'fa-question',
    'bucle|loop|repetir|repeat': 'fa-redo',

    // UI
    'input|entrada|preguntar|ask': 'fa-keyboard',
    'seleccionar|select|elegir|choose': 'fa-hand-pointer',
    'mostrar|show|display': 'fa-eye',
    'ocultar|hide': 'fa-eye-slash',

    // Otros
    'imagen|image|foto|photo': 'fa-image',
    'pdf': 'fa-file-pdf',
    'excel': 'fa-file-excel',
    'word': 'fa-file-word',
    'configurar|config|settings': 'fa-cog',
    'validar|validate|verificar|verify': 'fa-check',
    'error|exception': 'fa-exclamation-triangle',
    'log|registro': 'fa-terminal',
    'api|rest': 'fa-cloud',
    'ia|ai|inteligencia': 'fa-brain',
    'robot|automatizar|automate': 'fa-robot'
  }

  for (const [pattern, icon] of Object.entries(iconMap)) {
    if (new RegExp(pattern, 'i').test(labelLower)) {
      return icon
    }
  }

  return 'fa-puzzle-piece' // Icono por defecto para componentes personalizados
}

// Función para crear un componente personalizado
const createCustomComponent = (label, description = '', params = {}) => {
  const actionId = generateActionId(label)
  const icon = suggestIconForAction(label)

  return {
    action: actionId,
    icon,
    label,
    description,
    isCustom: true,
    createdAt: new Date().toISOString(),
    params: params
  }
}

function WorkflowsView() {
  const { t } = useLanguage()
  const { socket, isConnected, connect } = useSocket()
  const [workflowName, setWorkflowName] = useState('Mi Workflow')
  const [workflowSteps, setWorkflowSteps] = useState([])
  const [selectedStep, setSelectedStep] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  // Todas las categorías minimizadas por defecto
  const [expandedCategories, setExpandedCategories] = useState({})
  const [expandedSteps, setExpandedSteps] = useState({})
  const [leftPanelCollapsed, setLeftPanelCollapsed] = useState(false)
  const [rightPanelCollapsed, setRightPanelCollapsed] = useState(false)

  // Estados para paneles redimensionables
  const [leftPanelWidth, setLeftPanelWidth] = useState(() => {
    const saved = localStorage.getItem('alqvimia-left-panel-width')
    return saved ? parseInt(saved) : 200
  })
  const [rightPanelWidth, setRightPanelWidth] = useState(() => {
    const saved = localStorage.getItem('alqvimia-right-panel-width')
    return saved ? parseInt(saved) : 340
  })
  const [isResizingLeft, setIsResizingLeft] = useState(false)
  const [isResizingRight, setIsResizingRight] = useState(false)
  const [isResizingToolbar, setIsResizingToolbar] = useState(false)
  const [toolbarHeight, setToolbarHeight] = useState(() => {
    const saved = localStorage.getItem('alqvimia-toolbar-height')
    return saved ? parseInt(saved) : 50
  })
  const [toolbarResizeStart, setToolbarResizeStart] = useState({ y: 0, height: 0 })
  const [statusBarHeight, setStatusBarHeight] = useState(() => {
    const saved = localStorage.getItem('alqvimia-statusbar-height')
    return saved ? parseInt(saved) : 32
  })
  const [isResizingStatusBar, setIsResizingStatusBar] = useState(false)
  const [statusBarResizeStart, setStatusBarResizeStart] = useState({ y: 0, height: 0 })
  const [clipboard, setClipboard] = useState(null)
  const [viewMode, setViewMode] = useState('list')
  const [contextMenu, setContextMenu] = useState(null)
  const [breakpoints, setBreakpoints] = useState(new Set())
  const [isDebugging, setIsDebugging] = useState(false)
  const [currentDebugStep, setCurrentDebugStep] = useState(null)
  const [variables, setVariables] = useState([])
  const [rightPanelTab, setRightPanelTab] = useState('properties')
  const canvasRef = useRef(null)

  // Estados para ejecución
  const [isExecuting, setIsExecuting] = useState(false)
  const [executionProgress, setExecutionProgress] = useState(0)
  const [executionCurrentStep, setExecutionCurrentStep] = useState(null)
  const [showExecutionBar, setShowExecutionBar] = useState(false)
  const [showPreviewModal, setShowPreviewModal] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [showValidationModal, setShowValidationModal] = useState(false)
  const [validationErrors, setValidationErrors] = useState([])

  // Estados para comandos de voz
  const [isListening, setIsListening] = useState(false)
  const [voiceTranscript, setVoiceTranscript] = useState('')
  const [voiceSupported, setVoiceSupported] = useState(true)
  const [voiceMode, setVoiceMode] = useState('command') // 'command' o 'dictation'
  const [dictationTarget, setDictationTarget] = useState('aiPrompt') // 'aiPrompt' para modal IA
  const [dictationBuffer, setDictationBuffer] = useState('')
  const recognitionRef = useRef(null)
  const aiPromptRef = useRef(null)

  // Estados para MessageBox modal con tiempo
  const [showMessageBox, setShowMessageBox] = useState(false)
  const [messageBoxContent, setMessageBoxContent] = useState({ title: '', message: '', type: 'info' })
  const [messageBoxStartTime, setMessageBoxStartTime] = useState(null)
  const [messageBoxElapsed, setMessageBoxElapsed] = useState(0)

  // Estados para drag & drop reordenamiento
  const [draggedStep, setDraggedStep] = useState(null)
  const [dragOverStep, setDragOverStep] = useState(null)
  const [dragPosition, setDragPosition] = useState(null) // 'before' | 'after'
  const [currentWorkflowId, setCurrentWorkflowId] = useState(null)

  // Estados para componentes personalizados
  const [customComponents, setCustomComponents] = useState([])
  const [showCustomComponentModal, setShowCustomComponentModal] = useState(false)
  const [newCustomComponent, setNewCustomComponent] = useState({ label: '', description: '', params: {} })

  // Conectar Socket.IO automáticamente para ejecución real
  useEffect(() => {
    console.log('[WorkflowsView] Socket status:', { socket: !!socket, isConnected, socketId: socket?.id })
    if (socket && !isConnected) {
      console.log('[WorkflowsView] Conectando Socket.IO para ejecución real...')
      connect()
    }
  }, [socket, isConnected, connect])

  // Log de cambios en conexión
  useEffect(() => {
    if (isConnected) {
      console.log('%c[WorkflowsView] ✅ Socket CONECTADO - Ejecución real habilitada', 'color: #22c55e; font-weight: bold')
    } else {
      console.log('%c[WorkflowsView] ⚠️ Socket DESCONECTADO - Usando ejecución local', 'color: #f59e0b; font-weight: bold')
    }
  }, [isConnected])

  // Manejar resize de paneles
  useEffect(() => {
    const handleMouseMove = (e) => {
      if (isResizingLeft) {
        const newWidth = Math.max(150, Math.min(400, e.clientX - 60)) // 60px es el sidebar
        setLeftPanelWidth(newWidth)
        localStorage.setItem('alqvimia-left-panel-width', newWidth.toString())
      }
      if (isResizingRight) {
        const newWidth = Math.max(280, Math.min(550, window.innerWidth - e.clientX))
        setRightPanelWidth(newWidth)
        localStorage.setItem('alqvimia-right-panel-width', newWidth.toString())
      }
      if (isResizingToolbar) {
        const delta = e.clientY - toolbarResizeStart.y
        const newHeight = Math.max(40, Math.min(200, toolbarResizeStart.height + delta))
        console.log('Resizing toolbar - delta:', delta, 'newHeight:', newHeight, 'startHeight:', toolbarResizeStart.height)
        setToolbarHeight(newHeight)
        localStorage.setItem('alqvimia-toolbar-height', newHeight.toString())
      }
      if (isResizingStatusBar) {
        const delta = statusBarResizeStart.y - e.clientY // Invertido porque arrastramos hacia arriba
        const newHeight = Math.max(32, Math.min(400, statusBarResizeStart.height + delta))
        setStatusBarHeight(newHeight)
        localStorage.setItem('alqvimia-statusbar-height', newHeight.toString())
      }
    }

    const handleMouseUp = () => {
      setIsResizingLeft(false)
      setIsResizingRight(false)
      setIsResizingToolbar(false)
      setIsResizingStatusBar(false)
      document.body.style.cursor = ''
      document.body.style.userSelect = ''
    }

    if (isResizingLeft || isResizingRight) {
      document.body.style.cursor = 'col-resize'
      document.body.style.userSelect = 'none'
      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)
    }

    if (isResizingToolbar || isResizingStatusBar) {
      document.body.style.cursor = 'row-resize'
      document.body.style.userSelect = 'none'
      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }
  }, [isResizingLeft, isResizingRight, isResizingToolbar, isResizingStatusBar, statusBarResizeStart])

  // Cargar componentes personalizados desde localStorage
  useEffect(() => {
    const loadCustomComponents = () => {
      try {
        const saved = localStorage.getItem('alqvimia-custom-components')
        if (saved) {
          const components = JSON.parse(saved)
          setCustomComponents(components)
          console.log('[WorkflowsView] Componentes personalizados cargados:', components.length)
        }
      } catch (error) {
        console.error('[WorkflowsView] Error cargando componentes personalizados:', error)
      }
    }
    loadCustomComponents()
  }, [])

  // Guardar componentes personalizados en localStorage
  const saveCustomComponents = (components) => {
    try {
      localStorage.setItem('alqvimia-custom-components', JSON.stringify(components))
      setCustomComponents(components)
    } catch (error) {
      console.error('[WorkflowsView] Error guardando componentes personalizados:', error)
    }
  }

  // Agregar un nuevo componente personalizado
  const addCustomComponent = (component) => {
    const existing = customComponents.find(c => c.action === component.action)
    if (!existing) {
      const updated = [...customComponents, component]
      saveCustomComponents(updated)
      console.log('[WorkflowsView] Componente personalizado agregado:', component.label)
      return true
    }
    return false
  }

  // Eliminar un componente personalizado
  const removeCustomComponent = (actionId) => {
    const updated = customComponents.filter(c => c.action !== actionId)
    saveCustomComponents(updated)
  }

  // Obtener categorías incluyendo componentes personalizados
  const getCategories = () => {
    if (customComponents.length > 0) {
      return [
        ...WORKFLOW_CATEGORIES,
        {
          ...CUSTOM_COMPONENTS_CATEGORY,
          actions: customComponents
        }
      ]
    }
    return WORKFLOW_CATEGORIES
  }

  // Cargar último workflow al montar
  useEffect(() => {
    const loadLastWorkflow = () => {
      const lastWorkflowId = localStorage.getItem('alqvimia-last-workflow-id')
      if (lastWorkflowId) {
        const saved = JSON.parse(localStorage.getItem('alqvimia-workflows') || '[]')
        const workflow = saved.find(w => w.id === lastWorkflowId)
        if (workflow) {
          setCurrentWorkflowId(workflow.id)
          setWorkflowName(workflow.name)
          setWorkflowSteps(workflow.steps || workflow.actions || [])
          setVariables(workflow.variables || [])
          console.log('[WorkflowsView] Último workflow cargado:', workflow.name)
        }
      }
    }
    loadLastWorkflow()
  }, [])

  // Guardar referencia al workflow actual cuando cambia
  useEffect(() => {
    if (currentWorkflowId) {
      localStorage.setItem('alqvimia-last-workflow-id', currentWorkflowId)
    }
  }, [currentWorkflowId])

  // Inicializar reconocimiento de voz
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition()
      recognitionRef.current.continuous = true
      recognitionRef.current.interimResults = true
      recognitionRef.current.lang = 'es-ES'

      recognitionRef.current.onresult = (event) => {
        let interimTranscript = ''
        let finalTranscript = ''

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript
          if (event.results[i].isFinal) {
            finalTranscript += transcript
          } else {
            interimTranscript += transcript
          }
        }

        // Mostrar transcripción en tiempo real
        setVoiceTranscript(interimTranscript || finalTranscript)

        // Modo dictado: insertar texto en el campo IA
        if (voiceMode === 'dictation') {
          setDictationBuffer(interimTranscript)
          if (finalTranscript) {
            // Insertar texto en el prompt de IA
            setAIPrompt(prev => prev + (prev ? ' ' : '') + finalTranscript)
            setDictationBuffer('')
          }
        } else {
          // Modo comando: procesar comandos de voz
          if (finalTranscript) {
            processVoiceCommand(finalTranscript.toLowerCase().trim())
          }
        }
      }

      recognitionRef.current.onerror = (event) => {
        console.error('Speech recognition error:', event.error)
        setIsListening(false)
      }
      recognitionRef.current.onend = () => {
        if (isListening) recognitionRef.current.start()
      }
    } else {
      setVoiceSupported(false)
    }

    return () => recognitionRef.current?.stop()
  }, [isListening, voiceMode])

  // Procesar comandos de voz para workflows
  const processVoiceCommand = useCallback((command) => {
    // Comandos de archivo
    if (command.includes('nuevo workflow') || command.includes('nuevo flujo')) {
      newWorkflow()
      speak('Nuevo workflow creado')
    } else if (command.includes('guardar') || command.includes('save')) {
      saveWorkflow()
      speak('Workflow guardado')
    } else if (command.includes('importar')) {
      importWorkflow()
      speak('Abriendo importación')
    } else if (command.includes('exportar')) {
      exportWorkflow()
      speak('Exportando workflow')
    }
    // Comandos de debug
    else if (command.includes('iniciar debug') || command.includes('debug')) {
      startDebug()
      speak('Iniciando debug')
    } else if (command.includes('continuar') || command.includes('continue')) {
      continueDebug()
      speak('Continuando')
    } else if (command.includes('paso') || command.includes('step')) {
      stepOver()
      speak('Siguiente paso')
    } else if (command.includes('detener') || command.includes('stop')) {
      stopDebug()
      speak('Debug detenido')
    }
    // Comandos de generación
    else if (command.includes('generar con ia') || command.includes('generate')) {
      setShowAIModal(true)
      speak('Abriendo generador de IA')
    } else if (command.includes('migrar')) {
      setShowMigrateModal(true)
      speak('Abriendo migración')
    } else if (command.includes('cargar código') || command.includes('editor')) {
      setShowCodeEditorModal(true)
      speak('Abriendo editor de código')
    }
    // Comandos de vista
    else if (command.includes('vista lista') || command.includes('list view')) {
      setViewMode('list')
      speak('Vista de lista')
    } else if (command.includes('vista flujo') || command.includes('flow view')) {
      setViewMode('flow')
      speak('Vista de flujo')
    } else if (command.includes('panel izquierdo') || command.includes('left panel')) {
      setLeftPanelCollapsed(!leftPanelCollapsed)
      speak(leftPanelCollapsed ? 'Panel izquierdo expandido' : 'Panel izquierdo colapsado')
    } else if (command.includes('panel derecho') || command.includes('right panel')) {
      setRightPanelCollapsed(!rightPanelCollapsed)
      speak(rightPanelCollapsed ? 'Panel derecho expandido' : 'Panel derecho colapsado')
    }
    // Comando de ayuda
    else if (command.includes('ayuda') || command.includes('help')) {
      speak('Comandos disponibles: nuevo workflow, guardar, importar, exportar, debug, continuar, paso, detener, generar con IA, migrar, cargar código, vista lista, vista flujo, panel izquierdo, panel derecho, y ayuda.')
    }
  }, [leftPanelCollapsed, rightPanelCollapsed])

  const speak = (text) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text)
      utterance.lang = 'es-ES'
      utterance.rate = 1.1
      speechSynthesis.speak(utterance)
    }
  }

  const toggleVoiceListening = (mode = 'command') => {
    if (isListening) {
      recognitionRef.current?.stop()
      setIsListening(false)
      setVoiceTranscript('')
      setDictationBuffer('')
    } else {
      setVoiceMode(mode)
      recognitionRef.current?.start()
      setIsListening(true)
      if (mode === 'dictation') {
        speak('Modo dictado activado. Empieza a dictar.')
      } else {
        speak('Escuchando comandos de voz')
      }
    }
  }

  // Toggle dictado específico para el modal de IA
  const toggleAIDictation = () => {
    if (isListening && voiceMode === 'dictation') {
      recognitionRef.current?.stop()
      setIsListening(false)
      setVoiceTranscript('')
      setDictationBuffer('')
    } else {
      if (isListening) {
        // Si estaba en modo comando, cambiar a dictado
        recognitionRef.current?.stop()
      }
      setVoiceMode('dictation')
      setDictationTarget('aiPrompt')
      setTimeout(() => {
        recognitionRef.current?.start()
        setIsListening(true)
        speak('Dictando al prompt de IA')
      }, 100)
    }
  }

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return

      if (e.key === 'Delete' && selectedStep) {
        e.preventDefault()
        deleteStep(selectedStep.id)
      }
      if (e.ctrlKey && e.key === 'c' && selectedStep) {
        e.preventDefault()
        setClipboard({ ...selectedStep, id: null })
      }
      if (e.ctrlKey && e.key === 'v' && clipboard) {
        e.preventDefault()
        pasteStep()
      }
      if (e.ctrlKey && e.key === 'd' && selectedStep) {
        e.preventDefault()
        duplicateStep(selectedStep)
      }
      if (e.key === 'Escape') {
        setSelectedStep(null)
        setContextMenu(null)
      }
      if (e.key === 'F9' && selectedStep) {
        e.preventDefault()
        toggleBreakpoint(selectedStep.id)
      }
      if (e.key === 'F5') {
        e.preventDefault()
        if (isDebugging) continueDebug()
        else startDebug()
      }
      if (e.key === 'F10' && isDebugging) {
        e.preventDefault()
        stepOver()
      }
    }

    const handleClick = () => setContextMenu(null)
    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('click', handleClick)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('click', handleClick)
    }
  }, [selectedStep, clipboard, workflowSteps, isDebugging])

  const toggleBreakpoint = (stepId) => {
    setBreakpoints(prev => {
      const newSet = new Set(prev)
      if (newSet.has(stepId)) newSet.delete(stepId)
      else newSet.add(stepId)
      return newSet
    })
  }

  const flattenSteps = (steps) => steps.reduce((acc, step) => {
    acc.push(step)
    if (step.children) acc.push(...flattenSteps(step.children))
    return acc
  }, [])

  const startDebug = () => {
    if (workflowSteps.length === 0) return
    setIsDebugging(true)
    setCurrentDebugStep(workflowSteps[0]?.id)
  }

  const continueDebug = () => {
    const flatSteps = flattenSteps(workflowSteps)
    const currentIndex = flatSteps.findIndex(s => s.id === currentDebugStep)
    for (let i = currentIndex + 1; i < flatSteps.length; i++) {
      if (breakpoints.has(flatSteps[i].id)) {
        setCurrentDebugStep(flatSteps[i].id)
        return
      }
    }
    setIsDebugging(false)
    setCurrentDebugStep(null)
  }

  const stepOver = () => {
    const flatSteps = flattenSteps(workflowSteps)
    const currentIndex = flatSteps.findIndex(s => s.id === currentDebugStep)
    if (currentIndex < flatSteps.length - 1) setCurrentDebugStep(flatSteps[currentIndex + 1].id)
    else { setIsDebugging(false); setCurrentDebugStep(null) }
  }

  const stopDebug = () => { setIsDebugging(false); setCurrentDebugStep(null) }

  const showContextMenu = (e, step) => {
    e.preventDefault()
    e.stopPropagation()
    setContextMenu({ x: e.clientX, y: e.clientY, step })
    setSelectedStep(step)
  }

  const handleAddVariable = (variable) => setVariables(prev => [...prev, variable])
  const handleUpdateVariable = (varId, updates) => setVariables(prev => prev.map(v => v.id === varId ? { ...v, ...updates } : v))
  const handleDeleteVariable = (varId) => setVariables(prev => prev.filter(v => v.id !== varId))

  const toggleCategory = (categoryId) => setExpandedCategories(prev => ({ ...prev, [categoryId]: !prev[categoryId] }))
  const toggleStepExpanded = (stepId) => setExpandedSteps(prev => ({ ...prev, [stepId]: !prev[stepId] }))

  const handleDragStart = (e, action) => e.dataTransfer.setData('action', JSON.stringify(action))

  const handleDrop = (e, parentId = null, index = null) => {
    e.preventDefault()
    e.stopPropagation()
    try {
      const actionData = JSON.parse(e.dataTransfer.getData('action'))
      const newStep = { id: Date.now(), ...actionData, params: {}, children: actionData.isContainer ? [] : undefined }
      if (parentId) setWorkflowSteps(prev => addToParent(prev, parentId, newStep, index))
      else {
        if (index !== null) {
          const newSteps = [...workflowSteps]
          newSteps.splice(index, 0, newStep)
          setWorkflowSteps(newSteps)
        } else setWorkflowSteps([...workflowSteps, newStep])
      }
      if (actionData.isContainer) setExpandedSteps(prev => ({ ...prev, [newStep.id]: true }))
    } catch (err) { console.error('Error al agregar acción:', err) }
  }

  const addToParent = (steps, parentId, newStep, index) => steps.map(step => {
    if (step.id === parentId) {
      const children = step.children || []
      if (index !== null) { const nc = [...children]; nc.splice(index, 0, newStep); return { ...step, children: nc } }
      return { ...step, children: [...children, newStep] }
    }
    if (step.children) return { ...step, children: addToParent(step.children, parentId, newStep, index) }
    return step
  })

  const handleDragOver = (e) => e.preventDefault()
  const selectStep = (step, e) => { if (e) e.stopPropagation(); setSelectedStep(step) }

  const deleteStep = (stepId) => {
    setWorkflowSteps(prev => removeStep(prev, stepId))
    if (selectedStep?.id === stepId) setSelectedStep(null)
    breakpoints.delete(stepId)
  }

  const removeStep = (steps, stepId) => steps.filter(s => s.id !== stepId).map(s => s.children ? { ...s, children: removeStep(s.children, stepId) } : s)

  // Funciones para drag & drop de reordenamiento
  const handleStepDragStart = (e, step) => {
    e.stopPropagation()
    setDraggedStep(step)
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setData('stepId', step.id.toString())
  }

  const handleStepDragOver = (e, step, position) => {
    e.preventDefault()
    e.stopPropagation()
    if (!draggedStep || draggedStep.id === step.id) return
    setDragOverStep(step.id)
    setDragPosition(position)
  }

  const handleStepDragLeave = (e) => {
    e.preventDefault()
    setDragOverStep(null)
    setDragPosition(null)
  }

  const handleStepDrop = (e, targetStep) => {
    e.preventDefault()
    e.stopPropagation()
    if (!draggedStep || draggedStep.id === targetStep.id) {
      setDraggedStep(null)
      setDragOverStep(null)
      setDragPosition(null)
      return
    }

    const newSteps = [...workflowSteps]
    const draggedIndex = newSteps.findIndex(s => s.id === draggedStep.id)
    const targetIndex = newSteps.findIndex(s => s.id === targetStep.id)

    if (draggedIndex !== -1 && targetIndex !== -1) {
      // Remover el paso arrastrado
      const [removed] = newSteps.splice(draggedIndex, 1)
      // Calcular nuevo índice
      const insertIndex = dragPosition === 'before'
        ? (draggedIndex < targetIndex ? targetIndex - 1 : targetIndex)
        : (draggedIndex < targetIndex ? targetIndex : targetIndex + 1)
      // Insertar en la nueva posición
      newSteps.splice(insertIndex, 0, removed)
      setWorkflowSteps(newSteps)
    }

    setDraggedStep(null)
    setDragOverStep(null)
    setDragPosition(null)
  }

  const handleStepDragEnd = () => {
    setDraggedStep(null)
    setDragOverStep(null)
    setDragPosition(null)
  }

  // Mover paso hacia arriba
  const moveStepUp = (stepId) => {
    const index = workflowSteps.findIndex(s => s.id === stepId)
    if (index > 0) {
      const newSteps = [...workflowSteps]
      const [removed] = newSteps.splice(index, 1)
      newSteps.splice(index - 1, 0, removed)
      setWorkflowSteps(newSteps)
    }
  }

  // Mover paso hacia abajo
  const moveStepDown = (stepId) => {
    const index = workflowSteps.findIndex(s => s.id === stepId)
    if (index < workflowSteps.length - 1) {
      const newSteps = [...workflowSteps]
      const [removed] = newSteps.splice(index, 1)
      newSteps.splice(index + 1, 0, removed)
      setWorkflowSteps(newSteps)
    }
  }

  // Efecto para actualizar el tiempo del MessageBox
  useEffect(() => {
    let interval
    if (showMessageBox && messageBoxStartTime) {
      interval = setInterval(() => {
        setMessageBoxElapsed(Math.floor((Date.now() - messageBoxStartTime) / 1000))
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [showMessageBox, messageBoxStartTime])

  // Función para mostrar MessageBox estilo Windows
  const showWindowsMessageBox = (title, message, type = 'info') => {
    setMessageBoxContent({ title, message, type })
    setMessageBoxStartTime(Date.now())
    setMessageBoxElapsed(0)
    setShowMessageBox(true)
  }

  // Función para cerrar MessageBox
  const closeMessageBox = () => {
    setShowMessageBox(false)
    setMessageBoxStartTime(null)
    setMessageBoxElapsed(0)
  }

  // Formatear tiempo transcurrido
  const formatElapsedTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const duplicateStep = (step) => {
    const duplicate = JSON.parse(JSON.stringify(step))
    duplicate.id = Date.now()
    if (duplicate.children) duplicate.children = duplicate.children.map(c => ({ ...c, id: Date.now() + Math.random() }))
    const stepIndex = workflowSteps.findIndex(s => s.id === step.id)
    const newSteps = [...workflowSteps]
    newSteps.splice(stepIndex + 1, 0, duplicate)
    setWorkflowSteps(newSteps)
    setSelectedStep(duplicate)
  }

  const pasteStep = () => {
    if (!clipboard) return
    const newStep = { ...clipboard, id: Date.now() }
    if (newStep.children) newStep.children = newStep.children.map(c => ({ ...c, id: Date.now() + Math.random() }))
    if (selectedStep) {
      const stepIndex = workflowSteps.findIndex(s => s.id === selectedStep.id)
      const newSteps = [...workflowSteps]
      newSteps.splice(stepIndex + 1, 0, newStep)
      setWorkflowSteps(newSteps)
    } else setWorkflowSteps([...workflowSteps, newStep])
    setSelectedStep(newStep)
  }

  const handleUpdateStep = useCallback((stepId, updates) => {
    const updateInTree = (steps) => steps.map(step => {
      if (step.id === stepId) return { ...step, ...updates }
      if (step.children) return { ...step, children: updateInTree(step.children) }
      return step
    })
    setWorkflowSteps(prev => updateInTree(prev))
    if (selectedStep?.id === stepId) setSelectedStep(prev => ({ ...prev, ...updates }))
  }, [selectedStep])

  const newWorkflow = () => { setWorkflowName('Nuevo Workflow'); setWorkflowSteps([]); setSelectedStep(null); setExpandedSteps({}); setBreakpoints(new Set()); setVariables([]); setCurrentWorkflowId(null) }

  const saveWorkflow = () => {
    setShowSaveModal(true)
  }

  // Preview del workflow
  const previewWorkflow = () => {
    setShowPreviewModal(true)
  }

  // Validar propiedades de los pasos antes de ejecutar
  const validateWorkflowSteps = () => {
    const errors = []

    workflowSteps.forEach((step, index) => {
      const actionConfig = getActionProperties(step.action)
      if (!actionConfig || !actionConfig.fields) return

      const stepErrors = []

      actionConfig.fields.forEach(field => {
        if (field.required) {
          const value = step.params?.[field.key]
          const isEmpty = value === undefined || value === null || value === ''

          if (isEmpty) {
            stepErrors.push({
              field: field.key,
              label: field.label,
              message: `El campo "${field.label}" es requerido`
            })
          } else if (field.type === 'url' && value) {
            // Validar formato de URL
            try {
              new URL(value)
            } catch {
              stepErrors.push({
                field: field.key,
                label: field.label,
                message: `"${value}" no es una URL válida. Debe incluir http:// o https://`
              })
            }
          } else if (field.type === 'email' && value) {
            // Validar formato de email
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
            if (!emailRegex.test(value)) {
              stepErrors.push({
                field: field.key,
                label: field.label,
                message: `"${value}" no es un email válido`
              })
            }
          } else if (field.type === 'number' && value !== undefined) {
            const numValue = Number(value)
            if (isNaN(numValue)) {
              stepErrors.push({
                field: field.key,
                label: field.label,
                message: `"${value}" debe ser un número`
              })
            } else if (field.min !== undefined && numValue < field.min) {
              stepErrors.push({
                field: field.key,
                label: field.label,
                message: `El valor mínimo es ${field.min}`
              })
            } else if (field.max !== undefined && numValue > field.max) {
              stepErrors.push({
                field: field.key,
                label: field.label,
                message: `El valor máximo es ${field.max}`
              })
            }
          }
        }
      })

      if (stepErrors.length > 0) {
        errors.push({
          stepIndex: index,
          stepNumber: index + 1,
          stepLabel: step.label || step.action,
          stepIcon: step.icon || 'fa-cog',
          action: step.action,
          errors: stepErrors
        })
      }
    })

    return errors
  }

  // Ir al paso con error y seleccionarlo
  const goToErrorStep = (stepIndex) => {
    const step = workflowSteps[stepIndex]
    if (step) {
      setSelectedStep(step)
      setRightPanelTab('properties')
      setRightPanelCollapsed(false)
      setShowValidationModal(false)
    }
  }

  // Ejecutar workflow con barra de progreso
  const executeWorkflow = async () => {
    if (workflowSteps.length === 0) return

    // Validar propiedades antes de ejecutar
    const errors = validateWorkflowSteps()
    if (errors.length > 0) {
      setValidationErrors(errors)
      setShowValidationModal(true)
      return
    }

    // Cerrar modal de preview si está abierto
    setShowPreviewModal(false)

    // Minimizar la ventana de Alqvimia (enviar al fondo)
    try {
      if (window.electronAPI && window.electronAPI.minimizeWindow) {
        window.electronAPI.minimizeWindow()
      } else if (window.require) {
        const { ipcRenderer } = window.require('electron')
        ipcRenderer.send('minimize-window')
      }
    } catch (e) {
      window.blur()
      console.log('Ejecutando workflow - ventana minimizada')
    }

    setIsExecuting(true)
    setShowExecutionBar(true)
    setExecutionProgress(0)

    // ========================================================
    // EJECUCIÓN VIA SOCKET (Backend con Playwright)
    // ========================================================
    console.log('%c[Workflow] ==================== INICIO EJECUCIÓN ====================', 'color: #a855f7; font-weight: bold; font-size: 14px')
    console.log('[Workflow] Estado Socket:', {
      socketExists: !!socket,
      isConnected,
      socketConnected: socket?.connected,
      socketId: socket?.id
    })

    if (socket && isConnected) {
      console.log('%c[Workflow] 🚀 Ejecutando via Socket.IO (backend con Playwright)', 'color: #22c55e; font-weight: bold')

      // Conectar si no está conectado
      if (!socket.connected) {
        console.log('[Workflow] Socket no conectado, reconectando...')
        connect()
        await new Promise(resolve => setTimeout(resolve, 500))
      }

      // Preparar workflow para enviar al backend
      const workflowData = {
        workflow: {
          id: currentWorkflowId || `wf_${Date.now()}`,
          name: workflowName,
          actions: workflowSteps.map(step => ({
            type: step.action,
            label: step.label,
            properties: step.params || {},
            params: step.params || {}
          })),
          variables: variables.map(v => ({
            name: v.name,
            value: v.value,
            type: v.type
          }))
        }
      }

      console.log('%c[Workflow] 📤 Enviando workflow al backend:', 'color: #3b82f6; font-weight: bold')
      console.log('[Workflow] Workflow:', JSON.stringify(workflowData, null, 2))

      // Crear promesa para esperar resultado
      const executionPromise = new Promise((resolve, reject) => {
        const handleStarted = (data) => {
          console.log('%c[Workflow] 🎬 Ejecución INICIADA en backend:', 'color: #22c55e; font-weight: bold', data)
        }

        const handleStep = (data) => {
          console.log('%c[Workflow] 📍 Paso ejecutándose:', 'color: #8b5cf6', data)
          setExecutionCurrentStep({ label: data.action?.label || `Paso ${data.step}`, action: data.action?.type })
          setExecutionProgress(Math.round((data.step / data.totalSteps) * 100))
        }

        const handleLog = (data) => {
          const { log } = data
          if (log.type === 'success') {
            console.log(`%c[Workflow] ✅ ${log.message}`, 'color: #34d399; font-weight: bold')
          } else if (log.type === 'error') {
            console.error(`%c[Workflow] ❌ ${log.message}`, 'color: #f87171; font-weight: bold')
          } else if (log.type === 'warning') {
            console.warn(`%c[Workflow] ⚠️ ${log.message}`, 'color: #fbbf24')
          } else {
            console.log(`%c[Workflow] ℹ️ ${log.message}`, 'color: #60a5fa')
          }
        }

        const handleCompleted = (data) => {
          console.log('%c[Workflow] 🏁 Ejecución COMPLETADA:', 'color: #22c55e; font-weight: bold; font-size: 14px', data)
          cleanup()
          resolve(data)
        }

        const handleError = (data) => {
          console.error('%c[Workflow] 💥 ERROR de ejecución:', 'color: #ef4444; font-weight: bold; font-size: 14px', data)
          cleanup()
          reject(new Error(data.message || 'Error desconocido'))
        }

        const cleanup = () => {
          socket.off('executor:started', handleStarted)
          socket.off('executor:step', handleStep)
          socket.off('executor:log', handleLog)
          socket.off('executor:completed', handleCompleted)
          socket.off('executor:error', handleError)
        }

        // Registrar listeners
        console.log('[Workflow] Registrando listeners de eventos...')
        socket.on('executor:started', handleStarted)
        socket.on('executor:step', handleStep)
        socket.on('executor:log', handleLog)
        socket.on('executor:completed', handleCompleted)
        socket.on('executor:error', handleError)

        // Timeout de 5 minutos
        setTimeout(() => {
          console.error('[Workflow] ⏰ TIMEOUT - La ejecución tardó más de 5 minutos')
          cleanup()
          reject(new Error('Timeout: La ejecución tardó demasiado'))
        }, 300000)
      })

      // Enviar comando de ejecución
      console.log('[Workflow] Emitiendo evento executor:run...')
      socket.emit('executor:run', workflowData)
      console.log('[Workflow] Evento emitido, esperando respuesta del backend...')

      try {
        const result = await executionPromise
        setIsExecuting(false)
        setExecutionCurrentStep(null)
        setExecutionProgress(100)
        setTimeout(() => setShowExecutionBar(false), 2000)
        showWindowsMessageBox('Workflow Completado', `El workflow "${workflowName}" se ha ejecutado correctamente.\n\nDuración: ${result.duration}ms`, 'success')
      } catch (error) {
        setIsExecuting(false)
        setExecutionCurrentStep(null)
        setTimeout(() => setShowExecutionBar(false), 2000)
        showWindowsMessageBox('Error de Ejecución', `Error: ${error.message}`, 'error')
      }
      return
    }

    // ========================================================
    // EJECUCIÓN LOCAL (Fallback sin Socket)
    // ========================================================
    console.log('%c[Workflow] ⚠️ Ejecutando LOCALMENTE (sin backend)', 'color: #f59e0b; font-weight: bold; font-size: 14px')
    console.log('[Workflow] Razón: Socket no disponible o no conectado')
    console.log('[Workflow] NOTA: Acciones de navegador (browser_open, navigate, etc.) solo se simularán')
    console.log('[Workflow] Para ejecución real, asegúrate de que el servidor esté corriendo: cd server && npm start')

    // Esperar 1 segundo antes de iniciar la ejecución
    await new Promise(resolve => setTimeout(resolve, 1000))

    // Ejecutar el workflow paso a paso
    for (let i = 0; i < workflowSteps.length; i++) {
      console.log(`%c[Workflow] 📍 Paso ${i + 1}/${workflowSteps.length}: ${workflowSteps[i].label}`, 'color: #8b5cf6')
      setExecutionCurrentStep(workflowSteps[i])
      setExecutionProgress(Math.round(((i + 1) / workflowSteps.length) * 100))

      // Ejecutar la acción del paso actual
      await executeStep(workflowSteps[i])

      // Pequeña pausa entre pasos
      await new Promise(resolve => setTimeout(resolve, 300))
    }

    setIsExecuting(false)
    setExecutionCurrentStep(null)
    setTimeout(() => setShowExecutionBar(false), 2000)
    console.log('%c[Workflow] ==================== FIN EJECUCIÓN ====================', 'color: #a855f7; font-weight: bold; font-size: 14px')

    // Mostrar mensaje de completado
    showWindowsMessageBox('Workflow Completado', `El workflow "${workflowName}" se ha ejecutado correctamente.\n\n⚠️ Nota: Ejecutado en modo local (simulación)`, 'success')
  }

  // Resolver todas las variables en los parámetros de un paso
  const resolveStepParams = (params) => {
    if (!params) return {}

    const resolved = {}
    for (const [key, value] of Object.entries(params)) {
      if (typeof value === 'string') {
        // Resolver variables ${...} en strings
        resolved[key] = resolveVariables(value, variables)
      } else if (typeof value === 'object' && value !== null) {
        // Recursivamente resolver en objetos/arrays
        resolved[key] = Array.isArray(value)
          ? value.map(v => typeof v === 'string' ? resolveVariables(v, variables) : v)
          : resolveStepParams(value)
      } else {
        resolved[key] = value
      }
    }
    return resolved
  }

  // Ejecutar un paso individual del workflow
  const executeStep = async (step) => {
    // Resolver variables en los parámetros del paso
    const resolvedParams = resolveStepParams(step.params)

    // Simular ejecución según el tipo de acción
    const actionTime = {
      'delay': resolvedParams?.duration || 1000,
      'message_box': 0, // El message box tiene su propio timing
      'click': 500,
      'type': 800,
      'navigate': 1000,
      'wait_element': 1500,
      'screenshot': 500,
      'default': 500
    }

    const delay = actionTime[step.action] || actionTime['default']

    // ============================================================
    // SISTEMA DE LOGGING DETALLADO
    // ============================================================
    const timestamp = new Date().toLocaleTimeString('es-ES', { hour12: false })
    const logPrefix = `[${timestamp}] [Workflow]`

    const log = {
      info: (msg, data = null) => {
        console.log(`%c${logPrefix} ℹ️ ${msg}`, 'color: #60a5fa; font-weight: bold', data || '')
      },
      success: (msg, data = null) => {
        console.log(`%c${logPrefix} ✅ ${msg}`, 'color: #34d399; font-weight: bold', data || '')
      },
      error: (msg, data = null) => {
        console.error(`%c${logPrefix} ❌ ${msg}`, 'color: #f87171; font-weight: bold', data || '')
      },
      warn: (msg, data = null) => {
        console.warn(`%c${logPrefix} ⚠️ ${msg}`, 'color: #fbbf24; font-weight: bold', data || '')
      },
      action: (msg, data = null) => {
        console.log(`%c${logPrefix} 🚀 ${msg}`, 'color: #a78bfa; font-weight: bold', data || '')
      },
      variable: (name, value) => {
        console.log(`%c${logPrefix} 📦 Variable guardada: ${name} = "${value}"`, 'color: #38bdf8')
      },
      api: (endpoint, data = null) => {
        console.log(`%c${logPrefix} 🌐 API Call: ${endpoint}`, 'color: #fb923c', data || '')
      }
    }

    // Log inicial del paso
    console.group(`%c${logPrefix} Ejecutando paso: ${step.label || step.action}`, 'color: #e879f9; font-weight: bold; font-size: 12px')
    log.info('Acción:', step.action)
    log.info('ID del paso:', step.id)
    log.info('Parámetros originales:', step.params)
    log.info('Parámetros resueltos:', resolvedParams)
    if (step.isCustomAction) {
      log.warn('Este es un componente personalizado (IA)')
    }

    // Helper para guardar variable con logging
    const saveVariable = (varName, value, type = 'string') => {
      log.variable(varName, typeof value === 'string' ? value.substring(0, 100) : value)
      setVariables(prev => {
        const existing = prev.findIndex(v => v.name === varName)
        if (existing >= 0) {
          const updated = [...prev]
          updated[existing] = { ...updated[existing], value }
          return updated
        }
        return [...prev, { name: varName, type, value }]
      })
    }

    // ============================================================
    // ACCIONES DE WINDOWS / SISTEMA (Conectan con Backend)
    // ============================================================

    // Seleccionar Carpeta (Diálogo NATIVO de Windows via Backend)
    if (step.action === 'select_folder') {
      log.action('Iniciando selección de carpeta (diálogo nativo Windows)...')
      const title = resolvedParams?.title || 'Seleccione una carpeta'
      const variableName = resolvedParams?.variable || 'carpeta'
      const initialDirectory = resolvedParams?.initialDirectory || ''
      log.info('Título del diálogo:', title)
      log.info('Variable destino:', variableName)
      log.api('/api/system/select-folder', { title, initialDirectory })

      try {
        const result = await systemService.selectFolder(title, initialDirectory)

        if (result.success && !result.cancelled && result.path) {
          saveVariable(variableName, result.path)
          log.success(`Carpeta seleccionada: ${result.path}`)
          log.variable(variableName, result.path)
          showWindowsMessageBox('Carpeta Seleccionada', `Se seleccionó: ${result.path}\n\nVariable: ${variableName}`, 'success')
          await new Promise(resolve => setTimeout(resolve, 1500))
        } else if (result.cancelled) {
          log.warn('Usuario canceló la selección de carpeta')
          showWindowsMessageBox('Cancelado', 'No se seleccionó ninguna carpeta', 'warning')
          await new Promise(resolve => setTimeout(resolve, 1000))
        } else {
          log.error('Error al seleccionar carpeta:', result.error || 'Error desconocido')
          showWindowsMessageBox('Error', 'No se pudo seleccionar la carpeta', 'error')
          await new Promise(resolve => setTimeout(resolve, 1500))
        }
      } catch (error) {
        log.error('Error de conexión al seleccionar carpeta:', error.message)
        // Fallback a prompt si el backend no está disponible
        log.warn('Usando fallback (prompt manual)...')
        const folderPath = prompt(title, 'C:\\Users\\')
        if (folderPath) {
          saveVariable(variableName, folderPath)
          log.success(`Ruta ingresada manualmente: ${folderPath}`)
          showWindowsMessageBox('Carpeta Ingresada', `Ruta: ${folderPath}\n\nVariable: ${variableName}`, 'success')
          await new Promise(resolve => setTimeout(resolve, 1000))
        } else {
          log.warn('Usuario canceló la entrada manual')
        }
      }
    }
    // Seleccionar Archivo (Diálogo NATIVO de Windows via Backend)
    else if (step.action === 'select_file') {
      log.action('Iniciando selección de archivo (diálogo nativo Windows)...')
      const title = resolvedParams?.title || 'Seleccione un archivo'
      const variableName = resolvedParams?.variable || 'archivo'
      const filter = resolvedParams?.filter || 'Todos los archivos (*.*)|*.*'
      const initialDirectory = resolvedParams?.initialDirectory || ''
      const multiSelect = resolvedParams?.multiSelect || false
      log.info('Título:', title)
      log.info('Variable destino:', variableName)
      log.info('Filtro:', filter)
      log.api('/api/system/select-file', { title, filter, initialDirectory, multiSelect })

      try {
        const result = await systemService.selectFile({ title, filter, initialDirectory, multiSelect })

        if (result.success && !result.cancelled && result.path) {
          const selectedPath = Array.isArray(result.path) ? result.path.join('; ') : result.path
          saveVariable(variableName, result.path)
          log.success(`Archivo seleccionado: ${selectedPath}`)
          log.variable(variableName, result.path)
          showWindowsMessageBox('Archivo Seleccionado', `Archivo: ${selectedPath}\n\nVariable: ${variableName}`, 'success')
          await new Promise(resolve => setTimeout(resolve, 1000))
        } else if (result.cancelled) {
          log.warn('Usuario canceló la selección de archivo')
          showWindowsMessageBox('Cancelado', 'No se seleccionó ningún archivo', 'warning')
          await new Promise(resolve => setTimeout(resolve, 1000))
        } else {
          log.error('Error al seleccionar archivo:', result.error || 'Error desconocido')
        }
      } catch (error) {
        log.error('Error de conexión al seleccionar archivo:', error.message)
        // Fallback a prompt
        log.warn('Usando fallback (prompt manual)...')
        const filePath = prompt(title, '')
        if (filePath) {
          saveVariable(variableName, filePath)
          log.success(`Archivo ingresado manualmente: ${filePath}`)
          showWindowsMessageBox('Archivo Ingresado', `Ruta: ${filePath}\n\nVariable: ${variableName}`, 'success')
          await new Promise(resolve => setTimeout(resolve, 1000))
        } else {
          log.warn('Usuario canceló la entrada manual')
        }
      }
    }
    // Iniciar Proceso / Abrir Explorador (EJECUTA EN BACKEND)
    else if (step.action === 'process_start' || step.action === 'open_folder' || step.action === 'open_explorer') {
      log.action('Abriendo explorador/proceso...')
      const command = resolvedParams?.command || resolvedParams?.path || ''
      log.info('Comando/Ruta:', command)
      log.api('/api/system/open', { path: command, type: 'folder' })

      try {
        const result = await systemService.open(command, 'folder')
        if (result.success) {
          log.success(`Explorador abierto: ${command}`)
          showWindowsMessageBox('Explorador Abierto', `Se abrió: ${command}`, 'success')
        } else {
          log.error('Error del backend:', result.error)
          showWindowsMessageBox('Error', `No se pudo abrir: ${result.error}`, 'error')
        }
      } catch (error) {
        log.error('Error de conexión con backend:', error.message)
        showWindowsMessageBox('Error de Conexión', `No se pudo conectar con el backend.\n\n${error.message}`, 'error')
      }
      await new Promise(resolve => setTimeout(resolve, 1000))
    }
    // Ejecutar PowerShell (EJECUTA EN BACKEND)
    else if (step.action === 'run_powershell' || step.action === 'powershell_execute') {
      log.action('Ejecutando PowerShell...')
      const script = resolvedParams?.script || resolvedParams?.command || ''
      const variableName = resolvedParams?.outputVariable || resolvedParams?.variable || 'resultado'
      log.info('Script:', script)
      log.info('Variable destino:', variableName)
      log.api('/api/system/powershell', { script })
      showWindowsMessageBox('PowerShell', `Ejecutando script...\n\n${script.substring(0, 100)}...`, 'info')

      try {
        const result = await systemService.executePowerShell(script)

        if (result.success) {
          const output = result.output || ''
          saveVariable(variableName, output)
          log.success('PowerShell ejecutado correctamente')
          log.info('Output:', output.substring(0, 500))
          showWindowsMessageBox('PowerShell - Completado', `Resultado guardado en: ${variableName}\n\nValor: ${output.substring(0, 200)}${output.length > 200 ? '...' : ''}`, 'success')
        } else {
          log.error('Error en PowerShell:', result.error)
          showWindowsMessageBox('Error PowerShell', result.error, 'error')
        }
      } catch (error) {
        log.error('Error de conexión:', error.message)
        showWindowsMessageBox('Error de Conexión', `No se pudo conectar con el backend.\n\nAsegúrese de que el servidor esté ejecutándose.`, 'error')
      }
      await new Promise(resolve => setTimeout(resolve, 1500))
    }
    // Ejecutar Comando CMD (EJECUTA EN BACKEND)
    else if (step.action === 'run_command' || step.action === 'cmd_execute') {
      log.action('Ejecutando comando CMD...')
      const command = resolvedParams?.command || ''
      const variableName = resolvedParams?.outputVariable || 'cmdResult'
      log.info('Comando:', command)
      log.info('Variable destino:', variableName)
      log.api('/api/system/cmd', { command })

      try {
        const result = await systemService.executeCmd(command)

        if (result.success) {
          saveVariable(variableName, result.output)
          log.success('CMD ejecutado correctamente')
          log.info('Output:', result.output.substring(0, 300))
          showWindowsMessageBox('CMD - Completado', `Comando ejecutado correctamente.\n\nResultado: ${result.output.substring(0, 200)}`, 'success')
        } else {
          log.error('Error en CMD:', result.error)
          showWindowsMessageBox('Error CMD', result.error, 'error')
        }
      } catch (error) {
        log.error('Error de conexión:', error.message)
        showWindowsMessageBox('Error de Conexión', `No se pudo ejecutar el comando.\n\n${error.message}`, 'error')
      }
      await new Promise(resolve => setTimeout(resolve, 1000))
    }
    // Listar Archivos de Carpeta (EJECUTA EN BACKEND)
    else if (step.action === 'folder_list' || step.action === 'list_files') {
      log.action('Listando archivos de carpeta...')
      const folderPath = resolvedParams?.path || resolvedParams?.folder || ''
      const variableName = resolvedParams?.variable || 'archivos'
      const pattern = resolvedParams?.pattern || '*'
      const recursive = resolvedParams?.recursive || false
      log.info('Carpeta:', folderPath)
      log.info('Patrón:', pattern)
      log.info('Recursivo:', recursive)
      log.info('Variable destino:', variableName)
      log.api('/api/system/list-files', { path: folderPath, pattern, recursive })

      try {
        const result = await systemService.listFiles(folderPath, pattern, recursive)

        if (result.success) {
          const fileNames = result.files.map(f => f.Name || f.name)
          saveVariable(variableName, JSON.stringify(fileNames), 'array')
          log.success(`Listado completado: ${result.count} archivos`)
          log.info('Archivos:', fileNames.slice(0, 10))
          if (fileNames.length > 10) log.info(`... y ${fileNames.length - 10} más`)
          showWindowsMessageBox('Archivos Encontrados', `Se encontraron ${result.count} archivos en:\n${folderPath}\n\nGuardados en: ${variableName}`, 'success')
        } else {
          log.error('Error al listar:', result.error)
          showWindowsMessageBox('Error', `No se pudo listar la carpeta: ${result.error}`, 'error')
        }
      } catch (error) {
        log.error('Error de conexión:', error.message)
        showWindowsMessageBox('Error de Conexión', `No se pudo conectar con el backend.\n\n${error.message}`, 'error')
      }
      await new Promise(resolve => setTimeout(resolve, 1500))
    }
    // Contar Archivos (EJECUTA EN BACKEND)
    else if (step.action === 'count_files' || step.action === 'folder_count') {
      log.action('Contando archivos en carpeta...')
      const folderPath = resolvedParams?.path || resolvedParams?.folder || ''
      const variableName = resolvedParams?.variable || 'cantidadArchivos'
      const pattern = resolvedParams?.pattern || '*'
      const recursive = resolvedParams?.recursive || false
      log.info('Carpeta:', folderPath)
      log.info('Patrón:', pattern)
      log.info('Variable destino:', variableName)
      log.api('/api/system/count-files', { path: folderPath, pattern, recursive })

      try {
        const result = await systemService.countFiles(folderPath, pattern, recursive)

        if (result.success) {
          saveVariable(variableName, result.count.toString())
          log.success(`Conteo completado: ${result.count} archivos`)
          showWindowsMessageBox('Conteo Completado', `Se encontraron ${result.count} archivos en:\n${folderPath}\n\nGuardado en: ${variableName}`, 'success')
        } else {
          log.error('Error al contar:', result.error)
          showWindowsMessageBox('Error', `No se pudo contar archivos: ${result.error}`, 'error')
        }
      } catch (error) {
        log.error('Error de conexión:', error.message)
        showWindowsMessageBox('Error de Conexión', error.message, 'error')
      }
      await new Promise(resolve => setTimeout(resolve, 1500))
    }
    // Leer Archivo (EJECUTA EN BACKEND)
    else if (step.action === 'file_read' || step.action === 'read_file') {
      log.action('Leyendo archivo...')
      const filePath = resolvedParams?.path || ''
      const variableName = resolvedParams?.variable || 'contenido'
      log.info('Archivo:', filePath)
      log.info('Variable destino:', variableName)
      log.api('/api/system/read-file', { path: filePath })

      try {
        const result = await systemService.readFile(filePath)

        if (result.success) {
          saveVariable(variableName, result.content)
          log.success(`Archivo leído: ${result.content.length} caracteres`)
          showWindowsMessageBox('Archivo Leído', `Contenido guardado en: ${variableName}\n\nTamaño: ${result.content.length} caracteres`, 'success')
        } else {
          log.error('Error al leer:', result.error)
          showWindowsMessageBox('Error', `No se pudo leer el archivo: ${result.error}`, 'error')
        }
      } catch (error) {
        log.error('Error de conexión:', error.message)
        showWindowsMessageBox('Error de Conexión', error.message, 'error')
      }
      await new Promise(resolve => setTimeout(resolve, 1000))
    }
    // Escribir Archivo (EJECUTA EN BACKEND)
    else if (step.action === 'file_write' || step.action === 'write_file') {
      log.action('Escribiendo archivo...')
      const filePath = resolvedParams?.path || ''
      const content = resolvedParams?.content || ''
      log.info('Archivo:', filePath)
      log.info('Contenido (preview):', content.substring(0, 100))
      log.api('/api/system/write-file', { path: filePath })

      try {
        const result = await systemService.writeFile(filePath, content)

        if (result.success) {
          log.success(`Archivo escrito: ${filePath}`)
          showWindowsMessageBox('Archivo Escrito', `Se escribió correctamente:\n${filePath}`, 'success')
        } else {
          log.error('Error al escribir:', result.error)
          showWindowsMessageBox('Error', `No se pudo escribir el archivo: ${result.error}`, 'error')
        }
      } catch (error) {
        log.error('Error de conexión:', error.message)
        showWindowsMessageBox('Error de Conexión', error.message, 'error')
      }
      await new Promise(resolve => setTimeout(resolve, 1000))
    }
    // Copiar Archivo/Carpeta (EJECUTA EN BACKEND)
    else if (step.action === 'file_copy' || step.action === 'copy_file') {
      log.action('Copiando archivo/carpeta...')
      const source = resolvedParams?.source || resolvedParams?.origen || ''
      const destination = resolvedParams?.destination || resolvedParams?.destino || ''
      log.info('Origen:', source)
      log.info('Destino:', destination)
      log.api('/api/system/copy', { source, destination })

      try {
        const result = await systemService.copy(source, destination)

        if (result.success) {
          log.success('Copiado correctamente')
          showWindowsMessageBox('Archivo Copiado', `Origen: ${source}\nDestino: ${destination}`, 'success')
        } else {
          log.error('Error al copiar:', result.error)
          showWindowsMessageBox('Error', `No se pudo copiar: ${result.error}`, 'error')
        }
      } catch (error) {
        log.error('Error de conexión:', error.message)
        showWindowsMessageBox('Error de Conexión', error.message, 'error')
      }
      await new Promise(resolve => setTimeout(resolve, 1000))
    }
    // Eliminar Archivo/Carpeta (EJECUTA EN BACKEND)
    else if (step.action === 'file_delete' || step.action === 'delete_file') {
      log.action('Eliminando archivo/carpeta...')
      const targetPath = resolvedParams?.path || ''
      log.info('Ruta:', targetPath)
      log.api('/api/system/delete', { path: targetPath })

      try {
        const result = await systemService.delete(targetPath)

        if (result.success) {
          log.success('Eliminado correctamente')
          showWindowsMessageBox('Eliminado', `Se eliminó correctamente:\n${targetPath}`, 'success')
        } else {
          log.error('Error al eliminar:', result.error)
          showWindowsMessageBox('Error', `No se pudo eliminar: ${result.error}`, 'error')
        }
      } catch (error) {
        log.error('Error de conexión:', error.message)
        showWindowsMessageBox('Error de Conexión', error.message, 'error')
      }
      await new Promise(resolve => setTimeout(resolve, 1000))
    }
    // Input Dialog (Preguntar al usuario)
    else if (step.action === 'input_dialog') {
      log.action('Mostrando diálogo de entrada...')
      const title = resolvedParams?.title || 'Ingrese un valor'
      const message = resolvedParams?.message || ''
      const variableName = resolvedParams?.variable || 'inputUsuario'
      const defaultValue = resolvedParams?.default || ''
      log.info('Título:', title)
      log.info('Variable destino:', variableName)

      const userInput = prompt(`${title}\n${message}`, defaultValue)

      if (userInput !== null) {
        saveVariable(variableName, userInput)
        log.success(`Usuario ingresó: "${userInput}"`)
        showWindowsMessageBox('Valor Guardado', `Variable: ${variableName}\nValor: ${userInput}`, 'success')
        await new Promise(resolve => setTimeout(resolve, 1000))
      } else {
        log.warn('Usuario canceló el diálogo')
      }
    }
    // Confirm Dialog
    else if (step.action === 'confirm_dialog') {
      log.action('Mostrando diálogo de confirmación...')
      const title = resolvedParams?.title || 'Confirmación'
      const message = resolvedParams?.message || '¿Desea continuar?'
      const variableName = resolvedParams?.variable || 'confirmacion'
      log.info('Pregunta:', message)
      log.info('Variable destino:', variableName)

      const userConfirm = confirm(`${title}\n\n${message}`)

      saveVariable(variableName, userConfirm.toString(), 'boolean')
      log.success(`Usuario respondió: ${userConfirm ? 'SÍ' : 'NO'}`)
    }
    // ============================================================
    // ACCIONES ORIGINALES
    // ============================================================
    else if (step.action === 'message_box' || step.action === 'pause') {
      log.action('Mostrando mensaje...')
      const title = resolvedParams?.title || 'Mensaje'
      const message = resolvedParams?.message || resolveVariables(step.label, variables)
      const type = resolvedParams?.type || 'info'
      log.info('Título:', title)
      log.info('Mensaje:', message)
      log.info('Tipo:', type)

      showWindowsMessageBox(title, message, type)

      await new Promise(resolve => {
        const checkClosed = setInterval(() => {
          if (!showMessageBox) {
            clearInterval(checkClosed)
            log.success('Mensaje cerrado por usuario')
            resolve()
          }
        }, 100)
        setTimeout(() => {
          clearInterval(checkClosed)
          resolve()
        }, 60000)
      })
    } else if (step.action === 'assign' || step.action === 'set_variable') {
      log.action('Asignando variable...')
      const varName = resolvedParams?.variableName || resolvedParams?.variable
      const varValue = resolvedParams?.value
      log.info('Nombre:', varName)
      log.info('Valor:', varValue)

      if (varName) {
        saveVariable(varName, varValue)
        log.success(`Variable asignada: ${varName} = ${varValue}`)
      } else {
        log.warn('Nombre de variable no especificado')
      }
      await new Promise(resolve => setTimeout(resolve, 100))
    } else if (step.action === 'log_message') {
      log.action('Registrando mensaje...')
      const mensaje = resolvedParams?.message || step.label
      log.info('Mensaje:', mensaje)
      console.log('[Workflow Log]', mensaje)
      await new Promise(resolve => setTimeout(resolve, 100))
    }
    // ============================================================
    // COMPONENTES PERSONALIZADOS (Creados por IA)
    // ============================================================
    else if (step.isCustomAction || step.action?.startsWith('custom_')) {
      log.action('Ejecutando componente personalizado (IA)...')
      log.warn('Este componente fue creado dinámicamente por IA')

      const descripcion = resolvedParams?.descripcion || step.label
      const script = resolvedParams?.script || ''
      const variableName = resolvedParams?.variable || 'customResult'
      log.info('Descripción:', descripcion)
      log.info('Variable destino:', variableName)
      if (script) log.info('Script:', script.substring(0, 200))

      if (script && script.trim()) {
        showWindowsMessageBox(`Componente: ${step.label}`, `Ejecutando script personalizado...\n\n${script.substring(0, 100)}...`, 'info')

        try {
          const isPowerShell = script.includes('Get-') || script.includes('Set-') ||
                               script.includes('$') || script.includes('|')

          log.info('Tipo de script detectado:', isPowerShell ? 'PowerShell' : 'CMD')

          if (isPowerShell) {
            log.api('/api/system/powershell', { script })
            const result = await systemService.executePowerShell(script)
            if (result.success) {
              saveVariable(variableName, result.output)
              log.success('Script ejecutado correctamente')
              showWindowsMessageBox(`${step.label} - Completado`, `Resultado guardado en: ${variableName}\n\n${result.output.substring(0, 200)}`, 'success')
            } else {
              log.error('Error en script:', result.error)
              showWindowsMessageBox('Error', result.error, 'error')
            }
          } else {
            log.api('/api/system/cmd', { command: script })
            const result = await systemService.executeCmd(script)
            if (result.success) {
              saveVariable(variableName, result.output)
              log.success('Comando ejecutado correctamente')
              showWindowsMessageBox(`${step.label} - Completado`, `Resultado: ${result.output.substring(0, 200)}`, 'success')
            } else {
              log.error('Error en comando:', result.error)
              showWindowsMessageBox('Error', result.error, 'error')
            }
          }
        } catch (error) {
          log.error('Error de conexión:', error.message)
          showWindowsMessageBox('Error de Conexión', `No se pudo ejecutar el script.\n\n${error.message}`, 'error')
        }
      } else {
        log.info('Componente sin script - mostrando información')
        showWindowsMessageBox(
          `Componente: ${step.label}`,
          `Acción personalizada ejecutada.\n\n${descripcion}`,
          'info'
        )
      }
      await new Promise(resolve => setTimeout(resolve, 1500))
    }
    // ============================================================
    // DELAY / ESPERA
    // ============================================================
    else if (step.action === 'delay' || step.action === 'wait') {
      const duration = resolvedParams?.duration || resolvedParams?.ms || 1000
      log.action(`Esperando ${duration}ms...`)
      await new Promise(resolve => setTimeout(resolve, duration))
      log.success(`Espera completada (${duration}ms)`)
    }
    // ============================================================
    // DEFAULT - Simular ejecución
    // ============================================================
    else {
      log.warn(`Acción no implementada: ${step.action}`)
      log.info('Simulando ejecución...')
      await new Promise(resolve => setTimeout(resolve, delay))
      log.success('Simulación completada')
    }

    // Cerrar grupo de logs para este paso
    console.groupEnd()
  }

  // Detener ejecución
  const stopExecution = () => {
    setIsExecuting(false)
    setExecutionCurrentStep(null)
    setExecutionProgress(0)
    setShowExecutionBar(false)
  }

  // Eliminar workflow
  const deleteWorkflow = () => {
    setShowDeleteConfirm(true)
  }

  const confirmDeleteWorkflow = () => {
    // Eliminar del localStorage si existe
    const saved = JSON.parse(localStorage.getItem('alqvimia-workflows') || '[]')
    const filtered = saved.filter(w => w.name !== workflowName)
    localStorage.setItem('alqvimia-workflows', JSON.stringify(filtered))

    // Limpiar el workflow actual
    newWorkflow()
    setShowDeleteConfirm(false)
  }

  const handleSaveConfirm = () => {
    const workflow = {
      id: currentWorkflowId || `wf_${Date.now()}`,
      name: workflowName,
      steps: workflowSteps,
      actions: workflowSteps, // Alias para compatibilidad con Library
      variables,
      createdAt: new Date().toISOString(),
      folder: selectedFolder || 'Sin carpeta',
      location: saveLocation
    }

    if (saveLocation === 'local') {
      // Guardar en localStorage
      const saved = JSON.parse(localStorage.getItem('alqvimia-workflows') || '[]')
      const existingIndex = saved.findIndex(w => w.id === workflow.id)
      if (existingIndex >= 0) {
        saved[existingIndex] = workflow
      } else {
        saved.push(workflow)
      }
      localStorage.setItem('alqvimia-workflows', JSON.stringify(saved))

      // Actualizar el ID del workflow actual
      setCurrentWorkflowId(workflow.id)

      // Disparar evento para notificar a la biblioteca
      window.dispatchEvent(new CustomEvent('workflow-saved', { detail: workflow }))

      speak('Workflow guardado exitosamente')
    } else if (saveLocation === 'file') {
      // Exportar como archivo
      const blob = new Blob([JSON.stringify(workflow, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${workflowName.replace(/\s+/g, '_')}.alq`
      a.click()
      URL.revokeObjectURL(url)
      speak('Workflow exportado como archivo')
    }

    setShowSaveModal(false)
    setSelectedFolder('')
  }

  const addCustomFolder = () => {
    if (newFolderName.trim() && !customFolders.includes(newFolderName.trim())) {
      const updatedFolders = [...customFolders, newFolderName.trim()]
      setCustomFolders(updatedFolders)
      localStorage.setItem('alqvimia_custom_folders', JSON.stringify(updatedFolders))
      setSelectedFolder(newFolderName.trim())
      setNewFolderName('')
      setShowNewFolderInput(false)
    }
  }

  const removeCustomFolder = (folderName) => {
    const updatedFolders = customFolders.filter(f => f !== folderName)
    setCustomFolders(updatedFolders)
    localStorage.setItem('alqvimia_custom_folders', JSON.stringify(updatedFolders))
    if (selectedFolder === folderName) setSelectedFolder('')
  }

  // Carpetas predefinidas del sistema
  const systemFolders = [
    { name: 'Mis Workflows', icon: 'fa-folder', color: '#f59e0b' },
    { name: 'Producción', icon: 'fa-industry', color: '#22c55e' },
    { name: 'Desarrollo', icon: 'fa-code', color: '#3b82f6' },
    { name: 'Pruebas', icon: 'fa-flask', color: '#8b5cf6' },
    { name: 'Plantillas', icon: 'fa-copy', color: '#ec4899' },
    { name: 'Archivados', icon: 'fa-archive', color: '#6b7280' }
  ]

  const importWorkflow = () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.json,.alq'
    input.onchange = (e) => {
      const file = e.target.files[0]
      if (!file) return
      const reader = new FileReader()
      reader.onload = (event) => {
        try {
          const data = JSON.parse(event.target.result)
          if (data.steps) {
            setWorkflowName(data.name || 'Workflow Importado')
            setWorkflowSteps(data.steps || [])
            setVariables(data.variables || [])
            alert('Workflow importado exitosamente!')
          }
        } catch (err) {
          alert('Error al importar: El archivo no es válido')
        }
      }
      reader.readAsText(file)
    }
    input.click()
  }

  const exportWorkflow = () => {
    const workflow = { name: workflowName, steps: workflowSteps, variables, exportedAt: new Date().toISOString(), version: '2.0' }
    const blob = new Blob([JSON.stringify(workflow, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${workflowName.replace(/\s+/g, '_')}.alq`
    a.click()
    URL.revokeObjectURL(url)
  }

  // Función para procesar RFQ desde PDF/Word/MD
  const processRFQDocument = async (file) => {
    if (!file) return

    setIsProcessingRFQ(true)
    setRfqProcessingProgress(0)
    setRfqContent('')

    try {
      // Validar tipo de archivo
      const allowedTypes = [
        'application/pdf',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/msword',
        'text/markdown',
        'text/plain'
      ]

      if (!allowedTypes.includes(file.type) && !file.name.match(/\.(pdf|docx|doc|md|txt)$/i)) {
        alert('Tipo de archivo no soportado. Por favor selecciona un archivo PDF, Word (.docx/.doc) o Markdown (.md)')
        setIsProcessingRFQ(false)
        return
      }

      setRfqProcessingProgress(20)

      // Crear FormData para enviar el archivo al backend
      const formData = new FormData()
      formData.append('document', file)

      setRfqProcessingProgress(40)

      // Enviar al backend para procesamiento
      const response = await fetch('/api/workflows/parse-rfq', {
        method: 'POST',
        body: formData
      })

      if (!response.ok) {
        throw new Error('Error al procesar el documento')
      }

      setRfqProcessingProgress(70)

      const result = await response.json()

      if (result.success) {
        setRfqContent(result.extractedText || '')
        setRfqProcessingProgress(90)

        // Generar workflow desde el contenido extraído
        if (result.generatedSteps && result.generatedSteps.length > 0) {
          setWorkflowName(result.workflowName || file.name.replace(/\.(pdf|docx|doc|md|txt)$/i, ''))
          setWorkflowSteps(result.generatedSteps)
          if (result.variables) {
            setVariables(result.variables)
          }
          setRfqProcessingProgress(100)
          alert(`Workflow generado exitosamente con ${result.generatedSteps.length} pasos!`)
          setShowRFQModal(false)
        } else {
          setRfqProcessingProgress(100)
          alert('Documento procesado. Revisa el contenido extraído para generar el workflow.')
        }
      } else {
        throw new Error(result.message || 'Error al procesar el documento')
      }
    } catch (error) {
      console.error('Error procesando RFQ:', error)
      alert(`Error al procesar el documento: ${error.message}`)
    } finally {
      setIsProcessingRFQ(false)
      setRfqProcessingProgress(0)
    }
  }

  const handleRFQFileSelect = (e) => {
    const file = e.target.files?.[0]
    if (file) {
      setRfqFile(file)
      processRFQDocument(file)
    }
  }

  const [showMigrateModal, setShowMigrateModal] = useState(false)
  const [migrateMode, setMigrateMode] = useState(null) // 'import' | 'export'
  const [migrateFormat, setMigrateFormat] = useState(null)
  const [migrateStep, setMigrateStep] = useState(1) // 1: selección, 2: archivo/config, 3: progreso, 4: resultado
  const [migrateProgress, setMigrateProgress] = useState(0)
  const [migrateStatus, setMigrateStatus] = useState('')
  const [migrateResult, setMigrateResult] = useState(null)
  const [importFileContent, setImportFileContent] = useState('')
  const [exportWorkflowName, setExportWorkflowName] = useState('')
  const [exportSavePath, setExportSavePath] = useState('')
  const migrateFileInputRef = useRef(null)

  // Funciones de migración
  const handleMigration = async (content) => {
    setMigrateProgress(0)
    setMigrateStatus('Analizando archivo...')

    try {
      // Simular progreso
      for (let i = 0; i <= 30; i += 10) {
        await new Promise(r => setTimeout(r, 200))
        setMigrateProgress(i)
      }
      setMigrateStatus('Parseando contenido...')

      // Obtener el parser correcto
      const parser = importers[migrateFormat]
      if (!parser) {
        throw new Error(`Formato no soportado: ${migrateFormat}`)
      }

      for (let i = 30; i <= 70; i += 10) {
        await new Promise(r => setTimeout(r, 150))
        setMigrateProgress(i)
      }
      setMigrateStatus('Convirtiendo acciones...')

      // Parsear el contenido
      const parsedSteps = parser(content)

      for (let i = 70; i <= 100; i += 10) {
        await new Promise(r => setTimeout(r, 100))
        setMigrateProgress(i)
      }
      setMigrateStatus('Completado')

      setMigrateResult({
        success: true,
        steps: parsedSteps,
        format: migrateFormat
      })
      setMigrateStep(4)

    } catch (error) {
      console.error('Error en migración:', error)
      setMigrateResult({
        success: false,
        error: error.message
      })
      setMigrateStep(4)
    }
  }

  const handleExportMigration = async () => {
    setMigrateProgress(0)
    setMigrateStatus('Preparando exportación...')

    try {
      // Simular progreso
      for (let i = 0; i <= 30; i += 10) {
        await new Promise(r => setTimeout(r, 200))
        setMigrateProgress(i)
      }
      setMigrateStatus('Convirtiendo workflow...')

      // Obtener el exportador correcto
      const exporter = exporters[migrateFormat]
      if (!exporter) {
        throw new Error(`Formato de exportación no soportado: ${migrateFormat}`)
      }

      for (let i = 30; i <= 70; i += 10) {
        await new Promise(r => setTimeout(r, 150))
        setMigrateProgress(i)
      }
      setMigrateStatus('Generando código...')

      // Preparar el workflow para exportar
      const workflow = {
        name: exportWorkflowName || workflowName,
        steps: workflowSteps.map(s => ({
          type: s.action,
          label: s.label,
          icon: s.icon,
          properties: s.params
        })),
        variables
      }

      // Exportar
      const code = exporter(workflow)

      for (let i = 70; i <= 100; i += 10) {
        await new Promise(r => setTimeout(r, 100))
        setMigrateProgress(i)
      }
      setMigrateStatus('Completado')

      setMigrateResult({
        success: true,
        code,
        format: migrateFormat
      })
      setMigrateStep(4)

    } catch (error) {
      console.error('Error en exportación:', error)
      setMigrateResult({
        success: false,
        error: error.message
      })
      setMigrateStep(4)
    }
  }

  const [showAIModal, setShowAIModal] = useState(false)
  const [aiPrompt, setAIPrompt] = useState('')
  const [isGeneratingAI, setIsGeneratingAI] = useState(false)
  const [showCodeEditorModal, setShowCodeEditorModal] = useState(false)

  // Estados para importación de video
  const [showVideoImportModal, setShowVideoImportModal] = useState(false)
  const [videoFile, setVideoFile] = useState(null)
  const [videoAnalysisProgress, setVideoAnalysisProgress] = useState(0)
  const [videoAnalysisStep, setVideoAnalysisStep] = useState('')
  const [isAnalyzingVideo, setIsAnalyzingVideo] = useState(false)
  const [videoSavePath, setVideoSavePath] = useState('C:\\Alqvimia\\Proyectos')
  const [videoProjectName, setVideoProjectName] = useState('')
  const videoInputRef = useRef(null)

  // Estados para generador de diagramas
  const [showDiagramModal, setShowDiagramModal] = useState(false)
  const [diagramType, setDiagramType] = useState('flowchart')
  const [diagramCode, setDiagramCode] = useState('')
  const [diagramDirection, setDiagramDirection] = useState('TB')
  const [isGeneratingDiagram, setIsGeneratingDiagram] = useState(false)
  const diagramContainerRef = useRef(null)
  // Estados para IA en diagramas
  const [diagramAIPrompt, setDiagramAIPrompt] = useState('')
  const [isDiagramDictating, setIsDiagramDictating] = useState(false)
  const [isGeneratingDiagramFromAI, setIsGeneratingDiagramFromAI] = useState(false)
  const [isGeneratingWorkflowFromDiagram, setIsGeneratingWorkflowFromDiagram] = useState(false)
  const diagramPromptRef = useRef(null)
  const [codeEditorActions, setCodeEditorActions] = useState([])
  const [showSaveModal, setShowSaveModal] = useState(false)
  const [saveLocation, setSaveLocation] = useState('local')
  const [selectedFolder, setSelectedFolder] = useState('')
  const [customFolders, setCustomFolders] = useState(() => {
    const saved = localStorage.getItem('alqvimia_custom_folders')
    return saved ? JSON.parse(saved) : []
  })
  const [newFolderName, setNewFolderName] = useState('')
  const [showNewFolderInput, setShowNewFolderInput] = useState(false)

  // Estados para RFQ (Request for Quotation) - Generación desde documentos
  const [showRFQModal, setShowRFQModal] = useState(false)
  const [rfqFile, setRfqFile] = useState(null)
  const [rfqContent, setRfqContent] = useState('')
  const [isProcessingRFQ, setIsProcessingRFQ] = useState(false)
  const [rfqProcessingProgress, setRfqProcessingProgress] = useState(0)
  const rfqFileInputRef = useRef(null)

  // Cargar acciones exportadas desde el editor de código
  useEffect(() => {
    const loadCodeEditorActions = () => {
      const saved = localStorage.getItem('alqvimia_workflow_code_actions')
      if (saved) {
        setCodeEditorActions(JSON.parse(saved))
      }
    }
    loadCodeEditorActions()
    // Escuchar cambios en localStorage
    window.addEventListener('storage', loadCodeEditorActions)
    return () => window.removeEventListener('storage', loadCodeEditorActions)
  }, [])

  const loadCodeFromEditor = (action) => {
    const newStep = {
      id: Date.now(),
      action: 'execute_code',
      icon: 'fa-code',
      label: action.name,
      params: {
        language: action.language,
        code: action.code,
        description: `Código importado desde el editor (${action.language})`
      }
    }
    setWorkflowSteps(prev => [...prev, newStep])
    setShowCodeEditorModal(false)
  }

  const removeCodeAction = (index) => {
    const updated = codeEditorActions.filter((_, i) => i !== index)
    setCodeEditorActions(updated)
    localStorage.setItem('alqvimia_workflow_code_actions', JSON.stringify(updated))
  }

  const getLanguageColor = (lang) => {
    const colors = {
      javascript: '#f7df1e', typescript: '#3178c6', python: '#3776ab',
      java: '#007396', csharp: '#68217a', cpp: '#00599c', go: '#00add8',
      rust: '#dea584', php: '#777bb4', ruby: '#cc342d', swift: '#fa7343',
      html: '#e34f26', css: '#1572b6', sql: '#336791', shell: '#4eaa25'
    }
    return colors[lang] || '#888'
  }

  const handleAIGenerate = async () => {
    if (!aiPrompt.trim()) return
    setIsGeneratingAI(true)

    // Analizar el prompt del usuario para generar pasos relevantes
    const prompt = aiPrompt.toLowerCase()
    const originalPrompt = aiPrompt // Mantener el original para el análisis
    const generatedSteps = []
    const newCustomComponents = [] // Componentes personalizados a crear
    const timestamp = Date.now()
    let stepIndex = 1

    console.log('[IA] Analizando prompt:', originalPrompt)

    // Función auxiliar para agregar paso (verifica si existe la acción)
    const addStep = (action, icon, label, params = {}) => {
      // Verificar si la acción existe en el sistema
      if (!actionExists(action)) {
        // Verificar si ya existe en componentes personalizados
        const existingCustom = customComponents.find(c => c.action === action)
        if (!existingCustom && !newCustomComponents.find(c => c.action === action)) {
          // Crear nuevo componente personalizado
          const customComp = createCustomComponent(label, `Componente personalizado: ${label}`, params)
          customComp.action = action // Usar el action ID original
          newCustomComponents.push(customComp)
          console.log(`[IA] Creando componente personalizado: ${label} (${action})`)
        }
      }

      generatedSteps.push({
        id: `step_${timestamp}_${stepIndex++}`,
        action,
        icon,
        label,
        params,
        isCustomAction: !actionExists(action)
      })
    }

    // Función para crear paso con componente totalmente nuevo basado en descripción
    const addCustomStep = (label, description, params = {}) => {
      const actionId = generateActionId(label)
      const icon = suggestIconForAction(label)

      // Verificar si ya existe
      if (!actionExists(actionId) && !customComponents.find(c => c.action === actionId) && !newCustomComponents.find(c => c.action === actionId)) {
        const customComp = createCustomComponent(label, description, params)
        newCustomComponents.push(customComp)
        console.log(`[IA] Creando componente nuevo: ${label} (${actionId})`)
      }

      generatedSteps.push({
        id: `step_${timestamp}_${stepIndex++}`,
        action: actionId,
        icon,
        label,
        params,
        isCustomAction: true
      })
    }

    // ============================================================
    // ANÁLISIS SEMÁNTICO AVANZADO DEL PROMPT
    // ============================================================

    // Función para extraer frases de acción del prompt
    const extractActionPhrases = (text) => {
      const phrases = []

      // Patrones de verbos en español con sus objetos
      const verbPatterns = [
        // Abrir/Cerrar
        { regex: /(abrir|open)\s+(?:el\s+|la\s+|un\s+|una\s+)?(.+?)(?:\s+y\s+|\s*,\s*|$)/gi, verb: 'abrir', icon: 'fa-folder-open' },
        { regex: /(cerrar|close)\s+(?:el\s+|la\s+|un\s+|una\s+)?(.+?)(?:\s+y\s+|\s*,\s*|$)/gi, verb: 'cerrar', icon: 'fa-times' },

        // Crear/Generar
        { regex: /(crear|create|generar|generate)\s+(?:el\s+|la\s+|un\s+|una\s+)?(.+?)(?:\s+y\s+|\s*,\s*|$)/gi, verb: 'crear', icon: 'fa-plus' },

        // Leer/Obtener
        { regex: /(leer|read|obtener|get|cargar|load)\s+(?:el\s+|la\s+|los\s+|las\s+)?(.+?)(?:\s+y\s+|\s*,\s*|$)/gi, verb: 'leer', icon: 'fa-eye' },

        // Escribir/Guardar
        { regex: /(escribir|write|guardar|save)\s+(?:el\s+|la\s+|en\s+)?(.+?)(?:\s+y\s+|\s*,\s*|$)/gi, verb: 'escribir', icon: 'fa-edit' },

        // Contar
        { regex: /(contar|count|cuantos|cuántos)\s+(?:los\s+|las\s+)?(.+?)(?:\s+hay|\s+existen|\s+y\s+|\s*,\s*|$)/gi, verb: 'contar', icon: 'fa-calculator' },

        // Listar/Mostrar
        { regex: /(listar|list|mostrar|show|ver|display)\s+(?:los\s+|las\s+|el\s+|la\s+)?(.+?)(?:\s+y\s+|\s*,\s*|$)/gi, verb: 'mostrar', icon: 'fa-list' },

        // Seleccionar/Elegir
        { regex: /(seleccionar|select|elegir|choose|preguntar|pedir)\s+(?:el\s+|la\s+|un\s+|una\s+)?(.+?)(?:\s+y\s+|\s*,\s*|$)/gi, verb: 'seleccionar', icon: 'fa-hand-pointer' },

        // Copiar/Mover
        { regex: /(copiar|copy|mover|move)\s+(?:el\s+|la\s+|los\s+|las\s+)?(.+?)(?:\s+a\s+|\s+y\s+|\s*,\s*|$)/gi, verb: 'copiar', icon: 'fa-copy' },

        // Eliminar/Borrar
        { regex: /(eliminar|delete|borrar|remove)\s+(?:el\s+|la\s+|los\s+|las\s+)?(.+?)(?:\s+y\s+|\s*,\s*|$)/gi, verb: 'eliminar', icon: 'fa-trash' },

        // Enviar
        { regex: /(enviar|send)\s+(?:el\s+|la\s+|un\s+|una\s+)?(.+?)(?:\s+a\s+|\s+por\s+|\s+y\s+|\s*,\s*|$)/gi, verb: 'enviar', icon: 'fa-paper-plane' },

        // Ejecutar
        { regex: /(ejecutar|run|iniciar|start|correr)\s+(?:el\s+|la\s+|un\s+|una\s+)?(.+?)(?:\s+y\s+|\s*,\s*|$)/gi, verb: 'ejecutar', icon: 'fa-play' },

        // Buscar
        { regex: /(buscar|search|encontrar|find)\s+(?:el\s+|la\s+|los\s+|las\s+)?(.+?)(?:\s+en\s+|\s+y\s+|\s*,\s*|$)/gi, verb: 'buscar', icon: 'fa-search' },

        // Filtrar
        { regex: /(filtrar|filter)\s+(?:los\s+|las\s+|por\s+)?(.+?)(?:\s+y\s+|\s*,\s*|$)/gi, verb: 'filtrar', icon: 'fa-filter' },

        // Validar/Verificar
        { regex: /(validar|validate|verificar|verify|comprobar|check)\s+(?:el\s+|la\s+|si\s+)?(.+?)(?:\s+y\s+|\s*,\s*|$)/gi, verb: 'validar', icon: 'fa-check' },

        // Conectar
        { regex: /(conectar|connect)\s+(?:con\s+|a\s+)?(.+?)(?:\s+y\s+|\s*,\s*|$)/gi, verb: 'conectar', icon: 'fa-plug' },

        // Descargar/Subir
        { regex: /(descargar|download)\s+(?:el\s+|la\s+)?(.+?)(?:\s+de\s+|\s+y\s+|\s*,\s*|$)/gi, verb: 'descargar', icon: 'fa-download' },
        { regex: /(subir|upload)\s+(?:el\s+|la\s+)?(.+?)(?:\s+a\s+|\s+y\s+|\s*,\s*|$)/gi, verb: 'subir', icon: 'fa-upload' },

        // Procesar/Transformar
        { regex: /(procesar|process|transformar|transform)\s+(?:el\s+|la\s+|los\s+|las\s+)?(.+?)(?:\s+y\s+|\s*,\s*|$)/gi, verb: 'procesar', icon: 'fa-cogs' },

        // Notificar/Alertar
        { regex: /(notificar|notify|alertar|alert)\s+(?:al\s+|a\s+)?(.+?)(?:\s+y\s+|\s*,\s*|$)/gi, verb: 'notificar', icon: 'fa-bell' }
      ]

      for (const { regex, verb, icon } of verbPatterns) {
        let match
        const r = new RegExp(regex.source, regex.flags)
        while ((match = r.exec(text)) !== null) {
          const objeto = match[2]?.trim()
          if (objeto && objeto.length > 1 && objeto.length < 50) {
            phrases.push({
              verb,
              objeto,
              label: `${verb.charAt(0).toUpperCase() + verb.slice(1)} ${objeto}`,
              icon
            })
          }
        }
      }

      return phrases
    }

    // Extraer frases de acción del prompt
    const actionPhrases = extractActionPhrases(originalPrompt)
    console.log('[IA] Frases de acción detectadas:', actionPhrases)

    // ============================================================
    // DETECCIÓN DE CONTEXTO ESPECÍFICO
    // ============================================================

    // === Detección de Carpetas y Archivos (Windows) ===
    const hasFolderKeywords = /carpeta|directorio|folder|ruta|path|archivos|files/i.test(prompt)
    const hasWindowsDialog = /ventana|windows|dialog|seleccionar|explorador|explorer|modo\s+windows/i.test(prompt)
    const hasCountFiles = /contar|count|cuantos|cuántos|cantidad|número|numero/i.test(prompt)
    const hasOpenFolder = /abrir/i.test(prompt)
    const hasListFiles = /listar|list|mostrar|show|ver/i.test(prompt)

    // === Detección de Navegador Web ===
    const hasBrowserKeywords = /navegador|browser|chrome|firefox|edge|web|url|página|pagina|sitio|website/i.test(prompt)
    const hasNavigate = /navegar|ir a|visitar|abrir.*url|go to/i.test(prompt)
    const hasLogin = /login|iniciar sesión|usuario|password|contraseña|autenticar/i.test(prompt)
    const hasClick = /clic|click|presionar|pulsar|botón|boton/i.test(prompt)
    const hasType = /escribir|teclear|ingresar|type|input|rellenar|llenar/i.test(prompt)
    const hasExtract = /extraer|extract|obtener|get|scrape|tabla|table|datos|data/i.test(prompt)

    // === Detección de Excel ===
    const hasExcelKeywords = /excel|xlsx|xls|hoja de cálculo|spreadsheet|libro/i.test(prompt)
    const hasExcelRead = /leer.*excel|read.*excel|abrir.*excel|cargar.*excel/i.test(prompt)
    const hasExcelWrite = /escribir.*excel|guardar.*excel|exportar.*excel|write.*excel|save.*excel/i.test(prompt)

    // === Detección de Base de Datos ===
    const hasDBKeywords = /base de datos|database|sql|mysql|postgres|mongodb|query|consulta/i.test(prompt)
    const hasDBInsert = /insertar|insert|agregar|add/i.test(prompt)
    const hasDBUpdate = /actualizar|update|modificar/i.test(prompt)
    const hasDBSelect = /seleccionar|select|consultar|query|buscar/i.test(prompt)

    // === Detección de Email ===
    const hasEmailKeywords = /email|correo|mail|outlook|gmail|smtp|enviar.*correo|enviar.*email/i.test(prompt)

    // === Detección de API REST ===
    const hasAPIKeywords = /api|rest|get|post|put|delete|endpoint|request|json/i.test(prompt)

    // === Detección de Archivos y Sistema ===
    const hasFileRead = /leer archivo|read file|cargar archivo|load file/i.test(prompt)
    const hasFileWrite = /escribir archivo|write file|guardar archivo|save file|crear archivo/i.test(prompt)
    const hasFileCopy = /copiar|copy|mover|move|renombrar|rename/i.test(prompt)
    const hasFileDelete = /eliminar|delete|borrar|remove/i.test(prompt)

    // === Detección de Bucles y Condiciones ===
    const hasLoop = /bucle|loop|repetir|repeat|para cada|foreach|iterar|iterate|mientras|while/i.test(prompt)
    const hasCondition = /si |if |condición|condition|cuando|when|comparar|compare/i.test(prompt)

    // === Detección de Mensajes y UI ===
    const hasMessageBox = /mensaje|message|notificar|notify|alerta|alert|mostrar.*resultado|show.*result/i.test(prompt)
    const hasInputDialog = /preguntar|ask|pedir|request|input.*usuario|solicitar/i.test(prompt)

    // === Generación de pasos según el análisis ===

    // Flujo de Carpetas/Archivos Windows
    if (hasFolderKeywords && (hasWindowsDialog || hasOpenFolder || hasCountFiles || hasListFiles)) {
      if (hasWindowsDialog || hasInputDialog) {
        addStep('select_folder', 'fa-folder', 'Seleccionar Carpeta', { title: 'Seleccione la carpeta a procesar' })
      }

      if (hasOpenFolder) {
        addStep('process_start', 'fa-folder-open', 'Abrir Explorador de Windows', { command: 'explorer "${carpeta}"' })
      }

      if (hasListFiles || hasCountFiles) {
        addStep('run_powershell', 'fa-terminal', 'Obtener Lista de Archivos', {
          script: 'Get-ChildItem -Path "${carpeta}" -File | Select-Object Name, Length, LastWriteTime'
        })
      }

      if (hasCountFiles) {
        addStep('run_powershell', 'fa-calculator', 'Contar Archivos en Directorio', {
          script: '(Get-ChildItem -Path "${carpeta}" -File).Count'
        })
        addStep('set_variable', 'fa-pen', 'Guardar Cantidad', { variable: 'cantidadArchivos', value: '${resultado}' })
      }

      addStep('message_box', 'fa-window-restore', 'Mostrar Resultado', {
        message: hasCountFiles ? 'Se encontraron ${cantidadArchivos} archivos en la carpeta' : 'Proceso de carpeta completado'
      })
    }
    // Flujo de Navegador Web
    else if (hasBrowserKeywords || hasNavigate || hasLogin) {
      addStep('browser_open', 'fa-window-maximize', 'Abrir Navegador', { browser: 'chrome' })

      if (hasNavigate) {
        addStep('navigate', 'fa-compass', 'Navegar a URL', { url: '${url}' })
      }

      addStep('wait_element', 'fa-hourglass-half', 'Esperar Carga de Página', { timeout: 10000 })

      if (hasLogin) {
        addStep('type', 'fa-keyboard', 'Ingresar Usuario', { selector: '#username', text: '${usuario}' })
        addStep('type', 'fa-keyboard', 'Ingresar Contraseña', { selector: '#password', text: '${contraseña}' })
        addStep('click', 'fa-mouse-pointer', 'Clic en Botón Login', { selector: '#loginBtn' })
        addStep('wait_element', 'fa-hourglass-half', 'Esperar Redirección', { timeout: 5000 })
      }

      if (hasClick && !hasLogin) {
        addStep('click', 'fa-mouse-pointer', 'Hacer Clic en Elemento', { selector: '${selector}' })
      }

      if (hasType && !hasLogin) {
        addStep('type', 'fa-keyboard', 'Escribir Texto', { selector: '${selector}', text: '${texto}' })
      }

      if (hasExtract) {
        addStep('extract_table', 'fa-table', 'Extraer Datos de Tabla', { selector: 'table' })
        if (hasExcelWrite) {
          addStep('excel_bg_create', 'fa-file-excel', 'Crear Archivo Excel', { path: '${rutaExcel}' })
          addStep('excel_bg_write_range', 'fa-edit', 'Escribir Datos en Excel', { data: '${datosExtraidos}' })
        }
      }

      addStep('message_box', 'fa-window-restore', 'Proceso Completado', { message: 'Automatización web finalizada' })
    }
    // Flujo de Excel
    else if (hasExcelKeywords) {
      if (hasExcelRead) {
        addStep('excel_bg_open', 'fa-file-excel', 'Abrir Archivo Excel', { path: '${rutaExcel}' })
        addStep('excel_bg_read_all', 'fa-table', 'Leer Datos de Hoja', { sheet: 'Hoja1' })
        addStep('set_variable', 'fa-pen', 'Guardar Datos', { variable: 'datosExcel', value: '${resultado}' })
      }

      if (hasLoop) {
        addStep('for_each', 'fa-redo', 'Para Cada Fila', { collection: '${datosExcel}', variable: 'fila' })
      }

      if (hasExcelWrite) {
        addStep('excel_bg_create', 'fa-file-excel', 'Crear Archivo Excel', { path: '${rutaSalida}' })
        addStep('excel_bg_write_range', 'fa-edit', 'Escribir Datos', { data: '${datos}' })
        addStep('excel_bg_save', 'fa-save', 'Guardar Excel', {})
      }

      addStep('message_box', 'fa-window-restore', 'Proceso Excel Completado', { message: 'Archivo Excel procesado correctamente' })
    }
    // Flujo de Base de Datos
    else if (hasDBKeywords) {
      addStep('db_connect', 'fa-plug', 'Conectar a Base de Datos', {
        host: '${dbHost}',
        database: '${dbName}',
        user: '${dbUser}'
      })

      if (hasDBSelect) {
        addStep('db_query', 'fa-search', 'Ejecutar Consulta SQL', { query: '${consulta}' })
        addStep('set_variable', 'fa-pen', 'Guardar Resultados', { variable: 'resultados', value: '${queryResult}' })
      }

      if (hasDBInsert) {
        addStep('db_insert', 'fa-plus-circle', 'Insertar Datos', { table: '${tabla}', data: '${datos}' })
      }

      if (hasDBUpdate) {
        addStep('db_update', 'fa-edit', 'Actualizar Datos', { table: '${tabla}', data: '${datos}', where: '${condicion}' })
      }

      addStep('message_box', 'fa-window-restore', 'Operación BD Completada', { message: 'Operación de base de datos finalizada' })
    }
    // Flujo de Email
    else if (hasEmailKeywords) {
      addStep('email_connect_smtp', 'fa-server', 'Conectar a Servidor SMTP', {
        host: '${smtpHost}',
        port: 587
      })
      addStep('email_send', 'fa-paper-plane', 'Enviar Email', {
        to: '${destinatario}',
        subject: '${asunto}',
        body: '${cuerpo}'
      })
      addStep('message_box', 'fa-window-restore', 'Email Enviado', { message: 'El correo ha sido enviado correctamente' })
    }
    // Flujo de API REST
    else if (hasAPIKeywords) {
      const method = /post/i.test(prompt) ? 'rest_post' : /put/i.test(prompt) ? 'rest_put' : /delete/i.test(prompt) ? 'rest_delete' : 'rest_get'
      const methodLabel = method.replace('rest_', '').toUpperCase()

      addStep(method, method === 'rest_get' ? 'fa-download' : 'fa-upload', `${methodLabel} Request`, {
        url: '${apiUrl}',
        headers: '${headers}'
      })
      addStep('set_variable', 'fa-pen', 'Guardar Respuesta', { variable: 'apiResponse', value: '${response}' })
      addStep('parse_json', 'fa-code', 'Parsear Respuesta JSON', { input: '${apiResponse}' })
      addStep('message_box', 'fa-window-restore', 'API Request Completado', { message: 'Llamada a API finalizada' })
    }
    // Flujo de archivos genérico
    else if (hasFileRead || hasFileWrite || hasFileCopy || hasFileDelete) {
      if (hasFileRead) {
        addStep('file_read', 'fa-file-alt', 'Leer Archivo', { path: '${rutaArchivo}' })
        addStep('set_variable', 'fa-pen', 'Guardar Contenido', { variable: 'contenido', value: '${resultado}' })
      }

      if (hasFileWrite) {
        addStep('file_write', 'fa-file-edit', 'Escribir Archivo', { path: '${rutaArchivo}', content: '${contenido}' })
      }

      if (hasFileCopy) {
        addStep('file_copy', 'fa-copy', 'Copiar Archivo', { source: '${origen}', destination: '${destino}' })
      }

      if (hasFileDelete) {
        addStep('file_delete', 'fa-trash', 'Eliminar Archivo', { path: '${rutaArchivo}' })
      }

      addStep('message_box', 'fa-window-restore', 'Operación de Archivo Completada', { message: 'Proceso de archivos finalizado' })
    }
    // Flujo genérico con input y mensaje
    else {
      if (hasInputDialog || /preguntar|pedir|solicitar/i.test(prompt)) {
        addStep('input_dialog', 'fa-keyboard', 'Solicitar Información al Usuario', { title: 'Ingrese los datos', variable: 'inputUsuario' })
      }

      if (hasCondition) {
        addStep('if_condition', 'fa-question', 'Evaluar Condición', { condition: '${variable} != ""' })
      }

      if (hasLoop) {
        addStep('for_loop', 'fa-redo', 'Bucle de Repetición', { start: 1, end: 10, variable: 'i' })
      }

      // Si no se detectó nada específico, agregar pasos básicos
      if (generatedSteps.length === 0) {
        addStep('log_message', 'fa-terminal', 'Registrar Inicio de Proceso', { message: 'Iniciando automatización...' })
        addStep('message_box', 'fa-window-restore', 'Proceso Finalizado', { message: 'Automatización completada' })
      } else {
        addStep('message_box', 'fa-window-restore', 'Proceso Completado', { message: 'Automatización finalizada exitosamente' })
      }
    }

    // ============================================================
    // GENERACIÓN DE PASOS BASADOS EN ANÁLISIS SEMÁNTICO
    // ============================================================

    // Si no se generaron pasos con los flujos predefinidos, usar análisis semántico
    if (generatedSteps.length === 0 && actionPhrases.length > 0) {
      console.log('[IA] Usando análisis semántico para generar pasos...')

      // Generar un paso para cada frase de acción detectada
      for (const phrase of actionPhrases) {
        addCustomStep(phrase.label, `Acción: ${phrase.verb} - Objeto: ${phrase.objeto}`, {
          verbo: phrase.verb,
          objeto: phrase.objeto,
          descripcion: phrase.label
        })
      }

      // Agregar mensaje de finalización
      addStep('message_box', 'fa-window-restore', 'Proceso Completado', { message: 'Workflow generado exitosamente' })
    }

    // Si aún no hay pasos, usar patrones adicionales
    if (generatedSteps.length === 0) {
      console.log('[IA] Usando patrones adicionales...')

      // Patrones adicionales para acciones específicas
      const customActionPatterns = [
        { pattern: /conectar.*con.*(\w+)/i, label: (m) => `Conectar con ${m[1]}`, desc: 'Conexión personalizada' },
        { pattern: /enviar.*a.*(\w+)/i, label: (m) => `Enviar a ${m[1]}`, desc: 'Envío personalizado' },
        { pattern: /procesar.*(\w+)/i, label: (m) => `Procesar ${m[1]}`, desc: 'Procesamiento personalizado' },
        { pattern: /validar.*(\w+)/i, label: (m) => `Validar ${m[1]}`, desc: 'Validación personalizada' },
        { pattern: /transformar.*(\w+)/i, label: (m) => `Transformar ${m[1]}`, desc: 'Transformación personalizada' },
        { pattern: /sincronizar.*(\w+)/i, label: (m) => `Sincronizar ${m[1]}`, desc: 'Sincronización personalizada' },
        { pattern: /integrar.*(\w+)/i, label: (m) => `Integrar ${m[1]}`, desc: 'Integración personalizada' },
        { pattern: /automatizar.*(\w+)/i, label: (m) => `Automatizar ${m[1]}`, desc: 'Automatización personalizada' },
        { pattern: /monitorear.*(\w+)/i, label: (m) => `Monitorear ${m[1]}`, desc: 'Monitoreo personalizado' },
        { pattern: /notificar.*por.*(\w+)/i, label: (m) => `Notificar por ${m[1]}`, desc: 'Notificación personalizada' }
      ]

      for (const { pattern, label, desc } of customActionPatterns) {
        const match = originalPrompt.match(pattern)
        if (match) {
          addCustomStep(label(match), desc, {})
        }
      }
    }

    // Si TODAVÍA no hay pasos, crear componentes basados en palabras clave del prompt
    if (generatedSteps.length === 0) {
      console.log('[IA] Generando componentes basados en el prompt completo...')

      // Dividir el prompt por conectores para identificar múltiples acciones
      const partes = originalPrompt.split(/\s+(?:y|luego|después|entonces|para que|una vez que)\s+/i)

      for (const parte of partes) {
        if (parte.trim().length > 3) {
          // Limpiar y capitalizar
          const cleanParte = parte.trim()
          const label = cleanParte.length > 40 ? cleanParte.substring(0, 40) + '...' : cleanParte

          addCustomStep(label, `Acción personalizada: ${cleanParte}`, {
            descripcion: cleanParte,
            script: `// TODO: Implementar lógica para: ${cleanParte}`
          })
        }
      }

      // Si todavía no hay nada, crear un componente genérico
      if (generatedSteps.length === 0) {
        addCustomStep(
          originalPrompt.length > 40 ? originalPrompt.substring(0, 40) + '...' : originalPrompt,
          `Componente creado por IA: ${originalPrompt}`,
          {
            descripcion: originalPrompt,
            script: `// Implementar: ${originalPrompt}`
          }
        )
      }

      // Agregar mensaje de finalización
      addStep('message_box', 'fa-window-restore', 'Proceso Completado', { message: 'Automatización personalizada finalizada' })
    }

    console.log('[IA] Pasos generados:', generatedSteps.length)
    console.log('[IA] Componentes personalizados nuevos:', newCustomComponents.length)

    // Simular tiempo de procesamiento de IA
    await new Promise(resolve => setTimeout(resolve, 1500))

    // Guardar los nuevos componentes personalizados
    if (newCustomComponents.length > 0) {
      const updatedComponents = [...customComponents, ...newCustomComponents]
      saveCustomComponents(updatedComponents)
      console.log(`[IA] Se crearon ${newCustomComponents.length} componentes personalizados nuevos`)
    }

    setWorkflowSteps(prev => [...prev, ...generatedSteps])
    setIsGeneratingAI(false)
    setShowAIModal(false)
    setAIPrompt('')

    // Mensaje de confirmación
    if (generatedSteps.length > 0) {
      const customCount = newCustomComponents.length
      const message = customCount > 0
        ? `Se generaron ${generatedSteps.length} pasos y ${customCount} componentes personalizados nuevos`
        : `Se generaron ${generatedSteps.length} pasos para tu workflow`
      speak(message)
    }
  }

  // Manejar selección de archivo de video
  const handleVideoSelect = (e) => {
    const file = e.target.files[0]
    if (file) {
      setVideoFile(file)
      setVideoProjectName(file.name.replace(/\.[^/.]+$/, ''))
      setShowVideoImportModal(true)
    }
  }

  // Analizar video y generar workflow
  const analyzeVideoAndGenerateWorkflow = async () => {
    if (!videoFile || !videoProjectName.trim() || !videoSavePath.trim()) return

    setIsAnalyzingVideo(true)
    setVideoAnalysisProgress(0)

    const analysisSteps = [
      { step: 'Preparando video...', duration: 500 },
      { step: 'Extrayendo frames...', duration: 1500 },
      { step: 'Detectando elementos de UI...', duration: 2000 },
      { step: 'Identificando acciones del usuario...', duration: 1500 },
      { step: 'Analizando secuencia de clics...', duration: 1000 },
      { step: 'Reconociendo texto con OCR...', duration: 1500 },
      { step: 'Generando pasos del workflow...', duration: 1000 },
      { step: 'Creando componentes personalizados...', duration: 800 },
      { step: 'Generando documentación...', duration: 1000 },
      { step: 'Guardando proyecto...', duration: 500 }
    ]

    let totalDuration = analysisSteps.reduce((sum, s) => sum + s.duration, 0)
    let elapsed = 0

    for (const analysisStep of analysisSteps) {
      setVideoAnalysisStep(analysisStep.step)
      await new Promise(resolve => setTimeout(resolve, analysisStep.duration))
      elapsed += analysisStep.duration
      setVideoAnalysisProgress(Math.round((elapsed / totalDuration) * 100))
    }

    // Generar workflow simulado basado en el video
    const generatedSteps = [
      { id: `vid_${Date.now()}_1`, action: 'browser_open', icon: 'fa-window-maximize', label: 'Abrir Navegador', params: { browser: 'chrome' } },
      { id: `vid_${Date.now()}_2`, action: 'navigate', icon: 'fa-compass', label: 'Navegar a URL', params: { url: 'https://app.ejemplo.com' } },
      { id: `vid_${Date.now()}_3`, action: 'wait_element', icon: 'fa-hourglass-half', label: 'Esperar Carga', params: { timeout: 10000 } },
      { id: `vid_${Date.now()}_4`, action: 'type', icon: 'fa-keyboard', label: 'Escribir Usuario', params: { selector: '#username', text: '${usuario}' } },
      { id: `vid_${Date.now()}_5`, action: 'type', icon: 'fa-keyboard', label: 'Escribir Contraseña', params: { selector: '#password', text: '${contraseña}' } },
      { id: `vid_${Date.now()}_6`, action: 'click', icon: 'fa-mouse-pointer', label: 'Clic en Login', params: { selector: '#loginBtn' } },
      { id: `vid_${Date.now()}_7`, action: 'wait_element', icon: 'fa-hourglass-half', label: 'Esperar Dashboard', params: { timeout: 15000 } },
      { id: `vid_${Date.now()}_8`, action: 'extract_table', icon: 'fa-table', label: 'Extraer Datos', params: { selector: '.data-table' } },
      { id: `vid_${Date.now()}_9`, action: 'excel_write', icon: 'fa-file-excel', label: 'Guardar en Excel', params: { path: '${rutaArchivo}' } },
      { id: `vid_${Date.now()}_10`, action: 'message_box', icon: 'fa-window-restore', label: 'Proceso Completado', params: { message: 'Datos extraídos exitosamente' } }
    ]

    // Agregar variables detectadas
    const detectedVariables = [
      { id: `var_${Date.now()}_1`, name: 'usuario', type: 'string', value: '', description: 'Usuario para login' },
      { id: `var_${Date.now()}_2`, name: 'contraseña', type: 'credential', value: '', description: 'Contraseña del usuario' },
      { id: `var_${Date.now()}_3`, name: 'rutaArchivo', type: 'file', value: '', description: 'Ruta para guardar Excel' }
    ]

    setWorkflowSteps(prev => [...prev, ...generatedSteps])
    setVariables(prev => [...prev, ...detectedVariables])
    setWorkflowName(videoProjectName)

    // Crear documentación del proyecto
    const documentation = {
      projectName: videoProjectName,
      createdAt: new Date().toISOString(),
      description: `Workflow generado automáticamente a partir del análisis del video "${videoFile.name}".`,
      steps: generatedSteps.length,
      variables: detectedVariables.length,
      savePath: videoSavePath,
      videoSource: videoFile.name
    }

    // Guardar en localStorage como proyecto
    const projects = JSON.parse(localStorage.getItem('alqvimia_video_projects') || '[]')
    projects.push(documentation)
    localStorage.setItem('alqvimia_video_projects', JSON.stringify(projects))

    setIsAnalyzingVideo(false)
    setShowVideoImportModal(false)

    // Mostrar mensaje de éxito con la ubicación
    speak(`Proyecto guardado exitosamente en ${videoSavePath}`)
    alert(`✅ Workflow generado exitosamente\n\n📁 Proyecto: ${videoProjectName}\n📍 Ubicación: ${videoSavePath}\n📊 Pasos detectados: ${generatedSteps.length}\n📝 Variables creadas: ${detectedVariables.length}\n\nLa documentación del proceso ha sido generada automáticamente.`)

    // Limpiar estados
    setVideoFile(null)
    setVideoProjectName('')
    setVideoAnalysisProgress(0)
    setVideoAnalysisStep('')
  }

  // Generar diagrama Mermaid desde el workflow actual
  const generateDiagramFromWorkflow = useCallback(() => {
    if (workflowSteps.length === 0) {
      setDiagramCode(`${diagramType === 'flowchart' ? 'flowchart' : diagramType} ${diagramDirection}\n    A[Inicio] --> B[Sin pasos]\n    B --> C[Fin]`)
      return
    }

    setIsGeneratingDiagram(true)
    let code = ''

    // Generar código según el tipo de diagrama
    switch (diagramType) {
      case 'flowchart':
        code = generateFlowchart()
        break
      case 'sequence':
        code = generateSequenceDiagram()
        break
      case 'state':
        code = generateStateDiagram()
        break
      case 'journey':
        code = generateJourneyDiagram()
        break
      case 'gantt':
        code = generateGanttDiagram()
        break
      case 'pie':
        code = generatePieDiagram()
        break
      case 'mindmap':
        code = generateMindmap()
        break
      default:
        code = generateFlowchart()
    }

    setDiagramCode(code)
    setIsGeneratingDiagram(false)

    // Renderizar con Mermaid después de actualizar el código
    setTimeout(() => renderMermaidDiagram(code), 100)
  }, [workflowSteps, diagramType, diagramDirection, workflowName])

  // Generar flowchart
  const generateFlowchart = () => {
    let code = `flowchart ${diagramDirection}\n`
    code += `    start([🚀 Inicio: ${workflowName}])\n`

    workflowSteps.forEach((step, index) => {
      const nodeId = `step${index}`
      const nextId = index < workflowSteps.length - 1 ? `step${index + 1}` : 'endNode'
      const icon = getStepEmoji(step.action)

      // Determinar el tipo de nodo según la acción
      if (step.action.includes('if') || step.action.includes('condition')) {
        code += `    ${nodeId}{${icon} ${step.label}}\n`
        code += `    ${index === 0 ? 'start' : `step${index - 1}`} --> ${nodeId}\n`
        code += `    ${nodeId} -->|Sí| ${nextId}\n`
        code += `    ${nodeId} -->|No| ${nextId}\n`
      } else if (step.action.includes('loop') || step.action.includes('for') || step.action.includes('while')) {
        code += `    ${nodeId}[/${icon} ${step.label}/]\n`
        if (index === 0) {
          code += `    start --> ${nodeId}\n`
        }
        code += `    ${nodeId} --> ${nextId}\n`
        code += `    ${nodeId} -.->|Repetir| ${nodeId}\n`
      } else if (step.action.includes('try') || step.action.includes('catch')) {
        code += `    ${nodeId}[[${icon} ${step.label}]]\n`
        if (index === 0) {
          code += `    start --> ${nodeId}\n`
        } else {
          code += `    step${index - 1} --> ${nodeId}\n`
        }
        code += `    ${nodeId} --> ${nextId}\n`
      } else {
        code += `    ${nodeId}[${icon} ${step.label}]\n`
        if (index === 0) {
          code += `    start --> ${nodeId}\n`
        } else {
          code += `    step${index - 1} --> ${nodeId}\n`
        }
      }
    })

    code += `    endNode([✅ Fin])\n`
    if (workflowSteps.length > 0) {
      code += `    step${workflowSteps.length - 1} --> endNode\n`
    } else {
      code += `    start --> endNode\n`
    }

    // Agregar estilos
    code += `\n    style start fill:#22c55e,stroke:#16a34a,color:#fff\n`
    code += `    style endNode fill:#3b82f6,stroke:#2563eb,color:#fff\n`

    return code
  }

  // Generar diagrama de secuencia
  const generateSequenceDiagram = () => {
    let code = `sequenceDiagram\n`
    code += `    autonumber\n`
    code += `    participant U as 👤 Usuario\n`
    code += `    participant S as 🤖 Sistema\n`
    code += `    participant A as 🎯 Aplicación\n\n`

    workflowSteps.forEach((step, index) => {
      const icon = getStepEmoji(step.action)
      if (step.action.includes('click') || step.action.includes('type') || step.action.includes('input')) {
        code += `    U->>+A: ${icon} ${step.label}\n`
        code += `    A-->>-U: ✓ Completado\n`
      } else if (step.action.includes('wait') || step.action.includes('delay')) {
        code += `    Note over S: ⏳ ${step.label}\n`
      } else if (step.action.includes('browser') || step.action.includes('navigate')) {
        code += `    U->>+S: ${icon} ${step.label}\n`
        code += `    S->>+A: Ejecutar acción\n`
        code += `    A-->>-S: Respuesta\n`
        code += `    S-->>-U: ✓ Listo\n`
      } else {
        code += `    S->>A: ${icon} ${step.label}\n`
      }
    })

    return code
  }

  // Generar diagrama de estados
  const generateStateDiagram = () => {
    let code = `stateDiagram-v2\n`
    code += `    [*] --> Inicio\n`

    workflowSteps.forEach((step, index) => {
      const currentState = index === 0 ? 'Inicio' : `Estado${index}`
      const nextState = index < workflowSteps.length - 1 ? `Estado${index + 1}` : 'Fin'
      const icon = getStepEmoji(step.action)

      code += `    state "${icon} ${step.label}" as ${currentState === 'Inicio' ? 'Inicio' : currentState}\n`
      code += `    ${currentState} --> ${nextState}\n`
    })

    code += `    Fin --> [*]\n`
    return code
  }

  // Generar diagrama de journey
  const generateJourneyDiagram = () => {
    let code = `journey\n`
    code += `    title ${workflowName}\n`

    const sections = {}
    workflowSteps.forEach((step) => {
      const category = getCategoryForAction(step.action)
      if (!sections[category]) sections[category] = []
      sections[category].push(step)
    })

    Object.entries(sections).forEach(([section, steps]) => {
      code += `    section ${section}\n`
      steps.forEach((step, idx) => {
        const score = Math.min(5, Math.max(1, 5 - idx % 3))
        code += `        ${step.label}: ${score}: Sistema\n`
      })
    })

    return code
  }

  // Generar diagrama Gantt
  const generateGanttDiagram = () => {
    let code = `gantt\n`
    code += `    title Cronograma: ${workflowName}\n`
    code += `    dateFormat YYYY-MM-DD\n`
    code += `    section Ejecución\n`

    workflowSteps.forEach((step, index) => {
      const duration = step.action.includes('wait') || step.action.includes('delay') ? '2d' : '1d'
      const startDate = index === 0 ? 'after start' : `after task${index}`
      code += `        ${step.label} :task${index + 1}, ${index === 0 ? '2024-01-01' : startDate}, ${duration}\n`
    })

    return code
  }

  // Generar diagrama de pie
  const generatePieDiagram = () => {
    const actionCounts = {}
    workflowSteps.forEach(step => {
      const category = getCategoryForAction(step.action)
      actionCounts[category] = (actionCounts[category] || 0) + 1
    })

    let code = `pie showData\n`
    code += `    title Distribución de acciones en ${workflowName}\n`
    Object.entries(actionCounts).forEach(([category, count]) => {
      code += `    "${category}" : ${count}\n`
    })

    return code
  }

  // Generar mindmap
  const generateMindmap = () => {
    let code = `mindmap\n`
    code += `  root((${workflowName}))\n`

    const categories = {}
    workflowSteps.forEach(step => {
      const cat = getCategoryForAction(step.action)
      if (!categories[cat]) categories[cat] = []
      categories[cat].push(step)
    })

    Object.entries(categories).forEach(([cat, steps]) => {
      code += `    ${cat}\n`
      steps.forEach(step => {
        code += `      ${step.label}\n`
      })
    })

    return code
  }

  // Obtener emoji según la acción
  const getStepEmoji = (action) => {
    const emojiMap = {
      'browser': '🌐', 'navigate': '🧭', 'click': '🖱️', 'type': '⌨️',
      'wait': '⏳', 'delay': '⏰', 'if': '❓', 'condition': '🔀',
      'loop': '🔄', 'for': '🔁', 'while': '♻️', 'excel': '📊',
      'file': '📁', 'email': '📧', 'database': '🗄️', 'api': '🔌',
      'message': '💬', 'notification': '🔔', 'screenshot': '📸',
      'extract': '📤', 'try': '🛡️', 'catch': '🚨', 'throw': '⚠️'
    }
    const key = Object.keys(emojiMap).find(k => action.toLowerCase().includes(k))
    return emojiMap[key] || '▶️'
  }

  // Obtener categoría para una acción
  const getCategoryForAction = (action) => {
    const categoryMap = {
      'browser': 'Web', 'navigate': 'Web', 'click': 'Interacción', 'type': 'Interacción',
      'wait': 'Control', 'delay': 'Control', 'if': 'Lógica', 'condition': 'Lógica',
      'loop': 'Iteración', 'for': 'Iteración', 'excel': 'Excel', 'file': 'Archivos',
      'email': 'Email', 'database': 'Base de Datos', 'message': 'Mensajes'
    }
    const key = Object.keys(categoryMap).find(k => action.toLowerCase().includes(k))
    return categoryMap[key] || 'General'
  }

  // Renderizar diagrama con Mermaid
  const renderMermaidDiagram = async (code) => {
    if (!diagramContainerRef.current) return

    try {
      // Usar Mermaid para renderizar
      const container = diagramContainerRef.current
      container.innerHTML = `<pre class="mermaid">${code}</pre>`

      // Si mermaid está disponible globalmente, renderizar
      if (window.mermaid) {
        await window.mermaid.run({ nodes: container.querySelectorAll('.mermaid') })
      }
    } catch (err) {
      console.error('Error rendering Mermaid diagram:', err)
    }
  }

  // Exportar diagrama a PDF
  const exportDiagramToPDF = async () => {
    const container = diagramContainerRef.current
    if (!container) return

    try {
      // Crear un canvas desde el SVG
      const svg = container.querySelector('svg')
      if (!svg) {
        alert('Primero genera el diagrama antes de exportar')
        return
      }

      // Clonar SVG para manipularlo
      const svgClone = svg.cloneNode(true)
      svgClone.setAttribute('xmlns', 'http://www.w3.org/2000/svg')

      // Convertir a imagen
      const svgData = new XMLSerializer().serializeToString(svgClone)
      const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' })
      const svgUrl = URL.createObjectURL(svgBlob)

      // Crear imagen
      const img = new Image()
      img.onload = () => {
        const canvas = document.createElement('canvas')
        const padding = 40
        canvas.width = img.width + padding * 2
        canvas.height = img.height + padding * 2 + 80

        const ctx = canvas.getContext('2d')

        // Fondo blanco
        ctx.fillStyle = '#ffffff'
        ctx.fillRect(0, 0, canvas.width, canvas.height)

        // Título
        ctx.fillStyle = '#1f2937'
        ctx.font = 'bold 24px Arial'
        ctx.textAlign = 'center'
        ctx.fillText(`Diagrama: ${workflowName}`, canvas.width / 2, 35)

        // Subtítulo
        ctx.fillStyle = '#6b7280'
        ctx.font = '14px Arial'
        ctx.fillText(`Tipo: ${diagramType.charAt(0).toUpperCase() + diagramType.slice(1)} | Generado: ${new Date().toLocaleString()}`, canvas.width / 2, 55)

        // Dibujar imagen
        ctx.drawImage(img, padding, 70)

        // Footer
        ctx.fillStyle = '#9ca3af'
        ctx.font = '12px Arial'
        ctx.fillText('Generado con Alqvimia 2.0', canvas.width / 2, canvas.height - 15)

        // Convertir a PDF usando jsPDF o descargar como imagen
        const link = document.createElement('a')
        link.download = `diagrama_${workflowName.replace(/\s+/g, '_')}_${Date.now()}.png`
        link.href = canvas.toDataURL('image/png')
        link.click()

        URL.revokeObjectURL(svgUrl)
        speak('Diagrama exportado exitosamente')
      }

      img.src = svgUrl
    } catch (err) {
      console.error('Error exporting diagram:', err)
      alert('Error al exportar el diagrama')
    }
  }

  // Copiar código Mermaid al portapapeles
  const copyDiagramCode = () => {
    navigator.clipboard.writeText(diagramCode)
    speak('Código copiado al portapapeles')
  }

  // Toggle dictado de voz para IA de diagramas
  const toggleDiagramDictation = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      speak('Tu navegador no soporta reconocimiento de voz')
      return
    }

    if (isDiagramDictating) {
      if (window.diagramRecognition) {
        window.diagramRecognition.stop()
      }
      setIsDiagramDictating(false)
      return
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    const recognition = new SpeechRecognition()
    recognition.lang = 'es-ES'
    recognition.continuous = true
    recognition.interimResults = true

    recognition.onstart = () => {
      setIsDiagramDictating(true)
      speak('Escuchando... describe tu diagrama')
    }

    recognition.onresult = (event) => {
      let finalTranscript = ''
      let interimTranscript = ''

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript
        if (event.results[i].isFinal) {
          finalTranscript += transcript + ' '
        } else {
          interimTranscript = transcript
        }
      }

      if (finalTranscript) {
        setDiagramAIPrompt(prev => prev + finalTranscript)
      }
    }

    recognition.onerror = (event) => {
      console.error('Error de reconocimiento:', event.error)
      setIsDiagramDictating(false)
      speak('Error en el reconocimiento de voz')
    }

    recognition.onend = () => {
      setIsDiagramDictating(false)
    }

    window.diagramRecognition = recognition
    recognition.start()
  }

  // Generar diagrama desde descripción de texto con IA
  const generateDiagramFromAI = async () => {
    if (!diagramAIPrompt.trim()) {
      speak('Por favor, describe el diagrama que deseas generar')
      return
    }

    setIsGeneratingDiagramFromAI(true)
    speak('Generando diagrama desde tu descripción')

    try {
      // Analizar la descripción y generar código Mermaid
      const prompt = diagramAIPrompt.toLowerCase()
      let mermaidCode = ''

      // Detectar tipo de diagrama basado en palabras clave
      let detectedType = diagramType
      if (prompt.includes('secuencia') || prompt.includes('sequence') || prompt.includes('interacci')) {
        detectedType = 'sequence'
        setDiagramType('sequence')
      } else if (prompt.includes('estado') || prompt.includes('state') || prompt.includes('transici')) {
        detectedType = 'state'
        setDiagramType('state')
      } else if (prompt.includes('gantt') || prompt.includes('cronograma') || prompt.includes('timeline')) {
        detectedType = 'gantt'
        setDiagramType('gantt')
      } else if (prompt.includes('pastel') || prompt.includes('pie') || prompt.includes('porcentaje')) {
        detectedType = 'pie'
        setDiagramType('pie')
      } else if (prompt.includes('mente') || prompt.includes('mind') || prompt.includes('ideas')) {
        detectedType = 'mindmap'
        setDiagramType('mindmap')
      } else if (prompt.includes('viaje') || prompt.includes('journey') || prompt.includes('experiencia')) {
        detectedType = 'journey'
        setDiagramType('journey')
      }

      // Extraer pasos del texto
      const steps = extractStepsFromDescription(prompt)

      // Generar código según el tipo de diagrama
      switch (detectedType) {
        case 'flowchart':
          mermaidCode = generateFlowchartFromSteps(steps)
          break
        case 'sequence':
          mermaidCode = generateSequenceFromSteps(steps)
          break
        case 'state':
          mermaidCode = generateStateFromSteps(steps)
          break
        case 'journey':
          mermaidCode = generateJourneyFromSteps(steps)
          break
        case 'gantt':
          mermaidCode = generateGanttFromSteps(steps)
          break
        case 'pie':
          mermaidCode = generatePieFromSteps(steps)
          break
        case 'mindmap':
          mermaidCode = generateMindmapFromSteps(steps)
          break
        default:
          mermaidCode = generateFlowchartFromSteps(steps)
      }

      setDiagramCode(mermaidCode)
      setTimeout(() => renderMermaidDiagram(mermaidCode), 100)
      speak('Diagrama generado exitosamente')
    } catch (error) {
      console.error('Error generando diagrama:', error)
      speak('Error al generar el diagrama')
    } finally {
      setIsGeneratingDiagramFromAI(false)
    }
  }

  // Extraer pasos de una descripción en lenguaje natural
  const extractStepsFromDescription = (description) => {
    const steps = []

    // Patrones para detectar pasos
    const patterns = [
      /primero\s+(.+?)(?:,|\.|luego|después|entonces|y\s+después|$)/gi,
      /segundo\s+(.+?)(?:,|\.|luego|después|entonces|y\s+después|$)/gi,
      /tercero\s+(.+?)(?:,|\.|luego|después|entonces|y\s+después|$)/gi,
      /cuarto\s+(.+?)(?:,|\.|luego|después|entonces|y\s+después|$)/gi,
      /quinto\s+(.+?)(?:,|\.|luego|después|entonces|y\s+después|$)/gi,
      /luego\s+(.+?)(?:,|\.|después|entonces|y\s+después|$)/gi,
      /después\s+(.+?)(?:,|\.|luego|entonces|y\s+después|$)/gi,
      /entonces\s+(.+?)(?:,|\.|luego|después|y\s+después|$)/gi,
      /paso\s*\d*[:\s]+(.+?)(?:,|\.|luego|después|entonces|$)/gi,
      /(\d+)[\.:\)]\s*(.+?)(?:,|$)/gi
    ]

    // Primero buscar pasos numerados
    const numberedPattern = /(\d+)[\.:\)]\s*([^,\.\d]+)/g
    let match
    while ((match = numberedPattern.exec(description)) !== null) {
      steps.push({
        order: parseInt(match[1]),
        text: match[2].trim(),
        type: detectStepType(match[2])
      })
    }

    // Si no hay pasos numerados, buscar con palabras clave
    if (steps.length === 0) {
      // Dividir por conectores
      const connectors = /(?:primero|segundo|tercero|cuarto|quinto|luego|después|entonces|finalmente|por último|al final)/gi
      const parts = description.split(connectors).filter(p => p.trim())

      parts.forEach((part, index) => {
        const cleaned = part.replace(/^[,.\s]+|[,.\s]+$/g, '').trim()
        if (cleaned.length > 2) {
          steps.push({
            order: index + 1,
            text: cleaned,
            type: detectStepType(cleaned)
          })
        }
      })
    }

    // Si aún no hay pasos, dividir por comas o puntos
    if (steps.length === 0) {
      const parts = description.split(/[,.]/).filter(p => p.trim().length > 3)
      parts.forEach((part, index) => {
        steps.push({
          order: index + 1,
          text: part.trim(),
          type: detectStepType(part)
        })
      })
    }

    // Si solo hay un bloque de texto, crear pasos genéricos
    if (steps.length === 0 && description.trim()) {
      steps.push({
        order: 1,
        text: 'Inicio del proceso',
        type: 'start'
      })
      steps.push({
        order: 2,
        text: description.trim().substring(0, 50),
        type: 'process'
      })
      steps.push({
        order: 3,
        text: 'Fin del proceso',
        type: 'end'
      })
    }

    return steps.sort((a, b) => a.order - b.order)
  }

  // Detectar tipo de paso basado en contenido
  const detectStepType = (text) => {
    const lower = text.toLowerCase()
    if (lower.includes('si ') || lower.includes('si,') || lower.includes('condici') || lower.includes('verificar') || lower.includes('comprobar')) {
      return 'decision'
    }
    if (lower.includes('bucle') || lower.includes('repet') || lower.includes('mientras') || lower.includes('para cada') || lower.includes('iterar')) {
      return 'loop'
    }
    if (lower.includes('error') || lower.includes('excepci') || lower.includes('catch') || lower.includes('try')) {
      return 'error'
    }
    if (lower.includes('espera') || lower.includes('delay') || lower.includes('pausa')) {
      return 'wait'
    }
    if (lower.includes('clic') || lower.includes('click') || lower.includes('presionar')) {
      return 'click'
    }
    if (lower.includes('escribir') || lower.includes('ingresa') || lower.includes('teclear') || lower.includes('input')) {
      return 'input'
    }
    if (lower.includes('navega') || lower.includes('abrir') || lower.includes('ir a') || lower.includes('url')) {
      return 'browser'
    }
    if (lower.includes('guardar') || lower.includes('save') || lower.includes('exportar')) {
      return 'save'
    }
    if (lower.includes('enviar') || lower.includes('send') || lower.includes('email') || lower.includes('mensaje')) {
      return 'send'
    }
    return 'process'
  }

  // Generar flowchart desde pasos extraídos
  const generateFlowchartFromSteps = (steps) => {
    let code = `flowchart ${diagramDirection}\n`
    code += `    start([🚀 Inicio])\n`

    steps.forEach((step, index) => {
      const nodeId = `step${index}`
      const nextId = index < steps.length - 1 ? `step${index + 1}` : 'endNode'
      const icon = getIconForStepType(step.type)

      if (step.type === 'decision') {
        code += `    ${nodeId}{${icon} ${step.text}}\n`
        code += `    ${index === 0 ? 'start' : `step${index - 1}`} --> ${nodeId}\n`
        code += `    ${nodeId} -->|Sí| ${nextId}\n`
        code += `    ${nodeId} -->|No| ${nextId}\n`
      } else if (step.type === 'loop') {
        code += `    ${nodeId}[/${icon} ${step.text}/]\n`
        if (index === 0) code += `    start --> ${nodeId}\n`
        else code += `    step${index - 1} --> ${nodeId}\n`
        code += `    ${nodeId} --> ${nextId}\n`
        code += `    ${nodeId} -.->|Repetir| ${nodeId}\n`
      } else {
        code += `    ${nodeId}[${icon} ${step.text}]\n`
        if (index === 0) code += `    start --> ${nodeId}\n`
        else code += `    step${index - 1} --> ${nodeId}\n`
      }
    })

    code += `    endNode([✅ Fin])\n`
    if (steps.length > 0) {
      code += `    step${steps.length - 1} --> endNode\n`
    } else {
      code += `    start --> endNode\n`
    }

    code += `\n    style start fill:#22c55e,stroke:#16a34a,color:#fff\n`
    code += `    style endNode fill:#3b82f6,stroke:#2563eb,color:#fff\n`

    return code
  }

  // Generar diagrama de secuencia desde pasos
  const generateSequenceFromSteps = (steps) => {
    let code = `sequenceDiagram\n`
    code += `    autonumber\n`
    code += `    participant U as 👤 Usuario\n`
    code += `    participant S as 🤖 Sistema\n`
    code += `    participant A as 🎯 Aplicación\n\n`

    steps.forEach((step) => {
      const icon = getIconForStepType(step.type)
      if (step.type === 'input' || step.type === 'click') {
        code += `    U->>+A: ${icon} ${step.text}\n`
        code += `    A-->>-U: ✓ Completado\n`
      } else if (step.type === 'wait') {
        code += `    Note over S: ⏳ ${step.text}\n`
      } else if (step.type === 'browser') {
        code += `    U->>+S: ${icon} ${step.text}\n`
        code += `    S->>+A: Ejecutar\n`
        code += `    A-->>-S: OK\n`
        code += `    S-->>-U: ✓ Listo\n`
      } else {
        code += `    S->>A: ${icon} ${step.text}\n`
      }
    })

    return code
  }

  // Generar diagrama de estados desde pasos
  const generateStateFromSteps = (steps) => {
    let code = `stateDiagram-v2\n`
    code += `    [*] --> Inicio\n`

    steps.forEach((step, index) => {
      const currentState = index === 0 ? 'Inicio' : `Estado${index}`
      const nextState = index < steps.length - 1 ? `Estado${index + 1}` : 'Fin'
      const icon = getIconForStepType(step.type)

      code += `    state "${icon} ${step.text}" as ${currentState}\n`
      code += `    ${currentState} --> ${nextState}\n`
    })

    code += `    Fin --> [*]\n`
    return code
  }

  // Generar diagrama journey desde pasos
  const generateJourneyFromSteps = (steps) => {
    let code = `journey\n`
    code += `    title Proceso del Usuario\n`
    code += `    section Flujo Principal\n`

    steps.forEach((step) => {
      const score = step.type === 'error' ? 2 : step.type === 'wait' ? 4 : 5
      code += `      ${step.text}: ${score}: Usuario, Sistema\n`
    })

    return code
  }

  // Generar diagrama Gantt desde pasos
  const generateGanttFromSteps = (steps) => {
    let code = `gantt\n`
    code += `    title Cronograma del Proceso\n`
    code += `    dateFormat YYYY-MM-DD\n`
    code += `    section Tareas\n`

    steps.forEach((step, index) => {
      const duration = step.type === 'wait' ? '2d' : '1d'
      const dependency = index > 0 ? `, after task${index}` : ''
      code += `    ${step.text} :task${index + 1}${dependency}, ${duration}\n`
    })

    return code
  }

  // Generar diagrama pie desde pasos
  const generatePieFromSteps = (steps) => {
    let code = `pie showData\n`
    code += `    title Distribución de Pasos\n`

    const typeCounts = {}
    steps.forEach(step => {
      typeCounts[step.type] = (typeCounts[step.type] || 0) + 1
    })

    const typeLabels = {
      process: 'Procesos',
      decision: 'Decisiones',
      loop: 'Bucles',
      input: 'Entradas',
      click: 'Clics',
      browser: 'Navegación',
      wait: 'Esperas',
      save: 'Guardados',
      send: 'Envíos',
      error: 'Errores'
    }

    Object.entries(typeCounts).forEach(([type, count]) => {
      code += `    "${typeLabels[type] || type}" : ${count}\n`
    })

    return code
  }

  // Generar mindmap desde pasos
  const generateMindmapFromSteps = (steps) => {
    let code = `mindmap\n`
    code += `  root((Proceso))\n`

    steps.forEach((step) => {
      const icon = getIconForStepType(step.type)
      code += `    ${icon} ${step.text}\n`
    })

    return code
  }

  // Obtener icono según tipo de paso
  const getIconForStepType = (type) => {
    const icons = {
      process: '⚙️',
      decision: '❓',
      loop: '🔄',
      input: '⌨️',
      click: '🖱️',
      browser: '🌐',
      wait: '⏳',
      save: '💾',
      send: '📤',
      error: '⚠️',
      start: '🚀',
      end: '✅'
    }
    return icons[type] || '📌'
  }

  // Generar workflow desde el diagrama actual
  const generateWorkflowFromDiagram = () => {
    if (!diagramCode) {
      speak('Primero genera un diagrama')
      return
    }

    setIsGeneratingWorkflowFromDiagram(true)
    speak('Generando workflow desde el diagrama')

    try {
      const newSteps = []
      const lines = diagramCode.split('\n')

      // Parsear el código Mermaid para extraer nodos
      lines.forEach((line, index) => {
        // Buscar definiciones de nodos en flowchart
        const flowchartMatch = line.match(/\s*(\w+)\s*[\[\{\(]+(.*?)[\]\}\)]+/)
        if (flowchartMatch && !line.includes('style') && !line.includes('-->')) {
          const nodeId = flowchartMatch[1]
          let label = flowchartMatch[2].replace(/[🚀✅⚙️❓🔄⌨️🖱️🌐⏳💾📤⚠️📌]/g, '').trim()

          // Ignorar nodos de inicio y fin
          if (nodeId === 'start' || nodeId === 'endNode' || label.toLowerCase().includes('inicio') || label.toLowerCase().includes('fin')) {
            return
          }

          // Determinar el tipo de acción basado en el contenido
          const action = determineActionFromLabel(label)

          // Buscar si existe un componente similar
          const existingComponent = findExistingComponent(action.type, label)

          if (existingComponent) {
            newSteps.push({
              id: Date.now() + index,
              action: existingComponent.action,
              icon: existingComponent.icon,
              label: label,
              params: { ...existingComponent.defaultParams },
              suggested: true,
              originalComponent: existingComponent
            })
          } else {
            newSteps.push({
              id: Date.now() + index,
              action: action.type,
              icon: action.icon,
              label: label,
              params: action.defaultParams || {},
              isNew: true
            })
          }
        }

        // Buscar pasos en diagrama de secuencia
        const sequenceMatch = line.match(/\s*\w+->>[\+]?\w+:\s*(.+)/)
        if (sequenceMatch) {
          const label = sequenceMatch[1].replace(/[🚀✅⚙️❓🔄⌨️🖱️🌐⏳💾📤⚠️📌✓]/g, '').trim()
          if (label && !label.includes('Completado') && !label.includes('OK') && !label.includes('Listo')) {
            const action = determineActionFromLabel(label)
            newSteps.push({
              id: Date.now() + index,
              action: action.type,
              icon: action.icon,
              label: label,
              params: action.defaultParams || {},
              isNew: true
            })
          }
        }

        // Buscar pasos en diagrama de estados
        const stateMatch = line.match(/state\s+"(.+?)"\s+as/)
        if (stateMatch) {
          const label = stateMatch[1].replace(/[🚀✅⚙️❓🔄⌨️🖱️🌐⏳💾📤⚠️📌]/g, '').trim()
          const action = determineActionFromLabel(label)
          newSteps.push({
            id: Date.now() + index,
            action: action.type,
            icon: action.icon,
            label: label,
            params: action.defaultParams || {},
            isNew: true
          })
        }
      })

      // Agregar los pasos al workflow
      if (newSteps.length > 0) {
        setWorkflowSteps(prev => [...prev, ...newSteps])
        speak(`Se agregaron ${newSteps.length} pasos al workflow`)
        setShowDiagramModal(false)
      } else {
        speak('No se encontraron pasos para agregar')
      }
    } catch (error) {
      console.error('Error generando workflow:', error)
      speak('Error al generar el workflow')
    } finally {
      setIsGeneratingWorkflowFromDiagram(false)
    }
  }

  // Determinar acción basada en la etiqueta
  const determineActionFromLabel = (label) => {
    const lower = label.toLowerCase()

    if (lower.includes('clic') || lower.includes('click') || lower.includes('presionar')) {
      return { type: 'click', icon: 'fa-mouse-pointer', defaultParams: { selector: '' } }
    }
    if (lower.includes('escribir') || lower.includes('teclear') || lower.includes('input') || lower.includes('ingresa')) {
      return { type: 'type', icon: 'fa-keyboard', defaultParams: { text: '', selector: '' } }
    }
    if (lower.includes('navegar') || lower.includes('abrir') || lower.includes('ir a') || lower.includes('url')) {
      return { type: 'navigate', icon: 'fa-compass', defaultParams: { url: '' } }
    }
    if (lower.includes('esperar') || lower.includes('delay') || lower.includes('pausa')) {
      return { type: 'delay', icon: 'fa-clock', defaultParams: { duration: 1000 } }
    }
    if (lower.includes('condici') || lower.includes('si ') || lower.includes('verificar')) {
      return { type: 'if_condition', icon: 'fa-question', defaultParams: { condition: '' }, isContainer: true }
    }
    if (lower.includes('bucle') || lower.includes('repetir') || lower.includes('mientras')) {
      return { type: 'while_loop', icon: 'fa-sync', defaultParams: { condition: '' }, isContainer: true }
    }
    if (lower.includes('para cada') || lower.includes('foreach')) {
      return { type: 'for_each', icon: 'fa-list', defaultParams: { collection: '' }, isContainer: true }
    }
    if (lower.includes('guardar') || lower.includes('save')) {
      return { type: 'write_file', icon: 'fa-save', defaultParams: { path: '', content: '' } }
    }
    if (lower.includes('enviar') || lower.includes('email') || lower.includes('mensaje')) {
      return { type: 'send_email', icon: 'fa-envelope', defaultParams: { to: '', subject: '', body: '' } }
    }
    if (lower.includes('captura') || lower.includes('screenshot')) {
      return { type: 'screenshot', icon: 'fa-camera', defaultParams: { path: '' } }
    }
    if (lower.includes('extraer') || lower.includes('obtener texto')) {
      return { type: 'get_text', icon: 'fa-font', defaultParams: { selector: '' } }
    }

    return { type: 'execute_code', icon: 'fa-code', defaultParams: { code: '' } }
  }

  // Buscar componente existente similar
  const findExistingComponent = (actionType, label) => {
    for (const category of WORKFLOW_CATEGORIES) {
      const found = category.actions.find(action => action.action === actionType)
      if (found) {
        return {
          action: found.action,
          icon: found.icon,
          defaultParams: {}
        }
      }
    }
    return null
  }

  const filteredCategories = getCategories().map(cat => ({
    ...cat, actions: cat.actions.filter(action => action.label.toLowerCase().includes(searchTerm.toLowerCase()))
  })).filter(cat => cat.actions.length > 0 || !searchTerm)

  const countSteps = (steps) => steps.reduce((count, step) => count + 1 + (step.children ? countSteps(step.children) : 0), 0)

  const renderListStep = (step, index, depth = 0, globalIndex = null) => {
    const isExpanded = expandedSteps[step.id]
    const isSelected = selectedStep?.id === step.id
    const hasChildren = step.children && step.children.length > 0
    const isContainer = step.isContainer || step.action === 'step_group'
    const hasBreakpoint = breakpoints.has(step.id)
    const isCurrentDebug = currentDebugStep === step.id
    const isConfigured = step.params && Object.keys(step.params).length > 0
    const isDragging = draggedStep?.id === step.id
    const isDragOver = dragOverStep === step.id
    const stepNumber = globalIndex !== null ? globalIndex : index + 1
    const isFirstStep = depth === 0 && index === 0
    const isLastStep = depth === 0 && index === workflowSteps.length - 1

    return (
      <div key={step.id} className="workflow-list-item-wrapper">
        {/* Drop zone before */}
        {isDragOver && dragPosition === 'before' && (
          <div className="step-drop-indicator before"></div>
        )}
        <div
          className={`workflow-list-item ${isSelected ? 'selected' : ''} ${isContainer ? 'is-container' : ''} ${hasBreakpoint ? 'has-breakpoint' : ''} ${isCurrentDebug ? 'debug-current' : ''} ${isDragging ? 'dragging' : ''}`}
          style={{ paddingLeft: `${depth * 24 + 12}px` }}
          draggable={depth === 0}
          onDragStart={(e) => depth === 0 && handleStepDragStart(e, step)}
          onDragOver={(e) => {
            const rect = e.currentTarget.getBoundingClientRect()
            const y = e.clientY - rect.top
            const position = y < rect.height / 2 ? 'before' : 'after'
            handleStepDragOver(e, step, position)
          }}
          onDragLeave={handleStepDragLeave}
          onDrop={(e) => isContainer ? handleDrop(e, step.id) : handleStepDrop(e, step)}
          onDragEnd={handleStepDragEnd}
          onClick={(e) => selectStep(step, e)}
          onContextMenu={(e) => showContextMenu(e, step)}
        >
          {/* Número de paso */}
          <div className="step-number" title={`Paso ${stepNumber}`}>
            {stepNumber}
          </div>
          {/* Handle de arrastre */}
          {depth === 0 && (
            <div className="step-drag-handle" title="Arrastra para reordenar">
              <i className="fas fa-grip-vertical"></i>
            </div>
          )}
          <div className={`breakpoint-gutter ${hasBreakpoint ? 'active' : ''}`} onClick={(e) => { e.stopPropagation(); toggleBreakpoint(step.id) }} title="Toggle breakpoint (F9)">
            {hasBreakpoint && <i className="fas fa-circle"></i>}
          </div>
          {isContainer ? (
            <button className="step-expand-btn" onClick={(e) => { e.stopPropagation(); toggleStepExpanded(step.id) }}>
              <i className={`fas fa-chevron-${isExpanded ? 'down' : 'right'}`}></i>
            </button>
          ) : <span className="step-indent-line"></span>}
          <div className={`step-type-icon ${isContainer ? 'container-icon' : ''}`}><i className={`fas ${step.icon}`}></i></div>
          <div className="step-info">
            <span className="step-title">
              {step.label}
              {step.params?.name && <span className="step-param-preview">: "{step.params.name}"</span>}
              {step.params?.url && <span className="step-param-preview">: {step.params.url}</span>}
              {step.params?.message && <span className="step-param-preview">: "{step.params.message}"</span>}
              {step.params?.variable && <span className="step-param-preview"> → ${step.params.variable}</span>}
              {step.params?.description && <span className="step-description"> - {step.params.description}</span>}
            </span>
          </div>
          <div className="step-indicators">
            {isConfigured && <span className="step-indicator configured" title="Configurado"><i className="fas fa-check"></i></span>}
          </div>
          {/* Botones de mover arriba/abajo */}
          {depth === 0 && (
            <div className="step-move-buttons">
              <button
                className="step-move-btn"
                onClick={(e) => { e.stopPropagation(); moveStepUp(step.id) }}
                disabled={isFirstStep}
                title="Mover arriba"
              >
                <i className="fas fa-chevron-up"></i>
              </button>
              <button
                className="step-move-btn"
                onClick={(e) => { e.stopPropagation(); moveStepDown(step.id) }}
                disabled={isLastStep}
                title="Mover abajo"
              >
                <i className="fas fa-chevron-down"></i>
              </button>
            </div>
          )}
          <div className="step-menu">
            <button className="step-menu-btn" onClick={(e) => showContextMenu(e, step)} title="Más opciones"><i className="fas fa-ellipsis-v"></i></button>
          </div>
        </div>
        {/* Drop zone after */}
        {isDragOver && dragPosition === 'after' && (
          <div className="step-drop-indicator after"></div>
        )}
        {isContainer && isExpanded && (
          <div className="step-children">
            {hasChildren ? step.children.map((child, childIndex) => renderListStep(child, childIndex, depth + 1)) : (
              <div className="step-drop-zone" style={{ marginLeft: `${(depth + 1) * 24 + 12}px` }} onDrop={(e) => handleDrop(e, step.id)} onDragOver={handleDragOver}>
                <i className="fas fa-plus-circle"></i><span>Arrastra acciones aquí</span>
              </div>
            )}
          </div>
        )}
      </div>
    )
  }

  // Renderizar paso en vista de flujo
  const renderFlowStep = (step, index) => {
    const isSelected = selectedStep?.id === step.id
    const isContainer = step.isContainer || step.action === 'step_group'
    const hasBreakpoint = breakpoints.has(step.id)
    const isCurrentDebug = currentDebugStep === step.id
    const hasChildren = step.children && step.children.length > 0
    const isExpanded = expandedSteps[step.id]
    const stepNumber = index + 1

    return (
      <div key={step.id} className="flow-step-wrapper">
        {/* Conector de entrada */}
        <div className="flow-connector">
          <div className="flow-line"></div>
          <i className="fas fa-caret-down flow-arrow"></i>
        </div>

        <div
          className={`flow-step ${isSelected ? 'selected' : ''} ${isContainer ? 'is-container' : ''} ${hasBreakpoint ? 'has-breakpoint' : ''} ${isCurrentDebug ? 'debug-current' : ''}`}
          onClick={(e) => selectStep(step, e)}
          onContextMenu={(e) => showContextMenu(e, step)}
          draggable
          onDragStart={(e) => handleStepDragStart(e, step)}
          onDragOver={(e) => handleStepDragOver(e, step, 'after')}
          onDragLeave={handleStepDragLeave}
          onDrop={(e) => handleStepDrop(e, step)}
          onDragEnd={handleStepDragEnd}
        >
          <div className="flow-step-header">
            {/* Número de paso */}
            <div className="flow-step-number">{stepNumber}</div>
            {isContainer && (
              <button className="flow-expand-btn" onClick={(e) => { e.stopPropagation(); toggleStepExpanded(step.id) }}>
                <i className={`fas fa-chevron-${isExpanded ? 'down' : 'right'}`}></i>
              </button>
            )}
            <div className="flow-step-icon"><i className={`fas ${step.icon}`}></i></div>
            <span className="flow-step-label">{step.label}</span>
            {/* Botones de mover */}
            <div className="flow-step-move-buttons">
              <button
                className="flow-move-btn"
                onClick={(e) => { e.stopPropagation(); moveStepUp(step.id) }}
                disabled={index === 0}
                title="Mover arriba"
              >
                <i className="fas fa-arrow-up"></i>
              </button>
              <button
                className="flow-move-btn"
                onClick={(e) => { e.stopPropagation(); moveStepDown(step.id) }}
                disabled={index === workflowSteps.length - 1}
                title="Mover abajo"
              >
                <i className="fas fa-arrow-down"></i>
              </button>
            </div>
            <button className="flow-step-menu" onClick={(e) => showContextMenu(e, step)}><i className="fas fa-ellipsis-h"></i></button>
          </div>
          {/* Mostrar descripción si existe */}
          {step.params?.description && (
            <div className="flow-step-description">
              <i className="fas fa-info-circle"></i> {step.params.description}
            </div>
          )}
          {isContainer && isExpanded && (
            <div className="flow-step-body">
              {hasChildren ? step.children.map((child, childIndex) => (
                <div key={child.id} className="flow-child-step" onClick={(e) => { e.stopPropagation(); selectStep(child, e) }}>
                  <span className="flow-child-number">{stepNumber}.{childIndex + 1}</span>
                  <i className={`fas ${child.icon}`}></i>
                  <span>{child.label}</span>
                </div>
              )) : (
                <div className="flow-drop-zone" onDrop={(e) => handleDrop(e, step.id)} onDragOver={handleDragOver}>
                  <i className="fas fa-plus"></i> Arrastra acciones aquí
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="view" id="workflows-view">
      <div
        className="workflow-studio"
        id="workflowStudio"
        style={{
          gridTemplateColumns: leftPanelCollapsed
            ? `50px 0 1fr ${rightPanelCollapsed ? '0 50px' : `6px ${rightPanelWidth}px`}`
            : `${leftPanelWidth}px 6px 1fr ${rightPanelCollapsed ? '0 50px' : `6px ${rightPanelWidth}px`}`
        }}
      >
        <div className="studio-header">
          <div className="workflow-tabs"><button className="workflow-tab active"><i className="fas fa-file"></i><span>{workflowName}</span><i className="fas fa-times close-tab"></i></button></div>
          <button className="btn btn-sm btn-primary" onClick={newWorkflow}><i className="fas fa-plus"></i></button>
        </div>

        <div className={`studio-left-panel ${leftPanelCollapsed ? 'collapsed' : ''}`} style={!leftPanelCollapsed ? { width: leftPanelWidth } : undefined}>
          <div className="panel-header">
            <h3><i className="fas fa-th-large"></i> {!leftPanelCollapsed && t('wf_actions')}</h3>
            <button className="panel-collapse-btn" onClick={() => setLeftPanelCollapsed(!leftPanelCollapsed)}>
              <i className={`fas fa-chevron-${leftPanelCollapsed ? 'right' : 'left'}`}></i>
            </button>
          </div>

          {/* Vista colapsada - solo iconos */}
          {leftPanelCollapsed ? (
            <div className="collapsed-icons">
              {filteredCategories.map(category => (
                <button
                  key={category.id}
                  className="collapsed-icon-btn"
                  title={category.name}
                  onClick={() => {
                    setLeftPanelCollapsed(false)
                    setExpandedCategories(prev => ({ ...prev, [category.id]: true }))
                  }}
                >
                  <i className={`${category.isBrand ? 'fab' : 'fas'} ${category.icon}`}></i>
                </button>
              ))}
            </div>
          ) : (
            <>
              <div className="actions-search">
                <input type="text" placeholder={t('wf_search_actions')} value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
              </div>
              {/* Info de workflow - movido aquí desde status bar */}
              <div className="workflow-quick-stats">
                <span className="stat-badge"><i className="fas fa-list"></i> {workflowSteps.length} pasos</span>
                <span className="stat-badge"><i className="fas fa-cube"></i> {variables.length} vars</span>
              </div>
              <div className="actions-list">
                {filteredCategories.map(category => (
                  <div key={category.id} className={`action-category ${expandedCategories[category.id] ? 'expanded' : ''} ${category.id === 'custom-components' ? 'custom-category' : ''}`}>
                    <div className="category-header" onClick={() => toggleCategory(category.id)}>
                      <i className="fas fa-chevron-right"></i>
                      <i className={`${category.isBrand ? 'fab' : 'fas'} ${category.icon} category-icon`}></i>
                      <span className="category-name">{category.name}</span>
                      {category.id === 'custom-components' && (
                        <span className="custom-badge" title="Componentes creados por IA">IA</span>
                      )}
                      <span className="category-count">{category.actions.length}</span>
                    </div>
                    <div className="category-items">
                      {category.actions.map(action => (
                        <div key={action.action} className={`action-item ${action.isContainer ? 'is-container' : ''} ${action.isCustom ? 'is-custom' : ''}`} draggable="true" onDragStart={(e) => handleDragStart(e, action)}>
                          <i className={`fas ${action.icon}`}></i>
                          <span>{action.label}</span>
                          {action.isCustom && (
                            <button
                              className="btn-delete-custom"
                              onClick={(e) => {
                                e.stopPropagation()
                                if (confirm(`¿Eliminar componente "${action.label}"?`)) {
                                  removeCustomComponent(action.action)
                                }
                              }}
                              title="Eliminar componente"
                            >
                              <i className="fas fa-times"></i>
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Resizer izquierdo */}
        {!leftPanelCollapsed && (
          <div
            className="panel-resizer panel-resizer-left"
            onMouseDown={(e) => {
              e.preventDefault()
              setIsResizingLeft(true)
            }}
          />
        )}

        <div className="studio-center-panel" ref={canvasRef} tabIndex={0}>
          <div className="canvas-toolbar">
            <div className="toolbar-group">
              <button className="btn btn-sm btn-primary" onClick={newWorkflow} title={t('wf_new')}><i className="fas fa-file-alt"></i><span>{t('wf_new')}</span></button>
              <button className="btn btn-sm btn-success" onClick={saveWorkflow} title={t('wf_save')}><i className="fas fa-save"></i><span>{t('wf_save')}</span></button>
              <button className="btn btn-sm btn-diagram" onClick={() => setShowDiagramModal(true)} title="Generador de Diagrama">
                <i className="fas fa-project-diagram"></i>
                <span>Diagrama</span>
              </button>
            </div>
            <div className="toolbar-divider"></div>
            <div className="toolbar-group">
              <button className="btn btn-sm btn-secondary btn-icon-only" onClick={importWorkflow} title={t('wf_import')}><i className="fas fa-file-import"></i></button>
              <button className="btn btn-sm btn-secondary btn-icon-only" onClick={exportWorkflow} title={t('wf_export')}><i className="fas fa-file-export"></i></button>
              <button className="btn btn-sm btn-migrate btn-icon-only" onClick={() => setShowMigrateModal(true)} title={t('wf_migrate')}><i className="fas fa-exchange-alt"></i></button>
              <button className="btn btn-sm btn-rfq btn-icon-only" onClick={() => setShowRFQModal(true)} title="Generar desde RFQ/Documento">
                <i className="fas fa-file-pdf"></i>
              </button>
            </div>
            <div className="toolbar-divider"></div>
            <div className="toolbar-group">
              <button className="btn btn-sm btn-ai btn-icon-only" onClick={() => setShowAIModal(true)} title={t('wf_ai_generate')}><i className="fas fa-robot"></i></button>
              <button className="btn btn-sm btn-code btn-icon-only" onClick={() => setShowCodeEditorModal(true)} title={t('wf_code_editor')}><i className="fas fa-code"></i></button>
            </div>
            <div className="toolbar-divider"></div>
            <div className="toolbar-group">
              <button className="btn btn-sm btn-execute btn-icon-only" onClick={executeWorkflow} disabled={workflowSteps.length === 0} title={t('wf_execute')}><i className="fas fa-play"></i></button>
              <button className="btn btn-sm btn-preview btn-icon-only" onClick={previewWorkflow} disabled={workflowSteps.length === 0} title={t('wf_preview')}><i className="fas fa-eye"></i></button>
              {!isDebugging ? (
                <button className="btn btn-sm btn-debug btn-icon-only" onClick={startDebug} title={t('wf_debug')}><i className="fas fa-bug"></i></button>
              ) : (
                <>
                  <button className="btn btn-sm btn-debug btn-icon-only active" onClick={continueDebug} title={t('btn_continue')}><i className="fas fa-play"></i></button>
                  <button className="btn btn-sm btn-debug btn-icon-only" onClick={stepOver} title="Step Over (F10)"><i className="fas fa-step-forward"></i></button>
                  <button className="btn btn-sm btn-danger btn-icon-only" onClick={stopDebug} title={t('btn_stop')}><i className="fas fa-stop"></i></button>
                </>
              )}
            </div>
            <div className="toolbar-divider"></div>
            <button className="btn btn-sm btn-danger btn-icon-only" onClick={deleteWorkflow} disabled={workflowSteps.length === 0} title={t('wf_delete')}><i className="fas fa-trash"></i></button>
            <div className="toolbar-spacer"></div>
            {voiceSupported && (
              <button className={`btn btn-sm btn-voice btn-icon-only ${isListening ? 'listening' : ''}`} onClick={toggleVoiceListening} title={isListening ? t('wf_stop_voice') : t('wf_voice_commands')}>
                <i className={`fas ${isListening ? 'fa-microphone-slash' : 'fa-microphone'}`}></i>
              </button>
            )}
            <div className="view-toggle">
              <button className={`view-toggle-btn ${viewMode === 'list' ? 'active' : ''}`} onClick={() => setViewMode('list')} title={t('wf_list_view')}><i className="fas fa-list"></i></button>
              <button className={`view-toggle-btn ${viewMode === 'flow' ? 'active' : ''}`} onClick={() => setViewMode('flow')} title={t('wf_flow_view')}><i className="fas fa-project-diagram"></i></button>
            </div>
          </div>

          {/* Indicador de voz activa */}
          {isListening && voiceTranscript && (
            <div className="voice-indicator">
              <i className="fas fa-microphone"></i>
              <span>"{voiceTranscript}"</span>
            </div>
          )}

          <div className="canvas-container">
            <div className={`workflow-canvas ${viewMode}`} onDrop={(e) => handleDrop(e)} onDragOver={handleDragOver} onClick={() => setSelectedStep(null)}>
              {workflowSteps.length === 0 ? (
                <div className="workflow-canvas-empty">
                  <i className="fas fa-project-diagram"></i>
                  <p>{t('wf_drag_here')}</p>
                  <small>{t('wf_use_ai')}</small>
                  <div className="keyboard-shortcuts">
                    <span><kbd>Del</kbd> {t('btn_delete')}</span>
                    <span><kbd>Ctrl</kbd>+<kbd>C</kbd> {t('btn_copy')}</span>
                    <span><kbd>Ctrl</kbd>+<kbd>V</kbd> {t('btn_paste')}</span>
                    <span><kbd>F9</kbd> Breakpoint</span>
                    <span><kbd>F5</kbd> Debug</span>
                  </div>
                </div>
              ) : viewMode === 'list' ? (
                /* Vista de Lista */
                <div className="workflow-list">
                  <div className="workflow-start-node"><i className="fas fa-play-circle"></i><span>{t('wf_start')}</span></div>
                  <div className="workflow-list-steps">{workflowSteps.map((step, index) => renderListStep(step, index, 0, index + 1))}</div>
                  <div className="workflow-end-node"><i className="fas fa-stop-circle"></i><span>{t('wf_end')}</span></div>
                </div>
              ) : (
                /* Vista de Flujo */
                <div className="workflow-flow">
                  <div className="flow-start-node">
                    <div className="flow-node-circle start"><i className="fas fa-play"></i></div>
                    <span>{t('wf_start')}</span>
                  </div>
                  {workflowSteps.map((step, index) => renderFlowStep(step, index))}
                  <div className="flow-connector">
                    <div className="flow-line"></div>
                    <i className="fas fa-caret-down flow-arrow"></i>
                  </div>
                  <div className="flow-end-node">
                    <div className="flow-node-circle end"><i className="fas fa-stop"></i></div>
                    <span>{t('wf_end')}</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Resizer derecho */}
        {!rightPanelCollapsed && (
          <div
            className="panel-resizer panel-resizer-right"
            onMouseDown={(e) => {
              e.preventDefault()
              setIsResizingRight(true)
            }}
          />
        )}

        <div className={`studio-right-panel ${rightPanelCollapsed ? 'collapsed' : ''}`} style={!rightPanelCollapsed ? { width: rightPanelWidth } : undefined}>
          <div className="panel-header">
            <div className="panel-tabs">
              <button className={`panel-tab ${rightPanelTab === 'properties' ? 'active' : ''}`} onClick={() => setRightPanelTab('properties')}><i className="fas fa-cog"></i> {t('wf_properties')}</button>
              <button className={`panel-tab ${rightPanelTab === 'variables' ? 'active' : ''}`} onClick={() => setRightPanelTab('variables')}><i className="fas fa-cube"></i> {t('wf_variables')}</button>
            </div>
            <button className="panel-collapse-btn" onClick={() => setRightPanelCollapsed(!rightPanelCollapsed)}><i className={`fas fa-chevron-${rightPanelCollapsed ? 'left' : 'right'}`}></i></button>
          </div>
          <div className="properties-content">
            {rightPanelTab === 'properties' ? (
              <ActionPropertyEditor selectedStep={selectedStep} onUpdateStep={handleUpdateStep} variables={variables} />
            ) : (
              <VariablesPanel variables={variables} onAddVariable={handleAddVariable} onUpdateVariable={handleUpdateVariable} onDeleteVariable={handleDeleteVariable} />
            )}
          </div>
        </div>

        {contextMenu && (
          <div className="context-menu" style={{ top: contextMenu.y, left: contextMenu.x }} onClick={(e) => e.stopPropagation()}>
            <div className="context-menu-item" onClick={() => { setRightPanelTab('properties'); setRightPanelCollapsed(false); setContextMenu(null) }}><i className="fas fa-edit"></i> {t('btn_edit')} {t('wf_properties')}</div>
            <div className="context-menu-item" onClick={() => { toggleBreakpoint(contextMenu.step.id); setContextMenu(null) }}>
              <i className="fas fa-circle" style={{ color: breakpoints.has(contextMenu.step.id) ? '#ef4444' : 'inherit' }}></i>
              {breakpoints.has(contextMenu.step.id) ? t('btn_remove') + ' Breakpoint' : t('btn_add') + ' Breakpoint'}
            </div>
            <div className="context-menu-divider"></div>
            <div className="context-menu-item" onClick={() => { setClipboard({ ...contextMenu.step, id: null }); setContextMenu(null) }}><i className="fas fa-copy"></i> {t('btn_copy')} <span className="shortcut">Ctrl+C</span></div>
            <div className="context-menu-item" onClick={() => { duplicateStep(contextMenu.step); setContextMenu(null) }}><i className="fas fa-clone"></i> {t('btn_duplicate')} <span className="shortcut">Ctrl+D</span></div>
            {clipboard && <div className="context-menu-item" onClick={() => { pasteStep(); setContextMenu(null) }}><i className="fas fa-paste"></i> {t('btn_paste')} <span className="shortcut">Ctrl+V</span></div>}
            <div className="context-menu-divider"></div>
            <div className="context-menu-item danger" onClick={() => { deleteStep(contextMenu.step.id); setContextMenu(null) }}><i className="fas fa-trash"></i> {t('btn_delete')} <span className="shortcut">Del</span></div>
          </div>
        )}

        {/* Modal de Migrar - Completo con funcionalidad */}
        {showMigrateModal && (
          <div className="modal-overlay" onClick={() => { setShowMigrateModal(false); setMigrateStep(1); setMigrateMode(null); setMigrateFormat(null); }}>
            <div className="modal-content modal-lg" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h3>
                  <i className="fas fa-exchange-alt"></i> Migrar Workflow
                  {migrateStep > 1 && (
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginLeft: '1rem' }}>
                      Paso {migrateStep} de 4
                    </span>
                  )}
                </h3>
                <button className="modal-close" onClick={() => { setShowMigrateModal(false); setMigrateStep(1); setMigrateMode(null); setMigrateFormat(null); }}>
                  <i className="fas fa-times"></i>
                </button>
              </div>
              <div className="modal-body">
                {/* Input oculto para seleccionar archivo */}
                <input
                  type="file"
                  ref={migrateFileInputRef}
                  style={{ display: 'none' }}
                  accept={migrateFormat === 'uipath' ? '.xaml,.xml' : migrateFormat === 'power-automate' || migrateFormat === 'rpa-platform' ? '.json' : '.py,.js,.txt'}
                  onChange={(e) => {
                    const file = e.target.files[0]
                    if (file) {
                      const reader = new FileReader()
                      reader.onload = (event) => {
                        setImportFileContent(event.target.result)
                        setMigrateStep(3)
                        handleMigration(event.target.result)
                      }
                      reader.readAsText(file)
                    }
                  }}
                />

                {/* PASO 1: Selección de modo y formato */}
                {migrateStep === 1 && (
                  <div className="migrate-options">
                    <div className="migrate-section">
                      <h4><i className="fas fa-file-import"></i> Importar desde</h4>
                      <div className="migrate-grid">
                        <button className="migrate-option" onClick={() => { setMigrateMode('import'); setMigrateFormat('uipath'); setMigrateStep(2); }}>
                          <i className="fas fa-robot" style={{color: '#ff6d00'}}></i><span>UiPath</span>
                        </button>
                        <button className="migrate-option" onClick={() => { setMigrateMode('import'); setMigrateFormat('power-automate'); setMigrateStep(2); }}>
                          <i className="fas fa-cogs" style={{color: '#0078d4'}}></i><span>Power Automate</span>
                        </button>
                        <button className="migrate-option" onClick={() => { setMigrateMode('import'); setMigrateFormat('rpa-platform'); setMigrateStep(2); }}>
                          <i className="fas fa-bolt" style={{color: '#00a1e0'}}></i><span>RPA Platform</span>
                        </button>
                        <button className="migrate-option" onClick={() => { setMigrateMode('import'); setMigrateFormat('blue-prism'); setMigrateStep(2); }}>
                          <i className="fas fa-cube" style={{color: '#1976d2'}}></i><span>Blue Prism</span>
                        </button>
                        <button className="migrate-option" onClick={() => { setMigrateMode('import'); setMigrateFormat('python'); setMigrateStep(2); }}>
                          <i className="fas fa-code" style={{color: '#3776ab'}}></i><span>Python Script</span>
                        </button>
                        <button className="migrate-option" onClick={() => { setMigrateMode('import'); setMigrateFormat('javascript'); setMigrateStep(2); }}>
                          <i className="fas fa-file-code" style={{color: '#f7df1e'}}></i><span>JavaScript</span>
                        </button>
                      </div>
                    </div>
                    <div className="migrate-section">
                      <h4><i className="fas fa-file-export"></i> Exportar a</h4>
                      <div className="migrate-grid">
                        <button className="migrate-option" onClick={() => { setMigrateMode('export'); setMigrateFormat('uipath'); setMigrateStep(2); }} disabled={steps.length === 0}>
                          <i className="fas fa-robot" style={{color: '#ff6d00'}}></i><span>UiPath XAML</span>
                        </button>
                        <button className="migrate-option" onClick={() => { setMigrateMode('export'); setMigrateFormat('power-automate'); setMigrateStep(2); }} disabled={steps.length === 0}>
                          <i className="fas fa-cogs" style={{color: '#0078d4'}}></i><span>Power Automate</span>
                        </button>
                        <button className="migrate-option" onClick={() => { setMigrateMode('export'); setMigrateFormat('python'); setMigrateStep(2); }} disabled={steps.length === 0}>
                          <i className="fas fa-code" style={{color: '#3776ab'}}></i><span>Python</span>
                        </button>
                        <button className="migrate-option" onClick={() => { setMigrateMode('export'); setMigrateFormat('javascript'); setMigrateStep(2); }} disabled={steps.length === 0}>
                          <i className="fas fa-file-code" style={{color: '#f7df1e'}}></i><span>JavaScript</span>
                        </button>
                        <button className="migrate-option" onClick={() => { setMigrateMode('export'); setMigrateFormat('bash'); setMigrateStep(2); }} disabled={steps.length === 0}>
                          <i className="fas fa-terminal" style={{color: '#4eaa25'}}></i><span>Bash Script</span>
                        </button>
                        <button className="migrate-option" onClick={() => { setMigrateMode('export'); setMigrateFormat('pseudocode'); setMigrateStep(2); }} disabled={steps.length === 0}>
                          <i className="fas fa-file-alt" style={{color: '#6c757d'}}></i><span>Pseudocódigo</span>
                        </button>
                      </div>
                      {steps.length === 0 && (
                        <p style={{ color: 'var(--warning-color)', fontSize: '0.85rem', marginTop: '0.5rem' }}>
                          <i className="fas fa-exclamation-triangle"></i> Necesitas tener un workflow con pasos para exportar
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {/* PASO 2: Configuración de importación/exportación */}
                {migrateStep === 2 && migrateMode === 'import' && (
                  <div className="migrate-config">
                    <div style={{ textAlign: 'center', padding: '2rem' }}>
                      <div style={{ fontSize: '4rem', marginBottom: '1rem', color: 'var(--primary-color)' }}>
                        <i className="fas fa-file-import"></i>
                      </div>
                      <h4>Importar desde {migrateFormat?.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}</h4>
                      <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>
                        Selecciona el archivo de workflow que deseas importar
                      </p>
                      <button
                        className="btn btn-primary btn-lg"
                        onClick={() => migrateFileInputRef.current?.click()}
                      >
                        <i className="fas fa-folder-open"></i> Seleccionar Archivo
                      </button>
                      <div style={{ marginTop: '1rem' }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>
                          Nombre del workflow (opcional):
                        </label>
                        <input
                          type="text"
                          value={exportWorkflowName}
                          onChange={(e) => setExportWorkflowName(e.target.value)}
                          placeholder="Workflow Importado"
                          style={{
                            width: '100%',
                            maxWidth: '400px',
                            padding: '0.75rem',
                            borderRadius: '8px',
                            border: '1px solid var(--border-color)',
                            background: 'var(--bg-secondary)',
                            color: 'var(--text-primary)'
                          }}
                        />
                      </div>
                    </div>
                  </div>
                )}

                {migrateStep === 2 && migrateMode === 'export' && (
                  <div className="migrate-config">
                    <div style={{ textAlign: 'center', padding: '2rem' }}>
                      <div style={{ fontSize: '4rem', marginBottom: '1rem', color: 'var(--success-color)' }}>
                        <i className="fas fa-file-export"></i>
                      </div>
                      <h4>Exportar a {migrateFormat?.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}</h4>
                      <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>
                        Se exportará el workflow actual: <strong>{workflowName}</strong> ({steps.length} pasos)
                      </p>
                      <div style={{ marginBottom: '1rem' }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>
                          Nombre del archivo:
                        </label>
                        <input
                          type="text"
                          value={exportWorkflowName || workflowName}
                          onChange={(e) => setExportWorkflowName(e.target.value)}
                          placeholder={workflowName}
                          style={{
                            width: '100%',
                            maxWidth: '400px',
                            padding: '0.75rem',
                            borderRadius: '8px',
                            border: '1px solid var(--border-color)',
                            background: 'var(--bg-secondary)',
                            color: 'var(--text-primary)'
                          }}
                        />
                      </div>
                      <button
                        className="btn btn-primary btn-lg"
                        onClick={() => {
                          setMigrateStep(3)
                          handleExportMigration()
                        }}
                      >
                        <i className="fas fa-download"></i> Exportar Workflow
                      </button>
                    </div>
                  </div>
                )}

                {/* PASO 3: Progreso de migración */}
                {migrateStep === 3 && (
                  <div className="migrate-progress" style={{ textAlign: 'center', padding: '2rem' }}>
                    <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>
                      <i className="fas fa-cogs fa-spin" style={{ color: 'var(--primary-color)' }}></i>
                    </div>
                    <h4>{migrateMode === 'import' ? 'Importando workflow...' : 'Exportando workflow...'}</h4>
                    <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>{migrateStatus}</p>
                    <div style={{
                      width: '100%',
                      maxWidth: '400px',
                      height: '8px',
                      background: 'var(--bg-tertiary)',
                      borderRadius: '4px',
                      margin: '0 auto',
                      overflow: 'hidden'
                    }}>
                      <div style={{
                        width: `${migrateProgress}%`,
                        height: '100%',
                        background: 'linear-gradient(90deg, var(--primary-color), var(--accent-color))',
                        borderRadius: '4px',
                        transition: 'width 0.3s ease'
                      }}></div>
                    </div>
                    <p style={{ marginTop: '0.5rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                      {migrateProgress}%
                    </p>
                  </div>
                )}

                {/* PASO 4: Resultado */}
                {migrateStep === 4 && (
                  <div className="migrate-result" style={{ padding: '1rem' }}>
                    {migrateResult?.success ? (
                      <>
                        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
                          <div style={{ fontSize: '4rem', color: 'var(--success-color)' }}>
                            <i className="fas fa-check-circle"></i>
                          </div>
                          <h4 style={{ color: 'var(--success-color)' }}>
                            {migrateMode === 'import' ? 'Importación completada' : 'Exportación completada'}
                          </h4>
                        </div>
                        {migrateMode === 'import' && migrateResult.steps && (
                          <div style={{
                            background: 'var(--bg-secondary)',
                            borderRadius: '8px',
                            padding: '1rem',
                            maxHeight: '300px',
                            overflow: 'auto'
                          }}>
                            <p style={{ marginBottom: '0.5rem' }}>
                              <strong>{migrateResult.steps.length}</strong> pasos importados:
                            </p>
                            <ul style={{ margin: 0, paddingLeft: '1.5rem' }}>
                              {migrateResult.steps.slice(0, 10).map((step, i) => (
                                <li key={i} style={{ marginBottom: '0.25rem', fontSize: '0.9rem' }}>
                                  <i className={`fas ${step.icon || 'fa-cog'}`} style={{ marginRight: '0.5rem', color: 'var(--primary-color)' }}></i>
                                  {step.label || step.type}
                                </li>
                              ))}
                              {migrateResult.steps.length > 10 && (
                                <li style={{ color: 'var(--text-secondary)' }}>... y {migrateResult.steps.length - 10} más</li>
                              )}
                            </ul>
                          </div>
                        )}
                        {migrateMode === 'export' && migrateResult.code && (
                          <div style={{
                            background: '#1e1e1e',
                            borderRadius: '8px',
                            padding: '1rem',
                            maxHeight: '300px',
                            overflow: 'auto'
                          }}>
                            <pre style={{
                              margin: 0,
                              fontSize: '0.8rem',
                              color: '#d4d4d4',
                              whiteSpace: 'pre-wrap',
                              wordBreak: 'break-word'
                            }}>
                              {migrateResult.code.substring(0, 2000)}{migrateResult.code.length > 2000 ? '\n\n... (truncado)' : ''}
                            </pre>
                          </div>
                        )}
                      </>
                    ) : (
                      <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '4rem', color: 'var(--error-color)' }}>
                          <i className="fas fa-times-circle"></i>
                        </div>
                        <h4 style={{ color: 'var(--error-color)' }}>Error en la migración</h4>
                        <p style={{ color: 'var(--text-secondary)' }}>{migrateResult?.error || 'Error desconocido'}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
              <div className="modal-footer">
                {migrateStep > 1 && migrateStep < 4 && (
                  <button className="btn btn-secondary" onClick={() => setMigrateStep(migrateStep - 1)}>
                    <i className="fas fa-arrow-left"></i> Atrás
                  </button>
                )}
                {migrateStep === 4 && migrateResult?.success && migrateMode === 'import' && (
                  <button className="btn btn-primary" onClick={() => {
                    // Aplicar los pasos importados al workflow actual
                    if (migrateResult.steps) {
                      migrateResult.steps.forEach(step => {
                        addStep({
                          action: step.type,
                          label: step.label,
                          icon: step.icon || 'fa-cog',
                          params: step.properties
                        })
                      })
                    }
                    setShowMigrateModal(false)
                    setMigrateStep(1)
                    setMigrateMode(null)
                    setMigrateFormat(null)
                  }}>
                    <i className="fas fa-check"></i> Aplicar al Workflow
                  </button>
                )}
                {migrateStep === 4 && migrateResult?.success && migrateMode === 'export' && (
                  <button className="btn btn-primary" onClick={() => {
                    // Descargar el archivo exportado
                    const extensions = {
                      'uipath': 'xaml',
                      'power-automate': 'json',
                      'python': 'py',
                      'javascript': 'js',
                      'bash': 'sh',
                      'pseudocode': 'txt'
                    }
                    const blob = new Blob([migrateResult.code], { type: 'text/plain' })
                    const url = URL.createObjectURL(blob)
                    const a = document.createElement('a')
                    a.href = url
                    a.download = `${(exportWorkflowName || workflowName).replace(/\s+/g, '_')}.${extensions[migrateFormat] || 'txt'}`
                    a.click()
                    URL.revokeObjectURL(url)
                  }}>
                    <i className="fas fa-download"></i> Descargar Archivo
                  </button>
                )}
                <button className="btn btn-secondary" onClick={() => { setShowMigrateModal(false); setMigrateStep(1); setMigrateMode(null); setMigrateFormat(null); }}>
                  {migrateStep === 4 ? 'Cerrar' : 'Cancelar'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal de IA */}
        {showAIModal && (
          <div className="modal-overlay" onClick={() => { setShowAIModal(false); if (isListening && voiceMode === 'dictation') toggleAIDictation(); }}>
            <div className="modal-content modal-lg" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h3><i className="fas fa-robot"></i> Generar Workflow con IA</h3>
                <button className="modal-close" onClick={() => { setShowAIModal(false); if (isListening && voiceMode === 'dictation') toggleAIDictation(); }}><i className="fas fa-times"></i></button>
              </div>
              <div className="modal-body">
                <div className="ai-generator">
                  {/* Banner de dictado activo */}
                  {isListening && voiceMode === 'dictation' && (
                    <div className="dictation-live-banner ai-target">
                      <div className="dictation-live-icon">
                        <i className="fas fa-microphone"></i>
                      </div>
                      <div className="dictation-live-text">
                        <span className="dictation-live-label">Dictando al Prompt IA:</span>
                        <span className="dictation-live-content">
                          {dictationBuffer || voiceTranscript || 'Esperando...'}
                        </span>
                      </div>
                      <button className="dictation-stop-btn" onClick={toggleAIDictation}>
                        <i className="fas fa-stop"></i> Detener
                      </button>
                    </div>
                  )}
                  <div className="form-group">
                    <label>Describe lo que quieres automatizar</label>
                    <div className="textarea-with-voice">
                      <textarea
                        ref={aiPromptRef}
                        value={aiPrompt}
                        onChange={(e) => setAIPrompt(e.target.value)}
                        placeholder="Ejemplo: Abrir el navegador, ir a la página de ventas, extraer la tabla de productos y guardarla en Excel..."
                        rows={5}
                        className="ai-prompt-input"
                      />
                      {voiceSupported && (
                        <button
                          type="button"
                          className={`voice-input-btn ${isListening && voiceMode === 'dictation' ? 'listening' : ''}`}
                          onClick={toggleAIDictation}
                          title={isListening && voiceMode === 'dictation' ? 'Detener dictado' : 'Dictar con voz'}
                        >
                          <i className={`fas ${isListening && voiceMode === 'dictation' ? 'fa-stop-circle' : 'fa-microphone'}`}></i>
                        </button>
                      )}
                    </div>
                  </div>
                  <div className="ai-templates">
                    <span className="templates-label">Plantillas rápidas:</span>
                    <div className="template-chips">
                      <button className="template-chip" onClick={() => setAIPrompt('Abrir navegador, ir a una URL, hacer login con usuario y contraseña')}>
                        <i className="fas fa-sign-in-alt"></i> Login Web
                      </button>
                      <button className="template-chip" onClick={() => setAIPrompt('Extraer datos de una tabla web y guardarlos en Excel')}>
                        <i className="fas fa-table"></i> Extraer Tabla
                      </button>
                      <button className="template-chip" onClick={() => setAIPrompt('Leer correos de Outlook, filtrar por asunto y descargar adjuntos')}>
                        <i className="fas fa-envelope"></i> Procesar Emails
                      </button>
                      <button className="template-chip" onClick={() => setAIPrompt('Leer archivo Excel, procesar cada fila y actualizar base de datos')}>
                        <i className="fas fa-file-excel"></i> Excel a BD
                      </button>
                      <button className="template-chip" onClick={() => setAIPrompt('Crear un formulario de entrada de datos con validación')}>
                        <i className="fas fa-wpforms"></i> Formulario
                      </button>
                    </div>
                  </div>

                  {/* Sección de importar video */}
                  <div className="video-import-section">
                    <input
                      type="file"
                      ref={videoInputRef}
                      accept="video/*"
                      onChange={handleVideoSelect}
                      style={{ display: 'none' }}
                    />
                    <button className="video-import-btn" onClick={() => videoInputRef.current?.click()}>
                      <i className="fas fa-video"></i>
                      <span>Importar Video para Analizar</span>
                      <small>Genera un workflow automáticamente a partir de un video de demostración</small>
                    </button>
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button className="btn btn-secondary" onClick={() => setShowAIModal(false)}>Cancelar</button>
                <button className="btn btn-ai" onClick={handleAIGenerate} disabled={!aiPrompt.trim() || isGeneratingAI}>
                  {isGeneratingAI ? <><i className="fas fa-spinner fa-spin"></i> Generando...</> : <><i className="fas fa-magic"></i> Generar Workflow</>}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal de Análisis de Video */}
        {showVideoImportModal && (
          <div className="modal-overlay">
            <div className="modal-content modal-lg" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header" style={{ background: 'linear-gradient(135deg, #8b5cf6, #6366f1)' }}>
                <h3 style={{ color: 'white' }}><i className="fas fa-video"></i> Analizar Video y Generar Workflow</h3>
                {!isAnalyzingVideo && (
                  <button className="modal-close" onClick={() => setShowVideoImportModal(false)} style={{ color: 'white' }}>
                    <i className="fas fa-times"></i>
                  </button>
                )}
              </div>
              <div className="modal-body">
                {isAnalyzingVideo ? (
                  <div className="video-analysis-progress">
                    <div className="progress-circle">
                      <svg viewBox="0 0 36 36">
                        <path
                          d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                          fill="none"
                          stroke="var(--border-color)"
                          strokeWidth="3"
                        />
                        <path
                          d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                          fill="none"
                          stroke="var(--primary-color)"
                          strokeWidth="3"
                          strokeDasharray={`${videoAnalysisProgress}, 100`}
                          style={{ transition: 'stroke-dasharray 0.3s ease' }}
                        />
                      </svg>
                      <span className="progress-value">{videoAnalysisProgress}%</span>
                    </div>
                    <h4>Analizando video...</h4>
                    <p>{videoAnalysisStep}</p>
                    <div className="video-analysis-steps">
                      <div className={`analysis-step ${videoAnalysisProgress >= 5 ? 'completed' : videoAnalysisProgress > 0 ? 'active' : ''}`}>
                        <i className={`fas ${videoAnalysisProgress >= 5 ? 'fa-check-circle' : 'fa-circle'}`}></i>
                        <span>Preparando video</span>
                      </div>
                      <div className={`analysis-step ${videoAnalysisProgress >= 20 ? 'completed' : videoAnalysisProgress > 5 ? 'active' : ''}`}>
                        <i className={`fas ${videoAnalysisProgress >= 20 ? 'fa-check-circle' : 'fa-circle'}`}></i>
                        <span>Extrayendo frames</span>
                      </div>
                      <div className={`analysis-step ${videoAnalysisProgress >= 40 ? 'completed' : videoAnalysisProgress > 20 ? 'active' : ''}`}>
                        <i className={`fas ${videoAnalysisProgress >= 40 ? 'fa-check-circle' : 'fa-circle'}`}></i>
                        <span>Detectando elementos de UI</span>
                      </div>
                      <div className={`analysis-step ${videoAnalysisProgress >= 60 ? 'completed' : videoAnalysisProgress > 40 ? 'active' : ''}`}>
                        <i className={`fas ${videoAnalysisProgress >= 60 ? 'fa-check-circle' : 'fa-circle'}`}></i>
                        <span>Identificando acciones</span>
                      </div>
                      <div className={`analysis-step ${videoAnalysisProgress >= 80 ? 'completed' : videoAnalysisProgress > 60 ? 'active' : ''}`}>
                        <i className={`fas ${videoAnalysisProgress >= 80 ? 'fa-check-circle' : 'fa-circle'}`}></i>
                        <span>Generando workflow</span>
                      </div>
                      <div className={`analysis-step ${videoAnalysisProgress >= 95 ? 'completed' : videoAnalysisProgress > 80 ? 'active' : ''}`}>
                        <i className={`fas ${videoAnalysisProgress >= 95 ? 'fa-check-circle' : 'fa-circle'}`}></i>
                        <span>Creando documentación</span>
                      </div>
                      <div className={`analysis-step ${videoAnalysisProgress >= 100 ? 'completed' : videoAnalysisProgress > 95 ? 'active' : ''}`}>
                        <i className={`fas ${videoAnalysisProgress >= 100 ? 'fa-check-circle' : 'fa-circle'}`}></i>
                        <span>Guardando proyecto</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="form-group">
                      <label><i className="fas fa-video" style={{ marginRight: '0.5rem', color: 'var(--primary-color)' }}></i>Video seleccionado</label>
                      <div style={{ padding: '1rem', background: 'var(--bg-tertiary)', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <i className="fas fa-film" style={{ fontSize: '2rem', color: 'var(--primary-color)' }}></i>
                        <div>
                          <strong style={{ color: 'var(--text-primary)' }}>{videoFile?.name}</strong>
                          <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                            {videoFile && `${(videoFile.size / (1024 * 1024)).toFixed(2)} MB`}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="form-group">
                      <label><i className="fas fa-project-diagram" style={{ marginRight: '0.5rem', color: 'var(--primary-color)' }}></i>Nombre del proyecto</label>
                      <input
                        type="text"
                        value={videoProjectName}
                        onChange={(e) => setVideoProjectName(e.target.value)}
                        placeholder="Mi Workflow Automatizado"
                        style={{ width: '100%', padding: '0.75rem 1rem', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '8px', color: 'var(--text-primary)' }}
                      />
                    </div>

                    <div className="save-location-selector">
                      <label><i className="fas fa-folder" style={{ marginRight: '0.5rem', color: 'var(--primary-color)' }}></i>Ubicación para guardar</label>
                      <div className="location-input-group">
                        <input
                          type="text"
                          value={videoSavePath}
                          onChange={(e) => setVideoSavePath(e.target.value)}
                          placeholder="C:\Alqvimia\Proyectos"
                        />
                        <button type="button" title="Seleccionar carpeta">
                          <i className="fas fa-folder-open"></i>
                        </button>
                      </div>
                    </div>

                    <div style={{ marginTop: '1.5rem', padding: '1rem', background: 'rgba(99, 102, 241, 0.1)', borderRadius: '8px', border: '1px solid rgba(99, 102, 241, 0.2)' }}>
                      <h4 style={{ margin: '0 0 0.75rem 0', color: 'var(--primary-color)', fontSize: '0.9rem' }}>
                        <i className="fas fa-info-circle" style={{ marginRight: '0.5rem' }}></i>
                        ¿Qué se generará?
                      </h4>
                      <ul style={{ margin: 0, paddingLeft: '1.25rem', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                        <li>Workflow con los pasos detectados del video</li>
                        <li>Variables automáticas para datos dinámicos</li>
                        <li>Componentes personalizados si no existen</li>
                        <li>Documentación completa del proceso</li>
                        <li>Archivo README con descripción del flujo</li>
                      </ul>
                    </div>
                  </>
                )}
              </div>
              {!isAnalyzingVideo && (
                <div className="modal-footer">
                  <button className="btn btn-secondary" onClick={() => setShowVideoImportModal(false)}>Cancelar</button>
                  <button
                    className="btn btn-ai"
                    onClick={analyzeVideoAndGenerateWorkflow}
                    disabled={!videoProjectName.trim() || !videoSavePath.trim()}
                  >
                    <i className="fas fa-magic"></i> Analizar y Generar
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Modal de RFQ - Generar desde Documentos */}
        {showRFQModal && (
          <div className="modal-overlay" onClick={() => setShowRFQModal(false)}>
            <div className="modal-content modal-lg" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h3>
                  <i className="fas fa-file-pdf"></i> Generar Workflow desde RFQ/Documento
                </h3>
                <button className="modal-close" onClick={() => setShowRFQModal(false)}>
                  <i className="fas fa-times"></i>
                </button>
              </div>
              <div className="modal-body">
                <input
                  type="file"
                  ref={rfqFileInputRef}
                  style={{ display: 'none' }}
                  accept=".pdf,.docx,.doc,.md,.txt"
                  onChange={handleRFQFileSelect}
                />

                {!isProcessingRFQ && !rfqContent && (
                  <div style={{ textAlign: 'center', padding: '2rem' }}>
                    <div style={{ fontSize: '4rem', marginBottom: '1rem', color: 'var(--primary-color)' }}>
                      <i className="fas fa-cloud-upload-alt"></i>
                    </div>
                    <h4 style={{ marginBottom: '1rem' }}>Selecciona un documento RFQ</h4>
                    <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
                      Soporta archivos PDF, Word (.docx/.doc) y Markdown (.md)
                    </p>
                    <button
                      className="btn btn-primary btn-lg"
                      onClick={() => rfqFileInputRef.current?.click()}
                    >
                      <i className="fas fa-folder-open"></i> Seleccionar Archivo
                    </button>
                    <div style={{ marginTop: '2rem', textAlign: 'left', maxWidth: '600px', margin: '2rem auto 0' }}>
                      <h5 style={{ marginBottom: '0.5rem' }}>
                        <i className="fas fa-info-circle"></i> ¿Cómo funciona?
                      </h5>
                      <ul style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: '1.6' }}>
                        <li>Sube un documento que contenga los requisitos del proceso (RFQ)</li>
                        <li>El sistema extraerá automáticamente el texto del documento</li>
                        <li>Utilizará IA para analizar y generar los pasos del workflow</li>
                        <li>Identificará variables, condiciones y acciones necesarias</li>
                        <li>Generará un workflow completo listo para ejecutar</li>
                      </ul>
                    </div>
                  </div>
                )}

                {isProcessingRFQ && (
                  <div style={{ textAlign: 'center', padding: '2rem' }}>
                    <div style={{ fontSize: '3rem', marginBottom: '1rem', color: 'var(--primary-color)' }}>
                      <i className="fas fa-spinner fa-spin"></i>
                    </div>
                    <h4>Procesando documento...</h4>
                    <div style={{ marginTop: '1.5rem' }}>
                      <div style={{
                        background: 'var(--dark-bg)',
                        borderRadius: '10px',
                        height: '20px',
                        overflow: 'hidden',
                        position: 'relative'
                      }}>
                        <div style={{
                          background: 'linear-gradient(90deg, var(--primary-color), var(--accent-color))',
                          height: '100%',
                          width: `${rfqProcessingProgress}%`,
                          transition: 'width 0.3s ease',
                          borderRadius: '10px'
                        }}></div>
                      </div>
                      <p style={{ marginTop: '0.5rem', color: 'var(--text-secondary)' }}>
                        {rfqProcessingProgress}% completado
                      </p>
                    </div>
                  </div>
                )}

                {rfqContent && !isProcessingRFQ && (
                  <div>
                    <div style={{ marginBottom: '1rem' }}>
                      <h4>
                        <i className="fas fa-check-circle" style={{ color: 'var(--success-color)' }}></i>
                        Documento procesado exitosamente
                      </h4>
                      <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                        Se ha extraído el siguiente contenido del documento:
                      </p>
                    </div>
                    <div style={{
                      background: 'var(--dark-bg)',
                      padding: '1rem',
                      borderRadius: '8px',
                      maxHeight: '400px',
                      overflowY: 'auto',
                      border: '1px solid var(--border-color)'
                    }}>
                      <pre style={{
                        margin: 0,
                        whiteSpace: 'pre-wrap',
                        fontSize: '0.85rem',
                        color: 'var(--text-secondary)'
                      }}>
                        {rfqContent}
                      </pre>
                    </div>
                    <div style={{ marginTop: '1.5rem', textAlign: 'center' }}>
                      <button
                        className="btn btn-secondary"
                        onClick={() => {
                          setRfqContent('')
                          setRfqFile(null)
                        }}
                      >
                        <i className="fas fa-redo"></i> Procesar Otro Documento
                      </button>
                    </div>
                  </div>
                )}
              </div>
              <div className="modal-footer">
                <button className="btn btn-secondary" onClick={() => {
                  setShowRFQModal(false)
                  setRfqContent('')
                  setRfqFile(null)
                }}>
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal de Generador de Diagramas */}
        {showDiagramModal && (
          <div className="modal-overlay" onClick={() => setShowDiagramModal(false)}>
            <div className="modal-content modal-xl diagram-modal" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header diagram-header">
                <h3><i className="fas fa-project-diagram"></i> Generador de Diagramas</h3>
                <button className="modal-close" onClick={() => setShowDiagramModal(false)}>
                  <i className="fas fa-times"></i>
                </button>
              </div>
              <div className="modal-body diagram-body">
                {/* Panel de controles */}
                <div className="diagram-controls">
                  <div className="control-group">
                    <label><i className="fas fa-shapes"></i> Tipo de Diagrama</label>
                    <div className="diagram-type-selector">
                      <button
                        className={`diagram-type-btn ${diagramType === 'flowchart' ? 'active' : ''}`}
                        onClick={() => setDiagramType('flowchart')}
                      >
                        <i className="fas fa-project-diagram"></i>
                        <span>Flujo</span>
                      </button>
                      <button
                        className={`diagram-type-btn ${diagramType === 'sequence' ? 'active' : ''}`}
                        onClick={() => setDiagramType('sequence')}
                      >
                        <i className="fas fa-exchange-alt"></i>
                        <span>Secuencia</span>
                      </button>
                      <button
                        className={`diagram-type-btn ${diagramType === 'state' ? 'active' : ''}`}
                        onClick={() => setDiagramType('state')}
                      >
                        <i className="fas fa-circle-notch"></i>
                        <span>Estados</span>
                      </button>
                      <button
                        className={`diagram-type-btn ${diagramType === 'journey' ? 'active' : ''}`}
                        onClick={() => setDiagramType('journey')}
                      >
                        <i className="fas fa-route"></i>
                        <span>Journey</span>
                      </button>
                      <button
                        className={`diagram-type-btn ${diagramType === 'gantt' ? 'active' : ''}`}
                        onClick={() => setDiagramType('gantt')}
                      >
                        <i className="fas fa-tasks"></i>
                        <span>Gantt</span>
                      </button>
                      <button
                        className={`diagram-type-btn ${diagramType === 'pie' ? 'active' : ''}`}
                        onClick={() => setDiagramType('pie')}
                      >
                        <i className="fas fa-chart-pie"></i>
                        <span>Pie</span>
                      </button>
                      <button
                        className={`diagram-type-btn ${diagramType === 'mindmap' ? 'active' : ''}`}
                        onClick={() => setDiagramType('mindmap')}
                      >
                        <i className="fas fa-brain"></i>
                        <span>Mindmap</span>
                      </button>
                    </div>
                  </div>

                  {diagramType === 'flowchart' && (
                    <div className="control-group">
                      <label><i className="fas fa-arrows-alt"></i> Dirección</label>
                      <div className="direction-selector">
                        <button
                          className={`direction-btn ${diagramDirection === 'TB' ? 'active' : ''}`}
                          onClick={() => setDiagramDirection('TB')}
                          title="Arriba a Abajo"
                        >
                          <i className="fas fa-arrow-down"></i> TB
                        </button>
                        <button
                          className={`direction-btn ${diagramDirection === 'LR' ? 'active' : ''}`}
                          onClick={() => setDiagramDirection('LR')}
                          title="Izquierda a Derecha"
                        >
                          <i className="fas fa-arrow-right"></i> LR
                        </button>
                        <button
                          className={`direction-btn ${diagramDirection === 'BT' ? 'active' : ''}`}
                          onClick={() => setDiagramDirection('BT')}
                          title="Abajo a Arriba"
                        >
                          <i className="fas fa-arrow-up"></i> BT
                        </button>
                        <button
                          className={`direction-btn ${diagramDirection === 'RL' ? 'active' : ''}`}
                          onClick={() => setDiagramDirection('RL')}
                          title="Derecha a Izquierda"
                        >
                          <i className="fas fa-arrow-left"></i> RL
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Sección de IA para generar diagramas desde texto */}
                  <div className="control-group ai-diagram-section">
                    <label><i className="fas fa-robot"></i> Generar con IA</label>
                    <div className="ai-prompt-container">
                      <div className="ai-prompt-input-wrapper">
                        <textarea
                          ref={diagramPromptRef}
                          className="ai-prompt-textarea"
                          placeholder="Describe el proceso que quieres diagramar... Ejemplo: 'Primero abrir navegador, luego navegar a Google, escribir en el buscador, esperar resultados, hacer clic en el primer enlace'"
                          value={diagramAIPrompt}
                          onChange={(e) => setDiagramAIPrompt(e.target.value)}
                          rows={3}
                        />
                        <button
                          className={`btn btn-voice-diagram ${isDiagramDictating ? 'dictating' : ''}`}
                          onClick={toggleDiagramDictation}
                          title={isDiagramDictating ? 'Detener dictado' : 'Dictar con voz'}
                        >
                          <i className={`fas ${isDiagramDictating ? 'fa-stop-circle' : 'fa-microphone'}`}></i>
                        </button>
                      </div>
                      <div className="ai-prompt-actions">
                        <button
                          className="btn btn-ai-generate"
                          onClick={generateDiagramFromAI}
                          disabled={isGeneratingDiagramFromAI || !diagramAIPrompt.trim()}
                        >
                          {isGeneratingDiagramFromAI ? (
                            <><i className="fas fa-spinner fa-spin"></i> Generando...</>
                          ) : (
                            <><i className="fas fa-wand-magic-sparkles"></i> Generar desde Texto</>
                          )}
                        </button>
                        <button
                          className="btn btn-clear-prompt"
                          onClick={() => setDiagramAIPrompt('')}
                          disabled={!diagramAIPrompt}
                          title="Limpiar texto"
                        >
                          <i className="fas fa-eraser"></i>
                        </button>
                      </div>
                    </div>
                    <p className="ai-hint">
                      <i className="fas fa-lightbulb"></i> Usa palabras como: "primero", "luego", "después", "si", "mientras", etc.
                    </p>
                  </div>

                  <div className="diagram-buttons-row">
                    <button
                      className="btn btn-diagram-generate"
                      onClick={generateDiagramFromWorkflow}
                      disabled={isGeneratingDiagram}
                    >
                      {isGeneratingDiagram ? (
                        <><i className="fas fa-spinner fa-spin"></i> Generando...</>
                      ) : (
                        <><i className="fas fa-magic"></i> Desde Workflow</>
                      )}
                    </button>
                    <button
                      className="btn btn-workflow-generate"
                      onClick={generateWorkflowFromDiagram}
                      disabled={isGeneratingWorkflowFromDiagram || !diagramCode}
                      title="Generar pasos de workflow desde el diagrama actual"
                    >
                      {isGeneratingWorkflowFromDiagram ? (
                        <><i className="fas fa-spinner fa-spin"></i> Generando...</>
                      ) : (
                        <><i className="fas fa-arrow-right"></i> Generar Workflow</>
                      )}
                    </button>
                  </div>
                </div>

                {/* Área de visualización del diagrama */}
                <div className="diagram-preview-area">
                  <div className="diagram-preview-header">
                    <span><i className="fas fa-eye"></i> Vista Previa</span>
                    <div className="diagram-actions">
                      <button className="btn btn-sm btn-secondary" onClick={copyDiagramCode} title="Copiar código Mermaid">
                        <i className="fas fa-copy"></i>
                      </button>
                      <button className="btn btn-sm btn-success" onClick={exportDiagramToPDF} title="Exportar como imagen">
                        <i className="fas fa-file-image"></i> Exportar
                      </button>
                    </div>
                  </div>
                  <div className="diagram-preview-container" ref={diagramContainerRef}>
                    {!diagramCode ? (
                      <div className="diagram-placeholder">
                        <i className="fas fa-project-diagram"></i>
                        <h4>Genera un diagrama</h4>
                        <p>Selecciona el tipo de diagrama y haz clic en "Generar Diagrama"</p>
                        <p className="hint">
                          {workflowSteps.length === 0
                            ? 'Agrega pasos a tu workflow primero'
                            : `Tu workflow tiene ${workflowSteps.length} pasos listos para diagramar`}
                        </p>
                      </div>
                    ) : (
                      <div className="mermaid-container">
                        <pre className="mermaid">{diagramCode}</pre>
                      </div>
                    )}
                  </div>
                </div>

                {/* Editor de código Mermaid */}
                {diagramCode && (
                  <div className="diagram-code-editor">
                    <div className="code-editor-header">
                      <span><i className="fas fa-code"></i> Código Mermaid</span>
                      <span className="code-hint">Puedes editar el código manualmente</span>
                    </div>
                    <textarea
                      className="mermaid-code-input"
                      value={diagramCode}
                      onChange={(e) => {
                        setDiagramCode(e.target.value)
                        setTimeout(() => renderMermaidDiagram(e.target.value), 500)
                      }}
                      rows={8}
                      spellCheck={false}
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Modal de Cargar desde Editor de Código */}
        {showCodeEditorModal && (
          <div className="modal-overlay" onClick={() => setShowCodeEditorModal(false)}>
            <div className="modal-content modal-lg" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h3><i className="fas fa-code"></i> Cargar desde Editor de Código</h3>
                <button className="modal-close" onClick={() => setShowCodeEditorModal(false)}><i className="fas fa-times"></i></button>
              </div>
              <div className="modal-body">
                {codeEditorActions.length === 0 ? (
                  <div className="empty-code-actions">
                    <i className="fas fa-file-code"></i>
                    <h4>No hay código disponible</h4>
                    <p>Exporta código desde el Editor de Código para usarlo en Workflows.</p>
                    <ol>
                      <li>Ve al <strong>Editor de Código</strong> en el menú lateral</li>
                      <li>Escribe o importa tu código</li>
                      <li>Haz clic en <strong>"A Workflow"</strong> para exportar</li>
                      <li>Regresa aquí para cargar el código</li>
                    </ol>
                  </div>
                ) : (
                  <div className="code-actions-list">
                    <p className="hint"><i className="fas fa-info-circle"></i> Selecciona el código que deseas agregar al workflow:</p>
                    {codeEditorActions.map((action, index) => (
                      <div key={index} className="code-action-item">
                        <div className="code-action-info">
                          <div className="code-action-header">
                            <i className="fas fa-file-code" style={{ color: getLanguageColor(action.language) }}></i>
                            <span className="code-action-name">{action.name}</span>
                            <span className="code-action-lang">{action.language}</span>
                          </div>
                          <pre className="code-action-preview">{action.code.substring(0, 200)}...</pre>
                          <small className="code-action-date">
                            <i className="fas fa-clock"></i> {new Date(action.createdAt).toLocaleString()}
                          </small>
                        </div>
                        <div className="code-action-buttons">
                          <button className="btn btn-sm btn-success" onClick={() => loadCodeFromEditor(action)}>
                            <i className="fas fa-plus"></i> Agregar
                          </button>
                          <button className="btn btn-sm btn-danger" onClick={() => removeCodeAction(index)}>
                            <i className="fas fa-trash"></i>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div className="modal-footer">
                <button className="btn btn-secondary" onClick={() => setShowCodeEditorModal(false)}>Cerrar</button>
              </div>
            </div>
          </div>
        )}

        {/* Modal de Guardar Workflow */}
        {showSaveModal && (
          <div className="modal-overlay" onClick={() => setShowSaveModal(false)}>
            <div className="modal-content modal-lg" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header" style={{ background: 'linear-gradient(135deg, var(--primary-color), #8b5cf6)' }}>
                <h3 style={{ color: 'white' }}><i className="fas fa-save"></i> Guardar Workflow</h3>
                <button className="modal-close" onClick={() => setShowSaveModal(false)} style={{ color: 'white' }}><i className="fas fa-times"></i></button>
              </div>
              <div className="modal-body" style={{ padding: '2rem' }}>
                {/* Nombre del workflow */}
                <div style={{ marginBottom: '1.5rem' }}>
                  <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)', fontWeight: '500' }}>
                    <i className="fas fa-file-alt" style={{ marginRight: '0.5rem', color: 'var(--primary-color)' }}></i>
                    Nombre del Workflow
                  </label>
                  <input
                    type="text"
                    value={workflowName}
                    onChange={(e) => setWorkflowName(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '0.875rem 1rem',
                      background: 'var(--dark-bg)',
                      border: '2px solid var(--border-color)',
                      borderRadius: '10px',
                      color: 'var(--text-primary)',
                      fontSize: '1rem',
                      fontWeight: '500'
                    }}
                    placeholder="Mi Workflow"
                  />
                </div>

                {/* Ubicación de guardado */}
                <div style={{ marginBottom: '1.5rem' }}>
                  <label style={{ display: 'block', marginBottom: '0.75rem', color: 'var(--text-secondary)', fontWeight: '500' }}>
                    <i className="fas fa-database" style={{ marginRight: '0.5rem', color: 'var(--primary-color)' }}></i>
                    Ubicación de Guardado
                  </label>
                  <div style={{ display: 'flex', gap: '1rem' }}>
                    <button
                      onClick={() => setSaveLocation('local')}
                      style={{
                        flex: 1,
                        padding: '1rem',
                        background: saveLocation === 'local' ? 'linear-gradient(135deg, var(--primary-color), #8b5cf6)' : 'var(--dark-bg)',
                        border: saveLocation === 'local' ? '2px solid var(--primary-color)' : '2px solid var(--border-color)',
                        borderRadius: '12px',
                        color: saveLocation === 'local' ? 'white' : 'var(--text-primary)',
                        cursor: 'pointer',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '0.5rem',
                        transition: 'all 0.3s'
                      }}
                    >
                      <i className="fas fa-hdd" style={{ fontSize: '1.5rem' }}></i>
                      <span style={{ fontWeight: '600' }}>Almacenamiento Local</span>
                      <small style={{ opacity: 0.8 }}>Guardado en el navegador</small>
                    </button>
                    <button
                      onClick={() => setSaveLocation('file')}
                      style={{
                        flex: 1,
                        padding: '1rem',
                        background: saveLocation === 'file' ? 'linear-gradient(135deg, #22c55e, #16a34a)' : 'var(--dark-bg)',
                        border: saveLocation === 'file' ? '2px solid #22c55e' : '2px solid var(--border-color)',
                        borderRadius: '12px',
                        color: saveLocation === 'file' ? 'white' : 'var(--text-primary)',
                        cursor: 'pointer',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '0.5rem',
                        transition: 'all 0.3s'
                      }}
                    >
                      <i className="fas fa-file-download" style={{ fontSize: '1.5rem' }}></i>
                      <span style={{ fontWeight: '600' }}>Descargar Archivo</span>
                      <small style={{ opacity: 0.8 }}>Archivo .alq en tu PC</small>
                    </button>
                  </div>
                </div>

                {/* Selector de carpeta (solo para almacenamiento local) */}
                {saveLocation === 'local' && (
                  <div style={{ marginBottom: '1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                      <label style={{ color: 'var(--text-secondary)', fontWeight: '500' }}>
                        <i className="fas fa-folder-open" style={{ marginRight: '0.5rem', color: 'var(--primary-color)' }}></i>
                        Carpeta de Destino
                      </label>
                      <button
                        onClick={() => setShowNewFolderInput(!showNewFolderInput)}
                        style={{
                          background: 'transparent',
                          border: 'none',
                          color: 'var(--primary-color)',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.5rem',
                          fontSize: '0.85rem'
                        }}
                      >
                        <i className="fas fa-folder-plus"></i> Nueva Carpeta
                      </button>
                    </div>

                    {/* Input para nueva carpeta */}
                    {showNewFolderInput && (
                      <div style={{
                        display: 'flex',
                        gap: '0.5rem',
                        marginBottom: '1rem',
                        padding: '1rem',
                        background: 'var(--bg-secondary)',
                        borderRadius: '10px',
                        border: '1px dashed var(--primary-color)'
                      }}>
                        <input
                          type="text"
                          value={newFolderName}
                          onChange={(e) => setNewFolderName(e.target.value)}
                          placeholder="Nombre de la nueva carpeta..."
                          onKeyPress={(e) => e.key === 'Enter' && addCustomFolder()}
                          style={{
                            flex: 1,
                            padding: '0.75rem',
                            background: 'var(--dark-bg)',
                            border: '1px solid var(--border-color)',
                            borderRadius: '8px',
                            color: 'var(--text-primary)'
                          }}
                        />
                        <button className="btn btn-primary" onClick={addCustomFolder}>
                          <i className="fas fa-check"></i>
                        </button>
                        <button className="btn btn-secondary" onClick={() => { setShowNewFolderInput(false); setNewFolderName('') }}>
                          <i className="fas fa-times"></i>
                        </button>
                      </div>
                    )}

                    {/* Grid de carpetas */}
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(3, 1fr)',
                      gap: '0.75rem',
                      maxHeight: '280px',
                      overflowY: 'auto',
                      padding: '0.5rem'
                    }}>
                      {/* Carpetas del sistema */}
                      {systemFolders.map(folder => (
                        <button
                          key={folder.name}
                          onClick={() => setSelectedFolder(folder.name)}
                          style={{
                            padding: '1rem',
                            background: selectedFolder === folder.name ? `${folder.color}20` : 'var(--dark-bg)',
                            border: selectedFolder === folder.name ? `2px solid ${folder.color}` : '2px solid var(--border-color)',
                            borderRadius: '12px',
                            cursor: 'pointer',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: '0.5rem',
                            transition: 'all 0.2s'
                          }}
                        >
                          <i className={`fas ${folder.icon}`} style={{ fontSize: '1.75rem', color: folder.color }}></i>
                          <span style={{
                            fontSize: '0.85rem',
                            color: selectedFolder === folder.name ? folder.color : 'var(--text-primary)',
                            fontWeight: selectedFolder === folder.name ? '600' : '400'
                          }}>{folder.name}</span>
                        </button>
                      ))}

                      {/* Carpetas personalizadas */}
                      {customFolders.map(folder => (
                        <div
                          key={folder}
                          style={{
                            position: 'relative',
                            padding: '1rem',
                            background: selectedFolder === folder ? 'rgba(139, 92, 246, 0.2)' : 'var(--dark-bg)',
                            border: selectedFolder === folder ? '2px solid #8b5cf6' : '2px solid var(--border-color)',
                            borderRadius: '12px',
                            cursor: 'pointer',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: '0.5rem',
                            transition: 'all 0.2s'
                          }}
                          onClick={() => setSelectedFolder(folder)}
                        >
                          <button
                            onClick={(e) => { e.stopPropagation(); removeCustomFolder(folder) }}
                            style={{
                              position: 'absolute',
                              top: '4px',
                              right: '4px',
                              background: 'var(--danger-color)',
                              border: 'none',
                              borderRadius: '50%',
                              width: '20px',
                              height: '20px',
                              color: 'white',
                              fontSize: '0.65rem',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center'
                            }}
                            title="Eliminar carpeta"
                          >
                            <i className="fas fa-times"></i>
                          </button>
                          <i className="fas fa-folder" style={{ fontSize: '1.75rem', color: '#8b5cf6' }}></i>
                          <span style={{
                            fontSize: '0.85rem',
                            color: selectedFolder === folder ? '#8b5cf6' : 'var(--text-primary)',
                            fontWeight: selectedFolder === folder ? '600' : '400',
                            textAlign: 'center',
                            wordBreak: 'break-word'
                          }}>{folder}</span>
                        </div>
                      ))}
                    </div>

                    {/* Carpeta seleccionada */}
                    {selectedFolder && (
                      <div style={{
                        marginTop: '1rem',
                        padding: '0.75rem 1rem',
                        background: 'var(--bg-secondary)',
                        borderRadius: '8px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem'
                      }}>
                        <i className="fas fa-check-circle" style={{ color: 'var(--success-color)' }}></i>
                        <span style={{ color: 'var(--text-secondary)' }}>Se guardará en:</span>
                        <strong style={{ color: 'var(--primary-color)' }}>{selectedFolder}</strong>
                      </div>
                    )}
                  </div>
                )}

                {/* Resumen */}
                <div style={{
                  padding: '1rem',
                  background: 'linear-gradient(135deg, rgba(37, 99, 235, 0.1), rgba(139, 92, 246, 0.1))',
                  borderRadius: '12px',
                  border: '1px solid rgba(37, 99, 235, 0.2)'
                }}>
                  <h4 style={{ margin: '0 0 0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <i className="fas fa-info-circle" style={{ color: 'var(--primary-color)' }}></i>
                    Resumen
                  </h4>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <i className="fas fa-layer-group" style={{ color: 'var(--text-secondary)' }}></i>
                      <span>{countSteps(workflowSteps)} pasos</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <i className="fas fa-cube" style={{ color: 'var(--text-secondary)' }}></i>
                      <span>{variables.length} variables</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <i className="fas fa-calendar" style={{ color: 'var(--text-secondary)' }}></i>
                      <span>{new Date().toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="modal-footer" style={{ borderTop: '1px solid var(--border-color)', padding: '1rem 2rem' }}>
                <button className="btn btn-secondary" onClick={() => setShowSaveModal(false)}>
                  <i className="fas fa-times"></i> Cancelar
                </button>
                <button
                  className="btn btn-success"
                  onClick={handleSaveConfirm}
                  style={{
                    background: 'linear-gradient(135deg, #22c55e, #16a34a)',
                    border: 'none'
                  }}
                >
                  <i className="fas fa-save"></i> Guardar Workflow
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal de Preview */}
        {showPreviewModal && (
          <div className="modal-overlay" onClick={() => setShowPreviewModal(false)}>
            <div className="modal-content modal-lg" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '900px' }}>
              <div className="modal-header" style={{ background: 'linear-gradient(135deg, #06b6d4, #0891b2)' }}>
                <h3 style={{ color: 'white' }}><i className="fas fa-eye"></i> {t('wf_preview')} - {workflowName}</h3>
                <button className="modal-close" onClick={() => setShowPreviewModal(false)} style={{ color: 'white' }}>
                  <i className="fas fa-times"></i>
                </button>
              </div>
              <div className="modal-body" style={{ maxHeight: '60vh', overflowY: 'auto' }}>
                <div style={{ marginBottom: '1rem', padding: '1rem', background: 'rgba(6, 182, 212, 0.1)', borderRadius: '10px', border: '1px solid rgba(6, 182, 212, 0.2)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span><i className="fas fa-layer-group"></i> {workflowSteps.length} {t('wf_steps')}</span>
                    <span><i className="fas fa-cube"></i> {variables.length} {t('wf_variables')}</span>
                    <span><i className="fas fa-clock"></i> ~{Math.ceil(workflowSteps.length * 0.8)}s {t('wf_estimated')}</span>
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <div style={{ padding: '0.75rem', background: 'linear-gradient(135deg, #22c55e, #16a34a)', borderRadius: '8px', color: 'white', textAlign: 'center' }}>
                    <i className="fas fa-play"></i> {t('wf_start')}
                  </div>
                  {workflowSteps.map((step, index) => (
                    <div key={step.id} style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      <div style={{ width: '30px', height: '30px', borderRadius: '50%', background: 'var(--primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', fontWeight: '600' }}>
                        {index + 1}
                      </div>
                      <div style={{ flex: 1, padding: '0.75rem', background: 'var(--card-bg)', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <i className={`fas ${step.icon || 'fa-cog'}`} style={{ color: 'var(--primary)' }}></i>
                          <strong>{step.label}</strong>
                        </div>
                        {step.properties && Object.keys(step.properties).length > 0 && (
                          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                            {Object.entries(step.properties).slice(0, 2).map(([key, val]) => (
                              <span key={key} style={{ marginRight: '1rem' }}>{key}: {String(val).substring(0, 30)}</span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                  <div style={{ padding: '0.75rem', background: 'linear-gradient(135deg, #ef4444, #dc2626)', borderRadius: '8px', color: 'white', textAlign: 'center' }}>
                    <i className="fas fa-stop"></i> {t('wf_end')}
                  </div>
                </div>
              </div>
              <div className="modal-footer" style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                <button className="btn btn-secondary" onClick={() => setShowPreviewModal(false)}>
                  <i className="fas fa-times"></i> {t('btn_close')}
                </button>
                <button className="btn btn-success" onClick={() => { setShowPreviewModal(false); executeWorkflow(); }}>
                  <i className="fas fa-play"></i> {t('wf_execute')}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal de Confirmación de Eliminación */}
        {showDeleteConfirm && (
          <div className="modal-overlay" onClick={() => setShowDeleteConfirm(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '450px' }}>
              <div className="modal-header" style={{ background: 'linear-gradient(135deg, #ef4444, #dc2626)' }}>
                <h3 style={{ color: 'white' }}><i className="fas fa-exclamation-triangle"></i> {t('msg_confirm_delete')}</h3>
                <button className="modal-close" onClick={() => setShowDeleteConfirm(false)} style={{ color: 'white' }}>
                  <i className="fas fa-times"></i>
                </button>
              </div>
              <div className="modal-body" style={{ textAlign: 'center', padding: '2rem' }}>
                <div style={{ fontSize: '4rem', color: '#ef4444', marginBottom: '1rem' }}>
                  <i className="fas fa-trash-alt"></i>
                </div>
                <p style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>
                  {t('msg_confirm_delete')}
                </p>
                <p style={{ color: 'var(--text-secondary)' }}>
                  <strong>"{workflowName}"</strong>
                </p>
                <p style={{ fontSize: '0.9rem', color: '#ef4444', marginTop: '1rem' }}>
                  <i className="fas fa-exclamation-circle"></i> {t('msg_action_irreversible') || 'Esta acción no se puede deshacer'}
                </p>
              </div>
              <div className="modal-footer" style={{ display: 'flex', justifyContent: 'center', gap: '1rem' }}>
                <button className="btn btn-secondary" onClick={() => setShowDeleteConfirm(false)}>
                  <i className="fas fa-times"></i> {t('btn_cancel')}
                </button>
                <button className="btn btn-danger" onClick={confirmDeleteWorkflow}>
                  <i className="fas fa-trash"></i> {t('btn_delete')}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Barra de Ejecución Flotante */}
        {showExecutionBar && (
          <div className="execution-bar" style={{
            position: 'fixed',
            bottom: '20px',
            left: '50%',
            transform: 'translateX(-50%)',
            background: 'linear-gradient(135deg, #1e293b, #0f172a)',
            borderRadius: '16px',
            padding: '1rem 2rem',
            boxShadow: '0 10px 40px rgba(0,0,0,0.5)',
            border: '1px solid rgba(255,255,255,0.1)',
            zIndex: 9999,
            minWidth: '500px',
            animation: 'slideUp 0.3s ease'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  background: isExecuting ? 'linear-gradient(135deg, #22c55e, #16a34a)' : '#22c55e',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  animation: isExecuting ? 'pulse 1.5s infinite' : 'none'
                }}>
                  <i className={`fas ${isExecuting ? 'fa-cog fa-spin' : 'fa-check'}`} style={{ color: 'white' }}></i>
                </div>
                <div>
                  <div style={{ fontWeight: '600', color: 'white' }}>
                    {isExecuting ? t('wf_executing') || 'Ejecutando...' : t('wf_completed') || 'Completado'}
                  </div>
                  <div style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.7)' }}>
                    {executionCurrentStep ? executionCurrentStep.label : workflowName}
                  </div>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <span style={{ color: '#22c55e', fontWeight: '600', fontSize: '1.1rem' }}>{executionProgress}%</span>
                {isExecuting && (
                  <button
                    onClick={stopExecution}
                    style={{
                      background: '#ef4444',
                      border: 'none',
                      borderRadius: '8px',
                      padding: '0.5rem 1rem',
                      color: 'white',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem'
                    }}
                  >
                    <i className="fas fa-stop"></i> {t('btn_stop')}
                  </button>
                )}
                {!isExecuting && (
                  <button
                    onClick={() => setShowExecutionBar(false)}
                    style={{
                      background: 'rgba(255,255,255,0.1)',
                      border: 'none',
                      borderRadius: '8px',
                      padding: '0.5rem 1rem',
                      color: 'white',
                      cursor: 'pointer'
                    }}
                  >
                    <i className="fas fa-times"></i>
                  </button>
                )}
              </div>
            </div>
            <div style={{
              height: '8px',
              background: 'rgba(255,255,255,0.1)',
              borderRadius: '4px',
              overflow: 'hidden'
            }}>
              <div style={{
                height: '100%',
                width: `${executionProgress}%`,
                background: 'linear-gradient(90deg, #22c55e, #16a34a)',
                borderRadius: '4px',
                transition: 'width 0.3s ease'
              }}></div>
            </div>
          </div>
        )}

        {/* MessageBox Modal Moderno */}
        {showMessageBox && (
          <div className="win-messagebox-overlay" onClick={closeMessageBox}>
            <div className="win-messagebox" onClick={e => e.stopPropagation()}>
              {/* Barra de título */}
              <div className="win-titlebar">
                <span className="win-title-text">{messageBoxContent.title || 'Alqvimia'}</span>
                <div className="win-titlebar-buttons">
                  <button className="win-btn-close" onClick={closeMessageBox}>
                    <i className="fas fa-times"></i>
                  </button>
                </div>
              </div>

              {/* Contenido */}
              <div className="win-content">
                <div className={`win-icon ${messageBoxContent.type}`}>
                  <i className={`fas ${
                    messageBoxContent.type === 'error' ? 'fa-times-circle' :
                    messageBoxContent.type === 'warning' ? 'fa-exclamation-triangle' :
                    messageBoxContent.type === 'success' ? 'fa-check-circle' :
                    messageBoxContent.type === 'question' ? 'fa-question-circle' :
                    'fa-info-circle'
                  }`} style={{
                    fontSize: '28px',
                    color: messageBoxContent.type === 'error' ? '#ef4444' :
                           messageBoxContent.type === 'warning' ? '#f59e0b' :
                           messageBoxContent.type === 'success' ? '#10b981' :
                           messageBoxContent.type === 'question' ? '#8b5cf6' :
                           '#3b82f6'
                  }}></i>
                </div>
                <div className="win-message">
                  <p>{messageBoxContent.message || 'Mensaje del sistema'}</p>
                  <div className="win-timer">
                    <span className="win-timer-label">Tiempo:</span>
                    <span className="win-timer-value">{formatElapsedTime(messageBoxElapsed)}</span>
                  </div>
                </div>
              </div>

              {/* Botones */}
              <div className="win-buttons">
                <button className="win-btn" onClick={closeMessageBox}>
                  Aceptar
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal de Validación de Errores */}
        {showValidationModal && (
          <div className="modal-overlay" onClick={() => setShowValidationModal(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '550px' }}>
              <div className="modal-header" style={{ background: 'linear-gradient(135deg, #f59e0b, #d97706)' }}>
                <h3 style={{ color: 'white' }}><i className="fas fa-exclamation-triangle"></i> Errores de Validación</h3>
                <button className="modal-close" onClick={() => setShowValidationModal(false)}>
                  <i className="fas fa-times"></i>
                </button>
              </div>
              <div className="modal-body" style={{ padding: '1.5rem' }}>
                <p style={{ marginBottom: '1rem', color: 'var(--text-secondary)' }}>
                  Se encontraron los siguientes errores que deben corregirse antes de ejecutar el workflow:
                </p>
                <div className="validation-errors-list" style={{ maxHeight: '350px', overflowY: 'auto' }}>
                  {validationErrors.map((stepError, index) => (
                    <div
                      key={index}
                      className="validation-error-item"
                      onClick={() => goToErrorStep(stepError.stepIndex)}
                      style={{
                        padding: '1rem',
                        marginBottom: '0.75rem',
                        background: 'rgba(239, 68, 68, 0.08)',
                        border: '1px solid rgba(239, 68, 68, 0.25)',
                        borderRadius: '10px',
                        cursor: 'pointer',
                        transition: 'all 0.2s'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = 'rgba(239, 68, 68, 0.15)'
                        e.currentTarget.style.borderColor = 'rgba(239, 68, 68, 0.4)'
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'rgba(239, 68, 68, 0.08)'
                        e.currentTarget.style.borderColor = 'rgba(239, 68, 68, 0.25)'
                      }}
                    >
                      {/* Header del paso */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
                        <div style={{
                          width: '32px',
                          height: '32px',
                          borderRadius: '8px',
                          background: 'linear-gradient(135deg, #ef4444, #dc2626)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: 'white',
                          fontSize: '0.8rem',
                          fontWeight: 'bold'
                        }}>
                          {stepError.stepNumber}
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontWeight: '600', color: 'var(--text-primary)', fontSize: '0.95rem' }}>
                            {stepError.stepLabel}
                          </div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                            Acción: {stepError.action}
                          </div>
                        </div>
                        <i className="fas fa-chevron-right" style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}></i>
                      </div>

                      {/* Lista de errores del paso */}
                      <div style={{
                        background: 'rgba(0, 0, 0, 0.15)',
                        borderRadius: '6px',
                        padding: '0.75rem',
                        marginLeft: '0.5rem'
                      }}>
                        {stepError.errors.map((err, errIndex) => (
                          <div
                            key={errIndex}
                            style={{
                              display: 'flex',
                              alignItems: 'flex-start',
                              gap: '0.5rem',
                              marginBottom: errIndex < stepError.errors.length - 1 ? '0.5rem' : 0
                            }}
                          >
                            <i className="fas fa-times-circle" style={{
                              color: '#ef4444',
                              marginTop: '0.15rem',
                              fontSize: '0.8rem'
                            }}></i>
                            <div>
                              <span style={{
                                color: '#ef4444',
                                fontWeight: '500',
                                fontSize: '0.85rem'
                              }}>
                                {err.label}:
                              </span>
                              <span style={{
                                color: 'var(--text-primary)',
                                marginLeft: '0.35rem',
                                fontSize: '0.85rem'
                              }}>
                                {err.message}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="modal-footer" style={{ padding: '1rem 1.5rem', borderTop: '1px solid var(--border-color)' }}>
                <button
                  className="btn btn-secondary"
                  onClick={() => setShowValidationModal(false)}
                >
                  Cerrar
                </button>
                <button
                  className="btn btn-primary"
                  onClick={() => {
                    if (validationErrors.length > 0) {
                      goToErrorStep(validationErrors[0].stepIndex)
                      setShowValidationModal(false)
                    }
                  }}
                >
                  <i className="fas fa-arrow-right"></i> Ir al primer error
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  )
}

export default WorkflowsView
