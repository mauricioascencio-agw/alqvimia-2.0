import WidgetWrapper from './WidgetWrapper'
import WidgetRenderer from './WidgetRenderer'

function DashboardGrid({ widgets, onEditWidget, onDeleteWidget }) {
  if (!widgets || widgets.length === 0) {
    return (
      <div className="dc-grid dc-grid--empty">
        <div className="dc-empty">
          <i className="fas fa-th-large"></i>
          <h4>Dashboard vacio</h4>
          <p>Agrega widgets para comenzar a construir tu dashboard personalizado.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="dc-grid">
      {widgets.map((widget) => (
        <WidgetWrapper
          key={widget.id}
          widget={widget}
          onEdit={onEditWidget}
          onDelete={onDeleteWidget}
        >
          <WidgetRenderer
            widget={widget}
            onEdit={onEditWidget}
            onDelete={onDeleteWidget}
          />
        </WidgetWrapper>
      ))}
    </div>
  )
}

export default DashboardGrid
