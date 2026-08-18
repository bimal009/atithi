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

import { useBillingTypesQuery } from "../../billingType/client/useBillingTypes";
import { useCreateRoomType, useUpdateRoomType } from "../client/useRoomTypes";
import { roomTypeSchema, type RoomTypeInput, type RoomTypeValues } from "../schema";
import type { RoomType } from "../types";

const emptyValues: RoomTypeInput = {
  name: "",
  description: "",
  basePrice: 0,
  billingTypeId: "",
  pricingLabel: "",
  capacity: 2,
  amenities: "",
  restrictions: "",
};

function valuesOf(roomType?: RoomType, defaultBillingTypeId?: string): RoomTypeInput {
  if (!roomType) return { ...emptyValues, billingTypeId: defaultBillingTypeId ?? "" };
  return {
    name: roomType.name,
    description: roomType.description ?? "",
    basePrice: roomType.basePrice,
    billingTypeId: roomType.billingTypeId,
    pricingLabel: roomType.pricingLabel ?? "",
    capacity: roomType.capacity,
    amenities: roomType.amenities.join(", "),
    restrictions: roomType.restrictions.join(", "),
  };
}

export function RoomTypeFormDialog({
  tenant,
  roomType,
  open,
  onOpenChange,
  onSaved,
}: {
  tenant: string;
  roomType?: RoomType;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSaved?: (roomType: RoomType) => void;
}) {
  const isEdit = !!roomType;
  const create = useCreateRoomType(tenant);
  const update = useUpdateRoomType(tenant);
  const pending = isEdit ? update.isPending : create.isPending;
  const billingTypesQuery = useBillingTypesQuery(tenant);
  const billingTypes = React.useMemo(
    () => billingTypesQuery.data ?? [],
    [billingTypesQuery.data],
  );

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<RoomTypeInput, unknown, RoomTypeValues>({
    resolver: zodResolver(roomTypeSchema),
    defaultValues: emptyValues,
  });

  const billingTypeId = watch("billingTypeId");

  React.useEffect(() => {
    if (!open) return;
    reset(valuesOf(roomType, billingTypes[0]?.id));
  }, [open, roomType, reset, billingTypes]);

  const onSubmit = handleSubmit(async (values) => {
    const payload = {
      name: values.name,
      basePrice: values.basePrice,
      billingTypeId: values.billingTypeId,
      pricingLabel: values.pricingLabel || undefined,
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

    const response = roomType
      ? await update.mutateAsync({ id: roomType.id, input: payload })
      : await create.mutateAsync(payload);

    onSaved?.(response.data);
    onOpenChange(false);
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <form onSubmit={onSubmit} noValidate>
          <DialogHeader>
            <DialogTitle>{isEdit ? "Edit room type" : "Add a room type"}</DialogTitle>
            <DialogDescription>
              {isEdit
                ? "Update this room type's pricing and details."
                : "Rate categories that rooms get added under."}
            </DialogDescription>
          </DialogHeader>

          <FieldGroup className="max-h-[65vh] gap-5 overflow-y-auto scrollbar-none px-1 py-4 -mx-1">
            <Field data-invalid={!!errors.name}>
              <FieldLabel htmlFor="type-name">Name</FieldLabel>
              <Input
                id="type-name"
                autoFocus
                aria-invalid={!!errors.name}
                {...register("name")}
                placeholder="Honeymoon Suite"
              />
              <FieldError errors={[errors.name]} />
            </Field>

            <Field className="grid grid-cols-2 gap-3">
              <Field data-invalid={!!errors.basePrice}>
                <FieldLabel htmlFor="type-price">Base price (Rs)</FieldLabel>
                <Input
                  id="type-price"
                  type="number"
                  min={0}
                  aria-invalid={!!errors.basePrice}
                  {...register("basePrice")}
                  placeholder="4500"
                />
                <FieldError errors={[errors.basePrice]} />
              </Field>
              <Field data-invalid={!!errors.billingTypeId}>
                <FieldLabel htmlFor="type-billing-type">Billed</FieldLabel>
                <Select
                  items={Object.fromEntries(billingTypes.map((b) => [b.id, b.name]))}
                  value={billingTypeId}
                  onValueChange={(value) =>
                    setValue("billingTypeId", value ?? "", {
                      shouldValidate: true,
                    })
                  }
                >
                  <SelectTrigger id="type-billing-type" className="w-full">
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
                {billingTypes.length === 0 && (
                  <FieldDescription>
                    No billing types yet. Add one under Billing Types first.
                  </FieldDescription>
                )}
              </Field>
            </Field>

            <Field data-invalid={!!errors.pricingLabel}>
              <FieldLabel htmlFor="type-pricing-label">
                Notes <span className="text-muted-foreground">(optional)</span>
              </FieldLabel>
              <Textarea
                id="type-pricing-label"
                aria-invalid={!!errors.pricingLabel}
                {...register("pricingLabel")}
                placeholder="10 AM – 6 PM, 2 nights minimum"
                rows={2}
              />
              <FieldDescription>Comma-separated.</FieldDescription>
              <FieldError errors={[errors.pricingLabel]} />
            </Field>

            <Field data-invalid={!!errors.capacity}>
              <FieldLabel htmlFor="type-capacity">Capacity</FieldLabel>
              <Input
                id="type-capacity"
                type="number"
                min={1}
                aria-invalid={!!errors.capacity}
                {...register("capacity")}
              />
              <FieldError errors={[errors.capacity]} />
            </Field>

            <Field data-invalid={!!errors.description}>
              <FieldLabel htmlFor="type-description">
                Description <span className="text-muted-foreground">(optional)</span>
              </FieldLabel>
              <Textarea
                id="type-description"
                aria-invalid={!!errors.description}
                {...register("description")}
                placeholder="What makes this room type different."
              />
              <FieldError errors={[errors.description]} />
            </Field>

            <Field data-invalid={!!errors.amenities}>
              <FieldLabel htmlFor="type-amenities">
                Amenities <span className="text-muted-foreground">(optional)</span>
              </FieldLabel>
              <Textarea
                id="type-amenities"
                aria-invalid={!!errors.amenities}
                {...register("amenities")}
                placeholder="Wi-Fi, AC, Jacuzzi"
                rows={2}
              />
              <FieldDescription>Comma-separated.</FieldDescription>
              <FieldError errors={[errors.amenities]} />
            </Field>

            <Field data-invalid={!!errors.restrictions}>
              <FieldLabel htmlFor="type-restrictions">
                Restrictions <span className="text-muted-foreground">(optional)</span>
              </FieldLabel>
              <Textarea
                id="type-restrictions"
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
              {pending ? "Saving" : isEdit ? "Save changes" : "Add room type"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
