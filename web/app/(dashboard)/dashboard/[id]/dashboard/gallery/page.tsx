import type { Metadata } from "next";

import { GalleryPageClient } from "@/features/tenant/gallery/components/gallery-page-client";

export const metadata: Metadata = {
  title: "Gallery · Atithi",
};

export default async function GalleryPage({
  params,
}: {
  params: Promise<{ tenant: string }>;
}) {
  const { tenant } = await params;

  return <GalleryPageClient tenant={tenant} />;
}
