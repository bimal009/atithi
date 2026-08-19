import { z } from "zod";

export const addOnSchema = z.object({
  name: z.string().trim().min(2, "Enter an add-on name").max(150),
  imageUrl: z.string().trim().optional(),
  price: z.coerce.number().min(0, "Enter a valid price"),
  available: z.boolean(),
});

export type AddOnInput = z.input<typeof addOnSchema>;
export type AddOnValues = z.output<typeof addOnSchema>;
