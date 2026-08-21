"use client"

import * as React from "react"
import { ChefHatIcon, EyeIcon, XIcon } from "lucide-react"

import type { Order, OrderStatus } from "@/features/tenant/order/types"
import { formatCurrency, timeAgo } from "@/lib/utils"
import { EmptyState } from "@/components/shared/empty-state"
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"

const COLUMN_LABELS: Record<OrderStatus, string> = {
  pending: "Pending",
  preparing: "Preparing",
  ready: "Ready",
  served: "Served",
  cancelled: "Cancelled",
}

const NEXT_ACTION: Partial<Record<OrderStatus, string>> = {
  pending: "Start preparing",
  preparing: "Mark ready",
  ready: "Mark served",
}

const STATUS_BADGE_VARIANT: Record<OrderStatus, "outline" | "secondary" | "destructive"> = {
  pending: "outline",
  preparing: "secondary",
  ready: "secondary",
  served: "outline",
  cancelled: "destructive",
}

function destination(order: Order) {
  if (order.tableName) return order.tableName
  if (order.roomNumber) return `Room ${order.roomNumber}`
  if (order.cabinName) return order.cabinName
  return "—"
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

function OrderDetailsDialog({ order, onOpenChange }: { order: Order | null; onOpenChange: (open: boolean) => void }) {
  return (
    <Dialog open={order !== null} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        {order && (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                {destination(order)}
                <Badge variant={STATUS_BADGE_VARIANT[order.status]}>
                  {COLUMN_LABELS[order.status]}
                </Badge>
              </DialogTitle>
              <DialogDescription>
                Ticket #{order.id.slice(0, 8).toUpperCase()} · placed {timeAgo(order.createdAt)}
              </DialogDescription>
            </DialogHeader>

            <div className="flex max-h-[60vh] flex-col gap-4 overflow-y-auto scrollbar-none">
              <div className="flex flex-col gap-2">
                {order.items.map((item) => (
                  <div key={item.menuItemId} className="flex items-start justify-between gap-2 rounded-md border p-2.5">
                    <div className="flex flex-col">
                      <span className="flex items-center gap-1.5 text-sm font-medium">
                        <span className="tabular-nums text-muted-foreground">{item.quantity}×</span>
                        {item.name}
                      </span>
                      {item.addOns.length > 0 && (
                        <span className="pl-5 text-xs text-muted-foreground">
                          + {item.addOns.map((a) => `${a.name} ×${a.quantity}`).join(", ")}
                        </span>
                      )}
                    </div>
                    <span className="shrink-0 text-sm tabular-nums text-muted-foreground">
                      {formatCurrency(item.price * item.quantity)}
                    </span>
                  </div>
                ))}
              </div>

              {order.notes && (
                <p className="rounded-md bg-muted/50 px-2.5 py-1.5 text-sm text-muted-foreground italic">
                  &ldquo;{order.notes}&rdquo;
                </p>
              )}

              <div className="flex items-center justify-between gap-2 border-t pt-3">
                <div className="flex items-center gap-2">
                  <Avatar size="sm">
                    {order.createdByImage ? (
                      <AvatarImage src={order.createdByImage} alt="" className="object-contain" />
                    ) : null}
                    <AvatarFallback>{initials(order.createdByName)}</AvatarFallback>
                  </Avatar>
                  <span className="text-sm text-muted-foreground">{order.createdByName}</span>
                </div>
                <span className="text-sm font-semibold tabular-nums">
                  {formatCurrency(order.totalAmount)}
                </span>
              </div>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}

export function KotBoard({
  orders,
  columns,
  onAdvance,
  onCancel,
}: {
  orders: Order[]
  columns: OrderStatus[]
  onAdvance?: (orderId: string) => void
  onCancel?: (orderId: string) => void
}) {
  const [viewingOrder, setViewingOrder] = React.useState<Order | null>(null)
  const [cancellingOrder, setCancellingOrder] = React.useState<Order | null>(null)

  return (
    <div
      className="grid gap-4"
      style={{ gridTemplateColumns: `repeat(${columns.length}, minmax(272px, 1fr))` }}
    >
      {columns.map((column) => {
        const columnOrders = orders
          .filter((order) => order.status === column)
          .sort((a, b) => +new Date(a.createdAt) - +new Date(b.createdAt))

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

                  return (
                    <Card
                      key={order.id}
                      className="h-76 gap-3 py-4 transition-shadow hover:shadow-md"
                    >
                      <div className="flex items-start justify-between gap-2 px-4">
                        <div className="flex flex-col">
                          <span className="font-heading text-sm font-semibold">
                            {destination(order)}
                          </span>
                          <span className="text-xs text-muted-foreground tabular-nums">
                            #{order.id.slice(0, 8).toUpperCase()}
                          </span>
                        </div>
                        <ElapsedBadge placedAt={order.createdAt} />
                      </div>

                      <div className="flex flex-1 flex-col gap-1 overflow-y-auto scrollbar-none px-4 text-sm text-muted-foreground">
                        {order.items.slice(0, 3).map((item) => (
                          <div key={item.menuItemId} className="flex flex-col">
                            <div className="flex items-center gap-1.5">
                              <span className="tabular-nums text-foreground">
                                {item.quantity}×
                              </span>
                              <span className="truncate">{item.name}</span>
                            </div>
                            {item.addOns.length > 0 && (
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
                        <p className="mx-4 line-clamp-2 rounded-md bg-muted/50 px-2.5 py-1.5 text-xs text-muted-foreground italic">
                          &ldquo;{order.notes}&rdquo;
                        </p>
                      )}

                      <div className="flex items-center justify-between gap-2 border-t px-4 pt-3">
                        <div className="flex items-center gap-2">
                          <Avatar size="sm">
                            {order.createdByImage ? (
                              <AvatarImage src={order.createdByImage} alt="" className="object-contain" />
                            ) : null}
                            <AvatarFallback>{initials(order.createdByName)}</AvatarFallback>
                          </Avatar>
                          <span className="text-xs text-muted-foreground">
                            {itemCount} items · {formatCurrency(order.totalAmount)}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 px-4">
                        {onAdvance && NEXT_ACTION[order.status] && (
                          <Button
                            size="sm"
                            variant="secondary"
                            className="flex-1"
                            onClick={() => onAdvance(order.id)}
                          >
                            {NEXT_ACTION[order.status]}
                          </Button>
                        )}
                        <Tooltip>
                          <TooltipTrigger
                            render={
                              <Button
                                size="icon-sm"
                                variant="outline"
                                aria-label="View order details"
                                className={cn(!NEXT_ACTION[order.status] && !onCancel && "flex-1")}
                                onClick={() => setViewingOrder(order)}
                              >
                                <EyeIcon />
                              </Button>
                            }
                          />
                          <TooltipContent>View details</TooltipContent>
                        </Tooltip>
                        {onCancel && (
                          <Tooltip>
                            <TooltipTrigger
                              render={
                                <Button
                                  size="icon-sm"
                                  variant="outline"
                                  aria-label="Cancel order"
                                  onClick={() => setCancellingOrder(order)}
                                >
                                  <XIcon />
                                </Button>
                              }
                            />
                            <TooltipContent>Cancel order</TooltipContent>
                          </Tooltip>
                        )}
                      </div>
                    </Card>
                  )
                })
              )}
            </div>
          </div>
        )
      })}

      <OrderDetailsDialog order={viewingOrder} onOpenChange={(open) => !open && setViewingOrder(null)} />

      <AlertDialog open={cancellingOrder !== null} onOpenChange={(open) => !open && setCancellingOrder(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Cancel order #{cancellingOrder?.id.slice(0, 8).toUpperCase()}?
            </AlertDialogTitle>
            <AlertDialogDescription>
              This sends the ticket to Cancelled. This can&apos;t be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="cursor-pointer">Keep order</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              className="cursor-pointer"
              onClick={() => {
                if (cancellingOrder) onCancel?.(cancellingOrder.id)
                setCancellingOrder(null)
              }}
            >
              Cancel order
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
