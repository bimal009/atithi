"use client";

import { AlertCircleIcon } from "lucide-react";

import { PageHeader } from "@/components/shared/page-header";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { getErrorMessage } from "@/lib/axios";

import { useBillingTypesQuery } from "../client/useBillingTypes";
import { BillingTypesGrid } from "./billing-types-grid";

function BillingTypesSkeleton() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-2">
          <Skeleton className="h-7 w-36" />
          <Skeleton className="h-4 w-72" />
        </div>
        <Skeleton className="h-9 w-40" />
      </div>
      <Skeleton className="h-64 w-full" />
    </div>
  );
}

export function BillingTypesPageClient({ tenant }: { tenant: string }) {
  const billingTypesQuery = useBillingTypesQuery(tenant);

  if (billingTypesQuery.isPending) {
    return <BillingTypesSkeleton />;
  }

  if (billingTypesQuery.isError) {
    return (
      <div className="flex flex-col gap-6">
        <PageHeader
          title="Billing Types"
          description="How cabins and room types get billed."
        />
        <Alert variant="destructive">
          <AlertCircleIcon aria-hidden />
          <AlertTitle>Could not load billing types</AlertTitle>
          <AlertDescription>{getErrorMessage(billingTypesQuery.error)}</AlertDescription>
        </Alert>
      </div>
    );
  }

  return <BillingTypesGrid tenant={tenant} billingTypes={billingTypesQuery.data} />;
}
