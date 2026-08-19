"use client";

import * as React from "react";
import { LayersIcon, PencilIcon, PlusIcon, Trash2Icon } from "lucide-react";

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

import { useRemoveCategory } from "../client/useCategories";
import type { Category } from "../types";
import { CategoryFormDialog } from "./category-form-dialog";

export function CategoriesGrid({
  tenant,
  categories,
}: {
  tenant: string;
  categories: Category[];
}) {
  const [creating, setCreating] = React.useState(false);
  const [editing, setEditing] = React.useState<Category | null>(null);
  const [pendingDelete, setPendingDelete] = React.useState<Category | null>(null);
  const remove = useRemoveCategory(tenant);

  const columns: DataTableColumn<Category>[] = [
    {
      key: "name",
      header: "Name",
      headerClassName: "pl-5",
      cellClassName: "pl-5 font-medium",
      cell: (c) => c.name,
    },
    {
      key: "action",
      header: "",
      headerClassName: "pr-5",
      cellClassName: "pr-5 text-right",
      cell: (c) => (
        <div className="flex items-center justify-end gap-1">
          <Tooltip>
            <TooltipTrigger
              render={
                <Button
                  variant="ghost"
                  size="icon-sm"
                  className="cursor-pointer"
                  aria-label={`Edit ${c.name}`}
                  onClick={() => setEditing(c)}
                >
                  <PencilIcon aria-hidden />
                </Button>
              }
            />
            <TooltipContent>Edit category</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger
              render={
                <Button
                  variant="ghost"
                  size="icon-sm"
                  className="cursor-pointer text-destructive hover:text-destructive"
                  aria-label={`Delete ${c.name}`}
                  onClick={() => setPendingDelete(c)}
                >
                  <Trash2Icon aria-hidden />
                </Button>
              }
            />
            <TooltipContent>Delete category</TooltipContent>
          </Tooltip>
        </div>
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Categories"
        description="Groups dishes on the menu, such as Starters or Beverages."
        actions={
          <Button className="cursor-pointer" onClick={() => setCreating(true)}>
            <PlusIcon data-icon="inline-start" aria-hidden />
            Add Category
          </Button>
        }
      />

      <DataTable
        columns={columns}
        data={categories}
        getRowId={(c) => c.id}
        searchPlaceholder="Search categories…"
        searchFn={(c, q) => c.name.toLowerCase().includes(q)}
        emptyIcon={LayersIcon}
        emptyTitle="No categories yet"
        emptyDescription="Add one to start organizing your menu."
      />

      <CategoryFormDialog tenant={tenant} open={creating} onOpenChange={setCreating} />

      <CategoryFormDialog
        tenant={tenant}
        category={editing ?? undefined}
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
              Dishes still using this category must be updated first.
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
