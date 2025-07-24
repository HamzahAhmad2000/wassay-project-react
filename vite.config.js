import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { fileURLToPath } from 'url'
import path from 'path'

// Convert import.meta.url to __dirname equivalent
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },

  },
  server: {
    proxy: {
      '/api': {
        //target: 'http://localhost:8080',
        // target: 'https://1549-103-174-5-162.ngrok-free.app',
        target:"https://c21d826e7710.ngrok-free.app",
        changeOrigin: true,
      },
      '/media': {
        //target: 'http://localhost:8080',
        // target: 'https://1549-103-174-5-162.ngrok-free.app',
        target:"https://c21d826e7710.ngrok-free.app",
        changeOrigin: true,
      },
      
    },
  },
})
