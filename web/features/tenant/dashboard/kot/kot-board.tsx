"use client"

import { ChefHatIcon, ClockIcon } from "lucide-react"

import type { KotOrder, OrderStatus } from "@/types"
import { formatCurrency, timeAgo } from "@/lib/utils"
import { EmptyState } from "@/components/shared/empty-state"
import { StatusBadge } from "@/components/shared/status-badge"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"

const COLUMN_LABELS: Record<OrderStatus, string> = {
  pending: "Pending",
  preparing: "Preparing",
  ready: "Ready",
  served: "Served",
}

const NEXT_ACTION: Partial<Record<OrderStatus, string>> = {
  pending: "Start preparing",
  preparing: "Mark ready",
  ready: "Mark served",
}

export function KotBoard({
  orders,
  columns,
  onAdvance,
}: {
  orders: KotOrder[]
  columns: OrderStatus[]
  onAdvance?: (orderId: string) => void
}) {
  return (
    <div
      className="grid gap-4"
      style={{ gridTemplateColumns: `repeat(${columns.length}, minmax(260px, 1fr))` }}
    >
      {columns.map((column) => {
        const columnOrders = orders
          .filter((order) => order.status === column)
          .sort((a, b) => +new Date(a.placedAt) - +new Date(b.placedAt))

        return (
          <div key={column} className="flex min-w-0 flex-col gap-3">
            <div className="flex items-center justify-between px-1">
              <h2 className="text-sm font-medium">{COLUMN_LABELS[column]}</h2>
              <Badge variant="secondary">{columnOrders.length}</Badge>
            </div>

            <div className="flex flex-col gap-3">
              {columnOrders.length === 0 ? (
                <EmptyState
                  icon={ChefHatIcon}
                  title="No tickets"
                  className="py-8"
                />
              ) : (
                columnOrders.map((order) => (
                  <Card key={order.id} className="gap-3">
                    <CardHeader className="flex-row items-center justify-between gap-2">
                      <div className="flex flex-col">
                        <span className="font-heading text-sm font-semibold">
                          {order.table}
                        </span>
                        <span className="text-xs text-muted-foreground tabular-nums">
                          {order.kotNumber}
                        </span>
                      </div>
                      <span className="flex items-center gap-1 text-xs text-muted-foreground">
                        <ClockIcon className="size-3.5" />
                        {timeAgo(order.placedAt)}
                      </span>
                    </CardHeader>
                    <CardContent className="flex flex-col gap-3">
                      <ul className="flex flex-col gap-1 text-sm">
                        {order.items.map((item) => (
                          <li
                            key={item.id}
                            className="flex items-center justify-between gap-2"
                          >
                            <span>
                              <span className="tabular-nums text-muted-foreground">
                                {item.quantity}×
                              </span>{" "}
                              {item.name}
                            </span>
                            <span className="text-muted-foreground tabular-nums">
                              {formatCurrency(item.price * item.quantity)}
                            </span>
                          </li>
                        ))}
                      </ul>
                      {order.notes && (
                        <p className="text-xs text-muted-foreground italic">
                          &ldquo;{order.notes}&rdquo;
                        </p>
                      )}
                      <div className="flex items-center justify-between gap-2 text-xs text-muted-foreground">
                        <span>{order.waiterName}</span>
                        <StatusBadge status={order.status} />
                      </div>
                      {onAdvance && NEXT_ACTION[order.status] && (
                        <Button
                          size="sm"
                          variant="secondary"
                          className="w-full"
                          onClick={() => onAdvance(order.id)}
                        >
                          {NEXT_ACTION[order.status]}
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
