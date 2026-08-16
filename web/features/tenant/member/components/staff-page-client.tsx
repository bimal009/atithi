"use client";

import { useParams } from "next/navigation";
import { AlertCircleIcon } from "lucide-react";

import { PageHeader } from "@/components/shared/page-header";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { usePageTitle } from "@/features/tenant/dashboard/page-title-context";
import { useRolesQuery } from "@/features/tenant/role/client/useRoles";
import { getErrorMessage } from "@/lib/axios";

import { useMembersQuery } from "../client/useMembers";
import { StaffTable } from "./staff-table";

function StaffSkeleton() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-2">
          <Skeleton className="h-7 w-24" />
          <Skeleton className="h-4 w-48" />
        </div>
        <Skeleton className="h-9 w-32" />
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <Skeleton key={index} className="h-24 w-full" />
        ))}
      </div>
      <div className="flex flex-col gap-3">
        <Skeleton className="h-9 w-full sm:max-w-xs" />
        <Skeleton className="h-96 w-full" />
      </div>
    </div>
  );
}

export function StaffPageClient() {
  usePageTitle("Staff");
  const { tenant } = useParams<{ tenant: string }>();

  const membersQuery = useMembersQuery(tenant);
  const rolesQuery = useRolesQuery(tenant);

  if (membersQuery.isPending || rolesQuery.isPending) {
    return <StaffSkeleton />;
  }

  if (membersQuery.isError || rolesQuery.isError) {
    return (
      <div className="flex flex-col gap-6">
        <PageHeader title="Staff" description="Your team, and who can do what." />
        <Alert variant="destructive">
          <AlertCircleIcon aria-hidden />
          <AlertTitle>Could not load staff</AlertTitle>
          <AlertDescription>
            {getErrorMessage(membersQuery.error ?? rolesQuery.error)}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <StaffTable
      tenant={tenant}
      members={membersQuery.data.members}
      roles={rolesQuery.data.roles}
    />
  );
}
