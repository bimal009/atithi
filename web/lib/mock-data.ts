import type {
  AddOn,
  Booking,
  BookingChannel,
  Conversation,
  CurrentUser,
  KotOrder,
  MenuItem,
  MenuSet,
  Role,
  Room,
  RoomTypeConfig,
  Service,
  StaffMember,
  SubMenu,
  Table,
  Tenant,
} from "@/types"
import { orderTotal } from "@/lib/utils"

export const BOOKING_CHANNELS: { value: BookingChannel; label: string }[] = [
  { value: "whatsapp", label: "WhatsApp" },
  { value: "instagram", label: "Instagram" },
  { value: "facebook", label: "Facebook" },
]

export const TENANT: Tenant = {
  slug: "hotel-himalaya-view",
  hotelName: "Hotel Himalaya View",
  city: "Pokhara, Nepal",
  ownerName: "Bimal Thapa",
}

export const CURRENT_USER: CurrentUser = {
  name: "Bimal Thapa",
  email: "bimal@himalayaview.com",
  role: "owner",
}

function daysFromNow(offset: number, hour = 12, minute = 0): string {
  const d = new Date()
  d.setDate(d.getDate() + offset)
  d.setHours(hour, minute, 0, 0)
  return d.toISOString()
}

function minutesAgo(offset: number): string {
  const d = new Date()
  d.setMinutes(d.getMinutes() - offset)
  return d.toISOString()
}

export const ROOMS: Room[] = [
  { id: "r101", number: "101", floor: 1, type: "standard", status: "occupied", price: 2200, capacity: 2 },
  { id: "r102", number: "102", floor: 1, type: "standard", status: "available", price: 2200, capacity: 2 },
  { id: "r103", number: "103", floor: 1, type: "standard", status: "cleaning", price: 2200, capacity: 2 },
  { id: "r104", number: "104", floor: 1, type: "deluxe", status: "occupied", price: 3500, capacity: 2 },
  { id: "r105", number: "105", floor: 1, type: "deluxe", status: "available", price: 3500, capacity: 2 },
  { id: "r106", number: "106", floor: 1, type: "standard", status: "maintenance", price: 2200, capacity: 2 },
  { id: "r107", number: "107", floor: 1, type: "family", status: "available", price: 5200, capacity: 4 },
  { id: "r108", number: "108", floor: 1, type: "standard", status: "occupied", price: 2200, capacity: 2 },
  { id: "r201", number: "201", floor: 2, type: "deluxe", status: "occupied", price: 3500, capacity: 2 },
  { id: "r202", number: "202", floor: 2, type: "deluxe", status: "available", price: 3500, capacity: 2 },
  { id: "r203", number: "203", floor: 2, type: "suite", status: "occupied", price: 6800, capacity: 3 },
  { id: "r204", number: "204", floor: 2, type: "standard", status: "available", price: 2200, capacity: 2 },
  { id: "r205", number: "205", floor: 2, type: "standard", status: "cleaning", price: 2200, capacity: 2 },
  { id: "r206", number: "206", floor: 2, type: "family", status: "occupied", price: 5200, capacity: 4 },
  { id: "r207", number: "207", floor: 2, type: "deluxe", status: "available", price: 3500, capacity: 2 },
  { id: "r208", number: "208", floor: 2, type: "standard", status: "occupied", price: 2200, capacity: 2 },
  { id: "r301", number: "301", floor: 3, type: "suite", status: "available", price: 6800, capacity: 3 },
  { id: "r302", number: "302", floor: 3, type: "suite", status: "occupied", price: 6800, capacity: 3 },
  { id: "r303", number: "303", floor: 3, type: "deluxe", status: "available", price: 3500, capacity: 2 },
  { id: "r304", number: "304", floor: 3, type: "family", status: "cleaning", price: 5200, capacity: 4 },
]

export const ROOM_TYPE_CONFIGS: RoomTypeConfig[] = [
  {
    type: "standard",
    label: "Standard",
    description: "Compact double room with the everyday essentials.",
    basePrice: 2200,
    capacity: 2,
    amenities: ["Wi-Fi", "TV", "Attached bath"],
  },
  {
    type: "deluxe",
    label: "Deluxe",
    description: "Larger room with upgraded furnishing and a view.",
    basePrice: 3500,
    capacity: 2,
    amenities: ["Wi-Fi", "TV", "AC", "Mini fridge"],
  },
  {
    type: "suite",
    label: "Suite",
    description: "Separate living area, ideal for longer stays.",
    basePrice: 6800,
    capacity: 3,
    amenities: ["Wi-Fi", "TV", "AC", "Living area", "Bathtub"],
  },
  {
    type: "family",
    label: "Family",
    description: "Extra beds and space for guests travelling together.",
    basePrice: 5200,
    capacity: 4,
    amenities: ["Wi-Fi", "TV", "AC", "Extra beds"],
  },
]

export function getRoomTypeStats(
  configs: RoomTypeConfig[] = ROOM_TYPE_CONFIGS,
  rooms: Room[] = ROOMS
) {
  return configs.map((config) => {
    const roomsOfType = rooms.filter((r) => r.type === config.type)
    return {
      ...config,
      roomCount: roomsOfType.length,
      occupied: roomsOfType.filter((r) => r.status === "occupied").length,
    }
  })
}

export const TABLES: Table[] = [
  { id: "tb01", name: "Table 1", capacity: 2, section: "indoor" },
  { id: "tb02", name: "Table 2", capacity: 2, section: "indoor" },
  { id: "tb03", name: "Table 3", capacity: 4, section: "indoor" },
  { id: "tb04", name: "Table 4", capacity: 4, section: "indoor" },
  { id: "tb05", name: "Table 5", capacity: 6, section: "indoor" },
  { id: "tb06", name: "Table 6", capacity: 2, section: "outdoor" },
  { id: "tb07", name: "Table 7", capacity: 4, section: "outdoor" },
  { id: "tb08", name: "Table 8", capacity: 4, section: "rooftop" },
]

export const BOOKINGS: Booking[] = [
  {
    id: "bk001",
    guestName: "Sujata Shrestha",
    guestPhone: "980-1122334",
    roomId: "r101",
    roomNumber: "101",
    channel: "whatsapp",
    checkIn: daysFromNow(-1, 13, 0),
    checkOut: daysFromNow(2, 11, 0),
    status: "checked-in",
    guests: 2,
    totalAmount: 6600,
    createdAt: daysFromNow(-5, 9, 30),
  },
  {
    id: "bk002",
    guestName: "Anish Gurung",
    guestPhone: "981-2233445",
    roomId: "r104",
    roomNumber: "104",
    channel: "instagram",
    checkIn: daysFromNow(-2, 12, 0),
    checkOut: daysFromNow(1, 11, 0),
    status: "checked-in",
    guests: 1,
    totalAmount: 10500,
    createdAt: daysFromNow(-6, 14, 15),
  },
  {
    id: "bk003",
    guestName: "Kritika Basnet",
    guestPhone: "984-3344556",
    roomId: "r201",
    roomNumber: "201",
    channel: "facebook",
    checkIn: daysFromNow(0, 14, 0),
    checkOut: daysFromNow(3, 11, 0),
    status: "confirmed",
    guests: 2,
    totalAmount: 10500,
    createdAt: daysFromNow(-3, 10, 0),
    notes: "Airport pickup requested at 2 PM.",
  },
  {
    id: "bk004",
    guestName: "Suresh Adhikari",
    guestPhone: "985-4455667",
    roomId: "r203",
    roomNumber: "203",
    channel: "whatsapp",
    checkIn: daysFromNow(0, 13, 0),
    checkOut: daysFromNow(4, 11, 0),
    status: "confirmed",
    guests: 3,
    totalAmount: 27200,
    createdAt: daysFromNow(-1, 16, 45),
  },
  {
    id: "bk005",
    guestName: "Nirmala K.C.",
    guestPhone: "986-5566778",
    roomId: "r206",
    roomNumber: "206",
    channel: "instagram",
    checkIn: daysFromNow(-3, 12, 0),
    checkOut: daysFromNow(0, 11, 0),
    status: "checked-in",
    guests: 4,
    totalAmount: 15600,
    createdAt: daysFromNow(-8, 9, 0),
  },
  {
    id: "bk006",
    guestName: "Prakash Lama",
    guestPhone: "982-6677889",
    roomId: "r302",
    roomNumber: "302",
    channel: "facebook",
    checkIn: daysFromNow(-4, 12, 0),
    checkOut: daysFromNow(-1, 11, 0),
    status: "checked-out",
    guests: 2,
    totalAmount: 20400,
    createdAt: daysFromNow(-9, 11, 30),
  },
  {
    id: "bk007",
    guestName: "Sabina Tamang",
    guestPhone: "983-7788990",
    roomId: "r208",
    roomNumber: "208",
    channel: "whatsapp",
    checkIn: daysFromNow(-6, 12, 0),
    checkOut: daysFromNow(-3, 11, 0),
    status: "checked-out",
    guests: 1,
    totalAmount: 6600,
    createdAt: daysFromNow(-10, 8, 20),
  },
  {
    id: "bk008",
    guestName: "Bishal Rana",
    guestPhone: "970-8899001",
    roomId: "r105",
    roomNumber: "105",
    channel: "instagram",
    checkIn: daysFromNow(1, 13, 0),
    checkOut: daysFromNow(3, 11, 0),
    status: "confirmed",
    guests: 2,
    totalAmount: 7000,
    createdAt: daysFromNow(-2, 17, 0),
  },
  {
    id: "bk009",
    guestName: "Rina Maharjan",
    guestPhone: "971-9900112",
    roomId: "r107",
    roomNumber: "107",
    channel: "facebook",
    checkIn: daysFromNow(2, 13, 0),
    checkOut: daysFromNow(6, 11, 0),
    status: "confirmed",
    guests: 3,
    totalAmount: 20800,
    createdAt: daysFromNow(-1, 12, 10),
  },
  {
    id: "bk010",
    guestName: "Dipendra Karki",
    guestPhone: "972-0011223",
    roomId: "r301",
    roomNumber: "301",
    channel: "whatsapp",
    checkIn: daysFromNow(-10, 12, 0),
    checkOut: daysFromNow(-8, 11, 0),
    status: "cancelled",
    guests: 2,
    totalAmount: 13600,
    createdAt: daysFromNow(-14, 15, 30),
    notes: "Guest cancelled due to travel change.",
  },
  {
    id: "bk011",
    guestName: "Manisha Poudel",
    guestPhone: "973-1122334",
    roomId: "r202",
    roomNumber: "202",
    channel: "instagram",
    checkIn: daysFromNow(0, 15, 0),
    checkOut: daysFromNow(2, 11, 0),
    status: "confirmed",
    guests: 2,
    totalAmount: 7000,
    createdAt: daysFromNow(0, 8, 45),
  },
  {
    id: "bk012",
    guestName: "Yubraj Basnet",
    guestPhone: "974-2233445",
    roomId: "r303",
    roomNumber: "303",
    channel: "facebook",
    checkIn: daysFromNow(-1, 12, 0),
    checkOut: daysFromNow(0, 11, 0),
    status: "checked-in",
    guests: 1,
    totalAmount: 3500,
    createdAt: daysFromNow(-2, 19, 0),
  },
]

export const CONVERSATIONS: Conversation[] = [
  {
    id: "cv001",
    guestName: "Sujata Shrestha",
    guestPhone: "980-1122334",
    channel: "whatsapp",
    unread: 2,
    messages: [
      { id: "m1", sender: "guest", text: "Hi, is late checkout possible tomorrow?", sentAt: minutesAgo(40) },
      { id: "m2", sender: "staff", text: "Let me check with housekeeping, one moment.", sentAt: minutesAgo(35) },
      { id: "m3", sender: "guest", text: "Sure, thank you!", sentAt: minutesAgo(30) },
      { id: "m4", sender: "guest", text: "Also, can we get an extra towel sent up?", sentAt: minutesAgo(6) },
    ],
  },
  {
    id: "cv002",
    guestName: "Anish Gurung",
    channel: "instagram",
    unread: 0,
    messages: [
      { id: "m5", sender: "guest", text: "Saw your reel of the mountain view rooms 😍 any availability this weekend?", sentAt: minutesAgo(180) },
      { id: "m6", sender: "staff", text: "Yes! Deluxe rooms are open Fri–Sun. Want me to hold one?", sentAt: minutesAgo(170) },
      { id: "m7", sender: "guest", text: "Yes please, booking now.", sentAt: minutesAgo(165) },
    ],
  },
  {
    id: "cv003",
    guestName: "Kritika Basnet",
    channel: "facebook",
    unread: 1,
    messages: [
      { id: "m8", sender: "guest", text: "Hello, do you arrange airport pickup?", sentAt: minutesAgo(90) },
      { id: "m9", sender: "staff", text: "We do, Rs 1200 each way. Want us to book it?", sentAt: minutesAgo(80) },
      { id: "m10", sender: "guest", text: "Yes, 2 PM arrival please.", sentAt: minutesAgo(15) },
    ],
  },
  {
    id: "cv004",
    guestName: "Bishal Rana",
    channel: "whatsapp",
    unread: 0,
    messages: [
      { id: "m11", sender: "guest", text: "What time is breakfast served?", sentAt: minutesAgo(500) },
      { id: "m12", sender: "staff", text: "7 to 10 AM at the rooftop restaurant.", sentAt: minutesAgo(495) },
    ],
  },
  {
    id: "cv005",
    guestName: "Rina Maharjan",
    channel: "instagram",
    unread: 3,
    messages: [
      { id: "m13", sender: "guest", text: "Hey! Following up on my DM from yesterday about the family suite.", sentAt: minutesAgo(60) },
      { id: "m14", sender: "guest", text: "Still available for next month?", sentAt: minutesAgo(55) },
      { id: "m15", sender: "guest", text: "Let me know when you get a chance 🙏", sentAt: minutesAgo(20) },
    ],
  },
  {
    id: "cv006",
    guestName: "Dipendra Karki",
    channel: "facebook",
    unread: 0,
    messages: [
      { id: "m16", sender: "guest", text: "Do you have parking for a group of 3 cars?", sentAt: minutesAgo(1440) },
      { id: "m17", sender: "staff", text: "Yes, we have covered parking for up to 6 vehicles.", sentAt: minutesAgo(1430) },
      { id: "m18", sender: "guest", text: "Perfect, thank you.", sentAt: minutesAgo(1420) },
    ],
  },
]

export function getConversationsByChannel() {
  return BOOKING_CHANNELS.map((channel) => ({
    ...channel,
    conversations: CONVERSATIONS.filter((c) => c.channel === channel.value),
  }))
}

export function getUnreadMessageCount() {
  return CONVERSATIONS.reduce((sum, c) => sum + c.unread, 0)
}

export const STAFF: StaffMember[] = [
  {
    id: "st001",
    name: "Bimal Thapa",
    role: "owner",
    phone: "980-0000001",
    email: "bimal@himalayaview.com",
    status: "active",
    joinedAt: "2021-03-14",
  },
  {
    id: "st002",
    name: "Sabina Tamang",
    role: "frontdesk",
    phone: "981-1111112",
    email: "sabina@himalayaview.com",
    status: "active",
    joinedAt: "2022-06-01",
  },
  {
    id: "st003",
    name: "Nabin Shrestha",
    role: "frontdesk",
    phone: "982-2222223",
    email: "nabin@himalayaview.com",
    status: "active",
    joinedAt: "2023-01-20",
  },
  {
    id: "st004",
    name: "Rohan Maharjan",
    role: "waiter",
    phone: "983-3333334",
    email: "rohan@himalayaview.com",
    status: "active",
    joinedAt: "2022-11-05",
  },
  {
    id: "st005",
    name: "Anita Rai",
    role: "waiter",
    phone: "984-4444445",
    email: "anita@himalayaview.com",
    status: "active",
    joinedAt: "2023-08-15",
  },
  {
    id: "st006",
    name: "Suman Gurung",
    role: "waiter",
    phone: "985-5555556",
    email: "suman@himalayaview.com",
    status: "inactive",
    joinedAt: "2021-09-10",
  },
  {
    id: "st007",
    name: "Prakash Lama",
    role: "kitchen",
    phone: "986-6666667",
    email: "prakash@himalayaview.com",
    status: "active",
    joinedAt: "2020-12-01",
  },
  {
    id: "st008",
    name: "Deepa Adhikari",
    role: "kitchen",
    phone: "987-7777778",
    email: "deepa@himalayaview.com",
    status: "active",
    joinedAt: "2022-02-18",
  },
  {
    id: "st009",
    name: "Krishna Tamang",
    role: "kitchen",
    phone: "988-8888889",
    email: "krishna@himalayaview.com",
    status: "active",
    joinedAt: "2023-05-22",
  },
]

export const ROLES: Role[] = [
  {
    slug: "owner",
    name: "Owner",
    description: "Full access — billing, staff, roles, and every module.",
    permissions: ["Manage staff & roles", "Manage billing", "Manage all modules"],
    isSystem: true,
  },
  {
    slug: "frontdesk",
    name: "Front Desk",
    description: "Runs the front desk — bookings, check-ins, and guests.",
    permissions: ["Manage bookings", "Check guests in/out", "View customers"],
    isSystem: true,
  },
  {
    slug: "waiter",
    name: "Waiter",
    description: "Takes restaurant and room-service orders.",
    permissions: ["Create orders", "View menu", "View tables"],
    isSystem: true,
  },
  {
    slug: "kitchen",
    name: "Kitchen",
    description: "Sees incoming KOTs and updates order status.",
    permissions: ["View kitchen tickets", "Update order status"],
    isSystem: true,
  },
]

export function getRoleStats() {
  return ROLES.map((role) => ({
    ...role,
    memberCount: STAFF.filter((s) => s.role === role.slug).length,
  }))
}

export const SUB_MENUS: SubMenu[] = [
  { id: "sm01", name: "Restaurant Menu", description: "Starters, mains, and Nepali specials served all day." },
  { id: "sm02", name: "Bar Menu", description: "Tea, coffee, and cold beverages." },
  { id: "sm03", name: "Dessert Menu", description: "Sweets served after meals." },
]

const CATEGORY_TO_SUB_MENU: Record<string, string> = {
  Starters: "Restaurant Menu",
  "Main Course": "Restaurant Menu",
  "Nepali Specials": "Restaurant Menu",
  Beverages: "Bar Menu",
  Desserts: "Dessert Menu",
}

const MENU_ITEMS_BASE: Omit<MenuItem, "subMenu">[] = [
  { id: "m01", name: "Veg Momo", category: "Starters", price: 220, isVeg: true, available: true },
  { id: "m02", name: "Chicken Momo", category: "Starters", price: 260, isVeg: false, available: true },
  { id: "m03", name: "Buff Sekuwa", category: "Starters", price: 380, isVeg: false, available: true },
  { id: "m04", name: "Chicken Chilli", category: "Starters", price: 340, isVeg: false, available: true },
  { id: "m05", name: "Paneer Tikka", category: "Starters", price: 300, isVeg: true, available: false },
  { id: "m06", name: "Dal Bhat Set", category: "Main Course", price: 420, isVeg: true, available: true },
  { id: "m07", name: "Chicken Curry Set", category: "Main Course", price: 520, isVeg: false, available: true },
  { id: "m08", name: "Mutton Curry Set", category: "Main Course", price: 620, isVeg: false, available: true },
  { id: "m09", name: "Veg Thukpa", category: "Main Course", price: 280, isVeg: true, available: true },
  { id: "m10", name: "Chicken Thukpa", category: "Main Course", price: 320, isVeg: false, available: true },
  { id: "m11", name: "Chicken Chowmein", category: "Main Course", price: 300, isVeg: false, available: true },
  { id: "m12", name: "Veg Chowmein", category: "Main Course", price: 260, isVeg: true, available: true },
  { id: "m13", name: "Newari Khaja Set", category: "Nepali Specials", price: 450, isVeg: false, available: true },
  { id: "m14", name: "Gundruk Soup", category: "Nepali Specials", price: 180, isVeg: true, available: true },
  { id: "m15", name: "Aloo Tama", category: "Nepali Specials", price: 260, isVeg: true, available: true },
  { id: "m16", name: "Masu Bhat", category: "Nepali Specials", price: 480, isVeg: false, available: true },
  { id: "m17", name: "Masala Tea", category: "Beverages", price: 60, isVeg: true, available: true },
  { id: "m18", name: "Black Coffee", category: "Beverages", price: 90, isVeg: true, available: true },
  { id: "m19", name: "Sweet Lassi", category: "Beverages", price: 150, isVeg: true, available: true },
  { id: "m20", name: "Fresh Lime Soda", category: "Beverages", price: 120, isVeg: true, available: true },
  { id: "m21", name: "Gulab Jamun", category: "Desserts", price: 140, isVeg: true, available: true },
  { id: "m22", name: "Kheer", category: "Desserts", price: 160, isVeg: true, available: true },
]

export const MENU_ITEMS: MenuItem[] = MENU_ITEMS_BASE.map((item) => ({
  ...item,
  subMenu: CATEGORY_TO_SUB_MENU[item.category] ?? SUB_MENUS[0].name,
}))

export const ADD_ONS: AddOn[] = [
  { id: "ad01", name: "Extra Cheese", price: 60, available: true },
  { id: "ad02", name: "Extra Spicy", price: 0, available: true },
  { id: "ad03", name: "Extra Chicken", price: 120, available: true },
  { id: "ad04", name: "Extra Sauce", price: 40, available: true },
  { id: "ad05", name: "Extra Rice", price: 80, available: true },
  { id: "ad06", name: "Butter Topping", price: 50, available: false },
]

export const MENU_SETS: MenuSet[] = [
  {
    id: "ms01",
    name: "Momo Combo",
    description: "Veg momo with a masala tea.",
    itemIds: ["m01", "m17"],
    price: 250,
    available: true,
  },
  {
    id: "ms02",
    name: "Family Dal Bhat Set",
    description: "Two chicken curry sets with a Newari khaja starter.",
    itemIds: ["m07", "m07", "m13"],
    price: 1350,
    available: true,
  },
  {
    id: "ms03",
    name: "Evening Snack Platter",
    description: "Buff sekuwa, aloo tama, and fresh lime soda.",
    itemIds: ["m03", "m15", "m20"],
    price: 680,
    available: true,
  },
]

export const KOT_ORDERS: KotOrder[] = [
  {
    id: "kot001",
    kotNumber: "KOT-0231",
    table: "Room 101",
    origin: "room-service",
    items: [
      { id: "i1", menuItemId: "m06", name: "Dal Bhat Set", price: 420, quantity: 2 },
      { id: "i2", menuItemId: "m17", name: "Masala Tea", price: 60, quantity: 2 },
    ],
    status: "pending",
    placedAt: minutesAgo(4),
    waiterName: "Rohan Maharjan",
  },
  {
    id: "kot002",
    kotNumber: "KOT-0230",
    table: "Table 5",
    origin: "restaurant",
    items: [
      { id: "i3", menuItemId: "m02", name: "Chicken Momo", price: 260, quantity: 1 },
      { id: "i4", menuItemId: "m11", name: "Chicken Chowmein", price: 300, quantity: 1 },
    ],
    status: "pending",
    placedAt: minutesAgo(7),
    waiterName: "Anita Rai",
  },
  {
    id: "kot003",
    kotNumber: "KOT-0229",
    table: "Table 2",
    origin: "restaurant",
    items: [
      { id: "i5", menuItemId: "m03", name: "Buff Sekuwa", price: 380, quantity: 2 },
      { id: "i6", menuItemId: "m20", name: "Fresh Lime Soda", price: 120, quantity: 2 },
    ],
    status: "preparing",
    placedAt: minutesAgo(14),
    waiterName: "Rohan Maharjan",
    notes: "Less spicy",
  },
  {
    id: "kot004",
    kotNumber: "KOT-0228",
    table: "Room 203",
    origin: "room-service",
    items: [
      { id: "i7", menuItemId: "m07", name: "Chicken Curry Set", price: 520, quantity: 3 },
    ],
    status: "preparing",
    placedAt: minutesAgo(19),
    waiterName: "Anita Rai",
  },
  {
    id: "kot005",
    kotNumber: "KOT-0227",
    table: "Table 8",
    origin: "restaurant",
    items: [
      { id: "i8", menuItemId: "m01", name: "Veg Momo", price: 220, quantity: 2 },
      { id: "i9", menuItemId: "m09", name: "Veg Thukpa", price: 280, quantity: 1 },
      { id: "i10", menuItemId: "m19", name: "Sweet Lassi", price: 150, quantity: 2 },
    ],
    status: "ready",
    placedAt: minutesAgo(26),
    waiterName: "Rohan Maharjan",
  },
  {
    id: "kot006",
    kotNumber: "KOT-0226",
    table: "Table 1",
    origin: "restaurant",
    items: [
      { id: "i11", menuItemId: "m13", name: "Newari Khaja Set", price: 450, quantity: 2 },
    ],
    status: "ready",
    placedAt: minutesAgo(31),
    waiterName: "Anita Rai",
  },
  {
    id: "kot007",
    kotNumber: "KOT-0225",
    table: "Room 206",
    origin: "room-service",
    items: [
      { id: "i12", menuItemId: "m08", name: "Mutton Curry Set", price: 620, quantity: 2 },
      { id: "i13", menuItemId: "m21", name: "Gulab Jamun", price: 140, quantity: 4 },
    ],
    status: "served",
    placedAt: minutesAgo(58),
    waiterName: "Rohan Maharjan",
  },
  {
    id: "kot008",
    kotNumber: "KOT-0224",
    table: "Table 4",
    origin: "restaurant",
    items: [
      { id: "i14", menuItemId: "m04", name: "Chicken Chilli", price: 340, quantity: 1 },
      { id: "i15", menuItemId: "m18", name: "Black Coffee", price: 90, quantity: 2 },
    ],
    status: "served",
    placedAt: minutesAgo(72),
    waiterName: "Anita Rai",
  },
  {
    id: "kot009",
    kotNumber: "KOT-0223",
    table: "Table 6",
    origin: "restaurant",
    items: [
      { id: "i16", menuItemId: "m14", name: "Gundruk Soup", price: 180, quantity: 1 },
      { id: "i17", menuItemId: "m15", name: "Aloo Tama", price: 260, quantity: 1 },
    ],
    status: "pending",
    placedAt: minutesAgo(2),
    waiterName: "Rohan Maharjan",
  },
  {
    id: "kot010",
    kotNumber: "KOT-0222",
    table: "Table 3",
    origin: "restaurant",
    items: [
      { id: "i18", menuItemId: "m12", name: "Veg Chowmein", price: 260, quantity: 2 },
      { id: "i19", menuItemId: "m22", name: "Kheer", price: 160, quantity: 2 },
    ],
    status: "preparing",
    placedAt: minutesAgo(11),
    waiterName: "Anita Rai",
  },
]

/**
 * Mutates the shared array in place so a fresh page mount (e.g. navigating
 * back from the standalone new-order page) picks up the new ticket. Every
 * other list on this prototype is page-local `useState`, so this is the one
 * exception needed to make a page-to-page create flow actually show up.
 */
export function addKotOrder(order: KotOrder) {
  KOT_ORDERS.unshift(order)
}

export function getRoomStats() {
  const total = ROOMS.length
  const occupied = ROOMS.filter((r) => r.status === "occupied").length
  const occupancyRate = Math.round((occupied / total) * 100)
  return { total, occupied, occupancyRate }
}

export function getTodayBookings() {
  const today = new Date().toDateString()
  return BOOKINGS.filter((b) => new Date(b.checkIn).toDateString() === today)
}

export function getTodayCheckIns() {
  const today = new Date().toDateString()
  return BOOKINGS.filter(
    (b) =>
      new Date(b.checkIn).toDateString() === today &&
      (b.status === "confirmed" || b.status === "checked-in")
  )
}

export function getTodayCheckOuts() {
  const today = new Date().toDateString()
  return BOOKINGS.filter(
    (b) =>
      new Date(b.checkOut).toDateString() === today && b.status === "checked-in"
  )
}

export function getActiveKotOrders() {
  return KOT_ORDERS.filter((o) => o.status !== "served")
}

export function getTodayRevenue() {
  const today = new Date().toDateString()
  const roomRevenue = BOOKINGS.filter(
    (b) =>
      new Date(b.checkIn).toDateString() === today && b.status !== "cancelled"
  ).reduce((sum, b) => sum + b.totalAmount, 0)
  const kotRevenue = KOT_ORDERS.reduce((sum, o) => sum + orderTotal(o.items), 0)
  return roomRevenue + kotRevenue
}

export function getBookingsByChannel() {
  return BOOKING_CHANNELS.map((channel) => {
    const bookings = BOOKINGS.filter(
      (b) => b.channel === channel.value && b.status !== "cancelled"
    )
    return {
      ...channel,
      bookingCount: bookings.length,
      revenue: bookings.reduce((sum, b) => sum + b.totalAmount, 0),
    }
  })
}

export const MENU_CATEGORIES = Array.from(
  new Set(MENU_ITEMS.map((m) => m.category))
)

export function getBookingsTrend(days = 14) {
  const result: { date: string; bookings: number; revenue: number }[] = []
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    d.setHours(0, 0, 0, 0)
    const key = d.toDateString()
    const dayBookings = BOOKINGS.filter(
      (b) =>
        new Date(b.checkIn).toDateString() === key && b.status !== "cancelled"
    )
    result.push({
      date: d.toISOString(),
      bookings: dayBookings.length,
      revenue: dayBookings.reduce((sum, b) => sum + b.totalAmount, 0),
    })
  }
  return result
}

export interface Guest {
  id: string
  name: string
  phone: string
  email?: string
  notes?: string
  visits: number
  lastStay: string
  totalSpend: number
}

export function getGuests(): Guest[] {
  const byGuest = new Map<string, Guest>()
  for (const booking of BOOKINGS) {
    if (booking.status === "cancelled") continue
    const key = `${booking.guestName}__${booking.guestPhone}`
    const existing = byGuest.get(key)
    if (existing) {
      existing.visits += 1
      existing.totalSpend += booking.totalAmount
      if (new Date(booking.checkIn) > new Date(existing.lastStay)) {
        existing.lastStay = booking.checkIn
      }
    } else {
      byGuest.set(key, {
        id: key,
        name: booking.guestName,
        phone: booking.guestPhone,
        visits: 1,
        lastStay: booking.checkIn,
        totalSpend: booking.totalAmount,
      })
    }
  }
  return Array.from(byGuest.values()).sort(
    (a, b) => +new Date(b.lastStay) - +new Date(a.lastStay)
  )
}

export function getRoomStatusBreakdown() {
  const statuses: Room["status"][] = [
    "available",
    "occupied",
    "cleaning",
    "maintenance",
  ]
  return statuses.map((status) => ({
    status,
    count: ROOMS.filter((r) => r.status === status).length,
  }))
}
