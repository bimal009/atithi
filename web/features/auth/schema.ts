import { z } from "zod";

export const NEPAL_DIAL_CODE = "+977";
export const NEPALI_PHONE_REGEX = /^9[78]\d{8}$/;

export const OTP_LENGTH = 6;
export const OTP_REGEX = /^\d{6}$/;

export const normalizePhoneNumber = (value: string) => {
  const digits = value.replace(/\D/g, "");
  const local =
    digits.length > 10 && digits.startsWith("977") ? digits.slice(3) : digits;

  return local.replace(/^0+/, "").slice(0, 10);
};

export const otpSchema = z.object({
  otp: z.string().regex(OTP_REGEX, `Enter the ${OTP_LENGTH}-digit code`),
});

export const loginSchema = z.object({
  email: z.string().email("Enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

export const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(100),
  email: z.string().email("Enter a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export const profileSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Enter your full name")
    .max(100, "Keep it under 100 characters"),
  email: z.string().email("Enter a valid email address"),
  image: z
    .union([z.string().url("Enter a valid image URL"), z.literal("")])
    .optional(),
});

export type OtpValues = z.infer<typeof otpSchema>;
export type LoginValues = z.infer<typeof loginSchema>;
export type RegisterValues = z.infer<typeof registerSchema>;
export type ProfileValues = z.infer<typeof profileSchema>;