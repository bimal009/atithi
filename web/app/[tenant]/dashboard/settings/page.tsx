"use client"

import * as React from "react"
import { toast } from "sonner"

import { TENANT } from "@/lib/mock-data"
import { PageHeader } from "@/components/shared/page-header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Field, FieldDescription, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { usePageTitle } from "@/features/tenant/dashboard/page-title-context"

export default function SettingsPage() {
  usePageTitle("Settings")
  const [form, setForm] = React.useState({
    hotelName: TENANT.hotelName,
    city: TENANT.city,
    ownerName: TENANT.ownerName,
  })

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    toast.success("Settings saved")
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Settings" description="Your hotel's basic profile." />

      <Card className="max-w-xl">
        <CardContent>
          <form id="settings-form" onSubmit={handleSubmit}>
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="hotel-name">Hotel name</FieldLabel>
                <Input
                  id="hotel-name"
                  value={form.hotelName}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, hotelName: e.target.value }))
                  }
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="city">City</FieldLabel>
                <Input
                  id="city"
                  value={form.city}
                  onChange={(e) => setForm((f) => ({ ...f, city: e.target.value }))}
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="owner-name">Owner name</FieldLabel>
                <Input
                  id="owner-name"
                  value={form.ownerName}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, ownerName: e.target.value }))
                  }
                />
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
