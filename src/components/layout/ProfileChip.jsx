import { useEffect, useRef, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useMascot } from '../../contexts/MascotContext';
import { usePlayerProgress } from '../../contexts/PlayerProgressContext';
import { XP_PER_LEVEL } from '../../data/db';

export default function ProfileChip() {
  const { usuario, initials, logout } = useAuth();
  const { level, xpIntoLevel, rank } = usePlayerProgress();
  const mascot = useMascot();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    function onDocClick() { setOpen(false); }
    document.addEventListener('click', onDocClick);
    return () => document.removeEventListener('click', onDocClick);
  }, []);

  if (!usuario) return null;

  const initialsText = initials(usuario.nome);

  function handleLogout() {
    logout();
    mascot.hide();
    window.location.hash = '';
  }

  return (
    <div
      className="profile-chip"
      id="profile-chip"
      ref={ref}
      onClick={(e) => { e.stopPropagation(); setOpen((v) => !v); }}
    >
      <span className="profile-avatar" id="profile-avatar">{initialsText}</span>
      <span className="profile-info">
        <span className="profile-name" id="profile-name">{usuario.nome.split(' ')[0]}</span>
        <span className="profile-rank" id="profile-rank">{rank.title.split(' ')[0]} · Nv. {level}</span>
      </span>
      <span className="profile-caret"><svg width="12" height="12"><use href="#ic-chevron-down" /></svg></span>

      <div className={`profile-dropdown${open ? '' : ' hidden'}`} id="profile-dropdown">
        <div className="profile-dropdown-header">
          <span className="profile-avatar lg" id="profile-avatar-lg">{initialsText}</span>
          <div>
            <div className="profile-name-lg" id="profile-name-lg">{usuario.nome}</div>
            <div className="profile-rank-lg" id="profile-rank-lg">{rank.title} · Nível {level}</div>
          </div>
        </div>
        <div className="profile-dropdown-body">
          <div className="profile-xp-row">
            <div className="xp-bar-track"><div className="xp-bar-fill" id="profile-xp-fill" style={{ width: `${xpIntoLevel}%` }}></div></div>
            <span id="profile-xp-label">{xpIntoLevel} / {XP_PER_LEVEL} XP</span>
          </div>
          <div className="profile-info-block">
            <p className="profile-info-title"><svg width="12" height="12"><use href="#ic-user" /></svg> Minhas informações</p>
            <div className="profile-info-row"><svg width="14" height="14"><use href="#ic-phone" /></svg><span id="profile-telefone">{usuario.telefone || '—'}</span></div>
            <div className="profile-info-row"><svg width="14" height="14"><use href="#ic-mail" /></svg><span id="profile-email">{usuario.email || '—'}</span></div>
          </div>
          <button className="btn btn-danger btn-block" id="logout-btn" onClick={handleLogout}>
            <svg width="15" height="15" style={{ verticalAlign: -3, marginRight: 6 }}><use href="#ic-logout" /></svg>Sair
          </button>
        </div>
      </div>
    </div>
  );
}
