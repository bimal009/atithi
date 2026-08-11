"use client"

import type { Room, RoomStatus } from "@/types"
import { cn } from "@/lib/utils"

const STATUS_TILE: Record<RoomStatus, string> = {
  available: "border-primary/30 bg-primary/5 text-primary hover:bg-primary/10",
  occupied:
    "border-muted-foreground/20 bg-muted text-foreground hover:bg-muted/70",
  cleaning:
    "border-secondary bg-secondary text-secondary-foreground hover:bg-secondary/70",
  maintenance:
    "border-destructive/30 bg-destructive/10 text-destructive hover:bg-destructive/20",
}

export function RoomStatusGrid({
  rooms,
  onSelect,
}: {
  rooms: Room[]
  onSelect?: (room: Room) => void
}) {
  const floors = Array.from(new Set(rooms.map((r) => r.floor))).sort(
    (a, b) => a - b
  )

  return (
    <div className="flex flex-col gap-4">
      {floors.map((floor) => (
        <div key={floor} className="flex flex-col gap-2">
          <span className="text-xs font-medium text-muted-foreground">
            Floor {floor}
          </span>
          <div className="grid grid-cols-4 gap-2 sm:grid-cols-6 lg:grid-cols-8">
            {rooms
              .filter((r) => r.floor === floor)
              .map((room) => (
                <button
                  key={room.id}
                  type="button"
                  disabled={!onSelect}
                  onClick={() => onSelect?.(room)}
                  className={cn(
                    "flex flex-col items-center justify-center gap-0.5 rounded-lg border py-3 text-sm font-medium tabular-nums transition-colors",
                    STATUS_TILE[room.status],
                    !onSelect && "cursor-default"
                  )}
                >
                  {room.number}
                </button>
              ))}
          </div>
        </div>
      ))}
    </div>
  )
}
