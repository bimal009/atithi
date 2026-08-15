import type { Metadata } from "next";
import { AlertCircleIcon } from "lucide-react";

import { PageHeader } from "@/components/shared/page-header";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { CreateHotelDialog } from "@/features/hotel/components/create-hotel-dialog";
import { HotelsGrid } from "@/features/hotel/components/hotels-grid";
import type { Hotel } from "@/features/hotel/types";
import { serverFetch } from "@/lib/server-api";

export const metadata: Metadata = {
  title: "Hotels · Atithi",
};

export default async function HotelsPage() {
  const result = await serverFetch<Hotel[]>("/hotels");

  if (!result.ok) {
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
          <AlertDescription>{result.message}</AlertDescription>
        </Alert>
      </div>
    );
  }

  const hotels = result.data ?? [];

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Hotels"
        description="Every property you manage. Open one to reach its dashboard."
        actions={<CreateHotelDialog />}
      />

      <HotelsGrid hotels={hotels} />
    </div>
  );
}
