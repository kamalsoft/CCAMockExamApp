import { defineConfig } from '@playwright/test'

// Own port so tests never reuse a developer's `npm run dev` server on 5173.
const url = 'http://localhost:5174'

export default defineConfig({
  testDir: 'tests/e2e',
  use: { baseURL: url },
  webServer: {
    command: 'npm run dev -- --port 5174 --strictPort',
    url,
    reuseExistingServer: !process.env.CI,
  },
})
