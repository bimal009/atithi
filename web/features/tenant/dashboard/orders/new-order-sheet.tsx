"use client"

import * as React from "react"
import { MinusIcon, PlusIcon, ShoppingCartIcon } from "lucide-react"

import { MENU_CATEGORIES, MENU_ITEMS, ROOMS } from "@/lib/mock-data"
import { cn, formatCurrency } from "@/lib/utils"
import type { KotOrder, OrderItem } from "@/types"
import { EmptyState } from "@/components/shared/empty-state"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

const TABLE_OPTIONS = Array.from({ length: 8 }, (_, i) => `Table ${i + 1}`)
const ROOM_OPTIONS = ROOMS.filter((r) => r.status === "occupied").map(
  (r) => `Room ${r.number}`
)

export function NewOrderSheet({
  onCreate,
}: {
  onCreate: (order: KotOrder) => void
}) {
  const [open, setOpen] = React.useState(false)
  const [destination, setDestination] = React.useState(TABLE_OPTIONS[0])
  const [cart, setCart] = React.useState<OrderItem[]>([])

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const itemCount = cart.reduce((sum, item) => sum + item.quantity, 0)

  function addItem(menuItemId: string) {
    const menuItem = MENU_ITEMS.find((m) => m.id === menuItemId)
    if (!menuItem) return
    setCart((prev) => {
      const existing = prev.find((i) => i.menuItemId === menuItemId)
      if (existing) {
        return prev.map((i) =>
          i.menuItemId === menuItemId ? { ...i, quantity: i.quantity + 1 } : i
        )
      }
      return [
        ...prev,
        {
          id: `oi${Date.now()}`,
          menuItemId,
          name: menuItem.name,
          price: menuItem.price,
          quantity: 1,
        },
      ]
    })
  }

  function changeQuantity(id: string, delta: number) {
    setCart((prev) =>
      prev
        .map((i) => (i.id === id ? { ...i, quantity: i.quantity + delta } : i))
        .filter((i) => i.quantity > 0)
    )
  }

  function send() {
    if (cart.length === 0) return
    onCreate({
      id: `kot${Date.now()}`,
      kotNumber: `KOT-${Math.floor(1000 + Math.random() * 9000)}`,
      table: destination,
      origin: destination.startsWith("Room") ? "room-service" : "restaurant",
      items: cart,
      status: "pending",
      placedAt: new Date().toISOString(),
      waiterName: "You",
    })
    setCart([])
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button />}>
        <PlusIcon data-icon="inline-start" />
        New Order
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>New order</DialogTitle>
        </DialogHeader>

        <div className="flex max-h-[65vh] flex-col gap-4 overflow-y-auto">
          <Select
            value={destination}
            onValueChange={(v) => setDestination(v ?? TABLE_OPTIONS[0])}
          >
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Restaurant tables</SelectLabel>
                {TABLE_OPTIONS.map((table) => (
                  <SelectItem key={table} value={table}>
                    {table}
                  </SelectItem>
                ))}
              </SelectGroup>
              <SelectGroup>
                <SelectLabel>Room service</SelectLabel>
                {ROOM_OPTIONS.map((room) => (
                  <SelectItem key={room} value={room}>
                    {room}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>

          <Tabs defaultValue={MENU_CATEGORIES[0]}>
            <TabsList className="flex-wrap">
              {MENU_CATEGORIES.map((category) => (
                <TabsTrigger key={category} value={category}>
                  {category}
                </TabsTrigger>
              ))}
            </TabsList>
            {MENU_CATEGORIES.map((category) => (
              <TabsContent key={category} value={category} className="mt-3">
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                  {MENU_ITEMS.filter((item) => item.category === category).map(
                    (item) => (
                      <Card key={item.id} className="gap-2 py-3">
                        <CardContent className="flex flex-col gap-1.5 px-3">
                          <div className="flex items-start justify-between gap-1.5">
                            <span className="text-xs font-medium">
                              {item.name}
                            </span>
                            <span
                              aria-hidden
                              className={cn(
                                "mt-0.5 size-1.5 shrink-0 rounded-full border",
                                item.isVeg
                                  ? "border-primary bg-primary/20"
                                  : "border-destructive bg-destructive/20"
                              )}
                            />
                          </div>
                          <span className="text-xs text-muted-foreground tabular-nums">
                            {formatCurrency(item.price)}
                          </span>
                          <Button
                            size="sm"
                            variant="secondary"
                            disabled={!item.available}
                            onClick={() => addItem(item.id)}
                          >
                            {item.available ? "Add" : "Unavailable"}
                          </Button>
                        </CardContent>
                      </Card>
                    )
                  )}
                </div>
              </TabsContent>
            ))}
          </Tabs>

          <div className="flex flex-col gap-3">
            <span className="text-sm font-medium">Order summary</span>
            {cart.length === 0 ? (
              <EmptyState
                icon={ShoppingCartIcon}
                title="No items yet"
                description="Add dishes above to build this order."
              />
            ) : (
              cart.map((item) => (
                <div key={item.id} className="flex items-center gap-3">
                  <div className="flex flex-1 flex-col">
                    <span className="text-sm font-medium">{item.name}</span>
                    <span className="text-xs text-muted-foreground">
                      {formatCurrency(item.price)} each
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button
                      size="icon-sm"
                      variant="outline"
                      onClick={() => changeQuantity(item.id, -1)}
                    >
                      <MinusIcon />
                    </Button>
                    <span className="w-5 text-center text-sm tabular-nums">
                      {item.quantity}
                    </span>
                    <Button
                      size="icon-sm"
                      variant="outline"
                      onClick={() => changeQuantity(item.id, 1)}
                    >
                      <PlusIcon />
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <DialogFooter>
          <div className="mr-auto flex items-center gap-2 text-sm font-medium">
            <span>Total · {itemCount} items</span>
            <span className="tabular-nums">{formatCurrency(total)}</span>
          </div>
          <Button disabled={cart.length === 0} onClick={send}>
            Send to Kitchen
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
