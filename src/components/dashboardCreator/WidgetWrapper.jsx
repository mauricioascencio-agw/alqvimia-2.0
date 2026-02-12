function WidgetWrapper({ widget, onEdit, onDelete, children }) {
  const { posicion = {}, titulo = '' } = widget || {}
  const {
    x = 1,
    y = 1,
    w = 3,
    h = 2
  } = posicion

  const gridStyle = {
    gridColumn: `${x} / span ${w}`,
    gridRow: `${y} / span ${h}`
  }

  return (
    <div className="dc-widget" style={gridStyle}>
      <div className="dc-widget-header">
        <div className="dc-widget-header-left">
          <span className="dc-widget-drag-handle">
            <i className="fas fa-grip-vertical"></i>
          </span>
          <span className="dc-widget-title">{titulo || widget.tipo || 'Widget'}</span>
        </div>
        <div className="dc-widget-actions">
          {onEdit && (
            <button
              onClick={() => onEdit(widget)}
              title="Editar widget"
            >
              <i className="fas fa-pen"></i>
            </button>
          )}
          {onDelete && (
            <button
              className="dc-widget-delete"
              onClick={() => onDelete(widget)}
              title="Eliminar widget"
            >
              <i className="fas fa-trash"></i>
            </button>
          )}
        </div>
      </div>
      <div className="dc-widget-body">
        {children}
      </div>
    </div>
  )
}

export default WidgetWrapper
