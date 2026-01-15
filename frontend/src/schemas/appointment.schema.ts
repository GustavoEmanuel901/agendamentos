import { z } from "zod";

export const appointmentSchema = z.object({
  date: z.string().min(1, "Data é obrigatória"),
  time: z.string().min(1, "Horário é obrigatório"),
  room_id: z.string(),
});

export type AppointmentFormData = z.infer<typeof appointmentSchema>;
