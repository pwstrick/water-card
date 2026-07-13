import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import './index.css'
import { isMobileDevice } from './utils/device'

// Tailwind 的响应式断点无法识别 UC 桌面模式等触摸设备，启动时补充设备能力类。
if (isMobileDevice()) {
  document.documentElement.classList.add('mobile-device')
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
