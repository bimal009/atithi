export type BookingStatus =
  | "confirmed"
  | "checked-in"
  | "checked-out"
  | "cancelled";

export type BookingChannel = "whatsapp" | "instagram" | "facebook";

export type RoomStatus = "available" | "occupied" | "cleaning" | "maintenance";

export type PricingUnit = "night" | "hour" | "daycation" | "package";

export type RoomType = string;

export type TableSection = "indoor" | "outdoor" | "rooftop";

export type StaffRole = "owner" | "frontdesk" | "waiter" | "kitchen";

export type StaffStatus = "active" | "inactive";

export type OrderStatus = "pending" | "preparing" | "ready" | "served";

export interface Tenant {
  slug: string;
  hotelName: string;
  city: string;
  ownerName: string;
}

export interface CurrentUser {
  name: string;
  email: string;
  role: StaffRole;
  avatar?: string;
}

export interface Room {
  id: string;
  number: string;
  floor: number;
  type: RoomType;
  status: RoomStatus;
  price: number;
  capacity: number;
  images?: string[];
}

export interface Booking {
  id: string;
  guestName: string;
  guestPhone: string;
  roomId: string;
  roomNumber: string;
  channel: BookingChannel;
  checkIn: string;
  checkOut: string;
  status: BookingStatus;
  guests: number;
  totalAmount: number;
  createdAt: string;
  notes?: string;
}

export interface RoomTypeConfig {
  type: RoomType;
  label: string;
  description: string;
  basePrice: number;
  pricingUnit: PricingUnit;
  pricingLabel?: string;
  capacity: number;
  amenities: string[];
}

export interface Table {
  id: string;
  name: string;
  capacity: number;
  section: TableSection;
}

export interface Role {
  slug: StaffRole;
  name: string;
  description: string;
  permissions: string[];
  isSystem: boolean;
}

export interface Message {
  id: string;
  sender: "guest" | "staff";
  text: string;
  sentAt: string;
}

export interface Conversation {
  id: string;
  guestName: string;
  guestPhone?: string;
  channel: BookingChannel;
  unread: number;
  messages: Message[];
}

export interface StaffMember {
  id: string;
  name: string;
  role: StaffRole;
  phone: string;
  email: string;
  status: StaffStatus;
  joinedAt: string;
}

export interface MenuItem {
  id: string;
  name: string;
  category: string;
  subMenu?: string;
  price: number;
  discount?: number;
  isVeg: boolean;
  available: boolean;
  description?: string;
  ingredients?: string;
  photoUrl?: string;
  addOnIds?: string[];
}

export interface SubMenu {
  id: string;
  name: string;
  description?: string;
}

export interface AddOn {
  id: string;
  name: string;
  price: number;
  available: boolean;
}

export interface MenuSet {
  id: string;
  name: string;
  description?: string;
  itemIds: string[];
  price: number;
  available: boolean;
}

export interface Service {
  id: string;
  name: string;
  description: string;
  category: string;
  price: number;
  durationMinutes: number;
  available: boolean;
}

export interface OrderItemAddOn {
  id: string;
  name: string;
  price: number;
}

export interface OrderItem {
  id: string;
  menuItemId: string;
  name: string;
  price: number;
  quantity: number;
  addOns?: OrderItemAddOn[];
  notes?: string;
}

export interface KotOrder {
  id: string;
  kotNumber: string;
  table: string;
  origin: "room-service" | "restaurant";
  items: OrderItem[];
  status: OrderStatus;
  placedAt: string;
  waiterName: string;
  notes?: string;
}
