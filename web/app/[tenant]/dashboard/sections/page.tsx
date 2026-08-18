import type { Metadata } from "next";

import { SectionsPageClient } from "@/features/tenant/section/components/sections-page-client";

export const metadata: Metadata = {
  title: "Sections · Atithi",
};

export default async function SectionsPage({
  params,
}: {
  params: Promise<{ tenant: string }>;
}) {
  const { tenant } = await params;

  return <SectionsPageClient tenant={tenant} />;
}
