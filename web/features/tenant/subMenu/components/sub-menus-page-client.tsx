"use client";

import { AlertCircleIcon } from "lucide-react";

import { PageHeader } from "@/components/shared/page-header";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { getErrorMessage } from "@/lib/axios";

import { useSubMenusQuery } from "../client/useSubMenus";
import { SubMenusGrid } from "./sub-menus-grid";

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
  const subMenusQuery = useSubMenusQuery(tenant);

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

  return <SubMenusGrid tenant={tenant} subMenus={subMenusQuery.data} />;
}
