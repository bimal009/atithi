"use client"

import * as React from "react"
import { BellIcon, CalendarCheckIcon, ChefHatIcon } from "lucide-react"

import { BOOKINGS, KOT_ORDERS } from "@/lib/mock-data"
import { timeAgo } from "@/lib/utils"
import { ActivityList, type ActivityItem } from "@/components/shared/activity-list"
import { Card } from "@/components/ui/card"
import { PageHeader } from "@/components/shared/page-header"
import { SectionCards } from "@/components/shared/section-cards"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { usePageTitle } from "@/features/tenant/dashboard/page-title-context"

interface FeedEvent extends ActivityItem {
  time: string
  type: "booking" | "order"
}

function dayGroup(iso: string) {
  const date = new Date(iso)
  const today = new Date()
  const yesterday = new Date()
  yesterday.setDate(today.getDate() - 1)
  if (date.toDateString() === today.toDateString()) return "Today"
  if (date.toDateString() === yesterday.toDateString()) return "Yesterday"
  return "Earlier"
}

function GroupedFeed({ events }: { events: FeedEvent[] }) {
  if (events.length === 0) {
    return (
      <Card className="gap-0 py-0">
        <ActivityList
          items={[]}
          emptyIcon={BellIcon}
          emptyTitle="Nothing yet"
          emptyDescription="Activity will show up here."
        />
      </Card>
    )
  }

  const groups: Array<[string, FeedEvent[]]> = []
  for (const event of events) {
    const label = dayGroup(event.time)
    const existing = groups.find(([g]) => g === label)
    if (existing) {
      existing[1].push(event)
    } else {
      groups.push([label, [event]])
    }
  }

  return (
    <div className="flex flex-col gap-4">
      {groups.map(([label, items]) => (
        <Card key={label} className="gap-0 py-0">
          <div className="border-b px-5 py-2.5 text-xs font-medium text-muted-foreground">
            {label}
          </div>
          <ActivityList
            items={items}
            emptyIcon={BellIcon}
            emptyTitle="Nothing yet"
          />
        </Card>
      ))}
    </div>
  )
}

export default function NotificationsPage() {
  usePageTitle("Notifications")

  const bookingEvents: FeedEvent[] = BOOKINGS.map((b) => ({
    id: `booking-${b.id}`,
    type: "booking",
    icon: CalendarCheckIcon,
    title:
      b.status === "cancelled"
        ? `${b.guestName} cancelled their booking`
        : `${b.guestName} booked Room ${b.roomNumber}`,
    subtitle: `${b.guests} guests`,
    status: b.status,
    meta: timeAgo(b.createdAt),
    time: b.createdAt,
  }))

  const orderEvents: FeedEvent[] = KOT_ORDERS.map((o) => ({
    id: `order-${o.id}`,
    type: "order",
    icon: ChefHatIcon,
    title: `${o.kotNumber} placed for ${o.table}`,
    subtitle: `${o.items.reduce((n, i) => n + i.quantity, 0)} items · ${o.waiterName}`,
    status: o.status,
    meta: timeAgo(o.placedAt),
    time: o.placedAt,
  }))

  const feed = [...bookingEvents, ...orderEvents].sort(
    (a, b) => +new Date(b.time) - +new Date(a.time)
  )
  const todayCount = feed.filter((e) => dayGroup(e.time) === "Today").length

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Notifications"
        description="Recent booking and order activity across your hotel."
      />

      <SectionCards
        stats={[
          { label: "Total activity", value: String(feed.length) },
          { label: "Today", value: String(todayCount) },
          { label: "Bookings", value: String(bookingEvents.length) },
          { label: "Orders", value: String(orderEvents.length) },
        ]}
      />

      <Tabs defaultValue="all">
        <TabsList>
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="booking">Bookings</TabsTrigger>
          <TabsTrigger value="order">Orders</TabsTrigger>
        </TabsList>
        <TabsContent value="all" className="mt-4">
          <GroupedFeed events={feed} />
        </TabsContent>
        <TabsContent value="booking" className="mt-4">
          <GroupedFeed events={feed.filter((e) => e.type === "booking")} />
        </TabsContent>
        <TabsContent value="order" className="mt-4">
          <GroupedFeed events={feed.filter((e) => e.type === "order")} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
