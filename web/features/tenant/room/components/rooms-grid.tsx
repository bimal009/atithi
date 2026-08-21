"use client";

import * as React from "react";
import { AlertCircleIcon, BedIcon, ChevronLeftIcon, ChevronRightIcon, PlusIcon } from "lucide-react";
import { parseAsInteger, parseAsString, parseAsStringLiteral, useQueryState } from "nuqs";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { PageHeader } from "@/components/shared/page-header";
import { SectionCards } from "@/components/shared/section-cards";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { getErrorMessage } from "@/lib/axios";
import { billingTypeName } from "@/lib/billing";
import { formatCurrency } from "@/lib/utils";
import type { RoomStatus } from "@/types";

import { useBillingTypesQuery } from "../../billingType/client/useBillingTypes";
import { useRoomTypesQuery } from "../../roomType/client/useRoomTypes";
import { useRemoveRoom, useRoomsQuery, useUpdateRoomStatus } from "../client/useRooms";
import type { Room } from "../types";
import { RoomCard } from "./room-card";
import { RoomFormDialog } from "./room-form-dialog";

const STATUS_FILTERS: Array<{ value: "all" | RoomStatus; label: string }> = [
  { value: "all", label: "All statuses" },
  { value: "available", label: "Available" },
  { value: "occupied", label: "Occupied" },
  { value: "cleaning", label: "Cleaning" },
  { value: "maintenance", label: "Maintenance" },
];

const STATUS_ITEMS = Object.fromEntries(STATUS_FILTERS.map((o) => [o.value, o.label]));

const searchParser = parseAsString.withDefault("").withOptions({
  history: "replace",
});

const statusParser = parseAsStringLiteral([
  "all",
  "available",
  "occupied",
  "cleaning",
  "maintenance",
] as const)
  .withDefault("all")
  .withOptions({ history: "replace" });

const pageParser = parseAsInteger.withDefault(1).withOptions({ history: "replace" });

const PAGE_SIZE = 10;

export function RoomsGrid({ tenant }: { tenant: string }) {
  const [search, setSearch] = useQueryState("q", searchParser);
  const [status, setStatus] = useQueryState("status", statusParser);
  const [page, setPage] = useQueryState("page", pageParser);
  const [creating, setCreating] = React.useState(false);
  const [editingRoom, setEditingRoom] = React.useState<Room | null>(null);
  const [pendingDelete, setPendingDelete] = React.useState<Room | null>(null);

  const debouncedSearch = useDebouncedValue(search, 400);
  const roomsQuery = useRoomsQuery(tenant, {
    search: debouncedSearch,
    status: status === "all" ? undefined : status,
    page,
    limit: PAGE_SIZE,
  });
  const roomTypesQuery = useRoomTypesQuery(tenant, { limit: 100 });
  const roomTypesById = new Map(
    (roomTypesQuery.data?.roomTypes ?? []).map((rt) => [rt.id, rt]),
  );
  const billingTypesQuery = useBillingTypesQuery(tenant, { limit: 100 });
  const billingTypes = billingTypesQuery.data?.billingTypes ?? [];

  const updateStatus = useUpdateRoomStatus(tenant);
  const remove = useRemoveRoom(tenant);

  const rooms = roomsQuery.data?.rooms ?? [];
  const total = roomsQuery.data?.total ?? 0;
  const pageCount = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const roomPrices = rooms
    .map((r) => roomTypesById.get(r.roomTypeId)?.basePrice)
    .filter((price): price is number => price !== undefined);
  const avgPrice = roomPrices.length
    ? Math.round(roomPrices.reduce((sum, price) => sum + price, 0) / roomPrices.length)
    : 0;
  const available = rooms.filter((r) => r.status === "available").length;
  const occupied = rooms.filter((r) => r.status === "occupied").length;

  const goToPage = (next: number) => setPage(Math.min(Math.max(1, next), pageCount));

  const resetToFirstPage = () => {
    if (page !== 1) setPage(1);
  };

  if (roomsQuery.isPending) {
    return (
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-col gap-2">
            <Skeleton className="h-7 w-24" />
            <Skeleton className="h-4 w-72" />
          </div>
          <Skeleton className="h-9 w-32" />
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <Skeleton key={index} className="h-80 w-full" />
          ))}
        </div>
      </div>
    );
  }

  if (roomsQuery.isError) {
    return (
      <div className="flex flex-col gap-6">
        <PageHeader title="Rooms" description="Every physical room, its photos, rate, and live status." />
        <Alert variant="destructive">
          <AlertCircleIcon aria-hidden />
          <AlertTitle>Could not load rooms</AlertTitle>
          <AlertDescription>{getErrorMessage(roomsQuery.error)}</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Rooms"
        description="Every physical room, its photos, rate, and live status."
        actions={
          <Button className="cursor-pointer" onClick={() => setCreating(true)}>
            <PlusIcon data-icon="inline-start" aria-hidden />
            Add Room
          </Button>
        }
      />

      <SectionCards
        stats={[
          { label: "Rooms", value: String(total) },
          { label: "Available", value: String(available) },
          { label: "Occupied", value: String(occupied) },
          { label: "Average rate", value: formatCurrency(avgPrice) },
        ]}
      />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <Input
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            resetToFirstPage();
          }}
          placeholder="Search by room number"
          className="sm:max-w-xs"
        />
        <Select
          items={STATUS_ITEMS}
          value={status}
          onValueChange={(v) => {
            setStatus((v ?? "all") as typeof status);
            resetToFirstPage();
          }}
        >
          <SelectTrigger className="w-full sm:w-44">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {STATUS_FILTERS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {rooms.length === 0 ? (
        <Card className="py-2">
          <CardContent>
            <div className="flex flex-col items-center gap-2 py-12 text-center text-muted-foreground">
              <BedIcon className="size-8" aria-hidden />
              <p>No rooms found.</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {rooms.map((room) => (
            <RoomCard
              key={room.id}
              room={room}
              roomType={roomTypesById.get(room.roomTypeId)}
              billingLabel={billingTypeName(
                billingTypes,
                roomTypesById.get(room.roomTypeId)?.billingTypeId,
              )}
              onEdit={setEditingRoom}
              onDelete={setPendingDelete}
              onStatusChange={(r, newStatus) =>
                updateStatus.mutate({ id: r.id, status: newStatus })
              }
            />
          ))}
        </div>
      )}

      {pageCount > 1 && (
        <div className="flex items-center justify-between gap-4">
          <span className="text-sm text-muted-foreground">
            Page {page} of {pageCount}
          </span>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon-sm"
              disabled={page <= 1}
              onClick={() => goToPage(page - 1)}
            >
              <ChevronLeftIcon />
            </Button>
            <Button
              variant="outline"
              size="icon-sm"
              disabled={page >= pageCount}
              onClick={() => goToPage(page + 1)}
            >
              <ChevronRightIcon />
            </Button>
          </div>
        </div>
      )}

      <RoomFormDialog tenant={tenant} open={creating} onOpenChange={setCreating} />

      <RoomFormDialog
        tenant={tenant}
        room={editingRoom ?? undefined}
        open={editingRoom !== null}
        onOpenChange={(open) => !open && setEditingRoom(null)}
      />

      <AlertDialog
        open={pendingDelete !== null}
        onOpenChange={(open) => !open && setPendingDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete room {pendingDelete?.number}?</AlertDialogTitle>
            <AlertDialogDescription>This can&apos;t be undone.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="cursor-pointer">Cancel</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              className="cursor-pointer"
              disabled={remove.isPending}
              onClick={async () => {
                if (!pendingDelete) return;
                await remove.mutateAsync(pendingDelete.id);
                setPendingDelete(null);
              }}
            >
              {remove.isPending ? "Deleting" : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
