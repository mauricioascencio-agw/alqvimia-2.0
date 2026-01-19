/**
 * ALQVIMIA RPA 2.0 - Vista de Catálogo de Agentes
 * Permite crear agentes desde plantillas predefinidas (SAT y Retail)
 */

import { useState, useEffect } from 'react'
import { useLanguage } from '../context/LanguageContext'
import { useSocket } from '../context/SocketContext'
import '../assets/css/agent-catalog.css'

// Importar plantillas de agentes
const agentTemplates = {
  // ==================== AGENTES SAT ====================
  sat: [
    {
      id: 'sat-buzon-tributario',
      nombre: 'Asistente de Buzón Tributario',
      descripcion: 'Monitoreo 24/7 del Buzón Tributario con alertas automáticas vía WhatsApp',
      categoria: 'fiscal-sat',
      icono: 'fa-inbox',
      color: '#ef4444',
      problema: 'Multas de $3,850 a $11,540 MXN por no monitorear notificaciones del SAT',
      capacidades: ['monitoring-24-7', 'alertas-whatsapp', 'clasificacion-urgencia', 'recordatorios-plazos'],
      requerimientos: {
        credenciales: ['RFC del contribuyente', 'e.firma (FIEL) o CIEC'],
        integraciones: ['WhatsApp Business API', 'Correo electrónico'],
        opcionales: ['Zoho CRM/Books']
      },
      entregables: ['Sistema de monitoreo automatizado', 'Alertas multicanal', 'Dashboard de notificaciones', 'Historial de compliance'],
      configDefecto: { checkIntervalMinutes: 60, urgencyLevels: { CRITICAL: 3, HIGH: 7, MEDIUM: 15, LOW: 30 } }
    },
    {
      id: 'sat-cfdi-asistente',
      nombre: 'Asistente CFDI 4.0 y Complemento de Pagos',
      descripcion: 'Validación pre-timbrado y recordatorios para complementos de pago',
      categoria: 'fiscal-sat',
      icono: 'fa-file-invoice',
      color: '#f97316',
      problema: 'Incumplimiento en emisión de complementos de pago (día 10 del mes siguiente)',
      capacidades: ['validacion-pretimbrado', 'seguimiento-facturas', 'alertas-automaticas', 'faq-errores'],
      requerimientos: {
        credenciales: [],
        integraciones: ['Conexión con PAC/Facturador', 'Sistema de facturación'],
        datos: ['Acceso a facturas emitidas']
      },
      entregables: ['Validador de datos fiscales', 'Sistema de seguimiento', 'Alertas automatizadas', 'FAQ de errores CFDI 4.0']
    },
    {
      id: 'sat-contabilidad-electronica',
      nombre: 'Gestor de Contabilidad Electrónica',
      descripcion: 'Recordatorios y verificación para envío de balanzas de comprobación',
      categoria: 'fiscal-sat',
      icono: 'fa-calculator',
      color: '#eab308',
      problema: 'Personas morales deben enviar contabilidad los primeros 3 días del segundo mes posterior',
      capacidades: ['conectores-erp', 'calendario-sat', 'generador-xml', 'dashboard-compliance'],
      requerimientos: {
        credenciales: ['e.firma para envío'],
        integraciones: ['Sistema contable (CONTPAQi, Aspel, SAE)'],
        datos: ['Acceso a catálogo de cuentas']
      },
      entregables: ['Conectores con ERPs', 'Calendario SAT automatizado', 'Generador de XML de balanza', 'Dashboard de compliance']
    },
    {
      id: 'sat-diot',
      nombre: 'Administrador de DIOT',
      descripcion: 'Validación y recordatorios para la DIOT (54 campos obligatorios en 2025)',
      categoria: 'fiscal-sat',
      icono: 'fa-file-alt',
      color: '#22c55e',
      problema: 'Multas de $9,430 a $18,860 MXN por no presentar DIOT',
      capacidades: ['validador-txt', 'detector-errores', 'generador-reportes', 'tutorial-interactivo'],
      requerimientos: {
        credenciales: ['Acceso al portal del SAT'],
        integraciones: ['Sistema de compras/cuentas por pagar'],
        datos: ['Catálogo de proveedores con RFC']
      },
      entregables: ['Validador de formato .TXT', 'Detector de errores', 'Generador de reportes', 'Tutorial plataforma DIOT 2025']
    },
    {
      id: 'sat-calendario-fiscal',
      nombre: 'Calendario Fiscal Inteligente',
      descripcion: 'Dashboard personalizado de obligaciones fiscales con recordatorios automáticos',
      categoria: 'fiscal-sat',
      icono: 'fa-calendar-check',
      color: '#3b82f6',
      problema: 'Pérdida de fechas límite de múltiples obligaciones (ISR, IVA, IEPS, DIOT)',
      capacidades: ['motor-reglas', 'integracion-calendarios', 'dashboard-anual', 'checklist-mensual'],
      requerimientos: {
        credenciales: [],
        integraciones: ['WhatsApp/Email para recordatorios', 'Calendario Google/Outlook (opcional)'],
        datos: ['RFC y régimen fiscal del contribuyente']
      },
      entregables: ['Motor de reglas fiscales', 'Integración con calendarios externos', 'Dashboard de compliance anual', 'Sistema de checklist mensual']
    }
  ],

  // ==================== AGENTES RETAIL ====================
  retail: [
    {
      id: 'retail-ejecutivo-analisis',
      nombre: 'Agente Ejecutivo de Análisis',
      descripcion: 'Permite a directores consultar el negocio en lenguaje natural',
      categoria: 'retail',
      icono: 'fa-chart-line',
      color: '#8b5cf6',
      capacidades: ['consultas-lenguaje-natural', 'conectores-bi', 'dashboards-personalizados'],
      requerimientos: {
        integraciones: ['Power BI / Zoho Analytics', 'API de ERP/POS'],
        datos: ['Diccionario de negocio']
      },
      entregables: ['Motor semántico personalizado', 'Conectores BI', 'Panel analítico de volumetría']
    },
    {
      id: 'retail-atencion-clientes',
      nombre: 'Agente de Atención a Clientes',
      descripcion: 'Chatbot omnicanal 24/7 para atención de dudas y soporte',
      categoria: 'retail',
      icono: 'fa-headset',
      color: '#ec4899',
      capacidades: ['chat-omnicanal', 'base-conocimiento', 'flujos-personalizables', 'escalamiento-humano'],
      requerimientos: {
        integraciones: ['WhatsApp Business API'],
        datos: ['Catálogo de FAQs'],
        opcionales: ['Sistema de pedidos/OMS']
      },
      entregables: ['Chat omnicanal WA + Web', 'Base de conocimiento configurable', 'Flujos de conversación personalizables']
    },
    {
      id: 'retail-seguimiento-pedidos',
      nombre: 'Seguimiento Automático de Pedidos',
      descripcion: 'Notificaciones proactivas del estado de pedidos',
      categoria: 'retail',
      icono: 'fa-shipping-fast',
      color: '#06b6d4',
      capacidades: ['tracking-automatico', 'notificaciones-proactivas', 'integracion-logistica'],
      requerimientos: {
        integraciones: ['Sistema OMS/ERP'],
        datos: ['Estados de pedido definidos'],
        opcionales: ['WhatsApp Business API']
      },
      entregables: ['Sistema de tracking automático', 'Notificaciones multicanal', 'Dashboard de seguimiento']
    },
    {
      id: 'retail-carritos-abandonados',
      nombre: 'Agente de Carritos Abandonados',
      descripcion: 'Recuperación inteligente de ventas perdidas',
      categoria: 'retail',
      icono: 'fa-shopping-cart',
      color: '#f59e0b',
      capacidades: ['deteccion-abandono', 'mensajes-personalizados', 'descuentos-automaticos', 'analisis-conversion'],
      requerimientos: {
        integraciones: ['Plataforma e-commerce', 'WhatsApp/Email'],
        datos: ['Catálogo de productos']
      },
      entregables: ['Sistema de detección de abandono', 'Mensajes personalizados', 'Generador de descuentos', 'Analytics de conversión']
    },
    {
      id: 'retail-prenomina',
      nombre: 'Validación de Prenómina Automática',
      descripcion: 'Validación cruzada de asistencias vs nómina',
      categoria: 'retail',
      icono: 'fa-user-clock',
      color: '#10b981',
      capacidades: ['validacion-cruzada', 'deteccion-discrepancias', 'reportes-automaticos'],
      requerimientos: {
        integraciones: ['Sistema de control de asistencia', 'Sistema de nómina'],
        datos: ['Reglas por tipo de contrato']
      },
      entregables: ['Validador automático', 'Reporte de discrepancias', 'Dashboard de prenómina']
    },
    {
      id: 'retail-soporte-piso',
      nombre: 'Asistente de Soporte en Piso',
      descripcion: 'Soporte instantáneo para empleados de tienda vía WhatsApp',
      categoria: 'retail',
      icono: 'fa-store',
      color: '#6366f1',
      capacidades: ['soporte-instantaneo', 'base-conocimiento', 'escalamiento-supervisor'],
      requerimientos: {
        integraciones: ['WhatsApp Business API'],
        datos: ['Manual de procedimientos', 'Catálogo de productos']
      },
      entregables: ['Bot de soporte', 'Base de conocimiento', 'Sistema de escalamiento']
    },
    {
      id: 'retail-apertura-cierre',
      nombre: 'Checklist de Apertura y Cierre',
      descripcion: 'Automatización de listas de verificación diarias',
      categoria: 'retail',
      icono: 'fa-clipboard-check',
      color: '#14b8a6',
      capacidades: ['checklists-digitales', 'evidencias-fotograficas', 'reportes-cumplimiento'],
      requerimientos: {
        integraciones: ['WhatsApp Business API'],
        datos: ['Checklist de apertura', 'Checklist de cierre']
      },
      entregables: ['App de checklists', 'Sistema de evidencias', 'Dashboard de cumplimiento']
    },
    {
      id: 'retail-alta-baja-personal',
      nombre: 'Agente de Alta y Baja de Personal',
      descripcion: 'Automatización del proceso de onboarding y offboarding',
      categoria: 'retail',
      icono: 'fa-user-plus',
      color: '#0ea5e9',
      capacidades: ['onboarding-automatizado', 'offboarding-automatizado', 'documentacion-digital'],
      requerimientos: {
        integraciones: ['Sistema de RH', 'Directorio Activo (opcional)'],
        datos: ['Checklist de alta', 'Checklist de baja']
      },
      entregables: ['Flujo de onboarding', 'Flujo de offboarding', 'Gestión documental']
    },
    {
      id: 'retail-surtido-anaqueles',
      nombre: 'Agente de Surtido de Anaqueles',
      descripcion: 'Alertas inteligentes de resurtido basadas en inventario',
      categoria: 'retail',
      icono: 'fa-boxes',
      color: '#84cc16',
      capacidades: ['alertas-resurtido', 'analisis-rotacion', 'prediccion-demanda'],
      requerimientos: {
        integraciones: ['Sistema de inventario/WMS'],
        datos: ['Niveles mínimos por producto', 'Planogramas']
      },
      entregables: ['Sistema de alertas', 'Dashboard de inventario', 'Predictor de demanda']
    },
    {
      id: 'retail-conciliacion-inventarios',
      nombre: 'Conciliación de Inventarios',
      descripcion: 'Validación automática de inventarios contra sistemas',
      categoria: 'retail',
      icono: 'fa-balance-scale',
      color: '#f43f5e',
      capacidades: ['conciliacion-automatica', 'deteccion-diferencias', 'reportes-ajustes'],
      requerimientos: {
        integraciones: ['Sistema de inventario', 'ERP'],
        datos: ['Reglas de tolerancia']
      },
      entregables: ['Motor de conciliación', 'Reporte de diferencias', 'Sugerencias de ajuste']
    },
    {
      id: 'retail-catalogo-productos',
      nombre: 'Carga de Catálogo de Productos',
      descripcion: 'Automatización de alta masiva de productos en e-commerce',
      categoria: 'retail',
      icono: 'fa-upload',
      color: '#a855f7',
      capacidades: ['carga-masiva', 'validacion-datos', 'sincronizacion-canales'],
      requerimientos: {
        integraciones: ['Plataforma e-commerce', 'PIM (opcional)'],
        datos: ['Plantilla de productos', 'Imágenes de productos']
      },
      entregables: ['Importador de catálogo', 'Validador de datos', 'Sincronizador multicanal']
    },
    {
      id: 'retail-promociones-omnicanal',
      nombre: 'Promociones Omnicanal',
      descripcion: 'Gestión centralizada de promociones en todos los canales',
      categoria: 'retail',
      icono: 'fa-tags',
      color: '#d946ef',
      capacidades: ['gestion-promociones', 'sincronizacion-canales', 'analisis-efectividad'],
      requerimientos: {
        integraciones: ['E-commerce', 'POS', 'ERP'],
        datos: ['Calendario promocional', 'Reglas de descuento']
      },
      entregables: ['Gestor de promociones', 'Sincronizador de precios', 'Dashboard de efectividad']
    },
    {
      id: 'retail-orquestador-aperturas',
      nombre: 'Orquestador de Apertura de Tiendas',
      descripcion: 'Coordinación completa del proceso de apertura de nuevas tiendas',
      categoria: 'retail',
      icono: 'fa-door-open',
      color: '#0891b2',
      capacidades: ['gestion-proyectos', 'coordinacion-equipos', 'seguimiento-tareas'],
      requerimientos: {
        integraciones: ['Sistema de proyectos', 'Comunicación interna'],
        datos: ['Checklist de apertura', 'Timeline estándar']
      },
      entregables: ['Dashboard de proyecto', 'Sistema de tareas', 'Reportes de avance']
    },
    {
      id: 'retail-capacitacion',
      nombre: 'Agente de Capacitación',
      descripcion: 'Entrenamiento automatizado para nuevos empleados',
      categoria: 'retail',
      icono: 'fa-graduation-cap',
      color: '#7c3aed',
      capacidades: ['cursos-interactivos', 'evaluaciones-automaticas', 'certificaciones'],
      requerimientos: {
        integraciones: ['LMS (opcional)', 'WhatsApp'],
        datos: ['Material de capacitación', 'Evaluaciones']
      },
      entregables: ['Plataforma de cursos', 'Sistema de evaluación', 'Certificados digitales']
    },
    {
      id: 'retail-campanas-apertura',
      nombre: 'Campañas de Apertura',
      descripcion: 'Automatización de campañas de marketing para nuevas tiendas',
      categoria: 'retail',
      icono: 'fa-bullhorn',
      color: '#e11d48',
      capacidades: ['campanas-automatizadas', 'segmentacion-geografica', 'medicion-resultados'],
      requerimientos: {
        integraciones: ['CRM', 'Plataforma de email marketing', 'WhatsApp'],
        datos: ['Base de clientes', 'Contenido de campaña']
      },
      entregables: ['Orquestador de campañas', 'Segmentador de audiencias', 'Dashboard de resultados']
    }
  ]
}

function AgentCatalogView() {
  const { t } = useLanguage()
  const { socket, isConnected } = useSocket()

  // Estado
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedAgent, setSelectedAgent] = useState(null)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [creatingAgent, setCreatingAgent] = useState(false)
  const [agentConfig, setAgentConfig] = useState({})
  const [viewMode, setViewMode] = useState('grid') // grid o list

  // Filtrar agentes
  const getFilteredAgents = () => {
    let agents = []

    if (selectedCategory === 'all' || selectedCategory === 'sat') {
      agents = [...agents, ...agentTemplates.sat]
    }
    if (selectedCategory === 'all' || selectedCategory === 'retail') {
      agents = [...agents, ...agentTemplates.retail]
    }

    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      agents = agents.filter(a =>
        a.nombre.toLowerCase().includes(term) ||
        a.descripcion.toLowerCase().includes(term) ||
        a.id.toLowerCase().includes(term)
      )
    }

    return agents
  }

  // Abrir modal de creación
  const openCreateModal = (agent) => {
    setSelectedAgent(agent)
    setAgentConfig({
      nombre: agent.nombre,
      descripcion: agent.descripcion,
      ...agent.configDefecto
    })
    setShowCreateModal(true)
  }

  // Crear agente
  const handleCreateAgent = async () => {
    if (!selectedAgent) return

    setCreatingAgent(true)

    try {
      // Emitir evento al servidor para crear el agente
      if (socket && isConnected) {
        socket.emit('agent:create', {
          templateId: selectedAgent.id,
          config: agentConfig,
          metadata: {
            createdFrom: 'catalog',
            timestamp: new Date().toISOString()
          }
        })

        // También guardar en localStorage como backup
        const savedAgents = JSON.parse(localStorage.getItem('alqvimia-agents') || '[]')
        savedAgents.push({
          id: `agent_${Date.now()}`,
          templateId: selectedAgent.id,
          ...agentConfig,
          estado: 'configurado',
          createdAt: new Date().toISOString()
        })
        localStorage.setItem('alqvimia-agents', JSON.stringify(savedAgents))
      }

      // Simular delay para UX
      await new Promise(resolve => setTimeout(resolve, 1500))

      setShowCreateModal(false)
      setSelectedAgent(null)

      // Mostrar notificación de éxito (simple)
      alert(`Agente "${agentConfig.nombre}" creado exitosamente`)

    } catch (error) {
      console.error('Error creando agente:', error)
      alert('Error al crear el agente. Por favor intente de nuevo.')
    } finally {
      setCreatingAgent(false)
    }
  }

  const filteredAgents = getFilteredAgents()

  return (
    <div className="view agent-catalog-view" id="agent-catalog">
      {/* Header */}
      <div className="view-header">
        <div className="header-content">
          <h2><i className="fas fa-layer-group"></i> Catálogo de Agentes</h2>
          <p>Crea agentes automatizados desde plantillas predefinidas para SAT y Retail</p>
        </div>
        <div className="header-stats">
          <div className="stat-item">
            <span className="stat-value">{agentTemplates.sat.length}</span>
            <span className="stat-label">Agentes SAT</span>
          </div>
          <div className="stat-item">
            <span className="stat-value">{agentTemplates.retail.length}</span>
            <span className="stat-label">Agentes Retail</span>
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="catalog-toolbar">
        <div className="toolbar-left">
          {/* Filtros de categoría */}
          <div className="category-filters">
            <button
              className={`category-btn ${selectedCategory === 'all' ? 'active' : ''}`}
              onClick={() => setSelectedCategory('all')}
            >
              <i className="fas fa-th-large"></i> Todos
            </button>
            <button
              className={`category-btn sat ${selectedCategory === 'sat' ? 'active' : ''}`}
              onClick={() => setSelectedCategory('sat')}
            >
              <i className="fas fa-landmark"></i> SAT / Fiscal
            </button>
            <button
              className={`category-btn retail ${selectedCategory === 'retail' ? 'active' : ''}`}
              onClick={() => setSelectedCategory('retail')}
            >
              <i className="fas fa-store"></i> Retail
            </button>
          </div>
        </div>

        <div className="toolbar-right">
          {/* Búsqueda */}
          <div className="search-box">
            <i className="fas fa-search"></i>
            <input
              type="text"
              placeholder="Buscar agentes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {searchTerm && (
              <button className="clear-search" onClick={() => setSearchTerm('')}>
                <i className="fas fa-times"></i>
              </button>
            )}
          </div>

          {/* Vista */}
          <div className="view-toggle">
            <button
              className={viewMode === 'grid' ? 'active' : ''}
              onClick={() => setViewMode('grid')}
              title="Vista de cuadrícula"
            >
              <i className="fas fa-th-large"></i>
            </button>
            <button
              className={viewMode === 'list' ? 'active' : ''}
              onClick={() => setViewMode('list')}
              title="Vista de lista"
            >
              <i className="fas fa-list"></i>
            </button>
          </div>
        </div>
      </div>

      {/* Contenido principal */}
      <div className={`catalog-content ${viewMode}`}>
        {filteredAgents.length === 0 ? (
          <div className="empty-state">
            <i className="fas fa-search"></i>
            <h3>No se encontraron agentes</h3>
            <p>Intenta con otros términos de búsqueda o cambia la categoría</p>
          </div>
        ) : (
          <div className={`agents-${viewMode}`}>
            {filteredAgents.map(agent => (
              <div
                key={agent.id}
                className="agent-card"
                style={{ '--agent-color': agent.color }}
              >
                <div className="agent-card-header">
                  <div className="agent-icon" style={{ backgroundColor: agent.color }}>
                    <i className={`fas ${agent.icono}`}></i>
                  </div>
                  <div className="agent-category-badge">
                    {agent.categoria === 'fiscal-sat' ? 'SAT' : 'Retail'}
                  </div>
                </div>

                <div className="agent-card-body">
                  <h3 className="agent-name">{agent.nombre}</h3>
                  <p className="agent-description">{agent.descripcion}</p>

                  {agent.problema && (
                    <div className="agent-problem">
                      <i className="fas fa-exclamation-triangle"></i>
                      <span>{agent.problema}</span>
                    </div>
                  )}

                  <div className="agent-capabilities">
                    {agent.capacidades.slice(0, 3).map(cap => (
                      <span key={cap} className="capability-tag">
                        {cap.replace(/-/g, ' ')}
                      </span>
                    ))}
                    {agent.capacidades.length > 3 && (
                      <span className="capability-more">+{agent.capacidades.length - 3}</span>
                    )}
                  </div>
                </div>

                <div className="agent-card-footer">
                  <button
                    className="btn-view-details"
                    onClick={() => setSelectedAgent(selectedAgent?.id === agent.id ? null : agent)}
                  >
                    <i className="fas fa-info-circle"></i> Detalles
                  </button>
                  <button
                    className="btn-create-agent"
                    onClick={() => openCreateModal(agent)}
                  >
                    <i className="fas fa-plus"></i> Crear Agente
                  </button>
                </div>

                {/* Panel de detalles expandido */}
                {selectedAgent?.id === agent.id && (
                  <div className="agent-details-panel">
                    <div className="details-section">
                      <h4><i className="fas fa-check-circle"></i> Entregables</h4>
                      <ul>
                        {agent.entregables?.map((e, i) => <li key={i}>{e}</li>)}
                      </ul>
                    </div>

                    <div className="details-section">
                      <h4><i className="fas fa-plug"></i> Requerimientos</h4>
                      {agent.requerimientos?.credenciales?.length > 0 && (
                        <div className="req-group">
                          <span className="req-label">Credenciales:</span>
                          <ul>
                            {agent.requerimientos.credenciales.map((r, i) => <li key={i}>{r}</li>)}
                          </ul>
                        </div>
                      )}
                      {agent.requerimientos?.integraciones?.length > 0 && (
                        <div className="req-group">
                          <span className="req-label">Integraciones:</span>
                          <ul>
                            {agent.requerimientos.integraciones.map((r, i) => <li key={i}>{r}</li>)}
                          </ul>
                        </div>
                      )}
                      {agent.requerimientos?.datos?.length > 0 && (
                        <div className="req-group">
                          <span className="req-label">Datos:</span>
                          <ul>
                            {agent.requerimientos.datos.map((r, i) => <li key={i}>{r}</li>)}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal de creación */}
      {showCreateModal && selectedAgent && (
        <div className="modal-overlay" onClick={() => !creatingAgent && setShowCreateModal(false)}>
          <div className="create-agent-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-icon" style={{ backgroundColor: selectedAgent.color }}>
                <i className={`fas ${selectedAgent.icono}`}></i>
              </div>
              <h3>Crear Agente: {selectedAgent.nombre}</h3>
              <button
                className="modal-close"
                onClick={() => !creatingAgent && setShowCreateModal(false)}
                disabled={creatingAgent}
              >
                <i className="fas fa-times"></i>
              </button>
            </div>

            <div className="modal-body">
              <div className="agent-form-field">
                <label htmlFor="agent-name-input">Nombre del Agente</label>
                <input
                  id="agent-name-input"
                  className="agent-input"
                  type="text"
                  value={agentConfig.nombre || ''}
                  onChange={(e) => {
                    e.stopPropagation()
                    setAgentConfig(prev => ({ ...prev, nombre: e.target.value }))
                  }}
                  onMouseDown={(e) => e.stopPropagation()}
                  onClick={(e) => e.stopPropagation()}
                  onFocus={(e) => e.stopPropagation()}
                  placeholder="Nombre personalizado"
                  disabled={creatingAgent}
                  autoComplete="off"
                  spellCheck="false"
                />
              </div>

              <div className="agent-form-field">
                <label htmlFor="agent-desc-input">Descripción</label>
                <textarea
                  id="agent-desc-input"
                  className="agent-textarea"
                  value={agentConfig.descripcion || ''}
                  onChange={(e) => {
                    e.stopPropagation()
                    setAgentConfig(prev => ({ ...prev, descripcion: e.target.value }))
                  }}
                  onMouseDown={(e) => e.stopPropagation()}
                  onClick={(e) => e.stopPropagation()}
                  onFocus={(e) => e.stopPropagation()}
                  placeholder="Descripción del agente"
                  rows={3}
                  disabled={creatingAgent}
                  spellCheck="false"
                />
              </div>

              <div className="config-section">
                <h4>Configuración Inicial</h4>
                <p className="config-note">
                  Esta configuración podrá ser modificada después en la vista de Agentes
                </p>

                {/* Mostrar configuración por defecto */}
                {selectedAgent.configDefecto && (
                  <div className="default-config">
                    <pre>{JSON.stringify(selectedAgent.configDefecto, null, 2)}</pre>
                  </div>
                )}
              </div>

              <div className="requirements-summary">
                <h4>Requerimientos para Configurar</h4>
                <div className="req-checklist">
                  {selectedAgent.requerimientos?.credenciales?.map((r, i) => (
                    <div key={`cred-${i}`} className="req-item">
                      <i className="fas fa-key"></i> {r}
                    </div>
                  ))}
                  {selectedAgent.requerimientos?.integraciones?.map((r, i) => (
                    <div key={`int-${i}`} className="req-item">
                      <i className="fas fa-plug"></i> {r}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button
                className="btn-cancel"
                onClick={() => setShowCreateModal(false)}
                disabled={creatingAgent}
              >
                Cancelar
              </button>
              <button
                className="btn-create"
                onClick={handleCreateAgent}
                disabled={creatingAgent || !agentConfig.nombre}
              >
                {creatingAgent ? (
                  <>
                    <i className="fas fa-spinner fa-spin"></i> Creando...
                  </>
                ) : (
                  <>
                    <i className="fas fa-plus"></i> Crear Agente
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AgentCatalogView
