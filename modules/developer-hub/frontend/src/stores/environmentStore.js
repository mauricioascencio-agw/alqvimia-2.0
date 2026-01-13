import { create } from 'zustand'
import api from '../services/api'

export const useEnvironmentStore = create((set, get) => ({
  environments: [],
  currentEnvironment: null,
  loading: false,
  error: null,

  fetchEnvironments: async () => {
    try {
      set({ loading: true })
      const response = await api.get('/environments')

      const envs = response.data
      const current = envs.find(e => e.isCurrent) || envs[0]

      set({
        environments: envs,
        currentEnvironment: current,
        loading: false
      })
    } catch (error) {
      // Default environments if API fails
      const defaultEnvs = [
        { id: 'dev', name: 'Development', shortName: 'DEV', color: '#22c55e', isCurrent: true },
        { id: 'qa', name: 'Quality Assurance', shortName: 'QA', color: '#f59e0b', isCurrent: false },
        { id: 'prod', name: 'Production', shortName: 'PROD', color: '#ef4444', isCurrent: false },
        { id: 'test', name: 'Test', shortName: 'TEST', color: '#8b5cf6', isCurrent: false }
      ]

      set({
        environments: defaultEnvs,
        currentEnvironment: defaultEnvs[0],
        loading: false
      })
    }
  },

  setCurrentEnvironment: (envId) => {
    const { environments } = get()
    const env = environments.find(e => e.id === envId)

    if (env) {
      set({ currentEnvironment: env })
      // Update API default header
      api.defaults.headers.common['X-Environment'] = envId
    }
  },

  getEnvironmentColor: (envId) => {
    const { environments } = get()
    const env = environments.find(e => e.id === envId)
    return env?.color || '#64748b'
  },

  getEnvironmentName: (envId) => {
    const { environments } = get()
    const env = environments.find(e => e.id === envId)
    return env?.shortName || envId?.toUpperCase()
  }
}))
