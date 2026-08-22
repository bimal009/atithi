"use client";

import * as React from "react";
import { CloudUploadIcon, XIcon } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { cn } from "@/lib/utils";
import { uploadImage } from "@/features/upload/api/upload";
import { ACCEPTED_IMAGE_TYPES, MAX_IMAGE_BYTES } from "@/features/upload/types";

import { useCreateHotelImage, useDeleteHotelImage, useHotelImagesQuery } from "../client/useHotelImages";
import type { HotelImageEntityType } from "../types";

export function EntityImageManager({
  tenant,
  entityType,
  entityId,
  section,
  folder,
  maxCount = 10,
  className,
  disabledHint = "Save first, then add photos.",
}: {
  tenant: string;
  entityType: HotelImageEntityType;
  entityId?: string;
  section?: string;
  folder: string;
  maxCount?: number;
  className?: string;
  disabledHint?: string;
}) {
  const singleton = entityType === "logo" || entityType === "gallery";
  const ready = singleton || !!entityId;

  const imagesQuery = useHotelImagesQuery(tenant, entityType, entityId, { enabled: ready });
  const create = useCreateHotelImage(tenant, entityType, entityId);
  const remove = useDeleteHotelImage(tenant, entityType, entityId);

  const images = imagesQuery.data ?? [];
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = React.useState(0);
  const remaining = maxCount - images.length;
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
    const results = await Promise.allSettled(accepted.map((file) => uploadImage(file, { folder })));
    setUploading((n) => n - accepted.length);

    const failed = results.filter((r) => r.status === "rejected").length;
    if (failed > 0) toast.error(`${failed} photo${failed > 1 ? "s" : ""} failed to upload`);

    for (const result of results) {
      if (result.status !== "fulfilled") continue;
      const uploaded = result.value;
      await create.mutateAsync({
        entityType,
        entityId,
        url: uploaded.url,
        fileId: uploaded.fileId,
        fileSize: uploaded.size,
        section,
      });
    }
  }

  if (!ready) {
    return (
      <div
        className={cn(
          "flex aspect-square w-full max-w-24 items-center justify-center rounded-lg border border-dashed p-2 text-center text-xs text-muted-foreground",
          className,
        )}
      >
        {disabledHint}
      </div>
    );
  }

  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <div className="grid grid-cols-4 gap-2">
        {images.map((img) => (
          <div key={img.id} className="group relative aspect-square overflow-hidden rounded-lg border">
            {/* eslint-disable-next-line @next/next/no-img-element -- remote ImageKit URL, not a local static asset */}
            <img src={img.url} alt="" className="size-full object-cover" />
            <Button
              type="button"
              size="icon-xs"
              variant="destructive"
              className="absolute top-1 right-1 cursor-pointer opacity-0 transition-opacity group-hover:opacity-100"
              onClick={() => remove.mutate(img.id)}
              disabled={remove.isPending}
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
        {images.length}/{maxCount} photos
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
