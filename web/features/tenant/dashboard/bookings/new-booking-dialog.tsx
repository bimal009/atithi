"use client"

import * as React from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { CalendarIcon, PlusIcon } from "lucide-react"
import { useForm } from "react-hook-form"
import { z } from "zod"

import { BOOKING_CHANNELS } from "@/lib/mock-data"
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
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field"
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
import { formatDate, generateId } from "@/lib/utils"

const bookingSchema = z.object({
  guestName: z.string().trim().min(2, "Enter the guest's name").max(100),
  guestPhone: z.string().trim().min(7, "Enter a phone number").max(20),
  roomId: z.string().min(1, "Select a room"),
  channel: z.enum(["whatsapp", "instagram", "facebook"]),
  guests: z.coerce.number().int().min(1, "At least 1 guest"),
  notes: z.string().trim().max(1000).optional(),
})

type BookingInput = z.input<typeof bookingSchema>
type BookingValues = z.output<typeof bookingSchema>

const emptyValues: BookingInput = {
  guestName: "",
  guestPhone: "",
  roomId: "",
  channel: "whatsapp",
  guests: 1,
  notes: "",
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
  const [checkInDate, setCheckInDate] = React.useState<Date | undefined>()
  const [checkInTime, setCheckInTime] = React.useState("13:00")
  const [checkOutDate, setCheckOutDate] = React.useState<Date | undefined>()
  const [checkOutTime, setCheckOutTime] = React.useState("11:00")
  const [dateError, setDateError] = React.useState<string | null>(null)

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<BookingInput, unknown, BookingValues>({
    resolver: zodResolver(bookingSchema),
    defaultValues: emptyValues,
  })

  const channel = watch("channel")
  const roomId = watch("roomId")

  const availableRooms = rooms.filter((room) => room.status === "available")

  const channelItems = React.useMemo(
    () => Object.fromEntries(BOOKING_CHANNELS.map((c) => [c.value, c.label])),
    [],
  )
  const roomItems = React.useMemo(
    () =>
      Object.fromEntries(
        availableRooms.map((room) => [room.id, `${room.number} · ${room.type}`]),
      ),
    [availableRooms],
  )

  function resetAll() {
    reset(emptyValues)
    setCheckInDate(undefined)
    setCheckInTime("13:00")
    setCheckOutDate(undefined)
    setCheckOutTime("11:00")
    setDateError(null)
  }

  const onSubmit = handleSubmit((values) => {
    const room = rooms.find((r) => r.id === values.roomId)
    if (!room || !checkInDate || !checkOutDate) {
      setDateError("Select both a check-in and check-out date.")
      return
    }

    const checkIn = combineDateAndTime(checkInDate, checkInTime)
    const checkOut = combineDateAndTime(checkOutDate, checkOutTime)
    if (checkOut <= checkIn) {
      setDateError("Check-out must be after check-in.")
      return
    }
    setDateError(null)

    const nights = Math.max(1, Math.round((+checkOut - +checkIn) / 86_400_000))

    onCreate({
      id: generateId("bk"),
      guestName: values.guestName,
      guestPhone: values.guestPhone,
      roomId: room.id,
      roomNumber: room.number,
      channel: values.channel,
      checkIn: checkIn.toISOString(),
      checkOut: checkOut.toISOString(),
      status: "confirmed",
      guests: values.guests,
      totalAmount: room.price * nights,
      createdAt: new Date().toISOString(),
      notes: values.notes || undefined,
    })

    setOpen(false)
    resetAll()
  })

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next)
        if (!next) resetAll()
      }}
    >
      <DialogTrigger render={<Button />}>
        <PlusIcon data-icon="inline-start" />
        New Booking
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <form onSubmit={onSubmit} noValidate>
          <DialogHeader>
            <DialogTitle>New booking</DialogTitle>
            <DialogDescription>
              Reserve a room for a guest. They&apos;ll show up in the bookings
              list right away.
            </DialogDescription>
          </DialogHeader>

          <FieldGroup className="max-h-[60vh] overflow-y-auto scrollbar-none px-1 py-4 -mx-1">
            <Field className="grid grid-cols-2 gap-3">
              <Field data-invalid={!!errors.guestName}>
                <FieldLabel htmlFor="guest-name">Guest name</FieldLabel>
                <Input
                  id="guest-name"
                  aria-invalid={!!errors.guestName}
                  {...register("guestName")}
                  placeholder="Sujata Shrestha"
                />
                <FieldError errors={[errors.guestName]} />
              </Field>
              <Field data-invalid={!!errors.guestPhone}>
                <FieldLabel htmlFor="guest-phone">Phone</FieldLabel>
                <Input
                  id="guest-phone"
                  aria-invalid={!!errors.guestPhone}
                  {...register("guestPhone")}
                  placeholder="98X-XXXXXXX"
                />
                <FieldError errors={[errors.guestPhone]} />
              </Field>
            </Field>

            <Field data-invalid={!!errors.channel}>
              <FieldLabel htmlFor="channel">Booking channel</FieldLabel>
              <Select
                items={channelItems}
                value={channel}
                onValueChange={(value) =>
                  setValue("channel", (value ?? "whatsapp") as BookingValues["channel"], {
                    shouldValidate: true,
                  })
                }
              >
                <SelectTrigger id="channel" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {BOOKING_CHANNELS.map((c) => (
                    <SelectItem key={c.value} value={c.value}>
                      {c.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FieldError errors={[errors.channel]} />
            </Field>

            <Field className="grid grid-cols-2 gap-3">
              <Field data-invalid={!!errors.roomId}>
                <FieldLabel htmlFor="room">Room</FieldLabel>
                <Select
                  items={roomItems}
                  value={roomId}
                  onValueChange={(value) =>
                    setValue("roomId", value ?? "", { shouldValidate: true })
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
                <FieldError errors={[errors.roomId]} />
              </Field>
              <Field data-invalid={!!errors.guests}>
                <FieldLabel htmlFor="guests">Guests</FieldLabel>
                <Input
                  id="guests"
                  type="number"
                  min={1}
                  aria-invalid={!!errors.guests}
                  {...register("guests")}
                />
                <FieldError errors={[errors.guests]} />
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

            {dateError && <p className="text-sm text-destructive">{dateError}</p>}

            <Field data-invalid={!!errors.notes}>
              <FieldLabel htmlFor="notes">Notes (optional)</FieldLabel>
              <Textarea
                id="notes"
                aria-invalid={!!errors.notes}
                {...register("notes")}
                placeholder="Airport pickup, late arrival, etc."
              />
              <FieldError errors={[errors.notes]} />
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
