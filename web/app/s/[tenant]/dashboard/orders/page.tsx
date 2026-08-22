import { OrdersPageClient } from "@/features/tenant/dashboard/orders/orders-page-client"

export default async function OrdersPage({
  params,
}: {
  params: Promise<{ tenant: string }>
}) {
  const { tenant } = await params

  return <OrdersPageClient tenant={tenant} />
}
