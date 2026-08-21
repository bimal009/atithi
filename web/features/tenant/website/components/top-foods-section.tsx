import { ChefHatIcon } from "lucide-react";

import { EmptyState } from "@/components/shared/empty-state";
import { Card, CardContent } from "@/components/ui/card";
import type { MenuItem } from "@/features/tenant/menuItem/types";

export function TopFoodsSection({
  menuItems,
  formatMoney,
}: {
  menuItems: MenuItem[];
  formatMoney: (amount: number) => string;
}) {
  if (menuItems.length === 0) {
    return (
      <EmptyState
        icon={ChefHatIcon}
        title="No dishes yet"
        description="Add menu items to feature your best dishes here."
      />
    );
  }

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
      {menuItems.map((item) => (
        <Card key={item.id} size="sm">
          {item.imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={item.imageUrl} alt="" className="h-32 w-full object-cover" />
          ) : (
            <div className="flex h-32 items-center justify-center bg-muted text-muted-foreground">
              <ChefHatIcon className="size-6" />
            </div>
          )}
          <CardContent className="flex flex-col gap-1">
            <span className="truncate text-sm font-medium">{item.name}</span>
            <span className="text-sm text-muted-foreground">{formatMoney(item.price)}</span>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
