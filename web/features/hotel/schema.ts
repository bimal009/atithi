import { z } from "zod";

import { NEPALI_PHONE_REGEX } from "@/features/auth/schema";

export const SLUG_REGEX = /^[a-zA-Z0-9]+(?:-[a-zA-Z0-9]+)*$/;

export const slugify = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 255);

export const createHotelSchema = z.object({
  name: z.string().trim().min(2, "Enter the hotel name").max(255),
  slug: z
    .string()
    .trim()
    .min(2, "Enter a URL name")
    .max(255)
    .regex(SLUG_REGEX, "Use letters, numbers and single dashes only"),
  address: z.string().trim().min(5, "Enter the full address").max(500),
  phoneNumber: z
    .string()
    .regex(
      NEPALI_PHONE_REGEX,
      "Enter a 10 digit Nepali mobile number starting with 98 or 97",
    ),
  city: z.string().trim().max(100).optional(),
  email: z.union([z.email("Enter a valid email"), z.literal("")]).optional(),
  description: z.string().trim().max(2000).optional(),
});

export type CreateHotelValues = z.infer<typeof createHotelSchema>;
