import { OrdersPageClient } from "@/features/tenant/dashboard/orders/orders-page-client"

export default async function OrdersPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  return <OrdersPageClient id={id} />
}
