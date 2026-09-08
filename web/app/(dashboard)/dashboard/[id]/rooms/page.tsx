import type { Metadata } from "next"

import { RoomsGrid } from "@/features/tenant/room/components/rooms-grid"

export const metadata: Metadata = {
  title: "Rooms · Atithi",
}

export default async function RoomsPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  return <RoomsGrid id={id} />
}
