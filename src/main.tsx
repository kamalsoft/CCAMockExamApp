import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { ThemeProvider } from './contexts/ThemeContext.tsx'

// Initialize theme before rendering
const initializeTheme = () => {
  try {
    const stored = localStorage.getItem('cca-theme-v1')
    if (stored === 'dark') {
      document.documentElement.classList.add('dark')
    }
  } catch {
    // localStorage unavailable, use system preference
    if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      document.documentElement.classList.add('dark')
    }
  }
}

initializeTheme()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider>
      <App />
    </ThemeProvider>
  </StrictMode>,
)
