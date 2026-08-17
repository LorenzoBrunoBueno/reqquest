/**
 * apiClient.js
 * Único ponto que conhece a URL base do backend e o formato de erro dele
 * (`{ erro, detalhes? }`). db.js e auth.js chamam só `apiFetch` — se a URL
 * base ou o envelope de erro do backend mudar, só este arquivo muda.
 */
const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

let getToken = () => null;
/** Chamado uma vez por auth.js, pra apiClient conseguir anexar o Bearer token
 * sem precisar importar auth.js diretamente (evitaria dependência circular). */
export function setTokenGetter(fn) {
  getToken = fn;
}

export class ApiError extends Error {
  constructor(message, status, detalhes) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.detalhes = detalhes;
  }
}

export async function apiFetch(path, { method = 'GET', body, auth = false } = {}) {
  // FormData (upload de arquivo, ex.: ícone/fundo de mundo) precisa ir sem
  // Content-Type manual — o navegador gera o boundary do multipart sozinho;
  // definir esse header à mão (ou fazer JSON.stringify num FormData) corrompe
  // a requisição.
  const isFormData = typeof FormData !== 'undefined' && body instanceof FormData;
  const headers = {};
  if (!isFormData && body !== undefined) headers['Content-Type'] = 'application/json';
  if (auth) {
    const token = getToken();
    if (token) headers.Authorization = `Bearer ${token}`;
  }

  let res;
  try {
    res = await fetch(`${BASE_URL}${path}`, {
      method,
      headers,
      body: body === undefined ? undefined : isFormData ? body : JSON.stringify(body),
    });
  } catch {
    throw new ApiError('Não foi possível conectar ao servidor. Verifique sua conexão.', 0);
  }

  if (res.status === 204) return null;

  const data = await res.json().catch(() => null);

  if (!res.ok) {
    const mensagem = data?.erro || `Erro inesperado (${res.status})`;
    throw new ApiError(mensagem, res.status, data?.detalhes);
  }

  return data;
}
