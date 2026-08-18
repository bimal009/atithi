"use client";

import * as React from "react";
import { PencilIcon, PlusIcon, ReceiptTextIcon, Trash2Icon } from "lucide-react";

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
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { DataTable, type DataTableColumn } from "@/components/shared/data-table";
import { PageHeader } from "@/components/shared/page-header";

import { useRemoveBillingType } from "../client/useBillingTypes";
import type { BillingType } from "../types";
import { BillingTypeFormDialog } from "./billing-type-form-dialog";

export function BillingTypesGrid({
  tenant,
  billingTypes,
}: {
  tenant: string;
  billingTypes: BillingType[];
}) {
  const [creating, setCreating] = React.useState(false);
  const [editing, setEditing] = React.useState<BillingType | null>(null);
  const [pendingDelete, setPendingDelete] = React.useState<BillingType | null>(null);
  const remove = useRemoveBillingType(tenant);

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
        searchPlaceholder="Search billing types…"
        searchFn={(b, q) => b.name.toLowerCase().includes(q)}
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
