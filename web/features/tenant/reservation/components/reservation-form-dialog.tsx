"use client";

import * as React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
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
import { Textarea } from "@/components/ui/textarea";
import { useTablesQuery } from "@/features/tenant/table/client/useTables";

import { useCreateReservation, useUpdateReservation } from "../client/useReservations";
import { reservationSchema, type ReservationInput, type ReservationValues } from "../schema";
import type { Reservation } from "../types";

function toLocalInputValue(iso?: string): string {
  if (!iso) return "";
  const date = new Date(iso);
  const offset = date.getTimezoneOffset();
  const local = new Date(date.getTime() - offset * 60 * 1000);
  return local.toISOString().slice(0, 16);
}

const emptyValues: ReservationInput = {
  tableId: "",
  guestName: "",
  guestPhone: "",
  partySize: 2,
  reservedAt: "",
  reservedBy: "",
  notes: "",
};

function valuesOf(reservation?: Reservation): ReservationInput {
  if (!reservation) return emptyValues;
  return {
    tableId: reservation.tableId,
    guestName: reservation.guestName,
    guestPhone: reservation.guestPhone,
    partySize: reservation.partySize,
    reservedAt: toLocalInputValue(reservation.reservedAt),
    reservedBy: reservation.reservedBy,
    notes: reservation.notes ?? "",
  };
}

export function ReservationFormDialog({
  tenant,
  reservation,
  open,
  onOpenChange,
  onSaved,
}: {
  tenant: string;
  reservation?: Reservation;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSaved?: (reservation: Reservation) => void;
}) {
  const isEdit = !!reservation;
  const tablesQuery = useTablesQuery(tenant);
  const tables = tablesQuery.data?.tables ?? [];
  const create = useCreateReservation(tenant);
  const update = useUpdateReservation(tenant);
  const pending = isEdit ? update.isPending : create.isPending;

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<ReservationInput, unknown, ReservationValues>({
    resolver: zodResolver(reservationSchema),
    defaultValues: emptyValues,
  });

  const tableId = watch("tableId");

  React.useEffect(() => {
    if (!open) return;
    reset(valuesOf(reservation));
  }, [open, reservation, reset]);

  const onSubmit = handleSubmit(async (values) => {
    const payload = {
      tableId: values.tableId,
      guestName: values.guestName,
      guestPhone: values.guestPhone,
      partySize: values.partySize,
      reservedAt: new Date(values.reservedAt).toISOString(),
      reservedBy: values.reservedBy,
      notes: values.notes || undefined,
    };

    const response = reservation
      ? await update.mutateAsync({ id: reservation.id, input: payload })
      : await create.mutateAsync(payload);

    onSaved?.(response.data);
    onOpenChange(false);
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <form onSubmit={onSubmit} noValidate>
          <DialogHeader>
            <DialogTitle>{isEdit ? "Edit reservation" : "Add a reservation"}</DialogTitle>
            <DialogDescription>
              {isEdit
                ? "Update this table reservation."
                : "New reservations start out as confirmed."}
            </DialogDescription>
          </DialogHeader>

          <FieldGroup className="max-h-[65vh] gap-5 overflow-y-auto scrollbar-none px-1 py-4 -mx-1">
            <Field data-invalid={!!errors.guestName}>
              <FieldLabel htmlFor="reservation-guest-name">Guest name</FieldLabel>
              <Input
                id="reservation-guest-name"
                autoFocus
                aria-invalid={!!errors.guestName}
                {...register("guestName")}
                placeholder="Sujata Shrestha"
              />
              <FieldError errors={[errors.guestName]} />
            </Field>

            <Field className="grid grid-cols-2 gap-3">
              <Field data-invalid={!!errors.guestPhone}>
                <FieldLabel htmlFor="reservation-guest-phone">Phone</FieldLabel>
                <Input
                  id="reservation-guest-phone"
                  aria-invalid={!!errors.guestPhone}
                  {...register("guestPhone")}
                  placeholder="980-1122334"
                />
                <FieldError errors={[errors.guestPhone]} />
              </Field>
              <Field data-invalid={!!errors.partySize}>
                <FieldLabel htmlFor="reservation-party-size">Party size</FieldLabel>
                <Input
                  id="reservation-party-size"
                  type="number"
                  min={1}
                  aria-invalid={!!errors.partySize}
                  {...register("partySize")}
                />
                <FieldError errors={[errors.partySize]} />
              </Field>
            </Field>

            <Field data-invalid={!!errors.tableId}>
              <FieldLabel htmlFor="reservation-table">Table</FieldLabel>
              <Select
                items={Object.fromEntries(tables.map((t) => [t.id, t.name]))}
                value={tableId}
                onValueChange={(value) =>
                  setValue("tableId", value ?? "", { shouldValidate: true })
                }
              >
                <SelectTrigger id="reservation-table" className="w-full">
                  <SelectValue placeholder="Select a table" />
                </SelectTrigger>
                <SelectContent>
                  {tables.map((t) => (
                    <SelectItem key={t.id} value={t.id}>
                      {t.name} · Seats {t.capacity}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FieldError errors={[errors.tableId]} />
            </Field>

            <Field data-invalid={!!errors.reservedAt}>
              <FieldLabel htmlFor="reservation-time">Date & time</FieldLabel>
              <Input
                id="reservation-time"
                type="datetime-local"
                aria-invalid={!!errors.reservedAt}
                {...register("reservedAt")}
              />
              <FieldError errors={[errors.reservedAt]} />
            </Field>

            <Field data-invalid={!!errors.reservedBy}>
              <FieldLabel htmlFor="reservation-by">Reserved by</FieldLabel>
              <Input
                id="reservation-by"
                aria-invalid={!!errors.reservedBy}
                {...register("reservedBy")}
                placeholder="Front desk"
              />
              <FieldError errors={[errors.reservedBy]} />
            </Field>

            <Field data-invalid={!!errors.notes}>
              <FieldLabel htmlFor="reservation-notes">
                Notes <span className="text-muted-foreground">(optional)</span>
              </FieldLabel>
              <Textarea
                id="reservation-notes"
                aria-invalid={!!errors.notes}
                {...register("notes")}
                placeholder="Window seat requested, celebrating a birthday…"
                rows={2}
              />
              <FieldError errors={[errors.notes]} />
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
              {pending ? "Saving" : isEdit ? "Save changes" : "Add reservation"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
