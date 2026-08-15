import { CameraIcon, MessageCircleIcon, Share2Icon, type LucideIcon } from "lucide-react"

import type { BookingChannel } from "@/types"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

export const CHANNEL_META: Record<BookingChannel, { label: string; icon: LucideIcon }> = {
  whatsapp: { label: "WhatsApp", icon: MessageCircleIcon },
  instagram: { label: "Instagram", icon: CameraIcon },
  facebook: { label: "Facebook", icon: Share2Icon },
}

export function ChannelBadge({
  channel,
  className,
}: {
  channel: BookingChannel
  className?: string
}) {
  const meta = CHANNEL_META[channel]
  const Icon = meta.icon

  return (
    <Badge variant="outline" className={cn("gap-1 font-normal", className)}>
      <Icon aria-hidden />
      {meta.label}
    </Badge>
  )
}
