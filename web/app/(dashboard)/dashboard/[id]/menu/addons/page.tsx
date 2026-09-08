import type { Metadata } from "next"

import { AddOnsGrid } from "@/features/tenant/addOn/components/add-ons-grid"

export const metadata: Metadata = {
  title: "Add-ons · Atithi",
}

export default async function AddOnsPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  return <AddOnsGrid id={id} />
}
