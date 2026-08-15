"use client";

import * as React from "react";
import Link from "next/link";
import {
  ExternalLinkIcon,
  HotelIcon,
  MoreHorizontalIcon,
  Trash2Icon,
} from "lucide-react";

import { DataTable, type DataTableColumn } from "@/components/shared/data-table";
import { StatusBadge } from "@/components/shared/status-badge";
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { useDeleteHotel } from "../client/useHotels";
import type { Hotel } from "../types";

function initialsOf(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]!.toUpperCase())
    .join("");
}

export function HotelsTable({ hotels }: { hotels: Hotel[] }) {
  const [pendingDelete, setPendingDelete] = React.useState<Hotel | null>(null);
  const remove = useDeleteHotel();

  const columns: DataTableColumn<Hotel>[] = [
    {
      key: "name",
      header: "Hotel",
      cell: (hotel) => (
        <Link
          href={`/${hotel.slug}/dashboard`}
          className="flex items-center gap-3 rounded-sm transition-colors hover:text-primary focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
        >
          <Avatar className="size-9 rounded-md border">
            {hotel.logoUrl ? (
              <AvatarImage src={hotel.logoUrl} alt="" className="rounded-md" />
            ) : null}
            <AvatarFallback className="rounded-md text-xs font-medium">
              {initialsOf(hotel.name)}
            </AvatarFallback>
          </Avatar>
          <div className="flex min-w-0 flex-col">
            <span className="truncate font-medium">{hotel.name}</span>
            <span className="truncate text-xs text-muted-foreground">
              /{hotel.slug}
            </span>
          </div>
        </Link>
      ),
    },
    {
      key: "location",
      header: "Location",
      cell: (hotel) => (
        <div className="flex min-w-0 flex-col">
          <span className="truncate">{hotel.city ?? "—"}</span>
          <span className="truncate text-xs text-muted-foreground">
            {hotel.address}
          </span>
        </div>
      ),
    },
    {
      key: "contact",
      header: "Contact",
      cell: (hotel) => (
        <div className="flex min-w-0 flex-col">
          <span className="tabular-nums">+977 {hotel.phoneNumber}</span>
          {hotel.email && (
            <span className="truncate text-xs text-muted-foreground">
              {hotel.email}
            </span>
          )}
        </div>
      ),
    },
    {
      key: "status",
      header: "Status",
      cell: (hotel) => (
        <StatusBadge status={hotel.isActive ? "active" : "inactive"} />
      ),
    },
    {
      key: "actions",
      header: <span className="sr-only">Actions</span>,
      headerClassName: "w-12",
      cellClassName: "text-right",
      cell: (hotel) => (
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button
                variant="ghost"
                size="icon"
                className="size-8 cursor-pointer"
                aria-label={`Actions for ${hotel.name}`}
              >
                <MoreHorizontalIcon aria-hidden />
              </Button>
            }
          />
          <DropdownMenuContent align="end">
            <DropdownMenuItem
              className="cursor-pointer"
              render={<Link href={`/${hotel.slug}/dashboard`} />}
            >
              <ExternalLinkIcon aria-hidden />
              Open dashboard
            </DropdownMenuItem>
            <DropdownMenuItem
              variant="destructive"
              className="cursor-pointer"
              onClick={() => setPendingDelete(hotel)}
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
    <>
      <DataTable
        columns={columns}
        data={hotels}
        getRowId={(hotel) => hotel.id}
        emptyIcon={HotelIcon}
        emptyTitle="No hotels yet"
        emptyDescription="Add your first property to start taking bookings."
        searchPlaceholder="Search hotels…"
        searchFn={(hotel, query) =>
          [hotel.name, hotel.slug, hotel.city ?? "", hotel.address]
            .join(" ")
            .toLowerCase()
            .includes(query)
        }
      />

      <AlertDialog
        open={pendingDelete !== null}
        onOpenChange={(open) => !open && setPendingDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Remove {pendingDelete?.name}?
            </AlertDialogTitle>
            <AlertDialogDescription>
              This deletes the hotel along with its rooms, bookings and staff
              access. It cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="cursor-pointer">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
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
    </>
  );
}
