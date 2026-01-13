import { useState } from 'react'
import { Outlet, Link, useNavigate } from 'react-router-dom'
import { useCartStore } from '../stores/cartStore'

function MarketplaceLayout() {
  const [searchQuery, setSearchQuery] = useState('')
  const navigate = useNavigate()
  const { items } = useCartStore()

  const handleSearch = (e) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`)
    }
  }

  const categories = [
    { slug: 'ventas-crm', name: 'Ventas & CRM', icon: 'fa-handshake' },
    { slug: 'finanzas', name: 'Finanzas', icon: 'fa-chart-pie' },
    { slug: 'soporte-cliente', name: 'Soporte', icon: 'fa-headset' },
    { slug: 'analytics-bi', name: 'Analytics', icon: 'fa-chart-line' },
    { slug: 'productividad', name: 'Productividad', icon: 'fa-rocket' }
  ]

  return (
    <div className="marketplace-layout">
      {/* Header */}
      <header className="marketplace-header">
        <div className="header-container">
          <div className="header-left">
            <Link to="/" className="logo">
              <i className="fas fa-store"></i>
              <span>Alqvimia Marketplace</span>
            </Link>
          </div>

          <form className="header-search" onSubmit={handleSearch}>
            <i className="fas fa-search"></i>
            <input
              type="text"
              placeholder="Buscar agentes, workflows, extensiones..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button type="submit">Buscar</button>
          </form>

          <div className="header-right">
            <Link to="/vendors" className="header-link">
              <i className="fas fa-store-alt"></i>
              <span>Vendors</span>
            </Link>
            <Link to="/cart" className="cart-link">
              <i className="fas fa-shopping-cart"></i>
              {items.length > 0 && (
                <span className="cart-badge">{items.length}</span>
              )}
            </Link>
            <button className="login-btn">
              <i className="fas fa-user"></i>
              <span>Iniciar Sesión</span>
            </button>
          </div>
        </div>

        {/* Categories Nav */}
        <nav className="categories-nav">
          <div className="nav-container">
            <Link to="/products" className="nav-link all">
              <i className="fas fa-th-large"></i>
              Todos
            </Link>
            {categories.map(cat => (
              <Link
                key={cat.slug}
                to={`/category/${cat.slug}`}
                className="nav-link"
              >
                <i className={`fas ${cat.icon}`}></i>
                {cat.name}
              </Link>
            ))}
          </div>
        </nav>
      </header>

      {/* Main Content */}
      <main className="marketplace-main">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="marketplace-footer">
        <div className="footer-container">
          <div className="footer-section">
            <h4>Marketplace</h4>
            <ul>
              <li><Link to="/products">Explorar</Link></li>
              <li><Link to="/vendors">Vendors</Link></li>
              <li><a href="#">Categorías</a></li>
              <li><a href="#">Destacados</a></li>
            </ul>
          </div>
          <div className="footer-section">
            <h4>Vendors</h4>
            <ul>
              <li><a href="#">Convertirse en Vendor</a></li>
              <li><a href="#">Guía de Publicación</a></li>
              <li><a href="#">Centro de Vendedores</a></li>
              <li><a href="#">Políticas</a></li>
            </ul>
          </div>
          <div className="footer-section">
            <h4>Soporte</h4>
            <ul>
              <li><a href="#">Centro de Ayuda</a></li>
              <li><a href="#">Documentación</a></li>
              <li><a href="#">Contacto</a></li>
              <li><a href="#">FAQ</a></li>
            </ul>
          </div>
          <div className="footer-section">
            <h4>Legal</h4>
            <ul>
              <li><a href="#">Términos de Uso</a></li>
              <li><a href="#">Privacidad</a></li>
              <li><a href="#">Licencias</a></li>
              <li><a href="#">Reembolsos</a></li>
            </ul>
          </div>
        </div>
        <div className="footer-bottom">
          <p>&copy; 2024 Alqvimia. Todos los derechos reservados.</p>
        </div>
      </footer>
    </div>
  )
}

export default MarketplaceLayout
