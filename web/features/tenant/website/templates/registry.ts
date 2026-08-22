import type { TemplateDefinition } from "../types";
import { EditorialTemplate } from "./editorial-template";
import { MinimalTemplate } from "./minimal-template";

export const TEMPLATES: TemplateDefinition[] = [
  {
    id: "editorial",
    name: "Editorial",
    tagline: "Warm, full-bleed hero, rounded cards — an inviting boutique-hotel feel.",
    Component: EditorialTemplate,
  },
  {
    id: "minimal",
    name: "Minimal",
    tagline: "Split hero, sticky index rail, hairline chrome — quiet and editorial.",
    Component: MinimalTemplate,
  },
];

export const TEMPLATE_MODE: Record<string, "light" | "dark"> = {
  editorial: "light",
  minimal: "light",
};

export const DEFAULT_THEME_BY_TEMPLATE: Record<string, string> = {
  editorial: "amber",
  minimal: "emerald",
};

export const DEFAULT_FONT_PAIRING_BY_TEMPLATE: Record<string, string> = {
  editorial: "fraunces-public",
  minimal: "bricolage-manrope",
};
