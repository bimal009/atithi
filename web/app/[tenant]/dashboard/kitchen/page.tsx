"use client"

import * as React from "react"

import { KOT_ORDERS } from "@/lib/mock-data"
import { useMockLoading } from "@/hooks/use-mock-loading"
import type { OrderStatus } from "@/types"
import { PageHeader } from "@/components/shared/page-header"
import { SectionCards } from "@/components/shared/section-cards"
import { Skeleton } from "@/components/ui/skeleton"
import { KotBoard } from "@/features/tenant/dashboard/kot/kot-board"

const NEXT_STATUS: Partial<Record<OrderStatus, OrderStatus>> = {
  pending: "preparing",
  preparing: "ready",
  ready: "served",
}

function minutesSince(iso: string) {
  return Math.max(0, (Date.now() - new Date(iso).getTime()) / 60000)
}

export default function KitchenQueuePage() {
  const loading = useMockLoading()
  const [orders, setOrders] = React.useState(KOT_ORDERS)

  function advance(orderId: string) {
    setOrders((prev) =>
      prev.map((order) => {
        if (order.id !== orderId) return order
        const next = NEXT_STATUS[order.status]
        return next ? { ...order, status: next } : order
      })
    )
  }

  const pending = orders.filter((o) => o.status === "pending")
  const preparing = orders.filter((o) => o.status === "preparing")
  const ready = orders.filter((o) => o.status === "ready")
  const active = [...pending, ...preparing]
  const avgWaitMinutes = active.length
    ? Math.round(
        active.reduce((sum, o) => sum + minutesSince(o.placedAt), 0) / active.length
      )
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
        loading={loading}
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

      {loading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-64 w-full" />
          ))}
        </div>
      ) : (
        <div className="overflow-x-auto pb-2">
          <KotBoard
            orders={orders}
            columns={["pending", "preparing", "ready"]}
            onAdvance={advance}
          />
        </div>
      )}
    </div>
  )
}
