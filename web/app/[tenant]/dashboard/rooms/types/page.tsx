"use client"

import * as React from "react"
import { LayoutGridIcon } from "lucide-react"

import { getRoomTypeStats, ROOM_TYPE_CONFIGS } from "@/lib/mock-data"
import { formatCurrency } from "@/lib/utils"
import type { RoomTypeConfig } from "@/types"
import { Badge } from "@/components/ui/badge"
import { PageHeader } from "@/components/shared/page-header"
import { SectionCards } from "@/components/shared/section-cards"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { AddRoomTypeDialog } from "@/features/tenant/dashboard/rooms/add-room-type-dialog"

export default function RoomTypesPage() {
  const [configs, setConfigs] = React.useState<RoomTypeConfig[]>(ROOM_TYPE_CONFIGS)
  const roomTypes = getRoomTypeStats(configs)

  const totalRooms = roomTypes.reduce((sum, t) => sum + t.roomCount, 0)
  const totalOccupied = roomTypes.reduce((sum, t) => sum + t.occupied, 0)
  const avgPrice = roomTypes.length
    ? Math.round(roomTypes.reduce((sum, t) => sum + t.basePrice, 0) / roomTypes.length)
    : 0

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Room Types"
        description="The rate categories every room gets added under — pricing, capacity, and amenities live here."
        actions={
          <AddRoomTypeDialog
            onCreate={(roomType) => setConfigs((prev) => [...prev, roomType])}
          />
        }
      />

      <SectionCards
        stats={[
          { label: "Room types", value: String(roomTypes.length) },
          { label: "Total rooms", value: String(totalRooms) },
          {
            label: "Occupied",
            value: String(totalOccupied),
            description: `of ${totalRooms} rooms`,
          },
          { label: "Average base rate", value: formatCurrency(avgPrice) },
        ]}
      />

      {roomTypes.length === 0 ? (
        <Card className="py-2">
          <CardContent>
            <div className="flex flex-col items-center gap-2 py-12 text-center text-muted-foreground">
              <LayoutGridIcon className="size-8" aria-hidden />
              <p>No room types defined yet.</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {roomTypes.map((type) => (
            <Card key={type.type}>
              <CardHeader>
                <CardTitle>{type.label}</CardTitle>
                <CardDescription>{type.description}</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col gap-3">
                <div className="flex items-baseline justify-between">
                  <span className="text-2xl font-semibold tabular-nums">
                    {formatCurrency(type.basePrice)}
                  </span>
                  <span className="text-xs text-muted-foreground">per night</span>
                </div>

                <div className="flex flex-wrap gap-1.5">
                  {type.amenities.map((amenity) => (
                    <Badge key={amenity} variant="secondary" className="font-normal">
                      {amenity}
                    </Badge>
                  ))}
                </div>

                <div className="flex items-center justify-between border-t pt-3 text-sm text-muted-foreground">
                  <span>Sleeps {type.capacity}</span>
                  <span>
                    {type.occupied} / {type.roomCount} occupied
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
