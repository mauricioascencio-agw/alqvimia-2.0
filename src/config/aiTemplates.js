/**
 * ALQVIMIA RPA 2.0 - AI Templates Configuration
 *
 * Este archivo centraliza todas las plantillas de IA disponibles.
 * Cada plantilla se puede usar como:
 * 1. Template en la vista de configuración
 * 2. Acción en el Workflow Studio
 *
 * Para agregar una nueva plantilla, solo agrega un nuevo objeto al array.
 * El sistema automáticamente:
 * - La mostrará en la galería de plantillas
 * - La agregará como acción disponible en el workflow
 * - Generará los campos de configuración necesarios
 */

// Categorías disponibles para agrupar plantillas
export const AI_TEMPLATE_CATEGORIES = {
  extraction: { name: 'Extracción', icon: 'fa-file-export', color: '#4CAF50' },
  classification: { name: 'Clasificación', icon: 'fa-tags', color: '#2196F3' },
  summarization: { name: 'Resumen', icon: 'fa-compress-alt', color: '#9C27B0' },
  analysis: { name: 'Análisis', icon: 'fa-chart-line', color: '#FF5722' },
  translation: { name: 'Traducción', icon: 'fa-language', color: '#00BCD4' },
  correction: { name: 'Corrección', icon: 'fa-spell-check', color: '#E91E63' },
  generation: { name: 'Generación', icon: 'fa-magic', color: '#673AB7' },
  communication: { name: 'Comunicación', icon: 'fa-envelope', color: '#009688' },
  validation: { name: 'Validación', icon: 'fa-check-double', color: '#8BC34A' }
}

// Proveedores de IA soportados
export const AI_PROVIDERS = [
  { value: 'openai', label: 'OpenAI (GPT-4)', icon: 'fa-robot' },
  { value: 'claude', label: 'Claude (Anthropic)', icon: 'fa-brain' },
  { value: 'gemini', label: 'Google Gemini', icon: 'fab fa-google' },
  { value: 'local', label: 'Modelo Local', icon: 'fa-server' }
]

// Modelos disponibles por proveedor
export const AI_MODELS = {
  openai: [
    { value: 'gpt-4-turbo', label: 'GPT-4 Turbo' },
    { value: 'gpt-4', label: 'GPT-4' },
    { value: 'gpt-3.5-turbo', label: 'GPT-3.5 Turbo' }
  ],
  claude: [
    { value: 'claude-3-opus', label: 'Claude 3 Opus' },
    { value: 'claude-3-sonnet', label: 'Claude 3 Sonnet' },
    { value: 'claude-3-haiku', label: 'Claude 3 Haiku' }
  ],
  gemini: [
    { value: 'gemini-pro', label: 'Gemini Pro' },
    { value: 'gemini-ultra', label: 'Gemini Ultra' }
  ],
  local: [
    { value: 'llama-3', label: 'Llama 3' },
    { value: 'mistral', label: 'Mistral' },
    { value: 'custom', label: 'Personalizado' }
  ]
}

/**
 * Definición de plantillas de IA
 *
 * Cada plantilla define:
 * - id: Identificador único (usado como tipo de acción: ai_template_{id})
 * - name: Nombre para mostrar
 * - icon: Icono FontAwesome
 * - color: Color del tema
 * - category: Categoría para agrupar
 * - description: Descripción corta
 * - prompt: Prompt predefinido para la IA
 * - inputFields: Campos de entrada adicionales específicos de esta plantilla
 * - outputFormat: Formato de salida esperado
 */
export const AI_TEMPLATES = [
  {
    id: 'data_extractor',
    name: 'Extractor de Datos',
    icon: 'fa-file-export',
    color: '#4CAF50',
    category: 'extraction',
    description: 'Extrae información estructurada de documentos, PDFs y páginas web',
    prompt: `Analiza el siguiente contenido y extrae los datos relevantes en formato JSON estructurado.
Identifica campos como: nombres, fechas, números, direcciones, emails, teléfonos y cualquier dato relevante.

Contenido a analizar:
{input}

Campos específicos a extraer (si se proporcionan):
{fields}

Responde SOLO con el JSON estructurado, sin explicaciones adicionales.`,
    inputFields: [
      {
        key: 'fields',
        label: 'Campos a extraer',
        type: 'tags',
        placeholder: 'nombre, email, telefono...',
        helpText: 'Lista de campos específicos a extraer (opcional)'
      }
    ],
    outputFormat: 'json'
  },
  {
    id: 'document_classifier',
    name: 'Clasificador de Documentos',
    icon: 'fa-folder-open',
    color: '#2196F3',
    category: 'classification',
    description: 'Clasifica documentos automáticamente según su contenido y tipo',
    prompt: `Analiza el siguiente documento y clasifícalo en una de las categorías proporcionadas.

Documento:
{input}

Categorías disponibles:
{categories}

Responde con un JSON que contenga:
- "category": la categoría seleccionada
- "confidence": nivel de confianza (0-100)
- "reasoning": breve explicación de la clasificación`,
    inputFields: [
      {
        key: 'categories',
        label: 'Categorías',
        type: 'tags',
        required: true,
        placeholder: 'factura, contrato, reporte...',
        helpText: 'Lista de categorías posibles para clasificar'
      }
    ],
    outputFormat: 'json'
  },
  {
    id: 'summary_generator',
    name: 'Generador de Resúmenes',
    icon: 'fa-compress-alt',
    color: '#9C27B0',
    category: 'summarization',
    description: 'Crea resúmenes ejecutivos de textos largos',
    prompt: `Genera un resumen ejecutivo del siguiente texto.

Texto original:
{input}

Longitud deseada: {length}
Estilo: {style}

El resumen debe capturar los puntos más importantes y ser coherente.`,
    inputFields: [
      {
        key: 'length',
        label: 'Longitud del resumen',
        type: 'select',
        default: 'medium',
        options: [
          { value: 'short', label: 'Corto (1-2 párrafos)' },
          { value: 'medium', label: 'Medio (3-4 párrafos)' },
          { value: 'long', label: 'Largo (5+ párrafos)' },
          { value: 'bullets', label: 'Puntos clave (bullet points)' }
        ]
      },
      {
        key: 'style',
        label: 'Estilo',
        type: 'select',
        default: 'professional',
        options: [
          { value: 'professional', label: 'Profesional' },
          { value: 'casual', label: 'Casual' },
          { value: 'technical', label: 'Técnico' },
          { value: 'executive', label: 'Ejecutivo' }
        ]
      }
    ],
    outputFormat: 'text'
  },
  {
    id: 'sentiment_analyzer',
    name: 'Analizador de Sentimientos',
    icon: 'fa-smile',
    color: '#FF5722',
    category: 'analysis',
    description: 'Detecta el tono y sentimiento en textos y conversaciones',
    prompt: `Analiza el sentimiento del siguiente texto.

Texto:
{input}

Proporciona un análisis detallado en formato JSON con:
- "sentiment": positivo, negativo, neutro o mixto
- "score": puntuación de -100 a 100
- "emotions": lista de emociones detectadas con sus intensidades
- "keywords": palabras clave que influyen en el sentimiento
- "summary": breve resumen del análisis`,
    inputFields: [
      {
        key: 'detailed',
        label: 'Análisis detallado',
        type: 'toggle',
        default: true,
        helpText: 'Incluir desglose de emociones y palabras clave'
      }
    ],
    outputFormat: 'json'
  },
  {
    id: 'translator',
    name: 'Traductor Multilenguaje',
    icon: 'fa-language',
    color: '#00BCD4',
    category: 'translation',
    description: 'Traduce textos entre múltiples idiomas manteniendo el contexto',
    prompt: `Traduce el siguiente texto de {sourceLanguage} a {targetLanguage}.

Texto original:
{input}

Consideraciones:
- Mantén el tono y estilo del texto original
- Preserva el formato (párrafos, listas, etc.)
- Si hay términos técnicos, proporciona la traducción más apropiada

Proporciona solo la traducción, sin explicaciones.`,
    inputFields: [
      {
        key: 'sourceLanguage',
        label: 'Idioma origen',
        type: 'select',
        default: 'auto',
        options: [
          { value: 'auto', label: 'Detectar automáticamente' },
          { value: 'es', label: 'Español' },
          { value: 'en', label: 'Inglés' },
          { value: 'fr', label: 'Francés' },
          { value: 'de', label: 'Alemán' },
          { value: 'pt', label: 'Portugués' },
          { value: 'it', label: 'Italiano' },
          { value: 'zh', label: 'Chino' },
          { value: 'ja', label: 'Japonés' },
          { value: 'ko', label: 'Coreano' }
        ]
      },
      {
        key: 'targetLanguage',
        label: 'Idioma destino',
        type: 'select',
        required: true,
        default: 'en',
        options: [
          { value: 'es', label: 'Español' },
          { value: 'en', label: 'Inglés' },
          { value: 'fr', label: 'Francés' },
          { value: 'de', label: 'Alemán' },
          { value: 'pt', label: 'Portugués' },
          { value: 'it', label: 'Italiano' },
          { value: 'zh', label: 'Chino' },
          { value: 'ja', label: 'Japonés' },
          { value: 'ko', label: 'Coreano' }
        ]
      }
    ],
    outputFormat: 'text'
  },
  {
    id: 'text_corrector',
    name: 'Corrector de Texto',
    icon: 'fa-spell-check',
    color: '#E91E63',
    category: 'correction',
    description: 'Corrige errores ortográficos, gramaticales y de estilo',
    prompt: `Corrige el siguiente texto identificando y arreglando:
- Errores ortográficos
- Errores gramaticales
- Problemas de puntuación
- Mejoras de estilo (si se solicita)

Texto original:
{input}

Nivel de corrección: {correctionLevel}

Responde con un JSON que contenga:
- "correctedText": el texto corregido
- "corrections": lista de correcciones realizadas con explicación
- "stats": estadísticas (errores encontrados, tipo de errores)`,
    inputFields: [
      {
        key: 'correctionLevel',
        label: 'Nivel de corrección',
        type: 'select',
        default: 'standard',
        options: [
          { value: 'basic', label: 'Básico (solo ortografía)' },
          { value: 'standard', label: 'Estándar (ortografía + gramática)' },
          { value: 'advanced', label: 'Avanzado (incluye estilo)' },
          { value: 'professional', label: 'Profesional (reescritura completa)' }
        ]
      }
    ],
    outputFormat: 'json'
  },
  {
    id: 'code_generator',
    name: 'Generador de Código',
    icon: 'fa-code',
    color: '#673AB7',
    category: 'generation',
    description: 'Genera código en varios lenguajes de programación',
    prompt: `Genera código en {language} para la siguiente tarea:

Descripción:
{input}

Requisitos adicionales:
{requirements}

El código debe:
- Estar bien comentado
- Seguir las mejores prácticas del lenguaje
- Ser eficiente y mantenible
- Incluir manejo de errores si es apropiado

Responde SOLO con el código, sin explicaciones adicionales a menos que sea necesario.`,
    inputFields: [
      {
        key: 'language',
        label: 'Lenguaje',
        type: 'select',
        required: true,
        default: 'javascript',
        options: [
          { value: 'javascript', label: 'JavaScript' },
          { value: 'python', label: 'Python' },
          { value: 'csharp', label: 'C#' },
          { value: 'java', label: 'Java' },
          { value: 'sql', label: 'SQL' },
          { value: 'powershell', label: 'PowerShell' },
          { value: 'bash', label: 'Bash' },
          { value: 'typescript', label: 'TypeScript' },
          { value: 'php', label: 'PHP' },
          { value: 'go', label: 'Go' },
          { value: 'rust', label: 'Rust' }
        ]
      },
      {
        key: 'requirements',
        label: 'Requisitos adicionales',
        type: 'textarea',
        placeholder: 'Librerías específicas, patrones de diseño, etc.',
        rows: 3
      }
    ],
    outputFormat: 'code'
  },
  {
    id: 'email_assistant',
    name: 'Asistente de Email',
    icon: 'fa-envelope',
    color: '#009688',
    category: 'communication',
    description: 'Redacta y mejora correos electrónicos profesionales',
    prompt: `{action} un correo electrónico profesional.

{contextLabel}:
{input}

Configuración:
- Tono: {tone}
- Longitud: {emailLength}
- Propósito: {purpose}

{additionalInstructions}

El correo debe ser claro, conciso y apropiado para un contexto profesional.`,
    inputFields: [
      {
        key: 'action',
        label: 'Acción',
        type: 'select',
        default: 'write',
        options: [
          { value: 'write', label: 'Redactar nuevo email' },
          { value: 'reply', label: 'Responder a email' },
          { value: 'improve', label: 'Mejorar email existente' },
          { value: 'summarize', label: 'Resumir email' }
        ]
      },
      {
        key: 'tone',
        label: 'Tono',
        type: 'select',
        default: 'professional',
        options: [
          { value: 'formal', label: 'Formal' },
          { value: 'professional', label: 'Profesional' },
          { value: 'friendly', label: 'Amigable' },
          { value: 'urgent', label: 'Urgente' },
          { value: 'apologetic', label: 'Disculpa' }
        ]
      },
      {
        key: 'emailLength',
        label: 'Longitud',
        type: 'select',
        default: 'medium',
        options: [
          { value: 'short', label: 'Corto (2-3 líneas)' },
          { value: 'medium', label: 'Medio (1 párrafo)' },
          { value: 'long', label: 'Largo (múltiples párrafos)' }
        ]
      },
      {
        key: 'purpose',
        label: 'Propósito',
        type: 'text',
        placeholder: 'Ej: Solicitar información, agradecer, dar seguimiento...'
      }
    ],
    outputFormat: 'text'
  },
  {
    id: 'log_analyzer',
    name: 'Analizador de Logs',
    icon: 'fa-terminal',
    color: '#607D8B',
    category: 'analysis',
    description: 'Analiza logs de sistemas para identificar errores y patrones',
    prompt: `Analiza los siguientes logs del sistema:

{input}

Tipo de análisis: {analysisType}

Proporciona un análisis estructurado en JSON con:
- "summary": resumen ejecutivo del estado
- "errors": lista de errores encontrados con severidad
- "warnings": advertencias identificadas
- "patterns": patrones detectados
- "recommendations": recomendaciones de acción
- "timeline": línea de tiempo de eventos importantes (si aplica)`,
    inputFields: [
      {
        key: 'analysisType',
        label: 'Tipo de análisis',
        type: 'select',
        default: 'full',
        options: [
          { value: 'errors', label: 'Solo errores' },
          { value: 'performance', label: 'Rendimiento' },
          { value: 'security', label: 'Seguridad' },
          { value: 'full', label: 'Análisis completo' }
        ]
      },
      {
        key: 'timeRange',
        label: 'Rango de tiempo',
        type: 'select',
        default: 'all',
        options: [
          { value: 'all', label: 'Todo el log' },
          { value: 'last_hour', label: 'Última hora' },
          { value: 'last_24h', label: 'Últimas 24 horas' },
          { value: 'last_week', label: 'Última semana' }
        ]
      }
    ],
    outputFormat: 'json'
  },
  {
    id: 'data_validator',
    name: 'Validador de Datos',
    icon: 'fa-check-double',
    color: '#8BC34A',
    category: 'validation',
    description: 'Valida y verifica la integridad de datos estructurados',
    prompt: `Valida los siguientes datos según las reglas especificadas:

Datos a validar:
{input}

Reglas de validación:
{validationRules}

Esquema esperado (si se proporciona):
{schema}

Responde con un JSON que contenga:
- "isValid": boolean indicando si todos los datos son válidos
- "errors": lista de errores de validación encontrados
- "warnings": advertencias (datos válidos pero potencialmente problemáticos)
- "stats": estadísticas de validación
- "suggestions": sugerencias para corregir datos inválidos`,
    inputFields: [
      {
        key: 'validationRules',
        label: 'Reglas de validación',
        type: 'textarea',
        placeholder: 'Ej: email debe ser válido, edad entre 18-65, etc.',
        rows: 3,
        helpText: 'Describe las reglas que deben cumplir los datos'
      },
      {
        key: 'schema',
        label: 'Esquema JSON (opcional)',
        type: 'textarea',
        placeholder: '{"name": "string", "age": "number", ...}',
        rows: 4,
        helpText: 'Esquema JSON para validación estructural'
      }
    ],
    outputFormat: 'json'
  },
  {
    id: 'report_generator',
    name: 'Generador de Reportes',
    icon: 'fa-file-alt',
    color: '#FF9800',
    category: 'generation',
    description: 'Genera reportes profesionales a partir de datos',
    prompt: `Genera un reporte profesional basado en los siguientes datos:

Datos:
{input}

Configuración del reporte:
- Tipo: {reportType}
- Formato: {format}
- Secciones a incluir: {sections}

El reporte debe ser claro, bien estructurado y profesional.
Incluye gráficos textuales si es apropiado (tablas ASCII, etc.).`,
    inputFields: [
      {
        key: 'reportType',
        label: 'Tipo de reporte',
        type: 'select',
        default: 'executive',
        options: [
          { value: 'executive', label: 'Ejecutivo' },
          { value: 'technical', label: 'Técnico' },
          { value: 'financial', label: 'Financiero' },
          { value: 'progress', label: 'Progreso/Avance' },
          { value: 'analysis', label: 'Análisis' }
        ]
      },
      {
        key: 'format',
        label: 'Formato de salida',
        type: 'select',
        default: 'markdown',
        options: [
          { value: 'markdown', label: 'Markdown' },
          { value: 'html', label: 'HTML' },
          { value: 'text', label: 'Texto plano' }
        ]
      },
      {
        key: 'sections',
        label: 'Secciones',
        type: 'multiSelect',
        default: ['summary', 'details', 'conclusions'],
        options: [
          { value: 'summary', label: 'Resumen ejecutivo' },
          { value: 'details', label: 'Detalles' },
          { value: 'charts', label: 'Gráficos/Tablas' },
          { value: 'conclusions', label: 'Conclusiones' },
          { value: 'recommendations', label: 'Recomendaciones' },
          { value: 'appendix', label: 'Anexos' }
        ]
      }
    ],
    outputFormat: 'text'
  },
  {
    id: 'entity_extractor',
    name: 'Extractor de Entidades',
    icon: 'fa-sitemap',
    color: '#795548',
    category: 'extraction',
    description: 'Identifica y extrae entidades nombradas de textos',
    prompt: `Extrae todas las entidades nombradas del siguiente texto:

{input}

Tipos de entidades a buscar: {entityTypes}

Responde con un JSON estructurado que contenga:
- "entities": objeto con arrays por tipo de entidad
- "relationships": relaciones detectadas entre entidades
- "context": contexto relevante para cada entidad
- "confidence": nivel de confianza por entidad`,
    inputFields: [
      {
        key: 'entityTypes',
        label: 'Tipos de entidades',
        type: 'multiSelect',
        default: ['person', 'organization', 'location'],
        options: [
          { value: 'person', label: 'Personas' },
          { value: 'organization', label: 'Organizaciones' },
          { value: 'location', label: 'Ubicaciones' },
          { value: 'date', label: 'Fechas' },
          { value: 'money', label: 'Cantidades monetarias' },
          { value: 'product', label: 'Productos' },
          { value: 'event', label: 'Eventos' },
          { value: 'email', label: 'Emails' },
          { value: 'phone', label: 'Teléfonos' },
          { value: 'url', label: 'URLs' }
        ]
      }
    ],
    outputFormat: 'json'
  }
]

/**
 * Genera las acciones de workflow a partir de las plantillas
 * Esto permite que las plantillas aparezcan automáticamente en el panel izquierdo
 */
export function generateWorkflowActions() {
  return AI_TEMPLATES.map(template => ({
    type: `ai_template_${template.id}`,
    label: template.name,
    icon: template.icon,
    category: template.category,
    color: template.color,
    templateId: template.id
  }))
}

/**
 * Genera las propiedades de acción para el editor de propiedades
 * Se usan en ACTION_PROPERTIES para configurar cada plantilla
 */
export function generateActionProperties() {
  const properties = {}

  AI_TEMPLATES.forEach(template => {
    const actionType = `ai_template_${template.id}`

    // Campos base comunes a todas las plantillas
    const baseFields = [
      {
        key: 'provider',
        label: 'Proveedor de IA',
        type: 'select',
        required: true,
        default: 'openai',
        options: AI_PROVIDERS,
        helpText: 'Selecciona el proveedor de IA a utilizar'
      },
      {
        key: 'model',
        label: 'Modelo',
        type: 'select',
        required: true,
        default: 'gpt-4-turbo',
        dependsOn: 'provider',
        optionsMap: AI_MODELS,
        helpText: 'Modelo de IA a utilizar'
      },
      {
        key: 'input',
        label: 'Entrada',
        type: 'textareaWithVariable',
        required: true,
        placeholder: 'Texto o variable a procesar...',
        rows: 5,
        helpText: 'Contenido a procesar con la plantilla. Puedes usar variables.'
      }
    ]

    // Campos específicos de la plantilla
    const templateFields = (template.inputFields || []).map(field => ({
      ...field,
      // Asegurar que todos los campos tengan las propiedades necesarias
      key: field.key,
      label: field.label,
      type: field.type || 'text'
    }))

    // Campos de configuración avanzada
    const advancedFields = [
      {
        key: 'temperature',
        label: 'Temperatura',
        type: 'slider',
        min: 0,
        max: 2,
        step: 0.1,
        default: 0.7,
        advanced: true,
        helpText: 'Controla la creatividad de las respuestas (0 = preciso, 2 = creativo)'
      },
      {
        key: 'maxTokens',
        label: 'Tokens máximos',
        type: 'number',
        min: 100,
        max: 32000,
        default: 2000,
        advanced: true,
        helpText: 'Límite de tokens para la respuesta'
      },
      {
        key: 'customPrompt',
        label: 'Prompt personalizado',
        type: 'textarea',
        rows: 6,
        advanced: true,
        placeholder: template.prompt,
        helpText: 'Modifica el prompt predefinido si necesitas personalizarlo'
      },
      {
        key: 'outputVariable',
        label: 'Variable de salida',
        type: 'text',
        default: `${template.id}_result`,
        advanced: true,
        helpText: 'Nombre de la variable donde se guardará el resultado'
      }
    ]

    properties[actionType] = {
      title: template.name,
      icon: template.icon,
      description: template.description,
      category: 'ai-templates',
      color: template.color,
      templateId: template.id,
      defaultPrompt: template.prompt,
      outputFormat: template.outputFormat,
      fields: [...baseFields, ...templateFields, ...advancedFields]
    }
  })

  return properties
}

/**
 * Obtiene una plantilla por su ID
 */
export function getTemplateById(id) {
  return AI_TEMPLATES.find(t => t.id === id)
}

/**
 * Obtiene plantillas por categoría
 */
export function getTemplatesByCategory(category) {
  return AI_TEMPLATES.filter(t => t.category === category)
}

/**
 * Obtiene todas las categorías con sus plantillas
 */
export function getTemplatesGroupedByCategory() {
  const grouped = {}

  Object.entries(AI_TEMPLATE_CATEGORIES).forEach(([key, category]) => {
    const templates = getTemplatesByCategory(key)
    if (templates.length > 0) {
      grouped[key] = {
        ...category,
        templates
      }
    }
  })

  return grouped
}

export default AI_TEMPLATES
