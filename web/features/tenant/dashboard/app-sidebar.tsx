"use client"

import * as React from "react"
import Link from "next/link"
import { useParams, usePathname } from "next/navigation"
import { HotelIcon } from "lucide-react"

import { TENANT } from "@/lib/mock-data"
import { ROLE_LABELS, ROLE_NAV } from "@/features/tenant/dashboard/nav-config"
import type { StaffRole } from "@/types"
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

function getRoleFromPathname(pathname: string): StaffRole {
  const segments = pathname.split("/").filter(Boolean)
  const role = segments[2]
  if (role === "owner" || role === "frontdesk" || role === "waiter" || role === "kitchen") {
    return role
  }
  return "owner"
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname()
  const params = useParams<{ tenant: string }>()
  const tenant = params.tenant
  const role = getRoleFromPathname(pathname)
  const basePath = `/${tenant}/dashboard/${role}`
  const items = ROLE_NAV[role]

  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              className="data-[slot=sidebar-menu-button]:p-1.5!"
              render={<Link href={basePath} />}
            >
              <HotelIcon className="size-5!" />
              <span className="truncate text-base font-semibold">
                {TENANT.hotelName}
              </span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>{ROLE_LABELS[role]}</SidebarGroupLabel>
          <SidebarGroupContent className="flex flex-col gap-2">
            <SidebarMenu>
              {items.map((item) => {
                const href = `${basePath}${item.href}`
                const isActive =
                  item.href === "" ? pathname === href : pathname.startsWith(href)
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      tooltip={item.title}
                      isActive={isActive}
                      render={<Link href={href} />}
                    >
                      <item.icon />
                      <span>{item.title}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  )
}
