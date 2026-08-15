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

export const loginSchema = z.object({
  phoneNumber: z
    .string()
    .regex(
      NEPALI_PHONE_REGEX,
      "Enter a 10 digit Nepali mobile number starting with 98 or 97",
    ),
  acceptedTerms: z.boolean().refine((value) => value === true, {
    message: "Accept the terms and conditions to continue",
  }),
});

export const otpSchema = z.object({
  otp: z.string().regex(OTP_REGEX, `Enter the ${OTP_LENGTH}-digit code`),
});

export const onboardingSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Enter your full name")
    .max(100, "Keep it under 100 characters"),
  email: z.email("Enter a valid email address"),
  // Optional, and an empty string has to survive the resolver untouched so the
  // field can be left blank.
  image: z
    .union([z.url("Enter a valid image URL"), z.literal("")])
    .optional(),
});

export type LoginValues = z.infer<typeof loginSchema>;
export type OtpValues = z.infer<typeof otpSchema>;
export type OnboardingValues = z.infer<typeof onboardingSchema>;
