import { Instrument_Sans } from "next/font/google";

export const site2Display = Instrument_Sans({
  subsets: ["latin"],
  weight: ["500", "600"],
  variable: "--font-site2-display",
});

export const site2Body = Instrument_Sans({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-site2-body",
});

export const site2FontClass = `${site2Display.variable} ${site2Body.variable}`;
