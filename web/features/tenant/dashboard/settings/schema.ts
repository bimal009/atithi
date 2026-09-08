import { z } from "zod";

export const aboutSettingsSchema = z.object({
  aboutUs: z.string().trim().max(5000, "Keep it under 5000 characters").optional().or(z.literal("")),
  amenities: z.string().optional(),
});

export type AboutSettingsInput = z.input<typeof aboutSettingsSchema>;
export type AboutSettingsValues = z.output<typeof aboutSettingsSchema>;

export const billingSettingsSchema = z.object({
  currency: z.string().length(3),
  taxPercent: z.coerce.number().min(0, "Cannot be negative").max(100, "Cannot exceed 100"),
  serviceChargePercent: z.coerce
    .number()
    .min(0, "Cannot be negative")
    .max(100, "Cannot exceed 100"),
});

export type BillingSettingsInput = z.input<typeof billingSettingsSchema>;
export type BillingSettingsValues = z.output<typeof billingSettingsSchema>;

export const hoursSettingsSchema = z.object({
  openingTime: z.string().optional().or(z.literal("")),
  closingTime: z.string().optional().or(z.literal("")),
});

export type HoursSettingsValues = z.infer<typeof hoursSettingsSchema>;

export const locationSettingsSchema = z.object({
  mapUrl: z.string().trim().url("Paste a valid Google Maps link").optional().or(z.literal("")),
  whatsappNumber: z.string().trim().optional().or(z.literal("")),
});

export type LocationSettingsInput = z.input<typeof locationSettingsSchema>;
export type LocationSettingsValues = z.output<typeof locationSettingsSchema>;
