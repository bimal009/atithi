import type { PricingUnit, RoomStatus } from "@/types";

export type Cabin = {
  id: string;
  hotelId: string;
  name: string;
  number: string;
  basePrice: number;
  pricingUnit: PricingUnit;
  pricingLabel?: string;
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
  pricingUnit?: PricingUnit;
  pricingLabel?: string;
  capacity: number;
  description?: string;
  amenities?: string[];
  restrictions?: string[];
  images?: string[];
};

export type UpdateCabinInput = Partial<CreateCabinInput>;

export type ListCabinsResponse = {
  cabins: Cabin[];
  page: number;
  limit: number;
  total: number;
};
