"use client";

import * as React from "react";
import { LayoutGridIcon, PencilIcon, PlusIcon, Trash2Icon } from "lucide-react";

import { PageHeader } from "@/components/shared/page-header";
import { SectionCards } from "@/components/shared/section-cards";
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
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { billingTypeName } from "@/lib/billing";
import { formatCurrency } from "@/lib/utils";

import { useBillingTypesQuery } from "../../billingType/client/useBillingTypes";
import { useRemoveRoomType } from "../client/useRoomTypes";
import type { RoomType } from "../types";
import { RoomTypeFormDialog } from "./room-type-form-dialog";

function RoomTypeCard({
  roomType,
  billingLabel,
  onEdit,
  onDelete,
}: {
  roomType: RoomType;
  billingLabel: string;
  onEdit: (roomType: RoomType) => void;
  onDelete: (roomType: RoomType) => void;
}) {
  const maxAmenities = 4;
  const shownAmenities = roomType.amenities.slice(0, maxAmenities);
  const hiddenAmenityCount = roomType.amenities.length - shownAmenities.length;

  return (
    <Card className="flex h-full flex-col">
      <CardHeader className="grid-cols-[1fr_auto]">
        <div>
          <CardTitle>{roomType.name}</CardTitle>
          {roomType.description && (
            <CardDescription className="line-clamp-2">
              {roomType.description}
            </CardDescription>
          )}
        </div>
        <div className="flex items-center gap-1 justify-self-end">
          <Tooltip>
            <TooltipTrigger
              render={
                <Button
                  variant="ghost"
                  size="icon-sm"
                  className="cursor-pointer"
                  aria-label={`Edit ${roomType.name}`}
                  onClick={() => onEdit(roomType)}
                >
                  <PencilIcon aria-hidden />
                </Button>
              }
            />
            <TooltipContent>Edit room type</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger
              render={
                <Button
                  variant="ghost"
                  size="icon-sm"
                  className="cursor-pointer text-destructive hover:text-destructive"
                  aria-label={`Delete ${roomType.name}`}
                  onClick={() => onDelete(roomType)}
                >
                  <Trash2Icon aria-hidden />
                </Button>
              }
            />
            <TooltipContent>Delete room type</TooltipContent>
          </Tooltip>
        </div>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col gap-3">
        <div className="flex items-baseline justify-between">
          <span className="text-2xl font-semibold tabular-nums">
            {formatCurrency(roomType.basePrice)}
          </span>
          <span className="text-xs text-muted-foreground">
            {billingLabel}
            {roomType.pricingLabel ? ` · ${roomType.pricingLabel}` : ""}
          </span>
        </div>

        <div className="flex flex-wrap gap-1.5">
          {shownAmenities.map((amenity) => (
            <Badge key={amenity} variant="secondary" className="font-normal">
              {amenity}
            </Badge>
          ))}
          {hiddenAmenityCount > 0 && (
            <Badge variant="outline" className="font-normal">
              +{hiddenAmenityCount}
            </Badge>
          )}
        </div>

        <div className="mt-auto border-t pt-3 text-sm text-muted-foreground">
          Sleeps {roomType.capacity}
        </div>
      </CardContent>
    </Card>
  );
}

export function RoomTypesGrid({
  tenant,
  roomTypes,
}: {
  tenant: string;
  roomTypes: RoomType[];
}) {
  const [creating, setCreating] = React.useState(false);
  const [editingRoomType, setEditingRoomType] = React.useState<RoomType | null>(
    null,
  );
  const [pendingDelete, setPendingDelete] = React.useState<RoomType | null>(
    null,
  );
  const remove = useRemoveRoomType(tenant);
  const billingTypesQuery = useBillingTypesQuery(tenant);
  const billingTypes = billingTypesQuery.data ?? [];

  const avgPrice = roomTypes.length
    ? Math.round(
        roomTypes.reduce((sum, t) => sum + t.basePrice, 0) / roomTypes.length,
      )
    : 0;

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Room Types"
        description="The rate categories every room gets added under. Pricing, capacity, and amenities live here."
        actions={
          <Button className="cursor-pointer" onClick={() => setCreating(true)}>
            <PlusIcon data-icon="inline-start" aria-hidden />
            Add Room Type
          </Button>
        }
      />

      <SectionCards
        stats={[
          { label: "Room types", value: String(roomTypes.length) },
          { label: "Average base rate", value: formatCurrency(avgPrice) },
        ]}
      />

      {roomTypes.length === 0 ? (
        <Card className="py-2">
          <CardContent>
            <div className="flex flex-col items-center gap-2 py-12 text-center text-muted-foreground">
              <LayoutGridIcon className="size-8" aria-hidden />
              <p>No room types defined yet.</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {roomTypes.map((roomType) => (
            <RoomTypeCard
              key={roomType.id}
              roomType={roomType}
              billingLabel={billingTypeName(billingTypes, roomType.billingTypeId)}
              onEdit={setEditingRoomType}
              onDelete={setPendingDelete}
            />
          ))}
        </div>
      )}

      <RoomTypeFormDialog
        tenant={tenant}
        open={creating}
        onOpenChange={setCreating}
      />

      <RoomTypeFormDialog
        tenant={tenant}
        roomType={editingRoomType ?? undefined}
        open={editingRoomType !== null}
        onOpenChange={(open) => !open && setEditingRoomType(null)}
      />

      <AlertDialog
        open={pendingDelete !== null}
        onOpenChange={(open) => !open && setPendingDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete {pendingDelete?.name}?</AlertDialogTitle>
            <AlertDialogDescription>
              This can&apos;t be undone.
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
              {remove.isPending ? "Deleting" : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
