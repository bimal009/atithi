"use client";

import * as React from "react";
import { MoreHorizontalIcon, PencilIcon, PlusIcon, Trash2Icon, UsersRoundIcon } from "lucide-react";

import { DataTable, type DataTableColumn } from "@/components/shared/data-table";
import { PageHeader } from "@/components/shared/page-header";
import { SectionCards } from "@/components/shared/section-cards";
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
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { useRemoveCustomer } from "../client/useCustomers";
import { DOCUMENT_TYPE_LABELS } from "../schema";
import type { Customer } from "../types";
import { CustomerFormDialog } from "./customer-form-dialog";

export function CustomersTable({
  tenant,
  customers,
  search,
  onSearchChange,
  loading,
}: {
  tenant: string;
  customers: Customer[];
  search: string;
  onSearchChange: (value: string) => void;
  loading?: boolean;
}) {
  const [creating, setCreating] = React.useState(false);
  const [editingCustomer, setEditingCustomer] = React.useState<Customer | null>(null);
  const [pendingDelete, setPendingDelete] = React.useState<Customer | null>(null);
  const remove = useRemoveCustomer(tenant);

  const withEmail = customers.filter((c) => c.email).length;
  const withDocument = customers.filter((c) => c.documentType).length;

  const columns: DataTableColumn<Customer>[] = [
    {
      key: "name",
      header: "Guest",
      headerClassName: "pl-5",
      cellClassName: "pl-5",
      cell: (c) => (
        <div className="flex flex-col">
          <span className="font-medium">{c.name}</span>
          <span className="text-xs text-muted-foreground">{c.phone}</span>
        </div>
      ),
    },
    {
      key: "email",
      header: "Email",
      cell: (c) => (
        <span className="text-muted-foreground">{c.email ?? "—"}</span>
      ),
    },
    {
      key: "document",
      header: "ID document",
      cell: (c) =>
        c.documentType ? (
          <Badge variant="outline" className="font-normal">
            {DOCUMENT_TYPE_LABELS[c.documentType]} · {c.documentNumber}
          </Badge>
        ) : (
          <span className="text-muted-foreground">—</span>
        ),
    },
    {
      key: "joined",
      header: "Added",
      cell: (c) => (
        <span className="text-muted-foreground">
          {new Date(c.createdAt).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
          })}
        </span>
      ),
    },
    {
      key: "actions",
      header: "",
      headerClassName: "pr-5",
      cellClassName: "pr-5 text-right",
      cell: (c) => (
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button
                variant="ghost"
                size="icon"
                className="size-8 cursor-pointer justify-self-end"
                aria-label={`Actions for ${c.name}`}
              >
                <MoreHorizontalIcon aria-hidden />
              </Button>
            }
          />
          <DropdownMenuContent align="end">
            <DropdownMenuItem
              className="cursor-pointer"
              onClick={() => setEditingCustomer(c)}
            >
              <PencilIcon aria-hidden />
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem
              variant="destructive"
              className="cursor-pointer"
              onClick={() => setPendingDelete(c)}
            >
              <Trash2Icon aria-hidden />
              Remove
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Customers"
        description={`${customers.length} guests on record`}
        actions={
          <Button className="cursor-pointer" onClick={() => setCreating(true)}>
            <PlusIcon data-icon="inline-start" aria-hidden />
            Add Customer
          </Button>
        }
      />

      <SectionCards
        stats={[
          { label: "Total customers", value: String(customers.length) },
          { label: "With email", value: String(withEmail) },
          { label: "With ID document", value: String(withDocument) },
        ]}
      />

      <DataTable
        columns={columns}
        data={customers}
        loading={loading}
        getRowId={(c) => c.id}
        searchPlaceholder="Search by name, phone, email or document…"
        searchValue={search}
        onSearchChange={onSearchChange}
        emptyIcon={UsersRoundIcon}
        emptyTitle="No customers found"
        emptyDescription="Try a different search term."
      />

      <CustomerFormDialog
        tenant={tenant}
        open={creating}
        onOpenChange={setCreating}
      />

      <CustomerFormDialog
        tenant={tenant}
        customer={editingCustomer ?? undefined}
        open={editingCustomer !== null}
        onOpenChange={(open) => !open && setEditingCustomer(null)}
      />

      <AlertDialog
        open={pendingDelete !== null}
        onOpenChange={(open) => !open && setPendingDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove {pendingDelete?.name}?</AlertDialogTitle>
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
              {remove.isPending ? "Removing" : "Remove"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
