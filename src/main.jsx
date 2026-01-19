import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import { SocketProvider } from './context/SocketContext'
import { LanguageProvider } from './context/LanguageContext'
import { AuthProvider } from './context/AuthContext'
import './index.css'

// Aplicar tema guardado al iniciar
const savedTheme = localStorage.getItem('alqvimia-theme') || 'midnight-blue'
document.documentElement.setAttribute('data-theme', savedTheme)

// Aplicar idioma guardado al iniciar
const savedLanguage = localStorage.getItem('alqvimia_language') || 'es'
document.documentElement.lang = savedLanguage

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter
      future={{
        v7_startTransition: true,
        v7_relativeSplatPath: true
      }}
    >
      <LanguageProvider>
        <AuthProvider>
          <SocketProvider>
            <App />
          </SocketProvider>
        </AuthProvider>
      </LanguageProvider>
    </BrowserRouter>
  </React.StrictMode>
)
