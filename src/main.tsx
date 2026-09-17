import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { App } from './App'
import { setupAutoUpdate } from './platform/appUpdate'

// Registers the service worker and keeps it hunting for new versions.
setupAutoUpdate()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
