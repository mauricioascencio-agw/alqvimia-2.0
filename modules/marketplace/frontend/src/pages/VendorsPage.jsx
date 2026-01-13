import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import api from '../services/api'

function VendorsPage() {
  const [vendors, setVendors] = useState([])
  const [topVendors, setTopVendors] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    fetchVendors()
  }, [])

  const fetchVendors = async () => {
    try {
      const [vendorsRes, topRes] = await Promise.all([
        api.get('/vendors'),
        api.get('/vendors/top')
      ])
      setVendors(vendorsRes.data.vendors)
      setTopVendors(topRes.data)
    } catch (error) {
      console.error('Error loading vendors:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredVendors = vendors.filter(v =>
    v.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    v.description.toLowerCase().includes(searchTerm.toLowerCase())
  )

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
        <span>Cargando vendors...</span>
      </div>
    )
  }

  return (
    <div className="vendors-page">
      <div className="page-header">
        <div className="header-content">
          <h1>Vendors</h1>
          <p>Descubre los mejores desarrolladores del marketplace</p>
        </div>
        <div className="header-actions">
          <button className="btn-primary">
            <i className="fas fa-user-plus"></i>
            Convertirse en Vendor
          </button>
        </div>
      </div>

      {/* Top Vendors */}
      <section className="top-vendors-section">
        <h2>Top Vendors</h2>
        <div className="top-vendors-grid">
          {topVendors.map((vendor, index) => (
            <Link
              key={vendor.id}
              to={`/vendors/${vendor.slug}`}
              className="top-vendor-card"
            >
              <div className="rank">#{index + 1}</div>
              <div className="vendor-avatar">
                <i className="fas fa-store"></i>
              </div>
              <h3>{vendor.name}</h3>
              <div className="vendor-stats">
                <span><i className="fas fa-star"></i> {vendor.rating}</span>
                <span><i className="fas fa-box"></i> {vendor.productCount}</span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Search */}
      <div className="vendors-search">
        <i className="fas fa-search"></i>
        <input
          type="text"
          placeholder="Buscar vendors..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* All Vendors */}
      <section className="all-vendors-section">
        <h2>Todos los Vendors ({filteredVendors.length})</h2>
        <div className="vendors-grid">
          {filteredVendors.map(vendor => (
            <Link
              key={vendor.id}
              to={`/vendors/${vendor.slug}`}
              className="vendor-card"
            >
              <div className="vendor-header">
                <div className="vendor-avatar">
                  {vendor.logo ? (
                    <img src={vendor.logo} alt={vendor.name} />
                  ) : (
                    <i className="fas fa-store"></i>
                  )}
                </div>
                <div className="vendor-info">
                  <h3>{vendor.name}</h3>
                  <div className="vendor-badges">
                    {vendor.badges?.slice(0, 2).map(badge => (
                      <span key={badge} className="badge" title={getBadgeLabel(badge)}>
                        <i className={`fas ${getBadgeIcon(badge)}`}></i>
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <p className="vendor-description">{vendor.description}</p>

              <div className="vendor-stats">
                <div className="stat">
                  <i className="fas fa-star"></i>
                  <span>{vendor.rating}</span>
                  <span className="stat-label">Rating</span>
                </div>
                <div className="stat">
                  <i className="fas fa-box"></i>
                  <span>{vendor.productCount}</span>
                  <span className="stat-label">Productos</span>
                </div>
                <div className="stat">
                  <i className="fas fa-download"></i>
                  <span>{vendor.totalSales.toLocaleString()}</span>
                  <span className="stat-label">Ventas</span>
                </div>
              </div>

              <div className="vendor-footer">
                <span className="joined">
                  <i className="fas fa-calendar"></i>
                  Desde {new Date(vendor.joinedAt).toLocaleDateString('es-ES', { month: 'short', year: 'numeric' })}
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  )
}

export default VendorsPage
