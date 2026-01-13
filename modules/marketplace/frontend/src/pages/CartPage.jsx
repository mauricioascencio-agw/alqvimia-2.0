import { Link } from 'react-router-dom'
import { useCartStore } from '../stores/cartStore'
import toast from 'react-hot-toast'

function CartPage() {
  const { items, total, removeItem, clearCart } = useCartStore()

  const handleRemove = (productId) => {
    removeItem(productId)
    toast.success('Producto removido del carrito')
  }

  const handleCheckout = () => {
    toast('Checkout no implementado en demo')
  }

  if (items.length === 0) {
    return (
      <div className="cart-page empty">
        <div className="empty-cart">
          <i className="fas fa-shopping-cart"></i>
          <h2>Tu carrito está vacío</h2>
          <p>Explora el marketplace y agrega productos</p>
          <Link to="/products" className="btn-primary">
            Explorar Productos
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="cart-page">
      <div className="page-header">
        <h1>Carrito de Compras</h1>
        <p>{items.length} {items.length === 1 ? 'producto' : 'productos'}</p>
      </div>

      <div className="cart-layout">
        <div className="cart-items">
          {items.map(item => (
            <div key={item.id} className="cart-item">
              <div className="item-info">
                <div className="item-icon">
                  <i className={`fas ${item.type === 'agent' ? 'fa-robot' : item.type === 'workflow' ? 'fa-project-diagram' : 'fa-puzzle-piece'}`}></i>
                </div>
                <div className="item-details">
                  <Link to={`/products/${item.id}`} className="item-name">
                    {item.name}
                  </Link>
                  <span className="item-vendor">{item.vendorName}</span>
                  <span className="item-type">{item.type}</span>
                </div>
              </div>

              <div className="item-price">
                {item.price === 0 ? 'Gratis' : `$${item.price.toFixed(2)}`}
                {item.pricingModel === 'monthly' && <span className="period">/mes</span>}
              </div>

              <button
                className="remove-btn"
                onClick={() => handleRemove(item.id)}
              >
                <i className="fas fa-trash"></i>
              </button>
            </div>
          ))}
        </div>

        <div className="cart-summary">
          <h3>Resumen de Compra</h3>

          <div className="summary-rows">
            <div className="summary-row">
              <span>Subtotal</span>
              <span>${total.toFixed(2)}</span>
            </div>
            <div className="summary-row">
              <span>IVA (16%)</span>
              <span>${(total * 0.16).toFixed(2)}</span>
            </div>
            <div className="summary-row total">
              <span>Total</span>
              <span>${(total * 1.16).toFixed(2)}</span>
            </div>
          </div>

          <button className="btn-checkout" onClick={handleCheckout}>
            <i className="fas fa-lock"></i>
            Proceder al Pago
          </button>

          <button className="btn-clear" onClick={() => {
            clearCart()
            toast.success('Carrito vaciado')
          }}>
            Vaciar carrito
          </button>

          <div className="payment-methods">
            <span>Métodos de pago aceptados:</span>
            <div className="methods">
              <i className="fab fa-cc-visa"></i>
              <i className="fab fa-cc-mastercard"></i>
              <i className="fab fa-cc-paypal"></i>
              <i className="fab fa-cc-stripe"></i>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CartPage
