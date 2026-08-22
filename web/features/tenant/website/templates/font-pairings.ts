import {
  atelierBody,
  atelierDisplay,
  auroraBody,
  auroraDisplay,
  caslonBody,
  caslonDisplay,
  estateBody,
  estateDisplay,
  heritageBody,
  heritageDisplay,
  onyxBody,
  onyxDisplay,
  orchardBody,
  orchardDisplay,
  triptoBody,
  triptoDisplay,
  verdantBody,
  verdantDisplay,
} from "./fonts";

export type FontPairing = {
  id: string;
  label: string;
  displayVar: string;
  bodyVar: string;
  className: string;
};

export const FONT_PAIRINGS: FontPairing[] = [
  {
    id: "tripto-roboto-inter",
    label: "Roboto / Inter",
    displayVar: "var(--font-tripto-display)",
    bodyVar: "var(--font-tripto-body)",
    className: `${triptoDisplay.variable} ${triptoBody.variable}`,
  },
  {
    id: "fraunces-public",
    label: "Fraunces / Public Sans",
    displayVar: "var(--font-aurora-display)",
    bodyVar: "var(--font-aurora-body)",
    className: `${auroraDisplay.variable} ${auroraBody.variable}`,
  },
  {
    id: "newsreader-karla",
    label: "Newsreader / Karla",
    displayVar: "var(--font-verdant-display)",
    bodyVar: "var(--font-verdant-body)",
    className: `${verdantDisplay.variable} ${verdantBody.variable}`,
  },
  {
    id: "bricolage-manrope",
    label: "Bricolage / Manrope",
    displayVar: "var(--font-onyx-display)",
    bodyVar: "var(--font-onyx-body)",
    className: `${onyxDisplay.variable} ${onyxBody.variable}`,
  },
  {
    id: "instrument-work",
    label: "Instrument Serif / Work Sans",
    displayVar: "var(--font-estate-display)",
    bodyVar: "var(--font-estate-body)",
    className: `${estateDisplay.variable} ${estateBody.variable}`,
  },
  {
    id: "playfair-source",
    label: "Playfair Display / Source Sans 3",
    displayVar: "var(--font-heritage-display)",
    bodyVar: "var(--font-heritage-body)",
    className: `${heritageDisplay.variable} ${heritageBody.variable}`,
  },
  {
    id: "cormorant-jost",
    label: "Cormorant Garamond / Jost",
    displayVar: "var(--font-orchard-display)",
    bodyVar: "var(--font-orchard-body)",
    className: `${orchardDisplay.variable} ${orchardBody.variable}`,
  },
  {
    id: "dmserif-dmsans",
    label: "DM Serif Display / DM Sans",
    displayVar: "var(--font-atelier-display)",
    bodyVar: "var(--font-atelier-body)",
    className: `${atelierDisplay.variable} ${atelierBody.variable}`,
  },
  {
    id: "fraunces-dmsans",
    label: "Fraunces / DM Sans",
    displayVar: "var(--font-aurora-display)",
    bodyVar: "var(--font-atelier-body)",
    className: `${auroraDisplay.variable} ${atelierBody.variable}`,
  },
  {
    id: "librecaslon-franklin",
    label: "Libre Caslon Display / Libre Franklin",
    displayVar: "var(--font-caslon-display)",
    bodyVar: "var(--font-caslon-body)",
    className: `${caslonDisplay.variable} ${caslonBody.variable}`,
  },
];

export const ALL_FONT_VARIABLES = FONT_PAIRINGS.map((f) => f.className).join(" ");
