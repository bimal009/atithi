import { z } from "zod";

export const tableSchema = z.object({
  name: z.string().trim().min(1, "Enter a table name").max(50),
  capacity: z.coerce.number().int().min(1, "Capacity must be at least 1"),
  sectionId: z.string().min(1, "Select a section"),
});

export type TableInput = z.input<typeof tableSchema>;
export type TableValues = z.output<typeof tableSchema>;
