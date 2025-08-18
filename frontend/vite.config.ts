import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/ws': {
        target: 'http://localhost:3000', // donde corre tu server Node
        ws: true,                        // <— muy importante
        changeOrigin: true,
      },
    },
  },
})
