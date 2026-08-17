import { useCallback, useEffect, useState } from 'react';
import * as db from '../data/db';

export function usePartidas() {
  const [partidas, setPartidas] = useState([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    const data = await db.getPartidas();
    setPartidas(data);
    return data;
  }, []);

  useEffect(() => {
    refresh().catch((err) => console.error('Falha ao carregar partidas:', err)).finally(() => setLoading(false));
  }, [refresh]);

  // Retorna { partida, progresso, badgesNovas } — ver data/db.js. Não chama
  // refresh() automaticamente porque GamePage precisa do resultado bruto
  // antes de decidir o que mostrar na tela de fim de jogo; quem chamar isso
  // e precisar da lista atualizada de partidas deve chamar refresh() depois.
  const addPartida = useCallback((dados) => db.addPartida(dados), []);

  return { partidas, loading, refresh, addPartida };
}
