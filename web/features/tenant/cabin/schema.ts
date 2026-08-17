import { z } from "zod";

export const cabinSchema = z.object({
  name: z.string().trim().min(2, "Enter a name").max(255),
  number: z.string().trim().min(1, "Enter a cabin number").max(20),
  basePrice: z.coerce.number().min(0, "Enter a valid price"),
  pricingUnit: z.enum(["night", "hour", "daycation", "package"]),
  pricingLabel: z.string().trim().max(100).optional(),
  capacity: z.coerce.number().int().min(1, "Capacity must be at least 1"),
  description: z.string().trim().max(2000).optional(),
  amenities: z.string().trim().optional(),
  restrictions: z.string().trim().optional(),
});

export type CabinInput = z.input<typeof cabinSchema>;
export type CabinValues = z.output<typeof cabinSchema>;
