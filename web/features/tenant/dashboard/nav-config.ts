import type { LucideIcon } from "lucide-react"
import {
  BedIcon,
  BellIcon,
  CalendarCheckIcon,
  GlobeIcon,
  ImagesIcon,
  LayoutDashboardIcon,
  MessageSquareIcon,
  ReceiptTextIcon,
  ShoppingBasketIcon,
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
  /** When true, `href` is resolved as `/s/{tenant}{href}` instead of nesting under the dashboard base path — for routes with their own layout, like the website editor. */
  absolute?: boolean
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
      { title: "Website", href: "/website-editor", icon: GlobeIcon, absolute: true },
      { title: "Gallery", href: "/gallery", icon: ImagesIcon },
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
        ],
      },
      {
        title: "Dining",
        href: "/tables",
        icon: CalendarCheckIcon,
        items: [
          { title: "Tables", href: "/tables" },
          { title: "Cabins", href: "/cabins" },
          { title: "Sections", href: "/sections" },
          { title: "Reservations", href: "/reservations" },
        ],
      },
    ],
  },
  {
    label: "Billing",
    items: [
      { title: "Billing Types", href: "/billing-types", icon: ReceiptTextIcon },
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
