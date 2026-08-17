import { useCallback, useEffect, useState } from 'react';
import * as db from '../data/db';
import { useAuth } from '../contexts/AuthContext';

// Uso interno apenas pelo <PlayerProgressProvider> (contexts/PlayerProgressContext.jsx) —
// componentes devem consumir usePlayerProgress() exportado de lá, que compartilha uma
// única instância deste estado entre toda a árvore (Topbar/Sidebar precisam ver o mesmo
// XP/badges que GamePage acabou de atualizar).
export function usePlayerProgressState() {
  const { usuario } = useAuth();
  const [progress, setProgress] = useState({ xp: 0, badges: [] });
  const [loading, setLoading] = useState(true);

  // Sem sessão não existe progresso pra buscar (o endpoint exige token) —
  // fica no default {xp:0, badges:[]}, igual a um jogador anônimo.
  const refresh = useCallback(async () => {
    if (!usuario) { setProgress({ xp: 0, badges: [] }); return null; }
    const data = await db.getPlayerProgress();
    setProgress(data);
    return data;
  }, [usuario]);

  useEffect(() => {
    setLoading(true);
    refresh().catch((err) => console.error('Falha ao carregar progresso:', err)).finally(() => setLoading(false));
  }, [refresh]);

  const level = Math.floor(progress.xp / db.XP_PER_LEVEL) + 1;
  const xpIntoLevel = progress.xp % db.XP_PER_LEVEL;
  const rank = db.rankForLevel(level);
  const tier = rank.tier;

  /**
   * Aplica direto no estado local o resultado que POST /partidas já devolveu
   * (ver data/db.js::addPartida), sem precisar de uma segunda chamada de
   * rede: `progresso` traz {xp,level,leveledUp}, `badgesNovas` traz só os ids
   * NOVOS (não a lista inteira) — por isso mescla com os badges já existentes
   * em vez de substituir. Se `progresso` vier null (partida anônima, sem
   * usuário logado), não há nada a atualizar.
   */
  const applyPartidaResult = useCallback((progresso, badgesNovas = []) => {
    if (!progresso) return;
    setProgress((prev) => ({
      xp: progresso.xp,
      badges: badgesNovas.length ? [...prev.badges, ...badgesNovas] : prev.badges,
    }));
  }, []);

  const resetProgress = useCallback(async () => {
    const data = await db.resetProgress();
    setProgress(data);
  }, []);

  return { progress, level, xpIntoLevel, tier, rank, loading, refresh, applyPartidaResult, resetProgress };
}
