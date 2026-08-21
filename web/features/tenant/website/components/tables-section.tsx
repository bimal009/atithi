import { TableIcon, UsersIcon } from "lucide-react";

import { EmptyState } from "@/components/shared/empty-state";
import { Card, CardContent } from "@/components/ui/card";
import type { DiningTable } from "@/features/tenant/table/types";

export function TablesSection({ tables }: { tables: DiningTable[] }) {
  if (tables.length === 0) {
    return (
      <EmptyState
        icon={TableIcon}
        title="No dining tables yet"
        description="Add tables to showcase your dining space here."
      />
    );
  }

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
      {tables.map((table) => (
        <Card key={table.id} size="sm">
          {table.images[0] ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={table.images[0]} alt="" className="h-28 w-full object-cover" />
          ) : (
            <div className="flex h-28 items-center justify-center bg-muted text-muted-foreground">
              <TableIcon className="size-6" />
            </div>
          )}
          <CardContent className="flex items-center justify-between">
            <span className="text-sm font-medium">{table.name}</span>
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              <UsersIcon className="size-3.5" />
              {table.capacity}
            </span>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
