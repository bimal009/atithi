"use client"

import { useParams } from "next/navigation"
import { CalendarCheckIcon, ChefHatIcon, UtensilsIcon } from "lucide-react"

import {
  BOOKINGS,
  getActiveKotOrders,
  getRoomStats,
  getTodayBookings,
  getTodayRevenue,
  KOT_ORDERS,
} from "@/lib/mock-data"
import { formatCurrency, formatDate, orderTotal, timeAgo } from "@/lib/utils"
import { useMockLoading } from "@/hooks/use-mock-loading"
import { ActivityList, type ActivityItem } from "@/components/shared/activity-list"
import { PageHeader } from "@/components/shared/page-header"
import { SectionCard } from "@/components/shared/section-card"
import { SectionCards } from "@/components/shared/section-cards"
import { Skeleton } from "@/components/ui/skeleton"
import { BookingsTrendChart } from "@/features/tenant/dashboard/overview/bookings-trend-chart"
import { RoomStatusChart } from "@/features/tenant/dashboard/overview/room-status-chart"

export default function OverviewPage() {
  const loading = useMockLoading()
  const params = useParams<{ tenant: string }>()
  const base = `/${params.tenant}/dashboard`

  const { occupancyRate, occupied, total } = getRoomStats()
  const todayBookings = getTodayBookings()
  const activeOrders = getActiveKotOrders()

  const recentBookings: ActivityItem[] = [...BOOKINGS]
    .sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt))
    .slice(0, 5)
    .map((b) => ({
      id: b.id,
      icon: CalendarCheckIcon,
      title: b.guestName,
      subtitle: `Room ${b.roomNumber} · ${b.guests} guests`,
      status: b.status,
      meta: formatDate(b.checkIn),
    }))

  const recentOrders: ActivityItem[] = [...KOT_ORDERS]
    .sort((a, b) => +new Date(b.placedAt) - +new Date(a.placedAt))
    .slice(0, 5)
    .map((o) => ({
      id: o.id,
      icon: ChefHatIcon,
      title: o.kotNumber,
      subtitle: `${o.table} · ${o.items.reduce((n, i) => n + i.quantity, 0)} items`,
      status: o.status,
      meta: timeAgo(o.placedAt),
    }))

  const recentTables: ActivityItem[] = KOT_ORDERS.filter(
    (o) => o.origin === "restaurant"
  )
    .sort((a, b) => +new Date(b.placedAt) - +new Date(a.placedAt))
    .slice(0, 5)
    .map((o) => ({
      id: o.id,
      icon: UtensilsIcon,
      title: o.table,
      subtitle: `${o.items.reduce((n, i) => n + i.quantity, 0)} items · ${formatCurrency(
        orderTotal(o.items)
      )}`,
      status: o.status,
      meta: timeAgo(o.placedAt),
    }))

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

      <SectionCards
        loading={loading}
        stats={[
          {
            label: "Arrivals today",
            value: String(todayBookings.length),
            description: "Guests checking in",
          },
          {
            label: "Occupancy",
            value: `${occupancyRate}%`,
            description: `${occupied} of ${total} rooms`,
          },
          {
            label: "Active orders",
            value: String(activeOrders.length),
            description: "In the kitchen queue",
          },
          {
            label: "Revenue today",
            value: formatCurrency(getTodayRevenue()),
            description: "Rooms and restaurant",
          },
        ]}
      />

      {loading ? (
        <div className="grid grid-cols-1 gap-4 lg:gap-6 xl:grid-cols-3">
          <Skeleton className="h-[340px] w-full xl:col-span-2" />
          <Skeleton className="h-[340px] w-full" />
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 lg:gap-6 xl:grid-cols-3">
          <div className="xl:col-span-2">
            <BookingsTrendChart />
          </div>
          <RoomStatusChart />
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 lg:gap-6 xl:grid-cols-3">
        <SectionCard title="Recent bookings" href={`${base}/bookings`} flush>
          <ActivityList
            loading={loading}
            items={recentBookings}
            emptyIcon={CalendarCheckIcon}
            emptyTitle="No bookings yet"
            emptyDescription="New reservations will appear here as they come in."
          />
        </SectionCard>

        <SectionCard title="Recent orders" href={`${base}/orders`} flush>
          <ActivityList
            loading={loading}
            items={recentOrders}
            emptyIcon={ChefHatIcon}
            emptyTitle="No orders yet"
            emptyDescription="Kitchen tickets will appear here once orders are sent."
          />
        </SectionCard>

        <SectionCard title="Recent table reservations" href={`${base}/tables`} flush>
          <ActivityList
            loading={loading}
            items={recentTables}
            emptyIcon={UtensilsIcon}
            emptyTitle="No table activity yet"
            emptyDescription="Restaurant table orders will show up here."
          />
        </SectionCard>
      </div>
    </div>
  )
}
