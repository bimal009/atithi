"use client";

import * as React from "react";
import { AlertCircleIcon, PencilIcon, PlusIcon, Trash2Icon, UtensilsCrossedIcon } from "lucide-react";
import { parseAsInteger, parseAsString, parseAsStringLiteral, useQueryState } from "nuqs";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { DataTable, type DataTableColumn } from "@/components/shared/data-table";
import { PageHeader } from "@/components/shared/page-header";
import { SectionCards } from "@/components/shared/section-cards";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { getErrorMessage } from "@/lib/axios";
import { cn, formatCurrency } from "@/lib/utils";
import { FOOD_TYPE_DOT_CLASS, FOOD_TYPE_LABEL, FOOD_TYPE_OPTIONS } from "@/lib/food-type";
import type { FoodType } from "@/types";

import { useMenuItemsQuery, useRemoveMenuItem, useUpdateMenuItem } from "../client/useMenuItems";
import type { MenuItem } from "../types";
import { MenuItemFormDialog } from "./menu-item-form-dialog";

const FOOD_TYPE_FILTERS: Array<{ value: "all" | FoodType; label: string }> = [
  { value: "all", label: "All types" },
  ...FOOD_TYPE_OPTIONS,
];

const searchParser = parseAsString.withDefault("").withOptions({
  history: "replace",
});

const foodTypeParser = parseAsStringLiteral(["all", "veg", "non-veg", "vegan", "egg"] as const)
  .withDefault("all")
  .withOptions({ history: "replace" });

const pageParser = parseAsInteger.withDefault(1).withOptions({ history: "replace" });

const PAGE_SIZE = 10;

export function MenuItemsGrid({ tenant }: { tenant: string }) {
  const [search, setSearch] = useQueryState("q", searchParser);
  const [foodType, setFoodType] = useQueryState("type", foodTypeParser);
  const [page, setPage] = useQueryState("page", pageParser);
  const [creating, setCreating] = React.useState(false);
  const [editingItem, setEditingItem] = React.useState<MenuItem | null>(null);
  const [pendingDelete, setPendingDelete] = React.useState<MenuItem | null>(null);

  const debouncedSearch = useDebouncedValue(search, 400);
  const menuItemsQuery = useMenuItemsQuery(tenant, {
    search: debouncedSearch,
    foodType: foodType === "all" ? undefined : foodType,
    page,
    limit: PAGE_SIZE,
  });

  const update = useUpdateMenuItem(tenant);
  const remove = useRemoveMenuItem(tenant);

  const items = menuItemsQuery.data?.menuItems ?? [];
  const total = menuItemsQuery.data?.total ?? 0;
  const pageCount = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const available = items.filter((i) => i.available).length;
  const vegCount = items.filter((i) => i.foodType === "veg").length;

  const resetToFirstPage = () => {
    if (page !== 1) setPage(1);
  };

  const columns: DataTableColumn<MenuItem>[] = [
    {
      key: "photo",
      header: "",
      headerClassName: "pl-5 w-14",
      cellClassName: "pl-5",
      cell: (item) =>
        item.imageUrl ? (
          <span className="block size-10 shrink-0 overflow-hidden rounded-full">
            {/* eslint-disable-next-line @next/next/no-img-element -- remote ImageKit URL */}
            <img
              src={item.imageUrl}
              alt={item.name}
              className="size-full object-cover"
            />
          </span>
        ) : (
          <span className="flex size-10 items-center justify-center rounded-full bg-muted text-muted-foreground">
            <UtensilsCrossedIcon className="size-4" />
          </span>
        ),
    },
    {
      key: "name",
      header: "Dish",
      cell: (item) => (
        <div className="flex items-center gap-2">
          <span
            aria-hidden
            title={FOOD_TYPE_LABEL[item.foodType]}
            className={cn("size-1.5 shrink-0 rounded-full border", FOOD_TYPE_DOT_CLASS[item.foodType])}
          />
          <span className="font-medium">{item.name}</span>
        </div>
      ),
    },
    { key: "category", header: "Category", cell: (item) => item.categoryName },
    {
      key: "price",
      header: "Price",
      cell: (item) => (
        <div className="flex flex-col tabular-nums">
          <span>{formatCurrency(item.price)}</span>
          {item.discount ? (
            <span className="text-xs text-muted-foreground">
              -{formatCurrency(item.discount)} off
            </span>
          ) : null}
        </div>
      ),
    },
    {
      key: "available",
      header: "Available",
      cell: (item) => (
        <Switch
          checked={item.available}
          onCheckedChange={(checked) =>
            update.mutate({ id: item.id, input: { available: checked } })
          }
          aria-label={`Toggle availability for ${item.name}`}
        />
      ),
    },
    {
      key: "action",
      header: "",
      headerClassName: "pr-5",
      cellClassName: "pr-5 text-right",
      cell: (item) => (
        <div className="flex items-center justify-end gap-1">
          <Tooltip>
            <TooltipTrigger
              render={
                <Button
                  variant="ghost"
                  size="icon-sm"
                  className="cursor-pointer"
                  aria-label={`Edit ${item.name}`}
                  onClick={() => setEditingItem(item)}
                >
                  <PencilIcon aria-hidden />
                </Button>
              }
            />
            <TooltipContent>Edit dish</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger
              render={
                <Button
                  variant="ghost"
                  size="icon-sm"
                  className="cursor-pointer text-destructive hover:text-destructive"
                  aria-label={`Remove ${item.name}`}
                  onClick={() => setPendingDelete(item)}
                >
                  <Trash2Icon aria-hidden />
                </Button>
              }
            />
            <TooltipContent>Remove from menu</TooltipContent>
          </Tooltip>
        </div>
      ),
    },
  ];

  if (menuItemsQuery.isError) {
    return (
      <div className="flex flex-col gap-6">
        <PageHeader title="Dishes" description="Every dish on your menu, its photo, price, and availability." />
        <Alert variant="destructive">
          <AlertCircleIcon aria-hidden />
          <AlertTitle>Could not load dishes</AlertTitle>
          <AlertDescription>{getErrorMessage(menuItemsQuery.error)}</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Dishes"
        description="Every dish on your menu, its photo, price, and availability."
        actions={
          <Button className="cursor-pointer" onClick={() => setCreating(true)}>
            <PlusIcon data-icon="inline-start" aria-hidden />
            Add Dish
          </Button>
        }
      />

      <SectionCards
        stats={[
          { label: "Dishes", value: String(total) },
          { label: "Available", value: String(available), description: "On this page" },
          { label: "Veg", value: String(vegCount), description: "On this page" },
        ]}
      />

      <DataTable
        columns={columns}
        data={items}
        getRowId={(item) => item.id}
        loading={menuItemsQuery.isPending}
        searchPlaceholder="Search dishes…"
        searchValue={search}
        onSearchChange={(value) => {
          setSearch(value);
          resetToFirstPage();
        }}
        page={page}
        pageCount={pageCount}
        onPageChange={setPage}
        toolbar={
          <Select
            items={Object.fromEntries(FOOD_TYPE_FILTERS.map((o) => [o.value, o.label]))}
            value={foodType}
            onValueChange={(v) => {
              setFoodType((v ?? "all") as typeof foodType);
              resetToFirstPage();
            }}
          >
            <SelectTrigger className="w-full sm:w-44">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {FOOD_TYPE_FILTERS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        }
        emptyIcon={UtensilsCrossedIcon}
        emptyTitle="No dishes found"
        emptyDescription="Try a different search term or type filter."
      />

      <MenuItemFormDialog tenant={tenant} open={creating} onOpenChange={setCreating} />

      <MenuItemFormDialog
        tenant={tenant}
        menuItem={editingItem ?? undefined}
        open={editingItem !== null}
        onOpenChange={(open) => !open && setEditingItem(null)}
      />

      <AlertDialog open={pendingDelete !== null} onOpenChange={(open) => !open && setPendingDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove {pendingDelete?.name}?</AlertDialogTitle>
            <AlertDialogDescription>
              This removes it from your menu. It stays in the shared dish catalog for other hotels.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="cursor-pointer">Cancel</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              className="cursor-pointer"
              disabled={remove.isPending}
              onClick={async () => {
                if (!pendingDelete) return;
                await remove.mutateAsync(pendingDelete.id);
                setPendingDelete(null);
              }}
            >
              {remove.isPending ? "Removing" : "Remove"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
