import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { apiUrl } from './api.config'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  define: {
    'process.env.API_URL': JSON.stringify(apiUrl),
  },
  resolve: {
    alias: {
      'react-slick': path.resolve(__dirname, 'node_modules/react-slick'),
      'slick-carousel': path.resolve(__dirname, 'node_modules/slick-carousel')
    }
  },
  plugins: [react()],
  server: {
    host: true,
    port: process.env.FRONTEND_PORT || 3000,
  },
})
