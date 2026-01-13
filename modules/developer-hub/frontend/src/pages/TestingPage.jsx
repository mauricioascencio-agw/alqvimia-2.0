import { useState, useEffect } from 'react'
import { useEnvironmentStore } from '../stores/environmentStore'
import api from '../services/api'
import toast from 'react-hot-toast'

function TestingPage() {
  const { currentEnvironment } = useEnvironmentStore()

  const [suites, setSuites] = useState([])
  const [runs, setRuns] = useState([])
  const [coverage, setCoverage] = useState(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('suites')
  const [runningTests, setRunningTests] = useState(new Set())

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      const [suitesRes, runsRes, coverageRes] = await Promise.all([
        api.get('/testing/suites'),
        api.get('/testing/runs'),
        api.get('/testing/coverage')
      ])
      setSuites(suitesRes.data.suites || [])
      setRuns(runsRes.data.runs || [])
      setCoverage(coverageRes.data)
    } catch (error) {
      toast.error('Error cargando datos de testing')
    } finally {
      setLoading(false)
    }
  }

  const handleRunSuite = async (suiteId) => {
    try {
      setRunningTests(prev => new Set([...prev, suiteId]))
      const response = await api.post(`/testing/suites/${suiteId}/run`, {
        environment: currentEnvironment?.id
      })
      toast.success(`Tests iniciados: ${response.data.runId}`)

      // Poll for results
      const pollInterval = setInterval(async () => {
        try {
          const runResult = await api.get(`/testing/runs/${response.data.runId}`)
          if (runResult.data.status !== 'running') {
            clearInterval(pollInterval)
            setRunningTests(prev => {
              const next = new Set(prev)
              next.delete(suiteId)
              return next
            })
            fetchData()

            if (runResult.data.status === 'passed') {
              toast.success('Todos los tests pasaron!')
            } else {
              toast.error(`${runResult.data.summary.failed} tests fallaron`)
            }
          }
        } catch (e) {
          clearInterval(pollInterval)
        }
      }, 2000)
    } catch (error) {
      setRunningTests(prev => {
        const next = new Set(prev)
        next.delete(suiteId)
        return next
      })
      toast.error('Error ejecutando tests')
    }
  }

  const formatDate = (date) => {
    return new Date(date).toLocaleString('es-ES')
  }

  const formatDuration = (ms) => {
    if (ms < 1000) return `${ms}ms`
    return `${(ms / 1000).toFixed(1)}s`
  }

  if (loading) {
    return (
      <div className="page-loading">
        <i className="fas fa-spinner fa-spin"></i>
        <span>Cargando...</span>
      </div>
    )
  }

  return (
    <div className="testing-page">
      <div className="page-header">
        <div className="header-content">
          <h1><i className="fas fa-vial"></i> Testing</h1>
          <p>Gestiona y ejecuta pruebas automatizadas</p>
        </div>
        <div className="header-actions">
          <button className="btn-secondary" onClick={fetchData}>
            <i className="fas fa-sync"></i>
            Actualizar
          </button>
          <button className="btn-primary">
            <i className="fas fa-plus"></i>
            Nuevo Test Suite
          </button>
        </div>
      </div>

      {/* Coverage Summary */}
      {coverage && (
        <div className="coverage-summary">
          <div className="coverage-card main">
            <div className="coverage-circle" style={{
              background: `conic-gradient(#22c55e ${coverage.overall}%, #334155 0)`
            }}>
              <span>{coverage.overall}%</span>
            </div>
            <div className="coverage-info">
              <h4>Cobertura General</h4>
              <p>Workflows: {coverage.byType?.workflows}% | Agentes: {coverage.byType?.agents}%</p>
            </div>
          </div>

          {coverage.uncovered?.length > 0 && (
            <div className="uncovered-list">
              <h5>Sin Cobertura ({coverage.uncovered.length})</h5>
              <div className="uncovered-items">
                {coverage.uncovered.slice(0, 3).map(item => (
                  <span key={item.id} className="uncovered-item">
                    <i className={`fas ${item.type === 'workflow' ? 'fa-project-diagram' : 'fa-robot'}`}></i>
                    {item.name}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tabs */}
      <div className="page-tabs">
        <button
          className={`tab ${activeTab === 'suites' ? 'active' : ''}`}
          onClick={() => setActiveTab('suites')}
        >
          <i className="fas fa-folder"></i>
          Test Suites ({suites.length})
        </button>
        <button
          className={`tab ${activeTab === 'runs' ? 'active' : ''}`}
          onClick={() => setActiveTab('runs')}
        >
          <i className="fas fa-history"></i>
          Ejecuciones
        </button>
      </div>

      {/* Tab Content */}
      <div className="tab-content">
        {activeTab === 'suites' && (
          <div className="test-suites">
            {suites.length === 0 ? (
              <div className="empty-state">
                <i className="fas fa-vial"></i>
                <h3>No hay test suites</h3>
                <p>Crea tu primer test suite para comenzar</p>
              </div>
            ) : (
              <div className="suites-grid">
                {suites.map(suite => (
                  <div key={suite.id} className="suite-card">
                    <div className="suite-header">
                      <h4>{suite.name}</h4>
                      {suite.lastRun && (
                        <span className={`run-status ${suite.lastRun.status}`}>
                          {suite.lastRun.status}
                        </span>
                      )}
                    </div>

                    <p className="suite-description">{suite.description}</p>

                    <div className="suite-tests">
                      <span className="test-count">
                        <i className="fas fa-check-circle"></i>
                        {suite.tests?.filter(t => t.status === 'active').length || 0} tests activos
                      </span>
                      {suite.tests?.filter(t => t.status === 'disabled').length > 0 && (
                        <span className="test-disabled">
                          ({suite.tests.filter(t => t.status === 'disabled').length} deshabilitados)
                        </span>
                      )}
                    </div>

                    {suite.lastRun && (
                      <div className="last-run">
                        <div className="run-results">
                          <span className="passed">
                            <i className="fas fa-check"></i> {suite.lastRun.passed}
                          </span>
                          <span className="failed">
                            <i className="fas fa-times"></i> {suite.lastRun.failed}
                          </span>
                          {suite.lastRun.skipped > 0 && (
                            <span className="skipped">
                              <i className="fas fa-forward"></i> {suite.lastRun.skipped}
                            </span>
                          )}
                        </div>
                        <span className="run-time">
                          <i className="fas fa-clock"></i>
                          {formatDuration(suite.lastRun.duration)}
                        </span>
                      </div>
                    )}

                    <div className="suite-actions">
                      <button
                        className="btn-primary"
                        onClick={() => handleRunSuite(suite.id)}
                        disabled={runningTests.has(suite.id)}
                      >
                        {runningTests.has(suite.id) ? (
                          <><i className="fas fa-spinner fa-spin"></i> Ejecutando...</>
                        ) : (
                          <><i className="fas fa-play"></i> Ejecutar</>
                        )}
                      </button>
                      <button className="btn-secondary">
                        <i className="fas fa-edit"></i>
                        Editar
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'runs' && (
          <div className="test-runs">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Suite</th>
                  <th>Ambiente</th>
                  <th>Estado</th>
                  <th>Resultado</th>
                  <th>Duración</th>
                  <th>Iniciado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {runs.map(run => (
                  <tr key={run.id}>
                    <td>{run.suiteName}</td>
                    <td>
                      <span className="env-badge-small">{run.environment?.toUpperCase()}</span>
                    </td>
                    <td>
                      <span className={`status-badge ${run.status}`}>
                        {run.status}
                      </span>
                    </td>
                    <td>
                      {run.summary && (
                        <div className="run-summary">
                          <span className="passed">{run.summary.passed}</span>
                          /
                          <span className="failed">{run.summary.failed}</span>
                          /
                          <span className="total">{run.summary.total}</span>
                        </div>
                      )}
                    </td>
                    <td>
                      {run.results && formatDuration(
                        run.results.reduce((sum, r) => sum + (r.duration || 0), 0)
                      )}
                    </td>
                    <td>{formatDate(run.startedAt)}</td>
                    <td>
                      <button
                        className="action-btn"
                        onClick={() => toast('Ver detalles no implementado')}
                        title="Ver detalles"
                      >
                        <i className="fas fa-eye"></i>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

export default TestingPage
