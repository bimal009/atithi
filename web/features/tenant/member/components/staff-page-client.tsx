"use client";

import * as React from "react";
import { AlertCircleIcon } from "lucide-react";
import { parseAsInteger, parseAsString, useQueryState } from "nuqs";

import { PageHeader } from "@/components/shared/page-header";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useAssignableRolesQuery,
  useRolesQuery,
} from "@/features/tenant/role/client/useRoles";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { getErrorMessage } from "@/lib/axios";

import { useMembersQuery } from "../client/useMembers";
import { StaffTable } from "./staff-table";

const searchParser = parseAsString.withDefault("").withOptions({
  history: "replace",
});

const pageParser = parseAsInteger.withDefault(1).withOptions({ history: "replace" });

const PAGE_SIZE = 10;

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

export function StaffPageClient({ tenant }: { tenant: string }) {
  const [roleFilter, setRoleFilter] = React.useState("all");
  const [search, setSearch] = useQueryState("q", searchParser);
  const [page, setPage] = useQueryState("page", pageParser);

  const debouncedSearch = useDebouncedValue(search, 400);
  const membersQuery = useMembersQuery(tenant, {
    roleId: roleFilter,
    search: debouncedSearch,
    page,
    limit: PAGE_SIZE,
  });
  const rolesQuery = useRolesQuery(tenant);
  const assignableRolesQuery = useAssignableRolesQuery(tenant);

  const resetToFirstPage = () => {
    if (page !== 1) setPage(1);
  };

  if (membersQuery.isPending || rolesQuery.isPending || assignableRolesQuery.isPending) {
    return <StaffSkeleton />;
  }

  if (membersQuery.isError || rolesQuery.isError || assignableRolesQuery.isError) {
    return (
      <div className="flex flex-col gap-6">
        <PageHeader
          title="Staff"
          description="Your team, and who can do what."
        />
        <Alert variant="destructive">
          <AlertCircleIcon aria-hidden />
          <AlertTitle>Could not load staff</AlertTitle>
          <AlertDescription>
            {getErrorMessage(
              membersQuery.error ?? rolesQuery.error ?? assignableRolesQuery.error,
            )}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const total = membersQuery.data.total;
  const pageCount = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <StaffTable
      tenant={tenant}
      members={membersQuery.data.members}
      total={total}
      roles={rolesQuery.data.roles}
      assignableRoles={assignableRolesQuery.data.roles}
      roleFilter={roleFilter}
      onRoleFilterChange={(value) => {
        setRoleFilter(value);
        resetToFirstPage();
      }}
      search={search}
      onSearchChange={(value) => {
        setSearch(value);
        resetToFirstPage();
      }}
      loading={membersQuery.isFetching}
      page={page}
      pageCount={pageCount}
      onPageChange={setPage}
    />
  );
}
