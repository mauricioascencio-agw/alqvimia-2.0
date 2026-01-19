# Feature: Generar Workflow desde RFQ/Documentos

## Descripción

Esta funcionalidad permite generar workflows automáticamente a partir de documentos RFQ (Request for Quotation) o documentos de procesos en formatos PDF, Word (.docx/.doc) y Markdown (.md).

## Características Implementadas

### 1. Responsive Design para Pantallas Pequeñas (≤1366x768)

Se agregaron media queries en `src/assets/css/styles.css` para:
- Habilitar scroll vertical cuando el contenido excede el tamaño de la pantalla
- Ajustar elementos de UI para pantallas pequeñas
- Optimizar el uso del espacio en resoluciones bajas

**Archivos modificados:**
- `src/assets/css/styles.css` (líneas 2093-2163)

### 2. Botón "Desde RFQ" en Workflow Studio

Se agregó un botón en la barra de herramientas del Workflow Studio que permite cargar y procesar documentos.

**Ubicación:** Toolbar del panel central, entre "Migrar" y "IA"

**Archivos modificados:**
- `src/views/WorkflowsView.jsx`
  - Estados: líneas 3117-3123 (estados para modal RFQ)
  - Función procesamiento: líneas 2959-3042 (`processRFQDocument`)
  - Botón UI: línea 5002-5006
  - Modal: líneas 5818-5948
- `src/assets/css/workflow-studio.css` (líneas 1798-1820 - estilos btn-rfq)

### 3. Backend: Servicio de Parser de Documentos

Se creó un servicio completo para procesar diferentes formatos de documentos:

**Archivo:** `server/services/rfqParser.js`

**Funcionalidades:**
- `extractTextFromPDF()` - Extrae texto de archivos PDF
- `extractTextFromWord()` - Extrae texto de archivos Word (.docx/.doc)
- `extractTextFromMarkdown()` - Procesa y limpia archivos Markdown
- `extractTextFromPlainText()` - Lee archivos de texto plano
- `parseTextToWorkflowSteps()` - Genera pasos de workflow desde texto
- `determineActionType()` - Identifica tipos de acciones basado en palabras clave
- `extractVariables()` - Detecta variables en el texto
- `parseRFQDocument()` - Función principal que orquesta el procesamiento

### 4. Backend: Endpoint API

**Endpoint:** `POST /api/workflows/parse-rfq`

**Descripción:** Recibe un documento via FormData y retorna un workflow generado

**Request:**
```javascript
const formData = new FormData()
formData.append('document', file)

fetch('/api/workflows/parse-rfq', {
  method: 'POST',
  body: formData
})
```

**Response:**
```json
{
  "success": true,
  "extractedText": "Texto extraído del documento...",
  "generatedSteps": [
    {
      "id": 1,
      "action": "browser_open",
      "label": "Abrir navegador",
      "url": ""
    },
    ...
  ],
  "variables": [
    {
      "name": "variableName",
      "value": "",
      "type": "string"
    }
  ],
  "workflowName": "Nombre Del Workflow"
}
```

**Archivos modificados:**
- `server/routes/workflows.js` (líneas 1-13 imports, 456-575 endpoint)

## Patrones de Reconocimiento

El parser reconoce automáticamente los siguientes patrones en el texto:

### Numeración de Pasos
- `1. Hacer algo`
- `Paso 1: Hacer algo`
- `Step 1: Do something`

### Acciones de Navegador Web
- Abrir navegador / Open browser → `browser_open`
- Navegar / Navigate / Ir a → `navigate`
- Hacer clic / Click → `click`
- Escribir / Type / Ingresar → `type`

### Control de Flujo
- Si / If → `if_condition`
- Para cada / For each → `for_each`
- Repetir / Loop / Mientras → `while_loop`
- Esperar / Wait → `delay`

### Variables
- Asignar / Assign / Establecer → `assign`

### Archivos
- Leer archivo / Read file → `read_file`
- Escribir archivo / Write file → `write_file`
- Copiar archivo / Copy file → `copy_file`

### Excel
- Excel + abrir → `excel_open`
- Excel + leer → `excel_read`
- Excel + escribir → `excel_write`

### Email
- Correo / Email / Enviar mensaje → `send_email`

### Base de Datos
- Consulta / Query / Base de datos → `db_query`

### Extracción de Variables
El parser detecta variables en estos formatos:
- `{variableName}`
- `$variableName`
- `[variableName]`

## Formatos Soportados

| Formato | Extensión | MIME Type | Estado |
|---------|-----------|-----------|---------|
| PDF | `.pdf` | `application/pdf` | Implementado (placeholder) |
| Word | `.docx`, `.doc` | `application/vnd.openxmlformats-officedocument.wordprocessingml.document` | Implementado (placeholder) |
| Markdown | `.md` | `text/markdown` | ✅ Completamente funcional |
| Texto Plano | `.txt` | `text/plain` | ✅ Completamente funcional |

## Ejemplo de Uso

### 1. Crear documento Markdown con el proceso

```markdown
# Proceso de Login Automatizado

1. Abrir navegador
2. Navegar a https://ejemplo.com/login
3. Escribir el usuario en el campo username
4. Escribir la contraseña en el campo password
5. Hacer clic en el botón de login
6. Esperar 2 segundos
7. Si aparece mensaje de bienvenida entonces proceso exitoso
```

### 2. Desde la UI

1. Abrir Workflow Studio
2. Click en botón "Desde RFQ" (icono PDF rojo)
3. Seleccionar el archivo .md
4. El sistema procesará y generará automáticamente los pasos del workflow

### 3. Resultado

El workflow generado contendrá 7 pasos correspondientes a cada línea del documento.

## Mejoras Futuras

### PDF Parser
- [ ] Integrar librería `pdf-parse` para extracción real de texto de PDFs
- [ ] Manejar PDFs con tablas y formateo complejo
- [ ] OCR para PDFs escaneados

### Word Parser
- [ ] Integrar librería `mammoth` para extracción de texto de Word
- [ ] Preservar formateo y estructura
- [ ] Soportar tablas y listas

### IA/NLP Enhancement
- [ ] Integrar modelo de IA para mejor comprensión del contexto
- [ ] Detectar parámetros automáticamente (URLs, selectores CSS, etc.)
- [ ] Generar descripciones más detalladas
- [ ] Validar coherencia del workflow generado

### UX Improvements
- [ ] Vista previa del texto extraído antes de generar
- [ ] Edición manual de pasos antes de importar
- [ ] Sugerencias de mejora del workflow
- [ ] Validación de sintaxis del documento

## Dependencias Necesarias (Futuras)

Para habilitar completamente PDF y Word parsing:

```bash
cd server
npm install pdf-parse mammoth
```

Luego actualizar las funciones en `server/services/rfqParser.js`:

```javascript
import pdfParse from 'pdf-parse'
import mammoth from 'mammoth'

async function extractTextFromPDF(filePath) {
  const buffer = await fs.readFile(filePath)
  const data = await pdfParse(buffer)
  return data.text
}

async function extractTextFromWord(filePath) {
  const result = await mammoth.extractRawText({ path: filePath })
  return result.value
}
```

## Testing

Para probar la funcionalidad:

1. Ejecutar el backend: `cd server && npm start`
2. Ejecutar el frontend: `npm run dev`
3. Navegar a http://localhost:4200
4. Ir a Workflow Studio
5. Crear un archivo .md o .txt con pasos de proceso
6. Usar el botón "Desde RFQ" para cargar el archivo
7. Verificar que se generen los pasos correctamente

## Notas Técnicas

- El endpoint maneja FormData manualmente sin dependencias adicionales
- Los archivos temporales se almacenan en `os.tmpdir()` y se eliminan automáticamente
- El límite de tamaño de archivo puede ajustarse en el endpoint
- La funcionalidad funciona tanto en ejecución local como en Docker

## Contribuir

Para agregar soporte para nuevos formatos o mejorar el parser:

1. Editar `server/services/rfqParser.js`
2. Agregar función de extracción para el nuevo formato
3. Actualizar `parseRFQDocument()` para manejar el nuevo MIME type
4. Agregar patrones de reconocimiento en `determineActionType()`
5. Actualizar esta documentación
