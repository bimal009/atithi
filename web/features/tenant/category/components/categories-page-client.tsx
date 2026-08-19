"use client";

import { AlertCircleIcon } from "lucide-react";

import { PageHeader } from "@/components/shared/page-header";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { getErrorMessage } from "@/lib/axios";

import { useCategoriesQuery } from "../client/useCategories";
import { CategoriesGrid } from "./categories-grid";

function CategoriesSkeleton() {
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

export function CategoriesPageClient({ tenant }: { tenant: string }) {
  const categoriesQuery = useCategoriesQuery(tenant);

  if (categoriesQuery.isPending) {
    return <CategoriesSkeleton />;
  }

  if (categoriesQuery.isError) {
    return (
      <div className="flex flex-col gap-6">
        <PageHeader title="Categories" description="Groups dishes on the menu." />
        <Alert variant="destructive">
          <AlertCircleIcon aria-hidden />
          <AlertTitle>Could not load categories</AlertTitle>
          <AlertDescription>{getErrorMessage(categoriesQuery.error)}</AlertDescription>
        </Alert>
      </div>
    );
  }

  return <CategoriesGrid tenant={tenant} categories={categoriesQuery.data} />;
}
