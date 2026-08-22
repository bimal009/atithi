export type RoomType = {
  id: string;
  hotelId: string;
  name: string;
  basePrice: number;
  billingTypeId: string;
  pricingLabel?: string;
  capacity: number;
  description?: string;
  amenities: string[];
  restrictions: string[];
  images: string[];
  isTopPick: boolean;
  createdAt: string;
  updatedAt: string;
};

export type CreateRoomTypeInput = {
  name: string;
  basePrice: number;
  billingTypeId: string;
  pricingLabel?: string;
  capacity: number;
  description?: string;
  amenities?: string[];
  restrictions?: string[];
  images?: string[];
  isTopPick?: boolean;
};

export type UpdateRoomTypeInput = Partial<CreateRoomTypeInput>;

export type ListRoomTypesResponse = {
  roomTypes: RoomType[];
  page: number;
  limit: number;
  total: number;
};
