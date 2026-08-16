import { axiosInstance } from "@/lib/axios";
import { ApiResponse } from "@/lib/types/responses";

import {
  CreateCustomerInput,
  Customer,
  ListCustomersResponse,
  UpdateCustomerInput,
} from "../types";

export const listCustomers = async (
  tenant: string,
  search?: string,
): Promise<ApiResponse<ListCustomersResponse>> => {
  const { data } = await axiosInstance.get<ApiResponse<ListCustomersResponse>>(
    `/hotels/slug/${tenant}/customers`,
    { params: { search: search || undefined } },
  );
  return data;
};

export const createCustomer = async (
  tenant: string,
  input: CreateCustomerInput,
): Promise<ApiResponse<Customer>> => {
  const { data } = await axiosInstance.post<ApiResponse<Customer>>(
    `/hotels/slug/${tenant}/customers`,
    input,
  );
  return data;
};

export const updateCustomer = async (
  tenant: string,
  customerId: string,
  input: UpdateCustomerInput,
): Promise<ApiResponse<Customer>> => {
  const { data } = await axiosInstance.patch<ApiResponse<Customer>>(
    `/hotels/slug/${tenant}/customers/${customerId}`,
    input,
  );
  return data;
};

export const removeCustomer = async (
  tenant: string,
  customerId: string,
): Promise<ApiResponse<null>> => {
  const { data } = await axiosInstance.delete<ApiResponse<null>>(
    `/hotels/slug/${tenant}/customers/${customerId}`,
  );
  return data;
};
