"use client";

import * as React from "react";
import { MoreHorizontalIcon, PencilIcon, Trash2Icon, UsersIcon } from "lucide-react";

import { DataTable, type DataTableColumn } from "@/components/shared/data-table";
import { PageHeader } from "@/components/shared/page-header";
import { SectionCards } from "@/components/shared/section-cards";
import { StatusBadge } from "@/components/shared/status-badge";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { RoleSummary } from "@/features/tenant/role/types";

import { useRemoveMember } from "../client/useMembers";
import type { Member } from "../types";
import { AddMemberDialog } from "./add-member-dialog";
import { EditMemberDialog } from "./edit-member-dialog";

export function StaffTable({
  tenant,
  members,
  roles,
  assignableRoles,
  roleFilter,
  onRoleFilterChange,
  search,
  onSearchChange,
  loading,
}: {
  tenant: string;
  members: Member[];
  roles: RoleSummary[];
  assignableRoles: RoleSummary[];
  roleFilter: string;
  onRoleFilterChange: (roleId: string) => void;
  search: string;
  onSearchChange: (value: string) => void;
  loading?: boolean;
}) {
  const [editingMember, setEditingMember] = React.useState<Member | null>(null);
  const [pendingDelete, setPendingDelete] = React.useState<Member | null>(null);
  const remove = useRemoveMember(tenant);

  const roleFilterItems = React.useMemo(
    () => ({
      all: "All roles",
      ...Object.fromEntries(roles.map((role) => [role.id, role.name])),
    }),
    [roles],
  );

  const columns: DataTableColumn<Member>[] = [
    {
      key: "name",
      header: "Name",
      headerClassName: "pl-5",
      cellClassName: "pl-5",
      cell: (m) => (
        <div className="flex flex-col">
          <span className="font-medium">{m.userName}</span>
          <span className="text-xs text-muted-foreground">{m.userEmail}</span>
        </div>
      ),
    },
    {
      key: "role",
      header: "Role",
      cell: (m) => (
        <Badge variant="outline" className="font-normal">
          {m.roleName}
        </Badge>
      ),
    },
    {
      key: "phone",
      header: "Phone",
      cell: (m) => (
        <span className="text-muted-foreground tabular-nums">{m.userPhone}</span>
      ),
    },
    {
      key: "joined",
      header: "Joined",
      cell: (m) => (
        <span className="text-muted-foreground">
          {m.joinedAt
            ? new Date(m.joinedAt).toLocaleDateString("en-US", {
                month: "short",
                year: "numeric",
              })
            : "—"}
        </span>
      ),
    },
    {
      key: "status",
      header: "",
      cell: (m) => <StatusBadge status={m.status} />,
    },
    {
      key: "actions",
      header: "",
      headerClassName: "pr-5",
      cellClassName: "pr-5 text-right",
      cell: (m) =>
        m.roleSlug === "owner" ? null : (
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-8 cursor-pointer justify-self-end"
                  aria-label={`Actions for ${m.userName}`}
                >
                  <MoreHorizontalIcon aria-hidden />
                </Button>
              }
            />
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                className="cursor-pointer"
                onClick={() => setEditingMember(m)}
              >
                <PencilIcon aria-hidden />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem
                variant="destructive"
                className="cursor-pointer"
                onClick={() => setPendingDelete(m)}
              >
                <Trash2Icon aria-hidden />
                Remove
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ),
    },
  ];

  const distinctRoles = new Set(members.map((m) => m.roleId)).size;

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Staff"
        description={`${members.length} team members`}
        actions={<AddMemberDialog tenant={tenant} roles={assignableRoles} />}
      />

      <SectionCards
        stats={[
          { label: "Total staff", value: String(members.length) },
          {
            label: "Active",
            value: String(members.filter((m) => m.status === "active").length),
          },
          { label: "Roles in use", value: String(distinctRoles) },
        ]}
      />

      <DataTable
        columns={columns}
        data={members}
        loading={loading}
        getRowId={(m) => m.id}
        searchPlaceholder="Search by name, email or phone…"
        searchValue={search}
        onSearchChange={onSearchChange}
        toolbar={
          <Select
            items={roleFilterItems}
            value={roleFilter}
            onValueChange={(value) => onRoleFilterChange(value ?? "all")}
          >
            <SelectTrigger className="w-full sm:w-44">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All roles</SelectItem>
              {roles.map((role) => (
                <SelectItem key={role.id} value={role.id}>
                  {role.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        }
        emptyIcon={UsersIcon}
        emptyTitle="No staff found"
        emptyDescription="Try a different search term or role filter."
      />

      <EditMemberDialog
        tenant={tenant}
        member={editingMember}
        roles={assignableRoles}
        open={editingMember !== null}
        onOpenChange={(open) => !open && setEditingMember(null)}
      />

      <AlertDialog
        open={pendingDelete !== null}
        onOpenChange={(open) => !open && setPendingDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove {pendingDelete?.userName}?</AlertDialogTitle>
            <AlertDialogDescription>
              They&apos;ll lose access to this hotel&apos;s dashboard immediately.
              This can&apos;t be undone.
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
