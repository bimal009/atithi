import { CheckIcon } from "lucide-react";

import { cn } from "@/lib/utils";

import { TEMPLATES } from "../templates/registry";
import type { TemplateId } from "../types";

export function TemplatePicker({
  value,
  onChange,
}: {
  value: TemplateId;
  onChange: (id: TemplateId) => void;
}) {
  return (
    <div className="flex flex-col gap-2">
      {TEMPLATES.map((template) => {
        const selected = template.id === value;
        return (
          <button
            key={template.id}
            type="button"
            onClick={() => onChange(template.id)}
            className={cn(
              "flex cursor-pointer items-start justify-between gap-3 rounded-lg border px-3 py-2.5 text-left transition-colors",
              selected ? "border-foreground bg-muted" : "border-border hover:bg-muted/60",
            )}
          >
            <div className="flex flex-col gap-0.5">
              <span className="text-sm font-medium">{template.name}</span>
              <span className="text-xs text-muted-foreground">{template.tagline}</span>
            </div>
            {selected && <CheckIcon className="mt-0.5 size-4 shrink-0" />}
          </button>
        );
      })}
    </div>
  );
}
