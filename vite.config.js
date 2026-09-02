import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Repo is served at https://<user>.github.io/max/, so assets must resolve
// relative to that subpath rather than the domain root.
export default defineConfig({
  plugins: [react()],
  base: '/max/',
})
