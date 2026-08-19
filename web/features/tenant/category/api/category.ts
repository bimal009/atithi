import { axiosInstance } from "@/lib/axios";
import { ApiResponse } from "@/lib/types/responses";

import {
  Category,
  CreateCategoryInput,
  ListCategoriesResponse,
  UpdateCategoryInput,
} from "../types";

export const listCategories = async (
  tenant: string,
  params?: { search?: string; page?: number; limit?: number },
): Promise<ApiResponse<ListCategoriesResponse>> => {
  const { data } = await axiosInstance.get<ApiResponse<ListCategoriesResponse>>(
    `/hotels/slug/${tenant}/categories`,
    {
      params: {
        search: params?.search || undefined,
        page: params?.page ?? 1,
        limit: params?.limit ?? 20,
      },
    },
  );
  return data;
};

export const createCategory = async (
  tenant: string,
  input: CreateCategoryInput,
): Promise<ApiResponse<Category>> => {
  const { data } = await axiosInstance.post<ApiResponse<Category>>(
    `/hotels/slug/${tenant}/categories`,
    input,
  );
  return data;
};

export const updateCategory = async (
  tenant: string,
  categoryId: string,
  input: UpdateCategoryInput,
): Promise<ApiResponse<Category>> => {
  const { data } = await axiosInstance.patch<ApiResponse<Category>>(
    `/hotels/slug/${tenant}/categories/${categoryId}`,
    input,
  );
  return data;
};

export const removeCategory = async (
  tenant: string,
  categoryId: string,
): Promise<ApiResponse<null>> => {
  const { data } = await axiosInstance.delete<ApiResponse<null>>(
    `/hotels/slug/${tenant}/categories/${categoryId}`,
  );
  return data;
};
