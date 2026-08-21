"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Field, FieldError, FieldGroup } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Spinner } from "@/components/ui/spinner";
import {
  useHotelSettingsQuery,
  useUpdateHotelSettings,
} from "@/features/tenant/hotelSettings/client/useHotelSettings";
import type { HotelSettings } from "@/features/tenant/hotelSettings/types";

import { SettingsRow } from "./settings-row";

const CURRENCIES = [
  { value: "NPR", label: "NPR — Nepali Rupee" },
  { value: "USD", label: "USD — US Dollar" },
  { value: "INR", label: "INR — Indian Rupee" },
  { value: "EUR", label: "EUR — Euro" },
  { value: "GBP", label: "GBP — British Pound" },
];
const CURRENCY_ITEMS = Object.fromEntries(CURRENCIES.map((c) => [c.value, c.label]));

const billingSettingsSchema = z.object({
  currency: z.string().length(3),
  taxPercent: z.coerce.number().min(0, "Cannot be negative").max(100, "Cannot exceed 100"),
  serviceChargePercent: z.coerce
    .number()
    .min(0, "Cannot be negative")
    .max(100, "Cannot exceed 100"),
});

type BillingSettingsInput = z.input<typeof billingSettingsSchema>;
type BillingSettingsValues = z.output<typeof billingSettingsSchema>;

function BillingForm({ tenant, settings }: { tenant: string; settings: HotelSettings }) {
  const update = useUpdateHotelSettings(tenant);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isDirty },
  } = useForm<BillingSettingsInput, unknown, BillingSettingsValues>({
    resolver: zodResolver(billingSettingsSchema),
    defaultValues: {
      currency: settings.currency,
      taxPercent: settings.taxPercent,
      serviceChargePercent: settings.serviceChargePercent,
    },
  });

  const currency = watch("currency");

  const onSubmit = handleSubmit(async (values) => {
    await update.mutateAsync(values);
  });

  return (
    <Card>
      <CardContent>
        <form id="billing-settings-form" onSubmit={onSubmit} noValidate>
          <FieldGroup className="gap-0">
            <SettingsRow
              label="Currency"
              description="Used for prices and totals across the dashboard."
            >
              <Field data-invalid={!!errors.currency}>
                <Select
                  items={CURRENCY_ITEMS}
                  value={currency}
                  onValueChange={(value) =>
                    setValue("currency", value ?? "NPR", { shouldDirty: true })
                  }
                >
                  <SelectTrigger id="billing-currency" className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CURRENCIES.map((c) => (
                      <SelectItem key={c.value} value={c.value}>
                        {c.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FieldError errors={[errors.currency]} />
              </Field>
            </SettingsRow>

            <SettingsRow label="Tax / VAT" description="Applied to order and billing totals.">
              <Field data-invalid={!!errors.taxPercent}>
                <Input
                  id="billing-tax-percent"
                  type="number"
                  min={0}
                  max={100}
                  step="0.01"
                  aria-invalid={!!errors.taxPercent}
                  {...register("taxPercent")}
                />
                <FieldError errors={[errors.taxPercent]} />
              </Field>
            </SettingsRow>

            <SettingsRow
              label="Service charge"
              description="Optional — added on top of tax for dine-in orders."
            >
              <Field data-invalid={!!errors.serviceChargePercent}>
                <Input
                  id="billing-service-charge-percent"
                  type="number"
                  min={0}
                  max={100}
                  step="0.01"
                  aria-invalid={!!errors.serviceChargePercent}
                  {...register("serviceChargePercent")}
                />
                <FieldError errors={[errors.serviceChargePercent]} />
              </Field>
            </SettingsRow>
          </FieldGroup>
        </form>
      </CardContent>
      <CardFooter className="justify-end border-t">
        <Button
          type="submit"
          form="billing-settings-form"
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

function BillingSettingsSkeleton() {
  return (
    <Card>
      <CardContent className="flex flex-col gap-6">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="flex items-center gap-8">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-9 max-w-md flex-1" />
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

export function BillingSettingsForm({ tenant }: { tenant: string }) {
  const { data: settings, isPending } = useHotelSettingsQuery(tenant);

  if (isPending || !settings) {
    return <BillingSettingsSkeleton />;
  }

  return <BillingForm tenant={tenant} settings={settings} />;
}
