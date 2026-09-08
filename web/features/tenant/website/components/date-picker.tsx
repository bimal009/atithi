"use client";

import * as React from "react";
import { CalendarIcon } from "lucide-react";

import { cn } from "@/lib/utils";

function formatDateStr(value: string) {
  if (!value) return null;
  const d = new Date(value);
  if (isNaN(d.getTime())) return value;
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export function DatePicker({
  value,
  onChange,
  placeholder = "Pick a date",
  className,
  minDate,
  disabledDaysOfWeek: _disabledDaysOfWeek,
  variant: _variant = "outline",
}: {
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  className?: string;
  minDate?: Date;
  disabledDaysOfWeek?: number[];
  variant?: "outline" | "ghost";
}) {
  const inputRef = React.useRef<HTMLInputElement>(null);
  const displayValue = formatDateStr(value ?? "");
  const minStr = minDate ? minDate.toISOString().split("T")[0] : undefined;

  return (
    <button
      type="button"
      className={cn(
        "flex items-center gap-2 text-sm font-normal",
        !value && "text-muted-foreground",
        className,
      )}
      onClick={() => inputRef.current?.showPicker?.()}
    >
      <CalendarIcon className="size-4 shrink-0" />
      <span>{displayValue ?? placeholder}</span>
      <input
        ref={inputRef}
        type="date"
        className="sr-only"
        value={value ?? ""}
        min={minStr}
        onChange={(e) => onChange?.(e.target.value)}
        tabIndex={-1}
        aria-hidden
      />
    </button>
  );
}
