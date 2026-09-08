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

export const hotelSchema = z.object({
  id: z.string(),
  name: z.string().trim().min(2, "Enter the hotel name").max(255),
  description: z.string().trim().max(2000).optional(),
  address: z.string().trim().min(5, "Enter the full address").max(500),
  city: z.string().trim().max(100).optional(),
  phoneNumber: z
    .string()
    .regex(
      NEPALI_PHONE_REGEX,
      "Enter a 10 digit Nepali mobile number starting with 98 or 97",
    ),
  email: z.union([z.email("Enter a valid email"), z.literal("")]).optional(),
  isActive: z.boolean(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const createHotelSchema = hotelSchema.omit({
  id: true,
  isActive: true,
  createdAt: true,
  updatedAt: true,
});

export const updateHotelSchema = hotelSchema
  .omit({
    id: true,
    createdAt: true,
    updatedAt: true,
  })
  .partial();

export type Hotel = z.infer<typeof hotelSchema>;
export type CreateHotelInput = z.infer<typeof createHotelSchema>;
export type UpdateHotelInput = z.infer<typeof updateHotelSchema>;

export type CreateHotelValues = CreateHotelInput;
export type UpdateHotelValues = UpdateHotelInput;
