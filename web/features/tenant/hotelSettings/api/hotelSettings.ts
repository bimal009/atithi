import { axiosInstance } from "@/lib/axios";
import { ApiResponse } from "@/lib/types/responses";

import { HotelSettings, UpdateHotelSettingsInput } from "../types";

export const getHotelSettings = async (
  tenant: string,
): Promise<ApiResponse<HotelSettings>> => {
  const { data } = await axiosInstance.get<ApiResponse<HotelSettings>>(
    `/hotels/slug/${tenant}/settings`,
  );
  return data;
};

export const updateHotelSettings = async (
  tenant: string,
  input: UpdateHotelSettingsInput,
): Promise<ApiResponse<HotelSettings>> => {
  const { data } = await axiosInstance.patch<ApiResponse<HotelSettings>>(
    `/hotels/slug/${tenant}/settings`,
    input,
  );
  return data;
};
