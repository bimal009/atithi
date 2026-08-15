import { axiosInstance } from "@/lib/axios";
import { ApiResponse } from "@/lib/types/responses";

import { CreateHotelInput, Hotel, UpdateHotelInput } from "../types";

export const listHotels = async (): Promise<ApiResponse<Hotel[]>> => {
  const { data } = await axiosInstance.get<ApiResponse<Hotel[]>>("/hotels");
  return data;
};

export const getHotel = async (id: string): Promise<ApiResponse<Hotel>> => {
  const { data } = await axiosInstance.get<ApiResponse<Hotel>>(`/hotels/${id}`);
  return data;
};

export const createHotel = async (
  input: CreateHotelInput,
): Promise<ApiResponse<Hotel>> => {
  const { data } = await axiosInstance.post<ApiResponse<Hotel>>(
    "/hotels",
    input,
  );
  return data;
};

export const updateHotel = async (
  id: string,
  input: UpdateHotelInput,
): Promise<ApiResponse<Hotel>> => {
  const { data } = await axiosInstance.patch<ApiResponse<Hotel>>(
    `/hotels/${id}`,
    input,
  );
  return data;
};

export const deleteHotel = async (id: string): Promise<ApiResponse<null>> => {
  const { data } = await axiosInstance.delete<ApiResponse<null>>(
    `/hotels/${id}`,
  );
  return data;
};
