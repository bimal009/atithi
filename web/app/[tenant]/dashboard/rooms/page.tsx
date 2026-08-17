import type { Metadata } from "next"

import { RoomsGrid } from "@/features/tenant/room/components/rooms-grid"

export const metadata: Metadata = {
  title: "Rooms · Atithi",
}

export default async function RoomsPage({
  params,
}: {
  params: Promise<{ tenant: string }>
}) {
  const { tenant } = await params

  return <RoomsGrid tenant={tenant} />
}
