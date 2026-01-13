import { z } from "zod";

export const appointmentSchema = z.object({
  data: z.string().min(1, "Data é obrigatória"),
  horario: z.string().min(1, "Horário é obrigatório"),
  sala_id: z
    .string()
    .min(1, "Sala é obrigatória")
    .transform((val) => Number(val)),
});

export type AppointmentFormData = z.infer<typeof appointmentSchema>;
