"use client";

import * as React from "react";
import { AlertCircleIcon, PencilIcon, PlusIcon, ReceiptTextIcon, Trash2Icon } from "lucide-react";
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
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { DataTable, type DataTableColumn } from "@/components/shared/data-table";
import { PageHeader } from "@/components/shared/page-header";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { getErrorMessage } from "@/lib/axios";

import { useBillingTypesQuery, useRemoveBillingType } from "../client/useBillingTypes";
import type { BillingType } from "../types";
import { BillingTypeFormDialog } from "./billing-type-form-dialog";

const searchParser = parseAsString.withDefault("").withOptions({
  history: "replace",
});

const pageParser = parseAsInteger.withDefault(1).withOptions({ history: "replace" });

const PAGE_SIZE = 12;

export function BillingTypesGrid({ tenant }: { tenant: string }) {
  const [search, setSearch] = useQueryState("q", searchParser);
  const [page, setPage] = useQueryState("page", pageParser);
  const [creating, setCreating] = React.useState(false);
  const [editing, setEditing] = React.useState<BillingType | null>(null);
  const [pendingDelete, setPendingDelete] = React.useState<BillingType | null>(null);
  const remove = useRemoveBillingType(tenant);

  const debouncedSearch = useDebouncedValue(search, 400);
  const billingTypesQuery = useBillingTypesQuery(tenant, {
    search: debouncedSearch,
    page,
    limit: PAGE_SIZE,
  });

  const billingTypes = billingTypesQuery.data?.billingTypes ?? [];
  const total = billingTypesQuery.data?.total ?? 0;
  const pageCount = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const resetToFirstPage = () => {
    if (page !== 1) setPage(1);
  };

  const columns: DataTableColumn<BillingType>[] = [
    {
      key: "name",
      header: "Name",
      headerClassName: "pl-5",
      cellClassName: "pl-5 font-medium",
      cell: (b) => b.name,
    },
    {
      key: "action",
      header: "",
      headerClassName: "pr-5",
      cellClassName: "pr-5 text-right",
      cell: (b) => (
        <div className="flex items-center justify-end gap-1">
          <Tooltip>
            <TooltipTrigger
              render={
                <Button
                  variant="ghost"
                  size="icon-sm"
                  className="cursor-pointer"
                  aria-label={`Edit ${b.name}`}
                  onClick={() => setEditing(b)}
                >
                  <PencilIcon aria-hidden />
                </Button>
              }
            />
            <TooltipContent>Edit billing type</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger
              render={
                <Button
                  variant="ghost"
                  size="icon-sm"
                  className="cursor-pointer text-destructive hover:text-destructive"
                  aria-label={`Delete ${b.name}`}
                  onClick={() => setPendingDelete(b)}
                >
                  <Trash2Icon aria-hidden />
                </Button>
              }
            />
            <TooltipContent>Delete billing type</TooltipContent>
          </Tooltip>
        </div>
      ),
    },
  ];

  if (billingTypesQuery.isError) {
    return (
      <div className="flex flex-col gap-6">
        <PageHeader
          title="Billing Types"
          description="How cabins and room types get billed."
        />
        <Alert variant="destructive">
          <AlertCircleIcon aria-hidden />
          <AlertTitle>Could not load billing types</AlertTitle>
          <AlertDescription>{getErrorMessage(billingTypesQuery.error)}</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Billing Types"
        description="How cabins and room types get billed: Per Night, Per Weekend, whatever fits your hotel."
        actions={
          <Button className="cursor-pointer" onClick={() => setCreating(true)}>
            <PlusIcon data-icon="inline-start" aria-hidden />
            Add Billing Type
          </Button>
        }
      />

      <DataTable
        columns={columns}
        data={billingTypes}
        getRowId={(b) => b.id}
        loading={billingTypesQuery.isPending}
        searchPlaceholder="Search billing types…"
        searchValue={search}
        onSearchChange={(value) => {
          setSearch(value);
          resetToFirstPage();
        }}
        page={page}
        pageCount={pageCount}
        onPageChange={setPage}
        emptyIcon={ReceiptTextIcon}
        emptyTitle="No billing types yet"
        emptyDescription="Add one to start pricing cabins and room types."
      />

      <BillingTypeFormDialog tenant={tenant} open={creating} onOpenChange={setCreating} />

      <BillingTypeFormDialog
        tenant={tenant}
        billingType={editing ?? undefined}
        open={editing !== null}
        onOpenChange={(open) => !open && setEditing(null)}
      />

      <AlertDialog
        open={pendingDelete !== null}
        onOpenChange={(open) => !open && setPendingDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete {pendingDelete?.name}?</AlertDialogTitle>
            <AlertDialogDescription>
              Cabins or room types still using this billing type must be updated first.
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
              {remove.isPending ? "Deleting" : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
