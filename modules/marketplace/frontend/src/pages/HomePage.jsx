import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import api from '../services/api'
import ProductCard from '../components/ProductCard'

function HomePage() {
  const [featured, setFeatured] = useState([])
  const [popular, setPopular] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [featuredRes, popularRes, categoriesRes] = await Promise.all([
        api.get('/products/featured'),
        api.get('/products/popular'),
        api.get('/categories/featured')
      ])
      setFeatured(featuredRes.data)
      setPopular(popularRes.data)
      setCategories(categoriesRes.data)
    } catch (error) {
      console.error('Error loading homepage:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="page-loading">
        <i className="fas fa-spinner fa-spin"></i>
        <span>Cargando marketplace...</span>
      </div>
    )
  }

  return (
    <div className="home-page">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
          <h1>Automatiza tu negocio con IA</h1>
          <p>Descubre agentes, workflows y extensiones para potenciar Alqvimia RPA</p>
          <div className="hero-actions">
            <Link to="/products" className="btn-primary">
              Explorar Marketplace
            </Link>
            <Link to="/vendors" className="btn-secondary">
              Convertirse en Vendor
            </Link>
          </div>
        </div>
        <div className="hero-stats">
          <div className="stat">
            <span className="stat-value">500+</span>
            <span className="stat-label">Productos</span>
          </div>
          <div className="stat">
            <span className="stat-value">150+</span>
            <span className="stat-label">Vendors</span>
          </div>
          <div className="stat">
            <span className="stat-value">50K+</span>
            <span className="stat-label">Descargas</span>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="categories-section">
        <div className="section-header">
          <h2>Categorías Populares</h2>
          <Link to="/products" className="view-all">Ver todas</Link>
        </div>
        <div className="categories-grid">
          {categories.map(category => (
            <Link
              key={category.id}
              to={`/category/${category.slug}`}
              className="category-card"
              style={{ '--accent-color': category.color }}
            >
              <div className="category-icon">
                <i className={`fas ${category.icon}`}></i>
              </div>
              <h3>{category.name}</h3>
              <span className="product-count">{category.productCount} productos</span>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured Products */}
      <section className="products-section">
        <div className="section-header">
          <h2>Productos Destacados</h2>
          <Link to="/products?featured=true" className="view-all">Ver todos</Link>
        </div>
        <div className="products-grid">
          {featured.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      {/* Popular Products */}
      <section className="products-section">
        <div className="section-header">
          <h2>Más Populares</h2>
          <Link to="/products?sort=downloads" className="view-all">Ver todos</Link>
        </div>
        <div className="products-grid">
          {popular.slice(0, 4).map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="cta-content">
          <h2>¿Tienes un producto para compartir?</h2>
          <p>Únete a nuestra comunidad de vendors y comparte tus creaciones con miles de usuarios</p>
          <Link to="/vendors" className="btn-primary">
            Empezar a vender
          </Link>
        </div>
      </section>
    </div>
  )
}

export default HomePage
