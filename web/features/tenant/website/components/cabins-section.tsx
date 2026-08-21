import { TentIcon, UsersIcon } from "lucide-react";

import { EmptyState } from "@/components/shared/empty-state";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import type { Cabin } from "@/features/tenant/cabin/types";

export function CabinsSection({
  cabins,
  formatMoney,
}: {
  cabins: Cabin[];
  formatMoney: (amount: number) => string;
}) {
  if (cabins.length === 0) {
    return (
      <EmptyState
        icon={TentIcon}
        title="No cabins yet"
        description="Add cabins to showcase them here."
      />
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {cabins.map((cabin) => (
        <Card key={cabin.id}>
          {cabin.images[0] ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={cabin.images[0]} alt="" className="h-44 w-full object-cover" />
          ) : (
            <div className="flex h-44 items-center justify-center bg-muted text-muted-foreground">
              <TentIcon className="size-8" />
            </div>
          )}
          <CardContent className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className="font-medium">{cabin.name}</span>
              <span className="text-sm font-semibold">{formatMoney(cabin.basePrice)}</span>
            </div>
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <UsersIcon className="size-3.5" />
              Up to {cabin.capacity}
            </div>
            {cabin.amenities.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {cabin.amenities.slice(0, 4).map((a) => (
                  <Badge key={a} variant="outline">
                    {a}
                  </Badge>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
