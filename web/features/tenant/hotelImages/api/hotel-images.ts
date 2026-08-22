import { axiosInstance } from "@/lib/axios";
import { ApiResponse } from "@/lib/types/responses";

import {
  CreateHotelImageInput,
  HotelImage,
  HotelImageEntityType,
  ListHotelImagesResponse,
} from "../types";

export const getHotelImages = async (
  tenant: string,
  entityType: HotelImageEntityType,
  entityId?: string,
): Promise<ApiResponse<ListHotelImagesResponse>> => {
  const { data } = await axiosInstance.get<ApiResponse<ListHotelImagesResponse>>(
    `/hotels/slug/${tenant}/images`,
    { params: { type: entityType, entityId } },
  );
  return data;
};

export const createHotelImage = async (
  tenant: string,
  input: CreateHotelImageInput,
): Promise<ApiResponse<HotelImage>> => {
  const { data } = await axiosInstance.post<ApiResponse<HotelImage>>(
    `/hotels/slug/${tenant}/images`,
    input,
  );
  return data;
};

export const deleteHotelImage = async (
  tenant: string,
  imageId: string,
): Promise<ApiResponse<null>> => {
  const { data } = await axiosInstance.delete<ApiResponse<null>>(
    `/hotels/slug/${tenant}/images/${imageId}`,
  );
  return data;
};
