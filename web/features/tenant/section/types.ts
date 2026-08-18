export type Section = {
  id: string;
  hotelId: string;
  name: string;
  createdAt: string;
  updatedAt: string;
};

export type CreateSectionInput = {
  name: string;
};

export type UpdateSectionInput = Partial<CreateSectionInput>;
