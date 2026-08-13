import Link from "next/link"
import { ArrowUpRightIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardAction,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"

/**
 * Card wrapper for a titled block of content, with an optional quick-link
 * icon button next to the title. Content sits flush so tables can run edge
 * to edge.
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
      <CardHeader className="pb-(--card-spacing)">
        <CardTitle>{title}</CardTitle>
        {description && (
          <p className="text-sm text-muted-foreground">{description}</p>
        )}
        <CardAction>
          {action ??
            (href && (
              <Tooltip>
                <TooltipTrigger
                  render={
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      nativeButton={false}
                      render={<Link href={href} />}
                      className="text-muted-foreground"
                    />
                  }
                >
                  <ArrowUpRightIcon />
                  <span className="sr-only">{linkLabel}</span>
                </TooltipTrigger>
                <TooltipContent>{linkLabel}</TooltipContent>
              </Tooltip>
            ))}
        </CardAction>
      </CardHeader>
      <CardContent className={cn(flush && "px-0")}>{children}</CardContent>
    </Card>
  )
}
