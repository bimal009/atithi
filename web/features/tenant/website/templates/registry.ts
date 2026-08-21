import type { TemplateDefinition } from "../types";
import { AuroraTemplate } from "./aurora-template";
import { CitrusTemplate } from "./citrus-template";
import { OnyxTemplate } from "./onyx-template";
import { ResortTemplate } from "./resort-template";
import { VerdantTemplate } from "./verdant-template";

export const TEMPLATES: TemplateDefinition[] = [
  {
    id: "aurora",
    name: "Aurora",
    tagline: "Dark, editorial, refined — for a boutique or heritage property.",
    Component: AuroraTemplate,
  },
  {
    id: "verdant",
    name: "Verdant",
    tagline: "Warm and organic — for resorts, lodges and nature retreats.",
    Component: VerdantTemplate,
  },
  {
    id: "onyx",
    name: "Onyx",
    tagline: "Bento-grid, high-contrast — for an urban or design-forward hotel.",
    Component: OnyxTemplate,
  },
  {
    id: "citrus",
    name: "Citrus",
    tagline: "Playful and vibrant — for hostels, cafés and casual stays.",
    Component: CitrusTemplate,
  },
  {
    id: "resort",
    name: "Resort",
    tagline: "Multi-page booking layout — Home, Rooms and Contact.",
    Component: ResortTemplate,
  },
];

export const TEMPLATE_MODE: Record<string, "light" | "dark"> = {
  aurora: "dark",
  verdant: "light",
  onyx: "dark",
  citrus: "light",
  resort: "light",
};

export const DEFAULT_THEME_BY_TEMPLATE: Record<string, string> = {
  aurora: "amber",
  verdant: "emerald",
  onyx: "lime",
  citrus: "orange",
  resort: "rose",
};

export const DEFAULT_FONT_PAIRING_BY_TEMPLATE: Record<string, string> = {
  aurora: "fraunces-public",
  verdant: "newsreader-karla",
  onyx: "bricolage-manrope",
  citrus: "fredoka-nunito",
  resort: "fraunces-public",
};
