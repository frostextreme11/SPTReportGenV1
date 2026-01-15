import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { ThemeProvider } from './context/ThemeContext.jsx'
import { FormProvider } from './context/FormContext.jsx'

createRoot(document.getElementById('root')).render(
    <StrictMode>
        <ThemeProvider>
            <FormProvider>
                <App />
            </FormProvider>
        </ThemeProvider>
    </StrictMode>,
)
