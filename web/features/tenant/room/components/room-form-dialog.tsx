"use client";

import * as React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Spinner } from "@/components/ui/spinner";
import { MultiImageUpload } from "@/features/upload/components/multi-image-upload";
import { billingTypeName } from "@/lib/billing";
import { formatCurrency } from "@/lib/utils";

import { useBillingTypesQuery } from "../../billingType/client/useBillingTypes";
import { useRoomTypesQuery } from "../../roomType/client/useRoomTypes";
import { useCreateRoom, useUpdateRoom } from "../client/useRooms";
import { roomSchema, type RoomInput, type RoomValues } from "../schema";
import type { Room } from "../types";

const emptyValues: RoomInput = {
  roomTypeId: "",
  number: "",
  floor: 0,
};

function valuesOf(room?: Room, defaultTypeId?: string): RoomInput {
  if (!room) return { ...emptyValues, roomTypeId: defaultTypeId ?? "" };
  return {
    roomTypeId: room.roomTypeId,
    number: room.number,
    floor: room.floor,
  };
}

export function RoomFormDialog({
  tenant,
  room,
  open,
  onOpenChange,
  onSaved,
}: {
  tenant: string;
  room?: Room;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSaved?: (room: Room) => void;
}) {
  const isEdit = !!room;
  const roomTypesQuery = useRoomTypesQuery(tenant);
  const roomTypes = React.useMemo(() => roomTypesQuery.data ?? [], [roomTypesQuery.data]);
  const billingTypesQuery = useBillingTypesQuery(tenant);
  const billingTypes = billingTypesQuery.data ?? [];
  const create = useCreateRoom(tenant);
  const update = useUpdateRoom(tenant);
  const pending = isEdit ? update.isPending : create.isPending;

  const [images, setImages] = React.useState<string[]>([]);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<RoomInput, unknown, RoomValues>({
    resolver: zodResolver(roomSchema),
    defaultValues: emptyValues,
  });

  const roomTypeId = watch("roomTypeId");
  const selectedType = roomTypes.find((rt) => rt.id === roomTypeId);

  React.useEffect(() => {
    if (!open) return;
    reset(valuesOf(room, roomTypes[0]?.id));
    setImages(room?.images ?? []);
  }, [open, room, reset, roomTypes]);

  const onSubmit = handleSubmit(async (values) => {
    const payload = {
      roomTypeId: values.roomTypeId,
      number: values.number,
      floor: values.floor,
      images,
    };

    const response = room
      ? await update.mutateAsync({ id: room.id, input: payload })
      : await create.mutateAsync(payload);

    onSaved?.(response.data);
    onOpenChange(false);
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <form onSubmit={onSubmit} noValidate>
          <DialogHeader>
            <DialogTitle>{isEdit ? "Edit room" : "Add a room"}</DialogTitle>
            <DialogDescription>
              {isEdit
                ? "Update this room's type, location, and photos."
                : "New rooms start out as available."}
            </DialogDescription>
          </DialogHeader>

          <FieldGroup className="max-h-[65vh] gap-5 overflow-y-auto scrollbar-none px-1 py-4 -mx-1">
            <Field>
              <FieldLabel>Photos</FieldLabel>
              <MultiImageUpload value={images} onChange={setImages} folder="/rooms" maxCount={10} />
              <FieldDescription>JPG, PNG, WebP or AVIF, up to 5 MB each.</FieldDescription>
            </Field>

            <Field className="grid grid-cols-2 gap-3">
              <Field data-invalid={!!errors.number}>
                <FieldLabel htmlFor="room-number">Room number</FieldLabel>
                <Input
                  id="room-number"
                  autoFocus
                  aria-invalid={!!errors.number}
                  {...register("number")}
                  placeholder="305"
                />
                <FieldError errors={[errors.number]} />
              </Field>
              <Field data-invalid={!!errors.floor}>
                <FieldLabel htmlFor="room-floor">Floor</FieldLabel>
                <Input
                  id="room-floor"
                  type="number"
                  min={0}
                  aria-invalid={!!errors.floor}
                  {...register("floor")}
                />
                <FieldError errors={[errors.floor]} />
              </Field>
            </Field>

            <Field data-invalid={!!errors.roomTypeId}>
              <FieldLabel htmlFor="room-type">Room type</FieldLabel>
              <Select
                items={Object.fromEntries(roomTypes.map((rt) => [rt.id, rt.name]))}
                value={roomTypeId}
                onValueChange={(value) =>
                  setValue("roomTypeId", value ?? "", { shouldValidate: true })
                }
              >
                <SelectTrigger id="room-type" className="w-full">
                  <SelectValue placeholder="Select a room type" />
                </SelectTrigger>
                <SelectContent>
                  {roomTypes.map((rt) => (
                    <SelectItem key={rt.id} value={rt.id}>
                      {rt.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {selectedType && (
                <FieldDescription>
                  {formatCurrency(selectedType.basePrice)}{" "}
                  {billingTypeName(billingTypes, selectedType.billingTypeId)} · Sleeps{" "}
                  {selectedType.capacity}.set on the room type.{" "}
                  <Link
                    href={`/${tenant}/dashboard/rooms/types`}
                    className="underline hover:text-foreground"
                  >
                    Manage room types
                  </Link>
                </FieldDescription>
              )}
              <FieldError errors={[errors.roomTypeId]} />
            </Field>
          </FieldGroup>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              className="cursor-pointer"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="cursor-pointer"
              disabled={pending}
              data-icon={pending ? "inline-start" : undefined}
            >
              {pending && <Spinner />}
              {pending ? "Saving" : isEdit ? "Save changes" : "Add room"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
