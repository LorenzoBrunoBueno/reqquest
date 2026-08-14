/**
 * mascot.js
 * Controlador do widget flutuante do Reqi (mascote). Troca de pose, mostra
 * balão de fala contextual, pode ser recolhido pelo usuário, e sabe "falar"
 * (efeito de digitação + voz do navegador, respeitando o mudo do site).
 */

const Mascot = (() => {
  const POSES = {
    neutro: 'assets/mascot/reqi-neutro.png',
    confuso: 'assets/mascot/reqi-confuso.png',
    empolgado: 'assets/mascot/reqi-empolgado.png',
    pensativo: 'assets/mascot/reqi-pensativo.png',
    comemorando: 'assets/mascot/reqi-comemorando.png',
    acenando: 'assets/mascot/reqi-acenando.png',
    triste: 'assets/mascot/reqi-triste.png',
    surpreso: 'assets/mascot/reqi-surpreso.png',
  };

  let widget, img, bubble, toggleBtn;
  let hideTimer = null;
  let collapsed = false;

  function el() {
    if (!widget) {
      widget = document.getElementById('mascot-widget');
      img = document.getElementById('mascot-img');
      bubble = document.getElementById('mascot-bubble');
      toggleBtn = document.getElementById('mascot-toggle');
      toggleBtn.addEventListener('click', (e) => { e.stopPropagation(); toggleCollapse(); });
    }
    return widget;
  }

  function show() { el().classList.remove('hidden'); }
  function hide() { el().classList.add('hidden'); }

  function toggleCollapse(force) {
    el();
    collapsed = typeof force === 'boolean' ? force : !collapsed;
    widget.classList.toggle('collapsed', collapsed);
    toggleBtn.title = collapsed ? 'Chamar o Reqi' : 'Recolher o Reqi';
    if (collapsed) { clearTimeout(hideTimer); bubble.textContent = ''; }
  }

  function setPose(pose) {
    el();
    img.src = POSES[pose] || POSES.neutro;
    img.classList.remove('bounce');
    void img.offsetWidth; // reflow pra reiniciar a animação
    img.classList.add('bounce');
  }

  function say(text, pose = 'neutro', durationMs = 3200) {
    el();
    if (collapsed) return; // usuário pediu pra ele ficar quieto
    show();
    setPose(pose);
    bubble.textContent = text;
    clearTimeout(hideTimer);
    if (durationMs > 0) {
      hideTimer = setTimeout(() => { bubble.textContent = ''; }, durationMs);
    }
  }

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

  function idleTip(viewName) {
    const list = TIPS[viewName] || FALLBACK_TIPS;
    const text = list[Math.floor(Math.random() * list.length)];
    say(text, 'neutro', 4200);
  }

  // -----------------------------------------------------------------------
  // Efeito de "fala": digitação progressiva (sem voz — só texto animado).
  // -----------------------------------------------------------------------
  function typeText(target, text, { speed = 22, onDone } = {}) {
    target.textContent = '';
    let i = 0;
    clearInterval(typeText._timer);
    typeText._timer = setInterval(() => {
      target.textContent += text[i];
      i++;
      if (i >= text.length) {
        clearInterval(typeText._timer);
        if (onDone) onDone();
      }
    }, speed);
  }

  return { show, hide, setPose, say, idleTip, toggleCollapse, typeText, POSES };
})();
