"use client"

import { useParams } from "next/navigation"
import { CalendarCheckIcon, ChefHatIcon } from "lucide-react"

import {
  BOOKINGS,
  getActiveKotOrders,
  getRoomStats,
  getTodayBookings,
  getTodayRevenue,
  KOT_ORDERS,
} from "@/lib/mock-data"
import { formatCurrency, formatDate, timeAgo } from "@/lib/utils"
import { useMockLoading } from "@/hooks/use-mock-loading"
import { EmptyState } from "@/components/shared/empty-state"
import { PageHeader } from "@/components/shared/page-header"
import { SectionCard } from "@/components/shared/section-card"
import { StatRow } from "@/components/shared/stat-row"
import { StatusBadge } from "@/components/shared/status-badge"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

function TableSkeleton({ rows = 5, cols = 4 }: { rows?: number; cols?: number }) {
  return (
    <div className="flex flex-col gap-3 px-5 py-2">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-center gap-4">
          {Array.from({ length: cols }).map((_, j) => (
            <Skeleton key={j} className="h-4 flex-1" />
          ))}
        </div>
      ))}
    </div>
  )
}

export default function OwnerOverviewPage() {
  const loading = useMockLoading()
  const params = useParams<{ tenant: string }>()
  const base = `/${params.tenant}/dashboard/owner`

  const { occupancyRate, occupied, total } = getRoomStats()
  const todayBookings = getTodayBookings()
  const activeOrders = getActiveKotOrders()

  const recentBookings = [...BOOKINGS]
    .sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt))
    .slice(0, 6)

  const recentOrders = [...KOT_ORDERS]
    .sort((a, b) => +new Date(b.placedAt) - +new Date(a.placedAt))
    .slice(0, 6)

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

      <StatRow
        loading={loading}
        stats={[
          {
            label: "Arrivals today",
            value: String(todayBookings.length),
            hint: "Guests checking in",
          },
          {
            label: "Occupancy",
            value: `${occupancyRate}%`,
            hint: `${occupied} of ${total} rooms`,
          },
          {
            label: "Active orders",
            value: String(activeOrders.length),
            hint: "In the kitchen queue",
          },
          {
            label: "Revenue today",
            value: formatCurrency(getTodayRevenue()),
            hint: "Rooms and restaurant",
          },
        ]}
      />

      <div className="grid grid-cols-1 gap-4 lg:gap-6 xl:grid-cols-2">
        <SectionCard title="Recent bookings" href={`${base}/bookings`} flush>
          {loading ? (
            <TableSkeleton />
          ) : recentBookings.length === 0 ? (
            <EmptyState
              icon={CalendarCheckIcon}
              title="No bookings yet"
              description="New reservations will appear here as they come in."
              className="mx-5 mb-2"
            />
          ) : (
            <Table className="[&_td]:px-5 [&_th]:px-5">
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead>Guest</TableHead>
                  <TableHead>Room</TableHead>
                  <TableHead>Check-in</TableHead>
                  <TableHead className="text-right">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentBookings.map((booking) => (
                  <TableRow key={booking.id}>
                    <TableCell className="py-3 font-medium">
                      {booking.guestName}
                    </TableCell>
                    <TableCell className="py-3 tabular-nums">
                      {booking.roomNumber}
                    </TableCell>
                    <TableCell className="py-3 text-muted-foreground">
                      {formatDate(booking.checkIn)}
                    </TableCell>
                    <TableCell className="py-3 text-right">
                      <StatusBadge status={booking.status} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </SectionCard>

        <SectionCard title="Recent orders" href={`${base}/kot`} flush>
          {loading ? (
            <TableSkeleton />
          ) : recentOrders.length === 0 ? (
            <EmptyState
              icon={ChefHatIcon}
              title="No orders yet"
              description="Kitchen tickets will appear here once waiters send them."
              className="mx-5 mb-2"
            />
          ) : (
            <Table className="[&_td]:px-5 [&_th]:px-5">
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead>Ticket</TableHead>
                  <TableHead>Table</TableHead>
                  <TableHead>Placed</TableHead>
                  <TableHead className="text-right">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentOrders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell className="py-3 font-medium tabular-nums">
                      {order.kotNumber}
                    </TableCell>
                    <TableCell className="py-3">{order.table}</TableCell>
                    <TableCell className="py-3 text-muted-foreground">
                      {timeAgo(order.placedAt)}
                    </TableCell>
                    <TableCell className="py-3 text-right">
                      <StatusBadge status={order.status} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </SectionCard>
      </div>
    </div>
  )
}
