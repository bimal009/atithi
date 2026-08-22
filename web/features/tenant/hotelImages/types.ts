export type HotelImageEntityType = "logo" | "cabin" | "room" | "table" | "gallery";

export type HotelImage = {
  id: string;
  hotelId: string;
  entityType: HotelImageEntityType;
  entityId?: string;
  url: string;
  fileId?: string;
  fileSize?: number;
  section?: string;
  position: number;
  createdAt: string;
};

export type CreateHotelImageInput = {
  entityType: HotelImageEntityType;
  entityId?: string;
  url: string;
  fileId?: string;
  fileSize?: number;
  section?: string;
};

export type ListHotelImagesResponse = {
  images: HotelImage[];
};
