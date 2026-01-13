import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import api from '../services/api'
import { useCartStore } from '../stores/cartStore'
import toast from 'react-hot-toast'
import ProductCard from '../components/ProductCard'

function ProductDetailPage() {
  const { id } = useParams()
  const { addItem, isInCart } = useCartStore()

  const [product, setProduct] = useState(null)
  const [reviews, setReviews] = useState([])
  const [reviewStats, setReviewStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('overview')

  useEffect(() => {
    fetchProduct()
  }, [id])

  const fetchProduct = async () => {
    try {
      setLoading(true)
      const [productRes, reviewsRes] = await Promise.all([
        api.get(`/products/${id}`),
        api.get(`/reviews/product/${id}`)
      ])
      setProduct(productRes.data)
      setReviews(reviewsRes.data.reviews)
      setReviewStats(reviewsRes.data.stats)
    } catch (error) {
      toast.error('Error cargando producto')
    } finally {
      setLoading(false)
    }
  }

  const handleAddToCart = () => {
    if (isInCart(product.id)) {
      toast('Ya está en el carrito')
      return
    }
    addItem(product)
    toast.success('Agregado al carrito')
  }

  const getTypeIcon = (type) => {
    const icons = {
      agent: 'fa-robot',
      workflow: 'fa-project-diagram',
      extension: 'fa-puzzle-piece',
      template: 'fa-file-alt',
      connector: 'fa-plug'
    }
    return icons[type] || 'fa-box'
  }

  const formatPrice = (price, model) => {
    if (price === 0) return 'Gratis'
    const suffix = model === 'monthly' ? '/mes' : ''
    return `$${price.toFixed(2)}${suffix}`
  }

  if (loading) {
    return (
      <div className="page-loading">
        <i className="fas fa-spinner fa-spin"></i>
        <span>Cargando producto...</span>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="not-found">
        <h2>Producto no encontrado</h2>
        <Link to="/products">Volver al marketplace</Link>
      </div>
    )
  }

  return (
    <div className="product-detail-page">
      {/* Breadcrumb */}
      <div className="breadcrumb">
        <Link to="/">Inicio</Link>
        <i className="fas fa-chevron-right"></i>
        <Link to="/products">Productos</Link>
        <i className="fas fa-chevron-right"></i>
        <span>{product.name}</span>
      </div>

      {/* Product Header */}
      <div className="product-header">
        <div className="product-main-info">
          <div className="product-icon">
            <i className={`fas ${getTypeIcon(product.type)}`}></i>
          </div>
          <div className="product-title">
            <span className="product-type">{product.type}</span>
            <h1>{product.name}</h1>
            <p className="vendor-info">
              por <Link to={`/vendors/${product.vendorId}`}>{product.vendorName}</Link>
            </p>
          </div>
        </div>

        <div className="product-meta">
          <div className="rating">
            <i className="fas fa-star"></i>
            <span className="rating-value">{product.rating}</span>
            <span className="review-count">({product.reviewCount} reviews)</span>
          </div>
          <div className="downloads">
            <i className="fas fa-download"></i>
            <span>{product.downloadCount.toLocaleString()} descargas</span>
          </div>
          <span className="version">v{product.version}</span>
        </div>
      </div>

      {/* Main Content */}
      <div className="product-content">
        <div className="content-left">
          {/* Product Images */}
          <div className="product-gallery">
            <img
              src={product.images?.[0] || '/assets/placeholder.png'}
              alt={product.name}
              className="main-image"
            />
          </div>

          {/* Tabs */}
          <div className="product-tabs">
            <button
              className={`tab ${activeTab === 'overview' ? 'active' : ''}`}
              onClick={() => setActiveTab('overview')}
            >
              Descripción
            </button>
            <button
              className={`tab ${activeTab === 'features' ? 'active' : ''}`}
              onClick={() => setActiveTab('features')}
            >
              Características
            </button>
            <button
              className={`tab ${activeTab === 'reviews' ? 'active' : ''}`}
              onClick={() => setActiveTab('reviews')}
            >
              Reviews ({product.reviewCount})
            </button>
          </div>

          {/* Tab Content */}
          <div className="tab-content">
            {activeTab === 'overview' && (
              <div className="overview-content">
                <p>{product.description}</p>

                <h3>Requisitos</h3>
                <ul className="requirements-list">
                  <li>
                    <i className="fas fa-check"></i>
                    Alqvimia v{product.requirements?.minVersion} o superior
                  </li>
                  {product.requirements?.mcpServers?.map((mcp, i) => (
                    <li key={i}>
                      <i className="fas fa-plug"></i>
                      MCP Server: {mcp}
                    </li>
                  ))}
                </ul>

                <h3>Compatibilidad</h3>
                <div className="compatibility-tags">
                  {product.compatibility?.map((c, i) => (
                    <span key={i} className="compat-tag">{c}</span>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'features' && (
              <div className="features-content">
                <ul className="features-list">
                  {product.features?.map((feature, i) => (
                    <li key={i}>
                      <i className="fas fa-check-circle"></i>
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {activeTab === 'reviews' && (
              <div className="reviews-content">
                {/* Rating Summary */}
                {reviewStats && (
                  <div className="rating-summary">
                    <div className="rating-overall">
                      <span className="big-rating">{reviewStats.averageRating}</span>
                      <div className="stars">
                        {[1, 2, 3, 4, 5].map(star => (
                          <i
                            key={star}
                            className={`fas fa-star ${star <= Math.round(reviewStats.averageRating) ? 'filled' : ''}`}
                          ></i>
                        ))}
                      </div>
                      <span>{reviewStats.totalReviews} reviews</span>
                    </div>
                    <div className="rating-bars">
                      {[5, 4, 3, 2, 1].map(stars => (
                        <div key={stars} className="rating-bar">
                          <span>{stars} estrellas</span>
                          <div className="bar">
                            <div
                              className="bar-fill"
                              style={{
                                width: `${(reviewStats.distribution[stars] / reviewStats.totalReviews) * 100}%`
                              }}
                            ></div>
                          </div>
                          <span>{reviewStats.distribution[stars]}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Reviews List */}
                <div className="reviews-list">
                  {reviews.map(review => (
                    <div key={review.id} className="review-card">
                      <div className="review-header">
                        <div className="reviewer">
                          <span className="reviewer-name">{review.userName}</span>
                          {review.verified && (
                            <span className="verified">
                              <i className="fas fa-check-circle"></i>
                              Compra verificada
                            </span>
                          )}
                        </div>
                        <div className="review-rating">
                          {[1, 2, 3, 4, 5].map(star => (
                            <i
                              key={star}
                              className={`fas fa-star ${star <= review.rating ? 'filled' : ''}`}
                            ></i>
                          ))}
                        </div>
                      </div>
                      <h4 className="review-title">{review.title}</h4>
                      <p className="review-content">{review.content}</p>
                      <div className="review-footer">
                        <span className="review-date">
                          {new Date(review.createdAt).toLocaleDateString()}
                        </span>
                        <button className="helpful-btn">
                          <i className="fas fa-thumbs-up"></i>
                          Útil ({review.helpful})
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <aside className="content-right">
          <div className="purchase-card">
            <div className="price-display">
              <span className="price">{formatPrice(product.price, product.pricingModel)}</span>
              {product.pricingModel === 'monthly' && (
                <span className="billing">Facturación mensual</span>
              )}
            </div>

            <button
              className="btn-add-cart"
              onClick={handleAddToCart}
              disabled={isInCart(product.id)}
            >
              {isInCart(product.id) ? (
                <>
                  <i className="fas fa-check"></i>
                  En el carrito
                </>
              ) : (
                <>
                  <i className="fas fa-cart-plus"></i>
                  Agregar al carrito
                </>
              )}
            </button>

            <div className="product-info-list">
              <div className="info-item">
                <i className="fas fa-tag"></i>
                <span>Tipo</span>
                <span>{product.type}</span>
              </div>
              <div className="info-item">
                <i className="fas fa-code-branch"></i>
                <span>Versión</span>
                <span>v{product.version}</span>
              </div>
              <div className="info-item">
                <i className="fas fa-calendar"></i>
                <span>Actualizado</span>
                <span>{new Date(product.updatedAt).toLocaleDateString()}</span>
              </div>
            </div>
          </div>

          {/* Vendor Card */}
          <div className="vendor-card">
            <h4>Desarrollado por</h4>
            <Link to={`/vendors/${product.vendorId}`} className="vendor-link">
              <div className="vendor-avatar">
                <i className="fas fa-store"></i>
              </div>
              <div className="vendor-info">
                <span className="vendor-name">{product.vendorName}</span>
                <span className="vendor-badge">Vendor verificado</span>
              </div>
            </Link>
          </div>

          {/* Tags */}
          <div className="tags-card">
            <h4>Etiquetas</h4>
            <div className="tags-list">
              {product.tags?.map((tag, i) => (
                <Link key={i} to={`/search?q=${tag}`} className="tag">
                  {tag}
                </Link>
              ))}
            </div>
          </div>
        </aside>
      </div>

      {/* Related Products */}
      {product.related?.length > 0 && (
        <section className="related-products">
          <h2>Productos Relacionados</h2>
          <div className="products-grid">
            {product.related.map(p => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  )
}

export default ProductDetailPage
