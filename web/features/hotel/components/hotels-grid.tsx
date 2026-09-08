"use client";

import * as React from "react";
import Link from "next/link";
import {
  ExternalLinkIcon,
  HotelIcon,
  MailIcon,
  MapPinIcon,
  MoreHorizontalIcon,
  PencilIcon,
  PhoneIcon,
  PlusIcon,
  Trash2Icon,
} from "lucide-react";

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
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";

import { useDeleteHotel } from "../client/useHotels";
import { HotelFormDialog } from "./hotel-form-dialog";
import type { Hotel } from "../types";

export function HotelsGrid({ hotels }: { hotels: Hotel[] }) {
  const [editingHotel, setEditingHotel] = React.useState<Hotel | null>(null);
  const [pendingDelete, setPendingDelete] = React.useState<Hotel | null>(null);
  const [createOpen, setCreateOpen] = React.useState(false);
  const remove = useDeleteHotel();

  return (
    <div className="flex flex-col gap-4">
      {hotels.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center gap-4 py-16 text-center">
            <div className="flex size-14 items-center justify-center rounded-full bg-muted">
              <HotelIcon className="size-6 text-muted-foreground" aria-hidden />
            </div>
            <div className="flex flex-col gap-1">
              <p className="text-base font-medium">No hotels yet</p>
              <p className="max-w-sm text-sm text-muted-foreground">
                Add your first property to start taking bookings.
              </p>
            </div>
            <Button onClick={() => setCreateOpen(true)}>
              <PlusIcon aria-hidden />
              Add hotel
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {hotels.map((hotel) => (
            <Card
              key={hotel.id}
              className="@container/card gap-0 py-0 transition-shadow hover:shadow-md"
            >
              <CardHeader className="grid-cols-[1fr_auto] gap-3 border-b py-4">
                <Link
                  href={`/dashboard/${hotel.id}`}
                  className="group flex min-w-0 flex-col gap-1 rounded-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <CardTitle className="truncate transition-colors group-hover:text-primary">
                    {hotel.name}
                  </CardTitle>
                  <StatusBadge
                    status={hotel.isActive ? "active" : "inactive"}
                    className="w-fit"
                  />
                </Link>

                <DropdownMenu>
                  <DropdownMenuTrigger
                    render={
                      <Button
                        variant="ghost"
                        size="icon"
                        className="size-8 shrink-0 justify-self-end text-muted-foreground"
                        aria-label={`Actions for ${hotel.name}`}
                      >
                        <MoreHorizontalIcon aria-hidden />
                      </Button>
                    }
                  />
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem render={<Link href={`/dashboard/${hotel.id}`} />}>
                      <ExternalLinkIcon aria-hidden />
                      Dashboard
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setEditingHotel(hotel)}>
                      <PencilIcon aria-hidden />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      variant="destructive"
                      onClick={() => setPendingDelete(hotel)}
                    >
                      <Trash2Icon aria-hidden />
                      Remove
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </CardHeader>

              <CardContent className="flex flex-col gap-3 py-4">
                {hotel.description && (
                  <p className="line-clamp-2 text-sm text-muted-foreground">
                    {hotel.description}
                  </p>
                )}

                <Separator className="my-0.5" />

                <div className="flex flex-col gap-2 text-sm">
                  <div className="flex items-start gap-2.5 text-muted-foreground">
                    <MapPinIcon className="mt-0.5 size-3.5 shrink-0" aria-hidden />
                    <span className="truncate">
                      {hotel.address}
                      {hotel.city ? `, ${hotel.city}` : ""}
                    </span>
                  </div>
                  <div className="flex items-center gap-2.5 text-muted-foreground">
                    <PhoneIcon className="size-3.5 shrink-0" aria-hidden />
                    <span className="tabular-nums">+977 {hotel.phoneNumber}</span>
                  </div>
                  {hotel.email && (
                    <div className="flex items-center gap-2.5 text-muted-foreground">
                      <MailIcon className="size-3.5 shrink-0" aria-hidden />
                      <span className="truncate">{hotel.email}</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <HotelFormDialog
        open={editingHotel !== null || createOpen}
        onOpenChange={(open) => {
          if (!open) {
            setEditingHotel(null);
            setCreateOpen(false);
          }
        }}
        hotel={editingHotel ?? undefined}
      />

      <AlertDialog
        open={pendingDelete !== null}
        onOpenChange={(open) => !open && setPendingDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove {pendingDelete?.name}?</AlertDialogTitle>
            <AlertDialogDescription>
              This deletes the hotel along with its rooms, bookings and staff
              access. It cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
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