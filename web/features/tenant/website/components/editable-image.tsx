"use client";

import * as React from "react";
import { ImagePlusIcon, XIcon } from "lucide-react";
import { toast } from "sonner";

import { Spinner } from "@/components/ui/spinner";
import { uploadImage } from "@/features/upload/api/upload";
import { ACCEPTED_IMAGE_TYPES, MAX_IMAGE_BYTES } from "@/features/upload/types";
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
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = React.useState(false);

  const image = src ? (
    // eslint-disable-next-line @next/next/no-img-element -- remote ImageKit URL
    <img src={src} alt={alt} className={cn("size-full object-cover", imgClassName)} />
  ) : (
    (fallback ?? <div className={cn("size-full bg-[var(--site-primary)]/10", imgClassName)} />)
  );

  if (!editable) {
    return <div className={className}>{image}</div>;
  }

  async function handleFile(file: File) {
    if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
      toast.error(`${file.name} isn't a supported image type`);
      return;
    }
    if (file.size > MAX_IMAGE_BYTES) {
      toast.error(`${file.name} is over 5 MB`);
      return;
    }
    setUploading(true);
    try {
      const uploaded = await uploadImage(file, { folder });
      onChange?.(uploaded.url);
    } catch {
      toast.error("Photo upload failed — try again");
    } finally {
      setUploading(false);
    }
  }

  return (
    <button
      type="button"
      onClick={() => inputRef.current?.click()}
      disabled={uploading}
      className={cn(
        "group relative block size-full cursor-pointer overflow-hidden text-left disabled:cursor-wait",
        className,
      )}
    >
      {image}
      <div
        className={cn(
          "absolute inset-0 flex items-center justify-center bg-black/0 opacity-0 transition-all group-hover:bg-black/40 group-hover:opacity-100",
          uploading && "bg-black/40 opacity-100",
        )}
      >
        <span className="flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 text-xs font-medium text-black">
          {uploading ? <Spinner className="size-3.5" /> : <ImagePlusIcon className="size-3.5" />}
          {uploading ? "Uploading…" : "Change photo"}
        </span>
      </div>
      {src && !uploading && (
        <span
          role="button"
          tabIndex={0}
          onClick={(e) => {
            e.stopPropagation();
            onChange?.(undefined);
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              e.stopPropagation();
              onChange?.(undefined);
            }
          }}
          aria-label="Remove photo"
          className="absolute top-1.5 right-1.5 flex size-6 cursor-pointer items-center justify-center rounded-full bg-black/60 text-white opacity-0 transition-opacity group-hover:opacity-100"
        >
          <XIcon className="size-3.5" />
        </span>
      )}
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPTED_IMAGE_TYPES.join(",")}
        className="sr-only"
        tabIndex={-1}
        onClick={(e) => e.stopPropagation()}
        onChange={(e) => {
          const file = e.target.files?.[0];
          e.target.value = "";
          if (file) void handleFile(file);
        }}
      />
    </button>
  );
}
