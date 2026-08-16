"use client"

import * as React from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { PlusIcon } from "lucide-react"
import { useForm } from "react-hook-form"
import { z } from "zod"

import type { Guest } from "@/lib/mock-data"
import { generateId } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"

const customerSchema = z.object({
  name: z.string().trim().min(2, "Enter the guest's name").max(100),
  phone: z
    .string()
    .trim()
    .regex(/^[\d-]{7,20}$/, "Enter a valid phone number"),
  email: z.union([z.email("Enter a valid email"), z.literal("")]).optional(),
  notes: z.string().trim().max(500).optional(),
})

type CustomerValues = z.infer<typeof customerSchema>

const emptyValues: CustomerValues = { name: "", phone: "", email: "", notes: "" }

export function AddCustomerDialog({
  onCreate,
}: {
  onCreate: (guest: Guest) => void
}) {
  const [open, setOpen] = React.useState(false)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CustomerValues>({
    resolver: zodResolver(customerSchema),
    defaultValues: emptyValues,
  })

  const onSubmit = handleSubmit((values) => {
    onCreate({
      id: generateId("gu"),
      name: values.name.trim(),
      phone: values.phone.trim(),
      email: values.email || undefined,
      notes: values.notes || undefined,
      visits: 0,
      lastStay: new Date().toISOString(),
      totalSpend: 0,
    })
    setOpen(false)
    reset(emptyValues)
  })

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next)
        if (!next) reset(emptyValues)
      }}
    >
      <DialogTrigger render={<Button />}>
        <PlusIcon data-icon="inline-start" />
        Add Customer
      </DialogTrigger>
      <DialogContent className="sm:max-w-sm">
        <form onSubmit={onSubmit} noValidate>
          <DialogHeader>
            <DialogTitle>Add a customer</DialogTitle>
            <DialogDescription>
              Keep a record even before their first booking.
            </DialogDescription>
          </DialogHeader>

          <FieldGroup className="max-h-[60vh] gap-5 overflow-y-auto scrollbar-none py-4">
            <Field data-invalid={!!errors.name}>
              <FieldLabel htmlFor="customer-name">Full name</FieldLabel>
              <Input
                id="customer-name"
                aria-invalid={!!errors.name}
                {...register("name")}
                placeholder="Sujata Shrestha"
              />
              <FieldError errors={[errors.name]} />
            </Field>

            <Field data-invalid={!!errors.phone}>
              <FieldLabel htmlFor="customer-phone">Phone</FieldLabel>
              <Input
                id="customer-phone"
                aria-invalid={!!errors.phone}
                {...register("phone")}
                placeholder="98X-XXXXXXX"
              />
              <FieldError errors={[errors.phone]} />
            </Field>

            <Field data-invalid={!!errors.email}>
              <FieldLabel htmlFor="customer-email">
                Email <span className="text-muted-foreground">(optional)</span>
              </FieldLabel>
              <Input
                id="customer-email"
                type="email"
                aria-invalid={!!errors.email}
                {...register("email")}
                placeholder="guest@example.com"
              />
              <FieldError errors={[errors.email]} />
            </Field>

            <Field data-invalid={!!errors.notes}>
              <FieldLabel htmlFor="customer-notes">
                Notes <span className="text-muted-foreground">(optional)</span>
              </FieldLabel>
              <Textarea
                id="customer-notes"
                aria-invalid={!!errors.notes}
                {...register("notes")}
                placeholder="Preferences, allergies, anything worth remembering."
              />
              <FieldError errors={[errors.notes]} />
            </Field>
          </FieldGroup>

          <DialogFooter>
            <Button type="submit">Add customer</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
