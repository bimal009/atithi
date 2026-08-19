import { z } from "zod";

export const categorySchema = z.object({
  name: z.string().trim().min(1, "Enter a name").max(100),
});

export type CategoryInput = z.input<typeof categorySchema>;
export type CategoryValues = z.output<typeof categorySchema>;
