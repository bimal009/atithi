"use client"

import * as React from "react"
import { CalendarCheckIcon } from "lucide-react"

import { BOOKING_CHANNELS, BOOKINGS, ROOMS } from "@/lib/mock-data"
import { formatCurrency, formatDate } from "@/lib/utils"
import type { Booking, BookingChannel, BookingStatus } from "@/types"
import { DataTable, type DataTableColumn } from "@/components/shared/data-table"
import { PageHeader } from "@/components/shared/page-header"
import { SectionCards } from "@/components/shared/section-cards"
import { StatusBadge } from "@/components/shared/status-badge"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { ChannelBadge } from "@/features/tenant/dashboard/bookings/channel-badge"
import { NewBookingDialog } from "@/features/tenant/dashboard/bookings/new-booking-dialog"
import { usePageTitle } from "@/features/tenant/dashboard/page-title-context"

const STATUS_FILTERS: Array<{ value: "all" | BookingStatus; label: string }> = [
  { value: "all", label: "All statuses" },
  { value: "confirmed", label: "Confirmed" },
  { value: "checked-in", label: "Checked in" },
  { value: "checked-out", label: "Checked out" },
  { value: "cancelled", label: "Cancelled" },
]

const CHANNEL_FILTERS: Array<{ value: "all" | BookingChannel; label: string }> = [
  { value: "all", label: "All channels" },
  ...BOOKING_CHANNELS,
]

export default function BookingsPage() {
  usePageTitle("Bookings")
  const [bookings, setBookings] = React.useState(BOOKINGS)
  const [status, setStatus] = React.useState<"all" | BookingStatus>("all")
  const [channel, setChannel] = React.useState<"all" | BookingChannel>("all")

  function setBookingStatus(id: string, next: BookingStatus) {
    setBookings((prev) =>
      prev.map((b) => (b.id === id ? { ...b, status: next } : b))
    )
  }

  const filtered = bookings
    .filter((b) => status === "all" || b.status === status)
    .filter((b) => channel === "all" || b.channel === channel)
    .sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt))

  const columns: DataTableColumn<Booking>[] = [
    {
      key: "guest",
      header: "Guest",
      headerClassName: "pl-5",
      cellClassName: "pl-5",
      cell: (b) => (
        <div className="flex flex-col">
          <span className="font-medium">{b.guestName}</span>
          <span className="text-xs text-muted-foreground">{b.guestPhone}</span>
        </div>
      ),
    },
    { key: "room", header: "Room", cell: (b) => <span className="tabular-nums">{b.roomNumber}</span> },
    { key: "channel", header: "Channel", cell: (b) => <ChannelBadge channel={b.channel} /> },
    { key: "checkIn", header: "Check-in", cell: (b) => <span className="text-muted-foreground">{formatDate(b.checkIn)}</span> },
    { key: "checkOut", header: "Check-out", cell: (b) => <span className="text-muted-foreground">{formatDate(b.checkOut)}</span> },
    { key: "amount", header: "Amount", cell: (b) => <span className="tabular-nums">{formatCurrency(b.totalAmount)}</span> },
    { key: "status", header: "Status", cell: (b) => <StatusBadge status={b.status} /> },
    {
      key: "action",
      header: "",
      headerClassName: "pr-5",
      cellClassName: "pr-5 text-right",
      cell: (b) => {
        if (b.status === "confirmed") {
          return (
            <Button size="sm" variant="secondary" onClick={() => setBookingStatus(b.id, "checked-in")}>
              Check in
            </Button>
          )
        }
        if (b.status === "checked-in") {
          return (
            <Button size="sm" variant="secondary" onClick={() => setBookingStatus(b.id, "checked-out")}>
              Check out
            </Button>
          )
        }
        return null
      },
    },
  ]

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

      <SectionCards
        stats={[
          { label: "Total bookings", value: String(bookings.length) },
          {
            label: "Confirmed",
            value: String(bookings.filter((b) => b.status === "confirmed").length),
            description: "Awaiting check-in",
          },
          {
            label: "Checked in",
            value: String(bookings.filter((b) => b.status === "checked-in").length),
            description: "Currently staying",
          },
          {
            label: "Checked out",
            value: String(bookings.filter((b) => b.status === "checked-out").length),
            description: "Completed stays",
          },
        ]}
      />

      <DataTable
        columns={columns}
        data={filtered}
        getRowId={(b) => b.id}
        searchPlaceholder="Search guest or room…"
        searchFn={(b, q) => `${b.guestName} ${b.roomNumber}`.toLowerCase().includes(q)}
        toolbar={
          <div className="flex flex-col gap-2 sm:flex-row">
            <Select value={channel} onValueChange={(v) => setChannel(v as typeof channel)}>
              <SelectTrigger className="w-full sm:w-44">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CHANNEL_FILTERS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
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
        }
        emptyIcon={CalendarCheckIcon}
        emptyTitle="No bookings found"
        emptyDescription="Try a different search term or status filter."
      />
    </div>
  )
}
