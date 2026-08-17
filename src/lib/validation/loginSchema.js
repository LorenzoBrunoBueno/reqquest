import { z } from 'zod';

export const loginSchema = z.object({
  nome: z.string().trim().min(1, 'Digite seu nome completo.'),
  telefone: z.string().trim().min(1, 'Digite seu telefone.'),
  email: z.string().trim().min(1, 'Digite seu e-mail.').email('Digite um e-mail válido.'),
});
