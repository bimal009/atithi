import type { FoodType } from "@/types";

export type Dish = {
  id: string;
  name: string;
  imageUrl?: string;
};

export type MenuItem = {
  id: string;
  hotelId: string;
  dishId: string;
  name: string;
  imageUrl?: string;
  category: string;
  foodType: FoodType;
  price: number;
  discount?: number;
  description?: string;
  ingredients?: string;
  available: boolean;
  createdAt: string;
  updatedAt: string;
};

export type CreateMenuItemInput = {
  name: string;
  imageUrl?: string;
  category: string;
  foodType: FoodType;
  price: number;
  discount?: number;
  description?: string;
  ingredients?: string;
  available?: boolean;
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
