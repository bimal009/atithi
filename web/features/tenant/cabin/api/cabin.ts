import { axiosInstance } from "@/lib/axios";
import { ApiResponse } from "@/lib/types/responses";

import { Cabin, CreateCabinInput, ListCabinsResponse, UpdateCabinInput } from "../types";

export const listCabins = async (
  tenant: string,
  params?: { search?: string; status?: string },
): Promise<ApiResponse<ListCabinsResponse>> => {
  const { data } = await axiosInstance.get<ApiResponse<ListCabinsResponse>>(
    `/hotels/slug/${tenant}/cabins`,
    { params: { search: params?.search || undefined, status: params?.status || undefined, limit: 100 } },
  );
  return data;
};

export const createCabin = async (
  tenant: string,
  input: CreateCabinInput,
): Promise<ApiResponse<Cabin>> => {
  const { data } = await axiosInstance.post<ApiResponse<Cabin>>(
    `/hotels/slug/${tenant}/cabins`,
    input,
  );
  return data;
};

export const updateCabin = async (
  tenant: string,
  cabinId: string,
  input: UpdateCabinInput,
): Promise<ApiResponse<Cabin>> => {
  const { data } = await axiosInstance.patch<ApiResponse<Cabin>>(
    `/hotels/slug/${tenant}/cabins/${cabinId}`,
    input,
  );
  return data;
};

export const updateCabinStatus = async (
  tenant: string,
  cabinId: string,
  status: string,
): Promise<ApiResponse<Cabin>> => {
  const { data } = await axiosInstance.patch<ApiResponse<Cabin>>(
    `/hotels/slug/${tenant}/cabins/${cabinId}/status`,
    { status },
  );
  return data;
};

export const removeCabin = async (
  tenant: string,
  cabinId: string,
): Promise<ApiResponse<null>> => {
  const { data } = await axiosInstance.delete<ApiResponse<null>>(
    `/hotels/slug/${tenant}/cabins/${cabinId}`,
  );
  return data;
};
