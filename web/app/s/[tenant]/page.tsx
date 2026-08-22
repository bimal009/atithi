import type { Metadata } from "next";

import { getPublicSite } from "@/features/site/api/public-site";
import { PublicSiteView } from "@/features/site/components/public-site-view";
import { loadSite } from "@/features/site/lib/load-site";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ tenant: string }>;
}): Promise<Metadata> {
  const { tenant } = await params;
  const site = await getPublicSite(tenant);
  if (!site) return {};

  return {
    title: site.hotel.name,
    description: site.hotel.description ?? `Book your stay at ${site.hotel.name}.`,
  };
}

export default async function TenantSitePage({
  params,
}: {
  params: Promise<{ tenant: string }>;
}) {
  const { tenant } = await params;
  const site = await loadSite(tenant);

  return <PublicSiteView site={site} page="home" />;
}
