import { useState, useRef, useEffect } from 'react'
import { useSocket } from '../context/SocketContext'
import { useLanguage } from '../context/LanguageContext'

function SpyView() {
  const { t } = useLanguage()
  const [spyUrl, setSpyUrl] = useState('https://www.google.com')
  const [inspectorVisible, setInspectorVisible] = useState(false)
  const [selectedElement, setSelectedElement] = useState({
    tag: '',
    id: '',
    className: '',
    name: '',
    text: '',
    href: '',
    src: '',
    type: '',
    value: '',
    xpath: '',
    cssSelector: ''
  })
  const [selectors, setSelectors] = useState([])
  const [spyMode, setSpyMode] = useState('iframe') // 'iframe', 'bookmarklet', 'extension', 'desktop'
  const [isSpying, setIsSpying] = useState(false)
  const [showHelp, setShowHelp] = useState(false)
  const [recentElements, setRecentElements] = useState([])
  const [highlightColor, setHighlightColor] = useState('#ff6b6b')
  const [autoScroll, setAutoScroll] = useState(true)
  const { socket, isConnected } = useSocket()
  const iframeRef = useRef(null)

  // Estado para ventanas de Windows
  const [windowsList, setWindowsList] = useState([])
  const [selectedWindow, setSelectedWindow] = useState(null)
  const [loadingWindows, setLoadingWindows] = useState(false)
  const [windowsError, setWindowsError] = useState(null)

  // Bookmarklet code para inyectar en cualquier página
  const serverPort = 4000
  const serverHost = window.location.hostname || 'localhost'
  const bookmarkletCode = `javascript:(function(){var s=document.createElement('script');s.src='http://${serverHost}:${serverPort}/spy-injector.js';s.onload=function(){var ws=new WebSocket('ws://${serverHost}:${serverPort}');ws.onopen=function(){console.log('Alqvimia Spy conectado');window.AlqvimiaSpyWS=ws};ws.onmessage=function(e){if(e.data){try{var d=JSON.parse(e.data);if(d.type==='element-selected')console.log('Elemento:',d)}catch(x){}}};ws.onerror=function(e){console.error('WebSocket error:',e)}};document.body.appendChild(s)})();`

  // Código legible para mostrar al usuario
  const bookmarkletCodeReadable = `// Alqvimia Element Spy - Código para consola
(function() {
  var script = document.createElement('script');
  script.src = 'http://${serverHost}:${serverPort}/spy-injector.js';
  script.onload = function() {
    console.log('✅ Alqvimia Spy cargado correctamente');
  };
  script.onerror = function() {
    console.error('❌ Error: No se pudo conectar al servidor Alqvimia');
  };
  document.body.appendChild(script);
})();`

  // Función para copiar el código del bookmarklet
  const copyBookmarkletCode = () => {
    navigator.clipboard.writeText(bookmarkletCodeReadable)
    alert('Código copiado. Pégalo en la consola del navegador (F12 > Console)')
  }

  // Función para ejecutar spy en nueva ventana
  const openSpyInNewTab = () => {
    const newWindow = window.open(spyUrl, '_blank')
    if (newWindow) {
      // Esperar a que cargue y luego inyectar
      setTimeout(() => {
        alert(`Página abierta en nueva pestaña.\n\nPara activar el Spy:\n1. Ve a la nueva pestaña\n2. Presiona F12 para abrir DevTools\n3. Ve a la pestaña "Console"\n4. Pega el código (Ctrl+V)\n5. Presiona Enter\n\n¿Copiar código ahora?`)
        copyBookmarkletCode()
      }, 1000)
    }
  }

  // Generar selectores para un elemento
  const generateSelectors = (element) => {
    const selectorList = []

    // ID selector
    if (element.id) {
      selectorList.push({ type: 'ID', value: `#${element.id}`, priority: 1 })
    }

    // CSS Selector
    if (element.cssSelector) {
      selectorList.push({ type: 'CSS', value: element.cssSelector, priority: 2 })
    }

    // Class selector
    if (element.className) {
      const classes = element.className.split(' ').filter(c => c.trim())
      if (classes.length > 0) {
        selectorList.push({ type: 'Class', value: `.${classes.join('.')}`, priority: 3 })
      }
    }

    // Name selector
    if (element.name) {
      selectorList.push({ type: 'Name', value: `[name="${element.name}"]`, priority: 4 })
    }

    // XPath
    if (element.xpath) {
      selectorList.push({ type: 'XPath', value: element.xpath, priority: 5 })
    }

    // Data attributes
    if (element.dataTestId) {
      selectorList.push({ type: 'Data-TestId', value: `[data-testid="${element.dataTestId}"]`, priority: 1 })
    }

    // Tag + attributes combination
    if (element.tag) {
      let combined = element.tag.toLowerCase()
      if (element.type) combined += `[type="${element.type}"]`
      if (element.href) combined += `[href="${element.href}"]`
      selectorList.push({ type: 'Tag+Attr', value: combined, priority: 6 })
    }

    return selectorList.sort((a, b) => a.priority - b.priority)
  }

  // Manejar mensaje del iframe
  useEffect(() => {
    const handleMessage = (event) => {
      if (event.data && event.data.type === 'ALQVIMIA_ELEMENT_SELECTED') {
        const elem = event.data.element
        setSelectedElement(elem)
        setSelectors(generateSelectors(elem))
        setInspectorVisible(true)
        setRecentElements(prev => [elem, ...prev.slice(0, 9)])
      }
    }

    window.addEventListener('message', handleMessage)
    return () => window.removeEventListener('message', handleMessage)
  }, [])

  // Escuchar eventos del socket para modo servidor
  useEffect(() => {
    if (socket) {
      socket.on('element-selected', (data) => {
        setSelectedElement(data)
        setSelectors(generateSelectors(data))
        setInspectorVisible(true)
        setRecentElements(prev => [data, ...prev.slice(0, 9)])
      })
    }
  }, [socket])

  // Cargar ventanas de Windows
  const fetchWindowsList = async () => {
    setLoadingWindows(true)
    setWindowsError(null)
    try {
      const response = await fetch('http://localhost:4000/api/windows')
      const data = await response.json()
      if (data.success) {
        setWindowsList(data.windows || [])
      } else {
        setWindowsError(data.error || 'Error al obtener ventanas')
      }
    } catch (error) {
      console.error('Error fetching windows:', error)
      setWindowsError('No se pudo conectar al servidor')
    } finally {
      setLoadingWindows(false)
    }
  }

  // Cargar ventanas al cambiar a modo desktop
  useEffect(() => {
    if (spyMode === 'desktop') {
      fetchWindowsList()
    }
  }, [spyMode])

  // Obtener icono según tipo de ventana
  const getWindowIcon = (type) => {
    const icons = {
      browser: 'fa-globe',
      editor: 'fa-code',
      explorer: 'fa-folder',
      terminal: 'fa-terminal',
      office: 'fa-file-alt',
      application: 'fa-window-maximize'
    }
    return icons[type] || icons.application
  }

  const launchSpy = () => {
    if (spyMode === 'iframe') {
      // Modo iframe - carga la página en un iframe con inyección de script
      setIsSpying(true)
    } else if (spyMode === 'bookmarklet') {
      // Muestra instrucciones para bookmarklet
      setShowHelp(true)
    } else if (spyMode === 'extension') {
      // Modo servidor - requiere conexión
      if (!isConnected) {
        alert('Conecta al servidor primero para usar el modo Extension')
        return
      }
      if (socket) {
        socket.emit('launch-spy', { url: spyUrl })
        setIsSpying(true)
      }
    }
  }

  const stopSpy = () => {
    setIsSpying(false)
    if (spyMode === 'extension' && socket) {
      socket.emit('stop-spy')
    }
  }

  const addToWorkflow = () => {
    if (selectors.length > 0) {
      // Guardar en localStorage para que Workflows lo pueda usar
      const workflowAction = {
        type: 'element_interaction',
        element: selectedElement,
        selectors: selectors,
        createdAt: new Date().toISOString()
      }
      const saved = JSON.parse(localStorage.getItem('alqvimia_spy_elements') || '[]')
      saved.push(workflowAction)
      localStorage.setItem('alqvimia_spy_elements', JSON.stringify(saved))
      alert('Elemento agregado a Workflow')
    }
  }

  const copySelector = (selector) => {
    navigator.clipboard.writeText(selector || selectors[0]?.value || '')
    // Feedback visual
    const btn = document.activeElement
    if (btn) {
      const original = btn.innerHTML
      btn.innerHTML = '<i class="fas fa-check"></i> Copiado!'
      setTimeout(() => btn.innerHTML = original, 1500)
    }
  }

  const copyAllSelectors = () => {
    const allSelectors = selectors.map(s => `${s.type}: ${s.value}`).join('\n')
    navigator.clipboard.writeText(allSelectors)
  }

  // Script para inyectar en el iframe
  const iframeScript = `
    <script>
      document.addEventListener('mouseover', function(e) {
        e.target.style.outline = '2px solid ${highlightColor}';
        e.target.style.outlineOffset = '2px';
      });
      document.addEventListener('mouseout', function(e) {
        e.target.style.outline = '';
        e.target.style.outlineOffset = '';
      });
      document.addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation();

        var elem = e.target;
        var xpath = '';
        var current = elem;
        while (current && current.nodeType === 1) {
          var index = 1;
          var sibling = current.previousSibling;
          while (sibling) {
            if (sibling.nodeType === 1 && sibling.tagName === current.tagName) index++;
            sibling = sibling.previousSibling;
          }
          xpath = '/' + current.tagName.toLowerCase() + '[' + index + ']' + xpath;
          current = current.parentNode;
        }

        var cssSelector = '';
        if (elem.id) cssSelector = '#' + elem.id;
        else if (elem.className) cssSelector = elem.tagName.toLowerCase() + '.' + elem.className.split(' ').join('.');
        else cssSelector = elem.tagName.toLowerCase();

        window.parent.postMessage({
          type: 'ALQVIMIA_ELEMENT_SELECTED',
          element: {
            tag: elem.tagName,
            id: elem.id || '',
            className: elem.className || '',
            name: elem.name || '',
            text: elem.innerText?.substring(0, 100) || '',
            href: elem.href || '',
            src: elem.src || '',
            type: elem.type || '',
            value: elem.value || '',
            xpath: xpath,
            cssSelector: cssSelector,
            dataTestId: elem.dataset?.testid || ''
          }
        }, '*');
      }, true);
    </script>
  `

  return (
    <div className="view active" id="spy-view">
      <div className="view-header">
        <h2><i className="fas fa-search"></i> {t('spy_title')}</h2>
        <p>{t('spy_subtitle')}</p>
        <button className="btn btn-sm btn-secondary help-btn" onClick={() => setShowHelp(!showHelp)}>
          <i className="fas fa-question-circle"></i> {t('help_title')}
        </button>
      </div>

      {/* Panel de ayuda */}
      {showHelp && (
        <div className="spy-help-panel">
          <div className="help-header">
            <h3><i className="fas fa-info-circle"></i> {t('spy_help_title')}</h3>
            <button onClick={() => setShowHelp(false)}><i className="fas fa-times"></i></button>
          </div>
          <div className="help-content">
            <p>{t('spy_help_intro')}</p>

            <h4><i className="fas fa-cogs"></i> {t('spy_modes')}</h4>
            <div className="help-modes">
              <div className="help-mode">
                <h5><i className="fas fa-window-maximize"></i> {t('spy_mode_iframe')}</h5>
                <p>{t('spy_mode_iframe_desc')}</p>
                <ul>
                  {t('spy_mode_iframe_features').split('|').map((feat, i) => (
                    <li key={i}>{feat}</li>
                  ))}
                </ul>
              </div>
              <div className="help-mode bookmarklet-mode">
                <h5><i className="fas fa-bookmark"></i> {t('spy_mode_bookmarklet')}</h5>
                <p>{t('spy_mode_bookmarklet_desc')}</p>

                <div className="bookmarklet-options">
                  <div className="bookmarklet-option">
                    <h6><i className="fas fa-bookmark"></i> Opción 1: Crear bookmarklet</h6>
                    <p>Crea un nuevo favorito y pega este código en el campo URL:</p>
                    <div className="code-container">
                      <pre className="bookmarklet-code bookmarklet-url">{bookmarkletCode}</pre>
                      <button
                        className="btn btn-sm btn-secondary copy-code-btn"
                        onClick={() => {
                          navigator.clipboard.writeText(bookmarkletCode)
                          alert('Código copiado. Crea un nuevo favorito y pégalo en el campo URL.')
                        }}
                      >
                        <i className="fas fa-copy"></i> Copiar URL
                      </button>
                    </div>
                  </div>

                  <div className="bookmarklet-option">
                    <h6><i className="fas fa-terminal"></i> Opción 2: Ejecutar en consola</h6>
                    <p>Copia y pega este código en la consola del navegador (F12):</p>
                    <div className="code-container">
                      <pre className="bookmarklet-code">{bookmarkletCodeReadable}</pre>
                      <button className="btn btn-sm btn-primary copy-code-btn" onClick={copyBookmarkletCode}>
                        <i className="fas fa-copy"></i> Copiar código
                      </button>
                    </div>
                  </div>

                  <div className="bookmarklet-option">
                    <h6><i className="fas fa-external-link-alt"></i> Opción 3: Abrir y ejecutar</h6>
                    <p>Abre la página en nueva pestaña y ejecuta el spy:</p>
                    <button className="btn btn-sm btn-secondary" onClick={openSpyInNewTab}>
                      <i className="fas fa-external-link-alt"></i> Abrir {spyUrl.substring(0, 30)}...
                    </button>
                  </div>
                </div>

                <div className="bookmarklet-steps">
                  <h6><i className="fas fa-list-ol"></i> Pasos para usar:</h6>
                  <ol>
                    <li>Navega a la página que quieres inspeccionar</li>
                    <li>Usa una de las opciones anteriores para activar el Spy</li>
                    <li>Verás un indicador "🎯 Alqvimia Spy" en la esquina</li>
                    <li>Pasa el mouse sobre elementos para resaltarlos</li>
                    <li>Haz clic para capturar el selector</li>
                    <li>Presiona ESC para desactivar</li>
                  </ol>
                </div>
              </div>
              <div className="help-mode">
                <h5><i className="fas fa-plug"></i> {t('spy_mode_extension')}</h5>
                <p>{t('spy_mode_extension_desc')}</p>
                <ul>
                  {t('spy_mode_extension_features').split('|').map((feat, i) => (
                    <li key={i}>{feat}</li>
                  ))}
                </ul>
              </div>
            </div>

            <h4><i className="fas fa-mouse-pointer"></i> {t('spy_how_to_use')}</h4>
            <ol>
              <li>{t('spy_step_1')}</li>
              <li>{t('spy_step_2')}</li>
              <li>{t('spy_step_3')}</li>
              <li>{t('spy_step_4')}</li>
            </ol>
          </div>
        </div>
      )}

      <div className="spy-tools">
        {/* Configuración */}
        <div className="spy-config-row">
          <div className="tool-group url-group">
            <label><i className="fas fa-globe"></i> {t('spy_url_label')}:</label>
            <div className="input-group">
              <input
                type="text"
                placeholder={t('spy_url_placeholder')}
                value={spyUrl}
                onChange={(e) => setSpyUrl(e.target.value)}
              />
              {!isSpying ? (
                <button className="btn btn-primary" onClick={launchSpy}>
                  <i className="fas fa-rocket"></i> {t('spy_load_page')}
                </button>
              ) : (
                <button className="btn btn-danger" onClick={stopSpy}>
                  <i className="fas fa-stop"></i> {t('btn_stop')}
                </button>
              )}
            </div>
          </div>

          <div className="tool-group mode-group">
            <label><i className="fas fa-cog"></i> {t('spy_modes')}:</label>
            <div className="mode-selector">
              <button
                className={`mode-btn ${spyMode === 'iframe' ? 'active' : ''}`}
                onClick={() => setSpyMode('iframe')}
                title={t('spy_mode_iframe_desc')}
              >
                <i className="fas fa-window-maximize"></i>
                <span>Iframe</span>
              </button>
              <button
                className={`mode-btn ${spyMode === 'bookmarklet' ? 'active' : ''}`}
                onClick={() => { setSpyMode('bookmarklet'); setShowHelp(true); }}
                title={t('spy_mode_bookmarklet_desc')}
              >
                <i className="fas fa-bookmark"></i>
                <span>Bookmarklet</span>
              </button>
              <button
                className={`mode-btn ${spyMode === 'extension' ? 'active' : ''}`}
                onClick={() => setSpyMode('extension')}
                title={t('spy_mode_extension_desc')}
                disabled={!isConnected}
              >
                <i className="fas fa-plug"></i>
                <span>Extension</span>
                {!isConnected && <small>({t('disconnected')})</small>}
              </button>
              <button
                className={`mode-btn ${spyMode === 'desktop' ? 'active' : ''}`}
                onClick={() => setSpyMode('desktop')}
                title={t('spy_mode_desktop_desc') || 'Espiar ventanas de Windows'}
              >
                <i className="fas fa-desktop"></i>
                <span>Desktop</span>
              </button>
            </div>
          </div>

          <div className="tool-group options-group">
            <label><i className="fas fa-palette"></i> {t('spy_highlight_color')}:</label>
            <input
              type="color"
              value={highlightColor}
              onChange={(e) => setHighlightColor(e.target.value)}
              title={t('spy_highlight_color')}
            />
          </div>
        </div>

        {/* Panel de selector de ventanas Windows */}
        {spyMode === 'desktop' && (
          <div className="windows-selector-panel">
            <div className="windows-panel-header">
              <h3><i className="fas fa-desktop"></i> {t('spy_windows_title') || 'Ventanas de Windows'}</h3>
              <button
                className="btn btn-sm btn-secondary"
                onClick={fetchWindowsList}
                disabled={loadingWindows}
              >
                <i className={`fas fa-sync ${loadingWindows ? 'fa-spin' : ''}`}></i>
                {t('btn_refresh') || 'Actualizar'}
              </button>
            </div>

            {windowsError && (
              <div className="windows-error">
                <i className="fas fa-exclamation-triangle"></i>
                <span>{windowsError}</span>
              </div>
            )}

            {loadingWindows ? (
              <div className="windows-loading">
                <i className="fas fa-spinner fa-spin"></i>
                <span>{t('loading') || 'Cargando ventanas...'}</span>
              </div>
            ) : (
              <div className="windows-grid">
                {windowsList.length === 0 ? (
                  <div className="windows-empty">
                    <i className="fas fa-window-restore"></i>
                    <p>{t('spy_no_windows') || 'No se encontraron ventanas abiertas'}</p>
                  </div>
                ) : (
                  windowsList.map((win) => (
                    <div
                      key={win.id}
                      className={`window-card ${selectedWindow?.id === win.id ? 'selected' : ''}`}
                      onClick={() => setSelectedWindow(win)}
                    >
                      <div className="window-icon">
                        <i className={`fas ${getWindowIcon(win.type)}`}></i>
                      </div>
                      <div className="window-info">
                        <div className="window-title" title={win.title}>
                          {win.title.length > 40 ? win.title.substring(0, 40) + '...' : win.title}
                        </div>
                        <div className="window-process">
                          <span className={`window-type type-${win.type}`}>{win.type}</span>
                          <span className="window-handle">{win.processName}</span>
                        </div>
                      </div>
                      {selectedWindow?.id === win.id && (
                        <div className="window-selected-badge">
                          <i className="fas fa-check"></i>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            )}

            {selectedWindow && (
              <div className="selected-window-info">
                <div className="selected-window-details">
                  <h4><i className="fas fa-window-maximize"></i> {t('spy_selected_window') || 'Ventana Seleccionada'}</h4>
                  <div className="detail-row">
                    <span className="detail-label">{t('spy_window_title') || 'Título'}:</span>
                    <span className="detail-value">{selectedWindow.title}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">{t('spy_window_process') || 'Proceso'}:</span>
                    <span className="detail-value">{selectedWindow.processName}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Handle:</span>
                    <span className="detail-value code">{selectedWindow.handle}</span>
                  </div>
                </div>
                <div className="selected-window-actions">
                  <button className="btn btn-primary" onClick={() => {
                    if (socket) {
                      socket.emit('spy:start', { targetWindow: selectedWindow })
                    }
                    setIsSpying(true)
                  }}>
                    <i className="fas fa-crosshairs"></i> {t('spy_start_capture') || 'Iniciar Captura'}
                  </button>
                  <button className="btn btn-secondary" onClick={() => {
                    navigator.clipboard.writeText(JSON.stringify(selectedWindow, null, 2))
                  }}>
                    <i className="fas fa-copy"></i> {t('btn_copy') || 'Copiar'} Info
                  </button>
                </div>
              </div>
            )}

            <div className="windows-tip">
              <i className="fas fa-info-circle"></i>
              <span>{t('spy_desktop_tip') || 'Selecciona una ventana para capturar elementos de aplicaciones Windows (no solo navegadores).'}</span>
            </div>
          </div>
        )}

        {/* Área de inspección */}
        {isSpying && spyMode === 'iframe' && (
          <div className="spy-iframe-container">
            <div className="iframe-toolbar">
              <span><i className="fas fa-globe"></i> {spyUrl}</span>
              <div className="iframe-actions">
                <button onClick={() => iframeRef.current?.contentWindow?.location.reload()} title="Recargar">
                  <i className="fas fa-sync"></i>
                </button>
                <button onClick={() => window.open(spyUrl, '_blank')} title="Abrir en nueva pestaña">
                  <i className="fas fa-external-link-alt"></i>
                </button>
              </div>
            </div>
            <iframe
              ref={iframeRef}
              srcDoc={`
                <!DOCTYPE html>
                <html>
                <head>
                  <base href="${spyUrl}">
                  <style>
                    * { cursor: crosshair !important; }
                    body { margin: 0; padding: 0; }
                  </style>
                </head>
                <body>
                  <div style="display:flex;align-items:center;justify-content:center;height:100vh;background:#1e293b;color:#e2e8f0;flex-direction:column;gap:1rem;">
                    <i class="fas fa-spinner fa-spin" style="font-size:2rem;"></i>
                    <p>Cargando página...</p>
                    <p style="font-size:0.8rem;color:#94a3b8;">Nota: Algunos sitios bloquean iframes por seguridad.<br/>Usa el modo Bookmarklet si no carga.</p>
                  </div>
                  ${iframeScript}
                </body>
                </html>
              `}
              className="spy-iframe"
              sandbox="allow-same-origin allow-scripts allow-forms"
            />
            <div className="iframe-note">
              <i className="fas fa-info-circle"></i>
              Si la página no carga correctamente, algunos sitios bloquean iframes. Usa el modo <strong>Bookmarklet</strong>.
            </div>
          </div>
        )}

        {/* Tarjetas de características cuando no está espiando */}
        {!isSpying && (
          <div className="spy-features">
            <div className="feature-card">
              <i className="fas fa-crosshairs"></i>
              <h3>Selector Picker</h3>
              <p>Haz clic en cualquier elemento para obtener su selector automáticamente</p>
            </div>
            <div className="feature-card">
              <i className="fas fa-code"></i>
              <h3>Múltiples Selectores</h3>
              <p>CSS, XPath, ID, Class, Name, Data-TestId y más</p>
            </div>
            <div className="feature-card">
              <i className="fas fa-eye"></i>
              <h3>Sin Plugins</h3>
              <p>Funciona directamente en el navegador sin extensiones</p>
            </div>
            <div className="feature-card">
              <i className="fas fa-project-diagram"></i>
              <h3>Integración Workflow</h3>
              <p>Agrega elementos directamente a tus flujos de automatización</p>
            </div>
          </div>
        )}

        {/* Inspector de elemento */}
        {inspectorVisible && (
          <div className="element-inspector">
            <div className="inspector-header">
              <h3><i className="fas fa-cube"></i> {t('spy_inspector_title')}</h3>
              <button className="btn btn-sm btn-secondary" onClick={() => setInspectorVisible(false)}>
                <i className="fas fa-times"></i>
              </button>
            </div>

            <div className="inspector-grid">
              <div className="inspector-item">
                <label><i className="fas fa-tag"></i> {t('spy_element_tag')}:</label>
                <input type="text" readOnly value={selectedElement.tag} />
              </div>
              <div className="inspector-item">
                <label><i className="fas fa-hashtag"></i> {t('spy_element_id')}:</label>
                <input type="text" readOnly value={selectedElement.id} />
              </div>
              <div className="inspector-item">
                <label><i className="fas fa-code"></i> {t('spy_element_class')}:</label>
                <input type="text" readOnly value={selectedElement.className} />
              </div>
              <div className="inspector-item">
                <label><i className="fas fa-signature"></i> {t('spy_element_name')}:</label>
                <input type="text" readOnly value={selectedElement.name} />
              </div>
              {selectedElement.text && (
                <div className="inspector-item full-width">
                  <label><i className="fas fa-font"></i> {t('spy_element_text')}:</label>
                  <input type="text" readOnly value={selectedElement.text} />
                </div>
              )}
              {selectedElement.href && (
                <div className="inspector-item full-width">
                  <label><i className="fas fa-link"></i> Href:</label>
                  <input type="text" readOnly value={selectedElement.href} />
                </div>
              )}
            </div>

            <div className="selector-options">
              <div className="selector-header">
                <h4><i className="fas fa-list"></i> {t('spy_selector_options')}</h4>
                <button className="btn btn-sm btn-secondary" onClick={copyAllSelectors} title={t('btn_copy')}>
                  <i className="fas fa-copy"></i> {t('btn_copy')}
                </button>
              </div>
              <div className="selector-list">
                {selectors.map((sel, index) => (
                  <div key={index} className="selector-item">
                    <span className={`selector-type type-${sel.type.toLowerCase()}`}>{sel.type}</span>
                    <code>{sel.value}</code>
                    <button
                      className="btn btn-xs btn-ghost"
                      onClick={() => copySelector(sel.value)}
                      title={t('btn_copy')}
                    >
                      <i className="fas fa-copy"></i>
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="action-buttons">
              <button className="btn btn-success" onClick={addToWorkflow}>
                <i className="fas fa-plus"></i> {t('spy_add_to_workflow')}
              </button>
              <button className="btn btn-primary" onClick={() => copySelector()}>
                <i className="fas fa-copy"></i> {t('spy_copy_selector')}
              </button>
              <button className="btn btn-secondary" onClick={() => {
                const json = JSON.stringify(selectedElement, null, 2)
                navigator.clipboard.writeText(json)
              }}>
                <i className="fas fa-code"></i> {t('btn_copy')} JSON
              </button>
            </div>
          </div>
        )}

        {/* Historial de elementos recientes */}
        {recentElements.length > 0 && (
          <div className="recent-elements">
            <h4><i className="fas fa-history"></i> {t('spy_recent_elements')}</h4>
            <div className="recent-list">
              {recentElements.map((elem, index) => (
                <div
                  key={index}
                  className="recent-item"
                  onClick={() => {
                    setSelectedElement(elem)
                    setSelectors(generateSelectors(elem))
                    setInspectorVisible(true)
                  }}
                >
                  <span className="recent-tag">{elem.tag}</span>
                  <span className="recent-id">{elem.id || elem.className?.split(' ')[0] || 'sin identificador'}</span>
                  <span className="recent-text">{elem.text?.substring(0, 30) || ''}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default SpyView
