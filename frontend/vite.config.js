/// <reference types="vitest/config" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.js',
    css: true,
    // Unit/component tests only — Playwright e2e specs live under e2e/ and run separately.
    exclude: ['**/node_modules/**', '**/dist/**', 'e2e/**'],
  },
})
