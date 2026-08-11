"use client"

import * as React from "react"
import { BedDoubleIcon, UsersIcon } from "lucide-react"

import { ROOMS } from "@/lib/mock-data"
import { formatCurrency } from "@/lib/utils"
import { useMockLoading } from "@/hooks/use-mock-loading"
import type { Room, RoomStatus } from "@/types"
import { EmptyState } from "@/components/shared/empty-state"
import { PageHeader } from "@/components/shared/page-header"
import { StatusBadge } from "@/components/shared/status-badge"
import { Card, CardContent } from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { AddRoomDialog } from "@/features/tenant/dashboard/rooms/add-room-dialog"

const STATUS_FILTERS: Array<{ value: "all" | RoomStatus; label: string }> = [
  { value: "all", label: "All statuses" },
  { value: "available", label: "Available" },
  { value: "occupied", label: "Occupied" },
  { value: "cleaning", label: "Cleaning" },
  { value: "maintenance", label: "Maintenance" },
]

export default function OwnerRoomsPage() {
  const loading = useMockLoading()
  const [rooms, setRooms] = React.useState(ROOMS)
  const [status, setStatus] = React.useState<"all" | RoomStatus>("all")

  const filtered = rooms
    .filter((r) => status === "all" || r.status === status)
    .sort((a, b) => a.number.localeCompare(b.number, undefined, { numeric: true }))

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Rooms"
        description={`${rooms.length} rooms across ${new Set(rooms.map((r) => r.floor)).size} floors`}
        actions={
          <AddRoomDialog
            onCreate={(room) => setRooms((prev) => [...prev, room])}
          />
        }
      />

      <Select value={status} onValueChange={(v) => setStatus(v as typeof status)}>
        <SelectTrigger className="w-full sm:w-44">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {STATUS_FILTERS.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {loading ? (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {Array.from({ length: 10 }).map((_, i) => (
            <Skeleton key={i} className="h-32 w-full" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <Card>
          <CardContent className="py-2">
            <EmptyState
              icon={BedDoubleIcon}
              title="No rooms found"
              description="Try a different status filter."
            />
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {filtered.map((room: Room) => (
            <Card key={room.id} className="gap-3">
              <CardContent className="flex flex-col gap-2">
                <div className="flex items-start justify-between">
                  <div className="flex flex-col">
                    <span className="font-heading text-lg font-semibold tabular-nums">
                      {room.number}
                    </span>
                    <span className="text-xs text-muted-foreground capitalize">
                      {room.type} · Floor {room.floor}
                    </span>
                  </div>
                  <StatusBadge status={room.status} />
                </div>
                <div className="mt-1 flex items-center justify-between text-sm">
                  <span className="flex items-center gap-1 text-muted-foreground">
                    <UsersIcon className="size-3.5" />
                    {room.capacity}
                  </span>
                  <span className="font-medium tabular-nums">
                    {formatCurrency(room.price)}
                    <span className="text-xs font-normal text-muted-foreground">
                      /night
                    </span>
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
