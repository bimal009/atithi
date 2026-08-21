"use client";

import * as React from "react";
import {
  AlertCircleIcon,
  CalendarClockIcon,
  MoreHorizontalIcon,
  PencilIcon,
  PlusIcon,
  Trash2Icon,
} from "lucide-react";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DataTable, type DataTableColumn } from "@/components/shared/data-table";
import { PageHeader } from "@/components/shared/page-header";
import { SectionCards } from "@/components/shared/section-cards";
import { StatusBadge } from "@/components/shared/status-badge";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { getErrorMessage } from "@/lib/axios";

import {
  useRemoveReservation,
  useReservationsQuery,
  useUpdateReservationStatus,
} from "../client/useReservations";
import type { Reservation, ReservationStatus } from "../types";
import { ReservationFormDialog } from "./reservation-form-dialog";

const STATUS_OPTIONS: ReservationStatus[] = [
  "confirmed",
  "seated",
  "completed",
  "cancelled",
  "no_show",
];

const STATUS_FILTERS: Array<{ value: "all" | ReservationStatus; label: string }> = [
  { value: "all", label: "All statuses" },
  { value: "confirmed", label: "Confirmed" },
  { value: "seated", label: "Seated" },
  { value: "completed", label: "Completed" },
  { value: "cancelled", label: "Cancelled" },
  { value: "no_show", label: "No show" },
];

const STATUS_ITEMS = Object.fromEntries(STATUS_FILTERS.map((o) => [o.value, o.label]));

const searchParser = parseAsString.withDefault("").withOptions({
  history: "replace",
});

const statusParser = parseAsStringLiteral([
  "all",
  "confirmed",
  "seated",
  "completed",
  "cancelled",
  "no_show",
] as const)
  .withDefault("all")
  .withOptions({ history: "replace" });

const pageParser = parseAsInteger.withDefault(1).withOptions({ history: "replace" });

const PAGE_SIZE = 10;

export function ReservationsTable({ tenant }: { tenant: string }) {
  const [search, setSearch] = useQueryState("q", searchParser);
  const [status, setStatus] = useQueryState("status", statusParser);
  const [page, setPage] = useQueryState("page", pageParser);
  const [creating, setCreating] = React.useState(false);
  const [editingReservation, setEditingReservation] = React.useState<Reservation | null>(null);
  const [pendingDelete, setPendingDelete] = React.useState<Reservation | null>(null);

  const debouncedSearch = useDebouncedValue(search, 400);
  const reservationsQuery = useReservationsQuery(tenant, {
    search: debouncedSearch,
    status: status === "all" ? undefined : status,
    page,
    limit: PAGE_SIZE,
  });

  const updateStatus = useUpdateReservationStatus(tenant);
  const remove = useRemoveReservation(tenant);

  const resetToFirstPage = () => {
    if (page !== 1) setPage(1);
  };

  const reservations = reservationsQuery.data?.reservations ?? [];
  const total = reservationsQuery.data?.total ?? 0;
  const pageCount = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const upcoming = reservations.filter(
    (r) => r.status === "confirmed" && new Date(r.reservedAt) > new Date(),
  ).length;
  const seated = reservations.filter((r) => r.status === "seated").length;

  if (reservationsQuery.isError) {
    return (
      <div className="flex flex-col gap-6">
        <PageHeader title="Reservations" description="Table reservations, upcoming and past." />
        <Alert variant="destructive">
          <AlertCircleIcon aria-hidden />
          <AlertTitle>Could not load reservations</AlertTitle>
          <AlertDescription>{getErrorMessage(reservationsQuery.error)}</AlertDescription>
        </Alert>
      </div>
    );
  }

  const columns: DataTableColumn<Reservation>[] = [
    {
      key: "guest",
      header: "Guest",
      headerClassName: "pl-5",
      cellClassName: "pl-5",
      cell: (r) => (
        <div className="flex flex-col">
          <span className="font-medium">{r.guestName}</span>
          <span className="text-xs text-muted-foreground">{r.guestPhone}</span>
        </div>
      ),
    },
    {
      key: "resources",
      header: "Table / Cabin",
      cell: (r) => {
        const names = [...r.tables.map((t) => t.name), ...r.cabins.map((c) => c.name)];
        return (
          <span className="text-muted-foreground">
            {names.length > 0 ? names.join(", ") : "—"}
          </span>
        );
      },
    },
    {
      key: "party",
      header: "Party",
      cell: (r) => <span className="text-muted-foreground">{r.partySize}</span>,
    },
    {
      key: "when",
      header: "Date & time",
      cell: (r) => (
        <span className="text-muted-foreground">
          {new Date(r.reservedAt).toLocaleString("en-US", {
            month: "short",
            day: "numeric",
            hour: "numeric",
            minute: "2-digit",
          })}
        </span>
      ),
    },
    {
      key: "reservedBy",
      header: "Reserved by",
      cell: (r) => <span className="text-muted-foreground">{r.reservedByName}</span>,
    },
    {
      key: "status",
      header: "Status",
      cell: (r) => (
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <button type="button" className="cursor-pointer">
                <StatusBadge status={r.status} />
              </button>
            }
          />
          <DropdownMenuContent align="start">
            {STATUS_OPTIONS.map((option) => (
              <DropdownMenuItem
                key={option}
                disabled={option === r.status}
                className="cursor-pointer"
                onClick={() => updateStatus.mutate({ id: r.id, status: option })}
              >
                {STATUS_FILTERS.find((f) => f.value === option)?.label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
    {
      key: "actions",
      header: "",
      headerClassName: "pr-5",
      cellClassName: "pr-5 text-right",
      cell: (r) => (
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button
                variant="ghost"
                size="icon"
                className="size-8 cursor-pointer justify-self-end"
                aria-label={`Actions for ${r.guestName}`}
              >
                <MoreHorizontalIcon aria-hidden />
              </Button>
            }
          />
          <DropdownMenuContent align="end">
            <DropdownMenuItem
              className="cursor-pointer"
              onClick={() => setEditingReservation(r)}
            >
              <PencilIcon aria-hidden />
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem
              variant="destructive"
              className="cursor-pointer"
              onClick={() => setPendingDelete(r)}
            >
              <Trash2Icon aria-hidden />
              Remove
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Reservations"
        description="Table reservations, upcoming and past."
        actions={
          <Button className="cursor-pointer" onClick={() => setCreating(true)}>
            <PlusIcon data-icon="inline-start" aria-hidden />
            Add Reservation
          </Button>
        }
      />

      <SectionCards
        stats={[
          { label: "Total reservations", value: String(total) },
          { label: "Upcoming", value: String(upcoming), description: "On this page" },
          { label: "Seated now", value: String(seated), description: "On this page" },
        ]}
      />

      <DataTable
        columns={columns}
        data={reservations}
        loading={reservationsQuery.isFetching}
        getRowId={(r) => r.id}
        searchPlaceholder="Search by guest name or phone…"
        searchValue={search}
        onSearchChange={(value) => {
          setSearch(value);
          resetToFirstPage();
        }}
        page={page}
        pageCount={pageCount}
        onPageChange={setPage}
        toolbar={
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
        }
        emptyIcon={CalendarClockIcon}
        emptyTitle="No reservations found"
        emptyDescription="Try a different search or status filter."
      />

      <ReservationFormDialog tenant={tenant} open={creating} onOpenChange={setCreating} />

      <ReservationFormDialog
        tenant={tenant}
        reservation={editingReservation ?? undefined}
        open={editingReservation !== null}
        onOpenChange={(open) => !open && setEditingReservation(null)}
      />

      <AlertDialog
        open={pendingDelete !== null}
        onOpenChange={(open) => !open && setPendingDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove reservation for {pendingDelete?.guestName}?</AlertDialogTitle>
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
              {remove.isPending ? "Removing" : "Remove"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
