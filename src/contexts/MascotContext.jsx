import { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react';

export const POSES = {
  neutro: '/assets/mascot/reqi-neutro.png',
  confuso: '/assets/mascot/reqi-confuso.png',
  empolgado: '/assets/mascot/reqi-empolgado.png',
  pensativo: '/assets/mascot/reqi-pensativo.png',
  comemorando: '/assets/mascot/reqi-comemorando.png',
  acenando: '/assets/mascot/reqi-acenando.png',
  triste: '/assets/mascot/reqi-triste.png',
  surpreso: '/assets/mascot/reqi-surpreso.png',
};

const TIPS = {
  dashboard: [
    'Confira seus números por aqui e veja como está sua evolução.',
    'Quer subir de rank? Bora jogar uma partida!',
    'Dica: sequências de acertos aumentam seu multiplicador de pontos.',
  ],
  jogo: [
    'Escolha um mundo e arraste os requisitos pra caixa certa.',
    'Combos de acertos valem mais pontos — mas um erro zera a sequência.',
    'Ficou em dúvida? Use o power-up de dica.',
  ],
  requisitos: [
    'Aqui você organiza os requisitos de cada mundo.',
    'Você pode criar novos mundos e requisitos por aqui também.',
  ],
  relatorios: [
    'Olha só sua evolução ao longo das partidas.',
    'Cada conquista desbloqueada fica guardada pra sempre no seu perfil.',
  ],
  cargos: [
    'Suba de cargo jogando pra ganhar mais cargas de power-up.',
    'Cada cargo novo é uma prova de que você manja de requisitos.',
  ],
};
const FALLBACK_TIPS = [
  'Precisa de ajuda? Explore o menu lateral.',
  'Toda consultoria começa com um bom requisito bem classificado.',
  'Continue jogando pra subir de cargo!',
];

const MascotContext = createContext(null);

export function MascotProvider({ children }) {
  const [visible, setVisible] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [pose, setPoseState] = useState('neutro');
  const [bubbleText, setBubbleText] = useState('');
  const [bounceKey, setBounceKey] = useState(0);
  const hideTimer = useRef(null);
  const collapsedRef = useRef(collapsed);
  collapsedRef.current = collapsed;

  const show = useCallback(() => setVisible(true), []);
  const hide = useCallback(() => setVisible(false), []);

  const setPose = useCallback((p) => {
    setPoseState(POSES[p] ? p : 'neutro');
    setBounceKey(k => k + 1);
  }, []);

  const toggleCollapse = useCallback((force) => {
    const next = typeof force === 'boolean' ? force : !collapsedRef.current;
    setCollapsed(next);
    if (next) {
      clearTimeout(hideTimer.current);
      setBubbleText('');
    }
  }, []);

  const say = useCallback((text, p = 'neutro', durationMs = 3200) => {
    if (collapsedRef.current) return;
    setVisible(true);
    setPose(p);
    setBubbleText(text);
    clearTimeout(hideTimer.current);
    if (durationMs > 0) {
      hideTimer.current = setTimeout(() => setBubbleText(''), durationMs);
    }
  }, [setPose]);

  const idleTip = useCallback((viewName) => {
    const list = TIPS[viewName] || FALLBACK_TIPS;
    const text = list[Math.floor(Math.random() * list.length)];
    say(text, 'neutro', 4200);
  }, [say]);

  const value = useMemo(() => ({
    visible, collapsed, pose, poseSrc: POSES[pose] || POSES.neutro, bubbleText, bounceKey,
    show, hide, setPose, say, idleTip, toggleCollapse, POSES,
  }), [visible, collapsed, pose, bubbleText, bounceKey, show, hide, setPose, say, idleTip, toggleCollapse]);

  return <MascotContext.Provider value={value}>{children}</MascotContext.Provider>;
}

export function useMascot() {
  const ctx = useContext(MascotContext);
  if (!ctx) throw new Error('useMascot precisa estar dentro de <MascotProvider>');
  return ctx;
}
