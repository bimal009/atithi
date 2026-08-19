"use client";

import * as React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { SearchIcon, UtensilsCrossedIcon } from "lucide-react";
import { parseAsString, useQueryState } from "nuqs";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { useMenuItemsQuery } from "@/features/tenant/menuItem/client/useMenuItems";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { formatCurrency } from "@/lib/utils";

import { useCreateMenuSet, useUpdateMenuSet } from "../client/useMenuSets";
import { menuSetSchema, type MenuSetInput, type MenuSetValues } from "../schema";
import type { MenuSet } from "../types";

const itemSearchParser = parseAsString.withDefault("").withOptions({
  history: "replace",
});

const emptyValues: MenuSetInput = {
  name: "",
  description: "",
  price: 0,
  available: true,
  items: [],
};

function valuesOf(menuSet?: MenuSet): MenuSetInput {
  if (!menuSet) return emptyValues;
  return {
    name: menuSet.name,
    description: menuSet.description ?? "",
    price: menuSet.price,
    available: menuSet.available,
    items: menuSet.items.map((i) => ({ menuItemId: i.id, quantity: i.quantity })),
  };
}

export function MenuSetFormDialog({
  tenant,
  menuSet,
  open,
  onOpenChange,
  onSaved,
}: {
  tenant: string;
  menuSet?: MenuSet;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSaved?: (menuSet: MenuSet) => void;
}) {
  const isEdit = !!menuSet;
  const create = useCreateMenuSet(tenant);
  const update = useUpdateMenuSet(tenant);
  const pending = isEdit ? update.isPending : create.isPending;

  const [itemSearch, setItemSearch] = useQueryState("itemQuery", itemSearchParser);

  const debouncedItemSearch = useDebouncedValue(itemSearch, 300);
  const menuItemsQuery = useMenuItemsQuery(tenant, { search: debouncedItemSearch, limit: 20 });
  const availableItems = menuItemsQuery.data?.menuItems ?? [];

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<MenuSetInput, unknown, MenuSetValues>({
    resolver: zodResolver(menuSetSchema),
    defaultValues: emptyValues,
  });

  const available = watch("available");
  const items = watch("items");

  React.useEffect(() => {
    if (!open) return;
    reset(valuesOf(menuSet));
    setItemSearch("");
  }, [open, menuSet, reset, setItemSearch]);

  function toggleItem(menuItemId: string) {
    const exists = items.some((i) => i.menuItemId === menuItemId);
    const next = exists
      ? items.filter((i) => i.menuItemId !== menuItemId)
      : [...items, { menuItemId, quantity: 1 }];
    setValue("items", next, { shouldValidate: true });
  }

  function updateQuantity(menuItemId: string, quantity: number) {
    const next = items.map((i) =>
      i.menuItemId === menuItemId ? { ...i, quantity: Math.max(1, quantity) } : i,
    );
    setValue("items", next, { shouldValidate: true });
  }

  const onSubmit = handleSubmit(async (values) => {
    const response = menuSet
      ? await update.mutateAsync({ id: menuSet.id, input: values })
      : await create.mutateAsync(values);

    onSaved?.(response.data);
    onOpenChange(false);
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <form onSubmit={onSubmit} noValidate>
          <DialogHeader>
            <DialogTitle>{isEdit ? "Edit menu set" : "Add a menu set"}</DialogTitle>
            <DialogDescription>
              Bundle a few dishes into a combo at a special price.
            </DialogDescription>
          </DialogHeader>

          <FieldGroup className="max-h-[65vh] gap-5 overflow-y-auto scrollbar-none px-1 py-4 -mx-1">
            <Field data-invalid={!!errors.name}>
              <FieldLabel htmlFor="set-name">Set name</FieldLabel>
              <Input
                id="set-name"
                autoFocus
                aria-invalid={!!errors.name}
                {...register("name")}
                placeholder="Momo Combo"
              />
              <FieldError errors={[errors.name]} />
            </Field>

            <Field data-invalid={!!errors.description}>
              <FieldLabel htmlFor="set-description">
                Description <span className="text-muted-foreground">(optional)</span>
              </FieldLabel>
              <Textarea
                id="set-description"
                aria-invalid={!!errors.description}
                {...register("description")}
                placeholder="What's included, in one line."
              />
              <FieldError errors={[errors.description]} />
            </Field>

            <Field data-invalid={!!errors.price}>
              <FieldLabel htmlFor="set-price">Set price (Rs)</FieldLabel>
              <Input
                id="set-price"
                type="number"
                min={0}
                aria-invalid={!!errors.price}
                {...register("price")}
                placeholder="250"
              />
              <FieldError errors={[errors.price]} />
            </Field>

            <Field data-invalid={!!errors.items}>
              <FieldLabel>Included dishes</FieldLabel>
              <div className="relative">
                <SearchIcon className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={itemSearch}
                  onChange={(e) => setItemSearch(e.target.value)}
                  placeholder="Search dishes…"
                  className="pl-8"
                />
              </div>
              {availableItems.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  {itemSearch
                    ? "No dishes match your search."
                    : "No dishes yet. Add one under Menu > Dishes."}
                </p>
              ) : (
                <div className="flex max-h-64 flex-col gap-0.5 overflow-y-auto scrollbar-none rounded-lg border p-1">
                  {availableItems.map((item) => {
                    const selected = items.find((i) => i.menuItemId === item.id);
                    return (
                      <div
                        key={item.id}
                        className="flex items-center gap-2.5 rounded-md px-2 py-1.5 text-sm hover:bg-muted"
                      >
                        <label className="flex flex-1 cursor-pointer items-center gap-2.5">
                          <Checkbox
                            checked={!!selected}
                            onCheckedChange={() => toggleItem(item.id)}
                          />
                          {item.imageUrl ? (
                            // eslint-disable-next-line @next/next/no-img-element -- remote ImageKit URL
                            <img
                              src={item.imageUrl}
                              alt=""
                              className="size-6 shrink-0 rounded-full object-cover"
                            />
                          ) : (
                            <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground">
                              <UtensilsCrossedIcon className="size-3" />
                            </span>
                          )}
                          <span className="flex-1">{item.name}</span>
                          <span className="text-xs text-muted-foreground tabular-nums">
                            {formatCurrency(item.price)}
                          </span>
                        </label>
                        {selected && (
                          <Input
                            type="number"
                            min={1}
                            value={Number(selected.quantity)}
                            onChange={(e) =>
                              updateQuantity(item.id, Number(e.target.value) || 1)
                            }
                            className="h-7 w-14 shrink-0 text-center"
                          />
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
              {errors.items && (
                <p className="text-sm text-destructive">Select at least one dish.</p>
              )}
            </Field>

            <Field orientation="horizontal" className="justify-between">
              <FieldLabel htmlFor="set-available">Available for ordering</FieldLabel>
              <Switch
                id="set-available"
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
              disabled={pending}
              data-icon={pending ? "inline-start" : undefined}
            >
              {pending && <Spinner />}
              {pending ? "Saving" : isEdit ? "Save changes" : "Add menu set"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
