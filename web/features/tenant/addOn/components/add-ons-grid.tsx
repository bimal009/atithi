"use client";

import * as React from "react";
import { AlertCircleIcon, PencilIcon, PlusIcon, SparkleIcon, Trash2Icon } from "lucide-react";
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

import { useAddOnsQuery, useRemoveAddOn, useUpdateAddOn } from "../client/useAddOns";
import type { AddOn } from "../types";
import { AddOnFormDialog } from "./add-on-form-dialog";

const searchParser = parseAsString.withDefault("").withOptions({
  history: "replace",
});

const pageParser = parseAsInteger.withDefault(1).withOptions({ history: "replace" });

const PAGE_SIZE = 10;

export function AddOnsGrid({ tenant }: { tenant: string }) {
  const [search, setSearch] = useQueryState("q", searchParser);
  const [page, setPage] = useQueryState("page", pageParser);
  const [creating, setCreating] = React.useState(false);
  const [editingAddOn, setEditingAddOn] = React.useState<AddOn | null>(null);
  const [pendingDelete, setPendingDelete] = React.useState<AddOn | null>(null);

  const debouncedSearch = useDebouncedValue(search, 400);
  const addOnsQuery = useAddOnsQuery(tenant, { search: debouncedSearch, page, limit: PAGE_SIZE });

  const update = useUpdateAddOn(tenant);
  const remove = useRemoveAddOn(tenant);

  const addOns = addOnsQuery.data?.addOns ?? [];
  const total = addOnsQuery.data?.total ?? 0;
  const pageCount = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const available = addOns.filter((a) => a.available).length;
  const free = addOns.filter((a) => a.price === 0).length;

  const resetToFirstPage = () => {
    if (page !== 1) setPage(1);
  };

  const columns: DataTableColumn<AddOn>[] = [
    {
      key: "photo",
      header: "",
      headerClassName: "pl-5 w-14",
      cellClassName: "pl-5",
      cell: (addOn) =>
        addOn.imageUrl ? (
          <span className="block size-10 shrink-0 overflow-hidden rounded-full">
            {/* eslint-disable-next-line @next/next/no-img-element -- remote ImageKit URL */}
            <img
              src={addOn.imageUrl}
              alt={addOn.name}
              className="size-full object-cover"
            />
          </span>
        ) : (
          <span className="flex size-10 items-center justify-center rounded-full bg-muted text-muted-foreground">
            <SparkleIcon className="size-4" />
          </span>
        ),
    },
    {
      key: "name",
      header: "Add-on",
      cell: (addOn) => <span className="font-medium">{addOn.name}</span>,
    },
    {
      key: "price",
      header: "Price",
      cell: (addOn) => (
        <span className="tabular-nums">
          {addOn.price === 0 ? "Free" : formatCurrency(addOn.price)}
        </span>
      ),
    },
    {
      key: "available",
      header: "Available",
      cell: (addOn) => (
        <Switch
          checked={addOn.available}
          onCheckedChange={(checked) =>
            update.mutate({ id: addOn.id, input: { available: checked } })
          }
          aria-label={`Toggle availability for ${addOn.name}`}
        />
      ),
    },
    {
      key: "action",
      header: "",
      headerClassName: "pr-5",
      cellClassName: "pr-5 text-right",
      cell: (addOn) => (
        <div className="flex items-center justify-end gap-1">
          <Tooltip>
            <TooltipTrigger
              render={
                <Button
                  variant="ghost"
                  size="icon-sm"
                  className="cursor-pointer"
                  aria-label={`Edit ${addOn.name}`}
                  onClick={() => setEditingAddOn(addOn)}
                >
                  <PencilIcon aria-hidden />
                </Button>
              }
            />
            <TooltipContent>Edit add-on</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger
              render={
                <Button
                  variant="ghost"
                  size="icon-sm"
                  className="cursor-pointer text-destructive hover:text-destructive"
                  aria-label={`Remove ${addOn.name}`}
                  onClick={() => setPendingDelete(addOn)}
                >
                  <Trash2Icon aria-hidden />
                </Button>
              }
            />
            <TooltipContent>Remove add-on</TooltipContent>
          </Tooltip>
        </div>
      ),
    },
  ];

  if (addOnsQuery.isError) {
    return (
      <div className="flex flex-col gap-6">
        <PageHeader
          title="Add-ons"
          description="Optional extras guests can add to a dish when ordering."
        />
        <Alert variant="destructive">
          <AlertCircleIcon aria-hidden />
          <AlertTitle>Could not load add-ons</AlertTitle>
          <AlertDescription>{getErrorMessage(addOnsQuery.error)}</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Add-ons"
        description="Optional extras guests can add to a dish when ordering."
        actions={
          <Button className="cursor-pointer" onClick={() => setCreating(true)}>
            <PlusIcon data-icon="inline-start" aria-hidden />
            Add Add-on
          </Button>
        }
      />

      <SectionCards
        stats={[
          { label: "Add-ons", value: String(total) },
          { label: "Available", value: String(available), description: "On this page" },
          { label: "Free", value: String(free), description: "On this page" },
        ]}
      />

      <DataTable
        columns={columns}
        data={addOns}
        getRowId={(addOn) => addOn.id}
        loading={addOnsQuery.isPending}
        searchPlaceholder="Search add-ons…"
        searchValue={search}
        onSearchChange={(value) => {
          setSearch(value);
          resetToFirstPage();
        }}
        page={page}
        pageCount={pageCount}
        onPageChange={setPage}
        emptyIcon={SparkleIcon}
        emptyTitle="No add-ons yet"
        emptyDescription="Add your first add-on to offer it during ordering."
      />

      <AddOnFormDialog tenant={tenant} open={creating} onOpenChange={setCreating} />

      <AddOnFormDialog
        tenant={tenant}
        addOn={editingAddOn ?? undefined}
        open={editingAddOn !== null}
        onOpenChange={(open) => !open && setEditingAddOn(null)}
      />

      <AlertDialog open={pendingDelete !== null} onOpenChange={(open) => !open && setPendingDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove {pendingDelete?.name}?</AlertDialogTitle>
            <AlertDialogDescription>
              This removes it from your add-ons. It stays in the shared dish catalog for other hotels.
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
