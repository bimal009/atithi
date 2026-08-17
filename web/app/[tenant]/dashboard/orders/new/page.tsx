import { NewOrderPageClient } from "@/features/tenant/dashboard/orders/new-order-page-client"

export default async function NewOrderPage({
  params,
}: {
  params: Promise<{ tenant: string }>
}) {
  const { tenant } = await params

  return <NewOrderPageClient tenant={tenant} />
}
