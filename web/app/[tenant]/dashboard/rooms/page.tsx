"use client"

import * as React from "react"

import { ROOM_TYPE_CONFIGS, ROOMS } from "@/lib/mock-data"
import { useMockLoading } from "@/hooks/use-mock-loading"
import type { Room, RoomStatus, RoomType } from "@/types"
import { PageHeader } from "@/components/shared/page-header"
import { SectionCards } from "@/components/shared/section-cards"
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
import { RoomStatusDialog } from "@/features/tenant/dashboard/rooms/room-status-dialog"
import { RoomStatusGrid } from "@/features/tenant/dashboard/rooms/room-status-grid"
import { usePageTitle } from "@/features/tenant/dashboard/page-title-context"

const LEGEND: Array<{ status: RoomStatus; label: string; className: string }> = [
  { status: "available", label: "Available", className: "bg-primary/10 border border-primary/30" },
  { status: "occupied", label: "Occupied", className: "bg-muted border border-muted-foreground/20" },
  { status: "cleaning", label: "Cleaning", className: "bg-secondary border border-secondary" },
  { status: "maintenance", label: "Maintenance", className: "bg-destructive/10 border border-destructive/30" },
]

const TYPE_FILTERS: Array<{ value: "all" | RoomType; label: string }> = [
  { value: "all", label: "All room types" },
  ...ROOM_TYPE_CONFIGS.map((config) => ({ value: config.type, label: config.label })),
]

export default function RoomsPage() {
  usePageTitle("Rooms")
  const loading = useMockLoading()
  const [rooms, setRooms] = React.useState(ROOMS)
  const [selected, setSelected] = React.useState<Room | null>(null)
  const [type, setType] = React.useState<"all" | RoomType>("all")

  const filteredRooms = rooms.filter((r) => type === "all" || r.type === type)

  function updateStatus(roomId: string, status: RoomStatus) {
    setRooms((prev) => prev.map((r) => (r.id === roomId ? { ...r, status } : r)))
    setSelected((prev) => (prev ? { ...prev, status } : prev))
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Rooms"
        description={`${rooms.length} rooms across ${new Set(rooms.map((r) => r.floor)).size} floors — tap a room to update its status`}
        actions={
          <AddRoomDialog
            roomTypes={ROOM_TYPE_CONFIGS}
            onCreate={(room) => setRooms((prev) => [...prev, room])}
          />
        }
      />

      <SectionCards
        loading={loading}
        stats={[
          { label: "Total rooms", value: String(rooms.length) },
          {
            label: "Available",
            value: String(rooms.filter((r) => r.status === "available").length),
          },
          {
            label: "Occupied",
            value: String(rooms.filter((r) => r.status === "occupied").length),
          },
          {
            label: "Needs attention",
            value: String(
              rooms.filter((r) => r.status === "cleaning" || r.status === "maintenance")
                .length
            ),
            description: "Cleaning or maintenance",
          },
        ]}
      />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-4">
          {LEGEND.map((item) => (
            <div key={item.status} className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <span className={`size-2.5 rounded-full ${item.className}`} />
              {item.label}
            </div>
          ))}
        </div>
        <Select value={type} onValueChange={(v) => setType(v as typeof type)}>
          <SelectTrigger className="w-full sm:w-44">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {TYPE_FILTERS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardContent>
          {loading ? (
            <Skeleton className="h-64 w-full" />
          ) : (
            <RoomStatusGrid rooms={filteredRooms} onSelect={setSelected} />
          )}
        </CardContent>
      </Card>

      <RoomStatusDialog
        room={selected}
        onOpenChange={(open) => !open && setSelected(null)}
        onUpdateStatus={updateStatus}
      />
    </div>
  )
}
