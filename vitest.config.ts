import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Deliberately separate from vite.config.ts — the crx plugin there expects
// a real extension build context (manifest, service worker entry) that
// has no meaning under Vitest, so tests get their own minimal config.
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: { '@': '/src' },
  },
  test: {
    environment: 'node',
  },
})
