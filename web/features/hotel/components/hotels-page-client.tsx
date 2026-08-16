"use client";

import { AlertCircleIcon } from "lucide-react";

import { PageHeader } from "@/components/shared/page-header";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { getErrorMessage } from "@/lib/axios";

import { useHotelsQuery } from "../client/useHotels";
import { CreateHotelDialog } from "./create-hotel-dialog";
import { HotelsGrid } from "./hotels-grid";

function HotelsSkeleton() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-2">
          <Skeleton className="h-7 w-32" />
          <Skeleton className="h-4 w-72" />
        </div>
        <Skeleton className="h-9 w-28" />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <Skeleton key={index} className="h-28 w-full" />
        ))}
      </div>
    </div>
  );
}

export function HotelsPageClient() {
  const hotelsQuery = useHotelsQuery();

  if (hotelsQuery.isPending) {
    return <HotelsSkeleton />;
  }

  if (hotelsQuery.isError) {
    return (
      <div className="flex flex-col gap-6">
        <PageHeader
          title="Hotels"
          description="Every property you manage."
          actions={<CreateHotelDialog />}
        />
        <Alert variant="destructive">
          <AlertCircleIcon aria-hidden />
          <AlertTitle>Could not load your hotels</AlertTitle>
          <AlertDescription>{getErrorMessage(hotelsQuery.error)}</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Hotels"
        description="Every property you manage. Open one to reach its dashboard."
        actions={<CreateHotelDialog />}
      />

      <HotelsGrid hotels={hotelsQuery.data} />
    </div>
  );
}
