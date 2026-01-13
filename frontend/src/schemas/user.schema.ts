import { z } from "zod";

export const userSchema = z.object({
  nome: z
    .string()
    .min(2, "Nome deve ter pelo menos 2 caracteres")
    .nonempty("Nome é obrigatório"),
  sobrenome: z
    .string()
    .min(2, "Sobrenome deve ter pelo menos 2 caracteres")
    .nonempty("Sobrenome é obrigatório"),
  email: z.string().email("E-mail inválido").nonempty("E-mail é obrigatório"),
  senha: z
    .string()
    .min(6, "Senha deve ter pelo menos 6 caracteres")
    .nonempty("Senha é obrigatória"),
  cep: z
    .string()
    .regex(/^\d{5}-\d{3}$/, "CEP no formato 00000-000")
    .nonempty("CEP é obrigatório"),
  endereco: z.string().optional(),
  numero: z.string().optional(),
  complemento: z.string().optional(),
  bairro: z.string().optional(),
  cidade: z.string().optional(),
  estado: z.string().optional(),
});

export type UserFormData = z.infer<typeof userSchema>;
