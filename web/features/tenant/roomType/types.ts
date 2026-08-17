import type { PricingUnit } from "@/types";

export type RoomType = {
  id: string;
  hotelId: string;
  name: string;
  basePrice: number;
  pricingUnit: PricingUnit;
  pricingLabel?: string;
  capacity: number;
  description?: string;
  amenities: string[];
  restrictions: string[];
  createdAt: string;
  updatedAt: string;
};

export type CreateRoomTypeInput = {
  name: string;
  basePrice: number;
  pricingUnit?: PricingUnit;
  pricingLabel?: string;
  capacity: number;
  description?: string;
  amenities?: string[];
  restrictions?: string[];
};

export type UpdateRoomTypeInput = Partial<CreateRoomTypeInput>;
