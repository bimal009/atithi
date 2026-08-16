import { axiosInstance } from "@/lib/axios";
import { ApiResponse } from "@/lib/types/responses";

import {
  CreateRoleInput,
  ListPermissionsResponse,
  ListRolesResponse,
  Role,
  UpdateRoleInput,
} from "../types";

export const listPermissions = async (
  tenant: string,
): Promise<ApiResponse<ListPermissionsResponse>> => {
  const { data } = await axiosInstance.get<ApiResponse<ListPermissionsResponse>>(
    `/hotels/slug/${tenant}/permissions`,
  );
  return data;
};

export const listRoles = async (
  tenant: string,
): Promise<ApiResponse<ListRolesResponse>> => {
  const { data } = await axiosInstance.get<ApiResponse<ListRolesResponse>>(
    `/hotels/slug/${tenant}/roles`,
  );
  return data;
};

export const listSystemRoles = async (
  tenant: string,
): Promise<ApiResponse<ListRolesResponse>> => {
  const { data } = await axiosInstance.get<ApiResponse<ListRolesResponse>>(
    `/hotels/slug/${tenant}/roles/system`,
  );
  return data;
};

export const listHotelRoles = async (
  tenant: string,
): Promise<ApiResponse<ListRolesResponse>> => {
  const { data } = await axiosInstance.get<ApiResponse<ListRolesResponse>>(
    `/hotels/slug/${tenant}/roles/hotel`,
  );
  return data;
};

export const createRole = async (
  tenant: string,
  input: CreateRoleInput,
): Promise<ApiResponse<Role>> => {
  const { data } = await axiosInstance.post<ApiResponse<Role>>(
    `/hotels/slug/${tenant}/roles`,
    input,
  );
  return data;
};

export const updateRole = async (
  tenant: string,
  roleId: string,
  input: UpdateRoleInput,
): Promise<ApiResponse<Role>> => {
  const { data } = await axiosInstance.patch<ApiResponse<Role>>(
    `/hotels/slug/${tenant}/roles/${roleId}`,
    input,
  );
  return data;
};

export const deleteRole = async (
  tenant: string,
  roleId: string,
): Promise<ApiResponse<null>> => {
  const { data } = await axiosInstance.delete<ApiResponse<null>>(
    `/hotels/slug/${tenant}/roles/${roleId}`,
  );
  return data;
};
