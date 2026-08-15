"use client"

import * as React from "react"
import { PlusIcon } from "lucide-react"

import type { Room, RoomType, RoomTypeConfig } from "@/types"
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { MultiImageUpload } from "@/features/tenant/dashboard/rooms/multi-image-upload"

function emptyForm(defaultType: RoomType) {
  return {
    number: "",
    floor: "1",
    type: defaultType,
    price: "",
    capacity: "2",
    amenities: "",
    notes: "",
  }
}

export function AddRoomDialog({
  roomTypes,
  onCreate,
}: {
  roomTypes: RoomTypeConfig[]
  onCreate: (room: Room) => void
}) {
  const [open, setOpen] = React.useState(false)
  const [form, setForm] = React.useState(emptyForm(roomTypes[0]?.type ?? ""))
  const [images, setImages] = React.useState<string[]>([])

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    onCreate({
      id: `r${Date.now()}`,
      number: form.number,
      floor: Number(form.floor) || 1,
      type: form.type,
      status: "available",
      price: Number(form.price) || 0,
      capacity: Number(form.capacity) || 1,
      images: images.length ? images : undefined,
    })
    setOpen(false)
    setForm(emptyForm(roomTypes[0]?.type ?? ""))
    setImages([])
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button />}>
        <PlusIcon data-icon="inline-start" />
        Add Room
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Add a room</DialogTitle>
            <DialogDescription>
              New rooms start out as available.
            </DialogDescription>
          </DialogHeader>

          <FieldGroup className="max-h-[60vh] overflow-y-auto scrollbar-none py-4">
            <Field>
              <FieldLabel>Photos</FieldLabel>
              <MultiImageUpload value={images} onChange={setImages} />
              <FieldDescription>
                JPG, PNG, WebP or AVIF, up to 5 MB each.
              </FieldDescription>
            </Field>

            <Field className="grid grid-cols-2 gap-3">
              <Field>
                <FieldLabel htmlFor="room-number">Room number</FieldLabel>
                <Input
                  id="room-number"
                  required
                  value={form.number}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, number: e.target.value }))
                  }
                  placeholder="305"
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="floor">Floor</FieldLabel>
                <Input
                  id="floor"
                  type="number"
                  min={0}
                  value={form.floor}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, floor: e.target.value }))
                  }
                />
              </Field>
            </Field>

            <Field className="grid grid-cols-2 gap-3">
              <Field>
                <FieldLabel htmlFor="type">Room type</FieldLabel>
                <Select
                  value={form.type}
                  onValueChange={(value) =>
                    setForm((f) => ({ ...f, type: (value as RoomType) ?? f.type }))
                  }
                >
                  <SelectTrigger id="type" className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {roomTypes.map((roomType) => (
                      <SelectItem key={roomType.type} value={roomType.type}>
                        {roomType.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
              <Field>
                <FieldLabel htmlFor="capacity">Capacity</FieldLabel>
                <Input
                  id="capacity"
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
              <FieldLabel htmlFor="price">Price per night (Rs)</FieldLabel>
              <Input
                id="price"
                type="number"
                min={0}
                required
                value={form.price}
                onChange={(e) =>
                  setForm((f) => ({ ...f, price: e.target.value }))
                }
                placeholder="2200"
              />
            </Field>

            <Field>
              <FieldLabel htmlFor="amenities">Amenities</FieldLabel>
              <Input
                id="amenities"
                value={form.amenities}
                onChange={(e) =>
                  setForm((f) => ({ ...f, amenities: e.target.value }))
                }
                placeholder="Wi-Fi, AC, mountain view"
              />
              <FieldDescription>Comma-separated, shown to front desk.</FieldDescription>
            </Field>

            <Field>
              <FieldLabel htmlFor="room-notes">Notes (optional)</FieldLabel>
              <Textarea
                id="room-notes"
                value={form.notes}
                onChange={(e) =>
                  setForm((f) => ({ ...f, notes: e.target.value }))
                }
                placeholder="Anything housekeeping or front desk should know."
              />
            </Field>
          </FieldGroup>

          <DialogFooter>
            <Button type="submit">Add room</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
