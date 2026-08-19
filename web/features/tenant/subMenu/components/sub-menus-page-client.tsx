"use client";

import { AlertCircleIcon } from "lucide-react";
import { parseAsInteger, parseAsString, useQueryState } from "nuqs";

import { PageHeader } from "@/components/shared/page-header";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { getErrorMessage } from "@/lib/axios";

import { useSubMenusQuery } from "../client/useSubMenus";
import { SubMenusGrid } from "./sub-menus-grid";

const searchParser = parseAsString.withDefault("").withOptions({
  history: "replace",
});

const pageParser = parseAsInteger.withDefault(1).withOptions({ history: "replace" });

const PAGE_SIZE = 12;

function SubMenusSkeleton() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-2">
          <Skeleton className="h-7 w-32" />
          <Skeleton className="h-4 w-72" />
        </div>
        <Skeleton className="h-9 w-36" />
      </div>
      <Skeleton className="h-64 w-full" />
    </div>
  );
}

export function SubMenusPageClient({ tenant }: { tenant: string }) {
  const [search, setSearch] = useQueryState("q", searchParser);
  const [page, setPage] = useQueryState("page", pageParser);

  const debouncedSearch = useDebouncedValue(search, 400);
  const subMenusQuery = useSubMenusQuery(tenant, { search: debouncedSearch, page, limit: PAGE_SIZE });

  if (subMenusQuery.isPending) {
    return <SubMenusSkeleton />;
  }

  if (subMenusQuery.isError) {
    return (
      <div className="flex flex-col gap-6">
        <PageHeader
          title="Sub Menu"
          description="Groups categories under a sub-menu."
        />
        <Alert variant="destructive">
          <AlertCircleIcon aria-hidden />
          <AlertTitle>Could not load sub-menus</AlertTitle>
          <AlertDescription>{getErrorMessage(subMenusQuery.error)}</AlertDescription>
        </Alert>
      </div>
    );
  }

  const total = subMenusQuery.data.total;
  const pageCount = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <SubMenusGrid
      tenant={tenant}
      subMenus={subMenusQuery.data.subMenus}
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
