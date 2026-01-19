/**
 * ALQVIMIA RPA 2.0 - RFQ Document Parser
 * Servicio para procesar documentos (PDF, Word, MD) y generar workflows
 */

import fs from 'fs/promises'
import path from 'path'

/**
 * Extrae texto de un archivo PDF
 * @param {string} filePath - Ruta del archivo PDF
 * @returns {Promise<string>} Texto extraído
 */
async function extractTextFromPDF(filePath) {
  try {
    // TODO: Implementar extracción de PDF usando pdf-parse o similar
    // Por ahora retornamos un placeholder
    const buffer = await fs.readFile(filePath)
    return `[PDF Content - ${buffer.length} bytes]\nTODO: Implementar parser de PDF`
  } catch (error) {
    throw new Error(`Error extrayendo texto de PDF: ${error.message}`)
  }
}

/**
 * Extrae texto de un archivo Word (.docx)
 * @param {string} filePath - Ruta del archivo Word
 * @returns {Promise<string>} Texto extraído
 */
async function extractTextFromWord(filePath) {
  try {
    // TODO: Implementar extracción de Word usando mammoth o similar
    // Por ahora retornamos un placeholder
    const buffer = await fs.readFile(filePath)
    return `[DOCX Content - ${buffer.length} bytes]\nTODO: Implementar parser de Word`
  } catch (error) {
    throw new Error(`Error extrayendo texto de Word: ${error.message}`)
  }
}

/**
 * Extrae texto de un archivo Markdown
 * @param {string} filePath - Ruta del archivo MD
 * @returns {Promise<string>} Texto extraído
 */
async function extractTextFromMarkdown(filePath) {
  try {
    const content = await fs.readFile(filePath, 'utf-8')
    // Eliminar sintaxis de markdown básica para obtener texto limpio
    let cleanText = content
      .replace(/^#{1,6}\s+/gm, '') // Eliminar headers
      .replace(/\*\*(.*?)\*\*/g, '$1') // Eliminar bold
      .replace(/\*(.*?)\*/g, '$1') // Eliminar italic
      .replace(/\[(.*?)\]\(.*?\)/g, '$1') // Eliminar links
      .replace(/```[\s\S]*?```/g, '') // Eliminar code blocks
      .replace(/`(.*?)`/g, '$1') // Eliminar inline code
      .trim()

    return cleanText
  } catch (error) {
    throw new Error(`Error extrayendo texto de Markdown: ${error.message}`)
  }
}

/**
 * Extrae texto de un archivo de texto plano
 * @param {string} filePath - Ruta del archivo TXT
 * @returns {Promise<string>} Texto extraído
 */
async function extractTextFromPlainText(filePath) {
  try {
    return await fs.readFile(filePath, 'utf-8')
  } catch (error) {
    throw new Error(`Error leyendo archivo de texto: ${error.message}`)
  }
}

/**
 * Parser simple para generar steps de workflow desde texto
 * Busca patrones comunes en RFQs como:
 * - "Paso 1:", "1.", "Step 1:"
 * - "Si... entonces...", "If... then..."
 * - "Para cada...", "For each..."
 *
 * @param {string} text - Texto del documento
 * @returns {Array} Array de steps para el workflow
 */
function parseTextToWorkflowSteps(text) {
  const steps = []

  // Dividir por líneas
  const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0)

  // Buscar patrones de pasos numerados
  const stepPatterns = [
    /^(\d+)\.\s+(.+)/,           // "1. Hacer algo"
    /^Paso\s+(\d+):\s*(.+)/i,    // "Paso 1: Hacer algo"
    /^Step\s+(\d+):\s*(.+)/i     // "Step 1: Do something"
  ]

  let stepNumber = 1

  for (const line of lines) {
    // Verificar si la línea coincide con algún patrón de paso
    let matched = false

    for (const pattern of stepPatterns) {
      const match = line.match(pattern)
      if (match) {
        matched = true
        const description = match[2].trim()

        // Determinar tipo de acción basado en palabras clave
        const action = determineActionType(description)

        steps.push({
          id: stepNumber,
          action: action.type,
          label: description,
          ...action.properties
        })

        stepNumber++
        break
      }
    }

    // Si no es un paso numerado pero contiene palabras clave importantes, agregarlo
    if (!matched && line.length > 20) {
      const action = determineActionType(line)
      if (action.type !== 'comment') {
        steps.push({
          id: stepNumber,
          action: action.type,
          label: line,
          ...action.properties
        })
        stepNumber++
      }
    }
  }

  return steps
}

/**
 * Determina el tipo de acción basado en el texto
 * @param {string} text - Texto de la descripción
 * @returns {Object} Objeto con tipo de acción y propiedades
 */
function determineActionType(text) {
  const lowerText = text.toLowerCase()

  // Navegador web
  if (lowerText.includes('abrir navegador') || lowerText.includes('open browser')) {
    return { type: 'browser_open', properties: { url: '' } }
  }
  if (lowerText.includes('navegar') || lowerText.includes('navigate') || lowerText.includes('ir a')) {
    return { type: 'navigate', properties: { url: '' } }
  }
  if (lowerText.includes('hacer clic') || lowerText.includes('click')) {
    return { type: 'click', properties: { selector: '' } }
  }
  if (lowerText.includes('escribir') || lowerText.includes('type') || lowerText.includes('ingresar')) {
    return { type: 'type', properties: { selector: '', text: '' } }
  }

  // Control de flujo
  if (lowerText.includes('si ') || lowerText.includes('if ')) {
    return { type: 'if_condition', properties: { condition: '' } }
  }
  if (lowerText.includes('para cada') || lowerText.includes('for each')) {
    return { type: 'for_each', properties: { collection: '', item: '' } }
  }
  if (lowerText.includes('repetir') || lowerText.includes('loop') || lowerText.includes('mientras')) {
    return { type: 'while_loop', properties: { condition: '' } }
  }
  if (lowerText.includes('esperar') || lowerText.includes('wait')) {
    return { type: 'delay', properties: { seconds: 1 } }
  }

  // Variables
  if (lowerText.includes('asignar') || lowerText.includes('assign') || lowerText.includes('establecer')) {
    return { type: 'assign', properties: { variable: '', value: '' } }
  }

  // Archivos
  if (lowerText.includes('leer archivo') || lowerText.includes('read file')) {
    return { type: 'read_file', properties: { path: '' } }
  }
  if (lowerText.includes('escribir archivo') || lowerText.includes('write file')) {
    return { type: 'write_file', properties: { path: '', content: '' } }
  }
  if (lowerText.includes('copiar archivo') || lowerText.includes('copy file')) {
    return { type: 'copy_file', properties: { source: '', destination: '' } }
  }

  // Excel
  if (lowerText.includes('excel') || lowerText.includes('hoja de cálculo')) {
    if (lowerText.includes('abrir')) {
      return { type: 'excel_open', properties: { path: '' } }
    }
    if (lowerText.includes('leer')) {
      return { type: 'excel_read', properties: { sheet: '', range: '' } }
    }
    if (lowerText.includes('escribir')) {
      return { type: 'excel_write', properties: { sheet: '', range: '', value: '' } }
    }
  }

  // Email
  if (lowerText.includes('correo') || lowerText.includes('email') || lowerText.includes('enviar mensaje')) {
    return { type: 'send_email', properties: { to: '', subject: '', body: '' } }
  }

  // Base de datos
  if (lowerText.includes('consulta') || lowerText.includes('query') || lowerText.includes('base de datos')) {
    return { type: 'db_query', properties: { query: '' } }
  }

  // Default: comentario
  return { type: 'comment', properties: { text: text } }
}

/**
 * Extrae variables del texto
 * @param {string} text - Texto del documento
 * @returns {Array} Array de variables detectadas
 */
function extractVariables(text) {
  const variables = []
  const variablePatterns = [
    /\{([a-zA-Z_]\w*)\}/g,           // {variableName}
    /\$([a-zA-Z_]\w*)/g,             // $variableName
    /\[([a-zA-Z_]\w*)\]/g            // [variableName]
  ]

  const foundVars = new Set()

  for (const pattern of variablePatterns) {
    let match
    while ((match = pattern.exec(text)) !== null) {
      const varName = match[1]
      if (!foundVars.has(varName)) {
        foundVars.add(varName)
        variables.push({
          name: varName,
          value: '',
          type: 'string'
        })
      }
    }
  }

  return variables
}

/**
 * Función principal para procesar documento RFQ
 * @param {string} filePath - Ruta del archivo
 * @param {string} mimeType - Tipo MIME del archivo
 * @returns {Promise<Object>} Resultado del procesamiento
 */
export async function parseRFQDocument(filePath, mimeType) {
  try {
    let extractedText = ''

    // Extraer texto según tipo de archivo
    if (mimeType === 'application/pdf') {
      extractedText = await extractTextFromPDF(filePath)
    } else if (mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
               mimeType === 'application/msword') {
      extractedText = await extractTextFromWord(filePath)
    } else if (mimeType === 'text/markdown' || filePath.endsWith('.md')) {
      extractedText = await extractTextFromMarkdown(filePath)
    } else {
      extractedText = await extractTextFromPlainText(filePath)
    }

    // Parsear texto y generar steps
    const generatedSteps = parseTextToWorkflowSteps(extractedText)

    // Extraer variables
    const variables = extractVariables(extractedText)

    // Generar nombre del workflow
    const fileName = path.basename(filePath, path.extname(filePath))
    const workflowName = fileName.replace(/[_-]/g, ' ').replace(/\b\w/g, l => l.toUpperCase())

    return {
      success: true,
      extractedText,
      generatedSteps,
      variables,
      workflowName
    }
  } catch (error) {
    return {
      success: false,
      error: error.message
    }
  }
}

export default {
  parseRFQDocument,
  extractTextFromPDF,
  extractTextFromWord,
  extractTextFromMarkdown,
  extractTextFromPlainText,
  parseTextToWorkflowSteps,
  extractVariables
}
