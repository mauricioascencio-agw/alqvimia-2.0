import { useState, useEffect } from 'react'
import { useLanguage } from '../../../context/LanguageContext'

const FUENTE_LABELS = {
  workflows_total: 'Total Workflows',
  workflows_activos: 'Workflows Activos',
  ejecuciones_total: 'Total Ejecuciones',
  ejecuciones_exitosas: 'Ejecuciones Exitosas',
  usuarios_total: 'Total Usuarios',
  usuarios_activos: 'Usuarios Activos'
}

const FUENTE_ICONS = {
  workflows_total: 'fas fa-project-diagram',
  workflows_activos: 'fas fa-play-circle',
  ejecuciones_total: 'fas fa-history',
  ejecuciones_exitosas: 'fas fa-check-circle',
  usuarios_total: 'fas fa-users',
  usuarios_activos: 'fas fa-user-check'
}

function KpiWidget({ configuracion, onEdit }) {
  const { t } = useLanguage()
  const [value, setValue] = useState(null)
  const [trend, setTrend] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const {
    fuente = 'workflows_total',
    color = 'var(--primary-color)',
    icono
  } = configuracion || {}

  useEffect(() => {
    let cancelled = false

    const fetchData = async () => {
      setLoading(true)
      setError(null)
      try {
        const response = await fetch(`/api/dashboards/widget-data/${fuente}`)
        if (!response.ok) throw new Error('Error al obtener datos')
        const data = await response.json()
        if (!cancelled) {
          setValue(data.valor ?? data.value ?? 0)
          setTrend(data.tendencia ?? data.trend ?? null)
        }
      } catch (err) {
        if (!cancelled) {
          setError(err.message)
          setValue('--')
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    fetchData()
    return () => { cancelled = true }
  }, [fuente])

  const iconClass = icono || FUENTE_ICONS[fuente] || 'fas fa-chart-bar'
  const label = FUENTE_LABELS[fuente] || fuente

  if (loading) {
    return (
      <div className="dc-loading">
        <i className="fas fa-spinner"></i>
        <span>{t('loading') || 'Cargando...'}</span>
      </div>
    )
  }

  const renderTrend = () => {
    if (trend === null || trend === undefined) return null

    let trendClass = 'dc-kpi-trend--neutral'
    let trendIcon = 'fas fa-minus'

    if (trend > 0) {
      trendClass = 'dc-kpi-trend--up'
      trendIcon = 'fas fa-arrow-up'
    } else if (trend < 0) {
      trendClass = 'dc-kpi-trend--down'
      trendIcon = 'fas fa-arrow-down'
    }

    return (
      <div className={`dc-kpi-trend ${trendClass}`}>
        <i className={trendIcon}></i>
        <span>{Math.abs(trend)}%</span>
      </div>
    )
  }

  return (
    <div className="dc-kpi">
      <i className={`dc-kpi-icon ${iconClass}`} style={{ color }}></i>
      <div className="dc-kpi-value" style={{ color }}>
        {error ? '--' : (typeof value === 'number' ? value.toLocaleString() : value)}
      </div>
      <div className="dc-kpi-label">{label}</div>
      {renderTrend()}
    </div>
  )
}

export default KpiWidget
