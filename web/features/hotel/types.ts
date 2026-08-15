export type Hotel = {
  id: string;
  name: string;
  slug: string;
  description?: string;
  logoUrl?: string;
  address: string;
  city?: string;
  phoneNumber: string;
  email?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

export type CreateHotelInput = {
  name: string;
  slug: string;
  address: string;
  phoneNumber: string;
  description?: string;
  logoUrl?: string;
  city?: string;
  email?: string;
};

export type UpdateHotelInput = Partial<CreateHotelInput> & {
  isActive?: boolean;
};
