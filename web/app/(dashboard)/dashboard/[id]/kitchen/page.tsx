import { KitchenPageClient } from "@/features/tenant/dashboard/kitchen/kitchen-page-client"

export default async function KitchenQueuePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  return <KitchenPageClient id={id} />
}
