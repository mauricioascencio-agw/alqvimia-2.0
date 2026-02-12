import { useLanguage } from '../../context/LanguageContext'

function DashboardList({ dashboards, onEdit, onDelete, onDuplicate, onCreate }) {
  const { t } = useLanguage()

  return (
    <div className="dc-list">
      {/* Create new dashboard card */}
      <div className="dc-card dc-card--create" onClick={onCreate}>
        <div className="dc-card--create-content">
          <i className="fas fa-plus-circle"></i>
          <span>{t('create_dashboard') || 'Crear nuevo dashboard'}</span>
        </div>
      </div>

      {/* Dashboard cards */}
      {dashboards && dashboards.map((dashboard) => (
        <div className="dc-card" key={dashboard.id}>
          <div className="dc-card-header">
            <h3>{dashboard.nombre || dashboard.name || 'Sin nombre'}</h3>
            <div className="dc-card-header-badges">
              {dashboard.tipo && (
                <span className="dc-badge dc-badge--tipo">
                  {dashboard.tipo}
                </span>
              )}
              <span className={`dc-badge ${dashboard.activo !== false ? 'dc-badge--activo' : 'dc-badge--inactivo'}`}>
                {dashboard.activo !== false
                  ? (t('active') || 'Activo')
                  : (t('inactive') || 'Inactivo')
                }
              </span>
            </div>
          </div>

          <div className="dc-card-body">
            <p>{dashboard.descripcion || dashboard.description || 'Sin descripcion'}</p>
            <div className="dc-card-meta">
              <span>
                <i className="fas fa-th-large"></i>
                {dashboard.widgets_count ?? dashboard.widgets?.length ?? 0} widgets
              </span>
              {dashboard.actualizado && (
                <span>
                  <i className="fas fa-clock"></i>
                  {dashboard.actualizado}
                </span>
              )}
              {dashboard.autor && (
                <span>
                  <i className="fas fa-user"></i>
                  {dashboard.autor}
                </span>
              )}
            </div>
          </div>

          <div className="dc-card-footer">
            <button onClick={() => onEdit && onEdit(dashboard)} title={t('edit') || 'Editar'}>
              <i className="fas fa-pen"></i>
              {t('edit') || 'Editar'}
            </button>
            <button onClick={() => onDuplicate && onDuplicate(dashboard)} title={t('duplicate') || 'Duplicar'}>
              <i className="fas fa-copy"></i>
            </button>
            <button
              className="dc-btn-danger"
              onClick={() => onDelete && onDelete(dashboard)}
              title={t('delete') || 'Eliminar'}
            >
              <i className="fas fa-trash"></i>
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}

export default DashboardList
