import { z } from "zod";

import { NEPALI_PHONE_REGEX } from "@/features/auth/schema";

export const addMemberSchema = z.object({
  phone: z
    .string()
    .regex(
      NEPALI_PHONE_REGEX,
      "Enter a 10 digit Nepali mobile number starting with 98 or 97",
    ),
  roleId: z.string().min(1, "Select a role"),
});

export type AddMemberValues = z.infer<typeof addMemberSchema>;

export const updateMemberSchema = z.object({
  roleId: z.string().min(1, "Select a role"),
  status: z.enum(["active", "inactive"]),
});

export type UpdateMemberValues = z.infer<typeof updateMemberSchema>;
