import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { PracticeProvider } from './context/PracticeContext'
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <PracticeProvider>
      <App />
    </PracticeProvider>
  </StrictMode>,
)
