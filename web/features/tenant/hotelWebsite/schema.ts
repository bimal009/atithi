import { z } from "zod";

export const websiteSchema = z.object({
  // Navbar
  logoDisplay: z.enum(["logo", "text", "both"]),

  // Hero section
  heroEyebrow: z.string().trim().max(100).optional().or(z.literal("")),
  heroHeading: z.string().trim().max(200).optional().or(z.literal("")),
  heroSubheading: z.string().trim().max(500).optional().or(z.literal("")),
  ctaPrimaryLabel: z.string().trim().max(60).optional().or(z.literal("")),
  ctaSecondaryLabel: z.string().trim().max(60).optional().or(z.literal("")),

  aboutHeading: z.string().trim().max(200).optional().or(z.literal("")),
  aboutBody: z.string().trim().max(2000).optional().or(z.literal("")),

  roomsHeading: z.string().trim().max(200).optional().or(z.literal("")),
  roomsSubheading: z.string().trim().max(500).optional().or(z.literal("")),

  cabinsHeading: z.string().trim().max(200).optional().or(z.literal("")),
  cabinsSubheading: z.string().trim().max(500).optional().or(z.literal("")),

  galleryHeading: z.string().trim().max(200).optional().or(z.literal("")),

  restaurantHeading: z.string().trim().max(200).optional().or(z.literal("")),
  restaurantSubheading: z.string().trim().max(500).optional().or(z.literal("")),

  contactHeading: z.string().trim().max(200).optional().or(z.literal("")),
  contactBody: z.string().trim().max(1000).optional().or(z.literal("")),
});

export type WebsiteValues = z.infer<typeof websiteSchema>;
