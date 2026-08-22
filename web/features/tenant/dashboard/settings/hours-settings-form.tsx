"use client";

import * as React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Field, FieldError, FieldGroup } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Spinner } from "@/components/ui/spinner";
import { cn } from "@/lib/utils";
import {
  useHotelSettingsQuery,
  useUpdateHotelSettings,
} from "@/features/tenant/hotelSettings/client/useHotelSettings";
import type { HotelSettings } from "@/features/tenant/hotelSettings/types";

import { SettingsRow } from "./settings-row";

const WEEKDAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"] as const;

const hoursSettingsSchema = z.object({
  openingTime: z.string().optional().or(z.literal("")),
  closingTime: z.string().optional().or(z.literal("")),
});

type HoursSettingsValues = z.infer<typeof hoursSettingsSchema>;

function HoursForm({ tenant, settings }: { tenant: string; settings: HotelSettings }) {
  const update = useUpdateHotelSettings(tenant);
  const [openDays, setOpenDays] = React.useState<string[]>(settings.openDays);

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
  } = useForm<HoursSettingsValues>({
    resolver: zodResolver(hoursSettingsSchema),
    defaultValues: {
      openingTime: settings.openingTime ?? "",
      closingTime: settings.closingTime ?? "",
    },
  });

  const daysDirty = JSON.stringify([...openDays].sort()) !== JSON.stringify([...settings.openDays].sort());

  function toggleDay(day: string) {
    setOpenDays((prev) => (prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]));
  }

  const onSubmit = handleSubmit(async (values) => {
    await update.mutateAsync({
      openingTime: values.openingTime || undefined,
      closingTime: values.closingTime || undefined,
      openDays,
    });
  });

  return (
    <Card>
      <CardContent>
        <form id="hours-settings-form" onSubmit={onSubmit} noValidate>
          <FieldGroup className="gap-0">
            <SettingsRow
              label="Opening hours"
              description="Used to build the available reservation times on your website."
            >
              <div className="flex items-center gap-3">
                <Field data-invalid={!!errors.openingTime}>
                  <Input id="opening-time" type="time" aria-invalid={!!errors.openingTime} {...register("openingTime")} />
                  <FieldError errors={[errors.openingTime]} />
                </Field>
                <span className="text-sm text-muted-foreground">to</span>
                <Field data-invalid={!!errors.closingTime}>
                  <Input id="closing-time" type="time" aria-invalid={!!errors.closingTime} {...register("closingTime")} />
                  <FieldError errors={[errors.closingTime]} />
                </Field>
              </div>
            </SettingsRow>

            <SettingsRow label="Open days" description="Days guests can book a table.">
              <div className="flex flex-wrap gap-1.5">
                {WEEKDAYS.map((day) => (
                  <button
                    key={day}
                    type="button"
                    onClick={() => toggleDay(day)}
                    className={cn(
                      "cursor-pointer rounded-md border px-2.5 py-1.5 text-xs font-medium transition-colors",
                      openDays.includes(day)
                        ? "border-foreground bg-muted"
                        : "border-border hover:bg-muted/60",
                    )}
                  >
                    {day.slice(0, 3)}
                  </button>
                ))}
              </div>
            </SettingsRow>
          </FieldGroup>
        </form>
      </CardContent>
      <CardFooter className="justify-end border-t">
        <Button
          type="submit"
          form="hours-settings-form"
          disabled={update.isPending || (!isDirty && !daysDirty)}
          data-icon={update.isPending ? "inline-start" : undefined}
        >
          {update.isPending && <Spinner />}
          {update.isPending ? "Saving" : "Save changes"}
        </Button>
      </CardFooter>
    </Card>
  );
}

function HoursSettingsSkeleton() {
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

export function HoursSettingsForm({ tenant }: { tenant: string }) {
  const { data: settings, isPending } = useHotelSettingsQuery(tenant);

  if (isPending || !settings) {
    return <HoursSettingsSkeleton />;
  }

  return <HoursForm tenant={tenant} settings={settings} />;
}
