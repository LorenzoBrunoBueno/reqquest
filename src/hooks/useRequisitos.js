import { useCallback, useEffect, useState } from 'react';
import * as db from '../data/db';

export function useRequisitos(temaId) {
  const [requisitos, setRequisitos] = useState([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    const data = await db.getRequisitos(temaId);
    setRequisitos(data);
    return data;
  }, [temaId]);

  useEffect(() => {
    setLoading(true);
    refresh().catch((err) => console.error('Falha ao carregar requisitos:', err)).finally(() => setLoading(false));
  }, [refresh]);

  const addRequisito = useCallback(async (req) => {
    const novo = await db.addRequisito(req);
    await refresh();
    return novo;
  }, [refresh]);

  const updateRequisito = useCallback(async (id, dados) => {
    await db.updateRequisito(id, dados);
    await refresh();
  }, [refresh]);

  const deleteRequisito = useCallback(async (id) => {
    await db.deleteRequisito(id);
    await refresh();
  }, [refresh]);

  return { requisitos, loading, refresh, addRequisito, updateRequisito, deleteRequisito };
}
