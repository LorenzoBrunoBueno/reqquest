import { createContext, useContext, useMemo, useState } from 'react';
import * as sound from '../data/sound';

const SoundContext = createContext(null);

export function SoundProvider({ children }) {
  const [enabled, setEnabledState] = useState(() => {
    const muted = localStorage.getItem('rq_sound_muted') === 'true';
    sound.setEnabled(!muted);
    return !muted;
  });

  const value = useMemo(() => ({
    enabled,
    setEnabled(v) {
      sound.setEnabled(v);
      localStorage.setItem('rq_sound_muted', String(!v));
      setEnabledState(v);
    },
    acerto: sound.acerto,
    erro: sound.erro,
    levelUp: sound.levelUp,
    powerUp: sound.powerUp,
    badge: sound.badge,
    click: sound.click,
    countdown: sound.countdown,
    gameOver: sound.gameOver,
    startAmbient: sound.startAmbient,
    stopAmbient: sound.stopAmbient,
  }), [enabled]);

  return <SoundContext.Provider value={value}>{children}</SoundContext.Provider>;
}

export function useSound() {
  const ctx = useContext(SoundContext);
  if (!ctx) throw new Error('useSound precisa estar dentro de <SoundProvider>');
  return ctx;
}
