# Alqvimia RPA 2.0 - Catalogo Completo de Componentes y Acciones del Workflow

## Indice

1. [Estructura General de una Accion](#1-estructura-general-de-una-accion)
2. [Tipos de Campo Disponibles](#2-tipos-de-campo-disponibles)
3. [Acciones Contenedoras](#3-acciones-contenedoras)
4. [Categorias y Acciones](#4-categorias-y-acciones)
   - 4.1 [Control de Flujo](#41-control-de-flujo)
   - 4.2 [Dialogos y Mensajes](#42-dialogos-y-mensajes)
   - 4.3 [Variables y Datos](#43-variables-y-datos)
   - 4.4 [Texto y Strings](#44-texto-y-strings)
   - 4.5 [Colecciones y DataTables](#45-colecciones-y-datatables)
   - 4.6 [Navegador Web](#46-navegador-web)
   - 4.7 [Active Directory](#47-active-directory)
   - 4.8 [Inteligencia Artificial](#48-inteligencia-artificial)
   - 4.9 [Base de Datos](#49-base-de-datos)
   - 4.10 [Archivos y Carpetas](#410-archivos-y-carpetas)
   - 4.11 [Correo Electronico](#411-correo-electronico)
   - 4.12 [Excel Avanzado (COM/OLE)](#412-excel-avanzado-comole)
   - 4.13 [Excel Segundo Plano (Sin GUI)](#413-excel-segundo-plano-sin-gui)
   - 4.14 [PDF](#414-pdf)
   - 4.15 [Word](#415-word)
   - 4.16 [PowerPoint](#416-powerpoint)
   - 4.17 [API y HTTP](#417-api-y-http)
   - 4.18 [SAP](#418-sap)
   - 4.19 [Microsoft 365](#419-microsoft-365)
   - 4.20 [Twilio](#420-twilio)
   - 4.21 [WhatsApp](#421-whatsapp)
   - 4.22 [Telegram](#422-telegram)
   - 4.23 [Slack](#423-slack)
   - 4.24 [Microsoft Teams](#424-microsoft-teams)
   - 4.25 [PayPal](#425-paypal)
   - 4.26 [Stripe](#426-stripe)
   - 4.27 [Shopify](#427-shopify)
   - 4.28 [WooCommerce](#428-woocommerce)
   - 4.29 [Amazon SP-API](#429-amazon-sp-api)
   - 4.30 [Mercado Libre](#430-mercado-libre)
   - 4.31 [HubSpot](#431-hubspot)
   - 4.32 [Zoho CRM](#432-zoho-crm)
   - 4.33 [Zoho Desk](#433-zoho-desk)
   - 4.34 [Zoho Books](#434-zoho-books)
   - 4.35 [Pipedrive](#435-pipedrive)
   - 4.36 [CAPTCHA](#436-captcha)
   - 4.37 [Escritorio y Mouse/Teclado](#437-escritorio-y-mouseteclado)
   - 4.38 [Procesos y Sistema](#438-procesos-y-sistema)
   - 4.39 [Herramientas de Desarrollo](#439-herramientas-de-desarrollo)
   - 4.40 [Web Scraping](#440-web-scraping)
   - 4.41 [Firma Digital y Documentos](#441-firma-digital-y-documentos)
   - 4.42 [Bases de Datos Cloud](#442-bases-de-datos-cloud)
   - 4.43 [Traduccion](#443-traduccion)
   - 4.44 [Analytics](#444-analytics)
5. [Componentes Personalizados](#5-componentes-personalizados)
6. [Estadisticas del Sistema](#6-estadisticas-del-sistema)

---

## 1. Estructura General de una Accion

Cada paso (step) del workflow sigue esta estructura:

```json
{
  "id": "step_1",
  "action": "action_key",
  "icon": "fa-icon-class",
  "label": "Descripcion visible del paso",
  "params": {
    "param1": "valor1",
    "param2": "valor2"
  },
  "isContainer": false,
  "children": []
}
```

### Definicion en `actionProperties.js`

Cada accion se define con esta estructura:

```javascript
action_key: {
  title: "Titulo visible",
  icon: "fa-icon-class",
  description: "Que hace esta accion",
  isContainer: true | false,
  fields: [
    {
      key: "nombreParametro",
      label: "Etiqueta visible",
      type: "tipo_de_campo",
      required: true | false,
      default: "valorPorDefecto",
      placeholder: "Texto de ayuda",
      min: 0, max: 100, step: 1,
      options: [{ value: "val", label: "Texto", icon: "fa-icon" }],
      condition: { field: "otroParametro", value: "valorEspecifico" },
      helpText: "Tooltip de ayuda",
      advanced: true | false
    }
  ]
}
```

---

## 2. Tipos de Campo Disponibles

| Tipo | Descripcion | Ejemplo de Uso |
|------|-------------|----------------|
| `text` | Texto de una linea | URLs, nombres, selectores |
| `textarea` | Texto multilinea | Codigo, JSON, HTML |
| `number` | Entrada numerica | Con min/max/step |
| `slider` | Control deslizante | Rangos con visual slider |
| `select` | Menu desplegable | Tipo de navegador, direccion |
| `multiSelect` | Seleccion multiple | Tipos de analisis, entidades |
| `buttonGroup` | Grupo de botones | clickType (simple/doble/derecho) |
| `checkbox` | Casilla de verificacion | Toggles true/false |
| `toggle` | Interruptor booleano | Activar/desactivar funciones |
| `file` | Selector de archivo | Con fileType y accept patterns |
| `fileWithVariable` | Archivo o variable | Soporta rutas y referencias a variables |
| `folder` | Selector de carpeta | Directorios |
| `url` | Entrada de URL | Con validacion de formato |
| `email` | Entrada de email | Con validacion |
| `password` | Entrada oculta | Contrasenas y tokens |
| `selector` | Selector CSS/XPath | Elementos web |
| `variable` | Nombre de variable | Para almacenar resultados |
| `variableSelect` | Dropdown de variables | Seleccionar variables existentes |
| `expression` | Expresion de codigo | JavaScript/referencias a variables |
| `tags` | Entrada de etiquetas | Items separados por comas |
| `code` | Editor de codigo | Con soporte de lenguaje (json, js, etc) |
| `color` | Selector de color | Hex/RGB |
| `date` | Selector de fecha | Formato fecha |
| `time` | Selector de hora | Formato hora |
| `datetime` | Fecha y hora | Combinado |

---

## 3. Acciones Contenedoras

Las siguientes acciones pueden contener pasos hijos dentro de `children[]`:

| Accion | Label | Icono | Descripcion |
|--------|-------|-------|-------------|
| `step_group` | Step (Grupo) | `fa-layer-group` | Agrupa acciones logicamente |
| `if_condition` | Si / Condicion | `fa-question` | Ejecuta hijos si la condicion es verdadera |
| `else_condition` | Sino (Else) | `fa-random` | Rama alternativa del IF |
| `switch_case` | Switch / Case | `fa-sitemap` | Ramificacion multiple por valor |
| `for_loop` | Bucle For | `fa-redo` | Repite N veces o por rango |
| `for_each` | Para Cada | `fa-list` | Itera sobre coleccion |
| `while_loop` | Bucle While | `fa-sync` | Repite mientras condicion sea verdadera |
| `do_while` | Hacer Mientras | `fa-sync-alt` | Variante do-while |
| `try_catch` | Try/Catch | `fa-shield-alt` | Manejo de excepciones |

---

## 4. Categorias y Acciones

---

### 4.1 Control de Flujo
**Icono de categoria:** `fa-code-branch` | **ID:** `control-flow`

| Accion | Label | Icono | Contenedor | Parametros Clave |
|--------|-------|-------|------------|-----------------|
| `step_group` | Step (Grupo) | `fa-layer-group` | SI | `groupName`, `collapsed` |
| `if_condition` | Si / Condicion | `fa-question` | SI | `leftOperand`, `operator` (==, !=, >, <, >=, <=, contains, startsWith, endsWith, matches, isEmpty, isNotEmpty), `rightOperand`, `caseSensitive` |
| `else_condition` | Sino (Else) | `fa-random` | SI | _(se empareja con if_condition)_ |
| `switch_case` | Switch / Case | `fa-sitemap` | SI | `expression`, `cases[]`, `defaultCase` |
| `for_loop` | Bucle For | `fa-redo` | SI | `loopType` (count/range/collection), `count`, `start`, `end`, `step`, `indexVariable` |
| `for_each` | Para Cada | `fa-list` | SI | `collection`, `itemVariable`, `indexVariable` |
| `while_loop` | Bucle While | `fa-sync` | SI | `condition`, `maxIterations` |
| `do_while` | Hacer Mientras | `fa-sync-alt` | SI | `condition`, `maxIterations` |
| `break` | Break (Salir) | `fa-stop` | NO | _(sale del bucle actual)_ |
| `continue` | Continue | `fa-step-forward` | NO | _(salta a siguiente iteracion)_ |
| `delay` | Esperar/Delay | `fa-clock` | NO | `unit` (milliseconds/seconds/minutes), `duration` |
| `wait_condition` | Esperar Condicion | `fa-hourglass-half` | NO | `conditionCategory`, condiciones variables por tipo |
| `wait_screen_change` | Esperar Cambio Pantalla | `fa-desktop` | NO | `timeout`, `region` |
| `wait_window` | Esperar Ventana | `fa-window-restore` | NO | `windowTitle`, `action` (appear/disappear), `timeout` |
| `pause` | Pausa (MessageBox) | `fa-pause-circle` | NO | `message`, `title` |
| `try_catch` | Try/Catch | `fa-shield-alt` | SI | `catchVariable`, `finallyBlock` |
| `throw` | Lanzar Excepcion | `fa-exclamation-triangle` | NO | `errorMessage`, `errorType` |
| `return` | Retornar Valor | `fa-sign-out-alt` | NO | `returnValue` |
| `comment` | Comentario | `fa-comment` | NO | `text` |

---

### 4.2 Dialogos y Mensajes
**Icono de categoria:** `fa-comment-dots` | **ID:** `dialogs`

| Accion | Label | Icono | Parametros Clave |
|--------|-------|-------|-----------------|
| `message_box` | Message Box | `fa-window-restore` | `title`, `message`, `buttons` (ok/okCancel/yesNo/yesNoCancel), `icon` (info/warning/error/question), `variable` |
| `input_dialog` | Input Dialog | `fa-keyboard` | `title`, `message`, `defaultValue`, `inputType` (text/number/password), `variable` |
| `confirm_dialog` | Confirm Dialog | `fa-question-circle` | `title`, `message`, `variable` |
| `select_file` | Seleccionar Archivo | `fa-folder-open` | `title`, `filter`, `multiSelect`, `variable` |
| `select_folder` | Seleccionar Carpeta | `fa-folder` | `title`, `variable` |
| `notification` | Notificacion | `fa-bell` | `title`, `message`, `type` (info/success/warning/error), `duration` |
| `log_message` | Log Message | `fa-terminal` | `message`, `level` (info/warning/error/debug), `logToFile` |

---

### 4.3 Variables y Datos
**Icono de categoria:** `fa-cube` | **ID:** `variables`

| Accion | Label | Icono | Parametros Clave |
|--------|-------|-------|-----------------|
| `assign` | Asignar Variable | `fa-equals` | `variableName`, `value` |
| `set_variable` | Establecer Valor | `fa-pen` | `name`, `valueType` (text/number/boolean/array/object/expression), `value` |
| `get_variable` | Obtener Valor | `fa-eye` | `name`, `outputVariable` |
| `increment` | Incrementar | `fa-plus` | `name`, `amount` (default: 1) |
| `decrement` | Decrementar | `fa-minus` | `name`, `amount` (default: 1) |
| `convert_type` | Convertir Tipo | `fa-exchange-alt` | `inputValue`, `targetType` (string/number/boolean/array/object/date) |
| `parse_json` | Parsear JSON | `fa-code` | `jsonString`, `outputVariable` |
| `stringify_json` | JSON a String | `fa-file-code` | `jsonObject`, `outputVariable`, `pretty` |
| `get_date` | Obtener Fecha | `fa-calendar` | `format`, `outputVariable` |
| `format_date` | Formatear Fecha | `fa-calendar-check` | `date`, `format`, `outputVariable` |
| `date_diff` | Diferencia Fechas | `fa-calendar-minus` | `date1`, `date2`, `unit` (days/hours/minutes/seconds), `outputVariable` |

---

### 4.4 Texto y Strings
**Icono de categoria:** `fa-font` | **ID:** `text`

| Accion | Label | Icono | Parametros Clave |
|--------|-------|-------|-----------------|
| `concat_string` | Concatenar Texto | `fa-link` | `texts[]` (tags), `separator`, `variable` |
| `split_string` | Dividir Texto | `fa-cut` | `text`, `delimiter`, `outputVariable` |
| `replace_text` | Reemplazar Texto | `fa-exchange-alt` | `text`, `find`, `replace`, `useRegex`, `replaceAll`, `variable` |
| `substring` | Subcadena | `fa-text-width` | `text`, `startIndex`, `length`, `outputVariable` |
| `trim` | Trim (Espacios) | `fa-eraser` | `text`, `trimType` (left/right/both), `variable` |
| `to_upper` | Mayusculas | `fa-arrow-up` | `text`, `outputVariable` |
| `to_lower` | Minusculas | `fa-arrow-down` | `text`, `outputVariable` |
| `regex_match` | Expresion Regular | `fa-asterisk` | `text`, `pattern`, `flags`, `outputVariable` |
| `text_length` | Longitud de Texto | `fa-ruler` | `text`, `outputVariable` |
| `contains` | Contiene Texto | `fa-search` | `text`, `searchTerm`, `caseSensitive`, `outputVariable` |

---

### 4.5 Colecciones y DataTables
**Icono de categoria:** `fa-list-ul` | **ID:** `collections`

#### Listas

| Accion | Label | Icono | Parametros Clave |
|--------|-------|-------|-----------------|
| `create_list` | Crear Lista | `fa-plus-square` | `name`, `initialItems` |
| `add_to_list` | Agregar a Lista | `fa-plus` | `list`, `item`, `position` |
| `remove_from_list` | Remover de Lista | `fa-minus` | `list`, `itemIndex` |
| `get_item` | Obtener Item | `fa-hand-pointer` | `list`, `index`, `outputVariable` |
| `list_count` | Contar Items | `fa-calculator` | `list`, `outputVariable` |
| `sort_list` | Ordenar Lista | `fa-sort` | `list`, `sortField`, `ascending` |
| `filter_list` | Filtrar Lista | `fa-filter` | `list`, `filterCondition`, `outputVariable` |

#### Diccionarios

| Accion | Label | Icono | Parametros Clave |
|--------|-------|-------|-----------------|
| `create_dictionary` | Crear Diccionario | `fa-book` | `name`, `initialPairs` |
| `get_keys` | Obtener Claves | `fa-key` | `dictionary`, `outputVariable` |
| `get_values` | Obtener Valores | `fa-list` | `dictionary`, `outputVariable` |

#### DataTables

| Accion | Label | Icono | Parametros Clave |
|--------|-------|-------|-----------------|
| `dt_create` | Crear DataTable | `fa-table` | `name`, `columns[]` |
| `dt_add_row` | Agregar Fila | `fa-plus-circle` | `dataTable`, `values` |
| `dt_filter` | Filtrar DataTable | `fa-filter` | `dataTable`, `condition`, `outputVariable` |
| `dt_sort` | Ordenar DataTable | `fa-sort-amount-down` | `dataTable`, `column`, `ascending` |
| `dt_get_row` | Obtener Fila | `fa-arrow-right` | `dataTable`, `rowIndex`, `outputVariable` |
| `dt_update_row` | Actualizar Fila | `fa-edit` | `dataTable`, `rowIndex`, `values` |
| `dt_delete_row` | Eliminar Fila | `fa-trash` | `dataTable`, `rowIndex` |
| `dt_count` | Contar Filas | `fa-calculator` | `dataTable`, `outputVariable` |
| `dt_to_json` | DataTable a JSON | `fa-file-code` | `dataTable`, `outputVariable` |
| `dt_from_json` | JSON a DataTable | `fa-code` | `jsonData`, `outputVariable` |
| `dt_to_csv` | DataTable a CSV | `fa-file-csv` | `dataTable`, `filePath`, `separator` |
| `dt_from_csv` | CSV a DataTable | `fa-file-csv` | `filePath`, `separator`, `outputVariable` |

---

### 4.6 Navegador Web
**Icono de categoria:** `fa-globe` | **ID:** `web-browser`

#### Apertura y Navegacion

| Accion | Label | Icono | Parametros Clave |
|--------|-------|-------|-----------------|
| `browser_open` | Abrir Navegador | `fa-window-maximize` | `browser` (chrome/edge/firefox/brave), `headless`, `incognito`, `maximized`, `width`, `height`, `userAgent`, `proxy` |
| `navigate` | Navegar a URL | `fa-compass` | `url`, `waitUntil` (load/domcontentloaded/networkidle), `timeout`, `clearCookies` |
| `browser_back` | Retroceder | `fa-arrow-left` | - |
| `browser_forward` | Avanzar | `fa-arrow-right` | - |
| `browser_refresh` | Actualizar Pagina | `fa-sync` | `hardRefresh` |
| `browser_close` | Cerrar Navegador | `fa-times-circle` | `saveSession`, `clearData` |

#### Interaccion con Elementos

| Accion | Label | Icono | Parametros Clave |
|--------|-------|-------|-----------------|
| `click` | Hacer Clic | `fa-mouse-pointer` | `selector`, `selectorType` (css/xpath/text), `clickType` (single/double/right), `button`, `waitBefore`, `scrollIntoView`, `force` |
| `double_click` | Doble Clic | `fa-mouse` | `selector`, `selectorType` |
| `right_click` | Clic Derecho | `fa-hand-pointer` | `selector`, `selectorType` |
| `type` | Escribir Texto | `fa-keyboard` | `selector`, `text`, `inputMethod` (type/fill/paste), `clearBefore`, `delay`, `pressKeyAfter` |
| `clear_field` | Limpiar Campo | `fa-eraser` | `selector` |
| `select_option` | Seleccionar Opcion | `fa-caret-down` | `selector`, `optionValue`, `optionText` |
| `check_checkbox` | Marcar Checkbox | `fa-check-square` | `selector`, `checked` |

#### Extraccion de Datos

| Accion | Label | Icono | Parametros Clave |
|--------|-------|-------|-----------------|
| `get_attribute` | Obtener Atributo | `fa-info-circle` | `selector`, `attributeName`, `variable` |
| `get_text` | Obtener Texto | `fa-font` | `selector`, `variable` |
| `extract_text` | Extraer Texto | `fa-file-alt` | `selector`, `extractType` (innerText/innerHTML/value/attribute), `attribute`, `variable`, `trim`, `regex` |
| `extract_table` | Extraer Tabla | `fa-table` | `selector`, `variable`, `headers` |

#### Capturas y Scroll

| Accion | Label | Icono | Parametros Clave |
|--------|-------|-------|-----------------|
| `screenshot` | Captura de Pantalla | `fa-camera` | `target` (page/viewport/element), `selector`, `format` (png/jpeg/webp), `quality`, `path`, `variable` |
| `screenshot_element` | Captura Elemento | `fa-crop` | `selector`, `format`, `quality`, `path`, `variable` |
| `scroll` | Hacer Scroll | `fa-arrows-alt-v` | `scrollType` (pixels/element/top/bottom), `direction`, `pixels`, `selector`, `behavior` |
| `scroll_to_element` | Scroll a Elemento | `fa-crosshairs` | `selector` |

#### Esperas y Verificacion

| Accion | Label | Icono | Parametros Clave |
|--------|-------|-------|-----------------|
| `wait_element` | Esperar Elemento | `fa-hourglass-half` | `selector`, `selectorType`, `timeout` |
| `element_exists` | Elemento Existe | `fa-question` | `selector`, `outputVariable` |

#### Pestanas y Frames

| Accion | Label | Icono | Parametros Clave |
|--------|-------|-------|-----------------|
| `switch_tab` | Cambiar Pestana | `fa-exchange-alt` | `tabTitle`, `tabUrl`, `tabIndex` |
| `new_tab` | Nueva Pestana | `fa-plus` | `url` |
| `close_tab` | Cerrar Pestana | `fa-times` | `tabTitle`, `tabUrl` |
| `switch_frame` | Cambiar Frame | `fa-window-restore` | `frameSelector`, `frameName` |

#### JavaScript

| Accion | Label | Icono | Parametros Clave |
|--------|-------|-------|-----------------|
| `execute_js` | Ejecutar JavaScript | `fa-code` | `code`, `outputVariable` |

---

### 4.7 Active Directory
**Icono de categoria:** `fa-users-cog` | **ID:** `active-directory`

| Accion | Label | Icono | Parametros Clave |
|--------|-------|-------|-----------------|
| `ad_connect` | Conectar AD | `fa-server` | `server` (LDAP URL), `username`, `password`, `domain`, `port` |
| `ad_get_user` | Obtener Usuario | `fa-user` | `samAccountName`, `variable` |
| `ad_search_users` | Buscar Usuarios | `fa-search` | `searchQuery`, `searchBase`, `variable` |
| `ad_create_user` | Crear Usuario | `fa-user-plus` | `samAccountName`, `password`, `firstname`, `lastname`, `email`, `groups[]` |
| `ad_update_user` | Actualizar Usuario | `fa-user-edit` | `samAccountName`, `updates` (JSON) |
| `ad_disable_user` | Deshabilitar Usuario | `fa-user-lock` | `samAccountName`, `moveToDisabled` |
| `ad_enable_user` | Habilitar Usuario | `fa-user-check` | `samAccountName` |
| `ad_reset_password` | Resetear Contrasena | `fa-key` | `samAccountName`, `newPassword` |
| `ad_get_groups` | Obtener Grupos | `fa-users` | `samAccountName`, `variable` |
| `ad_add_to_group` | Agregar a Grupo | `fa-user-friends` | `samAccountName`, `groupName` |
| `ad_remove_from_group` | Remover de Grupo | `fa-user-minus` | `samAccountName`, `groupName` |
| `ad_disconnect` | Desconectar AD | `fa-unlink` | - |

---

### 4.8 Inteligencia Artificial
**Icono de categoria:** `fa-brain` | **ID:** `ai`

| Accion | Label | Icono | Parametros Clave |
|--------|-------|-------|-----------------|
| `ai_text_generation` | Generar Texto | `fa-robot` | `prompt`, `aiProvider` (openai/google/azure/aws/claude/local), `model`, `temperature`, `maxTokens`, `variable` |
| `ai_chat` | Chat con IA | `fa-comments` | `message`, `aiProvider`, `model`, `systemPrompt`, `conversationHistory`, `variable` |
| `ai_sentiment` | Analisis de Sentimiento | `fa-smile` | `text`, `language`, `variable` |
| `ai_classification` | Clasificacion | `fa-tags` | `text`, `categories[]`, `language`, `variable` |
| `ai_summarize` | Resumir Texto | `fa-compress-alt` | `inputType` (text/variable/file), `text`, `language`, `summaryLength`, `variable` |
| `ai_translation` | Traduccion | `fa-language` | `text`, `sourceLanguage`, `targetLanguage`, `variable` |
| `ai_extract_entities` | Extraer Entidades | `fa-highlight` | `inputType` (text/variable/file), `text`, `entityTypes[]` (person/organization/location/date/money/email/phone/custom), `customEntities`, `language`, `confidence`, `variable` |
| `ai_image_analysis` | Analisis de Imagen | `fa-image` | `source` (file/url/screenshot/variable/clipboard), `imagePath`, `imageUrl`, `imageVariable`, `analysisType[]`, `aiProvider`, `prompt`, `language`, `confidence`, `maxResults`, `variable` |
| `ai_ocr` | OCR con IA | `fa-file-image` | `source` (file/variable), `imagePath`, `imageVariable`, `language`, `variable` |
| `ai_document_understanding` | Document Understanding | `fa-file-invoice` | `documentPath`, `documentType`, `extractFields[]`, `aiProvider`, `language`, `outputFormat`, `variable` |

**Proveedores de IA soportados:**
- `openai` - GPT-4, GPT-3.5
- `google` - Vertex AI
- `azure` - Azure OpenAI
- `aws` - Amazon Bedrock
- `claude` - Anthropic Claude
- `local` - Ollama (modelos locales)

---

### 4.9 Base de Datos
**Icono de categoria:** `fa-database` | **ID:** `database`

| Accion | Label | Icono | Parametros Clave |
|--------|-------|-------|-----------------|
| `db_connect` | Conectar Base de Datos | `fa-plug` | `databaseType` (mysql/postgresql/sql_server/oracle/mongodb), `host`, `port`, `username`, `password`, `database`, `variable` |
| `db_query` | Ejecutar Consulta | `fa-search` | `sql`, `variable` |
| `db_execute` | Ejecutar Comando | `fa-play` | `sql` |
| `db_insert` | Insertar Datos | `fa-plus-circle` | `table`, `columns`, `values` |
| `db_update` | Actualizar Datos | `fa-edit` | `table`, `updates` (JSON), `whereCondition` |
| `db_delete` | Eliminar Datos | `fa-trash` | `table`, `whereCondition` |
| `db_stored_procedure` | Stored Procedure | `fa-cogs` | `procedureName`, `parameters`, `variable` |
| `db_transaction_start` | Iniciar Transaccion | `fa-lock` | - |
| `db_transaction_commit` | Commit | `fa-check` | - |
| `db_transaction_rollback` | Rollback | `fa-undo` | - |
| `db_disconnect` | Desconectar | `fa-unlink` | - |

**Tipos de BD soportados:** MySQL, PostgreSQL, SQL Server, Oracle, MongoDB

---

### 4.10 Archivos y Carpetas
**Icono de categoria:** `fa-folder` | **ID:** `files`

#### Operaciones de Archivo

| Accion | Label | Icono | Parametros Clave |
|--------|-------|-------|-----------------|
| `file_read` | Leer Archivo | `fa-file-alt` | `filePath`, `encoding` (utf-8/latin1/ascii/utf-16), `variable` |
| `file_read_lines` | Leer Lineas | `fa-stream` | `filePath`, `variable` (array) |
| `file_write` | Escribir Archivo | `fa-file-edit` | `filePath`, `content`, `encoding`, `overwrite` |
| `file_append` | Agregar a Archivo | `fa-file-medical` | `filePath`, `content`, `encoding` |
| `file_copy` | Copiar Archivo | `fa-copy` | `source`, `destination`, `overwrite` |
| `file_move` | Mover Archivo | `fa-file-export` | `source`, `destination`, `overwrite` |
| `file_rename` | Renombrar Archivo | `fa-i-cursor` | `oldPath`, `newName` |
| `file_delete` | Eliminar Archivo | `fa-trash` | `filePath` |
| `file_exists` | Archivo Existe | `fa-question-circle` | `filePath`, `variable` |
| `file_info` | Info de Archivo | `fa-info-circle` | `filePath`, `variable` (size, modified, etc) |

#### Operaciones de Carpeta

| Accion | Label | Icono | Parametros Clave |
|--------|-------|-------|-----------------|
| `folder_create` | Crear Carpeta | `fa-folder-plus` | `folderPath` |
| `folder_delete` | Eliminar Carpeta | `fa-folder-minus` | `folderPath`, `recursive` |
| `folder_list` | Listar Archivos | `fa-list` | `folderPath`, `pattern`, `recursive`, `variable` |
| `folder_exists` | Carpeta Existe | `fa-folder-open` | `folderPath`, `variable` |

#### Compresion

| Accion | Label | Icono | Parametros Clave |
|--------|-------|-------|-----------------|
| `zip_compress` | Comprimir ZIP | `fa-file-archive` | `sourceFolder`, `zipPath` |
| `zip_extract` | Extraer ZIP | `fa-file-archive` | `zipPath`, `extractPath` |

---

### 4.11 Correo Electronico
**Icono de categoria:** `fa-envelope` | **ID:** `email`

| Accion | Label | Icono | Parametros Clave |
|--------|-------|-------|-----------------|
| `email_connect_smtp` | Conectar SMTP | `fa-server` | `server`, `port`, `username`, `password`, `useTLS`, `useSSL` |
| `email_connect_imap` | Conectar IMAP | `fa-inbox` | `server`, `port`, `username`, `password`, `useTLS`, `useSSL` |
| `email_send` | Enviar Email | `fa-paper-plane` | `to[]`, `cc[]`, `bcc[]`, `subject`, `body`, `isHtml`, `attachments[]` |
| `email_send_template` | Enviar con Plantilla | `fa-file-alt` | `to[]`, `template`, `variables`, `subject`, `attachments[]` |
| `email_read` | Leer Emails | `fa-envelope-open` | `folder`, `limit`, `variable` |
| `email_get_unread` | Obtener No Leidos | `fa-envelope` | `folder`, `variable` |
| `email_search` | Buscar Emails | `fa-search` | `folder`, `searchQuery`, `variable` |
| `email_download_attachment` | Descargar Adjunto | `fa-paperclip` | `emailId`, `attachmentIndex`, `savePath` |
| `email_mark_read` | Marcar como Leido | `fa-check` | `emailId` |
| `email_move` | Mover Email | `fa-folder` | `emailId`, `targetFolder` |
| `email_delete` | Eliminar Email | `fa-trash` | `emailId` |
| `email_disconnect` | Desconectar | `fa-unlink` | - |

---

### 4.12 Excel Avanzado (COM/OLE)
**Icono de categoria:** `fa-file-excel` | **ID:** `excel-advanced`

Manipulacion directa de Excel a traves de automatizacion COM/OLE (requiere Excel instalado).

#### Apertura y Cierre

| Accion | Label | Icono |
|--------|-------|-------|
| `excel_open` | Abrir Excel | `fa-file-excel` |
| `excel_create_workbook` | Crear Libro | `fa-file-medical` |
| `excel_save` | Guardar | `fa-save` |
| `excel_close` | Cerrar | `fa-times-circle` |

#### Celdas y Rangos

| Accion | Label | Icono |
|--------|-------|-------|
| `excel_get_cell` | Leer Celda | `fa-th-large` |
| `excel_set_cell` | Escribir Celda | `fa-pen` |
| `excel_get_range` | Leer Rango | `fa-table` |
| `excel_set_range` | Escribir Rango | `fa-edit` |
| `excel_set_cell_formula` | Establecer Formula | `fa-function` |

#### Filas y Columnas

| Accion | Label | Icono |
|--------|-------|-------|
| `excel_insert_row` | Insertar Fila | `fa-plus-circle` |
| `excel_delete_row` | Eliminar Fila | `fa-minus-circle` |
| `excel_insert_column` | Insertar Columna | `fa-columns` |
| `excel_delete_column` | Eliminar Columna | `fa-minus-square` |

#### Hojas

| Accion | Label | Icono |
|--------|-------|-------|
| `excel_create_sheet` | Crear Hoja | `fa-plus-square` |
| `excel_delete_sheet` | Eliminar Hoja | `fa-trash-alt` |
| `excel_switch_sheet` | Cambiar Hoja | `fa-exchange-alt` |
| `excel_get_sheet_names` | Obtener Hojas | `fa-list` |

#### Datos y Formato

| Accion | Label | Icono |
|--------|-------|-------|
| `excel_filter` | Aplicar Filtro | `fa-filter` |
| `excel_sort` | Ordenar Datos | `fa-sort-amount-down` |
| `excel_format_cells` | Formatear Celdas | `fa-paint-brush` |
| `excel_to_pdf` | Convertir a PDF | `fa-file-pdf` |

**Total en categoria:** 51 acciones

---

### 4.13 Excel Segundo Plano (Sin GUI)
**Icono de categoria:** `fa-file-excel` | **ID:** `excel-background`

Operaciones Excel sin abrir la aplicacion (basado en librerias como openpyxl/xlrd).

#### Apertura y Cierre

| Accion | Label | Icono |
|--------|-------|-------|
| `excel_bg_open` | Abrir (Sin GUI) | `fa-file-excel` |
| `excel_bg_create` | Crear Archivo | `fa-file-medical` |
| `excel_bg_save` | Guardar | `fa-save` |
| `excel_bg_close` | Cerrar | `fa-times-circle` |

#### Lectura y Escritura

| Accion | Label | Icono |
|--------|-------|-------|
| `excel_bg_read_cell` | Leer Celda | `fa-th-large` |
| `excel_bg_write_cell` | Escribir Celda | `fa-pen` |
| `excel_bg_read_range` | Leer Rango | `fa-table` |
| `excel_bg_write_range` | Escribir Rango | `fa-edit` |
| `excel_bg_get_last_row` | Ultima Fila | `fa-arrow-down` |
| `excel_bg_get_last_column` | Ultima Columna | `fa-arrow-right` |

#### Busqueda

| Accion | Label | Icono |
|--------|-------|-------|
| `excel_bg_find` | Buscar Valor | `fa-search` |
| `excel_bg_find_replace` | Buscar y Reemplazar | `fa-exchange-alt` |

#### Hojas

| Accion | Label | Icono |
|--------|-------|-------|
| `excel_bg_get_sheet_names` | Obtener Hojas | `fa-list` |
| `excel_bg_create_sheet` | Crear Hoja | `fa-plus-square` |
| `excel_bg_delete_sheet` | Eliminar Hoja | `fa-trash-alt` |

#### Formato y Celdas

| Accion | Label | Icono |
|--------|-------|-------|
| `excel_bg_set_formula` | Establecer Formula | `fa-function` |
| `excel_bg_merge_cells` | Combinar Celdas | `fa-object-group` |
| `excel_bg_unmerge_cells` | Separar Celdas | `fa-object-ungroup` |
| `excel_bg_set_cell_style` | Aplicar Estilo | `fa-paint-brush` |

#### Exportacion/Importacion

| Accion | Label | Icono |
|--------|-------|-------|
| `excel_bg_to_csv` | Exportar a CSV | `fa-file-csv` |
| `excel_bg_from_csv` | Importar de CSV | `fa-file-csv` |
| `excel_bg_to_json` | Exportar a JSON | `fa-file-code` |
| `excel_bg_from_json` | Importar de JSON | `fa-code` |

**Total en categoria:** 40+ acciones

---

### 4.14 PDF
**Icono de categoria:** `fa-file-pdf` | **ID:** `pdf`

| Accion | Label | Icono | Parametros Clave |
|--------|-------|-------|-----------------|
| `pdf_read` | Leer PDF | `fa-file-pdf` | `filePath`, `variable` |
| `pdf_create` | Crear PDF | `fa-file-medical` | `content`, `filePath` |
| `pdf_merge` | Unir PDFs | `fa-object-group` | `files[]`, `outputPath` |
| `pdf_split` | Dividir PDF | `fa-cut` | `filePath`, `pages`, `outputPath` |
| `pdf_extract_text` | Extraer Texto | `fa-file-alt` | `filePath`, `pages`, `variable` |
| `pdf_extract_tables` | Extraer Tablas | `fa-table` | `filePath`, `variable` |
| `pdf_extract_pages` | Extraer Paginas | `fa-copy` | `filePath`, `pages`, `outputPath` |
| `pdf_add_watermark` | Marca de Agua | `fa-tint` | `filePath`, `watermarkText`, `outputPath` |
| `pdf_add_password` | Proteger con Password | `fa-lock` | `filePath`, `password`, `outputPath` |
| `pdf_remove_password` | Quitar Password | `fa-unlock` | `filePath`, `password`, `outputPath` |
| `pdf_to_image` | PDF a Imagen | `fa-image` | `filePath`, `format`, `outputPath` |
| `pdf_rotate` | Rotar Paginas | `fa-sync` | `filePath`, `angle`, `pages`, `outputPath` |
| `pdf_fill_form` | Llenar Formulario | `fa-edit` | `filePath`, `fields`, `outputPath` |
| `pdf_get_metadata` | Obtener Metadata | `fa-info-circle` | `filePath`, `variable` |
| `pdf_add_signature` | Agregar Firma | `fa-signature` | `filePath`, `signatureImage`, `position`, `outputPath` |

---

### 4.15 Word
**Icono de categoria:** `fa-file-word` | **ID:** `word`

| Accion | Label | Icono | Parametros Clave |
|--------|-------|-------|-----------------|
| `word_open` | Abrir Word | `fa-file-word` | `filePath` |
| `word_new` | Nuevo Documento | `fa-file-medical` | `template` |
| `word_read_text` | Leer Texto | `fa-file-alt` | `variable` |
| `word_write_text` | Escribir Texto | `fa-pen` | `text`, `position` |
| `word_find_replace` | Buscar y Reemplazar | `fa-exchange-alt` | `find`, `replace`, `replaceAll` |
| `word_insert_image` | Insertar Imagen | `fa-image` | `imagePath`, `position`, `width`, `height` |
| `word_insert_table` | Insertar Tabla | `fa-table` | `rows`, `columns`, `data` |
| `word_format_text` | Formatear Texto | `fa-paint-brush` | `bold`, `italic`, `fontSize`, `fontColor` |
| `word_add_header_footer` | Encabezado/Pie | `fa-heading` | `headerText`, `footerText` |
| `word_save` | Guardar | `fa-save` | `filePath` |
| `word_close` | Cerrar | `fa-times-circle` | - |
| `word_to_pdf` | Convertir a PDF | `fa-file-pdf` | `outputPath` |

---

### 4.16 PowerPoint
**Icono de categoria:** `fa-file-powerpoint` | **ID:** `powerpoint`

| Accion | Label | Icono | Parametros Clave |
|--------|-------|-------|-----------------|
| `ppt_open` | Abrir PowerPoint | `fa-file-powerpoint` | `filePath` |
| `ppt_create` | Crear Presentacion | `fa-file-medical` | `template` |
| `ppt_add_slide` | Agregar Diapositiva | `fa-plus-square` | `layout`, `position` |
| `ppt_add_text` | Agregar Texto | `fa-font` | `slideIndex`, `text`, `position`, `fontSize` |
| `ppt_add_image` | Agregar Imagen | `fa-image` | `slideIndex`, `imagePath`, `position`, `size` |
| `ppt_add_chart` | Agregar Grafico | `fa-chart-bar` | `slideIndex`, `chartType`, `data` |
| `ppt_add_table` | Agregar Tabla | `fa-table` | `slideIndex`, `rows`, `columns`, `data` |
| `ppt_delete_slide` | Eliminar Diapositiva | `fa-trash` | `slideIndex` |
| `ppt_save` | Guardar | `fa-save` | `filePath` |
| `ppt_close` | Cerrar | `fa-times-circle` | - |

---

### 4.17 API y HTTP
**Icono de categoria:** `fa-globe-americas` | **ID:** `api`

| Accion | Label | Icono | Parametros Clave |
|--------|-------|-------|-----------------|
| `rest_get` | GET Request | `fa-arrow-down` | `url`, `headers` (JSON), `queryParams`, `authentication`, `variable` |
| `rest_post` | POST Request | `fa-arrow-up` | `url`, `headers`, `body`, `contentType`, `variable` |
| `rest_put` | PUT Request | `fa-edit` | `url`, `headers`, `body`, `variable` |
| `rest_delete` | DELETE Request | `fa-trash` | `url`, `headers`, `variable` |
| `http_get` | HTTP GET | `fa-download` | `url`, `timeout`, `variable` |
| `http_post` | HTTP POST | `fa-upload` | `url`, `contentType`, `body`, `variable` |
| `http_put` | HTTP PUT | `fa-refresh` | `url`, `body`, `variable` |
| `http_delete` | HTTP DELETE | `fa-remove` | `url`, `variable` |

---

### 4.18 SAP
**Icono de categoria:** `fa-industry` | **ID:** `sap`

| Accion | Label | Icono | Parametros Clave |
|--------|-------|-------|-----------------|
| `sap_connect` | Conectar SAP | `fa-plug` | `server`, `systemNumber`, `client`, `username`, `password` |
| `sap_transaction` | Ejecutar Transaccion | `fa-play` | `transactionCode`, `parameters` |
| `sap_get_data` | Obtener Datos | `fa-download` | `table`, `fields`, `filter`, `variable` |
| `sap_create_order` | Crear Orden | `fa-plus-circle` | `orderType`, `data` |
| `sap_disconnect` | Desconectar | `fa-unlink` | - |

---

### 4.19 Microsoft 365
**Icono de categoria:** `fa-microsoft` | **ID:** `m365`

| Accion | Label | Icono | Parametros Clave |
|--------|-------|-------|-----------------|
| `m365_calendar` | Calendario | `fa-calendar` | `action` (create/read/update/delete), `event` |
| `m365_excel` | Excel Online | `fa-file-excel` | `action`, `workbookId`, `range`, `data` |
| `m365_onedrive` | OneDrive | `fa-cloud` | `action` (upload/download/list/delete), `path`, `file` |
| `m365_outlook` | Outlook | `fa-envelope` | `action` (send/read/search), `to`, `subject`, `body` |

---

### 4.20 Twilio
**Icono de categoria:** `fa-phone` | **ID:** `twilio`

| Accion | Label | Icono | Parametros Clave |
|--------|-------|-------|-----------------|
| `twilio_connect` | Conectar Twilio | `fa-plug` | `accountSid`, `authToken` |
| `twilio_send_sms` | Enviar SMS | `fa-sms` | `from`, `to`, `body`, `variable` |
| `twilio_send_mms` | Enviar MMS | `fa-image` | `from`, `to`, `body`, `mediaUrl`, `variable` |
| `twilio_make_call` | Hacer Llamada | `fa-phone` | `from`, `to`, `twiml`, `variable` |
| `twilio_send_voice_message` | Mensaje de Voz | `fa-voicemail` | `from`, `to`, `message`, `voice`, `variable` |
| `twilio_send_whatsapp` | Enviar WhatsApp | `fa-whatsapp` | `from`, `to`, `body`, `mediaUrl`, `variable` |
| `twilio_video_room` | Sala de Video | `fa-video` | `roomName`, `type`, `variable` |
| `twilio_verify_send` | Enviar Verificacion | `fa-shield-alt` | `to`, `channel` (sms/call/email), `variable` |
| `twilio_verify_check` | Verificar Codigo | `fa-check-circle` | `to`, `code`, `variable` |
| `twilio_lookup` | Lookup Numero | `fa-search` | `phoneNumber`, `type`, `variable` |

---

### 4.21 WhatsApp
**Icono de categoria:** `fa-whatsapp` | **ID:** `whatsapp`

| Accion | Label | Icono | Parametros Clave |
|--------|-------|-------|-----------------|
| `wa_connect` | Conectar WhatsApp | `fa-plug` | `provider` (meta/twilio/360dialog), `apiKey`, `phoneNumberId` |
| `wa_send_message` | Enviar Mensaje | `fa-paper-plane` | `to`, `message`, `variable` |
| `wa_send_template` | Enviar Plantilla | `fa-file-alt` | `to`, `templateName`, `templateParams`, `language`, `variable` |
| `wa_send_media` | Enviar Media | `fa-image` | `to`, `mediaType` (image/video/audio/document), `mediaUrl`, `caption`, `variable` |
| `wa_send_buttons` | Enviar Botones | `fa-hand-pointer` | `to`, `bodyText`, `buttons[]`, `variable` |
| `wa_send_list` | Enviar Lista | `fa-list` | `to`, `bodyText`, `buttonText`, `sections[]`, `variable` |
| `wa_send_location` | Enviar Ubicacion | `fa-map-marker-alt` | `to`, `latitude`, `longitude`, `name`, `address` |
| `wa_send_contact` | Enviar Contacto | `fa-address-card` | `to`, `contactName`, `contactPhone` |
| `wa_read_messages` | Leer Mensajes | `fa-envelope-open` | `limit`, `variable` |
| `wa_mark_read` | Marcar Leido | `fa-check-double` | `messageId` |

---

### 4.22 Telegram
**Icono de categoria:** `fa-telegram` | **ID:** `telegram`

| Accion | Label | Icono | Parametros Clave |
|--------|-------|-------|-----------------|
| `tg_send_message` | Enviar Mensaje | `fa-paper-plane` | `chatId`, `text`, `parseMode` (HTML/Markdown), `variable` |
| `tg_send_photo` | Enviar Foto | `fa-image` | `chatId`, `photo`, `caption`, `variable` |
| `tg_send_document` | Enviar Documento | `fa-file` | `chatId`, `document`, `caption`, `variable` |
| `tg_send_video` | Enviar Video | `fa-video` | `chatId`, `video`, `caption` |
| `tg_send_audio` | Enviar Audio | `fa-music` | `chatId`, `audio`, `caption` |
| `tg_send_voice` | Enviar Nota de Voz | `fa-microphone` | `chatId`, `voice` |
| `tg_send_location` | Enviar Ubicacion | `fa-map-marker-alt` | `chatId`, `latitude`, `longitude` |
| `tg_send_poll` | Enviar Encuesta | `fa-poll` | `chatId`, `question`, `options[]`, `isAnonymous` |
| `tg_get_updates` | Obtener Updates | `fa-download` | `offset`, `limit`, `variable` |
| `tg_get_chat` | Info del Chat | `fa-info-circle` | `chatId`, `variable` |
| `tg_get_member` | Info del Miembro | `fa-user` | `chatId`, `userId`, `variable` |
| `tg_edit_message` | Editar Mensaje | `fa-edit` | `chatId`, `messageId`, `text` |
| `tg_delete_message` | Eliminar Mensaje | `fa-trash` | `chatId`, `messageId` |
| `tg_answer_callback` | Responder Callback | `fa-reply` | `callbackQueryId`, `text`, `showAlert` |

---

### 4.23 Slack
**Icono de categoria:** `fa-slack` | **ID:** `slack`

| Accion | Label | Icono | Parametros Clave |
|--------|-------|-------|-----------------|
| `slack_connect` | Conectar Slack | `fa-plug` | `botToken`, `signingSecret` |
| `slack_send_message` | Enviar Mensaje | `fa-paper-plane` | `channel`, `text`, `variable` |
| `slack_send_blocks` | Enviar Bloques | `fa-th-large` | `channel`, `blocks` (JSON), `variable` |
| `slack_read_messages` | Leer Mensajes | `fa-envelope-open` | `channel`, `limit`, `variable` |
| `slack_upload_file` | Subir Archivo | `fa-upload` | `channel`, `filePath`, `title` |
| `slack_create_channel` | Crear Canal | `fa-plus` | `name`, `isPrivate`, `variable` |
| `slack_get_users` | Obtener Usuarios | `fa-users` | `variable` |
| `slack_react` | Reaccionar | `fa-smile` | `channel`, `timestamp`, `emoji` |
| `slack_set_status` | Establecer Estado | `fa-circle` | `statusText`, `statusEmoji`, `expiration` |

---

### 4.24 Microsoft Teams
**Icono de categoria:** `fa-users` | **ID:** `teams`

| Accion | Label | Icono | Parametros Clave |
|--------|-------|-------|-----------------|
| `teams_connect` | Conectar Teams | `fa-plug` | `tenantId`, `clientId`, `clientSecret` |
| `teams_send_message` | Enviar Mensaje | `fa-paper-plane` | `teamId`, `channelId`, `message` |
| `teams_send_card` | Enviar Card | `fa-id-card` | `teamId`, `channelId`, `card` (Adaptive Card JSON) |

---

### 4.25 PayPal
**Icono de categoria:** `fa-paypal` | **ID:** `paypal`

| Accion | Label | Icono | Parametros Clave |
|--------|-------|-------|-----------------|
| `paypal_connect` | Conectar PayPal | `fa-plug` | `clientId`, `clientSecret`, `sandbox` |
| `paypal_create_order` | Crear Orden | `fa-shopping-cart` | `amount`, `currency`, `description`, `variable` |
| `paypal_capture_payment` | Capturar Pago | `fa-credit-card` | `orderId`, `variable` |
| `paypal_refund` | Reembolso | `fa-undo` | `captureId`, `amount`, `variable` |
| `paypal_create_payout` | Crear Pago | `fa-money-bill` | `recipients[]`, `amount`, `currency`, `variable` |
| `paypal_create_subscription` | Crear Suscripcion | `fa-sync` | `planId`, `subscriberEmail`, `variable` |
| `paypal_create_invoice` | Crear Factura | `fa-file-invoice-dollar` | `invoiceData`, `variable` |
| `paypal_get_transactions` | Obtener Transacciones | `fa-list` | `startDate`, `endDate`, `variable` |

---

### 4.26 Stripe
**Icono de categoria:** `fa-stripe` | **ID:** `stripe`

| Accion | Label | Icono | Parametros Clave |
|--------|-------|-------|-----------------|
| `stripe_connect` | Conectar Stripe | `fa-plug` | `secretKey`, `testMode` |
| `stripe_create_payment` | Crear Pago | `fa-credit-card` | `amount`, `currency`, `paymentMethod`, `variable` |
| `stripe_create_customer` | Crear Cliente | `fa-user-plus` | `email`, `name`, `phone`, `variable` |
| `stripe_get_customer` | Obtener Cliente | `fa-user` | `customerId`, `variable` |
| `stripe_create_subscription` | Crear Suscripcion | `fa-sync` | `customerId`, `priceId`, `variable` |
| `stripe_cancel_subscription` | Cancelar Suscripcion | `fa-times` | `subscriptionId` |
| `stripe_create_invoice` | Crear Factura | `fa-file-invoice` | `customerId`, `items[]`, `variable` |
| `stripe_refund` | Reembolso | `fa-undo` | `chargeId`, `amount`, `variable` |
| `stripe_list_charges` | Listar Cargos | `fa-list` | `customerId`, `limit`, `variable` |
| `stripe_create_product` | Crear Producto | `fa-box` | `name`, `description`, `price`, `variable` |
| `stripe_create_checkout` | Crear Checkout | `fa-shopping-cart` | `lineItems[]`, `successUrl`, `cancelUrl`, `variable` |
| `stripe_get_balance` | Obtener Balance | `fa-wallet` | `variable` |

---

### 4.27 Shopify
**Icono de categoria:** `fa-shopping-bag` | **ID:** `shopify`

| Accion | Label | Icono | Parametros Clave |
|--------|-------|-------|-----------------|
| `shopify_connect` | Conectar Shopify | `fa-plug` | `shopDomain`, `accessToken` |
| `shopify_create_product` | Crear Producto | `fa-plus-circle` | `title`, `description`, `price`, `images`, `variable` |
| `shopify_update_product` | Actualizar Producto | `fa-edit` | `productId`, `updates`, `variable` |
| `shopify_get_products` | Obtener Productos | `fa-list` | `limit`, `collection`, `variable` |
| `shopify_get_orders` | Obtener Pedidos | `fa-shopping-cart` | `status`, `limit`, `variable` |
| `shopify_fulfill_order` | Cumplir Pedido | `fa-truck` | `orderId`, `trackingNumber`, `trackingCompany` |
| `shopify_update_inventory` | Actualizar Inventario | `fa-warehouse` | `inventoryItemId`, `quantity` |
| `shopify_create_customer` | Crear Cliente | `fa-user-plus` | `email`, `firstName`, `lastName`, `variable` |
| `shopify_create_discount` | Crear Descuento | `fa-tag` | `code`, `type`, `value`, `variable` |
| `shopify_refund_order` | Reembolsar Pedido | `fa-undo` | `orderId`, `amount`, `variable` |
| `shopify_get_analytics` | Obtener Analytics | `fa-chart-line` | `metric`, `dateRange`, `variable` |

---

### 4.28 WooCommerce
**Icono de categoria:** `fa-wordpress` | **ID:** `woocommerce`

| Accion | Label | Icono | Parametros Clave |
|--------|-------|-------|-----------------|
| `woo_connect` | Conectar WooCommerce | `fa-plug` | `siteUrl`, `consumerKey`, `consumerSecret` |
| `woo_create_product` | Crear Producto | `fa-plus-circle` | `name`, `type`, `price`, `description`, `variable` |
| `woo_update_product` | Actualizar Producto | `fa-edit` | `productId`, `updates`, `variable` |
| `woo_get_products` | Obtener Productos | `fa-list` | `category`, `limit`, `variable` |
| `woo_get_orders` | Obtener Pedidos | `fa-shopping-cart` | `status`, `limit`, `variable` |
| `woo_update_order` | Actualizar Pedido | `fa-edit` | `orderId`, `status`, `variable` |
| `woo_create_coupon` | Crear Cupon | `fa-tag` | `code`, `discountType`, `amount`, `variable` |
| `woo_update_inventory` | Actualizar Inventario | `fa-warehouse` | `productId`, `stockQuantity` |
| `woo_create_customer` | Crear Cliente | `fa-user-plus` | `email`, `firstName`, `lastName`, `variable` |
| `woo_get_reports` | Obtener Reportes | `fa-chart-bar` | `reportType`, `dateRange`, `variable` |

---

### 4.29 Amazon SP-API
**Icono de categoria:** `fa-amazon` | **ID:** `amazon`

| Accion | Label | Icono | Parametros Clave |
|--------|-------|-------|-----------------|
| `amz_connect` | Conectar Amazon | `fa-plug` | `sellerId`, `mwsAuthToken`, `region` |
| `amz_get_orders` | Obtener Pedidos | `fa-shopping-cart` | `createdAfter`, `orderStatuses[]`, `variable` |
| `amz_get_order_items` | Items del Pedido | `fa-list` | `orderId`, `variable` |
| `amz_create_listing` | Crear Listado | `fa-plus-circle` | `asin`, `sku`, `price`, `quantity`, `condition` |
| `amz_update_inventory` | Actualizar Inventario | `fa-warehouse` | `sku`, `quantity` |
| `amz_get_pricing` | Obtener Precios | `fa-dollar-sign` | `asins[]`, `variable` |
| `amz_request_report` | Solicitar Reporte | `fa-file-alt` | `reportType`, `dataRange`, `variable` |
| `amz_get_catalog` | Obtener Catalogo | `fa-book` | `keywords`, `variable` |
| `amz_get_financials` | Obtener Finanzas | `fa-chart-line` | `dateRange`, `variable` |

---

### 4.30 Mercado Libre
**Icono de categoria:** `fa-shopping-bag` | **ID:** `mercadolibre`

| Accion | Label | Icono | Parametros Clave |
|--------|-------|-------|-----------------|
| `meli_connect` | Conectar Mercado Libre | `fa-plug` | `clientId`, `clientSecret`, `accessToken` |
| `meli_create_listing` | Crear Publicacion | `fa-plus-circle` | `title`, `categoryId`, `price`, `quantity`, `description`, `images`, `variable` |
| `meli_update_listing` | Actualizar Publicacion | `fa-edit` | `itemId`, `updates`, `variable` |
| `meli_get_orders` | Obtener Ventas | `fa-shopping-cart` | `status`, `dateRange`, `variable` |
| `meli_update_order` | Actualizar Venta | `fa-edit` | `orderId`, `status` |
| `meli_get_questions` | Obtener Preguntas | `fa-question-circle` | `itemId`, `variable` |
| `meli_answer_question` | Responder Pregunta | `fa-reply` | `questionId`, `answer` |
| `meli_update_stock` | Actualizar Stock | `fa-warehouse` | `itemId`, `quantity` |
| `meli_get_categories` | Obtener Categorias | `fa-sitemap` | `siteId`, `variable` |

---

### 4.31 HubSpot
**Icono de categoria:** `fa-hubspot` | **ID:** `hubspot`

| Accion | Label | Icono | Parametros Clave |
|--------|-------|-------|-----------------|
| `hs_connect` | Conectar HubSpot | `fa-plug` | `apiKey` |
| `hs_create_contact` | Crear Contacto | `fa-user-plus` | `email`, `firstName`, `lastName`, `properties`, `variable` |
| `hs_create_deal` | Crear Deal | `fa-handshake` | `dealName`, `stage`, `amount`, `pipeline`, `variable` |

---

### 4.32 Zoho CRM
**Icono de categoria:** `fa-address-book` | **ID:** `zoho-crm`

| Accion | Label | Icono | Parametros Clave |
|--------|-------|-------|-----------------|
| `zoho_crm_connect` | Conectar Zoho CRM | `fa-plug` | `clientId`, `clientSecret`, `refreshToken` |
| `zoho_crm_create_record` | Crear Registro | `fa-plus-circle` | `module`, `data`, `variable` |
| `zoho_crm_update_record` | Actualizar Registro | `fa-edit` | `module`, `recordId`, `data`, `variable` |
| `zoho_crm_get_record` | Obtener Registro | `fa-search` | `module`, `recordId`, `variable` |
| `zoho_crm_search` | Buscar Registros | `fa-search` | `module`, `criteria`, `variable` |
| `zoho_crm_delete_record` | Eliminar Registro | `fa-trash` | `module`, `recordId` |
| `zoho_crm_create_lead` | Crear Lead | `fa-user-plus` | `firstName`, `lastName`, `email`, `company`, `variable` |
| `zoho_crm_convert_lead` | Convertir Lead | `fa-exchange-alt` | `leadId`, `variable` |
| `zoho_crm_create_deal` | Crear Deal | `fa-handshake` | `dealName`, `stage`, `amount`, `variable` |
| `zoho_crm_add_note` | Agregar Nota | `fa-sticky-note` | `module`, `recordId`, `noteTitle`, `noteContent` |
| `zoho_crm_create_task` | Crear Tarea | `fa-tasks` | `subject`, `dueDate`, `priority`, `assignedTo` |
| `zoho_crm_send_email` | Enviar Email | `fa-envelope` | `to`, `subject`, `body`, `fromAddress` |

---

### 4.33 Zoho Desk
**Icono de categoria:** `fa-headset` | **ID:** `zoho-desk`

| Accion | Label | Icono | Parametros Clave |
|--------|-------|-------|-----------------|
| `zoho_desk_connect` | Conectar Zoho Desk | `fa-plug` | `orgId`, `clientId`, `clientSecret` |
| `zoho_desk_create_ticket` | Crear Ticket | `fa-plus-circle` | `subject`, `description`, `departmentId`, `contactId`, `priority`, `variable` |
| `zoho_desk_update_ticket` | Actualizar Ticket | `fa-edit` | `ticketId`, `updates`, `variable` |
| `zoho_desk_get_ticket` | Obtener Ticket | `fa-search` | `ticketId`, `variable` |
| `zoho_desk_search` | Buscar Tickets | `fa-search` | `query`, `variable` |
| `zoho_desk_assign` | Asignar Ticket | `fa-user-check` | `ticketId`, `agentId` |
| `zoho_desk_add_comment` | Agregar Comentario | `fa-comment` | `ticketId`, `content`, `isPublic` |
| `zoho_desk_change_status` | Cambiar Estado | `fa-exchange-alt` | `ticketId`, `status` |
| `zoho_desk_add_attachment` | Agregar Adjunto | `fa-paperclip` | `ticketId`, `filePath` |

---

### 4.34 Zoho Books
**Icono de categoria:** `fa-book` | **ID:** `zoho-books`

| Accion | Label | Icono | Parametros Clave |
|--------|-------|-------|-----------------|
| `zoho_books_connect` | Conectar Zoho Books | `fa-plug` | `orgId`, `clientId`, `clientSecret` |
| `zoho_books_create_invoice` | Crear Factura | `fa-file-invoice-dollar` | `customerId`, `lineItems[]`, `variable` |
| `zoho_books_create_estimate` | Crear Estimado | `fa-file-alt` | `customerId`, `lineItems[]`, `variable` |
| `zoho_books_create_contact` | Crear Contacto | `fa-user-plus` | `contactName`, `email`, `contactType`, `variable` |
| `zoho_books_record_payment` | Registrar Pago | `fa-money-bill` | `invoiceId`, `amount`, `paymentMode`, `variable` |
| `zoho_books_create_expense` | Crear Gasto | `fa-receipt` | `accountId`, `amount`, `description`, `variable` |
| `zoho_books_create_bill` | Crear Factura Proveedor | `fa-file-invoice` | `vendorId`, `lineItems[]`, `variable` |
| `zoho_books_get_reports` | Obtener Reportes | `fa-chart-bar` | `reportType`, `dateRange`, `variable` |

---

### 4.35 Pipedrive
**Icono de categoria:** `fa-funnel-dollar` | **ID:** `pipedrive`

| Accion | Label | Icono | Parametros Clave |
|--------|-------|-------|-----------------|
| `pipedrive_connect` | Conectar Pipedrive | `fa-plug` | `apiToken`, `companyDomain` |
| `pipedrive_create_deal` | Crear Deal | `fa-handshake` | `title`, `value`, `currency`, `personId`, `orgId`, `variable` |
| `pipedrive_update_deal` | Actualizar Deal | `fa-edit` | `dealId`, `updates`, `variable` |
| `pipedrive_move_stage` | Mover Etapa | `fa-exchange-alt` | `dealId`, `stageId` |
| `pipedrive_create_person` | Crear Persona | `fa-user-plus` | `name`, `email`, `phone`, `variable` |
| `pipedrive_create_org` | Crear Organizacion | `fa-building` | `name`, `address`, `variable` |
| `pipedrive_add_activity` | Agregar Actividad | `fa-calendar-check` | `type`, `subject`, `dueDate`, `dealId` |
| `pipedrive_add_note` | Agregar Nota | `fa-sticky-note` | `content`, `dealId`, `personId` |
| `pipedrive_search` | Buscar | `fa-search` | `term`, `itemType`, `variable` |
| `pipedrive_get_pipeline` | Obtener Pipeline | `fa-stream` | `pipelineId`, `variable` |

---

### 4.36 CAPTCHA
**Icono de categoria:** `fa-shield-alt` | **ID:** `captcha`

| Accion | Label | Icono | Parametros Clave |
|--------|-------|-------|-----------------|
| `captcha_solve_image` | Resolver Captcha Imagen | `fa-image` | `provider` (2captcha/anticaptcha/capsolver), `apiKey`, `imageSource`, `imagePath`, `variable` |
| `captcha_solve_recaptcha` | Resolver reCAPTCHA | `fa-shield-alt` | `provider`, `apiKey`, `siteKey`, `pageUrl`, `version` (v2/v3), `variable` |
| `captcha_solve_hcaptcha` | Resolver hCaptcha | `fa-robot` | `provider`, `apiKey`, `siteKey`, `pageUrl`, `variable` |

---

### 4.37 Escritorio y Mouse/Teclado
**Icono de categoria:** `fa-desktop` | **ID:** `desktop`

| Accion | Label | Icono | Parametros Clave |
|--------|-------|-------|-----------------|
| `mouse_click` | Click de Mouse | `fa-mouse-pointer` | `x`, `y`, `button` (left/right/middle), `clickType` |
| `mouse_move` | Mover Mouse | `fa-arrows-alt` | `x`, `y`, `duration` |
| `keyboard_type` | Escribir Teclado | `fa-keyboard` | `text`, `delay` |
| `keyboard_hotkey` | Atajo de Teclado | `fa-keyboard` | `keys` (ej: ctrl+c) |
| `key_press` | Presionar Tecla | `fa-keyboard` | `key`, `modifiers[]` |
| `hotkey` | Combinacion Teclas | `fa-keyboard` | `keys[]` |
| `ocr_screen` | OCR de Pantalla | `fa-eye` | `region`, `language`, `variable` |
| `ocr_image` | OCR de Imagen | `fa-file-image` | `imagePath`, `language`, `variable` |
| `find_image_on_screen` | Buscar Imagen | `fa-search` | `imagePath`, `confidence`, `region`, `variable` |

#### Ventanas

| Accion | Label | Icono | Parametros Clave |
|--------|-------|-------|-----------------|
| `window_focus` | Enfocar Ventana | `fa-window-restore` | `windowTitle` |
| `window_minimize` | Minimizar | `fa-window-minimize` | `windowTitle` |
| `window_maximize` | Maximizar | `fa-window-maximize` | `windowTitle` |
| `window_close` | Cerrar Ventana | `fa-times` | `windowTitle` |
| `window_move` | Mover Ventana | `fa-arrows-alt` | `windowTitle`, `x`, `y` |
| `window_get_bounds` | Obtener Posicion | `fa-ruler-combined` | `windowTitle`, `variable` |
| `window_screenshot` | Captura Ventana | `fa-camera` | `windowTitle`, `path`, `variable` |

---

### 4.38 Procesos y Sistema
**Icono de categoria:** `fa-cogs` | **ID:** `system`

| Accion | Label | Icono | Parametros Clave |
|--------|-------|-------|-----------------|
| `run_application` | Ejecutar Aplicacion | `fa-play` | `path`, `arguments`, `workingDirectory`, `waitForExit` |
| `kill_process` | Terminar Proceso | `fa-skull` | `processName`, `pid` |
| `get_environment_variable` | Obtener Variable Entorno | `fa-cog` | `name`, `variable` |
| `set_environment_variable` | Establecer Variable Entorno | `fa-cog` | `name`, `value` |
| `process_start` | Iniciar Proceso | `fa-play-circle` | `command`, `arguments`, `variable` |
| `process_kill` | Matar Proceso | `fa-stop-circle` | `pid` |
| `run_command` | Ejecutar Comando | `fa-terminal` | `command`, `variable` |
| `run_powershell` | Ejecutar PowerShell | `fa-terminal` | `script`, `variable` |

---

### 4.39 Herramientas de Desarrollo
**Icono de categoria:** `fa-code` | **ID:** `devtools`

#### GitHub

| Accion | Label | Icono | Parametros Clave |
|--------|-------|-------|-----------------|
| `github_connect` | Conectar GitHub | `fa-github` | `token` |
| `github_create_issue` | Crear Issue | `fa-exclamation-circle` | `repo`, `title`, `body`, `labels`, `variable` |
| `github_update_issue` | Actualizar Issue | `fa-edit` | `repo`, `issueNumber`, `updates` |

#### GitLab

| Accion | Label | Icono | Parametros Clave |
|--------|-------|-------|-----------------|
| `gitlab_connect` | Conectar GitLab | `fa-gitlab` | `token`, `url` |

#### Jenkins

| Accion | Label | Icono | Parametros Clave |
|--------|-------|-------|-----------------|
| `jenkins_connect` | Conectar Jenkins | `fa-plug` | `url`, `username`, `apiToken` |
| `jenkins_trigger_build` | Ejecutar Build | `fa-play` | `jobName`, `parameters`, `variable` |

#### Docker

| Accion | Label | Icono | Parametros Clave |
|--------|-------|-------|-----------------|
| `docker_connect` | Conectar Docker | `fa-docker` | `host`, `port` |
| `docker_run` | Ejecutar Container | `fa-play` | `image`, `command`, `ports`, `volumes`, `variable` |
| `docker_build` | Build Imagen | `fa-hammer` | `dockerfile`, `tag`, `variable` |

---

### 4.40 Web Scraping
**Icono de categoria:** `fa-spider` | **ID:** `scraping`

| Accion | Label | Icono | Parametros Clave |
|--------|-------|-------|-----------------|
| `scraper_connect` | Conectar Scraper | `fa-plug` | `provider` (scrapingbee/browserless/custom), `apiKey` |
| `scraper_fetch_url` | Fetch URL | `fa-download` | `url`, `waitForSelector`, `variable` |
| `scraper_render_js` | Render JavaScript | `fa-code` | `url`, `waitTime`, `variable` |
| `scraper_extract_data` | Extraer Datos | `fa-filter` | `url`, `selectors`, `variable` |
| `scraper_screenshot` | Captura Web | `fa-camera` | `url`, `fullPage`, `path`, `variable` |
| `scraper_batch` | Scraping Masivo | `fa-layer-group` | `urls[]`, `selectors`, `concurrency`, `variable` |

---

### 4.41 Firma Digital y Documentos
**Icono de categoria:** `fa-signature` | **ID:** `document-signing`

#### DocuSign

| Accion | Label | Icono | Parametros Clave |
|--------|-------|-------|-----------------|
| `docusign_connect` | Conectar DocuSign | `fa-plug` | `integrationKey`, `userId`, `accountId` |
| `docusign_send_envelope` | Enviar Sobre | `fa-paper-plane` | `templateId`, `signers[]`, `variable` |
| `docusign_get_status` | Obtener Estado | `fa-info-circle` | `envelopeId`, `variable` |
| `docusign_download` | Descargar Documento | `fa-download` | `envelopeId`, `savePath` |

#### Notion

| Accion | Label | Icono | Parametros Clave |
|--------|-------|-------|-----------------|
| `notion_connect` | Conectar Notion | `fa-plug` | `apiKey` |
| `notion_create_page` | Crear Pagina | `fa-file-medical` | `parentId`, `title`, `content`, `variable` |

#### Airtable

| Accion | Label | Icono | Parametros Clave |
|--------|-------|-------|-----------------|
| `airtable_connect` | Conectar Airtable | `fa-plug` | `apiKey`, `baseId` |
| `airtable_list_records` | Listar Registros | `fa-list` | `tableName`, `view`, `variable` |

---

### 4.42 Bases de Datos Cloud
**Icono de categoria:** `fa-cloud` | **ID:** `cloud-db`

| Accion | Label | Icono | Parametros Clave |
|--------|-------|-------|-----------------|
| `firebase_connect` | Conectar Firebase | `fa-fire` | `projectId`, `serviceAccount` |
| `supabase_connect` | Conectar Supabase | `fa-bolt` | `url`, `anonKey` |
| `mongo_connect` | Conectar MongoDB Atlas | `fa-database` | `connectionString` |

---

### 4.43 Traduccion
**Icono de categoria:** `fa-language` | **ID:** `translation`

| Accion | Label | Icono | Parametros Clave |
|--------|-------|-------|-----------------|
| `deepl_connect` | Conectar DeepL | `fa-plug` | `apiKey`, `freeApi` |
| `deepl_translate` | Traducir Texto | `fa-language` | `text`, `sourceLang`, `targetLang`, `formality`, `variable` |
| `deepl_translate_doc` | Traducir Documento | `fa-file-alt` | `filePath`, `sourceLang`, `targetLang`, `outputPath`, `variable` |

---

### 4.44 Analytics
**Icono de categoria:** `fa-chart-line` | **ID:** `analytics`

| Accion | Label | Icono | Parametros Clave |
|--------|-------|-------|-----------------|
| `ga_connect` | Conectar Google Analytics | `fa-plug` | `propertyId`, `serviceAccount` |
| `ga_run_report` | Ejecutar Reporte | `fa-chart-bar` | `dimensions[]`, `metrics[]`, `dateRange`, `variable` |
| `ga_realtime` | Datos en Tiempo Real | `fa-clock` | `metrics[]`, `variable` |
| `ga_get_metrics` | Obtener Metricas | `fa-tachometer-alt` | `metricNames[]`, `dateRange`, `variable` |

---

## 5. Componentes Personalizados

El sistema soporta la creacion dinamica de componentes custom en tiempo de ejecucion:

### Creacion

```javascript
createCustomComponent(label, description, params)
// Crea un componente personalizado con icono auto-sugerido
```

### Registro

```javascript
addCustomComponent(component)
// Registra el componente en el sistema
// Se almacena en localStorage y base de datos
```

### Eliminacion

```javascript
removeCustomComponent(actionId)
// Elimina un componente personalizado
```

### Deteccion de Icono

```javascript
suggestIconForAction(actionLabel)
// Sugiere un icono Font Awesome basado en el nombre de la accion
// Usa heuristicas: "email" -> fa-envelope, "click" -> fa-mouse-pointer, etc.
```

### Verificacion

```javascript
actionExists(actionId)
// Verifica si una accion ya existe en el sistema
// Evita duplicados al importar workflows
```

### Categoria

Los componentes personalizados aparecen en la categoria **"Personalizados"** del sidebar del editor de workflows.

---

## 6. Estadisticas del Sistema

| Metrica | Valor |
|---------|-------|
| **Total de acciones unicas definidas** | 700+ |
| **Acciones categorizadas** | 450+ |
| **Categorias predefinidas** | 25+ |
| **Tipos de contenedor** | 9 |
| **Tipos de campo de parametros** | 20+ |
| **Integraciones API** | 50+ |
| **Formatos de archivo soportados** | XLSX, CSV, JSON, PDF, DOCX, PPTX, TXT, XML, ZIP |
| **Tipos de base de datos** | MySQL, PostgreSQL, SQL Server, Oracle, MongoDB |
| **Navegadores soportados** | Chrome, Edge, Firefox, Brave |
| **Proveedores de IA** | OpenAI, Google, Azure, AWS, Claude, Ollama |
| **Plataformas de eCommerce** | Shopify, WooCommerce, Amazon, Mercado Libre |
| **Plataformas de CRM** | HubSpot, Zoho, Pipedrive, Salesforce |
| **Servicios de mensajeria** | WhatsApp, Telegram, Slack, Teams, Twilio |
| **Proveedores de CAPTCHA** | 2captcha, AntiCaptcha, CapSolver |
