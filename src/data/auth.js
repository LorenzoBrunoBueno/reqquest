/**
 * auth.js — antes lia/gravava um objeto de usuário direto no localStorage;
 * agora guarda só o token JWT devolvido por POST /auth/login e busca os
 * dados do usuário no backend (GET /usuarios/me) quando precisa.
 * RF01 - Login (nome, telefone, e-mail) — identifica o jogador, sem senha.
 * RF02 - Exibição do nome do usuário logado + logout.
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

export async function login(nome, telefone, email) {
  const data = await apiFetch('/auth/login', { method: 'POST', body: { nome, telefone, email } });
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
