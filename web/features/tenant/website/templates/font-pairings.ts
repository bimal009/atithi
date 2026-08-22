import {
  auroraBody,
  auroraDisplay,
  estateBody,
  estateDisplay,
  onyxBody,
  onyxDisplay,
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
];

export const ALL_FONT_VARIABLES = FONT_PAIRINGS.map((f) => f.className).join(" ");
