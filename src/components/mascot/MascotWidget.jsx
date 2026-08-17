import { useMascot } from '../../contexts/MascotContext';
import { useSound } from '../../contexts/SoundContext';
import { useLocation } from 'react-router-dom';

export default function MascotWidget() {
  const mascot = useMascot();
  const sound = useSound();
  const location = useLocation();

  if (!mascot.visible) return null;

  function handleClick() {
    sound.click();
    const route = location.pathname.replace(/^\//, '') || 'dashboard';
    mascot.idleTip(route);
  }

  return (
    <div className={`mascot-widget${mascot.collapsed ? ' collapsed' : ''}`} id="mascot-widget">
      <button
        id="mascot-toggle"
        className="mascot-toggle"
        title={mascot.collapsed ? 'Chamar o Reqi' : 'Recolher o Reqi'}
        onClick={(e) => { e.stopPropagation(); mascot.toggleCollapse(); }}
      >
        <svg width="15" height="15"><use href="#ic-collapse" /></svg>
      </button>
      {!mascot.collapsed && (
        <>
          <div className="mascot-bubble" id="mascot-bubble">{mascot.bubbleText}</div>
          <div className="mascot-glow"></div>
          <img
            key={mascot.bounceKey}
            id="mascot-img"
            className="bounce"
            src={mascot.poseSrc}
            alt="Reqi"
            style={{ cursor: 'pointer' }}
            onClick={handleClick}
          />
        </>
      )}
    </div>
  );
}
