"use client"

import * as React from "react"
import { UsersRoundIcon } from "lucide-react"

import { getGuests, type Guest } from "@/lib/mock-data"
import { formatCurrency, formatDate } from "@/lib/utils"
import { DataTable, type DataTableColumn } from "@/components/shared/data-table"
import { PageHeader } from "@/components/shared/page-header"
import { SectionCards } from "@/components/shared/section-cards"
import { Badge } from "@/components/ui/badge"
import { AddCustomerDialog } from "@/features/tenant/dashboard/customers/add-customer-dialog"
import { usePageTitle } from "@/features/tenant/dashboard/page-title-context"

export default function CustomersPage() {
  usePageTitle("Customers")
  const [guests, setGuests] = React.useState<Guest[]>(getGuests)
  const repeatGuests = guests.filter((g) => g.visits > 1)
  const totalSpend = guests.reduce((sum, g) => sum + g.totalSpend, 0)

  const columns: DataTableColumn<Guest>[] = [
    {
      key: "name",
      header: "Guest",
      headerClassName: "pl-5",
      cellClassName: "pl-5",
      cell: (g) => (
        <div className="flex flex-col">
          <span className="font-medium">{g.name}</span>
          <span className="text-xs text-muted-foreground">{g.phone}</span>
        </div>
      ),
    },
    {
      key: "visits",
      header: "Visits",
      cell: (g) => (
        <Badge variant={g.visits > 1 ? "default" : "outline"} className="tabular-nums">
          {g.visits}
        </Badge>
      ),
    },
    {
      key: "lastStay",
      header: "Last stay",
      cell: (g) => <span className="text-muted-foreground">{formatDate(g.lastStay)}</span>,
    },
    {
      key: "spend",
      header: "",
      headerClassName: "pr-5",
      cellClassName: "pr-5 text-right font-medium tabular-nums",
      cell: (g) => formatCurrency(g.totalSpend),
    },
  ]

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Customers"
        description={`${guests.length} guests on record`}
        actions={
          <AddCustomerDialog
            onCreate={(guest) => setGuests((prev) => [guest, ...prev])}
          />
        }
      />

      <SectionCards
        stats={[
          { label: "Total guests", value: String(guests.length) },
          {
            label: "Repeat guests",
            value: String(repeatGuests.length),
            description: "Stayed more than once",
          },
          {
            label: "Lifetime revenue",
            value: formatCurrency(totalSpend),
            description: "From all guest stays",
          },
          {
            label: "Avg. spend / guest",
            value: formatCurrency(
              guests.length ? Math.round(totalSpend / guests.length) : 0
            ),
          },
        ]}
      />

      <DataTable
        columns={columns}
        data={guests}
        getRowId={(g) => g.id}
        searchPlaceholder="Search guests…"
        searchFn={(g, q) => `${g.name} ${g.phone}`.toLowerCase().includes(q)}
        emptyIcon={UsersRoundIcon}
        emptyTitle="No guests found"
        emptyDescription="Try a different search term."
      />
    </div>
  )
}
