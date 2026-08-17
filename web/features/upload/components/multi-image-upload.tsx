"use client";

import * as React from "react";
import { CloudUploadIcon, XIcon } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { cn } from "@/lib/utils";

import { uploadImage } from "../api/upload";
import { ACCEPTED_IMAGE_TYPES, MAX_IMAGE_BYTES } from "../types";

export function MultiImageUpload({
  value,
  onChange,
  folder,
  maxCount = 10,
  className,
}: {
  value: string[];
  onChange: (urls: string[]) => void;
  folder: string;
  maxCount?: number;
  className?: string;
}) {
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = React.useState(0);
  const remaining = maxCount - value.length;
  const atLimit = remaining <= 0;

  async function handleFiles(files: FileList) {
    const candidates = Array.from(files).slice(0, Math.max(remaining, 0));
    if (files.length > candidates.length) {
      toast.error(`Only ${maxCount} photos allowed — ${files.length - candidates.length} skipped`);
    }

    const accepted: File[] = [];
    for (const file of candidates) {
      if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
        toast.error(`${file.name} isn't a supported image type`);
        continue;
      }
      if (file.size > MAX_IMAGE_BYTES) {
        toast.error(`${file.name} is over 5 MB`);
        continue;
      }
      accepted.push(file);
    }
    if (!accepted.length) return;

    setUploading((n) => n + accepted.length);
    const results = await Promise.allSettled(
      accepted.map((file) => uploadImage(file, { folder })),
    );
    setUploading((n) => n - accepted.length);

    const uploaded = results
      .filter((r): r is PromiseFulfilledResult<Awaited<ReturnType<typeof uploadImage>>> =>
        r.status === "fulfilled",
      )
      .map((r) => r.value.url);

    const failed = results.length - uploaded.length;
    if (failed > 0) toast.error(`${failed} photo${failed > 1 ? "s" : ""} failed to upload`);

    if (uploaded.length) onChange([...value, ...uploaded]);
  }

  function removeAt(index: number) {
    onChange(value.filter((_, i) => i !== index));
  }

  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <div className="grid grid-cols-4 gap-2">
        {value.map((url, index) => (
          <div
            key={`${url}-${index}`}
            className="group relative aspect-square overflow-hidden rounded-lg border"
          >
            {/* eslint-disable-next-line @next/next/no-img-element -- remote ImageKit URL, not a local static asset */}
            <img src={url} alt="" className="size-full object-cover" />
            <Button
              type="button"
              size="icon-xs"
              variant="destructive"
              className="absolute top-1 right-1 cursor-pointer opacity-0 transition-opacity group-hover:opacity-100"
              onClick={() => removeAt(index)}
            >
              <XIcon />
              <span className="sr-only">Remove image</span>
            </Button>
          </div>
        ))}
        {!atLimit && (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={uploading > 0}
            className="flex aspect-square cursor-pointer flex-col items-center justify-center gap-1 rounded-lg border border-dashed text-muted-foreground transition-colors hover:border-primary hover:text-primary disabled:cursor-not-allowed disabled:opacity-60"
          >
            {uploading > 0 ? (
              <Spinner className="size-4" />
            ) : (
              <CloudUploadIcon className="size-5" aria-hidden />
            )}
            <span className="text-[11px]">{uploading > 0 ? "Uploading" : "Add photo"}</span>
          </button>
        )}
      </div>

      <span className="text-xs text-muted-foreground">
        {value.length}/{maxCount} photos
      </span>

      <input
        ref={inputRef}
        type="file"
        accept={ACCEPTED_IMAGE_TYPES.join(",")}
        multiple
        className="sr-only"
        tabIndex={-1}
        onChange={(e) => {
          if (e.target.files?.length) void handleFiles(e.target.files);
          e.target.value = "";
        }}
      />
    </div>
  );
}
