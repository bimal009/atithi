"use client";

import * as React from "react";

import { cn } from "@/lib/utils";

type Tag = "h1" | "h2" | "h3" | "h4" | "p" | "span" | "div";

export function EditableText({
  value,
  onChange,
  editable = false,
  as = "span",
  className,
  multiline = false,
}: {
  value: string;
  onChange?: (value: string) => void;
  editable?: boolean;
  as?: Tag;
  className?: string;
  multiline?: boolean;
}) {
  const ref = React.useRef<HTMLElement>(null);

  React.useEffect(() => {
    if (!ref.current) return;
    if (ref.current.textContent !== value) {
      ref.current.textContent = value;
    }
  }, [value]);

  if (!editable) {
    return React.createElement(as, { className }, value);
  }

  return React.createElement(as, {
    ref,
    className: cn(
      className,
      "cursor-text rounded-[3px] outline-none transition-colors",
      "hover:bg-[var(--site-primary)]/10 focus:bg-[var(--site-primary)]/10 focus:ring-1 focus:ring-[var(--site-primary)]",
    ),
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
}
