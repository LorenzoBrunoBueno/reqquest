/**
 * relatorios.js
 * RF05 - Acesso a relatórios pelo menu lateral.
 * Ranking de partidas + gráfico de evolução (canvas nativo, sem libs) +
 * conquistas desbloqueadas.
 */

const RelatoriosView = (() => {
  let filtroTema = '';

  function register() { Router.register('relatorios', 'Relatórios', render); }

  function render(container) {
    const temas = DB.getTemas();
    const progress = DB.getPlayerProgress();

    const desbloqueadas = progress.badges.length;

    container.innerHTML = `
      <div class="panel" style="margin-bottom:20px;">
        <h3>Evolução de pontuação</h3>
        <p class="section-intro">Pontuação de cada partida jogada, em ordem cronológica.</p>
        <div class="chart-wrap"><canvas id="evolution-chart" height="220"></canvas></div>
      </div>

      <div class="panel relatorios-conquistas-panel" style="margin-bottom:20px;">
        <img class="relatorios-mascot-peek" src="assets/mascot/reqi-debrucado-alt.png" alt="Reqi acompanhando suas conquistas">
        <h3>Conquistas</h3>
        <p class="section-intro">${desbloqueadas} de ${Badges.LIST.length} conquistas desbloqueadas até agora.</p>
        <div class="badges-grid" id="rel-badges"></div>
      </div>

      <div class="panel">
        <div class="toolbar">
          <h3 style="margin:0;">Ranking de partidas</h3>
          <select id="f-tema">
            <option value="">Todos os mundos</option>
            ${temas.map(t => `<option value="${t.id}" ${filtroTema === t.id ? 'selected' : ''}>${t.nome}</option>`).join('')}
          </select>
        </div>
        <div class="table-wrap">
          <table>
            <thead><tr><th>#</th><th>Jogador</th><th>Mundo</th><th>Pontos</th><th>Acertos</th><th>Erros</th><th>Nível</th><th>Data</th></tr></thead>
            <tbody id="rank-tbody"></tbody>
          </table>
        </div>
      </div>
    `;

    const badgesBox = container.querySelector('#rel-badges');
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

    container.querySelector('#f-tema').addEventListener('change', (e) => { filtroTema = e.target.value; renderTbody(container); });
    renderTbody(container);
    drawChart(container);
  }

  function renderTbody(container) {
    const tbody = container.querySelector('#rank-tbody');
    let partidas = DB.getPartidas();
    if (filtroTema) partidas = partidas.filter(p => p.temaId === filtroTema);
    const ordenadas = [...partidas].sort((a, b) => b.score - a.score);

    if (ordenadas.length === 0) {
      tbody.innerHTML = `<tr><td colspan="8" style="text-align:center;color:var(--text-muted);">Nenhuma partida registrada ainda. Vá jogar!</td></tr>`;
      return;
    }
    tbody.innerHTML = ordenadas.map((p, i) => `
      <tr>
        <td>${i < 3 ? `<span class="rank-pos rank-pos-${i + 1}">${i + 1}</span>` : i + 1}</td>
        <td>${p.usuario}</td>
        <td>${p.temaNome}</td>
        <td><b>${p.score}</b></td>
        <td>${p.acertos}</td>
        <td>${p.erros}</td>
        <td>${p.nivel}</td>
        <td>${new Date(p.data).toLocaleString('pt-BR')}</td>
      </tr>
    `).join('');
  }

  function drawChart(container) {
    const canvas = container.querySelector('#evolution-chart');
    const partidas = [...DB.getPartidas()].reverse(); // cronológico
    const ctx = canvas.getContext && canvas.getContext('2d');
    if (!ctx) return; // ambiente sem suporte a canvas 2D — evita quebrar a tela
    const dpr = window.devicePixelRatio || 1;
    const w = canvas.clientWidth || canvas.parentElement.clientWidth;
    const h = 220;
    canvas.width = w * dpr; canvas.height = h * dpr;
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, w, h);

    const styles = getComputedStyle(document.body);
    const textColor = styles.getPropertyValue('--text-muted').trim() || '#6b7280';
    const gridColor = styles.getPropertyValue('--border').trim() || '#e5e7eb';
    const lineColor = styles.getPropertyValue('--primary').trim() || '#2563eb';

    const padding = { top: 16, right: 16, bottom: 26, left: 36 };
    const plotW = w - padding.left - padding.right;
    const plotH = h - padding.top - padding.bottom;

    if (partidas.length === 0) {
      ctx.fillStyle = textColor;
      ctx.font = '13px Inter, sans-serif';
      ctx.fillText('Jogue algumas partidas pra ver seu gráfico aqui.', 16, h / 2);
      return;
    }

    const scores = partidas.map(p => p.score);
    const maxScore = Math.max(...scores, 10);

    // grid horizontal (4 linhas)
    ctx.strokeStyle = gridColor; ctx.lineWidth = 1; ctx.font = '10px Inter, sans-serif'; ctx.fillStyle = textColor;
    for (let i = 0; i <= 4; i++) {
      const y = padding.top + (plotH * i) / 4;
      ctx.beginPath(); ctx.moveTo(padding.left, y); ctx.lineTo(w - padding.right, y); ctx.stroke();
      const value = Math.round(maxScore - (maxScore * i) / 4);
      ctx.fillText(value, 4, y + 3);
    }

    // linha de pontuação
    const stepX = partidas.length > 1 ? plotW / (partidas.length - 1) : 0;
    ctx.beginPath();
    ctx.strokeStyle = lineColor; ctx.lineWidth = 2.5; ctx.lineJoin = 'round';
    partidas.forEach((p, i) => {
      const x = padding.left + stepX * i;
      const y = padding.top + plotH - (p.score / maxScore) * plotH;
      if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    });
    ctx.stroke();

    // área sob a linha
    ctx.lineTo(padding.left + stepX * (partidas.length - 1), padding.top + plotH);
    ctx.lineTo(padding.left, padding.top + plotH);
    ctx.closePath();
    ctx.fillStyle = lineColor + '22';
    ctx.fill();

    // pontos
    ctx.fillStyle = lineColor;
    partidas.forEach((p, i) => {
      const x = padding.left + stepX * i;
      const y = padding.top + plotH - (p.score / maxScore) * plotH;
      ctx.beginPath(); ctx.arc(x, y, 3.5, 0, Math.PI * 2); ctx.fill();
    });
  }

  return { register };
})();
