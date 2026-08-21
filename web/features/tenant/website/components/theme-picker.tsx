import { CheckIcon } from "lucide-react";

import { cn } from "@/lib/utils";

import { THEME_PRESETS } from "../themes/theme-presets";

export function ThemePicker({
  value,
  onChange,
}: {
  value: string;
  onChange: (id: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2.5">
      {THEME_PRESETS.map((theme) => {
        const selected = theme.id === value;
        return (
          <button
            key={theme.id}
            type="button"
            title={theme.label}
            aria-label={theme.label}
            onClick={() => onChange(theme.id)}
            className={cn(
              "flex size-8 cursor-pointer items-center justify-center rounded-full ring-2 ring-offset-2 ring-offset-background transition-transform hover:scale-110",
              selected ? "ring-foreground" : "ring-transparent",
            )}
            style={{ backgroundColor: theme.swatch }}
          >
            {selected && <CheckIcon className="size-4 text-white mix-blend-difference" />}
          </button>
        );
      })}
    </div>
  );
}
