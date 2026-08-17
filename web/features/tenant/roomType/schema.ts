import { z } from "zod";

export const roomTypeSchema = z.object({
  name: z.string().trim().min(2, "Enter a name").max(255),
  basePrice: z.coerce.number().min(0, "Enter a valid price"),
  pricingUnit: z.enum(["night", "hour", "daycation", "package"]),
  pricingLabel: z.string().trim().max(100).optional(),
  capacity: z.coerce.number().int().min(1, "Capacity must be at least 1"),
  description: z.string().trim().max(2000).optional(),
  amenities: z.string().trim().optional(),
});

export type RoomTypeInput = z.input<typeof roomTypeSchema>;
export type RoomTypeValues = z.output<typeof roomTypeSchema>;
