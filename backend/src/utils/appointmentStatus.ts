export const appointmentStatus = ["Agendado", "Em análise", "Cancelado"] as const;

export const AppointmentStatusEnum = {
  SCHEDULED: appointmentStatus[0],
  UNDER_REVIEW: appointmentStatus[1],
  CANCELED: appointmentStatus[2],
} as const;

export type AppointmentStatus = typeof appointmentStatus[number];