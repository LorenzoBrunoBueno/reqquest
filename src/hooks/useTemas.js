import { useCallback, useEffect, useState } from 'react';
import * as db from '../data/db';

export function useTemas() {
  const [temas, setTemas] = useState([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    const data = await db.getTemas();
    setTemas(data);
    return data;
  }, []);

  useEffect(() => {
    refresh().catch((err) => console.error('Falha ao carregar temas:', err)).finally(() => setLoading(false));
  }, [refresh]);

  const addTema = useCallback(async (tema) => {
    const novo = await db.addTema(tema);
    await refresh();
    return novo;
  }, [refresh]);

  const updateTema = useCallback(async (id, dados) => {
    await db.updateTema(id, dados);
    await refresh();
  }, [refresh]);

  const deleteTema = useCallback(async (id) => {
    await db.deleteTema(id);
    await refresh();
  }, [refresh]);

  return { temas, loading, refresh, addTema, updateTema, deleteTema };
}

export function useTema(id) {
  const [tema, setTema] = useState(null);
  const refresh = useCallback(async () => {
    const data = id ? await db.getTema(id) : null;
    setTema(data);
    return data;
  }, [id]);
  useEffect(() => { refresh().catch((err) => console.error('Falha ao carregar tema:', err)); }, [refresh]);
  return { tema, refresh };
}
