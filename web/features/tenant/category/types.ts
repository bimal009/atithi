export type Category = {
  id: string;
  hotelId: string;
  name: string;
  createdAt: string;
  updatedAt: string;
};

export type CreateCategoryInput = {
  name: string;
};

export type UpdateCategoryInput = Partial<CreateCategoryInput>;
