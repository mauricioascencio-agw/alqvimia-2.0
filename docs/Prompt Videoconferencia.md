# Alqvimia RPA 2.0 - Sistema de Videoconferencia

## Indice

1. [Resumen General](#1-resumen-general)
2. [Arquitectura y Stack Tecnologico](#2-arquitectura-y-stack-tecnologico)
3. [Estructura de Archivos](#3-estructura-de-archivos)
4. [Como se Creo](#4-como-se-creo)
5. [Como Funciona](#5-como-funciona)
   - 5.1 [Gestion de Estado](#51-gestion-de-estado)
   - 5.2 [Captura de Media (Camara y Microfono)](#52-captura-de-media-camara-y-microfono)
   - 5.3 [Grabacion de Video](#53-grabacion-de-video)
   - 5.4 [Compartir Pantalla](#54-compartir-pantalla)
   - 5.5 [Transcripcion en Tiempo Real](#55-transcripcion-en-tiempo-real)
   - 5.6 [Chat de la Sesion](#56-chat-de-la-sesion)
   - 5.7 [Notas de la Sesion](#57-notas-de-la-sesion)
   - 5.8 [Panel de IA](#58-panel-de-ia)
6. [Interfaz de Usuario](#6-interfaz-de-usuario)
   - 6.1 [Layout Principal](#61-layout-principal)
   - 6.2 [Controles de Video](#62-controles-de-video)
   - 6.3 [Sidebar con Pestanas](#63-sidebar-con-pestanas)
   - 6.4 [Modal de Guardar Grabacion](#64-modal-de-guardar-grabacion)
7. [Entregables Generados](#7-entregables-generados)
8. [Estilos y Tema Visual](#8-estilos-y-tema-visual)
9. [Integracion con la App Principal](#9-integracion-con-la-app-principal)
10. [Estado Actual y Limitaciones](#10-estado-actual-y-limitaciones)
11. [Hoja de Ruta para Multi-Usuario](#11-hoja-de-ruta-para-multi-usuario)

---

## 1. Resumen General

El sistema de Videoconferencia de Alqvimia es una interfaz de videollamada construida **100% en el frontend** usando APIs nativas del navegador. Permite:

- Iniciar sesiones de video con camara y microfono
- Grabar la sesion completa en formato WebM
- Compartir pantalla
- Transcripcion en tiempo real (Speech-to-Text)
- Chat en vivo durante la sesion
- Tomar notas de la reunion
- Generar entregables automaticos (minutas, transcripcion, diagramas Mermaid)
- Descargar la grabacion en multiples formatos

### Tecnologias Nativas del Navegador Utilizadas

| API del Navegador | Funcion |
|-------------------|---------|
| `MediaDevices.getUserMedia()` | Captura de camara y microfono |
| `MediaDevices.getDisplayMedia()` | Compartir pantalla |
| `MediaRecorder` | Grabacion de video/audio |
| `Web Speech API` | Transcripcion de voz a texto |
| `Blob API` | Manejo de archivos de video |
| `localStorage` | Persistencia de datos de sesion |

---

## 2. Arquitectura y Stack Tecnologico

```
+----------------------------------------------+
|              NAVEGADOR (Cliente)              |
|                                              |
|  +------------------+  +------------------+  |
|  | VideoConference  |  |    VCSidebar     |  |
|  |    View.jsx      |  |    .jsx          |  |
|  | (1,141 lineas)   |  |  (252 lineas)   |  |
|  +------------------+  +------------------+  |
|           |                     |            |
|  +------------------------------------------+|
|  |         APIs Nativas del Navegador       ||
|  |  getUserMedia | getDisplayMedia          ||
|  |  MediaRecorder | SpeechRecognition       ||
|  +------------------------------------------+|
|                                              |
|  +------------------------------------------+|
|  |         CSS (2,560 + 122 lineas)         ||
|  |  video-conference.css                    ||
|  |  video-conference-save-config.css        ||
|  +------------------------------------------+|
+----------------------------------------------+
              |
              | (Actualmente NO conectado)
              v
+----------------------------------------------+
|           BACKEND (Futuro)                   |
|  - Socket.IO Signaling Server               |
|  - WebRTC STUN/TURN                         |
|  - Room Management                          |
|  - Database Persistence                     |
+----------------------------------------------+
```

### Dependencias

| Paquete | Version | Uso |
|---------|---------|-----|
| React | 18.2.0 | Framework UI |
| socket.io-client | 4.6.1 | Importado pero NO usado activamente para video |

---

## 3. Estructura de Archivos

```
src/
├── views/
│   └── VideoConferenceView.jsx          # Vista principal (1,141 lineas)
├── components/videoConference/
│   ├── index.js                         # Export del modulo
│   ├── VideoConferenceView.jsx          # Vista alternativa simplificada (284 lineas)
│   └── VCSidebar/
│       └── VCSidebar.jsx                # Componente sidebar (252 lineas)
├── assets/css/
│   ├── video-conference.css             # Estilos principales (2,560 lineas)
│   └── video-conference-save-config.css # Estilos del modal de guardado (122 lineas)
├── context/
│   └── LanguageContext.jsx              # Traducciones (es/en/pt)
└── App.jsx                              # Routing y acceso rapido (linea 16, 186, 208)
```

---

## 4. Como se Creo

### Enfoque de Desarrollo

La videoconferencia se construyo como un **modulo React autocontenido** que depende exclusivamente de APIs nativas del navegador, sin librerias externas de WebRTC. Esto significa:

1. **Sin PeerJS ni Simple Peer** - No se usan librerias de abstraccion WebRTC
2. **Sin servidor de senalizacion** - No hay intercambio de SDP offer/answer
3. **Sin STUN/TURN** - No hay traversal de NAT
4. **Frontend puro** - Toda la logica vive en el navegador

### Patron de Arquitectura

```
VideoConferenceView (Vista Principal)
├── Estado (useState hooks)
│   ├── isInSession, sessionTime
│   ├── isMuted, isVideoOff, isScreenSharing
│   ├── isRecording, recordedBlob
│   ├── chatMessages, notes, transcript
│   └── saveFormats, generateDeliverables
├── Refs (useRef hooks)
│   ├── videoRef (elemento <video>)
│   ├── streamRef (MediaStream actual)
│   ├── mediaRecorderRef (grabador)
│   └── recordedChunksRef (chunks de video)
├── Funciones de Media
│   ├── startSession()
│   ├── endSession()
│   ├── toggleMute()
│   ├── toggleVideo()
│   ├── toggleScreenShare()
│   ├── startRecording()
│   └── stopRecording()
├── Funciones de Colaboracion
│   ├── handleSendMessage()
│   ├── handleAddNote()
│   └── initSpeechRecognition()
├── Funciones de Entregables
│   ├── generateMinutes()
│   ├── generateMermaidDiagram()
│   ├── saveRecording()
│   └── downloadDeliverables()
└── UI
    ├── Header (titulo, timer, participantes)
    ├── Video Grid (video principal + thumbnails)
    ├── Controls Bar (botones de control)
    ├── Sidebar (pestanas: participantes, chat, notas, transcripcion, IA)
    └── Save Modal (formatos, entregables, email)
```

### Integracion en App.jsx

```javascript
// Importacion (linea 16)
import VideoConferenceView from './views/VideoConferenceView'

// Routing (linea 186)
case 'videoconference': return <VideoConferenceView />

// Boton de acceso rapido en el header (linea 208)
<button onClick={() => setCurrentView('videoconference')}>
  <i className="fas fa-video"></i>
</button>
```

### Soporte Multi-idioma

```javascript
// LanguageContext.jsx
nav_videoconference: {
  es: "Videoconferencia",
  en: "Video Conference",
  pt: "Videoconferência"
}
```

---

## 5. Como Funciona

### 5.1 Gestion de Estado

#### Estados de Sesion

```javascript
const [isInSession, setIsInSession] = useState(false)     // Sesion activa/inactiva
const [sessionTime, setSessionTime] = useState(0)          // Tiempo transcurrido (segundos)
const [participants, setParticipants] = useState([         // Participantes locales
  { id: 1, name: 'Tú', isMuted: false, isVideoOff: false, isHost: true }
])
```

#### Estados de Media

```javascript
const [isMuted, setIsMuted] = useState(false)              // Microfono silenciado
const [isVideoOff, setIsVideoOff] = useState(false)        // Camara apagada
const [isScreenSharing, setIsScreenSharing] = useState(false) // Compartiendo pantalla
const [isRecording, setIsRecording] = useState(false)      // Grabando
```

#### Estados de Colaboracion

```javascript
const [chatMessages, setChatMessages] = useState([])       // Historial de chat
const [notes, setNotes] = useState([])                     // Notas de sesion
const [transcript, setTranscript] = useState([])           // Transcripcion en tiempo real
```

#### Estados de Grabacion y Entregables

```javascript
const [recordedBlob, setRecordedBlob] = useState(null)     // Blob del video grabado
const [sessionData, setSessionData] = useState(null)        // Metadata de sesion

const [saveFormats, setSaveFormats] = useState({
  webm: true,    // Formato original (VP9/VP8)
  mp4: false,    // Renombrado del cliente
  mp3: false     // Solo audio
})

const [generateDeliverables, setGenerateDeliverables] = useState({
  videoAnalysis: true,   // Analisis del video en Markdown
  transcript: true,      // Transcripcion completa
  minutes: true,         // Minuta de la reunion
  asIs: true,           // Diagrama estado actual (Mermaid)
  toBe: true,           // Diagrama estado futuro (Mermaid)
  sendEmail: false      // Enviar por correo
})
```

#### Referencias (Refs)

```javascript
const videoRef = useRef(null)              // Elemento <video> del DOM
const streamRef = useRef(null)             // MediaStream activo
const mediaRecorderRef = useRef(null)      // Instancia de MediaRecorder
const recordedChunksRef = useRef([])       // Array de Blob chunks
```

---

### 5.2 Captura de Media (Camara y Microfono)

#### Iniciar Sesion

```javascript
const startSession = async () => {
  try {
    // Solicitar acceso a camara y microfono
    const stream = await navigator.mediaDevices.getUserMedia({
      video: {
        width: { ideal: 1280 },
        height: { ideal: 720 },
        facingMode: 'user'         // Camara frontal
      },
      audio: true
    })

    // Guardar referencia del stream
    streamRef.current = stream
    setIsInSession(true)

    // Asignar al elemento <video> (con delay para asegurar render)
    setTimeout(() => {
      if (videoRef.current) {
        videoRef.current.srcObject = stream
      }
    }, 100)
  } catch (error) {
    console.error('Error al acceder a la camara:', error)
  }
}
```

**Detalles:**
- Solicita video a **1280x720** (HD)
- Usa camara **frontal** (`facingMode: 'user'`)
- Captura **video + audio** simultaneamente
- Usa `setTimeout` para asegurar que el DOM este listo

#### Finalizar Sesion

```javascript
const endSession = () => {
  // Detener todos los tracks para liberar hardware
  if (videoRef.current?.srcObject) {
    const tracks = videoRef.current.srcObject.getTracks()
    tracks.forEach((track) => track.stop())
  }

  // Limpiar estado
  setIsInSession(false)
  setIsRecording(false)
  setIsScreenSharing(false)
}
```

**Detalles:**
- **Detiene TODOS los tracks** (video + audio)
- **Libera la camara y el microfono** del navegador
- Resetea todos los estados de media

#### Silenciar/Activar Microfono

```javascript
const toggleMute = () => {
  if (streamRef.current) {
    const audioTracks = streamRef.current.getAudioTracks()
    audioTracks.forEach(track => {
      track.enabled = !track.enabled
    })
    setIsMuted(!isMuted)
  }
}
```

#### Encender/Apagar Camara

```javascript
const toggleVideo = () => {
  if (streamRef.current) {
    const videoTracks = streamRef.current.getVideoTracks()
    videoTracks.forEach(track => {
      track.enabled = !track.enabled
    })
    setIsVideoOff(!isVideoOff)
  }
}
```

---

### 5.3 Grabacion de Video

#### Iniciar Grabacion

```javascript
const startRecording = () => {
  recordedChunksRef.current = []

  // Negociacion de codecs con fallback
  const options = { mimeType: 'video/webm;codecs=vp9,opus' }

  if (!MediaRecorder.isTypeSupported(options.mimeType)) {
    options.mimeType = 'video/webm;codecs=vp8,opus'     // Fallback 1
  }
  if (!MediaRecorder.isTypeSupported(options.mimeType)) {
    options.mimeType = 'video/webm'                       // Fallback 2
  }

  // Crear grabador
  const mediaRecorder = new MediaRecorder(streamRef.current, options)

  // Recolectar datos cada segundo
  mediaRecorder.ondataavailable = (event) => {
    if (event.data.size > 0) {
      recordedChunksRef.current.push(event.data)
    }
  }

  // Al detener, crear Blob y mostrar modal de guardado
  mediaRecorder.onstop = () => {
    const blob = new Blob(recordedChunksRef.current, { type: 'video/webm' })
    setRecordedBlob(blob)
    setShowSaveModal(true)
  }

  mediaRecorder.start(1000)   // Chunk cada 1000ms
  mediaRecorderRef.current = mediaRecorder
  setIsRecording(true)
}
```

**Jerarquia de Codecs:**

| Prioridad | Codec | Soporte |
|-----------|-------|---------|
| 1 (preferido) | VP9 + Opus | Chrome 61+, Firefox 68+, Edge 79+ |
| 2 (fallback) | VP8 + Opus | Chrome 47+, Firefox 29+, Edge 79+ |
| 3 (generico) | WebM basico | Todos los navegadores modernos |

#### Detener Grabacion

```javascript
const stopRecording = () => {
  if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
    mediaRecorderRef.current.stop()
    setIsRecording(false)
  }
}
```

#### Descargar Grabacion

```javascript
const downloadRecording = (format) => {
  if (!recordedBlob) return

  const url = URL.createObjectURL(recordedBlob)
  const a = document.createElement('a')
  a.href = url

  switch (format) {
    case 'webm': a.download = `${sessionTitle}_video.webm`; break
    case 'mp4':  a.download = `${sessionTitle}_video.mp4`;  break
    case 'mp3':  a.download = `${sessionTitle}_audio.mp3`;  break
  }

  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}
```

---

### 5.4 Compartir Pantalla

```javascript
const toggleScreenShare = async () => {
  try {
    if (isScreenSharing) {
      // === DETENER compartir pantalla ===
      const videoTrack = streamRef.current.getVideoTracks()[0]
      if (videoTrack) videoTrack.stop()

      // Volver a la camara
      const newStream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true
      })
      streamRef.current = newStream
      if (videoRef.current) videoRef.current.srcObject = newStream
      setIsScreenSharing(false)

    } else {
      // === INICIAR compartir pantalla ===
      const screenStream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: true   // Capturar audio del sistema si disponible
      })

      streamRef.current = screenStream
      if (videoRef.current) videoRef.current.srcObject = screenStream
      setIsScreenSharing(true)

      // Detectar cuando el usuario detiene desde el UI del navegador
      screenStream.getVideoTracks()[0].onended = () => {
        setIsScreenSharing(false)
        startSession()   // Reiniciar camara automaticamente
      }
    }
  } catch (error) {
    console.error('Error al compartir pantalla:', error)
  }
}
```

**Flujo:**

```
Usuario hace clic en "Compartir Pantalla"
  |
  +--> El navegador muestra dialogo de seleccion:
  |    - Pantalla completa
  |    - Ventana especifica
  |    - Pestana del navegador
  |
  +--> Se reemplaza el track de video por el de pantalla
  |
  +--> Si el usuario detiene desde el boton del navegador:
       +--> Se detecta via onended
       +--> Se reinicia la camara automaticamente
```

---

### 5.5 Transcripcion en Tiempo Real

```javascript
const initSpeechRecognition = useCallback(() => {
  // Obtener API (con prefijo webkit para Chrome/Safari)
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition

  if (!SpeechRecognition) {
    console.warn('Speech Recognition no soportado')
    return
  }

  const recognition = new SpeechRecognition()

  // Configuracion
  recognition.continuous = true       // No detenerse despues de silencio
  recognition.interimResults = true   // Mostrar resultados parciales
  recognition.lang = 'es-ES'          // Idioma espanol

  // Procesar resultados
  recognition.onresult = (event) => {
    const results = event.results
    for (let i = event.resultIndex; i < results.length; i++) {
      if (results[i].isFinal) {       // Solo resultados finales (alta confianza)
        const text = results[i][0].transcript
        setTranscript(prev => [...prev, {
          speaker: 'Participante',
          text: text.trim(),
          timestamp: new Date().toISOString()
        }])
      }
    }
  }

  // Auto-reiniciar si no detecta voz
  recognition.onerror = (event) => {
    if (event.error === 'no-speech') {
      recognition.start()
    }
  }

  // Auto-reiniciar cuando se detiene
  recognition.onend = () => {
    if (isInSession) {
      recognition.start()
    }
  }

  recognition.start()
}, [isInSession])
```

**Estructura de un Registro de Transcripcion:**

```javascript
{
  speaker: "Participante",             // Etiqueta del hablante
  text: "Texto reconocido por voz",    // Contenido transcrito
  timestamp: "2026-02-11T10:30:00Z"    // Marca de tiempo ISO
}
```

**Caracteristicas:**
- Modo **continuo** (no se detiene con silencios)
- Solo guarda resultados **finales** (alta precision)
- Se **auto-reinicia** en caso de error o fin
- Idioma fijo: **espanol (es-ES)**
- No distingue entre hablantes (todos son "Participante")

---

### 5.6 Chat de la Sesion

#### Estructura del Mensaje

```javascript
{
  id: Date.now(),                       // ID unico (timestamp)
  user: 'Tu',                          // Nombre del usuario
  message: "Texto del mensaje",        // Contenido
  timestamp: new Date().toISOString()  // Marca de tiempo
}
```

#### Enviar Mensaje

```javascript
const handleSendMessage = () => {
  if (chatInput.trim()) {
    setChatMessages([...chatMessages, {
      id: Date.now(),
      user: 'Tu',
      message: chatInput,
      timestamp: new Date().toISOString()
    }])
    setChatInput('')
  }
}
```

**Caracteristicas:**
- Almacenamiento local (solo en estado React)
- Sin persistencia en backend
- Historial scrolleable
- Timestamp en cada mensaje
- Input con boton de envio y soporte de Enter

---

### 5.7 Notas de la Sesion

#### Estructura de la Nota

```javascript
{
  id: Date.now(),
  content: "Contenido de la nota",
  author: 'Tu',
  timestamp: new Date().toISOString()
}
```

#### Agregar Nota

```javascript
const handleAddNote = () => {
  if (noteInput.trim()) {
    setNotes([...notes, {
      id: Date.now(),
      content: noteInput,
      author: 'Tu',
      timestamp: new Date().toISOString()
    }])
    setNoteInput('')
  }
}
```

**Caracteristicas:**
- Area de texto multilinea
- Notas con marca de tiempo y autor
- Lista scrolleable
- Sin edicion posterior (solo agregar)

---

### 5.8 Panel de IA

El sidebar incluye una pestana de IA con:

#### Toggles de Proveedores

```
[ ] GPT-4        - Toggle switch
[ ] Claude       - Toggle switch
[ ] Gemini       - Toggle switch
```

#### Botones de Accion Rapida

```
[Generar Minutas]     - Genera minuta automatica
[Extraer Tareas]      - Extrae action items del transcript
```

**Estado actual:** Los toggles y botones estan renderizados en el UI pero **no tienen funcionalidad conectada** a las APIs de IA. Es una interfaz preparada para futura integracion.

---

## 6. Interfaz de Usuario

### 6.1 Layout Principal

```
+----------------------------------------------------------+
|  HEADER: Logo | Titulo Sesion | Timer | Participantes    |
+----------------------------------------------------------+
|                                    |                      |
|                                    |   SIDEBAR (350px)    |
|       VIDEO GRID                   |                      |
|       (area principal)             |  [Tabs: Participan-  |
|                                    |   tes | Chat | Notas |
|   +------------------+             |   | Transcripcion    |
|   |                  |             |   | IA]              |
|   |  VIDEO PRINCIPAL |             |                      |
|   |  (720px max)     |             |  Contenido del tab   |
|   |                  |             |  seleccionado        |
|   +------------------+             |                      |
|                                    |                      |
+----------------------------------------------------------+
|  CONTROLS: [Mute] [Camera] [Share] [Record]  [END CALL]  |
+----------------------------------------------------------+
```

### 6.2 Controles de Video

| Boton | Icono | Funcion | Estado Activo |
|-------|-------|---------|---------------|
| Silenciar | `fa-microphone` / `fa-microphone-slash` | Toggle microfono | Rojo cuando muted |
| Camara | `fa-video` / `fa-video-slash` | Toggle camara | Rojo cuando off |
| Compartir | `fa-desktop` | Toggle screen share | Azul cuando activo |
| Grabar | `fa-circle` (rojo) | Iniciar/detener grabacion | Pulsa cuando graba |
| Finalizar | `fa-phone-slash` | Terminar llamada | Siempre rojo, mas grande (56px) |
| Chat | `fa-comment` | Abrir panel chat | Badge con mensajes sin leer |
| Participantes | `fa-users` | Abrir panel participantes | Badge con conteo |

**Estilos de los botones:**
- Circulares: 44px de diametro
- Efecto hover: scale(1.1)
- Estado activo: fondo rojo
- Boton de grabar: animacion de pulso cuando esta grabando
- Boton de finalizar: 56px, siempre rojo

### 6.3 Sidebar con Pestanas

```javascript
const sidebarTabs = [
  { id: 'participants', icon: 'fa-users',             label: 'Participantes' },
  { id: 'chat',         icon: 'fa-comment',           label: 'Chat' },
  { id: 'notes',        icon: 'fa-sticky-note',       label: 'Notas' },
  { id: 'transcript',   icon: 'fa-closed-captioning', label: 'Transcripcion' },
  { id: 'ai',           icon: 'fa-robot',             label: 'IA' }
]
```

| Pestana | Contenido |
|---------|-----------|
| **Participantes** | Lista de participantes con estado de mute/video, badge de host |
| **Chat** | Historial de mensajes scrolleable + input de envio |
| **Notas** | Lista de notas + textarea para nueva nota |
| **Transcripcion** | Texto transcrito en tiempo real con timestamps |
| **IA** | Toggles de proveedores + botones de accion rapida |

### 6.4 Modal de Guardar Grabacion

Al detener la grabacion, se muestra un modal con:

```
+--------------------------------------------------+
|  GUARDAR GRABACION                          [X]  |
|--------------------------------------------------|
|  Titulo de la sesion: [________________]         |
|                                                  |
|  FORMATOS DE VIDEO:                              |
|  [x] WebM (Original)                            |
|  [ ] MP4                                         |
|  [ ] MP3 (Solo audio)                            |
|                                                  |
|  ENTREGABLES A GENERAR:                          |
|  [x] Analisis del video                         |
|  [x] Transcripcion completa                     |
|  [x] Minuta de la reunion                       |
|  [x] Diagrama As-Is (estado actual)             |
|  [x] Diagrama To-Be (estado futuro)             |
|                                                  |
|  [ ] Enviar entregables por correo              |
|      [correo@ejemplo.com___________]             |
|                                                  |
|  INFO DE SESION:                                 |
|  Duracion: 00:45:30                              |
|  Participantes: 1                                |
|  Mensajes: 12                                    |
|  Notas: 5                                        |
|                                                  |
|  [Cancelar]              [Guardar y Descargar]   |
+--------------------------------------------------+
```

---

## 7. Entregables Generados

### 7.1 Archivos de Video

| Formato | Extension | Codec | Notas |
|---------|-----------|-------|-------|
| WebM | `.webm` | VP9/VP8 + Opus | Formato original de grabacion |
| MP4 | `.mp4` | _(renombrado)_ | Solo cambio de extension, no transcodifica |
| MP3 | `.mp3` | _(renombrado)_ | Solo cambio de extension, no extrae audio |

### 7.2 Transcripcion (Markdown)

```markdown
# Transcripcion de la Sesion
**Fecha:** 11 de febrero de 2026
**Duracion:** 00:45:30

---

[10:30:15] **Participante:** Texto reconocido de la primera intervencion
[10:30:42] **Participante:** Texto reconocido de la segunda intervencion
[10:31:05] **Participante:** Texto reconocido de la tercera intervencion
```

### 7.3 Minuta de la Reunion (Markdown)

```javascript
const generateMinutes = () => {
  const date = new Date().toLocaleDateString('es-ES', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
  })

  return `# MINUTA DE CONFERENCIA

## Informacion General
- **Fecha:** ${date}
- **Duracion:** ${formatTime(sessionData?.duration || recordingTime)}
- **Participantes:** ${participants.map(p => p.name).join(', ')}

## Transcripcion Resumida
${transcript.slice(0, 10).map(t => `- **${t.speaker}:** ${t.text}`).join('\n')}

## Notas de la Sesion
${notes.map(n => `- ${n.content} (${n.author})`).join('\n')}

## Acuerdos y Siguientes Pasos
- (Pendiente de completar)

## Chat de la Sesion
${chatMessages.map(m => `- **${m.user}:** ${m.message}`).join('\n')}
`
}
```

### 7.4 Diagramas Mermaid

#### Diagrama As-Is (Estado Actual)

```javascript
const generateMermaidDiagram = (type) => {
  if (type === 'asIs') {
    return `graph TD
    subgraph "Estado Actual - As-Is (${date})"
        A[Proceso Actual] --> B[Paso 1]
        B --> C[Paso 2]
        C --> D[Resultado Actual]
    end`
  }
}
```

#### Diagrama To-Be (Estado Futuro)

```javascript
if (type === 'toBe') {
  return `graph TD
  subgraph "Estado Futuro - To-Be"
      A[Proceso Mejorado] --> B[Nuevo Paso 1]
      B --> C[Automatizacion]
      C --> D[Resultado Optimizado]
  end`
}
```

### 7.5 Datos de Sesion (JSON)

```json
{
  "title": "Nombre de la conferencia",
  "date": "2026-02-11T10:00:00.000Z",
  "duration": 2730,
  "participants": [
    { "id": 1, "name": "Tu", "isMuted": false, "isVideoOff": false, "isHost": true }
  ],
  "transcript": [
    { "speaker": "Participante", "text": "Texto transcrito", "timestamp": "..." }
  ],
  "notes": [
    { "id": 1707654321, "content": "Nota importante", "author": "Tu", "timestamp": "..." }
  ],
  "chatMessages": [
    { "id": 1707654322, "user": "Tu", "message": "Hola", "timestamp": "..." }
  ]
}
```

---

## 8. Estilos y Tema Visual

### Tema Oscuro

```css
/* Colores base */
--bg-primary:    #1a1a1a;           /* Fondo principal (mas oscuro) */
--bg-secondary:  #2c2c2c;           /* Fondo secundario */
--bg-tertiary:   rgba(255,255,255,0.05); /* Overlay ligero */
--text-primary:  #ffffff;            /* Texto principal */
--text-secondary: #888 - #999;       /* Texto secundario */
--border-color:  #3a3a3a;           /* Bordes */

/* Colores de accion */
--primary-color: #3b82f6;           /* Azul (botones principales) */
--danger-color:  #ef4444;           /* Rojo (finalizar, mute activo) */
--success-color: #22c55e;           /* Verde (grabando) */
```

### Animaciones

```css
/* Indicador de grabacion parpadeante */
@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

/* Pulso del boton de grabar */
@keyframes pulse-recording {
  0%   { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.7); }
  70%  { box-shadow: 0 0 0 10px rgba(239, 68, 68, 0); }
  100% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0); }
}

/* Barra de progreso */
@keyframes shimmer {
  0%   { transform: translateX(-100%); }
  100% { transform: translateX(100%); }
}

/* Punto de grabacion */
@keyframes blink {
  0%, 100% { opacity: 1; }
  50% { opacity: 0; }
}
```

### Responsive (Mobile)

```css
@media (max-width: 768px) {
  .vc-sidebar {
    width: 100%;
    max-height: 300px;
  }
  .vc-video-grid {
    flex-direction: column;
  }
  .vc-controls {
    flex-wrap: wrap;
  }
}
```

### Dimensiones Clave

| Elemento | Tamano |
|----------|--------|
| Header | 60px alto |
| Video principal | max 720px ancho |
| Sidebar | 350px ancho |
| Botones de control | 44px diametro |
| Boton finalizar | 56px diametro |
| Tabs del sidebar | 12px texto + icono |

---

## 9. Integracion con la App Principal

### Acceso a la Videoconferencia

**Opcion 1: Boton rapido en el header** (siempre visible)
```javascript
// App.jsx linea 208
<button onClick={() => setCurrentView('videoconference')}>
  <i className="fas fa-video"></i>
</button>
```

**Opcion 2: Navegacion por vista**
```javascript
// App.jsx linea 186
case 'videoconference': return <VideoConferenceView />
```

### Traducciones Disponibles

| Idioma | Traduccion |
|--------|------------|
| Espanol | Videoconferencia |
| Ingles | Video Conference |
| Portugues | Videoconferencia |

---

## 10. Estado Actual y Limitaciones

### Lo que FUNCIONA

| Funcionalidad | Estado | Detalles |
|---------------|--------|----------|
| Captura de camara | Funcional | getUserMedia con HD |
| Captura de microfono | Funcional | Audio track |
| Silenciar microfono | Funcional | Toggle track.enabled |
| Apagar camara | Funcional | Toggle track.enabled |
| Compartir pantalla | Funcional | getDisplayMedia |
| Grabar sesion | Funcional | MediaRecorder WebM |
| Descargar grabacion | Funcional | Blob download |
| Transcripcion | Funcional | Web Speech API (es-ES) |
| Chat local | Funcional | Estado React |
| Notas | Funcional | Estado React |
| Timer de sesion | Funcional | setInterval |
| UI completa | Funcional | 2,560 lineas CSS |
| Modal de guardado | Funcional | Formatos + entregables |

### Lo que NO funciona (Limitaciones)

| Funcionalidad | Estado | Motivo |
|---------------|--------|--------|
| Multi-usuario | No implementado | No hay signaling server WebRTC |
| Conexion peer-to-peer | No implementado | No hay intercambio SDP |
| STUN/TURN | No configurado | No hay NAT traversal |
| Chat en tiempo real | Solo local | No hay Socket.IO para video |
| Invitar participantes | UI existe, no funcional | No hay room management |
| Conversion MP4 real | No real | Solo renombra extension |
| Conversion MP3 real | No real | Solo renombra extension |
| Panel de IA | UI existe, no conectado | Toggles sin funcionalidad |
| Persistencia en BD | No implementado | Solo localStorage |
| Grabacion multi-stream | No implementado | Solo graba stream local |
| Identificacion de hablantes | No implementado | Todos son "Participante" |
| Seleccion de idioma STT | No implementado | Fijo en es-ES |

---

## 11. Hoja de Ruta para Multi-Usuario

### Fase 1: Servidor de Senalizacion

```javascript
// server/server.js - Agregar handlers de Socket.IO

io.on('connection', (socket) => {

  // Crear/unirse a sala
  socket.on('join-room', (roomId, userId) => {
    socket.join(roomId)
    socket.to(roomId).emit('user-connected', userId)
  })

  // Intercambio de SDP (offer/answer)
  socket.on('offer', (offer, targetUserId) => {
    socket.to(targetUserId).emit('offer', offer, socket.id)
  })

  socket.on('answer', (answer, targetUserId) => {
    socket.to(targetUserId).emit('answer', answer, socket.id)
  })

  // ICE candidates
  socket.on('ice-candidate', (candidate, targetUserId) => {
    socket.to(targetUserId).emit('ice-candidate', candidate, socket.id)
  })

  // Desconexion
  socket.on('disconnect', () => {
    socket.broadcast.emit('user-disconnected', socket.id)
  })
})
```

### Fase 2: WebRTC Peer Connection (Cliente)

```javascript
// Crear conexion peer
const peerConnection = new RTCPeerConnection({
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
    {
      urls: 'turn:tu-servidor-turn.com:3478',
      username: 'usuario',
      credential: 'password'
    }
  ]
})

// Agregar tracks locales
localStream.getTracks().forEach(track => {
  peerConnection.addTrack(track, localStream)
})

// Recibir tracks remotos
peerConnection.ontrack = (event) => {
  remoteVideoRef.current.srcObject = event.streams[0]
}

// Crear y enviar offer
const offer = await peerConnection.createOffer()
await peerConnection.setLocalDescription(offer)
socket.emit('offer', offer, targetUserId)
```

### Fase 3: Room Management (Backend)

```javascript
// Nuevo endpoint: POST /api/video/rooms
router.post('/rooms', async (req, res) => {
  const { title, hostId, maxParticipants } = req.body
  const roomId = generateRoomId()
  await db.query(
    'INSERT INTO video_rooms (room_id, title, host_id, max_participants) VALUES (?,?,?,?)',
    [roomId, title, hostId, maxParticipants]
  )
  res.json({ roomId, inviteLink: `/video/${roomId}` })
})
```

### Fase 4: Integracion con IA

```javascript
// Conectar transcripcion con Claude API
const analyzeTranscript = async (transcript) => {
  const response = await fetch('/api/ai/chat', {
    method: 'POST',
    body: JSON.stringify({
      message: `Analiza esta transcripcion y genera:
        1. Resumen ejecutivo
        2. Puntos clave
        3. Action items
        4. Diagrama As-Is/To-Be

        Transcripcion: ${transcript}`
    })
  })
  return response.json()
}
```

### Fase 5: Grabacion del Servidor

```javascript
// Combinar todos los streams de participantes
// Usar FFmpeg o servicio como MediaSoup para:
// - Grabar todos los streams
// - Transcodificar a MP4 real
// - Extraer audio a MP3 real
// - Almacenar en servidor/S3
```

### Resumen de Fases

| Fase | Funcionalidad | Complejidad |
|------|---------------|-------------|
| 1 | Signaling Server (Socket.IO) | Media |
| 2 | WebRTC Peer Connection | Alta |
| 3 | Room Management + BD | Media |
| 4 | Integracion con IA (Claude) | Media |
| 5 | Grabacion del servidor + transcodificacion | Alta |
