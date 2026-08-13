import type { LucideIcon } from "lucide-react"

import { EmptyState } from "@/components/shared/empty-state"
import { StatusBadge } from "@/components/shared/status-badge"
import { Skeleton } from "@/components/ui/skeleton"

export interface ActivityItem {
  id: string
  icon: LucideIcon
  title: string
  subtitle: string
  status: string
  meta?: string
}

/**
 * Polished row list for "recent activity" panels — icon in a tinted circle,
 * title/subtitle, status badge with a meta line. Same shape everywhere it's
 * used so the three overview panels read as one family.
 */
export function ActivityList({
  items,
  loading,
  loadingRows = 4,
  emptyIcon,
  emptyTitle,
  emptyDescription,
}: {
  items: ActivityItem[]
  loading?: boolean
  loadingRows?: number
  emptyIcon: LucideIcon
  emptyTitle: string
  emptyDescription?: string
}) {
  if (loading) {
    return (
      <div className="flex flex-col gap-4 px-5 py-2">
        {Array.from({ length: loadingRows }).map((_, i) => (
          <div key={i} className="flex items-center gap-3">
            <Skeleton className="size-9 shrink-0 rounded-full" />
            <div className="flex flex-1 flex-col gap-1.5">
              <Skeleton className="h-3.5 w-1/2" />
              <Skeleton className="h-3 w-1/3" />
            </div>
            <Skeleton className="h-5 w-16 rounded-full" />
          </div>
        ))}
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <EmptyState
        icon={emptyIcon}
        title={emptyTitle}
        description={emptyDescription}
        className="mx-5 mb-2"
      />
    )
  }

  return (
    <ul className="flex flex-col divide-y divide-border px-5">
      {items.map((item) => (
        <li key={item.id} className="flex items-center gap-3 py-3">
          <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
            <item.icon className="size-4" />
          </div>
          <div className="flex min-w-0 flex-1 flex-col">
            <span className="truncate text-sm font-medium">{item.title}</span>
            <span className="truncate text-xs text-muted-foreground">
              {item.subtitle}
            </span>
          </div>
          <div className="flex shrink-0 flex-col items-end gap-1">
            <StatusBadge status={item.status} />
            {item.meta && (
              <span className="text-xs text-muted-foreground tabular-nums">
                {item.meta}
              </span>
            )}
          </div>
        </li>
      ))}
    </ul>
  )
}
