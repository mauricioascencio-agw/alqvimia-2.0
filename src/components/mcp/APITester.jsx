import { useState, useRef, useEffect } from 'react'

function APITester({ connector, onClose, onOpenConfig }) {
  // Tab state
  const [activeTab, setActiveTab] = useState('request')

  // Request state
  const [method, setMethod] = useState('GET')
  const [url, setUrl] = useState('')
  const [requestHeaders, setRequestHeaders] = useState([
    { key: 'Content-Type', value: 'application/json', enabled: true },
    { key: 'Accept', value: 'application/json', enabled: true }
  ])
  const [requestParams, setRequestParams] = useState([])
  const [requestBody, setRequestBody] = useState('')
  const [bodyType, setBodyType] = useState('json') // json, form, raw, none

  // Auth state
  const [authType, setAuthType] = useState('none') // none, apiKey, bearer, basic, oauth2
  const [authConfig, setAuthConfig] = useState({
    apiKey: '',
    apiKeyHeader: 'X-API-Key',
    apiKeyLocation: 'header', // header, query
    bearerToken: '',
    basicUsername: '',
    basicPassword: '',
    oauth2Token: ''
  })

  // Response state
  const [response, setResponse] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [responseTime, setResponseTime] = useState(null)
  const [responseSize, setResponseSize] = useState(null)

  // Collections state
  const [collections, setCollections] = useState([
    {
      id: 1,
      name: 'Ejemplos',
      expanded: true,
      requests: [
        { id: 1, name: 'GET Users', method: 'GET', url: 'https://jsonplaceholder.typicode.com/users' },
        { id: 2, name: 'GET Posts', method: 'GET', url: 'https://jsonplaceholder.typicode.com/posts' },
        { id: 3, name: 'POST Create', method: 'POST', url: 'https://jsonplaceholder.typicode.com/posts', body: '{"title":"Test","body":"Content","userId":1}' }
      ]
    }
  ])
  const [history, setHistory] = useState([])
  const [selectedRequest, setSelectedRequest] = useState(null)

  // Environment variables
  const [environments, setEnvironments] = useState([
    { id: 1, name: 'Development', active: true, variables: { baseUrl: 'http://localhost:4000', apiKey: 'dev-key-123' } },
    { id: 2, name: 'Production', active: false, variables: { baseUrl: 'https://api.example.com', apiKey: 'prod-key-456' } }
  ])
  const [activeEnv, setActiveEnv] = useState(environments.find(e => e.active))
  const [showEnvModal, setShowEnvModal] = useState(false)

  // Request sub-tabs
  const [requestSubTab, setRequestSubTab] = useState('params') // params, headers, body, auth
  const [responseSubTab, setResponseSubTab] = useState('body') // body, headers, cookies

  // Refs
  const responseRef = useRef(null)

  // Methods
  const methods = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD', 'OPTIONS']

  const methodColors = {
    GET: '#10b981',
    POST: '#f59e0b',
    PUT: '#3b82f6',
    PATCH: '#8b5cf6',
    DELETE: '#ef4444',
    HEAD: '#6b7280',
    OPTIONS: '#06b6d4'
  }

  // Replace environment variables in string
  const replaceEnvVars = (str) => {
    if (!str || !activeEnv) return str
    let result = str
    Object.entries(activeEnv.variables).forEach(([key, value]) => {
      result = result.replace(new RegExp(`\\{\\{${key}\\}\\}`, 'g'), value)
    })
    return result
  }

  // Build full URL with params
  const buildFullUrl = () => {
    let fullUrl = replaceEnvVars(url)
    const enabledParams = requestParams.filter(p => p.enabled && p.key)
    if (enabledParams.length > 0) {
      const params = new URLSearchParams()
      enabledParams.forEach(p => params.append(p.key, replaceEnvVars(p.value)))
      fullUrl += (fullUrl.includes('?') ? '&' : '?') + params.toString()
    }
    return fullUrl
  }

  // Send request
  const sendRequest = async () => {
    if (!url.trim()) return

    setIsLoading(true)
    setResponse(null)
    const startTime = Date.now()

    try {
      const fullUrl = buildFullUrl()
      const headers = {}

      // Add enabled headers
      requestHeaders.filter(h => h.enabled && h.key).forEach(h => {
        headers[h.key] = replaceEnvVars(h.value)
      })

      // Add auth headers
      if (authType === 'apiKey' && authConfig.apiKey) {
        if (authConfig.apiKeyLocation === 'header') {
          headers[authConfig.apiKeyHeader] = authConfig.apiKey
        }
      } else if (authType === 'bearer' && authConfig.bearerToken) {
        headers['Authorization'] = `Bearer ${authConfig.bearerToken}`
      } else if (authType === 'basic' && authConfig.basicUsername) {
        headers['Authorization'] = `Basic ${btoa(`${authConfig.basicUsername}:${authConfig.basicPassword}`)}`
      } else if (authType === 'oauth2' && authConfig.oauth2Token) {
        headers['Authorization'] = `Bearer ${authConfig.oauth2Token}`
      }

      const options = {
        method,
        headers
      }

      // Add body for methods that support it
      if (['POST', 'PUT', 'PATCH'].includes(method) && bodyType !== 'none') {
        if (bodyType === 'json') {
          options.body = replaceEnvVars(requestBody)
        } else if (bodyType === 'form') {
          const formData = new FormData()
          try {
            const formObj = JSON.parse(requestBody)
            Object.entries(formObj).forEach(([k, v]) => formData.append(k, v))
            options.body = formData
            delete headers['Content-Type'] // Let browser set it
          } catch (e) {
            options.body = requestBody
          }
        } else {
          options.body = requestBody
        }
      }

      const res = await fetch(fullUrl, options)
      const endTime = Date.now()

      // Get response headers
      const resHeaders = {}
      res.headers.forEach((value, key) => {
        resHeaders[key] = value
      })

      // Try to parse response
      let data
      const contentType = res.headers.get('content-type') || ''
      const text = await res.text()

      if (contentType.includes('application/json')) {
        try {
          data = JSON.parse(text)
        } catch {
          data = text
        }
      } else {
        data = text
      }

      const responseData = {
        status: res.status,
        statusText: res.statusText,
        headers: resHeaders,
        data,
        rawText: text,
        ok: res.ok
      }

      setResponse(responseData)
      setResponseTime(endTime - startTime)
      setResponseSize(new Blob([text]).size)

      // Add to history
      setHistory(prev => [{
        id: Date.now(),
        method,
        url: fullUrl,
        status: res.status,
        time: new Date().toLocaleTimeString(),
        duration: endTime - startTime
      }, ...prev.slice(0, 49)])

    } catch (error) {
      setResponse({
        error: true,
        message: error.message,
        data: null
      })
      setResponseTime(Date.now() - startTime)
    }

    setIsLoading(false)
  }

  // Add header
  const addHeader = () => {
    setRequestHeaders([...requestHeaders, { key: '', value: '', enabled: true }])
  }

  // Remove header
  const removeHeader = (index) => {
    setRequestHeaders(requestHeaders.filter((_, i) => i !== index))
  }

  // Add param
  const addParam = () => {
    setRequestParams([...requestParams, { key: '', value: '', enabled: true }])
  }

  // Remove param
  const removeParam = (index) => {
    setRequestParams(requestParams.filter((_, i) => i !== index))
  }

  // Load request from collection
  const loadRequest = (request) => {
    setMethod(request.method)
    setUrl(request.url)
    if (request.headers) setRequestHeaders(request.headers)
    if (request.body) setRequestBody(request.body)
    if (request.params) setRequestParams(request.params)
    setSelectedRequest(request.id)
  }

  // Save current request to collection
  const saveToCollection = (collectionId) => {
    const newRequest = {
      id: Date.now(),
      name: `${method} Request`,
      method,
      url,
      headers: requestHeaders,
      body: requestBody,
      params: requestParams
    }
    setCollections(collections.map(c =>
      c.id === collectionId
        ? { ...c, requests: [...c.requests, newRequest] }
        : c
    ))
  }

  // Format JSON
  const formatJSON = (data) => {
    if (typeof data === 'string') {
      try {
        return JSON.stringify(JSON.parse(data), null, 2)
      } catch {
        return data
      }
    }
    return JSON.stringify(data, null, 2)
  }

  // Copy to clipboard
  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(typeof text === 'string' ? text : JSON.stringify(text, null, 2))
  }

  // Generate code snippet
  const generateCodeSnippet = (lang) => {
    const fullUrl = buildFullUrl()
    const headers = requestHeaders.filter(h => h.enabled && h.key)

    if (lang === 'curl') {
      let cmd = `curl -X ${method} "${fullUrl}"`
      headers.forEach(h => {
        cmd += ` \\\n  -H "${h.key}: ${h.value}"`
      })
      if (['POST', 'PUT', 'PATCH'].includes(method) && requestBody) {
        cmd += ` \\\n  -d '${requestBody}'`
      }
      return cmd
    }

    if (lang === 'javascript') {
      const headersObj = {}
      headers.forEach(h => { headersObj[h.key] = h.value })
      return `fetch("${fullUrl}", {
  method: "${method}",
  headers: ${JSON.stringify(headersObj, null, 4)},
  ${['POST', 'PUT', 'PATCH'].includes(method) ? `body: JSON.stringify(${requestBody || '{}'})` : ''}
})
  .then(res => res.json())
  .then(data => console.log(data))
  .catch(err => console.error(err))`
    }

    if (lang === 'python') {
      return `import requests

url = "${fullUrl}"
headers = {
${headers.map(h => `    "${h.key}": "${h.value}"`).join(',\n')}
}
${['POST', 'PUT', 'PATCH'].includes(method) ? `data = ${requestBody || '{}'}

response = requests.${method.toLowerCase()}(url, headers=headers, json=data)` : `response = requests.${method.toLowerCase()}(url, headers=headers)`}
print(response.json())`
    }

    return ''
  }

  const [showCodeModal, setShowCodeModal] = useState(false)
  const [codeLanguage, setCodeLanguage] = useState('curl')

  return (
    <div className="mcp-dashboard-overlay">
      <div className="mcp-dashboard api-tester">
        {/* Header */}
        <div className="mcp-dashboard-header">
          <div className="mcp-dashboard-title">
            <div className="connector-icon-large" style={{ background: `linear-gradient(135deg, ${connector?.color || '#FF6B6B'}, ${connector?.color || '#FF6B6B'}dd)` }}>
              <i className={`fas ${connector?.icon || 'fa-cloud'}`}></i>
            </div>
            <div>
              <h2>{connector?.name || 'REST API'}</h2>
              <span className="connection-status">
                <i className="fas fa-circle"></i> API Client
              </span>
            </div>
          </div>

          <div className="header-actions">
            {/* Environment Selector */}
            <div className="env-selector">
              <select
                value={activeEnv?.id || ''}
                onChange={(e) => {
                  const env = environments.find(env => env.id === parseInt(e.target.value))
                  setActiveEnv(env)
                }}
              >
                {environments.map(env => (
                  <option key={env.id} value={env.id}>{env.name}</option>
                ))}
              </select>
              <button
                className="btn-icon"
                onClick={() => setShowEnvModal(true)}
                title="Manage Environments"
              >
                <i className="fas fa-cog"></i>
              </button>
            </div>

            <button className="btn-icon" onClick={() => window.location.reload()}>
              <i className="fas fa-sync-alt"></i>
            </button>
            <button className="btn-icon" onClick={onOpenConfig}>
              <i className="fas fa-external-link-alt"></i>
            </button>
            <button className="btn-icon disconnect" title="Desconectar">
              <i className="fas fa-unlink"></i>
            </button>
            <button className="btn-icon save" title="Guardar">
              <i className="fas fa-save"></i>
            </button>
            <button className="btn-close" onClick={onClose}>
              <i className="fas fa-times"></i>
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="api-tester-content">
          {/* Sidebar - Collections & History */}
          <div className="api-sidebar">
            <div className="sidebar-tabs">
              <button
                className={`sidebar-tab ${activeTab === 'collections' ? 'active' : ''}`}
                onClick={() => setActiveTab('collections')}
              >
                <i className="fas fa-folder"></i> Colecciones
              </button>
              <button
                className={`sidebar-tab ${activeTab === 'history' ? 'active' : ''}`}
                onClick={() => setActiveTab('history')}
              >
                <i className="fas fa-history"></i> Historial
              </button>
            </div>

            <div className="sidebar-content">
              {activeTab === 'collections' && (
                <div className="collections-list">
                  <div className="collections-header">
                    <button className="btn-small" onClick={() => {
                      const name = prompt('Nombre de la colección:')
                      if (name) {
                        setCollections([...collections, { id: Date.now(), name, expanded: true, requests: [] }])
                      }
                    }}>
                      <i className="fas fa-plus"></i> Nueva
                    </button>
                  </div>

                  {collections.map(collection => (
                    <div key={collection.id} className="collection-item">
                      <div
                        className="collection-header"
                        onClick={() => setCollections(collections.map(c =>
                          c.id === collection.id ? { ...c, expanded: !c.expanded } : c
                        ))}
                      >
                        <i className={`fas fa-chevron-${collection.expanded ? 'down' : 'right'}`}></i>
                        <i className="fas fa-folder"></i>
                        <span>{collection.name}</span>
                        <span className="count">{collection.requests.length}</span>
                      </div>

                      {collection.expanded && (
                        <div className="collection-requests">
                          {collection.requests.map(req => (
                            <div
                              key={req.id}
                              className={`request-item ${selectedRequest === req.id ? 'selected' : ''}`}
                              onClick={() => loadRequest(req)}
                            >
                              <span className={`method-badge ${req.method.toLowerCase()}`}>
                                {req.method}
                              </span>
                              <span className="request-name">{req.name}</span>
                            </div>
                          ))}
                          <button
                            className="btn-add-request"
                            onClick={() => saveToCollection(collection.id)}
                          >
                            <i className="fas fa-plus"></i> Guardar actual
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {activeTab === 'history' && (
                <div className="history-list">
                  {history.length === 0 ? (
                    <div className="empty-history">
                      <i className="fas fa-clock"></i>
                      <p>Sin historial</p>
                    </div>
                  ) : (
                    history.map(item => (
                      <div
                        key={item.id}
                        className="history-item"
                        onClick={() => {
                          setMethod(item.method)
                          setUrl(item.url)
                        }}
                      >
                        <span className={`method-badge ${item.method.toLowerCase()}`}>
                          {item.method}
                        </span>
                        <div className="history-details">
                          <span className="history-url">{item.url}</span>
                          <div className="history-meta">
                            <span className={`status ${item.status < 400 ? 'success' : 'error'}`}>
                              {item.status}
                            </span>
                            <span>{item.duration}ms</span>
                            <span>{item.time}</span>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Main Panel */}
          <div className="api-main-panel">
            {/* URL Bar */}
            <div className="url-bar">
              <div className="method-selector">
                <select
                  value={method}
                  onChange={(e) => setMethod(e.target.value)}
                  style={{ color: methodColors[method] }}
                >
                  {methods.map(m => (
                    <option key={m} value={m} style={{ color: methodColors[m] }}>{m}</option>
                  ))}
                </select>
              </div>

              <div className="url-input-wrapper">
                <input
                  type="text"
                  className="url-input"
                  placeholder="Enter URL or paste cURL command"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') sendRequest()
                  }}
                />
                {url && url.includes('{{') && (
                  <div className="env-hint">
                    <i className="fas fa-info-circle"></i>
                    Variables detectadas
                  </div>
                )}
              </div>

              <button
                className="btn-send"
                onClick={sendRequest}
                disabled={isLoading || !url.trim()}
              >
                {isLoading ? (
                  <><i className="fas fa-spinner fa-spin"></i> Sending...</>
                ) : (
                  <><i className="fas fa-paper-plane"></i> Send</>
                )}
              </button>

              <button
                className="btn-code"
                onClick={() => setShowCodeModal(true)}
                title="Generate Code"
              >
                <i className="fas fa-code"></i>
              </button>
            </div>

            {/* Request/Response Split */}
            <div className="request-response-split">
              {/* Request Panel */}
              <div className="request-panel">
                <div className="panel-tabs">
                  <button
                    className={`panel-tab ${requestSubTab === 'params' ? 'active' : ''}`}
                    onClick={() => setRequestSubTab('params')}
                  >
                    Params
                    {requestParams.filter(p => p.enabled && p.key).length > 0 && (
                      <span className="tab-count">{requestParams.filter(p => p.enabled && p.key).length}</span>
                    )}
                  </button>
                  <button
                    className={`panel-tab ${requestSubTab === 'headers' ? 'active' : ''}`}
                    onClick={() => setRequestSubTab('headers')}
                  >
                    Headers
                    {requestHeaders.filter(h => h.enabled && h.key).length > 0 && (
                      <span className="tab-count">{requestHeaders.filter(h => h.enabled && h.key).length}</span>
                    )}
                  </button>
                  <button
                    className={`panel-tab ${requestSubTab === 'body' ? 'active' : ''}`}
                    onClick={() => setRequestSubTab('body')}
                  >
                    Body
                  </button>
                  <button
                    className={`panel-tab ${requestSubTab === 'auth' ? 'active' : ''}`}
                    onClick={() => setRequestSubTab('auth')}
                  >
                    Auth
                    {authType !== 'none' && <span className="tab-dot"></span>}
                  </button>
                </div>

                <div className="panel-content">
                  {/* Params Tab */}
                  {requestSubTab === 'params' && (
                    <div className="key-value-editor">
                      <div className="kv-header">
                        <span>Query Parameters</span>
                        <button className="btn-add" onClick={addParam}>
                          <i className="fas fa-plus"></i>
                        </button>
                      </div>
                      <div className="kv-list">
                        {requestParams.map((param, idx) => (
                          <div key={idx} className="kv-row">
                            <input
                              type="checkbox"
                              checked={param.enabled}
                              onChange={(e) => {
                                const newParams = [...requestParams]
                                newParams[idx].enabled = e.target.checked
                                setRequestParams(newParams)
                              }}
                            />
                            <input
                              type="text"
                              placeholder="Key"
                              value={param.key}
                              onChange={(e) => {
                                const newParams = [...requestParams]
                                newParams[idx].key = e.target.value
                                setRequestParams(newParams)
                              }}
                            />
                            <input
                              type="text"
                              placeholder="Value"
                              value={param.value}
                              onChange={(e) => {
                                const newParams = [...requestParams]
                                newParams[idx].value = e.target.value
                                setRequestParams(newParams)
                              }}
                            />
                            <button className="btn-remove" onClick={() => removeParam(idx)}>
                              <i className="fas fa-times"></i>
                            </button>
                          </div>
                        ))}
                        {requestParams.length === 0 && (
                          <div className="kv-empty">
                            <p>No query parameters</p>
                            <button onClick={addParam}>Add Parameter</button>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Headers Tab */}
                  {requestSubTab === 'headers' && (
                    <div className="key-value-editor">
                      <div className="kv-header">
                        <span>Request Headers</span>
                        <button className="btn-add" onClick={addHeader}>
                          <i className="fas fa-plus"></i>
                        </button>
                      </div>
                      <div className="kv-list">
                        {requestHeaders.map((header, idx) => (
                          <div key={idx} className="kv-row">
                            <input
                              type="checkbox"
                              checked={header.enabled}
                              onChange={(e) => {
                                const newHeaders = [...requestHeaders]
                                newHeaders[idx].enabled = e.target.checked
                                setRequestHeaders(newHeaders)
                              }}
                            />
                            <input
                              type="text"
                              placeholder="Key"
                              value={header.key}
                              onChange={(e) => {
                                const newHeaders = [...requestHeaders]
                                newHeaders[idx].key = e.target.value
                                setRequestHeaders(newHeaders)
                              }}
                            />
                            <input
                              type="text"
                              placeholder="Value"
                              value={header.value}
                              onChange={(e) => {
                                const newHeaders = [...requestHeaders]
                                newHeaders[idx].value = e.target.value
                                setRequestHeaders(newHeaders)
                              }}
                            />
                            <button className="btn-remove" onClick={() => removeHeader(idx)}>
                              <i className="fas fa-times"></i>
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Body Tab */}
                  {requestSubTab === 'body' && (
                    <div className="body-editor">
                      <div className="body-type-selector">
                        {['none', 'json', 'form', 'raw'].map(type => (
                          <label key={type} className={bodyType === type ? 'active' : ''}>
                            <input
                              type="radio"
                              name="bodyType"
                              value={type}
                              checked={bodyType === type}
                              onChange={(e) => setBodyType(e.target.value)}
                            />
                            {type === 'none' ? 'None' : type === 'json' ? 'JSON' : type === 'form' ? 'Form Data' : 'Raw'}
                          </label>
                        ))}
                      </div>

                      {bodyType !== 'none' && (
                        <div className="body-content">
                          <textarea
                            className="body-textarea"
                            placeholder={bodyType === 'json' ? '{\n  "key": "value"\n}' : 'Enter request body...'}
                            value={requestBody}
                            onChange={(e) => setRequestBody(e.target.value)}
                          />
                          {bodyType === 'json' && (
                            <button
                              className="btn-format"
                              onClick={() => {
                                try {
                                  setRequestBody(JSON.stringify(JSON.parse(requestBody), null, 2))
                                } catch (e) {
                                  // Invalid JSON
                                }
                              }}
                            >
                              <i className="fas fa-magic"></i> Format
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Auth Tab */}
                  {requestSubTab === 'auth' && (
                    <div className="auth-editor">
                      <div className="auth-type-selector">
                        <label>Authorization Type:</label>
                        <select value={authType} onChange={(e) => setAuthType(e.target.value)}>
                          <option value="none">No Auth</option>
                          <option value="apiKey">API Key</option>
                          <option value="bearer">Bearer Token</option>
                          <option value="basic">Basic Auth</option>
                          <option value="oauth2">OAuth 2.0</option>
                        </select>
                      </div>

                      {authType === 'apiKey' && (
                        <div className="auth-fields">
                          <div className="auth-field">
                            <label>Key:</label>
                            <input
                              type="password"
                              value={authConfig.apiKey}
                              onChange={(e) => setAuthConfig({ ...authConfig, apiKey: e.target.value })}
                              placeholder="Enter API Key"
                            />
                          </div>
                          <div className="auth-field">
                            <label>Header Name:</label>
                            <input
                              type="text"
                              value={authConfig.apiKeyHeader}
                              onChange={(e) => setAuthConfig({ ...authConfig, apiKeyHeader: e.target.value })}
                              placeholder="X-API-Key"
                            />
                          </div>
                          <div className="auth-field">
                            <label>Add to:</label>
                            <select
                              value={authConfig.apiKeyLocation}
                              onChange={(e) => setAuthConfig({ ...authConfig, apiKeyLocation: e.target.value })}
                            >
                              <option value="header">Header</option>
                              <option value="query">Query Params</option>
                            </select>
                          </div>
                        </div>
                      )}

                      {authType === 'bearer' && (
                        <div className="auth-fields">
                          <div className="auth-field">
                            <label>Token:</label>
                            <input
                              type="password"
                              value={authConfig.bearerToken}
                              onChange={(e) => setAuthConfig({ ...authConfig, bearerToken: e.target.value })}
                              placeholder="Enter Bearer Token"
                            />
                          </div>
                        </div>
                      )}

                      {authType === 'basic' && (
                        <div className="auth-fields">
                          <div className="auth-field">
                            <label>Username:</label>
                            <input
                              type="text"
                              value={authConfig.basicUsername}
                              onChange={(e) => setAuthConfig({ ...authConfig, basicUsername: e.target.value })}
                              placeholder="Username"
                            />
                          </div>
                          <div className="auth-field">
                            <label>Password:</label>
                            <input
                              type="password"
                              value={authConfig.basicPassword}
                              onChange={(e) => setAuthConfig({ ...authConfig, basicPassword: e.target.value })}
                              placeholder="Password"
                            />
                          </div>
                        </div>
                      )}

                      {authType === 'oauth2' && (
                        <div className="auth-fields">
                          <div className="auth-field">
                            <label>Access Token:</label>
                            <input
                              type="password"
                              value={authConfig.oauth2Token}
                              onChange={(e) => setAuthConfig({ ...authConfig, oauth2Token: e.target.value })}
                              placeholder="Enter OAuth 2.0 Token"
                            />
                          </div>
                          <p className="auth-hint">
                            <i className="fas fa-info-circle"></i>
                            Para flujos completos de OAuth 2.0, configura en la sección de APIs
                          </p>
                        </div>
                      )}

                      {authType === 'none' && (
                        <div className="auth-none">
                          <i className="fas fa-unlock"></i>
                          <p>Esta request no utiliza autorización</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Response Panel */}
              <div className="response-panel">
                <div className="panel-tabs">
                  <button
                    className={`panel-tab ${responseSubTab === 'body' ? 'active' : ''}`}
                    onClick={() => setResponseSubTab('body')}
                  >
                    Body
                  </button>
                  <button
                    className={`panel-tab ${responseSubTab === 'headers' ? 'active' : ''}`}
                    onClick={() => setResponseSubTab('headers')}
                  >
                    Headers
                    {response?.headers && (
                      <span className="tab-count">{Object.keys(response.headers).length}</span>
                    )}
                  </button>

                  {response && !response.error && (
                    <div className="response-meta">
                      <span className={`status-badge ${response.ok ? 'success' : 'error'}`}>
                        {response.status} {response.statusText}
                      </span>
                      <span className="meta-item">
                        <i className="fas fa-clock"></i> {responseTime}ms
                      </span>
                      <span className="meta-item">
                        <i className="fas fa-weight"></i> {(responseSize / 1024).toFixed(2)} KB
                      </span>
                    </div>
                  )}
                </div>

                <div className="panel-content" ref={responseRef}>
                  {!response && !isLoading && (
                    <div className="response-placeholder">
                      <i className="fas fa-paper-plane"></i>
                      <h3>Ready to send</h3>
                      <p>Enter a URL and click Send to get a response</p>
                    </div>
                  )}

                  {isLoading && (
                    <div className="response-loading">
                      <div className="loading-spinner"></div>
                      <p>Sending request...</p>
                    </div>
                  )}

                  {response && response.error && (
                    <div className="response-error">
                      <i className="fas fa-exclamation-triangle"></i>
                      <h3>Request Failed</h3>
                      <p>{response.message}</p>
                    </div>
                  )}

                  {response && !response.error && responseSubTab === 'body' && (
                    <div className="response-body">
                      <div className="response-toolbar">
                        <button onClick={() => copyToClipboard(response.rawText)}>
                          <i className="fas fa-copy"></i> Copy
                        </button>
                        <button onClick={() => {
                          const blob = new Blob([response.rawText], { type: 'application/json' })
                          const url = URL.createObjectURL(blob)
                          const a = document.createElement('a')
                          a.href = url
                          a.download = 'response.json'
                          a.click()
                        }}>
                          <i className="fas fa-download"></i> Download
                        </button>
                      </div>
                      <pre className="response-content">
                        {typeof response.data === 'object'
                          ? JSON.stringify(response.data, null, 2)
                          : response.rawText
                        }
                      </pre>
                    </div>
                  )}

                  {response && !response.error && responseSubTab === 'headers' && (
                    <div className="response-headers">
                      <table>
                        <thead>
                          <tr>
                            <th>Header</th>
                            <th>Value</th>
                          </tr>
                        </thead>
                        <tbody>
                          {Object.entries(response.headers).map(([key, value]) => (
                            <tr key={key}>
                              <td className="header-key">{key}</td>
                              <td className="header-value">{value}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Code Generation Modal */}
        {showCodeModal && (
          <div className="code-modal-overlay" onClick={() => setShowCodeModal(false)}>
            <div className="code-modal" onClick={(e) => e.stopPropagation()}>
              <div className="code-modal-header">
                <h3><i className="fas fa-code"></i> Generate Code</h3>
                <button onClick={() => setShowCodeModal(false)}>
                  <i className="fas fa-times"></i>
                </button>
              </div>
              <div className="code-modal-tabs">
                {['curl', 'javascript', 'python'].map(lang => (
                  <button
                    key={lang}
                    className={codeLanguage === lang ? 'active' : ''}
                    onClick={() => setCodeLanguage(lang)}
                  >
                    {lang === 'curl' ? 'cURL' : lang === 'javascript' ? 'JavaScript' : 'Python'}
                  </button>
                ))}
              </div>
              <div className="code-modal-content">
                <pre>{generateCodeSnippet(codeLanguage)}</pre>
                <button
                  className="btn-copy-code"
                  onClick={() => copyToClipboard(generateCodeSnippet(codeLanguage))}
                >
                  <i className="fas fa-copy"></i> Copy to Clipboard
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Environment Modal */}
        {showEnvModal && (
          <div className="env-modal-overlay" onClick={() => setShowEnvModal(false)}>
            <div className="env-modal" onClick={(e) => e.stopPropagation()}>
              <div className="env-modal-header">
                <h3><i className="fas fa-globe"></i> Manage Environments</h3>
                <button onClick={() => setShowEnvModal(false)}>
                  <i className="fas fa-times"></i>
                </button>
              </div>
              <div className="env-modal-content">
                <div className="env-list">
                  {environments.map(env => (
                    <div key={env.id} className={`env-item ${activeEnv?.id === env.id ? 'active' : ''}`}>
                      <div className="env-item-header">
                        <input
                          type="radio"
                          name="activeEnv"
                          checked={activeEnv?.id === env.id}
                          onChange={() => setActiveEnv(env)}
                        />
                        <span className="env-name">{env.name}</span>
                      </div>
                      <div className="env-variables">
                        {Object.entries(env.variables).map(([key, value]) => (
                          <div key={key} className="env-var">
                            <span className="var-key">{`{{${key}}}`}</span>
                            <span className="var-value">{value}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
                <button className="btn-add-env">
                  <i className="fas fa-plus"></i> Add Environment
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default APITester
