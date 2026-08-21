import type { Cabin } from "@/features/tenant/cabin/types";
import type { Hotel } from "@/features/hotel/types";
import type { MenuItem } from "@/features/tenant/menuItem/types";
import type { RoomType } from "@/features/tenant/roomType/types";
import type { DiningTable } from "@/features/tenant/table/types";

export type TemplateId = "aurora" | "verdant" | "onyx" | "citrus" | "resort";

export type SiteContent = {
  heroHeading: string;
  heroSubheading: string;
  aboutHeading: string;
  aboutBody: string;
  ctaLabel: string;
};

export type SiteData = {
  hotel: Hotel;
  roomTypes: RoomType[];
  cabins: Cabin[];
  tables: DiningTable[];
  menuItems: MenuItem[];
  formatMoney: (amount: number) => string;
  content: SiteContent;
};

export type ThemeId = string;

export type TemplateDefinition = {
  id: TemplateId;
  name: string;
  tagline: string;
  Component: React.ComponentType<{ data: SiteData; themeId: ThemeId }>;
};

export function defaultSiteContent(hotel: Hotel): SiteContent {
  return {
    heroHeading: hotel.name,
    heroSubheading:
      hotel.description ?? "A place to slow down, eat well, and sleep even better.",
    aboutHeading: "About us",
    aboutBody:
      hotel.description ??
      "Tell your guests what makes a stay here different — the story, the setting, the people.",
    ctaLabel: "Get in touch",
  };
}
