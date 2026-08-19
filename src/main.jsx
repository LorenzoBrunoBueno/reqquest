import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { HashRouter } from 'react-router-dom';
import App from './App.jsx';
import { ToastProvider } from './contexts/ToastContext';
import { ModalProvider } from './contexts/ModalContext';
import { SoundProvider } from './contexts/SoundContext';
import { AuthProvider } from './contexts/AuthContext';
import { PlayerProgressProvider } from './contexts/PlayerProgressContext';
import { MascotProvider } from './contexts/MascotContext';
import './styles/index.css';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <HashRouter>
      <ToastProvider>
        <SoundProvider>
          <AuthProvider>
            <PlayerProgressProvider>
              <MascotProvider>
                <ModalProvider>
                  <App />
                </ModalProvider>
              </MascotProvider>
            </PlayerProgressProvider>
          </AuthProvider>
        </SoundProvider>
      </ToastProvider>
    </HashRouter>
  </StrictMode>
);
