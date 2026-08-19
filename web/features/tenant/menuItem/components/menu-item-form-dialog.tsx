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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Spinner } from "@/components/ui/spinner";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { uploadImage } from "@/features/upload/api/upload";
import { ACCEPTED_IMAGE_TYPES, MAX_IMAGE_BYTES } from "@/features/upload/types";
import { FOOD_TYPE_OPTIONS } from "@/lib/food-type";
import type { FoodType } from "@/types";

import {
  useCreateMenuItem,
  useSearchDishesQuery,
  useUpdateMenuItem,
} from "../client/useMenuItems";
import { menuItemSchema, type MenuItemInput, type MenuItemValues } from "../schema";
import type { Dish, MenuItem } from "../types";

const emptyValues: MenuItemInput = {
  name: "",
  imageUrl: "",
  category: "",
  foodType: "veg",
  price: 0,
  discount: undefined,
  description: "",
  ingredients: "",
  available: true,
};

function valuesOf(item?: MenuItem): MenuItemInput {
  if (!item) return emptyValues;
  return {
    name: item.name,
    imageUrl: item.imageUrl ?? "",
    category: item.category,
    foodType: item.foodType,
    price: item.price,
    discount: item.discount,
    description: item.description ?? "",
    ingredients: item.ingredients ?? "",
    available: item.available,
  };
}

export function MenuItemFormDialog({
  tenant,
  menuItem,
  open,
  onOpenChange,
  onSaved,
}: {
  tenant: string;
  menuItem?: MenuItem;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSaved?: (menuItem: MenuItem) => void;
}) {
  const isEdit = !!menuItem;
  const create = useCreateMenuItem(tenant);
  const update = useUpdateMenuItem(tenant);
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
  } = useForm<MenuItemInput, unknown, MenuItemValues>({
    resolver: zodResolver(menuItemSchema),
    defaultValues: emptyValues,
  });

  const foodType = watch("foodType");
  const imageUrl = watch("imageUrl");
  const available = watch("available");
  const name = watch("name");

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
    reset(valuesOf(menuItem));
    setDebouncedName("");
    setSuggestionsOpen(false);
  }, [open, menuItem, reset]);

  async function handlePhotoChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
      toast.error("Choose a JPG, PNG, WebP or AVIF image");
      return;
    }
    if (file.size > MAX_IMAGE_BYTES) {
      toast.error("That image is over 5 MB, pick a smaller one");
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
    const response = isEdit && menuItem
      ? await update.mutateAsync({
          id: menuItem.id,
          input: {
            category: values.category,
            foodType: values.foodType,
            price: values.price,
            discount: values.discount ?? undefined,
            description: values.description || undefined,
            ingredients: values.ingredients || undefined,
            available: values.available,
          },
        })
      : await create.mutateAsync({
          name: values.name,
          imageUrl: values.imageUrl || undefined,
          category: values.category,
          foodType: values.foodType,
          price: values.price,
          discount: values.discount ?? undefined,
          description: values.description || undefined,
          ingredients: values.ingredients || undefined,
          available: values.available,
        });

    onSaved?.(response.data);
    onOpenChange(false);
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <form onSubmit={onSubmit} noValidate>
          <DialogHeader>
            <DialogTitle>{isEdit ? "Edit dish" : "Add a dish"}</DialogTitle>
            <DialogDescription>
              {isEdit
                ? "The name and photo are shared across every hotel on Atithi, so they can't be edited here."
                : "New dishes are marked available right away."}
            </DialogDescription>
          </DialogHeader>

          <FieldGroup className="max-h-[65vh] gap-5 overflow-y-auto scrollbar-none px-1 py-4 -mx-1">
            <Field data-invalid={!!errors.name} className="relative">
              <FieldLabel htmlFor="item-name">Dish name</FieldLabel>
              <Input
                id="item-name"
                autoFocus
                autoComplete="off"
                aria-invalid={!!errors.name}
                disabled={isEdit}
                {...register("name")}
                placeholder="Chicken Sekuwa"
                onFocus={() => setSuggestionsOpen(true)}
                onBlur={() => setTimeout(() => setSuggestionsOpen(false), 150)}
              />
              {!isEdit && (
                <FieldDescription>
                  Start typing to reuse a dish already on Atithi, name and photo included.
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
              <FieldLabel>Dish photo</FieldLabel>
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
                className="flex h-28 w-full items-center justify-center gap-2 overflow-hidden rounded-lg border border-dashed text-sm text-muted-foreground hover:bg-muted/50 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {uploading ? (
                  <Spinner />
                ) : imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element -- remote ImageKit URL
                  <img
                    src={imageUrl}
                    alt="Dish preview"
                    className="size-full object-cover"
                  />
                ) : (
                  <span className="flex flex-col items-center gap-1.5">
                    <ImagePlusIcon className="size-5" />
                    Click to upload
                  </span>
                )}
              </button>
            </Field>

            <Field className="grid grid-cols-2 gap-3">
              <Field data-invalid={!!errors.category}>
                <FieldLabel htmlFor="item-category">Category</FieldLabel>
                <Input
                  id="item-category"
                  aria-invalid={!!errors.category}
                  {...register("category")}
                  placeholder="Starters"
                />
                <FieldError errors={[errors.category]} />
              </Field>
              <Field data-invalid={!!errors.foodType}>
                <FieldLabel htmlFor="item-type">Type</FieldLabel>
                <Select
                  items={Object.fromEntries(FOOD_TYPE_OPTIONS.map((o) => [o.value, o.label]))}
                  value={foodType}
                  onValueChange={(v) =>
                    setValue("foodType", (v ?? "veg") as FoodType, { shouldValidate: true })
                  }
                >
                  <SelectTrigger id="item-type" className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {FOOD_TYPE_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FieldError errors={[errors.foodType]} />
              </Field>
            </Field>

            <Field className="grid grid-cols-2 gap-3">
              <Field data-invalid={!!errors.price}>
                <FieldLabel htmlFor="item-price">Price (Rs)</FieldLabel>
                <Input
                  id="item-price"
                  type="number"
                  min={0}
                  aria-invalid={!!errors.price}
                  {...register("price")}
                  placeholder="280"
                />
                <FieldError errors={[errors.price]} />
              </Field>
              <Field data-invalid={!!errors.discount}>
                <FieldLabel htmlFor="item-discount">
                  Discount (Rs) <span className="text-muted-foreground">(optional)</span>
                </FieldLabel>
                <Input
                  id="item-discount"
                  type="number"
                  min={0}
                  aria-invalid={!!errors.discount}
                  {...register("discount")}
                  placeholder="0"
                />
                <FieldError errors={[errors.discount]} />
              </Field>
            </Field>

            <Field data-invalid={!!errors.description}>
              <FieldLabel htmlFor="item-description">
                Description <span className="text-muted-foreground">(optional)</span>
              </FieldLabel>
              <Textarea
                id="item-description"
                aria-invalid={!!errors.description}
                {...register("description")}
                placeholder="Shown to guests on the ordering screen."
              />
              <FieldError errors={[errors.description]} />
            </Field>

            <Field data-invalid={!!errors.ingredients}>
              <FieldLabel htmlFor="item-ingredients">
                Ingredients <span className="text-muted-foreground">(optional)</span>
              </FieldLabel>
              <Textarea
                id="item-ingredients"
                aria-invalid={!!errors.ingredients}
                {...register("ingredients")}
                placeholder="Chicken, yogurt, ginger-garlic paste, spices"
              />
              <FieldError errors={[errors.ingredients]} />
            </Field>

            <Field orientation="horizontal" className="justify-between">
              <div className="flex flex-col gap-0.5">
                <FieldLabel htmlFor="item-available">Available for ordering</FieldLabel>
                <FieldDescription>
                  Turn off to hide this dish from waiters and guests.
                </FieldDescription>
              </div>
              <Switch
                id="item-available"
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
              {pending ? "Saving" : isEdit ? "Save changes" : "Add dish"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
