import { axiosInstance } from "@/lib/axios";
import { ApiResponse } from "@/lib/types/responses";

import { HotelWebsite, UpdateHotelWebsiteInput } from "../types";

export const getHotelWebsite = async (tenant: string): Promise<ApiResponse<HotelWebsite>> => {
  const { data } = await axiosInstance.get<ApiResponse<HotelWebsite>>(
    `/hotels/slug/${tenant}/website`,
  );
  return data;
};

export const updateHotelWebsite = async (
  tenant: string,
  input: UpdateHotelWebsiteInput,
): Promise<ApiResponse<HotelWebsite>> => {
  const { data } = await axiosInstance.patch<ApiResponse<HotelWebsite>>(
    `/hotels/slug/${tenant}/website`,
    input,
  );
  return data;
};
