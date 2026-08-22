"use client";

import * as React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useQueryClient } from "@tanstack/react-query";

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
import { Textarea } from "@/components/ui/textarea";
import { attachPendingImages } from "@/features/tenant/hotelImages/api/hotel-images";
import { EntityImageManager } from "@/features/tenant/hotelImages/components/entity-image-manager";
import type { PendingHotelImage } from "@/features/tenant/hotelImages/types";

import { useBillingTypesQuery } from "../../billingType/client/useBillingTypes";
import { cabinKeys, useCreateCabin, useUpdateCabin } from "../client/useCabins";
import { cabinSchema, type CabinInput, type CabinValues } from "../schema";
import type { Cabin } from "../types";

const emptyValues: CabinInput = {
  name: "",
  number: "",
  basePrice: 0,
  billingTypeId: "",
  capacity: 2,
  description: "",
  amenities: "",
  restrictions: "",
};

function valuesOf(cabin?: Cabin, defaultBillingTypeId?: string): CabinInput {
  if (!cabin) return { ...emptyValues, billingTypeId: defaultBillingTypeId ?? "" };
  return {
    name: cabin.name,
    number: cabin.number,
    basePrice: cabin.basePrice,
    billingTypeId: cabin.billingTypeId ?? "",
    capacity: cabin.capacity,
    description: cabin.description ?? "",
    amenities: cabin.amenities.join(", "),
    restrictions: cabin.restrictions.join(", "),
  };
}

export function CabinFormDialog({
  tenant,
  cabin,
  open,
  onOpenChange,
  onSaved,
}: {
  tenant: string;
  cabin?: Cabin;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSaved?: (cabin: Cabin) => void;
}) {
  const isEdit = !!cabin;
  const queryClient = useQueryClient();
  const create = useCreateCabin(tenant);
  const update = useUpdateCabin(tenant);
  const pending = isEdit ? update.isPending : create.isPending;
  const billingTypesQuery = useBillingTypesQuery(tenant, { limit: 100 });
  const billingTypes = React.useMemo(
    () => billingTypesQuery.data?.billingTypes ?? [],
    [billingTypesQuery.data],
  );

  const [pendingImages, setPendingImages] = React.useState<PendingHotelImage[]>([]);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<CabinInput, unknown, CabinValues>({
    resolver: zodResolver(cabinSchema),
    defaultValues: emptyValues,
  });

  const billingTypeId = watch("billingTypeId");

  React.useEffect(() => {
    if (!open) return;
    reset(valuesOf(cabin, billingTypes[0]?.id));
    setPendingImages([]);
  }, [open, cabin, reset, billingTypes]);

  const onSubmit = handleSubmit(async (values) => {
    const payload = {
      name: values.name,
      number: values.number,
      basePrice: values.basePrice,
      billingTypeId: values.billingTypeId,
      capacity: values.capacity,
      description: values.description || undefined,
      amenities: (values.amenities ?? "")
        .split(",")
        .map((a) => a.trim())
        .filter(Boolean),
      restrictions: (values.restrictions ?? "")
        .split(",")
        .map((r) => r.trim())
        .filter(Boolean),
    };

    const response = cabin
      ? await update.mutateAsync({ id: cabin.id, input: payload })
      : await create.mutateAsync(payload);

    if (!cabin && pendingImages.length) {
      await attachPendingImages(tenant, "cabin", response.data.id, pendingImages);
      queryClient.invalidateQueries({ queryKey: cabinKeys.all(tenant) });
    }

    onSaved?.(response.data);
    onOpenChange(false);
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <form onSubmit={onSubmit} noValidate>
          <DialogHeader>
            <DialogTitle>{isEdit ? "Edit cabin" : "Add a cabin"}</DialogTitle>
            <DialogDescription>
              {isEdit
                ? "Update this cabin's pricing and details."
                : "New cabins start out as available."}
            </DialogDescription>
          </DialogHeader>

          <FieldGroup className="max-h-[65vh] gap-5 overflow-y-auto scrollbar-none px-1 py-4 -mx-1">
            <Field>
              <FieldLabel>Photos</FieldLabel>
              <EntityImageManager
                tenant={tenant}
                entityType="cabin"
                entityId={cabin?.id}
                folder="/cabins"
                maxCount={3}
                pending={pendingImages}
                onPendingChange={setPendingImages}
              />
              <FieldDescription>JPG, PNG, WebP or AVIF, up to 5 MB each.</FieldDescription>
            </Field>

            <Field className="grid grid-cols-2 gap-3">
              <Field data-invalid={!!errors.name}>
                <FieldLabel htmlFor="cabin-name">Name</FieldLabel>
                <Input
                  id="cabin-name"
                  autoFocus
                  aria-invalid={!!errors.name}
                  {...register("name")}
                  placeholder="Lakeside Cabin"
                />
                <FieldError errors={[errors.name]} />
              </Field>
              <Field data-invalid={!!errors.number}>
                <FieldLabel htmlFor="cabin-number">Number</FieldLabel>
                <Input
                  id="cabin-number"
                  aria-invalid={!!errors.number}
                  {...register("number")}
                  placeholder="C-05"
                />
                <FieldError errors={[errors.number]} />
              </Field>
            </Field>

            <Field className="grid grid-cols-2 gap-3">
              <Field data-invalid={!!errors.basePrice}>
                <FieldLabel htmlFor="cabin-price">Base price (Rs)</FieldLabel>
                <Input
                  id="cabin-price"
                  type="number"
                  min={0}
                  aria-invalid={!!errors.basePrice}
                  {...register("basePrice")}
                  placeholder="4500"
                />
                <FieldError errors={[errors.basePrice]} />
              </Field>
              <Field data-invalid={!!errors.billingTypeId}>
                <FieldLabel htmlFor="cabin-billing-type">Billed</FieldLabel>
                <Select
                  items={Object.fromEntries(billingTypes.map((b) => [b.id, b.name]))}
                  value={billingTypeId}
                  onValueChange={(value) =>
                    setValue("billingTypeId", value ?? "", { shouldValidate: true })
                  }
                >
                  <SelectTrigger id="cabin-billing-type" className="w-full">
                    <SelectValue placeholder="Select a billing type" />
                  </SelectTrigger>
                  <SelectContent>
                    {billingTypes.map((option) => (
                      <SelectItem key={option.id} value={option.id}>
                        {option.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FieldError errors={[errors.billingTypeId]} />
              </Field>
            </Field>

            <Field data-invalid={!!errors.capacity}>
              <FieldLabel htmlFor="cabin-capacity">Capacity</FieldLabel>
              <Input
                id="cabin-capacity"
                type="number"
                min={1}
                aria-invalid={!!errors.capacity}
                {...register("capacity")}
              />
              <FieldError errors={[errors.capacity]} />
            </Field>

            <Field data-invalid={!!errors.description}>
              <FieldLabel htmlFor="cabin-description">
                Description <span className="text-muted-foreground">(optional)</span>
              </FieldLabel>
              <Textarea
                id="cabin-description"
                aria-invalid={!!errors.description}
                {...register("description")}
                placeholder="What makes this cabin different."
              />
              <FieldError errors={[errors.description]} />
            </Field>

            <Field data-invalid={!!errors.amenities}>
              <FieldLabel htmlFor="cabin-amenities">
                Amenities <span className="text-muted-foreground">(optional)</span>
              </FieldLabel>
              <Textarea
                id="cabin-amenities"
                aria-invalid={!!errors.amenities}
                {...register("amenities")}
                placeholder="Wi-Fi, AC, Fireplace"
                rows={2}
              />
              <FieldDescription>Comma-separated.</FieldDescription>
              <FieldError errors={[errors.amenities]} />
            </Field>

            <Field data-invalid={!!errors.restrictions}>
              <FieldLabel htmlFor="cabin-restrictions">
                Restrictions <span className="text-muted-foreground">(optional)</span>
              </FieldLabel>
              <Textarea
                id="cabin-restrictions"
                aria-invalid={!!errors.restrictions}
                {...register("restrictions")}
                placeholder="Non-smoking, No pets, Adults only"
                rows={2}
              />
              <FieldDescription>Comma-separated.</FieldDescription>
              <FieldError errors={[errors.restrictions]} />
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
              {pending ? "Saving" : isEdit ? "Save changes" : "Add cabin"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
