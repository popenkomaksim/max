import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Served from a custom domain at the root, so assets resolve relative to "/".
export default defineConfig({
  plugins: [react()],
  base: '/',
})
