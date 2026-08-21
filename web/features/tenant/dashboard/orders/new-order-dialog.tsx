"use client"

import * as React from "react"
import { MinusIcon, PlusIcon, SearchIcon, ShoppingCartIcon } from "lucide-react"

import { useCreateOrder } from "@/features/tenant/order/client/useOrders"
import { useMenuItemsQuery } from "@/features/tenant/menuItem/client/useMenuItems"
import type { AddOnRef, MenuItem } from "@/features/tenant/menuItem/types"
import { useTablesQuery } from "@/features/tenant/table/client/useTables"
import type { DiningTable } from "@/features/tenant/table/types"
import { useRoomsQuery } from "@/features/tenant/room/client/useRooms"
import type { Room } from "@/features/tenant/room/types"
import { useCabinsQuery } from "@/features/tenant/cabin/client/useCabins"
import type { Cabin } from "@/features/tenant/cabin/types"
import { cn, formatCurrency } from "@/lib/utils"
import { FOOD_TYPE_DOT_CLASS, FOOD_TYPE_LABEL } from "@/lib/food-type"
import { EmptyState } from "@/components/shared/empty-state"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogDescription,
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

type CartLine = {
  menuItemId: string
  name: string
  price: number
  quantity: number
  addOns: AddOnRef[]
}

type Destination = { type: "table" | "room" | "cabin"; id: string }

const EMPTY_MENU_ITEMS: MenuItem[] = []
const EMPTY_TABLES: DiningTable[] = []
const EMPTY_ROOMS: Room[] = []
const EMPTY_CABINS: Cabin[] = []

function lineTotal(line: CartLine) {
  const addOnsTotal = line.addOns.reduce((sum, a) => sum + a.price, 0)
  return (line.price + addOnsTotal) * line.quantity
}

function cartTotal(cart: CartLine[]) {
  return cart.reduce((sum, line) => sum + lineTotal(line), 0)
}

export function NewOrderDialog({ tenant }: { tenant: string }) {
  const [open, setOpen] = React.useState(false)

  const menuItemsQuery = useMenuItemsQuery(tenant, { limit: 100 })
  const tablesQuery = useTablesQuery(tenant, { limit: 100 })
  const roomsQuery = useRoomsQuery(tenant, { status: "occupied", limit: 100 })
  const cabinsQuery = useCabinsQuery(tenant, { status: "occupied", limit: 100 })
  const createOrder = useCreateOrder(tenant)

  const [selectedDestination, setSelectedDestination] = React.useState("")
  const [search, setSearch] = React.useState("")
  const [cart, setCart] = React.useState<CartLine[]>([])

  const tables = tablesQuery.data?.tables ?? EMPTY_TABLES
  const rooms = roomsQuery.data?.rooms ?? EMPTY_ROOMS
  const cabins = cabinsQuery.data?.cabins ?? EMPTY_CABINS
  const menuItems = menuItemsQuery.data?.menuItems ?? EMPTY_MENU_ITEMS

  const destinationItems = React.useMemo(
    () => ({
      ...Object.fromEntries(tables.map((t) => [`table:${t.id}`, t.name])),
      ...Object.fromEntries(rooms.map((r) => [`room:${r.id}`, `Room ${r.number}`])),
      ...Object.fromEntries(cabins.map((c) => [`cabin:${c.id}`, c.name])),
    }),
    [tables, rooms, cabins]
  )

  const categories = React.useMemo(() => {
    const seen = new Set<string>()
    const list: string[] = []
    for (const item of menuItems) {
      if (!seen.has(item.categoryName)) {
        seen.add(item.categoryName)
        list.push(item.categoryName)
      }
    }
    return list
  }, [menuItems])

  const query = search.trim().toLowerCase()
  const searchResults = query
    ? menuItems.filter((item) => item.name.toLowerCase().includes(query))
    : []

  const destinationValue = selectedDestination || (tables[0] ? `table:${tables[0].id}` : "")
  const destination: Destination | null = destinationValue
    ? {
        type: destinationValue.startsWith("room:")
          ? "room"
          : destinationValue.startsWith("cabin:")
            ? "cabin"
            : "table",
        id: destinationValue.slice(destinationValue.indexOf(":") + 1),
      }
    : null
  const total = cartTotal(cart)
  const itemCount = cart.reduce((sum, item) => sum + item.quantity, 0)

  function resetAll() {
    setSelectedDestination("")
    setSearch("")
    setCart([])
  }

  function addItem(item: MenuItem) {
    setCart((prev) => {
      const existing = prev.find((i) => i.menuItemId === item.id)
      if (existing) {
        return prev.map((i) =>
          i.menuItemId === item.id ? { ...i, quantity: i.quantity + 1 } : i
        )
      }
      return [
        ...prev,
        { menuItemId: item.id, name: item.name, price: item.price, quantity: 1, addOns: [] },
      ]
    })
  }

  function changeQuantity(menuItemId: string, delta: number) {
    setCart((prev) =>
      prev
        .map((i) => (i.menuItemId === menuItemId ? { ...i, quantity: i.quantity + delta } : i))
        .filter((i) => i.quantity > 0)
    )
  }

  /** Toggles an add-on on a dish's cart line, adding the dish first if it isn't in the cart yet. */
  function toggleAddOn(item: MenuItem, addOn: AddOnRef) {
    setCart((prev) => {
      const existing = prev.find((i) => i.menuItemId === item.id)
      if (!existing) {
        return [
          ...prev,
          {
            menuItemId: item.id,
            name: item.name,
            price: item.price,
            quantity: 1,
            addOns: [addOn],
          },
        ]
      }
      const hasAddOn = existing.addOns.some((a) => a.id === addOn.id)
      const nextAddOns = hasAddOn
        ? existing.addOns.filter((a) => a.id !== addOn.id)
        : [...existing.addOns, addOn]
      return prev.map((i) => (i.menuItemId === item.id ? { ...i, addOns: nextAddOns } : i))
    })
  }

  function send() {
    if (cart.length === 0 || !destination) return
    createOrder.mutate(
      {
        tableId: destination.type === "table" ? destination.id : undefined,
        roomId: destination.type === "room" ? destination.id : undefined,
        cabinId: destination.type === "cabin" ? destination.id : undefined,
        items: cart.map((line) => ({
          menuItemId: line.menuItemId,
          quantity: line.quantity,
          addOnIds: line.addOns.map((a) => a.id),
        })),
      },
      {
        onSuccess: () => {
          setOpen(false)
          resetAll()
        },
      }
    )
  }

  function renderMenuItem(item: MenuItem) {
    const inCart = cart.find((i) => i.menuItemId === item.id)
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
            title={FOOD_TYPE_LABEL[item.foodType]}
            className={cn("size-2 shrink-0 rounded-full border", FOOD_TYPE_DOT_CLASS[item.foodType])}
          />
          <div className="flex min-w-0 flex-1 flex-col">
            <span className="truncate text-sm font-medium">{item.name}</span>
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
              <span className="w-5 text-center text-sm tabular-nums">{inCart.quantity}</span>
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
              onClick={() => addItem(item)}
            >
              {item.available ? "Add" : "Unavailable"}
            </Button>
          )}
        </div>

        {item.addOns.length > 0 && (
          <div className="flex flex-wrap items-center gap-1.5 pl-5">
            <span className="text-[11px] text-muted-foreground">Add-ons:</span>
            {item.addOns.map((addOn) => {
              const selected = inCart?.addOns.some((a) => a.id === addOn.id)
              return (
                <button
                  key={addOn.id}
                  type="button"
                  onClick={() => toggleAddOn(item, addOn)}
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

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next)
        if (!next) resetAll()
      }}
    >
      <DialogTrigger render={<Button data-icon="inline-start" />}>
        <PlusIcon aria-hidden />
        New Order
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>New order</DialogTitle>
          <DialogDescription>
            Build a ticket for a table, room, or cabin and send it to the kitchen.
          </DialogDescription>
        </DialogHeader>

        <div className="flex max-h-[65vh] flex-col gap-4 overflow-y-auto scrollbar-none px-1 py-1 -mx-1">
          <Select value={destinationValue} onValueChange={(v) => setSelectedDestination(v ?? "")} items={destinationItems}>
            <SelectTrigger className="w-full sm:w-64">
              <SelectValue placeholder="Select a table, room, or cabin" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Restaurant tables</SelectLabel>
                {tables.map((table) => (
                  <SelectItem key={table.id} value={`table:${table.id}`}>
                    {table.name}
                  </SelectItem>
                ))}
              </SelectGroup>
              <SelectGroup>
                <SelectLabel>Room service</SelectLabel>
                {rooms.map((room) => (
                  <SelectItem key={room.id} value={`room:${room.id}`}>
                    Room {room.number}
                  </SelectItem>
                ))}
              </SelectGroup>
              <SelectGroup>
                <SelectLabel>Cabins</SelectLabel>
                {cabins.map((cabin) => (
                  <SelectItem key={cabin.id} value={`cabin:${cabin.id}`}>
                    {cabin.name}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>

          <div className="relative">
            <SearchIcon className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search dishes…"
              className="pl-8"
            />
          </div>

          {categories.length === 0 ? (
            <EmptyState
              icon={ShoppingCartIcon}
              title="No dishes on the menu yet"
              description="Add menu items before taking orders."
            />
          ) : query ? (
            <div className="flex flex-col gap-2">
              {searchResults.length === 0 ? (
                <p className="py-6 text-center text-sm text-muted-foreground">
                  No dishes match &ldquo;{search}&rdquo;.
                </p>
              ) : (
                searchResults.map(renderMenuItem)
              )}
            </div>
          ) : (
            <Tabs defaultValue={categories[0]}>
              <TabsList className="w-full flex-wrap">
                {categories.map((category) => (
                  <TabsTrigger key={category} value={category}>
                    {category}
                  </TabsTrigger>
                ))}
              </TabsList>
              {categories.map((category) => (
                <TabsContent key={category} value={category} className="mt-3">
                  <div className="flex flex-col gap-2">
                    {menuItems.filter((item) => item.categoryName === category).map(renderMenuItem)}
                  </div>
                </TabsContent>
              ))}
            </Tabs>
          )}

          <div className="flex flex-col gap-2 border-t pt-3">
            <span className="text-sm font-medium">
              Order summary{itemCount > 0 && ` · ${itemCount} items`}
            </span>

            {cart.length === 0 ? (
              <p className="py-4 text-center text-sm text-muted-foreground">
                Add dishes from the menu to build this order.
              </p>
            ) : (
              <div className="flex flex-col gap-3">
                {cart.map((item) => (
                  <div key={item.menuItemId} className="flex items-start gap-2">
                    <div className="flex min-w-0 flex-1 flex-col">
                      <span className="truncate text-sm font-medium">{item.name}</span>
                      {item.addOns.length > 0 && (
                        <span className="truncate text-xs text-primary">
                          + {item.addOns.map((a) => a.name).join(", ")}
                        </span>
                      )}
                      <span className="text-xs text-muted-foreground tabular-nums">
                        {formatCurrency(lineTotal(item))}
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
          </div>
        </div>

        <DialogFooter className="items-center sm:justify-between">
          <span className="text-sm font-medium">
            Total <span className="tabular-nums">{formatCurrency(total)}</span>
          </span>
          <Button
            disabled={cart.length === 0 || !destination || createOrder.isPending}
            onClick={send}
          >
            Send to Kitchen
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
