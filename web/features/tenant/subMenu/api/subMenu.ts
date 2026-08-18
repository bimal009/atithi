import { axiosInstance } from "@/lib/axios";
import { ApiResponse } from "@/lib/types/responses";

import { CreateSubMenuInput, SubMenu, UpdateSubMenuInput } from "../types";

export const listSubMenus = async (
  tenant: string,
): Promise<ApiResponse<SubMenu[]>> => {
  const { data } = await axiosInstance.get<ApiResponse<SubMenu[]>>(
    `/hotels/slug/${tenant}/sub-menus`,
  );
  return data;
};

export const createSubMenu = async (
  tenant: string,
  input: CreateSubMenuInput,
): Promise<ApiResponse<SubMenu>> => {
  const { data } = await axiosInstance.post<ApiResponse<SubMenu>>(
    `/hotels/slug/${tenant}/sub-menus`,
    input,
  );
  return data;
};

export const updateSubMenu = async (
  tenant: string,
  subMenuId: string,
  input: UpdateSubMenuInput,
): Promise<ApiResponse<SubMenu>> => {
  const { data } = await axiosInstance.patch<ApiResponse<SubMenu>>(
    `/hotels/slug/${tenant}/sub-menus/${subMenuId}`,
    input,
  );
  return data;
};

export const removeSubMenu = async (
  tenant: string,
  subMenuId: string,
): Promise<ApiResponse<null>> => {
  const { data } = await axiosInstance.delete<ApiResponse<null>>(
    `/hotels/slug/${tenant}/sub-menus/${subMenuId}`,
  );
  return data;
};
