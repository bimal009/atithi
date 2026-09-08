import { z } from "zod";

export const bookingSchema = z.object({
  guestName: z.string().trim().min(2, "Enter the guest's name").max(100),
  guestPhone: z.string().trim().min(7, "Enter a phone number").max(20),
  roomId: z.string().min(1, "Select a room"),
  channel: z.enum(["whatsapp", "instagram", "facebook"]),
  guests: z.coerce.number().int().min(1, "At least 1 guest"),
  notes: z.string().trim().max(1000).optional(),
});

export type BookingInput = z.input<typeof bookingSchema>;
export type BookingValues = z.output<typeof bookingSchema>;
