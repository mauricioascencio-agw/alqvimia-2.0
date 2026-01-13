/**
 * LoginView - Vista de inicio de sesión
 */

import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import '../assets/css/login-styles.css'

function LoginView({ onLoginSuccess }) {
  const { login, register, loading, error } = useAuth()
  const [isRegister, setIsRegister] = useState(false)
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    password: '',
    confirmPassword: ''
  })
  const [formError, setFormError] = useState('')

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
    setFormError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setFormError('')

    if (isRegister) {
      // Validaciones de registro
      if (!formData.nombre.trim()) {
        setFormError('El nombre es requerido')
        return
      }
      if (formData.password !== formData.confirmPassword) {
        setFormError('Las contraseñas no coinciden')
        return
      }
      if (formData.password.length < 6) {
        setFormError('La contraseña debe tener al menos 6 caracteres')
        return
      }

      const result = await register(formData.nombre, formData.email, formData.password)
      if (result.success) {
        onLoginSuccess?.()
      } else {
        setFormError(result.error)
      }
    } else {
      // Login
      if (!formData.email || !formData.password) {
        setFormError('Email y contraseña son requeridos')
        return
      }

      const result = await login(formData.email, formData.password)
      if (result.success) {
        onLoginSuccess?.()
      } else {
        setFormError(result.error)
      }
    }
  }

  return (
    <div className="login-container">
      <div className="login-background">
        <div className="bg-gradient"></div>
        <div className="bg-pattern"></div>
      </div>

      <div className="login-card">
        <div className="login-header">
          <div className="login-logo">
            <i className="fas fa-flask"></i>
          </div>
          <h1>Alqvimia RPA</h1>
          <p>{isRegister ? 'Crear nueva cuenta' : 'Iniciar sesión'}</p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          {isRegister && (
            <div className="form-group">
              <label>
                <i className="fas fa-user"></i>
                Nombre completo
              </label>
              <input
                type="text"
                name="nombre"
                value={formData.nombre}
                onChange={handleChange}
                placeholder="Tu nombre"
                autoComplete="name"
              />
            </div>
          )}

          <div className="form-group">
            <label>
              <i className="fas fa-envelope"></i>
              Email
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="tu@email.com"
              autoComplete="email"
            />
          </div>

          <div className="form-group">
            <label>
              <i className="fas fa-lock"></i>
              Contraseña
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="••••••••"
              autoComplete={isRegister ? 'new-password' : 'current-password'}
            />
          </div>

          {isRegister && (
            <div className="form-group">
              <label>
                <i className="fas fa-lock"></i>
                Confirmar contraseña
              </label>
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="••••••••"
                autoComplete="new-password"
              />
            </div>
          )}

          {(formError || error) && (
            <div className="form-error">
              <i className="fas fa-exclamation-circle"></i>
              {formError || error}
            </div>
          )}

          <button type="submit" className="login-btn" disabled={loading}>
            {loading ? (
              <>
                <i className="fas fa-spinner fa-spin"></i>
                {isRegister ? 'Registrando...' : 'Iniciando sesión...'}
              </>
            ) : (
              <>
                <i className={`fas ${isRegister ? 'fa-user-plus' : 'fa-sign-in-alt'}`}></i>
                {isRegister ? 'Crear cuenta' : 'Iniciar sesión'}
              </>
            )}
          </button>
        </form>

        <div className="login-footer">
          <p>
            {isRegister ? '¿Ya tienes cuenta?' : '¿No tienes cuenta?'}
            <button
              type="button"
              className="toggle-btn"
              onClick={() => {
                setIsRegister(!isRegister)
                setFormError('')
              }}
            >
              {isRegister ? 'Iniciar sesión' : 'Registrarse'}
            </button>
          </p>
        </div>

        <div className="login-info">
          <p>
            <i className="fas fa-info-circle"></i>
            Usuario por defecto: <strong>admin@alqvimia.local</strong>
          </p>
        </div>
      </div>

      <div className="login-footer-brand">
        <p>Alqvimia RPA 2.0 &copy; 2025</p>
      </div>
    </div>
  )
}

export default LoginView
