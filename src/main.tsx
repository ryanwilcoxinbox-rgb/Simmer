import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import './theme.css'
import { App } from './App'
import { setupAutoUpdate } from './platform/appUpdate'
import { loadSettings } from './platform/settings'

// Apply the saved palette before React paints its first screen.
const appearance = loadSettings().appearance
document.documentElement.dataset.theme = appearance === 'system'
  ? window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  : appearance

// Registers the service worker and keeps it hunting for new versions.
setupAutoUpdate()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
