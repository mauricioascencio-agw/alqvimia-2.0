// Configuración de propiedades para cada tipo de acción del Workflow Studio
// Cada acción tiene campos específicos con tipos, opciones y validaciones

import { generateActionProperties } from '../config/aiTemplates'

// Campo reutilizable para presionar tecla después de escribir texto
const PRESS_KEY_AFTER_FIELD = {
  key: 'pressKeyAfter',
  label: 'Presionar tecla al terminar',
  type: 'select',
  default: 'none',
  options: [
    { value: 'none', label: 'Ninguna' },
    { value: 'Enter', label: 'Enter (enviar formulario)' },
    { value: 'Tab', label: 'Tab (siguiente campo)' },
    { value: 'Escape', label: 'Escape (cerrar/cancelar)' },
    { value: 'Control+a', label: 'Ctrl+A (seleccionar todo)' },
    { value: 'Control+c', label: 'Ctrl+C (copiar)' },
    { value: 'Control+v', label: 'Ctrl+V (pegar)' },
    { value: 'Control+s', label: 'Ctrl+S (guardar)' },
    { value: 'Control+Enter', label: 'Ctrl+Enter (enviar)' },
    { value: 'Shift+Tab', label: 'Shift+Tab (campo anterior)' },
    { value: 'ArrowDown', label: 'Flecha Abajo' },
    { value: 'ArrowUp', label: 'Flecha Arriba' },
    { value: 'Space', label: 'Espacio' }
  ]
}

// Propiedades base de todas las acciones
const BASE_ACTION_PROPERTIES = {
  // ==========================================
  // NAVEGADOR WEB
  // ==========================================
  browser_open: {
    title: 'Abrir Navegador',
    icon: 'fa-window-maximize',
    description: 'Abre una nueva instancia del navegador web',
    fields: [
      {
        key: 'browser',
        label: 'Navegador',
        type: 'select',
        required: true,
        default: 'chrome',
        options: [
          { value: 'chrome', label: 'Google Chrome', icon: 'fab fa-chrome' },
          { value: 'edge', label: 'Microsoft Edge', icon: 'fab fa-edge' },
          { value: 'firefox', label: 'Mozilla Firefox', icon: 'fab fa-firefox' },
          { value: 'brave', label: 'Brave', icon: 'fas fa-shield-alt' }
        ]
      },
      {
        key: 'headless',
        label: 'Modo Headless',
        type: 'toggle',
        default: false,
        helpText: 'Ejecutar sin interfaz gráfica (más rápido)'
      },
      {
        key: 'incognito',
        label: 'Modo Incógnito',
        type: 'toggle',
        default: false,
        helpText: 'Abrir en ventana privada'
      },
      {
        key: 'maximized',
        label: 'Maximizar Ventana',
        type: 'toggle',
        default: true
      },
      {
        key: 'width',
        label: 'Ancho (px)',
        type: 'number',
        default: 1920,
        min: 800,
        max: 3840,
        condition: { field: 'maximized', value: false }
      },
      {
        key: 'height',
        label: 'Alto (px)',
        type: 'number',
        default: 1080,
        min: 600,
        max: 2160,
        condition: { field: 'maximized', value: false }
      },
      {
        key: 'userAgent',
        label: 'User Agent',
        type: 'text',
        placeholder: 'Dejar vacío para usar el predeterminado',
        advanced: true
      },
      {
        key: 'proxy',
        label: 'Servidor Proxy',
        type: 'text',
        placeholder: 'http://proxy:puerto',
        advanced: true
      }
    ]
  },

  open_browser: {
    // Alias para compatibilidad
    extends: 'browser_open'
  },

  navigate: {
    title: 'Navegar a URL',
    icon: 'fa-compass',
    description: 'Navega a una dirección web específica',
    fields: [
      {
        key: 'url',
        label: 'URL',
        type: 'url',
        required: true,
        placeholder: 'https://ejemplo.com',
        helpText: 'Dirección web completa incluyendo https://'
      },
      {
        key: 'waitUntil',
        label: 'Esperar hasta',
        type: 'select',
        default: 'load',
        options: [
          { value: 'load', label: 'Carga completa', icon: 'fas fa-check-circle' },
          { value: 'domcontentloaded', label: 'DOM cargado', icon: 'fas fa-code' },
          { value: 'networkidle0', label: 'Red inactiva (0)', icon: 'fas fa-network-wired' },
          { value: 'networkidle2', label: 'Red inactiva (2)', icon: 'fas fa-network-wired' }
        ]
      },
      {
        key: 'timeout',
        label: 'Timeout (segundos)',
        type: 'slider',
        default: 30,
        min: 5,
        max: 120,
        step: 5,
        unit: 's'
      },
      {
        key: 'clearCookies',
        label: 'Limpiar cookies antes',
        type: 'toggle',
        default: false,
        advanced: true
      }
    ]
  },

  click: {
    title: 'Hacer Clic',
    icon: 'fa-mouse-pointer',
    description: 'Realiza un clic en un elemento de la página',
    fields: [
      {
        key: 'selector',
        label: 'Selector',
        type: 'selector',
        required: true,
        placeholder: '#button-id, .class-name, [data-attr]',
        helpText: 'Selector CSS o XPath del elemento'
      },
      {
        key: 'selectorType',
        label: 'Tipo de Selector',
        type: 'buttonGroup',
        default: 'css',
        options: [
          { value: 'css', label: 'CSS' },
          { value: 'xpath', label: 'XPath' },
          { value: 'text', label: 'Texto' }
        ]
      },
      {
        key: 'clickType',
        label: 'Tipo de Clic',
        type: 'select',
        default: 'single',
        options: [
          { value: 'single', label: 'Clic Simple', icon: 'fas fa-mouse-pointer' },
          { value: 'double', label: 'Doble Clic', icon: 'fas fa-mouse' },
          { value: 'right', label: 'Clic Derecho', icon: 'fas fa-mouse-pointer' }
        ]
      },
      {
        key: 'button',
        label: 'Botón del Mouse',
        type: 'buttonGroup',
        default: 'left',
        options: [
          { value: 'left', label: 'Izquierdo' },
          { value: 'middle', label: 'Central' },
          { value: 'right', label: 'Derecho' }
        ]
      },
      {
        key: 'waitBefore',
        label: 'Esperar antes (ms)',
        type: 'number',
        default: 0,
        min: 0,
        max: 10000,
        step: 100
      },
      {
        key: 'scrollIntoView',
        label: 'Scroll al elemento',
        type: 'toggle',
        default: true
      },
      {
        key: 'force',
        label: 'Forzar clic',
        type: 'toggle',
        default: false,
        helpText: 'Ignorar visibilidad del elemento',
        advanced: true
      }
    ]
  },

  type: {
    title: 'Escribir Texto',
    icon: 'fa-keyboard',
    description: 'Escribe texto en un campo de entrada',
    fields: [
      {
        key: 'selector',
        label: 'Selector del Campo',
        type: 'selector',
        required: true,
        placeholder: '#input-id, input[name="email"]'
      },
      {
        key: 'text',
        label: 'Texto a Escribir',
        type: 'textarea',
        required: true,
        placeholder: 'Texto que se escribirá...',
        rows: 3
      },
      {
        key: 'inputMethod',
        label: 'Método de Entrada',
        type: 'select',
        default: 'type',
        options: [
          { value: 'type', label: 'Teclear (simula teclado)', icon: 'fas fa-keyboard' },
          { value: 'fill', label: 'Rellenar (instantáneo)', icon: 'fas fa-fill' },
          { value: 'paste', label: 'Pegar desde portapapeles', icon: 'fas fa-paste' }
        ]
      },
      {
        key: 'clearBefore',
        label: 'Limpiar campo antes',
        type: 'checkbox',
        default: true
      },
      {
        key: 'delay',
        label: 'Delay entre teclas (ms)',
        type: 'slider',
        default: 50,
        min: 0,
        max: 500,
        step: 10,
        unit: 'ms',
        condition: { field: 'inputMethod', value: 'type' }
      },
      PRESS_KEY_AFTER_FIELD
    ]
  },

  extract_text: {
    title: 'Extraer Texto',
    icon: 'fa-font',
    description: 'Extrae texto de un elemento de la página',
    fields: [
      {
        key: 'selector',
        label: 'Selector del Elemento',
        type: 'selector',
        required: true,
        placeholder: '.content, #resultado'
      },
      {
        key: 'extractType',
        label: 'Qué Extraer',
        type: 'select',
        default: 'innerText',
        options: [
          { value: 'innerText', label: 'Texto visible', icon: 'fas fa-font' },
          { value: 'innerHTML', label: 'HTML interno', icon: 'fas fa-code' },
          { value: 'value', label: 'Valor del input', icon: 'fas fa-keyboard' },
          { value: 'attribute', label: 'Atributo específico', icon: 'fas fa-tag' }
        ]
      },
      {
        key: 'attribute',
        label: 'Nombre del Atributo',
        type: 'text',
        placeholder: 'href, src, data-id...',
        condition: { field: 'extractType', value: 'attribute' }
      },
      {
        key: 'variable',
        label: 'Guardar en Variable',
        type: 'variable',
        required: true,
        placeholder: 'textoExtraido'
      },
      {
        key: 'trim',
        label: 'Eliminar espacios',
        type: 'toggle',
        default: true
      },
      {
        key: 'regex',
        label: 'Aplicar Regex',
        type: 'text',
        placeholder: '\\d+',
        advanced: true,
        helpText: 'Expresión regular para filtrar el resultado'
      }
    ]
  },

  extract: {
    extends: 'extract_text'
  },

  screenshot: {
    title: 'Captura de Pantalla',
    icon: 'fa-camera',
    description: 'Toma una captura de la página o elemento',
    fields: [
      {
        key: 'target',
        label: 'Capturar',
        type: 'select',
        default: 'page',
        options: [
          { value: 'page', label: 'Página completa', icon: 'fas fa-desktop' },
          { value: 'viewport', label: 'Solo viewport', icon: 'fas fa-crop' },
          { value: 'element', label: 'Elemento específico', icon: 'fas fa-object-group' }
        ]
      },
      {
        key: 'selector',
        label: 'Selector del Elemento',
        type: 'selector',
        placeholder: '#elemento',
        condition: { field: 'target', value: 'element' }
      },
      {
        key: 'format',
        label: 'Formato',
        type: 'buttonGroup',
        default: 'png',
        options: [
          { value: 'png', label: 'PNG' },
          { value: 'jpeg', label: 'JPEG' },
          { value: 'webp', label: 'WebP' }
        ]
      },
      {
        key: 'quality',
        label: 'Calidad',
        type: 'slider',
        default: 80,
        min: 10,
        max: 100,
        step: 5,
        unit: '%',
        condition: { field: 'format', notValue: 'png' }
      },
      {
        key: 'path',
        label: 'Ruta de Guardado',
        type: 'file',
        placeholder: 'C:\\capturas\\screenshot.png',
        fileType: 'save'
      },
      {
        key: 'variable',
        label: 'Guardar en Variable (Base64)',
        type: 'variable',
        placeholder: 'screenshotBase64'
      }
    ]
  },

  scroll: {
    title: 'Hacer Scroll',
    icon: 'fa-arrows-alt-v',
    description: 'Realiza scroll en la página o elemento',
    fields: [
      {
        key: 'scrollType',
        label: 'Tipo de Scroll',
        type: 'select',
        default: 'pixels',
        options: [
          { value: 'pixels', label: 'Por píxeles', icon: 'fas fa-arrows-alt-v' },
          { value: 'element', label: 'Hacia elemento', icon: 'fas fa-crosshairs' },
          { value: 'top', label: 'Inicio de página', icon: 'fas fa-chevron-up' },
          { value: 'bottom', label: 'Final de página', icon: 'fas fa-chevron-down' }
        ]
      },
      {
        key: 'direction',
        label: 'Dirección',
        type: 'buttonGroup',
        default: 'down',
        options: [
          { value: 'up', label: 'Arriba' },
          { value: 'down', label: 'Abajo' }
        ],
        condition: { field: 'scrollType', value: 'pixels' }
      },
      {
        key: 'pixels',
        label: 'Píxeles',
        type: 'number',
        default: 500,
        min: 0,
        max: 10000,
        step: 100,
        condition: { field: 'scrollType', value: 'pixels' }
      },
      {
        key: 'selector',
        label: 'Selector del Elemento',
        type: 'selector',
        placeholder: '#seccion',
        condition: { field: 'scrollType', value: 'element' }
      },
      {
        key: 'behavior',
        label: 'Comportamiento',
        type: 'buttonGroup',
        default: 'smooth',
        options: [
          { value: 'smooth', label: 'Suave' },
          { value: 'instant', label: 'Instantáneo' }
        ]
      }
    ]
  },

  browser_close: {
    title: 'Cerrar Navegador',
    icon: 'fa-times-circle',
    description: 'Cierra la instancia del navegador',
    fields: [
      {
        key: 'saveSession',
        label: 'Guardar Sesión',
        type: 'toggle',
        default: false,
        helpText: 'Mantener cookies y datos para próxima ejecución'
      },
      {
        key: 'clearData',
        label: 'Limpiar Datos',
        type: 'toggle',
        default: false,
        helpText: 'Eliminar cookies, caché y datos de sesión'
      }
    ]
  },

  close_browser: {
    extends: 'browser_close'
  },

  // ==========================================
  // ACTIVE DIRECTORY
  // ==========================================
  ad_connect: {
    title: 'Conectar AD',
    icon: 'fa-server',
    description: 'Conecta con Active Directory',
    fields: [
      {
        key: 'server',
        label: 'Servidor LDAP',
        type: 'text',
        required: true,
        placeholder: 'ldap://dc.empresa.com'
      },
      {
        key: 'port',
        label: 'Puerto',
        type: 'number',
        default: 389,
        options: [
          { value: 389, label: '389 (LDAP)' },
          { value: 636, label: '636 (LDAPS)' }
        ]
      },
      {
        key: 'useSSL',
        label: 'Usar SSL/TLS',
        type: 'toggle',
        default: false
      },
      {
        key: 'baseDN',
        label: 'Base DN',
        type: 'text',
        required: true,
        placeholder: 'DC=empresa,DC=com'
      },
      {
        key: 'username',
        label: 'Usuario',
        type: 'text',
        required: true,
        placeholder: 'admin@empresa.com'
      },
      {
        key: 'password',
        label: 'Contraseña',
        type: 'password',
        required: true,
        encrypted: true
      }
    ]
  },

  ad_get_user: {
    title: 'Obtener Usuario',
    icon: 'fa-user',
    description: 'Obtiene información de un usuario del AD',
    fields: [
      {
        key: 'searchBy',
        label: 'Buscar por',
        type: 'select',
        default: 'sAMAccountName',
        options: [
          { value: 'sAMAccountName', label: 'Nombre de usuario' },
          { value: 'mail', label: 'Email' },
          { value: 'employeeID', label: 'ID de empleado' },
          { value: 'cn', label: 'Nombre completo' }
        ]
      },
      {
        key: 'searchValue',
        label: 'Valor a Buscar',
        type: 'text',
        required: true,
        placeholder: 'jperez'
      },
      {
        key: 'attributes',
        label: 'Atributos a Obtener',
        type: 'multiSelect',
        default: ['displayName', 'mail', 'department'],
        options: [
          { value: 'displayName', label: 'Nombre completo' },
          { value: 'mail', label: 'Email' },
          { value: 'department', label: 'Departamento' },
          { value: 'title', label: 'Cargo' },
          { value: 'manager', label: 'Manager' },
          { value: 'telephoneNumber', label: 'Teléfono' },
          { value: 'memberOf', label: 'Grupos' }
        ]
      },
      {
        key: 'variable',
        label: 'Guardar en Variable',
        type: 'variable',
        required: true,
        placeholder: 'usuarioAD'
      }
    ]
  },

  ad_create_user: {
    title: 'Crear Usuario',
    icon: 'fa-user-plus',
    description: 'Crea un nuevo usuario en Active Directory',
    fields: [
      {
        key: 'firstName',
        label: 'Nombre',
        type: 'text',
        required: true
      },
      {
        key: 'lastName',
        label: 'Apellido',
        type: 'text',
        required: true
      },
      {
        key: 'username',
        label: 'Nombre de Usuario',
        type: 'text',
        required: true,
        placeholder: 'jperez'
      },
      {
        key: 'email',
        label: 'Email',
        type: 'email',
        required: true
      },
      {
        key: 'password',
        label: 'Contraseña Inicial',
        type: 'password',
        required: true
      },
      {
        key: 'ou',
        label: 'Unidad Organizativa',
        type: 'text',
        placeholder: 'OU=Usuarios,DC=empresa,DC=com'
      },
      {
        key: 'department',
        label: 'Departamento',
        type: 'text'
      },
      {
        key: 'title',
        label: 'Cargo',
        type: 'text'
      },
      {
        key: 'mustChangePassword',
        label: 'Cambiar contraseña al iniciar',
        type: 'toggle',
        default: true
      },
      {
        key: 'enabled',
        label: 'Cuenta habilitada',
        type: 'toggle',
        default: true
      }
    ]
  },

  ad_disable_user: {
    title: 'Deshabilitar Usuario',
    icon: 'fa-user-lock',
    description: 'Deshabilita una cuenta de usuario',
    fields: [
      {
        key: 'username',
        label: 'Usuario',
        type: 'text',
        required: true
      },
      {
        key: 'moveToDisabled',
        label: 'Mover a OU de deshabilitados',
        type: 'toggle',
        default: false
      },
      {
        key: 'disabledOU',
        label: 'OU de Destino',
        type: 'text',
        placeholder: 'OU=Deshabilitados,DC=empresa,DC=com',
        condition: { field: 'moveToDisabled', value: true }
      },
      {
        key: 'removeGroups',
        label: 'Eliminar de todos los grupos',
        type: 'toggle',
        default: false
      }
    ]
  },

  ad_add_to_group: {
    title: 'Agregar a Grupo',
    icon: 'fa-users',
    description: 'Agrega un usuario a un grupo de AD',
    fields: [
      {
        key: 'username',
        label: 'Usuario',
        type: 'text',
        required: true
      },
      {
        key: 'group',
        label: 'Grupo',
        type: 'text',
        required: true,
        placeholder: 'CN=Grupo,OU=Grupos,DC=empresa,DC=com'
      }
    ]
  },

  // ==========================================
  // INTELIGENCIA ARTIFICIAL
  // ==========================================
  ai_text_generation: {
    title: 'Generar Texto',
    icon: 'fa-robot',
    description: 'Genera texto usando IA',
    fields: [
      {
        key: 'provider',
        label: 'Proveedor de IA',
        type: 'select',
        required: true,
        options: [
          { value: 'openai', label: 'OpenAI (GPT)', icon: 'fas fa-brain' },
          { value: 'anthropic', label: 'Anthropic (Claude)', icon: 'fas fa-robot' },
          { value: 'google', label: 'Google (Gemini)', icon: 'fab fa-google' },
          { value: 'azure', label: 'Azure OpenAI', icon: 'fab fa-microsoft' }
        ]
      },
      {
        key: 'model',
        label: 'Modelo',
        type: 'select',
        required: true,
        dependsOn: 'provider',
        optionsMap: {
          openai: [
            { value: 'gpt-4o', label: 'GPT-4o (Recomendado)' },
            { value: 'gpt-4o-mini', label: 'GPT-4o Mini' },
            { value: 'gpt-4', label: 'GPT-4' },
            { value: 'gpt-3.5-turbo', label: 'GPT-3.5 Turbo' }
          ],
          anthropic: [
            { value: 'claude-3-opus-20240229', label: 'Claude 3 Opus' },
            { value: 'claude-3-sonnet-20240229', label: 'Claude 3 Sonnet' },
            { value: 'claude-3-haiku-20240307', label: 'Claude 3 Haiku' }
          ],
          google: [
            { value: 'gemini-pro', label: 'Gemini Pro' },
            { value: 'gemini-pro-vision', label: 'Gemini Pro Vision' }
          ],
          azure: [
            { value: 'gpt-4', label: 'GPT-4 (Azure)' },
            { value: 'gpt-35-turbo', label: 'GPT-3.5 Turbo (Azure)' }
          ]
        }
      },
      {
        key: 'prompt',
        label: 'Prompt',
        type: 'textarea',
        required: true,
        rows: 5,
        placeholder: 'Escribe tu prompt aquí...'
      },
      {
        key: 'systemPrompt',
        label: 'System Prompt',
        type: 'textarea',
        rows: 3,
        placeholder: 'Instrucciones del sistema (opcional)',
        advanced: true
      },
      {
        key: 'temperature',
        label: 'Temperatura',
        type: 'slider',
        default: 0.7,
        min: 0,
        max: 2,
        step: 0.1,
        helpText: 'Mayor = más creativo, Menor = más preciso'
      },
      {
        key: 'maxTokens',
        label: 'Máximo de Tokens',
        type: 'number',
        default: 1000,
        min: 100,
        max: 8000,
        step: 100
      },
      {
        key: 'variable',
        label: 'Guardar Respuesta en',
        type: 'variable',
        required: true,
        placeholder: 'respuestaIA'
      }
    ]
  },

  ai_sentiment: {
    title: 'Análisis de Sentimiento',
    icon: 'fa-smile',
    description: 'Analiza el sentimiento de un texto',
    fields: [
      {
        key: 'text',
        label: 'Texto a Analizar',
        type: 'textarea',
        required: true,
        rows: 4
      },
      {
        key: 'language',
        label: 'Idioma',
        type: 'select',
        default: 'es',
        options: [
          { value: 'es', label: 'Español' },
          { value: 'en', label: 'Inglés' },
          { value: 'auto', label: 'Detectar automático' }
        ]
      },
      {
        key: 'variable',
        label: 'Guardar Resultado en',
        type: 'variable',
        required: true,
        placeholder: 'sentimiento'
      }
    ]
  },

  ai_classification: {
    title: 'Clasificación',
    icon: 'fa-tags',
    description: 'Clasifica texto en categorías',
    fields: [
      {
        key: 'text',
        label: 'Texto a Clasificar',
        type: 'textarea',
        required: true,
        rows: 4
      },
      {
        key: 'categories',
        label: 'Categorías',
        type: 'tags',
        required: true,
        placeholder: 'Agregar categoría...',
        helpText: 'Presiona Enter para agregar cada categoría'
      },
      {
        key: 'multiLabel',
        label: 'Permitir múltiples categorías',
        type: 'toggle',
        default: false
      },
      {
        key: 'variable',
        label: 'Guardar Clasificación en',
        type: 'variable',
        required: true
      }
    ]
  },

  ai_translation: {
    title: 'Traducción',
    icon: 'fa-language',
    description: 'Traduce texto entre idiomas',
    fields: [
      {
        key: 'text',
        label: 'Texto a Traducir',
        type: 'textarea',
        required: true,
        rows: 4
      },
      {
        key: 'sourceLanguage',
        label: 'Idioma Origen',
        type: 'select',
        default: 'auto',
        options: [
          { value: 'auto', label: 'Detectar automático' },
          { value: 'es', label: 'Español' },
          { value: 'en', label: 'Inglés' },
          { value: 'fr', label: 'Francés' },
          { value: 'de', label: 'Alemán' },
          { value: 'pt', label: 'Portugués' },
          { value: 'it', label: 'Italiano' },
          { value: 'zh', label: 'Chino' },
          { value: 'ja', label: 'Japonés' }
        ]
      },
      {
        key: 'targetLanguage',
        label: 'Idioma Destino',
        type: 'select',
        required: true,
        options: [
          { value: 'es', label: 'Español' },
          { value: 'en', label: 'Inglés' },
          { value: 'fr', label: 'Francés' },
          { value: 'de', label: 'Alemán' },
          { value: 'pt', label: 'Portugués' },
          { value: 'it', label: 'Italiano' },
          { value: 'zh', label: 'Chino' },
          { value: 'ja', label: 'Japonés' }
        ]
      },
      {
        key: 'variable',
        label: 'Guardar Traducción en',
        type: 'variable',
        required: true
      }
    ]
  },

  ai_ocr: {
    title: 'OCR con IA',
    icon: 'fa-file-image',
    description: 'Extrae texto de imágenes usando IA',
    fields: [
      {
        key: 'source',
        label: 'Origen de Imagen',
        type: 'select',
        default: 'file',
        options: [
          { value: 'file', label: 'Archivo' },
          { value: 'variable', label: 'Variable (Base64)' },
          { value: 'screenshot', label: 'Captura de pantalla' }
        ]
      },
      {
        key: 'filePath',
        label: 'Ruta del Archivo',
        type: 'file',
        fileType: 'open',
        accept: '.png,.jpg,.jpeg,.gif,.bmp,.webp',
        condition: { field: 'source', value: 'file' }
      },
      {
        key: 'imageVariable',
        label: 'Variable de Imagen',
        type: 'variable',
        condition: { field: 'source', value: 'variable' }
      },
      {
        key: 'language',
        label: 'Idioma del Texto',
        type: 'select',
        default: 'es',
        options: [
          { value: 'es', label: 'Español' },
          { value: 'en', label: 'Inglés' },
          { value: 'auto', label: 'Detectar automático' }
        ]
      },
      {
        key: 'variable',
        label: 'Guardar Texto en',
        type: 'variable',
        required: true
      }
    ]
  },

  ai_chat: {
    title: 'Chat IA',
    icon: 'fa-robot',
    description: 'Interactúa con un modelo de chat IA',
    fields: [
      {
        key: 'provider',
        label: 'Proveedor',
        type: 'select',
        required: true,
        options: [
          { value: 'openai', label: 'OpenAI' },
          { value: 'anthropic', label: 'Anthropic' }
        ]
      },
      {
        key: 'message',
        label: 'Mensaje',
        type: 'textarea',
        required: true,
        rows: 4
      },
      {
        key: 'conversationId',
        label: 'ID de Conversación',
        type: 'variable',
        helpText: 'Para mantener contexto entre mensajes'
      },
      {
        key: 'variable',
        label: 'Guardar Respuesta en',
        type: 'variable',
        required: true
      }
    ]
  },

  ai_image_analysis: {
    title: 'Análisis de Imagen',
    icon: 'fa-image',
    description: 'Analiza imágenes usando inteligencia artificial para detectar objetos, texto, rostros y más',
    fields: [
      {
        key: 'source',
        label: 'Origen de la imagen',
        type: 'select',
        required: true,
        default: 'file',
        options: [
          { value: 'file', label: 'Archivo local' },
          { value: 'url', label: 'URL de imagen' },
          { value: 'screenshot', label: 'Captura de pantalla' },
          { value: 'variable', label: 'Variable (Base64)' },
          { value: 'clipboard', label: 'Portapapeles' }
        ]
      },
      {
        key: 'imagePath',
        label: 'Ruta de imagen',
        type: 'fileWithVariable',
        required: true,
        fileType: 'open',
        accept: '.png,.jpg,.jpeg,.bmp,.gif,.tiff,.webp',
        condition: { field: 'source', value: 'file' }
      },
      {
        key: 'imageUrl',
        label: 'URL de la imagen',
        type: 'url',
        required: true,
        placeholder: 'https://ejemplo.com/imagen.jpg',
        condition: { field: 'source', value: 'url' }
      },
      {
        key: 'imageVariable',
        label: 'Variable con imagen',
        type: 'variableSelect',
        condition: { field: 'source', value: 'variable' }
      },
      {
        key: 'analysisType',
        label: 'Tipo de análisis',
        type: 'multiSelect',
        default: ['objects'],
        options: [
          { value: 'objects', label: 'Detectar objetos' },
          { value: 'text', label: 'Extraer texto (OCR)' },
          { value: 'faces', label: 'Detectar rostros' },
          { value: 'colors', label: 'Análisis de colores' },
          { value: 'labels', label: 'Etiquetas/Tags' },
          { value: 'description', label: 'Descripción general' },
          { value: 'nsfw', label: 'Detección de contenido' },
          { value: 'barcode', label: 'Códigos de barras/QR' }
        ]
      },
      {
        key: 'aiProvider',
        label: 'Proveedor de IA',
        type: 'select',
        default: 'openai',
        options: [
          { value: 'openai', label: 'OpenAI (GPT-4 Vision)' },
          { value: 'google', label: 'Google Vision AI' },
          { value: 'azure', label: 'Azure Computer Vision' },
          { value: 'aws', label: 'AWS Rekognition' },
          { value: 'claude', label: 'Claude (Anthropic)' },
          { value: 'local', label: 'Modelo local (Ollama)' }
        ]
      },
      {
        key: 'apiKey',
        label: 'API Key',
        type: 'password',
        helpText: 'Clave de API del proveedor seleccionado'
      },
      {
        key: 'prompt',
        label: 'Instrucciones adicionales',
        type: 'textarea',
        rows: 3,
        placeholder: 'Ej: Describe qué productos aparecen en la imagen y sus precios',
        helpText: 'Instrucción específica para el análisis (opcional)'
      },
      {
        key: 'language',
        label: 'Idioma de respuesta',
        type: 'select',
        default: 'es',
        options: [
          { value: 'es', label: 'Español' },
          { value: 'en', label: 'Inglés' },
          { value: 'pt', label: 'Portugués' },
          { value: 'auto', label: 'Automático' }
        ]
      },
      {
        key: 'confidence',
        label: 'Confianza mínima',
        type: 'slider',
        default: 0.7,
        min: 0.1,
        max: 1,
        step: 0.05,
        helpText: 'Solo incluir resultados con esta confianza o superior',
        advanced: true
      },
      {
        key: 'maxResults',
        label: 'Máximo de resultados',
        type: 'number',
        default: 10,
        min: 1,
        max: 100,
        advanced: true
      },
      {
        key: 'variable',
        label: 'Guardar resultado en',
        type: 'variable',
        required: true,
        helpText: 'Objeto con: labels[], text, faces[], objects[], description'
      }
    ]
  },

  ai_document_understanding: {
    title: 'Comprensión de Documentos',
    icon: 'fa-file-contract',
    description: 'Analiza documentos complejos (facturas, contratos, formularios) con IA',
    fields: [
      {
        key: 'documentPath',
        label: 'Documento',
        type: 'fileWithVariable',
        required: true,
        fileType: 'open',
        accept: '.pdf,.docx,.xlsx,.jpg,.png,.tiff'
      },
      {
        key: 'documentType',
        label: 'Tipo de documento',
        type: 'select',
        default: 'auto',
        options: [
          { value: 'auto', label: 'Detectar automáticamente' },
          { value: 'invoice', label: 'Factura' },
          { value: 'receipt', label: 'Recibo/Ticket' },
          { value: 'contract', label: 'Contrato' },
          { value: 'id_card', label: 'Documento de identidad' },
          { value: 'form', label: 'Formulario' },
          { value: 'table', label: 'Tabla/Planilla' },
          { value: 'letter', label: 'Carta/Correspondencia' }
        ]
      },
      {
        key: 'extractFields',
        label: 'Campos a extraer',
        type: 'tags',
        placeholder: 'Ej: total, fecha, proveedor, items',
        helpText: 'Nombres de campos específicos a extraer del documento'
      },
      {
        key: 'aiProvider',
        label: 'Proveedor',
        type: 'select',
        default: 'openai',
        options: [
          { value: 'openai', label: 'OpenAI' },
          { value: 'azure', label: 'Azure Form Recognizer' },
          { value: 'google', label: 'Google Document AI' },
          { value: 'aws', label: 'AWS Textract' }
        ]
      },
      {
        key: 'language',
        label: 'Idioma del documento',
        type: 'select',
        default: 'es',
        options: [
          { value: 'es', label: 'Español' },
          { value: 'en', label: 'Inglés' },
          { value: 'pt', label: 'Portugués' },
          { value: 'auto', label: 'Detectar' }
        ]
      },
      {
        key: 'outputFormat',
        label: 'Formato de salida',
        type: 'select',
        default: 'json',
        options: [
          { value: 'json', label: 'JSON estructurado' },
          { value: 'text', label: 'Texto plano' },
          { value: 'table', label: 'Tabla (filas/columnas)' },
          { value: 'keyvalue', label: 'Pares clave-valor' }
        ]
      },
      {
        key: 'variable',
        label: 'Guardar resultado en',
        type: 'variable',
        required: true
      }
    ]
  },

  ai_extract_entities: {
    title: 'Extraer Entidades',
    icon: 'fa-project-diagram',
    description: 'Extrae entidades nombradas (personas, lugares, fechas, montos) de texto',
    fields: [
      {
        key: 'inputType',
        label: 'Origen del texto',
        type: 'select',
        default: 'text',
        options: [
          { value: 'text', label: 'Texto directo' },
          { value: 'variable', label: 'Variable' },
          { value: 'file', label: 'Archivo' }
        ]
      },
      {
        key: 'text',
        label: 'Texto a analizar',
        type: 'textarea',
        rows: 4,
        condition: { field: 'inputType', value: 'text' }
      },
      {
        key: 'inputVariable',
        label: 'Variable con texto',
        type: 'variableSelect',
        condition: { field: 'inputType', value: 'variable' }
      },
      {
        key: 'filePath',
        label: 'Archivo',
        type: 'file',
        fileType: 'open',
        accept: '.txt,.pdf,.docx',
        condition: { field: 'inputType', value: 'file' }
      },
      {
        key: 'entityTypes',
        label: 'Tipos de entidad a extraer',
        type: 'multiSelect',
        default: ['person', 'organization', 'date', 'money'],
        options: [
          { value: 'person', label: 'Personas' },
          { value: 'organization', label: 'Organizaciones' },
          { value: 'location', label: 'Ubicaciones' },
          { value: 'date', label: 'Fechas' },
          { value: 'money', label: 'Montos/Precios' },
          { value: 'email', label: 'Emails' },
          { value: 'phone', label: 'Teléfonos' },
          { value: 'url', label: 'URLs' },
          { value: 'product', label: 'Productos' },
          { value: 'custom', label: 'Personalizado' }
        ]
      },
      {
        key: 'customEntities',
        label: 'Entidades personalizadas',
        type: 'tags',
        placeholder: 'Ej: número de factura, SKU, código postal',
        condition: { field: 'entityTypes', value: 'custom' },
        helpText: 'Define tipos de entidad específicos para tu caso'
      },
      {
        key: 'language',
        label: 'Idioma',
        type: 'select',
        default: 'es',
        options: [
          { value: 'es', label: 'Español' },
          { value: 'en', label: 'Inglés' },
          { value: 'pt', label: 'Portugués' },
          { value: 'auto', label: 'Detectar' }
        ]
      },
      {
        key: 'variable',
        label: 'Guardar entidades en',
        type: 'variable',
        required: true,
        helpText: 'Array de {type, value, position, confidence}'
      }
    ]
  },

  ai_summarize: {
    title: 'Resumir Texto',
    icon: 'fa-compress-alt',
    description: 'Genera un resumen de texto largo usando IA',
    fields: [
      {
        key: 'inputType',
        label: 'Origen',
        type: 'select',
        default: 'text',
        options: [
          { value: 'text', label: 'Texto directo' },
          { value: 'variable', label: 'Variable' },
          { value: 'file', label: 'Archivo' },
          { value: 'url', label: 'Página web' }
        ]
      },
      {
        key: 'text',
        label: 'Texto a resumir',
        type: 'textarea',
        rows: 5,
        condition: { field: 'inputType', value: 'text' }
      },
      {
        key: 'inputVariable',
        label: 'Variable con texto',
        type: 'variableSelect',
        condition: { field: 'inputType', value: 'variable' }
      },
      {
        key: 'filePath',
        label: 'Archivo',
        type: 'file',
        fileType: 'open',
        accept: '.txt,.pdf,.docx,.html',
        condition: { field: 'inputType', value: 'file' }
      },
      {
        key: 'pageUrl',
        label: 'URL',
        type: 'url',
        placeholder: 'https://...',
        condition: { field: 'inputType', value: 'url' }
      },
      {
        key: 'summaryLength',
        label: 'Longitud del resumen',
        type: 'select',
        default: 'medium',
        options: [
          { value: 'brief', label: 'Breve (1-2 oraciones)' },
          { value: 'medium', label: 'Medio (1 párrafo)' },
          { value: 'detailed', label: 'Detallado (varios párrafos)' },
          { value: 'bullets', label: 'Puntos clave (lista)' }
        ]
      },
      {
        key: 'language',
        label: 'Idioma del resumen',
        type: 'select',
        default: 'es',
        options: [
          { value: 'es', label: 'Español' },
          { value: 'en', label: 'Inglés' },
          { value: 'same', label: 'Mismo que el original' }
        ]
      },
      {
        key: 'variable',
        label: 'Guardar resumen en',
        type: 'variable',
        required: true
      }
    ]
  },

  ai_analyze: {
    title: 'Analizar Documento',
    icon: 'fa-search-plus',
    description: 'Analiza documentos con IA',
    fields: [
      {
        key: 'documentPath',
        label: 'Documento',
        type: 'file',
        fileType: 'open',
        accept: '.pdf,.docx,.txt'
      },
      {
        key: 'analysisType',
        label: 'Tipo de Análisis',
        type: 'select',
        default: 'summary',
        options: [
          { value: 'summary', label: 'Resumen' },
          { value: 'extract', label: 'Extracción de datos' },
          { value: 'qa', label: 'Preguntas y respuestas' }
        ]
      },
      {
        key: 'prompt',
        label: 'Instrucciones/Pregunta',
        type: 'textarea',
        rows: 3
      },
      {
        key: 'variable',
        label: 'Guardar Resultado en',
        type: 'variable',
        required: true
      }
    ]
  },

  // ==========================================
  // BASE DE DATOS
  // ==========================================
  db_connect: {
    title: 'Conectar Base de Datos',
    icon: 'fa-plug',
    description: 'Establece conexión con una base de datos',
    fields: [
      {
        key: 'dbType',
        label: 'Tipo de Base de Datos',
        type: 'select',
        required: true,
        options: [
          { value: 'mysql', label: 'MySQL', icon: 'fas fa-database' },
          { value: 'postgresql', label: 'PostgreSQL', icon: 'fas fa-database' },
          { value: 'mssql', label: 'SQL Server', icon: 'fab fa-microsoft' },
          { value: 'oracle', label: 'Oracle', icon: 'fas fa-database' },
          { value: 'mongodb', label: 'MongoDB', icon: 'fas fa-leaf' }
        ]
      },
      {
        key: 'host',
        label: 'Servidor',
        type: 'text',
        required: true,
        placeholder: 'localhost o IP'
      },
      {
        key: 'port',
        label: 'Puerto',
        type: 'number',
        dependsOn: 'dbType',
        defaultMap: {
          mysql: 3306,
          postgresql: 5432,
          mssql: 1433,
          oracle: 1521,
          mongodb: 27017
        }
      },
      {
        key: 'database',
        label: 'Base de Datos',
        type: 'text',
        required: true
      },
      {
        key: 'username',
        label: 'Usuario',
        type: 'text',
        required: true
      },
      {
        key: 'password',
        label: 'Contraseña',
        type: 'password',
        required: true,
        encrypted: true
      },
      {
        key: 'connectionName',
        label: 'Nombre de Conexión',
        type: 'text',
        placeholder: 'conexionPrincipal',
        helpText: 'Identificador para usar en otras acciones'
      },
      {
        key: 'ssl',
        label: 'Usar SSL',
        type: 'toggle',
        default: false,
        advanced: true
      }
    ]
  },

  db_query: {
    title: 'Ejecutar Consulta',
    icon: 'fa-search',
    description: 'Ejecuta una consulta SQL SELECT',
    fields: [
      {
        key: 'connection',
        label: 'Conexión',
        type: 'variable',
        placeholder: 'conexionPrincipal'
      },
      {
        key: 'query',
        label: 'Consulta SQL',
        type: 'code',
        language: 'sql',
        required: true,
        placeholder: 'SELECT * FROM tabla WHERE condicion = ?'
      },
      {
        key: 'parameters',
        label: 'Parámetros',
        type: 'keyValue',
        helpText: 'Parámetros para prevenir SQL injection'
      },
      {
        key: 'variable',
        label: 'Guardar Resultados en',
        type: 'variable',
        required: true,
        placeholder: 'resultadosQuery'
      },
      {
        key: 'timeout',
        label: 'Timeout (segundos)',
        type: 'number',
        default: 30,
        min: 5,
        max: 300
      }
    ]
  },

  db_insert: {
    title: 'Insertar Datos',
    icon: 'fa-plus-circle',
    description: 'Inserta registros en una tabla',
    fields: [
      {
        key: 'connection',
        label: 'Conexión',
        type: 'variable'
      },
      {
        key: 'table',
        label: 'Tabla',
        type: 'text',
        required: true
      },
      {
        key: 'data',
        label: 'Datos',
        type: 'keyValue',
        required: true,
        helpText: 'Columna: Valor'
      },
      {
        key: 'returnId',
        label: 'Obtener ID insertado',
        type: 'toggle',
        default: true
      },
      {
        key: 'variable',
        label: 'Guardar ID en',
        type: 'variable',
        condition: { field: 'returnId', value: true }
      }
    ]
  },

  db_update: {
    title: 'Actualizar Datos',
    icon: 'fa-edit',
    description: 'Actualiza registros en una tabla',
    fields: [
      {
        key: 'connection',
        label: 'Conexión',
        type: 'variable'
      },
      {
        key: 'table',
        label: 'Tabla',
        type: 'text',
        required: true
      },
      {
        key: 'data',
        label: 'Datos a Actualizar',
        type: 'keyValue',
        required: true
      },
      {
        key: 'where',
        label: 'Condición WHERE',
        type: 'text',
        required: true,
        placeholder: 'id = ?'
      },
      {
        key: 'parameters',
        label: 'Parámetros WHERE',
        type: 'keyValue'
      }
    ]
  },

  db_disconnect: {
    title: 'Desconectar',
    icon: 'fa-unlink',
    description: 'Cierra la conexión a la base de datos',
    fields: [
      {
        key: 'connection',
        label: 'Conexión',
        type: 'variable'
      }
    ]
  },

  // ==========================================
  // ARCHIVOS
  // ==========================================
  file_read: {
    title: 'Leer Archivo',
    icon: 'fa-file-alt',
    description: 'Lee el contenido de un archivo',
    fields: [
      {
        key: 'path',
        label: 'Ruta del Archivo',
        type: 'fileWithVariable',
        required: true,
        placeholder: 'C:\\ruta\\archivo.txt o ${variable}',
        allowedTypes: ['file', 'string']
      },
      {
        key: 'encoding',
        label: 'Codificación',
        type: 'select',
        default: 'utf-8',
        options: [
          { value: 'utf-8', label: 'UTF-8' },
          { value: 'ascii', label: 'ASCII' },
          { value: 'latin1', label: 'Latin-1' },
          { value: 'utf-16', label: 'UTF-16' }
        ]
      },
      {
        key: 'readAs',
        label: 'Leer como',
        type: 'select',
        default: 'text',
        options: [
          { value: 'text', label: 'Texto' },
          { value: 'lines', label: 'Array de líneas' },
          { value: 'json', label: 'JSON' },
          { value: 'binary', label: 'Binario (Base64)' }
        ]
      },
      {
        key: 'variable',
        label: 'Guardar en Variable',
        type: 'variable',
        required: true
      }
    ]
  },

  file_write: {
    title: 'Escribir Archivo',
    icon: 'fa-file-edit',
    description: 'Escribe contenido en un archivo',
    fields: [
      {
        key: 'path',
        label: 'Ruta del Archivo',
        type: 'fileWithVariable',
        required: true,
        placeholder: 'C:\\ruta\\archivo.txt o ${variable}',
        allowedTypes: ['file', 'string']
      },
      {
        key: 'content',
        label: 'Contenido',
        type: 'textarea',
        required: true,
        rows: 5
      },
      {
        key: 'mode',
        label: 'Modo de Escritura',
        type: 'select',
        default: 'overwrite',
        options: [
          { value: 'overwrite', label: 'Sobrescribir' },
          { value: 'append', label: 'Agregar al final' },
          { value: 'prepend', label: 'Agregar al inicio' }
        ]
      },
      {
        key: 'encoding',
        label: 'Codificación',
        type: 'select',
        default: 'utf-8',
        options: [
          { value: 'utf-8', label: 'UTF-8' },
          { value: 'ascii', label: 'ASCII' },
          { value: 'latin1', label: 'Latin-1' }
        ]
      },
      {
        key: 'createPath',
        label: 'Crear carpetas si no existen',
        type: 'toggle',
        default: true
      }
    ]
  },

  file_copy: {
    title: 'Copiar Archivo',
    icon: 'fa-copy',
    description: 'Copia un archivo a otra ubicación',
    fields: [
      {
        key: 'source',
        label: 'Archivo Origen',
        type: 'fileWithVariable',
        required: true,
        placeholder: 'C:\\ruta\\origen.txt o ${variable}',
        allowedTypes: ['file', 'string']
      },
      {
        key: 'destination',
        label: 'Destino',
        type: 'fileWithVariable',
        required: true,
        placeholder: 'C:\\ruta\\destino.txt o ${variable}',
        allowedTypes: ['file', 'string']
      },
      {
        key: 'overwrite',
        label: 'Sobrescribir si existe',
        type: 'toggle',
        default: false
      }
    ]
  },

  file_move: {
    title: 'Mover Archivo',
    icon: 'fa-file-export',
    description: 'Mueve un archivo a otra ubicación',
    fields: [
      {
        key: 'source',
        label: 'Archivo Origen',
        type: 'fileWithVariable',
        required: true,
        placeholder: 'C:\\ruta\\origen.txt o ${variable}',
        allowedTypes: ['file', 'string']
      },
      {
        key: 'destination',
        label: 'Destino',
        type: 'fileWithVariable',
        required: true,
        placeholder: 'C:\\ruta\\destino.txt o ${variable}',
        allowedTypes: ['file', 'string']
      },
      {
        key: 'overwrite',
        label: 'Sobrescribir si existe',
        type: 'toggle',
        default: false
      }
    ]
  },

  file_delete: {
    title: 'Eliminar Archivo',
    icon: 'fa-trash',
    description: 'Elimina un archivo',
    fields: [
      {
        key: 'path',
        label: 'Archivo a Eliminar',
        type: 'fileWithVariable',
        required: true,
        placeholder: 'C:\\ruta\\archivo.txt o ${variable}',
        allowedTypes: ['file', 'string']
      },
      {
        key: 'permanent',
        label: 'Eliminar permanentemente',
        type: 'toggle',
        default: false,
        helpText: 'Si está desactivado, se moverá a la papelera'
      }
    ]
  },

  file_exists: {
    title: 'Archivo Existe',
    icon: 'fa-question-circle',
    description: 'Verifica si un archivo existe',
    fields: [
      {
        key: 'path',
        label: 'Ruta del Archivo',
        type: 'fileWithVariable',
        required: true,
        placeholder: 'C:\\ruta\\archivo.txt o ${variable}',
        allowedTypes: ['file', 'string']
      },
      {
        key: 'variable',
        label: 'Guardar Resultado en',
        type: 'variable',
        required: true,
        helpText: 'true si existe, false si no'
      }
    ]
  },

  // ==========================================
  // CORREO ELECTRÓNICO
  // ==========================================
  email_send: {
    title: 'Enviar Email',
    icon: 'fa-paper-plane',
    description: 'Envía un correo electrónico',
    fields: [
      {
        key: 'provider',
        label: 'Proveedor',
        type: 'select',
        default: 'smtp',
        options: [
          { value: 'smtp', label: 'SMTP Personalizado' },
          { value: 'outlook', label: 'Microsoft Outlook' },
          { value: 'gmail', label: 'Gmail' }
        ]
      },
      {
        key: 'smtpServer',
        label: 'Servidor SMTP',
        type: 'text',
        condition: { field: 'provider', value: 'smtp' },
        placeholder: 'smtp.empresa.com'
      },
      {
        key: 'smtpPort',
        label: 'Puerto',
        type: 'number',
        default: 587,
        condition: { field: 'provider', value: 'smtp' }
      },
      {
        key: 'to',
        label: 'Destinatario(s)',
        type: 'tags',
        required: true,
        placeholder: 'email@ejemplo.com'
      },
      {
        key: 'cc',
        label: 'CC',
        type: 'tags',
        placeholder: 'email@ejemplo.com'
      },
      {
        key: 'bcc',
        label: 'CCO',
        type: 'tags',
        placeholder: 'email@ejemplo.com'
      },
      {
        key: 'subject',
        label: 'Asunto',
        type: 'text',
        required: true
      },
      {
        key: 'body',
        label: 'Cuerpo del Mensaje',
        type: 'richtext',
        required: true
      },
      {
        key: 'isHtml',
        label: 'Formato HTML',
        type: 'toggle',
        default: true
      },
      {
        key: 'attachments',
        label: 'Adjuntos',
        type: 'fileList',
        multiple: true
      },
      {
        key: 'priority',
        label: 'Prioridad',
        type: 'select',
        default: 'normal',
        options: [
          { value: 'high', label: 'Alta' },
          { value: 'normal', label: 'Normal' },
          { value: 'low', label: 'Baja' }
        ]
      }
    ]
  },

  email_read: {
    title: 'Leer Email',
    icon: 'fa-envelope-open',
    description: 'Lee correos electrónicos',
    fields: [
      {
        key: 'provider',
        label: 'Proveedor',
        type: 'select',
        default: 'imap',
        options: [
          { value: 'imap', label: 'IMAP' },
          { value: 'outlook', label: 'Microsoft Outlook' },
          { value: 'gmail', label: 'Gmail' }
        ]
      },
      {
        key: 'folder',
        label: 'Carpeta',
        type: 'text',
        default: 'INBOX'
      },
      {
        key: 'filter',
        label: 'Filtrar por',
        type: 'select',
        default: 'unread',
        options: [
          { value: 'all', label: 'Todos' },
          { value: 'unread', label: 'No leídos' },
          { value: 'today', label: 'De hoy' },
          { value: 'subject', label: 'Por asunto' },
          { value: 'from', label: 'Por remitente' }
        ]
      },
      {
        key: 'filterValue',
        label: 'Valor del Filtro',
        type: 'text',
        condition: { field: 'filter', inValues: ['subject', 'from'] }
      },
      {
        key: 'limit',
        label: 'Máximo de Correos',
        type: 'number',
        default: 10,
        min: 1,
        max: 100
      },
      {
        key: 'variable',
        label: 'Guardar en Variable',
        type: 'variable',
        required: true
      }
    ]
  },

  email_download_attachment: {
    title: 'Descargar Adjunto',
    icon: 'fa-paperclip',
    description: 'Descarga adjuntos de un correo',
    fields: [
      {
        key: 'emailVariable',
        label: 'Variable del Email',
        type: 'variable',
        required: true
      },
      {
        key: 'filter',
        label: 'Filtrar Adjuntos',
        type: 'text',
        placeholder: '*.pdf, *.xlsx'
      },
      {
        key: 'savePath',
        label: 'Carpeta de Destino',
        type: 'file',
        fileType: 'folder',
        required: true
      },
      {
        key: 'overwrite',
        label: 'Sobrescribir existentes',
        type: 'toggle',
        default: false
      }
    ]
  },

  // ==========================================
  // CONTROL DE FLUJO
  // ==========================================

  // Step Group - Contenedor para organizar acciones (solo visual en desarrollo)
  step_group: {
    title: 'Step (Grupo)',
    icon: 'fa-layer-group',
    description: 'Contenedor para agrupar y organizar acciones. Solo visible en desarrollo.',
    isContainer: true,
    fields: [
      {
        key: 'name',
        label: 'Título del Step',
        type: 'text',
        required: true,
        placeholder: 'Ej: Inicialización, Procesamiento, Limpieza...',
        helpText: 'Nombre descriptivo para identificar este grupo de acciones'
      },
      {
        key: 'description',
        label: 'Descripción',
        type: 'textarea',
        placeholder: 'Descripción opcional del propósito de este grupo',
        rows: 2
      },
      {
        key: 'color',
        label: 'Color',
        type: 'select',
        default: 'blue',
        options: [
          { value: 'blue', label: 'Azul' },
          { value: 'green', label: 'Verde' },
          { value: 'orange', label: 'Naranja' },
          { value: 'purple', label: 'Morado' },
          { value: 'red', label: 'Rojo' },
          { value: 'gray', label: 'Gris' }
        ],
        helpText: 'Color del borde izquierdo para identificar visualmente'
      },
      {
        key: 'collapsed',
        label: 'Iniciar colapsado',
        type: 'checkbox',
        default: false,
        helpText: 'Si está marcado, el grupo aparecerá colapsado al abrir el flujo'
      }
    ]
  },

  if_condition: {
    title: 'Si / Condición',
    icon: 'fa-question',
    description: 'Ejecuta acciones basadas en una condición',
    fields: [
      {
        key: 'leftOperand',
        label: 'Valor Izquierdo',
        type: 'expression',
        required: true,
        placeholder: 'variable o valor'
      },
      {
        key: 'operator',
        label: 'Operador',
        type: 'select',
        required: true,
        options: [
          { value: '==', label: 'Igual a (==)' },
          { value: '!=', label: 'Diferente de (!=)' },
          { value: '>', label: 'Mayor que (>)' },
          { value: '>=', label: 'Mayor o igual (>=)' },
          { value: '<', label: 'Menor que (<)' },
          { value: '<=', label: 'Menor o igual (<=)' },
          { value: 'contains', label: 'Contiene' },
          { value: 'startsWith', label: 'Empieza con' },
          { value: 'endsWith', label: 'Termina con' },
          { value: 'matches', label: 'Coincide (regex)' },
          { value: 'isEmpty', label: 'Está vacío' },
          { value: 'isNotEmpty', label: 'No está vacío' }
        ]
      },
      {
        key: 'rightOperand',
        label: 'Valor Derecho',
        type: 'expression',
        placeholder: 'variable o valor',
        condition: { field: 'operator', notInValues: ['isEmpty', 'isNotEmpty'] }
      },
      {
        key: 'caseSensitive',
        label: 'Distinguir mayúsculas',
        type: 'toggle',
        default: false,
        condition: { field: 'operator', inValues: ['contains', 'startsWith', 'endsWith'] }
      }
    ]
  },

  for_loop: {
    title: 'Bucle For',
    icon: 'fa-redo',
    description: 'Repite acciones un número determinado de veces',
    fields: [
      {
        key: 'loopType',
        label: 'Tipo de Bucle',
        type: 'select',
        default: 'count',
        options: [
          { value: 'count', label: 'Número de repeticiones' },
          { value: 'range', label: 'Rango de valores' },
          { value: 'collection', label: 'Iterar colección' }
        ]
      },
      {
        key: 'count',
        label: 'Repeticiones',
        type: 'number',
        default: 10,
        min: 1,
        condition: { field: 'loopType', value: 'count' }
      },
      {
        key: 'start',
        label: 'Inicio',
        type: 'number',
        default: 0,
        condition: { field: 'loopType', value: 'range' }
      },
      {
        key: 'end',
        label: 'Fin',
        type: 'number',
        default: 10,
        condition: { field: 'loopType', value: 'range' }
      },
      {
        key: 'step',
        label: 'Incremento',
        type: 'number',
        default: 1,
        condition: { field: 'loopType', value: 'range' }
      },
      {
        key: 'collection',
        label: 'Colección',
        type: 'variable',
        condition: { field: 'loopType', value: 'collection' }
      },
      {
        key: 'indexVariable',
        label: 'Variable de Índice',
        type: 'variable',
        default: 'i',
        placeholder: 'i'
      },
      {
        key: 'itemVariable',
        label: 'Variable del Elemento',
        type: 'variable',
        placeholder: 'item',
        condition: { field: 'loopType', value: 'collection' }
      }
    ]
  },

  while_loop: {
    title: 'Bucle While',
    icon: 'fa-sync',
    description: 'Repite acciones mientras se cumpla una condición',
    fields: [
      {
        key: 'leftOperand',
        label: 'Valor Izquierdo',
        type: 'expression',
        required: true
      },
      {
        key: 'operator',
        label: 'Operador',
        type: 'select',
        required: true,
        options: [
          { value: '==', label: 'Igual a' },
          { value: '!=', label: 'Diferente de' },
          { value: '>', label: 'Mayor que' },
          { value: '<', label: 'Menor que' },
          { value: 'true', label: 'Es verdadero' },
          { value: 'false', label: 'Es falso' }
        ]
      },
      {
        key: 'rightOperand',
        label: 'Valor Derecho',
        type: 'expression',
        condition: { field: 'operator', notInValues: ['true', 'false'] }
      },
      {
        key: 'maxIterations',
        label: 'Máximo de Iteraciones',
        type: 'number',
        default: 1000,
        helpText: 'Previene bucles infinitos'
      }
    ]
  },

  delay: {
    title: 'Esperar/Delay',
    icon: 'fa-clock',
    description: 'Pausa la ejecución por un tiempo',
    fields: [
      {
        key: 'unit',
        label: 'Unidad',
        type: 'buttonGroup',
        default: 'seconds',
        options: [
          { value: 'milliseconds', label: 'ms' },
          { value: 'seconds', label: 'seg' },
          { value: 'minutes', label: 'min' }
        ]
      },
      {
        key: 'duration',
        label: 'Duración',
        type: 'number',
        required: true,
        default: 1,
        min: 0
      }
    ]
  },

  pause: {
    title: 'Pausa (MessageBox)',
    icon: 'fa-pause-circle',
    description: 'Pausa la ejecución mostrando un mensaje y espera confirmación del usuario',
    fields: [
      {
        key: 'title',
        label: 'Título',
        type: 'text',
        default: 'Pausa',
        placeholder: 'Título del mensaje'
      },
      {
        key: 'message',
        label: 'Mensaje',
        type: 'textarea',
        required: true,
        rows: 2,
        placeholder: 'Mensaje a mostrar durante la pausa'
      },
      {
        key: 'timeout',
        label: 'Tiempo límite de espera',
        type: 'number',
        default: 0,
        min: 0,
        helpText: '0 = espera indefinida hasta que el usuario confirme'
      },
      {
        key: 'timeoutUnit',
        label: 'Unidad de tiempo',
        type: 'buttonGroup',
        default: 'seconds',
        options: [
          { value: 'milliseconds', label: 'ms' },
          { value: 'seconds', label: 'seg' },
          { value: 'minutes', label: 'min' }
        ]
      },
      {
        key: 'showTimer',
        label: 'Mostrar contador',
        type: 'toggle',
        default: true,
        helpText: 'Muestra el tiempo restante en el mensaje'
      },
      {
        key: 'autoClose',
        label: 'Cerrar automáticamente al terminar tiempo',
        type: 'toggle',
        default: false,
        condition: { field: 'timeout', notValue: 0 }
      },
      {
        key: 'continueOnTimeout',
        label: 'Continuar al agotar tiempo',
        type: 'toggle',
        default: true,
        helpText: 'Si se agota el tiempo, continúa con el siguiente paso',
        condition: { field: 'timeout', notValue: 0 }
      }
    ]
  },

  try_catch: {
    title: 'Try/Catch',
    icon: 'fa-shield-alt',
    description: 'Maneja errores durante la ejecución',
    fields: [
      {
        key: 'errorVariable',
        label: 'Variable de Error',
        type: 'variable',
        default: 'error',
        helpText: 'Almacena información del error'
      },
      {
        key: 'logError',
        label: 'Registrar Error',
        type: 'toggle',
        default: true
      },
      {
        key: 'continueOnError',
        label: 'Continuar tras Error',
        type: 'toggle',
        default: true
      }
    ]
  },

  // ==========================================
  // EXCEL
  // ==========================================
  excel_read: {
    title: 'Leer Excel',
    icon: 'fa-file-excel',
    description: 'Lee datos de un archivo Excel',
    fields: [
      {
        key: 'filePath',
        label: 'Archivo Excel',
        type: 'fileWithVariable',
        required: true,
        placeholder: 'C:\\ruta\\archivo.xlsx o ${variable}',
        allowedTypes: ['file', 'string'],
        accept: '.xlsx,.xls,.csv'
      },
      {
        key: 'sheet',
        label: 'Hoja',
        type: 'text',
        default: 'Sheet1',
        placeholder: 'Nombre de la hoja o índice (0, 1...)'
      },
      {
        key: 'range',
        label: 'Rango',
        type: 'text',
        placeholder: 'A1:Z100 (vacío = toda la hoja)'
      },
      {
        key: 'hasHeaders',
        label: 'Primera fila son encabezados',
        type: 'toggle',
        default: true
      },
      {
        key: 'variable',
        label: 'Guardar en Variable',
        type: 'variable',
        required: true
      }
    ]
  },

  excel_write: {
    title: 'Escribir Excel',
    icon: 'fa-file-edit',
    description: 'Escribe datos en un archivo Excel',
    fields: [
      {
        key: 'filePath',
        label: 'Archivo Excel',
        type: 'fileWithVariable',
        required: true,
        placeholder: 'C:\\ruta\\archivo.xlsx o ${variable}',
        allowedTypes: ['file', 'string'],
        accept: '.xlsx'
      },
      {
        key: 'sheet',
        label: 'Hoja',
        type: 'text',
        default: 'Sheet1'
      },
      {
        key: 'data',
        label: 'Datos',
        type: 'variable',
        required: true,
        helpText: 'Variable con array de datos'
      },
      {
        key: 'startCell',
        label: 'Celda Inicial',
        type: 'text',
        default: 'A1'
      },
      {
        key: 'includeHeaders',
        label: 'Incluir Encabezados',
        type: 'toggle',
        default: true
      },
      {
        key: 'createIfNotExists',
        label: 'Crear archivo si no existe',
        type: 'toggle',
        default: true
      }
    ]
  },

  excel_close: {
    title: 'Cerrar Excel',
    icon: 'fa-times-circle',
    description: 'Cierra un archivo Excel',
    fields: [
      {
        key: 'save',
        label: 'Guardar cambios',
        type: 'toggle',
        default: true
      }
    ]
  },

  // ==========================================
  // EXCEL SEGUNDO PLANO (Sin abrir Excel)
  // Usa librerías como openpyxl, xlrd, xlsxwriter
  // ==========================================
  excel_bg_open: {
    title: 'Abrir Archivo Excel (Segundo Plano)',
    icon: 'fa-file-excel',
    description: 'Abre un archivo Excel sin mostrar la aplicación',
    fields: [
      {
        key: 'filePath',
        label: 'Ruta del Archivo',
        type: 'fileWithVariable',
        required: true,
        placeholder: 'C:\\ruta\\archivo.xlsx',
        allowedTypes: ['file', 'string'],
        accept: '.xlsx,.xls,.xlsm,.csv'
      },
      {
        key: 'readOnly',
        label: 'Solo lectura',
        type: 'toggle',
        default: false
      },
      {
        key: 'sheetName',
        label: 'Hoja activa',
        type: 'textWithVariable',
        placeholder: 'Nombre de la hoja o dejar vacío para la primera'
      },
      {
        key: 'variable',
        label: 'Guardar sesión en Variable',
        type: 'variable',
        required: true,
        placeholder: 'excelSession'
      }
    ]
  },

  excel_bg_create: {
    title: 'Crear Archivo Excel (Segundo Plano)',
    icon: 'fa-file-medical',
    description: 'Crea un nuevo archivo Excel sin abrir la aplicación',
    fields: [
      {
        key: 'filePath',
        label: 'Ruta del Archivo',
        type: 'fileWithVariable',
        required: true,
        placeholder: 'C:\\ruta\\nuevo_archivo.xlsx',
        allowedTypes: ['file', 'string'],
        accept: '.xlsx,.xls,.xlsm'
      },
      {
        key: 'sheetName',
        label: 'Nombre de la primera hoja',
        type: 'text',
        default: 'Hoja1'
      },
      {
        key: 'variable',
        label: 'Guardar sesión en Variable',
        type: 'variable',
        required: true,
        placeholder: 'excelSession'
      }
    ]
  },

  excel_bg_read_cell: {
    title: 'Leer Celda (Segundo Plano)',
    icon: 'fa-th-large',
    description: 'Lee el valor de una celda específica',
    fields: [
      {
        key: 'session',
        label: 'Sesión Excel',
        type: 'variableSelect',
        required: true,
        placeholder: 'Seleccionar sesión Excel'
      },
      {
        key: 'cell',
        label: 'Celda',
        type: 'textWithVariable',
        required: true,
        placeholder: 'A1'
      },
      {
        key: 'sheetName',
        label: 'Hoja',
        type: 'textWithVariable',
        placeholder: 'Dejar vacío para hoja activa'
      },
      {
        key: 'variable',
        label: 'Guardar valor en Variable',
        type: 'variable',
        required: true
      }
    ]
  },

  excel_bg_read_range: {
    title: 'Leer Rango (Segundo Plano)',
    icon: 'fa-table',
    description: 'Lee un rango de celdas',
    fields: [
      {
        key: 'session',
        label: 'Sesión Excel',
        type: 'variableSelect',
        required: true
      },
      {
        key: 'range',
        label: 'Rango',
        type: 'textWithVariable',
        required: true,
        placeholder: 'A1:D10'
      },
      {
        key: 'sheetName',
        label: 'Hoja',
        type: 'textWithVariable',
        placeholder: 'Dejar vacío para hoja activa'
      },
      {
        key: 'includeHeaders',
        label: 'Primera fila como encabezados',
        type: 'toggle',
        default: true
      },
      {
        key: 'variable',
        label: 'Guardar en Variable',
        type: 'variable',
        required: true
      }
    ]
  },

  excel_bg_read_all: {
    title: 'Leer Hoja Completa (Segundo Plano)',
    icon: 'fa-file-alt',
    description: 'Lee todos los datos de una hoja',
    fields: [
      {
        key: 'session',
        label: 'Sesión Excel',
        type: 'variableSelect',
        required: true
      },
      {
        key: 'sheetName',
        label: 'Hoja',
        type: 'textWithVariable',
        placeholder: 'Dejar vacío para hoja activa'
      },
      {
        key: 'includeHeaders',
        label: 'Primera fila como encabezados',
        type: 'toggle',
        default: true
      },
      {
        key: 'skipEmptyRows',
        label: 'Omitir filas vacías',
        type: 'toggle',
        default: true
      },
      {
        key: 'variable',
        label: 'Guardar en Variable (DataTable)',
        type: 'variable',
        required: true
      }
    ]
  },

  excel_bg_write_cell: {
    title: 'Escribir Celda (Segundo Plano)',
    icon: 'fa-pen',
    description: 'Escribe un valor en una celda',
    fields: [
      {
        key: 'session',
        label: 'Sesión Excel',
        type: 'variableSelect',
        required: true
      },
      {
        key: 'cell',
        label: 'Celda',
        type: 'textWithVariable',
        required: true,
        placeholder: 'A1'
      },
      {
        key: 'value',
        label: 'Valor',
        type: 'textWithVariable',
        required: true
      },
      {
        key: 'sheetName',
        label: 'Hoja',
        type: 'textWithVariable',
        placeholder: 'Dejar vacío para hoja activa'
      }
    ]
  },

  excel_bg_write_range: {
    title: 'Escribir Rango (Segundo Plano)',
    icon: 'fa-edit',
    description: 'Escribe datos en un rango de celdas',
    fields: [
      {
        key: 'session',
        label: 'Sesión Excel',
        type: 'variableSelect',
        required: true
      },
      {
        key: 'startCell',
        label: 'Celda inicial',
        type: 'textWithVariable',
        required: true,
        placeholder: 'A1'
      },
      {
        key: 'data',
        label: 'Datos (DataTable o Array)',
        type: 'variableSelect',
        required: true
      },
      {
        key: 'sheetName',
        label: 'Hoja',
        type: 'textWithVariable',
        placeholder: 'Dejar vacío para hoja activa'
      },
      {
        key: 'includeHeaders',
        label: 'Incluir encabezados',
        type: 'toggle',
        default: true
      }
    ]
  },

  excel_bg_write_row: {
    title: 'Escribir Fila (Segundo Plano)',
    icon: 'fa-grip-lines',
    description: 'Escribe una fila de datos',
    fields: [
      {
        key: 'session',
        label: 'Sesión Excel',
        type: 'variableSelect',
        required: true
      },
      {
        key: 'rowNumber',
        label: 'Número de fila',
        type: 'number',
        required: true,
        min: 1,
        default: 1
      },
      {
        key: 'startColumn',
        label: 'Columna inicial',
        type: 'textWithVariable',
        default: 'A'
      },
      {
        key: 'values',
        label: 'Valores (Array)',
        type: 'variableSelect',
        required: true
      },
      {
        key: 'sheetName',
        label: 'Hoja',
        type: 'textWithVariable',
        placeholder: 'Dejar vacío para hoja activa'
      }
    ]
  },

  excel_bg_write_column: {
    title: 'Escribir Columna (Segundo Plano)',
    icon: 'fa-grip-lines-vertical',
    description: 'Escribe una columna de datos',
    fields: [
      {
        key: 'session',
        label: 'Sesión Excel',
        type: 'variableSelect',
        required: true
      },
      {
        key: 'column',
        label: 'Columna',
        type: 'textWithVariable',
        required: true,
        placeholder: 'A'
      },
      {
        key: 'startRow',
        label: 'Fila inicial',
        type: 'number',
        default: 1,
        min: 1
      },
      {
        key: 'values',
        label: 'Valores (Array)',
        type: 'variableSelect',
        required: true
      },
      {
        key: 'sheetName',
        label: 'Hoja',
        type: 'textWithVariable',
        placeholder: 'Dejar vacío para hoja activa'
      }
    ]
  },

  excel_bg_append_row: {
    title: 'Agregar Fila al Final (Segundo Plano)',
    icon: 'fa-plus',
    description: 'Agrega una nueva fila al final de los datos',
    fields: [
      {
        key: 'session',
        label: 'Sesión Excel',
        type: 'variableSelect',
        required: true
      },
      {
        key: 'values',
        label: 'Valores (Array)',
        type: 'variableSelect',
        required: true
      },
      {
        key: 'sheetName',
        label: 'Hoja',
        type: 'textWithVariable',
        placeholder: 'Dejar vacío para hoja activa'
      }
    ]
  },

  excel_bg_insert_row: {
    title: 'Insertar Fila (Segundo Plano)',
    icon: 'fa-plus-circle',
    description: 'Inserta una nueva fila en una posición específica',
    fields: [
      {
        key: 'session',
        label: 'Sesión Excel',
        type: 'variableSelect',
        required: true
      },
      {
        key: 'rowNumber',
        label: 'Número de fila',
        type: 'number',
        required: true,
        min: 1
      },
      {
        key: 'count',
        label: 'Cantidad de filas',
        type: 'number',
        default: 1,
        min: 1
      },
      {
        key: 'sheetName',
        label: 'Hoja',
        type: 'textWithVariable',
        placeholder: 'Dejar vacío para hoja activa'
      }
    ]
  },

  excel_bg_delete_row: {
    title: 'Eliminar Fila (Segundo Plano)',
    icon: 'fa-minus-circle',
    description: 'Elimina una o más filas',
    fields: [
      {
        key: 'session',
        label: 'Sesión Excel',
        type: 'variableSelect',
        required: true
      },
      {
        key: 'rowNumber',
        label: 'Número de fila',
        type: 'number',
        required: true,
        min: 1
      },
      {
        key: 'count',
        label: 'Cantidad de filas',
        type: 'number',
        default: 1,
        min: 1
      },
      {
        key: 'sheetName',
        label: 'Hoja',
        type: 'textWithVariable',
        placeholder: 'Dejar vacío para hoja activa'
      }
    ]
  },

  excel_bg_insert_column: {
    title: 'Insertar Columna (Segundo Plano)',
    icon: 'fa-columns',
    description: 'Inserta una nueva columna',
    fields: [
      {
        key: 'session',
        label: 'Sesión Excel',
        type: 'variableSelect',
        required: true
      },
      {
        key: 'column',
        label: 'Columna',
        type: 'textWithVariable',
        required: true,
        placeholder: 'A'
      },
      {
        key: 'count',
        label: 'Cantidad de columnas',
        type: 'number',
        default: 1,
        min: 1
      },
      {
        key: 'sheetName',
        label: 'Hoja',
        type: 'textWithVariable',
        placeholder: 'Dejar vacío para hoja activa'
      }
    ]
  },

  excel_bg_delete_column: {
    title: 'Eliminar Columna (Segundo Plano)',
    icon: 'fa-minus-square',
    description: 'Elimina una o más columnas',
    fields: [
      {
        key: 'session',
        label: 'Sesión Excel',
        type: 'variableSelect',
        required: true
      },
      {
        key: 'column',
        label: 'Columna',
        type: 'textWithVariable',
        required: true,
        placeholder: 'A'
      },
      {
        key: 'count',
        label: 'Cantidad de columnas',
        type: 'number',
        default: 1,
        min: 1
      },
      {
        key: 'sheetName',
        label: 'Hoja',
        type: 'textWithVariable',
        placeholder: 'Dejar vacío para hoja activa'
      }
    ]
  },

  excel_bg_get_row_count: {
    title: 'Contar Filas (Segundo Plano)',
    icon: 'fa-list-ol',
    description: 'Obtiene el número total de filas con datos',
    fields: [
      {
        key: 'session',
        label: 'Sesión Excel',
        type: 'variableSelect',
        required: true
      },
      {
        key: 'sheetName',
        label: 'Hoja',
        type: 'textWithVariable',
        placeholder: 'Dejar vacío para hoja activa'
      },
      {
        key: 'variable',
        label: 'Guardar en Variable',
        type: 'variable',
        required: true
      }
    ]
  },

  excel_bg_get_column_count: {
    title: 'Contar Columnas (Segundo Plano)',
    icon: 'fa-list',
    description: 'Obtiene el número total de columnas con datos',
    fields: [
      {
        key: 'session',
        label: 'Sesión Excel',
        type: 'variableSelect',
        required: true
      },
      {
        key: 'sheetName',
        label: 'Hoja',
        type: 'textWithVariable',
        placeholder: 'Dejar vacío para hoja activa'
      },
      {
        key: 'variable',
        label: 'Guardar en Variable',
        type: 'variable',
        required: true
      }
    ]
  },

  excel_bg_get_last_row: {
    title: 'Última Fila con Datos (Segundo Plano)',
    icon: 'fa-arrow-down',
    description: 'Obtiene el número de la última fila con datos',
    fields: [
      {
        key: 'session',
        label: 'Sesión Excel',
        type: 'variableSelect',
        required: true
      },
      {
        key: 'column',
        label: 'Columna de referencia',
        type: 'textWithVariable',
        placeholder: 'Dejar vacío para cualquier columna'
      },
      {
        key: 'sheetName',
        label: 'Hoja',
        type: 'textWithVariable',
        placeholder: 'Dejar vacío para hoja activa'
      },
      {
        key: 'variable',
        label: 'Guardar en Variable',
        type: 'variable',
        required: true
      }
    ]
  },

  excel_bg_get_last_column: {
    title: 'Última Columna con Datos (Segundo Plano)',
    icon: 'fa-arrow-right',
    description: 'Obtiene la letra de la última columna con datos',
    fields: [
      {
        key: 'session',
        label: 'Sesión Excel',
        type: 'variableSelect',
        required: true
      },
      {
        key: 'row',
        label: 'Fila de referencia',
        type: 'number',
        placeholder: 'Dejar vacío para cualquier fila',
        min: 1
      },
      {
        key: 'sheetName',
        label: 'Hoja',
        type: 'textWithVariable',
        placeholder: 'Dejar vacío para hoja activa'
      },
      {
        key: 'variable',
        label: 'Guardar en Variable',
        type: 'variable',
        required: true
      }
    ]
  },

  excel_bg_find: {
    title: 'Buscar Valor (Segundo Plano)',
    icon: 'fa-search',
    description: 'Busca un valor en la hoja',
    fields: [
      {
        key: 'session',
        label: 'Sesión Excel',
        type: 'variableSelect',
        required: true
      },
      {
        key: 'searchValue',
        label: 'Valor a buscar',
        type: 'textWithVariable',
        required: true
      },
      {
        key: 'sheetName',
        label: 'Hoja',
        type: 'textWithVariable',
        placeholder: 'Dejar vacío para hoja activa'
      },
      {
        key: 'matchCase',
        label: 'Coincidir mayúsculas',
        type: 'toggle',
        default: false
      },
      {
        key: 'matchEntireCell',
        label: 'Coincidir celda completa',
        type: 'toggle',
        default: false
      },
      {
        key: 'variable',
        label: 'Guardar celda encontrada en Variable',
        type: 'variable',
        required: true
      }
    ]
  },

  excel_bg_find_replace: {
    title: 'Buscar y Reemplazar (Segundo Plano)',
    icon: 'fa-exchange-alt',
    description: 'Busca y reemplaza valores en la hoja',
    fields: [
      {
        key: 'session',
        label: 'Sesión Excel',
        type: 'variableSelect',
        required: true
      },
      {
        key: 'searchValue',
        label: 'Valor a buscar',
        type: 'textWithVariable',
        required: true
      },
      {
        key: 'replaceValue',
        label: 'Reemplazar con',
        type: 'textWithVariable',
        required: true
      },
      {
        key: 'sheetName',
        label: 'Hoja',
        type: 'textWithVariable',
        placeholder: 'Dejar vacío para hoja activa'
      },
      {
        key: 'matchCase',
        label: 'Coincidir mayúsculas',
        type: 'toggle',
        default: false
      },
      {
        key: 'replaceAll',
        label: 'Reemplazar todos',
        type: 'toggle',
        default: true
      },
      {
        key: 'variable',
        label: 'Guardar cantidad reemplazada en Variable',
        type: 'variable'
      }
    ]
  },

  excel_bg_get_sheet_names: {
    title: 'Obtener Nombres de Hojas (Segundo Plano)',
    icon: 'fa-list',
    description: 'Obtiene la lista de nombres de todas las hojas',
    fields: [
      {
        key: 'session',
        label: 'Sesión Excel',
        type: 'variableSelect',
        required: true
      },
      {
        key: 'variable',
        label: 'Guardar en Variable (Array)',
        type: 'variable',
        required: true
      }
    ]
  },

  excel_bg_create_sheet: {
    title: 'Crear Hoja (Segundo Plano)',
    icon: 'fa-plus-square',
    description: 'Crea una nueva hoja en el libro',
    fields: [
      {
        key: 'session',
        label: 'Sesión Excel',
        type: 'variableSelect',
        required: true
      },
      {
        key: 'sheetName',
        label: 'Nombre de la hoja',
        type: 'textWithVariable',
        required: true
      },
      {
        key: 'position',
        label: 'Posición',
        type: 'select',
        default: 'end',
        options: [
          { value: 'end', label: 'Al final' },
          { value: 'start', label: 'Al inicio' },
          { value: 'index', label: 'En posición específica' }
        ]
      },
      {
        key: 'index',
        label: 'Índice de posición',
        type: 'number',
        min: 0,
        condition: { field: 'position', value: 'index' }
      }
    ]
  },

  excel_bg_delete_sheet: {
    title: 'Eliminar Hoja (Segundo Plano)',
    icon: 'fa-trash-alt',
    description: 'Elimina una hoja del libro',
    fields: [
      {
        key: 'session',
        label: 'Sesión Excel',
        type: 'variableSelect',
        required: true
      },
      {
        key: 'sheetName',
        label: 'Nombre de la hoja',
        type: 'textWithVariable',
        required: true
      }
    ]
  },

  excel_bg_rename_sheet: {
    title: 'Renombrar Hoja (Segundo Plano)',
    icon: 'fa-i-cursor',
    description: 'Cambia el nombre de una hoja',
    fields: [
      {
        key: 'session',
        label: 'Sesión Excel',
        type: 'variableSelect',
        required: true
      },
      {
        key: 'oldName',
        label: 'Nombre actual',
        type: 'textWithVariable',
        required: true
      },
      {
        key: 'newName',
        label: 'Nuevo nombre',
        type: 'textWithVariable',
        required: true
      }
    ]
  },

  excel_bg_copy_sheet: {
    title: 'Copiar Hoja (Segundo Plano)',
    icon: 'fa-copy',
    description: 'Copia una hoja existente',
    fields: [
      {
        key: 'session',
        label: 'Sesión Excel',
        type: 'variableSelect',
        required: true
      },
      {
        key: 'sourceSheet',
        label: 'Hoja origen',
        type: 'textWithVariable',
        required: true
      },
      {
        key: 'newName',
        label: 'Nombre de la copia',
        type: 'textWithVariable',
        required: true
      }
    ]
  },

  excel_bg_set_formula: {
    title: 'Establecer Fórmula (Segundo Plano)',
    icon: 'fa-function',
    description: 'Establece una fórmula en una celda',
    fields: [
      {
        key: 'session',
        label: 'Sesión Excel',
        type: 'variableSelect',
        required: true
      },
      {
        key: 'cell',
        label: 'Celda',
        type: 'textWithVariable',
        required: true,
        placeholder: 'A1'
      },
      {
        key: 'formula',
        label: 'Fórmula',
        type: 'textWithVariable',
        required: true,
        placeholder: '=SUM(A1:A10)'
      },
      {
        key: 'sheetName',
        label: 'Hoja',
        type: 'textWithVariable',
        placeholder: 'Dejar vacío para hoja activa'
      }
    ]
  },

  excel_bg_merge_cells: {
    title: 'Combinar Celdas (Segundo Plano)',
    icon: 'fa-object-group',
    description: 'Combina un rango de celdas',
    fields: [
      {
        key: 'session',
        label: 'Sesión Excel',
        type: 'variableSelect',
        required: true
      },
      {
        key: 'range',
        label: 'Rango',
        type: 'textWithVariable',
        required: true,
        placeholder: 'A1:D1'
      },
      {
        key: 'sheetName',
        label: 'Hoja',
        type: 'textWithVariable',
        placeholder: 'Dejar vacío para hoja activa'
      }
    ]
  },

  excel_bg_unmerge_cells: {
    title: 'Descombinar Celdas (Segundo Plano)',
    icon: 'fa-object-ungroup',
    description: 'Descombina un rango de celdas combinadas',
    fields: [
      {
        key: 'session',
        label: 'Sesión Excel',
        type: 'variableSelect',
        required: true
      },
      {
        key: 'range',
        label: 'Rango',
        type: 'textWithVariable',
        required: true,
        placeholder: 'A1:D1'
      },
      {
        key: 'sheetName',
        label: 'Hoja',
        type: 'textWithVariable',
        placeholder: 'Dejar vacío para hoja activa'
      }
    ]
  },

  excel_bg_set_cell_style: {
    title: 'Estilo de Celda (Segundo Plano)',
    icon: 'fa-paint-brush',
    description: 'Aplica estilos a una celda o rango',
    fields: [
      {
        key: 'session',
        label: 'Sesión Excel',
        type: 'variableSelect',
        required: true
      },
      {
        key: 'range',
        label: 'Celda o Rango',
        type: 'textWithVariable',
        required: true,
        placeholder: 'A1 o A1:D10'
      },
      {
        key: 'bold',
        label: 'Negrita',
        type: 'toggle',
        default: false
      },
      {
        key: 'italic',
        label: 'Cursiva',
        type: 'toggle',
        default: false
      },
      {
        key: 'underline',
        label: 'Subrayado',
        type: 'toggle',
        default: false
      },
      {
        key: 'fontColor',
        label: 'Color de fuente',
        type: 'text',
        placeholder: '#000000'
      },
      {
        key: 'bgColor',
        label: 'Color de fondo',
        type: 'text',
        placeholder: '#FFFFFF'
      },
      {
        key: 'fontSize',
        label: 'Tamaño de fuente',
        type: 'number',
        min: 6,
        max: 72
      },
      {
        key: 'sheetName',
        label: 'Hoja',
        type: 'textWithVariable',
        placeholder: 'Dejar vacío para hoja activa'
      }
    ]
  },

  excel_bg_set_column_width: {
    title: 'Ancho de Columna (Segundo Plano)',
    icon: 'fa-arrows-alt-h',
    description: 'Establece el ancho de una columna',
    fields: [
      {
        key: 'session',
        label: 'Sesión Excel',
        type: 'variableSelect',
        required: true
      },
      {
        key: 'column',
        label: 'Columna',
        type: 'textWithVariable',
        required: true,
        placeholder: 'A'
      },
      {
        key: 'width',
        label: 'Ancho',
        type: 'number',
        required: true,
        min: 1,
        max: 255
      },
      {
        key: 'sheetName',
        label: 'Hoja',
        type: 'textWithVariable',
        placeholder: 'Dejar vacío para hoja activa'
      }
    ]
  },

  excel_bg_set_row_height: {
    title: 'Alto de Fila (Segundo Plano)',
    icon: 'fa-arrows-alt-v',
    description: 'Establece el alto de una fila',
    fields: [
      {
        key: 'session',
        label: 'Sesión Excel',
        type: 'variableSelect',
        required: true
      },
      {
        key: 'row',
        label: 'Fila',
        type: 'number',
        required: true,
        min: 1
      },
      {
        key: 'height',
        label: 'Alto',
        type: 'number',
        required: true,
        min: 1,
        max: 409
      },
      {
        key: 'sheetName',
        label: 'Hoja',
        type: 'textWithVariable',
        placeholder: 'Dejar vacío para hoja activa'
      }
    ]
  },

  excel_bg_freeze_panes: {
    title: 'Inmovilizar Paneles (Segundo Plano)',
    icon: 'fa-snowflake',
    description: 'Inmoviliza filas y/o columnas',
    fields: [
      {
        key: 'session',
        label: 'Sesión Excel',
        type: 'variableSelect',
        required: true
      },
      {
        key: 'cell',
        label: 'Celda de referencia',
        type: 'textWithVariable',
        required: true,
        placeholder: 'B2 (inmoviliza fila 1 y columna A)'
      },
      {
        key: 'sheetName',
        label: 'Hoja',
        type: 'textWithVariable',
        placeholder: 'Dejar vacío para hoja activa'
      }
    ]
  },

  excel_bg_add_image: {
    title: 'Insertar Imagen (Segundo Plano)',
    icon: 'fa-image',
    description: 'Inserta una imagen en la hoja',
    fields: [
      {
        key: 'session',
        label: 'Sesión Excel',
        type: 'variableSelect',
        required: true
      },
      {
        key: 'imagePath',
        label: 'Ruta de la imagen',
        type: 'fileWithVariable',
        required: true,
        allowedTypes: ['file', 'string']
      },
      {
        key: 'cell',
        label: 'Celda de destino',
        type: 'textWithVariable',
        required: true,
        placeholder: 'A1'
      },
      {
        key: 'width',
        label: 'Ancho (px)',
        type: 'number',
        min: 1
      },
      {
        key: 'height',
        label: 'Alto (px)',
        type: 'number',
        min: 1
      },
      {
        key: 'sheetName',
        label: 'Hoja',
        type: 'textWithVariable',
        placeholder: 'Dejar vacío para hoja activa'
      }
    ]
  },

  excel_bg_add_chart: {
    title: 'Insertar Gráfico (Segundo Plano)',
    icon: 'fa-chart-bar',
    description: 'Crea un gráfico a partir de datos',
    fields: [
      {
        key: 'session',
        label: 'Sesión Excel',
        type: 'variableSelect',
        required: true
      },
      {
        key: 'dataRange',
        label: 'Rango de datos',
        type: 'textWithVariable',
        required: true,
        placeholder: 'A1:D10'
      },
      {
        key: 'chartType',
        label: 'Tipo de gráfico',
        type: 'select',
        default: 'bar',
        options: [
          { value: 'bar', label: 'Barras' },
          { value: 'column', label: 'Columnas' },
          { value: 'line', label: 'Líneas' },
          { value: 'pie', label: 'Circular' },
          { value: 'area', label: 'Área' },
          { value: 'scatter', label: 'Dispersión' }
        ]
      },
      {
        key: 'title',
        label: 'Título del gráfico',
        type: 'textWithVariable'
      },
      {
        key: 'position',
        label: 'Celda de destino',
        type: 'textWithVariable',
        required: true,
        placeholder: 'F1'
      },
      {
        key: 'sheetName',
        label: 'Hoja',
        type: 'textWithVariable',
        placeholder: 'Dejar vacío para hoja activa'
      }
    ]
  },

  excel_bg_protect_sheet: {
    title: 'Proteger Hoja (Segundo Plano)',
    icon: 'fa-lock',
    description: 'Protege una hoja con contraseña',
    fields: [
      {
        key: 'session',
        label: 'Sesión Excel',
        type: 'variableSelect',
        required: true
      },
      {
        key: 'sheetName',
        label: 'Hoja',
        type: 'textWithVariable',
        placeholder: 'Dejar vacío para hoja activa'
      },
      {
        key: 'password',
        label: 'Contraseña',
        type: 'password'
      }
    ]
  },

  excel_bg_unprotect_sheet: {
    title: 'Desproteger Hoja (Segundo Plano)',
    icon: 'fa-unlock',
    description: 'Quita la protección de una hoja',
    fields: [
      {
        key: 'session',
        label: 'Sesión Excel',
        type: 'variableSelect',
        required: true
      },
      {
        key: 'sheetName',
        label: 'Hoja',
        type: 'textWithVariable',
        placeholder: 'Dejar vacío para hoja activa'
      },
      {
        key: 'password',
        label: 'Contraseña',
        type: 'password'
      }
    ]
  },

  excel_bg_to_csv: {
    title: 'Exportar a CSV (Segundo Plano)',
    icon: 'fa-file-csv',
    description: 'Exporta la hoja a un archivo CSV',
    fields: [
      {
        key: 'session',
        label: 'Sesión Excel',
        type: 'variableSelect',
        required: true
      },
      {
        key: 'outputPath',
        label: 'Ruta de salida',
        type: 'fileWithVariable',
        required: true,
        allowedTypes: ['file', 'string']
      },
      {
        key: 'sheetName',
        label: 'Hoja',
        type: 'textWithVariable',
        placeholder: 'Dejar vacío para hoja activa'
      },
      {
        key: 'delimiter',
        label: 'Delimitador',
        type: 'select',
        default: ',',
        options: [
          { value: ',', label: 'Coma (,)' },
          { value: ';', label: 'Punto y coma (;)' },
          { value: '\t', label: 'Tabulador' },
          { value: '|', label: 'Pipe (|)' }
        ]
      },
      {
        key: 'encoding',
        label: 'Codificación',
        type: 'select',
        default: 'utf-8',
        options: [
          { value: 'utf-8', label: 'UTF-8' },
          { value: 'latin-1', label: 'Latin-1' },
          { value: 'cp1252', label: 'Windows-1252' }
        ]
      }
    ]
  },

  excel_bg_to_json: {
    title: 'Exportar a JSON (Segundo Plano)',
    icon: 'fa-file-code',
    description: 'Exporta los datos a formato JSON',
    fields: [
      {
        key: 'session',
        label: 'Sesión Excel',
        type: 'variableSelect',
        required: true
      },
      {
        key: 'sheetName',
        label: 'Hoja',
        type: 'textWithVariable',
        placeholder: 'Dejar vacío para hoja activa'
      },
      {
        key: 'outputType',
        label: 'Tipo de salida',
        type: 'select',
        default: 'variable',
        options: [
          { value: 'variable', label: 'Variable' },
          { value: 'file', label: 'Archivo' }
        ]
      },
      {
        key: 'outputPath',
        label: 'Ruta de salida',
        type: 'fileWithVariable',
        condition: { field: 'outputType', value: 'file' },
        allowedTypes: ['file', 'string']
      },
      {
        key: 'variable',
        label: 'Guardar en Variable',
        type: 'variable',
        condition: { field: 'outputType', value: 'variable' }
      },
      {
        key: 'orient',
        label: 'Orientación',
        type: 'select',
        default: 'records',
        options: [
          { value: 'records', label: 'Lista de objetos' },
          { value: 'columns', label: 'Por columnas' },
          { value: 'index', label: 'Por índice' }
        ]
      }
    ]
  },

  excel_bg_to_datatable: {
    title: 'Convertir a DataTable (Segundo Plano)',
    icon: 'fa-table',
    description: 'Convierte la hoja a un DataTable',
    fields: [
      {
        key: 'session',
        label: 'Sesión Excel',
        type: 'variableSelect',
        required: true
      },
      {
        key: 'sheetName',
        label: 'Hoja',
        type: 'textWithVariable',
        placeholder: 'Dejar vacío para hoja activa'
      },
      {
        key: 'includeHeaders',
        label: 'Primera fila como encabezados',
        type: 'toggle',
        default: true
      },
      {
        key: 'variable',
        label: 'Guardar en Variable',
        type: 'variable',
        required: true
      }
    ]
  },

  excel_bg_from_csv: {
    title: 'Importar desde CSV (Segundo Plano)',
    icon: 'fa-file-csv',
    description: 'Importa datos desde un archivo CSV',
    fields: [
      {
        key: 'session',
        label: 'Sesión Excel',
        type: 'variableSelect',
        required: true
      },
      {
        key: 'csvPath',
        label: 'Ruta del archivo CSV',
        type: 'fileWithVariable',
        required: true,
        allowedTypes: ['file', 'string']
      },
      {
        key: 'startCell',
        label: 'Celda inicial',
        type: 'textWithVariable',
        default: 'A1'
      },
      {
        key: 'sheetName',
        label: 'Hoja destino',
        type: 'textWithVariable',
        placeholder: 'Dejar vacío para hoja activa'
      },
      {
        key: 'delimiter',
        label: 'Delimitador',
        type: 'select',
        default: ',',
        options: [
          { value: ',', label: 'Coma (,)' },
          { value: ';', label: 'Punto y coma (;)' },
          { value: '\t', label: 'Tabulador' },
          { value: '|', label: 'Pipe (|)' }
        ]
      },
      {
        key: 'encoding',
        label: 'Codificación',
        type: 'select',
        default: 'utf-8',
        options: [
          { value: 'utf-8', label: 'UTF-8' },
          { value: 'latin-1', label: 'Latin-1' },
          { value: 'cp1252', label: 'Windows-1252' }
        ]
      }
    ]
  },

  excel_bg_from_json: {
    title: 'Importar desde JSON (Segundo Plano)',
    icon: 'fa-file-code',
    description: 'Importa datos desde JSON',
    fields: [
      {
        key: 'session',
        label: 'Sesión Excel',
        type: 'variableSelect',
        required: true
      },
      {
        key: 'sourceType',
        label: 'Origen',
        type: 'select',
        default: 'variable',
        options: [
          { value: 'variable', label: 'Variable' },
          { value: 'file', label: 'Archivo' }
        ]
      },
      {
        key: 'jsonPath',
        label: 'Ruta del archivo JSON',
        type: 'fileWithVariable',
        condition: { field: 'sourceType', value: 'file' },
        allowedTypes: ['file', 'string']
      },
      {
        key: 'jsonVariable',
        label: 'Variable con JSON',
        type: 'variableSelect',
        condition: { field: 'sourceType', value: 'variable' }
      },
      {
        key: 'startCell',
        label: 'Celda inicial',
        type: 'textWithVariable',
        default: 'A1'
      },
      {
        key: 'sheetName',
        label: 'Hoja destino',
        type: 'textWithVariable',
        placeholder: 'Dejar vacío para hoja activa'
      }
    ]
  },

  excel_bg_save: {
    title: 'Guardar (Segundo Plano)',
    icon: 'fa-save',
    description: 'Guarda los cambios en el archivo',
    fields: [
      {
        key: 'session',
        label: 'Sesión Excel',
        type: 'variableSelect',
        required: true
      }
    ]
  },

  excel_bg_save_as: {
    title: 'Guardar Como (Segundo Plano)',
    icon: 'fa-save',
    description: 'Guarda el archivo con un nuevo nombre',
    fields: [
      {
        key: 'session',
        label: 'Sesión Excel',
        type: 'variableSelect',
        required: true
      },
      {
        key: 'filePath',
        label: 'Nueva ruta del archivo',
        type: 'fileWithVariable',
        required: true,
        placeholder: 'C:\\ruta\\archivo.xlsx o ${variable}',
        allowedTypes: ['file', 'string'],
        accept: '.xlsx,.xls,.xlsm,.csv'
      },
      {
        key: 'format',
        label: 'Formato',
        type: 'select',
        default: 'xlsx',
        options: [
          { value: 'xlsx', label: 'Excel 2007+ (.xlsx)' },
          { value: 'xls', label: 'Excel 97-2003 (.xls)' },
          { value: 'xlsm', label: 'Excel con Macros (.xlsm)' }
        ]
      }
    ]
  },

  excel_bg_close: {
    title: 'Cerrar Archivo (Segundo Plano)',
    icon: 'fa-times-circle',
    description: 'Cierra el archivo Excel sin guardarlo',
    fields: [
      {
        key: 'session',
        label: 'Sesión Excel',
        type: 'variableSelect',
        required: true
      },
      {
        key: 'save',
        label: 'Guardar antes de cerrar',
        type: 'toggle',
        default: false
      }
    ]
  },

  // ==========================================
  // PDF
  // ==========================================
  pdf_read: {
    title: 'Leer PDF',
    icon: 'fa-file-pdf',
    description: 'Extrae texto de un archivo PDF',
    fields: [
      {
        key: 'filePath',
        label: 'Archivo PDF',
        type: 'fileWithVariable',
        required: true,
        placeholder: 'C:\\ruta\\documento.pdf o ${variable}',
        allowedTypes: ['file', 'string'],
        accept: '.pdf'
      },
      {
        key: 'pages',
        label: 'Páginas',
        type: 'text',
        placeholder: 'Todas, o 1-5, 7, 10-12'
      },
      {
        key: 'extractType',
        label: 'Extraer',
        type: 'select',
        default: 'text',
        options: [
          { value: 'text', label: 'Texto' },
          { value: 'tables', label: 'Tablas' },
          { value: 'images', label: 'Imágenes' },
          { value: 'all', label: 'Todo' }
        ]
      },
      {
        key: 'variable',
        label: 'Guardar en Variable',
        type: 'variable',
        required: true
      }
    ]
  },

  pdf_create: {
    title: 'Crear PDF',
    icon: 'fa-file-pdf',
    description: 'Crea un nuevo archivo PDF',
    fields: [
      {
        key: 'source',
        label: 'Origen',
        type: 'select',
        default: 'html',
        options: [
          { value: 'html', label: 'Desde HTML' },
          { value: 'text', label: 'Desde Texto' },
          { value: 'url', label: 'Desde URL' },
          { value: 'template', label: 'Desde Plantilla' }
        ]
      },
      {
        key: 'content',
        label: 'Contenido',
        type: 'textarea',
        required: true,
        rows: 6,
        condition: { field: 'source', inValues: ['html', 'text'] }
      },
      {
        key: 'url',
        label: 'URL',
        type: 'url',
        condition: { field: 'source', value: 'url' }
      },
      {
        key: 'outputPath',
        label: 'Ruta de Salida',
        type: 'file',
        required: true,
        fileType: 'save',
        accept: '.pdf'
      },
      {
        key: 'pageSize',
        label: 'Tamaño de Página',
        type: 'select',
        default: 'A4',
        options: [
          { value: 'A4', label: 'A4' },
          { value: 'Letter', label: 'Carta' },
          { value: 'Legal', label: 'Legal' }
        ]
      },
      {
        key: 'orientation',
        label: 'Orientación',
        type: 'buttonGroup',
        default: 'portrait',
        options: [
          { value: 'portrait', label: 'Vertical' },
          { value: 'landscape', label: 'Horizontal' }
        ]
      }
    ]
  },

  pdf_merge: {
    title: 'Unir PDFs',
    icon: 'fa-object-group',
    description: 'Combina múltiples archivos PDF en uno solo',
    fields: [
      { key: 'files', label: 'Archivos PDF', type: 'tags', required: true, placeholder: 'Rutas de archivos PDF a unir' },
      { key: 'outputPath', label: 'Archivo de salida', type: 'file', required: true, fileType: 'save', accept: '.pdf' },
      { key: 'variable', label: 'Guardar ruta en', type: 'variable' }
    ]
  },
  pdf_split: {
    title: 'Dividir PDF',
    icon: 'fa-cut',
    description: 'Divide un PDF en múltiples archivos',
    fields: [
      { key: 'filePath', label: 'Archivo PDF', type: 'file', required: true, fileType: 'open', accept: '.pdf' },
      { key: 'splitMode', label: 'Modo', type: 'select', default: 'pages', options: [
        { value: 'pages', label: 'Por páginas específicas' },
        { value: 'range', label: 'Por rango' },
        { value: 'every', label: 'Cada N páginas' }
      ]},
      { key: 'pages', label: 'Páginas', type: 'text', placeholder: '1,3,5-8', condition: { field: 'splitMode', value: 'pages' } },
      { key: 'everyN', label: 'Cada N páginas', type: 'number', default: 1, condition: { field: 'splitMode', value: 'every' } },
      { key: 'outputFolder', label: 'Carpeta de salida', type: 'folderWithVariable', required: true },
      { key: 'variable', label: 'Guardar rutas en', type: 'variable' }
    ]
  },
  pdf_extract_text: {
    title: 'Extraer Texto de PDF',
    icon: 'fa-file-alt',
    description: 'Extrae todo el texto de un archivo PDF',
    fields: [
      { key: 'filePath', label: 'Archivo PDF', type: 'file', required: true, fileType: 'open', accept: '.pdf' },
      { key: 'pages', label: 'Páginas', type: 'text', placeholder: 'Todas (o especificar: 1,3,5-8)', helpText: 'Dejar vacío para todas las páginas' },
      { key: 'variable', label: 'Guardar texto en', type: 'variable', required: true }
    ]
  },
  pdf_extract_tables: {
    title: 'Extraer Tablas de PDF',
    icon: 'fa-table',
    description: 'Extrae tablas estructuradas de un PDF',
    fields: [
      { key: 'filePath', label: 'Archivo PDF', type: 'file', required: true, fileType: 'open', accept: '.pdf' },
      { key: 'pages', label: 'Páginas', type: 'text', placeholder: 'Todas' },
      { key: 'outputFormat', label: 'Formato', type: 'select', default: 'json', options: [
        { value: 'json', label: 'JSON' }, { value: 'csv', label: 'CSV' }, { value: 'excel', label: 'Excel' }
      ]},
      { key: 'variable', label: 'Guardar tablas en', type: 'variable', required: true }
    ]
  },
  pdf_extract_pages: {
    title: 'Extraer Páginas de PDF',
    icon: 'fa-file-export',
    description: 'Extrae páginas específicas de un PDF',
    fields: [
      { key: 'filePath', label: 'Archivo PDF', type: 'file', required: true, fileType: 'open', accept: '.pdf' },
      { key: 'pages', label: 'Páginas a extraer', type: 'text', required: true, placeholder: '1,3,5-8' },
      { key: 'outputPath', label: 'Archivo de salida', type: 'file', required: true, fileType: 'save', accept: '.pdf' },
      { key: 'variable', label: 'Guardar ruta en', type: 'variable' }
    ]
  },
  pdf_add_watermark: {
    title: 'Marca de Agua en PDF',
    icon: 'fa-tint',
    description: 'Agrega marca de agua a un PDF',
    fields: [
      { key: 'filePath', label: 'Archivo PDF', type: 'file', required: true, fileType: 'open', accept: '.pdf' },
      { key: 'watermarkType', label: 'Tipo', type: 'select', default: 'text', options: [
        { value: 'text', label: 'Texto' }, { value: 'image', label: 'Imagen' }
      ]},
      { key: 'text', label: 'Texto', type: 'text', placeholder: 'CONFIDENCIAL', condition: { field: 'watermarkType', value: 'text' } },
      { key: 'imagePath', label: 'Imagen', type: 'file', fileType: 'open', accept: '.png,.jpg', condition: { field: 'watermarkType', value: 'image' } },
      { key: 'opacity', label: 'Opacidad', type: 'slider', default: 0.3, min: 0.1, max: 1, step: 0.1 },
      { key: 'outputPath', label: 'Archivo de salida', type: 'file', required: true, fileType: 'save', accept: '.pdf' }
    ]
  },
  pdf_add_password: {
    title: 'Proteger PDF con Contraseña',
    icon: 'fa-lock',
    description: 'Agrega protección con contraseña a un PDF',
    fields: [
      { key: 'filePath', label: 'Archivo PDF', type: 'file', required: true, fileType: 'open', accept: '.pdf' },
      { key: 'userPassword', label: 'Contraseña de usuario', type: 'password', required: true },
      { key: 'ownerPassword', label: 'Contraseña de propietario', type: 'password', helpText: 'Opcional - para permisos avanzados', advanced: true },
      { key: 'allowPrint', label: 'Permitir imprimir', type: 'checkbox', default: true, advanced: true },
      { key: 'allowCopy', label: 'Permitir copiar', type: 'checkbox', default: false, advanced: true },
      { key: 'outputPath', label: 'Archivo de salida', type: 'file', required: true, fileType: 'save', accept: '.pdf' }
    ]
  },
  pdf_remove_password: {
    title: 'Quitar Contraseña de PDF',
    icon: 'fa-unlock',
    description: 'Remueve la protección de contraseña de un PDF',
    fields: [
      { key: 'filePath', label: 'Archivo PDF', type: 'file', required: true, fileType: 'open', accept: '.pdf' },
      { key: 'password', label: 'Contraseña actual', type: 'password', required: true },
      { key: 'outputPath', label: 'Archivo de salida', type: 'file', required: true, fileType: 'save', accept: '.pdf' }
    ]
  },
  pdf_to_image: {
    title: 'PDF a Imagen',
    icon: 'fa-image',
    description: 'Convierte páginas de PDF a imágenes',
    fields: [
      { key: 'filePath', label: 'Archivo PDF', type: 'file', required: true, fileType: 'open', accept: '.pdf' },
      { key: 'pages', label: 'Páginas', type: 'text', placeholder: 'Todas (o 1,3,5-8)' },
      { key: 'format', label: 'Formato', type: 'select', default: 'png', options: [
        { value: 'png', label: 'PNG' }, { value: 'jpg', label: 'JPG' }, { value: 'bmp', label: 'BMP' }
      ]},
      { key: 'dpi', label: 'Resolución (DPI)', type: 'number', default: 300, min: 72, max: 600 },
      { key: 'outputFolder', label: 'Carpeta de salida', type: 'folderWithVariable', required: true },
      { key: 'variable', label: 'Guardar rutas en', type: 'variable' }
    ]
  },
  pdf_rotate: {
    title: 'Rotar PDF',
    icon: 'fa-sync-alt',
    description: 'Rota páginas de un PDF',
    fields: [
      { key: 'filePath', label: 'Archivo PDF', type: 'file', required: true, fileType: 'open', accept: '.pdf' },
      { key: 'angle', label: 'Ángulo', type: 'select', default: '90', options: [
        { value: '90', label: '90° (derecha)' }, { value: '180', label: '180°' }, { value: '270', label: '270° (izquierda)' }
      ]},
      { key: 'pages', label: 'Páginas', type: 'text', placeholder: 'Todas' },
      { key: 'outputPath', label: 'Archivo de salida', type: 'file', required: true, fileType: 'save', accept: '.pdf' }
    ]
  },
  pdf_fill_form: {
    title: 'Llenar Formulario PDF',
    icon: 'fa-edit',
    description: 'Completa campos de formulario en un PDF',
    fields: [
      { key: 'filePath', label: 'Archivo PDF', type: 'file', required: true, fileType: 'open', accept: '.pdf' },
      { key: 'fields', label: 'Campos del formulario', type: 'keyValue', required: true, helpText: 'Nombre del campo → Valor' },
      { key: 'flatten', label: 'Aplanar formulario', type: 'checkbox', default: false, helpText: 'Convierte campos editables en texto fijo' },
      { key: 'outputPath', label: 'Archivo de salida', type: 'file', required: true, fileType: 'save', accept: '.pdf' }
    ]
  },
  pdf_get_metadata: {
    title: 'Obtener Metadatos de PDF',
    icon: 'fa-info-circle',
    description: 'Obtiene información del PDF (páginas, autor, fecha)',
    fields: [
      { key: 'filePath', label: 'Archivo PDF', type: 'file', required: true, fileType: 'open', accept: '.pdf' },
      { key: 'variable', label: 'Guardar metadatos en', type: 'variable', required: true, helpText: '{pages, author, title, created, modified}' }
    ]
  },
  pdf_add_signature: {
    title: 'Firmar PDF',
    icon: 'fa-signature',
    description: 'Agrega una firma digital o imagen de firma al PDF',
    fields: [
      { key: 'filePath', label: 'Archivo PDF', type: 'file', required: true, fileType: 'open', accept: '.pdf' },
      { key: 'signatureType', label: 'Tipo de firma', type: 'select', default: 'image', options: [
        { value: 'image', label: 'Imagen de firma' }, { value: 'digital', label: 'Certificado digital' }, { value: 'text', label: 'Texto' }
      ]},
      { key: 'signatureImage', label: 'Imagen de firma', type: 'file', fileType: 'open', accept: '.png,.jpg', condition: { field: 'signatureType', value: 'image' } },
      { key: 'page', label: 'Página', type: 'number', default: -1, helpText: '-1 = última página' },
      { key: 'x', label: 'Posición X', type: 'number', default: 100 },
      { key: 'y', label: 'Posición Y', type: 'number', default: 100 },
      { key: 'outputPath', label: 'Archivo de salida', type: 'file', required: true, fileType: 'save', accept: '.pdf' }
    ]
  },

  // ==========================================
  // REST WEB SERVICES
  // ==========================================
  rest_get: {
    title: 'GET Request',
    icon: 'fa-download',
    description: 'Realiza una petición HTTP GET',
    fields: [
      {
        key: 'url',
        label: 'URL',
        type: 'url',
        required: true,
        placeholder: 'https://api.ejemplo.com/endpoint'
      },
      {
        key: 'headers',
        label: 'Headers',
        type: 'keyValue',
        helpText: 'Encabezados HTTP adicionales'
      },
      {
        key: 'params',
        label: 'Query Parameters',
        type: 'keyValue',
        helpText: 'Parámetros de URL'
      },
      {
        key: 'auth',
        label: 'Autenticación',
        type: 'select',
        default: 'none',
        options: [
          { value: 'none', label: 'Sin autenticación' },
          { value: 'basic', label: 'Basic Auth' },
          { value: 'bearer', label: 'Bearer Token' },
          { value: 'apikey', label: 'API Key' }
        ]
      },
      {
        key: 'username',
        label: 'Usuario',
        type: 'text',
        condition: { field: 'auth', value: 'basic' }
      },
      {
        key: 'password',
        label: 'Contraseña',
        type: 'password',
        condition: { field: 'auth', value: 'basic' }
      },
      {
        key: 'token',
        label: 'Token',
        type: 'password',
        condition: { field: 'auth', value: 'bearer' }
      },
      {
        key: 'apiKey',
        label: 'API Key',
        type: 'password',
        condition: { field: 'auth', value: 'apikey' }
      },
      {
        key: 'apiKeyHeader',
        label: 'Nombre del Header',
        type: 'text',
        default: 'X-API-Key',
        condition: { field: 'auth', value: 'apikey' }
      },
      {
        key: 'timeout',
        label: 'Timeout (segundos)',
        type: 'number',
        default: 30
      },
      {
        key: 'variable',
        label: 'Guardar Respuesta en',
        type: 'variable',
        required: true
      }
    ]
  },

  rest_post: {
    title: 'POST Request',
    icon: 'fa-upload',
    description: 'Realiza una petición HTTP POST',
    fields: [
      {
        key: 'url',
        label: 'URL',
        type: 'url',
        required: true
      },
      {
        key: 'contentType',
        label: 'Content-Type',
        type: 'select',
        default: 'application/json',
        options: [
          { value: 'application/json', label: 'JSON' },
          { value: 'application/x-www-form-urlencoded', label: 'Form URL Encoded' },
          { value: 'multipart/form-data', label: 'Multipart Form Data' },
          { value: 'text/plain', label: 'Texto plano' },
          { value: 'application/xml', label: 'XML' }
        ]
      },
      {
        key: 'body',
        label: 'Cuerpo (Body)',
        type: 'code',
        language: 'json',
        required: true,
        rows: 8
      },
      {
        key: 'headers',
        label: 'Headers',
        type: 'keyValue'
      },
      {
        key: 'auth',
        label: 'Autenticación',
        type: 'select',
        default: 'none',
        options: [
          { value: 'none', label: 'Sin autenticación' },
          { value: 'basic', label: 'Basic Auth' },
          { value: 'bearer', label: 'Bearer Token' }
        ]
      },
      {
        key: 'token',
        label: 'Token',
        type: 'password',
        condition: { field: 'auth', value: 'bearer' }
      },
      {
        key: 'variable',
        label: 'Guardar Respuesta en',
        type: 'variable',
        required: true
      }
    ]
  },

  rest_put: {
    title: 'PUT Request',
    icon: 'fa-edit',
    description: 'Realiza una petición HTTP PUT',
    extends: 'rest_post'
  },

  rest_delete: {
    title: 'DELETE Request',
    icon: 'fa-trash',
    description: 'Realiza una petición HTTP DELETE',
    fields: [
      {
        key: 'url',
        label: 'URL',
        type: 'url',
        required: true
      },
      {
        key: 'headers',
        label: 'Headers',
        type: 'keyValue'
      },
      {
        key: 'auth',
        label: 'Autenticación',
        type: 'select',
        default: 'none',
        options: [
          { value: 'none', label: 'Sin autenticación' },
          { value: 'bearer', label: 'Bearer Token' }
        ]
      },
      {
        key: 'token',
        label: 'Token',
        type: 'password',
        condition: { field: 'auth', value: 'bearer' }
      },
      {
        key: 'variable',
        label: 'Guardar Respuesta en',
        type: 'variable'
      }
    ]
  },

  // ==========================================
  // HTTP REQUESTS (Alias)
  // ==========================================
  http_get: { extends: 'rest_get' },
  http_post: { extends: 'rest_post' },
  http_put: { extends: 'rest_put' },
  http_delete: { extends: 'rest_delete' },

  // ==========================================
  // SAP
  // ==========================================
  sap_connect: {
    title: 'Conectar SAP',
    icon: 'fa-plug',
    description: 'Conecta con SAP',
    fields: [
      {
        key: 'connectionType',
        label: 'Tipo de Conexión',
        type: 'select',
        default: 'gui',
        options: [
          { value: 'gui', label: 'SAP GUI' },
          { value: 'rfc', label: 'RFC (API)' },
          { value: 'bapi', label: 'BAPI' }
        ]
      },
      {
        key: 'server',
        label: 'Servidor',
        type: 'text',
        required: true
      },
      {
        key: 'systemNumber',
        label: 'Número de Sistema',
        type: 'text',
        default: '00'
      },
      {
        key: 'client',
        label: 'Mandante',
        type: 'text',
        required: true,
        placeholder: '100'
      },
      {
        key: 'username',
        label: 'Usuario',
        type: 'text',
        required: true
      },
      {
        key: 'password',
        label: 'Contraseña',
        type: 'password',
        required: true
      },
      {
        key: 'language',
        label: 'Idioma',
        type: 'select',
        default: 'ES',
        options: [
          { value: 'ES', label: 'Español' },
          { value: 'EN', label: 'Inglés' },
          { value: 'DE', label: 'Alemán' }
        ]
      }
    ]
  },

  sap_transaction: {
    title: 'Ejecutar Transacción',
    icon: 'fa-exchange-alt',
    description: 'Ejecuta una transacción SAP',
    fields: [
      {
        key: 'transaction',
        label: 'Código de Transacción',
        type: 'text',
        required: true,
        placeholder: 'VA01, MM01, ME21N...'
      },
      {
        key: 'parameters',
        label: 'Parámetros',
        type: 'keyValue',
        helpText: 'Campo: Valor para pantalla inicial'
      },
      {
        key: 'waitForScreen',
        label: 'Esperar pantalla',
        type: 'toggle',
        default: true
      }
    ]
  },

  sap_get_data: {
    title: 'Obtener Datos',
    icon: 'fa-database',
    description: 'Obtiene datos de SAP',
    fields: [
      {
        key: 'table',
        label: 'Tabla/Vista',
        type: 'text',
        required: true
      },
      {
        key: 'fields',
        label: 'Campos',
        type: 'tags',
        placeholder: 'MATNR, MAKTX...'
      },
      {
        key: 'filter',
        label: 'Filtro',
        type: 'text',
        placeholder: "MATNR EQ '12345'"
      },
      {
        key: 'maxRows',
        label: 'Máximo de Filas',
        type: 'number',
        default: 100
      },
      {
        key: 'variable',
        label: 'Guardar en Variable',
        type: 'variable',
        required: true
      }
    ]
  },

  sap_create_order: {
    title: 'Crear Orden',
    icon: 'fa-shopping-cart',
    description: 'Crea una orden en SAP',
    fields: [
      {
        key: 'orderType',
        label: 'Tipo de Orden',
        type: 'select',
        required: true,
        options: [
          { value: 'SO', label: 'Orden de Venta' },
          { value: 'PO', label: 'Orden de Compra' },
          { value: 'PR', label: 'Solicitud de Pedido' }
        ]
      },
      {
        key: 'documentType',
        label: 'Tipo de Documento',
        type: 'text',
        placeholder: 'ZOR, NB...'
      },
      {
        key: 'data',
        label: 'Datos de la Orden',
        type: 'keyValue',
        required: true
      },
      {
        key: 'items',
        label: 'Posiciones',
        type: 'variable',
        helpText: 'Array con las posiciones'
      },
      {
        key: 'variable',
        label: 'Guardar Número de Documento',
        type: 'variable'
      }
    ]
  },

  sap_disconnect: {
    title: 'Desconectar SAP',
    icon: 'fa-unlink',
    description: 'Cierra la conexión con SAP',
    fields: []
  },

  // ==========================================
  // MICROSOFT 365
  // ==========================================
  m365_calendar: {
    title: 'Calendario',
    icon: 'fa-calendar',
    description: 'Interactúa con Microsoft Calendar',
    fields: [
      {
        key: 'action',
        label: 'Acción',
        type: 'select',
        required: true,
        options: [
          { value: 'getEvents', label: 'Obtener eventos' },
          { value: 'createEvent', label: 'Crear evento' },
          { value: 'deleteEvent', label: 'Eliminar evento' }
        ]
      },
      {
        key: 'dateFrom',
        label: 'Fecha Desde',
        type: 'date',
        condition: { field: 'action', value: 'getEvents' }
      },
      {
        key: 'dateTo',
        label: 'Fecha Hasta',
        type: 'date',
        condition: { field: 'action', value: 'getEvents' }
      },
      {
        key: 'title',
        label: 'Título',
        type: 'text',
        condition: { field: 'action', value: 'createEvent' }
      },
      {
        key: 'start',
        label: 'Inicio',
        type: 'datetime',
        condition: { field: 'action', value: 'createEvent' }
      },
      {
        key: 'end',
        label: 'Fin',
        type: 'datetime',
        condition: { field: 'action', value: 'createEvent' }
      },
      {
        key: 'attendees',
        label: 'Asistentes',
        type: 'tags',
        condition: { field: 'action', value: 'createEvent' }
      },
      {
        key: 'variable',
        label: 'Guardar en Variable',
        type: 'variable'
      }
    ]
  },

  m365_excel: {
    title: 'Excel Online',
    icon: 'fa-file-excel',
    description: 'Trabaja con Excel Online',
    fields: [
      {
        key: 'fileId',
        label: 'ID del Archivo',
        type: 'text',
        required: true
      },
      {
        key: 'action',
        label: 'Acción',
        type: 'select',
        required: true,
        options: [
          { value: 'read', label: 'Leer datos' },
          { value: 'write', label: 'Escribir datos' },
          { value: 'addRow', label: 'Agregar fila' }
        ]
      },
      {
        key: 'range',
        label: 'Rango',
        type: 'text',
        placeholder: 'A1:D10'
      },
      {
        key: 'data',
        label: 'Datos',
        type: 'variable',
        condition: { field: 'action', inValues: ['write', 'addRow'] }
      },
      {
        key: 'variable',
        label: 'Guardar en Variable',
        type: 'variable',
        condition: { field: 'action', value: 'read' }
      }
    ]
  },

  m365_onedrive: {
    title: 'OneDrive',
    icon: 'fa-cloud',
    description: 'Gestiona archivos en OneDrive',
    fields: [
      {
        key: 'action',
        label: 'Acción',
        type: 'select',
        required: true,
        options: [
          { value: 'upload', label: 'Subir archivo' },
          { value: 'download', label: 'Descargar archivo' },
          { value: 'list', label: 'Listar archivos' },
          { value: 'delete', label: 'Eliminar archivo' }
        ]
      },
      {
        key: 'localPath',
        label: 'Ruta Local',
        type: 'file',
        condition: { field: 'action', inValues: ['upload', 'download'] }
      },
      {
        key: 'remotePath',
        label: 'Ruta en OneDrive',
        type: 'text',
        placeholder: '/Documents/archivo.pdf'
      },
      {
        key: 'variable',
        label: 'Guardar en Variable',
        type: 'variable',
        condition: { field: 'action', inValues: ['list', 'download'] }
      }
    ]
  },

  m365_outlook: {
    title: 'Outlook',
    icon: 'fa-envelope',
    description: 'Envía emails con Outlook',
    extends: 'email_send'
  },

  // ==========================================
  // MOUSE Y TECLADO
  // ==========================================
  mouse_click: {
    title: 'Click Mouse',
    icon: 'fa-mouse-pointer',
    description: 'Realiza un clic en coordenadas de pantalla',
    fields: [
      {
        key: 'x',
        label: 'Posición X',
        type: 'number',
        required: true
      },
      {
        key: 'y',
        label: 'Posición Y',
        type: 'number',
        required: true
      },
      {
        key: 'button',
        label: 'Botón',
        type: 'buttonGroup',
        default: 'left',
        options: [
          { value: 'left', label: 'Izquierdo' },
          { value: 'right', label: 'Derecho' },
          { value: 'middle', label: 'Central' }
        ]
      },
      {
        key: 'clickType',
        label: 'Tipo',
        type: 'buttonGroup',
        default: 'single',
        options: [
          { value: 'single', label: 'Simple' },
          { value: 'double', label: 'Doble' }
        ]
      }
    ]
  },

  mouse_move: {
    title: 'Mover Mouse',
    icon: 'fa-arrows-alt',
    description: 'Mueve el cursor a una posición',
    fields: [
      {
        key: 'x',
        label: 'Posición X',
        type: 'number',
        required: true
      },
      {
        key: 'y',
        label: 'Posición Y',
        type: 'number',
        required: true
      },
      {
        key: 'smooth',
        label: 'Movimiento suave',
        type: 'toggle',
        default: true
      },
      {
        key: 'duration',
        label: 'Duración (ms)',
        type: 'number',
        default: 200,
        condition: { field: 'smooth', value: true }
      }
    ]
  },

  keyboard_type: {
    title: 'Teclear',
    icon: 'fa-keyboard',
    description: 'Escribe texto con el teclado',
    fields: [
      {
        key: 'text',
        label: 'Texto',
        type: 'textarea',
        required: true,
        rows: 3
      },
      {
        key: 'delay',
        label: 'Delay entre teclas (ms)',
        type: 'slider',
        default: 50,
        min: 0,
        max: 500
      },
      PRESS_KEY_AFTER_FIELD
    ]
  },

  keyboard_hotkey: {
    title: 'Tecla Rápida',
    icon: 'fa-keyboard',
    description: 'Presiona combinación de teclas',
    fields: [
      {
        key: 'modifiers',
        label: 'Modificadores',
        type: 'multiSelect',
        options: [
          { value: 'ctrl', label: 'Ctrl' },
          { value: 'alt', label: 'Alt' },
          { value: 'shift', label: 'Shift' },
          { value: 'win', label: 'Windows' }
        ]
      },
      {
        key: 'key',
        label: 'Tecla',
        type: 'select',
        required: true,
        options: [
          { value: 'a', label: 'A' },
          { value: 'c', label: 'C' },
          { value: 'v', label: 'V' },
          { value: 'x', label: 'X' },
          { value: 's', label: 'S' },
          { value: 'z', label: 'Z' },
          { value: 'f', label: 'F' },
          { value: 'enter', label: 'Enter' },
          { value: 'tab', label: 'Tab' },
          { value: 'escape', label: 'Escape' },
          { value: 'delete', label: 'Delete' },
          { value: 'backspace', label: 'Backspace' },
          { value: 'f1', label: 'F1' },
          { value: 'f2', label: 'F2' },
          { value: 'f5', label: 'F5' },
          { value: 'f11', label: 'F11' },
          { value: 'f12', label: 'F12' }
        ]
      }
    ]
  },

  key_press: {
    extends: 'keyboard_hotkey'
  },

  hotkey: {
    extends: 'keyboard_hotkey'
  },

  // ==========================================
  // ESPERAS
  // ==========================================
  wait_seconds: {
    title: 'Esperar Segundos',
    icon: 'fa-hourglass-half',
    description: 'Pausa la ejecución',
    fields: [
      {
        key: 'seconds',
        label: 'Segundos',
        type: 'slider',
        required: true,
        default: 5,
        min: 1,
        max: 300,
        step: 1,
        unit: 's'
      }
    ]
  },

  wait_element: {
    title: 'Esperar Elemento',
    icon: 'fa-eye',
    description: 'Espera a que un elemento aparezca o cambie',
    fields: [
      {
        key: 'selector',
        label: 'Selector',
        type: 'selector',
        required: true
      },
      {
        key: 'state',
        label: 'Esperar hasta que',
        type: 'select',
        default: 'visible',
        options: [
          { value: 'visible', label: 'Sea visible' },
          { value: 'hidden', label: 'Desaparezca' },
          { value: 'attached', label: 'Exista en DOM' },
          { value: 'detached', label: 'No exista en DOM' },
          { value: 'enabled', label: 'Esté habilitado' }
        ]
      },
      {
        key: 'timeout',
        label: 'Timeout (segundos)',
        type: 'number',
        default: 30,
        min: 1,
        max: 300
      }
    ]
  },

  wait_page_load: {
    title: 'Esperar Carga',
    icon: 'fa-spinner',
    description: 'Espera a que la página cargue completamente',
    fields: [
      {
        key: 'waitUntil',
        label: 'Esperar hasta',
        type: 'select',
        default: 'load',
        options: [
          { value: 'load', label: 'Carga completa' },
          { value: 'domcontentloaded', label: 'DOM cargado' },
          { value: 'networkidle0', label: 'Sin actividad de red' }
        ]
      },
      {
        key: 'timeout',
        label: 'Timeout (segundos)',
        type: 'number',
        default: 30
      }
    ]
  },

  // Esperar Condición - Espera avanzada
  wait_condition: {
    title: 'Esperar Condición',
    icon: 'fa-hourglass-half',
    description: 'Espera hasta que una condición específica sea verdadera',
    fields: [
      {
        key: 'conditionCategory',
        label: 'Categoría de Condición',
        type: 'select',
        required: true,
        default: 'application',
        options: [
          { value: 'application', label: 'Aplicación' },
          { value: 'file', label: 'Archivo' },
          { value: 'folder', label: 'Carpeta' },
          { value: 'window', label: 'Ventana' },
          { value: 'boolean', label: 'Booleano' },
          { value: 'string', label: 'Cadena' },
          { value: 'number', label: 'Número' },
          { value: 'ping', label: 'Ping' },
          { value: 'service', label: 'Servicio Windows' },
          { value: 'process', label: 'Proceso' },
          { value: 'image', label: 'Reconocimiento de Imagen' },
          { value: 'datatable', label: 'Tabla de Datos' },
          { value: 'datetime', label: 'Fecha y Hora' },
          { value: 'javascript', label: 'JavaScript' },
          { value: 'webcontrol', label: 'Control Web' },
          { value: 'dictionary', label: 'Diccionario' }
        ]
      },
      // Condiciones de Aplicación
      {
        key: 'appCondition',
        label: 'Condición',
        type: 'select',
        default: 'not_running',
        options: [
          { value: 'not_running', label: 'La aplicación no se está ejecutando' },
          { value: 'running', label: 'La aplicación se está ejecutando' }
        ],
        condition: { field: 'conditionCategory', value: 'application' }
      },
      {
        key: 'applicationName',
        label: 'Nombre de la aplicación',
        type: 'text',
        required: true,
        placeholder: 'notepad.exe, chrome.exe...',
        condition: { field: 'conditionCategory', value: 'application' }
      },
      // Condiciones de Archivo
      {
        key: 'fileCondition',
        label: 'Condición',
        type: 'select',
        default: 'exists',
        options: [
          { value: 'exists', label: 'Archivo existe' },
          { value: 'not_exists', label: 'El archivo no existe' },
          { value: 'date', label: 'Fecha del archivo' },
          { value: 'extension', label: 'Extensión del archivo' },
          { value: 'size', label: 'Tamaño del archivo' }
        ],
        condition: { field: 'conditionCategory', value: 'file' }
      },
      {
        key: 'filePath',
        label: 'Ruta del archivo',
        type: 'file',
        required: true,
        condition: { field: 'conditionCategory', value: 'file' }
      },
      {
        key: 'fileSizeOperator',
        label: 'Operador de tamaño',
        type: 'select',
        options: [
          { value: 'greater', label: 'Mayor que' },
          { value: 'less', label: 'Menor que' },
          { value: 'equals', label: 'Igual a' }
        ],
        condition: { field: 'fileCondition', value: 'size' }
      },
      {
        key: 'fileSizeValue',
        label: 'Tamaño (KB)',
        type: 'number',
        min: 0,
        condition: { field: 'fileCondition', value: 'size' }
      },
      // Condiciones de Carpeta
      {
        key: 'folderCondition',
        label: 'Condición',
        type: 'select',
        default: 'exists',
        options: [
          { value: 'exists', label: 'Carpeta existe' },
          { value: 'not_exists', label: 'La carpeta no existe' }
        ],
        condition: { field: 'conditionCategory', value: 'folder' }
      },
      {
        key: 'folderPath',
        label: 'Ruta de la carpeta',
        type: 'folder',
        required: true,
        condition: { field: 'conditionCategory', value: 'folder' }
      },
      // Condiciones de Ventana
      {
        key: 'windowCondition',
        label: 'Condición',
        type: 'select',
        default: 'exists',
        options: [
          { value: 'exists', label: 'Ventana existe' },
          { value: 'not_exists', label: 'Ventana no existe' },
          { value: 'title_changed', label: 'La ventana con el mismo título no existe' },
          { value: 'title_same', label: 'Existe una ventana con el mismo título' }
        ],
        condition: { field: 'conditionCategory', value: 'window' }
      },
      {
        key: 'windowTitle',
        label: 'Título de la ventana',
        type: 'text',
        placeholder: 'Título exacto o parcial',
        condition: { field: 'conditionCategory', value: 'window' }
      },
      {
        key: 'windowMatchType',
        label: 'Tipo de coincidencia',
        type: 'select',
        default: 'contains',
        options: [
          { value: 'exact', label: 'Título exacto' },
          { value: 'contains', label: 'Contiene' },
          { value: 'regex', label: 'Expresión regular' }
        ],
        condition: { field: 'conditionCategory', value: 'window' }
      },
      // Condiciones de Booleano
      {
        key: 'booleanVariable',
        label: 'Variable booleana',
        type: 'variable',
        required: true,
        condition: { field: 'conditionCategory', value: 'boolean' }
      },
      {
        key: 'booleanExpected',
        label: 'Valor esperado',
        type: 'select',
        default: 'true',
        options: [
          { value: 'true', label: 'Verdadero (True)' },
          { value: 'false', label: 'Falso (False)' }
        ],
        condition: { field: 'conditionCategory', value: 'boolean' }
      },
      // Condiciones de Cadena/String
      {
        key: 'stringCondition',
        label: 'Condición de cadena',
        type: 'select',
        default: 'equals',
        options: [
          { value: 'equals', label: 'Es igual a' },
          { value: 'not_equals', label: 'No es igual a' },
          { value: 'contains', label: 'Contiene' },
          { value: 'starts_with', label: 'Empieza con' },
          { value: 'ends_with', label: 'Termina con' },
          { value: 'is_empty', label: 'Está vacía' },
          { value: 'is_not_empty', label: 'No está vacía' }
        ],
        condition: { field: 'conditionCategory', value: 'string' }
      },
      {
        key: 'stringVariable',
        label: 'Variable de cadena',
        type: 'variable',
        required: true,
        condition: { field: 'conditionCategory', value: 'string' }
      },
      {
        key: 'stringCompareValue',
        label: 'Valor a comparar',
        type: 'text',
        condition: { field: 'stringCondition', notInValues: ['is_empty', 'is_not_empty'] }
      },
      // Condiciones de Número
      {
        key: 'numberCondition',
        label: 'Condición numérica',
        type: 'select',
        default: 'equals',
        options: [
          { value: 'equals', label: 'Es igual a' },
          { value: 'not_equals', label: 'No es igual a' },
          { value: 'greater', label: 'Mayor que' },
          { value: 'greater_equal', label: 'Mayor o igual que' },
          { value: 'less', label: 'Menor que' },
          { value: 'less_equal', label: 'Menor o igual que' }
        ],
        condition: { field: 'conditionCategory', value: 'number' }
      },
      {
        key: 'numberVariable',
        label: 'Variable numérica',
        type: 'variable',
        required: true,
        condition: { field: 'conditionCategory', value: 'number' }
      },
      {
        key: 'numberCompareValue',
        label: 'Valor a comparar',
        type: 'number',
        condition: { field: 'conditionCategory', value: 'number' }
      },
      // Condiciones de Ping
      {
        key: 'pingCondition',
        label: 'Condición',
        type: 'select',
        default: 'success',
        options: [
          { value: 'success', label: 'El ping es correcto' },
          { value: 'fail', label: 'Ping está incorrecto' }
        ],
        condition: { field: 'conditionCategory', value: 'ping' }
      },
      {
        key: 'pingHost',
        label: 'Host/IP',
        type: 'text',
        required: true,
        placeholder: '192.168.1.1 o google.com',
        condition: { field: 'conditionCategory', value: 'ping' }
      },
      // Condiciones de Servicio Windows
      {
        key: 'serviceCondition',
        label: 'Condición',
        type: 'select',
        default: 'running',
        options: [
          { value: 'running', label: 'El servicio se está ejecutando' },
          { value: 'not_running', label: 'El servicio no se está ejecutando' }
        ],
        condition: { field: 'conditionCategory', value: 'service' }
      },
      {
        key: 'serviceName',
        label: 'Nombre del servicio',
        type: 'text',
        required: true,
        placeholder: 'Nombre del servicio Windows',
        condition: { field: 'conditionCategory', value: 'service' }
      },
      // Condiciones de Proceso
      {
        key: 'processCondition',
        label: 'Condición',
        type: 'select',
        default: 'running',
        options: [
          { value: 'running', label: 'El proceso se está ejecutando' },
          { value: 'not_running', label: 'El proceso no se está ejecutando' }
        ],
        condition: { field: 'conditionCategory', value: 'process' }
      },
      {
        key: 'processName',
        label: 'Nombre del proceso',
        type: 'text',
        required: true,
        placeholder: 'chrome.exe, notepad.exe...',
        condition: { field: 'conditionCategory', value: 'process' }
      },
      // Condiciones de Imagen
      {
        key: 'imageCondition',
        label: 'Condición',
        type: 'select',
        default: 'found_screen',
        options: [
          { value: 'found_screen', label: 'Archivo de imagen se encontró en la ventana' },
          { value: 'not_found_screen', label: 'El archivo de imagen NO se encontró en la ventana' },
          { value: 'found_file', label: 'Archivo de imagen se encontró en archivo de imagen' },
          { value: 'not_found_file', label: 'Ventana NO se encontró en archivo de imagen' }
        ],
        condition: { field: 'conditionCategory', value: 'image' }
      },
      {
        key: 'imageFile',
        label: 'Archivo de imagen',
        type: 'file',
        accept: '.png,.jpg,.jpeg,.bmp',
        condition: { field: 'conditionCategory', value: 'image' }
      },
      {
        key: 'imageTolerance',
        label: 'Tolerancia (%)',
        type: 'slider',
        default: 90,
        min: 50,
        max: 100,
        condition: { field: 'conditionCategory', value: 'image' }
      },
      // Condiciones de Tabla de Datos
      {
        key: 'datatableCondition',
        label: 'Condición',
        type: 'select',
        default: 'is_empty',
        options: [
          { value: 'is_empty', label: 'La tabla de datos se encuentra vacía' },
          { value: 'row_count', label: 'Número de filas' },
          { value: 'column_count', label: 'Número de columnas' }
        ],
        condition: { field: 'conditionCategory', value: 'datatable' }
      },
      {
        key: 'datatableVariable',
        label: 'Variable de tabla',
        type: 'variable',
        condition: { field: 'conditionCategory', value: 'datatable' }
      },
      // Condiciones de Diccionario
      {
        key: 'dictionaryCondition',
        label: 'Condición',
        type: 'select',
        default: 'key_exists',
        options: [
          { value: 'key_exists', label: 'Comprobar clave (existe)' },
          { value: 'value_exists', label: 'Verifique un único valor' }
        ],
        condition: { field: 'conditionCategory', value: 'dictionary' }
      },
      {
        key: 'dictionaryVariable',
        label: 'Variable de diccionario',
        type: 'variable',
        condition: { field: 'conditionCategory', value: 'dictionary' }
      },
      {
        key: 'dictionaryKey',
        label: 'Clave a buscar',
        type: 'text',
        condition: { field: 'conditionCategory', value: 'dictionary' }
      },
      // Condiciones de JavaScript
      {
        key: 'javascriptCondition',
        label: 'Condición',
        type: 'select',
        default: 'script_success',
        options: [
          { value: 'script_success', label: 'La secuencia de comandos es correcta' },
          { value: 'script_fail', label: 'La secuencia de comandos es incorrecta' }
        ],
        condition: { field: 'conditionCategory', value: 'javascript' }
      },
      {
        key: 'javascriptCode',
        label: 'Código JavaScript',
        type: 'code',
        language: 'javascript',
        rows: 5,
        placeholder: '// Retorna true o false\nreturn true;',
        condition: { field: 'conditionCategory', value: 'javascript' }
      },
      // Condiciones de Control Web
      {
        key: 'webControlCondition',
        label: 'Condición',
        type: 'select',
        default: 'exists',
        options: [
          { value: 'exists', label: 'El control web existe' },
          { value: 'not_exists', label: 'El control web no existe' },
          { value: 'active', label: 'El control de ventanas está activo' },
          { value: 'not_active', label: 'El control de ventanas no está activo' }
        ],
        condition: { field: 'conditionCategory', value: 'webcontrol' }
      },
      {
        key: 'webControlSelector',
        label: 'Selector',
        type: 'selector',
        condition: { field: 'conditionCategory', value: 'webcontrol' }
      },
      // Condiciones de Fecha y Hora
      {
        key: 'datetimeCondition',
        label: 'Condición de fecha',
        type: 'select',
        default: 'equals',
        options: [
          { value: 'equals', label: 'Es igual a' },
          { value: 'before', label: 'Es antes de' },
          { value: 'after', label: 'Es después de' }
        ],
        condition: { field: 'conditionCategory', value: 'datetime' }
      },
      {
        key: 'datetimeVariable',
        label: 'Variable de fecha',
        type: 'variable',
        condition: { field: 'conditionCategory', value: 'datetime' }
      },
      {
        key: 'datetimeCompareValue',
        label: 'Fecha a comparar',
        type: 'datetime',
        condition: { field: 'conditionCategory', value: 'datetime' }
      },
      // Configuración común de timeout
      {
        key: 'timeout',
        label: '¿Cuánto tiempo desea esperar para que esta condición sea verdadera? (segundos)',
        type: 'number',
        required: true,
        default: 30,
        min: 1,
        max: 3600
      },
      {
        key: 'throwOnTimeout',
        label: 'Muestra una excepción si la condición no se cumple',
        type: 'checkbox',
        default: true
      },
      {
        key: 'checkInterval',
        label: 'Intervalo de verificación (ms)',
        type: 'number',
        default: 500,
        min: 100,
        max: 10000,
        advanced: true
      }
    ]
  },

  // Esperar Cambio en la Pantalla
  wait_screen_change: {
    title: 'Esperar Cambio en la Pantalla',
    icon: 'fa-desktop',
    description: 'Espera hasta que cambie una región específica de la pantalla',
    fields: [
      {
        key: 'windowTarget',
        label: 'Ventana',
        type: 'tabs',
        default: 'browser',
        tabs: [
          { value: 'browser', label: 'Navegador' },
          { value: 'application', label: 'Aplicación' },
          { value: 'variable', label: 'Variable' }
        ]
      },
      {
        key: 'windowSelector',
        label: 'Ventana',
        type: 'windowSelector',
        required: true,
        helpText: 'Seleccione la ventana a monitorear'
      },
      {
        key: 'resizeWindow',
        label: 'Cambiar tamaño de ventana',
        type: 'checkbox',
        default: false,
        helpText: 'Puede mejorar la precisión del bot'
      },
      {
        key: 'captureRegion',
        label: 'Región a monitorear',
        type: 'region',
        helpText: 'Define el área de la pantalla a monitorear'
      },
      {
        key: 'regionX',
        label: 'X →',
        type: 'number',
        required: true,
        placeholder: 'Obligatorio',
        helpText: 'Coordenada X de la esquina superior izquierda'
      },
      {
        key: 'regionY',
        label: 'Y ↓',
        type: 'number',
        required: true,
        placeholder: 'Obligatorio',
        helpText: 'Coordenada Y de la esquina superior izquierda'
      },
      {
        key: 'regionWidth',
        label: 'Ancho ↔',
        type: 'number',
        required: true,
        placeholder: 'Obligatorio',
        helpText: 'Ancho de la región en píxeles'
      },
      {
        key: 'regionHeight',
        label: 'Alto ↕',
        type: 'number',
        required: true,
        placeholder: 'Obligatorio',
        helpText: 'Alto de la región en píxeles'
      },
      {
        key: 'waitBeforeCompare',
        label: '¿Cuánto tiempo de espera antes de comparar las pantallas? (segundos)',
        type: 'number',
        default: 0,
        min: 0
      },
      {
        key: 'timeout',
        label: '¿Cuánto tiempo de espera antes de detener la comparación de las pantallas? (segundos)',
        type: 'number',
        default: 5,
        min: 1
      },
      {
        key: 'throwOnNoChange',
        label: 'Muestra una excepción si la pantalla no cambia',
        type: 'checkbox',
        default: false
      }
    ]
  },

  // Esperar Ventana
  wait_window: {
    title: 'Esperar Ventana',
    icon: 'fa-window-restore',
    description: 'Espera a que una ventana específica aparezca o esté disponible',
    fields: [
      {
        key: 'windowTarget',
        label: 'Ventana',
        type: 'tabs',
        default: 'browser',
        tabs: [
          { value: 'browser', label: 'Navegador' },
          { value: 'application', label: 'Aplicación' },
          { value: 'variable', label: 'Variable' }
        ]
      },
      {
        key: 'windowSelector',
        label: 'Seleccionar Ventana',
        type: 'windowSelector',
        required: true,
        helpText: 'Seleccione la ventana a esperar'
      },
      {
        key: 'timeout',
        label: '¿Cuánto tiempo desea esperar para que esta condición sea verdadera? (segundos)',
        type: 'number',
        default: 5,
        min: 1,
        max: 3600
      },
      {
        key: 'throwOnTimeout',
        label: 'Muestra una excepción si no se puede mostrar la ventana de espera',
        type: 'checkbox',
        default: true
      }
    ]
  },

  // ==========================================
  // LOGGING
  // ==========================================
  log_info: {
    title: 'Log Info',
    icon: 'fa-info',
    description: 'Registra un mensaje informativo',
    fields: [
      {
        key: 'message',
        label: 'Mensaje',
        type: 'textarea',
        required: true,
        rows: 2
      },
      {
        key: 'includeTimestamp',
        label: 'Incluir timestamp',
        type: 'toggle',
        default: true
      }
    ]
  },

  log_warning: {
    title: 'Log Warning',
    icon: 'fa-exclamation-triangle',
    description: 'Registra una advertencia',
    fields: [
      {
        key: 'message',
        label: 'Mensaje',
        type: 'textarea',
        required: true,
        rows: 2
      }
    ]
  },

  log_error: {
    title: 'Log Error',
    icon: 'fa-times-circle',
    description: 'Registra un error',
    fields: [
      {
        key: 'message',
        label: 'Mensaje',
        type: 'textarea',
        required: true,
        rows: 2
      },
      {
        key: 'throwError',
        label: 'Lanzar excepción',
        type: 'toggle',
        default: false
      }
    ]
  },

  // ==========================================
  // MENSAJES
  // ==========================================
  message_box: {
    title: 'Mostrar Mensaje',
    icon: 'fa-info-circle',
    description: 'Muestra un cuadro de mensaje',
    fields: [
      {
        key: 'title',
        label: 'Título',
        type: 'text',
        default: 'Mensaje'
      },
      {
        key: 'message',
        label: 'Mensaje',
        type: 'textarea',
        required: true,
        rows: 3
      },
      {
        key: 'type',
        label: 'Tipo',
        type: 'select',
        default: 'info',
        options: [
          { value: 'info', label: 'Información', icon: 'fas fa-info-circle' },
          { value: 'success', label: 'Éxito', icon: 'fas fa-check-circle' },
          { value: 'warning', label: 'Advertencia', icon: 'fas fa-exclamation-triangle' },
          { value: 'error', label: 'Error', icon: 'fas fa-times-circle' },
          { value: 'question', label: 'Pregunta', icon: 'fas fa-question-circle' }
        ]
      },
      {
        key: 'buttons',
        label: 'Botones',
        type: 'select',
        default: 'ok',
        options: [
          { value: 'ok', label: 'OK' },
          { value: 'okcancel', label: 'OK / Cancelar' },
          { value: 'yesno', label: 'Sí / No' },
          { value: 'yesnocancel', label: 'Sí / No / Cancelar' }
        ]
      },
      {
        key: 'variable',
        label: 'Guardar Respuesta en',
        type: 'variable',
        condition: { field: 'buttons', notValue: 'ok' }
      }
    ]
  },

  input_dialog: {
    title: 'Cuadro de Entrada',
    icon: 'fa-edit',
    description: 'Solicita entrada del usuario',
    fields: [
      {
        key: 'title',
        label: 'Título',
        type: 'text',
        default: 'Entrada'
      },
      {
        key: 'prompt',
        label: 'Mensaje/Prompt',
        type: 'text',
        required: true
      },
      {
        key: 'inputType',
        label: 'Tipo de Entrada',
        type: 'select',
        default: 'text',
        options: [
          { value: 'text', label: 'Texto' },
          { value: 'password', label: 'Contraseña' },
          { value: 'number', label: 'Número' },
          { value: 'date', label: 'Fecha' },
          { value: 'dropdown', label: 'Lista desplegable' }
        ]
      },
      {
        key: 'defaultValue',
        label: 'Valor por Defecto',
        type: 'text'
      },
      {
        key: 'options',
        label: 'Opciones',
        type: 'tags',
        condition: { field: 'inputType', value: 'dropdown' }
      },
      {
        key: 'required',
        label: 'Campo requerido',
        type: 'toggle',
        default: true
      },
      {
        key: 'variable',
        label: 'Guardar en Variable',
        type: 'variable',
        required: true
      }
    ]
  },

  // ==========================================
  // BUCLES ADICIONALES
  // ==========================================
  for_each: {
    extends: 'for_loop'
  },

  while: {
    extends: 'while_loop'
  },

  break: {
    title: 'Romper Bucle',
    icon: 'fa-stop',
    description: 'Sale del bucle actual',
    fields: []
  },

  // ==========================================
  // CONDICIONES ADICIONALES
  // ==========================================
  if: {
    extends: 'if_condition'
  },

  else: {
    title: 'Sino (Else)',
    icon: 'fa-code-branch',
    description: 'Bloque else para condición if',
    fields: []
  },

  switch: {
    title: 'Switch',
    icon: 'fa-random',
    description: 'Múltiples condiciones basadas en un valor',
    fields: [
      {
        key: 'expression',
        label: 'Expresión a Evaluar',
        type: 'expression',
        required: true
      },
      {
        key: 'cases',
        label: 'Casos',
        type: 'cases',
        helpText: 'Agregar casos con sus valores'
      },
      {
        key: 'hasDefault',
        label: 'Incluir caso por defecto',
        type: 'toggle',
        default: true
      }
    ]
  },

  // ==========================================
  // PORTAPAPELES
  // ==========================================
  clipboard_copy: {
    title: 'Copiar',
    icon: 'fa-copy',
    description: 'Copia texto al portapapeles',
    fields: [
      {
        key: 'text',
        label: 'Texto a Copiar',
        type: 'textarea',
        required: true,
        rows: 3
      }
    ]
  },

  clipboard_paste: {
    title: 'Pegar',
    icon: 'fa-paste',
    description: 'Pega contenido del portapapeles',
    fields: [
      {
        key: 'target',
        label: 'Destino',
        type: 'select',
        default: 'active',
        options: [
          { value: 'active', label: 'Elemento activo' },
          { value: 'selector', label: 'Selector específico' }
        ]
      },
      {
        key: 'selector',
        label: 'Selector',
        type: 'selector',
        condition: { field: 'target', value: 'selector' }
      }
    ]
  },

  clipboard_get: {
    title: 'Obtener Contenido',
    icon: 'fa-clipboard-list',
    description: 'Obtiene el contenido del portapapeles',
    fields: [
      {
        key: 'variable',
        label: 'Guardar en Variable',
        type: 'variable',
        required: true
      }
    ]
  },

  // ==========================================
  // TABLA DE DATOS
  // ==========================================
  datatable_create: {
    title: 'Crear DataTable',
    icon: 'fa-plus-square',
    description: 'Crea una nueva tabla de datos',
    fields: [
      {
        key: 'columns',
        label: 'Columnas',
        type: 'tags',
        required: true,
        placeholder: 'Agregar columna...'
      },
      {
        key: 'variable',
        label: 'Nombre de Variable',
        type: 'variable',
        required: true
      }
    ]
  },

  datatable_add_row: {
    title: 'Añadir Fila',
    icon: 'fa-plus',
    description: 'Añade una fila a la tabla',
    fields: [
      {
        key: 'datatable',
        label: 'DataTable',
        type: 'variable',
        required: true
      },
      {
        key: 'data',
        label: 'Datos de la Fila',
        type: 'keyValue',
        required: true
      }
    ]
  },

  datatable_filter: {
    title: 'Filtrar',
    icon: 'fa-filter',
    description: 'Filtra filas de la tabla',
    fields: [
      {
        key: 'datatable',
        label: 'DataTable',
        type: 'variable',
        required: true
      },
      {
        key: 'column',
        label: 'Columna',
        type: 'text',
        required: true
      },
      {
        key: 'operator',
        label: 'Operador',
        type: 'select',
        options: [
          { value: '==', label: 'Igual a' },
          { value: '!=', label: 'Diferente de' },
          { value: 'contains', label: 'Contiene' },
          { value: '>', label: 'Mayor que' },
          { value: '<', label: 'Menor que' }
        ]
      },
      {
        key: 'value',
        label: 'Valor',
        type: 'text',
        required: true
      },
      {
        key: 'resultVariable',
        label: 'Guardar Resultado en',
        type: 'variable',
        required: true
      }
    ]
  },

  datatable_sort: {
    title: 'Ordenar',
    icon: 'fa-sort',
    description: 'Ordena la tabla por una columna',
    fields: [
      {
        key: 'datatable',
        label: 'DataTable',
        type: 'variable',
        required: true
      },
      {
        key: 'column',
        label: 'Columna',
        type: 'text',
        required: true
      },
      {
        key: 'order',
        label: 'Orden',
        type: 'buttonGroup',
        default: 'asc',
        options: [
          { value: 'asc', label: 'Ascendente' },
          { value: 'desc', label: 'Descendente' }
        ]
      }
    ]
  },

  datatable_export: {
    title: 'Exportar',
    icon: 'fa-file-export',
    description: 'Exporta la tabla a un archivo',
    fields: [
      {
        key: 'datatable',
        label: 'DataTable',
        type: 'variable',
        required: true
      },
      {
        key: 'format',
        label: 'Formato',
        type: 'select',
        default: 'csv',
        options: [
          { value: 'csv', label: 'CSV' },
          { value: 'xlsx', label: 'Excel' },
          { value: 'json', label: 'JSON' }
        ]
      },
      {
        key: 'path',
        label: 'Ruta de Salida',
        type: 'file',
        fileType: 'save',
        required: true
      }
    ]
  },

  // ==========================================
  // ESPERA SIMPLE (Wait)
  // ==========================================
  wait: {
    title: 'Esperar',
    icon: 'fa-clock',
    description: 'Pausa la ejecución por un tiempo específico',
    fields: [
      {
        key: 'time',
        label: 'Tiempo',
        type: 'number',
        required: true,
        default: 1000,
        min: 0,
        helpText: 'Tiempo de espera'
      },
      {
        key: 'unit',
        label: 'Unidad',
        type: 'buttonGroup',
        default: 'milliseconds',
        options: [
          { value: 'milliseconds', label: 'ms' },
          { value: 'seconds', label: 'seg' },
          { value: 'minutes', label: 'min' }
        ]
      }
    ]
  },

  // ==========================================
  // EXCEL AVANZADO
  // ==========================================
  excel_open: {
    title: 'Abrir Excel',
    icon: 'fa-file-excel',
    description: 'Abre un archivo Excel',
    fields: [
      {
        key: 'filePath',
        label: 'Archivo Excel',
        type: 'fileWithVariable',
        required: true,
        placeholder: 'C:\\ruta\\archivo.xlsx o ${variable}',
        allowedTypes: ['file', 'string'],
        accept: '.xlsx,.xls,.xlsm,.csv'
      },
      {
        key: 'visible',
        label: 'Visible',
        type: 'checkbox',
        default: true,
        helpText: 'Mostrar la ventana de Excel'
      },
      {
        key: 'readOnly',
        label: 'Solo lectura',
        type: 'checkbox',
        default: false
      },
      {
        key: 'password',
        label: 'Contraseña',
        type: 'password',
        placeholder: 'Si el archivo está protegido'
      },
      {
        key: 'variable',
        label: 'Guardar referencia en',
        type: 'variable',
        required: true,
        placeholder: 'excelApp'
      }
    ]
  },

  excel_get_cell: {
    title: 'Leer Celda',
    icon: 'fa-table',
    description: 'Lee el valor de una celda específica',
    fields: [
      {
        key: 'workbook',
        label: 'Libro Excel',
        type: 'variable',
        placeholder: 'excelApp'
      },
      {
        key: 'sheet',
        label: 'Hoja',
        type: 'text',
        default: 'Sheet1'
      },
      {
        key: 'cell',
        label: 'Celda',
        type: 'text',
        required: true,
        placeholder: 'A1, B5, C10...'
      },
      {
        key: 'variable',
        label: 'Guardar valor en',
        type: 'variable',
        required: true
      }
    ]
  },

  excel_set_cell: {
    title: 'Escribir Celda',
    icon: 'fa-edit',
    description: 'Escribe un valor en una celda específica',
    fields: [
      {
        key: 'workbook',
        label: 'Libro Excel',
        type: 'variable',
        placeholder: 'excelApp'
      },
      {
        key: 'sheet',
        label: 'Hoja',
        type: 'text',
        default: 'Sheet1'
      },
      {
        key: 'cell',
        label: 'Celda',
        type: 'text',
        required: true,
        placeholder: 'A1'
      },
      {
        key: 'value',
        label: 'Valor',
        type: 'text',
        required: true
      },
      {
        key: 'valueType',
        label: 'Tipo de valor',
        type: 'select',
        default: 'auto',
        options: [
          { value: 'auto', label: 'Detectar automático' },
          { value: 'text', label: 'Texto' },
          { value: 'number', label: 'Número' },
          { value: 'formula', label: 'Fórmula' },
          { value: 'date', label: 'Fecha' }
        ]
      }
    ]
  },

  excel_get_range: {
    title: 'Leer Rango',
    icon: 'fa-th',
    description: 'Lee un rango de celdas',
    fields: [
      {
        key: 'workbook',
        label: 'Libro Excel',
        type: 'variable'
      },
      {
        key: 'sheet',
        label: 'Hoja',
        type: 'text',
        default: 'Sheet1'
      },
      {
        key: 'range',
        label: 'Rango',
        type: 'text',
        required: true,
        placeholder: 'A1:D10'
      },
      {
        key: 'includeHeaders',
        label: 'Primera fila como encabezados',
        type: 'checkbox',
        default: true
      },
      {
        key: 'variable',
        label: 'Guardar datos en',
        type: 'variable',
        required: true
      }
    ]
  },

  excel_set_range: {
    title: 'Escribir Rango',
    icon: 'fa-th-large',
    description: 'Escribe datos en un rango de celdas',
    fields: [
      {
        key: 'workbook',
        label: 'Libro Excel',
        type: 'variable'
      },
      {
        key: 'sheet',
        label: 'Hoja',
        type: 'text',
        default: 'Sheet1'
      },
      {
        key: 'startCell',
        label: 'Celda inicial',
        type: 'text',
        required: true,
        placeholder: 'A1'
      },
      {
        key: 'data',
        label: 'Datos',
        type: 'variable',
        required: true,
        helpText: 'Variable con array de datos'
      },
      {
        key: 'includeHeaders',
        label: 'Incluir encabezados',
        type: 'checkbox',
        default: true
      }
    ]
  },

  excel_get_last_row: {
    title: 'Última Fila con Datos',
    icon: 'fa-arrow-down',
    description: 'Obtiene el número de la última fila con datos',
    fields: [
      {
        key: 'workbook',
        label: 'Libro Excel',
        type: 'variable'
      },
      {
        key: 'sheet',
        label: 'Hoja',
        type: 'text',
        default: 'Sheet1'
      },
      {
        key: 'column',
        label: 'Columna',
        type: 'text',
        default: 'A',
        helpText: 'Columna a verificar (A, B, C...)'
      },
      {
        key: 'variable',
        label: 'Guardar número de fila en',
        type: 'variable',
        required: true
      }
    ]
  },

  excel_get_last_column: {
    title: 'Última Columna con Datos',
    icon: 'fa-arrow-right',
    description: 'Obtiene la última columna con datos',
    fields: [
      {
        key: 'workbook',
        label: 'Libro Excel',
        type: 'variable'
      },
      {
        key: 'sheet',
        label: 'Hoja',
        type: 'text',
        default: 'Sheet1'
      },
      {
        key: 'row',
        label: 'Fila',
        type: 'number',
        default: 1,
        helpText: 'Fila a verificar'
      },
      {
        key: 'variable',
        label: 'Guardar columna en',
        type: 'variable',
        required: true
      }
    ]
  },

  excel_insert_row: {
    title: 'Insertar Fila',
    icon: 'fa-plus',
    description: 'Inserta una nueva fila',
    fields: [
      {
        key: 'workbook',
        label: 'Libro Excel',
        type: 'variable'
      },
      {
        key: 'sheet',
        label: 'Hoja',
        type: 'text',
        default: 'Sheet1'
      },
      {
        key: 'position',
        label: 'Posición',
        type: 'select',
        default: 'end',
        options: [
          { value: 'end', label: 'Al final' },
          { value: 'beginning', label: 'Al inicio' },
          { value: 'specific', label: 'Fila específica' }
        ]
      },
      {
        key: 'rowNumber',
        label: 'Número de fila',
        type: 'number',
        condition: { field: 'position', value: 'specific' }
      },
      {
        key: 'data',
        label: 'Datos de la fila',
        type: 'variable',
        helpText: 'Array con los valores de cada celda'
      }
    ]
  },

  excel_delete_row: {
    title: 'Eliminar Fila',
    icon: 'fa-minus',
    description: 'Elimina una fila',
    fields: [
      {
        key: 'workbook',
        label: 'Libro Excel',
        type: 'variable'
      },
      {
        key: 'sheet',
        label: 'Hoja',
        type: 'text',
        default: 'Sheet1'
      },
      {
        key: 'rowNumber',
        label: 'Número de fila',
        type: 'number',
        required: true
      }
    ]
  },

  excel_insert_column: {
    title: 'Insertar Columna',
    icon: 'fa-columns',
    description: 'Inserta una nueva columna',
    fields: [
      {
        key: 'workbook',
        label: 'Libro Excel',
        type: 'variable'
      },
      {
        key: 'sheet',
        label: 'Hoja',
        type: 'text',
        default: 'Sheet1'
      },
      {
        key: 'column',
        label: 'Columna',
        type: 'text',
        required: true,
        placeholder: 'A, B, C...'
      }
    ]
  },

  excel_delete_column: {
    title: 'Eliminar Columna',
    icon: 'fa-columns',
    description: 'Elimina una columna',
    fields: [
      {
        key: 'workbook',
        label: 'Libro Excel',
        type: 'variable'
      },
      {
        key: 'sheet',
        label: 'Hoja',
        type: 'text',
        default: 'Sheet1'
      },
      {
        key: 'column',
        label: 'Columna',
        type: 'text',
        required: true,
        placeholder: 'A, B, C...'
      }
    ]
  },

  excel_format_cells: {
    title: 'Formatear Celdas',
    icon: 'fa-paint-brush',
    description: 'Aplica formato a un rango de celdas',
    fields: [
      {
        key: 'workbook',
        label: 'Libro Excel',
        type: 'variable'
      },
      {
        key: 'sheet',
        label: 'Hoja',
        type: 'text',
        default: 'Sheet1'
      },
      {
        key: 'range',
        label: 'Rango',
        type: 'text',
        required: true,
        placeholder: 'A1:D10'
      },
      {
        key: 'bold',
        label: 'Negrita',
        type: 'checkbox',
        default: false
      },
      {
        key: 'italic',
        label: 'Cursiva',
        type: 'checkbox',
        default: false
      },
      {
        key: 'fontSize',
        label: 'Tamaño de fuente',
        type: 'number',
        default: 11
      },
      {
        key: 'fontColor',
        label: 'Color de texto',
        type: 'color',
        default: '#000000'
      },
      {
        key: 'backgroundColor',
        label: 'Color de fondo',
        type: 'color',
        default: '#FFFFFF'
      },
      {
        key: 'numberFormat',
        label: 'Formato numérico',
        type: 'select',
        default: 'general',
        options: [
          { value: 'general', label: 'General' },
          { value: 'number', label: 'Número (0.00)' },
          { value: 'currency', label: 'Moneda ($0.00)' },
          { value: 'percentage', label: 'Porcentaje (0%)' },
          { value: 'date', label: 'Fecha (dd/mm/yyyy)' },
          { value: 'text', label: 'Texto' }
        ]
      }
    ]
  },

  excel_add_formula: {
    title: 'Agregar Fórmula',
    icon: 'fa-calculator',
    description: 'Inserta una fórmula en una celda',
    fields: [
      {
        key: 'workbook',
        label: 'Libro Excel',
        type: 'variable'
      },
      {
        key: 'sheet',
        label: 'Hoja',
        type: 'text',
        default: 'Sheet1'
      },
      {
        key: 'cell',
        label: 'Celda',
        type: 'text',
        required: true,
        placeholder: 'A1'
      },
      {
        key: 'formula',
        label: 'Fórmula',
        type: 'text',
        required: true,
        placeholder: '=SUM(A1:A10), =VLOOKUP(...)',
        helpText: 'Incluir el signo = al inicio'
      }
    ]
  },

  excel_create_chart: {
    title: 'Crear Gráfico',
    icon: 'fa-chart-bar',
    description: 'Crea un gráfico a partir de datos',
    fields: [
      {
        key: 'workbook',
        label: 'Libro Excel',
        type: 'variable'
      },
      {
        key: 'sheet',
        label: 'Hoja',
        type: 'text',
        default: 'Sheet1'
      },
      {
        key: 'dataRange',
        label: 'Rango de datos',
        type: 'text',
        required: true,
        placeholder: 'A1:D10'
      },
      {
        key: 'chartType',
        label: 'Tipo de gráfico',
        type: 'select',
        default: 'column',
        options: [
          { value: 'column', label: 'Columnas' },
          { value: 'bar', label: 'Barras' },
          { value: 'line', label: 'Líneas' },
          { value: 'pie', label: 'Circular' },
          { value: 'area', label: 'Área' },
          { value: 'scatter', label: 'Dispersión' }
        ]
      },
      {
        key: 'title',
        label: 'Título del gráfico',
        type: 'text'
      },
      {
        key: 'position',
        label: 'Posición',
        type: 'text',
        placeholder: 'F1',
        helpText: 'Celda donde ubicar el gráfico'
      }
    ]
  },

  excel_filter_data: {
    title: 'Filtrar Datos',
    icon: 'fa-filter',
    description: 'Aplica filtros a una tabla de datos',
    fields: [
      {
        key: 'workbook',
        label: 'Libro Excel',
        type: 'variable'
      },
      {
        key: 'sheet',
        label: 'Hoja',
        type: 'text',
        default: 'Sheet1'
      },
      {
        key: 'range',
        label: 'Rango',
        type: 'text',
        required: true,
        placeholder: 'A1:D100'
      },
      {
        key: 'column',
        label: 'Columna a filtrar',
        type: 'text',
        required: true,
        placeholder: 'A, B, C...'
      },
      {
        key: 'criteria',
        label: 'Criterio',
        type: 'text',
        required: true,
        placeholder: '>=100, ="Activo", <>""'
      }
    ]
  },

  excel_sort_data: {
    title: 'Ordenar Datos',
    icon: 'fa-sort-alpha-down',
    description: 'Ordena datos en un rango',
    fields: [
      {
        key: 'workbook',
        label: 'Libro Excel',
        type: 'variable'
      },
      {
        key: 'sheet',
        label: 'Hoja',
        type: 'text',
        default: 'Sheet1'
      },
      {
        key: 'range',
        label: 'Rango',
        type: 'text',
        required: true,
        placeholder: 'A1:D100'
      },
      {
        key: 'sortColumn',
        label: 'Columna de ordenación',
        type: 'text',
        required: true
      },
      {
        key: 'order',
        label: 'Orden',
        type: 'buttonGroup',
        default: 'asc',
        options: [
          { value: 'asc', label: 'Ascendente' },
          { value: 'desc', label: 'Descendente' }
        ]
      },
      {
        key: 'hasHeaders',
        label: 'Tiene encabezados',
        type: 'checkbox',
        default: true
      }
    ]
  },

  excel_find_replace: {
    title: 'Buscar y Reemplazar',
    icon: 'fa-search',
    description: 'Busca y reemplaza texto en Excel',
    fields: [
      {
        key: 'workbook',
        label: 'Libro Excel',
        type: 'variable'
      },
      {
        key: 'sheet',
        label: 'Hoja',
        type: 'text',
        default: 'Sheet1'
      },
      {
        key: 'find',
        label: 'Buscar',
        type: 'text',
        required: true
      },
      {
        key: 'replace',
        label: 'Reemplazar con',
        type: 'text'
      },
      {
        key: 'matchCase',
        label: 'Coincidir mayúsculas/minúsculas',
        type: 'checkbox',
        default: false
      },
      {
        key: 'matchEntireCell',
        label: 'Coincidir celda completa',
        type: 'checkbox',
        default: false
      }
    ]
  },

  excel_add_sheet: {
    title: 'Agregar Hoja',
    icon: 'fa-plus-square',
    description: 'Agrega una nueva hoja al libro',
    fields: [
      {
        key: 'workbook',
        label: 'Libro Excel',
        type: 'variable'
      },
      {
        key: 'sheetName',
        label: 'Nombre de la hoja',
        type: 'text',
        required: true
      },
      {
        key: 'position',
        label: 'Posición',
        type: 'select',
        default: 'end',
        options: [
          { value: 'end', label: 'Al final' },
          { value: 'beginning', label: 'Al inicio' }
        ]
      }
    ]
  },

  excel_delete_sheet: {
    title: 'Eliminar Hoja',
    icon: 'fa-minus-square',
    description: 'Elimina una hoja del libro',
    fields: [
      {
        key: 'workbook',
        label: 'Libro Excel',
        type: 'variable'
      },
      {
        key: 'sheetName',
        label: 'Nombre de la hoja',
        type: 'text',
        required: true
      }
    ]
  },

  excel_rename_sheet: {
    title: 'Renombrar Hoja',
    icon: 'fa-i-cursor',
    description: 'Renombra una hoja existente',
    fields: [
      {
        key: 'workbook',
        label: 'Libro Excel',
        type: 'variable'
      },
      {
        key: 'currentName',
        label: 'Nombre actual',
        type: 'text',
        required: true
      },
      {
        key: 'newName',
        label: 'Nuevo nombre',
        type: 'text',
        required: true
      }
    ]
  },

  excel_copy_sheet: {
    title: 'Copiar Hoja',
    icon: 'fa-copy',
    description: 'Copia una hoja',
    fields: [
      {
        key: 'workbook',
        label: 'Libro Excel',
        type: 'variable'
      },
      {
        key: 'sourceName',
        label: 'Hoja origen',
        type: 'text',
        required: true
      },
      {
        key: 'newName',
        label: 'Nombre de la copia',
        type: 'text',
        required: true
      }
    ]
  },

  excel_save: {
    title: 'Guardar Excel',
    icon: 'fa-save',
    description: 'Guarda el libro de Excel',
    fields: [
      {
        key: 'workbook',
        label: 'Libro Excel',
        type: 'variable'
      },
      {
        key: 'saveAs',
        label: 'Guardar como',
        type: 'checkbox',
        default: false,
        helpText: 'Guardar con un nombre diferente'
      },
      {
        key: 'filePath',
        label: 'Nueva ruta',
        type: 'file',
        fileType: 'save',
        accept: '.xlsx,.xls,.xlsm,.csv,.pdf',
        condition: { field: 'saveAs', value: true }
      },
      {
        key: 'format',
        label: 'Formato',
        type: 'select',
        default: 'xlsx',
        condition: { field: 'saveAs', value: true },
        options: [
          { value: 'xlsx', label: 'Excel (.xlsx)' },
          { value: 'xls', label: 'Excel 97-2003 (.xls)' },
          { value: 'csv', label: 'CSV (.csv)' },
          { value: 'pdf', label: 'PDF (.pdf)' }
        ]
      }
    ]
  },

  excel_run_macro: {
    title: 'Ejecutar Macro',
    icon: 'fa-code',
    description: 'Ejecuta una macro de Excel',
    fields: [
      {
        key: 'workbook',
        label: 'Libro Excel',
        type: 'variable'
      },
      {
        key: 'macroName',
        label: 'Nombre de la macro',
        type: 'text',
        required: true,
        placeholder: 'MiMacro o Modulo1.MiMacro'
      },
      {
        key: 'parameters',
        label: 'Parámetros',
        type: 'tags',
        helpText: 'Parámetros para la macro'
      },
      {
        key: 'variable',
        label: 'Guardar resultado en',
        type: 'variable'
      }
    ]
  },

  // Acciones adicionales de Excel (estilo avanzado)
  excel_access_protected_sheet: {
    title: 'Acceder a Hoja Protegida',
    icon: 'fa-lock-open',
    description: 'Desprotege una hoja para acceder a sus datos',
    fields: [
      {
        key: 'workbook',
        label: 'Libro Excel',
        type: 'variable'
      },
      {
        key: 'sheet',
        label: 'Hoja',
        type: 'text',
        required: true
      },
      {
        key: 'password',
        label: 'Contraseña',
        type: 'password',
        helpText: 'Contraseña de protección de la hoja'
      }
    ]
  },

  excel_append_workbook: {
    title: 'Anexar Libro',
    icon: 'fa-file-import',
    description: 'Anexa datos de otro libro Excel al actual',
    fields: [
      {
        key: 'workbook',
        label: 'Libro destino',
        type: 'variable'
      },
      {
        key: 'sourceFile',
        label: 'Archivo origen',
        type: 'file',
        required: true,
        accept: '.xlsx,.xls,.xlsm,.csv'
      },
      {
        key: 'sourceSheet',
        label: 'Hoja origen',
        type: 'text',
        default: 'Sheet1'
      },
      {
        key: 'targetSheet',
        label: 'Hoja destino',
        type: 'text',
        default: 'Sheet1'
      }
    ]
  },

  excel_append_sheet: {
    title: 'Anexar Hoja',
    icon: 'fa-layer-group',
    description: 'Añade una hoja de otro libro al libro actual',
    fields: [
      {
        key: 'workbook',
        label: 'Libro destino',
        type: 'variable'
      },
      {
        key: 'sourceFile',
        label: 'Archivo origen',
        type: 'file',
        required: true,
        accept: '.xlsx,.xls,.xlsm'
      },
      {
        key: 'sourceSheet',
        label: 'Hoja a copiar',
        type: 'text',
        required: true
      },
      {
        key: 'newSheetName',
        label: 'Nombre para la nueva hoja',
        type: 'text'
      }
    ]
  },

  excel_create_workbook: {
    title: 'Crear Libro',
    icon: 'fa-file-medical',
    description: 'Crea un nuevo libro de Excel',
    fields: [
      {
        key: 'filePath',
        label: 'Ruta del nuevo archivo',
        type: 'file',
        fileType: 'save',
        accept: '.xlsx,.xls,.xlsm'
      },
      {
        key: 'sheetName',
        label: 'Nombre de la primera hoja',
        type: 'text',
        default: 'Sheet1'
      },
      {
        key: 'visible',
        label: 'Mostrar Excel',
        type: 'checkbox',
        default: true
      },
      {
        key: 'variable',
        label: 'Guardar referencia en',
        type: 'variable',
        required: true
      }
    ]
  },

  excel_create_sheet: {
    title: 'Crear Hoja',
    icon: 'fa-plus-square',
    description: 'Crea una nueva hoja en el libro',
    fields: [
      {
        key: 'workbook',
        label: 'Libro Excel',
        type: 'variable'
      },
      {
        key: 'sheetName',
        label: 'Nombre de la hoja',
        type: 'text',
        required: true
      },
      {
        key: 'position',
        label: 'Posición',
        type: 'select',
        default: 'end',
        options: [
          { value: 'beginning', label: 'Al inicio' },
          { value: 'end', label: 'Al final' },
          { value: 'after', label: 'Después de...' }
        ]
      },
      {
        key: 'afterSheet',
        label: 'Después de la hoja',
        type: 'text',
        condition: { field: 'position', value: 'after' }
      }
    ]
  },

  excel_delete_cells: {
    title: 'Eliminar Celdas',
    icon: 'fa-eraser',
    description: 'Elimina el contenido de un rango de celdas',
    fields: [
      {
        key: 'workbook',
        label: 'Libro Excel',
        type: 'variable'
      },
      {
        key: 'sheet',
        label: 'Hoja',
        type: 'text',
        default: 'Sheet1'
      },
      {
        key: 'range',
        label: 'Rango a eliminar',
        type: 'text',
        required: true,
        placeholder: 'A1:D10'
      },
      {
        key: 'deleteType',
        label: 'Tipo de eliminación',
        type: 'select',
        default: 'content',
        options: [
          { value: 'content', label: 'Solo contenido' },
          { value: 'shift_left', label: 'Desplazar celdas izquierda' },
          { value: 'shift_up', label: 'Desplazar celdas arriba' }
        ]
      }
    ]
  },

  excel_delete_table_column: {
    title: 'Eliminar Columna de Tabla',
    icon: 'fa-minus-square',
    description: 'Elimina una columna de una tabla de Excel',
    fields: [
      {
        key: 'workbook',
        label: 'Libro Excel',
        type: 'variable'
      },
      {
        key: 'sheet',
        label: 'Hoja',
        type: 'text',
        default: 'Sheet1'
      },
      {
        key: 'tableName',
        label: 'Nombre de la tabla',
        type: 'text',
        required: true
      },
      {
        key: 'columnName',
        label: 'Nombre de columna',
        type: 'text',
        required: true
      }
    ]
  },

  excel_break_workbook_links: {
    title: 'Break Workbook Links',
    icon: 'fa-unlink',
    description: 'Rompe los vínculos externos del libro',
    fields: [
      {
        key: 'workbook',
        label: 'Libro Excel',
        type: 'variable'
      }
    ]
  },

  excel_delete_sheet: {
    title: 'Eliminar Hoja',
    icon: 'fa-trash-alt',
    description: 'Elimina una hoja del libro',
    fields: [
      {
        key: 'workbook',
        label: 'Libro Excel',
        type: 'variable'
      },
      {
        key: 'sheetName',
        label: 'Nombre de la hoja',
        type: 'text',
        required: true
      }
    ]
  },

  excel_toggle_auto_refresh: {
    title: 'Desactivar/Activar Actualización',
    icon: 'fa-sync-alt',
    description: 'Activa o desactiva la actualización automática',
    fields: [
      {
        key: 'workbook',
        label: 'Libro Excel',
        type: 'variable'
      },
      {
        key: 'enabled',
        label: 'Actualización automática',
        type: 'toggle',
        default: true
      }
    ]
  },

  excel_filter: {
    title: 'Filtro',
    icon: 'fa-filter',
    description: 'Aplica un filtro a los datos',
    fields: [
      {
        key: 'workbook',
        label: 'Libro Excel',
        type: 'variable'
      },
      {
        key: 'sheet',
        label: 'Hoja',
        type: 'text',
        default: 'Sheet1'
      },
      {
        key: 'range',
        label: 'Rango de datos',
        type: 'text',
        required: true,
        placeholder: 'A1:D100'
      },
      {
        key: 'column',
        label: 'Columna a filtrar',
        type: 'text',
        required: true
      },
      {
        key: 'filterValue',
        label: 'Valor del filtro',
        type: 'text',
        required: true
      },
      {
        key: 'filterType',
        label: 'Tipo de filtro',
        type: 'select',
        default: 'equals',
        options: [
          { value: 'equals', label: 'Igual a' },
          { value: 'contains', label: 'Contiene' },
          { value: 'begins', label: 'Comienza con' },
          { value: 'ends', label: 'Termina con' },
          { value: 'greater', label: 'Mayor que' },
          { value: 'less', label: 'Menor que' }
        ]
      }
    ]
  },

  excel_find: {
    title: 'Buscar',
    icon: 'fa-search',
    description: 'Busca un valor en el libro',
    fields: [
      {
        key: 'workbook',
        label: 'Libro Excel',
        type: 'variable'
      },
      {
        key: 'sheet',
        label: 'Hoja',
        type: 'text',
        default: 'Sheet1'
      },
      {
        key: 'searchValue',
        label: 'Valor a buscar',
        type: 'text',
        required: true
      },
      {
        key: 'searchIn',
        label: 'Buscar en',
        type: 'select',
        default: 'values',
        options: [
          { value: 'values', label: 'Valores' },
          { value: 'formulas', label: 'Fórmulas' },
          { value: 'comments', label: 'Comentarios' }
        ]
      },
      {
        key: 'matchCase',
        label: 'Coincidir mayúsculas/minúsculas',
        type: 'checkbox',
        default: false
      },
      {
        key: 'matchEntireCell',
        label: 'Coincidir contenido de toda la celda',
        type: 'checkbox',
        default: false
      },
      {
        key: 'variable',
        label: 'Guardar celda encontrada en',
        type: 'variable'
      }
    ]
  },

  excel_find_next_empty_cell: {
    title: 'Buscar la Próxima Celda Vacía',
    icon: 'fa-search-plus',
    description: 'Encuentra la siguiente celda vacía en una columna o fila',
    fields: [
      {
        key: 'workbook',
        label: 'Libro Excel',
        type: 'variable'
      },
      {
        key: 'sheet',
        label: 'Hoja',
        type: 'text',
        default: 'Sheet1'
      },
      {
        key: 'searchDirection',
        label: 'Dirección de búsqueda',
        type: 'select',
        default: 'column',
        options: [
          { value: 'column', label: 'En columna (hacia abajo)' },
          { value: 'row', label: 'En fila (hacia derecha)' }
        ]
      },
      {
        key: 'startCell',
        label: 'Celda inicial',
        type: 'text',
        required: true,
        placeholder: 'A1'
      },
      {
        key: 'variable',
        label: 'Guardar celda encontrada en',
        type: 'variable',
        required: true
      }
    ]
  },

  excel_get_cell_color: {
    title: 'Obtener el Color de Celda',
    icon: 'fa-palette',
    description: 'Obtiene el color de fondo de una celda',
    fields: [
      {
        key: 'workbook',
        label: 'Libro Excel',
        type: 'variable'
      },
      {
        key: 'sheet',
        label: 'Hoja',
        type: 'text',
        default: 'Sheet1'
      },
      {
        key: 'cell',
        label: 'Celda',
        type: 'text',
        required: true,
        placeholder: 'A1'
      },
      {
        key: 'colorFormat',
        label: 'Formato del color',
        type: 'select',
        default: 'hex',
        options: [
          { value: 'hex', label: 'Hexadecimal (#RRGGBB)' },
          { value: 'rgb', label: 'RGB (r,g,b)' },
          { value: 'name', label: 'Nombre del color' }
        ]
      },
      {
        key: 'variable',
        label: 'Guardar color en',
        type: 'variable',
        required: true
      }
    ]
  },

  excel_get_sheet_name: {
    title: 'Obtener Nombre de la Hoja',
    icon: 'fa-file-signature',
    description: 'Obtiene el nombre de una hoja por su índice',
    fields: [
      {
        key: 'workbook',
        label: 'Libro Excel',
        type: 'variable'
      },
      {
        key: 'sheetIndex',
        label: 'Índice de la hoja',
        type: 'number',
        default: 1,
        min: 1,
        helpText: 'Empezando desde 1'
      },
      {
        key: 'variable',
        label: 'Guardar nombre en',
        type: 'variable',
        required: true
      }
    ]
  },

  excel_get_multiple_cells: {
    title: 'Obtener Varias Celdas',
    icon: 'fa-th',
    description: 'Obtiene valores de múltiples celdas no contiguas',
    fields: [
      {
        key: 'workbook',
        label: 'Libro Excel',
        type: 'variable'
      },
      {
        key: 'sheet',
        label: 'Hoja',
        type: 'text',
        default: 'Sheet1'
      },
      {
        key: 'cells',
        label: 'Celdas',
        type: 'tags',
        required: true,
        placeholder: 'A1, B5, C10...',
        helpText: 'Ingresa las celdas separadas por comas'
      },
      {
        key: 'variable',
        label: 'Guardar valores en',
        type: 'variable',
        required: true
      }
    ]
  },

  excel_get_row_count: {
    title: 'Obtener el Número de Filas',
    icon: 'fa-list-ol',
    description: 'Cuenta el número de filas con datos',
    fields: [
      {
        key: 'workbook',
        label: 'Libro Excel',
        type: 'variable'
      },
      {
        key: 'sheet',
        label: 'Hoja',
        type: 'text',
        default: 'Sheet1'
      },
      {
        key: 'column',
        label: 'Columna de referencia',
        type: 'text',
        default: 'A'
      },
      {
        key: 'variable',
        label: 'Guardar número en',
        type: 'variable',
        required: true
      }
    ]
  },

  excel_get_sensitivity_label: {
    title: 'Obtener Etiqueta de Sensibilidad',
    icon: 'fa-tag',
    description: 'Obtiene la etiqueta de sensibilidad del documento',
    fields: [
      {
        key: 'workbook',
        label: 'Libro Excel',
        type: 'variable'
      },
      {
        key: 'variable',
        label: 'Guardar etiqueta en',
        type: 'variable',
        required: true
      }
    ]
  },

  excel_get_cell_address: {
    title: 'Obtener Dirección de Celda',
    icon: 'fa-map-marker-alt',
    description: 'Obtiene la dirección de la celda activa',
    fields: [
      {
        key: 'workbook',
        label: 'Libro Excel',
        type: 'variable'
      },
      {
        key: 'variable',
        label: 'Guardar dirección en',
        type: 'variable',
        required: true
      }
    ]
  },

  excel_get_column_name: {
    title: 'Obtener Nombre de la Columna',
    icon: 'fa-columns',
    description: 'Convierte número de columna a letra',
    fields: [
      {
        key: 'columnNumber',
        label: 'Número de columna',
        type: 'number',
        required: true,
        min: 1,
        helpText: '1=A, 2=B, 3=C...'
      },
      {
        key: 'variable',
        label: 'Guardar nombre en',
        type: 'variable',
        required: true
      }
    ]
  },

  excel_get_row_number: {
    title: 'Obtener el Número de Fila',
    icon: 'fa-sort-numeric-up',
    description: 'Obtiene el número de fila de la celda activa',
    fields: [
      {
        key: 'workbook',
        label: 'Libro Excel',
        type: 'variable'
      },
      {
        key: 'variable',
        label: 'Guardar número en',
        type: 'variable',
        required: true
      }
    ]
  },

  excel_get_table_range: {
    title: 'Obtener Rango de Tabla',
    icon: 'fa-border-all',
    description: 'Obtiene el rango que ocupa una tabla',
    fields: [
      {
        key: 'workbook',
        label: 'Libro Excel',
        type: 'variable'
      },
      {
        key: 'sheet',
        label: 'Hoja',
        type: 'text',
        default: 'Sheet1'
      },
      {
        key: 'tableName',
        label: 'Nombre de la tabla',
        type: 'text',
        required: true
      },
      {
        key: 'variable',
        label: 'Guardar rango en',
        type: 'variable',
        required: true
      }
    ]
  },

  excel_get_workbook_links: {
    title: 'Get Workbook Links',
    icon: 'fa-link',
    description: 'Obtiene los vínculos externos del libro',
    fields: [
      {
        key: 'workbook',
        label: 'Libro Excel',
        type: 'variable'
      },
      {
        key: 'variable',
        label: 'Guardar vínculos en',
        type: 'variable',
        required: true
      }
    ]
  },

  excel_convert_to_table: {
    title: 'Convertir la Hoja en una Tabla',
    icon: 'fa-table',
    description: 'Convierte un rango de datos en una tabla de Excel',
    fields: [
      {
        key: 'workbook',
        label: 'Libro Excel',
        type: 'variable'
      },
      {
        key: 'sheet',
        label: 'Hoja',
        type: 'text',
        default: 'Sheet1'
      },
      {
        key: 'range',
        label: 'Rango de datos',
        type: 'text',
        required: true,
        placeholder: 'A1:D100'
      },
      {
        key: 'tableName',
        label: 'Nombre de la tabla',
        type: 'text',
        required: true
      },
      {
        key: 'hasHeaders',
        label: 'La primera fila contiene encabezados',
        type: 'checkbox',
        default: true
      },
      {
        key: 'tableStyle',
        label: 'Estilo de tabla',
        type: 'select',
        default: 'TableStyleMedium2',
        options: [
          { value: 'TableStyleLight1', label: 'Light 1' },
          { value: 'TableStyleMedium2', label: 'Medium 2' },
          { value: 'TableStyleDark1', label: 'Dark 1' }
        ]
      }
    ]
  },

  excel_get_sheet_names: {
    title: 'Obtener los Nombres de las Hojas',
    icon: 'fa-list',
    description: 'Obtiene una lista con los nombres de todas las hojas',
    fields: [
      {
        key: 'workbook',
        label: 'Libro Excel',
        type: 'variable'
      },
      {
        key: 'variable',
        label: 'Guardar lista en',
        type: 'variable',
        required: true
      }
    ]
  },

  excel_save_as: {
    title: 'Guardar Como',
    icon: 'fa-save',
    description: 'Guarda el libro con un nuevo nombre o formato',
    fields: [
      {
        key: 'workbook',
        label: 'Libro Excel',
        type: 'variable'
      },
      {
        key: 'filePath',
        label: 'Nueva ruta del archivo',
        type: 'file',
        required: true,
        fileType: 'save',
        accept: '.xlsx,.xls,.xlsm,.csv,.pdf'
      },
      {
        key: 'fileFormat',
        label: 'Formato',
        type: 'select',
        default: 'xlsx',
        options: [
          { value: 'xlsx', label: 'Excel (.xlsx)' },
          { value: 'xls', label: 'Excel 97-2003 (.xls)' },
          { value: 'xlsm', label: 'Excel con macros (.xlsm)' },
          { value: 'csv', label: 'CSV (.csv)' },
          { value: 'pdf', label: 'PDF (.pdf)' }
        ]
      }
    ]
  },

  excel_select_cells: {
    title: 'Seleccionar Celdas/Filas/Columnas',
    icon: 'fa-mouse-pointer',
    description: 'Selecciona un rango de celdas, filas o columnas',
    fields: [
      {
        key: 'workbook',
        label: 'Libro Excel',
        type: 'variable'
      },
      {
        key: 'sheet',
        label: 'Hoja',
        type: 'text',
        default: 'Sheet1'
      },
      {
        key: 'selectType',
        label: 'Tipo de selección',
        type: 'select',
        default: 'range',
        options: [
          { value: 'range', label: 'Rango de celdas' },
          { value: 'rows', label: 'Filas' },
          { value: 'columns', label: 'Columnas' }
        ]
      },
      {
        key: 'range',
        label: 'Rango',
        type: 'text',
        placeholder: 'A1:D10 o 1:5 o A:D',
        required: true
      }
    ]
  },

  excel_get_single_cell: {
    title: 'Obtener una Sola Celda',
    icon: 'fa-bullseye',
    description: 'Lee el valor de una sola celda por coordenadas',
    fields: [
      {
        key: 'workbook',
        label: 'Libro Excel',
        type: 'variable'
      },
      {
        key: 'sheet',
        label: 'Hoja',
        type: 'text',
        default: 'Sheet1'
      },
      {
        key: 'row',
        label: 'Fila',
        type: 'number',
        required: true,
        min: 1
      },
      {
        key: 'column',
        label: 'Columna',
        type: 'number',
        required: true,
        min: 1,
        helpText: '1=A, 2=B, 3=C...'
      },
      {
        key: 'variable',
        label: 'Guardar valor en',
        type: 'variable',
        required: true
      }
    ]
  },

  excel_set_cell_formula: {
    title: 'Establecer Fórmula de Celda',
    icon: 'fa-function',
    description: 'Escribe una fórmula en una celda',
    fields: [
      {
        key: 'workbook',
        label: 'Libro Excel',
        type: 'variable'
      },
      {
        key: 'sheet',
        label: 'Hoja',
        type: 'text',
        default: 'Sheet1'
      },
      {
        key: 'cell',
        label: 'Celda',
        type: 'text',
        required: true,
        placeholder: 'A1'
      },
      {
        key: 'formula',
        label: 'Fórmula',
        type: 'text',
        required: true,
        placeholder: '=SUM(A1:A10)',
        helpText: 'Incluye el signo = al inicio'
      }
    ]
  },

  excel_set_sensitivity_label: {
    title: 'Establecer Etiqueta de Sensibilidad',
    icon: 'fa-shield-alt',
    description: 'Establece la etiqueta de sensibilidad del documento',
    fields: [
      {
        key: 'workbook',
        label: 'Libro Excel',
        type: 'variable'
      },
      {
        key: 'label',
        label: 'Etiqueta',
        type: 'select',
        required: true,
        options: [
          { value: 'public', label: 'Público' },
          { value: 'internal', label: 'Interno' },
          { value: 'confidential', label: 'Confidencial' },
          { value: 'highly_confidential', label: 'Altamente Confidencial' }
        ]
      }
    ]
  },

  excel_sort: {
    title: 'Ordenar',
    icon: 'fa-sort-amount-down',
    description: 'Ordena los datos de un rango',
    fields: [
      {
        key: 'workbook',
        label: 'Libro Excel',
        type: 'variable'
      },
      {
        key: 'sheet',
        label: 'Hoja',
        type: 'text',
        default: 'Sheet1'
      },
      {
        key: 'range',
        label: 'Rango a ordenar',
        type: 'text',
        required: true,
        placeholder: 'A1:D100'
      },
      {
        key: 'sortColumn',
        label: 'Columna de ordenación',
        type: 'text',
        required: true
      },
      {
        key: 'sortOrder',
        label: 'Orden',
        type: 'select',
        default: 'ascending',
        options: [
          { value: 'ascending', label: 'Ascendente (A-Z, 0-9)' },
          { value: 'descending', label: 'Descendente (Z-A, 9-0)' }
        ]
      },
      {
        key: 'hasHeaders',
        label: 'Tiene encabezados',
        type: 'checkbox',
        default: true
      }
    ]
  },

  excel_switch_sheet: {
    title: 'Cambiar a Hoja',
    icon: 'fa-exchange-alt',
    description: 'Cambia a una hoja específica',
    fields: [
      {
        key: 'workbook',
        label: 'Libro Excel',
        type: 'variable'
      },
      {
        key: 'sheetSelector',
        label: 'Seleccionar por',
        type: 'select',
        default: 'name',
        options: [
          { value: 'name', label: 'Nombre' },
          { value: 'index', label: 'Índice' }
        ]
      },
      {
        key: 'sheetName',
        label: 'Nombre de la hoja',
        type: 'text',
        condition: { field: 'sheetSelector', value: 'name' }
      },
      {
        key: 'sheetIndex',
        label: 'Índice de la hoja',
        type: 'number',
        min: 1,
        condition: { field: 'sheetSelector', value: 'index' }
      }
    ]
  },

  excel_show_all_sheets: {
    title: 'Mostrar Todas las Hojas',
    icon: 'fa-eye',
    description: 'Hace visibles todas las hojas ocultas',
    fields: [
      {
        key: 'workbook',
        label: 'Libro Excel',
        type: 'variable'
      }
    ]
  },

  excel_show_hide_rows_columns: {
    title: 'Mostrar/Ocultar Filas/Columnas',
    icon: 'fa-eye-slash',
    description: 'Muestra u oculta filas o columnas específicas',
    fields: [
      {
        key: 'workbook',
        label: 'Libro Excel',
        type: 'variable'
      },
      {
        key: 'sheet',
        label: 'Hoja',
        type: 'text',
        default: 'Sheet1'
      },
      {
        key: 'targetType',
        label: 'Tipo',
        type: 'select',
        default: 'rows',
        options: [
          { value: 'rows', label: 'Filas' },
          { value: 'columns', label: 'Columnas' }
        ]
      },
      {
        key: 'range',
        label: 'Rango',
        type: 'text',
        required: true,
        placeholder: '1:5 o A:D'
      },
      {
        key: 'action',
        label: 'Acción',
        type: 'select',
        default: 'hide',
        options: [
          { value: 'hide', label: 'Ocultar' },
          { value: 'show', label: 'Mostrar' }
        ]
      }
    ]
  },

  excel_show_sheet: {
    title: 'Mostrar Hoja',
    icon: 'fa-eye',
    description: 'Hace visible una hoja oculta',
    fields: [
      {
        key: 'workbook',
        label: 'Libro Excel',
        type: 'variable'
      },
      {
        key: 'sheetName',
        label: 'Nombre de la hoja',
        type: 'text',
        required: true
      }
    ]
  },

  excel_unprotect_workbook: {
    title: 'Desproteger Libro',
    icon: 'fa-unlock',
    description: 'Quita la protección del libro',
    fields: [
      {
        key: 'workbook',
        label: 'Libro Excel',
        type: 'variable'
      },
      {
        key: 'password',
        label: 'Contraseña',
        type: 'password'
      }
    ]
  },

  excel_change_workbook_links: {
    title: 'Change Workbook Links',
    icon: 'fa-link',
    description: 'Cambia los vínculos externos del libro',
    fields: [
      {
        key: 'workbook',
        label: 'Libro Excel',
        type: 'variable'
      },
      {
        key: 'oldLink',
        label: 'Vínculo actual',
        type: 'text',
        required: true
      },
      {
        key: 'newLink',
        label: 'Nuevo vínculo',
        type: 'text',
        required: true
      }
    ]
  },

  excel_write_from_datatable: {
    title: 'Escribir desde Tabla de Datos',
    icon: 'fa-file-import',
    description: 'Escribe datos de una DataTable a Excel',
    fields: [
      {
        key: 'workbook',
        label: 'Libro Excel',
        type: 'variable'
      },
      {
        key: 'sheet',
        label: 'Hoja',
        type: 'text',
        default: 'Sheet1'
      },
      {
        key: 'startCell',
        label: 'Celda inicial',
        type: 'text',
        required: true,
        placeholder: 'A1'
      },
      {
        key: 'dataTable',
        label: 'Tabla de datos',
        type: 'variable',
        required: true
      },
      {
        key: 'includeHeaders',
        label: 'Incluir encabezados',
        type: 'checkbox',
        default: true
      }
    ]
  },

  excel_to_pdf: {
    title: 'Convertir de Excel a PDF',
    icon: 'fa-file-pdf',
    description: 'Convierte el libro de Excel a PDF',
    fields: [
      {
        key: 'workbook',
        label: 'Libro Excel',
        type: 'variable'
      },
      {
        key: 'outputPath',
        label: 'Ruta del PDF',
        type: 'file',
        required: true,
        fileType: 'save',
        accept: '.pdf'
      },
      {
        key: 'sheets',
        label: 'Hojas a exportar',
        type: 'select',
        default: 'all',
        options: [
          { value: 'all', label: 'Todas las hojas' },
          { value: 'active', label: 'Solo la hoja activa' },
          { value: 'specific', label: 'Hojas específicas' }
        ]
      },
      {
        key: 'specificSheets',
        label: 'Nombres de hojas',
        type: 'tags',
        condition: { field: 'sheets', value: 'specific' },
        helpText: 'Ingresa los nombres separados por comas'
      }
    ]
  },

  // ==========================================
  // WORD / DOCUMENTOS
  // ==========================================
  word_open: {
    title: 'Abrir Word',
    icon: 'fa-file-word',
    description: 'Abre un documento de Word',
    fields: [
      {
        key: 'filePath',
        label: 'Archivo Word',
        type: 'fileWithVariable',
        required: true,
        placeholder: 'C:\\ruta\\documento.docx o ${variable}',
        allowedTypes: ['file', 'string'],
        accept: '.docx,.doc,.rtf'
      },
      {
        key: 'visible',
        label: 'Visible',
        type: 'checkbox',
        default: true
      },
      {
        key: 'readOnly',
        label: 'Solo lectura',
        type: 'checkbox',
        default: false
      },
      {
        key: 'variable',
        label: 'Guardar referencia en',
        type: 'variable',
        required: true,
        placeholder: 'wordApp'
      }
    ]
  },

  word_new: {
    title: 'Nuevo Documento Word',
    icon: 'fa-file-word',
    description: 'Crea un nuevo documento de Word',
    fields: [
      {
        key: 'template',
        label: 'Plantilla',
        type: 'file',
        fileType: 'open',
        accept: '.dotx,.dot',
        helpText: 'Opcional: usar una plantilla'
      },
      {
        key: 'visible',
        label: 'Visible',
        type: 'checkbox',
        default: true
      },
      {
        key: 'variable',
        label: 'Guardar referencia en',
        type: 'variable',
        required: true
      }
    ]
  },

  word_read_text: {
    title: 'Leer Texto',
    icon: 'fa-file-alt',
    description: 'Lee todo el texto del documento',
    fields: [
      {
        key: 'document',
        label: 'Documento Word',
        type: 'variable'
      },
      {
        key: 'variable',
        label: 'Guardar texto en',
        type: 'variable',
        required: true
      }
    ]
  },

  word_write_text: {
    title: 'Escribir Texto',
    icon: 'fa-edit',
    description: 'Escribe texto en el documento',
    fields: [
      {
        key: 'document',
        label: 'Documento Word',
        type: 'variable'
      },
      {
        key: 'text',
        label: 'Texto',
        type: 'textarea',
        required: true,
        rows: 4
      },
      {
        key: 'position',
        label: 'Posición',
        type: 'select',
        default: 'end',
        options: [
          { value: 'end', label: 'Al final' },
          { value: 'beginning', label: 'Al inicio' },
          { value: 'cursor', label: 'En el cursor' },
          { value: 'replace', label: 'Reemplazar todo' }
        ]
      },
      {
        key: 'newParagraph',
        label: 'Nuevo párrafo',
        type: 'checkbox',
        default: true
      }
    ]
  },

  word_find_replace: {
    title: 'Buscar y Reemplazar',
    icon: 'fa-search',
    description: 'Busca y reemplaza texto en Word',
    fields: [
      {
        key: 'document',
        label: 'Documento Word',
        type: 'variable'
      },
      {
        key: 'find',
        label: 'Buscar',
        type: 'text',
        required: true
      },
      {
        key: 'replace',
        label: 'Reemplazar con',
        type: 'text'
      },
      {
        key: 'replaceAll',
        label: 'Reemplazar todos',
        type: 'checkbox',
        default: true
      },
      {
        key: 'matchCase',
        label: 'Coincidir mayúsculas',
        type: 'checkbox',
        default: false
      },
      {
        key: 'wholeWord',
        label: 'Palabra completa',
        type: 'checkbox',
        default: false
      }
    ]
  },

  word_insert_image: {
    title: 'Insertar Imagen',
    icon: 'fa-image',
    description: 'Inserta una imagen en el documento',
    fields: [
      {
        key: 'document',
        label: 'Documento Word',
        type: 'variable'
      },
      {
        key: 'imagePath',
        label: 'Ruta de imagen',
        type: 'file',
        required: true,
        fileType: 'open',
        accept: '.png,.jpg,.jpeg,.gif,.bmp'
      },
      {
        key: 'width',
        label: 'Ancho (cm)',
        type: 'number',
        helpText: 'Dejar vacío para tamaño original'
      },
      {
        key: 'height',
        label: 'Alto (cm)',
        type: 'number'
      }
    ]
  },

  word_insert_table: {
    title: 'Insertar Tabla',
    icon: 'fa-table',
    description: 'Inserta una tabla en el documento',
    fields: [
      {
        key: 'document',
        label: 'Documento Word',
        type: 'variable'
      },
      {
        key: 'rows',
        label: 'Filas',
        type: 'number',
        required: true,
        default: 3
      },
      {
        key: 'columns',
        label: 'Columnas',
        type: 'number',
        required: true,
        default: 3
      },
      {
        key: 'data',
        label: 'Datos',
        type: 'variable',
        helpText: 'Array con los datos de la tabla'
      },
      {
        key: 'style',
        label: 'Estilo',
        type: 'select',
        default: 'TableGrid',
        options: [
          { value: 'TableGrid', label: 'Cuadrícula' },
          { value: 'TableNormal', label: 'Normal' },
          { value: 'LightShading', label: 'Sombreado claro' },
          { value: 'MediumShading1', label: 'Sombreado medio' }
        ]
      }
    ]
  },

  word_format_text: {
    title: 'Formatear Texto',
    icon: 'fa-paint-brush',
    description: 'Aplica formato al texto seleccionado',
    fields: [
      {
        key: 'document',
        label: 'Documento Word',
        type: 'variable'
      },
      {
        key: 'searchText',
        label: 'Texto a formatear',
        type: 'text',
        helpText: 'Texto a buscar y formatear'
      },
      {
        key: 'bold',
        label: 'Negrita',
        type: 'checkbox',
        default: false
      },
      {
        key: 'italic',
        label: 'Cursiva',
        type: 'checkbox',
        default: false
      },
      {
        key: 'underline',
        label: 'Subrayado',
        type: 'checkbox',
        default: false
      },
      {
        key: 'fontSize',
        label: 'Tamaño de fuente',
        type: 'number'
      },
      {
        key: 'fontName',
        label: 'Fuente',
        type: 'text',
        placeholder: 'Arial, Times New Roman...'
      },
      {
        key: 'fontColor',
        label: 'Color de texto',
        type: 'color'
      }
    ]
  },

  word_add_header_footer: {
    title: 'Agregar Encabezado/Pie',
    icon: 'fa-heading',
    description: 'Agrega encabezado o pie de página',
    fields: [
      {
        key: 'document',
        label: 'Documento Word',
        type: 'variable'
      },
      {
        key: 'type',
        label: 'Tipo',
        type: 'buttonGroup',
        default: 'header',
        options: [
          { value: 'header', label: 'Encabezado' },
          { value: 'footer', label: 'Pie de página' }
        ]
      },
      {
        key: 'text',
        label: 'Texto',
        type: 'text',
        required: true
      },
      {
        key: 'alignment',
        label: 'Alineación',
        type: 'buttonGroup',
        default: 'center',
        options: [
          { value: 'left', label: 'Izquierda' },
          { value: 'center', label: 'Centro' },
          { value: 'right', label: 'Derecha' }
        ]
      }
    ]
  },

  word_save: {
    title: 'Guardar Word',
    icon: 'fa-save',
    description: 'Guarda el documento',
    fields: [
      {
        key: 'document',
        label: 'Documento Word',
        type: 'variable'
      },
      {
        key: 'saveAs',
        label: 'Guardar como',
        type: 'checkbox',
        default: false
      },
      {
        key: 'filePath',
        label: 'Nueva ruta',
        type: 'file',
        fileType: 'save',
        accept: '.docx,.doc,.pdf,.rtf',
        condition: { field: 'saveAs', value: true }
      },
      {
        key: 'format',
        label: 'Formato',
        type: 'select',
        default: 'docx',
        condition: { field: 'saveAs', value: true },
        options: [
          { value: 'docx', label: 'Word (.docx)' },
          { value: 'doc', label: 'Word 97-2003 (.doc)' },
          { value: 'pdf', label: 'PDF (.pdf)' },
          { value: 'rtf', label: 'RTF (.rtf)' }
        ]
      }
    ]
  },

  word_close: {
    title: 'Cerrar Word',
    icon: 'fa-times-circle',
    description: 'Cierra el documento de Word',
    fields: [
      {
        key: 'document',
        label: 'Documento Word',
        type: 'variable'
      },
      {
        key: 'save',
        label: 'Guardar cambios',
        type: 'checkbox',
        default: true
      }
    ]
  },

  word_to_pdf: {
    title: 'Convertir a PDF',
    icon: 'fa-file-pdf',
    description: 'Convierte el documento a PDF',
    fields: [
      {
        key: 'document',
        label: 'Documento Word',
        type: 'variable'
      },
      {
        key: 'outputPath',
        label: 'Ruta del PDF',
        type: 'file',
        required: true,
        fileType: 'save',
        accept: '.pdf'
      }
    ]
  },

  // ==========================================
  // POWERSHELL / CMD
  // ==========================================
  powershell_run: {
    title: 'Ejecutar PowerShell',
    icon: 'fa-terminal',
    description: 'Ejecuta un script o comando PowerShell',
    fields: [
      {
        key: 'command',
        label: 'Comando/Script',
        type: 'code',
        language: 'powershell',
        required: true,
        rows: 6
      },
      {
        key: 'runAs',
        label: 'Ejecutar como',
        type: 'select',
        default: 'current',
        options: [
          { value: 'current', label: 'Usuario actual' },
          { value: 'admin', label: 'Administrador' }
        ]
      },
      {
        key: 'executionPolicy',
        label: 'Política de ejecución',
        type: 'select',
        default: 'Bypass',
        options: [
          { value: 'Bypass', label: 'Bypass' },
          { value: 'Unrestricted', label: 'Sin restricciones' },
          { value: 'RemoteSigned', label: 'RemoteSigned' }
        ]
      },
      {
        key: 'timeout',
        label: 'Timeout (segundos)',
        type: 'number',
        default: 60
      },
      {
        key: 'waitForExit',
        label: 'Esperar a que termine',
        type: 'checkbox',
        default: true
      },
      {
        key: 'variable',
        label: 'Guardar salida en',
        type: 'variable'
      }
    ]
  },

  powershell_script_file: {
    title: 'Ejecutar Script PS1',
    icon: 'fa-file-code',
    description: 'Ejecuta un archivo de script PowerShell',
    fields: [
      {
        key: 'scriptPath',
        label: 'Archivo .ps1',
        type: 'file',
        required: true,
        fileType: 'open',
        accept: '.ps1'
      },
      {
        key: 'parameters',
        label: 'Parámetros',
        type: 'keyValue',
        helpText: 'Parámetros del script'
      },
      {
        key: 'runAs',
        label: 'Ejecutar como',
        type: 'select',
        default: 'current',
        options: [
          { value: 'current', label: 'Usuario actual' },
          { value: 'admin', label: 'Administrador' }
        ]
      },
      {
        key: 'variable',
        label: 'Guardar salida en',
        type: 'variable'
      }
    ]
  },

  cmd_run: {
    title: 'Ejecutar CMD',
    icon: 'fa-terminal',
    description: 'Ejecuta un comando en CMD',
    fields: [
      {
        key: 'command',
        label: 'Comando',
        type: 'textarea',
        required: true,
        rows: 3,
        placeholder: 'dir, copy, del, etc.'
      },
      {
        key: 'workingDirectory',
        label: 'Directorio de trabajo',
        type: 'file',
        fileType: 'folder'
      },
      {
        key: 'runAs',
        label: 'Ejecutar como',
        type: 'select',
        default: 'current',
        options: [
          { value: 'current', label: 'Usuario actual' },
          { value: 'admin', label: 'Administrador' }
        ]
      },
      {
        key: 'hidden',
        label: 'Ventana oculta',
        type: 'checkbox',
        default: true
      },
      {
        key: 'waitForExit',
        label: 'Esperar a que termine',
        type: 'checkbox',
        default: true
      },
      {
        key: 'variable',
        label: 'Guardar salida en',
        type: 'variable'
      }
    ]
  },

  cmd_batch_file: {
    title: 'Ejecutar Batch',
    icon: 'fa-file-code',
    description: 'Ejecuta un archivo batch (.bat/.cmd)',
    fields: [
      {
        key: 'batchPath',
        label: 'Archivo Batch',
        type: 'file',
        required: true,
        fileType: 'open',
        accept: '.bat,.cmd'
      },
      {
        key: 'arguments',
        label: 'Argumentos',
        type: 'text',
        placeholder: 'arg1 arg2 arg3'
      },
      {
        key: 'workingDirectory',
        label: 'Directorio de trabajo',
        type: 'file',
        fileType: 'folder'
      },
      {
        key: 'hidden',
        label: 'Ventana oculta',
        type: 'checkbox',
        default: true
      },
      {
        key: 'variable',
        label: 'Guardar salida en',
        type: 'variable'
      }
    ]
  },

  run_application: {
    title: 'Ejecutar Aplicación',
    icon: 'fa-play',
    description: 'Ejecuta una aplicación o programa',
    fields: [
      {
        key: 'path',
        label: 'Ruta del programa',
        type: 'file',
        required: true,
        fileType: 'open',
        accept: '.exe,.msi,.lnk'
      },
      {
        key: 'arguments',
        label: 'Argumentos',
        type: 'text'
      },
      {
        key: 'workingDirectory',
        label: 'Directorio de trabajo',
        type: 'file',
        fileType: 'folder'
      },
      {
        key: 'windowStyle',
        label: 'Estilo de ventana',
        type: 'select',
        default: 'normal',
        options: [
          { value: 'normal', label: 'Normal' },
          { value: 'maximized', label: 'Maximizada' },
          { value: 'minimized', label: 'Minimizada' },
          { value: 'hidden', label: 'Oculta' }
        ]
      },
      {
        key: 'waitForExit',
        label: 'Esperar a que cierre',
        type: 'checkbox',
        default: false
      },
      {
        key: 'variable',
        label: 'Guardar PID en',
        type: 'variable'
      }
    ]
  },

  kill_process: {
    title: 'Terminar Proceso',
    icon: 'fa-times',
    description: 'Termina un proceso en ejecución',
    fields: [
      {
        key: 'killBy',
        label: 'Terminar por',
        type: 'buttonGroup',
        default: 'name',
        options: [
          { value: 'name', label: 'Nombre' },
          { value: 'pid', label: 'PID' }
        ]
      },
      {
        key: 'processName',
        label: 'Nombre del proceso',
        type: 'text',
        placeholder: 'notepad.exe, chrome.exe',
        condition: { field: 'killBy', value: 'name' }
      },
      {
        key: 'pid',
        label: 'ID de proceso (PID)',
        type: 'number',
        condition: { field: 'killBy', value: 'pid' }
      },
      {
        key: 'force',
        label: 'Forzar cierre',
        type: 'checkbox',
        default: false
      }
    ]
  },

  get_environment_variable: {
    title: 'Obtener Variable de Entorno',
    icon: 'fa-cog',
    description: 'Obtiene el valor de una variable de entorno',
    fields: [
      {
        key: 'name',
        label: 'Nombre de la variable',
        type: 'text',
        required: true,
        placeholder: 'PATH, TEMP, USERNAME...'
      },
      {
        key: 'variable',
        label: 'Guardar valor en',
        type: 'variable',
        required: true
      }
    ]
  },

  set_environment_variable: {
    title: 'Establecer Variable de Entorno',
    icon: 'fa-cog',
    description: 'Establece una variable de entorno',
    fields: [
      {
        key: 'name',
        label: 'Nombre de la variable',
        type: 'text',
        required: true
      },
      {
        key: 'value',
        label: 'Valor',
        type: 'text',
        required: true
      },
      {
        key: 'scope',
        label: 'Ámbito',
        type: 'select',
        default: 'process',
        options: [
          { value: 'process', label: 'Solo este proceso' },
          { value: 'user', label: 'Usuario actual' },
          { value: 'machine', label: 'Sistema (requiere admin)' }
        ]
      }
    ]
  },

  // ==========================================
  // OCR / RECONOCIMIENTO DE IMAGEN
  // ==========================================
  ocr_screen: {
    title: 'OCR de Pantalla',
    icon: 'fa-eye',
    description: 'Reconoce texto en una región de la pantalla',
    fields: [
      {
        key: 'region',
        label: 'Región',
        type: 'select',
        default: 'fullscreen',
        options: [
          { value: 'fullscreen', label: 'Pantalla completa' },
          { value: 'activeWindow', label: 'Ventana activa' },
          { value: 'custom', label: 'Región personalizada' }
        ]
      },
      {
        key: 'x',
        label: 'X',
        type: 'number',
        condition: { field: 'region', value: 'custom' }
      },
      {
        key: 'y',
        label: 'Y',
        type: 'number',
        condition: { field: 'region', value: 'custom' }
      },
      {
        key: 'width',
        label: 'Ancho',
        type: 'number',
        condition: { field: 'region', value: 'custom' }
      },
      {
        key: 'height',
        label: 'Alto',
        type: 'number',
        condition: { field: 'region', value: 'custom' }
      },
      {
        key: 'language',
        label: 'Idioma',
        type: 'select',
        default: 'spa',
        options: [
          { value: 'spa', label: 'Español' },
          { value: 'eng', label: 'Inglés' },
          { value: 'por', label: 'Portugués' },
          { value: 'deu', label: 'Alemán' },
          { value: 'fra', label: 'Francés' }
        ]
      },
      {
        key: 'variable',
        label: 'Guardar texto en',
        type: 'variable',
        required: true
      }
    ]
  },

  ocr_image: {
    title: 'OCR de Imagen',
    icon: 'fa-file-image',
    description: 'Reconoce texto en un archivo de imagen',
    fields: [
      {
        key: 'imagePath',
        label: 'Imagen',
        type: 'file',
        required: true,
        fileType: 'open',
        accept: '.png,.jpg,.jpeg,.bmp,.gif,.tiff'
      },
      {
        key: 'language',
        label: 'Idioma',
        type: 'select',
        default: 'spa',
        options: [
          { value: 'spa', label: 'Español' },
          { value: 'eng', label: 'Inglés' },
          { value: 'por', label: 'Portugués' },
          { value: 'deu', label: 'Alemán' },
          { value: 'fra', label: 'Francés' }
        ]
      },
      {
        key: 'preprocessing',
        label: 'Preprocesamiento',
        type: 'select',
        default: 'none',
        options: [
          { value: 'none', label: 'Ninguno' },
          { value: 'grayscale', label: 'Escala de grises' },
          { value: 'threshold', label: 'Umbral' },
          { value: 'denoise', label: 'Reducir ruido' }
        ]
      },
      {
        key: 'variable',
        label: 'Guardar texto en',
        type: 'variable',
        required: true
      }
    ]
  },

  find_image_on_screen: {
    title: 'Buscar Imagen en Pantalla',
    icon: 'fa-search',
    description: 'Busca una imagen dentro de la pantalla',
    fields: [
      {
        key: 'imagePath',
        label: 'Imagen a buscar',
        type: 'file',
        required: true,
        fileType: 'open',
        accept: '.png,.jpg,.jpeg,.bmp'
      },
      {
        key: 'region',
        label: 'Región de búsqueda',
        type: 'select',
        default: 'fullscreen',
        options: [
          { value: 'fullscreen', label: 'Pantalla completa' },
          { value: 'activeWindow', label: 'Ventana activa' },
          { value: 'custom', label: 'Región personalizada' }
        ]
      },
      {
        key: 'x',
        label: 'X',
        type: 'number',
        condition: { field: 'region', value: 'custom' }
      },
      {
        key: 'y',
        label: 'Y',
        type: 'number',
        condition: { field: 'region', value: 'custom' }
      },
      {
        key: 'width',
        label: 'Ancho',
        type: 'number',
        condition: { field: 'region', value: 'custom' }
      },
      {
        key: 'height',
        label: 'Alto',
        type: 'number',
        condition: { field: 'region', value: 'custom' }
      },
      {
        key: 'confidence',
        label: 'Confianza mínima',
        type: 'slider',
        default: 0.8,
        min: 0.5,
        max: 1,
        step: 0.05,
        helpText: 'Porcentaje de similitud requerido'
      },
      {
        key: 'timeout',
        label: 'Timeout (segundos)',
        type: 'number',
        default: 10
      },
      {
        key: 'clickIfFound',
        label: 'Hacer clic si se encuentra',
        type: 'checkbox',
        default: false
      },
      {
        key: 'variable',
        label: 'Guardar coordenadas en',
        type: 'variable',
        helpText: 'Guarda {x, y, found}'
      }
    ]
  },

  wait_for_image: {
    title: 'Esperar Imagen',
    icon: 'fa-hourglass-half',
    description: 'Espera hasta que una imagen aparezca en pantalla',
    fields: [
      {
        key: 'imagePath',
        label: 'Imagen a esperar',
        type: 'file',
        required: true,
        fileType: 'open',
        accept: '.png,.jpg,.jpeg,.bmp'
      },
      {
        key: 'timeout',
        label: 'Timeout (segundos)',
        type: 'number',
        default: 30
      },
      {
        key: 'confidence',
        label: 'Confianza mínima',
        type: 'slider',
        default: 0.8,
        min: 0.5,
        max: 1,
        step: 0.05
      },
      {
        key: 'clickWhenFound',
        label: 'Clic cuando aparezca',
        type: 'checkbox',
        default: false
      },
      {
        key: 'variable',
        label: 'Guardar resultado en',
        type: 'variable'
      }
    ]
  },

  image_compare: {
    title: 'Comparar Imágenes',
    icon: 'fa-images',
    description: 'Compara dos imágenes',
    fields: [
      {
        key: 'image1',
        label: 'Primera imagen',
        type: 'file',
        required: true,
        fileType: 'open',
        accept: '.png,.jpg,.jpeg,.bmp'
      },
      {
        key: 'image2',
        label: 'Segunda imagen',
        type: 'file',
        required: true,
        fileType: 'open',
        accept: '.png,.jpg,.jpeg,.bmp'
      },
      {
        key: 'threshold',
        label: 'Umbral de diferencia',
        type: 'slider',
        default: 0.05,
        min: 0,
        max: 0.5,
        step: 0.01,
        helpText: '0 = exactamente iguales'
      },
      {
        key: 'variable',
        label: 'Guardar resultado en',
        type: 'variable',
        required: true,
        helpText: 'true si son similares'
      }
    ]
  },

  ocr_region: {
    title: 'OCR - Región',
    icon: 'fa-crop',
    description: 'Reconoce texto en una región específica de la pantalla',
    fields: [
      {
        key: 'captureMethod',
        label: 'Método de captura',
        type: 'select',
        default: 'coordinates',
        options: [
          { value: 'coordinates', label: 'Por coordenadas' },
          { value: 'selector', label: 'Por selector de ventana' },
          { value: 'capture', label: 'Capturar región manualmente' }
        ]
      },
      {
        key: 'windowSelector',
        label: 'Ventana',
        type: 'windowWithVariable',
        condition: { field: 'captureMethod', value: 'selector' },
        helpText: 'Seleccione la ventana donde capturar'
      },
      {
        key: 'x',
        label: 'Posición X',
        type: 'number',
        default: 0,
        helpText: 'Coordenada X del inicio de la región'
      },
      {
        key: 'y',
        label: 'Posición Y',
        type: 'number',
        default: 0,
        helpText: 'Coordenada Y del inicio de la región'
      },
      {
        key: 'width',
        label: 'Ancho',
        type: 'number',
        default: 200,
        helpText: 'Ancho de la región en píxeles'
      },
      {
        key: 'height',
        label: 'Alto',
        type: 'number',
        default: 50,
        helpText: 'Alto de la región en píxeles'
      },
      {
        key: 'relativeToWindow',
        label: 'Relativo a ventana',
        type: 'checkbox',
        default: false,
        helpText: 'Las coordenadas son relativas a la ventana seleccionada'
      },
      {
        key: 'ocrEngine',
        label: 'Motor OCR',
        type: 'select',
        default: 'tesseract',
        options: [
          { value: 'tesseract', label: 'Tesseract OCR' },
          { value: 'windows', label: 'Windows OCR' },
          { value: 'google', label: 'Google Vision API' },
          { value: 'azure', label: 'Azure Computer Vision' }
        ]
      },
      {
        key: 'language',
        label: 'Idioma',
        type: 'select',
        default: 'spa',
        options: [
          { value: 'spa', label: 'Español' },
          { value: 'eng', label: 'Inglés' },
          { value: 'por', label: 'Portugués' },
          { value: 'deu', label: 'Alemán' },
          { value: 'fra', label: 'Francés' },
          { value: 'ita', label: 'Italiano' },
          { value: 'jpn', label: 'Japonés' },
          { value: 'chi_sim', label: 'Chino Simplificado' },
          { value: 'kor', label: 'Coreano' }
        ]
      },
      {
        key: 'preprocessing',
        label: 'Preprocesamiento',
        type: 'multiselect',
        default: [],
        options: [
          { value: 'grayscale', label: 'Escala de grises' },
          { value: 'threshold', label: 'Binarización/Umbral' },
          { value: 'denoise', label: 'Reducir ruido' },
          { value: 'deskew', label: 'Corregir inclinación' },
          { value: 'sharpen', label: 'Aumentar nitidez' },
          { value: 'invert', label: 'Invertir colores' }
        ]
      },
      {
        key: 'scaleFactor',
        label: 'Factor de escala',
        type: 'slider',
        default: 2,
        min: 1,
        max: 4,
        step: 0.5,
        helpText: 'Escalar imagen para mejor precisión (2x recomendado)'
      },
      {
        key: 'textType',
        label: 'Tipo de texto',
        type: 'select',
        default: 'auto',
        options: [
          { value: 'auto', label: 'Automático' },
          { value: 'printed', label: 'Texto impreso' },
          { value: 'handwritten', label: 'Manuscrito' },
          { value: 'numbers', label: 'Solo números' },
          { value: 'alphanumeric', label: 'Alfanumérico' }
        ]
      },
      {
        key: 'whitelistChars',
        label: 'Caracteres permitidos',
        type: 'text',
        placeholder: 'Ej: 0123456789ABCDEFabcdef',
        helpText: 'Dejar vacío para todos los caracteres'
      },
      {
        key: 'confidence',
        label: 'Confianza mínima',
        type: 'slider',
        default: 0.6,
        min: 0,
        max: 1,
        step: 0.05,
        helpText: 'Porcentaje mínimo de confianza en el resultado'
      },
      {
        key: 'trimWhitespace',
        label: 'Quitar espacios extra',
        type: 'checkbox',
        default: true
      },
      {
        key: 'saveImage',
        label: 'Guardar imagen capturada',
        type: 'checkbox',
        default: false
      },
      {
        key: 'imagePath',
        label: 'Ruta para guardar imagen',
        type: 'fileWithVariable',
        fileType: 'save',
        accept: '.png,.jpg',
        condition: { field: 'saveImage', value: true }
      },
      {
        key: 'timeout',
        label: 'Timeout (segundos)',
        type: 'number',
        default: 30
      },
      {
        key: 'retryOnEmpty',
        label: 'Reintentar si vacío',
        type: 'checkbox',
        default: false,
        helpText: 'Reintentar OCR si no se detecta texto'
      },
      {
        key: 'retryCount',
        label: 'Número de reintentos',
        type: 'number',
        default: 3,
        condition: { field: 'retryOnEmpty', value: true }
      },
      {
        key: 'retryDelay',
        label: 'Espera entre reintentos (ms)',
        type: 'number',
        default: 500,
        condition: { field: 'retryOnEmpty', value: true }
      },
      {
        key: 'variable',
        label: 'Guardar texto en',
        type: 'variable',
        required: true
      },
      {
        key: 'confidenceVariable',
        label: 'Guardar confianza en',
        type: 'variable',
        helpText: 'Variable para almacenar el nivel de confianza'
      }
    ]
  },

  ocr_document: {
    title: 'OCR - Documento',
    icon: 'fa-file-alt',
    description: 'Extrae texto de documentos PDF o imágenes escaneadas',
    fields: [
      {
        key: 'source',
        label: 'Origen del documento',
        type: 'select',
        default: 'file',
        options: [
          { value: 'file', label: 'Archivo' },
          { value: 'variable', label: 'Variable (Base64)' },
          { value: 'url', label: 'URL' }
        ]
      },
      {
        key: 'filePath',
        label: 'Ruta del documento',
        type: 'fileWithVariable',
        required: true,
        fileType: 'open',
        accept: '.pdf,.png,.jpg,.jpeg,.tiff,.bmp',
        condition: { field: 'source', value: 'file' }
      },
      {
        key: 'documentVariable',
        label: 'Variable del documento',
        type: 'variable',
        condition: { field: 'source', value: 'variable' }
      },
      {
        key: 'documentUrl',
        label: 'URL del documento',
        type: 'textWithVariable',
        condition: { field: 'source', value: 'url' }
      },
      {
        key: 'documentType',
        label: 'Tipo de documento',
        type: 'select',
        default: 'auto',
        options: [
          { value: 'auto', label: 'Detectar automáticamente' },
          { value: 'invoice', label: 'Factura' },
          { value: 'receipt', label: 'Recibo' },
          { value: 'id_card', label: 'Documento de identidad' },
          { value: 'passport', label: 'Pasaporte' },
          { value: 'contract', label: 'Contrato' },
          { value: 'form', label: 'Formulario' },
          { value: 'table', label: 'Tabla' }
        ]
      },
      {
        key: 'pages',
        label: 'Páginas a procesar',
        type: 'text',
        default: 'all',
        placeholder: 'all, 1-3, 1,3,5',
        helpText: 'Rango de páginas o "all" para todas'
      },
      {
        key: 'ocrEngine',
        label: 'Motor OCR',
        type: 'select',
        default: 'tesseract',
        options: [
          { value: 'tesseract', label: 'Tesseract OCR' },
          { value: 'azure', label: 'Azure Form Recognizer' },
          { value: 'google', label: 'Google Document AI' },
          { value: 'aws', label: 'AWS Textract' }
        ]
      },
      {
        key: 'language',
        label: 'Idioma del documento',
        type: 'select',
        default: 'spa',
        options: [
          { value: 'spa', label: 'Español' },
          { value: 'eng', label: 'Inglés' },
          { value: 'por', label: 'Portugués' },
          { value: 'deu', label: 'Alemán' },
          { value: 'fra', label: 'Francés' },
          { value: 'multi', label: 'Múltiples idiomas' }
        ]
      },
      {
        key: 'extractTables',
        label: 'Extraer tablas',
        type: 'checkbox',
        default: false
      },
      {
        key: 'extractFields',
        label: 'Extraer campos clave-valor',
        type: 'checkbox',
        default: false
      },
      {
        key: 'preserveLayout',
        label: 'Preservar diseño',
        type: 'checkbox',
        default: false,
        helpText: 'Mantener formato y posiciones del texto'
      },
      {
        key: 'outputFormat',
        label: 'Formato de salida',
        type: 'select',
        default: 'text',
        options: [
          { value: 'text', label: 'Texto plano' },
          { value: 'json', label: 'JSON estructurado' },
          { value: 'markdown', label: 'Markdown' },
          { value: 'html', label: 'HTML' }
        ]
      },
      {
        key: 'variable',
        label: 'Guardar resultado en',
        type: 'variable',
        required: true
      },
      {
        key: 'tablesVariable',
        label: 'Guardar tablas en',
        type: 'variable',
        condition: { field: 'extractTables', value: true }
      },
      {
        key: 'fieldsVariable',
        label: 'Guardar campos en',
        type: 'variable',
        condition: { field: 'extractFields', value: true }
      }
    ]
  },

  image_click: {
    title: 'Click en Imagen',
    icon: 'fa-mouse-pointer',
    description: 'Busca una imagen en pantalla y hace clic sobre ella',
    fields: [
      {
        key: 'imagePath',
        label: 'Imagen a buscar',
        type: 'fileWithVariable',
        required: true,
        fileType: 'open',
        accept: '.png,.jpg,.jpeg,.bmp'
      },
      {
        key: 'searchRegion',
        label: 'Región de búsqueda',
        type: 'select',
        default: 'fullscreen',
        options: [
          { value: 'fullscreen', label: 'Pantalla completa' },
          { value: 'activeWindow', label: 'Ventana activa' },
          { value: 'custom', label: 'Región personalizada' }
        ]
      },
      {
        key: 'regionX',
        label: 'Región X',
        type: 'number',
        condition: { field: 'searchRegion', value: 'custom' }
      },
      {
        key: 'regionY',
        label: 'Región Y',
        type: 'number',
        condition: { field: 'searchRegion', value: 'custom' }
      },
      {
        key: 'regionWidth',
        label: 'Región Ancho',
        type: 'number',
        condition: { field: 'searchRegion', value: 'custom' }
      },
      {
        key: 'regionHeight',
        label: 'Región Alto',
        type: 'number',
        condition: { field: 'searchRegion', value: 'custom' }
      },
      {
        key: 'confidence',
        label: 'Confianza mínima',
        type: 'slider',
        default: 0.8,
        min: 0.5,
        max: 1,
        step: 0.05,
        helpText: 'Porcentaje de similitud requerido'
      },
      {
        key: 'clickType',
        label: 'Tipo de clic',
        type: 'select',
        default: 'left',
        options: [
          { value: 'left', label: 'Clic izquierdo' },
          { value: 'right', label: 'Clic derecho' },
          { value: 'double', label: 'Doble clic' },
          { value: 'middle', label: 'Clic medio' }
        ]
      },
      {
        key: 'clickPosition',
        label: 'Posición del clic',
        type: 'select',
        default: 'center',
        options: [
          { value: 'center', label: 'Centro de la imagen' },
          { value: 'topLeft', label: 'Esquina superior izquierda' },
          { value: 'topRight', label: 'Esquina superior derecha' },
          { value: 'bottomLeft', label: 'Esquina inferior izquierda' },
          { value: 'bottomRight', label: 'Esquina inferior derecha' },
          { value: 'custom', label: 'Offset personalizado' }
        ]
      },
      {
        key: 'offsetX',
        label: 'Offset X',
        type: 'number',
        default: 0,
        condition: { field: 'clickPosition', value: 'custom' }
      },
      {
        key: 'offsetY',
        label: 'Offset Y',
        type: 'number',
        default: 0,
        condition: { field: 'clickPosition', value: 'custom' }
      },
      {
        key: 'waitBefore',
        label: 'Esperar antes (ms)',
        type: 'number',
        default: 0
      },
      {
        key: 'waitAfter',
        label: 'Esperar después (ms)',
        type: 'number',
        default: 200
      },
      {
        key: 'timeout',
        label: 'Timeout (segundos)',
        type: 'number',
        default: 10
      },
      {
        key: 'throwOnNotFound',
        label: 'Error si no encuentra',
        type: 'checkbox',
        default: true
      },
      {
        key: 'foundVariable',
        label: 'Guardar si encontró en',
        type: 'variable',
        helpText: 'Variable booleana indicando si se encontró'
      }
    ]
  },

  screenshot_region: {
    title: 'Captura de Región',
    icon: 'fa-camera',
    description: 'Captura una región específica de la pantalla',
    fields: [
      {
        key: 'captureMode',
        label: 'Modo de captura',
        type: 'select',
        default: 'coordinates',
        options: [
          { value: 'fullscreen', label: 'Pantalla completa' },
          { value: 'activeWindow', label: 'Ventana activa' },
          { value: 'coordinates', label: 'Por coordenadas' },
          { value: 'element', label: 'Por selector de elemento' }
        ]
      },
      {
        key: 'windowSelector',
        label: 'Ventana',
        type: 'windowWithVariable',
        condition: { field: 'captureMode', value: 'activeWindow' }
      },
      {
        key: 'x',
        label: 'Posición X',
        type: 'number',
        default: 0,
        condition: { field: 'captureMode', value: 'coordinates' }
      },
      {
        key: 'y',
        label: 'Posición Y',
        type: 'number',
        default: 0,
        condition: { field: 'captureMode', value: 'coordinates' }
      },
      {
        key: 'width',
        label: 'Ancho',
        type: 'number',
        default: 400,
        condition: { field: 'captureMode', value: 'coordinates' }
      },
      {
        key: 'height',
        label: 'Alto',
        type: 'number',
        default: 300,
        condition: { field: 'captureMode', value: 'coordinates' }
      },
      {
        key: 'elementSelector',
        label: 'Selector CSS',
        type: 'text',
        condition: { field: 'captureMode', value: 'element' }
      },
      {
        key: 'format',
        label: 'Formato de imagen',
        type: 'select',
        default: 'png',
        options: [
          { value: 'png', label: 'PNG' },
          { value: 'jpg', label: 'JPEG' },
          { value: 'bmp', label: 'BMP' }
        ]
      },
      {
        key: 'quality',
        label: 'Calidad (JPEG)',
        type: 'slider',
        default: 90,
        min: 10,
        max: 100,
        step: 5,
        condition: { field: 'format', value: 'jpg' }
      },
      {
        key: 'saveToFile',
        label: 'Guardar en archivo',
        type: 'checkbox',
        default: true
      },
      {
        key: 'filePath',
        label: 'Ruta del archivo',
        type: 'fileWithVariable',
        fileType: 'save',
        accept: '.png,.jpg,.bmp',
        condition: { field: 'saveToFile', value: true }
      },
      {
        key: 'saveToVariable',
        label: 'Guardar en variable (Base64)',
        type: 'checkbox',
        default: false
      },
      {
        key: 'base64Variable',
        label: 'Variable Base64',
        type: 'variable',
        condition: { field: 'saveToVariable', value: true }
      },
      {
        key: 'includeTimestamp',
        label: 'Incluir timestamp en nombre',
        type: 'checkbox',
        default: false
      },
      {
        key: 'pathVariable',
        label: 'Guardar ruta en',
        type: 'variable',
        helpText: 'Variable para almacenar la ruta del archivo guardado'
      }
    ]
  },

  // ==========================================
  // GESTIÓN DE VENTANAS
  // ==========================================
  window_get_active: {
    title: 'Obtener Ventana Activa',
    icon: 'fa-window-maximize',
    description: 'Obtiene información de la ventana activa',
    fields: [
      {
        key: 'variable',
        label: 'Guardar info en',
        type: 'variable',
        required: true,
        helpText: 'Guarda título, handle, clase, etc.'
      }
    ]
  },

  window_find: {
    title: 'Buscar Ventana',
    icon: 'fa-search',
    description: 'Busca ventanas por título o clase',
    fields: [
      {
        key: 'searchBy',
        label: 'Buscar por',
        type: 'buttonGroup',
        default: 'title',
        options: [
          { value: 'title', label: 'Título' },
          { value: 'class', label: 'Clase' },
          { value: 'process', label: 'Proceso' }
        ]
      },
      {
        key: 'title',
        label: 'Título de ventana',
        type: 'text',
        placeholder: 'Contiene este texto...',
        condition: { field: 'searchBy', value: 'title' }
      },
      {
        key: 'className',
        label: 'Nombre de clase',
        type: 'text',
        placeholder: 'Chrome_WidgetWin_1',
        condition: { field: 'searchBy', value: 'class' }
      },
      {
        key: 'processName',
        label: 'Nombre de proceso',
        type: 'text',
        placeholder: 'chrome.exe, notepad.exe',
        condition: { field: 'searchBy', value: 'process' }
      },
      {
        key: 'matchType',
        label: 'Tipo de coincidencia',
        type: 'select',
        default: 'contains',
        options: [
          { value: 'exact', label: 'Exacta' },
          { value: 'contains', label: 'Contiene' },
          { value: 'startsWith', label: 'Empieza con' },
          { value: 'regex', label: 'Expresión regular' }
        ]
      },
      {
        key: 'variable',
        label: 'Guardar ventana(s) en',
        type: 'variable',
        required: true
      }
    ]
  },

  window_focus: {
    title: 'Enfocar Ventana',
    icon: 'fa-window-restore',
    description: 'Trae una ventana al frente',
    fields: [
      {
        key: 'window',
        label: 'Ventana',
        type: 'variable',
        helpText: 'Variable con la ventana o buscar por título'
      },
      {
        key: 'title',
        label: 'O buscar por título',
        type: 'text',
        placeholder: 'Título de la ventana'
      }
    ]
  },

  window_minimize: {
    title: 'Minimizar Ventana',
    icon: 'fa-window-minimize',
    description: 'Minimiza una ventana',
    fields: [
      {
        key: 'window',
        label: 'Ventana',
        type: 'variable'
      },
      {
        key: 'title',
        label: 'O buscar por título',
        type: 'text'
      }
    ]
  },

  window_maximize: {
    title: 'Maximizar Ventana',
    icon: 'fa-window-maximize',
    description: 'Maximiza una ventana',
    fields: [
      {
        key: 'window',
        label: 'Ventana',
        type: 'variable'
      },
      {
        key: 'title',
        label: 'O buscar por título',
        type: 'text'
      }
    ]
  },

  window_restore: {
    title: 'Restaurar Ventana',
    icon: 'fa-window-restore',
    description: 'Restaura una ventana a su tamaño normal',
    fields: [
      {
        key: 'window',
        label: 'Ventana',
        type: 'variable'
      },
      {
        key: 'title',
        label: 'O buscar por título',
        type: 'text'
      }
    ]
  },

  window_close: {
    title: 'Cerrar Ventana',
    icon: 'fa-times',
    description: 'Cierra una ventana',
    fields: [
      {
        key: 'window',
        label: 'Ventana',
        type: 'variable'
      },
      {
        key: 'title',
        label: 'O buscar por título',
        type: 'text'
      },
      {
        key: 'force',
        label: 'Forzar cierre',
        type: 'checkbox',
        default: false
      }
    ]
  },

  window_resize: {
    title: 'Redimensionar Ventana',
    icon: 'fa-expand-arrows-alt',
    description: 'Cambia el tamaño de una ventana',
    fields: [
      {
        key: 'window',
        label: 'Ventana',
        type: 'variable'
      },
      {
        key: 'title',
        label: 'O buscar por título',
        type: 'text'
      },
      {
        key: 'width',
        label: 'Ancho',
        type: 'number',
        required: true
      },
      {
        key: 'height',
        label: 'Alto',
        type: 'number',
        required: true
      }
    ]
  },

  window_move: {
    title: 'Mover Ventana',
    icon: 'fa-arrows-alt',
    description: 'Mueve una ventana a una posición',
    fields: [
      {
        key: 'window',
        label: 'Ventana',
        type: 'variable'
      },
      {
        key: 'title',
        label: 'O buscar por título',
        type: 'text'
      },
      {
        key: 'x',
        label: 'Posición X',
        type: 'number',
        required: true
      },
      {
        key: 'y',
        label: 'Posición Y',
        type: 'number',
        required: true
      }
    ]
  },

  window_get_list: {
    title: 'Listar Ventanas',
    icon: 'fa-list',
    description: 'Obtiene lista de todas las ventanas abiertas',
    fields: [
      {
        key: 'visibleOnly',
        label: 'Solo visibles',
        type: 'checkbox',
        default: true
      },
      {
        key: 'filter',
        label: 'Filtrar por nombre',
        type: 'text',
        placeholder: 'Opcional: filtrar por texto'
      },
      {
        key: 'variable',
        label: 'Guardar lista en',
        type: 'variable',
        required: true
      }
    ]
  },

  window_get_bounds: {
    title: 'Obtener Dimensiones',
    icon: 'fa-ruler-combined',
    description: 'Obtiene posición y tamaño de una ventana',
    fields: [
      {
        key: 'window',
        label: 'Ventana',
        type: 'variable'
      },
      {
        key: 'title',
        label: 'O buscar por título',
        type: 'text'
      },
      {
        key: 'variable',
        label: 'Guardar en',
        type: 'variable',
        required: true,
        helpText: 'Guarda {x, y, width, height}'
      }
    ]
  },

  window_screenshot: {
    title: 'Capturar Ventana',
    icon: 'fa-camera',
    description: 'Toma captura de una ventana específica',
    fields: [
      {
        key: 'window',
        label: 'Ventana',
        type: 'variable'
      },
      {
        key: 'title',
        label: 'O buscar por título',
        type: 'text'
      },
      {
        key: 'savePath',
        label: 'Guardar en',
        type: 'file',
        fileType: 'save',
        accept: '.png,.jpg'
      },
      {
        key: 'variable',
        label: 'O guardar en variable (Base64)',
        type: 'variable'
      }
    ]
  },

  // ==========================================
  // NAVEGADORES - DETECCIÓN Y GESTIÓN
  // ==========================================
  browser_get_windows: {
    title: 'Obtener Ventanas de Navegador',
    icon: 'fa-globe',
    description: 'Obtiene todas las ventanas de navegador abiertas',
    fields: [
      {
        key: 'browser',
        label: 'Navegador',
        type: 'select',
        default: 'all',
        options: [
          { value: 'all', label: 'Todos los navegadores' },
          { value: 'chrome', label: 'Google Chrome', icon: 'fab fa-chrome' },
          { value: 'edge', label: 'Microsoft Edge', icon: 'fab fa-edge' },
          { value: 'firefox', label: 'Mozilla Firefox', icon: 'fab fa-firefox' },
          { value: 'brave', label: 'Brave' }
        ]
      },
      {
        key: 'variable',
        label: 'Guardar ventanas en',
        type: 'variable',
        required: true
      }
    ]
  },

  browser_get_tabs: {
    title: 'Obtener Pestañas',
    icon: 'fa-folder-open',
    description: 'Obtiene las pestañas abiertas de un navegador',
    fields: [
      {
        key: 'browser',
        label: 'Navegador',
        type: 'select',
        default: 'chrome',
        options: [
          { value: 'chrome', label: 'Google Chrome' },
          { value: 'edge', label: 'Microsoft Edge' },
          { value: 'firefox', label: 'Mozilla Firefox' }
        ]
      },
      {
        key: 'variable',
        label: 'Guardar pestañas en',
        type: 'variable',
        required: true
      }
    ]
  },

  browser_activate_tab: {
    title: 'Activar Pestaña',
    icon: 'fa-mouse-pointer',
    description: 'Activa una pestaña específica del navegador',
    fields: [
      {
        key: 'browser',
        label: 'Navegador',
        type: 'select',
        default: 'chrome',
        options: [
          { value: 'chrome', label: 'Google Chrome' },
          { value: 'edge', label: 'Microsoft Edge' },
          { value: 'firefox', label: 'Mozilla Firefox' }
        ]
      },
      {
        key: 'findBy',
        label: 'Buscar por',
        type: 'buttonGroup',
        default: 'title',
        options: [
          { value: 'title', label: 'Título' },
          { value: 'url', label: 'URL' },
          { value: 'index', label: 'Índice' }
        ]
      },
      {
        key: 'title',
        label: 'Título de la pestaña',
        type: 'text',
        condition: { field: 'findBy', value: 'title' }
      },
      {
        key: 'url',
        label: 'URL',
        type: 'text',
        condition: { field: 'findBy', value: 'url' }
      },
      {
        key: 'index',
        label: 'Índice (0-based)',
        type: 'number',
        condition: { field: 'findBy', value: 'index' }
      }
    ]
  },

  browser_close_tab: {
    title: 'Cerrar Pestaña',
    icon: 'fa-times',
    description: 'Cierra una pestaña del navegador',
    fields: [
      {
        key: 'browser',
        label: 'Navegador',
        type: 'select',
        default: 'chrome',
        options: [
          { value: 'chrome', label: 'Google Chrome' },
          { value: 'edge', label: 'Microsoft Edge' },
          { value: 'firefox', label: 'Mozilla Firefox' }
        ]
      },
      {
        key: 'findBy',
        label: 'Buscar por',
        type: 'buttonGroup',
        default: 'title',
        options: [
          { value: 'title', label: 'Título' },
          { value: 'url', label: 'URL' },
          { value: 'current', label: 'Pestaña actual' }
        ]
      },
      {
        key: 'title',
        label: 'Título de la pestaña',
        type: 'text',
        condition: { field: 'findBy', value: 'title' }
      },
      {
        key: 'url',
        label: 'URL',
        type: 'text',
        condition: { field: 'findBy', value: 'url' }
      }
    ]
  },

  // ==========================================
  // VARIABLES Y DATOS
  // ==========================================
  set_variable: {
    title: 'Establecer Variable',
    icon: 'fa-code',
    description: 'Crea o modifica una variable',
    fields: [
      {
        key: 'name',
        label: 'Nombre de variable',
        type: 'variable',
        required: true
      },
      {
        key: 'valueType',
        label: 'Tipo de valor',
        type: 'select',
        default: 'text',
        options: [
          { value: 'text', label: 'Texto' },
          { value: 'number', label: 'Número' },
          { value: 'boolean', label: 'Booleano' },
          { value: 'array', label: 'Array' },
          { value: 'object', label: 'Objeto JSON' },
          { value: 'expression', label: 'Expresión' }
        ]
      },
      {
        key: 'value',
        label: 'Valor',
        type: 'textarea',
        required: true,
        rows: 2
      }
    ]
  },

  get_variable: {
    title: 'Obtener Variable',
    icon: 'fa-code',
    description: 'Obtiene el valor de una variable',
    fields: [
      {
        key: 'name',
        label: 'Nombre de variable',
        type: 'variable',
        required: true
      },
      {
        key: 'outputVariable',
        label: 'Guardar en',
        type: 'variable',
        required: true
      }
    ]
  },

  increment_variable: {
    title: 'Incrementar Variable',
    icon: 'fa-plus',
    description: 'Incrementa el valor de una variable numérica',
    fields: [
      {
        key: 'name',
        label: 'Variable',
        type: 'variable',
        required: true
      },
      {
        key: 'amount',
        label: 'Cantidad',
        type: 'number',
        default: 1
      }
    ]
  },

  decrement_variable: {
    title: 'Decrementar Variable',
    icon: 'fa-minus',
    description: 'Decrementa el valor de una variable numérica',
    fields: [
      {
        key: 'name',
        label: 'Variable',
        type: 'variable',
        required: true
      },
      {
        key: 'amount',
        label: 'Cantidad',
        type: 'number',
        default: 1
      }
    ]
  },

  // ==========================================
  // STRING / TEXTO
  // ==========================================
  string_concat: {
    title: 'Concatenar Texto',
    icon: 'fa-link',
    description: 'Une múltiples textos',
    fields: [
      {
        key: 'texts',
        label: 'Textos a unir',
        type: 'tags',
        required: true
      },
      {
        key: 'separator',
        label: 'Separador',
        type: 'text',
        default: ''
      },
      {
        key: 'variable',
        label: 'Guardar en',
        type: 'variable',
        required: true
      }
    ]
  },

  string_split: {
    title: 'Dividir Texto',
    icon: 'fa-cut',
    description: 'Divide un texto en partes',
    fields: [
      {
        key: 'text',
        label: 'Texto',
        type: 'text',
        required: true
      },
      {
        key: 'delimiter',
        label: 'Delimitador',
        type: 'text',
        required: true,
        default: ','
      },
      {
        key: 'variable',
        label: 'Guardar array en',
        type: 'variable',
        required: true
      }
    ]
  },

  string_replace: {
    title: 'Reemplazar Texto',
    icon: 'fa-exchange-alt',
    description: 'Reemplaza texto dentro de una cadena',
    fields: [
      {
        key: 'text',
        label: 'Texto original',
        type: 'textarea',
        required: true,
        rows: 2
      },
      {
        key: 'find',
        label: 'Buscar',
        type: 'text',
        required: true
      },
      {
        key: 'replace',
        label: 'Reemplazar con',
        type: 'text'
      },
      {
        key: 'useRegex',
        label: 'Usar expresión regular',
        type: 'checkbox',
        default: false
      },
      {
        key: 'replaceAll',
        label: 'Reemplazar todos',
        type: 'checkbox',
        default: true
      },
      {
        key: 'variable',
        label: 'Guardar en',
        type: 'variable',
        required: true
      }
    ]
  },

  string_trim: {
    title: 'Recortar Espacios',
    icon: 'fa-text-width',
    description: 'Elimina espacios al inicio y final',
    fields: [
      {
        key: 'text',
        label: 'Texto',
        type: 'text',
        required: true
      },
      {
        key: 'trimType',
        label: 'Tipo',
        type: 'buttonGroup',
        default: 'both',
        options: [
          { value: 'both', label: 'Ambos' },
          { value: 'start', label: 'Inicio' },
          { value: 'end', label: 'Final' }
        ]
      },
      {
        key: 'variable',
        label: 'Guardar en',
        type: 'variable',
        required: true
      }
    ]
  },

  string_substring: {
    title: 'Extraer Subcadena',
    icon: 'fa-text-width',
    description: 'Extrae una parte del texto',
    fields: [
      {
        key: 'text',
        label: 'Texto',
        type: 'text',
        required: true
      },
      {
        key: 'start',
        label: 'Posición inicial',
        type: 'number',
        default: 0
      },
      {
        key: 'length',
        label: 'Longitud',
        type: 'number',
        helpText: 'Dejar vacío para hasta el final'
      },
      {
        key: 'variable',
        label: 'Guardar en',
        type: 'variable',
        required: true
      }
    ]
  },

  string_to_upper: {
    title: 'Convertir a Mayúsculas',
    icon: 'fa-font',
    description: 'Convierte texto a mayúsculas',
    fields: [
      {
        key: 'text',
        label: 'Texto',
        type: 'text',
        required: true
      },
      {
        key: 'variable',
        label: 'Guardar en',
        type: 'variable',
        required: true
      }
    ]
  },

  string_to_lower: {
    title: 'Convertir a Minúsculas',
    icon: 'fa-font',
    description: 'Convierte texto a minúsculas',
    fields: [
      {
        key: 'text',
        label: 'Texto',
        type: 'text',
        required: true
      },
      {
        key: 'variable',
        label: 'Guardar en',
        type: 'variable',
        required: true
      }
    ]
  },

  regex_match: {
    title: 'Extraer con Regex',
    icon: 'fa-asterisk',
    description: 'Extrae texto usando expresiones regulares',
    fields: [
      {
        key: 'text',
        label: 'Texto',
        type: 'textarea',
        required: true,
        rows: 2
      },
      {
        key: 'pattern',
        label: 'Patrón Regex',
        type: 'text',
        required: true,
        placeholder: '\\d+, [a-zA-Z]+, etc.'
      },
      {
        key: 'flags',
        label: 'Flags',
        type: 'multiSelect',
        options: [
          { value: 'g', label: 'Global (g)' },
          { value: 'i', label: 'Case insensitive (i)' },
          { value: 'm', label: 'Multiline (m)' }
        ]
      },
      {
        key: 'variable',
        label: 'Guardar coincidencias en',
        type: 'variable',
        required: true
      }
    ]
  },

  // ==========================================
  // FECHA Y HORA
  // ==========================================
  datetime_now: {
    title: 'Fecha/Hora Actual',
    icon: 'fa-clock',
    description: 'Obtiene la fecha y hora actual',
    fields: [
      {
        key: 'format',
        label: 'Formato',
        type: 'select',
        default: 'iso',
        options: [
          { value: 'iso', label: 'ISO (2024-01-15T10:30:00)' },
          { value: 'date', label: 'Solo fecha (2024-01-15)' },
          { value: 'time', label: 'Solo hora (10:30:00)' },
          { value: 'custom', label: 'Personalizado' }
        ]
      },
      {
        key: 'customFormat',
        label: 'Formato personalizado',
        type: 'text',
        placeholder: 'dd/MM/yyyy HH:mm:ss',
        condition: { field: 'format', value: 'custom' }
      },
      {
        key: 'variable',
        label: 'Guardar en',
        type: 'variable',
        required: true
      }
    ]
  },

  datetime_format: {
    title: 'Formatear Fecha',
    icon: 'fa-calendar-alt',
    description: 'Formatea una fecha',
    fields: [
      {
        key: 'date',
        label: 'Fecha',
        type: 'text',
        required: true
      },
      {
        key: 'inputFormat',
        label: 'Formato de entrada',
        type: 'text',
        default: 'auto'
      },
      {
        key: 'outputFormat',
        label: 'Formato de salida',
        type: 'text',
        required: true,
        placeholder: 'dd/MM/yyyy HH:mm'
      },
      {
        key: 'variable',
        label: 'Guardar en',
        type: 'variable',
        required: true
      }
    ]
  },

  datetime_add: {
    title: 'Sumar a Fecha',
    icon: 'fa-calendar-plus',
    description: 'Suma tiempo a una fecha',
    fields: [
      {
        key: 'date',
        label: 'Fecha',
        type: 'text',
        required: true
      },
      {
        key: 'amount',
        label: 'Cantidad',
        type: 'number',
        required: true
      },
      {
        key: 'unit',
        label: 'Unidad',
        type: 'select',
        default: 'days',
        options: [
          { value: 'seconds', label: 'Segundos' },
          { value: 'minutes', label: 'Minutos' },
          { value: 'hours', label: 'Horas' },
          { value: 'days', label: 'Días' },
          { value: 'weeks', label: 'Semanas' },
          { value: 'months', label: 'Meses' },
          { value: 'years', label: 'Años' }
        ]
      },
      {
        key: 'variable',
        label: 'Guardar en',
        type: 'variable',
        required: true
      }
    ]
  },

  datetime_diff: {
    title: 'Diferencia de Fechas',
    icon: 'fa-calendar-minus',
    description: 'Calcula la diferencia entre dos fechas',
    fields: [
      {
        key: 'date1',
        label: 'Primera fecha',
        type: 'text',
        required: true
      },
      {
        key: 'date2',
        label: 'Segunda fecha',
        type: 'text',
        required: true
      },
      {
        key: 'unit',
        label: 'Unidad de resultado',
        type: 'select',
        default: 'days',
        options: [
          { value: 'seconds', label: 'Segundos' },
          { value: 'minutes', label: 'Minutos' },
          { value: 'hours', label: 'Horas' },
          { value: 'days', label: 'Días' }
        ]
      },
      {
        key: 'variable',
        label: 'Guardar diferencia en',
        type: 'variable',
        required: true
      }
    ]
  },

  // ==========================================
  // JSON
  // ==========================================
  json_parse: {
    title: 'Parsear JSON',
    icon: 'fa-code',
    description: 'Convierte texto JSON a objeto',
    fields: [
      {
        key: 'jsonText',
        label: 'Texto JSON',
        type: 'code',
        language: 'json',
        required: true,
        rows: 5
      },
      {
        key: 'variable',
        label: 'Guardar objeto en',
        type: 'variable',
        required: true
      }
    ]
  },

  json_stringify: {
    title: 'Convertir a JSON',
    icon: 'fa-code',
    description: 'Convierte objeto a texto JSON',
    fields: [
      {
        key: 'object',
        label: 'Objeto/Variable',
        type: 'variable',
        required: true
      },
      {
        key: 'pretty',
        label: 'Formato legible',
        type: 'checkbox',
        default: true
      },
      {
        key: 'variable',
        label: 'Guardar JSON en',
        type: 'variable',
        required: true
      }
    ]
  },

  json_get_value: {
    title: 'Obtener Valor JSON',
    icon: 'fa-search',
    description: 'Obtiene un valor de un objeto JSON',
    fields: [
      {
        key: 'object',
        label: 'Objeto JSON',
        type: 'variable',
        required: true
      },
      {
        key: 'path',
        label: 'Ruta',
        type: 'text',
        required: true,
        placeholder: 'data.users[0].name',
        helpText: 'Usa notación de punto o corchetes'
      },
      {
        key: 'variable',
        label: 'Guardar valor en',
        type: 'variable',
        required: true
      }
    ]
  },

  json_set_value: {
    title: 'Establecer Valor JSON',
    icon: 'fa-edit',
    description: 'Establece un valor en un objeto JSON',
    fields: [
      {
        key: 'object',
        label: 'Objeto JSON',
        type: 'variable',
        required: true
      },
      {
        key: 'path',
        label: 'Ruta',
        type: 'text',
        required: true,
        placeholder: 'data.users[0].name'
      },
      {
        key: 'value',
        label: 'Nuevo valor',
        type: 'text',
        required: true
      }
    ]
  },

  // ==========================================
  // DIÁLOGOS DEL SISTEMA (Windows)
  // ==========================================
  select_folder: {
    title: 'Seleccionar Carpeta',
    icon: 'fa-folder',
    description: 'Muestra un diálogo nativo de Windows para seleccionar una carpeta',
    fields: [
      {
        key: 'title',
        label: 'Título del diálogo',
        type: 'text',
        default: 'Seleccione una carpeta',
        placeholder: 'Seleccione una carpeta',
        helpText: 'Texto que aparece en el título del diálogo'
      },
      {
        key: 'variable',
        label: 'Guardar en variable',
        type: 'variable',
        required: true,
        default: 'carpeta',
        placeholder: 'carpeta',
        helpText: 'Nombre de la variable donde se guardará la ruta seleccionada'
      },
      {
        key: 'initialDirectory',
        label: 'Directorio inicial',
        type: 'textWithVariable',
        placeholder: 'C:\\Users\\',
        helpText: 'Carpeta donde se abrirá el diálogo (opcional)'
      }
    ]
  },

  select_file: {
    title: 'Seleccionar Archivo',
    icon: 'fa-folder-open',
    description: 'Muestra un diálogo nativo de Windows para seleccionar un archivo',
    fields: [
      {
        key: 'title',
        label: 'Título del diálogo',
        type: 'text',
        default: 'Seleccione un archivo',
        placeholder: 'Seleccione un archivo',
        helpText: 'Texto que aparece en el título del diálogo'
      },
      {
        key: 'variable',
        label: 'Guardar en variable',
        type: 'variable',
        required: true,
        default: 'archivo',
        placeholder: 'archivo',
        helpText: 'Nombre de la variable donde se guardará la ruta del archivo'
      },
      {
        key: 'filter',
        label: 'Filtro de archivos',
        type: 'text',
        default: 'Todos los archivos (*.*)|*.*',
        placeholder: 'Todos los archivos (*.*)|*.*',
        helpText: 'Ej: Excel (*.xlsx)|*.xlsx|PDF (*.pdf)|*.pdf'
      },
      {
        key: 'initialDirectory',
        label: 'Directorio inicial',
        type: 'textWithVariable',
        placeholder: 'C:\\Users\\',
        helpText: 'Carpeta donde se abrirá el diálogo (opcional)'
      },
      {
        key: 'multiSelect',
        label: 'Selección múltiple',
        type: 'checkbox',
        default: false,
        helpText: 'Permitir seleccionar varios archivos'
      }
    ]
  },

  message_box: {
    title: 'Message Box',
    icon: 'fa-window-restore',
    description: 'Muestra un cuadro de mensaje nativo de Windows',
    fields: [
      {
        key: 'title',
        label: 'Título',
        type: 'textWithVariable',
        required: true,
        default: 'Mensaje',
        placeholder: 'Título del mensaje'
      },
      {
        key: 'message',
        label: 'Mensaje',
        type: 'textareaWithVariable',
        required: true,
        rows: 3,
        placeholder: 'Contenido del mensaje'
      },
      {
        key: 'type',
        label: 'Tipo de mensaje',
        type: 'select',
        default: 'info',
        options: [
          { value: 'info', label: 'Información' },
          { value: 'warning', label: 'Advertencia' },
          { value: 'error', label: 'Error' },
          { value: 'question', label: 'Pregunta' }
        ]
      },
      {
        key: 'buttons',
        label: 'Botones',
        type: 'select',
        default: 'ok',
        options: [
          { value: 'ok', label: 'OK' },
          { value: 'okcancel', label: 'OK / Cancelar' },
          { value: 'yesno', label: 'Sí / No' },
          { value: 'yesnocancel', label: 'Sí / No / Cancelar' }
        ]
      },
      {
        key: 'resultVariable',
        label: 'Guardar resultado en',
        type: 'variable',
        placeholder: 'respuesta',
        helpText: 'Variable para guardar el botón presionado (ok, cancel, yes, no)'
      }
    ]
  },

  input_dialog: {
    title: 'Input Dialog',
    icon: 'fa-keyboard',
    description: 'Muestra un cuadro de diálogo para ingresar texto',
    fields: [
      {
        key: 'title',
        label: 'Título',
        type: 'textWithVariable',
        required: true,
        default: 'Ingrese un valor',
        placeholder: 'Título del diálogo'
      },
      {
        key: 'message',
        label: 'Mensaje/Instrucción',
        type: 'textareaWithVariable',
        rows: 2,
        placeholder: 'Instrucciones para el usuario'
      },
      {
        key: 'defaultValue',
        label: 'Valor por defecto',
        type: 'textWithVariable',
        placeholder: 'Valor inicial (opcional)'
      },
      {
        key: 'variable',
        label: 'Guardar en variable',
        type: 'variable',
        required: true,
        default: 'entrada',
        placeholder: 'entrada',
        helpText: 'Variable donde se guardará el texto ingresado'
      }
    ]
  },

  confirm_dialog: {
    title: 'Confirm Dialog',
    icon: 'fa-question-circle',
    description: 'Muestra un diálogo de confirmación Sí/No',
    fields: [
      {
        key: 'title',
        label: 'Título',
        type: 'textWithVariable',
        required: true,
        default: '¿Confirmar?',
        placeholder: 'Título del diálogo'
      },
      {
        key: 'message',
        label: 'Pregunta',
        type: 'textareaWithVariable',
        required: true,
        rows: 2,
        placeholder: '¿Está seguro que desea continuar?'
      },
      {
        key: 'variable',
        label: 'Guardar resultado en',
        type: 'variable',
        required: true,
        default: 'confirmado',
        placeholder: 'confirmado',
        helpText: 'Variable booleana (true si Sí, false si No)'
      }
    ]
  },

  notification: {
    title: 'Notificación',
    icon: 'fa-bell',
    description: 'Muestra una notificación del sistema',
    fields: [
      {
        key: 'title',
        label: 'Título',
        type: 'textWithVariable',
        required: true,
        placeholder: 'Título de la notificación'
      },
      {
        key: 'message',
        label: 'Mensaje',
        type: 'textareaWithVariable',
        required: true,
        rows: 2,
        placeholder: 'Contenido de la notificación'
      },
      {
        key: 'type',
        label: 'Tipo',
        type: 'select',
        default: 'info',
        options: [
          { value: 'info', label: 'Información' },
          { value: 'success', label: 'Éxito' },
          { value: 'warning', label: 'Advertencia' },
          { value: 'error', label: 'Error' }
        ]
      },
      {
        key: 'duration',
        label: 'Duración (ms)',
        type: 'number',
        default: 5000,
        min: 1000,
        max: 30000,
        helpText: 'Tiempo que permanece visible'
      }
    ]
  },

  log_message: {
    title: 'Log Message',
    icon: 'fa-terminal',
    description: 'Registra un mensaje en el log de ejecución',
    fields: [
      {
        key: 'message',
        label: 'Mensaje',
        type: 'textareaWithVariable',
        required: true,
        rows: 2,
        placeholder: 'Mensaje a registrar'
      },
      {
        key: 'level',
        label: 'Nivel',
        type: 'select',
        default: 'info',
        options: [
          { value: 'debug', label: 'Debug' },
          { value: 'info', label: 'Info' },
          { value: 'warning', label: 'Warning' },
          { value: 'error', label: 'Error' }
        ]
      }
    ]
  },

  // ==========================================
  // SISTEMA Y PROCESOS
  // ==========================================
  process_start: {
    title: 'Iniciar Proceso',
    icon: 'fa-play',
    description: 'Inicia un proceso o abre una aplicación/carpeta',
    fields: [
      {
        key: 'command',
        label: 'Comando o ruta',
        type: 'textWithVariable',
        required: true,
        placeholder: 'explorer.exe C:\\Users o notepad.exe',
        helpText: 'Ejecutable o ruta a abrir'
      },
      {
        key: 'arguments',
        label: 'Argumentos',
        type: 'textWithVariable',
        placeholder: '--flag valor',
        helpText: 'Argumentos adicionales (opcional)'
      },
      {
        key: 'workingDirectory',
        label: 'Directorio de trabajo',
        type: 'folderWithVariable',
        placeholder: 'C:\\MiCarpeta',
        helpText: 'Directorio donde se ejecutará el proceso'
      },
      {
        key: 'waitForExit',
        label: 'Esperar a que termine',
        type: 'checkbox',
        default: false,
        helpText: 'Pausar el workflow hasta que el proceso termine'
      },
      {
        key: 'outputVariable',
        label: 'Guardar PID en variable',
        type: 'variable',
        placeholder: 'processId',
        helpText: 'Variable para guardar el ID del proceso'
      }
    ]
  },

  process_kill: {
    title: 'Terminar Proceso',
    icon: 'fa-skull',
    description: 'Termina un proceso en ejecución',
    fields: [
      {
        key: 'processName',
        label: 'Nombre del proceso',
        type: 'textWithVariable',
        placeholder: 'notepad.exe',
        helpText: 'Nombre del ejecutable (sin ruta)'
      },
      {
        key: 'processId',
        label: 'O ID del proceso (PID)',
        type: 'textWithVariable',
        placeholder: '1234',
        helpText: 'Usar si se conoce el PID específico'
      },
      {
        key: 'force',
        label: 'Forzar terminación',
        type: 'checkbox',
        default: false,
        helpText: 'Terminar forzosamente sin guardar cambios'
      }
    ]
  },

  run_command: {
    title: 'Ejecutar Comando CMD',
    icon: 'fa-terminal',
    description: 'Ejecuta un comando en el símbolo del sistema (CMD)',
    fields: [
      {
        key: 'command',
        label: 'Comando',
        type: 'code',
        language: 'batch',
        required: true,
        rows: 4,
        placeholder: 'dir /b C:\\MiCarpeta'
      },
      {
        key: 'workingDirectory',
        label: 'Directorio de trabajo',
        type: 'folderWithVariable',
        placeholder: 'C:\\',
        helpText: 'Directorio donde se ejecutará el comando'
      },
      {
        key: 'timeout',
        label: 'Timeout (segundos)',
        type: 'number',
        default: 30,
        min: 1,
        max: 3600
      },
      {
        key: 'outputVariable',
        label: 'Guardar salida en variable',
        type: 'variable',
        default: 'resultado',
        placeholder: 'resultado',
        helpText: 'Variable donde se guardará la salida del comando'
      },
      {
        key: 'errorVariable',
        label: 'Guardar errores en variable',
        type: 'variable',
        placeholder: 'error',
        helpText: 'Variable para capturar mensajes de error'
      }
    ]
  },

  run_powershell: {
    title: 'Ejecutar PowerShell',
    icon: 'fa-terminal',
    description: 'Ejecuta un script o comando PowerShell',
    fields: [
      {
        key: 'script',
        label: 'Script PowerShell',
        type: 'code',
        language: 'powershell',
        required: true,
        rows: 6,
        placeholder: 'Get-ChildItem -Path "C:\\MiCarpeta" | Select-Object Name'
      },
      {
        key: 'outputVariable',
        label: 'Guardar salida en variable',
        type: 'variable',
        default: 'resultado',
        placeholder: 'resultado',
        helpText: 'Variable donde se guardará el resultado'
      },
      {
        key: 'timeout',
        label: 'Timeout (segundos)',
        type: 'number',
        default: 30,
        min: 1,
        max: 3600,
        helpText: 'Tiempo máximo de ejecución'
      },
      {
        key: 'runAsAdmin',
        label: 'Ejecutar como administrador',
        type: 'checkbox',
        default: false,
        advanced: true,
        helpText: 'Requiere elevación de permisos'
      },
      {
        key: 'bypassPolicy',
        label: 'Bypass Execution Policy',
        type: 'checkbox',
        default: true,
        advanced: true,
        helpText: 'Omitir política de ejecución de scripts'
      }
    ]
  },

  environment_var: {
    title: 'Variable de Entorno',
    icon: 'fa-cog',
    description: 'Obtiene o establece una variable de entorno del sistema',
    fields: [
      {
        key: 'action',
        label: 'Acción',
        type: 'select',
        required: true,
        default: 'get',
        options: [
          { value: 'get', label: 'Obtener valor' },
          { value: 'set', label: 'Establecer valor' }
        ]
      },
      {
        key: 'envVariable',
        label: 'Nombre de variable de entorno',
        type: 'text',
        required: true,
        placeholder: 'PATH, USERPROFILE, TEMP, etc.'
      },
      {
        key: 'value',
        label: 'Nuevo valor',
        type: 'textWithVariable',
        condition: { field: 'action', value: 'set' },
        placeholder: 'Valor a establecer'
      },
      {
        key: 'outputVariable',
        label: 'Guardar en variable',
        type: 'variable',
        condition: { field: 'action', value: 'get' },
        default: 'envValue',
        placeholder: 'envValue'
      }
    ]
  },

  // ==========================================
  // VENTANAS
  // ==========================================
  window_focus: {
    title: 'Enfocar Ventana',
    icon: 'fa-window-restore',
    description: 'Trae una ventana al frente y le da el foco',
    fields: [
      {
        key: 'windowTitle',
        label: 'Título de la ventana',
        type: 'textWithVariable',
        required: true,
        placeholder: 'Notepad - Sin título',
        helpText: 'Título o parte del título de la ventana'
      },
      {
        key: 'matchMode',
        label: 'Modo de búsqueda',
        type: 'select',
        default: 'contains',
        options: [
          { value: 'exact', label: 'Exacto' },
          { value: 'contains', label: 'Contiene' },
          { value: 'startsWith', label: 'Empieza con' },
          { value: 'regex', label: 'Expresión regular' }
        ]
      }
    ]
  },

  window_close: {
    title: 'Cerrar Ventana',
    icon: 'fa-window-close',
    description: 'Cierra una ventana específica',
    fields: [
      {
        key: 'windowTitle',
        label: 'Título de la ventana',
        type: 'textWithVariable',
        required: true,
        placeholder: 'Notepad'
      },
      {
        key: 'matchMode',
        label: 'Modo de búsqueda',
        type: 'select',
        default: 'contains',
        options: [
          { value: 'exact', label: 'Exacto' },
          { value: 'contains', label: 'Contiene' },
          { value: 'startsWith', label: 'Empieza con' }
        ]
      },
      {
        key: 'force',
        label: 'Forzar cierre',
        type: 'checkbox',
        default: false,
        helpText: 'Cerrar sin preguntar por cambios no guardados'
      }
    ]
  },

  window_minimize: {
    title: 'Minimizar Ventana',
    icon: 'fa-window-minimize',
    description: 'Minimiza una ventana a la barra de tareas',
    fields: [
      {
        key: 'windowTitle',
        label: 'Título de la ventana',
        type: 'textWithVariable',
        required: true,
        placeholder: 'Título de la ventana'
      },
      {
        key: 'matchMode',
        label: 'Modo de búsqueda',
        type: 'select',
        default: 'contains',
        options: [
          { value: 'exact', label: 'Exacto' },
          { value: 'contains', label: 'Contiene' },
          { value: 'startsWith', label: 'Empieza con' }
        ]
      }
    ]
  },

  window_maximize: {
    title: 'Maximizar Ventana',
    icon: 'fa-window-maximize',
    description: 'Maximiza una ventana',
    fields: [
      {
        key: 'windowTitle',
        label: 'Título de la ventana',
        type: 'textWithVariable',
        required: true,
        placeholder: 'Título de la ventana'
      },
      {
        key: 'matchMode',
        label: 'Modo de búsqueda',
        type: 'select',
        default: 'contains',
        options: [
          { value: 'exact', label: 'Exacto' },
          { value: 'contains', label: 'Contiene' },
          { value: 'startsWith', label: 'Empieza con' }
        ]
      }
    ]
  },

  // ==========================================
  // ARCHIVOS Y CARPETAS
  // ==========================================
  file_read: {
    title: 'Leer Archivo',
    icon: 'fa-file-alt',
    description: 'Lee el contenido de un archivo de texto',
    fields: [
      {
        key: 'filePath',
        label: 'Ruta del archivo',
        type: 'fileWithVariable',
        required: true,
        placeholder: 'C:\\MiArchivo.txt'
      },
      {
        key: 'encoding',
        label: 'Codificación',
        type: 'select',
        default: 'utf8',
        options: [
          { value: 'utf8', label: 'UTF-8' },
          { value: 'utf16', label: 'UTF-16' },
          { value: 'ascii', label: 'ASCII' },
          { value: 'latin1', label: 'Latin-1 (ISO-8859-1)' }
        ]
      },
      {
        key: 'outputVariable',
        label: 'Guardar contenido en',
        type: 'variable',
        required: true,
        default: 'contenido',
        placeholder: 'contenido'
      }
    ]
  },

  file_write: {
    title: 'Escribir Archivo',
    icon: 'fa-file-export',
    description: 'Escribe contenido en un archivo de texto',
    fields: [
      {
        key: 'filePath',
        label: 'Ruta del archivo',
        type: 'fileWithVariable',
        required: true,
        placeholder: 'C:\\MiArchivo.txt'
      },
      {
        key: 'content',
        label: 'Contenido',
        type: 'textareaWithVariable',
        required: true,
        rows: 4,
        placeholder: 'Texto a escribir...'
      },
      {
        key: 'mode',
        label: 'Modo',
        type: 'select',
        default: 'overwrite',
        options: [
          { value: 'overwrite', label: 'Sobrescribir' },
          { value: 'append', label: 'Agregar al final' }
        ]
      },
      {
        key: 'encoding',
        label: 'Codificación',
        type: 'select',
        default: 'utf8',
        options: [
          { value: 'utf8', label: 'UTF-8' },
          { value: 'utf16', label: 'UTF-16' },
          { value: 'ascii', label: 'ASCII' }
        ]
      },
      {
        key: 'createFolder',
        label: 'Crear carpeta si no existe',
        type: 'checkbox',
        default: true
      }
    ]
  },

  file_copy: {
    title: 'Copiar Archivo',
    icon: 'fa-copy',
    description: 'Copia un archivo a otra ubicación',
    fields: [
      {
        key: 'sourcePath',
        label: 'Archivo origen',
        type: 'fileWithVariable',
        required: true,
        placeholder: 'C:\\Origen\\archivo.txt'
      },
      {
        key: 'destinationPath',
        label: 'Destino',
        type: 'fileWithVariable',
        required: true,
        placeholder: 'C:\\Destino\\archivo.txt'
      },
      {
        key: 'overwrite',
        label: 'Sobrescribir si existe',
        type: 'checkbox',
        default: false
      }
    ]
  },

  file_move: {
    title: 'Mover Archivo',
    icon: 'fa-file-export',
    description: 'Mueve un archivo a otra ubicación',
    fields: [
      {
        key: 'sourcePath',
        label: 'Archivo origen',
        type: 'fileWithVariable',
        required: true,
        placeholder: 'C:\\Origen\\archivo.txt'
      },
      {
        key: 'destinationPath',
        label: 'Destino',
        type: 'fileWithVariable',
        required: true,
        placeholder: 'C:\\Destino\\archivo.txt'
      },
      {
        key: 'overwrite',
        label: 'Sobrescribir si existe',
        type: 'checkbox',
        default: false
      }
    ]
  },

  file_delete: {
    title: 'Eliminar Archivo',
    icon: 'fa-trash',
    description: 'Elimina un archivo',
    fields: [
      {
        key: 'filePath',
        label: 'Archivo a eliminar',
        type: 'fileWithVariable',
        required: true,
        placeholder: 'C:\\archivo.txt'
      },
      {
        key: 'permanent',
        label: 'Eliminar permanentemente',
        type: 'checkbox',
        default: false,
        helpText: 'Si está desactivado, se envía a la papelera'
      }
    ]
  },

  file_exists: {
    title: 'Verificar si Archivo Existe',
    icon: 'fa-file-circle-question',
    description: 'Verifica si un archivo existe',
    fields: [
      {
        key: 'filePath',
        label: 'Ruta del archivo',
        type: 'fileWithVariable',
        required: true,
        placeholder: 'C:\\archivo.txt'
      },
      {
        key: 'outputVariable',
        label: 'Guardar resultado en',
        type: 'variable',
        required: true,
        default: 'existe',
        placeholder: 'existe',
        helpText: 'Variable booleana (true/false)'
      }
    ]
  },

  folder_create: {
    title: 'Crear Carpeta',
    icon: 'fa-folder-plus',
    description: 'Crea una nueva carpeta',
    fields: [
      {
        key: 'folderPath',
        label: 'Ruta de la carpeta',
        type: 'folderWithVariable',
        required: true,
        placeholder: 'C:\\MiNuevaCarpeta'
      },
      {
        key: 'createParents',
        label: 'Crear carpetas padre',
        type: 'checkbox',
        default: true,
        helpText: 'Crear todas las carpetas necesarias en la ruta'
      }
    ]
  },

  folder_delete: {
    title: 'Eliminar Carpeta',
    icon: 'fa-folder-minus',
    description: 'Elimina una carpeta y su contenido',
    fields: [
      {
        key: 'folderPath',
        label: 'Carpeta a eliminar',
        type: 'folderWithVariable',
        required: true,
        placeholder: 'C:\\MiCarpeta'
      },
      {
        key: 'recursive',
        label: 'Eliminar contenido',
        type: 'checkbox',
        default: true,
        helpText: 'Eliminar también archivos y subcarpetas'
      },
      {
        key: 'permanent',
        label: 'Eliminar permanentemente',
        type: 'checkbox',
        default: false
      }
    ]
  },

  folder_list: {
    title: 'Listar Contenido de Carpeta',
    icon: 'fa-folder-tree',
    description: 'Obtiene la lista de archivos y carpetas',
    fields: [
      {
        key: 'folderPath',
        label: 'Carpeta',
        type: 'folderWithVariable',
        required: true,
        placeholder: 'C:\\MiCarpeta'
      },
      {
        key: 'pattern',
        label: 'Patrón de filtro',
        type: 'text',
        default: '*',
        placeholder: '*.txt, *.xlsx',
        helpText: 'Filtrar por extensión o nombre'
      },
      {
        key: 'recursive',
        label: 'Incluir subcarpetas',
        type: 'checkbox',
        default: false
      },
      {
        key: 'includeFiles',
        label: 'Incluir archivos',
        type: 'checkbox',
        default: true
      },
      {
        key: 'includeFolders',
        label: 'Incluir carpetas',
        type: 'checkbox',
        default: false
      },
      {
        key: 'outputVariable',
        label: 'Guardar lista en',
        type: 'variable',
        required: true,
        default: 'archivos',
        placeholder: 'archivos'
      }
    ]
  },

  // ==========================================
  // VARIABLES
  // ==========================================
  set_variable: {
    title: 'Establecer Variable',
    icon: 'fa-pen',
    description: 'Crea o modifica una variable',
    fields: [
      {
        key: 'variable',
        label: 'Nombre de variable',
        type: 'variable',
        required: true,
        placeholder: 'miVariable'
      },
      {
        key: 'value',
        label: 'Valor',
        type: 'textareaWithVariable',
        required: true,
        rows: 2,
        placeholder: 'Valor a asignar (puede incluir ${variables})'
      },
      {
        key: 'type',
        label: 'Tipo de dato',
        type: 'select',
        default: 'auto',
        options: [
          { value: 'auto', label: 'Automático' },
          { value: 'string', label: 'Texto' },
          { value: 'number', label: 'Número' },
          { value: 'boolean', label: 'Booleano' },
          { value: 'array', label: 'Lista' },
          { value: 'object', label: 'Objeto' }
        ]
      }
    ]
  },

  increment_variable: {
    title: 'Incrementar Variable',
    icon: 'fa-plus-circle',
    description: 'Incrementa el valor de una variable numérica',
    fields: [
      {
        key: 'variable',
        label: 'Variable',
        type: 'variable',
        required: true,
        placeholder: 'contador'
      },
      {
        key: 'amount',
        label: 'Cantidad',
        type: 'number',
        default: 1,
        helpText: 'Cantidad a sumar (puede ser negativo)'
      }
    ]
  },

  clear_variable: {
    title: 'Limpiar Variable',
    icon: 'fa-eraser',
    description: 'Elimina o limpia el valor de una variable',
    fields: [
      {
        key: 'variable',
        label: 'Variable',
        type: 'variable',
        required: true,
        placeholder: 'miVariable'
      },
      {
        key: 'action',
        label: 'Acción',
        type: 'select',
        default: 'clear',
        options: [
          { value: 'clear', label: 'Limpiar (valor vacío)' },
          { value: 'delete', label: 'Eliminar completamente' }
        ]
      }
    ]
  },

  // ==========================================
  // CONTROL DE FLUJO
  // ==========================================
  wait: {
    title: 'Esperar',
    icon: 'fa-clock',
    description: 'Pausa la ejecución por un tiempo determinado',
    fields: [
      {
        key: 'duration',
        label: 'Duración',
        type: 'number',
        required: true,
        default: 1000,
        min: 100,
        max: 3600000,
        helpText: 'Tiempo en milisegundos'
      },
      {
        key: 'unit',
        label: 'Unidad',
        type: 'select',
        default: 'ms',
        options: [
          { value: 'ms', label: 'Milisegundos' },
          { value: 's', label: 'Segundos' },
          { value: 'm', label: 'Minutos' }
        ]
      }
    ]
  },

  condition: {
    title: 'Condición If',
    icon: 'fa-code-branch',
    description: 'Ejecuta acciones según una condición',
    fields: [
      {
        key: 'leftOperand',
        label: 'Valor izquierdo',
        type: 'textWithVariable',
        required: true,
        placeholder: '${variable}'
      },
      {
        key: 'operator',
        label: 'Operador',
        type: 'select',
        required: true,
        default: 'equals',
        options: [
          { value: 'equals', label: '= Igual a' },
          { value: 'notEquals', label: '≠ Diferente de' },
          { value: 'contains', label: 'Contiene' },
          { value: 'notContains', label: 'No contiene' },
          { value: 'startsWith', label: 'Empieza con' },
          { value: 'endsWith', label: 'Termina con' },
          { value: 'greater', label: '> Mayor que' },
          { value: 'greaterOrEqual', label: '≥ Mayor o igual' },
          { value: 'less', label: '< Menor que' },
          { value: 'lessOrEqual', label: '≤ Menor o igual' },
          { value: 'isEmpty', label: 'Está vacío' },
          { value: 'isNotEmpty', label: 'No está vacío' },
          { value: 'isTrue', label: 'Es verdadero' },
          { value: 'isFalse', label: 'Es falso' }
        ]
      },
      {
        key: 'rightOperand',
        label: 'Valor derecho',
        type: 'textWithVariable',
        placeholder: 'Valor a comparar',
        condition: { field: 'operator', notInValues: ['isEmpty', 'isNotEmpty', 'isTrue', 'isFalse'] }
      }
    ]
  },

  loop_for: {
    title: 'Bucle For',
    icon: 'fa-redo',
    description: 'Repite acciones un número determinado de veces',
    fields: [
      {
        key: 'iterations',
        label: 'Número de iteraciones',
        type: 'number',
        required: true,
        default: 10,
        min: 1,
        max: 10000
      },
      {
        key: 'indexVariable',
        label: 'Variable de índice',
        type: 'variable',
        default: 'i',
        placeholder: 'i',
        helpText: 'Variable que contendrá el número de iteración actual'
      },
      {
        key: 'startFrom',
        label: 'Empezar desde',
        type: 'number',
        default: 0,
        helpText: 'Valor inicial del índice'
      }
    ]
  },

  loop_foreach: {
    title: 'Bucle For Each',
    icon: 'fa-list',
    description: 'Itera sobre cada elemento de una lista',
    fields: [
      {
        key: 'listVariable',
        label: 'Lista a recorrer',
        type: 'textWithVariable',
        required: true,
        placeholder: '${miLista}',
        helpText: 'Variable que contiene la lista'
      },
      {
        key: 'itemVariable',
        label: 'Variable de elemento',
        type: 'variable',
        required: true,
        default: 'item',
        placeholder: 'item',
        helpText: 'Variable que contendrá cada elemento'
      },
      {
        key: 'indexVariable',
        label: 'Variable de índice',
        type: 'variable',
        default: 'index',
        placeholder: 'index'
      }
    ]
  },

  loop_while: {
    title: 'Bucle While',
    icon: 'fa-sync',
    description: 'Repite mientras una condición sea verdadera',
    fields: [
      {
        key: 'condition',
        label: 'Condición',
        type: 'textWithVariable',
        required: true,
        placeholder: '${contador} < 10',
        helpText: 'Expresión que debe ser verdadera para continuar'
      },
      {
        key: 'maxIterations',
        label: 'Máximo de iteraciones',
        type: 'number',
        default: 1000,
        min: 1,
        max: 100000,
        helpText: 'Límite de seguridad para evitar bucles infinitos'
      }
    ]
  },

  break_loop: {
    title: 'Romper Bucle',
    icon: 'fa-stop',
    description: 'Sale del bucle actual',
    fields: []
  },

  continue_loop: {
    title: 'Continuar Bucle',
    icon: 'fa-forward',
    description: 'Salta a la siguiente iteración del bucle',
    fields: []
  },

  stop_workflow: {
    title: 'Detener Workflow',
    icon: 'fa-stop-circle',
    description: 'Detiene la ejecución del workflow',
    fields: [
      {
        key: 'reason',
        label: 'Razón',
        type: 'textWithVariable',
        placeholder: 'Motivo de la detención (opcional)'
      },
      {
        key: 'status',
        label: 'Estado final',
        type: 'select',
        default: 'success',
        options: [
          { value: 'success', label: 'Éxito' },
          { value: 'error', label: 'Error' },
          { value: 'cancelled', label: 'Cancelado' }
        ]
      }
    ]
  },

  try_catch: {
    title: 'Try-Catch',
    icon: 'fa-shield-alt',
    description: 'Maneja errores en las acciones contenidas',
    fields: [
      {
        key: 'errorVariable',
        label: 'Guardar error en',
        type: 'variable',
        default: 'error',
        placeholder: 'error',
        helpText: 'Variable que contendrá el mensaje de error'
      }
    ]
  },

  comment: {
    title: 'Comentario',
    icon: 'fa-comment',
    description: 'Agrega un comentario descriptivo (no se ejecuta)',
    fields: [
      {
        key: 'text',
        label: 'Comentario',
        type: 'textarea',
        rows: 3,
        placeholder: 'Escribe tu comentario aquí...'
      }
    ]
  }
}

// Función helper para obtener propiedades de una acción
export function getActionProperties(actionType) {
  let props = ACTION_PROPERTIES[actionType]

  // Resolver extends
  while (props?.extends) {
    const parentProps = ACTION_PROPERTIES[props.extends]
    props = { ...parentProps, ...props }
    delete props.extends
  }

  return props || {
    title: actionType,
    icon: 'fa-cog',
    description: 'Acción sin configuración específica',
    fields: []
  }
}

// Campos comunes que se pueden añadir a cualquier acción
export const COMMON_FIELDS = [
  {
    key: 'description',
    label: 'Descripción',
    type: 'textarea',
    placeholder: 'Descripción del paso (opcional)',
    rows: 2,
    helpText: 'Documenta el propósito de este paso'
  },
  {
    key: 'enabled',
    label: 'Habilitado',
    type: 'checkbox',
    default: true,
    helpText: 'Desmarcar para omitir este paso durante la ejecución'
  },
  {
    key: 'continueOnError',
    label: 'Continuar en caso de error',
    type: 'checkbox',
    default: false,
    helpText: 'Continúa la ejecución aunque este paso falle'
  },
  {
    key: 'logOutput',
    label: 'Registrar salida en log',
    type: 'checkbox',
    default: true,
    helpText: 'Registra el resultado de este paso en el log de ejecución'
  },
  {
    key: 'captureScreenshotOnError',
    label: 'Capturar pantalla al fallar',
    type: 'checkbox',
    default: false,
    helpText: 'Toma una captura de pantalla si este paso falla'
  },
  {
    key: 'timeout',
    label: 'Timeout (segundos)',
    type: 'number',
    default: 30,
    min: 1,
    max: 3600,
    advanced: true,
    helpText: 'Tiempo máximo de espera para este paso'
  },
  {
    key: 'retryCount',
    label: 'Reintentos',
    type: 'number',
    default: 0,
    min: 0,
    max: 10,
    advanced: true,
    helpText: 'Número de veces a reintentar si falla'
  },
  {
    key: 'retryDelay',
    label: 'Delay entre reintentos (ms)',
    type: 'number',
    default: 1000,
    min: 100,
    max: 60000,
    condition: { field: 'retryCount', notValue: 0 },
    advanced: true,
    helpText: 'Tiempo de espera entre cada reintento'
  },
  {
    key: 'preDelay',
    label: 'Espera antes (ms)',
    type: 'number',
    default: 0,
    min: 0,
    max: 60000,
    advanced: true,
    helpText: 'Espera antes de ejecutar este paso'
  },
  {
    key: 'postDelay',
    label: 'Espera después (ms)',
    type: 'number',
    default: 0,
    min: 0,
    max: 60000,
    advanced: true,
    helpText: 'Espera después de ejecutar este paso'
  },
  {
    key: 'errorVariable',
    label: 'Guardar error en',
    type: 'variable',
    advanced: true,
    condition: { field: 'continueOnError', value: true },
    helpText: 'Variable donde guardar el mensaje de error'
  }
]

// ==========================================
// OMNICANALIDAD - PROPIEDADES DE ACCIONES
// ==========================================

// Agregar propiedades de Twilio al objeto BASE_ACTION_PROPERTIES
Object.assign(BASE_ACTION_PROPERTIES, {
  // ==========================================
  // TWILIO - SMS, VOZ, VIDEO, WHATSAPP
  // ==========================================
  twilio_connect: {
    title: 'Conectar Twilio',
    icon: 'fa-plug',
    description: 'Configura la conexión con Twilio API',
    fields: [
      {
        key: 'accountSid',
        label: 'Account SID',
        type: 'textWithVariable',
        required: true,
        helpText: 'Tu Account SID de Twilio'
      },
      {
        key: 'authToken',
        label: 'Auth Token',
        type: 'password',
        required: true,
        helpText: 'Tu Auth Token de Twilio'
      },
      {
        key: 'useCredentialStore',
        label: 'Usar almacén de credenciales',
        type: 'checkbox',
        default: true,
        helpText: 'Almacena las credenciales de forma segura'
      },
      {
        key: 'credentialName',
        label: 'Nombre de credencial',
        type: 'text',
        condition: { field: 'useCredentialStore', value: true }
      },
      {
        key: 'connectionVariable',
        label: 'Guardar conexión en',
        type: 'variable',
        required: true
      }
    ]
  },

  twilio_send_sms: {
    title: 'Enviar SMS',
    icon: 'fa-sms',
    description: 'Envía un mensaje SMS a través de Twilio',
    fields: [
      {
        key: 'connection',
        label: 'Conexión Twilio',
        type: 'variable',
        required: true,
        helpText: 'Variable con la conexión de Twilio'
      },
      {
        key: 'from',
        label: 'Número remitente',
        type: 'textWithVariable',
        required: true,
        placeholder: '+1234567890',
        helpText: 'Número de Twilio verificado'
      },
      {
        key: 'to',
        label: 'Número destinatario',
        type: 'textWithVariable',
        required: true,
        placeholder: '+1234567890',
        helpText: 'Número del destinatario con código de país'
      },
      {
        key: 'body',
        label: 'Mensaje',
        type: 'textareaWithVariable',
        required: true,
        rows: 3,
        helpText: 'Contenido del mensaje SMS (máx. 1600 caracteres)'
      },
      {
        key: 'statusCallback',
        label: 'URL de callback',
        type: 'textWithVariable',
        advanced: true,
        helpText: 'URL para recibir actualizaciones de estado'
      },
      {
        key: 'messageSid',
        label: 'Guardar Message SID en',
        type: 'variable'
      },
      {
        key: 'statusVariable',
        label: 'Guardar estado en',
        type: 'variable'
      }
    ]
  },

  twilio_send_mms: {
    title: 'Enviar MMS',
    icon: 'fa-image',
    description: 'Envía un mensaje multimedia MMS',
    fields: [
      {
        key: 'connection',
        label: 'Conexión Twilio',
        type: 'variable',
        required: true
      },
      {
        key: 'from',
        label: 'Número remitente',
        type: 'textWithVariable',
        required: true
      },
      {
        key: 'to',
        label: 'Número destinatario',
        type: 'textWithVariable',
        required: true
      },
      {
        key: 'body',
        label: 'Mensaje',
        type: 'textareaWithVariable',
        rows: 2
      },
      {
        key: 'mediaUrl',
        label: 'URL del medio',
        type: 'textWithVariable',
        required: true,
        helpText: 'URL pública de la imagen/video a enviar'
      },
      {
        key: 'messageSid',
        label: 'Guardar Message SID en',
        type: 'variable'
      }
    ]
  },

  twilio_make_call: {
    title: 'Realizar Llamada',
    icon: 'fa-phone',
    description: 'Inicia una llamada de voz con Twilio',
    fields: [
      {
        key: 'connection',
        label: 'Conexión Twilio',
        type: 'variable',
        required: true
      },
      {
        key: 'from',
        label: 'Número remitente',
        type: 'textWithVariable',
        required: true
      },
      {
        key: 'to',
        label: 'Número destinatario',
        type: 'textWithVariable',
        required: true
      },
      {
        key: 'callType',
        label: 'Tipo de llamada',
        type: 'select',
        default: 'twiml',
        options: [
          { value: 'twiml', label: 'TwiML (texto a voz)' },
          { value: 'url', label: 'URL de TwiML' },
          { value: 'connect', label: 'Conectar a número' }
        ]
      },
      {
        key: 'twimlMessage',
        label: 'Mensaje TwiML',
        type: 'textareaWithVariable',
        rows: 3,
        condition: { field: 'callType', value: 'twiml' },
        helpText: 'Mensaje que se reproducirá con voz sintética'
      },
      {
        key: 'twimlUrl',
        label: 'URL de TwiML',
        type: 'textWithVariable',
        condition: { field: 'callType', value: 'url' }
      },
      {
        key: 'connectTo',
        label: 'Conectar a',
        type: 'textWithVariable',
        condition: { field: 'callType', value: 'connect' },
        helpText: 'Número al cual transferir la llamada'
      },
      {
        key: 'voice',
        label: 'Voz',
        type: 'select',
        default: 'Polly.Lucia',
        options: [
          { value: 'Polly.Lucia', label: 'Lucia (Español - ES)' },
          { value: 'Polly.Conchita', label: 'Conchita (Español - ES)' },
          { value: 'Polly.Mia', label: 'Mia (Español - MX)' },
          { value: 'Polly.Lupe', label: 'Lupe (Español - US)' },
          { value: 'Polly.Penelope', label: 'Penélope (Español - US)' },
          { value: 'alice', label: 'Alice (Inglés)' },
          { value: 'man', label: 'Hombre' },
          { value: 'woman', label: 'Mujer' }
        ]
      },
      {
        key: 'language',
        label: 'Idioma',
        type: 'select',
        default: 'es-ES',
        options: [
          { value: 'es-ES', label: 'Español (España)' },
          { value: 'es-MX', label: 'Español (México)' },
          { value: 'es-US', label: 'Español (US)' },
          { value: 'en-US', label: 'Inglés (US)' },
          { value: 'en-GB', label: 'Inglés (UK)' }
        ]
      },
      {
        key: 'record',
        label: 'Grabar llamada',
        type: 'checkbox',
        default: false
      },
      {
        key: 'timeout',
        label: 'Timeout (segundos)',
        type: 'number',
        default: 30
      },
      {
        key: 'callSid',
        label: 'Guardar Call SID en',
        type: 'variable'
      },
      {
        key: 'recordingUrl',
        label: 'Guardar URL grabación en',
        type: 'variable',
        condition: { field: 'record', value: true }
      }
    ]
  },

  twilio_send_voice_message: {
    title: 'Mensaje de Voz',
    icon: 'fa-voicemail',
    description: 'Envía un mensaje de voz pregrabado',
    fields: [
      {
        key: 'connection',
        label: 'Conexión Twilio',
        type: 'variable',
        required: true
      },
      {
        key: 'from',
        label: 'Número remitente',
        type: 'textWithVariable',
        required: true
      },
      {
        key: 'to',
        label: 'Número destinatario',
        type: 'textWithVariable',
        required: true
      },
      {
        key: 'audioSource',
        label: 'Origen del audio',
        type: 'select',
        default: 'text',
        options: [
          { value: 'text', label: 'Texto a voz' },
          { value: 'url', label: 'URL de audio' },
          { value: 'file', label: 'Archivo local' }
        ]
      },
      {
        key: 'message',
        label: 'Mensaje',
        type: 'textareaWithVariable',
        rows: 3,
        condition: { field: 'audioSource', value: 'text' }
      },
      {
        key: 'audioUrl',
        label: 'URL del audio',
        type: 'textWithVariable',
        condition: { field: 'audioSource', value: 'url' }
      },
      {
        key: 'audioFile',
        label: 'Archivo de audio',
        type: 'fileWithVariable',
        fileType: 'open',
        accept: '.mp3,.wav,.ogg',
        condition: { field: 'audioSource', value: 'file' }
      },
      {
        key: 'leaveVoicemail',
        label: 'Dejar en buzón de voz',
        type: 'checkbox',
        default: true
      }
    ]
  },

  twilio_send_whatsapp: {
    title: 'Enviar WhatsApp vía Twilio',
    icon: 'fa-whatsapp',
    description: 'Envía mensaje de WhatsApp usando Twilio',
    fields: [
      {
        key: 'connection',
        label: 'Conexión Twilio',
        type: 'variable',
        required: true
      },
      {
        key: 'from',
        label: 'Número WhatsApp remitente',
        type: 'textWithVariable',
        required: true,
        placeholder: 'whatsapp:+14155238886',
        helpText: 'Número de WhatsApp de Twilio (formato: whatsapp:+número)'
      },
      {
        key: 'to',
        label: 'Número destinatario',
        type: 'textWithVariable',
        required: true,
        placeholder: 'whatsapp:+1234567890'
      },
      {
        key: 'messageType',
        label: 'Tipo de mensaje',
        type: 'select',
        default: 'text',
        options: [
          { value: 'text', label: 'Texto' },
          { value: 'template', label: 'Plantilla' },
          { value: 'media', label: 'Media' }
        ]
      },
      {
        key: 'body',
        label: 'Mensaje',
        type: 'textareaWithVariable',
        rows: 3,
        condition: { field: 'messageType', value: 'text' }
      },
      {
        key: 'templateSid',
        label: 'SID de Plantilla',
        type: 'textWithVariable',
        condition: { field: 'messageType', value: 'template' }
      },
      {
        key: 'templateVariables',
        label: 'Variables de plantilla',
        type: 'keyValue',
        condition: { field: 'messageType', value: 'template' },
        helpText: 'Variables para reemplazar en la plantilla'
      },
      {
        key: 'mediaUrl',
        label: 'URL del medio',
        type: 'textWithVariable',
        condition: { field: 'messageType', value: 'media' }
      },
      {
        key: 'messageSid',
        label: 'Guardar Message SID en',
        type: 'variable'
      }
    ]
  },

  twilio_video_room: {
    title: 'Crear Sala de Video',
    icon: 'fa-video',
    description: 'Crea una sala de videoconferencia Twilio',
    fields: [
      {
        key: 'connection',
        label: 'Conexión Twilio',
        type: 'variable',
        required: true
      },
      {
        key: 'roomName',
        label: 'Nombre de la sala',
        type: 'textWithVariable',
        required: true
      },
      {
        key: 'roomType',
        label: 'Tipo de sala',
        type: 'select',
        default: 'group',
        options: [
          { value: 'peer-to-peer', label: 'Peer to Peer (2 participantes)' },
          { value: 'group', label: 'Grupo (hasta 50)' },
          { value: 'group-small', label: 'Grupo pequeño (hasta 4)' }
        ]
      },
      {
        key: 'maxParticipants',
        label: 'Máximo participantes',
        type: 'number',
        default: 10,
        min: 2,
        max: 50
      },
      {
        key: 'recordRoom',
        label: 'Grabar sala',
        type: 'checkbox',
        default: false
      },
      {
        key: 'statusCallback',
        label: 'URL de callback',
        type: 'textWithVariable',
        advanced: true
      },
      {
        key: 'roomSid',
        label: 'Guardar Room SID en',
        type: 'variable'
      },
      {
        key: 'roomUrl',
        label: 'Guardar URL en',
        type: 'variable'
      }
    ]
  },

  twilio_verify_send: {
    title: 'Enviar Verificación',
    icon: 'fa-shield-alt',
    description: 'Envía código de verificación OTP',
    fields: [
      {
        key: 'connection',
        label: 'Conexión Twilio',
        type: 'variable',
        required: true
      },
      {
        key: 'serviceSid',
        label: 'Verify Service SID',
        type: 'textWithVariable',
        required: true,
        helpText: 'SID del servicio Verify de Twilio'
      },
      {
        key: 'to',
        label: 'Destinatario',
        type: 'textWithVariable',
        required: true,
        helpText: 'Número de teléfono o email'
      },
      {
        key: 'channel',
        label: 'Canal',
        type: 'select',
        default: 'sms',
        options: [
          { value: 'sms', label: 'SMS' },
          { value: 'call', label: 'Llamada de voz' },
          { value: 'email', label: 'Email' },
          { value: 'whatsapp', label: 'WhatsApp' }
        ]
      },
      {
        key: 'locale',
        label: 'Idioma',
        type: 'select',
        default: 'es',
        options: [
          { value: 'es', label: 'Español' },
          { value: 'en', label: 'Inglés' },
          { value: 'pt', label: 'Portugués' }
        ]
      },
      {
        key: 'verificationSid',
        label: 'Guardar Verification SID en',
        type: 'variable'
      }
    ]
  },

  twilio_verify_check: {
    title: 'Verificar Código',
    icon: 'fa-check-circle',
    description: 'Verifica el código OTP ingresado',
    fields: [
      {
        key: 'connection',
        label: 'Conexión Twilio',
        type: 'variable',
        required: true
      },
      {
        key: 'serviceSid',
        label: 'Verify Service SID',
        type: 'textWithVariable',
        required: true
      },
      {
        key: 'to',
        label: 'Destinatario',
        type: 'textWithVariable',
        required: true
      },
      {
        key: 'code',
        label: 'Código',
        type: 'textWithVariable',
        required: true,
        helpText: 'Código ingresado por el usuario'
      },
      {
        key: 'isValid',
        label: 'Guardar resultado en',
        type: 'variable',
        required: true,
        helpText: 'Variable booleana con el resultado'
      }
    ]
  },

  twilio_lookup: {
    title: 'Buscar Número',
    icon: 'fa-search',
    description: 'Obtiene información de un número telefónico',
    fields: [
      {
        key: 'connection',
        label: 'Conexión Twilio',
        type: 'variable',
        required: true
      },
      {
        key: 'phoneNumber',
        label: 'Número de teléfono',
        type: 'textWithVariable',
        required: true
      },
      {
        key: 'fields',
        label: 'Campos a obtener',
        type: 'multiselect',
        default: ['carrier'],
        options: [
          { value: 'carrier', label: 'Operador' },
          { value: 'caller_name', label: 'Nombre del titular' },
          { value: 'line_type_intelligence', label: 'Tipo de línea' }
        ]
      },
      {
        key: 'resultVariable',
        label: 'Guardar resultado en',
        type: 'variable',
        required: true
      }
    ]
  },

  // ==========================================
  // WHATSAPP BUSINESS API
  // ==========================================
  wa_connect: {
    title: 'Conectar WhatsApp Business',
    icon: 'fa-plug',
    description: 'Configura conexión con WhatsApp Business API',
    fields: [
      {
        key: 'provider',
        label: 'Proveedor',
        type: 'select',
        default: 'meta',
        options: [
          { value: 'meta', label: 'Meta (Cloud API)' },
          { value: 'twilio', label: 'Twilio' },
          { value: '360dialog', label: '360dialog' },
          { value: 'messagebird', label: 'MessageBird' }
        ]
      },
      {
        key: 'accessToken',
        label: 'Access Token',
        type: 'password',
        required: true
      },
      {
        key: 'phoneNumberId',
        label: 'Phone Number ID',
        type: 'textWithVariable',
        required: true,
        condition: { field: 'provider', value: 'meta' }
      },
      {
        key: 'businessAccountId',
        label: 'Business Account ID',
        type: 'textWithVariable',
        condition: { field: 'provider', value: 'meta' }
      },
      {
        key: 'connectionVariable',
        label: 'Guardar conexión en',
        type: 'variable',
        required: true
      }
    ]
  },

  wa_send_message: {
    title: 'Enviar Mensaje WhatsApp',
    icon: 'fa-paper-plane',
    description: 'Envía un mensaje de texto por WhatsApp',
    fields: [
      {
        key: 'connection',
        label: 'Conexión WhatsApp',
        type: 'variable',
        required: true
      },
      {
        key: 'to',
        label: 'Destinatario',
        type: 'textWithVariable',
        required: true,
        placeholder: '521234567890',
        helpText: 'Número con código de país sin +'
      },
      {
        key: 'message',
        label: 'Mensaje',
        type: 'textareaWithVariable',
        required: true,
        rows: 3
      },
      {
        key: 'previewUrl',
        label: 'Mostrar vista previa de enlaces',
        type: 'checkbox',
        default: true
      },
      {
        key: 'messageId',
        label: 'Guardar ID del mensaje en',
        type: 'variable'
      }
    ]
  },

  wa_send_template: {
    title: 'Enviar Plantilla WhatsApp',
    icon: 'fa-file-alt',
    description: 'Envía una plantilla aprobada de WhatsApp',
    fields: [
      {
        key: 'connection',
        label: 'Conexión WhatsApp',
        type: 'variable',
        required: true
      },
      {
        key: 'to',
        label: 'Destinatario',
        type: 'textWithVariable',
        required: true
      },
      {
        key: 'templateName',
        label: 'Nombre de plantilla',
        type: 'textWithVariable',
        required: true,
        helpText: 'Nombre exacto de la plantilla aprobada'
      },
      {
        key: 'language',
        label: 'Idioma',
        type: 'select',
        default: 'es',
        options: [
          { value: 'es', label: 'Español' },
          { value: 'es_MX', label: 'Español (México)' },
          { value: 'es_AR', label: 'Español (Argentina)' },
          { value: 'en', label: 'Inglés' },
          { value: 'en_US', label: 'Inglés (US)' },
          { value: 'pt_BR', label: 'Portugués (Brasil)' }
        ]
      },
      {
        key: 'headerType',
        label: 'Tipo de encabezado',
        type: 'select',
        default: 'none',
        options: [
          { value: 'none', label: 'Sin encabezado' },
          { value: 'text', label: 'Texto' },
          { value: 'image', label: 'Imagen' },
          { value: 'video', label: 'Video' },
          { value: 'document', label: 'Documento' }
        ]
      },
      {
        key: 'headerText',
        label: 'Texto del encabezado',
        type: 'textWithVariable',
        condition: { field: 'headerType', value: 'text' }
      },
      {
        key: 'headerMediaUrl',
        label: 'URL del medio',
        type: 'textWithVariable',
        condition: { field: 'headerType', values: ['image', 'video', 'document'] }
      },
      {
        key: 'bodyVariables',
        label: 'Variables del cuerpo',
        type: 'tags',
        helpText: 'Variables en orden ({{1}}, {{2}}, etc.)'
      },
      {
        key: 'buttonVariables',
        label: 'Variables de botones',
        type: 'keyValue',
        advanced: true,
        helpText: 'Variables para botones dinámicos'
      },
      {
        key: 'messageId',
        label: 'Guardar ID del mensaje en',
        type: 'variable'
      }
    ]
  },

  wa_send_buttons: {
    title: 'Mensaje con Botones',
    icon: 'fa-th-list',
    description: 'Envía mensaje interactivo con botones',
    fields: [
      {
        key: 'connection',
        label: 'Conexión WhatsApp',
        type: 'variable',
        required: true
      },
      {
        key: 'to',
        label: 'Destinatario',
        type: 'textWithVariable',
        required: true
      },
      {
        key: 'bodyText',
        label: 'Texto del mensaje',
        type: 'textareaWithVariable',
        required: true,
        rows: 2
      },
      {
        key: 'headerText',
        label: 'Encabezado',
        type: 'textWithVariable'
      },
      {
        key: 'footerText',
        label: 'Pie de mensaje',
        type: 'textWithVariable'
      },
      {
        key: 'buttons',
        label: 'Botones (máx. 3)',
        type: 'tags',
        required: true,
        helpText: 'Texto de cada botón'
      },
      {
        key: 'messageId',
        label: 'Guardar ID del mensaje en',
        type: 'variable'
      }
    ]
  },

  wa_send_list: {
    title: 'Mensaje con Lista',
    icon: 'fa-list',
    description: 'Envía mensaje con lista interactiva',
    fields: [
      {
        key: 'connection',
        label: 'Conexión WhatsApp',
        type: 'variable',
        required: true
      },
      {
        key: 'to',
        label: 'Destinatario',
        type: 'textWithVariable',
        required: true
      },
      {
        key: 'bodyText',
        label: 'Texto del mensaje',
        type: 'textareaWithVariable',
        required: true,
        rows: 2
      },
      {
        key: 'buttonText',
        label: 'Texto del botón',
        type: 'textWithVariable',
        required: true,
        default: 'Ver opciones'
      },
      {
        key: 'sections',
        label: 'Secciones',
        type: 'code',
        language: 'json',
        required: true,
        helpText: 'JSON con estructura de secciones y opciones'
      },
      {
        key: 'messageId',
        label: 'Guardar ID del mensaje en',
        type: 'variable'
      }
    ]
  },

  // ==========================================
  // TELEGRAM BOT
  // ==========================================
  tg_connect: {
    title: 'Conectar Bot Telegram',
    icon: 'fa-plug',
    description: 'Configura conexión con Bot de Telegram',
    fields: [
      {
        key: 'botToken',
        label: 'Token del Bot',
        type: 'password',
        required: true,
        helpText: 'Token obtenido de @BotFather'
      },
      {
        key: 'useWebhook',
        label: 'Usar Webhook',
        type: 'checkbox',
        default: false
      },
      {
        key: 'webhookUrl',
        label: 'URL del Webhook',
        type: 'textWithVariable',
        condition: { field: 'useWebhook', value: true }
      },
      {
        key: 'connectionVariable',
        label: 'Guardar conexión en',
        type: 'variable',
        required: true
      }
    ]
  },

  tg_send_message: {
    title: 'Enviar Mensaje Telegram',
    icon: 'fa-paper-plane',
    description: 'Envía un mensaje de texto por Telegram',
    fields: [
      {
        key: 'connection',
        label: 'Conexión Telegram',
        type: 'variable',
        required: true
      },
      {
        key: 'chatId',
        label: 'Chat ID',
        type: 'textWithVariable',
        required: true,
        helpText: 'ID del chat o username (@username)'
      },
      {
        key: 'text',
        label: 'Mensaje',
        type: 'textareaWithVariable',
        required: true,
        rows: 3
      },
      {
        key: 'parseMode',
        label: 'Formato',
        type: 'select',
        default: 'HTML',
        options: [
          { value: 'HTML', label: 'HTML' },
          { value: 'Markdown', label: 'Markdown' },
          { value: 'MarkdownV2', label: 'Markdown V2' }
        ]
      },
      {
        key: 'disableWebPreview',
        label: 'Deshabilitar vista previa',
        type: 'checkbox',
        default: false
      },
      {
        key: 'disableNotification',
        label: 'Silenciar notificación',
        type: 'checkbox',
        default: false
      },
      {
        key: 'replyToMessageId',
        label: 'Responder a mensaje ID',
        type: 'textWithVariable',
        advanced: true
      },
      {
        key: 'messageId',
        label: 'Guardar Message ID en',
        type: 'variable'
      }
    ]
  },

  tg_send_inline_keyboard: {
    title: 'Teclado Inline',
    icon: 'fa-th',
    description: 'Envía mensaje con teclado inline',
    fields: [
      {
        key: 'connection',
        label: 'Conexión Telegram',
        type: 'variable',
        required: true
      },
      {
        key: 'chatId',
        label: 'Chat ID',
        type: 'textWithVariable',
        required: true
      },
      {
        key: 'text',
        label: 'Mensaje',
        type: 'textareaWithVariable',
        required: true
      },
      {
        key: 'keyboard',
        label: 'Teclado (JSON)',
        type: 'code',
        language: 'json',
        required: true,
        helpText: 'Array de filas con botones'
      },
      {
        key: 'messageId',
        label: 'Guardar Message ID en',
        type: 'variable'
      }
    ]
  },

  // ==========================================
  // SLACK
  // ==========================================
  slack_connect: {
    title: 'Conectar Slack',
    icon: 'fa-plug',
    description: 'Configura conexión con workspace de Slack',
    fields: [
      {
        key: 'authType',
        label: 'Tipo de autenticación',
        type: 'select',
        default: 'bot',
        options: [
          { value: 'bot', label: 'Bot Token' },
          { value: 'webhook', label: 'Webhook' },
          { value: 'oauth', label: 'OAuth' }
        ]
      },
      {
        key: 'botToken',
        label: 'Bot Token',
        type: 'password',
        required: true,
        condition: { field: 'authType', value: 'bot' },
        helpText: 'Token xoxb-...'
      },
      {
        key: 'webhookUrl',
        label: 'Webhook URL',
        type: 'textWithVariable',
        condition: { field: 'authType', value: 'webhook' }
      },
      {
        key: 'connectionVariable',
        label: 'Guardar conexión en',
        type: 'variable',
        required: true
      }
    ]
  },

  slack_send_message: {
    title: 'Enviar Mensaje Slack',
    icon: 'fa-paper-plane',
    description: 'Envía un mensaje a un canal o usuario',
    fields: [
      {
        key: 'connection',
        label: 'Conexión Slack',
        type: 'variable',
        required: true
      },
      {
        key: 'channel',
        label: 'Canal o Usuario',
        type: 'textWithVariable',
        required: true,
        placeholder: '#general o @usuario',
        helpText: 'Nombre del canal (#) o usuario (@)'
      },
      {
        key: 'text',
        label: 'Mensaje',
        type: 'textareaWithVariable',
        required: true,
        rows: 3
      },
      {
        key: 'asUser',
        label: 'Enviar como usuario',
        type: 'checkbox',
        default: false
      },
      {
        key: 'username',
        label: 'Nombre de usuario',
        type: 'textWithVariable',
        condition: { field: 'asUser', value: true }
      },
      {
        key: 'iconEmoji',
        label: 'Emoji de ícono',
        type: 'textWithVariable',
        placeholder: ':robot_face:',
        condition: { field: 'asUser', value: true }
      },
      {
        key: 'threadTs',
        label: 'Thread TS (responder en hilo)',
        type: 'textWithVariable',
        advanced: true
      },
      {
        key: 'timestamp',
        label: 'Guardar Timestamp en',
        type: 'variable'
      }
    ]
  },

  slack_send_blocks: {
    title: 'Enviar Bloques Slack',
    icon: 'fa-th-large',
    description: 'Envía mensaje con Block Kit',
    fields: [
      {
        key: 'connection',
        label: 'Conexión Slack',
        type: 'variable',
        required: true
      },
      {
        key: 'channel',
        label: 'Canal',
        type: 'textWithVariable',
        required: true
      },
      {
        key: 'blocks',
        label: 'Bloques (JSON)',
        type: 'code',
        language: 'json',
        required: true,
        rows: 10,
        helpText: 'Array de bloques del Block Kit'
      },
      {
        key: 'text',
        label: 'Texto alternativo',
        type: 'textWithVariable',
        helpText: 'Texto para notificaciones'
      }
    ]
  },

  // ==========================================
  // MICROSOFT TEAMS
  // ==========================================
  teams_connect: {
    title: 'Conectar Teams',
    icon: 'fa-plug',
    description: 'Configura conexión con Microsoft Teams',
    fields: [
      {
        key: 'authType',
        label: 'Tipo de autenticación',
        type: 'select',
        default: 'webhook',
        options: [
          { value: 'webhook', label: 'Webhook (Incoming)' },
          { value: 'bot', label: 'Bot Framework' },
          { value: 'graph', label: 'Microsoft Graph API' }
        ]
      },
      {
        key: 'webhookUrl',
        label: 'Webhook URL',
        type: 'textWithVariable',
        condition: { field: 'authType', value: 'webhook' }
      },
      {
        key: 'tenantId',
        label: 'Tenant ID',
        type: 'textWithVariable',
        condition: { field: 'authType', values: ['bot', 'graph'] }
      },
      {
        key: 'clientId',
        label: 'Client ID',
        type: 'textWithVariable',
        condition: { field: 'authType', values: ['bot', 'graph'] }
      },
      {
        key: 'clientSecret',
        label: 'Client Secret',
        type: 'password',
        condition: { field: 'authType', values: ['bot', 'graph'] }
      },
      {
        key: 'connectionVariable',
        label: 'Guardar conexión en',
        type: 'variable',
        required: true
      }
    ]
  },

  teams_send_message: {
    title: 'Enviar Mensaje Teams',
    icon: 'fa-paper-plane',
    description: 'Envía un mensaje a un canal de Teams',
    fields: [
      {
        key: 'connection',
        label: 'Conexión Teams',
        type: 'variable',
        required: true
      },
      {
        key: 'text',
        label: 'Mensaje',
        type: 'textareaWithVariable',
        required: true,
        rows: 3
      },
      {
        key: 'title',
        label: 'Título',
        type: 'textWithVariable'
      },
      {
        key: 'themeColor',
        label: 'Color del tema',
        type: 'color',
        default: '#0078D4'
      },
      {
        key: 'mentions',
        label: 'Menciones',
        type: 'tags',
        helpText: 'Usuarios a mencionar'
      }
    ]
  },

  teams_send_card: {
    title: 'Enviar Card Adaptativa',
    icon: 'fa-id-card',
    description: 'Envía una Adaptive Card a Teams',
    fields: [
      {
        key: 'connection',
        label: 'Conexión Teams',
        type: 'variable',
        required: true
      },
      {
        key: 'cardJson',
        label: 'Card JSON',
        type: 'code',
        language: 'json',
        required: true,
        rows: 15,
        helpText: 'JSON de Adaptive Card'
      },
      {
        key: 'summary',
        label: 'Resumen',
        type: 'textWithVariable',
        helpText: 'Texto para notificaciones'
      }
    ]
  },

  // ==========================================
  // HUBSPOT CRM
  // ==========================================
  hs_connect: {
    title: 'Conectar HubSpot',
    icon: 'fa-plug',
    description: 'Configura conexión con HubSpot CRM',
    fields: [
      {
        key: 'authType',
        label: 'Tipo de autenticación',
        type: 'select',
        default: 'apiKey',
        options: [
          { value: 'apiKey', label: 'API Key' },
          { value: 'oauth', label: 'OAuth 2.0' },
          { value: 'privateApp', label: 'Private App Token' }
        ]
      },
      {
        key: 'apiKey',
        label: 'API Key',
        type: 'password',
        condition: { field: 'authType', value: 'apiKey' }
      },
      {
        key: 'accessToken',
        label: 'Access Token',
        type: 'password',
        condition: { field: 'authType', values: ['oauth', 'privateApp'] }
      },
      {
        key: 'connectionVariable',
        label: 'Guardar conexión en',
        type: 'variable',
        required: true
      }
    ]
  },

  hs_create_contact: {
    title: 'Crear Contacto HubSpot',
    icon: 'fa-user-plus',
    description: 'Crea un nuevo contacto en HubSpot',
    fields: [
      {
        key: 'connection',
        label: 'Conexión HubSpot',
        type: 'variable',
        required: true
      },
      {
        key: 'email',
        label: 'Email',
        type: 'textWithVariable',
        required: true
      },
      {
        key: 'firstName',
        label: 'Nombre',
        type: 'textWithVariable'
      },
      {
        key: 'lastName',
        label: 'Apellido',
        type: 'textWithVariable'
      },
      {
        key: 'phone',
        label: 'Teléfono',
        type: 'textWithVariable'
      },
      {
        key: 'company',
        label: 'Empresa',
        type: 'textWithVariable'
      },
      {
        key: 'lifecycleStage',
        label: 'Etapa del ciclo',
        type: 'select',
        options: [
          { value: 'subscriber', label: 'Suscriptor' },
          { value: 'lead', label: 'Lead' },
          { value: 'marketingqualifiedlead', label: 'MQL' },
          { value: 'salesqualifiedlead', label: 'SQL' },
          { value: 'opportunity', label: 'Oportunidad' },
          { value: 'customer', label: 'Cliente' }
        ]
      },
      {
        key: 'customProperties',
        label: 'Propiedades personalizadas',
        type: 'keyValue',
        advanced: true
      },
      {
        key: 'contactId',
        label: 'Guardar ID del contacto en',
        type: 'variable'
      }
    ]
  },

  hs_create_deal: {
    title: 'Crear Negocio HubSpot',
    icon: 'fa-handshake',
    description: 'Crea un nuevo deal en HubSpot',
    fields: [
      {
        key: 'connection',
        label: 'Conexión HubSpot',
        type: 'variable',
        required: true
      },
      {
        key: 'dealName',
        label: 'Nombre del negocio',
        type: 'textWithVariable',
        required: true
      },
      {
        key: 'pipeline',
        label: 'Pipeline',
        type: 'textWithVariable',
        default: 'default'
      },
      {
        key: 'stage',
        label: 'Etapa',
        type: 'textWithVariable'
      },
      {
        key: 'amount',
        label: 'Monto',
        type: 'number'
      },
      {
        key: 'closeDate',
        label: 'Fecha de cierre',
        type: 'date'
      },
      {
        key: 'contactId',
        label: 'ID del contacto asociado',
        type: 'textWithVariable'
      },
      {
        key: 'companyId',
        label: 'ID de la empresa asociada',
        type: 'textWithVariable'
      },
      {
        key: 'dealId',
        label: 'Guardar ID del deal en',
        type: 'variable'
      }
    ]
  },

  // ==========================================
  // ZENDESK
  // ==========================================
  zd_connect: {
    title: 'Conectar Zendesk',
    icon: 'fa-plug',
    description: 'Configura conexión con Zendesk',
    fields: [
      {
        key: 'subdomain',
        label: 'Subdominio',
        type: 'textWithVariable',
        required: true,
        placeholder: 'tu-empresa',
        helpText: 'https://[subdominio].zendesk.com'
      },
      {
        key: 'authType',
        label: 'Tipo de autenticación',
        type: 'select',
        default: 'token',
        options: [
          { value: 'token', label: 'API Token' },
          { value: 'oauth', label: 'OAuth' },
          { value: 'basic', label: 'Usuario/Contraseña' }
        ]
      },
      {
        key: 'email',
        label: 'Email',
        type: 'textWithVariable',
        required: true
      },
      {
        key: 'token',
        label: 'API Token',
        type: 'password',
        condition: { field: 'authType', value: 'token' }
      },
      {
        key: 'password',
        label: 'Contraseña',
        type: 'password',
        condition: { field: 'authType', value: 'basic' }
      },
      {
        key: 'connectionVariable',
        label: 'Guardar conexión en',
        type: 'variable',
        required: true
      }
    ]
  },

  zd_create_ticket: {
    title: 'Crear Ticket Zendesk',
    icon: 'fa-ticket-alt',
    description: 'Crea un nuevo ticket en Zendesk',
    fields: [
      {
        key: 'connection',
        label: 'Conexión Zendesk',
        type: 'variable',
        required: true
      },
      {
        key: 'subject',
        label: 'Asunto',
        type: 'textWithVariable',
        required: true
      },
      {
        key: 'description',
        label: 'Descripción',
        type: 'textareaWithVariable',
        required: true,
        rows: 4
      },
      {
        key: 'requesterEmail',
        label: 'Email del solicitante',
        type: 'textWithVariable',
        required: true
      },
      {
        key: 'requesterName',
        label: 'Nombre del solicitante',
        type: 'textWithVariable'
      },
      {
        key: 'priority',
        label: 'Prioridad',
        type: 'select',
        options: [
          { value: 'low', label: 'Baja' },
          { value: 'normal', label: 'Normal' },
          { value: 'high', label: 'Alta' },
          { value: 'urgent', label: 'Urgente' }
        ]
      },
      {
        key: 'type',
        label: 'Tipo',
        type: 'select',
        options: [
          { value: 'question', label: 'Pregunta' },
          { value: 'incident', label: 'Incidente' },
          { value: 'problem', label: 'Problema' },
          { value: 'task', label: 'Tarea' }
        ]
      },
      {
        key: 'tags',
        label: 'Etiquetas',
        type: 'tags'
      },
      {
        key: 'assigneeId',
        label: 'ID del asignado',
        type: 'textWithVariable',
        advanced: true
      },
      {
        key: 'groupId',
        label: 'ID del grupo',
        type: 'textWithVariable',
        advanced: true
      },
      {
        key: 'customFields',
        label: 'Campos personalizados',
        type: 'keyValue',
        advanced: true
      },
      {
        key: 'ticketId',
        label: 'Guardar ID del ticket en',
        type: 'variable'
      }
    ]
  },

  // ==========================================
  // BANDEJA UNIFICADA
  // ==========================================
  inbox_get_conversations: {
    title: 'Obtener Conversaciones',
    icon: 'fa-comments',
    description: 'Obtiene conversaciones de la bandeja unificada',
    fields: [
      {
        key: 'channels',
        label: 'Canales',
        type: 'multiselect',
        options: [
          { value: 'whatsapp', label: 'WhatsApp' },
          { value: 'telegram', label: 'Telegram' },
          { value: 'facebook', label: 'Facebook Messenger' },
          { value: 'instagram', label: 'Instagram' },
          { value: 'email', label: 'Email' },
          { value: 'sms', label: 'SMS' },
          { value: 'webchat', label: 'Web Chat' }
        ]
      },
      {
        key: 'status',
        label: 'Estado',
        type: 'select',
        options: [
          { value: 'all', label: 'Todas' },
          { value: 'open', label: 'Abiertas' },
          { value: 'pending', label: 'Pendientes' },
          { value: 'resolved', label: 'Resueltas' },
          { value: 'closed', label: 'Cerradas' }
        ]
      },
      {
        key: 'assignedTo',
        label: 'Asignado a',
        type: 'textWithVariable',
        helpText: 'ID del agente o vacío para todas'
      },
      {
        key: 'limit',
        label: 'Límite',
        type: 'number',
        default: 50
      },
      {
        key: 'conversationsVariable',
        label: 'Guardar conversaciones en',
        type: 'variable',
        required: true
      }
    ]
  },

  inbox_reply: {
    title: 'Responder Conversación',
    icon: 'fa-reply',
    description: 'Responde a una conversación en cualquier canal',
    fields: [
      {
        key: 'conversationId',
        label: 'ID de conversación',
        type: 'textWithVariable',
        required: true
      },
      {
        key: 'message',
        label: 'Mensaje',
        type: 'textareaWithVariable',
        required: true,
        rows: 3
      },
      {
        key: 'attachments',
        label: 'Adjuntos',
        type: 'tags',
        helpText: 'URLs de archivos a adjuntar'
      },
      {
        key: 'isInternal',
        label: 'Nota interna',
        type: 'checkbox',
        default: false,
        helpText: 'Si es true, no se envía al cliente'
      },
      {
        key: 'messageId',
        label: 'Guardar ID del mensaje en',
        type: 'variable'
      }
    ]
  },

  // ==========================================
  // JIRA
  // ==========================================
  jira_connect: {
    title: 'Conectar Jira',
    icon: 'fa-plug',
    description: 'Configura conexión con Jira Cloud',
    fields: [
      { key: 'domain', label: 'Dominio de Jira', type: 'textWithVariable', required: true, helpText: 'tu-empresa.atlassian.net' },
      { key: 'email', label: 'Email', type: 'textWithVariable', required: true },
      { key: 'apiToken', label: 'API Token', type: 'password', required: true },
      { key: 'connectionVariable', label: 'Guardar conexión en', type: 'variable', required: true }
    ]
  },
  jira_create_issue: {
    title: 'Crear Issue en Jira',
    icon: 'fa-plus',
    description: 'Crea una nueva issue en un proyecto',
    fields: [
      { key: 'projectKey', label: 'Clave del Proyecto', type: 'textWithVariable', required: true },
      { key: 'issueType', label: 'Tipo de Issue', type: 'select', default: 'Task', options: [{ value: 'Bug', label: 'Bug' }, { value: 'Task', label: 'Task' }, { value: 'Story', label: 'Story' }, { value: 'Epic', label: 'Epic' }, { value: 'Subtask', label: 'Subtask' }] },
      { key: 'summary', label: 'Resumen', type: 'textWithVariable', required: true },
      { key: 'description', label: 'Descripción', type: 'textareaWithVariable' },
      { key: 'priority', label: 'Prioridad', type: 'select', default: 'Medium', options: [{ value: 'Highest', label: 'Highest' }, { value: 'High', label: 'High' }, { value: 'Medium', label: 'Medium' }, { value: 'Low', label: 'Low' }, { value: 'Lowest', label: 'Lowest' }] },
      { key: 'assignee', label: 'Asignado a', type: 'textWithVariable' },
      { key: 'labels', label: 'Etiquetas', type: 'tags' },
      { key: 'resultVariable', label: 'Guardar resultado en', type: 'variable' }
    ]
  },
  jira_update_issue: {
    title: 'Actualizar Issue de Jira',
    icon: 'fa-edit',
    description: 'Actualiza campos de una issue existente',
    fields: [
      { key: 'issueKey', label: 'Clave de Issue', type: 'textWithVariable', required: true, helpText: 'Ej: PROJ-123' },
      { key: 'fields', label: 'Campos a actualizar (JSON)', type: 'textareaWithVariable' },
      { key: 'resultVariable', label: 'Guardar resultado en', type: 'variable' }
    ]
  },
  jira_get_issue: {
    title: 'Obtener Issue de Jira',
    icon: 'fa-file-alt',
    description: 'Obtiene información de una issue',
    fields: [
      { key: 'issueKey', label: 'Clave de Issue', type: 'textWithVariable', required: true },
      { key: 'fields', label: 'Campos a obtener', type: 'tags' },
      { key: 'resultVariable', label: 'Guardar resultado en', type: 'variable' }
    ]
  },
  jira_search: {
    title: 'Buscar Issues (JQL)',
    icon: 'fa-search',
    description: 'Busca issues usando consultas JQL',
    fields: [
      { key: 'jql', label: 'Consulta JQL', type: 'textareaWithVariable', required: true, helpText: 'Ej: project=PROJ AND status="In Progress"' },
      { key: 'maxResults', label: 'Máximo de resultados', type: 'number', default: 50 },
      { key: 'resultVariable', label: 'Guardar resultado en', type: 'variable' }
    ]
  },
  jira_transition: {
    title: 'Transicionar Estado',
    icon: 'fa-exchange-alt',
    description: 'Cambia el estado de una issue',
    fields: [
      { key: 'issueKey', label: 'Clave de Issue', type: 'textWithVariable', required: true },
      { key: 'transitionName', label: 'Nombre de Transición', type: 'textWithVariable', required: true, helpText: 'Ej: Done, In Progress' },
      { key: 'comment', label: 'Comentario', type: 'textareaWithVariable' },
      { key: 'resultVariable', label: 'Guardar resultado en', type: 'variable' }
    ]
  },
  jira_add_comment: {
    title: 'Agregar Comentario',
    icon: 'fa-comment',
    description: 'Añade un comentario a una issue',
    fields: [
      { key: 'issueKey', label: 'Clave de Issue', type: 'textWithVariable', required: true },
      { key: 'comment', label: 'Comentario', type: 'textareaWithVariable', required: true },
      { key: 'resultVariable', label: 'Guardar resultado en', type: 'variable' }
    ]
  },
  jira_assign: {
    title: 'Asignar Issue',
    icon: 'fa-user-check',
    description: 'Asigna una issue a un usuario',
    fields: [
      { key: 'issueKey', label: 'Clave de Issue', type: 'textWithVariable', required: true },
      { key: 'accountId', label: 'Account ID del usuario', type: 'textWithVariable', required: true },
      { key: 'resultVariable', label: 'Guardar resultado en', type: 'variable' }
    ]
  },
  jira_add_attachment: {
    title: 'Adjuntar Archivo',
    icon: 'fa-paperclip',
    description: 'Adjunta un archivo a una issue',
    fields: [
      { key: 'issueKey', label: 'Clave de Issue', type: 'textWithVariable', required: true },
      { key: 'filePath', label: 'Ruta del archivo', type: 'textWithVariable', required: true },
      { key: 'resultVariable', label: 'Guardar resultado en', type: 'variable' }
    ]
  },
  jira_get_projects: {
    title: 'Listar Proyectos',
    icon: 'fa-list',
    description: 'Lista todos los proyectos de Jira',
    fields: [
      { key: 'resultVariable', label: 'Guardar resultado en', type: 'variable' }
    ]
  },
  jira_create_sprint: {
    title: 'Crear Sprint',
    icon: 'fa-running',
    description: 'Crea un nuevo sprint en un board',
    fields: [
      { key: 'boardId', label: 'ID del Board', type: 'textWithVariable', required: true },
      { key: 'name', label: 'Nombre del Sprint', type: 'textWithVariable', required: true },
      { key: 'startDate', label: 'Fecha de inicio', type: 'textWithVariable', helpText: 'YYYY-MM-DD' },
      { key: 'endDate', label: 'Fecha de fin', type: 'textWithVariable', helpText: 'YYYY-MM-DD' },
      { key: 'goal', label: 'Objetivo del Sprint', type: 'textareaWithVariable' },
      { key: 'resultVariable', label: 'Guardar resultado en', type: 'variable' }
    ]
  },
  jira_log_work: {
    title: 'Registrar Trabajo',
    icon: 'fa-clock',
    description: 'Registra tiempo trabajado en una issue',
    fields: [
      { key: 'issueKey', label: 'Clave de Issue', type: 'textWithVariable', required: true },
      { key: 'timeSpent', label: 'Tiempo trabajado', type: 'textWithVariable', required: true, helpText: 'Ej: 2h 30m' },
      { key: 'comment', label: 'Comentario', type: 'textareaWithVariable' },
      { key: 'resultVariable', label: 'Guardar resultado en', type: 'variable' }
    ]
  },

  // ==========================================
  // TRELLO
  // ==========================================
  trello_connect: {
    title: 'Conectar Trello',
    icon: 'fa-plug',
    description: 'Configura conexión con Trello',
    fields: [
      { key: 'apiKey', label: 'API Key', type: 'password', required: true },
      { key: 'apiToken', label: 'API Token', type: 'password', required: true },
      { key: 'connectionVariable', label: 'Guardar conexión en', type: 'variable', required: true }
    ]
  },
  trello_create_card: {
    title: 'Crear Tarjeta',
    icon: 'fa-plus',
    description: 'Crea una nueva tarjeta en una lista',
    fields: [
      { key: 'boardId', label: 'ID del Board', type: 'textWithVariable', required: true },
      { key: 'listId', label: 'ID de la Lista', type: 'textWithVariable', required: true },
      { key: 'name', label: 'Nombre', type: 'textWithVariable', required: true },
      { key: 'description', label: 'Descripción', type: 'textareaWithVariable' },
      { key: 'position', label: 'Posición', type: 'select', default: 'top', options: [{ value: 'top', label: 'Arriba' }, { value: 'bottom', label: 'Abajo' }] },
      { key: 'resultVariable', label: 'Guardar resultado en', type: 'variable' }
    ]
  },
  trello_move_card: {
    title: 'Mover Tarjeta',
    icon: 'fa-arrows-alt',
    description: 'Mueve una tarjeta a otra lista',
    fields: [
      { key: 'cardId', label: 'ID de la Tarjeta', type: 'textWithVariable', required: true },
      { key: 'listId', label: 'ID de la Lista destino', type: 'textWithVariable', required: true },
      { key: 'position', label: 'Posición', type: 'select', default: 'top', options: [{ value: 'top', label: 'Arriba' }, { value: 'bottom', label: 'Abajo' }] },
      { key: 'resultVariable', label: 'Guardar resultado en', type: 'variable' }
    ]
  },
  trello_update_card: {
    title: 'Actualizar Tarjeta',
    icon: 'fa-edit',
    description: 'Actualiza información de una tarjeta',
    fields: [
      { key: 'cardId', label: 'ID de la Tarjeta', type: 'textWithVariable', required: true },
      { key: 'name', label: 'Nombre', type: 'textWithVariable' },
      { key: 'description', label: 'Descripción', type: 'textareaWithVariable' },
      { key: 'dueDate', label: 'Fecha de vencimiento', type: 'textWithVariable', helpText: 'YYYY-MM-DD' },
      { key: 'resultVariable', label: 'Guardar resultado en', type: 'variable' }
    ]
  },
  trello_add_label: {
    title: 'Agregar Etiqueta',
    icon: 'fa-tag',
    description: 'Agrega una etiqueta de color a tarjeta',
    fields: [
      { key: 'cardId', label: 'ID de la Tarjeta', type: 'textWithVariable', required: true },
      { key: 'color', label: 'Color', type: 'select', default: 'blue', options: [{ value: 'green', label: 'Verde' }, { value: 'yellow', label: 'Amarillo' }, { value: 'orange', label: 'Naranja' }, { value: 'red', label: 'Rojo' }, { value: 'purple', label: 'Morado' }, { value: 'blue', label: 'Azul' }] },
      { key: 'name', label: 'Nombre de etiqueta', type: 'textWithVariable' },
      { key: 'resultVariable', label: 'Guardar resultado en', type: 'variable' }
    ]
  },
  trello_add_checklist: {
    title: 'Agregar Checklist',
    icon: 'fa-check-square',
    description: 'Crea un checklist en una tarjeta',
    fields: [
      { key: 'cardId', label: 'ID de la Tarjeta', type: 'textWithVariable', required: true },
      { key: 'name', label: 'Nombre del Checklist', type: 'textWithVariable', required: true },
      { key: 'items', label: 'Items del checklist', type: 'tags', helpText: 'Lista de tareas' },
      { key: 'resultVariable', label: 'Guardar resultado en', type: 'variable' }
    ]
  },
  trello_add_comment: {
    title: 'Agregar Comentario',
    icon: 'fa-comment',
    description: 'Añade un comentario a una tarjeta',
    fields: [
      { key: 'cardId', label: 'ID de la Tarjeta', type: 'textWithVariable', required: true },
      { key: 'text', label: 'Comentario', type: 'textareaWithVariable', required: true },
      { key: 'resultVariable', label: 'Guardar resultado en', type: 'variable' }
    ]
  },
  trello_add_member: {
    title: 'Agregar Miembro',
    icon: 'fa-user-plus',
    description: 'Asigna un miembro a una tarjeta',
    fields: [
      { key: 'cardId', label: 'ID de la Tarjeta', type: 'textWithVariable', required: true },
      { key: 'memberId', label: 'ID del Miembro', type: 'textWithVariable', required: true },
      { key: 'resultVariable', label: 'Guardar resultado en', type: 'variable' }
    ]
  },
  trello_create_list: {
    title: 'Crear Lista',
    icon: 'fa-list',
    description: 'Crea una nueva lista en un board',
    fields: [
      { key: 'boardId', label: 'ID del Board', type: 'textWithVariable', required: true },
      { key: 'name', label: 'Nombre', type: 'textWithVariable', required: true },
      { key: 'position', label: 'Posición', type: 'select', default: 'top', options: [{ value: 'top', label: 'Arriba' }, { value: 'bottom', label: 'Abajo' }] },
      { key: 'resultVariable', label: 'Guardar resultado en', type: 'variable' }
    ]
  },
  trello_get_boards: {
    title: 'Obtener Tableros',
    icon: 'fa-th-large',
    description: 'Lista todos los boards disponibles',
    fields: [
      { key: 'resultVariable', label: 'Guardar resultado en', type: 'variable' }
    ]
  },
  trello_archive_card: {
    title: 'Archivar Tarjeta',
    icon: 'fa-archive',
    description: 'Archiva una tarjeta',
    fields: [
      { key: 'cardId', label: 'ID de la Tarjeta', type: 'textWithVariable', required: true },
      { key: 'resultVariable', label: 'Guardar resultado en', type: 'variable' }
    ]
  },
  trello_attach_file: {
    title: 'Adjuntar Archivo',
    icon: 'fa-paperclip',
    description: 'Adjunta un archivo o URL a una tarjeta',
    fields: [
      { key: 'cardId', label: 'ID de la Tarjeta', type: 'textWithVariable', required: true },
      { key: 'url', label: 'URL del archivo', type: 'textWithVariable', required: true },
      { key: 'name', label: 'Nombre del adjunto', type: 'textWithVariable' },
      { key: 'resultVariable', label: 'Guardar resultado en', type: 'variable' }
    ]
  },

  // ==========================================
  // ASANA
  // ==========================================
  asana_connect: {
    title: 'Conectar Asana',
    icon: 'fa-plug',
    description: 'Configura conexión con Asana',
    fields: [
      { key: 'accessToken', label: 'Access Token', type: 'password', required: true },
      { key: 'workspaceId', label: 'ID del Workspace', type: 'textWithVariable' },
      { key: 'connectionVariable', label: 'Guardar conexión en', type: 'variable', required: true }
    ]
  },
  asana_create_task: {
    title: 'Crear Tarea',
    icon: 'fa-plus',
    description: 'Crea una nueva tarea en un proyecto',
    fields: [
      { key: 'projectId', label: 'ID del Proyecto', type: 'textWithVariable', required: true },
      { key: 'name', label: 'Nombre', type: 'textWithVariable', required: true },
      { key: 'notes', label: 'Notas', type: 'textareaWithVariable' },
      { key: 'dueDate', label: 'Fecha de vencimiento', type: 'textWithVariable', helpText: 'YYYY-MM-DD' },
      { key: 'assignee', label: 'Asignado a (ID)', type: 'textWithVariable' },
      { key: 'resultVariable', label: 'Guardar resultado en', type: 'variable' }
    ]
  },
  asana_update_task: {
    title: 'Actualizar Tarea',
    icon: 'fa-edit',
    description: 'Actualiza información de una tarea',
    fields: [
      { key: 'taskId', label: 'ID de la Tarea', type: 'textWithVariable', required: true },
      { key: 'name', label: 'Nombre', type: 'textWithVariable' },
      { key: 'notes', label: 'Notas', type: 'textareaWithVariable' },
      { key: 'completed', label: 'Marcar completada', type: 'checkbox' },
      { key: 'resultVariable', label: 'Guardar resultado en', type: 'variable' }
    ]
  },
  asana_assign_task: {
    title: 'Asignar Tarea',
    icon: 'fa-user-check',
    description: 'Asigna una tarea a un usuario',
    fields: [
      { key: 'taskId', label: 'ID de la Tarea', type: 'textWithVariable', required: true },
      { key: 'assignee', label: 'ID del usuario', type: 'textWithVariable', required: true },
      { key: 'resultVariable', label: 'Guardar resultado en', type: 'variable' }
    ]
  },
  asana_add_subtask: {
    title: 'Agregar Subtarea',
    icon: 'fa-level-down-alt',
    description: 'Crea una subtarea',
    fields: [
      { key: 'parentId', label: 'ID de la Tarea padre', type: 'textWithVariable', required: true },
      { key: 'name', label: 'Nombre', type: 'textWithVariable', required: true },
      { key: 'notes', label: 'Notas', type: 'textareaWithVariable' },
      { key: 'resultVariable', label: 'Guardar resultado en', type: 'variable' }
    ]
  },
  asana_add_comment: {
    title: 'Agregar Comentario',
    icon: 'fa-comment',
    description: 'Añade un comentario a una tarea',
    fields: [
      { key: 'taskId', label: 'ID de la Tarea', type: 'textWithVariable', required: true },
      { key: 'text', label: 'Comentario', type: 'textareaWithVariable', required: true },
      { key: 'resultVariable', label: 'Guardar resultado en', type: 'variable' }
    ]
  },
  asana_move_section: {
    title: 'Mover a Sección',
    icon: 'fa-arrows-alt',
    description: 'Mueve una tarea a otra sección',
    fields: [
      { key: 'taskId', label: 'ID de la Tarea', type: 'textWithVariable', required: true },
      { key: 'sectionId', label: 'ID de la Sección', type: 'textWithVariable', required: true },
      { key: 'resultVariable', label: 'Guardar resultado en', type: 'variable' }
    ]
  },
  asana_create_project: {
    title: 'Crear Proyecto',
    icon: 'fa-folder-plus',
    description: 'Crea un nuevo proyecto',
    fields: [
      { key: 'workspaceId', label: 'ID del Workspace', type: 'textWithVariable' },
      { key: 'name', label: 'Nombre', type: 'textWithVariable', required: true },
      { key: 'layout', label: 'Diseño', type: 'select', default: 'list', options: [{ value: 'list', label: 'Lista' }, { value: 'board', label: 'Tablero' }] },
      { key: 'resultVariable', label: 'Guardar resultado en', type: 'variable' }
    ]
  },
  asana_search_tasks: {
    title: 'Buscar Tareas',
    icon: 'fa-search',
    description: 'Busca tareas usando filtros',
    fields: [
      { key: 'workspaceId', label: 'ID del Workspace', type: 'textWithVariable' },
      { key: 'query', label: 'Consulta', type: 'textWithVariable' },
      { key: 'projectId', label: 'ID del Proyecto', type: 'textWithVariable' },
      { key: 'resultVariable', label: 'Guardar resultado en', type: 'variable' }
    ]
  },
  asana_set_due_date: {
    title: 'Establecer Fecha',
    icon: 'fa-calendar',
    description: 'Asigna fecha de vencimiento a tarea',
    fields: [
      { key: 'taskId', label: 'ID de la Tarea', type: 'textWithVariable', required: true },
      { key: 'dueDate', label: 'Fecha', type: 'textWithVariable', required: true, helpText: 'YYYY-MM-DD' },
      { key: 'resultVariable', label: 'Guardar resultado en', type: 'variable' }
    ]
  },

  // ==========================================
  // MONDAY.COM
  // ==========================================
  monday_connect: {
    title: 'Conectar Monday.com',
    icon: 'fa-plug',
    description: 'Configura conexión con Monday.com',
    fields: [
      { key: 'apiToken', label: 'API Token', type: 'password', required: true },
      { key: 'connectionVariable', label: 'Guardar conexión en', type: 'variable', required: true }
    ]
  },
  monday_create_item: {
    title: 'Crear Item',
    icon: 'fa-plus',
    description: 'Crea un nuevo item en un board',
    fields: [
      { key: 'boardId', label: 'ID del Board', type: 'textWithVariable', required: true },
      { key: 'groupId', label: 'ID del Grupo', type: 'textWithVariable' },
      { key: 'itemName', label: 'Nombre del item', type: 'textWithVariable', required: true },
      { key: 'columnValues', label: 'Valores de columnas (JSON)', type: 'textareaWithVariable', helpText: 'JSON de valores' },
      { key: 'resultVariable', label: 'Guardar resultado en', type: 'variable' }
    ]
  },
  monday_update_item: {
    title: 'Actualizar Item',
    icon: 'fa-edit',
    description: 'Actualiza valores de un item',
    fields: [
      { key: 'boardId', label: 'ID del Board', type: 'textWithVariable', required: true },
      { key: 'itemId', label: 'ID del Item', type: 'textWithVariable', required: true },
      { key: 'columnValues', label: 'Valores (JSON)', type: 'textareaWithVariable' },
      { key: 'resultVariable', label: 'Guardar resultado en', type: 'variable' }
    ]
  },
  monday_update_column: {
    title: 'Actualizar Columna',
    icon: 'fa-columns',
    description: 'Actualiza valor de una columna específica',
    fields: [
      { key: 'boardId', label: 'ID del Board', type: 'textWithVariable', required: true },
      { key: 'itemId', label: 'ID del Item', type: 'textWithVariable', required: true },
      { key: 'columnId', label: 'ID de la Columna', type: 'textWithVariable', required: true },
      { key: 'value', label: 'Valor', type: 'textWithVariable', required: true },
      { key: 'resultVariable', label: 'Guardar resultado en', type: 'variable' }
    ]
  },
  monday_move_item: {
    title: 'Mover Item',
    icon: 'fa-arrows-alt',
    description: 'Mueve un item a otro grupo',
    fields: [
      { key: 'itemId', label: 'ID del Item', type: 'textWithVariable', required: true },
      { key: 'groupId', label: 'ID del Grupo destino', type: 'textWithVariable', required: true },
      { key: 'resultVariable', label: 'Guardar resultado en', type: 'variable' }
    ]
  },
  monday_create_subitem: {
    title: 'Crear Subitem',
    icon: 'fa-level-down-alt',
    description: 'Crea un subitem dentro de un item',
    fields: [
      { key: 'parentId', label: 'ID del Item padre', type: 'textWithVariable', required: true },
      { key: 'name', label: 'Nombre', type: 'textWithVariable', required: true },
      { key: 'columnValues', label: 'Valores (JSON)', type: 'textareaWithVariable' },
      { key: 'resultVariable', label: 'Guardar resultado en', type: 'variable' }
    ]
  },
  monday_add_update: {
    title: 'Agregar Update',
    icon: 'fa-comment',
    description: 'Añade actualización a un item',
    fields: [
      { key: 'itemId', label: 'ID del Item', type: 'textWithVariable', required: true },
      { key: 'body', label: 'Texto', type: 'textareaWithVariable', required: true },
      { key: 'resultVariable', label: 'Guardar resultado en', type: 'variable' }
    ]
  },
  monday_create_board: {
    title: 'Crear Tablero',
    icon: 'fa-th-large',
    description: 'Crea un nuevo board',
    fields: [
      { key: 'name', label: 'Nombre', type: 'textWithVariable', required: true },
      { key: 'boardKind', label: 'Tipo', type: 'select', default: 'public', options: [{ value: 'public', label: 'Público' }, { value: 'private', label: 'Privado' }, { value: 'share', label: 'Compartido' }] },
      { key: 'templateId', label: 'ID de plantilla', type: 'textWithVariable' },
      { key: 'resultVariable', label: 'Guardar resultado en', type: 'variable' }
    ]
  },
  monday_get_items: {
    title: 'Obtener Items',
    icon: 'fa-list',
    description: 'Lista items de un board',
    fields: [
      { key: 'boardId', label: 'ID del Board', type: 'textWithVariable', required: true },
      { key: 'limit', label: 'Límite', type: 'number', default: 50 },
      { key: 'resultVariable', label: 'Guardar resultado en', type: 'variable' }
    ]
  },
  monday_archive_item: {
    title: 'Archivar Item',
    icon: 'fa-archive',
    description: 'Archiva un item',
    fields: [
      { key: 'itemId', label: 'ID del Item', type: 'textWithVariable', required: true },
      { key: 'resultVariable', label: 'Guardar resultado en', type: 'variable' }
    ]
  },

  // ==========================================
  // ZOHO CRM
  // ==========================================
  zoho_crm_connect: {
    title: 'Conectar Zoho CRM',
    icon: 'fa-plug',
    description: 'Configura conexión con Zoho CRM',
    fields: [
      { key: 'clientId', label: 'Client ID', type: 'password', required: true },
      { key: 'clientSecret', label: 'Client Secret', type: 'password', required: true },
      { key: 'refreshToken', label: 'Refresh Token', type: 'password', required: true },
      { key: 'domain', label: 'Dominio', type: 'select', default: 'com', options: [{ value: 'com', label: '.com (US)' }, { value: 'eu', label: '.eu (Europa)' }, { value: 'in', label: '.in (India)' }, { value: 'com.cn', label: '.com.cn (China)' }, { value: 'com.au', label: '.com.au (Australia)' }] },
      { key: 'connectionVariable', label: 'Guardar conexión en', type: 'variable', required: true }
    ]
  },
  zoho_crm_create_record: {
    title: 'Crear Registro',
    icon: 'fa-plus',
    description: 'Crea un registro en Zoho CRM',
    fields: [
      { key: 'module', label: 'Módulo', type: 'select', default: 'Leads', options: [{ value: 'Leads', label: 'Leads' }, { value: 'Contacts', label: 'Contacts' }, { value: 'Accounts', label: 'Accounts' }, { value: 'Deals', label: 'Deals' }, { value: 'Tasks', label: 'Tasks' }, { value: 'Events', label: 'Events' }] },
      { key: 'data', label: 'Datos del registro (JSON)', type: 'textareaWithVariable', helpText: 'JSON del registro' },
      { key: 'resultVariable', label: 'Guardar resultado en', type: 'variable' }
    ]
  },
  zoho_crm_update_record: {
    title: 'Actualizar Registro',
    icon: 'fa-edit',
    description: 'Actualiza un registro existente',
    fields: [
      { key: 'module', label: 'Módulo', type: 'select', default: 'Leads', options: [{ value: 'Leads', label: 'Leads' }, { value: 'Contacts', label: 'Contacts' }, { value: 'Accounts', label: 'Accounts' }, { value: 'Deals', label: 'Deals' }] },
      { key: 'recordId', label: 'ID del Registro', type: 'textWithVariable', required: true },
      { key: 'data', label: 'Datos (JSON)', type: 'textareaWithVariable' },
      { key: 'resultVariable', label: 'Guardar resultado en', type: 'variable' }
    ]
  },
  zoho_crm_get_record: {
    title: 'Obtener Registro',
    icon: 'fa-file-alt',
    description: 'Obtiene un registro por ID',
    fields: [
      { key: 'module', label: 'Módulo', type: 'select', default: 'Leads', options: [{ value: 'Leads', label: 'Leads' }, { value: 'Contacts', label: 'Contacts' }, { value: 'Accounts', label: 'Accounts' }, { value: 'Deals', label: 'Deals' }] },
      { key: 'recordId', label: 'ID del Registro', type: 'textWithVariable', required: true },
      { key: 'resultVariable', label: 'Guardar resultado en', type: 'variable' }
    ]
  },
  zoho_crm_search: {
    title: 'Buscar Registros',
    icon: 'fa-search',
    description: 'Busca registros con criterios',
    fields: [
      { key: 'module', label: 'Módulo', type: 'select', default: 'Leads', options: [{ value: 'Leads', label: 'Leads' }, { value: 'Contacts', label: 'Contacts' }, { value: 'Accounts', label: 'Accounts' }, { value: 'Deals', label: 'Deals' }] },
      { key: 'criteria', label: 'Criterios', type: 'textareaWithVariable', helpText: 'Ej: (Email:equals:test@mail.com)' },
      { key: 'resultVariable', label: 'Guardar resultado en', type: 'variable' }
    ]
  },
  zoho_crm_delete_record: {
    title: 'Eliminar Registro',
    icon: 'fa-trash',
    description: 'Elimina un registro',
    fields: [
      { key: 'module', label: 'Módulo', type: 'select', default: 'Leads', options: [{ value: 'Leads', label: 'Leads' }, { value: 'Contacts', label: 'Contacts' }, { value: 'Accounts', label: 'Accounts' }, { value: 'Deals', label: 'Deals' }] },
      { key: 'recordId', label: 'ID del Registro', type: 'textWithVariable', required: true },
      { key: 'resultVariable', label: 'Guardar resultado en', type: 'variable' }
    ]
  },
  zoho_crm_create_lead: {
    title: 'Crear Lead',
    icon: 'fa-user-plus',
    description: 'Crea un nuevo lead',
    fields: [
      { key: 'firstName', label: 'Nombre', type: 'textWithVariable' },
      { key: 'lastName', label: 'Apellido', type: 'textWithVariable', required: true },
      { key: 'email', label: 'Email', type: 'textWithVariable' },
      { key: 'phone', label: 'Teléfono', type: 'textWithVariable' },
      { key: 'company', label: 'Empresa', type: 'textWithVariable' },
      { key: 'resultVariable', label: 'Guardar resultado en', type: 'variable' }
    ]
  },
  zoho_crm_convert_lead: {
    title: 'Convertir Lead',
    icon: 'fa-exchange-alt',
    description: 'Convierte un lead a contacto/negocio',
    fields: [
      { key: 'leadId', label: 'ID del Lead', type: 'textWithVariable', required: true },
      { key: 'createDeal', label: 'Crear negocio', type: 'checkbox', default: true },
      { key: 'resultVariable', label: 'Guardar resultado en', type: 'variable' }
    ]
  },
  zoho_crm_create_deal: {
    title: 'Crear Negocio',
    icon: 'fa-handshake',
    description: 'Crea un nuevo negocio/deal',
    fields: [
      { key: 'dealName', label: 'Nombre del negocio', type: 'textWithVariable', required: true },
      { key: 'stage', label: 'Etapa', type: 'textWithVariable' },
      { key: 'amount', label: 'Monto', type: 'textWithVariable' },
      { key: 'closingDate', label: 'Fecha de cierre', type: 'textWithVariable', helpText: 'YYYY-MM-DD' },
      { key: 'accountId', label: 'ID de Cuenta', type: 'textWithVariable' },
      { key: 'resultVariable', label: 'Guardar resultado en', type: 'variable' }
    ]
  },
  zoho_crm_add_note: {
    title: 'Agregar Nota',
    icon: 'fa-sticky-note',
    description: 'Agrega una nota a un registro',
    fields: [
      { key: 'module', label: 'Módulo', type: 'select', default: 'Leads', options: [{ value: 'Leads', label: 'Leads' }, { value: 'Contacts', label: 'Contacts' }, { value: 'Accounts', label: 'Accounts' }, { value: 'Deals', label: 'Deals' }] },
      { key: 'recordId', label: 'ID del Registro', type: 'textWithVariable', required: true },
      { key: 'noteTitle', label: 'Título', type: 'textWithVariable' },
      { key: 'noteContent', label: 'Contenido', type: 'textareaWithVariable', required: true },
      { key: 'resultVariable', label: 'Guardar resultado en', type: 'variable' }
    ]
  },
  zoho_crm_create_task: {
    title: 'Crear Tarea',
    icon: 'fa-tasks',
    description: 'Crea una tarea en Zoho CRM',
    fields: [
      { key: 'subject', label: 'Asunto', type: 'textWithVariable', required: true },
      { key: 'dueDate', label: 'Fecha límite', type: 'textWithVariable' },
      { key: 'priority', label: 'Prioridad', type: 'select', default: 'Normal', options: [{ value: 'High', label: 'Alta' }, { value: 'Normal', label: 'Normal' }, { value: 'Low', label: 'Baja' }] },
      { key: 'status', label: 'Estado', type: 'select', default: 'Not Started', options: [{ value: 'Not Started', label: 'Sin iniciar' }, { value: 'In Progress', label: 'En progreso' }, { value: 'Completed', label: 'Completada' }] },
      { key: 'resultVariable', label: 'Guardar resultado en', type: 'variable' }
    ]
  },
  zoho_crm_send_email: {
    title: 'Enviar Email',
    icon: 'fa-envelope',
    description: 'Envía email desde Zoho CRM',
    fields: [
      { key: 'module', label: 'Módulo', type: 'select', default: 'Leads', options: [{ value: 'Leads', label: 'Leads' }, { value: 'Contacts', label: 'Contacts' }] },
      { key: 'recordId', label: 'ID del Registro', type: 'textWithVariable', required: true },
      { key: 'subject', label: 'Asunto', type: 'textWithVariable', required: true },
      { key: 'content', label: 'Contenido', type: 'textareaWithVariable', required: true },
      { key: 'resultVariable', label: 'Guardar resultado en', type: 'variable' }
    ]
  },

  // ==========================================
  // ZOHO DESK
  // ==========================================
  zoho_desk_connect: {
    title: 'Conectar Zoho Desk',
    icon: 'fa-plug',
    description: 'Configura conexión con Zoho Desk',
    fields: [
      { key: 'orgId', label: 'Organization ID', type: 'textWithVariable', required: true },
      { key: 'clientId', label: 'Client ID', type: 'password', required: true },
      { key: 'clientSecret', label: 'Client Secret', type: 'password', required: true },
      { key: 'refreshToken', label: 'Refresh Token', type: 'password', required: true },
      { key: 'connectionVariable', label: 'Guardar conexión en', type: 'variable', required: true }
    ]
  },
  zoho_desk_create_ticket: {
    title: 'Crear Ticket',
    icon: 'fa-ticket-alt',
    description: 'Crea un nuevo ticket de soporte',
    fields: [
      { key: 'subject', label: 'Asunto', type: 'textWithVariable', required: true },
      { key: 'description', label: 'Descripción', type: 'textareaWithVariable' },
      { key: 'departmentId', label: 'ID Departamento', type: 'textWithVariable' },
      { key: 'contactId', label: 'ID Contacto', type: 'textWithVariable' },
      { key: 'priority', label: 'Prioridad', type: 'select', default: 'Medium', options: [{ value: 'High', label: 'Alta' }, { value: 'Medium', label: 'Media' }, { value: 'Low', label: 'Baja' }] },
      { key: 'resultVariable', label: 'Guardar resultado en', type: 'variable' }
    ]
  },
  zoho_desk_update_ticket: {
    title: 'Actualizar Ticket',
    icon: 'fa-edit',
    description: 'Actualiza un ticket existente',
    fields: [
      { key: 'ticketId', label: 'ID del Ticket', type: 'textWithVariable', required: true },
      { key: 'subject', label: 'Asunto', type: 'textWithVariable' },
      { key: 'status', label: 'Estado', type: 'select', options: [{ value: 'Open', label: 'Abierto' }, { value: 'On Hold', label: 'En espera' }, { value: 'Escalated', label: 'Escalado' }, { value: 'Closed', label: 'Cerrado' }] },
      { key: 'priority', label: 'Prioridad', type: 'select', options: [{ value: 'High', label: 'Alta' }, { value: 'Medium', label: 'Media' }, { value: 'Low', label: 'Baja' }] },
      { key: 'resultVariable', label: 'Guardar resultado en', type: 'variable' }
    ]
  },
  zoho_desk_get_ticket: {
    title: 'Obtener Ticket',
    icon: 'fa-file-alt',
    description: 'Obtiene información de un ticket',
    fields: [
      { key: 'ticketId', label: 'ID del Ticket', type: 'textWithVariable', required: true },
      { key: 'resultVariable', label: 'Guardar resultado en', type: 'variable' }
    ]
  },
  zoho_desk_search: {
    title: 'Buscar Tickets',
    icon: 'fa-search',
    description: 'Busca tickets con filtros',
    fields: [
      { key: 'query', label: 'Consulta', type: 'textWithVariable', required: true },
      { key: 'departmentId', label: 'ID Departamento', type: 'textWithVariable' },
      { key: 'limit', label: 'Límite', type: 'number', default: 20 },
      { key: 'resultVariable', label: 'Guardar resultado en', type: 'variable' }
    ]
  },
  zoho_desk_assign: {
    title: 'Asignar Agente',
    icon: 'fa-user-check',
    description: 'Asigna un agente a un ticket',
    fields: [
      { key: 'ticketId', label: 'ID del Ticket', type: 'textWithVariable', required: true },
      { key: 'agentId', label: 'ID del Agente', type: 'textWithVariable', required: true },
      { key: 'resultVariable', label: 'Guardar resultado en', type: 'variable' }
    ]
  },
  zoho_desk_add_comment: {
    title: 'Agregar Comentario',
    icon: 'fa-comment',
    description: 'Añade comentario a un ticket',
    fields: [
      { key: 'ticketId', label: 'ID del Ticket', type: 'textWithVariable', required: true },
      { key: 'content', label: 'Contenido', type: 'textareaWithVariable', required: true },
      { key: 'isPublic', label: 'Público', type: 'checkbox', default: true },
      { key: 'resultVariable', label: 'Guardar resultado en', type: 'variable' }
    ]
  },
  zoho_desk_change_status: {
    title: 'Cambiar Estado',
    icon: 'fa-exchange-alt',
    description: 'Cambia el estado de un ticket',
    fields: [
      { key: 'ticketId', label: 'ID del Ticket', type: 'textWithVariable', required: true },
      { key: 'status', label: 'Estado', type: 'select', required: true, options: [{ value: 'Open', label: 'Abierto' }, { value: 'On Hold', label: 'En espera' }, { value: 'Escalated', label: 'Escalado' }, { value: 'Closed', label: 'Cerrado' }] },
      { key: 'resultVariable', label: 'Guardar resultado en', type: 'variable' }
    ]
  },
  zoho_desk_add_attachment: {
    title: 'Adjuntar Archivo',
    icon: 'fa-paperclip',
    description: 'Adjunta archivo a un ticket',
    fields: [
      { key: 'ticketId', label: 'ID del Ticket', type: 'textWithVariable', required: true },
      { key: 'filePath', label: 'Ruta del archivo', type: 'textWithVariable', required: true },
      { key: 'resultVariable', label: 'Guardar resultado en', type: 'variable' }
    ]
  },

  // ==========================================
  // ZOHO BOOKS
  // ==========================================
  zoho_books_connect: {
    title: 'Conectar Zoho Books',
    icon: 'fa-plug',
    description: 'Configura conexión con Zoho Books',
    fields: [
      { key: 'orgId', label: 'Organization ID', type: 'textWithVariable', required: true },
      { key: 'clientId', label: 'Client ID', type: 'password', required: true },
      { key: 'clientSecret', label: 'Client Secret', type: 'password', required: true },
      { key: 'refreshToken', label: 'Refresh Token', type: 'password', required: true },
      { key: 'connectionVariable', label: 'Guardar conexión en', type: 'variable', required: true }
    ]
  },
  zoho_books_create_invoice: {
    title: 'Crear Factura',
    icon: 'fa-file-invoice',
    description: 'Crea una nueva factura',
    fields: [
      { key: 'customerId', label: 'ID del Cliente', type: 'textWithVariable', required: true },
      { key: 'items', label: 'Items (JSON)', type: 'textareaWithVariable', helpText: '[{name, rate, quantity}]' },
      { key: 'date', label: 'Fecha', type: 'textWithVariable' },
      { key: 'dueDate', label: 'Fecha de vencimiento', type: 'textWithVariable' },
      { key: 'resultVariable', label: 'Guardar resultado en', type: 'variable' }
    ]
  },
  zoho_books_create_estimate: {
    title: 'Crear Presupuesto',
    icon: 'fa-file-alt',
    description: 'Crea un presupuesto',
    fields: [
      { key: 'customerId', label: 'ID del Cliente', type: 'textWithVariable', required: true },
      { key: 'items', label: 'Items (JSON)', type: 'textareaWithVariable' },
      { key: 'date', label: 'Fecha', type: 'textWithVariable' },
      { key: 'resultVariable', label: 'Guardar resultado en', type: 'variable' }
    ]
  },
  zoho_books_create_contact: {
    title: 'Crear Contacto',
    icon: 'fa-user-plus',
    description: 'Crea un contacto',
    fields: [
      { key: 'contactName', label: 'Nombre', type: 'textWithVariable', required: true },
      { key: 'email', label: 'Email', type: 'textWithVariable' },
      { key: 'phone', label: 'Teléfono', type: 'textWithVariable' },
      { key: 'contactType', label: 'Tipo', type: 'select', default: 'customer', options: [{ value: 'customer', label: 'Cliente' }, { value: 'vendor', label: 'Proveedor' }] },
      { key: 'resultVariable', label: 'Guardar resultado en', type: 'variable' }
    ]
  },
  zoho_books_record_payment: {
    title: 'Registrar Pago',
    icon: 'fa-money-bill',
    description: 'Registra un pago',
    fields: [
      { key: 'invoiceId', label: 'ID Factura', type: 'textWithVariable', required: true },
      { key: 'amount', label: 'Monto', type: 'textWithVariable', required: true },
      { key: 'date', label: 'Fecha', type: 'textWithVariable' },
      { key: 'paymentMode', label: 'Medio de pago', type: 'select', default: 'banktransfer', options: [{ value: 'cash', label: 'Efectivo' }, { value: 'check', label: 'Cheque' }, { value: 'creditcard', label: 'Tarjeta' }, { value: 'banktransfer', label: 'Transferencia' }, { value: 'other', label: 'Otro' }] },
      { key: 'resultVariable', label: 'Guardar resultado en', type: 'variable' }
    ]
  },
  zoho_books_create_expense: {
    title: 'Registrar Gasto',
    icon: 'fa-receipt',
    description: 'Registra un gasto',
    fields: [
      { key: 'accountId', label: 'ID de Cuenta', type: 'textWithVariable' },
      { key: 'amount', label: 'Monto', type: 'textWithVariable', required: true },
      { key: 'date', label: 'Fecha', type: 'textWithVariable' },
      { key: 'description', label: 'Descripción', type: 'textWithVariable' },
      { key: 'vendor', label: 'Proveedor', type: 'textWithVariable' },
      { key: 'resultVariable', label: 'Guardar resultado en', type: 'variable' }
    ]
  },
  zoho_books_create_bill: {
    title: 'Crear Factura Proveedor',
    icon: 'fa-file-invoice-dollar',
    description: 'Crea factura de proveedor',
    fields: [
      { key: 'vendorId', label: 'ID Proveedor', type: 'textWithVariable', required: true },
      { key: 'items', label: 'Items (JSON)', type: 'textareaWithVariable' },
      { key: 'dueDate', label: 'Fecha de vencimiento', type: 'textWithVariable' },
      { key: 'resultVariable', label: 'Guardar resultado en', type: 'variable' }
    ]
  },
  zoho_books_get_reports: {
    title: 'Obtener Reportes',
    icon: 'fa-chart-bar',
    description: 'Obtiene reportes contables',
    fields: [
      { key: 'reportType', label: 'Tipo de reporte', type: 'select', default: 'profit_loss', options: [{ value: 'profit_loss', label: 'Pérdidas y Ganancias' }, { value: 'balance_sheet', label: 'Balance General' }, { value: 'cash_flow', label: 'Flujo de Caja' }, { value: 'sales_by_customer', label: 'Ventas por Cliente' }] },
      { key: 'startDate', label: 'Fecha inicio', type: 'textWithVariable' },
      { key: 'endDate', label: 'Fecha fin', type: 'textWithVariable' },
      { key: 'resultVariable', label: 'Guardar resultado en', type: 'variable' }
    ]
  },

  // ==========================================
  // PIPEDRIVE
  // ==========================================
  pipedrive_connect: {
    title: 'Conectar Pipedrive',
    icon: 'fa-plug',
    description: 'Configura conexión con Pipedrive',
    fields: [
      { key: 'apiToken', label: 'API Token', type: 'password', required: true },
      { key: 'companyDomain', label: 'Dominio', type: 'textWithVariable', helpText: 'tu-empresa.pipedrive.com' },
      { key: 'connectionVariable', label: 'Guardar conexión en', type: 'variable', required: true }
    ]
  },
  pipedrive_create_deal: {
    title: 'Crear Deal',
    icon: 'fa-plus',
    description: 'Crea un nuevo deal/negocio',
    fields: [
      { key: 'title', label: 'Título', type: 'textWithVariable', required: true },
      { key: 'value', label: 'Valor', type: 'textWithVariable' },
      { key: 'currency', label: 'Moneda', type: 'textWithVariable', default: 'USD' },
      { key: 'personId', label: 'ID Persona', type: 'textWithVariable' },
      { key: 'orgId', label: 'ID Organización', type: 'textWithVariable' },
      { key: 'stageId', label: 'ID Etapa', type: 'textWithVariable' },
      { key: 'resultVariable', label: 'Guardar resultado en', type: 'variable' }
    ]
  },
  pipedrive_update_deal: {
    title: 'Actualizar Deal',
    icon: 'fa-edit',
    description: 'Actualiza un deal existente',
    fields: [
      { key: 'dealId', label: 'ID del Deal', type: 'textWithVariable', required: true },
      { key: 'title', label: 'Título', type: 'textWithVariable' },
      { key: 'value', label: 'Valor', type: 'textWithVariable' },
      { key: 'status', label: 'Estado', type: 'select', options: [{ value: 'open', label: 'Abierto' }, { value: 'won', label: 'Ganado' }, { value: 'lost', label: 'Perdido' }, { value: 'deleted', label: 'Eliminado' }] },
      { key: 'resultVariable', label: 'Guardar resultado en', type: 'variable' }
    ]
  },
  pipedrive_move_stage: {
    title: 'Mover Etapa',
    icon: 'fa-exchange-alt',
    description: 'Mueve un deal a otra etapa',
    fields: [
      { key: 'dealId', label: 'ID del Deal', type: 'textWithVariable', required: true },
      { key: 'stageId', label: 'ID de Etapa destino', type: 'textWithVariable', required: true },
      { key: 'resultVariable', label: 'Guardar resultado en', type: 'variable' }
    ]
  },
  pipedrive_create_person: {
    title: 'Crear Persona',
    icon: 'fa-user-plus',
    description: 'Crea un contacto/persona',
    fields: [
      { key: 'name', label: 'Nombre', type: 'textWithVariable', required: true },
      { key: 'email', label: 'Email', type: 'textWithVariable' },
      { key: 'phone', label: 'Teléfono', type: 'textWithVariable' },
      { key: 'orgId', label: 'ID Organización', type: 'textWithVariable' },
      { key: 'resultVariable', label: 'Guardar resultado en', type: 'variable' }
    ]
  },
  pipedrive_create_org: {
    title: 'Crear Organización',
    icon: 'fa-building',
    description: 'Crea una organización',
    fields: [
      { key: 'name', label: 'Nombre', type: 'textWithVariable', required: true },
      { key: 'address', label: 'Dirección', type: 'textWithVariable' },
      { key: 'resultVariable', label: 'Guardar resultado en', type: 'variable' }
    ]
  },
  pipedrive_add_activity: {
    title: 'Agregar Actividad',
    icon: 'fa-calendar-plus',
    description: 'Crea una actividad',
    fields: [
      { key: 'dealId', label: 'ID del Deal', type: 'textWithVariable' },
      { key: 'type', label: 'Tipo', type: 'select', default: 'call', options: [{ value: 'call', label: 'Llamada' }, { value: 'meeting', label: 'Reunión' }, { value: 'task', label: 'Tarea' }, { value: 'deadline', label: 'Fecha límite' }, { value: 'email', label: 'Email' }, { value: 'lunch', label: 'Almuerzo' }] },
      { key: 'subject', label: 'Asunto', type: 'textWithVariable', required: true },
      { key: 'dueDate', label: 'Fecha', type: 'textWithVariable' },
      { key: 'duration', label: 'Duración', type: 'textWithVariable', helpText: 'HH:MM' },
      { key: 'note', label: 'Nota', type: 'textareaWithVariable' },
      { key: 'resultVariable', label: 'Guardar resultado en', type: 'variable' }
    ]
  },
  pipedrive_add_note: {
    title: 'Agregar Nota',
    icon: 'fa-sticky-note',
    description: 'Agrega una nota a un deal/persona',
    fields: [
      { key: 'dealId', label: 'ID del Deal', type: 'textWithVariable' },
      { key: 'personId', label: 'ID de Persona', type: 'textWithVariable' },
      { key: 'orgId', label: 'ID Organización', type: 'textWithVariable' },
      { key: 'content', label: 'Contenido', type: 'textareaWithVariable', required: true },
      { key: 'resultVariable', label: 'Guardar resultado en', type: 'variable' }
    ]
  },
  pipedrive_search: {
    title: 'Buscar Deals',
    icon: 'fa-search',
    description: 'Busca deals, personas u organizaciones',
    fields: [
      { key: 'term', label: 'Término de búsqueda', type: 'textWithVariable', required: true },
      { key: 'itemType', label: 'Tipo', type: 'select', default: 'deal', options: [{ value: 'deal', label: 'Deals' }, { value: 'person', label: 'Personas' }, { value: 'organization', label: 'Organizaciones' }] },
      { key: 'resultVariable', label: 'Guardar resultado en', type: 'variable' }
    ]
  },
  pipedrive_get_pipeline: {
    title: 'Obtener Pipeline',
    icon: 'fa-stream',
    description: 'Obtiene info de un pipeline',
    fields: [
      { key: 'pipelineId', label: 'ID del Pipeline', type: 'textWithVariable' },
      { key: 'resultVariable', label: 'Guardar resultado en', type: 'variable' }
    ]
  },

  // ==========================================
  // ANTI-CAPTCHA
  // ==========================================
  captcha_connect: {
    title: 'Conectar Servicio Anti-Captcha',
    icon: 'fa-plug',
    description: 'Configura servicio de resolución de captchas',
    fields: [
      { key: 'service', label: 'Servicio', type: 'select', default: '2captcha', options: [{ value: '2captcha', label: '2Captcha' }, { value: 'anticaptcha', label: 'Anti-Captcha' }, { value: 'capmonster', label: 'CapMonster' }, { value: 'capsolver', label: 'Capsolver' }] },
      { key: 'apiKey', label: 'API Key', type: 'password', required: true },
      { key: 'connectionVariable', label: 'Guardar conexión en', type: 'variable', required: true }
    ]
  },
  captcha_solve_recaptcha_v2: {
    title: 'Resolver reCAPTCHA v2',
    icon: 'fa-puzzle-piece',
    description: 'Resuelve reCAPTCHA v2 checkbox/invisible',
    fields: [
      { key: 'siteKey', label: 'Site Key', type: 'textWithVariable', required: true, helpText: 'data-sitekey del elemento' },
      { key: 'pageUrl', label: 'URL de la página', type: 'textWithVariable', required: true },
      { key: 'invisible', label: 'Invisible', type: 'checkbox', default: false },
      { key: 'resultVariable', label: 'Guardar token en', type: 'variable' }
    ]
  },
  captcha_solve_recaptcha_v3: {
    title: 'Resolver reCAPTCHA v3',
    icon: 'fa-puzzle-piece',
    description: 'Resuelve reCAPTCHA v3 con score',
    fields: [
      { key: 'siteKey', label: 'Site Key', type: 'textWithVariable', required: true },
      { key: 'pageUrl', label: 'URL de la página', type: 'textWithVariable', required: true },
      { key: 'action', label: 'Acción', type: 'textWithVariable', helpText: 'Nombre de la acción' },
      { key: 'minScore', label: 'Score mínimo', type: 'number', default: 0.3, helpText: '0.1 a 0.9' },
      { key: 'resultVariable', label: 'Guardar token en', type: 'variable' }
    ]
  },
  captcha_solve_hcaptcha: {
    title: 'Resolver hCaptcha',
    icon: 'fa-shield-alt',
    description: 'Resuelve hCaptcha',
    fields: [
      { key: 'siteKey', label: 'Site Key', type: 'textWithVariable', required: true },
      { key: 'pageUrl', label: 'URL de la página', type: 'textWithVariable', required: true },
      { key: 'resultVariable', label: 'Guardar token en', type: 'variable' }
    ]
  },
  captcha_solve_image: {
    title: 'Resolver Captcha Imagen',
    icon: 'fa-image',
    description: 'Resuelve captcha de imagen/texto',
    fields: [
      { key: 'imageSource', label: 'Fuente de imagen', type: 'select', default: 'file', options: [{ value: 'file', label: 'Archivo' }, { value: 'base64', label: 'Base64' }, { value: 'url', label: 'URL' }] },
      { key: 'imagePath', label: 'Ruta del archivo', type: 'textWithVariable', condition: { field: 'imageSource', value: 'file' } },
      { key: 'imageBase64', label: 'Imagen Base64', type: 'textareaWithVariable', condition: { field: 'imageSource', value: 'base64' } },
      { key: 'imageUrl', label: 'URL de imagen', type: 'textWithVariable', condition: { field: 'imageSource', value: 'url' } },
      { key: 'caseSensitive', label: 'Sensible a mayúsculas', type: 'checkbox', default: false },
      { key: 'resultVariable', label: 'Guardar texto en', type: 'variable' }
    ]
  },
  captcha_solve_funcaptcha: {
    title: 'Resolver FunCaptcha',
    icon: 'fa-gamepad',
    description: 'Resuelve FunCaptcha/Arkose Labs',
    fields: [
      { key: 'publicKey', label: 'Public Key', type: 'textWithVariable', required: true },
      { key: 'pageUrl', label: 'URL de la página', type: 'textWithVariable', required: true },
      { key: 'serviceUrl', label: 'Service URL', type: 'textWithVariable' },
      { key: 'resultVariable', label: 'Guardar token en', type: 'variable' }
    ]
  },
  captcha_solve_turnstile: {
    title: 'Resolver Turnstile',
    icon: 'fa-cloud',
    description: 'Resuelve Cloudflare Turnstile',
    fields: [
      { key: 'siteKey', label: 'Site Key', type: 'textWithVariable', required: true },
      { key: 'pageUrl', label: 'URL de la página', type: 'textWithVariable', required: true },
      { key: 'resultVariable', label: 'Guardar token en', type: 'variable' }
    ]
  },
  captcha_solve_geetest: {
    title: 'Resolver GeeTest',
    icon: 'fa-cog',
    description: 'Resuelve GeeTest captcha',
    fields: [
      { key: 'gt', label: 'GT', type: 'textWithVariable', required: true },
      { key: 'challenge', label: 'Challenge', type: 'textWithVariable', required: true },
      { key: 'pageUrl', label: 'URL de la página', type: 'textWithVariable', required: true },
      { key: 'apiServer', label: 'API Server', type: 'textWithVariable' },
      { key: 'resultVariable', label: 'Guardar resultado en', type: 'variable' }
    ]
  },
  captcha_solve_aws_waf: {
    title: 'Resolver AWS WAF',
    icon: 'fa-lock',
    description: 'Resuelve AWS WAF captcha',
    fields: [
      { key: 'siteKey', label: 'Site Key', type: 'textWithVariable', required: true },
      { key: 'pageUrl', label: 'URL de la página', type: 'textWithVariable', required: true },
      { key: 'iv', label: 'IV', type: 'textWithVariable' },
      { key: 'context', label: 'Context', type: 'textWithVariable' },
      { key: 'resultVariable', label: 'Guardar token en', type: 'variable' }
    ]
  },
  captcha_get_balance: {
    title: 'Consultar Saldo',
    icon: 'fa-wallet',
    description: 'Consulta saldo de la cuenta',
    fields: [
      { key: 'resultVariable', label: 'Guardar saldo en', type: 'variable' }
    ]
  },
  captcha_get_result: {
    title: 'Obtener Resultado',
    icon: 'fa-check-circle',
    description: 'Obtiene resultado de una tarea',
    fields: [
      { key: 'taskId', label: 'ID de la Tarea', type: 'textWithVariable', required: true },
      { key: 'timeout', label: 'Timeout (seg)', type: 'number', default: 120 },
      { key: 'resultVariable', label: 'Guardar resultado en', type: 'variable' }
    ]
  },
  captcha_report: {
    title: 'Reportar Solución',
    icon: 'fa-flag',
    description: 'Reporta si la solución fue correcta',
    fields: [
      { key: 'taskId', label: 'ID de la Tarea', type: 'textWithVariable', required: true },
      { key: 'correct', label: 'Solución correcta', type: 'checkbox', default: false },
      { key: 'resultVariable', label: 'Guardar resultado en', type: 'variable' }
    ]
  },

  // ==========================================
  // STRIPE
  // ==========================================
  stripe_connect: {
    title: 'Conectar Stripe',
    icon: 'fa-plug',
    description: 'Configura conexión con Stripe',
    fields: [
      { key: 'secretKey', label: 'Secret Key', type: 'password', required: true, helpText: 'sk_live_... o sk_test_...' },
      { key: 'connectionVariable', label: 'Guardar conexión en', type: 'variable', required: true }
    ]
  },
  stripe_create_payment: {
    title: 'Crear Payment Intent',
    icon: 'fa-credit-card',
    description: 'Crea un intento de pago',
    fields: [
      { key: 'amount', label: 'Monto (centavos)', type: 'textWithVariable', required: true, helpText: '1000 = $10.00' },
      { key: 'currency', label: 'Moneda', type: 'textWithVariable', default: 'usd' },
      { key: 'customerId', label: 'ID Cliente', type: 'textWithVariable' },
      { key: 'description', label: 'Descripción', type: 'textWithVariable' },
      { key: 'paymentMethod', label: 'Método de pago', type: 'textWithVariable' },
      { key: 'autoConfirm', label: 'Auto-confirmar', type: 'checkbox', default: false },
      { key: 'resultVariable', label: 'Guardar resultado en', type: 'variable' }
    ]
  },
  stripe_create_customer: {
    title: 'Crear Cliente',
    icon: 'fa-user-plus',
    description: 'Crea un cliente en Stripe',
    fields: [
      { key: 'email', label: 'Email', type: 'textWithVariable', required: true },
      { key: 'name', label: 'Nombre', type: 'textWithVariable' },
      { key: 'phone', label: 'Teléfono', type: 'textWithVariable' },
      { key: 'description', label: 'Descripción', type: 'textWithVariable' },
      { key: 'metadata', label: 'Metadata (JSON)', type: 'textareaWithVariable' },
      { key: 'resultVariable', label: 'Guardar resultado en', type: 'variable' }
    ]
  },
  stripe_get_customer: {
    title: 'Obtener Cliente',
    icon: 'fa-user',
    description: 'Obtiene información de un cliente',
    fields: [
      { key: 'customerId', label: 'ID del Cliente', type: 'textWithVariable', required: true },
      { key: 'resultVariable', label: 'Guardar resultado en', type: 'variable' }
    ]
  },
  stripe_create_subscription: {
    title: 'Crear Suscripción',
    icon: 'fa-sync',
    description: 'Crea una suscripción recurrente',
    fields: [
      { key: 'customerId', label: 'ID del Cliente', type: 'textWithVariable', required: true },
      { key: 'priceId', label: 'ID del Precio', type: 'textWithVariable', required: true },
      { key: 'trialDays', label: 'Días de prueba', type: 'number' },
      { key: 'resultVariable', label: 'Guardar resultado en', type: 'variable' }
    ]
  },
  stripe_cancel_subscription: {
    title: 'Cancelar Suscripción',
    icon: 'fa-times-circle',
    description: 'Cancela una suscripción',
    fields: [
      { key: 'subscriptionId', label: 'ID Suscripción', type: 'textWithVariable', required: true },
      { key: 'immediately', label: 'Cancelar inmediatamente', type: 'checkbox', default: false, helpText: 'Si no, cancela al fin del periodo' },
      { key: 'resultVariable', label: 'Guardar resultado en', type: 'variable' }
    ]
  },
  stripe_create_invoice: {
    title: 'Crear Factura',
    icon: 'fa-file-invoice',
    description: 'Crea una factura en Stripe',
    fields: [
      { key: 'customerId', label: 'ID del Cliente', type: 'textWithVariable', required: true },
      { key: 'description', label: 'Descripción', type: 'textWithVariable' },
      { key: 'autoAdvance', label: 'Auto-avanzar', type: 'checkbox', default: true },
      { key: 'resultVariable', label: 'Guardar resultado en', type: 'variable' }
    ]
  },
  stripe_refund: {
    title: 'Reembolsar',
    icon: 'fa-undo',
    description: 'Reembolsa un pago',
    fields: [
      { key: 'paymentIntentId', label: 'ID Payment Intent', type: 'textWithVariable', required: true },
      { key: 'amount', label: 'Monto (centavos)', type: 'textWithVariable', helpText: 'Vacío = reembolso total' },
      { key: 'reason', label: 'Razón', type: 'select', options: [{ value: 'duplicate', label: 'Duplicado' }, { value: 'fraudulent', label: 'Fraude' }, { value: 'requested_by_customer', label: 'Solicitado por cliente' }] },
      { key: 'resultVariable', label: 'Guardar resultado en', type: 'variable' }
    ]
  },
  stripe_list_charges: {
    title: 'Listar Cobros',
    icon: 'fa-list',
    description: 'Lista cobros realizados',
    fields: [
      { key: 'customerId', label: 'ID Cliente', type: 'textWithVariable' },
      { key: 'limit', label: 'Límite', type: 'number', default: 10 },
      { key: 'startDate', label: 'Desde', type: 'textWithVariable' },
      { key: 'endDate', label: 'Hasta', type: 'textWithVariable' },
      { key: 'resultVariable', label: 'Guardar resultado en', type: 'variable' }
    ]
  },
  stripe_create_product: {
    title: 'Crear Producto',
    icon: 'fa-box',
    description: 'Crea un producto con precio',
    fields: [
      { key: 'name', label: 'Nombre', type: 'textWithVariable', required: true },
      { key: 'description', label: 'Descripción', type: 'textWithVariable' },
      { key: 'price', label: 'Precio (centavos)', type: 'textWithVariable' },
      { key: 'currency', label: 'Moneda', type: 'textWithVariable', default: 'usd' },
      { key: 'recurring', label: 'Recurrencia', type: 'select', default: 'none', options: [{ value: 'none', label: 'Único' }, { value: 'month', label: 'Mensual' }, { value: 'year', label: 'Anual' }] },
      { key: 'resultVariable', label: 'Guardar resultado en', type: 'variable' }
    ]
  },
  stripe_create_checkout: {
    title: 'Crear Checkout Session',
    icon: 'fa-shopping-cart',
    description: 'Crea una sesión de checkout',
    fields: [
      { key: 'mode', label: 'Modo', type: 'select', default: 'payment', options: [{ value: 'payment', label: 'Pago único' }, { value: 'subscription', label: 'Suscripción' }, { value: 'setup', label: 'Setup' }] },
      { key: 'lineItems', label: 'Items (JSON)', type: 'textareaWithVariable', helpText: '[{price, quantity}]' },
      { key: 'successUrl', label: 'URL de éxito', type: 'textWithVariable', required: true },
      { key: 'cancelUrl', label: 'URL de cancelación', type: 'textWithVariable', required: true },
      { key: 'resultVariable', label: 'Guardar resultado en', type: 'variable' }
    ]
  },
  stripe_get_balance: {
    title: 'Obtener Balance',
    icon: 'fa-wallet',
    description: 'Obtiene el balance de la cuenta',
    fields: [
      { key: 'resultVariable', label: 'Guardar resultado en', type: 'variable' }
    ]
  },

  // ==========================================
  // PAYPAL
  // ==========================================
  paypal_connect: {
    title: 'Conectar PayPal',
    icon: 'fa-plug',
    description: 'Configura conexión con PayPal',
    fields: [
      { key: 'clientId', label: 'Client ID', type: 'password', required: true },
      { key: 'clientSecret', label: 'Client Secret', type: 'password', required: true },
      { key: 'sandbox', label: 'Usar Sandbox', type: 'checkbox', default: false, helpText: 'Activar para pruebas' },
      { key: 'connectionVariable', label: 'Guardar conexión en', type: 'variable', required: true }
    ]
  },
  paypal_create_order: {
    title: 'Crear Orden',
    icon: 'fa-plus',
    description: 'Crea una orden de pago',
    fields: [
      { key: 'amount', label: 'Monto', type: 'textWithVariable', required: true },
      { key: 'currency', label: 'Moneda', type: 'textWithVariable', default: 'USD' },
      { key: 'description', label: 'Descripción', type: 'textWithVariable' },
      { key: 'intent', label: 'Intención', type: 'select', default: 'CAPTURE', options: [{ value: 'CAPTURE', label: 'Capturar' }, { value: 'AUTHORIZE', label: 'Autorizar' }] },
      { key: 'resultVariable', label: 'Guardar resultado en', type: 'variable' }
    ]
  },
  paypal_capture_payment: {
    title: 'Capturar Pago',
    icon: 'fa-check',
    description: 'Captura un pago autorizado',
    fields: [
      { key: 'orderId', label: 'ID de la Orden', type: 'textWithVariable', required: true },
      { key: 'resultVariable', label: 'Guardar resultado en', type: 'variable' }
    ]
  },
  paypal_refund: {
    title: 'Reembolsar',
    icon: 'fa-undo',
    description: 'Reembolsa un pago capturado',
    fields: [
      { key: 'captureId', label: 'ID de Captura', type: 'textWithVariable', required: true },
      { key: 'amount', label: 'Monto', type: 'textWithVariable', helpText: 'Vacío = total' },
      { key: 'currency', label: 'Moneda', type: 'textWithVariable' },
      { key: 'note', label: 'Nota', type: 'textWithVariable' },
      { key: 'resultVariable', label: 'Guardar resultado en', type: 'variable' }
    ]
  },
  paypal_create_payout: {
    title: 'Crear Payout',
    icon: 'fa-money-bill-wave',
    description: 'Envía dinero a un recipiente',
    fields: [
      { key: 'recipientEmail', label: 'Email del recipiente', type: 'textWithVariable', required: true },
      { key: 'amount', label: 'Monto', type: 'textWithVariable', required: true },
      { key: 'currency', label: 'Moneda', type: 'textWithVariable', default: 'USD' },
      { key: 'note', label: 'Nota', type: 'textWithVariable' },
      { key: 'resultVariable', label: 'Guardar resultado en', type: 'variable' }
    ]
  },
  paypal_create_subscription: {
    title: 'Crear Suscripción',
    icon: 'fa-sync',
    description: 'Crea una suscripción recurrente',
    fields: [
      { key: 'planId', label: 'ID del Plan', type: 'textWithVariable', required: true },
      { key: 'subscriberEmail', label: 'Email del suscriptor', type: 'textWithVariable' },
      { key: 'startDate', label: 'Fecha de inicio', type: 'textWithVariable' },
      { key: 'resultVariable', label: 'Guardar resultado en', type: 'variable' }
    ]
  },
  paypal_create_invoice: {
    title: 'Crear Factura',
    icon: 'fa-file-invoice',
    description: 'Crea una factura PayPal',
    fields: [
      { key: 'recipientEmail', label: 'Email recipiente', type: 'textWithVariable', required: true },
      { key: 'items', label: 'Items (JSON)', type: 'textareaWithVariable', helpText: '[{name, quantity, unit_amount}]' },
      { key: 'note', label: 'Nota', type: 'textWithVariable' },
      { key: 'resultVariable', label: 'Guardar resultado en', type: 'variable' }
    ]
  },
  paypal_get_transactions: {
    title: 'Obtener Transacciones',
    icon: 'fa-list',
    description: 'Lista transacciones',
    fields: [
      { key: 'startDate', label: 'Desde', type: 'textWithVariable', required: true },
      { key: 'endDate', label: 'Hasta', type: 'textWithVariable', required: true },
      { key: 'transactionStatus', label: 'Estado', type: 'select', default: 'all', options: [{ value: 'all', label: 'Todos' }, { value: 'D', label: 'Denegado' }, { value: 'P', label: 'Pendiente' }, { value: 'S', label: 'Exitoso' }, { value: 'V', label: 'Revertido' }] },
      { key: 'resultVariable', label: 'Guardar resultado en', type: 'variable' }
    ]
  },

  // ==========================================
  // SHOPIFY
  // ==========================================
  shopify_connect: {
    title: 'Conectar Shopify',
    icon: 'fa-plug',
    description: 'Configura conexión con Shopify',
    fields: [
      { key: 'storeDomain', label: 'Dominio', type: 'textWithVariable', required: true, helpText: 'tu-tienda.myshopify.com' },
      { key: 'accessToken', label: 'Access Token', type: 'password', required: true },
      { key: 'connectionVariable', label: 'Guardar conexión en', type: 'variable', required: true }
    ]
  },
  shopify_create_product: {
    title: 'Crear Producto',
    icon: 'fa-plus',
    description: 'Crea un producto en Shopify',
    fields: [
      { key: 'title', label: 'Título', type: 'textWithVariable', required: true },
      { key: 'description', label: 'Descripción', type: 'textareaWithVariable' },
      { key: 'productType', label: 'Tipo', type: 'textWithVariable' },
      { key: 'vendor', label: 'Proveedor', type: 'textWithVariable' },
      { key: 'tags', label: 'Tags', type: 'tags' },
      { key: 'price', label: 'Precio', type: 'textWithVariable' },
      { key: 'sku', label: 'SKU', type: 'textWithVariable' },
      { key: 'inventoryQty', label: 'Stock', type: 'number' },
      { key: 'resultVariable', label: 'Guardar resultado en', type: 'variable' }
    ]
  },
  shopify_update_product: {
    title: 'Actualizar Producto',
    icon: 'fa-edit',
    description: 'Actualiza un producto existente',
    fields: [
      { key: 'productId', label: 'ID Producto', type: 'textWithVariable', required: true },
      { key: 'title', label: 'Título', type: 'textWithVariable' },
      { key: 'description', label: 'Descripción', type: 'textareaWithVariable' },
      { key: 'tags', label: 'Tags', type: 'tags' },
      { key: 'status', label: 'Estado', type: 'select', options: [{ value: 'active', label: 'Activo' }, { value: 'draft', label: 'Borrador' }, { value: 'archived', label: 'Archivado' }] },
      { key: 'resultVariable', label: 'Guardar resultado en', type: 'variable' }
    ]
  },
  shopify_get_products: {
    title: 'Obtener Productos',
    icon: 'fa-list',
    description: 'Lista productos de la tienda',
    fields: [
      { key: 'limit', label: 'Límite', type: 'number', default: 50 },
      { key: 'status', label: 'Estado', type: 'select', default: 'any', options: [{ value: 'any', label: 'Todos' }, { value: 'active', label: 'Activos' }, { value: 'draft', label: 'Borradores' }, { value: 'archived', label: 'Archivados' }] },
      { key: 'resultVariable', label: 'Guardar resultado en', type: 'variable' }
    ]
  },
  shopify_get_orders: {
    title: 'Obtener Órdenes',
    icon: 'fa-shopping-cart',
    description: 'Lista órdenes de la tienda',
    fields: [
      { key: 'status', label: 'Estado', type: 'select', default: 'any', options: [{ value: 'any', label: 'Todas' }, { value: 'open', label: 'Abiertas' }, { value: 'closed', label: 'Cerradas' }, { value: 'cancelled', label: 'Canceladas' }] },
      { key: 'limit', label: 'Límite', type: 'number', default: 50 },
      { key: 'sinceDate', label: 'Desde', type: 'textWithVariable' },
      { key: 'financialStatus', label: 'Estado financiero', type: 'select', default: 'any', options: [{ value: 'any', label: 'Todos' }, { value: 'paid', label: 'Pagado' }, { value: 'unpaid', label: 'Sin pagar' }, { value: 'refunded', label: 'Reembolsado' }] },
      { key: 'resultVariable', label: 'Guardar resultado en', type: 'variable' }
    ]
  },
  shopify_fulfill_order: {
    title: 'Cumplir Orden',
    icon: 'fa-truck',
    description: 'Marca una orden como enviada',
    fields: [
      { key: 'orderId', label: 'ID de Orden', type: 'textWithVariable', required: true },
      { key: 'trackingNumber', label: 'Número de tracking', type: 'textWithVariable' },
      { key: 'trackingCompany', label: 'Empresa de envío', type: 'textWithVariable' },
      { key: 'trackingUrl', label: 'URL de tracking', type: 'textWithVariable' },
      { key: 'notifyCustomer', label: 'Notificar cliente', type: 'checkbox', default: true },
      { key: 'resultVariable', label: 'Guardar resultado en', type: 'variable' }
    ]
  },
  shopify_update_inventory: {
    title: 'Actualizar Inventario',
    icon: 'fa-boxes',
    description: 'Ajusta inventario de un producto',
    fields: [
      { key: 'inventoryItemId', label: 'ID Item Inventario', type: 'textWithVariable', required: true },
      { key: 'locationId', label: 'ID Ubicación', type: 'textWithVariable', required: true },
      { key: 'adjustment', label: 'Ajuste (+/-)', type: 'number' },
      { key: 'resultVariable', label: 'Guardar resultado en', type: 'variable' }
    ]
  },
  shopify_create_customer: {
    title: 'Crear Cliente',
    icon: 'fa-user-plus',
    description: 'Crea un cliente en Shopify',
    fields: [
      { key: 'firstName', label: 'Nombre', type: 'textWithVariable' },
      { key: 'lastName', label: 'Apellido', type: 'textWithVariable' },
      { key: 'email', label: 'Email', type: 'textWithVariable', required: true },
      { key: 'phone', label: 'Teléfono', type: 'textWithVariable' },
      { key: 'tags', label: 'Tags', type: 'tags' },
      { key: 'resultVariable', label: 'Guardar resultado en', type: 'variable' }
    ]
  },
  shopify_create_discount: {
    title: 'Crear Descuento',
    icon: 'fa-percentage',
    description: 'Crea un código de descuento',
    fields: [
      { key: 'code', label: 'Código', type: 'textWithVariable', required: true },
      { key: 'discountType', label: 'Tipo', type: 'select', default: 'percentage', options: [{ value: 'percentage', label: 'Porcentaje' }, { value: 'fixed_amount', label: 'Monto fijo' }, { value: 'free_shipping', label: 'Envío gratis' }] },
      { key: 'value', label: 'Valor', type: 'textWithVariable', required: true },
      { key: 'usageLimit', label: 'Límite de uso', type: 'number' },
      { key: 'startsAt', label: 'Fecha inicio', type: 'textWithVariable' },
      { key: 'endsAt', label: 'Fecha fin', type: 'textWithVariable' },
      { key: 'resultVariable', label: 'Guardar resultado en', type: 'variable' }
    ]
  },
  shopify_refund_order: {
    title: 'Reembolsar Orden',
    icon: 'fa-undo',
    description: 'Reembolsa una orden',
    fields: [
      { key: 'orderId', label: 'ID de Orden', type: 'textWithVariable', required: true },
      { key: 'amount', label: 'Monto', type: 'textWithVariable', helpText: 'Vacío = total' },
      { key: 'note', label: 'Nota', type: 'textWithVariable' },
      { key: 'notify', label: 'Notificar cliente', type: 'checkbox', default: true },
      { key: 'resultVariable', label: 'Guardar resultado en', type: 'variable' }
    ]
  },
  shopify_get_analytics: {
    title: 'Obtener Analíticas',
    icon: 'fa-chart-line',
    description: 'Obtiene analíticas de la tienda',
    fields: [
      { key: 'reportType', label: 'Tipo', type: 'select', default: 'sales', options: [{ value: 'sales', label: 'Ventas' }, { value: 'orders', label: 'Órdenes' }, { value: 'customers', label: 'Clientes' }, { value: 'inventory', label: 'Inventario' }] },
      { key: 'sinceDate', label: 'Desde', type: 'textWithVariable' },
      { key: 'untilDate', label: 'Hasta', type: 'textWithVariable' },
      { key: 'resultVariable', label: 'Guardar resultado en', type: 'variable' }
    ]
  },

  // ==========================================
  // WOOCOMMERCE
  // ==========================================
  woo_connect: {
    title: 'Conectar WooCommerce',
    icon: 'fa-plug',
    description: 'Configura conexión con WooCommerce',
    fields: [
      { key: 'siteUrl', label: 'URL del sitio', type: 'textWithVariable', required: true, helpText: 'https://tu-sitio.com' },
      { key: 'consumerKey', label: 'Consumer Key', type: 'password', required: true },
      { key: 'consumerSecret', label: 'Consumer Secret', type: 'password', required: true },
      { key: 'connectionVariable', label: 'Guardar conexión en', type: 'variable', required: true }
    ]
  },
  woo_create_product: {
    title: 'Crear Producto',
    icon: 'fa-plus',
    description: 'Crea un producto en WooCommerce',
    fields: [
      { key: 'name', label: 'Nombre', type: 'textWithVariable', required: true },
      { key: 'type', label: 'Tipo', type: 'select', default: 'simple', options: [{ value: 'simple', label: 'Simple' }, { value: 'variable', label: 'Variable' }, { value: 'grouped', label: 'Agrupado' }, { value: 'external', label: 'Externo' }] },
      { key: 'regularPrice', label: 'Precio regular', type: 'textWithVariable' },
      { key: 'salePrice', label: 'Precio oferta', type: 'textWithVariable' },
      { key: 'description', label: 'Descripción', type: 'textareaWithVariable' },
      { key: 'sku', label: 'SKU', type: 'textWithVariable' },
      { key: 'stockQuantity', label: 'Stock', type: 'number' },
      { key: 'categories', label: 'Categorías', type: 'tags' },
      { key: 'resultVariable', label: 'Guardar resultado en', type: 'variable' }
    ]
  },
  woo_update_product: {
    title: 'Actualizar Producto',
    icon: 'fa-edit',
    description: 'Actualiza un producto existente',
    fields: [
      { key: 'productId', label: 'ID Producto', type: 'textWithVariable', required: true },
      { key: 'name', label: 'Nombre', type: 'textWithVariable' },
      { key: 'regularPrice', label: 'Precio', type: 'textWithVariable' },
      { key: 'stockQuantity', label: 'Stock', type: 'number' },
      { key: 'status', label: 'Estado', type: 'select', options: [{ value: 'publish', label: 'Publicado' }, { value: 'draft', label: 'Borrador' }, { value: 'pending', label: 'Pendiente' }, { value: 'private', label: 'Privado' }] },
      { key: 'resultVariable', label: 'Guardar resultado en', type: 'variable' }
    ]
  },
  woo_get_products: {
    title: 'Obtener Productos',
    icon: 'fa-list',
    description: 'Lista productos',
    fields: [
      { key: 'perPage', label: 'Por página', type: 'number', default: 20 },
      { key: 'status', label: 'Estado', type: 'select', default: 'any', options: [{ value: 'any', label: 'Todos' }, { value: 'publish', label: 'Publicados' }, { value: 'draft', label: 'Borradores' }] },
      { key: 'search', label: 'Buscar', type: 'textWithVariable' },
      { key: 'resultVariable', label: 'Guardar resultado en', type: 'variable' }
    ]
  },
  woo_get_orders: {
    title: 'Obtener Órdenes',
    icon: 'fa-shopping-cart',
    description: 'Lista órdenes',
    fields: [
      { key: 'perPage', label: 'Por página', type: 'number', default: 20 },
      { key: 'status', label: 'Estado', type: 'select', default: 'any', options: [{ value: 'any', label: 'Todas' }, { value: 'pending', label: 'Pendiente' }, { value: 'processing', label: 'Procesando' }, { value: 'completed', label: 'Completada' }, { value: 'cancelled', label: 'Cancelada' }, { value: 'refunded', label: 'Reembolsada' }] },
      { key: 'after', label: 'Después de', type: 'textWithVariable', helpText: 'Fecha ISO 8601' },
      { key: 'resultVariable', label: 'Guardar resultado en', type: 'variable' }
    ]
  },
  woo_update_order: {
    title: 'Actualizar Orden',
    icon: 'fa-edit',
    description: 'Actualiza estado de una orden',
    fields: [
      { key: 'orderId', label: 'ID de Orden', type: 'textWithVariable', required: true },
      { key: 'status', label: 'Estado', type: 'select', required: true, options: [{ value: 'pending', label: 'Pendiente' }, { value: 'processing', label: 'Procesando' }, { value: 'on-hold', label: 'En espera' }, { value: 'completed', label: 'Completada' }, { value: 'cancelled', label: 'Cancelada' }, { value: 'refunded', label: 'Reembolsada' }] },
      { key: 'note', label: 'Nota', type: 'textWithVariable' },
      { key: 'resultVariable', label: 'Guardar resultado en', type: 'variable' }
    ]
  },
  woo_create_coupon: {
    title: 'Crear Cupón',
    icon: 'fa-ticket-alt',
    description: 'Crea un cupón de descuento',
    fields: [
      { key: 'code', label: 'Código', type: 'textWithVariable', required: true },
      { key: 'discountType', label: 'Tipo', type: 'select', default: 'percent', options: [{ value: 'percent', label: 'Porcentaje' }, { value: 'fixed_cart', label: 'Monto fijo carrito' }, { value: 'fixed_product', label: 'Monto fijo producto' }] },
      { key: 'amount', label: 'Valor', type: 'textWithVariable', required: true },
      { key: 'usageLimit', label: 'Límite de uso', type: 'number' },
      { key: 'expiryDate', label: 'Fecha expiración', type: 'textWithVariable' },
      { key: 'resultVariable', label: 'Guardar resultado en', type: 'variable' }
    ]
  },
  woo_update_inventory: {
    title: 'Actualizar Inventario',
    icon: 'fa-boxes',
    description: 'Actualiza stock de un producto',
    fields: [
      { key: 'productId', label: 'ID Producto', type: 'textWithVariable', required: true },
      { key: 'stockQuantity', label: 'Cantidad', type: 'number', required: true },
      { key: 'manageStock', label: 'Gestionar stock', type: 'checkbox', default: true },
      { key: 'resultVariable', label: 'Guardar resultado en', type: 'variable' }
    ]
  },
  woo_create_customer: {
    title: 'Crear Cliente',
    icon: 'fa-user-plus',
    description: 'Crea un cliente',
    fields: [
      { key: 'email', label: 'Email', type: 'textWithVariable', required: true },
      { key: 'firstName', label: 'Nombre', type: 'textWithVariable' },
      { key: 'lastName', label: 'Apellido', type: 'textWithVariable' },
      { key: 'username', label: 'Usuario', type: 'textWithVariable' },
      { key: 'resultVariable', label: 'Guardar resultado en', type: 'variable' }
    ]
  },
  woo_get_reports: {
    title: 'Obtener Reportes',
    icon: 'fa-chart-bar',
    description: 'Obtiene reportes de ventas',
    fields: [
      { key: 'report', label: 'Reporte', type: 'select', default: 'sales', options: [{ value: 'sales', label: 'Ventas' }, { value: 'top_sellers', label: 'Más vendidos' }, { value: 'coupons', label: 'Cupones' }, { value: 'customers', label: 'Clientes' }] },
      { key: 'period', label: 'Periodo', type: 'select', default: 'month', options: [{ value: 'week', label: 'Semana' }, { value: 'month', label: 'Mes' }, { value: 'year', label: 'Año' }] },
      { key: 'resultVariable', label: 'Guardar resultado en', type: 'variable' }
    ]
  },

  // ==========================================
  // AMAZON SP-API
  // ==========================================
  amz_connect: {
    title: 'Conectar Amazon',
    icon: 'fa-plug',
    description: 'Configura conexión con Amazon SP-API',
    fields: [
      { key: 'clientId', label: 'Client ID', type: 'password', required: true },
      { key: 'clientSecret', label: 'Client Secret', type: 'password', required: true },
      { key: 'refreshToken', label: 'Refresh Token', type: 'password', required: true },
      { key: 'marketplace', label: 'Marketplace', type: 'select', default: 'US', options: [{ value: 'US', label: 'Estados Unidos' }, { value: 'CA', label: 'Canadá' }, { value: 'MX', label: 'México' }, { value: 'BR', label: 'Brasil' }, { value: 'UK', label: 'Reino Unido' }, { value: 'DE', label: 'Alemania' }, { value: 'FR', label: 'Francia' }, { value: 'ES', label: 'España' }] },
      { key: 'connectionVariable', label: 'Guardar conexión en', type: 'variable', required: true }
    ]
  },
  amz_get_orders: {
    title: 'Obtener Órdenes',
    icon: 'fa-shopping-cart',
    description: 'Lista órdenes de Amazon',
    fields: [
      { key: 'createdAfter', label: 'Creadas después de', type: 'textWithVariable' },
      { key: 'createdBefore', label: 'Creadas antes de', type: 'textWithVariable' },
      { key: 'orderStatuses', label: 'Estados', type: 'tags', helpText: 'Pending, Shipped, Canceled...' },
      { key: 'maxResults', label: 'Máximo', type: 'number', default: 50 },
      { key: 'resultVariable', label: 'Guardar resultado en', type: 'variable' }
    ]
  },
  amz_get_order_items: {
    title: 'Items de Orden',
    icon: 'fa-list',
    description: 'Obtiene items de una orden',
    fields: [
      { key: 'orderId', label: 'ID de Orden', type: 'textWithVariable', required: true },
      { key: 'resultVariable', label: 'Guardar resultado en', type: 'variable' }
    ]
  },
  amz_create_listing: {
    title: 'Crear Listado',
    icon: 'fa-plus',
    description: 'Crea un listado de producto',
    fields: [
      { key: 'sku', label: 'SKU', type: 'textWithVariable', required: true },
      { key: 'asin', label: 'ASIN', type: 'textWithVariable' },
      { key: 'price', label: 'Precio', type: 'textWithVariable', required: true },
      { key: 'condition', label: 'Condición', type: 'select', default: 'New', options: [{ value: 'New', label: 'Nuevo' }, { value: 'UsedLikeNew', label: 'Usado - Como nuevo' }, { value: 'UsedVeryGood', label: 'Usado - Muy bueno' }, { value: 'UsedGood', label: 'Usado - Bueno' }] },
      { key: 'quantity', label: 'Cantidad', type: 'number' },
      { key: 'resultVariable', label: 'Guardar resultado en', type: 'variable' }
    ]
  },
  amz_update_inventory: {
    title: 'Actualizar Inventario FBA',
    icon: 'fa-boxes',
    description: 'Actualiza inventario en Amazon',
    fields: [
      { key: 'sku', label: 'SKU', type: 'textWithVariable', required: true },
      { key: 'quantity', label: 'Cantidad', type: 'number', required: true },
      { key: 'fulfillmentChannel', label: 'Canal', type: 'select', default: 'DEFAULT', options: [{ value: 'DEFAULT', label: 'Vendedor' }, { value: 'AMAZON_NA', label: 'FBA' }] },
      { key: 'resultVariable', label: 'Guardar resultado en', type: 'variable' }
    ]
  },
  amz_get_pricing: {
    title: 'Obtener Precios',
    icon: 'fa-dollar-sign',
    description: 'Obtiene precios de productos',
    fields: [
      { key: 'asin', label: 'ASIN', type: 'textWithVariable' },
      { key: 'sku', label: 'SKU', type: 'textWithVariable' },
      { key: 'itemType', label: 'Tipo', type: 'select', default: 'Asin', options: [{ value: 'Asin', label: 'ASIN' }, { value: 'Sku', label: 'SKU' }] },
      { key: 'resultVariable', label: 'Guardar resultado en', type: 'variable' }
    ]
  },
  amz_request_report: {
    title: 'Solicitar Reporte',
    icon: 'fa-file-alt',
    description: 'Solicita un reporte de Amazon',
    fields: [
      { key: 'reportType', label: 'Tipo', type: 'select', options: [{ value: 'GET_FLAT_FILE_OPEN_LISTINGS_DATA', label: 'Listados abiertos' }, { value: 'GET_MERCHANT_LISTINGS_ALL_DATA', label: 'Todos los listados' }, { value: 'GET_AFN_INVENTORY_DATA', label: 'Inventario FBA' }, { value: 'GET_FLAT_FILE_ALL_ORDERS_DATA_BY_ORDER_DATE', label: 'Órdenes por fecha' }] },
      { key: 'startDate', label: 'Desde', type: 'textWithVariable' },
      { key: 'endDate', label: 'Hasta', type: 'textWithVariable' },
      { key: 'resultVariable', label: 'Guardar resultado en', type: 'variable' }
    ]
  },
  amz_get_catalog: {
    title: 'Buscar Catálogo',
    icon: 'fa-th',
    description: 'Busca en el catálogo de Amazon',
    fields: [
      { key: 'keywords', label: 'Palabras clave', type: 'textWithVariable' },
      { key: 'asin', label: 'ASIN', type: 'textWithVariable' },
      { key: 'resultVariable', label: 'Guardar resultado en', type: 'variable' }
    ]
  },
  amz_get_financials: {
    title: 'Eventos Financieros',
    icon: 'fa-chart-line',
    description: 'Obtiene eventos financieros',
    fields: [
      { key: 'orderId', label: 'ID de Orden', type: 'textWithVariable' },
      { key: 'postedAfter', label: 'Después de', type: 'textWithVariable' },
      { key: 'postedBefore', label: 'Antes de', type: 'textWithVariable' },
      { key: 'resultVariable', label: 'Guardar resultado en', type: 'variable' }
    ]
  },

  // ==========================================
  // MERCADO LIBRE
  // ==========================================
  meli_connect: {
    title: 'Conectar Mercado Libre',
    icon: 'fa-plug',
    description: 'Configura conexión con Mercado Libre',
    fields: [
      { key: 'clientId', label: 'Client ID', type: 'password', required: true },
      { key: 'clientSecret', label: 'Client Secret', type: 'password', required: true },
      { key: 'refreshToken', label: 'Refresh Token', type: 'password' },
      { key: 'site', label: 'País', type: 'select', default: 'MLA', options: [{ value: 'MLA', label: 'Argentina' }, { value: 'MLB', label: 'Brasil' }, { value: 'MLM', label: 'México' }, { value: 'MLC', label: 'Chile' }, { value: 'MCO', label: 'Colombia' }, { value: 'MLU', label: 'Uruguay' }, { value: 'MPE', label: 'Perú' }] },
      { key: 'connectionVariable', label: 'Guardar conexión en', type: 'variable', required: true }
    ]
  },
  meli_create_listing: {
    title: 'Crear Publicación',
    icon: 'fa-plus',
    description: 'Crea una publicación en ML',
    fields: [
      { key: 'title', label: 'Título', type: 'textWithVariable', required: true },
      { key: 'categoryId', label: 'ID Categoría', type: 'textWithVariable', required: true },
      { key: 'price', label: 'Precio', type: 'textWithVariable', required: true },
      { key: 'currency', label: 'Moneda', type: 'select', default: 'ARS', options: [{ value: 'ARS', label: 'ARS' }, { value: 'BRL', label: 'BRL' }, { value: 'MXN', label: 'MXN' }, { value: 'CLP', label: 'CLP' }, { value: 'COP', label: 'COP' }, { value: 'USD', label: 'USD' }] },
      { key: 'condition', label: 'Condición', type: 'select', default: 'new', options: [{ value: 'new', label: 'Nuevo' }, { value: 'used', label: 'Usado' }] },
      { key: 'availableQuantity', label: 'Cantidad', type: 'number', required: true },
      { key: 'description', label: 'Descripción', type: 'textareaWithVariable' },
      { key: 'resultVariable', label: 'Guardar resultado en', type: 'variable' }
    ]
  },
  meli_update_listing: {
    title: 'Actualizar Publicación',
    icon: 'fa-edit',
    description: 'Actualiza una publicación',
    fields: [
      { key: 'itemId', label: 'ID del Item', type: 'textWithVariable', required: true },
      { key: 'price', label: 'Precio', type: 'textWithVariable' },
      { key: 'availableQuantity', label: 'Cantidad', type: 'number' },
      { key: 'status', label: 'Estado', type: 'select', options: [{ value: 'active', label: 'Activo' }, { value: 'paused', label: 'Pausado' }, { value: 'closed', label: 'Cerrado' }] },
      { key: 'title', label: 'Título', type: 'textWithVariable' },
      { key: 'resultVariable', label: 'Guardar resultado en', type: 'variable' }
    ]
  },
  meli_get_orders: {
    title: 'Obtener Ventas',
    icon: 'fa-shopping-cart',
    description: 'Lista ventas/órdenes',
    fields: [
      { key: 'status', label: 'Estado', type: 'select', default: 'all', options: [{ value: 'all', label: 'Todas' }, { value: 'confirmed', label: 'Confirmada' }, { value: 'paid', label: 'Pagada' }, { value: 'shipped', label: 'Enviada' }, { value: 'delivered', label: 'Entregada' }, { value: 'cancelled', label: 'Cancelada' }] },
      { key: 'sort', label: 'Orden', type: 'select', default: 'date_desc', options: [{ value: 'date_asc', label: 'Más antiguas' }, { value: 'date_desc', label: 'Más recientes' }] },
      { key: 'limit', label: 'Límite', type: 'number', default: 50 },
      { key: 'resultVariable', label: 'Guardar resultado en', type: 'variable' }
    ]
  },
  meli_update_order: {
    title: 'Actualizar Estado Orden',
    icon: 'fa-truck',
    description: 'Actualiza estado de envío',
    fields: [
      { key: 'orderId', label: 'ID de Orden', type: 'textWithVariable', required: true },
      { key: 'shipmentStatus', label: 'Estado envío', type: 'select', options: [{ value: 'ready_to_ship', label: 'Listo para enviar' }, { value: 'shipped', label: 'Enviado' }, { value: 'delivered', label: 'Entregado' }] },
      { key: 'trackingNumber', label: 'Nro seguimiento', type: 'textWithVariable' },
      { key: 'resultVariable', label: 'Guardar resultado en', type: 'variable' }
    ]
  },
  meli_get_questions: {
    title: 'Obtener Preguntas',
    icon: 'fa-question-circle',
    description: 'Lista preguntas de compradores',
    fields: [
      { key: 'itemId', label: 'ID del Item', type: 'textWithVariable' },
      { key: 'status', label: 'Estado', type: 'select', default: 'all', options: [{ value: 'all', label: 'Todas' }, { value: 'unanswered', label: 'Sin responder' }, { value: 'answered', label: 'Respondidas' }] },
      { key: 'resultVariable', label: 'Guardar resultado en', type: 'variable' }
    ]
  },
  meli_answer_question: {
    title: 'Responder Pregunta',
    icon: 'fa-reply',
    description: 'Responde una pregunta',
    fields: [
      { key: 'questionId', label: 'ID Pregunta', type: 'textWithVariable', required: true },
      { key: 'answer', label: 'Respuesta', type: 'textareaWithVariable', required: true },
      { key: 'resultVariable', label: 'Guardar resultado en', type: 'variable' }
    ]
  },
  meli_update_stock: {
    title: 'Actualizar Stock',
    icon: 'fa-boxes',
    description: 'Actualiza stock de un item',
    fields: [
      { key: 'itemId', label: 'ID del Item', type: 'textWithVariable', required: true },
      { key: 'availableQuantity', label: 'Cantidad', type: 'number', required: true },
      { key: 'resultVariable', label: 'Guardar resultado en', type: 'variable' }
    ]
  },
  meli_get_categories: {
    title: 'Obtener Categorías',
    icon: 'fa-sitemap',
    description: 'Lista categorías de ML',
    fields: [
      { key: 'siteId', label: 'País', type: 'select', default: 'MLA', options: [{ value: 'MLA', label: 'Argentina' }, { value: 'MLB', label: 'Brasil' }, { value: 'MLM', label: 'México' }, { value: 'MLC', label: 'Chile' }, { value: 'MCO', label: 'Colombia' }] },
      { key: 'categoryId', label: 'ID categoría padre', type: 'textWithVariable', helpText: 'Vacío = raíz' },
      { key: 'resultVariable', label: 'Guardar resultado en', type: 'variable' }
    ]
  },

  // ==========================================
  // GITHUB
  // ==========================================
  gh_connect: {
    title: 'Conectar GitHub',
    icon: 'fa-plug',
    description: 'Configura conexión con GitHub',
    fields: [
      { key: 'token', label: 'Personal Access Token', type: 'password', required: true },
      { key: 'baseUrl', label: 'Base URL', type: 'textWithVariable', helpText: 'Para Enterprise. Vacío = github.com' },
      { key: 'connectionVariable', label: 'Guardar conexión en', type: 'variable', required: true }
    ]
  },
  gh_create_issue: {
    title: 'Crear Issue',
    icon: 'fa-plus',
    description: 'Crea una issue en un repositorio',
    fields: [
      { key: 'owner', label: 'Owner', type: 'textWithVariable', required: true },
      { key: 'repo', label: 'Repositorio', type: 'textWithVariable', required: true },
      { key: 'title', label: 'Título', type: 'textWithVariable', required: true },
      { key: 'body', label: 'Descripción', type: 'textareaWithVariable' },
      { key: 'labels', label: 'Labels', type: 'tags' },
      { key: 'assignees', label: 'Asignados', type: 'tags' },
      { key: 'resultVariable', label: 'Guardar resultado en', type: 'variable' }
    ]
  },
  gh_update_issue: {
    title: 'Actualizar Issue',
    icon: 'fa-edit',
    description: 'Actualiza una issue existente',
    fields: [
      { key: 'owner', label: 'Owner', type: 'textWithVariable', required: true },
      { key: 'repo', label: 'Repositorio', type: 'textWithVariable', required: true },
      { key: 'issueNumber', label: 'Número de Issue', type: 'textWithVariable', required: true },
      { key: 'title', label: 'Título', type: 'textWithVariable' },
      { key: 'body', label: 'Descripción', type: 'textareaWithVariable' },
      { key: 'state', label: 'Estado', type: 'select', options: [{ value: 'open', label: 'Abierta' }, { value: 'closed', label: 'Cerrada' }] },
      { key: 'labels', label: 'Labels', type: 'tags' },
      { key: 'resultVariable', label: 'Guardar resultado en', type: 'variable' }
    ]
  },
  gh_create_pr: {
    title: 'Crear Pull Request',
    icon: 'fa-code-branch',
    description: 'Crea un pull request',
    fields: [
      { key: 'owner', label: 'Owner', type: 'textWithVariable', required: true },
      { key: 'repo', label: 'Repositorio', type: 'textWithVariable', required: true },
      { key: 'title', label: 'Título', type: 'textWithVariable', required: true },
      { key: 'body', label: 'Descripción', type: 'textareaWithVariable' },
      { key: 'head', label: 'Branch origen', type: 'textWithVariable', required: true },
      { key: 'base', label: 'Branch destino', type: 'textWithVariable', required: true },
      { key: 'draft', label: 'Draft', type: 'checkbox', default: false },
      { key: 'resultVariable', label: 'Guardar resultado en', type: 'variable' }
    ]
  },
  gh_merge_pr: {
    title: 'Merge Pull Request',
    icon: 'fa-check-circle',
    description: 'Hace merge de un PR',
    fields: [
      { key: 'owner', label: 'Owner', type: 'textWithVariable', required: true },
      { key: 'repo', label: 'Repositorio', type: 'textWithVariable', required: true },
      { key: 'pullNumber', label: 'Número de PR', type: 'textWithVariable', required: true },
      { key: 'mergeMethod', label: 'Método', type: 'select', default: 'merge', options: [{ value: 'merge', label: 'Merge' }, { value: 'squash', label: 'Squash' }, { value: 'rebase', label: 'Rebase' }] },
      { key: 'commitTitle', label: 'Título del commit', type: 'textWithVariable' },
      { key: 'resultVariable', label: 'Guardar resultado en', type: 'variable' }
    ]
  },
  gh_create_branch: {
    title: 'Crear Branch',
    icon: 'fa-code-branch',
    description: 'Crea un nuevo branch',
    fields: [
      { key: 'owner', label: 'Owner', type: 'textWithVariable', required: true },
      { key: 'repo', label: 'Repositorio', type: 'textWithVariable', required: true },
      { key: 'branchName', label: 'Nombre del branch', type: 'textWithVariable', required: true },
      { key: 'fromBranch', label: 'Desde branch', type: 'textWithVariable', default: 'main' },
      { key: 'resultVariable', label: 'Guardar resultado en', type: 'variable' }
    ]
  },
  gh_commit_file: {
    title: 'Commit Archivo',
    icon: 'fa-file-upload',
    description: 'Hace commit de un archivo',
    fields: [
      { key: 'owner', label: 'Owner', type: 'textWithVariable', required: true },
      { key: 'repo', label: 'Repositorio', type: 'textWithVariable', required: true },
      { key: 'path', label: 'Ruta del archivo', type: 'textWithVariable', required: true },
      { key: 'content', label: 'Contenido', type: 'textareaWithVariable', required: true },
      { key: 'message', label: 'Mensaje de commit', type: 'textWithVariable', required: true },
      { key: 'branch', label: 'Branch', type: 'textWithVariable', default: 'main' },
      { key: 'resultVariable', label: 'Guardar resultado en', type: 'variable' }
    ]
  },
  gh_get_file: {
    title: 'Obtener Archivo',
    icon: 'fa-file-code',
    description: 'Obtiene contenido de un archivo',
    fields: [
      { key: 'owner', label: 'Owner', type: 'textWithVariable', required: true },
      { key: 'repo', label: 'Repositorio', type: 'textWithVariable', required: true },
      { key: 'path', label: 'Ruta', type: 'textWithVariable', required: true },
      { key: 'branch', label: 'Branch', type: 'textWithVariable' },
      { key: 'resultVariable', label: 'Guardar resultado en', type: 'variable' }
    ]
  },
  gh_create_release: {
    title: 'Crear Release',
    icon: 'fa-tag',
    description: 'Crea un release en GitHub',
    fields: [
      { key: 'owner', label: 'Owner', type: 'textWithVariable', required: true },
      { key: 'repo', label: 'Repositorio', type: 'textWithVariable', required: true },
      { key: 'tagName', label: 'Tag', type: 'textWithVariable', required: true },
      { key: 'name', label: 'Nombre', type: 'textWithVariable' },
      { key: 'body', label: 'Notas de release', type: 'textareaWithVariable' },
      { key: 'prerelease', label: 'Pre-release', type: 'checkbox', default: false },
      { key: 'draft', label: 'Borrador', type: 'checkbox', default: false },
      { key: 'resultVariable', label: 'Guardar resultado en', type: 'variable' }
    ]
  },
  gh_trigger_workflow: {
    title: 'Trigger Actions',
    icon: 'fa-play',
    description: 'Dispara un workflow de GitHub Actions',
    fields: [
      { key: 'owner', label: 'Owner', type: 'textWithVariable', required: true },
      { key: 'repo', label: 'Repositorio', type: 'textWithVariable', required: true },
      { key: 'workflowId', label: 'ID del Workflow', type: 'textWithVariable', required: true },
      { key: 'ref', label: 'Ref (branch/tag)', type: 'textWithVariable', default: 'main' },
      { key: 'inputs', label: 'Inputs (JSON)', type: 'textareaWithVariable' },
      { key: 'resultVariable', label: 'Guardar resultado en', type: 'variable' }
    ]
  },
  gh_add_comment: {
    title: 'Agregar Comentario',
    icon: 'fa-comment',
    description: 'Comenta en una issue o PR',
    fields: [
      { key: 'owner', label: 'Owner', type: 'textWithVariable', required: true },
      { key: 'repo', label: 'Repositorio', type: 'textWithVariable', required: true },
      { key: 'issueNumber', label: 'Número de Issue/PR', type: 'textWithVariable', required: true },
      { key: 'body', label: 'Comentario', type: 'textareaWithVariable', required: true },
      { key: 'resultVariable', label: 'Guardar resultado en', type: 'variable' }
    ]
  },
  gh_list_repos: {
    title: 'Listar Repositorios',
    icon: 'fa-list',
    description: 'Lista repositorios',
    fields: [
      { key: 'org', label: 'Organización', type: 'textWithVariable', helpText: 'Vacío = usuario propio' },
      { key: 'type', label: 'Tipo', type: 'select', default: 'all', options: [{ value: 'all', label: 'Todos' }, { value: 'public', label: 'Públicos' }, { value: 'private', label: 'Privados' }, { value: 'forks', label: 'Forks' }] },
      { key: 'resultVariable', label: 'Guardar resultado en', type: 'variable' }
    ]
  },
  gh_create_gist: {
    title: 'Crear Gist',
    icon: 'fa-file-alt',
    description: 'Crea un Gist',
    fields: [
      { key: 'description', label: 'Descripción', type: 'textWithVariable' },
      { key: 'files', label: 'Archivos (JSON)', type: 'textareaWithVariable', required: true, helpText: '{"file.txt":{"content":"..."}}' },
      { key: 'public', label: 'Público', type: 'checkbox', default: false },
      { key: 'resultVariable', label: 'Guardar resultado en', type: 'variable' }
    ]
  },

  // ==========================================
  // GITLAB
  // ==========================================
  gl_connect: {
    title: 'Conectar GitLab',
    icon: 'fa-plug',
    description: 'Configura conexión con GitLab',
    fields: [
      { key: 'token', label: 'Personal Access Token', type: 'password', required: true },
      { key: 'baseUrl', label: 'URL de GitLab', type: 'textWithVariable', default: 'https://gitlab.com' },
      { key: 'connectionVariable', label: 'Guardar conexión en', type: 'variable', required: true }
    ]
  },
  gl_create_issue: {
    title: 'Crear Issue',
    icon: 'fa-plus',
    description: 'Crea una issue en GitLab',
    fields: [
      { key: 'projectId', label: 'ID del Proyecto', type: 'textWithVariable', required: true },
      { key: 'title', label: 'Título', type: 'textWithVariable', required: true },
      { key: 'description', label: 'Descripción', type: 'textareaWithVariable' },
      { key: 'labels', label: 'Labels', type: 'tags' },
      { key: 'assigneeId', label: 'ID del Asignado', type: 'textWithVariable' },
      { key: 'resultVariable', label: 'Guardar resultado en', type: 'variable' }
    ]
  },
  gl_create_mr: {
    title: 'Crear Merge Request',
    icon: 'fa-code-branch',
    description: 'Crea un merge request',
    fields: [
      { key: 'projectId', label: 'ID del Proyecto', type: 'textWithVariable', required: true },
      { key: 'title', label: 'Título', type: 'textWithVariable', required: true },
      { key: 'sourceBranch', label: 'Branch origen', type: 'textWithVariable', required: true },
      { key: 'targetBranch', label: 'Branch destino', type: 'textWithVariable', required: true },
      { key: 'description', label: 'Descripción', type: 'textareaWithVariable' },
      { key: 'removeSourceBranch', label: 'Eliminar branch origen', type: 'checkbox', default: true },
      { key: 'resultVariable', label: 'Guardar resultado en', type: 'variable' }
    ]
  },
  gl_merge_mr: {
    title: 'Merge MR',
    icon: 'fa-check-circle',
    description: 'Hace merge de un MR',
    fields: [
      { key: 'projectId', label: 'ID del Proyecto', type: 'textWithVariable', required: true },
      { key: 'mrIid', label: 'IID del MR', type: 'textWithVariable', required: true },
      { key: 'squash', label: 'Squash', type: 'checkbox', default: false },
      { key: 'removeSourceBranch', label: 'Eliminar branch', type: 'checkbox', default: true },
      { key: 'resultVariable', label: 'Guardar resultado en', type: 'variable' }
    ]
  },
  gl_create_branch: {
    title: 'Crear Branch',
    icon: 'fa-code-branch',
    description: 'Crea un nuevo branch',
    fields: [
      { key: 'projectId', label: 'ID del Proyecto', type: 'textWithVariable', required: true },
      { key: 'branchName', label: 'Nombre', type: 'textWithVariable', required: true },
      { key: 'ref', label: 'Ref origen', type: 'textWithVariable', default: 'main' },
      { key: 'resultVariable', label: 'Guardar resultado en', type: 'variable' }
    ]
  },
  gl_trigger_pipeline: {
    title: 'Trigger Pipeline',
    icon: 'fa-play',
    description: 'Dispara un pipeline CI/CD',
    fields: [
      { key: 'projectId', label: 'ID del Proyecto', type: 'textWithVariable', required: true },
      { key: 'ref', label: 'Ref (branch/tag)', type: 'textWithVariable', default: 'main' },
      { key: 'variables', label: 'Variables (JSON)', type: 'textareaWithVariable', helpText: '[{key, value}]' },
      { key: 'resultVariable', label: 'Guardar resultado en', type: 'variable' }
    ]
  },
  gl_get_pipeline: {
    title: 'Estado Pipeline',
    icon: 'fa-stream',
    description: 'Obtiene estado de un pipeline',
    fields: [
      { key: 'projectId', label: 'ID del Proyecto', type: 'textWithVariable', required: true },
      { key: 'pipelineId', label: 'ID del Pipeline', type: 'textWithVariable', required: true },
      { key: 'resultVariable', label: 'Guardar resultado en', type: 'variable' }
    ]
  },
  gl_list_projects: {
    title: 'Listar Proyectos',
    icon: 'fa-list',
    description: 'Lista proyectos de GitLab',
    fields: [
      { key: 'search', label: 'Buscar', type: 'textWithVariable' },
      { key: 'owned', label: 'Solo propios', type: 'checkbox', default: true },
      { key: 'visibility', label: 'Visibilidad', type: 'select', default: 'private', options: [{ value: 'public', label: 'Público' }, { value: 'internal', label: 'Interno' }, { value: 'private', label: 'Privado' }] },
      { key: 'resultVariable', label: 'Guardar resultado en', type: 'variable' }
    ]
  },
  gl_create_tag: {
    title: 'Crear Tag',
    icon: 'fa-tag',
    description: 'Crea un tag en el repositorio',
    fields: [
      { key: 'projectId', label: 'ID del Proyecto', type: 'textWithVariable', required: true },
      { key: 'tagName', label: 'Nombre del tag', type: 'textWithVariable', required: true },
      { key: 'ref', label: 'Ref', type: 'textWithVariable', required: true },
      { key: 'message', label: 'Mensaje', type: 'textWithVariable' },
      { key: 'resultVariable', label: 'Guardar resultado en', type: 'variable' }
    ]
  },
  gl_set_variable: {
    title: 'Variable CI/CD',
    icon: 'fa-key',
    description: 'Configura variable CI/CD',
    fields: [
      { key: 'projectId', label: 'ID del Proyecto', type: 'textWithVariable', required: true },
      { key: 'key', label: 'Nombre', type: 'textWithVariable', required: true },
      { key: 'value', label: 'Valor', type: 'textWithVariable', required: true },
      { key: 'protected', label: 'Protegida', type: 'checkbox', default: false },
      { key: 'masked', label: 'Enmascarada', type: 'checkbox', default: false },
      { key: 'resultVariable', label: 'Guardar resultado en', type: 'variable' }
    ]
  },

  // ==========================================
  // JENKINS
  // ==========================================
  jenkins_connect: {
    title: 'Conectar Jenkins',
    icon: 'fa-plug',
    description: 'Configura conexión con Jenkins',
    fields: [
      { key: 'url', label: 'URL de Jenkins', type: 'textWithVariable', required: true, helpText: 'http://jenkins:8080' },
      { key: 'username', label: 'Usuario', type: 'textWithVariable', required: true },
      { key: 'apiToken', label: 'API Token', type: 'password', required: true },
      { key: 'connectionVariable', label: 'Guardar conexión en', type: 'variable', required: true }
    ]
  },
  jenkins_trigger_build: {
    title: 'Trigger Build',
    icon: 'fa-play',
    description: 'Dispara un build',
    fields: [
      { key: 'jobName', label: 'Nombre del Job', type: 'textWithVariable', required: true },
      { key: 'parameters', label: 'Parámetros (JSON)', type: 'textareaWithVariable' },
      { key: 'resultVariable', label: 'Guardar resultado en', type: 'variable' }
    ]
  },
  jenkins_get_status: {
    title: 'Estado del Build',
    icon: 'fa-info-circle',
    description: 'Obtiene estado de un build',
    fields: [
      { key: 'jobName', label: 'Nombre del Job', type: 'textWithVariable', required: true },
      { key: 'buildNumber', label: 'Número de build', type: 'textWithVariable', helpText: 'Vacío = último' },
      { key: 'resultVariable', label: 'Guardar resultado en', type: 'variable' }
    ]
  },
  jenkins_get_log: {
    title: 'Obtener Log',
    icon: 'fa-terminal',
    description: 'Obtiene log de un build',
    fields: [
      { key: 'jobName', label: 'Nombre del Job', type: 'textWithVariable', required: true },
      { key: 'buildNumber', label: 'Número de build', type: 'textWithVariable' },
      { key: 'resultVariable', label: 'Guardar resultado en', type: 'variable' }
    ]
  },
  jenkins_list_jobs: {
    title: 'Listar Jobs',
    icon: 'fa-list',
    description: 'Lista jobs de Jenkins',
    fields: [
      { key: 'folder', label: 'Carpeta', type: 'textWithVariable', helpText: 'Vacío = raíz' },
      { key: 'resultVariable', label: 'Guardar resultado en', type: 'variable' }
    ]
  },
  jenkins_create_job: {
    title: 'Crear Job',
    icon: 'fa-plus',
    description: 'Crea un nuevo job',
    fields: [
      { key: 'jobName', label: 'Nombre', type: 'textWithVariable', required: true },
      { key: 'configXml', label: 'Config XML', type: 'textareaWithVariable' },
      { key: 'folder', label: 'Carpeta', type: 'textWithVariable' },
      { key: 'resultVariable', label: 'Guardar resultado en', type: 'variable' }
    ]
  },
  jenkins_cancel_build: {
    title: 'Cancelar Build',
    icon: 'fa-stop',
    description: 'Cancela un build en ejecución',
    fields: [
      { key: 'jobName', label: 'Nombre del Job', type: 'textWithVariable', required: true },
      { key: 'buildNumber', label: 'Número de build', type: 'textWithVariable', required: true },
      { key: 'resultVariable', label: 'Guardar resultado en', type: 'variable' }
    ]
  },
  jenkins_get_queue: {
    title: 'Ver Cola',
    icon: 'fa-clock',
    description: 'Obtiene la cola de builds',
    fields: [
      { key: 'resultVariable', label: 'Guardar resultado en', type: 'variable' }
    ]
  },

  // ==========================================
  // DOCKER
  // ==========================================
  docker_connect: {
    title: 'Conectar Docker',
    icon: 'fa-plug',
    description: 'Configura conexión con Docker',
    fields: [
      { key: 'host', label: 'Host', type: 'textWithVariable', default: 'unix:///var/run/docker.sock', helpText: 'Socket o tcp://host:2376' },
      { key: 'tlsCert', label: 'TLS Cert', type: 'textareaWithVariable' },
      { key: 'tlsKey', label: 'TLS Key', type: 'password' },
      { key: 'connectionVariable', label: 'Guardar conexión en', type: 'variable', required: true }
    ]
  },
  docker_list_containers: {
    title: 'Listar Contenedores',
    icon: 'fa-list',
    description: 'Lista contenedores Docker',
    fields: [
      { key: 'all', label: 'Incluir detenidos', type: 'checkbox', default: false },
      { key: 'resultVariable', label: 'Guardar resultado en', type: 'variable' }
    ]
  },
  docker_start_container: {
    title: 'Iniciar Contenedor',
    icon: 'fa-play',
    description: 'Inicia un contenedor',
    fields: [
      { key: 'containerId', label: 'ID/Nombre', type: 'textWithVariable', required: true },
      { key: 'resultVariable', label: 'Guardar resultado en', type: 'variable' }
    ]
  },
  docker_stop_container: {
    title: 'Detener Contenedor',
    icon: 'fa-stop',
    description: 'Detiene un contenedor',
    fields: [
      { key: 'containerId', label: 'ID/Nombre', type: 'textWithVariable', required: true },
      { key: 'timeout', label: 'Timeout (seg)', type: 'number', default: 10 },
      { key: 'resultVariable', label: 'Guardar resultado en', type: 'variable' }
    ]
  },
  docker_run: {
    title: 'Docker Run',
    icon: 'fa-terminal',
    description: 'Ejecuta un contenedor',
    fields: [
      { key: 'image', label: 'Imagen', type: 'textWithVariable', required: true },
      { key: 'name', label: 'Nombre', type: 'textWithVariable' },
      { key: 'ports', label: 'Puertos', type: 'tags', helpText: 'host:container ej: 8080:80' },
      { key: 'envVars', label: 'Variables de entorno', type: 'tags', helpText: 'KEY=value' },
      { key: 'volumes', label: 'Volúmenes', type: 'tags', helpText: '/host:/container' },
      { key: 'detach', label: 'Detach', type: 'checkbox', default: true },
      { key: 'resultVariable', label: 'Guardar resultado en', type: 'variable' }
    ]
  },
  docker_build: {
    title: 'Docker Build',
    icon: 'fa-hammer',
    description: 'Construye una imagen',
    fields: [
      { key: 'dockerfilePath', label: 'Ruta Dockerfile', type: 'textWithVariable', default: '.' },
      { key: 'tag', label: 'Tag', type: 'textWithVariable', required: true },
      { key: 'buildArgs', label: 'Build Args', type: 'tags', helpText: 'KEY=value' },
      { key: 'noCache', label: 'Sin cache', type: 'checkbox', default: false },
      { key: 'resultVariable', label: 'Guardar resultado en', type: 'variable' }
    ]
  },
  docker_pull: {
    title: 'Docker Pull',
    icon: 'fa-download',
    description: 'Descarga una imagen',
    fields: [
      { key: 'image', label: 'Imagen', type: 'textWithVariable', required: true },
      { key: 'tag', label: 'Tag', type: 'textWithVariable', default: 'latest' },
      { key: 'resultVariable', label: 'Guardar resultado en', type: 'variable' }
    ]
  },
  docker_push: {
    title: 'Docker Push',
    icon: 'fa-upload',
    description: 'Sube una imagen a un registry',
    fields: [
      { key: 'image', label: 'Imagen', type: 'textWithVariable', required: true },
      { key: 'tag', label: 'Tag', type: 'textWithVariable' },
      { key: 'registry', label: 'Registry', type: 'textWithVariable' },
      { key: 'resultVariable', label: 'Guardar resultado en', type: 'variable' }
    ]
  },
  docker_logs: {
    title: 'Obtener Logs',
    icon: 'fa-file-alt',
    description: 'Obtiene logs de un contenedor',
    fields: [
      { key: 'containerId', label: 'ID/Nombre', type: 'textWithVariable', required: true },
      { key: 'tail', label: 'Últimas líneas', type: 'number', default: 100 },
      { key: 'timestamps', label: 'Timestamps', type: 'checkbox', default: true },
      { key: 'resultVariable', label: 'Guardar resultado en', type: 'variable' }
    ]
  },
  docker_exec: {
    title: 'Ejecutar Comando',
    icon: 'fa-terminal',
    description: 'Ejecuta comando en un contenedor',
    fields: [
      { key: 'containerId', label: 'ID/Nombre', type: 'textWithVariable', required: true },
      { key: 'command', label: 'Comando', type: 'textWithVariable', required: true },
      { key: 'workdir', label: 'Directorio', type: 'textWithVariable' },
      { key: 'resultVariable', label: 'Guardar resultado en', type: 'variable' }
    ]
  },

  // ==========================================
  // YOUTUBE
  // ==========================================
  yt_connect: {
    title: 'Conectar YouTube',
    icon: 'fa-plug',
    description: 'Configura conexión con YouTube API',
    fields: [
      { key: 'apiKey', label: 'API Key', type: 'password', required: true },
      { key: 'oauthToken', label: 'OAuth Token', type: 'password', helpText: 'Para subir videos' },
      { key: 'connectionVariable', label: 'Guardar conexión en', type: 'variable', required: true }
    ]
  },
  yt_upload_video: {
    title: 'Subir Video',
    icon: 'fa-upload',
    description: 'Sube un video a YouTube',
    fields: [
      { key: 'filePath', label: 'Ruta del archivo', type: 'textWithVariable', required: true },
      { key: 'title', label: 'Título', type: 'textWithVariable', required: true },
      { key: 'description', label: 'Descripción', type: 'textareaWithVariable' },
      { key: 'tags', label: 'Tags', type: 'tags' },
      { key: 'privacy', label: 'Privacidad', type: 'select', default: 'private', options: [{ value: 'public', label: 'Público' }, { value: 'unlisted', label: 'No listado' }, { value: 'private', label: 'Privado' }] },
      { key: 'resultVariable', label: 'Guardar resultado en', type: 'variable' }
    ]
  },
  yt_search: {
    title: 'Buscar Videos',
    icon: 'fa-search',
    description: 'Busca videos en YouTube',
    fields: [
      { key: 'query', label: 'Consulta', type: 'textWithVariable', required: true },
      { key: 'type', label: 'Tipo', type: 'select', default: 'video', options: [{ value: 'video', label: 'Video' }, { value: 'channel', label: 'Canal' }, { value: 'playlist', label: 'Playlist' }] },
      { key: 'maxResults', label: 'Máximo', type: 'number', default: 10 },
      { key: 'order', label: 'Orden', type: 'select', default: 'relevance', options: [{ value: 'relevance', label: 'Relevancia' }, { value: 'date', label: 'Fecha' }, { value: 'viewCount', label: 'Vistas' }, { value: 'rating', label: 'Rating' }] },
      { key: 'resultVariable', label: 'Guardar resultado en', type: 'variable' }
    ]
  },
  yt_get_video: {
    title: 'Obtener Video',
    icon: 'fa-film',
    description: 'Obtiene info de un video',
    fields: [
      { key: 'videoId', label: 'ID del Video', type: 'textWithVariable', required: true },
      { key: 'resultVariable', label: 'Guardar resultado en', type: 'variable' }
    ]
  },
  yt_get_channel: {
    title: 'Info del Canal',
    icon: 'fa-tv',
    description: 'Obtiene info de un canal',
    fields: [
      { key: 'channelId', label: 'ID del Canal', type: 'textWithVariable' },
      { key: 'forUsername', label: 'Nombre de usuario', type: 'textWithVariable' },
      { key: 'resultVariable', label: 'Guardar resultado en', type: 'variable' }
    ]
  },
  yt_get_comments: {
    title: 'Obtener Comentarios',
    icon: 'fa-comments',
    description: 'Lista comentarios de un video',
    fields: [
      { key: 'videoId', label: 'ID del Video', type: 'textWithVariable', required: true },
      { key: 'maxResults', label: 'Máximo', type: 'number', default: 20 },
      { key: 'order', label: 'Orden', type: 'select', default: 'time', options: [{ value: 'time', label: 'Recientes' }, { value: 'relevance', label: 'Relevantes' }] },
      { key: 'resultVariable', label: 'Guardar resultado en', type: 'variable' }
    ]
  },
  yt_create_playlist: {
    title: 'Crear Playlist',
    icon: 'fa-list',
    description: 'Crea una playlist',
    fields: [
      { key: 'title', label: 'Título', type: 'textWithVariable', required: true },
      { key: 'description', label: 'Descripción', type: 'textareaWithVariable' },
      { key: 'privacy', label: 'Privacidad', type: 'select', default: 'private', options: [{ value: 'public', label: 'Público' }, { value: 'unlisted', label: 'No listado' }, { value: 'private', label: 'Privado' }] },
      { key: 'resultVariable', label: 'Guardar resultado en', type: 'variable' }
    ]
  },
  yt_get_analytics: {
    title: 'Obtener Analíticas',
    icon: 'fa-chart-line',
    description: 'Obtiene analíticas del canal',
    fields: [
      { key: 'startDate', label: 'Desde', type: 'textWithVariable', required: true, helpText: 'YYYY-MM-DD' },
      { key: 'endDate', label: 'Hasta', type: 'textWithVariable', required: true },
      { key: 'metrics', label: 'Métricas', type: 'tags', helpText: 'views, likes, comments...' },
      { key: 'resultVariable', label: 'Guardar resultado en', type: 'variable' }
    ]
  },
  yt_update_video: {
    title: 'Actualizar Metadata',
    icon: 'fa-edit',
    description: 'Actualiza info de un video',
    fields: [
      { key: 'videoId', label: 'ID del Video', type: 'textWithVariable', required: true },
      { key: 'title', label: 'Título', type: 'textWithVariable' },
      { key: 'description', label: 'Descripción', type: 'textareaWithVariable' },
      { key: 'tags', label: 'Tags', type: 'tags' },
      { key: 'privacy', label: 'Privacidad', type: 'select', options: [{ value: 'public', label: 'Público' }, { value: 'unlisted', label: 'No listado' }, { value: 'private', label: 'Privado' }] },
      { key: 'resultVariable', label: 'Guardar resultado en', type: 'variable' }
    ]
  },

  // ==========================================
  // TIKTOK
  // ==========================================
  tt_connect: {
    title: 'Conectar TikTok',
    icon: 'fa-plug',
    description: 'Configura conexión con TikTok API',
    fields: [
      { key: 'clientKey', label: 'Client Key', type: 'password', required: true },
      { key: 'clientSecret', label: 'Client Secret', type: 'password', required: true },
      { key: 'accessToken', label: 'Access Token', type: 'password' },
      { key: 'connectionVariable', label: 'Guardar conexión en', type: 'variable', required: true }
    ]
  },
  tt_upload_video: {
    title: 'Subir Video',
    icon: 'fa-upload',
    description: 'Sube un video a TikTok',
    fields: [
      { key: 'filePath', label: 'Ruta del archivo', type: 'textWithVariable', required: true },
      { key: 'title', label: 'Título', type: 'textWithVariable', required: true, helpText: 'Máx 150 caracteres' },
      { key: 'privacyLevel', label: 'Privacidad', type: 'select', default: 'PUBLIC_TO_EVERYONE', options: [{ value: 'PUBLIC_TO_EVERYONE', label: 'Público' }, { value: 'MUTUAL_FOLLOW_FRIENDS', label: 'Amigos' }, { value: 'SELF_ONLY', label: 'Solo yo' }] },
      { key: 'disableComment', label: 'Deshabilitar comentarios', type: 'checkbox', default: false },
      { key: 'resultVariable', label: 'Guardar resultado en', type: 'variable' }
    ]
  },
  tt_get_videos: {
    title: 'Obtener Videos',
    icon: 'fa-film',
    description: 'Lista videos propios',
    fields: [
      { key: 'maxCount', label: 'Máximo', type: 'number', default: 20 },
      { key: 'resultVariable', label: 'Guardar resultado en', type: 'variable' }
    ]
  },
  tt_get_user: {
    title: 'Info de Usuario',
    icon: 'fa-user',
    description: 'Obtiene info de un usuario',
    fields: [
      { key: 'openId', label: 'Open ID', type: 'textWithVariable', helpText: 'Vacío = propio' },
      { key: 'resultVariable', label: 'Guardar resultado en', type: 'variable' }
    ]
  },
  tt_get_insights: {
    title: 'Obtener Insights',
    icon: 'fa-chart-bar',
    description: 'Obtiene insights de un video',
    fields: [
      { key: 'videoId', label: 'ID del Video', type: 'textWithVariable', required: true },
      { key: 'resultVariable', label: 'Guardar resultado en', type: 'variable' }
    ]
  },
  tt_search: {
    title: 'Buscar Videos',
    icon: 'fa-search',
    description: 'Busca videos en TikTok',
    fields: [
      { key: 'keyword', label: 'Palabra clave', type: 'textWithVariable', required: true },
      { key: 'count', label: 'Cantidad', type: 'number', default: 20 },
      { key: 'resultVariable', label: 'Guardar resultado en', type: 'variable' }
    ]
  },
  tt_create_ad: {
    title: 'Crear Anuncio',
    icon: 'fa-bullhorn',
    description: 'Crea un anuncio en TikTok Ads',
    fields: [
      { key: 'campaignName', label: 'Nombre campaña', type: 'textWithVariable', required: true },
      { key: 'objective', label: 'Objetivo', type: 'select', default: 'REACH', options: [{ value: 'REACH', label: 'Alcance' }, { value: 'TRAFFIC', label: 'Tráfico' }, { value: 'VIDEO_VIEWS', label: 'Vistas' }, { value: 'CONVERSIONS', label: 'Conversiones' }] },
      { key: 'budget', label: 'Presupuesto', type: 'textWithVariable', required: true },
      { key: 'adGroupName', label: 'Nombre grupo anuncios', type: 'textWithVariable' },
      { key: 'resultVariable', label: 'Guardar resultado en', type: 'variable' }
    ]
  },

  // ==========================================
  // WEB SCRAPING
  // ==========================================
  scraper_connect: {
    title: 'Conectar Servicio Scraping',
    icon: 'fa-plug',
    description: 'Configura servicio de web scraping',
    fields: [
      { key: 'service', label: 'Servicio', type: 'select', default: 'scraperapi', options: [{ value: 'brightdata', label: 'Bright Data' }, { value: 'scraperapi', label: 'ScraperAPI' }, { value: 'apify', label: 'Apify' }, { value: 'custom', label: 'Personalizado' }] },
      { key: 'apiKey', label: 'API Key', type: 'password', required: true },
      { key: 'connectionVariable', label: 'Guardar conexión en', type: 'variable', required: true }
    ]
  },
  scraper_fetch_url: {
    title: 'Scrape URL',
    icon: 'fa-globe',
    description: 'Obtiene contenido de una URL',
    fields: [
      { key: 'url', label: 'URL', type: 'textWithVariable', required: true },
      { key: 'renderJs', label: 'Renderizar JavaScript', type: 'checkbox', default: false },
      { key: 'headers', label: 'Headers (JSON)', type: 'textareaWithVariable' },
      { key: 'country', label: 'País', type: 'textWithVariable', helpText: 'Código ISO: US, MX...' },
      { key: 'resultVariable', label: 'Guardar resultado en', type: 'variable' }
    ]
  },
  scraper_render_js: {
    title: 'Render con JavaScript',
    icon: 'fa-code',
    description: 'Renderiza página con JS completo',
    fields: [
      { key: 'url', label: 'URL', type: 'textWithVariable', required: true },
      { key: 'waitSelector', label: 'Esperar selector', type: 'textWithVariable', helpText: 'CSS selector' },
      { key: 'waitMs', label: 'Esperar (ms)', type: 'number', default: 2000 },
      { key: 'resultVariable', label: 'Guardar resultado en', type: 'variable' }
    ]
  },
  scraper_extract_data: {
    title: 'Extraer Datos',
    icon: 'fa-table',
    description: 'Extrae datos estructurados de URL',
    fields: [
      { key: 'url', label: 'URL', type: 'textWithVariable', required: true },
      { key: 'selectors', label: 'Selectores (JSON)', type: 'textareaWithVariable', required: true, helpText: '[{name, selector, attribute?}]' },
      { key: 'resultVariable', label: 'Guardar resultado en', type: 'variable' }
    ]
  },
  scraper_screenshot: {
    title: 'Screenshot de URL',
    icon: 'fa-camera',
    description: 'Captura screenshot de una página',
    fields: [
      { key: 'url', label: 'URL', type: 'textWithVariable', required: true },
      { key: 'fullPage', label: 'Página completa', type: 'checkbox', default: false },
      { key: 'width', label: 'Ancho', type: 'number', default: 1920 },
      { key: 'height', label: 'Alto', type: 'number', default: 1080 },
      { key: 'format', label: 'Formato', type: 'select', default: 'png', options: [{ value: 'png', label: 'PNG' }, { value: 'jpeg', label: 'JPEG' }, { value: 'webp', label: 'WebP' }] },
      { key: 'resultVariable', label: 'Guardar resultado en', type: 'variable' }
    ]
  },
  scraper_batch: {
    title: 'Scrape en Lote',
    icon: 'fa-layer-group',
    description: 'Scrapea múltiples URLs',
    fields: [
      { key: 'urls', label: 'URLs', type: 'tags', required: true },
      { key: 'renderJs', label: 'Renderizar JS', type: 'checkbox', default: false },
      { key: 'concurrency', label: 'Concurrencia', type: 'number', default: 5 },
      { key: 'resultVariable', label: 'Guardar resultado en', type: 'variable' }
    ]
  },
  scraper_set_proxy: {
    title: 'Configurar Proxy',
    icon: 'fa-shield-alt',
    description: 'Configura tipo de proxy',
    fields: [
      { key: 'proxyType', label: 'Tipo', type: 'select', default: 'datacenter', options: [{ value: 'residential', label: 'Residencial' }, { value: 'datacenter', label: 'Datacenter' }, { value: 'mobile', label: 'Móvil' }] },
      { key: 'country', label: 'País', type: 'textWithVariable' },
      { key: 'city', label: 'Ciudad', type: 'textWithVariable' },
      { key: 'sticky', label: 'IP fija', type: 'checkbox', default: false },
      { key: 'resultVariable', label: 'Guardar resultado en', type: 'variable' }
    ]
  },
  scraper_set_geo: {
    title: 'Geolocalización',
    icon: 'fa-map-marker-alt',
    description: 'Configura geolocalización',
    fields: [
      { key: 'country', label: 'País', type: 'textWithVariable', required: true, helpText: 'Código ISO' },
      { key: 'city', label: 'Ciudad', type: 'textWithVariable' },
      { key: 'resultVariable', label: 'Guardar resultado en', type: 'variable' }
    ]
  },
  scraper_run_actor: {
    title: 'Ejecutar Actor (Apify)',
    icon: 'fa-play',
    description: 'Ejecuta un actor de Apify',
    fields: [
      { key: 'actorId', label: 'ID del Actor', type: 'textWithVariable', required: true },
      { key: 'input', label: 'Input (JSON)', type: 'textareaWithVariable' },
      { key: 'memory', label: 'Memoria (MB)', type: 'number', default: 256 },
      { key: 'timeout', label: 'Timeout (seg)', type: 'number', default: 300 },
      { key: 'resultVariable', label: 'Guardar resultado en', type: 'variable' }
    ]
  },
  scraper_get_dataset: {
    title: 'Obtener Dataset',
    icon: 'fa-database',
    description: 'Descarga dataset de Apify',
    fields: [
      { key: 'datasetId', label: 'ID del Dataset', type: 'textWithVariable', required: true },
      { key: 'format', label: 'Formato', type: 'select', default: 'json', options: [{ value: 'json', label: 'JSON' }, { value: 'csv', label: 'CSV' }, { value: 'xlsx', label: 'Excel' }] },
      { key: 'limit', label: 'Límite', type: 'number', default: 1000 },
      { key: 'resultVariable', label: 'Guardar resultado en', type: 'variable' }
    ]
  },

  // ==========================================
  // DOCUSIGN
  // ==========================================
  docusign_connect: {
    title: 'Conectar DocuSign',
    icon: 'fa-plug',
    description: 'Configura conexión con DocuSign',
    fields: [
      { key: 'integrationKey', label: 'Integration Key', type: 'password', required: true },
      { key: 'secretKey', label: 'Secret Key', type: 'password', required: true },
      { key: 'accountId', label: 'Account ID', type: 'textWithVariable', required: true },
      { key: 'useSandbox', label: 'Usar Sandbox', type: 'checkbox', default: false },
      { key: 'connectionVariable', label: 'Guardar conexión en', type: 'variable', required: true }
    ]
  },
  docusign_send_envelope: {
    title: 'Enviar Sobre',
    icon: 'fa-paper-plane',
    description: 'Envía documento para firma',
    fields: [
      { key: 'templateId', label: 'ID de Plantilla', type: 'textWithVariable' },
      { key: 'recipients', label: 'Destinatarios (JSON)', type: 'textareaWithVariable', required: true, helpText: '[{email, name, role}]' },
      { key: 'subject', label: 'Asunto', type: 'textWithVariable' },
      { key: 'emailBody', label: 'Cuerpo del email', type: 'textareaWithVariable' },
      { key: 'documentPath', label: 'Ruta del PDF', type: 'textWithVariable' },
      { key: 'resultVariable', label: 'Guardar resultado en', type: 'variable' }
    ]
  },
  docusign_get_status: {
    title: 'Estado del Sobre',
    icon: 'fa-info-circle',
    description: 'Obtiene estado de un sobre',
    fields: [
      { key: 'envelopeId', label: 'ID del Sobre', type: 'textWithVariable', required: true },
      { key: 'resultVariable', label: 'Guardar resultado en', type: 'variable' }
    ]
  },
  docusign_download: {
    title: 'Descargar Firmado',
    icon: 'fa-download',
    description: 'Descarga documento firmado',
    fields: [
      { key: 'envelopeId', label: 'ID del Sobre', type: 'textWithVariable', required: true },
      { key: 'documentId', label: 'ID Documento', type: 'textWithVariable', default: 'combined' },
      { key: 'outputPath', label: 'Ruta de destino', type: 'textWithVariable', required: true },
      { key: 'resultVariable', label: 'Guardar resultado en', type: 'variable' }
    ]
  },
  docusign_create_template: {
    title: 'Crear Plantilla',
    icon: 'fa-file-alt',
    description: 'Crea una plantilla de firma',
    fields: [
      { key: 'name', label: 'Nombre', type: 'textWithVariable', required: true },
      { key: 'description', label: 'Descripción', type: 'textWithVariable' },
      { key: 'documentPath', label: 'Ruta del documento', type: 'textWithVariable', required: true },
      { key: 'roles', label: 'Roles (JSON)', type: 'textareaWithVariable', helpText: '[{roleName, routingOrder}]' },
      { key: 'resultVariable', label: 'Guardar resultado en', type: 'variable' }
    ]
  },
  docusign_void: {
    title: 'Anular Sobre',
    icon: 'fa-times-circle',
    description: 'Anula un sobre enviado',
    fields: [
      { key: 'envelopeId', label: 'ID del Sobre', type: 'textWithVariable', required: true },
      { key: 'reason', label: 'Razón', type: 'textWithVariable', required: true },
      { key: 'resultVariable', label: 'Guardar resultado en', type: 'variable' }
    ]
  },
  docusign_remind: {
    title: 'Enviar Recordatorio',
    icon: 'fa-bell',
    description: 'Envía recordatorio de firma',
    fields: [
      { key: 'envelopeId', label: 'ID del Sobre', type: 'textWithVariable', required: true },
      { key: 'resultVariable', label: 'Guardar resultado en', type: 'variable' }
    ]
  },
  docusign_embedded: {
    title: 'Firma Embebida',
    icon: 'fa-window-restore',
    description: 'Genera URL de firma embebida',
    fields: [
      { key: 'envelopeId', label: 'ID del Sobre', type: 'textWithVariable', required: true },
      { key: 'recipientEmail', label: 'Email del firmante', type: 'textWithVariable', required: true },
      { key: 'returnUrl', label: 'URL de retorno', type: 'textWithVariable', required: true },
      { key: 'resultVariable', label: 'Guardar resultado en', type: 'variable' }
    ]
  },

  // ==========================================
  // NOTION
  // ==========================================
  notion_connect: {
    title: 'Conectar Notion',
    icon: 'fa-plug',
    description: 'Configura conexión con Notion',
    fields: [
      { key: 'apiKey', label: 'Integration Token', type: 'password', required: true },
      { key: 'connectionVariable', label: 'Guardar conexión en', type: 'variable', required: true }
    ]
  },
  notion_create_page: {
    title: 'Crear Página',
    icon: 'fa-plus',
    description: 'Crea una página en Notion',
    fields: [
      { key: 'parentId', label: 'ID padre', type: 'textWithVariable', required: true, helpText: 'ID de página o database' },
      { key: 'title', label: 'Título', type: 'textWithVariable', required: true },
      { key: 'content', label: 'Contenido', type: 'textareaWithVariable', helpText: 'Markdown' },
      { key: 'icon', label: 'Icono', type: 'textWithVariable', helpText: 'Emoji' },
      { key: 'properties', label: 'Propiedades (JSON)', type: 'textareaWithVariable' },
      { key: 'resultVariable', label: 'Guardar resultado en', type: 'variable' }
    ]
  },
  notion_update_page: {
    title: 'Actualizar Página',
    icon: 'fa-edit',
    description: 'Actualiza propiedades de una página',
    fields: [
      { key: 'pageId', label: 'ID de Página', type: 'textWithVariable', required: true },
      { key: 'properties', label: 'Propiedades (JSON)', type: 'textareaWithVariable' },
      { key: 'archived', label: 'Archivar', type: 'checkbox', default: false },
      { key: 'resultVariable', label: 'Guardar resultado en', type: 'variable' }
    ]
  },
  notion_query_db: {
    title: 'Query Database',
    icon: 'fa-search',
    description: 'Consulta una database de Notion',
    fields: [
      { key: 'databaseId', label: 'ID de Database', type: 'textWithVariable', required: true },
      { key: 'filter', label: 'Filtro (JSON)', type: 'textareaWithVariable' },
      { key: 'sorts', label: 'Orden (JSON)', type: 'textareaWithVariable', helpText: '[{property, direction}]' },
      { key: 'pageSize', label: 'Tamaño de página', type: 'number', default: 100 },
      { key: 'resultVariable', label: 'Guardar resultado en', type: 'variable' }
    ]
  },
  notion_create_db: {
    title: 'Crear Database',
    icon: 'fa-database',
    description: 'Crea una database en Notion',
    fields: [
      { key: 'parentId', label: 'ID padre', type: 'textWithVariable', required: true },
      { key: 'title', label: 'Título', type: 'textWithVariable', required: true },
      { key: 'properties', label: 'Schema (JSON)', type: 'textareaWithVariable', required: true },
      { key: 'resultVariable', label: 'Guardar resultado en', type: 'variable' }
    ]
  },
  notion_add_block: {
    title: 'Agregar Bloque',
    icon: 'fa-cube',
    description: 'Agrega un bloque a una página',
    fields: [
      { key: 'pageId', label: 'ID de Página', type: 'textWithVariable', required: true },
      { key: 'blockType', label: 'Tipo', type: 'select', default: 'paragraph', options: [{ value: 'paragraph', label: 'Párrafo' }, { value: 'heading_1', label: 'Título 1' }, { value: 'heading_2', label: 'Título 2' }, { value: 'bulleted_list', label: 'Lista' }, { value: 'numbered_list', label: 'Lista numerada' }, { value: 'to_do', label: 'To-do' }, { value: 'code', label: 'Código' }, { value: 'quote', label: 'Cita' }, { value: 'divider', label: 'Divisor' }] },
      { key: 'content', label: 'Contenido', type: 'textareaWithVariable', required: true },
      { key: 'resultVariable', label: 'Guardar resultado en', type: 'variable' }
    ]
  },
  notion_search: {
    title: 'Buscar Páginas',
    icon: 'fa-search',
    description: 'Busca páginas y databases',
    fields: [
      { key: 'query', label: 'Consulta', type: 'textWithVariable' },
      { key: 'filterType', label: 'Tipo', type: 'select', options: [{ value: 'page', label: 'Páginas' }, { value: 'database', label: 'Databases' }] },
      { key: 'resultVariable', label: 'Guardar resultado en', type: 'variable' }
    ]
  },
  notion_get_page: {
    title: 'Obtener Página',
    icon: 'fa-file-alt',
    description: 'Obtiene info de una página',
    fields: [
      { key: 'pageId', label: 'ID de Página', type: 'textWithVariable', required: true },
      { key: 'resultVariable', label: 'Guardar resultado en', type: 'variable' }
    ]
  },
  notion_archive: {
    title: 'Archivar Página',
    icon: 'fa-archive',
    description: 'Archiva una página',
    fields: [
      { key: 'pageId', label: 'ID de Página', type: 'textWithVariable', required: true },
      { key: 'resultVariable', label: 'Guardar resultado en', type: 'variable' }
    ]
  },

  // ==========================================
  // AIRTABLE
  // ==========================================
  airtable_connect: {
    title: 'Conectar Airtable',
    icon: 'fa-plug',
    description: 'Configura conexión con Airtable',
    fields: [
      { key: 'apiKey', label: 'Personal Access Token', type: 'password', required: true },
      { key: 'baseId', label: 'ID de Base', type: 'textWithVariable', required: true, helpText: 'appXXXXXX' },
      { key: 'connectionVariable', label: 'Guardar conexión en', type: 'variable', required: true }
    ]
  },
  airtable_list_records: {
    title: 'Listar Registros',
    icon: 'fa-list',
    description: 'Lista registros de una tabla',
    fields: [
      { key: 'tableId', label: 'ID/Nombre de Tabla', type: 'textWithVariable', required: true },
      { key: 'view', label: 'Vista', type: 'textWithVariable' },
      { key: 'maxRecords', label: 'Máximo', type: 'number', default: 100 },
      { key: 'filterFormula', label: 'Filtro', type: 'textWithVariable', helpText: '{Status}="Active"' },
      { key: 'resultVariable', label: 'Guardar resultado en', type: 'variable' }
    ]
  },
  airtable_create_record: {
    title: 'Crear Registro',
    icon: 'fa-plus',
    description: 'Crea un registro',
    fields: [
      { key: 'tableId', label: 'ID/Nombre de Tabla', type: 'textWithVariable', required: true },
      { key: 'fields', label: 'Campos (JSON)', type: 'textareaWithVariable', required: true, helpText: '{Name: "valor", ...}' },
      { key: 'resultVariable', label: 'Guardar resultado en', type: 'variable' }
    ]
  },
  airtable_update_record: {
    title: 'Actualizar Registro',
    icon: 'fa-edit',
    description: 'Actualiza un registro',
    fields: [
      { key: 'tableId', label: 'ID/Nombre de Tabla', type: 'textWithVariable', required: true },
      { key: 'recordId', label: 'ID Registro', type: 'textWithVariable', required: true },
      { key: 'fields', label: 'Campos (JSON)', type: 'textareaWithVariable', required: true },
      { key: 'resultVariable', label: 'Guardar resultado en', type: 'variable' }
    ]
  },
  airtable_delete_record: {
    title: 'Eliminar Registro',
    icon: 'fa-trash',
    description: 'Elimina un registro',
    fields: [
      { key: 'tableId', label: 'ID/Nombre de Tabla', type: 'textWithVariable', required: true },
      { key: 'recordId', label: 'ID Registro', type: 'textWithVariable', required: true },
      { key: 'resultVariable', label: 'Guardar resultado en', type: 'variable' }
    ]
  },
  airtable_search: {
    title: 'Buscar Registros',
    icon: 'fa-search',
    description: 'Busca registros con fórmula',
    fields: [
      { key: 'tableId', label: 'ID/Nombre de Tabla', type: 'textWithVariable', required: true },
      { key: 'filterFormula', label: 'Fórmula', type: 'textWithVariable', required: true },
      { key: 'maxRecords', label: 'Máximo', type: 'number', default: 100 },
      { key: 'resultVariable', label: 'Guardar resultado en', type: 'variable' }
    ]
  },
  airtable_upload: {
    title: 'Subir Adjunto',
    icon: 'fa-paperclip',
    description: 'Sube un archivo adjunto',
    fields: [
      { key: 'tableId', label: 'ID/Nombre de Tabla', type: 'textWithVariable', required: true },
      { key: 'recordId', label: 'ID Registro', type: 'textWithVariable', required: true },
      { key: 'fieldName', label: 'Nombre del campo', type: 'textWithVariable', required: true },
      { key: 'filePath', label: 'Ruta del archivo', type: 'textWithVariable', required: true },
      { key: 'resultVariable', label: 'Guardar resultado en', type: 'variable' }
    ]
  },
  airtable_batch: {
    title: 'Operación en Lote',
    icon: 'fa-layer-group',
    description: 'Operación batch en registros',
    fields: [
      { key: 'tableId', label: 'ID/Nombre de Tabla', type: 'textWithVariable', required: true },
      { key: 'operation', label: 'Operación', type: 'select', default: 'create', options: [{ value: 'create', label: 'Crear' }, { value: 'update', label: 'Actualizar' }, { value: 'delete', label: 'Eliminar' }] },
      { key: 'records', label: 'Registros (JSON)', type: 'textareaWithVariable', required: true },
      { key: 'resultVariable', label: 'Guardar resultado en', type: 'variable' }
    ]
  },

  // ==========================================
  // FIREBASE
  // ==========================================
  firebase_connect: {
    title: 'Conectar Firebase',
    icon: 'fa-plug',
    description: 'Configura conexión con Firebase',
    fields: [
      { key: 'projectId', label: 'Project ID', type: 'textWithVariable', required: true },
      { key: 'serviceAccountKey', label: 'Service Account (JSON)', type: 'textareaWithVariable', required: true },
      { key: 'connectionVariable', label: 'Guardar conexión en', type: 'variable', required: true }
    ]
  },
  firebase_set_doc: {
    title: 'Crear/Actualizar Doc',
    icon: 'fa-plus',
    description: 'Crea o actualiza documento Firestore',
    fields: [
      { key: 'collection', label: 'Colección', type: 'textWithVariable', required: true },
      { key: 'documentId', label: 'ID Documento', type: 'textWithVariable', helpText: 'Vacío = auto' },
      { key: 'data', label: 'Datos (JSON)', type: 'textareaWithVariable', required: true },
      { key: 'merge', label: 'Merge', type: 'checkbox', default: false },
      { key: 'resultVariable', label: 'Guardar resultado en', type: 'variable' }
    ]
  },
  firebase_get_doc: {
    title: 'Obtener Documento',
    icon: 'fa-file-alt',
    description: 'Obtiene un documento de Firestore',
    fields: [
      { key: 'collection', label: 'Colección', type: 'textWithVariable', required: true },
      { key: 'documentId', label: 'ID Documento', type: 'textWithVariable', required: true },
      { key: 'resultVariable', label: 'Guardar resultado en', type: 'variable' }
    ]
  },
  firebase_query: {
    title: 'Query Firestore',
    icon: 'fa-search',
    description: 'Consulta documentos con filtros',
    fields: [
      { key: 'collection', label: 'Colección', type: 'textWithVariable', required: true },
      { key: 'where', label: 'Filtros (JSON)', type: 'textareaWithVariable', helpText: '[{field, op, value}]' },
      { key: 'orderBy', label: 'Ordenar por', type: 'textWithVariable' },
      { key: 'limit', label: 'Límite', type: 'number', default: 100 },
      { key: 'resultVariable', label: 'Guardar resultado en', type: 'variable' }
    ]
  },
  firebase_delete_doc: {
    title: 'Eliminar Documento',
    icon: 'fa-trash',
    description: 'Elimina un documento de Firestore',
    fields: [
      { key: 'collection', label: 'Colección', type: 'textWithVariable', required: true },
      { key: 'documentId', label: 'ID Documento', type: 'textWithVariable', required: true },
      { key: 'resultVariable', label: 'Guardar resultado en', type: 'variable' }
    ]
  },
  firebase_push_rtdb: {
    title: 'Push Realtime DB',
    icon: 'fa-database',
    description: 'Push a Realtime Database',
    fields: [
      { key: 'path', label: 'Ruta', type: 'textWithVariable', required: true },
      { key: 'data', label: 'Datos (JSON)', type: 'textareaWithVariable', required: true },
      { key: 'resultVariable', label: 'Guardar resultado en', type: 'variable' }
    ]
  },
  firebase_read_rtdb: {
    title: 'Leer Realtime DB',
    icon: 'fa-eye',
    description: 'Lee datos de Realtime Database',
    fields: [
      { key: 'path', label: 'Ruta', type: 'textWithVariable', required: true },
      { key: 'orderByChild', label: 'Ordenar por hijo', type: 'textWithVariable' },
      { key: 'limitToLast', label: 'Últimos N', type: 'number' },
      { key: 'resultVariable', label: 'Guardar resultado en', type: 'variable' }
    ]
  },
  firebase_upload: {
    title: 'Subir a Storage',
    icon: 'fa-upload',
    description: 'Sube archivo a Firebase Storage',
    fields: [
      { key: 'filePath', label: 'Archivo local', type: 'textWithVariable', required: true },
      { key: 'destination', label: 'Ruta destino', type: 'textWithVariable', required: true },
      { key: 'makePublic', label: 'Hacer público', type: 'checkbox', default: false },
      { key: 'resultVariable', label: 'Guardar resultado en', type: 'variable' }
    ]
  },
  firebase_send_push: {
    title: 'Enviar Push (FCM)',
    icon: 'fa-bell',
    description: 'Envía notificación push',
    fields: [
      { key: 'topic', label: 'Tópico', type: 'textWithVariable' },
      { key: 'token', label: 'Token dispositivo', type: 'textWithVariable' },
      { key: 'title', label: 'Título', type: 'textWithVariable', required: true },
      { key: 'body', label: 'Cuerpo', type: 'textWithVariable', required: true },
      { key: 'data', label: 'Datos extra (JSON)', type: 'textareaWithVariable' },
      { key: 'resultVariable', label: 'Guardar resultado en', type: 'variable' }
    ]
  },
  firebase_auth: {
    title: 'Autenticar Usuario',
    icon: 'fa-user-lock',
    description: 'Operaciones de autenticación',
    fields: [
      { key: 'email', label: 'Email', type: 'textWithVariable' },
      { key: 'password', label: 'Contraseña', type: 'password' },
      { key: 'action', label: 'Acción', type: 'select', default: 'signIn', options: [{ value: 'signIn', label: 'Iniciar sesión' }, { value: 'signUp', label: 'Registrar' }, { value: 'resetPassword', label: 'Reset password' }, { value: 'verifyEmail', label: 'Verificar email' }] },
      { key: 'resultVariable', label: 'Guardar resultado en', type: 'variable' }
    ]
  },

  // ==========================================
  // SUPABASE
  // ==========================================
  supabase_connect: {
    title: 'Conectar Supabase',
    icon: 'fa-plug',
    description: 'Configura conexión con Supabase',
    fields: [
      { key: 'projectUrl', label: 'URL del Proyecto', type: 'textWithVariable', required: true, helpText: 'https://xxx.supabase.co' },
      { key: 'anonKey', label: 'Anon Key', type: 'password', required: true },
      { key: 'serviceKey', label: 'Service Role Key', type: 'password', helpText: 'Para operaciones admin' },
      { key: 'connectionVariable', label: 'Guardar conexión en', type: 'variable', required: true }
    ]
  },
  supabase_insert: {
    title: 'Insertar Fila',
    icon: 'fa-plus',
    description: 'Inserta datos en una tabla',
    fields: [
      { key: 'table', label: 'Tabla', type: 'textWithVariable', required: true },
      { key: 'data', label: 'Datos (JSON)', type: 'textareaWithVariable', required: true },
      { key: 'upsert', label: 'Upsert', type: 'checkbox', default: false },
      { key: 'resultVariable', label: 'Guardar resultado en', type: 'variable' }
    ]
  },
  supabase_select: {
    title: 'Consultar Datos',
    icon: 'fa-search',
    description: 'Consulta datos de una tabla',
    fields: [
      { key: 'table', label: 'Tabla', type: 'textWithVariable', required: true },
      { key: 'columns', label: 'Columnas', type: 'textWithVariable', default: '*' },
      { key: 'filter', label: 'Filtro (JSON)', type: 'textareaWithVariable', helpText: '[{column, operator, value}]' },
      { key: 'orderBy', label: 'Ordenar por', type: 'textWithVariable' },
      { key: 'limit', label: 'Límite', type: 'number' },
      { key: 'resultVariable', label: 'Guardar resultado en', type: 'variable' }
    ]
  },
  supabase_update: {
    title: 'Actualizar Fila',
    icon: 'fa-edit',
    description: 'Actualiza datos de una tabla',
    fields: [
      { key: 'table', label: 'Tabla', type: 'textWithVariable', required: true },
      { key: 'data', label: 'Datos (JSON)', type: 'textareaWithVariable', required: true },
      { key: 'matchColumn', label: 'Columna match', type: 'textWithVariable', required: true },
      { key: 'matchValue', label: 'Valor match', type: 'textWithVariable', required: true },
      { key: 'resultVariable', label: 'Guardar resultado en', type: 'variable' }
    ]
  },
  supabase_delete: {
    title: 'Eliminar Fila',
    icon: 'fa-trash',
    description: 'Elimina datos de una tabla',
    fields: [
      { key: 'table', label: 'Tabla', type: 'textWithVariable', required: true },
      { key: 'matchColumn', label: 'Columna match', type: 'textWithVariable', required: true },
      { key: 'matchValue', label: 'Valor match', type: 'textWithVariable', required: true },
      { key: 'resultVariable', label: 'Guardar resultado en', type: 'variable' }
    ]
  },
  supabase_rpc: {
    title: 'Ejecutar Función RPC',
    icon: 'fa-terminal',
    description: 'Ejecuta una función PostgreSQL',
    fields: [
      { key: 'functionName', label: 'Nombre de función', type: 'textWithVariable', required: true },
      { key: 'params', label: 'Parámetros (JSON)', type: 'textareaWithVariable' },
      { key: 'resultVariable', label: 'Guardar resultado en', type: 'variable' }
    ]
  },
  supabase_upload: {
    title: 'Subir a Storage',
    icon: 'fa-upload',
    description: 'Sube archivo a Supabase Storage',
    fields: [
      { key: 'bucket', label: 'Bucket', type: 'textWithVariable', required: true },
      { key: 'filePath', label: 'Archivo local', type: 'textWithVariable', required: true },
      { key: 'destination', label: 'Ruta destino', type: 'textWithVariable', required: true },
      { key: 'upsert', label: 'Sobrescribir', type: 'checkbox', default: false },
      { key: 'resultVariable', label: 'Guardar resultado en', type: 'variable' }
    ]
  },
  supabase_auth: {
    title: 'Autenticar Usuario',
    icon: 'fa-user-lock',
    description: 'Operaciones de autenticación',
    fields: [
      { key: 'email', label: 'Email', type: 'textWithVariable', required: true },
      { key: 'password', label: 'Contraseña', type: 'password', required: true },
      { key: 'action', label: 'Acción', type: 'select', default: 'signIn', options: [{ value: 'signUp', label: 'Registrar' }, { value: 'signIn', label: 'Iniciar sesión' }, { value: 'signOut', label: 'Cerrar sesión' }, { value: 'resetPassword', label: 'Reset password' }] },
      { key: 'resultVariable', label: 'Guardar resultado en', type: 'variable' }
    ]
  },
  supabase_realtime: {
    title: 'Suscribir Realtime',
    icon: 'fa-broadcast-tower',
    description: 'Suscribe a cambios en tiempo real',
    fields: [
      { key: 'table', label: 'Tabla', type: 'textWithVariable', required: true },
      { key: 'event', label: 'Evento', type: 'select', default: '*', options: [{ value: '*', label: 'Todos' }, { value: 'INSERT', label: 'Insert' }, { value: 'UPDATE', label: 'Update' }, { value: 'DELETE', label: 'Delete' }] },
      { key: 'filter', label: 'Filtro', type: 'textWithVariable' },
      { key: 'resultVariable', label: 'Guardar resultado en', type: 'variable' }
    ]
  },

  // ==========================================
  // MONGODB ATLAS
  // ==========================================
  mongo_connect: {
    title: 'Conectar MongoDB',
    icon: 'fa-plug',
    description: 'Configura conexión con MongoDB Atlas',
    fields: [
      { key: 'connectionString', label: 'Connection String', type: 'password', required: true, helpText: 'mongodb+srv://user:pass@cluster' },
      { key: 'database', label: 'Base de datos', type: 'textWithVariable', required: true },
      { key: 'connectionVariable', label: 'Guardar conexión en', type: 'variable', required: true }
    ]
  },
  mongo_find: {
    title: 'Buscar Documentos',
    icon: 'fa-search',
    description: 'Busca documentos con filtros',
    fields: [
      { key: 'collection', label: 'Colección', type: 'textWithVariable', required: true },
      { key: 'filter', label: 'Filtro (JSON)', type: 'textareaWithVariable', helpText: 'Filtro MongoDB' },
      { key: 'projection', label: 'Proyección (JSON)', type: 'textareaWithVariable' },
      { key: 'sort', label: 'Orden (JSON)', type: 'textareaWithVariable' },
      { key: 'limit', label: 'Límite', type: 'number', default: 100 },
      { key: 'resultVariable', label: 'Guardar resultado en', type: 'variable' }
    ]
  },
  mongo_insert: {
    title: 'Insertar Documento',
    icon: 'fa-plus',
    description: 'Inserta uno o más documentos',
    fields: [
      { key: 'collection', label: 'Colección', type: 'textWithVariable', required: true },
      { key: 'document', label: 'Documento (JSON)', type: 'textareaWithVariable', required: true },
      { key: 'many', label: 'Insertar muchos', type: 'checkbox', default: false },
      { key: 'resultVariable', label: 'Guardar resultado en', type: 'variable' }
    ]
  },
  mongo_update: {
    title: 'Actualizar Documento',
    icon: 'fa-edit',
    description: 'Actualiza documentos',
    fields: [
      { key: 'collection', label: 'Colección', type: 'textWithVariable', required: true },
      { key: 'filter', label: 'Filtro (JSON)', type: 'textareaWithVariable', required: true },
      { key: 'update', label: 'Update (JSON)', type: 'textareaWithVariable', required: true, helpText: '{$set: {field: value}}' },
      { key: 'many', label: 'Actualizar muchos', type: 'checkbox', default: false },
      { key: 'upsert', label: 'Upsert', type: 'checkbox', default: false },
      { key: 'resultVariable', label: 'Guardar resultado en', type: 'variable' }
    ]
  },
  mongo_delete: {
    title: 'Eliminar Documento',
    icon: 'fa-trash',
    description: 'Elimina documentos',
    fields: [
      { key: 'collection', label: 'Colección', type: 'textWithVariable', required: true },
      { key: 'filter', label: 'Filtro (JSON)', type: 'textareaWithVariable', required: true },
      { key: 'many', label: 'Eliminar muchos', type: 'checkbox', default: false },
      { key: 'resultVariable', label: 'Guardar resultado en', type: 'variable' }
    ]
  },
  mongo_aggregate: {
    title: 'Aggregate Pipeline',
    icon: 'fa-layer-group',
    description: 'Ejecuta un pipeline de agregación',
    fields: [
      { key: 'collection', label: 'Colección', type: 'textWithVariable', required: true },
      { key: 'pipeline', label: 'Pipeline (JSON)', type: 'textareaWithVariable', required: true },
      { key: 'resultVariable', label: 'Guardar resultado en', type: 'variable' }
    ]
  },
  mongo_count: {
    title: 'Contar Documentos',
    icon: 'fa-hashtag',
    description: 'Cuenta documentos',
    fields: [
      { key: 'collection', label: 'Colección', type: 'textWithVariable', required: true },
      { key: 'filter', label: 'Filtro (JSON)', type: 'textareaWithVariable' },
      { key: 'resultVariable', label: 'Guardar resultado en', type: 'variable' }
    ]
  },
  mongo_create_index: {
    title: 'Crear Índice',
    icon: 'fa-sort-amount-up',
    description: 'Crea un índice en la colección',
    fields: [
      { key: 'collection', label: 'Colección', type: 'textWithVariable', required: true },
      { key: 'keys', label: 'Keys (JSON)', type: 'textareaWithVariable', required: true, helpText: '{field: 1}' },
      { key: 'unique', label: 'Único', type: 'checkbox', default: false },
      { key: 'resultVariable', label: 'Guardar resultado en', type: 'variable' }
    ]
  },

  // ==========================================
  // DEEPL
  // ==========================================
  deepl_connect: {
    title: 'Conectar DeepL',
    icon: 'fa-plug',
    description: 'Configura conexión con DeepL',
    fields: [
      { key: 'apiKey', label: 'API Key', type: 'password', required: true },
      { key: 'useFreeApi', label: 'Usar API gratuita', type: 'checkbox', default: false },
      { key: 'connectionVariable', label: 'Guardar conexión en', type: 'variable', required: true }
    ]
  },
  deepl_translate: {
    title: 'Traducir Texto',
    icon: 'fa-language',
    description: 'Traduce texto con DeepL',
    fields: [
      { key: 'text', label: 'Texto', type: 'textareaWithVariable', required: true },
      { key: 'targetLang', label: 'Idioma destino', type: 'select', default: 'ES', options: [{ value: 'ES', label: 'Español' }, { value: 'EN', label: 'Inglés' }, { value: 'DE', label: 'Alemán' }, { value: 'FR', label: 'Francés' }, { value: 'PT', label: 'Portugués' }, { value: 'IT', label: 'Italiano' }, { value: 'ZH', label: 'Chino' }, { value: 'JA', label: 'Japonés' }, { value: 'KO', label: 'Coreano' }, { value: 'RU', label: 'Ruso' }] },
      { key: 'sourceLang', label: 'Idioma origen', type: 'select', default: 'auto', options: [{ value: 'auto', label: 'Auto-detectar' }, { value: 'ES', label: 'Español' }, { value: 'EN', label: 'Inglés' }, { value: 'DE', label: 'Alemán' }, { value: 'FR', label: 'Francés' }, { value: 'PT', label: 'Portugués' }] },
      { key: 'formality', label: 'Formalidad', type: 'select', default: 'default', options: [{ value: 'default', label: 'Default' }, { value: 'more', label: 'Más formal' }, { value: 'less', label: 'Menos formal' }] },
      { key: 'resultVariable', label: 'Guardar resultado en', type: 'variable' }
    ]
  },
  deepl_translate_doc: {
    title: 'Traducir Documento',
    icon: 'fa-file-alt',
    description: 'Traduce un documento completo',
    fields: [
      { key: 'filePath', label: 'Ruta del documento', type: 'textWithVariable', required: true },
      { key: 'targetLang', label: 'Idioma destino', type: 'select', default: 'ES', options: [{ value: 'ES', label: 'Español' }, { value: 'EN', label: 'Inglés' }, { value: 'DE', label: 'Alemán' }, { value: 'FR', label: 'Francés' }, { value: 'PT', label: 'Portugués' }] },
      { key: 'outputPath', label: 'Ruta de salida', type: 'textWithVariable', required: true },
      { key: 'resultVariable', label: 'Guardar resultado en', type: 'variable' }
    ]
  },
  deepl_detect_lang: {
    title: 'Detectar Idioma',
    icon: 'fa-search',
    description: 'Detecta el idioma de un texto',
    fields: [
      { key: 'text', label: 'Texto', type: 'textareaWithVariable', required: true },
      { key: 'resultVariable', label: 'Guardar resultado en', type: 'variable' }
    ]
  },
  deepl_glossary: {
    title: 'Gestionar Glosario',
    icon: 'fa-book',
    description: 'Crea, lista o elimina glosarios',
    fields: [
      { key: 'action', label: 'Acción', type: 'select', default: 'list', options: [{ value: 'create', label: 'Crear' }, { value: 'list', label: 'Listar' }, { value: 'delete', label: 'Eliminar' }] },
      { key: 'name', label: 'Nombre', type: 'textWithVariable', condition: { field: 'action', value: 'create' } },
      { key: 'entries', label: 'Entradas', type: 'textareaWithVariable', helpText: 'Pares fuente->destino', condition: { field: 'action', value: 'create' } },
      { key: 'glossaryId', label: 'ID Glosario', type: 'textWithVariable', condition: { field: 'action', value: 'delete' } },
      { key: 'resultVariable', label: 'Guardar resultado en', type: 'variable' }
    ]
  },
  deepl_usage: {
    title: 'Consultar Uso',
    icon: 'fa-chart-bar',
    description: 'Consulta uso de la API',
    fields: [
      { key: 'resultVariable', label: 'Guardar resultado en', type: 'variable' }
    ]
  },

  // ==========================================
  // GOOGLE ANALYTICS
  // ==========================================
  ga_connect: {
    title: 'Conectar Google Analytics',
    icon: 'fa-plug',
    description: 'Configura conexión con GA4',
    fields: [
      { key: 'serviceAccountKey', label: 'Service Account (JSON)', type: 'textareaWithVariable', required: true },
      { key: 'propertyId', label: 'ID de Propiedad', type: 'textWithVariable', required: true },
      { key: 'connectionVariable', label: 'Guardar conexión en', type: 'variable', required: true }
    ]
  },
  ga_run_report: {
    title: 'Ejecutar Reporte',
    icon: 'fa-file-alt',
    description: 'Ejecuta un reporte personalizado',
    fields: [
      { key: 'dimensions', label: 'Dimensiones', type: 'tags', helpText: 'date, city, pagePath...' },
      { key: 'metrics', label: 'Métricas', type: 'tags', required: true, helpText: 'sessions, activeUsers...' },
      { key: 'startDate', label: 'Desde', type: 'textWithVariable', required: true, helpText: 'YYYY-MM-DD o 7daysAgo' },
      { key: 'endDate', label: 'Hasta', type: 'textWithVariable', required: true },
      { key: 'limit', label: 'Límite', type: 'number', default: 1000 },
      { key: 'resultVariable', label: 'Guardar resultado en', type: 'variable' }
    ]
  },
  ga_realtime: {
    title: 'Datos en Tiempo Real',
    icon: 'fa-broadcast-tower',
    description: 'Obtiene datos en tiempo real',
    fields: [
      { key: 'dimensions', label: 'Dimensiones', type: 'tags', helpText: 'city, unifiedScreenName' },
      { key: 'metrics', label: 'Métricas', type: 'tags', required: true, helpText: 'activeUsers' },
      { key: 'resultVariable', label: 'Guardar resultado en', type: 'variable' }
    ]
  },
  ga_get_metrics: {
    title: 'Obtener Métricas',
    icon: 'fa-chart-bar',
    description: 'Obtiene métricas específicas',
    fields: [
      { key: 'metrics', label: 'Métricas', type: 'tags', required: true },
      { key: 'startDate', label: 'Desde', type: 'textWithVariable', default: '30daysAgo' },
      { key: 'endDate', label: 'Hasta', type: 'textWithVariable', default: 'today' },
      { key: 'resultVariable', label: 'Guardar resultado en', type: 'variable' }
    ]
  },
  ga_get_conversions: {
    title: 'Obtener Conversiones',
    icon: 'fa-bullseye',
    description: 'Obtiene datos de conversiones',
    fields: [
      { key: 'startDate', label: 'Desde', type: 'textWithVariable', default: '30daysAgo' },
      { key: 'endDate', label: 'Hasta', type: 'textWithVariable', default: 'today' },
      { key: 'eventName', label: 'Nombre del evento', type: 'textWithVariable' },
      { key: 'resultVariable', label: 'Guardar resultado en', type: 'variable' }
    ]
  },
  ga_get_audiences: {
    title: 'Obtener Audiencias',
    icon: 'fa-users',
    description: 'Lista audiencias configuradas',
    fields: [
      { key: 'resultVariable', label: 'Guardar resultado en', type: 'variable' }
    ]
  },

  // ==========================================
  // SENDGRID
  // ==========================================
  sg_connect: {
    title: 'Conectar SendGrid',
    icon: 'fa-plug',
    description: 'Configura conexión con SendGrid',
    fields: [
      { key: 'apiKey', label: 'API Key', type: 'password', required: true },
      { key: 'connectionVariable', label: 'Guardar conexión en', type: 'variable', required: true }
    ]
  },
  sg_send_email: {
    title: 'Enviar Email',
    icon: 'fa-envelope',
    description: 'Envía un email',
    fields: [
      { key: 'to', label: 'Para', type: 'textWithVariable', required: true },
      { key: 'from', label: 'Desde', type: 'textWithVariable', required: true },
      { key: 'subject', label: 'Asunto', type: 'textWithVariable', required: true },
      { key: 'htmlContent', label: 'Contenido HTML', type: 'textareaWithVariable' },
      { key: 'textContent', label: 'Contenido texto', type: 'textareaWithVariable' },
      { key: 'attachments', label: 'Adjuntos', type: 'tags', helpText: 'Rutas de archivos' },
      { key: 'resultVariable', label: 'Guardar resultado en', type: 'variable' }
    ]
  },
  sg_send_template: {
    title: 'Enviar con Plantilla',
    icon: 'fa-file-alt',
    description: 'Envía email con plantilla dinámica',
    fields: [
      { key: 'to', label: 'Para', type: 'textWithVariable', required: true },
      { key: 'from', label: 'Desde', type: 'textWithVariable', required: true },
      { key: 'templateId', label: 'ID de Plantilla', type: 'textWithVariable', required: true },
      { key: 'dynamicData', label: 'Datos dinámicos (JSON)', type: 'textareaWithVariable' },
      { key: 'resultVariable', label: 'Guardar resultado en', type: 'variable' }
    ]
  },
  sg_add_contact: {
    title: 'Agregar Contacto',
    icon: 'fa-user-plus',
    description: 'Agrega contacto a una lista',
    fields: [
      { key: 'email', label: 'Email', type: 'textWithVariable', required: true },
      { key: 'firstName', label: 'Nombre', type: 'textWithVariable' },
      { key: 'lastName', label: 'Apellido', type: 'textWithVariable' },
      { key: 'listIds', label: 'IDs de listas', type: 'tags' },
      { key: 'resultVariable', label: 'Guardar resultado en', type: 'variable' }
    ]
  },
  sg_create_list: {
    title: 'Crear Lista',
    icon: 'fa-list',
    description: 'Crea una lista de contactos',
    fields: [
      { key: 'name', label: 'Nombre', type: 'textWithVariable', required: true },
      { key: 'resultVariable', label: 'Guardar resultado en', type: 'variable' }
    ]
  },
  sg_get_stats: {
    title: 'Obtener Estadísticas',
    icon: 'fa-chart-bar',
    description: 'Obtiene estadísticas de envío',
    fields: [
      { key: 'startDate', label: 'Desde', type: 'textWithVariable', required: true },
      { key: 'endDate', label: 'Hasta', type: 'textWithVariable' },
      { key: 'aggregatedBy', label: 'Agrupar por', type: 'select', default: 'day', options: [{ value: 'day', label: 'Día' }, { value: 'week', label: 'Semana' }, { value: 'month', label: 'Mes' }] },
      { key: 'resultVariable', label: 'Guardar resultado en', type: 'variable' }
    ]
  },
  sg_validate_email: {
    title: 'Validar Email',
    icon: 'fa-check',
    description: 'Valida una dirección de email',
    fields: [
      { key: 'email', label: 'Email', type: 'textWithVariable', required: true },
      { key: 'resultVariable', label: 'Guardar resultado en', type: 'variable' }
    ]
  },

  // ==========================================
  // MAILCHIMP
  // ==========================================
  mc_connect: {
    title: 'Conectar Mailchimp',
    icon: 'fa-plug',
    description: 'Configura conexión con Mailchimp',
    fields: [
      { key: 'apiKey', label: 'API Key', type: 'password', required: true },
      { key: 'serverPrefix', label: 'Server Prefix', type: 'textWithVariable', required: true, helpText: 'Ej: us1, us2' },
      { key: 'connectionVariable', label: 'Guardar conexión en', type: 'variable', required: true }
    ]
  },
  mc_add_subscriber: {
    title: 'Agregar Suscriptor',
    icon: 'fa-user-plus',
    description: 'Agrega un suscriptor a una lista',
    fields: [
      { key: 'listId', label: 'ID de Lista', type: 'textWithVariable', required: true },
      { key: 'email', label: 'Email', type: 'textWithVariable', required: true },
      { key: 'firstName', label: 'Nombre', type: 'textWithVariable' },
      { key: 'lastName', label: 'Apellido', type: 'textWithVariable' },
      { key: 'status', label: 'Estado', type: 'select', default: 'subscribed', options: [{ value: 'subscribed', label: 'Suscrito' }, { value: 'unsubscribed', label: 'Desuscrito' }, { value: 'pending', label: 'Pendiente' }] },
      { key: 'tags', label: 'Tags', type: 'tags' },
      { key: 'resultVariable', label: 'Guardar resultado en', type: 'variable' }
    ]
  },
  mc_remove_subscriber: {
    title: 'Remover Suscriptor',
    icon: 'fa-user-minus',
    description: 'Remueve un suscriptor',
    fields: [
      { key: 'listId', label: 'ID de Lista', type: 'textWithVariable', required: true },
      { key: 'email', label: 'Email', type: 'textWithVariable', required: true },
      { key: 'resultVariable', label: 'Guardar resultado en', type: 'variable' }
    ]
  },
  mc_create_campaign: {
    title: 'Crear Campaña',
    icon: 'fa-bullhorn',
    description: 'Crea una campaña de email',
    fields: [
      { key: 'listId', label: 'ID de Lista', type: 'textWithVariable', required: true },
      { key: 'subject', label: 'Asunto', type: 'textWithVariable', required: true },
      { key: 'fromName', label: 'Nombre remitente', type: 'textWithVariable', required: true },
      { key: 'replyTo', label: 'Reply-to', type: 'textWithVariable', required: true },
      { key: 'htmlContent', label: 'Contenido HTML', type: 'textareaWithVariable' },
      { key: 'templateId', label: 'ID de Plantilla', type: 'textWithVariable' },
      { key: 'resultVariable', label: 'Guardar resultado en', type: 'variable' }
    ]
  },
  mc_send_campaign: {
    title: 'Enviar Campaña',
    icon: 'fa-paper-plane',
    description: 'Envía una campaña creada',
    fields: [
      { key: 'campaignId', label: 'ID de Campaña', type: 'textWithVariable', required: true },
      { key: 'resultVariable', label: 'Guardar resultado en', type: 'variable' }
    ]
  },
  mc_get_stats: {
    title: 'Estadísticas Campaña',
    icon: 'fa-chart-bar',
    description: 'Obtiene estadísticas de campaña',
    fields: [
      { key: 'campaignId', label: 'ID de Campaña', type: 'textWithVariable', required: true },
      { key: 'resultVariable', label: 'Guardar resultado en', type: 'variable' }
    ]
  },
  mc_create_template: {
    title: 'Crear Plantilla',
    icon: 'fa-file-alt',
    description: 'Crea una plantilla de email',
    fields: [
      { key: 'name', label: 'Nombre', type: 'textWithVariable', required: true },
      { key: 'html', label: 'HTML', type: 'textareaWithVariable', required: true },
      { key: 'resultVariable', label: 'Guardar resultado en', type: 'variable' }
    ]
  },
  mc_add_tag: {
    title: 'Agregar Tag',
    icon: 'fa-tag',
    description: 'Agrega tags a un suscriptor',
    fields: [
      { key: 'listId', label: 'ID de Lista', type: 'textWithVariable', required: true },
      { key: 'email', label: 'Email', type: 'textWithVariable', required: true },
      { key: 'tags', label: 'Tags', type: 'tags', required: true },
      { key: 'resultVariable', label: 'Guardar resultado en', type: 'variable' }
    ]
  },
  mc_segment: {
    title: 'Segmentar Audiencia',
    icon: 'fa-filter',
    description: 'Crea un segmento de audiencia',
    fields: [
      { key: 'listId', label: 'ID de Lista', type: 'textWithVariable', required: true },
      { key: 'name', label: 'Nombre', type: 'textWithVariable', required: true },
      { key: 'conditions', label: 'Condiciones (JSON)', type: 'textareaWithVariable', required: true, helpText: '[{field, op, value}]' },
      { key: 'resultVariable', label: 'Guardar resultado en', type: 'variable' }
    ]
  },

  // ==========================================
  // CALENDLY
  // ==========================================
  calendly_connect: {
    title: 'Conectar Calendly',
    icon: 'fa-plug',
    description: 'Configura conexión con Calendly',
    fields: [
      { key: 'apiKey', label: 'Personal Access Token', type: 'password', required: true },
      { key: 'connectionVariable', label: 'Guardar conexión en', type: 'variable', required: true }
    ]
  },
  calendly_get_events: {
    title: 'Obtener Eventos',
    icon: 'fa-list',
    description: 'Lista eventos programados',
    fields: [
      { key: 'minStartTime', label: 'Desde', type: 'textWithVariable', helpText: 'ISO 8601' },
      { key: 'maxStartTime', label: 'Hasta', type: 'textWithVariable' },
      { key: 'status', label: 'Estado', type: 'select', default: 'active', options: [{ value: 'active', label: 'Activos' }, { value: 'canceled', label: 'Cancelados' }] },
      { key: 'count', label: 'Cantidad', type: 'number', default: 20 },
      { key: 'resultVariable', label: 'Guardar resultado en', type: 'variable' }
    ]
  },
  calendly_get_invitee: {
    title: 'Info del Invitado',
    icon: 'fa-user',
    description: 'Obtiene info de un invitado',
    fields: [
      { key: 'eventUuid', label: 'UUID del Evento', type: 'textWithVariable', required: true },
      { key: 'inviteeUuid', label: 'UUID del Invitado', type: 'textWithVariable', required: true },
      { key: 'resultVariable', label: 'Guardar resultado en', type: 'variable' }
    ]
  },
  calendly_cancel_event: {
    title: 'Cancelar Evento',
    icon: 'fa-times',
    description: 'Cancela un evento programado',
    fields: [
      { key: 'eventUuid', label: 'UUID del Evento', type: 'textWithVariable', required: true },
      { key: 'reason', label: 'Razón', type: 'textWithVariable' },
      { key: 'resultVariable', label: 'Guardar resultado en', type: 'variable' }
    ]
  },
  calendly_get_availability: {
    title: 'Disponibilidad',
    icon: 'fa-clock',
    description: 'Obtiene disponibilidad',
    fields: [
      { key: 'userUri', label: 'URI del usuario', type: 'textWithVariable' },
      { key: 'resultVariable', label: 'Guardar resultado en', type: 'variable' }
    ]
  },
  calendly_create_webhook: {
    title: 'Crear Webhook',
    icon: 'fa-link',
    description: 'Crea un webhook de Calendly',
    fields: [
      { key: 'url', label: 'URL', type: 'textWithVariable', required: true },
      { key: 'events', label: 'Eventos', type: 'tags', required: true, helpText: 'invitee.created, invitee.canceled' },
      { key: 'scope', label: 'Alcance', type: 'select', default: 'user', options: [{ value: 'user', label: 'Usuario' }, { value: 'organization', label: 'Organización' }] },
      { key: 'resultVariable', label: 'Guardar resultado en', type: 'variable' }
    ]
  },

  // ==========================================
  // ONESIGNAL
  // ==========================================
  onesignal_connect: {
    title: 'Conectar OneSignal',
    icon: 'fa-plug',
    description: 'Configura conexión con OneSignal',
    fields: [
      { key: 'appId', label: 'App ID', type: 'textWithVariable', required: true },
      { key: 'restApiKey', label: 'REST API Key', type: 'password', required: true },
      { key: 'connectionVariable', label: 'Guardar conexión en', type: 'variable', required: true }
    ]
  },
  onesignal_send_push: {
    title: 'Enviar Push',
    icon: 'fa-bell',
    description: 'Envía notificación push',
    fields: [
      { key: 'heading', label: 'Título', type: 'textWithVariable', required: true },
      { key: 'content', label: 'Contenido', type: 'textareaWithVariable', required: true },
      { key: 'segments', label: 'Segmentos', type: 'tags', helpText: 'All, Active Users...' },
      { key: 'playerIds', label: 'Player IDs', type: 'tags' },
      { key: 'url', label: 'URL al hacer click', type: 'textWithVariable' },
      { key: 'data', label: 'Datos extra (JSON)', type: 'textareaWithVariable' },
      { key: 'resultVariable', label: 'Guardar resultado en', type: 'variable' }
    ]
  },
  onesignal_send_email: {
    title: 'Enviar Email',
    icon: 'fa-envelope',
    description: 'Envía email via OneSignal',
    fields: [
      { key: 'subject', label: 'Asunto', type: 'textWithVariable', required: true },
      { key: 'body', label: 'Cuerpo HTML', type: 'textareaWithVariable', required: true },
      { key: 'segments', label: 'Segmentos', type: 'tags' },
      { key: 'emailAddresses', label: 'Emails directos', type: 'tags' },
      { key: 'resultVariable', label: 'Guardar resultado en', type: 'variable' }
    ]
  },
  onesignal_send_sms: {
    title: 'Enviar SMS',
    icon: 'fa-sms',
    description: 'Envía SMS via OneSignal',
    fields: [
      { key: 'content', label: 'Contenido', type: 'textareaWithVariable', required: true },
      { key: 'phoneNumbers', label: 'Números', type: 'tags', required: true, helpText: 'Con código de país' },
      { key: 'resultVariable', label: 'Guardar resultado en', type: 'variable' }
    ]
  },
  onesignal_create_segment: {
    title: 'Crear Segmento',
    icon: 'fa-filter',
    description: 'Crea un segmento de usuarios',
    fields: [
      { key: 'name', label: 'Nombre', type: 'textWithVariable', required: true },
      { key: 'filters', label: 'Filtros (JSON)', type: 'textareaWithVariable', required: true, helpText: '[{field, relation, value}]' },
      { key: 'resultVariable', label: 'Guardar resultado en', type: 'variable' }
    ]
  },
  onesignal_schedule: {
    title: 'Programar Notificación',
    icon: 'fa-clock',
    description: 'Programa una notificación',
    fields: [
      { key: 'heading', label: 'Título', type: 'textWithVariable', required: true },
      { key: 'content', label: 'Contenido', type: 'textareaWithVariable', required: true },
      { key: 'sendAfter', label: 'Enviar después de', type: 'textWithVariable', required: true, helpText: 'ISO 8601' },
      { key: 'segments', label: 'Segmentos', type: 'tags' },
      { key: 'resultVariable', label: 'Guardar resultado en', type: 'variable' }
    ]
  },
  onesignal_get_stats: {
    title: 'Obtener Estadísticas',
    icon: 'fa-chart-bar',
    description: 'Estadísticas de una notificación',
    fields: [
      { key: 'notificationId', label: 'ID Notificación', type: 'textWithVariable', required: true },
      { key: 'resultVariable', label: 'Guardar resultado en', type: 'variable' }
    ]
  }

})

// ==========================================
// AGENTES RPA, SLACK, TELEGRAM, WHATSAPP, DATATABLES, POWERPOINT
// ==========================================
Object.assign(BASE_ACTION_PROPERTIES, {
  // --- AGENTES RPA ---
  agent_start: {
    title: 'Iniciar Agente',
    icon: 'fa-play-circle',
    description: 'Inicia un agente RPA autónomo',
    fields: [
      { key: 'agentName', label: 'Nombre del agente', type: 'text', required: true },
      { key: 'agentType', label: 'Tipo', type: 'select', default: 'task', options: [
        { value: 'task', label: 'Tarea específica' }, { value: 'monitor', label: 'Monitor/Observador' }, { value: 'scheduled', label: 'Programado' }
      ]},
      { key: 'timeout', label: 'Timeout (seg)', type: 'number', default: 300 },
      { key: 'variable', label: 'Guardar ID en', type: 'variable' }
    ]
  },
  agent_stop: {
    title: 'Detener Agente',
    icon: 'fa-stop-circle',
    description: 'Detiene un agente en ejecución',
    fields: [
      { key: 'agentId', label: 'ID del agente', type: 'textWithVariable', required: true }
    ]
  },
  agent_status: {
    title: 'Estado del Agente',
    icon: 'fa-info-circle',
    description: 'Consulta el estado de un agente',
    fields: [
      { key: 'agentId', label: 'ID del agente', type: 'textWithVariable', required: true },
      { key: 'variable', label: 'Guardar estado en', type: 'variable', required: true }
    ]
  },
  agent_config: {
    title: 'Configurar Agente',
    icon: 'fa-cogs',
    description: 'Configura parámetros de un agente',
    fields: [
      { key: 'agentId', label: 'ID del agente', type: 'textWithVariable', required: true },
      { key: 'config', label: 'Configuración', type: 'keyValue', helpText: 'Pares clave-valor de configuración' }
    ]
  },
  agent_execute: {
    title: 'Ejecutar Agente',
    icon: 'fa-bolt',
    description: 'Ejecuta una acción específica del agente',
    fields: [
      { key: 'agentId', label: 'ID del agente', type: 'textWithVariable', required: true },
      { key: 'action', label: 'Acción', type: 'text', required: true },
      { key: 'params', label: 'Parámetros', type: 'keyValue' },
      { key: 'variable', label: 'Guardar resultado en', type: 'variable' }
    ]
  },
  agent_rest_request: {
    title: 'Agente: REST Request',
    icon: 'fa-exchange-alt',
    description: 'Realiza una petición REST a través del agente',
    fields: [
      { key: 'method', label: 'Método', type: 'select', default: 'GET', options: [
        { value: 'GET', label: 'GET' }, { value: 'POST', label: 'POST' }, { value: 'PUT', label: 'PUT' }, { value: 'DELETE', label: 'DELETE' }, { value: 'PATCH', label: 'PATCH' }
      ]},
      { key: 'url', label: 'URL', type: 'url', required: true },
      { key: 'headers', label: 'Headers', type: 'keyValue' },
      { key: 'body', label: 'Body', type: 'code', language: 'json' },
      { key: 'variable', label: 'Guardar respuesta en', type: 'variable' }
    ]
  },
  agent_rest_batch: {
    title: 'Agente: REST Batch',
    icon: 'fa-layer-group',
    description: 'Ejecuta múltiples peticiones REST en lote',
    fields: [
      { key: 'requests', label: 'Peticiones (JSON array)', type: 'code', language: 'json', required: true },
      { key: 'parallel', label: 'Ejecutar en paralelo', type: 'checkbox', default: false },
      { key: 'variable', label: 'Guardar resultados en', type: 'variable' }
    ]
  },
  agent_mysql_query: {
    title: 'Agente: Query MySQL',
    icon: 'fa-database',
    description: 'Ejecuta una consulta MySQL a través del agente',
    fields: [
      { key: 'query', label: 'Consulta SQL', type: 'code', language: 'sql', required: true },
      { key: 'params', label: 'Parámetros', type: 'tags', placeholder: 'Valores para ? en la consulta' },
      { key: 'variable', label: 'Guardar resultado en', type: 'variable' }
    ]
  },
  agent_mysql_schema: {
    title: 'Agente: Schema MySQL',
    icon: 'fa-sitemap',
    description: 'Obtiene estructura de la base de datos',
    fields: [
      { key: 'database', label: 'Base de datos', type: 'text' },
      { key: 'table', label: 'Tabla específica', type: 'text', helpText: 'Dejar vacío para todas' },
      { key: 'variable', label: 'Guardar schema en', type: 'variable' }
    ]
  },
  agent_workflow_execute: {
    title: 'Agente: Ejecutar Workflow',
    icon: 'fa-project-diagram',
    description: 'Ejecuta otro workflow como sub-proceso',
    fields: [
      { key: 'workflowId', label: 'ID del workflow', type: 'textWithVariable', required: true },
      { key: 'inputVariables', label: 'Variables de entrada', type: 'keyValue' },
      { key: 'waitForCompletion', label: 'Esperar finalización', type: 'checkbox', default: true },
      { key: 'variable', label: 'Guardar resultado en', type: 'variable' }
    ]
  },
  agent_orchestrator_workflow: {
    title: 'Agente: Orquestador',
    icon: 'fa-network-wired',
    description: 'Orquesta múltiples workflows en secuencia o paralelo',
    fields: [
      { key: 'workflows', label: 'Workflows (IDs)', type: 'tags', required: true },
      { key: 'mode', label: 'Modo', type: 'select', default: 'sequential', options: [
        { value: 'sequential', label: 'Secuencial' }, { value: 'parallel', label: 'Paralelo' }
      ]},
      { key: 'variable', label: 'Guardar resultados en', type: 'variable' }
    ]
  },
  agent_whatsapp_send: {
    title: 'Agente: Enviar WhatsApp',
    icon: 'fa-comment',
    description: 'Envía un mensaje de WhatsApp vía agente',
    fields: [
      { key: 'phone', label: 'Teléfono', type: 'textWithVariable', required: true, placeholder: '+5491112345678' },
      { key: 'message', label: 'Mensaje', type: 'textarea', required: true, rows: 3 },
      { key: 'variable', label: 'Guardar resultado en', type: 'variable' }
    ]
  },
  agent_whatsapp_template: {
    title: 'Agente: Template WhatsApp',
    icon: 'fa-file-alt',
    description: 'Envía un mensaje de plantilla de WhatsApp',
    fields: [
      { key: 'phone', label: 'Teléfono', type: 'textWithVariable', required: true },
      { key: 'templateName', label: 'Nombre de plantilla', type: 'text', required: true },
      { key: 'templateParams', label: 'Parámetros', type: 'keyValue' },
      { key: 'variable', label: 'Guardar resultado en', type: 'variable' }
    ]
  },
  agent_whatsapp_media: {
    title: 'Agente: WhatsApp Media',
    icon: 'fa-image',
    description: 'Envía archivos multimedia por WhatsApp',
    fields: [
      { key: 'phone', label: 'Teléfono', type: 'textWithVariable', required: true },
      { key: 'mediaType', label: 'Tipo', type: 'select', default: 'image', options: [
        { value: 'image', label: 'Imagen' }, { value: 'document', label: 'Documento' }, { value: 'audio', label: 'Audio' }, { value: 'video', label: 'Video' }
      ]},
      { key: 'filePath', label: 'Archivo', type: 'fileWithVariable', required: true },
      { key: 'caption', label: 'Texto', type: 'text' },
      { key: 'variable', label: 'Guardar resultado en', type: 'variable' }
    ]
  },

  // --- SLACK ---
  slack_connect: {
    title: 'Conectar Slack',
    icon: 'fa-plug',
    description: 'Configura la conexión con Slack',
    fields: [
      { key: 'token', label: 'Bot Token', type: 'password', required: true, helpText: 'xoxb-... token de tu bot' },
      { key: 'variable', label: 'Guardar conexión en', type: 'variable' }
    ]
  },
  slack_send_message: {
    title: 'Enviar Mensaje Slack',
    icon: 'fa-paper-plane',
    description: 'Envía un mensaje a un canal o usuario de Slack',
    fields: [
      { key: 'channel', label: 'Canal/Usuario', type: 'textWithVariable', required: true, placeholder: '#general o @usuario' },
      { key: 'message', label: 'Mensaje', type: 'textarea', required: true, rows: 3 },
      { key: 'asBot', label: 'Enviar como bot', type: 'checkbox', default: true },
      { key: 'threadTs', label: 'Thread (responder hilo)', type: 'textWithVariable', helpText: 'Timestamp del mensaje padre', advanced: true },
      { key: 'variable', label: 'Guardar resultado en', type: 'variable' }
    ]
  },
  slack_send_blocks: {
    title: 'Enviar Bloques Slack',
    icon: 'fa-th-large',
    description: 'Envía mensaje con formato rico (Block Kit)',
    fields: [
      { key: 'channel', label: 'Canal', type: 'textWithVariable', required: true },
      { key: 'blocks', label: 'Bloques (JSON)', type: 'code', language: 'json', required: true },
      { key: 'text', label: 'Texto fallback', type: 'text' },
      { key: 'variable', label: 'Guardar resultado en', type: 'variable' }
    ]
  },
  slack_read_messages: {
    title: 'Leer Mensajes Slack',
    icon: 'fa-inbox',
    description: 'Lee mensajes de un canal de Slack',
    fields: [
      { key: 'channel', label: 'Canal', type: 'textWithVariable', required: true },
      { key: 'limit', label: 'Cantidad', type: 'number', default: 10 },
      { key: 'variable', label: 'Guardar mensajes en', type: 'variable', required: true }
    ]
  },
  slack_upload_file: {
    title: 'Subir Archivo a Slack',
    icon: 'fa-upload',
    description: 'Sube un archivo a un canal de Slack',
    fields: [
      { key: 'channel', label: 'Canal', type: 'textWithVariable', required: true },
      { key: 'filePath', label: 'Archivo', type: 'fileWithVariable', required: true },
      { key: 'title', label: 'Título', type: 'text' },
      { key: 'comment', label: 'Comentario', type: 'text' },
      { key: 'variable', label: 'Guardar resultado en', type: 'variable' }
    ]
  },
  slack_create_channel: {
    title: 'Crear Canal Slack',
    icon: 'fa-plus-circle',
    description: 'Crea un nuevo canal en Slack',
    fields: [
      { key: 'name', label: 'Nombre del canal', type: 'text', required: true },
      { key: 'isPrivate', label: 'Privado', type: 'checkbox', default: false },
      { key: 'topic', label: 'Tema', type: 'text' },
      { key: 'variable', label: 'Guardar ID en', type: 'variable' }
    ]
  },
  slack_get_users: {
    title: 'Obtener Usuarios Slack',
    icon: 'fa-users',
    description: 'Lista los usuarios del workspace',
    fields: [
      { key: 'variable', label: 'Guardar usuarios en', type: 'variable', required: true }
    ]
  },
  slack_react: {
    title: 'Reaccionar en Slack',
    icon: 'fa-smile',
    description: 'Agrega una reacción emoji a un mensaje',
    fields: [
      { key: 'channel', label: 'Canal', type: 'textWithVariable', required: true },
      { key: 'timestamp', label: 'Mensaje (timestamp)', type: 'textWithVariable', required: true },
      { key: 'emoji', label: 'Emoji', type: 'text', required: true, placeholder: 'thumbsup' }
    ]
  },
  slack_set_status: {
    title: 'Establecer Estado Slack',
    icon: 'fa-circle',
    description: 'Cambia el estado del bot/usuario en Slack',
    fields: [
      { key: 'text', label: 'Texto de estado', type: 'text', required: true },
      { key: 'emoji', label: 'Emoji', type: 'text', placeholder: ':robot_face:' }
    ]
  },

  // --- TELEGRAM ---
  tg_send_message: {
    title: 'Enviar Mensaje Telegram',
    icon: 'fa-paper-plane',
    description: 'Envía un mensaje de texto por Telegram',
    fields: [
      { key: 'chatId', label: 'Chat ID', type: 'textWithVariable', required: true },
      { key: 'text', label: 'Mensaje', type: 'textarea', required: true, rows: 3 },
      { key: 'parseMode', label: 'Formato', type: 'select', default: 'HTML', options: [
        { value: 'HTML', label: 'HTML' }, { value: 'Markdown', label: 'Markdown' }, { value: 'text', label: 'Texto plano' }
      ]},
      { key: 'disablePreview', label: 'Desactivar vista previa', type: 'checkbox', default: false },
      { key: 'variable', label: 'Guardar resultado en', type: 'variable' }
    ]
  },
  tg_send_photo: {
    title: 'Enviar Foto Telegram',
    icon: 'fa-image',
    description: 'Envía una imagen por Telegram',
    fields: [
      { key: 'chatId', label: 'Chat ID', type: 'textWithVariable', required: true },
      { key: 'photo', label: 'Foto', type: 'fileWithVariable', required: true, accept: '.png,.jpg,.jpeg,.gif' },
      { key: 'caption', label: 'Texto', type: 'text' },
      { key: 'variable', label: 'Guardar resultado en', type: 'variable' }
    ]
  },
  tg_send_document: {
    title: 'Enviar Documento Telegram',
    icon: 'fa-file',
    description: 'Envía un archivo por Telegram',
    fields: [
      { key: 'chatId', label: 'Chat ID', type: 'textWithVariable', required: true },
      { key: 'document', label: 'Archivo', type: 'fileWithVariable', required: true },
      { key: 'caption', label: 'Texto', type: 'text' },
      { key: 'variable', label: 'Guardar resultado en', type: 'variable' }
    ]
  },
  tg_send_video: {
    title: 'Enviar Video Telegram',
    icon: 'fa-video',
    description: 'Envía un video por Telegram',
    fields: [
      { key: 'chatId', label: 'Chat ID', type: 'textWithVariable', required: true },
      { key: 'video', label: 'Video', type: 'fileWithVariable', required: true, accept: '.mp4,.avi,.mov' },
      { key: 'caption', label: 'Texto', type: 'text' },
      { key: 'variable', label: 'Guardar resultado en', type: 'variable' }
    ]
  },
  tg_send_audio: {
    title: 'Enviar Audio Telegram',
    icon: 'fa-music',
    description: 'Envía un archivo de audio por Telegram',
    fields: [
      { key: 'chatId', label: 'Chat ID', type: 'textWithVariable', required: true },
      { key: 'audio', label: 'Audio', type: 'fileWithVariable', required: true, accept: '.mp3,.ogg,.wav' },
      { key: 'caption', label: 'Texto', type: 'text' },
      { key: 'variable', label: 'Guardar resultado en', type: 'variable' }
    ]
  },
  tg_send_voice: {
    title: 'Enviar Nota de Voz Telegram',
    icon: 'fa-microphone',
    description: 'Envía una nota de voz por Telegram',
    fields: [
      { key: 'chatId', label: 'Chat ID', type: 'textWithVariable', required: true },
      { key: 'voice', label: 'Archivo de voz', type: 'fileWithVariable', required: true, accept: '.ogg' },
      { key: 'variable', label: 'Guardar resultado en', type: 'variable' }
    ]
  },
  tg_send_location: {
    title: 'Enviar Ubicación Telegram',
    icon: 'fa-map-marker-alt',
    description: 'Envía una ubicación geográfica',
    fields: [
      { key: 'chatId', label: 'Chat ID', type: 'textWithVariable', required: true },
      { key: 'latitude', label: 'Latitud', type: 'text', required: true },
      { key: 'longitude', label: 'Longitud', type: 'text', required: true },
      { key: 'variable', label: 'Guardar resultado en', type: 'variable' }
    ]
  },
  tg_send_poll: {
    title: 'Enviar Encuesta Telegram',
    icon: 'fa-poll',
    description: 'Crea una encuesta en un chat',
    fields: [
      { key: 'chatId', label: 'Chat ID', type: 'textWithVariable', required: true },
      { key: 'question', label: 'Pregunta', type: 'text', required: true },
      { key: 'options', label: 'Opciones', type: 'tags', required: true, placeholder: 'Agrega opciones de respuesta' },
      { key: 'isAnonymous', label: 'Anónima', type: 'checkbox', default: true },
      { key: 'variable', label: 'Guardar resultado en', type: 'variable' }
    ]
  },
  tg_get_updates: {
    title: 'Obtener Updates Telegram',
    icon: 'fa-download',
    description: 'Obtiene mensajes/updates nuevos del bot',
    fields: [
      { key: 'offset', label: 'Offset', type: 'number', default: 0, helpText: 'ID del último update procesado' },
      { key: 'limit', label: 'Cantidad', type: 'number', default: 10 },
      { key: 'variable', label: 'Guardar updates en', type: 'variable', required: true }
    ]
  },
  tg_get_chat: {
    title: 'Info de Chat Telegram',
    icon: 'fa-info-circle',
    description: 'Obtiene información de un chat',
    fields: [
      { key: 'chatId', label: 'Chat ID', type: 'textWithVariable', required: true },
      { key: 'variable', label: 'Guardar info en', type: 'variable', required: true }
    ]
  },
  tg_get_member: {
    title: 'Info de Miembro Telegram',
    icon: 'fa-user',
    description: 'Obtiene información de un miembro del chat',
    fields: [
      { key: 'chatId', label: 'Chat ID', type: 'textWithVariable', required: true },
      { key: 'userId', label: 'User ID', type: 'textWithVariable', required: true },
      { key: 'variable', label: 'Guardar info en', type: 'variable', required: true }
    ]
  },
  tg_edit_message: {
    title: 'Editar Mensaje Telegram',
    icon: 'fa-edit',
    description: 'Edita un mensaje ya enviado',
    fields: [
      { key: 'chatId', label: 'Chat ID', type: 'textWithVariable', required: true },
      { key: 'messageId', label: 'Message ID', type: 'textWithVariable', required: true },
      { key: 'text', label: 'Nuevo texto', type: 'textarea', required: true, rows: 3 }
    ]
  },
  tg_delete_message: {
    title: 'Eliminar Mensaje Telegram',
    icon: 'fa-trash',
    description: 'Elimina un mensaje del chat',
    fields: [
      { key: 'chatId', label: 'Chat ID', type: 'textWithVariable', required: true },
      { key: 'messageId', label: 'Message ID', type: 'textWithVariable', required: true }
    ]
  },
  tg_answer_callback: {
    title: 'Responder Callback Telegram',
    icon: 'fa-reply',
    description: 'Responde a un callback query (botón inline)',
    fields: [
      { key: 'callbackQueryId', label: 'Callback Query ID', type: 'textWithVariable', required: true },
      { key: 'text', label: 'Texto de respuesta', type: 'text' },
      { key: 'showAlert', label: 'Mostrar alerta', type: 'checkbox', default: false }
    ]
  },

  // --- WHATSAPP ---
  wa_connect: {
    title: 'Conectar WhatsApp',
    icon: 'fa-plug',
    description: 'Configura conexión con la API de WhatsApp Business',
    fields: [
      { key: 'token', label: 'Access Token', type: 'password', required: true },
      { key: 'phoneNumberId', label: 'Phone Number ID', type: 'text', required: true },
      { key: 'variable', label: 'Guardar conexión en', type: 'variable' }
    ]
  },
  wa_send_message: {
    title: 'Enviar Mensaje WhatsApp',
    icon: 'fa-paper-plane',
    description: 'Envía un mensaje de texto por WhatsApp',
    fields: [
      { key: 'phone', label: 'Teléfono', type: 'textWithVariable', required: true, placeholder: '+5491112345678' },
      { key: 'message', label: 'Mensaje', type: 'textarea', required: true, rows: 3 },
      { key: 'variable', label: 'Guardar resultado en', type: 'variable' }
    ]
  },
  wa_send_template: {
    title: 'Enviar Template WhatsApp',
    icon: 'fa-file-alt',
    description: 'Envía un mensaje de plantilla aprobada',
    fields: [
      { key: 'phone', label: 'Teléfono', type: 'textWithVariable', required: true },
      { key: 'templateName', label: 'Nombre plantilla', type: 'text', required: true },
      { key: 'language', label: 'Idioma', type: 'select', default: 'es', options: [
        { value: 'es', label: 'Español' }, { value: 'en', label: 'Inglés' }, { value: 'pt_BR', label: 'Portugués' }
      ]},
      { key: 'params', label: 'Parámetros', type: 'keyValue' },
      { key: 'variable', label: 'Guardar resultado en', type: 'variable' }
    ]
  },
  wa_send_media: {
    title: 'Enviar Media WhatsApp',
    icon: 'fa-image',
    description: 'Envía imagen, documento, audio o video por WhatsApp',
    fields: [
      { key: 'phone', label: 'Teléfono', type: 'textWithVariable', required: true },
      { key: 'mediaType', label: 'Tipo', type: 'select', default: 'image', options: [
        { value: 'image', label: 'Imagen' }, { value: 'document', label: 'Documento' }, { value: 'audio', label: 'Audio' }, { value: 'video', label: 'Video' }
      ]},
      { key: 'filePath', label: 'Archivo', type: 'fileWithVariable', required: true },
      { key: 'caption', label: 'Texto', type: 'text' },
      { key: 'variable', label: 'Guardar resultado en', type: 'variable' }
    ]
  },
  wa_send_buttons: {
    title: 'Enviar Botones WhatsApp',
    icon: 'fa-hand-pointer',
    description: 'Envía un mensaje con botones interactivos',
    fields: [
      { key: 'phone', label: 'Teléfono', type: 'textWithVariable', required: true },
      { key: 'headerText', label: 'Encabezado', type: 'text' },
      { key: 'bodyText', label: 'Cuerpo', type: 'textarea', required: true, rows: 2 },
      { key: 'footerText', label: 'Pie', type: 'text' },
      { key: 'buttons', label: 'Botones', type: 'tags', required: true, placeholder: 'Texto de cada botón (max 3)' },
      { key: 'variable', label: 'Guardar resultado en', type: 'variable' }
    ]
  },
  wa_send_list: {
    title: 'Enviar Lista WhatsApp',
    icon: 'fa-list',
    description: 'Envía un mensaje con lista de opciones',
    fields: [
      { key: 'phone', label: 'Teléfono', type: 'textWithVariable', required: true },
      { key: 'bodyText', label: 'Mensaje', type: 'textarea', required: true, rows: 2 },
      { key: 'buttonText', label: 'Texto del botón', type: 'text', required: true, placeholder: 'Ver opciones' },
      { key: 'sections', label: 'Secciones (JSON)', type: 'code', language: 'json', required: true },
      { key: 'variable', label: 'Guardar resultado en', type: 'variable' }
    ]
  },
  wa_send_location: {
    title: 'Enviar Ubicación WhatsApp',
    icon: 'fa-map-marker-alt',
    description: 'Envía una ubicación geográfica por WhatsApp',
    fields: [
      { key: 'phone', label: 'Teléfono', type: 'textWithVariable', required: true },
      { key: 'latitude', label: 'Latitud', type: 'text', required: true },
      { key: 'longitude', label: 'Longitud', type: 'text', required: true },
      { key: 'name', label: 'Nombre del lugar', type: 'text' },
      { key: 'address', label: 'Dirección', type: 'text' }
    ]
  },
  wa_send_contact: {
    title: 'Enviar Contacto WhatsApp',
    icon: 'fa-address-book',
    description: 'Envía una tarjeta de contacto',
    fields: [
      { key: 'phone', label: 'Teléfono destino', type: 'textWithVariable', required: true },
      { key: 'contactName', label: 'Nombre del contacto', type: 'text', required: true },
      { key: 'contactPhone', label: 'Teléfono del contacto', type: 'text', required: true },
      { key: 'contactEmail', label: 'Email', type: 'email' }
    ]
  },
  wa_read_messages: {
    title: 'Leer Mensajes WhatsApp',
    icon: 'fa-inbox',
    description: 'Lee mensajes recibidos de WhatsApp',
    fields: [
      { key: 'phone', label: 'Filtrar por teléfono', type: 'text', helpText: 'Vacío = todos' },
      { key: 'limit', label: 'Cantidad', type: 'number', default: 10 },
      { key: 'variable', label: 'Guardar mensajes en', type: 'variable', required: true }
    ]
  },
  wa_mark_read: {
    title: 'Marcar Leído WhatsApp',
    icon: 'fa-check-double',
    description: 'Marca un mensaje como leído',
    fields: [
      { key: 'messageId', label: 'Message ID', type: 'textWithVariable', required: true }
    ]
  },

  // --- DATATABLES ---
  dt_create: {
    title: 'Crear DataTable',
    icon: 'fa-table',
    description: 'Crea una nueva tabla de datos en memoria',
    fields: [
      { key: 'columns', label: 'Columnas', type: 'tags', required: true, placeholder: 'Nombre, Edad, Email...' },
      { key: 'variable', label: 'Guardar tabla en', type: 'variable', required: true }
    ]
  },
  dt_add_row: {
    title: 'Agregar Fila',
    icon: 'fa-plus',
    description: 'Agrega una fila a la DataTable',
    fields: [
      { key: 'table', label: 'DataTable', type: 'variableSelect', required: true },
      { key: 'values', label: 'Valores', type: 'keyValue', required: true, helpText: 'Columna → Valor' }
    ]
  },
  dt_filter: {
    title: 'Filtrar DataTable',
    icon: 'fa-filter',
    description: 'Filtra filas según una condición',
    fields: [
      { key: 'table', label: 'DataTable', type: 'variableSelect', required: true },
      { key: 'column', label: 'Columna', type: 'text', required: true },
      { key: 'operator', label: 'Operador', type: 'select', default: 'equals', options: [
        { value: 'equals', label: 'Igual a' }, { value: 'contains', label: 'Contiene' }, { value: 'greater', label: 'Mayor que' }, { value: 'less', label: 'Menor que' }, { value: 'startsWith', label: 'Empieza con' }, { value: 'endsWith', label: 'Termina en' }
      ]},
      { key: 'value', label: 'Valor', type: 'textWithVariable', required: true },
      { key: 'variable', label: 'Guardar resultado en', type: 'variable', required: true }
    ]
  },
  dt_sort: {
    title: 'Ordenar DataTable',
    icon: 'fa-sort',
    description: 'Ordena una DataTable por una columna',
    fields: [
      { key: 'table', label: 'DataTable', type: 'variableSelect', required: true },
      { key: 'column', label: 'Columna', type: 'text', required: true },
      { key: 'order', label: 'Orden', type: 'select', default: 'asc', options: [
        { value: 'asc', label: 'Ascendente' }, { value: 'desc', label: 'Descendente' }
      ]},
      { key: 'variable', label: 'Guardar resultado en', type: 'variable' }
    ]
  },
  dt_get_row: {
    title: 'Obtener Fila',
    icon: 'fa-search',
    description: 'Obtiene una fila por índice',
    fields: [
      { key: 'table', label: 'DataTable', type: 'variableSelect', required: true },
      { key: 'index', label: 'Índice (desde 0)', type: 'number', default: 0 },
      { key: 'variable', label: 'Guardar fila en', type: 'variable', required: true }
    ]
  },
  dt_update_row: {
    title: 'Actualizar Fila',
    icon: 'fa-edit',
    description: 'Actualiza valores de una fila',
    fields: [
      { key: 'table', label: 'DataTable', type: 'variableSelect', required: true },
      { key: 'index', label: 'Índice', type: 'number', required: true },
      { key: 'values', label: 'Valores', type: 'keyValue', required: true }
    ]
  },
  dt_delete_row: {
    title: 'Eliminar Fila',
    icon: 'fa-trash',
    description: 'Elimina una fila de la DataTable',
    fields: [
      { key: 'table', label: 'DataTable', type: 'variableSelect', required: true },
      { key: 'index', label: 'Índice', type: 'number', required: true }
    ]
  },
  dt_count: {
    title: 'Contar Filas',
    icon: 'fa-calculator',
    description: 'Cuenta las filas de una DataTable',
    fields: [
      { key: 'table', label: 'DataTable', type: 'variableSelect', required: true },
      { key: 'variable', label: 'Guardar conteo en', type: 'variable', required: true }
    ]
  },
  dt_to_json: {
    title: 'DataTable a JSON',
    icon: 'fa-code',
    description: 'Convierte la DataTable a formato JSON',
    fields: [
      { key: 'table', label: 'DataTable', type: 'variableSelect', required: true },
      { key: 'variable', label: 'Guardar JSON en', type: 'variable', required: true }
    ]
  },
  dt_from_json: {
    title: 'JSON a DataTable',
    icon: 'fa-table',
    description: 'Crea una DataTable desde datos JSON',
    fields: [
      { key: 'json', label: 'Datos JSON', type: 'code', language: 'json', required: true },
      { key: 'variable', label: 'Guardar tabla en', type: 'variable', required: true }
    ]
  },
  dt_to_csv: {
    title: 'DataTable a CSV',
    icon: 'fa-file-csv',
    description: 'Exporta la DataTable a archivo CSV',
    fields: [
      { key: 'table', label: 'DataTable', type: 'variableSelect', required: true },
      { key: 'filePath', label: 'Ruta de archivo', type: 'file', required: true, fileType: 'save', accept: '.csv' },
      { key: 'delimiter', label: 'Delimitador', type: 'select', default: ',', options: [
        { value: ',', label: 'Coma (,)' }, { value: ';', label: 'Punto y coma (;)' }, { value: '\t', label: 'Tab' }
      ]}
    ]
  },
  dt_from_csv: {
    title: 'CSV a DataTable',
    icon: 'fa-file-csv',
    description: 'Importa un archivo CSV como DataTable',
    fields: [
      { key: 'filePath', label: 'Archivo CSV', type: 'file', required: true, fileType: 'open', accept: '.csv' },
      { key: 'delimiter', label: 'Delimitador', type: 'select', default: ',', options: [
        { value: ',', label: 'Coma (,)' }, { value: ';', label: 'Punto y coma (;)' }, { value: '\t', label: 'Tab' }
      ]},
      { key: 'hasHeaders', label: 'Primera fila es encabezado', type: 'checkbox', default: true },
      { key: 'variable', label: 'Guardar tabla en', type: 'variable', required: true }
    ]
  },

  // --- POWERPOINT ---
  ppt_open: {
    title: 'Abrir PowerPoint',
    icon: 'fa-file-powerpoint',
    description: 'Abre una presentación de PowerPoint',
    fields: [
      { key: 'filePath', label: 'Archivo', type: 'fileWithVariable', required: true, accept: '.pptx,.ppt' },
      { key: 'variable', label: 'Guardar referencia en', type: 'variable' }
    ]
  },
  ppt_create: {
    title: 'Crear PowerPoint',
    icon: 'fa-plus-circle',
    description: 'Crea una nueva presentación vacía',
    fields: [
      { key: 'template', label: 'Plantilla', type: 'file', fileType: 'open', accept: '.pptx', helpText: 'Opcional - usar como base' },
      { key: 'variable', label: 'Guardar referencia en', type: 'variable' }
    ]
  },
  ppt_add_slide: {
    title: 'Agregar Diapositiva',
    icon: 'fa-plus-square',
    description: 'Agrega una nueva diapositiva',
    fields: [
      { key: 'layout', label: 'Diseño', type: 'select', default: 'blank', options: [
        { value: 'blank', label: 'En blanco' }, { value: 'title', label: 'Título' }, { value: 'titleContent', label: 'Título y contenido' }, { value: 'twoColumn', label: 'Dos columnas' }
      ]},
      { key: 'position', label: 'Posición', type: 'number', helpText: 'Dejar vacío = al final' }
    ]
  },
  ppt_add_text: {
    title: 'Agregar Texto a PPT',
    icon: 'fa-font',
    description: 'Agrega un cuadro de texto a la diapositiva',
    fields: [
      { key: 'slide', label: 'Número de diapositiva', type: 'number', required: true, default: 1 },
      { key: 'text', label: 'Texto', type: 'textarea', required: true, rows: 3 },
      { key: 'x', label: 'Posición X', type: 'number', default: 100 },
      { key: 'y', label: 'Posición Y', type: 'number', default: 100 },
      { key: 'fontSize', label: 'Tamaño fuente', type: 'number', default: 18 },
      { key: 'bold', label: 'Negrita', type: 'checkbox', default: false }
    ]
  },
  ppt_add_image: {
    title: 'Agregar Imagen a PPT',
    icon: 'fa-image',
    description: 'Inserta una imagen en la diapositiva',
    fields: [
      { key: 'slide', label: 'Número de diapositiva', type: 'number', required: true, default: 1 },
      { key: 'imagePath', label: 'Imagen', type: 'fileWithVariable', required: true, accept: '.png,.jpg,.jpeg,.gif,.bmp' },
      { key: 'x', label: 'Posición X', type: 'number', default: 50 },
      { key: 'y', label: 'Posición Y', type: 'number', default: 50 },
      { key: 'width', label: 'Ancho', type: 'number', helpText: 'Dejar vacío = original' },
      { key: 'height', label: 'Alto', type: 'number' }
    ]
  },
  ppt_add_chart: {
    title: 'Agregar Gráfico a PPT',
    icon: 'fa-chart-bar',
    description: 'Inserta un gráfico en la diapositiva',
    fields: [
      { key: 'slide', label: 'Diapositiva', type: 'number', required: true, default: 1 },
      { key: 'chartType', label: 'Tipo', type: 'select', default: 'bar', options: [
        { value: 'bar', label: 'Barras' }, { value: 'line', label: 'Líneas' }, { value: 'pie', label: 'Circular' }, { value: 'area', label: 'Área' }
      ]},
      { key: 'data', label: 'Datos (JSON)', type: 'code', language: 'json', required: true },
      { key: 'title', label: 'Título del gráfico', type: 'text' }
    ]
  },
  ppt_add_table: {
    title: 'Agregar Tabla a PPT',
    icon: 'fa-table',
    description: 'Inserta una tabla en la diapositiva',
    fields: [
      { key: 'slide', label: 'Diapositiva', type: 'number', required: true, default: 1 },
      { key: 'data', label: 'Datos (JSON array)', type: 'code', language: 'json', required: true },
      { key: 'x', label: 'Posición X', type: 'number', default: 50 },
      { key: 'y', label: 'Posición Y', type: 'number', default: 50 }
    ]
  },
  ppt_save: {
    title: 'Guardar PowerPoint',
    icon: 'fa-save',
    description: 'Guarda la presentación',
    fields: [
      { key: 'filePath', label: 'Guardar como', type: 'file', fileType: 'save', accept: '.pptx', helpText: 'Dejar vacío = sobrescribir original' }
    ]
  },
  ppt_close: {
    title: 'Cerrar PowerPoint',
    icon: 'fa-times-circle',
    description: 'Cierra la presentación',
    fields: [
      { key: 'save', label: 'Guardar antes de cerrar', type: 'checkbox', default: true }
    ]
  },
  ppt_delete_slide: {
    title: 'Eliminar Diapositiva',
    icon: 'fa-trash',
    description: 'Elimina una diapositiva de la presentación',
    fields: [
      { key: 'slide', label: 'Número de diapositiva', type: 'number', required: true }
    ]
  },

  // --- CAPTCHA ---
  captcha_solve_image: {
    title: 'Resolver Captcha Imagen',
    icon: 'fa-image',
    description: 'Resuelve un captcha basado en imagen',
    fields: [
      { key: 'provider', label: 'Servicio', type: 'select', default: '2captcha', options: [
        { value: '2captcha', label: '2Captcha' }, { value: 'anticaptcha', label: 'Anti-Captcha' }, { value: 'capsolver', label: 'CapSolver' }
      ]},
      { key: 'apiKey', label: 'API Key', type: 'password', required: true },
      { key: 'imageSource', label: 'Origen', type: 'select', default: 'screenshot', options: [
        { value: 'screenshot', label: 'Captura de pantalla' }, { value: 'file', label: 'Archivo' }, { value: 'base64', label: 'Base64' }
      ]},
      { key: 'imagePath', label: 'Imagen', type: 'fileWithVariable', condition: { field: 'imageSource', value: 'file' } },
      { key: 'variable', label: 'Guardar solución en', type: 'variable', required: true }
    ]
  },
  captcha_solve_recaptcha: {
    title: 'Resolver reCAPTCHA',
    icon: 'fa-shield-alt',
    description: 'Resuelve un reCAPTCHA v2/v3',
    fields: [
      { key: 'provider', label: 'Servicio', type: 'select', default: '2captcha', options: [
        { value: '2captcha', label: '2Captcha' }, { value: 'anticaptcha', label: 'Anti-Captcha' }, { value: 'capsolver', label: 'CapSolver' }
      ]},
      { key: 'apiKey', label: 'API Key', type: 'password', required: true },
      { key: 'siteKey', label: 'Site Key', type: 'text', required: true, helpText: 'data-sitekey del reCAPTCHA' },
      { key: 'pageUrl', label: 'URL de la página', type: 'url', required: true },
      { key: 'version', label: 'Versión', type: 'select', default: 'v2', options: [
        { value: 'v2', label: 'reCAPTCHA v2' }, { value: 'v3', label: 'reCAPTCHA v3' }
      ]},
      { key: 'variable', label: 'Guardar token en', type: 'variable', required: true }
    ]
  },
  captcha_solve_hcaptcha: {
    title: 'Resolver hCaptcha',
    icon: 'fa-robot',
    description: 'Resuelve un hCaptcha',
    fields: [
      { key: 'provider', label: 'Servicio', type: 'select', default: '2captcha', options: [
        { value: '2captcha', label: '2Captcha' }, { value: 'anticaptcha', label: 'Anti-Captcha' }
      ]},
      { key: 'apiKey', label: 'API Key', type: 'password', required: true },
      { key: 'siteKey', label: 'Site Key', type: 'text', required: true },
      { key: 'pageUrl', label: 'URL de la página', type: 'url', required: true },
      { key: 'variable', label: 'Guardar token en', type: 'variable', required: true }
    ]
  }
})

// Genera las propiedades de las plantillas AI dinámicamente
const AI_TEMPLATE_PROPERTIES = generateActionProperties()

// Combina las propiedades base con las de plantillas AI
export const ACTION_PROPERTIES = {
  ...BASE_ACTION_PROPERTIES,
  ...AI_TEMPLATE_PROPERTIES
}
