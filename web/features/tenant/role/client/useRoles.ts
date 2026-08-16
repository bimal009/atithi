"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { getErrorMessage } from "@/lib/axios";

import {
  createRole,
  deleteRole,
  listHotelRoles,
  listPermissions,
  listRoles,
  listSystemRoles,
  updateRole,
} from "../api/role";
import type { CreateRoleInput, UpdateRoleInput } from "../types";

export const roleKeys = {
  all: (tenant: string) => ["roles", tenant] as const,
  system: (tenant: string) => ["roles", tenant, "system"] as const,
  hotel: (tenant: string) => ["roles", tenant, "hotel"] as const,
  permissions: (tenant: string) => ["permissions", tenant] as const,
};

export const useRolesQuery = (tenant: string) =>
  useQuery({
    queryKey: roleKeys.all(tenant),
    queryFn: async () => (await listRoles(tenant)).data,
  });

export const useSystemRolesQuery = (tenant: string) =>
  useQuery({
    queryKey: roleKeys.system(tenant),
    queryFn: async () => (await listSystemRoles(tenant)).data,
  });

export const useHotelRolesQuery = (tenant: string) =>
  useQuery({
    queryKey: roleKeys.hotel(tenant),
    queryFn: async () => (await listHotelRoles(tenant)).data,
  });

export const usePermissionsQuery = (tenant: string) =>
  useQuery({
    queryKey: roleKeys.permissions(tenant),
    queryFn: async () => (await listPermissions(tenant)).data,
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
