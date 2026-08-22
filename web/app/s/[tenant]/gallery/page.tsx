import type { Metadata } from "next";

import { PublicSiteView } from "@/features/site/components/public-site-view";
import { loadSite } from "@/features/site/lib/load-site";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ tenant: string }>;
}): Promise<Metadata> {
  const { tenant } = await params;
  const site = await loadSite(tenant);
  return { title: `Gallery — ${site.hotel.name}` };
}

export default async function GalleryPage({
  params,
}: {
  params: Promise<{ tenant: string }>;
}) {
  const { tenant } = await params;
  const site = await loadSite(tenant);

  return <PublicSiteView site={site} page="gallery" />;
}
