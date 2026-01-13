/**
 * AuthContext - Contexto de autenticación
 * Maneja el estado de login, usuario y token
 */

import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { api } from '../services/api'

const AuthContext = createContext(null)

// Claves de localStorage
const TOKEN_KEY = 'alqvimia_token'
const USER_KEY = 'alqvimia_user'

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Cargar sesión guardada al iniciar
  useEffect(() => {
    const loadSession = async () => {
      try {
        const savedToken = localStorage.getItem(TOKEN_KEY)
        const savedUser = localStorage.getItem(USER_KEY)

        if (savedToken && savedUser) {
          setToken(savedToken)
          setUser(JSON.parse(savedUser))

          // Verificar que el token sigue siendo válido
          try {
            const response = await fetch(`${import.meta.env.VITE_BACKEND_URL || 'http://localhost:4000'}/api/auth/me`, {
              headers: {
                'Authorization': `Bearer ${savedToken}`
              }
            })

            if (response.ok) {
              const data = await response.json()
              if (data.success) {
                setUser(data.data.user)
              }
            } else {
              // Token inválido, limpiar sesión
              logout()
            }
          } catch (err) {
            console.log('[Auth] No se pudo verificar token, manteniendo sesión local')
          }
        }
      } catch (err) {
        console.error('[Auth] Error cargando sesión:', err)
      } finally {
        setLoading(false)
      }
    }

    loadSession()
  }, [])

  // Login
  const login = useCallback(async (email, password) => {
    setError(null)
    setLoading(true)

    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL || 'http://localhost:4000'}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      })

      const data = await response.json()

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Error al iniciar sesión')
      }

      // Guardar token y usuario
      localStorage.setItem(TOKEN_KEY, data.data.token)
      localStorage.setItem(USER_KEY, JSON.stringify(data.data.user))

      setToken(data.data.token)
      setUser(data.data.user)

      return { success: true, user: data.data.user }
    } catch (err) {
      setError(err.message)
      return { success: false, error: err.message }
    } finally {
      setLoading(false)
    }
  }, [])

  // Registro
  const register = useCallback(async (nombre, email, password) => {
    setError(null)
    setLoading(true)

    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL || 'http://localhost:4000'}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nombre, email, password })
      })

      const data = await response.json()

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Error al registrar')
      }

      // Guardar token y usuario
      localStorage.setItem(TOKEN_KEY, data.data.token)
      localStorage.setItem(USER_KEY, JSON.stringify(data.data.user))

      setToken(data.data.token)
      setUser(data.data.user)

      return { success: true, user: data.data.user }
    } catch (err) {
      setError(err.message)
      return { success: false, error: err.message }
    } finally {
      setLoading(false)
    }
  }, [])

  // Logout
  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(USER_KEY)
    setToken(null)
    setUser(null)
    setError(null)
  }, [])

  // Actualizar perfil
  const updateProfile = useCallback(async (data) => {
    if (!token) return { success: false, error: 'No autenticado' }

    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL || 'http://localhost:4000'}/api/users/${user.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(data)
      })

      const result = await response.json()

      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Error al actualizar perfil')
      }

      // Actualizar usuario local
      const updatedUser = { ...user, ...data }
      delete updatedUser.password // No guardar contraseña
      localStorage.setItem(USER_KEY, JSON.stringify(updatedUser))
      setUser(updatedUser)

      return { success: true }
    } catch (err) {
      return { success: false, error: err.message }
    }
  }, [token, user])

  // Cambiar contraseña
  const changePassword = useCallback(async (currentPassword, newPassword) => {
    if (!token) return { success: false, error: 'No autenticado' }

    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL || 'http://localhost:4000'}/api/auth/password`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ currentPassword, newPassword })
      })

      const result = await response.json()

      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Error al cambiar contraseña')
      }

      return { success: true }
    } catch (err) {
      return { success: false, error: err.message }
    }
  }, [token])

  // Helper para hacer peticiones autenticadas
  const authFetch = useCallback(async (url, options = {}) => {
    if (!token) throw new Error('No autenticado')

    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        ...options.headers
      }
    })

    // Si el token expiró, hacer logout
    if (response.status === 401) {
      logout()
      throw new Error('Sesión expirada')
    }

    return response
  }, [token, logout])

  const value = {
    user,
    token,
    loading,
    error,
    isAuthenticated: !!user && !!token,
    isAdmin: user?.rol === 'admin',
    login,
    register,
    logout,
    updateProfile,
    changePassword,
    authFetch
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth debe usarse dentro de AuthProvider')
  }
  return context
}

export default AuthContext
