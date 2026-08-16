"use client"

import * as React from "react"
import { SparkleIcon } from "lucide-react"

import { ADD_ONS } from "@/lib/mock-data"
import { formatCurrency } from "@/lib/utils"
import type { AddOn } from "@/types"
import { DataTable, type DataTableColumn } from "@/components/shared/data-table"
import { PageHeader } from "@/components/shared/page-header"
import { SectionCards } from "@/components/shared/section-cards"
import { StatusBadge } from "@/components/shared/status-badge"
import { AddAddOnSheet } from "@/features/tenant/dashboard/menu/add-addon-sheet"

export default function AddOnsPage() {
  const [addOns, setAddOns] = React.useState(ADD_ONS)

  const columns: DataTableColumn<AddOn>[] = [
    {
      key: "name",
      header: "Add-on",
      headerClassName: "pl-5",
      cellClassName: "pl-5 font-medium",
      cell: (a) => a.name,
    },
    {
      key: "price",
      header: "Price",
      cell: (a) => (
        <span className="tabular-nums">
          {a.price === 0 ? "Free" : formatCurrency(a.price)}
        </span>
      ),
    },
    {
      key: "status",
      header: "",
      headerClassName: "pr-5",
      cellClassName: "pr-5 text-right",
      cell: (a) => <StatusBadge status={a.available ? "available" : "unavailable"} />,
    },
  ]

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Ad-Ons & Extras"
        description="Optional extras guests can add to a dish when ordering."
        actions={
          <AddAddOnSheet onCreate={(addOn) => setAddOns((prev) => [...prev, addOn])} />
        }
      />

      <SectionCards
        stats={[
          { label: "Total add-ons", value: String(addOns.length) },
          {
            label: "Available",
            value: String(addOns.filter((a) => a.available).length),
          },
          {
            label: "Free add-ons",
            value: String(addOns.filter((a) => a.price === 0).length),
          },
        ]}
      />

      <DataTable
        columns={columns}
        data={addOns}
        getRowId={(a) => a.id}
        searchPlaceholder="Search add-ons…"
        searchFn={(a, q) => a.name.toLowerCase().includes(q)}
        emptyIcon={SparkleIcon}
        emptyTitle="No add-ons yet"
        emptyDescription="Add your first add-on to offer it during ordering."
      />
    </div>
  )
}
