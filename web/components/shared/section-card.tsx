import Link from "next/link"
import { ArrowRightIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"

/**
 * Card wrapper for a titled block of content, with an optional "view all" link.
 * Content sits flush so tables can run edge to edge.
 */
export function SectionCard({
  title,
  description,
  href,
  linkLabel = "View all",
  action,
  flush,
  children,
  className,
}: {
  title: string
  description?: string
  href?: string
  linkLabel?: string
  action?: React.ReactNode
  flush?: boolean
  children: React.ReactNode
  className?: string
}) {
  return (
    <Card className={cn("gap-0", className)}>
      <CardHeader className="flex-row items-center justify-between gap-2 pb-(--card-spacing)">
        <div className="flex flex-col gap-0.5">
          <CardTitle>{title}</CardTitle>
          {description && (
            <p className="text-sm text-muted-foreground">{description}</p>
          )}
        </div>
        {action ??
          (href && (
            <Button
              variant="ghost"
              size="sm"
              render={<Link href={href} />}
              className="text-muted-foreground"
            >
              {linkLabel}
              <ArrowRightIcon data-icon="inline-end" />
            </Button>
          ))}
      </CardHeader>
      <CardContent className={cn(flush && "px-0")}>{children}</CardContent>
    </Card>
  )
}
