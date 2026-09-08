import type { Metadata } from "next"

import { MenuSetsGrid } from "@/features/tenant/menuSet/components/menu-sets-grid"

export const metadata: Metadata = {
  title: "Menu Set · Atithi",
}

export default async function MenuSetsPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  return <MenuSetsGrid id={id} />
}
