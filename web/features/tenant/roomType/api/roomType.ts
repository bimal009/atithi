import { axiosInstance } from "@/lib/axios";
import { ApiResponse } from "@/lib/types/responses";

import { CreateRoomTypeInput, RoomType, UpdateRoomTypeInput } from "../types";

export const listRoomTypes = async (
  tenant: string,
): Promise<ApiResponse<RoomType[]>> => {
  const { data } = await axiosInstance.get<ApiResponse<RoomType[]>>(
    `/hotels/slug/${tenant}/room-types`,
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
