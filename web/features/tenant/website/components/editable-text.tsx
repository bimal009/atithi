"use client";

import * as React from "react";
import { PaletteIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

import type { TextStyleOverride } from "../types";

type Tag = "h1" | "h2" | "h3" | "h4" | "p" | "span" | "div";

const SIZE_OPTIONS: { value: string; label: string }[] = [
  { value: "default", label: "Default" },
  { value: "0.75rem", label: "Small" },
  { value: "0.9375rem", label: "Base" },
  { value: "1.125rem", label: "Large" },
  { value: "1.5rem", label: "XL" },
  { value: "2rem", label: "2XL" },
  { value: "2.75rem", label: "3XL" },
  { value: "3.75rem", label: "4XL" },
];

function inlineStyleFor(style?: TextStyleOverride): React.CSSProperties {
  const css: React.CSSProperties = {};
  if (style?.color) css.color = style.color;
  if (style?.fontSize) css.fontSize = style.fontSize;
  if (style?.font) {
    css.fontFamily = style.font === "display" ? "var(--font-display)" : "var(--font-body)";
  }
  return css;
}

export function EditableText({
  value,
  onChange,
  editable = false,
  as = "span",
  className,
  multiline = false,
  styleId,
  style,
  onStyleChange,
}: {
  value: string;
  onChange?: (value: string) => void;
  editable?: boolean;
  as?: Tag;
  className?: string;
  multiline?: boolean;
  /** Unique key into content.textStyles — pass together with onStyleChange to enable the per-element style control. Only use on block-level (h1/h2/p) text. */
  styleId?: string;
  style?: TextStyleOverride;
  onStyleChange?: (styleId: string, patch: TextStyleOverride) => void;
}) {
  const ref = React.useRef<HTMLElement>(null);
  const inlineStyle = inlineStyleFor(style);

  React.useEffect(() => {
    if (!ref.current) return;
    if (ref.current.textContent !== value) {
      ref.current.textContent = value;
    }
  }, [value]);

  if (!editable) {
    return React.createElement(as, { className, style: inlineStyle }, value);
  }

  const textEl = React.createElement(as, {
    ref,
    className: cn(
      className,
      "cursor-text rounded-[3px] outline-none transition-colors",
      "hover:bg-[var(--site-primary)]/10 focus:bg-[var(--site-primary)]/10 focus:ring-1 focus:ring-[var(--site-primary)]",
    ),
    style: inlineStyle,
    contentEditable: true,
    suppressContentEditableWarning: true,
    onKeyDown: (e: React.KeyboardEvent) => {
      if (!multiline && e.key === "Enter") {
        e.preventDefault();
        (e.target as HTMLElement).blur();
      }
    },
    onBlur: (e: React.FocusEvent<HTMLElement>) => {
      onChange?.(e.currentTarget.textContent ?? "");
    },
  });

  if (!styleId || !onStyleChange) return textEl;

  function patch(next: Partial<TextStyleOverride>) {
    onStyleChange!(styleId!, { ...style, ...next });
  }

  return (
    <div className="group/editable relative">
      {textEl}
      <Popover>
        <PopoverTrigger
          type="button"
          className="absolute -top-2.5 -right-2.5 z-10 flex size-6 cursor-pointer items-center justify-center rounded-full bg-[var(--site-primary)] text-[var(--site-primary-fg)] opacity-0 shadow transition-opacity group-hover/editable:opacity-100 focus-visible:opacity-100"
          aria-label="Text style"
          onMouseDown={(e) => e.preventDefault()}
        >
          <PaletteIcon className="size-3.5" />
        </PopoverTrigger>
        <PopoverContent align="end" className="flex w-56 flex-col gap-3">
          <div className="flex flex-col gap-1.5">
            <span className="text-xs font-medium text-muted-foreground">Color</span>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={style?.color ?? "#000000"}
                onChange={(e) => patch({ color: e.target.value })}
                className="size-8 cursor-pointer rounded border border-border bg-transparent p-0"
              />
              <Button type="button" variant="outline" size="xs" onClick={() => patch({ color: undefined })}>
                Reset
              </Button>
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <span className="text-xs font-medium text-muted-foreground">Font</span>
            <select
              value={style?.font ?? "inherit"}
              onChange={(e) =>
                patch({ font: e.target.value === "inherit" ? undefined : (e.target.value as "display" | "body") })
              }
              className="h-8 rounded-md border border-input bg-background px-2 text-sm"
            >
              <option value="inherit">Default</option>
              <option value="display">Display font</option>
              <option value="body">Body font</option>
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <span className="text-xs font-medium text-muted-foreground">Size</span>
            <select
              value={style?.fontSize ?? "default"}
              onChange={(e) => patch({ fontSize: e.target.value === "default" ? undefined : e.target.value })}
              className="h-8 rounded-md border border-input bg-background px-2 text-sm"
            >
              {SIZE_OPTIONS.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
