"use client";

import * as React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
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
import { useSubMenusQuery } from "@/features/tenant/subMenu/client/useSubMenus";

import { useCreateCategory, useUpdateCategory } from "../client/useCategories";
import { categorySchema, type CategoryInput, type CategoryValues } from "../schema";
import type { Category } from "../types";

const emptyValues: CategoryInput = { name: "", subMenuIds: [] };

function valuesOf(category?: Category): CategoryInput {
  if (!category) return emptyValues;
  return { name: category.name, subMenuIds: category.subMenus.map((sm) => sm.id) };
}

export function CategoryFormDialog({
  tenant,
  category,
  open,
  onOpenChange,
  onSaved,
}: {
  tenant: string;
  category?: Category;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSaved?: (category: Category) => void;
}) {
  const isEdit = !!category;
  const create = useCreateCategory(tenant);
  const update = useUpdateCategory(tenant);
  const pending = isEdit ? update.isPending : create.isPending;

  const subMenusQuery = useSubMenusQuery(tenant, { limit: 100 });
  const subMenus = subMenusQuery.data?.subMenus ?? [];

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<CategoryInput, unknown, CategoryValues>({
    resolver: zodResolver(categorySchema),
    defaultValues: emptyValues,
  });

  const selectedSubMenuIds = watch("subMenuIds");

  React.useEffect(() => {
    if (!open) return;
    reset(valuesOf(category));
  }, [open, category, reset]);

  function toggleSubMenu(id: string) {
    const next = selectedSubMenuIds.includes(id)
      ? selectedSubMenuIds.filter((s) => s !== id)
      : [...selectedSubMenuIds, id];
    setValue("subMenuIds", next, { shouldValidate: true });
  }

  const onSubmit = handleSubmit(async (values) => {
    const response = category
      ? await update.mutateAsync({ id: category.id, input: values })
      : await create.mutateAsync(values);

    onSaved?.(response.data);
    onOpenChange(false);
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm">
        <form onSubmit={onSubmit} noValidate>
          <DialogHeader>
            <DialogTitle>{isEdit ? "Edit category" : "Add a category"}</DialogTitle>
            <DialogDescription>
              Groups dishes on the menu, such as &quot;Starters&quot; or &quot;Beverages&quot;.
            </DialogDescription>
          </DialogHeader>

          <FieldGroup className="gap-5 py-4">
            <Field data-invalid={!!errors.name}>
              <FieldLabel htmlFor="category-name">Name</FieldLabel>
              <Input
                id="category-name"
                autoFocus
                aria-invalid={!!errors.name}
                {...register("name")}
                placeholder="Starters"
              />
              <FieldError errors={[errors.name]} />
            </Field>

            <Field data-invalid={!!errors.subMenuIds}>
              <FieldLabel>Sub-menus</FieldLabel>
              <div className="flex flex-col gap-2 rounded-lg border p-3">
                {subMenus.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    No sub-menus yet. Add one under Sub Menu first.
                  </p>
                ) : (
                  subMenus.map((sm) => (
                    <label
                      key={sm.id}
                      className="flex cursor-pointer items-center gap-2.5 text-sm"
                    >
                      <Checkbox
                        checked={selectedSubMenuIds.includes(sm.id)}
                        onCheckedChange={() => toggleSubMenu(sm.id)}
                      />
                      {sm.name}
                    </label>
                  ))
                )}
              </div>
              <FieldError errors={[errors.subMenuIds]} />
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
              {pending ? "Saving" : isEdit ? "Save changes" : "Add category"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
