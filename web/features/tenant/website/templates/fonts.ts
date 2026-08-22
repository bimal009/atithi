import {
  Bricolage_Grotesque,
  Fraunces,
  Instrument_Serif,
  Karla,
  Manrope,
  Newsreader,
  Public_Sans,
  Work_Sans,
} from "next/font/google";

// Aurora — dark editorial luxury
export const auroraDisplay = Fraunces({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
  variable: "--font-aurora-display",
});
export const auroraBody = Public_Sans({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-aurora-body",
});

// Verdant — organic resort warmth
export const verdantDisplay = Newsreader({
  subsets: ["latin"],
  weight: ["500", "600"],
  style: ["italic", "normal"],
  variable: "--font-verdant-display",
});
export const verdantBody = Karla({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-verdant-body",
});

// Onyx — bento-grid boutique/tech
export const onyxDisplay = Bricolage_Grotesque({
  subsets: ["latin"],
  weight: ["500", "700", "800"],
  variable: "--font-onyx-display",
});
export const onyxBody = Manrope({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-onyx-body",
});

// Estate — grand editorial display, for hero-scale headlines
export const estateDisplay = Instrument_Serif({
  subsets: ["latin"],
  weight: ["400"],
  style: ["normal", "italic"],
  variable: "--font-estate-display",
});
export const estateBody = Work_Sans({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-estate-body",
});
