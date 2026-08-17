import type { Metadata } from "next"

import { CabinsGrid } from "@/features/tenant/cabin/components/cabins-grid"

export const metadata: Metadata = {
  title: "Cabins · Atithi",
}

export default async function CabinsPage({
  params,
}: {
  params: Promise<{ tenant: string }>
}) {
  const { tenant } = await params

  return <CabinsGrid tenant={tenant} />
}
