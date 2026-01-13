import { Link } from 'react-router-dom'
import { useCartStore } from '../stores/cartStore'
import toast from 'react-hot-toast'

function ProductCard({ product }) {
  const { addItem, isInCart } = useCartStore()

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

  const handleAddToCart = (e) => {
    e.preventDefault()
    e.stopPropagation()

    if (isInCart(product.id)) {
      toast('Ya está en el carrito')
      return
    }
    addItem(product)
    toast.success('Agregado al carrito')
  }

  return (
    <Link to={`/products/${product.slug || product.id}`} className="product-card">
      {product.featured && (
        <div className="featured-badge">
          <i className="fas fa-star"></i>
          Destacado
        </div>
      )}

      <div className="product-image">
        {product.images?.[0] ? (
          <img src={product.images[0]} alt={product.name} />
        ) : (
          <div className="placeholder-image">
            <i className={`fas ${getTypeIcon(product.type)}`}></i>
          </div>
        )}
        <span className="product-type-badge">{product.type}</span>
      </div>

      <div className="product-content">
        <h3 className="product-name">{product.name}</h3>
        <p className="product-description">{product.shortDescription}</p>

        <div className="product-vendor">
          <i className="fas fa-store"></i>
          <span>{product.vendorName}</span>
        </div>

        <div className="product-meta">
          <div className="product-rating">
            <i className="fas fa-star"></i>
            <span>{product.rating}</span>
            <span className="review-count">({product.reviewCount})</span>
          </div>
          <div className="product-downloads">
            <i className="fas fa-download"></i>
            <span>{product.downloadCount.toLocaleString()}</span>
          </div>
        </div>
      </div>

      <div className="product-footer">
        <span className="product-price">
          {formatPrice(product.price, product.pricingModel)}
        </span>
        <button
          className={`add-to-cart-btn ${isInCart(product.id) ? 'in-cart' : ''}`}
          onClick={handleAddToCart}
        >
          {isInCart(product.id) ? (
            <i className="fas fa-check"></i>
          ) : (
            <i className="fas fa-cart-plus"></i>
          )}
        </button>
      </div>
    </Link>
  )
}

export default ProductCard
