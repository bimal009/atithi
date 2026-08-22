import type { Metadata } from "next";

import { SiteShell2 } from "@/features/site/v2/components/site-shell-2";
import { StayCard2 } from "@/features/site/v2/components/stay-card-2";
import { dummyHotel, dummyRooms } from "@/features/site/lib/dummy-data";

export function generateMetadata(): Metadata {
  return { title: `Rooms — ${dummyHotel.name}` };
}

export default async function RoomsPage2({ params }: { params: Promise<{ tenant: string }> }) {
  const { tenant } = await params;
  const basePath = `/s/${tenant}/2`;

  return (
    <SiteShell2 tenant={tenant} active="rooms">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-4 py-14 sm:px-6 sm:py-16 lg:px-10">
        <div className="flex flex-col gap-2">
          <h1 className="font-[family-name:var(--font-site2-display)] text-4xl font-semibold">Rooms</h1>
          <p className="text-[#17181A]/55">Considered spaces, dressed simply, built for rest.</p>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {dummyRooms.map((room) => (
            <StayCard2 key={room.id} stay={room} basePath={basePath} kind="rooms" />
          ))}
        </div>
      </div>
    </SiteShell2>
  );
}
