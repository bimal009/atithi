import { notFound } from "next/navigation";

import { getPublicSite, type PublicSiteResponse } from "../api/public-site";

export async function loadSite(tenant: string): Promise<PublicSiteResponse> {
  const site = await getPublicSite(tenant);
  if (!site) notFound();
  return site;
}
