import type { Metadata } from "next"

import { MenuSetsGrid } from "@/features/tenant/menuSet/components/menu-sets-grid"

export const metadata: Metadata = {
  title: "Menu Set · Atithi",
}

export default async function MenuSetsPage({
  params,
}: {
  params: Promise<{ tenant: string }>
}) {
  const { tenant } = await params

  return <MenuSetsGrid tenant={tenant} />
}
