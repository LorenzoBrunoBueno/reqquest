/**
 * guia.js
 * "Guia de Requisitos" — página de referência que explica, de forma
 * embasada (não genérica), a diferença entre Requisito Funcional e Não
 * Funcional. As categorias de qualidade seguem o espírito da ISO/IEC 25010
 * e são clicáveis: mostram ao vivo quantos e quais requisitos do próprio
 * banco do jogo (DB.getRequisitos()) se encaixam em cada uma. Os exemplos
 * também são puxados ao vivo, não são texto estático.
 */

const GuiaView = (() => {
  const CATEGORIAS = ['Desempenho', 'Confiabilidade', 'Segurança', 'Usabilidade', 'Compatibilidade', 'Manutenibilidade'];
  let categoriaAtiva = null;

  function register() { Router.register('guia', 'Guia de Requisitos', render); }

  function render(container) {
    categoriaAtiva = null;
    container.innerHTML = `
      <div class="panel guia-intro-panel" style="margin-bottom:20px;">
        <img class="guia-mascot-peek" src="assets/mascot/reqi-debrucado-semfio.png" alt="Reqi apoiado no painel, acompanhando a explicação">
        <h3>O que é um Requisito de Software?</h3>
        <p class="section-intro">Algo que um sistema precisa fazer, ou uma qualidade que ele precisa ter. É a base de tudo que você classifica no ReqQuest.</p>
      </div>

      <div class="guia-compare">
        <div class="guia-card guia-func">
          <div class="guia-card-head">
            <svg width="22" height="22"><use href="#ic-check"/></svg>
            <h4>Requisito Funcional (RF)</h4>
          </div>
          <p>O que o sistema <b>faz</b>: uma ação ou funcionalidade. Geralmente começa com um verbo — "permitir", "cadastrar", "gerar".</p>
          <p class="guia-example">"O sistema deve permitir cadastrar pratos no cardápio."</p>
        </div>
        <div class="guia-card guia-naofunc">
          <div class="guia-card-head">
            <svg width="22" height="22"><use href="#ic-gear"/></svg>
            <h4>Requisito Não Funcional (RNF)</h4>
          </div>
          <p>Quão <b>bem</b> o sistema faz: uma qualidade — desempenho, segurança, usabilidade. Costuma vir com números ou padrões técnicos.</p>
          <p class="guia-example">"O sistema deve responder em até 2 segundos."</p>
        </div>
      </div>

      <div class="panel" style="margin-bottom:20px;">
        <h3>Categorias de qualidade</h3>
        <p class="section-intro">Clique numa categoria pra ver quantos requisitos não funcionais do ReqQuest se encaixam nela, com exemplos reais.</p>
        <div class="guia-categorias" id="guia-categorias"></div>
        <div class="guia-categoria-detalhe" id="guia-categoria-detalhe"></div>
      </div>

      <div class="panel">
        <div class="toolbar">
          <h3 style="margin:0;">Exemplos reais do ReqQuest</h3>
          <button class="btn btn-secondary btn-sm" id="guia-embaralhar">
            <svg width="15" height="15"><use href="#ic-refresh"/></svg> Ver outros exemplos
          </button>
        </div>
        <p class="section-intro">Puxados ao vivo dos requisitos cadastrados nos mundos do jogo. Clique num item pra ver por quê.</p>
        <div class="guia-exemplos" id="guia-exemplos"></div>
      </div>
    `;

    renderCategorias(container);
    renderExemplos(container);
    container.querySelector('#guia-embaralhar').addEventListener('click', () => { Sound.click(); renderExemplos(container); });
  }

  function contarPorCategoria() {
    const naoFuncionais = DB.getRequisitos().filter(r => r.tipo === 'nao-funcional');
    const contagem = {};
    CATEGORIAS.forEach(c => contagem[c] = 0);
    naoFuncionais.forEach(r => { const c = DB.categoriaDoRequisito(r); if (c) contagem[c] = (contagem[c] || 0) + 1; });
    return contagem;
  }

  function renderCategorias(container) {
    const box = container.querySelector('#guia-categorias');
    const contagem = contarPorCategoria();
    box.innerHTML = CATEGORIAS.map(c => `
      <button class="guia-categoria-chip ${categoriaAtiva === c ? 'active' : ''}" data-cat="${c}">
        <b>${c}</b><span>${contagem[c] || 0} requisito${contagem[c] === 1 ? '' : 's'}</span>
      </button>
    `).join('');
    box.querySelectorAll('.guia-categoria-chip').forEach(btn => {
      btn.addEventListener('click', () => {
        Sound.click();
        categoriaAtiva = categoriaAtiva === btn.dataset.cat ? null : btn.dataset.cat;
        renderCategorias(container);
        renderCategoriaDetalhe(container);
      });
    });
    renderCategoriaDetalhe(container);
  }

  function renderCategoriaDetalhe(container) {
    const box = container.querySelector('#guia-categoria-detalhe');
    if (!categoriaAtiva) { box.innerHTML = ''; return; }
    const itens = DB.getRequisitos().filter(r => DB.categoriaDoRequisito(r) === categoriaAtiva);
    box.innerHTML = itens.length === 0
      ? `<p class="guia-exemplo-meta" style="margin-top:10px;">Nenhum requisito dessa categoria cadastrado ainda.</p>`
      : `<div class="guia-exemplos" style="margin-top:14px;">${itens.map(r => {
          const tema = DB.getTema(r.temaId);
          return `<div class="guia-exemplo-item"><svg width="16" height="16"><use href="#ic-gear"/></svg><div><p>${r.texto}</p><span class="guia-exemplo-meta">${tema ? tema.nome : ''}</span></div></div>`;
        }).join('')}</div>`;
  }

  function amostra(lista, n) {
    const copia = [...lista];
    for (let i = copia.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [copia[i], copia[j]] = [copia[j], copia[i]]; }
    return copia.slice(0, n);
  }

  function renderExemplos(container) {
    const todos = DB.getRequisitos();
    const funcionais = amostra(todos.filter(r => r.tipo === 'funcional'), 3);
    const naoFuncionais = amostra(todos.filter(r => r.tipo === 'nao-funcional'), 3);
    const box = container.querySelector('#guia-exemplos');
    if (!box) return;

    const linha = (r) => {
      const tema = DB.getTema(r.temaId);
      return `
        <button class="guia-exemplo-item guia-exemplo-toggle" type="button">
          <svg width="16" height="16"><use href="#${r.tipo === 'funcional' ? 'ic-check' : 'ic-gear'}"/></svg>
          <div>
            <p>${r.texto}</p>
            <span class="guia-exemplo-meta guia-exemplo-hint">${tema ? tema.nome + ' · ' : ''}Por que é ${r.tipo === 'funcional' ? 'funcional' : 'não funcional'}? <span class="guia-exemplo-arrow">▾</span></span>
            <span class="guia-exemplo-explicacao">${DB.explicarClassificacao(r)}</span>
          </div>
        </button>
      `;
    };

    box.innerHTML = (funcionais.length + naoFuncionais.length === 0)
      ? `<p style="color:var(--text-muted);">Nenhum requisito cadastrado ainda.</p>`
      : funcionais.map(linha).join('') + naoFuncionais.map(linha).join('');

    box.querySelectorAll('.guia-exemplo-toggle').forEach(item => {
      item.addEventListener('click', () => { Sound.click(); item.classList.toggle('open'); });
    });
  }

  return { register };
})();
