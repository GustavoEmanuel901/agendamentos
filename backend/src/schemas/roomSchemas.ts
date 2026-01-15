import { z } from "zod";
export const RoomCreateOrUpdateSchema = z.object({
  name: z.string().min(2).optional(),
  start_time: z
    .string()
    .regex(
      /^([01]\d|2[0-3]):([0-5]\d)$/,
      "Horário deve estar no formato HH:MM"
    ),
  end_time: z
    .string()
    .regex(
      /^([01]\d|2[0-3]):([0-5]\d)$/,
      "Horário deve estar no formato HH:MM"
    ),
  time_blocks: z.array(z.number()).optional(),
});
