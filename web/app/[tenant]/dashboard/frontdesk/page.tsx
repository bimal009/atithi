"use client"

import { LogInIcon, LogOutIcon } from "lucide-react"

import {
  getTodayCheckIns,
  getTodayCheckOuts,
  ROOMS,
} from "@/lib/mock-data"
import { formatTime } from "@/lib/utils"
import { useMockLoading } from "@/hooks/use-mock-loading"
import { EmptyState } from "@/components/shared/empty-state"
import { PageHeader } from "@/components/shared/page-header"
import { SectionCard } from "@/components/shared/section-card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { RoomStatusGrid } from "@/features/tenant/dashboard/rooms/room-status-grid"

function initials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase()
}

function GuestList({
  guests,
  emptyLabel,
  timeField,
}: {
  guests: ReturnType<typeof getTodayCheckIns>
  emptyLabel: string
  timeField: "checkIn" | "checkOut"
}) {
  if (guests.length === 0) {
    return <EmptyState icon={LogInIcon} title={emptyLabel} className="mx-5 mb-2" />
  }

  return (
    <ul className="flex flex-col divide-y divide-border px-5">
      {guests.map((guest) => (
        <li key={guest.id} className="flex items-center gap-3 py-3">
          <Avatar size="sm">
            <AvatarFallback>{initials(guest.guestName)}</AvatarFallback>
          </Avatar>
          <div className="flex flex-1 flex-col">
            <span className="text-sm font-medium">{guest.guestName}</span>
            <span className="text-xs text-muted-foreground">
              Room {guest.roomNumber} · {guest.guests} guests
            </span>
          </div>
          <span className="text-xs text-muted-foreground tabular-nums">
            {formatTime(guest[timeField])}
          </span>
        </li>
      ))}
    </ul>
  )
}

export default function FrontDeskOverviewPage() {
  const loading = useMockLoading()
  const checkIns = getTodayCheckIns()
  const checkOuts = getTodayCheckOuts()

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Overview"
        description={new Date().toLocaleDateString("en-US", {
          weekday: "long",
          month: "long",
          day: "numeric",
        })}
      />

      <div className="grid grid-cols-1 gap-4 lg:gap-6 xl:grid-cols-2">
        <SectionCard
          title="Today's check-ins"
          description={`${checkIns.length} guests arriving`}
          flush
        >
          {loading ? (
            <div className="flex flex-col gap-3 px-5 py-2">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-10 w-full" />
              ))}
            </div>
          ) : (
            <GuestList
              guests={checkIns}
              emptyLabel="No arrivals today"
              timeField="checkIn"
            />
          )}
        </SectionCard>

        <SectionCard
          title="Today's check-outs"
          description={`${checkOuts.length} guests departing`}
          flush
        >
          {loading ? (
            <div className="flex flex-col gap-3 px-5 py-2">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-10 w-full" />
              ))}
            </div>
          ) : (
            <GuestList
              guests={checkOuts}
              emptyLabel="No departures today"
              timeField="checkOut"
            />
          )}
        </SectionCard>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Room status</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <Skeleton className="h-40 w-full" />
          ) : (
            <RoomStatusGrid rooms={ROOMS} />
          )}
        </CardContent>
      </Card>
    </div>
  )
}
