import type { RoomStatus } from "@/types";

export type Cabin = {
  id: string;
  hotelId: string;
  name: string;
  number: string;
  basePrice: number;
  billingTypeId?: string;
  capacity: number;
  description?: string;
  amenities: string[];
  restrictions: string[];
  status: RoomStatus;
  images: string[];
  createdAt: string;
  updatedAt: string;
};

export type CreateCabinInput = {
  name: string;
  number: string;
  basePrice: number;
  billingTypeId: string;
  capacity: number;
  description?: string;
  amenities?: string[];
  restrictions?: string[];
};

export type UpdateCabinInput = Partial<CreateCabinInput>;

export type ListCabinsResponse = {
  cabins: Cabin[];
  page: number;
  limit: number;
  total: number;
};
