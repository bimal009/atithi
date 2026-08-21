"use client";

import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { toast } from "sonner";

import { roleKeys } from "@/features/tenant/role/client/useRoles";
import { getErrorMessage } from "@/lib/axios";

import { addMember, listMembers, removeMember, updateMember } from "../api/member";
import type { AddMemberInput, UpdateMemberInput } from "../types";

export const memberKeys = {
  all: (tenant: string) => ["members", tenant] as const,
};

export const useMembersQuery = (
  tenant: string,
  params?: { roleId?: string; search?: string; page?: number; limit?: number },
) =>
  useQuery({
    queryKey: [
      ...memberKeys.all(tenant),
      params?.roleId ?? "all",
      params?.search ?? "",
      params?.page ?? 1,
      params?.limit ?? 10,
    ],
    queryFn: async () =>
      (
        await listMembers(tenant, {
          roleId: params?.roleId === "all" ? undefined : params?.roleId,
          search: params?.search,
          page: params?.page,
          limit: params?.limit,
        })
      ).data,
    placeholderData: keepPreviousData,
  });

export const useAddMember = (tenant: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: AddMemberInput) => addMember(tenant, input),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: memberKeys.all(tenant) });
      queryClient.invalidateQueries({ queryKey: roleKeys.all(tenant) });
      toast.success(response.message);
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, "Could not add the staff member"));
    },
  });
};

export const useUpdateMember = (tenant: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateMemberInput }) =>
      updateMember(tenant, id, input),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: memberKeys.all(tenant) });
      queryClient.invalidateQueries({ queryKey: roleKeys.all(tenant) });
      toast.success(response.message);
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, "Could not update the staff member"));
    },
  });
};

export const useRemoveMember = (tenant: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => removeMember(tenant, id),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: memberKeys.all(tenant) });
      queryClient.invalidateQueries({ queryKey: roleKeys.all(tenant) });
      toast.success(response.message);
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, "Could not remove the staff member"));
    },
  });
};
