import KpiWidget from './widgets/KpiWidget'
import ChartWidget from './widgets/ChartWidget'
import TableWidget from './widgets/TableWidget'
import WorkflowMonitorWidget from './widgets/WorkflowMonitorWidget'
import AgentStatusWidget from './widgets/AgentStatusWidget'
import HtmlWidget from './widgets/HtmlWidget'
import ClockWidget from './widgets/ClockWidget'

const WIDGET_COMPONENTS = {
  kpi: KpiWidget,
  chart: ChartWidget,
  grafico: ChartWidget,
  table: TableWidget,
  tabla: TableWidget,
  workflow_monitor: WorkflowMonitorWidget,
  monitor: WorkflowMonitorWidget,
  agent_status: AgentStatusWidget,
  agentes: AgentStatusWidget,
  html: HtmlWidget,
  clock: ClockWidget,
  reloj: ClockWidget
}

function WidgetRenderer({ widget, onEdit, onDelete }) {
  if (!widget || !widget.tipo) {
    return (
      <div className="dc-empty" style={{ padding: '16px' }}>
        <i className="fas fa-puzzle-piece" style={{ fontSize: 20 }}></i>
        <p>Widget no configurado</p>
      </div>
    )
  }

  const WidgetComponent = WIDGET_COMPONENTS[widget.tipo]

  if (!WidgetComponent) {
    return (
      <div className="dc-error">
        <i className="fas fa-exclamation-triangle"></i>
        <span>Tipo de widget desconocido: {widget.tipo}</span>
      </div>
    )
  }

  return (
    <WidgetComponent
      configuracion={widget.configuracion || {}}
      onEdit={onEdit ? () => onEdit(widget) : undefined}
      onDelete={onDelete ? () => onDelete(widget) : undefined}
    />
  )
}

export default WidgetRenderer
