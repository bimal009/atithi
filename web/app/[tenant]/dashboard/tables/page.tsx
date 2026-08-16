"use client"

import * as React from "react"
import { UtensilsIcon } from "lucide-react"

import { KOT_ORDERS, TABLES } from "@/lib/mock-data"
import { cn, formatCurrency, orderTotal } from "@/lib/utils"
import type { Table } from "@/types"
import { PageHeader } from "@/components/shared/page-header"
import { SectionCards } from "@/components/shared/section-cards"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { AddTableDialog } from "@/features/tenant/dashboard/tables/add-table-dialog"

const SECTION_LABELS: Record<Table["section"], string> = {
  indoor: "Indoor",
  outdoor: "Outdoor",
  rooftop: "Rooftop",
}

export default function TablesPage() {
  const [tables, setTables] = React.useState(TABLES)

  const occupiedTables = tables.filter((table) =>
    KOT_ORDERS.some((o) => o.table === table.name && o.status !== "served")
  )
  const occupiedCount = occupiedTables.length
  const activeRevenue = KOT_ORDERS.filter(
    (o) => tables.some((t) => t.name === o.table) && o.status !== "served"
  ).reduce((sum, o) => sum + orderTotal(o.items), 0)

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Tables"
        description={`${occupiedCount} of ${tables.length} tables occupied`}
        actions={
          <AddTableDialog onCreate={(table) => setTables((prev) => [...prev, table])} />
        }
      />

      <SectionCards
        stats={[
          { label: "Total tables", value: String(tables.length) },
          { label: "Occupied", value: String(occupiedCount) },
          { label: "Free", value: String(tables.length - occupiedCount) },
          {
            label: "Active revenue",
            value: formatCurrency(activeRevenue),
            description: "From open tickets",
          },
        ]}
      />

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {tables.map((table) => {
          const activeOrder = KOT_ORDERS.find(
            (o) => o.table === table.name && o.status !== "served"
          )
          const itemCount =
            activeOrder?.items.reduce((n, i) => n + i.quantity, 0) ?? 0
          const total = activeOrder ? orderTotal(activeOrder.items) : 0

          return (
            <Card
              key={table.id}
              className={cn(
                "gap-2",
                activeOrder && "border-primary/30 bg-primary/5"
              )}
            >
              <CardContent className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5 font-heading text-sm font-semibold">
                    <UtensilsIcon className="size-4 text-muted-foreground" />
                    {table.name}
                  </span>
                  <Badge variant={activeOrder ? "default" : "outline"}>
                    {activeOrder ? "Occupied" : "Free"}
                  </Badge>
                </div>
                <span className="text-xs text-muted-foreground">
                  {SECTION_LABELS[table.section]} · Seats {table.capacity}
                </span>
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
