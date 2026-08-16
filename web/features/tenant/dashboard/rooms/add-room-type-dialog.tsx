"use client"

import * as React from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { PlusIcon } from "lucide-react"
import { useForm } from "react-hook-form"
import { z } from "zod"

import type { RoomTypeConfig } from "@/types"
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
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { generateId } from "@/lib/utils"

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
}

const roomTypeSchema = z.object({
  label: z.string().trim().min(2, "Enter a name").max(100),
  description: z.string().trim().max(500).optional(),
  basePrice: z.coerce.number().min(0, "Enter a valid price"),
  capacity: z.coerce.number().int().min(1, "Capacity must be at least 1"),
  amenities: z.string().trim().optional(),
})

type RoomTypeInput = z.input<typeof roomTypeSchema>
type RoomTypeValues = z.output<typeof roomTypeSchema>

const emptyValues: RoomTypeInput = {
  label: "",
  description: "",
  basePrice: 0,
  capacity: 2,
  amenities: "",
}

export function AddRoomTypeDialog({
  onCreate,
}: {
  onCreate: (roomType: RoomTypeConfig) => void
}) {
  const [open, setOpen] = React.useState(false)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<RoomTypeInput, unknown, RoomTypeValues>({
    resolver: zodResolver(roomTypeSchema),
    defaultValues: emptyValues,
  })

  const onSubmit = handleSubmit((values) => {
    onCreate({
      type: slugify(values.label) || generateId("type-"),
      label: values.label.trim(),
      description: values.description?.trim() ?? "",
      basePrice: values.basePrice,
      capacity: values.capacity,
      amenities: (values.amenities ?? "")
        .split(",")
        .map((a) => a.trim())
        .filter(Boolean),
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
        Add Room Type
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <form onSubmit={onSubmit} noValidate>
          <DialogHeader>
            <DialogTitle>Add a room type</DialogTitle>
            <DialogDescription>
              Rate categories that rooms get added under.
            </DialogDescription>
          </DialogHeader>

          <FieldGroup className="max-h-[60vh] overflow-y-auto scrollbar-none py-4">
            <Field data-invalid={!!errors.label}>
              <FieldLabel htmlFor="type-label">Name</FieldLabel>
              <Input
                id="type-label"
                aria-invalid={!!errors.label}
                {...register("label")}
                placeholder="Honeymoon Suite"
              />
              <FieldError errors={[errors.label]} />
            </Field>

            <Field className="grid grid-cols-2 gap-3">
              <Field data-invalid={!!errors.basePrice}>
                <FieldLabel htmlFor="type-price">Base price / night (Rs)</FieldLabel>
                <Input
                  id="type-price"
                  type="number"
                  min={0}
                  aria-invalid={!!errors.basePrice}
                  {...register("basePrice")}
                  placeholder="4500"
                />
                <FieldError errors={[errors.basePrice]} />
              </Field>
              <Field data-invalid={!!errors.capacity}>
                <FieldLabel htmlFor="type-capacity">Capacity</FieldLabel>
                <Input
                  id="type-capacity"
                  type="number"
                  min={1}
                  aria-invalid={!!errors.capacity}
                  {...register("capacity")}
                />
                <FieldError errors={[errors.capacity]} />
              </Field>
            </Field>

            <Field data-invalid={!!errors.description}>
              <FieldLabel htmlFor="type-description">Description</FieldLabel>
              <Textarea
                id="type-description"
                aria-invalid={!!errors.description}
                {...register("description")}
                placeholder="What makes this room type different."
              />
              <FieldError errors={[errors.description]} />
            </Field>

            <Field data-invalid={!!errors.amenities}>
              <FieldLabel htmlFor="type-amenities">Amenities</FieldLabel>
              <Input
                id="type-amenities"
                aria-invalid={!!errors.amenities}
                {...register("amenities")}
                placeholder="Wi-Fi, AC, Jacuzzi"
              />
              <FieldDescription>Comma-separated.</FieldDescription>
              <FieldError errors={[errors.amenities]} />
            </Field>
          </FieldGroup>

          <DialogFooter>
            <Button type="submit">Add room type</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
