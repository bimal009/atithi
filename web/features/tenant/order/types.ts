export type OrderStatus = "pending" | "preparing" | "ready" | "served" | "cancelled";

export type OrderItemAddOn = {
  id: string;
  name: string;
  price: number;
  quantity: number;
};

export type OrderItem = {
  menuItemId: string;
  name: string;
  price: number;
  quantity: number;
  addOns: OrderItemAddOn[];
};

export type Order = {
  id: string;
  hotelId: string;
  tableId?: string;
  tableName?: string;
  roomId?: string;
  roomNumber?: string;
  cabinId?: string;
  cabinName?: string;
  customerId?: string;
  customerName?: string;
  status: OrderStatus;
  totalAmount: number;
  taxPercent: number;
  taxAmount: number;
  serviceChargePercent: number;
  serviceChargeAmount: number;
  grandTotal: number;
  notes?: string;
  createdBy: string;
  createdByName: string;
  createdByImage?: string;
  items: OrderItem[];
  createdAt: string;
  updatedAt: string;
};

export type OrderItemAddOnInput = {
  addOnId: string;
  quantity: number;
};

export type OrderItemInput = {
  menuItemId: string;
  quantity: number;
  addOns?: OrderItemAddOnInput[];
};

export type CreateOrderInput = {
  tableId?: string;
  roomId?: string;
  cabinId?: string;
  customerId?: string;
  items: OrderItemInput[];
  notes?: string;
};

export type UpdateOrderInput = {
  tableId?: string;
  roomId?: string;
  cabinId?: string;
  customerId?: string;
  items?: OrderItemInput[];
  notes?: string;
};

export type ListOrdersResponse = {
  orders: Order[];
  page: number;
  limit: number;
  total: number;
};
