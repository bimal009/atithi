import {
  Bricolage_Grotesque,
  Fraunces,
  Fredoka,
  Karla,
  Manrope,
  Newsreader,
  Nunito,
  Public_Sans,
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

// Citrus — playful vibrant resort
export const citrusDisplay = Fredoka({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-citrus-display",
});
export const citrusBody = Nunito({
  subsets: ["latin"],
  weight: ["400", "600"],
  variable: "--font-citrus-body",
});
