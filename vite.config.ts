import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  resolve: {
    tsconfigPaths: true,
  },
  server: {
    port: 3000,
    host: true, // Expose ke jaringan lokal (http://192.168.100.21:3000)
  },
})
