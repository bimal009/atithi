export type BookingStatus = "confirmed" | "checked-in" | "checked-out" | "cancelled"

export type RoomStatus = "available" | "occupied" | "cleaning" | "maintenance"

export type RoomType = "standard" | "deluxe" | "suite" | "family"

export type StaffRole = "owner" | "frontdesk" | "waiter" | "kitchen"

export type StaffStatus = "active" | "inactive"

export type OrderStatus = "pending" | "preparing" | "ready" | "served"

export interface Tenant {
  slug: string
  hotelName: string
  city: string
  ownerName: string
}

export interface CurrentUser {
  name: string
  email: string
  role: StaffRole
  avatar?: string
}

export interface Room {
  id: string
  number: string
  floor: number
  type: RoomType
  status: RoomStatus
  price: number
  capacity: number
}

export interface Booking {
  id: string
  guestName: string
  guestPhone: string
  roomId: string
  roomNumber: string
  checkIn: string
  checkOut: string
  status: BookingStatus
  guests: number
  totalAmount: number
  createdAt: string
  notes?: string
}

export interface StaffMember {
  id: string
  name: string
  role: StaffRole
  phone: string
  email: string
  status: StaffStatus
  joinedAt: string
}

export interface MenuItem {
  id: string
  name: string
  category: string
  price: number
  isVeg: boolean
  available: boolean
}

export interface OrderItem {
  id: string
  menuItemId: string
  name: string
  price: number
  quantity: number
  notes?: string
}

export interface KotOrder {
  id: string
  kotNumber: string
  table: string
  origin: "room-service" | "restaurant"
  items: OrderItem[]
  status: OrderStatus
  placedAt: string
  waiterName: string
  notes?: string
}
