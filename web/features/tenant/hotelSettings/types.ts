export type HotelSettings = {
  hotelId: string;
  currency: string;
  taxPercent: number;
  serviceChargePercent: number;
  mapUrl?: string;
  aboutUs?: string;
  amenities: string[];
  openingTime?: string;
  closingTime?: string;
  openDays: string[];
  whatsappNumber?: string;
  createdAt: string;
  updatedAt: string;
};

export type UpdateHotelSettingsInput = {
  currency?: string;
  taxPercent?: number;
  serviceChargePercent?: number;
  mapUrl?: string;
  aboutUs?: string;
  amenities?: string[];
  openingTime?: string;
  closingTime?: string;
  openDays?: string[];
  whatsappNumber?: string;
};
