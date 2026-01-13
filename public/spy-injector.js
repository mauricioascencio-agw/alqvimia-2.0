/**
 * Alqvimia Spy Injector
 * Script que se inyecta en páginas web para capturar elementos
 */

(function() {
  'use strict';

  // Evitar doble inyección
  if (window.AlqvimiaSpy) {
    console.log('[Alqvimia Spy] Ya está activo');
    return;
  }

  window.AlqvimiaSpy = {
    active: true,
    version: '2.0.0',
    highlightColor: '#ff6b6b',
    lastElement: null,
    overlay: null
  };

  // Crear overlay para resaltado
  const overlay = document.createElement('div');
  overlay.id = 'alqvimia-spy-overlay';
  overlay.style.cssText = `
    position: fixed;
    pointer-events: none;
    z-index: 999999;
    border: 2px solid #ff6b6b;
    background: rgba(255, 107, 107, 0.1);
    transition: all 0.1s ease;
    display: none;
  `;
  document.body.appendChild(overlay);
  window.AlqvimiaSpy.overlay = overlay;

  // Crear tooltip informativo
  const tooltip = document.createElement('div');
  tooltip.id = 'alqvimia-spy-tooltip';
  tooltip.style.cssText = `
    position: fixed;
    z-index: 999999;
    background: #1e293b;
    color: #e2e8f0;
    padding: 8px 12px;
    border-radius: 6px;
    font-family: monospace;
    font-size: 12px;
    max-width: 300px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.3);
    display: none;
    pointer-events: none;
  `;
  document.body.appendChild(tooltip);

  // Generar XPath para un elemento
  function getXPath(element) {
    if (!element) return '';
    if (element.id) return `//*[@id="${element.id}"]`;

    const parts = [];
    let current = element;

    while (current && current.nodeType === Node.ELEMENT_NODE) {
      let index = 1;
      let sibling = current.previousSibling;

      while (sibling) {
        if (sibling.nodeType === Node.ELEMENT_NODE && sibling.tagName === current.tagName) {
          index++;
        }
        sibling = sibling.previousSibling;
      }

      const tagName = current.tagName.toLowerCase();
      parts.unshift(`${tagName}[${index}]`);
      current = current.parentNode;
    }

    return '/' + parts.join('/');
  }

  // Generar selector CSS óptimo
  function getCssSelector(element) {
    if (!element) return '';

    // Si tiene ID, usarlo
    if (element.id) {
      return `#${element.id}`;
    }

    // Si tiene data-testid, usarlo
    if (element.dataset && element.dataset.testid) {
      return `[data-testid="${element.dataset.testid}"]`;
    }

    // Construir selector basado en clases y atributos
    let selector = element.tagName.toLowerCase();

    if (element.className && typeof element.className === 'string') {
      const classes = element.className.trim().split(/\s+/).filter(c => c && !c.includes(':'));
      if (classes.length > 0) {
        selector += '.' + classes.slice(0, 2).join('.');
      }
    }

    if (element.name) {
      selector += `[name="${element.name}"]`;
    }

    if (element.type && ['input', 'button'].includes(element.tagName.toLowerCase())) {
      selector += `[type="${element.type}"]`;
    }

    return selector;
  }

  // Obtener información del elemento
  function getElementInfo(element) {
    const rect = element.getBoundingClientRect();

    return {
      tag: element.tagName,
      id: element.id || '',
      className: typeof element.className === 'string' ? element.className : '',
      name: element.name || '',
      text: (element.innerText || element.textContent || '').substring(0, 100).trim(),
      href: element.href || '',
      src: element.src || '',
      type: element.type || '',
      value: element.value || '',
      placeholder: element.placeholder || '',
      xpath: getXPath(element),
      cssSelector: getCssSelector(element),
      dataTestId: element.dataset ? element.dataset.testid || '' : '',
      position: {
        x: Math.round(rect.left + window.scrollX),
        y: Math.round(rect.top + window.scrollY)
      },
      size: {
        width: Math.round(rect.width),
        height: Math.round(rect.height)
      },
      visible: rect.width > 0 && rect.height > 0,
      attributes: {}
    };
  }

  // Manejar mouseover
  function handleMouseOver(e) {
    if (!window.AlqvimiaSpy.active) return;

    const element = e.target;
    if (element === overlay || element === tooltip) return;

    window.AlqvimiaSpy.lastElement = element;

    const rect = element.getBoundingClientRect();

    // Actualizar overlay
    overlay.style.display = 'block';
    overlay.style.top = rect.top + 'px';
    overlay.style.left = rect.left + 'px';
    overlay.style.width = rect.width + 'px';
    overlay.style.height = rect.height + 'px';

    // Actualizar tooltip
    const info = getElementInfo(element);
    tooltip.innerHTML = `
      <div><strong>${info.tag}</strong>${info.id ? ` #${info.id}` : ''}</div>
      ${info.className ? `<div style="color:#94a3b8">.${info.className.split(' ')[0]}</div>` : ''}
      ${info.text ? `<div style="color:#a78bfa;margin-top:4px">"${info.text.substring(0, 50)}${info.text.length > 50 ? '...' : ''}"</div>` : ''}
    `;

    // Posicionar tooltip
    let tooltipTop = rect.bottom + 8;
    let tooltipLeft = rect.left;

    if (tooltipTop + 100 > window.innerHeight) {
      tooltipTop = rect.top - 80;
    }
    if (tooltipLeft + 300 > window.innerWidth) {
      tooltipLeft = window.innerWidth - 310;
    }

    tooltip.style.display = 'block';
    tooltip.style.top = tooltipTop + 'px';
    tooltip.style.left = Math.max(10, tooltipLeft) + 'px';
  }

  // Manejar mouseout
  function handleMouseOut(e) {
    overlay.style.display = 'none';
    tooltip.style.display = 'none';
  }

  // Manejar click para seleccionar elemento
  function handleClick(e) {
    if (!window.AlqvimiaSpy.active) return;

    e.preventDefault();
    e.stopPropagation();

    const element = e.target;
    if (element === overlay || element === tooltip) return;

    const info = getElementInfo(element);

    console.log('[Alqvimia Spy] Elemento seleccionado:', info);

    // Enviar al servidor via WebSocket si está conectado
    if (window.AlqvimiaSpyWS && window.AlqvimiaSpyWS.readyState === WebSocket.OPEN) {
      window.AlqvimiaSpyWS.send(JSON.stringify({
        type: 'element-selected',
        element: info
      }));
    }

    // También enviar via postMessage para modo iframe
    if (window.parent !== window) {
      window.parent.postMessage({
        type: 'ALQVIMIA_ELEMENT_SELECTED',
        element: info
      }, '*');
    }

    // Efecto visual de selección
    overlay.style.borderColor = '#22c55e';
    overlay.style.background = 'rgba(34, 197, 94, 0.2)';

    setTimeout(() => {
      overlay.style.borderColor = '#ff6b6b';
      overlay.style.background = 'rgba(255, 107, 107, 0.1)';
    }, 300);
  }

  // Manejar tecla Escape para desactivar
  function handleKeyDown(e) {
    if (e.key === 'Escape') {
      window.AlqvimiaSpy.active = false;
      overlay.style.display = 'none';
      tooltip.style.display = 'none';
      document.body.style.cursor = '';
      console.log('[Alqvimia Spy] Desactivado con Escape');
    }
  }

  // Registrar event listeners
  document.addEventListener('mouseover', handleMouseOver, true);
  document.addEventListener('mouseout', handleMouseOut, true);
  document.addEventListener('click', handleClick, true);
  document.addEventListener('keydown', handleKeyDown, true);

  // Cambiar cursor
  document.body.style.cursor = 'crosshair';

  // Notificar que está activo
  console.log('[Alqvimia Spy] Activado - Haz clic en cualquier elemento para capturarlo. Presiona Escape para desactivar.');

  // Mostrar notificación visual
  const notification = document.createElement('div');
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    z-index: 999999;
    background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
    color: white;
    padding: 12px 20px;
    border-radius: 8px;
    font-family: system-ui, sans-serif;
    font-size: 14px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.3);
    animation: slideIn 0.3s ease;
  `;
  notification.innerHTML = `
    <div style="display:flex;align-items:center;gap:8px">
      <span style="font-size:18px">🔍</span>
      <div>
        <div style="font-weight:600">Alqvimia Spy Activo</div>
        <div style="font-size:12px;opacity:0.9">Clic para capturar | Esc para salir</div>
      </div>
    </div>
  `;
  document.body.appendChild(notification);

  // Agregar estilos de animación
  const style = document.createElement('style');
  style.textContent = `
    @keyframes slideIn {
      from { transform: translateX(100px); opacity: 0; }
      to { transform: translateX(0); opacity: 1; }
    }
  `;
  document.head.appendChild(style);

  // Ocultar notificación después de 5 segundos
  setTimeout(() => {
    notification.style.transition = 'opacity 0.3s ease';
    notification.style.opacity = '0';
    setTimeout(() => notification.remove(), 300);
  }, 5000);

})();
