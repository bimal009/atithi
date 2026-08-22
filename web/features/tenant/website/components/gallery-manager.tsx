"use client";

import { XIcon } from "lucide-react";

import { Spinner } from "@/components/ui/spinner";
import {
  useCreateGalleryImage,
  useDeleteGalleryImage,
  useGalleryImagesQuery,
} from "@/features/tenant/gallery/client/useGallery";
import { MultiImageUpload } from "@/features/upload/components/multi-image-upload";

const MAX_GALLERY_IMAGES = 10;

export function GalleryManager({ tenant }: { tenant: string }) {
  const imagesQuery = useGalleryImagesQuery(tenant);
  const create = useCreateGalleryImage(tenant);
  const remove = useDeleteGalleryImage(tenant);
  const images = imagesQuery.data ?? [];
  const remaining = Math.max(MAX_GALLERY_IMAGES - images.length, 0);

  if (imagesQuery.isPending) {
    return <Spinner className="size-4" />;
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="grid grid-cols-4 gap-2">
        {images.map((img) => (
          <div key={img.id} className="group relative aspect-square overflow-hidden rounded-lg border">
            {/* eslint-disable-next-line @next/next/no-img-element -- remote ImageKit URL */}
            <img src={img.url} alt="" className="size-full object-cover" />
            <button
              type="button"
              onClick={() => remove.mutate(img.id)}
              disabled={remove.isPending}
              className="absolute top-1 right-1 flex size-5 cursor-pointer items-center justify-center rounded-full bg-black/60 text-white opacity-0 transition-opacity group-hover:opacity-100 disabled:cursor-not-allowed"
              aria-label="Remove photo"
            >
              <XIcon className="size-3" />
            </button>
          </div>
        ))}
      </div>
      {remaining > 0 && (
        <MultiImageUpload
          value={[]}
          onChange={(urls) => urls.slice(0, remaining).forEach((url) => create.mutate({ url }))}
          folder="/gallery"
          maxCount={remaining}
        />
      )}
      <span className="text-xs text-muted-foreground">
        {images.length}/{MAX_GALLERY_IMAGES} photos on the landing page gallery.
      </span>
    </div>
  );
}
