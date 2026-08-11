"use client"

import { KOT_ORDERS } from "@/lib/mock-data"
import { useMockLoading } from "@/hooks/use-mock-loading"
import { PageHeader } from "@/components/shared/page-header"
import { Skeleton } from "@/components/ui/skeleton"
import { KotBoard } from "@/features/tenant/dashboard/kot/kot-board"

export default function OwnerKotPage() {
  const loading = useMockLoading()

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="KOT orders"
        description="Read-only view of every kitchen ticket across the floor."
      />

      {loading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-64 w-full" />
          ))}
        </div>
      ) : (
        <div className="overflow-x-auto pb-2">
          <KotBoard
            orders={KOT_ORDERS}
            columns={["pending", "preparing", "ready", "served"]}
          />
        </div>
      )}
    </div>
  )
}
