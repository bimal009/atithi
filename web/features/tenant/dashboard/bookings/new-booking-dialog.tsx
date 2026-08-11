"use client"

import * as React from "react"
import { CalendarIcon, PlusIcon } from "lucide-react"
import type { DateRange } from "react-day-picker"

import type { Booking, Room } from "@/types"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
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
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { formatDate } from "@/lib/utils"

function emptyForm() {
  return {
    guestName: "",
    guestPhone: "",
    roomId: "",
    guests: "1",
    notes: "",
  }
}

export function NewBookingDialog({
  rooms,
  onCreate,
}: {
  rooms: Room[]
  onCreate: (booking: Booking) => void
}) {
  const [open, setOpen] = React.useState(false)
  const [form, setForm] = React.useState(emptyForm())
  const [range, setRange] = React.useState<DateRange | undefined>()

  const availableRooms = rooms.filter((room) => room.status === "available")

  function reset() {
    setForm(emptyForm())
    setRange(undefined)
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const room = rooms.find((r) => r.id === form.roomId)
    if (!room || !range?.from || !range?.to) return

    const nights = Math.max(
      1,
      Math.round((+range.to - +range.from) / 86_400_000)
    )

    onCreate({
      id: `bk${Date.now()}`,
      guestName: form.guestName,
      guestPhone: form.guestPhone,
      roomId: room.id,
      roomNumber: room.number,
      checkIn: range.from.toISOString(),
      checkOut: range.to.toISOString(),
      status: "confirmed",
      guests: Number(form.guests) || 1,
      totalAmount: room.price * nights,
      createdAt: new Date().toISOString(),
      notes: form.notes || undefined,
    })

    setOpen(false)
    reset()
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next)
        if (!next) reset()
      }}
    >
      <DialogTrigger render={<Button />}>
        <PlusIcon data-icon="inline-start" />
        New Booking
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>New booking</DialogTitle>
            <DialogDescription>
              Reserve a room for a guest. They&apos;ll show up in the bookings
              list right away.
            </DialogDescription>
          </DialogHeader>

          <FieldGroup className="py-4">
            <Field className="grid grid-cols-2 gap-3">
              <Field>
                <FieldLabel htmlFor="guest-name">Guest name</FieldLabel>
                <Input
                  id="guest-name"
                  required
                  value={form.guestName}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, guestName: e.target.value }))
                  }
                  placeholder="Sujata Shrestha"
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="guest-phone">Phone</FieldLabel>
                <Input
                  id="guest-phone"
                  required
                  value={form.guestPhone}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, guestPhone: e.target.value }))
                  }
                  placeholder="98X-XXXXXXX"
                />
              </Field>
            </Field>

            <Field className="grid grid-cols-2 gap-3">
              <Field>
                <FieldLabel htmlFor="room">Room</FieldLabel>
                <Select
                  value={form.roomId}
                  onValueChange={(value) =>
                    setForm((f) => ({ ...f, roomId: String(value) }))
                  }
                >
                  <SelectTrigger id="room" className="w-full">
                    <SelectValue placeholder="Select a room" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableRooms.map((room) => (
                      <SelectItem key={room.id} value={room.id}>
                        {room.number} · {room.type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
              <Field>
                <FieldLabel htmlFor="guests">Guests</FieldLabel>
                <Input
                  id="guests"
                  type="number"
                  min={1}
                  value={form.guests}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, guests: e.target.value }))
                  }
                />
              </Field>
            </Field>

            <Field>
              <FieldLabel htmlFor="dates">Check-in — Check-out</FieldLabel>
              <Popover>
                <PopoverTrigger
                  render={
                    <Button
                      id="dates"
                      type="button"
                      variant="outline"
                      className="w-full justify-start font-normal"
                    />
                  }
                >
                  <CalendarIcon data-icon="inline-start" />
                  {range?.from && range?.to
                    ? `${formatDate(range.from.toISOString())} – ${formatDate(range.to.toISOString())}`
                    : "Select dates"}
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="range"
                    selected={range}
                    onSelect={setRange}
                    disabled={{ before: new Date() }}
                  />
                </PopoverContent>
              </Popover>
            </Field>

            <Field>
              <FieldLabel htmlFor="notes">Notes (optional)</FieldLabel>
              <Textarea
                id="notes"
                value={form.notes}
                onChange={(e) =>
                  setForm((f) => ({ ...f, notes: e.target.value }))
                }
                placeholder="Airport pickup, late arrival, etc."
              />
            </Field>
          </FieldGroup>

          <DialogFooter>
            <Button type="submit">Create booking</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
