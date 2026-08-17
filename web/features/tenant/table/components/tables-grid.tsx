"use client";

import * as React from "react";
import { AlertCircleIcon, PlusIcon, UtensilsIcon } from "lucide-react";
import { debounce, parseAsString, parseAsStringLiteral, useQueryState } from "nuqs";

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
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { PageHeader } from "@/components/shared/page-header";
import { SectionCards } from "@/components/shared/section-cards";
import { getErrorMessage } from "@/lib/axios";
import type { RoomStatus } from "@/types";

import { useRemoveTable, useTablesQuery, useUpdateTableStatus } from "../client/useTables";
import type { DiningTable } from "../types";
import { TableCard } from "./table-card";
import { TableFormDialog } from "./table-form-dialog";

const STATUS_FILTERS: Array<{ value: "all" | RoomStatus; label: string }> = [
  { value: "all", label: "All statuses" },
  { value: "available", label: "Available" },
  { value: "occupied", label: "Occupied" },
  { value: "cleaning", label: "Cleaning" },
  { value: "maintenance", label: "Maintenance" },
];

const STATUS_ITEMS = Object.fromEntries(STATUS_FILTERS.map((o) => [o.value, o.label]));

const searchParser = parseAsString.withDefault("").withOptions({
  limitUrlUpdates: debounce(400),
  history: "replace",
});

const statusParser = parseAsStringLiteral([
  "all",
  "available",
  "occupied",
  "cleaning",
  "maintenance",
] as const)
  .withDefault("all")
  .withOptions({ history: "replace" });

export function TablesGrid({ tenant }: { tenant: string }) {
  const [search, setSearch] = useQueryState("q", searchParser);
  const [status, setStatus] = useQueryState("status", statusParser);
  const [creating, setCreating] = React.useState(false);
  const [editingTable, setEditingTable] = React.useState<DiningTable | null>(null);
  const [pendingDelete, setPendingDelete] = React.useState<DiningTable | null>(null);

  const tablesQuery = useTablesQuery(tenant, {
    search,
    status: status === "all" ? undefined : status,
  });

  const updateStatus = useUpdateTableStatus(tenant);
  const remove = useRemoveTable(tenant);

  const tables = tablesQuery.data?.tables ?? [];
  const available = tables.filter((t) => t.status === "available").length;
  const occupied = tables.filter((t) => t.status === "occupied").length;

  if (tablesQuery.isPending) {
    return (
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-col gap-2">
            <Skeleton className="h-7 w-24" />
            <Skeleton className="h-4 w-72" />
          </div>
          <Skeleton className="h-9 w-32" />
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <Skeleton key={index} className="h-72 w-full" />
          ))}
        </div>
      </div>
    );
  }

  if (tablesQuery.isError) {
    return (
      <div className="flex flex-col gap-6">
        <PageHeader title="Tables" description="Every dining table, its photos, and live status." />
        <Alert variant="destructive">
          <AlertCircleIcon aria-hidden />
          <AlertTitle>Could not load tables</AlertTitle>
          <AlertDescription>{getErrorMessage(tablesQuery.error)}</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Tables"
        description="Every dining table, its photos, and live status."
        actions={
          <Button className="cursor-pointer" onClick={() => setCreating(true)}>
            <PlusIcon data-icon="inline-start" aria-hidden />
            Add Table
          </Button>
        }
      />

      <SectionCards
        stats={[
          { label: "Tables", value: String(tables.length) },
          { label: "Available", value: String(available) },
          { label: "Occupied", value: String(occupied) },
        ]}
      />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by table name"
          className="sm:max-w-xs"
        />
        <Select
          items={STATUS_ITEMS}
          value={status}
          onValueChange={(v) => setStatus((v ?? "all") as typeof status)}
        >
          <SelectTrigger className="w-full sm:w-44">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {STATUS_FILTERS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {tables.length === 0 ? (
        <Card className="py-2">
          <CardContent>
            <div className="flex flex-col items-center gap-2 py-12 text-center text-muted-foreground">
              <UtensilsIcon className="size-8" aria-hidden />
              <p>No tables found.</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {tables.map((table) => (
            <TableCard
              key={table.id}
              table={table}
              onEdit={setEditingTable}
              onDelete={setPendingDelete}
              onStatusChange={(t, newStatus) =>
                updateStatus.mutate({ id: t.id, status: newStatus })
              }
            />
          ))}
        </div>
      )}

      <TableFormDialog tenant={tenant} open={creating} onOpenChange={setCreating} />

      <TableFormDialog
        tenant={tenant}
        table={editingTable ?? undefined}
        open={editingTable !== null}
        onOpenChange={(open) => !open && setEditingTable(null)}
      />

      <AlertDialog
        open={pendingDelete !== null}
        onOpenChange={(open) => !open && setPendingDelete(null)}
      >
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
