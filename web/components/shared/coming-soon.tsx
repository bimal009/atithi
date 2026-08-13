import type { LucideIcon } from "lucide-react"

import { EmptyState } from "@/components/shared/empty-state"
import { Card, CardContent } from "@/components/ui/card"

export function ComingSoon({
  icon,
  title,
  description,
}: {
  icon: LucideIcon
  title: string
  description: string
}) {
  return (
    <Card>
      <CardContent className="py-2">
        <EmptyState
          icon={icon}
          title={title}
          description={description}
          className="py-16"
        />
      </CardContent>
    </Card>
  )
}
