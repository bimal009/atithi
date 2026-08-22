export type GalleryImage = {
  id: string;
  hotelId: string;
  url: string;
  section: string;
  position: number;
  createdAt: string;
};

export type CreateGalleryImageInput = {
  url: string;
  section?: string;
};

export type ListGalleryImagesResponse = {
  images: GalleryImage[];
};
