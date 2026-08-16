"use client"

import * as React from "react"
import { PackageOpenIcon } from "lucide-react"

import { MENU_ITEMS, MENU_SETS } from "@/lib/mock-data"
import { formatCurrency } from "@/lib/utils"
import { DataTable, type DataTableColumn } from "@/components/shared/data-table"
import { PageHeader } from "@/components/shared/page-header"
import { SectionCards } from "@/components/shared/section-cards"
import { StatusBadge } from "@/components/shared/status-badge"
import { AddMenuSetSheet } from "@/features/tenant/dashboard/menu/add-menu-set-sheet"
import type { MenuSet } from "@/types"

function itemNames(itemIds: string[]) {
  const counts = new Map<string, number>()
  for (const id of itemIds) {
    const name = MENU_ITEMS.find((m) => m.id === id)?.name ?? "Unknown"
    counts.set(name, (counts.get(name) ?? 0) + 1)
  }
  return Array.from(counts.entries())
    .map(([name, count]) => (count > 1 ? `${count}× ${name}` : name))
    .join(", ")
}

export default function MenuSetsPage() {
  const [sets, setSets] = React.useState(MENU_SETS)

  const columns: DataTableColumn<MenuSet>[] = [
    {
      key: "name",
      header: "Set",
      headerClassName: "pl-5",
      cellClassName: "pl-5",
      cell: (s) => (
        <div className="flex flex-col">
          <span className="font-medium">{s.name}</span>
          <span className="text-xs text-muted-foreground">
            {itemNames(s.itemIds)}
          </span>
        </div>
      ),
    },
    {
      key: "price",
      header: "Price",
      cell: (s) => <span className="tabular-nums">{formatCurrency(s.price)}</span>,
    },
    {
      key: "status",
      header: "",
      headerClassName: "pr-5",
      cellClassName: "pr-5 text-right",
      cell: (s) => <StatusBadge status={s.available ? "available" : "unavailable"} />,
    },
  ]

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Menu Set"
        description="Combo deals that bundle a few dishes at a special price."
        actions={
          <AddMenuSetSheet onCreate={(set) => setSets((prev) => [...prev, set])} />
        }
      />

      <SectionCards
        stats={[
          { label: "Total sets", value: String(sets.length) },
          {
            label: "Available",
            value: String(sets.filter((s) => s.available).length),
          },
          {
            label: "Avg. set price",
            value: formatCurrency(
              sets.length
                ? Math.round(sets.reduce((sum, s) => sum + s.price, 0) / sets.length)
                : 0
            ),
          },
        ]}
      />

      <DataTable
        columns={columns}
        data={sets}
        getRowId={(s) => s.id}
        searchPlaceholder="Search menu sets…"
        searchFn={(s, q) => s.name.toLowerCase().includes(q)}
        emptyIcon={PackageOpenIcon}
        emptyTitle="No menu sets yet"
        emptyDescription="Bundle a few dishes together to create your first combo."
      />
    </div>
  )
}
