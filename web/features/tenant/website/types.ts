import type { Cabin } from "@/features/tenant/cabin/types";
import type { Hotel } from "@/features/hotel/types";
import type { MenuItem } from "@/features/tenant/menuItem/types";
import type { RoomType } from "@/features/tenant/roomType/types";
import type { DiningTable } from "@/features/tenant/table/types";

export type TemplateId = "stonehouse";

export const SECTION_KEYS = [
  "rooms",
  "cabins",
  "gallery",
  "restaurant",
  "testimonials",
  "contact",
] as const;

export type SectionKey = (typeof SECTION_KEYS)[number];

export const SECTION_LABELS: Record<SectionKey, string> = {
  rooms: "Rooms",
  cabins: "Cabins",
  gallery: "Gallery",
  restaurant: "Restaurant & menu",
  testimonials: "Testimonials",
  contact: "Contact",
};

export type SiteContent = {
  heroEyebrow: string;
  heroHeading: string;
  heroSubheading: string;
  ctaPrimaryLabel: string;
  ctaSecondaryLabel: string;
  aboutHeading: string;
  aboutBody: string;
  roomsHeading: string;
  roomsSubheading: string;
  cabinsHeading: string;
  cabinsSubheading: string;
  galleryHeading: string;
  restaurantHeading: string;
  restaurantSubheading: string;
  contactHeading: string;
  contactBody: string;
  heroImageUrl?: string;
  aboutImageUrl?: string;
  enabledSections?: Partial<Record<SectionKey, boolean>>;
};

export function isSectionEnabled(content: SiteContent, key: SectionKey): boolean {
  return content.enabledSections?.[key] !== false;
}

export type SiteData = {
  hotel: Hotel;
  roomTypes: RoomType[];
  cabins: Cabin[];
  tables: DiningTable[];
  menuItems: MenuItem[];
  galleryImages: string[];
  formatMoney: (amount: number) => string;
  content: SiteContent;
};

export type ThemeId = string;

export type TemplateComponentProps = {
  data: SiteData;
  themeId: ThemeId;
  editable?: boolean;
  onContentChange?: (patch: Partial<SiteContent>) => void;
};

export type TemplateDefinition = {
  id: TemplateId;
  name: string;
  tagline: string;
  Component: React.ComponentType<TemplateComponentProps>;
};

export function defaultSiteContent(hotel: Hotel): SiteContent {
  return {
    heroEyebrow: hotel.address ?? "A place to stay",
    heroHeading: hotel.name,
    heroSubheading:
      hotel.description ?? "A place to slow down, eat well, and sleep even better.",
    ctaPrimaryLabel: "Book your stay",
    ctaSecondaryLabel: "Explore rooms",
    aboutHeading: "About us",
    aboutBody:
      hotel.description ??
      "Tell your guests what makes a stay here different — the story, the setting, the people.",
    roomsHeading: "Rooms",
    roomsSubheading: "Considered spaces, dressed simply, built for rest.",
    cabinsHeading: "Cabins",
    cabinsSubheading: "For guests who want a little more room to breathe.",
    galleryHeading: "Gallery",
    restaurantHeading: "Restaurant & dining",
    restaurantSubheading: "A short, seasonal menu, cooked with care.",
    contactHeading: "Your stay starts here",
    contactBody: "Reach out and we'll help you plan the details.",
  };
}
