import { useState, useEffect } from 'react'
import { useLanguage } from '../../../context/LanguageContext'

const COLUMN_CONFIG = {
  workflows_recientes: {
    columns: [
      { key: 'nombre', label: 'Nombre' },
      { key: 'estado', label: 'Estado' },
      { key: 'actualizado', label: 'Actualizado' }
    ]
  },
  ejecuciones_recientes: {
    columns: [
      { key: 'workflow', label: 'Workflow' },
      { key: 'estado', label: 'Estado' },
      { key: 'inicio', label: 'Inicio' },
      { key: 'duracion', label: 'Duracion' }
    ]
  }
}

function TableWidget({ configuracion }) {
  const { t } = useLanguage()
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const {
    fuente = 'workflows_recientes',
    limite = 10
  } = configuracion || {}

  useEffect(() => {
    let cancelled = false

    const fetchData = async () => {
      setLoading(true)
      setError(null)
      try {
        const response = await fetch(`/api/dashboards/widget-data/${fuente}?limite=${limite}`)
        if (!response.ok) throw new Error('Error al obtener datos')
        const data = await response.json()
        if (!cancelled) {
          setRows(data.filas ?? data.rows ?? data.datos ?? [])
        }
      } catch (err) {
        if (!cancelled) {
          setError(err.message)
          setRows([])
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    fetchData()
    return () => { cancelled = true }
  }, [fuente, limite])

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

  if (rows.length === 0) {
    return (
      <div className="dc-empty" style={{ padding: '24px 16px' }}>
        <i className="fas fa-table" style={{ fontSize: 24 }}></i>
        <p>Sin datos disponibles</p>
      </div>
    )
  }

  const config = COLUMN_CONFIG[fuente]
  const columns = config
    ? config.columns
    : Object.keys(rows[0]).map(key => ({ key, label: key }))

  const renderCellValue = (row, key) => {
    const value = row[key]
    if (value === null || value === undefined) return '-'

    if (key === 'estado') {
      const statusMap = {
        completado: 'dc-status--completado',
        exitoso: 'dc-status--completado',
        fallido: 'dc-status--fallido',
        error: 'dc-status--fallido',
        ejecutando: 'dc-status--ejecutando',
        activo: 'dc-status--completado',
        inactivo: 'dc-status--fallido',
        pendiente: 'dc-status--pendiente'
      }
      const statusClass = statusMap[String(value).toLowerCase()] || ''

      return (
        <span className={`dc-status ${statusClass}`}>
          <span className="dc-status-dot"></span>
          {value}
        </span>
      )
    }

    return String(value)
  }

  return (
    <div style={{ overflow: 'auto', flex: 1 }}>
      <table className="dc-table">
        <thead>
          <tr>
            {columns.map(col => (
              <th key={col.key}>{col.label}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={row.id ?? i}>
              {columns.map(col => (
                <td key={col.key}>{renderCellValue(row, col.key)}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default TableWidget
