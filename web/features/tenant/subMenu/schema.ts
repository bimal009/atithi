import { z } from "zod";

export const subMenuSchema = z.object({
  name: z.string().trim().min(1, "Enter a name").max(100),
  description: z.string().trim().max(500).optional(),
});

export type SubMenuInput = z.input<typeof subMenuSchema>;
export type SubMenuValues = z.output<typeof subMenuSchema>;
