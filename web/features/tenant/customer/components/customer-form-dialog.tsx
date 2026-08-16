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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Spinner } from "@/components/ui/spinner";
import { Textarea } from "@/components/ui/textarea";

import { useCreateCustomer, useUpdateCustomer } from "../client/useCustomers";
import { customerSchema, DOCUMENT_TYPE_LABELS, type CustomerValues } from "../schema";
import type { Customer } from "../types";

const DOCUMENT_TYPE_ITEMS = { none: "None", ...DOCUMENT_TYPE_LABELS };

const emptyValues: CustomerValues = {
  name: "",
  phone: "",
  email: "",
  notes: "",
  documentType: "none",
  documentNumber: "",
};

function valuesOf(customer?: Customer): CustomerValues {
  if (!customer) return emptyValues;
  return {
    name: customer.name,
    phone: customer.phone,
    email: customer.email ?? "",
    notes: customer.notes ?? "",
    documentType: customer.documentType ?? "none",
    documentNumber: customer.documentNumber ?? "",
  };
}

export function CustomerFormDialog({
  tenant,
  customer,
  open,
  onOpenChange,
  onSaved,
}: {
  tenant: string;
  customer?: Customer;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSaved?: (customer: Customer) => void;
}) {
  const isEdit = !!customer;

  const create = useCreateCustomer(tenant);
  const update = useUpdateCustomer(tenant);
  const pending = isEdit ? update.isPending : create.isPending;

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<CustomerValues>({
    resolver: zodResolver(customerSchema),
    defaultValues: emptyValues,
  });

  React.useEffect(() => {
    if (!open) return;
    reset(valuesOf(customer));
  }, [open, customer, reset]);

  const documentType = watch("documentType");

  const onSubmit = handleSubmit(async (values) => {
    const payload = {
      name: values.name,
      phone: values.phone,
      email: values.email || undefined,
      notes: values.notes || undefined,
      documentType: values.documentType === "none" ? undefined : values.documentType,
      documentNumber:
        values.documentType === "none" ? undefined : values.documentNumber || undefined,
    };

    const response = customer
      ? await update.mutateAsync({ id: customer.id, input: payload })
      : await create.mutateAsync(payload);

    onSaved?.(response.data);
    onOpenChange(false);
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <form onSubmit={onSubmit} noValidate>
          <DialogHeader>
            <DialogTitle>{isEdit ? "Edit customer" : "Add a customer"}</DialogTitle>
            <DialogDescription>
              {isEdit
                ? "Update this customer's details."
                : "Keep a record even before their first booking."}
            </DialogDescription>
          </DialogHeader>

          <FieldGroup className="max-h-[65vh] gap-5 overflow-y-auto scrollbar-none py-4">
            <Field data-invalid={!!errors.name}>
              <FieldLabel htmlFor="customer-name">Full name</FieldLabel>
              <Input
                id="customer-name"
                autoFocus
                aria-invalid={!!errors.name}
                {...register("name")}
                placeholder="Sujata Shrestha"
              />
              <FieldError errors={[errors.name]} />
            </Field>

            <Field data-invalid={!!errors.phone}>
              <FieldLabel htmlFor="customer-phone">Phone</FieldLabel>
              <Input
                id="customer-phone"
                aria-invalid={!!errors.phone}
                {...register("phone")}
                placeholder="98XXXXXXXX"
              />
              <FieldError errors={[errors.phone]} />
            </Field>

            <Field data-invalid={!!errors.email}>
              <FieldLabel htmlFor="customer-email">
                Email <span className="text-muted-foreground">(optional)</span>
              </FieldLabel>
              <Input
                id="customer-email"
                type="email"
                aria-invalid={!!errors.email}
                {...register("email")}
                placeholder="guest@example.com"
              />
              <FieldError errors={[errors.email]} />
            </Field>

            <div className="grid grid-cols-2 gap-3">
              <Field data-invalid={!!errors.documentType}>
                <FieldLabel htmlFor="customer-document-type">
                  ID document <span className="text-muted-foreground">(optional)</span>
                </FieldLabel>
                <Select
                  items={DOCUMENT_TYPE_ITEMS}
                  value={documentType}
                  onValueChange={(value) =>
                    setValue(
                      "documentType",
                      (value ?? "none") as CustomerValues["documentType"],
                      { shouldValidate: true },
                    )
                  }
                >
                  <SelectTrigger id="customer-document-type" className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(DOCUMENT_TYPE_ITEMS).map(([value, label]) => (
                      <SelectItem key={value} value={value}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>

              <Field data-invalid={!!errors.documentNumber}>
                <FieldLabel htmlFor="customer-document-number">Number</FieldLabel>
                <Input
                  id="customer-document-number"
                  disabled={documentType === "none"}
                  aria-invalid={!!errors.documentNumber}
                  {...register("documentNumber")}
                  placeholder="123-456"
                />
              </Field>
            </div>
            <FieldError errors={[errors.documentNumber]} />

            <Field data-invalid={!!errors.notes}>
              <FieldLabel htmlFor="customer-notes">
                Notes <span className="text-muted-foreground">(optional)</span>
              </FieldLabel>
              <Textarea
                id="customer-notes"
                aria-invalid={!!errors.notes}
                {...register("notes")}
                placeholder="Preferences, allergies, anything worth remembering."
              />
              <FieldError errors={[errors.notes]} />
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
              {pending ? "Saving" : isEdit ? "Save changes" : "Add customer"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
