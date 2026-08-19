import { useCallback, useEffect, useState } from 'react';
import * as db from '../data/db';

// Como usePartidas, mas escopado ao usuário logado (GET /usuarios/me/partidas).
// `enabled` existe porque o hook precisa ser chamado incondicionalmente em
// RelatoriosPage (regra dos hooks) mesmo quando o usuário é ADM e não precisa
// desses dados — nesse caso a chamada de rede é simplesmente pulada.
export function useMinhasPartidas(enabled) {
  const [partidas, setPartidas] = useState([]);
  const [loading, setLoading] = useState(enabled);

  const refresh = useCallback(async () => {
    if (!enabled) return [];
    const data = await db.getMinhasPartidas();
    setPartidas(data);
    return data;
  }, [enabled]);

  useEffect(() => {
    if (!enabled) { setLoading(false); return; }
    setLoading(true);
    refresh().catch((err) => console.error('Falha ao carregar minhas partidas:', err)).finally(() => setLoading(false));
  }, [enabled, refresh]);

  return { partidas, loading, refresh };
}
