"use client";

import * as React from "react";
import { AlertCircleIcon, PackageOpenIcon, PencilIcon, PlusIcon, Trash2Icon } from "lucide-react";
import { parseAsInteger, parseAsString, useQueryState } from "nuqs";

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
import { Switch } from "@/components/ui/switch";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { DataTable, type DataTableColumn } from "@/components/shared/data-table";
import { PageHeader } from "@/components/shared/page-header";
import { SectionCards } from "@/components/shared/section-cards";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { getErrorMessage } from "@/lib/axios";
import { formatCurrency } from "@/lib/utils";

import { useMenuSetsQuery, useRemoveMenuSet, useUpdateMenuSet } from "../client/useMenuSets";
import type { MenuSet } from "../types";
import { MenuSetFormDialog } from "./menu-set-form-dialog";

function itemsSummary(menuSet: MenuSet) {
  return menuSet.items
    .map((i) => (i.quantity > 1 ? `${i.quantity}× ${i.name}` : i.name))
    .join(", ");
}

const searchParser = parseAsString.withDefault("").withOptions({
  history: "replace",
});

const pageParser = parseAsInteger.withDefault(1).withOptions({ history: "replace" });

const PAGE_SIZE = 10;

export function MenuSetsGrid({ tenant }: { tenant: string }) {
  const [search, setSearch] = useQueryState("q", searchParser);
  const [page, setPage] = useQueryState("page", pageParser);
  const [creating, setCreating] = React.useState(false);
  const [editingMenuSet, setEditingMenuSet] = React.useState<MenuSet | null>(null);
  const [pendingDelete, setPendingDelete] = React.useState<MenuSet | null>(null);

  const debouncedSearch = useDebouncedValue(search, 400);
  const menuSetsQuery = useMenuSetsQuery(tenant, { search: debouncedSearch, page, limit: PAGE_SIZE });

  const update = useUpdateMenuSet(tenant);
  const remove = useRemoveMenuSet(tenant);

  const menuSets = menuSetsQuery.data?.menuSets ?? [];
  const total = menuSetsQuery.data?.total ?? 0;
  const pageCount = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const available = menuSets.filter((s) => s.available).length;
  const avgPrice = menuSets.length
    ? Math.round(menuSets.reduce((sum, s) => sum + s.price, 0) / menuSets.length)
    : 0;

  const resetToFirstPage = () => {
    if (page !== 1) setPage(1);
  };

  const columns: DataTableColumn<MenuSet>[] = [
    {
      key: "name",
      header: "Set",
      headerClassName: "pl-5",
      cellClassName: "pl-5",
      cell: (menuSet) => (
        <div className="flex flex-col">
          <span className="font-medium">{menuSet.name}</span>
          <span className="text-xs text-muted-foreground">{itemsSummary(menuSet)}</span>
        </div>
      ),
    },
    {
      key: "price",
      header: "Price",
      cell: (menuSet) => <span className="tabular-nums">{formatCurrency(menuSet.price)}</span>,
    },
    {
      key: "available",
      header: "Available",
      cell: (menuSet) => (
        <Switch
          checked={menuSet.available}
          onCheckedChange={(checked) =>
            update.mutate({ id: menuSet.id, input: { available: checked } })
          }
          aria-label={`Toggle availability for ${menuSet.name}`}
        />
      ),
    },
    {
      key: "action",
      header: "",
      headerClassName: "pr-5",
      cellClassName: "pr-5 text-right",
      cell: (menuSet) => (
        <div className="flex items-center justify-end gap-1">
          <Tooltip>
            <TooltipTrigger
              render={
                <Button
                  variant="ghost"
                  size="icon-sm"
                  className="cursor-pointer"
                  aria-label={`Edit ${menuSet.name}`}
                  onClick={() => setEditingMenuSet(menuSet)}
                >
                  <PencilIcon aria-hidden />
                </Button>
              }
            />
            <TooltipContent>Edit menu set</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger
              render={
                <Button
                  variant="ghost"
                  size="icon-sm"
                  className="cursor-pointer text-destructive hover:text-destructive"
                  aria-label={`Delete ${menuSet.name}`}
                  onClick={() => setPendingDelete(menuSet)}
                >
                  <Trash2Icon aria-hidden />
                </Button>
              }
            />
            <TooltipContent>Delete menu set</TooltipContent>
          </Tooltip>
        </div>
      ),
    },
  ];

  if (menuSetsQuery.isError) {
    return (
      <div className="flex flex-col gap-6">
        <PageHeader
          title="Menu Set"
          description="Combo deals that bundle a few dishes at a special price."
        />
        <Alert variant="destructive">
          <AlertCircleIcon aria-hidden />
          <AlertTitle>Could not load menu sets</AlertTitle>
          <AlertDescription>{getErrorMessage(menuSetsQuery.error)}</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Menu Set"
        description="Combo deals that bundle a few dishes at a special price."
        actions={
          <Button className="cursor-pointer" onClick={() => setCreating(true)}>
            <PlusIcon data-icon="inline-start" aria-hidden />
            Add Menu Set
          </Button>
        }
      />

      <SectionCards
        stats={[
          { label: "Total sets", value: String(total) },
          { label: "Available", value: String(available), description: "On this page" },
          { label: "Avg. set price", value: formatCurrency(avgPrice), description: "On this page" },
        ]}
      />

      <DataTable
        columns={columns}
        data={menuSets}
        getRowId={(menuSet) => menuSet.id}
        loading={menuSetsQuery.isPending}
        searchPlaceholder="Search menu sets…"
        searchValue={search}
        onSearchChange={(value) => {
          setSearch(value);
          resetToFirstPage();
        }}
        page={page}
        pageCount={pageCount}
        onPageChange={setPage}
        emptyIcon={PackageOpenIcon}
        emptyTitle="No menu sets yet"
        emptyDescription="Bundle a few dishes together to create your first combo."
      />

      <MenuSetFormDialog tenant={tenant} open={creating} onOpenChange={setCreating} />

      <MenuSetFormDialog
        tenant={tenant}
        menuSet={editingMenuSet ?? undefined}
        open={editingMenuSet !== null}
        onOpenChange={(open) => !open && setEditingMenuSet(null)}
      />

      <AlertDialog open={pendingDelete !== null} onOpenChange={(open) => !open && setPendingDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete {pendingDelete?.name}?</AlertDialogTitle>
            <AlertDialogDescription>This can&apos;t be undone.</AlertDialogDescription>
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
              {remove.isPending ? "Deleting" : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
