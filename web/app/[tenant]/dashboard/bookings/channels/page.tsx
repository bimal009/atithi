"use client"

import { RadioTowerIcon } from "lucide-react"

import { getBookingsByChannel } from "@/lib/mock-data"
import { formatCurrency } from "@/lib/utils"
import { PageHeader } from "@/components/shared/page-header"
import { SectionCards } from "@/components/shared/section-cards"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CHANNEL_META } from "@/features/tenant/dashboard/bookings/channel-badge"
import { usePageTitle } from "@/features/tenant/dashboard/page-title-context"

export default function BookingChannelsPage() {
  usePageTitle("Channels")
  const channels = getBookingsByChannel()

  const totalBookings = channels.reduce((sum, c) => sum + c.bookingCount, 0)
  const totalRevenue = channels.reduce((sum, c) => sum + c.revenue, 0)
  const topChannel = [...channels].sort((a, b) => b.bookingCount - a.bookingCount)[0]
  const activeChannels = channels.filter((c) => c.bookingCount > 0).length

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Channels"
        description="Where your bookings come from — direct, walk-in, phone, and every OTA you're connected to."
      />

      <SectionCards
        stats={[
          { label: "Total bookings", value: String(totalBookings) },
          {
            label: "Active channels",
            value: String(activeChannels),
            description: `of ${channels.length} connected`,
          },
          {
            label: "Top channel",
            value: topChannel ? CHANNEL_META[topChannel.value].label : "—",
            description: topChannel ? `${topChannel.bookingCount} bookings` : undefined,
          },
          { label: "Revenue across channels", value: formatCurrency(totalRevenue) },
        ]}
      />

      {channels.length === 0 ? (
        <Card className="py-2">
          <CardContent>
            <div className="flex flex-col items-center gap-2 py-12 text-center text-muted-foreground">
              <RadioTowerIcon className="size-8" aria-hidden />
              <p>No channels configured yet.</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {channels.map((channel) => {
            const Icon = CHANNEL_META[channel.value].icon
            const share =
              totalBookings === 0
                ? 0
                : Math.round((channel.bookingCount / totalBookings) * 100)

            return (
              <Card key={channel.value}>
                <CardHeader className="grid-cols-[1fr_auto]">
                  <div className="flex items-center gap-3">
                    <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <Icon className="size-4.5" aria-hidden />
                    </div>
                    <CardTitle>{channel.label}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="flex flex-col gap-3">
                  <div className="flex items-baseline justify-between">
                    <span className="text-2xl font-semibold tabular-nums">
                      {channel.bookingCount}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {share}% of bookings
                    </span>
                  </div>
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full bg-primary"
                      style={{ width: `${share}%` }}
                    />
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {formatCurrency(channel.revenue)} in revenue
                  </p>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
