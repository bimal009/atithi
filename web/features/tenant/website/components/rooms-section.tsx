import { BedIcon, UsersIcon } from "lucide-react";

import { EmptyState } from "@/components/shared/empty-state";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { RoomType } from "@/features/tenant/roomType/types";

export function RoomsSection({
  roomTypes,
  formatMoney,
}: {
  roomTypes: RoomType[];
  formatMoney: (amount: number) => string;
}) {
  if (roomTypes.length === 0) {
    return (
      <EmptyState
        icon={BedIcon}
        title="No room types yet"
        description="Add room types to showcase them here."
      />
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {roomTypes.map((room) => (
        <Card key={room.id}>
          <CardHeader>
            <div className="flex size-11 items-center justify-center rounded-full bg-primary/10 text-primary">
              <BedIcon className="size-5" />
            </div>
            <CardTitle className="mt-2 text-base">{room.name}</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            {room.description && (
              <p className="line-clamp-2 text-sm text-muted-foreground">{room.description}</p>
            )}
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1 text-sm text-muted-foreground">
                <UsersIcon className="size-3.5" />
                Up to {room.capacity}
              </span>
              <span className="text-sm font-semibold">
                {formatMoney(room.basePrice)}
                {room.pricingLabel && (
                  <span className="font-normal text-muted-foreground"> / {room.pricingLabel}</span>
                )}
              </span>
            </div>
            {room.amenities.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {room.amenities.slice(0, 4).map((a) => (
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
