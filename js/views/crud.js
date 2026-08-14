/**
 * crud.js
 * CRUD completo de Mundos (temas) e Requisitos.
 * RF06 - Listagem em tabela. RF07 - Filtro/pesquisa em tabelas.
 */

const CrudView = (() => {
  let tab = 'requisitos';
  let filtro = { texto: '', temaId: '', tipo: '' };
  let paginaAtual = 1;
  const REQ_POR_PAGINA = 8;

  function register() { Router.register('requisitos', 'Requisitos', render); }

  function render(container) {
    container.innerHTML = `
      <div class="toolbar">
        <div>
          <button class="btn ${tab === 'requisitos' ? 'btn-primary' : 'btn-secondary'} btn-sm" id="tab-req">Requisitos</button>
          <button class="btn ${tab === 'temas' ? 'btn-primary' : 'btn-secondary'} btn-sm" id="tab-temas">Mundos</button>
        </div>
        <button class="btn btn-primary" id="btn-novo">+ Novo ${tab === 'requisitos' ? 'Requisito' : 'Mundo'}</button>
      </div>
      <div id="crud-content"></div>
    `;
    container.querySelector('#tab-req').addEventListener('click', () => { tab = 'requisitos'; render(container); });
    container.querySelector('#tab-temas').addEventListener('click', () => { tab = 'temas'; render(container); });
    container.querySelector('#btn-novo').addEventListener('click', () => tab === 'requisitos' ? openRequisitoModal(container) : openTemaModal(container));
    tab === 'requisitos' ? renderRequisitos(container) : renderTemas(container);
  }

  // ============================================================
  // REQUISITOS
  // ============================================================
  function renderRequisitos(container) {
    const box = container.querySelector('#crud-content');
    const temas = DB.getTemas();
    box.innerHTML = `
      <div class="toolbar">
        <input type="search" id="f-texto" placeholder="Pesquisar requisito..." value="${filtro.texto}">
        <select id="f-tema">
          <option value="">Todos os mundos</option>
          ${temas.map(t => `<option value="${t.id}" ${filtro.temaId === t.id ? 'selected' : ''}>${t.nome}</option>`).join('')}
        </select>
        <select id="f-tipo">
          <option value="">Todos os tipos</option>
          <option value="funcional" ${filtro.tipo === 'funcional' ? 'selected' : ''}>Funcional</option>
          <option value="nao-funcional" ${filtro.tipo === 'nao-funcional' ? 'selected' : ''}>Não Funcional</option>
        </select>
      </div>
      <div class="table-wrap">
        <table>
          <thead><tr><th>Requisito</th><th>Mundo</th><th>Tipo</th><th>Ações</th></tr></thead>
          <tbody id="req-tbody"></tbody>
        </table>
      </div>
      <div class="pagination" id="req-pagination"></div>
    `;
    box.querySelector('#f-texto').addEventListener('input', (e) => { filtro.texto = e.target.value; paginaAtual = 1; renderTbody(container); });
    box.querySelector('#f-tema').addEventListener('change', (e) => { filtro.temaId = e.target.value; paginaAtual = 1; renderTbody(container); });
    box.querySelector('#f-tipo').addEventListener('change', (e) => { filtro.tipo = e.target.value; paginaAtual = 1; renderTbody(container); });
    renderTbody(container);
  }

  function renderTbody(container) {
    const tbody = container.querySelector('#req-tbody');
    const pagBox = container.querySelector('#req-pagination');
    const temasById = Object.fromEntries(DB.getTemas().map(t => [t.id, t.nome]));
    let requisitos = DB.getRequisitos();
    if (filtro.texto) requisitos = requisitos.filter(r => r.texto.toLowerCase().includes(filtro.texto.toLowerCase()));
    if (filtro.temaId) requisitos = requisitos.filter(r => r.temaId === filtro.temaId);
    if (filtro.tipo) requisitos = requisitos.filter(r => r.tipo === filtro.tipo);

    if (requisitos.length === 0) {
      tbody.innerHTML = `<tr><td colspan="4" style="text-align:center;color:var(--text-muted);">Nenhum requisito encontrado.</td></tr>`;
      pagBox.innerHTML = '';
      return;
    }

    const totalPaginas = Math.max(1, Math.ceil(requisitos.length / REQ_POR_PAGINA));
    if (paginaAtual > totalPaginas) paginaAtual = totalPaginas;
    if (paginaAtual < 1) paginaAtual = 1;
    const inicio = (paginaAtual - 1) * REQ_POR_PAGINA;
    const pagina = requisitos.slice(inicio, inicio + REQ_POR_PAGINA);

    tbody.innerHTML = pagina.map(r => `
      <tr>
        <td>${r.texto}</td>
        <td>${temasById[r.temaId] || '—'}</td>
        <td><span class="badge ${r.tipo === 'funcional' ? 'badge-func' : 'badge-nao-func'}">
          <svg width="13" height="13"><use href="#${r.tipo === 'funcional' ? 'ic-check' : 'ic-gear'}"/></svg>
          ${r.tipo === 'funcional' ? 'Funcional' : 'Não Funcional'}
        </span></td>
        <td class="row-actions">
          <button class="btn btn-secondary btn-sm" data-edit="${r.id}">Editar</button>
          <button class="btn btn-danger btn-sm" data-del="${r.id}">Excluir</button>
        </td>
      </tr>
    `).join('');

    tbody.querySelectorAll('[data-edit]').forEach(btn => btn.addEventListener('click', () => openRequisitoModal(container, btn.dataset.edit)));
    tbody.querySelectorAll('[data-del]').forEach(btn => btn.addEventListener('click', () => {
      if (confirm('Excluir este requisito?')) { DB.deleteRequisito(btn.dataset.del); showToast('Requisito excluído.'); renderTbody(container); }
    }));

    renderPaginacao(pagBox, requisitos.length, totalPaginas, container);
  }

  function renderPaginacao(pagBox, totalItens, totalPaginas, container) {
    if (totalPaginas <= 1) { pagBox.innerHTML = ''; return; }

    const paginas = [];
    for (let p = 1; p <= totalPaginas; p++) {
      if (p === 1 || p === totalPaginas || Math.abs(p - paginaAtual) <= 1) paginas.push(p);
      else if (paginas[paginas.length - 1] !== '...') paginas.push('...');
    }

    pagBox.innerHTML = `
      <span class="pagination-info">${totalItens} requisito${totalItens === 1 ? '' : 's'} · página ${paginaAtual} de ${totalPaginas}</span>
      <div class="pagination-controls">
        <button class="btn btn-secondary btn-sm" id="pag-prev" ${paginaAtual === 1 ? 'disabled' : ''}>‹ Anterior</button>
        ${paginas.map(p => p === '...'
          ? `<span class="pagination-ellipsis">…</span>`
          : `<button class="pagination-page ${p === paginaAtual ? 'active' : ''}" data-page="${p}">${p}</button>`
        ).join('')}
        <button class="btn btn-secondary btn-sm" id="pag-next" ${paginaAtual === totalPaginas ? 'disabled' : ''}>Próxima ›</button>
      </div>
    `;

    pagBox.querySelector('#pag-prev').addEventListener('click', () => { if (paginaAtual > 1) { paginaAtual--; Sound.click(); renderTbody(container); } });
    pagBox.querySelector('#pag-next').addEventListener('click', () => { if (paginaAtual < totalPaginas) { paginaAtual++; Sound.click(); renderTbody(container); } });
    pagBox.querySelectorAll('.pagination-page').forEach(btn => btn.addEventListener('click', () => {
      const p = parseInt(btn.dataset.page, 10);
      if (p !== paginaAtual) { paginaAtual = p; Sound.click(); renderTbody(container); }
    }));
  }

  function openRequisitoModal(container, id) {
    const editando = id ? DB.getRequisitos().find(r => r.id === id) : null;
    const temas = DB.getTemas();
    if (temas.length === 0) { showToast('Cadastre um mundo antes de criar requisitos.'); return; }

    const modal = openModal(`
      <h3>${editando ? 'Editar' : 'Novo'} Requisito</h3>
      <label>Texto do requisito</label>
      <textarea id="m-texto" rows="3">${editando ? editando.texto : ''}</textarea>
      <label>Mundo</label>
      <select id="m-tema">${temas.map(t => `<option value="${t.id}" ${editando && editando.temaId === t.id ? 'selected' : ''}>${t.nome}</option>`).join('')}</select>
      <label>Tipo</label>
      <select id="m-tipo">
        <option value="funcional" ${editando && editando.tipo === 'funcional' ? 'selected' : ''}>Requisito Funcional</option>
        <option value="nao-funcional" ${editando && editando.tipo === 'nao-funcional' ? 'selected' : ''}>Requisito Não Funcional</option>
      </select>
      <div class="modal-actions">
        <button class="btn btn-secondary" id="m-cancel">Cancelar</button>
        <button class="btn btn-primary" id="m-save">Salvar</button>
      </div>
    `);
    modal.querySelector('#m-cancel').addEventListener('click', closeModal);
    modal.querySelector('#m-save').addEventListener('click', () => {
      const texto = modal.querySelector('#m-texto').value.trim();
      const temaId = modal.querySelector('#m-tema').value;
      const tipo = modal.querySelector('#m-tipo').value;
      if (!texto) { showToast('Digite o texto do requisito.'); return; }
      if (editando) DB.updateRequisito(editando.id, { texto, temaId, tipo });
      else DB.addRequisito({ texto, temaId, tipo });
      showToast('Requisito salvo!');
      closeModal();
      renderRequisitos(container);
    });
  }

  // ============================================================
  // MUNDOS (TEMAS)
  // ============================================================
  function renderTemas(container) {
    const box = container.querySelector('#crud-content');
    const temas = DB.getTemas();
    box.innerHTML = `
      <div class="table-wrap">
        <table>
          <thead><tr><th>Mundo</th><th>Descrição</th><th>Dificuldade</th><th>Requisitos</th><th>Ações</th></tr></thead>
          <tbody>
            ${temas.map(t => {
              const tier = t.unlockTier || 1;
              const rank = DB.RANKS.find(r => r.tier === tier);
              return `
              <tr>
                <td><div class="mundo-cell"><img src="${t.icone}" alt="">${t.nome}</div></td>
                <td>${t.descricao || '—'}</td>
                <td><span class="tier-pill"><span class="tier-num">${tier}</span>${rank ? rank.title.split(' ')[0] : '—'}</span></td>
                <td>${DB.getRequisitos(t.id).length}</td>
                <td class="row-actions">
                  <button class="btn btn-secondary btn-sm" data-edit="${t.id}">Editar</button>
                  <button class="btn btn-danger btn-sm" data-del="${t.id}">Excluir</button>
                </td>
              </tr>
            `; }).join('') || `<tr><td colspan="5" style="text-align:center;color:var(--text-muted);">Nenhum mundo cadastrado.</td></tr>`}
          </tbody>
        </table>
      </div>
    `;
    box.querySelectorAll('[data-edit]').forEach(btn => btn.addEventListener('click', () => openTemaModal(container, btn.dataset.edit)));
    box.querySelectorAll('[data-del]').forEach(btn => btn.addEventListener('click', () => {
      if (confirm('Excluir este mundo e todos os seus requisitos?')) { DB.deleteTema(btn.dataset.del); showToast('Mundo excluído.'); renderTemas(container); }
    }));
  }

  const ICONE_PADRAO = 'assets/icons/world-detetives.svg';

  function openTemaModal(container, id) {
    const editando = id ? DB.getTema(id) : null;
    const icone = editando ? (editando.icone || ICONE_PADRAO) : ICONE_PADRAO;
    const cor1 = editando ? editando.gradStart : '#2563eb';
    const cor2 = editando ? editando.gradEnd : '#7c3aed';
    const unlockTier = editando ? (editando.unlockTier || 1) : 1;

    const modal = openModal(`
      <h3>${editando ? 'Editar' : 'Novo'} Mundo</h3>
      <label>Nome do mundo</label>
      <input id="m-nome" value="${editando ? editando.nome : ''}" placeholder="Ex: Sistema de Loja">
      <label>Descrição</label>
      <input id="m-desc" value="${editando ? editando.descricao || '' : ''}" placeholder="Breve descrição do mundo">

      <label>Dificuldade sugerida (só informativa — o mundo fica liberado pra todo mundo jogar)</label>
      <select id="m-tier">
        ${DB.RANKS.map(r => `<option value="${r.tier}" ${unlockTier === r.tier ? 'selected' : ''}>${r.title}</option>`).join('')}
      </select>

      <label>Ícone do mundo</label>
      <div class="icon-preview-row">
        <img id="m-icone-preview" src="${icone}" alt="">
        <input id="m-icone" value="${editando ? (editando.icone || '') : ''}" placeholder="Cole aqui o link de uma imagem (opcional)">
      </div>

      <label>Cores do degradê (usado se não houver imagem de fundo)</label>
      <div class="color-row">
        <div class="color-field"><span>Início</span><input type="color" id="m-cor1" value="${cor1}"></div>
        <div class="color-field"><span>Fim</span><input type="color" id="m-cor2" value="${cor2}"></div>
      </div>
      <div class="gradient-preview" id="m-preview">Pré-visualização</div>

      <label>Imagem de fundo do mundo (opcional)</label>
      <input id="m-fundo" value="${editando ? (editando.fundo || '') : ''}" placeholder="Cole aqui o link/caminho da imagem de fundo">
      <p class="field-hint">Se preenchido, essa imagem substitui o degradê como fundo da tela de jogo desse mundo.</p>

      <div class="modal-actions">
        <button class="btn btn-secondary" id="m-cancel">Cancelar</button>
        <button class="btn btn-primary" id="m-save">Salvar</button>
      </div>
    `);

    const iconeInput = modal.querySelector('#m-icone');
    const iconePreview = modal.querySelector('#m-icone-preview');
    const cor1Input = modal.querySelector('#m-cor1');
    const cor2Input = modal.querySelector('#m-cor2');
    const preview = modal.querySelector('#m-preview');

    function atualizarGradiente() {
      preview.style.background = `linear-gradient(160deg, ${cor1Input.value}, ${cor2Input.value})`;
    }
    function atualizarIcone() {
      iconePreview.src = iconeInput.value.trim() || ICONE_PADRAO;
    }
    iconePreview.addEventListener('error', () => { iconePreview.src = ICONE_PADRAO; });
    [cor1Input, cor2Input].forEach(inp => inp.addEventListener('input', atualizarGradiente));
    iconeInput.addEventListener('input', atualizarIcone);
    atualizarGradiente();

    modal.querySelector('#m-cancel').addEventListener('click', closeModal);
    modal.querySelector('#m-save').addEventListener('click', () => {
      const nome = modal.querySelector('#m-nome').value.trim();
      const descricao = modal.querySelector('#m-desc').value.trim();
      const iconeVal = iconeInput.value.trim() || ICONE_PADRAO;
      const gradStart = cor1Input.value;
      const gradEnd = cor2Input.value;
      const tierVal = parseInt(modal.querySelector('#m-tier').value, 10) || 1;
      const fundoVal = modal.querySelector('#m-fundo').value.trim();
      if (!nome) { showToast('Digite o nome do mundo.'); return; }
      if (editando) DB.updateTema(editando.id, { nome, descricao, icone: iconeVal, gradStart, gradEnd, unlockTier: tierVal, fundo: fundoVal });
      else DB.addTema({ nome, descricao, icone: iconeVal, gradStart, gradEnd, unlockTier: tierVal, fundo: fundoVal });
      showToast('Mundo salvo!');
      closeModal();
      renderTemas(container);
    });
  }

  return { register };
})();
