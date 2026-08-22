"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Field, FieldDescription, FieldError, FieldGroup } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Spinner } from "@/components/ui/spinner";
import {
  useHotelSettingsQuery,
  useUpdateHotelSettings,
} from "@/features/tenant/hotelSettings/client/useHotelSettings";
import type { HotelSettings } from "@/features/tenant/hotelSettings/types";

import { SettingsRow } from "./settings-row";

const locationSettingsSchema = z.object({
  mapUrl: z.string().trim().url("Paste a valid Google Maps link").optional().or(z.literal("")),
  whatsappNumber: z.string().trim().optional().or(z.literal("")),
});

type LocationSettingsInput = z.input<typeof locationSettingsSchema>;
type LocationSettingsValues = z.output<typeof locationSettingsSchema>;

function LocationForm({ tenant, settings }: { tenant: string; settings: HotelSettings }) {
  const update = useUpdateHotelSettings(tenant);

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
  } = useForm<LocationSettingsInput, unknown, LocationSettingsValues>({
    resolver: zodResolver(locationSettingsSchema),
    defaultValues: { mapUrl: settings.mapUrl ?? "", whatsappNumber: settings.whatsappNumber ?? "" },
  });

  const onSubmit = handleSubmit(async (values) => {
    await update.mutateAsync({
      mapUrl: values.mapUrl || undefined,
      whatsappNumber: values.whatsappNumber || undefined,
    });
  });

  return (
    <Card>
      <CardContent>
        <form id="location-settings-form" onSubmit={onSubmit} noValidate>
          <FieldGroup className="gap-0">
            <SettingsRow
              label="Google Maps link"
              description="Paste a Google Maps link for your exact location. used to show a map and directions on your website's Contact page."
            >
              <Field data-invalid={!!errors.mapUrl}>
                <Input
                  id="location-map-url"
                  placeholder="https://maps.google.com/?q=27.7172,85.3240"
                  aria-invalid={!!errors.mapUrl}
                  {...register("mapUrl")}
                />
                <FieldDescription>
                  Share a location in Google Maps, copy the link, and paste it here.
                </FieldDescription>
                <FieldError errors={[errors.mapUrl]} />
              </Field>
            </SettingsRow>

            <SettingsRow
              label="WhatsApp number"
              description="Used for the WhatsApp button and booking messages on your website. Leave blank to hide WhatsApp entirely — your hotel's regular phone number is never used as a fallback."
            >
              <Field data-invalid={!!errors.whatsappNumber}>
                <Input
                  id="location-whatsapp-number"
                  placeholder="98XXXXXXXX"
                  aria-invalid={!!errors.whatsappNumber}
                  {...register("whatsappNumber")}
                />
                <FieldError errors={[errors.whatsappNumber]} />
              </Field>
            </SettingsRow>
          </FieldGroup>
        </form>
      </CardContent>
      <CardFooter className="justify-end border-t">
        <Button
          type="submit"
          form="location-settings-form"
          disabled={update.isPending || !isDirty}
          data-icon={update.isPending ? "inline-start" : undefined}
        >
          {update.isPending && <Spinner />}
          {update.isPending ? "Saving" : "Save changes"}
        </Button>
      </CardFooter>
    </Card>
  );
}

function LocationSettingsSkeleton() {
  return (
    <Card>
      <CardContent className="flex flex-col gap-6">
        {Array.from({ length: 2 }).map((_, i) => (
          <div key={i} className="flex items-center gap-8">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-9 max-w-md flex-1" />
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

export function LocationSettingsForm({ tenant }: { tenant: string }) {
  const { data: settings, isPending } = useHotelSettingsQuery(tenant);

  if (isPending || !settings) {
    return <LocationSettingsSkeleton />;
  }

  return <LocationForm tenant={tenant} settings={settings} />;
}
