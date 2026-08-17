import { z } from "zod";

export const reservationSchema = z.object({
  tableId: z.string().min(1, "Select a table"),
  guestName: z.string().trim().min(2, "Enter a guest name").max(255),
  guestPhone: z.string().trim().min(7, "Enter a valid phone number").max(20),
  partySize: z.coerce.number().int().min(1, "Party size must be at least 1"),
  reservedAt: z.string().min(1, "Pick a date and time"),
  reservedBy: z.string().trim().min(1, "Enter who's taking this reservation").max(100),
  notes: z.string().trim().max(1000).optional(),
});

export type ReservationInput = z.input<typeof reservationSchema>;
export type ReservationValues = z.output<typeof reservationSchema>;
