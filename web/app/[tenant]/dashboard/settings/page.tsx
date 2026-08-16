"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import { z } from "zod"

import { TENANT } from "@/lib/mock-data"
import { PageHeader } from "@/components/shared/page-header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"

const settingsSchema = z.object({
  hotelName: z.string().trim().min(2, "Enter the hotel name").max(255),
  city: z.string().trim().min(2, "Enter the city").max(100),
  ownerName: z.string().trim().min(2, "Enter the owner's name").max(100),
})

type SettingsValues = z.infer<typeof settingsSchema>

export default function SettingsPage() {

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SettingsValues>({
    resolver: zodResolver(settingsSchema),
    defaultValues: {
      hotelName: TENANT.hotelName,
      city: TENANT.city,
      ownerName: TENANT.ownerName,
    },
  })

  const onSubmit = handleSubmit(() => {
    toast.success("Settings saved")
  })

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Settings" description="Your hotel's basic profile." />

      <Card className="max-w-xl">
        <CardContent>
          <form id="settings-form" onSubmit={onSubmit} noValidate>
            <FieldGroup>
              <Field data-invalid={!!errors.hotelName}>
                <FieldLabel htmlFor="hotel-name">Hotel name</FieldLabel>
                <Input
                  id="hotel-name"
                  aria-invalid={!!errors.hotelName}
                  {...register("hotelName")}
                />
                <FieldError errors={[errors.hotelName]} />
              </Field>
              <Field data-invalid={!!errors.city}>
                <FieldLabel htmlFor="city">City</FieldLabel>
                <Input id="city" aria-invalid={!!errors.city} {...register("city")} />
                <FieldError errors={[errors.city]} />
              </Field>
              <Field data-invalid={!!errors.ownerName}>
                <FieldLabel htmlFor="owner-name">Owner name</FieldLabel>
                <Input
                  id="owner-name"
                  aria-invalid={!!errors.ownerName}
                  {...register("ownerName")}
                />
                <FieldError errors={[errors.ownerName]} />
                <FieldDescription>
                  Shown across the dashboard and on guest-facing documents.
                </FieldDescription>
              </Field>
            </FieldGroup>
          </form>
        </CardContent>
        <CardFooter className="justify-end">
          <Button type="submit" form="settings-form">
            Save changes
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
