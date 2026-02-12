import { useLanguage } from '../../context/LanguageContext'

function DashboardToolbar({ onAddWidget, onSave, onPreview, onBack, dashboardName, onNameChange }) {
  const { t } = useLanguage()

  return (
    <div className="dc-toolbar">
      <div className="dc-toolbar-name">
        <input
          type="text"
          value={dashboardName || ''}
          onChange={(e) => onNameChange && onNameChange(e.target.value)}
          placeholder={t('dashboard_name_placeholder') || 'Nombre del dashboard...'}
        />
      </div>

      <div className="dc-toolbar-actions">
        <button className="dc-btn dc-btn--primary" onClick={onAddWidget}>
          <i className="fas fa-plus"></i>
          {t('add_widget') || 'Agregar Widget'}
        </button>

        <button className="dc-btn" onClick={onPreview}>
          <i className="fas fa-eye"></i>
          {t('preview') || 'Vista Previa'}
        </button>

        <button className="dc-btn dc-btn--primary" onClick={onSave}>
          <i className="fas fa-save"></i>
          {t('save') || 'Guardar'}
        </button>

        <button className="dc-btn dc-btn--secondary" onClick={onBack}>
          <i className="fas fa-arrow-left"></i>
          {t('back') || 'Volver'}
        </button>
      </div>
    </div>
  )
}

export default DashboardToolbar
