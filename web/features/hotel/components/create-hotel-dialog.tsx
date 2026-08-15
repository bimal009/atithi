"use client";

import * as React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { BuildingIcon, PlusIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import { Spinner } from "@/components/ui/spinner";
import { Textarea } from "@/components/ui/textarea";
import { NepalFlag } from "@/components/shared/nepal-flag";
import { NEPAL_DIAL_CODE, normalizePhoneNumber } from "@/features/auth/schema";
import { AvatarUpload } from "@/features/upload/components/avatar-upload";

import { useCreateHotel } from "../client/useHotels";
import { CreateHotelValues, createHotelSchema, slugify } from "../schema";

export function CreateHotelDialog() {
  const [open, setOpen] = React.useState(false);
  const create = useCreateHotel();

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    getValues,
    watch,
    formState: { errors },
  } = useForm<CreateHotelValues>({
    resolver: zodResolver(createHotelSchema),
    defaultValues: {
      name: "",
      slug: "",
      address: "",
      phoneNumber: "",
      city: "",
      email: "",
      description: "",
      logoUrl: "",
    },
  });

  const slugTouched = React.useRef(false);
  const nameField = register("name");
  const phoneField = register("phoneNumber");
  const slugField = register("slug");

  const onSubmit = handleSubmit(async (values) => {
    await create.mutateAsync({
      name: values.name,
      slug: values.slug,
      address: values.address,
      phoneNumber: values.phoneNumber,
      city: values.city || undefined,
      email: values.email || undefined,
      description: values.description || undefined,
      logoUrl: values.logoUrl || undefined,
    });

    slugTouched.current = false;
    reset();
    setOpen(false);
  });

  const handleOpenChange = (next: boolean) => {
    setOpen(next);
    if (!next) {
      slugTouched.current = false;
      reset();
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger
        render={
          <Button data-icon="inline-start" className="cursor-pointer">
            <PlusIcon aria-hidden />
            New hotel
          </Button>
        }
      />
      <DialogContent className="sm:max-w-lg">
        <form onSubmit={onSubmit} noValidate>
          <DialogHeader>
            <DialogTitle>Add a hotel</DialogTitle>
            <DialogDescription>
              Each hotel gets its own dashboard, staff and rooms.
            </DialogDescription>
          </DialogHeader>

          <FieldGroup className="my-6 gap-5">
            <AvatarUpload
              value={watch("logoUrl") || undefined}
              onChange={(url) =>
                setValue("logoUrl", url ?? "", { shouldValidate: true })
              }
              fallback={<BuildingIcon className="size-8" aria-hidden />}
              folder="/hotel-logos"
              disabled={create.isPending}
            />

            <Field data-invalid={!!errors.name}>
              <FieldLabel htmlFor="hotel-name">Hotel name</FieldLabel>
              <Input
                id="hotel-name"
                autoFocus
                placeholder="Hotel Everest View"
                aria-invalid={!!errors.name}
                {...nameField}
                onChange={(event) => {
                  nameField.onChange(event);
                  if (!slugTouched.current) {
                    setValue("slug", slugify(event.target.value), {
                      shouldValidate: !!getValues("slug"),
                    });
                  }
                }}
              />
              <FieldError errors={[errors.name]} />
            </Field>

            <Field data-invalid={!!errors.slug}>
              <FieldLabel htmlFor="hotel-slug">URL name</FieldLabel>
              <InputGroup>
                <InputGroupAddon className="pl-3 text-muted-foreground">
                  atithi.app/
                </InputGroupAddon>
                <InputGroupInput
                  id="hotel-slug"
                  placeholder="hotel-everest-view"
                  aria-invalid={!!errors.slug}
                  {...slugField}
                  onChange={(event) => {
                    slugTouched.current = true;
                    slugField.onChange(event);
                  }}
                />
              </InputGroup>
              <FieldError errors={[errors.slug]} />
              <FieldDescription>
                Letters, numbers and single dashes. This cannot be changed
                often — staff links depend on it.
              </FieldDescription>
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
              onClick={() => handleOpenChange(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="cursor-pointer"
              disabled={create.isPending}
              data-icon={create.isPending ? "inline-start" : undefined}
            >
              {create.isPending && <Spinner />}
              {create.isPending ? "Creating" : "Create hotel"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
