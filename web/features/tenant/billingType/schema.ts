import { z } from "zod";

export const billingTypeSchema = z.object({
  name: z.string().trim().min(1, "Enter a name").max(100),
});

export type BillingTypeInput = z.input<typeof billingTypeSchema>;
export type BillingTypeValues = z.output<typeof billingTypeSchema>;
