"use client"

import * as React from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { PlusIcon } from "lucide-react"
import { useForm } from "react-hook-form"
import { z } from "zod"

import type { AddOn } from "@/types"
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
import { generateId } from "@/lib/utils"

const addOnSchema = z.object({
  name: z.string().trim().min(2, "Enter an add-on name").max(100),
  price: z.coerce.number().min(0, "Enter a valid price"),
})

type AddOnInput = z.input<typeof addOnSchema>
type AddOnValues = z.output<typeof addOnSchema>

const emptyValues: AddOnInput = { name: "", price: 0 }

export function AddAddOnSheet({
  onCreate,
}: {
  onCreate: (addOn: AddOn) => void
}) {
  const [open, setOpen] = React.useState(false)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<AddOnInput, unknown, AddOnValues>({
    resolver: zodResolver(addOnSchema),
    defaultValues: emptyValues,
  })

  const onSubmit = handleSubmit((values) => {
    onCreate({
      id: generateId("ad"),
      name: values.name.trim(),
      price: values.price,
      available: true,
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
        Add Add-on
      </DialogTrigger>
      <DialogContent className="sm:max-w-sm">
        <form onSubmit={onSubmit} noValidate>
          <DialogHeader>
            <DialogTitle>Add an add-on</DialogTitle>
            <DialogDescription>
              Extras guests can attach to a dish when ordering, like extra
              cheese or extra spicy.
            </DialogDescription>
          </DialogHeader>
          <FieldGroup className="py-4">
            <Field data-invalid={!!errors.name}>
              <FieldLabel htmlFor="addon-name">Add-on name</FieldLabel>
              <Input
                id="addon-name"
                aria-invalid={!!errors.name}
                {...register("name")}
                placeholder="Extra Cheese"
              />
              <FieldError errors={[errors.name]} />
            </Field>
            <Field data-invalid={!!errors.price}>
              <FieldLabel htmlFor="addon-price">Price (Rs)</FieldLabel>
              <Input
                id="addon-price"
                type="number"
                min={0}
                aria-invalid={!!errors.price}
                {...register("price")}
                placeholder="60"
              />
              <FieldError errors={[errors.price]} />
            </Field>
          </FieldGroup>
          <DialogFooter>
            <Button type="submit">Add add-on</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
