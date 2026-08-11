"use client"

import * as React from "react"
import { PlusIcon } from "lucide-react"

import type { Room, RoomType } from "@/types"
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
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

const ROOM_TYPES: RoomType[] = ["standard", "deluxe", "suite", "family"]

function emptyForm() {
  return { number: "", floor: "1", type: "standard" as RoomType, price: "", capacity: "2" }
}

export function AddRoomDialog({
  onCreate,
}: {
  onCreate: (room: Room) => void
}) {
  const [open, setOpen] = React.useState(false)
  const [form, setForm] = React.useState(emptyForm())

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
    })
    setOpen(false)
    setForm(emptyForm())
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

          <FieldGroup className="py-4">
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
                    setForm((f) => ({ ...f, type: value as RoomType }))
                  }
                >
                  <SelectTrigger id="type" className="w-full capitalize">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {ROOM_TYPES.map((type) => (
                      <SelectItem key={type} value={type} className="capitalize">
                        {type}
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
          </FieldGroup>

          <DialogFooter>
            <Button type="submit">Add room</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
