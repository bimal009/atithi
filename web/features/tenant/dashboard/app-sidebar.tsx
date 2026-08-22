"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { ChevronRightIcon, HotelIcon, SettingsIcon } from "lucide-react"

import { useHotelBySlugQuery } from "@/features/hotel/client/useHotels"
import { NAV_GROUPS } from "@/features/tenant/dashboard/nav-config"
import { useKitchenPendingSocket } from "@/features/tenant/order/client/useKotSocket"
import { useKitchenPendingCount } from "@/features/tenant/order/client/useOrders"
import { Badge } from "@/components/ui/badge"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarSeparator,
} from "@/components/ui/sidebar"

function NavCollapsibleItem({
  item,
  basePath,
  pathname,
  isSubActive,
  badgeFor,
}: {
  item: (typeof NAV_GROUPS)[number]["items"][number]
  basePath: string
  pathname: string
  isSubActive: boolean
  badgeFor?: (href: string) => number | undefined
}) {
  const [open, setOpen] = React.useState(isSubActive)

  React.useEffect(() => {
    if (isSubActive) setOpen(true)
  }, [isSubActive])

  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <SidebarMenuItem>
        <CollapsibleTrigger
          render={
            <SidebarMenuButton
              tooltip={item.title}
              isActive={isSubActive}
              className="group data-active:bg-sidebar-accent data-active:text-sidebar-accent-foreground"
            />
          }
        >
          {item.icon && <item.icon />}
          <span>{item.title}</span>
          <ChevronRightIcon className="ml-auto size-3.5 text-sidebar-foreground/50 transition-transform group-data-panel-open:rotate-90" />
        </CollapsibleTrigger>
        <CollapsibleContent>
          <SidebarMenuSub>
            {item.items?.map((sub) => {
              const subHref = `${basePath}${sub.href}`
              const badgeCount = badgeFor?.(sub.href)
              return (
                <SidebarMenuSubItem key={sub.title}>
                  <SidebarMenuSubButton
                    isActive={pathname === subHref}
                    className="data-active:bg-sidebar-accent data-active:font-medium data-active:text-sidebar-accent-foreground"
                    render={<Link href={subHref} />}
                  >
                    <span>{sub.title}</span>
                    {!!badgeCount && (
                      <Badge className="ml-auto">
                        {badgeCount > 99 ? "99+" : badgeCount}
                      </Badge>
                    )}
                  </SidebarMenuSubButton>
                </SidebarMenuSubItem>
              )
            })}
          </SidebarMenuSub>
        </CollapsibleContent>
      </SidebarMenuItem>
    </Collapsible>
  )
}

export function AppSidebar({
  tenant,
  ...props
}: React.ComponentProps<typeof Sidebar> & { tenant: string }) {
  const pathname = usePathname()
  const basePath = `/s/${tenant}/dashboard`

  const { data: hotel } = useHotelBySlugQuery(tenant)
  const { data: kitchenPendingCount = 0 } = useKitchenPendingCount(tenant)
  useKitchenPendingSocket(tenant)

  const badgeFor = (href: string) => (href === "/kitchen" ? kitchenPendingCount : undefined)

  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader className="gap-3 px-2 pt-3">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              size="lg"
              className="data-[slot=sidebar-menu-button]:p-1.5!"
              render={<Link href={basePath} />}
            >
              <div className="flex size-8 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-primary/10 text-primary">
                {hotel?.logoUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={hotel.logoUrl} alt="" className="size-full object-contain" />
                ) : (
                  <HotelIcon className="size-4.5" />
                )}
              </div>
              <div className="flex min-w-0 flex-col leading-tight">
                <span className="truncate text-sm font-semibold">
                  {hotel?.name ?? "Loading…"}
                </span>
                <span className="truncate text-xs text-sidebar-foreground/60">
                  {hotel?.city}
                </span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarSeparator />
      <SidebarContent className="gap-0">
        {NAV_GROUPS.map((group, index) => (
          <SidebarGroup key={group.label ?? `group-${index}`}>
            {group.label && <SidebarGroupLabel>{group.label}</SidebarGroupLabel>}
            <SidebarGroupContent className="flex flex-col gap-0.5">
              <SidebarMenu>
                {group.items.map((item) => {
                  const href = `${basePath}${item.href}`
                  const isActive =
                    item.href === "" ? pathname === href : pathname.startsWith(href)

                  if (!item.items) {
                    return (
                      <SidebarMenuItem key={item.title}>
                        <SidebarMenuButton
                          tooltip={item.title}
                          isActive={isActive}
                          className="data-active:bg-sidebar-accent data-active:text-sidebar-accent-foreground"
                          render={<Link href={href} />}
                        >
                          <item.icon />
                          <span>{item.title}</span>
                          {item.badge && (
                            <Badge className="ml-auto" variant="secondary">
                              {item.badge}
                            </Badge>
                          )}
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    )
                  }

                  const isSubActive = item.items.some(
                    (sub) => pathname === `${basePath}${sub.href}`
                  )

                  return (
                    <NavCollapsibleItem
                      key={item.title}
                      item={item}
                      basePath={basePath}
                      pathname={pathname}
                      isSubActive={isSubActive}
                      badgeFor={badgeFor}
                    />
                  )
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>
      <SidebarSeparator />
      <SidebarFooter className="px-2 pb-3">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              tooltip="Settings"
              isActive={pathname === `${basePath}/settings`}
              className="data-active:bg-sidebar-accent data-active:text-sidebar-accent-foreground"
              render={<Link href={`${basePath}/settings`} />}
            >
              <SettingsIcon />
              <span>Settings</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}
