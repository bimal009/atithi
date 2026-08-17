"use client"

import * as React from "react"
import Link from "next/link"
import { ChefHatIcon, PlusIcon } from "lucide-react"

import { KOT_ORDERS } from "@/lib/mock-data"
import { formatCurrency, orderTotal, timeAgo } from "@/lib/utils"
import type { KotOrder, OrderStatus } from "@/types"
import { DataTable, type DataTableColumn } from "@/components/shared/data-table"
import { PageHeader } from "@/components/shared/page-header"
import { SectionCards } from "@/components/shared/section-cards"
import { StatusBadge } from "@/components/shared/status-badge"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

const STATUS_FILTERS: Array<{ value: "all" | OrderStatus; label: string }> = [
  { value: "all", label: "All statuses" },
  { value: "pending", label: "Pending" },
  { value: "preparing", label: "Preparing" },
  { value: "ready", label: "Ready" },
  { value: "served", label: "Served" },
]

const STATUS_ITEMS = Object.fromEntries(STATUS_FILTERS.map((o) => [o.value, o.label]))

export function OrdersPageClient({ tenant }: { tenant: string }) {
  const orders = KOT_ORDERS
  const [status, setStatus] = React.useState<"all" | OrderStatus>("all")

  const filtered = orders
    .filter((o) => status === "all" || o.status === status)
    .sort((a, b) => +new Date(b.placedAt) - +new Date(a.placedAt))

  const columns: DataTableColumn<KotOrder>[] = [
    {
      key: "ticket",
      header: "Ticket",
      headerClassName: "pl-5",
      cellClassName: "pl-5 font-medium tabular-nums",
      cell: (o) => o.kotNumber,
    },
    {
      key: "table",
      header: "Table",
      cell: (o) => (
        <div className="flex flex-col">
          <span>{o.table}</span>
          <span className="text-xs text-muted-foreground capitalize">
            {o.origin.replace("-", " ")}
          </span>
        </div>
      ),
    },
    {
      key: "items",
      header: "Items",
      cell: (o) => (
        <span className="text-muted-foreground">
          {o.items.reduce((n, i) => n + i.quantity, 0)} items ·{" "}
          {formatCurrency(orderTotal(o.items))}
        </span>
      ),
    },
    {
      key: "waiter",
      header: "Waiter",
      cell: (o) => <span className="text-muted-foreground">{o.waiterName}</span>,
    },
    {
      key: "placed",
      header: "Placed",
      cell: (o) => <span className="text-muted-foreground">{timeAgo(o.placedAt)}</span>,
    },
    {
      key: "status",
      header: "",
      headerClassName: "pr-5",
      cellClassName: "pr-5 text-right",
      cell: (o) => <StatusBadge status={o.status} />,
    },
  ]

  const activeCount = orders.filter((o) => o.status !== "served").length

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Orders"
        description={
          <span className="flex items-center gap-2">
            {orders.length} total tickets
            <Badge variant="outline">{activeCount} active</Badge>
          </span>
        }
        actions={
          <Button
            data-icon="inline-start"
            nativeButton={false}
            render={<Link href={`/${tenant}/dashboard/orders/new`} />}
          >
            <PlusIcon aria-hidden />
            New Order
          </Button>
        }
      />

      <SectionCards
        stats={[
          {
            label: "Pending",
            value: String(orders.filter((o) => o.status === "pending").length),
          },
          {
            label: "Preparing",
            value: String(orders.filter((o) => o.status === "preparing").length),
          },
          {
            label: "Ready",
            value: String(orders.filter((o) => o.status === "ready").length),
          },
          {
            label: "Served today",
            value: String(orders.filter((o) => o.status === "served").length),
          },
        ]}
      />

      <DataTable
        columns={columns}
        data={filtered}
        getRowId={(o) => o.id}
        searchPlaceholder="Search ticket, table, or waiter…"
        searchFn={(o, q) =>
          `${o.kotNumber} ${o.table} ${o.waiterName}`.toLowerCase().includes(q)
        }
        toolbar={
          <Select items={STATUS_ITEMS} value={status} onValueChange={(v) => setStatus((v ?? "all") as typeof status)}>
            <SelectTrigger className="w-full sm:w-44">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {STATUS_FILTERS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        }
        emptyIcon={ChefHatIcon}
        emptyTitle="No orders found"
        emptyDescription="Try a different status filter."
      />
    </div>
  )
}
