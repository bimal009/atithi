"use client"

import type { Room, RoomStatus } from "@/types"
import { formatCurrency } from "@/lib/utils"
import { StatusBadge } from "@/components/shared/status-badge"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

const STATUS_OPTIONS: RoomStatus[] = [
  "available",
  "occupied",
  "cleaning",
  "maintenance",
]

export function RoomStatusDialog({
  room,
  onOpenChange,
  onUpdateStatus,
}: {
  room: Room | null
  onOpenChange: (open: boolean) => void
  onUpdateStatus: (roomId: string, status: RoomStatus) => void
}) {
  return (
    <Dialog open={!!room} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm">
        {room && (
          <>
            <DialogHeader>
              <DialogTitle>Room {room.number}</DialogTitle>
              <DialogDescription className="capitalize">
                {room.type} · Floor {room.floor} · {formatCurrency(room.price)}/night
              </DialogDescription>
            </DialogHeader>

            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Current status</span>
              <StatusBadge status={room.status} />
            </div>

            <div className="grid grid-cols-2 gap-2">
              {STATUS_OPTIONS.map((option) => (
                <Button
                  key={option}
                  variant={option === room.status ? "default" : "outline"}
                  className="capitalize"
                  onClick={() => onUpdateStatus(room.id, option)}
                >
                  {option}
                </Button>
              ))}
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
