import type { Metadata } from "next";
import { AlertCircleIcon } from "lucide-react";

import { PageHeader } from "@/components/shared/page-header";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { listHotels } from "@/features/hotel/api/hotel";
import { CreateHotelDialog } from "@/features/hotel/components/create-hotel-dialog";
import { HotelsGrid } from "@/features/hotel/components/hotels-grid";
import type { Hotel } from "@/features/hotel/types";
import { getErrorMessage } from "@/lib/axios";

export const metadata: Metadata = {
  title: "Hotels · Atithi",
};

async function loadHotels() {
  try {
    const { data } = await listHotels();
    return { ok: true as const, hotels: data };
  } catch (error) {
    return { ok: false as const, message: getErrorMessage(error) };
  }
}

export default async function HotelsPage() {
  const result = await loadHotels();

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

  const hotels: Hotel[] = result.hotels;

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
