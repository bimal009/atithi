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
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {TEMPLATES.map((template) => {
        const selected = template.id === value;
        return (
          <button
            key={template.id}
            type="button"
            onClick={() => onChange(template.id)}
            className={cn(
              "flex cursor-pointer flex-col gap-1.5 rounded-xl border p-4 text-left transition-colors hover:border-primary/50",
              selected ? "border-primary bg-primary/5" : "border-border",
            )}
          >
            <div className="flex items-center justify-between">
              <span className="font-medium">{template.name}</span>
              {selected && (
                <span className="flex size-5 items-center justify-center rounded-full bg-primary text-primary-foreground">
                  <CheckIcon className="size-3" />
                </span>
              )}
            </div>
            <span className="text-xs text-muted-foreground">{template.tagline}</span>
          </button>
        );
      })}
    </div>
  );
}
