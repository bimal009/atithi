"use client";

import * as React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { ImagePlusIcon } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { Switch } from "@/components/ui/switch";
import { uploadImage } from "@/features/upload/api/upload";
import { ACCEPTED_IMAGE_TYPES } from "@/features/upload/types";
import { useSearchDishesQuery } from "@/features/tenant/menuItem/client/useMenuItems";
import type { Dish } from "@/features/tenant/menuItem/types";

import { useCreateAddOn, useUpdateAddOn } from "../client/useAddOns";
import { addOnSchema, type AddOnInput, type AddOnValues } from "../schema";
import type { AddOn } from "../types";

const MAX_ADDON_IMAGE_BYTES = 1 * 1024 * 1024;

const emptyValues: AddOnInput = {
  name: "",
  imageUrl: "",
  price: 0,
  available: true,
};

function valuesOf(addOn?: AddOn): AddOnInput {
  if (!addOn) return emptyValues;
  return {
    name: addOn.name,
    imageUrl: addOn.imageUrl ?? "",
    price: addOn.price,
    available: addOn.available,
  };
}

export function AddOnFormDialog({
  tenant,
  addOn,
  open,
  onOpenChange,
  onSaved,
}: {
  tenant: string;
  addOn?: AddOn;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSaved?: (addOn: AddOn) => void;
}) {
  const isEdit = !!addOn;
  const create = useCreateAddOn(tenant);
  const update = useUpdateAddOn(tenant);
  const pending = isEdit ? update.isPending : create.isPending;

  const [uploading, setUploading] = React.useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<AddOnInput, unknown, AddOnValues>({
    resolver: zodResolver(addOnSchema),
    defaultValues: emptyValues,
  });

  const available = watch("available");
  const name = watch("name");
  const imageUrl = watch("imageUrl");

  const [debouncedName, setDebouncedName] = React.useState("");
  const [suggestionsOpen, setSuggestionsOpen] = React.useState(false);

  React.useEffect(() => {
    if (isEdit) return;
    const timeout = setTimeout(() => setDebouncedName(name ?? ""), 300);
    return () => clearTimeout(timeout);
  }, [name, isEdit]);

  const dishSearch = useSearchDishesQuery(debouncedName);
  const suggestions = dishSearch.data ?? [];

  function pickSuggestion(dish: Dish) {
    setValue("name", dish.name, { shouldValidate: true });
    setValue("imageUrl", dish.imageUrl ?? "", { shouldValidate: true });
    setSuggestionsOpen(false);
  }

  React.useEffect(() => {
    if (!open) return;
    reset(valuesOf(addOn));
    setDebouncedName("");
    setSuggestionsOpen(false);
  }, [open, addOn, reset]);

  async function handlePhotoChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
      toast.error("Choose a JPG, PNG, WebP or AVIF image");
      return;
    }
    if (file.size > MAX_ADDON_IMAGE_BYTES) {
      toast.error("That image is over 1 MB, pick a smaller one");
      return;
    }

    setUploading(true);
    try {
      const uploaded = await uploadImage(file, { folder: "/dishes" });
      setValue("imageUrl", uploaded.url, { shouldValidate: true });
    } catch {
      toast.error("Could not upload that photo");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  const onSubmit = handleSubmit(async (values) => {
    const response = isEdit && addOn
      ? await update.mutateAsync({
          id: addOn.id,
          input: {
            price: values.price,
            available: values.available,
          },
        })
      : await create.mutateAsync({
          name: values.name,
          imageUrl: values.imageUrl || undefined,
          price: values.price,
          available: values.available,
        });

    onSaved?.(response.data);
    onOpenChange(false);
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm">
        <form onSubmit={onSubmit} noValidate>
          <DialogHeader>
            <DialogTitle>{isEdit ? "Edit add-on" : "Add an add-on"}</DialogTitle>
            <DialogDescription>
              {isEdit
                ? "The name and photo are shared across every hotel on Atithi, so they can't be edited here."
                : "Extras guests can add to a dish when ordering, like sauces or sides."}
            </DialogDescription>
          </DialogHeader>

          <FieldGroup className="gap-5 py-4">
            <Field data-invalid={!!errors.name} className="relative">
              <FieldLabel htmlFor="addon-name">Name</FieldLabel>
              <Input
                id="addon-name"
                autoFocus
                autoComplete="off"
                aria-invalid={!!errors.name}
                disabled={isEdit}
                {...register("name")}
                placeholder="Ketchup"
                onFocus={() => setSuggestionsOpen(true)}
                onBlur={() => setTimeout(() => setSuggestionsOpen(false), 150)}
              />
              {!isEdit && (
                <FieldDescription>
                  Start typing to reuse a dish already on Atithi, image included.
                </FieldDescription>
              )}
              <FieldError errors={[errors.name]} />
              {!isEdit && suggestionsOpen && suggestions.length > 0 && (
                <div className="absolute top-full left-0 z-10 mt-1 w-full overflow-hidden rounded-lg border bg-popover shadow-md">
                  <ul className="max-h-56 overflow-y-auto py-1">
                    {suggestions.map((dish) => (
                      <li key={dish.id}>
                        <button
                          type="button"
                          className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-muted"
                          onMouseDown={(e) => e.preventDefault()}
                          onClick={() => pickSuggestion(dish)}
                        >
                          {dish.imageUrl ? (
                            // eslint-disable-next-line @next/next/no-img-element -- remote ImageKit URL
                            <img
                              src={dish.imageUrl}
                              alt=""
                              className="size-8 shrink-0 rounded object-cover"
                            />
                          ) : (
                            <span className="flex size-8 shrink-0 items-center justify-center rounded bg-muted text-muted-foreground">
                              <ImagePlusIcon className="size-4" />
                            </span>
                          )}
                          <span className="truncate">{dish.name}</span>
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </Field>

            <Field>
              <FieldLabel>Photo</FieldLabel>
              <input
                ref={fileInputRef}
                type="file"
                accept={ACCEPTED_IMAGE_TYPES.join(",")}
                className="hidden"
                disabled={isEdit}
                onChange={handlePhotoChange}
              />
              <button
                type="button"
                disabled={isEdit || uploading}
                onClick={() => fileInputRef.current?.click()}
                className="flex h-24 w-full items-center justify-center gap-2 overflow-hidden rounded-lg border border-dashed text-sm text-muted-foreground hover:bg-muted/50 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {uploading ? (
                  <Spinner />
                ) : imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element -- remote ImageKit URL
                  <img
                    src={imageUrl}
                    alt="Add-on preview"
                    className="size-full object-cover"
                  />
                ) : (
                  <span className="flex flex-col items-center gap-1.5">
                    <ImagePlusIcon className="size-5" />
                    Click to upload
                  </span>
                )}
              </button>
              <FieldDescription>JPG, PNG, WebP or AVIF, up to 1 MB.</FieldDescription>
            </Field>

            <Field data-invalid={!!errors.price}>
              <FieldLabel htmlFor="addon-price">Price (Rs)</FieldLabel>
              <Input
                id="addon-price"
                type="number"
                min={0}
                aria-invalid={!!errors.price}
                {...register("price")}
                placeholder="20"
              />
              <FieldError errors={[errors.price]} />
            </Field>

            <Field orientation="horizontal" className="justify-between">
              <div className="flex flex-col gap-0.5">
                <FieldLabel htmlFor="addon-available">Available for ordering</FieldLabel>
                <FieldDescription>
                  Turn off to hide this add-on from waiters and guests.
                </FieldDescription>
              </div>
              <Switch
                id="addon-available"
                checked={available}
                onCheckedChange={(checked) =>
                  setValue("available", checked, { shouldValidate: true })
                }
              />
            </Field>
          </FieldGroup>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              className="cursor-pointer"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="cursor-pointer"
              disabled={pending || uploading}
              data-icon={pending ? "inline-start" : undefined}
            >
              {pending && <Spinner />}
              {pending ? "Saving" : isEdit ? "Save changes" : "Add add-on"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
