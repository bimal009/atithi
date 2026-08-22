"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { CheckIcon, XIcon } from "lucide-react";

import { NepalFlag } from "@/components/shared/nepal-flag";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Field, FieldDescription, FieldError, FieldGroup } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import { Skeleton } from "@/components/ui/skeleton";
import { Spinner } from "@/components/ui/spinner";
import { Textarea } from "@/components/ui/textarea";
import { NEPAL_DIAL_CODE, normalizePhoneNumber } from "@/features/auth/schema";
import {
  useHotelBySlugQuery,
  useSlugAvailability,
  useUpdateHotel,
} from "@/features/hotel/client/useHotels";
import { CreateHotelValues, createHotelSchema } from "@/features/hotel/schema";
import type { Hotel } from "@/features/hotel/types";
import { HotelLogoUpload } from "@/features/tenant/hotelImages/components/hotel-logo-upload";
import { useDebouncedValue } from "@/hooks/use-debounced-value";

import { SettingsRow } from "./settings-row";

const HOTEL_DOMAIN_SUFFIX = ".hiatithi.com";

function valuesOf(hotel: Hotel): CreateHotelValues {
  return {
    name: hotel.name,
    slug: hotel.slug,
    address: hotel.address,
    phoneNumber: hotel.phoneNumber,
    city: hotel.city ?? "",
    email: hotel.email ?? "",
    description: hotel.description ?? "",
  };
}

function HotelForm({ hotel }: { hotel: Hotel }) {
  const update = useUpdateHotel();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isDirty },
  } = useForm<CreateHotelValues>({
    resolver: zodResolver(createHotelSchema),
    defaultValues: valuesOf(hotel),
  });

  const slugField = register("slug");
  const phoneField = register("phoneNumber");
  const slug = watch("slug") || "";

  const debouncedSlug = useDebouncedValue(slug, 400);
  const slugAvailability = useSlugAvailability(debouncedSlug, { ignore: hotel.slug });
  const slugSettling = slug.trim() !== debouncedSlug.trim();
  const slugChecking = slugSettling || slugAvailability.checking;
  const slugTaken = slugAvailability.available === false;

  const onSubmit = handleSubmit(async (values) => {
    if (slugTaken || slugChecking) return;

    await update.mutateAsync({
      id: hotel.id,
      input: {
        name: values.name,
        slug: values.slug,
        address: values.address,
        phoneNumber: values.phoneNumber,
        city: values.city || undefined,
        email: values.email || undefined,
        description: values.description || undefined,
      },
    });
  });

  return (
    <Card>
      <CardContent>
        <form id="hotel-settings-form" onSubmit={onSubmit} noValidate>
          <FieldGroup className="gap-0">
            <SettingsRow
              label="Hotel logo"
              description="Shown on guest-facing pages and documents."
            >
              <HotelLogoUpload tenant={hotel.slug} disabled={update.isPending} className="items-start" />
            </SettingsRow>

            <SettingsRow label="Hotel name" description="Shown across the dashboard.">
              <Field data-invalid={!!errors.name}>
                <Input
                  id="hotel-settings-name"
                  placeholder="Hotel Everest View"
                  aria-invalid={!!errors.name}
                  {...register("name")}
                />
                <FieldError errors={[errors.name]} />
              </Field>
            </SettingsRow>

            <SettingsRow
              label="URL name"
              description="Letters, numbers and single dashes. Staff links depend on it."
            >
              <Field data-invalid={!!errors.slug || slugTaken}>
                <InputGroup>
                  <InputGroupInput
                    id="hotel-settings-slug"
                    placeholder="hotel-everest-view"
                    aria-invalid={!!errors.slug || slugTaken}
                    {...slugField}
                  />
                  <InputGroupAddon align="inline-end" className="pr-3 text-muted-foreground">
                    {slugChecking ? (
                      <Spinner className="size-3.5" />
                    ) : slugAvailability.available === true ? (
                      <CheckIcon
                        className="size-3.5 text-emerald-600 dark:text-emerald-500"
                        aria-hidden="true"
                      />
                    ) : slugTaken ? (
                      <XIcon className="size-3.5 text-destructive" aria-hidden="true" />
                    ) : null}
                    {HOTEL_DOMAIN_SUFFIX}
                  </InputGroupAddon>
                </InputGroup>
                <FieldError errors={[errors.slug]} />
                {slugTaken && (
                  <FieldDescription className="text-destructive">
                    That URL is already taken — try another one.
                  </FieldDescription>
                )}
              </Field>
            </SettingsRow>

            <SettingsRow label="Address" description="Your property's street address.">
              <Field data-invalid={!!errors.address}>
                <Input
                  id="hotel-settings-address"
                  placeholder="Lakeside Road, Ward 6"
                  aria-invalid={!!errors.address}
                  {...register("address")}
                />
                <FieldError errors={[errors.address]} />
              </Field>
            </SettingsRow>

            <SettingsRow label="City">
              <Field data-invalid={!!errors.city}>
                <Input
                  id="hotel-settings-city"
                  placeholder="Pokhara"
                  aria-invalid={!!errors.city}
                  {...register("city")}
                />
                <FieldError errors={[errors.city]} />
              </Field>
            </SettingsRow>

            <SettingsRow label="Phone">
              <Field data-invalid={!!errors.phoneNumber}>
                <InputGroup>
                  <InputGroupAddon className="mr-1 border-r border-input py-2 pr-2.5 pl-3">
                    <span className="flex items-center gap-1.5">
                      <NepalFlag className="h-4 w-auto" />
                      <span className="font-medium text-foreground">{NEPAL_DIAL_CODE}</span>
                    </span>
                  </InputGroupAddon>
                  <InputGroupInput
                    id="hotel-settings-phone"
                    type="tel"
                    inputMode="numeric"
                    maxLength={10}
                    placeholder="98XXXXXXXX"
                    aria-invalid={!!errors.phoneNumber}
                    {...phoneField}
                    onChange={(event) => {
                      event.target.value = normalizePhoneNumber(event.target.value);
                      phoneField.onChange(event);
                    }}
                  />
                </InputGroup>
                <FieldError errors={[errors.phoneNumber]} />
              </Field>
            </SettingsRow>

            <SettingsRow label="Email" description="Optional — shown to guests.">
              <Field data-invalid={!!errors.email}>
                <Input
                  id="hotel-settings-email"
                  type="email"
                  placeholder="stay@hotel.com.np"
                  aria-invalid={!!errors.email}
                  {...register("email")}
                />
                <FieldError errors={[errors.email]} />
              </Field>
            </SettingsRow>

            <SettingsRow label="Description" description="Optional — a short property summary.">
              <Field data-invalid={!!errors.description}>
                <Textarea
                  id="hotel-settings-description"
                  rows={3}
                  placeholder="A 24-room property overlooking Phewa Lake."
                  aria-invalid={!!errors.description}
                  {...register("description")}
                />
                <FieldError errors={[errors.description]} />
              </Field>
            </SettingsRow>
          </FieldGroup>
        </form>
      </CardContent>
      <CardFooter className="justify-end border-t">
        <Button
          type="submit"
          form="hotel-settings-form"
          disabled={update.isPending || slugTaken || slugChecking || !isDirty}
          data-icon={update.isPending ? "inline-start" : undefined}
        >
          {update.isPending && <Spinner />}
          {update.isPending ? "Saving" : "Save changes"}
        </Button>
      </CardFooter>
    </Card>
  );
}

function HotelSettingsSkeleton() {
  return (
    <Card>
      <CardContent className="flex flex-col gap-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="flex items-center gap-8">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-9 max-w-md flex-1" />
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

export function HotelSettingsForm({ tenant }: { tenant: string }) {
  const { data: hotel, isPending } = useHotelBySlugQuery(tenant);

  if (isPending || !hotel) {
    return <HotelSettingsSkeleton />;
  }

  return <HotelForm hotel={hotel} />;
}
