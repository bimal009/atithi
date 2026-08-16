"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { getErrorMessage } from "@/lib/axios";

import {
  createRole,
  deleteRole,
  getRole,
  listAssignableRoles,
  listRoles,
  updateRole,
} from "../api/role";
import type { CreateRoleInput, UpdateRoleInput } from "../types";

export const roleKeys = {
  all: (tenant: string) => ["roles", tenant] as const,
  assignable: (tenant: string) => [...roleKeys.all(tenant), "assignable"] as const,
  detail: (tenant: string, roleId: string) =>
    [...roleKeys.all(tenant), "detail", roleId] as const,
};

export const useRolesQuery = (tenant: string) =>
  useQuery({
    queryKey: roleKeys.all(tenant),
    queryFn: async () => (await listRoles(tenant)).data,
  });

export const useAssignableRolesQuery = (tenant: string) =>
  useQuery({
    queryKey: roleKeys.assignable(tenant),
    queryFn: async () => (await listAssignableRoles(tenant)).data,
  });

export const useRoleQuery = (tenant: string, roleId: string | undefined, enabled: boolean) =>
  useQuery({
    queryKey: roleKeys.detail(tenant, roleId ?? ""),
    queryFn: async () => (await getRole(tenant, roleId!)).data,
    enabled: enabled && !!roleId,
  });

export const useCreateRole = (tenant: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateRoleInput) => createRole(tenant, input),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: roleKeys.all(tenant) });
      toast.success(`${response.data.name} role created`);
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, "Could not create the role"));
    },
  });
};

export const useUpdateRole = (tenant: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateRoleInput }) =>
      updateRole(tenant, id, input),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: roleKeys.all(tenant) });
      toast.success(`${response.data.name} updated`);
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, "Could not update the role"));
    },
  });
};

export const useDeleteRole = (tenant: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteRole(tenant, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: roleKeys.all(tenant) });
      toast.success("Role removed");
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, "Could not remove the role"));
    },
  });
};
