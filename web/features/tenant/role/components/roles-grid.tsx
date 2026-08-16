"use client";

import { ShieldIcon, ShieldUserIcon } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/shared/page-header";
import { SectionCards } from "@/components/shared/section-cards";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import type { Role } from "../types";

export function RolesGrid({ roles }: { roles: Role[] }) {
  const totalMembers = roles.reduce((sum, r) => sum + r.memberCount, 0);
  const totalPermissions = new Set(
    roles.flatMap((r) => r.permissions.map((p) => p.id)),
  ).size;

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Roles & Permissions"
        description="What each role can see and do. System roles can't be removed."
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
          {roles.map((role) => {
            const resources = Array.from(
              new Set(role.permissions.map((p) => p.resource)),
            ).sort();

            return (
              <Card key={role.id}>
                <CardHeader className="grid-cols-[1fr_auto]">
                  <div>
                    <CardTitle>{role.name}</CardTitle>
                    {role.description && (
                      <CardDescription>{role.description}</CardDescription>
                    )}
                  </div>
                  {role.isSystem && (
                    <Badge variant="outline" className="gap-1 font-normal">
                      <ShieldUserIcon aria-hidden />
                      System
                    </Badge>
                  )}
                </CardHeader>
                <CardContent className="flex flex-col gap-3">
                  <div className="flex flex-wrap gap-1.5">
                    {resources.map((resource) => (
                      <Badge
                        key={resource}
                        variant="secondary"
                        className="font-normal capitalize"
                      >
                        {resource}
                      </Badge>
                    ))}
                  </div>

                  <div className="flex items-center justify-between border-t pt-3 text-sm text-muted-foreground">
                    <span>{role.permissions.length} permissions</span>
                    <span>
                      {role.memberCount}{" "}
                      {role.memberCount === 1 ? "member" : "members"}
                    </span>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
