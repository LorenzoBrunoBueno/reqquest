/**
 * auth.js — guarda só o token JWT devolvido por POST /auth/login ou
 * /auth/registrar e busca os dados do usuário no backend (GET /usuarios/me)
 * quando precisa.
 * Login agora exige senha: a tela inicial (nome, telefone, e-mail) decide via
 * verificarEmail() se abre o modal de "criar senha" (registrar) ou "digitar
 * senha" (login) — ver LoginPage.jsx / SenhaModalContent.jsx.
 */
import { apiFetch, setTokenGetter } from './apiClient';

const TOKEN_KEY = 'rq_token_v1';

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}
function setToken(token) {
  localStorage.setItem(TOKEN_KEY, token);
}
function clearToken() {
  localStorage.removeItem(TOKEN_KEY);
}

// apiClient não importa este arquivo diretamente (evita import circular) —
// ele pede o token através deste getter, registrado uma única vez aqui.
setTokenGetter(getToken);

export function initials(nome) {
  const parts = nome.trim().split(/\s+/);
  const first = parts[0]?.[0] || '';
  const last = parts.length > 1 ? parts[parts.length - 1][0] : '';
  return (first + last).toUpperCase();
}

/** Decide, depois do nome/telefone/email, se o modal deve pedir pra criar
 * senha (primeiro acesso) ou digitar senha (email já cadastrado). */
export async function verificarEmail(email) {
  const data = await apiFetch('/auth/verificar-email', { method: 'POST', body: { email } });
  return data.cadastrado;
}

export async function registrar(nome, telefone, email, senha) {
  const data = await apiFetch('/auth/registrar', {
    method: 'POST',
    body: { nome, telefone, email, senha },
  });
  setToken(data.token);
  return data.usuario;
}

export async function login(email, senha) {
  const data = await apiFetch('/auth/login', { method: 'POST', body: { email, senha } });
  setToken(data.token);
  return data.usuario;
}

export function logout() {
  clearToken();
}

/** Busca o usuário da sessão atual a partir do token salvo — usado pra
 * restaurar a sessão quando o app carrega. Retorna null se não houver token
 * ou se o token salvo não for mais válido (backend fora do ar, expirado etc). */
export async function fetchUsuarioAtual() {
  if (!getToken()) return null;
  try {
    return await apiFetch('/usuarios/me', { auth: true });
  } catch {
    clearToken();
    return null;
  }
}
