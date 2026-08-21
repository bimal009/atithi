"use client"

import * as React from "react"
import { AlertCircleIcon, ChefHatIcon, MoreVerticalIcon, PencilIcon, PlusIcon, Trash2Icon } from "lucide-react"
import { parseAsInteger, parseAsString, parseAsStringLiteral, useQueryState } from "nuqs"

import type { Order, OrderStatus } from "@/features/tenant/order/types"
import { useOrdersQuery, useRemoveOrder, useUpdateOrderStatus } from "@/features/tenant/order/client/useOrders"
import { OrderFormDialog } from "./order-form-dialog"
import { formatCurrency, timeAgo } from "@/lib/utils"
import { getErrorMessage } from "@/lib/axios"
import { useDebouncedValue } from "@/hooks/use-debounced-value"
import { DataTable, type DataTableColumn } from "@/components/shared/data-table"
import { PageHeader } from "@/components/shared/page-header"
import { SectionCards } from "@/components/shared/section-cards"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
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

const STATUS_OPTIONS: OrderStatus[] = ["pending", "preparing", "ready", "served", "cancelled"]
const STATUS_OPTION_ITEMS = Object.fromEntries(STATUS_OPTIONS.map((s) => [s, STATUS_ITEMS[s]]))

const searchParser = parseAsString.withDefault("").withOptions({ history: "replace" })
const statusParser = parseAsStringLiteral([
  "all",
  "pending",
  "preparing",
  "ready",
  "served",
  "cancelled",
] as const)
  .withDefault("all")
  .withOptions({ history: "replace" })
const pageParser = parseAsInteger.withDefault(1).withOptions({ history: "replace" })

const PAGE_SIZE = 10

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
  const [search, setSearch] = useQueryState("q", searchParser)
  const [status, setStatus] = useQueryState("status", statusParser)
  const [page, setPage] = useQueryState("page", pageParser)
  const [creating, setCreating] = React.useState(false)
  const [editingOrder, setEditingOrder] = React.useState<Order | null>(null)
  const [pendingDelete, setPendingDelete] = React.useState<Order | null>(null)

  const debouncedSearch = useDebouncedValue(search, 400)

  // Grand total + per-status counts for the overview cards — cheap `limit: 1`
  // fetches, so they stay accurate regardless of how many orders exist.
  const totalQuery = useOrdersQuery(tenant, { limit: 1 })
  const pendingQuery = useOrdersQuery(tenant, { status: "pending", limit: 1 })
  const preparingQuery = useOrdersQuery(tenant, { status: "preparing", limit: 1 })
  const readyQuery = useOrdersQuery(tenant, { status: "ready", limit: 1 })
  const servedQuery = useOrdersQuery(tenant, { status: "served", limit: 1 })

  // The actual page of orders shown in the table, filtered/searched/paginated server-side.
  const listQuery = useOrdersQuery(tenant, {
    search: debouncedSearch,
    status: status === "all" ? undefined : status,
    page,
    limit: PAGE_SIZE,
  })

  const updateStatus = useUpdateOrderStatus(tenant)
  const remove = useRemoveOrder(tenant)

  const resetToFirstPage = () => {
    if (page !== 1) setPage(1)
  }

  if (totalQuery.isPending) {
    return <OrdersSkeleton />
  }

  if (totalQuery.isError) {
    return (
      <div className="flex flex-col gap-6">
        <PageHeader title="Orders" description="Kitchen order tickets, live." />
        <Alert variant="destructive">
          <AlertCircleIcon aria-hidden />
          <AlertTitle>Could not load orders</AlertTitle>
          <AlertDescription>{getErrorMessage(totalQuery.error)}</AlertDescription>
        </Alert>
      </div>
    )
  }

  const total = totalQuery.data.total
  const pendingCount = pendingQuery.data?.total ?? 0
  const preparingCount = preparingQuery.data?.total ?? 0
  const readyCount = readyQuery.data?.total ?? 0
  const servedCount = servedQuery.data?.total ?? 0
  const activeCount = pendingCount + preparingCount + readyCount

  const orders = listQuery.data?.orders ?? []
  const listTotal = listQuery.data?.total ?? 0
  const pageCount = Math.max(1, Math.ceil(listTotal / PAGE_SIZE))

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
        <div className="flex flex-col">
          <span className="text-muted-foreground">
            {o.items.reduce((n, i) => n + i.quantity, 0)} items ·{" "}
            {formatCurrency(o.grandTotal)}
          </span>
          {o.grandTotal !== o.totalAmount && (
            <span className="text-xs text-muted-foreground">
              {formatCurrency(o.totalAmount)} + tax
            </span>
          )}
        </div>
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
      header: "Status",
      cell: (o) => (
        <Select
          items={STATUS_OPTION_ITEMS}
          value={o.status}
          onValueChange={(v) =>
            v && v !== o.status && updateStatus.mutate({ id: o.id, status: v })
          }
        >
          <SelectTrigger className="h-8 w-full sm:w-36">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {STATUS_OPTIONS.map((s) => (
              <SelectItem key={s} value={s}>
                {STATUS_OPTION_ITEMS[s]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      ),
    },
    {
      key: "actions",
      header: "",
      headerClassName: "pr-5",
      cellClassName: "pr-5 text-right",
      cell: (o) => (
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button
                variant="ghost"
                size="icon"
                className="size-8 cursor-pointer justify-self-end"
                aria-label={`Actions for order #${o.id.slice(0, 8).toUpperCase()}`}
              >
                <MoreVerticalIcon aria-hidden />
              </Button>
            }
          />
          <DropdownMenuContent align="end">
            <DropdownMenuItem className="cursor-pointer" onClick={() => setEditingOrder(o)}>
              <PencilIcon aria-hidden />
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem
              variant="destructive"
              className="cursor-pointer"
              onClick={() => setPendingDelete(o)}
            >
              <Trash2Icon aria-hidden />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ]

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Orders"
        description={
          <span className="flex items-center gap-2">
            {total} total tickets
            <Badge variant="outline">{activeCount} active</Badge>
          </span>
        }
        actions={
          <Button data-icon="inline-start" onClick={() => setCreating(true)}>
            <PlusIcon aria-hidden />
            New Order
          </Button>
        }
      />

      <SectionCards
        stats={[
          { label: "Pending", value: String(pendingCount) },
          { label: "Preparing", value: String(preparingCount) },
          { label: "Ready", value: String(readyCount) },
          { label: "Served", value: String(servedCount) },
        ]}
      />

      <DataTable
        columns={columns}
        data={orders}
        getRowId={(o) => o.id}
        loading={listQuery.isFetching}
        searchPlaceholder="Search ticket, table, or waiter…"
        searchValue={search}
        onSearchChange={(value) => {
          setSearch(value)
          resetToFirstPage()
        }}
        page={page}
        pageCount={pageCount}
        onPageChange={setPage}
        toolbar={
          <Select
            items={STATUS_ITEMS}
            value={status}
            onValueChange={(v) => {
              setStatus((v ?? "all") as typeof status)
              resetToFirstPage()
            }}
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
        emptyDescription="Try a different search or status filter."
      />

      <OrderFormDialog tenant={tenant} open={creating} onOpenChange={setCreating} />

      <OrderFormDialog
        tenant={tenant}
        order={editingOrder ?? undefined}
        open={editingOrder !== null}
        onOpenChange={(open) => !open && setEditingOrder(null)}
      />

      <AlertDialog
        open={pendingDelete !== null}
        onOpenChange={(open) => !open && setPendingDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Delete order #{pendingDelete?.id.slice(0, 8).toUpperCase()}?
            </AlertDialogTitle>
            <AlertDialogDescription>This can&apos;t be undone.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="cursor-pointer">Cancel</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              className="cursor-pointer"
              disabled={remove.isPending}
              onClick={async () => {
                if (!pendingDelete) return
                await remove.mutateAsync(pendingDelete.id)
                setPendingDelete(null)
              }}
            >
              {remove.isPending ? "Deleting" : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
