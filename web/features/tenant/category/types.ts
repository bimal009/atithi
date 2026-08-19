export type Category = {
  id: string;
  hotelId: string;
  name: string;
  subMenuId?: string;
  subMenuName?: string;
  createdAt: string;
  updatedAt: string;
};

export type CreateCategoryInput = {
  name: string;
  subMenuId: string;
};

export type UpdateCategoryInput = Partial<CreateCategoryInput>;
