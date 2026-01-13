import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import api from '../services/api'
import ProductCard from '../components/ProductCard'

function CategoryPage() {
  const { slug } = useParams()

  const [category, setCategory] = useState(null)
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchCategory()
    fetchProducts()
  }, [slug])

  const fetchCategory = async () => {
    try {
      const response = await api.get(`/categories/${slug}`)
      setCategory(response.data)
    } catch (error) {
      console.error('Error loading category:', error)
    }
  }

  const fetchProducts = async () => {
    try {
      setLoading(true)
      const response = await api.get('/products', {
        params: { category: `cat_${slug.replace(/-/g, '_')}` }
      })
      setProducts(response.data.products)
    } catch (error) {
      console.error('Error loading products:', error)
    } finally {
      setLoading(false)
    }
  }

  if (!category) {
    return (
      <div className="page-loading">
        <i className="fas fa-spinner fa-spin"></i>
        <span>Cargando...</span>
      </div>
    )
  }

  return (
    <div className="category-page">
      <div className="breadcrumb">
        <Link to="/">Inicio</Link>
        <i className="fas fa-chevron-right"></i>
        <Link to="/products">Productos</Link>
        <i className="fas fa-chevron-right"></i>
        <span>{category.name}</span>
      </div>

      <div className="category-header" style={{ '--accent-color': category.color }}>
        <div className="category-icon">
          <i className={`fas ${category.icon}`}></i>
        </div>
        <div className="category-info">
          <h1>{category.name}</h1>
          <p>{category.description}</p>
          <span className="product-count">{category.productCount} productos</span>
        </div>
      </div>

      {loading ? (
        <div className="products-loading">
          <i className="fas fa-spinner fa-spin"></i>
          <span>Cargando productos...</span>
        </div>
      ) : products.length === 0 ? (
        <div className="no-products">
          <i className="fas fa-box-open"></i>
          <h3>No hay productos en esta categoría</h3>
          <Link to="/products" className="btn-secondary">Ver todos los productos</Link>
        </div>
      ) : (
        <div className="products-grid">
          {products.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  )
}

export default CategoryPage
