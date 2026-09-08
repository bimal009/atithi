import { z } from "zod";

export const addOnMenuSchema = z.object({
  name: z.string().trim().min(2, "Enter an add-on name").max(100),
  price: z.coerce.number().min(0, "Enter a valid price"),
});

export type AddOnMenuInput = z.input<typeof addOnMenuSchema>;
export type AddOnMenuValues = z.output<typeof addOnMenuSchema>;

export const dishSchema = z.object({
  foodType: z.enum(["veg", "non-veg", "vegan", "egg"]),
  name: z.string().trim().min(2, "Enter a dish name").max(150),
  category: z.string().min(1, "Select a category"),
  price: z.coerce.number().min(0, "Enter a valid price"),
  discount: z.string().trim().optional(),
  description: z.string().trim().max(1000).optional(),
  ingredients: z.string().trim().max(1000).optional(),
  available: z.boolean(),
});

export type DishInput = z.input<typeof dishSchema>;
export type DishValues = z.output<typeof dishSchema>;

export const menuSetMenuSchema = z.object({
  name: z.string().trim().min(2, "Enter a set name").max(150),
  description: z.string().trim().max(500).optional(),
  price: z.coerce.number().min(0, "Enter a valid price"),
});

export type MenuSetMenuInput = z.input<typeof menuSetMenuSchema>;
export type MenuSetMenuValues = z.output<typeof menuSetMenuSchema>;
