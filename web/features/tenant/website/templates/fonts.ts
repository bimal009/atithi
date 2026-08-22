import {
  Bricolage_Grotesque,
  Cormorant_Garamond,
  DM_Sans,
  DM_Serif_Display,
  Fraunces,
  Inter,
  Instrument_Serif,
  Jost,
  Karla,
  Libre_Caslon_Display,
  Libre_Franklin,
  Manrope,
  Newsreader,
  Playfair_Display,
  Public_Sans,
  Roboto,
  Source_Sans_3,
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

// Heritage — classic luxury hotel serif
export const heritageDisplay = Playfair_Display({
  subsets: ["latin"],
  weight: ["600", "700"],
  style: ["normal", "italic"],
  variable: "--font-heritage-display",
});
export const heritageBody = Source_Sans_3({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-heritage-body",
});

// Orchard — elegant boutique serif, lighter touch
export const orchardDisplay = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  style: ["normal", "italic"],
  variable: "--font-orchard-display",
});
export const orchardBody = Jost({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-orchard-body",
});

// Atelier — clean modern editorial serif
export const atelierDisplay = DM_Serif_Display({
  subsets: ["latin"],
  weight: ["400"],
  style: ["normal", "italic"],
  variable: "--font-atelier-display",
});
export const atelierBody = DM_Sans({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-atelier-body",
});

// Caslon — bold vintage-luxury display
export const caslonDisplay = Libre_Caslon_Display({
  subsets: ["latin"],
  weight: ["400"],
  variable: "--font-caslon-display",
});
export const caslonBody = Libre_Franklin({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-caslon-body",
});

// Tripto — modern booking-platform sans, matches the Tripto Figma design system
export const triptoDisplay = Roboto({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-tripto-display",
});
export const triptoBody = Inter({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-tripto-body",
});
