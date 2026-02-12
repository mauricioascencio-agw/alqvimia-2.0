/**
 * ALQVIMIA RPA 2.0 - Sistema de Migración de Workflows
 *
 * Este módulo contiene los parsers y conversores para migrar workflows
 * entre diferentes plataformas RPA.
 */

// ==========================================
// IMPORTADORES (De otras plataformas a Alqvimia)
// ==========================================

// ==========================================
// UIPATH XAML - PARSER COMPLETO CON DOMPARSER
// ==========================================

// Elementos terminales que NO son actividades y NO contienen actividades hijas
// Para estos: skip y NO recorrer hijos
const SKIP_TERMINAL = new Set([
  'variable', 'variable.default', 'textexpression', 'literal', 'literalexpression',
  'x:members', 'x:property', 'x:reference', 'inargument', 'outargument',
  'inoutargument', 'visualbasicvalue', 'visualbasicreference', 'visiblevalue',
  'delegateargument', 'delegateinargument', 'delegateoutargument',
  'members', 'property', 'argument',
  // Tipos de datos .NET
  'string', 'boolean', 'int32', 'int64', 'double', 'decimal', 'float', 'byte',
  'char', 'object', 'datetime', 'timespan', 'guid', 'uri', 'type', 'null',
  'array', 'list', 'dictionary', 'collection', 'hashset', 'queue', 'stack',
  'keyvaluepair', 'tuple', 'datatable', 'datarow', 'datacolumn', 'dataset',
  'bindinglist', 'observablecollection', 'sortedlist', 'sorteddictionary',
  'aborttransactionexception', 'exception', 'argumentexception',
  // Referencias de ensamblaje
  'assemblyreference', 'assembly', 'reference',
  // Propiedades internas de actividades modernas UiPath
  'targetapp', 'target', 'unifiedtarget', 'targetanchor', 'clippingregion',
  'fuzzyselector', 'strictselector', 'nativeselector', 'selector',
  'inputmethod', 'outputmethod', 'continueonerror',
  // Contenedores de layout / ViewState
  'activitydesigner.icon', 'sap2010:workflowviewstate', 'sap2010:viewstatemanager',
  'sap:workflowviewstateservice.viewstate', 'sap:viewstatebyelement',
  'viewstatedata', 'viewstatemanager',
])

// Elementos wrapper que NO son actividades pero SÍ contienen actividades hijas
// Para estos: NO crear paso pero SÍ recorrer hijos
const SKIP_BUT_RECURSE = new Set([
  'activityaction', 'activity.implementation',
  'catch', 'catch.action',
  // Propiedades de actividades que contienen sub-actividades
  'flowstep.action', 'flowdecision.true', 'flowdecision.false', 'flowdecision.condition',
  'flowswitch.default', 'sequence.variables', 'if.then', 'if.else', 'if.condition',
  'trycatch.try', 'trycatch.catches', 'trycatch.finally',
  'foreach.body', 'while.body', 'while.condition', 'dowhile.body', 'dowhile.condition',
  'parallel.branches', 'switch.default', 'switch.cases',
])

// Detecta si un nombre de elemento es un tipo de dato .NET y no una actividad real
function isDataTypeOrNonActivity(localName) {
  const n = localName.toLowerCase()
  // Tipos genericos con parentesis: List<String>, Dictionary<String,Object>, etc.
  if (/^(list|dictionary|collection|array|hashset|queue|stack|sortedlist|keyvaluepair|tuple|nullable|func|action|predicate|ienumerable|ilist|icollection)$/i.test(localName)) return true
  // Tipos primitivos de .NET
  if (/^(string|boolean|bool|int|int16|int32|int64|uint|uint16|uint32|uint64|double|float|single|decimal|byte|sbyte|char|object|void|datetime|timespan|guid|uri|type|null|enum)$/i.test(localName)) return true
  // Assembly references
  if (/assemblyreference|assembly\b|reference\b/i.test(n)) return true
  // Bindinglist, BindingSources, etc.
  if (/^binding/i.test(localName)) return true
  // Target elements que son propiedades de actividades modernas
  if (/^target/i.test(localName) && !/^targetapplication/i.test(localName)) return true
  // DataTable types
  if (/^data(table|row|column|set|view|reader)$/i.test(localName)) return true
  return false
}

// Categorias para clasificar actividades detectadas
function categorizeActivity(name) {
  const n = name.toLowerCase()
  if (/browser|navigate|click|type.?into|get.?text|get.?attribute|open.?browser|attach.?browser|close.?tab|go.?back|go.?forward|hover|check|uncheck|select.?item|send.?hotkey|element.?exists|wait.?element|screenshot|highlight|inject|extract|data.?scraping|application.?card|use.?application|attach.?window|open.?application|close.?application|keyboard.?shortcut|set.?text|get.?url|go.?home|refresh|back|forward/.test(n)) return 'Web/Browser'
  if (/excel|workbook|read.?range|write.?range|read.?cell|write.?cell|append.?range|sort|filter|sheet|csv/.test(n)) return 'Excel'
  if (/mail|smtp|outlook|imap|pop3|exchange|attachment/.test(n)) return 'Email'
  if (/assign|delay|log.?message|message.?box|comment|invoke|argument|input.?dialog|add.?log|write.?line|add.?data.?row|build.?data|clear.?data|output.?data/.test(n)) return 'General'
  if (/^(if|else|then|switch|while|do.?while|for.?each|parallel|sequence|flowchart|flow.?decision|flow.?switch|try.?catch|throw|rethrow|retry|break|continue|terminate|pick|state.?machine|transition)$/i.test(name) || /if|else|switch|while|do.?while|for.?each|parallel|sequence|flowchart|flow.?decision|flow.?switch|try.?catch|throw|rethrow|retry|break|continue|terminate/.test(n)) return 'Control de Flujo'
  if (/file|folder|directory|path|read.?text|write.?text|append.?line|copy|move|delete|exists|create|zip|unzip/.test(n)) return 'Archivos'
  if (/database|connect|execute.?query|insert|update|sql|oledb|odbc/.test(n)) return 'Base de Datos'
  if (/http|rest|api|request|response|soap|json|xml|deserialize|serialize/.test(n)) return 'HTTP/API'
  if (/process|start.?process|kill|powershell|cmd|command|invoke.?code/.test(n)) return 'Sistema'
  if (/string|regex|replace|split|substring|trim|contains|format|parse|convert|to.?string|to.?int/.test(n)) return 'Datos/Texto'
  if (/image|ocr|citrix|terminal|mainframe|sap|ui.?automation/.test(n)) return 'UI Automation'
  if (/queue|orchestrator|asset|credential|trigger|job/.test(n)) return 'Orchestrator'
  return 'Otros'
}

// Humaniza un nombre de actividad CamelCase
function humanizeActivityName(name) {
  return name
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/([A-Z]+)([A-Z][a-z])/g, '$1 $2')
    .replace(/_/g, ' ')
    .trim()
}

// Sugiere icono basado en el nombre de la actividad
function suggestIconFromActivityName(name) {
  const n = name.toLowerCase()
  if (/browser|open.?browser|attach.?browser|application.?card|use.?application|attach.?window/.test(n)) return 'fa-globe'
  if (/navigate|go.?to|url/.test(n)) return 'fa-compass'
  if (/click/.test(n)) return 'fa-mouse-pointer'
  if (/type.?into|send.?hotkey|keyboard|set.?text/.test(n)) return 'fa-keyboard'
  if (/get.?text|extract|read/.test(n)) return 'fa-eye'
  if (/screenshot/.test(n)) return 'fa-camera'
  if (/excel|workbook|range|cell|sheet/.test(n)) return 'fa-file-excel'
  if (/mail|smtp|outlook|email/.test(n)) return 'fa-envelope'
  if (/assign/.test(n)) return 'fa-equals'
  if (/delay|wait/.test(n)) return 'fa-clock'
  if (/log|message.?box|write.?line/.test(n)) return 'fa-comment'
  if (/if|decision|switch/.test(n)) return 'fa-code-branch'
  if (/for.?each|while|loop/.test(n)) return 'fa-redo'
  if (/try.?catch|throw/.test(n)) return 'fa-shield-alt'
  if (/sequence/.test(n)) return 'fa-list-ol'
  if (/flowchart/.test(n)) return 'fa-project-diagram'
  if (/invoke/.test(n)) return 'fa-play-circle'
  if (/file|folder|directory/.test(n)) return 'fa-file'
  if (/http|api|request|rest/.test(n)) return 'fa-cloud'
  if (/database|sql|query/.test(n)) return 'fa-database'
  if (/process|cmd|powershell/.test(n)) return 'fa-terminal'
  if (/element.?exists|check/.test(n)) return 'fa-check-circle'
  if (/hover/.test(n)) return 'fa-hand-pointer'
  if (/select/.test(n)) return 'fa-hand-pointer'
  if (/image|ocr/.test(n)) return 'fa-image'
  if (/parallel/.test(n)) return 'fa-columns'
  if (/comment/.test(n)) return 'fa-sticky-note'
  if (/input.?dialog/.test(n)) return 'fa-keyboard'
  if (/string|regex|text|format/.test(n)) return 'fa-font'
  if (/json|xml|serialize/.test(n)) return 'fa-code'
  if (/terminate|break|stop/.test(n)) return 'fa-stop-circle'
  return 'fa-puzzle-piece'
}

// Genera descripcion legible de una actividad UiPath
function generateActivityDescription(localName, attrs, category) {
  // Descripcion corta: solo 1 detalle clave, sin repetir el nombre de la actividad
  const detail = attrs.Url ? attrs.Url.substring(0, 60)
    : attrs.FileName ? attrs.FileName
    : attrs.WorkbookPath ? attrs.WorkbookPath
    : attrs.SheetName ? `Hoja: ${attrs.SheetName}`
    : attrs.Selector ? attrs.Selector.substring(0, 50)
    : attrs.Text ? `"${attrs.Text.substring(0, 40)}"`
    : attrs.To ? `→ ${attrs.To}`
    : attrs.Value ? attrs.Value.substring(0, 40)
    : attrs.Condition ? attrs.Condition.substring(0, 40)
    : attrs.MethodName ? attrs.MethodName
    : attrs.Duration ? `${attrs.Duration}`
    : ''

  return detail
}

// Extrae atributos de un elemento XML como objeto
function extractAttributes(element) {
  const attrs = {}
  if (element.attributes) {
    for (let i = 0; i < element.attributes.length; i++) {
      const attr = element.attributes[i]
      // Ignorar xmlns y namespaces
      if (!attr.name.startsWith('xmlns') && !attr.name.includes(':')) {
        attrs[attr.name] = attr.value
      }
      // Guardar DisplayName y otros atributos con namespace
      if (attr.localName === 'DisplayName' || attr.name === 'DisplayName') {
        attrs.DisplayName = attr.value
      }
    }
  }
  return attrs
}

// Extrae propiedades de elementos hijos que son valores simples
function extractChildProperties(element) {
  const props = {}
  for (let i = 0; i < element.children.length; i++) {
    const child = element.children[i]
    const childLocal = child.localName || child.tagName?.split(':').pop() || ''
    // Si el hijo contiene texto directo y no tiene hijos complejos
    if (child.children.length === 0 && child.textContent?.trim()) {
      props[childLocal] = child.textContent.trim()
    }
  }
  return props
}

// Elementos contenedores que agrupan sub-actividades
const CONTAINER_ACTIVITIES = new Set([
  'sequence', 'flowchart', 'if', 'trycatch', 'foreach', 'while', 'dowhile',
  'parallel', 'switch', 'pick', 'state', 'statemachine', 'transactionalscope',
  'retryscope', 'parallelforeach',
  // Actividades modernas UiPath que son contenedores
  'useapplicationcard', 'napplicationcard', 'usebrowser', 'openbrowser',
  'attachbrowser', 'attachwindow', 'excelapplicationscope', 'excelprocessscope',
  'useexcelfile', 'browserscope', 'applicationscope'
])

/**
 * Parsea un archivo UiPath XAML y lo convierte a formato Alqvimia
 * Usa DOMParser para parseo real del XML - detecta TODAS las actividades
 * Retorna { steps, variables, summary } con analisis completo
 */
export function parseUiPathXaml(content) {
  const steps = []
  const variables = []
  const categories = {}
  let totalActivities = 0
  let stepIndex = 0
  let workflowName = 'Workflow UiPath'

  try {
    const parser = new DOMParser()
    const xmlDoc = parser.parseFromString(content, 'text/xml')

    // Verificar errores de parseo
    const parseError = xmlDoc.querySelector('parsererror')
    if (parseError) {
      console.warn('[Migration] XML parse warning:', parseError.textContent?.substring(0, 200))
    }

    // Extraer nombre del workflow
    const rootActivity = xmlDoc.documentElement
    if (rootActivity) {
      const xClass = rootActivity.getAttribute('x:Class') || rootActivity.getAttribute('mc:Class') || ''
      if (xClass) workflowName = xClass.split('.').pop().replace(/_/g, ' ')
      const displayName = rootActivity.getAttribute('DisplayName')
      if (displayName) workflowName = displayName
    }

    // Extraer variables
    const variableElements = xmlDoc.querySelectorAll('Variable')
    variableElements.forEach(varEl => {
      const name = varEl.getAttribute('Name')
      const type = varEl.getAttribute('Type') || 'String'
      const defaultVal = varEl.getAttribute('Default') || ''
      if (name) {
        variables.push({
          name,
          type: type.replace(/.*:/, '').replace(/[[\]]/g, ''),
          defaultValue: defaultVal,
          source: 'uipath'
        })
      }
    })

    // Extraer argumentos (x:Members)
    const memberElements = xmlDoc.querySelectorAll('Property, Member')
    memberElements.forEach(member => {
      const name = member.getAttribute('Name')
      const type = member.getAttribute('Type') || 'String'
      if (name && !name.startsWith('_')) {
        variables.push({
          name,
          type: type.replace(/.*:/, '').replace(/[()[\]]/g, ''),
          defaultValue: '',
          isArgument: true,
          source: 'uipath'
        })
      }
    })

    // Recorrer el arbol XML recursivamente
    function walkElement(element) {
      if (!element || !element.children) return

      for (let i = 0; i < element.children.length; i++) {
        const child = element.children[i]
        const localName = child.localName || child.tagName?.split(':').pop() || ''
        const lowerName = localName.toLowerCase()

        if (!localName) continue

        // Elementos terminales: skip sin recorrer hijos
        if (SKIP_TERMINAL.has(lowerName)) continue
        if (isDataTypeOrNonActivity(localName)) continue

        // Wrappers que contienen actividades: NO crear paso pero SÍ recorrer hijos
        if (SKIP_BUT_RECURSE.has(lowerName)) {
          walkElement(child)
          continue
        }

        // Propiedades anidadas con punto (ej: UseApplicationCard.Body, If.Then)
        if (localName.includes('.')) {
          walkElement(child)
          continue
        }

        // Wrappers de layout del flowchart
        if (lowerName === 'flowstep' || lowerName === 'flownode') {
          walkElement(child)
          continue
        }

        // Elementos XAML internos sin DisplayName y sin hijos (configuración, no actividades)
        const tagNS = child.namespaceURI || ''
        const isXamlType = tagNS.includes('schemas.microsoft.com/winfx') || tagNS.includes('schemas.microsoft.com/netfx')
        if (isXamlType && !child.getAttribute('DisplayName') && child.children.length === 0 && !CONTAINER_ACTIVITIES.has(lowerName)) {
          continue
        }

        const attrs = extractAttributes(child)
        const childProps = extractChildProperties(child)
        const allProps = { ...childProps, ...attrs }
        const rawDisplayName = allProps.DisplayName || humanizeActivityName(localName)
        const displayName = rawDisplayName.length > 40 ? rawDisplayName.substring(0, 37) + '...' : rawDisplayName
        const category = categorizeActivity(localName)
        const icon = suggestIconFromActivityName(localName)
        const isContainer = CONTAINER_ACTIVITIES.has(lowerName)
        const description = generateActivityDescription(localName, allProps, category)

        totalActivities++
        stepIndex++

        // Contar por categoria
        categories[category] = (categories[category] || 0) + 1

        // Normalizar params para que el canvas los reconozca
        // El canvas busca: url, message, name, description, variable, selector, text
        const normalizedParams = {
          description,
          originalActivity: localName,
          category
        }
        if (allProps.Url) normalizedParams.url = allProps.Url
        if (allProps.Text) normalizedParams.text = allProps.Text
        if (allProps.Selector) normalizedParams.selector = allProps.Selector
        if (allProps.To) normalizedParams.variable = allProps.To
        if (allProps.Value) normalizedParams.value = allProps.Value
        if (allProps.Duration) normalizedParams.duration = allProps.Duration
        if (allProps.FileName || allProps.WorkbookPath) normalizedParams.path = allProps.FileName || allProps.WorkbookPath
        if (allProps.SheetName) normalizedParams.sheet = allProps.SheetName
        if (allProps.Range) normalizedParams.range = allProps.Range
        if (allProps.Condition) normalizedParams.condition = allProps.Condition
        if (allProps.MethodName) normalizedParams.method = allProps.MethodName
        if (allProps.WorkflowFileName) normalizedParams.workflowFile = allProps.WorkflowFileName

        const step = {
          id: `step_${stepIndex}`,
          type: `uipath_${localName.toLowerCase()}`,
          action: `uipath_${localName.toLowerCase()}`,
          label: displayName,
          icon,
          category,
          description,
          originalActivity: localName,
          isContainer,
          isCustomAction: true,
          properties: allProps,
          params: normalizedParams
        }

        if (isContainer) {
          step.children = []
        }

        steps.push(step)

        // Recorrer hijos para encontrar mas actividades
        walkElement(child)
      }
    }

    // Iniciar el recorrido desde la raiz
    walkElement(rootActivity)

  } catch (error) {
    console.error('Error parsing UiPath XAML:', error)
  }

  // Generar resumen/conclusiones
  const summary = {
    workflowName,
    totalSteps: steps.length,
    totalVariables: variables.length,
    categories,
    conclusions: generateConclusions(steps, variables, categories, workflowName)
  }

  return { steps, variables, summary }
}

// Genera conclusiones legibles del analisis
function generateConclusions(steps, variables, categories, name) {
  const conclusions = []
  conclusions.push(`El workflow "${name}" contiene ${steps.length} actividades detectadas.`)

  if (variables.length > 0) {
    const args = variables.filter(v => v.isArgument)
    const vars = variables.filter(v => !v.isArgument)
    if (vars.length > 0) conclusions.push(`Utiliza ${vars.length} variable(s): ${vars.map(v => v.name).slice(0, 5).join(', ')}${vars.length > 5 ? '...' : ''}.`)
    if (args.length > 0) conclusions.push(`Recibe ${args.length} argumento(s): ${args.map(v => v.name).slice(0, 5).join(', ')}${args.length > 5 ? '...' : ''}.`)
  }

  const catEntries = Object.entries(categories).sort((a, b) => b[1] - a[1])
  if (catEntries.length > 0) {
    conclusions.push(`Categorias: ${catEntries.map(([cat, count]) => `${cat} (${count})`).join(', ')}.`)
  }

  // Deducir proposito
  const catNames = catEntries.map(([c]) => c)
  if (catNames.includes('Web/Browser')) conclusions.push('Este workflow realiza automatizacion web (scraping, navegacion, interaccion con paginas).')
  if (catNames.includes('Excel')) conclusions.push('Incluye operaciones con archivos Excel.')
  if (catNames.includes('Email')) conclusions.push('Gestiona envio/lectura de correos electronicos.')
  if (catNames.includes('Base de Datos')) conclusions.push('Interactua con bases de datos.')
  if (catNames.includes('HTTP/API')) conclusions.push('Realiza llamadas HTTP/API.')
  if (catNames.includes('Archivos')) conclusions.push('Manipula archivos del sistema.')

  return conclusions
}

/**
 * Parsea un archivo Power Automate JSON y lo convierte a formato Alqvimia
 */
export function parsePowerAutomate(content) {
  const steps = []

  try {
    const flow = typeof content === 'string' ? JSON.parse(content) : content
    const actions = flow.definition?.actions || flow.actions || {}

    let stepIndex = 0
    for (const [name, action] of Object.entries(actions)) {
      stepIndex++
      const converted = convertPowerAutomateAction(action, name)
      if (converted) {
        steps.push({
          id: `step_${stepIndex}`,
          ...converted
        })
      }
    }
  } catch (error) {
    console.error('Error parsing Power Automate:', error)
  }

  return steps
}

// ==========================================
// PYTHON - PARSER PROFUNDO (Selenium, Playwright, requests, etc.)
// ==========================================

const PYTHON_PATTERNS = [
  // === SELENIUM ===
  { regex: /webdriver\.(Chrome|Firefox|Edge|Safari)\s*\(/, action: 'browser_open', icon: 'fa-globe', label: (m) => `Abrir navegador ${m[1]}`, props: (m) => ({ browser: m[1].toLowerCase() }), cat: 'Web/Browser' },
  { regex: /driver\.get\(\s*["'f]([^"'\n)]{0,200})/, action: 'navigate', icon: 'fa-compass', label: (m) => `Navegar a ${m[1].substring(0, 40)}`, props: (m) => ({ url: m[1] }), cat: 'Web/Browser' },
  { regex: /\.find_element\(\s*By\.(\w+)\s*,\s*["']([^"']+)["']\s*\)/, action: 'find_element', icon: 'fa-search', label: (m) => `Buscar elemento (${m[1]}: "${m[2].substring(0, 30)}")`, props: (m) => ({ method: m[1], selector: m[2] }), cat: 'Web/Browser' },
  { regex: /\.find_elements?\(\s*By\.(\w+)\s*,\s*f?["']([^"']+)["']\s*\)/, action: 'find_element', icon: 'fa-search', label: (m) => `Buscar elemento (${m[1]}: "${m[2].substring(0, 30)}")`, props: (m) => ({ method: m[1], selector: m[2] }), cat: 'Web/Browser' },
  { regex: /(\w+)\.click\(\)/, action: 'click', icon: 'fa-mouse-pointer', label: () => 'Hacer clic en elemento', props: () => ({}), cat: 'Web/Browser' },
  { regex: /(\w+)\.send_keys\(\s*Keys\.(\w+)\s*\)/, action: 'press_key', icon: 'fa-keyboard', label: (m) => `Presionar tecla ${m[2]}`, props: (m) => ({ key: m[2] }), cat: 'Web/Browser' },
  { regex: /(\w+)\.send_keys\(\s*["']([^"']+)["']\s*\)/, action: 'type_text', icon: 'fa-keyboard', label: (m) => `Escribir "${m[2].substring(0, 30)}"`, props: (m) => ({ text: m[2] }), cat: 'Web/Browser' },
  { regex: /(\w+)\.send_keys\(\s*(\w+)/, action: 'type_text', icon: 'fa-keyboard', label: (m) => `Escribir variable ${m[2]}`, props: (m) => ({ variable: m[2] }), cat: 'Web/Browser' },
  { regex: /(\w+)\.clear\(\)/, action: 'clear_input', icon: 'fa-eraser', label: () => 'Limpiar campo de entrada', props: () => ({}), cat: 'Web/Browser' },
  { regex: /\.save_screenshot\(\s*["'f]?([^"')]+)/, action: 'screenshot', icon: 'fa-camera', label: (m) => `Captura de pantalla: ${m[1].substring(0, 30)}`, props: (m) => ({ path: m[1] }), cat: 'Web/Browser' },
  { regex: /WebDriverWait\(\s*\w+\s*,\s*(\d+)\s*\)\.until\(.*?EC\.(\w+)/, action: 'wait_element', icon: 'fa-hourglass-half', label: (m) => `Esperar elemento (${m[2]}, ${m[1]}s)`, props: (m) => ({ condition: m[2], timeout: parseInt(m[1]) }), cat: 'Web/Browser' },
  { regex: /driver\.(quit|close)\(\)/, action: 'browser_close', icon: 'fa-times-circle', label: (m) => m[1] === 'quit' ? 'Cerrar navegador' : 'Cerrar pestaña', props: () => ({}), cat: 'Web/Browser' },
  { regex: /driver\.switch_to\.(frame|window|alert)/, action: 'switch_context', icon: 'fa-exchange-alt', label: (m) => `Cambiar a ${m[1]}`, props: (m) => ({ target: m[1] }), cat: 'Web/Browser' },
  { regex: /driver\.execute_script\(\s*["']([^"']{0,60})/, action: 'execute_js', icon: 'fa-code', label: (m) => `Ejecutar JS: ${m[1].substring(0, 40)}`, props: (m) => ({ script: m[1] }), cat: 'Web/Browser' },
  { regex: /Select\(\s*(\w+)\s*\)\.(select_by_\w+)\(\s*["']([^"']+)/, action: 'select_option', icon: 'fa-hand-pointer', label: (m) => `Seleccionar "${m[3]}"`, props: (m) => ({ method: m[2], value: m[3] }), cat: 'Web/Browser' },
  // === PLAYWRIGHT (Python) ===
  { regex: /playwright\.\w+\.launch\(/, action: 'browser_open', icon: 'fa-globe', label: () => 'Abrir navegador (Playwright)', props: () => ({ browser: 'chromium' }), cat: 'Web/Browser' },
  { regex: /page\.goto\(\s*["']([^"']+)/, action: 'navigate', icon: 'fa-compass', label: (m) => `Navegar a ${m[1].substring(0, 40)}`, props: (m) => ({ url: m[1] }), cat: 'Web/Browser' },
  { regex: /page\.click\(\s*["']([^"']+)/, action: 'click', icon: 'fa-mouse-pointer', label: (m) => `Clic en "${m[1].substring(0, 30)}"`, props: (m) => ({ selector: m[1] }), cat: 'Web/Browser' },
  { regex: /page\.fill\(\s*["']([^"']+)["']\s*,\s*["']([^"']+)/, action: 'type_text', icon: 'fa-keyboard', label: (m) => `Escribir "${m[2].substring(0, 25)}" en ${m[1].substring(0, 20)}`, props: (m) => ({ selector: m[1], text: m[2] }), cat: 'Web/Browser' },
  { regex: /page\.screenshot\(/, action: 'screenshot', icon: 'fa-camera', label: () => 'Captura de pantalla', props: () => ({}), cat: 'Web/Browser' },
  // === GENERAL PYTHON ===
  { regex: /time\.sleep\(\s*([^)]+)\)/, action: 'delay', icon: 'fa-clock', label: (m) => `Esperar ${m[1]}s`, props: (m) => ({ seconds: parseFloat(m[1]) || 1 }), cat: 'General' },
  { regex: /print\(\s*f?["']([^"'\n]{0,80})/, action: 'log_message', icon: 'fa-comment', label: (m) => `Log: "${m[1].substring(0, 40)}"`, props: (m) => ({ message: m[1] }), cat: 'General' },
  { regex: /print\(\s*f?["'](.{0,80})/, action: 'log_message', icon: 'fa-comment', label: (m) => `Log: "${m[1].substring(0, 40)}"`, props: (m) => ({ message: m[1] }), cat: 'General' },
  // === REQUESTS / HTTP ===
  { regex: /requests\.(get|post|put|delete|patch)\(\s*["']([^"']+)/, action: (m) => `http_${m[1]}`, icon: 'fa-cloud', label: (m) => `HTTP ${m[1].toUpperCase()} ${m[2].substring(0, 35)}`, props: (m) => ({ method: m[1], url: m[2] }), cat: 'HTTP/API' },
  { regex: /requests\.(get|post|put|delete|patch)\(\s*(\w+)/, action: (m) => `http_${m[1]}`, icon: 'fa-cloud', label: (m) => `HTTP ${m[1].toUpperCase()} (${m[2]})`, props: (m) => ({ method: m[1], urlVariable: m[2] }), cat: 'HTTP/API' },
  { regex: /\.json\(\)/, action: 'parse_json', icon: 'fa-code', label: () => 'Parsear respuesta JSON', props: () => ({}), cat: 'HTTP/API' },
  // === ARCHIVOS ===
  { regex: /open\(\s*["']([^"']+)["']\s*,\s*["']([rwa])/, action: (m) => m[2] === 'r' ? 'file_read' : 'file_write', icon: 'fa-file', label: (m) => `${m[2] === 'r' ? 'Leer' : 'Escribir'} archivo: ${m[1].substring(0, 30)}`, props: (m) => ({ path: m[1], mode: m[2] }), cat: 'Archivos' },
  { regex: /os\.(makedirs|mkdir)\(\s*["']([^"']+)/, action: 'create_folder', icon: 'fa-folder-plus', label: (m) => `Crear directorio: ${m[2]}`, props: (m) => ({ path: m[2] }), cat: 'Archivos' },
  { regex: /os\.(remove|unlink)\(\s*["']([^"']+)/, action: 'file_delete', icon: 'fa-trash', label: (m) => `Eliminar: ${m[2]}`, props: (m) => ({ path: m[2] }), cat: 'Archivos' },
  { regex: /shutil\.(copy|move)\(\s*["']([^"']+)["']\s*,\s*["']([^"']+)/, action: (m) => m[1] === 'copy' ? 'file_copy' : 'file_move', icon: 'fa-file-export', label: (m) => `${m[1] === 'copy' ? 'Copiar' : 'Mover'} archivo`, props: (m) => ({ source: m[2], destination: m[3] }), cat: 'Archivos' },
  // === EXCEL ===
  { regex: /openpyxl\.load_workbook\(\s*["']([^"']+)/, action: 'excel_open', icon: 'fa-file-excel', label: (m) => `Abrir Excel: ${m[1]}`, props: (m) => ({ path: m[1] }), cat: 'Excel' },
  { regex: /pd\.read_excel\(\s*["']([^"']+)/, action: 'excel_read', icon: 'fa-file-excel', label: (m) => `Leer Excel: ${m[1]}`, props: (m) => ({ path: m[1] }), cat: 'Excel' },
  { regex: /pd\.read_csv\(\s*["']([^"']+)/, action: 'csv_read', icon: 'fa-file-csv', label: (m) => `Leer CSV: ${m[1]}`, props: (m) => ({ path: m[1] }), cat: 'Excel' },
  { regex: /\.to_excel\(\s*["']([^"']+)/, action: 'excel_write', icon: 'fa-file-excel', label: (m) => `Guardar Excel: ${m[1]}`, props: (m) => ({ path: m[1] }), cat: 'Excel' },
  { regex: /\.to_csv\(\s*["']([^"']+)/, action: 'csv_write', icon: 'fa-file-csv', label: (m) => `Guardar CSV: ${m[1]}`, props: (m) => ({ path: m[1] }), cat: 'Excel' },
  // === EMAIL ===
  { regex: /smtplib\.SMTP\(\s*["']([^"']+)/, action: 'email_connect', icon: 'fa-envelope', label: (m) => `Conectar SMTP: ${m[1]}`, props: (m) => ({ server: m[1] }), cat: 'Email' },
  { regex: /\.send_message|\.sendmail\(/, action: 'email_send', icon: 'fa-paper-plane', label: () => 'Enviar email', props: () => ({}), cat: 'Email' },
  // === BASE DE DATOS ===
  { regex: /(mysql|psycopg2|sqlite3|pymongo|sqlalchemy)\.connect\(\s*["']?([^"')]{0,60})/, action: 'db_connect', icon: 'fa-database', label: (m) => `Conectar BD (${m[1]})`, props: (m) => ({ driver: m[1], connection: m[2] }), cat: 'Base de Datos' },
  { regex: /cursor\.execute\(\s*["']([^"']{0,60})/, action: 'db_query', icon: 'fa-database', label: (m) => `SQL: ${m[1].substring(0, 40)}`, props: (m) => ({ query: m[1] }), cat: 'Base de Datos' },
  // === SUBPROCESS / SISTEMA ===
  { regex: /subprocess\.(run|call|Popen)\(\s*\[?["']([^"']+)/, action: 'process_start', icon: 'fa-terminal', label: (m) => `Ejecutar: ${m[2]}`, props: (m) => ({ command: m[2] }), cat: 'Sistema' },
  { regex: /os\.system\(\s*["']([^"']+)/, action: 'cmd_run', icon: 'fa-terminal', label: (m) => `Comando: ${m[1].substring(0, 40)}`, props: (m) => ({ command: m[1] }), cat: 'Sistema' },
]

// Detecta funciones que representan acciones complejas (como try_accept_cookies)
function detectPythonFunctionCalls(line, functionDefs) {
  // Detectar llamadas a funciones definidas en el script
  for (const fn of functionDefs) {
    const callRegex = new RegExp(`${fn.name}\\(`)
    if (callRegex.test(line)) {
      return {
        action: `call_${fn.name}`,
        icon: fn.icon || 'fa-play-circle',
        label: fn.label || `Ejecutar: ${fn.name.replace(/_/g, ' ')}`,
        params: { function: fn.name, description: fn.description || '' },
        category: fn.category || 'General'
      }
    }
  }
  return null
}

// Analiza definiciones de funciones en Python para entender su propósito
function analyzePythonFunctions(content) {
  const fns = []
  const fnRegex = /def\s+(\w+)\([^)]*\).*?(?:"""([\s\S]*?)"""|'''([\s\S]*?)''')?/g
  let match
  while ((match = fnRegex.exec(content)) !== null) {
    const name = match[1]
    if (name === 'main' || name.startsWith('_')) continue
    const docstring = (match[2] || match[3] || '').trim()
    const lowerName = name.toLowerCase()
    let icon = 'fa-play-circle'
    let category = 'General'
    if (/cookie|consent|accept|banner/.test(lowerName)) { icon = 'fa-cookie-bite'; category = 'Web/Browser' }
    else if (/login|auth|sign/.test(lowerName)) { icon = 'fa-sign-in-alt'; category = 'Web/Browser' }
    else if (/download|save|export/.test(lowerName)) { icon = 'fa-download'; category = 'Archivos' }
    else if (/upload|import/.test(lowerName)) { icon = 'fa-upload'; category = 'Archivos' }
    else if (/email|mail|send/.test(lowerName)) { icon = 'fa-envelope'; category = 'Email' }
    else if (/scrape|extract|parse|crawl/.test(lowerName)) { icon = 'fa-spider'; category = 'Web/Browser' }
    else if (/click|navigate|browse|open/.test(lowerName)) { icon = 'fa-mouse-pointer'; category = 'Web/Browser' }
    fns.push({ name, description: docstring.substring(0, 100), icon, category, label: humanizeActivityName(name) })
  }
  return fns
}

// Detecta imports y variables de un script Python
function analyzePythonImports(content) {
  const libs = new Set()
  const lines = content.split('\n')
  for (const line of lines) {
    const trimmed = line.trim()
    // from selenium.webdriver... import X
    const fromMatch = trimmed.match(/^from\s+([\w.]+)/)
    if (fromMatch) {
      libs.add(fromMatch[1].split('.')[0])
      continue
    }
    // import argparse, os, time
    const importMatch = trimmed.match(/^import\s+([\w.,\s]+)/)
    if (importMatch) {
      importMatch[1].split(',').forEach(lib => {
        const name = lib.trim().split('.')[0].split(' ')[0]
        if (name) libs.add(name)
      })
    }
  }
  return libs
}

function extractPythonVariables(content) {
  const vars = []
  const seen = new Set()
  const skipVars = /^(self|cls|_|parser|args|opts|driver|wait|browser|page|search|btn|match|ok|input|end|candidates|result|response|data|conn|cursor|reader|writer|file|f|e|i|j|k|txt)$/i
  // Solo buscar variables en main() o a nivel de módulo
  const lines = content.split('\n')
  let inMain = false
  for (const line of lines) {
    const trimmed = line.trim()
    if (/^def\s+main\(/.test(trimmed)) { inMain = true; continue }
    if (inMain && /^def\s+\w/.test(trimmed)) { inMain = false; continue }
    if (!inMain && line.search(/\S/) > 0) continue

    const assignMatch = trimmed.match(/^(\w+)\s*=\s*(.+)$/)
    if (assignMatch) {
      const name = assignMatch[1]
      if (seen.has(name) || skipVars.test(name)) continue
      if (/^[A-Z_]+$/.test(name)) continue
      seen.add(name)
      vars.push({ name, type: 'auto', defaultValue: assignMatch[2].trim().substring(0, 50), source: 'python' })
    }
  }
  return vars.slice(0, 20)
}

/**
 * Parsea un script Python y lo convierte a formato Alqvimia
 * Analiza profundamente: Selenium, Playwright, requests, archivos, etc.
 */
export function parsePythonScript(content) {
  const steps = []
  const categories = {}
  let stepIndex = 0

  try {
    const lines = content.split('\n')
    const libs = analyzePythonImports(content)
    const functionDefs = analyzePythonFunctions(content)
    const variables = extractPythonVariables(content)

    // Determinar tipo de script segun imports
    let scriptType = 'general'
    if (libs.has('selenium')) scriptType = 'selenium'
    else if (libs.has('playwright')) scriptType = 'playwright'
    else if (libs.has('requests') || libs.has('httpx')) scriptType = 'http'
    else if (libs.has('pandas') || libs.has('openpyxl')) scriptType = 'data'

    // Buscar nombre del script (primera linea de docstring o nombre de archivo en comentario)
    let workflowName = 'Script Python'
    const docMatch = content.match(/^"""\s*\n\s*([\w][\w\s._-]+)/m)
    if (docMatch) workflowName = docMatch[1].split('\n')[0].trim().replace(/\.py$/i, '')
    const fileMatch = content.match(/^#\s*([\w\s._-]+\.py)/m)
    if (fileMatch) workflowName = fileMatch[1].replace(/\.py$/i, '').trim()

    // Determinar que funciones NO son main (para saltar su cuerpo)
    const nonMainFunctions = new Set(functionDefs.map(f => f.name))
    let insideNonMainFn = false
    let nonMainFnIndent = 0
    let insideDocstring = false

    for (let lineNum = 0; lineNum < lines.length; lineNum++) {
      const line = lines[lineNum]
      const trimmed = line.trim()
      const indent = line.search(/\S/)

      // Trackear docstrings multilinea
      if (trimmed.startsWith('"""') || trimmed.startsWith("'''")) {
        const quote = trimmed.substring(0, 3)
        const rest = trimmed.substring(3)
        if (insideDocstring) { insideDocstring = false; continue }
        if (!rest.includes(quote)) { insideDocstring = true; continue }
        continue
      }
      if (insideDocstring) continue

      // Detectar inicio de función auxiliar (no main)
      const defMatch = trimmed.match(/^def\s+(\w+)\(/)
      if (defMatch) {
        if (defMatch[1] !== 'main' && defMatch[1] !== '__init__') {
          insideNonMainFn = true
          nonMainFnIndent = indent
        } else {
          insideNonMainFn = false
        }
        continue
      }

      // Si estamos dentro de una función auxiliar, saltar hasta que el indent baje
      if (insideNonMainFn) {
        if (indent > nonMainFnIndent || !trimmed) continue
        insideNonMainFn = false // Salimos de la función
      }

      // Saltar lineas vacias, comentarios, imports, decoradores, class
      if (!trimmed || trimmed.startsWith('#') || trimmed.startsWith('import ') || trimmed.startsWith('from ')) continue
      if (trimmed.startsWith('@') || trimmed.startsWith('class ')) continue
      if (trimmed === 'try:' || trimmed === 'finally:' || trimmed === 'else:' || trimmed.startsWith('except') || trimmed.startsWith('elif')) continue
      if (trimmed.startsWith('if __name__')) continue
      if (trimmed.startsWith('return ') || trimmed === 'pass' || trimmed === 'continue' || trimmed === 'break') continue

      // Intentar match con llamadas a funciones del script
      const fnCall = detectPythonFunctionCalls(trimmed, functionDefs)
      if (fnCall) {
        stepIndex++
        categories[fnCall.category] = (categories[fnCall.category] || 0) + 1
        steps.push({
          id: `step_${stepIndex}`,
          type: fnCall.action,
          action: fnCall.action,
          label: fnCall.label,
          icon: fnCall.icon,
          category: fnCall.category,
          description: fnCall.params.description || '',
          isCustomAction: true,
          params: { ...fnCall.params, description: fnCall.params.description || '', category: fnCall.category }
        })
        continue
      }

      // Intentar match con patrones conocidos
      let matched = false
      for (const pat of PYTHON_PATTERNS) {
        const match = trimmed.match(pat.regex)
        if (match) {
          stepIndex++
          const action = typeof pat.action === 'function' ? pat.action(match) : pat.action
          const label = pat.label(match)
          const props = typeof pat.props === 'function' ? pat.props(match) : pat.props
          const cat = pat.cat
          categories[cat] = (categories[cat] || 0) + 1

          // Evitar duplicados consecutivos (clear + send_keys puede matchear 2 veces)
          const lastStep = steps[steps.length - 1]
          if (lastStep && lastStep.action === action && lastStep.label === label) {
            matched = true
            break
          }

          steps.push({
            id: `step_${stepIndex}`,
            type: action,
            action,
            label: label.length > 40 ? label.substring(0, 37) + '...' : label,
            icon: pat.icon,
            category: cat,
            description: Object.values(props).filter(v => typeof v === 'string').join(' ').substring(0, 60),
            isCustomAction: true,
            params: { ...props, description: '', category: cat }
          })
          matched = true
          break
        }
      }
    }

    // Insertar delays de 2 segundos entre pasos
    const stepsWithDelays = addDelaysBetweenSteps(steps, 2)

    const summary = {
      workflowName,
      totalSteps: stepsWithDelays.length,
      totalVariables: variables.length,
      categories,
      scriptType,
      libraries: [...libs],
      conclusions: generateCodeConclusions(stepsWithDelays, variables, categories, workflowName, 'Python', libs)
    }

    return { steps: stepsWithDelays, variables, summary }
  } catch (error) {
    console.error('Error parsing Python script:', error)
    return { steps: [], variables: [], summary: { workflowName: 'Error', totalSteps: 0, totalVariables: 0, categories: {}, conclusions: ['Error al analizar el script Python: ' + error.message] } }
  }
}

// ==========================================
// JAVASCRIPT - PARSER PROFUNDO (Puppeteer, Playwright, fetch, etc.)
// ==========================================

const JS_PATTERNS = [
  // === PUPPETEER / PLAYWRIGHT ===
  { regex: /puppeteer\.launch\(|chromium\.launch\(|firefox\.launch\(/, action: 'browser_open', icon: 'fa-globe', label: () => 'Abrir navegador', props: () => ({ browser: 'chromium' }), cat: 'Web/Browser' },
  { regex: /page\.goto\(\s*['"` ]([^'"` ]+)/, action: 'navigate', icon: 'fa-compass', label: (m) => `Navegar a ${m[1].substring(0, 40)}`, props: (m) => ({ url: m[1] }), cat: 'Web/Browser' },
  { regex: /page\.click\(\s*['"`]([^'"`]+)/, action: 'click', icon: 'fa-mouse-pointer', label: (m) => `Clic en "${m[1].substring(0, 30)}"`, props: (m) => ({ selector: m[1] }), cat: 'Web/Browser' },
  { regex: /page\.(fill|type)\(\s*['"`]([^'"`]+)['"`]\s*,\s*['"`]([^'"`]+)/, action: 'type_text', icon: 'fa-keyboard', label: (m) => `Escribir "${m[3].substring(0, 25)}"`, props: (m) => ({ selector: m[2], text: m[3] }), cat: 'Web/Browser' },
  { regex: /page\.screenshot\(/, action: 'screenshot', icon: 'fa-camera', label: () => 'Captura de pantalla', props: () => ({}), cat: 'Web/Browser' },
  { regex: /page\.waitForSelector\(\s*['"`]([^'"`]+)/, action: 'wait_element', icon: 'fa-hourglass-half', label: (m) => `Esperar: "${m[1].substring(0, 30)}"`, props: (m) => ({ selector: m[1] }), cat: 'Web/Browser' },
  { regex: /page\.waitForNavigation\(/, action: 'wait_navigation', icon: 'fa-hourglass-half', label: () => 'Esperar navegación', props: () => ({}), cat: 'Web/Browser' },
  { regex: /page\.\$eval\(\s*['"`]([^'"`]+)/, action: 'extract_text', icon: 'fa-eye', label: (m) => `Extraer de "${m[1].substring(0, 30)}"`, props: (m) => ({ selector: m[1] }), cat: 'Web/Browser' },
  { regex: /page\.evaluate\(/, action: 'execute_js', icon: 'fa-code', label: () => 'Ejecutar JavaScript en página', props: () => ({}), cat: 'Web/Browser' },
  { regex: /browser\.close\(\)|browser\.disconnect\(/, action: 'browser_close', icon: 'fa-times-circle', label: () => 'Cerrar navegador', props: () => ({}), cat: 'Web/Browser' },
  // === FETCH / AXIOS / HTTP ===
  { regex: /fetch\(\s*['"`]([^'"`]+)/, action: 'http_get', icon: 'fa-cloud', label: (m) => `Fetch: ${m[1].substring(0, 40)}`, props: (m) => ({ url: m[1] }), cat: 'HTTP/API' },
  { regex: /axios\.(get|post|put|delete)\(\s*['"`]([^'"`]+)/, action: (m) => `http_${m[1]}`, icon: 'fa-cloud', label: (m) => `HTTP ${m[1].toUpperCase()} ${m[2].substring(0, 35)}`, props: (m) => ({ method: m[1], url: m[2] }), cat: 'HTTP/API' },
  { regex: /\.json\(\)/, action: 'parse_json', icon: 'fa-code', label: () => 'Parsear JSON', props: () => ({}), cat: 'HTTP/API' },
  // === FILE SYSTEM ===
  { regex: /fs\.(readFileSync|readFile)\(\s*['"`]([^'"`]+)/, action: 'file_read', icon: 'fa-file', label: (m) => `Leer: ${m[2].substring(0, 30)}`, props: (m) => ({ path: m[2] }), cat: 'Archivos' },
  { regex: /fs\.(writeFileSync|writeFile)\(\s*['"`]([^'"`]+)/, action: 'file_write', icon: 'fa-file', label: (m) => `Escribir: ${m[2].substring(0, 30)}`, props: (m) => ({ path: m[2] }), cat: 'Archivos' },
  { regex: /fs\.(mkdirSync|mkdir)\(/, action: 'create_folder', icon: 'fa-folder-plus', label: () => 'Crear directorio', props: () => ({}), cat: 'Archivos' },
  { regex: /fs\.(unlinkSync|unlink|rmSync)\(/, action: 'file_delete', icon: 'fa-trash', label: () => 'Eliminar archivo', props: () => ({}), cat: 'Archivos' },
  // === GENERAL ===
  { regex: /setTimeout\(\s*.*?,\s*(\d+)\)/, action: 'delay', icon: 'fa-clock', label: (m) => `Esperar ${parseInt(m[1]) / 1000}s`, props: (m) => ({ seconds: parseInt(m[1]) / 1000 }), cat: 'General' },
  { regex: /await.*?delay\((\d+)\)|await.*?sleep\((\d+)\)/, action: 'delay', icon: 'fa-clock', label: (m) => `Esperar ${(parseInt(m[1] || m[2]) / 1000)}s`, props: (m) => ({ seconds: parseInt(m[1] || m[2]) / 1000 }), cat: 'General' },
  { regex: /console\.log\(\s*['"`]([^'"`]{0,60})/, action: 'log_message', icon: 'fa-comment', label: (m) => `Log: "${m[1].substring(0, 40)}"`, props: (m) => ({ message: m[1] }), cat: 'General' },
  // === DB ===
  { regex: /mysql\.createConnection|mongoose\.connect|new\s+Client\(/, action: 'db_connect', icon: 'fa-database', label: () => 'Conectar a BD', props: () => ({}), cat: 'Base de Datos' },
  { regex: /\.query\(\s*['"`]([^'"`]{0,60})/, action: 'db_query', icon: 'fa-database', label: (m) => `Query: ${m[1].substring(0, 40)}`, props: (m) => ({ query: m[1] }), cat: 'Base de Datos' },
  // === EMAIL ===
  { regex: /nodemailer\.createTransport|sendMail\(/, action: 'email_send', icon: 'fa-paper-plane', label: () => 'Enviar email', props: () => ({}), cat: 'Email' },
  // === PROCESO ===
  { regex: /child_process\.exec\(\s*['"`]([^'"`]+)/, action: 'cmd_run', icon: 'fa-terminal', label: (m) => `Ejecutar: ${m[1].substring(0, 30)}`, props: (m) => ({ command: m[1] }), cat: 'Sistema' },
  { regex: /spawn\(\s*['"`]([^'"`]+)/, action: 'process_start', icon: 'fa-terminal', label: (m) => `Proceso: ${m[1]}`, props: (m) => ({ command: m[1] }), cat: 'Sistema' },
]

function extractJSVariables(content) {
  const vars = []
  const seen = new Set()
  const varRegex = /(?:const|let|var)\s+(\w+)\s*=\s*([^;\n]{0,60})/g
  let m
  while ((m = varRegex.exec(content)) !== null) {
    const name = m[1]
    if (seen.has(name) || /^(browser|page|driver|response|data|fs|path|http|app|server|router|express)$/i.test(name)) continue
    seen.add(name)
    vars.push({ name, type: 'auto', defaultValue: m[2].trim().substring(0, 50), source: 'javascript' })
  }
  return vars.slice(0, 20)
}

/**
 * Parsea un script JavaScript y lo convierte a formato Alqvimia
 */
export function parseJavaScript(content) {
  const steps = []
  const categories = {}
  let stepIndex = 0

  try {
    const lines = content.split('\n')
    const variables = extractJSVariables(content)

    let workflowName = 'Script JavaScript'
    const commentMatch = content.match(/^\/\/\s*([\w\s._-]+)/m)
    if (commentMatch) workflowName = commentMatch[1].trim()
    const fileMatch = content.match(/['"`]([\w._-]+\.js)['"`]/)
    if (fileMatch) workflowName = fileMatch[1].replace(/\.js$/i, '')

    for (const line of lines) {
      const trimmed = line.trim()
      if (!trimmed || trimmed.startsWith('//') || trimmed.startsWith('/*') || trimmed.startsWith('*')) continue
      if (trimmed.startsWith('const ') || trimmed.startsWith('let ') || trimmed.startsWith('var ') || trimmed.startsWith('import ') || trimmed.startsWith('require(')) continue
      if (trimmed === 'try {' || trimmed === '} catch' || trimmed === '} finally' || trimmed === '}' || trimmed === '});' || trimmed === '{') continue
      if (trimmed.startsWith('function ') || trimmed.startsWith('async function') || trimmed.startsWith('module.exports')) continue

      for (const pat of JS_PATTERNS) {
        const match = trimmed.match(pat.regex)
        if (match) {
          stepIndex++
          const action = typeof pat.action === 'function' ? pat.action(match) : pat.action
          const label = pat.label(match)
          const props = typeof pat.props === 'function' ? pat.props(match) : pat.props
          const cat = pat.cat
          categories[cat] = (categories[cat] || 0) + 1

          steps.push({
            id: `step_${stepIndex}`,
            type: action, action, icon: pat.icon, category: cat,
            label: label.length > 40 ? label.substring(0, 37) + '...' : label,
            description: '', isCustomAction: true,
            params: { ...props, description: '', category: cat }
          })
          break
        }
      }
    }

    const stepsWithDelays = addDelaysBetweenSteps(steps, 2)
    const libs = new Set()
    const reqRegex = /require\(['"](\w+)['"]\)|from\s+['"](\w+)/g
    let rm
    while ((rm = reqRegex.exec(content)) !== null) libs.add(rm[1] || rm[2])

    const summary = {
      workflowName, totalSteps: stepsWithDelays.length, totalVariables: variables.length,
      categories, libraries: [...libs],
      conclusions: generateCodeConclusions(stepsWithDelays, variables, categories, workflowName, 'JavaScript', libs)
    }
    return { steps: stepsWithDelays, variables, summary }
  } catch (error) {
    console.error('Error parsing JavaScript:', error)
    return { steps: [], variables: [], summary: { workflowName: 'Error', totalSteps: 0, totalVariables: 0, categories: {}, conclusions: ['Error al analizar: ' + error.message] } }
  }
}

// ==========================================
// C# / .NET - PARSER PROFUNDO
// ==========================================

const CSHARP_PATTERNS = [
  // Selenium
  { regex: /new\s+(Chrome|Firefox|Edge)Driver\(/, action: 'browser_open', icon: 'fa-globe', label: (m) => `Abrir ${m[1]}`, props: (m) => ({ browser: m[1] }), cat: 'Web/Browser' },
  { regex: /driver\.Navigate\(\)\.GoToUrl\(\s*["']([^"']+)/, action: 'navigate', icon: 'fa-compass', label: (m) => `Navegar a ${m[1].substring(0, 40)}`, props: (m) => ({ url: m[1] }), cat: 'Web/Browser' },
  { regex: /\.FindElement\(\s*By\.(\w+)\(\s*["']([^"']+)/, action: 'find_element', icon: 'fa-search', label: (m) => `Buscar (${m[1]}: "${m[2].substring(0, 25)}")`, props: (m) => ({ method: m[1], selector: m[2] }), cat: 'Web/Browser' },
  { regex: /\.Click\(\)/, action: 'click', icon: 'fa-mouse-pointer', label: () => 'Hacer clic', props: () => ({}), cat: 'Web/Browser' },
  { regex: /\.SendKeys\(\s*["']([^"']+)/, action: 'type_text', icon: 'fa-keyboard', label: (m) => `Escribir "${m[1].substring(0, 30)}"`, props: (m) => ({ text: m[1] }), cat: 'Web/Browser' },
  { regex: /\.SendKeys\(\s*Keys\.(\w+)/, action: 'press_key', icon: 'fa-keyboard', label: (m) => `Tecla ${m[1]}`, props: (m) => ({ key: m[1] }), cat: 'Web/Browser' },
  { regex: /driver\.(Quit|Close|Dispose)\(/, action: 'browser_close', icon: 'fa-times-circle', label: () => 'Cerrar navegador', props: () => ({}), cat: 'Web/Browser' },
  { regex: /GetScreenshot\(\)|Screenshot/, action: 'screenshot', icon: 'fa-camera', label: () => 'Captura de pantalla', props: () => ({}), cat: 'Web/Browser' },
  // HTTP
  { regex: /HttpClient|WebRequest|RestClient/, action: 'http_client', icon: 'fa-cloud', label: () => 'Cliente HTTP', props: () => ({}), cat: 'HTTP/API' },
  { regex: /\.GetAsync\(\s*["']([^"']+)/, action: 'http_get', icon: 'fa-cloud', label: (m) => `GET ${m[1].substring(0, 40)}`, props: (m) => ({ url: m[1] }), cat: 'HTTP/API' },
  { regex: /\.PostAsync\(\s*["']([^"']+)/, action: 'http_post', icon: 'fa-cloud', label: (m) => `POST ${m[1].substring(0, 40)}`, props: (m) => ({ url: m[1] }), cat: 'HTTP/API' },
  { regex: /JsonConvert\.Deserialize|JsonSerializer\.Deserialize/, action: 'parse_json', icon: 'fa-code', label: () => 'Parsear JSON', props: () => ({}), cat: 'HTTP/API' },
  // File I/O
  { regex: /File\.ReadAllText\(\s*["']([^"']+)/, action: 'file_read', icon: 'fa-file', label: (m) => `Leer: ${m[1].substring(0, 30)}`, props: (m) => ({ path: m[1] }), cat: 'Archivos' },
  { regex: /File\.WriteAllText\(\s*["']([^"']+)/, action: 'file_write', icon: 'fa-file', label: (m) => `Escribir: ${m[1].substring(0, 30)}`, props: (m) => ({ path: m[1] }), cat: 'Archivos' },
  { regex: /File\.(Copy|Move|Delete)\(/, action: (m) => `file_${m[1].toLowerCase()}`, icon: 'fa-file-export', label: (m) => `${m[1]} archivo`, props: () => ({}), cat: 'Archivos' },
  { regex: /Directory\.(CreateDirectory|Create)\(/, action: 'create_folder', icon: 'fa-folder-plus', label: () => 'Crear directorio', props: () => ({}), cat: 'Archivos' },
  // Excel (EPPlus, NPOI, ClosedXML)
  { regex: /new\s+ExcelPackage|new\s+XLWorkbook|new\s+HSSFWorkbook/, action: 'excel_open', icon: 'fa-file-excel', label: () => 'Abrir Excel', props: () => ({}), cat: 'Excel' },
  // DB
  { regex: /new\s+Sql(Connection|Command)\(|new\s+MySql(Connection)\(/, action: 'db_connect', icon: 'fa-database', label: () => 'Conectar a BD', props: () => ({}), cat: 'Base de Datos' },
  { regex: /\.ExecuteReader|\.ExecuteNonQuery|\.ExecuteScalar/, action: 'db_query', icon: 'fa-database', label: () => 'Ejecutar consulta SQL', props: () => ({}), cat: 'Base de Datos' },
  // Email
  { regex: /new\s+SmtpClient|new\s+MailMessage/, action: 'email_setup', icon: 'fa-envelope', label: () => 'Configurar email', props: () => ({}), cat: 'Email' },
  { regex: /\.Send\(\s*\w*[Mm]ail/, action: 'email_send', icon: 'fa-paper-plane', label: () => 'Enviar email', props: () => ({}), cat: 'Email' },
  // General
  { regex: /Thread\.Sleep\(\s*(\d+)\)/, action: 'delay', icon: 'fa-clock', label: (m) => `Esperar ${parseInt(m[1]) / 1000}s`, props: (m) => ({ seconds: parseInt(m[1]) / 1000 }), cat: 'General' },
  { regex: /Task\.Delay\(\s*(\d+)\)/, action: 'delay', icon: 'fa-clock', label: (m) => `Esperar ${parseInt(m[1]) / 1000}s`, props: (m) => ({ seconds: parseInt(m[1]) / 1000 }), cat: 'General' },
  { regex: /Console\.WriteLine\(\s*["']([^"']{0,60})/, action: 'log_message', icon: 'fa-comment', label: (m) => `Log: "${m[1].substring(0, 40)}"`, props: (m) => ({ message: m[1] }), cat: 'General' },
  { regex: /MessageBox\.Show\(\s*["']([^"']{0,60})/, action: 'message_box', icon: 'fa-comment-dots', label: (m) => `Mensaje: "${m[1].substring(0, 35)}"`, props: (m) => ({ message: m[1] }), cat: 'General' },
  // Process
  { regex: /Process\.Start\(\s*["']([^"']+)/, action: 'process_start', icon: 'fa-terminal', label: (m) => `Ejecutar: ${m[1]}`, props: (m) => ({ command: m[1] }), cat: 'Sistema' },
]

/**
 * Parsea código C# y lo convierte a formato Alqvimia
 */
export function parseCSharp(content) {
  const steps = []
  const categories = {}
  let stepIndex = 0

  try {
    const lines = content.split('\n')
    const variables = []
    const seen = new Set()

    let workflowName = 'Script C#'
    const nsMatch = content.match(/namespace\s+([\w.]+)/)
    const classMatch = content.match(/class\s+(\w+)/)
    if (classMatch) workflowName = humanizeActivityName(classMatch[1])

    // Extraer variables
    const varRegex = /(?:var|string|int|bool|double|List|Dictionary)\s+(\w+)\s*=\s*([^;\n]{0,60})/g
    let vm
    while ((vm = varRegex.exec(content)) !== null) {
      if (!seen.has(vm[1]) && !/^(driver|browser|client|connection|command|reader)$/i.test(vm[1])) {
        seen.add(vm[1])
        variables.push({ name: vm[1], type: 'auto', defaultValue: vm[2].trim().substring(0, 50), source: 'csharp' })
      }
    }

    for (const line of lines) {
      const trimmed = line.trim()
      if (!trimmed || trimmed.startsWith('//') || trimmed.startsWith('/*') || trimmed.startsWith('*')) continue
      if (trimmed.startsWith('using ') || trimmed.startsWith('namespace ') || trimmed.startsWith('class ') || trimmed.startsWith('public ') || trimmed.startsWith('private ') || trimmed.startsWith('static ')) continue
      if (trimmed === '{' || trimmed === '}' || trimmed === 'try' || trimmed.startsWith('catch') || trimmed === 'finally') continue

      for (const pat of CSHARP_PATTERNS) {
        const match = trimmed.match(pat.regex)
        if (match) {
          stepIndex++
          const action = typeof pat.action === 'function' ? pat.action(match) : pat.action
          const label = pat.label(match)
          const props = typeof pat.props === 'function' ? pat.props(match) : pat.props
          categories[pat.cat] = (categories[pat.cat] || 0) + 1

          steps.push({
            id: `step_${stepIndex}`,
            type: action, action, icon: pat.icon, category: pat.cat,
            label: label.length > 40 ? label.substring(0, 37) + '...' : label,
            description: '', isCustomAction: true,
            params: { ...props, description: '', category: pat.cat }
          })
          break
        }
      }
    }

    const stepsWithDelays = addDelaysBetweenSteps(steps, 2)
    const usings = new Set()
    const usingRegex = /using\s+([\w.]+)/g
    let um
    while ((um = usingRegex.exec(content)) !== null) usings.add(um[1])

    const summary = {
      workflowName, totalSteps: stepsWithDelays.length, totalVariables: variables.length,
      categories, libraries: [...usings],
      conclusions: generateCodeConclusions(stepsWithDelays, variables, categories, workflowName, 'C#', usings)
    }
    return { steps: stepsWithDelays, variables, summary }
  } catch (error) {
    console.error('Error parsing C#:', error)
    return { steps: [], variables: [], summary: { workflowName: 'Error', totalSteps: 0, totalVariables: 0, categories: {}, conclusions: ['Error: ' + error.message] } }
  }
}

// ==========================================
// PARSER GENÉRICO UNIVERSAL - Cualquier lenguaje
// ==========================================

const GENERIC_PATTERNS = [
  // URLs / navegación
  { regex: /(https?:\/\/[^\s"'`,;)]+)/, action: 'navigate', icon: 'fa-compass', label: (m) => `URL: ${m[1].substring(0, 40)}`, props: (m) => ({ url: m[1] }), cat: 'Web/Browser' },
  // Clicks / interacción
  { regex: /\.click\s*\(|Click\(|click_element|clickOn/, action: 'click', icon: 'fa-mouse-pointer', label: () => 'Hacer clic', props: () => ({}), cat: 'Web/Browser' },
  // Escribir / input
  { regex: /\.type\s*\(|\.fill\s*\(|sendKeys|send_keys|typeText|setText|write_text|input_text/, action: 'type_text', icon: 'fa-keyboard', label: () => 'Escribir texto', props: () => ({}), cat: 'Web/Browser' },
  // Screenshots
  { regex: /screenshot|screen.?capture|save.?image|take.?picture/i, action: 'screenshot', icon: 'fa-camera', label: () => 'Captura de pantalla', props: () => ({}), cat: 'Web/Browser' },
  // Wait / sleep / delay
  { regex: /sleep\s*\(\s*(\d+)|delay\s*\(\s*(\d+)|wait\s*\(\s*(\d+)|Thread\.Sleep\s*\(\s*(\d+)|timeout\s*[:=]\s*(\d+)/i, action: 'delay', icon: 'fa-clock', label: (m) => { const v = parseInt(m[1]||m[2]||m[3]||m[4]||m[5]); return `Esperar ${v > 100 ? v/1000 : v}s` }, props: (m) => { const v = parseInt(m[1]||m[2]||m[3]||m[4]||m[5]); return { seconds: v > 100 ? v/1000 : v } }, cat: 'General' },
  // HTTP / API
  { regex: /\.(get|post|put|delete|patch)\s*\(\s*['"`]([^'"`]{5,})/, action: (m) => `http_${m[1]}`, icon: 'fa-cloud', label: (m) => `HTTP ${m[1].toUpperCase()} ${m[2].substring(0, 35)}`, props: (m) => ({ method: m[1], url: m[2] }), cat: 'HTTP/API' },
  { regex: /fetch\s*\(|requests?\.|HttpClient|WebRequest|axios|curl/i, action: 'http_request', icon: 'fa-cloud', label: () => 'Petición HTTP', props: () => ({}), cat: 'HTTP/API' },
  // Archivos
  { regex: /readFile|read_file|ReadAllText|open\(.+['"]r['"]\)|load_file|read_text/i, action: 'file_read', icon: 'fa-file', label: () => 'Leer archivo', props: () => ({}), cat: 'Archivos' },
  { regex: /writeFile|write_file|WriteAllText|open\(.+['"]w['"]\)|save_file|write_text/i, action: 'file_write', icon: 'fa-file', label: () => 'Escribir archivo', props: () => ({}), cat: 'Archivos' },
  // Excel
  { regex: /excel|workbook|spreadsheet|xlsx|openpyxl|xlrd|EPPlus|ClosedXML/i, action: 'excel_operation', icon: 'fa-file-excel', label: () => 'Operación Excel', props: () => ({}), cat: 'Excel' },
  // Email
  { regex: /smtp|send.?mail|send.?email|mail.?send|MailMessage|nodemailer/i, action: 'email_send', icon: 'fa-paper-plane', label: () => 'Enviar email', props: () => ({}), cat: 'Email' },
  // Base de datos
  { regex: /\.query\s*\(|execute.?query|ExecuteReader|ExecuteNonQuery|SELECT\s|INSERT\s|UPDATE\s|DELETE\s/i, action: 'db_query', icon: 'fa-database', label: () => 'Consulta BD', props: () => ({}), cat: 'Base de Datos' },
  { regex: /connect\s*\(|createConnection|ConnectionString|new.+Connection/i, action: 'db_connect', icon: 'fa-database', label: () => 'Conectar BD', props: () => ({}), cat: 'Base de Datos' },
  // Logging
  { regex: /print\s*\(|console\.log|Console\.Write|Log\.(Info|Debug|Error|Warn)|logger\./i, action: 'log_message', icon: 'fa-comment', label: () => 'Mensaje de log', props: () => ({}), cat: 'General' },
  // Procesos
  { regex: /Process\.Start|subprocess|exec\(|spawn\(|system\(/i, action: 'process_start', icon: 'fa-terminal', label: () => 'Ejecutar proceso', props: () => ({}), cat: 'Sistema' },
]

/**
 * Parser genérico universal para cualquier lenguaje de programación
 * Detecta patrones comunes: HTTP, clicks, archivos, DB, email, etc.
 */
export function parseGenericCode(content, fileName = 'code') {
  const steps = []
  const categories = {}
  let stepIndex = 0

  try {
    const lines = content.split('\n')
    const variables = []

    // Detectar lenguaje por extensión o contenido
    let lang = 'Código'
    if (/\.py$/i.test(fileName)) lang = 'Python'
    else if (/\.js$/i.test(fileName) || /\.ts$/i.test(fileName)) lang = 'JavaScript'
    else if (/\.cs$/i.test(fileName)) lang = 'C#'
    else if (/\.java$/i.test(fileName)) lang = 'Java'
    else if (/\.rb$/i.test(fileName)) lang = 'Ruby'
    else if (/\.go$/i.test(fileName)) lang = 'Go'
    else if (/\.php$/i.test(fileName)) lang = 'PHP'
    else if (/\.sh$/i.test(fileName) || /\.bash$/i.test(fileName)) lang = 'Bash'
    else if (/\.ps1$/i.test(fileName)) lang = 'PowerShell'

    const workflowName = fileName.replace(/\.[^.]+$/, '').replace(/[_-]/g, ' ')

    for (const line of lines) {
      const trimmed = line.trim()
      if (!trimmed || trimmed.length < 5) continue
      // Saltar comentarios comunes
      if (trimmed.startsWith('//') || trimmed.startsWith('#') || trimmed.startsWith('/*') || trimmed.startsWith('*') || trimmed.startsWith('"""') || trimmed.startsWith("'''")) continue
      // Saltar imports, usings, includes
      if (/^(import |from |using |require|include|#include|package )/.test(trimmed)) continue
      // Saltar definiciones puras
      if (/^(class |interface |struct |enum |def |function |func |public |private |protected |static )/.test(trimmed)) continue
      if (trimmed === '{' || trimmed === '}' || trimmed === '};' || trimmed === ');') continue

      for (const pat of GENERIC_PATTERNS) {
        const match = trimmed.match(pat.regex)
        if (match) {
          stepIndex++
          const action = typeof pat.action === 'function' ? pat.action(match) : pat.action
          const label = pat.label(match)
          const props = typeof pat.props === 'function' ? pat.props(match) : pat.props
          categories[pat.cat] = (categories[pat.cat] || 0) + 1

          // Evitar duplicados exactos consecutivos
          const last = steps[steps.length - 1]
          if (last && last.action === action && last.label === label) break

          steps.push({
            id: `step_${stepIndex}`,
            type: action, action, icon: pat.icon, category: pat.cat,
            label: label.length > 40 ? label.substring(0, 37) + '...' : label,
            description: '', isCustomAction: true,
            params: { ...props, description: '', category: pat.cat }
          })
          break
        }
      }
    }

    const stepsWithDelays = addDelaysBetweenSteps(steps, 2)

    const summary = {
      workflowName, totalSteps: stepsWithDelays.length, totalVariables: 0,
      categories, language: lang,
      conclusions: generateCodeConclusions(stepsWithDelays, variables, categories, workflowName, lang, new Set())
    }
    return { steps: stepsWithDelays, variables, summary }
  } catch (error) {
    console.error('Error parsing code:', error)
    return { steps: [], variables: [], summary: { workflowName: 'Error', totalSteps: 0, totalVariables: 0, categories: {}, conclusions: ['Error: ' + error.message] } }
  }
}

// ==========================================
// HELPERS COMPARTIDOS POR TODOS LOS PARSERS
// ==========================================

/**
 * Inserta pasos de delay entre cada acción
 */
function addDelaysBetweenSteps(steps, delaySeconds = 2) {
  if (steps.length <= 1) return steps
  const result = []
  let id = 1
  for (let i = 0; i < steps.length; i++) {
    // Renumerar ID
    steps[i].id = `step_${id++}`
    result.push(steps[i])

    // Agregar delay entre pasos (no después del último, no si ya es un delay)
    if (i < steps.length - 1 && steps[i].action !== 'delay') {
      result.push({
        id: `step_${id++}`,
        type: 'delay',
        action: 'delay',
        label: `Esperar ${delaySeconds}s`,
        icon: 'fa-clock',
        category: 'General',
        description: '',
        isCustomAction: true,
        params: { seconds: delaySeconds, description: '', category: 'General' }
      })
    }
  }
  return result
}

/**
 * Genera conclusiones para scripts de código (Python, JS, C#, etc.)
 */
function generateCodeConclusions(steps, variables, categories, name, language, libs) {
  const conclusions = []
  const realSteps = steps.filter(s => s.action !== 'delay')
  conclusions.push(`Script ${language}: "${name}" - ${realSteps.length} acciones detectadas.`)

  if (variables.length > 0) {
    conclusions.push(`Variables: ${variables.map(v => v.name).slice(0, 5).join(', ')}${variables.length > 5 ? '...' : ''}.`)
  }

  if (libs && libs.size > 0) {
    conclusions.push(`Librerías: ${[...libs].slice(0, 8).join(', ')}${libs.size > 8 ? '...' : ''}.`)
  }

  const catEntries = Object.entries(categories).sort((a, b) => b[1] - a[1])
  if (catEntries.length > 0) {
    conclusions.push(`Categorías: ${catEntries.map(([c, n]) => `${c} (${n})`).join(', ')}.`)
  }

  // Deducir propósito
  const cats = catEntries.map(([c]) => c)
  if (cats.includes('Web/Browser')) conclusions.push('Este script realiza automatización web (navegación, interacción con páginas, scraping).')
  if (cats.includes('Excel')) conclusions.push('Incluye operaciones con Excel/CSV.')
  if (cats.includes('Email')) conclusions.push('Gestiona envío/lectura de emails.')
  if (cats.includes('HTTP/API')) conclusions.push('Realiza llamadas HTTP/API REST.')
  if (cats.includes('Base de Datos')) conclusions.push('Interactúa con bases de datos.')
  if (cats.includes('Archivos')) conclusions.push('Manipula archivos del sistema.')

  conclusions.push(`Se agregaron delays de 2s entre cada paso para ejecución controlada.`)

  return conclusions
}

/**
 * Parsea un archivo RPA Platform
 */
export function parseRPAPlatform(content) {
  const steps = []

  try {
    const data = typeof content === 'string' ? JSON.parse(content) : content
    const commands = data.commands || data.nodes || []

    let stepIndex = 0
    for (const cmd of commands) {
      stepIndex++
      const converted = convertAACommand(cmd)
      if (converted) {
        steps.push({
          id: `step_${stepIndex}`,
          ...converted
        })
      }
    }
  } catch (error) {
    console.error('Error parsing RPA Platform:', error)
  }

  return steps
}

/**
 * Parsea un archivo Blue Prism
 */
export function parseBluePrism(content) {
  const steps = []

  try {
    // Blue Prism usa XML
    const stagePatterns = [
      { regex: /<stage[^>]*type="Navigate"[^>]*>.*?<url>([^<]*)<\/url>/gs, action: 'navigate', extract: (m) => ({ url: m[1] }) },
      { regex: /<stage[^>]*type="Click"[^>]*>.*?<element>([^<]*)<\/element>/gs, action: 'click', extract: (m) => ({ selector: m[1] }) },
      { regex: /<stage[^>]*type="Write"[^>]*>.*?<text>([^<]*)<\/text>.*?<element>([^<]*)<\/element>/gs, action: 'type', extract: (m) => ({ text: m[1], selector: m[2] }) },
      { regex: /<stage[^>]*type="Read"[^>]*>.*?<element>([^<]*)<\/element>/gs, action: 'extract', extract: (m) => ({ selector: m[1] }) },
      { regex: /<stage[^>]*type="Wait"[^>]*>.*?<timeout>([^<]*)<\/timeout>/gs, action: 'wait', extract: (m) => ({ seconds: parseInt(m[1]) / 1000 }) },
    ]

    let stepIndex = 0
    for (const pattern of stagePatterns) {
      const matches = content.matchAll(pattern.regex)
      for (const match of matches) {
        stepIndex++
        const params = pattern.extract(match)
        steps.push({
          id: `step_${stepIndex}`,
          type: pattern.action,
          label: getActionLabel(pattern.action, params),
          properties: params
        })
      }
    }
  } catch (error) {
    console.error('Error parsing Blue Prism:', error)
  }

  return steps
}

// ==========================================
// EXPORTADORES (De Alqvimia a otras plataformas)
// ==========================================

/**
 * Convierte un workflow de Alqvimia a UiPath XAML
 */
export function exportToUiPath(workflow) {
  const activities = workflow.steps.map((step, index) => {
    return convertToUiPathActivity(step, index)
  }).join('\n')

  return `<?xml version="1.0" encoding="utf-8"?>
<Activity mc:Ignorable="sap sap2010" x:Class="Alqvimia_${workflow.name.replace(/\s/g, '_')}"
  xmlns="http://schemas.microsoft.com/netfx/2009/xaml/activities"
  xmlns:mc="http://schemas.openxmlformats.org/markup-compatibility/2006"
  xmlns:sap="http://schemas.microsoft.com/netfx/2009/xaml/activities/presentation"
  xmlns:sap2010="http://schemas.microsoft.com/netfx/2010/xaml/activities/presentation"
  xmlns:ui="http://schemas.uipath.com/workflow/activities"
  xmlns:x="http://schemas.microsoft.com/winfx/2006/xaml">
  <Sequence DisplayName="${workflow.name}">
${activities}
  </Sequence>
</Activity>`
}

/**
 * Convierte un workflow de Alqvimia a Power Automate JSON
 */
export function exportToPowerAutomate(workflow) {
  const actions = {}

  workflow.steps.forEach((step, index) => {
    const actionName = `action_${index + 1}_${step.type}`
    actions[actionName] = convertToPowerAutomateAction(step)
  })

  return JSON.stringify({
    "$schema": "https://schema.management.azure.com/providers/Microsoft.Logic/schemas/2016-06-01/workflowdefinition.json#",
    "contentVersion": "1.0.0.0",
    "definition": {
      "triggers": {
        "manual": {
          "type": "Request",
          "kind": "Button"
        }
      },
      "actions": actions
    }
  }, null, 2)
}

/**
 * Convierte un workflow de Alqvimia a Python
 */
export function exportToPython(workflow) {
  const imports = new Set(['from playwright.sync_api import sync_playwright', 'import time'])
  const code = []

  code.push('# Workflow generado por Alqvimia RPA 2.0')
  code.push(`# Nombre: ${workflow.name}`)
  code.push('')

  // Variables
  if (workflow.variables?.length > 0) {
    code.push('# Variables')
    workflow.variables.forEach(v => {
      code.push(`${v.name} = ${JSON.stringify(v.value || v.defaultValue || '')}`)
    })
    code.push('')
  }

  code.push('def main():')
  code.push('    with sync_playwright() as p:')
  code.push('        browser = None')
  code.push('        page = None')
  code.push('        ')

  workflow.steps.forEach((step, index) => {
    const pythonCode = convertToPythonCode(step, imports)
    pythonCode.forEach(line => code.push(`        ${line}`))
    code.push('')
  })

  code.push('        # Cerrar navegador si está abierto')
  code.push('        if browser:')
  code.push('            browser.close()')
  code.push('')
  code.push('if __name__ == "__main__":')
  code.push('    main()')

  return [...imports].join('\n') + '\n\n' + code.join('\n')
}

/**
 * Convierte un workflow de Alqvimia a JavaScript
 */
export function exportToJavaScript(workflow) {
  const code = []

  code.push('// Workflow generado por Alqvimia RPA 2.0')
  code.push(`// Nombre: ${workflow.name}`)
  code.push('')
  code.push("const { chromium } = require('playwright');")
  code.push('')

  // Variables
  if (workflow.variables?.length > 0) {
    code.push('// Variables')
    workflow.variables.forEach(v => {
      code.push(`let ${v.name} = ${JSON.stringify(v.value || v.defaultValue || '')};`)
    })
    code.push('')
  }

  code.push('async function main() {')
  code.push('  let browser = null;')
  code.push('  let page = null;')
  code.push('  ')
  code.push('  try {')

  workflow.steps.forEach((step, index) => {
    const jsCode = convertToJavaScriptCode(step)
    jsCode.forEach(line => code.push(`    ${line}`))
    code.push('')
  })

  code.push('  } catch (error) {')
  code.push('    console.error("Error:", error);')
  code.push('  } finally {')
  code.push('    if (browser) await browser.close();')
  code.push('  }')
  code.push('}')
  code.push('')
  code.push('main();')

  return code.join('\n')
}

/**
 * Convierte un workflow de Alqvimia a Bash Script
 */
export function exportToBash(workflow) {
  const code = []

  code.push('#!/bin/bash')
  code.push('# Workflow generado por Alqvimia RPA 2.0')
  code.push(`# Nombre: ${workflow.name}`)
  code.push('')

  // Variables
  if (workflow.variables?.length > 0) {
    code.push('# Variables')
    workflow.variables.forEach(v => {
      const value = v.value || v.defaultValue || ''
      code.push(`${v.name}="${value}"`)
    })
    code.push('')
  }

  code.push('# Pasos del workflow')
  workflow.steps.forEach((step, index) => {
    const bashCode = convertToBashCode(step, index)
    bashCode.forEach(line => code.push(line))
    code.push('')
  })

  code.push('echo "Workflow completado"')

  return code.join('\n')
}

/**
 * Convierte un workflow a pseudocódigo legible
 */
export function exportToPseudocode(workflow) {
  const code = []

  code.push(`WORKFLOW: ${workflow.name}`)
  code.push('=' .repeat(50))
  code.push('')

  if (workflow.variables?.length > 0) {
    code.push('VARIABLES:')
    workflow.variables.forEach(v => {
      code.push(`  - ${v.name}: ${v.type || 'string'} = ${JSON.stringify(v.value || v.defaultValue || '')}`)
    })
    code.push('')
  }

  code.push('PASOS:')
  code.push('')

  workflow.steps.forEach((step, index) => {
    const pseudo = convertToPseudocode(step, index + 1)
    code.push(pseudo)
    code.push('')
  })

  code.push('FIN WORKFLOW')

  return code.join('\n')
}

// ==========================================
// FUNCIONES AUXILIARES
// ==========================================

function parseDuration(duration) {
  // Parsea formato TimeSpan de .NET (hh:mm:ss)
  const parts = duration.split(':')
  if (parts.length === 3) {
    return parseInt(parts[0]) * 3600 + parseInt(parts[1]) * 60 + parseInt(parts[2])
  }
  return parseInt(duration) || 1
}

function getActionLabel(action, params) {
  const labels = {
    'open_browser': `Abrir ${params.browser || 'navegador'}`,
    'navigate': `Navegar a ${params.url}`,
    'click': `Clic en ${params.selector}`,
    'type': `Escribir "${params.text?.substring(0, 20)}..."`,
    'extract': `Extraer texto de ${params.selector}`,
    'screenshot': `Capturar pantalla`,
    'wait': `Esperar ${params.seconds}s`,
    'message_box': `Mostrar mensaje`,
    'excel_read': `Leer Excel`,
    'excel_write': `Escribir Excel`,
    'set_variable': `Variable ${params.name}`,
  }
  return labels[action] || action
}

function convertPowerAutomateAction(action, name) {
  const typeMap = {
    'OpenBrowser': { type: 'open_browser', props: (a) => ({ browser: 'chrome' }) },
    'Navigate': { type: 'navigate', props: (a) => ({ url: a.inputs?.uri || a.inputs?.url }) },
    'Click': { type: 'click', props: (a) => ({ selector: a.inputs?.element }) },
    'TypeInto': { type: 'type', props: (a) => ({ text: a.inputs?.text, selector: a.inputs?.element }) },
    'GetText': { type: 'extract', props: (a) => ({ selector: a.inputs?.element }) },
    'Wait': { type: 'wait', props: (a) => ({ seconds: a.inputs?.duration || 1 }) },
    'Http': { type: 'http_get', props: (a) => ({ url: a.inputs?.uri, method: a.inputs?.method }) },
  }

  const actionType = action.type || action.kind
  const mapping = typeMap[actionType]

  if (mapping) {
    return {
      type: mapping.type,
      label: name,
      properties: mapping.props(action)
    }
  }

  return {
    type: 'unknown',
    label: name,
    properties: action.inputs || {}
  }
}

// (convertPythonLine y convertJavaScriptLine eliminados - reemplazados por parsers profundos)

function convertAACommand(cmd) {
  const typeMap = {
    'Browser': { type: 'open_browser', props: (c) => ({ browser: c.browserType?.toLowerCase() }) },
    'NavigateUrl': { type: 'navigate', props: (c) => ({ url: c.url }) },
    'ClickElement': { type: 'click', props: (c) => ({ selector: c.selector }) },
    'SetText': { type: 'type', props: (c) => ({ text: c.text, selector: c.selector }) },
    'Delay': { type: 'wait', props: (c) => ({ seconds: c.delay / 1000 }) },
    'Message': { type: 'message_box', props: (c) => ({ message: c.message }) },
  }

  const mapping = typeMap[cmd.command || cmd.type]
  if (mapping) {
    return {
      type: mapping.type,
      label: cmd.name || getActionLabel(mapping.type, mapping.props(cmd)),
      properties: mapping.props(cmd)
    }
  }

  return null
}

function convertToUiPathActivity(step, index) {
  const indent = '    '
  const props = step.properties || {}

  const templates = {
    'open_browser': `${indent}<ui:OpenBrowser BrowserType="${props.browser || 'Chrome'}" Url="${props.url || ''}" DisplayName="Abrir Navegador" />`,
    'navigate': `${indent}<ui:Navigate Url="${props.url || ''}" DisplayName="Navegar a URL" />`,
    'click': `${indent}<ui:Click Selector="${props.selector || ''}" DisplayName="Clic" />`,
    'type': `${indent}<ui:TypeInto Text="${props.text || ''}" Selector="${props.selector || ''}" DisplayName="Escribir" />`,
    'extract': `${indent}<ui:GetText Selector="${props.selector || ''}" Output="[extractedText]" DisplayName="Extraer Texto" />`,
    'screenshot': `${indent}<ui:TakeScreenshot FileName="${props.path || 'screenshot.png'}" DisplayName="Captura de Pantalla" />`,
    'wait': `${indent}<ui:Delay Duration="00:00:${String(props.seconds || 1).padStart(2, '0')}" DisplayName="Esperar" />`,
    'message_box': `${indent}<ui:MessageBox Text="${props.message || ''}" DisplayName="Mensaje" />`,
  }

  return templates[step.type] || `${indent}<!-- Acción no soportada: ${step.type} -->`
}

function convertToPowerAutomateAction(step) {
  const props = step.properties || {}

  const templates = {
    'open_browser': { type: 'OpenBrowser', inputs: { browserType: props.browser || 'Chrome' } },
    'navigate': { type: 'Navigate', inputs: { uri: props.url } },
    'click': { type: 'Click', inputs: { element: props.selector } },
    'type': { type: 'TypeInto', inputs: { element: props.selector, text: props.text } },
    'extract': { type: 'GetText', inputs: { element: props.selector } },
    'wait': { type: 'Wait', inputs: { duration: props.seconds || 1 } },
    'http_get': { type: 'Http', inputs: { method: 'GET', uri: props.url } },
    'http_post': { type: 'Http', inputs: { method: 'POST', uri: props.url, body: props.body } },
  }

  return templates[step.type] || { type: 'Unknown', inputs: props }
}

function convertToPythonCode(step, imports) {
  const props = step.properties || {}

  const templates = {
    'open_browser': [`browser = p.chromium.launch(headless=${props.headless ? 'True' : 'False'})`, 'page = browser.new_page()'],
    'navigate': [`page.goto("${props.url || ''}")`],
    'click': [`page.click("${props.selector || ''}")`],
    'type': [`page.fill("${props.selector || ''}", "${props.text || ''}")`],
    'extract': [`extracted_text = page.text_content("${props.selector || ''}")`],
    'screenshot': [`page.screenshot(path="${props.path || 'screenshot.png'}")`],
    'wait': [`time.sleep(${props.seconds || 1})`],
    'message_box': [`print("${props.message || ''}")`],
    'http_get': [`response = requests.get("${props.url || ''}")`, imports.add('import requests')],
    'http_post': [`response = requests.post("${props.url || ''}", json=${JSON.stringify(props.body || {})})`, imports.add('import requests')],
    'file_read': [`with open("${props.path || ''}", "r") as f: content = f.read()`],
    'file_write': [`with open("${props.path || ''}", "w") as f: f.write("${props.content || ''}")`],
    'set_variable': [`${props.name || 'var'} = ${JSON.stringify(props.value || '')}`],
  }

  return templates[step.type] || [`# ${step.label || step.type}`]
}

function convertToJavaScriptCode(step) {
  const props = step.properties || {}

  const templates = {
    'open_browser': ['browser = await chromium.launch({ headless: false });', 'page = await browser.newPage();'],
    'navigate': [`await page.goto("${props.url || ''}");`],
    'click': [`await page.click("${props.selector || ''}");`],
    'type': [`await page.fill("${props.selector || ''}", "${props.text || ''}");`],
    'extract': [`const extractedText = await page.textContent("${props.selector || ''}");`],
    'screenshot': [`await page.screenshot({ path: "${props.path || 'screenshot.png'}" });`],
    'wait': [`await new Promise(r => setTimeout(r, ${(props.seconds || 1) * 1000}));`],
    'message_box': [`console.log("${props.message || ''}");`],
    'http_get': [`const response = await fetch("${props.url || ''}");`, 'const data = await response.json();'],
    'http_post': [`const response = await fetch("${props.url || ''}", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(${JSON.stringify(props.body || {})}) });`],
    'file_read': [`const fs = require("fs");`, `const content = fs.readFileSync("${props.path || ''}", "utf8");`],
    'file_write': [`const fs = require("fs");`, `fs.writeFileSync("${props.path || ''}", "${props.content || ''}");`],
    'set_variable': [`let ${props.name || 'variable'} = ${JSON.stringify(props.value || '')};`],
  }

  return templates[step.type] || [`// ${step.label || step.type}`]
}

function convertToBashCode(step, index) {
  const props = step.properties || {}

  const templates = {
    'wait': [`echo "Paso ${index + 1}: Esperando ${props.seconds || 1} segundos..."`, `sleep ${props.seconds || 1}`],
    'message_box': [`echo "${props.message || ''}"`],
    'http_get': [`curl -s "${props.url || ''}"`],
    'http_post': [`curl -X POST -H "Content-Type: application/json" -d '${JSON.stringify(props.body || {})}' "${props.url || ''}"`],
    'file_read': [`cat "${props.path || ''}"`],
    'file_write': [`echo "${props.content || ''}" > "${props.path || ''}"`],
    'file_copy': [`cp "${props.source || ''}" "${props.destination || ''}"`],
    'file_move': [`mv "${props.source || ''}" "${props.destination || ''}"`],
    'file_delete': [`rm "${props.path || ''}"`],
    'run_application': [`"${props.path || ''}" ${(props.args || []).join(' ')}`],
    'powershell_run': [`powershell -Command "${props.command || ''}"`],
    'cmd_run': [`${props.command || ''}`],
    'set_variable': [`${props.name || 'VAR'}="${props.value || ''}"`],
  }

  return templates[step.type] || [`# Paso ${index + 1}: ${step.label || step.type}`]
}

function convertToPseudocode(step, stepNum) {
  const props = step.properties || {}

  const templates = {
    'open_browser': `${stepNum}. ABRIR navegador ${props.browser || 'Chrome'}`,
    'navigate': `${stepNum}. IR A URL: ${props.url || ''}`,
    'click': `${stepNum}. HACER CLIC en elemento: ${props.selector || ''}`,
    'type': `${stepNum}. ESCRIBIR "${props.text || ''}" en: ${props.selector || ''}`,
    'extract': `${stepNum}. EXTRAER texto de: ${props.selector || ''}`,
    'screenshot': `${stepNum}. CAPTURAR pantalla -> ${props.path || 'screenshot.png'}`,
    'wait': `${stepNum}. ESPERAR ${props.seconds || 1} segundos`,
    'message_box': `${stepNum}. MOSTRAR mensaje: "${props.message || ''}"`,
    'http_get': `${stepNum}. PETICIÓN GET a: ${props.url || ''}`,
    'http_post': `${stepNum}. PETICIÓN POST a: ${props.url || ''}`,
    'file_read': `${stepNum}. LEER archivo: ${props.path || ''}`,
    'file_write': `${stepNum}. ESCRIBIR archivo: ${props.path || ''}`,
    'set_variable': `${stepNum}. ASIGNAR ${props.name || 'variable'} = ${JSON.stringify(props.value || '')}`,
    'if_condition': `${stepNum}. SI (${props.condition || 'condición'}) ENTONCES`,
    'for_loop': `${stepNum}. PARA i = 1 HASTA ${props.iterations || 10} HACER`,
    'close_browser': `${stepNum}. CERRAR navegador`,
  }

  return templates[step.type] || `${stepNum}. ${step.label || step.type}`
}

// ==========================================
// EXPORTAR FUNCIONES PRINCIPALES
// ==========================================

export const importers = {
  'uipath': parseUiPathXaml,
  'power-automate': parsePowerAutomate,
  'rpa-platform': parseRPAPlatform,
  'blue-prism': parseBluePrism,
  'python': parsePythonScript,
  'javascript': parseJavaScript,
  'csharp': parseCSharp,
  'generic': parseGenericCode,
}

/**
 * Auto-detecta el parser correcto basado en la extensión del archivo
 * Retorna siempre { steps, variables, summary }
 */
export function autoParseFile(content, fileName) {
  const ext = (fileName || '').split('.').pop().toLowerCase()
  let result

  switch (ext) {
    case 'xaml':
    case 'xml':
      result = parseUiPathXaml(content)
      break
    case 'py':
      result = parsePythonScript(content)
      break
    case 'js':
    case 'ts':
    case 'mjs':
      result = parseJavaScript(content)
      break
    case 'cs':
      result = parseCSharp(content)
      break
    case 'json':
      // Intentar Power Automate primero, luego RPA Platform
      try {
        const json = JSON.parse(content)
        if (json.definition?.actions || json.actions) {
          result = parsePowerAutomate(content)
        } else if (json.commands || json.nodes) {
          result = parseRPAPlatform(content)
        } else {
          result = parseGenericCode(content, fileName)
        }
      } catch {
        result = parseGenericCode(content, fileName)
      }
      break
    default:
      // Java, Ruby, Go, PHP, Bash, PowerShell, etc. → parser genérico
      result = parseGenericCode(content, fileName)
      break
  }

  // Normalizar: todos deben retornar { steps, variables, summary }
  if (Array.isArray(result)) {
    result = {
      steps: result,
      variables: [],
      summary: {
        workflowName: fileName || 'Workflow',
        totalSteps: result.length,
        totalVariables: 0,
        categories: {},
        conclusions: [`Se detectaron ${result.length} pasos del archivo ${fileName || ''}.`]
      }
    }
  }

  return result
}

export const exporters = {
  'uipath': exportToUiPath,
  'power-automate': exportToPowerAutomate,
  'python': exportToPython,
  'javascript': exportToJavaScript,
  'bash': exportToBash,
  'pseudocode': exportToPseudocode,
}

export default { importers, exporters }
