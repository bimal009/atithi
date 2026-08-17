"use client";

import { AlertCircleIcon } from "lucide-react";

import { PageHeader } from "@/components/shared/page-header";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { getErrorMessage } from "@/lib/axios";

import { useRoomTypesQuery } from "../client/useRoomTypes";
import { RoomTypesGrid } from "./room-types-grid";

function RoomTypesSkeleton() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-2">
          <Skeleton className="h-7 w-32" />
          <Skeleton className="h-4 w-64" />
        </div>
        <Skeleton className="h-9 w-36" />
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <Skeleton key={index} className="h-40 w-full" />
        ))}
      </div>
    </div>
  );
}

export function RoomTypesPageClient({ tenant }: { tenant: string }) {
  const roomTypesQuery = useRoomTypesQuery(tenant);

  if (roomTypesQuery.isPending) {
    return <RoomTypesSkeleton />;
  }

  if (roomTypesQuery.isError) {
    return (
      <div className="flex flex-col gap-6">
        <PageHeader
          title="Room Types"
          description="The rate categories every room gets added under."
        />
        <Alert variant="destructive">
          <AlertCircleIcon aria-hidden />
          <AlertTitle>Could not load room types</AlertTitle>
          <AlertDescription>{getErrorMessage(roomTypesQuery.error)}</AlertDescription>
        </Alert>
      </div>
    );
  }

  return <RoomTypesGrid tenant={tenant} roomTypes={roomTypesQuery.data} />;
}
