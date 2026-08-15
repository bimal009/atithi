"use client"

import * as React from "react"
import { PlusIcon } from "lucide-react"

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
import { Field, FieldDescription, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
}

function emptyForm() {
  return {
    label: "",
    description: "",
    basePrice: "",
    capacity: "2",
    amenities: "",
  }
}

export function AddRoomTypeDialog({
  onCreate,
}: {
  onCreate: (roomType: RoomTypeConfig) => void
}) {
  const [open, setOpen] = React.useState(false)
  const [form, setForm] = React.useState(emptyForm())

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.label.trim()) return

    onCreate({
      type: slugify(form.label) || `type-${Date.now()}`,
      label: form.label.trim(),
      description: form.description.trim(),
      basePrice: Number(form.basePrice) || 0,
      capacity: Number(form.capacity) || 1,
      amenities: form.amenities
        .split(",")
        .map((a) => a.trim())
        .filter(Boolean),
    })
    setOpen(false)
    setForm(emptyForm())
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button />}>
        <PlusIcon data-icon="inline-start" />
        Add Room Type
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Add a room type</DialogTitle>
            <DialogDescription>
              Rate categories that rooms get added under.
            </DialogDescription>
          </DialogHeader>

          <FieldGroup className="max-h-[60vh] overflow-y-auto scrollbar-none py-4">
            <Field>
              <FieldLabel htmlFor="type-label">Name</FieldLabel>
              <Input
                id="type-label"
                required
                value={form.label}
                onChange={(e) => setForm((f) => ({ ...f, label: e.target.value }))}
                placeholder="Honeymoon Suite"
              />
            </Field>

            <Field className="grid grid-cols-2 gap-3">
              <Field>
                <FieldLabel htmlFor="type-price">Base price / night (Rs)</FieldLabel>
                <Input
                  id="type-price"
                  type="number"
                  min={0}
                  required
                  value={form.basePrice}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, basePrice: e.target.value }))
                  }
                  placeholder="4500"
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="type-capacity">Capacity</FieldLabel>
                <Input
                  id="type-capacity"
                  type="number"
                  min={1}
                  value={form.capacity}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, capacity: e.target.value }))
                  }
                />
              </Field>
            </Field>

            <Field>
              <FieldLabel htmlFor="type-description">Description</FieldLabel>
              <Textarea
                id="type-description"
                value={form.description}
                onChange={(e) =>
                  setForm((f) => ({ ...f, description: e.target.value }))
                }
                placeholder="What makes this room type different."
              />
            </Field>

            <Field>
              <FieldLabel htmlFor="type-amenities">Amenities</FieldLabel>
              <Input
                id="type-amenities"
                value={form.amenities}
                onChange={(e) =>
                  setForm((f) => ({ ...f, amenities: e.target.value }))
                }
                placeholder="Wi-Fi, AC, Jacuzzi"
              />
              <FieldDescription>Comma-separated.</FieldDescription>
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
