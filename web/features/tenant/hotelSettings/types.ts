export type HotelSettings = {
  hotelId: string;
  currency: string;
  taxPercent: number;
  serviceChargePercent: number;
  createdAt: string;
  updatedAt: string;
};

export type UpdateHotelSettingsInput = {
  currency?: string;
  taxPercent?: number;
  serviceChargePercent?: number;
};
