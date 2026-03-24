import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // Fallback vers index.html pour les routes React Router (refresh sur /create, etc.)
  appType: 'spa',
})
