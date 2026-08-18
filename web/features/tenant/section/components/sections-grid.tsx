"use client";

import * as React from "react";
import { LayoutIcon, PencilIcon, PlusIcon, Trash2Icon } from "lucide-react";

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

import { useRemoveSection } from "../client/useSections";
import type { Section } from "../types";
import { SectionFormDialog } from "./section-form-dialog";

export function SectionsGrid({
  tenant,
  sections,
}: {
  tenant: string;
  sections: Section[];
}) {
  const [creating, setCreating] = React.useState(false);
  const [editing, setEditing] = React.useState<Section | null>(null);
  const [pendingDelete, setPendingDelete] = React.useState<Section | null>(null);
  const remove = useRemoveSection(tenant);

  const columns: DataTableColumn<Section>[] = [
    {
      key: "name",
      header: "Name",
      headerClassName: "pl-5",
      cellClassName: "pl-5 font-medium",
      cell: (s) => s.name,
    },
    {
      key: "action",
      header: "",
      headerClassName: "pr-5",
      cellClassName: "pr-5 text-right",
      cell: (s) => (
        <div className="flex items-center justify-end gap-1">
          <Tooltip>
            <TooltipTrigger
              render={
                <Button
                  variant="ghost"
                  size="icon-sm"
                  className="cursor-pointer"
                  aria-label={`Edit ${s.name}`}
                  onClick={() => setEditing(s)}
                >
                  <PencilIcon aria-hidden />
                </Button>
              }
            />
            <TooltipContent>Edit section</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger
              render={
                <Button
                  variant="ghost"
                  size="icon-sm"
                  className="cursor-pointer text-destructive hover:text-destructive"
                  aria-label={`Delete ${s.name}`}
                  onClick={() => setPendingDelete(s)}
                >
                  <Trash2Icon aria-hidden />
                </Button>
              }
            />
            <TooltipContent>Delete section</TooltipContent>
          </Tooltip>
        </div>
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Sections"
        description="The seating areas your dining tables get grouped under."
        actions={
          <Button className="cursor-pointer" onClick={() => setCreating(true)}>
            <PlusIcon data-icon="inline-start" aria-hidden />
            Add Section
          </Button>
        }
      />

      <DataTable
        columns={columns}
        data={sections}
        getRowId={(s) => s.id}
        searchPlaceholder="Search sections…"
        searchFn={(s, q) => s.name.toLowerCase().includes(q)}
        emptyIcon={LayoutIcon}
        emptyTitle="No sections yet"
        emptyDescription="Add one to start grouping your dining tables."
      />

      <SectionFormDialog tenant={tenant} open={creating} onOpenChange={setCreating} />

      <SectionFormDialog
        tenant={tenant}
        section={editing ?? undefined}
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
              Tables still using this section must be updated first.
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
