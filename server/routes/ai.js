/**
 * ALQVIMIA RPA 2.0 - AI Routes
 * Rutas para procesamiento de documentos con IA y generación de agentes
 */

import express from 'express'
import multer from 'multer'
import path from 'path'
import fs from 'fs'
import { fileURLToPath } from 'url'
import Anthropic from '@anthropic-ai/sdk'
import agentProjectService from '../services/agentProjectService.js'
import { getApiKey, trackUsage, getUsageSummary, hasApiKey } from '../services/aiUsageTracker.js'

const router = express.Router()

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

/**
 * Obtiene un cliente de Anthropic usando la API key de la BD o del .env
 * @param {number} userId - ID del usuario
 * @returns {Promise<{client: Anthropic, keyId: number|null}>}
 */
async function getAnthropicClient(userId) {
  // Primero intentar obtener de la BD
  const keyData = await getApiKey(userId, 'anthropic')
  if (keyData?.apiKey) {
    return {
      client: new Anthropic({ apiKey: keyData.apiKey }),
      keyId: keyData.keyId,
      source: 'database'
    }
  }

  // Fallback al .env
  if (process.env.ANTHROPIC_API_KEY) {
    return {
      client: new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY }),
      keyId: null,
      source: 'env'
    }
  }

  return { client: null, keyId: null, source: null }
}

// Configurar multer para subida de archivos
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../uploads/requirements')
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true })
    }
    cb(null, uploadDir)
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    cb(null, uniqueSuffix + '-' + file.originalname)
  }
})

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB max
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain',
      'text/csv',
      'application/json',
      'image/png',
      'image/jpeg',
      'image/gif'
    ]
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true)
    } else {
      cb(new Error(`Tipo de archivo no soportado: ${file.mimetype}`))
    }
  }
})

/**
 * GET /api/ai/status
 * Verifica el estado de la configuración de IA
 */
router.get('/status', async (req, res) => {
  try {
    const userId = req.headers['x-user-id'] || 1

    const hasDbKey = await hasApiKey(userId, 'anthropic')
    const hasEnvKey = !!process.env.ANTHROPIC_API_KEY

    // Obtener resumen de uso
    const usage = await getUsageSummary(userId, '30d')

    res.json({
      success: true,
      data: {
        configured: hasDbKey || hasEnvKey,
        source: hasDbKey ? 'database' : hasEnvKey ? 'env' : 'none',
        provider: 'anthropic',
        usage
      }
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    })
  }
})

/**
 * POST /api/ai/generate-from-requirements
 * Procesa documentos de requerimientos y genera agente/workflow
 */
router.post('/generate-from-requirements', upload.any(), async (req, res) => {
  try {
    const files = req.files || []
    const { additionalContext, agentType, config: configStr } = req.body
    const config = JSON.parse(configStr || '{}')

    if (files.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'No se proporcionaron archivos'
      })
    }

    console.log(`[AI] Procesando ${files.length} archivos para generación de agente`)

    // Leer contenido de los archivos
    let documentContent = ''
    for (const file of files) {
      const filePath = file.path
      const ext = path.extname(file.originalname).toLowerCase()

      if (['.txt', '.md', '.json', '.csv'].includes(ext)) {
        const content = fs.readFileSync(filePath, 'utf-8')
        documentContent += `\n\n--- Archivo: ${file.originalname} ---\n${content}`
      } else if (ext === '.pdf') {
        // Para PDFs, necesitaríamos una librería como pdf-parse
        documentContent += `\n\n--- Archivo PDF: ${file.originalname} (contenido extraído pendiente) ---`
      } else {
        documentContent += `\n\n--- Archivo: ${file.originalname} (tipo: ${file.mimetype}) ---`
      }
    }

    // Construir prompt para la IA
    const systemPrompt = `Eres un experto en automatización RPA y desarrollo de agentes inteligentes.
Tu tarea es analizar documentos de requerimientos y generar la estructura de un agente/workflow de automatización.

IMPORTANTE: Responde SIEMPRE en formato JSON válido con la siguiente estructura:
{
  "agent": {
    "id": "agent_xxx",
    "name": "Nombre descriptivo del agente",
    "description": "Descripción detallada de lo que hace",
    "category": "sat|retail|rh|finanzas|operaciones|custom",
    "capabilities": ["cap1", "cap2", "cap3"],
    "requirements": [
      { "type": "credential|integration|data", "name": "nombre", "description": "desc", "required": true }
    ],
    "triggers": [
      { "type": "schedule|webhook|manual", "config": {} }
    ],
    "estimatedDevelopmentTime": "X horas/días",
    "complexity": "low|medium|high"
  },
  "workflow": {
    "id": "wf_xxx",
    "name": "Nombre del workflow",
    "description": "Descripción",
    "variables": {
      "var1": { "type": "string", "default": "", "description": "desc" }
    },
    "steps": [
      {
        "id": "step_1",
        "type": "tipo_de_accion",
        "label": "Descripción del paso",
        "properties": {}
      }
    ],
    "errorHandling": {
      "onError": "stop|continue|retry",
      "maxRetries": 3,
      "notifyOnError": true
    }
  },
  "documentation": "Documentación en formato Markdown del agente generado",
  "assumptions": ["Suposición 1", "Suposición 2"],
  "recommendations": ["Recomendación 1", "Recomendación 2"]
}`

    const userPrompt = `Analiza los siguientes requerimientos y genera un agente de automatización RPA:

TIPO DE AGENTE SOLICITADO: ${agentType || 'custom'}

DOCUMENTOS DE REQUERIMIENTOS:
${documentContent}

${additionalContext ? `CONTEXTO ADICIONAL DEL USUARIO:\n${additionalContext}` : ''}

CONFIGURACIÓN:
- Generar Workflow: ${config.generateWorkflow !== false}
- Generar Agente: ${config.generateAgent !== false}
- Incluir Documentación: ${config.includeDocumentation !== false}
- Incluir Pruebas: ${config.includeTests || false}

Por favor, genera la estructura completa del agente basándote en estos requerimientos.
Asegúrate de:
1. Identificar todas las tareas a automatizar
2. Definir los pasos del workflow de forma clara y secuencial
3. Identificar las variables necesarias
4. Especificar las integraciones requeridas
5. Sugerir el trigger más apropiado
6. Documentar supuestos y recomendaciones`

    let result = null
    const userId = req.headers['x-user-id'] || 1

    // Obtener cliente de Anthropic
    const { client: anthropicClient, keyId, source } = await getAnthropicClient(userId)

    // Usar Claude si está disponible
    if (anthropicClient) {
      console.log(`[AI] Usando Claude para análisis... (source: ${source})`)

      const startTime = Date.now()
      const model = 'claude-3-sonnet-20240229'

      const response = await anthropicClient.messages.create({
        model,
        max_tokens: 4096,
        messages: [
          {
            role: 'user',
            content: userPrompt
          }
        ],
        system: systemPrompt
      })

      const responseTime = Date.now() - startTime
      const responseText = response.content[0].text

      // Trackear uso
      await trackUsage({
        userId,
        apiKeyId: keyId,
        provider: 'anthropic',
        model,
        endpoint: '/generate-from-requirements',
        inputTokens: response.usage?.input_tokens || 0,
        outputTokens: response.usage?.output_tokens || 0,
        responseTimeMs: responseTime,
        status: 'success',
        metadata: { filesCount: files.length, agentType }
      })

      // Extraer JSON de la respuesta
      try {
        // Buscar JSON en la respuesta
        const jsonMatch = responseText.match(/\{[\s\S]*\}/)
        if (jsonMatch) {
          result = JSON.parse(jsonMatch[0])
        }
      } catch (parseError) {
        console.error('[AI] Error parseando respuesta JSON:', parseError)
        // Crear resultado básico si falla el parsing
        result = {
          agent: {
            id: `agent_${Date.now()}`,
            name: `Agente de ${agentType || 'Automatización'}`,
            description: 'Agente generado desde requerimientos',
            category: agentType || 'custom',
            capabilities: ['Procesamiento automático'],
            requirements: [],
            triggers: [{ type: 'manual', config: {} }],
            complexity: 'medium'
          },
          workflow: config.generateWorkflow !== false ? {
            id: `wf_${Date.now()}`,
            name: `Workflow de ${agentType || 'Automatización'}`,
            description: 'Workflow generado desde requerimientos',
            variables: {},
            steps: [
              { id: 'step_1', type: 'message_box', label: 'Inicio del proceso', properties: { message: 'Proceso iniciado' } }
            ]
          } : null,
          documentation: responseText,
          assumptions: ['Los documentos proporcionados contienen los requerimientos completos'],
          recommendations: ['Revisar y ajustar el workflow según necesidades específicas']
        }
      }
    } else {
      // Respuesta de demostración si no hay API key
      console.log('[AI] API key no configurada, generando respuesta de demostración...')

      result = {
        agent: {
          id: `agent_${Date.now()}`,
          name: `Agente de ${agentType === 'sat' ? 'Gestión Fiscal SAT' : agentType === 'retail' ? 'Automatización Retail' : 'Automatización'}`,
          description: `Agente generado automáticamente basado en ${files.length} documento(s) de requerimientos`,
          category: agentType || 'custom',
          capabilities: [
            'Procesamiento automático de documentos',
            'Extracción de datos estructurados',
            'Validación de información',
            'Generación de reportes',
            'Notificaciones automáticas'
          ],
          requirements: [
            { type: 'credential', name: 'Credenciales del sistema', description: 'Acceso al sistema principal', required: true },
            { type: 'integration', name: 'API de notificaciones', description: 'Para envío de alertas', required: false }
          ],
          triggers: [
            { type: 'schedule', config: { frequency: 'daily', time: '09:00' } },
            { type: 'manual', config: {} }
          ],
          estimatedDevelopmentTime: '2-4 horas',
          complexity: 'medium'
        },
        workflow: config.generateWorkflow !== false ? {
          id: `wf_${Date.now()}`,
          name: `Workflow de ${agentType === 'sat' ? 'Proceso Fiscal' : agentType === 'retail' ? 'Proceso Retail' : 'Automatización'}`,
          description: 'Workflow generado desde requerimientos',
          variables: {
            input_file: { type: 'file', default: '', description: 'Archivo de entrada a procesar' },
            output_path: { type: 'string', default: 'C:\\Outputs', description: 'Ruta de salida' },
            notify_email: { type: 'email', default: '', description: 'Email para notificaciones' }
          },
          steps: [
            { id: 'step_1', type: 'message_box', label: 'Inicio del proceso', properties: { title: 'Inicio', message: 'Iniciando proceso de automatización' } },
            { id: 'step_2', type: 'select_file', label: 'Seleccionar archivo de entrada', properties: { variable: 'input_file' } },
            { id: 'step_3', type: 'if', label: 'Validar archivo', properties: { condition: '${input_file} != ""' } },
            { id: 'step_4', type: 'extract_data', label: 'Extraer datos del documento', properties: { source: '${input_file}' } },
            { id: 'step_5', type: 'validate_data', label: 'Validar datos extraídos', properties: {} },
            { id: 'step_6', type: 'generate_report', label: 'Generar reporte', properties: { output: '${output_path}' } },
            { id: 'step_7', type: 'send_notification', label: 'Enviar notificación', properties: { email: '${notify_email}' } },
            { id: 'step_8', type: 'message_box', label: 'Fin del proceso', properties: { title: 'Completado', message: 'Proceso finalizado exitosamente' } }
          ],
          errorHandling: {
            onError: 'stop',
            maxRetries: 3,
            notifyOnError: true
          }
        } : null,
        documentation: `# Agente de Automatización

## Descripción
Este agente fue generado automáticamente basándose en los documentos de requerimientos proporcionados.

## Archivos procesados
${files.map(f => `- ${f.originalname}`).join('\n')}

## Capacidades
- Procesamiento automático de documentos
- Extracción y validación de datos
- Generación de reportes
- Sistema de notificaciones

## Configuración requerida
1. Configurar credenciales del sistema
2. Definir rutas de entrada/salida
3. Configurar destinatarios de notificaciones

## Ejecución
El agente puede ejecutarse de forma programada (diariamente) o manual.

${additionalContext ? `## Contexto adicional\n${additionalContext}` : ''}
`,
        assumptions: [
          'Los documentos proporcionados contienen los requerimientos completos',
          'El sistema de destino tiene API disponible para integración',
          'Se cuenta con los permisos necesarios para acceder a los recursos'
        ],
        recommendations: [
          'Revisar y ajustar los pasos del workflow según necesidades específicas',
          'Configurar manejo de errores personalizado',
          'Implementar logging detallado para auditoría',
          'Realizar pruebas en ambiente de desarrollo antes de producción'
        ]
      }
    }

    // Crear proyecto de agente y guardar todo
    console.log('[AI] Creando estructura de proyecto...')

    let projectInfo = null
    try {
      // Crear estructura del proyecto
      const projectResult = await agentProjectService.createAgentProject({
        id: result.agent?.id || `agent_${Date.now()}`,
        name: result.agent?.name || 'Agente Generado',
        description: result.agent?.description || '',
        category: result.agent?.category || agentType || 'custom',
        requirements: result.agent?.requirements || [],
        connections: [],
        triggers: result.agent?.triggers || [],
        aiAnalysis: result
      })

      projectInfo = projectResult

      // Guardar archivos de requerimientos originales (mover en vez de eliminar)
      if (files.length > 0) {
        await agentProjectService.saveRequirementFiles(projectResult.projectPath, files)
        console.log(`[AI] Archivos de requerimientos guardados en: ${projectResult.projectPath}`)
      }

      // Guardar análisis de IA
      await agentProjectService.saveAIAnalysis(projectResult.projectPath, result)

      // Guardar workflow si existe
      if (result.workflow) {
        const workflowPath = await agentProjectService.saveWorkflow(projectResult.projectPath, result.workflow)
        console.log(`[AI] Workflow guardado en: ${workflowPath}`)
      }

      console.log(`[AI] Proyecto creado exitosamente: ${projectResult.projectPath}`)

    } catch (projectError) {
      console.error('[AI] Error creando proyecto:', projectError)
      // Continuar aunque falle la creación del proyecto
    }

    // Limpiar archivos temporales originales (ya fueron copiados)
    for (const file of files) {
      try {
        if (fs.existsSync(file.path)) {
          fs.unlinkSync(file.path)
        }
      } catch (err) {
        console.warn(`[AI] No se pudo eliminar archivo temporal: ${file.path}`)
      }
    }

    res.json({
      success: true,
      data: result,
      project: projectInfo ? {
        path: projectInfo.projectPath,
        structure: projectInfo.structure,
        files: projectInfo.files,
        metadata: projectInfo.metadata
      } : null
    })

  } catch (error) {
    console.error('[AI] Error procesando requerimientos:', error)
    res.status(500).json({
      success: false,
      error: error.message
    })
  }
})

/**
 * GET /api/ai/status
 * Verifica el estado de los servicios de IA
 */
router.get('/status', (req, res) => {
  res.json({
    success: true,
    providers: {
      claude: {
        available: !!anthropicClient,
        configured: !!process.env.ANTHROPIC_API_KEY
      },
      openai: {
        available: false,
        configured: !!process.env.OPENAI_API_KEY
      }
    }
  })
})

/**
 * POST /api/ai/analyze-document
 * Analiza el contenido de un documento y genera pasos de workflow usando IA
 */
router.post('/analyze-document', async (req, res) => {
  try {
    const { content, fileName, context } = req.body

    if (!content || content.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: 'No se proporcionó contenido para analizar'
      })
    }

    console.log(`[AI] Analizando documento: ${fileName || 'sin nombre'} (${content.length} caracteres)`)

    // Verificar si la API Key está configurada
    const aiConfigured = !!anthropicClient

    // Si tenemos cliente de Anthropic configurado, usar IA
    if (anthropicClient) {
      try {
        const systemPrompt = `Eres un experto en automatización RPA (Robotic Process Automation).
Tu tarea es analizar documentos de requerimientos o especificaciones de procesos y extraer los pasos necesarios para crear un workflow de automatización.

IMPORTANTE: Responde SIEMPRE en formato JSON válido con esta estructura exacta:
{
  "summary": "Resumen breve del proceso descrito en 1-2 oraciones",
  "steps": [
    {
      "action": "tipo_accion",
      "icon": "fa-icon-name",
      "label": "Descripción clara del paso",
      "params": {}
    }
  ],
  "variables": [
    { "name": "nombreVariable", "type": "string|number|boolean|array|file", "description": "Descripción" }
  ],
  "recommendations": ["Recomendación 1", "Recomendación 2"]
}

TIPOS DE ACCIONES DISPONIBLES:
- browser_open: Abrir navegador web
- navigate: Navegar a una URL
- click: Hacer clic en un elemento
- type: Escribir texto en un campo
- delay: Esperar X segundos
- if_condition: Condición IF
- for_each: Iteración FOR EACH
- while_loop: Bucle WHILE
- excel_open: Abrir archivo Excel
- excel_read: Leer datos de Excel
- excel_write: Escribir en Excel
- file_read: Leer archivo
- file_write: Escribir archivo
- send_email: Enviar correo electrónico
- db_query: Consulta a base de datos
- api_call: Llamada a API REST
- assign: Asignar valor a variable
- comment: Comentario/documentación

ICONOS RECOMENDADOS (Font Awesome):
- fa-globe, fa-compass: Navegación web
- fa-mouse-pointer: Clic
- fa-keyboard: Escribir
- fa-clock: Esperar
- fa-code-branch: Condiciones
- fa-redo: Bucles
- fa-file-excel: Excel
- fa-file-alt: Archivos
- fa-envelope: Email
- fa-database: Base de datos
- fa-plug: APIs

Analiza el siguiente documento y genera los pasos del workflow:`

        const response = await anthropicClient.messages.create({
          model: 'claude-3-sonnet-20240229',
          max_tokens: 4096,
          system: systemPrompt,
          messages: [
            {
              role: 'user',
              content: `Documento a analizar:\n\n${content.substring(0, 8000)}` // Limitar contenido
            }
          ]
        })

        // Parsear respuesta de la IA
        const aiResponse = response.content[0]?.text || ''

        // Intentar extraer JSON de la respuesta
        let result = null
        try {
          // Buscar JSON en la respuesta
          const jsonMatch = aiResponse.match(/\{[\s\S]*\}/)
          if (jsonMatch) {
            result = JSON.parse(jsonMatch[0])
          }
        } catch (parseError) {
          console.warn('[AI] No se pudo parsear JSON de la respuesta:', parseError.message)
        }

        if (result) {
          console.log(`[AI] Análisis completado: ${result.steps?.length || 0} pasos generados`)
          return res.json({
            success: true,
            ...result,
            source: 'claude'
          })
        }
      } catch (aiError) {
        console.error('[AI] Error con Claude API:', aiError.message)
        // Continuar con análisis local
      }
    }

    // Análisis local sin IA (fallback)
    console.log('[AI] Usando análisis local (sin IA)')
    const localAnalysis = analyzeDocumentLocally(content)

    res.json({
      success: true,
      ...localAnalysis,
      source: 'local',
      aiConfigured: false,
      aiMessage: !process.env.ANTHROPIC_API_KEY
        ? 'API Key de Claude no configurada. Para mejor análisis, agrega ANTHROPIC_API_KEY en el archivo .env'
        : 'Error al conectar con Claude API. Usando análisis local.'
    })

  } catch (error) {
    console.error('[AI] Error analizando documento:', error)
    res.status(500).json({
      success: false,
      error: error.message
    })
  }
})

/**
 * Análisis local del documento sin IA
 */
function analyzeDocumentLocally(content) {
  const steps = []
  const variables = []
  const lowerContent = content.toLowerCase()

  // Patrones para detectar acciones
  const actionPatterns = [
    { pattern: /abrir\s+(?:el\s+)?navegador|open\s+browser/gi, action: 'browser_open', icon: 'fa-globe', label: 'Abrir navegador' },
    { pattern: /navegar\s+a|ir\s+a|visitar\s+(?:la\s+)?(?:página|url)/gi, action: 'navigate', icon: 'fa-compass', label: 'Navegar a URL' },
    { pattern: /(?:hacer\s+)?clic\s+(?:en|sobre)/gi, action: 'click', icon: 'fa-mouse-pointer', label: 'Hacer clic' },
    { pattern: /escribir|ingresar|teclear|rellenar/gi, action: 'type', icon: 'fa-keyboard', label: 'Escribir texto' },
    { pattern: /esperar|aguardar|pausar/gi, action: 'delay', icon: 'fa-clock', label: 'Esperar' },
    { pattern: /si\s+(?:el|la|es|hay)|cuando\s+(?:el|la)|verificar\s+(?:si|que)/gi, action: 'if_condition', icon: 'fa-code-branch', label: 'Verificar condición' },
    { pattern: /para\s+cada|por\s+cada|iterar|recorrer/gi, action: 'for_each', icon: 'fa-redo', label: 'Iterar elementos' },
    { pattern: /abrir\s+(?:archivo\s+)?excel|cargar\s+(?:archivo\s+)?excel/gi, action: 'excel_open', icon: 'fa-file-excel', label: 'Abrir Excel' },
    { pattern: /leer\s+(?:datos\s+(?:de|del)\s+)?excel|obtener\s+(?:datos\s+(?:de|del)\s+)?excel/gi, action: 'excel_read', icon: 'fa-table', label: 'Leer datos de Excel' },
    { pattern: /escribir\s+(?:en\s+)?excel|guardar\s+(?:en\s+)?excel/gi, action: 'excel_write', icon: 'fa-edit', label: 'Escribir en Excel' },
    { pattern: /leer\s+archivo|cargar\s+archivo|abrir\s+archivo/gi, action: 'file_read', icon: 'fa-file-alt', label: 'Leer archivo' },
    { pattern: /escribir\s+archivo|guardar\s+archivo|crear\s+archivo/gi, action: 'file_write', icon: 'fa-save', label: 'Escribir archivo' },
    { pattern: /enviar\s+(?:un\s+)?(?:correo|email|mail)/gi, action: 'send_email', icon: 'fa-envelope', label: 'Enviar correo' },
    { pattern: /consulta(?:r)?\s+(?:a\s+)?(?:la\s+)?base\s+de\s+datos|ejecutar\s+(?:query|consulta)/gi, action: 'db_query', icon: 'fa-database', label: 'Consultar base de datos' },
    { pattern: /llamar?\s+(?:a\s+)?(?:la\s+)?api|consumir\s+(?:el\s+)?servicio/gi, action: 'api_call', icon: 'fa-plug', label: 'Llamar API' },
    { pattern: /copiar\s+(?:el\s+|la\s+)?archivo/gi, action: 'file_copy', icon: 'fa-copy', label: 'Copiar archivo' },
    { pattern: /eliminar\s+(?:el\s+|la\s+)?archivo|borrar\s+(?:el\s+|la\s+)?archivo/gi, action: 'file_delete', icon: 'fa-trash', label: 'Eliminar archivo' },
    { pattern: /descargar\s+(?:el\s+|la\s+)?archivo/gi, action: 'download', icon: 'fa-download', label: 'Descargar archivo' },
  ]

  // Buscar pasos numerados en el documento
  const stepPatterns = [
    /(?:^|\n)\s*(\d+)\.\s+([^\n]+)/g,
    /(?:^|\n)\s*paso\s+(\d+)[:\s]+([^\n]+)/gi,
    /(?:^|\n)\s*step\s+(\d+)[:\s]+([^\n]+)/gi,
    /(?:^|\n)\s*[-•]\s+([^\n]+)/g
  ]

  let stepId = 1
  const timestamp = Date.now()

  for (const stepPattern of stepPatterns) {
    let match
    while ((match = stepPattern.exec(content)) !== null) {
      const stepText = match[2] || match[1]
      if (stepText && stepText.length > 5 && stepText.length < 200) {
        // Determinar tipo de acción
        let action = 'comment'
        let icon = 'fa-comment'
        let label = stepText.trim()

        for (const { pattern, action: act, icon: ico, label: lbl } of actionPatterns) {
          if (pattern.test(stepText)) {
            action = act
            icon = ico
            // Mantener el texto original como label
            break
          }
        }

        // Evitar duplicados
        if (!steps.find(s => s.label === label)) {
          steps.push({
            id: `step_${timestamp}_${stepId++}`,
            action,
            icon,
            label,
            params: {}
          })
        }
      }
    }
  }

  // Si no se encontraron pasos numerados, buscar acciones en el texto completo
  if (steps.length === 0) {
    for (const { pattern, action, icon, label } of actionPatterns) {
      if (pattern.test(content)) {
        steps.push({
          id: `step_${timestamp}_${stepId++}`,
          action,
          icon,
          label,
          params: {}
        })
      }
    }
  }

  // Detectar variables mencionadas
  const variablePatterns = [
    /\{([a-zA-Z_]\w*)\}/g,
    /\$([a-zA-Z_]\w*)/g,
    /variable[:\s]+([a-zA-Z_]\w*)/gi,
    /\[([a-zA-Z_]\w*)\]/g
  ]

  const foundVars = new Set()
  for (const varPattern of variablePatterns) {
    let match
    while ((match = varPattern.exec(content)) !== null) {
      const varName = match[1]
      if (varName && !foundVars.has(varName)) {
        foundVars.add(varName)
        variables.push({
          name: varName,
          type: 'string',
          description: `Variable detectada: ${varName}`
        })
      }
    }
  }

  return {
    summary: `Se identificaron ${steps.length} pasos y ${variables.length} variables en el documento.`,
    steps,
    variables,
    recommendations: [
      'Revisar y ajustar los pasos generados según las necesidades específicas',
      'Completar los parámetros de cada acción',
      'Añadir manejo de errores donde sea necesario'
    ]
  }
}

/**
 * GET /api/ai/projects
 * Lista todos los proyectos de agentes
 */
router.get('/projects', async (req, res) => {
  try {
    const projects = await agentProjectService.listProjects()
    res.json({
      success: true,
      data: projects,
      basePath: agentProjectService.PROJECTS_BASE_PATH
    })
  } catch (error) {
    console.error('[AI] Error listando proyectos:', error)
    res.status(500).json({
      success: false,
      error: error.message
    })
  }
})

/**
 * GET /api/ai/projects/:projectName
 * Obtiene información detallada de un proyecto
 */
router.get('/projects/:projectName', async (req, res) => {
  try {
    const { projectName } = req.params
    const projectPath = path.join(agentProjectService.PROJECTS_BASE_PATH, projectName)

    const projectInfo = await agentProjectService.getProjectInfo(projectPath)
    res.json({
      success: true,
      data: projectInfo
    })
  } catch (error) {
    console.error('[AI] Error obteniendo proyecto:', error)
    res.status(500).json({
      success: false,
      error: error.message
    })
  }
})

/**
 * GET /api/ai/projects/:projectName/structure
 * Obtiene el documento de estructura del proyecto
 */
router.get('/projects/:projectName/structure', async (req, res) => {
  try {
    const { projectName } = req.params
    const structurePath = path.join(
      agentProjectService.PROJECTS_BASE_PATH,
      projectName,
      'docs',
      'ESTRUCTURA_PROYECTO.md'
    )

    if (!fs.existsSync(structurePath)) {
      return res.status(404).json({
        success: false,
        error: 'Documento de estructura no encontrado'
      })
    }

    const content = fs.readFileSync(structurePath, 'utf-8')
    res.json({
      success: true,
      data: {
        path: structurePath,
        content
      }
    })
  } catch (error) {
    console.error('[AI] Error obteniendo estructura:', error)
    res.status(500).json({
      success: false,
      error: error.message
    })
  }
})

/**
 * GET /api/ai/projects/:projectName/requirements
 * Obtiene los requerimientos del proyecto
 */
router.get('/projects/:projectName/requirements', async (req, res) => {
  try {
    const { projectName } = req.params
    const projectPath = path.join(agentProjectService.PROJECTS_BASE_PATH, projectName)

    // Leer documento de requerimientos
    const reqDocPath = path.join(projectPath, 'docs', 'REQUERIMIENTOS.md')
    const reqDoc = fs.existsSync(reqDocPath)
      ? fs.readFileSync(reqDocPath, 'utf-8')
      : null

    // Leer archivos subidos
    const uploadsIndexPath = path.join(projectPath, 'requirements', 'uploads', '_index.json')
    const uploadedFiles = fs.existsSync(uploadsIndexPath)
      ? JSON.parse(fs.readFileSync(uploadsIndexPath, 'utf-8')).files
      : []

    // Leer metadata para los requirements del agente
    const metaPath = path.join(projectPath, 'config', 'project.meta.json')
    const metadata = fs.existsSync(metaPath)
      ? JSON.parse(fs.readFileSync(metaPath, 'utf-8'))
      : {}

    res.json({
      success: true,
      data: {
        document: reqDoc,
        uploadedFiles,
        agentRequirements: metadata.requirements || []
      }
    })
  } catch (error) {
    console.error('[AI] Error obteniendo requerimientos:', error)
    res.status(500).json({
      success: false,
      error: error.message
    })
  }
})

/**
 * GET /api/ai/status
 * Verifica el estado de la configuración de IA
 */
router.get('/status', (req, res) => {
  const hasApiKey = !!process.env.ANTHROPIC_API_KEY
  const isClientReady = !!anthropicClient

  res.json({
    success: true,
    configured: hasApiKey && isClientReady,
    hasApiKey,
    isClientReady,
    message: !hasApiKey
      ? 'API Key de Claude no configurada. Agrega ANTHROPIC_API_KEY en el archivo .env'
      : !isClientReady
        ? 'Error al inicializar el cliente de Claude. Verifica tu API Key.'
        : 'IA configurada correctamente'
  })
})

/**
 * POST /api/ai/chat
 * Chat interactivo con IA - soporta texto + imágenes (Claude Vision)
 */
router.post('/chat', async (req, res) => {
  try {
    const { message, images, history } = req.body
    const userId = req.headers['x-user-id'] || 1

    if (!message && (!images || images.length === 0)) {
      return res.status(400).json({ success: false, error: 'Mensaje o imagen requerido' })
    }

    // Obtener cliente de Anthropic
    const { client: anthropicClient, keyId, source } = await getAnthropicClient(userId)

    if (!anthropicClient) {
      return res.json({
        success: true,
        data: {
          response: '**API Key no configurada.** Para usar el chat con IA, configura tu clave de Anthropic en Configuración > API Keys.\n\nMientras tanto, puedes explorar los demás módulos del dashboard.',
          usage: { inputTokens: 0, outputTokens: 0 },
          provider: 'none'
        }
      })
    }

    console.log(`[AI Chat] Procesando mensaje... (source: ${source}, images: ${images?.length || 0})`)

    // Construir mensajes para Claude
    const claudeMessages = []

    // Agregar historial de conversación
    if (history && Array.isArray(history)) {
      for (const msg of history.slice(-20)) { // Últimos 20 mensajes
        const content = []

        // Si el mensaje tiene imágenes
        if (msg.images && msg.images.length > 0) {
          for (const img of msg.images) {
            if (img.data) {
              const base64Data = img.data.replace(/^data:image\/\w+;base64,/, '')
              const mediaType = img.data.match(/^data:(image\/\w+);/)?.[1] || 'image/png'
              content.push({
                type: 'image',
                source: { type: 'base64', media_type: mediaType, data: base64Data }
              })
            }
          }
        }

        content.push({ type: 'text', text: msg.content })
        claudeMessages.push({ role: msg.role === 'user' ? 'user' : 'assistant', content })
      }
    }

    // Construir mensaje actual
    const currentContent = []

    // Agregar imágenes del mensaje actual
    if (images && images.length > 0) {
      for (const img of images) {
        if (img.data) {
          const base64Data = img.data.replace(/^data:image\/\w+;base64,/, '')
          const mediaType = img.data.match(/^data:(image\/\w+);/)?.[1] || 'image/png'
          currentContent.push({
            type: 'image',
            source: { type: 'base64', media_type: mediaType, data: base64Data }
          })
        }
      }
    }

    currentContent.push({ type: 'text', text: message || 'Analiza esta imagen.' })
    claudeMessages.push({ role: 'user', content: currentContent })

    const model = 'claude-sonnet-4-20250514'
    const startTime = Date.now()

    const response = await anthropicClient.messages.create({
      model,
      max_tokens: 4096,
      system: `Eres Alqvimia IA, un asistente experto en automatización RPA, análisis de datos, y productividad empresarial.
Responde siempre en español de forma clara y profesional.
Puedes analizar imágenes, generar textos, código, análisis, resúmenes y más.
Usa formato Markdown para estructurar tus respuestas cuando sea apropiado.
Si el usuario pega una imagen, analízala detalladamente.`,
      messages: claudeMessages
    })

    const responseTime = Date.now() - startTime
    const responseText = response.content[0]?.text || 'Sin respuesta'

    // Trackear uso
    await trackUsage({
      userId,
      apiKeyId: keyId,
      provider: 'anthropic',
      model,
      endpoint: '/chat',
      inputTokens: response.usage?.input_tokens || 0,
      outputTokens: response.usage?.output_tokens || 0,
      responseTimeMs: responseTime,
      status: 'success',
      metadata: { hasImages: (images?.length || 0) > 0, historyLength: history?.length || 0 }
    })

    res.json({
      success: true,
      data: {
        response: responseText,
        usage: {
          inputTokens: response.usage?.input_tokens || 0,
          outputTokens: response.usage?.output_tokens || 0
        },
        provider: source,
        model,
        responseTime
      }
    })

  } catch (error) {
    console.error('[AI Chat] Error:', error.message, error.status || '')

    // Devolver errores informativos según el tipo
    const status = error.status || 500
    let errorMsg = error.message || 'Error al procesar el mensaje'

    if (status === 401 || errorMsg.includes('authentication') || errorMsg.includes('api_key')) {
      errorMsg = 'API Key invalida o expirada. Ve a Configuracion > API Keys para actualizarla.'
    } else if (status === 429) {
      errorMsg = 'Limite de uso excedido. Espera un momento o verifica tu plan en la consola del proveedor.'
    } else if (status === 404 || errorMsg.includes('model')) {
      errorMsg = `Modelo no disponible. Verifica que tu API Key tenga acceso al modelo configurado.`
    } else if (errorMsg.includes('Could not process image') || errorMsg.includes('invalid_image')) {
      errorMsg = 'No se pudo procesar la imagen. Intenta con otro formato (PNG o JPG).'
    }

    res.status(status).json({
      success: false,
      error: errorMsg
    })
  }
})

export default router
