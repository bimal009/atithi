"use client";

import * as React from "react";
import { CameraIcon, CloudUploadIcon, Trash2Icon } from "lucide-react";
import { toast } from "sonner";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { cn } from "@/lib/utils";
import { uploadImage } from "@/features/upload/api/upload";
import { ACCEPTED_IMAGE_TYPES } from "@/features/upload/types";

import { useCreateHotelImage, useDeleteHotelImage, useHotelImagesQuery } from "../client/useHotelImages";

const DEFAULT_MAX_BYTES = 2 * 1024 * 1024;

export function HotelLogoUpload({
  tenant,
  disabled,
  className,
}: {
  tenant?: string;
  disabled?: boolean;
  className?: string;
}) {
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = React.useState(false);

  const imagesQuery = useHotelImagesQuery(tenant ?? "", "logo", undefined, { enabled: !!tenant });
  const create = useCreateHotelImage(tenant ?? "", "logo");
  const remove = useDeleteHotelImage(tenant ?? "", "logo");

  const current = imagesQuery.data?.[0];
  const maxLabel = `${Math.round(DEFAULT_MAX_BYTES / (1024 * 1024))} MB`;

  async function handleFile(file: File) {
    if (!tenant) return;
    if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
      toast.error("Choose a JPG, PNG, WebP or AVIF image");
      return;
    }
    if (file.size > DEFAULT_MAX_BYTES) {
      toast.error(`That image is over ${maxLabel} — pick a smaller one`);
      return;
    }

    setUploading(true);
    try {
      const uploaded = await uploadImage(file, { folder: "/hotel-logos" });
      await create.mutateAsync({
        entityType: "logo",
        url: uploaded.url,
        fileId: uploaded.fileId,
        fileSize: uploaded.size,
      });
      toast.success("Logo uploaded");
    } catch {
      toast.error("Could not upload that logo");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  const isDisabled = disabled || !tenant || uploading;

  return (
    <div className={cn("flex flex-col items-center gap-3", className)}>
      <div className="relative">
        <Avatar className="size-24 border">
          {current ? (
            <AvatarImage className="object-contain" src={current.url} alt="Hotel logo" />
          ) : null}
          <AvatarFallback className="text-lg font-medium">
            {uploading ? <Spinner className="size-8" /> : <CloudUploadIcon className="size-8" aria-hidden />}
          </AvatarFallback>
        </Avatar>

        <Button
          type="button"
          size="icon"
          variant="secondary"
          className="absolute -right-1 -bottom-1 size-8 cursor-pointer rounded-full border shadow-sm transition-colors duration-200"
          onClick={() => inputRef.current?.click()}
          disabled={isDisabled}
          aria-label={current ? "Change logo" : "Upload a logo"}
        >
          <CameraIcon className="size-4" aria-hidden />
        </Button>
      </div>

      <div className="flex h-9 flex-col items-center justify-center gap-1.5">
        {!tenant ? (
          <span className="text-xs text-muted-foreground">Save the hotel first, then add a logo.</span>
        ) : current ? (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="cursor-pointer text-muted-foreground transition-colors duration-200 hover:text-destructive"
            onClick={() => remove.mutate(current.id)}
            disabled={disabled || remove.isPending}
            data-icon="inline-start"
          >
            <Trash2Icon className="size-3.5" aria-hidden />
            Remove logo
          </Button>
        ) : (
          <span className="text-xs text-muted-foreground">JPG, PNG or WebP up to {maxLabel}</span>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept={ACCEPTED_IMAGE_TYPES.join(",")}
        className="sr-only"
        tabIndex={-1}
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (file) void handleFile(file);
        }}
      />
    </div>
  );
}
