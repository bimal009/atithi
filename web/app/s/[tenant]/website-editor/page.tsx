import type { Metadata } from "next";

import { WebsitePageClient } from "@/features/tenant/website/components/website-page-client";

export const metadata: Metadata = {
  title: "Website · Atithi",
};

export default async function WebsiteEditorPage({
  params,
}: {
  params: Promise<{ tenant: string }>;
}) {
  const { tenant } = await params;

  return <WebsitePageClient tenant={tenant} />;
}
