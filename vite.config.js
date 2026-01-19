import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig(({ mode }) => {
  // Cargar variables de entorno desde .env en la raiz
  const env = loadEnv(mode, process.cwd(), '')

  const VITE_PORT = parseInt(env.VITE_PORT) || 4200
  const BACKEND_PORT = parseInt(env.BACKEND_PORT) || 4000

  // En Docker, usar el nombre del servicio backend; localmente usar localhost
  const BACKEND_HOST = env.VITE_BACKEND_HOST || 'localhost'
  const backendTarget = `http://${BACKEND_HOST}:${BACKEND_PORT}`

  return {
    plugins: [react()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
        '@components': path.resolve(__dirname, './src/components'),
        '@hooks': path.resolve(__dirname, './src/hooks'),
        '@context': path.resolve(__dirname, './src/context'),
        '@stores': path.resolve(__dirname, './src/stores'),
        '@services': path.resolve(__dirname, './src/services'),
        '@utils': path.resolve(__dirname, './src/utils'),
        '@assets': path.resolve(__dirname, './src/assets')
      }
    },
    define: {
      'import.meta.env.VITE_BACKEND_URL': JSON.stringify(`http://localhost:${BACKEND_PORT}`)
    },
    server: {
      port: VITE_PORT,
      proxy: {
        '/api': {
          target: backendTarget,
          changeOrigin: true
        },
        '/socket.io': {
          target: backendTarget,
          ws: true
        }
      }
    }
  }
})
