import { cn } from "@/lib/utils";

import { ALL_FONT_VARIABLES, FONT_PAIRINGS } from "../templates/font-pairings";

export function FontPicker({
  value,
  onChange,
}: {
  value: string;
  onChange: (id: string) => void;
}) {
  return (
    <div className={cn(ALL_FONT_VARIABLES, "flex flex-wrap gap-2.5")}>
      {FONT_PAIRINGS.map((pairing) => {
        const selected = pairing.id === value;
        return (
          <button
            key={pairing.id}
            type="button"
            onClick={() => onChange(pairing.id)}
            style={{ fontFamily: pairing.displayVar }}
            className={cn(
              "cursor-pointer rounded-lg border px-4 py-2 text-sm transition-colors hover:border-primary/50",
              selected ? "border-primary bg-primary/5" : "border-border",
            )}
          >
            {pairing.label}
          </button>
        );
      })}
    </div>
  );
}
