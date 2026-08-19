export type AddOn = {
  id: string;
  hotelId: string;
  dishId: string;
  name: string;
  imageUrl?: string;
  price: number;
  available: boolean;
  createdAt: string;
  updatedAt: string;
};

export type CreateAddOnInput = {
  name: string;
  imageUrl?: string;
  price: number;
  available?: boolean;
};

export type UpdateAddOnInput = Partial<Omit<CreateAddOnInput, "name" | "imageUrl">>;

export type ListAddOnsResponse = {
  addOns: AddOn[];
  page: number;
  limit: number;
  total: number;
};
