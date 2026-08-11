import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

type BadgeVariant = "default" | "secondary" | "outline" | "destructive"
type Tone = "accent" | "muted" | "none"

/**
 * Every status renders from theme tokens only — no hand-picked palette colors.
 * The accent dot marks the state that wants attention, so a glance down a
 * column lands on the rows that need work.
 */
const STATUS_MAP: Record<string, { variant: BadgeVariant; tone: Tone }> = {
  // booking
  confirmed: { variant: "outline", tone: "muted" },
  "checked-in": { variant: "outline", tone: "accent" },
  "checked-out": { variant: "secondary", tone: "none" },
  cancelled: { variant: "destructive", tone: "none" },

  // room
  available: { variant: "outline", tone: "accent" },
  occupied: { variant: "outline", tone: "muted" },
  cleaning: { variant: "secondary", tone: "none" },
  maintenance: { variant: "destructive", tone: "none" },

  // staff
  active: { variant: "outline", tone: "accent" },
  inactive: { variant: "secondary", tone: "none" },

  // order
  pending: { variant: "outline", tone: "accent" },
  preparing: { variant: "outline", tone: "muted" },
  ready: { variant: "default", tone: "none" },
  served: { variant: "secondary", tone: "none" },

  // role
  owner: { variant: "default", tone: "none" },
  frontdesk: { variant: "secondary", tone: "none" },
  waiter: { variant: "outline", tone: "muted" },
  kitchen: { variant: "outline", tone: "none" },
}

const STATUS_LABELS: Record<string, string> = {
  "checked-in": "Checked in",
  "checked-out": "Checked out",
  frontdesk: "Front desk",
}

export function StatusBadge({
  status,
  className,
}: {
  status: string
  className?: string
}) {
  const config = STATUS_MAP[status] ?? { variant: "outline", tone: "none" }

  return (
    <Badge variant={config.variant} className={cn("capitalize", className)}>
      {config.tone !== "none" && (
        <span
          aria-hidden
          className={cn(
            "size-1.5 rounded-full",
            config.tone === "accent" ? "bg-primary" : "bg-muted-foreground/50"
          )}
        />
      )}
      {STATUS_LABELS[status] ?? status}
    </Badge>
  )
}
