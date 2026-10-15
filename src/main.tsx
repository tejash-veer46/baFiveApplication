import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import { AuthProvider } from './context/auth'
import { SummaryProvider, ThemeProvider, ToastProvider, WakingBanner } from './context/ui'
import { warmUp } from './api'
import './styles/global.css'
import './styles/components.css'

warmUp()

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <ThemeProvider>
        <ToastProvider>
          <AuthProvider>
            <SummaryProvider>
              <App />
              <WakingBanner />
            </SummaryProvider>
          </AuthProvider>
        </ToastProvider>
      </ThemeProvider>
    </BrowserRouter>
  </React.StrictMode>,
)
