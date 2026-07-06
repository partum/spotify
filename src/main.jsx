import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App.jsx'
import CallbackPage from './components/CallbackPage.jsx'

function Router() {
  const path = window.location.pathname
  
  if (path === '/callback') {
    return <CallbackPage />
  }
  
  return <App />
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <Router />
    </BrowserRouter>
  </StrictMode>,
)
