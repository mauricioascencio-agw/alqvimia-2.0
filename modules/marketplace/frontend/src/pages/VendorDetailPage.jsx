import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import api from '../services/api'

function VendorDetailPage() {
  const { id } = useParams()

  const [vendor, setVendor] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchVendor()
  }, [id])

  const fetchVendor = async () => {
    try {
      const response = await api.get(`/vendors/${id}`)
      setVendor(response.data)
    } catch (error) {
      console.error('Error loading vendor:', error)
    } finally {
      setLoading(false)
    }
  }

  const getBadgeIcon = (badge) => {
    const icons = {
      top_seller: 'fa-trophy',
      verified: 'fa-check-circle',
      support_excellence: 'fa-headset',
      rising_star: 'fa-star',
      innovation_award: 'fa-lightbulb'
    }
    return icons[badge] || 'fa-badge'
  }

  const getBadgeLabel = (badge) => {
    const labels = {
      top_seller: 'Top Seller',
      verified: 'Verificado',
      support_excellence: 'Excelencia en Soporte',
      rising_star: 'Rising Star',
      innovation_award: 'Premio Innovación'
    }
    return labels[badge] || badge
  }

  if (loading) {
    return (
      <div className="page-loading">
        <i className="fas fa-spinner fa-spin"></i>
        <span>Cargando...</span>
      </div>
    )
  }

  if (!vendor) {
    return (
      <div className="not-found">
        <h2>Vendor no encontrado</h2>
        <Link to="/vendors">Volver a vendors</Link>
      </div>
    )
  }

  return (
    <div className="vendor-detail-page">
      <div className="breadcrumb">
        <Link to="/">Inicio</Link>
        <i className="fas fa-chevron-right"></i>
        <Link to="/vendors">Vendors</Link>
        <i className="fas fa-chevron-right"></i>
        <span>{vendor.name}</span>
      </div>

      {/* Vendor Header */}
      <div className="vendor-header">
        <div className="vendor-avatar-large">
          {vendor.logo ? (
            <img src={vendor.logo} alt={vendor.name} />
          ) : (
            <i className="fas fa-store"></i>
          )}
        </div>

        <div className="vendor-info">
          <h1>{vendor.name}</h1>
          <p className="vendor-description">{vendor.description}</p>

          <div className="vendor-badges">
            {vendor.badges?.map(badge => (
              <span key={badge} className="badge">
                <i className={`fas ${getBadgeIcon(badge)}`}></i>
                {getBadgeLabel(badge)}
              </span>
            ))}
          </div>

          <div className="vendor-links">
            {vendor.website && (
              <a href={vendor.website} target="_blank" rel="noopener noreferrer">
                <i className="fas fa-globe"></i>
                Website
              </a>
            )}
            {vendor.socialLinks?.twitter && (
              <a href={vendor.socialLinks.twitter} target="_blank" rel="noopener noreferrer">
                <i className="fab fa-twitter"></i>
              </a>
            )}
            {vendor.socialLinks?.linkedin && (
              <a href={vendor.socialLinks.linkedin} target="_blank" rel="noopener noreferrer">
                <i className="fab fa-linkedin"></i>
              </a>
            )}
          </div>
        </div>

        <div className="vendor-stats-large">
          <div className="stat">
            <span className="stat-value">{vendor.rating}</span>
            <span className="stat-label">
              <i className="fas fa-star"></i>
              Rating
            </span>
          </div>
          <div className="stat">
            <span className="stat-value">{vendor.productCount}</span>
            <span className="stat-label">
              <i className="fas fa-box"></i>
              Productos
            </span>
          </div>
          <div className="stat">
            <span className="stat-value">{vendor.totalSales.toLocaleString()}</span>
            <span className="stat-label">
              <i className="fas fa-download"></i>
              Ventas
            </span>
          </div>
          <div className="stat">
            <span className="stat-value">{vendor.reviewCount}</span>
            <span className="stat-label">
              <i className="fas fa-comment"></i>
              Reviews
            </span>
          </div>
        </div>
      </div>

      {/* Products Section */}
      <section className="vendor-products">
        <h2>Productos de {vendor.name}</h2>
        <p className="section-description">
          Explora los {vendor.productCount} productos disponibles de este vendor
        </p>

        <div className="products-placeholder">
          <i className="fas fa-box"></i>
          <p>Los productos se cargarán aquí</p>
          <Link to={`/products?vendor=${vendor.id}`} className="btn-primary">
            Ver todos los productos
          </Link>
        </div>
      </section>

      {/* Stats Section */}
      <section className="vendor-stats-section">
        <h2>Estadísticas</h2>
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon">
              <i className="fas fa-calendar-check"></i>
            </div>
            <div className="stat-info">
              <span className="stat-value">
                {new Date(vendor.joinedAt).toLocaleDateString('es-ES', {
                  month: 'long',
                  year: 'numeric'
                })}
              </span>
              <span className="stat-label">Miembro desde</span>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">
              <i className="fas fa-clock"></i>
            </div>
            <div className="stat-info">
              <span className="stat-value">&lt; 24h</span>
              <span className="stat-label">Tiempo de respuesta</span>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">
              <i className="fas fa-sync"></i>
            </div>
            <div className="stat-info">
              <span className="stat-value">Mensual</span>
              <span className="stat-label">Frecuencia de updates</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

export default VendorDetailPage
