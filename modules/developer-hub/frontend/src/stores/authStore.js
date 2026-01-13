import { create } from 'zustand'
import api from '../services/api'

export const useAuthStore = create((set, get) => ({
  user: null,
  token: localStorage.getItem('dev-hub-token'),
  isAuthenticated: false,
  loading: true,
  error: null,

  login: async (email, password) => {
    try {
      set({ loading: true, error: null })

      const response = await api.post('/auth/login', { email, password })
      const { token, user } = response.data

      localStorage.setItem('dev-hub-token', token)
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`

      set({
        user,
        token,
        isAuthenticated: true,
        loading: false
      })

      return { success: true }
    } catch (error) {
      set({
        error: error.response?.data?.error || 'Error de autenticación',
        loading: false
      })
      return { success: false, error: error.response?.data?.error }
    }
  },

  logout: () => {
    localStorage.removeItem('dev-hub-token')
    delete api.defaults.headers.common['Authorization']

    set({
      user: null,
      token: null,
      isAuthenticated: false,
      error: null
    })
  },

  checkAuth: async () => {
    const token = localStorage.getItem('dev-hub-token')

    if (!token) {
      set({ loading: false, isAuthenticated: false })
      return
    }

    try {
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`
      const response = await api.get('/auth/me')

      set({
        user: response.data,
        token,
        isAuthenticated: true,
        loading: false
      })
    } catch (error) {
      localStorage.removeItem('dev-hub-token')
      delete api.defaults.headers.common['Authorization']

      set({
        user: null,
        token: null,
        isAuthenticated: false,
        loading: false
      })
    }
  },

  hasPermission: (permission) => {
    const { user } = get()
    if (!user) return false

    const permissions = user.permissions || []
    return permissions.includes('*') ||
      permissions.includes(permission) ||
      permissions.some(p => {
        if (p.endsWith(':*')) {
          return permission.startsWith(p.slice(0, -1))
        }
        return false
      })
  },

  hasEnvironmentAccess: (environment) => {
    const { user } = get()
    if (!user) return false

    const environments = user.environments || ['dev']
    return environments.includes(environment) || environments.includes('*')
  }
}))
