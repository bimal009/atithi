import type { Metadata } from "next";

import { SiteShell } from "@/features/site/components/site-shell";
import { StayCard } from "@/features/site/components/stay-card";
import { dummyHotel, dummyRooms } from "@/features/site/lib/dummy-data";

export function generateMetadata(): Metadata {
  return { title: `Rooms — ${dummyHotel.name}` };
}

export default async function RoomsPage({ params }: { params: Promise<{ tenant: string }> }) {
  const { tenant } = await params;
  const basePath = `/s/${tenant}`;

  return (
    <SiteShell tenant={tenant} active="rooms">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-4 py-14 sm:px-6 sm:py-16 lg:px-10">
        <div className="flex flex-col gap-2">
          <h1 className="font-[family-name:var(--font-site-display)] text-4xl font-semibold text-stone-900">
            Rooms
          </h1>
          <p className="text-stone-500">Considered spaces, dressed simply, built for rest.</p>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {dummyRooms.map((room) => (
            <StayCard key={room.id} stay={room} basePath={basePath} kind="rooms" />
          ))}
        </div>
      </div>
    </SiteShell>
  );
}
