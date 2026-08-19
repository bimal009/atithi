import { axiosInstance } from "@/lib/axios";
import { ApiResponse } from "@/lib/types/responses";

import {
  AddOn,
  CreateAddOnInput,
  ListAddOnsResponse,
  UpdateAddOnInput,
} from "../types";

export const listAddOns = async (
  tenant: string,
  params?: { search?: string; page?: number; limit?: number },
): Promise<ApiResponse<ListAddOnsResponse>> => {
  const { data } = await axiosInstance.get<ApiResponse<ListAddOnsResponse>>(
    `/hotels/slug/${tenant}/add-ons`,
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

export const createAddOn = async (
  tenant: string,
  input: CreateAddOnInput,
): Promise<ApiResponse<AddOn>> => {
  const { data } = await axiosInstance.post<ApiResponse<AddOn>>(
    `/hotels/slug/${tenant}/add-ons`,
    input,
  );
  return data;
};

export const updateAddOn = async (
  tenant: string,
  addOnId: string,
  input: UpdateAddOnInput,
): Promise<ApiResponse<AddOn>> => {
  const { data } = await axiosInstance.patch<ApiResponse<AddOn>>(
    `/hotels/slug/${tenant}/add-ons/${addOnId}`,
    input,
  );
  return data;
};

export const removeAddOn = async (
  tenant: string,
  addOnId: string,
): Promise<ApiResponse<null>> => {
  const { data } = await axiosInstance.delete<ApiResponse<null>>(
    `/hotels/slug/${tenant}/add-ons/${addOnId}`,
  );
  return data;
};
