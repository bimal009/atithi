import { axiosInstance } from "@/lib/axios";
import { ApiResponse } from "@/lib/types/responses";

import { BillingType, CreateBillingTypeInput, UpdateBillingTypeInput } from "../types";

export const listBillingTypes = async (
  tenant: string,
): Promise<ApiResponse<BillingType[]>> => {
  const { data } = await axiosInstance.get<ApiResponse<BillingType[]>>(
    `/hotels/slug/${tenant}/billing-types`,
  );
  return data;
};

export const createBillingType = async (
  tenant: string,
  input: CreateBillingTypeInput,
): Promise<ApiResponse<BillingType>> => {
  const { data } = await axiosInstance.post<ApiResponse<BillingType>>(
    `/hotels/slug/${tenant}/billing-types`,
    input,
  );
  return data;
};

export const updateBillingType = async (
  tenant: string,
  billingTypeId: string,
  input: UpdateBillingTypeInput,
): Promise<ApiResponse<BillingType>> => {
  const { data } = await axiosInstance.patch<ApiResponse<BillingType>>(
    `/hotels/slug/${tenant}/billing-types/${billingTypeId}`,
    input,
  );
  return data;
};

export const removeBillingType = async (
  tenant: string,
  billingTypeId: string,
): Promise<ApiResponse<null>> => {
  const { data } = await axiosInstance.delete<ApiResponse<null>>(
    `/hotels/slug/${tenant}/billing-types/${billingTypeId}`,
  );
  return data;
};
