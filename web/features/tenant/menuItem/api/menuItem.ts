import { axiosInstance } from "@/lib/axios";
import { ApiResponse } from "@/lib/types/responses";

import {
  CreateMenuItemInput,
  Dish,
  ListMenuItemsResponse,
  MenuItem,
  UpdateMenuItemInput,
} from "../types";

export const searchDishes = async (
  search: string,
): Promise<ApiResponse<Dish[]>> => {
  const { data } = await axiosInstance.get<ApiResponse<Dish[]>>("/dishes", {
    params: { search },
  });
  return data;
};

export const listMenuItems = async (
  tenant: string,
  params?: {
    search?: string;
    categoryId?: string;
    foodType?: string;
    page?: number;
    limit?: number;
  },
): Promise<ApiResponse<ListMenuItemsResponse>> => {
  const { data } = await axiosInstance.get<ApiResponse<ListMenuItemsResponse>>(
    `/hotels/slug/${tenant}/menu-items`,
    {
      params: {
        search: params?.search || undefined,
        categoryId: params?.categoryId || undefined,
        foodType: params?.foodType || undefined,
        page: params?.page ?? 1,
        limit: params?.limit ?? 12,
      },
    },
  );
  return data;
};

export const createMenuItem = async (
  tenant: string,
  input: CreateMenuItemInput,
): Promise<ApiResponse<MenuItem>> => {
  const { data } = await axiosInstance.post<ApiResponse<MenuItem>>(
    `/hotels/slug/${tenant}/menu-items`,
    input,
  );
  return data;
};

export const updateMenuItem = async (
  tenant: string,
  menuItemId: string,
  input: UpdateMenuItemInput,
): Promise<ApiResponse<MenuItem>> => {
  const { data } = await axiosInstance.patch<ApiResponse<MenuItem>>(
    `/hotels/slug/${tenant}/menu-items/${menuItemId}`,
    input,
  );
  return data;
};

export const removeMenuItem = async (
  tenant: string,
  menuItemId: string,
): Promise<ApiResponse<null>> => {
  const { data } = await axiosInstance.delete<ApiResponse<null>>(
    `/hotels/slug/${tenant}/menu-items/${menuItemId}`,
  );
  return data;
};
