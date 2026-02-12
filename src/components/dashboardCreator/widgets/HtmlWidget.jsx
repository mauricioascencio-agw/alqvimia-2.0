function HtmlWidget({ configuracion }) {
  const { contenido = '' } = configuracion || {}

  if (!contenido) {
    return (
      <div className="dc-empty" style={{ padding: '24px 16px' }}>
        <i className="fas fa-code" style={{ fontSize: 24 }}></i>
        <p>Sin contenido HTML configurado</p>
      </div>
    )
  }

  return (
    <div
      className="dc-html-content"
      dangerouslySetInnerHTML={{ __html: contenido }}
    />
  )
}

export default HtmlWidget
