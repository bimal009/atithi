import { z } from "zod";

export const roleSchema = z.object({
  name: z.string().trim().min(2, "Enter a role name").max(100),
  description: z.string().trim().max(500).optional(),
  permissionIds: z.array(z.string()).min(1, "Select at least one permission"),
});

export type RoleValues = z.infer<typeof roleSchema>;
