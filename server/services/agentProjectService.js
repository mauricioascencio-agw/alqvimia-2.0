/**
 * ALQVIMIA RPA 2.0 - Agent Project Service
 * Servicio para gestionar la estructura de proyectos de agentes
 * Maneja carpetas, archivos, documentación y requerimientos
 */

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Ruta base para proyectos de agentes
const PROJECTS_BASE_PATH = process.env.AGENT_PROJECTS_PATH || 'C:\\Alqvimia\\Projects'

/**
 * Estructura de carpetas para un proyecto de agente
 */
const PROJECT_STRUCTURE = {
  root: '',
  folders: [
    'requirements',      // Documentos de requerimientos originales
    'requirements/uploads', // Archivos subidos
    'config',            // Configuración del agente
    'workflows',         // Workflows generados
    'data',              // Datos de entrada/salida
    'data/input',        // Archivos de entrada
    'data/output',       // Archivos de salida
    'data/temp',         // Archivos temporales
    'logs',              // Logs de ejecución
    'resources',         // Recursos adicionales (imágenes, templates)
    'docs',              // Documentación generada
    'tests',             // Pruebas del agente
    'backups'            // Respaldos
  ],
  files: {
    'README.md': generateReadme,
    'config/agent.config.json': generateAgentConfig,
    'docs/ESTRUCTURA_PROYECTO.md': generateProjectStructureDoc,
    'docs/REQUERIMIENTOS.md': generateRequirementsDoc,
    'docs/CONEXIONES.md': generateConnectionsDoc,
    '.alqvimia': generateProjectMarker
  }
}

/**
 * Crea la estructura completa de un proyecto de agente
 */
export async function createAgentProject(agentData) {
  const {
    id,
    name,
    description,
    category,
    requirements = [],
    workflow = null,
    connections = [],
    aiAnalysis = null
  } = agentData

  const projectId = id || `agent_${Date.now()}`
  const sanitizedName = sanitizeFolderName(name || 'NuevoAgente')
  const projectPath = path.join(PROJECTS_BASE_PATH, sanitizedName)

  try {
    // Crear carpeta raíz si no existe
    if (!fs.existsSync(PROJECTS_BASE_PATH)) {
      fs.mkdirSync(PROJECTS_BASE_PATH, { recursive: true })
    }

    // Verificar si ya existe el proyecto
    if (fs.existsSync(projectPath)) {
      // Agregar timestamp para evitar colisión
      const timestamp = Date.now()
      const newPath = `${projectPath}_${timestamp}`
      fs.mkdirSync(newPath, { recursive: true })
      return await initializeProject(newPath, { ...agentData, id: projectId })
    }

    fs.mkdirSync(projectPath, { recursive: true })
    return await initializeProject(projectPath, { ...agentData, id: projectId })

  } catch (error) {
    console.error('[AgentProject] Error creando proyecto:', error)
    throw error
  }
}

/**
 * Inicializa la estructura del proyecto
 */
async function initializeProject(projectPath, agentData) {
  const result = {
    success: true,
    projectPath,
    structure: {},
    files: []
  }

  // Crear subcarpetas
  for (const folder of PROJECT_STRUCTURE.folders) {
    const folderPath = path.join(projectPath, folder)
    if (!fs.existsSync(folderPath)) {
      fs.mkdirSync(folderPath, { recursive: true })
    }
    result.structure[folder] = folderPath
  }

  // Crear archivos iniciales
  for (const [filePath, generator] of Object.entries(PROJECT_STRUCTURE.files)) {
    const fullPath = path.join(projectPath, filePath)
    const content = generator(agentData, projectPath)
    fs.writeFileSync(fullPath, content, 'utf-8')
    result.files.push(fullPath)
  }

  // Guardar metadata del proyecto
  const metadata = {
    id: agentData.id,
    name: agentData.name,
    description: agentData.description,
    category: agentData.category,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    version: '1.0.0',
    paths: result.structure,
    requirements: agentData.requirements || [],
    connections: agentData.connections || []
  }

  fs.writeFileSync(
    path.join(projectPath, 'config', 'project.meta.json'),
    JSON.stringify(metadata, null, 2),
    'utf-8'
  )

  result.metadata = metadata

  return result
}

/**
 * Guarda los archivos de requerimientos subidos
 */
export async function saveRequirementFiles(projectPath, files) {
  const uploadsPath = path.join(projectPath, 'requirements', 'uploads')
  const savedFiles = []

  for (const file of files) {
    const destPath = path.join(uploadsPath, file.originalname || file.name)

    if (file.path) {
      // Archivo ya guardado temporalmente, mover
      fs.copyFileSync(file.path, destPath)
    } else if (file.buffer) {
      // Archivo en memoria
      fs.writeFileSync(destPath, file.buffer)
    } else if (file.content) {
      // Contenido como string
      fs.writeFileSync(destPath, file.content, 'utf-8')
    }

    savedFiles.push({
      name: file.originalname || file.name,
      path: destPath,
      size: fs.statSync(destPath).size,
      savedAt: new Date().toISOString()
    })
  }

  // Actualizar índice de archivos
  const indexPath = path.join(uploadsPath, '_index.json')
  const existingIndex = fs.existsSync(indexPath)
    ? JSON.parse(fs.readFileSync(indexPath, 'utf-8'))
    : { files: [] }

  existingIndex.files.push(...savedFiles)
  existingIndex.lastUpdated = new Date().toISOString()

  fs.writeFileSync(indexPath, JSON.stringify(existingIndex, null, 2), 'utf-8')

  return savedFiles
}

/**
 * Guarda el resultado del análisis de IA
 */
export async function saveAIAnalysis(projectPath, analysis) {
  const analysisPath = path.join(projectPath, 'docs', 'AI_ANALYSIS.json')
  fs.writeFileSync(analysisPath, JSON.stringify(analysis, null, 2), 'utf-8')

  // También generar versión legible en Markdown
  const mdPath = path.join(projectPath, 'docs', 'ANALISIS_IA.md')
  const mdContent = generateAIAnalysisDoc(analysis)
  fs.writeFileSync(mdPath, mdContent, 'utf-8')

  return { analysisPath, mdPath }
}

/**
 * Guarda el workflow generado
 */
export async function saveWorkflow(projectPath, workflow) {
  const workflowPath = path.join(projectPath, 'workflows', `${workflow.id || 'main'}.workflow.json`)
  fs.writeFileSync(workflowPath, JSON.stringify(workflow, null, 2), 'utf-8')
  return workflowPath
}

/**
 * Obtiene la información completa del proyecto
 */
export async function getProjectInfo(projectPath) {
  const metaPath = path.join(projectPath, 'config', 'project.meta.json')

  if (!fs.existsSync(metaPath)) {
    throw new Error('Proyecto no encontrado o metadata inválida')
  }

  const metadata = JSON.parse(fs.readFileSync(metaPath, 'utf-8'))

  // Obtener lista de archivos de requerimientos
  const uploadsPath = path.join(projectPath, 'requirements', 'uploads')
  const indexPath = path.join(uploadsPath, '_index.json')
  const uploadedFiles = fs.existsSync(indexPath)
    ? JSON.parse(fs.readFileSync(indexPath, 'utf-8')).files
    : []

  // Obtener workflows
  const workflowsPath = path.join(projectPath, 'workflows')
  const workflows = fs.existsSync(workflowsPath)
    ? fs.readdirSync(workflowsPath).filter(f => f.endsWith('.workflow.json'))
    : []

  return {
    ...metadata,
    uploadedFiles,
    workflows,
    projectPath
  }
}

/**
 * Lista todos los proyectos de agentes
 */
export async function listProjects() {
  if (!fs.existsSync(PROJECTS_BASE_PATH)) {
    return []
  }

  const projects = []
  const dirs = fs.readdirSync(PROJECTS_BASE_PATH, { withFileTypes: true })

  for (const dir of dirs) {
    if (dir.isDirectory()) {
      const metaPath = path.join(PROJECTS_BASE_PATH, dir.name, 'config', 'project.meta.json')
      if (fs.existsSync(metaPath)) {
        try {
          const metadata = JSON.parse(fs.readFileSync(metaPath, 'utf-8'))
          projects.push({
            ...metadata,
            folderName: dir.name,
            projectPath: path.join(PROJECTS_BASE_PATH, dir.name)
          })
        } catch (e) {
          console.warn(`[AgentProject] Error leyendo metadata de ${dir.name}:`, e.message)
        }
      }
    }
  }

  return projects.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
}

// ============================================
// GENERADORES DE CONTENIDO
// ============================================

function sanitizeFolderName(name) {
  return name
    .replace(/[<>:"/\\|?*]/g, '')
    .replace(/\s+/g, '_')
    .substring(0, 50)
}

function generateReadme(agentData, projectPath) {
  return `# ${agentData.name || 'Agente de Automatización'}

## Descripción
${agentData.description || 'Agente generado con Alqvimia RPA 2.0'}

## Categoría
${agentData.category || 'custom'}

## Fecha de Creación
${new Date().toLocaleDateString('es-MX', { dateStyle: 'full' })}

## Estructura del Proyecto
\`\`\`
${agentData.name}/
├── requirements/          # Documentos de requerimientos
│   └── uploads/          # Archivos originales subidos
├── config/               # Configuración del agente
├── workflows/            # Workflows de automatización
├── data/                 # Datos de entrada/salida
│   ├── input/           # Archivos de entrada
│   ├── output/          # Archivos de salida
│   └── temp/            # Archivos temporales
├── logs/                 # Registros de ejecución
├── resources/            # Recursos adicionales
├── docs/                 # Documentación
├── tests/                # Pruebas
└── backups/              # Respaldos
\`\`\`

## Documentación
- [Estructura del Proyecto](docs/ESTRUCTURA_PROYECTO.md)
- [Requerimientos](docs/REQUERIMIENTOS.md)
- [Conexiones](docs/CONEXIONES.md)

---
*Generado automáticamente por Alqvimia RPA 2.0*
`
}

function generateAgentConfig(agentData) {
  return JSON.stringify({
    id: agentData.id,
    name: agentData.name,
    version: '1.0.0',
    category: agentData.category,
    enabled: true,
    settings: {
      autoStart: false,
      logLevel: 'info',
      retryOnError: true,
      maxRetries: 3,
      timeout: 300000
    },
    triggers: agentData.triggers || [],
    notifications: {
      onSuccess: true,
      onError: true,
      channels: ['email']
    }
  }, null, 2)
}

function generateProjectStructureDoc(agentData, projectPath) {
  const requirements = agentData.requirements || []
  const connections = agentData.connections || []
  const aiAnalysis = agentData.aiAnalysis || {}

  return `# Estructura del Proyecto: ${agentData.name}

## Información General

| Campo | Valor |
|-------|-------|
| **ID** | ${agentData.id} |
| **Nombre** | ${agentData.name} |
| **Categoría** | ${agentData.category} |
| **Fecha de Creación** | ${new Date().toISOString()} |
| **Ruta del Proyecto** | \`${projectPath}\` |

## 1. Insumos Requeridos

### Archivos de Entrada
${requirements.filter(r => r.type === 'file' || r.type === 'data').map(r =>
  `- **${r.name}**: ${r.description || 'Sin descripción'} ${r.required ? '*(Requerido)*' : '*(Opcional)*'}`
).join('\n') || '- No se han definido archivos de entrada'}

### Credenciales
${requirements.filter(r => r.type === 'credential').map(r =>
  `- **${r.name}**: ${r.description || 'Credencial requerida'} ${r.required ? '*(Requerido)*' : '*(Opcional)*'}`
).join('\n') || '- No se requieren credenciales específicas'}

## 2. Conexiones e Integraciones

${connections.length > 0 ? connections.map(c => `
### ${c.name}
- **Tipo**: ${c.type}
- **URL/Endpoint**: ${c.endpoint || 'N/A'}
- **Autenticación**: ${c.authType || 'N/A'}
- **Estado**: ${c.status || 'Pendiente de configurar'}
`).join('\n') : '- No se han definido conexiones'}

## 3. Rutas del Proyecto

| Carpeta | Ruta | Propósito |
|---------|------|-----------|
| Raíz | \`${projectPath}\` | Directorio principal del proyecto |
| Requerimientos | \`${projectPath}\\requirements\` | Documentos originales |
| Configuración | \`${projectPath}\\config\` | Archivos de configuración |
| Workflows | \`${projectPath}\\workflows\` | Flujos de automatización |
| Entrada | \`${projectPath}\\data\\input\` | Archivos a procesar |
| Salida | \`${projectPath}\\data\\output\` | Resultados generados |
| Logs | \`${projectPath}\\logs\` | Registros de ejecución |
| Documentación | \`${projectPath}\\docs\` | Documentación del proyecto |

## 4. Flujo de Trabajo

\`\`\`mermaid
graph TD
    A[Inicio] --> B[Cargar Configuración]
    B --> C[Validar Insumos]
    C --> D{¿Insumos válidos?}
    D -->|Sí| E[Ejecutar Proceso]
    D -->|No| F[Notificar Error]
    E --> G[Generar Salida]
    G --> H[Guardar Resultados]
    H --> I[Enviar Notificaciones]
    I --> J[Fin]
    F --> J
\`\`\`

## 5. Checklist de Configuración

- [ ] Configurar credenciales en \`config/agent.config.json\`
- [ ] Verificar conexiones a sistemas externos
- [ ] Definir rutas de entrada/salida
- [ ] Configurar notificaciones
- [ ] Realizar prueba de ejecución
- [ ] Documentar casos de uso específicos

## 6. Notas del Análisis de IA

${aiAnalysis.assumptions ? `
### Supuestos
${aiAnalysis.assumptions.map(a => `- ${a}`).join('\n')}
` : ''}

${aiAnalysis.recommendations ? `
### Recomendaciones
${aiAnalysis.recommendations.map(r => `- ${r}`).join('\n')}
` : ''}

---
*Documento generado automáticamente por Alqvimia RPA 2.0*
*Última actualización: ${new Date().toLocaleString('es-MX')}*
`
}

function generateRequirementsDoc(agentData) {
  const requirements = agentData.requirements || []
  const aiAnalysis = agentData.aiAnalysis || {}

  return `# Requerimientos del Agente: ${agentData.name}

## Resumen Ejecutivo
${agentData.description || 'Sin descripción'}

## Requerimientos Funcionales

### Capacidades del Agente
${(aiAnalysis.agent?.capabilities || ['Procesamiento automático']).map((c, i) =>
  `${i + 1}. ${c}`
).join('\n')}

## Requerimientos Técnicos

### Dependencias
| Tipo | Nombre | Descripción | Requerido |
|------|--------|-------------|-----------|
${requirements.map(r =>
  `| ${r.type} | ${r.name} | ${r.description || '-'} | ${r.required ? '✅' : '❌'} |`
).join('\n') || '| - | - | Sin requerimientos definidos | - |'}

### Integraciones Necesarias
${requirements.filter(r => r.type === 'integration').map(r =>
  `- **${r.name}**: ${r.description}`
).join('\n') || '- Sin integraciones específicas'}

## Criterios de Aceptación

1. El agente debe ejecutarse sin errores en condiciones normales
2. Los datos de salida deben cumplir con el formato especificado
3. Los tiempos de ejecución deben estar dentro de los límites definidos
4. Las notificaciones deben enviarse correctamente

## Archivos de Requerimientos Adjuntos

Ver carpeta: \`requirements/uploads/\`

---
*Generado por Alqvimia RPA 2.0*
`
}

function generateConnectionsDoc(agentData) {
  const connections = agentData.connections || []

  return `# Conexiones del Agente: ${agentData.name}

## Matriz de Conexiones

| Sistema | Tipo | Endpoint | Puerto | Autenticación | Estado |
|---------|------|----------|--------|---------------|--------|
${connections.map(c =>
  `| ${c.name} | ${c.type} | ${c.endpoint || '-'} | ${c.port || '-'} | ${c.authType || '-'} | ⚪ Pendiente |`
).join('\n') || '| - | - | - | - | - | - |'}

## Configuración de Conexiones

${connections.length > 0 ? connections.map(c => `
### ${c.name}

**Tipo de Conexión:** ${c.type}

**Configuración:**
\`\`\`json
{
  "name": "${c.name}",
  "type": "${c.type}",
  "endpoint": "${c.endpoint || ''}",
  "port": ${c.port || 'null'},
  "authType": "${c.authType || 'none'}",
  "timeout": 30000
}
\`\`\`

**Notas:** ${c.notes || 'Sin notas adicionales'}
`).join('\n---\n') : 'No se han configurado conexiones para este agente.'}

## Pruebas de Conexión

Para probar las conexiones, ejecutar:
\`\`\`bash
# Desde la carpeta del proyecto
alqvimia test-connections
\`\`\`

---
*Generado por Alqvimia RPA 2.0*
`
}

function generateProjectMarker(agentData) {
  return JSON.stringify({
    type: 'alqvimia-agent-project',
    version: '2.0.0',
    agentId: agentData.id,
    createdAt: new Date().toISOString()
  }, null, 2)
}

function generateAIAnalysisDoc(analysis) {
  return `# Análisis de IA

## Fecha del Análisis
${new Date().toLocaleString('es-MX')}

## Agente Generado

**Nombre:** ${analysis.agent?.name || 'N/A'}
**Descripción:** ${analysis.agent?.description || 'N/A'}
**Complejidad:** ${analysis.agent?.complexity || 'N/A'}

### Capacidades Identificadas
${(analysis.agent?.capabilities || []).map(c => `- ${c}`).join('\n') || '- Sin capacidades identificadas'}

### Requerimientos Detectados
${(analysis.agent?.requirements || []).map(r =>
  `- **${r.name}** (${r.type}): ${r.description || 'Sin descripción'}`
).join('\n') || '- Sin requerimientos detectados'}

## Workflow Generado

**Nombre:** ${analysis.workflow?.name || 'N/A'}
**Pasos:** ${analysis.workflow?.steps?.length || 0}

### Variables del Workflow
\`\`\`json
${JSON.stringify(analysis.workflow?.variables || {}, null, 2)}
\`\`\`

## Supuestos
${(analysis.assumptions || []).map(a => `- ${a}`).join('\n') || '- Sin supuestos'}

## Recomendaciones
${(analysis.recommendations || []).map(r => `- ${r}`).join('\n') || '- Sin recomendaciones'}

---
*Análisis generado por IA - Alqvimia RPA 2.0*
`
}

export default {
  createAgentProject,
  saveRequirementFiles,
  saveAIAnalysis,
  saveWorkflow,
  getProjectInfo,
  listProjects,
  PROJECTS_BASE_PATH
}
