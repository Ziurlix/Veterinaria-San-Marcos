import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import { AppProvider } from './context/AppContext.jsx'; // <-- Importamos el Proveedor
import './assets/estilos.css';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    {/* Envolvemos App con el proveedor para dar acceso global */}
    <AppProvider>
      <App />
    </AppProvider>
  </StrictMode>,
);