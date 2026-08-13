"use client"

import { Area, AreaChart, CartesianGrid, XAxis } from "recharts"

import { getBookingsTrend } from "@/lib/mock-data"
import { formatCurrency } from "@/lib/utils"
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"

const chartConfig = {
  revenue: {
    label: "Revenue",
    color: "var(--chart-2)",
  },
} satisfies ChartConfig

export function BookingsTrendChart() {
  const data = getBookingsTrend(14)

  return (
    <Card className="@container/card">
      <CardHeader>
        <CardTitle>Revenue</CardTitle>
        <CardDescription>Last 14 days</CardDescription>
      </CardHeader>
      <ChartContainer config={chartConfig} className="aspect-auto h-[260px] w-full px-2 pb-4 sm:px-6">
        <AreaChart data={data} margin={{ left: 0, right: 8 }}>
          <defs>
            <linearGradient id="fillRevenue" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="var(--color-revenue)" stopOpacity={0.8} />
              <stop offset="95%" stopColor="var(--color-revenue)" stopOpacity={0.05} />
            </linearGradient>
          </defs>
          <CartesianGrid vertical={false} />
          <XAxis
            dataKey="date"
            tickLine={false}
            axisLine={false}
            tickMargin={8}
            minTickGap={24}
            tickFormatter={(value) =>
              new Date(value).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
              })
            }
          />
          <ChartTooltip
            cursor={false}
            content={
              <ChartTooltipContent
                labelFormatter={(value) =>
                  new Date(value).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                  })
                }
                formatter={(value) => [formatCurrency(Number(value)), " Revenue"]}
              />
            }
          />
          <Area
            dataKey="revenue"
            type="monotone"
            fill="url(#fillRevenue)"
            stroke="var(--color-revenue)"
            strokeWidth={2}
          />
        </AreaChart>
      </ChartContainer>
    </Card>
  )
}
