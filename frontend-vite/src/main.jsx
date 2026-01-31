import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { HashRouter } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'

createRoot(document.getElementById('root')).render(
    <StrictMode>
        <HashRouter>
            <App />
            <Toaster />
        </HashRouter>
    </StrictMode>,
)