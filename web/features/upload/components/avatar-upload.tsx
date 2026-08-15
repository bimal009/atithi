"use client";

import * as React from "react";
import { CameraIcon, CloudUploadIcon, Trash2Icon } from "lucide-react";
import { toast } from "sonner";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { cn } from "@/lib/utils";

import { uploadImage } from "../api/upload";
import { ACCEPTED_IMAGE_TYPES, MAX_IMAGE_BYTES } from "../types";

export function AvatarUpload({
  value,
  onChange,
  fallback,
  folder = "/avatars",
  disabled,
  className,
}: {
  value?: string;
  onChange: (url: string | undefined) => void;
  fallback?: React.ReactNode;
  folder?: string;
  disabled?: boolean;
  className?: string;
}) {
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = React.useState(false);

  const handleFile = async (file: File) => {
    if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
      toast.error("Choose a JPG, PNG, WebP or AVIF image");
      return;
    }

    if (file.size > MAX_IMAGE_BYTES) {
      toast.error("That image is over 5 MB — pick a smaller one");
      return;
    }

    setUploading(true);

    try {
      const uploaded = await uploadImage(file, { folder });
      onChange(uploaded.url);
      toast.success("Photo uploaded");
    } catch {
      toast.error("Could not upload that photo");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  return (
    <div className={cn("flex flex-col items-center gap-3", className)}>
      <div className="relative">
        <Avatar className="size-24 border">
          {value ? <AvatarImage className="object-contain" src={value} alt="Your profile photo" /> : null}
          <AvatarFallback className="text-lg font-medium">
            {uploading ? (
              <Spinner className="size-8" />
            ) : (
              fallback ?? <CloudUploadIcon className="size-8" aria-hidden />
            )}
          </AvatarFallback>
        </Avatar>

        <Button
          type="button"
          size="icon"
          variant="secondary"
          className="absolute -right-1 -bottom-1 size-8 cursor-pointer rounded-full border shadow-sm transition-colors duration-200"
          onClick={() => inputRef.current?.click()}
          disabled={disabled || uploading}
          aria-label={value ? "Change photo" : "Upload a photo"}
        >
          <CameraIcon className="size-4" aria-hidden />
        </Button>
      </div>

      <div className="flex h-9 flex-col items-center justify-center gap-1.5">
        {value ? (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="cursor-pointer text-muted-foreground transition-colors duration-200 hover:text-destructive"
            onClick={() => onChange(undefined)}
            disabled={disabled}
            data-icon="inline-start"
          >
            <Trash2Icon className="size-3.5" aria-hidden />
            Remove photo
          </Button>
        ) : (
          <span className="text-xs text-muted-foreground">
            JPG, PNG or WebP up to 5 MB
          </span>
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
