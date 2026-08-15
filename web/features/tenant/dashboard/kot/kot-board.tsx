"use client"

import { ChefHatIcon } from "lucide-react"

import type { KotOrder, OrderStatus } from "@/types"
import { formatCurrency, orderTotal, timeAgo } from "@/lib/utils"
import { EmptyState } from "@/components/shared/empty-state"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { cn } from "@/lib/utils"

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

function initials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase()
}

function elapsedMinutes(iso: string) {
  return Math.max(0, Math.round((Date.now() - new Date(iso).getTime()) / 60000))
}

function ElapsedBadge({ placedAt }: { placedAt: string }) {
  const mins = elapsedMinutes(placedAt)
  const variant = mins >= 20 ? "destructive" : mins >= 10 ? "secondary" : "outline"
  return (
    <Badge variant={variant} className="shrink-0 tabular-nums">
      {timeAgo(placedAt)}
    </Badge>
  )
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
      style={{ gridTemplateColumns: `repeat(${columns.length}, minmax(272px, 1fr))` }}
    >
      {columns.map((column) => {
        const columnOrders = orders
          .filter((order) => order.status === column)
          .sort((a, b) => +new Date(a.placedAt) - +new Date(b.placedAt))

        return (
          <div key={column} className="flex min-w-0 flex-col gap-3">
            <div className="flex items-center justify-between rounded-lg bg-muted/60 px-3 py-2">
              <span className="text-sm font-semibold">{COLUMN_LABELS[column]}</span>
              <Badge variant="secondary" className="rounded-full">
                {columnOrders.length}
              </Badge>
            </div>

            <div className="flex flex-col gap-3">
              {columnOrders.length === 0 ? (
                <EmptyState icon={ChefHatIcon} title="No tickets" className="py-8" />
              ) : (
                columnOrders.map((order) => {
                  const itemCount = order.items.reduce((n, i) => n + i.quantity, 0)
                  const total = orderTotal(order.items)

                  return (
                    <Card
                      key={order.id}
                      className={cn(
                        "gap-3 py-4 transition-shadow hover:shadow-md",
                        order.status === "served" && "opacity-70"
                      )}
                    >
                      <div className="flex items-start justify-between gap-2 px-4">
                        <div className="flex flex-col">
                          <span className="font-heading text-sm font-semibold">
                            {order.table}
                          </span>
                          <span className="text-xs text-muted-foreground tabular-nums">
                            {order.kotNumber}
                          </span>
                        </div>
                        <ElapsedBadge placedAt={order.placedAt} />
                      </div>

                      <div className="flex flex-col gap-1 px-4 text-sm text-muted-foreground">
                        {order.items.slice(0, 3).map((item) => (
                          <div key={item.id} className="flex flex-col">
                            <div className="flex items-center gap-1.5">
                              <span className="tabular-nums text-foreground">
                                {item.quantity}×
                              </span>
                              <span className="truncate">{item.name}</span>
                            </div>
                            {item.addOns && item.addOns.length > 0 && (
                              <span className="truncate pl-5 text-xs">
                                + {item.addOns.map((a) => a.name).join(", ")}
                              </span>
                            )}
                          </div>
                        ))}
                        {order.items.length > 3 && (
                          <span className="text-xs">
                            +{order.items.length - 3} more item
                            {order.items.length - 3 > 1 ? "s" : ""}
                          </span>
                        )}
                      </div>

                      {order.notes && (
                        <p className="mx-4 rounded-md bg-muted/50 px-2.5 py-1.5 text-xs text-muted-foreground italic">
                          &ldquo;{order.notes}&rdquo;
                        </p>
                      )}

                      <div className="flex items-center justify-between gap-2 border-t px-4 pt-3">
                        <div className="flex items-center gap-2">
                          <Avatar size="sm">
                            <AvatarFallback>
                              {initials(order.waiterName)}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-xs text-muted-foreground">
                            {itemCount} items · {formatCurrency(total)}
                          </span>
                        </div>
                      </div>

                      {onAdvance && NEXT_ACTION[order.status] && (
                        <div className="px-4">
                          <Button
                            size="sm"
                            variant="secondary"
                            className="w-full"
                            onClick={() => onAdvance(order.id)}
                          >
                            {NEXT_ACTION[order.status]}
                          </Button>
                        </div>
                      )}
                    </Card>
                  )
                })
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
