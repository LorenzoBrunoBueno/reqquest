import { useLocation } from 'react-router-dom';
import { useSound } from '../../contexts/SoundContext';
import ProfileChip from './ProfileChip';

const TITLES = {
  dashboard: 'Dashboard',
  jogo: 'Jogar',
  requisitos: 'Requisitos',
  relatorios: 'Relatórios',
  cargos: 'Cargos',
  guia: 'Guia de Requisitos',
};

export default function Topbar() {
  const location = useLocation();
  const sound = useSound();
  const route = location.pathname.replace(/^\//, '') || 'dashboard';
  const title = TITLES[route] || 'Dashboard';

  return (
    <header className="topbar">
      <div className="topbar-title" id="view-title">{title}</div>
      <div className="topbar-actions">
        <button
          className={`icon-btn${sound.enabled ? '' : ' muted'}`}
          id="sound-toggle"
          title={sound.enabled ? 'Desligar som' : 'Ligar som'}
          onClick={() => {
            const next = !sound.enabled;
            sound.setEnabled(next);
            if (next) sound.click();
          }}
        >
          <svg width="20" height="20" id="sound-icon"><use href={sound.enabled ? '#ic-sound-on' : '#ic-sound-off'} /></svg>
        </button>
        <ProfileChip />
      </div>
    </header>
  );
}
