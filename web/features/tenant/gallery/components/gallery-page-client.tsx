"use client";

import * as React from "react";
import { ImagesIcon, PlusIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { EmptyState } from "@/components/shared/empty-state";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { PageHeader } from "@/components/shared/page-header";
import { Skeleton } from "@/components/ui/skeleton";
import { MultiImageUpload } from "@/features/upload/components/multi-image-upload";

import {
  useCreateGalleryImage,
  useDeleteGalleryImage,
  useGalleryImagesQuery,
} from "../client/useGallery";
import type { GalleryImage } from "../types";

const MAX_GALLERY_IMAGES = 60;

function NewSectionDialog({ existing, onCreate }: { existing: string[]; onCreate: (name: string) => void }) {
  const [open, setOpen] = React.useState(false);
  const [name, setName] = React.useState("");
  const [error, setError] = React.useState("");

  function submit() {
    const trimmed = name.trim();
    if (!trimmed) {
      setError("Enter a section name");
      return;
    }
    if (existing.some((s) => s.toLowerCase() === trimmed.toLowerCase())) {
      setError("A section with that name already exists");
      return;
    }
    onCreate(trimmed);
    setName("");
    setError("");
    setOpen(false);
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        setOpen(v);
        if (!v) {
          setName("");
          setError("");
        }
      }}
    >
      <Button size="sm" data-icon="inline-start" onClick={() => setOpen(true)}>
        <PlusIcon />
        New section
      </Button>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>New gallery section</DialogTitle>
          <DialogDescription>
            Group photos under a section your guests will recognize — Hotel, Dine, Fitness, and so on.
          </DialogDescription>
        </DialogHeader>
        <Field data-invalid={!!error}>
          <FieldLabel htmlFor="gallery-section-name">Section name</FieldLabel>
          <Input
            id="gallery-section-name"
            autoFocus
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              setError("");
            }}
            onKeyDown={(e) => e.key === "Enter" && submit()}
            placeholder="Hotel"
          />
          <FieldError errors={[error ? { message: error } : undefined]} />
        </Field>
        <DialogFooter>
          <DialogClose render={<Button variant="outline">Cancel</Button>} />
          <Button onClick={submit}>Create section</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function SectionBlock({
  name,
  images,
  totalCount,
  onUpload,
  onRemove,
}: {
  name: string;
  images: GalleryImage[];
  totalCount: number;
  onUpload: (urls: string[]) => void;
  onRemove: (imageId: string) => void;
}) {
  const remainingGlobal = Math.max(MAX_GALLERY_IMAGES - totalCount, 0);

  return (
    <div className="flex flex-col gap-3 rounded-xl border p-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold">{name}</h3>
        <span className="text-xs text-muted-foreground">
          {images.length} photo{images.length === 1 ? "" : "s"}
        </span>
      </div>
      <MultiImageUpload
        value={images.map((img) => img.url)}
        onChange={(urls) => {
          const currentUrls = images.map((img) => img.url);
          for (const url of urls) {
            if (!currentUrls.includes(url)) onUpload([url]);
          }
          for (const img of images) {
            if (!urls.includes(img.url)) onRemove(img.id);
          }
        }}
        folder="/gallery"
        maxCount={images.length + remainingGlobal}
      />
    </div>
  );
}

export function GalleryPageClient({ tenant }: { tenant: string }) {
  const imagesQuery = useGalleryImagesQuery(tenant);
  const create = useCreateGalleryImage(tenant);
  const remove = useDeleteGalleryImage(tenant);
  const [pendingSections, setPendingSections] = React.useState<string[]>([]);

  const images = imagesQuery.data ?? [];

  const grouped = React.useMemo(() => {
    const map = new Map<string, GalleryImage[]>();
    for (const img of images) {
      const list = map.get(img.section) ?? [];
      list.push(img);
      map.set(img.section, list);
    }
    for (const section of pendingSections) {
      if (!map.has(section)) map.set(section, []);
    }
    return [...map.entries()];
  }, [images, pendingSections]);

  if (imagesQuery.isPending) {
    return (
      <div className="flex flex-col gap-4">
        <Skeleton className="h-9 w-64" />
        <Skeleton className="h-48 w-full rounded-xl" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Gallery"
        description={`Organize your website's photos into sections. ${images.length}/${MAX_GALLERY_IMAGES} photos used.`}
        actions={
          <NewSectionDialog
            existing={grouped.map(([name]) => name)}
            onCreate={(name) => setPendingSections((prev) => [...prev, name])}
          />
        }
      />

      {grouped.length === 0 ? (
        <EmptyState
          icon={ImagesIcon}
          title="No gallery sections yet"
          description="Create a section — Hotel, Dine, Fitness — then add photos to it."
        />
      ) : (
        <div className="flex flex-col gap-4">
          {grouped.map(([name, sectionImages]) => (
            <SectionBlock
              key={name}
              name={name}
              images={sectionImages}
              totalCount={images.length}
              onUpload={(urls) => urls.forEach((url) => create.mutate({ url, section: name }))}
              onRemove={(id) => remove.mutate(id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
