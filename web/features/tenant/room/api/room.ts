import { axiosInstance } from "@/lib/axios";
import { ApiResponse } from "@/lib/types/responses";

import { CreateRoomInput, ListRoomsResponse, Room, UpdateRoomInput } from "../types";

export const listRooms = async (
  tenant: string,
  params?: { search?: string; status?: string; page?: number; limit?: number },
): Promise<ApiResponse<ListRoomsResponse>> => {
  const { data } = await axiosInstance.get<ApiResponse<ListRoomsResponse>>(
    `/hotels/slug/${tenant}/rooms`,
    {
      params: {
        search: params?.search || undefined,
        status: params?.status || undefined,
        page: params?.page ?? 1,
        limit: params?.limit ?? 12,
      },
    },
  );
  return data;
};

export const createRoom = async (
  tenant: string,
  input: CreateRoomInput,
): Promise<ApiResponse<Room>> => {
  const { data } = await axiosInstance.post<ApiResponse<Room>>(
    `/hotels/slug/${tenant}/rooms`,
    input,
  );
  return data;
};

export const updateRoom = async (
  tenant: string,
  roomId: string,
  input: UpdateRoomInput,
): Promise<ApiResponse<Room>> => {
  const { data } = await axiosInstance.patch<ApiResponse<Room>>(
    `/hotels/slug/${tenant}/rooms/${roomId}`,
    input,
  );
  return data;
};

export const updateRoomStatus = async (
  tenant: string,
  roomId: string,
  status: string,
): Promise<ApiResponse<Room>> => {
  const { data } = await axiosInstance.patch<ApiResponse<Room>>(
    `/hotels/slug/${tenant}/rooms/${roomId}/status`,
    { status },
  );
  return data;
};

export const removeRoom = async (
  tenant: string,
  roomId: string,
): Promise<ApiResponse<null>> => {
  const { data } = await axiosInstance.delete<ApiResponse<null>>(
    `/hotels/slug/${tenant}/rooms/${roomId}`,
  );
  return data;
};
