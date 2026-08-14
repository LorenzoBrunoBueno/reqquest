/**
 * auth.js
 * RF01 - Login (nome, telefone, e-mail) — identifica o jogador, sem senha.
 * RF02 - Exibição do nome do usuário logado + logout via chip de perfil.
 */

const Auth = (() => {
  const KEY = 'rq_usuario_logado_v2';

  function initials(nome) {
    const parts = nome.trim().split(/\s+/);
    const first = parts[0]?.[0] || '';
    const last = parts.length > 1 ? parts[parts.length - 1][0] : '';
    return (first + last).toUpperCase();
  }

  return {
    getUsuario() {
      const raw = localStorage.getItem(KEY);
      return raw ? JSON.parse(raw) : null;
    },
    login(nome, telefone, email) {
      const usuario = { nome, telefone, email };
      localStorage.setItem(KEY, JSON.stringify(usuario));
      return usuario;
    },
    logout() { localStorage.removeItem(KEY); },
    initials,
  };
})();
