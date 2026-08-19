import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import * as authDb from '../data/auth';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(null);
  const [loading, setLoading] = useState(true);

  // Restaura a sessão a partir do token salvo (se houver) quando o app carrega.
  // Antes essa leitura era síncrona (localStorage); agora é uma chamada de
  // rede (GET /usuarios/me), então existe uma janela de carregamento — ver
  // App.jsx, que espera `loading` virar false antes de decidir Login vs App.
  useEffect(() => {
    authDb.fetchUsuarioAtual().then(setUsuario).finally(() => setLoading(false));
  }, []);

  const verificarEmail = useCallback((email) => authDb.verificarEmail(email), []);

  const registrar = useCallback(async (nome, telefone, email, senha) => {
    const novo = await authDb.registrar(nome, telefone, email, senha);
    setUsuario(novo);
    return novo;
  }, []);

  const login = useCallback(async (email, senha) => {
    const novo = await authDb.login(email, senha);
    setUsuario(novo);
    return novo;
  }, []);

  const logout = useCallback(() => {
    authDb.logout();
    setUsuario(null);
  }, []);

  const isAdmin = usuario?.role === 'ADM';

  return (
    <AuthContext.Provider
      value={{ usuario, loading, isAdmin, verificarEmail, registrar, login, logout, initials: authDb.initials }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth precisa estar dentro de <AuthProvider>');
  return ctx;
}
