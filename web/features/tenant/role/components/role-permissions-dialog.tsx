"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircleIcon } from "lucide-react";

import { useRoleQuery } from "../client/useRoles";
import type { Permission, RoleSummary } from "../types";
import { getErrorMessage } from "@/lib/axios";

function groupByResource(permissions: Permission[]) {
  const groups = new Map<string, Permission[]>();
  for (const permission of permissions) {
    const group = groups.get(permission.resource) ?? [];
    group.push(permission);
    groups.set(permission.resource, group);
  }
  return Array.from(groups.entries()).sort(([a], [b]) => a.localeCompare(b));
}

export function RolePermissionsDialog({
  tenant,
  role,
  open,
  onOpenChange,
}: {
  tenant: string;
  role: RoleSummary | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const query = useRoleQuery(tenant, role?.id, open);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{role?.name} permissions</DialogTitle>
          {query.data ? (
            <DialogDescription>
              {query.data.permissions.length} permission
              {query.data.permissions.length === 1 ? "" : "s"} across{" "}
              {groupByResource(query.data.permissions).length} resources.
            </DialogDescription>
          ) : (
            <Skeleton className="h-4 w-48" />
          )}
        </DialogHeader>

        <div className="flex max-h-[60vh] flex-col gap-3 overflow-y-auto scrollbar-none py-2">
          {query.isPending ? (
            Array.from({ length: 4 }).map((_, index) => (
              <Skeleton key={index} className="h-12 w-full" />
            ))
          ) : query.isError ? (
            <Alert variant="destructive">
              <AlertCircleIcon aria-hidden />
              <AlertTitle>Could not load permissions</AlertTitle>
              <AlertDescription>{getErrorMessage(query.error)}</AlertDescription>
            </Alert>
          ) : (
            groupByResource(query.data.permissions).map(([resource, group]) => (
              <div key={resource} className="flex flex-col gap-1.5 rounded-lg border p-3">
                <span className="text-sm font-medium capitalize">{resource}</span>
                <div className="flex flex-wrap gap-1.5">
                  {group.map((permission) => (
                    <Badge key={permission.id} variant="secondary" className="font-normal">
                      {permission.action}
                    </Badge>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
