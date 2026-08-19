import { z } from "zod";

export const menuSetItemSchema = z.object({
  menuItemId: z.string(),
  quantity: z.coerce.number().min(1, "Quantity must be at least 1"),
});

export const menuSetSchema = z.object({
  name: z.string().trim().min(2, "Enter a set name").max(150),
  description: z.string().trim().max(500).optional(),
  price: z.coerce.number().min(0, "Enter a valid price"),
  available: z.boolean(),
  items: z.array(menuSetItemSchema).min(1, "Select at least one dish"),
});

export type MenuSetInput = z.input<typeof menuSetSchema>;
export type MenuSetValues = z.output<typeof menuSetSchema>;
