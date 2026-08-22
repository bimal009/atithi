import { OverviewPageClient } from "@/features/tenant/dashboard/overview/overview-page-client"

export default async function OverviewPage({
  params,
}: {
  params: Promise<{ tenant: string }>
}) {
  const { tenant } = await params

  return <OverviewPageClient tenant={tenant} />
}
