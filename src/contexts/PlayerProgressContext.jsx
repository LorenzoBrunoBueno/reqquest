import { createContext, useContext } from 'react';
import { usePlayerProgressState } from '../hooks/usePlayerProgress';

const PlayerProgressContext = createContext(null);

export function PlayerProgressProvider({ children }) {
  const value = usePlayerProgressState();
  return <PlayerProgressContext.Provider value={value}>{children}</PlayerProgressContext.Provider>;
}

export function usePlayerProgress() {
  const ctx = useContext(PlayerProgressContext);
  if (!ctx) throw new Error('usePlayerProgress precisa estar dentro de <PlayerProgressProvider>');
  return ctx;
}
