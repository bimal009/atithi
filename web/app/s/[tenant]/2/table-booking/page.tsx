import type { Metadata } from "next";

import { SiteShell2 } from "@/features/site/v2/components/site-shell-2";
import { TableBookingForm2 } from "@/features/site/v2/components/table-booking-form-2";
import { dummyHotel } from "@/features/site/lib/dummy-data";

export function generateMetadata(): Metadata {
  return { title: `Book a Table — ${dummyHotel.name}` };
}

export default async function TableBookingPage2({ params }: { params: Promise<{ tenant: string }> }) {
  const { tenant } = await params;

  return (
    <SiteShell2 tenant={tenant} active="table-booking">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-4 py-14 sm:px-6 sm:py-16 lg:px-10">
        <div className="flex max-w-xl flex-col gap-2">
          <h1 className="font-[family-name:var(--font-site2-display)] text-4xl font-semibold">Book a table</h1>
          <p className="text-[#17181A]/55">
            Send us your details and we&apos;ll confirm your table over WhatsApp.
          </p>
        </div>

        <TableBookingForm2 hotelName={dummyHotel.name} hotelPhone={dummyHotel.phoneNumber} />
      </div>
    </SiteShell2>
  );
}
