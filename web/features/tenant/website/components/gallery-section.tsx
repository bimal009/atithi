import { ImageIcon } from "lucide-react";

import { EmptyState } from "@/components/shared/empty-state";

export function GallerySection({ images }: { images: string[] }) {
  if (images.length === 0) {
    return (
      <EmptyState
        icon={ImageIcon}
        title="No photos yet"
        description="Add photos to your cabins and tables to fill out this gallery."
      />
    );
  }

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {images.slice(0, 8).map((url, i) => (
        <div
          key={url + i}
          className="aspect-square overflow-hidden rounded-xl bg-muted first:col-span-2 first:row-span-2 first:aspect-square sm:first:aspect-auto"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={url} alt="" className="size-full object-cover" />
        </div>
      ))}
    </div>
  );
}
