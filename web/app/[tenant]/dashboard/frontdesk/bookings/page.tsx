"use client"

import * as React from "react"
import { CalendarCheckIcon, SearchIcon } from "lucide-react"

import { BOOKINGS, ROOMS } from "@/lib/mock-data"
import { formatDate } from "@/lib/utils"
import { useMockLoading } from "@/hooks/use-mock-loading"
import type { BookingStatus } from "@/types"
import { EmptyState } from "@/components/shared/empty-state"
import { PageHeader } from "@/components/shared/page-header"
import { StatusBadge } from "@/components/shared/status-badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { NewBookingDialog } from "@/features/tenant/dashboard/bookings/new-booking-dialog"

const STATUS_FILTERS: Array<{ value: "all" | BookingStatus; label: string }> = [
  { value: "all", label: "All statuses" },
  { value: "confirmed", label: "Confirmed" },
  { value: "checked-in", label: "Checked in" },
  { value: "checked-out", label: "Checked out" },
  { value: "cancelled", label: "Cancelled" },
]

export default function FrontDeskBookingsPage() {
  const loading = useMockLoading()
  const [bookings, setBookings] = React.useState(BOOKINGS)
  const [search, setSearch] = React.useState("")
  const [status, setStatus] = React.useState<"all" | BookingStatus>("all")

  function setBookingStatus(id: string, next: BookingStatus) {
    setBookings((prev) =>
      prev.map((b) => (b.id === id ? { ...b, status: next } : b))
    )
  }

  const filtered = bookings
    .filter((b) => status === "all" || b.status === status)
    .filter((b) =>
      `${b.guestName} ${b.roomNumber}`
        .toLowerCase()
        .includes(search.toLowerCase())
    )
    .sort((a, b) => +new Date(b.checkIn) - +new Date(a.checkIn))

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Bookings"
        description={`${bookings.length} total reservations`}
        actions={
          <NewBookingDialog
            rooms={ROOMS}
            onCreate={(booking) => setBookings((prev) => [booking, ...prev])}
          />
        }
      />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1 sm:max-w-xs">
          <SearchIcon className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search guest or room…"
            className="pl-8"
          />
        </div>
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
      </div>

      <Card className="gap-0 py-0">
        {loading ? (
          <div className="flex flex-col gap-3 p-5">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-10 w-full" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <CardContent className="py-2">
            <EmptyState
              icon={CalendarCheckIcon}
              title="No bookings found"
              description="Try a different search term or status filter."
            />
          </CardContent>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="pl-5">Guest</TableHead>
                <TableHead>Room</TableHead>
                <TableHead>Check-in</TableHead>
                <TableHead>Check-out</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="pr-5 text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((booking) => (
                <TableRow key={booking.id}>
                  <TableCell className="pl-5">
                    <div className="flex flex-col">
                      <span className="font-medium">{booking.guestName}</span>
                      <span className="text-xs text-muted-foreground">
                        {booking.guestPhone}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="tabular-nums">
                    {booking.roomNumber}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {formatDate(booking.checkIn)}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {formatDate(booking.checkOut)}
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={booking.status} />
                  </TableCell>
                  <TableCell className="pr-5 text-right">
                    {booking.status === "confirmed" && (
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => setBookingStatus(booking.id, "checked-in")}
                      >
                        Check in
                      </Button>
                    )}
                    {booking.status === "checked-in" && (
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => setBookingStatus(booking.id, "checked-out")}
                      >
                        Check out
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Card>
    </div>
  )
}
