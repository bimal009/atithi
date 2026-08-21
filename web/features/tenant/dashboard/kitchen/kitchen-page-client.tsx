"use client"

import * as React from "react"
import { AlertCircleIcon } from "lucide-react"

import {
  useOrdersQuery,
  useResetKitchenPendingCount,
  useUpdateOrderStatus,
} from "@/features/tenant/order/client/useOrders"
import { useKotSocket } from "@/features/tenant/order/client/useKotSocket"
import { PageHeader } from "@/components/shared/page-header"
import { SectionCards } from "@/components/shared/section-cards"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Skeleton } from "@/components/ui/skeleton"
import { getErrorMessage } from "@/lib/axios"
import { KotBoard } from "@/features/tenant/dashboard/kot/kot-board"

function minutesSince(iso: string) {
  return Math.max(0, (Date.now() - new Date(iso).getTime()) / 60000)
}

const KITCHEN_QUERY_PARAMS = { limit: 100 }

function KitchenSkeleton() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <Skeleton className="h-7 w-40" />
        <Skeleton className="h-4 w-56" />
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-24 w-full" />
        ))}
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-64 w-full" />
        ))}
      </div>
    </div>
  )
}

export function KitchenPageClient({ tenant }: { tenant: string }) {
  const ordersQuery = useOrdersQuery(tenant, KITCHEN_QUERY_PARAMS)
  const updateStatus = useUpdateOrderStatus(tenant)
  const resetPendingCount = useResetKitchenPendingCount(tenant)

  useKotSocket(tenant, KITCHEN_QUERY_PARAMS)

  React.useEffect(() => {
    resetPendingCount.mutate()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  if (ordersQuery.isPending) {
    return <KitchenSkeleton />
  }

  if (ordersQuery.isError) {
    return (
      <div className="flex flex-col gap-6">
        <PageHeader title="KOT queue" description="Live kitchen order tickets." />
        <Alert variant="destructive">
          <AlertCircleIcon aria-hidden />
          <AlertTitle>Could not load orders</AlertTitle>
          <AlertDescription>{getErrorMessage(ordersQuery.error)}</AlertDescription>
        </Alert>
      </div>
    )
  }

  const orders = ordersQuery.data.orders

  function advance(orderId: string) {
    const order = orders.find((o) => o.id === orderId)
    const next =
      order?.status === "pending"
        ? "preparing"
        : order?.status === "preparing"
          ? "ready"
          : order?.status === "ready"
            ? "served"
            : undefined
    if (!next) return
    updateStatus.mutate({ id: orderId, status: next })
  }

  function cancel(orderId: string) {
    updateStatus.mutate({ id: orderId, status: "cancelled" })
  }

  const pending = orders.filter((o) => o.status === "pending")
  const preparing = orders.filter((o) => o.status === "preparing")
  const ready = orders.filter((o) => o.status === "ready")
  const active = [...pending, ...preparing]
  const avgWaitMinutes = active.length
    ? Math.round(active.reduce((sum, o) => sum + minutesSince(o.createdAt), 0) / active.length)
    : 0

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="KOT queue"
        description={`${pending.length + preparing.length} tickets in progress`}
        actions={
          <span className="flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium text-muted-foreground">
            <span className="relative flex size-1.5">
              <span className="absolute inline-flex size-full animate-ping rounded-full bg-primary opacity-75" />
              <span className="relative inline-flex size-1.5 rounded-full bg-primary" />
            </span>
            Live
          </span>
        }
      />

      <SectionCards
        stats={[
          { label: "Pending", value: String(pending.length) },
          { label: "Preparing", value: String(preparing.length) },
          { label: "Ready to serve", value: String(ready.length) },
          {
            label: "Avg. wait",
            value: `${avgWaitMinutes}m`,
            description: "Pending + preparing tickets",
          },
        ]}
      />

      <div className="overflow-x-auto pb-2">
        <KotBoard
          orders={orders}
          columns={["pending", "preparing", "ready"]}
          onAdvance={advance}
          onCancel={cancel}
        />
      </div>
    </div>
  )
}
