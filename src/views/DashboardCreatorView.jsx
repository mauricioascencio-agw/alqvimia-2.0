import { useState, useEffect, useCallback } from 'react'
import { useLanguage } from '../context/LanguageContext'
import { useAuth } from '../context/AuthContext'
import DashboardList from '../components/dashboardCreator/DashboardList'
import DashboardToolbar from '../components/dashboardCreator/DashboardToolbar'
import DashboardGrid from '../components/dashboardCreator/DashboardGrid'
import WidgetConfigModal from '../components/dashboardCreator/WidgetConfigModal'
import '../assets/css/dashboard-creator.css'

const API_BASE = import.meta.env.VITE_BACKEND_URL || 'http://localhost:4000'

function DashboardCreatorView() {
  const { t } = useLanguage()
  const { authFetch, user } = useAuth()

  // Mode: 'list' or 'editor'
  const [mode, setMode] = useState('list')
  const [dashboards, setDashboards] = useState([])
  const [loading, setLoading] = useState(true)

  // Current dashboard being edited
  const [currentDashboard, setCurrentDashboard] = useState(null)
  const [dashboardName, setDashboardName] = useState('')
  const [dashboardDesc, setDashboardDesc] = useState('')
  const [dashboardTipo, setDashboardTipo] = useState('personal')
  const [widgets, setWidgets] = useState([])

  // Widget config modal
  const [widgetModalOpen, setWidgetModalOpen] = useState(false)
  const [editingWidget, setEditingWidget] = useState(null)

  // Preview mode
  const [previewMode, setPreviewMode] = useState(false)

  // Load dashboards
  const loadDashboards = useCallback(async () => {
    try {
      setLoading(true)
      const response = await authFetch(`${API_BASE}/api/dashboards`)
      const data = await response.json()
      if (data.success) {
        setDashboards(data.data || [])
      }
    } catch (err) {
      console.error('[DashboardCreator] Error loading dashboards:', err)
    } finally {
      setLoading(false)
    }
  }, [authFetch])

  useEffect(() => {
    loadDashboards()
  }, [loadDashboards])

  // Create new dashboard
  const handleCreate = () => {
    setCurrentDashboard(null)
    setDashboardName('')
    setDashboardDesc('')
    setDashboardTipo('personal')
    setWidgets([])
    setPreviewMode(false)
    setMode('editor')
  }

  // Edit existing dashboard
  const handleEdit = (dashboard) => {
    setCurrentDashboard(dashboard)
    setDashboardName(dashboard.nombre || '')
    setDashboardDesc(dashboard.descripcion || '')
    setDashboardTipo(dashboard.tipo || 'personal')
    // Parse widgets - could be JSON string or array
    let w = dashboard.widgets || []
    if (typeof w === 'string') {
      try { w = JSON.parse(w) } catch { w = [] }
    }
    setWidgets(Array.isArray(w) ? w : [])
    setPreviewMode(false)
    setMode('editor')
  }

  // Delete dashboard
  const handleDelete = async (dashboard) => {
    if (!confirm(`${t('dash_delete') || 'Eliminar'} "${dashboard.nombre}"?`)) return
    try {
      const response = await authFetch(`${API_BASE}/api/dashboards/${dashboard.id}`, { method: 'DELETE' })
      const data = await response.json()
      if (data.success) {
        setDashboards(prev => prev.filter(d => d.id !== dashboard.id))
      }
    } catch (err) {
      console.error('[DashboardCreator] Error deleting:', err)
    }
  }

  // Duplicate dashboard
  const handleDuplicate = async (dashboard) => {
    try {
      const response = await authFetch(`${API_BASE}/api/dashboards/${dashboard.id}/duplicate`, { method: 'POST' })
      const data = await response.json()
      if (data.success) {
        loadDashboards()
      }
    } catch (err) {
      console.error('[DashboardCreator] Error duplicating:', err)
    }
  }

  // Save dashboard
  const handleSave = async () => {
    if (!dashboardName.trim()) {
      alert('El nombre del dashboard es requerido')
      return
    }

    const payload = {
      nombre: dashboardName.trim(),
      descripcion: dashboardDesc.trim(),
      tipo: dashboardTipo,
      widgets: JSON.stringify(widgets),
      estado: 'activo'
    }

    try {
      let response
      if (currentDashboard?.id) {
        response = await authFetch(`${API_BASE}/api/dashboards/${currentDashboard.id}`, {
          method: 'PUT',
          body: JSON.stringify(payload)
        })
      } else {
        response = await authFetch(`${API_BASE}/api/dashboards`, {
          method: 'POST',
          body: JSON.stringify(payload)
        })
      }

      const data = await response.json()
      if (data.success) {
        if (!currentDashboard?.id && data.data?.id) {
          setCurrentDashboard(data.data)
        }
        loadDashboards()
      }
    } catch (err) {
      console.error('[DashboardCreator] Error saving:', err)
    }
  }

  // Back to list
  const handleBack = () => {
    setMode('list')
    setPreviewMode(false)
    setCurrentDashboard(null)
  }

  // Add widget
  const handleAddWidget = () => {
    setEditingWidget(null)
    setWidgetModalOpen(true)
  }

  // Edit widget
  const handleEditWidget = (widget) => {
    setEditingWidget(widget)
    setWidgetModalOpen(true)
  }

  // Delete widget
  const handleDeleteWidget = (widget) => {
    setWidgets(prev => prev.filter(w => w.id !== widget.id))
  }

  // Save widget from modal
  const handleSaveWidget = (widgetData) => {
    setWidgets(prev => {
      const idx = prev.findIndex(w => w.id === widgetData.id)
      if (idx >= 0) {
        const updated = [...prev]
        updated[idx] = widgetData
        return updated
      }
      return [...prev, widgetData]
    })
  }

  // Toggle preview
  const handlePreview = () => {
    setPreviewMode(prev => !prev)
  }

  // List view
  if (mode === 'list') {
    return (
      <div className="dc-container">
        <div className="dc-header">
          <div className="dc-header-info">
            <h2>
              <i className="fas fa-tachometer-alt"></i>
              {t('dash_title') || 'Dashboard Creator'}
            </h2>
            <span className="dc-header-count">{dashboards.length} dashboards</span>
          </div>
        </div>

        {loading ? (
          <div className="dc-loading">
            <i className="fas fa-spinner fa-spin"></i>
            <span>Cargando dashboards...</span>
          </div>
        ) : (
          <DashboardList
            dashboards={dashboards}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onDuplicate={handleDuplicate}
            onCreate={handleCreate}
          />
        )}
      </div>
    )
  }

  // Editor view
  return (
    <div className={`dc-container ${previewMode ? 'dc-preview-mode' : ''}`}>
      {!previewMode && (
        <>
          <DashboardToolbar
            onAddWidget={handleAddWidget}
            onSave={handleSave}
            onPreview={handlePreview}
            onBack={handleBack}
            dashboardName={dashboardName}
            onNameChange={setDashboardName}
          />

          <div className="dc-editor-meta">
            <input
              type="text"
              className="dc-desc-input"
              value={dashboardDesc}
              onChange={(e) => setDashboardDesc(e.target.value)}
              placeholder={t('dash_edit') || 'Descripcion del dashboard...'}
            />
            <select
              className="dc-tipo-select"
              value={dashboardTipo}
              onChange={(e) => setDashboardTipo(e.target.value)}
            >
              <option value="personal">{t('dash_tipo_personal') || 'Personal'}</option>
              <option value="compartido">{t('dash_tipo_compartido') || 'Compartido'}</option>
              <option value="minisite">{t('dash_tipo_minisite') || 'Mini-sitio'}</option>
            </select>
          </div>
        </>
      )}

      {previewMode && (
        <div className="dc-preview-bar">
          <span><i className="fas fa-eye"></i> {t('dash_preview') || 'Vista previa'}: {dashboardName}</span>
          <button className="dc-btn dc-btn--secondary" onClick={handlePreview}>
            <i className="fas fa-times"></i> Cerrar preview
          </button>
        </div>
      )}

      <DashboardGrid
        widgets={widgets}
        onEditWidget={previewMode ? null : handleEditWidget}
        onDeleteWidget={previewMode ? null : handleDeleteWidget}
      />

      <WidgetConfigModal
        isOpen={widgetModalOpen}
        onClose={() => setWidgetModalOpen(false)}
        onSave={handleSaveWidget}
        editingWidget={editingWidget}
      />
    </div>
  )
}

export default DashboardCreatorView
