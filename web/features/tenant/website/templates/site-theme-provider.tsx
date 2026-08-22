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
          // Shadow the app's shadcn tokens so any shared UI component (Button, Input, Badge…)
          // rendered inside the site preview themes off the site's own palette instead of
          // leaking the dashboard's ambient light/dark mode (e.g. `hover:text-foreground`
          // turning white when the app is in dark mode, on top of a light site theme).
          "--background": "var(--site-bg)",
          "--foreground": "var(--site-fg)",
          "--card": "var(--site-card)",
          "--card-foreground": "var(--site-fg)",
          "--popover": "var(--site-card)",
          "--popover-foreground": "var(--site-fg)",
          "--primary": "var(--site-primary)",
          "--primary-foreground": "var(--site-primary-fg)",
          "--secondary": "var(--site-card)",
          "--secondary-foreground": "var(--site-fg)",
          "--muted": "var(--site-border)",
          "--muted-foreground": "var(--site-muted)",
          "--accent": "var(--site-border)",
          "--accent-foreground": "var(--site-fg)",
          "--border": "var(--site-border)",
          "--input": "var(--site-border)",
          "--ring": "var(--site-primary)",
        } as React.CSSProperties
      }
    >
      {children}
    </div>
  );
}
