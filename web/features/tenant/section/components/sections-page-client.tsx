"use client";

import { AlertCircleIcon } from "lucide-react";

import { PageHeader } from "@/components/shared/page-header";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { getErrorMessage } from "@/lib/axios";

import { useSectionsQuery } from "../client/useSections";
import { SectionsGrid } from "./sections-grid";

function SectionsSkeleton() {
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

export function SectionsPageClient({ tenant }: { tenant: string }) {
  const sectionsQuery = useSectionsQuery(tenant);

  if (sectionsQuery.isPending) {
    return <SectionsSkeleton />;
  }

  if (sectionsQuery.isError) {
    return (
      <div className="flex flex-col gap-6">
        <PageHeader
          title="Sections"
          description="The seating areas your dining tables get grouped under."
        />
        <Alert variant="destructive">
          <AlertCircleIcon aria-hidden />
          <AlertTitle>Could not load sections</AlertTitle>
          <AlertDescription>{getErrorMessage(sectionsQuery.error)}</AlertDescription>
        </Alert>
      </div>
    );
  }

  return <SectionsGrid tenant={tenant} sections={sectionsQuery.data} />;
}
