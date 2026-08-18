import { z } from "zod";

export const sectionSchema = z.object({
  name: z.string().trim().min(1, "Enter a name").max(100),
});

export type SectionInput = z.input<typeof sectionSchema>;
export type SectionValues = z.output<typeof sectionSchema>;
