"use client"

import * as React from "react"
import { MinusIcon, PlusIcon, SearchIcon, ShoppingCartIcon, UtensilsCrossedIcon } from "lucide-react"

import { useCreateOrder, useUpdateOrder } from "@/features/tenant/order/client/useOrders"
import type { Order } from "@/features/tenant/order/types"
import { useCategoriesQuery } from "@/features/tenant/category/client/useCategories"
import type { Category } from "@/features/tenant/category/types"
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
import { Spinner } from "@/components/ui/spinner"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
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

type CartAddOn = AddOnRef & { quantity: number }

type CartLine = {
  menuItemId: string
  name: string
  price: number
  quantity: number
  addOns: CartAddOn[]
}

type Destination = { type: "table" | "room" | "cabin"; id: string }

const EMPTY_MENU_ITEMS: MenuItem[] = []
const EMPTY_TABLES: DiningTable[] = []
const EMPTY_ROOMS: Room[] = []
const EMPTY_CABINS: Cabin[] = []
const EMPTY_CATEGORIES: Category[] = []

function lineTotal(line: CartLine) {
  const addOnsTotal = line.addOns.reduce((sum, a) => sum + a.price * a.quantity, 0)
  return line.price * line.quantity + addOnsTotal
}

function cartTotal(cart: CartLine[]) {
  return cart.reduce((sum, line) => sum + lineTotal(line), 0)
}

function cartFromOrder(order?: Order): CartLine[] {
  if (!order) return []
  return order.items.map((item) => ({
    menuItemId: item.menuItemId,
    name: item.name,
    price: item.price,
    quantity: item.quantity,
    addOns: item.addOns,
  }))
}

function destinationFromOrder(order?: Order): string {
  if (!order) return ""
  if (order.tableId) return `table:${order.tableId}`
  if (order.roomId) return `room:${order.roomId}`
  if (order.cabinId) return `cabin:${order.cabinId}`
  return ""
}

/**
 * Only mounted while the dialog is open, so its cart/destination state
 * always starts fresh from `order` — no effect-based reset needed.
 */
function OrderFormBody({
  tenant,
  order,
  onOpenChange,
}: {
  tenant: string
  order?: Order
  onOpenChange: (open: boolean) => void
}) {
  const isEdit = !!order

  const tablesQuery = useTablesQuery(tenant, { limit: 100 })
  const roomsQuery = useRoomsQuery(tenant, { limit: 100 })
  const cabinsQuery = useCabinsQuery(tenant, { limit: 100 })
  const categoriesQuery = useCategoriesQuery(tenant, { limit: 100 })
  const createOrder = useCreateOrder(tenant)
  const updateOrder = useUpdateOrder(tenant)
  const pending = isEdit ? updateOrder.isPending : createOrder.isPending

  const [selectedDestination, setSelectedDestination] = React.useState(() =>
    destinationFromOrder(order)
  )
  const [selectedCategoryId, setSelectedCategoryId] = React.useState("")
  const [search, setSearch] = React.useState("")
  const [notes, setNotes] = React.useState(order?.notes ?? "")
  const [cart, setCart] = React.useState<CartLine[]>(() => cartFromOrder(order))

  const tables = tablesQuery.data?.tables ?? EMPTY_TABLES
  const rooms = roomsQuery.data?.rooms ?? EMPTY_ROOMS
  const cabins = cabinsQuery.data?.cabins ?? EMPTY_CABINS
  const categories = categoriesQuery.data?.categories ?? EMPTY_CATEGORIES

  const query = search.trim().toLowerCase()
  const activeCategoryId = selectedCategoryId || categories[0]?.id || ""

  // Items for the selected category — fetched per category instead of one
  // capped fetch of everything, so categories with many dishes (or many
  // categories total) don't silently lose items past the page limit.
  const categoryItemsQuery = useMenuItemsQuery(tenant, {
    categoryId: activeCategoryId || undefined,
    limit: 100,
  })
  const categoryItems = categoryItemsQuery.data?.menuItems ?? EMPTY_MENU_ITEMS

  const searchItemsQuery = useMenuItemsQuery(tenant, {
    search: query || undefined,
    limit: 50,
  })
  const searchResults = query ? (searchItemsQuery.data?.menuItems ?? EMPTY_MENU_ITEMS) : []

  const destinationItems = React.useMemo(
    () => ({
      ...Object.fromEntries(tables.map((t) => [`table:${t.id}`, t.name])),
      ...Object.fromEntries(rooms.map((r) => [`room:${r.id}`, `Room ${r.number}`])),
      ...Object.fromEntries(cabins.map((c) => [`cabin:${c.id}`, c.name])),
    }),
    [tables, rooms, cabins]
  )

  const destinationValue =
    selectedDestination || (!order && tables[0] ? `table:${tables[0].id}` : "")
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

  /** Adds/removes one unit of an add-on on a dish's cart line, adding the dish first if needed. */
  function changeAddOnQuantity(item: MenuItem, addOn: AddOnRef, delta: number) {
    setCart((prev) => {
      const existing = prev.find((i) => i.menuItemId === item.id)
      if (!existing) {
        if (delta <= 0) return prev
        return [
          ...prev,
          {
            menuItemId: item.id,
            name: item.name,
            price: item.price,
            quantity: 1,
            addOns: [{ ...addOn, quantity: 1 }],
          },
        ]
      }
      const existingAddOn = existing.addOns.find((a) => a.id === addOn.id)
      const nextQuantity = (existingAddOn?.quantity ?? 0) + delta
      const nextAddOns =
        nextQuantity <= 0
          ? existing.addOns.filter((a) => a.id !== addOn.id)
          : existingAddOn
            ? existing.addOns.map((a) => (a.id === addOn.id ? { ...a, quantity: nextQuantity } : a))
            : [...existing.addOns, { ...addOn, quantity: nextQuantity }]
      return prev.map((i) => (i.menuItemId === item.id ? { ...i, addOns: nextAddOns } : i))
    })
  }

  function send() {
    if (cart.length === 0 || !destination) return

    const payload = {
      tableId: destination.type === "table" ? destination.id : undefined,
      roomId: destination.type === "room" ? destination.id : undefined,
      cabinId: destination.type === "cabin" ? destination.id : undefined,
      notes: notes.trim() || undefined,
      items: cart.map((line) => ({
        menuItemId: line.menuItemId,
        quantity: line.quantity,
        addOns: line.addOns.map((a) => ({ addOnId: a.id, quantity: a.quantity })),
      })),
    }

    if (order) {
      updateOrder.mutate(
        { id: order.id, input: payload },
        { onSuccess: () => onOpenChange(false) }
      )
    } else {
      createOrder.mutate(payload, { onSuccess: () => onOpenChange(false) })
    }
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
          {item.imageUrl ? (
            <span className="block size-10 shrink-0 overflow-hidden rounded-full">
              {/* eslint-disable-next-line @next/next/no-img-element -- remote ImageKit URL */}
              <img
                src={item.imageUrl}
                alt={item.name}
                className="size-full object-cover"
              />
            </span>
          ) : (
            <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground">
              <UtensilsCrossedIcon className="size-4" />
            </span>
          )}
          <div className="flex min-w-0 flex-1 flex-col">
            <span className="flex items-center gap-1.5 truncate text-sm font-medium">
              <span
                aria-hidden
                title={FOOD_TYPE_LABEL[item.foodType]}
                className={cn("size-2 shrink-0 rounded-full border", FOOD_TYPE_DOT_CLASS[item.foodType])}
              />
              <span className="truncate">{item.name}</span>
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
          <div className="flex flex-wrap items-center gap-1.5 pl-13">
            <span className="text-[11px] text-muted-foreground">Add-ons:</span>
            {item.addOns.map((addOn) => {
              const cartAddOn = inCart?.addOns.find((a) => a.id === addOn.id)
              return cartAddOn ? (
                <span
                  key={addOn.id}
                  className="flex items-center gap-1 rounded-full border border-primary bg-primary text-primary-foreground px-1 py-0.5 text-[11px]"
                >
                  <button
                    type="button"
                    className="cursor-pointer px-0.5"
                    onClick={() => changeAddOnQuantity(item, addOn, -1)}
                  >
                    <MinusIcon className="size-3" />
                  </button>
                  <span className="tabular-nums">
                    {addOn.name} ×{cartAddOn.quantity}
                  </span>
                  <button
                    type="button"
                    className="cursor-pointer px-0.5"
                    onClick={() => changeAddOnQuantity(item, addOn, 1)}
                  >
                    <PlusIcon className="size-3" />
                  </button>
                </span>
              ) : (
                <button
                  key={addOn.id}
                  type="button"
                  onClick={() => changeAddOnQuantity(item, addOn, 1)}
                  className="cursor-pointer rounded-full border border-input px-2 py-0.5 text-[11px] text-muted-foreground transition-colors hover:border-primary hover:text-primary"
                >
                  + {addOn.name}
                  {addOn.price > 0 && ` (${formatCurrency(addOn.price)})`}
                </button>
              )
            })}
          </div>
        )}
      </div>
    )
  }

  return (
    <>
      <DialogHeader>
        <DialogTitle>{isEdit ? "Edit order" : "New order"}</DialogTitle>
        <DialogDescription>
          {isEdit
            ? "Update the destination or items on this ticket."
            : "Build a ticket for a table, room, or cabin and send it to the kitchen."}
        </DialogDescription>
      </DialogHeader>

      <div className="flex max-h-[70vh] flex-col gap-4 overflow-y-auto scrollbar-none px-1 py-1 -mx-1">
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
          <div className="flex max-h-80 flex-col gap-2 overflow-y-auto scrollbar-none">
            {searchResults.length === 0 ? (
              <p className="py-6 text-center text-sm text-muted-foreground">
                No dishes match &ldquo;{search}&rdquo;.
              </p>
            ) : (
              searchResults.map(renderMenuItem)
            )}
          </div>
        ) : (
          <div className="grid grid-cols-[128px_1fr] gap-3">
            <div className="flex max-h-80 flex-col gap-0.5 overflow-y-auto scrollbar-none pr-1">
              {categories.map((category) => (
                <button
                  key={category.id}
                  type="button"
                  onClick={() => setSelectedCategoryId(category.id)}
                  className={cn(
                    "cursor-pointer truncate rounded-md px-2.5 py-2 text-left text-sm transition-colors",
                    category.id === activeCategoryId
                      ? "bg-primary/10 font-medium text-primary"
                      : "text-muted-foreground hover:bg-muted"
                  )}
                >
                  {category.name}
                </button>
              ))}
            </div>
            <div className="flex max-h-80 flex-col gap-2 overflow-y-auto scrollbar-none pl-1">
              {categoryItems.length === 0 ? (
                <p className="py-6 text-center text-sm text-muted-foreground">
                  No dishes in this category.
                </p>
              ) : (
                categoryItems.map(renderMenuItem)
              )}
            </div>
          </div>
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
                        + {item.addOns.map((a) => `${a.name} ×${a.quantity}`).join(", ")}
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

        <Textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Notes for the kitchen (optional)…"
          rows={2}
        />
      </div>

      <DialogFooter className="items-center sm:justify-between">
        <span className="text-sm font-medium">
          Total <span className="tabular-nums">{formatCurrency(total)}</span>
        </span>
        <Button
          disabled={cart.length === 0 || !destination || pending}
          data-icon={pending ? "inline-start" : undefined}
          onClick={send}
        >
          {pending && <Spinner />}
          {pending ? "Saving" : isEdit ? "Save changes" : "Send to Kitchen"}
        </Button>
      </DialogFooter>
    </>
  )
}

export function OrderFormDialog({
  tenant,
  order,
  open,
  onOpenChange,
}: {
  tenant: string
  order?: Order
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-3xl">
        {open && <OrderFormBody tenant={tenant} order={order} onOpenChange={onOpenChange} />}
      </DialogContent>
    </Dialog>
  )
}
