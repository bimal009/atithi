

type NeutralSet = {
  bg: string;
  fg: string;
  muted: string;
  card: string;
  border: string;
};

const LIGHT_NEUTRALS: NeutralSet = {
  bg: "oklch(1 0 0)",
  fg: "oklch(0.145 0 0)",
  muted: "oklch(0.556 0 0)",
  card: "oklch(1 0 0)",
  border: "oklch(0.922 0 0)",
};

const DARK_NEUTRALS: NeutralSet = {
  bg: "oklch(0.145 0 0)",
  fg: "oklch(0.985 0 0)",
  muted: "oklch(0.708 0 0)",
  card: "oklch(0.205 0 0)",
  border: "oklch(1 0 0 / 10%)",
};

export type ThemePreset = {
  id: string;
  label: string;
  swatch: string;
  light: { primary: string; primaryFg: string };
  dark: { primary: string; primaryFg: string };
};

export const THEME_PRESETS: ThemePreset[] = [
  { id: "tripto-blue", label: "Tripto Blue", swatch: "#0057FF", light: { primary: "#0057FF", primaryFg: "#FFFFFF" }, dark: { primary: "#0057FF", primaryFg: "#FFFFFF" } },
  { id: "clay", label: "Clay", swatch: "oklch(0.585 0.14 42)", light: { primary: "oklch(0.585 0.14 42)", primaryFg: "oklch(0.985 0.008 84)" }, dark: { primary: "oklch(0.585 0.14 42)", primaryFg: "oklch(0.985 0.008 84)" } },
  { id: "deafult", label: "Slate", swatch: "oklch(0.205 0 0)", light: { primary: "oklch(0.205 0 0)", primaryFg: "oklch(0.985 0 0)" }, dark: { primary: "oklch(0.922 0 0)", primaryFg: "oklch(0.205 0 0)" } },
  { id: "red", label: "Red", swatch: "oklch(0.505 0.213 27.518)", light: { primary: "oklch(0.505 0.213 27.518)", primaryFg: "oklch(0.971 0.013 17.38)" }, dark: { primary: "oklch(0.444 0.177 26.899)", primaryFg: "oklch(0.971 0.013 17.38)" } },
  { id: "orange", label: "Orange", swatch: "oklch(0.553 0.195 38.402)", light: { primary: "oklch(0.553 0.195 38.402)", primaryFg: "oklch(0.98 0.016 73.684)" }, dark: { primary: "oklch(0.47 0.157 37.304)", primaryFg: "oklch(0.98 0.016 73.684)" } },
  { id: "amber", label: "Amber", swatch: "oklch(0.555 0.163 48.998)", light: { primary: "oklch(0.555 0.163 48.998)", primaryFg: "oklch(0.987 0.022 95.277)" }, dark: { primary: "oklch(0.473 0.137 46.201)", primaryFg: "oklch(0.987 0.022 95.277)" } },
  { id: "yellow", label: "Yellow", swatch: "oklch(0.852 0.199 91.936)", light: { primary: "oklch(0.852 0.199 91.936)", primaryFg: "oklch(0.421 0.095 57.708)" }, dark: { primary: "oklch(0.795 0.184 86.047)", primaryFg: "oklch(0.421 0.095 57.708)" } },
  { id: "lime", label: "Lime", swatch: "oklch(0.841 0.238 128.85)", light: { primary: "oklch(0.841 0.238 128.85)", primaryFg: "oklch(0.405 0.101 131.063)" }, dark: { primary: "oklch(0.768 0.233 130.85)", primaryFg: "oklch(0.405 0.101 131.063)" } },
  { id: "green", label: "Green", swatch: "oklch(0.527 0.154 150.069)", light: { primary: "oklch(0.527 0.154 150.069)", primaryFg: "oklch(0.982 0.018 155.826)" }, dark: { primary: "oklch(0.448 0.119 151.328)", primaryFg: "oklch(0.982 0.018 155.826)" } },
  { id: "emerald", label: "Emerald", swatch: "oklch(0.508 0.118 165.612)", light: { primary: "oklch(0.508 0.118 165.612)", primaryFg: "oklch(0.979 0.021 166.113)" }, dark: { primary: "oklch(0.432 0.095 166.913)", primaryFg: "oklch(0.979 0.021 166.113)" } },
  { id: "teal", label: "Teal", swatch: "oklch(0.511 0.096 186.391)", light: { primary: "oklch(0.511 0.096 186.391)", primaryFg: "oklch(0.984 0.014 180.72)" }, dark: { primary: "oklch(0.437 0.078 188.216)", primaryFg: "oklch(0.984 0.014 180.72)" } },
  { id: "cyan", label: "Cyan", swatch: "oklch(0.52 0.105 223.128)", light: { primary: "oklch(0.52 0.105 223.128)", primaryFg: "oklch(0.984 0.019 200.873)" }, dark: { primary: "oklch(0.45 0.085 224.283)", primaryFg: "oklch(0.984 0.019 200.873)" } },
  { id: "sky", label: "Sky", swatch: "oklch(0.5 0.134 242.749)", light: { primary: "oklch(0.5 0.134 242.749)", primaryFg: "oklch(0.977 0.013 236.62)" }, dark: { primary: "oklch(0.443 0.11 240.79)", primaryFg: "oklch(0.977 0.013 236.62)" } },
  { id: "blue", label: "Blue", swatch: "oklch(0.488 0.243 264.376)", light: { primary: "oklch(0.488 0.243 264.376)", primaryFg: "oklch(0.97 0.014 254.604)" }, dark: { primary: "oklch(0.424 0.199 265.638)", primaryFg: "oklch(0.97 0.014 254.604)" } },
  { id: "indigo", label: "Indigo", swatch: "oklch(0.457 0.24 277.023)", light: { primary: "oklch(0.457 0.24 277.023)", primaryFg: "oklch(0.962 0.018 272.314)" }, dark: { primary: "oklch(0.398 0.195 277.366)", primaryFg: "oklch(0.962 0.018 272.314)" } },
  { id: "violet", label: "Violet", swatch: "oklch(0.491 0.27 292.581)", light: { primary: "oklch(0.491 0.27 292.581)", primaryFg: "oklch(0.969 0.016 293.756)" }, dark: { primary: "oklch(0.432 0.232 292.759)", primaryFg: "oklch(0.969 0.016 293.756)" } },
  { id: "purple", label: "Purple", swatch: "oklch(0.496 0.265 301.924)", light: { primary: "oklch(0.496 0.265 301.924)", primaryFg: "oklch(0.977 0.014 308.299)" }, dark: { primary: "oklch(0.438 0.218 303.724)", primaryFg: "oklch(0.977 0.014 308.299)" } },
  { id: "fuchsia", label: "Fuchsia", swatch: "oklch(0.518 0.253 323.949)", light: { primary: "oklch(0.518 0.253 323.949)", primaryFg: "oklch(0.977 0.017 320.058)" }, dark: { primary: "oklch(0.452 0.211 324.591)", primaryFg: "oklch(0.977 0.017 320.058)" } },
  { id: "pink", label: "Pink", swatch: "oklch(0.525 0.223 3.958)", light: { primary: "oklch(0.525 0.223 3.958)", primaryFg: "oklch(0.971 0.014 343.198)" }, dark: { primary: "oklch(0.459 0.187 3.815)", primaryFg: "oklch(0.971 0.014 343.198)" } },
  { id: "rose", label: "Rose", swatch: "oklch(0.514 0.222 16.935)", light: { primary: "oklch(0.514 0.222 16.935)", primaryFg: "oklch(0.969 0.015 12.422)" }, dark: { primary: "oklch(0.455 0.188 13.697)", primaryFg: "oklch(0.969 0.015 12.422)" } },
];

export function themeVars(themeId: string, mode: "light" | "dark") {
  const theme = THEME_PRESETS.find((t) => t.id === themeId) ?? THEME_PRESETS[0];
  const neutrals = mode === "dark" ? DARK_NEUTRALS : LIGHT_NEUTRALS;
  const color = mode === "dark" ? theme.dark : theme.light;

  return {
    "--site-bg": neutrals.bg,
    "--site-fg": neutrals.fg,
    "--site-muted": neutrals.muted,
    "--site-card": neutrals.card,
    "--site-border": neutrals.border,
    "--site-primary": color.primary,
    "--site-primary-fg": color.primaryFg,
    "--site-accent": color.primary,
  } satisfies Record<string, string>;
}
