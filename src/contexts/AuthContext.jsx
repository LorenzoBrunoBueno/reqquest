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

  // Cada identidade (nome+telefone+email) agora é uma conta permanente no
  // backend, com seu próprio progresso — não existe mais "resetar progresso
  // porque é outra pessoa" no cliente (ver .claude/docs/integration-plan.md,
  // §4.1): logar com uma identidade diferente simplesmente entra na conta
  // dessa pessoa (nova ou já existente), sem afetar quem estava logado antes.
  const login = useCallback(async (nome, telefone, email) => {
    const novo = await authDb.login(nome, telefone, email);
    setUsuario(novo);
    return novo;
  }, []);

  const logout = useCallback(() => {
    authDb.logout();
    setUsuario(null);
  }, []);

  return (
    <AuthContext.Provider value={{ usuario, loading, login, logout, initials: authDb.initials }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth precisa estar dentro de <AuthProvider>');
  return ctx;
}
