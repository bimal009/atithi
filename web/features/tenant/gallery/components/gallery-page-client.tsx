"use client";

import * as React from "react";
import { CloudUploadIcon, ImagesIcon, PlusIcon, XIcon } from "lucide-react";
import { toast } from "sonner";

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
import { Spinner } from "@/components/ui/spinner";
import { cn } from "@/lib/utils";
import { uploadImage } from "@/features/upload/api/upload";
import { ACCEPTED_IMAGE_TYPES, MAX_IMAGE_BYTES } from "@/features/upload/types";

import {
  useCreateHotelImage,
  useDeleteHotelImage,
  useHotelImagesQuery,
} from "../../hotelImages/client/useHotelImages";
import type { GalleryImage } from "../types";

const MAX_GALLERY_IMAGES = 30;

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
  remainingGlobal,
  onUpload,
  onRemove,
  removing,
}: {
  name: string;
  images: GalleryImage[];
  remainingGlobal: number;
  onUpload: (files: FileList) => void;
  onRemove: (imageId: string) => void;
  removing: boolean;
}) {
  const inputRef = React.useRef<HTMLInputElement>(null);
  const maxCount = images.length + remainingGlobal;
  const atLimit = remainingGlobal <= 0;

  return (
    <div className="flex flex-col gap-3 rounded-xl border p-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold">{name}</h3>
        <span className="text-xs text-muted-foreground">
          {images.length} photo{images.length === 1 ? "" : "s"}
        </span>
      </div>

      <div className="flex flex-col gap-2">
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
                onClick={() => onRemove(img.id)}
                disabled={removing}
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
              className="flex aspect-square cursor-pointer flex-col items-center justify-center gap-1 rounded-lg border border-dashed text-muted-foreground transition-colors hover:border-primary hover:text-primary"
            >
              <CloudUploadIcon className="size-5" aria-hidden />
              <span className="text-[11px]">Add photo</span>
            </button>
          )}
        </div>
        <span className={cn("text-xs text-muted-foreground")}>
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
            if (e.target.files?.length) onUpload(e.target.files);
            e.target.value = "";
          }}
        />
      </div>
    </div>
  );
}

export function GalleryPageClient({ tenant }: { tenant: string }) {
  const imagesQuery = useHotelImagesQuery(tenant, "gallery");
  const create = useCreateHotelImage(tenant, "gallery");
  const remove = useDeleteHotelImage(tenant, "gallery");
  const [pendingSections, setPendingSections] = React.useState<string[]>([]);
  const [uploading, setUploading] = React.useState(false);

  const images = React.useMemo(() => imagesQuery.data ?? [], [imagesQuery.data]);

  const grouped = React.useMemo(() => {
    const map = new Map<string, GalleryImage[]>();
    for (const img of images) {
      const section = img.section || "General";
      const list = map.get(section) ?? [];
      list.push(img);
      map.set(section, list);
    }
    for (const section of pendingSections) {
      if (!map.has(section)) map.set(section, []);
    }
    return [...map.entries()];
  }, [images, pendingSections]);

  async function handleUpload(section: string, files: FileList) {
    const remainingGlobal = Math.max(MAX_GALLERY_IMAGES - images.length, 0);
    const candidates = Array.from(files).slice(0, remainingGlobal);
    if (files.length > candidates.length) {
      toast.error(`Only ${MAX_GALLERY_IMAGES} photos allowed total — ${files.length - candidates.length} skipped`);
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

    setUploading(true);
    const results = await Promise.allSettled(accepted.map((file) => uploadImage(file, { folder: "/gallery" })));
    setUploading(false);

    const failed = results.filter((r) => r.status === "rejected").length;
    if (failed > 0) toast.error(`${failed} photo${failed > 1 ? "s" : ""} failed to upload`);

    for (const result of results) {
      if (result.status !== "fulfilled") continue;
      const uploaded = result.value;
      await create.mutateAsync({
        entityType: "gallery",
        url: uploaded.url,
        fileId: uploaded.fileId,
        fileSize: uploaded.size,
        section,
      });
    }
  }

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
          <div className="flex items-center gap-2">
            {uploading && <Spinner className="size-4" />}
            <NewSectionDialog
              existing={grouped.map(([name]) => name)}
              onCreate={(name) => setPendingSections((prev) => [...prev, name])}
            />
          </div>
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
              remainingGlobal={Math.max(MAX_GALLERY_IMAGES - images.length, 0)}
              onUpload={(files) => void handleUpload(name, files)}
              onRemove={(id) => remove.mutate(id)}
              removing={remove.isPending}
            />
          ))}
        </div>
      )}
    </div>
  );
}
