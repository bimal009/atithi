import { axiosInstance } from "@/lib/axios";
import { ApiResponse } from "@/lib/types/responses";

import {
  CreateReservationInput,
  ListReservationsResponse,
  Reservation,
  UpdateReservationInput,
} from "../types";

export const listReservations = async (
  tenant: string,
  params?: { search?: string; status?: string; page?: number; limit?: number },
): Promise<ApiResponse<ListReservationsResponse>> => {
  const { data } = await axiosInstance.get<ApiResponse<ListReservationsResponse>>(
    `/hotels/slug/${tenant}/reservations`,
    {
      params: {
        search: params?.search || undefined,
        status: params?.status || undefined,
        page: params?.page ?? 1,
        limit: params?.limit ?? 10,
      },
    },
  );
  return data;
};

export const createReservation = async (
  tenant: string,
  input: CreateReservationInput,
): Promise<ApiResponse<Reservation>> => {
  const { data } = await axiosInstance.post<ApiResponse<Reservation>>(
    `/hotels/slug/${tenant}/reservations`,
    input,
  );
  return data;
};

export const updateReservation = async (
  tenant: string,
  reservationId: string,
  input: UpdateReservationInput,
): Promise<ApiResponse<Reservation>> => {
  const { data } = await axiosInstance.patch<ApiResponse<Reservation>>(
    `/hotels/slug/${tenant}/reservations/${reservationId}`,
    input,
  );
  return data;
};

export const updateReservationStatus = async (
  tenant: string,
  reservationId: string,
  status: string,
): Promise<ApiResponse<Reservation>> => {
  const { data } = await axiosInstance.patch<ApiResponse<Reservation>>(
    `/hotels/slug/${tenant}/reservations/${reservationId}/status`,
    { status },
  );
  return data;
};

export const removeReservation = async (
  tenant: string,
  reservationId: string,
): Promise<ApiResponse<null>> => {
  const { data } = await axiosInstance.delete<ApiResponse<null>>(
    `/hotels/slug/${tenant}/reservations/${reservationId}`,
  );
  return data;
};
