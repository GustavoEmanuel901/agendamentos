import { z } from "zod";

export const roomSchema = z.object({
  horario_inicio: z.string().min(1, "Horário é obrigatório"),
  horario_fim: z.string().min(1, "Horário é obrigatório"),
  nome: z.string().min(1, "Nome da sala é obrigatório"),
});

export type RoomFormData = z.infer<typeof roomSchema>;
