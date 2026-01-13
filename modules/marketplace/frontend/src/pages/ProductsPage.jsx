import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import api from '../services/api'
import ProductCard from '../components/ProductCard'

function ProductsPage() {
  const [searchParams, setSearchParams] = useSearchParams()

  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [productTypes, setProductTypes] = useState([])
  const [loading, setLoading] = useState(true)
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 })

  const [filters, setFilters] = useState({
    type: searchParams.get('type') || '',
    category: searchParams.get('category') || '',
    sort: searchParams.get('sort') || '',
    minPrice: searchParams.get('minPrice') || '',
    maxPrice: searchParams.get('maxPrice') || ''
  })

  useEffect(() => {
    fetchCategories()
  }, [])

  useEffect(() => {
    fetchProducts()
  }, [filters])

  const fetchCategories = async () => {
    try {
      const response = await api.get('/categories')
      setCategories(response.data.categories)
      setProductTypes(response.data.productTypes)
    } catch (error) {
      console.error('Error loading categories:', error)
    }
  }

  const fetchProducts = async () => {
    try {
      setLoading(true)
      const params = {
        ...filters,
        page: 1,
        limit: 12
      }

      // Remove empty params
      Object.keys(params).forEach(key => {
        if (!params[key]) delete params[key]
      })

      const response = await api.get('/products', { params })
      setProducts(response.data.products)
      setPagination(response.data.pagination)
    } catch (error) {
      console.error('Error loading products:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleFilterChange = (key, value) => {
    const newFilters = { ...filters, [key]: value }
    setFilters(newFilters)

    // Update URL params
    const params = new URLSearchParams()
    Object.entries(newFilters).forEach(([k, v]) => {
      if (v) params.set(k, v)
    })
    setSearchParams(params)
  }

  const clearFilters = () => {
    setFilters({
      type: '',
      category: '',
      sort: '',
      minPrice: '',
      maxPrice: ''
    })
    setSearchParams({})
  }

  return (
    <div className="products-page">
      <div className="page-header">
        <h1>Explorar Productos</h1>
        <p>Descubre agentes, workflows y extensiones para tu automatización</p>
      </div>

      <div className="products-layout">
        {/* Filters Sidebar */}
        <aside className="filters-sidebar">
          <div className="filters-header">
            <h3>Filtros</h3>
            <button className="clear-filters" onClick={clearFilters}>
              Limpiar
            </button>
          </div>

          <div className="filter-group">
            <h4>Tipo de Producto</h4>
            <div className="filter-options">
              {productTypes.map(type => (
                <label key={type.id} className="filter-option">
                  <input
                    type="radio"
                    name="type"
                    checked={filters.type === type.id}
                    onChange={() => handleFilterChange('type', type.id)}
                  />
                  <span className="option-icon" style={{ color: type.color }}>
                    <i className={`fas ${type.icon}`}></i>
                  </span>
                  <span>{type.name}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="filter-group">
            <h4>Categoría</h4>
            <div className="filter-options scrollable">
              {categories.map(cat => (
                <label key={cat.id} className="filter-option">
                  <input
                    type="radio"
                    name="category"
                    checked={filters.category === cat.id}
                    onChange={() => handleFilterChange('category', cat.id)}
                  />
                  <span>{cat.name}</span>
                  <span className="count">({cat.productCount})</span>
                </label>
              ))}
            </div>
          </div>

          <div className="filter-group">
            <h4>Precio</h4>
            <div className="price-inputs">
              <input
                type="number"
                placeholder="Min"
                value={filters.minPrice}
                onChange={(e) => handleFilterChange('minPrice', e.target.value)}
              />
              <span>-</span>
              <input
                type="number"
                placeholder="Max"
                value={filters.maxPrice}
                onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
              />
            </div>
            <div className="price-presets">
              <button onClick={() => {
                handleFilterChange('minPrice', '0')
                handleFilterChange('maxPrice', '0')
              }}>Gratis</button>
              <button onClick={() => {
                handleFilterChange('minPrice', '1')
                handleFilterChange('maxPrice', '50')
              }}>$1-$50</button>
              <button onClick={() => {
                handleFilterChange('minPrice', '50')
                handleFilterChange('maxPrice', '')
              }}>$50+</button>
            </div>
          </div>
        </aside>

        {/* Products Grid */}
        <div className="products-content">
          <div className="content-header">
            <span className="results-count">
              {pagination.total} productos encontrados
            </span>
            <select
              value={filters.sort}
              onChange={(e) => handleFilterChange('sort', e.target.value)}
              className="sort-select"
            >
              <option value="">Ordenar por</option>
              <option value="rating">Mejor valorados</option>
              <option value="downloads">Más populares</option>
              <option value="newest">Más recientes</option>
              <option value="price_asc">Precio: menor a mayor</option>
              <option value="price_desc">Precio: mayor a menor</option>
            </select>
          </div>

          {loading ? (
            <div className="products-loading">
              <i className="fas fa-spinner fa-spin"></i>
              <span>Cargando productos...</span>
            </div>
          ) : products.length === 0 ? (
            <div className="no-products">
              <i className="fas fa-box-open"></i>
              <h3>No se encontraron productos</h3>
              <p>Intenta ajustar los filtros</p>
            </div>
          ) : (
            <div className="products-grid">
              {products.map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}

          {/* Pagination */}
          {pagination.pages > 1 && (
            <div className="pagination">
              {Array.from({ length: pagination.pages }, (_, i) => (
                <button
                  key={i + 1}
                  className={`page-btn ${pagination.page === i + 1 ? 'active' : ''}`}
                  onClick={() => {/* Handle page change */}}
                >
                  {i + 1}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default ProductsPage
