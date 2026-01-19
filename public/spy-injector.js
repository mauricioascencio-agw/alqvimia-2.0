/**
 * Alqvimia Spy Injector v3.0
 * Script robusto para capturar elementos en páginas web
 * Soporta: iframes anidados, shadow DOM, hover visual mejorado
 */

(function() {
  'use strict';

  // Evitar doble inyección
  if (window.AlqvimiaSpy && window.AlqvimiaSpy.version === '3.0.0') {
    console.log('[Alqvimia Spy] Ya está activo v3.0');
    return;
  }

  // Limpiar versión anterior si existe
  if (window.AlqvimiaSpy) {
    window.AlqvimiaSpy.destroy && window.AlqvimiaSpy.destroy();
  }

  // ==========================================
  // CONFIGURACIÓN GLOBAL
  // ==========================================
  window.AlqvimiaSpy = {
    active: true,
    version: '3.0.0',
    highlightColor: '#6366f1',
    secondaryColor: '#22c55e',
    lastElement: null,
    overlay: null,
    tooltip: null,
    notification: null,
    iframeDepth: 0,
    capturedElements: [],
    continuousMode: false
  };

  const SPY = window.AlqvimiaSpy;

  // ==========================================
  // ESTILOS INYECTADOS
  // ==========================================
  const styles = document.createElement('style');
  styles.id = 'alqvimia-spy-styles';
  styles.textContent = `
    @keyframes alqvimia-pulse {
      0%, 100% { box-shadow: 0 0 0 0 rgba(99, 102, 241, 0.4); }
      50% { box-shadow: 0 0 0 8px rgba(99, 102, 241, 0); }
    }
    @keyframes alqvimia-slideIn {
      from { transform: translateX(120%); opacity: 0; }
      to { transform: translateX(0); opacity: 1; }
    }
    @keyframes alqvimia-fadeIn {
      from { opacity: 0; transform: scale(0.95); }
      to { opacity: 1; transform: scale(1); }
    }
    @keyframes alqvimia-bounce {
      0%, 100% { transform: scale(1); }
      50% { transform: scale(1.05); }
    }
    .alqvimia-spy-cursor * {
      cursor: crosshair !important;
    }
    #alqvimia-spy-overlay {
      position: fixed;
      pointer-events: none;
      z-index: 2147483646;
      border: 2px solid ${SPY.highlightColor};
      background: rgba(99, 102, 241, 0.08);
      transition: all 0.08s ease-out;
      display: none;
      border-radius: 2px;
    }
    #alqvimia-spy-overlay.active {
      animation: alqvimia-pulse 1.5s infinite;
    }
    #alqvimia-spy-overlay.selected {
      border-color: ${SPY.secondaryColor};
      background: rgba(34, 197, 94, 0.15);
      animation: alqvimia-bounce 0.3s ease;
    }
    #alqvimia-spy-tooltip {
      position: fixed;
      z-index: 2147483647;
      background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
      color: #e2e8f0;
      padding: 10px 14px;
      border-radius: 8px;
      font-family: 'SF Mono', 'Fira Code', 'Consolas', monospace;
      font-size: 12px;
      max-width: 350px;
      box-shadow: 0 8px 32px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,255,255,0.1);
      display: none;
      pointer-events: none;
      animation: alqvimia-fadeIn 0.15s ease;
      backdrop-filter: blur(8px);
    }
    #alqvimia-spy-tooltip .spy-tag {
      color: #f472b6;
      font-weight: 600;
    }
    #alqvimia-spy-tooltip .spy-id {
      color: #22c55e;
    }
    #alqvimia-spy-tooltip .spy-class {
      color: #60a5fa;
    }
    #alqvimia-spy-tooltip .spy-text {
      color: #a78bfa;
      font-style: italic;
      margin-top: 6px;
      padding-top: 6px;
      border-top: 1px solid rgba(255,255,255,0.1);
    }
    #alqvimia-spy-tooltip .spy-size {
      color: #94a3b8;
      font-size: 10px;
      margin-top: 4px;
    }
    #alqvimia-spy-tooltip .spy-iframe-badge {
      display: inline-block;
      background: #f59e0b;
      color: #000;
      padding: 2px 6px;
      border-radius: 4px;
      font-size: 10px;
      font-weight: 600;
      margin-left: 6px;
    }
    #alqvimia-spy-notification {
      position: fixed;
      top: 16px;
      right: 16px;
      z-index: 2147483647;
      background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
      color: white;
      padding: 14px 20px;
      border-radius: 12px;
      font-family: system-ui, -apple-system, sans-serif;
      font-size: 14px;
      box-shadow: 0 8px 32px rgba(99, 102, 241, 0.4);
      animation: alqvimia-slideIn 0.4s cubic-bezier(0.16, 1, 0.3, 1);
      display: flex;
      align-items: center;
      gap: 12px;
    }
    #alqvimia-spy-notification .spy-icon {
      font-size: 24px;
    }
    #alqvimia-spy-notification .spy-title {
      font-weight: 700;
      font-size: 15px;
    }
    #alqvimia-spy-notification .spy-subtitle {
      font-size: 12px;
      opacity: 0.85;
      margin-top: 2px;
    }
    #alqvimia-spy-notification .spy-close {
      position: absolute;
      top: 8px;
      right: 8px;
      background: rgba(255,255,255,0.2);
      border: none;
      color: white;
      width: 20px;
      height: 20px;
      border-radius: 50%;
      cursor: pointer;
      font-size: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    #alqvimia-spy-notification .spy-close:hover {
      background: rgba(255,255,255,0.3);
    }
  `;
  document.head.appendChild(styles);

  // ==========================================
  // CREAR ELEMENTOS UI
  // ==========================================

  // Overlay para resaltado
  const overlay = document.createElement('div');
  overlay.id = 'alqvimia-spy-overlay';
  document.body.appendChild(overlay);
  SPY.overlay = overlay;

  // Tooltip informativo
  const tooltip = document.createElement('div');
  tooltip.id = 'alqvimia-spy-tooltip';
  document.body.appendChild(tooltip);
  SPY.tooltip = tooltip;

  // Notificación
  const notification = document.createElement('div');
  notification.id = 'alqvimia-spy-notification';
  notification.innerHTML = `
    <button class="spy-close" onclick="window.AlqvimiaSpy.deactivate()">✕</button>
    <span class="spy-icon">🎯</span>
    <div>
      <div class="spy-title">Alqvimia Element Spy</div>
      <div class="spy-subtitle">Click para capturar · ESC para salir</div>
    </div>
  `;
  document.body.appendChild(notification);
  SPY.notification = notification;

  // Agregar clase de cursor
  document.documentElement.classList.add('alqvimia-spy-cursor');

  // ==========================================
  // FUNCIONES DE SELECTORES
  // ==========================================

  /**
   * Genera XPath optimizado para un elemento
   */
  function getXPath(element, doc = document) {
    if (!element || element.nodeType !== Node.ELEMENT_NODE) return '';

    // Si tiene ID único, usarlo directamente
    if (element.id && doc.querySelectorAll(`#${CSS.escape(element.id)}`).length === 1) {
      return `//*[@id="${element.id}"]`;
    }

    const parts = [];
    let current = element;

    while (current && current.nodeType === Node.ELEMENT_NODE && current !== doc.documentElement) {
      let index = 1;
      let sibling = current.previousElementSibling;

      while (sibling) {
        if (sibling.tagName === current.tagName) {
          index++;
        }
        sibling = sibling.previousElementSibling;
      }

      const tagName = current.tagName.toLowerCase();
      const hasMultipleSiblings = current.parentNode &&
        Array.from(current.parentNode.children).filter(c => c.tagName === current.tagName).length > 1;

      parts.unshift(hasMultipleSiblings ? `${tagName}[${index}]` : tagName);
      current = current.parentNode;
    }

    return '/' + parts.join('/');
  }

  /**
   * Genera selector CSS óptimo y único
   */
  function getCssSelector(element, doc = document) {
    if (!element || element.nodeType !== Node.ELEMENT_NODE) return '';

    // Prioridad 1: ID único
    if (element.id) {
      const escaped = CSS.escape(element.id);
      if (doc.querySelectorAll(`#${escaped}`).length === 1) {
        return `#${escaped}`;
      }
    }

    // Prioridad 2: data-testid
    if (element.dataset && element.dataset.testid) {
      return `[data-testid="${element.dataset.testid}"]`;
    }

    // Prioridad 3: data-cy, data-test (otros frameworks)
    for (const attr of ['data-cy', 'data-test', 'data-qa']) {
      if (element.getAttribute(attr)) {
        return `[${attr}="${element.getAttribute(attr)}"]`;
      }
    }

    // Construir selector jerárquico
    const path = [];
    let current = element;
    let depth = 0;
    const maxDepth = 5;

    while (current && current.nodeType === Node.ELEMENT_NODE && depth < maxDepth) {
      let selector = current.tagName.toLowerCase();

      // Agregar ID si existe
      if (current.id) {
        selector = `#${CSS.escape(current.id)}`;
        path.unshift(selector);
        break;
      }

      // Agregar clases relevantes (filtrar clases dinámicas)
      if (current.className && typeof current.className === 'string') {
        const classes = current.className.trim().split(/\s+/)
          .filter(c => c && !c.match(/^(ng-|_|js-|is-|has-|active|hover|focus|show|hide|visible|hidden|\d)/))
          .slice(0, 2);
        if (classes.length > 0) {
          selector += '.' + classes.map(c => CSS.escape(c)).join('.');
        }
      }

      // Agregar :nth-child si es necesario para unicidad
      if (current.parentNode) {
        const siblings = Array.from(current.parentNode.children);
        const sameTagSiblings = siblings.filter(s => s.tagName === current.tagName);
        if (sameTagSiblings.length > 1) {
          const index = siblings.indexOf(current) + 1;
          selector += `:nth-child(${index})`;
        }
      }

      path.unshift(selector);
      current = current.parentNode;
      depth++;
    }

    return path.join(' > ');
  }

  /**
   * Genera múltiples selectores ordenados por prioridad
   */
  function generateAllSelectors(element, doc = document) {
    const selectors = [];

    // ID
    if (element.id) {
      selectors.push({ type: 'id', value: `#${element.id}`, priority: 1 });
    }

    // Data-testid
    if (element.dataset && element.dataset.testid) {
      selectors.push({ type: 'data-testid', value: `[data-testid="${element.dataset.testid}"]`, priority: 1 });
    }

    // CSS Selector
    const css = getCssSelector(element, doc);
    if (css) {
      selectors.push({ type: 'css', value: css, priority: 2 });
    }

    // Clases
    if (element.className && typeof element.className === 'string') {
      const classes = element.className.trim().split(/\s+/).filter(c => c);
      if (classes.length > 0) {
        selectors.push({ type: 'class', value: '.' + classes.join('.'), priority: 3 });
      }
    }

    // Name attribute
    if (element.name) {
      selectors.push({ type: 'name', value: `[name="${element.name}"]`, priority: 4 });
    }

    // XPath
    const xpath = getXPath(element, doc);
    if (xpath) {
      selectors.push({ type: 'xpath', value: xpath, priority: 5 });
    }

    // Tag + attributes
    const tagSelector = buildTagSelector(element);
    if (tagSelector) {
      selectors.push({ type: 'tag', value: tagSelector, priority: 6 });
    }

    return selectors.sort((a, b) => a.priority - b.priority);
  }

  /**
   * Construye selector basado en tag y atributos
   */
  function buildTagSelector(element) {
    let selector = element.tagName.toLowerCase();

    if (element.type) {
      selector += `[type="${element.type}"]`;
    }
    if (element.placeholder) {
      selector += `[placeholder="${element.placeholder.substring(0, 30)}"]`;
    }
    if (element.getAttribute('role')) {
      selector += `[role="${element.getAttribute('role')}"]`;
    }
    if (element.getAttribute('aria-label')) {
      selector += `[aria-label="${element.getAttribute('aria-label').substring(0, 30)}"]`;
    }

    return selector;
  }

  // ==========================================
  // DETECCIÓN DE IFRAMES
  // ==========================================

  /**
   * Obtiene información del contexto iframe
   */
  function getIframeContext(element) {
    let depth = 0;
    let currentWindow = element.ownerDocument.defaultView;
    const iframePath = [];

    while (currentWindow !== window.top) {
      depth++;
      try {
        const parentDoc = currentWindow.parent.document;
        const iframes = parentDoc.querySelectorAll('iframe');
        for (const iframe of iframes) {
          if (iframe.contentWindow === currentWindow) {
            iframePath.unshift({
              id: iframe.id || null,
              name: iframe.name || null,
              src: iframe.src || null,
              index: Array.from(parentDoc.querySelectorAll('iframe')).indexOf(iframe)
            });
            break;
          }
        }
      } catch (e) {
        // Cross-origin iframe
        iframePath.unshift({ crossOrigin: true });
      }
      currentWindow = currentWindow.parent;
    }

    return { depth, path: iframePath };
  }

  /**
   * Inyecta el spy en todos los iframes accesibles
   */
  function injectIntoIframes(doc = document) {
    const iframes = doc.querySelectorAll('iframe');

    iframes.forEach((iframe, index) => {
      try {
        const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
        if (iframeDoc && !iframeDoc.getElementById('alqvimia-spy-styles')) {
          // Clonar estilos al iframe
          const iframeStyles = styles.cloneNode(true);
          iframeDoc.head.appendChild(iframeStyles);

          // Registrar eventos en el iframe
          registerEvents(iframeDoc, iframe.contentWindow);

          // Recursivamente inyectar en iframes anidados
          injectIntoIframes(iframeDoc);

          console.log(`[Alqvimia Spy] Inyectado en iframe[${index}]`, iframe.src || iframe.id);
        }
      } catch (e) {
        console.warn(`[Alqvimia Spy] No se puede acceder al iframe[${index}] (cross-origin):`, e.message);
      }
    });
  }

  // ==========================================
  // INFORMACIÓN DEL ELEMENTO
  // ==========================================

  /**
   * Obtiene información completa del elemento
   */
  function getElementInfo(element, targetDoc = document) {
    const rect = element.getBoundingClientRect();
    const computedStyle = targetDoc.defaultView.getComputedStyle(element);
    const iframeContext = getIframeContext(element);

    // Obtener atributos personalizados relevantes
    const customAttributes = {};
    for (const attr of element.attributes) {
      if (attr.name.startsWith('data-') ||
          attr.name.startsWith('aria-') ||
          ['role', 'title', 'alt', 'for', 'href', 'src'].includes(attr.name)) {
        customAttributes[attr.name] = attr.value;
      }
    }

    return {
      // Identificadores básicos
      tag: element.tagName,
      id: element.id || '',
      className: typeof element.className === 'string' ? element.className : '',
      name: element.name || '',

      // Contenido
      text: (element.innerText || element.textContent || '').substring(0, 200).trim(),
      value: element.value || '',
      placeholder: element.placeholder || '',

      // Enlaces y recursos
      href: element.href || '',
      src: element.src || '',

      // Tipo y estado
      type: element.type || '',
      tagName: element.tagName.toLowerCase(),
      isVisible: computedStyle.display !== 'none' && computedStyle.visibility !== 'hidden',
      isEnabled: !element.disabled,
      isChecked: element.checked || false,

      // Selectores generados
      selectors: generateAllSelectors(element, targetDoc),
      xpath: getXPath(element, targetDoc),
      cssSelector: getCssSelector(element, targetDoc),
      dataTestId: element.dataset ? element.dataset.testid || '' : '',

      // Posición y tamaño
      position: {
        x: Math.round(rect.left + (targetDoc.defaultView.scrollX || 0)),
        y: Math.round(rect.top + (targetDoc.defaultView.scrollY || 0)),
        viewportX: Math.round(rect.left),
        viewportY: Math.round(rect.top)
      },
      size: {
        width: Math.round(rect.width),
        height: Math.round(rect.height)
      },

      // Contexto de iframe
      iframe: iframeContext.depth > 0 ? iframeContext : null,

      // Atributos personalizados
      attributes: customAttributes,

      // Metadata
      timestamp: Date.now(),
      url: targetDoc.defaultView.location.href
    };
  }

  // ==========================================
  // MANEJADORES DE EVENTOS
  // ==========================================

  /**
   * Maneja el evento mouseover con debounce
   */
  let hoverTimeout = null;
  function handleMouseOver(e, targetDoc = document, targetWindow = window) {
    if (!SPY.active) return;

    const element = e.target;
    if (!element || element.nodeType !== Node.ELEMENT_NODE) return;
    if (element.id && element.id.startsWith('alqvimia-spy')) return;

    // Debounce para mejor rendimiento
    clearTimeout(hoverTimeout);
    hoverTimeout = setTimeout(() => {
      updateOverlay(element, targetDoc, targetWindow);
      updateTooltip(element, targetDoc, targetWindow);
    }, 16); // ~60fps
  }

  /**
   * Actualiza el overlay de resaltado
   */
  function updateOverlay(element, targetDoc, targetWindow) {
    const rect = element.getBoundingClientRect();

    // Calcular posición relativa al viewport principal
    let offsetX = 0, offsetY = 0;
    let currentWindow = targetWindow;

    while (currentWindow !== window) {
      try {
        const parentDoc = currentWindow.parent.document;
        const iframes = parentDoc.querySelectorAll('iframe');
        for (const iframe of iframes) {
          if (iframe.contentWindow === currentWindow) {
            const iframeRect = iframe.getBoundingClientRect();
            offsetX += iframeRect.left;
            offsetY += iframeRect.top;
            break;
          }
        }
      } catch (e) {
        break;
      }
      currentWindow = currentWindow.parent;
    }

    overlay.style.display = 'block';
    overlay.style.top = (rect.top + offsetY) + 'px';
    overlay.style.left = (rect.left + offsetX) + 'px';
    overlay.style.width = rect.width + 'px';
    overlay.style.height = rect.height + 'px';
    overlay.classList.add('active');
    overlay.classList.remove('selected');

    SPY.lastElement = { element, doc: targetDoc, window: targetWindow };
  }

  /**
   * Actualiza el tooltip con información del elemento
   */
  function updateTooltip(element, targetDoc, targetWindow) {
    const info = getElementInfo(element, targetDoc);
    const iframeContext = getIframeContext(element);

    let html = `<span class="spy-tag">&lt;${info.tag.toLowerCase()}&gt;</span>`;

    if (info.id) {
      html += ` <span class="spy-id">#${info.id}</span>`;
    }

    if (iframeContext.depth > 0) {
      html += `<span class="spy-iframe-badge">iframe[${iframeContext.depth}]</span>`;
    }

    if (info.className) {
      const mainClass = info.className.split(' ')[0];
      html += `<div class="spy-class">.${mainClass}</div>`;
    }

    if (info.text) {
      const truncatedText = info.text.length > 60 ? info.text.substring(0, 60) + '...' : info.text;
      html += `<div class="spy-text">"${truncatedText}"</div>`;
    }

    html += `<div class="spy-size">${info.size.width}×${info.size.height}px</div>`;

    tooltip.innerHTML = html;

    // Posicionar tooltip
    const rect = element.getBoundingClientRect();
    let tooltipTop = rect.bottom + 12;
    let tooltipLeft = rect.left;

    // Ajustar si sale del viewport
    const tooltipRect = tooltip.getBoundingClientRect();
    if (tooltipTop + 120 > window.innerHeight) {
      tooltipTop = rect.top - 120;
    }
    if (tooltipLeft + 350 > window.innerWidth) {
      tooltipLeft = window.innerWidth - 360;
    }

    tooltip.style.display = 'block';
    tooltip.style.top = Math.max(10, tooltipTop) + 'px';
    tooltip.style.left = Math.max(10, tooltipLeft) + 'px';
  }

  /**
   * Maneja el evento mouseout
   */
  function handleMouseOut(e) {
    if (!SPY.active) return;

    // Solo ocultar si realmente salimos del elemento
    if (e.relatedTarget && !e.relatedTarget.id?.startsWith('alqvimia-spy')) {
      return;
    }

    overlay.style.display = 'none';
    overlay.classList.remove('active');
    tooltip.style.display = 'none';
  }

  /**
   * Maneja el click para seleccionar elemento
   */
  function handleClick(e, targetDoc = document, targetWindow = window) {
    if (!SPY.active) return;
    if (e.target.id && e.target.id.startsWith('alqvimia-spy')) return;

    e.preventDefault();
    e.stopPropagation();
    e.stopImmediatePropagation();

    const element = e.target;
    const info = getElementInfo(element, targetDoc);

    console.log('[Alqvimia Spy] Elemento capturado:', info);

    // Efecto visual de selección
    overlay.classList.add('selected');
    overlay.classList.remove('active');

    // Agregar al historial
    SPY.capturedElements.push(info);

    // Enviar via WebSocket
    if (window.AlqvimiaSpyWS && window.AlqvimiaSpyWS.readyState === WebSocket.OPEN) {
      window.AlqvimiaSpyWS.send(JSON.stringify({
        type: 'element-selected',
        element: info
      }));
    }

    // Enviar via postMessage (para modo iframe)
    try {
      window.top.postMessage({
        type: 'ALQVIMIA_ELEMENT_SELECTED',
        element: info
      }, '*');
    } catch (e) {
      console.warn('[Alqvimia Spy] No se pudo enviar postMessage:', e);
    }

    // Si no es modo continuo, desactivar después de capturar
    if (!SPY.continuousMode) {
      setTimeout(() => {
        overlay.classList.remove('selected');
      }, 500);
    }

    return false;
  }

  /**
   * Maneja teclas especiales
   */
  function handleKeyDown(e) {
    if (e.key === 'Escape') {
      SPY.deactivate();
    }

    // Ctrl+Shift+C para toggle
    if (e.ctrlKey && e.shiftKey && e.key === 'C') {
      SPY.active ? SPY.deactivate() : SPY.activate();
    }
  }

  // ==========================================
  // REGISTRO DE EVENTOS
  // ==========================================

  function registerEvents(doc = document, win = window) {
    doc.addEventListener('mouseover', (e) => handleMouseOver(e, doc, win), true);
    doc.addEventListener('mouseout', handleMouseOut, true);
    doc.addEventListener('click', (e) => handleClick(e, doc, win), true);
    doc.addEventListener('keydown', handleKeyDown, true);
  }

  // Registrar en documento principal
  registerEvents(document, window);

  // Inyectar en iframes existentes
  setTimeout(() => injectIntoIframes(), 100);

  // Observer para iframes dinámicos
  const iframeObserver = new MutationObserver((mutations) => {
    mutations.forEach(mutation => {
      mutation.addedNodes.forEach(node => {
        if (node.tagName === 'IFRAME') {
          setTimeout(() => {
            try {
              const iframeDoc = node.contentDocument || node.contentWindow.document;
              if (iframeDoc && iframeDoc.body) {
                injectIntoIframes(document);
              }
            } catch (e) {
              // Cross-origin
            }
          }, 500);
        }
      });
    });
  });

  iframeObserver.observe(document.body, { childList: true, subtree: true });

  // ==========================================
  // API PÚBLICA
  // ==========================================

  SPY.activate = function() {
    SPY.active = true;
    document.documentElement.classList.add('alqvimia-spy-cursor');
    notification.style.display = 'flex';
    console.log('[Alqvimia Spy] Activado');
  };

  SPY.deactivate = function() {
    SPY.active = false;
    overlay.style.display = 'none';
    tooltip.style.display = 'none';
    document.documentElement.classList.remove('alqvimia-spy-cursor');
    notification.style.opacity = '0';
    notification.style.transform = 'translateX(120%)';
    notification.style.transition = 'all 0.3s ease';
    setTimeout(() => {
      notification.style.display = 'none';
    }, 300);
    console.log('[Alqvimia Spy] Desactivado');
  };

  SPY.setContinuousMode = function(enabled) {
    SPY.continuousMode = enabled;
    console.log(`[Alqvimia Spy] Modo continuo: ${enabled ? 'ON' : 'OFF'}`);
  };

  SPY.setHighlightColor = function(color) {
    SPY.highlightColor = color;
    overlay.style.borderColor = color;
  };

  SPY.getCapturedElements = function() {
    return SPY.capturedElements;
  };

  SPY.destroy = function() {
    SPY.deactivate();
    document.removeEventListener('mouseover', handleMouseOver, true);
    document.removeEventListener('mouseout', handleMouseOut, true);
    document.removeEventListener('click', handleClick, true);
    document.removeEventListener('keydown', handleKeyDown, true);
    iframeObserver.disconnect();
    overlay.remove();
    tooltip.remove();
    notification.remove();
    styles.remove();
    delete window.AlqvimiaSpy;
    console.log('[Alqvimia Spy] Destruido');
  };

  // ==========================================
  // AUTO-OCULTAR NOTIFICACIÓN
  // ==========================================
  setTimeout(() => {
    if (notification && SPY.active) {
      notification.style.transition = 'all 0.3s ease';
      notification.style.opacity = '0.7';
      notification.style.transform = 'scale(0.9)';
    }
  }, 5000);

  console.log('[Alqvimia Spy v3.0] Iniciado - Click para capturar, ESC para salir, Ctrl+Shift+C para toggle');

})();
