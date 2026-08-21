import { axiosInstance } from "@/lib/axios";
import { ApiResponse } from "@/lib/types/responses";

import {
  AddMemberInput,
  ListMembersResponse,
  Member,
  UpdateMemberInput,
} from "../types";

export const listMembers = async (
  tenant: string,
  params?: { roleId?: string; search?: string; page?: number; limit?: number },
): Promise<ApiResponse<ListMembersResponse>> => {
  const { data } = await axiosInstance.get<ApiResponse<ListMembersResponse>>(
    `/hotels/slug/${tenant}/members`,
    {
      params: {
        roleId: params?.roleId || undefined,
        search: params?.search || undefined,
        page: params?.page ?? 1,
        limit: params?.limit ?? 10,
      },
    },
  );
  return data;
};

export const addMember = async (
  tenant: string,
  input: AddMemberInput,
): Promise<ApiResponse<Member>> => {
  const { data } = await axiosInstance.post<ApiResponse<Member>>(
    `/hotels/slug/${tenant}/members`,
    input,
  );
  return data;
};

export const updateMember = async (
  tenant: string,
  memberId: string,
  input: UpdateMemberInput,
): Promise<ApiResponse<Member>> => {
  const { data } = await axiosInstance.patch<ApiResponse<Member>>(
    `/hotels/slug/${tenant}/members/${memberId}`,
    input,
  );
  return data;
};

export const removeMember = async (
  tenant: string,
  memberId: string,
): Promise<ApiResponse<null>> => {
  const { data } = await axiosInstance.delete<ApiResponse<null>>(
    `/hotels/slug/${tenant}/members/${memberId}`,
  );
  return data;
};
