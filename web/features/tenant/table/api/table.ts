import { axiosInstance } from "@/lib/axios";
import { ApiResponse } from "@/lib/types/responses";

import { CreateTableInput, DiningTable, ListTablesResponse, UpdateTableInput } from "../types";

export const listTables = async (
  tenant: string,
  params?: { search?: string; status?: string; page?: number; limit?: number },
): Promise<ApiResponse<ListTablesResponse>> => {
  const { data } = await axiosInstance.get<ApiResponse<ListTablesResponse>>(
    `/hotels/slug/${tenant}/tables`,
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

export const createTable = async (
  tenant: string,
  input: CreateTableInput,
): Promise<ApiResponse<DiningTable>> => {
  const { data } = await axiosInstance.post<ApiResponse<DiningTable>>(
    `/hotels/slug/${tenant}/tables`,
    input,
  );
  return data;
};

export const updateTable = async (
  tenant: string,
  tableId: string,
  input: UpdateTableInput,
): Promise<ApiResponse<DiningTable>> => {
  const { data } = await axiosInstance.patch<ApiResponse<DiningTable>>(
    `/hotels/slug/${tenant}/tables/${tableId}`,
    input,
  );
  return data;
};

export const updateTableStatus = async (
  tenant: string,
  tableId: string,
  status: string,
): Promise<ApiResponse<DiningTable>> => {
  const { data } = await axiosInstance.patch<ApiResponse<DiningTable>>(
    `/hotels/slug/${tenant}/tables/${tableId}/status`,
    { status },
  );
  return data;
};

export const removeTable = async (
  tenant: string,
  tableId: string,
): Promise<ApiResponse<null>> => {
  const { data } = await axiosInstance.delete<ApiResponse<null>>(
    `/hotels/slug/${tenant}/tables/${tableId}`,
  );
  return data;
};
