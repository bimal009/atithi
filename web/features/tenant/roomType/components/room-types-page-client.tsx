"use client";

import { AlertCircleIcon } from "lucide-react";
import { parseAsInteger, parseAsString, useQueryState } from "nuqs";

import { PageHeader } from "@/components/shared/page-header";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { getErrorMessage } from "@/lib/axios";

import { useRoomTypesQuery } from "../client/useRoomTypes";
import { RoomTypesGrid } from "./room-types-grid";

const searchParser = parseAsString.withDefault("").withOptions({
  history: "replace",
});

const pageParser = parseAsInteger.withDefault(1).withOptions({ history: "replace" });

const PAGE_SIZE = 10;

function RoomTypesSkeleton() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-2">
          <Skeleton className="h-7 w-32" />
          <Skeleton className="h-4 w-64" />
        </div>
        <Skeleton className="h-9 w-36" />
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <Skeleton key={index} className="h-40 w-full" />
        ))}
      </div>
    </div>
  );
}

export function RoomTypesPageClient({ tenant }: { tenant: string }) {
  const [search, setSearch] = useQueryState("q", searchParser);
  const [page, setPage] = useQueryState("page", pageParser);

  const debouncedSearch = useDebouncedValue(search, 400);
  const roomTypesQuery = useRoomTypesQuery(tenant, {
    search: debouncedSearch,
    page,
    limit: PAGE_SIZE,
  });

  if (roomTypesQuery.isPending) {
    return <RoomTypesSkeleton />;
  }

  if (roomTypesQuery.isError) {
    return (
      <div className="flex flex-col gap-6">
        <PageHeader
          title="Room Types"
          description="The rate categories every room gets added under."
        />
        <Alert variant="destructive">
          <AlertCircleIcon aria-hidden />
          <AlertTitle>Could not load room types</AlertTitle>
          <AlertDescription>{getErrorMessage(roomTypesQuery.error)}</AlertDescription>
        </Alert>
      </div>
    );
  }

  const total = roomTypesQuery.data.total;
  const pageCount = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <RoomTypesGrid
      tenant={tenant}
      roomTypes={roomTypesQuery.data.roomTypes}
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
