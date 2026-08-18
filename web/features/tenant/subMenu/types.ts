export type SubMenu = {
  id: string;
  hotelId: string;
  name: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
};

export type CreateSubMenuInput = {
  name: string;
  description?: string;
};

export type UpdateSubMenuInput = Partial<CreateSubMenuInput>;
