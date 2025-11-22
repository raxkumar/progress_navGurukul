import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:5001',
        changeOrigin: true,
      },
      '/auth': {
        target: 'http://localhost:5001',
        changeOrigin: true,
      },
      '/management': {
        target: 'http://localhost:5001',
        changeOrigin: true,
      },
      '/student-stats': {
        target: 'http://localhost:5001',
        changeOrigin: true,
      },
      '/courses': {
        target: 'http://localhost:5001',
        changeOrigin: true,
      },
      '/enrollments': {
        target: 'http://localhost:5001',
        changeOrigin: true,
      },
      '/progress': {
        target: 'http://localhost:5001',
        changeOrigin: true,
      },
    },
  },
})
