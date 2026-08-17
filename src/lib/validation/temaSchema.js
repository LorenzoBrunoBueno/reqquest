import { z } from 'zod';

// icone/fundo não entram mais aqui — deixaram de ser texto validado e
// passaram a ser arquivo (ver TemaModalContent.jsx), enviados direto no
// FormData sem passar pelo Zod do formulário.
export const temaSchema = z.object({
  nome: z.string().trim().min(1, 'Digite o nome do mundo.'),
  descricao: z.string().trim().optional().default(''),
  gradStart: z.string(),
  gradEnd: z.string(),
  unlockTier: z.coerce.number().int().min(1).max(5),
});
