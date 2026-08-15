"use client"

import * as React from "react"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import { ArrowLeftIcon, MinusIcon, PlusIcon, ShoppingCartIcon } from "lucide-react"

import { ADD_ONS, addKotOrder, MENU_CATEGORIES, MENU_ITEMS, ROOMS } from "@/lib/mock-data"
import { cn, formatCurrency, orderItemTotal, orderTotal } from "@/lib/utils"
import type { AddOn, MenuItem, OrderItem } from "@/types"
import { EmptyState } from "@/components/shared/empty-state"
import { PageHeader } from "@/components/shared/page-header"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
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
import { usePageTitle } from "@/features/tenant/dashboard/page-title-context"

const TABLE_OPTIONS = Array.from({ length: 8 }, (_, i) => `Table ${i + 1}`)
const ROOM_OPTIONS = ROOMS.filter((r) => r.status === "occupied").map(
  (r) => `Room ${r.number}`
)

function addOnsFor(item: MenuItem): AddOn[] {
  if (!item.addOnIds?.length) return []
  return ADD_ONS.filter((a) => item.addOnIds!.includes(a.id))
}

export default function NewOrderPage() {
  usePageTitle("New Order")
  const router = useRouter()
  const params = useParams<{ tenant: string }>()
  const base = `/${params.tenant}/dashboard`

  const [destination, setDestination] = React.useState(TABLE_OPTIONS[0])
  const [cart, setCart] = React.useState<OrderItem[]>([])

  const total = orderTotal(cart)
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

  function changeQuantity(menuItemId: string, delta: number) {
    setCart((prev) =>
      prev
        .map((i) =>
          i.menuItemId === menuItemId ? { ...i, quantity: i.quantity + delta } : i
        )
        .filter((i) => i.quantity > 0)
    )
  }

  /** Toggles an add-on on a dish's cart line, adding the dish first if it isn't in the cart yet. */
  function toggleAddOn(menuItemId: string, addOn: AddOn) {
    const menuItem = MENU_ITEMS.find((m) => m.id === menuItemId)
    if (!menuItem) return
    setCart((prev) => {
      const existing = prev.find((i) => i.menuItemId === menuItemId)
      if (!existing) {
        return [
          ...prev,
          {
            id: `oi${Date.now()}`,
            menuItemId,
            name: menuItem.name,
            price: menuItem.price,
            quantity: 1,
            addOns: [{ id: addOn.id, name: addOn.name, price: addOn.price }],
          },
        ]
      }
      const hasAddOn = existing.addOns?.some((a) => a.id === addOn.id)
      const nextAddOns = hasAddOn
        ? existing.addOns?.filter((a) => a.id !== addOn.id)
        : [...(existing.addOns ?? []), { id: addOn.id, name: addOn.name, price: addOn.price }]
      return prev.map((i) =>
        i.menuItemId === menuItemId
          ? { ...i, addOns: nextAddOns?.length ? nextAddOns : undefined }
          : i
      )
    })
  }

  function send() {
    if (cart.length === 0) return
    addKotOrder({
      id: `kot${Date.now()}`,
      kotNumber: `KOT-${Math.floor(1000 + Math.random() * 9000)}`,
      table: destination,
      origin: destination.startsWith("Room") ? "room-service" : "restaurant",
      items: cart,
      status: "pending",
      placedAt: new Date().toISOString(),
      waiterName: "You",
    })
    router.push(`${base}/orders`)
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="New order"
        description="Build a ticket for a table or room and send it to the kitchen."
        actions={
          <Button
            variant="outline"
            nativeButton={false}
            render={<Link href={`${base}/orders`} />}
          >
            <ArrowLeftIcon data-icon="inline-start" />
            Back to orders
          </Button>
        }
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_320px]">
        <div className="flex flex-col gap-4">
          <Select
            value={destination}
            onValueChange={(v) => setDestination(v ?? TABLE_OPTIONS[0])}
          >
            <SelectTrigger className="w-full sm:w-64">
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
            <TabsList className="w-full flex-wrap">
              {MENU_CATEGORIES.map((category) => (
                <TabsTrigger key={category} value={category}>
                  {category}
                </TabsTrigger>
              ))}
            </TabsList>
            {MENU_CATEGORIES.map((category) => (
              <TabsContent key={category} value={category} className="mt-3">
                <div className="flex flex-col gap-2">
                  {MENU_ITEMS.filter((item) => item.category === category).map(
                    (item) => {
                      const inCart = cart.find((i) => i.menuItemId === item.id)
                      const addOns = addOnsFor(item)
                      return (
                        <div
                          key={item.id}
                          className={cn(
                            "flex flex-col gap-2 rounded-lg border p-3 transition-colors",
                            inCart && "border-primary/40 bg-primary/5"
                          )}
                        >
                          <div className="flex items-center gap-3">
                            <span
                              aria-hidden
                              className={cn(
                                "size-2 shrink-0 rounded-full border",
                                item.isVeg
                                  ? "border-primary bg-primary/20"
                                  : "border-destructive bg-destructive/20"
                              )}
                            />
                            <div className="flex min-w-0 flex-1 flex-col">
                              <span className="truncate text-sm font-medium">
                                {item.name}
                              </span>
                              <span className="text-xs text-muted-foreground tabular-nums">
                                {formatCurrency(item.price)}
                              </span>
                            </div>
                            {inCart ? (
                              <div className="flex shrink-0 items-center gap-1">
                                <Button
                                  type="button"
                                  size="icon-sm"
                                  variant="outline"
                                  onClick={() => changeQuantity(item.id, -1)}
                                >
                                  <MinusIcon />
                                </Button>
                                <span className="w-5 text-center text-sm tabular-nums">
                                  {inCart.quantity}
                                </span>
                                <Button
                                  type="button"
                                  size="icon-sm"
                                  variant="outline"
                                  onClick={() => changeQuantity(item.id, 1)}
                                >
                                  <PlusIcon />
                                </Button>
                              </div>
                            ) : (
                              <Button
                                type="button"
                                size="sm"
                                variant="secondary"
                                className="shrink-0"
                                disabled={!item.available}
                                onClick={() => addItem(item.id)}
                              >
                                {item.available ? "Add" : "Unavailable"}
                              </Button>
                            )}
                          </div>

                          {addOns.length > 0 && (
                            <div className="flex flex-wrap items-center gap-1.5 pl-5">
                              <span className="text-[11px] text-muted-foreground">
                                Add-ons:
                              </span>
                              {addOns.map((addOn) => {
                                const selected = inCart?.addOns?.some(
                                  (a) => a.id === addOn.id
                                )
                                return (
                                  <button
                                    key={addOn.id}
                                    type="button"
                                    onClick={() => toggleAddOn(item.id, addOn)}
                                    className={cn(
                                      "cursor-pointer rounded-full border px-2 py-0.5 text-[11px] transition-colors",
                                      selected
                                        ? "border-primary bg-primary text-primary-foreground"
                                        : "border-input text-muted-foreground hover:border-primary hover:text-primary"
                                    )}
                                  >
                                    {addOn.name}
                                    {addOn.price > 0 && ` +${formatCurrency(addOn.price)}`}
                                  </button>
                                )
                              })}
                            </div>
                          )}
                        </div>
                      )
                    }
                  )}
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </div>

        <Card className="h-fit lg:sticky lg:top-6">
          <CardContent className="flex flex-col gap-3">
            <span className="text-sm font-medium">
              Order summary{itemCount > 0 && ` · ${itemCount} items`}
            </span>

            {cart.length === 0 ? (
              <EmptyState
                icon={ShoppingCartIcon}
                title="No items yet"
                description="Add dishes from the menu to build this order."
              />
            ) : (
              <div className="flex flex-col gap-3">
                {cart.map((item) => (
                  <div key={item.id} className="flex items-start gap-2">
                    <div className="flex min-w-0 flex-1 flex-col">
                      <span className="truncate text-sm font-medium">{item.name}</span>
                      {item.addOns && item.addOns.length > 0 && (
                        <span className="truncate text-xs text-primary">
                          + {item.addOns.map((a) => a.name).join(", ")}
                        </span>
                      )}
                      <span className="text-xs text-muted-foreground tabular-nums">
                        {formatCurrency(orderItemTotal(item))}
                      </span>
                    </div>
                    <div className="flex shrink-0 items-center gap-1">
                      <Button
                        type="button"
                        size="icon-sm"
                        variant="outline"
                        onClick={() => changeQuantity(item.menuItemId, -1)}
                      >
                        <MinusIcon />
                      </Button>
                      <span className="w-5 text-center text-sm tabular-nums">
                        {item.quantity}
                      </span>
                      <Button
                        type="button"
                        size="icon-sm"
                        variant="outline"
                        onClick={() => changeQuantity(item.menuItemId, 1)}
                      >
                        <PlusIcon />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="flex items-center justify-between border-t pt-3 text-sm font-medium">
              <span>Total</span>
              <span className="tabular-nums">{formatCurrency(total)}</span>
            </div>

            <Button disabled={cart.length === 0} onClick={send}>
              Send to Kitchen
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
