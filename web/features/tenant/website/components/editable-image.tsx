"use client";

import * as React from "react";
import { ImagePlusIcon } from "lucide-react";

import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { MultiImageUpload } from "@/features/upload/components/multi-image-upload";
import { cn } from "@/lib/utils";

export function EditableImage({
  src,
  alt = "",
  editable = false,
  onChange,
  folder,
  className,
  imgClassName,
  fallback,
}: {
  src?: string;
  alt?: string;
  editable?: boolean;
  onChange?: (url: string | undefined) => void;
  folder: string;
  className?: string;
  imgClassName?: string;
  fallback?: React.ReactNode;
}) {
  const [open, setOpen] = React.useState(false);

  const image = src ? (
    // eslint-disable-next-line @next/next/no-img-element -- remote ImageKit URL
    <img src={src} alt={alt} className={cn("size-full object-cover", imgClassName)} />
  ) : (
    (fallback ?? <div className={cn("size-full bg-[var(--site-primary)]/10", imgClassName)} />)
  );

  if (!editable) {
    return <div className={className}>{image}</div>;
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        type="button"
        className={cn(
          "group relative block size-full cursor-pointer overflow-hidden text-left",
          className,
        )}
      >
        {image}
        <div className="absolute inset-0 flex items-center justify-center bg-black/0 opacity-0 transition-all group-hover:bg-black/40 group-hover:opacity-100">
          <span className="flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 text-xs font-medium text-black">
            <ImagePlusIcon className="size-3.5" />
            Change photo
          </span>
        </div>
      </PopoverTrigger>
      <PopoverContent align="start">
        <MultiImageUpload
          value={src ? [src] : []}
          onChange={(urls) => {
            onChange?.(urls[urls.length - 1]);
            setOpen(false);
          }}
          folder={folder}
          maxCount={1}
        />
      </PopoverContent>
    </Popover>
  );
}
