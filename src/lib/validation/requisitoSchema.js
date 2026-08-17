import { z } from 'zod';

export const requisitoSchema = z.object({
  texto: z.string().trim().min(1, 'Digite o texto do requisito.'),
  temaId: z.string().trim().min(1, 'Selecione um mundo.'),
  tipo: z.enum(['funcional', 'nao-funcional']),
});
