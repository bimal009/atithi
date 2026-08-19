export type MenuSetItemRef = {
  id: string;
  name: string;
  price: number;
  quantity: number;
};

export type MenuSet = {
  id: string;
  hotelId: string;
  name: string;
  description?: string;
  price: number;
  available: boolean;
  items: MenuSetItemRef[];
  createdAt: string;
  updatedAt: string;
};

export type MenuSetItemInput = {
  menuItemId: string;
  quantity: number;
};

export type CreateMenuSetInput = {
  name: string;
  description?: string;
  price: number;
  available?: boolean;
  items: MenuSetItemInput[];
};

export type UpdateMenuSetInput = Partial<Omit<CreateMenuSetInput, "items">> & {
  items?: MenuSetItemInput[];
};

export type ListMenuSetsResponse = {
  menuSets: MenuSet[];
  page: number;
  limit: number;
  total: number;
};
