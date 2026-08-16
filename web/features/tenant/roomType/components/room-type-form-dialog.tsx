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
import { Spinner } from "@/components/ui/spinner";
import { Textarea } from "@/components/ui/textarea";

import { useCreateRoomType, useUpdateRoomType } from "../client/useRoomTypes";
import { roomTypeSchema, type RoomTypeInput, type RoomTypeValues } from "../schema";
import type { RoomType } from "../types";

const emptyValues: RoomTypeInput = {
  name: "",
  description: "",
  basePrice: 0,
  capacity: 2,
  amenities: "",
};

function valuesOf(roomType?: RoomType): RoomTypeInput {
  if (!roomType) return emptyValues;
  return {
    name: roomType.name,
    description: roomType.description ?? "",
    basePrice: roomType.basePrice,
    capacity: roomType.capacity,
    amenities: roomType.amenities.join(", "),
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

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<RoomTypeInput, unknown, RoomTypeValues>({
    resolver: zodResolver(roomTypeSchema),
    defaultValues: emptyValues,
  });

  React.useEffect(() => {
    if (!open) return;
    reset(valuesOf(roomType));
  }, [open, roomType, reset]);

  const onSubmit = handleSubmit(async (values) => {
    const payload = {
      name: values.name,
      basePrice: values.basePrice,
      capacity: values.capacity,
      description: values.description || undefined,
      amenities: (values.amenities ?? "")
        .split(",")
        .map((a) => a.trim())
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

          <FieldGroup className="max-h-[65vh] gap-5 overflow-y-auto scrollbar-none py-4">
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
                <FieldLabel htmlFor="type-price">Base price / night (Rs)</FieldLabel>
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
              <Input
                id="type-amenities"
                aria-invalid={!!errors.amenities}
                {...register("amenities")}
                placeholder="Wi-Fi, AC, Jacuzzi"
              />
              <FieldDescription>Comma-separated.</FieldDescription>
              <FieldError errors={[errors.amenities]} />
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
