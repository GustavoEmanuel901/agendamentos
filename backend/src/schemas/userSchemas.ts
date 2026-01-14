import z from "zod";

export const userCreateSchema = z.object({
  name: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
  last_name: z.string().min(2, "Sobrenome deve ter pelo menos 2 caracteres"),
  email: z.string().email("Email inválido"),
  password: z.string().min(6, "Senha deve ter pelo menos 6 caracteres"),
  zip_code: z.string().regex(/^\d{5}-?\d{3}$/, "CEP inválido"),
  address: z.string().optional(),
  number: z.string().optional(),
  complement: z.string().optional(),
  neighborhood: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
});

export const userUpdateSchema = z.object({
  name: z.string().min(2).optional(),
  last_name: z.string().min(2).optional(),
  email: z.string().email().optional(),
  zip_code: z
    .string()
    .regex(/^\d{5}-?\d{3}$/)
    .optional(),
  address: z.string().optional(),
  number: z.string().optional(),
  complement: z.string().optional(),
  neighborhood: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
});

export const userPermissionsUpdateSchema = z.object({
  logs: z.boolean().optional(),
  appointments: z.boolean().optional(),
  status: z.boolean().optional(),
});
