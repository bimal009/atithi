import { notFound } from "next/navigation";
import type { Metadata } from "next";

import { PublicSiteView } from "@/features/site/components/public-site-view";
import { loadSite } from "@/features/site/lib/load-site";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ tenant: string; roomId: string }>;
}): Promise<Metadata> {
  const { tenant, roomId } = await params;
  const site = await loadSite(tenant);
  const room = site.roomTypes.find((r) => r.id === roomId);
  if (!room) return {};
  return { title: `${room.name} — ${site.hotel.name}` };
}

export default async function RoomDetailPage({
  params,
}: {
  params: Promise<{ tenant: string; roomId: string }>;
}) {
  const { tenant, roomId } = await params;
  const site = await loadSite(tenant);
  if (!site.roomTypes.some((r) => r.id === roomId)) notFound();

  return <PublicSiteView site={site} page="room-detail" detailId={roomId} />;
}
