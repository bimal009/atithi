"use client"

import { UtensilsIcon } from "lucide-react"

import { KOT_ORDERS } from "@/lib/mock-data"
import { cn, formatCurrency } from "@/lib/utils"
import { PageHeader } from "@/components/shared/page-header"
import { SectionCards } from "@/components/shared/section-cards"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { usePageTitle } from "@/features/tenant/dashboard/page-title-context"

const TABLE_NAMES = Array.from({ length: 8 }, (_, i) => `Table ${i + 1}`)

export default function TablesPage() {
  usePageTitle("Tables")
  const occupiedTables = TABLE_NAMES.filter((name) =>
    KOT_ORDERS.some((o) => o.table === name && o.status !== "served")
  )
  const occupiedCount = occupiedTables.length
  const activeRevenue = KOT_ORDERS.filter(
    (o) => TABLE_NAMES.includes(o.table) && o.status !== "served"
  ).reduce(
    (sum, o) => sum + o.items.reduce((s, i) => s + i.price * i.quantity, 0),
    0
  )

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Tables"
        description={`${occupiedCount} of ${TABLE_NAMES.length} tables occupied`}
      />

      <SectionCards
        stats={[
          { label: "Total tables", value: String(TABLE_NAMES.length) },
          { label: "Occupied", value: String(occupiedCount) },
          { label: "Free", value: String(TABLE_NAMES.length - occupiedCount) },
          {
            label: "Active revenue",
            value: formatCurrency(activeRevenue),
            description: "From open tickets",
          },
        ]}
      />

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {TABLE_NAMES.map((name) => {
          const activeOrder = KOT_ORDERS.find(
            (o) => o.table === name && o.status !== "served"
          )
          const itemCount =
            activeOrder?.items.reduce((n, i) => n + i.quantity, 0) ?? 0
          const total =
            activeOrder?.items.reduce((s, i) => s + i.price * i.quantity, 0) ?? 0

          return (
            <Card
              key={name}
              className={cn(
                "gap-2",
                activeOrder && "border-primary/30 bg-primary/5"
              )}
            >
              <CardContent className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5 font-heading text-sm font-semibold">
                    <UtensilsIcon className="size-4 text-muted-foreground" />
                    {name}
                  </span>
                  <Badge variant={activeOrder ? "default" : "outline"}>
                    {activeOrder ? "Occupied" : "Free"}
                  </Badge>
                </div>
                {activeOrder ? (
                  <div className="flex flex-col text-xs text-muted-foreground">
                    <span className="tabular-nums">{activeOrder.kotNumber}</span>
                    <span>
                      {itemCount} items · {formatCurrency(total)}
                    </span>
                  </div>
                ) : (
                  <span className="text-xs text-muted-foreground">
                    No active order
                  </span>
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
