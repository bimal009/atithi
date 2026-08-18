import { z } from "zod";

export const menuItemSchema = z.object({
  name: z.string().trim().min(2, "Enter a dish name").max(150),
  imageUrl: z.string().trim().optional(),
  category: z.string().trim().min(1, "Enter a category").max(100),
  foodType: z.enum(["veg", "non-veg", "vegan", "egg"]),
  price: z.coerce.number().min(0, "Enter a valid price"),
  discount: z.coerce.number().min(0).optional(),
  description: z.string().trim().max(1000).optional(),
  ingredients: z.string().trim().max(1000).optional(),
  available: z.boolean(),
});

export type MenuItemInput = z.input<typeof menuItemSchema>;
export type MenuItemValues = z.output<typeof menuItemSchema>;
