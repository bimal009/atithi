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
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { Textarea } from "@/components/ui/textarea";

import { useCreateSubMenu, useUpdateSubMenu } from "../client/useSubMenus";
import { subMenuSchema, type SubMenuInput, type SubMenuValues } from "../schema";
import type { SubMenu } from "../types";

const emptyValues: SubMenuInput = { name: "", description: "" };

function valuesOf(subMenu?: SubMenu): SubMenuInput {
  if (!subMenu) return emptyValues;
  return { name: subMenu.name, description: subMenu.description ?? "" };
}

export function SubMenuFormDialog({
  tenant,
  subMenu,
  open,
  onOpenChange,
  onSaved,
}: {
  tenant: string;
  subMenu?: SubMenu;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSaved?: (subMenu: SubMenu) => void;
}) {
  const isEdit = !!subMenu;
  const create = useCreateSubMenu(tenant);
  const update = useUpdateSubMenu(tenant);
  const pending = isEdit ? update.isPending : create.isPending;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<SubMenuInput, unknown, SubMenuValues>({
    resolver: zodResolver(subMenuSchema),
    defaultValues: emptyValues,
  });

  React.useEffect(() => {
    if (!open) return;
    reset(valuesOf(subMenu));
  }, [open, subMenu, reset]);

  const onSubmit = handleSubmit(async (values) => {
    const payload = {
      name: values.name,
      description: values.description || undefined,
    };

    const response = subMenu
      ? await update.mutateAsync({ id: subMenu.id, input: payload })
      : await create.mutateAsync(payload);

    onSaved?.(response.data);
    onOpenChange(false);
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm">
        <form onSubmit={onSubmit} noValidate>
          <DialogHeader>
            <DialogTitle>{isEdit ? "Edit sub-menu" : "Add a sub-menu"}</DialogTitle>
            <DialogDescription>
              Groups categories, such as &quot;Restaurant Menu&quot; or &quot;Bar Menu&quot;.
            </DialogDescription>
          </DialogHeader>

          <FieldGroup className="gap-5 py-4">
            <Field data-invalid={!!errors.name}>
              <FieldLabel htmlFor="sub-menu-name">Name</FieldLabel>
              <Input
                id="sub-menu-name"
                autoFocus
                aria-invalid={!!errors.name}
                {...register("name")}
                placeholder="Breakfast Menu"
              />
              <FieldError errors={[errors.name]} />
            </Field>

            <Field data-invalid={!!errors.description}>
              <FieldLabel htmlFor="sub-menu-description">
                Description <span className="text-muted-foreground">(optional)</span>
              </FieldLabel>
              <Textarea
                id="sub-menu-description"
                aria-invalid={!!errors.description}
                {...register("description")}
                placeholder="Served 7 AM to 10 AM."
              />
              <FieldError errors={[errors.description]} />
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
              {pending ? "Saving" : isEdit ? "Save changes" : "Add sub-menu"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
