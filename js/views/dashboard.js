/**
 * dashboard.js
 * RF04 - Dashboard com indicadores visuais.
 */

const DashboardView = (() => {
  function register() { Router.register('dashboard', 'Dashboard', render); }

  function render(container) {
    const temas = DB.getTemas();
    const requisitos = DB.getRequisitos();
    const partidas = DB.getPartidas();
    const progress = DB.getPlayerProgress();
    const funcionais = requisitos.filter(r => r.tipo === 'funcional').length;
    const naoFuncionais = requisitos.filter(r => r.tipo === 'nao-funcional').length;
    const melhorScore = partidas.reduce((max, p) => Math.max(max, p.score), 0);
    const usuario = Auth.getUsuario();
    const level = Math.floor(progress.xp / DB.XP_PER_LEVEL) + 1;
    const rank = DB.rankForLevel(level);
    const desbloqueadas = progress.badges.length;
    const pctBadges = Math.round((desbloqueadas / Badges.LIST.length) * 100);

    container.innerHTML = `
      <p style="color:var(--text-muted);margin-top:0;">
        Bem-vindo(a), <b>${usuario ? usuario.nome : ''}</b> — você é <b>${rank.title}</b> (nível ${level}).
        <a href="#/cargos" class="rank-link">Ver trilha de cargos</a>
      </p>

      <div class="cards-grid">
        <div class="stat-card"><span class="stat-icon-wrap wrap-blue"><svg class="stat-icon"><use href="#ic-worlds"/></svg></span><div><div class="stat-value">${temas.length}</div><div class="stat-label">Mundos disponíveis</div></div></div>
        <div class="stat-card"><span class="stat-icon-wrap wrap-green"><svg class="stat-icon"><use href="#ic-check"/></svg></span><div><div class="stat-value">${funcionais}</div><div class="stat-label">Requisitos Funcionais</div></div></div>
        <div class="stat-card"><span class="stat-icon-wrap wrap-orange"><svg class="stat-icon"><use href="#ic-gear"/></svg></span><div><div class="stat-value">${naoFuncionais}</div><div class="stat-label">Requisitos Não Funcionais</div></div></div>
        <div class="stat-card"><span class="stat-icon-wrap wrap-purple"><svg class="stat-icon"><use href="#ic-nav-play"/></svg></span><div><div class="stat-value">${partidas.length}</div><div class="stat-label">Partidas jogadas</div></div></div>
        <div class="stat-card"><span class="stat-icon-wrap wrap-gold"><svg class="stat-icon"><use href="#ic-trophy"/></svg></span><div><div class="stat-value">${melhorScore}</div><div class="stat-label">Melhor pontuação</div></div></div>
      </div>

      <div class="hero-panel">
        <div class="hero-text">
          <h3>Pronto pra próxima missão?</h3>
          <p>Escolha um mundo e arraste os requisitos pra caixa certa antes que o tempo acabe. Sequências de acertos aumentam seu multiplicador de pontos.</p>
          <div class="hero-actions">
            <a class="btn btn-primary btn-hero" href="#/jogo"><svg width="16" height="16"><use href="#ic-nav-play"/></svg> Ir para o jogo</a>
            <button class="btn btn-ghost-light" id="btn-tutorial"><svg width="16" height="16"><use href="#ic-video"/></svg> Como jogar</button>
          </div>
        </div>
        <div class="hero-mascot"><img src="assets/mascot/reqi-empolgado.png" alt="Reqi"></div>
      </div>

      <div class="panel">
        <div class="badges-head">
          <div>
            <h3 style="margin:0;">Suas conquistas</h3>
            <p class="badges-intro">Cada conquista é desbloqueada ao cumprir um desafio específico durante as partidas.</p>
          </div>
          <div class="badges-progress">
            <span>${desbloqueadas} / ${Badges.LIST.length}</span>
            <div class="badges-progress-track"><div class="badges-progress-fill" style="width:${pctBadges}%"></div></div>
          </div>
        </div>
        <div class="badges-grid" id="dash-badges"></div>
      </div>
    `;

    const badgesBox = container.querySelector('#dash-badges');
    Badges.LIST.forEach(b => {
      const unlocked = progress.badges.includes(b.id);
      const tile = document.createElement('div');
      tile.className = 'badge-tile' + (unlocked ? '' : ' locked');
      tile.innerHTML = `
        <img src="${b.icon}" alt="">
        <div class="badge-name">${b.name}</div>
        <div class="badge-desc">${b.desc}</div>
        <div class="badge-status">${unlocked ? 'Desbloqueada' : 'Ainda bloqueada'}</div>
      `;
      badgesBox.appendChild(tile);
    });

    container.querySelector('#btn-tutorial').addEventListener('click', openTutorialModal);
  }

  function openTutorialModal() {
    const passos = [
      { titulo: 'Escolha um mundo', texto: 'Vá em "Jogar" e escolha um mundo pra sua consultoria.', pose: 'neutro' },
      { titulo: 'Classifique os requisitos', texto: 'Arraste cada requisito pra "Funcional" ou "Não Funcional" antes do tempo acabar.', pose: 'empolgado' },
      { titulo: 'Aumente seu combo', texto: 'Acertos seguidos multiplicam seus pontos — um erro zera a sequência.', pose: 'neutro' },
      { titulo: 'Use os power-ups', texto: 'Dica, Tempo Extra e Pular te salvam nos requisitos mais difíceis.', pose: 'neutro' },
      { titulo: 'Suba de cargo', texto: 'Ganhe XP, suba de nível e desbloqueie mais cargas de power-up e conquistas.', pose: 'empolgado' },
    ];
    let step = 0;

    const modal = openModal(`
      <h3>Como jogar</h3>
      <div class="tutorial-dots" id="tutorial-dots"></div>
      <div class="tutorial-stage" id="tutorial-stage"></div>
      <div class="modal-actions tutorial-actions">
        <button class="btn btn-secondary" id="tutorial-back">Voltar</button>
        <button class="btn btn-primary" id="tutorial-next">Próximo</button>
      </div>
    `);

    const dotsBox = modal.querySelector('#tutorial-dots');
    const stage = modal.querySelector('#tutorial-stage');
    const backBtn = modal.querySelector('#tutorial-back');
    const nextBtn = modal.querySelector('#tutorial-next');

    passos.forEach((_, i) => {
      const dot = document.createElement('span');
      dot.className = 'tutorial-dot';
      dot.addEventListener('click', () => renderStep(i));
      dotsBox.appendChild(dot);
    });

    function renderStep(i) {
      step = i;
      const p = passos[step];
      stage.classList.remove('tutorial-stage-in');
      void stage.offsetWidth;
      stage.innerHTML = `
        <img src="assets/mascot/reqi-${p.pose}.png" alt="Reqi">
        <div class="tutorial-step-title">Passo ${step + 1} de ${passos.length} — ${p.titulo}</div>
        <div class="tutorial-step-text">${p.texto}</div>
      `;
      stage.classList.add('tutorial-stage-in');
      [...dotsBox.children].forEach((d, i2) => d.classList.toggle('active', i2 === step));
      backBtn.style.visibility = step === 0 ? 'hidden' : 'visible';
      nextBtn.innerHTML = step === passos.length - 1
        ? 'Ir jogar <svg width="14" height="14"><use href="#ic-nav-play"/></svg>'
        : 'Próximo';
      Sound.click();
    }

    backBtn.addEventListener('click', () => { if (step > 0) renderStep(step - 1); });
    nextBtn.addEventListener('click', () => {
      if (step < passos.length - 1) {
        renderStep(step + 1);
      } else {
        closeModal();
        window.location.hash = '#/jogo';
      }
    });

    renderStep(0);
  }

  return { register };
})();
