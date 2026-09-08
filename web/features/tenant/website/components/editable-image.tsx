"use client";

import * as React from "react";

/** Lightweight non-editable image renderer. The editable prop is accepted but ignored (editing is not supported in v1). */
export function EditableImage({
  src,
  fileId: _fileId,
  editable: _editable,
  onChange: _onChange,
  folder: _folder,
  className,
  imgClassName,
  alt = "",
  fallback,
}: {
  src?: string;
  fileId?: string;
  editable?: boolean;
  onChange?: (url: string, fileId: string) => void;
  folder?: string;
  className?: string;
  imgClassName?: string;
  alt?: string;
  fallback?: React.ReactNode;
}) {
  return (
    <div className={className}>
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src} alt={alt} className={imgClassName ?? "size-full object-cover"} />
      ) : fallback ? (
        fallback
      ) : (
        <div className="size-full bg-muted" aria-hidden />
      )}
    </div>
  );
}
