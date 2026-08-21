import { axiosInstance } from "@/lib/axios";
import { ApiResponse } from "@/lib/types/responses";

import {
  CreateRoomTypeInput,
  ListRoomTypesResponse,
  RoomType,
  UpdateRoomTypeInput,
} from "../types";

export const listRoomTypes = async (
  tenant: string,
  params?: { search?: string; page?: number; limit?: number },
): Promise<ApiResponse<ListRoomTypesResponse>> => {
  const { data } = await axiosInstance.get<ApiResponse<ListRoomTypesResponse>>(
    `/hotels/slug/${tenant}/room-types`,
    {
      params: {
        search: params?.search || undefined,
        page: params?.page ?? 1,
        limit: params?.limit ?? 10,
      },
    },
  );
  return data;
};

export const createRoomType = async (
  tenant: string,
  input: CreateRoomTypeInput,
): Promise<ApiResponse<RoomType>> => {
  const { data } = await axiosInstance.post<ApiResponse<RoomType>>(
    `/hotels/slug/${tenant}/room-types`,
    input,
  );
  return data;
};

export const updateRoomType = async (
  tenant: string,
  roomTypeId: string,
  input: UpdateRoomTypeInput,
): Promise<ApiResponse<RoomType>> => {
  const { data } = await axiosInstance.patch<ApiResponse<RoomType>>(
    `/hotels/slug/${tenant}/room-types/${roomTypeId}`,
    input,
  );
  return data;
};

export const removeRoomType = async (
  tenant: string,
  roomTypeId: string,
): Promise<ApiResponse<null>> => {
  const { data } = await axiosInstance.delete<ApiResponse<null>>(
    `/hotels/slug/${tenant}/room-types/${roomTypeId}`,
  );
  return data;
};
