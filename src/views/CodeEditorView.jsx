import { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import { useLanguage } from '../context/LanguageContext'

function CodeEditorView() {
  const { t } = useLanguage()
  // Estado de archivos y editor
  const [files, setFiles] = useState(() => {
    const saved = localStorage.getItem('alqvimia_code_files')
    return saved ? JSON.parse(saved) : [
      { id: 1, name: 'main.js', language: 'javascript', content: '// Bienvenido al Editor de Código\n// Usa comandos de IA con Ctrl+I o el panel lateral\n\nconsole.log("Hello, Alqvimia!");', saved: true },
      { id: 2, name: 'styles.css', language: 'css', content: '/* Estilos del proyecto */\n\n.container {\n  display: flex;\n  justify-content: center;\n}', saved: true },
      { id: 3, name: 'index.html', language: 'html', content: '<!DOCTYPE html>\n<html lang="es">\n<head>\n  <meta charset="UTF-8">\n  <title>Mi Proyecto</title>\n</head>\n<body>\n  <h1>Hola Mundo</h1>\n</body>\n</html>', saved: true }
    ]
  })

  const [activeFileId, setActiveFileId] = useState(files[0]?.id || null)
  const [showNewFileModal, setShowNewFileModal] = useState(false)
  const [showAIPanel, setShowAIPanel] = useState(true)
  const [showAICommandModal, setShowAICommandModal] = useState(false)
  const [aiPrompt, setAiPrompt] = useState('')
  const [aiResponse, setAiResponse] = useState('')
  const [aiLoading, setAiLoading] = useState(false)
  const [aiHistory, setAiHistory] = useState([])
  const [searchText, setSearchText] = useState('')
  const [showSearch, setShowSearch] = useState(false)
  const [fontSize, setFontSize] = useState(14)
  const [theme, setTheme] = useState('dark')
  const [showMinimap, setShowMinimap] = useState(true)
  const [wordWrap, setWordWrap] = useState(true)
  const [lineNumbers, setLineNumbers] = useState(true)
  const [cursorPosition, setCursorPosition] = useState({ line: 1, column: 1 })
  const [showExportWorkflow, setShowExportWorkflow] = useState(false)
  const [newFileName, setNewFileName] = useState('')
  const [newFileLanguage, setNewFileLanguage] = useState('javascript')
  const [consoleOutput, setConsoleOutput] = useState([])
  const [showConsole, setShowConsole] = useState(false)
  const [selectedText, setSelectedText] = useState('')

  // Estados para comandos de voz
  const [isListening, setIsListening] = useState(false)
  const [voiceTranscript, setVoiceTranscript] = useState('')
  const [voiceSupported, setVoiceSupported] = useState(true)
  const [voiceMode, setVoiceMode] = useState('command') // 'command' o 'dictation'
  const [dictationBuffer, setDictationBuffer] = useState('')

  const editorRef = useRef(null)
  const textareaRef = useRef(null)
  const recognitionRef = useRef(null)
  const aiPromptRef = useRef(null)
  const [dictationTarget, setDictationTarget] = useState('aiPrompt') // 'editor' o 'aiPrompt' - default to aiPrompt
  const dictationTargetRef = useRef('aiPrompt') // Ref para evitar stale closure en speech recognition
  const aiPromptValueRef = useRef('') // Ref para el valor actual del prompt de IA
  const insertDictatedTextRef = useRef(null) // Ref para la función de inserción

  // Lenguajes soportados
  const languages = [
    { id: 'javascript', name: 'JavaScript', icon: 'fa-js', ext: '.js', color: '#f7df1e' },
    { id: 'typescript', name: 'TypeScript', icon: 'fa-code', ext: '.ts', color: '#3178c6' },
    { id: 'python', name: 'Python', icon: 'fa-python', ext: '.py', color: '#3776ab' },
    { id: 'java', name: 'Java', icon: 'fa-java', ext: '.java', color: '#007396' },
    { id: 'csharp', name: 'C#', icon: 'fa-code', ext: '.cs', color: '#68217a' },
    { id: 'cpp', name: 'C++', icon: 'fa-code', ext: '.cpp', color: '#00599c' },
    { id: 'go', name: 'Go', icon: 'fa-code', ext: '.go', color: '#00add8' },
    { id: 'rust', name: 'Rust', icon: 'fa-code', ext: '.rs', color: '#dea584' },
    { id: 'php', name: 'PHP', icon: 'fa-php', ext: '.php', color: '#777bb4' },
    { id: 'ruby', name: 'Ruby', icon: 'fa-gem', ext: '.rb', color: '#cc342d' },
    { id: 'swift', name: 'Swift', icon: 'fa-apple', ext: '.swift', color: '#fa7343' },
    { id: 'kotlin', name: 'Kotlin', icon: 'fa-code', ext: '.kt', color: '#7f52ff' },
    { id: 'html', name: 'HTML', icon: 'fa-html5', ext: '.html', color: '#e34f26' },
    { id: 'css', name: 'CSS', icon: 'fa-css3-alt', ext: '.css', color: '#1572b6' },
    { id: 'scss', name: 'SCSS', icon: 'fa-sass', ext: '.scss', color: '#cd6799' },
    { id: 'json', name: 'JSON', icon: 'fa-brackets-curly', ext: '.json', color: '#292929' },
    { id: 'xml', name: 'XML', icon: 'fa-code', ext: '.xml', color: '#0060ac' },
    { id: 'yaml', name: 'YAML', icon: 'fa-code', ext: '.yaml', color: '#cb171e' },
    { id: 'markdown', name: 'Markdown', icon: 'fa-markdown', ext: '.md', color: '#083fa1' },
    { id: 'sql', name: 'SQL', icon: 'fa-database', ext: '.sql', color: '#336791' },
    { id: 'shell', name: 'Shell/Bash', icon: 'fa-terminal', ext: '.sh', color: '#4eaa25' },
    { id: 'powershell', name: 'PowerShell', icon: 'fa-terminal', ext: '.ps1', color: '#012456' },
    { id: 'dockerfile', name: 'Dockerfile', icon: 'fa-docker', ext: 'Dockerfile', color: '#2496ed' },
    { id: 'graphql', name: 'GraphQL', icon: 'fa-code', ext: '.graphql', color: '#e535ab' }
  ]

  // Comandos de IA predefinidos
  const aiCommands = [
    { id: 'explain', label: 'Explicar código', icon: 'fa-lightbulb', prompt: 'Explica detalladamente qué hace este código:' },
    { id: 'optimize', label: 'Optimizar', icon: 'fa-rocket', prompt: 'Optimiza este código para mejor rendimiento:' },
    { id: 'refactor', label: 'Refactorizar', icon: 'fa-code-branch', prompt: 'Refactoriza este código siguiendo mejores prácticas:' },
    { id: 'debug', label: 'Encontrar bugs', icon: 'fa-bug', prompt: 'Analiza este código y encuentra posibles bugs o errores:' },
    { id: 'document', label: 'Documentar', icon: 'fa-file-alt', prompt: 'Agrega documentación y comentarios a este código:' },
    { id: 'test', label: 'Generar tests', icon: 'fa-vial', prompt: 'Genera tests unitarios para este código:' },
    { id: 'convert', label: 'Convertir lenguaje', icon: 'fa-exchange-alt', prompt: 'Convierte este código a otro lenguaje:' },
    { id: 'security', label: 'Análisis seguridad', icon: 'fa-shield-alt', prompt: 'Analiza vulnerabilidades de seguridad en este código:' },
    { id: 'complete', label: 'Autocompletar', icon: 'fa-magic', prompt: 'Completa el siguiente código:' },
    { id: 'fix', label: 'Corregir error', icon: 'fa-wrench', prompt: 'Corrige el siguiente error en el código:' }
  ]

  // Archivo activo
  const activeFile = useMemo(() => {
    return files.find(f => f.id === activeFileId) || null
  }, [files, activeFileId])

  // Guardar archivos en localStorage
  useEffect(() => {
    localStorage.setItem('alqvimia_code_files', JSON.stringify(files))
  }, [files])

  // Mantener el ref sincronizado con el state del target de dictado
  useEffect(() => {
    dictationTargetRef.current = dictationTarget
  }, [dictationTarget])

  // Mantener el ref sincronizado con el valor del prompt de IA
  useEffect(() => {
    aiPromptValueRef.current = aiPrompt
  }, [aiPrompt])

  // Inicializar reconocimiento de voz
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition()
      recognitionRef.current.continuous = true
      recognitionRef.current.interimResults = true
      recognitionRef.current.lang = 'es-ES'

      recognitionRef.current.onresult = (event) => {
        let interimTranscript = ''
        let finalTranscript = ''

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript
          if (event.results[i].isFinal) {
            finalTranscript += transcript
          } else {
            interimTranscript += transcript
          }
        }

        // Mostrar transcripción en tiempo real
        setVoiceTranscript(interimTranscript || finalTranscript)

        // Modo dictado: insertar texto en tiempo real en el editor
        if (voiceMode === 'dictation') {
          // Actualizar buffer con el texto provisional
          setDictationBuffer(interimTranscript)

          // Cuando el resultado es final, insertar usando la ref (evita stale closure)
          if (finalTranscript) {
            console.log('Final transcript received:', finalTranscript)
            if (insertDictatedTextRef.current) {
              insertDictatedTextRef.current(finalTranscript)
            }
            setDictationBuffer('')
          }
        } else {
          // Modo comando: procesar comandos de voz cuando hay resultado final
          if (finalTranscript) {
            processVoiceCommand(finalTranscript.toLowerCase().trim())
          }
        }
      }

      recognitionRef.current.onerror = (event) => {
        console.error('Speech recognition error:', event.error)
        setIsListening(false)
      }

      recognitionRef.current.onend = () => {
        if (isListening) {
          recognitionRef.current.start()
        }
      }
    } else {
      setVoiceSupported(false)
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop()
      }
    }
  }, [isListening, voiceMode])

  // Insertar texto dictado en el editor o en el prompt de IA
  // Usamos refs para evitar stale closures en el handler de speech recognition
  const insertDictatedText = useCallback((text) => {
    // Usar el ref para obtener el valor actual del target
    const currentTarget = dictationTargetRef.current

    console.log('insertDictatedText called:', { text, currentTarget })

    // Si el destino es el prompt de IA
    if (currentTarget === 'aiPrompt') {
      // Usar el ref para obtener el valor actual y añadir el texto
      const currentValue = aiPromptValueRef.current
      const newValue = currentValue + (currentValue ? ' ' : '') + text
      setAiPrompt(newValue)

      // Mantener el foco en el textarea del prompt
      setTimeout(() => {
        if (aiPromptRef.current) {
          aiPromptRef.current.focus()
          const len = aiPromptRef.current.value.length
          aiPromptRef.current.selectionStart = len
          aiPromptRef.current.selectionEnd = len
        }
      }, 50)
      return
    }

    // Destino: editor de código
    if (!textareaRef.current) return

    const textarea = textareaRef.current
    const start = textarea.selectionStart
    const end = textarea.selectionEnd

    // Obtener el contenido actual del archivo activo
    setFiles(prev => {
      const currentActiveFile = prev.find(f => f.id === activeFileId)
      if (!currentActiveFile) return prev

      const currentContent = currentActiveFile.content
      const newContent = currentContent.substring(0, start) + text + currentContent.substring(end)

      return prev.map(f =>
        f.id === activeFileId
          ? { ...f, content: newContent, saved: false }
          : f
      )
    })

    // Mover el cursor al final del texto insertado
    setTimeout(() => {
      if (textareaRef.current) {
        const newPosition = start + text.length
        textareaRef.current.selectionStart = newPosition
        textareaRef.current.selectionEnd = newPosition
        textareaRef.current.focus()
      }
    }, 0)
  }, [activeFileId])

  // Mantener la ref actualizada con la última versión de la función
  useEffect(() => {
    insertDictatedTextRef.current = insertDictatedText
  }, [insertDictatedText])

  // Procesar comandos de voz
  const processVoiceCommand = useCallback((command) => {
    setConsoleOutput(prev => [...prev, {
      type: 'info',
      message: `Comando de voz: "${command}"`,
      timestamp: new Date().toLocaleTimeString()
    }])

    // Comandos de archivo
    if (command.includes('guardar') || command.includes('save')) {
      handleSaveFile()
      speak('Archivo guardado')
    } else if (command.includes('nuevo archivo') || command.includes('crear archivo')) {
      setShowNewFileModal(true)
      speak('Creando nuevo archivo')
    } else if (command.includes('ejecutar') || command.includes('run')) {
      runCode()
      speak('Ejecutando código')
    } else if (command.includes('exportar') || command.includes('workflow')) {
      setShowExportWorkflow(true)
      speak('Exportando a workflow')
    }
    // Comandos de IA
    else if (command.includes('explicar código') || command.includes('explain')) {
      executeAICommand(aiCommands.find(c => c.id === 'explain'))
      speak('Explicando código')
    } else if (command.includes('optimizar') || command.includes('optimize')) {
      executeAICommand(aiCommands.find(c => c.id === 'optimize'))
      speak('Optimizando código')
    } else if (command.includes('documentar') || command.includes('document')) {
      executeAICommand(aiCommands.find(c => c.id === 'document'))
      speak('Documentando código')
    } else if (command.includes('buscar bugs') || command.includes('debug')) {
      executeAICommand(aiCommands.find(c => c.id === 'debug'))
      speak('Buscando bugs')
    } else if (command.includes('generar tests') || command.includes('tests')) {
      executeAICommand(aiCommands.find(c => c.id === 'test'))
      speak('Generando tests')
    } else if (command.includes('refactorizar') || command.includes('refactor')) {
      executeAICommand(aiCommands.find(c => c.id === 'refactor'))
      speak('Refactorizando código')
    }
    // Comandos de vista
    else if (command.includes('mostrar consola') || command.includes('show console')) {
      setShowConsole(true)
      speak('Mostrando consola')
    } else if (command.includes('ocultar consola') || command.includes('hide console')) {
      setShowConsole(false)
      speak('Ocultando consola')
    } else if (command.includes('panel ia') || command.includes('ai panel')) {
      setShowAIPanel(!showAIPanel)
      speak(showAIPanel ? 'Ocultando panel IA' : 'Mostrando panel IA')
    } else if (command.includes('aumentar fuente') || command.includes('bigger')) {
      setFontSize(prev => Math.min(prev + 2, 32))
      speak('Fuente aumentada')
    } else if (command.includes('reducir fuente') || command.includes('smaller')) {
      setFontSize(prev => Math.max(prev - 2, 10))
      speak('Fuente reducida')
    }
    // Dictado de código
    else if (command.startsWith('escribir ') || command.startsWith('dictar ')) {
      const textToWrite = command.replace(/^(escribir |dictar )/, '')
      if (textareaRef.current && activeFile) {
        const start = textareaRef.current.selectionStart
        const newContent = activeFile.content.substring(0, start) + textToWrite + activeFile.content.substring(start)
        setFiles(prev => prev.map(f => f.id === activeFileId ? { ...f, content: newContent, saved: false } : f))
        speak('Texto insertado')
      }
    }
    // Comando de ayuda
    else if (command.includes('ayuda') || command.includes('help')) {
      speak('Comandos disponibles: guardar, nuevo archivo, ejecutar, exportar, explicar código, optimizar, documentar, buscar bugs, generar tests, refactorizar, mostrar consola, panel IA, aumentar fuente, reducir fuente, escribir, y ayuda.')
    }
  }, [activeFile, activeFileId, showAIPanel])

  // Función de síntesis de voz
  const speak = (text) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text)
      utterance.lang = 'es-ES'
      utterance.rate = 1.1
      speechSynthesis.speak(utterance)
    }
  }

  // Toggle escucha de voz
  const toggleVoiceListening = (mode = voiceMode) => {
    if (isListening) {
      recognitionRef.current?.stop()
      setIsListening(false)
      setVoiceTranscript('')
      setDictationBuffer('')
    } else {
      setVoiceMode(mode)
      recognitionRef.current?.start()
      setIsListening(true)
      if (mode === 'dictation') {
        speak('Modo dictado activado. Empieza a dictar.')
      } else {
        speak('Escuchando comandos de voz')
      }
    }
  }

  // Cambiar modo de voz mientras está escuchando
  const switchVoiceMode = (mode) => {
    setVoiceMode(mode)
    if (isListening) {
      if (mode === 'dictation') {
        speak('Cambiado a modo dictado')
      } else {
        speak('Cambiado a modo comandos')
      }
    }
  }

  // Atajos de teclado
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Ctrl+S = Guardar
      if (e.ctrlKey && e.key === 's') {
        e.preventDefault()
        handleSaveFile()
      }
      // Ctrl+I = Comando IA
      if (e.ctrlKey && e.key === 'i') {
        e.preventDefault()
        setShowAICommandModal(true)
      }
      // Ctrl+N = Nuevo archivo
      if (e.ctrlKey && e.key === 'n') {
        e.preventDefault()
        setShowNewFileModal(true)
      }
      // Ctrl+F = Buscar
      if (e.ctrlKey && e.key === 'f') {
        e.preventDefault()
        setShowSearch(true)
      }
      // Escape = Cerrar modales
      if (e.key === 'Escape') {
        setShowSearch(false)
        setShowAICommandModal(false)
        setShowNewFileModal(false)
      }
      // Ctrl++ = Aumentar fuente
      if (e.ctrlKey && e.key === '+') {
        e.preventDefault()
        setFontSize(prev => Math.min(prev + 2, 32))
      }
      // Ctrl+- = Reducir fuente
      if (e.ctrlKey && e.key === '-') {
        e.preventDefault()
        setFontSize(prev => Math.max(prev - 2, 10))
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [activeFile])

  // Actualizar posición del cursor
  const handleCursorChange = useCallback(() => {
    if (textareaRef.current) {
      const textarea = textareaRef.current
      const text = textarea.value.substring(0, textarea.selectionStart)
      const lines = text.split('\n')
      const line = lines.length
      const column = lines[lines.length - 1].length + 1
      setCursorPosition({ line, column })

      // Capturar texto seleccionado
      const start = textarea.selectionStart
      const end = textarea.selectionEnd
      if (start !== end) {
        setSelectedText(textarea.value.substring(start, end))
      } else {
        setSelectedText('')
      }
    }
  }, [])

  // Actualizar contenido del archivo
  const handleContentChange = useCallback((e) => {
    const newContent = e.target.value
    setFiles(prev => prev.map(f =>
      f.id === activeFileId
        ? { ...f, content: newContent, saved: false }
        : f
    ))
  }, [activeFileId])

  // Guardar archivo
  const handleSaveFile = useCallback(() => {
    if (!activeFile) return

    setFiles(prev => prev.map(f =>
      f.id === activeFileId
        ? { ...f, saved: true }
        : f
    ))

    // Simular guardado (en producción esto iría al backend)
    setConsoleOutput(prev => [...prev, {
      type: 'success',
      message: `Archivo ${activeFile.name} guardado correctamente`,
      timestamp: new Date().toLocaleTimeString()
    }])
  }, [activeFile, activeFileId])

  // Crear nuevo archivo
  const handleCreateFile = useCallback(() => {
    if (!newFileName.trim()) return

    const lang = languages.find(l => l.id === newFileLanguage)
    const fileName = newFileName.includes('.') ? newFileName : newFileName + (lang?.ext || '.txt')

    const newFile = {
      id: Date.now(),
      name: fileName,
      language: newFileLanguage,
      content: getDefaultContent(newFileLanguage),
      saved: false
    }

    setFiles(prev => [...prev, newFile])
    setActiveFileId(newFile.id)
    setShowNewFileModal(false)
    setNewFileName('')
    setNewFileLanguage('javascript')
  }, [newFileName, newFileLanguage])

  // Contenido por defecto según lenguaje
  const getDefaultContent = (lang) => {
    const templates = {
      javascript: '// Nuevo archivo JavaScript\n\nfunction main() {\n  console.log("Hello World!");\n}\n\nmain();',
      typescript: '// Nuevo archivo TypeScript\n\ninterface User {\n  name: string;\n  age: number;\n}\n\nconst user: User = {\n  name: "John",\n  age: 30\n};',
      python: '# Nuevo archivo Python\n\ndef main():\n    print("Hello World!")\n\nif __name__ == "__main__":\n    main()',
      java: '// Nuevo archivo Java\n\npublic class Main {\n    public static void main(String[] args) {\n        System.out.println("Hello World!");\n    }\n}',
      csharp: '// Nuevo archivo C#\n\nusing System;\n\nclass Program {\n    static void Main() {\n        Console.WriteLine("Hello World!");\n    }\n}',
      html: '<!DOCTYPE html>\n<html lang="es">\n<head>\n    <meta charset="UTF-8">\n    <meta name="viewport" content="width=device-width, initial-scale=1.0">\n    <title>Nuevo Documento</title>\n</head>\n<body>\n    \n</body>\n</html>',
      css: '/* Nuevo archivo CSS */\n\n* {\n    margin: 0;\n    padding: 0;\n    box-sizing: border-box;\n}\n\nbody {\n    font-family: sans-serif;\n}',
      sql: '-- Nuevo archivo SQL\n\nSELECT * FROM users\nWHERE active = 1\nORDER BY created_at DESC;',
      shell: '#!/bin/bash\n\n# Nuevo script Shell\n\necho "Hello World!"',
      json: '{\n    "name": "proyecto",\n    "version": "1.0.0",\n    "description": ""\n}',
      markdown: '# Título\n\n## Subtítulo\n\nContenido del documento.',
      default: '// Nuevo archivo\n'
    }
    return templates[lang] || templates.default
  }

  // Cerrar archivo
  const handleCloseFile = useCallback((fileId, e) => {
    e.stopPropagation()
    const file = files.find(f => f.id === fileId)

    if (file && !file.saved) {
      if (!confirm(`¿Cerrar ${file.name} sin guardar los cambios?`)) {
        return
      }
    }

    setFiles(prev => prev.filter(f => f.id !== fileId))

    if (activeFileId === fileId) {
      const remaining = files.filter(f => f.id !== fileId)
      setActiveFileId(remaining[0]?.id || null)
    }
  }, [files, activeFileId])

  // Ejecutar comando de IA
  const executeAICommand = useCallback(async (command, customPrompt = '') => {
    const code = selectedText || activeFile?.content || ''
    const prompt = customPrompt || command.prompt

    setAiLoading(true)
    setAiResponse('')

    try {
      // Simular llamada a IA (en producción esto iría al backend)
      await new Promise(resolve => setTimeout(resolve, 1500))

      // Generar respuesta simulada según el comando
      let response = ''
      switch(command.id) {
        case 'explain':
          response = `## Explicación del código\n\nEste código realiza las siguientes operaciones:\n\n1. **Inicialización**: Define las variables y estructuras necesarias.\n2. **Procesamiento**: Ejecuta la lógica principal.\n3. **Retorno**: Devuelve el resultado procesado.\n\n### Complejidad\n- Tiempo: O(n)\n- Espacio: O(1)`
          break
        case 'optimize':
          response = `## Código optimizado\n\n\`\`\`${activeFile?.language || 'javascript'}\n// Versión optimizada\n${code}\n\`\`\`\n\n### Mejoras aplicadas:\n- Reducción de iteraciones innecesarias\n- Uso de estructuras de datos más eficientes\n- Eliminación de código redundante`
          break
        case 'refactor':
          response = `## Código refactorizado\n\n\`\`\`${activeFile?.language || 'javascript'}\n// Código refactorizado siguiendo SOLID\n${code}\n\`\`\`\n\n### Principios aplicados:\n- Single Responsibility\n- Open/Closed\n- Dependency Inversion`
          break
        case 'debug':
          response = `## Análisis de bugs\n\n### Posibles problemas encontrados:\n\n1. **Línea 5**: Posible null pointer exception\n2. **Línea 12**: Variable no inicializada antes de uso\n3. **Línea 18**: Falta manejo de errores\n\n### Recomendaciones:\n- Agregar validaciones null\n- Inicializar variables\n- Implementar try-catch`
          break
        case 'document':
          response = `## Código documentado\n\n\`\`\`${activeFile?.language || 'javascript'}\n/**\n * Descripción de la función\n * @param {type} param - Descripción del parámetro\n * @returns {type} Descripción del retorno\n */\n${code}\n\`\`\``
          break
        case 'test':
          response = `## Tests generados\n\n\`\`\`${activeFile?.language || 'javascript'}\ndescribe('TestSuite', () => {\n  it('should handle basic case', () => {\n    expect(result).toBeDefined();\n  });\n\n  it('should handle edge cases', () => {\n    expect(result).not.toBeNull();\n  });\n});\n\`\`\``
          break
        case 'security':
          response = `## Análisis de seguridad\n\n### Vulnerabilidades detectadas:\n\n⚠️ **SQL Injection**: Línea 15\n⚠️ **XSS**: Línea 23\n✅ **CSRF**: No detectado\n\n### Recomendaciones:\n- Usar consultas parametrizadas\n- Sanitizar entradas de usuario\n- Implementar validación de datos`
          break
        default:
          response = `## Respuesta de IA\n\nAnálisis completado para el código proporcionado.\n\n${customPrompt ? `Prompt: ${customPrompt}` : ''}`
      }

      setAiResponse(response)
      setAiHistory(prev => [...prev, {
        command: command.label || 'Personalizado',
        prompt: prompt,
        response: response,
        timestamp: new Date().toISOString()
      }])

    } catch (error) {
      setAiResponse(`Error: ${error.message}`)
    } finally {
      setAiLoading(false)
    }
  }, [activeFile, selectedText])

  // Insertar respuesta de IA en el código
  const insertAIResponse = useCallback(() => {
    if (!aiResponse || !activeFile) return

    // Extraer código de la respuesta (si hay bloques de código)
    const codeMatch = aiResponse.match(/```[\w]*\n([\s\S]*?)```/)
    const codeToInsert = codeMatch ? codeMatch[1] : aiResponse

    const textarea = textareaRef.current
    if (textarea) {
      const start = textarea.selectionStart
      const end = textarea.selectionEnd
      const currentContent = activeFile.content
      const newContent = currentContent.substring(0, start) + '\n' + codeToInsert + '\n' + currentContent.substring(end)

      setFiles(prev => prev.map(f =>
        f.id === activeFileId
          ? { ...f, content: newContent, saved: false }
          : f
      ))
    }
  }, [aiResponse, activeFile, activeFileId])

  // Exportar a Workflow
  const exportToWorkflow = useCallback(() => {
    if (!activeFile) return

    const workflowAction = {
      type: 'code_execution',
      name: `Ejecutar ${activeFile.name}`,
      language: activeFile.language,
      code: activeFile.content,
      createdFrom: 'code_editor',
      createdAt: new Date().toISOString()
    }

    // Guardar en localStorage para que Workflows lo pueda cargar
    const savedWorkflowActions = JSON.parse(localStorage.getItem('alqvimia_workflow_code_actions') || '[]')
    savedWorkflowActions.push(workflowAction)
    localStorage.setItem('alqvimia_workflow_code_actions', JSON.stringify(savedWorkflowActions))

    setShowExportWorkflow(false)
    setConsoleOutput(prev => [...prev, {
      type: 'info',
      message: `Código exportado a Workflows como "${workflowAction.name}"`,
      timestamp: new Date().toLocaleTimeString()
    }])
  }, [activeFile])

  // Ejecutar código (simulado)
  const runCode = useCallback(() => {
    if (!activeFile) return

    setShowConsole(true)
    setConsoleOutput(prev => [...prev, {
      type: 'info',
      message: `Ejecutando ${activeFile.name}...`,
      timestamp: new Date().toLocaleTimeString()
    }])

    // Simular ejecución
    setTimeout(() => {
      setConsoleOutput(prev => [...prev, {
        type: 'output',
        message: 'Hello, Alqvimia!\n> Ejecución completada',
        timestamp: new Date().toLocaleTimeString()
      }])
    }, 500)
  }, [activeFile])

  // Obtener icono del lenguaje
  const getLanguageIcon = (langId) => {
    const lang = languages.find(l => l.id === langId)
    return lang?.icon || 'fa-file-code'
  }

  const getLanguageColor = (langId) => {
    const lang = languages.find(l => l.id === langId)
    return lang?.color || '#888'
  }

  // Renderizar números de línea
  const renderLineNumbers = useMemo(() => {
    if (!activeFile || !lineNumbers) return null
    const lines = activeFile.content.split('\n')
    return lines.map((_, i) => (
      <div key={i} className="line-number">{i + 1}</div>
    ))
  }, [activeFile?.content, lineNumbers])

  // Minimap
  const renderMinimap = useMemo(() => {
    if (!activeFile || !showMinimap) return null
    return (
      <div className="editor-minimap">
        <div className="minimap-content" style={{ fontSize: '2px', lineHeight: '3px' }}>
          {activeFile.content.split('\n').map((line, i) => (
            <div key={i} className="minimap-line">{line.substring(0, 100)}</div>
          ))}
        </div>
        <div className="minimap-viewport" style={{
          top: `${(cursorPosition.line / (activeFile.content.split('\n').length || 1)) * 100}%`,
          height: '20%'
        }} />
      </div>
    )
  }, [activeFile?.content, showMinimap, cursorPosition.line])

  return (
    <div className="code-editor-container">
      {/* Toolbar */}
      <div className="editor-toolbar">
        <div className="toolbar-left">
          <button className="toolbar-btn" onClick={() => setShowNewFileModal(true)} title={t('ce_new_file')}>
            <i className="fas fa-plus"></i>
            <span>{t('wf_new')}</span>
          </button>
          <button className="toolbar-btn" onClick={handleSaveFile} disabled={!activeFile || activeFile.saved} title={t('ce_save_file')}>
            <i className="fas fa-save"></i>
            <span>{t('btn_save')}</span>
          </button>
          <div className="toolbar-divider"></div>
          <button className="toolbar-btn" onClick={runCode} disabled={!activeFile} title={t('ce_run_code')}>
            <i className="fas fa-play"></i>
            <span>{t('btn_run')}</span>
          </button>
          <button className="toolbar-btn" onClick={() => setShowExportWorkflow(true)} disabled={!activeFile} title={t('ce_to_workflow')}>
            <i className="fas fa-share-alt"></i>
            <span>{t('ce_to_workflow')}</span>
          </button>
          <div className="toolbar-divider"></div>
          <button className="toolbar-btn" onClick={() => setShowSearch(!showSearch)} title={t('btn_search')}>
            <i className="fas fa-search"></i>
          </button>
          <button className="toolbar-btn" onClick={() => setShowAICommandModal(true)} title={t('ce_ai_commands')}>
            <i className="fas fa-magic"></i>
            <span>{t('wf_ai_generate')}</span>
          </button>
          <div className="toolbar-divider"></div>
          {voiceSupported && (
            <div className="voice-controls">
              <button
                className={`toolbar-btn voice-btn ${isListening && voiceMode === 'dictation' ? 'listening dictation' : ''}`}
                onClick={() => toggleVoiceListening('dictation')}
                title={isListening && voiceMode === 'dictation' ? 'Detener dictado' : 'Dictar código'}
              >
                <i className={`fas ${isListening && voiceMode === 'dictation' ? 'fa-stop-circle' : 'fa-microphone'}`}></i>
                <span>{t('ce_voice') || 'Voz'}</span>
              </button>
              {isListening && (
                <div className="voice-mode-indicator">
                  <span className={`mode-badge ${voiceMode}`}>
                    {voiceMode === 'dictation' ? 'Dictando...' : 'Comandos'}
                  </span>
                  <button
                    className="mode-switch-btn"
                    onClick={() => switchVoiceMode(voiceMode === 'dictation' ? 'command' : 'dictation')}
                    title={voiceMode === 'dictation' ? 'Cambiar a comandos' : 'Cambiar a dictado'}
                  >
                    <i className={`fas fa-${voiceMode === 'dictation' ? 'terminal' : 'keyboard'}`}></i>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="toolbar-right">
          <div className="font-size-control">
            <button onClick={() => setFontSize(prev => Math.max(prev - 2, 10))}>
              <i className="fas fa-minus"></i>
            </button>
            <span>{fontSize}px</span>
            <button onClick={() => setFontSize(prev => Math.min(prev + 2, 32))}>
              <i className="fas fa-plus"></i>
            </button>
          </div>
          <button className={`toolbar-btn ${wordWrap ? 'active' : ''}`} onClick={() => setWordWrap(!wordWrap)} title="Word Wrap">
            <i className="fas fa-text-width"></i>
          </button>
          <button className={`toolbar-btn ${showMinimap ? 'active' : ''}`} onClick={() => setShowMinimap(!showMinimap)} title="Minimap">
            <i className="fas fa-map"></i>
          </button>
          <button className={`toolbar-btn ${showAIPanel ? 'active' : ''}`} onClick={() => setShowAIPanel(!showAIPanel)} title="Panel IA">
            <i className="fas fa-robot"></i>
          </button>
        </div>
      </div>

      {/* Search Bar */}
      {showSearch && (
        <div className="search-bar">
          <i className="fas fa-search"></i>
          <input
            type="text"
            placeholder="Buscar en el archivo..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            autoFocus
          />
          <span className="search-count">0 resultados</span>
          <button onClick={() => setShowSearch(false)}>
            <i className="fas fa-times"></i>
          </button>
        </div>
      )}

      {/* Main Editor Area */}
      <div className="editor-main">
        {/* File Explorer */}
        <div className="file-explorer">
          <div className="explorer-header">
            <i className="fas fa-folder-open"></i>
            <span>Archivos</span>
          </div>
          <div className="file-list">
            {files.map(file => (
              <div
                key={file.id}
                className={`file-item ${activeFileId === file.id ? 'active' : ''} ${!file.saved ? 'unsaved' : ''}`}
                onClick={() => setActiveFileId(file.id)}
              >
                <i className={`fab ${getLanguageIcon(file.language)}`} style={{ color: getLanguageColor(file.language) }}></i>
                <span className="file-name">{file.name}</span>
                {!file.saved && <span className="unsaved-dot">●</span>}
                <button className="close-file-btn" onClick={(e) => handleCloseFile(file.id, e)}>
                  <i className="fas fa-times"></i>
                </button>
              </div>
            ))}
          </div>
          <button className="add-file-btn" onClick={() => setShowNewFileModal(true)}>
            <i className="fas fa-plus"></i>
            <span>Nuevo archivo</span>
          </button>
        </div>

        {/* Editor Panel */}
        <div className="editor-panel">
          {/* Tabs */}
          <div className="editor-tabs">
            {files.map(file => (
              <div
                key={file.id}
                className={`editor-tab ${activeFileId === file.id ? 'active' : ''}`}
                onClick={() => setActiveFileId(file.id)}
              >
                <i className={`fab ${getLanguageIcon(file.language)}`} style={{ color: getLanguageColor(file.language) }}></i>
                <span>{file.name}</span>
                {!file.saved && <span className="unsaved-indicator">●</span>}
                <button className="tab-close" onClick={(e) => handleCloseFile(file.id, e)}>
                  <i className="fas fa-times"></i>
                </button>
              </div>
            ))}
          </div>

          {/* Dictation Live Preview Banner - Solo mostrar cuando el target es el editor */}
          {isListening && voiceMode === 'dictation' && dictationTarget === 'editor' && dictationBuffer && (
            <div className="dictation-live-banner">
              <div className="dictation-live-icon">
                <i className="fas fa-microphone"></i>
              </div>
              <div className="dictation-live-text">
                <span className="dictation-live-label">Dictando al Editor:</span>
                <span className="dictation-live-content">{dictationBuffer}</span>
              </div>
              <div className="dictation-live-hint">
                Haz clic en el prompt IA para dictar ahí
              </div>
            </div>
          )}

          {/* Code Editor */}
          <div className="code-area" ref={editorRef}>
            {activeFile ? (
              <>
                {lineNumbers && (
                  <div className="line-numbers">
                    {renderLineNumbers}
                  </div>
                )}
                <textarea
                  ref={textareaRef}
                  className="code-input"
                  value={activeFile.content}
                  onChange={handleContentChange}
                  onSelect={handleCursorChange}
                  onClick={handleCursorChange}
                  onKeyUp={handleCursorChange}
                  onFocus={() => setDictationTarget('editor')}
                  style={{
                    fontSize: `${fontSize}px`,
                    whiteSpace: wordWrap ? 'pre-wrap' : 'pre',
                    overflowX: wordWrap ? 'hidden' : 'auto'
                  }}
                  spellCheck={false}
                />
                {renderMinimap}
              </>
            ) : (
              <div className="no-file-open">
                <i className="fas fa-file-code"></i>
                <h3>No hay archivo abierto</h3>
                <p>Crea un nuevo archivo o selecciona uno existente</p>
                <button className="btn btn-primary" onClick={() => setShowNewFileModal(true)}>
                  <i className="fas fa-plus"></i>
                  Nuevo Archivo
                </button>
              </div>
            )}
          </div>

          {/* Status Bar */}
          <div className="editor-statusbar">
            <div className="status-left">
              {activeFile && (
                <>
                  <span className="status-item">
                    <i className={`fab ${getLanguageIcon(activeFile.language)}`}></i>
                    {languages.find(l => l.id === activeFile.language)?.name || activeFile.language}
                  </span>
                  <span className="status-item">
                    Ln {cursorPosition.line}, Col {cursorPosition.column}
                  </span>
                  <span className="status-item">
                    {activeFile.content.split('\n').length} líneas
                  </span>
                </>
              )}
            </div>
            <div className="status-right">
              {isListening && (
                <span className={`status-item voice-status listening ${voiceMode}`}>
                  <i className={`fas fa-${voiceMode === 'dictation' ? 'keyboard' : 'microphone'}`}></i>
                  {voiceMode === 'dictation' ? (
                    voiceTranscript ? (
                      <span className="dictation-preview">
                        <span className="dictation-label">Dictando:</span>
                        "{voiceTranscript.substring(0, 50)}{voiceTranscript.length > 50 ? '...' : ''}"
                      </span>
                    ) : 'Esperando dictado...'
                  ) : (
                    voiceTranscript ? `"${voiceTranscript.substring(0, 30)}..."` : 'Escuchando comandos...'
                  )}
                </span>
              )}
              <span className="status-item">UTF-8</span>
              <span className="status-item">
                {activeFile?.saved ? '✓ Guardado' : '● Sin guardar'}
              </span>
            </div>
          </div>
        </div>

        {/* AI Panel - Restructured with prompt at bottom */}
        {showAIPanel && (
          <div className="ai-panel">
            <div className="ai-panel-header">
              <i className="fas fa-robot"></i>
              <span>Asistente IA</span>
              <button onClick={() => setShowAIPanel(false)}>
                <i className="fas fa-times"></i>
              </button>
            </div>

            {/* AI Commands - Compact grid */}
            <div className="ai-commands">
              <h4>Comandos rápidos</h4>
              <div className="command-grid">
                {aiCommands.slice(0, 6).map(cmd => (
                  <button
                    key={cmd.id}
                    className="ai-command-btn"
                    onClick={() => executeAICommand(cmd)}
                    disabled={!activeFile || aiLoading}
                  >
                    <i className={`fas ${cmd.icon}`}></i>
                    <span>{cmd.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* AI Response - Scrollable area in the middle */}
            <div className="ai-response-area">
              {aiLoading ? (
                <div className="ai-loading">
                  <i className="fas fa-spinner fa-spin"></i>
                  <span>Procesando...</span>
                </div>
              ) : aiResponse ? (
                <>
                  <div className="response-content">
                    <pre>{aiResponse}</pre>
                  </div>
                  <div className="response-actions">
                    <button className="btn btn-sm btn-success" onClick={insertAIResponse}>
                      <i className="fas fa-plus"></i>
                      Insertar
                    </button>
                    <button className="btn btn-sm btn-secondary" onClick={() => navigator.clipboard.writeText(aiResponse)}>
                      <i className="fas fa-copy"></i>
                      Copiar
                    </button>
                  </div>
                </>
              ) : (
                <div className="ai-empty-state">
                  <i className="fas fa-comments"></i>
                  <p>Escribe una instrucción o usa un comando rápido</p>
                </div>
              )}
            </div>

            {/* AI Prompt - Fixed at bottom */}
            <div className="ai-prompt-bottom">
              {isListening && voiceMode === 'dictation' && dictationTarget === 'aiPrompt' && (
                <div className="dictation-target-indicator active">
                  <i className="fas fa-microphone"></i>
                  <span>Dictando al prompt: {voiceTranscript || 'Esperando...'}</span>
                </div>
              )}
              <div className="ai-prompt-input-wrapper">
                <textarea
                  ref={aiPromptRef}
                  className="ai-prompt-textarea"
                  placeholder="Escribe o dicta tu instrucción..."
                  value={aiPrompt}
                  onChange={(e) => setAiPrompt(e.target.value)}
                  onFocus={() => setDictationTarget('aiPrompt')}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey && aiPrompt.trim()) {
                      e.preventDefault()
                      executeAICommand({ id: 'custom', label: 'Personalizado' }, aiPrompt)
                    }
                  }}
                  rows={2}
                />
                <button
                  className="ai-send-btn"
                  onClick={() => executeAICommand({ id: 'custom', label: 'Personalizado' }, aiPrompt)}
                  disabled={!aiPrompt.trim() || aiLoading}
                  title="Enviar (Enter)"
                >
                  {aiLoading ? <i className="fas fa-spinner fa-spin"></i> : <i className="fas fa-paper-plane"></i>}
                </button>
              </div>
              <div className="ai-prompt-hint">
                <span>Shift+Enter para nueva línea</span>
                {voiceSupported && (
                  <button
                    className={`voice-prompt-btn ${isListening && voiceMode === 'dictation' && dictationTarget === 'aiPrompt' ? 'active' : ''}`}
                    onClick={() => {
                      setDictationTarget('aiPrompt')
                      if (!isListening) {
                        toggleVoiceListening('dictation')
                      }
                    }}
                    title="Dictar al prompt"
                  >
                    <i className="fas fa-microphone"></i>
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Console */}
      {showConsole && (
        <div className="editor-console">
          <div className="console-header">
            <span><i className="fas fa-terminal"></i> {t('ce_console')}</span>
            <div className="console-actions">
              <button onClick={() => setConsoleOutput([])} title={t('ce_clear_console')}>
                <i className="fas fa-trash"></i>
              </button>
              <button onClick={() => setShowConsole(false)} title={t('btn_close')}>
                <i className="fas fa-times"></i>
              </button>
            </div>
          </div>
          <div className="console-output">
            {consoleOutput.map((log, i) => (
              <div key={i} className={`console-line ${log.type}`}>
                <span className="console-time">[{log.timestamp}]</span>
                <span className="console-message">{log.message}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modal: Nuevo Archivo */}
      {showNewFileModal && (
        <div className="modal-overlay" onClick={() => setShowNewFileModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3><i className="fas fa-file-plus"></i> {t('ce_new_file')}</h3>
              <button className="modal-close" onClick={() => setShowNewFileModal(false)}>
                <i className="fas fa-times"></i>
              </button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label><i className="fas fa-file"></i> Nombre del archivo</label>
                <input
                  type="text"
                  className="form-control"
                  value={newFileName}
                  onChange={(e) => setNewFileName(e.target.value)}
                  placeholder="ejemplo.js"
                  autoFocus
                />
              </div>
              <div className="form-group">
                <label><i className="fas fa-code"></i> Lenguaje</label>
                <select
                  className="form-control"
                  value={newFileLanguage}
                  onChange={(e) => setNewFileLanguage(e.target.value)}
                >
                  {languages.map(lang => (
                    <option key={lang.id} value={lang.id}>{lang.name}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setShowNewFileModal(false)}>
                Cancelar
              </button>
              <button className="btn btn-primary" onClick={handleCreateFile} disabled={!newFileName.trim()}>
                <i className="fas fa-plus"></i>
                Crear Archivo
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Comando IA */}
      {showAICommandModal && (
        <div className="modal-overlay" onClick={() => setShowAICommandModal(false)}>
          <div className="modal-content ai-command-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3><i className="fas fa-magic"></i> Comando de IA</h3>
              <button className="modal-close" onClick={() => setShowAICommandModal(false)}>
                <i className="fas fa-times"></i>
              </button>
            </div>
            <div className="modal-body">
              <p className="hint">Selecciona un comando o escribe tu propia instrucción:</p>

              <div className="ai-commands-grid">
                {aiCommands.map(cmd => (
                  <button
                    key={cmd.id}
                    className="ai-command-card"
                    onClick={() => {
                      executeAICommand(cmd)
                      setShowAICommandModal(false)
                    }}
                  >
                    <i className={`fas ${cmd.icon}`}></i>
                    <span>{cmd.label}</span>
                  </button>
                ))}
              </div>

              <div className="custom-prompt-section">
                <label>Instrucción personalizada:</label>
                <textarea
                  className="form-control"
                  placeholder="Ej: Convierte esta función a async/await..."
                  value={aiPrompt}
                  onChange={(e) => setAiPrompt(e.target.value)}
                  rows={3}
                />
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setShowAICommandModal(false)}>
                Cancelar
              </button>
              <button
                className="btn btn-primary"
                onClick={() => {
                  executeAICommand({ id: 'custom', label: 'Personalizado' }, aiPrompt)
                  setShowAICommandModal(false)
                }}
                disabled={!aiPrompt.trim()}
              >
                <i className="fas fa-paper-plane"></i>
                Ejecutar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Exportar a Workflow */}
      {showExportWorkflow && (
        <div className="modal-overlay" onClick={() => setShowExportWorkflow(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3><i className="fas fa-share-alt"></i> Exportar a Workflow</h3>
              <button className="modal-close" onClick={() => setShowExportWorkflow(false)}>
                <i className="fas fa-times"></i>
              </button>
            </div>
            <div className="modal-body">
              <p>Se creará una acción en Workflows con el siguiente código:</p>

              <div className="export-preview">
                <div className="preview-header">
                  <i className={`fab ${getLanguageIcon(activeFile?.language)}`} style={{ color: getLanguageColor(activeFile?.language) }}></i>
                  <span>{activeFile?.name}</span>
                </div>
                <pre className="preview-code">{activeFile?.content?.substring(0, 500)}...</pre>
              </div>

              <p className="hint">
                <i className="fas fa-info-circle"></i>
                El código estará disponible en Workflows para crear flujos de automatización.
              </p>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setShowExportWorkflow(false)}>
                Cancelar
              </button>
              <button className="btn btn-success" onClick={exportToWorkflow}>
                <i className="fas fa-check"></i>
                Exportar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default CodeEditorView
