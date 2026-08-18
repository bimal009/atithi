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

import { useCreateBillingType, useUpdateBillingType } from "../client/useBillingTypes";
import { billingTypeSchema, type BillingTypeInput, type BillingTypeValues } from "../schema";
import type { BillingType } from "../types";

const emptyValues: BillingTypeInput = { name: "" };

function valuesOf(billingType?: BillingType): BillingTypeInput {
  if (!billingType) return emptyValues;
  return { name: billingType.name };
}

export function BillingTypeFormDialog({
  tenant,
  billingType,
  open,
  onOpenChange,
  onSaved,
}: {
  tenant: string;
  billingType?: BillingType;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSaved?: (billingType: BillingType) => void;
}) {
  const isEdit = !!billingType;
  const create = useCreateBillingType(tenant);
  const update = useUpdateBillingType(tenant);
  const pending = isEdit ? update.isPending : create.isPending;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<BillingTypeInput, unknown, BillingTypeValues>({
    resolver: zodResolver(billingTypeSchema),
    defaultValues: emptyValues,
  });

  React.useEffect(() => {
    if (!open) return;
    reset(valuesOf(billingType));
  }, [open, billingType, reset]);

  const onSubmit = handleSubmit(async (values) => {
    const response = billingType
      ? await update.mutateAsync({ id: billingType.id, input: values })
      : await create.mutateAsync(values);

    onSaved?.(response.data);
    onOpenChange(false);
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm">
        <form onSubmit={onSubmit} noValidate>
          <DialogHeader>
            <DialogTitle>{isEdit ? "Edit billing type" : "Add a billing type"}</DialogTitle>
            <DialogDescription>
              Defines how a cabin or room type gets billed, such as &quot;Per Night&quot; or
              &quot;Per Weekend&quot;.
            </DialogDescription>
          </DialogHeader>

          <FieldGroup className="gap-5 py-4">
            <Field data-invalid={!!errors.name}>
              <FieldLabel htmlFor="billing-type-name">Name</FieldLabel>
              <Input
                id="billing-type-name"
                autoFocus
                aria-invalid={!!errors.name}
                {...register("name")}
                placeholder="Per Weekend"
              />
              <FieldError errors={[errors.name]} />
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
              {pending ? "Saving" : isEdit ? "Save changes" : "Add billing type"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
