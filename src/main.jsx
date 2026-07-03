import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import './index.css'
import { isMobileDevice } from './utils/device'

if (isMobileDevice()) {
  document.documentElement.classList.add('mobile-device')
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
