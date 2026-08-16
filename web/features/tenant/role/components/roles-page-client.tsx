"use client";

import { useParams } from "next/navigation";
import { AlertCircleIcon } from "lucide-react";

import { PageHeader } from "@/components/shared/page-header";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { usePageTitle } from "@/features/tenant/dashboard/page-title-context";
import { getErrorMessage } from "@/lib/axios";

import {
  useHotelRolesQuery,
  usePermissionsQuery,
  useSystemRolesQuery,
} from "../client/useRoles";
import { RolesGrid } from "./roles-grid";

function RolesSkeleton() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-2">
          <Skeleton className="h-7 w-56" />
          <Skeleton className="h-4 w-72" />
        </div>
        <Skeleton className="h-9 w-28" />
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <Skeleton key={index} className="h-24 w-full" />
        ))}
      </div>
      <Skeleton className="h-9 w-56" />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <Skeleton key={index} className="h-40 w-full" />
        ))}
      </div>
    </div>
  );
}

export function RolesPageClient() {
  usePageTitle("Roles & Permissions");
  const { tenant } = useParams<{ tenant: string }>();

  const systemQuery = useSystemRolesQuery(tenant);
  const hotelQuery = useHotelRolesQuery(tenant);
  const permissionsQuery = usePermissionsQuery(tenant);

  if (systemQuery.isPending || hotelQuery.isPending || permissionsQuery.isPending) {
    return <RolesSkeleton />;
  }

  if (systemQuery.isError || hotelQuery.isError || permissionsQuery.isError) {
    return (
      <div className="flex flex-col gap-6">
        <PageHeader
          title="Roles & Permissions"
          description="What each role can see and do."
        />
        <Alert variant="destructive">
          <AlertCircleIcon aria-hidden />
          <AlertTitle>Could not load roles</AlertTitle>
          <AlertDescription>
            {getErrorMessage(
              systemQuery.error ?? hotelQuery.error ?? permissionsQuery.error,
            )}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <RolesGrid
      tenant={tenant}
      systemRoles={systemQuery.data.roles}
      hotelRoles={hotelQuery.data.roles}
      permissions={permissionsQuery.data.permissions}
    />
  );
}
