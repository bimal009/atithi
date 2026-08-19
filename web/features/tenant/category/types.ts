export type SubMenuRef = {
  id: string;
  name: string;
};

export type Category = {
  id: string;
  hotelId: string;
  name: string;
  subMenus: SubMenuRef[];
  createdAt: string;
  updatedAt: string;
};

export type CreateCategoryInput = {
  name: string;
  subMenuIds: string[];
};

export type UpdateCategoryInput = Partial<CreateCategoryInput>;
