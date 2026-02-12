import { useState, useEffect } from 'react'

function ChartWidget({ configuracion }) {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const {
    fuente = 'ejecuciones_por_dia',
    dias = 7,
    tipo_grafico = 'bar',
    color = 'var(--primary-color, #2563eb)'
  } = configuracion || {}

  useEffect(() => {
    let cancelled = false

    const fetchData = async () => {
      setLoading(true)
      setError(null)
      try {
        const response = await fetch(`/api/dashboards/widget-data/${fuente}?dias=${dias}`)
        if (!response.ok) throw new Error('Error al obtener datos')
        const result = await response.json()
        if (!cancelled) {
          setData(result.datos ?? result.data ?? [])
        }
      } catch (err) {
        if (!cancelled) {
          setError(err.message)
          setData([])
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    fetchData()
    return () => { cancelled = true }
  }, [fuente, dias])

  if (loading) {
    return (
      <div className="dc-loading">
        <i className="fas fa-spinner"></i>
        <span>Cargando...</span>
      </div>
    )
  }

  if (error || data.length === 0) {
    return (
      <div className="dc-chart-no-data">
        <i className="fas fa-chart-bar" style={{ marginRight: 6, opacity: 0.5 }}></i>
        Sin datos disponibles
      </div>
    )
  }

  const maxValue = Math.max(...data.map(d => d.valor ?? d.value ?? 0), 1)
  const padding = { top: 10, right: 10, bottom: 30, left: 10 }
  const viewBoxWidth = 400
  const viewBoxHeight = 200
  const chartWidth = viewBoxWidth - padding.left - padding.right
  const chartHeight = viewBoxHeight - padding.top - padding.bottom

  const renderBarChart = () => {
    const barWidth = Math.min(30, (chartWidth / data.length) * 0.7)
    const gap = (chartWidth - barWidth * data.length) / (data.length + 1)

    return (
      <svg viewBox={`0 0 ${viewBoxWidth} ${viewBoxHeight}`} preserveAspectRatio="xMidYMid meet">
        {data.map((item, i) => {
          const value = item.valor ?? item.value ?? 0
          const barHeight = (value / maxValue) * chartHeight
          const x = padding.left + gap + i * (barWidth + gap)
          const y = padding.top + chartHeight - barHeight
          const label = item.etiqueta ?? item.label ?? ''

          return (
            <g key={i}>
              <rect
                className="dc-chart-bar"
                x={x}
                y={y}
                width={barWidth}
                height={barHeight}
                rx={3}
                fill={color}
                opacity={0.9}
              >
                <title>{`${label}: ${value}`}</title>
              </rect>
              <text
                className="dc-chart-label"
                x={x + barWidth / 2}
                y={viewBoxHeight - 5}
              >
                {label.length > 5 ? label.substring(0, 5) : label}
              </text>
            </g>
          )
        })}
      </svg>
    )
  }

  const renderLineChart = () => {
    const stepX = chartWidth / Math.max(data.length - 1, 1)

    const points = data.map((item, i) => {
      const value = item.valor ?? item.value ?? 0
      const x = padding.left + i * stepX
      const y = padding.top + chartHeight - (value / maxValue) * chartHeight
      return { x, y, value, label: item.etiqueta ?? item.label ?? '' }
    })

    const linePath = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ')

    const areaPath = linePath +
      ` L ${points[points.length - 1].x} ${padding.top + chartHeight}` +
      ` L ${points[0].x} ${padding.top + chartHeight} Z`

    return (
      <svg viewBox={`0 0 ${viewBoxWidth} ${viewBoxHeight}`} preserveAspectRatio="xMidYMid meet">
        <defs>
          <linearGradient id={`area-gradient-${fuente}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.3" />
            <stop offset="100%" stopColor={color} stopOpacity="0.02" />
          </linearGradient>
        </defs>

        <path d={areaPath} fill={`url(#area-gradient-${fuente})`} />
        <path className="dc-chart-line" d={linePath} stroke={color} />

        {points.map((p, i) => (
          <g key={i}>
            <circle
              className="dc-chart-dot"
              cx={p.x}
              cy={p.y}
              r={3}
              fill={color}
            >
              <title>{`${p.label}: ${p.value}`}</title>
            </circle>
            {data.length <= 10 && (
              <text className="dc-chart-label" x={p.x} y={viewBoxHeight - 5}>
                {p.label.length > 5 ? p.label.substring(0, 5) : p.label}
              </text>
            )}
          </g>
        ))}
      </svg>
    )
  }

  return (
    <div className="dc-chart">
      {tipo_grafico === 'line' ? renderLineChart() : renderBarChart()}
    </div>
  )
}

export default ChartWidget
