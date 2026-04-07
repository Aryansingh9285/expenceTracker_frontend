import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './styles/modern-design.css'
import './styles/dashboard-modern.css'
import './styles/landing-modern.css'
import './styles/charts.css'
import './styles/auth.css'
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
