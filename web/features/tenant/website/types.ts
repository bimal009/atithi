import type { Cabin } from "@/features/tenant/cabin/types";
import type { Hotel } from "@/features/hotel/types";
import type { MenuItem } from "@/features/tenant/menuItem/types";
import type { RoomType } from "@/features/tenant/roomType/types";
import type { DiningTable } from "@/features/tenant/table/types";

export type TemplateId = "editorial" | "minimal";

export const SECTION_KEYS = [
  "rooms",
  "cabins",
  "gallery",
  "restaurant",
  "testimonials",
  "amenities",
  "contact",
] as const;

export type SectionKey = (typeof SECTION_KEYS)[number];

export const SECTION_LABELS: Record<SectionKey, string> = {
  rooms: "Rooms",
  cabins: "Cabins",
  gallery: "Gallery",
  restaurant: "Restaurant & menu",
  testimonials: "Testimonials",
  amenities: "Amenities",
  contact: "Contact",
};

/** Home-page preview blocks the owner can drag into any order. */
export const HOME_SECTIONS = ["about", "topPicks", "amenities", "rooms", "cabins", "testimonials"] as const;

export type HomeSectionId = (typeof HOME_SECTIONS)[number];

export const HOME_SECTION_LABELS: Record<HomeSectionId, string> = {
  about: "About",
  topPicks: "Top picks",
  amenities: "Amenities",
  rooms: "Rooms",
  cabins: "Cabins",
  testimonials: "Testimonials",
};

export type TextStyleOverride = {
  color?: string;
  fontSize?: string;
  font?: "display" | "body";
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
  heroImageFileId?: string;
  aboutImageUrl?: string;
  aboutImageFileId?: string;
  logoUrl?: string;
  logoFileId?: string;
  logoDisplay?: "logo" | "text" | "both";
  enabledSections?: Partial<Record<SectionKey, boolean>>;
  sectionOrder?: HomeSectionId[];
  textStyles?: Record<string, TextStyleOverride>;
};

export function isSectionEnabled(content: SiteContent, key: SectionKey): boolean {
  return content.enabledSections?.[key] !== false;
}

export function homeSectionOrder(content: SiteContent): HomeSectionId[] {
  const saved = content.sectionOrder;
  if (!saved || saved.length === 0) return [...HOME_SECTIONS];
  const known = saved.filter((id): id is HomeSectionId => (HOME_SECTIONS as readonly string[]).includes(id));
  const missing = HOME_SECTIONS.filter((id) => !known.includes(id));
  return [...known, ...missing];
}

export type SiteTestimonial = {
  id: string;
  guestName: string;
  stayLabel?: string;
  quote: string;
  rating?: number;
};

export type SiteData = {
  hotel: Hotel;
  roomTypes: RoomType[];
  cabins: Cabin[];
  tables: DiningTable[];
  menuItems: MenuItem[];
  galleryImages: { url: string; section: string }[];
  amenities: string[];
  testimonials: SiteTestimonial[];
  sections: { id: string; name: string }[];
  openingTime?: string;
  closingTime?: string;
  openDays: string[];
  mapUrl?: string;
  formatMoney: (amount: number) => string;
  content: SiteContent;
};

export type ThemeId = string;

export type Page =
  | "home"
  | "rooms"
  | "room-detail"
  | "cabins"
  | "cabin-detail"
  | "gallery"
  | "restaurant"
  | "table-booking"
  | "contact";

export type TemplateComponentProps = {
  data: SiteData;
  themeId: ThemeId;
  editable?: boolean;
  onContentChange?: (patch: Partial<SiteContent>) => void;
  /** When provided (with `basePath`), navigation pushes real URLs instead of local state — used by the public site. */
  page?: Page;
  basePath?: string;
  /** Room/cabin id for the "room-detail" / "cabin-detail" pages. */
  detailId?: string;
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
    sectionOrder: [...HOME_SECTIONS],
  };
}
