import { KitchenPageClient } from "@/features/tenant/dashboard/kitchen/kitchen-page-client"

export default async function KitchenQueuePage({
  params,
}: {
  params: Promise<{ tenant: string }>
}) {
  const { tenant } = await params

  return <KitchenPageClient tenant={tenant} />
}
