import type { TemplateDefinition } from "../types";
import { HospitalitySite } from "./hospitality-site";

export const TEMPLATES: TemplateDefinition[] = [
  {
    id: "stonehouse",
    name: "Stonehouse",
    tagline: "Warm editorial — framed hero, serif headlines, calm neutrals.",
    Component: HospitalitySite,
  },
];

export const TEMPLATE_MODE: Record<string, "light" | "dark"> = {
  stonehouse: "light",
};

export const DEFAULT_THEME_BY_TEMPLATE: Record<string, string> = {
  stonehouse: "amber",
};

export const DEFAULT_FONT_PAIRING_BY_TEMPLATE: Record<string, string> = {
  stonehouse: "fraunces-public",
};
