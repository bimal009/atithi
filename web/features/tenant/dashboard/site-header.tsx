"use client"

import { usePathname } from "next/navigation"

import { CURRENT_USERS, TENANT } from "@/lib/mock-data"
import { NavUser } from "@/features/tenant/dashboard/nav-user"
import type { StaffRole } from "@/types"
import { Separator } from "@/components/ui/separator"
import { SidebarTrigger } from "@/components/ui/sidebar"

function getRoleFromPathname(pathname: string): StaffRole {
  const segments = pathname.split("/").filter(Boolean)
  const role = segments[2]
  if (role === "owner" || role === "frontdesk" || role === "waiter" || role === "kitchen") {
    return role
  }
  return "owner"
}

export function SiteHeader() {
  const pathname = usePathname()
  const role = getRoleFromPathname(pathname)
  const user = CURRENT_USERS[role]

  return (
    <header className="sticky top-0 z-40 flex h-(--header-height) shrink-0 items-center gap-2 border-b bg-background/95 backdrop-blur-sm transition-[width,height] ease-linear supports-backdrop-filter:bg-background/70">
      <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mx-2 h-4 data-vertical:self-auto" />
        <span className="truncate text-sm font-medium text-muted-foreground">
          {TENANT.hotelName}
        </span>
        <div className="ml-auto flex items-center gap-2">
          <NavUser user={user} />
        </div>
      </div>
    </header>
  )
}
