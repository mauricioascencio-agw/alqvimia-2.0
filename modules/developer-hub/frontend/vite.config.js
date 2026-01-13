import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const envConfig = {
  dev: {
    apiUrl: 'http://localhost:3003',
    wsUrl: 'ws://localhost:3003'
  },
  qa: {
    apiUrl: 'http://qa.developer.alqvimia.local:3003',
    wsUrl: 'ws://qa.developer.alqvimia.local:3003'
  },
  prod: {
    apiUrl: 'https://developer.alqvimia.com',
    wsUrl: 'wss://developer.alqvimia.com'
  }
}

const env = process.env.VITE_ENV || 'dev'

export default defineConfig({
  plugins: [react()],
  define: {
    'import.meta.env.VITE_API_URL': JSON.stringify(envConfig[env].apiUrl),
    'import.meta.env.VITE_WS_URL': JSON.stringify(envConfig[env].wsUrl),
    'import.meta.env.VITE_ENV': JSON.stringify(env)
  },
  server: {
    port: 5175,
    proxy: {
      '/api': {
        target: envConfig[env].apiUrl,
        changeOrigin: true
      }
    }
  },
  build: {
    outDir: 'dist',
    sourcemap: env !== 'prod'
  }
})
