import type { Metadata } from "next";

import { SiteShell } from "@/features/site/components/site-shell";
import { TableBookingForm } from "@/features/site/components/table-booking-form";
import { dummyHotel } from "@/features/site/lib/dummy-data";

export function generateMetadata(): Metadata {
  return { title: `Book a Table — ${dummyHotel.name}` };
}

export default async function TableBookingPage({ params }: { params: Promise<{ tenant: string }> }) {
  const { tenant } = await params;

  return (
    <SiteShell tenant={tenant} active="table-booking">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-4 py-14 sm:px-6 sm:py-16 lg:px-10">
        <div className="flex max-w-xl flex-col gap-2">
          <h1 className="font-[family-name:var(--font-site-display)] text-4xl font-semibold text-stone-900">
            Book a table
          </h1>
          <p className="text-stone-500">
            Send us your details and we&apos;ll confirm your table over WhatsApp.
          </p>
        </div>

        <TableBookingForm hotelName={dummyHotel.name} hotelPhone={dummyHotel.phoneNumber} />
      </div>
    </SiteShell>
  );
}
