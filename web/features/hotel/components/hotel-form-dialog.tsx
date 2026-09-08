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
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import { Spinner } from "@/components/ui/spinner";
import { Textarea } from "@/components/ui/textarea";
import { NepalFlag } from "@/components/shared/nepal-flag";
import { NEPAL_DIAL_CODE, normalizePhoneNumber } from "@/features/auth/schema";

import {
  useCreateHotel,
  useUpdateHotel,
} from "../client/useHotels";
import { CreateHotelValues, createHotelSchema } from "../schema";
import type { Hotel } from "../types";

const emptyValues: CreateHotelValues = {
  name: "",
  address: "",
  phoneNumber: "",
  city: "",
  email: "",
  description: "",
};

function valuesOf(hotel?: Hotel): CreateHotelValues {
  if (!hotel) return emptyValues;
  return {
    name: hotel.name,
    address: hotel.address,
    phoneNumber: hotel.phoneNumber,
    city: hotel.city ?? "",
    email: hotel.email ?? "",
    description: hotel.description ?? "",
  };
}

export function HotelFormDialog({
  open,
  onOpenChange,
  hotel,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  hotel?: Hotel;
}) {
  const isEdit = !!hotel;
  const create = useCreateHotel();
  const update = useUpdateHotel();
  const pending = isEdit ? update.isPending : create.isPending;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateHotelValues>({
    resolver: zodResolver(createHotelSchema),
    defaultValues: emptyValues,
  });

  React.useEffect(() => {
    if (!open) return;
    reset(valuesOf(hotel));
  }, [open, hotel, reset]);

  const nameField = register("name");
  const phoneField = register("phoneNumber");

  const onSubmit = handleSubmit(async (values) => {
    const payload = {
      name: values.name,
      address: values.address,
      phoneNumber: values.phoneNumber,
      city: values.city || undefined,
      email: values.email || undefined,
      description: values.description || undefined,
    };

    if (hotel) {
      await update.mutateAsync({ id: hotel.id, input: payload });
    } else {
      await create.mutateAsync(payload);
    }

    onOpenChange(false);
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <form onSubmit={onSubmit} noValidate>
          <DialogHeader>
            <DialogTitle>{isEdit ? "Edit hotel" : "Add a hotel"}</DialogTitle>
            <DialogDescription>
              {isEdit
                ? "Update this property's details."
                : "Each hotel gets its own dashboard, staff and rooms."}
            </DialogDescription>
          </DialogHeader>

          <FieldGroup className="max-h-[65vh] gap-5 overflow-y-auto scrollbar-none px-1 py-4 -mx-1">
            <Field data-invalid={!!errors.name}>
              <FieldLabel htmlFor="hotel-name">Hotel name</FieldLabel>
              <Input
                id="hotel-name"
                autoFocus
                placeholder="Hotel Everest View"
                aria-invalid={!!errors.name}
                {...nameField}
              />
              <FieldError errors={[errors.name]} />
            </Field>

            <Field data-invalid={!!errors.address}>
              <FieldLabel htmlFor="hotel-address">Address</FieldLabel>
              <Input
                id="hotel-address"
                placeholder="Lakeside Road, Ward 6"
                aria-invalid={!!errors.address}
                {...register("address")}
              />
              <FieldError errors={[errors.address]} />
            </Field>

            <div className="grid gap-5 sm:grid-cols-2">
              <Field data-invalid={!!errors.city}>
                <FieldLabel htmlFor="hotel-city">City</FieldLabel>
                <Input
                  id="hotel-city"
                  placeholder="Pokhara"
                  aria-invalid={!!errors.city}
                  {...register("city")}
                />
                <FieldError errors={[errors.city]} />
              </Field>

              <Field data-invalid={!!errors.phoneNumber}>
                <FieldLabel htmlFor="hotel-phone">Phone</FieldLabel>
                <InputGroup>
                  <InputGroupAddon className="mr-1 border-r border-input py-2 pr-2.5 pl-3">
                    <span className="flex items-center gap-1.5">
                      <NepalFlag className="h-4 w-auto" />
                      <span className="font-medium text-foreground">
                        {NEPAL_DIAL_CODE}
                      </span>
                    </span>
                  </InputGroupAddon>
                  <InputGroupInput
                    id="hotel-phone"
                    type="tel"
                    inputMode="numeric"
                    maxLength={10}
                    placeholder="98XXXXXXXX"
                    aria-invalid={!!errors.phoneNumber}
                    {...phoneField}
                    onChange={(event) => {
                      event.target.value = normalizePhoneNumber(
                        event.target.value,
                      );
                      phoneField.onChange(event);
                    }}
                  />
                </InputGroup>
                <FieldError errors={[errors.phoneNumber]} />
              </Field>
            </div>

            <Field data-invalid={!!errors.email}>
              <FieldLabel htmlFor="hotel-email">
                Email <span className="text-muted-foreground">(optional)</span>
              </FieldLabel>
              <Input
                id="hotel-email"
                type="email"
                placeholder="stay@hotel.com.np"
                aria-invalid={!!errors.email}
                {...register("email")}
              />
              <FieldError errors={[errors.email]} />
            </Field>

            <Field data-invalid={!!errors.description}>
              <FieldLabel htmlFor="hotel-description">
                Description{" "}
                <span className="text-muted-foreground">(optional)</span>
              </FieldLabel>
              <Textarea
                id="hotel-description"
                rows={3}
                placeholder="A 24-room property overlooking Phewa Lake."
                aria-invalid={!!errors.description}
                {...register("description")}
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
              {pending
                ? isEdit
                  ? "Saving"
                  : "Creating"
                : isEdit
                  ? "Save changes"
                  : "Create hotel"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
