import { notFound } from "next/navigation";
import type { Metadata } from "next";

import { PublicSiteView } from "@/features/site/components/public-site-view";
import { loadSite } from "@/features/site/lib/load-site";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ tenant: string; cabinId: string }>;
}): Promise<Metadata> {
  const { tenant, cabinId } = await params;
  const site = await loadSite(tenant);
  const cabin = site.cabins.find((c) => c.id === cabinId);
  if (!cabin) return {};
  return { title: `${cabin.name} — ${site.hotel.name}` };
}

export default async function CabinDetailPage({
  params,
}: {
  params: Promise<{ tenant: string; cabinId: string }>;
}) {
  const { tenant, cabinId } = await params;
  const site = await loadSite(tenant);
  if (!site.cabins.some((c) => c.id === cabinId)) notFound();

  return <PublicSiteView site={site} page="cabin-detail" detailId={cabinId} />;
}
