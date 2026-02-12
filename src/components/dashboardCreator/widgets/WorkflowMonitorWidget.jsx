import { useState, useEffect } from 'react'
import { useLanguage } from '../../../context/LanguageContext'

function WorkflowMonitorWidget({ configuracion }) {
  const { t } = useLanguage()
  const [executions, setExecutions] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const {
    limite = 10
  } = configuracion || {}

  useEffect(() => {
    let cancelled = false

    const fetchData = async () => {
      setLoading(true)
      setError(null)
      try {
        const response = await fetch(`/api/dashboards/widget-data/ejecuciones_recientes?limite=${limite}`)
        if (!response.ok) throw new Error('Error al obtener datos')
        const data = await response.json()
        if (!cancelled) {
          setExecutions(data.filas ?? data.rows ?? data.datos ?? [])
        }
      } catch (err) {
        if (!cancelled) {
          setError(err.message)
          setExecutions([])
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    fetchData()

    const interval = setInterval(fetchData, 30000)
    return () => {
      cancelled = true
      clearInterval(interval)
    }
  }, [limite])

  if (loading) {
    return (
      <div className="dc-loading">
        <i className="fas fa-spinner"></i>
        <span>{t('loading') || 'Cargando...'}</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="dc-error">
        <i className="fas fa-exclamation-triangle"></i>
        <span>{error}</span>
      </div>
    )
  }

  if (executions.length === 0) {
    return (
      <div className="dc-empty" style={{ padding: '24px 16px' }}>
        <i className="fas fa-play-circle" style={{ fontSize: 24 }}></i>
        <p>No hay ejecuciones recientes</p>
      </div>
    )
  }

  const getStatusConfig = (estado) => {
    const statusStr = String(estado).toLowerCase()
    if (statusStr === 'completado' || statusStr === 'exitoso') {
      return { className: 'dc-status--completado', icon: 'fas fa-check-circle' }
    }
    if (statusStr === 'fallido' || statusStr === 'error') {
      return { className: 'dc-status--fallido', icon: 'fas fa-times-circle' }
    }
    if (statusStr === 'ejecutando' || statusStr === 'running') {
      return { className: 'dc-status--ejecutando', icon: 'fas fa-spinner fa-spin' }
    }
    return { className: 'dc-status--pendiente', icon: 'fas fa-clock' }
  }

  return (
    <div style={{ overflow: 'auto', flex: 1 }}>
      <table className="dc-table">
        <thead>
          <tr>
            <th>Workflow</th>
            <th>Estado</th>
            <th>Inicio</th>
            <th>Duracion</th>
          </tr>
        </thead>
        <tbody>
          {executions.map((exec, i) => {
            const status = getStatusConfig(exec.estado)
            return (
              <tr key={exec.id ?? i}>
                <td>
                  <span style={{ fontWeight: 500 }}>
                    {exec.workflow ?? exec.nombre ?? '-'}
                  </span>
                </td>
                <td>
                  <span className={`dc-status ${status.className}`}>
                    <i className={status.icon} style={{ fontSize: 10 }}></i>
                    {exec.estado ?? '-'}
                  </span>
                </td>
                <td>{exec.inicio ?? exec.fecha ?? '-'}</td>
                <td>{exec.duracion ?? '-'}</td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

export default WorkflowMonitorWidget
