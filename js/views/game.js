/**
 * game.js
 * Núcleo do ReqQuest: escolher mundo, arrastar requisitos para a caixa
 * certa, pontuar com combo, usar power-ups, ganhar XP e desbloquear badges.
 */

const GameView = (() => {
  const GAME_SECONDS = 60;
  const BASE_QUESTION_TIME = 8;
  const MIN_QUESTION_TIME = 3;
  const LEVEL_UP_EVERY = 5; // acertos seguidos p/ subir de nível de dificuldade

  let state = null;
  let gameTimerId = null;
  let questionTimerId = null;

  function register() {
    Router.register('jogo', 'Jogar', render);
    window.addEventListener('hashchange', () => {
      if (window.location.hash !== '#/jogo') stopTimers();
    });
  }

  function stopTimers() {
    clearInterval(gameTimerId); clearInterval(questionTimerId);
    gameTimerId = null; questionTimerId = null;
  }

  function multiplierForStreak(streak) {
    if (streak >= 8) return 4;
    if (streak >= 5) return 3;
    if (streak >= 3) return 2;
    return 1;
  }

  function render(container) {
    stopTimers();
    state = { screen: 'setup' };
    renderSetup(container);
    Mascot.say('Escolha um mundo pra começar sua missão!', 'neutro', 3500);
  }

  // ---------------- SELEÇÃO DE MUNDO ----------------
  function renderSetup(container) {
    const temas = DB.getTemas();
    container.innerHTML = `
      <div class="panel">
        <h3>Escolha um mundo para jogar</h3>
        <p style="color:var(--text-muted);font-size:14px;">Classifique os requisitos antes que o tempo acabe.</p>
        <div class="theme-grid" id="theme-grid"></div>
      </div>
    `;
    const grid = container.querySelector('#theme-grid');
    if (temas.length === 0) {
      grid.innerHTML = `<p>Nenhum mundo cadastrado ainda. Vá em "Requisitos" e crie um.</p>`;
      return;
    }
    temas.forEach(t => {
      const qtd = DB.getRequisitos(t.id).length;
      const card = document.createElement('div');
      card.className = 'theme-card' + (t.fundo ? ' has-preview' : '');
      card.style.background = t.fundo
        ? `linear-gradient(180deg, rgba(10,12,25,.2), rgba(10,12,25,.55)), url('${t.fundo}') center/cover`
        : `linear-gradient(160deg, ${t.gradStart}, ${t.gradEnd})`;
      card.innerHTML = `
        <img src="${t.icone}" alt="">
        <h4>${t.nome}</h4>
        <p>${t.descricao || ''}</p>
        <p>${qtd} requisitos</p>
      `;
      card.addEventListener('click', () => {
        if (qtd === 0) { showToast('Esse mundo não tem requisitos cadastrados.'); return; }
        Sound.click();
        startGame(t, container);
      });
      grid.appendChild(card);
    });
  }

  // ---------------- LÓGICA DO JOGO ----------------
  function startGame(tema, container) {
    state = {
      screen: 'playing', tema,
      pool: shuffle(DB.getRequisitos(tema.id)), poolIndex: 0,
      score: 0, acertos: 0, erros: 0,
      streak: 0, maxStreak: 0, respostasRapidas: 0,
      nivel: 1, timeLeft: GAME_SECONDS,
      current: null, selectedId: null,
      powerups: DB.powerupsForTier(DB.currentTier()),
    };
    renderPlaying(container);
    startGameTimer(container);
    nextQuestion(container);
    Mascot.say(`Bem-vindo(a) ao ${tema.nome}! Vamos lá!`, 'neutro', 3000);
  }

  function startGameTimer(container) {
    clearInterval(gameTimerId);
    gameTimerId = setInterval(() => {
      state.timeLeft--;
      const el = document.getElementById('hud-time');
      if (el) {
        el.textContent = `${state.timeLeft}s`;
        el.parentElement.classList.toggle('low', state.timeLeft <= 10);
      }
      if (state.timeLeft <= 10 && state.timeLeft > 0) Sound.countdown();
      if (state.timeLeft <= 0) endGame(container);
    }, 1000);
  }

  function questionTimeForLevel(nivel) {
    return Math.max(MIN_QUESTION_TIME, BASE_QUESTION_TIME - (nivel - 1) * 0.7);
  }

  function nextQuestion(container) {
    if (state.screen !== 'playing') return;
    clearInterval(questionTimerId);
    if (state.pool.length === 0) return;
    if (state.poolIndex >= state.pool.length) {
      // Baralho todo classificado antes do tempo acabar — encerra aqui em
      // vez de reembaralhar e repetir cartas que a pessoa já viu.
      endGame(container, { deckCompleto: true });
      return;
    }
    state.current = state.pool[state.poolIndex++];
    state.selectedId = null;
    state.currentQTime = questionTimeForLevel(state.nivel);
    state.currentElapsed = 0;

    renderArena(container);

    questionTimerId = setInterval(() => {
      state.currentElapsed += 0.1;
      const pct = Math.max(0, 100 - (state.currentElapsed / state.currentQTime) * 100);
      const bar = document.getElementById('question-bar');
      if (bar) bar.style.width = pct + '%';
      if (state.currentElapsed >= state.currentQTime) {
        clearInterval(questionTimerId);
        registerAnswer(container, null);
      }
    }, 100);
  }

  function renderPlaying(container) {
    const t = state.tema;
    const temFundo = !!t.fundo;
    const bgStyle = temFundo
      ? `background-image: url('${t.fundo}');`
      : `background: linear-gradient(160deg, ${t.gradStart}, ${t.gradEnd});`;
    container.innerHTML = `
      <div class="game-screen${temFundo ? ' has-bg-image' : ''}" id="game-screen" style="${bgStyle}">
        <div class="game-hud">
          <div class="hud-left"><img src="${t.icone}" alt=""><span>${t.nome}</span></div>
          <div class="hud-stats">
            <div class="hud-item"><span>PONTOS</span><span id="hud-score">${state.score}</span></div>
            <div class="hud-item"><span>NÍVEL</span><span id="hud-level">${state.nivel}</span></div>
            <div class="hud-item"><span>ACERTOS</span><span id="hud-acertos">${state.acertos}</span></div>
          </div>
          <div class="hud-timer" id="hud-time-wrap"><span id="hud-time">${state.timeLeft}s</span></div>
          <div class="hud-powerups" id="hud-powerups"></div>
          <button class="btn btn-secondary btn-sm" id="quit-game">Encerrar</button>
        </div>

        <div class="question-progress"><div id="question-bar" class="question-progress-fill" style="width:100%"></div></div>

        <div class="game-arena" id="game-arena"></div>

        <div class="drop-zones">
          <div class="drop-zone func" id="zone-funcional" data-tipo="funcional">
            <svg width="34" height="34"><use href="#ic-check"/></svg>
            <span class="zone-title">Requisito Funcional</span>
          </div>
          <div class="drop-zone nao-func" id="zone-nao-funcional" data-tipo="nao-funcional">
            <svg width="34" height="34"><use href="#ic-gear"/></svg>
            <span class="zone-title">Requisito Não Funcional</span>
          </div>
        </div>
      </div>
    `;

    container.querySelector('#quit-game').addEventListener('click', () => endGame(container));
    renderPowerupButtons(container);

    ['zone-funcional', 'zone-nao-funcional'].forEach(id => {
      const zone = container.querySelector('#' + id);
      zone.addEventListener('dragover', (e) => { e.preventDefault(); zone.classList.add('drag-over'); });
      zone.addEventListener('dragleave', () => zone.classList.remove('drag-over'));
      zone.addEventListener('drop', (e) => { e.preventDefault(); zone.classList.remove('drag-over'); registerAnswer(container, zone.dataset.tipo); });
      zone.addEventListener('click', () => { if (state.selectedId) registerAnswer(container, zone.dataset.tipo); });
    });
  }

  function renderPowerupButtons(container) {
    const box = container.querySelector('#hud-powerups');
    const defs = [
      { key: 'dica', icon: 'ic-powerup-dica', cls: 'pw-dica', label: 'Dica' },
      { key: 'tempo-extra', icon: 'ic-powerup-tempo', cls: 'pw-tempo', label: 'Tempo Extra' },
      { key: 'pular', icon: 'ic-powerup-pular', cls: 'pw-pular', label: 'Pular' },
    ];
    box.innerHTML = defs.map(d => `
      <button class="powerup-btn" data-key="${d.key}" title="${d.label}" ${state.powerups[d.key] <= 0 ? 'disabled' : ''}>
        <span class="powerup-icon-wrap ${d.cls}"><svg width="18" height="18"><use href="#${d.icon}"/></svg></span>
        <span class="powerup-count">${state.powerups[d.key]}</span>
      </button>
    `).join('');
    box.querySelectorAll('.powerup-btn').forEach(btn => btn.addEventListener('click', () => usePowerup(container, btn.dataset.key)));
  }

  function usePowerup(container, key) {
    if (state.powerups[key] <= 0) return;
    state.powerups[key]--;
    Sound.powerUp();
    renderPowerupButtons(container);

    if (key === 'dica') {
      const zoneId = state.current.tipo === 'funcional' ? 'zone-funcional' : 'zone-nao-funcional';
      const zone = container.querySelector('#' + zoneId);
      if (zone) { zone.classList.add('drag-over'); setTimeout(() => zone.classList.remove('drag-over'), 1400); }
      Mascot.say('Presta atenção nessa caixa que brilhou...', 'pensativo', 2200);
    } else if (key === 'tempo-extra') {
      state.timeLeft += 10;
      document.getElementById('hud-time').textContent = `${state.timeLeft}s`;
      Mascot.say('+10 segundos pra você!', 'empolgado', 2000);
    } else if (key === 'pular') {
      Mascot.say('Bora pular esse!', 'neutro', 1800);
      clearInterval(questionTimerId);
      nextQuestion(container);
    }
  }

  function renderArena(container) {
    const arena = container.querySelector('#game-arena');
    const total = state.pool.length;
    const posicao = ((state.poolIndex - 1) % total) + 1;
    const multiplier = multiplierForStreak(state.streak);
    const pontos = 10 * multiplier;

    arena.innerHTML = `
      <div class="req-card" id="req-card" draggable="true">
        <div class="req-meta">Carta ${posicao} de ${total} · arraste para classificar</div>
        ${state.current.texto}
        <div class="req-points">+${pontos} pts</div>
      </div>
    `;
    const card = arena.querySelector('#req-card');
    card.addEventListener('dragstart', (e) => { e.dataTransfer.setData('text/plain', state.current.id); state.selectedId = state.current.id; });
    card.addEventListener('click', () => {
      card.classList.toggle('selected');
      state.selectedId = card.classList.contains('selected') ? state.current.id : null;
    });

    // combo badge
    const old = container.querySelector('.combo-badge');
    if (old) old.remove();
    if (state.streak >= 3) {
      const badge = document.createElement('div');
      badge.className = 'combo-badge';
      badge.textContent = `Sequência x${multiplier}`;
      container.querySelector('#game-screen').appendChild(badge);
    }
  }

  function registerAnswer(container, tipoEscolhido) {
    if (!state.current) return;
    clearInterval(questionTimerId);
    const correto = tipoEscolhido === state.current.tipo;
    const zoneId = state.current.tipo === 'funcional' ? 'zone-funcional' : 'zone-nao-funcional';
    const zone = container.querySelector('#' + zoneId);
    const foiRapido = state.currentElapsed < state.currentQTime * 0.5;

    if (tipoEscolhido === null) showToast('Tempo esgotado!');

    if (correto) {
      const multiplier = multiplierForStreak(state.streak);
      state.score += 10 * multiplier;
      state.acertos++;
      state.streak++;
      state.maxStreak = Math.max(state.maxStreak, state.streak);
      if (foiRapido) state.respostasRapidas++;
      Sound.acerto();
      if (zone) { zone.classList.add('correct'); setTimeout(() => zone.classList.remove('correct'), 400); }

      if (state.streak > 0 && state.streak % LEVEL_UP_EVERY === 0) {
        state.nivel++;
        Sound.levelUp();
        confetti(24);
        Mascot.say(`Nível ${state.nivel}! Ficou mais rápido!`, 'empolgado', 2600);
      } else if (state.streak >= 3) {
        Mascot.say(`Sequência x${multiplierForStreak(state.streak)}!`, 'empolgado', 1600);
      } else {
        Mascot.say('Boa! Acertou.', 'empolgado', 1400);
      }
    } else {
      state.score = Math.max(0, state.score - 5);
      state.erros++;
      state.streak = 0;
      Sound.erro();
      if (zone) { zone.classList.add('wrong'); setTimeout(() => zone.classList.remove('wrong'), 400); }
      const card = document.getElementById('req-card');
      if (card) card.classList.add('shake');
      const explicacao = DB.explicarClassificacao(state.current);
      Mascot.say(`Ops, não foi essa. ${explicacao}`, 'confuso', 4200);
    }

    document.getElementById('hud-score').textContent = state.score;
    document.getElementById('hud-level').textContent = state.nivel;
    document.getElementById('hud-acertos').textContent = state.acertos;

    state.current = null;
    setTimeout(() => nextQuestion(container), 400);
  }

  function endGame(container, opts = {}) {
    stopTimers();
    state.screen = 'over';

    const deckCompleto = !!opts.deckCompleto;
    const melhorAnterior = DB.getPartidas().reduce((max, p) => Math.max(max, p.score), 0);

    // Bônus por limpar o baralho inteiro antes do tempo acabar: recompensa
    // quem foi rápido em vez de deixar o tempo sobrando sem fazer nada.
    const bonusTempo = deckCompleto ? state.timeLeft * 2 : 0;
    state.score += bonusTempo;

    const novoRecorde = state.score > melhorAnterior;

    DB.addPartida({
      usuario: (Auth.getUsuario() || {}).nome || 'Anônimo',
      temaId: state.tema.id, temaNome: state.tema.nome,
      score: state.score, acertos: state.acertos, erros: state.erros, nivel: state.nivel,
    });

    const xpGanho = state.acertos * 10 + (deckCompleto ? 20 : 0);
    const xpResult = DB.addXP(xpGanho);
    refreshProfileUI();

    const stats = {
      totalPartidas: DB.getPartidas().length,
      acertos: state.acertos, erros: state.erros,
      respostasRapidas: state.respostasRapidas, maiorSequencia: state.maxStreak,
    };
    const novasBadges = Badges.checkAfterGame(stats);

    Sound.gameOver(state.score);
    if (xpResult.leveledUp || novasBadges.length > 0) confetti(40); else confetti(16);

    let pose;
    if (deckCompleto && state.erros === 0) pose = 'comemorando';
    else if (novoRecorde && state.score > 0) pose = 'surpreso';
    else if (state.erros === 0 && state.acertos > 0) pose = 'empolgado';
    else if (state.acertos >= state.erros) pose = 'neutro';
    else pose = 'triste';

    const titulo = deckCompleto ? 'Baralho completo!' : 'Missão concluída!';

    container.innerHTML = `
      <div class="game-over-panel">
        <img src="assets/mascot/reqi-${pose}.png" alt="Reqi">
        <h2>${titulo}</h2>
        <div class="score-big">${state.score} pts</div>
        ${novoRecorde && state.score > 0 ? '<p class="xp-gain">Novo recorde de pontuação!</p>' : ''}
        <p>${state.acertos} acertos &nbsp;•&nbsp; ${state.erros} erros &nbsp;•&nbsp; sequência máx. ${state.maxStreak}</p>
        ${deckCompleto ? `<p>Você classificou todos os requisitos desse mundo com ${state.timeLeft}s sobrando (+${bonusTempo} pts de bônus).</p>` : ''}
        <p class="xp-gain">+${xpGanho} XP ${xpResult.leveledUp ? '— você subiu de nível!' : ''}</p>
        ${novasBadges.length > 0 ? `
          <div class="panel" style="margin:18px auto;max-width:420px;">
            <h3 style="margin-bottom:10px;">Nova(s) conquista(s)!</h3>
            <div class="badges-grid">
              ${novasBadges.map(b => `<div class="badge-tile"><img src="${b.icon}" alt=""><div class="badge-name">${b.name}</div><div class="badge-desc">${b.desc}</div><div class="badge-status">Desbloqueada</div></div>`).join('')}
            </div>
          </div>` : ''}
        <div style="display:flex;gap:12px;justify-content:center;margin-top:20px;">
          <button class="btn btn-primary" id="play-again">Jogar de novo</button>
          <a class="btn btn-secondary" href="#/relatorios">Ver relatórios</a>
        </div>
      </div>
    `;
    container.querySelector('#play-again').addEventListener('click', () => renderSetup(container));

    let falaFinal = 'Boa partida! Bora ver os próximos mundos?';
    if (novasBadges.length > 0) falaFinal = 'Mandou bem, desbloqueou conquista nova!';
    else if (deckCompleto) falaFinal = 'Uau, você limpou o baralho inteiro!';
    else if (novoRecorde && state.score > 0) falaFinal = 'Novo recorde de pontuação, uau!';
    Mascot.say(falaFinal, pose, 3500);
  }

  function shuffle(arr) {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
    return a;
  }

  return { register };
})();
