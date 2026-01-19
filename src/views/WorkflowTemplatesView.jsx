/**
 * ALQVIMIA RPA 2.0 - Vista de Plantillas de Workflows
 * Gestiona las plantillas de workflows predefinidas para SAT y Retail
 */

import { useState, useEffect } from 'react'
import { useLanguage } from '../context/LanguageContext'
import { useSocket } from '../context/SocketContext'
import '../assets/css/workflow-templates.css'

// Plantillas de workflows disponibles
const workflowTemplates = [
  // SAT Workflows
  {
    id: 'wf_sat_buzon_tributario',
    nombre: 'Monitoreo de Buzón Tributario SAT',
    descripcion: 'Workflow para monitorear el buzón tributario del SAT y enviar alertas automáticas',
    categoria: 'fiscal-sat',
    icono: 'fa-inbox',
    color: '#ef4444',
    trigger: { type: 'schedule', frequency: 'hourly' },
    pasosCount: 14,
    estimatedTime: '5 min',
    tags: ['sat', 'fiscal', 'buzon', 'notificaciones']
  },
  {
    id: 'wf_sat_cfdi_asistente',
    nombre: 'Asistente CFDI 4.0 y Complemento de Pagos',
    descripcion: 'Validación pre-timbrado y gestión de complementos de pago',
    categoria: 'fiscal-sat',
    icono: 'fa-file-invoice',
    color: '#f97316',
    trigger: { type: 'schedule', frequency: 'daily', runAt: '08:00' },
    pasosCount: 11,
    estimatedTime: '3 min',
    tags: ['sat', 'fiscal', 'cfdi', 'complemento-pago', 'validacion']
  },
  {
    id: 'wf_sat_calendario_fiscal',
    nombre: 'Calendario Fiscal Inteligente',
    descripcion: 'Recordatorios personalizados de obligaciones fiscales por régimen',
    categoria: 'fiscal-sat',
    icono: 'fa-calendar-check',
    color: '#3b82f6',
    trigger: { type: 'schedule', frequency: 'daily', runAt: '07:00' },
    pasosCount: 7,
    estimatedTime: '1 min',
    tags: ['sat', 'fiscal', 'calendario', 'recordatorios', 'obligaciones']
  },
  {
    id: 'wf_sat_diot',
    nombre: 'Administrador DIOT',
    descripcion: 'Validación y preparación de la DIOT con generación de archivo TXT',
    categoria: 'fiscal-sat',
    icono: 'fa-file-alt',
    color: '#22c55e',
    trigger: { type: 'schedule', frequency: 'monthly', dayOfMonth: 20 },
    pasosCount: 10,
    estimatedTime: '10 min',
    tags: ['sat', 'fiscal', 'diot', 'terceros', 'validacion']
  },
  {
    id: 'wf_sat_contabilidad_electronica',
    nombre: 'Gestor de Contabilidad Electrónica',
    descripcion: 'Generación y validación de balanzas de comprobación XML',
    categoria: 'fiscal-sat',
    icono: 'fa-calculator',
    color: '#eab308',
    trigger: { type: 'schedule', frequency: 'monthly', dayOfMonth: 1 },
    pasosCount: 11,
    estimatedTime: '8 min',
    tags: ['sat', 'fiscal', 'contabilidad', 'balanza', 'xml']
  },

  // Retail Workflows
  {
    id: 'wf_retail_atencion_clientes',
    nombre: 'Atención a Clientes Omnicanal',
    descripcion: 'Procesamiento de mensajes de clientes con IA y escalamiento',
    categoria: 'retail',
    icono: 'fa-headset',
    color: '#ec4899',
    trigger: { type: 'webhook', event: 'message_received' },
    pasosCount: 10,
    estimatedTime: '< 1 min',
    tags: ['retail', 'atencion', 'whatsapp', 'chatbot']
  },
  {
    id: 'wf_retail_seguimiento_pedidos',
    nombre: 'Seguimiento Automático de Pedidos',
    descripcion: 'Monitoreo de estados de pedidos y notificaciones automáticas',
    categoria: 'retail',
    icono: 'fa-shipping-fast',
    color: '#06b6d4',
    trigger: { type: 'schedule', frequency: 'interval', interval: 15, unit: 'minutes' },
    pasosCount: 7,
    estimatedTime: '2 min',
    tags: ['retail', 'pedidos', 'tracking', 'notificaciones']
  },
  {
    id: 'wf_retail_carritos_abandonados',
    nombre: 'Recuperación de Carritos Abandonados',
    descripcion: 'Detección y recuperación de carritos con mensajes personalizados',
    categoria: 'retail',
    icono: 'fa-shopping-cart',
    color: '#f59e0b',
    trigger: { type: 'schedule', frequency: 'hourly' },
    pasosCount: 9,
    estimatedTime: '3 min',
    tags: ['retail', 'ecommerce', 'carritos', 'recuperacion', 'marketing']
  },
  {
    id: 'wf_retail_prenomina',
    nombre: 'Validación de Prenómina Automática',
    descripcion: 'Validación cruzada de prenómina contra sistema de asistencias',
    categoria: 'retail',
    icono: 'fa-user-clock',
    color: '#10b981',
    trigger: { type: 'schedule', frequency: 'biweekly', daysOfMonth: [1, 16] },
    pasosCount: 10,
    estimatedTime: '5 min',
    tags: ['retail', 'rh', 'nomina', 'asistencias', 'validacion']
  }
]

function WorkflowTemplatesView() {
  const { t } = useLanguage()
  const { socket, isConnected } = useSocket()

  // Estado
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedTemplate, setSelectedTemplate] = useState(null)
  const [showUseModal, setShowUseModal] = useState(false)
  const [workflowConfig, setWorkflowConfig] = useState({})
  const [importing, setImporting] = useState(false)

  // Filtrar plantillas
  const getFilteredTemplates = () => {
    let templates = [...workflowTemplates]

    if (selectedCategory === 'sat') {
      templates = templates.filter(t => t.categoria === 'fiscal-sat')
    } else if (selectedCategory === 'retail') {
      templates = templates.filter(t => t.categoria === 'retail')
    }

    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      templates = templates.filter(t =>
        t.nombre.toLowerCase().includes(term) ||
        t.descripcion.toLowerCase().includes(term) ||
        t.tags.some(tag => tag.includes(term))
      )
    }

    return templates
  }

  // Obtener etiqueta de trigger
  const getTriggerLabel = (trigger) => {
    switch (trigger.type) {
      case 'schedule':
        if (trigger.frequency === 'hourly') return 'Cada hora'
        if (trigger.frequency === 'daily') return `Diario a las ${trigger.runAt || '00:00'}`
        if (trigger.frequency === 'monthly') return `Mensual día ${trigger.dayOfMonth}`
        if (trigger.frequency === 'biweekly') return 'Quincenal'
        if (trigger.frequency === 'interval') return `Cada ${trigger.interval} ${trigger.unit === 'minutes' ? 'min' : 'hrs'}`
        return 'Programado'
      case 'webhook':
        return 'Webhook / Evento'
      default:
        return 'Manual'
    }
  }

  // Abrir modal de uso
  const openUseModal = (template) => {
    setSelectedTemplate(template)
    setWorkflowConfig({
      nombre: template.nombre,
      descripcion: template.descripcion
    })
    setShowUseModal(true)
  }

  // Importar workflow
  const handleImportWorkflow = async () => {
    if (!selectedTemplate) return

    setImporting(true)

    try {
      // Cargar el archivo JSON de la plantilla
      const templatePath = `/workflows/templates/${selectedTemplate.id.replace('wf_', '').replace(/_/g, '-')}-workflow.json`

      // Guardar en localStorage como workflow nuevo
      const savedWorkflows = JSON.parse(localStorage.getItem('alqvimia-workflows') || '[]')

      const newWorkflow = {
        id: `wf_${Date.now()}`,
        name: workflowConfig.nombre,
        description: workflowConfig.descripcion,
        templateId: selectedTemplate.id,
        folder: selectedTemplate.categoria === 'fiscal-sat' ? 'SAT' : 'Retail',
        steps: [], // Los pasos se cargarían del template JSON
        variables: {},
        createdAt: new Date().toISOString(),
        createdFrom: 'template'
      }

      savedWorkflows.push(newWorkflow)
      localStorage.setItem('alqvimia-workflows', JSON.stringify(savedWorkflows))

      // Notificar al servidor si está conectado
      if (socket && isConnected) {
        socket.emit('workflow:create-from-template', {
          templateId: selectedTemplate.id,
          config: workflowConfig
        })
      }

      await new Promise(resolve => setTimeout(resolve, 1000))

      setShowUseModal(false)
      setSelectedTemplate(null)
      alert(`Workflow "${workflowConfig.nombre}" creado exitosamente. Puedes verlo en la vista de Workflows.`)

    } catch (error) {
      console.error('Error importando workflow:', error)
      alert('Error al importar el workflow. Por favor intente de nuevo.')
    } finally {
      setImporting(false)
    }
  }

  const filteredTemplates = getFilteredTemplates()

  return (
    <div className="view workflow-templates-view" id="workflow-templates">
      {/* Header */}
      <div className="view-header">
        <div className="header-content">
          <h2><i className="fas fa-file-code"></i> Plantillas de Workflows</h2>
          <p>Workflows predefinidos listos para usar en procesos SAT y Retail</p>
        </div>
        <div className="header-actions">
          <button className="btn-secondary">
            <i className="fas fa-upload"></i> Importar Plantilla
          </button>
        </div>
      </div>

      {/* Toolbar */}
      <div className="templates-toolbar">
        <div className="toolbar-left">
          <div className="category-tabs">
            <button
              className={selectedCategory === 'all' ? 'active' : ''}
              onClick={() => setSelectedCategory('all')}
            >
              <i className="fas fa-th-large"></i> Todas ({workflowTemplates.length})
            </button>
            <button
              className={`sat ${selectedCategory === 'sat' ? 'active' : ''}`}
              onClick={() => setSelectedCategory('sat')}
            >
              <i className="fas fa-landmark"></i> SAT ({workflowTemplates.filter(t => t.categoria === 'fiscal-sat').length})
            </button>
            <button
              className={`retail ${selectedCategory === 'retail' ? 'active' : ''}`}
              onClick={() => setSelectedCategory('retail')}
            >
              <i className="fas fa-store"></i> Retail ({workflowTemplates.filter(t => t.categoria === 'retail').length})
            </button>
          </div>
        </div>

        <div className="toolbar-right">
          <div className="search-input">
            <i className="fas fa-search"></i>
            <input
              type="text"
              placeholder="Buscar plantillas..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Grid de plantillas */}
      <div className="templates-grid">
        {filteredTemplates.length === 0 ? (
          <div className="empty-state">
            <i className="fas fa-file-alt"></i>
            <h3>No se encontraron plantillas</h3>
            <p>Intenta con otros términos de búsqueda</p>
          </div>
        ) : (
          filteredTemplates.map(template => (
            <div
              key={template.id}
              className="template-card"
              style={{ '--template-color': template.color }}
            >
              <div className="template-header">
                <div className="template-icon" style={{ backgroundColor: template.color }}>
                  <i className={`fas ${template.icono}`}></i>
                </div>
                <div className="template-meta">
                  <span className="template-category">
                    {template.categoria === 'fiscal-sat' ? 'SAT' : 'Retail'}
                  </span>
                  <span className="template-steps">
                    <i className="fas fa-list-ol"></i> {template.pasosCount} pasos
                  </span>
                </div>
              </div>

              <div className="template-body">
                <h3>{template.nombre}</h3>
                <p>{template.descripcion}</p>

                <div className="template-info">
                  <div className="info-item">
                    <i className="fas fa-clock"></i>
                    <span>{getTriggerLabel(template.trigger)}</span>
                  </div>
                  <div className="info-item">
                    <i className="fas fa-stopwatch"></i>
                    <span>~{template.estimatedTime}</span>
                  </div>
                </div>

                <div className="template-tags">
                  {template.tags.slice(0, 4).map(tag => (
                    <span key={tag} className="tag">{tag}</span>
                  ))}
                </div>
              </div>

              <div className="template-footer">
                <button
                  className="btn-preview"
                  onClick={() => setSelectedTemplate(selectedTemplate?.id === template.id ? null : template)}
                >
                  <i className="fas fa-eye"></i> Vista previa
                </button>
                <button
                  className="btn-use"
                  onClick={() => openUseModal(template)}
                >
                  <i className="fas fa-plus"></i> Usar plantilla
                </button>
              </div>

              {/* Preview expandido */}
              {selectedTemplate?.id === template.id && (
                <div className="template-preview">
                  <h4><i className="fas fa-info-circle"></i> Información del Workflow</h4>
                  <div className="preview-content">
                    <div className="preview-row">
                      <span className="label">ID:</span>
                      <span className="value">{template.id}</span>
                    </div>
                    <div className="preview-row">
                      <span className="label">Trigger:</span>
                      <span className="value">{getTriggerLabel(template.trigger)}</span>
                    </div>
                    <div className="preview-row">
                      <span className="label">Pasos:</span>
                      <span className="value">{template.pasosCount} acciones configuradas</span>
                    </div>
                    <div className="preview-row">
                      <span className="label">Tiempo estimado:</span>
                      <span className="value">{template.estimatedTime}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Modal de uso */}
      {showUseModal && selectedTemplate && (
        <div className="modal-overlay" onClick={() => !importing && setShowUseModal(false)}>
          <div className="modal use-template-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-icon" style={{ backgroundColor: selectedTemplate.color }}>
                <i className={`fas ${selectedTemplate.icono}`}></i>
              </div>
              <h3>Usar Plantilla: {selectedTemplate.nombre}</h3>
              <button
                className="modal-close"
                onClick={() => !importing && setShowUseModal(false)}
              >
                <i className="fas fa-times"></i>
              </button>
            </div>

            <div className="modal-body">
              <p className="modal-description">
                Esta plantilla creará un nuevo workflow basado en "{selectedTemplate.nombre}".
                Podrás personalizarlo después en el editor de workflows.
              </p>

              <div className="form-group">
                <label>Nombre del Workflow</label>
                <input
                  type="text"
                  value={workflowConfig.nombre || ''}
                  onChange={(e) => setWorkflowConfig({ ...workflowConfig, nombre: e.target.value })}
                  placeholder="Nombre personalizado"
                  disabled={importing}
                />
              </div>

              <div className="form-group">
                <label>Descripción</label>
                <textarea
                  value={workflowConfig.descripcion || ''}
                  onChange={(e) => setWorkflowConfig({ ...workflowConfig, descripcion: e.target.value })}
                  placeholder="Descripción del workflow"
                  rows={3}
                  disabled={importing}
                />
              </div>

              <div className="template-summary">
                <h4>Resumen de la Plantilla</h4>
                <ul>
                  <li><i className="fas fa-list-ol"></i> {selectedTemplate.pasosCount} pasos preconfigurados</li>
                  <li><i className="fas fa-clock"></i> Trigger: {getTriggerLabel(selectedTemplate.trigger)}</li>
                  <li><i className="fas fa-folder"></i> Carpeta: {selectedTemplate.categoria === 'fiscal-sat' ? 'SAT' : 'Retail'}</li>
                </ul>
              </div>
            </div>

            <div className="modal-footer">
              <button
                className="btn-cancel"
                onClick={() => setShowUseModal(false)}
                disabled={importing}
              >
                Cancelar
              </button>
              <button
                className="btn-import"
                onClick={handleImportWorkflow}
                disabled={importing || !workflowConfig.nombre}
              >
                {importing ? (
                  <>
                    <i className="fas fa-spinner fa-spin"></i> Importando...
                  </>
                ) : (
                  <>
                    <i className="fas fa-download"></i> Importar Workflow
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

export default WorkflowTemplatesView
