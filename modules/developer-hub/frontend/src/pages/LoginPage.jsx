import { useState } from 'react'
import { useAuthStore } from '../stores/authStore'
import toast from 'react-hot-toast'

function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  const { login, loading, error } = useAuthStore()

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!email || !password) {
      toast.error('Ingresa email y contraseña')
      return
    }

    const result = await login(email, password)

    if (result.success) {
      toast.success('Bienvenido al Developer Hub')
    } else {
      toast.error(result.error || 'Error de autenticación')
    }
  }

  return (
    <div className="login-page">
      <form className="login-form" onSubmit={handleSubmit}>
        <h2>Iniciar Sesión</h2>
        <p className="login-subtitle">Accede al portal de desarrollo</p>

        <div className="form-group">
          <label htmlFor="email">
            <i className="fas fa-envelope"></i>
            Email
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="developer@alqvimia.com"
            autoComplete="email"
          />
        </div>

        <div className="form-group">
          <label htmlFor="password">
            <i className="fas fa-lock"></i>
            Contraseña
          </label>
          <div className="password-input">
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              autoComplete="current-password"
            />
            <button
              type="button"
              className="toggle-password"
              onClick={() => setShowPassword(!showPassword)}
            >
              <i className={`fas ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
            </button>
          </div>
        </div>

        {error && (
          <div className="form-error">
            <i className="fas fa-exclamation-circle"></i>
            {error}
          </div>
        )}

        <button type="submit" className="login-btn" disabled={loading}>
          {loading ? (
            <>
              <i className="fas fa-spinner fa-spin"></i>
              Autenticando...
            </>
          ) : (
            <>
              <i className="fas fa-sign-in-alt"></i>
              Ingresar
            </>
          )}
        </button>

        <div className="login-help">
          <p>Credenciales de prueba:</p>
          <code>developer@alqvimia.com</code>
          <code>senior@alqvimia.com</code>
        </div>
      </form>
    </div>
  )
}

export default LoginPage
