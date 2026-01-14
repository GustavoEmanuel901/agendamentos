import { z } from "zod";

export const roomSchema = z.object({
  start_time: z.string().min(1, "Horário é obrigatório"),
  end_time: z.string().min(1, "Horário é obrigatório"),
  name: z.string().min(1, "Nome da sala é obrigatório"),
});

export type RoomFormData = z.infer<typeof roomSchema>;
