import { OverviewPageClient } from "@/features/tenant/dashboard/overview/overview-page-client"

export default async function OverviewPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  return <OverviewPageClient id={id} />
}
