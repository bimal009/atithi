"use client"

import * as React from "react"
import { SearchIcon, UsersIcon } from "lucide-react"

import { STAFF } from "@/lib/mock-data"
import { useMockLoading } from "@/hooks/use-mock-loading"
import { EmptyState } from "@/components/shared/empty-state"
import { PageHeader } from "@/components/shared/page-header"
import { StatusBadge } from "@/components/shared/status-badge"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { AddStaffDialog } from "@/features/tenant/dashboard/staff/add-staff-dialog"

export default function OwnerStaffPage() {
  const loading = useMockLoading()
  const [staff, setStaff] = React.useState(STAFF)
  const [search, setSearch] = React.useState("")

  const filtered = staff.filter((s) =>
    `${s.name} ${s.role}`.toLowerCase().includes(search.toLowerCase())
  )

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

      <div className="relative sm:max-w-xs">
        <SearchIcon className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name or role…"
          className="pl-8"
        />
      </div>

      <Card className="gap-0 py-0">
        {loading ? (
          <div className="flex flex-col gap-3 p-5">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-10 w-full" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <CardContent className="py-2">
            <EmptyState
              icon={UsersIcon}
              title="No staff found"
              description="Try a different search term."
            />
          </CardContent>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="pl-5">Name</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Joined</TableHead>
                <TableHead className="pr-5 text-right">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((member) => (
                <TableRow key={member.id}>
                  <TableCell className="pl-5">
                    <div className="flex flex-col">
                      <span className="font-medium">{member.name}</span>
                      <span className="text-xs text-muted-foreground">
                        {member.email}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={member.role} />
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {member.phone}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {new Date(member.joinedAt).toLocaleDateString("en-US", {
                      month: "short",
                      year: "numeric",
                    })}
                  </TableCell>
                  <TableCell className="pr-5 text-right">
                    <StatusBadge status={member.status} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Card>
    </div>
  )
}
