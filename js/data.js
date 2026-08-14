/**
 * data.js
 * -----------------------------------------------------------------------
 * Camada de dados do ReqQuest. Usa localStorage como "banco" mock, porque a
 * API real está sendo feita por outra pessoa da equipe (Backend Force).
 *
 * COMO TROCAR PELA API DEPOIS:
 * Toda a interface fica isolada no objeto DB (DB.getTemas, DB.addRequisito,
 * DB.getPlayerProgress, etc). Quando a API estiver pronta, troque só o CORPO
 * de cada função por um fetch('/api/...') — quem consome (views, game.js)
 * não muda nada. Se a API for assíncrona, adicione await nas chamadas.
 * -----------------------------------------------------------------------
 */

const DB = (() => {
  const KEYS = {
    temas: 'rq_temas_v2',
    requisitos: 'rq_requisitos_v2',
    partidas: 'rq_partidas_v2',
    player: 'rq_player_v2',
  };

  function uid() { return Date.now().toString(36) + Math.random().toString(36).slice(2, 7); }
  function read(key, fallback) { const raw = localStorage.getItem(key); return raw ? JSON.parse(raw) : fallback; }
  function write(key, value) { localStorage.setItem(key, JSON.stringify(value)); }

  // ---------------------------------------------------------------------
  // RANKS — título muda conforme o nível de consultor(a) do jogador
  // ---------------------------------------------------------------------
  const RANKS = [
    { min: 1, max: 2, title: 'Estagiário(a) de Requisitos', tier: 1 },
    { min: 3, max: 4, title: 'Analista Júnior', tier: 2 },
    { min: 5, max: 7, title: 'Analista Pleno', tier: 3 },
    { min: 8, max: 10, title: 'Arquiteto(a) de Requisitos', tier: 4 },
    { min: 11, max: Infinity, title: 'Mestre dos Requisitos', tier: 5 },
  ];
  function rankForLevel(level) {
    return RANKS.find(r => level >= r.min && level <= r.max) || RANKS[0];
  }

  const XP_PER_LEVEL = 100;

  // Todos os mundos ficam abertos desde o início (bom pra demonstração/aula
  // sem precisar farmar XP mundo por mundo). O que o cargo/tier realmente
  // desbloqueia agora são cargas extras de power-up pra usar durante a
  // partida — a recompensa por subir de cargo continua existindo, só que
  // em outro lugar.
  function powerupsForTier(tier) {
    return {
      dica: tier,
      'tempo-extra': Math.min(3, Math.ceil(tier / 2)),
      pular: Math.min(3, Math.ceil((tier + 1) / 2)),
    };
  }

  // ---------------------------------------------------------------------
  // CLASSIFICAÇÃO EXPLICADA — dado um requisito, devolve uma frase curta
  // explicando POR QUE ele é funcional ou não funcional. Pra não funcional,
  // tenta reconhecer a categoria de qualidade (inspirado nas características
  // da ISO/IEC 25010: desempenho, confiabilidade, segurança, usabilidade,
  // portabilidade) a partir de palavras-chave do próprio texto. Usado no
  // jogo (feedback de erro) e no Guia de Requisitos.
  // ---------------------------------------------------------------------
  const CATEGORIAS_NAO_FUNCIONAL = [
    { chaves: ['segundo', 'milissegundo', 'responder em', 'carregar', 'resposta'], nome: 'desempenho — tempo de resposta', principal: 'Desempenho' },
    { chaves: ['simultâne', 'simultane', 'usuários', 'suportar', 'picos de acesso'], nome: 'desempenho — capacidade e escalabilidade', principal: 'Desempenho' },
    { chaves: ['disponív', 'disponibilidade', '% do tempo', 'estar disponível'], nome: 'confiabilidade — disponibilidade', principal: 'Confiabilidade' },
    { chaves: ['backup', 'recupera', 'falha', 'perder dados', 'queda de conexão'], nome: 'confiabilidade — recuperação de falhas', principal: 'Confiabilidade' },
    { chaves: ['sem conexão', 'sem acesso à internet', 'sinal fraco', 'offline'], nome: 'confiabilidade — funcionamento sem rede', principal: 'Confiabilidade' },
    { chaves: ['criptograf', 'acesso restrito', 'autorização', 'auditoria', 'sigilos', 'senha', 'impedir a alteração'], nome: 'segurança', principal: 'Segurança' },
    { chaves: ['compatív', 'android', 'ios', 'chrome', 'firefox', 'edge', 'navegador'], nome: 'compatibilidade', principal: 'Compatibilidade' },
    { chaves: ['acessív', 'wcag', 'responsivo', 'celular', 'tablet', 'idioma'], nome: 'usabilidade e acessibilidade', principal: 'Usabilidade' },
    { chaves: ['anos', 'no mínimo', 'armazenad'], nome: 'manutenibilidade — retenção de dados', principal: 'Manutenibilidade' },
  ];
  function categoriaDoRequisito(requisito) {
    if (!requisito || requisito.tipo !== 'nao-funcional') return null;
    const texto = (requisito.texto || '').toLowerCase();
    const cat = CATEGORIAS_NAO_FUNCIONAL.find(c => c.chaves.some(k => texto.includes(k)));
    return cat ? cat.principal : null;
  }
  function explicarClassificacao(requisito) {
    if (!requisito) return '';
    if (requisito.tipo === 'funcional') {
      return 'É funcional porque descreve uma AÇÃO que o sistema executa — algo que o usuário faz ou recebe do sistema.';
    }
    const texto = (requisito.texto || '').toLowerCase();
    const categoria = CATEGORIAS_NAO_FUNCIONAL.find(cat => cat.chaves.some(k => texto.includes(k)));
    return categoria
      ? `É não funcional: descreve uma qualidade de ${categoria.nome} — COMO o sistema se comporta, não uma ação.`
      : 'É não funcional porque descreve COMO o sistema deve se comportar (uma qualidade), não uma ação específica.';
  }

  // ---------------------------------------------------------------------
  // TEMAS_PADRAO — os 6 mundos "de fábrica" do app (usados tanto pro seed
  // inicial quanto pra migração de quem já tinha dados salvos no navegador)
  // ---------------------------------------------------------------------
  const TEMAS_PADRAO = [
    {
      id: 't-restaurante', nome: 'Sistema de Restaurante', icone: 'assets/icons/world-restaurante.svg',
      gradStart: '#f97316', gradEnd: '#dc2626', descricao: 'Pedidos, cardápio e pagamentos', unlockTier: 1,
      fundo: 'assets/backgrounds/bg-restaurante.jpg',
    },
    {
      id: 't-escola', nome: 'Sistema de Escola', icone: 'assets/icons/world-escola.svg',
      gradStart: '#2563eb', gradEnd: '#16a34a', descricao: 'Matrículas, notas e frequência', unlockTier: 1,
      fundo: 'assets/backgrounds/bg-escola.jpg',
    },
    {
      id: 't-espacial', nome: 'Estação Espacial', icone: 'assets/icons/world-espacial.svg',
      gradStart: '#1e1b4b', gradEnd: '#7c3aed', descricao: 'Naves, tripulação e experimentos', unlockTier: 2,
      fundo: 'assets/backgrounds/bg-espacial.jpg',
    },
    {
      id: 't-pirata', nome: 'Navio Pirata', icone: 'assets/icons/world-pirata.svg',
      gradStart: '#78350f', gradEnd: '#1e293b', descricao: 'Tesouros, tripulação e navegação', unlockTier: 3,
      fundo: 'assets/backgrounds/bg-pirata.jpg',
    },
    {
      id: 't-assombrado', nome: 'Parque Assombrado', icone: 'assets/icons/world-assombrado.svg',
      gradStart: '#4c1d95', gradEnd: '#065f46', descricao: 'Ingressos, atrações e sustos', unlockTier: 4,
      fundo: 'assets/backgrounds/bg-assombrado.jpg',
    },
    {
      id: 't-detetives', nome: 'Agência de Detetives', icone: 'assets/icons/world-detetives.svg',
      gradStart: '#57534e', gradEnd: '#b45309', descricao: 'Casos, evidências e investigações', unlockTier: 5,
      fundo: 'assets/backgrounds/bg-detetives.jpg',
    },
  ];
  const TEMAS_PADRAO_POR_ID = Object.fromEntries(TEMAS_PADRAO.map(t => [t.id, t]));

  // Quem já tinha aberto o app antes (localStorage já populado) fica preso
  // na versão antiga dos temas — sem ícone novo e sem imagem de fundo — porque
  // o seed() só roda na primeira vez. Aqui a gente completa só o que falta
  // nos 6 mundos padrão (fundo/ícone), sem mexer em nome/descrição/mundos
  // customizados que a pessoa possa ter criado no CRUD.
  function migrarTemasPadrao() {
    const temas = read(KEYS.temas, null);
    if (!temas) return;
    let mudou = false;
    temas.forEach(t => {
      const padrao = TEMAS_PADRAO_POR_ID[t.id];
      if (!padrao) return; // mundo customizado pela usuária, não mexe
      if (!t.fundo) { t.fundo = padrao.fundo; mudou = true; }
      if (!t.icone || !t.icone.endsWith('.svg')) { t.icone = padrao.icone; mudou = true; }
    });
    if (mudou) write(KEYS.temas, temas);
  }

  // ---------------------------------------------------------------------
  // CONTEUDO_PADRAO — 16 requisitos por mundo (8 funcionais + 8 não
  // funcionais). Baralho grande o bastante pra segurar uma partida inteira
  // sem repetir carta; se mesmo assim acabar antes do tempo, o jogo encerra
  // com bônus em vez de reembaralhar e repetir (ver nextQuestion em game.js).
  // ---------------------------------------------------------------------
  const CONTEUDO_PADRAO = {
      't-restaurante': {
        funcionais: [
          'O sistema deve permitir fazer pedidos pelo aplicativo.',
          'O sistema deve permitir cadastrar pratos no cardápio.',
          'O sistema deve calcular o valor total da conta.',
          'O sistema deve permitir dividir a conta entre clientes.',
          'O sistema deve emitir nota fiscal do pedido.',
          'O sistema deve permitir reservar mesas com antecedência.',
          'O sistema deve permitir aplicar cupons de desconto.',
          'O sistema deve permitir avaliar o atendimento após o pedido.',
        ],
        naoFuncionais: [
          'O sistema deve responder a pedidos em no máximo 2 segundos.',
          'O sistema deve suportar 500 usuários simultâneos.',
          'O sistema deve estar disponível 99% do tempo.',
          'O sistema deve ser compatível com Android e iOS.',
          'O sistema deve criptografar os dados de pagamento.',
          'O sistema deve permitir customizar o cardápio conforme o idioma do cliente.',
          'O sistema deve registrar logs de todas as transações financeiras.',
          'O sistema deve se recuperar automaticamente após uma queda de conexão.',
        ],
      },
      't-escola': {
        funcionais: [
          'O sistema deve permitir matricular alunos.',
          'O sistema deve permitir lançar notas e frequência.',
          'O sistema deve gerar boletim do aluno.',
          'O sistema deve permitir agendar reuniões com os pais.',
          'O sistema deve enviar comunicados aos responsáveis.',
          'O sistema deve permitir emitir declaração de matrícula.',
          'O sistema deve permitir cadastrar o calendário letivo.',
          'O sistema deve permitir professores lançarem atividades online.',
        ],
        naoFuncionais: [
          'O sistema deve ser acessível para alunos com deficiência (WCAG).',
          'O sistema deve suportar acesso simultâneo de 1000 usuários.',
          'O sistema deve manter backup diário dos dados.',
          'O sistema deve carregar páginas em até 3 segundos.',
          'O sistema deve funcionar em Chrome, Firefox e Edge.',
          'O sistema deve criptografar os dados pessoais dos alunos.',
          'O sistema deve funcionar corretamente em conexões de internet lentas.',
          'O sistema deve permitir atualização sem interromper o uso dos usuários.',
        ],
      },
      't-espacial': {
        funcionais: [
          'O sistema deve permitir agendar o reabastecimento da nave.',
          'O sistema deve permitir monitorar os níveis de oxigênio dos módulos.',
          'O sistema deve registrar a escala de turnos da tripulação.',
          'O sistema deve permitir solicitar manutenção de equipamentos.',
          'O sistema deve gerar relatório dos experimentos científicos realizados.',
          'O sistema deve permitir registrar anomalias detectadas pelos sensores.',
          'O sistema deve permitir simular rotas de pouso.',
          'O sistema deve gerar alertas de colisão com detritos espaciais.',
        ],
        naoFuncionais: [
          'O sistema deve continuar funcionando mesmo sem conexão com a Terra.',
          'O sistema deve responder a comandos críticos em menos de 1 segundo.',
          'O sistema deve resistir a falhas de energia sem perder dados.',
          'O sistema deve criptografar toda comunicação com a base terrestre.',
          'O sistema deve operar de forma estável em temperaturas extremas.',
          'O sistema deve suportar radiação cósmica sem corromper dados.',
          'O sistema deve consumir o mínimo de energia possível.',
          'O sistema deve permitir operação manual em caso de falha da IA de bordo.',
        ],
      },
      't-pirata': {
        funcionais: [
          'O sistema deve permitir registrar a localização de tesouros no mapa.',
          'O sistema deve permitir dividir o butim entre os tripulantes.',
          'O sistema deve permitir cadastrar novos membros da tripulação.',
          'O sistema deve permitir planejar a rota de navegação.',
          'O sistema deve registrar o histórico de batalhas navais.',
          'O sistema deve permitir negociar trocas em portos.',
          'O sistema deve permitir marcar áreas de perigo no mapa.',
          'O sistema deve registrar o consumo de mantimentos da tripulação.',
        ],
        naoFuncionais: [
          'O sistema deve funcionar mesmo sem acesso à internet em alto mar.',
          'O sistema deve ser resistente a condições climáticas adversas.',
          'O sistema deve permitir acesso apenas ao capitão e imediatos.',
          'O sistema deve responder a comandos em menos de 2 segundos durante combate.',
          'O sistema deve manter o histórico de navegação por pelo menos 5 anos.',
          'O sistema deve funcionar mesmo com equipamentos antigos a bordo.',
          'O sistema deve avisar sobre tempestades com antecedência.',
          'O sistema deve manter os registros protegidos mesmo se o navio afundar.',
        ],
      },
      't-assombrado': {
        funcionais: [
          'O sistema deve permitir comprar ingressos para as atrações.',
          'O sistema deve permitir avaliar o nível de susto de cada atração.',
          'O sistema deve permitir reservar horários para atrações lotadas.',
          'O sistema deve enviar notificações sobre o tempo de espera na fila.',
          'O sistema deve permitir cadastrar novas atrações assombradas.',
          'O sistema deve permitir cancelar ingressos com reembolso.',
          'O sistema deve permitir montar roteiros personalizados de visita.',
          'O sistema deve enviar avisos sobre atrações temporariamente fechadas.',
        ],
        naoFuncionais: [
          'O sistema deve suportar picos de acesso em datas como o Halloween.',
          'O sistema deve carregar as imagens das atrações em até 2 segundos.',
          'O sistema deve funcionar corretamente em ambientes com pouca luz.',
          'O sistema deve ser responsivo em celulares e tablets.',
          'O sistema deve manter 99,5% de disponibilidade durante eventos especiais.',
          'O sistema deve funcionar em áreas do parque com sinal de internet fraco.',
          'O sistema deve manter os dados dos visitantes protegidos por criptografia.',
          'O sistema deve suportar uso simultâneo por milhares de visitantes em feriados.',
        ],
      },
      't-detetives': {
        funcionais: [
          'O sistema deve permitir abrir um novo caso de investigação.',
          'O sistema deve permitir anexar evidências e fotos ao caso.',
          'O sistema deve permitir relacionar suspeitos a um caso.',
          'O sistema deve gerar um relatório final da investigação.',
          'O sistema deve permitir agendar interrogatórios.',
          'O sistema deve permitir classificar casos por nível de prioridade.',
          'O sistema deve permitir gerar linha do tempo dos eventos do caso.',
          'O sistema deve permitir compartilhar um caso com outra unidade policial.',
        ],
        naoFuncionais: [
          'O sistema deve criptografar os dados sigilosos dos casos.',
          'O sistema deve manter registro de auditoria de quem acessou cada caso.',
          'O sistema deve permitir acesso restrito por nível de autorização do detetive.',
          'O sistema deve responder às buscas em menos de 3 segundos mesmo com milhares de casos.',
          'O sistema deve manter os dados armazenados por no mínimo 10 anos.',
          'O sistema deve impedir a alteração de evidências já registradas.',
          'O sistema deve funcionar mesmo em locais sem sinal de internet.',
          'O sistema deve gerar backups automáticos a cada 24 horas.',
        ],
      },
  };

  // Mesmo raciocínio da migração dos temas: quem já tinha uma partida salva
  // ficou com só os 10 requisitos antigos por mundo. Aqui a gente adiciona
  // os que faltam (comparando pelo texto) nos mundos padrão, sem duplicar
  // nem mexer em requisitos customizados que a pessoa tenha criado.
  function migrarRequisitosPadrao() {
    const requisitos = read(KEYS.requisitos, null);
    if (!requisitos) return;
    let mudou = false;
    Object.entries(CONTEUDO_PADRAO).forEach(([temaId, grupos]) => {
      const textosExistentes = new Set(requisitos.filter(r => r.temaId === temaId).map(r => r.texto));
      grupos.funcionais.forEach(texto => {
        if (!textosExistentes.has(texto)) { requisitos.push({ id: uid(), temaId, texto, tipo: 'funcional' }); mudou = true; }
      });
      grupos.naoFuncionais.forEach(texto => {
        if (!textosExistentes.has(texto)) { requisitos.push({ id: uid(), temaId, texto, tipo: 'nao-funcional' }); mudou = true; }
      });
    });
    if (mudou) write(KEYS.requisitos, requisitos);
  }

  // ---------------------------------------------------------------------
  // SEED — popula os 6 mundos padrão na primeira vez que o app abre.
  // ---------------------------------------------------------------------
  function seed() {
    if (localStorage.getItem(KEYS.temas)) {
      migrarTemasPadrao();
      migrarRequisitosPadrao();
      return;
    }

    const temas = TEMAS_PADRAO;

    const requisitos = [];
    Object.entries(CONTEUDO_PADRAO).forEach(([temaId, grupos]) => {
      grupos.funcionais.forEach(texto => requisitos.push({ id: uid(), temaId, texto, tipo: 'funcional' }));
      grupos.naoFuncionais.forEach(texto => requisitos.push({ id: uid(), temaId, texto, tipo: 'nao-funcional' }));
    });

    write(KEYS.temas, temas);
    write(KEYS.requisitos, requisitos);
    write(KEYS.partidas, []);
  }

  return {
    seed,
    RANKS,
    XP_PER_LEVEL,
    rankForLevel,
    powerupsForTier,
    explicarClassificacao,
    categoriaDoRequisito,

    // ---------- TEMAS ----------
    getTemas() { return read(KEYS.temas, []); },
    getTema(id) { return read(KEYS.temas, []).find(t => t.id === id); },
    addTema(tema) {
      const temas = read(KEYS.temas, []);
      const novo = { id: uid(), gradStart: '#2563eb', gradEnd: '#7c3aed', icone: 'assets/icons/world-detetives.svg', fundo: '', unlockTier: 1, ...tema };
      temas.push(novo);
      write(KEYS.temas, temas);
      return novo;
    },
    updateTema(id, dados) { write(KEYS.temas, read(KEYS.temas, []).map(t => t.id === id ? { ...t, ...dados } : t)); },
    deleteTema(id) {
      write(KEYS.temas, read(KEYS.temas, []).filter(t => t.id !== id));
      write(KEYS.requisitos, read(KEYS.requisitos, []).filter(r => r.temaId !== id));
    },

    // ---------- REQUISITOS ----------
    getRequisitos(temaId) {
      const all = read(KEYS.requisitos, []);
      return temaId ? all.filter(r => r.temaId === temaId) : all;
    },
    addRequisito(req) {
      const requisitos = read(KEYS.requisitos, []);
      const novo = { id: uid(), ...req };
      requisitos.push(novo);
      write(KEYS.requisitos, requisitos);
      return novo;
    },
    updateRequisito(id, dados) { write(KEYS.requisitos, read(KEYS.requisitos, []).map(r => r.id === id ? { ...r, ...dados } : r)); },
    deleteRequisito(id) { write(KEYS.requisitos, read(KEYS.requisitos, []).filter(r => r.id !== id)); },

    // ---------- PARTIDAS ----------
    getPartidas() { return read(KEYS.partidas, []); },
    addPartida(partida) {
      const partidas = read(KEYS.partidas, []);
      const nova = { id: uid(), data: new Date().toISOString(), ...partida };
      partidas.unshift(nova);
      write(KEYS.partidas, partidas);
      return nova;
    },

    // ---------- PROGRESSO DO JOGADOR (XP, nível, badges) ----------
    getPlayerProgress() {
      return read(KEYS.player, { xp: 0, badges: [] });
    },
    currentLevel() {
      return Math.floor(this.getPlayerProgress().xp / XP_PER_LEVEL) + 1;
    },
    currentTier() {
      return rankForLevel(this.currentLevel()).tier;
    },
    addXP(amount) {
      const p = this.getPlayerProgress();
      const levelBefore = Math.floor(p.xp / XP_PER_LEVEL) + 1;
      p.xp = Math.max(0, p.xp + amount);
      const levelAfter = Math.floor(p.xp / XP_PER_LEVEL) + 1;
      write(KEYS.player, p);
      return { ...p, leveledUp: levelAfter > levelBefore, level: levelAfter };
    },
    unlockBadge(badgeId) {
      const p = this.getPlayerProgress();
      if (p.badges.includes(badgeId)) return { ...p, isNew: false };
      p.badges.push(badgeId);
      write(KEYS.player, p);
      return { ...p, isNew: true };
    },
    resetProgress() {
      write(KEYS.player, { xp: 0, badges: [] });
      write(KEYS.partidas, []);
    },
  };
})();

DB.seed();
