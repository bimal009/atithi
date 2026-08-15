"use client"

import { CheckIcon, ShieldIcon, ShieldUserIcon } from "lucide-react"

import { getRoleStats } from "@/lib/mock-data"
import { Badge } from "@/components/ui/badge"
import { PageHeader } from "@/components/shared/page-header"
import { SectionCards } from "@/components/shared/section-cards"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { usePageTitle } from "@/features/tenant/dashboard/page-title-context"

export default function RolesPage() {
  usePageTitle("Roles & Permissions")
  const roles = getRoleStats()

  const totalMembers = roles.reduce((sum, r) => sum + r.memberCount, 0)
  const totalPermissions = new Set(roles.flatMap((r) => r.permissions)).size

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Roles & Permissions"
        description="What each role can see and do. Owner and the built-in roles can't be removed."
      />

      <SectionCards
        stats={[
          { label: "Roles", value: String(roles.length) },
          { label: "Staff assigned", value: String(totalMembers) },
          { label: "Distinct permissions", value: String(totalPermissions) },
        ]}
      />

      {roles.length === 0 ? (
        <Card className="py-2">
          <CardContent>
            <div className="flex flex-col items-center gap-2 py-12 text-center text-muted-foreground">
              <ShieldIcon className="size-8" aria-hidden />
              <p>No roles defined yet.</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {roles.map((role) => (
            <Card key={role.slug}>
              <CardHeader className="grid-cols-[1fr_auto]">
                <div>
                  <CardTitle>{role.name}</CardTitle>
                  <CardDescription>{role.description}</CardDescription>
                </div>
                {role.isSystem && (
                  <Badge variant="outline" className="gap-1 font-normal">
                    <ShieldUserIcon aria-hidden />
                    System
                  </Badge>
                )}
              </CardHeader>
              <CardContent className="flex flex-col gap-3">
                <ul className="flex flex-col gap-1.5">
                  {role.permissions.map((permission) => (
                    <li
                      key={permission}
                      className="flex items-center gap-2 text-sm text-muted-foreground"
                    >
                      <CheckIcon className="size-3.5 shrink-0 text-primary" aria-hidden />
                      {permission}
                    </li>
                  ))}
                </ul>

                <p className="border-t pt-3 text-sm text-muted-foreground">
                  {role.memberCount} {role.memberCount === 1 ? "member" : "members"}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
