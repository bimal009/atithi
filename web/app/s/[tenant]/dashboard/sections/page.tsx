import type { Metadata } from "next";

import { SectionsGrid } from "@/features/tenant/section/components/sections-grid";

export const metadata: Metadata = {
  title: "Sections · Atithi",
};

export default async function SectionsPage({
  params,
}: {
  params: Promise<{ tenant: string }>;
}) {
  const { tenant } = await params;

  return <SectionsGrid tenant={tenant} />;
}
