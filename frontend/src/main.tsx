import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'

async function prepare() {
  // Start MSW browser worker only when VITE_USE_MSW === 'true' (local dev without backend)
  if (import.meta.env.VITE_USE_MSW === 'true') {
    const { worker } = await import('./mocks/browser')
    // Fallback race timeout to prevent infinite loading if Service Worker hangs
    await Promise.race([
      worker.start({ onUnhandledRequest: 'bypass' }),
      new Promise((resolve) => setTimeout(resolve, 1500)),
    ])
  }
}

prepare()
  .catch((err) => {
    console.error('MSW failed to start, rendering app anyway:', err)
  })
  .finally(() => {
    ReactDOM.createRoot(document.getElementById('root')!).render(
      <React.StrictMode>
        <App />
      </React.StrictMode>,
    )
  })
