import { z } from 'zod';

export const loginSchema = z.object({
  nome: z.string().trim().min(1, 'Digite seu nome completo.'),
  telefone: z.string().trim().min(1, 'Digite seu telefone.'),
  email: z.string().trim().min(1, 'Digite seu e-mail.').email('Digite um e-mail válido.'),
});

// Usado no modal de senha (SenhaModalContent) — tanto pra criar senha no
// primeiro acesso quanto pra digitar a senha num acesso recorrente.
export const senhaSchema = z
  .string()
  .min(8, 'A senha deve ter no mínimo 8 caracteres.');
