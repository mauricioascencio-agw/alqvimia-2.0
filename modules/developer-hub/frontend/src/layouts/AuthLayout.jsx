import { Outlet } from 'react-router-dom'

function AuthLayout() {
  return (
    <div className="auth-layout">
      <div className="auth-background">
        <div className="code-pattern"></div>
      </div>

      <div className="auth-container">
        <div className="auth-brand">
          <i className="fas fa-code"></i>
          <h1>Developer Hub</h1>
          <p>Portal de desarrollo Alqvimia RPA</p>
        </div>

        <div className="auth-content">
          <Outlet />
        </div>

        <div className="auth-footer">
          <p>&copy; 2024 Alqvimia. Todos los derechos reservados.</p>
        </div>
      </div>
    </div>
  )
}

export default AuthLayout
