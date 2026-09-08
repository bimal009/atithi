import type { Metadata } from "next";

import { SubMenusPageClient } from "@/features/tenant/subMenu/components/sub-menus-page-client";

export const metadata: Metadata = {
  title: "Sub Menu · Atithi",
};

export default async function SubMenuPage({
  params,
}: {
  params: Promise<{ tenant: string }>;
}) {
  const { tenant } = await params;

  return <SubMenusPageClient tenant={tenant} />;
}
