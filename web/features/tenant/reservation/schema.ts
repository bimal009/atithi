import { z } from "zod";

export const reservationSchema = z
  .object({
    tableIds: z.array(z.string()),
    cabinIds: z.array(z.string()),
    guestName: z.string().trim().min(2, "Enter a guest name").max(255),
    guestPhone: z.string().trim().min(7, "Enter a valid phone number").max(20),
    partySize: z.coerce.number().int().min(1, "Party size must be at least 1"),
    reservedAt: z.string().min(1, "Pick a date and time"),
    notes: z.string().trim().max(1000).optional(),
  })
  .refine((values) => values.tableIds.length > 0 || values.cabinIds.length > 0, {
    message: "Select at least one table or cabin",
    path: ["tableIds"],
  });

export type ReservationInput = z.input<typeof reservationSchema>;
export type ReservationValues = z.output<typeof reservationSchema>;
