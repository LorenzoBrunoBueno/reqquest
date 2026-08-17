import { useEffect, useState } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import { useMascot } from './contexts/MascotContext';
import IconSprite from './components/layout/IconSprite';
import AppShell from './components/layout/AppShell';
import MascotWidget from './components/mascot/MascotWidget';
import WelcomeOverlay from './components/WelcomeOverlay';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import GamePage from './pages/GamePage';
import RequisitosPage from './pages/RequisitosPage';
import RelatoriosPage from './pages/RelatoriosPage';
import CargosPage from './pages/CargosPage';
import GuiaPage from './pages/GuiaPage';

export default function App() {
  const { usuario, loading } = useAuth();
  const mascot = useMascot();
  const [showWelcome, setShowWelcome] = useState(false);

  // Sessão já ativa ao abrir o app (localStorage já tinha usuário): mostra o
  // mascote flutuante direto, sem overlay de boas-vindas. Sem sessão: mascote
  // some. Espelha `if (Auth.getUsuario()) goToApp(false); else Mascot.hide();`
  useEffect(() => {
    if (!usuario) { mascot.hide(); return; }
    if (!showWelcome) mascot.show();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [usuario]);

  return (
    <>
      <IconSprite />
      {loading ? (
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
          Carregando...
        </div>
      ) : !usuario ? (
        <LoginPage onLoggedIn={() => setShowWelcome(true)} />
      ) : (
        <>
          <Routes>
            <Route element={<AppShell />}>
              <Route index element={<Navigate to="/dashboard" replace />} />
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/jogo" element={<GamePage />} />
              <Route path="/requisitos" element={<RequisitosPage />} />
              <Route path="/relatorios" element={<RelatoriosPage />} />
              <Route path="/cargos" element={<CargosPage />} />
              <Route path="/guia" element={<GuiaPage />} />
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Route>
          </Routes>
          {showWelcome && <WelcomeOverlay onDismiss={() => setShowWelcome(false)} />}
          <MascotWidget />
        </>
      )}
    </>
  );
}
