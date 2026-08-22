import { notFound } from "next/navigation";
import type { Metadata } from "next";

import { SiteShell } from "@/features/site/components/site-shell";
import { StayDetail } from "@/features/site/components/stay-detail";
import { dummyHotel, dummyRooms } from "@/features/site/lib/dummy-data";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ roomId: string }>;
}): Promise<Metadata> {
  const { roomId } = await params;
  const room = dummyRooms.find((r) => r.id === roomId);
  return { title: room ? `${room.name} — ${dummyHotel.name}` : dummyHotel.name };
}

export default async function RoomDetailPage({
  params,
}: {
  params: Promise<{ tenant: string; roomId: string }>;
}) {
  const { tenant, roomId } = await params;
  const room = dummyRooms.find((r) => r.id === roomId);
  if (!room) notFound();

  const related = dummyRooms.filter((r) => r.id !== room.id).slice(0, 2);

  return (
    <SiteShell tenant={tenant} active="rooms">
      <StayDetail
        kind="rooms"
        stay={room}
        related={related}
        hotelName={dummyHotel.name}
        hotelPhone={dummyHotel.phoneNumber}
        basePath={`/s/${tenant}`}
      />
    </SiteShell>
  );
}
