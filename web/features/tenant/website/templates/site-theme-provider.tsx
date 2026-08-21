import { cn } from "@/lib/utils";

import { themeVars } from "../themes/theme-presets";
import { ALL_FONT_VARIABLES, FONT_PAIRINGS } from "./font-pairings";

export function SiteThemeProvider({
  themeId,
  mode,
  fontPairingId,
  className,
  children,
}: {
  themeId: string;
  mode: "light" | "dark";
  fontPairingId: string;
  className?: string;
  children: React.ReactNode;
}) {
  const pairing = FONT_PAIRINGS.find((f) => f.id === fontPairingId) ?? FONT_PAIRINGS[0];

  return (
    <div
      className={cn(ALL_FONT_VARIABLES, "bg-[var(--site-bg)] text-[var(--site-fg)]", className)}
      style={
        {
          ...themeVars(themeId, mode),
          "--font-display": pairing.displayVar,
          "--font-body": pairing.bodyVar,
        } as React.CSSProperties
      }
    >
      {children}
    </div>
  );
}
