import { axiosInstance } from "@/lib/axios";
import { ApiResponse } from "@/lib/types/responses";

import { ListRolesResponse } from "../types";

export const listRoles = async (
  tenant: string,
): Promise<ApiResponse<ListRolesResponse>> => {
  const { data } = await axiosInstance.get<ApiResponse<ListRolesResponse>>(
    `/hotels/slug/${tenant}/roles`,
  );
  return data;
};
