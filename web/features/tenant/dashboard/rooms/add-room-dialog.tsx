"use client"

import * as React from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { PlusIcon } from "lucide-react"
import { useForm } from "react-hook-form"
import { z } from "zod"

import type { Room, RoomTypeConfig } from "@/types"
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { MultiImageUpload } from "@/features/tenant/dashboard/rooms/multi-image-upload"
import { formatPricingUnit } from "@/lib/pricing"
import { generateId } from "@/lib/utils"

const roomSchema = z.object({
  number: z.string().trim().min(1, "Enter a room number").max(20),
  floor: z.coerce.number().int().min(0, "Floor must be 0 or higher"),
  type: z.string().min(1, "Select a room type"),
  price: z.coerce.number().min(0, "Enter a valid price"),
  capacity: z.coerce.number().int().min(1, "Capacity must be at least 1"),
  amenities: z.string().trim().optional(),
  notes: z.string().trim().max(1000).optional(),
})

type RoomInput = z.input<typeof roomSchema>
type RoomValues = z.output<typeof roomSchema>

function emptyValues(defaultType: string): RoomInput {
  return {
    number: "",
    floor: 1,
    type: defaultType,
    price: 0,
    capacity: 2,
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
  const [images, setImages] = React.useState<string[]>([])

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<RoomInput, unknown, RoomValues>({
    resolver: zodResolver(roomSchema),
    defaultValues: emptyValues(roomTypes[0]?.type ?? ""),
  })

  const type = watch("type")

  const typeItems = React.useMemo(
    () => Object.fromEntries(roomTypes.map((rt) => [rt.type, rt.label])),
    [roomTypes],
  )

  const selectedType = roomTypes.find((rt) => rt.type === type)
  const priceUnitLabel = selectedType
    ? formatPricingUnit(selectedType.pricingUnit, selectedType.pricingLabel)
    : "per night"

  const onSubmit = handleSubmit((values) => {
    onCreate({
      id: generateId("r"),
      number: values.number,
      floor: values.floor,
      type: values.type,
      status: "available",
      price: values.price,
      capacity: values.capacity,
      images: images.length ? images : undefined,
    })
    setOpen(false)
    reset(emptyValues(roomTypes[0]?.type ?? ""))
    setImages([])
  })

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next)
        if (!next) {
          reset(emptyValues(roomTypes[0]?.type ?? ""))
          setImages([])
        }
      }}
    >
      <DialogTrigger render={<Button />}>
        <PlusIcon data-icon="inline-start" />
        Add Room
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <form onSubmit={onSubmit} noValidate>
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
              <Field data-invalid={!!errors.number}>
                <FieldLabel htmlFor="room-number">Room number</FieldLabel>
                <Input
                  id="room-number"
                  aria-invalid={!!errors.number}
                  {...register("number")}
                  placeholder="305"
                />
                <FieldError errors={[errors.number]} />
              </Field>
              <Field data-invalid={!!errors.floor}>
                <FieldLabel htmlFor="floor">Floor</FieldLabel>
                <Input
                  id="floor"
                  type="number"
                  min={0}
                  aria-invalid={!!errors.floor}
                  {...register("floor")}
                />
                <FieldError errors={[errors.floor]} />
              </Field>
            </Field>

            <Field className="grid grid-cols-2 gap-3">
              <Field data-invalid={!!errors.type}>
                <FieldLabel htmlFor="type">Room type</FieldLabel>
                <Select
                  items={typeItems}
                  value={type}
                  onValueChange={(value) =>
                    setValue("type", value ?? "", { shouldValidate: true })
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
                <FieldError errors={[errors.type]} />
              </Field>
              <Field data-invalid={!!errors.capacity}>
                <FieldLabel htmlFor="capacity">Capacity</FieldLabel>
                <Input
                  id="capacity"
                  type="number"
                  min={1}
                  aria-invalid={!!errors.capacity}
                  {...register("capacity")}
                />
                <FieldError errors={[errors.capacity]} />
              </Field>
            </Field>

            <Field data-invalid={!!errors.price}>
              <FieldLabel htmlFor="price">Price (Rs)</FieldLabel>
              <Input
                id="price"
                type="number"
                min={0}
                aria-invalid={!!errors.price}
                {...register("price")}
                placeholder="2200"
              />
              <FieldDescription>
                {priceUnitLabel.startsWith("per")
                  ? `Billed ${priceUnitLabel}.`
                  : `Billed as ${priceUnitLabel}.`}
              </FieldDescription>
              <FieldError errors={[errors.price]} />
            </Field>

            <Field data-invalid={!!errors.amenities}>
              <FieldLabel htmlFor="amenities">Amenities</FieldLabel>
              <Input
                id="amenities"
                aria-invalid={!!errors.amenities}
                {...register("amenities")}
                placeholder="Wi-Fi, AC, mountain view"
              />
              <FieldDescription>Comma-separated, shown to front desk.</FieldDescription>
              <FieldError errors={[errors.amenities]} />
            </Field>

            <Field data-invalid={!!errors.notes}>
              <FieldLabel htmlFor="room-notes">Notes (optional)</FieldLabel>
              <Textarea
                id="room-notes"
                aria-invalid={!!errors.notes}
                {...register("notes")}
                placeholder="Anything housekeeping or front desk should know."
              />
              <FieldError errors={[errors.notes]} />
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
