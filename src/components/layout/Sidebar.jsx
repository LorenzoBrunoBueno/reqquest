import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useModal } from '../../contexts/ModalContext';
import { useToast } from '../../contexts/ToastContext';
import { usePlayerProgress } from '../../contexts/PlayerProgressContext';
import { useSound } from '../../contexts/SoundContext';
import { useDarkMode } from '../../hooks/useDarkMode';
import { useSidebarCollapsed } from '../../hooks/useSidebarCollapsed';

const NAV_ITEMS = [
  { to: '/dashboard', icon: 'ic-nav-dashboard', label: 'Dashboard' },
  { to: '/jogo', icon: 'ic-nav-play', label: 'Jogar' },
  { to: '/requisitos', icon: 'ic-nav-list', label: 'Requisitos' },
  { to: '/relatorios', icon: 'ic-nav-chart', label: 'Relatórios' },
  { to: '/cargos', icon: 'ic-nav-rank', label: 'Cargos' },
  { to: '/guia', icon: 'ic-nav-guia', label: 'Guia de Requisitos' },
];

export default function Sidebar() {
  const [collapsed, toggleCollapsed] = useSidebarCollapsed();
  const [isDark, setIsDark] = useDarkMode();
  const { usuario } = useAuth();
  const { open, close } = useModal();
  const { showToast } = useToast();
  const { resetProgress } = usePlayerProgress();
  const sound = useSound();
  const navigate = useNavigate();

  function openNovaJornada() {
    open(
      <>
        <div className="modal-mascot">
          <img src="/assets/mascot/reqi-confuso.png" alt="Reqi" />
          <div><b>Tem certeza, {usuario ? usuario.nome.split(' ')[0] : ''}?</b></div>
        </div>
        <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>
          Isso vai reiniciar sua jornada: XP, nível, badges e histórico de partidas
          voltam a zero. Os temas e requisitos cadastrados continuam intactos.
        </p>
        <div className="modal-actions">
          <button className="btn btn-secondary" onClick={close}>Cancelar</button>
          <button
            className="btn btn-danger"
            onClick={async () => {
              try {
                await resetProgress();
                close();
                showToast('Jornada reiniciada! Vamos de novo.');
                navigate('/dashboard');
              } catch (err) {
                showToast(err.message || 'Não foi possível reiniciar a jornada.');
              }
            }}
          >
            <svg width="14" height="14"><use href="#ic-refresh" /></svg> Recomeçar jornada
          </button>
        </div>
      </>
    );
  }

  return (
    <aside className={`sidebar${collapsed ? ' collapsed' : ''}`} id="sidebar">
      <div className="sidebar-top">
        <div className="sidebar-brand">
          <span className="brand-mark"><img src="/assets/logo-symbol.png" alt="ReqQuest" /></span>
          <span className="brand-name">Req<span className="accent">Quest</span></span>
        </div>
        <button
          className="sidebar-toggle"
          id="sidebar-toggle"
          title="Recolher menu"
          aria-label="Recolher menu"
          aria-expanded={!collapsed}
          onClick={toggleCollapsed}
        >
          <span></span><span></span><span></span>
        </button>
      </div>
      <nav className="sidebar-nav">
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            data-route={item.to.slice(1)}
            className={({ isActive }) => (isActive ? 'active' : undefined)}
            onClick={() => sound.click()}
          >
            <svg width="20" height="20"><use href={`#${item.icon}`} /></svg>
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-bottom">
        <button id="nova-jornada-btn" className="sidebar-reset" onClick={openNovaJornada}>
          <svg width="16" height="16"><use href="#ic-refresh" /></svg><span>Nova Jornada</span>
        </button>
        <label className="theme-switch" title="Alternar modo claro/escuro">
          <span className="theme-switch-label" id="theme-switch-label">{isDark ? 'Modo claro' : 'Modo escuro'}</span>
          <span className="theme-switch-track">
            <input
              type="checkbox"
              id="dark-mode-toggle"
              checked={isDark}
              onChange={(e) => { setIsDark(e.target.checked); sound.click(); }}
            />
            <span className="theme-switch-thumb">
              <svg className="ic-sun-svg" width="12" height="12"><use href="#ic-sun" /></svg>
              <svg className="ic-moon-svg" width="12" height="12"><use href="#ic-moon" /></svg>
            </span>
          </span>
        </label>
      </div>
    </aside>
  );
}
