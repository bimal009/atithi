export type GalleryImage = {
  id: string;
  hotelId: string;
  url: string;
  position: number;
  createdAt: string;
};

export type CreateGalleryImageInput = {
  url: string;
};

export type ListGalleryImagesResponse = {
  images: GalleryImage[];
};
