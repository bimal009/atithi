"use client"

import { Pie, PieChart } from "recharts"

import { getRoomStatusBreakdown, ROOMS } from "@/lib/mock-data"
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"

const STATUS_COLORS: Record<string, string> = {
  available: "var(--chart-4)",
  occupied: "var(--chart-1)",
  cleaning: "var(--chart-3)",
  maintenance: "var(--chart-5)",
}

const chartConfig = {
  count: { label: "Rooms" },
  available: { label: "Available", color: STATUS_COLORS.available },
  occupied: { label: "Occupied", color: STATUS_COLORS.occupied },
  cleaning: { label: "Cleaning", color: STATUS_COLORS.cleaning },
  maintenance: { label: "Maintenance", color: STATUS_COLORS.maintenance },
} satisfies ChartConfig

export function RoomStatusChart() {
  const data = getRoomStatusBreakdown().map((d) => ({
    ...d,
    fill: STATUS_COLORS[d.status],
  }))
  const occupied = data.find((d) => d.status === "occupied")?.count ?? 0
  const occupancyRate = Math.round((occupied / ROOMS.length) * 100)

  return (
    <Card className="@container/card">
      <CardHeader>
        <CardTitle>Room status</CardTitle>
        <CardDescription>{ROOMS.length} rooms total</CardDescription>
      </CardHeader>
      <div className="relative">
        <ChartContainer
          config={chartConfig}
          className="mx-auto aspect-square h-[220px]"
        >
          <PieChart>
            <ChartTooltip content={<ChartTooltipContent nameKey="status" hideLabel />} />
            <Pie
              data={data}
              dataKey="count"
              nameKey="status"
              innerRadius={62}
              outerRadius={88}
              strokeWidth={4}
              stroke="var(--card)"
            />
          </PieChart>
        </ChartContainer>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-semibold tabular-nums">
            {occupancyRate}%
          </span>
          <span className="text-xs text-muted-foreground">occupied</span>
        </div>
      </div>
      <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1.5 pb-4 text-xs text-muted-foreground">
        {data.map((d) => (
          <div key={d.status} className="flex items-center gap-1.5 capitalize">
            <span
              className="size-2 rounded-full"
              style={{ backgroundColor: d.fill }}
            />
            {d.status} · {d.count}
          </div>
        ))}
      </div>
    </Card>
  )
}
