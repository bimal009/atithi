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
  Trash2Icon,
} from "lucide-react";

import { EmptyState } from "@/components/shared/empty-state";
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { useDeleteHotel } from "../client/useHotels";
import { HotelFormDialog } from "./hotel-form-dialog";
import type { Hotel } from "../types";

function initialsOf(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]!.toUpperCase())
    .join("");
}

export function HotelsGrid({ hotels }: { hotels: Hotel[] }) {
  const [editingHotel, setEditingHotel] = React.useState<Hotel | null>(null);
  const [pendingDelete, setPendingDelete] = React.useState<Hotel | null>(null);
  const remove = useDeleteHotel();

  return (
    <div className="flex flex-col gap-4">
      {hotels.length === 0 ? (
        <Card className="py-2">
          <CardContent>
            <EmptyState
              icon={HotelIcon}
              title="No hotels yet"
              description="Add your first property to start taking bookings."
            />
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {hotels.map((hotel) => (
            <Card key={hotel.id} className="@container/card">
              <CardHeader className="grid-cols-[1fr_auto]">
                <Link
                  href={`/${hotel.slug}/dashboard`}
                  className="flex min-w-0 items-center gap-3 rounded-sm transition-colors hover:text-primary focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
                >
                  <Avatar className="rounded-md border" size="lg">
                    {hotel.logoUrl ? (
                      <AvatarImage
                        src={hotel.logoUrl}
                        alt=""
                        className="rounded-md object-contain"
                      />
                    ) : null}
                    <AvatarFallback className="rounded-md text-xs font-medium">
                      {initialsOf(hotel.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex min-w-0 flex-col">
                    <CardTitle className="truncate">{hotel.name}</CardTitle>
                    <span className="truncate text-xs text-muted-foreground">
                      {hotel.slug}.hiatithi.com
                    </span>
                  </div>
                </Link>

                <DropdownMenu>
                  <DropdownMenuTrigger
                    render={
                      <Button
                        variant="ghost"
                        size="icon"
                        className="size-8 cursor-pointer justify-self-end"
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
                      Dashboard
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="cursor-pointer"
                      onClick={() => setEditingHotel(hotel)}
                    >
                      <PencilIcon aria-hidden />
                      Edit
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
              </CardHeader>

              <CardContent className="flex flex-col gap-3">
                <StatusBadge status={hotel.isActive ? "active" : "inactive"} />

                {hotel.description && (
                  <p className="line-clamp-2 text-sm text-muted-foreground">
                    {hotel.description}
                  </p>
                )}

                <div className="flex flex-col gap-1.5 text-sm text-muted-foreground">
                  <div className="flex items-start gap-2">
                    <MapPinIcon className="mt-0.5 size-3.5 shrink-0" aria-hidden />
                    <span className="truncate">
                      {hotel.address}
                      {hotel.city ? `, ${hotel.city}` : ""}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <PhoneIcon className="size-3.5 shrink-0" aria-hidden />
                    <span className="tabular-nums">+977 {hotel.phoneNumber}</span>
                  </div>
                  {hotel.email && (
                    <div className="flex items-center gap-2">
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
        open={editingHotel !== null}
        onOpenChange={(open) => !open && setEditingHotel(null)}
        hotel={editingHotel ?? undefined}
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
