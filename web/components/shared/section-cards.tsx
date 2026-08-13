import { TrendingDownIcon, TrendingUpIcon } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardAction,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export interface SectionCardStat {
  label: string
  value: string
  trend?: { direction: "up" | "down"; label: string }
  description?: string
}

/**
 * Grid of gradient-tinted stat cards, one per entry. Used at the top of the
 * overview page — the same shape every summary metric renders in.
 */
export function SectionCards({
  stats,
  loading,
}: {
  stats: SectionCardStat[]
  loading?: boolean
}) {
  return (
    <div className="grid grid-cols-1 gap-4 *:data-[slot=card]:bg-linear-to-t *:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card *:data-[slot=card]:shadow-xs sm:grid-cols-2 xl:grid-cols-4 dark:*:data-[slot=card]:bg-card">
      {stats.map((stat) => (
        <Card key={stat.label} className="@container/card">
          <CardHeader>
            <CardDescription>{stat.label}</CardDescription>
            {loading ? (
              <Skeleton className="h-8 w-20" />
            ) : (
              <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
                {stat.value}
              </CardTitle>
            )}
            {stat.trend && !loading && (
              <CardAction>
                <Badge variant="outline">
                  {stat.trend.direction === "up" ? (
                    <TrendingUpIcon />
                  ) : (
                    <TrendingDownIcon />
                  )}
                  {stat.trend.label}
                </Badge>
              </CardAction>
            )}
          </CardHeader>
          {stat.description && (
            <CardFooter className="text-sm text-muted-foreground">
              {loading ? <Skeleton className="h-4 w-28" /> : stat.description}
            </CardFooter>
          )}
        </Card>
      ))}
    </div>
  )
}
