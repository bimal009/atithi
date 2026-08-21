import { axiosInstance } from "@/lib/axios";
import { ApiResponse } from "@/lib/types/responses";

import {
  CreateOrderInput,
  ListOrdersResponse,
  Order,
  UpdateOrderInput,
} from "../types";

export const listOrders = async (
  tenant: string,
  status?: string,
): Promise<ApiResponse<ListOrdersResponse>> => {
  const { data } = await axiosInstance.get<ApiResponse<ListOrdersResponse>>(
    `/hotels/slug/${tenant}/orders`,
    { params: { status: status || undefined } },
  );
  return data;
};

export const createOrder = async (
  tenant: string,
  input: CreateOrderInput,
): Promise<ApiResponse<Order>> => {
  const { data } = await axiosInstance.post<ApiResponse<Order>>(
    `/hotels/slug/${tenant}/orders`,
    input,
  );
  return data;
};

export const updateOrder = async (
  tenant: string,
  orderId: string,
  input: UpdateOrderInput,
): Promise<ApiResponse<Order>> => {
  const { data } = await axiosInstance.patch<ApiResponse<Order>>(
    `/hotels/slug/${tenant}/orders/${orderId}`,
    input,
  );
  return data;
};

export const updateOrderStatus = async (
  tenant: string,
  orderId: string,
  status: string,
): Promise<ApiResponse<Order>> => {
  const { data } = await axiosInstance.patch<ApiResponse<Order>>(
    `/hotels/slug/${tenant}/orders/${orderId}/status`,
    { status },
  );
  return data;
};

export const removeOrder = async (
  tenant: string,
  orderId: string,
): Promise<ApiResponse<null>> => {
  const { data } = await axiosInstance.delete<ApiResponse<null>>(
    `/hotels/slug/${tenant}/orders/${orderId}`,
  );
  return data;
};
