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
