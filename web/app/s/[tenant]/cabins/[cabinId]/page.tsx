import { notFound } from "next/navigation";
import type { Metadata } from "next";

import { SiteShell } from "@/features/site/components/site-shell";
import { StayDetail } from "@/features/site/components/stay-detail";
import { dummyCabins, dummyHotel } from "@/features/site/lib/dummy-data";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ cabinId: string }>;
}): Promise<Metadata> {
  const { cabinId } = await params;
  const cabin = dummyCabins.find((c) => c.id === cabinId);
  return { title: cabin ? `${cabin.name} — ${dummyHotel.name}` : dummyHotel.name };
}

export default async function CabinDetailPage({
  params,
}: {
  params: Promise<{ tenant: string; cabinId: string }>;
}) {
  const { tenant, cabinId } = await params;
  const cabin = dummyCabins.find((c) => c.id === cabinId);
  if (!cabin) notFound();

  const related = dummyCabins.filter((c) => c.id !== cabin.id).slice(0, 2);

  return (
    <SiteShell tenant={tenant} active="cabins">
      <StayDetail
        kind="cabins"
        stay={cabin}
        related={related}
        hotelName={dummyHotel.name}
        hotelPhone={dummyHotel.phoneNumber}
        basePath={`/s/${tenant}`}
      />
    </SiteShell>
  );
}
