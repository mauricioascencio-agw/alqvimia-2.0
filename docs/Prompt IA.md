# Alqvimia IA - Sistema Completo de Interaccion con Inteligencia Artificial

## Indice

1. [Arquitectura General](#1-arquitectura-general)
2. [Modelos Utilizados](#2-modelos-utilizados)
3. [Endpoints de IA](#3-endpoints-de-ia)
4. [Prompts del Sistema](#4-prompts-del-sistema)
5. [Gestion de API Keys](#5-gestion-de-api-keys)
6. [Tracking de Uso](#6-tracking-de-uso)
7. [Chat Interactivo](#7-chat-interactivo)
8. [Generacion de Agentes desde Requerimientos](#8-generacion-de-agentes-desde-requerimientos)
9. [Analisis de Documentos](#9-analisis-de-documentos)
10. [Sistema de Migracion de Workflows](#10-sistema-de-migracion-de-workflows)
11. [Claude Agent Standalone](#11-claude-agent-standalone)
12. [Encriptacion y Seguridad](#12-encriptacion-y-seguridad)
13. [Costos y Precios](#13-costos-y-precios)
14. [Flujo Completo: De Archivo a Workflow](#14-flujo-completo-de-archivo-a-workflow)

---

## 1. Arquitectura General

```
+-------------------+       +-------------------+       +-------------------+
|   Frontend React  | <---> |  Backend Node.js  | <---> |   Anthropic API   |
|   (Puerto 4200)   |       |   (Puerto 4000)   |       |   (Claude Models) |
+-------------------+       +-------------------+       +-------------------+
        |                           |
        |                   +-------------------+
        |                   |   MySQL (Docker)  |
        |                   |   (Puerto 3307)   |
        |                   +-------------------+
        |                           |
        +-- src/services/api.js     +-- uso_api_ia (tracking)
        +-- src/views/AIDashboard   +-- api_keys (encrypted)
        +-- src/views/WorkflowsView +-- costos_modelos_ia (pricing)
```

### Archivos Clave

| Archivo | Funcion |
|---------|---------|
| `server/routes/ai.js` | Rutas backend de IA (generacion, analisis, chat) |
| `server/routes/apiKeys.js` | Gestion de API keys encriptadas |
| `server/services/aiUsageTracker.js` | Tracking de uso y costos |
| `server/services/agentProjectService.js` | Creacion de proyectos de agentes |
| `server/services/encryption.js` | Encriptacion AES-256-GCM |
| `src/services/api.js` | Servicio frontend (`aiService`) |
| `src/views/AIDashboardView.jsx` | Dashboard de IA con chat |
| `src/views/WorkflowsView.jsx` | Vista de workflows con IA integrada |
| `src/utils/workflowMigration.js` | Parsers de migracion multi-plataforma |
| `agents/ai/ClaudeAgent.js` | Agente Claude standalone |

---

## 2. Modelos Utilizados

| Modelo | Uso | Max Tokens |
|--------|-----|------------|
| `claude-3-sonnet-20240229` | Generacion de agentes, analisis de documentos | 4096 |
| `claude-sonnet-4-20250514` | Chat interactivo (ultima version) | 4096 |
| `claude-3-5-sonnet-20241022` | Agente standalone (configurable) | 4096 |

---

## 3. Endpoints de IA

### POST `/api/ai/generate-from-requirements`
**Proposito:** Generar agentes/workflows completos desde documentos de requerimientos.

- **Input:** Multipart form (archivo + tipo de agente + contexto adicional)
- **Modelo:** `claude-3-sonnet-20240229`
- **Output:** JSON con agente, workflow, documentacion, suposiciones y recomendaciones

### POST `/api/ai/analyze-document`
**Proposito:** Analizar documentos y extraer pasos de automatizacion.

- **Input:** Contenido del documento (texto)
- **Modelo:** `claude-3-sonnet-20240229`
- **Output:** JSON con resumen, pasos, variables y recomendaciones

### POST `/api/ai/chat`
**Proposito:** Chat interactivo con soporte de vision (imagenes).

- **Input:** `{ message, images (base64), history }`
- **Modelo:** `claude-sonnet-4-20250514`
- **Output:** `{ response, usage { inputTokens, outputTokens }, provider, model, responseTime }`

### GET `/api/ai/status`
**Proposito:** Estado de configuracion de IA.

- **Output:** Estado de configuracion, fuente de API key, resumen de uso (30 dias)

---

## 4. Prompts del Sistema

### 4.1 Prompt: Generacion de Agentes desde Requerimientos

```
Eres un experto en automatizacion RPA y desarrollo de agentes inteligentes.
Tu tarea es analizar documentos de requerimientos y generar la estructura de un
agente/workflow de automatizacion.

IMPORTANTE: Responde SIEMPRE en formato JSON valido con la siguiente estructura:
{
  "agent": {
    "id": "agent_xxx",
    "name": "Nombre descriptivo del agente",
    "description": "Descripcion detallada de lo que hace",
    "category": "sat|retail|rh|finanzas|operaciones|custom",
    "capabilities": ["cap1", "cap2", "cap3"],
    "requirements": [
      {
        "type": "credential|integration|data",
        "name": "nombre",
        "description": "desc",
        "required": true
      }
    ],
    "triggers": [
      {
        "type": "schedule|webhook|manual",
        "config": {}
      }
    ],
    "estimatedDevelopmentTime": "X horas/dias",
    "complexity": "low|medium|high"
  },
  "workflow": {
    "id": "wf_xxx",
    "name": "Nombre del workflow",
    "description": "Descripcion",
    "variables": {
      "var1": {
        "type": "string",
        "default": "",
        "description": "desc"
      }
    },
    "steps": [
      {
        "id": "step_1",
        "type": "tipo_de_accion",
        "label": "Descripcion",
        "properties": {}
      }
    ],
    "errorHandling": {
      "onError": "stop|continue|retry",
      "maxRetries": 3,
      "notifyOnError": true
    }
  },
  "documentation": "Documentacion en formato Markdown",
  "assumptions": ["Suposicion 1"],
  "recommendations": ["Recomendacion 1"]
}
```

**Contexto del usuario enviado junto al prompt:**
- Contenido del archivo de requerimientos
- Tipo de agente seleccionado
- Contexto adicional proporcionado por el usuario

---

### 4.2 Prompt: Analisis de Documentos y Generacion de Pasos

```
Eres un experto en automatizacion RPA (Robotic Process Automation).
Tu tarea es analizar documentos de requerimientos o especificaciones de procesos
y extraer los pasos necesarios para crear un workflow de automatizacion.

IMPORTANTE: Responde SIEMPRE en formato JSON valido con esta estructura exacta:
{
  "summary": "Resumen breve del proceso descrito en 1-2 oraciones",
  "steps": [
    {
      "action": "tipo_accion",
      "icon": "fa-icon-name",
      "label": "Descripcion clara del paso",
      "params": {}
    }
  ],
  "variables": [
    {
      "name": "nombreVariable",
      "type": "string|number|boolean|array|file",
      "description": "Descripcion"
    }
  ],
  "recommendations": ["Recomendacion 1", "Recomendacion 2"]
}

TIPOS DE ACCIONES DISPONIBLES:
- browser_open, navigate, click, type, delay
- if_condition, for_each, while_loop
- excel_open, excel_read, excel_write
- file_read, file_write, send_email
- db_query, api_call, assign, comment
```

**Tipos de acciones reconocidas por el sistema:**

| Accion | Icono | Descripcion |
|--------|-------|-------------|
| `browser_open` | `fa-globe` | Abrir navegador |
| `navigate` | `fa-compass` | Navegar a URL |
| `click` | `fa-mouse-pointer` | Click en elemento |
| `type` | `fa-keyboard` | Escribir texto |
| `delay` | `fa-clock` | Espera/delay |
| `if_condition` | `fa-code-branch` | Condicion IF |
| `for_each` | `fa-repeat` | Bucle FOR |
| `while_loop` | `fa-sync` | Bucle WHILE |
| `excel_open` | `fa-file-excel` | Abrir Excel |
| `excel_read` | `fa-table` | Leer Excel |
| `excel_write` | `fa-edit` | Escribir Excel |
| `file_read` | `fa-file` | Leer archivo |
| `file_write` | `fa-save` | Escribir archivo |
| `send_email` | `fa-envelope` | Enviar email |
| `db_query` | `fa-database` | Consulta BD |
| `api_call` | `fa-plug` | Llamada API |
| `assign` | `fa-equals` | Asignar variable |
| `comment` | `fa-comment` | Comentario |

---

### 4.3 Prompt: Chat Interactivo (Alqvimia IA)

```
Eres Alqvimia IA, un asistente experto en automatizacion RPA, analisis de datos,
y productividad empresarial.
Responde siempre en espanol de forma clara y profesional.
Puedes analizar imagenes, generar textos, codigo, analisis, resumenes y mas.
Usa formato Markdown para estructurar tus respuestas cuando sea apropiado.
Si el usuario pega una imagen, analizala detalladamente.
```

**Caracteristicas del chat:**
- Soporte de texto + imagenes (vision)
- Historial de conversacion (ultimos 20 mensajes)
- Respuestas en formato Markdown
- Analisis detallado de imagenes pegadas

---

## 5. Gestion de API Keys

### Endpoints

| Metodo | Ruta | Funcion |
|--------|------|---------|
| `GET` | `/api/api-keys` | Listar todas las API keys (enmascaradas) |
| `GET` | `/api/api-keys/:provider` | Obtener key activa por proveedor |
| `POST` | `/api/api-keys` | Guardar API key encriptada |
| `PUT` | `/api/api-keys/:id` | Actualizar API key |
| `DELETE` | `/api/api-keys/:id` | Eliminar API key |
| `POST` | `/api/api-keys/test/:provider` | Probar conexion de API key |

### Validacion de Keys

| Proveedor | Prefijo | Longitud Minima |
|-----------|---------|-----------------|
| Anthropic | `sk-ant-` | 20+ caracteres |
| OpenAI | `sk-` | 20+ caracteres |

### Encriptacion
- **Algoritmo:** AES-256-GCM
- **IV:** 16 bytes (Initialization Vector)
- **Auth Tag:** 16 bytes
- **Derivacion de clave:** SHA256
- **Funciones:** `encrypt(text)`, `decrypt(encryptedText)`, `maskApiKey(key)`

---

## 6. Tracking de Uso

### Funcion `trackUsage()`

Registra cada llamada a la API de IA:

```javascript
{
  userId,          // ID del usuario
  apiKeyId,        // ID de la API key utilizada
  provider,        // "anthropic" | "openai"
  model,           // Modelo utilizado
  endpoint,        // Endpoint llamado
  inputTokens,     // Tokens de entrada
  outputTokens,    // Tokens de salida
  responseTimeMs,  // Tiempo de respuesta
  status,          // "success" | "error"
  errorMessage,    // Mensaje de error (si aplica)
  metadata         // Metadatos adicionales (JSON)
}
```

### Funcion `getUsageSummary(userId, period)`

Retorna resumen agregado:

```javascript
{
  totalRequests,    // Total de peticiones
  totalTokens,      // Total de tokens consumidos
  totalCost,        // Costo total estimado
  avgResponseTime,  // Tiempo de respuesta promedio
  successRate       // Tasa de exito (%)
}
```

**Periodos disponibles:** `24h`, `7d`, `30d` (default)

### Endpoints de Uso

| Metodo | Ruta | Funcion |
|--------|------|---------|
| `GET` | `/api/api-keys/usage/stats` | Uso agregado por modelo/periodo |
| `GET` | `/api/api-keys/usage/history` | Historial individual con paginacion |
| `GET` | `/api/api-keys/models/costs` | Precios actuales de modelos |

### Tabla MySQL: `uso_api_ia`

```sql
usuario_id, api_key_id, provider, modelo, endpoint,
tokens_entrada, tokens_salida, tokens_total,
costo_estimado, tiempo_respuesta_ms,
estado (success|error), error_mensaje,
metadata (JSON), created_at
```

---

## 7. Chat Interactivo

### Frontend: AIDashboardView.jsx

**Plantillas Rapidas:**

| Plantilla | Descripcion |
|-----------|-------------|
| Analisis de imagen | Analizar imagenes pegadas o adjuntadas |
| Generacion de texto | Crear contenido textual |
| Resumen | Resumir documentos o textos largos |
| Generacion de codigo | Escribir codigo en cualquier lenguaje |
| Traduccion | Traducir textos entre idiomas |
| Explicacion | Explicar conceptos o codigo |
| Creacion de workflow | Generar pasos de workflow |
| Analisis de datos | Analizar datasets y metricas |

**Soporte de Imagenes:**
- Pegar desde portapapeles (Ctrl+V)
- Adjuntar archivos de imagen
- Codificacion base64 para envio a la API

**Gestion de Sesiones:**
- Guardar/cargar sesiones de chat (localStorage)
- Maximo 20 sesiones almacenadas
- Exportar en: TXT, Markdown, HTML, JSON

**Informacion Mostrada por Mensaje:**
- Tokens de entrada/salida
- Modelo utilizado
- Tiempo de respuesta

### Servicio Frontend: `aiService`

```javascript
const aiService = {
  loadConfig: () => api.get('/api/ai-config/load'),
  saveConfig: (config) => api.post('/api/ai-config/save', config),
  testConnection: (provider) => api.post('/api/ai-config/test', provider),
  chat: (message, images, history) => api.post('/api/ai/chat', {
    message,
    images,
    history
  }),
  status: () => api.get('/api/ai/status')
};
```

---

## 8. Generacion de Agentes desde Requerimientos

### Flujo Completo

```
1. Usuario sube archivo de requerimientos
   |
2. POST /api/ai/generate-from-requirements (multipart)
   |
3. Backend lee contenido del archivo
   (.txt, .md, .json, .csv, .pdf metadata)
   |
4. Llama a Claude API con:
   - System prompt: Experto RPA
   - User prompt: Requerimientos + tipo agente + contexto
   - Modelo: claude-3-sonnet-20240229
   - Max tokens: 4096
   |
5. Extrae JSON de la respuesta con regex: /\{[\s\S]*\}/
   |
6. Crea proyecto de agente via agentProjectService:
   - Crea estructura de carpetas
   - Guarda archivos de requerimientos
   - Genera documentacion
   - Guarda workflow JSON
   |
7. Retorna al frontend:
   - Metadata del agente generado
   - Estructura del workflow
   - Documentacion
   - Rutas del proyecto
   |
8. Frontend muestra modal de generacion
   con pasos del workflow y variables
```

### Estructura de Proyecto Generada

```
NombreProyecto/
├── requirements/        # Documentos de requerimientos originales
│   └── uploads/        # Archivos subidos
├── config/             # Configuracion del agente
│   ├── agent.config.json
│   └── project.meta.json
├── workflows/          # Workflows generados
├── data/
│   ├── input/         # Archivos de entrada
│   ├── output/        # Archivos de salida
│   └── temp/          # Archivos temporales
├── logs/              # Logs de ejecucion
├── resources/         # Recursos adicionales
├── docs/              # Documentacion
│   ├── ESTRUCTURA_PROYECTO.md
│   ├── REQUERIMIENTOS.md
│   ├── CONEXIONES.md
│   ├── AI_ANALYSIS.json
│   └── ANALISIS_IA.md
├── tests/             # Suite de pruebas
└── backups/           # Respaldos
```

---

## 9. Analisis de Documentos

### Deteccion Automatica de Patrones

El prompt de analisis detecta automaticamente:

- **Navegacion:** URLs, "ir a", "abrir pagina"
- **Clicks:** "hacer click", "presionar", "seleccionar"
- **Escritura:** "escribir", "ingresar", "llenar campo"
- **Condiciones:** "si... entonces", "verificar que"
- **Bucles:** "para cada", "repetir", "mientras"
- **Variables:** texto entre `{llaves}` o con prefijo `$variable`

### Formato de Respuesta Esperado

```json
{
  "summary": "Proceso de facturacion automatizada en portal SAT",
  "steps": [
    {
      "action": "browser_open",
      "icon": "fa-globe",
      "label": "Abrir navegador Chrome",
      "params": { "browser": "chrome" }
    },
    {
      "action": "navigate",
      "icon": "fa-compass",
      "label": "Ir al portal del SAT",
      "params": { "url": "https://portal.sat.gob.mx" }
    },
    {
      "action": "type",
      "icon": "fa-keyboard",
      "label": "Ingresar RFC",
      "params": { "selector": "#rfc", "value": "{rfc}" }
    }
  ],
  "variables": [
    {
      "name": "rfc",
      "type": "string",
      "description": "RFC del contribuyente"
    }
  ],
  "recommendations": [
    "Agregar manejo de errores para timeout del portal",
    "Implementar reintentos en caso de fallo de conexion"
  ]
}
```

---

## 10. Sistema de Migracion de Workflows

### Parsers Disponibles

| Parser | Extension | Plataforma | Tecnologias Detectadas |
|--------|-----------|------------|----------------------|
| `parseUiPathXaml()` | `.xaml` | UiPath | Activities XML (DOMParser) |
| `parsePowerAutomate()` | `.json` | Power Automate | Definicion JSON |
| `parsePythonScript()` | `.py` | Python | Selenium, Playwright, requests |
| `parseJavaScript()` | `.js`, `.ts` | JavaScript | Puppeteer, Playwright, fetch |
| `parseCSharp()` | `.cs` | C#/.NET | Selenium, HttpClient |
| `parseBluePrism()` | `.xml` | Blue Prism | Process XML |
| `parseRPAPlatform()` | `.json` | RPA Platform | Definicion JSON |
| `parseGenericCode()` | `.*` | Universal | Patrones genericos |

### Funcion Principal

```javascript
autoParseFile(content, fileName)
// Auto-detecta el parser correcto por extension de archivo
// Retorna: { steps, variables, summary }
```

### Utilidades

```javascript
addDelaysBetweenSteps(steps, seconds)
// Inserta delays de X segundos entre cada paso de accion
```

### Extensiones de Archivo Aceptadas

`.xaml`, `.xml`, `.json`, `.js`, `.ts`, `.py`, `.cs`, `.java`, `.rb`, `.go`, `.php`, `.sh`, `.ps1`, `.txt`

### Opciones del Modal (Paso 1)

1. UiPath
2. Power Automate
3. RPA Platform
4. Blue Prism
5. Python
6. JavaScript
7. C#/.NET
8. Cualquier Codigo

---

## 11. Claude Agent Standalone

### Archivo: `agents/ai/ClaudeAgent.js`

**Configuracion por defecto:**

```javascript
{
  model: "claude-3-5-sonnet-20241022",  // Configurable
  maxTokens: 4096,                       // Configurable
  temperature: 0.7                       // Configurable
}
```

**Capacidades:** chat, completion, vision, tools, streaming, system-prompts

### Rutas del Agente

| Metodo | Ruta | Funcion |
|--------|------|---------|
| `POST` | `/message` | Mensaje simple |
| `POST` | `/chat/:conversationId` | Conversacion con historial |
| `POST` | `/vision` | Analisis de imagenes |
| `POST` | `/tools` | Uso de herramientas |
| `POST` | `/stream` | Respuestas en streaming |
| `GET` | `/models` | Modelos disponibles |
| `GET` | `/usage` | Estadisticas de uso |

---

## 12. Encriptacion y Seguridad

### Configuracion

```javascript
{
  algorithm: "aes-256-gcm",
  ivLength: 16,       // bytes
  authTagLength: 16,  // bytes
  keyDerivation: "SHA256"
}
```

### Funciones Disponibles

| Funcion | Input | Output |
|---------|-------|--------|
| `encrypt(text)` | Texto plano | String base64 encriptado |
| `decrypt(encryptedText)` | String base64 | Texto plano original |
| `maskApiKey(key)` | API key completa | Primeros 10 + ultimos 6 caracteres |
| `validateAnthropicKey(key)` | API key | Boolean |
| `validateOpenAIKey(key)` | API key | Boolean |

---

## 13. Costos y Precios

### Tabla MySQL: `costos_modelos_ia`

```sql
CREATE TABLE costos_modelos_ia (
  id INT PRIMARY KEY AUTO_INCREMENT,
  provider VARCHAR(50),
  modelo VARCHAR(100),
  costo_input_por_millon DECIMAL(10,4),
  costo_output_por_millon DECIMAL(10,4),
  max_tokens INT,
  activo BOOLEAN DEFAULT true
);
```

### Precios por Defecto

| Proveedor | Modelo | Input/1M tokens | Output/1M tokens | Max Tokens |
|-----------|--------|-----------------|-------------------|------------|
| Anthropic | claude-3-sonnet | $3.00 | $15.00 | 200,000 |
| Anthropic | claude-sonnet-4 | Variable | Variable | 200,000 |
| OpenAI | gpt-4 | Variable | Variable | 8,000 |

**Cache de costos:** 5 minutos (para evitar consultas repetidas a BD)

---

## 14. Flujo Completo: De Archivo a Workflow

### Diagrama de Secuencia

```
Usuario                Frontend              Backend               Claude API
  |                      |                     |                      |
  |-- Sube archivo ----->|                     |                      |
  |                      |-- POST /generate -->|                      |
  |                      |                     |-- Lee archivo        |
  |                      |                     |-- Construye prompt   |
  |                      |                     |-- POST /messages --->|
  |                      |                     |                      |
  |                      |                     |<-- JSON response ----|
  |                      |                     |-- Parsea JSON        |
  |                      |                     |-- Crea proyecto      |
  |                      |                     |-- Guarda docs        |
  |                      |                     |-- trackUsage()       |
  |                      |<-- Resultado -------|                      |
  |                      |                     |                      |
  |<-- Modal con pasos --|                     |                      |
  |                      |                     |                      |
  |-- "Crear Workflow" ->|                     |                      |
  |                      |-- setWorkflowSteps  |                      |
  |                      |-- registerCustom    |                      |
  |                      |                     |                      |
  |<-- Workflow listo ---|                     |                      |
```

### Acciones Post-Generacion

1. **"Crear Workflow en Alqvimia"** - Aplica los pasos directamente al editor de workflows usando `setWorkflowSteps` y registra componentes custom
2. **"Guardar en Carpeta"** - Guarda via API:
   - `POST /api/workflows` (crea el workflow)
   - `POST /api/workflows/meta/folders` (asigna carpeta)

---

## Resumen de Capacidades

El sistema de IA de Alqvimia permite:

- **Generar agentes/workflows** completos desde documentos de requerimientos en lenguaje natural
- **Analizar documentos** y extraer pasos de automatizacion estructurados
- **Chat interactivo** con soporte de imagenes (vision) para consultas generales
- **Migrar workflows** desde multiples plataformas RPA (UiPath, Power Automate, Blue Prism, etc.)
- **Parsear codigo** en multiples lenguajes (Python, JavaScript, C#) y convertirlo a pasos RPA
- **Trackear uso** de API con costos estimados y metricas de rendimiento
- **Gestionar API keys** de forma segura con encriptacion AES-256-GCM
- **Exportar conversaciones** en multiples formatos (TXT, MD, HTML, JSON)
- **Mantener historial** de conversaciones con sesiones guardadas
