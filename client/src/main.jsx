import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { BrowserRouter } from "react-router-dom";
import { EventProvider } from './context/EventContext.jsx';
import { AuthProvider } from './context/AuthContext.jsx';
import {VendorProvider} from './vendor/context/VendorContext'
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <EventProvider>
        <AuthProvider>
          <VendorProvider> <App /> </VendorProvider>
          
        </AuthProvider>
      </EventProvider>
    </BrowserRouter>
  </StrictMode>,
)
