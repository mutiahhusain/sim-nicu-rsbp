import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { DarkModeProvider } from './context/DarkMode'
import { MasterProvider } from './context/Master'
import { PatientProvider } from './context/PatientContext'
import { AuthProvider } from './context/AuthContext'
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <DarkModeProvider>
        <AuthProvider>
          <MasterProvider>
            <PatientProvider>
              <App />
            </PatientProvider>
          </MasterProvider>
        </AuthProvider>
      </DarkModeProvider>
    </BrowserRouter>
  </StrictMode>,
)
