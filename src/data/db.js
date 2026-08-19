/**
 * db.js
 * Antes: camada de dados mock em localStorage. Agora: chama o backend real
 * via apiFetch. A superfície de funções continua a mesma (mesmos nomes,
 * mesmos formatos de objeto) — só passou a ser assíncrona, porque virou
 * rede em vez de leitura síncrona de disco. Ver .claude/docs/integration-plan.md
 * na raiz do monorepo para o mapeamento completo endpoint a endpoint.
 *
 * O que NÃO existe mais aqui (porque passou a viver no backend): uid(),
 * seed()/migrações, e addXP/unlockBadge como chamadas separadas — tudo isso
 * agora é responsabilidade do backend (POST /partidas devolve XP e badges
 * novos numa única resposta; ver features/game em GamePage.jsx).
 */
import { apiFetch } from './apiClient';

// ---------------------------------------------------------------------
// RANKS — título muda conforme o nível de consultor(a) do jogador.
// Puramente derivado de `xp` no cliente; o backend nunca serve rank/tier.
// ---------------------------------------------------------------------
export const RANKS = [
  { min: 1, max: 2, title: 'Estagiário(a) de Requisitos', tier: 1 },
  { min: 3, max: 4, title: 'Analista Júnior', tier: 2 },
  { min: 5, max: 7, title: 'Analista Pleno', tier: 3 },
  { min: 8, max: 10, title: 'Arquiteto(a) de Requisitos', tier: 4 },
  { min: 11, max: Infinity, title: 'Mestre dos Requisitos', tier: 5 },
];
export function rankForLevel(level) {
  return RANKS.find(r => level >= r.min && level <= r.max) || RANKS[0];
}

export const XP_PER_LEVEL = 100;

export function powerupsForTier(tier) {
  return {
    dica: tier,
    'tempo-extra': Math.min(3, Math.ceil(tier / 2)),
    pular: Math.min(3, Math.ceil((tier + 1) / 2)),
  };
}

// ---------------------------------------------------------------------
// CLASSIFICAÇÃO EXPLICADA — puramente textual, sem dependência do backend.
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
export function categoriaDoRequisito(requisito) {
  if (!requisito || requisito.tipo !== 'nao-funcional') return null;
  const texto = (requisito.texto || '').toLowerCase();
  const cat = CATEGORIAS_NAO_FUNCIONAL.find(c => c.chaves.some(k => texto.includes(k)));
  return cat ? cat.principal : null;
}
export function explicarClassificacao(requisito) {
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
// TEMAS
// ---------------------------------------------------------------------
export function getTemas() {
  return apiFetch('/temas');
}
export async function getTema(id) {
  try {
    return await apiFetch(`/temas/${id}`);
  } catch (err) {
    if (err.status === 404) return null;
    throw err;
  }
}
export function addTema(tema) {
  return apiFetch('/temas', { method: 'POST', body: tema, auth: true });
}
export function updateTema(id, dados) {
  return apiFetch(`/temas/${id}`, { method: 'PUT', body: dados, auth: true });
}
export function deleteTema(id) {
  return apiFetch(`/temas/${id}`, { method: 'DELETE', auth: true });
}

// ---------------------------------------------------------------------
// REQUISITOS
// ---------------------------------------------------------------------
export function getRequisitos(temaId) {
  const query = temaId ? `?temaId=${encodeURIComponent(temaId)}` : '';
  return apiFetch(`/requisitos${query}`);
}
export function addRequisito(req) {
  return apiFetch('/requisitos', { method: 'POST', body: req, auth: true });
}
export function updateRequisito(id, dados) {
  return apiFetch(`/requisitos/${id}`, { method: 'PUT', body: dados, auth: true });
}
export function deleteRequisito(id) {
  return apiFetch(`/requisitos/${id}`, { method: 'DELETE', auth: true });
}

// ---------------------------------------------------------------------
// PARTIDAS
// ---------------------------------------------------------------------
// Ordem cronológica (mais antiga primeiro) — é o que o gráfico de evolução
// em Relatórios (ScoreChart) espera; a tabela de ranking na mesma tela
// reordena por pontuação no próprio componente, então não depende disso.
export function getPartidas() {
  return apiFetch('/partidas?orderBy=data&order=asc');
}
// Igual a getPartidas, mas escopado ao usuário logado — usado no gráfico de
// evolução em Relatórios quando o usuário é um JOGADOR comum (ver
// useMinhasPartidas), pra não misturar a pontuação de todo mundo na "sua"
// evolução.
export function getMinhasPartidas() {
  return apiFetch('/usuarios/me/partidas?order=asc', { auth: true });
}
/**
 * Registra uma partida inteira numa só chamada: o backend calcula XP,
 * nível e badges novos numa transação e devolve tudo junto — substitui o
 * addPartida+addXP+checkAfterGame separados que o mock fazia. `auth: true`
 * anexa o token se o jogador estiver logado; sem token, o backend aceita
 * a partida mesmo assim (jogo anônimo), só sem XP/badges.
 * Retorna `{ partida, progresso: {xp,level,leveledUp} | null, badgesNovas: string[] }`.
 */
export function addPartida(dados) {
  return apiFetch('/partidas', { method: 'POST', body: dados, auth: true });
}

// ---------------------------------------------------------------------
// PROGRESSO DO JOGADOR (XP, badges) — exige estar logado
// ---------------------------------------------------------------------
export async function getPlayerProgress() {
  return apiFetch('/usuarios/me/progresso', { auth: true });
}
export async function resetProgress() {
  return apiFetch('/usuarios/me/reset', { method: 'POST', auth: true });
}
