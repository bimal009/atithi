import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

import type { OrderItem } from "@/types"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function orderItemTotal(item: OrderItem) {
  const addOnsTotal = item.addOns?.reduce((sum, a) => sum + a.price, 0) ?? 0
  return (item.price + addOnsTotal) * item.quantity
}

export function orderTotal(items: OrderItem[]) {
  return items.reduce((sum, item) => sum + orderItemTotal(item), 0)
}

export function formatCurrency(amount: number) {
  return `Rs ${amount.toLocaleString("en-US")}`
}

export function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  })
}

export function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  })
}

export function timeAgo(iso: string) {
  const diffMs = Date.now() - new Date(iso).getTime()
  const mins = Math.max(0, Math.round(diffMs / 60000))
  if (mins < 1) return "just now"
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  const rem = mins % 60
  return rem === 0 ? `${hrs}h ago` : `${hrs}h ${rem}m ago`
}
