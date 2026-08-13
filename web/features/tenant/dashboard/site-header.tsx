"use client"

import Link from "next/link"
import { useParams } from "next/navigation"
import { BellIcon } from "lucide-react"

import { CURRENT_USER, KOT_ORDERS } from "@/lib/mock-data"
import { useSiteTitle } from "@/features/tenant/dashboard/page-title-context"
import { NavUser } from "@/features/tenant/dashboard/nav-user"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { SidebarTrigger } from "@/components/ui/sidebar"

export function SiteHeader() {
  const title = useSiteTitle()
  const params = useParams<{ tenant: string }>()
  const basePath = `/${params.tenant}/dashboard`
  const unreadCount = KOT_ORDERS.filter((o) => o.status === "pending").length

  return (
    <header className="sticky top-0 z-40 flex h-(--header-height) shrink-0 items-center gap-2 border-b bg-background/95 backdrop-blur-sm transition-[width,height] ease-linear supports-backdrop-filter:bg-background/70">
      <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mx-2 h-4 data-vertical:self-auto" />
        <h1 className="text-base font-medium">{title}</h1>
        <div className="ml-auto flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon-sm"
            className="relative"
            nativeButton={false}
            render={<Link href={`${basePath}/notifications`} />}
          >
            <BellIcon />
            {unreadCount > 0 && (
              <Badge className="absolute -top-1 -right-1 size-4 justify-center rounded-full p-0 text-[10px] tabular-nums">
                {unreadCount}
              </Badge>
            )}
            <span className="sr-only">Notifications</span>
          </Button>
          <NavUser user={CURRENT_USER} />
        </div>
      </div>
    </header>
  )
}
