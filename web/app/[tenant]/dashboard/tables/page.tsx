import type { Metadata } from "next"

import { TablesGrid } from "@/features/tenant/table/components/tables-grid"

export const metadata: Metadata = {
  title: "Tables · Atithi",
}

export default async function TablesPage({
  params,
}: {
  params: Promise<{ tenant: string }>
}) {
  const { tenant } = await params

  return <TablesGrid tenant={tenant} />
}
