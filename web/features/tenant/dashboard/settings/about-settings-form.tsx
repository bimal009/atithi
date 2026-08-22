"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Field, FieldDescription, FieldError, FieldGroup } from "@/components/ui/field";
import { Skeleton } from "@/components/ui/skeleton";
import { Spinner } from "@/components/ui/spinner";
import { Textarea } from "@/components/ui/textarea";
import {
  useHotelSettingsQuery,
  useUpdateHotelSettings,
} from "@/features/tenant/hotelSettings/client/useHotelSettings";
import type { HotelSettings } from "@/features/tenant/hotelSettings/types";

import { SettingsRow } from "./settings-row";

const aboutSettingsSchema = z.object({
  aboutUs: z.string().trim().max(5000, "Keep it under 5000 characters").optional().or(z.literal("")),
  amenities: z.string().optional(),
});

type AboutSettingsInput = z.input<typeof aboutSettingsSchema>;
type AboutSettingsValues = z.output<typeof aboutSettingsSchema>;

function AboutForm({ tenant, settings }: { tenant: string; settings: HotelSettings }) {
  const update = useUpdateHotelSettings(tenant);

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
  } = useForm<AboutSettingsInput, unknown, AboutSettingsValues>({
    resolver: zodResolver(aboutSettingsSchema),
    defaultValues: {
      aboutUs: settings.aboutUs ?? "",
      amenities: settings.amenities.join(", "),
    },
  });

  const onSubmit = handleSubmit(async (values) => {
    await update.mutateAsync({
      aboutUs: values.aboutUs || undefined,
      amenities: (values.amenities ?? "")
        .split(",")
        .map((a) => a.trim())
        .filter(Boolean),
    });
  });

  return (
    <Card>
      <CardContent>
        <form id="about-settings-form" onSubmit={onSubmit} noValidate>
          <FieldGroup className="gap-0">
            <SettingsRow
              label="About us"
              description="Shown on your website's About section and used across your listing."
            >
              <Field data-invalid={!!errors.aboutUs}>
                <Textarea
                  id="about-us"
                  rows={5}
                  placeholder="Tell guests what makes a stay here different — the story, the setting, the people."
                  aria-invalid={!!errors.aboutUs}
                  {...register("aboutUs")}
                />
                <FieldError errors={[errors.aboutUs]} />
              </Field>
            </SettingsRow>

            <SettingsRow
              label="Amenities"
              description="Shown as a dedicated Amenities section on your website."
            >
              <Field data-invalid={!!errors.amenities}>
                <Textarea
                  id="about-amenities"
                  rows={3}
                  placeholder="Free WiFi, Swimming pool, Free parking, Airport pickup"
                  aria-invalid={!!errors.amenities}
                  {...register("amenities")}
                />
                <FieldDescription>Comma-separated.</FieldDescription>
                <FieldError errors={[errors.amenities]} />
              </Field>
            </SettingsRow>
          </FieldGroup>
        </form>
      </CardContent>
      <CardFooter className="justify-end border-t">
        <Button
          type="submit"
          form="about-settings-form"
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

function AboutSettingsSkeleton() {
  return (
    <Card>
      <CardContent className="flex flex-col gap-6">
        {Array.from({ length: 2 }).map((_, i) => (
          <div key={i} className="flex items-center gap-8">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-20 max-w-md flex-1" />
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

export function AboutSettingsForm({ tenant }: { tenant: string }) {
  const { data: settings, isPending } = useHotelSettingsQuery(tenant);

  if (isPending || !settings) {
    return <AboutSettingsSkeleton />;
  }

  return <AboutForm tenant={tenant} settings={settings} />;
}
