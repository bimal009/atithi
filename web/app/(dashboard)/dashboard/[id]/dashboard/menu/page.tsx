import type { Metadata } from "next"

import { MenuItemsGrid } from "@/features/tenant/menuItem/components/menu-items-grid"

export const metadata: Metadata = {
  title: "Dishes · Atithi",
}

export default async function MenuDishesPage({
  params,
}: {
  params: Promise<{ tenant: string }>
}) {
  const { tenant } = await params

  return <MenuItemsGrid tenant={tenant} />
}
