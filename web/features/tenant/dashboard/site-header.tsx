"use client"

import type { AuthUser } from "@/features/auth/types"
import { NavUser } from "@/features/tenant/dashboard/nav-user"
import { NotificationBell } from "@/features/tenant/notification/components/notification-bell"
import { Separator } from "@/components/ui/separator"
import { SidebarTrigger } from "@/components/ui/sidebar"

export function SiteHeader({ tenant, user }: { tenant: string; user: AuthUser }) {
  return (
    <header className="sticky top-0 z-40 flex h-(--header-height) shrink-0 items-center gap-2 border-b bg-background/95 backdrop-blur-sm transition-[width,height] ease-linear supports-backdrop-filter:bg-background/70">
      <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mx-2 h-4 data-vertical:self-auto" />
        <div className="ml-auto flex items-center gap-2">
          <NotificationBell tenant={tenant} />
          <NavUser user={user} />
        </div>
      </div>
    </header>
  )
}
