import { z } from "zod";
export const RoomCreateOrUpdateSchema = z.object({
  name: z.string().min(2).optional(),
  start_time: z
    .string()
    .regex(
      /^([01]\d|2[0-3]):([0-5]\d):([0-5]\d)$/,
      "Horário deve estar no formato HH:MM:SS"
    ),
  end_time: z
    .string()
    .regex(
      /^([01]\d|2[0-3]):([0-5]\d):([0-5]\d)$/,
      "Horário deve estar no formato HH:MM:SS"
    ),
  time_blocks: z.array(z.number()).optional(),
});
