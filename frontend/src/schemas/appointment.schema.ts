import { z } from "zod";

export const appointmentSchema = z.object({
  date: z.string().min(1, "Data é obrigatória"),
  time: z.string().min(1, "Horário é obrigatório"),
  room_id: z.string().min(1, "Sala é obrigatória"),
});

export type AppointmentFormData = z.infer<typeof appointmentSchema>;
