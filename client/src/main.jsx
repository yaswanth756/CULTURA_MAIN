import { StrictMode, useRef, useEffect } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { BrowserRouter } from "react-router-dom";
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

// Ref guard to prevent double rendering in StrictMode
const AppWithRefGuard = () => {
  const hasRenderedRef = useRef(false);
  
  useEffect(() => {
    if (hasRenderedRef.current) return;
    hasRenderedRef.current = true;
  }, []);

  return (
    <BrowserRouter>
      <App />
      <ToastContainer position="top-right" autoClose={3000} newestOnTop />
    </BrowserRouter>
  );
};

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AppWithRefGuard />
  </StrictMode>,
);
