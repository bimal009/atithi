import { z } from "zod";

export const DOCUMENT_TYPES = [
  "citizenship",
  "passport",
  "driving_license",
  "voter_id",
  "national_id",
] as const;

export const DOCUMENT_TYPE_LABELS: Record<(typeof DOCUMENT_TYPES)[number], string> = {
  citizenship: "Citizenship",
  passport: "Passport",
  driving_license: "Driving License",
  voter_id: "Voter ID",
  national_id: "National ID",
};

export const customerSchema = z
  .object({
    name: z.string().trim().min(2, "Enter the customer's name").max(255),
    phone: z.string().trim().min(7, "Enter a valid phone number").max(20),
    email: z.union([z.email("Enter a valid email"), z.literal("")]).optional(),
    notes: z.string().trim().max(2000).optional(),
    documentType: z.enum([...DOCUMENT_TYPES, "none"]),
    documentNumber: z.string().trim().max(100).optional(),
  })
  .refine((values) => values.documentType === "none" || !!values.documentNumber?.trim(), {
    message: "Enter the document number",
    path: ["documentNumber"],
  });

export type CustomerValues = z.infer<typeof customerSchema>;
