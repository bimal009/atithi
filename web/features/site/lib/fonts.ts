import { Fraunces, Public_Sans } from "next/font/google";

export const siteDisplay = Fraunces({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
  variable: "--font-site-display",
});

export const siteBody = Public_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-site-body",
});

export const siteFontClass = `${siteDisplay.variable} ${siteBody.variable}`;
