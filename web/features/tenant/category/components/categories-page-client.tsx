"use client";

import { AlertCircleIcon } from "lucide-react";
import { parseAsInteger, parseAsString, useQueryState } from "nuqs";

import { PageHeader } from "@/components/shared/page-header";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { getErrorMessage } from "@/lib/axios";

import { useCategoriesQuery } from "../client/useCategories";
import { CategoriesGrid } from "./categories-grid";

const searchParser = parseAsString.withDefault("").withOptions({
  history: "replace",
});

const pageParser = parseAsInteger.withDefault(1).withOptions({ history: "replace" });

const PAGE_SIZE = 12;

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
  const [search, setSearch] = useQueryState("q", searchParser);
  const [page, setPage] = useQueryState("page", pageParser);

  const debouncedSearch = useDebouncedValue(search, 400);
  const categoriesQuery = useCategoriesQuery(tenant, {
    search: debouncedSearch,
    page,
    limit: PAGE_SIZE,
  });

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

  const total = categoriesQuery.data.total;
  const pageCount = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <CategoriesGrid
      tenant={tenant}
      categories={categoriesQuery.data.categories}
      total={total}
      search={search}
      onSearchChange={(value) => {
        setSearch(value);
        if (page !== 1) setPage(1);
      }}
      page={page}
      pageCount={pageCount}
      onPageChange={setPage}
    />
  );
}
