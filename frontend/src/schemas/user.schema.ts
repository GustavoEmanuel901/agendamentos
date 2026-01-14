import { z } from "zod";

export const userSchema = z.object({
  name: z
    .string()
    .min(2, "Nome deve ter pelo menos 2 caracteres")
    .nonempty("Nome é obrigatório"),
  last_name: z
    .string()
    .min(2, "Sobrenome deve ter pelo menos 2 caracteres")
    .nonempty("Sobrenome é obrigatório"),
  email: z.string().email("E-mail inválido").nonempty("E-mail é obrigatório"),
  password: z
    .string()
    .min(6, "Senha deve ter pelo menos 6 caracteres")
    .nonempty("Senha é obrigatória"),
  zip_code: z
    .string()
    .regex(/^\d{5}-\d{3}$/, "CEP no formato 00000-000")
    .nonempty("CEP é obrigatório"),
  address: z.string().nonempty("Endereço é obrigatório"),
  number: z.string().nonempty("Número é obrigatório"),
  supplement: z.string().optional(),
  neighborhood: z.string().nonempty("Bairro é obrigatório"),
  city: z.string().nonempty("Cidade é obrigatória"),
  state: z.string().nonempty("Estado é obrigatório"),
});

export type UserFormData = z.infer<typeof userSchema>;
