"use client"

import * as React from "react"
import { CalendarIcon, PlusIcon } from "lucide-react"

import { BOOKING_CHANNELS } from "@/lib/mock-data"
import type { Booking, BookingChannel, Room } from "@/types"
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
    channel: "whatsapp" as BookingChannel,
    guests: "1",
    notes: "",
  }
}

function combineDateAndTime(date: Date, time: string): Date {
  const [hours, minutes] = time.split(":").map(Number)
  const combined = new Date(date)
  combined.setHours(hours || 0, minutes || 0, 0, 0)
  return combined
}

function DateTimeField({
  label,
  htmlId,
  date,
  onDateChange,
  time,
  onTimeChange,
  disabledBefore,
}: {
  label: string
  htmlId: string
  date: Date | undefined
  onDateChange: (date: Date | undefined) => void
  time: string
  onTimeChange: (time: string) => void
  disabledBefore?: Date
}) {
  return (
    <Field>
      <FieldLabel htmlFor={htmlId}>{label}</FieldLabel>
      <div className="grid grid-cols-[1fr_auto] gap-2">
        <Popover>
          <PopoverTrigger
            render={
              <Button
                id={htmlId}
                type="button"
                variant="outline"
                className="w-full justify-start font-normal"
              />
            }
          >
            <CalendarIcon data-icon="inline-start" />
            {date ? formatDate(date.toISOString()) : "Select date"}
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0">
            <Calendar
              mode="single"
              selected={date}
              onSelect={onDateChange}
              disabled={disabledBefore ? { before: disabledBefore } : undefined}
            />
          </PopoverContent>
        </Popover>
        <Input
          type="time"
          className="w-28"
          value={time}
          onChange={(e) => onTimeChange(e.target.value)}
        />
      </div>
    </Field>
  )
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
  const [checkInDate, setCheckInDate] = React.useState<Date | undefined>()
  const [checkInTime, setCheckInTime] = React.useState("13:00")
  const [checkOutDate, setCheckOutDate] = React.useState<Date | undefined>()
  const [checkOutTime, setCheckOutTime] = React.useState("11:00")

  const availableRooms = rooms.filter((room) => room.status === "available")

  function reset() {
    setForm(emptyForm())
    setCheckInDate(undefined)
    setCheckInTime("13:00")
    setCheckOutDate(undefined)
    setCheckOutTime("11:00")
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const room = rooms.find((r) => r.id === form.roomId)
    if (!room || !checkInDate || !checkOutDate) return

    const checkIn = combineDateAndTime(checkInDate, checkInTime)
    const checkOut = combineDateAndTime(checkOutDate, checkOutTime)
    if (checkOut <= checkIn) return

    const nights = Math.max(
      1,
      Math.round((+checkOut - +checkIn) / 86_400_000)
    )

    onCreate({
      id: `bk${Date.now()}`,
      guestName: form.guestName,
      guestPhone: form.guestPhone,
      roomId: room.id,
      roomNumber: room.number,
      channel: form.channel,
      checkIn: checkIn.toISOString(),
      checkOut: checkOut.toISOString(),
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

          <FieldGroup className="max-h-[60vh] overflow-y-auto scrollbar-none py-4">
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

            <Field>
              <FieldLabel htmlFor="channel">Booking channel</FieldLabel>
              <Select
                value={form.channel}
                onValueChange={(value) =>
                  setForm((f) => ({
                    ...f,
                    channel: (value as BookingChannel) ?? f.channel,
                  }))
                }
              >
                <SelectTrigger id="channel" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {BOOKING_CHANNELS.map((channel) => (
                    <SelectItem key={channel.value} value={channel.value}>
                      {channel.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>

            <Field className="grid grid-cols-2 gap-3">
              <Field>
                <FieldLabel htmlFor="room">Room</FieldLabel>
                <Select
                  value={form.roomId}
                  onValueChange={(value) =>
                    setForm((f) => ({ ...f, roomId: value ?? f.roomId }))
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

            <DateTimeField
              label="Check-in"
              htmlId="check-in"
              date={checkInDate}
              onDateChange={setCheckInDate}
              time={checkInTime}
              onTimeChange={setCheckInTime}
              disabledBefore={new Date()}
            />

            <DateTimeField
              label="Check-out"
              htmlId="check-out"
              date={checkOutDate}
              onDateChange={setCheckOutDate}
              time={checkOutTime}
              onTimeChange={setCheckOutTime}
              disabledBefore={checkInDate ?? new Date()}
            />

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
