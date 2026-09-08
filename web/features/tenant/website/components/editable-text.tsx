"use client";

import * as React from "react";

import type { TextStyleOverride } from "../types";

/** Lightweight non-editable text renderer. The editable prop is accepted but ignored (editing is not supported in v1). */
export function EditableText({
  value,
  as: Tag = "span",
  className,
  style: _style,
  editable: _editable,
  onChange: _onChange,
  multiline: _multiline,
  styleId: _styleId,
  onStyleChange: _onStyleChange,
}: {
  value: string;
  as?: React.ElementType;
  className?: string;
  style?: TextStyleOverride;
  editable?: boolean;
  onChange?: (value: string) => void;
  multiline?: boolean;
  styleId?: string;
  onStyleChange?: (styleId: string, patch: Partial<TextStyleOverride>) => void;
}) {
  return <Tag className={className}>{value}</Tag>;
}
