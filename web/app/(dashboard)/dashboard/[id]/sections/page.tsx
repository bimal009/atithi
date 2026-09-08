import type { Metadata } from "next";

import { SectionsGrid } from "@/features/tenant/section/components/sections-grid";

export const metadata: Metadata = {
  title: "Sections · Atithi",
};

export default async function SectionsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return <SectionsGrid id={id} />;
}
