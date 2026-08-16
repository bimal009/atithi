"use client";

import * as React from "react";
import { useParams } from "next/navigation";
import { AlertCircleIcon } from "lucide-react";
import { debounce, parseAsString, useQueryState } from "nuqs";

import { PageHeader } from "@/components/shared/page-header";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { getErrorMessage } from "@/lib/axios";

import { useCustomersQuery } from "../client/useCustomers";
import { CustomersTable } from "./customers-table";

const searchParser = parseAsString.withDefault("").withOptions({
  limitUrlUpdates: debounce(400),
  history: "replace",
});

function CustomersSkeleton() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-2">
          <Skeleton className="h-7 w-32" />
          <Skeleton className="h-4 w-48" />
        </div>
        <Skeleton className="h-9 w-36" />
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

export function CustomersPageClient() {
  const { tenant } = useParams<{ tenant: string }>();

  const [search, setSearch] = useQueryState("q", searchParser);
  const customersQuery = useCustomersQuery(tenant, search);

  if (customersQuery.isPending) {
    return <CustomersSkeleton />;
  }

  if (customersQuery.isError) {
    return (
      <div className="flex flex-col gap-6">
        <PageHeader title="Customers" description="Your guests, on record." />
        <Alert variant="destructive">
          <AlertCircleIcon aria-hidden />
          <AlertTitle>Could not load customers</AlertTitle>
          <AlertDescription>{getErrorMessage(customersQuery.error)}</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <CustomersTable
      tenant={tenant}
      customers={customersQuery.data.customers}
      search={search}
      onSearchChange={setSearch}
      loading={customersQuery.isFetching}
    />
  );
}
