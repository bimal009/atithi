"use client";

import * as React from "react";
import { AlertCircleIcon, LayoutIcon, PencilIcon, PlusIcon, Trash2Icon } from "lucide-react";
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

import { useRemoveSection, useSectionsQuery } from "../client/useSections";
import type { Section } from "../types";
import { SectionFormDialog } from "./section-form-dialog";

const searchParser = parseAsString.withDefault("").withOptions({
  history: "replace",
});

const pageParser = parseAsInteger.withDefault(1).withOptions({ history: "replace" });

const PAGE_SIZE = 10;

export function SectionsGrid({ tenant }: { tenant: string }) {
  const [search, setSearch] = useQueryState("q", searchParser);
  const [page, setPage] = useQueryState("page", pageParser);
  const [creating, setCreating] = React.useState(false);
  const [editing, setEditing] = React.useState<Section | null>(null);
  const [pendingDelete, setPendingDelete] = React.useState<Section | null>(null);
  const remove = useRemoveSection(tenant);

  const debouncedSearch = useDebouncedValue(search, 400);
  const sectionsQuery = useSectionsQuery(tenant, { search: debouncedSearch, page, limit: PAGE_SIZE });

  const sections = sectionsQuery.data?.sections ?? [];
  const total = sectionsQuery.data?.total ?? 0;
  const pageCount = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const resetToFirstPage = () => {
    if (page !== 1) setPage(1);
  };

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

  if (sectionsQuery.isError) {
    return (
      <div className="flex flex-col gap-6">
        <PageHeader
          title="Sections"
          description="The seating areas your dining tables get grouped under."
        />
        <Alert variant="destructive">
          <AlertCircleIcon aria-hidden />
          <AlertTitle>Could not load sections</AlertTitle>
          <AlertDescription>{getErrorMessage(sectionsQuery.error)}</AlertDescription>
        </Alert>
      </div>
    );
  }

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
        loading={sectionsQuery.isPending}
        searchPlaceholder="Search sections…"
        searchValue={search}
        onSearchChange={(value) => {
          setSearch(value);
          resetToFirstPage();
        }}
        page={page}
        pageCount={pageCount}
        onPageChange={setPage}
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
