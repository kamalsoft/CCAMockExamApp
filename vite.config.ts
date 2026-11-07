import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vitest/config'
import { contentPlugin } from './scripts/build-index.ts'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss(), contentPlugin()],
  test: {
    include: ['tests/unit/**/*.test.ts'],
  },
})
