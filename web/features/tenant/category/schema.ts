import { z } from "zod";

export const categorySchema = z.object({
  name: z.string().trim().min(1, "Enter a name").max(100),
  subMenuId: z.string().trim().min(1, "Select a sub-menu"),
});

export type CategoryInput = z.input<typeof categorySchema>;
export type CategoryValues = z.output<typeof categorySchema>;
