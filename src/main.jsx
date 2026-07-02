import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import './index.css'

const mobileUserAgent = /Android|iPhone|iPad|iPod|Mobile|UCWEB|UCBrowser/i.test(navigator.userAgent)
// UC may spoof a desktop pointer/UA for LAN IPs when “电脑版网页” is enabled.
// Touch capability is more stable and keeps the mobile layout consistent for IP and domain access.
const touchCapableDevice = navigator.maxTouchPoints > 0 || 'ontouchstart' in window
const compactViewport = window.innerWidth <= 768 || window.screen.width <= 768
const highDensityPortraitScreen = window.innerHeight > window.innerWidth && window.devicePixelRatio >= 1.5

if (mobileUserAgent || touchCapableDevice || compactViewport || highDensityPortraitScreen) {
  document.documentElement.classList.add('mobile-device')
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
