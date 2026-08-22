import type { SiteContent } from "@/features/tenant/website/types";

export type { SiteContent };

export type HotelWebsite = {
  hotelId: string;
  template: string;
  theme: string;
  fontPairing: string;
  content: SiteContent;
  createdAt: string;
  updatedAt: string;
};

export type UpdateHotelWebsiteInput = {
  template?: string;
  theme?: string;
  fontPairing?: string;
  content?: SiteContent;
};
