/**
 * ALQVIMIA RPA 2.0 - Onboarding Wizard
 * Wizard de configuración para nuevos clientes
 */

import { useState, useEffect } from 'react'
import '../assets/css/onboarding-wizard.css'

function OnboardingWizard() {
  // Estado del wizard
  const [currentStep, setCurrentStep] = useState(1)
  const [sessionId, setSessionId] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)

  // Datos del formulario
  const [formData, setFormData] = useState({
    // Paso 1: Información básica
    email: '',
    password: '',
    confirmPassword: '',
    companyName: '',
    industry: '',
    companySize: '',

    // Paso 2: Plan
    plan: 'professional',
    billingInterval: 'monthly',

    // Paso 3: Módulos y agentes
    subdomain: '',
    modules: [],
    agents: [],

    // Paso 4: Branding
    displayName: '',
    logo: null,
    colors: {
      primary: '#3B82F6',
      secondary: '#10B981',
      background: '#0F172A',
      text: '#F8FAFC'
    },

    // Paso 5: Pago
    paymentMethod: 'card',
    billingInfo: {
      name: '',
      taxId: '',
      address: '',
      city: '',
      state: '',
      postalCode: '',
      country: 'MX'
    }
  })

  // Datos de planes y módulos
  const [plans, setPlans] = useState([])
  const [availableModules, setAvailableModules] = useState([])
  const [availableAgents, setAvailableAgents] = useState([])
  const [priceBreakdown, setPriceBreakdown] = useState(null)

  // Cargar planes al inicio
  useEffect(() => {
    loadPlans()
  }, [])

  // Cargar módulos cuando cambia el plan
  useEffect(() => {
    if (formData.plan) {
      loadModules(formData.plan)
    }
  }, [formData.plan])

  // Recalcular precio cuando cambian módulos/agentes
  useEffect(() => {
    if (sessionId && currentStep >= 3) {
      calculatePrice()
    }
  }, [formData.modules, formData.agents, formData.plan, formData.billingInterval])

  const loadPlans = async () => {
    try {
      const response = await fetch('/api/portal/onboarding/plans')
      const data = await response.json()
      setPlans(data.plans)
    } catch (err) {
      console.error('Error loading plans:', err)
    }
  }

  const loadModules = async (planId) => {
    try {
      const response = await fetch(`/api/portal/onboarding/modules?planId=${planId}`)
      const data = await response.json()
      setAvailableModules(data.modules)
      setAvailableAgents(data.agents)

      // Pre-seleccionar incluidos
      const includedModules = data.modules.filter(m => m.included).map(m => m.id)
      const includedAgents = data.agents.filter(a => a.included).map(a => a.id)

      setFormData(prev => ({
        ...prev,
        modules: includedModules,
        agents: includedAgents
      }))
    } catch (err) {
      console.error('Error loading modules:', err)
    }
  }

  const calculatePrice = async () => {
    if (!sessionId) return

    try {
      const response = await fetch('/api/portal/onboarding/calculate-price', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId })
      })
      const data = await response.json()
      setPriceBreakdown(data)
    } catch (err) {
      console.error('Error calculating price:', err)
    }
  }

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleNestedChange = (parent, field, value) => {
    setFormData(prev => ({
      ...prev,
      [parent]: {
        ...prev[parent],
        [field]: value
      }
    }))
  }

  const toggleArrayItem = (field, item) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].includes(item)
        ? prev[field].filter(i => i !== item)
        : [...prev[field], item]
    }))
  }

  const validateStep = () => {
    setError(null)

    switch (currentStep) {
      case 1:
        if (!formData.email || !formData.password || !formData.companyName) {
          setError('Por favor completa todos los campos requeridos')
          return false
        }
        if (formData.password !== formData.confirmPassword) {
          setError('Las contraseñas no coinciden')
          return false
        }
        if (formData.password.length < 8) {
          setError('La contraseña debe tener al menos 8 caracteres')
          return false
        }
        break

      case 3:
        if (!formData.subdomain) {
          setError('Por favor ingresa un subdominio')
          return false
        }
        if (!/^[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?$/.test(formData.subdomain)) {
          setError('Subdominio inválido. Usa solo letras minúsculas, números y guiones')
          return false
        }
        break
    }

    return true
  }

  const nextStep = async () => {
    if (!validateStep()) return

    setIsLoading(true)
    setError(null)

    try {
      switch (currentStep) {
        case 1:
          // Iniciar onboarding
          const startResponse = await fetch('/api/portal/onboarding/start', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              email: formData.email,
              password: formData.password,
              companyName: formData.companyName
            })
          })
          const startData = await startResponse.json()

          if (!startResponse.ok) throw new Error(startData.error)

          setSessionId(startData.sessionId)

          // Auto-verificar en desarrollo
          await fetch('/api/portal/onboarding/verify-email', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ sessionId: startData.sessionId, token: 'dev' })
          })
          break

        case 2:
          // Seleccionar plan
          await fetch('/api/portal/onboarding/select-plan', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              sessionId,
              planId: formData.plan,
              billingInterval: formData.billingInterval
            })
          })
          break

        case 3:
          // Configurar módulos
          await fetch('/api/portal/onboarding/configure', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              sessionId,
              subdomain: formData.subdomain,
              modules: formData.modules,
              agents: formData.agents
            })
          })
          break

        case 4:
          // Configurar branding
          await fetch('/api/portal/onboarding/branding', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              sessionId,
              logo: formData.logo,
              colors: formData.colors,
              displayName: formData.displayName || formData.companyName
            })
          })
          break
      }

      setCurrentStep(prev => prev + 1)
    } catch (err) {
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  const prevStep = () => {
    setCurrentStep(prev => prev - 1)
    setError(null)
  }

  const handleProvision = async () => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/portal/onboarding/provision', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          billingInfo: formData.billingInfo
        })
      })

      const data = await response.json()

      if (!response.ok) throw new Error(data.error)

      // Ir a paso de provisioning
      setCurrentStep(6)

      // Polling del estado
      pollProvisioningStatus(data.deploymentId)

    } catch (err) {
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  const [provisioningStatus, setProvisioningStatus] = useState(null)

  const pollProvisioningStatus = async (deploymentId) => {
    const poll = async () => {
      try {
        const response = await fetch(`/api/portal/onboarding/status/${deploymentId}`)
        const data = await response.json()

        setProvisioningStatus(data)

        if (data.status === 'running') {
          // Completado!
          return
        } else if (data.status === 'error') {
          setError(data.error)
          return
        }

        // Continuar polling
        setTimeout(poll, 2000)
      } catch (err) {
        setError(err.message)
      }
    }

    poll()
  }

  // Steps config
  const steps = [
    { number: 1, title: 'Información', icon: 'fa-user' },
    { number: 2, title: 'Plan', icon: 'fa-tag' },
    { number: 3, title: 'Configuración', icon: 'fa-cog' },
    { number: 4, title: 'Branding', icon: 'fa-palette' },
    { number: 5, title: 'Pago', icon: 'fa-credit-card' },
    { number: 6, title: 'Activación', icon: 'fa-rocket' }
  ]

  const industries = [
    'Tecnología', 'Finanzas', 'Retail', 'Manufactura', 'Salud',
    'Educación', 'Gobierno', 'Logística', 'Telecomunicaciones', 'Otro'
  ]

  return (
    <div className="onboarding-wizard">
      {/* Header */}
      <div className="wizard-header">
        <div className="wizard-logo">
          <i className="fas fa-bolt"></i>
          <span>ALQVIMIA</span>
        </div>
        <div className="wizard-title">
          <h1>Configura tu plataforma</h1>
          <p>Completa los siguientes pasos para activar tu cuenta</p>
        </div>
      </div>

      {/* Progress Steps */}
      <div className="wizard-progress">
        {steps.map(step => (
          <div
            key={step.number}
            className={`progress-step ${currentStep === step.number ? 'active' : ''} ${currentStep > step.number ? 'completed' : ''}`}
          >
            <div className="step-icon">
              {currentStep > step.number ? (
                <i className="fas fa-check"></i>
              ) : (
                <i className={`fas ${step.icon}`}></i>
              )}
            </div>
            <span className="step-title">{step.title}</span>
          </div>
        ))}
      </div>

      {/* Error */}
      {error && (
        <div className="wizard-error">
          <i className="fas fa-exclamation-circle"></i>
          {error}
        </div>
      )}

      {/* Step Content */}
      <div className="wizard-content">
        {/* PASO 1: Información Básica */}
        {currentStep === 1 && (
          <div className="wizard-step step-info">
            <h2><i className="fas fa-user"></i> Información Básica</h2>
            <p>Cuéntanos sobre tu empresa</p>

            <div className="form-grid">
              <div className="form-group full-width">
                <label>Email corporativo *</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={e => handleInputChange('email', e.target.value)}
                  placeholder="tu@empresa.com"
                />
              </div>

              <div className="form-group">
                <label>Contraseña *</label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={e => handleInputChange('password', e.target.value)}
                  placeholder="Mínimo 8 caracteres"
                />
              </div>

              <div className="form-group">
                <label>Confirmar contraseña *</label>
                <input
                  type="password"
                  value={formData.confirmPassword}
                  onChange={e => handleInputChange('confirmPassword', e.target.value)}
                  placeholder="Repite tu contraseña"
                />
              </div>

              <div className="form-group full-width">
                <label>Nombre de la empresa *</label>
                <input
                  type="text"
                  value={formData.companyName}
                  onChange={e => handleInputChange('companyName', e.target.value)}
                  placeholder="Mi Empresa S.A."
                />
              </div>

              <div className="form-group">
                <label>Industria</label>
                <select
                  value={formData.industry}
                  onChange={e => handleInputChange('industry', e.target.value)}
                >
                  <option value="">Seleccionar...</option>
                  {industries.map(ind => (
                    <option key={ind} value={ind}>{ind}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Tamaño de empresa</label>
                <div className="radio-group">
                  {['1-10', '11-50', '51-200', '200+'].map(size => (
                    <label key={size} className="radio-option">
                      <input
                        type="radio"
                        name="companySize"
                        value={size}
                        checked={formData.companySize === size}
                        onChange={e => handleInputChange('companySize', e.target.value)}
                      />
                      <span>{size}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* PASO 2: Selección de Plan */}
        {currentStep === 2 && (
          <div className="wizard-step step-plan">
            <h2><i className="fas fa-tag"></i> Selecciona tu Plan</h2>
            <p>Elige el plan que mejor se adapte a tus necesidades</p>

            <div className="billing-toggle">
              <button
                className={formData.billingInterval === 'monthly' ? 'active' : ''}
                onClick={() => handleInputChange('billingInterval', 'monthly')}
              >
                Mensual
              </button>
              <button
                className={formData.billingInterval === 'yearly' ? 'active' : ''}
                onClick={() => handleInputChange('billingInterval', 'yearly')}
              >
                Anual <span className="discount">20% dto</span>
              </button>
            </div>

            <div className="plans-grid">
              {plans.map(plan => (
                <div
                  key={plan.id}
                  className={`plan-card ${formData.plan === plan.id ? 'selected' : ''} ${plan.popular ? 'popular' : ''}`}
                  onClick={() => handleInputChange('plan', plan.id)}
                >
                  {plan.popular && <div className="popular-badge">Más popular</div>}

                  <h3>{plan.name}</h3>
                  <div className="plan-price">
                    {plan.price.custom ? (
                      <span className="custom">Personalizado</span>
                    ) : (
                      <>
                        <span className="amount">
                          ${formData.billingInterval === 'monthly'
                            ? plan.price.monthly
                            : Math.round(plan.price.yearly / 12)}
                        </span>
                        <span className="period">/mes</span>
                      </>
                    )}
                  </div>

                  <ul className="plan-features">
                    <li><i className="fas fa-robot"></i> {plan.features.robots} Robots</li>
                    <li><i className="fas fa-sitemap"></i> {plan.features.workflows} Workflows</li>
                    <li><i className="fas fa-play"></i> {plan.features.executionsPerMonth.toLocaleString?.()} ejecuciones/mes</li>
                    <li><i className="fas fa-hdd"></i> {plan.features.storage}</li>
                    <li><i className="fas fa-headset"></i> Soporte {plan.features.support}</li>
                  </ul>

                  <button className={`select-btn ${formData.plan === plan.id ? 'selected' : ''}`}>
                    {formData.plan === plan.id ? 'Seleccionado' : 'Seleccionar'}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* PASO 3: Configuración */}
        {currentStep === 3 && (
          <div className="wizard-step step-config">
            <h2><i className="fas fa-cog"></i> Configura tu Plataforma</h2>

            {/* Subdomain */}
            <div className="config-section">
              <h3>Tu URL de acceso</h3>
              <div className="subdomain-input">
                <input
                  type="text"
                  value={formData.subdomain}
                  onChange={e => handleInputChange('subdomain', e.target.value.toLowerCase())}
                  placeholder="mi-empresa"
                />
                <span className="subdomain-suffix">.alqvimia.app</span>
              </div>
              <p className="hint">
                <i className="fas fa-info-circle"></i>
                Esta será la URL donde accederás a tu plataforma
              </p>
            </div>

            {/* Módulos */}
            <div className="config-section">
              <h3>Módulos</h3>
              <div className="modules-grid">
                {availableModules.map(module => (
                  <label
                    key={module.id}
                    className={`module-card ${formData.modules.includes(module.id) ? 'selected' : ''} ${module.included ? 'included' : ''}`}
                  >
                    <input
                      type="checkbox"
                      checked={formData.modules.includes(module.id)}
                      onChange={() => !module.included && toggleArrayItem('modules', module.id)}
                      disabled={module.included}
                    />
                    <div className="module-info">
                      <span className="module-name">{module.name}</span>
                      {module.included ? (
                        <span className="module-price included">Incluido</span>
                      ) : (
                        <span className="module-price">+${module.price}/mes</span>
                      )}
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Agentes */}
            <div className="config-section">
              <h3>Agentes</h3>

              {['database', 'api', 'messaging', 'ai', 'storage', 'crm', 'erp'].map(category => {
                const categoryAgents = availableAgents.filter(a => a.category === category)
                if (categoryAgents.length === 0) return null

                return (
                  <div key={category} className="agent-category">
                    <h4>{category.charAt(0).toUpperCase() + category.slice(1)}</h4>
                    <div className="agents-grid">
                      {categoryAgents.map(agent => (
                        <label
                          key={agent.id}
                          className={`agent-card ${formData.agents.includes(agent.id) ? 'selected' : ''} ${agent.included ? 'included' : ''} ${agent.premium ? 'premium' : ''}`}
                        >
                          <input
                            type="checkbox"
                            checked={formData.agents.includes(agent.id)}
                            onChange={() => !agent.included && toggleArrayItem('agents', agent.id)}
                            disabled={agent.included}
                          />
                          <span className="agent-name">{agent.name}</span>
                          {agent.included ? (
                            <span className="agent-price">Incluido</span>
                          ) : (
                            <span className="agent-price">+${agent.price}/mes</span>
                          )}
                          {agent.premium && <span className="premium-badge">Premium</span>}
                        </label>
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* PASO 4: Branding */}
        {currentStep === 4 && (
          <div className="wizard-step step-branding">
            <h2><i className="fas fa-palette"></i> Personaliza tu Plataforma</h2>
            <p>Agrega tu marca y colores corporativos</p>

            <div className="branding-grid">
              <div className="branding-form">
                <div className="form-group">
                  <label>Nombre a mostrar</label>
                  <input
                    type="text"
                    value={formData.displayName}
                    onChange={e => handleInputChange('displayName', e.target.value)}
                    placeholder={formData.companyName}
                  />
                </div>

                <div className="form-group">
                  <label>Logo</label>
                  <div className="logo-upload">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={e => {
                        const file = e.target.files[0]
                        if (file) {
                          const reader = new FileReader()
                          reader.onload = (ev) => handleInputChange('logo', ev.target.result)
                          reader.readAsDataURL(file)
                        }
                      }}
                    />
                    {formData.logo ? (
                      <img src={formData.logo} alt="Logo preview" />
                    ) : (
                      <div className="upload-placeholder">
                        <i className="fas fa-cloud-upload-alt"></i>
                        <span>Subir logo</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="form-group">
                  <label>Colores</label>
                  <div className="color-pickers">
                    <div className="color-picker">
                      <label>Primario</label>
                      <input
                        type="color"
                        value={formData.colors.primary}
                        onChange={e => handleNestedChange('colors', 'primary', e.target.value)}
                      />
                    </div>
                    <div className="color-picker">
                      <label>Secundario</label>
                      <input
                        type="color"
                        value={formData.colors.secondary}
                        onChange={e => handleNestedChange('colors', 'secondary', e.target.value)}
                      />
                    </div>
                    <div className="color-picker">
                      <label>Fondo</label>
                      <input
                        type="color"
                        value={formData.colors.background}
                        onChange={e => handleNestedChange('colors', 'background', e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="branding-preview">
                <h4>Vista previa</h4>
                <div
                  className="preview-window"
                  style={{ backgroundColor: formData.colors.background }}
                >
                  <div className="preview-header" style={{ backgroundColor: formData.colors.primary }}>
                    {formData.logo ? (
                      <img src={formData.logo} alt="Logo" className="preview-logo" />
                    ) : (
                      <div className="preview-logo-placeholder">LOGO</div>
                    )}
                    <span style={{ color: formData.colors.text }}>
                      {formData.displayName || formData.companyName || 'Mi Empresa'}
                    </span>
                  </div>
                  <div className="preview-content">
                    <div className="preview-nav">
                      <span style={{ color: formData.colors.text }}>Dashboard</span>
                      <span style={{ color: formData.colors.text }}>Workflows</span>
                      <span style={{ color: formData.colors.text }}>Agentes</span>
                    </div>
                    <div className="preview-cards">
                      <div className="preview-card" style={{ borderColor: formData.colors.primary }}>
                        <i className="fas fa-play" style={{ color: formData.colors.primary }}></i>
                      </div>
                      <div className="preview-card" style={{ borderColor: formData.colors.secondary }}>
                        <i className="fas fa-chart-line" style={{ color: formData.colors.secondary }}></i>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* PASO 5: Pago */}
        {currentStep === 5 && (
          <div className="wizard-step step-payment">
            <h2><i className="fas fa-credit-card"></i> Finaliza tu Compra</h2>

            <div className="payment-grid">
              {/* Resumen */}
              <div className="order-summary">
                <h3>Resumen del pedido</h3>

                {priceBreakdown && (
                  <div className="price-breakdown">
                    <div className="price-line">
                      <span>Plan {formData.plan.charAt(0).toUpperCase() + formData.plan.slice(1)}</span>
                      <span>${priceBreakdown.basePrice}/mes</span>
                    </div>

                    {priceBreakdown.addons.map(addon => (
                      <div key={addon.name} className="price-line addon">
                        <span>{addon.name}</span>
                        <span>+${addon.price}/mes</span>
                      </div>
                    ))}

                    <div className="price-line subtotal">
                      <span>Subtotal</span>
                      <span>${priceBreakdown.subtotal.toFixed(2)}</span>
                    </div>

                    <div className="price-line tax">
                      <span>IVA ({(priceBreakdown.taxRate * 100).toFixed(0)}%)</span>
                      <span>${priceBreakdown.tax.toFixed(2)}</span>
                    </div>

                    <div className="price-line total">
                      <span>Total</span>
                      <span>${priceBreakdown.total.toFixed(2)}/mes</span>
                    </div>
                  </div>
                )}

                <div className="selected-items">
                  <h4>Tu plataforma incluye:</h4>
                  <ul>
                    <li><i className="fas fa-check"></i> Subdominio: {formData.subdomain}.alqvimia.app</li>
                    <li><i className="fas fa-check"></i> {formData.modules.length} módulos activos</li>
                    <li><i className="fas fa-check"></i> {formData.agents.length} agentes configurados</li>
                    <li><i className="fas fa-check"></i> SSL incluido</li>
                    <li><i className="fas fa-check"></i> Backups automáticos</li>
                  </ul>
                </div>
              </div>

              {/* Formulario de pago */}
              <div className="payment-form">
                <h3>Datos de facturación</h3>

                <div className="form-grid">
                  <div className="form-group full-width">
                    <label>Nombre o Razón Social</label>
                    <input
                      type="text"
                      value={formData.billingInfo.name}
                      onChange={e => handleNestedChange('billingInfo', 'name', e.target.value)}
                      placeholder="Empresa S.A. de C.V."
                    />
                  </div>

                  <div className="form-group">
                    <label>RFC</label>
                    <input
                      type="text"
                      value={formData.billingInfo.taxId}
                      onChange={e => handleNestedChange('billingInfo', 'taxId', e.target.value.toUpperCase())}
                      placeholder="XAXX010101000"
                    />
                  </div>

                  <div className="form-group">
                    <label>País</label>
                    <select
                      value={formData.billingInfo.country}
                      onChange={e => handleNestedChange('billingInfo', 'country', e.target.value)}
                    >
                      <option value="MX">México</option>
                      <option value="CO">Colombia</option>
                      <option value="AR">Argentina</option>
                      <option value="ES">España</option>
                      <option value="US">Estados Unidos</option>
                    </select>
                  </div>

                  <div className="form-group full-width">
                    <label>Dirección</label>
                    <input
                      type="text"
                      value={formData.billingInfo.address}
                      onChange={e => handleNestedChange('billingInfo', 'address', e.target.value)}
                      placeholder="Calle, número, colonia"
                    />
                  </div>

                  <div className="form-group">
                    <label>Ciudad</label>
                    <input
                      type="text"
                      value={formData.billingInfo.city}
                      onChange={e => handleNestedChange('billingInfo', 'city', e.target.value)}
                    />
                  </div>

                  <div className="form-group">
                    <label>Estado</label>
                    <input
                      type="text"
                      value={formData.billingInfo.state}
                      onChange={e => handleNestedChange('billingInfo', 'state', e.target.value)}
                    />
                  </div>

                  <div className="form-group">
                    <label>C.P.</label>
                    <input
                      type="text"
                      value={formData.billingInfo.postalCode}
                      onChange={e => handleNestedChange('billingInfo', 'postalCode', e.target.value)}
                    />
                  </div>
                </div>

                <h3>Método de pago</h3>
                <div className="payment-methods">
                  <label className={`payment-method ${formData.paymentMethod === 'card' ? 'selected' : ''}`}>
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="card"
                      checked={formData.paymentMethod === 'card'}
                      onChange={e => handleInputChange('paymentMethod', e.target.value)}
                    />
                    <i className="fas fa-credit-card"></i>
                    <span>Tarjeta</span>
                  </label>
                  <label className={`payment-method ${formData.paymentMethod === 'paypal' ? 'selected' : ''}`}>
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="paypal"
                      checked={formData.paymentMethod === 'paypal'}
                      onChange={e => handleInputChange('paymentMethod', e.target.value)}
                    />
                    <i className="fab fa-paypal"></i>
                    <span>PayPal</span>
                  </label>
                  <label className={`payment-method ${formData.paymentMethod === 'transfer' ? 'selected' : ''}`}>
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="transfer"
                      checked={formData.paymentMethod === 'transfer'}
                      onChange={e => handleInputChange('paymentMethod', e.target.value)}
                    />
                    <i className="fas fa-university"></i>
                    <span>Transferencia</span>
                  </label>
                </div>

                {/* Stripe Elements iría aquí */}
                {formData.paymentMethod === 'card' && (
                  <div className="stripe-elements">
                    <div className="card-element-placeholder">
                      <p>Integración de Stripe aquí</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* PASO 6: Provisioning */}
        {currentStep === 6 && (
          <div className="wizard-step step-provisioning">
            <h2><i className="fas fa-rocket"></i> Activando tu Plataforma</h2>

            <div className="provisioning-status">
              {provisioningStatus?.status === 'running' ? (
                <div className="provisioning-complete">
                  <div className="success-icon">
                    <i className="fas fa-check-circle"></i>
                  </div>
                  <h3>¡Tu plataforma está lista!</h3>
                  <p>Accede ahora a tu nuevo espacio de automatización</p>

                  <a
                    href={provisioningStatus.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="access-button"
                  >
                    <i className="fas fa-external-link-alt"></i>
                    Ir a {formData.subdomain}.alqvimia.app
                  </a>

                  <div className="next-steps">
                    <h4>Próximos pasos:</h4>
                    <ul>
                      <li><i className="fas fa-check"></i> Configura tus conexiones</li>
                      <li><i className="fas fa-check"></i> Crea tu primer workflow</li>
                      <li><i className="fas fa-check"></i> Invita a tu equipo</li>
                    </ul>
                  </div>
                </div>
              ) : (
                <div className="provisioning-progress">
                  <div className="progress-spinner">
                    <i className="fas fa-spinner fa-spin"></i>
                  </div>

                  <div className="progress-info">
                    <div className="progress-bar">
                      <div
                        className="progress-fill"
                        style={{ width: `${provisioningStatus?.progress || 0}%` }}
                      ></div>
                    </div>
                    <span className="progress-text">
                      {provisioningStatus?.currentStep || 'Iniciando...'}
                    </span>
                    <span className="progress-percent">
                      {provisioningStatus?.progress || 0}%
                    </span>
                  </div>

                  <p className="wait-message">
                    Esto puede tomar unos minutos. No cierres esta ventana.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Navigation */}
      {currentStep < 6 && (
        <div className="wizard-navigation">
          {currentStep > 1 && (
            <button className="btn-prev" onClick={prevStep} disabled={isLoading}>
              <i className="fas fa-arrow-left"></i>
              Anterior
            </button>
          )}

          {currentStep < 5 ? (
            <button className="btn-next" onClick={nextStep} disabled={isLoading}>
              {isLoading ? (
                <>
                  <i className="fas fa-spinner fa-spin"></i>
                  Procesando...
                </>
              ) : (
                <>
                  Siguiente
                  <i className="fas fa-arrow-right"></i>
                </>
              )}
            </button>
          ) : (
            <button className="btn-provision" onClick={handleProvision} disabled={isLoading}>
              {isLoading ? (
                <>
                  <i className="fas fa-spinner fa-spin"></i>
                  Procesando pago...
                </>
              ) : (
                <>
                  <i className="fas fa-rocket"></i>
                  Activar mi Plataforma
                </>
              )}
            </button>
          )}
        </div>
      )}
    </div>
  )
}

export default OnboardingWizard
