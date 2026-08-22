import type { Metadata } from "next";

import { MenuPageContent2 } from "@/features/site/v2/components/menu-page-content-2";
import { SiteShell2 } from "@/features/site/v2/components/site-shell-2";
import { dummyHotel } from "@/features/site/lib/dummy-data";

export function generateMetadata(): Metadata {
  return { title: `Menu — ${dummyHotel.name}` };
}

export default async function MenuPage2({ params }: { params: Promise<{ tenant: string }> }) {
  const { tenant } = await params;

  return (
    <SiteShell2 tenant={tenant} active="menu">
      <MenuPageContent2 hotelName={dummyHotel.name} hotelPhone={dummyHotel.phoneNumber} />
    </SiteShell2>
  );
}
