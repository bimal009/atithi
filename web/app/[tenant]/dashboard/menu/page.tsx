"use client"

import * as React from "react"
import { UtensilsCrossedIcon } from "lucide-react"

import { MENU_CATEGORIES, MENU_ITEMS } from "@/lib/mock-data"
import { formatCurrency } from "@/lib/utils"
import { cn } from "@/lib/utils"
import { FOOD_TYPE_DOT_CLASS, FOOD_TYPE_LABEL } from "@/lib/food-type"
import type { MenuItem } from "@/types"
import { DataTable, type DataTableColumn } from "@/components/shared/data-table"
import { PageHeader } from "@/components/shared/page-header"
import { SectionCards } from "@/components/shared/section-cards"
import { StatusBadge } from "@/components/shared/status-badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { AddDishDialog } from "@/features/tenant/dashboard/menu/add-dish-dialog"

export default function MenuDishesPage() {
  const [items, setItems] = React.useState(MENU_ITEMS)
  const [category, setCategory] = React.useState<"all" | string>("all")

  const filtered = items.filter(
    (item) => category === "all" || item.category === category
  )

  const columns: DataTableColumn<MenuItem>[] = [
    {
      key: "name",
      header: "Dish",
      headerClassName: "pl-5",
      cellClassName: "pl-5",
      cell: (item) => (
        <div className="flex items-center gap-2">
          <span
            aria-hidden
            title={FOOD_TYPE_LABEL[item.foodType]}
            className={cn(
              "size-1.5 shrink-0 rounded-full border",
              FOOD_TYPE_DOT_CLASS[item.foodType]
            )}
          />
          <div className="flex flex-col">
            <span className="font-medium">{item.name}</span>
            {item.addOnIds && item.addOnIds.length > 0 && (
              <span className="text-xs text-muted-foreground">
                {item.addOnIds.length} add-on{item.addOnIds.length > 1 ? "s" : ""}
              </span>
            )}
          </div>
        </div>
      ),
    },
    { key: "category", header: "Category", cell: (item) => item.category },
    {
      key: "price",
      header: "Price",
      cell: (item) => <span className="tabular-nums">{formatCurrency(item.price)}</span>,
    },
    {
      key: "status",
      header: "",
      headerClassName: "pr-5",
      cellClassName: "pr-5 text-right",
      cell: (item) => (
        <StatusBadge status={item.available ? "available" : "unavailable"} />
      ),
    },
  ]

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Dishes"
        description={`${items.length} dishes across ${MENU_CATEGORIES.length} categories`}
        actions={
          <AddDishDialog onCreate={(item) => setItems((prev) => [...prev, item])} />
        }
      />

      <SectionCards
        stats={[
          { label: "Total dishes", value: String(items.length) },
          {
            label: "Available",
            value: String(items.filter((i) => i.available).length),
            description: "Ready to order",
          },
          {
            label: "Veg",
            value: String(items.filter((i) => i.foodType === "veg").length),
            description: `${items.filter((i) => i.foodType === "non-veg").length} non-veg`,
          },
          { label: "Categories", value: String(MENU_CATEGORIES.length) },
        ]}
      />

      <DataTable
        columns={columns}
        data={filtered}
        getRowId={(item) => item.id}
        searchPlaceholder="Search dishes…"
        searchFn={(item, q) => item.name.toLowerCase().includes(q)}
        toolbar={
          <Select value={category} onValueChange={(v) => setCategory(v ?? "all")}>
            <SelectTrigger className="w-full sm:w-44">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All categories</SelectItem>
              {MENU_CATEGORIES.map((c) => (
                <SelectItem key={c} value={c}>
                  {c}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        }
        emptyIcon={UtensilsCrossedIcon}
        emptyTitle="No dishes found"
        emptyDescription="Try a different search term or category filter."
      />
    </div>
  )
}
