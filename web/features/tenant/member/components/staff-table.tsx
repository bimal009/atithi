"use client";

import * as React from "react";
import { UsersIcon } from "lucide-react";

import { DataTable, type DataTableColumn } from "@/components/shared/data-table";
import { PageHeader } from "@/components/shared/page-header";
import { SectionCards } from "@/components/shared/section-cards";
import { StatusBadge } from "@/components/shared/status-badge";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Role } from "@/features/tenant/role/types";

import { AddMemberDialog } from "./add-member-dialog";
import type { Member } from "../types";

export function StaffTable({
  tenant,
  members,
  roles,
}: {
  tenant: string;
  members: Member[];
  roles: Role[];
}) {
  const [roleFilter, setRoleFilter] = React.useState("all");

  const filtered = members.filter(
    (m) => roleFilter === "all" || m.roleId === roleFilter,
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
        <span className="text-muted-foreground tabular-nums">+977 {m.userPhone}</span>
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
      headerClassName: "pr-5",
      cellClassName: "pr-5 text-right",
      cell: (m) => <StatusBadge status={m.status} />,
    },
  ];

  const distinctRoles = new Set(members.map((m) => m.roleId)).size;

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Staff"
        description={`${members.length} team members`}
        actions={<AddMemberDialog tenant={tenant} roles={roles} />}
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
        data={filtered}
        getRowId={(m) => m.id}
        searchPlaceholder="Search by name or email…"
        searchFn={(m, q) => `${m.userName} ${m.userEmail}`.toLowerCase().includes(q)}
        toolbar={
          <Select
            value={roleFilter}
            onValueChange={(value) => setRoleFilter(value ?? "all")}
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
    </div>
  );
}
