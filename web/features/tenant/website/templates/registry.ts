import type { TemplateDefinition } from "../types";
import { MeridianTemplate } from "./meridian-template";
import { StonehouseTemplate } from "./stonehouse-template";

export const TEMPLATES: TemplateDefinition[] = [
  {
    id: "stonehouse",
    name: "Stonehouse",
    tagline: "Warm editorial — framed hero, serif headlines, calm neutrals.",
    Component: StonehouseTemplate,
  },
  {
    id: "meridian",
    name: "Meridian",
    tagline: "Architectural — full-bleed imagery, bold structured type.",
    Component: MeridianTemplate,
  },
];

export const TEMPLATE_MODE: Record<string, "light" | "dark"> = {
  stonehouse: "light",
  meridian: "light",
};

export const DEFAULT_THEME_BY_TEMPLATE: Record<string, string> = {
  stonehouse: "amber",
  meridian: "deafult",
};

export const DEFAULT_FONT_PAIRING_BY_TEMPLATE: Record<string, string> = {
  stonehouse: "fraunces-public",
  meridian: "bricolage-manrope",
};
