import { Card } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"


export interface Stat {
  label: string
  value: string
  hint?: string
}

/**
 * One card, divided cells — reads as a single summary strip rather than four
 * floating tiles, and keeps the numbers on a shared baseline.
 */
export function StatRow({
  stats,
  loading,
  className,
}: {
  stats: Stat[]
  loading?: boolean
  className?: string
}) {
  return (
    <Card className={cn("py-0", className)}>
      {/* 1px gaps over a border-colored bed: dividers stay correct at every wrap point */}
      <div className="grid grid-cols-1 gap-px bg-border sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="flex flex-col gap-1.5 bg-card p-4 lg:p-5"
          >
            <span className="text-sm text-muted-foreground">{stat.label}</span>
            {loading ? (
              <>
                <Skeleton className="h-7 w-20" />
                <Skeleton className="h-3 w-28" />
              </>
            ) : (
              <>
                <span className="font-heading text-2xl leading-none font-semibold tracking-tight tabular-nums">
                  {stat.value}
                </span>
                {stat.hint && (
                  <span className="text-xs text-muted-foreground">
                    {stat.hint}
                  </span>
                )}
              </>
            )}
          </div>
        ))}
      </div>
    </Card>
  )
}
