import { axiosInstance } from "@/lib/axios";
import { ApiResponse } from "@/lib/types/responses";

import {
  CreateMenuSetInput,
  ListMenuSetsResponse,
  MenuSet,
  UpdateMenuSetInput,
} from "../types";

export const listMenuSets = async (
  tenant: string,
  params?: { search?: string; page?: number; limit?: number },
): Promise<ApiResponse<ListMenuSetsResponse>> => {
  const { data } = await axiosInstance.get<ApiResponse<ListMenuSetsResponse>>(
    `/hotels/slug/${tenant}/menu-sets`,
    {
      params: {
        search: params?.search || undefined,
        page: params?.page ?? 1,
        limit: params?.limit ?? 12,
      },
    },
  );
  return data;
};

export const createMenuSet = async (
  tenant: string,
  input: CreateMenuSetInput,
): Promise<ApiResponse<MenuSet>> => {
  const { data } = await axiosInstance.post<ApiResponse<MenuSet>>(
    `/hotels/slug/${tenant}/menu-sets`,
    input,
  );
  return data;
};

export const updateMenuSet = async (
  tenant: string,
  menuSetId: string,
  input: UpdateMenuSetInput,
): Promise<ApiResponse<MenuSet>> => {
  const { data } = await axiosInstance.patch<ApiResponse<MenuSet>>(
    `/hotels/slug/${tenant}/menu-sets/${menuSetId}`,
    input,
  );
  return data;
};

export const removeMenuSet = async (
  tenant: string,
  menuSetId: string,
): Promise<ApiResponse<null>> => {
  const { data } = await axiosInstance.delete<ApiResponse<null>>(
    `/hotels/slug/${tenant}/menu-sets/${menuSetId}`,
  );
  return data;
};
