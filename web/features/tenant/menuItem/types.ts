import type { FoodType } from "@/types";

export type Dish = {
  id: string;
  name: string;
  imageUrl?: string;
};

export type AddOnRef = {
  id: string;
  name: string;
  price: number;
};

export type MenuItem = {
  id: string;
  hotelId: string;
  dishId: string;
  name: string;
  imageUrl?: string;
  categoryId: string;
  categoryName: string;
  foodType: FoodType;
  price: number;
  discount?: number;
  description?: string;
  ingredients?: string;
  available: boolean;
  isTopPick: boolean;
  addOns: AddOnRef[];
  createdAt: string;
  updatedAt: string;
};

export type CreateMenuItemInput = {
  name: string;
  imageUrl?: string;
  categoryId: string;
  foodType: FoodType;
  price: number;
  discount?: number;
  description?: string;
  ingredients?: string;
  available?: boolean;
  isTopPick?: boolean;
  addOnIds?: string[];
};

export type UpdateMenuItemInput = Partial<
  Omit<CreateMenuItemInput, "name" | "imageUrl">
>;

export type ListMenuItemsResponse = {
  menuItems: MenuItem[];
  page: number;
  limit: number;
  total: number;
};
