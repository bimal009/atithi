import type { LucideIcon } from "lucide-react"
import {
  BedIcon,
  BellIcon,
  CalendarCheckIcon,
  LayoutDashboardIcon,
  MessageSquareIcon,
  ShoppingBasketIcon,
  TreePineIcon,
  UsersIcon,
  UsersRoundIcon,
  UtensilsCrossedIcon,
} from "lucide-react"

import type { StaffRole } from "@/types"

export interface NavItem {
  title: string
  href: string
  icon: LucideIcon
  badge?: string
  items?: { title: string; href: string; badge?: string }[]
}

export interface NavGroup {
  label?: string
  items: NavItem[]
}

export const NAV_GROUPS: NavGroup[] = [
  {
    items: [{ title: "Overview", href: "", icon: LayoutDashboardIcon }],
  },
  {
    label: "Front of house",
    items: [
      { title: "Messages", href: "/messages", icon: MessageSquareIcon },
      {
        title: "Orders",
        href: "/orders",
        icon: ShoppingBasketIcon,
        items: [
          { title: "All Orders", href: "/orders" },
          { title: "Kitchen", href: "/kitchen" },
        ],
      },
      { title: "Notifications", href: "/notifications", icon: BellIcon },
    ],
  },
  {
    label: "Catalog",
    items: [
      {
        title: "Menu",
        href: "/menu",
        icon: UtensilsCrossedIcon,
        items: [
          { title: "Dishes", href: "/menu" },
          { title: "Sub Menu", href: "/menu/sub-menu" },
          { title: "Categories", href: "/menu/categories" },
          { title: "Ad-Ons & Extras", href: "/menu/addons" },
          { title: "Menu Set", href: "/menu/sets" },
        ],
      },
    ],
  },
  {
    label: "Spaces",
    items: [
      {
        title: "Rooms",
        href: "/rooms",
        icon: BedIcon,
        items: [
          { title: "Rooms", href: "/rooms" },
          { title: "Types", href: "/rooms/types" },
          { title: "Bookings", href: "/bookings" },
          { title: "Booking Channels", href: "/bookings/channels" },
        ],
      },
      {
        title: "Dining",
        href: "/tables",
        icon: CalendarCheckIcon,
        items: [
          { title: "Tables", href: "/tables" },
          { title: "Reservations", href: "/reservations" },
        ],
      },
      { title: "Cabins", href: "/cabins", icon: TreePineIcon },
    ],
  },
  {
    label: "Management",
    items: [
      { title: "Customers", href: "/customers", icon: UsersRoundIcon },
      {
        title: "Staff",
        href: "/staff",
        icon: UsersIcon,
        items: [
          { title: "All Staff", href: "/staff" },
          { title: "Roles & Permissions", href: "/staff/roles" },
        ],
      },
    ],
  },
]

/** Flat list of every nav item, incl. sub-items — used for page-title and active-state lookups. */
export const NAV_ITEMS: NavItem[] = NAV_GROUPS.flatMap((group) => group.items)

export const ROLE_LABELS: Record<StaffRole, string> = {
  owner: "Owner",
  frontdesk: "Front Desk",
  waiter: "Waiter",
  kitchen: "Kitchen",
}
