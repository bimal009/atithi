"use client";

import * as React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Spinner } from "@/components/ui/spinner";
import { useSubMenusQuery } from "@/features/tenant/subMenu/client/useSubMenus";

import { useCreateCategory, useUpdateCategory } from "../client/useCategories";
import { categorySchema, type CategoryInput, type CategoryValues } from "../schema";
import type { Category } from "../types";

const emptyValues: CategoryInput = { name: "", subMenuId: "" };

function valuesOf(category?: Category): CategoryInput {
  if (!category) return emptyValues;
  return { name: category.name, subMenuId: category.subMenuId ?? "" };
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

  const subMenusQuery = useSubMenusQuery(tenant);
  const subMenus = subMenusQuery.data ?? [];

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

  const subMenuId = watch("subMenuId");

  React.useEffect(() => {
    if (!open) return;
    reset(valuesOf(category));
  }, [open, category, reset]);

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

            <Field data-invalid={!!errors.subMenuId}>
              <FieldLabel htmlFor="category-sub-menu">Sub-menu</FieldLabel>
              <Select
                items={Object.fromEntries(subMenus.map((sm) => [sm.id, sm.name]))}
                value={subMenuId}
                onValueChange={(v) => setValue("subMenuId", v ?? "", { shouldValidate: true })}
                disabled={subMenus.length === 0}
              >
                <SelectTrigger id="category-sub-menu" className="w-full">
                  <SelectValue placeholder="Select sub-menu" />
                </SelectTrigger>
                <SelectContent>
                  {subMenus.map((sm) => (
                    <SelectItem key={sm.id} value={sm.id}>
                      {sm.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {subMenus.length === 0 && (
                <FieldDescription>Add a sub-menu first under Sub Menu.</FieldDescription>
              )}
              <FieldError errors={[errors.subMenuId]} />
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
