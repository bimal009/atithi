"use client"

import * as React from "react"
import { AlertCircleIcon, ChefHatIcon } from "lucide-react"

import type { Order, OrderStatus } from "@/features/tenant/order/types"
import { useOrdersQuery } from "@/features/tenant/order/client/useOrders"
import { NewOrderDialog } from "./new-order-dialog"
import { formatCurrency, timeAgo } from "@/lib/utils"
import { getErrorMessage } from "@/lib/axios"
import { DataTable, type DataTableColumn } from "@/components/shared/data-table"
import { PageHeader } from "@/components/shared/page-header"
import { SectionCards } from "@/components/shared/section-cards"
import { StatusBadge } from "@/components/shared/status-badge"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
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
  { value: "cancelled", label: "Cancelled" },
]

const STATUS_ITEMS = Object.fromEntries(STATUS_FILTERS.map((o) => [o.value, o.label]))

function destinationLabel(order: Order) {
  if (order.tableName) return { primary: order.tableName, secondary: "Dine-in" }
  if (order.roomNumber) return { primary: `Room ${order.roomNumber}`, secondary: "Room service" }
  if (order.cabinName) return { primary: order.cabinName, secondary: "Cabin" }
  return { primary: "—", secondary: "" }
}

function OrdersSkeleton() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-2">
          <Skeleton className="h-7 w-32" />
          <Skeleton className="h-4 w-48" />
        </div>
        <Skeleton className="h-9 w-36" />
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <Skeleton key={index} className="h-24 w-full" />
        ))}
      </div>
      <div className="flex flex-col gap-3">
        <Skeleton className="h-9 w-full sm:max-w-xs" />
        <Skeleton className="h-96 w-full" />
      </div>
    </div>
  )
}

export function OrdersPageClient({ tenant }: { tenant: string }) {
  const [status, setStatus] = React.useState<"all" | OrderStatus>("all")

  // Unfiltered — drives the overview stat cards regardless of the selected filter.
  const allOrdersQuery = useOrdersQuery(tenant)
  // Filtered server-side by the selected status; dedupes with the query above when "all" is selected.
  const filteredOrdersQuery = useOrdersQuery(tenant, status === "all" ? undefined : status)

  if (allOrdersQuery.isPending) {
    return <OrdersSkeleton />
  }

  if (allOrdersQuery.isError) {
    return (
      <div className="flex flex-col gap-6">
        <PageHeader title="Orders" description="Kitchen order tickets, live." />
        <Alert variant="destructive">
          <AlertCircleIcon aria-hidden />
          <AlertTitle>Could not load orders</AlertTitle>
          <AlertDescription>{getErrorMessage(allOrdersQuery.error)}</AlertDescription>
        </Alert>
      </div>
    )
  }

  const orders = allOrdersQuery.data.orders
  const filtered = filteredOrdersQuery.data?.orders ?? []

  const columns: DataTableColumn<Order>[] = [
    {
      key: "ticket",
      header: "Ticket",
      headerClassName: "pl-5",
      cellClassName: "pl-5 font-medium tabular-nums",
      cell: (o) => `#${o.id.slice(0, 8).toUpperCase()}`,
    },
    {
      key: "destination",
      header: "Table / Room / Cabin",
      cell: (o) => {
        const dest = destinationLabel(o)
        return (
          <div className="flex flex-col">
            <span>{dest.primary}</span>
            {dest.secondary && (
              <span className="text-xs text-muted-foreground">{dest.secondary}</span>
            )}
          </div>
        )
      },
    },
    {
      key: "items",
      header: "Items",
      cell: (o) => (
        <span className="text-muted-foreground">
          {o.items.reduce((n, i) => n + i.quantity, 0)} items ·{" "}
          {formatCurrency(o.totalAmount)}
        </span>
      ),
    },
    {
      key: "waiter",
      header: "Waiter",
      cell: (o) => <span className="text-muted-foreground">{o.createdByName}</span>,
    },
    {
      key: "placed",
      header: "Placed",
      cell: (o) => <span className="text-muted-foreground">{timeAgo(o.createdAt)}</span>,
    },
    {
      key: "status",
      header: "",
      headerClassName: "pr-5",
      cellClassName: "pr-5 text-right",
      cell: (o) => <StatusBadge status={o.status} />,
    },
  ]

  const activeCount = orders.filter(
    (o) => o.status !== "served" && o.status !== "cancelled",
  ).length

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
        actions={<NewOrderDialog tenant={tenant} />}
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
            label: "Served",
            value: String(orders.filter((o) => o.status === "served").length),
          },
        ]}
      />

      <DataTable
        columns={columns}
        data={filtered}
        getRowId={(o) => o.id}
        loading={filteredOrdersQuery.isFetching}
        searchPlaceholder="Search ticket, table, or waiter…"
        searchFn={(o, q) =>
          `${o.id} ${o.tableName ?? ""} ${o.roomNumber ?? ""} ${o.cabinName ?? ""} ${o.createdByName}`
            .toLowerCase()
            .includes(q)
        }
        toolbar={
          <Select
            items={STATUS_ITEMS}
            value={status}
            onValueChange={(v) => setStatus((v ?? "all") as typeof status)}
          >
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
