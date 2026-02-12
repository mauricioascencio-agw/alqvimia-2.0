import { useState, useEffect } from 'react'
import { useLanguage } from '../../context/LanguageContext'
import Modal from '../common/Modal'

const WIDGET_TYPES = [
  { tipo: 'kpi', label: 'KPI', icon: 'fas fa-chart-line', description: 'Indicador numerico' },
  { tipo: 'chart', label: 'Grafico', icon: 'fas fa-chart-bar', description: 'Grafico de barras o lineas' },
  { tipo: 'table', label: 'Tabla', icon: 'fas fa-table', description: 'Tabla de datos' },
  { tipo: 'workflow_monitor', label: 'Monitor', icon: 'fas fa-desktop', description: 'Monitor de ejecuciones' },
  { tipo: 'agent_status', label: 'Agentes', icon: 'fas fa-robot', description: 'Estado de agentes' },
  { tipo: 'html', label: 'HTML', icon: 'fas fa-code', description: 'Contenido HTML personalizado' },
  { tipo: 'clock', label: 'Reloj', icon: 'fas fa-clock', description: 'Reloj y mensaje de bienvenida' }
]

const KPI_SOURCES = [
  { value: 'workflows_total', label: 'Total Workflows' },
  { value: 'workflows_activos', label: 'Workflows Activos' },
  { value: 'ejecuciones_total', label: 'Total Ejecuciones' },
  { value: 'ejecuciones_exitosas', label: 'Ejecuciones Exitosas' },
  { value: 'usuarios_total', label: 'Total Usuarios' },
  { value: 'usuarios_activos', label: 'Usuarios Activos' }
]

const TABLE_SOURCES = [
  { value: 'workflows_recientes', label: 'Workflows Recientes' },
  { value: 'ejecuciones_recientes', label: 'Ejecuciones Recientes' }
]

const CHART_SOURCES = [
  { value: 'ejecuciones_por_dia', label: 'Ejecuciones por Dia' },
  { value: 'workflows_por_estado', label: 'Workflows por Estado' },
  { value: 'ejecuciones_por_resultado', label: 'Ejecuciones por Resultado' }
]

const DEFAULT_CONFIG = {
  kpi: { fuente: 'workflows_total', color: '#2563eb', icono: '' },
  chart: { fuente: 'ejecuciones_por_dia', dias: 7, tipo_grafico: 'bar', color: '#2563eb' },
  table: { fuente: 'workflows_recientes', limite: 10 },
  workflow_monitor: { limite: 10 },
  agent_status: {},
  html: { contenido: '<p>Contenido personalizado</p>' },
  clock: { mensaje: 'Bienvenido a Alqvimia' }
}

function WidgetConfigModal({ isOpen, onClose, onSave, editingWidget }) {
  const { t } = useLanguage()

  const [step, setStep] = useState(1)
  const [selectedType, setSelectedType] = useState('')
  const [titulo, setTitulo] = useState('')
  const [configuracion, setConfiguracion] = useState({})
  const [posicion, setPosicion] = useState({ x: 1, y: 1, w: 3, h: 2 })

  useEffect(() => {
    if (isOpen) {
      if (editingWidget) {
        setSelectedType(editingWidget.tipo || '')
        setTitulo(editingWidget.titulo || '')
        setConfiguracion(editingWidget.configuracion || {})
        setPosicion(editingWidget.posicion || { x: 1, y: 1, w: 3, h: 2 })
        setStep(2)
      } else {
        setSelectedType('')
        setTitulo('')
        setConfiguracion({})
        setPosicion({ x: 1, y: 1, w: 3, h: 2 })
        setStep(1)
      }
    }
  }, [isOpen, editingWidget])

  const handleTypeSelect = (tipo) => {
    setSelectedType(tipo)
    setConfiguracion(DEFAULT_CONFIG[tipo] || {})
    const typeInfo = WIDGET_TYPES.find(w => w.tipo === tipo)
    if (!titulo && typeInfo) {
      setTitulo(typeInfo.label)
    }
  }

  const updateConfig = (key, value) => {
    setConfiguracion(prev => ({ ...prev, [key]: value }))
  }

  const updatePos = (key, value) => {
    const numVal = parseInt(value, 10)
    if (isNaN(numVal) || numVal < 1) return
    const maxes = { x: 12, y: 20, w: 12, h: 4 }
    const clamped = Math.min(numVal, maxes[key] || 12)
    setPosicion(prev => ({ ...prev, [key]: clamped }))
  }

  const handleSave = () => {
    if (!selectedType) return

    const widgetData = {
      id: editingWidget?.id || `widget-${Date.now()}`,
      tipo: selectedType,
      titulo,
      configuracion,
      posicion
    }

    onSave && onSave(widgetData)
    onClose && onClose()
  }

  const canGoNext = () => {
    if (step === 1) return !!selectedType
    if (step === 2) return true
    if (step === 3) return posicion.x >= 1 && posicion.y >= 1 && posicion.w >= 1 && posicion.h >= 1
    return false
  }

  const renderStepIndicator = () => (
    <div className="dc-modal-steps">
      {[1, 2, 3].map(s => {
        let className = 'dc-modal-step'
        if (s === step) className += ' dc-modal-step--active'
        else if (s < step) className += ' dc-modal-step--completed'

        const labels = ['Tipo', 'Configuracion', 'Posicion']

        return (
          <div key={s} className={className} onClick={() => { if (s < step) setStep(s) }} style={{ cursor: s < step ? 'pointer' : 'default' }}>
            <span className="dc-modal-step-number">
              {s < step ? <i className="fas fa-check" style={{ fontSize: 9 }}></i> : s}
            </span>
            <span>{labels[s - 1]}</span>
          </div>
        )
      })}
    </div>
  )

  const renderStep1 = () => (
    <div>
      <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginBottom: 16 }}>
        Selecciona el tipo de widget que deseas agregar:
      </p>
      <div className="dc-widget-type-grid">
        {WIDGET_TYPES.map(wt => (
          <div
            key={wt.tipo}
            className={`dc-widget-type-option ${selectedType === wt.tipo ? 'dc-widget-type-option--selected' : ''}`}
            onClick={() => handleTypeSelect(wt.tipo)}
          >
            <i className={wt.icon}></i>
            <span>{wt.label}</span>
          </div>
        ))}
      </div>
    </div>
  )

  const renderStep2 = () => {
    const renderCommonFields = () => (
      <div className="dc-config-field">
        <label>{t('title') || 'Titulo'}</label>
        <input
          type="text"
          value={titulo}
          onChange={(e) => setTitulo(e.target.value)}
          placeholder="Titulo del widget"
        />
      </div>
    )

    const renderKpiConfig = () => (
      <div className="dc-config-form">
        {renderCommonFields()}
        <div className="dc-config-field">
          <label>Fuente de datos</label>
          <select value={configuracion.fuente || ''} onChange={(e) => updateConfig('fuente', e.target.value)}>
            {KPI_SOURCES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
          </select>
        </div>
        <div className="dc-config-row">
          <div className="dc-config-field">
            <label>Color</label>
            <input type="color" value={configuracion.color || '#2563eb'} onChange={(e) => updateConfig('color', e.target.value)} />
          </div>
          <div className="dc-config-field">
            <label>Icono (Font Awesome class)</label>
            <input type="text" value={configuracion.icono || ''} onChange={(e) => updateConfig('icono', e.target.value)} placeholder="fas fa-chart-line" />
          </div>
        </div>
      </div>
    )

    const renderChartConfig = () => (
      <div className="dc-config-form">
        {renderCommonFields()}
        <div className="dc-config-field">
          <label>Fuente de datos</label>
          <select value={configuracion.fuente || ''} onChange={(e) => updateConfig('fuente', e.target.value)}>
            {CHART_SOURCES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
          </select>
        </div>
        <div className="dc-config-row">
          <div className="dc-config-field">
            <label>Tipo de grafico</label>
            <select value={configuracion.tipo_grafico || 'bar'} onChange={(e) => updateConfig('tipo_grafico', e.target.value)}>
              <option value="bar">Barras</option>
              <option value="line">Lineas</option>
            </select>
          </div>
          <div className="dc-config-field">
            <label>Dias</label>
            <input type="number" min={1} max={90} value={configuracion.dias || 7} onChange={(e) => updateConfig('dias', parseInt(e.target.value, 10) || 7)} />
          </div>
        </div>
        <div className="dc-config-field">
          <label>Color</label>
          <input type="color" value={configuracion.color || '#2563eb'} onChange={(e) => updateConfig('color', e.target.value)} />
        </div>
      </div>
    )

    const renderTableConfig = () => (
      <div className="dc-config-form">
        {renderCommonFields()}
        <div className="dc-config-field">
          <label>Fuente de datos</label>
          <select value={configuracion.fuente || ''} onChange={(e) => updateConfig('fuente', e.target.value)}>
            {TABLE_SOURCES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
          </select>
        </div>
        <div className="dc-config-field">
          <label>Limite de filas</label>
          <input type="number" min={1} max={100} value={configuracion.limite || 10} onChange={(e) => updateConfig('limite', parseInt(e.target.value, 10) || 10)} />
        </div>
      </div>
    )

    const renderMonitorConfig = () => (
      <div className="dc-config-form">
        {renderCommonFields()}
        <div className="dc-config-field">
          <label>Limite de ejecuciones</label>
          <input type="number" min={1} max={50} value={configuracion.limite || 10} onChange={(e) => updateConfig('limite', parseInt(e.target.value, 10) || 10)} />
        </div>
      </div>
    )

    const renderAgentConfig = () => (
      <div className="dc-config-form">
        {renderCommonFields()}
        <p style={{ color: 'var(--text-secondary)', fontSize: 13 }}>
          Este widget muestra el estado de los agentes RPA conectados. No requiere configuracion adicional.
        </p>
      </div>
    )

    const renderHtmlConfig = () => (
      <div className="dc-config-form">
        {renderCommonFields()}
        <div className="dc-config-field">
          <label>Contenido HTML</label>
          <textarea
            value={configuracion.contenido || ''}
            onChange={(e) => updateConfig('contenido', e.target.value)}
            placeholder="<p>Tu contenido HTML aqui...</p>"
            rows={6}
          />
        </div>
      </div>
    )

    const renderClockConfig = () => (
      <div className="dc-config-form">
        {renderCommonFields()}
        <div className="dc-config-field">
          <label>Mensaje de bienvenida</label>
          <input
            type="text"
            value={configuracion.mensaje || ''}
            onChange={(e) => updateConfig('mensaje', e.target.value)}
            placeholder="Bienvenido a Alqvimia"
          />
        </div>
      </div>
    )

    const configRenderers = {
      kpi: renderKpiConfig,
      chart: renderChartConfig,
      table: renderTableConfig,
      workflow_monitor: renderMonitorConfig,
      agent_status: renderAgentConfig,
      html: renderHtmlConfig,
      clock: renderClockConfig
    }

    const renderer = configRenderers[selectedType]
    return renderer ? renderer() : (
      <div className="dc-config-form">{renderCommonFields()}</div>
    )
  }

  const renderStep3 = () => (
    <div className="dc-config-form">
      <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginBottom: 16 }}>
        Define la posicion y tamano del widget en la grilla (12 columnas):
      </p>
      <div className="dc-config-row-4">
        <div className="dc-config-field">
          <label>Columna (X)</label>
          <input
            type="number"
            min={1}
            max={12}
            value={posicion.x}
            onChange={(e) => updatePos('x', e.target.value)}
          />
        </div>
        <div className="dc-config-field">
          <label>Fila (Y)</label>
          <input
            type="number"
            min={1}
            max={20}
            value={posicion.y}
            onChange={(e) => updatePos('y', e.target.value)}
          />
        </div>
        <div className="dc-config-field">
          <label>Ancho (W)</label>
          <input
            type="number"
            min={1}
            max={12}
            value={posicion.w}
            onChange={(e) => updatePos('w', e.target.value)}
          />
        </div>
        <div className="dc-config-field">
          <label>Alto (H)</label>
          <input
            type="number"
            min={1}
            max={4}
            value={posicion.h}
            onChange={(e) => updatePos('h', e.target.value)}
          />
        </div>
      </div>

      <div style={{
        marginTop: 16,
        padding: 12,
        background: 'var(--bg-tertiary)',
        borderRadius: 'var(--border-radius-sm)',
        fontSize: 13,
        color: 'var(--text-secondary)'
      }}>
        <i className="fas fa-info-circle" style={{ marginRight: 6 }}></i>
        La grilla tiene 12 columnas. El widget ocupara desde la columna {posicion.x} hasta la {Math.min(posicion.x + posicion.w - 1, 12)},
        y desde la fila {posicion.y} hasta la {posicion.y + posicion.h - 1}.
      </div>
    </div>
  )

  const footer = (
    <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
      <div>
        {step > 1 && (
          <button className="dc-btn dc-btn--secondary" onClick={() => setStep(s => s - 1)}>
            <i className="fas fa-arrow-left"></i>
            Anterior
          </button>
        )}
      </div>
      <div style={{ display: 'flex', gap: 8 }}>
        <button className="dc-btn dc-btn--secondary" onClick={onClose}>
          {t('cancel') || 'Cancelar'}
        </button>
        {step < 3 ? (
          <button className="dc-btn dc-btn--primary" onClick={() => setStep(s => s + 1)} disabled={!canGoNext()}>
            Siguiente
            <i className="fas fa-arrow-right"></i>
          </button>
        ) : (
          <button className="dc-btn dc-btn--primary" onClick={handleSave} disabled={!canGoNext()}>
            <i className="fas fa-check"></i>
            {editingWidget ? (t('update') || 'Actualizar') : (t('add') || 'Agregar')}
          </button>
        )}
      </div>
    </div>
  )

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={editingWidget ? (t('edit_widget') || 'Editar Widget') : (t('add_widget') || 'Agregar Widget')}
      footer={footer}
      size="lg"
      className="dc-widget-config-modal"
    >
      {renderStepIndicator()}
      {step === 1 && renderStep1()}
      {step === 2 && renderStep2()}
      {step === 3 && renderStep3()}
    </Modal>
  )
}

export default WidgetConfigModal
