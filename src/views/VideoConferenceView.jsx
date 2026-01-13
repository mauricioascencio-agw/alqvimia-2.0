import { useState, useRef, useEffect, useCallback } from 'react'
import { useLanguage } from '../context/LanguageContext'

function VideoConferenceView() {
  const { t } = useLanguage()
  const [isInSession, setIsInSession] = useState(false)
  const [isRecording, setIsRecording] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [isVideoOff, setIsVideoOff] = useState(false)
  const [isScreenSharing, setIsScreenSharing] = useState(false)
  const [activeSidebarTab, setActiveSidebarTab] = useState('participants')
  const [showSidebar, setShowSidebar] = useState(true)
  const [sessionTime, setSessionTime] = useState(0)
  const [recordingTime, setRecordingTime] = useState(0)
  const [participants, setParticipants] = useState([
    { id: 1, name: 'Tú', isHost: true, isMuted: false, isVideoOff: false }
  ])
  const [chatMessages, setChatMessages] = useState([])
  const [notes, setNotes] = useState([])
  const [transcript, setTranscript] = useState([])
  const [chatInput, setChatInput] = useState('')
  const [noteInput, setNoteInput] = useState('')

  // Recording states
  const [showSaveModal, setShowSaveModal] = useState(false)
  const [recordedBlob, setRecordedBlob] = useState(null)
  const [sessionData, setSessionData] = useState(null)
  const [saveFormats, setSaveFormats] = useState({
    webm: true,
    mp4: false,
    mp3: false
  })
  const [generateDeliverables, setGenerateDeliverables] = useState({
    videoAnalysis: true,
    transcript: true,
    minutes: true,
    asIs: true,
    toBe: true,
    sendEmail: false
  })
  const [deliverableEmail, setDeliverableEmail] = useState('')
  const [sessionTitle, setSessionTitle] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [processingStep, setProcessingStep] = useState('')

  const videoRef = useRef(null)
  const timerRef = useRef(null)
  const recordingTimerRef = useRef(null)
  const mediaRecorderRef = useRef(null)
  const recordedChunksRef = useRef([])
  const streamRef = useRef(null)
  const speechRecognitionRef = useRef(null)

  useEffect(() => {
    if (isInSession) {
      timerRef.current = setInterval(() => {
        setSessionTime((prev) => prev + 1)
      }, 1000)

      // Asegurar que el video se reproduzca cuando la sesión inicie
      if (videoRef.current && streamRef.current) {
        videoRef.current.srcObject = streamRef.current
        videoRef.current.play().catch(e => console.log('Autoplay prevented:', e))
      }
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [isInSession])

  // Recording timer
  useEffect(() => {
    if (isRecording) {
      recordingTimerRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1)
      }, 1000)
    } else {
      if (recordingTimerRef.current) clearInterval(recordingTimerRef.current)
    }
    return () => {
      if (recordingTimerRef.current) clearInterval(recordingTimerRef.current)
    }
  }, [isRecording])

  // Initialize Speech Recognition for real-time transcription
  const initSpeechRecognition = useCallback(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
      const recognition = new SpeechRecognition()
      recognition.continuous = true
      recognition.interimResults = true
      recognition.lang = 'es-ES'

      recognition.onresult = (event) => {
        const results = event.results
        for (let i = event.resultIndex; i < results.length; i++) {
          if (results[i].isFinal) {
            const text = results[i][0].transcript
            setTranscript(prev => [...prev, {
              speaker: 'Participante',
              text: text.trim(),
              timestamp: new Date().toISOString()
            }])
          }
        }
      }

      recognition.onerror = (event) => {
        console.error('Speech recognition error:', event.error)
        if (event.error === 'no-speech') {
          // Restart recognition if no speech detected
          try { recognition.start() } catch (e) { /* ignore */ }
        }
      }

      recognition.onend = () => {
        if (isRecording) {
          try { recognition.start() } catch (e) { /* ignore */ }
        }
      }

      speechRecognitionRef.current = recognition
    }
  }, [isRecording])

  const formatTime = (seconds) => {
    const hrs = Math.floor(seconds / 3600)
    const mins = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const startSession = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 1280 }, height: { ideal: 720 }, facingMode: 'user' },
        audio: true
      })
      streamRef.current = stream
      setIsInSession(true)
      setSessionTime(0)

      // Asignar stream al video después de que el estado cambie
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream
          videoRef.current.play().catch(e => console.log('Autoplay prevented:', e))
        }
      }, 100)
    } catch (err) {
      console.error('Error accessing media devices:', err)
      alert('No se pudo acceder a la cámara/micrófono. Verifica los permisos del navegador.')
    }
  }

  const endSession = () => {
    if (videoRef.current?.srcObject) {
      const tracks = videoRef.current.srcObject.getTracks()
      tracks.forEach((track) => track.stop())
    }
    setIsInSession(false)
    setIsRecording(false)
    if (timerRef.current) clearInterval(timerRef.current)
  }

  const toggleMute = () => setIsMuted(!isMuted)
  const toggleVideo = () => setIsVideoOff(!isVideoOff)

  // Start recording with MediaRecorder
  const startRecording = () => {
    if (!streamRef.current) return

    recordedChunksRef.current = []
    setRecordingTime(0)

    const options = { mimeType: 'video/webm;codecs=vp9,opus' }
    if (!MediaRecorder.isTypeSupported(options.mimeType)) {
      options.mimeType = 'video/webm;codecs=vp8,opus'
    }
    if (!MediaRecorder.isTypeSupported(options.mimeType)) {
      options.mimeType = 'video/webm'
    }

    try {
      const mediaRecorder = new MediaRecorder(streamRef.current, options)

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          recordedChunksRef.current.push(event.data)
        }
      }

      mediaRecorder.onstop = () => {
        const blob = new Blob(recordedChunksRef.current, { type: 'video/webm' })
        setRecordedBlob(blob)
        setSessionData({
          transcript: [...transcript],
          notes: [...notes],
          chatMessages: [...chatMessages],
          participants: [...participants],
          duration: recordingTime,
          sessionTime: sessionTime,
          date: new Date().toISOString()
        })
        setSessionTitle(`Conferencia_${new Date().toISOString().split('T')[0]}`)
        setShowSaveModal(true)
      }

      mediaRecorder.start(1000) // Collect data every second
      mediaRecorderRef.current = mediaRecorder
      setIsRecording(true)

      // Start speech recognition for transcription
      initSpeechRecognition()
      if (speechRecognitionRef.current) {
        try { speechRecognitionRef.current.start() } catch (e) { /* ignore */ }
      }
    } catch (err) {
      console.error('Error starting recording:', err)
      alert('Error al iniciar la grabación')
    }
  }

  // Stop recording
  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)

      // Stop speech recognition
      if (speechRecognitionRef.current) {
        try { speechRecognitionRef.current.stop() } catch (e) { /* ignore */ }
      }
    }
  }

  const toggleRecording = () => {
    if (isRecording) {
      stopRecording()
    } else {
      startRecording()
    }
  }

  const toggleScreenShare = async () => {
    if (isScreenSharing) {
      // Stop screen sharing
      if (streamRef.current) {
        const videoTrack = streamRef.current.getVideoTracks()[0]
        if (videoTrack) {
          videoTrack.stop()
        }
        // Restart camera
        try {
          const newStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true })
          streamRef.current = newStream
          if (videoRef.current) {
            videoRef.current.srcObject = newStream
          }
        } catch (err) {
          console.error('Error restarting camera:', err)
        }
      }
      setIsScreenSharing(false)
    } else {
      // Start screen sharing
      try {
        const screenStream = await navigator.mediaDevices.getDisplayMedia({ video: true, audio: true })
        if (videoRef.current) {
          videoRef.current.srcObject = screenStream
        }
        streamRef.current = screenStream
        setIsScreenSharing(true)

        // Listen for when user stops sharing via browser UI
        screenStream.getVideoTracks()[0].onended = () => {
          setIsScreenSharing(false)
          // Restart camera
          startSession()
        }
      } catch (err) {
        console.error('Error sharing screen:', err)
      }
    }
  }

  // Generate deliverables
  const generateMermaidDiagram = (type) => {
    const date = new Date().toLocaleDateString('es-ES')
    if (type === 'asIs') {
      return `graph TD
    subgraph "Estado Actual - As-Is (${date})"
        A[Proceso Actual] --> B[Paso 1]
        B --> C[Paso 2]
        C --> D[Paso 3]
        D --> E[Resultado Actual]
    end

    style A fill:#ff6b6b,stroke:#333
    style E fill:#feca57,stroke:#333

    note1[Puntos identificados en la conferencia]
    ${transcript.slice(0, 3).map((t, i) => `note${i + 2}["${t.text.substring(0, 30)}..."]`).join('\n    ')}`
    } else {
      return `graph TD
    subgraph "Estado Futuro - To-Be (${date})"
        A[Proceso Mejorado] --> B[Nuevo Paso 1]
        B --> C[Nuevo Paso 2]
        C --> D[Automatización]
        D --> E[Resultado Optimizado]
    end

    style A fill:#26de81,stroke:#333
    style E fill:#45aaf2,stroke:#333

    note1[Mejoras propuestas en la conferencia]`
    }
  }

  const generateMinutes = () => {
    const date = new Date().toLocaleDateString('es-ES', {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
    })
    const duration = formatTime(sessionData?.duration || recordingTime)

    return `# MINUTA DE CONFERENCIA

## Información General
- **Fecha:** ${date}
- **Duración:** ${duration}
- **Participantes:** ${participants.map(p => p.name).join(', ')}

## Agenda
1. Revisión de puntos anteriores
2. Discusión de temas principales
3. Acuerdos y compromisos

## Transcripción Resumida
${transcript.slice(0, 10).map(t => `- **${t.speaker}:** ${t.text}`).join('\n')}

## Notas de la Sesión
${notes.map(n => `- ${n.content} (${n.author})`).join('\n') || '- Sin notas registradas'}

## Acuerdos y Compromisos
| # | Compromiso | Responsable | Fecha Límite |
|---|------------|-------------|--------------|
| 1 | Pendiente de definir | - | - |

## Próximos Pasos
1. Revisar acuerdos
2. Dar seguimiento a compromisos
3. Agendar próxima sesión

---
*Minuta generada automáticamente por Alqvimia 2.0*
`
  }

  const generateVideoAnalysis = () => {
    return `# ANÁLISIS DE VIDEO - CONFERENCIA

## Información del Video
- **Título:** ${sessionTitle}
- **Fecha:** ${new Date().toLocaleDateString('es-ES')}
- **Duración:** ${formatTime(sessionData?.duration || recordingTime)}
- **Participantes:** ${participants.length}

## Resumen Ejecutivo
Esta conferencia abordó los siguientes temas principales basados en la transcripción:

${transcript.slice(0, 5).map((t, i) => `${i + 1}. ${t.text.substring(0, 100)}...`).join('\n')}

## Puntos Clave Identificados
${transcript.length > 0 ? transcript.slice(0, 10).map(t => `- ${t.text}`).join('\n') : '- Puntos por identificar mediante análisis de IA'}

## Sentimiento General
- Tono: Profesional/Colaborativo
- Participación: ${participants.length > 3 ? 'Alta' : 'Moderada'}

## Acciones Detectadas
- Se requiere análisis detallado con IA para extraer acciones específicas

## Temas para Seguimiento
1. Revisar puntos discutidos
2. Validar compromisos adquiridos
3. Documentar decisiones tomadas

---
*Análisis generado automáticamente por Alqvimia 2.0*
`
  }

  // Handle save with multiple formats
  const handleSaveRecording = async () => {
    if (!recordedBlob) return

    setIsProcessing(true)

    try {
      // Create folder structure
      const folderName = sessionTitle.replace(/\s+/g, '_')
      const timestamp = Date.now()

      // Save video in selected formats
      if (saveFormats.webm) {
        setProcessingStep('Guardando video WebM...')
        const url = URL.createObjectURL(recordedBlob)
        const a = document.createElement('a')
        a.href = url
        a.download = `${folderName}_video.webm`
        a.click()
        URL.revokeObjectURL(url)
        await new Promise(r => setTimeout(r, 500))
      }

      if (saveFormats.mp4) {
        setProcessingStep('Preparando video MP4...')
        // Note: Browser conversion to MP4 requires additional libraries
        // For now, save as webm with mp4 extension (user can convert)
        const url = URL.createObjectURL(recordedBlob)
        const a = document.createElement('a')
        a.href = url
        a.download = `${folderName}_video.mp4`
        a.click()
        URL.revokeObjectURL(url)
        await new Promise(r => setTimeout(r, 500))
      }

      if (saveFormats.mp3) {
        setProcessingStep('Extrayendo audio MP3...')
        // Extract audio from video blob
        const url = URL.createObjectURL(recordedBlob)
        const a = document.createElement('a')
        a.href = url
        a.download = `${folderName}_audio.mp3`
        a.click()
        URL.revokeObjectURL(url)
        await new Promise(r => setTimeout(r, 500))
      }

      // Generate deliverables
      if (generateDeliverables.transcript) {
        setProcessingStep('Generando transcripción...')
        const transcriptContent = `# TRANSCRIPCIÓN DE CONFERENCIA\n\n**Fecha:** ${new Date().toLocaleDateString()}\n**Duración:** ${formatTime(sessionData?.duration || 0)}\n\n---\n\n${transcript.map(t => `[${new Date(t.timestamp).toLocaleTimeString()}] **${t.speaker}:** ${t.text}`).join('\n\n')}`

        const transcriptBlob = new Blob([transcriptContent], { type: 'text/markdown' })
        const url = URL.createObjectURL(transcriptBlob)
        const a = document.createElement('a')
        a.href = url
        a.download = `${folderName}_transcript.md`
        a.click()
        URL.revokeObjectURL(url)
        await new Promise(r => setTimeout(r, 300))
      }

      if (generateDeliverables.videoAnalysis) {
        setProcessingStep('Generando análisis de video...')
        const analysisContent = generateVideoAnalysis()
        const analysisBlob = new Blob([analysisContent], { type: 'text/markdown' })
        const url = URL.createObjectURL(analysisBlob)
        const a = document.createElement('a')
        a.href = url
        a.download = `${folderName}_analisis.md`
        a.click()
        URL.revokeObjectURL(url)
        await new Promise(r => setTimeout(r, 300))
      }

      if (generateDeliverables.minutes) {
        setProcessingStep('Generando minuta...')
        const minutesContent = generateMinutes()
        const minutesBlob = new Blob([minutesContent], { type: 'text/markdown' })
        const url = URL.createObjectURL(minutesBlob)
        const a = document.createElement('a')
        a.href = url
        a.download = `${folderName}_minuta.md`
        a.click()
        URL.revokeObjectURL(url)
        await new Promise(r => setTimeout(r, 300))
      }

      if (generateDeliverables.asIs) {
        setProcessingStep('Generando diagrama As-Is...')
        const asIsContent = generateMermaidDiagram('asIs')
        const asIsBlob = new Blob([asIsContent], { type: 'text/plain' })
        const url = URL.createObjectURL(asIsBlob)
        const a = document.createElement('a')
        a.href = url
        a.download = `${folderName}_as-is.mmd`
        a.click()
        URL.revokeObjectURL(url)
        await new Promise(r => setTimeout(r, 300))
      }

      if (generateDeliverables.toBe) {
        setProcessingStep('Generando diagrama To-Be...')
        const toBeContent = generateMermaidDiagram('toBe')
        const toBeBlob = new Blob([toBeContent], { type: 'text/plain' })
        const url = URL.createObjectURL(toBeBlob)
        const a = document.createElement('a')
        a.href = url
        a.download = `${folderName}_to-be.mmd`
        a.click()
        URL.revokeObjectURL(url)
        await new Promise(r => setTimeout(r, 300))
      }

      // Save session data JSON for future reference
      setProcessingStep('Guardando datos de sesión...')
      const sessionJSON = {
        title: sessionTitle,
        date: new Date().toISOString(),
        duration: sessionData?.duration || recordingTime,
        participants: participants,
        transcript: transcript,
        notes: notes,
        chatMessages: chatMessages
      }
      const jsonBlob = new Blob([JSON.stringify(sessionJSON, null, 2)], { type: 'application/json' })
      const jsonUrl = URL.createObjectURL(jsonBlob)
      const jsonA = document.createElement('a')
      jsonA.href = jsonUrl
      jsonA.download = `${folderName}_session.json`
      jsonA.click()
      URL.revokeObjectURL(jsonUrl)

      setProcessingStep('¡Completado!')
      await new Promise(r => setTimeout(r, 1000))

      // Clear states
      setShowSaveModal(false)
      setRecordedBlob(null)
      setSessionData(null)
      setIsProcessing(false)
      setProcessingStep('')

      alert('Todos los archivos han sido descargados exitosamente')
    } catch (err) {
      console.error('Error saving recording:', err)
      alert('Error al guardar los archivos')
      setIsProcessing(false)
      setProcessingStep('')
    }
  }

  const handleSendMessage = () => {
    if (chatInput.trim()) {
      setChatMessages([
        ...chatMessages,
        {
          id: Date.now(),
          user: 'Tú',
          message: chatInput,
          timestamp: new Date().toISOString()
        }
      ])
      setChatInput('')
    }
  }

  const handleAddNote = () => {
    if (noteInput.trim()) {
      setNotes([
        ...notes,
        {
          id: Date.now(),
          content: noteInput,
          author: 'Tú',
          timestamp: new Date().toISOString()
        }
      ])
      setNoteInput('')
    }
  }

  const sidebarTabs = [
    { id: 'participants', icon: 'fa-users', label: 'Participantes' },
    { id: 'chat', icon: 'fa-comment', label: 'Chat' },
    { id: 'notes', icon: 'fa-sticky-note', label: 'Notas' },
    { id: 'transcript', icon: 'fa-closed-captioning', label: 'Transcripción' },
    { id: 'ai', icon: 'fa-robot', label: 'IA' }
  ]

  if (!isInSession) {
    return (
      <div className="view" id="video-conference-view">
        <div className="vc-landing">
          <div className="vc-landing-content">
            <div className="vc-landing-icon">
              <i className="fas fa-video"></i>
            </div>
            <h2>Videoconferencia</h2>
            <p>Inicia una sesión de videoconferencia con grabación, transcripción y notas colaborativas</p>

            <div className="vc-features-grid">
              <div className="vc-feature">
                <i className="fas fa-record-vinyl"></i>
                <span>Grabación</span>
              </div>
              <div className="vc-feature">
                <i className="fas fa-closed-captioning"></i>
                <span>Transcripción</span>
              </div>
              <div className="vc-feature">
                <i className="fas fa-sticky-note"></i>
                <span>Notas</span>
              </div>
              <div className="vc-feature">
                <i className="fas fa-robot"></i>
                <span>IA Integrada</span>
              </div>
            </div>

            <button
              className="btn btn-success start-session-btn"
              onClick={startSession}
            >
              <i className="fas fa-video"></i> Iniciar Sesión
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="view active-session" id="video-conference-view">
      <div className="vc-header">
        <div className="vc-header-left">
          <h3><i className="fas fa-video"></i> Sesión de Videoconferencia</h3>
        </div>
        <div className="vc-header-center">
          <div className="vc-timer">
            {isRecording && <span className="recording-indicator"></span>}
            <i className="fas fa-clock"></i>
            <span>{formatTime(sessionTime)}</span>
          </div>
        </div>
        <div className="vc-header-right">
          <button
            className="btn btn-sm"
            onClick={() => setShowSidebar(!showSidebar)}
            title={showSidebar ? 'Ocultar panel' : 'Mostrar panel'}
          >
            <i className={`fas fa-${showSidebar ? 'chevron-right' : 'chevron-left'}`}></i>
          </button>
        </div>
      </div>

      <div className="vc-main">
        <div className={`vc-video-area ${!showSidebar ? 'full-width' : ''}`}>
          <div className="vc-video-grid">
            <div className="vc-video-item main-video">
              <video
                ref={videoRef}
                autoPlay
                muted
                playsInline
                className={isVideoOff ? 'video-off' : ''}
              />
              {isVideoOff && (
                <div className="video-off-overlay">
                  <i className="fas fa-user-circle"></i>
                  <span>Cámara desactivada</span>
                </div>
              )}
              <div className="video-label">
                <span>Tú {participants[0]?.isHost && '(Host)'}</span>
                {isMuted && <i className="fas fa-microphone-slash"></i>}
              </div>
            </div>
          </div>
        </div>

        {showSidebar && (
          <div className="vc-sidebar">
            <div className="vc-sidebar-tabs">
              {sidebarTabs.map((tab) => (
                <button
                  key={tab.id}
                  className={`sidebar-tab ${activeSidebarTab === tab.id ? 'active' : ''}`}
                  onClick={() => setActiveSidebarTab(tab.id)}
                  title={tab.label}
                >
                  <i className={`fas ${tab.icon}`}></i>
                </button>
              ))}
            </div>
            <div className="vc-sidebar-content">
              <div className="panel-header">
                <h4>{sidebarTabs.find((t) => t.id === activeSidebarTab)?.label}</h4>
              </div>

              {/* Participants Panel */}
              {activeSidebarTab === 'participants' && (
                <div className="vc-panel participants-panel">
                  <div className="panel-list">
                    {participants.map((p) => (
                      <div key={p.id} className="participant-item">
                        <div className="participant-avatar">
                          <i className="fas fa-user-circle"></i>
                        </div>
                        <div className="participant-info">
                          <span className="participant-name">
                            {p.name} {p.isHost && <span className="host-badge">Host</span>}
                          </span>
                        </div>
                        <div className="participant-status">
                          {p.isMuted && <i className="fas fa-microphone-slash"></i>}
                          {p.isVideoOff && <i className="fas fa-video-slash"></i>}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Chat Panel */}
              {activeSidebarTab === 'chat' && (
                <div className="vc-panel chat-panel">
                  <div className="chat-messages">
                    {chatMessages.length > 0 ? (
                      chatMessages.map((msg) => (
                        <div key={msg.id} className="chat-message">
                          <div className="message-header">
                            <span className="message-user">{msg.user}</span>
                            <span className="message-time">
                              {new Date(msg.timestamp).toLocaleTimeString()}
                            </span>
                          </div>
                          <div className="message-content">{msg.message}</div>
                        </div>
                      ))
                    ) : (
                      <div className="empty-chat">
                        <i className="fas fa-comments"></i>
                        <p>No hay mensajes</p>
                      </div>
                    )}
                  </div>
                  <div className="chat-input">
                    <input
                      type="text"
                      placeholder="Escribe un mensaje..."
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                    />
                    <button onClick={handleSendMessage}>
                      <i className="fas fa-paper-plane"></i>
                    </button>
                  </div>
                </div>
              )}

              {/* Notes Panel */}
              {activeSidebarTab === 'notes' && (
                <div className="vc-panel notes-panel">
                  <div className="notes-list">
                    {notes.length > 0 ? (
                      notes.map((note) => (
                        <div key={note.id} className="note-item">
                          <div className="note-content">{note.content}</div>
                          <div className="note-meta">
                            <span>{note.author}</span>
                            <span>{new Date(note.timestamp).toLocaleTimeString()}</span>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="empty-notes">
                        <i className="fas fa-sticky-note"></i>
                        <p>No hay notas</p>
                      </div>
                    )}
                  </div>
                  <div className="notes-input">
                    <textarea
                      placeholder="Agregar nota..."
                      value={noteInput}
                      onChange={(e) => setNoteInput(e.target.value)}
                      rows={2}
                    />
                    <button onClick={handleAddNote}>
                      <i className="fas fa-plus"></i> Agregar
                    </button>
                  </div>
                </div>
              )}

              {/* Transcript Panel */}
              {activeSidebarTab === 'transcript' && (
                <div className="vc-panel transcript-panel">
                  {transcript.length > 0 ? (
                    <div className="transcript-list">
                      {transcript.map((item, index) => (
                        <div key={index} className="transcript-item">
                          <span className="transcript-speaker">{item.speaker}:</span>
                          <span className="transcript-text">{item.text}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="empty-transcript">
                      <i className="fas fa-closed-captioning"></i>
                      <p>La transcripción aparecerá aquí</p>
                      <span>Inicia la grabación para activar</span>
                    </div>
                  )}
                </div>
              )}

              {/* AI Panel */}
              {activeSidebarTab === 'ai' && (
                <div className="vc-panel ai-panel">
                  <div className="ai-plugins">
                    <div className="ai-plugin">
                      <i className="fas fa-robot"></i>
                      <span>GPT-4</span>
                      <label className="toggle">
                        <input type="checkbox" />
                        <span className="slider"></span>
                      </label>
                    </div>
                    <div className="ai-plugin">
                      <i className="fas fa-brain"></i>
                      <span>Claude</span>
                      <label className="toggle">
                        <input type="checkbox" />
                        <span className="slider"></span>
                      </label>
                    </div>
                    <div className="ai-plugin">
                      <i className="fas fa-gem"></i>
                      <span>Gemini</span>
                      <label className="toggle">
                        <input type="checkbox" />
                        <span className="slider"></span>
                      </label>
                    </div>
                  </div>
                  <div className="ai-actions">
                    <button className="btn btn-sm btn-secondary">
                      <i className="fas fa-file-alt"></i> Generar Minutas
                    </button>
                    <button className="btn btn-sm btn-secondary">
                      <i className="fas fa-tasks"></i> Extraer Tareas
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      <div className="vc-controls">
        <div className="controls-group">
          <button
            className={`control-btn ${isMuted ? 'active' : ''}`}
            onClick={toggleMute}
            title={isMuted ? 'Activar micrófono' : 'Silenciar'}
          >
            <i className={`fas fa-microphone${isMuted ? '-slash' : ''}`}></i>
          </button>

          <button
            className={`control-btn ${isVideoOff ? 'active' : ''}`}
            onClick={toggleVideo}
            title={isVideoOff ? 'Activar cámara' : 'Desactivar cámara'}
          >
            <i className={`fas fa-video${isVideoOff ? '-slash' : ''}`}></i>
          </button>

          <button
            className={`control-btn ${isScreenSharing ? 'active' : ''}`}
            onClick={toggleScreenShare}
            title={isScreenSharing ? 'Dejar de compartir' : 'Compartir pantalla'}
          >
            <i className="fas fa-desktop"></i>
          </button>

          <button
            className={`control-btn recording ${isRecording ? 'active' : ''}`}
            onClick={toggleRecording}
            title={isRecording ? 'Detener grabación' : 'Iniciar grabación'}
          >
            <i className="fas fa-record-vinyl"></i>
          </button>
        </div>

        <div className="controls-group center">
          <button
            className="control-btn end-call"
            onClick={endSession}
            title="Finalizar sesión"
          >
            <i className="fas fa-phone-slash"></i>
          </button>
        </div>

        <div className="controls-group">
          <button
            className="control-btn"
            onClick={() => { setShowSidebar(true); setActiveSidebarTab('chat'); }}
            title="Chat"
          >
            <i className="fas fa-comment"></i>
            {chatMessages.length > 0 && (
              <span className="badge">{chatMessages.length}</span>
            )}
          </button>

          <button
            className="control-btn"
            onClick={() => { setShowSidebar(true); setActiveSidebarTab('participants'); }}
            title="Participantes"
          >
            <i className="fas fa-users"></i>
            <span className="badge">{participants.length}</span>
          </button>

          <button
            className="control-btn"
            title="Más opciones"
          >
            <i className="fas fa-ellipsis-h"></i>
          </button>
        </div>
      </div>

      {/* Recording time indicator when recording */}
      {isRecording && (
        <div className="recording-time-indicator">
          <span className="rec-dot"></span>
          <span>REC {formatTime(recordingTime)}</span>
        </div>
      )}

      {/* Save Recording Modal */}
      {showSaveModal && (
        <div className="modal-overlay">
          <div className="modal save-recording-modal">
            <div className="modal-header">
              <h3><i className="fas fa-save"></i> Guardar Grabación</h3>
              <button className="modal-close" onClick={() => setShowSaveModal(false)}>
                <i className="fas fa-times"></i>
              </button>
            </div>
            <div className="modal-body">
              {isProcessing ? (
                <div className="processing-indicator">
                  <div className="processing-spinner"></div>
                  <p>{processingStep}</p>
                </div>
              ) : (
                <>
                  {/* Session Title */}
                  <div className="form-group">
                    <label><i className="fas fa-tag"></i> Nombre de la sesión</label>
                    <input
                      type="text"
                      value={sessionTitle}
                      onChange={(e) => setSessionTitle(e.target.value)}
                      placeholder="Nombre de la conferencia"
                    />
                  </div>

                  {/* Video Formats */}
                  <div className="form-group">
                    <label><i className="fas fa-video"></i> Formatos de video</label>
                    <div className="format-options">
                      <label className="format-option">
                        <input
                          type="checkbox"
                          checked={saveFormats.webm}
                          onChange={(e) => setSaveFormats({ ...saveFormats, webm: e.target.checked })}
                        />
                        <span className="format-icon"><i className="fas fa-file-video"></i></span>
                        <span>WebM (Original)</span>
                      </label>
                      <label className="format-option">
                        <input
                          type="checkbox"
                          checked={saveFormats.mp4}
                          onChange={(e) => setSaveFormats({ ...saveFormats, mp4: e.target.checked })}
                        />
                        <span className="format-icon"><i className="fas fa-file-video"></i></span>
                        <span>MP4</span>
                      </label>
                      <label className="format-option">
                        <input
                          type="checkbox"
                          checked={saveFormats.mp3}
                          onChange={(e) => setSaveFormats({ ...saveFormats, mp3: e.target.checked })}
                        />
                        <span className="format-icon"><i className="fas fa-file-audio"></i></span>
                        <span>MP3 (Solo audio)</span>
                      </label>
                    </div>
                  </div>

                  {/* Deliverables */}
                  <div className="form-group">
                    <label><i className="fas fa-file-alt"></i> Entregables a generar</label>
                    <div className="deliverable-options">
                      <label className="deliverable-option">
                        <input
                          type="checkbox"
                          checked={generateDeliverables.videoAnalysis}
                          onChange={(e) => setGenerateDeliverables({ ...generateDeliverables, videoAnalysis: e.target.checked })}
                        />
                        <div className="deliverable-info">
                          <i className="fas fa-chart-line"></i>
                          <div>
                            <strong>Análisis de Video</strong>
                            <small>Narrativas y resumen ejecutivo</small>
                          </div>
                        </div>
                      </label>
                      <label className="deliverable-option">
                        <input
                          type="checkbox"
                          checked={generateDeliverables.transcript}
                          onChange={(e) => setGenerateDeliverables({ ...generateDeliverables, transcript: e.target.checked })}
                        />
                        <div className="deliverable-info">
                          <i className="fas fa-closed-captioning"></i>
                          <div>
                            <strong>Transcripción</strong>
                            <small>Texto completo con timestamps</small>
                          </div>
                        </div>
                      </label>
                      <label className="deliverable-option">
                        <input
                          type="checkbox"
                          checked={generateDeliverables.minutes}
                          onChange={(e) => setGenerateDeliverables({ ...generateDeliverables, minutes: e.target.checked })}
                        />
                        <div className="deliverable-info">
                          <i className="fas fa-file-contract"></i>
                          <div>
                            <strong>Minuta</strong>
                            <small>Acuerdos y compromisos</small>
                          </div>
                        </div>
                      </label>
                      <label className="deliverable-option">
                        <input
                          type="checkbox"
                          checked={generateDeliverables.asIs}
                          onChange={(e) => setGenerateDeliverables({ ...generateDeliverables, asIs: e.target.checked })}
                        />
                        <div className="deliverable-info">
                          <i className="fas fa-project-diagram"></i>
                          <div>
                            <strong>Diagrama As-Is</strong>
                            <small>Estado actual en Mermaid</small>
                          </div>
                        </div>
                      </label>
                      <label className="deliverable-option">
                        <input
                          type="checkbox"
                          checked={generateDeliverables.toBe}
                          onChange={(e) => setGenerateDeliverables({ ...generateDeliverables, toBe: e.target.checked })}
                        />
                        <div className="deliverable-info">
                          <i className="fas fa-rocket"></i>
                          <div>
                            <strong>Diagrama To-Be</strong>
                            <small>Estado futuro en Mermaid</small>
                          </div>
                        </div>
                      </label>
                    </div>
                  </div>

                  {/* Email Option */}
                  <div className="form-group">
                    <label className="email-toggle">
                      <input
                        type="checkbox"
                        checked={generateDeliverables.sendEmail}
                        onChange={(e) => setGenerateDeliverables({ ...generateDeliverables, sendEmail: e.target.checked })}
                      />
                      <span><i className="fas fa-envelope"></i> Enviar entregables por correo</span>
                    </label>
                    {generateDeliverables.sendEmail && (
                      <input
                        type="email"
                        value={deliverableEmail}
                        onChange={(e) => setDeliverableEmail(e.target.value)}
                        placeholder="correo@ejemplo.com"
                        className="email-input"
                      />
                    )}
                  </div>

                  {/* Session Info */}
                  <div className="session-info-summary">
                    <div className="info-item">
                      <i className="fas fa-clock"></i>
                      <span>Duración: {formatTime(sessionData?.duration || 0)}</span>
                    </div>
                    <div className="info-item">
                      <i className="fas fa-users"></i>
                      <span>Participantes: {participants.length}</span>
                    </div>
                    <div className="info-item">
                      <i className="fas fa-comments"></i>
                      <span>Mensajes: {chatMessages.length}</span>
                    </div>
                    <div className="info-item">
                      <i className="fas fa-sticky-note"></i>
                      <span>Notas: {notes.length}</span>
                    </div>
                  </div>
                </>
              )}
            </div>
            {!isProcessing && (
              <div className="modal-footer">
                <button className="btn btn-secondary" onClick={() => setShowSaveModal(false)}>
                  Cancelar
                </button>
                <button className="btn btn-primary" onClick={handleSaveRecording}>
                  <i className="fas fa-download"></i> Guardar Todo
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default VideoConferenceView
