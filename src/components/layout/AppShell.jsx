import { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { useMascot } from '../../contexts/MascotContext';
import Sidebar from './Sidebar';
import Topbar from './Topbar';

export default function AppShell() {
  const location = useLocation();
  const mascot = useMascot();
  const route = location.pathname.replace(/^\//, '') || 'dashboard';

  // Espelha Router.renderCurrent() do original: a cada troca de rota (exceto
  // "jogo"), o mascote dá uma dica contextual da tela atual.
  useEffect(() => {
    if (route !== 'jogo') mascot.idleTip(route);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [route]);

  return (
    <section id="app-screen" className="screen">
      <Sidebar />
      <div className="main-area">
        <Topbar />
        <main id="view-container" className="view-container view-fade-in" key={location.pathname}>
          <Outlet />
        </main>
      </div>
    </section>
  );
}
