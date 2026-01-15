import { z } from "zod";
import { appointmentStatus } from "../utils/appointmentStatus";
export const appointmentCreateSchema = z.object({
  date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Data deve estar no formato YYYY-MM-DD"),
  time: z
    .string()
    .regex(
      /^([01]\d|2[0-3]):([0-5]\d)$/,
      "Horário deve estar no formato HH:MM"
    ),
  room_id: z.string(),
});


export const appointmentUpdateSchema = z.object({
  status: z.enum(appointmentStatus).optional(),
  room_id: z.number().optional(),
});
