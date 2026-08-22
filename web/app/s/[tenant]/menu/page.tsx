import type { Metadata } from "next";

import { MenuPageContent } from "@/features/site/components/menu/menu-page-content";
import { SiteShell } from "@/features/site/components/site-shell";
import { dummyHotel } from "@/features/site/lib/dummy-data";

export function generateMetadata(): Metadata {
  return { title: `Menu — ${dummyHotel.name}` };
}

export default async function MenuPage({ params }: { params: Promise<{ tenant: string }> }) {
  const { tenant } = await params;

  return (
    <SiteShell tenant={tenant} active="menu">
      <MenuPageContent hotelName={dummyHotel.name} hotelPhone={dummyHotel.phoneNumber} />
    </SiteShell>
  );
}
