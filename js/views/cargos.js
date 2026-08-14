/**
 * cargos.js
 * Página que explica a trilha de progressão de cargos (rank) do consultor(a).
 * Todos os mundos já ficam abertos desde o início — o que o cargo desbloqueia
 * de verdade são cargas extras de power-up pra usar durante as partidas,
 * além do título/prestígio exibido no perfil.
 */

const CargosView = (() => {
  const POWERUP_LABEL = { dica: 'Dica', 'tempo-extra': 'Tempo Extra', pular: 'Pular' };
  const POWERUP_ICON = { dica: 'ic-powerup-dica', 'tempo-extra': 'ic-powerup-tempo', pular: 'ic-powerup-pular' };
  const POWERUP_CLS = { dica: 'pw-dica', 'tempo-extra': 'pw-tempo', pular: 'pw-pular' };

  function register() { Router.register('cargos', 'Cargos', render); }

  function render(container) {
    const progress = DB.getPlayerProgress();
    const level = DB.currentLevel();
    const tierAtual = DB.currentTier();
    const xpIntoLevel = progress.xp % DB.XP_PER_LEVEL;

    container.innerHTML = `
      <div class="panel cargos-intro-panel" style="margin-bottom:20px;">
        <img class="cargos-mascot-sticker" src="assets/mascot/reqi-cargos-peek.png" alt="Reqi apoiado no painel, acompanhando sua trilha de carreira">
        <h3>Sua trilha de carreira</h3>
        <p class="section-intro">
          Todos os mundos já estão liberados pra você jogar. Cada acerto rende XP e, a cada
          ${DB.XP_PER_LEVEL} XP, você sobe de nível — ao atingir certos níveis, é promovido(a) de cargo
          e ganha mais cargas de power-up pra usar nas partidas.
        </p>
        <div class="cargo-current">
          <div class="cargo-current-value">${xpIntoLevel} / ${DB.XP_PER_LEVEL} XP no nível ${level}</div>
          <div class="xp-bar-track"><div class="xp-bar-fill" style="width:${xpIntoLevel}%"></div></div>
        </div>
      </div>

      <div class="cargo-ladder" id="cargo-ladder"></div>
    `;

    const ladder = container.querySelector('#cargo-ladder');
    [...DB.RANKS].reverse().forEach(rank => {
      const alcancado = tierAtual >= rank.tier;
      const atual = tierAtual === rank.tier;
      const powerups = DB.powerupsForTier(rank.tier);
      const card = document.createElement('div');
      card.className = 'cargo-card' + (alcancado ? ' reached' : '') + (atual ? ' current' : '');
      card.innerHTML = `
        <div class="cargo-badge">${rank.tier}</div>
        <div class="cargo-info">
          <div class="cargo-title">${rank.title} ${atual ? '<span class="cargo-you">você está aqui</span>' : ''}</div>
          <div class="cargo-range">Nível ${rank.min}${rank.max === Infinity ? '+' : ' a ' + rank.max}</div>
          <div class="cargo-worlds">
            ${Object.entries(powerups).map(([key, qtd]) => `
              <span class="cargo-world-chip ${alcancado ? '' : 'locked'}">
                <span class="powerup-icon-wrap sm ${POWERUP_CLS[key]}"><svg width="13" height="13"><use href="#${POWERUP_ICON[key]}"/></svg></span>${qtd}x ${POWERUP_LABEL[key]}
              </span>
            `).join('')}
          </div>
          ${rank.tier === 5 ? `<div class="cargo-worlds-empty">No topo da carreira, sua reputação vira lenda na consultoria.</div>` : ''}
        </div>
      `;
      ladder.appendChild(card);
    });
  }

  return { register };
})();
