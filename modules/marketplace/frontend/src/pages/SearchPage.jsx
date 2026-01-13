import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import api from '../services/api'
import ProductCard from '../components/ProductCard'

function SearchPage() {
  const [searchParams] = useSearchParams()
  const query = searchParams.get('q') || ''

  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(true)
  const [facets, setFacets] = useState(null)

  useEffect(() => {
    if (query) {
      performSearch()
    }
  }, [query])

  const performSearch = async () => {
    try {
      setLoading(true)
      const response = await api.get('/search', {
        params: { q: query }
      })
      setResults(response.data.results)
      setFacets(response.data.facets)
    } catch (error) {
      console.error('Error searching:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="search-page">
      <div className="search-header">
        <h1>Resultados de búsqueda</h1>
        <p>
          {loading ? (
            'Buscando...'
          ) : (
            <>
              {results.length} resultados para "<strong>{query}</strong>"
            </>
          )}
        </p>
      </div>

      {loading ? (
        <div className="search-loading">
          <i className="fas fa-spinner fa-spin"></i>
          <span>Buscando productos...</span>
        </div>
      ) : results.length === 0 ? (
        <div className="no-results">
          <i className="fas fa-search"></i>
          <h3>No se encontraron resultados</h3>
          <p>Intenta con otros términos de búsqueda</p>
        </div>
      ) : (
        <div className="search-content">
          {/* Facets */}
          {facets && (
            <aside className="search-facets">
              <div className="facet-group">
                <h4>Tipos</h4>
                <div className="facet-options">
                  {facets.types.map(type => (
                    <label key={type} className="facet-option">
                      <input type="checkbox" />
                      <span>{type}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="facet-group">
                <h4>Categorías</h4>
                <div className="facet-options">
                  {facets.categories.map(cat => (
                    <label key={cat} className="facet-option">
                      <input type="checkbox" />
                      <span>{cat}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="facet-group">
                <h4>Precio</h4>
                <div className="facet-options">
                  {facets.priceRanges.map((range, i) => (
                    <label key={i} className="facet-option">
                      <input type="checkbox" />
                      <span>
                        {range.max === 0 ? 'Gratis' :
                         range.max === null ? `$${range.min}+` :
                         `$${range.min} - $${range.max}`}
                      </span>
                      <span className="count">({range.count})</span>
                    </label>
                  ))}
                </div>
              </div>
            </aside>
          )}

          {/* Results Grid */}
          <div className="search-results">
            <div className="products-grid">
              {results.map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default SearchPage
