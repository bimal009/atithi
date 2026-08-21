export type SiteContent = {
  heroHeading: string;
  heroSubheading: string;
  aboutHeading: string;
  aboutBody: string;
  ctaLabel: string;
};

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
