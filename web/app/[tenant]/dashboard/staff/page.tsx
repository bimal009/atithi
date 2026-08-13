"use client"

import * as React from "react"
import { UsersIcon } from "lucide-react"

import { STAFF } from "@/lib/mock-data"
import { ROLE_LABELS } from "@/features/tenant/dashboard/nav-config"
import type { StaffMember, StaffRole } from "@/types"
import { DataTable, type DataTableColumn } from "@/components/shared/data-table"
import { PageHeader } from "@/components/shared/page-header"
import { SectionCards } from "@/components/shared/section-cards"
import { StatusBadge } from "@/components/shared/status-badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { AddStaffDialog } from "@/features/tenant/dashboard/staff/add-staff-dialog"
import { usePageTitle } from "@/features/tenant/dashboard/page-title-context"

const ROLE_FILTERS: Array<{ value: "all" | StaffRole; label: string }> = [
  { value: "all", label: "All roles" },
  { value: "owner", label: ROLE_LABELS.owner },
  { value: "frontdesk", label: ROLE_LABELS.frontdesk },
  { value: "waiter", label: ROLE_LABELS.waiter },
  { value: "kitchen", label: ROLE_LABELS.kitchen },
]

export default function StaffPage() {
  usePageTitle("Staff")
  const [staff, setStaff] = React.useState(STAFF)
  const [role, setRole] = React.useState<"all" | StaffRole>("all")

  const filtered = staff.filter((s) => role === "all" || s.role === role)

  const columns: DataTableColumn<StaffMember>[] = [
    {
      key: "name",
      header: "Name",
      headerClassName: "pl-5",
      cellClassName: "pl-5",
      cell: (s) => (
        <div className="flex flex-col">
          <span className="font-medium">{s.name}</span>
          <span className="text-xs text-muted-foreground">{s.email}</span>
        </div>
      ),
    },
    { key: "role", header: "Role", cell: (s) => <StatusBadge status={s.role} /> },
    { key: "phone", header: "Phone", cell: (s) => <span className="text-muted-foreground">{s.phone}</span> },
    {
      key: "joined",
      header: "Joined",
      cell: (s) => (
        <span className="text-muted-foreground">
          {new Date(s.joinedAt).toLocaleDateString("en-US", {
            month: "short",
            year: "numeric",
          })}
        </span>
      ),
    },
    {
      key: "status",
      header: "",
      headerClassName: "pr-5",
      cellClassName: "pr-5 text-right",
      cell: (s) => <StatusBadge status={s.status} />,
    },
  ]

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Staff"
        description={`${staff.length} team members`}
        actions={
          <AddStaffDialog
            onCreate={(member) => setStaff((prev) => [...prev, member])}
          />
        }
      />

      <SectionCards
        stats={[
          { label: "Total staff", value: String(staff.length) },
          {
            label: "Active",
            value: String(staff.filter((s) => s.status === "active").length),
          },
          {
            label: "Front desk",
            value: String(staff.filter((s) => s.role === "frontdesk").length),
          },
          {
            label: "Kitchen & waiters",
            value: String(
              staff.filter((s) => s.role === "kitchen" || s.role === "waiter").length
            ),
          },
        ]}
      />

      <DataTable
        columns={columns}
        data={filtered}
        getRowId={(s) => s.id}
        searchPlaceholder="Search by name or email…"
        searchFn={(s, q) => `${s.name} ${s.email}`.toLowerCase().includes(q)}
        toolbar={
          <Select value={role} onValueChange={(v) => setRole(v as typeof role)}>
            <SelectTrigger className="w-full sm:w-44">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {ROLE_FILTERS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
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
  )
}
