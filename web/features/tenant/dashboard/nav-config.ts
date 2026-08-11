import type { LucideIcon } from "lucide-react"
import {
  BedDoubleIcon,
  CalendarCheckIcon,
  ChefHatIcon,
  LayoutDashboardIcon,
  UsersIcon,
  UtensilsIcon,
} from "lucide-react"

import type { StaffRole } from "@/types"

export interface NavItem {
  title: string
  href: string
  icon: LucideIcon
}

export const ROLE_NAV: Record<StaffRole, NavItem[]> = {
  owner: [
    { title: "Overview", href: "", icon: LayoutDashboardIcon },
    { title: "Bookings", href: "/bookings", icon: CalendarCheckIcon },
    { title: "Rooms", href: "/rooms", icon: BedDoubleIcon },
    { title: "Staff", href: "/staff", icon: UsersIcon },
    { title: "KOT Orders", href: "/kot", icon: ChefHatIcon },
  ],
  frontdesk: [
    { title: "Overview", href: "", icon: LayoutDashboardIcon },
    { title: "Bookings", href: "/bookings", icon: CalendarCheckIcon },
    { title: "Rooms", href: "/rooms", icon: BedDoubleIcon },
  ],
  waiter: [{ title: "Take Order", href: "", icon: UtensilsIcon }],
  kitchen: [{ title: "KOT Queue", href: "", icon: ChefHatIcon }],
}

export const ROLE_LABELS: Record<StaffRole, string> = {
  owner: "Owner",
  frontdesk: "Front Desk",
  waiter: "Waiter",
  kitchen: "Kitchen",
}
